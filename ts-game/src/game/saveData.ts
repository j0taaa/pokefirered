import type { PlayerState } from './player';
import type { ScriptRuntimeState } from './scripts';
import { isValidBagState, sanitizeBagState } from './bag';
import {
  clonePlayTimeCounter,
  createPlayTimeCounterFromSeconds,
  startPlayTimeCounter,
  type PlayTimeCounter
} from './decompPlayTime';
import { UNLOCKED_POKEDEX_GCN_LINK_FLAGS_MASK } from './decompSaveLocation';
import {
  cloneParty,
  clonePokedex,
  type FieldPokemon,
  type PokedexState
} from './pokemonStorage';

export const SAVE_SCHEMA_VERSION = 6;
export const DEFAULT_SAVE_SLOT_KEY = 'pokefirered.ts.save.v6';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem?(key: string): void;
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
    specialSaveWarpFlags: number;
    gcnLinkFlags: number;
    playTime: {
      hours: number;
      minutes: number;
      seconds: number;
      vblanks: number;
    };
    party: ScriptRuntimeState['party'];
    pokedex: ScriptRuntimeState['pokedex'];
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

const isPlayTimeCounterLike = (value: unknown): value is Omit<PlayTimeCounter, 'state'> => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return Number.isInteger(candidate.hours)
    && Number.isInteger(candidate.minutes)
    && Number.isInteger(candidate.seconds)
    && Number.isInteger(candidate.vblanks)
    && (candidate.hours as number) >= 0
    && (candidate.minutes as number) >= 0
    && (candidate.minutes as number) <= 59
    && (candidate.seconds as number) >= 0
    && (candidate.seconds as number) <= 59
    && (candidate.vblanks as number) >= 0
    && (candidate.vblanks as number) <= 59;
};

const isFieldPokemon = (value: unknown): value is FieldPokemon => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return typeof candidate.species === 'string'
    && Number.isInteger(candidate.level)
    && typeof candidate.maxHp === 'number'
    && typeof candidate.hp === 'number'
    && typeof candidate.attack === 'number'
    && typeof candidate.defense === 'number'
    && typeof candidate.speed === 'number'
    && typeof candidate.spAttack === 'number'
    && typeof candidate.spDefense === 'number'
    && typeof candidate.catchRate === 'number'
    && Array.isArray(candidate.types)
    && candidate.types.every((entry) => typeof entry === 'string')
    && (candidate.championRibbon === undefined || typeof candidate.championRibbon === 'boolean')
    && (candidate.status === 'none' || candidate.status === 'poison');
};

const isFieldPokemonArray = (value: unknown): value is FieldPokemon[] =>
  Array.isArray(value) && value.every((entry) => isFieldPokemon(entry));

const isPokedexState = (value: unknown): value is PokedexState => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  const orderCp = candidate.orderListCursorPos;
  const orderIa = candidate.orderListItemsAbove;
  const orderScrollOk =
    (orderCp === undefined && orderIa === undefined)
    || (Number.isInteger(orderCp) && Number.isInteger(orderIa));

  return (candidate.dexMode === 'KANTO' || candidate.dexMode === 'NATIONAL')
    && Number.isInteger(candidate.selectedIndex)
    && orderScrollOk
    && isStringArray(candidate.seenSpecies)
    && isStringArray(candidate.caughtSpecies);
};

const nowIso = (): string => new Date().toISOString();

export const createSaveSnapshot = (
  mapId: string,
  player: PlayerState,
  runtime: ScriptRuntimeState,
  savedAt = nowIso()
): SaveSnapshot => {
  const playTime = clonePlayTimeCounter(runtime.playTime);
  const vars = {
    ...runtime.vars,
    playTimeSeconds: (playTime.hours * 3600) + (playTime.minutes * 60) + playTime.seconds,
    playTimeMinutes: (playTime.hours * 60) + playTime.minutes
  };
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
      vars,
      flags: [...runtime.flags],
      consumedTriggerIds: [...runtime.consumedTriggerIds],
      startMenu: { ...runtime.startMenu },
      options: { ...runtime.options },
      specialSaveWarpFlags: runtime.specialSaveWarpFlags,
      gcnLinkFlags: runtime.gcnLinkFlags,
      playTime: {
        hours: playTime.hours,
        minutes: playTime.minutes,
        seconds: playTime.seconds,
        vblanks: playTime.vblanks
      },
      party: cloneParty(runtime.party),
      pokedex: clonePokedex(runtime.pokedex),
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
    || (options.sound !== 'mono' && options.sound !== 'stereo')
    || (
      options.buttonMode !== 'help'
      && options.buttonMode !== 'lr'
      && options.buttonMode !== 'lEqualsA'
    )
    || !Number.isInteger(options.frameType)
    || (options.frameType as number) < 0
    || (options.frameType as number) > 9
  ) {
    return null;
  }

  if (runtime.specialSaveWarpFlags !== undefined && !Number.isInteger(runtime.specialSaveWarpFlags)) {
    return null;
  }

  if (runtime.gcnLinkFlags !== undefined && !Number.isInteger(runtime.gcnLinkFlags)) {
    return null;
  }

  if (!isFieldPokemonArray(runtime.party) || !isPokedexState(runtime.pokedex)) {
    return null;
  }

  const parsedPlayTime = isPlayTimeCounterLike(runtime.playTime)
    ? createPlayTimeCounterFromSeconds(
        (((runtime.playTime as Record<string, number>).hours ?? 0) * 3600)
        + (((runtime.playTime as Record<string, number>).minutes ?? 0) * 60)
        + ((runtime.playTime as Record<string, number>).seconds ?? 0),
        (runtime.playTime as Record<string, number>).vblanks ?? 0
      )
    : createPlayTimeCounterFromSeconds((runtime.vars as Record<string, number>).playTimeSeconds ?? 0);
  startPlayTimeCounter(parsedPlayTime);

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
        battleStyle: options.battleStyle,
        sound: options.sound,
        buttonMode: options.buttonMode,
        frameType: options.frameType as number
      },
      specialSaveWarpFlags: (runtime.specialSaveWarpFlags as number | undefined) ?? 0,
      gcnLinkFlags: (runtime.gcnLinkFlags as number | undefined)
        ?? (startMenu.hasPokedex ? UNLOCKED_POKEDEX_GCN_LINK_FLAGS_MASK : 0),
      playTime: {
        hours: parsedPlayTime.hours,
        minutes: parsedPlayTime.minutes,
        seconds: parsedPlayTime.seconds,
        vblanks: parsedPlayTime.vblanks
      },
      party: cloneParty(runtime.party as FieldPokemon[]),
      pokedex: clonePokedex(runtime.pokedex as PokedexState),
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

export const clearSavedGameFromStorage = (
  storage: StorageLike,
  key = DEFAULT_SAVE_SLOT_KEY
): void => {
  if (typeof storage.removeItem === 'function') {
    storage.removeItem(key);
    return;
  }

  storage.setItem(key, '');
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
  runtime.specialSaveWarpFlags = snapshot.runtime.specialSaveWarpFlags;
  runtime.gcnLinkFlags = snapshot.runtime.gcnLinkFlags;
  runtime.playTime = createPlayTimeCounterFromSeconds(
    (snapshot.runtime.playTime.hours * 3600) + (snapshot.runtime.playTime.minutes * 60) + snapshot.runtime.playTime.seconds,
    snapshot.runtime.playTime.vblanks
  );
  startPlayTimeCounter(runtime.playTime);
  runtime.party = cloneParty(snapshot.runtime.party);
  runtime.pokedex = clonePokedex(snapshot.runtime.pokedex);
  runtime.bag = sanitizeBagState(JSON.parse(JSON.stringify(snapshot.runtime.bag)) as ScriptRuntimeState['bag']);
  runtime.vars.playTimeSeconds = (runtime.playTime.hours * 3600) + (runtime.playTime.minutes * 60) + runtime.playTime.seconds;
  runtime.vars.playTimeMinutes = (runtime.playTime.hours * 60) + runtime.playTime.minutes;
  runtime.saveCounter = snapshot.saveIndex;
  return true;
};
