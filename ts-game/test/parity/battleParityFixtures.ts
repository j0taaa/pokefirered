import {
  createBattlePokemonFromSpecies,
  type BattleMove,
  type PokemonType
} from '../../src/game/battle';
import { getDecompBattleMove } from '../../src/game/decompBattleData';
import type { BattleParityFixture } from '../../src/game/battleParity';

export interface NativeBattleOracleFixtureMetadata {
  id: string;
  categories: string[];
  hostComparable: boolean;
}

export const nativeBattleOracleFixtures: NativeBattleOracleFixtureMetadata[] = [
  {
    id: 'wild-opening-exchange',
    categories: ['battle-mode:wild', 'end-turn-timing', 'move-exchange', 'status-end-turn-timing', 'wild-battle'],
    hostComparable: true
  },
  {
    id: 'trainer-shift-prompt',
    categories: ['battle-mode:trainer', 'faint-replacement', 'forced-faint-replacement', 'post-battle-script', 'trainer-battle', 'trainer-class'],
    hostComparable: true
  },
  {
    id: 'wild-catch',
    categories: ['capture', 'capture-edge-case', 'post-battle-script', 'wild-battle'],
    hostComparable: true
  },
  {
    id: 'battle-whiteout',
    categories: ['battle-mode:trainer', 'post-battle-script', 'trainer-battle', 'whiteout'],
    hostComparable: true
  },
  {
    id: 'wild-status-exchange',
    categories: ['end-turn-timing', 'status-end-turn-timing', 'status-move', 'wild-battle'],
    hostComparable: true
  },
  {
    id: 'wild-player-switch',
    categories: ['player-switch', 'switching', 'wild-battle'],
    hostComparable: true
  },
  {
    id: 'wild-run-escape',
    categories: ['battle-mode:wild', 'flee', 'wild-battle'],
    hostComparable: true
  },
  {
    id: 'trainer-ai-item-heal',
    categories: ['ai-item', 'battle-mode:trainer', 'held-item', 'item-timing', 'trainer-ai', 'trainer-battle', 'trainer-class'],
    hostComparable: false
  },
  {
    id: 'trainer-ai-switch-perish-song',
    categories: ['ai-switch', 'battle-mode:trainer', 'switching', 'trainer-ai', 'trainer-battle'],
    hostComparable: false
  },
  {
    id: 'safari-bait-flow',
    categories: ['battle-mode:safari', 'capture', 'capture-edge-case', 'flee', 'safari', 'safari-bait', 'safari-run'],
    hostComparable: false
  },
  {
    id: 'safari-rock-capture-edge',
    categories: ['battle-mode:safari', 'capture', 'capture-edge-case', 'flee', 'safari', 'safari-rock'],
    hostComparable: false
  },
  {
    id: 'priority-quick-attack',
    categories: ['move-priority', 'priority', 'wild-battle'],
    hostComparable: false
  },
  {
    id: 'multi-hit-fury-attack',
    categories: ['multi-hit', 'multi-hit-move', 'wild-battle'],
    hostComparable: false
  },
  {
    id: 'ability-wonder-guard-block',
    categories: ['ability', 'move-effect', 'wild-battle'],
    hostComparable: false
  },
  {
    id: 'post-battle-reward-level-up',
    categories: ['evolution', 'experience', 'level-up', 'post-battle-script', 'trainer-battle'],
    hostComparable: false
  },
  {
    id: 'doubles-partner-follow-me',
    categories: ['battle-mode:trainer', 'double-battle', 'multi-battle', 'partner', 'targeting'],
    hostComparable: false
  }
];

const makeMove = (moveId: string): BattleMove => {
  const move = getDecompBattleMove(moveId);
  if (!move) {
    throw new Error(`Missing decomp move ${moveId}`);
  }
  return {
    id: move.id,
    name: move.displayName,
    power: move.power,
    type: move.type.replace(/^TYPE_/u, '').toLowerCase() as PokemonType,
    accuracy: move.accuracy,
    pp: move.pp,
    ppRemaining: move.pp,
    priority: move.priority,
    effect: move.effect,
    effectScriptLabel: move.effectScriptLabel,
    target: move.target,
    secondaryEffectChance: move.secondaryEffectChance,
    flags: [...move.flags]
  };
};

export const battleParityFixtures: BattleParityFixture[] = [
  {
    id: 'wild-opening-exchange',
    description: 'wild singles opening move exchange produces a deterministic trace',
    tags: ['native-oracle', 'wild', 'singles', 'move-exchange', 'long-native-trace'],
    startConfig: {
      mode: 'wild',
      playerParty: [createBattlePokemonFromSpecies('BULBASAUR', 5)],
      opponentParty: [createBattlePokemonFromSpecies('RATTATA', 4)]
    },
    setup: (battle) => {
      battle.phase = 'moveSelect';
      battle.playerMon.speed = 99;
      battle.wildMon.speed = 1;
      battle.moves = [makeMove('TACKLE')];
      battle.playerMon.moves = battle.moves;
      battle.wildMoves = [makeMove('TAIL_WHIP')];
      battle.wildMon.moves = battle.wildMoves;
    },
    steps: [
      { input: 'confirm' },
      { input: 'confirm', untilPhase: 'command', maxSteps: 6 }
    ]
  },
  {
    id: 'trainer-shift-prompt',
    description: 'trainer KO flow queues the shift prompt before the next send-out',
    tags: ['native-oracle', 'trainer', 'trainer-class', 'singles', 'faint-replacement', 'post-battle-flow', 'long-native-trace'],
    startConfig: {
      mode: 'trainer',
      battleStyle: 'shift',
      playerParty: [
        createBattlePokemonFromSpecies('BULBASAUR', 5),
        createBattlePokemonFromSpecies('PIDGEY', 5)
      ],
      opponentName: 'BROCK',
      trainerId: 'TRAINER_BROCK',
      opponentParty: [
        {
          ...createBattlePokemonFromSpecies('GEODUDE', 12),
          hp: 1
        },
        createBattlePokemonFromSpecies('ONIX', 14)
      ]
    },
    setup: (battle) => {
      battle.phase = 'moveSelect';
      battle.playerMon.speed = 99;
      battle.wildMon.speed = 1;
      battle.moves = [makeMove('TACKLE')];
      battle.playerMon.moves = battle.moves;
      battle.wildMoves = [makeMove('SPLASH')];
      battle.wildMon.moves = battle.wildMoves;
    },
    steps: [
      { input: 'confirm' },
      { input: 'confirm', untilPhase: 'shiftPrompt', maxSteps: 8 }
    ]
  },
  {
    id: 'wild-catch',
    description: 'catch flow records caught-mon payloads and resolved state deterministically',
    tags: ['native-oracle', 'wild', 'capture', 'post-battle-flow', 'long-native-trace'],
    encounterSeed: 0,
    startConfig: {
      mode: 'wild',
      playerParty: [createBattlePokemonFromSpecies('BULBASAUR', 5)],
      opponentParty: [createBattlePokemonFromSpecies('MAGIKARP', 5)]
    },
    setup: (battle) => {
      battle.phase = 'bagSelect';
      battle.selectedBagIndex = 0;
      battle.bag.pokeBalls = 1;
      battle.bag.greatBalls = 0;
      battle.wildMon.hp = 1;
      battle.wildMon.catchRate = 255;
    },
    steps: [
      { input: 'confirm' },
      { input: 'confirm', untilPhase: 'resolved', maxSteps: 4 }
    ]
  },
  {
    id: 'wild-status-exchange',
    description: 'wild singles status move exchange preserves non-damaging move memory',
    tags: ['native-oracle', 'wild', 'singles', 'status-move', 'end-turn-timing', 'status-end-turn-timing', 'long-native-trace'],
    startConfig: {
      mode: 'wild',
      playerParty: [createBattlePokemonFromSpecies('BULBASAUR', 5)],
      opponentParty: [createBattlePokemonFromSpecies('RATTATA', 4)]
    },
    setup: (battle) => {
      battle.phase = 'moveSelect';
      battle.playerMon.speed = 99;
      battle.wildMon.speed = 1;
      battle.moves = [makeMove('GROWL')];
      battle.playerMon.moves = battle.moves;
      battle.wildMoves = [makeMove('TAIL_WHIP')];
      battle.wildMon.moves = battle.wildMoves;
    },
    steps: [
      { input: 'confirm' },
      { input: 'confirm', untilPhase: 'command', maxSteps: 6 }
    ]
  },
  {
    id: 'wild-player-switch',
    description: 'wild singles player switch consumes the player action and lets the foe act',
    tags: ['native-oracle', 'wild', 'switch-flow', 'switching', 'long-native-trace'],
    startConfig: {
      mode: 'wild',
      playerParty: [
        createBattlePokemonFromSpecies('BULBASAUR', 5),
        createBattlePokemonFromSpecies('PIDGEY', 5)
      ],
      opponentParty: [createBattlePokemonFromSpecies('RATTATA', 4)]
    },
    setup: (battle) => {
      battle.phase = 'command';
      battle.selectedCommandIndex = 2;
      battle.selectedPartyIndex = 1;
      battle.playerMon.speed = 99;
      battle.wildMon.speed = 1;
      battle.moves = [makeMove('TACKLE')];
      battle.playerMon.moves = battle.moves;
      battle.wildMoves = [makeMove('TAIL_WHIP')];
      battle.wildMon.moves = battle.wildMoves;
    },
    steps: [
      { input: 'confirm' },
      { input: 'confirm', untilPhase: 'command', maxSteps: 6 }
    ]
  },
  {
    id: 'wild-run-escape',
    description: 'wild singles run action resolves with the escaped outcome',
    tags: ['native-oracle', 'wild', 'flee', 'long-native-trace'],
    startConfig: {
      mode: 'wild',
      playerParty: [createBattlePokemonFromSpecies('BULBASAUR', 5)],
      opponentParty: [createBattlePokemonFromSpecies('RATTATA', 4)]
    },
    setup: (battle) => {
      battle.phase = 'command';
      battle.selectedCommandIndex = 3;
      battle.playerMon.speed = 99;
      battle.wildMon.speed = 1;
      battle.moves = [makeMove('TACKLE')];
      battle.playerMon.moves = battle.moves;
      battle.wildMoves = [makeMove('TAIL_WHIP')];
      battle.wildMon.moves = battle.wildMoves;
    },
    steps: [
      { input: 'confirm', untilPhase: 'resolved', maxSteps: 4 }
    ]
  },
  {
    id: 'battle-whiteout',
    description: 'trainer loss records whiteout metadata and resolved outcome deterministically',
    tags: ['native-oracle', 'trainer', 'whiteout', 'post-battle-flow', 'long-native-trace'],
    startConfig: {
      mode: 'trainer',
      playerParty: [createBattlePokemonFromSpecies('BULBASAUR', 5)],
      opponentName: 'BROCK',
      trainerId: 'TRAINER_BROCK',
      opponentParty: [createBattlePokemonFromSpecies('GEODUDE', 14)]
    },
    setup: (battle) => {
      battle.phase = 'moveSelect';
      battle.playerMon.hp = 1;
      battle.playerMon.speed = 1;
      battle.wildMon.speed = 99;
      battle.moves = [makeMove('GROWL')];
      battle.playerMon.moves = battle.moves;
      battle.wildMoves = [makeMove('TACKLE')];
      battle.wildMon.moves = battle.wildMoves;
    },
    steps: [
      { input: 'confirm' },
      { input: 'confirm', untilPhase: 'resolved', maxSteps: 6 }
    ]
  },
  {
    id: 'vm-side-condition-light-screen',
    description: 'side-condition script path records screen setup command sequencing',
    tags: ['side-condition', 'vm-command', 'fixture-corpus'],
    nativeOracle: false,
    startConfig: {
      mode: 'wild',
      playerParty: [createBattlePokemonFromSpecies('BULBASAUR', 12)],
      opponentParty: [createBattlePokemonFromSpecies('RATTATA', 8)]
    },
    setup: (battle) => {
      battle.phase = 'moveSelect';
      battle.playerMon.speed = 99;
      battle.wildMon.speed = 1;
      battle.moves = [makeMove('LIGHT_SCREEN')];
      battle.playerMon.moves = battle.moves;
      battle.wildMoves = [makeMove('SPLASH')];
      battle.wildMon.moves = battle.wildMoves;
    },
    steps: [
      { input: 'confirm' },
      { input: 'confirm', untilPhase: 'command', maxSteps: 6 }
    ]
  },
  {
    id: 'vm-weather-sandstorm',
    description: 'weather script path records weather setup command sequencing',
    tags: ['weather', 'vm-command', 'fixture-corpus'],
    nativeOracle: false,
    startConfig: {
      mode: 'wild',
      playerParty: [createBattlePokemonFromSpecies('SANDSHREW', 12)],
      opponentParty: [createBattlePokemonFromSpecies('PIDGEY', 8)]
    },
    setup: (battle) => {
      battle.phase = 'moveSelect';
      battle.playerMon.speed = 99;
      battle.wildMon.speed = 1;
      battle.moves = [makeMove('SANDSTORM')];
      battle.playerMon.moves = battle.moves;
      battle.wildMoves = [makeMove('SPLASH')];
      battle.wildMon.moves = battle.wildMoves;
    },
    steps: [
      { input: 'confirm' },
      { input: 'confirm', untilPhase: 'command', maxSteps: 8 }
    ]
  },
  {
    id: 'vm-disable-command-path',
    description: 'disable script path records low-frequency disable command sequencing',
    tags: ['move-limitation', 'vm-command', 'fixture-corpus'],
    nativeOracle: false,
    startConfig: {
      mode: 'wild',
      playerParty: [createBattlePokemonFromSpecies('BULBASAUR', 12)],
      opponentParty: [createBattlePokemonFromSpecies('RATTATA', 8)]
    },
    setup: (battle) => {
      battle.phase = 'moveSelect';
      battle.playerMon.speed = 99;
      battle.wildMon.speed = 1;
      battle.wildMon.volatile.lastMoveUsedId = 'TACKLE';
      battle.moves = [makeMove('DISABLE')];
      battle.playerMon.moves = battle.moves;
      battle.wildMoves = [makeMove('TACKLE')];
      battle.wildMon.moves = battle.wildMoves;
    },
    steps: [
      { input: 'confirm' },
      { input: 'confirm', untilPhase: 'command', maxSteps: 8 }
    ]
  },
  {
    id: 'vm-dynamic-damage-magnitude',
    description: 'dynamic damage command path records Magnitude power calculation and message ordering',
    tags: ['move-effect', 'dynamic-damage', 'vm-command', 'fixture-corpus'],
    nativeOracle: false,
    encounterSeed: 4,
    startConfig: {
      mode: 'wild',
      playerParty: [createBattlePokemonFromSpecies('DIGLETT', 18)],
      opponentParty: [createBattlePokemonFromSpecies('RATTATA', 12)]
    },
    setup: (battle) => {
      battle.phase = 'moveSelect';
      battle.playerMon.speed = 99;
      battle.wildMon.speed = 1;
      battle.moves = [makeMove('MAGNITUDE')];
      battle.playerMon.moves = battle.moves;
      battle.wildMoves = [makeMove('SPLASH')];
      battle.wildMon.moves = battle.wildMoves;
    },
    steps: [
      { input: 'confirm' },
      { input: 'confirm', untilPhase: 'command', maxSteps: 8 }
    ]
  },
  {
    id: 'vm-counter-damage-command',
    description: 'Counter damage command path uses last physical damage memory through the VM',
    tags: ['move-effect', 'fixed-damage', 'counter-mirror', 'vm-command', 'fixture-corpus'],
    nativeOracle: false,
    startConfig: {
      mode: 'wild',
      playerParty: [createBattlePokemonFromSpecies('MANKEY', 18)],
      opponentParty: [createBattlePokemonFromSpecies('RATTATA', 12)]
    },
    setup: (battle) => {
      battle.phase = 'moveSelect';
      battle.playerMon.speed = 99;
      battle.wildMon.speed = 1;
      battle.playerMon.volatile.lastDamageTaken = 9;
      battle.playerMon.volatile.lastDamageCategory = 'physical';
      battle.playerMon.volatile.lastDamagedBy = 'opponent';
      battle.moves = [makeMove('COUNTER')];
      battle.playerMon.moves = battle.moves;
      battle.wildMoves = [makeMove('SPLASH')];
      battle.wildMon.moves = battle.wildMoves;
    },
    steps: [
      { input: 'confirm' },
      { input: 'confirm', untilPhase: 'command', maxSteps: 8 }
    ]
  },
  {
    id: 'ability-wonder-guard-block',
    description: 'Wonder Guard ability timing blocks non-super-effective damaging moves',
    tags: ['ability', 'move-effect', 'fixture-corpus'],
    nativeOracle: false,
    startConfig: {
      mode: 'wild',
      playerParty: [createBattlePokemonFromSpecies('RATTATA', 18)],
      opponentParty: [createBattlePokemonFromSpecies('GASTLY', 12)]
    },
    setup: (battle) => {
      battle.phase = 'moveSelect';
      battle.playerMon.speed = 99;
      battle.wildMon.speed = 1;
      battle.wildMon.abilityId = 'WONDER_GUARD';
      battle.wildMon.types = ['ghost'];
      battle.moves = [makeMove('TACKLE')];
      battle.playerMon.moves = battle.moves;
      battle.wildMoves = [makeMove('SPLASH')];
      battle.wildMon.moves = battle.wildMoves;
    },
    steps: [
      { input: 'confirm' },
      { input: 'confirm', untilPhase: 'command', maxSteps: 8 }
    ]
  },
  {
    id: 'trainer-ai-item-heal',
    description: 'trainer item action happens before move choice and records AI item locals',
    tags: ['trainer', 'trainer-class', 'trainer-ai', 'ai-item', 'held-item', 'item-timing', 'fixture-corpus'],
    nativeOracle: false,
    startConfig: {
      mode: 'trainer',
      opponentName: 'BROCK',
      trainerId: 'TRAINER_BROCK',
      opponentTrainerItems: ['ITEM_SUPER_POTION'],
      playerParty: [createBattlePokemonFromSpecies('BULBASAUR', 16)],
      opponentParty: [
        {
          ...createBattlePokemonFromSpecies('GEODUDE', 12),
          hp: 4
        }
      ]
    },
    setup: (battle) => {
      battle.phase = 'moveSelect';
      battle.playerMon.speed = 1;
      battle.wildMon.speed = 99;
      battle.moves = [makeMove('SPLASH')];
      battle.playerMon.moves = battle.moves;
      battle.wildMoves = [makeMove('TACKLE')];
      battle.wildMon.moves = battle.wildMoves;
    },
    steps: [
      { input: 'confirm' },
      { input: 'confirm', untilPhase: 'command', maxSteps: 8 }
    ]
  },
  {
    id: 'trainer-ai-switch-perish-song',
    description: 'trainer switch helper moves out a Perish Song target before item or move selection',
    tags: ['trainer', 'trainer-ai', 'ai-switch', 'switch-flow', 'switching', 'fixture-corpus'],
    nativeOracle: false,
    encounterSeed: 3,
    startConfig: {
      mode: 'trainer',
      opponentName: 'BROCK',
      trainerId: 'TRAINER_BROCK',
      opponentTrainerAiFlags: ['AI_SCRIPT_CHECK_VIABILITY'],
      playerParty: [createBattlePokemonFromSpecies('BULBASAUR', 16)],
      opponentParty: [
        createBattlePokemonFromSpecies('GEODUDE', 12),
        createBattlePokemonFromSpecies('ONIX', 14)
      ]
    },
    setup: (battle) => {
      battle.phase = 'moveSelect';
      battle.playerMon.speed = 1;
      battle.wildMon.speed = 99;
      battle.wildMon.volatile.perishTurns = 1;
      battle.moves = [makeMove('SPLASH')];
      battle.playerMon.moves = battle.moves;
      battle.wildMoves = [makeMove('TACKLE')];
      battle.wildMon.moves = battle.wildMoves;
      battle.opponentSide.party[1]!.moves = [makeMove('TACKLE')];
    },
    steps: [
      { input: 'confirm' },
      { input: 'confirm', untilPhase: 'command', maxSteps: 8 }
    ]
  },
  {
    id: 'doubles-partner-follow-me',
    description: 'doubles/partner runtime emits four-battler action traces with ally-aware targeting',
    tags: ['doubles', 'double-battle', 'multi-battle', 'partner', 'targeting', 'fixture-corpus'],
    nativeOracle: false,
    startConfig: {
      mode: 'trainer',
      format: 'doubles',
      controlMode: 'partner',
      playerParty: [createBattlePokemonFromSpecies('BULBASAUR', 16)],
      partnerParty: [createBattlePokemonFromSpecies('PIKACHU', 16)],
      opponentParty: [
        createBattlePokemonFromSpecies('RATTATA', 14),
        createBattlePokemonFromSpecies('SPEAROW', 14)
      ]
    },
    setup: (battle) => {
      battle.phase = 'moveSelect';
      battle.playerMon.speed = 20;
      battle.playerSide.party[1]!.speed = 40;
      battle.opponentSide.party[0]!.speed = 10;
      battle.opponentSide.party[1]!.speed = 12;
      battle.moves = [makeMove('FOLLOW_ME')];
      battle.playerMon.moves = battle.moves;
      battle.playerSide.party[1]!.moves = [makeMove('QUICK_ATTACK')];
      battle.opponentSide.party[0]!.moves = [makeMove('TACKLE')];
      battle.opponentSide.party[1]!.moves = [makeMove('TACKLE')];
    },
    steps: [
      { input: 'confirm' },
      { input: 'confirm', untilPhase: 'command', maxSteps: 10 }
    ]
  },
  {
    id: 'safari-bait-flow',
    description: 'Safari bait command updates catch/flee factors and returns through Safari opponent flow',
    tags: ['safari', 'battle-mode', 'capture', 'capture-edge-case', 'flee', 'safari-bait', 'safari-run', 'fixture-corpus'],
    nativeOracle: false,
    encounterSeed: 7,
    startConfig: {
      mode: 'safari',
      battleTypeFlags: ['safari'],
      safariBalls: 12,
      playerParty: [createBattlePokemonFromSpecies('BULBASAUR', 16)],
      opponentParty: [createBattlePokemonFromSpecies('NIDORAN_M', 18)]
    },
    setup: (battle) => {
      battle.phase = 'command';
      battle.selectedCommandIndex = 1;
    },
    steps: [
      { input: 'confirm' },
      { input: 'confirm', untilPhase: 'command', maxSteps: 8 }
    ]
  },
  {
    id: 'safari-rock-capture-edge',
    description: 'Safari rock command raises catch pressure while preserving Safari flee timing',
    tags: ['safari', 'battle-mode', 'capture', 'capture-edge-case', 'flee', 'safari-rock', 'fixture-corpus'],
    nativeOracle: false,
    encounterSeed: 9,
    startConfig: {
      mode: 'safari',
      battleTypeFlags: ['safari'],
      safariBalls: 12,
      playerParty: [createBattlePokemonFromSpecies('BULBASAUR', 16)],
      opponentParty: [createBattlePokemonFromSpecies('NIDORAN_M', 18)]
    },
    setup: (battle) => {
      battle.phase = 'command';
      battle.selectedCommandIndex = 2;
    },
    steps: [
      { input: 'confirm' },
      { input: 'confirm', untilPhase: 'command', maxSteps: 8 }
    ]
  },
  {
    id: 'priority-quick-attack',
    description: 'positive-priority move ordering beats a faster opposing normal-priority action',
    tags: ['move-effect', 'priority', 'fixture-corpus'],
    nativeOracle: false,
    startConfig: {
      mode: 'wild',
      playerParty: [createBattlePokemonFromSpecies('RATTATA', 18)],
      opponentParty: [createBattlePokemonFromSpecies('PIDGEY', 18)]
    },
    setup: (battle) => {
      battle.phase = 'moveSelect';
      battle.playerMon.speed = 1;
      battle.wildMon.speed = 99;
      battle.moves = [makeMove('QUICK_ATTACK')];
      battle.playerMon.moves = battle.moves;
      battle.wildMoves = [makeMove('TACKLE')];
      battle.wildMon.moves = battle.wildMoves;
    },
    steps: [
      { input: 'confirm' },
      { input: 'confirm', untilPhase: 'command', maxSteps: 8 }
    ]
  },
  {
    id: 'multi-hit-fury-attack',
    description: 'multi-hit move path records repeated hit accounting before returning to command',
    tags: ['move-effect', 'multi-hit', 'fixture-corpus'],
    nativeOracle: false,
    encounterSeed: 2,
    startConfig: {
      mode: 'wild',
      playerParty: [createBattlePokemonFromSpecies('SPEAROW', 18)],
      opponentParty: [createBattlePokemonFromSpecies('RATTATA', 18)]
    },
    setup: (battle) => {
      battle.phase = 'moveSelect';
      battle.playerMon.speed = 99;
      battle.wildMon.speed = 1;
      battle.moves = [makeMove('FURY_ATTACK')];
      battle.playerMon.moves = battle.moves;
      battle.wildMoves = [makeMove('SPLASH')];
      battle.wildMon.moves = battle.wildMoves;
    },
    steps: [
      { input: 'confirm' },
      { input: 'confirm', untilPhase: 'command', maxSteps: 10 }
    ]
  },
  {
    id: 'ghost-ball-block',
    description: 'ghost battle capture block preserves ball count and script label',
    tags: ['ghost', 'battle-mode', 'capture', 'fixture-corpus'],
    nativeOracle: false,
    startConfig: {
      mode: 'ghost',
      battleTypeFlags: ['ghost'],
      playerParty: [createBattlePokemonFromSpecies('BULBASAUR', 16)],
      opponentParty: [createBattlePokemonFromSpecies('GASTLY', 18)]
    },
    setup: (battle) => {
      battle.phase = 'bagSelect';
      battle.selectedBagIndex = 0;
      battle.bag.pokeBalls = 1;
    },
    steps: [
      { input: 'confirm' },
      { input: 'confirm', untilPhase: 'command', maxSteps: 6 }
    ]
  },
  {
    id: 'old-man-tutorial-catch',
    description: 'old-man tutorial ball throw uses tutorial catch script without adding a caught mon',
    tags: ['old-man-tutorial', 'battle-mode', 'capture', 'fixture-corpus'],
    nativeOracle: false,
    startConfig: {
      mode: 'oldManTutorial',
      battleTypeFlags: ['oldManTutorial'],
      playerParty: [createBattlePokemonFromSpecies('WEEDLE', 5)],
      opponentParty: [createBattlePokemonFromSpecies('RATTATA', 5)]
    },
    setup: (battle) => {
      battle.phase = 'bagSelect';
      battle.selectedBagIndex = 0;
      battle.bag.pokeBalls = 1;
    },
    steps: [
      { input: 'confirm' },
      { input: 'confirm', untilPhase: 'script', maxSteps: 2 }
    ]
  },
  {
    id: 'post-battle-reward-level-up',
    description: 'trainer win emits structured reward and pending level-up handoff data',
    tags: ['post-battle-flow', 'post-battle-script', 'experience', 'evolution', 'reward', 'fixture-corpus'],
    nativeOracle: false,
    startConfig: {
      mode: 'trainer',
      opponentName: 'BUG CATCHER',
      trainerId: 'TRAINER_BUG_CATCHER_RICK',
      playerParty: [createBattlePokemonFromSpecies('CHARMANDER', 15)],
      opponentParty: [
        {
          ...createBattlePokemonFromSpecies('CATERPIE', 3),
          hp: 1
        }
      ]
    },
    setup: (battle) => {
      battle.phase = 'moveSelect';
      battle.playerMon.speed = 99;
      battle.wildMon.speed = 1;
      battle.playerMon.expProgress = 0.99;
      battle.moves = [makeMove('EMBER')];
      battle.playerMon.moves = battle.moves;
      battle.wildMoves = [makeMove('SPLASH')];
      battle.wildMon.moves = battle.wildMoves;
    },
    steps: [
      { input: 'confirm' },
      { input: 'confirm', untilPhase: 'resolved', maxSteps: 10, applyRewards: true }
    ]
  }
];
