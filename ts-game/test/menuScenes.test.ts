import { describe, expect, test } from 'vitest';
import {
  createPokemonCenterState,
  startNurseDialogue,
  advanceNurseDialogue,
  openPcFromCenter,
  closePcFromCenter,
  isHealingAnimationActive,
  getHealingProgress,
  NURSE_TAKE_POKEMON_TEXT,
  NURSE_RESTORED_TEXT,
  NURSE_GOODBYE_TEXT,
  NURSE_DECLINE_TEXT,
  HEALING_ANIMATION_DURATION_FRAMES
} from '../src/game/pokemonCenter';
import { createDefaultParty } from '../src/game/pokemonStorage';
import type { CenterRuntimeState } from '../src/game/pokemonCenterTemplate';

describe('Pokemon Center', () => {
  const createCenterRuntime = (): CenterRuntimeState => ({
    party: createDefaultParty(),
    vars: {}
  });

  test('creates Pokemon Center state in idle stage', () => {
    const state = createPokemonCenterState();
    expect(state.stage).toBe('idle');
    expect(state.healingTimer).toBe(0);
    expect(state.pcActive).toBe(false);
  });

  test('starts nurse dialogue', () => {
    const state = createPokemonCenterState();
    startNurseDialogue(state);
    expect(state.stage).toBe('nurseWelcome');
  });

  test('nurse dialogue advances through welcome -> take -> healing -> restored -> goodbye', () => {
    const state = createPokemonCenterState();
    const runtime = createCenterRuntime();
    const party = runtime.party;
    party[0]!.hp = 5;

    startNurseDialogue(state);

    const result1 = advanceNurseDialogue(state, party, runtime, 'MAP_PALLET_TOWN', 'yes');
    expect(result1.text).toBe(NURSE_TAKE_POKEMON_TEXT);
    expect(state.stage).toBe('nurseTakePokemon');

    advanceNurseDialogue(state, party, runtime, 'MAP_PALLET_TOWN', 'yes');
    expect(state.stage).toBe('healing');
    expect(party[0]!.hp).toBe(party[0]!.maxHp);

    let healingResult: { text: string; done: boolean } | null = null;
    while (state.healingTimer > 0) {
      healingResult = advanceNurseDialogue(state, party, runtime, 'MAP_PALLET_TOWN', 'yes');
    }
    // The last healing frame returns NURSE_RESTORED_TEXT and transitions to nurseRestored
    expect(healingResult).not.toBeNull();
    expect(healingResult!.text).toBe(NURSE_RESTORED_TEXT);
    expect(state.stage).toBe('nurseRestored');

    const result4 = advanceNurseDialogue(state, party, runtime, 'MAP_PALLET_TOWN', 'yes');
    expect(result4.text).toBe(NURSE_GOODBYE_TEXT);

    const result5 = advanceNurseDialogue(state, party, runtime, 'MAP_PALLET_TOWN', 'yes');
    expect(result5.done).toBe(true);
    expect(state.stage).toBe('idle');
  });

  test('nurse dialogue declines healing', () => {
    const state = createPokemonCenterState();
    const runtime = createCenterRuntime();

    startNurseDialogue(state);

    const result = advanceNurseDialogue(state, runtime.party, runtime, 'MAP_PALLET_TOWN', 'no');
    expect(result.text).toBe(NURSE_DECLINE_TEXT);
    expect(result.done).toBe(true);
    expect(state.stage).toBe('idle');
  });

  test('healing animation is active during healing stage', () => {
    const state = createPokemonCenterState();
    const runtime = createCenterRuntime();

    startNurseDialogue(state);
    advanceNurseDialogue(state, runtime.party, runtime, 'MAP_PALLET_TOWN', 'yes');
    advanceNurseDialogue(state, runtime.party, runtime, 'MAP_PALLET_TOWN', 'yes');

    expect(isHealingAnimationActive(state)).toBe(true);
    expect(getHealingProgress(state)).toBeLessThan(1);
  });

  test('healing progress goes from 0 to 1', () => {
    const state = createPokemonCenterState();
    state.stage = 'healing';
    state.healingTimer = HEALING_ANIMATION_DURATION_FRAMES;

    const progress0 = getHealingProgress(state);
    expect(progress0).toBe(0);

    state.healingTimer = HEALING_ANIMATION_DURATION_FRAMES / 2;
    const progressHalf = getHealingProgress(state);
    expect(progressHalf).toBe(0.5);

    state.healingTimer = 0;
    const progress1 = getHealingProgress(state);
    expect(progress1).toBe(1);
  });

  test('PC access opens and closes', () => {
    const state = createPokemonCenterState();
    openPcFromCenter(state);
    expect(state.pcActive).toBe(true);
    expect(state.stage).toBe('pcAccess');

    closePcFromCenter(state);
    expect(state.pcActive).toBe(false);
    expect(state.stage).toBe('idle');
  });
});