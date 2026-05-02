import { describe, expect, test } from 'vitest';
import {
  AILMENT_BRN,
  AILMENT_FRZ,
  AILMENT_NONE,
  AILMENT_PRZ,
  AILMENT_PSN,
  AILMENT_SLP,
  AllMonsFainted,
  DoPoisonFieldEffect,
  FLDPSN_FNT,
  FLDPSN_NONE,
  FLDPSN_PSN,
  FRIENDSHIP_EVENT_FAINT_OUTSIDE_BATTLE,
  FaintFromFieldPoison,
  GetAilmentFromStatus,
  IsMonValidSpecies,
  MonFaintedFromPoison,
  PARTY_SIZE,
  SPECIES_EGG,
  SPECIES_NONE,
  STATUS1_BURN,
  STATUS1_FREEZE,
  STATUS1_NONE,
  STATUS1_PARALYSIS,
  STATUS1_POISON,
  STATUS1_SLEEP,
  STATUS1_TOXIC_POISON,
  Task_TryFieldPoisonWhiteOut,
  TryFieldPoisonWhiteOut,
  createFieldPoisonPokemon,
  createFieldPoisonRuntime,
  createFieldPoisonEffectState,
  fldEffPoisonIsActive,
  fldEffPoisonStart,
  stepFieldPoisonEffect
} from '../src/game/decompFieldPoison';

describe('decomp fldeff_poison', () => {
  test('starts inactive and becomes active when started', () => {
    const effect = createFieldPoisonEffectState();
    expect(fldEffPoisonIsActive(effect)).toBe(false);

    fldEffPoisonStart(effect);
    expect(fldEffPoisonIsActive(effect)).toBe(true);
    expect(effect.mosaic).toBe(0);
  });

  test('follows the rev0 task mosaic sequence from the C state machine', () => {
    const effect = createFieldPoisonEffectState();
    fldEffPoisonStart(effect);

    const mosaicFrames: number[] = [];
    while (fldEffPoisonIsActive(effect)) {
      stepFieldPoisonEffect(effect);
      mosaicFrames.push(effect.mosaic);
    }

    expect(mosaicFrames).toEqual([1, 2, 3, 4, 5, 4, 3, 2, 1, 0, 0]);
  });

  test('GetAilmentFromStatus follows party_menu.c priority and treats toxic as poison', () => {
    expect(GetAilmentFromStatus(STATUS1_NONE)).toBe(AILMENT_NONE);
    expect(GetAilmentFromStatus(STATUS1_POISON)).toBe(AILMENT_PSN);
    expect(GetAilmentFromStatus(STATUS1_TOXIC_POISON)).toBe(AILMENT_PSN);
    expect(GetAilmentFromStatus(STATUS1_PARALYSIS)).toBe(AILMENT_PRZ);
    expect(GetAilmentFromStatus(STATUS1_SLEEP)).toBe(AILMENT_SLP);
    expect(GetAilmentFromStatus(STATUS1_FREEZE)).toBe(AILMENT_FRZ);
    expect(GetAilmentFromStatus(STATUS1_BURN)).toBe(AILMENT_BRN);
    expect(GetAilmentFromStatus(STATUS1_POISON | STATUS1_PARALYSIS)).toBe(AILMENT_PSN);
  });

  test('species validity and all-fainted checks match field_poison.c species-or-egg rules', () => {
    expect(IsMonValidSpecies(createFieldPoisonPokemon({ species: SPECIES_NONE }))).toBe(false);
    expect(IsMonValidSpecies(createFieldPoisonPokemon({ species: 25, speciesOrEgg: SPECIES_EGG }))).toBe(false);
    expect(IsMonValidSpecies(createFieldPoisonPokemon({ species: 25 }))).toBe(true);

    const runtime = createFieldPoisonRuntime({
      gPlayerParty: [
        createFieldPoisonPokemon({ species: SPECIES_NONE, hp: 50 }),
        createFieldPoisonPokemon({ species: 25, speciesOrEgg: SPECIES_EGG, hp: 50 }),
        createFieldPoisonPokemon({ species: 1, hp: 0 }),
        ...Array.from({ length: PARTY_SIZE - 3 }, () => createFieldPoisonPokemon({ species: SPECIES_NONE, hp: 0 }))
      ]
    });
    expect(AllMonsFainted(runtime)).toBe(true);

    runtime.gPlayerParty[2].hp = 1;
    expect(AllMonsFainted(runtime)).toBe(false);
  });

  test('DoPoisonFieldEffect damages poisoned party mons, starts effect, and returns exact enum result', () => {
    const runtime = createFieldPoisonRuntime({
      gPlayerParty: [
        createFieldPoisonPokemon({ species: 1, hp: 7, status: STATUS1_POISON }),
        createFieldPoisonPokemon({ species: 4, hp: 1, status: STATUS1_TOXIC_POISON }),
        createFieldPoisonPokemon({ species: 7, hp: 12, status: STATUS1_NONE }),
        createFieldPoisonPokemon({ species: SPECIES_NONE, hp: 20, status: STATUS1_POISON }),
        createFieldPoisonPokemon({ species: 25, hp: 0, status: STATUS1_POISON }),
        createFieldPoisonPokemon({ species: 39, hp: 9, status: STATUS1_BURN })
      ]
    });

    expect(DoPoisonFieldEffect(runtime)).toBe(FLDPSN_FNT);
    expect(runtime.gPlayerParty.map((mon) => mon.hp)).toEqual([6, 0, 12, 20, 0, 9]);
    expect(runtime.fieldPoisonEffect.active).toBe(true);
    expect(runtime.operations).toEqual(['FldEffPoison_Start']);

    const poisonedRuntime = createFieldPoisonRuntime({
      gPlayerParty: [
        createFieldPoisonPokemon({ species: 1, hp: 2, status: STATUS1_POISON }),
        ...Array.from({ length: PARTY_SIZE - 1 }, () => createFieldPoisonPokemon({ species: SPECIES_NONE, hp: 0 }))
      ]
    });
    expect(DoPoisonFieldEffect(poisonedRuntime)).toBe(FLDPSN_PSN);
    expect(poisonedRuntime.gPlayerParty[0].hp).toBe(1);

    const noneRuntime = createFieldPoisonRuntime();
    expect(DoPoisonFieldEffect(noneRuntime)).toBe(FLDPSN_NONE);
    expect(noneRuntime.operations).toEqual([]);
  });

  test('FaintFromFieldPoison and MonFaintedFromPoison preserve status, friendship, and nickname behavior', () => {
    const runtime = createFieldPoisonRuntime({
      gPlayerParty: [
        createFieldPoisonPokemon({ species: 4, hp: 0, status: STATUS1_POISON, nickname: 'CHAR' }),
        ...Array.from({ length: PARTY_SIZE - 1 }, () => createFieldPoisonPokemon({ species: SPECIES_NONE, hp: 0 }))
      ]
    });

    expect(MonFaintedFromPoison(runtime, 0)).toBe(true);
    FaintFromFieldPoison(runtime, 0);
    expect(runtime.gPlayerParty[0].status).toBe(STATUS1_NONE);
    expect(runtime.gPlayerParty[0].friendshipEvents).toEqual([FRIENDSHIP_EVENT_FAINT_OUTSIDE_BATTLE]);
    expect(runtime.gStringVar1).toBe('CHAR');
    expect(MonFaintedFromPoison(runtime, 0)).toBe(false);
    expect(runtime.operations).toEqual([
      `AdjustFriendship:0:${FRIENDSHIP_EVENT_FAINT_OUTSIDE_BATTLE}`,
      'StringGet_Nickname:CHAR'
    ]);
  });

  test('TryFieldPoisonWhiteOut creates the async task and Task_TryFieldPoisonWhiteOut walks C states', () => {
    const runtime = createFieldPoisonRuntime({
      gPlayerParty: [
        createFieldPoisonPokemon({ species: 1, hp: 0, status: STATUS1_POISON, nickname: 'BULBA' }),
        createFieldPoisonPokemon({ species: 4, hp: 5, status: STATUS1_NONE, nickname: 'CHAR' }),
        createFieldPoisonPokemon({ species: 7, hp: 0, status: STATUS1_TOXIC_POISON, nickname: 'SQUIRT' }),
        ...Array.from({ length: PARTY_SIZE - 3 }, () => createFieldPoisonPokemon({ species: SPECIES_NONE, hp: 0 }))
      ]
    });

    const task = TryFieldPoisonWhiteOut(runtime);
    expect(runtime.scriptContextStopped).toBe(true);
    expect(runtime.operations).toEqual([
      'CreateTask:Task_TryFieldPoisonWhiteOut:80',
      'ScriptContext_Stop'
    ]);

    Task_TryFieldPoisonWhiteOut(runtime, task);
    expect(task.data[0]).toBe(1);
    expect(task.data[1]).toBe(0);
    expect(runtime.gStringVar1).toBe('BULBA');
    expect(runtime.operations.at(-1)).toBe('ShowFieldMessage:gText_PkmnFainted3');

    Task_TryFieldPoisonWhiteOut(runtime, task);
    expect(task.data[0]).toBe(1);

    runtime.fieldMessageBoxHidden = true;
    Task_TryFieldPoisonWhiteOut(runtime, task);
    expect(task.data[0]).toBe(0);

    Task_TryFieldPoisonWhiteOut(runtime, task);
    expect(task.data[0]).toBe(1);
    expect(task.data[1]).toBe(2);
    expect(runtime.gStringVar1).toBe('SQUIRT');

    Task_TryFieldPoisonWhiteOut(runtime, task);
    expect(task.data[0]).toBe(0);

    Task_TryFieldPoisonWhiteOut(runtime, task);
    expect(task.data[0]).toBe(2);

    Task_TryFieldPoisonWhiteOut(runtime, task);
    expect(runtime.gSpecialVar_Result).toBe(false);
    expect(runtime.scriptContextStopped).toBe(false);
    expect(task.destroyed).toBe(true);
    expect(runtime.operations.slice(-2)).toEqual(['ScriptContext_Enable', `DestroyTask:${task.id}`]);
  });
});
