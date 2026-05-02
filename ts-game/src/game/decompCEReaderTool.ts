export const MAX_TRAINER_TOWER_FLOORS = 8;
export const CHALLENGE_TYPE_KNOCKOUT = 2;
export const TRAINER_TOWER_FLOOR_SIZE = 0x3e0;
export const E_READER_TRAINER_TOWER_HEADER_SIZE = 0x08;
export const SEC30_SIZE = E_READER_TRAINER_TOWER_HEADER_SIZE + TRAINER_TOWER_FLOOR_SIZE * 4;
export const SEC31_SIZE = TRAINER_TOWER_FLOOR_SIZE * 4;
export const SECTOR_SIZE = 4096;
export const SECTOR_ID_TRAINER_TOWER_1 = 30;
export const SECTOR_ID_TRAINER_TOWER_2 = 31;

export interface TrainerTowerFloorData {
  floorIdx: number;
  challengeType: number;
  bytesBeforeChecksum: readonly number[];
  checksum: number;
}

export interface EReaderTrainerTowerSetData {
  numFloors: number;
  id: number;
  dummy: number;
  checksum: number;
  floors: TrainerTowerFloorData[];
  rawBytes?: Uint8Array;
}

export interface CEReaderSaveStorage {
  trainerTowerUnk9: number;
  sectors: Map<number, Uint8Array>;
}

export const calcByteArraySum = (
  bytes: ArrayLike<number>,
  length = bytes.length
): number => {
  let sum = 0;
  for (let i = 0; i < length; i += 1) {
    sum = (sum + (bytes[i] ?? 0)) >>> 0;
  }
  return sum >>> 0;
};

export const getTrainerHillUnkVal = (storage: CEReaderSaveStorage): number =>
  ((Math.trunc(storage.trainerTowerUnk9) & 0xff) + 1) & 0xff;

export const validateTrainerTowerTrainer = (floor: TrainerTowerFloorData): boolean => {
  if (floor.floorIdx < 1 || floor.floorIdx > MAX_TRAINER_TOWER_FLOORS) {
    return false;
  }

  if (floor.challengeType > CHALLENGE_TYPE_KNOCKOUT) {
    return false;
  }

  return calcByteArraySum(floor.bytesBeforeChecksum) === (Math.trunc(floor.checksum) >>> 0);
};

export const validateTrainerTowerData = (ttdata: EReaderTrainerTowerSetData): boolean => {
  const numFloors = Math.trunc(ttdata.numFloors) >>> 0;
  if (numFloors < 1 || numFloors > MAX_TRAINER_TOWER_FLOORS) {
    return false;
  }

  for (let i = 0; i < numFloors; i += 1) {
    const floor = ttdata.floors[i];
    if (!floor || !validateTrainerTowerTrainer(floor)) {
      return false;
    }
  }

  const floorBytes = ttdata.floors
    .slice(0, numFloors)
    .flatMap((floor) => [...floor.bytesBeforeChecksum, ...u32ToLeBytes(floor.checksum)]);
  return calcByteArraySum(floorBytes) === (Math.trunc(ttdata.checksum) >>> 0);
};

const u32ToLeBytes = (value: number): number[] => {
  const normalized = Math.trunc(value) >>> 0;
  return [
    normalized & 0xff,
    (normalized >>> 8) & 0xff,
    (normalized >>> 16) & 0xff,
    (normalized >>> 24) & 0xff
  ];
};

export const createTrainerTowerRawBytes = (ttdata: EReaderTrainerTowerSetData): Uint8Array => {
  if (ttdata.rawBytes) {
    return new Uint8Array(ttdata.rawBytes);
  }

  const raw = new Uint8Array(E_READER_TRAINER_TOWER_HEADER_SIZE + TRAINER_TOWER_FLOOR_SIZE * MAX_TRAINER_TOWER_FLOORS);
  raw[0] = ttdata.numFloors & 0xff;
  raw[1] = ttdata.id & 0xff;
  raw[2] = ttdata.dummy & 0xff;
  raw[3] = (ttdata.dummy >>> 8) & 0xff;
  raw.set(u32ToLeBytes(ttdata.checksum), 4);
  for (let i = 0; i < Math.min(ttdata.floors.length, MAX_TRAINER_TOWER_FLOORS); i += 1) {
    const floor = ttdata.floors[i];
    const offset = E_READER_TRAINER_TOWER_HEADER_SIZE + TRAINER_TOWER_FLOOR_SIZE * i;
    raw.set(floor.bytesBeforeChecksum.slice(0, TRAINER_TOWER_FLOOR_SIZE - 4), offset);
    raw.set(u32ToLeBytes(floor.checksum), offset + TRAINER_TOWER_FLOOR_SIZE - 4);
  }
  return raw;
};

export const cEReaderToolSaveTrainerTower = (
  storage: CEReaderSaveStorage,
  ttdata: EReaderTrainerTowerSetData
): boolean => {
  if (ttdata.dummy !== 0 || ttdata.id !== 0) {
    throw new Error('CEReaderTool_SaveTrainerTower expects dummy == 0 and id == 0.');
  }

  const raw = createTrainerTowerRawBytes(ttdata);
  const sector30 = new Uint8Array(SECTOR_SIZE);
  sector30.set(raw.slice(0, SEC30_SIZE));
  sector30[1] = getTrainerHillUnkVal(storage);
  storage.sectors.set(SECTOR_ID_TRAINER_TOWER_1, sector30);

  const sector31 = new Uint8Array(SECTOR_SIZE);
  sector31.set(raw.slice(SEC30_SIZE, SEC30_SIZE + SEC31_SIZE));
  storage.sectors.set(SECTOR_ID_TRAINER_TOWER_2, sector31);
  return true;
};

export const cEReaderToolLoadTrainerTower = (
  storage: CEReaderSaveStorage,
  decode: (rawBytes: Uint8Array) => EReaderTrainerTowerSetData
): EReaderTrainerTowerSetData | null => {
  const sector30 = storage.sectors.get(SECTOR_ID_TRAINER_TOWER_1);
  if (!sector30) {
    return null;
  }
  const sector31 = storage.sectors.get(SECTOR_ID_TRAINER_TOWER_2);
  if (!sector31) {
    return null;
  }

  const raw = new Uint8Array(SEC30_SIZE + SEC31_SIZE);
  raw.set(sector30.slice(0, SEC30_SIZE), 0);
  raw.set(sector31.slice(0, SEC31_SIZE), SEC30_SIZE);
  const decoded = decode(raw);
  return validateTrainerTowerData(decoded) ? decoded : null;
};

export const readTrainerTowerAndValidate = (): false => false;

export function GetTrainerHillUnkVal(storage: CEReaderSaveStorage): number {
  return getTrainerHillUnkVal(storage);
}

export function ValidateTrainerTowerTrainer(floor: TrainerTowerFloorData): boolean {
  return validateTrainerTowerTrainer(floor);
}

export function ValidateTrainerTowerData(ttdata: EReaderTrainerTowerSetData): boolean {
  return validateTrainerTowerData(ttdata);
}

export function CEReaderTool_SaveTrainerTower_r(
  storage: CEReaderSaveStorage,
  ttdata: EReaderTrainerTowerSetData,
  buffer = new Uint8Array(SECTOR_SIZE)
): boolean {
  if (ttdata.dummy !== 0 || ttdata.id !== 0) {
    throw new Error('CEReaderTool_SaveTrainerTower_r expects dummy == 0 and id == 0.');
  }

  const raw = createTrainerTowerRawBytes(ttdata);
  buffer.fill(0);
  buffer.set(raw.slice(0, SEC30_SIZE));
  buffer[1] = getTrainerHillUnkVal(storage);
  storage.sectors.set(SECTOR_ID_TRAINER_TOWER_1, new Uint8Array(buffer));

  buffer.fill(0);
  buffer.set(raw.slice(SEC30_SIZE, SEC30_SIZE + SEC31_SIZE));
  storage.sectors.set(SECTOR_ID_TRAINER_TOWER_2, new Uint8Array(buffer));
  return true;
}

export function CEReaderTool_SaveTrainerTower(
  storage: CEReaderSaveStorage,
  ttdata: EReaderTrainerTowerSetData
): boolean {
  const buffer = new Uint8Array(SECTOR_SIZE);
  return CEReaderTool_SaveTrainerTower_r(storage, ttdata, buffer);
}

export function CEReaderTool_LoadTrainerTower_r(
  storage: CEReaderSaveStorage,
  decode: (rawBytes: Uint8Array) => EReaderTrainerTowerSetData,
  buffer = new Uint8Array(SECTOR_SIZE)
): EReaderTrainerTowerSetData | null {
  const sector30 = storage.sectors.get(SECTOR_ID_TRAINER_TOWER_1);
  if (!sector30) {
    return null;
  }
  buffer.fill(0);
  buffer.set(sector30.slice(0, SEC30_SIZE));
  const raw = new Uint8Array(SEC30_SIZE + SEC31_SIZE);
  raw.set(buffer.slice(0, SEC30_SIZE), 0);

  const sector31 = storage.sectors.get(SECTOR_ID_TRAINER_TOWER_2);
  if (!sector31) {
    return null;
  }
  buffer.fill(0);
  buffer.set(sector31.slice(0, SEC31_SIZE));
  raw.set(buffer.slice(0, SEC31_SIZE), SEC30_SIZE);

  const decoded = decode(raw);
  return validateTrainerTowerData(decoded) ? decoded : null;
}

export function CEReaderTool_LoadTrainerTower(
  storage: CEReaderSaveStorage,
  decode: (rawBytes: Uint8Array) => EReaderTrainerTowerSetData
): EReaderTrainerTowerSetData | null {
  const buffer = new Uint8Array(SECTOR_SIZE);
  return CEReaderTool_LoadTrainerTower_r(storage, decode, buffer);
}

export function ReadTrainerTowerAndValidate(): false {
  return readTrainerTowerAndValidate();
}
