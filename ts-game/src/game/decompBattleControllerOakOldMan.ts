import * as Partner from './decompBattleControllerLinkPartner';

export * from './decompBattleControllerLinkPartner';

export const A_BUTTON = 0x0001;
export const B_BUTTON = 0x0002;
export const START_BUTTON = 0x0008;
export const DPAD_RIGHT = 0x0010;
export const DPAD_LEFT = 0x0020;
export const DPAD_UP = 0x0040;
export const DPAD_DOWN = 0x0080;

export const B_ACTION_USE_MOVE = 0;
export const B_ACTION_USE_ITEM = 1;
export const B_ACTION_SWITCH = 2;
export const B_ACTION_RUN = 3;
export const B_ACTION_CANCEL_PARTNER = 12;
export const BATTLE_TYPE_DOUBLE = 1 << 0;
export const BATTLE_TYPE_LINK_REAL = 1 << 1;
export const BATTLE_TYPE_IS_MASTER = 1 << 2;
export const BATTLE_TYPE_FIRST_BATTLE = 1 << 4;
export const BATTLE_TYPE_MULTI_REAL = 1 << 6;
export const BATTLE_TYPE_OLD_MAN_TUTORIAL = 1 << 9;
export const ITEM_POTION = 13;
export const ITEM_PREMIER_BALL = 12;
export const FIRST_BATTLE_MSG_FLAG_STAT_CHG = 1 << 0;
export const FIRST_BATTLE_MSG_FLAG_HP_RESTORE = 1 << 1;
export const STRINGID_DEFENDERSSTATFELL = 0x55;
export const STRINGID_PLAYERGOTMONEY = 0x5d;
export const STRINGID_TRAINER1WINTEXT = 0x17f;
export const STRINGID_DONTLEAVEBIRCH = 0xe3;
export const B_POSITION_PLAYER_LEFT = 0;
export const B_POSITION_PLAYER_RIGHT = 2;
export const B_SIDE_PLAYER = 0;
export const INSTANT_HP_BAR_DROP = 0x7fff;
export const MAX_LEVEL = 100;

export type OakOldManControllerFunc =
  | 'OakOldManBufferRunCommand'
  | 'OakOldManDummy'
  | 'BattleControllerDummy'
  | 'HandleChooseActionAfterDma3'
  | 'HandleInputChooseAction'
  | 'SimulateInputChooseAction'
  | 'OakHandleChooseMove_WaitDma3'
  | 'OakOldManHandleInputChooseMove'
  | 'OpenBagAndChooseItem'
  | 'CompleteWhenChoseItem'
  | 'OpenPartyMenuToChooseMon'
  | 'WaitForMonSelection'
  | 'CompleteOnBattlerSpriteCallbackDummy'
  | 'CompleteOnInactiveTextPrinter'
  | 'CompleteOnInactiveTextPrinter2'
  | 'CompleteOnHealthbarDone'
  | 'CompleteOnFinishedStatusAnimation'
  | 'CompleteOnFinishedBattleAnimation'
  | 'FreeMonSpriteAfterFaintAnim'
  | 'DoHitAnimBlinkSpriteEffect'
  | 'DoSwitchOutAnimation'
  | 'CompleteOnSpecialAnimDone'
  | 'CompleteOnBattlerSpriteCallbackDummy2'
  | 'OakOldManDoMoveAnimation'
  | 'Intro_WaitForShinyAnimAndHealthbox'
  | 'OakOldManSetBattleEndCallbacks'
  | 'PrintOakText_InflictingDamageIsKey'
  | 'PrintOakText_LoweringStats'
  | 'PrintOakText_OakNoRunningFromATrainer'
  | 'PrintOakText_WinEarnsPrizeMoney'
  | 'PrintOakText_HowDisappointing'
  | 'PrintOakText_KeepAnEyeOnHP'
  | 'PrintOakText_ForPetesSake'
  | 'Intro_TryShinyAnimShowHealthbox';

export interface OakOldManRuntime extends Omit<Partner.LinkPartnerRuntime, 'gBattlerControllerFuncs'> {
  gBattlerControllerFuncs: OakOldManControllerFunc[];
  gActionSelectionCursor: number[];
  gMoveSelectionCursor: number[];
  gBattlePartyCurrentOrder: number[];
  gBattleControllerData: number[];
  gBattlerInMenuId: number;
  gSelectedMonPartyId: number;
  gPartyMenuUseExitCallback: boolean;
  gSpecialVar_ItemId: number;
  gBattleStruct: {
    simulatedInputState: number[];
    battlerPreventingSwitchout: number;
    playerPartyIdx: number;
    abilityPreventingSwitchout: number;
  };
  gMain: { callback2: string; inBattle: number; callback1: string; savedCallback: string; preBattleCallback1: string };
  paletteFadeActive: boolean;
  dma3Busy: boolean;
  battlerSides: number[];
  battlerPositions: number[];
  gAbsentBattlerFlags: number;
  firstBattleState2Flags: number;
  tryHandleBattleAnimationResult: boolean;
  emittedControllerValues: Array<{ cmd: number; bufferId: number; data: number[] }>;
  bagItems: Record<number, number>;
}

export const createOakOldManRuntime = (overrides: Partial<OakOldManRuntime> = {}): OakOldManRuntime => {
  const base = Partner.createLinkPartnerRuntime({
    gActiveBattler: 0,
    gBattleControllerExecFlags: 1,
    gBattlerControllerFuncs: Array.from({ length: 4 }, () => 'OakOldManBufferRunCommand' as Partner.LinkPartnerControllerFunc)
  });
  return {
    ...base,
    gBattlerControllerFuncs: Array.from({ length: 4 }, () => 'OakOldManBufferRunCommand'),
    gActionSelectionCursor: Array.from({ length: 4 }, () => 0),
    gMoveSelectionCursor: Array.from({ length: 4 }, () => 0),
    gBattlePartyCurrentOrder: [0, 1, 2],
    gBattleControllerData: [8, 9, 10, 11],
    gBattlerInMenuId: 0,
    gSelectedMonPartyId: 6,
    gPartyMenuUseExitCallback: false,
    gSpecialVar_ItemId: 0,
    gBattleStruct: {
      simulatedInputState: [0, 0, 0, 0],
      battlerPreventingSwitchout: 0,
      playerPartyIdx: 0,
      abilityPreventingSwitchout: 0
    },
    gMain: {
      callback2: 'BattleMainCB2',
      inBattle: 1,
      callback1: '',
      savedCallback: 'SavedCallback',
      preBattleCallback1: 'PreBattleCallback1'
    },
    paletteFadeActive: false,
    dma3Busy: false,
    battlerSides: [B_SIDE_PLAYER, 1, B_SIDE_PLAYER, 1],
    battlerPositions: [B_POSITION_PLAYER_LEFT, 1, B_POSITION_PLAYER_RIGHT, 3],
    gAbsentBattlerFlags: 0,
    firstBattleState2Flags: 0,
    tryHandleBattleAnimationResult: true,
    emittedControllerValues: [],
    bagItems: {},
    ...overrides
  };
};

const u16 = (buf: number[], at: number): number => (buf[at] ?? 0) | ((buf[at + 1] ?? 0) << 8);
const lo = (value: number): number => value & 0xff;
const hi = (value: number): number => (value >>> 8) & 0xff;
const asPartner = (runtime: OakOldManRuntime): Partner.LinkPartnerRuntime => runtime as unknown as Partner.LinkPartnerRuntime;

const emitTwoReturnValues = (runtime: OakOldManRuntime, bufferId: number, value1: number, value2: number): void => {
  runtime.emittedControllerValues.push({ cmd: Partner.CONTROLLER_TWORETURNVALUES, bufferId, data: [lo(value1), lo(value2), hi(value2)] });
};

const emitOneReturnValue = (runtime: OakOldManRuntime, bufferId: number, value: number): void => {
  runtime.emittedControllerValues.push({ cmd: Partner.CONTROLLER_ONERETURNVALUE, bufferId, data: [lo(value), hi(value), 0] });
};

const emitChosenMonReturnValue = (runtime: OakOldManRuntime, bufferId: number, partyId: number): void => {
  runtime.emittedControllerValues.push({ cmd: Partner.CONTROLLER_CHOSENMONRETURNVALUE, bufferId, data: [lo(partyId), ...runtime.gBattlePartyCurrentOrder.map(lo)] });
};

const complete = (runtime: OakOldManRuntime): void => {
  const b = runtime.gActiveBattler;
  runtime.gBattlerControllerFuncs[b] = 'OakOldManBufferRunCommand';
  if (runtime.gBattleTypeFlags & BATTLE_TYPE_LINK_REAL) {
    runtime.emittedTransfers.push({ buffer: 'link', size: 4, data: [runtime.multiplayerId & 0xff] });
    runtime.gBattleBufferA[b][0] = Partner.CONTROLLER_TERMINATOR_NOP;
  } else {
    runtime.gBattleControllerExecFlags &= ~runtime.gBitTable[b];
  }
};

export const OakOldManBufferExecCompleted = complete;
export const OakOldManDummy = (_runtime: OakOldManRuntime): void => {};

export const BtlCtrl_OakOldMan_TestState2Flag = (runtime: OakOldManRuntime, mask: number): boolean => (runtime.firstBattleState2Flags & mask) !== 0;
export const BtlCtrl_OakOldMan_SetState2Flag = (runtime: OakOldManRuntime, mask: number): void => {
  runtime.firstBattleState2Flags |= mask;
};

export const SetControllerToOakOrOldMan = (runtime: OakOldManRuntime): void => {
  runtime.gBattlerControllerFuncs[runtime.gActiveBattler] = 'OakOldManBufferRunCommand';
  runtime.gBattleStruct.simulatedInputState.fill(0);
};

export const OakOldManBufferRunCommand = (runtime: OakOldManRuntime): void => {
  const b = runtime.gActiveBattler;
  if (runtime.gBattleControllerExecFlags & runtime.gBitTable[b]) {
    const handler = sOakOldManBufferCommands[runtime.gBattleBufferA[b][0]];
    if (handler) handler(runtime);
    else complete(runtime);
  }
};

export const CopyOakOldManMonData = (runtime: OakOldManRuntime, monId: number): number[] => Partner.CopyLinkPartnerMonData(asPartner(runtime), monId);
export const SetOakOldManMonData = (runtime: OakOldManRuntime, monId: number): void => Partner.SetLinkPartnerMonData(asPartner(runtime), monId);

export const OakOldManHandleGetMonData = (runtime: OakOldManRuntime): void => {
  const b = runtime.gActiveBattler;
  const data: number[] = [];
  if (runtime.gBattleBufferA[b][2] === 0) data.push(...CopyOakOldManMonData(runtime, runtime.gBattlerPartyIndexes[b]));
  else {
    let mask = runtime.gBattleBufferA[b][2];
    for (let i = 0; i < 6; i++) {
      if (mask & 1) data.push(...CopyOakOldManMonData(runtime, i));
      mask >>= 1;
    }
  }
  runtime.emittedTransfers.push({ buffer: 'B', size: data.length, data });
  complete(runtime);
};

export const OakOldManHandleSetMonData = (runtime: OakOldManRuntime): void => {
  const b = runtime.gActiveBattler;
  if (runtime.gBattleBufferA[b][2] === 0) SetOakOldManMonData(runtime, runtime.gBattlerPartyIndexes[b]);
  else {
    let mask = runtime.gBattleBufferA[b][2];
    for (let i = 0; i < 6; i++) {
      if (mask & 1) SetOakOldManMonData(runtime, i);
      mask >>= 1;
    }
  }
  runtime.operations.push(`HandleLowHpMusicChange:${b}`);
  complete(runtime);
};

export const OakOldManHandleGetRawMonData = (runtime: OakOldManRuntime): void => {
  const b = runtime.gActiveBattler;
  const mon = runtime.gPlayerParty[runtime.gBattlerPartyIndexes[b]];
  const offset = runtime.gBattleBufferA[b][1];
  const size = runtime.gBattleBufferA[b][2];
  runtime.emittedTransfers.push({ buffer: 'B', size, data: mon.raw.slice(offset, offset + size) });
  complete(runtime);
};

export const OakOldManHandleSetRawMonData = complete;
export const OakOldManHandleLoadMonSprite = complete;
export const OakOldManHandleSwitchInAnim = complete;

export const OakOldManHandlePrintString = (runtime: OakOldManRuntime): void => {
  const b = runtime.gActiveBattler;
  const stringId = u16(runtime.gBattleBufferA[b], 2);
  runtime.gBattle_BG0_X = 0;
  runtime.gBattle_BG0_Y = 0;
  if ((runtime.gBattleTypeFlags & BATTLE_TYPE_OLD_MAN_TUTORIAL) && stringId === 1) {
    complete(runtime);
    return;
  }
  runtime.gDisplayedStringBattle = `BattleString:${stringId}`;
  runtime.operations.push(`BufferStringBattle:${stringId}`, `BattlePutTextOnWindow:${runtime.gDisplayedStringBattle}:B_WIN_MSG`);
  if (runtime.gBattleTypeFlags & BATTLE_TYPE_FIRST_BATTLE) {
    switch (stringId) {
      case STRINGID_DEFENDERSSTATFELL:
        if (!BtlCtrl_OakOldMan_TestState2Flag(runtime, FIRST_BATTLE_MSG_FLAG_STAT_CHG)) {
          BtlCtrl_OakOldMan_SetState2Flag(runtime, FIRST_BATTLE_MSG_FLAG_STAT_CHG);
          runtime.gBattlerControllerFuncs[b] = 'PrintOakText_LoweringStats';
          return;
        }
        break;
      case STRINGID_PLAYERGOTMONEY:
        runtime.gBattlerControllerFuncs[b] = 'PrintOakText_WinEarnsPrizeMoney';
        return;
      case STRINGID_TRAINER1WINTEXT:
        runtime.gBattlerControllerFuncs[b] = 'PrintOakText_HowDisappointing';
        return;
      case STRINGID_DONTLEAVEBIRCH:
        runtime.gBattlerControllerFuncs[b] = 'PrintOakText_OakNoRunningFromATrainer';
        return;
    }
  }
  runtime.gBattlerControllerFuncs[b] = 'CompleteOnInactiveTextPrinter';
};

export const OakOldManHandlePrintSelectionString = (runtime: OakOldManRuntime): void => {
  if (runtime.battlerSides[runtime.gActiveBattler] === B_SIDE_PLAYER) OakOldManHandlePrintString(runtime);
  else complete(runtime);
};

const moveActionCursor = (runtime: OakOldManRuntime, next: number): void => {
  const b = runtime.gActiveBattler;
  runtime.operations.push('PlaySE:SE_SELECT', `ActionSelectionDestroyCursorAt:${runtime.gActionSelectionCursor[b]}`);
  runtime.gActionSelectionCursor[b] = next;
  runtime.operations.push(`ActionSelectionCreateCursorAt:${next}:0`);
};

export const HandleInputChooseAction = (runtime: OakOldManRuntime, newKeys: number): void => {
  const b = runtime.gActiveBattler;
  const itemId = u16(runtime.gBattleBufferA[b], 2);
  runtime.operations.push(`DoBounceEffect:${b}:BOUNCE_HEALTHBOX:7:1`, `DoBounceEffect:${b}:BOUNCE_MON:7:1`);
  if (newKeys & A_BUTTON) {
    runtime.operations.push('PlaySE:SE_SELECT');
    const action = [B_ACTION_USE_MOVE, B_ACTION_USE_ITEM, B_ACTION_SWITCH, B_ACTION_RUN][runtime.gActionSelectionCursor[b]] ?? B_ACTION_USE_MOVE;
    emitTwoReturnValues(runtime, 1, action, 0);
    complete(runtime);
  } else if ((newKeys & DPAD_LEFT) && (runtime.gActionSelectionCursor[b] & 1)) moveActionCursor(runtime, runtime.gActionSelectionCursor[b] ^ 1);
  else if ((newKeys & DPAD_RIGHT) && !(runtime.gActionSelectionCursor[b] & 1)) moveActionCursor(runtime, runtime.gActionSelectionCursor[b] ^ 1);
  else if ((newKeys & DPAD_UP) && (runtime.gActionSelectionCursor[b] & 2)) moveActionCursor(runtime, runtime.gActionSelectionCursor[b] ^ 2);
  else if ((newKeys & DPAD_DOWN) && !(runtime.gActionSelectionCursor[b] & 2)) moveActionCursor(runtime, runtime.gActionSelectionCursor[b] ^ 2);
  else if (newKeys & B_BUTTON) {
    const isCancelableRightPartner =
      (runtime.gBattleTypeFlags & BATTLE_TYPE_DOUBLE) &&
      runtime.battlerPositions[b] === B_POSITION_PLAYER_RIGHT &&
      !(runtime.gAbsentBattlerFlags & runtime.gBitTable[runtime.battlerPositions.indexOf(B_POSITION_PLAYER_LEFT)]) &&
      !(runtime.gBattleTypeFlags & BATTLE_TYPE_MULTI_REAL);
    if (isCancelableRightPartner) {
      if (runtime.gBattleBufferA[b][1] === B_ACTION_USE_ITEM) {
        if (itemId <= ITEM_PREMIER_BALL) runtime.bagItems[itemId] = (runtime.bagItems[itemId] ?? 0) + 1;
        else return;
      }
      runtime.operations.push('PlaySE:SE_SELECT');
      emitTwoReturnValues(runtime, 1, B_ACTION_CANCEL_PARTNER, 0);
      complete(runtime);
    }
  } else if (newKeys & START_BUTTON) runtime.operations.push('SwapHpBarsWithHpText');
};

export const SimulateInputChooseAction = (runtime: OakOldManRuntime): void => {
  const state = runtime.gBattleStruct.simulatedInputState;
  switch (state[0]) {
    case 0:
      state[2] = 64;
      state[0]++;
    // fallthrough
    case 1:
      if (--state[2] === 0) {
        runtime.operations.push('PlaySE:SE_SELECT', 'ActionSelectionDestroyCursorAt:0', 'ActionSelectionCreateCursorAt:1:0');
        state[2] = 64;
        state[0]++;
      }
      break;
    case 2:
      if (--state[2] === 0) {
        runtime.operations.push('PlaySE:SE_SELECT');
        emitTwoReturnValues(runtime, 1, B_ACTION_USE_ITEM, 0);
        complete(runtime);
      }
      break;
  }
};

export const HandleChooseActionAfterDma3 = (runtime: OakOldManRuntime): void => {
  if (!runtime.dma3Busy) {
    runtime.gBattle_BG0_X = 0;
    runtime.gBattle_BG0_Y = 160;
    runtime.gBattlerControllerFuncs[runtime.gActiveBattler] = runtime.gBattleTypeFlags & BATTLE_TYPE_FIRST_BATTLE ? 'HandleInputChooseAction' : 'SimulateInputChooseAction';
  }
};

export const OakOldManHandleChooseAction = (runtime: OakOldManRuntime): void => {
  const b = runtime.gActiveBattler;
  runtime.gBattlerControllerFuncs[b] = 'HandleChooseActionAfterDma3';
  runtime.operations.push('BattlePutTextOnWindow:gText_EmptyString3:B_WIN_MSG', 'BattlePutTextOnWindow:gText_BattleMenu:B_WIN_ACTION_MENU');
  for (let i = 0; i < 4; i++) runtime.operations.push(`ActionSelectionDestroyCursorAt:${i}`);
  runtime.operations.push(`ActionSelectionCreateCursorAt:${runtime.gActionSelectionCursor[b]}:0`);
  runtime.operations.push(runtime.gBattleTypeFlags & BATTLE_TYPE_FIRST_BATTLE ? 'BattleStringExpandPlaceholdersToDisplayedString:gText_WhatWillPkmnDo' : 'BattleStringExpandPlaceholdersToDisplayedString:gText_WhatWillOldManDo');
  runtime.operations.push('BattlePutTextOnWindow:gDisplayedStringBattle:B_WIN_ACTION_PROMPT');
};

export const OakOldManHandleChooseMove = (runtime: OakOldManRuntime): void => {
  const b = runtime.gActiveBattler;
  if (runtime.gBattleTypeFlags & BATTLE_TYPE_FIRST_BATTLE) {
    runtime.operations.push('InitMoveSelectionsVarsAndStrings');
    runtime.gBattlerControllerFuncs[b] = 'OakHandleChooseMove_WaitDma3';
  } else {
    const state = runtime.gBattleStruct.simulatedInputState;
    switch (state[1]) {
      case 0:
        runtime.operations.push('InitMoveSelectionsVarsAndStrings');
        state[1]++;
        state[3] = 80;
      // fallthrough
      case 1:
        if (--state[3] === 0) {
          runtime.operations.push('PlaySE:SE_SELECT');
          emitTwoReturnValues(runtime, 1, 10, 0x100);
          complete(runtime);
        }
        break;
    }
  }
};

export const OakHandleChooseMove_WaitDma3 = (runtime: OakOldManRuntime): void => {
  if (!runtime.dma3Busy) {
    runtime.gBattle_BG0_X = 0;
    runtime.gBattle_BG0_Y = 320;
    runtime.gBattlerControllerFuncs[runtime.gActiveBattler] = 'OakOldManHandleInputChooseMove';
  }
};

export const OakOldManHandleInputChooseMove = (runtime: OakOldManRuntime): void => {
  runtime.operations.push('HandleInputChooseMove');
  if (!(runtime.gBattleControllerExecFlags & runtime.gBitTable[runtime.gActiveBattler])) complete(runtime);
};

export const OakOldManHandleChooseItem = (runtime: OakOldManRuntime): void => {
  const b = runtime.gActiveBattler;
  runtime.operations.push('BeginNormalPaletteFade:PALETTES_ALL:0:0:16:RGB_BLACK');
  runtime.gBattlerControllerFuncs[b] = 'OpenBagAndChooseItem';
  runtime.gBattlerInMenuId = b;
  for (let i = 0; i < 3; i++) runtime.gBattlePartyCurrentOrder[i] = runtime.gBattleBufferA[b][i + 1];
};

export const OpenBagAndChooseItem = (runtime: OakOldManRuntime): void => {
  if (!runtime.paletteFadeActive) {
    runtime.gBattlerControllerFuncs[runtime.gActiveBattler] = 'CompleteWhenChoseItem';
    runtime.operations.push('ReshowBattleScreenDummy', 'FreeAllWindowBuffers', runtime.gBattleTypeFlags & BATTLE_TYPE_FIRST_BATTLE ? 'CB2_BagMenuFromBattle' : 'InitOldManBag');
  }
};

export const CompleteWhenChoseItem = (runtime: OakOldManRuntime): void => {
  if (runtime.gMain.callback2 === 'BattleMainCB2' && !runtime.paletteFadeActive) {
    if (!BtlCtrl_OakOldMan_TestState2Flag(runtime, FIRST_BATTLE_MSG_FLAG_HP_RESTORE) && runtime.gSpecialVar_ItemId === ITEM_POTION && (runtime.gBattleTypeFlags & BATTLE_TYPE_FIRST_BATTLE)) {
      BtlCtrl_OakOldMan_SetState2Flag(runtime, FIRST_BATTLE_MSG_FLAG_HP_RESTORE);
      runtime.gBattlerControllerFuncs[runtime.gActiveBattler] = 'PrintOakText_KeepAnEyeOnHP';
    } else {
      emitOneReturnValue(runtime, 1, runtime.gSpecialVar_ItemId);
      complete(runtime);
    }
  }
};

export const OakOldManHandleChoosePokemon = (runtime: OakOldManRuntime): void => {
  const b = runtime.gActiveBattler;
  runtime.gBattleControllerData[b] = runtime.gTasks.length;
  runtime.gTasks.push({ id: runtime.gBattleControllerData[b], func: 'TaskDummy', data: Array.from({ length: 16 }, () => 0), destroyed: false });
  runtime.gTasks[runtime.gBattleControllerData[b]].data[0] = runtime.gBattleBufferA[b][1] & 0xf;
  runtime.gBattleStruct.battlerPreventingSwitchout = runtime.gBattleBufferA[b][1] >> 4;
  runtime.gBattleStruct.playerPartyIdx = runtime.gBattleBufferA[b][2];
  runtime.gBattleStruct.abilityPreventingSwitchout = runtime.gBattleBufferA[b][3];
  for (let i = 0; i < 3; i++) runtime.gBattlePartyCurrentOrder[i] = runtime.gBattleBufferA[b][4 + i];
  runtime.operations.push('BeginNormalPaletteFade:PALETTES_ALL:0:0:16:RGB_BLACK');
  runtime.gBattlerControllerFuncs[b] = 'OpenPartyMenuToChooseMon';
  runtime.gBattlerInMenuId = b;
};

export const OpenPartyMenuToChooseMon = (runtime: OakOldManRuntime): void => {
  const b = runtime.gActiveBattler;
  if (!runtime.paletteFadeActive) {
    runtime.gBattlerControllerFuncs[b] = 'WaitForMonSelection';
    const caseId = runtime.gTasks[runtime.gBattleControllerData[b]]?.data[0] ?? 0;
    if (runtime.gTasks[runtime.gBattleControllerData[b]]) runtime.gTasks[runtime.gBattleControllerData[b]].destroyed = true;
    runtime.operations.push('FreeAllWindowBuffers', `OpenPartyMenuInTutorialBattle:${caseId}`);
  }
};

export const WaitForMonSelection = (runtime: OakOldManRuntime): void => {
  if (runtime.gMain.callback2 === 'BattleMainCB2' && !runtime.paletteFadeActive) {
    emitChosenMonReturnValue(runtime, 1, runtime.gPartyMenuUseExitCallback ? runtime.gSelectedMonPartyId : 6);
    complete(runtime);
  }
};

export const OakOldManHandleHealthBarUpdate = (runtime: OakOldManRuntime): void => {
  const b = runtime.gActiveBattler;
  const hpVal = u16(runtime.gBattleBufferA[b], 2);
  const mon = runtime.gPlayerParty[runtime.gBattlerPartyIndexes[b]];
  runtime.operations.push('LoadBattleBarGfx:0', 'LoadBattleBarGfx:0', `SetBattleBarStruct:${b}:${mon.maxHP}:${hpVal !== INSTANT_HP_BAR_DROP ? mon.hp : 0}:${hpVal}`);
  if (hpVal === INSTANT_HP_BAR_DROP) runtime.operations.push(`UpdateHpTextInHealthbox:${b}:0:${Partner.HP_CURRENT}`);
  runtime.gBattlerControllerFuncs[b] = 'CompleteOnHealthbarDone';
};

export const CompleteOnHealthbarDone = (runtime: OakOldManRuntime): void => {
  const b = runtime.gActiveBattler;
  const hp = runtime.moveBattleBarResults.shift() ?? -1;
  runtime.operations.push(`MoveBattleBar:${b}`, `SetHealthboxSpriteVisible:${b}`);
  if (hp !== -1) runtime.operations.push(`UpdateHpTextInHealthbox:${b}:${hp}:${Partner.HP_CURRENT}`);
  else complete(runtime);
};

export const OakOldManHandleExpUpdate = (runtime: OakOldManRuntime): void => {
  const b = runtime.gActiveBattler;
  const monId = runtime.gBattleBufferA[b][1];
  if ((runtime.gPlayerParty[monId]?.level ?? 0) >= MAX_LEVEL) complete(runtime);
  else {
    const taskId = runtime.gTasks.length;
    runtime.operations.push('LoadBattleBarGfx:1', `CreateTask:Task_GiveExpToMon:10:${taskId}`);
    runtime.gTasks.push({ id: taskId, func: 'Task_GiveExpToMon', data: [monId, u16(runtime.gBattleBufferA[b], 2), b], destroyed: false });
    runtime.gBattlerControllerFuncs[b] = 'OakOldManDummy';
  }
};

export const Task_GiveExpToMon = (runtime: OakOldManRuntime, taskId: number): void => {
  const task = runtime.gTasks[taskId];
  const [monId, gainedExp, battlerId] = task.data;
  const mon = runtime.gPlayerParty[monId];
  if (!mon || monId !== runtime.gBattlerPartyIndexes[battlerId] || runtime.isDoubleBattle) {
    runtime.operations.push(`Task_GiveExpToMon:${monId}:${gainedExp}:${battlerId}:noExpBar`);
    task.func = 'DestroyExpTaskAndCompleteOnInactiveTextPrinter';
    return;
  }
  task.func = 'Task_PrepareToGiveExpWithExpBar';
};

export const Task_PrepareToGiveExpWithExpBar = (runtime: OakOldManRuntime, taskId: number): void => {
  const task = runtime.gTasks[taskId];
  const [monId, gainedExp, battlerId] = task.data;
  const mon = runtime.gPlayerParty[monId];
  runtime.operations.push(`SetBattleBarStruct:${battlerId}:EXP:${mon?.experience ?? 0}:${-gainedExp}`, 'PlaySE:SE_EXP');
  task.func = 'Task_GiveExpWithExpBar';
};

export const Task_GiveExpWithExpBar = (runtime: OakOldManRuntime, taskId: number): void => {
  const task = runtime.gTasks[taskId];
  task.data[3] = (task.data[3] ?? 0) + 1;
  if (task.data[3] < 13) return;
  const [monId, gainedExp, battlerId] = task.data;
  const newExp = runtime.moveBattleBarResults.shift() ?? -1;
  runtime.operations.push(`MoveBattleBar:${battlerId}:EXP`, `SetHealthboxSpriteVisible:${battlerId}`);
  if (newExp !== -1) return;
  runtime.operations.push('m4aSongNumStop:SE_EXP');
  const mon = runtime.gPlayerParty[monId];
  if (mon) mon.experience += gainedExp;
  runtime.gBattlerControllerFuncs[battlerId] = 'CompleteOnInactiveTextPrinter2';
  task.destroyed = true;
};

export const Task_LaunchLvlUpAnim = (runtime: OakOldManRuntime, taskId: number): void => {
  const task = runtime.gTasks[taskId];
  const battlerId = task.data[2];
  runtime.operations.push(`InitAndLaunchSpecialAnimation:${battlerId}:B_ANIM_LVL_UP`);
  task.func = 'Task_UpdateLvlInHealthbox';
};

export const Task_UpdateLvlInHealthbox = (runtime: OakOldManRuntime, taskId: number): void => {
  const task = runtime.gTasks[taskId];
  const battlerId = task.data[2];
  if (runtime.gBattleSpritesDataPtr.healthBoxesData[battlerId].specialAnimActive) return;
  runtime.operations.push(`UpdateHealthboxAttribute:${battlerId}:${Partner.HEALTHBOX_ALL}`);
  task.func = 'DestroyExpTaskAndCompleteOnInactiveTextPrinter';
};

export const DestroyExpTaskAndCompleteOnInactiveTextPrinter = (runtime: OakOldManRuntime, taskId: number): void => {
  const task = runtime.gTasks[taskId];
  const battlerId = task.data[2];
  runtime.gBattlerControllerFuncs[battlerId] = 'CompleteOnInactiveTextPrinter2';
  task.destroyed = true;
};

export const OakOldManHandlePlaySE = (runtime: OakOldManRuntime): void => {
  runtime.sounds.push({ kind: 'SE', id: u16(runtime.gBattleBufferA[runtime.gActiveBattler], 1) });
  complete(runtime);
};
export const OakOldManHandlePlayFanfare = (runtime: OakOldManRuntime): void => {
  runtime.sounds.push({ kind: 'FANFARE', id: u16(runtime.gBattleBufferA[runtime.gActiveBattler], 1) });
  complete(runtime);
};
export const OakOldManHandleFaintingCry = (runtime: OakOldManRuntime): void => {
  const b = runtime.gActiveBattler;
  runtime.sounds.push({ kind: 'CRY', id: runtime.gPlayerParty[runtime.gBattlerPartyIndexes[b]].species, pan: 25 });
  complete(runtime);
};
export const OakOldManHandleIntroSlide = (runtime: OakOldManRuntime): void => {
  runtime.operations.push(`HandleIntroSlide:${runtime.gBattleBufferA[runtime.gActiveBattler][1]}`);
  runtime.gIntroSlideFlags |= 1;
  complete(runtime);
};
export const OakOldManHandleBattleAnimation = (runtime: OakOldManRuntime): void => {
  const b = runtime.gActiveBattler;
  runtime.operations.push(`TryHandleLaunchBattleTableAnimation:${b}:${runtime.gBattleBufferA[b][1]}:${u16(runtime.gBattleBufferA[b], 2)}`);
  if (runtime.tryHandleBattleAnimationResult) complete(runtime);
  else runtime.gBattlerControllerFuncs[b] = 'CompleteOnFinishedBattleAnimation';
};
export const OakOldManHandleEndBounceEffect = (runtime: OakOldManRuntime): void => {
  runtime.operations.push(`EndBounceEffect:${runtime.gActiveBattler}:BOUNCE_HEALTHBOX`, `EndBounceEffect:${runtime.gActiveBattler}:BOUNCE_MON`);
  complete(runtime);
};
export const OakOldManHandleLinkStandbyMsg = (runtime: OakOldManRuntime): void => {
  const v = runtime.gBattleBufferA[runtime.gActiveBattler][1];
  if (v === 0 || v === 1) runtime.operations.push(`EndBounceEffect:${runtime.gActiveBattler}:BOUNCE_HEALTHBOX`, `EndBounceEffect:${runtime.gActiveBattler}:BOUNCE_MON`);
  complete(runtime);
};
export const OakOldManHandleCmd55 = (runtime: OakOldManRuntime): void => {
  const b = runtime.gActiveBattler;
  runtime.gBattleOutcome = runtime.gBattleBufferA[b][1];
  runtime.operations.push('FadeOutMapMusic:5', 'BeginFastPaletteFade:3');
  complete(runtime);
  if (!(runtime.gBattleTypeFlags & BATTLE_TYPE_IS_MASTER) && (runtime.gBattleTypeFlags & BATTLE_TYPE_LINK_REAL)) runtime.gBattlerControllerFuncs[b] = 'OakOldManSetBattleEndCallbacks';
};
export const OakOldManSetBattleEndCallbacks = (runtime: OakOldManRuntime): void => {
  if (!runtime.paletteFadeActive) {
    runtime.gMain.inBattle = 0;
    runtime.gMain.callback1 = runtime.gMain.preBattleCallback1;
    runtime.operations.push(`SetMainCallback2:${runtime.gMain.savedCallback}`);
  }
};

export const BtlCtrl_DrawVoiceoverMessageFrame = (runtime: OakOldManRuntime): void => {
  runtime.operations.push('BtlCtrl_DrawVoiceoverMessageFrame');
};

export const BtlCtrl_RemoveVoiceoverMessageFrame = (runtime: OakOldManRuntime): void => {
  runtime.operations.push('BtlCtrl_RemoveVoiceoverMessageFrame');
};

export const OakOldManHandleReturnMonToBall = (runtime: OakOldManRuntime): void => {
  const b = runtime.gActiveBattler;
  if (runtime.gBattleBufferA[b][1] === 0) {
    runtime.operations.push(`InitAndLaunchSpecialAnimation:${b}:${Partner.B_ANIM_SWITCH_OUT_PLAYER_MON}`);
    runtime.gBattlerControllerFuncs[b] = 'DoSwitchOutAnimation';
  } else {
    runtime.operations.push(`FreeSpriteOamMatrix:${runtime.gBattlerSpriteIds[b]}`, `DestroySprite:${runtime.gBattlerSpriteIds[b]}`, `SetHealthboxSpriteInvisible:${b}`);
    complete(runtime);
  }
};
export const DoSwitchOutAnimation = complete;
export const CompleteOnBattlerSpriteCallbackDummy = (runtime: OakOldManRuntime): void => { if (runtime.gSprites[runtime.gBattlerSpriteIds[runtime.gActiveBattler]].callback === 'SpriteCallbackDummy') complete(runtime); };
export const CompleteOnBattlerSpriteCallbackDummy2 = CompleteOnBattlerSpriteCallbackDummy;
export const CompleteOnInactiveTextPrinter = (runtime: OakOldManRuntime): void => { if (!runtime.textPrinterActive) complete(runtime); };
export const CompleteOnInactiveTextPrinter2 = CompleteOnInactiveTextPrinter;
export const CompleteOnSpecialAnimDone = (runtime: OakOldManRuntime): void => { if (!runtime.gDoingBattleAnim) complete(runtime); };
export const CompleteOnFinishedBattleAnimation = (runtime: OakOldManRuntime): void => { if (!runtime.gBattleSpritesDataPtr.healthBoxesData[runtime.gActiveBattler].animFromTableActive) complete(runtime); };
export const CompleteOnFinishedStatusAnimation = (runtime: OakOldManRuntime): void => { if (!runtime.gBattleSpritesDataPtr.healthBoxesData[runtime.gActiveBattler].statusAnimActive) complete(runtime); };
export const DoHitAnimBlinkSpriteEffect = (runtime: OakOldManRuntime): void => {
  const sprite = runtime.gSprites[runtime.gBattlerSpriteIds[runtime.gActiveBattler]];
  if (sprite.data[1] === 32) {
    sprite.data[1] = 0;
    sprite.invisible = false;
    runtime.gDoingBattleAnim = false;
    complete(runtime);
    return;
  }
  if (sprite.data[1] % 4 === 0) sprite.invisible = !sprite.invisible;
  sprite.data[1]++;
};
export const FreeMonSpriteAfterFaintAnim = (runtime: OakOldManRuntime): void => {
  const b = runtime.gActiveBattler;
  const id = runtime.gBattlerSpriteIds[b];
  const sprite = runtime.gSprites[id];
  if (sprite.y + sprite.y2 <= Partner.DISPLAY_HEIGHT) return;
  runtime.operations.push(`FreeOamMatrix:${sprite.oam.matrixNum}`, `DestroySprite:${id}`, `SetHealthboxSpriteInvisible:${b}`);
  sprite.callback = 'Destroyed';
  complete(runtime);
};
export const OakOldManDoMoveAnimation = (runtime: OakOldManRuntime): void => {
  runtime.operations.push(`OakOldManDoMoveAnimation:${runtime.gActiveBattler}`);
  complete(runtime);
};

export const StartSendOutAnim = (runtime: OakOldManRuntime, battlerId: number): void => {
  runtime.gBattlerPartyIndexes[battlerId] = runtime.gBattleBufferA[battlerId][1];
  const species = runtime.gPlayerParty[runtime.gBattlerPartyIndexes[battlerId]]?.species ?? 0;
  runtime.operations.push(`SetTransformSpecies:${battlerId}:SPECIES_NONE`, `CreateInvisibleSpriteWithCallback:${battlerId}`, `SetMultiuseSpriteTemplateToPokemon:${species}:${runtime.battlerPositions[battlerId]}`, `DoPokeballSendOutAnimation:0:${Partner.POKEBALL_PLAYER_SENDOUT}`);
};

export const Task_StartSendOutAnim = (runtime: OakOldManRuntime, taskId: number): void => {
  const task = runtime.gTasks[taskId];
  if (task.data[1] < 31) {
    task.data[1]++;
    return;
  }
  const saved = runtime.gActiveBattler;
  runtime.gActiveBattler = task.data[0];
  runtime.gBattleBufferA[runtime.gActiveBattler][1] = runtime.gBattlerPartyIndexes[runtime.gActiveBattler];
  StartSendOutAnim(runtime, runtime.gActiveBattler);
  runtime.gBattlerControllerFuncs[runtime.gActiveBattler] = 'Intro_TryShinyAnimShowHealthbox';
  runtime.gActiveBattler = saved;
  task.destroyed = true;
};

export const Intro_TryShinyAnimShowHealthbox = (runtime: OakOldManRuntime): void => {
  const b = runtime.gActiveBattler;
  runtime.operations.push(`TryShinyAnimation:${b}`, `UpdateHealthboxAttribute:${b}:${Partner.HEALTHBOX_ALL}`, `StartHealthboxSlideIn:${b}`, `SetHealthboxSpriteVisible:${b}`);
  runtime.gBattleSpritesDataPtr.animationData.introAnimActive = false;
  runtime.gBattlerControllerFuncs[b] = 'Intro_WaitForShinyAnimAndHealthbox';
};
export const Intro_WaitForShinyAnimAndHealthbox = (runtime: OakOldManRuntime): void => {
  const b = runtime.gActiveBattler;
  const partner = b ^ Partner.BIT_FLANK;
  const hb = runtime.gBattleSpritesDataPtr.healthBoxesData;
  if (runtime.gSprites[runtime.gHealthboxSpriteIds[b]].callback !== 'SpriteCallbackDummy') return;
  if (!hb[b].finishedShinyMonAnim || !hb[partner].finishedShinyMonAnim) return;
  hb[b].triedShinyMonAnim = false;
  hb[b].finishedShinyMonAnim = false;
  hb[partner].triedShinyMonAnim = false;
  hb[partner].finishedShinyMonAnim = false;
  runtime.operations.push('FreeSpriteTilesByTag:ANIM_TAG_GOLD_STARS', 'FreeSpritePaletteByTag:ANIM_TAG_GOLD_STARS', 'CreateTask:Task_PlayerController_RestoreBgmAfterCry:10', `HandleLowHpMusicChange:${b}`);
  runtime.gBattlerControllerFuncs[b] = 'PrintOakText_ForPetesSake';
};

export const PrintOakTextWithMainBgDarkened = (runtime: OakOldManRuntime, text: string, delay: number): void => {
  const state = runtime.gBattleStruct.simulatedInputState;
  switch (state[0]) {
    case 0:
      if (!runtime.textPrinterActive) {
        state[3] = delay & 0xff;
        state[0]++;
      }
      break;
    case 1:
      state[3] = (state[3] - 1) & 0xff;
      if (state[3] === 0) {
        runtime.operations.push('BeginNormalPaletteFade:0xFFFFFF7E:4:0:8:RGB_BLACK');
        state[0]++;
      }
      break;
    case 2:
      if (!runtime.paletteFadeActive) {
        BtlCtrl_DrawVoiceoverMessageFrame(runtime);
        state[0]++;
      }
      break;
    case 3:
      runtime.operations.push(`BattleStringExpandPlaceholdersToDisplayedString:${text}`, 'BattlePutTextOnWindow:gDisplayedStringBattle:B_WIN_OAK_OLD_MAN');
      state[0]++;
      break;
    case 4:
      if (!runtime.textPrinterActive) {
        runtime.operations.push('BeginNormalPaletteFade:0xFFFFFF7E:4:8:0:RGB_BLACK');
        state[0]++;
      }
      break;
    case 5:
      if (!runtime.paletteFadeActive) {
        BtlCtrl_RemoveVoiceoverMessageFrame(runtime);
        complete(runtime);
        state[0] = 0;
      }
      break;
  }
};

export const PrintOakText_InflictingDamageIsKey = (runtime: OakOldManRuntime): void => {
  PrintOakTextWithMainBgDarkened(runtime, 'gText_InflictingDamageIsKey', 1);
};

export const PrintOakText_LoweringStats = (runtime: OakOldManRuntime): void => {
  PrintOakTextWithMainBgDarkened(runtime, 'gText_LoweringStats', 64);
};

export const PrintOakText_OakNoRunningFromATrainer = (runtime: OakOldManRuntime): void => {
  PrintOakTextWithMainBgDarkened(runtime, 'gText_OakNoRunningFromATrainer', 1);
};

export const PrintOakText_WinEarnsPrizeMoney = (runtime: OakOldManRuntime): void => {
  PrintOakTextWithMainBgDarkened(runtime, 'gText_WinEarnsPrizeMoney', 64);
};

export const PrintOakText_HowDisappointing = (runtime: OakOldManRuntime): void => {
  PrintOakTextWithMainBgDarkened(runtime, 'gText_HowDissapointing', 64);
};

export const PrintOakText_KeepAnEyeOnHP = (runtime: OakOldManRuntime): void => {
  const state = runtime.gBattleStruct.simulatedInputState;
  switch (state[0]) {
    case 0:
      if (!runtime.paletteFadeActive) {
        runtime.operations.push(`DoLoadHealthboxPalsForLevelUp:${runtime.gActiveBattler}`, 'BeginNormalPaletteFade:0xFFFFFF7E:4:0:8:RGB_BLACK');
        state[0]++;
      }
      break;
    case 1:
      if (!runtime.paletteFadeActive) {
        runtime.operations.push('BeginNormalPaletteFade:healthboxMask:4:8:0:RGB_BLACK');
        state[0]++;
      }
      break;
    case 2:
      if (!runtime.paletteFadeActive) {
        BtlCtrl_DrawVoiceoverMessageFrame(runtime);
        state[0]++;
      }
      break;
    case 3:
      runtime.operations.push('BattleStringExpandPlaceholdersToDisplayedString:gText_KeepAnEyeOnHP', 'BattlePutTextOnWindow:gDisplayedStringBattle:B_WIN_OAK_OLD_MAN');
      state[0]++;
      break;
    case 4:
      if (!runtime.textPrinterActive) {
        runtime.operations.push('BeginNormalPaletteFade:healthboxMask:4:0:8:RGB_BLACK');
        state[0]++;
      }
      break;
    case 5:
      if (!runtime.paletteFadeActive) {
        runtime.operations.push('BeginNormalPaletteFade:0xFFFFFF7E:4:8:0:RGB_BLACK');
        state[0]++;
      }
      break;
    case 6:
      if (!runtime.paletteFadeActive) {
        BtlCtrl_RemoveVoiceoverMessageFrame(runtime);
        emitOneReturnValue(runtime, 1, runtime.gSpecialVar_ItemId);
        complete(runtime);
        state[0] = 0;
      }
      break;
  }
};

export const PrintOakText_ForPetesSake = (runtime: OakOldManRuntime): void => {
  const state = runtime.gBattleStruct.simulatedInputState;
  switch (state[0]) {
    case 0:
      if (!runtime.paletteFadeActive) {
        runtime.operations.push('DoLoadHealthboxPalsForLevelUp:opponentLeft', 'BeginNormalPaletteFade:0xFFFFFF7E:4:0:8:RGB_BLACK');
        state[0]++;
      }
      break;
    case 1:
      if (!runtime.paletteFadeActive) {
        BtlCtrl_DrawVoiceoverMessageFrame(runtime);
        state[0]++;
      }
      break;
    case 2:
      runtime.operations.push('BattleStringExpandPlaceholdersToDisplayedString:gText_ForPetesSake', 'BattlePutTextOnWindow:gDisplayedStringBattle:B_WIN_OAK_OLD_MAN');
      state[0]++;
      break;
    case 3:
      if (!runtime.textPrinterActive) {
        runtime.operations.push('BeginNormalPaletteFade:healthboxMask:4:8:0:RGB_BLACK');
        state[0]++;
      }
      break;
    case 4:
      if (!runtime.paletteFadeActive) {
        runtime.operations.push('BattleStringExpandPlaceholdersToDisplayedString:gText_TheTrainerThat', 'BattlePutTextOnWindow:gDisplayedStringBattle:B_WIN_OAK_OLD_MAN');
        state[0]++;
      }
      break;
    case 5:
      if (!runtime.textPrinterActive) {
        runtime.operations.push('BeginNormalPaletteFade:healthboxMask:4:0:8:RGB_BLACK');
        state[0]++;
      }
      break;
    case 6:
      if (!runtime.paletteFadeActive) {
        runtime.operations.push('BattleStringExpandPlaceholdersToDisplayedString:gText_TryBattling', 'BattlePutTextOnWindow:gDisplayedStringBattle:B_WIN_OAK_OLD_MAN');
        state[0]++;
      }
      break;
    case 7:
      if (!runtime.textPrinterActive) {
        runtime.operations.push('BeginNormalPaletteFade:0xFFFFFF7E:4:8:0:RGB_BLACK');
        state[0]++;
      }
      break;
    case 8:
      if (!runtime.paletteFadeActive) {
        runtime.operations.push('DoFreeHealthboxPalsForLevelUp:opponentLeft');
        BtlCtrl_RemoveVoiceoverMessageFrame(runtime);
        state[0] = 0;
        complete(runtime);
      }
      break;
  }
};
export const OakOldManHandleDrawTrainerPic = complete;
export const OakOldManHandleTrainerSlide = complete;
export const OakOldManHandleTrainerSlideBack = (runtime: OakOldManRuntime): void => complete(runtime);
export const OakOldManHandleFaintAnimation = complete;
export const OakOldManHandlePaletteFade = (runtime: OakOldManRuntime): void => complete(runtime);
export const OakOldManHandleSuccessBallThrowAnim = complete;
export const OakOldManHandleBallThrowAnim = complete;
export const OakOldManHandlePause = (runtime: OakOldManRuntime): void => complete(runtime);
export const OakOldManHandleMoveAnimation = complete;
export const OakOldManHandleUnknownYesNoBox = (runtime: OakOldManRuntime): void => complete(runtime);
export const OakOldManHandleCmd23 = (runtime: OakOldManRuntime): void => complete(runtime);
export const OakOldManHandleStatusIconUpdate = (runtime: OakOldManRuntime): void => complete(runtime);
export const OakOldManHandleStatusAnimation = (runtime: OakOldManRuntime): void => complete(runtime);
export const OakOldManHandleStatusXor = (runtime: OakOldManRuntime): void => complete(runtime);
export const OakOldManHandleDataTransfer = (runtime: OakOldManRuntime): void => complete(runtime);
export const OakOldManHandleDMA3Transfer = (runtime: OakOldManRuntime): void => complete(runtime);
export const OakOldManHandlePlayBGM = (runtime: OakOldManRuntime): void => complete(runtime);
export const OakOldManHandleCmd32 = (runtime: OakOldManRuntime): void => complete(runtime);
export const OakOldManHandleTwoReturnValues = (runtime: OakOldManRuntime): void => complete(runtime);
export const OakOldManHandleChosenMonReturnValue = (runtime: OakOldManRuntime): void => complete(runtime);
export const OakOldManHandleOneReturnValue = (runtime: OakOldManRuntime): void => complete(runtime);
export const OakOldManHandleOneReturnValue_Duplicate = (runtime: OakOldManRuntime): void => complete(runtime);
export const OakOldManHandleCmd37 = (runtime: OakOldManRuntime): void => complete(runtime);
export const OakOldManHandleCmd38 = (runtime: OakOldManRuntime): void => complete(runtime);
export const OakOldManHandleCmd39 = (runtime: OakOldManRuntime): void => complete(runtime);
export const OakOldManHandleCmd40 = (runtime: OakOldManRuntime): void => complete(runtime);
export const OakOldManHandleHitAnimation = complete;
export const OakOldManHandleCmd42 = (runtime: OakOldManRuntime): void => complete(runtime);
export const OakOldManHandleIntroTrainerBallThrow = complete;
export const OakOldManHandleDrawPartyStatusSummary = complete;
export const OakOldManHandleHidePartyStatusSummary = (runtime: OakOldManRuntime): void => complete(runtime);
export const OakOldManHandleSpriteInvisibility = (runtime: OakOldManRuntime): void => complete(runtime);
export const OakOldManHandleResetActionMoveSelection = (runtime: OakOldManRuntime): void => complete(runtime);
export const OakOldManCmdEnd = (_runtime: OakOldManRuntime): void => {};

export const sOakOldManBufferCommands: Array<((runtime: OakOldManRuntime) => void) | undefined> = [
  OakOldManHandleGetMonData, OakOldManHandleGetRawMonData, OakOldManHandleSetMonData, OakOldManHandleSetRawMonData,
  OakOldManHandleLoadMonSprite, OakOldManHandleSwitchInAnim, OakOldManHandleReturnMonToBall, OakOldManHandleDrawTrainerPic,
  OakOldManHandleTrainerSlide, OakOldManHandleTrainerSlideBack, OakOldManHandleFaintAnimation, OakOldManHandlePaletteFade,
  OakOldManHandleSuccessBallThrowAnim, OakOldManHandleBallThrowAnim, OakOldManHandlePause, OakOldManHandleMoveAnimation,
  OakOldManHandlePrintString, OakOldManHandlePrintSelectionString, OakOldManHandleChooseAction, OakOldManHandleUnknownYesNoBox,
  OakOldManHandleChooseMove, OakOldManHandleChooseItem, OakOldManHandleChoosePokemon, OakOldManHandleCmd23,
  OakOldManHandleHealthBarUpdate, OakOldManHandleExpUpdate, OakOldManHandleStatusIconUpdate, OakOldManHandleStatusAnimation,
  OakOldManHandleStatusXor, OakOldManHandleDataTransfer, OakOldManHandleDMA3Transfer, OakOldManHandlePlayBGM,
  OakOldManHandleCmd32, OakOldManHandleTwoReturnValues, OakOldManHandleChosenMonReturnValue, OakOldManHandleOneReturnValue,
  OakOldManHandleOneReturnValue_Duplicate, OakOldManHandleCmd37, OakOldManHandleCmd38, OakOldManHandleCmd39,
  OakOldManHandleCmd40, OakOldManHandleHitAnimation, OakOldManHandleCmd42, OakOldManHandlePlaySE,
  OakOldManHandlePlayFanfare, OakOldManHandleFaintingCry, OakOldManHandleIntroSlide, OakOldManHandleIntroTrainerBallThrow,
  OakOldManHandleDrawPartyStatusSummary, OakOldManHandleHidePartyStatusSummary, OakOldManHandleEndBounceEffect,
  OakOldManHandleSpriteInvisibility, OakOldManHandleBattleAnimation, OakOldManHandleLinkStandbyMsg,
  OakOldManHandleResetActionMoveSelection, OakOldManHandleCmd55, OakOldManCmdEnd
];

export const runOakOldManControllerFunc = (runtime: OakOldManRuntime, newKeys = 0): void => {
  switch (runtime.gBattlerControllerFuncs[runtime.gActiveBattler]) {
    case 'OakOldManBufferRunCommand': OakOldManBufferRunCommand(runtime); break;
    case 'HandleChooseActionAfterDma3': HandleChooseActionAfterDma3(runtime); break;
    case 'HandleInputChooseAction': HandleInputChooseAction(runtime, newKeys); break;
    case 'SimulateInputChooseAction': SimulateInputChooseAction(runtime); break;
    case 'OakHandleChooseMove_WaitDma3': OakHandleChooseMove_WaitDma3(runtime); break;
    case 'OakOldManHandleInputChooseMove': OakOldManHandleInputChooseMove(runtime); break;
    case 'OpenBagAndChooseItem': OpenBagAndChooseItem(runtime); break;
    case 'CompleteWhenChoseItem': CompleteWhenChoseItem(runtime); break;
    case 'OpenPartyMenuToChooseMon': OpenPartyMenuToChooseMon(runtime); break;
    case 'WaitForMonSelection': WaitForMonSelection(runtime); break;
    case 'CompleteOnBattlerSpriteCallbackDummy': CompleteOnBattlerSpriteCallbackDummy(runtime); break;
    case 'CompleteOnInactiveTextPrinter': CompleteOnInactiveTextPrinter(runtime); break;
    case 'CompleteOnInactiveTextPrinter2': CompleteOnInactiveTextPrinter2(runtime); break;
    case 'CompleteOnHealthbarDone': CompleteOnHealthbarDone(runtime); break;
    case 'CompleteOnFinishedStatusAnimation': CompleteOnFinishedStatusAnimation(runtime); break;
    case 'CompleteOnFinishedBattleAnimation': CompleteOnFinishedBattleAnimation(runtime); break;
    case 'FreeMonSpriteAfterFaintAnim': FreeMonSpriteAfterFaintAnim(runtime); break;
    case 'CompleteOnSpecialAnimDone': CompleteOnSpecialAnimDone(runtime); break;
    case 'CompleteOnBattlerSpriteCallbackDummy2': CompleteOnBattlerSpriteCallbackDummy2(runtime); break;
    case 'DoHitAnimBlinkSpriteEffect': DoHitAnimBlinkSpriteEffect(runtime); break;
    case 'DoSwitchOutAnimation': DoSwitchOutAnimation(runtime); break;
    case 'OakOldManDoMoveAnimation': OakOldManDoMoveAnimation(runtime); break;
    case 'OakOldManSetBattleEndCallbacks': OakOldManSetBattleEndCallbacks(runtime); break;
    case 'OakOldManDummy':
      OakOldManDummy(runtime);
      break;
    case 'BattleControllerDummy':
      break;
    case 'PrintOakText_InflictingDamageIsKey':
      PrintOakText_InflictingDamageIsKey(runtime);
      break;
    case 'PrintOakText_LoweringStats':
      PrintOakText_LoweringStats(runtime);
      break;
    case 'PrintOakText_OakNoRunningFromATrainer':
      PrintOakText_OakNoRunningFromATrainer(runtime);
      break;
    case 'PrintOakText_WinEarnsPrizeMoney':
      PrintOakText_WinEarnsPrizeMoney(runtime);
      break;
    case 'PrintOakText_HowDisappointing':
      PrintOakText_HowDisappointing(runtime);
      break;
    case 'PrintOakText_KeepAnEyeOnHP':
      PrintOakText_KeepAnEyeOnHP(runtime);
      break;
    case 'PrintOakText_ForPetesSake':
      PrintOakText_ForPetesSake(runtime);
      break;
    case 'Intro_TryShinyAnimShowHealthbox':
      Intro_TryShinyAnimShowHealthbox(runtime);
      break;
    case 'Intro_WaitForShinyAnimAndHealthbox':
      Intro_WaitForShinyAnimAndHealthbox(runtime);
      break;
  }
};
