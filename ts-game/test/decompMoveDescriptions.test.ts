import { describe, expect, it } from 'vitest';
import {
  getMoveDescription,
  gMoveDescription_Dig,
  gMoveDescription_KarateChop,
  gMoveDescription_Pound,
  gMoveDescription_PsychoBoost,
  gMoveDescription_Surf,
  gMoveDescriptionPointers,
  MOVE_DESCRIPTION_POINTER_SYMBOLS,
  MOVE_DIG,
  MOVE_KARATE_CHOP,
  MOVE_NONE,
  MOVE_POUND,
  MOVE_PSYCHO_BOOST,
  MOVE_SURF,
  MOVES_COUNT,
} from '../src/game/decompMoveDescriptions';

describe('decompMoveDescriptions', () => {
  it('ports the MOVES_COUNT - 1 description pointer table', () => {
    expect(gMoveDescriptionPointers).toHaveLength(MOVES_COUNT - 1);
    expect(MOVE_DESCRIPTION_POINTER_SYMBOLS).toHaveLength(MOVES_COUNT - 1);
    expect(gMoveDescriptionPointers.every((description) => typeof description === 'string')).toBe(true);
  });

  it('keeps pointer slots aligned to MOVE_* - 1 indices', () => {
    expect(gMoveDescriptionPointers[MOVE_POUND - 1]).toBe(gMoveDescription_Pound);
    expect(gMoveDescriptionPointers[MOVE_KARATE_CHOP - 1]).toBe(gMoveDescription_KarateChop);
    expect(gMoveDescriptionPointers[MOVE_SURF - 1]).toBe(gMoveDescription_Surf);
    expect(gMoveDescriptionPointers[MOVE_DIG - 1]).toBe(gMoveDescription_Dig);
    expect(gMoveDescriptionPointers[MOVE_PSYCHO_BOOST - 1]).toBe(gMoveDescription_PsychoBoost);
  });

  it('preserves representative decompiled description text exactly', () => {
    expect(gMoveDescription_Pound).toBe(
      'A physical attack\ndelivered with a\nlong tail or a\nforeleg, etc.',
    );
    expect(gMoveDescription_KarateChop).toBe(
      'The foe is attacked\nwith a sharp chop.\nIt has a high\ncritical-hit ratio.',
    );
    expect(gMoveDescription_Surf).toBe(
      'A big wave crashes\ndown on the foe.\nCan also be used\nfor crossing water.',
    );
    expect(gMoveDescription_Dig).toBe(
      'An attack that hits\non the 2nd turn.\nCan also be used\nto exit dungeons.',
    );
    expect(gMoveDescription_PsychoBoost).toBe(
      "An intense attack\nthat also sharply\nreduces the user's\nSP. ATK stat.",
    );
  });

  it('matches the C helper indexing behavior for consumers', () => {
    expect(getMoveDescription(MOVE_NONE)).toBeUndefined();
    expect(getMoveDescription(MOVE_POUND)).toBe(gMoveDescription_Pound);
    expect(getMoveDescription(MOVE_PSYCHO_BOOST)).toBe(gMoveDescription_PsychoBoost);
    expect(getMoveDescription(MOVES_COUNT)).toBeUndefined();
  });
});
