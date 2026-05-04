import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { describe, expect, test } from 'vitest';
import { runBattleParityFixture } from '../../src/game/battleParity';
import { battleParityFixtures, nativeBattleOracleFixtures, type NativeBattleOracleFixtureMetadata } from './battleParityFixtures';

const requiredCoverageTags = [
  'move-effect',
  'dynamic-damage',
  'fixed-damage',
  'ability',
  'ai-item',
  'item-timing',
  'held-item',
  'trainer-ai',
  'ai-switch',
  'doubles',
  'double-battle',
  'multi-battle',
  'partner',
  'safari',
  'safari-bait',
  'safari-rock',
  'safari-run',
  'ghost',
  'old-man-tutorial',
  'capture',
  'capture-edge-case',
  'flee',
  'switch-flow',
  'switching',
  'faint-replacement',
  'trainer-class',
  'priority',
  'multi-hit',
  'experience',
  'evolution',
  'post-battle-script',
  'status-end-turn-timing',
  'end-turn-timing',
  'post-battle-flow',
  'vm-command'
];

const requiredNativeCoverageCategories = [
  'ability',
  'ai-item',
  'ai-switch',
  'battle-mode:safari',
  'battle-mode:trainer',
  'battle-mode:wild',
  'capture-edge-case',
  'double-battle',
  'end-turn-timing',
  'evolution',
  'experience',
  'forced-faint-replacement',
  'held-item',
  'multi-battle',
  'multi-hit',
  'post-battle-script',
  'priority',
  'safari-bait',
  'safari-rock',
  'safari-run',
  'status-end-turn-timing',
  'switching',
  'trainer-ai',
  'trainer-class'
];

const repoRoot = path.resolve(import.meta.dirname, '..', '..', '..');
const toolPath = path.join(repoRoot, 'tools', 'battletrace', process.platform === 'win32' ? 'battletrace.cmd' : 'battletrace');

const getFixtureTags = (): Set<string> =>
  new Set(battleParityFixtures.flatMap((fixture) => fixture.tags ?? []));

const getNativeHostFixtures = (): NativeBattleOracleFixtureMetadata[] => JSON.parse(execFileSync(toolPath, ['--list'], {
  encoding: 'utf8',
  timeout: 30_000
})) as NativeBattleOracleFixtureMetadata[];

const getFixture = (id: string) => {
  const fixture = battleParityFixtures.find((entry) => entry.id === id);
  if (!fixture) {
    throw new Error(`missing battle parity fixture: ${id}`);
  }
  return fixture;
};

const runFixture = (id: string) => runBattleParityFixture(getFixture(id));

const requiredBattleInventory = {
  moveEffects: [
    'wild-status-exchange',
    'vm-dynamic-damage-magnitude',
    'vm-counter-damage-command',
    'ability-wonder-guard-block',
    'priority-quick-attack',
    'multi-hit-fury-attack'
  ],
  battleScriptCommands: [
    'vm-side-condition-light-screen',
    'vm-weather-sandstorm',
    'vm-disable-command-path',
    'post-battle-reward-level-up',
    'wild-catch',
    'ghost-ball-block',
    'old-man-tutorial-catch'
  ],
  aiCommands: ['trainer-ai-item-heal', 'trainer-ai-switch-perish-song'],
  capturePaths: [
    'wild-catch',
    'wild-run-escape',
    'safari-bait-flow',
    'safari-rock-capture-edge',
    'ghost-ball-block',
    'old-man-tutorial-catch'
  ],
  rewardPaths: ['trainer-shift-prompt', 'battle-whiteout', 'post-battle-reward-level-up'],
  postBattleHandoffs: [
    'trainer-shift-prompt',
    'wild-catch',
    'wild-run-escape',
    'battle-whiteout',
    'post-battle-reward-level-up'
  ]
} as const;

const getBattleInventoryMissing = (): string[] => {
  const fixtureIds = new Set(battleParityFixtures.map((fixture) => fixture.id));
  return Object.entries(requiredBattleInventory).flatMap(([category, ids]) =>
    ids
      .filter((id) => !fixtureIds.has(id))
      .map((id) => `${category}:${id}`)
  );
};

describe('battle parity hardening gates', () => {
  test('fixture corpus covers every battle-parity gap category tracked for hardening', () => {
    const tags = getFixtureTags();
    for (const tag of requiredCoverageTags) {
      expect(tags.has(tag), `missing parity fixture coverage tag: ${tag}`).toBe(true);
    }
    expect(battleParityFixtures.length).toBeGreaterThanOrEqual(20);
  });

  test('native host fixture metadata covers every battle category required before runtime closure', () => {
    const nativeHostFixtures = getNativeHostFixtures();
    expect(nativeHostFixtures).toEqual(nativeBattleOracleFixtures);

    const nativeCategories = new Set(nativeHostFixtures.flatMap((fixture) => fixture.categories));
    for (const category of requiredNativeCoverageCategories) {
      expect(nativeCategories.has(category), `missing native battle fixture category: ${category}`).toBe(true);
    }
  });

  test('native coverage entries correspond to parity corpus fixtures instead of TS-only tag assertions', () => {
    const parityFixtureIds = new Set(battleParityFixtures.map((fixture) => fixture.id));
    for (const fixture of nativeBattleOracleFixtures) {
      expect(parityFixtureIds.has(fixture.id), `native fixture metadata has no parity corpus fixture: ${fixture.id}`).toBe(true);
      expect(fixture.categories.length, `${fixture.id} has no native fixture categories`).toBeGreaterThan(0);
      expect([...fixture.categories].sort()).toEqual(fixture.categories);
    }
  });

  test('Safari native oracle categories include bait, rock, run, and capture edge coverage', () => {
    const safariCategories = new Set(nativeBattleOracleFixtures
      .filter((fixture) => fixture.categories.includes('battle-mode:safari'))
      .flatMap((fixture) => fixture.categories));

    for (const category of ['capture-edge-case', 'safari-bait', 'safari-rock', 'safari-run']) {
      expect(safariCategories.has(category), `missing Safari native fixture category: ${category}`).toBe(true);
    }
  });

  test('battle inventory reports zero missing required runtime categories', () => {
    expect(getBattleInventoryMissing()).toEqual([]);
  });

  test('battle_script_commands.c reward and post-battle handoff paths stay deterministic', () => {
    const snapshot = runFixture('post-battle-reward-level-up');

    expect(snapshot.phase).toBe('resolved');
    expect(snapshot.currentScriptLabel).toBe('BattleScript_LevelUp');
    expect(snapshot.postResult.outcome).toBe('won');
    expect(snapshot.postResult.levelUps).toEqual([{ side: 'player', species: 'CHARMANDER', level: 16 }]);
    expect(snapshot.postResult.pendingEvolutions).toEqual([{ species: 'CHARMANDER', evolvesTo: 'CHARMELEON', level: 16 }]);
    expect(snapshot.trace).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: 'reward', battler: 'player', value: 33, text: 'CHARMANDER gained 33 EXP' }),
      expect.objectContaining({ type: 'phase', phase: 'script' }),
      expect.objectContaining({ type: 'phase', phase: 'resolved' })
    ]));

    const shiftPrompt = runFixture('trainer-shift-prompt');
    expect(shiftPrompt.phase).toBe('shiftPrompt');
    expect(shiftPrompt.currentScriptLabel).toBe('BattleScript_MoveEnd');
    expect(shiftPrompt.vm.pendingMessages).toEqual(expect.arrayContaining([
      'Foe GEODUDE fainted!',
      'BROCK is about to use ONIX.'
    ]));

    const whiteout = runFixture('battle-whiteout');
    expect(whiteout.phase).toBe('resolved');
    expect(whiteout.postResult.outcome).toBe('lost');
    expect(whiteout.postResult.whiteout).toBe(true);
  });

  test('battle_main.c turn order preserves status timing and priority RNG order', () => {
    const statusSnapshot = runFixture('wild-status-exchange');
    expect(statusSnapshot.vm.locals.turnActionOrder).toBe('player,opponent');
    expect(statusSnapshot.vm.locals.executedScriptCommands).toContain('accuracycheck,attackstring,ppreduce');
    expect(statusSnapshot.trace).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: 'message', text: 'BULBASAUR used GROWL!' }),
      expect.objectContaining({ type: 'message', text: 'Foe RATTATA used TAIL WHIP!' })
    ]));

    const prioritySnapshot = runFixture('priority-quick-attack');
    expect(prioritySnapshot.vm.locals.turnActionOrder).toBe('player,opponent');
    expect(prioritySnapshot.battlers.find((battler) => battler.battlerId === 0)?.moveMemory.printedMoveId).toBe('QUICK_ATTACK');
    expect(prioritySnapshot.battlers.find((battler) => battler.battlerId === 1)?.moveMemory.printedMoveId).toBe('TACKLE');
  });

  test('native-oracle fixtures remain explicitly marked and produce non-trivial traces', () => {
    const nativeFixtures = battleParityFixtures.filter((fixture) => fixture.nativeOracle !== false);
    expect(nativeFixtures.length).toBeGreaterThanOrEqual(7);

    for (const fixture of nativeFixtures) {
      expect(fixture.tags).toContain('native-oracle');
      expect(fixture.tags).toContain('long-native-trace');
      const snapshot = runBattleParityFixture(fixture);
      expect(snapshot.trace.length, `${fixture.id} trace is too short for parity`).toBeGreaterThanOrEqual(3);
      expect(
        snapshot.trace.some((event) => event.type === 'script' || event.type === 'message' || event.type === 'chooseAction'),
        `${fixture.id} lacks script/message/action trace events`
      ).toBe(true);
    }
  });

  test('trainer AI fixtures do not hide unsupported AI VM opcodes', () => {
    for (const fixture of battleParityFixtures.filter((entry) => entry.tags?.includes('trainer-ai'))) {
      const unsupportedOpcodes = runBattleParityFixture(fixture).vm.locals.aiUnsupportedOpcodes;
      expect(unsupportedOpcodes ?? '', `${fixture.id} has unsupported AI opcodes`).toBe('');
    }
  });

  test('doubles partner fixture keeps move memory on the acting battler slots', () => {
    const snapshot = runBattleParityFixture(
      battleParityFixtures.find((fixture) => fixture.id === 'doubles-partner-follow-me')!
    );
    const bulbasaur = snapshot.battlers.find((battler) => battler.battlerId === 0)!;
    const rattata = snapshot.battlers.find((battler) => battler.battlerId === 1)!;
    const pikachu = snapshot.battlers.find((battler) => battler.battlerId === 2)!;

    expect(bulbasaur.moveMemory.chosenMoveId).toBe('FOLLOW_ME');
    expect(bulbasaur.moveMemory.printedMoveId).toBe('FOLLOW_ME');
    expect(pikachu.moveMemory.chosenMoveId).toBe('QUICK_ATTACK');
    expect(pikachu.moveMemory.printedMoveId).toBe('QUICK_ATTACK');
    expect(rattata.moveMemory.lastHitByBattler).toBe('2');
  });
});
