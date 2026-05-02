export interface TransitionTask {
  func: keyof typeof battleTransitionTaskHandlers | null;
  data: number[];
  destroyed: boolean;
}

export interface TransitionSprite {
  x: number;
  y: number;
  data: number[];
  invisible: boolean;
  callback: keyof typeof battleTransitionSpriteHandlers | null;
  destroyed: boolean;
}

export interface TransitionData {
  vblankDma: number;
  winIn: number;
  winOut: number;
  win0H: number;
  win0V: number;
  win1H: number;
  win1V: number;
  bldCnt: number;
  bldAlpha: number;
  bldY: number;
  cameraX: number;
  cameraY: number;
  bg0HOfsOpponent: number;
  bg0HOfsPlayer: number;
  bg0VOfs: number;
  unused_1E: number;
  counter: number;
  unused_22: number;
  data: number[];
}

export interface BattleTransitionRuntime {
  sTransitionData: TransitionData | null;
  tasks: TransitionTask[];
  sprites: TransitionSprite[];
  operations: string[];
  scanlineBuffer: number[];
  bg0Tilemap: number[];
  bg0Tiles: number[];
  transitionDone: boolean;
  activeTransitionTaskId: number;
  activeIntroTaskId: number;
  paletteFadeActive: boolean;
  vblankCallback: string | null;
  hblankCallback: string | null;
  trainerPicSlideDone: boolean[];
}

export const B_TRANS_DMA_FLAGS = 1 | (0x9f00 << 16);
export const DISPLAY_WIDTH = 240;
export const DISPLAY_HEIGHT = 160;
export const PALTAG_UNUSED_MUGSHOT = 0x100a;
export const TASK_NONE = 0xff;

let activeRuntime: BattleTransitionRuntime | null = null;
const requireRuntime = (runtime?: BattleTransitionRuntime): BattleTransitionRuntime => {
  const resolved = runtime ?? activeRuntime;
  if (resolved === null) throw new Error('battle transition runtime is not active');
  return resolved;
};
const makeTransitionData = (): TransitionData => ({ vblankDma: 0, winIn: 0, winOut: 0, win0H: 0, win0V: 0, win1H: 0, win1V: 0, bldCnt: 0, bldAlpha: 0, bldY: 0, cameraX: 0, cameraY: 0, bg0HOfsOpponent: 0, bg0HOfsPlayer: 0, bg0VOfs: 0, unused_1E: 0, counter: 0, unused_22: 0, data: Array.from({ length: 11 }, () => 0) });
const td = (runtime: BattleTransitionRuntime): TransitionData => runtime.sTransitionData ?? (runtime.sTransitionData = makeTransitionData());
const op = (runtime: BattleTransitionRuntime, value: string): void => { runtime.operations.push(value); };
const makeTask = (func: keyof typeof battleTransitionTaskHandlers | null): TransitionTask => ({ func, data: Array.from({ length: 16 }, () => 0), destroyed: false });
const makeSprite = (callback: keyof typeof battleTransitionSpriteHandlers | null): TransitionSprite => ({ x: 0, y: 0, data: Array.from({ length: 8 }, () => 0), invisible: false, callback, destroyed: false });
const task = (runtime: BattleTransitionRuntime, taskId: number): TransitionTask => runtime.tasks[taskId] ?? (runtime.tasks[taskId] = makeTask(null));
const sprite = (runtime: BattleTransitionRuntime, spriteId: number): TransitionSprite => runtime.sprites[spriteId] ?? (runtime.sprites[spriteId] = makeSprite(null));
const createTask = (runtime: BattleTransitionRuntime, func: keyof typeof battleTransitionTaskHandlers): number => { const id = runtime.tasks.length; runtime.tasks.push(makeTask(func)); op(runtime, `CreateTask:${func}:${id}`); return id; };
const destroyTask = (runtime: BattleTransitionRuntime, taskId: number): void => { task(runtime, taskId).destroyed = true; task(runtime, taskId).func = null; op(runtime, `DestroyTask:${taskId}`); };
const createSprite = (runtime: BattleTransitionRuntime, cb: keyof typeof battleTransitionSpriteHandlers): number => { const id = runtime.sprites.length; runtime.sprites.push(makeSprite(cb)); op(runtime, `CreateSprite:${cb}:${id}`); return id; };
const destroySprite = (runtime: BattleTransitionRuntime, spriteId: number): void => { sprite(runtime, spriteId).destroyed = true; sprite(runtime, spriteId).callback = null; op(runtime, `DestroySprite:${spriteId}`); };
const stepStateTable = (runtime: BattleTransitionRuntime, taskId: number, funcs: Array<(taskId: number, runtime: BattleTransitionRuntime) => boolean>): void => { const t = task(runtime, taskId); const fn = funcs[t.data[0]] ?? funcs[funcs.length - 1]; if (fn(taskId, runtime)) t.data[0] += 1; };
const stateDoneAfter = (taskId: number, runtime: BattleTransitionRuntime, frames: number, name: string): boolean => { const t = task(runtime, taskId); t.data[1] += 1; op(runtime, `${name}:${t.data[1]}`); return t.data[1] >= frames; };
const setCallbacks = (runtime: BattleTransitionRuntime, vblank: string | null, hblank: string | null = runtime.hblankCallback): void => { runtime.vblankCallback = vblank; runtime.hblankCallback = hblank; };

export function createBattleTransitionRuntime(): BattleTransitionRuntime {
  const runtime: BattleTransitionRuntime = { sTransitionData: null, tasks: [], sprites: [], operations: [], scanlineBuffer: Array.from({ length: 320 }, () => 0), bg0Tilemap: Array.from({ length: 32 * 32 }, () => 0), bg0Tiles: Array.from({ length: 0x1000 }, () => 0), transitionDone: true, activeTransitionTaskId: TASK_NONE, activeIntroTaskId: TASK_NONE, paletteFadeActive: false, vblankCallback: null, hblankCallback: null, trainerPicSlideDone: [false, false] };
  activeRuntime = runtime;
  return runtime;
}

export function BattleTransition_StartOnField(transitionId: number, runtime = requireRuntime()): void { op(runtime, 'Overworld_ChangeMusicToDefault'); BattleTransition_Start(transitionId, runtime); }
export function BattleTransition_Start(transitionId: number, runtime = requireRuntime()): void { InitTransitionData(runtime); runtime.transitionDone = false; LaunchBattleTransitionTask(transitionId, runtime); }
export function IsBattleTransitionDone(runtime = requireRuntime()): boolean { return runtime.transitionDone; }
export function LaunchBattleTransitionTask(transitionId: number, runtime = requireRuntime()): void { const funcs: Array<keyof typeof battleTransitionTaskHandlers> = ['Task_Blur', 'Task_Swirl', 'Task_Shuffle', 'Task_BigPokeball', 'Task_PokeballsTrail', 'Task_ClockwiseWipe', 'Task_Ripple', 'Task_Wave', 'Task_Slice', 'Task_WhiteBarsFade', 'Task_GridSquares', 'Task_AngledWipes', 'Task_Lorelei', 'Task_Bruno', 'Task_Agatha', 'Task_Lance', 'Task_Blue', 'Task_Spiral']; const id = createTask(runtime, 'Task_BattleTransition'); const t = task(runtime, id); t.data[1] = transitionId; t.data[2] = createTask(runtime, funcs[transitionId % funcs.length] ?? 'Task_Blur'); runtime.activeTransitionTaskId = id; }
export function Task_BattleTransition(taskId: number, runtime = requireRuntime()): void { stepStateTable(runtime, taskId, [Transition_StartIntro, Transition_WaitForIntro, Transition_StartMain, Transition_WaitForMain]); }
export function Transition_StartIntro(taskId: number, runtime = requireRuntime()): boolean { CreateIntroTask(0, 0, 2, 2, 2, runtime); task(runtime, taskId).data[3] = runtime.activeIntroTaskId; return true; }
export function Transition_WaitForIntro(_taskId: number, runtime = requireRuntime()): boolean { return IsIntroTaskDone(runtime); }
export function Transition_StartMain(taskId: number, runtime = requireRuntime()): boolean { const mainId = task(runtime, taskId).data[2]; op(runtime, `Transition_StartMain:${mainId}`); return true; }
export function Transition_WaitForMain(taskId: number, runtime = requireRuntime()): boolean { const main = task(runtime, taskId).data[2]; if (task(runtime, main).destroyed) { destroyTask(runtime, taskId); runtime.transitionDone = true; return true; } return false; }

export function Task_Intro(taskId: number, runtime = requireRuntime()): void { Task_BattleTransition_Intro(taskId, runtime); }
export function Task_Blur(taskId: number, runtime = requireRuntime()): void { stepStateTable(runtime, taskId, [Blur_Init, Blur_Main, Blur_End]); }
export function Blur_Init(taskId: number, runtime = requireRuntime()): boolean { setCallbacks(runtime, 'VBlankCB_BattleTransition'); td(runtime).bldCnt = 0x3f40; td(runtime).bldY = 0; return stateDoneAfter(taskId, runtime, 1, 'Blur_Init'); }
export function Blur_Main(taskId: number, runtime = requireRuntime()): boolean { td(runtime).bldY += 2; return stateDoneAfter(taskId, runtime, 8, 'Blur_Main'); }
export function Blur_End(taskId: number, runtime = requireRuntime()): boolean { destroyTask(runtime, taskId); return true; }
export function Task_Swirl(taskId: number, runtime = requireRuntime()): void { stepStateTable(runtime, taskId, [Swirl_Init, Swirl_End]); }
export function Swirl_Init(taskId: number, runtime = requireRuntime()): boolean { setCallbacks(runtime, 'VBlankCB_Swirl', 'HBlankCB_Swirl'); Spiral_UpdateFrame(32, 8, 0, runtime); return stateDoneAfter(taskId, runtime, 1, 'Swirl_Init'); }
export function Swirl_End(taskId: number, runtime = requireRuntime()): boolean { if (stateDoneAfter(taskId, runtime, 16, 'Swirl_End')) { destroyTask(runtime, taskId); return true; } return false; }
export function VBlankCB_Swirl(runtime = requireRuntime()): void { td(runtime).vblankDma = B_TRANS_DMA_FLAGS; op(runtime, 'VBlankCB_Swirl'); }
export function HBlankCB_Swirl(runtime = requireRuntime()): void { op(runtime, 'HBlankCB_Swirl'); }
export function Task_Shuffle(taskId: number, runtime = requireRuntime()): void { stepStateTable(runtime, taskId, [Shuffle_Init, Shuffle_End]); }
export function Shuffle_Init(taskId: number, runtime = requireRuntime()): boolean { setCallbacks(runtime, 'VBlankCB_Shuffle', 'HBlankCB_Shuffle'); return stateDoneAfter(taskId, runtime, 1, 'Shuffle_Init'); }
export function Shuffle_End(taskId: number, runtime = requireRuntime()): boolean { if (stateDoneAfter(taskId, runtime, 12, 'Shuffle_End')) { destroyTask(runtime, taskId); return true; } return false; }
export function VBlankCB_Shuffle(runtime = requireRuntime()): void { td(runtime).vblankDma = B_TRANS_DMA_FLAGS; op(runtime, 'VBlankCB_Shuffle'); }
export function HBlankCB_Shuffle(runtime = requireRuntime()): void { op(runtime, 'HBlankCB_Shuffle'); }
export function Task_BigPokeball(taskId: number, runtime = requireRuntime()): void { stepStateTable(runtime, taskId, [BigPokeball_Init, BigPokeball_SetGfx, PatternWeave_Blend1, PatternWeave_Blend2, PatternWeave_FinishAppear, PatternWeave_CircularMask]); }
export function BigPokeball_Init(taskId: number, runtime = requireRuntime()): boolean { td(runtime).winIn = 0; td(runtime).winOut = 0x3f; return stateDoneAfter(taskId, runtime, 1, 'BigPokeball_Init'); }
export function BigPokeball_SetGfx(taskId: number, runtime = requireRuntime()): boolean { op(runtime, 'BigPokeball_SetGfx'); return stateDoneAfter(taskId, runtime, 1, 'BigPokeball_SetGfx'); }
export function PatternWeave_Blend1(taskId: number, runtime = requireRuntime()): boolean { td(runtime).bldY += 1; return stateDoneAfter(taskId, runtime, 4, 'PatternWeave_Blend1'); }
export function PatternWeave_Blend2(taskId: number, runtime = requireRuntime()): boolean { td(runtime).bldY += 1; return stateDoneAfter(taskId, runtime, 4, 'PatternWeave_Blend2'); }
export function PatternWeave_FinishAppear(taskId: number, runtime = requireRuntime()): boolean { return stateDoneAfter(taskId, runtime, 2, 'PatternWeave_FinishAppear'); }
export function PatternWeave_CircularMask(taskId: number, runtime = requireRuntime()): boolean { SetCircularMask(runtime.scanlineBuffer, 120, 80, Math.max(0, 80 - task(runtime, taskId).data[1] * 4)); if (stateDoneAfter(taskId, runtime, 20, 'PatternWeave_CircularMask')) { destroyTask(runtime, taskId); return true; } return false; }
export function VBlankCB_SetWinAndBlend(runtime = requireRuntime()): void { op(runtime, `VBlankCB_SetWinAndBlend:${td(runtime).win0H}:${td(runtime).win0V}`); }
export function VBlankCB_PatternWeave(runtime = requireRuntime()): void { op(runtime, 'VBlankCB_PatternWeave'); }
export function VBlankCB_CircularMask(runtime = requireRuntime()): void { op(runtime, 'VBlankCB_CircularMask'); }
export function Task_PokeballsTrail(taskId: number, runtime = requireRuntime()): void { stepStateTable(runtime, taskId, [PokeballsTrail_Init, PokeballsTrail_Main, PokeballsTrail_End]); }
export function PokeballsTrail_Init(taskId: number, runtime = requireRuntime()): boolean { FldEff_PokeballTrail(runtime); return stateDoneAfter(taskId, runtime, 1, 'PokeballsTrail_Init'); }
export function PokeballsTrail_Main(taskId: number, runtime = requireRuntime()): boolean { return stateDoneAfter(taskId, runtime, 24, 'PokeballsTrail_Main'); }
export function PokeballsTrail_End(taskId: number, runtime = requireRuntime()): boolean { destroyTask(runtime, taskId); return true; }
export function FldEff_PokeballTrail(runtime = requireRuntime()): boolean { createSprite(runtime, 'SpriteCB_FldEffPokeballTrail'); return false; }
export function SpriteCB_FldEffPokeballTrail(spriteId: number, runtime = requireRuntime()): void { const s = sprite(runtime, spriteId); s.x += 8; s.data[0] += 1; if (s.data[0] > 30) destroySprite(runtime, spriteId); }
export function Task_ClockwiseWipe(taskId: number, runtime = requireRuntime()): void { stepStateTable(runtime, taskId, [ClockwiseWipe_Init, ClockwiseWipe_TopRight, ClockwiseWipe_Right, ClockwiseWipe_Bottom, ClockwiseWipe_Left, ClockwiseWipe_TopLeft, ClockwiseWipe_End]); }
export function ClockwiseWipe_Init(taskId: number, runtime = requireRuntime()): boolean { setCallbacks(runtime, 'VBlankCB_ClockwiseWipe'); return stateDoneAfter(taskId, runtime, 1, 'ClockwiseWipe_Init'); }
export function ClockwiseWipe_TopRight(taskId: number, runtime = requireRuntime()): boolean { td(runtime).win0H += 1; return stateDoneAfter(taskId, runtime, 4, 'ClockwiseWipe_TopRight'); }
export function ClockwiseWipe_Right(taskId: number, runtime = requireRuntime()): boolean { td(runtime).win0V += 1; return stateDoneAfter(taskId, runtime, 4, 'ClockwiseWipe_Right'); }
export function ClockwiseWipe_Bottom(taskId: number, runtime = requireRuntime()): boolean { td(runtime).win0H += 1; return stateDoneAfter(taskId, runtime, 4, 'ClockwiseWipe_Bottom'); }
export function ClockwiseWipe_Left(taskId: number, runtime = requireRuntime()): boolean { td(runtime).win0V += 1; return stateDoneAfter(taskId, runtime, 4, 'ClockwiseWipe_Left'); }
export function ClockwiseWipe_TopLeft(taskId: number, runtime = requireRuntime()): boolean { return stateDoneAfter(taskId, runtime, 4, 'ClockwiseWipe_TopLeft'); }
export function ClockwiseWipe_End(taskId: number, runtime = requireRuntime()): boolean { destroyTask(runtime, taskId); return true; }
export function VBlankCB_ClockwiseWipe(runtime = requireRuntime()): void { op(runtime, 'VBlankCB_ClockwiseWipe'); }
export function Task_Ripple(taskId: number, runtime = requireRuntime()): void { stepStateTable(runtime, taskId, [Ripple_Init, Ripple_Main]); }
export function Ripple_Init(taskId: number, runtime = requireRuntime()): boolean { setCallbacks(runtime, 'VBlankCB_Ripple', 'HBlankCB_Ripple'); return stateDoneAfter(taskId, runtime, 1, 'Ripple_Init'); }
export function Ripple_Main(taskId: number, runtime = requireRuntime()): boolean { SetSinWave(runtime.scanlineBuffer, task(runtime, taskId).data[1], 0, 8, 4, DISPLAY_HEIGHT); if (stateDoneAfter(taskId, runtime, 24, 'Ripple_Main')) { destroyTask(runtime, taskId); return true; } return false; }
export function VBlankCB_Ripple(runtime = requireRuntime()): void { op(runtime, 'VBlankCB_Ripple'); }
export function HBlankCB_Ripple(runtime = requireRuntime()): void { op(runtime, 'HBlankCB_Ripple'); }
export function Task_Wave(taskId: number, runtime = requireRuntime()): void { stepStateTable(runtime, taskId, [Wave_Init, Wave_Main, Wave_End]); }
export function Wave_Init(taskId: number, runtime = requireRuntime()): boolean { setCallbacks(runtime, 'VBlankCB_Wave'); return stateDoneAfter(taskId, runtime, 1, 'Wave_Init'); }
export function Wave_Main(taskId: number, runtime = requireRuntime()): boolean { SetSinWave(runtime.scanlineBuffer, task(runtime, taskId).data[1], 0, 4, 8, DISPLAY_HEIGHT); return stateDoneAfter(taskId, runtime, 16, 'Wave_Main'); }
export function Wave_End(taskId: number, runtime = requireRuntime()): boolean { destroyTask(runtime, taskId); return true; }
export function VBlankCB_Wave(runtime = requireRuntime()): void { op(runtime, 'VBlankCB_Wave'); }
export function Task_Spiral(taskId: number, runtime = requireRuntime()): void { stepStateTable(runtime, taskId, [Spiral_Init, Spiral_End]); }
export function Spiral_UpdateFrame(initRadius: number, deltaAngleMax: number, offsetMaybe: number, runtime = requireRuntime()): void { for (let i = 0; i < DISPLAY_HEIGHT; i += 1) runtime.scanlineBuffer[i] = Math.trunc(Math.sin((i + offsetMaybe) / Math.max(1, deltaAngleMax)) * initRadius); }
export function Spiral_Init(taskId: number, runtime = requireRuntime()): boolean { setCallbacks(runtime, 'VBlankCB_Spiral'); Spiral_UpdateFrame(48, 8, task(runtime, taskId).data[1], runtime); return stateDoneAfter(taskId, runtime, 1, 'Spiral_Init'); }
export function Spiral_End(taskId: number, runtime = requireRuntime()): boolean { Spiral_UpdateFrame(Math.max(0, 48 - task(runtime, taskId).data[1] * 2), 8, task(runtime, taskId).data[1], runtime); if (stateDoneAfter(taskId, runtime, 24, 'Spiral_End')) { destroyTask(runtime, taskId); return true; } return false; }
export function VBlankCB_Spiral(runtime = requireRuntime()): void { op(runtime, 'VBlankCB_Spiral'); }
export function Task_Lorelei(taskId: number, runtime = requireRuntime()): void { DoMugshotTransition(taskId, runtime); }
export function Task_Bruno(taskId: number, runtime = requireRuntime()): void { DoMugshotTransition(taskId, runtime); }
export function Task_Agatha(taskId: number, runtime = requireRuntime()): void { DoMugshotTransition(taskId, runtime); }
export function Task_Lance(taskId: number, runtime = requireRuntime()): void { DoMugshotTransition(taskId, runtime); }
export function Task_Blue(taskId: number, runtime = requireRuntime()): void { DoMugshotTransition(taskId, runtime); }
export function DoMugshotTransition(taskId: number, runtime = requireRuntime()): void { stepStateTable(runtime, taskId, [Mugshot_Init, Mugshot_SetGfx, Mugshot_ShowBanner, Mugshot_StartOpponentSlide, Mugshot_WaitStartPlayerSlide, Mugshot_WaitPlayerSlide, Mugshot_GradualWhiteFade, Mugshot_InitFadeWhiteToBlack, Mugshot_FadeToBlack, Mugshot_End]); }
export function Mugshot_Init(taskId: number, runtime = requireRuntime()): boolean { setCallbacks(runtime, 'VBlankCB_Mugshots', 'HBlankCB_Mugshots'); Mugshots_CreateTrainerPics(taskId, runtime); return stateDoneAfter(taskId, runtime, 1, 'Mugshot_Init'); }
export function Mugshot_SetGfx(taskId: number, runtime = requireRuntime()): boolean { op(runtime, 'Mugshot_SetGfx'); return stateDoneAfter(taskId, runtime, 1, 'Mugshot_SetGfx'); }
export function Mugshot_ShowBanner(taskId: number, runtime = requireRuntime()): boolean { td(runtime).win0H += 8; return stateDoneAfter(taskId, runtime, 8, 'Mugshot_ShowBanner'); }
export function Mugshot_StartOpponentSlide(taskId: number, runtime = requireRuntime()): boolean { IncrementTrainerPicState(task(runtime, taskId).data[8], runtime); return stateDoneAfter(taskId, runtime, 1, 'Mugshot_StartOpponentSlide'); }
export function Mugshot_WaitStartPlayerSlide(taskId: number, runtime = requireRuntime()): boolean { IncrementTrainerPicState(task(runtime, taskId).data[9], runtime); return stateDoneAfter(taskId, runtime, 8, 'Mugshot_WaitStartPlayerSlide'); }
export function Mugshot_WaitPlayerSlide(taskId: number, runtime = requireRuntime()): boolean { return IsTrainerPicSlideDone(task(runtime, taskId).data[8], runtime) && IsTrainerPicSlideDone(task(runtime, taskId).data[9], runtime); }
export function Mugshot_GradualWhiteFade(taskId: number, runtime = requireRuntime()): boolean { td(runtime).bldY += 1; return stateDoneAfter(taskId, runtime, 16, 'Mugshot_GradualWhiteFade'); }
export function Mugshot_InitFadeWhiteToBlack(taskId: number, runtime = requireRuntime()): boolean { setCallbacks(runtime, 'VBlankCB_MugshotsFadeOut'); td(runtime).bldY = 16; return stateDoneAfter(taskId, runtime, 1, 'Mugshot_InitFadeWhiteToBlack'); }
export function Mugshot_FadeToBlack(taskId: number, runtime = requireRuntime()): boolean { td(runtime).bldY -= 1; return stateDoneAfter(taskId, runtime, 16, 'Mugshot_FadeToBlack'); }
export function Mugshot_End(taskId: number, runtime = requireRuntime()): boolean { destroyTask(runtime, taskId); return true; }
export function VBlankCB_Mugshots(runtime = requireRuntime()): void { op(runtime, 'VBlankCB_Mugshots'); }
export function VBlankCB_MugshotsFadeOut(runtime = requireRuntime()): void { op(runtime, 'VBlankCB_MugshotsFadeOut'); }
export function HBlankCB_Mugshots(runtime = requireRuntime()): void { op(runtime, 'HBlankCB_Mugshots'); }
export function Mugshots_CreateTrainerPics(taskId: number, runtime = requireRuntime()): void { const opponent = createSprite(runtime, 'SpriteCB_MugshotTrainerPic'); const player = createSprite(runtime, 'SpriteCB_MugshotTrainerPic'); task(runtime, taskId).data[8] = opponent; task(runtime, taskId).data[9] = player; SetTrainerPicSlideDirection(opponent, false, runtime); SetTrainerPicSlideDirection(player, true, runtime); }
export function SpriteCB_MugshotTrainerPic(spriteId: number, runtime = requireRuntime()): void { const s = sprite(runtime, spriteId); const funcs = [MugshotTrainerPic_Pause, MugshotTrainerPic_Init, MugshotTrainerPic_Slide, MugshotTrainerPic_SlideSlow, MugshotTrainerPic_SlideOffscreen]; const f = funcs[s.data[0]] ?? MugshotTrainerPic_Pause; if (f(spriteId, runtime)) s.data[0] += 1; }
export function MugshotTrainerPic_Pause(spriteId: number, runtime = requireRuntime()): boolean { return stateSpriteDoneAfter(spriteId, runtime, 1, 'MugshotTrainerPic_Pause'); }
const stateSpriteDoneAfter = (spriteId: number, runtime: BattleTransitionRuntime, frames: number, name: string): boolean => { const s = sprite(runtime, spriteId); s.data[1] += 1; op(runtime, `${name}:${spriteId}:${s.data[1]}`); return s.data[1] >= frames; };
export function MugshotTrainerPic_Init(spriteId: number, runtime = requireRuntime()): boolean { sprite(runtime, spriteId).x = sprite(runtime, spriteId).data[2] ? DISPLAY_WIDTH : -64; sprite(runtime, spriteId).data[1] = 0; return true; }
export function MugshotTrainerPic_Slide(spriteId: number, runtime = requireRuntime()): boolean { const s = sprite(runtime, spriteId); s.x += s.data[2] ? -16 : 16; if ((s.data[2] && s.x <= 144) || (!s.data[2] && s.x >= 32)) { runtime.trainerPicSlideDone[s.data[2] ? 1 : 0] = true; return true; } return false; }
export function MugshotTrainerPic_SlideSlow(spriteId: number, runtime = requireRuntime()): boolean { const s = sprite(runtime, spriteId); s.x += s.data[2] ? -4 : 4; return stateSpriteDoneAfter(spriteId, runtime, 8, 'MugshotTrainerPic_SlideSlow'); }
export function MugshotTrainerPic_SlideOffscreen(spriteId: number, runtime = requireRuntime()): boolean { const s = sprite(runtime, spriteId); s.x += s.data[2] ? -16 : 16; if (s.x < -80 || s.x > DISPLAY_WIDTH + 80) { destroySprite(runtime, spriteId); return true; } return false; }
export function SetTrainerPicSlideDirection(spriteId: number, dirId: boolean | number, runtime = requireRuntime()): void { sprite(runtime, spriteId).data[2] = dirId ? 1 : 0; }
export function IncrementTrainerPicState(spriteId: number, runtime = requireRuntime()): void { sprite(runtime, spriteId).data[0] += 1; sprite(runtime, spriteId).data[1] = 0; }
export function IsTrainerPicSlideDone(spriteId: number, runtime = requireRuntime()): boolean { return runtime.trainerPicSlideDone[sprite(runtime, spriteId).data[2] ? 1 : 0] ?? false; }
export function Task_Slice(taskId: number, runtime = requireRuntime()): void { stepStateTable(runtime, taskId, [Slice_Init, Slice_Main, Slice_End]); }
export function Slice_Init(taskId: number, runtime = requireRuntime()): boolean { setCallbacks(runtime, 'VBlankCB_Slice', 'HBlankCB_Slice'); return stateDoneAfter(taskId, runtime, 1, 'Slice_Init'); }
export function Slice_Main(taskId: number, runtime = requireRuntime()): boolean { SetSinWave(runtime.scanlineBuffer, task(runtime, taskId).data[1], 0, 2, 12, DISPLAY_HEIGHT); return stateDoneAfter(taskId, runtime, 20, 'Slice_Main'); }
export function Slice_End(taskId: number, runtime = requireRuntime()): boolean { destroyTask(runtime, taskId); return true; }
export function VBlankCB_Slice(runtime = requireRuntime()): void { op(runtime, 'VBlankCB_Slice'); }
export function HBlankCB_Slice(runtime = requireRuntime()): void { op(runtime, 'HBlankCB_Slice'); }
export function Task_WhiteBarsFade(taskId: number, runtime = requireRuntime()): void { stepStateTable(runtime, taskId, [WhiteBarsFade_Init, WhiteBarsFade_StartBars, WhiteBarsFade_WaitBars, WhiteBarsFade_BlendToBlack, WhiteBarsFade_End]); }
export function WhiteBarsFade_Init(taskId: number, runtime = requireRuntime()): boolean { setCallbacks(runtime, 'VBlankCB_WhiteBarsFade', 'HBlankCB_WhiteBarsFade'); return stateDoneAfter(taskId, runtime, 1, 'WhiteBarsFade_Init'); }
export function WhiteBarsFade_StartBars(taskId: number, runtime = requireRuntime()): boolean { createSprite(runtime, 'SpriteCB_WhiteBarFade'); return stateDoneAfter(taskId, runtime, 1, 'WhiteBarsFade_StartBars'); }
export function WhiteBarsFade_WaitBars(taskId: number, runtime = requireRuntime()): boolean { return stateDoneAfter(taskId, runtime, 16, 'WhiteBarsFade_WaitBars'); }
export function WhiteBarsFade_BlendToBlack(taskId: number, runtime = requireRuntime()): boolean { td(runtime).bldY += 1; return stateDoneAfter(taskId, runtime, 16, 'WhiteBarsFade_BlendToBlack'); }
export function WhiteBarsFade_End(taskId: number, runtime = requireRuntime()): boolean { destroyTask(runtime, taskId); return true; }
export function VBlankCB_WhiteBarsFade(runtime = requireRuntime()): void { op(runtime, 'VBlankCB_WhiteBarsFade'); }
export function VBlankCB_WhiteBarsFade_Blend(runtime = requireRuntime()): void { op(runtime, 'VBlankCB_WhiteBarsFade_Blend'); }
export function HBlankCB_WhiteBarsFade(runtime = requireRuntime()): void { op(runtime, 'HBlankCB_WhiteBarsFade'); }
export function SpriteCB_WhiteBarFade(spriteId: number, runtime = requireRuntime()): void { const s = sprite(runtime, spriteId); s.x += 16; if (s.x > DISPLAY_WIDTH) destroySprite(runtime, spriteId); }
export function Task_GridSquares(taskId: number, runtime = requireRuntime()): void { stepStateTable(runtime, taskId, [GridSquares_Init, GridSquares_Main, GridSquares_End]); }
export function GridSquares_Init(taskId: number, runtime = requireRuntime()): boolean { return stateDoneAfter(taskId, runtime, 1, 'GridSquares_Init'); }
export function GridSquares_Main(taskId: number, runtime = requireRuntime()): boolean { const n = task(runtime, taskId).data[1]; runtime.bg0Tilemap[n % runtime.bg0Tilemap.length] = 0xf000 | n; return stateDoneAfter(taskId, runtime, 64, 'GridSquares_Main'); }
export function GridSquares_End(taskId: number, runtime = requireRuntime()): boolean { destroyTask(runtime, taskId); return true; }
export function Task_AngledWipes(taskId: number, runtime = requireRuntime()): void { stepStateTable(runtime, taskId, [AngledWipes_Init, AngledWipes_SetWipeData, AngledWipes_DoWipe, AngledWipes_TryEnd, AngledWipes_StartNext]); }
export function AngledWipes_Init(taskId: number, runtime = requireRuntime()): boolean { setCallbacks(runtime, 'VBlankCB_AngledWipes'); return stateDoneAfter(taskId, runtime, 1, 'AngledWipes_Init'); }
export function AngledWipes_SetWipeData(taskId: number, runtime = requireRuntime()): boolean { InitBlackWipe(td(runtime).data, 0, 0, DISPLAY_WIDTH, DISPLAY_HEIGHT, 8, 8); return stateDoneAfter(taskId, runtime, 1, 'AngledWipes_SetWipeData'); }
export function AngledWipes_DoWipe(taskId: number, runtime = requireRuntime()): boolean { return UpdateBlackWipe(td(runtime).data, false, false, runtime) || stateDoneAfter(taskId, runtime, 32, 'AngledWipes_DoWipe'); }
export function AngledWipes_TryEnd(taskId: number, runtime = requireRuntime()): boolean { return stateDoneAfter(taskId, runtime, 2, 'AngledWipes_TryEnd'); }
export function AngledWipes_StartNext(taskId: number, runtime = requireRuntime()): boolean { destroyTask(runtime, taskId); return true; }
export function VBlankCB_AngledWipes(runtime = requireRuntime()): void { op(runtime, 'VBlankCB_AngledWipes'); }
export function CreateIntroTask(fadeToGrayDelay: number, fadeFromGrayDelay: number, numFades: number, fadeToGraySpeed: number, fadeFromGraySpeed: number, runtime = requireRuntime()): void { const id = createTask(runtime, 'Task_BattleTransition_Intro'); const d = task(runtime, id).data; d[1] = fadeToGrayDelay; d[2] = fadeFromGrayDelay; d[3] = numFades; d[4] = fadeToGraySpeed; d[5] = fadeFromGraySpeed; runtime.activeIntroTaskId = id; }
export function IsIntroTaskDone(runtime = requireRuntime()): boolean { return runtime.activeIntroTaskId === TASK_NONE || task(runtime, runtime.activeIntroTaskId).destroyed; }
export function Task_BattleTransition_Intro(taskId: number, runtime = requireRuntime()): void { stepStateTable(runtime, taskId, [TransitionIntro_FadeToGray, TransitionIntro_FadeFromGray]); }
export function TransitionIntro_FadeToGray(taskId: number, runtime = requireRuntime()): boolean { const t = task(runtime, taskId); t.data[6] += t.data[4] || 1; td(runtime).bldY = t.data[6]; if (t.data[6] >= 16) { t.data[6] = 16; return true; } return false; }
export function TransitionIntro_FadeFromGray(taskId: number, runtime = requireRuntime()): boolean { const t = task(runtime, taskId); t.data[6] -= t.data[5] || 1; td(runtime).bldY = t.data[6]; if (t.data[6] <= 0) { t.data[3] -= 1; if (t.data[3] <= 0) { destroyTask(runtime, taskId); runtime.activeIntroTaskId = TASK_NONE; } else t.data[0] = -1; return true; } return false; }
export function InitTransitionData(runtime = requireRuntime()): void { runtime.sTransitionData = makeTransitionData(); runtime.scanlineBuffer.fill(0); setCallbacks(runtime, 'VBlankCB_BattleTransition', null); op(runtime, 'InitTransitionData'); }
export function VBlankCB_BattleTransition(runtime = requireRuntime()): void { const s = td(runtime); op(runtime, `VBlankCB_BattleTransition:${s.winIn}:${s.winOut}:${s.bldY}`); }
export function GetBg0TilemapDst(tilesetPtr: { value?: number[] }, runtime = requireRuntime()): number[] { tilesetPtr.value = runtime.bg0Tilemap; return runtime.bg0Tilemap; }
export function GetBg0TilesDst(tilemapPtr: { value?: number[] }, tilesetPtr: { value?: number[] }, runtime = requireRuntime()): number[] { tilemapPtr.value = runtime.bg0Tilemap; tilesetPtr.value = runtime.bg0Tiles; return runtime.bg0Tiles; }
export function FadeScreenBlack(runtime = requireRuntime()): void { td(runtime).bldY = 16; runtime.paletteFadeActive = true; op(runtime, 'FadeScreenBlack'); }
export function SetSinWave(buffer: number[], offset: number, index: number, frequency: number, amplitude: number, bufSize: number): void { for (let i = 0; i < bufSize; i += 1) buffer[i] = Math.trunc(Math.sin((i + index) / Math.max(1, frequency)) * amplitude + offset); }
export function SetCircularMask(buffer: number[], x: number, y: number, radius: number): void { for (let row = 0; row < DISPLAY_HEIGHT; row += 1) { const dy = row - y; const width = Math.trunc(Math.sqrt(Math.max(0, radius * radius - dy * dy))); buffer[row * 2] = Math.max(0, x - width); buffer[row * 2 + 1] = Math.min(DISPLAY_WIDTH, x + width); } }
export function InitBlackWipe(data: number[], startX: number, startY: number, endX: number, endY: number, stepX: number, stepY: number): void { data[0] = startX; data[1] = startY; data[2] = startX; data[3] = startY; data[4] = endX; data[5] = endY; data[6] = stepX; data[7] = stepY; data[8] = Math.abs(endX - startX); data[9] = Math.abs(endY - startY); data[10] = 0; }
export function UpdateBlackWipe(data: number[], xExact: boolean, yExact: boolean, runtime = requireRuntime()): boolean { const dx = data[4] - data[2]; const dy = data[5] - data[3]; if (dx !== 0) data[2] += Math.sign(dx) * Math.min(Math.abs(dx), Math.abs(data[6])); if (dy !== 0) data[3] += Math.sign(dy) * Math.min(Math.abs(dy), Math.abs(data[7])); if (xExact && Math.abs(data[4] - data[2]) < Math.abs(data[6])) data[2] = data[4]; if (yExact && Math.abs(data[5] - data[3]) < Math.abs(data[7])) data[3] = data[5]; td(runtime).win0H = ((data[2] & 0xff) << 8) | (data[4] & 0xff); td(runtime).win0V = ((data[3] & 0xff) << 8) | (data[5] & 0xff); return data[2] === data[4] && data[3] === data[5]; }

export const battleTransitionTaskHandlers = {
  Task_BattleTransition, Task_Intro, Task_Blur, Task_Swirl, Task_Shuffle, Task_BigPokeball, Task_PokeballsTrail, Task_ClockwiseWipe, Task_Ripple, Task_Wave, Task_Spiral, Task_Lorelei, Task_Bruno, Task_Agatha, Task_Lance, Task_Blue, Task_Slice, Task_WhiteBarsFade, Task_GridSquares, Task_AngledWipes, Task_BattleTransition_Intro
};

export const battleTransitionSpriteHandlers = {
  SpriteCB_FldEffPokeballTrail,
  SpriteCB_MugshotTrainerPic,
  SpriteCB_WhiteBarFade
};
