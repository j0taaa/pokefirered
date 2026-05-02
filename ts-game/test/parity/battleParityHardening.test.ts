import { describe, expect, test } from 'vitest';
import { runBattleParityFixture } from '../../src/game/battleParity';
import { battleParityFixtures } from './battleParityFixtures';

const requiredCoverageTags = [
  'move-effect',
  'dynamic-damage',
  'fixed-damage',
  'ability',
  'item-timing',
  'trainer-ai',
  'ai-switch',
  'doubles',
  'partner',
  'safari',
  'ghost',
  'old-man-tutorial',
  'capture',
  'flee',
  'switch-flow',
  'faint-replacement',
  'post-battle-flow',
  'vm-command'
];

const getFixtureTags = (): Set<string> =>
  new Set(battleParityFixtures.flatMap((fixture) => fixture.tags ?? []));

describe('battle parity hardening gates', () => {
  test('fixture corpus covers every battle-parity gap category tracked for hardening', () => {
    const tags = getFixtureTags();
    for (const tag of requiredCoverageTags) {
      expect(tags.has(tag), `missing parity fixture coverage tag: ${tag}`).toBe(true);
    }
    expect(battleParityFixtures.length).toBeGreaterThanOrEqual(20);
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
