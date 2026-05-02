export const MAX_BATTLERS_COUNT = 4;
export const A_BUTTON = 0x0001;
export const DPAD_RIGHT = 0x0010;
export const DPAD_LEFT = 0x0020;
export const DPAD_UP = 0x0040;
export const DPAD_DOWN = 0x0080;

export const B_ACTION_USE_MOVE = 0;
export const B_ACTION_SAFARI_BALL = 5;
export const B_ACTION_SAFARI_BAIT = 6;
export const B_ACTION_SAFARI_GO_NEAR = 7;
export const B_ACTION_SAFARI_RUN = 8;

export const B_SIDE_PLAYER = 0;
export const BATTLE_TYPE_LINK = 1 << 1;
export const BATTLE_TYPE_IS_MASTER = 1 << 2;
export const SOUND_PAN_ATTACKER = -64;
export const SOUND_PAN_TARGET = 63;
export const BALL_3_SHAKES_SUCCESS = 0;
export const B_ANIM_BALL_THROW_WITH_TRAINER = 4;
export const B_POSITION_OPPONENT_LEFT = 1;
export const HEALTHBOX_SAFARI_ALL_TEXT = 0;
export const HEALTHBOX_SAFARI_BALLS_TEXT = 1;
export const PALETTES_ALL = 0xffffffff;
export const RGB_BLACK = 0;
export const DISPLAY_WIDTH = 240;

export const CONTROLLER_GETMONDATA = 0;
export const CONTROLLER_GETRAWMONDATA = 1;
export const CONTROLLER_SETMONDATA = 2;
export const CONTROLLER_SETRAWMONDATA = 3;
export const CONTROLLER_LOADMONSPRITE = 4;
export const CONTROLLER_SWITCHINANIM = 5;
export const CONTROLLER_RETURNMONTOBALL = 6;
export const CONTROLLER_DRAWTRAINERPIC = 7;
export const CONTROLLER_TRAINERSLIDE = 8;
export const CONTROLLER_TRAINERSLIDEBACK = 9;
export const CONTROLLER_FAINTANIMATION = 10;
export const CONTROLLER_PALETTEFADE = 11;
export const CONTROLLER_SUCCESSBALLTHROWANIM = 12;
export const CONTROLLER_BALLTHROWANIM = 13;
export const CONTROLLER_PAUSE = 14;
export const CONTROLLER_MOVEANIMATION = 15;
export const CONTROLLER_PRINTSTRING = 16;
export const CONTROLLER_PRINTSTRINGPLAYERONLY = 17;
export const CONTROLLER_CHOOSEACTION = 18;
export const CONTROLLER_UNKNOWNYESNOBOX = 19;
export const CONTROLLER_CHOOSEMOVE = 20;
export const CONTROLLER_OPENBAG = 21;
export const CONTROLLER_CHOOSEPOKEMON = 22;
export const CONTROLLER_23 = 23;
export const CONTROLLER_HEALTHBARUPDATE = 24;
export const CONTROLLER_EXPUPDATE = 25;
export const CONTROLLER_STATUSICONUPDATE = 26;
export const CONTROLLER_STATUSANIMATION = 27;
export const CONTROLLER_STATUSXOR = 28;
export const CONTROLLER_DATATRANSFER = 29;
export const CONTROLLER_DMA3TRANSFER = 30;
export const CONTROLLER_PLAYBGM = 31;
export const CONTROLLER_32 = 32;
export const CONTROLLER_TWORETURNVALUES = 33;
export const CONTROLLER_CHOSENMONRETURNVALUE = 34;
export const CONTROLLER_ONERETURNVALUE = 35;
export const CONTROLLER_ONERETURNVALUE_DUPLICATE = 36;
export const CONTROLLER_CLEARUNKVAR = 37;
export const CONTROLLER_SETUNKVAR = 38;
export const CONTROLLER_CLEARUNKFLAG = 39;
export const CONTROLLER_TOGGLEUNKFLAG = 40;
export const CONTROLLER_HITANIMATION = 41;
export const CONTROLLER_CANTSWITCH = 42;
export const CONTROLLER_PLAYSE = 43;
export const CONTROLLER_PLAYFANFARE = 44;
export const CONTROLLER_FAINTINGCRY = 45;
export const CONTROLLER_INTROSLIDE = 46;
export const CONTROLLER_INTROTRAINERBALLTHROW = 47;
export const CONTROLLER_DRAWPARTYSTATUSSUMMARY = 48;
export const CONTROLLER_HIDEPARTYSTATUSSUMMARY = 49;
export const CONTROLLER_ENDBOUNCE = 50;
export const CONTROLLER_SPRITEINVISIBILITY = 51;
export const CONTROLLER_BATTLEANIMATION = 52;
export const CONTROLLER_LINKSTANDBYMSG = 53;
export const CONTROLLER_RESETACTIONMOVESELECTION = 54;
export const CONTROLLER_ENDLINKBATTLE = 55;
export const CONTROLLER_TERMINATOR_NOP = 56;
export const CONTROLLER_CMDS_COUNT = 57;

export type SafariControllerFunc =
  | 'SafariBufferRunCommand'
  | 'CompleteOnBattlerSpriteCallbackDummy'
  | 'CompleteOnInactiveTextPrinter'
  | 'CompleteOnHealthboxSpriteCallbackDummy'
  | 'Safari_SetBattleEndCallbacks'
  | 'CompleteOnSpecialAnimDone'
  | 'SafariOpenPokeblockCase'
  | 'CompleteWhenChosePokeblock'
  | 'CompleteOnFinishedBattleAnimation'
  | 'CompleteOnFinishedStatusAnimation'
  | 'HandleChooseActionAfterDma3'
  | 'HandleInputChooseAction';

export type SafariSprite = {
  callback: 'SpriteCallbackDummy' | 'SpriteCB_TrainerSlideIn' | string;
  oam: { paletteNum: number };
  x2: number;
  data: number[];
  invisible: boolean;
};

export type SafariRuntime = {
  gActiveBattler: number;
  gBattlerControllerFuncs: SafariControllerFunc[];
  gBattleControllerExecFlags: number;
  gBitTable: number[];
  gBattleBufferA: number[][];
  gActionSelectionCursor: number[];
  gBattleTypeFlags: number;
  multiplayerId: number;
  gBattle_BG0_X: number;
  gBattle_BG0_Y: number;
  gDisplayedStringBattle: string;
  coloredStringIds: Set<number>;
  battlerSides: number[];
  battlerPositions: number[];
  gBattlerSpriteIds: number[];
  gHealthboxSpriteIds: number[];
  gSprites: SafariSprite[];
  trainerBackPicCoords: { size: number }[];
  playerGender: number;
  paletteFadeActive: boolean;
  gDoingBattleAnim: boolean;
  specialAnimActive: boolean[];
  animFromTableActive: boolean[];
  statusAnimActive: boolean[];
  ballThrowCaseId: number;
  dma3Busy: boolean;
  textPrinterActive: boolean;
  tryHandleBattleTableAnimationResult: boolean;
  gBattlerInMenuId: number;
  gSpecialVar_ItemId: number;
  callback2: string;
  gMainInBattle: boolean;
  gMainCallback1: string;
  gPreBattleCallback1: string;
  gMainSavedCallback: string;
  gBattleOutcome: number;
  gIntroSlideFlags: number;
  battlerPartyIndexes: number[];
  playerParty: { species: number; hp: number; isEgg?: boolean }[];
  emissions: { type: 'two' | 'one'; bufferId: number; value1: number; value2?: number }[];
  linkTransfers: { bufferId: number; size: number; data: number[] }[];
  operations: string[];
};

export const createSafariRuntime = (): SafariRuntime => ({
  gActiveBattler: 0,
  gBattlerControllerFuncs: Array(MAX_BATTLERS_COUNT).fill('SafariBufferRunCommand'),
  gBattleControllerExecFlags: 0,
  gBitTable: [1, 2, 4, 8],
  gBattleBufferA: Array.from({ length: MAX_BATTLERS_COUNT }, () => Array(8).fill(0)),
  gActionSelectionCursor: Array(MAX_BATTLERS_COUNT).fill(0),
  gBattleTypeFlags: 0,
  multiplayerId: 0,
  gBattle_BG0_X: 0,
  gBattle_BG0_Y: 0,
  gDisplayedStringBattle: '',
  coloredStringIds: new Set(),
  battlerSides: [B_SIDE_PLAYER, 1, B_SIDE_PLAYER, 1],
  battlerPositions: [0, 1, 2, 3],
  gBattlerSpriteIds: Array(MAX_BATTLERS_COUNT).fill(0),
  gHealthboxSpriteIds: [0, 1, 2, 3],
  gSprites: Array.from({ length: 16 }, () => ({ callback: 'SpriteCallbackDummy', oam: { paletteNum: 0 }, x2: 0, data: Array(8).fill(0), invisible: false })),
  trainerBackPicCoords: [{ size: 8 }, { size: 8 }],
  playerGender: 0,
  paletteFadeActive: false,
  gDoingBattleAnim: false,
  specialAnimActive: Array(MAX_BATTLERS_COUNT).fill(false),
  animFromTableActive: Array(MAX_BATTLERS_COUNT).fill(false),
  statusAnimActive: Array(MAX_BATTLERS_COUNT).fill(false),
  ballThrowCaseId: 0,
  dma3Busy: false,
  textPrinterActive: false,
  tryHandleBattleTableAnimationResult: true,
  gBattlerInMenuId: 0,
  gSpecialVar_ItemId: 0,
  callback2: 'BattleMainCB2',
  gMainInBattle: true,
  gMainCallback1: '',
  gPreBattleCallback1: 'PreBattleCallback1',
  gMainSavedCallback: 'SavedCallback',
  gBattleOutcome: 0,
  gIntroSlideFlags: 0,
  battlerPartyIndexes: Array(MAX_BATTLERS_COUNT).fill(0),
  playerParty: Array.from({ length: 6 }, () => ({ species: 0, hp: 0 })),
  emissions: [],
  linkTransfers: [],
  operations: [],
});

const getActive = (runtime: SafariRuntime): number => runtime.gActiveBattler;
const readU16 = (bytes: number[], offset: number): number => (bytes[offset] ?? 0) | ((bytes[offset + 1] ?? 0) << 8);

export const GetBattlerSide = (runtime: SafariRuntime, battler: number): number => runtime.battlerSides[battler] ?? 0;
export const GetBattlerPosition = (runtime: SafariRuntime, battler: number): number => runtime.battlerPositions[battler] ?? battler;
export const GetBattlerAtPosition = (runtime: SafariRuntime, position: number): number => runtime.battlerPositions.indexOf(position) >= 0 ? runtime.battlerPositions.indexOf(position) : position;
export const GetMultiplayerId = (runtime: SafariRuntime): number => runtime.multiplayerId;

export const BtlController_EmitTwoReturnValues = (runtime: SafariRuntime, bufferId: number, value1: number, value2: number): void => {
  runtime.emissions.push({ type: 'two', bufferId, value1, value2 });
};

export const BtlController_EmitOneReturnValue = (runtime: SafariRuntime, bufferId: number, value1: number): void => {
  runtime.emissions.push({ type: 'one', bufferId, value1 });
};

export const PrepareBufferDataTransferLink = (runtime: SafariRuntime, bufferId: number, size: number, data: readonly number[]): void => {
  runtime.linkTransfers.push({ bufferId, size, data: Array.from(data).slice(0, size) });
};

export const SafariBufferExecCompleted = (runtime: SafariRuntime): void => {
  const battler = getActive(runtime);
  runtime.gBattlerControllerFuncs[battler] = 'SafariBufferRunCommand';
  if (runtime.gBattleTypeFlags & BATTLE_TYPE_LINK) {
    const playerId = GetMultiplayerId(runtime);
    PrepareBufferDataTransferLink(runtime, 2, 4, [playerId]);
    runtime.gBattleBufferA[battler][0] = CONTROLLER_TERMINATOR_NOP;
  } else {
    runtime.gBattleControllerExecFlags &= ~runtime.gBitTable[battler];
  }
};

export const SetControllerToSafari = (runtime: SafariRuntime): void => {
  runtime.gBattlerControllerFuncs[getActive(runtime)] = 'SafariBufferRunCommand';
};

export const HandleInputChooseAction = (runtime: SafariRuntime, newKeys: number): void => {
  const battler = getActive(runtime);
  const cursor = runtime.gActionSelectionCursor[battler];
  if (newKeys & A_BUTTON) {
    runtime.operations.push('PlaySE:SE_SELECT');
    switch (cursor) {
      case 0: BtlController_EmitTwoReturnValues(runtime, 1, B_ACTION_SAFARI_BALL, 0); break;
      case 1: BtlController_EmitTwoReturnValues(runtime, 1, B_ACTION_SAFARI_BAIT, 0); break;
      case 2: BtlController_EmitTwoReturnValues(runtime, 1, B_ACTION_SAFARI_GO_NEAR, 0); break;
      case 3: BtlController_EmitTwoReturnValues(runtime, 1, B_ACTION_SAFARI_RUN, 0); break;
    }
    SafariBufferExecCompleted(runtime);
  } else if (newKeys & DPAD_LEFT) {
    if (cursor & 1) moveActionCursor(runtime, cursor ^ 1);
  } else if (newKeys & DPAD_RIGHT) {
    if (!(cursor & 1)) moveActionCursor(runtime, cursor ^ 1);
  } else if (newKeys & DPAD_UP) {
    if (cursor & 2) moveActionCursor(runtime, cursor ^ 2);
  } else if (newKeys & DPAD_DOWN) {
    if (!(cursor & 2)) moveActionCursor(runtime, cursor ^ 2);
  }
};

const moveActionCursor = (runtime: SafariRuntime, nextCursor: number): void => {
  const battler = getActive(runtime);
  runtime.operations.push('PlaySE:SE_SELECT');
  runtime.operations.push(`ActionSelectionDestroyCursorAt:${runtime.gActionSelectionCursor[battler]}`);
  runtime.gActionSelectionCursor[battler] = nextCursor;
  runtime.operations.push(`ActionSelectionCreateCursorAt:${nextCursor}:0`);
};

export const CompleteOnBattlerSpriteCallbackDummy = (runtime: SafariRuntime): void => {
  if (runtime.gSprites[runtime.gBattlerSpriteIds[getActive(runtime)]].callback === 'SpriteCallbackDummy') SafariBufferExecCompleted(runtime);
};
export const CompleteOnInactiveTextPrinter = (runtime: SafariRuntime): void => { if (!runtime.textPrinterActive) SafariBufferExecCompleted(runtime); };
export const CompleteOnHealthboxSpriteCallbackDummy = (runtime: SafariRuntime): void => {
  if (runtime.gSprites[runtime.gHealthboxSpriteIds[getActive(runtime)]].callback === 'SpriteCallbackDummy') SafariBufferExecCompleted(runtime);
};
export const CompleteOnSpecialAnimDone = (runtime: SafariRuntime): void => {
  if (!runtime.gDoingBattleAnim || !runtime.specialAnimActive[getActive(runtime)]) SafariBufferExecCompleted(runtime);
};
export const CompleteOnFinishedStatusAnimation = (runtime: SafariRuntime): void => {
  if (!runtime.statusAnimActive[getActive(runtime)]) SafariBufferExecCompleted(runtime);
};
export const CompleteOnFinishedBattleAnimation = (runtime: SafariRuntime): void => {
  if (!runtime.animFromTableActive[getActive(runtime)]) SafariBufferExecCompleted(runtime);
};

export const Safari_SetBattleEndCallbacks = (runtime: SafariRuntime): void => {
  if (!runtime.paletteFadeActive) {
    runtime.gMainInBattle = false;
    runtime.gMainCallback1 = runtime.gPreBattleCallback1;
    runtime.operations.push(`SetMainCallback2:${runtime.gMainSavedCallback}`);
  }
};

export const SafariOpenPokeblockCase = (runtime: SafariRuntime): void => {
  if (!runtime.paletteFadeActive) runtime.gBattlerControllerFuncs[getActive(runtime)] = 'CompleteWhenChosePokeblock';
};

export const CompleteWhenChosePokeblock = (runtime: SafariRuntime): void => {
  if (runtime.callback2 === 'BattleMainCB2' && !runtime.paletteFadeActive) {
    BtlController_EmitOneReturnValue(runtime, 1, runtime.gSpecialVar_ItemId);
    SafariBufferExecCompleted(runtime);
  }
};

const complete = (runtime: SafariRuntime): void => SafariBufferExecCompleted(runtime);

export const SafariDummy = (_runtime: SafariRuntime): void => undefined;
export const SafariHandleGetMonData = complete;
export const SafariHandleGetRawMonData = complete;
export const SafariHandleSetMonData = complete;
export const SafariHandleSetRawMonData = complete;
export const SafariHandleLoadMonSprite = complete;
export const SafariHandleSwitchInAnim = complete;
export const SafariHandleReturnMonToBall = complete;
export const SafariHandleTrainerSlide = complete;
export const SafariHandleTrainerSlideBack = complete;
export const SafariHandleFaintAnimation = complete;
export const SafariHandlePaletteFade = complete;
export const SafariHandlePause = complete;
export const SafariHandleMoveAnimation = complete;
export const SafariHandleUnknownYesNoBox = complete;
export const SafariHandleChooseMove = complete;
export const SafariHandleChoosePokemon = complete;
export const SafariHandleCmd23 = complete;
export const SafariHandleHealthBarUpdate = complete;
export const SafariHandleExpUpdate = complete;
export const SafariHandleStatusAnimation = complete;
export const SafariHandleStatusXor = complete;
export const SafariHandleDataTransfer = complete;
export const SafariHandleDMA3Transfer = complete;
export const SafariHandlePlayBGM = complete;
export const SafariHandleCmd32 = complete;
export const SafariHandleTwoReturnValues = complete;
export const SafariHandleChosenMonReturnValue = complete;
export const SafariHandleOneReturnValue = complete;
export const SafariHandleOneReturnValue_Duplicate = complete;
export const SafariHandleCmd37 = complete;
export const SafariHandleCmd38 = complete;
export const SafariHandleCmd39 = complete;
export const SafariHandleCmd40 = complete;
export const SafariHandleHitAnimation = complete;
export const SafariHandleCmd42 = complete;
export const SafariHandleDrawPartyStatusSummary = complete;
export const SafariHandleHidePartyStatusSummary = complete;
export const SafariHandleEndBounceEffect = complete;
export const SafariHandleSpriteInvisibility = complete;
export const SafariHandleLinkStandbyMsg = complete;
export const SafariHandleResetActionMoveSelection = complete;

export const SafariHandleDrawTrainerPic = (runtime: SafariRuntime): void => {
  const battler = getActive(runtime);
  runtime.operations.push(`DecompressTrainerBackPalette:${runtime.playerGender}:${battler}`);
  runtime.operations.push(`SetMultiuseSpriteTemplateToTrainerBack:${runtime.playerGender}:${GetBattlerPosition(runtime, battler)}`);
  const spriteId = runtime.gSprites.findIndex((sprite, index) => index >= 4 && sprite.callback === 'SpriteCallbackDummy' && sprite.data.every((v) => v === 0));
  runtime.gBattlerSpriteIds[battler] = spriteId < 0 ? 4 : spriteId;
  const sprite = runtime.gSprites[runtime.gBattlerSpriteIds[battler]];
  sprite.oam.paletteNum = battler;
  sprite.x2 = DISPLAY_WIDTH;
  sprite.data[0] = -2;
  sprite.callback = 'SpriteCB_TrainerSlideIn';
  runtime.operations.push(`CreateSprite:gMultiuseSpriteTemplate:80:${(8 - runtime.trainerBackPicCoords[runtime.playerGender].size) * 4 + 80}:30`);
  runtime.gBattlerControllerFuncs[battler] = 'CompleteOnBattlerSpriteCallbackDummy';
};

const launchBallThrow = (runtime: SafariRuntime, ballThrowCaseId: number): void => {
  const battler = getActive(runtime);
  runtime.ballThrowCaseId = ballThrowCaseId;
  runtime.gDoingBattleAnim = true;
  runtime.operations.push(`InitAndLaunchSpecialAnimation:${battler}:${battler}:${GetBattlerAtPosition(runtime, B_POSITION_OPPONENT_LEFT)}:${B_ANIM_BALL_THROW_WITH_TRAINER}`);
  runtime.gBattlerControllerFuncs[battler] = 'CompleteOnSpecialAnimDone';
};

export const SafariHandleSuccessBallThrowAnim = (runtime: SafariRuntime): void => launchBallThrow(runtime, BALL_3_SHAKES_SUCCESS);
export const SafariHandleBallThrowAnim = (runtime: SafariRuntime): void => launchBallThrow(runtime, runtime.gBattleBufferA[getActive(runtime)][1]);

export const SafariHandlePrintString = (runtime: SafariRuntime): void => {
  const battler = getActive(runtime);
  runtime.gBattle_BG0_X = 0;
  runtime.gBattle_BG0_Y = 0;
  const stringId = readU16(runtime.gBattleBufferA[battler], 2);
  runtime.gDisplayedStringBattle = `String:${stringId}`;
  runtime.operations.push(`BufferStringBattle:${stringId}`);
  runtime.operations.push(`BattlePutTextOnWindow:${runtime.gDisplayedStringBattle}:${runtime.coloredStringIds.has(stringId) ? 'B_WIN_MSG|NPC' : 'B_WIN_MSG'}`);
  runtime.gBattlerControllerFuncs[battler] = 'CompleteOnInactiveTextPrinter';
};

export const SafariHandlePrintSelectionString = (runtime: SafariRuntime): void => {
  if (GetBattlerSide(runtime, getActive(runtime)) === B_SIDE_PLAYER) SafariHandlePrintString(runtime);
  else complete(runtime);
};

export const HandleChooseActionAfterDma3 = (runtime: SafariRuntime): void => {
  if (!runtime.dma3Busy) {
    runtime.gBattle_BG0_X = 0;
    runtime.gBattle_BG0_Y = 160;
    runtime.gBattlerControllerFuncs[getActive(runtime)] = 'HandleInputChooseAction';
  }
};

export const SafariHandleChooseAction = (runtime: SafariRuntime): void => {
  const battler = getActive(runtime);
  runtime.gBattlerControllerFuncs[battler] = 'HandleChooseActionAfterDma3';
  runtime.operations.push('BattlePutTextOnWindow:gText_EmptyString3:B_WIN_MSG');
  runtime.operations.push('BattlePutTextOnWindow:gText_SafariZoneMenu:B_WIN_ACTION_MENU');
  for (let i = 0; i < 4; i += 1) runtime.operations.push(`ActionSelectionDestroyCursorAt:${i}`);
  runtime.operations.push(`ActionSelectionCreateCursorAt:${runtime.gActionSelectionCursor[battler]}:0`);
  runtime.gDisplayedStringBattle = 'gText_WhatWillPlayerThrow';
  runtime.operations.push('BattleStringExpandPlaceholdersToDisplayedString:gText_WhatWillPlayerThrow');
  runtime.operations.push('BattlePutTextOnWindow:gText_WhatWillPlayerThrow:B_WIN_ACTION_PROMPT');
};

export const SafariHandleChooseItem = (runtime: SafariRuntime): void => {
  runtime.operations.push(`BeginNormalPaletteFade:${PALETTES_ALL}:0:0:16:${RGB_BLACK}`);
  runtime.gBattlerControllerFuncs[getActive(runtime)] = 'SafariOpenPokeblockCase';
  runtime.gBattlerInMenuId = getActive(runtime);
};

export const SafariHandleStatusIconUpdate = (runtime: SafariRuntime): void => {
  const battler = getActive(runtime);
  runtime.operations.push(`UpdateHealthboxAttribute:${runtime.gHealthboxSpriteIds[battler]}:${runtime.battlerPartyIndexes[battler]}:${HEALTHBOX_SAFARI_BALLS_TEXT}`);
  complete(runtime);
};

export const SafariHandlePlaySE = (runtime: SafariRuntime): void => {
  const battler = getActive(runtime);
  const pan = GetBattlerSide(runtime, battler) === B_SIDE_PLAYER ? SOUND_PAN_ATTACKER : SOUND_PAN_TARGET;
  runtime.operations.push(`PlaySE12WithPanning:${readU16(runtime.gBattleBufferA[battler], 1)}:${pan}`);
  complete(runtime);
};

export const SafariHandlePlayFanfareOrBGM = (runtime: SafariRuntime): void => {
  runtime.operations.push(`PlayFanfare:${readU16(runtime.gBattleBufferA[getActive(runtime)], 1)}`);
  complete(runtime);
};

export const SafariHandleFaintingCry = (runtime: SafariRuntime): void => {
  const battler = getActive(runtime);
  const species = runtime.playerParty[runtime.battlerPartyIndexes[battler]]?.species ?? 0;
  runtime.operations.push(`PlayCry_Normal:${species}:25`);
  complete(runtime);
};

export const SafariHandleIntroSlide = (runtime: SafariRuntime): void => {
  runtime.operations.push(`HandleIntroSlide:${runtime.gBattleBufferA[getActive(runtime)][1]}`);
  runtime.gIntroSlideFlags |= 1;
  complete(runtime);
};

export const SafariHandleIntroTrainerBallThrow = (runtime: SafariRuntime): void => {
  const battler = getActive(runtime);
  runtime.operations.push(`UpdateHealthboxAttribute:${runtime.gHealthboxSpriteIds[battler]}:${runtime.battlerPartyIndexes[battler]}:${HEALTHBOX_SAFARI_ALL_TEXT}`);
  runtime.operations.push(`StartHealthboxSlideIn:${battler}`);
  runtime.operations.push(`SetHealthboxSpriteVisible:${runtime.gHealthboxSpriteIds[battler]}`);
  runtime.gBattlerControllerFuncs[battler] = 'CompleteOnHealthboxSpriteCallbackDummy';
};

export const SafariHandleBattleAnimation = (runtime: SafariRuntime): void => {
  const battler = getActive(runtime);
  const animationId = runtime.gBattleBufferA[battler][1];
  const argument = readU16(runtime.gBattleBufferA[battler], 2);
  runtime.operations.push(`TryHandleLaunchBattleTableAnimation:${battler}:${battler}:${battler}:${animationId}:${argument}`);
  if (runtime.tryHandleBattleTableAnimationResult) complete(runtime);
  else runtime.gBattlerControllerFuncs[battler] = 'CompleteOnFinishedBattleAnimation';
};

export const SafariHandleCmd55 = (runtime: SafariRuntime): void => {
  const battler = getActive(runtime);
  runtime.gBattleOutcome = runtime.gBattleBufferA[battler][1];
  runtime.operations.push('FadeOutMapMusic:5');
  runtime.operations.push('BeginFastPaletteFade:3');
  complete(runtime);
  if ((runtime.gBattleTypeFlags & BATTLE_TYPE_LINK) && !(runtime.gBattleTypeFlags & BATTLE_TYPE_IS_MASTER)) runtime.gBattlerControllerFuncs[battler] = 'Safari_SetBattleEndCallbacks';
};

export const sSafariBufferCommands: Array<(runtime: SafariRuntime) => void> = [
  complete, complete, complete, complete, complete, complete, complete, SafariHandleDrawTrainerPic,
  complete, complete, complete, complete, SafariHandleSuccessBallThrowAnim, SafariHandleBallThrowAnim, complete, complete,
  SafariHandlePrintString, SafariHandlePrintSelectionString, SafariHandleChooseAction, complete, complete, SafariHandleChooseItem,
  complete, complete, complete, complete, SafariHandleStatusIconUpdate, complete, complete, complete, complete, complete,
  complete, complete, complete, complete, complete, complete, complete, complete, complete, complete, complete,
  SafariHandlePlaySE, SafariHandlePlayFanfareOrBGM, SafariHandleFaintingCry, SafariHandleIntroSlide, SafariHandleIntroTrainerBallThrow,
  complete, complete, complete, complete, SafariHandleBattleAnimation, complete, complete, SafariHandleCmd55, () => undefined,
];

export const SafariBufferRunCommand = (runtime: SafariRuntime): void => {
  const battler = getActive(runtime);
  if (runtime.gBattleControllerExecFlags & runtime.gBitTable[battler]) {
    const command = runtime.gBattleBufferA[battler][0];
    if (command < sSafariBufferCommands.length) sSafariBufferCommands[command](runtime);
    else SafariBufferExecCompleted(runtime);
  }
};

export const SafariCmdEnd = (_runtime: SafariRuntime): void => undefined;

export const runSafariControllerFunc = (runtime: SafariRuntime, newKeys = 0): void => {
  switch (runtime.gBattlerControllerFuncs[getActive(runtime)]) {
    case 'SafariBufferRunCommand': SafariBufferRunCommand(runtime); break;
    case 'CompleteOnBattlerSpriteCallbackDummy': CompleteOnBattlerSpriteCallbackDummy(runtime); break;
    case 'CompleteOnInactiveTextPrinter': CompleteOnInactiveTextPrinter(runtime); break;
    case 'CompleteOnHealthboxSpriteCallbackDummy': CompleteOnHealthboxSpriteCallbackDummy(runtime); break;
    case 'Safari_SetBattleEndCallbacks': Safari_SetBattleEndCallbacks(runtime); break;
    case 'CompleteOnSpecialAnimDone': CompleteOnSpecialAnimDone(runtime); break;
    case 'SafariOpenPokeblockCase': SafariOpenPokeblockCase(runtime); break;
    case 'CompleteWhenChosePokeblock': CompleteWhenChosePokeblock(runtime); break;
    case 'CompleteOnFinishedBattleAnimation': CompleteOnFinishedBattleAnimation(runtime); break;
    case 'CompleteOnFinishedStatusAnimation': CompleteOnFinishedStatusAnimation(runtime); break;
    case 'HandleChooseActionAfterDma3': HandleChooseActionAfterDma3(runtime); break;
    case 'HandleInputChooseAction': HandleInputChooseAction(runtime, newKeys); break;
  }
};
