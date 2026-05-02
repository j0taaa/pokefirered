import moveConstantsSource from '../../../include/constants/moves.h?raw';
import speciesConstantsSource from '../../../include/constants/species.h?raw';

const parseConstants = (source: string, prefix: string): Map<string, number> => {
  const constants = new Map<string, number>();
  const regex = new RegExp(`^#define ${prefix}(\\w+)\\s+(\\d+)`, 'gmu');

  for (const match of source.matchAll(regex)) {
    constants.set(match[1], Number.parseInt(match[2] ?? '0', 10));
  }

  return constants;
};

const moveConstants = parseConstants(moveConstantsSource, 'MOVE_');
const speciesConstants = parseConstants(speciesConstantsSource, 'SPECIES_');

export const getDecompMoveConstant = (moveId: string | null): number | null =>
  moveId ? (moveConstants.get(moveId) ?? null) : null;

export const getDecompSpeciesConstant = (speciesId: string | null): number | null =>
  speciesId ? (speciesConstants.get(speciesId) ?? null) : null;
