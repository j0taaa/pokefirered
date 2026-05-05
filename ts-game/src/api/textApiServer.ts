import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { fileURLToPath } from 'node:url';
import { SessionManager, type Session } from './sessionManager';
import { StateObserver } from './stateObserver';
import type {
  TextApiActionRequest,
  TextApiActionResult,
  TextApiCreateSessionResponse,
  TextApiError,
  TextApiHealthResponse,
  TextApiJsonValue,
  TextApiSaveBlob,
  TextApiSnapshot
} from './textApiTypes';

const MAX_JSON_BODY_BYTES = 1024 * 1024;
const JSON_CONTENT_TYPE = 'application/json; charset=utf-8';
const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 3000;

type HttpMethod = 'GET' | 'POST' | 'DELETE';

interface RouteMatch {
  readonly sessionId: string;
  readonly resource: 'state' | 'actions' | 'save' | 'load' | null;
}

interface ParsedRequestUrl {
  readonly pathname: string;
  readonly searchParams: URLSearchParams;
}

export interface TextApiServerOptions {
  readonly sessionManager?: SessionManager;
}

class HttpError extends Error {
  constructor(readonly status: number, message: string, readonly code: string) {
    super(message);
  }
}

const textApiError = (code: string, message: string, details?: TextApiJsonValue): { error: TextApiError } => ({
  error: details === undefined ? { code, message } : { code, message, details }
});

const writeJson = (res: ServerResponse, status: number, body: unknown, headers: Record<string, string> = {}): void => {
  res.writeHead(status, { 'Content-Type': JSON_CONTENT_TYPE, ...headers });
  res.end(JSON.stringify(body));
};

const writeNoContent = (res: ServerResponse): void => {
  res.writeHead(204);
  res.end();
};

const writeError = (res: ServerResponse, status: number, code: string, message: string, headers: Record<string, string> = {}): void => {
  writeJson(res, status, textApiError(code, message), headers);
};

const parseUrl = (req: IncomingMessage): ParsedRequestUrl => {
  const url = new URL(req.url ?? '/', 'http://127.0.0.1');
  return { pathname: url.pathname, searchParams: url.searchParams };
};

const parseSessionRoute = (pathname: string): RouteMatch | null => {
  const parts = pathname.split('/').filter(Boolean).map(decodeURIComponent);
  if (parts[0] !== 'sessions') {
    return null;
  }
  if (parts.length === 2) {
    return { sessionId: parts[1], resource: null };
  }
  if (parts.length === 3 && (parts[2] === 'state' || parts[2] === 'actions' || parts[2] === 'save' || parts[2] === 'load')) {
    return { sessionId: parts[1], resource: parts[2] };
  }
  return null;
};

const readJsonBody = async (req: IncomingMessage): Promise<unknown> => {
  let received = 0;
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    received += buffer.byteLength;
    if (received > MAX_JSON_BODY_BYTES) {
      throw new HttpError(413, 'Request body exceeds the 1MB limit.', 'payload_too_large');
    }
    chunks.push(buffer);
  }

  const rawBody = Buffer.concat(chunks).toString('utf8');
  if (rawBody.trim().length === 0) {
    throw new HttpError(400, 'Expected a JSON request body.', 'bad_json');
  }

  try {
    return JSON.parse(rawBody) as unknown;
  } catch {
    throw new HttpError(400, 'Request body must be valid JSON.', 'bad_json');
  }
};

const isActionRequest = (value: unknown): value is TextApiActionRequest => {
  const body = value as Partial<TextApiActionRequest>;
  return !!body && typeof body === 'object' && typeof body.version === 'number' && typeof body.actionId === 'string';
};

const isSaveBlob = (value: unknown): value is TextApiSaveBlob => {
  const body = value as Partial<TextApiSaveBlob>;
  return !!body && typeof body === 'object' && typeof body.schemaVersion === 'number' && typeof body.exportedAt === 'string' && 'data' in body;
};

const snapshotObserver = new StateObserver();

const createSnapshot = (session: Session, debug: boolean): TextApiSnapshot => {
  (session.gameSession as typeof session.gameSession & { version: number }).version = session.version;
  return snapshotObserver.observe(session.gameSession, { debug });
};

const getRequiredSession = (manager: SessionManager, sessionId: string): Session | null => manager.getSession(sessionId);

const allowedMethodsFor = (pathname: string): string | null => {
  if (pathname === '/health') {
    return 'GET';
  }
  if (pathname === '/sessions') {
    return 'POST';
  }
  const route = parseSessionRoute(pathname);
  if (!route) {
    return null;
  }
  if (route.resource === null) {
    return 'DELETE';
  }
  if (route.resource === 'state' || route.resource === 'save') {
    return 'GET';
  }
  return 'POST';
};

export const createTextApiServer = (options: TextApiServerOptions = {}): Server => {
  const sessionManager = options.sessionManager ?? new SessionManager();

  return createServer(async (req, res) => {
    try {
      const method = req.method as HttpMethod | undefined;
      const { pathname, searchParams } = parseUrl(req);
      const allow = allowedMethodsFor(pathname);

      if (!allow) {
        writeError(res, 404, 'not_found', 'Endpoint not found.');
        return;
      }

      if (method !== allow) {
        writeError(res, 405, 'method_not_allowed', 'HTTP method is not allowed for this endpoint.', { Allow: allow });
        return;
      }

      if (pathname === '/health') {
        writeJson(res, 200, { status: 'ok' } satisfies TextApiHealthResponse);
        return;
      }

      if (pathname === '/sessions') {
        const session = sessionManager.createSession();
        const response: TextApiCreateSessionResponse = {
          sessionId: session.id,
          snapshot: createSnapshot(session, false)
        };
        writeJson(res, 201, response);
        return;
      }

      const route = parseSessionRoute(pathname);
      if (!route) {
        writeError(res, 404, 'not_found', 'Endpoint not found.');
        return;
      }

      if (route.resource === null) {
        if (!sessionManager.deleteSession(route.sessionId)) {
          writeError(res, 404, 'session_not_found', 'Session not found.');
          return;
        }
        writeNoContent(res);
        return;
      }

      const session = getRequiredSession(sessionManager, route.sessionId);
      if (!session) {
        writeError(res, 404, 'session_not_found', 'Session not found.');
        return;
      }

      if (route.resource === 'state') {
        sessionManager.touch(session);
        writeJson(res, 200, createSnapshot(session, searchParams.get('debug') === 'true'));
        return;
      }

      if (route.resource === 'save') {
        sessionManager.touch(session);
        const saveBlob = session.gameSession.exportSaveBlob();
        writeJson(res, 200, { ...saveBlob, sessionId: session.id } satisfies TextApiSaveBlob);
        return;
      }

      if (route.resource === 'actions') {
        const body = await readJsonBody(req);
        if (!isActionRequest(body)) {
          writeError(res, 400, 'invalid_action_request', 'Action request must include numeric version and string actionId.');
          return;
        }
        if (body.version !== session.version) {
          writeError(res, 409, 'stale_action', 'Action version does not match the current session version.');
          return;
        }
        if (body.actionId !== 'wait') {
          writeError(res, 400, 'invalid_action', 'Action is not available for the current snapshot.');
          return;
        }

        session.gameSession.stepFrames([], 1);
        session.version += 1;
        sessionManager.touch(session);
        const snapshot = createSnapshot(session, false);
        const result: TextApiActionResult = { success: true, newVersion: session.version, snapshot };
        writeJson(res, 200, result);
        return;
      }

      const body = await readJsonBody(req);
      if (!isSaveBlob(body)) {
        writeError(res, 400, 'invalid_save_blob', 'Load request must contain a text API save blob.');
        return;
      }

      try {
        session.gameSession.importSaveBlob(body);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Invalid save blob.';
        writeError(res, 400, 'invalid_save_blob', message);
        return;
      }
      session.version += 1;
      sessionManager.touch(session);
      writeJson(res, 200, createSnapshot(session, false));
    } catch (error) {
      if (error instanceof HttpError) {
        writeError(res, error.status, error.code, error.message);
        return;
      }
      writeError(res, 500, 'internal_error', 'Internal server error.');
    }
  });
};

export const startTextApiServer = (server: Server, host = DEFAULT_HOST, port = DEFAULT_PORT): Promise<void> => new Promise((resolve, reject) => {
  const onError = (error: Error): void => {
    server.off('listening', onListening);
    reject(error);
  };
  const onListening = (): void => {
    server.off('error', onError);
    resolve();
  };
  server.once('error', onError);
  server.once('listening', onListening);
  server.listen(port, host);
});

const parseCliOption = (name: string): string | null => {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] ?? null : null;
};

const isDirectRun = (): boolean => process.argv[1] === fileURLToPath(import.meta.url);

if (isDirectRun()) {
  const host = parseCliOption('--host') ?? process.env.TEXT_API_HOST ?? DEFAULT_HOST;
  const port = Number.parseInt(parseCliOption('--port') ?? process.env.TEXT_API_PORT ?? `${DEFAULT_PORT}`, 10);
  const server = createTextApiServer();

  const shutdown = (): void => {
    server.close(() => process.exit(0));
  };

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);

  startTextApiServer(server, host, Number.isFinite(port) ? port : DEFAULT_PORT)
    .then(() => {
      const address = server.address();
      const boundPort = typeof address === 'object' && address ? address.port : port;
      console.log(`Text API server listening on http://${host}:${boundPort}`);
    })
    .catch((error: unknown) => {
      console.error(error);
      process.exit(1);
    });
}
