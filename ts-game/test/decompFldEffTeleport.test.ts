import { describe, expect, test } from 'vitest';
import {
  FieldCallback_Teleport,
  FldEff_UseTeleport,
  SetUpFieldMove_Teleport,
  StartTeleportFieldEffect,
  doFieldEffectTeleport,
  overworldMapTypeAllowsTeleportAndFly,
  overworldResetStateAfterTeleport,
  setUpFieldMoveTeleport,
} from '../src/game/decompFldEffTeleport';
import { createPlayer } from '../src/game/player';
import { createScriptRuntimeState } from '../src/game/scripts';
import type { FieldScriptSessionState } from '../src/game/decompFieldDialogue';
import {
  loadRoute2Map,
  loadViridianCityPokemonCenter1FMap
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

describe('decompFldEffTeleport', () => {
  test('Overworld_MapTypeAllowsTeleportAndFly matches the C allow-list', () => {
    expect(overworldMapTypeAllowsTeleportAndFly('MAP_TYPE_ROUTE')).toBe(true);
    expect(overworldMapTypeAllowsTeleportAndFly('MAP_TYPE_TOWN')).toBe(true);
    expect(overworldMapTypeAllowsTeleportAndFly('MAP_TYPE_OCEAN_ROUTE')).toBe(true);
    expect(overworldMapTypeAllowsTeleportAndFly('MAP_TYPE_CITY')).toBe(true);
    expect(overworldMapTypeAllowsTeleportAndFly('MAP_TYPE_INDOOR')).toBe(false);
    expect(overworldMapTypeAllowsTeleportAndFly('MAP_TYPE_UNDERGROUND')).toBe(false);
    expect(overworldMapTypeAllowsTeleportAndFly(undefined)).toBe(false);
  });

  test('SetUpFieldMove_Teleport chooses callbacks from the current map type', () => {
    expect(loadRoute2Map().mapType).toBe('MAP_TYPE_ROUTE');
    expect(loadViridianCityPokemonCenter1FMap().mapType).toBe('MAP_TYPE_INDOOR');
    expect(SetUpFieldMove_Teleport(loadRoute2Map())).toEqual({
      ok: true,
      fieldCallback2: 'FieldCallback_PrepareFadeInFromMenu',
      postMenuFieldCallback: 'FieldCallback_Teleport'
    });
    expect(SetUpFieldMove_Teleport(loadViridianCityPokemonCenter1FMap())).toEqual({
      ok: false,
      fieldCallback2: null,
      postMenuFieldCallback: null
    });
    expect(setUpFieldMoveTeleport(loadRoute2Map()).ok).toBe(true);
  });

  test('Overworld_ResetStateAfterTeleport clears the same overworld flags and vars', () => {
    const runtime = createScriptRuntimeState();
    const player = createPlayer();
    seedOverworldResetState(runtime);
    player.avatarMode = 'machBike';
    player.runningState = 'moving';
    player.bikeState = 'slope';
    player.bikeFrameCounter = 2;

    overworldResetStateAfterTeleport(runtime, player);

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

  test('FieldCallback_Teleport starts FLDEFF_USE_TELEPORT and copies GetCursorSelectionMonId', () => {
    const runtime = createScriptRuntimeState();
    const player = createPlayer();
    seedOverworldResetState(runtime);
    runtime.vars.cursorSelectionMonId = 2;

    FieldCallback_Teleport(runtime, player);

    expect(runtime.stringVars.activeFieldEffect).toBe('FLDEFF_USE_TELEPORT');
    expect(runtime.vars.fieldEffectArgument_0).toBe(2);
    expect(runtime.flags.has('FLAG_SYS_FLASH_ACTIVE')).toBe(false);
  });

  test('FldEff_UseTeleport and StartTeleportFieldEffect preserve the task handoff', () => {
    const runtime = createScriptRuntimeState();
    const player = createPlayer();
    player.avatarMode = 'acroBike';

    expect(FldEff_UseTeleport(runtime, player)).toBe(false);
    expect(runtime.vars.fieldEffectShowMonTaskCreated).toBe(1);
    expect(runtime.stringVars.fieldEffectDataFunc).toBe('StartTeleportFieldEffect');
    expect(player.avatarMode).toBe('normal');

    runtime.stringVars.activeFieldEffect = 'FLDEFF_USE_TELEPORT';
    StartTeleportFieldEffect(runtime);

    expect(runtime.stringVars.activeFieldEffect).toBe('');
    expect(runtime.vars.teleportFieldEffectTaskCreated).toBe(1);
  });

  test('dofieldeffect FLDEFF_USE_TELEPORT opens the teleport field-effect wait state', () => {
    const runtime = createScriptRuntimeState();
    const session = createSession();
    const player = createPlayer();

    doFieldEffectTeleport(runtime, session, player);

    expect(runtime.vars.fieldEffectShowMonTaskCreated).toBe(1);
    expect(runtime.vars.teleportFieldEffectTaskCreated).toBe(1);
    expect(session.specialState).toEqual({ kind: 'teleportFieldEffect' });
  });
});
