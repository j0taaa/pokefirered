import {
  TOTAL_BOXES_COUNT,
  IN_BOX_COUNT
} from './decompPokemonStorageSystem';
import { cloneFieldPokemon, type FieldPokemon } from './pokemonStorage';

export type PcStorageAction = 'withdraw' | 'deposit' | 'move' | 'moveItems' | 'cancel';
export type PcCursorArea = 'box' | 'party' | 'boxTitle' | 'buttons' | 'hand';

export interface PcStorageState {
  active: boolean;
  currentBox: number;
  boxNames: string[];
  boxes: FieldPokemon[][];
  party: FieldPokemon[];
  action: PcStorageAction | null;
  cursorArea: PcCursorArea;
  cursorPosition: number;
  selectedSlot: number | null;
  message: string;
}

export const PC_BOX_CAPACITY = IN_BOX_COUNT;
export const PC_BOX_COUNT = TOTAL_BOXES_COUNT;
export const PARTY_SIZE = 6;

export const createPcStorageState = (
  party: FieldPokemon[],
  boxNames: string[],
  boxes: FieldPokemon[][]
): PcStorageState => ({
  active: false,
  currentBox: 0,
  boxNames: boxNames.length > 0 ? boxNames : Array.from({ length: PC_BOX_COUNT }, (_, i) => `BOX ${i + 1}`),
  boxes: boxes.length > 0 ? boxes : Array.from({ length: PC_BOX_COUNT }, () => []),
  party: party.map(cloneFieldPokemon),
  action: null,
  cursorArea: 'box',
  cursorPosition: 0,
  selectedSlot: null,
  message: ''
});

export const depositPokemon = (
  state: PcStorageState,
  partyIndex: number
): { ok: boolean; message: string } => {
  if (partyIndex < 0 || partyIndex >= state.party.length) {
    return { ok: false, message: 'That slot is empty.' };
  }

  if (state.party.length <= 1) {
    return { ok: false, message: "You can't deposit your last POKeMON!" };
  }

  const box = state.boxes[state.currentBox];
  if (box.length >= PC_BOX_CAPACITY) {
    return { ok: false, message: 'The BOX is full.' };
  }

  const pokemon = state.party.splice(partyIndex, 1)[0];
  box.push(pokemon);
  return { ok: true, message: `${pokemon.nickname ?? pokemon.species} was stored in ${state.boxNames[state.currentBox]}.` };
};

export const withdrawPokemon = (
  state: PcStorageState,
  boxPosition: number
): { ok: boolean; message: string } => {
  const box = state.boxes[state.currentBox];
  if (boxPosition < 0 || boxPosition >= box.length || !box[boxPosition]) {
    return { ok: false, message: 'That slot is empty.' };
  }

  if (state.party.length >= PARTY_SIZE) {
    return { ok: false, message: 'Your party is full!' };
  }

  const pokemon = box.splice(boxPosition, 1)[0];
  state.party.push(pokemon);
  return { ok: true, message: `${pokemon.nickname ?? pokemon.species} was taken from ${state.boxNames[state.currentBox]}.` };
};

export const movePokemonBetweenBoxes = (
  state: PcStorageState,
  fromBox: number,
  fromPosition: number,
  toBox: number,
  toPosition: number
): { ok: boolean; message: string } => {
  if (fromBox < 0 || fromBox >= PC_BOX_COUNT || toBox < 0 || toBox >= PC_BOX_COUNT) {
    return { ok: false, message: 'Invalid BOX.' };
  }

  const srcBox = state.boxes[fromBox];
  if (fromPosition < 0 || fromPosition >= srcBox.length || !srcBox[fromPosition]) {
    return { ok: false, message: 'That slot is empty.' };
  }

  const destBox = state.boxes[toBox];
  if (destBox.length >= PC_BOX_CAPACITY) {
    return { ok: false, message: 'The destination BOX is full.' };
  }

  const pokemon = srcBox.splice(fromPosition, 1)[0];
  if (toPosition >= destBox.length) {
    destBox.push(pokemon);
  } else {
    destBox.splice(toPosition, 0, pokemon);
  }
  return { ok: true, message: `${pokemon.nickname ?? pokemon.species} was moved to ${state.boxNames[toBox]}.` };
};

export const switchBox = (state: PcStorageState, direction: -1 | 1): string => {
  state.currentBox = (state.currentBox + direction + PC_BOX_COUNT) % PC_BOX_COUNT;
  return state.boxNames[state.currentBox];
};

export const renameBox = (state: PcStorageState, name: string): void => {
  if (name.length > 0 && name.length <= 8) {
    state.boxNames[state.currentBox] = name;
  }
};

export const getBoxSlot = (state: PcStorageState, boxIndex: number, position: number): FieldPokemon | null => {
  const box = state.boxes[boxIndex];
  if (!box || position < 0 || position >= box.length) {
    return null;
  }
  return box[position] ?? null;
};

export const getCurrentBoxSlots = (state: PcStorageState): (FieldPokemon | null)[] => {
  const box = state.boxes[state.currentBox];
  const slots: (FieldPokemon | null)[] = Array.from({ length: PC_BOX_CAPACITY }, () => null);
  for (let i = 0; i < box.length && i < PC_BOX_CAPACITY; i += 1) {
    slots[i] = box[i] ?? null;
  }
  return slots;
};

export const getPartySlots = (state: PcStorageState): (FieldPokemon | null)[] => {
  const slots: (FieldPokemon | null)[] = Array.from({ length: PARTY_SIZE }, () => null);
  for (let i = 0; i < state.party.length && i < PARTY_SIZE; i += 1) {
    slots[i] = state.party[i] ?? null;
  }
  return slots;
};

export const getPcActionLabel = (action: PcStorageAction): string => {
  switch (action) {
    case 'withdraw': return 'WITHDRAW';
    case 'deposit': return 'DEPOSIT';
    case 'move': return 'MOVE';
    case 'moveItems': return 'MOVE ITEMS';
    case 'cancel': return 'CANCEL';
  }
};

export const PC_ACTION_ORDER: PcStorageAction[] = ['withdraw', 'deposit', 'move', 'moveItems', 'cancel'];