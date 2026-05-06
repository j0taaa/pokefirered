import { afterEach, describe, expect, it } from 'vitest';
import type { Server } from 'node:http';
import { once } from 'node:events';
import { createTextApiServer } from '../src/api/textApiServer';

const servers: Server[] = [];

const startServer = async (): Promise<string> => {
  const server = createTextApiServer();
  servers.push(server);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Expected server to listen on a TCP port.');
  }
  return `http://127.0.0.1:${address.port}`;
};

const readJson = async <T>(response: Response): Promise<T> => await response.json() as T;

afterEach(async () => {
  await Promise.all(servers.splice(0).map(server => new Promise<void>(resolve => server.close(() => resolve()))));
});

describe('Text API server', () => {
  it('serves health checks', async () => {
    const baseUrl = await startServer();

    const response = await fetch(`${baseUrl}/health`);

    expect(response.status).toBe(200);
    expect(await readJson(response)).toEqual({ status: 'ok' });
  });

  it('creates, reads, saves, loads, and deletes a session', async () => {
    const baseUrl = await startServer();
    const createResponse = await fetch(`${baseUrl}/sessions`, { method: 'POST' });
    const created = await readJson<{ sessionId: string; snapshot: { version: number; debug?: unknown } }>(createResponse);

    expect(createResponse.status).toBe(201);
    expect(created.sessionId).toEqual(expect.any(String));
    expect(created.snapshot.version).toBe(1);
    expect(created.snapshot.debug).toBeUndefined();

    const stateResponse = await fetch(`${baseUrl}/sessions/${created.sessionId}/state?debug=true`);
    const state = await readJson<{ version: number; debug?: unknown }>(stateResponse);

    expect(stateResponse.status).toBe(200);
    expect(state.version).toBe(1);
    expect(state.debug).toBeDefined();

    const saveResponse = await fetch(`${baseUrl}/sessions/${created.sessionId}/save`);
    const saveBlob = await readJson<Record<string, unknown>>(saveResponse);

    expect(saveResponse.status).toBe(200);
    expect(saveBlob.sessionId).toBe(created.sessionId);
    expect(saveBlob.schemaVersion).toBe(1);

    const loadResponse = await fetch(`${baseUrl}/sessions/${created.sessionId}/load`, {
      method: 'POST',
      body: JSON.stringify(saveBlob)
    });
    const loaded = await readJson<{ version: number; options: unknown[]; snapshot?: unknown }>(loadResponse);

    expect(loadResponse.status).toBe(200);
    expect(loaded.version).toBe(2);
    expect(loaded.options).toEqual(expect.any(Array));
    expect(loaded.snapshot).toBeUndefined();

    const deleteResponse = await fetch(`${baseUrl}/sessions/${created.sessionId}`, { method: 'DELETE' });
    expect(deleteResponse.status).toBe(204);
    expect(await deleteResponse.text()).toBe('');

    const missingResponse = await fetch(`${baseUrl}/sessions/${created.sessionId}/state`);
    expect(missingResponse.status).toBe(404);
  });

  it('handles semantic actions with version checks', async () => {
    const baseUrl = await startServer();
    const createResponse = await fetch(`${baseUrl}/sessions`, { method: 'POST' });
    const created = await readJson<{ sessionId: string; snapshot: { version: number; options: Array<{ id: string; enabled: boolean }> } }>(createResponse);
    const action = created.snapshot.options.find((option) => option.enabled);

    expect(action).toBeDefined();

    const invalidResponse = await fetch(`${baseUrl}/sessions/${created.sessionId}/actions`, {
      method: 'POST',
      body: JSON.stringify({ version: created.snapshot.version, actionId: 'missing' })
    });
    expect(invalidResponse.status).toBe(400);

    const staleResponse = await fetch(`${baseUrl}/sessions/${created.sessionId}/actions`, {
      method: 'POST',
      body: JSON.stringify({ version: 0, actionId: action!.id })
    });
    expect(staleResponse.status).toBe(409);

    const actionResponse = await fetch(`${baseUrl}/sessions/${created.sessionId}/actions`, {
      method: 'POST',
      body: JSON.stringify({ version: created.snapshot.version, actionId: action!.id })
    });
    const result = await readJson<{ success: boolean; newVersion: number; snapshot: { version: number } }>(actionResponse);

    expect(actionResponse.status).toBe(200);
    expect(result.success).toBe(true);
    expect(result.newVersion).toBe(2);
    expect(result.snapshot.version).toBe(2);
  });

  it('executes semantic door navigation through the API', async () => {
    const baseUrl = await startServer();
    const createResponse = await fetch(`${baseUrl}/sessions`, { method: 'POST' });
    const created = await readJson<{ sessionId: string; snapshot: { version: number; options: Array<{ id: string; label: string; enabled: boolean }> } }>(createResponse);
    const enterHouse = created.snapshot.options.find((option) => option.enabled && option.label === 'Enter Pallet Town Players House 1f');

    expect(enterHouse).toBeDefined();

    const actionResponse = await fetch(`${baseUrl}/sessions/${created.sessionId}/actions`, {
      method: 'POST',
      body: JSON.stringify({ version: created.snapshot.version, actionId: enterHouse!.id })
    });

    expect(actionResponse.status).toBe(200);

    const stateResponse = await fetch(`${baseUrl}/sessions/${created.sessionId}/state?debug=true`);
    const state = await readJson<{ version: number; options: Array<{ id: string; label: string; enabled: boolean }>; debug?: { mapId?: string } }>(stateResponse);

    expect(state.debug?.mapId).toBe('MAP_PALLET_TOWN_PLAYERS_HOUSE_1F');

    const exitHouse = state.options.find((option) => option.enabled && option.label === 'Exit to Pallet Town');
    expect(exitHouse).toBeDefined();

    const exitResponse = await fetch(`${baseUrl}/sessions/${created.sessionId}/actions`, {
      method: 'POST',
      body: JSON.stringify({ version: state.version, actionId: exitHouse!.id })
    });

    expect(exitResponse.status).toBe(200);

    const exitedStateResponse = await fetch(`${baseUrl}/sessions/${created.sessionId}/state?debug=true`);
    const exitedState = await readJson<{ version: number; options: Array<{ id: string; label: string; enabled: boolean }>; debug?: { mapId?: string } }>(exitedStateResponse);

    expect(exitedState.debug?.mapId).toBe('MAP_PALLET_TOWN');

    const exitNorth = exitedState.options.find((option) => option.enabled && option.label === 'Exit north to Route1');
    expect(exitNorth).toBeDefined();

    const routeResponse = await fetch(`${baseUrl}/sessions/${created.sessionId}/actions`, {
      method: 'POST',
      body: JSON.stringify({ version: exitedState.version, actionId: exitNorth!.id })
    });

    expect(routeResponse.status).toBe(200);

    const routeStateResponse = await fetch(`${baseUrl}/sessions/${created.sessionId}/state?debug=true`);
    const routeState = await readJson<{ mode: string; debug?: { mapId?: string; internal?: { lastScriptId?: string | null } } }>(routeStateResponse);

    expect(routeState.debug?.mapId).toBe('MAP_PALLET_TOWN');
    expect(routeState.mode).toBe('script');
    expect(routeState.debug?.internal?.lastScriptId).toBe('PalletTown_EventScript_OakTriggerLeft');
  });

  it('returns exact HTTP errors for missing sessions, wrong methods, bad JSON, and oversized bodies', async () => {
    const baseUrl = await startServer();

    const notFoundResponse = await fetch(`${baseUrl}/sessions/unknown/state`);
    expect(notFoundResponse.status).toBe(404);

    const wrongMethodResponse = await fetch(`${baseUrl}/sessions`, { method: 'GET' });
    expect(wrongMethodResponse.status).toBe(405);
    expect(wrongMethodResponse.headers.get('allow')).toBe('POST');

    const createResponse = await fetch(`${baseUrl}/sessions`, { method: 'POST' });
    const created = await readJson<{ sessionId: string }>(createResponse);

    const badJsonResponse = await fetch(`${baseUrl}/sessions/${created.sessionId}/actions`, {
      method: 'POST',
      body: '{'
    });
    expect(badJsonResponse.status).toBe(400);

    const oversizedResponse = await fetch(`${baseUrl}/sessions/${created.sessionId}/actions`, {
      method: 'POST',
      body: JSON.stringify({ version: 1, actionId: 'wait', padding: 'x'.repeat(1024 * 1024) })
    });
    expect(oversizedResponse.status).toBe(413);
  });

  it('keeps multiple sessions isolated', async () => {
    const baseUrl = await startServer();
    const first = await readJson<{ sessionId: string; snapshot: { version: number } }>(await fetch(`${baseUrl}/sessions`, { method: 'POST' }));
    const second = await readJson<{ sessionId: string; snapshot: { version: number; options: Array<{ id: string; enabled: boolean }> } }>(await fetch(`${baseUrl}/sessions`, { method: 'POST' }));
    const firstStateBefore = await readJson<{ options: Array<{ id: string; enabled: boolean }> }>(await fetch(`${baseUrl}/sessions/${first.sessionId}/state`));
    const firstAction = firstStateBefore.options.find((option) => option.enabled);

    expect(firstAction).toBeDefined();

    await fetch(`${baseUrl}/sessions/${first.sessionId}/actions`, {
      method: 'POST',
      body: JSON.stringify({ version: first.snapshot.version, actionId: firstAction!.id })
    });

    const firstState = await readJson<{ version: number }>(await fetch(`${baseUrl}/sessions/${first.sessionId}/state`));
    const secondState = await readJson<{ version: number }>(await fetch(`${baseUrl}/sessions/${second.sessionId}/state`));

    expect(first.sessionId).not.toBe(second.sessionId);
    expect(firstState.version).toBe(2);
    expect(secondState.version).toBe(1);
  });
});
