import { describe, expect, test } from 'vitest';
import {
  CantUseSoftboiledOnMon,
  ChooseMonForSoftboiled,
  PARTY_SIZE,
  SetUpFieldMove_SoftBoiled,
  Task_ChooseNewMonForSoftboiled,
  Task_DisplayHPRestoredMessage,
  Task_FinishSoftboiled,
  Task_SoftboiledRestoreHealth,
  Task_TryUseSoftboiledOnPartyMon,
  cantUseSoftboiledOnMon,
  chooseMonForSoftboiled,
  createSoftboiledPartyMenuState,
  setUpFieldMoveSoftBoiled,
  taskChooseNewMonForSoftboiled,
  taskDisplayHpRestoredMessage,
  taskFinishSoftboiled,
  taskSoftboiledRestoreHealth,
  taskTryUseSoftboiledOnPartyMon
} from '../src/game/decompFldEffSoftboiled';
import type { FieldPokemon } from '../src/game/pokemonStorage';

const createPokemon = (hp: number, maxHp = 100): FieldPokemon => ({
  species: 'CHANSEY',
  level: 50,
  maxHp,
  hp,
  attack: 10,
  defense: 10,
  speed: 10,
  spAttack: 10,
  spDefense: 10,
  catchRate: 30,
  types: ['normal'],
  status: 'none'
});

describe('decompFldEffSoftboiled', () => {
  test('SetUpFieldMove_SoftBoiled requires current HP greater than max HP / 5', () => {
    expect(setUpFieldMoveSoftBoiled([createPokemon(21, 100)], 0)).toBe(true);
    expect(setUpFieldMoveSoftBoiled([createPokemon(20, 100)], 0)).toBe(false);
    expect(setUpFieldMoveSoftBoiled([], 0)).toBe(false);
  });

  test('ChooseMonForSoftboiled switches party action and prompts for a target', () => {
    const state = createSoftboiledPartyMenuState(2);

    chooseMonForSoftboiled(state, 2);

    expect(state.action).toBe('PARTY_ACTION_SOFTBOILED');
    expect(state.slotId2).toBe(2);
    expect(state.animatedSlots[2]).toBe(1);
    expect(state.message).toBe('PARTY_MSG_USE_ON_WHICH_MON');
    expect(state.taskFunc).toBe('Task_HandleChooseMonInput');
  });

  test('Task_TryUseSoftboiledOnPartyMon cancels out-of-range target back to choose-mon action', () => {
    const state = createSoftboiledPartyMenuState(0);
    state.slotId2 = PARTY_SIZE + 1;

    taskTryUseSoftboiledOnPartyMon([createPokemon(80)], state);

    expect(state.action).toBe('PARTY_ACTION_CHOOSE_MON');
    expect(state.message).toBe('PARTY_MSG_CHOOSE_MON');
    expect(state.taskFunc).toBe('Task_HandleChooseMonInput');
  });

  test('Softboiled rejects fainted, self, and full-HP recipients', () => {
    const party = [createPokemon(80), createPokemon(0), createPokemon(100)];
    const state = createSoftboiledPartyMenuState(0);

    state.slotId2 = 1;
    taskTryUseSoftboiledOnPartyMon(party, state);
    expect(state.message).toBe('gText_CantBeUsedOnPkmn');

    const selfState = createSoftboiledPartyMenuState(0);
    selfState.slotId2 = 0;
    taskTryUseSoftboiledOnPartyMon(party, selfState);
    expect(selfState.message).toBe('gText_CantBeUsedOnPkmn');

    const fullState = createSoftboiledPartyMenuState(0);
    fullState.slotId2 = 2;
    taskTryUseSoftboiledOnPartyMon(party, fullState);
    expect(fullState.message).toBe('gText_CantBeUsedOnPkmn');
  });

  test('Softboiled transfers max HP / 5 from user to recipient and finishes menu state', () => {
    const party = [createPokemon(80, 100), createPokemon(30, 100)];
    const state = createSoftboiledPartyMenuState(0);
    state.slotId2 = 1;

    taskTryUseSoftboiledOnPartyMon(party, state);
    expect(party[0].hp).toBe(60);
    expect(state.playedSE).toEqual(['SE_USE_ITEM']);
    expect(state.taskFunc).toBe('Task_SoftboiledRestoreHealth');

    taskSoftboiledRestoreHealth(party, state);
    expect(party[1].hp).toBe(50);
    expect(state.playedSE).toEqual(['SE_USE_ITEM', 'SE_USE_ITEM']);
    expect(state.taskFunc).toBe('Task_DisplayHPRestoredMessage');

    taskDisplayHpRestoredMessage(state);
    expect(state.message).toBe('gText_PkmnHPRestoredByVar2');
    expect(state.bg2CopyScheduled).toBe(true);
    expect(state.taskFunc).toBe('Task_FinishSoftboiled');

    taskFinishSoftboiled(state, true);
    expect(state.taskFunc).toBe('Task_FinishSoftboiled');
    taskFinishSoftboiled(state, false);
    expect(state.action).toBe('PARTY_ACTION_CHOOSE_MON');
    expect(state.slotId).toBe(1);
    expect(state.animatedSlots[0]).toBe(0);
    expect(state.animatedSlots[1]).toBe(1);
    expect(state.window6Cleared).toBe(true);
    expect(state.message).toBe('PARTY_MSG_CHOOSE_MON');
    expect(state.taskFunc).toBe('Task_HandleChooseMonInput');
  });

  test('CantUseSoftboiledOnMon and retry task preserve the decomp messages', () => {
    const state = createSoftboiledPartyMenuState(0);

    cantUseSoftboiledOnMon(state);
    expect(state.playedSE).toEqual(['SE_SELECT']);
    expect(state.message).toBe('gText_CantBeUsedOnPkmn');
    expect(state.bg2CopyScheduled).toBe(true);
    expect(state.taskFunc).toBe('Task_ChooseNewMonForSoftboiled');

    taskChooseNewMonForSoftboiled(state, true);
    expect(state.message).toBe('gText_CantBeUsedOnPkmn');
    taskChooseNewMonForSoftboiled(state, false);
    expect(state.message).toBe('PARTY_MSG_USE_ON_WHICH_MON');
    expect(state.taskFunc).toBe('Task_HandleChooseMonInput');
  });

  test('exact C-name Softboiled entry points preserve the same menu and HP logic', () => {
    const party = [createPokemon(90, 100), createPokemon(20, 100)];
    const state = createSoftboiledPartyMenuState(0);

    expect(SetUpFieldMove_SoftBoiled(party, 0)).toBe(true);
    ChooseMonForSoftboiled(state, 0);
    expect(state.action).toBe('PARTY_ACTION_SOFTBOILED');
    expect(state.slotId2).toBe(0);

    state.slotId2 = 1;
    Task_TryUseSoftboiledOnPartyMon(party, state);
    expect(party[0].hp).toBe(70);
    expect(state.taskFunc).toBe('Task_SoftboiledRestoreHealth');

    Task_SoftboiledRestoreHealth(party, state);
    expect(party[1].hp).toBe(40);
    expect(state.taskFunc).toBe('Task_DisplayHPRestoredMessage');

    Task_DisplayHPRestoredMessage(state);
    expect(state.message).toBe('gText_PkmnHPRestoredByVar2');
    Task_FinishSoftboiled(state, false);
    expect(state.slotId).toBe(1);
    expect(state.taskFunc).toBe('Task_HandleChooseMonInput');

    CantUseSoftboiledOnMon(state);
    expect(state.message).toBe('gText_CantBeUsedOnPkmn');
    Task_ChooseNewMonForSoftboiled(state, false);
    expect(state.message).toBe('PARTY_MSG_USE_ON_WHICH_MON');
  });
});
