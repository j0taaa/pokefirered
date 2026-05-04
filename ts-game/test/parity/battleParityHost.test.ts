import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, test } from 'vitest';
import { runBattleParityFixture } from '../../src/game/battleParity';
import { serializeComparableBattleOracle } from '../../src/game/battleParityComparable';
import { battleParityFixtures, nativeBattleOracleFixtures, type NativeBattleOracleFixtureMetadata } from './battleParityFixtures';

const normalize = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const repoRoot = path.resolve(import.meta.dirname, '..', '..', '..');
const toolPath = path.join(repoRoot, 'tools', 'battletrace', process.platform === 'win32' ? 'battletrace.cmd' : 'battletrace');
const hostToolTestTimeoutMs = 30_000;
const hostOracleTest = process.env.RUN_BATTLETRACE_HOST_ORACLE === '1' || existsSync(path.join(repoRoot, 'agbcc')) ? test : test.fails;
const listNativeHostFixtures = (): NativeBattleOracleFixtureMetadata[] => JSON.parse(execFileSync(toolPath, ['--list'], {
  encoding: 'utf8',
  timeout: hostToolTestTimeoutMs
})) as NativeBattleOracleFixtureMetadata[];

describe('battle parity host tool', () => {
  test('lists the same deterministic native fixture metadata used by parity hardening', () => {
    expect(listNativeHostFixtures()).toEqual(nativeBattleOracleFixtures);
  });

  test('every executable native-oracle parity fixture is present in the host list', () => {
    const hostComparableIds = new Set(listNativeHostFixtures()
      .filter((fixture) => fixture.hostComparable)
      .map((fixture) => fixture.id));
    const executableFixtureIds = battleParityFixtures
      .filter((fixture) => fixture.nativeOracle !== false)
      .map((fixture) => fixture.id);

    expect([...executableFixtureIds].sort()).toEqual([...hostComparableIds].sort());
  });

  hostOracleTest.each(battleParityFixtures.filter((fixture) => fixture.nativeOracle !== false))('$id matches the external host-side parity oracle', (fixture) => {
    const actual = normalize(serializeComparableBattleOracle(fixture.id, runBattleParityFixture(fixture)));
    const expected = JSON.parse(execFileSync(toolPath, ['--fixture', fixture.id], {
      encoding: 'utf8',
      timeout: hostToolTestTimeoutMs
    })) as typeof actual;
    expect(actual).toEqual(expected);
  }, hostToolTestTimeoutMs);
});
