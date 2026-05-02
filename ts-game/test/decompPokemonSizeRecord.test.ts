import { describe, expect, test } from 'vitest';
import {
  CompareHeracrossSize,
  CompareMagikarpSize,
  CompareMonSize,
  FLAG_SYS_RIBBON_GET,
  FormatMonSizeRecord,
  GetHeracrossSizeRecordInfo,
  GetMagikarpSizeRecordInfo,
  GetMonSize,
  GetMonSizeHash,
  GetMonSizeRecordInfo,
  GiveGiftRibbonToParty,
  InitHeracrossSizeRecord,
  InitMagikarpSizeRecord,
  MON_DATA_MARINE_RIBBON,
  SPECIES_HERACROSS,
  SPECIES_MAGIKARP,
  TranslateBigMonSizeTableIndex,
  VAR_HERACROSS_SIZE_RECORD,
  VAR_MAGIKARP_SIZE_RECORD,
  compareHeracrossSize,
  compareMagikarpSize,
  compareMonSize,
  createPokemonSizeRecordRuntime,
  createSizeRecordMon,
  formatMonSizeRecord,
  getHeracrossSizeRecordInfo,
  getMagikarpSizeRecordInfo,
  getMonSize,
  getMonSizeHash,
  giveGiftRibbonToParty,
  initHeracrossSizeRecord,
  initMagikarpSizeRecord,
  translateBigMonSizeTableIndex
} from '../src/game/decompPokemonSizeRecord';

describe('decompPokemonSizeRecord', () => {
  test('size hash, table translation, raw size, and formatting follow C arithmetic', () => {
    const runtime = createPokemonSizeRecordRuntime();
    const mon = {
      ...createSizeRecordMon(SPECIES_HERACROSS),
      personality: 0x1234,
      hpIV: 9,
      attackIV: 7,
      defenseIV: 2,
      speedIV: 5,
      spAtkIV: 11,
      spDefIV: 1
    };

    expect(getMonSizeHash(mon)).toBe((((((7 ^ 2) * 9) ^ 0x34) << 8) + (((11 ^ 1) * 5) ^ 0x12)) >>> 0);
    expect(translateBigMonSizeTableIndex(109)).toBe(1);
    expect(translateBigMonSizeTableIndex(65535)).toBe(15);
    expect(getMonSize(runtime, SPECIES_HERACROSS, 0)).toBe(435);
    expect(formatMonSizeRecord(435)).toBe('43.5');
    expect(formatMonSizeRecord(254, true)).toBe('10.0');
  });

  test('record init/info and compare paths cover invalid slot, wrong species, equal, smaller, and larger', () => {
    const runtime = createPokemonSizeRecordRuntime();
    initHeracrossSizeRecord(runtime);
    initMagikarpSizeRecord(runtime);
    expect(runtime.vars[VAR_HERACROSS_SIZE_RECORD]).toBe(0);
    expect(runtime.vars[VAR_MAGIKARP_SIZE_RECORD]).toBe(0);

    getHeracrossSizeRecordInfo(runtime);
    expect(runtime.stringVar1).toBe('HERACROSS');
    expect(runtime.stringVar3).toBe('43.5');
    getMagikarpSizeRecordInfo(runtime);
    expect(runtime.stringVar1).toBe('MAGIKARP');

    runtime.specialVarResult = 6;
    expect(compareMonSize(runtime, SPECIES_HERACROSS, VAR_HERACROSS_SIZE_RECORD)).toBe(0);
    runtime.specialVarResult = 0;
    runtime.playerParty[0] = createSizeRecordMon(SPECIES_MAGIKARP);
    expect(compareMonSize(runtime, SPECIES_HERACROSS, VAR_HERACROSS_SIZE_RECORD)).toBe(1);

    runtime.playerParty[0] = { ...createSizeRecordMon(SPECIES_HERACROSS), personality: 0, hpIV: 0 };
    runtime.vars[VAR_HERACROSS_SIZE_RECORD] = 0;
    compareHeracrossSize(runtime);
    expect(runtime.specialVarResult).toBe(4);

    runtime.playerParty[0] = { ...createSizeRecordMon(SPECIES_HERACROSS), personality: 0xffff, hpIV: 15, attackIV: 15 };
    runtime.vars[VAR_HERACROSS_SIZE_RECORD] = 65535;
    runtime.specialVarResult = 0;
    compareHeracrossSize(runtime);
    expect(runtime.specialVarResult).toBe(2);

    runtime.vars[VAR_HERACROSS_SIZE_RECORD] = 0;
    runtime.specialVarResult = 0;
    compareHeracrossSize(runtime);
    expect(runtime.specialVarResult).toBe(3);
    expect(runtime.vars[VAR_HERACROSS_SIZE_RECORD]).not.toBe(0);

    runtime.playerParty[0] = { ...createSizeRecordMon(SPECIES_MAGIKARP), personality: 1 };
    runtime.specialVarResult = 0;
    compareMagikarpSize(runtime);
    expect([3, 4]).toContain(runtime.specialVarResult);
  });

  test('GiveGiftRibbonToParty stores valid gift ribbon and flags only when a non-egg party mon receives it', () => {
    const runtime = createPokemonSizeRecordRuntime();
    runtime.playerParty[0] = createSizeRecordMon(SPECIES_HERACROSS);
    runtime.playerParty[1] = { ...createSizeRecordMon(SPECIES_MAGIKARP), sanityIsEgg: true };

    giveGiftRibbonToParty(runtime, 0, 64);
    expect(runtime.giftRibbons[0]).toBe(64);
    expect(runtime.playerParty[0].ribbons[MON_DATA_MARINE_RIBBON]).toBe(1);
    expect(runtime.playerParty[1].ribbons[MON_DATA_MARINE_RIBBON]).toBeUndefined();
    expect(runtime.flags.has(FLAG_SYS_RIBBON_GET)).toBe(true);

    giveGiftRibbonToParty(runtime, 11, 1);
    expect(runtime.giftRibbons[11]).toBeUndefined();
    giveGiftRibbonToParty(runtime, 0, 65);
    expect(runtime.giftRibbons[0]).toBe(64);
  });

  test('exact C-name pokemon size record exports preserve hash, records, compare results, and gift ribbons', () => {
    const runtime = createPokemonSizeRecordRuntime();
    const mon = {
      ...createSizeRecordMon(SPECIES_HERACROSS),
      personality: 0x1234,
      hpIV: 9,
      attackIV: 7,
      defenseIV: 2,
      speedIV: 5,
      spAtkIV: 11,
      spDefIV: 1
    };

    expect(GetMonSizeHash(mon)).toBe(getMonSizeHash(mon));
    expect(TranslateBigMonSizeTableIndex(65535)).toBe(15);
    expect(GetMonSize(runtime, SPECIES_HERACROSS, 0)).toBe(435);
    expect(FormatMonSizeRecord(435)).toBe('43.5');

    InitHeracrossSizeRecord(runtime);
    InitMagikarpSizeRecord(runtime);
    expect(runtime.vars[VAR_HERACROSS_SIZE_RECORD]).toBe(0);
    expect(runtime.vars[VAR_MAGIKARP_SIZE_RECORD]).toBe(0);

    GetMonSizeRecordInfo(runtime, SPECIES_HERACROSS, VAR_HERACROSS_SIZE_RECORD);
    expect(runtime.stringVar1).toBe('HERACROSS');
    expect(runtime.stringVar3).toBe('43.5');
    GetHeracrossSizeRecordInfo(runtime);
    expect(runtime.stringVar1).toBe('HERACROSS');
    GetMagikarpSizeRecordInfo(runtime);
    expect(runtime.stringVar1).toBe('MAGIKARP');

    runtime.specialVarResult = 0;
    runtime.playerParty[0] = mon;
    expect(CompareMonSize(runtime, SPECIES_HERACROSS, VAR_HERACROSS_SIZE_RECORD)).toBe(3);
    expect(runtime.vars[VAR_HERACROSS_SIZE_RECORD]).not.toBe(0);

    CompareHeracrossSize(runtime);
    expect([2, 3, 4]).toContain(runtime.specialVarResult);
    runtime.playerParty[0] = { ...createSizeRecordMon(SPECIES_MAGIKARP), personality: 1 };
    runtime.specialVarResult = 0;
    CompareMagikarpSize(runtime);
    expect([3, 4]).toContain(runtime.specialVarResult);

    GiveGiftRibbonToParty(runtime, 0, 12);
    expect(runtime.giftRibbons[0]).toBe(12);
    expect(runtime.playerParty[0].ribbons[MON_DATA_MARINE_RIBBON]).toBe(1);
    expect(runtime.flags.has(FLAG_SYS_RIBBON_GET)).toBe(true);
  });
});
