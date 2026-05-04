import { describe, expect, test } from 'vitest';
import {
  createPcStorageState,
  depositPokemon,
  withdrawPokemon,
  movePokemonBetweenBoxes,
  switchBox,
  renameBox,
  getCurrentBoxSlots,
  getPartySlots,
  PC_BOX_CAPACITY,
  PARTY_SIZE
} from '../src/game/pcStorage';
import { createDefaultParty } from '../src/game/pokemonStorage';

describe('PC Pokemon storage', () => {
  test('creates storage state with default values', () => {
    const party = createDefaultParty();
    const state = createPcStorageState(party, [], []);
    expect(state.active).toBe(false);
    expect(state.currentBox).toBe(0);
    expect(state.boxes.length).toBe(14);
    expect(state.party.length).toBe(2);
  });

  test('deposits Pokemon from party to current box', () => {
    const party = createDefaultParty();
    const state = createPcStorageState(party, [], []);
    const result = depositPokemon(state, 0);
    expect(result.ok).toBe(true);
    expect(state.party.length).toBe(1);
    expect(state.boxes[0].length).toBe(1);
    expect(state.boxes[0][0].species).toBe('CHARMANDER');
  });

  test('rejects deposit of last Pokemon', () => {
    const party = [createDefaultParty()[0]!];
    const state = createPcStorageState(party, [], []);
    const result = depositPokemon(state, 0);
    expect(result.ok).toBe(false);
    expect(result.message).toContain('last');
  });

  test('rejects deposit when box is full', () => {
    const party = createDefaultParty();
    const state = createPcStorageState(party, [], []);
    for (let i = 0; i < PC_BOX_CAPACITY; i += 1) {
      state.boxes[0].push({ species: `FILLER_${i}`, level: 5, maxHp: 20, hp: 20, attack: 10, defense: 10, speed: 10, spAttack: 10, spDefense: 10, catchRate: 255, types: ['normal'], status: 'none' });
    }
    const result = depositPokemon(state, 0);
    expect(result.ok).toBe(false);
    expect(result.message).toContain('full');
  });

  test('withdraws Pokemon from box to party', () => {
    const party = createDefaultParty();
    const state = createPcStorageState(party, [], []);
    depositPokemon(state, 0);
    const result = withdrawPokemon(state, 0);
    expect(result.ok).toBe(true);
    expect(state.party.length).toBe(2);
    expect(state.boxes[0].length).toBe(0);
  });

  test('rejects withdraw when party is full', () => {
    const party = createDefaultParty();
    const state = createPcStorageState(party, [], []);
    state.boxes[0].push({ species: 'BULBASAUR', level: 5, maxHp: 20, hp: 20, attack: 10, defense: 10, speed: 10, spAttack: 10, spDefense: 10, catchRate: 255, types: ['grass', 'poison'], status: 'none' });
    while (state.party.length < PARTY_SIZE) {
      state.party.push({ species: `FILLER_${state.party.length}`, level: 5, maxHp: 20, hp: 20, attack: 10, defense: 10, speed: 10, spAttack: 10, spDefense: 10, catchRate: 255, types: ['normal'], status: 'none' });
    }
    const result = withdrawPokemon(state, 0);
    expect(result.ok).toBe(false);
    expect(result.message).toContain('full');
  });

  test('moves Pokemon between boxes', () => {
    const party = createDefaultParty();
    const state = createPcStorageState(party, [], []);
    depositPokemon(state, 0);
    const result = movePokemonBetweenBoxes(state, 0, 0, 1, 0);
    expect(result.ok).toBe(true);
    expect(state.boxes[0].length).toBe(0);
    expect(state.boxes[1].length).toBe(1);
  });

  test('switches box with wrap-around', () => {
    const party = createDefaultParty();
    const state = createPcStorageState(party, [], []);
    state.currentBox = 0;
    const name = switchBox(state, 1);
    expect(state.currentBox).toBe(1);
    expect(name).toBe('BOX 2');

    state.currentBox = 13;
    const name2 = switchBox(state, 1);
    expect(state.currentBox).toBe(0);
    expect(name2).toBe('BOX 1');
  });

  test('renames box within character limit', () => {
    const party = createDefaultParty();
    const state = createPcStorageState(party, [], []);
    renameBox(state, 'MY BOX');
    expect(state.boxNames[0]).toBe('MY BOX');
  });

  test('rejects empty box name', () => {
    const party = createDefaultParty();
    const state = createPcStorageState(party, [], []);
    renameBox(state, '');
    expect(state.boxNames[0]).toBe('BOX 1');
  });

  test('getCurrentBoxSlots returns padded array', () => {
    const party = createDefaultParty();
    const state = createPcStorageState(party, [], []);
    state.boxes[0].push({ species: 'BULBASAUR', level: 5, maxHp: 20, hp: 20, attack: 10, defense: 10, speed: 10, spAttack: 10, spDefense: 10, catchRate: 255, types: ['grass', 'poison'], status: 'none' });
    const slots = getCurrentBoxSlots(state);
    expect(slots.length).toBe(PC_BOX_CAPACITY);
    expect(slots[0]?.species).toBe('BULBASAUR');
    expect(slots[1]).toBeNull();
  });

  test('getPartySlots returns padded array', () => {
    const party = createDefaultParty();
    const state = createPcStorageState(party, [], []);
    const slots = getPartySlots(state);
    expect(slots.length).toBe(PARTY_SIZE);
    expect(slots[0]?.species).toBe('CHARMANDER');
    expect(slots[2]).toBeNull();
  });
});