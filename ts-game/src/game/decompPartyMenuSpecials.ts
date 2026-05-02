export const MAX_MON_MOVES = 4;
export const MOVE_NONE = 0;
export const PP_UP_GET_MASK = [0x03, 0x0c, 0x30, 0xc0] as const;

export interface PartyMenuSpecialMon {
  nickname: string;
  isEgg?: boolean;
  moves: number[];
  pp: number[];
  ppBonuses: number;
}

export interface PartyMenuSpecialRuntime {
  vars: Record<string, number>;
  stringVars: Record<string, string>;
  party: PartyMenuSpecialMon[];
  partyMenu?: {
    lockedControls: boolean;
    taskPriority: number;
    menuType: 'PARTY_MENU_TYPE_CHOOSE_SINGLE_MON' | 'PARTY_MENU_TYPE_MOVE_RELEARNER';
    paletteFadeStarted: boolean;
    paletteBufferTransferDisabled?: boolean;
    destroyed?: boolean;
    summaryScreenMode?: 'PSS_MODE_FORGET_MOVE';
    fieldCallback?: 'FieldCB_ContinueScriptHandleMusic';
  };
}

const getSelectedMon = (runtime: PartyMenuSpecialRuntime): PartyMenuSpecialMon | undefined =>
  runtime.party[Math.trunc(runtime.vars.gSpecialVar_0x8004 ?? runtime.vars.VAR_0x8004 ?? 0)];

export const choosePartyMon = (runtime: PartyMenuSpecialRuntime): void => {
  runtime.partyMenu = {
    lockedControls: true,
    taskPriority: 10,
    menuType: 'PARTY_MENU_TYPE_CHOOSE_SINGLE_MON',
    paletteFadeStarted: true
  };
};

export const chooseMonForMoveRelearner = (runtime: PartyMenuSpecialRuntime): void => {
  runtime.partyMenu = {
    lockedControls: true,
    taskPriority: 10,
    menuType: 'PARTY_MENU_TYPE_MOVE_RELEARNER',
    paletteFadeStarted: true
  };
};

export const taskChoosePartyMon = (
  runtime: PartyMenuSpecialRuntime,
  paletteFadeActive: boolean
): void => {
  if (paletteFadeActive || !runtime.partyMenu) {
    return;
  }

  runtime.partyMenu.paletteBufferTransferDisabled = true;
  runtime.partyMenu.destroyed = true;
};

export const selectMoveDeleterMove = (runtime: PartyMenuSpecialRuntime): void => {
  runtime.partyMenu = {
    ...(runtime.partyMenu ?? {
      lockedControls: false,
      taskPriority: 0,
      menuType: 'PARTY_MENU_TYPE_CHOOSE_SINGLE_MON',
      paletteFadeStarted: false
    }),
    summaryScreenMode: 'PSS_MODE_FORGET_MOVE',
    fieldCallback: 'FieldCB_ContinueScriptHandleMusic'
  };
};

export const getNumMovesSelectedMonHas = (runtime: PartyMenuSpecialRuntime): void => {
  const mon = getSelectedMon(runtime);
  let result = 0;
  for (let i = 0; i < MAX_MON_MOVES; i += 1) {
    if ((mon?.moves[i] ?? MOVE_NONE) !== MOVE_NONE) {
      result += 1;
    }
  }
  runtime.vars.gSpecialVar_Result = result;
  runtime.vars.VAR_RESULT = result;
};

export const bufferMoveDeleterNicknameAndMove = (
  runtime: PartyMenuSpecialRuntime,
  moveNames: Record<number, string>
): void => {
  const mon = getSelectedMon(runtime);
  const moveSlot = Math.trunc(runtime.vars.gSpecialVar_0x8005 ?? runtime.vars.VAR_0x8005 ?? 0);
  const move = mon?.moves[moveSlot] ?? MOVE_NONE;
  runtime.stringVars.STR_VAR_1 = mon?.nickname ?? '';
  runtime.stringVars.STR_VAR_2 = moveNames[move] ?? String(move);
};

export const shiftMoveSlot = (
  mon: PartyMenuSpecialMon,
  slotTo: number,
  slotFrom: number
): void => {
  const to = Math.trunc(slotTo);
  const from = Math.trunc(slotFrom);
  const move1 = mon.moves[to] ?? MOVE_NONE;
  const move0 = mon.moves[from] ?? MOVE_NONE;
  const pp1 = mon.pp[to] ?? 0;
  const pp0 = mon.pp[from] ?? 0;
  let ppBonuses = mon.ppBonuses & 0xff;
  const ppBonusMask1 = PP_UP_GET_MASK[to] ?? 0;
  const ppBonusMove1 = (ppBonuses & ppBonusMask1) >> (to * 2);
  const ppBonusMask2 = PP_UP_GET_MASK[from] ?? 0;
  const ppBonusMove2 = (ppBonuses & ppBonusMask2) >> (from * 2);

  ppBonuses &= ~ppBonusMask1;
  ppBonuses &= ~ppBonusMask2;
  ppBonuses |= (ppBonusMove1 << (from * 2)) + (ppBonusMove2 << (to * 2));
  mon.moves[to] = move0;
  mon.moves[from] = move1;
  mon.pp[to] = pp0;
  mon.pp[from] = pp1;
  mon.ppBonuses = ppBonuses & 0xff;
};

export const moveDeleterForgetMove = (runtime: PartyMenuSpecialRuntime): void => {
  const mon = getSelectedMon(runtime);
  if (!mon) {
    return;
  }

  const slot = Math.trunc(runtime.vars.gSpecialVar_0x8005 ?? runtime.vars.VAR_0x8005 ?? 0);
  mon.moves[slot] = MOVE_NONE;
  mon.pp[slot] = 0;
  mon.ppBonuses &= ~(PP_UP_GET_MASK[slot] ?? 0);
  for (let i = slot; i < MAX_MON_MOVES - 1; i += 1) {
    shiftMoveSlot(mon, i, i + 1);
  }
};

export const isSelectedMonEgg = (runtime: PartyMenuSpecialRuntime): void => {
  const result = getSelectedMon(runtime)?.isEgg ? 1 : 0;
  runtime.vars.gSpecialVar_Result = result;
  runtime.vars.VAR_RESULT = result;
};

export function ChoosePartyMon(runtime: PartyMenuSpecialRuntime): void {
  choosePartyMon(runtime);
}

export function ChooseMonForMoveRelearner(runtime: PartyMenuSpecialRuntime): void {
  chooseMonForMoveRelearner(runtime);
}

export function Task_ChoosePartyMon(
  runtime: PartyMenuSpecialRuntime,
  _taskId: number,
  paletteFadeActive: boolean
): void {
  taskChoosePartyMon(runtime, paletteFadeActive);
}

export function SelectMoveDeleterMove(runtime: PartyMenuSpecialRuntime): void {
  selectMoveDeleterMove(runtime);
}

export function GetNumMovesSelectedMonHas(runtime: PartyMenuSpecialRuntime): void {
  getNumMovesSelectedMonHas(runtime);
}

export function BufferMoveDeleterNicknameAndMove(
  runtime: PartyMenuSpecialRuntime,
  moveNames: Record<number, string>
): void {
  bufferMoveDeleterNicknameAndMove(runtime, moveNames);
}

export function ShiftMoveSlot(
  mon: PartyMenuSpecialMon,
  slotTo: number,
  slotFrom: number
): void {
  shiftMoveSlot(mon, slotTo, slotFrom);
}

export function MoveDeleterForgetMove(runtime: PartyMenuSpecialRuntime): void {
  moveDeleterForgetMove(runtime);
}

export function IsSelectedMonEgg(runtime: PartyMenuSpecialRuntime): void {
  isSelectedMonEgg(runtime);
}
