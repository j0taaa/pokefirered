export type FieldPokemonStatus = 'none' | 'poison';

export interface FieldPokemonEvs {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  spAttack: number;
  spDefense: number;
}

export interface FieldPokemon {
  species: string;
  nickname?: string;
  moves?: string[];
  movePpRemaining?: number[];
  otName?: string;
  otId?: number;
  personality?: number;
  friendship?: number;
  isEgg?: boolean;
  heldItemId?: string | null;
  mailId?: number;
  level: number;
  expProgress?: number;
  evs?: FieldPokemonEvs;
  championRibbon?: boolean;
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
  /** `list_menu.c` scroll state for ordered dex list (`kantoOrderMenuCursorPos` / `ItemsAbove`). */
  orderListCursorPos: number;
  orderListItemsAbove: number;
  seenSpecies: string[];
  caughtSpecies: string[];
}

const normalizeSpecies = (species: string): string => species.replace(/^SPECIES_/u, '').toUpperCase();

export const createDefaultParty = (): FieldPokemon[] => [
  {
    species: 'CHARMANDER',
    level: 8,
    expProgress: 0.62,
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
    expProgress: 0.34,
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
  orderListCursorPos: 0,
  orderListItemsAbove: 0,
  seenSpecies: ['CHARMANDER', 'PIDGEY'],
  caughtSpecies: ['CHARMANDER', 'PIDGEY']
});

export const cloneFieldPokemon = (pokemon: FieldPokemon): FieldPokemon => ({
  ...pokemon,
  evs: pokemon.evs ? { ...pokemon.evs } : undefined,
  moves: pokemon.moves ? [...pokemon.moves] : undefined,
  movePpRemaining: pokemon.movePpRemaining ? [...pokemon.movePpRemaining] : undefined,
  types: [...pokemon.types]
});

export const cloneParty = (party: FieldPokemon[]): FieldPokemon[] => party.map(cloneFieldPokemon);

export const clonePokedex = (pokedex: PokedexState): PokedexState => ({
  dexMode: pokedex.dexMode,
  selectedIndex: pokedex.selectedIndex,
  orderListCursorPos: pokedex.orderListCursorPos ?? 0,
  orderListItemsAbove: pokedex.orderListItemsAbove ?? 0,
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

export const getFieldPokemonDisplayName = (pokemon: FieldPokemon): string =>
  pokemon.nickname && pokemon.nickname.length > 0
    ? pokemon.nickname
    : getSpeciesDisplayName(pokemon.species);

export const healFieldPokemon = (pokemon: FieldPokemon): void => {
  pokemon.hp = pokemon.maxHp;
  pokemon.status = 'none';
};

export const healParty = (party: FieldPokemon[]): void => {
  for (const pokemon of party) {
    healFieldPokemon(pokemon);
  }
};
