import { describe, expect, test } from 'vitest';
import {
  createBattlePokemonFromSpecies,
  createBattleState,
  dismissResolvedBattle,
  startConfiguredBattle
} from '../src/game/battle';
import {
  AdjustFriendshipOnBattleFaint,
  AllocateBattleResources,
  BATTLE_UTIL2_C_TRANSLATION_UNIT,
  FreeBattleResources,
  adjustFriendshipOnBattleFaint,
  areBattleResourcesAllocated
} from '../src/game/decompBattleUtil2';

describe('decomp battle util2 parity', () => {
  test('exports exact battle_util2.c resource entry points', () => {
    expect(BATTLE_UTIL2_C_TRANSLATION_UNIT).toBe('src/battle_util2.c');
    const battle = createBattleState();

    AllocateBattleResources(battle);
    expect(areBattleResourcesAllocated(battle)).toBe(true);
    FreeBattleResources(battle);
    expect(areBattleResourcesAllocated(battle)).toBe(false);
  });

  test('startConfiguredBattle and dismissResolvedBattle mirror allocate/free resource lifetime', () => {
    const battle = createBattleState();

    expect(areBattleResourcesAllocated(battle)).toBe(false);

    startConfiguredBattle(battle, { mode: 'wild' });
    expect(areBattleResourcesAllocated(battle)).toBe(true);

    dismissResolvedBattle(battle);
    expect(areBattleResourcesAllocated(battle)).toBe(false);
  });

  test('AdjustFriendshipOnBattleFaint applies the large faint penalty against much stronger foes', () => {
    const playerMon = createBattlePokemonFromSpecies('PIKACHU', 5);
    playerMon.friendship = 210;
    playerMon.hp = 0;

    const opponentMon = createBattlePokemonFromSpecies('ONIX', 40);

    const battle = createBattleState({
      playerParty: [playerMon],
      opponentParty: [opponentMon],
      activePlayerPartyIndex: 0,
      activeOpponentPartyIndex: 0
    });

    startConfiguredBattle(battle, {
      mode: 'wild',
      playerParty: [playerMon],
      opponentParty: [opponentMon],
      activePlayerPartyIndex: 0,
      activeOpponentPartyIndex: 0
    });

    AdjustFriendshipOnBattleFaint(battle, 0);

    expect(battle.playerSide.party[0]?.friendship).toBe(200);
  });

  test('AdjustFriendshipOnBattleFaint applies the small faint penalty otherwise and only once per party slot', () => {
    const playerMon = createBattlePokemonFromSpecies('BULBASAUR', 25);
    playerMon.friendship = 80;
    playerMon.hp = 0;

    const opponentMon = createBattlePokemonFromSpecies('RATTATA', 20);

    const battle = createBattleState({
      playerParty: [playerMon],
      opponentParty: [opponentMon],
      activePlayerPartyIndex: 0,
      activeOpponentPartyIndex: 0
    });

    startConfiguredBattle(battle, {
      mode: 'wild',
      playerParty: [playerMon],
      opponentParty: [opponentMon],
      activePlayerPartyIndex: 0,
      activeOpponentPartyIndex: 0
    });

    adjustFriendshipOnBattleFaint(battle, 0);
    adjustFriendshipOnBattleFaint(battle, 0);

    expect(battle.playerSide.party[0]?.friendship).toBe(79);
  });
});
