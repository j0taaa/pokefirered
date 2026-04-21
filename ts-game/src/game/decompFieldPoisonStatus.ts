import { getSpeciesDisplayName, type FieldPokemon } from './pokemonStorage';

export type FieldPoisonResult = 'FLDPSN_NONE' | 'FLDPSN_PSN' | 'FLDPSN_FNT';

export interface FieldPoisonWhiteOutResult {
  faintedMessages: string[];
  allMonsFainted: boolean;
}

const isFieldPoisoned = (pokemon: FieldPokemon): boolean =>
  pokemon.status === 'poison';

export const doPoisonFieldEffect = (party: FieldPokemon[]): FieldPoisonResult => {
  let numPoisoned = 0;
  let numFainted = 0;

  for (const pokemon of party) {
    if (!isFieldPoisoned(pokemon)) {
      continue;
    }

    const hp = Math.max(0, Math.trunc(pokemon.hp));
    pokemon.hp = Math.max(0, hp - 1);
    if (hp === 0 || pokemon.hp === 0) {
      numFainted += 1;
    }
    numPoisoned += 1;
  }

  if (numFainted > 0) {
    return 'FLDPSN_FNT';
  }
  if (numPoisoned > 0) {
    return 'FLDPSN_PSN';
  }
  return 'FLDPSN_NONE';
};

export const tryFieldPoisonWhiteOut = (party: FieldPokemon[]): FieldPoisonWhiteOutResult => {
  const faintedMessages: string[] = [];

  for (const pokemon of party) {
    if (!isFieldPoisoned(pokemon) || pokemon.hp > 0) {
      continue;
    }

    pokemon.status = 'none';
    faintedMessages.push(`${getSpeciesDisplayName(pokemon.species)} fainted...`);
  }

  return {
    faintedMessages,
    allMonsFainted: party.length > 0 && party.every((pokemon) => pokemon.hp <= 0)
  };
};
