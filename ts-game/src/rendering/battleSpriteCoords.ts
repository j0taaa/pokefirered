import frontPicCoordsRaw from '../../../src/data/pokemon_graphics/front_pic_coordinates.h?raw';
import backPicCoordsRaw from '../../../src/data/pokemon_graphics/back_pic_coordinates.h?raw';

export interface BattleSpriteCoords {
  width: number;
  height: number;
  yOffset: number;
}

const DEFAULT_COORDS: BattleSpriteCoords = {
  width: 64,
  height: 64,
  yOffset: 0
};

const normalizeSpecies = (species: string): string => species.replace(/^SPECIES_/u, '').toUpperCase();

const parseBattleSpriteCoords = (source: string): Map<string, BattleSpriteCoords> => {
  const matches = source.matchAll(
    /\[SPECIES_(\w+)\]\s*=\s*\{\s*\.size\s*=\s*MON_COORDS_SIZE\((\d+),\s*(\d+)\),\s*\.y_offset\s*=\s*(\d+)/gu
  );
  const coords = new Map<string, BattleSpriteCoords>();
  for (const match of matches) {
    coords.set(normalizeSpecies(match[1] ?? ''), {
      width: Number.parseInt(match[2] ?? '64', 10),
      height: Number.parseInt(match[3] ?? '64', 10),
      yOffset: Number.parseInt(match[4] ?? '0', 10)
    });
  }
  return coords;
};

const frontCoords = parseBattleSpriteCoords(frontPicCoordsRaw);
const backCoords = parseBattleSpriteCoords(backPicCoordsRaw);

export const getBattleSpriteCoords = (species: string, side: 'player' | 'opponent'): BattleSpriteCoords =>
  (side === 'player' ? backCoords : frontCoords).get(normalizeSpecies(species)) ?? DEFAULT_COORDS;
