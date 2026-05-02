import cryIdsSource from '../../../src/data/pokemon/cry_ids.h?raw';

export interface HoennSpeciesCryIdEntry {
  species: string;
  cry: string;
}

export const CRY_IDS_SOURCE = cryIdsSource;
export const HOENN_MON_SPECIES_START = 277;

export const parseHoennSpeciesCryIds = (source: string): HoennSpeciesCryIdEntry[] =>
  [...source.matchAll(/\[(SPECIES_\w+)\s+-\s+HOENN_MON_SPECIES_START\]\s*=\s*(CRY_\w+)/gu)].map((match) => ({
    species: match[1],
    cry: match[2]
  }));

export const sHoennSpeciesIdToCryId = parseHoennSpeciesCryIds(cryIdsSource);

export const getHoennSpeciesCryId = (species: string): string | undefined =>
  sHoennSpeciesIdToCryId.find((entry) => entry.species === species)?.cry;
