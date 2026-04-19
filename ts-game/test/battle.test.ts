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
