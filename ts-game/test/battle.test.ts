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
    const move = { ...battle.moves[0], type: 'fire' as const };
    battle.playerMon.type = 'fire';
    battle.wildMon.type = 'grass';

    const damage = calculateBaseDamage(battle.playerMon, battle.wildMon, move);
    expect(damage).toBe(9);

    const preview = calculateDamagePreview(battle.playerMon, battle.wildMon, move);
    expect(preview).toEqual({ min: 22, max: 27 });
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
    const encounter = createBattleEncounterState();
    battle.active = true;
    battle.phase = 'intro';
    battle.wildMon.hp = 9;

    stepBattle(battle, { ...neutralInput, interact: true, interactPressed: true }, encounter);
    expect(battle.phase).toBe('command');

    stepBattle(battle, { ...neutralInput, interact: true, interactPressed: true }, encounter);
    expect(battle.phase).toBe('moveSelect');

    stepBattle(battle, { ...neutralInput, down: true, downPressed: true }, encounter);
    expect(battle.selectedMoveIndex).toBe(1);

    stepBattle(battle, { ...neutralInput, interact: true, interactPressed: true }, encounter);
    expect(battle.phase).toBe('resolved');
    expect(battle.wildMon.hp).toBe(0);

    stepBattle(battle, { ...neutralInput, interact: true, interactPressed: true }, encounter);
    expect(battle.active).toBe(false);
  });

  test('supports command selection and failed run attempts', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();
    battle.active = true;
    battle.phase = 'command';
    battle.playerMon.speed = 4;
    battle.wildMon.speed = 40;
    encounter.rngState = 1;

    const runIndex = battle.commands.findIndex((command) => command === 'run');
    for (let i = 0; i < runIndex; i += 1) {
      stepBattle(battle, { ...neutralInput, down: true, downPressed: true }, encounter);
    }
    expect(battle.selectedCommandIndex).toBe(runIndex);

    stepBattle(battle, { ...neutralInput, interact: true, interactPressed: true }, encounter);
    expect(battle.phase).toBe('moveSelect');
    expect(battle.turnSummary).toContain("Can't escape");
  });

  test('allows throwing a Poké Ball from BAG command and consumes inventory', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();
    battle.active = true;
    battle.phase = 'command';
    battle.selectedCommandIndex = battle.commands.findIndex((cmd) => cmd === 'bag');
    battle.wildMon.level = 2;
    battle.wildMon.hp = 1;
    encounter.rngState = 0;

    stepBattle(battle, { ...neutralInput, interact: true, interactPressed: true }, encounter);
    expect(battle.bag.pokeBalls).toBe(4);
    expect(battle.phase).toBe('resolved');
    expect(battle.turnSummary).toContain('was caught');
  });

  test('supports switching to another party member from POKEMON command', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();
    battle.active = true;
    battle.phase = 'command';
    battle.selectedCommandIndex = battle.commands.findIndex((cmd) => cmd === 'pokemon');

    stepBattle(battle, { ...neutralInput, interact: true, interactPressed: true }, encounter);
    expect(battle.phase).toBe('partySelect');

    stepBattle(battle, { ...neutralInput, down: true, downPressed: true }, encounter);
    stepBattle(battle, { ...neutralInput, interact: true, interactPressed: true }, encounter);

    expect(battle.playerMon.species).toBe('PIDGEY');
    expect(battle.phase).toBe('command');
    expect(battle.turnSummary).toContain('Go! PIDGEY');
  });

  test('enemy AI move selection can use tie-breaking randomness across equal moves', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();
    battle.active = true;
    battle.phase = 'moveSelect';
    battle.playerMon.hp = 23;
    battle.wildMon.speed = 99;
    battle.playerMon.speed = 1;
    battle.moves = [
      { id: 'a', name: 'A', power: 40, type: 'normal', accuracy: 100 },
      { id: 'b', name: 'B', power: 40, type: 'normal', accuracy: 100 }
    ];
    encounter.rngState = 123;

    stepBattle(battle, { ...neutralInput, interact: true, interactPressed: true }, encounter);
    expect(battle.turnSummary).toContain('used');
    expect(battle.turnSummary).toMatch(/Enemy .* used (A|B)!/);
  });
});
