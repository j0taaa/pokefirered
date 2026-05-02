import { describe, expect, test } from 'vitest';
import {
  CalculateChecksum,
  CHECK,
  ClearSaveData,
  CopySaveSlotData,
  ENABLE,
  FULL_SAVE_SLOT,
  GetSaveValidStatus,
  HandleSavingData,
  HandleWriteSector,
  HandleWriteSectorNBytes,
  LinkFullSave_Init,
  LinkFullSave_WriteSector,
  LoadGameSave,
  NUM_SECTORS_PER_SLOT,
  ProgramFlashByte,
  SAVE_HALL_OF_FAME,
  SAVE_LINK,
  SAVE_NORMAL,
  SAVE_OVERWRITE_DIFFERENT_FILE,
  SAVE_STATUS_EMPTY,
  SAVE_STATUS_ERROR,
  SAVE_STATUS_INVALID,
  SAVE_STATUS_NO_FLASH,
  SAVE_STATUS_OK,
  SECTOR_COUNTER_OFFSET,
  SECTOR_DATA_SIZE,
  SECTOR_ID_HOF_1,
  SECTOR_ID_HOF_2,
  SECTOR_ID_SAVEBLOCK1_END,
  SECTOR_ID_SAVEBLOCK2,
  SECTOR_ID_TRAINER_TOWER_1,
  SECTOR_SIGNATURE,
  SECTOR_SIGNATURE_OFFSET,
  SECTOR_SIZE,
  SPECIAL_SECTOR_SENTINEL,
  Save_ResetSaveCounters,
  SetDamagedSectorBits,
  Task_LinkFullSave,
  TryReadSpecialSaveSector,
  TrySavingData,
  TryWriteSpecialSaveSector,
  UpdateSaveAddresses,
  WriteSaveBlock1Sector,
  WriteSaveBlock2,
  WriteSaveSectorOrSlot,
  createDecompSaveRuntime,
  createSaveTask
} from '../src/game/decompSave';

const readU16 = (bytes: Uint8Array, offset: number): number => bytes[offset] | (bytes[offset + 1] << 8);
const readU32 = (bytes: Uint8Array, offset: number): number =>
  (bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24)) >>> 0;

const fillPattern = (bytes: Uint8Array, seed: number): void => {
  for (let i = 0; i < bytes.length; i++) bytes[i] = (seed + i) & 0xff;
};

describe('decomp save.c parity', () => {
  test('checksum sums little-endian u32 words and ignores trailing bytes', () => {
    const data = new Uint8Array([1, 0, 0, 0, 2, 0, 1, 0, 0xff, 0xff]);
    expect(CalculateChecksum(data, data.length)).toBe(0x0001 + 0x0002 + 0x0001);
  });

  test('clear/reset/damaged-sector helpers mirror global state mutations', () => {
    const runtime = createDecompSaveRuntime();
    runtime.gSaveCounter = 5;
    runtime.gLastWrittenSector = 3;
    runtime.gDamagedSaveSectors = 0x80;

    Save_ResetSaveCounters(runtime);
    expect(runtime.gSaveCounter).toBe(0);
    expect(runtime.gLastWrittenSector).toBe(0);
    expect(runtime.gDamagedSaveSectors).toBe(0);

    SetDamagedSectorBits(runtime, ENABLE, 2);
    expect(SetDamagedSectorBits(runtime, CHECK, 2)).toBe(true);
    ClearSaveData(runtime);
    expect(runtime.erasedSectors).toHaveLength(32);
    expect(runtime.flash[0][0]).toBe(0xff);
  });

  test('HandleWriteSector rotates physical sector, writes footer, and records checksum', () => {
    const runtime = createDecompSaveRuntime({ gLastWrittenSector: 2, gSaveCounter: 3 });
    UpdateSaveAddresses(runtime);
    fillPattern(runtime.saveBlock2, 7);

    expect(HandleWriteSector(runtime, SECTOR_ID_SAVEBLOCK2, runtime.gRamSaveSectorLocations)).toBe(SAVE_STATUS_OK);
    const physical = 2 + NUM_SECTORS_PER_SLOT;
    expect([...runtime.flash[physical].slice(0, 4)]).toEqual([7, 8, 9, 10]);
    expect(readU16(runtime.flash[physical], SECTOR_DATA_SIZE + 116)).toBe(0);
    expect(readU16(runtime.flash[physical], SECTOR_DATA_SIZE + 118)).toBe(CalculateChecksum(runtime.saveBlock2, SECTOR_DATA_SIZE));
    expect(readU32(runtime.flash[physical], SECTOR_SIGNATURE_OFFSET)).toBe(SECTOR_SIGNATURE);
    expect(readU32(runtime.flash[physical], SECTOR_COUNTER_OFFSET)).toBe(3);
  });

  test('full-slot save increments rotation/counter and rolls back on damaged sectors', () => {
    const runtime = createDecompSaveRuntime({ gLastWrittenSector: 13, gSaveCounter: 4 });
    UpdateSaveAddresses(runtime);
    fillPattern(runtime.saveBlock1, 20);
    expect(WriteSaveSectorOrSlot(runtime, FULL_SAVE_SLOT, runtime.gRamSaveSectorLocations)).toBe(SAVE_STATUS_OK);
    expect(runtime.gLastWrittenSector).toBe(0);
    expect(runtime.gSaveCounter).toBe(5);
    expect(readU32(runtime.flash[NUM_SECTORS_PER_SLOT].slice(), SECTOR_COUNTER_OFFSET)).toBe(5);

    const damaged = createDecompSaveRuntime({ gLastWrittenSector: 4, gSaveCounter: 8, failedProgramSectors: new Set([19]) });
    UpdateSaveAddresses(damaged);
    expect(WriteSaveSectorOrSlot(damaged, FULL_SAVE_SLOT, damaged.gRamSaveSectorLocations)).toBe(SAVE_STATUS_ERROR);
    expect(damaged.gLastWrittenSector).toBe(4);
    expect(damaged.gSaveCounter).toBe(8);
  });

  test('replace-sector path skips first signature byte until WriteSaveBlock1Sector writes it', () => {
    const runtime = createDecompSaveRuntime({ gLastWrittenSector: 0, gSaveCounter: 0 });
    UpdateSaveAddresses(runtime);
    fillPattern(runtime.saveBlock2, 1);

    expect(WriteSaveBlock2(runtime)).toBe(false);
    expect(runtime.flash[0][SECTOR_SIGNATURE_OFFSET]).toBe(0xff);
    expect(readU32(runtime.flash[0], SECTOR_SIGNATURE_OFFSET) & 0xffffff00).toBe(SECTOR_SIGNATURE & 0xffffff00);

    expect(WriteSaveBlock1Sector(runtime)).toBe(false);
    expect(runtime.flash[0][SECTOR_SIGNATURE_OFFSET]).toBe(SECTOR_SIGNATURE & 0xff);
    expect(runtime.flash[1][SECTOR_SIGNATURE_OFFSET]).toBe(0xff);
    expect(runtime.gIncrementalSectorId).toBe(1);
  });

  test('valid-status prefers newest complete slot and reports empty, invalid, and partial errors', () => {
    const runtime = createDecompSaveRuntime();
    UpdateSaveAddresses(runtime);
    expect(GetSaveValidStatus(runtime, runtime.gRamSaveSectorLocations)).toBe(SAVE_STATUS_EMPTY);

    fillPattern(runtime.saveBlock2, 1);
    WriteSaveSectorOrSlot(runtime, FULL_SAVE_SLOT, runtime.gRamSaveSectorLocations);
    const firstCounter = runtime.gSaveCounter;
    fillPattern(runtime.saveBlock2, 2);
    WriteSaveSectorOrSlot(runtime, FULL_SAVE_SLOT, runtime.gRamSaveSectorLocations);
    expect(GetSaveValidStatus(runtime, runtime.gRamSaveSectorLocations)).toBe(SAVE_STATUS_OK);
    expect(runtime.gSaveCounter).toBeGreaterThan(firstCounter);

    runtime.flash[0][0] ^= 1;
    expect(GetSaveValidStatus(runtime, runtime.gRamSaveSectorLocations)).toBe(SAVE_STATUS_ERROR);

    const invalid = createDecompSaveRuntime();
    invalid.flash[0].fill(0);
    invalid.flash[0][SECTOR_SIGNATURE_OFFSET] = SECTOR_SIGNATURE & 0xff;
    invalid.flash[0][SECTOR_SIGNATURE_OFFSET + 1] = (SECTOR_SIGNATURE >>> 8) & 0xff;
    invalid.flash[0][SECTOR_SIGNATURE_OFFSET + 2] = (SECTOR_SIGNATURE >>> 16) & 0xff;
    invalid.flash[0][SECTOR_SIGNATURE_OFFSET + 3] = (SECTOR_SIGNATURE >>> 24) & 0xff;
    expect(GetSaveValidStatus(invalid, runtime.gRamSaveSectorLocations)).toBe(SAVE_STATUS_INVALID);
  });

  test('CopySaveSlotData restores sector payloads and tracks id zero as last-written sector', () => {
    const runtime = createDecompSaveRuntime({ gSaveCounter: 1 });
    UpdateSaveAddresses(runtime);
    fillPattern(runtime.saveBlock2, 55);
    WriteSaveSectorOrSlot(runtime, FULL_SAVE_SLOT, runtime.gRamSaveSectorLocations);

    runtime.saveBlock2.fill(0);
    runtime.saveBlock1.fill(0);
    CopySaveSlotData(runtime, FULL_SAVE_SLOT, runtime.gRamSaveSectorLocations);
    expect([...runtime.saveBlock2.slice(0, 4)]).toEqual([55, 56, 57, 58]);
    expect(runtime.gLastWrittenSector).toBe(1);
  });

  test('normal and HoF load/save entrypoints update status, callbacks, and decompression buffers', () => {
    const runtime = createDecompSaveRuntime();
    fillPattern(runtime.saveBlock2, 8);
    expect(TrySavingData(runtime, SAVE_NORMAL)).toBe(SAVE_STATUS_OK);
    runtime.saveBlock2.fill(0);
    expect(LoadGameSave(runtime, SAVE_NORMAL)).toBe(SAVE_STATUS_OK);
    expect(runtime.loadedSerializedGameCount).toBe(1);
    expect(runtime.gSaveFileStatus).toBe(SAVE_STATUS_OK);
    expect(runtime.gGameContinueCallback).toBeNull();

    fillPattern(runtime.gDecompressionBuffer, 90);
    HandleSavingData(runtime, SAVE_HALL_OF_FAME);
    runtime.gDecompressionBuffer.fill(0);
    expect(LoadGameSave(runtime, SAVE_HALL_OF_FAME)).toBe(SAVE_STATUS_OK);
    expect(runtime.gDecompressionBuffer[0]).toBe(90);
    expect(runtime.gDecompressionBuffer[SECTOR_DATA_SIZE]).toBe(218);
    expect(readU32(runtime.flash[SECTOR_ID_HOF_1], SECTOR_SIGNATURE_OFFSET)).toBe(SECTOR_SIGNATURE);
    expect(readU32(runtime.flash[SECTOR_ID_HOF_2], SECTOR_SIGNATURE_OFFSET)).toBe(SECTOR_SIGNATURE);
  });

  test('saving types preserve fallthrough and erase ranges', () => {
    const link = createDecompSaveRuntime();
    HandleSavingData(link, SAVE_LINK);
    expect(link.serializedGameCount).toBe(1);
    expect(readU32(link.flash[0], SECTOR_SIGNATURE_OFFSET)).toBe(SECTOR_SIGNATURE);
    expect(readU32(link.flash[SECTOR_ID_SAVEBLOCK1_END], SECTOR_SIGNATURE_OFFSET)).toBe(SECTOR_SIGNATURE);
    expect(readU32(link.flash[SECTOR_ID_SAVEBLOCK1_END + 1], SECTOR_SIGNATURE_OFFSET)).not.toBe(SECTOR_SIGNATURE);

    const overwrite = createDecompSaveRuntime();
    HandleSavingData(overwrite, SAVE_OVERWRITE_DIFFERENT_FILE);
    expect(overwrite.erasedSectors[0]).toBe(SECTOR_ID_HOF_1);
    expect(overwrite.erasedSectors.at(-1)).toBe(31);
  });

  test('no-flash and write-failure paths set the same statuses and failed screen side effect', () => {
    const noFlash = createDecompSaveRuntime({ gFlashMemoryPresent: false });
    expect(TrySavingData(noFlash, SAVE_NORMAL)).toBe(SAVE_STATUS_ERROR);
    expect(noFlash.gSaveAttemptStatus).toBe(SAVE_STATUS_ERROR);
    expect(LoadGameSave(noFlash, SAVE_NORMAL)).toBe(SAVE_STATUS_ERROR);
    expect(noFlash.gSaveFileStatus).toBe(SAVE_STATUS_NO_FLASH);

    const failed = createDecompSaveRuntime({ failedProgramSectors: new Set([15]) });
    expect(TrySavingData(failed, SAVE_NORMAL)).toBe(SAVE_STATUS_ERROR);
    expect(failed.operations).toContain(`DoSaveFailedScreen:${SAVE_NORMAL}`);
  });

  test('special Trainer Tower sectors copy from data+4 through counter offset - 1', () => {
    const runtime = createDecompSaveRuntime();
    const src = new Uint8Array(SECTOR_SIZE);
    fillPattern(src, 3);
    expect(TryWriteSpecialSaveSector(runtime, SECTOR_ID_TRAINER_TOWER_1, src)).toBe(SAVE_STATUS_OK);
    expect(readU32(runtime.flash[SECTOR_ID_TRAINER_TOWER_1], 0)).toBe(SPECIAL_SECTOR_SENTINEL);

    const dst = new Uint8Array(SECTOR_SIZE + 8);
    expect(TryReadSpecialSaveSector(runtime, SECTOR_ID_TRAINER_TOWER_1, dst)).toBe(SAVE_STATUS_OK);
    expect(dst[0]).toBe(src[0]);
    expect(dst[SECTOR_COUNTER_OFFSET - 1]).toBe(src[SECTOR_COUNTER_OFFSET - 1]);
    expect(TryWriteSpecialSaveSector(runtime, 0, src)).toBe(SAVE_STATUS_ERROR);
  });

  test('incremental link save writes sectors until final error sentinel', () => {
    const runtime = createDecompSaveRuntime();
    expect(LinkFullSave_Init(runtime)).toBe(false);
    for (let i = 0; i < NUM_SECTORS_PER_SLOT - 1; i++) {
      expect(LinkFullSave_WriteSector(runtime)).toBe(false);
    }
    expect(runtime.gIncrementalSectorId).toBe(NUM_SECTORS_PER_SLOT - 1);
    expect(LinkFullSave_WriteSector(runtime)).toBe(true);
  });

  test('Task_LinkFullSave follows the delayed state machine and re-enables soft reset at the end', () => {
    const runtime = createDecompSaveRuntime();
    runtime.tasks[0] = createSaveTask();

    Task_LinkFullSave(runtime, 0);
    expect(runtime.gSoftResetDisabled).toBe(true);
    expect(runtime.tasks[0].data[0]).toBe(1);
    Task_LinkFullSave(runtime, 0);
    expect(runtime.operations).toContain('SetLinkStandbyCallback');
    Task_LinkFullSave(runtime, 0);
    expect(runtime.operations).toContain('SaveMapView');
    Task_LinkFullSave(runtime, 0);
    expect(runtime.operations).toContain('SetContinueGameWarpStatusToDynamicWarp');
    for (let cycle = 0; cycle < 120 && runtime.tasks[0].data[0] < 11; cycle++) {
      Task_LinkFullSave(runtime, 0);
    }
    expect(runtime.tasks[0].data[0]).toBe(11);
    for (let i = 0; i < 6; i++) Task_LinkFullSave(runtime, 0);
    expect(runtime.gSoftResetDisabled).toBe(false);
    expect(runtime.tasks[0].isActive).toBe(false);
  });

  test('single-sector HoF helper uses checksum in id field and invalidates on checksum mismatch', () => {
    const runtime = createDecompSaveRuntime();
    const data = new Uint8Array(SECTOR_DATA_SIZE);
    fillPattern(data, 11);
    HandleWriteSectorNBytes(runtime, SECTOR_ID_HOF_1, data, data.length);
    const dst = new Uint8Array(SECTOR_DATA_SIZE);
    expect(LoadGameSave(runtime, SAVE_HALL_OF_FAME)).toBe(SAVE_STATUS_EMPTY);
    expect(readU16(runtime.flash[SECTOR_ID_HOF_1], SECTOR_DATA_SIZE + 116)).toBe(CalculateChecksum(data, data.length));
    runtime.flash[SECTOR_ID_HOF_1][0] ^= 1;
    expect(LoadGameSave(runtime, SAVE_HALL_OF_FAME)).toBe(SAVE_STATUS_INVALID);
    expect(dst[0]).toBe(0);
  });

  test('ProgramFlashByte failure preserves backup counters through signature write', () => {
    const runtime = createDecompSaveRuntime({
      gLastWrittenSector: 2,
      gLastKnownGoodSector: 9,
      gSaveCounter: 4,
      gLastSaveCounter: 7,
      failedProgramBytes: new Set([`3:${SECTOR_SIGNATURE_OFFSET}`])
    });
    expect(ProgramFlashByte(runtime, 3, SECTOR_SIGNATURE_OFFSET, 1)).toBe(1);
    SetDamagedSectorBits(runtime, ENABLE, 3);
    expect(SetDamagedSectorBits(runtime, CHECK, 3)).toBe(true);
  });
});
