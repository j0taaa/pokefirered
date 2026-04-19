import { describe, expect, test } from 'vitest';
import {
  createScriptRuntimeState,
  isScriptFlagSet,
  isViridianGymLocked,
  prototypeScriptRegistry,
  runScriptById,
  setScriptFlag,
  viridianCityTryUnlockGym
} from '../src/game/scripts';
import { createDialogueState } from '../src/game/interaction';
import { createPlayer } from '../src/game/player';
import type { ScriptRuntimeState } from '../src/game/scripts';

const GYM_DOOR_VAR = 'VAR_MAP_SCENE_VIRIDIAN_CITY_GYM_DOOR';

const REQUIRED_BADGES = [
  'FLAG_BADGE02_GET',
  'FLAG_BADGE03_GET',
  'FLAG_BADGE04_GET',
  'FLAG_BADGE05_GET',
  'FLAG_BADGE06_GET',
  'FLAG_BADGE07_GET'
] as const;

const createContext = (runtime: ScriptRuntimeState) => ({
  player: createPlayer(),
  dialogue: createDialogueState(),
  runtime
});

describe('Viridian Gym locked/unlocked behavior', () => {
  test('gym is locked by default', () => {
    const runtime = createScriptRuntimeState();
    expect(isViridianGymLocked(runtime)).toBe(true);
    expect(runtime.vars[GYM_DOOR_VAR]).toBeUndefined();
  });

  test('viridianCityTryUnlockGym does nothing without badges', () => {
    const runtime = createScriptRuntimeState();
    expect(viridianCityTryUnlockGym(runtime)).toBe(false);
    expect(isViridianGymLocked(runtime)).toBe(true);
  });

  test('viridianCityTryUnlockGym does nothing with partial badges', () => {
    const runtime = createScriptRuntimeState();
    for (const badge of REQUIRED_BADGES.slice(0, 4)) {
      setScriptFlag(runtime, badge);
    }
    expect(viridianCityTryUnlockGym(runtime)).toBe(false);
    expect(isViridianGymLocked(runtime)).toBe(true);
  });

  test('viridianCityTryUnlockGym does nothing with 5 of 6 badges', () => {
    const runtime = createScriptRuntimeState();
    for (const badge of REQUIRED_BADGES.slice(0, 5)) {
      setScriptFlag(runtime, badge);
    }
    expect(viridianCityTryUnlockGym(runtime)).toBe(false);
    expect(isViridianGymLocked(runtime)).toBe(true);
  });

  test('viridianCityTryUnlockGym unlocks with all 6 required badges (02-07)', () => {
    const runtime = createScriptRuntimeState();
    for (const badge of REQUIRED_BADGES) {
      setScriptFlag(runtime, badge);
    }
    expect(viridianCityTryUnlockGym(runtime)).toBe(true);
    expect(isViridianGymLocked(runtime)).toBe(false);
    expect(runtime.vars[GYM_DOOR_VAR]).toBe(1);
  });

  test('badge01 (Boulder Badge) is NOT required to unlock the gym', () => {
    const runtime = createScriptRuntimeState();
    for (const badge of REQUIRED_BADGES) {
      setScriptFlag(runtime, badge);
    }
    expect(isScriptFlagSet(runtime, 'FLAG_BADGE01_GET')).toBe(false);
    expect(viridianCityTryUnlockGym(runtime)).toBe(true);
  });

  test('viridianCityTryUnlockGym is idempotent once unlocked', () => {
    const runtime = createScriptRuntimeState();
    for (const badge of REQUIRED_BADGES) {
      setScriptFlag(runtime, badge);
    }
    expect(viridianCityTryUnlockGym(runtime)).toBe(true);
    expect(viridianCityTryUnlockGym(runtime)).toBe(false);
    expect(runtime.vars[GYM_DOOR_VAR]).toBe(1);
  });

  test('ViridianCity_EventScript_GymDoorLocked script shows locked message', () => {
    const runtime = createScriptRuntimeState();
    const context = createContext(runtime);
    runScriptById('ViridianCity_EventScript_GymDoorLocked', context);
    expect(context.dialogue.active).toBe(true);
    expect(context.dialogue.text).toContain("VIRIDIAN GYM's doors are locked...");
  });

  test('ViridianCity_EventScript_GymDoor shows locked message when var is 0', () => {
    const runtime = createScriptRuntimeState();
    const context = createContext(runtime);
    runScriptById('ViridianCity_EventScript_GymDoor', context);
    expect(context.dialogue.active).toBe(true);
  });

  test('ViridianCity_EventScript_GymDoor does nothing when var is 1', () => {
    const runtime = createScriptRuntimeState();
    runtime.vars[GYM_DOOR_VAR] = 1;
    const context = createContext(runtime);
    const result = runScriptById('ViridianCity_EventScript_GymDoor', context);
    expect(result).toBe(true);
    expect(context.dialogue.active).toBe(false);
  });

  test('ViridianCity_EventScript_GymSign shows sign text', () => {
    const runtime = createScriptRuntimeState();
    const context = createContext(runtime);
    runScriptById('ViridianCity_EventScript_GymSign', context);
    expect(context.dialogue.active).toBe(true);
    expect(context.dialogue.text).toContain('VIRIDIAN CITY');
  });

  test('ViridianCity_Gym_EventScript_GymStatue shows unknown leader before defeating Giovanni', () => {
    const runtime = createScriptRuntimeState();
    const context = createContext(runtime);
    runScriptById('ViridianCity_Gym_EventScript_GymStatue', context);
    expect(context.dialogue.active).toBe(true);
    expect(context.dialogue.text).toContain('LEADER: ?');
  });

  test('ViridianCity_Gym_EventScript_GymStatue shows Giovanni after defeating him', () => {
    const runtime = createScriptRuntimeState();
    setScriptFlag(runtime, 'FLAG_BADGE08_GET');
    const context = createContext(runtime);
    runScriptById('ViridianCity_Gym_EventScript_GymStatue', context);
    expect(context.dialogue.active).toBe(true);
    expect(context.dialogue.text).toContain('LEADER: GIOVANNI');
  });

  test('ViridianCity_Gym_EventScript_Giovanni shows intro when not defeated', () => {
    const runtime = createScriptRuntimeState();
    const context = createContext(runtime);
    runScriptById('ViridianCity_Gym_EventScript_Giovanni', context);
    expect(context.dialogue.active).toBe(true);
    expect(context.dialogue.text).toContain('finally arrived');
    expect(context.dialogue.queue).toEqual(
      expect.arrayContaining([expect.stringContaining('GIOVANNI')])
    );
  });

  test('ViridianCity_Gym_EventScript_Giovanni shows farewell when defeated', () => {
    const runtime = createScriptRuntimeState();
    setScriptFlag(runtime, 'FLAG_DEFEATED_LEADER_GIOVANNI');
    const context = createContext(runtime);
    runScriptById('ViridianCity_Gym_EventScript_Giovanni', context);
    expect(context.dialogue.active).toBe(true);
    expect(context.dialogue.text).toContain('Having lost');
  });

  test('ViridianCity_Gym_EventScript_GymGuy shows pre-defeat dialogue', () => {
    const runtime = createScriptRuntimeState();
    const context = createContext(runtime);
    runScriptById('ViridianCity_Gym_EventScript_GymGuy', context);
    expect(context.dialogue.active).toBe(true);
    expect(context.dialogue.text).toContain('Champ in the making');
  });

  test('ViridianCity_Gym_EventScript_GymGuy shows post-defeat dialogue', () => {
    const runtime = createScriptRuntimeState();
    setScriptFlag(runtime, 'FLAG_DEFEATED_LEADER_GIOVANNI');
    const context = createContext(runtime);
    runScriptById('ViridianCity_Gym_EventScript_GymGuy', context);
    expect(context.dialogue.active).toBe(true);
    expect(context.dialogue.text).toContain('GIOVANNI was the GYM LEADER');
  });

  test('all 8 gym trainer scripts are registered', () => {
    const trainerIds = [
      'ViridianCity_Gym_EventScript_Takashi',
      'ViridianCity_Gym_EventScript_Yuji',
      'ViridianCity_Gym_EventScript_Atsushi',
      'ViridianCity_Gym_EventScript_Jason',
      'ViridianCity_Gym_EventScript_Cole',
      'ViridianCity_Gym_EventScript_Kiyo',
      'ViridianCity_Gym_EventScript_Samuel',
      'ViridianCity_Gym_EventScript_Warren'
    ];
    for (const id of trainerIds) {
      expect(prototypeScriptRegistry[id]).toBeDefined();
      const runtime = createScriptRuntimeState();
      const context = createContext(runtime);
      expect(runScriptById(id, context)).toBe(true);
      expect(context.dialogue.active).toBe(true);
    }
  });
});
