import type { DecompMailSlot } from './decompNewGame';
import type { FieldPokemon } from './pokemonStorage';

export interface MailDataRuntimeState {
  startMenu: {
    playerName: string;
  };
  vars: Record<string, number>;
  newGame: {
    mail: DecompMailSlot[];
  };
}

export interface MailSpeciesResult {
  species: string;
  unownLetter: number;
}

const MAIL_COUNT = 16;
const MAIL_WORDS_COUNT = 9;
const PARTY_SIZE = 6;
const PLAYER_NAME_LENGTH = 7;
const UNOWN_OFFSET = 30000;
const NUM_UNOWN_FORMS = 28;
const SPECIES_BULBASAUR = 'SPECIES_BULBASAUR';
const SPECIES_UNOWN = 'SPECIES_UNOWN';

const normalizeSpeciesToken = (species: string): string =>
  `SPECIES_${species.replace(/^SPECIES_/u, '').toUpperCase()}`;

const getPlayerTrainerId = (runtime: MailDataRuntimeState): number =>
  Math.trunc(runtime.vars.playerTrainerId ?? 0) >>> 0;

const getMonMailId = (pokemon: FieldPokemon): number =>
  pokemon.mailId === undefined ? 0xff : Math.trunc(pokemon.mailId) & 0xff;

const setMonMailId = (pokemon: FieldPokemon, mailId: number): void => {
  pokemon.mailId = Math.trunc(mailId) & 0xff;
};

const clearMailWords = (): number[] =>
  Array.from({ length: MAIL_WORDS_COUNT }, () => 0xffff);

const copyPlayerNameToMail = (playerName: string): string => {
  const copied = playerName.slice(0, PLAYER_NAME_LENGTH);
  return copied.length <= 5 ? copied.padEnd(6, ' ') : copied;
};

export const clearMailStruct = (mail: DecompMailSlot): void => {
  mail.words = clearMailWords();
  mail.playerName = '';
  mail.trainerId = 0;
  mail.species = SPECIES_BULBASAUR;
  mail.itemId = null;
};

export const clearMailData = (runtime: MailDataRuntimeState): void => {
  for (let i = 0; i < MAIL_COUNT; i += 1) {
    const slot = runtime.newGame.mail[i];
    if (slot) {
      clearMailStruct(slot);
    }
  }
};

export const getUnownLetterByPersonality = (personality: number): number => {
  const value = Math.trunc(personality) >>> 0;
  if (value === 0) {
    return 0;
  }

  return (
    (((value & 0x03000000) >>> 18)
    | ((value & 0x00030000) >>> 12)
    | ((value & 0x00000300) >>> 6)
    | (value & 0x00000003))
    % 0x1c
  ) >>> 0;
};

export const speciesToMailSpecies = (
  species: string,
  personality: number
): string | number => {
  const normalizedSpecies = normalizeSpeciesToken(species);
  if (normalizedSpecies === SPECIES_UNOWN) {
    return getUnownLetterByPersonality(personality) + UNOWN_OFFSET;
  }

  return normalizedSpecies;
};

export const mailSpeciesToSpecies = (mailSpecies: string | number): MailSpeciesResult => {
  if (
    typeof mailSpecies === 'number'
    && mailSpecies >= UNOWN_OFFSET
    && mailSpecies < UNOWN_OFFSET + NUM_UNOWN_FORMS
  ) {
    return {
      species: SPECIES_UNOWN,
      unownLetter: mailSpecies - UNOWN_OFFSET
    };
  }

  return {
    species: typeof mailSpecies === 'string' ? normalizeSpeciesToken(mailSpecies) : SPECIES_BULBASAUR,
    unownLetter: 0
  };
};

export const itemIsMail = (itemId: string | null | undefined): boolean => {
  switch (itemId) {
    case 'ITEM_ORANGE_MAIL':
    case 'ITEM_HARBOR_MAIL':
    case 'ITEM_GLITTER_MAIL':
    case 'ITEM_MECH_MAIL':
    case 'ITEM_WOOD_MAIL':
    case 'ITEM_WAVE_MAIL':
    case 'ITEM_BEAD_MAIL':
    case 'ITEM_SHADOW_MAIL':
    case 'ITEM_TROPIC_MAIL':
    case 'ITEM_DREAM_MAIL':
    case 'ITEM_FAB_MAIL':
    case 'ITEM_RETRO_MAIL':
      return true;
    default:
      return false;
  }
};

export const monHasMail = (pokemon: FieldPokemon): boolean =>
  itemIsMail(pokemon.heldItemId) && getMonMailId(pokemon) !== 0xff;

export const giveMailToMon = (
  runtime: MailDataRuntimeState,
  pokemon: FieldPokemon,
  itemId: string | null
): number => {
  const personality = Math.trunc(pokemon.personality ?? 0) >>> 0;
  for (let id = 0; id < PARTY_SIZE; id += 1) {
    const slot = runtime.newGame.mail[id];
    if (!slot || slot.itemId !== null) {
      continue;
    }

    slot.words = clearMailWords();
    slot.playerName = copyPlayerNameToMail(runtime.startMenu.playerName);
    slot.trainerId = getPlayerTrainerId(runtime);
    slot.species = speciesToMailSpecies(pokemon.species, personality);
    slot.itemId = itemId;
    setMonMailId(pokemon, id);
    pokemon.heldItemId = itemId;
    return id;
  }

  return 0xff;
};

export const giveMailToMon2 = (
  runtime: MailDataRuntimeState,
  pokemon: FieldPokemon,
  mail: DecompMailSlot
): number => {
  const mailId = giveMailToMon(runtime, pokemon, mail.itemId);
  if (mailId === 0xff) {
    return 0xff;
  }

  runtime.newGame.mail[mailId] = {
    words: [...mail.words],
    playerName: mail.playerName,
    trainerId: Math.trunc(mail.trainerId) >>> 0,
    species: mail.species,
    itemId: mail.itemId
  };
  setMonMailId(pokemon, mailId);
  pokemon.heldItemId = mail.itemId;
  return mailId;
};

export const takeMailFromMon = (
  runtime: MailDataRuntimeState,
  pokemon: FieldPokemon
): void => {
  if (!monHasMail(pokemon)) {
    return;
  }

  const mailId = getMonMailId(pokemon);
  const slot = runtime.newGame.mail[mailId];
  if (slot) {
    slot.itemId = null;
  }
  setMonMailId(pokemon, 0xff);
  pokemon.heldItemId = null;
};

export const clearMailItemId = (runtime: MailDataRuntimeState, mailId: number): void => {
  const slot = runtime.newGame.mail[Math.trunc(mailId) & 0xff];
  if (slot) {
    slot.itemId = null;
  }
};

export const takeMailFromMon2 = (
  runtime: MailDataRuntimeState,
  pokemon: FieldPokemon
): number => {
  const sourceMailId = getMonMailId(pokemon);
  const sourceSlot = runtime.newGame.mail[sourceMailId];
  if (!sourceSlot) {
    return 0xff;
  }

  for (let i = PARTY_SIZE; i < MAIL_COUNT; i += 1) {
    const targetSlot = runtime.newGame.mail[i];
    if (!targetSlot || targetSlot.itemId !== null) {
      continue;
    }

    runtime.newGame.mail[i] = {
      words: [...sourceSlot.words],
      playerName: sourceSlot.playerName,
      trainerId: sourceSlot.trainerId,
      species: sourceSlot.species,
      itemId: sourceSlot.itemId
    };
    sourceSlot.itemId = null;
    setMonMailId(pokemon, 0xff);
    pokemon.heldItemId = null;
    return i;
  }

  return 0xff;
};

export function ClearMailData(runtime: MailDataRuntimeState): void {
  clearMailData(runtime);
}

export function ClearMailStruct(mail: DecompMailSlot): void {
  clearMailStruct(mail);
}

export function MonHasMail(pokemon: FieldPokemon): boolean {
  return monHasMail(pokemon);
}

export function GiveMailToMon(
  runtime: MailDataRuntimeState,
  pokemon: FieldPokemon,
  itemId: string | null
): number {
  return giveMailToMon(runtime, pokemon, itemId);
}

export function SpeciesToMailSpecies(species: string, personality: number): string | number {
  return speciesToMailSpecies(species, personality);
}

export function MailSpeciesToSpecies(mailSpecies: string | number): MailSpeciesResult {
  return mailSpeciesToSpecies(mailSpecies);
}

export function GiveMailToMon2(
  runtime: MailDataRuntimeState,
  pokemon: FieldPokemon,
  mail: DecompMailSlot
): number {
  return giveMailToMon2(runtime, pokemon, mail);
}

export function DummyMailFunc(): boolean {
  return false;
}

export function TakeMailFromMon(runtime: MailDataRuntimeState, pokemon: FieldPokemon): void {
  takeMailFromMon(runtime, pokemon);
}

export function ClearMailItemId(runtime: MailDataRuntimeState, mailId: number): void {
  clearMailItemId(runtime, mailId);
}

export function TakeMailFromMon2(runtime: MailDataRuntimeState, pokemon: FieldPokemon): number {
  return takeMailFromMon2(runtime, pokemon);
}

export function ItemIsMail(itemId: string | null | undefined): boolean {
  return itemIsMail(itemId);
}
