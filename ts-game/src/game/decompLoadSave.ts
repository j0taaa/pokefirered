export const SAVEBLOCK_MOVE_RANGE = 128;
export const BAG_ITEMS_COUNT = 42;
export const BAG_KEYITEMS_COUNT = 30;
export const BAG_POKEBALLS_COUNT = 13;
export const BAG_TMHM_COUNT = 58;
export const BAG_BERRIES_COUNT = 43;
export const PARTY_SIZE = 6;
export const MAIL_COUNT = PARTY_SIZE + 10;
export const OBJECT_EVENTS_COUNT = 16;
export const NUM_TOWER_CHALLENGE_TYPES = 4;
export const CONTINUE_GAME_WARP = 1 << 0;

export interface ItemSlot {
  itemId: number;
  quantity: number;
}

export interface SaveBlock2 {
  encryptionKey: number;
  specialSaveWarpFlags: number;
}

export interface SaveBlock1 {
  playerPartyCount: number;
  playerParty: unknown[];
  objectEvents: unknown[];
  bagPocketItems: ItemSlot[];
  bagPocketKeyItems: ItemSlot[];
  bagPocketPokeBalls: ItemSlot[];
  bagPocketTMHM: ItemSlot[];
  bagPocketBerries: ItemSlot[];
  mail: unknown[];
  trainerTower: { bestTime: number }[];
  money: number;
  coins: number;
}

export interface PokemonStorage {
  boxes: unknown[];
}

export interface LoadedSaveData {
  items: ItemSlot[];
  keyItems: ItemSlot[];
  pokeBalls: ItemSlot[];
  TMsHMs: ItemSlot[];
  berries: ItemSlot[];
  mail: unknown[];
}

export interface LoadSaveRuntime {
  saveBlock2: SaveBlock2;
  saveBlock1: SaveBlock1;
  pokemonStorage: PokemonStorage;
  loadedSaveData: LoadedSaveData;
  lastEncryptionKey: number;
  flashMemoryPresent: boolean;
  saveBlock1Offset: number | null;
  saveBlock2Offset: number | null;
  pokemonStorageOffset: number | null;
  playerParty: unknown[];
  playerPartyCount: number;
  objectEvents: unknown[];
  randomValues: number[];
  vblankCallback: string | null;
  hblankCallback: string | null;
  vblankCounter1: string | null;
  heapResetCount: number;
  bagPointersSet: number;
  qlASLROffsets: (number | null)[];
  dynamicWarpSetCalls: number[];
  encryptionApplied: number[];
  bagItemEncryptionApplied: number[];
  berryPowderEncryptionApplied: number[];
  gameStatsEncryptionApplied: number[];
  flashIdentifyResult: number;
  flashTimerInits: number;
}

const emptyItem = (): ItemSlot => ({ itemId: 0, quantity: 0 });

const itemArray = (count: number): ItemSlot[] => Array.from({ length: count }, () => emptyItem());

const deepClone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export const createLoadSaveRuntime = (): LoadSaveRuntime => ({
  saveBlock2: { encryptionKey: 0, specialSaveWarpFlags: 0 },
  saveBlock1: {
    playerPartyCount: 0,
    playerParty: Array.from({ length: PARTY_SIZE }, () => null),
    objectEvents: Array.from({ length: OBJECT_EVENTS_COUNT }, () => null),
    bagPocketItems: itemArray(BAG_ITEMS_COUNT),
    bagPocketKeyItems: itemArray(BAG_KEYITEMS_COUNT),
    bagPocketPokeBalls: itemArray(BAG_POKEBALLS_COUNT),
    bagPocketTMHM: itemArray(BAG_TMHM_COUNT),
    bagPocketBerries: itemArray(BAG_BERRIES_COUNT),
    mail: Array.from({ length: MAIL_COUNT }, () => null),
    trainerTower: Array.from({ length: NUM_TOWER_CHALLENGE_TYPES }, () => ({ bestTime: 0 })),
    money: 0,
    coins: 0
  },
  pokemonStorage: { boxes: [] },
  loadedSaveData: {
    items: itemArray(BAG_ITEMS_COUNT),
    keyItems: itemArray(BAG_KEYITEMS_COUNT),
    pokeBalls: itemArray(BAG_POKEBALLS_COUNT),
    TMsHMs: itemArray(BAG_TMHM_COUNT),
    berries: itemArray(BAG_BERRIES_COUNT),
    mail: Array.from({ length: MAIL_COUNT }, () => null)
  },
  lastEncryptionKey: 0,
  flashMemoryPresent: false,
  saveBlock1Offset: null,
  saveBlock2Offset: null,
  pokemonStorageOffset: null,
  playerParty: Array.from({ length: PARTY_SIZE }, () => null),
  playerPartyCount: 0,
  objectEvents: Array.from({ length: OBJECT_EVENTS_COUNT }, () => null),
  randomValues: [],
  vblankCallback: null,
  hblankCallback: null,
  vblankCounter1: null,
  heapResetCount: 0,
  bagPointersSet: 0,
  qlASLROffsets: [],
  dynamicWarpSetCalls: [],
  encryptionApplied: [],
  bagItemEncryptionApplied: [],
  berryPowderEncryptionApplied: [],
  gameStatsEncryptionApplied: [],
  flashIdentifyResult: 1,
  flashTimerInits: 0
});

const nextRandom = (runtime: LoadSaveRuntime): number => runtime.randomValues.shift() ?? 0;

export const checkForFlashMemory = (runtime: LoadSaveRuntime): void => {
  if (!runtime.flashIdentifyResult) {
    runtime.flashMemoryPresent = true;
    runtime.flashTimerInits += 1;
  } else {
    runtime.flashMemoryPresent = false;
  }
};

export const clearSav2 = (runtime: LoadSaveRuntime): void => {
  runtime.saveBlock2 = { encryptionKey: 0, specialSaveWarpFlags: 0 };
};

export const clearSav1 = (runtime: LoadSaveRuntime): void => {
  runtime.saveBlock1 = createLoadSaveRuntime().saveBlock1;
};

export const setSaveBlocksPointers = (runtime: LoadSaveRuntime): void => {
  const oldSave = runtime.saveBlock1Offset;
  const offset = nextRandom(runtime) & ((SAVEBLOCK_MOVE_RANGE - 1) & ~3);
  runtime.saveBlock2Offset = offset;
  runtime.saveBlock1Offset = offset;
  runtime.pokemonStorageOffset = offset;
  runtime.bagPointersSet += 1;
  runtime.qlASLROffsets.push(oldSave);
};

export const applyNewEncryptionKeyToHword = (
  runtime: LoadSaveRuntime,
  holder: { value: number },
  newKey: number
): void => {
  holder.value = ((holder.value & 0xffff) ^ runtime.saveBlock2.encryptionKey ^ newKey) & 0xffff;
};

export const applyNewEncryptionKeyToWord = (
  runtime: LoadSaveRuntime,
  holder: { value: number },
  newKey: number
): void => {
  holder.value = (holder.value ^ runtime.saveBlock2.encryptionKey ^ newKey) >>> 0;
};

export const applyNewEncryptionKeyToAllEncryptedData = (
  runtime: LoadSaveRuntime,
  encryptionKey: number
): void => {
  for (let i = 0; i < NUM_TOWER_CHALLENGE_TYPES; i += 1) {
    const holder = { value: runtime.saveBlock1.trainerTower[i].bestTime };
    applyNewEncryptionKeyToWord(runtime, holder, encryptionKey);
    runtime.saveBlock1.trainerTower[i].bestTime = holder.value;
  }
  runtime.gameStatsEncryptionApplied.push(encryptionKey >>> 0);
  runtime.bagItemEncryptionApplied.push(encryptionKey >>> 0);
  runtime.berryPowderEncryptionApplied.push(encryptionKey >>> 0);
  const money = { value: runtime.saveBlock1.money };
  applyNewEncryptionKeyToWord(runtime, money, encryptionKey);
  runtime.saveBlock1.money = money.value;
  const coins = { value: runtime.saveBlock1.coins };
  applyNewEncryptionKeyToHword(runtime, coins, encryptionKey);
  runtime.saveBlock1.coins = coins.value;
  runtime.encryptionApplied.push(encryptionKey >>> 0);
};

export const moveSaveBlocksResetHeap = (runtime: LoadSaveRuntime): void => {
  const vblankCB = runtime.vblankCallback;
  const hblankCB = runtime.hblankCallback;
  runtime.vblankCallback = null;
  runtime.hblankCallback = null;
  runtime.vblankCounter1 = null;

  const saveBlock2Copy = deepClone(runtime.saveBlock2);
  const saveBlock1Copy = deepClone(runtime.saveBlock1);
  const pokemonStorageCopy = deepClone(runtime.pokemonStorage);

  setSaveBlocksPointers(runtime);

  runtime.saveBlock2 = saveBlock2Copy;
  runtime.saveBlock1 = saveBlock1Copy;
  runtime.pokemonStorage = pokemonStorageCopy;
  runtime.heapResetCount += 1;

  runtime.hblankCallback = hblankCB;
  runtime.vblankCallback = vblankCB;

  const encryptionKey = (((nextRandom(runtime) << 0x10) >>> 0) + nextRandom(runtime)) >>> 0;
  applyNewEncryptionKeyToAllEncryptedData(runtime, encryptionKey);
  runtime.saveBlock2.encryptionKey = encryptionKey;
};

export const useContinueGameWarp = (runtime: LoadSaveRuntime): number =>
  runtime.saveBlock2.specialSaveWarpFlags & CONTINUE_GAME_WARP;

export const clearContinueGameWarpStatus = (runtime: LoadSaveRuntime): void => {
  runtime.saveBlock2.specialSaveWarpFlags &= ~CONTINUE_GAME_WARP;
};

export const setContinueGameWarpStatus = (runtime: LoadSaveRuntime): void => {
  runtime.saveBlock2.specialSaveWarpFlags |= CONTINUE_GAME_WARP;
};

export const setContinueGameWarpStatusToDynamicWarp = (runtime: LoadSaveRuntime): void => {
  runtime.dynamicWarpSetCalls.push(0);
  runtime.saveBlock2.specialSaveWarpFlags |= CONTINUE_GAME_WARP;
};

export const clearContinueGameWarpStatus2 = clearContinueGameWarpStatus;

export const savePlayerParty = (runtime: LoadSaveRuntime): void => {
  runtime.saveBlock1.playerPartyCount = runtime.playerPartyCount;
  for (let i = 0; i < PARTY_SIZE; i += 1) {
    runtime.saveBlock1.playerParty[i] = deepClone(runtime.playerParty[i]);
  }
};

export const loadPlayerParty = (runtime: LoadSaveRuntime): void => {
  runtime.playerPartyCount = runtime.saveBlock1.playerPartyCount;
  for (let i = 0; i < PARTY_SIZE; i += 1) {
    runtime.playerParty[i] = deepClone(runtime.saveBlock1.playerParty[i]);
  }
};

export const saveObjectEvents = (runtime: LoadSaveRuntime): void => {
  for (let i = 0; i < OBJECT_EVENTS_COUNT; i += 1) {
    runtime.saveBlock1.objectEvents[i] = deepClone(runtime.objectEvents[i]);
  }
};

export const loadObjectEvents = (runtime: LoadSaveRuntime): void => {
  for (let i = 0; i < OBJECT_EVENTS_COUNT; i += 1) {
    runtime.objectEvents[i] = deepClone(runtime.saveBlock1.objectEvents[i]);
  }
};

export const saveSerializedGame = (runtime: LoadSaveRuntime): void => {
  savePlayerParty(runtime);
  saveObjectEvents(runtime);
};

export const loadSerializedGame = (runtime: LoadSaveRuntime): void => {
  loadPlayerParty(runtime);
  loadObjectEvents(runtime);
};

export const loadPlayerBag = (runtime: LoadSaveRuntime): void => {
  runtime.loadedSaveData.items = deepClone(runtime.saveBlock1.bagPocketItems);
  runtime.loadedSaveData.keyItems = deepClone(runtime.saveBlock1.bagPocketKeyItems);
  runtime.loadedSaveData.pokeBalls = deepClone(runtime.saveBlock1.bagPocketPokeBalls);
  runtime.loadedSaveData.TMsHMs = deepClone(runtime.saveBlock1.bagPocketTMHM);
  runtime.loadedSaveData.berries = deepClone(runtime.saveBlock1.bagPocketBerries);
  runtime.loadedSaveData.mail = deepClone(runtime.saveBlock1.mail);
  runtime.lastEncryptionKey = runtime.saveBlock2.encryptionKey;
};

export const savePlayerBag = (runtime: LoadSaveRuntime): void => {
  runtime.saveBlock1.bagPocketItems = deepClone(runtime.loadedSaveData.items);
  runtime.saveBlock1.bagPocketKeyItems = deepClone(runtime.loadedSaveData.keyItems);
  runtime.saveBlock1.bagPocketPokeBalls = deepClone(runtime.loadedSaveData.pokeBalls);
  runtime.saveBlock1.bagPocketTMHM = deepClone(runtime.loadedSaveData.TMsHMs);
  runtime.saveBlock1.bagPocketBerries = deepClone(runtime.loadedSaveData.berries);
  runtime.saveBlock1.mail = deepClone(runtime.loadedSaveData.mail);

  const encryptionKeyBackup = runtime.saveBlock2.encryptionKey;
  runtime.saveBlock2.encryptionKey = runtime.lastEncryptionKey;
  runtime.bagItemEncryptionApplied.push(encryptionKeyBackup >>> 0);
  runtime.saveBlock2.encryptionKey = encryptionKeyBackup;
};

export const CheckForFlashMemory = checkForFlashMemory;
export const ClearSav2 = clearSav2;
export const ClearSav1 = clearSav1;
export const SetSaveBlocksPointers = setSaveBlocksPointers;
export const MoveSaveBlocks_ResetHeap = moveSaveBlocksResetHeap;
export const UseContinueGameWarp = useContinueGameWarp;
export const ClearContinueGameWarpStatus = clearContinueGameWarpStatus;
export const SetContinueGameWarpStatus = setContinueGameWarpStatus;
export const SetContinueGameWarpStatusToDynamicWarp = setContinueGameWarpStatusToDynamicWarp;
export const ClearContinueGameWarpStatus2 = clearContinueGameWarpStatus2;
export const SavePlayerParty = savePlayerParty;
export const LoadPlayerParty = loadPlayerParty;
export const SaveObjectEvents = saveObjectEvents;
export const LoadObjectEvents = loadObjectEvents;
export const SaveSerializedGame = saveSerializedGame;
export const LoadSerializedGame = loadSerializedGame;
export const LoadPlayerBag = loadPlayerBag;
export const SavePlayerBag = savePlayerBag;
export const ApplyNewEncryptionKeyToHword = applyNewEncryptionKeyToHword;
export const ApplyNewEncryptionKeyToWord = applyNewEncryptionKeyToWord;
export const ApplyNewEncryptionKeyToAllEncryptedData = applyNewEncryptionKeyToAllEncryptedData;
