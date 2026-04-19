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
import type { BattleMove, PokemonType } from '../src/game/battle';
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

const confirmInput = { ...neutralInput, interact: true, interactPressed: true };

const flushScriptMessages = (battle: ReturnType<typeof createBattleState>, encounter: ReturnType<typeof createBattleEncounterState>) => {
  while (battle.phase === 'script') {
    stepBattle(battle, confirmInput, encounter);
  }
};

const makeStatusMove = (
  id: string,
  effect: string,
  type: PokemonType,
  accuracy = 0
): BattleMove => ({
  id,
  name: id.replace(/_/gu, ' '),
  power: 0,
  type,
  accuracy,
  pp: 20,
  ppRemaining: 20,
  priority: 0,
  effect,
  effectScriptLabel: `BattleScript_${effect}`,
  target: 'MOVE_TARGET_SELECTED',
  secondaryEffectChance: 0
});

const makeDamageMove = (
  id: string,
  effect: string,
  type: PokemonType,
  power = 40,
  accuracy = 0,
  secondaryEffectChance = 0
): BattleMove => ({
  id,
  name: id.replace(/_/gu, ' '),
  power,
  type,
  accuracy,
  pp: 20,
  ppRemaining: 20,
  priority: 0,
  effect,
  effectScriptLabel: `BattleScript_${effect}`,
  target: 'MOVE_TARGET_SELECTED',
  secondaryEffectChance
});

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
    const move = battle.moves.find((entry) => entry.id === 'EMBER');
    expect(move).toBeTruthy();
    battle.playerMon.types = ['fire'];
    battle.wildMon.types = ['grass'];
    battle.wildMon.spDefense = 7;

    const damage = calculateBaseDamage(battle.playerMon, battle.wildMon, move!);
    expect(damage).toBe(10);

    const preview = calculateDamagePreview(battle.playerMon, battle.wildMon, move!);
    expect(preview).toEqual({ min: 25, max: 30 });
  });

  test('burn halves physical attack damage but not special attack damage', () => {
    const battle = createBattleState();
    const tackle = battle.moves.find((entry) => entry.id === 'SCRATCH') ?? battle.moves.find((entry) => entry.power > 0 && entry.type === 'normal');
    const ember = battle.moves.find((entry) => entry.id === 'EMBER');
    expect(tackle).toBeTruthy();
    expect(ember).toBeTruthy();

    const normalPhysical = calculateDamagePreview(battle.playerMon, battle.wildMon, tackle!);
    const normalSpecial = calculateDamagePreview(battle.playerMon, battle.wildMon, ember!);
    battle.playerMon.status = 'burn';

    expect(calculateDamagePreview(battle.playerMon, battle.wildMon, tackle!).max).toBeLessThan(normalPhysical.max);
    expect(calculateDamagePreview(battle.playerMon, battle.wildMon, ember!).max).toBe(normalSpecial.max);
  });

  test('critical base damage doubles and ignores bad attacker / good defender stages', () => {
    const battle = createBattleState();
    const move = makeDamageMove('SLASH', 'EFFECT_HIGH_CRITICAL', 'normal', 70);
    battle.playerMon.attack = 30;
    battle.wildMon.defense = 10;
    battle.playerMon.statStages.attack = -6;
    battle.wildMon.statStages.defense = 6;

    const normal = calculateBaseDamage(battle.playerMon, battle.wildMon, move, false);
    const critical = calculateBaseDamage(battle.playerMon, battle.wildMon, move, true) * 2;

    expect(critical).toBeGreaterThan(normal);
  });

  test('applies multi-type effectiveness multiplication', () => {
    expect(calculateTypeEffectiveness('fire', ['grass', 'steel'])).toBe(4);
    expect(calculateTypeEffectiveness('normal', ['ghost'])).toBe(0);
  });

  test('treats decomp move accuracy as percent, so 100-accuracy moves do not randomly miss', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();
    battle.active = true;
    battle.phase = 'moveSelect';
    battle.playerMon.speed = 99;
    battle.selectedMoveIndex = battle.moves.findIndex((move) => move.power > 0 && move.accuracy === 100);
    battle.wildMon.hp = battle.wildMon.maxHp;
    const wildHp = battle.wildMon.hp;

    stepBattle(battle, confirmInput, encounter);

    expect(battle.phase).toBe('script');
    expect(battle.turnSummary).toContain('used');
    expect(battle.turnSummary).not.toContain('missed');
    expect(battle.wildMon.hp).toBeLessThan(wildHp);
  });

  test('paralysis quarters speed for turn order', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();
    battle.active = true;
    battle.phase = 'moveSelect';
    battle.playerMon.speed = 100;
    battle.playerMon.status = 'paralysis';
    battle.wildMon.speed = 30;

    stepBattle(battle, confirmInput, encounter);

    expect(battle.phase).toBe('script');
    expect(battle.turnSummary).toContain('Foe');
    expect(battle.turnSummary).toContain('used');
  });

  test('critical hits are announced and deal extra damage during move execution', () => {
    const criticalBattle = createBattleState();
    const nonCriticalBattle = createBattleState();
    const move = makeDamageMove('SLASH', 'EFFECT_HIGH_CRITICAL', 'normal', 70);
    criticalBattle.active = true;
    criticalBattle.phase = 'moveSelect';
    criticalBattle.playerMon.speed = 99;
    criticalBattle.moves = [{ ...move }];
    criticalBattle.playerMon.moves = criticalBattle.moves;
    nonCriticalBattle.active = true;
    nonCriticalBattle.phase = 'moveSelect';
    nonCriticalBattle.playerMon.speed = 99;
    nonCriticalBattle.moves = [{ ...move }];
    nonCriticalBattle.playerMon.moves = nonCriticalBattle.moves;

    const criticalEncounter = createBattleEncounterState();
    criticalEncounter.rngState = 0;
    const nonCriticalEncounter = createBattleEncounterState();
    nonCriticalEncounter.rngState = 1;

    stepBattle(criticalBattle, confirmInput, criticalEncounter);
    stepBattle(nonCriticalBattle, confirmInput, nonCriticalEncounter);

    const criticalDamage = criticalBattle.wildMon.maxHp - criticalBattle.wildMon.hp;
    const nonCriticalDamage = nonCriticalBattle.wildMon.maxHp - nonCriticalBattle.wildMon.hp;

    expect([criticalBattle.turnSummary, ...criticalBattle.queuedMessages]).toContain('A critical hit!');
    expect(criticalDamage).toBeGreaterThan(nonCriticalDamage);
  });

  test('Absorb-style moves restore half of dealt damage', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();
    battle.active = true;
    battle.phase = 'moveSelect';
    battle.playerMon.hp = 10;
    battle.playerMon.speed = 99;
    battle.wildMon.hp = 1;
    battle.moves = [makeDamageMove('ABSORB', 'EFFECT_ABSORB', 'grass', 40)];
    battle.playerMon.moves = battle.moves;

    stepBattle(battle, confirmInput, encounter);

    expect(battle.phase).toBe('script');
    expect(battle.playerMon.hp).toBeGreaterThan(10);
    expect([battle.turnSummary, ...battle.queuedMessages].some((message) => message.includes('regained health'))).toBe(true);
  });

  test('Double-Edge-style moves recoil by a third of damage', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();
    battle.active = true;
    battle.phase = 'moveSelect';
    battle.playerMon.hp = battle.playerMon.maxHp;
    battle.playerMon.speed = 99;
    battle.wildMon.hp = 1;
    battle.moves = [makeDamageMove('DOUBLE_EDGE', 'EFFECT_DOUBLE_EDGE', 'normal', 120)];
    battle.playerMon.moves = battle.moves;

    stepBattle(battle, confirmInput, encounter);

    expect(battle.phase).toBe('script');
    expect(battle.playerMon.hp).toBeLessThan(battle.playerMon.maxHp);
    expect([battle.turnSummary, ...battle.queuedMessages].some((message) => message.includes('recoil'))).toBe(true);
  });

  test('Jump Kick-style moves crash on ordinary accuracy misses', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();
    battle.active = true;
    battle.phase = 'moveSelect';
    battle.playerMon.hp = battle.playerMon.maxHp;
    battle.playerMon.speed = 99;
    battle.moves = [makeDamageMove('JUMP_KICK', 'EFFECT_RECOIL_IF_MISS', 'fighting', 70, 1)];
    battle.playerMon.moves = battle.moves;
    battle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    battle.wildMon.moves = battle.wildMoves;

    stepBattle(battle, confirmInput, encounter);

    expect(battle.playerMon.hp).toBeLessThan(battle.playerMon.maxHp);
    expect([battle.turnSummary, ...battle.queuedMessages].some((message) => message.includes('crashed'))).toBe(true);
  });

  test('damaging stat-down secondary effects apply after a hit', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();
    battle.active = true;
    battle.phase = 'moveSelect';
    battle.playerMon.speed = 99;
    battle.moves = [makeDamageMove('BUBBLE', 'EFFECT_SPEED_DOWN_HIT', 'water', 20, 0, 100)];
    battle.playerMon.moves = battle.moves;

    stepBattle(battle, confirmInput, encounter);

    expect(battle.wildMon.statStages.speed).toBe(-1);
    expect([battle.turnSummary, ...battle.queuedMessages].some((message) => message.includes('SPEED fell'))).toBe(true);
  });

  test('damaging self-boost and all-stat secondary effects apply after a hit', () => {
    const attackUpBattle = createBattleState();
    const allStatsBattle = createBattleState();
    attackUpBattle.active = true;
    attackUpBattle.phase = 'moveSelect';
    attackUpBattle.playerMon.speed = 99;
    attackUpBattle.moves = [makeDamageMove('METAL_CLAW', 'EFFECT_ATTACK_UP_HIT', 'steel', 50, 0, 100)];
    attackUpBattle.playerMon.moves = attackUpBattle.moves;

    stepBattle(attackUpBattle, confirmInput, createBattleEncounterState());

    expect(attackUpBattle.playerMon.statStages.attack).toBe(1);

    allStatsBattle.active = true;
    allStatsBattle.phase = 'moveSelect';
    allStatsBattle.playerMon.speed = 99;
    allStatsBattle.moves = [makeDamageMove('ANCIENT_POWER', 'EFFECT_ALL_STATS_UP_HIT', 'rock', 60, 0, 100)];
    allStatsBattle.playerMon.moves = allStatsBattle.moves;

    stepBattle(allStatsBattle, confirmInput, createBattleEncounterState());

    expect(allStatsBattle.playerMon.statStages.attack).toBe(1);
    expect(allStatsBattle.playerMon.statStages.defense).toBe(1);
    expect(allStatsBattle.playerMon.statStages.speed).toBe(1);
    expect(allStatsBattle.playerMon.statStages.spAttack).toBe(1);
    expect(allStatsBattle.playerMon.statStages.spDefense).toBe(1);
  });

  test('fixed-damage moves use their decomp script damage values', () => {
    const sonicBattle = createBattleState();
    const rageBattle = createBattleState();
    const levelBattle = createBattleState();
    const fangBattle = createBattleState();
    for (const battle of [sonicBattle, rageBattle, levelBattle, fangBattle]) {
      battle.active = true;
      battle.phase = 'moveSelect';
      battle.playerMon.speed = 99;
      battle.wildMon.hp = battle.wildMon.maxHp;
      battle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
      battle.wildMon.moves = battle.wildMoves;
    }
    sonicBattle.moves = [makeDamageMove('SONIC_BOOM', 'EFFECT_SONICBOOM', 'normal')];
    rageBattle.moves = [makeDamageMove('DRAGON_RAGE', 'EFFECT_DRAGON_RAGE', 'dragon')];
    levelBattle.moves = [makeDamageMove('SEISMIC_TOSS', 'EFFECT_LEVEL_DAMAGE', 'fighting')];
    fangBattle.moves = [makeDamageMove('SUPER_FANG', 'EFFECT_SUPER_FANG', 'normal')];
    sonicBattle.playerMon.moves = sonicBattle.moves;
    rageBattle.playerMon.moves = rageBattle.moves;
    levelBattle.playerMon.moves = levelBattle.moves;
    fangBattle.playerMon.moves = fangBattle.moves;

    stepBattle(sonicBattle, confirmInput, createBattleEncounterState());
    stepBattle(rageBattle, confirmInput, createBattleEncounterState());
    stepBattle(levelBattle, confirmInput, createBattleEncounterState());
    stepBattle(fangBattle, confirmInput, createBattleEncounterState());

    expect(sonicBattle.wildMon.hp).toBe(Math.max(0, sonicBattle.wildMon.maxHp - 20));
    expect(rageBattle.wildMon.hp).toBe(Math.max(0, rageBattle.wildMon.maxHp - 40));
    expect(levelBattle.wildMon.hp).toBe(levelBattle.wildMon.maxHp - levelBattle.playerMon.level);
    expect(fangBattle.wildMon.hp).toBe(fangBattle.wildMon.maxHp - Math.floor(fangBattle.wildMon.maxHp / 2));
  });

  test('fixed-damage moves still respect type immunity', () => {
    const battle = createBattleState();
    battle.active = true;
    battle.phase = 'moveSelect';
    battle.playerMon.speed = 99;
    battle.wildMon.types = ['ghost'];
    battle.moves = [makeDamageMove('SONIC_BOOM', 'EFFECT_SONICBOOM', 'normal')];
    battle.playerMon.moves = battle.moves;

    stepBattle(battle, confirmInput, createBattleEncounterState());

    expect(battle.wildMon.hp).toBe(battle.wildMon.maxHp);
    expect([battle.turnSummary, ...battle.queuedMessages].some((message) => message.includes("doesn't affect"))).toBe(true);
  });

  test('Reflect and Light Screen reduce matching damage categories', () => {
    const physicalBase = createBattleState();
    const physicalScreen = createBattleState();
    const specialBase = createBattleState();
    const specialScreen = createBattleState();
    const scratch = makeDamageMove('SCRATCH', 'EFFECT_HIT', 'normal', 35);
    const ember = makeDamageMove('EMBER', 'EFFECT_HIT', 'fire', 40);

    for (const battle of [physicalBase, physicalScreen, specialBase, specialScreen]) {
      battle.active = true;
      battle.phase = 'moveSelect';
      battle.playerMon.speed = 99;
      battle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
      battle.wildMon.moves = battle.wildMoves;
    }

    physicalBase.moves = [{ ...scratch }];
    physicalBase.playerMon.moves = physicalBase.moves;
    physicalScreen.moves = [{ ...scratch }];
    physicalScreen.playerMon.moves = physicalScreen.moves;
    physicalScreen.sideState.opponent.reflectTurns = 5;
    specialBase.moves = [{ ...ember }];
    specialBase.playerMon.moves = specialBase.moves;
    specialScreen.moves = [{ ...ember }];
    specialScreen.playerMon.moves = specialScreen.moves;
    specialScreen.sideState.opponent.lightScreenTurns = 5;

    stepBattle(physicalBase, confirmInput, createBattleEncounterState());
    stepBattle(physicalScreen, confirmInput, createBattleEncounterState());
    stepBattle(specialBase, confirmInput, createBattleEncounterState());
    stepBattle(specialScreen, confirmInput, createBattleEncounterState());

    expect(physicalScreen.wildMon.maxHp - physicalScreen.wildMon.hp).toBeLessThan(physicalBase.wildMon.maxHp - physicalBase.wildMon.hp);
    expect(specialScreen.wildMon.maxHp - specialScreen.wildMon.hp).toBeLessThan(specialBase.wildMon.maxHp - specialBase.wildMon.hp);
  });

  test('weather moves set five-turn weather that modifies damage and residuals', () => {
    const rainMoveBattle = createBattleState();
    const dryBattle = createBattleState();
    const rainBattle = createBattleState();
    const sandBattle = createBattleState();
    const waterGun = makeDamageMove('WATER_GUN', 'EFFECT_HIT', 'water', 40);

    rainMoveBattle.active = true;
    rainMoveBattle.phase = 'moveSelect';
    rainMoveBattle.playerMon.speed = 99;
    rainMoveBattle.moves = [makeStatusMove('RAIN_DANCE', 'EFFECT_RAIN_DANCE', 'water')];
    rainMoveBattle.playerMon.moves = rainMoveBattle.moves;
    rainMoveBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    rainMoveBattle.wildMon.moves = rainMoveBattle.wildMoves;

    stepBattle(rainMoveBattle, confirmInput, createBattleEncounterState());

    expect(rainMoveBattle.weather).toBe('rain');
    expect(rainMoveBattle.weatherTurns).toBe(4);
    expect([rainMoveBattle.turnSummary, ...rainMoveBattle.queuedMessages]).toContain('It started to rain!');

    for (const battle of [dryBattle, rainBattle]) {
      battle.active = true;
      battle.phase = 'moveSelect';
      battle.playerMon.speed = 99;
      battle.moves = [{ ...waterGun }];
      battle.playerMon.moves = battle.moves;
      battle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
      battle.wildMon.moves = battle.wildMoves;
    }
    rainBattle.weather = 'rain';
    rainBattle.weatherTurns = 5;

    stepBattle(dryBattle, confirmInput, createBattleEncounterState());
    stepBattle(rainBattle, confirmInput, createBattleEncounterState());

    expect(rainBattle.wildMon.maxHp - rainBattle.wildMon.hp).toBeGreaterThan(dryBattle.wildMon.maxHp - dryBattle.wildMon.hp);
    expect(rainBattle.weatherTurns).toBe(4);

    sandBattle.active = true;
    sandBattle.phase = 'moveSelect';
    sandBattle.playerMon.speed = 99;
    sandBattle.weather = 'sandstorm';
    sandBattle.weatherTurns = 2;
    sandBattle.moves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    sandBattle.playerMon.moves = sandBattle.moves;
    sandBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    sandBattle.wildMon.moves = sandBattle.wildMoves;
    const playerHp = sandBattle.playerMon.hp;
    const wildHp = sandBattle.wildMon.hp;

    stepBattle(sandBattle, confirmInput, createBattleEncounterState());

    expect(sandBattle.playerMon.hp).toBeLessThan(playerHp);
    expect(sandBattle.wildMon.hp).toBeLessThan(wildHp);
    expect([sandBattle.turnSummary, ...sandBattle.queuedMessages].some((message) => message.includes('sandstorm'))).toBe(true);
  });

  test('Confuse Ray applies volatile confusion and confusion can cause self-damage before a move', () => {
    const rayBattle = createBattleState();
    rayBattle.active = true;
    rayBattle.phase = 'moveSelect';
    rayBattle.playerMon.speed = 1;
    rayBattle.wildMon.speed = 99;
    rayBattle.moves = [makeStatusMove('CONFUSE_RAY', 'EFFECT_CONFUSE', 'ghost')];
    rayBattle.playerMon.moves = rayBattle.moves;
    rayBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    rayBattle.wildMon.moves = rayBattle.wildMoves;

    stepBattle(rayBattle, confirmInput, createBattleEncounterState());

    expect(rayBattle.wildMon.volatile.confusionTurns).toBeGreaterThan(0);
    expect([rayBattle.turnSummary, ...rayBattle.queuedMessages].some((message) => message.includes('confused'))).toBe(true);

    const selfHitBattle = createBattleState();
    const encounter = createBattleEncounterState();
    encounter.rngState = 0;
    selfHitBattle.active = true;
    selfHitBattle.phase = 'moveSelect';
    selfHitBattle.playerMon.speed = 99;
    selfHitBattle.playerMon.volatile.confusionTurns = 2;
    selfHitBattle.moves = [makeDamageMove('SCRATCH', 'EFFECT_HIT', 'normal', 40)];
    selfHitBattle.playerMon.moves = selfHitBattle.moves;
    selfHitBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    selfHitBattle.wildMon.moves = selfHitBattle.wildMoves;
    const playerHp = selfHitBattle.playerMon.hp;
    const wildHp = selfHitBattle.wildMon.hp;

    stepBattle(selfHitBattle, confirmInput, encounter);

    expect(selfHitBattle.playerMon.hp).toBeLessThan(playerHp);
    expect(selfHitBattle.wildMon.hp).toBe(wildHp);
    expect([selfHitBattle.turnSummary, ...selfHitBattle.queuedMessages]).toContain('It hurt itself in its confusion!');
  });

  test('flinch secondaries stop a pending foe action', () => {
    const battle = createBattleState();
    battle.active = true;
    battle.phase = 'moveSelect';
    battle.playerMon.speed = 99;
    battle.wildMon.speed = 1;
    battle.moves = [makeDamageMove('BITE', 'EFFECT_FLINCH_HIT', 'dark', 20, 0, 100)];
    battle.playerMon.moves = battle.moves;
    battle.wildMoves = [makeDamageMove('TACKLE', 'EFFECT_HIT', 'normal', 40)];
    battle.wildMon.moves = battle.wildMoves;
    const playerHp = battle.playerMon.hp;

    stepBattle(battle, confirmInput, createBattleEncounterState());

    expect(battle.playerMon.hp).toBe(playerHp);
    expect([battle.turnSummary, ...battle.queuedMessages]).toContain(`${battle.wildMon.species} flinched!`);
  });

  test('Protect blocks the pending target move and clears after the turn', () => {
    const battle = createBattleState();
    battle.active = true;
    battle.phase = 'moveSelect';
    battle.playerMon.speed = 99;
    battle.wildMon.speed = 1;
    battle.moves = [makeStatusMove('PROTECT', 'EFFECT_PROTECT', 'normal')];
    battle.playerMon.moves = battle.moves;
    battle.wildMoves = [makeDamageMove('TACKLE', 'EFFECT_HIT', 'normal', 40)];
    battle.wildMon.moves = battle.wildMoves;
    const playerHp = battle.playerMon.hp;

    stepBattle(battle, confirmInput, createBattleEncounterState());

    expect(battle.playerMon.hp).toBe(playerHp);
    expect(battle.playerMon.volatile.protected).toBe(false);
    expect([battle.turnSummary, ...battle.queuedMessages].filter((message) => message.includes('protected itself')).length).toBeGreaterThanOrEqual(2);
  });

  test('sleep has a finite turn counter and waking resumes the selected move', () => {
    const battle = createBattleState();
    battle.active = true;
    battle.phase = 'moveSelect';
    battle.playerMon.speed = 99;
    battle.playerMon.status = 'sleep';
    battle.playerMon.statusTurns = 1;
    battle.moves = [makeDamageMove('SCRATCH', 'EFFECT_HIT', 'normal', 40)];
    battle.playerMon.moves = battle.moves;
    battle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    battle.wildMon.moves = battle.wildMoves;
    const wildHp = battle.wildMon.hp;

    stepBattle(battle, confirmInput, createBattleEncounterState());

    expect(battle.playerMon.status).toBe('none');
    expect(battle.wildMon.hp).toBeLessThan(wildHp);
    expect([battle.turnSummary, ...battle.queuedMessages]).toContain(`${battle.playerMon.species} woke up!`);
  });

  test('Substitute costs HP and takes target damage before the user does', () => {
    const battle = createBattleState();
    battle.active = true;
    battle.phase = 'moveSelect';
    battle.playerMon.speed = 99;
    battle.wildMon.speed = 1;
    battle.moves = [makeStatusMove('SUBSTITUTE', 'EFFECT_SUBSTITUTE', 'normal')];
    battle.playerMon.moves = battle.moves;
    battle.wildMoves = [makeDamageMove('TACKLE', 'EFFECT_HIT', 'normal', 40)];
    battle.wildMon.moves = battle.wildMoves;
    const hpCost = Math.max(1, Math.floor(battle.playerMon.maxHp / 4));

    stepBattle(battle, confirmInput, createBattleEncounterState());

    expect(battle.playerMon.hp).toBe(battle.playerMon.maxHp - hpCost);
    expect(battle.playerMon.volatile.substituteHp).toBeLessThan(hpCost);
    expect([battle.turnSummary, ...battle.queuedMessages].some((message) => message.includes('substitute'))).toBe(true);
  });

  test('Leech Seed drains at end of turn and Grass types are immune', () => {
    const seededBattle = createBattleState();
    seededBattle.active = true;
    seededBattle.phase = 'moveSelect';
    seededBattle.playerMon.speed = 99;
    seededBattle.playerMon.hp = 10;
    seededBattle.moves = [makeStatusMove('LEECH_SEED', 'EFFECT_LEECH_SEED', 'grass')];
    seededBattle.playerMon.moves = seededBattle.moves;
    seededBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    seededBattle.wildMon.moves = seededBattle.wildMoves;
    const wildHp = seededBattle.wildMon.hp;

    stepBattle(seededBattle, confirmInput, createBattleEncounterState());

    expect(seededBattle.wildMon.volatile.leechSeededBy).toBe('player');
    expect(seededBattle.wildMon.hp).toBeLessThan(wildHp);
    expect(seededBattle.playerMon.hp).toBeGreaterThan(10);

    const grassBattle = createBattleState();
    grassBattle.active = true;
    grassBattle.phase = 'moveSelect';
    grassBattle.playerMon.speed = 99;
    grassBattle.wildMon.types = ['grass'];
    grassBattle.moves = [makeStatusMove('LEECH_SEED', 'EFFECT_LEECH_SEED', 'grass')];
    grassBattle.playerMon.moves = grassBattle.moves;

    stepBattle(grassBattle, confirmInput, createBattleEncounterState());

    expect(grassBattle.wildMon.volatile.leechSeededBy).toBeNull();
    expect([grassBattle.turnSummary, ...grassBattle.queuedMessages].some((message) => message.includes("doesn't affect"))).toBe(true);
  });

  test('Safeguard blocks status and Mist blocks stat drops for five-turn side state', () => {
    const safeguardBattle = createBattleState();
    safeguardBattle.active = true;
    safeguardBattle.phase = 'moveSelect';
    safeguardBattle.playerMon.speed = 99;
    safeguardBattle.wildMon.speed = 1;
    safeguardBattle.moves = [makeStatusMove('SAFEGUARD', 'EFFECT_SAFEGUARD', 'normal')];
    safeguardBattle.playerMon.moves = safeguardBattle.moves;
    safeguardBattle.wildMoves = [makeStatusMove('SLEEP_POWDER', 'EFFECT_SLEEP', 'grass')];
    safeguardBattle.wildMon.moves = safeguardBattle.wildMoves;

    stepBattle(safeguardBattle, confirmInput, createBattleEncounterState());

    expect(safeguardBattle.playerMon.status).toBe('none');
    expect(safeguardBattle.sideState.player.safeguardTurns).toBe(4);
    expect([safeguardBattle.turnSummary, ...safeguardBattle.queuedMessages].some((message) => message.includes('Safeguard'))).toBe(true);

    const mistBattle = createBattleState();
    mistBattle.active = true;
    mistBattle.phase = 'moveSelect';
    mistBattle.playerMon.speed = 99;
    mistBattle.wildMon.speed = 1;
    mistBattle.moves = [makeStatusMove('MIST', 'EFFECT_MIST', 'ice')];
    mistBattle.playerMon.moves = mistBattle.moves;
    mistBattle.wildMoves = [makeStatusMove('GROWL', 'EFFECT_ATTACK_DOWN', 'normal')];
    mistBattle.wildMon.moves = mistBattle.wildMoves;

    stepBattle(mistBattle, confirmInput, createBattleEncounterState());

    expect(mistBattle.playerMon.statStages.attack).toBe(0);
    expect(mistBattle.sideState.player.mistTurns).toBe(4);
    expect([mistBattle.turnSummary, ...mistBattle.queuedMessages].some((message) => message.includes('Mist'))).toBe(true);
  });

  test('Haze clears stat stages and Brick Break removes Reflect and Light Screen before damage', () => {
    const hazeBattle = createBattleState();
    hazeBattle.active = true;
    hazeBattle.phase = 'moveSelect';
    hazeBattle.playerMon.speed = 99;
    hazeBattle.playerMon.statStages.attack = 4;
    hazeBattle.wildMon.statStages.defense = -3;
    hazeBattle.moves = [makeStatusMove('HAZE', 'EFFECT_HAZE', 'ice')];
    hazeBattle.playerMon.moves = hazeBattle.moves;
    hazeBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    hazeBattle.wildMon.moves = hazeBattle.wildMoves;

    stepBattle(hazeBattle, confirmInput, createBattleEncounterState());

    expect(hazeBattle.playerMon.statStages.attack).toBe(0);
    expect(hazeBattle.wildMon.statStages.defense).toBe(0);

    const brickBattle = createBattleState();
    brickBattle.active = true;
    brickBattle.phase = 'moveSelect';
    brickBattle.playerMon.speed = 99;
    brickBattle.sideState.opponent.reflectTurns = 5;
    brickBattle.sideState.opponent.lightScreenTurns = 5;
    brickBattle.moves = [makeDamageMove('BRICK_BREAK', 'EFFECT_BRICK_BREAK', 'fighting', 75)];
    brickBattle.playerMon.moves = brickBattle.moves;
    brickBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    brickBattle.wildMon.moves = brickBattle.wildMoves;

    stepBattle(brickBattle, confirmInput, createBattleEncounterState());

    expect(brickBattle.sideState.opponent.reflectTurns).toBe(0);
    expect(brickBattle.sideState.opponent.lightScreenTurns).toBe(0);
    expect(brickBattle.wildMon.hp).toBeLessThan(brickBattle.wildMon.maxHp);
  });

  test('Facade, Flail, Eruption, and False Swipe use decomp-style dynamic damage', () => {
    const normalFacade = createBattleState();
    const statusFacade = createBattleState();
    const fullFlail = createBattleState();
    const lowFlail = createBattleState();
    const fullEruption = createBattleState();
    const lowEruption = createBattleState();
    for (const battle of [normalFacade, statusFacade, fullFlail, lowFlail, fullEruption, lowEruption]) {
      battle.active = true;
      battle.phase = 'moveSelect';
      battle.playerMon.speed = 99;
      battle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
      battle.wildMon.moves = battle.wildMoves;
    }
    normalFacade.moves = [makeDamageMove('FACADE', 'EFFECT_FACADE', 'normal', 70)];
    normalFacade.playerMon.moves = normalFacade.moves;
    statusFacade.playerMon.status = 'poison';
    statusFacade.moves = [makeDamageMove('FACADE', 'EFFECT_FACADE', 'normal', 70)];
    statusFacade.playerMon.moves = statusFacade.moves;
    fullFlail.moves = [makeDamageMove('FLAIL', 'EFFECT_FLAIL', 'normal', 1)];
    fullFlail.playerMon.moves = fullFlail.moves;
    lowFlail.playerMon.hp = 1;
    lowFlail.moves = [makeDamageMove('FLAIL', 'EFFECT_FLAIL', 'normal', 1)];
    lowFlail.playerMon.moves = lowFlail.moves;
    fullEruption.moves = [makeDamageMove('ERUPTION', 'EFFECT_ERUPTION', 'fire', 150)];
    fullEruption.playerMon.moves = fullEruption.moves;
    lowEruption.playerMon.hp = 1;
    lowEruption.moves = [makeDamageMove('ERUPTION', 'EFFECT_ERUPTION', 'fire', 150)];
    lowEruption.playerMon.moves = lowEruption.moves;

    stepBattle(normalFacade, confirmInput, createBattleEncounterState());
    stepBattle(statusFacade, confirmInput, createBattleEncounterState());
    stepBattle(fullFlail, confirmInput, createBattleEncounterState());
    stepBattle(lowFlail, confirmInput, createBattleEncounterState());
    stepBattle(fullEruption, confirmInput, createBattleEncounterState());
    stepBattle(lowEruption, confirmInput, createBattleEncounterState());

    expect(statusFacade.wildMon.maxHp - statusFacade.wildMon.hp).toBeGreaterThan(normalFacade.wildMon.maxHp - normalFacade.wildMon.hp);
    expect(lowFlail.wildMon.maxHp - lowFlail.wildMon.hp).toBeGreaterThan(fullFlail.wildMon.maxHp - fullFlail.wildMon.hp);
    expect(fullEruption.wildMon.maxHp - fullEruption.wildMon.hp).toBeGreaterThan(lowEruption.wildMon.maxHp - lowEruption.wildMon.hp);

    const falseSwipeBattle = createBattleState();
    falseSwipeBattle.active = true;
    falseSwipeBattle.phase = 'moveSelect';
    falseSwipeBattle.playerMon.speed = 99;
    falseSwipeBattle.wildMon.hp = 3;
    falseSwipeBattle.moves = [makeDamageMove('FALSE_SWIPE', 'EFFECT_FALSE_SWIPE', 'normal', 200)];
    falseSwipeBattle.playerMon.moves = falseSwipeBattle.moves;

    stepBattle(falseSwipeBattle, confirmInput, createBattleEncounterState());

    expect(falseSwipeBattle.wildMon.hp).toBe(1);
  });

  test('Focus Energy, Belly Drum, and combo stat moves update battle stages', () => {
    const focusBattle = createBattleState();
    focusBattle.active = true;
    focusBattle.phase = 'moveSelect';
    focusBattle.playerMon.speed = 99;
    focusBattle.moves = [makeStatusMove('FOCUS_ENERGY', 'EFFECT_FOCUS_ENERGY', 'normal')];
    focusBattle.playerMon.moves = focusBattle.moves;
    focusBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    focusBattle.wildMon.moves = focusBattle.wildMoves;

    stepBattle(focusBattle, confirmInput, createBattleEncounterState());

    expect(focusBattle.playerMon.volatile.focusEnergy).toBe(true);

    const bellyBattle = createBattleState();
    bellyBattle.active = true;
    bellyBattle.phase = 'moveSelect';
    bellyBattle.playerMon.speed = 99;
    bellyBattle.moves = [makeStatusMove('BELLY_DRUM', 'EFFECT_BELLY_DRUM', 'normal')];
    bellyBattle.playerMon.moves = bellyBattle.moves;
    bellyBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    bellyBattle.wildMon.moves = bellyBattle.wildMoves;
    const hpCost = Math.floor(bellyBattle.playerMon.maxHp / 2);

    stepBattle(bellyBattle, confirmInput, createBattleEncounterState());

    expect(bellyBattle.playerMon.hp).toBe(bellyBattle.playerMon.maxHp - hpCost);
    expect(bellyBattle.playerMon.statStages.attack).toBe(6);

    const danceBattle = createBattleState();
    danceBattle.active = true;
    danceBattle.phase = 'moveSelect';
    danceBattle.playerMon.speed = 99;
    danceBattle.moves = [makeStatusMove('DRAGON_DANCE', 'EFFECT_DRAGON_DANCE', 'dragon')];
    danceBattle.playerMon.moves = danceBattle.moves;
    danceBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    danceBattle.wildMon.moves = danceBattle.wildMoves;

    stepBattle(danceBattle, confirmInput, createBattleEncounterState());

    expect(danceBattle.playerMon.statStages.attack).toBe(1);
    expect(danceBattle.playerMon.statStages.speed).toBe(1);
  });

  test('multi-hit, OHKO, and self-dropping damage effects follow decomp move scripts', () => {
    const doubleHitBattle = createBattleState();
    const singleHitBattle = createBattleState();
    for (const battle of [doubleHitBattle, singleHitBattle]) {
      battle.active = true;
      battle.phase = 'moveSelect';
      battle.playerMon.speed = 99;
      battle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
      battle.wildMon.moves = battle.wildMoves;
    }
    doubleHitBattle.moves = [makeDamageMove('DOUBLE_HIT', 'EFFECT_DOUBLE_HIT', 'normal', 20)];
    doubleHitBattle.playerMon.moves = doubleHitBattle.moves;
    singleHitBattle.moves = [makeDamageMove('TACKLE', 'EFFECT_HIT', 'normal', 20)];
    singleHitBattle.playerMon.moves = singleHitBattle.moves;

    stepBattle(doubleHitBattle, confirmInput, createBattleEncounterState());
    stepBattle(singleHitBattle, confirmInput, createBattleEncounterState());

    expect(doubleHitBattle.wildMon.maxHp - doubleHitBattle.wildMon.hp).toBeGreaterThan(singleHitBattle.wildMon.maxHp - singleHitBattle.wildMon.hp);
    expect([doubleHitBattle.turnSummary, ...doubleHitBattle.queuedMessages]).toContain('Hit 2 times!');

    const ohkoBattle = createBattleState();
    ohkoBattle.active = true;
    ohkoBattle.phase = 'moveSelect';
    ohkoBattle.playerMon.speed = 99;
    ohkoBattle.playerMon.level = 10;
    ohkoBattle.wildMon.level = 3;
    ohkoBattle.moves = [makeDamageMove('SHEER_COLD', 'EFFECT_OHKO', 'ice', 1, 0)];
    ohkoBattle.playerMon.moves = ohkoBattle.moves;

    stepBattle(ohkoBattle, confirmInput, createBattleEncounterState());

    expect(ohkoBattle.wildMon.hp).toBe(0);
    expect([ohkoBattle.turnSummary, ...ohkoBattle.queuedMessages]).toContain("It's a one-hit KO!");

    const superpowerBattle = createBattleState();
    superpowerBattle.active = true;
    superpowerBattle.phase = 'moveSelect';
    superpowerBattle.playerMon.speed = 99;
    superpowerBattle.moves = [makeDamageMove('SUPERPOWER', 'EFFECT_SUPERPOWER', 'fighting', 120)];
    superpowerBattle.playerMon.moves = superpowerBattle.moves;
    superpowerBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    superpowerBattle.wildMon.moves = superpowerBattle.wildMoves;

    stepBattle(superpowerBattle, confirmInput, createBattleEncounterState());

    expect(superpowerBattle.playerMon.statStages.attack).toBe(-1);
    expect(superpowerBattle.playerMon.statStages.defense).toBe(-1);
  });

  test('Always-hit moves bypass accuracy and Thunder follows weather accuracy', () => {
    const swiftBattle = createBattleState();
    swiftBattle.active = true;
    swiftBattle.phase = 'moveSelect';
    swiftBattle.playerMon.speed = 99;
    swiftBattle.moves = [makeDamageMove('SWIFT', 'EFFECT_ALWAYS_HIT', 'normal', 60, 1)];
    swiftBattle.playerMon.moves = swiftBattle.moves;
    swiftBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    swiftBattle.wildMon.moves = swiftBattle.wildMoves;

    stepBattle(swiftBattle, confirmInput, createBattleEncounterState());

    expect(swiftBattle.wildMon.hp).toBeLessThan(swiftBattle.wildMon.maxHp);

    const rainThunder = createBattleState();
    rainThunder.active = true;
    rainThunder.phase = 'moveSelect';
    rainThunder.playerMon.speed = 99;
    rainThunder.weather = 'rain';
    rainThunder.weatherTurns = 5;
    rainThunder.moves = [makeDamageMove('THUNDER', 'EFFECT_THUNDER', 'electric', 120, 1)];
    rainThunder.playerMon.moves = rainThunder.moves;
    rainThunder.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    rainThunder.wildMon.moves = rainThunder.wildMoves;

    stepBattle(rainThunder, confirmInput, createBattleEncounterState());

    expect(rainThunder.wildMon.hp).toBeLessThan(rainThunder.wildMon.maxHp);
    expect([rainThunder.turnSummary, ...rainThunder.queuedMessages]).not.toContain('The attack missed!');
  });

  test('Endure braces for a lethal pending hit without blocking damage outright', () => {
    const battle = createBattleState();
    battle.active = true;
    battle.phase = 'moveSelect';
    battle.playerMon.speed = 99;
    battle.wildMon.speed = 1;
    battle.wildMon.attack = 999;
    battle.moves = [makeStatusMove('ENDURE', 'EFFECT_ENDURE', 'normal')];
    battle.playerMon.moves = battle.moves;
    battle.wildMoves = [makeDamageMove('MEGA_HIT', 'EFFECT_HIT', 'normal', 250)];
    battle.wildMon.moves = battle.wildMoves;

    stepBattle(battle, confirmInput, createBattleEncounterState());

    expect(battle.playerMon.hp).toBe(1);
    expect(battle.playerMon.volatile.enduring).toBe(false);
    expect([battle.turnSummary, ...battle.queuedMessages]).toContain(`${battle.playerMon.species} endured the hit!`);
  });

  test('Recharge effects consume the next attempted action', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();
    battle.active = true;
    battle.phase = 'moveSelect';
    battle.playerMon.speed = 99;
    battle.moves = [makeDamageMove('HYPER_BEAM', 'EFFECT_RECHARGE', 'normal', 50)];
    battle.playerMon.moves = battle.moves;
    battle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    battle.wildMon.moves = battle.wildMoves;

    stepBattle(battle, confirmInput, encounter);
    expect(battle.playerMon.volatile.rechargeTurns).toBe(1);

    flushScriptMessages(battle, encounter);
    stepBattle(battle, confirmInput, encounter);
    const wildHp = battle.wildMon.hp;
    stepBattle(battle, confirmInput, encounter);

    expect(battle.wildMon.hp).toBe(wildHp);
    expect([battle.turnSummary, ...battle.queuedMessages]).toContain(`${battle.playerMon.species} must recharge!`);
  });

  test('trapping moves tick at end of turn and Rapid Spin frees binding effects', () => {
    const trapBattle = createBattleState();
    trapBattle.active = true;
    trapBattle.phase = 'moveSelect';
    trapBattle.playerMon.speed = 99;
    trapBattle.moves = [makeDamageMove('WRAP', 'EFFECT_TRAP', 'normal', 15)];
    trapBattle.playerMon.moves = trapBattle.moves;
    trapBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    trapBattle.wildMon.moves = trapBattle.wildMoves;
    const wildHp = trapBattle.wildMon.hp;

    stepBattle(trapBattle, confirmInput, createBattleEncounterState());

    expect(trapBattle.wildMon.volatile.trappedBy).toBe('player');
    expect(trapBattle.wildMon.volatile.trapTurns).toBeGreaterThan(0);
    expect(trapBattle.wildMon.hp).toBeLessThan(wildHp);
    expect([trapBattle.turnSummary, ...trapBattle.queuedMessages].some((message) => message.includes('trap'))).toBe(true);

    const spinBattle = createBattleState();
    spinBattle.active = true;
    spinBattle.phase = 'moveSelect';
    spinBattle.playerMon.speed = 99;
    spinBattle.playerMon.volatile.trapTurns = 3;
    spinBattle.playerMon.volatile.trappedBy = 'opponent';
    spinBattle.playerMon.volatile.leechSeededBy = 'opponent';
    spinBattle.moves = [makeDamageMove('RAPID_SPIN', 'EFFECT_RAPID_SPIN', 'normal', 20)];
    spinBattle.playerMon.moves = spinBattle.moves;
    spinBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    spinBattle.wildMon.moves = spinBattle.wildMoves;

    stepBattle(spinBattle, confirmInput, createBattleEncounterState());

    expect(spinBattle.playerMon.volatile.trapTurns).toBe(0);
    expect(spinBattle.playerMon.volatile.trappedBy).toBeNull();
    expect(spinBattle.playerMon.volatile.leechSeededBy).toBeNull();
  });

  test('Yawn, Nightmare, and Perish Song advance through end-of-turn counters', () => {
    const yawnBattle = createBattleState();
    const yawnEncounter = createBattleEncounterState();
    yawnBattle.active = true;
    yawnBattle.phase = 'moveSelect';
    yawnBattle.playerMon.speed = 99;
    yawnBattle.moves = [makeStatusMove('YAWN', 'EFFECT_YAWN', 'normal')];
    yawnBattle.playerMon.moves = yawnBattle.moves;
    yawnBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    yawnBattle.wildMon.moves = yawnBattle.wildMoves;

    stepBattle(yawnBattle, confirmInput, yawnEncounter);
    expect(yawnBattle.wildMon.volatile.yawnTurns).toBe(1);
    expect(yawnBattle.wildMon.status).toBe('none');

    flushScriptMessages(yawnBattle, yawnEncounter);
    stepBattle(yawnBattle, confirmInput, yawnEncounter);
    stepBattle(yawnBattle, confirmInput, yawnEncounter);

    expect(yawnBattle.wildMon.status).toBe('sleep');
    expect([yawnBattle.turnSummary, ...yawnBattle.queuedMessages]).toContain(`${yawnBattle.wildMon.species} fell asleep!`);

    const nightmareBattle = createBattleState();
    nightmareBattle.active = true;
    nightmareBattle.phase = 'moveSelect';
    nightmareBattle.playerMon.speed = 99;
    nightmareBattle.wildMon.status = 'sleep';
    nightmareBattle.wildMon.statusTurns = 3;
    nightmareBattle.moves = [makeStatusMove('NIGHTMARE', 'EFFECT_NIGHTMARE', 'ghost')];
    nightmareBattle.playerMon.moves = nightmareBattle.moves;
    nightmareBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    nightmareBattle.wildMon.moves = nightmareBattle.wildMoves;
    const nightmareHp = nightmareBattle.wildMon.hp;

    stepBattle(nightmareBattle, confirmInput, createBattleEncounterState());

    expect(nightmareBattle.wildMon.volatile.nightmare).toBe(true);
    expect(nightmareBattle.wildMon.hp).toBeLessThanOrEqual(nightmareHp - Math.floor(nightmareBattle.wildMon.maxHp / 4));

    const perishBattle = createBattleState();
    perishBattle.active = true;
    perishBattle.phase = 'moveSelect';
    perishBattle.playerMon.speed = 99;
    perishBattle.moves = [makeStatusMove('PERISH_SONG', 'EFFECT_PERISH_SONG', 'normal')];
    perishBattle.playerMon.moves = perishBattle.moves;
    perishBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    perishBattle.wildMon.moves = perishBattle.wildMoves;

    stepBattle(perishBattle, confirmInput, createBattleEncounterState());

    expect(perishBattle.playerMon.volatile.perishTurns).toBe(2);
    expect(perishBattle.wildMon.volatile.perishTurns).toBe(2);
  });

  test('Wish, Refresh, Heal Bell, and Pain Split follow their battle-script state changes', () => {
    const wishBattle = createBattleState();
    wishBattle.active = true;
    wishBattle.phase = 'moveSelect';
    wishBattle.playerMon.speed = 99;
    wishBattle.playerMon.hp = 5;
    wishBattle.sideState.player.wishTurns = 1;
    wishBattle.sideState.player.wishHp = 10;
    wishBattle.moves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    wishBattle.playerMon.moves = wishBattle.moves;
    wishBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    wishBattle.wildMon.moves = wishBattle.wildMoves;

    stepBattle(wishBattle, confirmInput, createBattleEncounterState());

    expect(wishBattle.playerMon.hp).toBe(15);
    expect(wishBattle.sideState.player.wishTurns).toBe(0);

    const refreshBattle = createBattleState();
    refreshBattle.active = true;
    refreshBattle.phase = 'moveSelect';
    refreshBattle.playerMon.speed = 99;
    refreshBattle.playerMon.status = 'burn';
    refreshBattle.moves = [makeStatusMove('REFRESH', 'EFFECT_REFRESH', 'normal')];
    refreshBattle.playerMon.moves = refreshBattle.moves;
    refreshBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    refreshBattle.wildMon.moves = refreshBattle.wildMoves;

    stepBattle(refreshBattle, confirmInput, createBattleEncounterState());

    expect(refreshBattle.playerMon.status).toBe('none');

    const bellBattle = createBattleState();
    bellBattle.active = true;
    bellBattle.phase = 'moveSelect';
    bellBattle.playerMon.speed = 99;
    bellBattle.playerMon.status = 'poison';
    bellBattle.party[1]!.status = 'paralysis';
    bellBattle.moves = [makeStatusMove('HEAL_BELL', 'EFFECT_HEAL_BELL', 'normal')];
    bellBattle.playerMon.moves = bellBattle.moves;
    bellBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    bellBattle.wildMon.moves = bellBattle.wildMoves;

    stepBattle(bellBattle, confirmInput, createBattleEncounterState());

    expect(bellBattle.playerMon.status).toBe('none');
    expect(bellBattle.party[1]!.status).toBe('none');

    const painBattle = createBattleState();
    painBattle.active = true;
    painBattle.phase = 'moveSelect';
    painBattle.playerMon.speed = 99;
    painBattle.playerMon.hp = 5;
    painBattle.wildMon.hp = 21;
    painBattle.moves = [makeStatusMove('PAIN_SPLIT', 'EFFECT_PAIN_SPLIT', 'normal')];
    painBattle.playerMon.moves = painBattle.moves;
    painBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    painBattle.wildMon.moves = painBattle.wildMoves;

    stepBattle(painBattle, confirmInput, createBattleEncounterState());

    expect(painBattle.playerMon.hp).toBe(13);
    expect(painBattle.wildMon.hp).toBe(13);
  });

  test('Magnitude, Weather Ball, SmellingSalt, Revenge, Low Kick, and Endeavor use dynamic decomp damage', () => {
    const magnitudeBattle = createBattleState();
    magnitudeBattle.active = true;
    magnitudeBattle.phase = 'moveSelect';
    magnitudeBattle.playerMon.speed = 99;
    magnitudeBattle.wildMon.types = ['normal'];
    magnitudeBattle.moves = [makeDamageMove('MAGNITUDE', 'EFFECT_MAGNITUDE', 'ground', 1)];
    magnitudeBattle.playerMon.moves = magnitudeBattle.moves;
    magnitudeBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    magnitudeBattle.wildMon.moves = magnitudeBattle.wildMoves;

    stepBattle(magnitudeBattle, confirmInput, createBattleEncounterState());

    expect([magnitudeBattle.turnSummary, ...magnitudeBattle.queuedMessages].some((message) => message.startsWith('Magnitude '))).toBe(true);
    expect(magnitudeBattle.wildMon.hp).toBeLessThan(magnitudeBattle.wildMon.maxHp);

    const clearWeatherBall = createBattleState();
    const rainWeatherBall = createBattleState();
    for (const battle of [clearWeatherBall, rainWeatherBall]) {
      battle.active = true;
      battle.phase = 'moveSelect';
      battle.playerMon.speed = 99;
      battle.moves = [makeDamageMove('WEATHER_BALL', 'EFFECT_WEATHER_BALL', 'normal', 50)];
      battle.playerMon.moves = battle.moves;
      battle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
      battle.wildMon.moves = battle.wildMoves;
    }
    rainWeatherBall.weather = 'rain';
    rainWeatherBall.weatherTurns = 5;

    stepBattle(clearWeatherBall, confirmInput, createBattleEncounterState());
    stepBattle(rainWeatherBall, confirmInput, createBattleEncounterState());

    expect(rainWeatherBall.wildMon.maxHp - rainWeatherBall.wildMon.hp).toBeGreaterThan(clearWeatherBall.wildMon.maxHp - clearWeatherBall.wildMon.hp);

    const saltBattle = createBattleState();
    saltBattle.active = true;
    saltBattle.phase = 'moveSelect';
    saltBattle.playerMon.speed = 99;
    saltBattle.wildMon.status = 'paralysis';
    saltBattle.moves = [makeDamageMove('SMELLINGSALT', 'EFFECT_SMELLINGSALT', 'normal', 60)];
    saltBattle.playerMon.moves = saltBattle.moves;
    saltBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    saltBattle.wildMon.moves = saltBattle.wildMoves;

    stepBattle(saltBattle, confirmInput, createBattleEncounterState());

    expect(saltBattle.wildMon.status).toBe('none');

    const normalRevenge = createBattleState();
    const boostedRevenge = createBattleState();
    for (const battle of [normalRevenge, boostedRevenge]) {
      battle.active = true;
      battle.phase = 'moveSelect';
      battle.playerMon.speed = 99;
      battle.moves = [makeDamageMove('REVENGE', 'EFFECT_REVENGE', 'fighting', 60)];
      battle.playerMon.moves = battle.moves;
      battle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
      battle.wildMon.moves = battle.wildMoves;
    }
    boostedRevenge.playerMon.volatile.tookDamageThisTurn = true;

    stepBattle(normalRevenge, confirmInput, createBattleEncounterState());
    stepBattle(boostedRevenge, confirmInput, createBattleEncounterState());

    expect(boostedRevenge.wildMon.maxHp - boostedRevenge.wildMon.hp).toBeGreaterThan(normalRevenge.wildMon.maxHp - normalRevenge.wildMon.hp);

    const lightLowKick = createBattleState();
    const heavyLowKick = createBattleState();
    for (const battle of [lightLowKick, heavyLowKick]) {
      battle.active = true;
      battle.phase = 'moveSelect';
      battle.playerMon.speed = 99;
      battle.moves = [makeDamageMove('LOW_KICK', 'EFFECT_LOW_KICK', 'fighting', 1)];
      battle.playerMon.moves = battle.moves;
      battle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
      battle.wildMon.moves = battle.wildMoves;
    }
    lightLowKick.wildMon.species = 'PIDGEY';
    heavyLowKick.wildMon.species = 'ONIX';

    stepBattle(lightLowKick, confirmInput, createBattleEncounterState());
    stepBattle(heavyLowKick, confirmInput, createBattleEncounterState());

    expect(heavyLowKick.wildMon.maxHp - heavyLowKick.wildMon.hp).toBeGreaterThan(lightLowKick.wildMon.maxHp - lightLowKick.wildMon.hp);

    const endeavorBattle = createBattleState();
    endeavorBattle.active = true;
    endeavorBattle.phase = 'moveSelect';
    endeavorBattle.playerMon.speed = 99;
    endeavorBattle.playerMon.hp = 5;
    endeavorBattle.wildMon.hp = 20;
    endeavorBattle.moves = [makeDamageMove('ENDEAVOR', 'EFFECT_ENDEAVOR', 'normal', 0)];
    endeavorBattle.playerMon.moves = endeavorBattle.moves;
    endeavorBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    endeavorBattle.wildMon.moves = endeavorBattle.wildMoves;

    stepBattle(endeavorBattle, confirmInput, createBattleEncounterState());

    expect(endeavorBattle.wildMon.hp).toBe(5);
  });

  test('Psych Up, Swagger, Flatter, Minimize, and Memento apply status2-era script state', () => {
    const psychBattle = createBattleState();
    psychBattle.active = true;
    psychBattle.phase = 'moveSelect';
    psychBattle.playerMon.speed = 99;
    psychBattle.wildMon.statStages.attack = 3;
    psychBattle.wildMon.statStages.evasion = 2;
    psychBattle.moves = [makeStatusMove('PSYCH_UP', 'EFFECT_PSYCH_UP', 'normal')];
    psychBattle.playerMon.moves = psychBattle.moves;
    psychBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    psychBattle.wildMon.moves = psychBattle.wildMoves;

    stepBattle(psychBattle, confirmInput, createBattleEncounterState());

    expect(psychBattle.playerMon.statStages.attack).toBe(3);
    expect(psychBattle.playerMon.statStages.evasion).toBe(2);

    const swaggerBattle = createBattleState();
    swaggerBattle.active = true;
    swaggerBattle.phase = 'moveSelect';
    swaggerBattle.playerMon.speed = 99;
    swaggerBattle.moves = [makeStatusMove('SWAGGER', 'EFFECT_SWAGGER', 'normal')];
    swaggerBattle.playerMon.moves = swaggerBattle.moves;
    swaggerBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    swaggerBattle.wildMon.moves = swaggerBattle.wildMoves;

    stepBattle(swaggerBattle, confirmInput, createBattleEncounterState());

    expect(swaggerBattle.wildMon.statStages.attack).toBe(2);
    expect(swaggerBattle.wildMon.volatile.confusionTurns).toBeGreaterThan(0);

    const flatterBattle = createBattleState();
    flatterBattle.active = true;
    flatterBattle.phase = 'moveSelect';
    flatterBattle.playerMon.speed = 99;
    flatterBattle.moves = [makeStatusMove('FLATTER', 'EFFECT_FLATTER', 'dark')];
    flatterBattle.playerMon.moves = flatterBattle.moves;
    flatterBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    flatterBattle.wildMon.moves = flatterBattle.wildMoves;

    stepBattle(flatterBattle, confirmInput, createBattleEncounterState());

    expect(flatterBattle.wildMon.statStages.spAttack).toBe(1);
    expect(flatterBattle.wildMon.volatile.confusionTurns).toBeGreaterThan(0);

    const minimizeBattle = createBattleState();
    minimizeBattle.active = true;
    minimizeBattle.phase = 'moveSelect';
    minimizeBattle.playerMon.speed = 99;
    minimizeBattle.moves = [makeStatusMove('MINIMIZE', 'EFFECT_MINIMIZE', 'normal')];
    minimizeBattle.playerMon.moves = minimizeBattle.moves;
    minimizeBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    minimizeBattle.wildMon.moves = minimizeBattle.wildMoves;

    stepBattle(minimizeBattle, confirmInput, createBattleEncounterState());

    expect(minimizeBattle.playerMon.volatile.minimized).toBe(true);
    expect(minimizeBattle.playerMon.statStages.evasion).toBe(1);

    const mementoBattle = createBattleState();
    mementoBattle.active = true;
    mementoBattle.phase = 'moveSelect';
    mementoBattle.playerMon.speed = 99;
    mementoBattle.moves = [makeStatusMove('MEMENTO', 'EFFECT_MEMENTO', 'dark')];
    mementoBattle.playerMon.moves = mementoBattle.moves;
    mementoBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    mementoBattle.wildMon.moves = mementoBattle.wildMoves;

    stepBattle(mementoBattle, confirmInput, createBattleEncounterState());

    expect(mementoBattle.playerMon.hp).toBe(0);
    expect(mementoBattle.wildMon.statStages.attack).toBe(-2);
    expect(mementoBattle.wildMon.statStages.spAttack).toBe(-2);
  });

  test('Taunt prevents pending status moves and ticks down at end of turn', () => {
    const battle = createBattleState();
    battle.active = true;
    battle.phase = 'moveSelect';
    battle.playerMon.speed = 1;
    battle.wildMon.speed = 99;
    battle.moves = [makeStatusMove('GROWL', 'EFFECT_ATTACK_DOWN', 'normal')];
    battle.playerMon.moves = battle.moves;
    battle.wildMoves = [makeStatusMove('TAUNT', 'EFFECT_TAUNT', 'dark')];
    battle.wildMon.moves = battle.wildMoves;

    stepBattle(battle, confirmInput, createBattleEncounterState());

    expect(battle.playerMon.volatile.tauntTurns).toBe(1);
    expect(battle.wildMon.statStages.attack).toBe(0);
    expect([battle.turnSummary, ...battle.queuedMessages]).toContain(`${battle.playerMon.species} can't use GROWL after the taunt!`);
  });

  test('Defense Curl boosts Rollout and Fury Cutter ramps after successful hits', () => {
    const firstFury = createBattleState();
    firstFury.active = true;
    firstFury.phase = 'moveSelect';
    firstFury.playerMon.speed = 99;
    firstFury.wildMon.maxHp = 200;
    firstFury.wildMon.hp = 200;
    firstFury.wildMon.types = ['normal'];
    firstFury.moves = [makeDamageMove('FURY_CUTTER', 'EFFECT_FURY_CUTTER', 'bug', 10)];
    firstFury.playerMon.moves = firstFury.moves;
    firstFury.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    firstFury.wildMon.moves = firstFury.wildMoves;
    const furyEncounter = createBattleEncounterState();

    stepBattle(firstFury, confirmInput, furyEncounter);
    const firstDamage = 200 - firstFury.wildMon.hp;
    flushScriptMessages(firstFury, furyEncounter);
    stepBattle(firstFury, confirmInput, furyEncounter);
    stepBattle(firstFury, confirmInput, furyEncounter);
    const secondDamage = 200 - firstFury.wildMon.hp - firstDamage;

    expect(secondDamage).toBeGreaterThan(firstDamage);

    const plainRollout = createBattleState();
    const curledRollout = createBattleState();
    for (const battle of [plainRollout, curledRollout]) {
      battle.active = true;
      battle.phase = 'moveSelect';
      battle.playerMon.speed = 99;
      battle.wildMon.maxHp = 200;
      battle.wildMon.hp = 200;
      battle.wildMon.types = ['normal'];
      battle.moves = [makeDamageMove('ROLLOUT', 'EFFECT_ROLLOUT', 'rock', 30)];
      battle.playerMon.moves = battle.moves;
      battle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
      battle.wildMon.moves = battle.wildMoves;
    }
    curledRollout.playerMon.volatile.defenseCurl = true;

    stepBattle(plainRollout, confirmInput, createBattleEncounterState());
    stepBattle(curledRollout, confirmInput, createBattleEncounterState());

    expect(curledRollout.wildMon.hp).toBeLessThan(plainRollout.wildMon.hp);
    expect(curledRollout.playerMon.volatile.rolloutCounter).toBe(1);
  });

  test('Recover restores half max HP and Rest fully heals while sleeping', () => {
    const recoverBattle = createBattleState();
    const restBattle = createBattleState();
    const encounter = createBattleEncounterState();
    recoverBattle.active = true;
    recoverBattle.phase = 'moveSelect';
    recoverBattle.playerMon.hp = 5;
    recoverBattle.playerMon.speed = 99;
    recoverBattle.moves = [makeStatusMove('RECOVER', 'EFFECT_RESTORE_HP', 'normal')];
    recoverBattle.playerMon.moves = recoverBattle.moves;

    stepBattle(recoverBattle, confirmInput, encounter);

    expect(recoverBattle.playerMon.hp).toBeGreaterThan(5);
    expect([recoverBattle.turnSummary, ...recoverBattle.queuedMessages].some((message) => message.includes('regained health'))).toBe(true);

    restBattle.active = true;
    restBattle.phase = 'moveSelect';
    restBattle.playerMon.hp = 5;
    restBattle.playerMon.status = 'poison';
    restBattle.playerMon.speed = 99;
    restBattle.moves = [makeStatusMove('REST', 'EFFECT_REST', 'psychic')];
    restBattle.playerMon.moves = restBattle.moves;
    restBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    restBattle.wildMon.moves = restBattle.wildMoves;

    stepBattle(restBattle, confirmInput, createBattleEncounterState());

    expect(restBattle.playerMon.hp).toBe(restBattle.playerMon.maxHp);
    expect(restBattle.playerMon.status).toBe('sleep');
  });

  test('Dream Eater fails unless the target is asleep', () => {
    const failedBattle = createBattleState();
    const successBattle = createBattleState();
    failedBattle.active = true;
    failedBattle.phase = 'moveSelect';
    failedBattle.playerMon.speed = 99;
    failedBattle.moves = [makeDamageMove('DREAM_EATER', 'EFFECT_DREAM_EATER', 'psychic', 100)];
    failedBattle.playerMon.moves = failedBattle.moves;

    stepBattle(failedBattle, confirmInput, createBattleEncounterState());

    expect(failedBattle.wildMon.hp).toBe(failedBattle.wildMon.maxHp);
    expect([failedBattle.turnSummary, ...failedBattle.queuedMessages]).toContain('But it failed!');

    successBattle.active = true;
    successBattle.phase = 'moveSelect';
    successBattle.playerMon.hp = 5;
    successBattle.playerMon.speed = 99;
    successBattle.wildMon.status = 'sleep';
    successBattle.moves = [makeDamageMove('DREAM_EATER', 'EFFECT_DREAM_EATER', 'psychic', 100)];
    successBattle.playerMon.moves = successBattle.moves;

    stepBattle(successBattle, confirmInput, createBattleEncounterState());

    expect(successBattle.wildMon.hp).toBeLessThan(successBattle.wildMon.maxHp);
    expect(successBattle.playerMon.hp).toBeGreaterThan(5);
  });

  test('primary status moves apply statuses like FireRed seteffectprimary scripts', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();
    battle.active = true;
    battle.phase = 'moveSelect';
    battle.moves = [makeStatusMove('SLEEP_POWDER', 'EFFECT_SLEEP', 'grass')];
    battle.playerMon.moves = battle.moves;
    battle.wildMon.status = 'none';

    stepBattle(battle, confirmInput, encounter);

    expect(battle.phase).toBe('script');
    expect(battle.turnSummary).toContain('used SLEEP POWDER');
    expect(battle.queuedMessages).toContain(`${battle.wildMon.species} fell asleep!`);
    expect(battle.wildMon.status).toBe('sleep');
  });

  test('poison status moves do not affect poison or steel types', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();
    battle.active = true;
    battle.phase = 'moveSelect';
    battle.moves = [makeStatusMove('POISON_POWDER', 'EFFECT_POISON', 'poison')];
    battle.playerMon.moves = battle.moves;
    battle.wildMon.status = 'none';
    battle.wildMon.types = ['poison'];

    stepBattle(battle, confirmInput, encounter);

    expect(battle.wildMon.status).toBe('none');
    expect([battle.turnSummary, ...battle.queuedMessages].some((message) => message.includes("doesn't affect"))).toBe(true);
  });

  test('Toxic applies bad poison with ramping residual damage', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();
    battle.active = true;
    battle.phase = 'moveSelect';
    battle.playerMon.speed = 99;
    battle.wildMon.maxHp = 160;
    battle.wildMon.hp = 160;
    battle.wildMon.types = ['normal'];
    battle.moves = [makeStatusMove('TOXIC', 'EFFECT_TOXIC', 'poison')];
    battle.playerMon.moves = battle.moves;
    battle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    battle.wildMon.moves = battle.wildMoves;

    stepBattle(battle, confirmInput, encounter);

    expect(battle.wildMon.status).toBe('badPoison');
    expect(battle.wildMon.volatile.toxicCounter).toBe(1);
    expect(battle.wildMon.hp).toBe(150);

    flushScriptMessages(battle, encounter);
    stepBattle(battle, confirmInput, encounter);
    stepBattle(battle, confirmInput, encounter);

    expect(battle.wildMon.volatile.toxicCounter).toBe(2);
    expect(battle.wildMon.hp).toBe(130);

    const immuneBattle = createBattleState();
    immuneBattle.active = true;
    immuneBattle.phase = 'moveSelect';
    immuneBattle.playerMon.speed = 99;
    immuneBattle.wildMon.types = ['steel'];
    immuneBattle.moves = [makeStatusMove('TOXIC', 'EFFECT_TOXIC', 'poison')];
    immuneBattle.playerMon.moves = immuneBattle.moves;

    stepBattle(immuneBattle, confirmInput, createBattleEncounterState());

    expect(immuneBattle.wildMon.status).toBe('none');
  });

  test('Thunder Wave respects Gen 3 type immunity through typecalc', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();
    battle.active = true;
    battle.phase = 'moveSelect';
    battle.moves = [makeStatusMove('THUNDER_WAVE', 'EFFECT_PARALYZE', 'electric')];
    battle.playerMon.moves = battle.moves;
    battle.wildMon.status = 'none';
    battle.wildMon.types = ['ground'];

    stepBattle(battle, confirmInput, encounter);

    expect(battle.wildMon.status).toBe('none');
    expect([battle.turnSummary, ...battle.queuedMessages].some((message) => message.includes("doesn't affect"))).toBe(true);
  });

  test('stat stage moves stop at FireRed stage caps', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();
    battle.active = true;
    battle.phase = 'moveSelect';
    battle.moves = [makeStatusMove('GROWL', 'EFFECT_ATTACK_DOWN', 'normal')];
    battle.playerMon.moves = battle.moves;
    battle.wildMon.statStages.attack = -6;

    stepBattle(battle, confirmInput, encounter);

    expect(battle.wildMon.statStages.attack).toBe(-6);
    expect([battle.turnSummary, ...battle.queuedMessages].some((message) => message.includes("won't go lower"))).toBe(true);
  });

  test('Will-O-Wisp does not burn Fire types', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();
    battle.active = true;
    battle.phase = 'moveSelect';
    battle.moves = [makeStatusMove('WILL_O_WISP', 'EFFECT_WILL_O_WISP', 'fire')];
    battle.playerMon.moves = battle.moves;
    battle.wildMon.status = 'none';
    battle.wildMon.types = ['fire'];

    stepBattle(battle, confirmInput, encounter);

    expect(battle.wildMon.status).toBe('none');
    expect([battle.turnSummary, ...battle.queuedMessages].some((message) => message.includes("doesn't affect"))).toBe(true);
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
    expect(battle.phase).toBe('script');
    expect(battle.turnSummary).toContain('appeared');
    expect(battle.queuedMessages[0]).toContain('Go!');
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
    battle.phase = 'script';
    battle.turnSummary = `Wild ${battle.wildMon.species} appeared!`;
    battle.queuedMessages = [`Go! ${battle.playerMon.species}!`];
    battle.resumePhase = 'command';
    battle.resumeSummary = `What will ${battle.playerMon.species} do?`;
    battle.wildMon.hp = 9;

    stepBattle(battle, confirmInput, encounter);
    expect(battle.turnSummary).toContain('Go!');

    stepBattle(battle, confirmInput, encounter);
    expect(battle.phase).toBe('command');

    stepBattle(battle, confirmInput, encounter);
    expect(battle.phase).toBe('moveSelect');

    const emberIndex = battle.moves.findIndex((move) => move.id === 'EMBER');
    battle.selectedMoveIndex = emberIndex;

    stepBattle(battle, confirmInput, encounter);
    expect(battle.phase).toBe('script');
    expect(battle.wildMon.hp).toBe(0);

    flushScriptMessages(battle, encounter);
    expect(battle.phase).toBe('resolved');

    stepBattle(battle, confirmInput, encounter);
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

    stepBattle(battle, confirmInput, encounter);
    expect(battle.phase).toBe('script');
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

    stepBattle(battle, confirmInput, encounter);
    expect(battle.phase).toBe('bagSelect');
    expect(battle.turnSummary).toContain('Choose an item');

    stepBattle(battle, confirmInput, encounter);
    expect(battle.phase).toBe('script');
    expect(battle.turnSummary).toContain('thrown');

    stepBattle(battle, confirmInput, encounter);
    expect(battle.turnSummary).toContain('caught');

    stepBattle(battle, confirmInput, encounter);
    expect(battle.phase).toBe('resolved');
  });

  test('failed ball throw also spends the player action before the foe moves', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();
    battle.active = true;
    battle.phase = 'bagSelect';
    battle.selectedBagIndex = 0;
    battle.bag.pokeBalls = 1;
    battle.bag.greatBalls = 0;
    battle.wildMon.catchRate = 1;
    battle.wildMon.hp = battle.wildMon.maxHp;
    const foeMove = { ...(battle.wildMoves.find((move) => move.id === 'TACKLE') ?? battle.wildMoves[0]!), accuracy: 0 };
    battle.wildMon.moves = [foeMove];
    battle.wildMoves = [foeMove];
    const playerHp = battle.playerMon.hp;

    stepBattle(battle, confirmInput, encounter);

    expect(battle.phase).toBe('script');
    expect(battle.playerMon.hp).toBeLessThan(playerHp);
    expect(battle.turnSummary).toContain('thrown');
    expect(battle.queuedMessages.some((message) => message.includes('broke free'))).toBe(true);
    expect(battle.queuedMessages.some((message) => message.includes('Foe') && message.includes('used'))).toBe(true);

    flushScriptMessages(battle, encounter);
    expect(battle.phase).toBe('command');
  });

  test('voluntary party switch consumes the player action before the foe moves', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();
    const incoming = battle.party[1]!;
    battle.active = true;
    battle.phase = 'partySelect';
    battle.selectedPartyIndex = 1;
    const foeMove = { ...(battle.wildMoves.find((move) => move.id === 'TACKLE') ?? battle.wildMoves[0]!), accuracy: 0 };
    battle.wildMon.moves = [foeMove];
    battle.wildMoves = [foeMove];
    const incomingHp = incoming.hp;

    stepBattle(battle, confirmInput, encounter);

    expect(battle.phase).toBe('script');
    expect(battle.playerMon).toBe(incoming);
    expect(incoming.hp).toBeLessThan(incomingHp);
    expect(battle.turnSummary).toContain('come back');
    expect(battle.queuedMessages).toContain(`Go! ${incoming.species}!`);
    expect(battle.queuedMessages.some((message) => message.includes('Foe') && message.includes('used'))).toBe(true);

    flushScriptMessages(battle, encounter);
    expect(battle.phase).toBe('command');
    expect(battle.turnSummary).toBe(`What will ${incoming.species} do?`);
  });

  test('forced party switch after fainting does not grant the foe an extra move', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();
    const incoming = battle.party[1]!;
    battle.active = true;
    battle.phase = 'partySelect';
    battle.selectedPartyIndex = 1;
    battle.playerMon.hp = 0;
    const foeMove = { ...(battle.wildMoves.find((move) => move.id === 'TACKLE') ?? battle.wildMoves[0]!), accuracy: 0 };
    battle.wildMon.moves = [foeMove];
    battle.wildMoves = [foeMove];
    const incomingHp = incoming.hp;

    stepBattle(battle, confirmInput, encounter);

    expect(battle.phase).toBe('script');
    expect(battle.playerMon).toBe(incoming);
    expect(incoming.hp).toBe(incomingHp);
    expect(battle.turnSummary).toBe(`Go! ${incoming.species}!`);
    expect(battle.queuedMessages.some((message) => message.includes('Foe') && message.includes('used'))).toBe(false);

    flushScriptMessages(battle, encounter);
    expect(battle.phase).toBe('command');
  });

  test('blocks selecting a move with no PP while another move is usable', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();
    battle.active = true;
    battle.phase = 'moveSelect';
    battle.selectedMoveIndex = 0;
    battle.moves[0]!.ppRemaining = 0;
    battle.moves[1]!.ppRemaining = Math.max(1, battle.moves[1]!.ppRemaining);

    stepBattle(battle, confirmInput, encounter);

    expect(battle.phase).toBe('moveSelect');
    expect(battle.turnSummary).toContain("There's no PP left");
    expect(battle.moves[0]!.ppRemaining).toBe(0);
  });

  test('uses Struggle when the player has no move PP left', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();
    battle.active = true;
    battle.phase = 'moveSelect';
    battle.playerMon.speed = 99;
    battle.moves.forEach((move) => {
      move.ppRemaining = 0;
    });
    const playerHp = battle.playerMon.hp;

    stepBattle(battle, confirmInput, encounter);

    expect(battle.phase).toBe('script');
    expect(battle.turnSummary).toContain('used STRUGGLE');
    expect(battle.moves.every((move) => move.ppRemaining === 0)).toBe(true);
    expect(battle.playerMon.hp).toBeLessThan(playerHp);
  });

  test('wild battler uses Struggle when it has no move PP left', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();
    battle.active = true;
    battle.phase = 'moveSelect';
    battle.playerMon.speed = 1;
    battle.wildMon.speed = 99;
    battle.wildMoves.forEach((move) => {
      move.ppRemaining = 0;
    });
    const wildHp = battle.wildMon.hp;

    stepBattle(battle, confirmInput, encounter);

    expect(battle.phase).toBe('script');
    expect(battle.turnSummary).toContain('Foe');
    expect(battle.turnSummary).toContain('used STRUGGLE');
    expect(battle.wildMoves.every((move) => move.ppRemaining === 0)).toBe(true);
    expect(battle.wildMon.hp).toBeLessThan(wildHp);
  });

  test('battle state seeds active and wild moves from decomp learnsets', () => {
    const battle = createBattleState();
    expect(battle.moves.some((move) => move.id === 'EMBER')).toBe(true);
    expect(battle.wildMoves.some((move) => move.id === 'TACKLE')).toBe(true);
  });

  test('player snapshots preserve exp progress for the battle HUD', () => {
    const battle = createBattleState();
    expect(battle.playerMon.expProgress).toBeCloseTo(0.62);
    expect(battle.party[1]?.expProgress).toBeCloseTo(0.34);
    expect(battle.wildMon.expProgress).toBe(0);
  });
});
