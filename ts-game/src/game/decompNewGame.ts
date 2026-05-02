import { createBagState, type BagSlot } from './bag';
import { DEFAULT_COINS, setCoins } from './decompCoins';
import {
  createEventObjectLockState,
  type EventObjectLockState
} from './decompEventObjectLock';
import {
  createFieldPaletteFadeState,
  type FieldPaletteFadeState
} from './decompFieldPaletteFade';
import {
  createFieldAudioState,
  type FieldAudioState
} from './decompFieldSound';
import { DEFAULT_MONEY, setMoney } from './decompMoney';
import { createPcScreenEffectState, type PcScreenEffectState } from './decompPcScreenEffect';
import {
  createPlayTimeCounter,
  startPlayTimeCounter,
  type PlayTimeCounter
} from './decompPlayTime';
import { setUnlockedPokedexFlags } from './decompSaveLocation';
import type { FieldPokemon, PokedexState } from './pokemonStorage';

export interface PcStorageStateLike {
  currentBox: number;
  boxNames: string[];
  boxes: FieldPokemon[][];
}

export interface DecompMailSlot {
  words: number[];
  playerName: string;
  trainerId: number;
  species: string | number;
  itemId: string | null;
}

export interface DecompNewGameState {
  differentSaveFile: boolean;
  unkFlag1: boolean;
  unkFlag2: boolean;
  pcItems: BagSlot[];
  mail: DecompMailSlot[];
  battleTowerCleared: boolean;
  trainerTowerResultsCleared: boolean;
  berryPowderAmount: number;
  berryPickingResultsCleared: boolean;
  pokemonJumpResultsCleared: boolean;
  mysteryGiftCleared: boolean;
  renewableItemFlagsInitialized: boolean;
  easyChatInitialized: boolean;
  trainerFanClubCleared: boolean;
  unionRoomRegisteredTextsInitialized: boolean;
  fameCheckerCleared: boolean;
  enigmaBerriesCleared: boolean;
  roamerCleared: boolean;
}

export interface NewGameRuntimeState {
  vars: Record<string, number>;
  stringVars: Record<string, string>;
  flags: Set<string>;
  consumedTriggerIds: Set<string>;
  saveCounter: number;
  lastScriptId: string | null;
  startMenu: {
    mode: 'normal' | 'safari' | 'link' | 'unionRoom';
    playerName: string;
    playerGender: 'male' | 'female';
    hasPokedex: boolean;
    hasPokemon: boolean;
    seenPokemonCount: number;
  };
  options: {
    textSpeed: 'slow' | 'mid' | 'fast';
    battleScene: boolean;
    battleStyle: 'shift' | 'set';
    sound: 'mono' | 'stereo';
    buttonMode: 'help' | 'lr' | 'lEqualsA';
    frameType: number;
  };
  specialSaveWarpFlags: number;
  gcnLinkFlags: number;
  playTime: PlayTimeCounter;
  party: FieldPokemon[];
  pokedex: PokedexState;
  bag: ReturnType<typeof createBagState>;
  pcStorage: PcStorageStateLike;
  pendingTrainerBattle: unknown;
  pcScreenEffect: PcScreenEffectState;
  eventObjectLock: EventObjectLockState;
  fieldPaletteFade: FieldPaletteFadeState;
  fieldAudio: FieldAudioState;
  doorAnimations: Record<string, 'open' | 'closed'>;
  doorAnimationTask: {
    active: boolean;
    framesRemaining: number;
    key: string | null;
  };
  fameChecker: {
    pickStates: Record<number, number>;
    flavorTextFlags: Record<number, number>;
    updates: Array<{
      person: number;
      value: number;
      special: string | null;
    }>;
  };
  newGame: DecompNewGameState;
}

export interface NewGameStartWarp {
  mapId: string;
  x: number;
  y: number;
}

export interface NewGameStartResult<MapT extends { id: string; tileSize: number }> {
  map: MapT;
  warp: NewGameStartWarp;
}

export interface StartNewGameOptions {
  generatedTrainerIdLower: number;
  randomHigh16: number;
}

const MAIL_COUNT = 16;
const MAIL_WORDS_COUNT = 9;
const BULBASAUR_SPECIES = 'SPECIES_BULBASAUR';

export const PLAYERS_ROOM_WARP: NewGameStartWarp = {
  mapId: 'MAP_PALLET_TOWN_PLAYERS_HOUSE_2F',
  x: 6,
  y: 6
};

export const createDefaultPcStorageState = (): PcStorageStateLike => ({
  currentBox: 0,
  boxNames: Array.from({ length: 14 }, (_, index) => `BOX ${index + 1}`),
  boxes: Array.from({ length: 14 }, () => [])
});

export const createBlankPokedexState = (): PokedexState => ({
  dexMode: 'KANTO',
  selectedIndex: 0,
  orderListCursorPos: 0,
  orderListItemsAbove: 0,
  seenSpecies: [],
  caughtSpecies: []
});

export const setTrainerId = (trainerId: number): [number, number, number, number] => {
  const value = Math.trunc(trainerId) >>> 0;
  return [
    value & 0xff,
    (value >>> 8) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 24) & 0xff
  ];
};

export const copyTrainerId = (source: readonly number[]): [number, number, number, number] => [
  Math.trunc(source[0] ?? 0) & 0xff,
  Math.trunc(source[1] ?? 0) & 0xff,
  Math.trunc(source[2] ?? 0) & 0xff,
  Math.trunc(source[3] ?? 0) & 0xff
];

export const packTrainerId = (source: readonly number[]): number =>
  (
    (Math.trunc(source[0] ?? 0) & 0xff)
    | ((Math.trunc(source[1] ?? 0) & 0xff) << 8)
    | ((Math.trunc(source[2] ?? 0) & 0xff) << 16)
    | ((Math.trunc(source[3] ?? 0) & 0xff) << 24)
  ) >>> 0;

export const createClearedMailSlot = (): DecompMailSlot => ({
  words: Array.from({ length: MAIL_WORDS_COUNT }, () => 0xffff),
  playerName: '',
  trainerId: 0,
  species: BULBASAUR_SPECIES,
  itemId: null
});

export const createClearedMailData = (): DecompMailSlot[] =>
  Array.from({ length: MAIL_COUNT }, () => createClearedMailSlot());

export const createNewGamePcItems = (): BagSlot[] => [
  { itemId: 'ITEM_POTION', quantity: 1 }
];

export const createDefaultNewGameState = (): DecompNewGameState => ({
  differentSaveFile: false,
  unkFlag1: false,
  unkFlag2: false,
  pcItems: [],
  mail: createClearedMailData(),
  battleTowerCleared: false,
  trainerTowerResultsCleared: false,
  berryPowderAmount: 0,
  berryPickingResultsCleared: false,
  pokemonJumpResultsCleared: false,
  mysteryGiftCleared: false,
  renewableItemFlagsInitialized: false,
  easyChatInitialized: false,
  trainerFanClubCleared: false,
  unionRoomRegisteredTextsInitialized: false,
  fameCheckerCleared: false,
  enigmaBerriesCleared: false,
  roamerCleared: false
});

export const cloneDecompNewGameState = (state: DecompNewGameState): DecompNewGameState => ({
  ...state,
  pcItems: state.pcItems.map((slot) => ({ ...slot })),
  mail: state.mail.map((slot) => ({
    ...slot,
    words: [...slot.words]
  }))
});

const applyTrainerIdToRuntime = (runtime: NewGameRuntimeState, trainerId: number): void => {
  const value = Math.trunc(trainerId) >>> 0;
  runtime.vars.playerTrainerId = value;
  runtime.vars.trainerId = value & 0xffff;
};

export const setDefaultOptions = (runtime: NewGameRuntimeState): void => {
  runtime.options.textSpeed = 'mid';
  runtime.options.frameType = 0;
  runtime.options.sound = 'mono';
  runtime.options.battleStyle = 'shift';
  runtime.options.battleScene = true;
  runtime.options.buttonMode = 'help';
};

export const clearPokedexFlags = (runtime: NewGameRuntimeState): void => {
  runtime.pokedex = createBlankPokedexState();
};

export const newGameInitData = (
  runtime: NewGameRuntimeState,
  { generatedTrainerIdLower, randomHigh16 }: StartNewGameOptions
): NewGameStartWarp => {
  const preservedRivalName = runtime.stringVars.rivalName ?? '';
  const preservedPlayerName = runtime.startMenu.playerName;
  const preservedPlayerGender = runtime.startMenu.playerGender;
  const trainerId = (
    ((Math.trunc(randomHigh16) & 0xffff) << 16)
    | (Math.trunc(generatedTrainerIdLower) & 0xffff)
  ) >>> 0;

  runtime.vars = {};
  runtime.stringVars = {
    STR_VAR_1: '',
    STR_VAR_2: '',
    STR_VAR_3: '',
    STR_VAR_4: '',
    rivalName: preservedRivalName
  };
  runtime.flags = new Set<string>([
    'FLAG_HIDE_OAK_IN_PALLET_TOWN',
    'FLAG_HIDE_OAK_IN_HIS_LAB',
    'FLAG_HIDE_POKEDEX'
  ]);
  runtime.consumedTriggerIds = new Set<string>();
  runtime.saveCounter = 0;
  runtime.lastScriptId = null;
  runtime.startMenu = {
    mode: 'normal',
    playerName: preservedPlayerName,
    playerGender: preservedPlayerGender,
    hasPokedex: false,
    hasPokemon: false,
    seenPokemonCount: 0
  };
  setDefaultOptions(runtime);
  runtime.specialSaveWarpFlags = 0;
  runtime.gcnLinkFlags = 0;
  runtime.party = [];
  clearPokedexFlags(runtime);
  runtime.bag = createBagState();
  runtime.pcStorage = createDefaultPcStorageState();
  runtime.pendingTrainerBattle = null;
  runtime.pcScreenEffect = createPcScreenEffectState();
  runtime.eventObjectLock = createEventObjectLockState();
  runtime.fieldPaletteFade = createFieldPaletteFadeState();
  runtime.fieldAudio = createFieldAudioState();
  runtime.doorAnimations = {};
  runtime.doorAnimationTask = {
    active: false,
    framesRemaining: 0,
    key: null
  };
  runtime.fameChecker = {
    pickStates: { 0: 2 },
    flavorTextFlags: {},
    updates: []
  };
  runtime.newGame = createDefaultNewGameState();
  runtime.newGame.differentSaveFile = true;
  runtime.newGame.unkFlag1 = true;
  runtime.newGame.unkFlag2 = false;
  runtime.newGame.pcItems = createNewGamePcItems();
  runtime.newGame.mail = createClearedMailData();
  runtime.newGame.battleTowerCleared = true;
  runtime.newGame.trainerTowerResultsCleared = true;
  runtime.newGame.berryPowderAmount = 0;
  runtime.newGame.berryPickingResultsCleared = true;
  runtime.newGame.pokemonJumpResultsCleared = true;
  runtime.newGame.mysteryGiftCleared = true;
  runtime.newGame.renewableItemFlagsInitialized = true;
  runtime.newGame.easyChatInitialized = true;
  runtime.newGame.trainerFanClubCleared = true;
  runtime.newGame.unionRoomRegisteredTextsInitialized = true;
  runtime.newGame.fameCheckerCleared = true;
  runtime.newGame.enigmaBerriesCleared = true;
  runtime.newGame.roamerCleared = true;

  runtime.vars.encryptionKey = 0;
  runtime.vars.moneyEncryptionKey = 0;
  runtime.vars.coinsEncryptionKey = 0;
  runtime.vars.unkFlag1 = 1;
  runtime.vars.unkFlag2 = 0;
  applyTrainerIdToRuntime(runtime, trainerId);

  runtime.playTime = createPlayTimeCounter();
  startPlayTimeCounter(runtime.playTime);
  runtime.vars.playTimeSeconds = 0;
  runtime.vars.playTimeMinutes = 0;

  setMoney(runtime, DEFAULT_MONEY);
  setCoins(runtime, DEFAULT_COINS);
  setUnlockedPokedexFlags(runtime);
  return PLAYERS_ROOM_WARP;
};

export const startNewGame = <MapT extends { id: string; tileSize: number }>(
  runtime: NewGameRuntimeState,
  player: {
    position: { x: number; y: number };
    facing: 'up' | 'down' | 'left' | 'right';
  },
  loadMapById: (mapId: string) => MapT | null,
  options: StartNewGameOptions
): NewGameStartResult<MapT> | null => {
  const warp = newGameInitData(runtime, options);
  const map = loadMapById(warp.mapId);
  if (!map) {
    return null;
  }

  player.position.x = warp.x * map.tileSize;
  player.position.y = warp.y * map.tileSize;
  player.facing = 'down';
  return { map, warp };
};

export function SetTrainerId(trainerId: number): [number, number, number, number] {
  return setTrainerId(trainerId);
}

export function CopyTrainerId(source: readonly number[]): [number, number, number, number] {
  return copyTrainerId(source);
}

export function InitPlayerTrainerId(
  runtime: NewGameRuntimeState,
  { generatedTrainerIdLower, randomHigh16 }: StartNewGameOptions
): [number, number, number, number] {
  const trainerId = (
    ((Math.trunc(randomHigh16) & 0xffff) << 16)
    | (Math.trunc(generatedTrainerIdLower) & 0xffff)
  ) >>> 0;
  applyTrainerIdToRuntime(runtime, trainerId);
  return setTrainerId(trainerId);
}

export function SetDefaultOptions(runtime: NewGameRuntimeState): void {
  setDefaultOptions(runtime);
}

export function ClearPokedexFlags(runtime: NewGameRuntimeState): void {
  clearPokedexFlags(runtime);
}

export function ClearBattleTower(runtime: NewGameRuntimeState): void {
  runtime.newGame.battleTowerCleared = true;
}

export function WarpToPlayersRoom(): NewGameStartWarp {
  return PLAYERS_ROOM_WARP;
}

export function Sav2_ClearSetDefault(runtime: NewGameRuntimeState): void {
  runtime.newGame = createDefaultNewGameState();
  setDefaultOptions(runtime);
}

export function ResetMenuAndMonGlobals(runtime: NewGameRuntimeState): void {
  runtime.newGame.differentSaveFile = false;
  runtime.party = [];
  runtime.pendingTrainerBattle = null;
  runtime.bag = createBagState();
  runtime.vars.specialVarResult = 0;
}

export function NewGameInitData(
  runtime: NewGameRuntimeState,
  options: StartNewGameOptions
): NewGameStartWarp {
  return newGameInitData(runtime, options);
}

export function ResetMiniGamesResults(runtime: NewGameRuntimeState): void {
  runtime.newGame.berryPowderAmount = 0;
  runtime.newGame.berryPickingResultsCleared = true;
  runtime.newGame.pokemonJumpResultsCleared = true;
}
