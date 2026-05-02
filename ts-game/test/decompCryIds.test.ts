import { describe, expect, test } from 'vitest';
import {
  CRY_IDS_SOURCE,
  HOENN_MON_SPECIES_START,
  getHoennSpeciesCryId,
  sHoennSpeciesIdToCryId
} from '../src/game/decompCryIds';

describe('decomp Hoenn cry ids', () => {
  test('preserves the Hoenn species start define and all cry rows', () => {
    expect(CRY_IDS_SOURCE).toContain('#define HOENN_MON_SPECIES_START 277');
    expect(HOENN_MON_SPECIES_START).toBe(277);
    expect(sHoennSpeciesIdToCryId).toHaveLength(135);
    expect(sHoennSpeciesIdToCryId.slice(0, 6)).toEqual([
      { species: 'SPECIES_TREECKO', cry: 'CRY_TREECKO' },
      { species: 'SPECIES_GROVYLE', cry: 'CRY_GROVYLE' },
      { species: 'SPECIES_SCEPTILE', cry: 'CRY_SCEPTILE' },
      { species: 'SPECIES_TORCHIC', cry: 'CRY_TORCHIC' },
      { species: 'SPECIES_COMBUSKEN', cry: 'CRY_COMBUSKEN' },
      { species: 'SPECIES_BLAZIKEN', cry: 'CRY_BLAZIKEN' }
    ]);
  });

  test('keeps lookup parity for middle and tail species', () => {
    expect(getHoennSpeciesCryId('SPECIES_RAYQUAZA')).toBe('CRY_RAYQUAZA');
    expect(getHoennSpeciesCryId('SPECIES_DEOXYS')).toBe('CRY_DEOXYS');
    expect(getHoennSpeciesCryId('SPECIES_CHIMECHO')).toBe('CRY_CHIMECHO');
    expect(sHoennSpeciesIdToCryId.at(-1)).toEqual({
      species: 'SPECIES_CHIMECHO',
      cry: 'CRY_CHIMECHO'
    });
  });
});
