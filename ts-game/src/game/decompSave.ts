export const SECTOR_DATA_SIZE = 3968;
export const SECTOR_FOOTER_SIZE = 128;
export const SECTOR_SIZE = SECTOR_DATA_SIZE + SECTOR_FOOTER_SIZE;

export const NUM_SAVE_SLOTS = 2;
export const SECTOR_SIGNATURE = 0x08012025;
export const SPECIAL_SECTOR_SENTINEL = 0xb39d;

export const SECTOR_ID_SAVEBLOCK2 = 0;
export const SECTOR_ID_SAVEBLOCK1_START = 1;
export const SECTOR_ID_SAVEBLOCK1_END = 4;
export const SECTOR_ID_PKMN_STORAGE_START = 5;
export const SECTOR_ID_PKMN_STORAGE_END = 13;
export const NUM_SECTORS_PER_SLOT = 14;
export const SECTOR_ID_HOF_1 = 28;
export const SECTOR_ID_HOF_2 = 29;
export const SECTOR_ID_TRAINER_TOWER_1 = 30;
export const SECTOR_ID_TRAINER_TOWER_2 = 31;
export const SECTORS_COUNT = 32;

export const SAVE_STATUS_EMPTY = 0;
export const SAVE_STATUS_OK = 1;
export const SAVE_STATUS_INVALID = 2;
export const SAVE_STATUS_NO_FLASH = 4;
export const SAVE_STATUS_ERROR = 0xff;

export const FULL_SAVE_SLOT = 0xffff;

export const SAVE_NORMAL = 0;
export const SAVE_LINK = 1;
export const SAVE_EREADER = 2;
export const SAVE_HALL_OF_FAME = 3;
export const SAVE_OVERWRITE_DIFFERENT_FILE = 4;
export const SAVE_HALL_OF_FAME_ERASE_BEFORE = 5;

export const ENABLE = 0;
export const DISABLE = 1;
export const CHECK = 2;

export const SECTOR_ID_OFFSET = SECTOR_DATA_SIZE + (SECTOR_FOOTER_SIZE - 12);
export const SECTOR_CHECKSUM_OFFSET = SECTOR_ID_OFFSET + 2;
export const SECTOR_SIGNATURE_OFFSET = SECTOR_CHECKSUM_OFFSET + 2;
export const SECTOR_COUNTER_OFFSET = SECTOR_SIGNATURE_OFFSET + 4;

export interface SaveSectorLocation {
  data: Uint8Array;
  size: number;
  offset?: number;
}

export interface SaveTask {
  data: number[];
  isActive: boolean;
}

export interface DecompSaveRuntime {
  flash: Uint8Array[];
  failedProgramSectors: Set<number>;
  failedProgramBytes: Set<string>;
  erasedSectors: number[];
  operations: string[];
  gLastWrittenSector: number;
  gLastSaveCounter: number;
  gLastKnownGoodSector: number;
  gDamagedSaveSectors: number;
  gSaveCounter: number;
  gSaveDataBuffer: Uint8Array;
  gIncrementalSectorId: number;
  gSaveUnusedVar: number;
  gSaveFileStatus: number;
  gGameContinueCallback: string | null;
  gRamSaveSectorLocations: SaveSectorLocation[];
  gSaveAttemptStatus: number;
  gFlashMemoryPresent: boolean;
  gDecompressionBuffer: Uint8Array;
  gMain: { vblankCounter1: unknown };
  gSoftResetDisabled: boolean;
  tasks: SaveTask[];
  saveBlock2: Uint8Array;
  saveBlock1: Uint8Array;
  pokemonStorage: Uint8Array;
  gameStats: Map<number, number>;
  linkTaskFinished: boolean;
  serializedGameCount: number;
  loadedSerializedGameCount: number;
  finishSaveCount: number;
}

const u16 = (value: number): number => value & 0xffff;
const u32 = (value: number): number => value >>> 0;

const readU16 = (bytes: Uint8Array, offset: number): number =>
  (bytes[offset] ?? 0) | ((bytes[offset + 1] ?? 0) << 8);

const writeU16 = (bytes: Uint8Array, offset: number, value: number): void => {
  bytes[offset] = value & 0xff;
  bytes[offset + 1] = (value >>> 8) & 0xff;
};

const readU32 = (bytes: Uint8Array, offset: number): number =>
  u32((bytes[offset] ?? 0) | ((bytes[offset + 1] ?? 0) << 8) | ((bytes[offset + 2] ?? 0) << 16) | ((bytes[offset + 3] ?? 0) << 24));

const writeU32 = (bytes: Uint8Array, offset: number, value: number): void => {
  bytes[offset] = value & 0xff;
  bytes[offset + 1] = (value >>> 8) & 0xff;
  bytes[offset + 2] = (value >>> 16) & 0xff;
  bytes[offset + 3] = (value >>> 24) & 0xff;
};

const makeFlash = (): Uint8Array[] =>
  Array.from({ length: SECTORS_COUNT }, () => new Uint8Array(SECTOR_SIZE).fill(0xff));

export const createDecompSaveRuntime = (overrides: Partial<DecompSaveRuntime> = {}): DecompSaveRuntime => ({
  flash: overrides.flash ?? makeFlash(),
  failedProgramSectors: overrides.failedProgramSectors ?? new Set<number>(),
  failedProgramBytes: overrides.failedProgramBytes ?? new Set<string>(),
  erasedSectors: overrides.erasedSectors ?? [],
  operations: overrides.operations ?? [],
  gLastWrittenSector: overrides.gLastWrittenSector ?? 0,
  gLastSaveCounter: overrides.gLastSaveCounter ?? 0,
  gLastKnownGoodSector: overrides.gLastKnownGoodSector ?? 0,
  gDamagedSaveSectors: overrides.gDamagedSaveSectors ?? 0,
  gSaveCounter: overrides.gSaveCounter ?? 0,
  gSaveDataBuffer: overrides.gSaveDataBuffer ?? new Uint8Array(SECTOR_SIZE),
  gIncrementalSectorId: overrides.gIncrementalSectorId ?? 0,
  gSaveUnusedVar: overrides.gSaveUnusedVar ?? 0,
  gSaveFileStatus: overrides.gSaveFileStatus ?? 0,
  gGameContinueCallback: overrides.gGameContinueCallback ?? null,
  gRamSaveSectorLocations: overrides.gRamSaveSectorLocations ?? [],
  gSaveAttemptStatus: overrides.gSaveAttemptStatus ?? 0,
  gFlashMemoryPresent: overrides.gFlashMemoryPresent ?? true,
  gDecompressionBuffer: overrides.gDecompressionBuffer ?? new Uint8Array(SECTOR_DATA_SIZE * 2),
  gMain: overrides.gMain ?? { vblankCounter1: {} },
  gSoftResetDisabled: overrides.gSoftResetDisabled ?? false,
  tasks: overrides.tasks ?? [],
  saveBlock2: overrides.saveBlock2 ?? new Uint8Array(SECTOR_DATA_SIZE),
  saveBlock1: overrides.saveBlock1 ?? new Uint8Array(SECTOR_DATA_SIZE * 4),
  pokemonStorage: overrides.pokemonStorage ?? new Uint8Array(SECTOR_DATA_SIZE * 9),
  gameStats: overrides.gameStats ?? new Map<number, number>(),
  linkTaskFinished: overrides.linkTaskFinished ?? true,
  serializedGameCount: overrides.serializedGameCount ?? 0,
  loadedSerializedGameCount: overrides.loadedSerializedGameCount ?? 0,
  finishSaveCount: overrides.finishSaveCount ?? 0
});

const log = (runtime: DecompSaveRuntime, op: string): void => {
  runtime.operations.push(op);
};

export const ClearSaveData = (runtime: DecompSaveRuntime): void => {
  for (let i = 0; i < SECTORS_COUNT; i++) EraseFlashSector(runtime, i);
};

export const Save_ResetSaveCounters = (runtime: DecompSaveRuntime): void => {
  runtime.gSaveCounter = 0;
  runtime.gLastWrittenSector = 0;
  runtime.gDamagedSaveSectors = 0;
};

export const SetDamagedSectorBits = (runtime: DecompSaveRuntime, op: number, sectorNum: number): boolean => {
  let retVal = false;
  switch (op) {
    case ENABLE:
      runtime.gDamagedSaveSectors = u32(runtime.gDamagedSaveSectors | (1 << sectorNum));
      break;
    case DISABLE:
      runtime.gDamagedSaveSectors = u32(runtime.gDamagedSaveSectors & ~(1 << sectorNum));
      break;
    case CHECK:
      if (runtime.gDamagedSaveSectors & (1 << sectorNum)) retVal = true;
      break;
  }
  return retVal;
};

export const CalculateChecksum = (data: ArrayLike<number>, size: number): number => {
  let checksum = 0;
  for (let i = 0; i < Math.trunc(size / 4); i++) {
    const offset = i * 4;
    checksum = u32(checksum + readU32(data as Uint8Array, offset));
  }
  return u16((checksum >>> 16) + checksum);
};

const sectorId = (sector: Uint8Array): number => readU16(sector, SECTOR_ID_OFFSET);
const sectorChecksum = (sector: Uint8Array): number => readU16(sector, SECTOR_CHECKSUM_OFFSET);
const sectorSignature = (sector: Uint8Array): number => readU32(sector, SECTOR_SIGNATURE_OFFSET);
const sectorCounter = (sector: Uint8Array): number => readU32(sector, SECTOR_COUNTER_OFFSET);

const writeSaveSectorFooter = (sector: Uint8Array, id: number, checksum: number, signature: number, counter: number): void => {
  writeU16(sector, SECTOR_ID_OFFSET, id);
  writeU16(sector, SECTOR_CHECKSUM_OFFSET, checksum);
  writeU32(sector, SECTOR_SIGNATURE_OFFSET, signature);
  writeU32(sector, SECTOR_COUNTER_OFFSET, counter);
};

const buildSectorBuffer = (
  runtime: DecompSaveRuntime,
  sectorIdValue: number,
  data: Uint8Array,
  size: number,
  checksumId = false
): void => {
  runtime.gSaveDataBuffer.fill(0);
  runtime.gSaveDataBuffer.set(data.slice(0, size), 0);
  const checksum = CalculateChecksum(data, size);
  writeSaveSectorFooter(
    runtime.gSaveDataBuffer,
    checksumId ? checksum : sectorIdValue,
    checksum,
    SECTOR_SIGNATURE,
    runtime.gSaveCounter
  );
};

export const EraseFlashSector = (runtime: DecompSaveRuntime, sectorNum: number): void => {
  runtime.flash[sectorNum].fill(0xff);
  runtime.erasedSectors.push(sectorNum);
  log(runtime, `EraseFlashSector:${sectorNum}`);
};

export const ProgramFlashSectorAndVerify = (runtime: DecompSaveRuntime, sectorNum: number, src: Uint8Array): number => {
  log(runtime, `ProgramFlashSectorAndVerify:${sectorNum}`);
  if (runtime.failedProgramSectors.has(sectorNum)) return 1;
  runtime.flash[sectorNum].set(src.slice(0, SECTOR_SIZE));
  return 0;
};

export const ProgramFlashByte = (runtime: DecompSaveRuntime, sectorNum: number, offset: number, data: number): number => {
  log(runtime, `ProgramFlashByte:${sectorNum}:${offset}:${data & 0xff}`);
  if (runtime.failedProgramBytes.has(`${sectorNum}:${offset}`)) return 1;
  runtime.flash[sectorNum][offset] = data & 0xff;
  return 0;
};

export const ReadFlash = (runtime: DecompSaveRuntime, sectorNum: number, offset: number, dest: Uint8Array, size: number): void => {
  dest.set(runtime.flash[sectorNum].slice(offset, offset + size), 0);
  log(runtime, `ReadFlash:${sectorNum}:${offset}:${size}`);
};

export const TryWriteSector = (runtime: DecompSaveRuntime, sectorNum: number, data: Uint8Array): number => {
  if (ProgramFlashSectorAndVerify(runtime, sectorNum, data)) {
    SetDamagedSectorBits(runtime, ENABLE, sectorNum);
    return SAVE_STATUS_ERROR;
  }
  SetDamagedSectorBits(runtime, DISABLE, sectorNum);
  return SAVE_STATUS_OK;
};

const physicalSectorFor = (runtime: DecompSaveRuntime, sectorIdValue: number): number =>
  ((runtime.gLastWrittenSector + sectorIdValue) % NUM_SECTORS_PER_SLOT) + NUM_SECTORS_PER_SLOT * (runtime.gSaveCounter % NUM_SAVE_SLOTS);

export const HandleWriteSector = (
  runtime: DecompSaveRuntime,
  sectorIdValue: number,
  locations: SaveSectorLocation[]
): number => {
  const sectorNum = physicalSectorFor(runtime, sectorIdValue);
  const location = locations[sectorIdValue];
  buildSectorBuffer(runtime, sectorIdValue, location.data, location.size);
  return TryWriteSector(runtime, sectorNum, runtime.gSaveDataBuffer);
};

export const HandleWriteSectorNBytes = (runtime: DecompSaveRuntime, sectorIdValue: number, data: Uint8Array, size: number): number => {
  buildSectorBuffer(runtime, sectorIdValue, data, size, true);
  return TryWriteSector(runtime, sectorIdValue, runtime.gSaveDataBuffer);
};

export const WriteSaveSectorOrSlot = (
  runtime: DecompSaveRuntime,
  sectorIdValue: number,
  locations: SaveSectorLocation[]
): number => {
  let status: number;
  if (sectorIdValue !== FULL_SAVE_SLOT) {
    status = HandleWriteSector(runtime, sectorIdValue, locations);
  } else {
    runtime.gLastKnownGoodSector = runtime.gLastWrittenSector;
    runtime.gLastSaveCounter = runtime.gSaveCounter;
    runtime.gLastWrittenSector++;
    runtime.gLastWrittenSector %= NUM_SECTORS_PER_SLOT;
    runtime.gSaveCounter++;
    status = SAVE_STATUS_OK;
    for (let i = 0; i < NUM_SECTORS_PER_SLOT; i++) HandleWriteSector(runtime, i, locations);
    if (runtime.gDamagedSaveSectors !== 0) {
      status = SAVE_STATUS_ERROR;
      runtime.gLastWrittenSector = runtime.gLastKnownGoodSector;
      runtime.gSaveCounter = runtime.gLastSaveCounter;
    }
  }
  return status;
};

export const RestoreSaveBackupVarsAndIncrement = (runtime: DecompSaveRuntime, _locations: SaveSectorLocation[]): number => {
  runtime.gLastKnownGoodSector = runtime.gLastWrittenSector;
  runtime.gLastSaveCounter = runtime.gSaveCounter;
  runtime.gLastWrittenSector++;
  runtime.gLastWrittenSector %= NUM_SECTORS_PER_SLOT;
  runtime.gSaveCounter++;
  runtime.gIncrementalSectorId = 0;
  runtime.gDamagedSaveSectors = 0;
  return 0;
};

export const RestoreSaveBackupVars = (runtime: DecompSaveRuntime, _locations: SaveSectorLocation[]): number => {
  runtime.gLastKnownGoodSector = runtime.gLastWrittenSector;
  runtime.gLastSaveCounter = runtime.gSaveCounter;
  runtime.gIncrementalSectorId = 0;
  runtime.gDamagedSaveSectors = 0;
  return 0;
};

export const HandleWriteIncrementalSector = (
  runtime: DecompSaveRuntime,
  numSectors: number,
  locations: SaveSectorLocation[]
): number => {
  let status: number;
  if (runtime.gIncrementalSectorId < numSectors - 1) {
    status = SAVE_STATUS_OK;
    HandleWriteSector(runtime, runtime.gIncrementalSectorId, locations);
    runtime.gIncrementalSectorId++;
    if (runtime.gDamagedSaveSectors) {
      status = SAVE_STATUS_ERROR;
      runtime.gLastWrittenSector = runtime.gLastKnownGoodSector;
      runtime.gSaveCounter = runtime.gLastSaveCounter;
    }
  } else {
    status = SAVE_STATUS_ERROR;
  }
  return status;
};

export const HandleReplaceSector = (
  runtime: DecompSaveRuntime,
  sectorIdValue: number,
  locations: SaveSectorLocation[]
): number => {
  const sectorNum = physicalSectorFor(runtime, sectorIdValue);
  const location = locations[sectorIdValue];
  buildSectorBuffer(runtime, sectorIdValue, location.data, location.size);
  EraseFlashSector(runtime, sectorNum);
  let status = SAVE_STATUS_OK;
  for (let i = 0; i < SECTOR_SIGNATURE_OFFSET; i++) {
    if (ProgramFlashByte(runtime, sectorNum, i, runtime.gSaveDataBuffer[i])) {
      status = SAVE_STATUS_ERROR;
      break;
    }
  }
  if (status === SAVE_STATUS_ERROR) {
    SetDamagedSectorBits(runtime, ENABLE, sectorNum);
    return SAVE_STATUS_ERROR;
  }
  for (let i = 0; i < SECTOR_SIZE - (SECTOR_SIGNATURE_OFFSET + 1); i++) {
    const offset = SECTOR_SIGNATURE_OFFSET + 1 + i;
    if (ProgramFlashByte(runtime, sectorNum, offset, runtime.gSaveDataBuffer[offset])) {
      status = SAVE_STATUS_ERROR;
      break;
    }
  }
  if (status === SAVE_STATUS_ERROR) {
    SetDamagedSectorBits(runtime, ENABLE, sectorNum);
    return SAVE_STATUS_ERROR;
  }
  SetDamagedSectorBits(runtime, DISABLE, sectorNum);
  return SAVE_STATUS_OK;
};

export const HandleReplaceSectorAndVerify = (
  runtime: DecompSaveRuntime,
  sectorIdValue: number,
  locations: SaveSectorLocation[]
): number => {
  let status = SAVE_STATUS_OK;
  HandleReplaceSector(runtime, sectorIdValue - 1, locations);
  if (runtime.gDamagedSaveSectors) {
    status = SAVE_STATUS_ERROR;
    runtime.gLastWrittenSector = runtime.gLastKnownGoodSector;
    runtime.gSaveCounter = runtime.gLastSaveCounter;
  }
  return status;
};

export const CopySectorSignatureByte = (
  runtime: DecompSaveRuntime,
  sectorIdValue: number,
  _locations: SaveSectorLocation[]
): number => {
  const sector = ((runtime.gLastWrittenSector + sectorIdValue - 1) % NUM_SECTORS_PER_SLOT) + NUM_SECTORS_PER_SLOT * (runtime.gSaveCounter % NUM_SAVE_SLOTS);
  if (ProgramFlashByte(runtime, sector, SECTOR_SIGNATURE_OFFSET, runtime.gSaveDataBuffer[SECTOR_SIGNATURE_OFFSET])) {
    SetDamagedSectorBits(runtime, ENABLE, sector);
    runtime.gLastWrittenSector = runtime.gLastKnownGoodSector;
    runtime.gSaveCounter = runtime.gLastSaveCounter;
    return SAVE_STATUS_ERROR;
  }
  SetDamagedSectorBits(runtime, DISABLE, sector);
  return SAVE_STATUS_OK;
};

export const WriteSectorSignatureByte = (
  runtime: DecompSaveRuntime,
  sectorIdValue: number,
  _locations: SaveSectorLocation[]
): number => {
  const sector = ((runtime.gLastWrittenSector + sectorIdValue - 1) % NUM_SECTORS_PER_SLOT) + NUM_SECTORS_PER_SLOT * (runtime.gSaveCounter % NUM_SAVE_SLOTS);
  if (ProgramFlashByte(runtime, sector, SECTOR_SIGNATURE_OFFSET, SECTOR_SIGNATURE & 0xff)) {
    SetDamagedSectorBits(runtime, ENABLE, sector);
    runtime.gLastWrittenSector = runtime.gLastKnownGoodSector;
    runtime.gSaveCounter = runtime.gLastSaveCounter;
    return SAVE_STATUS_ERROR;
  }
  SetDamagedSectorBits(runtime, DISABLE, sector);
  return SAVE_STATUS_OK;
};

export const ReadFlashSector = (runtime: DecompSaveRuntime, sectorIdValue: number, sector: Uint8Array): number => {
  ReadFlash(runtime, sectorIdValue, 0, sector, SECTOR_SIZE);
  return 1;
};

export const GetSaveValidStatus = (runtime: DecompSaveRuntime, locations: SaveSectorLocation[]): number => {
  const allSectors = (1 << NUM_SECTORS_PER_SLOT) - 1;
  let slot1saveCounter = 0;
  let slot2saveCounter = 0;

  const checkSlot = (slot: number): { status: number; counter: number } => {
    let validSectors = 0;
    let signatureValid = false;
    let counter = 0;
    for (let sector = 0; sector < NUM_SECTORS_PER_SLOT; sector++) {
      ReadFlashSector(runtime, NUM_SECTORS_PER_SLOT * slot + sector, runtime.gSaveDataBuffer);
      if (sectorSignature(runtime.gSaveDataBuffer) === SECTOR_SIGNATURE) {
        signatureValid = true;
        const id = sectorId(runtime.gSaveDataBuffer);
        const checksum = CalculateChecksum(runtime.gSaveDataBuffer, locations[id]?.size ?? 0);
        if (sectorChecksum(runtime.gSaveDataBuffer) === checksum) {
          counter = sectorCounter(runtime.gSaveDataBuffer);
          validSectors |= 1 << id;
        }
      }
    }
    if (signatureValid) return { status: validSectors === allSectors ? SAVE_STATUS_OK : SAVE_STATUS_ERROR, counter };
    return { status: SAVE_STATUS_EMPTY, counter };
  };

  const slot1 = checkSlot(0);
  const slot2 = checkSlot(1);
  slot1saveCounter = slot1.counter;
  slot2saveCounter = slot2.counter;

  if (slot1.status === SAVE_STATUS_OK && slot2.status === SAVE_STATUS_OK) {
    if ((slot1saveCounter === 0xffffffff && slot2saveCounter === 0) || (slot1saveCounter === 0 && slot2saveCounter === 0xffffffff)) {
      runtime.gSaveCounter = u32(slot1saveCounter + 1) < u32(slot2saveCounter + 1) ? slot2saveCounter : slot1saveCounter;
    } else {
      runtime.gSaveCounter = slot1saveCounter < slot2saveCounter ? slot2saveCounter : slot1saveCounter;
    }
    return SAVE_STATUS_OK;
  }
  if (slot1.status === SAVE_STATUS_OK) {
    runtime.gSaveCounter = slot1saveCounter;
    return slot2.status === SAVE_STATUS_ERROR ? SAVE_STATUS_ERROR : SAVE_STATUS_OK;
  }
  if (slot2.status === SAVE_STATUS_OK) {
    runtime.gSaveCounter = slot2saveCounter;
    return slot1.status === SAVE_STATUS_ERROR ? SAVE_STATUS_ERROR : SAVE_STATUS_OK;
  }
  if (slot1.status === SAVE_STATUS_EMPTY && slot2.status === SAVE_STATUS_EMPTY) {
    runtime.gSaveCounter = 0;
    runtime.gLastWrittenSector = 0;
    return SAVE_STATUS_EMPTY;
  }
  runtime.gSaveCounter = 0;
  runtime.gLastWrittenSector = 0;
  return SAVE_STATUS_INVALID;
};

export const CopySaveSlotData = (
  runtime: DecompSaveRuntime,
  _sectorIdValue: number,
  locations: SaveSectorLocation[]
): number => {
  const sector = NUM_SECTORS_PER_SLOT * (runtime.gSaveCounter % NUM_SAVE_SLOTS);
  for (let i = 0; i < NUM_SECTORS_PER_SLOT; i++) {
    ReadFlashSector(runtime, i + sector, runtime.gSaveDataBuffer);
    const id = sectorId(runtime.gSaveDataBuffer);
    if (id === 0) runtime.gLastWrittenSector = i;
    const location = locations[id];
    if (!location) continue;
    const checksum = CalculateChecksum(runtime.gSaveDataBuffer, location.size);
    if (sectorSignature(runtime.gSaveDataBuffer) === SECTOR_SIGNATURE && sectorChecksum(runtime.gSaveDataBuffer) === checksum) {
      location.data.set(runtime.gSaveDataBuffer.slice(0, location.size));
    }
  }
  return SAVE_STATUS_OK;
};

export const TryLoadSaveSlot = (
  runtime: DecompSaveRuntime,
  sectorIdValue: number,
  locations: SaveSectorLocation[]
): number => {
  let status: number;
  if (sectorIdValue !== FULL_SAVE_SLOT) status = SAVE_STATUS_ERROR;
  else {
    status = GetSaveValidStatus(runtime, locations);
    CopySaveSlotData(runtime, FULL_SAVE_SLOT, locations);
  }
  return status;
};

export const TryLoadSaveSector = (runtime: DecompSaveRuntime, sectorIdValue: number, data: Uint8Array, size: number): number => {
  ReadFlashSector(runtime, sectorIdValue, runtime.gSaveDataBuffer);
  if (sectorSignature(runtime.gSaveDataBuffer) === SECTOR_SIGNATURE) {
    const checksum = CalculateChecksum(runtime.gSaveDataBuffer, size);
    if (sectorId(runtime.gSaveDataBuffer) === checksum) {
      data.set(runtime.gSaveDataBuffer.slice(0, size), 0);
      return SAVE_STATUS_OK;
    }
    return SAVE_STATUS_INVALID;
  }
  return SAVE_STATUS_EMPTY;
};

const sectorChunks = (data: Uint8Array, start: number, end: number): SaveSectorLocation[] => {
  const result: SaveSectorLocation[] = [];
  for (let sector = start; sector <= end; sector++) {
    const offset = (sector - start) * SECTOR_DATA_SIZE;
    result[sector] = { data: data.subarray(offset, offset + SECTOR_DATA_SIZE), size: Math.min(SECTOR_DATA_SIZE, Math.max(0, data.length - offset)), offset };
  }
  return result;
};

export const UpdateSaveAddresses = (runtime: DecompSaveRuntime): void => {
  const locations: SaveSectorLocation[] = Array(NUM_SECTORS_PER_SLOT);
  locations[SECTOR_ID_SAVEBLOCK2] = { data: runtime.saveBlock2.subarray(0, SECTOR_DATA_SIZE), size: Math.min(runtime.saveBlock2.length, SECTOR_DATA_SIZE), offset: 0 };
  for (const [idx, loc] of sectorChunks(runtime.saveBlock1, SECTOR_ID_SAVEBLOCK1_START, SECTOR_ID_SAVEBLOCK1_END).entries()) {
    if (loc) locations[idx] = loc;
  }
  for (const [idx, loc] of sectorChunks(runtime.pokemonStorage, SECTOR_ID_PKMN_STORAGE_START, SECTOR_ID_PKMN_STORAGE_END).entries()) {
    if (loc) locations[idx] = loc;
  }
  runtime.gRamSaveSectorLocations = locations;
};

export const SaveSerializedGame = (runtime: DecompSaveRuntime): void => {
  runtime.serializedGameCount++;
  log(runtime, 'SaveSerializedGame');
};

export const LoadSerializedGame = (runtime: DecompSaveRuntime): void => {
  runtime.loadedSerializedGameCount++;
  log(runtime, 'LoadSerializedGame');
};

export const GetGameStat = (runtime: DecompSaveRuntime, stat: number): number => runtime.gameStats.get(stat) ?? 0;
export const IncrementGameStat = (runtime: DecompSaveRuntime, stat: number): void => {
  runtime.gameStats.set(stat, GetGameStat(runtime, stat) + 1);
};
export const GAME_STAT_ENTERED_HOF = 0;

export const svc_FinishSave = (runtime: DecompSaveRuntime): void => {
  runtime.finishSaveCount++;
  log(runtime, 'svc_FinishSave');
};

export const HandleSavingData = (runtime: DecompSaveRuntime, saveType: number): number => {
  const backupPtr = runtime.gMain.vblankCounter1;
  runtime.gMain.vblankCounter1 = null;
  UpdateSaveAddresses(runtime);
  switch (saveType) {
    case SAVE_HALL_OF_FAME_ERASE_BEFORE:
      for (let i = SECTOR_ID_HOF_1; i < SECTORS_COUNT; i++) EraseFlashSector(runtime, i);
    // fallthrough
    case SAVE_HALL_OF_FAME:
      if (GetGameStat(runtime, GAME_STAT_ENTERED_HOF) < 999) IncrementGameStat(runtime, GAME_STAT_ENTERED_HOF);
      HandleWriteSectorNBytes(runtime, SECTOR_ID_HOF_1, runtime.gDecompressionBuffer.subarray(0, SECTOR_DATA_SIZE), SECTOR_DATA_SIZE);
      HandleWriteSectorNBytes(runtime, SECTOR_ID_HOF_2, runtime.gDecompressionBuffer.subarray(SECTOR_DATA_SIZE), SECTOR_DATA_SIZE);
    // fallthrough
    case SAVE_NORMAL:
    default:
      SaveSerializedGame(runtime);
      WriteSaveSectorOrSlot(runtime, FULL_SAVE_SLOT, runtime.gRamSaveSectorLocations);
      break;
    case SAVE_LINK:
      SaveSerializedGame(runtime);
      for (let i = SECTOR_ID_SAVEBLOCK2; i <= SECTOR_ID_SAVEBLOCK1_END; i++) WriteSaveSectorOrSlot(runtime, i, runtime.gRamSaveSectorLocations);
      break;
    case SAVE_EREADER:
      SaveSerializedGame(runtime);
      WriteSaveSectorOrSlot(runtime, SECTOR_ID_SAVEBLOCK2, runtime.gRamSaveSectorLocations);
      break;
    case SAVE_OVERWRITE_DIFFERENT_FILE:
      for (let i = SECTOR_ID_HOF_1; i < SECTORS_COUNT; i++) EraseFlashSector(runtime, i);
      SaveSerializedGame(runtime);
      WriteSaveSectorOrSlot(runtime, FULL_SAVE_SLOT, runtime.gRamSaveSectorLocations);
      break;
  }
  runtime.gMain.vblankCounter1 = backupPtr;
  svc_FinishSave(runtime);
  return 0;
};

export const DoSaveFailedScreen = (runtime: DecompSaveRuntime, saveType: number): void => log(runtime, `DoSaveFailedScreen:${saveType}`);

export const TrySavingData = (runtime: DecompSaveRuntime, saveType: number): number => {
  if (runtime.gFlashMemoryPresent !== true) {
    runtime.gSaveAttemptStatus = SAVE_STATUS_ERROR;
    return SAVE_STATUS_ERROR;
  }
  HandleSavingData(runtime, saveType);
  if (!runtime.gDamagedSaveSectors) {
    runtime.gSaveAttemptStatus = SAVE_STATUS_OK;
    return SAVE_STATUS_OK;
  }
  DoSaveFailedScreen(runtime, saveType);
  runtime.gSaveAttemptStatus = SAVE_STATUS_ERROR;
  return SAVE_STATUS_ERROR;
};

export const LinkFullSave_Init = (runtime: DecompSaveRuntime): boolean => {
  if (runtime.gFlashMemoryPresent !== true) return true;
  UpdateSaveAddresses(runtime);
  SaveSerializedGame(runtime);
  RestoreSaveBackupVarsAndIncrement(runtime, runtime.gRamSaveSectorLocations);
  return false;
};

export const LinkFullSave_WriteSector = (runtime: DecompSaveRuntime): boolean => {
  const status = HandleWriteIncrementalSector(runtime, NUM_SECTORS_PER_SLOT, runtime.gRamSaveSectorLocations);
  if (runtime.gDamagedSaveSectors) DoSaveFailedScreen(runtime, SAVE_NORMAL);
  return status === SAVE_STATUS_ERROR;
};

export const LinkFullSave_ReplaceLastSector = (runtime: DecompSaveRuntime): boolean => {
  HandleReplaceSectorAndVerify(runtime, NUM_SECTORS_PER_SLOT, runtime.gRamSaveSectorLocations);
  if (runtime.gDamagedSaveSectors) DoSaveFailedScreen(runtime, SAVE_NORMAL);
  return false;
};

export const LinkFullSave_SetLastSectorSignature = (runtime: DecompSaveRuntime): boolean => {
  CopySectorSignatureByte(runtime, NUM_SECTORS_PER_SLOT, runtime.gRamSaveSectorLocations);
  if (runtime.gDamagedSaveSectors) DoSaveFailedScreen(runtime, SAVE_NORMAL);
  return false;
};

export const WriteSaveBlock2 = (runtime: DecompSaveRuntime): boolean => {
  if (runtime.gFlashMemoryPresent !== true) return true;
  UpdateSaveAddresses(runtime);
  SaveSerializedGame(runtime);
  RestoreSaveBackupVars(runtime, runtime.gRamSaveSectorLocations);
  HandleReplaceSectorAndVerify(runtime, runtime.gIncrementalSectorId + 1, runtime.gRamSaveSectorLocations);
  return false;
};

export const WriteSaveBlock1Sector = (runtime: DecompSaveRuntime): boolean => {
  let finished = false;
  const sectorIdValue = ++runtime.gIncrementalSectorId;
  if (sectorIdValue <= SECTOR_ID_SAVEBLOCK1_END) {
    HandleReplaceSectorAndVerify(runtime, runtime.gIncrementalSectorId + 1, runtime.gRamSaveSectorLocations);
    WriteSectorSignatureByte(runtime, sectorIdValue, runtime.gRamSaveSectorLocations);
  } else {
    WriteSectorSignatureByte(runtime, sectorIdValue, runtime.gRamSaveSectorLocations);
    finished = true;
  }
  if (runtime.gDamagedSaveSectors) DoSaveFailedScreen(runtime, SAVE_LINK);
  return finished;
};

export const LoadGameSave = (runtime: DecompSaveRuntime, saveType: number): number => {
  let result: number;
  if (runtime.gFlashMemoryPresent !== true) {
    runtime.gSaveFileStatus = SAVE_STATUS_NO_FLASH;
    return SAVE_STATUS_ERROR;
  }
  UpdateSaveAddresses(runtime);
  switch (saveType) {
    case SAVE_NORMAL:
    default:
      result = TryLoadSaveSlot(runtime, FULL_SAVE_SLOT, runtime.gRamSaveSectorLocations);
      LoadSerializedGame(runtime);
      runtime.gSaveFileStatus = result;
      runtime.gGameContinueCallback = null;
      break;
    case SAVE_HALL_OF_FAME:
      result = TryLoadSaveSector(runtime, SECTOR_ID_HOF_1, runtime.gDecompressionBuffer.subarray(0, SECTOR_DATA_SIZE), SECTOR_DATA_SIZE);
      if (result === SAVE_STATUS_OK) {
        result = TryLoadSaveSector(runtime, SECTOR_ID_HOF_2, runtime.gDecompressionBuffer.subarray(SECTOR_DATA_SIZE), SECTOR_DATA_SIZE);
      }
      break;
  }
  return result;
};

export const TryReadSpecialSaveSector = (runtime: DecompSaveRuntime, sectorIdValue: number, dst: Uint8Array): number => {
  if (sectorIdValue !== SECTOR_ID_TRAINER_TOWER_1 && sectorIdValue !== SECTOR_ID_TRAINER_TOWER_2) return SAVE_STATUS_ERROR;
  ReadFlash(runtime, sectorIdValue, 0, runtime.gSaveDataBuffer, SECTOR_SIZE);
  if (readU32(runtime.gSaveDataBuffer, 0) !== SPECIAL_SECTOR_SENTINEL) return SAVE_STATUS_ERROR;
  const size = SECTOR_COUNTER_OFFSET - 1;
  const savDataOffset = 4;
  for (let i = 0; i <= size; i++) dst[i] = runtime.gSaveDataBuffer[savDataOffset + i];
  return SAVE_STATUS_OK;
};

export const TryWriteSpecialSaveSector = (runtime: DecompSaveRuntime, sector: number, src: Uint8Array): number => {
  if (sector !== SECTOR_ID_TRAINER_TOWER_1 && sector !== SECTOR_ID_TRAINER_TOWER_2) return SAVE_STATUS_ERROR;
  runtime.gSaveDataBuffer.fill(0);
  writeU32(runtime.gSaveDataBuffer, 0, SPECIAL_SECTOR_SENTINEL);
  const size = SECTOR_COUNTER_OFFSET - 1;
  const savDataOffset = 4;
  for (let i = 0; i <= size; i++) runtime.gSaveDataBuffer[savDataOffset + i] = src[i];
  if (ProgramFlashSectorAndVerify(runtime, sector, runtime.gSaveDataBuffer) !== 0) return SAVE_STATUS_ERROR;
  return SAVE_STATUS_OK;
};

export const IsLinkTaskFinished = (runtime: DecompSaveRuntime): boolean => runtime.linkTaskFinished;
export const SetLinkStandbyCallback = (runtime: DecompSaveRuntime): void => log(runtime, 'SetLinkStandbyCallback');
export const SaveMapView = (runtime: DecompSaveRuntime): void => log(runtime, 'SaveMapView');
export const SetContinueGameWarpStatusToDynamicWarp = (runtime: DecompSaveRuntime): void => log(runtime, 'SetContinueGameWarpStatusToDynamicWarp');
export const ClearContinueGameWarpStatus2 = (runtime: DecompSaveRuntime): void => log(runtime, 'ClearContinueGameWarpStatus2');
export const DestroyTask = (runtime: DecompSaveRuntime, taskId: number): void => {
  runtime.tasks[taskId].isActive = false;
  log(runtime, `DestroyTask:${taskId}`);
};

export const Task_LinkFullSave = (runtime: DecompSaveRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  switch (task.data[0]) {
    case 0:
      runtime.gSoftResetDisabled = true;
      task.data[0] = 1;
      break;
    case 1:
      if (!IsLinkTaskFinished(runtime)) break;
      SetLinkStandbyCallback(runtime);
      task.data[0] = 2;
      break;
    case 2:
      if (IsLinkTaskFinished(runtime)) {
        SaveMapView(runtime);
        task.data[0] = 3;
      }
      break;
    case 3:
      SetContinueGameWarpStatusToDynamicWarp(runtime);
      LinkFullSave_Init(runtime);
      task.data[0] = 4;
      break;
    case 4:
      if (++task.data[1] === 5) {
        task.data[1] = 0;
        task.data[0] = 5;
      }
      break;
    case 5:
      task.data[0] = LinkFullSave_WriteSector(runtime) ? 6 : 4;
      break;
    case 6:
      LinkFullSave_ReplaceLastSector(runtime);
      task.data[0] = 7;
      break;
    case 7:
      if (!IsLinkTaskFinished(runtime)) break;
      ClearContinueGameWarpStatus2(runtime);
      SetLinkStandbyCallback(runtime);
      task.data[0] = 8;
      break;
    case 8:
      if (IsLinkTaskFinished(runtime)) {
        LinkFullSave_SetLastSectorSignature(runtime);
        svc_FinishSave(runtime);
        task.data[0] = 9;
      }
      break;
    case 9:
      if (!IsLinkTaskFinished(runtime)) break;
      SetLinkStandbyCallback(runtime);
      task.data[0] = 10;
      break;
    case 10:
      if (IsLinkTaskFinished(runtime)) task.data[0]++;
      break;
    case 11:
      if (++task.data[1] > 5) {
        runtime.gSoftResetDisabled = false;
        DestroyTask(runtime, taskId);
      }
      break;
  }
};

export const createSaveTask = (): SaveTask => ({ data: Array(16).fill(0), isActive: true });
