import { describe, expect, test } from 'vitest';
import { runBattleParityFixture } from '../../src/game/battleParity';
import { battleParityFixtures } from './battleParityFixtures';

describe('battle parity fixtures', () => {
  test.each(battleParityFixtures)('$id', (fixture) => {
    expect(runBattleParityFixture(fixture)).toMatchSnapshot();
  });
});
