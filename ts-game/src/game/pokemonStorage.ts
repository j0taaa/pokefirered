export type FieldPokemonStatus = 'none' | 'poison';

export interface FieldPokemon {
  species: string;
  level: number;
  maxHp: number;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  spAttack: number;
  spDefense: number;
  catchRate: number;
  types: string[];
  status: FieldPokemonStatus;
}

export interface PokedexState {
  dexMode: 'KANTO' | 'NATIONAL';
  selectedIndex: number;
  seenSpecies: string[];
  caughtSpecies: string[];
}

const normalizeSpecies = (species: string): string => species.replace(/^SPECIES_/u, '').toUpperCase();

export const createDefaultParty = (): FieldPokemon[] => [
  {
    species: 'CHARMANDER',
    level: 8,
    maxHp: 23,
    hp: 23,
    attack: 13,
    defense: 11,
    speed: 14,
    spAttack: 15,
    spDefense: 12,
    catchRate: 45,
    types: ['fire'],
    status: 'none'
  },
  {
    species: 'PIDGEY',
    level: 7,
    maxHp: 21,
    hp: 21,
    attack: 11,
    defense: 10,
    speed: 13,
    spAttack: 10,
    spDefense: 10,
    catchRate: 255,
    types: ['normal', 'flying'],
    status: 'none'
  }
];

export const createDefaultPokedex = (): PokedexState => ({
  dexMode: 'KANTO',
  selectedIndex: 0,
  seenSpecies: ['CHARMANDER', 'PIDGEY'],
  caughtSpecies: ['CHARMANDER', 'PIDGEY']
});

export const cloneFieldPokemon = (pokemon: FieldPokemon): FieldPokemon => ({
  ...pokemon,
  types: [...pokemon.types]
});

export const cloneParty = (party: FieldPokemon[]): FieldPokemon[] => party.map(cloneFieldPokemon);

export const clonePokedex = (pokedex: PokedexState): PokedexState => ({
  dexMode: pokedex.dexMode,
  selectedIndex: pokedex.selectedIndex,
  seenSpecies: [...pokedex.seenSpecies],
  caughtSpecies: [...pokedex.caughtSpecies]
});

export const addPokedexSeenSpecies = (pokedex: PokedexState, species: string): void => {
  const normalized = normalizeSpecies(species);
  if (!pokedex.seenSpecies.includes(normalized)) {
    pokedex.seenSpecies.push(normalized);
    pokedex.seenSpecies.sort();
  }
};

export const addPokedexCaughtSpecies = (pokedex: PokedexState, species: string): void => {
  const normalized = normalizeSpecies(species);
  addPokedexSeenSpecies(pokedex, normalized);
  if (!pokedex.caughtSpecies.includes(normalized)) {
    pokedex.caughtSpecies.push(normalized);
    pokedex.caughtSpecies.sort();
  }
};

export const addPokemonToParty = (party: FieldPokemon[], pokemon: FieldPokemon): boolean => {
  if (party.length >= 6) {
    return false;
  }

  party.push(cloneFieldPokemon({ ...pokemon, species: normalizeSpecies(pokemon.species) }));
  return true;
};

export const getSpeciesDisplayName = (species: string): string =>
  normalizeSpecies(species).replace(/_/gu, ' ');
