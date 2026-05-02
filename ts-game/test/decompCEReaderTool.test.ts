import { describe, expect, test } from 'vitest';
import {
  CEReaderTool_LoadTrainerTower,
  CEReaderTool_LoadTrainerTower_r,
  CEReaderTool_SaveTrainerTower,
  CEReaderTool_SaveTrainerTower_r,
  CHALLENGE_TYPE_KNOCKOUT,
  E_READER_TRAINER_TOWER_HEADER_SIZE,
  GetTrainerHillUnkVal,
  MAX_TRAINER_TOWER_FLOORS,
  ReadTrainerTowerAndValidate,
  SEC30_SIZE,
  SEC31_SIZE,
  SECTOR_ID_TRAINER_TOWER_1,
  SECTOR_ID_TRAINER_TOWER_2,
  SECTOR_SIZE,
  TRAINER_TOWER_FLOOR_SIZE,
  ValidateTrainerTowerData,
  ValidateTrainerTowerTrainer,
  cEReaderToolLoadTrainerTower,
  cEReaderToolSaveTrainerTower,
  calcByteArraySum,
  getTrainerHillUnkVal,
  readTrainerTowerAndValidate,
  validateTrainerTowerData,
  validateTrainerTowerTrainer,
  type CEReaderSaveStorage,
  type EReaderTrainerTowerSetData,
  type TrainerTowerFloorData
} from '../src/game/decompCEReaderTool';

const createFloor = (
  floorIdx: number,
  challengeType: number,
  seed: number
): TrainerTowerFloorData => {
  const bytesBeforeChecksum = Array.from({ length: TRAINER_TOWER_FLOOR_SIZE - 4 }, (_, index) => (seed + index) & 0xff);
  bytesBeforeChecksum[1] = floorIdx;
  bytesBeforeChecksum[2] = challengeType;
  return {
    floorIdx,
    challengeType,
    bytesBeforeChecksum,
    checksum: calcByteArraySum(bytesBeforeChecksum)
  };
};

const createSet = (numFloors = 2): EReaderTrainerTowerSetData => {
  const floors = Array.from({ length: MAX_TRAINER_TOWER_FLOORS }, (_, index) =>
    createFloor(index + 1, index % (CHALLENGE_TYPE_KNOCKOUT + 1), index * 7)
  );
  const checksumBytes = floors
    .slice(0, numFloors)
    .flatMap((floor) => [
      ...floor.bytesBeforeChecksum,
      floor.checksum & 0xff,
      (floor.checksum >>> 8) & 0xff,
      (floor.checksum >>> 16) & 0xff,
      (floor.checksum >>> 24) & 0xff
    ]);
  return {
    numFloors,
    id: 0,
    dummy: 0,
    checksum: calcByteArraySum(checksumBytes),
    floors
  };
};

describe('decompCEReaderTool', () => {
  test('ValidateTrainerTowerTrainer enforces floor range, challenge range, and checksum', () => {
    const valid = createFloor(1, CHALLENGE_TYPE_KNOCKOUT, 0x10);
    expect(validateTrainerTowerTrainer(valid)).toBe(true);
    expect(validateTrainerTowerTrainer({ ...valid, floorIdx: 0 })).toBe(false);
    expect(validateTrainerTowerTrainer({ ...valid, floorIdx: MAX_TRAINER_TOWER_FLOORS + 1 })).toBe(false);
    expect(validateTrainerTowerTrainer({ ...valid, challengeType: CHALLENGE_TYPE_KNOCKOUT + 1 })).toBe(false);
    expect(validateTrainerTowerTrainer({ ...valid, checksum: valid.checksum + 1 })).toBe(false);
  });

  test('ValidateTrainerTowerData validates floor count and aggregate floor checksum', () => {
    const set = createSet(2);
    expect(validateTrainerTowerData(set)).toBe(true);
    expect(validateTrainerTowerData({ ...set, numFloors: 0 })).toBe(false);
    expect(validateTrainerTowerData({ ...set, numFloors: MAX_TRAINER_TOWER_FLOORS + 1 })).toBe(false);
    expect(validateTrainerTowerData({ ...set, checksum: set.checksum + 1 })).toBe(false);
  });

  test('CEReaderTool_SaveTrainerTower splits raw data into sectors and patches buffer[1]', () => {
    const storage: CEReaderSaveStorage = {
      trainerTowerUnk9: 0xff,
      sectors: new Map()
    };
    const set = createSet(2);

    expect(cEReaderToolSaveTrainerTower(storage, set)).toBe(true);

    const sector30 = storage.sectors.get(SECTOR_ID_TRAINER_TOWER_1);
    const sector31 = storage.sectors.get(SECTOR_ID_TRAINER_TOWER_2);
    expect(sector30).toHaveLength(SECTOR_SIZE);
    expect(sector31).toHaveLength(SECTOR_SIZE);
    expect(sector30?.[0]).toBe(set.numFloors);
    expect(sector30?.[1]).toBe(0);
    expect(sector31?.[0]).toBe(set.floors[4].bytesBeforeChecksum[0]);
    expect(SEC30_SIZE).toBe(E_READER_TRAINER_TOWER_HEADER_SIZE + TRAINER_TOWER_FLOOR_SIZE * 4);
    expect(SEC31_SIZE).toBe(TRAINER_TOWER_FLOOR_SIZE * 4);
  });

  test('CEReaderTool_LoadTrainerTower reads two sectors, decodes, then validates', () => {
    const storage: CEReaderSaveStorage = {
      trainerTowerUnk9: 4,
      sectors: new Map()
    };
    const set = createSet(2);
    cEReaderToolSaveTrainerTower(storage, set);

    const loaded = cEReaderToolLoadTrainerTower(storage, () => set);
    expect(loaded).toBe(set);
    expect(cEReaderToolLoadTrainerTower(storage, () => ({ ...set, checksum: 0 }))).toBeNull();

    storage.sectors.delete(SECTOR_ID_TRAINER_TOWER_2);
    expect(cEReaderToolLoadTrainerTower(storage, () => set)).toBeNull();
  });

  test('ReadTrainerTowerAndValidate remains the FireRed stub', () => {
    expect(getTrainerHillUnkVal({ trainerTowerUnk9: 9, sectors: new Map() })).toBe(10);
    expect(readTrainerTowerAndValidate()).toBe(false);
  });

  test('exact C-name CEReader helpers preserve trainer tower validation and sector IO', () => {
    const storage: CEReaderSaveStorage = {
      trainerTowerUnk9: 0xfe,
      sectors: new Map()
    };
    const set = createSet(3);
    const floor = set.floors[0];
    const buffer = new Uint8Array(SECTOR_SIZE);

    expect(GetTrainerHillUnkVal(storage)).toBe(0xff);
    expect(ValidateTrainerTowerTrainer(floor)).toBe(true);
    expect(ValidateTrainerTowerTrainer({ ...floor, floorIdx: 0 })).toBe(false);
    expect(ValidateTrainerTowerData(set)).toBe(true);
    expect(ValidateTrainerTowerData({ ...set, numFloors: 0 })).toBe(false);

    expect(CEReaderTool_SaveTrainerTower_r(storage, set, buffer)).toBe(true);
    expect(storage.sectors.get(SECTOR_ID_TRAINER_TOWER_1)?.[1]).toBe(0xff);
    expect(storage.sectors.get(SECTOR_ID_TRAINER_TOWER_2)?.[0]).toBe(set.floors[4].bytesBeforeChecksum[0]);
    expect(buffer[0]).toBe(set.floors[4].bytesBeforeChecksum[0]);

    expect(CEReaderTool_LoadTrainerTower_r(storage, () => set, buffer)).toBe(set);
    expect(CEReaderTool_LoadTrainerTower_r(storage, () => ({ ...set, checksum: set.checksum + 1 }), buffer)).toBeNull();

    const storage2: CEReaderSaveStorage = { trainerTowerUnk9: 1, sectors: new Map() };
    expect(CEReaderTool_SaveTrainerTower(storage2, set)).toBe(true);
    expect(CEReaderTool_LoadTrainerTower(storage2, () => set)).toBe(set);
    storage2.sectors.delete(SECTOR_ID_TRAINER_TOWER_1);
    expect(CEReaderTool_LoadTrainerTower(storage2, () => set)).toBeNull();
    expect(ReadTrainerTowerAndValidate()).toBe(false);
  });
});
