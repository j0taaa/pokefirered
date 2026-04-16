import type { PlayerState } from './player';
import type { ScriptRuntimeState } from './scripts';
import { isValidBagState, sanitizeBagState } from './bag';

export const SAVE_SCHEMA_VERSION = 3;
export const DEFAULT_SAVE_SLOT_KEY = 'pokefirered.ts.save.v3';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface SaveSnapshot {
  schemaVersion: number;
  mapId: string;
  saveIndex: number;
  savedAt: string;
  player: {
    x: number;
    y: number;
    facing: PlayerState['facing'];
  };
  runtime: {
    vars: Record<string, number>;
    flags: string[];
    consumedTriggerIds: string[];
    startMenu: ScriptRuntimeState['startMenu'];
    options: ScriptRuntimeState['options'];
    bag: ScriptRuntimeState['bag'];
  };
}

export interface SaveOperationResult {
  ok: boolean;
  summary: string;
  saveIndex: number;
}

const isFacing = (value: unknown): value is PlayerState['facing'] =>
  value === 'up' || value === 'down' || value === 'left' || value === 'right';

const isStartMenuMode = (value: unknown): value is ScriptRuntimeState['startMenu']['mode'] =>
  value === 'normal' || value === 'safari' || value === 'link' || value === 'unionRoom';

const isObjectWithNumberValues = (value: unknown): value is Record<string, number> =>
  !!value
  && typeof value === 'object'
  && Object.values(value as Record<string, unknown>).every((entry) => typeof entry === 'number');

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((entry) => typeof entry === 'string');

const nowIso = (): string => new Date().toISOString();

export const createSaveSnapshot = (
  mapId: string,
  player: PlayerState,
  runtime: ScriptRuntimeState,
  savedAt = nowIso()
): SaveSnapshot => {
  // FireRed rotates save sectors with a monotonically increasing save index.
  // We mirror that concept with runtime.saveCounter and persist it for deterministic resumes.
  const saveIndex = runtime.saveCounter + 1;
  return {
    schemaVersion: SAVE_SCHEMA_VERSION,
    mapId,
    saveIndex,
    savedAt,
    player: {
      x: player.position.x,
      y: player.position.y,
      facing: player.facing
    },
    runtime: {
      vars: { ...runtime.vars },
      flags: [...runtime.flags],
      consumedTriggerIds: [...runtime.consumedTriggerIds],
      startMenu: { ...runtime.startMenu },
      options: { ...runtime.options },
      bag: JSON.parse(JSON.stringify(runtime.bag)) as ScriptRuntimeState['bag']
    }
  };
};

const parseSaveSnapshot = (raw: unknown): SaveSnapshot | null => {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const candidate = raw as Record<string, unknown>;
  if (candidate.schemaVersion !== SAVE_SCHEMA_VERSION) {
    return null;
  }

  if (typeof candidate.mapId !== 'string' || candidate.mapId.length === 0) {
    return null;
  }

  if (!Number.isInteger(candidate.saveIndex) || (candidate.saveIndex as number) < 1) {
    return null;
  }

  if (typeof candidate.savedAt !== 'string' || candidate.savedAt.length === 0) {
    return null;
  }

  const player = candidate.player as Record<string, unknown> | undefined;
  if (!player || typeof player.x !== 'number' || typeof player.y !== 'number' || !isFacing(player.facing)) {
    return null;
  }

  const runtime = candidate.runtime as Record<string, unknown> | undefined;
  if (!runtime) {
    return null;
  }

  const startMenu = runtime.startMenu as Record<string, unknown> | undefined;
  if (
    !startMenu
    || !isStartMenuMode(startMenu.mode)
    || typeof startMenu.playerName !== 'string'
    || typeof startMenu.hasPokedex !== 'boolean'
    || typeof startMenu.hasPokemon !== 'boolean'
    || !Number.isInteger(startMenu.seenPokemonCount)
    || (startMenu.seenPokemonCount as number) < 0
  ) {
    return null;
  }

  if (!isObjectWithNumberValues(runtime.vars) || !isStringArray(runtime.flags) || !isStringArray(runtime.consumedTriggerIds)) {
    return null;
  }

  const options = runtime.options as Record<string, unknown> | undefined;
  if (
    !options
    || (options.textSpeed !== 'slow' && options.textSpeed !== 'mid' && options.textSpeed !== 'fast')
    || typeof options.battleScene !== 'boolean'
    || (options.battleStyle !== 'shift' && options.battleStyle !== 'set')
  ) {
    return null;
  }

  if (!isValidBagState(runtime.bag)) {
    return null;
  }

  return {
    schemaVersion: SAVE_SCHEMA_VERSION,
    mapId: candidate.mapId,
    saveIndex: candidate.saveIndex as number,
    savedAt: candidate.savedAt,
    player: {
      x: player.x,
      y: player.y,
      facing: player.facing
    },
    runtime: {
      vars: { ...(runtime.vars as Record<string, number>) },
      flags: [...(runtime.flags as string[])],
      consumedTriggerIds: [...(runtime.consumedTriggerIds as string[])],
      startMenu: {
        mode: startMenu.mode,
        playerName: startMenu.playerName,
        hasPokedex: startMenu.hasPokedex,
        hasPokemon: startMenu.hasPokemon,
        seenPokemonCount: startMenu.seenPokemonCount as number
      },
      options: {
        textSpeed: options.textSpeed,
        battleScene: options.battleScene,
        battleStyle: options.battleStyle
      },
      bag: sanitizeBagState(JSON.parse(JSON.stringify(runtime.bag)) as ScriptRuntimeState['bag'])
    }
  };
};

export const saveGameToStorage = (
  storage: StorageLike,
  mapId: string,
  player: PlayerState,
  runtime: ScriptRuntimeState,
  key = DEFAULT_SAVE_SLOT_KEY
): SaveOperationResult => {
  const snapshot = createSaveSnapshot(mapId, player, runtime);
  storage.setItem(key, JSON.stringify(snapshot));
  runtime.saveCounter = snapshot.saveIndex;
  return {
    ok: true,
    summary: `Saved at ${snapshot.savedAt} (slot #${snapshot.saveIndex}).`,
    saveIndex: snapshot.saveIndex
  };
};

export const loadGameFromStorage = (
  storage: StorageLike,
  key = DEFAULT_SAVE_SLOT_KEY
): SaveSnapshot | null => {
  const raw = storage.getItem(key);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return parseSaveSnapshot(parsed);
  } catch {
    return null;
  }
};

export const applySaveSnapshot = (
  snapshot: SaveSnapshot,
  mapId: string,
  player: PlayerState,
  runtime: ScriptRuntimeState
): boolean => {
  if (snapshot.mapId !== mapId) {
    return false;
  }

  player.position.x = snapshot.player.x;
  player.position.y = snapshot.player.y;
  player.facing = snapshot.player.facing;
  player.moving = false;
  player.animationTime = 0;

  runtime.vars = { ...snapshot.runtime.vars };
  runtime.flags = new Set<string>(snapshot.runtime.flags);
  runtime.consumedTriggerIds = new Set<string>(snapshot.runtime.consumedTriggerIds);
  runtime.startMenu = { ...snapshot.runtime.startMenu };
  runtime.options = { ...snapshot.runtime.options };
  runtime.bag = sanitizeBagState(JSON.parse(JSON.stringify(snapshot.runtime.bag)) as ScriptRuntimeState['bag']);
  runtime.saveCounter = snapshot.saveIndex;
  return true;
};
