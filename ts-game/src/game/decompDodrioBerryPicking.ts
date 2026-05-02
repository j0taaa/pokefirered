export const MAX_SCORE = 999990;
export const MAX_BERRIES = 9999;
export const PRIZE_SCORE = 3000;
export const NUM_PLAYERS = 5;
export const NUM_BERRY_COLUMNS = 10;
export const NUM_BERRY_IDS = 6;
export const NUM_DIFFICULTIES = 7;
export const MAX_FALL_DIST = 10;
export const EAT_FALL_DIST = 7;
export const PLAYER_NONE = 0xff;
export const PLAY_AGAIN_NONE = 0;
export const PLAY_AGAIN_YES = 1;
export const PLAY_AGAIN_NO = 2;
export const PLAY_AGAIN_DROPPED = 5;
export const PICK_NONE = 0;
export const PICK_RIGHT = 1;
export const PICK_MIDDLE = 2;
export const PICK_LEFT = 3;
export const PICK_DISABLED = 4;
export const BERRY_BLUE = 0;
export const BERRY_GREEN = 1;
export const BERRY_GOLD = 2;
export const BERRY_MISSED = 3;
export const BERRY_PRIZE = 4;
export const BERRY_IN_ROW = 5;
export const BERRYSTATE_NONE = 0;
export const BERRYSTATE_PICKED = 1;
export const BERRYSTATE_EATEN = 2;
export const BERRYSTATE_SQUISHED = 3;
export const INPUTSTATE_NONE = 0;
export const INPUTSTATE_TRY_PICK = 1;
export const INPUTSTATE_PICKED = 2;
export const INPUTSTATE_ATE_BERRY = 3;
export const INPUTSTATE_BAD_MISS = 4;

export interface DodrioSprite { id: number; x: number; y: number; data: number[]; callback: string | null; invisible: boolean; destroyed: boolean; anim: number; }
export interface DodrioTask { id: number; data: number[]; func: string | null; destroyed: boolean; }
export interface DodrioPlayer { isShiny: boolean; name: string; pickState: number; score: number; berries: { fallDist: number[]; ids: number[] }; ateBerry: boolean; missedBerry: boolean; }
export interface DodrioGfx { finished: boolean; taskId: number; state: number; loadState: number; timer: number; cursorSelection: number; playAgainState: number; func: string | null; active: boolean; messages: string[]; }
export interface DodrioBerryPickingRuntime {
  operations: string[];
  tasks: DodrioTask[];
  sprites: DodrioSprite[];
  exitCallback: string | null;
  taskId: number;
  playersReceived: number;
  startState: number;
  state: number;
  timer: number;
  funcId: number;
  prevFuncId: number;
  isLeader: boolean;
  numPlayers: number;
  multiplayerId: number;
  countdownEndDelay: number;
  posToPlayerId: number[];
  numGraySquares: number;
  berryColStart: number;
  berryColEnd: number;
  berryResults: number[][];
  berriesEaten: number[];
  difficulty: number[];
  pickStateQueue: number[];
  eatTimer: number[];
  inputState: number[];
  inputDelay: number[];
  berryEatenBy: number[];
  berryState: number[];
  fallTimer: number[];
  newBerryTimer: number[];
  prevBerryIds: number[];
  playersAttemptingPick: number[][];
  playAgainStates: number[];
  berriesPickedInRow: number;
  maxBerriesPickedInRow: number;
  startCountdown: boolean;
  startGame: boolean;
  berriesFalling: boolean;
  clearRecvCmdTimer: number;
  clearRecvCmds: boolean;
  allReadyToEnd: boolean;
  readyToEnd: boolean[];
  playingPickSound: boolean;
  playingSquishSound: boolean[];
  endSoundState: number;
  readyToStart: boolean[];
  players: DodrioPlayer[];
  scoreResults: Array<{ ranking: number; score: number }>;
  gfx: DodrioGfx;
  statusBar: { entered: boolean[]; yChange: number[]; spriteIds: number[]; flashTimer: number; visible: boolean };
  dodrioSpriteIds: number[];
  cloudSpriteIds: number[];
  berrySpriteIds: number[];
  berryIconSpriteIds: number[];
  records: { highestScore: number; highestBerryResult: number };
  prizeItemId: number;
  prizeGiven: boolean;
  exitingGame: boolean;
  randomSeed: number;
}

let activeRuntime: DodrioBerryPickingRuntime | null = null;
const req = (runtime?: DodrioBerryPickingRuntime): DodrioBerryPickingRuntime => { const r = runtime ?? activeRuntime; if (!r) throw new Error('dodrio berry picking runtime is not active'); return r; };
const op = (r: DodrioBerryPickingRuntime, name: string, ...args: Array<number | string | boolean>): void => { r.operations.push([name, ...args].join(':')); };
const arr = (n: number, v = 0): number[] => Array.from({ length: n }, () => v);
const matrix = (rows: number, cols: number, v = 0): number[][] => Array.from({ length: rows }, () => arr(cols, v));
const makePlayer = (i: number): DodrioPlayer => ({ isShiny: false, name: `PLAYER${i + 1}`, pickState: PICK_NONE, score: 0, berries: { fallDist: arr(NUM_BERRY_COLUMNS + 1), ids: arr(NUM_BERRY_COLUMNS + 1) }, ateBerry: false, missedBerry: false });
const makeSprite = (r: DodrioBerryPickingRuntime, callback: string | null, x = 0, y = 0): number => { const id = r.sprites.length; r.sprites.push({ id, x, y, data: arr(16), callback, invisible: false, destroyed: false, anim: 0 }); op(r, 'CreateSprite', callback ?? 'null', id); return id; };
const makeTask = (r: DodrioBerryPickingRuntime, func: string): number => { const id = r.tasks.length; r.tasks.push({ id, data: arr(16), func, destroyed: false }); op(r, 'CreateTask', func, id); return id; };
const task = (r: DodrioBerryPickingRuntime, id: number): DodrioTask => r.tasks[id] ?? (r.tasks[id] = { id, data: arr(16), func: null, destroyed: false });
const sprite = (r: DodrioBerryPickingRuntime, id: number): DodrioSprite => r.sprites[id] ?? (r.sprites[id] = { id, x: 0, y: 0, data: arr(16), callback: null, invisible: false, destroyed: false, anim: 0 });
const destroyTask = (r: DodrioBerryPickingRuntime, id: number): void => { task(r, id).destroyed = true; task(r, id).func = null; op(r, 'DestroyTask', id); };
const destroySprite = (r: DodrioBerryPickingRuntime, id: number): void => { sprite(r, id).destroyed = true; sprite(r, id).callback = null; op(r, 'DestroySprite', id); };
const setFunc = (r: DodrioBerryPickingRuntime, funcId: number, funcName: string): void => { r.prevFuncId = r.funcId; r.funcId = funcId; r.gfx.func = funcName; op(r, 'SetGameFunc', funcName); };
const stepTask = (r: DodrioBerryPickingRuntime, id: number, name: string, next?: string, frames = 1): void => { const t = task(r, id); op(r, name, id); t.data[0]++; if (next) t.func = next; else if (t.data[0] >= frames) destroyTask(r, id); };
const nextRandom = (r: DodrioBerryPickingRuntime): number => { r.randomSeed = (r.randomSeed * 1103515245 + 12345) >>> 0; return (r.randomSeed >>> 16) & 0x7fff; };

export function createDodrioBerryPickingRuntime(overrides: Partial<DodrioBerryPickingRuntime> = {}): DodrioBerryPickingRuntime {
  const runtime: DodrioBerryPickingRuntime = {
    operations: [],
    tasks: [],
    sprites: [],
    exitCallback: null,
    taskId: 0,
    playersReceived: 0,
    startState: 0,
    state: 0,
    timer: 0,
    funcId: 0,
    prevFuncId: 0,
    isLeader: true,
    numPlayers: 1,
    multiplayerId: 0,
    countdownEndDelay: 0,
    posToPlayerId: [0, 1, 2, 3, 4],
    numGraySquares: 0,
    berryColStart: 0,
    berryColEnd: NUM_BERRY_COLUMNS - 1,
    berryResults: matrix(NUM_PLAYERS, NUM_BERRY_IDS),
    berriesEaten: arr(NUM_PLAYERS),
    difficulty: arr(NUM_PLAYERS),
    pickStateQueue: arr(4),
    eatTimer: arr(NUM_BERRY_COLUMNS),
    inputState: arr(NUM_PLAYERS),
    inputDelay: arr(NUM_PLAYERS),
    berryEatenBy: arr(NUM_BERRY_COLUMNS, PLAYER_NONE),
    berryState: arr(NUM_BERRY_COLUMNS),
    fallTimer: arr(NUM_BERRY_COLUMNS),
    newBerryTimer: arr(NUM_BERRY_COLUMNS),
    prevBerryIds: arr(NUM_BERRY_COLUMNS),
    playersAttemptingPick: matrix(NUM_BERRY_COLUMNS, 2, PLAYER_NONE),
    playAgainStates: arr(NUM_PLAYERS, PLAY_AGAIN_NONE),
    berriesPickedInRow: 0,
    maxBerriesPickedInRow: 0,
    startCountdown: false,
    startGame: false,
    berriesFalling: false,
    clearRecvCmdTimer: 0,
    clearRecvCmds: false,
    allReadyToEnd: false,
    readyToEnd: Array.from({ length: NUM_PLAYERS }, () => false),
    playingPickSound: false,
    playingSquishSound: Array.from({ length: NUM_BERRY_COLUMNS }, () => false),
    endSoundState: 0,
    readyToStart: Array.from({ length: NUM_PLAYERS }, (_, i) => i === 0),
    players: Array.from({ length: NUM_PLAYERS }, (_v, i) => makePlayer(i)),
    scoreResults: Array.from({ length: NUM_PLAYERS }, () => ({ ranking: 0, score: 0 })),
    gfx: { finished: false, taskId: 0, state: 0, loadState: 0, timer: 0, cursorSelection: 0, playAgainState: PLAY_AGAIN_NONE, func: null, active: false, messages: [] },
    statusBar: { entered: Array.from({ length: 10 }, () => false), yChange: arr(10), spriteIds: arr(10, -1), flashTimer: 0, visible: true },
    dodrioSpriteIds: arr(NUM_PLAYERS, -1),
    cloudSpriteIds: arr(2, -1),
    berrySpriteIds: arr(NUM_BERRY_COLUMNS, -1),
    berryIconSpriteIds: arr(4, -1),
    records: { highestScore: 0, highestBerryResult: 0 },
    prizeItemId: 0,
    prizeGiven: false,
    exitingGame: false,
    randomSeed: 1,
    ...overrides
  };
  activeRuntime = runtime;
  return runtime;
}

export function StartDodrioBerryPicking(exitCallback: string | null = null, r = req()): void { r.exitCallback = exitCallback; ResetTasksAndSprites(r); InitDodrioGame(r); r.taskId = CreateDodrioGameTask(r); r.gfx.taskId = Task_TryRunGfxFunc(r); }
export function ResetTasksAndSprites(r = req()): void { r.tasks = []; r.sprites = []; r.dodrioSpriteIds.fill(-1); r.cloudSpriteIds.fill(-1); r.berrySpriteIds.fill(-1); r.berryIconSpriteIds.fill(-1); op(r, 'ResetTasksAndSprites'); }
export function InitDodrioGame(r = req()): void { r.state = 0; r.timer = 0; r.startGame = false; r.allReadyToEnd = false; ResetReadyToStart(r); ResetPickState(-1, r); InitMonInfo(r); InitFirstWaveOfBerries(r); ResetGfxState(r); }
export function Task_StartDodrioGame(taskId = 0, r = req()): void { setFunc(r, 0, 'DoGameIntro'); task(r, taskId).func = r.isLeader ? 'Task_DodrioGame_Leader' : 'Task_DodrioGame_Member'; }
export function Task_DodrioGame_Leader(taskId = 0, r = req()): void { UpdateGame_Leader(r); HandleSound_Leader(r); task(r, taskId).data[0]++; }
export function Task_DodrioGame_Member(taskId = 0, r = req()): void { UpdateGame_Member(r); HandleSound_Member(r); task(r, taskId).data[0]++; }
export function DoGameIntro(r = req()): void { SlideTreeBordersOut(r); setFunc(r, 1, 'InitCountdown'); }
export function InitCountdown(r = req()): void { r.countdownEndDelay = 60; r.startCountdown = true; setFunc(r, 2, 'DoCountdown'); }
export function DoCountdown(r = req()): void { if (r.countdownEndDelay > 0) r.countdownEndDelay--; if (r.countdownEndDelay === 0) setFunc(r, 3, 'WaitGameStart'); }
export function WaitGameStart(r = req()): void { if (AllPlayersReadyToStart(r)) { r.startGame = true; setFunc(r, 4, r.isLeader ? 'PlayGame_Leader' : 'PlayGame_Member'); } }
export function PlayGame_Leader(r = req()): void { RecvLinkData_Leader(r); HandlePickBerries(r); UpdateGame_Leader(r); SendLinkData_Leader(r); if (ReadyToEndGame_Leader(r)) setFunc(r, 11, 'WaitEndGame_Leader'); }
export function PlayGame_Member(r = req()): void { RecvLinkData_Member(r); HandlePickBerries(r); UpdateGame_Member(r); SendLinkData_Member(r); if (ReadyToEndGame_Member(r)) setFunc(r, 11, 'WaitEndGame_Member'); }
export function WaitEndGame_Leader(r = req()): void { RecvLinkData_ReadyToEnd(r); if (r.allReadyToEnd) setFunc(r, 5, 'InitResults_Leader'); }
export function WaitEndGame_Member(r = req()): void { SendLinkData_Member(r); if (r.allReadyToEnd) setFunc(r, 5, 'InitResults_Member'); }
export function InitResults_Leader(r = req()): void { SetScoreResults(r); TryUpdateRecords(r); setFunc(r, 6, 'DoResults'); }
export function InitResults_Member(r = req()): void { SetScoreResults(r); setFunc(r, 6, 'DoResults'); }
export function DoResults(r = req()): void { ShowResults(r); setFunc(r, 7, 'AskPlayAgain'); }
export function AskPlayAgain(r = req()): void { HandleWaitPlayAgainInput(r); if (GetPlayAgainState(r) !== PLAY_AGAIN_NONE) setFunc(r, 8, 'EndLink'); }
export function EndLink(r = req()): void { r.exitingGame = true; setFunc(r, 9, 'ExitGame'); }
export function ExitGame(r = req()): void { r.exitingGame = true; StopGfxFuncs(r); op(r, 'ExitGame', r.exitCallback ?? 'null'); }
export function ResetGame(r = req()): void { ResetForPlayAgainPrompt(r); InitDodrioGame(r); setFunc(r, 0, 'DoGameIntro'); }
export function Task_NewGameIntro(taskId = 0, r = req()): void { stepTask(r, taskId, 'Task_NewGameIntro'); }
export function Task_CommunicateMonInfo(taskId = 0, r = req()): void { r.playersReceived = r.numPlayers; stepTask(r, taskId, 'Task_CommunicateMonInfo'); }
export function RecvLinkData_Gameplay(r = req()): void { r.playersReceived = r.numPlayers; op(r, 'RecvLinkData_Gameplay'); }
export function RecvLinkData_ReadyToEnd(r = req()): void { r.allReadyToEnd = r.readyToEnd.slice(0, r.numPlayers).every(Boolean); }
export function RecvLinkData_Leader(r = req()): void { RecvLinkData_Gameplay(r); }
export function SendLinkData_Leader(r = req()): void { op(r, 'SendLinkData_Leader'); }
export function RecvLinkData_Member(r = req()): void { RecvLinkData_Gameplay(r); }
export function SendLinkData_Member(r = req()): void { op(r, 'SendLinkData_Member'); }
export function HandleSound_Leader(r = req()): void { r.playingPickSound = r.inputState.some(v => v === INPUTSTATE_PICKED || v === INPUTSTATE_ATE_BERRY); }
export function HandleSound_Member(r = req()): void { HandleSound_Leader(r); }
export function CB2_DodrioGame(r = req()): void { op(r, 'CB2_DodrioGame'); }
export function VBlankCB_DodrioGame(r = req()): void { op(r, 'VBlankCB_DodrioGame'); }
export function InitMonInfo(r = req()): void { r.players.forEach((p, i) => { p.isShiny = (i & 1) === 1; }); }
export function CreateTask_(func: string, priority = 0, r = req()): number { const id = makeTask(r, func); task(r, id).data[15] = priority; return id; }
export function CreateDodrioGameTask(r = req()): number { return CreateTask_('Task_StartDodrioGame', 1, r); }
export function SetGameFunc(funcId: number, r = req()): void { const names = ['DoGameIntro','InitCountdown','DoCountdown','WaitGameStart','PlayGame','InitResults','DoResults','AskPlayAgain','EndLink','ExitGame','ResetGame','WaitEndGame']; setFunc(r, funcId, names[funcId] ?? 'GfxIdle'); }
export function SlideTreeBordersOut(r = req()): void { op(r, 'SlideTreeBordersOut'); }
export function InitFirstWaveOfBerries(r = req()): void { for (let i = 0; i < NUM_BERRY_COLUMNS; i++) { r.prevBerryIds[i] = GetNewBerryId(i, r); r.fallTimer[i] = i % MAX_FALL_DIST; r.berryState[i] = BERRYSTATE_NONE; r.berryEatenBy[i] = PLAYER_NONE; } r.berriesFalling = true; }
export function HandlePickBerries(r = req()): void { for (let playerId = 0; playerId < r.numPlayers; playerId++) { const pick = r.players[playerId].pickState; if (pick !== PICK_NONE && pick !== PICK_DISABLED) TryPickBerry(playerId, pick + r.berryColStart - 1, r); } }
export function TryPickBerry(playerId: number, column: number, r = req()): boolean { if (column < 0 || column >= NUM_BERRY_COLUMNS || r.berryState[column] !== BERRYSTATE_NONE || r.fallTimer[column] < EAT_FALL_DIST) { r.inputState[playerId] = INPUTSTATE_BAD_MISS; ResetPickState(playerId, r); return false; } r.berryState[column] = BERRYSTATE_PICKED; r.berryEatenBy[column] = playerId; r.inputState[playerId] = INPUTSTATE_PICKED; IncrementBerryResult(playerId, r.prevBerryIds[column], r); UpdateBerriesPickedInRow(true, r); return true; }
export function UpdateFallingBerries(r = req()): void { for (let i = 0; i < NUM_BERRY_COLUMNS; i++) { if (++r.fallTimer[i] > MAX_FALL_DIST) { if (r.berryState[i] === BERRYSTATE_NONE) { r.berryState[i] = BERRYSTATE_SQUISHED; r.numGraySquares = Min(r.numGraySquares + 1, 10); } r.fallTimer[i] = 0; r.prevBerryIds[i] = GetNewBerryId(i, r); r.berryState[i] = BERRYSTATE_NONE; r.berryEatenBy[i] = PLAYER_NONE; } } }
export function UpdateBerrySprites(r = req()): void { r.berrySpriteIds.forEach((id, i) => { if (id >= 0) { sprite(r, id).y = r.fallTimer[i] * 8; sprite(r, id).anim = r.prevBerryIds[i]; } }); }
export function UpdateAllDodrioAnims(r = req()): void { r.dodrioSpriteIds.forEach((id, i) => { if (id >= 0) SetDodrioAnim(i, r.players[i].pickState, r); }); }
export function SetAllDodrioDisabled(r = req()): void { r.players.forEach(p => { p.pickState = PICK_DISABLED; }); }
export function UpdateGame_Leader(r = req()): void { UpdateFallingBerries(r); UpdateBerrySprites(r); UpdateAllDodrioAnims(r); TryIncrementDifficulty(r); }
export function UpdateGame_Member(r = req()): void { UpdateFallingBerries(r); UpdateBerrySprites(r); UpdateAllDodrioAnims(r); }
export function GetActiveBerryColumns(r = req()): number { return r.berryState.filter((state, i) => state === BERRYSTATE_NONE && r.fallTimer[i] >= EAT_FALL_DIST).length; }
export function AllPlayersReadyToStart(r = req()): boolean { return r.readyToStart.slice(0, r.numPlayers).every(Boolean); }
export function ResetReadyToStart(r = req()): void { r.readyToStart.fill(false); r.readyToStart[r.multiplayerId] = true; }
export function ReadyToEndGame_Leader(r = req()): boolean { r.readyToEnd[r.multiplayerId] = r.numGraySquares >= 10; r.allReadyToEnd = r.readyToEnd.slice(0, r.numPlayers).every(Boolean); return r.allReadyToEnd; }
export function ReadyToEndGame_Member(r = req()): boolean { r.readyToEnd[r.multiplayerId] = r.numGraySquares >= 10; return r.readyToEnd[r.multiplayerId]; }
export function TryIncrementDifficulty(r = req()): boolean { let changed = false; for (let i = 0; i < r.numPlayers; i++) if (r.berriesEaten[i] > 0 && r.berriesEaten[i] % 10 === 0) { r.difficulty[i] = (r.difficulty[i] + 1) % NUM_DIFFICULTIES; changed = true; } return changed; }
export function GetPlayerIdAtColumn(column: number, r = req()): number { const pos = column % r.numPlayers; return r.posToPlayerId[pos] ?? PLAYER_NONE; }
export function GetNewBerryId(column: number, r = req()): number { const difficulty = r.difficulty[GetPlayerIdAtColumn(column, r)] ?? 0; return GetNewBerryIdByDifficulty(difficulty, r); }
export function GetNewBerryIdByDifficulty(difficulty: number, r = req()): number { const roll = (nextRandom(r) + difficulty) % 10; return roll < 5 ? BERRY_BLUE : roll < 8 ? BERRY_GREEN : BERRY_GOLD; }
export function IncrementBerryResult(playerId: number, berryId: number, r = req()): void { if (playerId >= NUM_PLAYERS) return; const id = Math.min(berryId, NUM_BERRY_IDS - 1); r.berryResults[playerId][id] = IncrementWithLimit(r.berryResults[playerId][id], 1, MAX_BERRIES); r.berriesEaten[playerId] = IncrementWithLimit(r.berriesEaten[playerId], 1, MAX_BERRIES); r.players[playerId].score = GetScore(playerId, r); }
export function UpdateBerriesPickedInRow(picked = true, r = req()): void { r.berriesPickedInRow = picked ? IncrementWithLimit(r.berriesPickedInRow, 1, MAX_BERRIES) : 0; SetMaxBerriesPickedInRow(r); }
export function SetMaxBerriesPickedInRow(r = req()): void { if (r.berriesPickedInRow > r.maxBerriesPickedInRow) r.maxBerriesPickedInRow = r.berriesPickedInRow; }
export function ResetForPlayAgainPrompt(r = req()): void { r.playAgainStates.fill(PLAY_AGAIN_NONE); r.gfx.playAgainState = PLAY_AGAIN_NONE; r.gfx.cursorSelection = 0; }
export function SetRandomPrize(r = req()): void { const prizes = [0x85, 0x86, 0x87, 0x88]; r.prizeItemId = prizes[nextRandom(r) % prizes.length]; }
export function GetBerriesPicked(playerId = 0, r = req()): number { return r.berryResults[playerId].slice(0, 3).reduce((a, b) => a + b, 0); }
export function TryUpdateRecords(r = req()): boolean { const score = GetHighestScore(r); const berries = GetHighestBerryResult(r); const changed = score > r.records.highestScore || berries > r.records.highestBerryResult; r.records.highestScore = Math.max(r.records.highestScore, score); r.records.highestBerryResult = Math.max(r.records.highestBerryResult, berries); return changed; }
export function UpdatePickStateQueue(pickState: number, r = req()): void { r.pickStateQueue.shift(); r.pickStateQueue.push(pickState); }
export function HandleWaitPlayAgainInput(r = req()): void { r.playAgainStates[r.multiplayerId] = r.gfx.cursorSelection === 0 ? PLAY_AGAIN_YES : PLAY_AGAIN_NO; r.gfx.playAgainState = r.playAgainStates[r.multiplayerId]; }
export function ResetPickState(playerId = -1, r = req()): void { if (playerId >= 0) r.players[playerId].pickState = PICK_NONE; else r.players.forEach(p => { p.pickState = PICK_NONE; }); }
export function GetPrizeItemId(r = req()): number { if (!r.prizeItemId) SetRandomPrize(r); return r.prizeItemId; }
export function GetNumPlayers(r = req()): number { return r.numPlayers; }
export function GetBerryResult(playerId: number, berryId: number, r = req()): number { return r.berryResults[playerId]?.[berryId] ?? 0; }
export function GetScore(playerId = 0, r = req()): number { const res = r.berryResults[playerId] ?? arr(NUM_BERRY_IDS); return Math.min(MAX_SCORE, res[BERRY_BLUE] * 10 + res[BERRY_GREEN] * 30 + res[BERRY_GOLD] * 50 + res[BERRY_PRIZE] * 100 + res[BERRY_IN_ROW] * 10); }
export function GetHighestScore(r = req()): number { return Math.max(...Array.from({ length: r.numPlayers }, (_v, i) => GetScore(i, r))); }
export function GetHighestBerryResult(r = req()): number { return Math.max(...Array.from({ length: r.numPlayers }, (_v, i) => GetBerriesPicked(i, r))); }
export function GetScoreByRanking(ranking: number, r = req()): number { SetScoreResults(r); return r.scoreResults.find(v => v.ranking === ranking)?.score ?? 0; }
export function SetScoreResults(r = req()): void { const scores = Array.from({ length: r.numPlayers }, (_v, i) => ({ playerId: i, score: GetScore(i, r) })).sort((a, b) => b.score - a.score); scores.forEach((entry, i) => { r.scoreResults[entry.playerId] = { ranking: i + 1, score: entry.score }; }); }
export function GetScoreResults(playerId = 0, r = req()): { ranking: number; score: number } { return r.scoreResults[playerId]; }
export function GetScoreRanking(playerId = 0, r = req()): number { SetScoreResults(r); return r.scoreResults[playerId].ranking; }
export function TryGivePrize(r = req()): boolean { if (GetHighestScore(r) < PRIZE_SCORE || r.prizeGiven) return false; r.prizeGiven = true; SetRandomPrize(r); return true; }
export function IncrementWithLimit(value: number, inc: number, limit: number): number { return Math.min(limit, value + inc); }
export function Min(a: number, b: number): number { return Math.min(a, b); }
export function GetPlayerIdByPos(pos: number, r = req()): number { return r.posToPlayerId[pos] ?? PLAYER_NONE; }
export function IsDodrioInParty(r = req()): boolean { return r.players.some(p => p.name.toUpperCase().includes('DODRIO')); }
export function ShowDodrioBerryPickingRecords(r = req()): void { makeTask(r, 'Task_ShowDodrioBerryPickingRecords'); }
export function Task_ShowDodrioBerryPickingRecords(taskId = 0, r = req()): void { PrintRecordsText(r); destroyTask(r, taskId); }
export function PrintRecordsText(r = req()): void { r.gfx.messages.push(`HIGH SCORE ${r.records.highestScore}`); r.gfx.messages.push(`BERRIES ${r.records.highestBerryResult}`); }
export function Debug_UpdateNumPlayers(numPlayers: number, r = req()): void { r.numPlayers = Math.max(1, Math.min(NUM_PLAYERS, numPlayers)); }
export function Debug_SetPlayerNamesAndResults(r = req()): void { r.players.forEach((p, i) => { p.name = `DODRIO${i + 1}`; r.berryResults[i][BERRY_BLUE] = i + 1; }); }
export function LoadDodrioGfx(r = req()): void { op(r, 'LoadDodrioGfx'); }
export function CreateDodrioSprite(playerId: number, r = req()): number { const id = makeSprite(r, 'SpriteCB_Dodrio', GetDodrioXPos(playerId), 96); r.dodrioSpriteIds[playerId] = id; return id; }
export function SpriteCB_Dodrio(spriteId: number, r = req()): void { const sp = sprite(r, spriteId); sp.data[0]++; sp.y += sp.anim === PICK_DISABLED ? 1 : 0; }
export function StartDodrioMissedAnim(playerId: number, r = req()): void { SetDodrioAnim(playerId, PICK_DISABLED, r); }
export function StartDodrioIntroAnim(playerId: number, r = req()): void { SetDodrioAnim(playerId, PICK_MIDDLE, r); }
export function DoDodrioMissedAnim(spriteId: number, r = req()): void { sprite(r, spriteId).anim = PICK_DISABLED; }
export function DoDodrioIntroAnim(spriteId: number, r = req()): void { sprite(r, spriteId).anim = PICK_MIDDLE; }
export function FreeDodrioSprites(r = req()): void { r.dodrioSpriteIds.forEach(id => { if (id >= 0) destroySprite(r, id); }); r.dodrioSpriteIds.fill(-1); }
export function SetDodrioInvisibility(playerId: number, invisible: boolean, r = req()): void { const id = r.dodrioSpriteIds[playerId]; if (id >= 0) sprite(r, id).invisible = invisible; }
export function SetAllDodrioInvisibility(invisible: boolean, r = req()): void { for (let i = 0; i < NUM_PLAYERS; i++) SetDodrioInvisibility(i, invisible, r); }
export function SetDodrioAnim(playerId: number, anim: number, r = req()): void { const id = r.dodrioSpriteIds[playerId]; if (id >= 0) sprite(r, id).anim = anim; }
export function SpriteCB_Status(spriteId: number, r = req()): void { sprite(r, spriteId).data[0]++; }
export function InitStatusBarPos(r = req()): void { r.statusBar.yChange.fill(0); }
export function CreateStatusBarSprites(r = req()): void { for (let i = 0; i < 10; i++) r.statusBar.spriteIds[i] = makeSprite(r, 'SpriteCB_Status', i * 8, 8); }
export function FreeStatusBar(r = req()): void { r.statusBar.spriteIds.forEach(id => { if (id >= 0) destroySprite(r, id); }); r.statusBar.spriteIds.fill(-1); }
export function DoStatusBarIntro(r = req()): void { r.statusBar.entered.fill(true); }
export function UpdateStatusBarAnim(r = req()): void { r.statusBar.flashTimer++; r.statusBar.visible = r.numGraySquares < 10 || (r.statusBar.flashTimer & 1) === 0; }
export function SetStatusBarInvisibility(invisible: boolean, r = req()): void { r.statusBar.visible = !invisible; }
export function LoadBerryGfx(r = req()): void { op(r, 'LoadBerryGfx'); }
export function CreateBerrySprites(r = req()): void { for (let i = 0; i < NUM_BERRY_COLUMNS; i++) r.berrySpriteIds[i] = makeSprite(r, 'BerrySprite', i * 16, 0); for (let i = 0; i < 4; i++) r.berryIconSpriteIds[i] = makeSprite(r, 'BerryIcon', i * 16, 144); }
export function FreeBerrySprites(r = req()): void { [...r.berrySpriteIds, ...r.berryIconSpriteIds].forEach(id => { if (id >= 0) destroySprite(r, id); }); r.berrySpriteIds.fill(-1); r.berryIconSpriteIds.fill(-1); }
export function SetBerryInvisibility(column: number, invisible: boolean, r = req()): void { const id = r.berrySpriteIds[column]; if (id >= 0) sprite(r, id).invisible = invisible; }
export function SetBerryIconsInvisibility(invisible: boolean, r = req()): void { r.berryIconSpriteIds.forEach(id => { if (id >= 0) sprite(r, id).invisible = invisible; }); }
export function SetBerryYPos(column: number, y: number, r = req()): void { const id = r.berrySpriteIds[column]; if (id >= 0) sprite(r, id).y = y; }
export function SetBerryAnim(column: number, anim: number, r = req()): void { const id = r.berrySpriteIds[column]; if (id >= 0) sprite(r, id).anim = anim; }
export function UnusedSetSpritePos(spriteId: number, x: number, y: number, r = req()): void { sprite(r, spriteId).x = x; sprite(r, spriteId).y = y; }
export function SpriteCB_Cloud(spriteId: number, r = req()): void { const sp = sprite(r, spriteId); sp.x = (sp.x + 1) % 256; }
export function CreateCloudSprites(r = req()): void { for (let i = 0; i < r.cloudSpriteIds.length; i++) r.cloudSpriteIds[i] = makeSprite(r, 'SpriteCB_Cloud', i * 120, 24); }
export function ResetCloudPos(r = req()): void { r.cloudSpriteIds.forEach((id, i) => { if (id >= 0) sprite(r, id).x = i * 120; }); }
export function StartCloudMovement(r = req()): void { r.cloudSpriteIds.forEach(id => { if (id >= 0) sprite(r, id).callback = 'SpriteCB_Cloud'; }); }
export function FreeCloudSprites(r = req()): void { r.cloudSpriteIds.forEach(id => { if (id >= 0) destroySprite(r, id); }); r.cloudSpriteIds.fill(-1); }
export function SetCloudInvisibility(invisible: boolean, r = req()): void { r.cloudSpriteIds.forEach(id => { if (id >= 0) sprite(r, id).invisible = invisible; }); }
export function GetDodrioXPos(playerId: number): number { return 40 + playerId * 40; }
export function ResetBerryAndStatusBarSprites(r = req()): void { FreeBerrySprites(r); FreeStatusBar(r); CreateBerrySprites(r); CreateStatusBarSprites(r); }
export function LoadWindowFrameGfx(r = req()): void { op(r, 'LoadWindowFrameGfx'); }
export function DBP_LoadStdWindowGfx(r = req()): void { op(r, 'DBP_LoadStdWindowGfx'); }
export function ResetGfxState(r = req()): void { r.gfx.finished = false; r.gfx.state = 0; r.gfx.loadState = 0; r.gfx.timer = 0; r.gfx.func = null; r.gfx.active = false; }
export function DrawYesNoMessageWindow(message: string, r = req()): void { r.gfx.messages.push(message); r.gfx.cursorSelection = 0; }
export function DrawMessageWindow(message: string, r = req()): void { r.gfx.messages.push(message); }
export function InitGameGfx(r = req()): void { InitBgs(r); LoadBgGfx(r); LoadDodrioGfx(r); LoadBerryGfx(r); CreateBerrySprites(r); CreateStatusBarSprites(r); r.gfx.active = true; }
export function FreeAllWindowBuffers_(r = req()): void { r.gfx.messages = []; op(r, 'FreeAllWindowBuffers_'); }
export function SetGfxFunc(func: string | null, r = req()): void { r.gfx.func = func; r.gfx.active = func !== null; op(r, 'SetGfxFunc', func ?? 'null'); }
export function SetGfxFuncById(funcId: number, r = req()): void { const names = ['LoadGfx','ShowNames','ShowResults','Msg_WantToPlayAgain','Msg_SavingDontTurnOff','Msg_CommunicationStandby','EraseMessage','Msg_SomeoneDroppedOut','StopGfxFuncs','GfxIdle']; r.gfx.func = names[funcId] ?? 'GfxIdle'; r.gfx.state = funcId; }
export function Task_TryRunGfxFunc(r = req()): number { return CreateTask_('Task_TryRunGfxFunc', 0, r); }
export function LoadGfx(r = req()): void { InitGameGfx(r); r.gfx.finished = true; }
export function ShowNames(r = req()): void { r.players.slice(0, r.numPlayers).forEach(p => DrawMessageWindow(p.name, r)); }
export function GetPlayerName(id: number, r = req()): string { return r.players[id]?.name ?? ''; }
export function PrintRankedScores(r = req()): void { SetScoreResults(r); r.scoreResults.slice(0, r.numPlayers).forEach(v => DrawMessageWindow(`${v.ranking}:${v.score}`, r)); }
export function ShowResults(r = req()): void { PrintRankedScores(r); r.gfx.finished = true; }
export function Msg_WantToPlayAgain(r = req()): void { DrawYesNoMessageWindow('Want to play again?', r); }
export function Msg_SavingDontTurnOff(r = req()): void { DrawMessageWindow('Saving... Dont turn off.', r); }
export function Msg_CommunicationStandby(r = req()): void { DrawMessageWindow('Communication standby...', r); }
export function EraseMessage(r = req()): void { r.gfx.messages = []; }
export function Msg_SomeoneDroppedOut(r = req()): void { DrawMessageWindow('Someone dropped out.', r); r.gfx.playAgainState = PLAY_AGAIN_DROPPED; }
export function StopGfxFuncs(r = req()): void { r.gfx.active = false; r.gfx.func = null; }
export function GfxIdle(r = req()): void { r.gfx.finished = true; }
export function IsGfxFuncActive(r = req()): boolean { return r.gfx.active && r.gfx.func !== null; }
export function GetPlayAgainState(r = req()): number { return r.gfx.playAgainState; }
export function InitBgs(r = req()): void { op(r, 'InitBgs'); }
export function LoadBgGfx(r = req()): void { op(r, 'LoadBgGfx'); }
