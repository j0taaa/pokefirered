/**
 * Canonical public contract for the accessible text API.
 *
 * This module intentionally contains only TypeScript contracts and static
 * examples. It does not implement sessions, gameplay, routing, or transport.
 */

/** JSON value accepted in portable debug, save, and action metadata fields. */
export type TextApiJsonValue =
  | null
  | boolean
  | number
  | string
  | TextApiJsonValue[]
  | { readonly [key: string]: TextApiJsonValue };

/** Named game mode exposed by the text API. */
export type TextApiMode =
  | 'overworld'
  | 'dialogue'
  | 'menu'
  | 'battle'
  | 'transition'
  | 'fieldAction'
  | 'trainerSee'
  | 'script'
  | 'saveLoad'
  | 'resolvedBattle';

/** Semantic action descriptor selected through a text API option. */
export interface TextApiAction {
  /** Stable semantic action type, such as choosing, inspecting, or continuing. */
  readonly type: string;
  /** Optional semantic target for the action. */
  readonly target?: string;
  /** Optional portable value for action-specific data. */
  readonly value?: TextApiJsonValue;
}

/** Public option available from the current text API snapshot. */
export interface TextApiOption {
  /** Stable option identifier used as the actionId in action requests. */
  readonly id: string;
  /** Human-readable semantic label, never raw hardware controls. */
  readonly label: string;
  /** Short explanation of what the option will do. */
  readonly description: string;
  /** Semantic grouping for clients that present options by intent. */
  readonly category: string;
  /** Whether this option can currently be selected. */
  readonly enabled: boolean;
  /** Semantic reason the option is unavailable, when enabled is false. */
  readonly disabledReason?: string;
  /** Semantic action payload for the selected option. */
  readonly action: TextApiAction;
}

/** Complete public state view returned by text API state endpoints. */
export interface TextApiSnapshot {
  /** Current game mode represented by this snapshot. */
  readonly mode: TextApiMode;
  /** Monotonic state version used to reject stale action requests. */
  readonly version: number;
  /** Concise one-sentence summary suitable for quick screen reader output. */
  readonly summary: string;
  /** Expanded semantic details for clients that request more context. */
  readonly details: string;
  /** Available semantic options for the current state. */
  readonly options: readonly TextApiOption[];
  /** Optional diagnostic state included only when debug output is requested. */
  readonly debug?: TextApiJsonValue;
}

/** Request body for selecting an option from a session snapshot. */
export interface TextApiActionRequest {
  /** Snapshot version observed by the client when choosing the action. */
  readonly version: number;
  /** Identifier of the option selected by the client. */
  readonly actionId: string;
}

/** Result body returned after attempting to apply an action. */
export interface TextApiActionResult {
  /** Whether the action was applied successfully. */
  readonly success: boolean;
  /** New session version after the request was handled. */
  readonly newVersion: number;
  /** Updated snapshot when the request can return current state. */
  readonly snapshot: TextApiSnapshot;
  /** Error details when success is false. */
  readonly error?: TextApiError;
}

/** Structured public error returned by failed text API requests. */
export interface TextApiError {
  /** Stable machine-readable error code. */
  readonly code: string;
  /** Human-readable semantic error message. */
  readonly message: string;
  /** Optional portable diagnostics safe for public clients. */
  readonly details?: TextApiJsonValue;
}

/** Metadata for an active text API session. */
export interface TextApiSession {
  /** Stable session identifier. */
  readonly sessionId: string;
  /** ISO timestamp for when the session was created. */
  readonly createdAt: string;
  /** ISO timestamp for the latest successful session activity. */
  readonly lastActivityAt: string;
}

/** Portable save payload exchanged through text API save/load endpoints. */
export interface TextApiSaveBlob {
  /** Save blob schema version, independent of session state versions. */
  readonly schemaVersion: number;
  /** ISO timestamp for when this blob was exported. */
  readonly exportedAt: string;
  /** Optional source session identifier for traceability. */
  readonly sessionId?: string;
  /** Portable game state payload owned by the save/load implementation. */
  readonly data: TextApiJsonValue;
  /** Optional integrity marker for clients that persist blobs externally. */
  readonly checksum?: string;
}

/** Successful response for POST /sessions. */
export interface TextApiCreateSessionResponse {
  /** Newly created session identifier. */
  readonly sessionId: string;
  /** Initial public state snapshot for the session. */
  readonly snapshot: TextApiSnapshot;
}

/** Successful health response. */
export interface TextApiHealthResponse {
  /** Service status for health checks. */
  readonly status: 'ok';
}

/** Exact endpoint status-code contract for the text API. */
export interface TextApiEndpointContract {
  /** HTTP method for this endpoint. */
  readonly method: 'GET' | 'POST' | 'DELETE';
  /** Route template for this endpoint. */
  readonly path: string;
  /** Successful status code for this endpoint. */
  readonly successStatus: 200 | 201 | 204;
  /** Error status codes declared for this endpoint. */
  readonly errorStatuses: readonly (400 | 404 | 409)[];
}

/** Canonical endpoint contracts and global HTTP error rules. */
export const TEXT_API_ENDPOINT_CONTRACT = {
  endpoints: {
    createSession: {
      method: 'POST',
      path: '/sessions',
      successStatus: 201,
      errorStatuses: []
    },
    getState: {
      method: 'GET',
      path: '/sessions/:id/state?debug=true',
      successStatus: 200,
      errorStatuses: [404]
    },
    postAction: {
      method: 'POST',
      path: '/sessions/:id/actions',
      successStatus: 200,
      errorStatuses: [400, 409, 404]
    },
    getSave: {
      method: 'GET',
      path: '/sessions/:id/save',
      successStatus: 200,
      errorStatuses: [404]
    },
    loadSave: {
      method: 'POST',
      path: '/sessions/:id/load',
      successStatus: 200,
      errorStatuses: [400, 404]
    },
    deleteSession: {
      method: 'DELETE',
      path: '/sessions/:id',
      successStatus: 204,
      errorStatuses: [404]
    },
    health: {
      method: 'GET',
      path: '/health',
      successStatus: 200,
      errorStatuses: []
    }
  },
  globalErrors: {
    wrongMethod: {
      status: 405,
      requiresAllowHeader: true
    },
    badJson: {
      status: 400
    },
    oversizedBody: {
      status: 413
    }
  }
} as const satisfies {
  readonly endpoints: Record<string, TextApiEndpointContract>;
  readonly globalErrors: {
    readonly wrongMethod: { readonly status: 405; readonly requiresAllowHeader: true };
    readonly badJson: { readonly status: 400 };
    readonly oversizedBody: { readonly status: 413 };
  };
};

/** Canonical safe examples used by contract tests and downstream implementers. */
export const TEXT_API_CONTRACT_EXAMPLES = {
  snapshot: {
    mode: 'overworld',
    version: 7,
    summary: 'You are standing in Pallet Town near your home.',
    details: 'A quiet road leads north toward Route 1. Your home is nearby, and the lab is southeast.',
    options: [
      {
        id: 'walk-north',
        label: 'Walk north',
        description: 'Move toward Route 1.',
        category: 'movement',
        enabled: true,
        action: {
          type: 'move',
          target: 'north'
        }
      },
      {
        id: 'inspect-home-door',
        label: 'Inspect home door',
        description: 'Check the entrance to your home.',
        category: 'inspection',
        enabled: false,
        disabledReason: 'You are not facing the entrance.',
        action: {
          type: 'inspect',
          target: 'home-door'
        }
      }
    ],
    debug: {
      map: 'PalletTown',
      coordinates: { x: 5, y: 6 }
    }
  },
  actionRequest: {
    version: 7,
    actionId: 'walk-north'
  },
  actionResult: {
    success: true,
    newVersion: 8,
    snapshot: {
      mode: 'transition',
      version: 8,
      summary: 'You start walking north.',
      details: 'The path ahead leads toward Route 1.',
      options: []
    }
  },
  error: {
    code: 'STALE_VERSION',
    message: 'The session changed before the action was applied.',
    details: { expectedVersion: 8, receivedVersion: 7 }
  },
  session: {
    sessionId: 'session-example',
    createdAt: '2026-05-05T00:00:00.000Z',
    lastActivityAt: '2026-05-05T00:01:00.000Z'
  },
  saveBlob: {
    schemaVersion: 1,
    exportedAt: '2026-05-05T00:02:00.000Z',
    sessionId: 'session-example',
    data: { location: 'PalletTown', version: 8 },
    checksum: 'sha256-example'
  },
  createSessionResponse: {
    sessionId: 'session-example',
    snapshot: {
      mode: 'overworld',
      version: 1,
      summary: 'A new adventure is ready.',
      details: 'The world is initialized and waiting for your first choice.',
      options: []
    }
  },
  healthResponse: {
    status: 'ok'
  }
} as const satisfies {
  readonly snapshot: TextApiSnapshot;
  readonly actionRequest: TextApiActionRequest;
  readonly actionResult: TextApiActionResult;
  readonly error: TextApiError;
  readonly session: TextApiSession;
  readonly saveBlob: TextApiSaveBlob;
  readonly createSessionResponse: TextApiCreateSessionResponse;
  readonly healthResponse: TextApiHealthResponse;
};
