export interface PlayerControllerSprite {
  x2: number;
  y2: number;
  invisible: boolean;
  callback: string;
  data: number[];
  destroyed: boolean;
}

export interface PlayerControllerTask {
  func: keyof typeof playerControllerTaskHandlers | null;
  data: number[];
  destroyed: boolean;
}

export interface PlayerBattleMon {
  species: number;
  hp: number;
  maxHp: number;
  level: number;
  exp: number;
  moves: number[];
  pp: number[];
  nickname: string;
  raw: number[];
  item?: number;
  status?: number;
  shiny?: boolean;
  substitute?: boolean;
}

export interface BattleControllerPlayerRuntime {
  activeBattler: number;
  battleTypeFlags: number;
  controllerExecFlags: number;
  bitTable: number[];
  battlerControllerFuncs: string[];
  battleBufferA: number[][];
  battleBufferB: number[][];
  party: PlayerBattleMon[];
  battleMons: PlayerBattleMon[];
  sprites: PlayerControllerSprite[];
  battlerSpriteIds: number[];
  tasks: PlayerControllerTask[];
  operations: string[];
  doingBattleAnim: boolean;
  moveSelectionCursor: number[];
  actionSelectionCursor: number[];
  chosenMove: number;
  chosenMovePos: number;
  currentMove: number;
  currentMovePos: number;
  selectedAction: number;
  selectedTarget: number;
  selectedMonId: number;
  selectedItem: number;
  healthbarDone: boolean;
  textPrinterActive: boolean;
  statusAnimActive: boolean;
  battleAnimActive: boolean;
  specialAnimActive: boolean;
  monSelectionDone: boolean;
  itemSelectionDone: boolean;
  linkBattleEnd: boolean;
  battleEnd: boolean;
  multiplayerId: number;
  input: { a: boolean; b: boolean; up: boolean; down: boolean; left: boolean; right: boolean; l: boolean; r: boolean };
}

export const BATTLE_TYPE_LINK = 1 << 0;
export const BATTLE_TYPE_DOUBLE = 1 << 1;
export const BATTLE_TYPE_SAFARI = 1 << 2;
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
export const B_ACTION_USE_MOVE = 0;
export const B_ACTION_USE_ITEM = 1;
export const B_ACTION_SWITCH = 2;
export const B_ACTION_RUN = 3;

let activeRuntime: BattleControllerPlayerRuntime | null = null;
const requireRuntime = (runtime?: BattleControllerPlayerRuntime): BattleControllerPlayerRuntime => {
  const resolved = runtime ?? activeRuntime;
  if (resolved === null) throw new Error('battle controller player runtime is not active');
  return resolved;
};
const op = (runtime: BattleControllerPlayerRuntime, name: string): void => { runtime.operations.push(name); };
const makeMon = (species = 0): PlayerBattleMon => ({ species, hp: 1, maxHp: 1, level: 5, exp: 0, moves: [0, 0, 0, 0], pp: [0, 0, 0, 0], nickname: species ? `MON_${species}` : '', raw: [] });
const makeSprite = (): PlayerControllerSprite => ({ x2: 0, y2: 0, invisible: false, callback: 'SpriteCallbackDummy', data: Array.from({ length: 8 }, () => 0), destroyed: false });
const makeTask = (func: keyof typeof playerControllerTaskHandlers | null): PlayerControllerTask => ({ func, data: Array.from({ length: 16 }, () => 0), destroyed: false });
const sprite = (runtime: BattleControllerPlayerRuntime, id = runtime.battlerSpriteIds[runtime.activeBattler]): PlayerControllerSprite => runtime.sprites[id] ?? (runtime.sprites[id] = makeSprite());
const task = (runtime: BattleControllerPlayerRuntime, id: number): PlayerControllerTask => runtime.tasks[id] ?? (runtime.tasks[id] = makeTask(null));
const createTask = (runtime: BattleControllerPlayerRuntime, func: keyof typeof playerControllerTaskHandlers): number => { const id = runtime.tasks.length; runtime.tasks.push(makeTask(func)); op(runtime, `CreateTask:${func}:${id}`); return id; };
const destroyTask = (runtime: BattleControllerPlayerRuntime, id: number): void => { task(runtime, id).destroyed = true; task(runtime, id).func = null; op(runtime, `DestroyTask:${id}`); };
const complete = (runtime: BattleControllerPlayerRuntime): void => PlayerBufferExecCompleted(runtime);
const command = (runtime: BattleControllerPlayerRuntime): number => runtime.battleBufferA[runtime.activeBattler]?.[0] ?? CONTROLLER_TERMINATOR_NOP;
const arg = (runtime: BattleControllerPlayerRuntime, index: number): number => runtime.battleBufferA[runtime.activeBattler]?.[index] ?? 0;
const setReturn = (runtime: BattleControllerPlayerRuntime, ...values: number[]): void => { runtime.battleBufferB[runtime.activeBattler].splice(0, values.length, ...values); op(runtime, `EmitReturn:${values.join(',')}`); };
const stepTimerTask = (runtime: BattleControllerPlayerRuntime, taskId: number, frames: number, done: () => void): void => { const t = task(runtime, taskId); t.data[0] += 1; if (t.data[0] >= frames) { done(); destroyTask(runtime, taskId); } };

export function createBattleControllerPlayerRuntime(): BattleControllerPlayerRuntime {
  const runtime: BattleControllerPlayerRuntime = {
    activeBattler: 0,
    battleTypeFlags: 0,
    controllerExecFlags: 1,
    bitTable: [1, 2, 4, 8],
    battlerControllerFuncs: ['', '', '', ''],
    battleBufferA: Array.from({ length: 4 }, () => Array.from({ length: 64 }, () => 0)),
    battleBufferB: Array.from({ length: 4 }, () => Array.from({ length: 64 }, () => 0)),
    party: Array.from({ length: 6 }, (_, i) => makeMon(i + 1)),
    battleMons: Array.from({ length: 4 }, (_, i) => makeMon(i + 1)),
    sprites: Array.from({ length: 8 }, () => makeSprite()),
    battlerSpriteIds: [0, 1, 2, 3],
    tasks: [],
    operations: [],
    doingBattleAnim: false,
    moveSelectionCursor: [0, 0, 0, 0],
    actionSelectionCursor: [0, 0, 0, 0],
    chosenMove: 0,
    chosenMovePos: 0,
    currentMove: 0,
    currentMovePos: 0,
    selectedAction: 0,
    selectedTarget: 0,
    selectedMonId: 0,
    selectedItem: 0,
    healthbarDone: true,
    textPrinterActive: false,
    statusAnimActive: false,
    battleAnimActive: false,
    specialAnimActive: false,
    monSelectionDone: false,
    itemSelectionDone: false,
    linkBattleEnd: false,
    battleEnd: false,
    multiplayerId: 0,
    input: { a: false, b: false, up: false, down: false, left: false, right: false, l: false, r: false }
  };
  activeRuntime = runtime;
  return runtime;
}

export function BattleControllerDummy(_runtime = requireRuntime()): void {}
export function SetControllerToPlayer(runtime = requireRuntime()): void { runtime.battlerControllerFuncs[runtime.activeBattler] = 'PlayerBufferRunCommand'; runtime.doingBattleAnim = false; }
export function PlayerBufferExecCompleted(runtime = requireRuntime()): void { runtime.battlerControllerFuncs[runtime.activeBattler] = 'PlayerBufferRunCommand'; if (runtime.battleTypeFlags & BATTLE_TYPE_LINK) { const playerId = runtime.multiplayerId; op(runtime, `PrepareBufferDataTransferLink:2:4:${playerId}`); runtime.battleBufferA[runtime.activeBattler][0] = CONTROLLER_TERMINATOR_NOP; } else runtime.controllerExecFlags &= ~runtime.bitTable[runtime.activeBattler]; }
const commandHandlers: Array<(runtime: BattleControllerPlayerRuntime) => void> = [];
export function PlayerBufferRunCommand(runtime = requireRuntime()): void { if (runtime.controllerExecFlags & runtime.bitTable[runtime.activeBattler]) (commandHandlers[command(runtime)] ?? PlayerBufferExecCompleted)(runtime); }
export function CompleteOnBattlerSpritePosX_0(runtime = requireRuntime()): void { if (sprite(runtime).x2 === 0) complete(runtime); }
export function HandleInputChooseAction(runtime = requireRuntime()): void { if (runtime.input.up || runtime.input.left) runtime.actionSelectionCursor[runtime.activeBattler] = (runtime.actionSelectionCursor[runtime.activeBattler] + 3) % 4; if (runtime.input.down || runtime.input.right) runtime.actionSelectionCursor[runtime.activeBattler] = (runtime.actionSelectionCursor[runtime.activeBattler] + 1) % 4; if (runtime.input.a) { runtime.selectedAction = runtime.actionSelectionCursor[runtime.activeBattler]; setReturn(runtime, runtime.selectedAction); complete(runtime); } }
export function EndBounceEffect2(runtime = requireRuntime()): void { op(runtime, `EndBounceEffect:${runtime.activeBattler}`); complete(runtime); }
export function HandleInputChooseTarget(runtime = requireRuntime()): void { if (runtime.input.left || runtime.input.up) runtime.selectedTarget = (runtime.selectedTarget + 3) % 4; if (runtime.input.right || runtime.input.down) runtime.selectedTarget = (runtime.selectedTarget + 1) % 4; if (runtime.input.a) { setReturn(runtime, runtime.selectedTarget); complete(runtime); } }
export function HandleInputChooseMove(runtime = requireRuntime()): void { if (runtime.input.left || runtime.input.up) runtime.moveSelectionCursor[runtime.activeBattler] = (runtime.moveSelectionCursor[runtime.activeBattler] + 3) % 4; if (runtime.input.right || runtime.input.down) runtime.moveSelectionCursor[runtime.activeBattler] = (runtime.moveSelectionCursor[runtime.activeBattler] + 1) % 4; if (runtime.input.a) { runtime.chosenMovePos = runtime.moveSelectionCursor[runtime.activeBattler]; runtime.chosenMove = runtime.battleMons[runtime.activeBattler].moves[runtime.chosenMovePos] ?? 0; setReturn(runtime, runtime.chosenMovePos, runtime.chosenMove); complete(runtime); } }
export function HandleMoveInputUnused(runtime = requireRuntime()): void { HandleInputChooseMove(runtime); }
export function HandleMoveSwitching(runtime = requireRuntime()): void { const a = runtime.moveSelectionCursor[runtime.activeBattler]; const b = (a + 1) % 4; const mon = runtime.battleMons[runtime.activeBattler]; [mon.moves[a], mon.moves[b]] = [mon.moves[b], mon.moves[a]]; [mon.pp[a], mon.pp[b]] = [mon.pp[b], mon.pp[a]]; op(runtime, `HandleMoveSwitching:${a}:${b}`); }
export function SetLinkBattleEndCallbacks(runtime = requireRuntime()): void { runtime.linkBattleEnd = true; runtime.battlerControllerFuncs[runtime.activeBattler] = 'LinkBattleEnd'; }
export function SetBattleEndCallbacks(runtime = requireRuntime()): void { runtime.battleEnd = true; runtime.battlerControllerFuncs[runtime.activeBattler] = 'BattleEnd'; }
export function CompleteOnBattlerSpriteCallbackDummy(runtime = requireRuntime()): void { if (sprite(runtime).callback === 'SpriteCallbackDummy') complete(runtime); }
export function CompleteOnBattlerSpriteCallbackDummy2(runtime = requireRuntime()): void { CompleteOnBattlerSpriteCallbackDummy(runtime); }
export function FreeTrainerSpriteAfterSlide(runtime = requireRuntime()): void { sprite(runtime).destroyed = true; complete(runtime); }
export function Intro_DelayAndEnd(runtime = requireRuntime()): void { op(runtime, 'Intro_DelayAndEnd'); complete(runtime); }
export function Intro_WaitForShinyAnimAndHealthbox(runtime = requireRuntime()): void { if (!runtime.specialAnimActive && runtime.healthbarDone) complete(runtime); }
export function Intro_TryShinyAnimShowHealthbox(runtime = requireRuntime()): void { op(runtime, runtime.battleMons[runtime.activeBattler].shiny ? 'TryShinyAnim' : 'ShowHealthbox'); complete(runtime); }
export function SwitchIn_CleanShinyAnimShowSubstitute(runtime = requireRuntime()): void { runtime.battleMons[runtime.activeBattler].substitute = false; op(runtime, 'SwitchIn_CleanShinyAnimShowSubstitute'); complete(runtime); }
export function SwitchIn_HandleSoundAndEnd(runtime = requireRuntime()): void { op(runtime, 'PlayCryAndEndSwitchIn'); complete(runtime); }
export function SwitchIn_TryShinyAnimShowHealthbox(runtime = requireRuntime()): void { Intro_TryShinyAnimShowHealthbox(runtime); }
export function Task_PlayerController_RestoreBgmAfterCry(taskId: number, runtime = requireRuntime()): void { stepTimerTask(runtime, taskId, 2, () => op(runtime, 'm4aMPlayContinue')); }
export function CompleteOnHealthbarDone(runtime = requireRuntime()): void { if (runtime.healthbarDone) complete(runtime); }
export function CompleteOnInactiveTextPrinter(runtime = requireRuntime()): void { if (!runtime.textPrinterActive) complete(runtime); }
export function Task_GiveExpToMon(taskId: number, runtime = requireRuntime()): void { stepTimerTask(runtime, taskId, 1, () => { runtime.party[task(runtime, taskId).data[1] || 0].exp += task(runtime, taskId).data[2] || 1; }); }
export function Task_PrepareToGiveExpWithExpBar(taskId: number, runtime = requireRuntime()): void { task(runtime, taskId).func = 'Task_GiveExpWithExpBar'; op(runtime, 'PrepareExpBar'); }
export function Task_GiveExpWithExpBar(taskId: number, runtime = requireRuntime()): void { stepTimerTask(runtime, taskId, 3, () => { runtime.party[task(runtime, taskId).data[1] || 0].exp += task(runtime, taskId).data[2] || 1; op(runtime, 'ExpBarDone'); }); }
export function Task_LaunchLvlUpAnim(taskId: number, runtime = requireRuntime()): void { stepTimerTask(runtime, taskId, 2, () => op(runtime, 'LaunchLvlUpAnim')); }
export function Task_UpdateLvlInHealthbox(taskId: number, runtime = requireRuntime()): void { stepTimerTask(runtime, taskId, 1, () => { runtime.battleMons[runtime.activeBattler].level += 1; op(runtime, 'UpdateLvlInHealthbox'); }); }
export function DestroyExpTaskAndCompleteOnInactiveTextPrinter(taskId: number, runtime = requireRuntime()): void { if (!runtime.textPrinterActive) { destroyTask(runtime, taskId); complete(runtime); } }
export function Task_CreateLevelUpVerticalStripes(taskId: number, runtime = requireRuntime()): void { stepTimerTask(runtime, taskId, 4, () => op(runtime, 'LevelUpVerticalStripes')); }
export function FreeMonSpriteAfterFaintAnim(runtime = requireRuntime()): void { sprite(runtime).destroyed = true; complete(runtime); }
export function FreeMonSpriteAfterSwitchOutAnim(runtime = requireRuntime()): void { sprite(runtime).destroyed = true; complete(runtime); }
export function CompleteOnInactiveTextPrinter2(runtime = requireRuntime()): void { CompleteOnInactiveTextPrinter(runtime); }
export function OpenPartyMenuToChooseMon(runtime = requireRuntime()): void { runtime.monSelectionDone = false; op(runtime, 'OpenPartyMenuToChooseMon'); }
export function WaitForMonSelection(runtime = requireRuntime()): void { if (runtime.monSelectionDone) { setReturn(runtime, runtime.selectedMonId); complete(runtime); } }
export function OpenBagAndChooseItem(runtime = requireRuntime()): void { runtime.itemSelectionDone = false; op(runtime, 'OpenBagAndChooseItem'); }
export function CompleteWhenChoseItem(runtime = requireRuntime()): void { if (runtime.itemSelectionDone) { setReturn(runtime, runtime.selectedItem); complete(runtime); } }
export function CompleteOnSpecialAnimDone(runtime = requireRuntime()): void { if (!runtime.specialAnimActive) complete(runtime); }
export function DoHitAnimBlinkSpriteEffect(runtime = requireRuntime()): void { sprite(runtime).callback = 'SpriteCB_BlinkVisible'; runtime.specialAnimActive = true; op(runtime, 'DoHitAnimBlinkSpriteEffect'); }
export function MoveSelectionDisplayMoveNames(runtime = requireRuntime()): void { op(runtime, `MoveNames:${runtime.battleMons[runtime.activeBattler].moves.join(',')}`); }
export function MoveSelectionDisplayPpString(runtime = requireRuntime()): void { op(runtime, 'MoveSelectionDisplayPpString'); }
export function MoveSelectionDisplayPpNumber(runtime = requireRuntime()): void { op(runtime, `MovePP:${runtime.battleMons[runtime.activeBattler].pp.join(',')}`); }
export function MoveSelectionDisplayMoveType(runtime = requireRuntime()): void { op(runtime, 'MoveSelectionDisplayMoveType'); }
export function MoveSelectionCreateCursorAt(cursorPosition: number, arg1: number, runtime = requireRuntime()): void { runtime.moveSelectionCursor[runtime.activeBattler] = cursorPosition; op(runtime, `MoveSelectionCreateCursorAt:${cursorPosition}:${arg1}`); }
export function MoveSelectionDestroyCursorAt(cursorPosition: number, runtime = requireRuntime()): void { op(runtime, `MoveSelectionDestroyCursorAt:${cursorPosition}`); }
export function ActionSelectionCreateCursorAt(cursorPosition: number, arg1: number, runtime = requireRuntime()): void { runtime.actionSelectionCursor[runtime.activeBattler] = cursorPosition; op(runtime, `ActionSelectionCreateCursorAt:${cursorPosition}:${arg1}`); }
export function ActionSelectionDestroyCursorAt(cursorPosition: number, runtime = requireRuntime()): void { op(runtime, `ActionSelectionDestroyCursorAt:${cursorPosition}`); }
export function SetCB2ToReshowScreenAfterMenu(runtime = requireRuntime()): void { op(runtime, 'SetCB2ToReshowScreenAfterMenu'); }
export function SetCB2ToReshowScreenAfterMenu2(runtime = requireRuntime()): void { op(runtime, 'SetCB2ToReshowScreenAfterMenu2'); }
export function CompleteOnFinishedStatusAnimation(runtime = requireRuntime()): void { if (!runtime.statusAnimActive) complete(runtime); }
export function CompleteOnFinishedBattleAnimation(runtime = requireRuntime()): void { if (!runtime.battleAnimActive) complete(runtime); }
export function PrintLinkStandbyMsg(runtime = requireRuntime()): void { op(runtime, 'PrintLinkStandbyMsg'); }

export function PlayerHandleGetMonData(runtime = requireRuntime()): void { const monId = arg(runtime, 1); const data = CopyPlayerMonData(monId, [], runtime); runtime.battleBufferB[runtime.activeBattler] = data; complete(runtime); }
export function CopyPlayerMonData(monId: number, dst: number[] = [], runtime = requireRuntime()): number[] { const mon = runtime.party[monId] ?? makeMon(); const data = [mon.species, mon.hp, mon.maxHp, mon.level, mon.exp, ...mon.moves, ...mon.pp]; dst.splice(0, dst.length, ...data); return dst; }
export function PlayerHandleGetRawMonData(runtime = requireRuntime()): void { runtime.battleBufferB[runtime.activeBattler] = [...(runtime.party[arg(runtime, 1)]?.raw ?? [])]; complete(runtime); }
export function PlayerHandleSetMonData(runtime = requireRuntime()): void { SetPlayerMonData(arg(runtime, 1), runtime); complete(runtime); }
export function SetPlayerMonData(monId: number, runtime = requireRuntime()): void { const mon = runtime.party[monId] ?? (runtime.party[monId] = makeMon()); mon.species = arg(runtime, 2) || mon.species; mon.hp = arg(runtime, 3) || mon.hp; mon.level = arg(runtime, 4) || mon.level; op(runtime, `SetPlayerMonData:${monId}`); }
export function PlayerHandleSetRawMonData(runtime = requireRuntime()): void { const mon = runtime.party[arg(runtime, 1)] ?? (runtime.party[arg(runtime, 1)] = makeMon()); mon.raw = runtime.battleBufferA[runtime.activeBattler].slice(2); complete(runtime); }
export function PlayerHandleLoadMonSprite(runtime = requireRuntime()): void { sprite(runtime).callback = 'SpriteCB_FreePlayerSpriteLoadMonSprite'; op(runtime, 'LoadMonSprite'); complete(runtime); }
export function PlayerHandleSwitchInAnim(runtime = requireRuntime()): void { StartSendOutAnim(runtime.activeBattler, false, runtime); }
export function StartSendOutAnim(battlerId: number, dontClearSubstituteBit: boolean, runtime = requireRuntime()): void { const id = createTask(runtime, 'Task_StartSendOutAnim'); task(runtime, id).data[0] = battlerId; task(runtime, id).data[1] = dontClearSubstituteBit ? 1 : 0; op(runtime, `StartSendOutAnim:${battlerId}:${dontClearSubstituteBit ? 1 : 0}`); }
export function PlayerHandleReturnMonToBall(runtime = requireRuntime()): void { DoSwitchOutAnimation(runtime); }
export function DoSwitchOutAnimation(runtime = requireRuntime()): void { sprite(runtime).x2 = -32; sprite(runtime).callback = 'DoSwitchOutAnimation'; op(runtime, 'DoSwitchOutAnimation'); complete(runtime); }
export function PlayerHandleDrawTrainerPic(runtime = requireRuntime()): void { sprite(runtime).callback = 'TrainerPic'; op(runtime, 'DrawTrainerPic'); complete(runtime); }
export function PlayerHandleTrainerSlide(runtime = requireRuntime()): void { sprite(runtime).x2 = -96; sprite(runtime).callback = 'TrainerSlide'; complete(runtime); }
export function PlayerHandleTrainerSlideBack(runtime = requireRuntime()): void { sprite(runtime).x2 = 0; sprite(runtime).callback = 'TrainerSlideBack'; complete(runtime); }
export function PlayerHandleFaintAnimation(runtime = requireRuntime()): void { sprite(runtime).callback = 'FaintAnimation'; createTask(runtime, 'Task_GiveExpToMon'); complete(runtime); }
export function PlayerHandlePaletteFade(runtime = requireRuntime()): void { op(runtime, 'BeginNormalPaletteFade'); complete(runtime); }
export function PlayerHandleSuccessBallThrowAnim(runtime = requireRuntime()): void { op(runtime, 'SuccessBallThrowAnim'); complete(runtime); }
export function PlayerHandleBallThrowAnim(runtime = requireRuntime()): void { op(runtime, 'BallThrowAnim'); complete(runtime); }
export function PlayerHandlePause(runtime = requireRuntime()): void { const id = createTask(runtime, 'Task_PlayerController_RestoreBgmAfterCry'); task(runtime, id).data[0] = arg(runtime, 1); }
export function PlayerHandleMoveAnimation(runtime = requireRuntime()): void { PlayerDoMoveAnimation(runtime); }
export function PlayerDoMoveAnimation(runtime = requireRuntime()): void { runtime.battleAnimActive = true; runtime.currentMove = arg(runtime, 1); op(runtime, `PlayerDoMoveAnimation:${runtime.currentMove}`); complete(runtime); }
export function PlayerHandlePrintString(runtime = requireRuntime()): void { runtime.textPrinterActive = true; op(runtime, `PrintString:${arg(runtime, 1)}`); complete(runtime); }
export function PlayerHandlePrintSelectionString(runtime = requireRuntime()): void { op(runtime, `PrintSelectionString:${arg(runtime, 1)}`); complete(runtime); }
export function HandleChooseActionAfterDma3(runtime = requireRuntime()): void { HandleInputChooseAction(runtime); }
export function PlayerHandleChooseAction(runtime = requireRuntime()): void { ActionSelectionCreateCursorAt(runtime.actionSelectionCursor[runtime.activeBattler], 0, runtime); runtime.battlerControllerFuncs[runtime.activeBattler] = 'HandleInputChooseAction'; }
export function PlayerHandleUnknownYesNoBox(runtime = requireRuntime()): void { setReturn(runtime, runtime.input.a ? 0 : 1); complete(runtime); }
export function HandleChooseMoveAfterDma3(runtime = requireRuntime()): void { HandleInputChooseMove(runtime); }
export function PlayerHandleChooseMove(runtime = requireRuntime()): void { InitMoveSelectionsVarsAndStrings(runtime); runtime.battlerControllerFuncs[runtime.activeBattler] = 'HandleInputChooseMove'; }
export function InitMoveSelectionsVarsAndStrings(runtime = requireRuntime()): void { MoveSelectionDisplayMoveNames(runtime); MoveSelectionDisplayPpString(runtime); MoveSelectionDisplayPpNumber(runtime); MoveSelectionDisplayMoveType(runtime); }
export function PlayerHandleChooseItem(runtime = requireRuntime()): void { OpenBagAndChooseItem(runtime); runtime.battlerControllerFuncs[runtime.activeBattler] = 'CompleteWhenChoseItem'; }
export function PlayerHandleChoosePokemon(runtime = requireRuntime()): void { OpenPartyMenuToChooseMon(runtime); runtime.battlerControllerFuncs[runtime.activeBattler] = 'WaitForMonSelection'; }
export function PlayerHandleCmd23(runtime = requireRuntime()): void { op(runtime, 'PlayerHandleCmd23'); complete(runtime); }
export function PlayerHandleHealthBarUpdate(runtime = requireRuntime()): void { runtime.healthbarDone = false; op(runtime, 'UpdateHealthbar'); runtime.healthbarDone = true; CompleteOnHealthbarDone(runtime); }
export function PlayerHandleExpUpdate(runtime = requireRuntime()): void { const id = createTask(runtime, 'Task_PrepareToGiveExpWithExpBar'); task(runtime, id).data[1] = arg(runtime, 1); task(runtime, id).data[2] = arg(runtime, 2); }
export function PlayerHandleStatusIconUpdate(runtime = requireRuntime()): void { op(runtime, 'UpdateStatusIcon'); complete(runtime); }
export function PlayerHandleStatusAnimation(runtime = requireRuntime()): void { runtime.statusAnimActive = true; op(runtime, 'StatusAnimation'); runtime.statusAnimActive = false; CompleteOnFinishedStatusAnimation(runtime); }
export function PlayerHandleStatusXor(runtime = requireRuntime()): void { runtime.battleMons[runtime.activeBattler].status = (runtime.battleMons[runtime.activeBattler].status ?? 0) ^ arg(runtime, 1); complete(runtime); }
export function PlayerHandleDataTransfer(runtime = requireRuntime()): void { runtime.battleBufferB[runtime.activeBattler] = runtime.battleBufferA[runtime.activeBattler].slice(1); complete(runtime); }
export function PlayerHandleDMA3Transfer(runtime = requireRuntime()): void { PlayerHandleDataTransfer(runtime); }
export function PlayerHandlePlayBGM(runtime = requireRuntime()): void { op(runtime, `PlayBGM:${arg(runtime, 1)}`); complete(runtime); }
export function PlayerHandleCmd32(runtime = requireRuntime()): void { op(runtime, 'PlayerHandleCmd32'); complete(runtime); }
export function PlayerHandleTwoReturnValues(runtime = requireRuntime()): void { setReturn(runtime, arg(runtime, 1), arg(runtime, 2)); complete(runtime); }
export function PlayerHandleChosenMonReturnValue(runtime = requireRuntime()): void { setReturn(runtime, runtime.selectedMonId); complete(runtime); }
export function PlayerHandleOneReturnValue(runtime = requireRuntime()): void { setReturn(runtime, arg(runtime, 1)); complete(runtime); }
export function PlayerHandleOneReturnValue_Duplicate(runtime = requireRuntime()): void { PlayerHandleOneReturnValue(runtime); }
export function PlayerHandleCmd37(runtime = requireRuntime()): void { runtime.battleBufferB[runtime.activeBattler][0] = 0; complete(runtime); }
export function PlayerHandleCmd38(runtime = requireRuntime()): void { runtime.battleBufferB[runtime.activeBattler][0] = 1; complete(runtime); }
export function PlayerHandleCmd39(runtime = requireRuntime()): void { runtime.controllerExecFlags &= ~runtime.bitTable[runtime.activeBattler]; complete(runtime); }
export function PlayerHandleCmd40(runtime = requireRuntime()): void { runtime.controllerExecFlags ^= runtime.bitTable[runtime.activeBattler]; complete(runtime); }
export function PlayerHandleHitAnimation(runtime = requireRuntime()): void { DoHitAnimBlinkSpriteEffect(runtime); complete(runtime); }
export function PlayerHandleCmd42(runtime = requireRuntime()): void { op(runtime, 'CantSwitch'); complete(runtime); }
export function PlayerHandlePlaySE(runtime = requireRuntime()): void { op(runtime, `PlaySE:${arg(runtime, 1)}`); complete(runtime); }
export function PlayerHandlePlayFanfare(runtime = requireRuntime()): void { op(runtime, `PlayFanfare:${arg(runtime, 1)}`); complete(runtime); }
export function PlayerHandleFaintingCry(runtime = requireRuntime()): void { op(runtime, `FaintingCry:${runtime.activeBattler}`); complete(runtime); }
export function PlayerHandleIntroSlide(runtime = requireRuntime()): void { op(runtime, 'IntroSlide'); complete(runtime); }
export function PlayerHandleIntroTrainerBallThrow(runtime = requireRuntime()): void { op(runtime, 'IntroTrainerBallThrow'); complete(runtime); }
export function SpriteCB_FreePlayerSpriteLoadMonSprite(spriteId: number, runtime = requireRuntime()): void { runtime.sprites[spriteId].destroyed = true; op(runtime, `SpriteCB_FreePlayerSpriteLoadMonSprite:${spriteId}`); }
export function Task_StartSendOutAnim(taskId: number, runtime = requireRuntime()): void { stepTimerTask(runtime, taskId, 3, () => { op(runtime, `Task_StartSendOutAnim:${task(runtime, taskId).data[0]}`); complete(runtime); }); }
export function PlayerHandleDrawPartyStatusSummary(runtime = requireRuntime()): void { op(runtime, 'DrawPartyStatusSummary'); createTask(runtime, 'EndDrawPartyStatusSummary'); }
export function EndDrawPartyStatusSummary(taskId: number, runtime = requireRuntime()): void { stepTimerTask(runtime, taskId, 2, () => complete(runtime)); }
export function PlayerHandleHidePartyStatusSummary(runtime = requireRuntime()): void { op(runtime, 'HidePartyStatusSummary'); complete(runtime); }
export function PlayerHandleEndBounceEffect(runtime = requireRuntime()): void { EndBounceEffect2(runtime); }
export function PlayerHandleSpriteInvisibility(runtime = requireRuntime()): void { sprite(runtime).invisible = !!arg(runtime, 1); complete(runtime); }
export function PlayerHandleBattleAnimation(runtime = requireRuntime()): void { runtime.battleAnimActive = true; op(runtime, `BattleAnimation:${arg(runtime, 1)}`); runtime.battleAnimActive = false; CompleteOnFinishedBattleAnimation(runtime); }
export function PlayerHandleLinkStandbyMsg(runtime = requireRuntime()): void { PrintLinkStandbyMsg(runtime); complete(runtime); }
export function PlayerHandleResetActionMoveSelection(runtime = requireRuntime()): void { runtime.actionSelectionCursor.fill(0); runtime.moveSelectionCursor.fill(0); complete(runtime); }
export function PlayerHandleCmd55(runtime = requireRuntime()): void { SetLinkBattleEndCallbacks(runtime); complete(runtime); }
export function PlayerCmdEnd(runtime = requireRuntime()): void { complete(runtime); }
export function PreviewDeterminativeMoveTargets(runtime = requireRuntime()): void { op(runtime, `PreviewDeterminativeMoveTargets:${runtime.battleMons[runtime.activeBattler].moves.join(',')}`); }

commandHandlers[CONTROLLER_GETMONDATA] = PlayerHandleGetMonData;
commandHandlers[CONTROLLER_GETRAWMONDATA] = PlayerHandleGetRawMonData;
commandHandlers[CONTROLLER_SETMONDATA] = PlayerHandleSetMonData;
commandHandlers[CONTROLLER_SETRAWMONDATA] = PlayerHandleSetRawMonData;
commandHandlers[CONTROLLER_LOADMONSPRITE] = PlayerHandleLoadMonSprite;
commandHandlers[CONTROLLER_SWITCHINANIM] = PlayerHandleSwitchInAnim;
commandHandlers[CONTROLLER_RETURNMONTOBALL] = PlayerHandleReturnMonToBall;
commandHandlers[CONTROLLER_DRAWTRAINERPIC] = PlayerHandleDrawTrainerPic;
commandHandlers[CONTROLLER_TRAINERSLIDE] = PlayerHandleTrainerSlide;
commandHandlers[CONTROLLER_TRAINERSLIDEBACK] = PlayerHandleTrainerSlideBack;
commandHandlers[CONTROLLER_FAINTANIMATION] = PlayerHandleFaintAnimation;
commandHandlers[CONTROLLER_PALETTEFADE] = PlayerHandlePaletteFade;
commandHandlers[CONTROLLER_SUCCESSBALLTHROWANIM] = PlayerHandleSuccessBallThrowAnim;
commandHandlers[CONTROLLER_BALLTHROWANIM] = PlayerHandleBallThrowAnim;
commandHandlers[CONTROLLER_PAUSE] = PlayerHandlePause;
commandHandlers[CONTROLLER_MOVEANIMATION] = PlayerHandleMoveAnimation;
commandHandlers[CONTROLLER_PRINTSTRING] = PlayerHandlePrintString;
commandHandlers[CONTROLLER_PRINTSTRINGPLAYERONLY] = PlayerHandlePrintSelectionString;
commandHandlers[CONTROLLER_CHOOSEACTION] = PlayerHandleChooseAction;
commandHandlers[CONTROLLER_UNKNOWNYESNOBOX] = PlayerHandleUnknownYesNoBox;
commandHandlers[CONTROLLER_CHOOSEMOVE] = PlayerHandleChooseMove;
commandHandlers[CONTROLLER_OPENBAG] = PlayerHandleChooseItem;
commandHandlers[CONTROLLER_CHOOSEPOKEMON] = PlayerHandleChoosePokemon;
commandHandlers[CONTROLLER_23] = PlayerHandleCmd23;
commandHandlers[CONTROLLER_HEALTHBARUPDATE] = PlayerHandleHealthBarUpdate;
commandHandlers[CONTROLLER_EXPUPDATE] = PlayerHandleExpUpdate;
commandHandlers[CONTROLLER_STATUSICONUPDATE] = PlayerHandleStatusIconUpdate;
commandHandlers[CONTROLLER_STATUSANIMATION] = PlayerHandleStatusAnimation;
commandHandlers[CONTROLLER_STATUSXOR] = PlayerHandleStatusXor;
commandHandlers[CONTROLLER_DATATRANSFER] = PlayerHandleDataTransfer;
commandHandlers[CONTROLLER_DMA3TRANSFER] = PlayerHandleDMA3Transfer;
commandHandlers[CONTROLLER_PLAYBGM] = PlayerHandlePlayBGM;
commandHandlers[CONTROLLER_32] = PlayerHandleCmd32;
commandHandlers[CONTROLLER_TWORETURNVALUES] = PlayerHandleTwoReturnValues;
commandHandlers[CONTROLLER_CHOSENMONRETURNVALUE] = PlayerHandleChosenMonReturnValue;
commandHandlers[CONTROLLER_ONERETURNVALUE] = PlayerHandleOneReturnValue;
commandHandlers[CONTROLLER_ONERETURNVALUE_DUPLICATE] = PlayerHandleOneReturnValue_Duplicate;
commandHandlers[CONTROLLER_CLEARUNKVAR] = PlayerHandleCmd37;
commandHandlers[CONTROLLER_SETUNKVAR] = PlayerHandleCmd38;
commandHandlers[CONTROLLER_CLEARUNKFLAG] = PlayerHandleCmd39;
commandHandlers[CONTROLLER_TOGGLEUNKFLAG] = PlayerHandleCmd40;
commandHandlers[CONTROLLER_HITANIMATION] = PlayerHandleHitAnimation;
commandHandlers[CONTROLLER_CANTSWITCH] = PlayerHandleCmd42;
commandHandlers[CONTROLLER_PLAYSE] = PlayerHandlePlaySE;
commandHandlers[CONTROLLER_PLAYFANFARE] = PlayerHandlePlayFanfare;
commandHandlers[CONTROLLER_FAINTINGCRY] = PlayerHandleFaintingCry;
commandHandlers[CONTROLLER_INTROSLIDE] = PlayerHandleIntroSlide;
commandHandlers[CONTROLLER_INTROTRAINERBALLTHROW] = PlayerHandleIntroTrainerBallThrow;
commandHandlers[CONTROLLER_DRAWPARTYSTATUSSUMMARY] = PlayerHandleDrawPartyStatusSummary;
commandHandlers[CONTROLLER_HIDEPARTYSTATUSSUMMARY] = PlayerHandleHidePartyStatusSummary;
commandHandlers[CONTROLLER_ENDBOUNCE] = PlayerHandleEndBounceEffect;
commandHandlers[CONTROLLER_SPRITEINVISIBILITY] = PlayerHandleSpriteInvisibility;
commandHandlers[CONTROLLER_BATTLEANIMATION] = PlayerHandleBattleAnimation;
commandHandlers[CONTROLLER_LINKSTANDBYMSG] = PlayerHandleLinkStandbyMsg;
commandHandlers[CONTROLLER_RESETACTIONMOVESELECTION] = PlayerHandleResetActionMoveSelection;
commandHandlers[CONTROLLER_ENDLINKBATTLE] = PlayerHandleCmd55;
commandHandlers[CONTROLLER_TERMINATOR_NOP] = PlayerCmdEnd;

export const playerControllerTaskHandlers = {
  Task_PlayerController_RestoreBgmAfterCry,
  Task_GiveExpToMon,
  Task_PrepareToGiveExpWithExpBar,
  Task_GiveExpWithExpBar,
  Task_LaunchLvlUpAnim,
  Task_UpdateLvlInHealthbox,
  DestroyExpTaskAndCompleteOnInactiveTextPrinter,
  Task_CreateLevelUpVerticalStripes,
  Task_StartSendOutAnim,
  EndDrawPartyStatusSummary
};
