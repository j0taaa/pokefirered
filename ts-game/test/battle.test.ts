import { describe, expect, test } from 'vitest';
import {
  calculateBaseDamage,
  calculateCaptureOdds,
  calculateDamagePreview,
  calculateTypeEffectiveness,
  applyBattleRewards,
  createBattleEncounterState,
  createBattlePokemonFromSpecies,
  createBattleState,
  dismissResolvedBattle,
  getBallCatchMultiplierTenths,
  getBallEscapeMessage,
  getBattleBagChoices,
  performCaptureAttempt,
  setBattlerPartyIndex,
  shouldStartWildEncounter,
  startConfiguredBattle,
  startTrainerBattle,
  stepBattle,
  tryStartWildBattle
} from '../src/game/battle';
import type { BattleMove, PokemonType } from '../src/game/battle';
import { createBagState, getBagQuantity } from '../src/game/bag';
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
  secondaryEffectChance: 0,
  flags: []
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
  secondaryEffectChance,
  flags: []
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

  const routeLikeWaterEncounters: WildEncounterGroup = {
    encounterRate: 21,
    mons: [
      { minLevel: 5, maxLevel: 5, species: 'SPECIES_TENTACOOL', slotRate: 60 },
      { minLevel: 6, maxLevel: 6, species: 'SPECIES_HORSEA', slotRate: 30 },
      { minLevel: 7, maxLevel: 7, species: 'SPECIES_STARYU', slotRate: 10 }
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

  test('createBattleState builds trainer runtime state with side and battler bookkeeping', () => {
    const battle = createBattleState({
      mode: 'trainer',
      playerName: 'RED',
      opponentName: 'BROCK',
      trainerId: 'TRAINER_BROCK',
      activePlayerPartyIndex: 1,
      opponentParty: [{
        species: 'GEODUDE',
        level: 12,
        expProgress: 0.15,
        maxHp: 30,
        hp: 30,
        attack: 18,
        defense: 22,
        speed: 9,
        spAttack: 10,
        spDefense: 12,
        catchRate: 255,
        types: ['rock', 'ground'],
        status: 'none'
      }]
    });

    expect(battle.mode).toBe('trainer');
    expect(battle.battleTypeFlags).toContain('trainer');
    expect(battle.playerSide.name).toBe('RED');
    expect(battle.opponentSide.name).toBe('BROCK');
    expect(battle.opponentSide.trainerId).toBe('TRAINER_BROCK');
    expect(battle.playerMon.species).toBe('PIDGEY');
    expect(battle.wildMon.species).toBe('GEODUDE');
    expect(battle.battlers[0]).toMatchObject({ side: 'player', partyIndex: 1, active: true, absent: false });
    expect(battle.battlers[1]).toMatchObject({ side: 'opponent', partyIndex: 0, active: true, absent: false });
    expect(battle.battleTrace[0]).toMatchObject({ type: 'init', mode: 'trainer' });
  });

  test('compatibility views derive active mons and moves from battler indexes', () => {
    const battle = createBattleState({
      playerParty: [
        createBattlePokemonFromSpecies('RATTATA', 5),
        createBattlePokemonFromSpecies('PIDGEY', 6)
      ],
      opponentParty: [
        createBattlePokemonFromSpecies('CATERPIE', 4),
        createBattlePokemonFromSpecies('WEEDLE', 4)
      ]
    });

    expect(battle.playerMon.species).toBe('RATTATA');
    expect(battle.wildMon.species).toBe('CATERPIE');
    expect(battle.moves).toBe(battle.playerMon.moves);
    expect(battle.wildMoves).toBe(battle.wildMon.moves);

    setBattlerPartyIndex(battle, 0, 1);
    setBattlerPartyIndex(battle, 1, 1);

    expect(battle.playerSide.activePartyIndexes).toEqual([1]);
    expect(battle.opponentSide.activePartyIndexes).toEqual([1]);
    expect(battle.playerMon.species).toBe('PIDGEY');
    expect(battle.wildMon.species).toBe('WEEDLE');
    expect(battle.moves).toBe(battle.playerMon.moves);
    expect(battle.wildMoves).toBe(battle.wildMon.moves);
  });

  test('startConfiguredBattle reconfigures runtime state and records battle trace events', () => {
    const battle = createBattleState();

    startConfiguredBattle(battle, {
      mode: 'trainer',
      opponentName: 'BROCK',
      trainerId: 'TRAINER_BROCK',
      opponentParty: [{
        species: 'ONIX',
        level: 14,
        expProgress: 0.25,
        maxHp: 35,
        hp: 35,
        attack: 18,
        defense: 28,
        speed: 12,
        spAttack: 9,
        spDefense: 14,
        catchRate: 45,
        types: ['rock', 'ground'],
        status: 'none'
      }]
    });

    expect(battle.active).toBe(true);
    expect(battle.phase).toBe('intro');
    expect(battle.mode).toBe('trainer');
    expect(battle.currentScriptLabel).toBe('BattleScript_TrainerEncounter');
    expect(battle.wildMon.species).toBe('ONIX');
    expect(battle.battleTrace.at(-1)).toMatchObject({ type: 'phase', text: 'intro', mode: 'trainer' });

    battle.phase = 'moveSelect';
    battle.playerMon.speed = 99;
    battle.wildMon.speed = 1;
    battle.moves = [makeDamageMove('TACKLE', 'EFFECT_HIT', 'normal', 40)];
    battle.playerMon.moves = battle.moves;
    battle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
    battle.wildMon.moves = battle.wildMoves;

    stepBattle(battle, confirmInput, createBattleEncounterState());

    expect(battle.battleTrace.some((event) => event.type === 'script' && event.label === 'BattleScript_EFFECT_HIT')).toBe(true);
    expect(battle.battleTrace.some((event) => event.type === 'message' && event.text?.includes('used'))).toBe(true);
    expect(battle.battleTrace.some((event) => event.type === 'hp' && event.battler === 'opponent')).toBe(true);
    expect(battle.battleTrace.some((event) => event.type === 'phase' && event.text === 'script')).toBe(true);
    expect([null, 'BattleScript_MoveEnd']).toContain(battle.vm.currentLabel);
    expect(battle.vm.pendingCommands.some((command) => command.type === 'script')).toBe(true);
    expect(battle.vm.pendingMessages.some((message) => message.includes('used'))).toBe(true);
  });

  test('battle state supports config-driven format, control mode, partner party, and active battler scaffolding', () => {
    const battle = createBattleState({
      format: 'doubles',
      controlMode: 'partner',
      playerParty: [
        {
          species: 'BULBASAUR',
          level: 12,
          expProgress: 0.1,
          maxHp: 31,
          hp: 31,
          attack: 15,
          defense: 15,
          speed: 14,
          spAttack: 18,
          spDefense: 17,
          catchRate: 45,
          types: ['grass', 'poison'],
          status: 'none'
        },
        {
          species: 'PIDGEY',
          level: 11,
          expProgress: 0.2,
          maxHp: 28,
          hp: 28,
          attack: 16,
          defense: 13,
          speed: 19,
          spAttack: 12,
          spDefense: 12,
          catchRate: 255,
          types: ['normal', 'flying'],
          status: 'none'
        }
      ],
      partnerParty: [
        {
          species: 'PIKACHU',
          level: 10,
          expProgress: 0.3,
          maxHp: 26,
          hp: 26,
          attack: 14,
          defense: 11,
          speed: 21,
          spAttack: 15,
          spDefense: 14,
          catchRate: 190,
          types: ['electric'],
          status: 'none'
        }
      ],
      opponentParty: [
        {
          species: 'RATTATA',
          level: 10,
          expProgress: 0,
          maxHp: 24,
          hp: 24,
          attack: 14,
          defense: 10,
          speed: 20,
          spAttack: 9,
          spDefense: 10,
          catchRate: 255,
          types: ['normal'],
          status: 'none'
        },
        {
          species: 'SPEAROW',
          level: 10,
          expProgress: 0,
          maxHp: 25,
          hp: 25,
          attack: 15,
          defense: 10,
          speed: 20,
          spAttack: 10,
          spDefense: 10,
          catchRate: 255,
          types: ['normal', 'flying'],
          status: 'none'
        }
      ],
      activeBattlers: [
        { battlerId: 0, side: 'player', partyIndex: 0, active: true, absent: false },
        { battlerId: 1, side: 'opponent', partyIndex: 0, active: true, absent: false },
        { battlerId: 2, side: 'player', partyIndex: 1, active: true, absent: false },
        { battlerId: 3, side: 'opponent', partyIndex: 1, active: true, absent: false }
      ]
    });

    expect(battle.format).toBe('doubles');
    expect(battle.controlMode).toBe('partner');
    expect(battle.partnerParty.map((pokemon) => pokemon.species)).toEqual(['PIKACHU']);
    expect(battle.playerSide.party.map((pokemon) => pokemon.species)).toEqual(['BULBASAUR', 'PIDGEY', 'PIKACHU']);
    expect(battle.playerSide.activePartyIndexes).toEqual([0, 2]);
    expect(battle.opponentSide.activePartyIndexes).toEqual([0, 1]);
    expect(battle.battlers).toEqual([
      expect.objectContaining({ battlerId: 0, side: 'player', partyIndex: 0, active: true, absent: false }),
      expect.objectContaining({ battlerId: 1, side: 'opponent', partyIndex: 0, active: true, absent: false }),
      expect.objectContaining({ battlerId: 2, side: 'player', partyIndex: 2, active: true, absent: false }),
      expect.objectContaining({ battlerId: 3, side: 'opponent', partyIndex: 1, active: true, absent: false })
    ]);
  });

  test('doubles partner battles execute all four battlers in turn order', () => {
    const battle = createBattleState({
      format: 'doubles',
      controlMode: 'partner',
      playerParty: [
        { species: 'BULBASAUR', level: 16, expProgress: 0, maxHp: 40, hp: 40, attack: 18, defense: 18, speed: 25, spAttack: 22, spDefense: 22, catchRate: 45, types: ['grass', 'poison'], status: 'none' }
      ],
      partnerParty: [
        { species: 'PIKACHU', level: 16, expProgress: 0, maxHp: 36, hp: 36, attack: 20, defense: 14, speed: 40, spAttack: 24, spDefense: 18, catchRate: 190, types: ['electric'], status: 'none' }
      ],
      opponentParty: [
        { species: 'RATTATA', level: 16, expProgress: 0, maxHp: 35, hp: 35, attack: 18, defense: 15, speed: 10, spAttack: 12, spDefense: 12, catchRate: 255, types: ['normal'], status: 'none' },
        { species: 'SPEAROW', level: 16, expProgress: 0, maxHp: 36, hp: 36, attack: 20, defense: 15, speed: 10, spAttack: 12, spDefense: 12, catchRate: 255, types: ['normal', 'flying'], status: 'none' }
      ]
    });
    battle.active = true;
    battle.phase = 'moveSelect';
    const splash = makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal');
    const quickAttack = { ...makeDamageMove('QUICK_ATTACK', 'EFFECT_HIT', 'normal', 40), priority: 1 };
    battle.moves = [splash];
    battle.playerMon.moves = battle.moves;
    battle.playerSide.party[1]!.moves = [quickAttack];
    battle.opponentSide.party[0]!.moves = [splash];
    battle.opponentSide.party[1]!.moves = [splash];

    stepBattle(battle, confirmInput, createBattleEncounterState());

    const messages = [battle.turnSummary, ...battle.queuedMessages];
    expect(messages.indexOf('PIKACHU used QUICK ATTACK!')).toBeGreaterThanOrEqual(0);
    expect(messages.indexOf('BULBASAUR used SPLASH!')).toBeGreaterThanOrEqual(0);
    expect(messages.indexOf('PIKACHU used QUICK ATTACK!')).toBeLessThan(messages.indexOf('BULBASAUR used SPLASH!'));
    expect(battle.opponentSide.party[0]!.hp).toBeLessThan(battle.opponentSide.party[0]!.maxHp);
  });

  test('doubles link battles use the same execution path and refill fainted slots', () => {
    const battle = createBattleState({
      format: 'doubles',
      controlMode: 'link',
      playerParty: [
        { species: 'BULBASAUR', level: 18, expProgress: 0, maxHp: 42, hp: 42, attack: 20, defense: 20, speed: 24, spAttack: 24, spDefense: 24, catchRate: 45, types: ['grass', 'poison'], status: 'none' },
        { species: 'CHARMANDER', level: 18, expProgress: 0, maxHp: 39, hp: 39, attack: 22, defense: 18, speed: 28, spAttack: 24, spDefense: 20, catchRate: 45, types: ['fire'], status: 'none' }
      ],
      opponentParty: [
        { species: 'RATTATA', level: 14, expProgress: 0, maxHp: 30, hp: 30, attack: 16, defense: 12, speed: 12, spAttack: 10, spDefense: 10, catchRate: 255, types: ['normal'], status: 'none' },
        { species: 'SPEAROW', level: 14, expProgress: 0, maxHp: 31, hp: 31, attack: 16, defense: 12, speed: 12, spAttack: 10, spDefense: 10, catchRate: 255, types: ['normal', 'flying'], status: 'none' },
        { species: 'EKANS', level: 14, expProgress: 0, maxHp: 32, hp: 32, attack: 17, defense: 13, speed: 12, spAttack: 10, spDefense: 10, catchRate: 255, types: ['poison'], status: 'none' }
      ]
    });
    battle.active = true;
    battle.phase = 'moveSelect';
    battle.playerMon.speed = 40;
    battle.playerSide.party[1]!.speed = 20;
    battle.opponentSide.party[0]!.speed = 1;
    battle.opponentSide.party[1]!.speed = 1;
    battle.moves = [makeDamageMove('MEGA_PUNCH', 'EFFECT_HIT', 'normal', 200)];
    battle.playerMon.moves = battle.moves;
    battle.playerSide.party[1]!.moves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
    battle.opponentSide.party[0]!.moves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
    battle.opponentSide.party[1]!.moves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];

    stepBattle(battle, confirmInput, createBattleEncounterState());

    const messages = [battle.turnSummary, ...battle.queuedMessages];
    expect(messages.some((message) => message.includes('sent out EKANS!'))).toBe(true);
    expect(battle.battlers.find((entry) => entry.battlerId === 1)?.partyIndex).toBe(2);
  });

  test('doubles trainer battles can switch an endangered opponent battler', () => {
    const battle = createBattleState({
      mode: 'trainer',
      format: 'doubles',
      playerParty: [
        { species: 'BULBASAUR', level: 18, expProgress: 0, maxHp: 42, hp: 42, attack: 20, defense: 20, speed: 24, spAttack: 24, spDefense: 24, catchRate: 45, types: ['grass', 'poison'], status: 'none' },
        { species: 'CHARMANDER', level: 18, expProgress: 0, maxHp: 39, hp: 39, attack: 22, defense: 18, speed: 28, spAttack: 24, spDefense: 20, catchRate: 45, types: ['fire'], status: 'none' }
      ],
      opponentName: 'BROCK',
      opponentParty: [
        { species: 'GEODUDE', level: 14, expProgress: 0, maxHp: 30, hp: 30, attack: 16, defense: 18, speed: 12, spAttack: 10, spDefense: 10, catchRate: 255, types: ['rock', 'ground'], status: 'none' },
        { species: 'SPEAROW', level: 14, expProgress: 0, maxHp: 31, hp: 31, attack: 16, defense: 12, speed: 12, spAttack: 10, spDefense: 10, catchRate: 255, types: ['normal', 'flying'], status: 'none' },
        { species: 'ONIX', level: 14, expProgress: 0, maxHp: 35, hp: 35, attack: 18, defense: 24, speed: 10, spAttack: 10, spDefense: 12, catchRate: 45, types: ['rock', 'ground'], status: 'none' }
      ]
    });
    battle.active = true;
    battle.phase = 'moveSelect';
    battle.battleTypeFlags = ['trainer'];
    battle.opponentSide.party[0]!.volatile.perishTurns = 1;
    const splash = makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal');
    battle.moves = [splash];
    battle.playerMon.moves = battle.moves;
    battle.playerSide.party[1]!.moves = [splash];
    battle.opponentSide.party[0]!.moves = [splash];
    battle.opponentSide.party[1]!.moves = [splash];
    battle.opponentSide.party[2]!.moves = [splash];

    stepBattle(battle, confirmInput, createBattleEncounterState());

    expect(battle.battlers.find((entry) => entry.battlerId === 1)?.partyIndex).toBe(2);
    expect([battle.turnSummary, ...battle.queuedMessages].some((message) => message.includes('withdrew GEODUDE'))).toBe(true);
  });

  test('doubles weather end-of-turn effects apply to all active battlers', () => {
    const battle = createBattleState({
      format: 'doubles',
      playerParty: [
        { species: 'BULBASAUR', level: 16, expProgress: 0, maxHp: 40, hp: 40, attack: 18, defense: 18, speed: 20, spAttack: 22, spDefense: 22, catchRate: 45, types: ['grass', 'poison'], status: 'none' },
        { species: 'CHARMANDER', level: 16, expProgress: 0, maxHp: 38, hp: 38, attack: 20, defense: 16, speed: 22, spAttack: 22, spDefense: 18, catchRate: 45, types: ['fire'], status: 'none' }
      ],
      opponentParty: [
        { species: 'RATTATA', level: 16, expProgress: 0, maxHp: 35, hp: 35, attack: 18, defense: 15, speed: 18, spAttack: 12, spDefense: 12, catchRate: 255, types: ['normal'], status: 'none' },
        { species: 'EKANS', level: 16, expProgress: 0, maxHp: 37, hp: 37, attack: 18, defense: 16, speed: 18, spAttack: 12, spDefense: 12, catchRate: 255, types: ['poison'], status: 'none' }
      ]
    });
    battle.active = true;
    battle.phase = 'moveSelect';
    battle.weather = 'sandstorm';
    battle.weatherTurns = 2;
    const splash = makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal');
    battle.moves = [splash];
    battle.playerMon.moves = battle.moves;
    battle.playerSide.party[1]!.moves = [splash];
    battle.opponentSide.party[0]!.moves = [splash];
    battle.opponentSide.party[1]!.moves = [splash];

    stepBattle(battle, confirmInput, createBattleEncounterState());

    expect(battle.playerSide.party[0]!.hp).toBeLessThan(40);
    expect(battle.playerSide.party[1]!.hp).toBeLessThan(38);
    expect(battle.opponentSide.party[0]!.hp).toBeLessThan(35);
    expect(battle.opponentSide.party[1]!.hp).toBeLessThan(37);
  });

  test('startTrainerBattle queues trainer intro flow and blocks capture attempts', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();

    startTrainerBattle(battle, {
      opponentName: 'BROCK',
      trainerId: 'TRAINER_BROCK',
      opponentParty: [{
        species: 'GEODUDE',
        level: 12,
        expProgress: 0.15,
        maxHp: 30,
        hp: 30,
        attack: 18,
        defense: 22,
        speed: 9,
        spAttack: 10,
        spDefense: 12,
        catchRate: 255,
        types: ['rock', 'ground'],
        status: 'none'
      }]
    });

    expect(battle.mode).toBe('trainer');
    expect(battle.phase).toBe('script');
    expect(battle.turnSummary).toContain('BROCK wants to battle!');
    expect(battle.queuedMessages).toContain('BROCK sent out GEODUDE!');
    expect(battle.queuedMessages).toContain(`Go! ${battle.playerMon.species}!`);
    expect(performCaptureAttempt(battle, encounter).blockedReason).toBe('trainer');

    flushScriptMessages(battle, encounter);

    expect(battle.phase).toBe('command');
    expect(battle.turnSummary).toBe(`What will ${battle.playerMon.species} do?`);
  });

  test('trainer battles send out the next opponent party member after a faint', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();

    startTrainerBattle(battle, {
      opponentName: 'BROCK',
      trainerId: 'TRAINER_BROCK',
      battleStyle: 'set',
      opponentParty: [
        {
          species: 'GEODUDE',
          level: 12,
          expProgress: 0.15,
          maxHp: 30,
          hp: 1,
          attack: 18,
          defense: 22,
          speed: 9,
          spAttack: 10,
          spDefense: 12,
          catchRate: 255,
          types: ['rock', 'ground'],
          status: 'none'
        },
        {
          species: 'ONIX',
          level: 14,
          expProgress: 0.25,
          maxHp: 35,
          hp: 35,
          attack: 18,
          defense: 28,
          speed: 12,
          spAttack: 9,
          spDefense: 14,
          catchRate: 45,
          types: ['rock', 'ground'],
          status: 'none'
        }
      ]
    });
    flushScriptMessages(battle, encounter);

    battle.phase = 'moveSelect';
    battle.playerMon.speed = 99;
    battle.wildMon.speed = 1;
    battle.moves = [makeDamageMove('TACKLE', 'EFFECT_HIT', 'normal', 40)];
    battle.playerMon.moves = battle.moves;
    battle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
    battle.wildMon.moves = battle.wildMoves;

    stepBattle(battle, confirmInput, encounter);

    expect(battle.phase).toBe('script');
    expect([battle.turnSummary, ...battle.queuedMessages]).toContain('Foe GEODUDE fainted!');
    expect([battle.turnSummary, ...battle.queuedMessages].some((message) => message.includes('gained') && message.includes('EXP. Points!'))).toBe(true);
    expect(battle.queuedMessages).toContain('BROCK sent out ONIX!');

    flushScriptMessages(battle, encounter);

    expect(battle.wildMon.species).toBe('ONIX');
    expect(battle.opponentSide.activePartyIndexes).toEqual([1]);
    expect(battle.phase).toBe('command');
    expect(battle.turnSummary).toBe(`What will ${battle.playerMon.species} do?`);
  });

  test('shift-style trainer battles offer a switch prompt before the next opponent is sent out', () => {
    const battle = createBattleState({ battleStyle: 'shift' });
    const encounter = createBattleEncounterState();

    startTrainerBattle(battle, {
      battleStyle: 'shift',
      opponentName: 'BROCK',
      trainerId: 'TRAINER_BROCK',
      opponentParty: [
        {
          species: 'GEODUDE',
          level: 12,
          expProgress: 0.15,
          maxHp: 30,
          hp: 1,
          attack: 18,
          defense: 22,
          speed: 9,
          spAttack: 10,
          spDefense: 12,
          catchRate: 255,
          types: ['rock', 'ground'],
          status: 'none'
        },
        {
          species: 'ONIX',
          level: 14,
          expProgress: 0.25,
          maxHp: 35,
          hp: 35,
          attack: 18,
          defense: 28,
          speed: 12,
          spAttack: 9,
          spDefense: 14,
          catchRate: 45,
          types: ['rock', 'ground'],
          status: 'none'
        }
      ]
    });
    flushScriptMessages(battle, encounter);

    battle.phase = 'moveSelect';
    battle.playerMon.speed = 99;
    battle.wildMon.speed = 1;
    battle.moves = [makeDamageMove('TACKLE', 'EFFECT_HIT', 'normal', 40)];
    battle.playerMon.moves = battle.moves;
    battle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
    battle.wildMon.moves = battle.wildMoves;

    stepBattle(battle, confirmInput, encounter);
    flushScriptMessages(battle, encounter);

    expect(battle.phase).toBe('shiftPrompt');
    expect(battle.pendingOpponentPartyIndex).toBe(1);
    expect(battle.turnSummary).toBe(`Will ${battle.playerSide.name} change POKeMON?`);

    battle.selectedShiftPromptIndex = 1;
    stepBattle(battle, confirmInput, encounter);

    expect(battle.phase).toBe('script');
    expect(battle.wildMon.species).toBe('ONIX');
    expect(battle.pendingOpponentPartyIndex).toBeNull();
    expect(battle.turnSummary).toBe('BROCK sent out ONIX!');

    flushScriptMessages(battle, encounter);

    expect(battle.phase).toBe('command');
    expect(battle.turnSummary).toBe(`What will ${battle.playerMon.species} do?`);
  });

  test('shift-style trainer battles let the player switch before the next opponent is sent out', () => {
    const battle = createBattleState({ battleStyle: 'shift' });
    const encounter = createBattleEncounterState();
    const incoming = battle.party[1]!;
    const incomingHp = incoming.hp;

    startTrainerBattle(battle, {
      battleStyle: 'shift',
      opponentName: 'BROCK',
      trainerId: 'TRAINER_BROCK',
      opponentParty: [
        {
          species: 'GEODUDE',
          level: 12,
          expProgress: 0.15,
          maxHp: 30,
          hp: 1,
          attack: 18,
          defense: 22,
          speed: 9,
          spAttack: 10,
          spDefense: 12,
          catchRate: 255,
          types: ['rock', 'ground'],
          status: 'none'
        },
        {
          species: 'ONIX',
          level: 14,
          expProgress: 0.25,
          maxHp: 35,
          hp: 35,
          attack: 18,
          defense: 28,
          speed: 12,
          spAttack: 9,
          spDefense: 14,
          catchRate: 45,
          types: ['rock', 'ground'],
          status: 'none'
        }
      ]
    });
    flushScriptMessages(battle, encounter);

    battle.phase = 'moveSelect';
    battle.playerMon.speed = 99;
    battle.wildMon.speed = 1;
    battle.moves = [makeDamageMove('TACKLE', 'EFFECT_HIT', 'normal', 40)];
    battle.playerMon.moves = battle.moves;
    battle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
    battle.wildMon.moves = battle.wildMoves;

    stepBattle(battle, confirmInput, encounter);
    flushScriptMessages(battle, encounter);

    expect(battle.phase).toBe('shiftPrompt');

    stepBattle(battle, confirmInput, encounter);

    expect(battle.phase).toBe('partySelect');

    battle.selectedPartyIndex = 1;
    stepBattle(battle, confirmInput, encounter);

    expect(battle.phase).toBe('script');
    expect(battle.playerMon.species).toBe(incoming.species);
    expect(battle.playerMon.hp).toBe(incomingHp);
    expect(battle.playerSide.activePartyIndexes).toEqual([1]);
    expect(battle.wildMon.species).toBe('ONIX');
    expect(battle.pendingOpponentPartyIndex).toBeNull();
    expect(battle.queuedMessages).toContain(`Go! ${incoming.species}!`);
    expect(battle.queuedMessages).toContain('BROCK sent out ONIX!');
    expect(battle.queuedMessages.some((message) => message.includes('Foe') && message.includes('used'))).toBe(false);

    flushScriptMessages(battle, encounter);

    expect(battle.phase).toBe('command');
    expect(battle.turnSummary).toBe(`What will ${incoming.species} do?`);
  });

  test('backing out of the shift party menu returns to the yes-no prompt', () => {
    const battle = createBattleState({ battleStyle: 'shift' });
    const encounter = createBattleEncounterState();

    startTrainerBattle(battle, {
      battleStyle: 'shift',
      opponentName: 'BROCK',
      trainerId: 'TRAINER_BROCK',
      opponentParty: [
        {
          species: 'GEODUDE',
          level: 12,
          expProgress: 0.15,
          maxHp: 30,
          hp: 1,
          attack: 18,
          defense: 22,
          speed: 9,
          spAttack: 10,
          spDefense: 12,
          catchRate: 255,
          types: ['rock', 'ground'],
          status: 'none'
        },
        {
          species: 'ONIX',
          level: 14,
          expProgress: 0.25,
          maxHp: 35,
          hp: 35,
          attack: 18,
          defense: 28,
          speed: 12,
          spAttack: 9,
          spDefense: 14,
          catchRate: 45,
          types: ['rock', 'ground'],
          status: 'none'
        }
      ]
    });
    flushScriptMessages(battle, encounter);

    battle.phase = 'moveSelect';
    battle.playerMon.speed = 99;
    battle.wildMon.speed = 1;
    battle.moves = [makeDamageMove('TACKLE', 'EFFECT_HIT', 'normal', 40)];
    battle.playerMon.moves = battle.moves;
    battle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
    battle.wildMon.moves = battle.wildMoves;

    stepBattle(battle, confirmInput, encounter);
    flushScriptMessages(battle, encounter);
    stepBattle(battle, confirmInput, encounter);

    expect(battle.phase).toBe('partySelect');

    stepBattle(battle, { ...neutralInput, cancel: true, cancelPressed: true }, encounter);

    expect(battle.phase).toBe('shiftPrompt');
    expect(battle.turnSummary).toBe(`Will ${battle.playerSide.name} change POKeMON?`);
  });

  test('set-style trainer battles immediately send out the next opponent after a faint', () => {
    const battle = createBattleState({ battleStyle: 'set' });
    const encounter = createBattleEncounterState();

    startTrainerBattle(battle, {
      battleStyle: 'set',
      opponentName: 'BROCK',
      trainerId: 'TRAINER_BROCK',
      opponentParty: [
        {
          species: 'GEODUDE',
          level: 12,
          expProgress: 0.15,
          maxHp: 30,
          hp: 1,
          attack: 18,
          defense: 22,
          speed: 9,
          spAttack: 10,
          spDefense: 12,
          catchRate: 255,
          types: ['rock', 'ground'],
          status: 'none'
        },
        {
          species: 'ONIX',
          level: 14,
          expProgress: 0.25,
          maxHp: 35,
          hp: 35,
          attack: 18,
          defense: 28,
          speed: 12,
          spAttack: 9,
          spDefense: 14,
          catchRate: 45,
          types: ['rock', 'ground'],
          status: 'none'
        }
      ]
    });
    flushScriptMessages(battle, encounter);

    battle.phase = 'moveSelect';
    battle.playerMon.speed = 99;
    battle.wildMon.speed = 1;
    battle.moves = [makeDamageMove('TACKLE', 'EFFECT_HIT', 'normal', 40)];
    battle.playerMon.moves = battle.moves;
    battle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
    battle.wildMon.moves = battle.wildMoves;

    stepBattle(battle, confirmInput, encounter);

    expect(battle.phase).toBe('script');
    expect(battle.queuedMessages).toContain('BROCK sent out ONIX!');

    flushScriptMessages(battle, encounter);

    expect(battle.phase).toBe('command');
    expect(battle.wildMon.species).toBe('ONIX');
    expect(battle.pendingOpponentPartyIndex).toBeNull();
  });

  test('trainer opponents can spend their action on healing items instead of attacking', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();

    startTrainerBattle(battle, {
      opponentName: 'MISTY',
      trainerId: 'TRAINER_MISTY',
      opponentTrainerItems: ['ITEM_SUPER_POTION'],
      opponentParty: [{
        species: 'STARMIE',
        level: 21,
        expProgress: 0.3,
        maxHp: 60,
        hp: 9,
        attack: 22,
        defense: 20,
        speed: 30,
        spAttack: 28,
        spDefense: 24,
        catchRate: 60,
        types: ['water', 'psychic'],
        status: 'none'
      }]
    });
    flushScriptMessages(battle, encounter);

    battle.phase = 'moveSelect';
    battle.playerMon.speed = 1;
    battle.wildMon.speed = 99;
    battle.moves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
    battle.playerMon.moves = battle.moves;
    battle.wildMoves = [makeDamageMove('TACKLE', 'EFFECT_HIT', 'normal', 40)];
    battle.wildMon.moves = battle.wildMoves;

    stepBattle(battle, confirmInput, encounter);

    expect(battle.phase).toBe('script');
    expect(battle.wildMon.hp).toBe(59);
    expect(battle.opponentTrainerItems).toEqual([]);
    expect(battle.turnSummary).toBe('MISTY used SUPER POTION!');
    expect(battle.queuedMessages.some((message) => message.includes('Foe') && message.includes('used'))).toBe(false);

    flushScriptMessages(battle, encounter);
    battle.phase = 'moveSelect';

    stepBattle(battle, confirmInput, encounter);

    expect(battle.turnSummary).toContain('Foe STARMIE used TACKLE!');
  });

  test('trainer opponents can cure status with Full Heal instead of attacking', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();

    startTrainerBattle(battle, {
      opponentName: 'LT. SURGE',
      trainerId: 'TRAINER_LT_SURGE',
      opponentTrainerItems: ['ITEM_FULL_HEAL'],
      opponentParty: [{
        species: 'RAICHU',
        level: 24,
        expProgress: 0.4,
        maxHp: 70,
        hp: 70,
        attack: 24,
        defense: 20,
        speed: 35,
        spAttack: 30,
        spDefense: 24,
        catchRate: 75,
        types: ['electric'],
        status: 'none'
      }]
    });
    flushScriptMessages(battle, encounter);
    battle.wildMon.status = 'paralysis';

    battle.phase = 'moveSelect';
    battle.playerMon.speed = 1;
    battle.wildMon.speed = 99;
    battle.moves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
    battle.playerMon.moves = battle.moves;
    battle.wildMoves = [makeDamageMove('THUNDERSHOCK', 'EFFECT_HIT', 'electric', 40)];
    battle.wildMon.moves = battle.wildMoves;

    stepBattle(battle, confirmInput, encounter);

    expect(battle.phase).toBe('script');
    expect(battle.wildMon.status).toBe('none');
    expect(battle.opponentTrainerItems).toEqual([]);
    expect(battle.turnSummary).toBe('LT. SURGE used FULL HEAL!');
    expect(battle.queuedMessages).toContain("RAICHU's status returned to normal!");
    expect(battle.queuedMessages.some((message) => message.includes('Foe') && message.includes('used'))).toBe(false);
  });

  test('trainer AI prefers stronger effective moves over random wild-like choices', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState(0x1234);

    startTrainerBattle(battle, {
      opponentName: 'MISTY',
      trainerId: 'TRAINER_MISTY',
      opponentTrainerAiFlags: ['AI_SCRIPT_CHECK_BAD_MOVE', 'AI_SCRIPT_TRY_TO_FAINT', 'AI_SCRIPT_CHECK_VIABILITY'],
      opponentParty: [{
        species: 'STARMIE',
        level: 21,
        expProgress: 0.3,
        maxHp: 60,
        hp: 60,
        attack: 22,
        defense: 20,
        speed: 30,
        spAttack: 28,
        spDefense: 24,
        catchRate: 60,
        types: ['water', 'psychic'],
        status: 'none'
      }]
    });
    flushScriptMessages(battle, encounter);

    battle.phase = 'moveSelect';
    battle.playerMon.types = ['fire'];
    battle.playerMon.speed = 1;
    battle.wildMon.speed = 99;
    battle.moves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
    battle.playerMon.moves = battle.moves;
    battle.wildMoves = [
      makeDamageMove('TACKLE', 'EFFECT_HIT', 'normal', 35),
      makeDamageMove('WATER_GUN', 'EFFECT_HIT', 'water', 40)
    ];
    battle.wildMon.moves = battle.wildMoves;

    stepBattle(battle, confirmInput, encounter);

    expect(battle.turnSummary).toContain('Foe STARMIE used WATER GUN!');
    expect(battle.vm.locals.aiRootScripts).toBe('AI_CheckBadMove,AI_CheckViability,AI_TryToFaint');
    expect(battle.vm.locals.aiUnsupportedOpcodes).toBe('');
  });

  test('trainer AI can switch to a better bench mon instead of attacking', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState(0);

    startTrainerBattle(battle, {
      opponentName: 'MISTY',
      trainerId: 'TRAINER_MISTY',
      opponentTrainerAiFlags: ['AI_SCRIPT_CHECK_BAD_MOVE', 'AI_SCRIPT_TRY_TO_FAINT', 'AI_SCRIPT_CHECK_VIABILITY'],
      opponentParty: [
        {
          species: 'STARYU',
          level: 18,
          expProgress: 0.2,
          maxHp: 42,
          hp: 42,
          attack: 18,
          defense: 18,
          speed: 26,
          spAttack: 20,
          spDefense: 20,
          catchRate: 225,
          types: ['water'],
          status: 'none'
        },
        {
          species: 'STARMIE',
          level: 21,
          expProgress: 0.3,
          maxHp: 60,
          hp: 60,
          attack: 22,
          defense: 20,
          speed: 30,
          spAttack: 28,
          spDefense: 24,
          catchRate: 60,
          types: ['water', 'psychic'],
          status: 'none'
        }
      ]
    });
    flushScriptMessages(battle, encounter);

    battle.phase = 'moveSelect';
    battle.playerMon.types = ['fire'];
    battle.playerMon.speed = 1;
    battle.wildMon.speed = 99;
    battle.moves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
    battle.playerMon.moves = battle.moves;
    battle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
    battle.wildMon.moves = battle.wildMoves;
    battle.wildMon.volatile.lastLandedMoveId = 'EMBER';
    battle.wildMon.volatile.lastReceivedMoveType = 'fire';
    battle.wildMon.volatile.lastDamagedBy = 'player';
    battle.opponentSide.party[1]!.moves = [makeDamageMove('WATER_GUN', 'EFFECT_HIT', 'water', 40)];

    stepBattle(battle, confirmInput, encounter);

    expect([battle.turnSummary, ...battle.queuedMessages]).toContain('MISTY withdrew STARYU!');
    expect([battle.turnSummary, ...battle.queuedMessages]).toContain('MISTY sent out STARMIE!');
    expect(battle.wildMon.species).toBe('STARMIE');
    expect(battle.vm.locals.aiAction).toBe('switch');
    expect(battle.vm.locals.aiSwitchHelper).toBe('FindMonWithFlagsAndSuperEffective');
  });

  test('trainer opponents can use X items on their first active turn instead of attacking', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();

    startTrainerBattle(battle, {
      opponentName: 'LT. SURGE',
      trainerId: 'TRAINER_LT_SURGE',
      opponentTrainerItems: ['ITEM_X_ATTACK'],
      opponentParty: [{
        species: 'RAICHU',
        level: 24,
        expProgress: 0.4,
        maxHp: 70,
        hp: 70,
        attack: 24,
        defense: 20,
        speed: 35,
        spAttack: 30,
        spDefense: 24,
        catchRate: 75,
        types: ['electric'],
        status: 'none'
      }]
    });
    flushScriptMessages(battle, encounter);

    battle.phase = 'moveSelect';
    battle.playerMon.speed = 1;
    battle.wildMon.speed = 99;
    battle.moves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
    battle.playerMon.moves = battle.moves;
    battle.wildMoves = [makeDamageMove('THUNDERSHOCK', 'EFFECT_HIT', 'electric', 40)];
    battle.wildMon.moves = battle.wildMoves;

    stepBattle(battle, confirmInput, encounter);

    expect(battle.turnSummary).toBe('LT. SURGE used X ATTACK!');
    expect(battle.wildMon.statStages.attack).toBe(1);
    expect(battle.opponentTrainerItems).toEqual([]);
    expect(battle.vm.locals.aiAction).toBe('item');
  });

  test('trainer opponents can use Full Restore as a combined heal-and-cure action', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();

    startTrainerBattle(battle, {
      opponentName: 'GIOVANNI',
      trainerId: 'TRAINER_GIOVANNI',
      opponentTrainerItems: ['ITEM_FULL_RESTORE'],
      opponentParty: [{
        species: 'RHYDON',
        level: 50,
        personality: 0,
        gender: 'male',
        expProgress: 0.5,
        maxHp: 120,
        hp: 20,
        attack: 40,
        defense: 35,
        speed: 20,
        spAttack: 18,
        spDefense: 20,
        catchRate: 60,
        types: ['ground', 'rock'],
        status: 'burn',
        statusTurns: 0,
        friendship: 70,
        heldItemId: null,
        recycledItemId: null,
        knockedOff: false,
        abilityId: null,
        ivs: { hp: 0, attack: 0, defense: 0, speed: 0, spAttack: 0, spDefense: 0 },
        evs: { hp: 0, attack: 0, defense: 0, speed: 0, spAttack: 0, spDefense: 0 },
        moves: [],
        statStages: {
          attack: 0,
          defense: 0,
          speed: 0,
          spAttack: 0,
          spDefense: 0,
          accuracy: 0,
          evasion: 0
        },
        volatile: {
          confusionTurns: 0,
          flinched: false,
          protected: false,
          protectUses: 0,
          substituteHp: 0,
          leechSeededBy: null,
          focusEnergy: false,
          enduring: false,
          rechargeTurns: 0,
          trapTurns: 0,
          trappedBy: null,
          yawnTurns: 0,
          nightmare: false,
          perishTurns: 0,
          tookDamageThisTurn: false,
          minimized: false,
          defenseCurl: false,
          tauntTurns: 0,
          furyCutterCounter: 0,
          rolloutCounter: 0,
          toxicCounter: 0,
          lastMoveUsedId: null,
          lastDamageTaken: 0,
          lastDamageCategory: null,
          lastDamagedBy: null,
          disabledMoveId: null,
          disableTurns: 0,
          encoreMoveId: null,
          encoreTurns: 0,
          escapePreventedBy: null,
          rooted: false,
          transformed: false,
          infatuatedBy: null,
          tormented: false,
          destinyBond: false,
          grudge: false,
          cursed: false,
          foresighted: false,
          stockpile: 0,
          chargeTurns: 0,
          lockOnBy: null,
          lockOnTurns: 0,
          activeTurns: 0,
          lastReceivedMoveType: null,
          lastLandedMoveId: null,
          lastTakenMoveId: null,
          lastPrintedMoveId: null,
          semiInvulnerable: null,
          chargingMoveId: null,
          rampageMoveId: null,
          rampageTurns: 0,
          uproarMoveId: null,
          uproarTurns: 0,
          rage: false,
          bideMoveId: null,
          bideTurns: 0,
          bideDamage: 0,
          bideTarget: null,
          lastSuccessfulMoveId: null,
          imprisoning: false,
          magicCoat: false,
          snatch: false,
          followMe: false,
          helpingHand: false,
          flashFire: false,
          choicedMoveId: null
        }
      }]
    });
    flushScriptMessages(battle, encounter);

    battle.phase = 'moveSelect';
    battle.playerMon.speed = 1;
    battle.wildMon.speed = 99;
    battle.moves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
    battle.playerMon.moves = battle.moves;
    battle.wildMoves = [makeDamageMove('EARTHQUAKE', 'EFFECT_EARTHQUAKE', 'ground', 100)];
    battle.wildMon.moves = battle.wildMoves;

    stepBattle(battle, confirmInput, encounter);

    expect(battle.turnSummary).toBe('GIOVANNI used FULL RESTORE!');
    expect(battle.wildMon.hp).toBe(battle.wildMon.maxHp);
    expect(battle.wildMon.status).toBe('none');
    expect(battle.opponentTrainerItems).toEqual([]);
  });

  test('battle rewards grant EXP after a win and can level up the participating Pokemon', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();

    startTrainerBattle(battle, {
      opponentName: 'BROCK',
      trainerId: 'TRAINER_BROCK',
      opponentParty: [{
        species: 'CHANSEY',
        level: 20,
        expProgress: 0,
        maxHp: 120,
        hp: 1,
        attack: 10,
        defense: 10,
        speed: 10,
        spAttack: 10,
        spDefense: 10,
        catchRate: 30,
        types: ['normal'],
        status: 'none'
      }]
    });
    flushScriptMessages(battle, encounter);

    battle.playerMon.expProgress = 0.99;
    const previousLevel = battle.playerMon.level;
    const previousMaxHp = battle.playerMon.maxHp;
    battle.phase = 'moveSelect';
    battle.playerMon.speed = 99;
    battle.wildMon.speed = 1;
    battle.moves = [makeDamageMove('TACKLE', 'EFFECT_HIT', 'normal', 40)];
    battle.playerMon.moves = battle.moves;
    battle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
    battle.wildMon.moves = battle.wildMoves;

    stepBattle(battle, confirmInput, encounter);

    expect([battle.turnSummary, ...battle.queuedMessages].some((message) => message.includes('EXP. Points!'))).toBe(true);

    flushScriptMessages(battle, encounter);
    applyBattleRewards(battle);

    expect(battle.playerMon.level).toBeGreaterThan(previousLevel);
    expect(battle.playerMon.maxHp).toBeGreaterThan(previousMaxHp);
    expect(battle.playerMon.expProgress).toBeGreaterThanOrEqual(0);
    expect(battle.rewardsApplied).toBe(true);
    expect(battle.battleTrace.some((event) => event.type === 'reward' && event.text?.includes('EXP'))).toBe(true);
  });

  test('battle rewards record pending move learns for newly reached decomp learnset levels', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();
    const charmander = createBattlePokemonFromSpecies('CHARMANDER', 12);
    charmander.expProgress = 0.99;

    startTrainerBattle(battle, {
      opponentName: 'BROCK',
      trainerId: 'TRAINER_BROCK',
      playerParty: [charmander],
      opponentParty: [{
        species: 'CHANSEY',
        level: 20,
        expProgress: 0,
        maxHp: 120,
        hp: 1,
        attack: 10,
        defense: 10,
        speed: 10,
        spAttack: 10,
        spDefense: 10,
        catchRate: 30,
        types: ['normal'],
        status: 'none'
      }]
    });
    flushScriptMessages(battle, encounter);

    battle.phase = 'moveSelect';
    battle.playerMon.speed = 99;
    battle.wildMon.speed = 1;
    battle.moves = [makeDamageMove('EMBER', 'EFFECT_HIT', 'fire', 40)];
    battle.playerMon.moves = battle.moves;
    battle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
    battle.wildMon.moves = battle.wildMoves;

    stepBattle(battle, confirmInput, encounter);
    flushScriptMessages(battle, encounter);
    applyBattleRewards(battle);

    expect(battle.postResult.pendingMoveLearn).toBe(true);
    expect(battle.postResult.pendingMoveLearns).toEqual(expect.arrayContaining([
      expect.objectContaining({
        species: 'CHARMANDER',
        level: 13,
        moveId: 'METAL_CLAW'
      })
    ]));
  });

  test('battle rewards record pending evolutions when level thresholds are crossed', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();
    const charmander = createBattlePokemonFromSpecies('CHARMANDER', 15);
    charmander.expProgress = 0.99;

    startTrainerBattle(battle, {
      opponentName: 'BROCK',
      trainerId: 'TRAINER_BROCK',
      playerParty: [charmander],
      opponentParty: [{
        species: 'CHANSEY',
        level: 80,
        expProgress: 0,
        maxHp: 120,
        hp: 1,
        attack: 10,
        defense: 10,
        speed: 10,
        spAttack: 10,
        spDefense: 10,
        catchRate: 30,
        types: ['normal'],
        status: 'none'
      }]
    });
    flushScriptMessages(battle, encounter);

    battle.phase = 'moveSelect';
    battle.playerMon.speed = 99;
    battle.wildMon.speed = 1;
    battle.moves = [makeDamageMove('EMBER', 'EFFECT_HIT', 'fire', 40)];
    battle.playerMon.moves = battle.moves;
    battle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
    battle.wildMon.moves = battle.wildMoves;

    stepBattle(battle, confirmInput, encounter);
    flushScriptMessages(battle, encounter);
    applyBattleRewards(battle);

    expect(battle.postResult.pendingEvolution).toBe(true);
    expect(battle.postResult.pendingEvolutions).toEqual(expect.arrayContaining([
      expect.objectContaining({
        species: 'CHARMANDER',
        evolvesTo: 'CHARMELEON',
        level: expect.any(Number)
      })
    ]));
  });

  test('EXP Share gives bench holders their FireRed share when a foe faints', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();

    startTrainerBattle(battle, {
      opponentName: 'BROCK',
      trainerId: 'TRAINER_BROCK',
      opponentParty: [{
        species: 'GEODUDE',
        level: 20,
        expProgress: 0,
        maxHp: 35,
        hp: 1,
        attack: 18,
        defense: 22,
        speed: 9,
        spAttack: 10,
        spDefense: 12,
        catchRate: 255,
        types: ['rock', 'ground'],
        status: 'none'
      }]
    });
    flushScriptMessages(battle, encounter);

    const benchMon = battle.party[1]!;
    const previousBenchLevel = benchMon.level;
    benchMon.heldItemId = 'ITEM_EXP_SHARE';
    const previousBenchExp = benchMon.expProgress;
    battle.phase = 'moveSelect';
    battle.playerMon.speed = 99;
    battle.wildMon.speed = 1;
    battle.moves = [makeDamageMove('TACKLE', 'EFFECT_HIT', 'normal', 40)];
    battle.playerMon.moves = battle.moves;
    battle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
    battle.wildMon.moves = battle.wildMoves;

    stepBattle(battle, confirmInput, encounter);

    expect(benchMon.level > previousBenchLevel || benchMon.expProgress !== previousBenchExp).toBe(true);
    expect(battle.battleTrace.some((event) => event.type === 'reward' && event.text?.includes(benchMon.species))).toBe(true);
    expect([battle.turnSummary, ...battle.queuedMessages].some((message) => message.includes(benchMon.species) && message.includes('EXP. Points!'))).toBe(true);
  });

  test('Lucky Egg boosts EXP after the FireRed share split', () => {
    const plainBattle = createBattleState();
    const luckyBattle = createBattleState();
    const plainEncounter = createBattleEncounterState();
    const luckyEncounter = createBattleEncounterState();

    startTrainerBattle(plainBattle, {
      opponentName: 'BROCK',
      trainerId: 'TRAINER_BROCK',
      opponentParty: [{
        species: 'GEODUDE',
        level: 20,
        expProgress: 0,
        maxHp: 35,
        hp: 1,
        attack: 18,
        defense: 22,
        speed: 9,
        spAttack: 10,
        spDefense: 12,
        catchRate: 255,
        types: ['rock', 'ground'],
        status: 'none'
      }]
    });
    startTrainerBattle(luckyBattle, {
      opponentName: 'BROCK',
      trainerId: 'TRAINER_BROCK',
      opponentParty: [{
        species: 'GEODUDE',
        level: 20,
        expProgress: 0,
        maxHp: 35,
        hp: 1,
        attack: 18,
        defense: 22,
        speed: 9,
        spAttack: 10,
        spDefense: 12,
        catchRate: 255,
        types: ['rock', 'ground'],
        status: 'none'
      }]
    });
    flushScriptMessages(plainBattle, plainEncounter);
    flushScriptMessages(luckyBattle, luckyEncounter);

    luckyBattle.playerMon.heldItemId = 'ITEM_LUCKY_EGG';
    for (const currentBattle of [plainBattle, luckyBattle]) {
      currentBattle.phase = 'moveSelect';
      currentBattle.playerMon.speed = 99;
      currentBattle.wildMon.speed = 1;
      currentBattle.moves = [makeDamageMove('TACKLE', 'EFFECT_HIT', 'normal', 40)];
      currentBattle.playerMon.moves = currentBattle.moves;
      currentBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
      currentBattle.wildMon.moves = currentBattle.wildMoves;
    }

    stepBattle(plainBattle, confirmInput, plainEncounter);
    stepBattle(luckyBattle, confirmInput, luckyEncounter);

    const plainReward = plainBattle.battleTrace.find((event) => event.type === 'reward' && event.battler === 'player')?.value ?? 0;
    const luckyReward = luckyBattle.battleTrace.find((event) => event.type === 'reward' && event.battler === 'player')?.value ?? 0;

    expect(luckyReward).toBeGreaterThan(plainReward);
  });

  test('defeated-species EV yields are applied, and Macho Brace doubles them', () => {
    const plainBattle = createBattleState();
    const machoBattle = createBattleState();
    const plainEncounter = createBattleEncounterState();
    const machoEncounter = createBattleEncounterState();

    for (const currentBattle of [plainBattle, machoBattle]) {
      startTrainerBattle(currentBattle, {
        opponentName: 'BROCK',
        trainerId: 'TRAINER_BROCK',
        opponentParty: [{
          species: 'CHANSEY',
          level: 20,
          expProgress: 0,
          maxHp: 120,
          hp: 1,
          attack: 10,
          defense: 10,
          speed: 10,
          spAttack: 10,
          spDefense: 10,
          catchRate: 30,
          types: ['normal'],
          status: 'none'
        }]
      });
    }
    flushScriptMessages(plainBattle, plainEncounter);
    flushScriptMessages(machoBattle, machoEncounter);

    machoBattle.playerMon.heldItemId = 'ITEM_MACHO_BRACE';
    for (const currentBattle of [plainBattle, machoBattle]) {
      currentBattle.phase = 'moveSelect';
      currentBattle.playerMon.speed = 99;
      currentBattle.wildMon.speed = 1;
      currentBattle.moves = [makeDamageMove('TACKLE', 'EFFECT_HIT', 'normal', 40)];
      currentBattle.playerMon.moves = currentBattle.moves;
      currentBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
      currentBattle.wildMon.moves = currentBattle.wildMoves;
    }

    stepBattle(plainBattle, confirmInput, plainEncounter);
    stepBattle(machoBattle, confirmInput, machoEncounter);

    expect(plainBattle.playerMon.evs.hp).toBeGreaterThan(0);
    expect(machoBattle.playerMon.evs.hp).toBeGreaterThan(plainBattle.playerMon.evs.hp);
  });

  test('fainted participants do not receive EXP when the foe goes down', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();

    startTrainerBattle(battle, {
      opponentName: 'BROCK',
      trainerId: 'TRAINER_BROCK',
      opponentParty: [{
        species: 'GEODUDE',
        level: 20,
        expProgress: 0,
        maxHp: 35,
        hp: 1,
        attack: 18,
        defense: 22,
        speed: 9,
        spAttack: 10,
        spDefense: 12,
        catchRate: 255,
        types: ['rock', 'ground'],
        status: 'none'
      }]
    });
    flushScriptMessages(battle, encounter);

    battle.playerMon.hp = 0;
    battle.playerParticipantPartyIndexes = [battle.playerSide.activePartyIndexes[0] ?? 0];
    const previousExpProgress = battle.playerMon.expProgress;
    battle.phase = 'resolved';
    battle.defeatedOpponentPartyIndexes = [0];
    battle.rewardedOpponentPartyIndexes = [];
    battle.rewardsApplied = false;

    applyBattleRewards(battle);

    expect(battle.playerMon.expProgress).toBe(previousExpProgress);
    expect(battle.battleTrace.some((event) => event.type === 'reward')).toBe(false);
    expect(battle.rewardsApplied).toBe(true);
  });

  test('applies Gen 3 STAB/type modifiers with integer truncation in type-table order', () => {
    const battle = createBattleState();
    const move = makeDamageMove('FIRE_TEST', 'EFFECT_HIT', 'fire', 25, 100);
    battle.playerMon.level = 10;
    battle.playerMon.types = ['normal'];
    battle.playerMon.spAttack = 10;
    battle.wildMon.types = ['water', 'grass'];
    battle.wildMon.spDefense = 10;

    expect(calculateBaseDamage(battle.playerMon, battle.wildMon, move)).toBe(5);

    const preview = calculateDamagePreview(battle.playerMon, battle.wildMon, move);
    expect(preview.max).toBe(4);
    expect(preview.min).toBe(3);
  });

  test('Struggle skips STAB and type immunity like FireRed TypeCalc', () => {
    const battle = createBattleState();
    const struggle = makeDamageMove('STRUGGLE', 'EFFECT_RECOIL', 'normal', 50, 0);
    const tackle = makeDamageMove('TACKLE', 'EFFECT_HIT', 'normal', 50, 0);
    battle.playerMon.types = ['normal'];
    battle.wildMon.types = ['ghost'];

    const baseDamage = calculateBaseDamage(battle.playerMon, battle.wildMon, struggle);
    expect(calculateDamagePreview(battle.playerMon, battle.wildMon, tackle)).toEqual({ min: 0, max: 0 });
    expect(calculateDamagePreview(battle.playerMon, battle.wildMon, struggle)).toEqual({
      min: Math.max(1, Math.floor((baseDamage * 85) / 100)),
      max: baseDamage
    });
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

    const focusPunchBattle = createBattleState();
    focusPunchBattle.active = true;
    focusPunchBattle.phase = 'moveSelect';
    focusPunchBattle.playerMon.speed = 1;
    focusPunchBattle.wildMon.speed = 99;
    focusPunchBattle.moves = [makeDamageMove('FOCUS_PUNCH', 'EFFECT_FOCUS_PUNCH', 'fighting', 150)];
    focusPunchBattle.playerMon.moves = focusPunchBattle.moves;
    focusPunchBattle.wildMoves = [makeDamageMove('TACKLE', 'EFFECT_HIT', 'normal', 40)];
    focusPunchBattle.wildMon.moves = focusPunchBattle.wildMoves;
    const focusPunchPp = focusPunchBattle.moves[0]!.ppRemaining;
    const focusPunchWildHp = focusPunchBattle.wildMon.hp;

    stepBattle(focusPunchBattle, confirmInput, createBattleEncounterState());

    expect(focusPunchBattle.moves[0]!.ppRemaining).toBe(focusPunchPp - 1);
    expect(focusPunchBattle.wildMon.hp).toBe(focusPunchWildHp);
    expect([focusPunchBattle.turnSummary, ...focusPunchBattle.queuedMessages]).toContain(`${focusPunchBattle.playerMon.species} lost its focus and couldn't move!`);
    expect([focusPunchBattle.turnSummary, ...focusPunchBattle.queuedMessages]).not.toContain(`${focusPunchBattle.playerMon.species} used FOCUS PUNCH!`);
  });

  test('valid move use decrements PP exactly once from 35/35 to 34/35', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();
    battle.active = true;
    battle.phase = 'moveSelect';
    battle.playerMon.speed = 99;
    battle.wildMon.speed = 1;
    battle.moves = [{ ...makeDamageMove('TACKLE', 'EFFECT_HIT', 'normal', 40), pp: 35, ppRemaining: 35 }];
    battle.playerMon.moves = battle.moves;
    battle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
    battle.wildMon.moves = battle.wildMoves;
    const tacklePp = battle.moves[0]!.ppRemaining;
    const wildHp = battle.wildMon.hp;

    stepBattle(battle, confirmInput, encounter);

    expect(battle.moves[0]!.ppRemaining).toBe(tacklePp - 1);
    expect(battle.moves[0]!.ppRemaining).toBe(34);
    expect(battle.wildMon.hp).toBeLessThan(wildHp);
    expect(battle.turnSummary).toContain('used TACKLE');
  });

  test('opening the fight menu and canceling back out does not consume PP', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();
    battle.active = true;
    battle.phase = 'command';
    battle.playerMon.speed = 99;
    battle.wildMon.speed = 1;
    battle.moves = [{ ...makeDamageMove('TACKLE', 'EFFECT_HIT', 'normal', 40), pp: 35, ppRemaining: 35 }];
    battle.playerMon.moves = battle.moves;
    battle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
    battle.wildMon.moves = battle.wildMoves;
    battle.selectedCommandIndex = battle.commands.findIndex((command) => command === 'fight');

    stepBattle(battle, confirmInput, encounter);
    expect(battle.phase).toBe('moveSelect');

    stepBattle(battle, { ...neutralInput, cancel: true, cancelPressed: true }, encounter);

    expect(battle.phase).toBe('command');
    expect(battle.moves[0]!.ppRemaining).toBe(35);
  });

  test('a move at 1 PP drops to 0 after use and falls back to Struggle on the next selection', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();
    battle.active = true;
    battle.phase = 'moveSelect';
    battle.playerMon.speed = 99;
    battle.wildMon.speed = 1;
    battle.moves = [{ ...makeDamageMove('TACKLE', 'EFFECT_HIT', 'normal', 40), pp: 1, ppRemaining: 1 }];
    battle.playerMon.moves = battle.moves;
    battle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
    battle.wildMon.moves = battle.wildMoves;
    const lowPpMove = battle.moves[0]!;

    stepBattle(battle, confirmInput, encounter);

    expect(lowPpMove.ppRemaining).toBe(0);
    flushScriptMessages(battle, encounter);
    battle.phase = 'moveSelect';
    battle.selectedMoveIndex = 0;

    stepBattle(battle, confirmInput, encounter);

    expect(battle.turnSummary).toContain('used STRUGGLE');
    expect(lowPpMove.ppRemaining).toBe(0);
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

  test('Foresight ignores target evasion stages during accuracy checks', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();
    const tackle = makeDamageMove('TACKLE', 'EFFECT_HIT', 'normal', 40, 100);
    battle.active = true;
    battle.phase = 'moveSelect';
    battle.playerMon.speed = 99;
    battle.moves = [tackle];
    battle.playerMon.moves = battle.moves;
    battle.wildMon.types = ['normal'];
    battle.wildMon.statStages.evasion = 6;
    battle.wildMon.volatile.foresighted = true;
    const wildHp = battle.wildMon.hp;

    stepBattle(battle, confirmInput, encounter);

    expect(battle.wildMon.hp).toBeLessThan(wildHp);
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

    const chainedBattle = createBattleState();
    const chainedEncounter = createBattleEncounterState();
    chainedEncounter.rngState = 2;
    chainedBattle.active = true;
    chainedBattle.phase = 'moveSelect';
    chainedBattle.playerMon.speed = 99;
    chainedBattle.playerMon.volatile.protectUses = 1;
    chainedBattle.playerMon.volatile.lastSuccessfulMoveId = 'PROTECT';
    chainedBattle.wildMon.speed = 1;
    chainedBattle.wildMon.attack = 999;
    chainedBattle.moves = [makeStatusMove('ENDURE', 'EFFECT_ENDURE', 'normal')];
    chainedBattle.playerMon.moves = chainedBattle.moves;
    chainedBattle.wildMoves = [makeDamageMove('MEGA_HIT', 'EFFECT_HIT', 'normal', 250)];
    chainedBattle.wildMon.moves = chainedBattle.wildMoves;

    stepBattle(chainedBattle, confirmInput, chainedEncounter);

    expect(chainedBattle.playerMon.hp).toBe(0);
    expect([chainedBattle.turnSummary, ...chainedBattle.queuedMessages]).toContain('But it failed!');

    const sleepTalkProtectBattle = createBattleState();
    const sleepTalkProtectEncounter = createBattleEncounterState();
    sleepTalkProtectBattle.active = true;
    sleepTalkProtectBattle.phase = 'moveSelect';
    sleepTalkProtectBattle.playerMon.speed = 99;
    sleepTalkProtectBattle.moves = [makeStatusMove('PROTECT', 'EFFECT_PROTECT', 'normal')];
    sleepTalkProtectBattle.playerMon.moves = sleepTalkProtectBattle.moves;
    sleepTalkProtectBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
    sleepTalkProtectBattle.wildMon.moves = sleepTalkProtectBattle.wildMoves;

    stepBattle(sleepTalkProtectBattle, confirmInput, sleepTalkProtectEncounter);
    flushScriptMessages(sleepTalkProtectBattle, sleepTalkProtectEncounter);

    sleepTalkProtectBattle.phase = 'moveSelect';
    sleepTalkProtectBattle.playerMon.status = 'sleep';
    sleepTalkProtectBattle.playerMon.statusTurns = 3;
    sleepTalkProtectBattle.moves = [
      makeStatusMove('SLEEP_TALK', 'EFFECT_SLEEP_TALK', 'normal'),
      makeStatusMove('PROTECT', 'EFFECT_PROTECT', 'normal')
    ];
    sleepTalkProtectBattle.playerMon.moves = sleepTalkProtectBattle.moves;
    sleepTalkProtectEncounter.rngState = 4;

    stepBattle(sleepTalkProtectBattle, confirmInput, sleepTalkProtectEncounter);

    expect(sleepTalkProtectBattle.playerMon.volatile.protected).toBe(false);
    expect([sleepTalkProtectBattle.turnSummary, ...sleepTalkProtectBattle.queuedMessages]).toContain('But it failed!');
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
    expect(yawnBattle.wildMon.statusTurns).toBe(3);
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

  test('Bide stores incoming damage and releases double damage after its lock turns', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();
    battle.active = true;
    battle.phase = 'moveSelect';
    battle.playerMon.speed = 99;
    battle.wildMon.speed = 1;
    battle.wildMon.maxHp = 200;
    battle.wildMon.hp = 200;
    battle.moves = [makeStatusMove('BIDE', 'EFFECT_BIDE', 'normal')];
    battle.playerMon.moves = battle.moves;
    battle.wildMoves = [makeDamageMove('TACKLE', 'EFFECT_HIT', 'normal', 40)];
    battle.wildMon.moves = battle.wildMoves;

    stepBattle(battle, confirmInput, encounter);
    expect(battle.playerMon.volatile.bideTurns).toBe(2);
    expect(battle.playerMon.volatile.bideDamage).toBeGreaterThan(0);
    const storedAfterFirstTurn = battle.playerMon.volatile.bideDamage;

    flushScriptMessages(battle, encounter);
    stepBattle(battle, confirmInput, encounter);
    expect(battle.playerMon.volatile.bideTurns).toBe(1);
    expect(battle.playerMon.volatile.bideDamage).toBeGreaterThan(storedAfterFirstTurn);
    const storedTotal = battle.playerMon.volatile.bideDamage;

    flushScriptMessages(battle, encounter);
    stepBattle(battle, confirmInput, encounter);

    expect(battle.playerMon.volatile.bideTurns).toBe(0);
    expect(200 - battle.wildMon.hp).toBe(storedTotal * 2);
    expect([battle.turnSummary, ...battle.queuedMessages]).toContain(`${battle.playerMon.species} unleashed energy!`);
  });

  test('Future Sight stores a delayed attack on the target side', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();
    battle.active = true;
    battle.phase = 'moveSelect';
    battle.playerMon.speed = 99;
    battle.wildMon.maxHp = 200;
    battle.wildMon.hp = 200;
    battle.moves = [makeDamageMove('FUTURE_SIGHT', 'EFFECT_FUTURE_SIGHT', 'psychic', 80, 100)];
    battle.playerMon.moves = battle.moves;
    battle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    battle.wildMon.moves = battle.wildMoves;

    stepBattle(battle, confirmInput, encounter);
    expect(battle.wildMon.hp).toBe(200);
    expect(battle.sideState.opponent.futureAttack?.countdown).toBe(2);

    flushScriptMessages(battle, encounter);
    stepBattle(battle, confirmInput, encounter);
    stepBattle(battle, confirmInput, encounter);
    expect(battle.wildMon.hp).toBe(200);
    expect(battle.sideState.opponent.futureAttack?.countdown).toBe(1);

    flushScriptMessages(battle, encounter);
    stepBattle(battle, confirmInput, encounter);
    stepBattle(battle, confirmInput, encounter);

    expect(battle.sideState.opponent.futureAttack).toBeNull();
    expect(battle.wildMon.hp).toBeLessThan(200);
    expect([battle.turnSummary, ...battle.queuedMessages]).toContain(`${battle.wildMon.species} took FUTURE SIGHT!`);

    const sureHitBattle = createBattleState();
    const sureHitEncounter = createBattleEncounterState();
    sureHitBattle.active = true;
    sureHitBattle.phase = 'moveSelect';
    sureHitBattle.playerMon.speed = 99;
    sureHitBattle.wildMon.maxHp = 200;
    sureHitBattle.wildMon.hp = 200;
    sureHitBattle.moves = [makeDamageMove('FUTURE_SIGHT', 'EFFECT_FUTURE_SIGHT', 'psychic', 80, 1)];
    sureHitBattle.playerMon.moves = sureHitBattle.moves;
    sureHitBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    sureHitBattle.wildMon.moves = sureHitBattle.wildMoves;

    stepBattle(sureHitBattle, confirmInput, sureHitEncounter);
    flushScriptMessages(sureHitBattle, sureHitEncounter);
    stepBattle(sureHitBattle, confirmInput, sureHitEncounter);
    stepBattle(sureHitBattle, confirmInput, sureHitEncounter);
    flushScriptMessages(sureHitBattle, sureHitEncounter);
    stepBattle(sureHitBattle, confirmInput, sureHitEncounter);
    stepBattle(sureHitBattle, confirmInput, sureHitEncounter);

    expect(sureHitBattle.wildMon.hp).toBeLessThan(200);
    expect([sureHitBattle.turnSummary, ...sureHitBattle.queuedMessages]).not.toContain('The attack missed!');

    const helpingHandBattle = createBattleState();
    helpingHandBattle.active = true;
    helpingHandBattle.phase = 'moveSelect';
    helpingHandBattle.playerMon.speed = 99;
    helpingHandBattle.playerMon.volatile.helpingHand = true;
    helpingHandBattle.wildMon.maxHp = 200;
    helpingHandBattle.wildMon.hp = 200;
    helpingHandBattle.moves = [makeDamageMove('FUTURE_SIGHT', 'EFFECT_FUTURE_SIGHT', 'psychic', 80, 100)];
    helpingHandBattle.playerMon.moves = helpingHandBattle.moves;
    helpingHandBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    helpingHandBattle.wildMon.moves = helpingHandBattle.wildMoves;

    stepBattle(helpingHandBattle, confirmInput, createBattleEncounterState());

    expect(helpingHandBattle.sideState.opponent.futureAttack?.damage).toBe(
      Math.floor((calculateBaseDamage(helpingHandBattle.playerMon, helpingHandBattle.wildMon, helpingHandBattle.moves[0]!) * 15) / 10)
    );
  });

  test('Hidden Power derives type and power from IVs, and Secret Power uses terrain effects', () => {
    const weakHidden = createBattleState();
    const strongHidden = createBattleState();
    for (const battle of [weakHidden, strongHidden]) {
      battle.active = true;
      battle.phase = 'moveSelect';
      battle.playerMon.speed = 99;
      battle.wildMon.maxHp = 200;
      battle.wildMon.hp = 200;
      battle.wildMon.types = ['psychic'];
      battle.moves = [makeDamageMove('HIDDEN_POWER', 'EFFECT_HIDDEN_POWER', 'normal', 1)];
      battle.playerMon.moves = battle.moves;
      battle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
      battle.wildMon.moves = battle.wildMoves;
    }
    strongHidden.playerMon.ivs = { hp: 31, attack: 31, defense: 31, speed: 31, spAttack: 31, spDefense: 31 };

    stepBattle(weakHidden, confirmInput, createBattleEncounterState());
    stepBattle(strongHidden, confirmInput, createBattleEncounterState());

    expect(200 - strongHidden.wildMon.hp).toBeGreaterThan(200 - weakHidden.wildMon.hp);

    const secretBattle = createBattleState();
    secretBattle.active = true;
    secretBattle.phase = 'moveSelect';
    secretBattle.playerMon.speed = 99;
    secretBattle.wildMon.speed = 1;
    secretBattle.terrain = 'BATTLE_TERRAIN_CAVE';
    secretBattle.moves = [makeDamageMove('SECRET_POWER', 'EFFECT_SECRET_POWER', 'normal', 70, 100, 100)];
    secretBattle.playerMon.moves = secretBattle.moves;
    secretBattle.wildMoves = [makeDamageMove('TACKLE', 'EFFECT_HIT', 'normal', 40)];
    secretBattle.wildMon.moves = secretBattle.wildMoves;
    const playerHp = secretBattle.playerMon.hp;

    stepBattle(secretBattle, confirmInput, createBattleEncounterState());

    expect(secretBattle.playerMon.hp).toBe(playerHp);
    expect([secretBattle.turnSummary, ...secretBattle.queuedMessages]).toContain(`${secretBattle.wildMon.species} flinched!`);
  });

  test('Thief, Knock Off, Trick, and Recycle update held item state', () => {
    const thiefBattle = createBattleState();
    thiefBattle.active = true;
    thiefBattle.phase = 'moveSelect';
    thiefBattle.playerMon.speed = 99;
    thiefBattle.playerMon.heldItemId = null;
    thiefBattle.wildMon.heldItemId = 'ITEM_MYSTIC_WATER';
    thiefBattle.moves = [makeDamageMove('THIEF', 'EFFECT_THIEF', 'dark', 40)];
    thiefBattle.playerMon.moves = thiefBattle.moves;
    thiefBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    thiefBattle.wildMon.moves = thiefBattle.wildMoves;

    stepBattle(thiefBattle, confirmInput, createBattleEncounterState());

    expect(thiefBattle.playerMon.heldItemId).toBe('ITEM_MYSTIC_WATER');
    expect(thiefBattle.wildMon.heldItemId).toBeNull();

    const knockBattle = createBattleState();
    knockBattle.active = true;
    knockBattle.phase = 'moveSelect';
    knockBattle.playerMon.speed = 99;
    knockBattle.wildMon.heldItemId = 'ITEM_SITRUS_BERRY';
    knockBattle.moves = [makeDamageMove('KNOCK_OFF', 'EFFECT_KNOCK_OFF', 'dark', 20)];
    knockBattle.playerMon.moves = knockBattle.moves;
    knockBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    knockBattle.wildMon.moves = knockBattle.wildMoves;

    stepBattle(knockBattle, confirmInput, createBattleEncounterState());

    expect(knockBattle.wildMon.heldItemId).toBeNull();
    expect(knockBattle.wildMon.knockedOff).toBe(true);

    const trickBattle = createBattleState();
    trickBattle.active = true;
    trickBattle.phase = 'moveSelect';
    trickBattle.playerMon.speed = 99;
    trickBattle.playerMon.heldItemId = 'ITEM_CHERI_BERRY';
    trickBattle.wildMon.heldItemId = 'ITEM_CHESTO_BERRY';
    trickBattle.moves = [makeStatusMove('TRICK', 'EFFECT_TRICK', 'psychic', 100)];
    trickBattle.playerMon.moves = trickBattle.moves;
    trickBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    trickBattle.wildMon.moves = trickBattle.wildMoves;

    stepBattle(trickBattle, confirmInput, createBattleEncounterState());

    expect(trickBattle.playerMon.heldItemId).toBe('ITEM_CHESTO_BERRY');
    expect(trickBattle.wildMon.heldItemId).toBe('ITEM_CHERI_BERRY');

    const recycleBattle = createBattleState();
    recycleBattle.active = true;
    recycleBattle.phase = 'moveSelect';
    recycleBattle.playerMon.speed = 99;
    recycleBattle.playerMon.heldItemId = null;
    recycleBattle.playerMon.recycledItemId = 'ITEM_ORAN_BERRY';
    recycleBattle.moves = [makeStatusMove('RECYCLE', 'EFFECT_RECYCLE', 'normal')];
    recycleBattle.playerMon.moves = recycleBattle.moves;
    recycleBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    recycleBattle.wildMon.moves = recycleBattle.wildMoves;

    stepBattle(recycleBattle, confirmInput, createBattleEncounterState());

    expect(recycleBattle.playerMon.heldItemId).toBe('ITEM_ORAN_BERRY');
    expect(recycleBattle.playerMon.recycledItemId).toBeNull();
  });

  test('held restorative items consume via decomp hold effects', () => {
    const oranBattle = createBattleState();
    oranBattle.active = true;
    oranBattle.phase = 'moveSelect';
    oranBattle.playerMon.speed = 99;
    oranBattle.wildMon.maxHp = 100;
    oranBattle.wildMon.hp = 40;
    oranBattle.wildMon.heldItemId = 'ITEM_ORAN_BERRY';
    oranBattle.moves = [makeDamageMove('TACKLE', 'EFFECT_HIT', 'normal', 10)];
    oranBattle.playerMon.moves = oranBattle.moves;
    oranBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    oranBattle.wildMon.moves = oranBattle.wildMoves;

    stepBattle(oranBattle, confirmInput, createBattleEncounterState());

    expect(oranBattle.wildMon.heldItemId).toBeNull();
    expect(oranBattle.wildMon.recycledItemId).toBe('ITEM_ORAN_BERRY');
    expect(oranBattle.wildMon.hp).toBeGreaterThan(40);

    const statusBattle = createBattleState();
    statusBattle.active = true;
    statusBattle.phase = 'moveSelect';
    statusBattle.playerMon.speed = 99;
    statusBattle.wildMon.heldItemId = 'ITEM_PECHA_BERRY';
    statusBattle.moves = [makeStatusMove('POISON_POWDER', 'EFFECT_POISON', 'poison')];
    statusBattle.playerMon.moves = statusBattle.moves;
    statusBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    statusBattle.wildMon.moves = statusBattle.wildMoves;

    stepBattle(statusBattle, confirmInput, createBattleEncounterState());

    expect(statusBattle.wildMon.status).toBe('none');
    expect(statusBattle.wildMon.heldItemId).toBeNull();
    expect(statusBattle.wildMon.recycledItemId).toBe('ITEM_PECHA_BERRY');

    const confuseBattle = createBattleState();
    confuseBattle.active = true;
    confuseBattle.phase = 'moveSelect';
    confuseBattle.playerMon.speed = 99;
    confuseBattle.wildMon.heldItemId = 'ITEM_PERSIM_BERRY';
    confuseBattle.moves = [makeStatusMove('CONFUSE_RAY', 'EFFECT_CONFUSE', 'ghost')];
    confuseBattle.playerMon.moves = confuseBattle.moves;
    confuseBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    confuseBattle.wildMon.moves = confuseBattle.wildMoves;

    stepBattle(confuseBattle, confirmInput, createBattleEncounterState());

    expect(confuseBattle.wildMon.volatile.confusionTurns).toBe(0);
    expect(confuseBattle.wildMon.heldItemId).toBeNull();
    expect(confuseBattle.wildMon.recycledItemId).toBe('ITEM_PERSIM_BERRY');
  });

  test('held battle items apply decomp stat, damage, flinch, and healing hooks', () => {
    const leftoversBattle = createBattleState();
    leftoversBattle.active = true;
    leftoversBattle.phase = 'moveSelect';
    leftoversBattle.playerMon.speed = 99;
    leftoversBattle.playerMon.maxHp = 100;
    leftoversBattle.playerMon.hp = 50;
    leftoversBattle.playerMon.heldItemId = 'ITEM_LEFTOVERS';
    leftoversBattle.moves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    leftoversBattle.playerMon.moves = leftoversBattle.moves;
    leftoversBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    leftoversBattle.wildMon.moves = leftoversBattle.wildMoves;

    stepBattle(leftoversBattle, confirmInput, createBattleEncounterState());

    expect(leftoversBattle.playerMon.hp).toBe(56);

    const baseline = createBattleState();
    const boosted = createBattleState();
    for (const battle of [baseline, boosted]) {
      battle.active = true;
      battle.phase = 'moveSelect';
      battle.playerMon.speed = 99;
      battle.wildMon.maxHp = 200;
      battle.wildMon.hp = 200;
      battle.moves = [makeDamageMove('SLASH', 'EFFECT_HIT', 'normal', 70)];
      battle.playerMon.moves = battle.moves;
      battle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
      battle.wildMon.moves = battle.wildMoves;
    }
    boosted.playerMon.heldItemId = 'ITEM_CHOICE_BAND';

    stepBattle(baseline, confirmInput, createBattleEncounterState());
    stepBattle(boosted, confirmInput, createBattleEncounterState());

    expect(boosted.wildMon.maxHp - boosted.wildMon.hp).toBeGreaterThan(baseline.wildMon.maxHp - baseline.wildMon.hp);

    const typeBase = createBattleState();
    const typeBoost = createBattleState();
    for (const battle of [typeBase, typeBoost]) {
      battle.active = true;
      battle.phase = 'moveSelect';
      battle.playerMon.speed = 99;
      battle.wildMon.maxHp = 200;
      battle.wildMon.hp = 200;
      battle.moves = [makeDamageMove('EMBER', 'EFFECT_HIT', 'fire', 40)];
      battle.playerMon.moves = battle.moves;
      battle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
      battle.wildMon.moves = battle.wildMoves;
    }
    typeBoost.playerMon.heldItemId = 'ITEM_CHARCOAL';

    stepBattle(typeBase, confirmInput, createBattleEncounterState());
    stepBattle(typeBoost, confirmInput, createBattleEncounterState());

    expect(typeBoost.wildMon.maxHp - typeBoost.wildMon.hp).toBeGreaterThan(typeBase.wildMon.maxHp - typeBase.wildMon.hp);

    const choiceLockBattle = createBattleState();
    const choiceLockEncounter = createBattleEncounterState();
    choiceLockBattle.active = true;
    choiceLockBattle.phase = 'moveSelect';
    choiceLockBattle.playerMon.speed = 99;
    choiceLockBattle.playerMon.heldItemId = 'ITEM_CHOICE_BAND';
    choiceLockBattle.moves = [
      makeDamageMove('TACKLE', 'EFFECT_HIT', 'normal', 40),
      makeStatusMove('GROWL', 'EFFECT_ATTACK_DOWN', 'normal')
    ];
    choiceLockBattle.playerMon.moves = choiceLockBattle.moves;
    choiceLockBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
    choiceLockBattle.wildMon.moves = choiceLockBattle.wildMoves;

    stepBattle(choiceLockBattle, confirmInput, choiceLockEncounter);
    flushScriptMessages(choiceLockBattle, choiceLockEncounter);

    choiceLockBattle.phase = 'moveSelect';
    choiceLockBattle.selectedMoveIndex = 1;
    const lockedWildHp = choiceLockBattle.wildMon.hp;
    stepBattle(choiceLockBattle, confirmInput, choiceLockEncounter);

    expect(choiceLockBattle.phase).toBe('moveSelect');
    expect(choiceLockBattle.wildMon.hp).toBe(lockedWildHp);
    expect(choiceLockBattle.turnSummary).toContain('can only use TACKLE');

    const shellBattle = createBattleState();
    shellBattle.active = true;
    shellBattle.phase = 'moveSelect';
    shellBattle.playerMon.speed = 99;
    shellBattle.playerMon.maxHp = 100;
    shellBattle.playerMon.hp = 50;
    shellBattle.playerMon.heldItemId = 'ITEM_SHELL_BELL';
    shellBattle.wildMon.maxHp = 200;
    shellBattle.wildMon.hp = 200;
    shellBattle.moves = [makeDamageMove('TACKLE', 'EFFECT_HIT', 'normal', 80)];
    shellBattle.playerMon.moves = shellBattle.moves;
    shellBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    shellBattle.wildMon.moves = shellBattle.wildMoves;

    stepBattle(shellBattle, confirmInput, createBattleEncounterState());

    expect(shellBattle.playerMon.hp).toBeGreaterThan(50);

    let kingRockFlinched = false;
    for (let seed = 0; seed < 100 && !kingRockFlinched; seed += 1) {
      const kingsRockBattle = createBattleState();
      const kingsRockEncounter = createBattleEncounterState();
      kingsRockEncounter.rngState = seed;
      kingsRockBattle.active = true;
      kingsRockBattle.phase = 'moveSelect';
      kingsRockBattle.playerMon.speed = 99;
      kingsRockBattle.playerMon.heldItemId = 'ITEM_KINGS_ROCK';
      kingsRockBattle.wildMon.maxHp = 200;
      kingsRockBattle.wildMon.hp = 200;
      kingsRockBattle.moves = [makeDamageMove('TACKLE', 'EFFECT_HIT', 'normal', 40)];
      kingsRockBattle.moves[0]!.flags = ['FLAG_KINGS_ROCK_AFFECTED'];
      kingsRockBattle.playerMon.moves = kingsRockBattle.moves;
      kingsRockBattle.wildMoves = [makeDamageMove('SCRATCH', 'EFFECT_HIT', 'normal', 40)];
      kingsRockBattle.wildMon.moves = kingsRockBattle.wildMoves;
      const playerHp = kingsRockBattle.playerMon.hp;

      stepBattle(kingsRockBattle, confirmInput, kingsRockEncounter);

      kingRockFlinched = kingsRockBattle.playerMon.hp === playerHp
        && [kingsRockBattle.turnSummary, ...kingsRockBattle.queuedMessages].includes(`${kingsRockBattle.wildMon.species} flinched!`);
    }
    expect(kingRockFlinched).toBe(true);
  });

  test('held stat items and passive abilities follow decomp damage and timing hooks', () => {
    const thickClubBase = createBattleState();
    const thickClubBoost = createBattleState();
    for (const battle of [thickClubBase, thickClubBoost]) {
      battle.active = true;
      battle.phase = 'moveSelect';
      battle.playerMon.species = 'MAROWAK';
      battle.playerMon.speed = 99;
      battle.wildMon.maxHp = 200;
      battle.wildMon.hp = 200;
      battle.wildMon.types = ['normal'];
      battle.moves = [makeDamageMove('BONE_CLUB', 'EFFECT_HIT', 'ground', 65)];
      battle.playerMon.moves = battle.moves;
      battle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
      battle.wildMon.moves = battle.wildMoves;
    }
    thickClubBoost.playerMon.heldItemId = 'ITEM_THICK_CLUB';

    stepBattle(thickClubBase, confirmInput, createBattleEncounterState());
    stepBattle(thickClubBoost, confirmInput, createBattleEncounterState());

    expect(thickClubBoost.wildMon.maxHp - thickClubBoost.wildMon.hp).toBeGreaterThan(thickClubBase.wildMon.maxHp - thickClubBase.wildMon.hp);

    const gutsBase = createBattleState();
    const gutsBattle = createBattleState();
    for (const battle of [gutsBase, gutsBattle]) {
      battle.active = true;
      battle.phase = 'moveSelect';
      battle.playerMon.speed = 99;
      battle.playerMon.status = 'burn';
      battle.wildMon.maxHp = 200;
      battle.wildMon.hp = 200;
      battle.moves = [makeDamageMove('SLASH', 'EFFECT_HIT', 'normal', 70)];
      battle.playerMon.moves = battle.moves;
      battle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
      battle.wildMon.moves = battle.wildMoves;
    }
    gutsBattle.playerMon.abilityId = 'GUTS';

    stepBattle(gutsBase, confirmInput, createBattleEncounterState());
    stepBattle(gutsBattle, confirmInput, createBattleEncounterState());

    expect(gutsBattle.wildMon.maxHp - gutsBattle.wildMon.hp).toBeGreaterThan(gutsBase.wildMon.maxHp - gutsBase.wildMon.hp);

    const rockHeadBattle = createBattleState();
    rockHeadBattle.active = true;
    rockHeadBattle.phase = 'moveSelect';
    rockHeadBattle.playerMon.speed = 99;
    rockHeadBattle.playerMon.abilityId = 'ROCK_HEAD';
    rockHeadBattle.wildMon.maxHp = 200;
    rockHeadBattle.wildMon.hp = 200;
    rockHeadBattle.moves = [makeDamageMove('DOUBLE_EDGE', 'EFFECT_DOUBLE_EDGE', 'normal', 120)];
    rockHeadBattle.playerMon.moves = rockHeadBattle.moves;
    rockHeadBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    rockHeadBattle.wildMon.moves = rockHeadBattle.wildMoves;
    const rockHeadHp = rockHeadBattle.playerMon.hp;

    stepBattle(rockHeadBattle, confirmInput, createBattleEncounterState());

    expect(rockHeadBattle.playerMon.hp).toBe(rockHeadHp);

    const swiftSwimBattle = createBattleState();
    swiftSwimBattle.active = true;
    swiftSwimBattle.phase = 'moveSelect';
    swiftSwimBattle.weather = 'rain';
    swiftSwimBattle.weatherTurns = 5;
    swiftSwimBattle.playerMon.speed = 20;
    swiftSwimBattle.playerMon.abilityId = 'SWIFT_SWIM';
    swiftSwimBattle.wildMon.speed = 30;
    swiftSwimBattle.moves = [makeDamageMove('HEADBUTT', 'EFFECT_FLINCH_HIT', 'normal', 40, 0, 100)];
    swiftSwimBattle.playerMon.moves = swiftSwimBattle.moves;
    swiftSwimBattle.wildMoves = [makeDamageMove('SCRATCH', 'EFFECT_HIT', 'normal', 40)];
    swiftSwimBattle.wildMon.moves = swiftSwimBattle.wildMoves;
    const swiftSwimHp = swiftSwimBattle.playerMon.hp;

    stepBattle(swiftSwimBattle, confirmInput, createBattleEncounterState());

    expect(swiftSwimBattle.playerMon.hp).toBe(swiftSwimHp);

    const innerFocusBattle = createBattleState();
    innerFocusBattle.active = true;
    innerFocusBattle.phase = 'moveSelect';
    innerFocusBattle.playerMon.speed = 99;
    innerFocusBattle.wildMon.abilityId = 'INNER_FOCUS';
    innerFocusBattle.moves = [makeDamageMove('HEADBUTT', 'EFFECT_FLINCH_HIT', 'normal', 40, 0, 100)];
    innerFocusBattle.playerMon.moves = innerFocusBattle.moves;
    innerFocusBattle.wildMoves = [makeDamageMove('SCRATCH', 'EFFECT_HIT', 'normal', 40)];
    innerFocusBattle.wildMon.moves = innerFocusBattle.wildMoves;
    const innerFocusHp = innerFocusBattle.playerMon.hp;

    stepBattle(innerFocusBattle, confirmInput, createBattleEncounterState());

    expect(innerFocusBattle.playerMon.hp).toBeLessThan(innerFocusHp);

    const rainDishBattle = createBattleState();
    rainDishBattle.active = true;
    rainDishBattle.phase = 'moveSelect';
    rainDishBattle.weather = 'rain';
    rainDishBattle.weatherTurns = 5;
    rainDishBattle.playerMon.speed = 99;
    rainDishBattle.playerMon.maxHp = 100;
    rainDishBattle.playerMon.hp = 50;
    rainDishBattle.playerMon.abilityId = 'RAIN_DISH';
    rainDishBattle.moves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    rainDishBattle.playerMon.moves = rainDishBattle.moves;
    rainDishBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    rainDishBattle.wildMon.moves = rainDishBattle.wildMoves;

    stepBattle(rainDishBattle, confirmInput, createBattleEncounterState());

    expect(rainDishBattle.playerMon.hp).toBe(56);

    const whiteHerbBattle = createBattleState();
    whiteHerbBattle.active = true;
    whiteHerbBattle.phase = 'moveSelect';
    whiteHerbBattle.playerMon.speed = 99;
    whiteHerbBattle.playerMon.heldItemId = 'ITEM_WHITE_HERB';
    whiteHerbBattle.wildMon.maxHp = 200;
    whiteHerbBattle.wildMon.hp = 200;
    whiteHerbBattle.moves = [makeDamageMove('SUPERPOWER', 'EFFECT_SUPERPOWER', 'fighting', 120)];
    whiteHerbBattle.playerMon.moves = whiteHerbBattle.moves;
    whiteHerbBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    whiteHerbBattle.wildMon.moves = whiteHerbBattle.wildMoves;

    stepBattle(whiteHerbBattle, confirmInput, createBattleEncounterState());

    expect(whiteHerbBattle.playerMon.statStages.attack).toBe(0);
    expect(whiteHerbBattle.playerMon.statStages.defense).toBe(0);
    expect(whiteHerbBattle.playerMon.heldItemId).toBeNull();
    expect(whiteHerbBattle.playerMon.recycledItemId).toBe('ITEM_WHITE_HERB');

    const liechiBattle = createBattleState();
    liechiBattle.active = true;
    liechiBattle.phase = 'moveSelect';
    liechiBattle.playerMon.speed = 99;
    liechiBattle.playerMon.maxHp = 100;
    liechiBattle.playerMon.hp = 25;
    liechiBattle.playerMon.heldItemId = 'ITEM_LIECHI_BERRY';
    liechiBattle.moves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    liechiBattle.playerMon.moves = liechiBattle.moves;
    liechiBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    liechiBattle.wildMon.moves = liechiBattle.wildMoves;

    stepBattle(liechiBattle, confirmInput, createBattleEncounterState());

    expect(liechiBattle.playerMon.statStages.attack).toBe(1);
    expect(liechiBattle.playerMon.heldItemId).toBeNull();
    expect(liechiBattle.playerMon.recycledItemId).toBe('ITEM_LIECHI_BERRY');

    let quickClawMovedFirst = false;
    for (let seed = 0; seed < 100 && !quickClawMovedFirst; seed += 1) {
      const quickClawBattle = createBattleState();
      const quickClawEncounter = createBattleEncounterState();
      quickClawEncounter.rngState = seed;
      quickClawBattle.active = true;
      quickClawBattle.phase = 'moveSelect';
      quickClawBattle.playerMon.speed = 1;
      quickClawBattle.playerMon.heldItemId = 'ITEM_QUICK_CLAW';
      quickClawBattle.wildMon.speed = 99;
      quickClawBattle.moves = [makeDamageMove('HEADBUTT', 'EFFECT_FLINCH_HIT', 'normal', 40, 0, 100)];
      quickClawBattle.playerMon.moves = quickClawBattle.moves;
      quickClawBattle.wildMoves = [makeDamageMove('SCRATCH', 'EFFECT_HIT', 'normal', 40)];
      quickClawBattle.wildMon.moves = quickClawBattle.wildMoves;
      const quickClawHp = quickClawBattle.playerMon.hp;

      stepBattle(quickClawBattle, confirmInput, quickClawEncounter);

      quickClawMovedFirst = quickClawBattle.playerMon.hp === quickClawHp
        && [quickClawBattle.turnSummary, ...quickClawBattle.queuedMessages].includes(`${quickClawBattle.wildMon.species} flinched!`);
    }
    expect(quickClawMovedFirst).toBe(true);
  });

  test('Mimic, Sketch, Mirror Move, Metronome, Assist, and Nature Power dispatch copied moves', () => {
    const mimicBattle = createBattleState();
    mimicBattle.active = true;
    mimicBattle.phase = 'moveSelect';
    mimicBattle.playerMon.speed = 99;
    mimicBattle.wildMon.volatile.lastMoveUsedId = 'TACKLE';
    mimicBattle.wildMoves = [makeDamageMove('TACKLE', 'EFFECT_HIT', 'normal', 40)];
    mimicBattle.wildMon.moves = mimicBattle.wildMoves;
    mimicBattle.moves = [makeStatusMove('MIMIC', 'EFFECT_MIMIC', 'normal')];
    mimicBattle.playerMon.moves = mimicBattle.moves;

    stepBattle(mimicBattle, confirmInput, createBattleEncounterState());

    expect(mimicBattle.playerMon.moves[0]?.id).toBe('TACKLE');
    expect(mimicBattle.playerMon.moves[0]?.ppRemaining).toBe(5);

    const sketchBattle = createBattleState();
    sketchBattle.active = true;
    sketchBattle.phase = 'moveSelect';
    sketchBattle.playerMon.speed = 99;
    sketchBattle.wildMon.volatile.lastPrintedMoveId = 'EMBER';
    sketchBattle.wildMoves = [makeDamageMove('EMBER', 'EFFECT_HIT', 'fire', 40)];
    sketchBattle.wildMon.moves = sketchBattle.wildMoves;
    sketchBattle.moves = [makeStatusMove('SKETCH', 'EFFECT_SKETCH', 'normal')];
    sketchBattle.playerMon.moves = sketchBattle.moves;

    stepBattle(sketchBattle, confirmInput, createBattleEncounterState());

    expect(sketchBattle.playerMon.moves[0]?.id).toBe('EMBER');
    expect(sketchBattle.playerMon.moves[0]?.ppRemaining).toBe(20);

    const mimicAssistBattle = createBattleState();
    mimicAssistBattle.active = true;
    mimicAssistBattle.phase = 'moveSelect';
    mimicAssistBattle.playerMon.speed = 99;
    mimicAssistBattle.wildMon.speed = 1;
    mimicAssistBattle.party[1]!.moves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
    mimicAssistBattle.moves = [makeStatusMove('ASSIST', 'EFFECT_ASSIST', 'normal')];
    mimicAssistBattle.playerMon.moves = mimicAssistBattle.moves;
    mimicAssistBattle.wildMoves = [makeStatusMove('MIMIC', 'EFFECT_MIMIC', 'normal')];
    mimicAssistBattle.wildMon.moves = mimicAssistBattle.wildMoves;

    stepBattle(mimicAssistBattle, confirmInput, createBattleEncounterState());

    expect(mimicAssistBattle.wildMon.moves[0]?.id).toBe('ASSIST');

    const sketchAssistBattle = createBattleState();
    sketchAssistBattle.active = true;
    sketchAssistBattle.phase = 'moveSelect';
    sketchAssistBattle.playerMon.speed = 99;
    sketchAssistBattle.wildMon.volatile.lastMoveUsedId = 'ASSIST';
    sketchAssistBattle.wildMon.volatile.lastPrintedMoveId = 'SPLASH';
    sketchAssistBattle.wildMoves = [makeStatusMove('ASSIST', 'EFFECT_ASSIST', 'normal')];
    sketchAssistBattle.wildMon.moves = sketchAssistBattle.wildMoves;
    sketchAssistBattle.moves = [makeStatusMove('SKETCH', 'EFFECT_SKETCH', 'normal')];
    sketchAssistBattle.playerMon.moves = sketchAssistBattle.moves;

    stepBattle(sketchAssistBattle, confirmInput, createBattleEncounterState());

    expect(sketchAssistBattle.playerMon.moves[0]?.id).toBe('SPLASH');

    const mirrorBattle = createBattleState();
    mirrorBattle.active = true;
    mirrorBattle.phase = 'moveSelect';
    mirrorBattle.playerMon.speed = 99;
    mirrorBattle.playerMon.volatile.lastTakenMoveId = 'TACKLE';
    mirrorBattle.wildMoves = [makeDamageMove('TACKLE', 'EFFECT_HIT', 'normal', 40)];
    mirrorBattle.wildMon.moves = mirrorBattle.wildMoves;
    mirrorBattle.moves = [makeStatusMove('MIRROR_MOVE', 'EFFECT_MIRROR_MOVE', 'flying')];
    mirrorBattle.playerMon.moves = mirrorBattle.moves;
    const mirrorHp = mirrorBattle.wildMon.hp;

    stepBattle(mirrorBattle, confirmInput, createBattleEncounterState());

    expect(mirrorBattle.wildMon.hp).toBeLessThan(mirrorHp);

    const lastTakenMirrorBattle = createBattleState();
    lastTakenMirrorBattle.active = true;
    lastTakenMirrorBattle.phase = 'moveSelect';
    lastTakenMirrorBattle.playerMon.speed = 99;
    lastTakenMirrorBattle.playerMon.volatile.lastTakenMoveId = 'GROWL';
    lastTakenMirrorBattle.wildMon.volatile.lastMoveUsedId = 'TACKLE';
    lastTakenMirrorBattle.wildMoves = [
      makeDamageMove('TACKLE', 'EFFECT_HIT', 'normal', 40),
      makeStatusMove('GROWL', 'EFFECT_ATTACK_DOWN', 'normal')
    ];
    lastTakenMirrorBattle.wildMon.moves = lastTakenMirrorBattle.wildMoves;
    lastTakenMirrorBattle.moves = [makeStatusMove('MIRROR_MOVE', 'EFFECT_MIRROR_MOVE', 'flying')];
    lastTakenMirrorBattle.playerMon.moves = lastTakenMirrorBattle.moves;
    const lastTakenWildHp = lastTakenMirrorBattle.wildMon.hp;

    stepBattle(lastTakenMirrorBattle, confirmInput, createBattleEncounterState());

    expect(lastTakenMirrorBattle.wildMon.hp).toBe(lastTakenWildHp);
    expect(lastTakenMirrorBattle.wildMon.statStages.attack).toBeLessThan(0);

    const mirrorStatusBattle = createBattleState();
    const mirrorStatusEncounter = createBattleEncounterState();
    mirrorStatusBattle.active = true;
    mirrorStatusBattle.phase = 'moveSelect';
    mirrorStatusBattle.playerMon.speed = 1;
    mirrorStatusBattle.wildMon.speed = 99;
    mirrorStatusBattle.moves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
    mirrorStatusBattle.playerMon.moves = mirrorStatusBattle.moves;
    mirrorStatusBattle.wildMoves = [{ ...makeStatusMove('GROWL', 'EFFECT_ATTACK_DOWN', 'normal'), flags: ['FLAG_MIRROR_MOVE_AFFECTED'] }];
    mirrorStatusBattle.wildMon.moves = mirrorStatusBattle.wildMoves;

    stepBattle(mirrorStatusBattle, confirmInput, mirrorStatusEncounter);
    flushScriptMessages(mirrorStatusBattle, mirrorStatusEncounter);

    mirrorStatusBattle.phase = 'moveSelect';
    mirrorStatusBattle.playerMon.speed = 99;
    mirrorStatusBattle.wildMon.speed = 1;
    mirrorStatusBattle.moves = [makeStatusMove('MIRROR_MOVE', 'EFFECT_MIRROR_MOVE', 'flying')];
    mirrorStatusBattle.playerMon.moves = mirrorStatusBattle.moves;
    mirrorStatusBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
    mirrorStatusBattle.wildMon.moves = mirrorStatusBattle.wildMoves;

    stepBattle(mirrorStatusBattle, confirmInput, mirrorStatusEncounter);

    expect(mirrorStatusBattle.wildMon.statStages.attack).toBeLessThan(0);

    const metronomeBattle = createBattleState();
    metronomeBattle.active = true;
    metronomeBattle.phase = 'moveSelect';
    metronomeBattle.playerMon.speed = 99;
    metronomeBattle.moves = [makeStatusMove('METRONOME', 'EFFECT_METRONOME', 'normal')];
    metronomeBattle.playerMon.moves = metronomeBattle.moves;
    metronomeBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    metronomeBattle.wildMon.moves = metronomeBattle.wildMoves;

    stepBattle(metronomeBattle, confirmInput, createBattleEncounterState());

    expect([metronomeBattle.turnSummary, ...metronomeBattle.queuedMessages].filter((message) => message.includes('used')).length).toBeGreaterThanOrEqual(2);

    const assistBattle = createBattleState();
    assistBattle.active = true;
    assistBattle.phase = 'moveSelect';
    assistBattle.playerMon.speed = 99;
    assistBattle.party[1]!.moves = [makeDamageMove('TACKLE', 'EFFECT_HIT', 'normal', 40)];
    assistBattle.moves = [makeStatusMove('ASSIST', 'EFFECT_ASSIST', 'normal')];
    assistBattle.playerMon.moves = assistBattle.moves;
    assistBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    assistBattle.wildMon.moves = assistBattle.wildMoves;
    const assistHp = assistBattle.wildMon.hp;

    stepBattle(assistBattle, confirmInput, createBattleEncounterState());

    expect(assistBattle.wildMon.hp).toBeLessThan(assistHp);

    const assistUproarBattle = createBattleState();
    assistUproarBattle.active = true;
    assistUproarBattle.phase = 'moveSelect';
    assistUproarBattle.playerMon.speed = 99;
    assistUproarBattle.party[1]!.moves = [makeDamageMove('UPROAR', 'EFFECT_UPROAR', 'normal', 50)];
    assistUproarBattle.moves = [makeStatusMove('ASSIST', 'EFFECT_ASSIST', 'normal')];
    assistUproarBattle.playerMon.moves = assistUproarBattle.moves;
    assistUproarBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
    assistUproarBattle.wildMon.moves = assistUproarBattle.wildMoves;

    stepBattle(assistUproarBattle, confirmInput, createBattleEncounterState());

    expect(assistUproarBattle.playerMon.volatile.uproarMoveId).toBe('UPROAR');

    const assistSolarBattle = createBattleState();
    assistSolarBattle.active = true;
    assistSolarBattle.phase = 'moveSelect';
    assistSolarBattle.playerMon.speed = 99;
    assistSolarBattle.party[1]!.moves = [makeDamageMove('SOLAR_BEAM', 'EFFECT_SOLAR_BEAM', 'grass', 120)];
    assistSolarBattle.moves = [makeStatusMove('ASSIST', 'EFFECT_ASSIST', 'normal')];
    assistSolarBattle.playerMon.moves = assistSolarBattle.moves;
    assistSolarBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
    assistSolarBattle.wildMon.moves = assistSolarBattle.wildMoves;

    stepBattle(assistSolarBattle, confirmInput, createBattleEncounterState());

    expect(assistSolarBattle.playerMon.volatile.chargingMoveId).toBe('SOLAR_BEAM');

    const natureBattle = createBattleState();
    natureBattle.active = true;
    natureBattle.phase = 'moveSelect';
    natureBattle.playerMon.speed = 99;
    natureBattle.terrain = 'BATTLE_TERRAIN_SAND';
    natureBattle.wildMon.types = ['normal'];
    natureBattle.moves = [makeStatusMove('NATURE_POWER', 'EFFECT_NATURE_POWER', 'normal')];
    natureBattle.playerMon.moves = natureBattle.moves;
    natureBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    natureBattle.wildMon.moves = natureBattle.wildMoves;
    const natureHp = natureBattle.wildMon.hp;

    stepBattle(natureBattle, confirmInput, createBattleEncounterState());

    expect(natureBattle.wildMon.hp).toBeLessThan(natureHp);
    expect([natureBattle.turnSummary, ...natureBattle.queuedMessages]).toContain('Nature Power turned into EARTHQUAKE!');
  });

  test('Role Play and Skill Swap update ability state', () => {
    const roleBattle = createBattleState();
    roleBattle.active = true;
    roleBattle.phase = 'moveSelect';
    roleBattle.playerMon.speed = 99;
    roleBattle.playerMon.abilityId = 'BLAZE';
    roleBattle.wildMon.abilityId = 'KEEN_EYE';
    roleBattle.moves = [makeStatusMove('ROLE_PLAY', 'EFFECT_ROLE_PLAY', 'psychic')];
    roleBattle.playerMon.moves = roleBattle.moves;
    roleBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    roleBattle.wildMon.moves = roleBattle.wildMoves;

    stepBattle(roleBattle, confirmInput, createBattleEncounterState());

    expect(roleBattle.playerMon.abilityId).toBe('KEEN_EYE');

    const swapBattle = createBattleState();
    swapBattle.active = true;
    swapBattle.phase = 'moveSelect';
    swapBattle.playerMon.speed = 99;
    swapBattle.playerMon.abilityId = 'BLAZE';
    swapBattle.wildMon.abilityId = 'KEEN_EYE';
    swapBattle.moves = [makeStatusMove('SKILL_SWAP', 'EFFECT_SKILL_SWAP', 'psychic')];
    swapBattle.playerMon.moves = swapBattle.moves;
    swapBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    swapBattle.wildMon.moves = swapBattle.wildMoves;

    stepBattle(swapBattle, confirmInput, createBattleEncounterState());

    expect(swapBattle.playerMon.abilityId).toBe('KEEN_EYE');
    expect(swapBattle.wildMon.abilityId).toBe('BLAZE');
  });

  test('species snapshots seed decomp abilities and common abilities affect damage and status', () => {
    const seeded = createBattleState();
    expect(seeded.playerMon.abilityId).toBe('BLAZE');
    expect(seeded.wildMon.abilityId).toBe('KEEN_EYE');

    const blazeBase = createBattleState();
    const blazeBoosted = createBattleState();
    for (const battle of [blazeBase, blazeBoosted]) {
      battle.active = true;
      battle.phase = 'moveSelect';
      battle.playerMon.speed = 99;
      battle.playerMon.abilityId = 'BLAZE';
      battle.moves = [makeDamageMove('EMBER', 'EFFECT_HIT', 'fire', 40)];
      battle.playerMon.moves = battle.moves;
      battle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
      battle.wildMon.moves = battle.wildMoves;
    }
    blazeBoosted.playerMon.hp = Math.floor(blazeBoosted.playerMon.maxHp / 3);

    stepBattle(blazeBase, confirmInput, createBattleEncounterState());
    stepBattle(blazeBoosted, confirmInput, createBattleEncounterState());

    expect(blazeBoosted.wildMon.maxHp - blazeBoosted.wildMon.hp).toBeGreaterThan(blazeBase.wildMon.maxHp - blazeBase.wildMon.hp);

    const levitateBattle = createBattleState();
    levitateBattle.active = true;
    levitateBattle.phase = 'moveSelect';
    levitateBattle.playerMon.speed = 99;
    levitateBattle.wildMon.abilityId = 'LEVITATE';
    levitateBattle.wildMon.types = ['normal'];
    levitateBattle.moves = [makeDamageMove('EARTHQUAKE', 'EFFECT_EARTHQUAKE', 'ground', 100)];
    levitateBattle.playerMon.moves = levitateBattle.moves;

    stepBattle(levitateBattle, confirmInput, createBattleEncounterState());

    expect(levitateBattle.wildMon.hp).toBe(levitateBattle.wildMon.maxHp);
    expect([levitateBattle.turnSummary, ...levitateBattle.queuedMessages].some((message) => message.includes("doesn't affect"))).toBe(true);

    const thickFatBase = createBattleState();
    const thickFatBattle = createBattleState();
    for (const battle of [thickFatBase, thickFatBattle]) {
      battle.active = true;
      battle.phase = 'moveSelect';
      battle.playerMon.speed = 99;
      battle.wildMon.types = ['normal'];
      battle.moves = [makeDamageMove('EMBER', 'EFFECT_HIT', 'fire', 40)];
      battle.playerMon.moves = battle.moves;
      battle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
      battle.wildMon.moves = battle.wildMoves;
    }
    thickFatBattle.wildMon.abilityId = 'THICK_FAT';

    stepBattle(thickFatBase, confirmInput, createBattleEncounterState());
    stepBattle(thickFatBattle, confirmInput, createBattleEncounterState());

    expect(thickFatBattle.wildMon.maxHp - thickFatBattle.wildMon.hp).toBeLessThan(thickFatBase.wildMon.maxHp - thickFatBase.wildMon.hp);

    const sleepImmune = createBattleState();
    sleepImmune.active = true;
    sleepImmune.phase = 'moveSelect';
    sleepImmune.playerMon.speed = 99;
    sleepImmune.wildMon.abilityId = 'INSOMNIA';
    sleepImmune.moves = [makeStatusMove('SLEEP_POWDER', 'EFFECT_SLEEP', 'grass')];
    sleepImmune.playerMon.moves = sleepImmune.moves;

    stepBattle(sleepImmune, confirmInput, createBattleEncounterState());

    expect(sleepImmune.wildMon.status).toBe('none');

    const shieldDust = createBattleState();
    shieldDust.active = true;
    shieldDust.phase = 'moveSelect';
    shieldDust.playerMon.speed = 99;
    shieldDust.wildMon.abilityId = 'SHIELD_DUST';
    shieldDust.moves = [makeDamageMove('BUBBLE', 'EFFECT_SPEED_DOWN_HIT', 'water', 20, 100, 100)];
    shieldDust.playerMon.moves = shieldDust.moves;

    stepBattle(shieldDust, confirmInput, createBattleEncounterState());

    expect(shieldDust.wildMon.hp).toBeLessThan(shieldDust.wildMon.maxHp);
    expect(shieldDust.wildMon.statStages.speed).toBe(0);
  });

  test('Wonder Guard, Sturdy, absorbing abilities, Flash Fire, and Soundproof gate move effects', () => {
    const wonderBattle = createBattleState();
    wonderBattle.active = true;
    wonderBattle.phase = 'moveSelect';
    wonderBattle.playerMon.speed = 99;
    wonderBattle.wildMon.abilityId = 'WONDER_GUARD';
    wonderBattle.wildMon.types = ['normal'];
    wonderBattle.moves = [makeDamageMove('EMBER', 'EFFECT_HIT', 'fire', 40)];
    wonderBattle.playerMon.moves = wonderBattle.moves;

    stepBattle(wonderBattle, confirmInput, createBattleEncounterState());

    expect(wonderBattle.wildMon.hp).toBe(wonderBattle.wildMon.maxHp);

    const sturdyBattle = createBattleState();
    sturdyBattle.active = true;
    sturdyBattle.phase = 'moveSelect';
    sturdyBattle.playerMon.speed = 99;
    sturdyBattle.playerMon.level = 10;
    sturdyBattle.wildMon.level = 3;
    sturdyBattle.wildMon.abilityId = 'STURDY';
    sturdyBattle.moves = [makeDamageMove('SHEER_COLD', 'EFFECT_OHKO', 'ice', 1, 100)];
    sturdyBattle.playerMon.moves = sturdyBattle.moves;

    stepBattle(sturdyBattle, confirmInput, createBattleEncounterState());

    expect(sturdyBattle.wildMon.hp).toBe(sturdyBattle.wildMon.maxHp);

    const absorbBattle = createBattleState();
    absorbBattle.active = true;
    absorbBattle.phase = 'moveSelect';
    absorbBattle.playerMon.speed = 99;
    absorbBattle.wildMon.abilityId = 'WATER_ABSORB';
    absorbBattle.wildMon.hp = Math.max(1, absorbBattle.wildMon.maxHp - 5);
    absorbBattle.moves = [makeDamageMove('WATER_GUN', 'EFFECT_HIT', 'water', 40)];
    absorbBattle.playerMon.moves = absorbBattle.moves;

    stepBattle(absorbBattle, confirmInput, createBattleEncounterState());

    expect(absorbBattle.wildMon.hp).toBeGreaterThan(absorbBattle.wildMon.maxHp - 5);

    const flashFireBattle = createBattleState();
    flashFireBattle.active = true;
    flashFireBattle.phase = 'moveSelect';
    flashFireBattle.playerMon.speed = 99;
    flashFireBattle.wildMon.abilityId = 'FLASH_FIRE';
    flashFireBattle.moves = [makeDamageMove('EMBER', 'EFFECT_HIT', 'fire', 40)];
    flashFireBattle.playerMon.moves = flashFireBattle.moves;

    stepBattle(flashFireBattle, confirmInput, createBattleEncounterState());

    expect(flashFireBattle.wildMon.hp).toBe(flashFireBattle.wildMon.maxHp);
    expect(flashFireBattle.wildMon.volatile.flashFire).toBe(true);

    const soundproofBattle = createBattleState();
    soundproofBattle.active = true;
    soundproofBattle.phase = 'moveSelect';
    soundproofBattle.playerMon.speed = 99;
    soundproofBattle.wildMon.abilityId = 'SOUNDPROOF';
    soundproofBattle.moves = [makeStatusMove('GROWL', 'EFFECT_ATTACK_DOWN', 'normal')];
    soundproofBattle.playerMon.moves = soundproofBattle.moves;

    stepBattle(soundproofBattle, confirmInput, createBattleEncounterState());

    expect(soundproofBattle.wildMon.statStages.attack).toBe(0);
  });

  test('Baton Pass transfers selected battle state to a bench switch-in', () => {
    const battle = createBattleState();
    battle.active = true;
    battle.phase = 'moveSelect';
    battle.playerMon.speed = 99;
    battle.playerMon.statStages.attack = 3;
    battle.playerMon.statStages.evasion = 2;
    battle.playerMon.volatile.substituteHp = 4;
    battle.playerMon.volatile.focusEnergy = true;
    battle.playerMon.volatile.cursed = true;
    battle.playerMon.volatile.perishTurns = 2;
    battle.playerMon.volatile.lockOnBy = 'opponent';
    battle.playerMon.volatile.lockOnTurns = 2;
    battle.playerMon.volatile.escapePreventedBy = 'opponent';
    battle.playerMon.volatile.rooted = true;
    battle.party[1]!.hp = battle.party[1]!.maxHp;
    battle.moves = [makeStatusMove('BATON_PASS', 'EFFECT_BATON_PASS', 'normal')];
    battle.playerMon.moves = battle.moves;
    battle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    battle.wildMon.moves = battle.wildMoves;

    stepBattle(battle, confirmInput, createBattleEncounterState());

    expect(battle.playerMon).toBe(battle.party[1]);
    expect(battle.playerMon.statStages.attack).toBe(3);
    expect(battle.playerMon.statStages.evasion).toBe(2);
    expect(battle.playerMon.volatile.substituteHp).toBe(4);
    expect(battle.playerMon.volatile.focusEnergy).toBe(true);
    expect(battle.playerMon.volatile.cursed).toBe(true);
    expect(battle.playerMon.volatile.perishTurns).toBe(1);
    expect(battle.playerMon.volatile.lockOnBy).toBe('opponent');
    expect(battle.playerMon.volatile.lockOnTurns).toBe(1);
    expect(battle.playerMon.volatile.escapePreventedBy).toBe('opponent');
    expect(battle.playerMon.volatile.rooted).toBe(true);
  });

  test('Pursuit intercepts voluntary switches before the replacement enters', () => {
    const battle = createBattleState();
    battle.active = true;
    battle.phase = 'partySelect';
    battle.selectedPartyIndex = 1;
    battle.playerMon.hp = battle.playerMon.maxHp;
    battle.wildMon.speed = 99;
    battle.wildMoves = [makeDamageMove('PURSUIT', 'EFFECT_PURSUIT', 'dark', 40, 100)];
    battle.wildMon.moves = battle.wildMoves;
    const previous = battle.playerMon;
    const previousHp = previous.hp;

    stepBattle(battle, confirmInput, createBattleEncounterState());

    expect(previous.hp).toBeLessThan(previousHp);
    expect(battle.playerMon).toBe(battle.party[1]);
    expect([battle.turnSummary, ...battle.queuedMessages]).toContain(`Foe ${battle.wildMon.species} used PURSUIT!`);
  });

  test('Beat Up iterates healthy unstatued party members for multi-hit damage', () => {
    const battle = createBattleState();
    battle.active = true;
    battle.phase = 'moveSelect';
    battle.playerMon.speed = 99;
    battle.wildMon.maxHp = 200;
    battle.wildMon.hp = 200;
    battle.wildMon.types = ['normal'];
    battle.party[0]!.status = 'none';
    battle.party[1]!.status = 'none';
    battle.moves = [makeDamageMove('BEAT_UP', 'EFFECT_BEAT_UP', 'dark', 10, 100)];
    battle.playerMon.moves = battle.moves;
    battle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    battle.wildMon.moves = battle.wildMoves;

    stepBattle(battle, confirmInput, createBattleEncounterState());

    expect(battle.wildMon.hp).toBeLessThan(200);
    expect([battle.turnSummary, ...battle.queuedMessages]).toContain('Hit 2 times!');
  });

  test('Magic Coat bounces status, Snatch steals self moves, and Imprison blocks shared moves', () => {
    const coatBattle = createBattleState();
    coatBattle.active = true;
    coatBattle.phase = 'moveSelect';
    coatBattle.playerMon.speed = 99;
    coatBattle.wildMon.speed = 1;
    coatBattle.moves = [makeStatusMove('MAGIC_COAT', 'EFFECT_MAGIC_COAT', 'psychic')];
    coatBattle.playerMon.moves = coatBattle.moves;
    coatBattle.wildMoves = [makeStatusMove('SLEEP_POWDER', 'EFFECT_SLEEP', 'grass')];
    coatBattle.wildMon.moves = coatBattle.wildMoves;

    stepBattle(coatBattle, confirmInput, createBattleEncounterState());

    expect(coatBattle.playerMon.status).toBe('none');
    expect(coatBattle.wildMon.status).toBe('sleep');

    const snatchBattle = createBattleState();
    snatchBattle.active = true;
    snatchBattle.phase = 'moveSelect';
    snatchBattle.playerMon.speed = 99;
    snatchBattle.wildMon.speed = 1;
    snatchBattle.playerMon.hp = 5;
    snatchBattle.wildMon.hp = 5;
    snatchBattle.moves = [makeStatusMove('SNATCH', 'EFFECT_SNATCH', 'dark')];
    snatchBattle.playerMon.moves = snatchBattle.moves;
    snatchBattle.wildMoves = [makeStatusMove('RECOVER', 'EFFECT_RESTORE_HP', 'normal')];
    snatchBattle.wildMon.moves = snatchBattle.wildMoves;

    stepBattle(snatchBattle, confirmInput, createBattleEncounterState());

    expect(snatchBattle.playerMon.hp).toBeGreaterThan(5);
    expect(snatchBattle.wildMon.hp).toBe(5);

    const imprisonBattle = createBattleState();
    imprisonBattle.active = true;
    imprisonBattle.phase = 'moveSelect';
    imprisonBattle.playerMon.speed = 99;
    imprisonBattle.wildMon.speed = 1;
    imprisonBattle.moves = [
      makeStatusMove('IMPRISON', 'EFFECT_IMPRISON', 'psychic'),
      makeDamageMove('TACKLE', 'EFFECT_HIT', 'normal', 40)
    ];
    imprisonBattle.playerMon.moves = imprisonBattle.moves;
    imprisonBattle.wildMoves = [makeDamageMove('TACKLE', 'EFFECT_HIT', 'normal', 40)];
    imprisonBattle.wildMon.moves = imprisonBattle.wildMoves;
    const wildHp = imprisonBattle.wildMon.hp;

    stepBattle(imprisonBattle, confirmInput, createBattleEncounterState());

    expect(imprisonBattle.playerMon.volatile.imprisoning).toBe(true);
    expect(imprisonBattle.wildMon.hp).toBe(wildHp);
    expect([imprisonBattle.turnSummary, ...imprisonBattle.queuedMessages]).toContain(`${imprisonBattle.wildMon.species} can't use the sealed TACKLE!`);
  });

  test('Follow Me succeeds in singles while Helping Hand fails without a partner', () => {
    const followBattle = createBattleState();
    followBattle.active = true;
    followBattle.phase = 'moveSelect';
    followBattle.playerMon.speed = 99;
    followBattle.moves = [makeStatusMove('FOLLOW_ME', 'EFFECT_FOLLOW_ME', 'normal')];
    followBattle.playerMon.moves = followBattle.moves;
    followBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    followBattle.wildMon.moves = followBattle.wildMoves;

    stepBattle(followBattle, confirmInput, createBattleEncounterState());

    expect(followBattle.playerMon.volatile.followMe).toBe(false);
    expect([followBattle.turnSummary, ...followBattle.queuedMessages]).toContain(`${followBattle.playerMon.species} became the center of attention!`);

    const helpingBattle = createBattleState();
    helpingBattle.active = true;
    helpingBattle.phase = 'moveSelect';
    helpingBattle.playerMon.speed = 99;
    helpingBattle.moves = [makeStatusMove('HELPING_HAND', 'EFFECT_HELPING_HAND', 'normal')];
    helpingBattle.playerMon.moves = helpingBattle.moves;
    helpingBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    helpingBattle.wildMon.moves = helpingBattle.wildMoves;

    stepBattle(helpingBattle, confirmInput, createBattleEncounterState());

    expect([helpingBattle.turnSummary, ...helpingBattle.queuedMessages]).toContain('But it failed!');
  });

  test('Follow Me redirects single-target attacks in doubles', () => {
    const battle = createBattleState({
      format: 'doubles',
      playerParty: [
        { species: 'BULBASAUR', level: 18, expProgress: 0, maxHp: 42, hp: 42, attack: 20, defense: 20, speed: 24, spAttack: 24, spDefense: 24, catchRate: 45, types: ['grass', 'poison'], status: 'none' },
        { species: 'CHARMANDER', level: 18, expProgress: 0, maxHp: 39, hp: 39, attack: 22, defense: 18, speed: 20, spAttack: 24, spDefense: 20, catchRate: 45, types: ['fire'], status: 'none' }
      ],
      opponentParty: [
        { species: 'RATTATA', level: 18, expProgress: 0, maxHp: 36, hp: 36, attack: 18, defense: 14, speed: 10, spAttack: 12, spDefense: 12, catchRate: 255, types: ['normal'], status: 'none' },
        { species: 'SPEAROW', level: 18, expProgress: 0, maxHp: 37, hp: 37, attack: 18, defense: 14, speed: 30, spAttack: 12, spDefense: 12, catchRate: 255, types: ['normal', 'flying'], status: 'none' }
      ]
    });
    battle.active = true;
    battle.phase = 'moveSelect';
    battle.moves = [makeDamageMove('TACKLE', 'EFFECT_HIT', 'normal', 40)];
    battle.playerMon.moves = battle.moves;
    battle.playerSide.party[1]!.moves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
    battle.opponentSide.party[0]!.moves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
    battle.opponentSide.party[1]!.moves = [{ ...makeStatusMove('FOLLOW_ME', 'EFFECT_FOLLOW_ME', 'normal'), target: 'MOVE_TARGET_USER', priority: 3 }];

    stepBattle(battle, confirmInput, createBattleEncounterState());

    expect(battle.opponentSide.party[0]!.hp).toBe(36);
    expect(battle.opponentSide.party[1]!.hp).toBeLessThan(37);
    expect([battle.turnSummary, ...battle.queuedMessages]).toContain('SPEAROW became the center of attention!');
  });

  test('Helping Hand boosts an ally attack in doubles', () => {
    const createHelpingBattle = (allyMove: BattleMove) => {
      const battle = createBattleState({
        format: 'doubles',
        playerParty: [
          { species: 'BULBASAUR', level: 18, expProgress: 0, maxHp: 42, hp: 42, attack: 20, defense: 20, speed: 24, spAttack: 24, spDefense: 24, catchRate: 45, types: ['grass', 'poison'], status: 'none' },
          { species: 'PIKACHU', level: 18, expProgress: 0, maxHp: 38, hp: 38, attack: 22, defense: 16, speed: 36, spAttack: 26, spDefense: 20, catchRate: 190, types: ['electric'], status: 'none' }
        ],
        opponentParty: [
          { species: 'RATTATA', level: 18, expProgress: 0, maxHp: 40, hp: 40, attack: 18, defense: 14, speed: 10, spAttack: 12, spDefense: 12, catchRate: 255, types: ['normal'], status: 'none' },
          { species: 'EKANS', level: 18, expProgress: 0, maxHp: 39, hp: 39, attack: 18, defense: 14, speed: 10, spAttack: 12, spDefense: 12, catchRate: 255, types: ['poison'], status: 'none' }
        ]
      });
      battle.active = true;
      battle.phase = 'moveSelect';
      battle.moves = [makeDamageMove('TACKLE', 'EFFECT_HIT', 'normal', 40)];
      battle.playerMon.moves = battle.moves;
      battle.playerSide.party[1]!.moves = [allyMove];
      battle.opponentSide.party[0]!.moves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
      battle.opponentSide.party[1]!.moves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
      return battle;
    };

    const helpBattle = createHelpingBattle({
      ...makeStatusMove('HELPING_HAND', 'EFFECT_HELPING_HAND', 'normal'),
      target: 'MOVE_TARGET_USER',
      priority: 5
    });
    const plainBattle = createHelpingBattle(makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal'));

    stepBattle(helpBattle, confirmInput, createBattleEncounterState());
    stepBattle(plainBattle, confirmInput, createBattleEncounterState());

    expect(helpBattle.opponentSide.party[0]!.hp).toBeLessThan(plainBattle.opponentSide.party[0]!.hp);
    expect([helpBattle.turnSummary, ...helpBattle.queuedMessages]).toContain('PIKACHU is ready to help BULBASAUR!');
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

  test('Counter and Mirror Coat return double last physical or special damage', () => {
    const counterBattle = createBattleState();
    counterBattle.active = true;
    counterBattle.phase = 'moveSelect';
    counterBattle.playerMon.speed = 1;
    counterBattle.wildMon.speed = 99;
    counterBattle.wildMon.types = ['normal'];
    counterBattle.moves = [makeStatusMove('COUNTER', 'EFFECT_COUNTER', 'fighting')];
    counterBattle.playerMon.moves = counterBattle.moves;
    counterBattle.wildMoves = [makeDamageMove('TACKLE', 'EFFECT_HIT', 'normal', 40)];
    counterBattle.wildMon.moves = counterBattle.wildMoves;

    stepBattle(counterBattle, confirmInput, createBattleEncounterState());

    expect(counterBattle.playerMon.volatile.lastDamageCategory).toBe('physical');
    expect(counterBattle.wildMon.maxHp - counterBattle.wildMon.hp).toBe(counterBattle.playerMon.volatile.lastDamageTaken * 2);

    const mirrorBattle = createBattleState();
    mirrorBattle.active = true;
    mirrorBattle.phase = 'moveSelect';
    mirrorBattle.playerMon.speed = 1;
    mirrorBattle.wildMon.speed = 99;
    mirrorBattle.wildMon.types = ['normal'];
    mirrorBattle.moves = [makeStatusMove('MIRROR_COAT', 'EFFECT_MIRROR_COAT', 'psychic')];
    mirrorBattle.playerMon.moves = mirrorBattle.moves;
    mirrorBattle.wildMoves = [makeDamageMove('EMBER', 'EFFECT_HIT', 'fire', 40)];
    mirrorBattle.wildMon.moves = mirrorBattle.wildMoves;

    stepBattle(mirrorBattle, confirmInput, createBattleEncounterState());

    expect(mirrorBattle.playerMon.volatile.lastDamageCategory).toBe('special');
    expect(mirrorBattle.wildMon.maxHp - mirrorBattle.wildMon.hp).toBe(mirrorBattle.playerMon.volatile.lastDamageTaken * 2);
  });

  test('Disable and Encore use the target last-used move state', () => {
    const disableBattle = createBattleState();
    disableBattle.active = true;
    disableBattle.phase = 'moveSelect';
    disableBattle.playerMon.speed = 1;
    disableBattle.wildMon.speed = 99;
    const growl = makeStatusMove('GROWL', 'EFFECT_ATTACK_DOWN', 'normal');
    disableBattle.moves = [growl];
    disableBattle.playerMon.moves = disableBattle.moves;
    disableBattle.playerMon.volatile.lastMoveUsedId = 'GROWL';
    disableBattle.wildMoves = [makeStatusMove('DISABLE', 'EFFECT_DISABLE', 'normal')];
    disableBattle.wildMon.moves = disableBattle.wildMoves;

    stepBattle(disableBattle, confirmInput, createBattleEncounterState());

    expect(disableBattle.playerMon.volatile.disabledMoveId).toBe('GROWL');
    expect(disableBattle.wildMon.statStages.attack).toBe(0);
    expect([disableBattle.turnSummary, ...disableBattle.queuedMessages]).toContain(`${disableBattle.playerMon.species}'s GROWL is disabled!`);

    const disableAssistBattle = createBattleState();
    disableAssistBattle.active = true;
    disableAssistBattle.phase = 'moveSelect';
    disableAssistBattle.playerMon.speed = 99;
    disableAssistBattle.wildMon.speed = 1;
    disableAssistBattle.party[1]!.moves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
    disableAssistBattle.moves = [makeStatusMove('ASSIST', 'EFFECT_ASSIST', 'normal')];
    disableAssistBattle.playerMon.moves = disableAssistBattle.moves;
    disableAssistBattle.wildMoves = [makeStatusMove('DISABLE', 'EFFECT_DISABLE', 'normal')];
    disableAssistBattle.wildMon.moves = disableAssistBattle.wildMoves;

    stepBattle(disableAssistBattle, confirmInput, createBattleEncounterState());

    expect(disableAssistBattle.playerMon.volatile.disabledMoveId).toBe('ASSIST');

    const encoreBattle = createBattleState();
    const encoreEncounter = createBattleEncounterState();
    encoreBattle.active = true;
    encoreBattle.phase = 'moveSelect';
    encoreBattle.playerMon.speed = 1;
    encoreBattle.wildMon.speed = 99;
    const scratch = makeDamageMove('SCRATCH', 'EFFECT_HIT', 'normal', 40);
    encoreBattle.moves = [scratch, makeStatusMove('GROWL', 'EFFECT_ATTACK_DOWN', 'normal')];
    encoreBattle.playerMon.moves = encoreBattle.moves;
    encoreBattle.selectedMoveIndex = 1;
    encoreBattle.playerMon.volatile.lastMoveUsedId = 'SCRATCH';
    encoreBattle.wildMoves = [makeStatusMove('ENCORE', 'EFFECT_ENCORE', 'normal')];
    encoreBattle.wildMon.moves = encoreBattle.wildMoves;

    stepBattle(encoreBattle, confirmInput, encoreEncounter);
    expect(encoreBattle.playerMon.volatile.encoreMoveId).toBe('SCRATCH');

    flushScriptMessages(encoreBattle, encoreEncounter);
    stepBattle(encoreBattle, confirmInput, encoreEncounter);
    stepBattle(encoreBattle, confirmInput, encoreEncounter);
    expect(encoreBattle.phase).toBe('moveSelect');
    expect(encoreBattle.turnSummary).toContain('must use SCRATCH');

    encoreBattle.selectedMoveIndex = 0;
    const wildHp = encoreBattle.wildMon.hp;
    stepBattle(encoreBattle, confirmInput, encoreEncounter);

    expect(encoreBattle.wildMon.hp).toBeLessThan(wildHp);
  });

  test('Transform copies target battle data and Ingrain heals while preventing escape', () => {
    const transformBattle = createBattleState();
    transformBattle.active = true;
    transformBattle.phase = 'moveSelect';
    transformBattle.playerMon.speed = 99;
    transformBattle.wildMon.species = 'ONIX';
    transformBattle.wildMon.attack = 44;
    transformBattle.wildMon.defense = 88;
    transformBattle.wildMon.abilityId = 'ROCK_HEAD';
    transformBattle.wildMon.types = ['rock', 'ground'];
    transformBattle.wildMoves = [makeDamageMove('ROCK_THROW', 'EFFECT_HIT', 'rock', 50)];
    transformBattle.wildMon.moves = transformBattle.wildMoves;
    transformBattle.moves = [makeStatusMove('TRANSFORM', 'EFFECT_TRANSFORM', 'normal')];
    transformBattle.playerMon.moves = transformBattle.moves;

    stepBattle(transformBattle, confirmInput, createBattleEncounterState());

    expect(transformBattle.playerMon.species).toBe('ONIX');
    expect(transformBattle.playerMon.attack).toBe(44);
    expect(transformBattle.playerMon.defense).toBe(88);
    expect(transformBattle.playerMon.abilityId).toBe('ROCK_HEAD');
    expect(transformBattle.playerMon.types).toEqual(['rock', 'ground']);
    expect(transformBattle.playerMon.moves[0]?.id).toBe('ROCK_THROW');
    expect(transformBattle.playerMon.moves[0]?.ppRemaining).toBe(5);
    expect([transformBattle.turnSummary, ...transformBattle.queuedMessages]).toContain('CHARMANDER transformed into ONIX!');

    const substituteTargetBattle = createBattleState();
    substituteTargetBattle.active = true;
    substituteTargetBattle.phase = 'moveSelect';
    substituteTargetBattle.playerMon.speed = 99;
    substituteTargetBattle.wildMon.species = 'ONIX';
    substituteTargetBattle.wildMon.volatile.substituteHp = 10;
    substituteTargetBattle.moves = [makeStatusMove('TRANSFORM', 'EFFECT_TRANSFORM', 'normal')];
    substituteTargetBattle.playerMon.moves = substituteTargetBattle.moves;
    substituteTargetBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
    substituteTargetBattle.wildMon.moves = substituteTargetBattle.wildMoves;

    stepBattle(substituteTargetBattle, confirmInput, createBattleEncounterState());

    expect(substituteTargetBattle.playerMon.species).toBe('ONIX');

    const transformedTargetBattle = createBattleState();
    transformedTargetBattle.active = true;
    transformedTargetBattle.phase = 'moveSelect';
    transformedTargetBattle.playerMon.speed = 99;
    transformedTargetBattle.wildMon.volatile.transformed = true;
    transformedTargetBattle.moves = [makeStatusMove('TRANSFORM', 'EFFECT_TRANSFORM', 'normal')];
    transformedTargetBattle.playerMon.moves = transformedTargetBattle.moves;
    transformedTargetBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
    transformedTargetBattle.wildMon.moves = transformedTargetBattle.wildMoves;

    stepBattle(transformedTargetBattle, confirmInput, createBattleEncounterState());

    expect(transformedTargetBattle.playerMon.species).toBe('CHARMANDER');
    expect([transformedTargetBattle.turnSummary, ...transformedTargetBattle.queuedMessages]).toContain('But it failed!');

    const ingrainBattle = createBattleState();
    ingrainBattle.active = true;
    ingrainBattle.phase = 'moveSelect';
    ingrainBattle.playerMon.speed = 99;
    ingrainBattle.playerMon.hp = 10;
    ingrainBattle.moves = [makeStatusMove('INGRAIN', 'EFFECT_INGRAIN', 'grass')];
    ingrainBattle.playerMon.moves = ingrainBattle.moves;
    ingrainBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    ingrainBattle.wildMon.moves = ingrainBattle.wildMoves;

    stepBattle(ingrainBattle, confirmInput, createBattleEncounterState());

    expect(ingrainBattle.playerMon.volatile.rooted).toBe(true);
    expect(ingrainBattle.playerMon.hp).toBe(11);
  });

  test('Mean Look prevents running and Teleport/Roar can end wild battles', () => {
    const meanLookBattle = createBattleState();
    const meanLookEncounter = createBattleEncounterState();
    meanLookBattle.active = true;
    meanLookBattle.phase = 'moveSelect';
    meanLookBattle.playerMon.speed = 1;
    meanLookBattle.wildMon.speed = 99;
    meanLookBattle.moves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    meanLookBattle.playerMon.moves = meanLookBattle.moves;
    meanLookBattle.wildMoves = [makeStatusMove('MEAN_LOOK', 'EFFECT_MEAN_LOOK', 'normal')];
    meanLookBattle.wildMon.moves = meanLookBattle.wildMoves;

    stepBattle(meanLookBattle, confirmInput, meanLookEncounter);
    expect(meanLookBattle.playerMon.volatile.escapePreventedBy).toBe('opponent');

    flushScriptMessages(meanLookBattle, meanLookEncounter);
    meanLookBattle.selectedCommandIndex = meanLookBattle.commands.findIndex((command) => command === 'run');
    stepBattle(meanLookBattle, confirmInput, meanLookEncounter);
    expect([meanLookBattle.turnSummary, ...meanLookBattle.queuedMessages]).toContain("Can't escape!");

    const teleportBattle = createBattleState();
    const teleportEncounter = createBattleEncounterState();
    teleportBattle.active = true;
    teleportBattle.phase = 'moveSelect';
    teleportBattle.playerMon.speed = 99;
    teleportBattle.moves = [makeStatusMove('TELEPORT', 'EFFECT_TELEPORT', 'psychic')];
    teleportBattle.playerMon.moves = teleportBattle.moves;
    teleportBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    teleportBattle.wildMon.moves = teleportBattle.wildMoves;

    stepBattle(teleportBattle, confirmInput, teleportEncounter);
    flushScriptMessages(teleportBattle, teleportEncounter);
    expect(teleportBattle.phase).toBe('resolved');

    const roarBattle = createBattleState();
    const roarEncounter = createBattleEncounterState();
    roarBattle.active = true;
    roarBattle.phase = 'moveSelect';
    roarBattle.playerMon.speed = 99;
    roarBattle.moves = [makeStatusMove('ROAR', 'EFFECT_ROAR', 'normal')];
    roarBattle.playerMon.moves = roarBattle.moves;
    roarBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    roarBattle.wildMon.moves = roarBattle.wildMoves;

    stepBattle(roarBattle, confirmInput, roarEncounter);
    flushScriptMessages(roarBattle, roarEncounter);
    expect(roarBattle.phase).toBe('resolved');
  });

  test('Snore can be used while asleep and may flinch a pending target', () => {
    const battle = createBattleState();
    battle.active = true;
    battle.phase = 'moveSelect';
    battle.playerMon.speed = 99;
    battle.playerMon.status = 'sleep';
    battle.playerMon.statusTurns = 3;
    battle.moves = [makeDamageMove('SNORE', 'EFFECT_SNORE', 'normal', 40, 0, 100)];
    battle.playerMon.moves = battle.moves;
    battle.wildMoves = [makeDamageMove('TACKLE', 'EFFECT_HIT', 'normal', 40)];
    battle.wildMon.moves = battle.wildMoves;
    const playerHp = battle.playerMon.hp;

    stepBattle(battle, confirmInput, createBattleEncounterState());

    expect(battle.wildMon.hp).toBeLessThan(battle.wildMon.maxHp);
    expect(battle.playerMon.hp).toBe(playerHp);
    expect([battle.turnSummary, ...battle.queuedMessages]).toContain(`${battle.wildMon.species} flinched!`);
  });

  test('Sleep Talk calls a valid known move without waking or spending called-move PP', () => {
    const battle = createBattleState();
    battle.active = true;
    battle.phase = 'moveSelect';
    battle.playerMon.speed = 99;
    battle.playerMon.status = 'sleep';
    battle.playerMon.statusTurns = 3;
    const sleepTalk = makeStatusMove('SLEEP_TALK', 'EFFECT_SLEEP_TALK', 'normal');
    const tackle = makeDamageMove('TACKLE', 'EFFECT_HIT', 'normal', 40);
    battle.moves = [sleepTalk, tackle];
    battle.playerMon.moves = battle.moves;
    battle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
    battle.wildMon.moves = battle.wildMoves;
    const wildHp = battle.wildMon.hp;

    stepBattle(battle, confirmInput, createBattleEncounterState());

    expect(battle.playerMon.status).toBe('sleep');
    expect(battle.playerMon.statusTurns).toBe(3);
    expect(sleepTalk.ppRemaining).toBe(19);
    expect(tackle.ppRemaining).toBe(20);
    expect(battle.wildMon.hp).toBeLessThan(wildHp);
    expect([battle.turnSummary, ...battle.queuedMessages]).toContain(`${battle.playerMon.species} is fast asleep.`);

    const zeroPpBattle = createBattleState();
    zeroPpBattle.active = true;
    zeroPpBattle.phase = 'moveSelect';
    zeroPpBattle.playerMon.speed = 99;
    zeroPpBattle.playerMon.status = 'sleep';
    zeroPpBattle.playerMon.statusTurns = 3;
    const zeroPpSleepTalk = makeStatusMove('SLEEP_TALK', 'EFFECT_SLEEP_TALK', 'normal');
    const zeroPpTackle = makeDamageMove('TACKLE', 'EFFECT_HIT', 'normal', 40);
    zeroPpTackle.ppRemaining = 0;
    zeroPpBattle.moves = [zeroPpSleepTalk, zeroPpTackle];
    zeroPpBattle.playerMon.moves = zeroPpBattle.moves;
    zeroPpBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
    zeroPpBattle.wildMon.moves = zeroPpBattle.wildMoves;
    const zeroPpWildHp = zeroPpBattle.wildMon.hp;

    stepBattle(zeroPpBattle, confirmInput, createBattleEncounterState());

    expect(zeroPpBattle.wildMon.hp).toBeLessThan(zeroPpWildHp);
    expect(zeroPpTackle.ppRemaining).toBe(0);

    const failedBattle = createBattleState();
    failedBattle.active = true;
    failedBattle.phase = 'moveSelect';
    failedBattle.playerMon.speed = 99;
    failedBattle.playerMon.status = 'sleep';
    failedBattle.playerMon.statusTurns = 3;
    failedBattle.moves = [
      makeStatusMove('SLEEP_TALK', 'EFFECT_SLEEP_TALK', 'normal'),
      makeStatusMove('METRONOME', 'EFFECT_METRONOME', 'normal'),
      makeDamageMove('UPROAR', 'EFFECT_UPROAR', 'normal', 50),
      makeDamageMove('SOLAR_BEAM', 'EFFECT_SOLAR_BEAM', 'grass', 120)
    ];
    failedBattle.playerMon.moves = failedBattle.moves;
    failedBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
    failedBattle.wildMon.moves = failedBattle.wildMoves;

    stepBattle(failedBattle, confirmInput, createBattleEncounterState());

    expect([failedBattle.turnSummary, ...failedBattle.queuedMessages]).toContain('But it failed!');

    const tormentFailedBattle = createBattleState();
    tormentFailedBattle.active = true;
    tormentFailedBattle.phase = 'moveSelect';
    tormentFailedBattle.playerMon.speed = 99;
    tormentFailedBattle.playerMon.status = 'sleep';
    tormentFailedBattle.playerMon.statusTurns = 3;
    tormentFailedBattle.playerMon.volatile.tormented = true;
    tormentFailedBattle.playerMon.volatile.lastMoveUsedId = 'TACKLE';
    tormentFailedBattle.moves = [
      makeStatusMove('SLEEP_TALK', 'EFFECT_SLEEP_TALK', 'normal'),
      makeDamageMove('TACKLE', 'EFFECT_HIT', 'normal', 40)
    ];
    tormentFailedBattle.playerMon.moves = tormentFailedBattle.moves;
    tormentFailedBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
    tormentFailedBattle.wildMon.moves = tormentFailedBattle.wildMoves;

    stepBattle(tormentFailedBattle, confirmInput, createBattleEncounterState());

    expect([tormentFailedBattle.turnSummary, ...tormentFailedBattle.queuedMessages]).toContain('But it failed!');
  });

  test('Spite reduces PP on the target last-used move', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();
    encounter.rngState = 0;
    battle.active = true;
    battle.phase = 'moveSelect';
    battle.playerMon.speed = 99;
    const tackle = makeDamageMove('TACKLE', 'EFFECT_HIT', 'normal', 40);
    tackle.ppRemaining = 10;
    battle.wildMoves = [tackle];
    battle.wildMon.moves = battle.wildMoves;
    battle.wildMon.volatile.lastMoveUsedId = 'TACKLE';
    battle.moves = [makeStatusMove('SPITE', 'EFFECT_SPITE', 'ghost')];
    battle.playerMon.moves = battle.moves;

    stepBattle(battle, confirmInput, encounter);

    expect(tackle.ppRemaining).toBeLessThan(10);
    expect(tackle.ppRemaining).toBeGreaterThanOrEqual(5);
  });

  test('Present rolls decomp-style damage or target healing', () => {
    const highDamageBattle = createBattleState();
    const highDamageEncounter = createBattleEncounterState();
    highDamageEncounter.rngState = 1;
    highDamageBattle.active = true;
    highDamageBattle.phase = 'moveSelect';
    highDamageBattle.playerMon.speed = 99;
    highDamageBattle.wildMon.types = ['normal'];
    highDamageBattle.moves = [makeDamageMove('PRESENT', 'EFFECT_PRESENT', 'normal', 1)];
    highDamageBattle.playerMon.moves = highDamageBattle.moves;
    highDamageBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    highDamageBattle.wildMon.moves = highDamageBattle.wildMoves;

    stepBattle(highDamageBattle, confirmInput, highDamageEncounter);

    expect(highDamageBattle.wildMon.hp).toBeLessThan(highDamageBattle.wildMon.maxHp);

    const healBattle = createBattleState();
    const healEncounter = createBattleEncounterState();
    healEncounter.rngState = 5;
    healBattle.active = true;
    healBattle.phase = 'moveSelect';
    healBattle.playerMon.speed = 99;
    healBattle.wildMon.hp = Math.max(1, healBattle.wildMon.maxHp - 5);
    healBattle.moves = [makeDamageMove('PRESENT', 'EFFECT_PRESENT', 'normal', 1)];
    healBattle.playerMon.moves = healBattle.moves;
    healBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    healBattle.wildMon.moves = healBattle.wildMoves;

    stepBattle(healBattle, confirmInput, healEncounter);

    expect(healBattle.wildMon.hp).toBeGreaterThan(healBattle.wildMon.maxHp - 5);
  });

  test('Attract and Torment can cancel a pending move before it resolves', () => {
    const attractBattle = createBattleState();
    const attractEncounter = createBattleEncounterState();
    attractEncounter.rngState = 0;
    attractBattle.active = true;
    attractBattle.phase = 'moveSelect';
    attractBattle.playerMon.speed = 1;
    attractBattle.wildMon.speed = 99;
    attractBattle.moves = [makeDamageMove('SCRATCH', 'EFFECT_HIT', 'normal', 40)];
    attractBattle.playerMon.moves = attractBattle.moves;
    attractBattle.wildMoves = [makeStatusMove('ATTRACT', 'EFFECT_ATTRACT', 'normal')];
    attractBattle.wildMon.moves = attractBattle.wildMoves;
    const wildHp = attractBattle.wildMon.hp;

    stepBattle(attractBattle, confirmInput, attractEncounter);

    expect(attractBattle.playerMon.volatile.infatuatedBy).toBe('opponent');
    expect(attractBattle.wildMon.hp).toBe(wildHp);
    expect([attractBattle.turnSummary, ...attractBattle.queuedMessages]).toContain(`${attractBattle.playerMon.species} is immobilized by love!`);

    const tormentBattle = createBattleState();
    tormentBattle.active = true;
    tormentBattle.phase = 'moveSelect';
    tormentBattle.playerMon.speed = 99;
    tormentBattle.playerMon.volatile.tormented = true;
    tormentBattle.playerMon.volatile.lastMoveUsedId = 'SCRATCH';
    tormentBattle.moves = [makeDamageMove('SCRATCH', 'EFFECT_HIT', 'normal', 40)];
    tormentBattle.playerMon.moves = tormentBattle.moves;
    tormentBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    tormentBattle.wildMon.moves = tormentBattle.wildMoves;
    const tormentedWildHp = tormentBattle.wildMon.hp;

    stepBattle(tormentBattle, confirmInput, createBattleEncounterState());

    expect(tormentBattle.wildMon.hp).toBeLessThan(tormentedWildHp);
    expect([tormentBattle.turnSummary, ...tormentBattle.queuedMessages]).toContain('CHARMANDER is hit with recoil!');
  });

  test('Destiny Bond and Grudge retaliate when their user faints from a move', () => {
    const destinyBattle = createBattleState();
    destinyBattle.active = true;
    destinyBattle.phase = 'moveSelect';
    destinyBattle.playerMon.speed = 1;
    destinyBattle.wildMon.speed = 99;
    destinyBattle.wildMon.hp = 1;
    destinyBattle.moves = [makeDamageMove('SCRATCH', 'EFFECT_HIT', 'normal', 40)];
    destinyBattle.playerMon.moves = destinyBattle.moves;
    destinyBattle.wildMoves = [makeStatusMove('DESTINY_BOND', 'EFFECT_DESTINY_BOND', 'ghost')];
    destinyBattle.wildMon.moves = destinyBattle.wildMoves;

    stepBattle(destinyBattle, confirmInput, createBattleEncounterState());

    expect(destinyBattle.wildMon.hp).toBe(0);
    expect(destinyBattle.playerMon.hp).toBe(0);
    expect([destinyBattle.turnSummary, ...destinyBattle.queuedMessages]).toContain(`${destinyBattle.playerMon.species} was taken down by Destiny Bond!`);

    const grudgeBattle = createBattleState();
    grudgeBattle.active = true;
    grudgeBattle.phase = 'moveSelect';
    grudgeBattle.playerMon.speed = 1;
    grudgeBattle.wildMon.speed = 99;
    grudgeBattle.wildMon.hp = 1;
    const scratch = makeDamageMove('SCRATCH', 'EFFECT_HIT', 'normal', 40);
    scratch.ppRemaining = 10;
    grudgeBattle.moves = [scratch];
    grudgeBattle.playerMon.moves = grudgeBattle.moves;
    grudgeBattle.wildMoves = [makeStatusMove('GRUDGE', 'EFFECT_GRUDGE', 'ghost')];
    grudgeBattle.wildMon.moves = grudgeBattle.wildMoves;

    stepBattle(grudgeBattle, confirmInput, createBattleEncounterState());

    expect(grudgeBattle.wildMon.hp).toBe(0);
    expect(scratch.ppRemaining).toBe(0);
  });

  test('Spikes layers damage grounded switch-ins and Rapid Spin clears them', () => {
    const spikesBattle = createBattleState();
    spikesBattle.active = true;
    spikesBattle.phase = 'partySelect';
    spikesBattle.selectedPartyIndex = 1;
    spikesBattle.sideState.player.spikesLayers = 3;
    spikesBattle.party[1]!.types = ['normal'];
    spikesBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    spikesBattle.wildMon.moves = spikesBattle.wildMoves;
    const switchHp = spikesBattle.party[1]!.hp;

    stepBattle(spikesBattle, confirmInput, createBattleEncounterState());

    expect(spikesBattle.playerMon).toBe(spikesBattle.party[1]);
    expect(spikesBattle.playerMon.hp).toBeLessThan(switchHp);
    expect([spikesBattle.turnSummary, ...spikesBattle.queuedMessages]).toContain(`${spikesBattle.playerMon.species} is hurt by Spikes!`);

    const spinBattle = createBattleState();
    spinBattle.active = true;
    spinBattle.phase = 'moveSelect';
    spinBattle.playerMon.speed = 99;
    spinBattle.sideState.player.spikesLayers = 2;
    spinBattle.moves = [makeDamageMove('RAPID_SPIN', 'EFFECT_RAPID_SPIN', 'normal', 20)];
    spinBattle.playerMon.moves = spinBattle.moves;
    spinBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    spinBattle.wildMon.moves = spinBattle.wildMoves;

    stepBattle(spinBattle, confirmInput, createBattleEncounterState());

    expect(spinBattle.sideState.player.spikesLayers).toBe(0);
  });

  test('Curse handles Ghost and non-Ghost scripts and Foresight identifies Ghost targets', () => {
    const ghostCurse = createBattleState();
    ghostCurse.active = true;
    ghostCurse.phase = 'moveSelect';
    ghostCurse.playerMon.speed = 99;
    ghostCurse.playerMon.types = ['ghost'];
    ghostCurse.moves = [makeStatusMove('CURSE', 'EFFECT_CURSE', 'ghost')];
    ghostCurse.playerMon.moves = ghostCurse.moves;
    ghostCurse.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    ghostCurse.wildMon.moves = ghostCurse.wildMoves;
    const playerHp = ghostCurse.playerMon.hp;
    const wildHp = ghostCurse.wildMon.hp;

    stepBattle(ghostCurse, confirmInput, createBattleEncounterState());

    expect(ghostCurse.playerMon.hp).toBeLessThan(playerHp);
    expect(ghostCurse.wildMon.volatile.cursed).toBe(true);
    expect(ghostCurse.wildMon.hp).toBeLessThan(wildHp);

    const normalCurse = createBattleState();
    normalCurse.active = true;
    normalCurse.phase = 'moveSelect';
    normalCurse.playerMon.speed = 99;
    normalCurse.moves = [makeStatusMove('CURSE', 'EFFECT_CURSE', 'ghost')];
    normalCurse.playerMon.moves = normalCurse.moves;
    normalCurse.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    normalCurse.wildMon.moves = normalCurse.wildMoves;

    stepBattle(normalCurse, confirmInput, createBattleEncounterState());

    expect(normalCurse.playerMon.statStages.speed).toBe(-1);
    expect(normalCurse.playerMon.statStages.attack).toBe(1);
    expect(normalCurse.playerMon.statStages.defense).toBe(1);

    const foresightBattle = createBattleState();
    const foresightEncounter = createBattleEncounterState();
    foresightBattle.active = true;
    foresightBattle.phase = 'moveSelect';
    foresightBattle.playerMon.speed = 99;
    foresightBattle.wildMon.types = ['ghost'];
    foresightBattle.moves = [makeStatusMove('FORESIGHT', 'EFFECT_FORESIGHT', 'normal')];
    foresightBattle.playerMon.moves = foresightBattle.moves;
    foresightBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    foresightBattle.wildMon.moves = foresightBattle.wildMoves;

    stepBattle(foresightBattle, confirmInput, foresightEncounter);
    expect(foresightBattle.wildMon.volatile.foresighted).toBe(true);

    flushScriptMessages(foresightBattle, foresightEncounter);
    foresightBattle.moves = [makeDamageMove('SCRATCH', 'EFFECT_HIT', 'normal', 40)];
    foresightBattle.playerMon.moves = foresightBattle.moves;
    stepBattle(foresightBattle, confirmInput, foresightEncounter);
    stepBattle(foresightBattle, confirmInput, foresightEncounter);

    expect(foresightBattle.wildMon.hp).toBeLessThan(foresightBattle.wildMon.maxHp);
  });

  test('Stockpile, Spit Up, and Swallow share the decomp stockpile counter', () => {
    const spitBattle = createBattleState();
    const spitEncounter = createBattleEncounterState();
    spitBattle.active = true;
    spitBattle.phase = 'moveSelect';
    spitBattle.playerMon.speed = 99;
    spitBattle.wildMon.maxHp = 200;
    spitBattle.wildMon.hp = 200;
    spitBattle.moves = [makeStatusMove('STOCKPILE', 'EFFECT_STOCKPILE', 'normal')];
    spitBattle.playerMon.moves = spitBattle.moves;
    spitBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    spitBattle.wildMon.moves = spitBattle.wildMoves;

    stepBattle(spitBattle, confirmInput, spitEncounter);
    expect(spitBattle.playerMon.volatile.stockpile).toBe(1);

    flushScriptMessages(spitBattle, spitEncounter);
    spitBattle.moves = [makeDamageMove('SPIT_UP', 'EFFECT_SPIT_UP', 'normal', 100)];
    spitBattle.playerMon.moves = spitBattle.moves;
    stepBattle(spitBattle, confirmInput, spitEncounter);
    stepBattle(spitBattle, confirmInput, spitEncounter);

    expect(spitBattle.wildMon.hp).toBeLessThan(200);
    expect(spitBattle.playerMon.volatile.stockpile).toBe(0);

    const swallowBattle = createBattleState();
    swallowBattle.active = true;
    swallowBattle.phase = 'moveSelect';
    swallowBattle.playerMon.speed = 99;
    swallowBattle.playerMon.hp = 5;
    swallowBattle.playerMon.volatile.stockpile = 3;
    swallowBattle.moves = [makeStatusMove('SWALLOW', 'EFFECT_SWALLOW', 'normal')];
    swallowBattle.playerMon.moves = swallowBattle.moves;
    swallowBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    swallowBattle.wildMon.moves = swallowBattle.wildMoves;

    stepBattle(swallowBattle, confirmInput, createBattleEncounterState());

    expect(swallowBattle.playerMon.hp).toBeGreaterThan(5);
    expect(swallowBattle.playerMon.volatile.stockpile).toBe(0);
  });

  test('Charge and sport moves modify elemental damage', () => {
    const plainElectric = createBattleState();
    const chargedElectric = createBattleState();
    for (const battle of [plainElectric, chargedElectric]) {
      battle.active = true;
      battle.phase = 'moveSelect';
      battle.playerMon.speed = 99;
      battle.wildMon.types = ['normal'];
      battle.moves = [makeDamageMove('SHOCK', 'EFFECT_HIT', 'electric', 40)];
      battle.playerMon.moves = battle.moves;
      battle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
      battle.wildMon.moves = battle.wildMoves;
    }
    chargedElectric.playerMon.volatile.chargeTurns = 1;

    stepBattle(plainElectric, confirmInput, createBattleEncounterState());
    stepBattle(chargedElectric, confirmInput, createBattleEncounterState());

    expect(chargedElectric.wildMon.maxHp - chargedElectric.wildMon.hp).toBeGreaterThan(plainElectric.wildMon.maxHp - plainElectric.wildMon.hp);

    const mudSportBattle = createBattleState();
    mudSportBattle.active = true;
    mudSportBattle.phase = 'moveSelect';
    mudSportBattle.playerMon.speed = 99;
    mudSportBattle.moves = [makeStatusMove('MUD_SPORT', 'EFFECT_MUD_SPORT', 'ground')];
    mudSportBattle.playerMon.moves = mudSportBattle.moves;
    mudSportBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    mudSportBattle.wildMon.moves = mudSportBattle.wildMoves;

    stepBattle(mudSportBattle, confirmInput, createBattleEncounterState());

    expect(mudSportBattle.mudSport).toBe(true);
  });

  test('Teeter Dance confuses the target and Camouflage changes type by terrain', () => {
    const teeterBattle = createBattleState();
    teeterBattle.active = true;
    teeterBattle.phase = 'moveSelect';
    teeterBattle.playerMon.speed = 99;
    teeterBattle.moves = [makeStatusMove('TEETER_DANCE', 'EFFECT_TEETER_DANCE', 'normal')];
    teeterBattle.playerMon.moves = teeterBattle.moves;
    teeterBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    teeterBattle.wildMon.moves = teeterBattle.wildMoves;

    stepBattle(teeterBattle, confirmInput, createBattleEncounterState());

    expect(teeterBattle.wildMon.volatile.confusionTurns).toBeGreaterThan(0);

    const camouflageBattle = createBattleState();
    camouflageBattle.active = true;
    camouflageBattle.phase = 'moveSelect';
    camouflageBattle.playerMon.speed = 99;
    camouflageBattle.terrain = 'BATTLE_TERRAIN_SAND';
    camouflageBattle.moves = [makeStatusMove('CAMOUFLAGE', 'EFFECT_CAMOUFLAGE', 'normal')];
    camouflageBattle.playerMon.moves = camouflageBattle.moves;
    camouflageBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_HIT', 'normal')];
    camouflageBattle.wildMon.moves = camouflageBattle.wildMoves;

    stepBattle(camouflageBattle, confirmInput, createBattleEncounterState());

    expect(camouflageBattle.playerMon.types).toEqual(['ground']);
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

  test('can start Safari wild battles with carried-over Safari Ball count', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();
    encounter.rngState = 0;

    let started = false;
    for (let i = 0; i < 40; i += 1) {
      started = tryStartWildBattle(
        battle,
        encounter,
        true,
        true,
        routeLikeLandEncounters,
        undefined,
        undefined,
        {
          mode: 'safari',
          battleTypeFlags: ['safari'],
          safariBalls: 12
        }
      );
      if (started) {
        break;
      }
    }

    expect(started).toBe(true);
    expect(battle.mode).toBe('safari');
    expect(battle.battleTypeFlags).toContain('safari');
    expect(battle.commands).toEqual(['safariBall', 'safariBait', 'safariRock', 'run']);
    expect(battle.safariBalls).toBe(12);
  });

  test('starts surfing wild battles with water terrain when requested by the overworld', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();
    encounter.rngState = 0;

    let started = false;
    for (let i = 0; i < 40; i += 1) {
      started = tryStartWildBattle(
        battle,
        encounter,
        true,
        true,
        routeLikeWaterEncounters,
        undefined,
        'MAP_ROUTE21_SOUTH',
        { encounterKind: 'water' }
      );
      if (started) {
        break;
      }
    }

    expect(started).toBe(true);
    expect(battle.terrain).toBe('BATTLE_TERRAIN_WATER');
    expect(battle.wildMon.species).toMatch(/TENTACOOL|HORSEA|STARYU/);
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

  test('Smoke Ball and Run Away bypass trapping when fleeing wild battles', () => {
    const smokeBattle = createBattleState();
    smokeBattle.active = true;
    smokeBattle.phase = 'command';
    smokeBattle.playerMon.heldItemId = 'ITEM_SMOKE_BALL';
    smokeBattle.playerMon.volatile.escapePreventedBy = 'opponent';
    smokeBattle.selectedCommandIndex = smokeBattle.commands.findIndex((command) => command === 'run');

    stepBattle(smokeBattle, confirmInput, createBattleEncounterState());
    expect(smokeBattle.phase).toBe('script');
    expect(smokeBattle.resumePhase).toBe('resolved');
    expect(smokeBattle.turnSummary).toContain('Got away safely');

    const runAwayBattle = createBattleState();
    runAwayBattle.active = true;
    runAwayBattle.phase = 'command';
    runAwayBattle.playerMon.abilityId = 'RUN_AWAY';
    runAwayBattle.wildMon.abilityId = 'SHADOW_TAG';
    runAwayBattle.selectedCommandIndex = runAwayBattle.commands.findIndex((command) => command === 'run');

    stepBattle(runAwayBattle, confirmInput, createBattleEncounterState());
    expect(runAwayBattle.phase).toBe('script');
    expect(runAwayBattle.resumePhase).toBe('resolved');
    expect(runAwayBattle.turnSummary).toContain('Got away safely');
  });

  test('Shadow Tag, Arena Trap, and Magnet Pull can prevent wild battle escape', () => {
    const shadowTagBattle = createBattleState();
    shadowTagBattle.active = true;
    shadowTagBattle.phase = 'command';
    shadowTagBattle.wildMon.abilityId = 'SHADOW_TAG';
    shadowTagBattle.selectedCommandIndex = shadowTagBattle.commands.findIndex((command) => command === 'run');

    stepBattle(shadowTagBattle, confirmInput, createBattleEncounterState());
    expect(shadowTagBattle.turnSummary).toContain("Can't escape!");

    const shadowTagMirrorBattle = createBattleState();
    shadowTagMirrorBattle.active = true;
    shadowTagMirrorBattle.phase = 'command';
    shadowTagMirrorBattle.playerMon.abilityId = 'SHADOW_TAG';
    shadowTagMirrorBattle.wildMon.abilityId = 'SHADOW_TAG';
    shadowTagMirrorBattle.selectedCommandIndex = shadowTagMirrorBattle.commands.findIndex((command) => command === 'run');

    stepBattle(shadowTagMirrorBattle, confirmInput, createBattleEncounterState());
    expect(shadowTagMirrorBattle.turnSummary).toContain("Can't escape!");

    const arenaTrapBattle = createBattleState();
    arenaTrapBattle.active = true;
    arenaTrapBattle.phase = 'command';
    arenaTrapBattle.wildMon.abilityId = 'ARENA_TRAP';
    arenaTrapBattle.playerMon.types = ['fire'];
    arenaTrapBattle.selectedCommandIndex = arenaTrapBattle.commands.findIndex((command) => command === 'run');

    stepBattle(arenaTrapBattle, confirmInput, createBattleEncounterState());
    expect(arenaTrapBattle.turnSummary).toContain("Can't escape!");

    const magnetPullBattle = createBattleState();
    magnetPullBattle.active = true;
    magnetPullBattle.phase = 'command';
    magnetPullBattle.wildMon.abilityId = 'MAGNET_PULL';
    magnetPullBattle.playerMon.types = ['steel'];
    magnetPullBattle.selectedCommandIndex = magnetPullBattle.commands.findIndex((command) => command === 'run');

    stepBattle(magnetPullBattle, confirmInput, createBattleEncounterState());
    expect(magnetPullBattle.turnSummary).toContain("Can't escape!");
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

  test('calculates capture odds with FireRed integer ball and status order', () => {
    const battle = createBattleState();
    battle.wildMon.maxHp = 100;
    battle.wildMon.hp = 37;
    battle.wildMon.catchRate = 45;
    battle.wildMon.status = 'paralysis';

    expect(calculateCaptureOdds(battle.wildMon, 'ITEM_GREAT_BALL')).toBe(75);

    battle.wildMon.status = 'sleep';
    expect(calculateCaptureOdds(battle.wildMon, 'ITEM_GREAT_BALL')).toBe(100);

    battle.wildMon.hp = 50;
    battle.wildMon.status = 'none';
    expect(calculateCaptureOdds(battle.wildMon, 'ITEM_SAFARI_BALL')).toBe(38);
    expect(calculateCaptureOdds(battle.wildMon, 'ITEM_SAFARI_BALL', { safariCatchFactor: 20 })).toBe(254);
  });

  test('uses FireRed special ball catch multipliers from battle context', () => {
    const battle = createBattleState();
    battle.wildMon.species = 'MAGIKARP';
    battle.wildMon.types = ['water'];
    battle.wildMon.level = 12;

    expect(getBallCatchMultiplierTenths('ITEM_NET_BALL', battle.wildMon)).toBe(30);
    expect(getBallCatchMultiplierTenths('ITEM_DIVE_BALL', battle.wildMon, { terrain: 'BATTLE_TERRAIN_UNDERWATER' })).toBe(35);
    expect(getBallCatchMultiplierTenths('ITEM_NEST_BALL', battle.wildMon)).toBe(28);
    expect(getBallCatchMultiplierTenths('ITEM_REPEAT_BALL', battle.wildMon, { caughtSpeciesIds: ['MAGIKARP'] })).toBe(30);
    expect(getBallCatchMultiplierTenths('ITEM_TIMER_BALL', battle.wildMon, { battleTurnCounter: 35 })).toBe(40);
  });

  test('battle BAG lists and consumes every supported ball from the Poké Balls pocket order', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();
    const bag = createBagState();
    bag.pockets.pokeBalls = [
      { itemId: 'ITEM_TIMER_BALL', quantity: 2 },
      { itemId: 'ITEM_ULTRA_BALL', quantity: 1 }
    ];

    const choices = getBattleBagChoices(battle, bag);
    expect(choices.map((choice) => choice.itemId)).toEqual(['ITEM_TIMER_BALL', 'ITEM_ULTRA_BALL', null]);
    expect(choices.map((choice) => choice.label)).toEqual(['TIMER BALL', 'ULTRA BALL', 'CANCEL']);

    battle.wildMon.catchRate = 255;
    battle.wildMon.hp = 1;
    encounter.rngState = 0;
    const capture = performCaptureAttempt(battle, encounter, bag);

    expect(capture.usedItemId).toBe('ITEM_TIMER_BALL');
    expect(capture.caught).toBe(true);
    expect(getBagQuantity(bag, 'ITEM_TIMER_BALL')).toBe(1);
    expect(getBagQuantity(bag, 'ITEM_ULTRA_BALL')).toBe(1);
  });

  test('Master Ball always catches and is removed from the bag', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();
    const bag = createBagState();
    bag.pockets.pokeBalls = [{ itemId: 'ITEM_MASTER_BALL', quantity: 1 }];
    battle.wildMon.catchRate = 3;
    battle.wildMon.hp = battle.wildMon.maxHp;

    const capture = performCaptureAttempt(battle, encounter, bag, 'ITEM_MASTER_BALL');

    expect(capture).toMatchObject({
      caught: true,
      shakes: 4,
      ballLabel: 'MASTER BALL',
      usedItemId: 'ITEM_MASTER_BALL'
    });
    expect(getBagQuantity(bag, 'ITEM_MASTER_BALL')).toBe(0);
  });

  test('failed ball throws use FireRed shake-specific escape messages', () => {
    expect(getBallEscapeMessage(0)).toBe('Oh, no! The POKéMON broke free!');
    expect(getBallEscapeMessage(1)).toBe('Aww! It appeared to be caught!');
    expect(getBallEscapeMessage(2)).toBe('Aargh! Almost had it!');
    expect(getBallEscapeMessage(3)).toBe('Shoot! It was so close, too!');
  });

  test('trainer and ghost battle ball blocks do not consume the selected ball', () => {
    const encounter = createBattleEncounterState();
    const trainerBattle = createBattleState();
    const trainerBag = createBagState();
    trainerBag.pockets.pokeBalls = [{ itemId: 'ITEM_ULTRA_BALL', quantity: 1 }];
    trainerBattle.battleTypeFlags = ['trainer'];

    const trainerCapture = performCaptureAttempt(trainerBattle, encounter, trainerBag, 'ITEM_ULTRA_BALL');
    expect(trainerCapture).toMatchObject({
      caught: false,
      blockedReason: 'trainer',
      usedItemId: 'ITEM_ULTRA_BALL'
    });
    expect(getBagQuantity(trainerBag, 'ITEM_ULTRA_BALL')).toBe(1);

    const ghostBattle = createBattleState();
    const ghostBag = createBagState();
    ghostBag.pockets.pokeBalls = [{ itemId: 'ITEM_POKE_BALL', quantity: 1 }];
    ghostBattle.battleTypeFlags = ['ghost'];

    const ghostCapture = performCaptureAttempt(ghostBattle, encounter, ghostBag, 'ITEM_POKE_BALL');
    expect(ghostCapture).toMatchObject({
      caught: false,
      blockedReason: 'ghost',
      usedItemId: 'ITEM_POKE_BALL'
    });
    expect(getBagQuantity(ghostBag, 'ITEM_POKE_BALL')).toBe(1);
  });

  test('old-man tutorial ball throw resolves as caught without adding a player caught mon', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();
    const bag = createBagState();
    bag.pockets.pokeBalls = [{ itemId: 'ITEM_POKE_BALL', quantity: 1 }];
    battle.active = true;
    battle.phase = 'bagSelect';
    battle.battleTypeFlags = ['oldManTutorial'];

    stepBattle(battle, confirmInput, encounter, bag);

    expect(battle.currentScriptLabel).toBe('BattleScript_OldMan_Pokedude_CaughtMessage');
    expect(battle.caughtMon).toBeNull();
    expect(battle.caughtSpeciesIds).toEqual([]);
    expect(getBagQuantity(bag, 'ITEM_POKE_BALL')).toBe(1);
    expect(battle.phase).toBe('script');
    expect([battle.turnSummary, ...battle.queuedMessages]).toEqual([
      'POKé BALL thrown!',
      `Gotcha! ${battle.wildMon.species} was caught!`
    ]);
  });

  test('Safari battles use Ball, Bait, Rock, Run commands', () => {
    const battle = createBattleState();
    battle.active = true;
    battle.phase = 'command';
    battle.battleTypeFlags = ['safari'];

    stepBattle(battle, neutralInput, createBattleEncounterState());

    expect(battle.commands).toEqual(['safariBall', 'safariBait', 'safariRock', 'run']);
  });

  test('Safari bait and rock mutate catch factors and counters like FireRed actions', () => {
    const baitBattle = createBattleState();
    const baitEncounter = createBattleEncounterState();
    baitEncounter.rngState = 1;
    baitBattle.active = true;
    baitBattle.phase = 'command';
    baitBattle.battleTypeFlags = ['safari'];
    baitBattle.safariCatchFactor = 10;
    baitBattle.safariEscapeFactor = 2;
    stepBattle(baitBattle, neutralInput, baitEncounter);
    baitBattle.selectedCommandIndex = 1;

    stepBattle(baitBattle, confirmInput, baitEncounter);

    expect(baitBattle.safariCatchFactor).toBe(5);
    expect(baitBattle.safariBaitThrowCounter).toBe(4);
    expect(baitBattle.safariRockThrowCounter).toBe(0);
    expect([baitBattle.turnSummary, ...baitBattle.queuedMessages]).toEqual([
      `You threw some BAIT at the ${baitBattle.wildMon.species}!`,
      `${baitBattle.wildMon.species} is eating!`
    ]);

    const rockBattle = createBattleState();
    const rockEncounter = createBattleEncounterState();
    rockEncounter.rngState = 1;
    rockBattle.active = true;
    rockBattle.phase = 'command';
    rockBattle.battleTypeFlags = ['safari'];
    rockBattle.safariCatchFactor = 11;
    rockBattle.safariEscapeFactor = 2;
    stepBattle(rockBattle, neutralInput, rockEncounter);
    rockBattle.selectedCommandIndex = 2;

    stepBattle(rockBattle, confirmInput, rockEncounter);

    expect(rockBattle.safariCatchFactor).toBe(20);
    expect(rockBattle.safariRockThrowCounter).toBe(4);
    expect(rockBattle.safariBaitThrowCounter).toBe(0);
    expect([rockBattle.turnSummary, ...rockBattle.queuedMessages]).toEqual([
      `You threw a ROCK at the ${rockBattle.wildMon.species}!`,
      `${rockBattle.wildMon.species} is angry!`
    ]);
  });

  test('Safari Ball uses the Safari ball counter and ends the battle when the last ball fails', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();
    battle.active = true;
    battle.phase = 'command';
    battle.battleTypeFlags = ['safari'];
    battle.safariBalls = 1;
    battle.safariCatchFactor = 1;
    battle.wildMon.catchRate = 1;
    battle.wildMon.hp = battle.wildMon.maxHp;
    encounter.rngState = 1;

    stepBattle(battle, confirmInput, encounter);

    expect(battle.safariBalls).toBe(0);
    expect(battle.phase).toBe('script');
    expect(battle.resumePhase).toBe('resolved');
    expect([battle.turnSummary, ...battle.queuedMessages]).toContain("ANNOUNCER: You're out of SAFARI BALLS! Game over!");
  });

  test('Safari opponent flee check follows rock and escape-factor odds', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();
    battle.active = true;
    battle.phase = 'command';
    battle.battleTypeFlags = ['safari'];
    battle.safariEscapeFactor = 20;
    encounter.rngState = 0;
    stepBattle(battle, neutralInput, encounter);
    battle.selectedCommandIndex = 2;

    stepBattle(battle, confirmInput, encounter);

    expect(battle.phase).toBe('script');
    expect(battle.resumePhase).toBe('resolved');
    expect([battle.turnSummary, ...battle.queuedMessages]).toContain(`Wild ${battle.wildMon.species} fled!`);
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
    expect(battle.postResult).toMatchObject({
      outcome: 'caught',
      caughtSpecies: battle.wildMon.species,
      caughtPokemon: {
        species: battle.wildMon.species,
        level: battle.wildMon.level
      }
    });
  });

  test('resolved battle dismissal preserves post-battle payloads for the runtime handoff', () => {
    const battle = createBattleState();
    battle.active = true;
    battle.phase = 'resolved';
    battle.caughtMon = createBattlePokemonFromSpecies('MAGIKARP', 10);
    battle.postResult.outcome = 'caught';
    battle.postResult.caughtPokemon = {
      species: 'MAGIKARP',
      level: 10
    };
    battle.postResult.pendingMoveLearns.push({
      species: 'CHARMANDER',
      level: 13,
      moveId: 'METAL_CLAW',
      moveName: 'METAL CLAW'
    });

    dismissResolvedBattle(battle, {
      preserveCaughtMon: true,
      preservePostResult: true
    });

    expect(battle.active).toBe(false);
    expect(battle.caughtMon).toMatchObject({
      species: 'MAGIKARP',
      level: 10
    });
    expect(battle.postResult).toMatchObject({
      outcome: 'caught',
      caughtPokemon: {
        species: 'MAGIKARP',
        level: 10
      }
    });
    expect(battle.postResult.pendingMoveLearns).toHaveLength(1);
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
    battle.wildMon.volatile.infatuatedBy = 'player';
    battle.wildMon.volatile.trappedBy = 'player';
    battle.wildMon.volatile.trapTurns = 3;
    battle.wildMon.volatile.escapePreventedBy = 'player';
    battle.wildMon.volatile.lockOnBy = 'player';
    battle.wildMon.volatile.lockOnTurns = 2;
    const foeMove = { ...(battle.wildMoves.find((move) => move.id === 'TACKLE') ?? battle.wildMoves[0]!), accuracy: 0 };
    battle.wildMon.moves = [foeMove];
    battle.wildMoves = [foeMove];
    const incomingHp = incoming.hp;

    stepBattle(battle, confirmInput, encounter);

    expect(battle.phase).toBe('script');
    expect(battle.playerMon.species).toBe(incoming.species);
    expect(battle.playerSide.activePartyIndexes).toEqual([1]);
    expect(incoming.hp).toBeLessThan(incomingHp);
    expect(battle.turnSummary).toContain('come back');
    expect(battle.queuedMessages).toContain(`Go! ${incoming.species}!`);
    expect(battle.queuedMessages.some((message) => message.includes('Foe') && message.includes('used'))).toBe(true);

    flushScriptMessages(battle, encounter);
    expect(battle.phase).toBe('command');
    expect(battle.turnSummary).toBe(`What will ${incoming.species} do?`);
    expect(battle.wildMon.volatile.infatuatedBy).toBeNull();
    expect(battle.wildMon.volatile.trappedBy).toBeNull();
    expect(battle.wildMon.volatile.trapTurns).toBe(0);
    expect(battle.wildMon.volatile.escapePreventedBy).toBeNull();
    expect(battle.wildMon.volatile.lockOnBy).toBeNull();
    expect(battle.wildMon.volatile.lockOnTurns).toBe(0);
  });

  test('trapping abilities prevent voluntary party switches in singles', () => {
    const battle = createBattleState();
    battle.active = true;
    battle.phase = 'partySelect';
    battle.selectedPartyIndex = 1;
    battle.playerMon.abilityId = 'SHADOW_TAG';
    battle.wildMon.abilityId = 'SHADOW_TAG';
    const activeMon = battle.playerMon;

    stepBattle(battle, confirmInput, createBattleEncounterState());

    expect(battle.playerMon).toBe(activeMon);
    expect(battle.phase).toBe('command');
    expect(battle.turnSummary).toBe("Can't switch out!");

    const arenaTrapBattle = createBattleState();
    arenaTrapBattle.active = true;
    arenaTrapBattle.phase = 'command';
    arenaTrapBattle.selectedCommandIndex = arenaTrapBattle.commands.findIndex((command) => command === 'pokemon');
    arenaTrapBattle.wildMon.abilityId = 'ARENA_TRAP';
    arenaTrapBattle.playerMon.types = ['normal'];

    stepBattle(arenaTrapBattle, confirmInput, createBattleEncounterState());

    expect(arenaTrapBattle.phase).toBe('command');
    expect(arenaTrapBattle.turnSummary).toBe("Can't switch out!");
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
    expect(battle.playerMon.species).toBe(incoming.species);
    expect(battle.playerSide.activePartyIndexes).toEqual([1]);
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
    battle.wildMon.types = ['ghost'];
    battle.moves.forEach((move) => {
      move.ppRemaining = 0;
    });
    const playerHp = battle.playerMon.hp;
    const wildHp = battle.wildMon.hp;

    stepBattle(battle, confirmInput, encounter);

    expect(battle.phase).toBe('script');
    expect(battle.turnSummary).toContain('used STRUGGLE');
    expect(battle.moves.every((move) => move.ppRemaining === 0)).toBe(true);
    expect(battle.playerMon.hp).toBeLessThan(playerHp);
    expect(battle.wildMon.hp).toBeLessThan(wildHp);
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

  test('Lock-On makes the next targeted move ignore accuracy', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();
    battle.active = true;
    battle.phase = 'moveSelect';
    battle.playerMon.speed = 99;
    battle.moves = [makeStatusMove('LOCK_ON', 'EFFECT_LOCK_ON', 'normal')];
    battle.playerMon.moves = battle.moves;
    battle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
    battle.wildMon.moves = battle.wildMoves;

    stepBattle(battle, confirmInput, encounter);
    expect(battle.wildMon.volatile.lockOnBy).toBe('player');

    flushScriptMessages(battle, encounter);
    battle.phase = 'moveSelect';
    battle.moves = [makeDamageMove('LOW_ACCURACY_SHOCK', 'EFFECT_HIT', 'electric', 40, 1)];
    battle.playerMon.moves = battle.moves;
    const wildHp = battle.wildMon.hp;

    stepBattle(battle, confirmInput, encounter);

    expect(battle.wildMon.hp).toBeLessThan(wildHp);
    expect([battle.turnSummary, ...battle.queuedMessages]).not.toContain('The attack missed!');
  });

  test('Fake Out only works on the battler first active turn', () => {
    const battle = createBattleState();
    const encounter = createBattleEncounterState();
    battle.active = true;
    battle.phase = 'moveSelect';
    battle.playerMon.speed = 99;
    battle.wildMon.speed = 1;
    battle.moves = [makeDamageMove('FAKE_OUT', 'EFFECT_FAKE_OUT', 'normal', 40)];
    battle.playerMon.moves = battle.moves;
    battle.wildMoves = [makeDamageMove('TACKLE', 'EFFECT_HIT', 'normal', 40)];
    battle.wildMon.moves = battle.wildMoves;
    const playerHp = battle.playerMon.hp;

    stepBattle(battle, confirmInput, encounter);

    expect(battle.playerMon.hp).toBe(playerHp);
    expect([battle.turnSummary, ...battle.queuedMessages]).toContain(`${battle.wildMon.species} flinched!`);

    flushScriptMessages(battle, encounter);
    battle.phase = 'moveSelect';
    const wildHp = battle.wildMon.hp;
    stepBattle(battle, confirmInput, encounter);

    expect(battle.wildMon.hp).toBe(wildHp);
    expect([battle.turnSummary, ...battle.queuedMessages]).toContain('But it failed!');
  });

  test('Conversion and Conversion 2 change type from move data and last received attack type', () => {
    const conversionBattle = createBattleState();
    conversionBattle.active = true;
    conversionBattle.phase = 'moveSelect';
    conversionBattle.playerMon.speed = 99;
    conversionBattle.playerMon.types = ['fire'];
    conversionBattle.moves = [
      makeStatusMove('CONVERSION', 'EFFECT_CONVERSION', 'normal'),
      makeDamageMove('WATER_GUN', 'EFFECT_HIT', 'water', 40)
    ];
    conversionBattle.playerMon.moves = conversionBattle.moves;
    conversionBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
    conversionBattle.wildMon.moves = conversionBattle.wildMoves;

    stepBattle(conversionBattle, confirmInput, createBattleEncounterState());

    expect(conversionBattle.playerMon.types).not.toEqual(['fire']);
    expect(['normal', 'water']).toContain(conversionBattle.playerMon.types[0]);

    const conversion2Battle = createBattleState();
    conversion2Battle.active = true;
    conversion2Battle.phase = 'moveSelect';
    conversion2Battle.playerMon.speed = 99;
    conversion2Battle.playerMon.types = ['normal'];
    conversion2Battle.playerMon.volatile.lastReceivedMoveType = 'fire';
    conversion2Battle.playerMon.volatile.lastLandedMoveId = 'EMBER';
    conversion2Battle.playerMon.volatile.lastDamagedBy = 'opponent';
    conversion2Battle.moves = [makeStatusMove('CONVERSION_2', 'EFFECT_CONVERSION_2', 'normal')];
    conversion2Battle.playerMon.moves = conversion2Battle.moves;
    conversion2Battle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
    conversion2Battle.wildMon.moves = conversion2Battle.wildMoves;

    stepBattle(conversion2Battle, confirmInput, createBattleEncounterState());

    expect(calculateTypeEffectiveness('fire', conversion2Battle.playerMon.types)).toBeLessThan(1);

    const chargingConversion2Battle = createBattleState();
    chargingConversion2Battle.active = true;
    chargingConversion2Battle.phase = 'moveSelect';
    chargingConversion2Battle.playerMon.speed = 99;
    chargingConversion2Battle.playerMon.types = ['normal'];
    chargingConversion2Battle.playerMon.volatile.lastReceivedMoveType = 'flying';
    chargingConversion2Battle.playerMon.volatile.lastLandedMoveId = 'FLY';
    chargingConversion2Battle.playerMon.volatile.lastDamagedBy = 'opponent';
    chargingConversion2Battle.moves = [makeStatusMove('CONVERSION_2', 'EFFECT_CONVERSION_2', 'normal')];
    chargingConversion2Battle.playerMon.moves = chargingConversion2Battle.moves;
    chargingConversion2Battle.wildMon.volatile.chargingMoveId = 'FLY';
    chargingConversion2Battle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
    chargingConversion2Battle.wildMon.moves = chargingConversion2Battle.wildMoves;

    stepBattle(chargingConversion2Battle, confirmInput, createBattleEncounterState());

    expect([chargingConversion2Battle.turnSummary, ...chargingConversion2Battle.queuedMessages]).toContain('But it failed!');

    const missedConversion2Battle = createBattleState();
    const missedConversion2Encounter = createBattleEncounterState();
    missedConversion2Battle.active = true;
    missedConversion2Battle.phase = 'moveSelect';
    missedConversion2Battle.playerMon.speed = 1;
    missedConversion2Battle.wildMon.speed = 99;
    missedConversion2Battle.playerMon.types = ['ghost'];
    missedConversion2Battle.playerMon.volatile.lastReceivedMoveType = 'normal';
    missedConversion2Battle.playerMon.volatile.lastLandedMoveId = 'TACKLE';
    missedConversion2Battle.playerMon.volatile.lastDamagedBy = 'opponent';
    missedConversion2Battle.moves = [makeStatusMove('CONVERSION_2', 'EFFECT_CONVERSION_2', 'normal')];
    missedConversion2Battle.playerMon.moves = missedConversion2Battle.moves;
    missedConversion2Battle.wildMoves = [makeDamageMove('TACKLE', 'EFFECT_HIT', 'normal', 40)];
    missedConversion2Battle.wildMon.moves = missedConversion2Battle.wildMoves;

    stepBattle(missedConversion2Battle, confirmInput, missedConversion2Encounter);
    flushScriptMessages(missedConversion2Battle, missedConversion2Encounter);

    missedConversion2Battle.phase = 'moveSelect';
    missedConversion2Battle.playerMon.speed = 99;
    missedConversion2Battle.wildMon.speed = 1;
    missedConversion2Battle.moves = [makeStatusMove('CONVERSION_2', 'EFFECT_CONVERSION_2', 'normal')];
    missedConversion2Battle.playerMon.moves = missedConversion2Battle.moves;
    missedConversion2Battle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
    missedConversion2Battle.wildMon.moves = missedConversion2Battle.wildMoves;

    stepBattle(missedConversion2Battle, confirmInput, missedConversion2Encounter);

    expect(missedConversion2Battle.playerMon.types).toEqual(['ghost']);
    expect([missedConversion2Battle.turnSummary, ...missedConversion2Battle.queuedMessages]).toContain('But it failed!');
  });

  test('Tri Attack status and thawing hits run their decomp move effects', () => {
    const triBattle = createBattleState();
    triBattle.active = true;
    triBattle.phase = 'moveSelect';
    triBattle.playerMon.speed = 99;
    triBattle.moves = [makeDamageMove('TRI_ATTACK', 'EFFECT_TRI_ATTACK', 'normal', 80, 0, 100)];
    triBattle.playerMon.moves = triBattle.moves;
    triBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
    triBattle.wildMon.moves = triBattle.wildMoves;

    stepBattle(triBattle, confirmInput, createBattleEncounterState());

    expect(triBattle.wildMon.status).not.toBe('none');

    const thawBattle = createBattleState();
    thawBattle.active = true;
    thawBattle.phase = 'moveSelect';
    thawBattle.playerMon.speed = 99;
    thawBattle.playerMon.status = 'freeze';
    thawBattle.moves = [makeDamageMove('FLAME_WHEEL', 'EFFECT_THAW_HIT', 'fire', 60, 0, 100)];
    thawBattle.playerMon.moves = thawBattle.moves;
    thawBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
    thawBattle.wildMon.moves = thawBattle.wildMoves;

    stepBattle(thawBattle, confirmInput, createBattleEncounterState());

    expect(thawBattle.playerMon.status).toBe('none');
    expect(thawBattle.wildMon.status).toBe('burn');
  });

  test('Pay Day, friendship damage, and semi-invulnerable bonuses affect damage state', () => {
    const payDayBattle = createBattleState();
    payDayBattle.active = true;
    payDayBattle.phase = 'moveSelect';
    payDayBattle.playerMon.speed = 99;
    payDayBattle.moves = [makeDamageMove('PAY_DAY', 'EFFECT_PAY_DAY', 'normal', 40)];
    payDayBattle.playerMon.moves = payDayBattle.moves;
    payDayBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
    payDayBattle.wildMon.moves = payDayBattle.wildMoves;

    stepBattle(payDayBattle, confirmInput, createBattleEncounterState());

    expect(payDayBattle.payDayMoney).toBe(payDayBattle.playerMon.level * 5);

    const returnBattle = createBattleState();
    const frustrationBattle = createBattleState();
    for (const battle of [returnBattle, frustrationBattle]) {
      battle.active = true;
      battle.phase = 'moveSelect';
      battle.playerMon.speed = 99;
      battle.playerMon.friendship = 255;
      battle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
      battle.wildMon.moves = battle.wildMoves;
    }
    returnBattle.moves = [makeDamageMove('RETURN', 'EFFECT_RETURN', 'normal', 1)];
    returnBattle.playerMon.moves = returnBattle.moves;
    frustrationBattle.moves = [makeDamageMove('FRUSTRATION', 'EFFECT_FRUSTRATION', 'normal', 1)];
    frustrationBattle.playerMon.moves = frustrationBattle.moves;

    stepBattle(returnBattle, confirmInput, createBattleEncounterState());
    stepBattle(frustrationBattle, confirmInput, createBattleEncounterState());

    expect(returnBattle.wildMon.maxHp - returnBattle.wildMon.hp).toBeGreaterThan(frustrationBattle.wildMon.maxHp - frustrationBattle.wildMon.hp);

    const normalQuake = createBattleState();
    const boostedQuake = createBattleState();
    for (const battle of [normalQuake, boostedQuake]) {
      battle.active = true;
      battle.phase = 'moveSelect';
      battle.playerMon.speed = 99;
      battle.wildMon.types = ['normal'];
      battle.wildMon.maxHp = 200;
      battle.wildMon.hp = 200;
      battle.moves = [makeDamageMove('EARTHQUAKE', 'EFFECT_EARTHQUAKE', 'ground', 100)];
      battle.playerMon.moves = battle.moves;
      battle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
      battle.wildMon.moves = battle.wildMoves;
    }
    boostedQuake.wildMon.volatile.semiInvulnerable = 'underground';

    stepBattle(normalQuake, confirmInput, createBattleEncounterState());
    stepBattle(boostedQuake, confirmInput, createBattleEncounterState());

    expect(boostedQuake.wildMon.maxHp - boostedQuake.wildMon.hp).toBeGreaterThan(normalQuake.wildMon.maxHp - normalQuake.wildMon.hp);

    const missedDive = createBattleState();
    const surfDive = createBattleState();
    const whirlpoolDive = createBattleState();
    for (const battle of [missedDive, surfDive, whirlpoolDive]) {
      battle.active = true;
      battle.phase = 'moveSelect';
      battle.playerMon.speed = 99;
      battle.wildMon.maxHp = 200;
      battle.wildMon.hp = 200;
      battle.wildMon.volatile.semiInvulnerable = 'underwater';
      battle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
      battle.wildMon.moves = battle.wildMoves;
    }
    missedDive.moves = [makeDamageMove('WATER_GUN', 'EFFECT_HIT', 'water', 40)];
    missedDive.playerMon.moves = missedDive.moves;
    surfDive.moves = [makeDamageMove('SURF', 'EFFECT_HIT', 'water', 40)];
    surfDive.playerMon.moves = surfDive.moves;
    whirlpoolDive.moves = [makeDamageMove('WHIRLPOOL', 'EFFECT_TRAP', 'water', 40)];
    whirlpoolDive.playerMon.moves = whirlpoolDive.moves;

    stepBattle(missedDive, confirmInput, createBattleEncounterState());
    stepBattle(surfDive, confirmInput, createBattleEncounterState());
    stepBattle(whirlpoolDive, confirmInput, createBattleEncounterState());

    expect(missedDive.wildMon.hp).toBe(200);
    expect(surfDive.wildMon.hp).toBeLessThan(200);
    expect(whirlpoolDive.wildMon.hp).toBeLessThan(200);
  });

  test('two-turn charge moves store their move and resolve without spending second-turn PP', () => {
    const solarBattle = createBattleState();
    const solarEncounter = createBattleEncounterState();
    solarBattle.active = true;
    solarBattle.phase = 'moveSelect';
    solarBattle.playerMon.speed = 99;
    solarBattle.moves = [makeDamageMove('SOLAR_BEAM', 'EFFECT_SOLAR_BEAM', 'grass', 120)];
    solarBattle.playerMon.moves = solarBattle.moves;
    solarBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
    solarBattle.wildMon.moves = solarBattle.wildMoves;
    const wildHp = solarBattle.wildMon.hp;

    stepBattle(solarBattle, confirmInput, solarEncounter);

    expect(solarBattle.wildMon.hp).toBe(wildHp);
    expect(solarBattle.playerMon.volatile.chargingMoveId).toBe('SOLAR_BEAM');
    expect(solarBattle.moves[0]!.ppRemaining).toBe(19);

    flushScriptMessages(solarBattle, solarEncounter);
    stepBattle(solarBattle, confirmInput, solarEncounter);

    expect(solarBattle.wildMon.hp).toBeLessThan(wildHp);
    expect(solarBattle.playerMon.volatile.chargingMoveId).toBeNull();
    expect(solarBattle.moves[0]!.ppRemaining).toBe(19);

    const skullBashBattle = createBattleState();
    skullBashBattle.active = true;
    skullBashBattle.phase = 'moveSelect';
    skullBashBattle.playerMon.speed = 99;
    skullBashBattle.moves = [makeDamageMove('SKULL_BASH', 'EFFECT_SKULL_BASH', 'normal', 100)];
    skullBashBattle.playerMon.moves = skullBashBattle.moves;
    skullBashBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
    skullBashBattle.wildMon.moves = skullBashBattle.wildMoves;

    stepBattle(skullBashBattle, confirmInput, createBattleEncounterState());

    expect(skullBashBattle.playerMon.statStages.defense).toBe(1);
    expect(skullBashBattle.wildMon.hp).toBe(skullBashBattle.wildMon.maxHp);

    const sunnySolarBattle = createBattleState();
    sunnySolarBattle.active = true;
    sunnySolarBattle.phase = 'moveSelect';
    sunnySolarBattle.playerMon.speed = 99;
    sunnySolarBattle.weather = 'sun';
    sunnySolarBattle.weatherTurns = 5;
    sunnySolarBattle.moves = [makeDamageMove('SOLAR_BEAM', 'EFFECT_SOLAR_BEAM', 'grass', 120)];
    sunnySolarBattle.playerMon.moves = sunnySolarBattle.moves;
    sunnySolarBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
    sunnySolarBattle.wildMon.moves = sunnySolarBattle.wildMoves;

    stepBattle(sunnySolarBattle, confirmInput, createBattleEncounterState());

    expect(sunnySolarBattle.playerMon.volatile.chargingMoveId).toBeNull();
    expect(sunnySolarBattle.wildMon.hp).toBeLessThan(sunnySolarBattle.wildMon.maxHp);

    const flyBattle = createBattleState();
    flyBattle.active = true;
    flyBattle.phase = 'moveSelect';
    flyBattle.playerMon.speed = 99;
    flyBattle.moves = [makeDamageMove('FLY', 'EFFECT_SEMI_INVULNERABLE', 'flying', 70)];
    flyBattle.playerMon.moves = flyBattle.moves;
    flyBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
    flyBattle.wildMon.moves = flyBattle.wildMoves;

    stepBattle(flyBattle, confirmInput, createBattleEncounterState());

    expect(flyBattle.playerMon.volatile.semiInvulnerable).toBe('air');
    expect(flyBattle.playerMon.volatile.chargingMoveId).toBe('FLY');
  });

  test('Rampage and Uproar lock the battler into repeat turns without extra PP cost', () => {
    const rampageBattle = createBattleState();
    const rampageEncounter = createBattleEncounterState();
    rampageBattle.active = true;
    rampageBattle.phase = 'moveSelect';
    rampageBattle.playerMon.speed = 99;
    rampageBattle.wildMon.maxHp = 200;
    rampageBattle.wildMon.hp = 200;
    const thrash = makeDamageMove('THRASH', 'EFFECT_RAMPAGE', 'normal', 40);
    rampageBattle.moves = [thrash, makeDamageMove('TACKLE', 'EFFECT_HIT', 'normal', 40)];
    rampageBattle.playerMon.moves = rampageBattle.moves;
    rampageBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
    rampageBattle.wildMon.moves = rampageBattle.wildMoves;

    stepBattle(rampageBattle, confirmInput, rampageEncounter);

    expect(rampageBattle.playerMon.volatile.rampageMoveId).toBe('THRASH');
    expect(thrash.ppRemaining).toBe(19);

    flushScriptMessages(rampageBattle, rampageEncounter);
    rampageBattle.selectedMoveIndex = 1;
    const wildHp = rampageBattle.wildMon.hp;
    stepBattle(rampageBattle, confirmInput, rampageEncounter);

    expect(rampageBattle.wildMon.hp).toBeLessThan(wildHp);
    expect(thrash.ppRemaining).toBe(19);

    const uproarBattle = createBattleState();
    const uproarEncounter = createBattleEncounterState();
    uproarBattle.active = true;
    uproarBattle.phase = 'moveSelect';
    uproarBattle.playerMon.speed = 99;
    uproarBattle.wildMon.maxHp = 200;
    uproarBattle.wildMon.hp = 200;
    const uproar = makeDamageMove('UPROAR', 'EFFECT_UPROAR', 'normal', 50);
    uproarBattle.moves = [uproar, makeDamageMove('TACKLE', 'EFFECT_HIT', 'normal', 40)];
    uproarBattle.playerMon.moves = uproarBattle.moves;
    uproarBattle.wildMoves = [makeStatusMove('SPLASH', 'EFFECT_SPLASH', 'normal')];
    uproarBattle.wildMon.moves = uproarBattle.wildMoves;

    stepBattle(uproarBattle, confirmInput, uproarEncounter);

    expect(uproarBattle.playerMon.volatile.uproarMoveId).toBe('UPROAR');
    expect(uproar.ppRemaining).toBe(19);
    expect([uproarBattle.turnSummary, ...uproarBattle.queuedMessages]).toContain(`${uproarBattle.playerMon.species} caused an uproar!`);

    flushScriptMessages(uproarBattle, uproarEncounter);
    uproarBattle.selectedMoveIndex = 1;
    const uproarWildHp = uproarBattle.wildMon.hp;
    stepBattle(uproarBattle, confirmInput, uproarEncounter);

    expect(uproarBattle.wildMon.hp).toBeLessThan(uproarWildHp);
    expect(uproar.ppRemaining).toBe(19);
  });
});
