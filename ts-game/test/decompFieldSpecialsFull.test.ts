import { describe, expect, test } from 'vitest';
import {
  AreLeadMonEVsMaxedOut,
  CapeBrinkGetMoveToTeachLeadPokemon,
  CheckAddCoins,
  CountDigits,
  DIR_NORTH,
  DoDeoxysTriangleInteraction,
  GetLeadMonFriendship,
  GetLeadMonIndex,
  GetPlayerTrainerId,
  GetPlayerTrainerIdOnesDigit,
  HasLearnedAllMovesFromCapeBrinkTutor,
  ITEM_LUXURY_BALL,
  MOVETUTOR_FRENZY_PLANT,
  MOVE_FRENZY_PLANT,
  MoveDeoxysObject,
  PLAYER_AVATAR_FLAG_ACRO_BIKE,
  PLAYER_AVATAR_FLAG_MACH_BIKE,
  SPECIES_BULBASAUR,
  SPECIES_EGG,
  SPECIES_NONE,
  SPECIES_VENUSAUR,
  SetVermilionTrashCans,
  ShakeScreen,
  Task_DoDeoxysTriangleInteraction,
  Task_ShakeScreen,
  TYPE_GRASS,
  UsedPokemonCenterWarp,
  createFieldSpecialsRuntime,
  ForcePlayerOntoBike,
  FIELD_SPECIALS_C_TRANSLATION_UNIT,
  GetPlayerAvatarBike,
  PlayerHasGrassPokemonInParty,
  SampleResortGorgeousMonAndReward,
  ShouldShowBoxWasFullMessage,
  IsDestinationBoxFull,
  BrailleCursorToggle,
  PlayerPartyContainsSpeciesWithPlayerID
} from '../src/game/decompFieldSpecials';

describe('decompFieldSpecialsFull', () => {
  test('anchors the exact field_specials.c translation unit', () => {
    expect(FIELD_SPECIALS_C_TRANSLATION_UNIT).toBe('src/field_specials.c');
  });

  test('player, trainer id, bike, and party grass helpers preserve branch behavior', () => {
    const runtime = createFieldSpecialsRuntime();
    runtime.player.trainerId = [0x39, 0x30, 0, 0];
    runtime.player.avatarFlags = PLAYER_AVATAR_FLAG_ACRO_BIKE;
    runtime.party[0] = { species: SPECIES_EGG };
    runtime.party[1] = { species: SPECIES_BULBASAUR, friendship: 201, evTotal: 510, types: [TYPE_GRASS, 3], otId: 0x3039 };

    expect(GetPlayerTrainerIdOnesDigit(runtime)).toBe(5);
    expect(GetPlayerTrainerId(runtime)).toBe(0x3039);
    expect(GetPlayerAvatarBike(runtime)).toBe(1);

    runtime.player.avatarFlags = 1;
    ForcePlayerOntoBike(runtime);
    expect(runtime.player.avatarFlags).toBe(PLAYER_AVATAR_FLAG_MACH_BIKE);
    expect(GetPlayerAvatarBike(runtime)).toBe(2);
    expect(GetLeadMonIndex(runtime)).toBe(1);
    expect(GetLeadMonFriendship(runtime)).toBe(5);
    expect(AreLeadMonEVsMaxedOut(runtime)).toBe(true);
    expect(PlayerHasGrassPokemonInParty(runtime)).toBe(true);
  });

  test('randomized trash cans and Resort Gorgeous sampling follow bounded C tables', () => {
    const runtime = createFieldSpecialsRuntime();
    runtime.randomValues = [0, 1, 31, 40];

    SetVermilionTrashCans(runtime);
    expect(runtime.vars.gSpecialVar_0x8004).toBe(1);
    expect(runtime.vars.gSpecialVar_0x8005).toBe(6);

    SampleResortGorgeousMonAndReward(runtime);
    expect(runtime.vars.VAR_RESORT_GORGEOUS_REQUESTED_MON).toBe(32);
    expect(runtime.vars.VAR_RESORT_GORGEOUS_REWARD).toBe(ITEM_LUXURY_BALL);
    expect(runtime.strings[0]).toBe('SPECIES_32');
  });

  test('screen shake task mirrors timer, sign flip, and completion', () => {
    const runtime = createFieldSpecialsRuntime();
    runtime.vars.gSpecialVar_0x8004 = 2;
    runtime.vars.gSpecialVar_0x8005 = 3;
    runtime.vars.gSpecialVar_0x8006 = 2;
    runtime.vars.gSpecialVar_0x8007 = 2;

    ShakeScreen(runtime);
    expect(runtime.tasks[0].data.slice(0, 5)).toEqual([3, 0, 2, 2, 2]);
    Task_ShakeScreen(0, runtime);
    expect(runtime.tasks[0].destroyed).toBe(false);
    Task_ShakeScreen(0, runtime);
    expect(runtime.operations).toContain('SetCameraPanning:-3:-2');
    Task_ShakeScreen(0, runtime);
    Task_ShakeScreen(0, runtime);
    expect(runtime.tasks[0].destroyed).toBe(true);
    expect(runtime.operations).toContain('ScriptContext_Enable');
  });

  test('box routing matches destination-box full message rules', () => {
    const runtime = createFieldSpecialsRuntime();
    runtime.currentBox = 0;
    runtime.vars.VAR_PC_BOX_TO_SEND_MON = 1;
    runtime.boxes[0].fill(1);
    runtime.boxes[1].fill(1);
    runtime.boxes[2][0] = SPECIES_NONE;

    expect(IsDestinationBoxFull(runtime)).toBe(true);
    expect(runtime.vars.VAR_PC_BOX_TO_SEND_MON).toBe(2);
    expect(ShouldShowBoxWasFullMessage(runtime)).toBe(false);
  });

  test('Cape Brink tutor sets tutor vars, move name, known move count, and learned flags', () => {
    const runtime = createFieldSpecialsRuntime();
    runtime.party[0] = { species: SPECIES_VENUSAUR, friendship: 255, moves: [MOVE_FRENZY_PLANT, 1, 0, 0] };

    expect(CapeBrinkGetMoveToTeachLeadPokemon(runtime)).toBe(true);
    expect(runtime.vars.gSpecialVar_0x8005).toBe(MOVETUTOR_FRENZY_PLANT);
    expect(runtime.vars.gSpecialVar_0x8006).toBe(2);
    expect(runtime.strings[1]).toBe(`MOVE_${MOVE_FRENZY_PLANT}`);
    expect(HasLearnedAllMovesFromCapeBrinkTutor(runtime)).toBe(false);
  });

  test('Deoxys triangle interaction advances, resets on too many steps, and awakens at ten', () => {
    const runtime = createFieldSpecialsRuntime();

    DoDeoxysTriangleInteraction(runtime);
    Task_DoDeoxysTriangleInteraction(0, runtime);
    expect(runtime.specialResult).toBe(1);
    expect(runtime.vars.VAR_DEOXYS_INTERACTION_NUM).toBe(1);

    runtime.vars.VAR_DEOXYS_INTERACTION_NUM = 1;
    runtime.vars.VAR_DEOXYS_INTERACTION_STEP_COUNTER = 5;
    Task_DoDeoxysTriangleInteraction(0, runtime);
    expect(runtime.specialResult).toBe(0);
    expect(runtime.vars.VAR_DEOXYS_INTERACTION_NUM).toBe(0);

    runtime.vars.VAR_DEOXYS_INTERACTION_NUM = 10;
    Task_DoDeoxysTriangleInteraction(0, runtime);
    expect(runtime.specialResult).toBe(2);

    MoveDeoxysObject(3, runtime);
    expect(runtime.operations.some((op) => op.includes('FieldEffectStart:MOVE_DEOXYS_ROCK:19,14'))).toBe(true);
  });

  test('misc helpers cover digit counting, coin cap, pokecenter warps, braille cursor, and OT species match', () => {
    const runtime = createFieldSpecialsRuntime();
    runtime.specialResult = 9000;
    runtime.vars.gSpecialVar_0x8006 = 999;
    expect(CheckAddCoins(runtime)).toBe(true);
    runtime.vars.gSpecialVar_0x8006 = 1000;
    expect(CheckAddCoins(runtime)).toBe(false);

    expect(CountDigits(99999999)).toBe(8);
    expect(CountDigits(100000000)).toBe(1);

    runtime.lastUsedWarp = { mapGroup: 1, mapNum: 1 };
    expect(UsedPokemonCenterWarp(runtime)).toBe(true);

    runtime.vars.gSpecialVar_0x8004 = 4;
    runtime.vars.gSpecialVar_0x8005 = 12;
    runtime.vars.gSpecialVar_0x8006 = 0;
    BrailleCursorToggle(runtime);
    expect(runtime.brailleTextCursorSpriteID).toBe(31);

    runtime.player.trainerId = [1, 0, 0, 0];
    runtime.party[0] = { species: SPECIES_BULBASAUR, otId: 1 };
    runtime.vars.gSpecialVar_0x8004 = SPECIES_BULBASAUR;
    expect(PlayerPartyContainsSpeciesWithPlayerID(runtime)).toBe(true);

    runtime.player.facing = DIR_NORTH;
  });
});
