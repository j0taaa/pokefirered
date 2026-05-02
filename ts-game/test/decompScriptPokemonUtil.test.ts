import { describe, expect, test } from 'vitest';
import {
  CB2_ReturnFromChooseBattleTowerParty,
  CB2_ReturnFromChooseHalfParty,
  CheckPartyMonHasHeldItem,
  CHOOSE_MONS_FOR_BATTLE_TOWER,
  CHOOSE_MONS_FOR_CABLE_CLUB_BATTLE,
  ChooseBattleTowerPlayerParty,
  ChooseHalfPartyForBattle,
  CreateScriptedWildMon,
  DoesPartyHaveEnigmaBerry,
  HasEnoughMonsForDoubleBattle,
  HealPlayerParty,
  ITEM_ENIGMA_BERRY,
  MON_GIVEN_TO_PC,
  MON_GIVEN_TO_PARTY,
  PLAYER_HAS_ONE_MON,
  PLAYER_HAS_ONE_USABLE_MON,
  ReducePlayerPartyToThree,
  ScriptGiveEgg,
  ScriptGiveMon,
  ScriptSetMonMoveSlot,
  SPECIES_EGG,
  cb2ReturnFromChooseBattleTowerParty,
  cb2ReturnFromChooseHalfParty,
  chooseBattleTowerPlayerParty,
  chooseHalfPartyForBattle,
  createBlankScriptPokemon,
  createScriptPokemonRuntime,
  createScriptedWildMon,
  doesPartyHaveEnigmaBerry,
  hasEnoughMonsForDoubleBattle,
  healPlayerParty,
  reducePlayerPartyToThree,
  scriptGiveEgg,
  scriptGiveMon,
  scriptSetMonMoveSlot
} from '../src/game/decompScriptPokemonUtil';

describe('decompScriptPokemonUtil', () => {
  test('HealPlayerParty restores HP, PP, and status for party count only', () => {
    const runtime = createScriptPokemonRuntime();
    runtime.playerPartyCount = 2;
    runtime.playerParty[0] = { ...createBlankScriptPokemon(1, 5), maxHP: 30, hp: 1, ppBonuses: 0b01001001, moves: [10, 20, 0, 40], pp: [0, 0, 0, 0], status: 7 };
    runtime.playerParty[1] = { ...createBlankScriptPokemon(2, 5), maxHP: 25, hp: 5, ppBonuses: 0, moves: [1, 2, 3, 4], pp: [0, 0, 0, 0], status: 3 };
    runtime.playerParty[2] = { ...createBlankScriptPokemon(3, 5), maxHP: 99, hp: 4, status: 9 };

    healPlayerParty(runtime);

    expect(runtime.playerParty[0]).toMatchObject({ hp: 30, status: 0 });
    expect(runtime.playerParty[0].pp).toEqual([18, 35, 0, 6]);
    expect(runtime.playerParty[1]).toMatchObject({ hp: 25, status: 0 });
    expect(runtime.playerParty[2]).toMatchObject({ hp: 4, status: 9 });
  });

  test('ScriptGiveMon and ScriptGiveEgg create mons, assign held item/egg flag, and update dex only for party or PC', () => {
    const runtime = createScriptPokemonRuntime();
    expect(scriptGiveMon(runtime, 25, 12, 99)).toBe(MON_GIVEN_TO_PARTY);
    expect(runtime.playerParty[0]).toMatchObject({ species: 25, level: 12, heldItem: 99 });
    expect(runtime.pokedexSeen.has(25)).toBe(true);
    expect(runtime.pokedexCaught.has(25)).toBe(true);

    runtime.giveMonResult = MON_GIVEN_TO_PC;
    expect(scriptGiveMon(runtime, 26, 8, 0)).toBe(MON_GIVEN_TO_PC);
    expect(runtime.pokedexSeen.has(26)).toBe(true);

    expect(scriptGiveEgg(runtime, 133)).toBe(MON_GIVEN_TO_PC);
    expect(runtime.createdMons.at(-1)).toMatchObject({ species: 133, isEgg: true });
  });

  test('double battle, Enigma Berry, wild mon, and move slot helpers mirror C conditions', () => {
    const runtime = createScriptPokemonRuntime();
    runtime.doubleBattleState = PLAYER_HAS_ONE_MON;
    hasEnoughMonsForDoubleBattle(runtime);
    expect(runtime.specialVarResult).toBe(PLAYER_HAS_ONE_MON);
    runtime.doubleBattleState = PLAYER_HAS_ONE_USABLE_MON;
    hasEnoughMonsForDoubleBattle(runtime);
    expect(runtime.specialVarResult).toBe(PLAYER_HAS_ONE_USABLE_MON);

    runtime.playerParty[0] = { ...createBlankScriptPokemon(1), heldItem: ITEM_ENIGMA_BERRY };
    runtime.playerParty[1] = { ...createBlankScriptPokemon(SPECIES_EGG), heldItem: ITEM_ENIGMA_BERRY, isEgg: true };
    expect(doesPartyHaveEnigmaBerry(runtime)).toBe(true);
    expect(runtime.stringVar1).toBe('ENIGMA');

    createScriptedWildMon(runtime, 150, 50, 77);
    expect(runtime.enemyParty[0]).toMatchObject({ species: 150, level: 50, heldItem: 77 });
    expect(runtime.enemyParty[1].species).toBe(0);

    runtime.playerPartyCount = 1;
    scriptSetMonMoveSlot(runtime, 99, 123, 2);
    expect(runtime.playerParty[0].moves[2]).toBe(123);
  });

  test('party selection callbacks and ReducePlayerPartyToThree follow selected order', () => {
    const runtime = createScriptPokemonRuntime();
    runtime.playerParty = [1, 2, 3, 4, 5, 6].map((species) => createBlankScriptPokemon(species));
    runtime.playerPartyCount = 6;

    chooseHalfPartyForBattle(runtime);
    expect(runtime.mainSavedCallback).toBe('CB2_ReturnFromChooseHalfParty');
    expect(runtime.chooseMonsMode).toBe(CHOOSE_MONS_FOR_CABLE_CLUB_BATTLE);
    runtime.selectedOrderFromParty = [0, 0, 0];
    cb2ReturnFromChooseHalfParty(runtime);
    expect(runtime.specialVarResult).toBe(0);
    runtime.selectedOrderFromParty = [2, 0, 0];
    cb2ReturnFromChooseHalfParty(runtime);
    expect(runtime.specialVarResult).toBe(1);

    chooseBattleTowerPlayerParty(runtime);
    expect(runtime.chooseMonsMode).toBe(CHOOSE_MONS_FOR_BATTLE_TOWER);
    runtime.selectedOrderFromParty = [3, 1, 0];
    reducePlayerPartyToThree(runtime);
    expect(runtime.playerParty.map((mon) => mon.species)).toEqual([3, 1, 0, 0, 0, 0]);
    expect(runtime.playerPartyCount).toBe(2);

    const original = [7, 8, 9, 0, 0, 0].map((species) => createBlankScriptPokemon(species));
    runtime.selectedOrderFromParty = [0, 0, 0];
    cb2ReturnFromChooseBattleTowerParty(runtime, original);
    expect(runtime.specialVarResult).toBe(0);
    expect(runtime.playerParty.map((mon) => mon.species)).toEqual([7, 8, 9, 0, 0, 0]);
  });

  test('exact C-name script pokemon exports preserve healing, gifts, held-item checks, wild mons, moves, and callbacks', () => {
    const runtime = createScriptPokemonRuntime();
    runtime.playerPartyCount = 2;
    runtime.playerParty[0] = { ...createBlankScriptPokemon(1, 5), maxHP: 30, hp: 1, ppBonuses: 0b01001001, moves: [10, 20, 0, 40], pp: [0, 0, 0, 0], status: 7 };
    runtime.playerParty[1] = { ...createBlankScriptPokemon(2, 5), maxHP: 25, hp: 5, ppBonuses: 0, moves: [1, 2, 3, 4], pp: [0, 0, 0, 0], status: 3 };

    HealPlayerParty(runtime);
    expect(runtime.playerParty[0]).toMatchObject({ hp: 30, status: 0 });
    expect(runtime.playerParty[0].pp).toEqual([18, 35, 0, 6]);

    runtime.playerPartyCount = 0;
    expect(ScriptGiveMon(runtime, 25, 12, 99)).toBe(MON_GIVEN_TO_PARTY);
    expect(runtime.playerParty[0]).toMatchObject({ species: 25, level: 12, heldItem: 99 });
    expect(runtime.pokedexSeen.has(25)).toBe(true);
    runtime.giveMonResult = MON_GIVEN_TO_PC;
    expect(ScriptGiveEgg(runtime, 133)).toBe(MON_GIVEN_TO_PC);
    expect(runtime.createdMons.at(-1)).toMatchObject({ species: 133, isEgg: true });

    runtime.doubleBattleState = PLAYER_HAS_ONE_MON;
    HasEnoughMonsForDoubleBattle(runtime);
    expect(runtime.specialVarResult).toBe(PLAYER_HAS_ONE_MON);

    runtime.playerParty[0] = { ...createBlankScriptPokemon(1), heldItem: ITEM_ENIGMA_BERRY };
    runtime.playerParty[1] = { ...createBlankScriptPokemon(SPECIES_EGG), heldItem: ITEM_ENIGMA_BERRY, isEgg: true };
    expect(CheckPartyMonHasHeldItem(runtime, ITEM_ENIGMA_BERRY)).toBe(true);
    expect(DoesPartyHaveEnigmaBerry(runtime)).toBe(true);
    expect(runtime.stringVar1).toBe('ENIGMA');

    CreateScriptedWildMon(runtime, 150, 50, 77);
    expect(runtime.enemyParty[0]).toMatchObject({ species: 150, level: 50, heldItem: 77 });
    runtime.playerPartyCount = 1;
    ScriptSetMonMoveSlot(runtime, 99, 123, 2);
    expect(runtime.playerParty[0].moves[2]).toBe(123);

    runtime.playerParty = [1, 2, 3, 4, 5, 6].map((species) => createBlankScriptPokemon(species));
    runtime.playerPartyCount = 6;
    ChooseHalfPartyForBattle(runtime);
    expect(runtime.chooseMonsMode).toBe(CHOOSE_MONS_FOR_CABLE_CLUB_BATTLE);
    runtime.selectedOrderFromParty = [2, 0, 0];
    CB2_ReturnFromChooseHalfParty(runtime);
    expect(runtime.specialVarResult).toBe(1);

    ChooseBattleTowerPlayerParty(runtime);
    expect(runtime.chooseMonsMode).toBe(CHOOSE_MONS_FOR_BATTLE_TOWER);
    runtime.selectedOrderFromParty = [3, 1, 0];
    ReducePlayerPartyToThree(runtime);
    expect(runtime.playerParty.map((mon) => mon.species)).toEqual([3, 1, 0, 0, 0, 0]);

    const original = [7, 8, 9, 0, 0, 0].map((species) => createBlankScriptPokemon(species));
    runtime.selectedOrderFromParty = [0, 0, 0];
    CB2_ReturnFromChooseBattleTowerParty(runtime, original);
    expect(runtime.specialVarResult).toBe(0);
    expect(runtime.playerParty.map((mon) => mon.species)).toEqual([7, 8, 9, 0, 0, 0]);
  });
});
