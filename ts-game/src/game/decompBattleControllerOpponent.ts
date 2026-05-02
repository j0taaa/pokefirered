import * as LinkOpponent from './decompBattleControllerLinkOpponent';
import * as Partner from './decompBattleControllerLinkPartner';

export * from './decompBattleControllerLinkOpponent';

export const PARTY_SIZE = 6;
export const BATTLE_TYPE_DOUBLE_REAL = 1 << 0;
export const BATTLE_TYPE_LINK_REAL = 1 << 1;
export const BATTLE_TYPE_TRAINER = 1 << 3;
export const BATTLE_TYPE_FIRST_BATTLE = 1 << 4;
export const BATTLE_TYPE_MULTI_REAL = 1 << 6;
export const BATTLE_TYPE_SAFARI = 1 << 7;
export const BATTLE_TYPE_ROAMER = 1 << 10;
export const BATTLE_TYPE_IS_MASTER = 1 << 16;
export const MOVE_NONE = 0;
export const MOVE_TARGET_USER_OR_SELECTED = 1 << 1;
export const MOVE_TARGET_BOTH = 1 << 3;
export const MOVE_TARGET_USER = 1 << 4;
export const AI_CHOICE_FLEE = 4;
export const AI_CHOICE_WATCH = 5;
export const B_ACTION_RUN = 3;
export const B_ACTION_SAFARI_WATCH_CAREFULLY = 4;
export const B_POSITION_PLAYER_LEFT = 0;
export const B_POSITION_OPPONENT_LEFT = 1;
export const B_POSITION_PLAYER_RIGHT = 2;
export const B_POSITION_OPPONENT_RIGHT = 3;

export type OpponentControllerFunc =
  | Exclude<LinkOpponent.LinkOpponentControllerFunc, 'LinkOpponentBufferRunCommand' | 'LinkOpponentDummy' | 'LinkOpponentDoMoveAnimation'>
  | 'OpponentBufferRunCommand'
  | 'OpponentDummy'
  | 'OpponentDoMoveAnimation'
  | 'CompleteOnBattlerSpriteCallbackDummy2'
  | 'PrintOakText_HowDisappointing'
  | 'PrintOakText_OakNoRunningFromATrainer'
  | 'PrintOakText_InflictingDamageIsKey';

export interface OpponentRuntime extends Omit<LinkOpponent.LinkOpponentRuntime, 'gBattlerControllerFuncs'> {
  gBattlerControllerFuncs: OpponentControllerFunc[];
  gBattleMoves: Record<number, { target: number }>;
  gBattlerTarget: number;
  gAbsentBattlerFlags: number;
  randomValues: number[];
  aiChosenMoveOrAction: number;
  mostSuitableMonToSwitchInto: number;
  gBattleStruct: {
    chosenItem: number[];
    AI_monToSwitchIntoId: number[];
    monToSwitchIntoId: number[];
  };
  mainState: { inBattle: number; callback1: string; callback2: string; savedCallback: string; preBattleCallback1: string };
}

export const createOpponentRuntime = (overrides: Partial<OpponentRuntime> = {}): OpponentRuntime => {
  const base = LinkOpponent.createLinkOpponentRuntime({
    gBattleTypeFlags: 0,
    gBattlerControllerFuncs: Array.from({ length: 4 }, () => 'OpponentBufferRunCommand' as LinkOpponent.LinkOpponentControllerFunc)
  });
  return {
    ...base,
    gBattlerControllerFuncs: Array.from({ length: 4 }, () => 'OpponentBufferRunCommand'),
    gBattleMoves: {},
    gBattlerTarget: B_POSITION_PLAYER_LEFT,
    gAbsentBattlerFlags: 0,
    randomValues: [],
    aiChosenMoveOrAction: 0,
    mostSuitableMonToSwitchInto: PARTY_SIZE,
    gBattleStruct: {
      chosenItem: Array.from({ length: 4 }, () => 0),
      AI_monToSwitchIntoId: Array.from({ length: 2 }, () => PARTY_SIZE),
      monToSwitchIntoId: Array.from({ length: 4 }, () => PARTY_SIZE)
    },
    mainState: {
      inBattle: 1,
      callback1: '',
      callback2: '',
      savedCallback: 'savedCallback',
      preBattleCallback1: 'preBattleCallback1'
    },
    ...overrides
  };
};

const u16 = (lo: number, hi: number): number => lo | (hi << 8);
const lo = (value: number): number => value & 0xff;
const hi = (value: number): number => (value >>> 8) & 0xff;

const asLinkOpponentRuntime = (runtime: OpponentRuntime): LinkOpponent.LinkOpponentRuntime =>
  runtime as unknown as LinkOpponent.LinkOpponentRuntime;

const renameLinkOpponentFunc = (runtime: OpponentRuntime): void => {
  const b = runtime.gActiveBattler;
  const current = runtime.gBattlerControllerFuncs[b] as unknown as LinkOpponent.LinkOpponentControllerFunc;
  const map: Partial<Record<LinkOpponent.LinkOpponentControllerFunc, OpponentControllerFunc>> = {
    LinkOpponentBufferRunCommand: 'OpponentBufferRunCommand',
    LinkOpponentDummy: 'OpponentDummy',
    LinkOpponentDoMoveAnimation: 'OpponentDoMoveAnimation'
  };
  runtime.gBattlerControllerFuncs[b] = map[current] ?? (current as unknown as OpponentControllerFunc);
};

const complete = (runtime: OpponentRuntime): void => {
  const b = runtime.gActiveBattler;
  runtime.gBattlerControllerFuncs[b] = 'OpponentBufferRunCommand';
  runtime.gBattleControllerExecFlags &= ~runtime.gBitTable[b];
};

const emitTwoReturnValues = (runtime: OpponentRuntime, bufferId: number, value1: number, value2: number): void => {
  runtime.emittedTransfers.push({ buffer: bufferId === 1 ? 'B' : String(bufferId), size: 4, data: [Partner.CONTROLLER_TWORETURNVALUES, lo(value1), lo(value2), hi(value2)] });
};

const emitOneReturnValue = (runtime: OpponentRuntime, bufferId: number, value: number): void => {
  runtime.emittedTransfers.push({ buffer: bufferId === 1 ? 'B' : String(bufferId), size: 4, data: [Partner.CONTROLLER_ONERETURNVALUE, lo(value), hi(value), 0] });
};

const emitChosenMonReturnValue = (runtime: OpponentRuntime, bufferId: number, partyId: number): void => {
  runtime.emittedTransfers.push({ buffer: bufferId === 1 ? 'B' : String(bufferId), size: 5, data: [Partner.CONTROLLER_CHOSENMONRETURNVALUE, lo(partyId), 0, 0, 0] });
};

const nextRandom = (runtime: OpponentRuntime): number => runtime.randomValues.shift() ?? 0;

const battlerAtPosition = (position: number): number => position;
const battlerPosition = (battler: number): number => battler;

const callLink = (runtime: OpponentRuntime, fn: (runtime: LinkOpponent.LinkOpponentRuntime) => void): void => {
  fn(asLinkOpponentRuntime(runtime));
  renameLinkOpponentFunc(runtime);
};

export const CopyOpponentMonData = LinkOpponent.CopyLinkOpponentMonData as unknown as (runtime: OpponentRuntime, monId: number) => number[];
export const SetOpponentMonData = LinkOpponent.SetLinkOpponentMonData as unknown as (runtime: OpponentRuntime, monId: number) => void;

export const OpponentBufferExecCompleted = complete;
export const OpponentDummy = (_runtime: OpponentRuntime): void => {};

export const SetControllerToOpponent = (runtime: OpponentRuntime): void => {
  runtime.gBattlerControllerFuncs[runtime.gActiveBattler] = 'OpponentBufferRunCommand';
};

export const OpponentBufferRunCommand = (runtime: OpponentRuntime): void => {
  const b = runtime.gActiveBattler;
  if (runtime.gBattleControllerExecFlags & runtime.gBitTable[b]) {
    const handler = sOpponentBufferCommands[runtime.gBattleBufferA[b][0]];
    if (handler) handler(runtime);
    else complete(runtime);
  }
};

export const CompleteOnBattlerSpriteCallbackDummy = (runtime: OpponentRuntime): void => callLink(runtime, LinkOpponent.CompleteOnBattlerSpriteCallbackDummy);
export const CompleteOnBattlerSpriteCallbackDummy2 = (runtime: OpponentRuntime): void => {
  const b = runtime.gActiveBattler;
  if (runtime.gSprites[runtime.gBattlerSpriteIds[b]].callback === 'SpriteCallbackDummy') complete(runtime);
};
export const FreeTrainerSpriteAfterSlide = (runtime: OpponentRuntime): void => callLink(runtime, LinkOpponent.FreeTrainerSpriteAfterSlide);
export const Intro_DelayAndEnd = (runtime: OpponentRuntime): void => callLink(runtime, LinkOpponent.Intro_DelayAndEnd);

export const Intro_WaitForShinyAnimAndHealthbox = (runtime: OpponentRuntime): void => {
  const b = runtime.gActiveBattler;
  const flank = b ^ Partner.BIT_FLANK;
  let done = false;
  if (!runtime.isDoubleBattle || (runtime.isDoubleBattle && (runtime.gBattleTypeFlags & BATTLE_TYPE_MULTI_REAL))) {
    done = runtime.gSprites[runtime.gHealthboxSpriteIds[b]].callback === 'SpriteCallbackDummy';
  } else {
    done =
      runtime.gSprites[runtime.gHealthboxSpriteIds[b]].callback === 'SpriteCallbackDummy' &&
      runtime.gSprites[runtime.gHealthboxSpriteIds[flank]].callback === runtime.gSprites[runtime.gHealthboxSpriteIds[b]].callback;
  }
  if (runtime.cryPlaying) done = false;
  if (!done || !runtime.gBattleSpritesDataPtr.healthBoxesData[b].finishedShinyMonAnim || !runtime.gBattleSpritesDataPtr.healthBoxesData[flank].finishedShinyMonAnim) return;
  runtime.gBattleSpritesDataPtr.healthBoxesData[b].triedShinyMonAnim = false;
  runtime.gBattleSpritesDataPtr.healthBoxesData[b].finishedShinyMonAnim = false;
  runtime.gBattleSpritesDataPtr.healthBoxesData[flank].triedShinyMonAnim = false;
  runtime.gBattleSpritesDataPtr.healthBoxesData[flank].finishedShinyMonAnim = false;
  runtime.operations.push('FreeSpriteTilesByTag:ANIM_TAG_GOLD_STARS', 'FreeSpritePaletteByTag:ANIM_TAG_GOLD_STARS');
  runtime.operations.push(runtime.gBattleTypeFlags & BATTLE_TYPE_MULTI_REAL ? 'm4aMPlayContinue:gMPlayInfo_BGM' : 'm4aMPlayVolumeControl:gMPlayInfo_BGM:TRACKS_ALL:256');
  runtime.gBattleSpritesDataPtr.healthBoxesData[b].introEndDelay = 3;
  runtime.gBattlerControllerFuncs[b] = 'Intro_DelayAndEnd';
};

export const Intro_TryShinyAnimShowHealthbox = (runtime: OpponentRuntime): void => callLink(runtime, LinkOpponent.Intro_TryShinyAnimShowHealthbox);
export const TryShinyAnimAfterMonAnim = (runtime: OpponentRuntime): void => callLink(runtime, LinkOpponent.TryShinyAnimAfterMonAnim);

export const CompleteOnHealthbarDone = (runtime: OpponentRuntime): void => {
  const b = runtime.gActiveBattler;
  const hp = runtime.moveBattleBarResults.shift() ?? -1;
  runtime.operations.push(`MoveBattleBar:${b}`, `SetHealthboxSpriteVisible:${b}`);
  if (hp !== -1) runtime.operations.push(`UpdateHpTextInHealthbox:${b}:${hp}:${Partner.HP_CURRENT}`);
  else if (runtime.gBattleTypeFlags & BATTLE_TYPE_FIRST_BATTLE) {
    runtime.operations.push(`HandleLowHpMusicChange:${b}`);
    runtime.gBattlerControllerFuncs[b] = 'PrintOakText_InflictingDamageIsKey';
  } else complete(runtime);
};

export const HideHealthboxAfterMonFaint = (runtime: OpponentRuntime): void => callLink(runtime, LinkOpponent.HideHealthboxAfterMonFaint);
export const DoSwitchOutAnimation = (runtime: OpponentRuntime): void => callLink(runtime, LinkOpponent.DoSwitchOutAnimation);
export const FreeMonSpriteAfterSwitchOutAnim = (runtime: OpponentRuntime): void => callLink(runtime, LinkOpponent.FreeMonSpriteAfterSwitchOutAnim);
export const CompleteOnInactiveTextPrinter = (runtime: OpponentRuntime): void => callLink(runtime, LinkOpponent.CompleteOnInactiveTextPrinter);
export const DoHitAnimBlinkSpriteEffect = (runtime: OpponentRuntime): void => callLink(runtime, LinkOpponent.DoHitAnimBlinkSpriteEffect);
export const SwitchIn_ShowSubstitute = (runtime: OpponentRuntime): void => callLink(runtime, LinkOpponent.SwitchIn_ShowSubstitute);
export const SwitchIn_HandleSoundAndEnd = (runtime: OpponentRuntime): void => callLink(runtime, LinkOpponent.SwitchIn_HandleSoundAndEnd);
export const SwitchIn_ShowHealthbox = (runtime: OpponentRuntime): void => callLink(runtime, LinkOpponent.SwitchIn_ShowHealthbox);
export const SwitchIn_TryShinyAnim = (runtime: OpponentRuntime): void => callLink(runtime, LinkOpponent.SwitchIn_TryShinyAnim);
export const OpponentDoMoveAnimation = (runtime: OpponentRuntime): void => callLink(runtime, LinkOpponent.LinkOpponentDoMoveAnimation);
export const EndDrawPartyStatusSummary = (runtime: OpponentRuntime): void => callLink(runtime, LinkOpponent.EndDrawPartyStatusSummary);
export const CompleteOnFinishedStatusAnimation = (runtime: OpponentRuntime): void => callLink(runtime, LinkOpponent.CompleteOnFinishedStatusAnimation);
export const CompleteOnFinishedBattleAnimation = (runtime: OpponentRuntime): void => callLink(runtime, LinkOpponent.CompleteOnFinishedBattleAnimation);

export const OpponentHandleGetMonData = (runtime: OpponentRuntime): void => callLink(runtime, LinkOpponent.LinkOpponentHandleGetMonData);
export const GetOpponentMonData = CopyOpponentMonData;

export const OpponentHandleGetRawMonData = (runtime: OpponentRuntime): void => {
  const b = runtime.gActiveBattler;
  const offset = runtime.gBattleBufferA[b][1];
  const size = runtime.gBattleBufferA[b][2];
  const mon = runtime.gEnemyParty[runtime.gBattlerPartyIndexes[b]];
  const data = mon.raw.slice(offset, offset + size);
  runtime.emittedTransfers.push({ buffer: 'B', size, data });
  complete(runtime);
};

export const OpponentHandleSetMonData = (runtime: OpponentRuntime): void => callLink(runtime, LinkOpponent.LinkOpponentHandleSetMonData);
export const OpponentHandleSetRawMonData = (runtime: OpponentRuntime): void => callLink(runtime, LinkOpponent.LinkOpponentHandleSetRawMonData);
export const OpponentHandleLoadMonSprite = (runtime: OpponentRuntime): void => callLink(runtime, LinkOpponent.LinkOpponentHandleLoadMonSprite);
export const StartSendOutAnim = (runtime: OpponentRuntime, battlerId: number, dontClearSubstituteBit: number): void => {
  LinkOpponent.StartSendOutAnim(asLinkOpponentRuntime(runtime), battlerId, dontClearSubstituteBit);
  renameLinkOpponentFunc(runtime);
};

export const OpponentHandleSwitchInAnim = (runtime: OpponentRuntime): void => {
  runtime.gBattleStruct.monToSwitchIntoId[runtime.gActiveBattler] = PARTY_SIZE;
  callLink(runtime, LinkOpponent.LinkOpponentHandleSwitchInAnim);
};

export const OpponentHandleReturnMonToBall = (runtime: OpponentRuntime): void => callLink(runtime, LinkOpponent.LinkOpponentHandleReturnMonToBall);
export const OpponentHandleDrawTrainerPic = (runtime: OpponentRuntime): void => callLink(runtime, LinkOpponent.LinkOpponentHandleDrawTrainerPic);

export const OpponentHandleTrainerSlide = (runtime: OpponentRuntime): void => {
  callLink(runtime, LinkOpponent.LinkOpponentHandleDrawTrainerPic);
  const b = runtime.gActiveBattler;
  const sprite = runtime.gSprites[runtime.gBattlerSpriteIds[b]];
  sprite.x += 32;
  sprite.x2 = 96;
  sprite.data[0] = -2;
  sprite.oam.priority = 30;
  sprite.callback = 'SpriteCB_TrainerSlideIn';
  runtime.gBattlerControllerFuncs[b] = 'CompleteOnBattlerSpriteCallbackDummy';
};

export const OpponentHandleTrainerSlideBack = (runtime: OpponentRuntime): void => callLink(runtime, LinkOpponent.LinkOpponentHandleTrainerSlideBack);
export const OpponentHandleFaintAnimation = (runtime: OpponentRuntime): void => callLink(runtime, LinkOpponent.LinkOpponentHandleFaintAnimation);
export const OpponentHandlePaletteFade = (runtime: OpponentRuntime): void => complete(runtime);
export const OpponentHandleSuccessBallThrowAnim = (runtime: OpponentRuntime): void => complete(runtime);
export const OpponentHandleBallThrowAnim = (runtime: OpponentRuntime): void => complete(runtime);
export const OpponentHandlePause = (runtime: OpponentRuntime): void => complete(runtime);

export const OpponentHandleMoveAnimation = (runtime: OpponentRuntime): void => {
  LinkOpponent.LinkOpponentHandleMoveAnimation(asLinkOpponentRuntime(runtime));
  runtime.gBattlerControllerFuncs[runtime.gActiveBattler] = 'OpponentDoMoveAnimation';
};

export const OpponentHandlePrintString = (runtime: OpponentRuntime): void => {
  const b = runtime.gActiveBattler;
  const stringId = u16(runtime.gBattleBufferA[b][2], runtime.gBattleBufferA[b][3]);
  runtime.gBattle_BG0_X = 0;
  runtime.gBattle_BG0_Y = 0;
  runtime.gDisplayedStringBattle = `BattleString:${stringId}`;
  runtime.operations.push(`BufferStringBattle:${stringId}`, `BattlePutTextOnWindow:${runtime.gDisplayedStringBattle}:${Partner.B_WIN_MSG}`);
  if (runtime.gBattleTypeFlags & BATTLE_TYPE_FIRST_BATTLE) {
    if (stringId === 0x17f) {
      runtime.gBattlerControllerFuncs[b] = 'PrintOakText_HowDisappointing';
      return;
    }
    if (stringId === 0xe3) {
      runtime.gBattlerControllerFuncs[b] = 'PrintOakText_OakNoRunningFromATrainer';
      return;
    }
  }
  runtime.gBattlerControllerFuncs[b] = 'CompleteOnInactiveTextPrinter';
};

export const OpponentHandlePrintSelectionString = (runtime: OpponentRuntime): void => complete(runtime);

export const OpponentHandleChooseAction = (runtime: OpponentRuntime): void => {
  runtime.operations.push('AI_TrySwitchOrUseItem');
  complete(runtime);
};

export const OpponentHandleUnknownYesNoBox = (runtime: OpponentRuntime): void => complete(runtime);

export const OpponentHandleChooseMove = (runtime: OpponentRuntime): void => {
  const b = runtime.gActiveBattler;
  const moves = [u16(runtime.gBattleBufferA[b][4], runtime.gBattleBufferA[b][5]), u16(runtime.gBattleBufferA[b][6], runtime.gBattleBufferA[b][7]), u16(runtime.gBattleBufferA[b][8], runtime.gBattleBufferA[b][9]), u16(runtime.gBattleBufferA[b][10], runtime.gBattleBufferA[b][11])];
  if (runtime.gBattleTypeFlags & (BATTLE_TYPE_TRAINER | BATTLE_TYPE_FIRST_BATTLE | BATTLE_TYPE_SAFARI | BATTLE_TYPE_ROAMER)) {
    runtime.operations.push('BattleAI_SetupAIData', 'BattleAI_ChooseMoveOrAction');
    const chosenMoveId = runtime.aiChosenMoveOrAction & 0xff;
    if (chosenMoveId === AI_CHOICE_WATCH) emitTwoReturnValues(runtime, 1, B_ACTION_SAFARI_WATCH_CAREFULLY, 0);
    else if (chosenMoveId === AI_CHOICE_FLEE) emitTwoReturnValues(runtime, 1, B_ACTION_RUN, 0);
    else {
      const move = moves[chosenMoveId] ?? MOVE_NONE;
      const target = runtime.gBattleMoves[move]?.target ?? 0;
      if (target & (MOVE_TARGET_USER_OR_SELECTED | MOVE_TARGET_USER)) runtime.gBattlerTarget = b;
      if (target & MOVE_TARGET_BOTH) {
        runtime.gBattlerTarget = battlerAtPosition(B_POSITION_PLAYER_LEFT);
        if (runtime.gAbsentBattlerFlags & runtime.gBitTable[runtime.gBattlerTarget]) runtime.gBattlerTarget = battlerAtPosition(B_POSITION_PLAYER_RIGHT);
      }
      emitTwoReturnValues(runtime, 1, 10, chosenMoveId | (runtime.gBattlerTarget << 8));
    }
    complete(runtime);
    return;
  }

  let chosenMoveId: number;
  let move: number;
  do {
    chosenMoveId = nextRandom(runtime) & 3;
    move = moves[chosenMoveId] ?? MOVE_NONE;
  } while (move === MOVE_NONE);
  const target = runtime.gBattleMoves[move]?.target ?? 0;
  if (target & (MOVE_TARGET_USER_OR_SELECTED | MOVE_TARGET_USER)) emitTwoReturnValues(runtime, 1, 10, chosenMoveId | (b << 8));
  else if (runtime.gBattleTypeFlags & BATTLE_TYPE_DOUBLE_REAL) emitTwoReturnValues(runtime, 1, 10, chosenMoveId | (battlerAtPosition(nextRandom(runtime) & 2) << 8));
  else emitTwoReturnValues(runtime, 1, 10, chosenMoveId | (battlerAtPosition(B_POSITION_PLAYER_LEFT) << 8));
  complete(runtime);
};

export const OpponentHandleChooseItem = (runtime: OpponentRuntime): void => {
  emitOneReturnValue(runtime, 1, runtime.gBattleStruct.chosenItem[(Math.trunc(runtime.gActiveBattler / 2) * 2) & 3] ?? 0);
  complete(runtime);
};

export const OpponentHandleChoosePokemon = (runtime: OpponentRuntime): void => {
  const b = runtime.gActiveBattler;
  const sideIndex = battlerPosition(b) >> 1;
  let chosenMonId: number;
  if (runtime.gBattleStruct.AI_monToSwitchIntoId[sideIndex] === PARTY_SIZE) {
    chosenMonId = runtime.mostSuitableMonToSwitchInto;
    if (chosenMonId === PARTY_SIZE) {
      const battler1 = battlerAtPosition(B_POSITION_OPPONENT_LEFT);
      const battler2 = runtime.gBattleTypeFlags & BATTLE_TYPE_DOUBLE_REAL ? battlerAtPosition(B_POSITION_OPPONENT_RIGHT) : battler1;
      for (chosenMonId = 0; chosenMonId < PARTY_SIZE; chosenMonId++) {
        if (runtime.gEnemyParty[chosenMonId].hp !== 0 && chosenMonId !== runtime.gBattlerPartyIndexes[battler1] && chosenMonId !== runtime.gBattlerPartyIndexes[battler2]) break;
      }
    }
  } else {
    chosenMonId = runtime.gBattleStruct.AI_monToSwitchIntoId[sideIndex];
    runtime.gBattleStruct.AI_monToSwitchIntoId[sideIndex] = PARTY_SIZE;
  }
  runtime.gBattleStruct.monToSwitchIntoId[b] = chosenMonId;
  emitChosenMonReturnValue(runtime, 1, chosenMonId);
  complete(runtime);
};

export const OpponentHandleCmd23 = (runtime: OpponentRuntime): void => complete(runtime);
export const OpponentHandleHealthBarUpdate = (runtime: OpponentRuntime): void => callLink(runtime, LinkOpponent.LinkOpponentHandleHealthBarUpdate);
export const OpponentHandleExpUpdate = (runtime: OpponentRuntime): void => complete(runtime);
export const OpponentHandleStatusIconUpdate = (runtime: OpponentRuntime): void => callLink(runtime, LinkOpponent.LinkOpponentHandleStatusIconUpdate);
export const OpponentHandleStatusAnimation = (runtime: OpponentRuntime): void => callLink(runtime, LinkOpponent.LinkOpponentHandleStatusAnimation);
export const OpponentHandleStatusXor = (runtime: OpponentRuntime): void => complete(runtime);
export const OpponentHandleDataTransfer = (runtime: OpponentRuntime): void => complete(runtime);
export const OpponentHandleDMA3Transfer = (runtime: OpponentRuntime): void => complete(runtime);
export const OpponentHandlePlayBGM = (runtime: OpponentRuntime): void => complete(runtime);
export const OpponentHandleCmd32 = (runtime: OpponentRuntime): void => complete(runtime);
export const OpponentHandleTwoReturnValues = (runtime: OpponentRuntime): void => complete(runtime);
export const OpponentHandleChosenMonReturnValue = (runtime: OpponentRuntime): void => complete(runtime);
export const OpponentHandleOneReturnValue = (runtime: OpponentRuntime): void => complete(runtime);
export const OpponentHandleOneReturnValue_Duplicate = (runtime: OpponentRuntime): void => complete(runtime);
export const OpponentHandleClearUnkVar = (runtime: OpponentRuntime): void => callLink(runtime, LinkOpponent.LinkOpponentHandleClearUnkVar);
export const OpponentHandleSetUnkVar = (runtime: OpponentRuntime): void => callLink(runtime, LinkOpponent.LinkOpponentHandleSetUnkVar);
export const OpponentHandleClearUnkFlag = (runtime: OpponentRuntime): void => callLink(runtime, LinkOpponent.LinkOpponentHandleClearUnkFlag);
export const OpponentHandleToggleUnkFlag = (runtime: OpponentRuntime): void => callLink(runtime, LinkOpponent.LinkOpponentHandleToggleUnkFlag);
export const OpponentHandleCmd37 = OpponentHandleClearUnkVar;
export const OpponentHandleCmd38 = OpponentHandleSetUnkVar;
export const OpponentHandleCmd39 = OpponentHandleClearUnkFlag;
export const OpponentHandleCmd40 = OpponentHandleToggleUnkFlag;
export const OpponentHandleHitAnimation = (runtime: OpponentRuntime): void => callLink(runtime, LinkOpponent.LinkOpponentHandleHitAnimation);
export const OpponentHandleCmd42 = (runtime: OpponentRuntime): void => complete(runtime);
export const OpponentHandleCantSwitch = OpponentHandleCmd42;
export const OpponentHandlePlaySE = (runtime: OpponentRuntime): void => callLink(runtime, LinkOpponent.LinkOpponentHandlePlaySE);
export const OpponentHandlePlayFanfare = (runtime: OpponentRuntime): void => callLink(runtime, LinkOpponent.LinkOpponentHandlePlayFanfare);
export const OpponentHandleFaintingCry = (runtime: OpponentRuntime): void => callLink(runtime, LinkOpponent.LinkOpponentHandleFaintingCry);
export const OpponentHandleIntroSlide = (runtime: OpponentRuntime): void => callLink(runtime, LinkOpponent.LinkOpponentHandleIntroSlide);
export const OpponentHandleIntroTrainerBallThrow = (runtime: OpponentRuntime): void => callLink(runtime, LinkOpponent.LinkOpponentHandleIntroTrainerBallThrow);
export const Task_StartSendOutAnim = (runtime: OpponentRuntime, taskId: number): void => {
  LinkOpponent.Task_StartSendOutAnim(asLinkOpponentRuntime(runtime), taskId);
  renameLinkOpponentFunc(runtime);
};
export const SpriteCB_FreeOpponentSprite = (runtime: OpponentRuntime, spriteId: number): void => {
  LinkOpponent.SpriteCB_FreeOpponentSprite(asLinkOpponentRuntime(runtime), spriteId);
};
export const OpponentHandleDrawPartyStatusSummary = (runtime: OpponentRuntime): void => callLink(runtime, LinkOpponent.LinkOpponentHandleDrawPartyStatusSummary);
export const OpponentHandleHidePartyStatusSummary = (runtime: OpponentRuntime): void => callLink(runtime, LinkOpponent.LinkOpponentHandleHidePartyStatusSummary);
export const OpponentHandleEndBounceEffect = (runtime: OpponentRuntime): void => complete(runtime);
export const OpponentHandleSpriteInvisibility = (runtime: OpponentRuntime): void => callLink(runtime, LinkOpponent.LinkOpponentHandleSpriteInvisibility);
export const OpponentHandleBattleAnimation = (runtime: OpponentRuntime): void => callLink(runtime, LinkOpponent.LinkOpponentHandleBattleAnimation);
export const OpponentHandleLinkStandbyMsg = (runtime: OpponentRuntime): void => complete(runtime);
export const OpponentHandleResetActionMoveSelection = (runtime: OpponentRuntime): void => complete(runtime);

export const OpponentHandleCmd55 = (runtime: OpponentRuntime): void => {
  if ((runtime.gBattleTypeFlags & BATTLE_TYPE_LINK_REAL) && !(runtime.gBattleTypeFlags & BATTLE_TYPE_IS_MASTER)) {
    runtime.mainState.inBattle = 0;
    runtime.mainState.callback1 = runtime.mainState.preBattleCallback1;
    runtime.mainState.callback2 = runtime.mainState.savedCallback;
    runtime.operations.push('SetMainCallback2:gMain.savedCallback');
  }
  complete(runtime);
};

export const OpponentCmdEnd = (_runtime: OpponentRuntime): void => {};

export const sOpponentBufferCommands: Array<((runtime: OpponentRuntime) => void) | undefined> = [
  OpponentHandleGetMonData,
  OpponentHandleGetRawMonData,
  OpponentHandleSetMonData,
  OpponentHandleSetRawMonData,
  OpponentHandleLoadMonSprite,
  OpponentHandleSwitchInAnim,
  OpponentHandleReturnMonToBall,
  OpponentHandleDrawTrainerPic,
  OpponentHandleTrainerSlide,
  OpponentHandleTrainerSlideBack,
  OpponentHandleFaintAnimation,
  OpponentHandlePaletteFade,
  OpponentHandleSuccessBallThrowAnim,
  OpponentHandleBallThrowAnim,
  OpponentHandlePause,
  OpponentHandleMoveAnimation,
  OpponentHandlePrintString,
  OpponentHandlePrintSelectionString,
  OpponentHandleChooseAction,
  OpponentHandleUnknownYesNoBox,
  OpponentHandleChooseMove,
  OpponentHandleChooseItem,
  OpponentHandleChoosePokemon,
  OpponentHandleCmd23,
  OpponentHandleHealthBarUpdate,
  OpponentHandleExpUpdate,
  OpponentHandleStatusIconUpdate,
  OpponentHandleStatusAnimation,
  OpponentHandleStatusXor,
  OpponentHandleDataTransfer,
  OpponentHandleDMA3Transfer,
  OpponentHandlePlayBGM,
  OpponentHandleCmd32,
  OpponentHandleTwoReturnValues,
  OpponentHandleChosenMonReturnValue,
  OpponentHandleOneReturnValue,
  OpponentHandleOneReturnValue_Duplicate,
  OpponentHandleClearUnkVar,
  OpponentHandleSetUnkVar,
  OpponentHandleClearUnkFlag,
  OpponentHandleToggleUnkFlag,
  OpponentHandleHitAnimation,
  OpponentHandleCantSwitch,
  OpponentHandlePlaySE,
  OpponentHandlePlayFanfare,
  OpponentHandleFaintingCry,
  OpponentHandleIntroSlide,
  OpponentHandleIntroTrainerBallThrow,
  OpponentHandleDrawPartyStatusSummary,
  OpponentHandleHidePartyStatusSummary,
  OpponentHandleEndBounceEffect,
  OpponentHandleSpriteInvisibility,
  OpponentHandleBattleAnimation,
  OpponentHandleLinkStandbyMsg,
  OpponentHandleResetActionMoveSelection,
  OpponentHandleCmd55,
  OpponentCmdEnd
];

export const callOpponentControllerFunc = (runtime: OpponentRuntime, func: OpponentControllerFunc): void => {
  switch (func) {
    case 'OpponentBufferRunCommand':
      OpponentBufferRunCommand(runtime);
      break;
    case 'OpponentDoMoveAnimation':
      OpponentDoMoveAnimation(runtime);
      break;
    case 'CompleteOnBattlerSpriteCallbackDummy2':
      CompleteOnBattlerSpriteCallbackDummy2(runtime);
      break;
    case 'OpponentDummy':
      OpponentDummy(runtime);
      break;
    case 'PrintOakText_HowDisappointing':
    case 'PrintOakText_OakNoRunningFromATrainer':
    case 'PrintOakText_InflictingDamageIsKey':
      break;
    default:
      LinkOpponent.callLinkOpponentControllerFunc(asLinkOpponentRuntime(runtime), func as LinkOpponent.LinkOpponentControllerFunc);
      renameLinkOpponentFunc(runtime);
      break;
  }
};
