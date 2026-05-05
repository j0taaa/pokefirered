import { clearPlayerMovement, type PlayerState } from './player';
import type { ScriptRuntimeState } from './scripts';
import { isValidBagState, sanitizeBagState } from './bag';
import {
  clonePlayTimeCounter,
  createPlayTimeCounterFromSeconds,
  startPlayTimeCounter,
  type PlayTimeCounter
} from './decompPlayTime';
import {
  cloneDecompNewGameState,
  createDefaultNewGameState,
  createDefaultPcStorageState,
  type DecompNewGameState
} from './decompNewGame';
import { UNLOCKED_POKEDEX_GCN_LINK_FLAGS_MASK } from './decompSaveLocation';
import {
  cloneParty,
  clonePokedex,
  type FieldPokemon,
  type PokedexState
} from './pokemonStorage';
import { createSaveEnvelope, hasValidSaveChecksum, isSaveEnvelope } from './saveValidation';
import { migrateSavePayload } from './saveMigration';

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
    stringVars: Record<string, string>;
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
    pcStorage?: ScriptRuntimeState['pcStorage'];
    newGame?: ScriptRuntimeState['newGame'];
    roamer?: ScriptRuntimeState['roamer'];
    dynamicWarp?: ScriptRuntimeState['dynamicWarp'];
    fameChecker?: ScriptRuntimeState['fameChecker'];
    fieldAudio?: Pick<ScriptRuntimeState['fieldAudio'], 'currentMapMusic' | 'nextMapMusic' | 'savedMusic' | 'defaultMapMusic' | 'mapMusicState'>;
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

const isObjectWithStringValues = (value: unknown): value is Record<string, string> =>
  !!value
  && typeof value === 'object'
  && Object.values(value as Record<string, unknown>).every((entry) => typeof entry === 'string');

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
    && (candidate.nickname === undefined || typeof candidate.nickname === 'string')
    && (candidate.moves === undefined || (Array.isArray(candidate.moves) && candidate.moves.every((entry) => typeof entry === 'string')))
    && (candidate.movePpRemaining === undefined || (Array.isArray(candidate.movePpRemaining) && candidate.movePpRemaining.every((entry) => Number.isInteger(entry))))
    && (candidate.otName === undefined || typeof candidate.otName === 'string')
    && (candidate.otId === undefined || Number.isInteger(candidate.otId))
    && (candidate.personality === undefined || Number.isInteger(candidate.personality))
    && (candidate.friendship === undefined || Number.isInteger(candidate.friendship))
    && (candidate.isEgg === undefined || typeof candidate.isEgg === 'boolean')
    && (candidate.heldItemId === undefined || candidate.heldItemId === null || typeof candidate.heldItemId === 'string')
    && (candidate.mailId === undefined || Number.isInteger(candidate.mailId))
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

const isNumberArray = (value: unknown): value is number[] =>
  Array.isArray(value) && value.every((entry) => typeof entry === 'number');

const isNumberMatrix = (value: unknown): value is number[][] =>
  Array.isArray(value) && value.every((entry) => isNumberArray(entry));

const isPcStorageState = (value: unknown): value is ScriptRuntimeState['pcStorage'] => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return Number.isInteger(candidate.currentBox)
    && isStringArray(candidate.boxNames)
    && Array.isArray(candidate.boxes)
    && (candidate.boxes as unknown[]).every((box) => isFieldPokemonArray(box))
    && (candidate.currentBox as number) >= 0
    && (candidate.currentBox as number) < (candidate.boxNames as string[]).length
    && (candidate.boxNames as string[]).length === (candidate.boxes as unknown[]).length;
};

const isDecompMailSlot = (value: unknown): boolean => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return Array.isArray(candidate.words)
    && candidate.words.length === 9
    && candidate.words.every((entry) => Number.isInteger(entry))
    && typeof candidate.playerName === 'string'
    && Number.isInteger(candidate.trainerId)
    && (typeof candidate.species === 'string' || Number.isInteger(candidate.species))
    && (candidate.itemId === null || typeof candidate.itemId === 'string');
};

const isBagSlot = (value: unknown): boolean => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return typeof candidate.itemId === 'string' && Number.isInteger(candidate.quantity);
};

const isDecompNewGameState = (value: unknown): value is DecompNewGameState => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return typeof candidate.differentSaveFile === 'boolean'
    && typeof candidate.unkFlag1 === 'boolean'
    && typeof candidate.unkFlag2 === 'boolean'
    && Array.isArray(candidate.pcItems)
    && candidate.pcItems.every((entry) => isBagSlot(entry))
    && Array.isArray(candidate.mail)
    && candidate.mail.every((entry) => isDecompMailSlot(entry))
    && typeof candidate.battleTowerCleared === 'boolean'
    && typeof candidate.trainerTowerResultsCleared === 'boolean'
    && Number.isInteger(candidate.berryPowderAmount)
    && typeof candidate.berryPickingResultsCleared === 'boolean'
    && typeof candidate.pokemonJumpResultsCleared === 'boolean'
    && typeof candidate.mysteryGiftCleared === 'boolean'
    && typeof candidate.renewableItemFlagsInitialized === 'boolean'
    && typeof candidate.easyChatInitialized === 'boolean'
    && typeof candidate.trainerFanClubCleared === 'boolean'
    && typeof candidate.unionRoomRegisteredTextsInitialized === 'boolean'
    && typeof candidate.fameCheckerCleared === 'boolean'
    && typeof candidate.enigmaBerriesCleared === 'boolean'
    && typeof candidate.roamerCleared === 'boolean';
};

const isRoamerData = (value: unknown): boolean => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return Number.isInteger(candidate.species)
    && Number.isInteger(candidate.level)
    && Number.isInteger(candidate.status)
    && typeof candidate.active === 'boolean'
    && Number.isInteger(candidate.ivs)
    && Number.isInteger(candidate.personality)
    && Number.isInteger(candidate.hp)
    && Number.isInteger(candidate.cool)
    && Number.isInteger(candidate.beauty)
    && Number.isInteger(candidate.cute)
    && Number.isInteger(candidate.smart)
    && Number.isInteger(candidate.tough);
};

const isRoamerPokemon = (value: unknown): boolean => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return Number.isInteger(candidate.species)
    && Number.isInteger(candidate.level)
    && Number.isInteger(candidate.ivs)
    && Number.isInteger(candidate.personality)
    && Number.isInteger(candidate.status)
    && Number.isInteger(candidate.hp)
    && Number.isInteger(candidate.maxHp)
    && Number.isInteger(candidate.cool)
    && Number.isInteger(candidate.beauty)
    && Number.isInteger(candidate.cute)
    && Number.isInteger(candidate.smart)
    && Number.isInteger(candidate.tough);
};

const isRoamerRuntime = (value: unknown): value is ScriptRuntimeState['roamer'] => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  const rng = candidate.rng as Record<string, unknown> | undefined;
  return isRoamerData(candidate.roamer)
    && isNumberMatrix(candidate.locationHistory)
    && isNumberArray(candidate.roamerLocation)
    && Array.isArray(candidate.enemyParty)
    && candidate.enemyParty.every((entry) => isRoamerPokemon(entry))
    && !!rng
    && Number.isInteger(rng.value)
    && Number.isInteger(candidate.starterSpecies)
    && (candidate.mapSectionByLocation === undefined || isObjectWithNumberValues(candidate.mapSectionByLocation));
};

const cloneRoamerRuntime = (state: ScriptRuntimeState['roamer']): ScriptRuntimeState['roamer'] => ({
  roamer: { ...state.roamer },
  locationHistory: state.locationHistory.map((entry) => [...entry]),
  roamerLocation: [...state.roamerLocation],
  enemyParty: state.enemyParty.map((entry) => ({ ...entry })),
  rng: { ...state.rng },
  starterSpecies: state.starterSpecies,
  mapSectionByLocation: { ...state.mapSectionByLocation }
});

const isDynamicWarp = (value: unknown): value is ScriptRuntimeState['dynamicWarp'] => {
  if (value === null) {
    return true;
  }

  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return typeof candidate.mapId === 'string'
    && Number.isInteger(candidate.warpId)
    && typeof candidate.x === 'number'
    && typeof candidate.y === 'number';
};

const isFameChecker = (value: unknown): value is ScriptRuntimeState['fameChecker'] => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return isObjectWithNumberValues(candidate.pickStates)
    && isObjectWithNumberValues(candidate.flavorTextFlags)
    && Array.isArray(candidate.updates)
    && candidate.updates.every((entry) => {
      if (!entry || typeof entry !== 'object') {
        return false;
      }
      const update = entry as Record<string, unknown>;
      return Number.isInteger(update.person)
        && Number.isInteger(update.value)
        && (update.special === null || typeof update.special === 'string');
    });
};

const cloneFameChecker = (state: ScriptRuntimeState['fameChecker']): ScriptRuntimeState['fameChecker'] => ({
  pickStates: { ...state.pickStates },
  flavorTextFlags: { ...state.flavorTextFlags },
  updates: state.updates.map((entry) => ({ ...entry }))
});

const isPersistentFieldAudio = (value: unknown): value is NonNullable<SaveSnapshot['runtime']['fieldAudio']> => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return Number.isInteger(candidate.currentMapMusic)
    && Number.isInteger(candidate.nextMapMusic)
    && Number.isInteger(candidate.savedMusic)
    && Number.isInteger(candidate.defaultMapMusic)
    && Number.isInteger(candidate.mapMusicState);
};

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
      stringVars: { ...runtime.stringVars },
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
      bag: JSON.parse(JSON.stringify(runtime.bag)) as ScriptRuntimeState['bag'],
      pcStorage: {
        currentBox: runtime.pcStorage.currentBox,
        boxNames: [...runtime.pcStorage.boxNames],
        boxes: runtime.pcStorage.boxes.map((box) => cloneParty(box))
      },
      newGame: cloneDecompNewGameState(runtime.newGame),
      roamer: cloneRoamerRuntime(runtime.roamer),
      dynamicWarp: runtime.dynamicWarp ? { ...runtime.dynamicWarp } : null,
      fameChecker: cloneFameChecker(runtime.fameChecker),
      fieldAudio: {
        currentMapMusic: runtime.fieldAudio.currentMapMusic,
        nextMapMusic: runtime.fieldAudio.nextMapMusic,
        savedMusic: runtime.fieldAudio.savedMusic,
        defaultMapMusic: runtime.fieldAudio.defaultMapMusic,
        mapMusicState: runtime.fieldAudio.mapMusicState
      }
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
    || (startMenu.playerGender !== undefined && startMenu.playerGender !== 'male' && startMenu.playerGender !== 'female')
    || typeof startMenu.hasPokedex !== 'boolean'
    || typeof startMenu.hasPokemon !== 'boolean'
    || !Number.isInteger(startMenu.seenPokemonCount)
    || (startMenu.seenPokemonCount as number) < 0
  ) {
    return null;
  }

  if (
    !isObjectWithNumberValues(runtime.vars)
    || (runtime.stringVars !== undefined && !isObjectWithStringValues(runtime.stringVars))
    || !isStringArray(runtime.flags)
    || !isStringArray(runtime.consumedTriggerIds)
  ) {
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

  if (runtime.pcStorage !== undefined && !isPcStorageState(runtime.pcStorage)) {
    return null;
  }

  if (runtime.newGame !== undefined && !isDecompNewGameState(runtime.newGame)) {
    return null;
  }

  if (runtime.roamer !== undefined && !isRoamerRuntime(runtime.roamer)) {
    return null;
  }

  if (runtime.dynamicWarp !== undefined && !isDynamicWarp(runtime.dynamicWarp)) {
    return null;
  }

  if (runtime.fameChecker !== undefined && !isFameChecker(runtime.fameChecker)) {
    return null;
  }

  if (runtime.fieldAudio !== undefined && !isPersistentFieldAudio(runtime.fieldAudio)) {
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
      stringVars: { ...((runtime.stringVars as Record<string, string> | undefined) ?? {}) },
      flags: [...(runtime.flags as string[])],
      consumedTriggerIds: [...(runtime.consumedTriggerIds as string[])],
      startMenu: {
        mode: startMenu.mode,
        playerName: startMenu.playerName,
        playerGender: startMenu.playerGender === 'female' ? 'female' : 'male',
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
      bag: sanitizeBagState(JSON.parse(JSON.stringify(runtime.bag)) as ScriptRuntimeState['bag']),
      pcStorage: isPcStorageState(runtime.pcStorage)
        ? {
            currentBox: runtime.pcStorage.currentBox,
            boxNames: [...runtime.pcStorage.boxNames],
            boxes: runtime.pcStorage.boxes.map((box) => cloneParty(box))
          }
        : createDefaultPcStorageState(),
      newGame: isDecompNewGameState(runtime.newGame)
        ? cloneDecompNewGameState(runtime.newGame)
        : createDefaultNewGameState(),
      roamer: isRoamerRuntime(runtime.roamer)
        ? cloneRoamerRuntime(runtime.roamer)
        : undefined,
      dynamicWarp: isDynamicWarp(runtime.dynamicWarp) ? runtime.dynamicWarp ? { ...runtime.dynamicWarp } : null : undefined,
      fameChecker: isFameChecker(runtime.fameChecker)
        ? cloneFameChecker(runtime.fameChecker)
        : undefined,
      fieldAudio: isPersistentFieldAudio(runtime.fieldAudio)
        ? { ...runtime.fieldAudio }
        : undefined
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
  try {
    storage.setItem(key, JSON.stringify(createSaveEnvelope(snapshot)));
  } catch (error) {
    const isQuotaError = error instanceof DOMException && error.name === 'QuotaExceededError';
    return {
      ok: false,
      summary: isQuotaError ? 'Save failed: browser storage quota exceeded.' : 'Save failed: browser storage is unavailable.',
      saveIndex: runtime.saveCounter
    };
  }
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
    if (isSaveEnvelope(parsed)) {
      if (!hasValidSaveChecksum(parsed)) {
        return null;
      }
      return parseSaveSnapshot(migrateSavePayload(parsed.payload));
    }

    return parseSaveSnapshot(migrateSavePayload(parsed));
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
  clearPlayerMovement(player);

  runtime.vars = { ...snapshot.runtime.vars };
  runtime.stringVars = {
    STR_VAR_1: '',
    STR_VAR_2: '',
    STR_VAR_3: '',
    STR_VAR_4: '',
    ...snapshot.runtime.stringVars
  };
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
  runtime.pcStorage = snapshot.runtime.pcStorage
    ? {
        currentBox: snapshot.runtime.pcStorage.currentBox,
        boxNames: [...snapshot.runtime.pcStorage.boxNames],
        boxes: snapshot.runtime.pcStorage.boxes.map((box) => cloneParty(box))
      }
    : createDefaultPcStorageState();
  runtime.newGame = snapshot.runtime.newGame
    ? cloneDecompNewGameState(snapshot.runtime.newGame)
    : createDefaultNewGameState();
  if (snapshot.runtime.roamer) {
    runtime.roamer = cloneRoamerRuntime(snapshot.runtime.roamer);
  }
  if (snapshot.runtime.dynamicWarp !== undefined) {
    runtime.dynamicWarp = snapshot.runtime.dynamicWarp ? { ...snapshot.runtime.dynamicWarp } : null;
  }
  if (snapshot.runtime.fameChecker) {
    runtime.fameChecker = cloneFameChecker(snapshot.runtime.fameChecker);
  }
  if (snapshot.runtime.fieldAudio) {
    runtime.fieldAudio.currentMapMusic = snapshot.runtime.fieldAudio.currentMapMusic;
    runtime.fieldAudio.nextMapMusic = snapshot.runtime.fieldAudio.nextMapMusic;
    runtime.fieldAudio.savedMusic = snapshot.runtime.fieldAudio.savedMusic;
    runtime.fieldAudio.defaultMapMusic = snapshot.runtime.fieldAudio.defaultMapMusic;
    runtime.fieldAudio.mapMusicState = snapshot.runtime.fieldAudio.mapMusicState;
  }
  runtime.vars.playTimeSeconds = (runtime.playTime.hours * 3600) + (runtime.playTime.minutes * 60) + runtime.playTime.seconds;
  runtime.vars.playTimeMinutes = (runtime.playTime.hours * 60) + runtime.playTime.minutes;
  runtime.saveCounter = snapshot.saveIndex;
  return true;
};
