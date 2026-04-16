import { describe, expect, test } from 'vitest';
import {
  calculateBaseDamage,
  calculateDamagePreview,
  calculateTypeEffectiveness,
  createBattleEncounterState,
  createBattleState,
  performCaptureAttempt,
  shouldStartWildEncounter,
  stepBattle,
  tryStartWildBattle
} from '../src/game/battle';
import type { WildEncounterGroup } from '../src/world/mapSource';

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
  const routeLikeLandEncounters: WildEncounterGroup = {
    encounterRate: 21,
    mons: [
      { minLevel: 3, maxLevel: 3, species: 'SPECIES_RATTATA', slotRate: 20 },
      { minLevel: 3, maxLevel: 3, species: 'SPECIES_PIDGEY', slotRate: 20 },
      { minLevel: 4, maxLevel: 4, species: 'SPECIES_CATERPIE', slotRate: 10 }
    ]
  };

  test('uses FRLG-like base damage formula floor behavior and STAB/type math', () => {
    const battle = createBattleState();
    const move = { ...battle.moves[1], type: 'fire' as const };
    battle.playerMon.types = ['fire'];
    battle.wildMon.types = ['grass'];

    const damage = calculateBaseDamage(battle.playerMon, battle.wildMon, move);
    expect(damage).toBe(9);

    const preview = calculateDamagePreview(battle.playerMon, battle.wildMon, move);
    expect(preview).toEqual({ min: 22, max: 27 });
  });

  test('applies multi-type effectiveness multiplication', () => {
    expect(calculateTypeEffectiveness('fire', ['grass', 'steel'])).toBe(4);
    expect(calculateTypeEffectiveness('normal', ['ghost'])).toBe(0);
  });

  test('starts a wild battle once cooldown threshold is reached', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();
    encounter.rngState = 0;

    let started = false;
    for (let i = 0; i < 40; i += 1) {
      started = tryStartWildBattle(battle, encounter, true, true, routeLikeLandEncounters);
      if (started) {
        break;
      }
    }

    expect(started).toBe(true);
    expect(battle.active).toBe(true);
    expect(battle.phase).toBe('intro');
    expect(battle.turnSummary).toContain('appeared');
    expect(battle.wildMon.species).toMatch(/RATTATA|PIDGEY|CATERPIE/);
  });

  test('cooldown alone does not guarantee an encounter every step', () => {
    const encounter = createBattleEncounterState();
    encounter.encounterRate = 21;
    encounter.stepsSinceLastEncounter = 6;
    encounter.rngState = 0;

    const outcomes = Array.from({ length: 6 }, () => shouldStartWildEncounter(encounter));

    expect(outcomes).toContain(true);
    expect(outcomes).toContain(false);
  });

  test('does not start a wild battle outside encounter tiles', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();

    for (let i = 0; i < 10; i += 1) {
      expect(tryStartWildBattle(battle, encounter, true, false, routeLikeLandEncounters)).toBe(false);
    }

    expect(battle.active).toBe(false);
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

  test('supports Poké Ball shakes and Great Ball fallback modifiers', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();

    battle.wildMon.catchRate = 255;
    battle.wildMon.hp = 1;
    battle.wildMon.status = 'poison';
    battle.bag.pokeBalls = 0;
    battle.bag.greatBalls = 1;
    encounter.rngState = 0;

    const capture = performCaptureAttempt(battle, encounter);
    expect(capture.ballLabel).toBe('GREAT BALL');
    expect(capture.shakes).toBe(4);
    expect(capture.caught).toBe(true);
    expect(battle.bag.greatBalls).toBe(0);
  });

  test('battle BAG command includes shake-count messaging', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();
    battle.active = true;
    battle.phase = 'command';
    battle.selectedCommandIndex = battle.commands.findIndex((cmd) => cmd === 'bag');
    battle.wildMon.catchRate = 255;
    battle.wildMon.hp = 1;
    encounter.rngState = 0;

    stepBattle(battle, { ...neutralInput, interact: true, interactPressed: true }, encounter);
    expect(battle.turnSummary).toContain('shake x4');
    expect(battle.phase).toBe('resolved');
  });

  test('enemy AI move selection favors super-effective options with utility heuristics', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();
    battle.active = true;
    battle.phase = 'moveSelect';
    battle.playerMon.types = ['grass'];
    battle.playerMon.hp = 50;
    battle.playerMon.speed = 1;
    battle.wildMon.speed = 99;
    battle.wildMon.types = ['fire'];
    battle.moves = [
      { id: 'tackle', name: 'TACKLE', power: 40, type: 'normal', accuracy: 100 },
      { id: 'ember', name: 'EMBER', power: 40, type: 'fire', accuracy: 100 }
    ];
    encounter.rngState = 12;

    stepBattle(battle, { ...neutralInput, interact: true, interactPressed: true }, encounter);
    expect(battle.turnSummary).toContain('Enemy');
    expect(battle.turnSummary).toContain('EMBER');
  });
});
