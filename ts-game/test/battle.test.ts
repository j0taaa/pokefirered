import { describe, expect, test } from 'vitest';
import {
  calculateBaseDamage,
  calculateDamagePreview,
  createBattleEncounterState,
  createBattleState,
  stepBattle,
  tryStartWildBattle
} from '../src/game/battle';

const neutralInput = {
  up: false,
  down: false,
  left: false,
  right: false,
  upPressed: false,
  downPressed: false,
  leftPressed: false,
  rightPressed: false,
  run: false,
  interact: false,
  interactPressed: false,
  start: false,
  startPressed: false,
  cancel: false,
  cancelPressed: false
};

describe('battle vertical slice', () => {
  test('uses FRLG-like base damage formula floor behavior', () => {
    const battle = createBattleState();
    const move = battle.moves[0];

    const damage = calculateBaseDamage(battle.playerMon, battle.wildMon, move);
    expect(damage).toBe(9);

    const preview = calculateDamagePreview(battle.playerMon, battle.wildMon, move);
    expect(preview).toEqual({ min: 11, max: 13 });
  });

  test('starts a wild battle once cooldown threshold is reached', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();

    let started = false;
    for (let i = 0; i < 6; i += 1) {
      started = tryStartWildBattle(battle, encounter, true);
      if (started) {
        break;
      }
    }

    expect(started).toBe(true);
    expect(battle.active).toBe(true);
    expect(battle.phase).toBe('intro');
    expect(battle.turnSummary).toContain('appeared');
  });

  test('advances intro, allows move selection, and resolves faint flow', () => {
    const battle = createBattleState();
    battle.active = true;
    battle.phase = 'intro';
    battle.wildMon.hp = 9;

    stepBattle(battle, { ...neutralInput, interact: true, interactPressed: true });
    expect(battle.phase).toBe('command');

    stepBattle(battle, { ...neutralInput, down: true, downPressed: true });
    expect(battle.selectedMoveIndex).toBe(1);

    stepBattle(battle, { ...neutralInput, interact: true, interactPressed: true });
    expect(battle.phase).toBe('resolved');
    expect(battle.wildMon.hp).toBe(0);

    stepBattle(battle, { ...neutralInput, interact: true, interactPressed: true });
    expect(battle.active).toBe(false);
  });
});
