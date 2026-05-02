import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { describe, expect, test } from 'vitest';
import { runBattleParityFixture } from '../../src/game/battleParity';
import { serializeComparableBattleOracle } from '../../src/game/battleParityComparable';
import { battleParityFixtures } from './battleParityFixtures';

const normalize = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const repoRoot = path.resolve(import.meta.dirname, '..', '..', '..');
const toolPath = path.join(repoRoot, 'tools', 'battletrace', process.platform === 'win32' ? 'battletrace.cmd' : 'battletrace');
const hostToolTestTimeoutMs = 30_000;

describe('battle parity host tool', () => {
  test.each(battleParityFixtures.filter((fixture) => fixture.nativeOracle !== false))('$id matches the external host-side parity oracle', (fixture) => {
    const actual = normalize(serializeComparableBattleOracle(fixture.id, runBattleParityFixture(fixture)));
    const expected = JSON.parse(execFileSync(toolPath, ['--fixture', fixture.id], {
      encoding: 'utf8',
      timeout: hostToolTestTimeoutMs
    })) as typeof actual;
    expect(actual).toEqual(expected);
  }, hostToolTestTimeoutMs);
});
