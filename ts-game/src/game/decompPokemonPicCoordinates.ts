import frontPicCoordinatesSource from '../../../src/data/pokemon_graphics/front_pic_coordinates.h?raw';
import backPicCoordinatesSource from '../../../src/data/pokemon_graphics/back_pic_coordinates.h?raw';

export interface PokemonPicCoordinates {
  species: string;
  width: number;
  height: number;
  yOffset: number;
}

export const FRONT_PIC_COORDINATES_SOURCE = frontPicCoordinatesSource;
export const BACK_PIC_COORDINATES_SOURCE = backPicCoordinatesSource;

export const parsePokemonPicCoordinates = (source: string): PokemonPicCoordinates[] =>
  [
    ...source.matchAll(
      /\[(SPECIES_\w+)\]\s*=\s*\{\s*\.size\s*=\s*MON_COORDS_SIZE\((\d+),\s*(\d+)\),\s*\.y_offset\s*=\s*(\d+),\s*\}/gu
    )
  ].map((match) => ({
    species: match[1],
    width: Number.parseInt(match[2], 10),
    height: Number.parseInt(match[3], 10),
    yOffset: Number.parseInt(match[4], 10)
  }));

export const gMonFrontPicCoords = parsePokemonPicCoordinates(frontPicCoordinatesSource);
export const gMonBackPicCoords = parsePokemonPicCoordinates(backPicCoordinatesSource);

export const getPokemonFrontPicCoordinates = (species: string): PokemonPicCoordinates | undefined =>
  gMonFrontPicCoords.find((entry) => entry.species === species);

export const getPokemonBackPicCoordinates = (species: string): PokemonPicCoordinates | undefined =>
  gMonBackPicCoords.find((entry) => entry.species === species);
