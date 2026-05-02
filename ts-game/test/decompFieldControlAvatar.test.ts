import { describe, expect, test } from 'vitest';
import * as fieldControlAvatar from '../src/game/decompFieldControlAvatar';
import {
  A_BUTTON,
  DPAD_DOWN,
  DPAD_UP,
  DIR_EAST,
  DIR_NORTH,
  DIR_SOUTH,
  FLDPSN_FNT,
  FieldClearPlayerInput,
  FieldGetPlayerInput,
  FieldInput_HandleCancelSignpost,
  GetBackgroundEventAtPosition,
  GetCoordEventScriptAtPosition,
  GetCoordEventScriptAtMapPosition,
  GetInteractionScript,
  GetInteractedBackgroundEventScript,
  GetInteractedLinkPlayerScript,
  GetInteractedMetatileScript,
  GetInteractedObjectEventScript,
  GetInteractedWaterScript,
  GetSignpostScriptAtMapPosition,
  HandleBoulderActivateVictoryRoadSwitch,
  HandleBoulderFallThroughHole,
  MAP_TYPE_UNDERWATER,
  MOVING,
  PLAYER_AVATAR_FLAG_ACRO_BIKE,
  PLAYER_AVATAR_FLAG_FORCED,
  PLAYER_SPEED_FASTEST,
  ProcessPlayerFieldInput,
  QL_INPUT_DOWN,
  QL_INPUT_UP,
  SELECT_BUTTON,
  START_BUTTON,
  T_NOT_MOVING,
  T_TILE_CENTER,
  Task_QuestLogPlayback_OpenStartMenu,
  TryRunCoordEventScript,
  TrySetDiveWarp,
  createFieldControlRuntime,
  createFieldInput,
  dive_warp
} from '../src/game/decompFieldControlAvatar';
import {
  MB_BOOKSHELF,
  MB_COUNTER,
  MB_DEEP_WATER,
  MB_EAST_ARROW_WARP,
  MB_FALL_WARP,
  MB_FAST_WATER,
  MB_POKEMON_CENTER_SIGN,
  MB_STRENGTH_BUTTON,
  MB_UP_RIGHT_STAIR_WARP,
  MB_WARP_DOOR,
  MB_WATERFALL
} from '../src/game/decompMetatileBehavior';

describe('decomp field_control_avatar', () => {
  test('exports exact C field-control helpers and preserves the unreferenced happiness reset', () => {
    expect(fieldControlAvatar.QuestLogOverrideJoyVars).toBeTypeOf('function');
    expect(fieldControlAvatar.GetPlayerPosition).toBeTypeOf('function');
    expect(fieldControlAvatar.GetInFrontOfPlayerPosition).toBeTypeOf('function');
    expect(fieldControlAvatar.GetPlayerCurMetatileBehavior).toBeTypeOf('function');
    expect(fieldControlAvatar.GetInteractionScript).toBeTypeOf('function');
    expect(fieldControlAvatar.GetInteractedObjectEventScript).toBeTypeOf('function');
    expect(fieldControlAvatar.GetInteractedBackgroundEventScript).toBeTypeOf('function');
    expect(fieldControlAvatar.GetInteractedMetatileScript).toBeTypeOf('function');
    expect(fieldControlAvatar.GetInteractedWaterScript).toBeTypeOf('function');
    expect(fieldControlAvatar.TryStartInteractionScript).toBeTypeOf('function');
    expect(fieldControlAvatar.TryStartStepBasedScript).toBeTypeOf('function');
    expect(fieldControlAvatar.TryStartCoordEventScript).toBeTypeOf('function');
    expect(fieldControlAvatar.TryStartMiscWalkingScripts).toBeTypeOf('function');
    expect(fieldControlAvatar.TryStartStepCountScript).toBeTypeOf('function');
    expect(fieldControlAvatar.UpdateHappinessStepCounter).toBeTypeOf('function');
    expect(fieldControlAvatar.UpdatePoisonStepCounter).toBeTypeOf('function');
    expect(fieldControlAvatar.CheckStandardWildEncounter).toBeTypeOf('function');
    expect(fieldControlAvatar.TrySetUpWalkIntoSignpostScript).toBeTypeOf('function');
    expect(fieldControlAvatar.GetFacingSignpostType).toBeTypeOf('function');
    expect(fieldControlAvatar.SetUpWalkIntoSignScript).toBeTypeOf('function');
    expect(fieldControlAvatar.TryArrowWarp).toBeTypeOf('function');
    expect(fieldControlAvatar.TryStartWarpEventScript).toBeTypeOf('function');
    expect(fieldControlAvatar.IsWarpMetatileBehavior).toBeTypeOf('function');
    expect(fieldControlAvatar.IsArrowWarpMetatileBehavior).toBeTypeOf('function');
    expect(fieldControlAvatar.GetWarpEventAtMapPosition).toBeTypeOf('function');
    expect(fieldControlAvatar.SetupWarp).toBeTypeOf('function');
    expect(fieldControlAvatar.TryDoorWarp).toBeTypeOf('function');
    expect(fieldControlAvatar.GetWarpEventAtPosition).toBeTypeOf('function');
    expect(fieldControlAvatar.GetSignpostScriptAtMapPosition).toBeTypeOf('function');
    expect(fieldControlAvatar.TryRunCoordEventScript).toBeTypeOf('function');
    expect(fieldControlAvatar.GetCoordEventScriptAtPosition).toBeTypeOf('function');
    expect(fieldControlAvatar.GetBackgroundEventAtPosition).toBeTypeOf('function');

    const runtime = createFieldControlRuntime({ vars: { [0x403f]: 127 } });
    fieldControlAvatar.Unref_ClearHappinessStepCounter(runtime);
    expect(runtime.vars[0x403f]).toBe(0);
  });

  test('clears and samples player input with the same gating as C', () => {
    const input = createFieldInput();
    Object.assign(input, { pressedAButton: true, heldDirection: true, dpadDirection: DIR_EAST });
    FieldClearPlayerInput(input);
    expect(input).toEqual(createFieldInput());

    const runtime = createFieldControlRuntime({
      playerAvatar: { runningState: MOVING, tileTransitionState: T_TILE_CENTER, flags: 0 },
      playerSpeed: 0,
      playerPosition: pos(10, 10, 1)
    });
    FieldGetPlayerInput(runtime, input, START_BUTTON | A_BUTTON | SELECT_BUTTON, DPAD_UP);
    expect(input).toMatchObject({
      pressedStartButton: true,
      pressedAButton: true,
      pressedSelectButton: true,
      heldDirection: true,
      heldDirection2: true,
      tookStep: true,
      checkStandardWildEncounter: true,
      dpadDirection: DIR_NORTH
    });

    const blocked = createFieldInput();
    runtime.playerAvatar.flags = PLAYER_AVATAR_FLAG_FORCED;
    runtime.playerSpeed = PLAYER_SPEED_FASTEST;
    FieldGetPlayerInput(runtime, blocked, START_BUTTON | A_BUTTON, DPAD_DOWN);
    expect(blocked.pressedStartButton).toBe(false);
    expect(blocked.pressedAButton).toBe(false);
    expect(blocked.dpadDirection).toBe(DIR_SOUTH);

    const ql = createFieldInput();
    const playback = createFieldControlRuntime({
      questLogInputDpad: true,
      registeredQuestLogInput: QL_INPUT_UP,
      playerAvatar: { runningState: 0, tileTransitionState: T_NOT_MOVING, flags: 0 }
    });
    FieldGetPlayerInput(playback, ql, 0, 0);
    expect(ql.heldDirection).toBe(true);
    expect(ql.dpadDirection).toBe(DIR_NORTH);
    expect(playback.registeredQuestLogInput).toBe(0);
  });

  test('processes field input in C priority order for trainers, steps, signs, encounters, A, start, and select', () => {
    const trainer = createFieldControlRuntime({ trainersWantBattle: true });
    expect(ProcessPlayerFieldInput(trainer, createFieldInput())).toBe(1);
    expect(trainer.operations).toContain('ResetFacingNpcOrSignpostVars');

    const sign = createFieldControlRuntime({
      playerPosition: pos(20, 20, 1),
      playerFacingDirection: DIR_NORTH,
      metatileBehaviors: { ['20,19']: MB_POKEMON_CENTER_SIGN }
    });
    const signInput = createFieldInput();
    Object.assign(signInput, { checkStandardWildEncounter: true, dpadDirection: DIR_NORTH });
    expect(ProcessPlayerFieldInput(sign, signInput)).toBe(1);
    expect(sign.setupScripts).toEqual(['EventScript_PokecenterSign']);
    expect(sign.gFieldInputRecord.checkStandardWildEncounter).toBe(true);
    expect(sign.operations).toContain('SetWalkingIntoSignVars');

    const encounter = createFieldControlRuntime({
      standardWildEncounterResult: true,
      metatileAttributes: { ['7,7']: 0x44 }
    });
    const encounterInput = createFieldInput();
    encounterInput.checkStandardWildEncounter = true;
    expect(ProcessPlayerFieldInput(encounter, encounterInput)).toBe(1);
    expect(encounter.operations).toContain('TryStandardWildEncounter:68');

    const bookshelf = createFieldControlRuntime({
      playerPosition: pos(5, 5, 1),
      playerFacingDirection: DIR_NORTH,
      metatileBehaviors: { ['5,4']: MB_BOOKSHELF }
    });
    const aInput = createFieldInput();
    aInput.pressedAButton = true;
    expect(ProcessPlayerFieldInput(bookshelf, aInput)).toBe(1);
    expect(bookshelf.setupScripts).toEqual(['EventScript_Bookshelf']);
    expect(bookshelf.playedSE).toEqual([1]);

    const start = createFieldControlRuntime();
    const startInput = createFieldInput();
    startInput.pressedStartButton = true;
    expect(ProcessPlayerFieldInput(start, startInput)).toBe(1);
    expect(start.operations).toContain('ShowStartMenu');
  });

  test('step scripts preserve coord-event, poison, egg, and safari ordering', () => {
    const coord = createFieldControlRuntime({
      playerPosition: pos(9, 9, 1),
      playerAvatar: { runningState: MOVING, tileTransitionState: T_TILE_CENTER, flags: 0 },
      coordEvents: [{ x: 2, y: 2, elevation: 1, trigger: 0x4001, index: 3, script: 'CoordScript' }],
      vars: { [0x4001]: 3 }
    });
    const input = createFieldInput();
    input.tookStep = true;
    expect(ProcessPlayerFieldInput(coord, input)).toBe(1);
    expect(coord.setupScripts).toEqual(['CoordScript']);
    expect(coord.gameStats.GAME_STAT_STEPS).toBe(1);

    const poison = createFieldControlRuntime({
      playerPosition: pos(7, 7, 1),
      vars: { [0x4040]: 4 },
      poisonFieldEffectResult: FLDPSN_FNT
    });
    input.tookStep = true;
    expect(ProcessPlayerFieldInput(poison, input)).toBe(1);
    expect(poison.setupScripts).toEqual(['EventScript_FieldPoison']);

    const egg = createFieldControlRuntime({ shouldEggHatch: true });
    expect(ProcessPlayerFieldInput(egg, input)).toBe(1);
    expect(egg.setupScripts).toEqual(['EventScript_EggHatch']);
    expect(egg.gameStats.GAME_STAT_HATCHED_EGGS).toBe(1);
  });

  test('handles arrow, stair, regular, fall, and door warps with exact branch effects', () => {
    const arrow = createFieldControlRuntime({
      playerPosition: pos(10, 10, 1),
      playerFacingDirection: DIR_EAST,
      metatileBehaviors: { ['10,10']: MB_EAST_ARROW_WARP },
      warpEvents: [{ x: 3, y: 3, elevation: 1, mapGroup: 2, mapNum: 3, warpId: 4 }]
    });
    const held = createFieldInput();
    Object.assign(held, { heldDirection: true, dpadDirection: DIR_EAST });
    expect(ProcessPlayerFieldInput(arrow, held)).toBe(1);
    expect(arrow.operations).toContain('DoWarp');
    expect(arrow.warpDestination).toEqual({ kind: 'map', mapGroup: 2, mapNum: 3, warpId: 4 });

    const stair = createFieldControlRuntime({
      playerPosition: pos(10, 10, 1),
      playerFacingDirection: DIR_EAST,
      playerAvatar: { runningState: 0, tileTransitionState: T_NOT_MOVING, flags: PLAYER_AVATAR_FLAG_ACRO_BIKE },
      metatileBehaviors: { ['10,10']: MB_UP_RIGHT_STAIR_WARP },
      warpEvents: [{ x: 3, y: 3, elevation: 1, mapGroup: 2, mapNum: 3, warpId: 4 }]
    });
    expect(ProcessPlayerFieldInput(stair, held)).toBe(1);
    expect(stair.operations).toContain(`DoStairWarp:${MB_UP_RIGHT_STAIR_WARP}:12`);

    const fall = createFieldControlRuntime({
      playerPosition: pos(10, 10, 1),
      metatileBehaviors: { ['10,10']: MB_FALL_WARP },
      warpEvents: [{ x: 3, y: 3, elevation: 1, mapGroup: 2, mapNum: 3, warpId: 4 }]
    });
    const step = createFieldInput();
    step.tookStep = true;
    expect(ProcessPlayerFieldInput(fall, step)).toBe(1);
    expect(fall.setupScripts).toContain('EventScript_DoFallWarp');

    const door = createFieldControlRuntime({
      playerPosition: pos(10, 10, 1),
      playerFacingDirection: DIR_NORTH,
      metatileBehaviors: { ['10,9']: MB_WARP_DOOR },
      warpEvents: [{ x: 3, y: 2, elevation: 1, mapGroup: 8, mapNum: 9, warpId: 1 }]
    });
    const doorInput = createFieldInput();
    Object.assign(doorInput, { heldDirection2: true, dpadDirection: DIR_NORTH });
    expect(ProcessPlayerFieldInput(door, doorInput)).toBe(1);
    expect(door.operations).toContain('DoDoorWarp');
  });

  test('background, object, water, cancel-signpost, and helper paths match C outcomes', () => {
    const hidden = createFieldControlRuntime({
      playerPosition: pos(10, 10, 1),
      playerFacingDirection: DIR_NORTH,
      bgEvents: [{ x: 3, y: 2, elevation: 1, kind: 7, hiddenItem: { item: 99, flag: 77, quantity: 2 } }]
    });
    const aInput = createFieldInput();
    aInput.pressedAButton = true;
    expect(ProcessPlayerFieldInput(hidden, aInput)).toBe(1);
    expect(hidden.setupScripts).toEqual(['EventScript_HiddenItemScript']);
    expect(hidden.gSpecialVar_0x8005).toBe(99);
    expect(hidden.gSpecialVar_0x8004).toBe(77);
    expect(hidden.gSpecialVar_0x8006).toBe(2);
    expect(GetBackgroundEventAtPosition(hidden, 3, 2, 1)).toBe(hidden.bgEvents[0]);

    const counter = createFieldControlRuntime({
      objectEvents: [{ localId: 12, currentCoords: { x: 7, y: 4 }, script: 'NpcScript' }]
    });
    expect(GetInteractedObjectEventScript(counter, pos(7, 5, 1), MB_COUNTER, DIR_NORTH)).toBe('NpcScript');
    expect(GetInteractedLinkPlayerScript(counter, pos(7, 5, 1), MB_COUNTER, DIR_NORTH)).toBe('NpcScript');
    expect(counter.gSpecialVar_LastTalked).toBe(12);

    const water = createFieldControlRuntime({
      playerPosition: pos(4, 4, 1),
      playerFacingDirection: DIR_NORTH,
      metatileBehaviors: { ['4,3']: MB_FAST_WATER },
      partyHasSurf: true
    });
    expect(GetInteractedWaterScript(water, pos(4, 3, 1), MB_FAST_WATER, DIR_NORTH)).toBe('EventScript_CurrentTooFast');
    aInput.pressedAButton = true;
    expect(ProcessPlayerFieldInput(water, aInput)).toBe(1);
    expect(water.setupScripts).toEqual(['EventScript_CurrentTooFast']);

    const waterfall = createFieldControlRuntime({
      playerPosition: pos(4, 4, 1),
      playerFacingDirection: DIR_NORTH,
      metatileBehaviors: { ['4,3']: MB_WATERFALL },
      flags: new Set([0x822]),
      playerSurfingNorth: true
    });
    expect(ProcessPlayerFieldInput(waterfall, aInput)).toBe(1);
    expect(waterfall.setupScripts).toEqual(['EventScript_Waterfall']);

    expect(GetInteractedMetatileScript(waterfall, pos(4, 3, 1), MB_BOOKSHELF, DIR_NORTH)).toBe('EventScript_Bookshelf');

    const scriptedBg = createFieldControlRuntime({
      bgEvents: [{ x: 1, y: 1, elevation: 0, kind: 0, script: 'BgScript' }]
    });
    expect(GetInteractedBackgroundEventScript(scriptedBg, pos(8, 8, 0), 0, DIR_SOUTH)).toBe('BgScript');
    expect(GetSignpostScriptAtMapPosition(scriptedBg, pos(8, 8, 0))).toBe('BgScript');
    expect(GetInteractionScript(scriptedBg, pos(8, 8, 0), 0, DIR_SOUTH)).toBe('BgScript');

    const cancel = createFieldControlRuntime({
      scriptContextEnabled: true,
      canWalkAwayToCancelMsgBox: true,
      playerFacingDirection: DIR_NORTH
    });
    const cancelInput = createFieldInput();
    cancelInput.dpadDirection = DIR_SOUTH;
    FieldInput_HandleCancelSignpost(cancel, cancelInput);
    expect(cancel.registeredQuestLogInput).toBe(QL_INPUT_DOWN);
    expect(cancel.setupScripts).toEqual(['EventScript_CancelMessageBox']);
    expect(cancel.playerControlsLocked).toBe(true);

    const menu = createFieldControlRuntime({ activeTasks: new Set(['Task_QuestLogPlayback_OpenStartMenu']) });
    Task_QuestLogPlayback_OpenStartMenu(menu);
    expect(menu.activeTasks.has('Task_QuestLogPlayback_OpenStartMenu')).toBe(false);
    expect(menu.operations).toContain('ShowStartMenu');
  });

  test('coord event lookup, boulder handlers, dive helpers, and cable warp preserve side effects', () => {
    const coord = createFieldControlRuntime({
      coordEvents: [
        { x: 1, y: 1, elevation: 1, trigger: 0, index: 0, script: 'Immediate' },
        { x: 2, y: 2, elevation: 1, trigger: 0x4010, index: 5, script: 'Deferred' }
      ],
      vars: { [0x4010]: 5 }
    });
    expect(GetCoordEventScriptAtMapPosition(coord, pos(8, 8, 1))).toBeNull();
    expect(coord.immediateScripts).toEqual(['Immediate']);
    expect(GetCoordEventScriptAtMapPosition(coord, pos(9, 9, 1))).toBe('Deferred');
    expect(TryRunCoordEventScript(coord, coord.coordEvents[1])).toBe('Deferred');
    expect(GetCoordEventScriptAtPosition(coord, 2, 2, 1)).toBe('Deferred');

    const boulder = createFieldControlRuntime({
      metatileBehaviors: { ['4,4']: MB_FALL_WARP, ['5,5']: MB_STRENGTH_BUTTON },
      boulderRevealFlagByLocalIdAndMap: { ['3,1,1']: 42 },
      flags: new Set([42]),
      coordEvents: [{ x: -2, y: -2, elevation: 0, trigger: 0, index: 0, script: 'SwitchScript' }]
    });
    HandleBoulderFallThroughHole(boulder, { localId: 3, currentCoords: { x: 4, y: 4 } });
    expect(boulder.playedSE).toContain(207);
    expect(boulder.flags.has(42)).toBe(false);
    HandleBoulderActivateVictoryRoadSwitch(boulder, 5, 5);
    expect(boulder.setupScripts).toContain('SwitchScript');
    expect(boulder.playerControlsLocked).toBe(true);

    const dive = createFieldControlRuntime({
      playerPosition: pos(20, 20, 1),
      mapType: MAP_TYPE_UNDERWATER,
      setDiveWarpEmergeResult: true
    });
    expect(TrySetDiveWarp(dive)).toBe(1);
    expect(dive_warp(dive, pos(20, 20, 1), MB_DEEP_WATER)).toBe(true);
    expect(dive.operations).toContain('DoDiveWarp');

    const surfaceDive = createFieldControlRuntime({ setDiveWarpDiveResult: true });
    expect(TrySetDiveWarp(surfaceDive)).toBe(0);
    expect(dive_warp(surfaceDive, pos(20, 20, 1), MB_DEEP_WATER)).toBe(true);
  });
});

function pos(x: number, y: number, elevation: number) {
  return { x, y, elevation };
}
