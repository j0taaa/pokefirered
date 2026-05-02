import { describe, expect, test } from 'vitest';
import {
  CalcByteArraySum,
  CalcCRC16,
  CheckCompatibility,
  MEScrCmd_addrareword,
  MEScrCmd_addtrainer,
  MEScrCmd_checkcompat,
  MEScrCmd_checksum,
  MEScrCmd_crc,
  MEScrCmd_end,
  MEScrCmd_enableresetrtc,
  MEScrCmd_givenationaldex,
  MEScrCmd_givepokemon,
  MEScrCmd_giveribbon,
  MEScrCmd_initramscript,
  MEScrCmd_runscript,
  MEScrCmd_setenigmaberry,
  MEScrCmd_setmsg,
  MEScrCmd_setrecordmixinggift,
  MEScrCmd_setstatus,
  MEventScript_InitContext,
  MEventScript_Run,
  PARTY_SIZE,
  RunMysteryEventScript,
  SPECIES_EGG,
  SetMysteryEventScriptStatus,
  VAR_ENIGMA_BERRY_AVAILABLE,
  createMysteryEventScriptRuntime,
  gText_MysteryGiftBerry,
  gText_MysteryGiftBerryObtained,
  gText_MysteryGiftBerryTransform,
  gText_MysteryGiftCantBeUsed,
  gText_MysteryGiftFullParty,
  gText_MysteryGiftNationalDex,
  gText_MysteryGiftNewTrainer,
  gText_MysteryGiftRareWord,
  gText_MysteryGiftSentOver,
  gText_MysteryGiftSpecialRibbon
} from '../src/game/decompMysteryEventScript';

const bytes = (...values: number[]): Uint8Array => Uint8Array.from(values);
const word = (value: number): number[] => [value & 0xff, (value >> 8) & 0xff, (value >> 16) & 0xff, (value >> 24) & 0xff];
const half = (value: number): number[] => [value & 0xff, (value >> 8) & 0xff];

describe('decomp mystery event script', () => {
  test('compatibility command stores base pointer and gates execution status', () => {
    expect(CheckCompatibility(1, 1, 1, 1)).toBe(true);
    expect(CheckCompatibility(0, 1, 1, 1)).toBe(false);
    const runtime = createMysteryEventScriptRuntime();
    const script = bytes(...word(0x20), ...half(1), ...word(1), ...half(1), ...word(1));
    runtime.context.script = script;

    expect(MEScrCmd_checkcompat(runtime.context)).toBe(true);
    expect(runtime.context.data[1]).toBe(0x20);
    expect(runtime.context.data[3]).toBe(1);

    const bad = createMysteryEventScriptRuntime();
    bad.context.script = bytes(...word(0), ...half(0), ...word(1), ...half(1), ...word(1));
    expect(MEScrCmd_checkcompat(bad.context)).toBe(true);
    expect(bad.stringVar4).toBe(gText_MysteryGiftCantBeUsed);
    expect(bad.context.data[2]).toBe(3);
  });

  test('context init, status, setstatus, setmsg, runscript, and end mirror the script context flow', () => {
    const runtime = createMysteryEventScriptRuntime({ commandTable: [MEScrCmd_setstatus, MEScrCmd_end] });
    runtime.memory.set(8, 'hello');
    MEventScript_InitContext(runtime, bytes(7, 0xff, ...word(8), 0));
    SetMysteryEventScriptStatus(runtime, 9);
    expect(runtime.context.data[2]).toBe(9);

    runtime.context.script = bytes(4);
    runtime.context.pc = 0;
    MEScrCmd_setstatus(runtime.context);
    expect(runtime.context.data[2]).toBe(4);

    runtime.context.script = bytes(4, ...word(8));
    runtime.context.pc = 0;
    MEScrCmd_setmsg(runtime.context);
    expect(runtime.stringVar4).toBe('hello');

    runtime.context.script = bytes(...word(4), 1, 2, 3);
    runtime.context.pc = 0;
    MEScrCmd_runscript(runtime.context);
    expect([...runtime.immediateScripts[0]]).toEqual([1, 2, 3]);

    expect(MEScrCmd_end(runtime.context)).toBe(true);
    expect(runtime.context.stopped).toBe(true);
  });

  test('MEventScript_Run and RunMysteryEventScript keep looping only while command returns true and data[3] is set', () => {
    const runtime = createMysteryEventScriptRuntime({
      commandTable: [
        (ctx) => {
          ctx.data[2] = 1;
          ctx.data[3] = 1;
          return true;
        },
        (ctx) => {
          ctx.data[2] = 2;
          ctx.data[3] = 0;
          return true;
        }
      ]
    });
    MEventScript_InitContext(runtime, bytes(0, 1));
    const out = { value: 0 };
    expect(MEventScript_Run(runtime, out)).toBe(true);
    expect(out.value).toBe(1);
    expect(MEventScript_Run(runtime, out)).toBe(false);
    expect(out.value).toBe(2);

    const runtime2 = createMysteryEventScriptRuntime({ commandTable: runtime.commandTable });
    expect(RunMysteryEventScript(runtime2, bytes(0, 1))).toBe(2);
  });

  test('setenigmaberry chooses the same message and status branches as C', () => {
    const noBerry = createMysteryEventScriptRuntime({ enigmaBerryValid: false, enigmaBerryValidAfterSet: true });
    noBerry.memory.set(4, 'NEW');
    noBerry.context.script = bytes(...word(4));
    MEScrCmd_setenigmaberry(noBerry.context);
    expect(noBerry.stringVar4).toBe(gText_MysteryGiftBerry);
    expect(noBerry.context.data[2]).toBe(2);
    expect(noBerry.vars.get(VAR_ENIGMA_BERRY_AVAILABLE)).toBe(1);

    const transformed = createMysteryEventScriptRuntime({ enigmaBerryValid: true, enigmaBerryName: 'OLD', enigmaBerryValidAfterSet: true });
    transformed.memory.set(4, 'NEW');
    transformed.context.script = bytes(...word(4));
    MEScrCmd_setenigmaberry(transformed.context);
    expect(transformed.stringVar4).toBe(gText_MysteryGiftBerryTransform);

    const sameInvalid = createMysteryEventScriptRuntime({ enigmaBerryValid: true, enigmaBerryName: 'SAME', enigmaBerryValidAfterSet: false });
    sameInvalid.memory.set(4, 'SAME');
    sameInvalid.context.script = bytes(...word(4));
    MEScrCmd_setenigmaberry(sameInvalid.context);
    expect(sameInvalid.stringVar4).toBe(gText_MysteryGiftBerryObtained);
    expect(sameInvalid.context.data[2]).toBe(1);
  });

  test('ribbon, RAM script, national dex, rare word, and incompatible commands call their hooks', () => {
    const runtime = createMysteryEventScriptRuntime();
    runtime.context.script = bytes(3, 9);
    MEScrCmd_giveribbon(runtime.context);
    expect(runtime.giftRibbons).toEqual([{ index: 3, ribbonId: 9 }]);
    expect(runtime.stringVar4).toBe(gText_MysteryGiftSpecialRibbon);

    runtime.context.script = bytes(1, 2, 3, ...word(10), ...word(14), 11, 12, 13, 14);
    runtime.context.pc = 0;
    MEScrCmd_initramscript(runtime.context);
    expect(runtime.ramScripts[0]).toMatchObject({ length: 4, mapGroup: 1, mapNum: 2, objectId: 3 });

    MEScrCmd_givenationaldex(runtime.context);
    expect(runtime.nationalDexEnabled).toBe(true);
    expect(runtime.stringVar4).toBe(gText_MysteryGiftNationalDex);

    runtime.context.script = bytes(77);
    runtime.context.pc = 0;
    MEScrCmd_addrareword(runtime.context);
    expect(runtime.rareWords).toEqual([77]);
    expect(runtime.stringVar4).toBe(gText_MysteryGiftRareWord);

    runtime.context.data[3] = 1;
    expect(MEScrCmd_setrecordmixinggift(runtime.context)).toBe(true);
    expect(runtime.context.data[3]).toBe(0);
    expect(runtime.stringVar4).toBe(gText_MysteryGiftCantBeUsed);
    runtime.context.data[3] = 1;
    expect(MEScrCmd_enableresetrtc(runtime.context)).toBe(true);
    expect(runtime.context.data[3]).toBe(0);
  });

  test('givepokemon handles full party, eggs, pokedex flags, held mail, and party compaction', () => {
    const full = createMysteryEventScriptRuntime({ playerPartyCount: PARTY_SIZE });
    full.memory.set(8, { species: 25 });
    full.context.script = bytes(...word(8));
    MEScrCmd_givepokemon(full.context);
    expect(full.stringVar4).toBe(gText_MysteryGiftFullParty);
    expect(full.context.data[2]).toBe(3);

    const runtime = createMysteryEventScriptRuntime({ playerParty: [{ species: 1 }], playerPartyCount: 1 });
    runtime.memory.set(8, { species: 25, heldItem: 100 });
    runtime.memory.set(9, { message: 'mail' });
    runtime.context.script = bytes(...word(8));
    MEScrCmd_givepokemon(runtime.context);
    expect(runtime.playerParty[5]).toMatchObject({ species: 25, heldItem: 100 });
    expect(runtime.pokedexFlags).toEqual([{ num: 25, flag: 'seen' }, { num: 25, flag: 'caught' }]);
    expect(runtime.mailsGiven).toHaveLength(1);
    expect(runtime.compactPartyCalls).toBe(1);
    expect(runtime.calculatePartyCountCalls).toBe(1);
    expect(runtime.stringVar4).toBe(gText_MysteryGiftSentOver);
    expect(runtime.context.data[2]).toBe(2);

    const egg = createMysteryEventScriptRuntime();
    egg.memory.set(8, { species: SPECIES_EGG });
    egg.context.script = bytes(...word(8));
    MEScrCmd_givepokemon(egg.context);
    expect(egg.stringVar1).toBe('EGG');
    expect(egg.pokedexFlags).toEqual([]);
  });

  test('addtrainer copies trainer data and validates it', () => {
    const runtime = createMysteryEventScriptRuntime();
    const trainer = { name: 'TRAINER' };
    runtime.memory.set(12, trainer);
    runtime.context.script = bytes(...word(12));

    MEScrCmd_addtrainer(runtime.context);

    expect(runtime.trainer).toBe(trainer);
    expect(runtime.trainerValidated).toBe(true);
    expect(runtime.stringVar4).toBe(gText_MysteryGiftNewTrainer);
    expect(runtime.context.data[2]).toBe(2);
  });

  test('checksum and CRC commands clear data[3] and set status 1 only on mismatch', () => {
    const payload = bytes(1, 2, 3, 4);
    expect(CalcByteArraySum(payload)).toBe(10);
    expect(CalcCRC16(payload)).toBe(CalcCRC16(payload));

    const script = bytes(...word(10), ...word(16), ...word(20), 0, 0, 0, 0, 1, 2, 3, 4);
    const runtime = createMysteryEventScriptRuntime();
    runtime.context.script = script;
    runtime.context.data[3] = 1;
    MEScrCmd_checksum(runtime.context);
    expect(runtime.context.data[3]).toBe(1);

    const bad = createMysteryEventScriptRuntime();
    bad.context.script = bytes(...word(99), ...word(16), ...word(20), 0, 0, 0, 0, 1, 2, 3, 4);
    bad.context.data[3] = 1;
    MEScrCmd_checksum(bad.context);
    expect(bad.context.data[3]).toBe(0);
    expect(bad.context.data[2]).toBe(1);

    const crcScript = bytes(...word(CalcCRC16(payload)), ...word(16), ...word(20), 0, 0, 0, 0, 1, 2, 3, 4);
    const crcRuntime = createMysteryEventScriptRuntime();
    crcRuntime.context.script = crcScript;
    crcRuntime.context.data[3] = 1;
    MEScrCmd_crc(crcRuntime.context);
    expect(crcRuntime.context.data[3]).toBe(1);
  });
});
