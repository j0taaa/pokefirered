import type { FieldPokemon } from './pokemonStorage';

export const PARTY_SIZE = 6;

export interface SoftboiledPartyMenuState {
  action: 'PARTY_ACTION_CHOOSE_MON' | 'PARTY_ACTION_SOFTBOILED';
  slotId: number;
  slotId2: number;
  message: 'PARTY_MSG_CHOOSE_MON' | 'PARTY_MSG_USE_ON_WHICH_MON' | 'gText_CantBeUsedOnPkmn' | 'gText_PkmnHPRestoredByVar2';
  taskFunc: 'Task_HandleChooseMonInput' | 'Task_SoftboiledRestoreHealth' | 'Task_DisplayHPRestoredMessage' | 'Task_FinishSoftboiled' | 'Task_ChooseNewMonForSoftboiled';
  animatedSlots: Record<number, 0 | 1>;
  playedSE: string[];
  bg2CopyScheduled: boolean;
  window6Cleared: boolean;
}

export const createSoftboiledPartyMenuState = (slotId = 0): SoftboiledPartyMenuState => ({
  action: 'PARTY_ACTION_CHOOSE_MON',
  slotId,
  slotId2: 0,
  message: 'PARTY_MSG_CHOOSE_MON',
  taskFunc: 'Task_HandleChooseMonInput',
  animatedSlots: {},
  playedSE: [],
  bg2CopyScheduled: false,
  window6Cleared: false
});

const hpTransferAmount = (user: FieldPokemon): number =>
  Math.trunc(user.maxHp / 5);

export const setUpFieldMoveSoftBoiled = (
  party: readonly FieldPokemon[],
  cursorSelectionMonId: number
): boolean => {
  const pokemon = party[Math.trunc(cursorSelectionMonId)];
  if (!pokemon) {
    return false;
  }

  return pokemon.hp > Math.trunc(pokemon.maxHp / 5);
};

export function SetUpFieldMove_SoftBoiled(
  party: readonly FieldPokemon[],
  cursorSelectionMonId: number
): boolean {
  return setUpFieldMoveSoftBoiled(party, cursorSelectionMonId);
}

export const chooseMonForSoftboiled = (
  state: SoftboiledPartyMenuState,
  cursorSelectionMonId: number
): void => {
  state.action = 'PARTY_ACTION_SOFTBOILED';
  state.slotId2 = state.slotId;
  state.animatedSlots[Math.trunc(cursorSelectionMonId)] = 1;
  state.message = 'PARTY_MSG_USE_ON_WHICH_MON';
  state.taskFunc = 'Task_HandleChooseMonInput';
};

export function ChooseMonForSoftboiled(
  state: SoftboiledPartyMenuState,
  cursorSelectionMonId: number
): void {
  chooseMonForSoftboiled(state, cursorSelectionMonId);
}

export const taskTryUseSoftboiledOnPartyMon = (
  party: FieldPokemon[],
  state: SoftboiledPartyMenuState
): void => {
  const userPartyId = state.slotId;
  const recipientPartyId = state.slotId2;

  if (recipientPartyId > PARTY_SIZE) {
    state.action = 'PARTY_ACTION_CHOOSE_MON';
    state.message = 'PARTY_MSG_CHOOSE_MON';
    state.taskFunc = 'Task_HandleChooseMonInput';
    return;
  }

  const user = party[userPartyId];
  const recipient = party[recipientPartyId];
  if (!user || !recipient || recipient.hp === 0 || userPartyId === recipientPartyId || recipient.maxHp === recipient.hp) {
    cantUseSoftboiledOnMon(state);
    return;
  }

  state.playedSE.push('SE_USE_ITEM');
  user.hp = Math.max(0, user.hp - hpTransferAmount(user));
  state.taskFunc = 'Task_SoftboiledRestoreHealth';
};

export function Task_TryUseSoftboiledOnPartyMon(
  party: FieldPokemon[],
  state: SoftboiledPartyMenuState
): void {
  taskTryUseSoftboiledOnPartyMon(party, state);
}

export const taskSoftboiledRestoreHealth = (
  party: FieldPokemon[],
  state: SoftboiledPartyMenuState
): void => {
  const user = party[state.slotId];
  const recipient = party[state.slotId2];
  if (!user || !recipient) {
    return;
  }

  state.playedSE.push('SE_USE_ITEM');
  recipient.hp = Math.min(recipient.maxHp, recipient.hp + hpTransferAmount(user));
  state.taskFunc = 'Task_DisplayHPRestoredMessage';
};

export function Task_SoftboiledRestoreHealth(
  party: FieldPokemon[],
  state: SoftboiledPartyMenuState
): void {
  taskSoftboiledRestoreHealth(party, state);
}

export const taskDisplayHpRestoredMessage = (state: SoftboiledPartyMenuState): void => {
  state.message = 'gText_PkmnHPRestoredByVar2';
  state.bg2CopyScheduled = true;
  state.taskFunc = 'Task_FinishSoftboiled';
};

export function Task_DisplayHPRestoredMessage(state: SoftboiledPartyMenuState): void {
  taskDisplayHpRestoredMessage(state);
}

export const taskFinishSoftboiled = (
  state: SoftboiledPartyMenuState,
  textPrinterActive: boolean
): void => {
  if (textPrinterActive) {
    return;
  }

  state.action = 'PARTY_ACTION_CHOOSE_MON';
  state.animatedSlots[state.slotId] = 0;
  state.slotId = state.slotId2;
  state.animatedSlots[state.slotId2] = 1;
  state.window6Cleared = true;
  state.message = 'PARTY_MSG_CHOOSE_MON';
  state.taskFunc = 'Task_HandleChooseMonInput';
};

export function Task_FinishSoftboiled(
  state: SoftboiledPartyMenuState,
  textPrinterActive: boolean
): void {
  taskFinishSoftboiled(state, textPrinterActive);
}

export const taskChooseNewMonForSoftboiled = (
  state: SoftboiledPartyMenuState,
  textPrinterActive: boolean
): void => {
  if (textPrinterActive) {
    return;
  }

  state.message = 'PARTY_MSG_USE_ON_WHICH_MON';
  state.taskFunc = 'Task_HandleChooseMonInput';
};

export function Task_ChooseNewMonForSoftboiled(
  state: SoftboiledPartyMenuState,
  textPrinterActive: boolean
): void {
  taskChooseNewMonForSoftboiled(state, textPrinterActive);
}

export const cantUseSoftboiledOnMon = (state: SoftboiledPartyMenuState): void => {
  state.playedSE.push('SE_SELECT');
  state.message = 'gText_CantBeUsedOnPkmn';
  state.bg2CopyScheduled = true;
  state.taskFunc = 'Task_ChooseNewMonForSoftboiled';
};

export function CantUseSoftboiledOnMon(state: SoftboiledPartyMenuState): void {
  cantUseSoftboiledOnMon(state);
}
