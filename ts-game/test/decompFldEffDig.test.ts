import { describe, expect, test } from 'vitest';
import {
  FieldCallback_Dig,
  FldEff_UseDig,
  SetUpFieldMove_Dig,
  StartDigFieldEffect,
  canUseEscapeRopeOnCurrMap,
  doFieldEffectDig,
  overworldResetStateAfterDigEscRope,
  setUpFieldMoveDig,
} from '../src/game/decompFldEffDig';
import { createPlayer } from '../src/game/player';
import { createScriptRuntimeState } from '../src/game/scripts';
import type { FieldScriptSessionState } from '../src/game/decompFieldDialogue';
import {
  loadRockTunnel1FMap,
  loadRoute2Map
} from '../src/world/mapSource';

const createSession = (): FieldScriptSessionState => ({
  rootScriptId: 'EventScript_Test',
  currentLabel: 'EventScript_Test',
  lineIndex: 0,
  lastTrainerId: null,
  hiddenItemFlag: null,
  loadedPointerTextLabel: null,
  callStack: [],
  waitingFor: null,
  movingLocalId: 0,
  waitingMovementLocalId: null,
  suspendedChoice: null,
  specialState: null,
  messageBoxFrame: 'std',
  messageBoxAutoScroll: false
});

const seedOverworldResetState = (runtime: ReturnType<typeof createScriptRuntimeState>): void => {
  runtime.flags.add('FLAG_SYS_ON_CYCLING_ROAD');
  runtime.flags.add('FLAG_SYS_CRUISE_MODE');
  runtime.flags.add('FLAG_SYS_SAFARI_MODE');
  runtime.flags.add('FLAG_SYS_USE_STRENGTH');
  runtime.flags.add('FLAG_SYS_FLASH_ACTIVE');
  runtime.flags.add('FLAG_SYS_QL_DEPARTED');
  runtime.vars.VAR_MAP_SCENE_ROUTE16 = 7;
  runtime.vars.VAR_MAP_SCENE_FUCHSIA_CITY_SAFARI_ZONE_ENTRANCE = 8;
  runtime.vars.VAR_QL_ENTRANCE = 9;
};

describe('decompFldEffDig', () => {
  test('SetUpFieldMove_Dig follows CanUseEscapeRopeOnCurrMap', () => {
    expect(loadRockTunnel1FMap().allowEscaping).toBe(true);
    expect(loadRoute2Map().allowEscaping).toBe(false);
    expect(canUseEscapeRopeOnCurrMap(loadRockTunnel1FMap())).toBe(true);
    expect(canUseEscapeRopeOnCurrMap(loadRoute2Map())).toBe(false);
    expect(SetUpFieldMove_Dig(loadRockTunnel1FMap())).toEqual({
      ok: true,
      fieldCallback2: 'FieldCallback_PrepareFadeInFromMenu',
      postMenuFieldCallback: 'FieldCallback_Dig'
    });
    expect(SetUpFieldMove_Dig(loadRoute2Map())).toEqual({
      ok: false,
      fieldCallback2: null,
      postMenuFieldCallback: null
    });
    expect(setUpFieldMoveDig(loadRockTunnel1FMap()).ok).toBe(true);
  });

  test('Overworld_ResetStateAfterDigEscRope clears the same overworld flags and vars', () => {
    const runtime = createScriptRuntimeState();
    const player = createPlayer();
    seedOverworldResetState(runtime);
    player.avatarMode = 'machBike';
    player.runningState = 'moving';
    player.bikeState = 'slope';
    player.bikeFrameCounter = 2;

    overworldResetStateAfterDigEscRope(runtime, player);

    expect(player.avatarMode).toBe('normal');
    expect(player.runningState).toBe('notMoving');
    expect(player.bikeState).toBe('normal');
    expect(player.bikeFrameCounter).toBe(0);
    expect(runtime.flags.has('FLAG_SYS_ON_CYCLING_ROAD')).toBe(false);
    expect(runtime.flags.has('FLAG_SYS_CRUISE_MODE')).toBe(false);
    expect(runtime.flags.has('FLAG_SYS_SAFARI_MODE')).toBe(false);
    expect(runtime.flags.has('FLAG_SYS_USE_STRENGTH')).toBe(false);
    expect(runtime.flags.has('FLAG_SYS_FLASH_ACTIVE')).toBe(false);
    expect(runtime.flags.has('FLAG_SYS_QL_DEPARTED')).toBe(false);
    expect(runtime.vars.VAR_MAP_SCENE_ROUTE16).toBe(0);
    expect(runtime.vars.VAR_MAP_SCENE_FUCHSIA_CITY_SAFARI_ZONE_ENTRANCE).toBe(0);
    expect(runtime.vars.VAR_QL_ENTRANCE).toBe(0);
  });

  test('FieldCallback_Dig starts FLDEFF_USE_DIG and copies GetCursorSelectionMonId', () => {
    const runtime = createScriptRuntimeState();
    const player = createPlayer();
    seedOverworldResetState(runtime);
    runtime.vars.cursorSelectionMonId = 3;

    FieldCallback_Dig(runtime, player);

    expect(runtime.stringVars.activeFieldEffect).toBe('FLDEFF_USE_DIG');
    expect(runtime.vars.fieldEffectArgument_0).toBe(3);
    expect(runtime.flags.has('FLAG_SYS_FLASH_ACTIVE')).toBe(false);
  });

  test('FldEff_UseDig and StartDigFieldEffect preserve the task handoff', () => {
    const runtime = createScriptRuntimeState();
    const player = createPlayer();
    player.avatarMode = 'acroBike';

    expect(FldEff_UseDig(runtime, player)).toBe(false);
    expect(runtime.vars.fieldEffectShowMonTaskCreated).toBe(1);
    expect(runtime.stringVars.fieldEffectDataFunc).toBe('StartDigFieldEffect');
    expect(player.avatarMode).toBe('normal');

    runtime.stringVars.activeFieldEffect = 'FLDEFF_USE_DIG';
    StartDigFieldEffect(runtime);

    expect(runtime.stringVars.activeFieldEffect).toBe('');
    expect(runtime.vars.useDigEscapeRopeTaskCreated).toBe(1);
    expect(runtime.vars.useDigEscapeRopeTaskData0).toBe(0);
  });

  test('dofieldeffect FLDEFF_USE_DIG opens the dig field-effect wait state', () => {
    const runtime = createScriptRuntimeState();
    const session = createSession();
    const player = createPlayer();

    doFieldEffectDig(runtime, session, player);

    expect(runtime.vars.fieldEffectShowMonTaskCreated).toBe(1);
    expect(runtime.vars.useDigEscapeRopeTaskCreated).toBe(1);
    expect(session.specialState).toEqual({ kind: 'digFieldEffect' });
  });
});
