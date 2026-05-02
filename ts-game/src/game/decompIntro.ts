import {
  createTask,
  createTaskRuntime,
  destroyTask,
  findTaskIdByFunc,
  funcIsActiveTask,
  registerTaskCallback,
  resetTasks,
  runTasks,
  setWordTaskArg,
  getWordTaskArg,
  type TaskRuntime
} from './decompTask';

export const NUM_GENGAR_BACK_SPRITES = 4;
export const MAX_SPRITES = 64;
export const DISPLAY_WIDTH = 240;
export const DISPLAY_HEIGHT = 160;
export const A_BUTTON = 1 << 0;
export const START_BUTTON = 1 << 3;
export const SELECT_BUTTON = 1 << 2;
export const R_BUTTON = 1 << 8;
export const ANIM_NIDORINO_NORMAL = 0;
export const ANIM_NIDORINO_CRY = 1;
export const ANIM_NIDORINO_CROUCH = 2;
export const ANIM_NIDORINO_HOP = 3;
export const ANIM_NIDORINO_ATTACK = 4;
export const ANIM_SPARKLE_LOOP = 0;
export const ANIM_SPARKLE_ONCE = 1;
export const ANIM_SWIPE_BOTTOM = 1;
export const AFFINEANIM_ZOOM = 1;
export const COLOSSEUM_GAME_CODE = 0x65366347;

export interface IntroSprite {
  x: number;
  y: number;
  x2: number;
  y2: number;
  data: number[];
  callback: string;
  invisible: boolean;
  animEnded: boolean;
  anim: number;
  affineAnim: number;
  destroyed: boolean;
  oam: { shape: number; size: number; affineMode: number; tileNum: number };
}

export interface IntroSequenceData {
  callback: string;
  state: number;
  taskId: number;
  gengarAttackLanded: boolean;
  data: number[];
  timer: number;
  gameFreakLogoArtSprite: IntroSprite | null;
  scene3NidorinoSprite: IntroSprite | null;
  scene2GengarSprite: IntroSprite | null;
  scene2NidorinoSprite: IntroSprite | null;
  scene3GrassSprite: IntroSprite | null;
  scene3GengarSprites: (IntroSprite | null)[];
  gameFreakLogoGfx: number[];
  gameFreakTextGfx: number[];
}

export interface IntroRuntime {
  taskRuntime: TaskRuntime;
  mainState: number;
  mainCallback2: string;
  vblankCallback: string;
  hblankCallback: string;
  serialCallback: string;
  paletteFadeActive: boolean;
  blendTaskActive: boolean;
  dmaBusy: boolean;
  tempBusy: boolean;
  newKeys: number;
  sprites: IntroSprite[];
  bgX: Record<number, number>;
  bgY: Record<number, number>;
  gpuRegs: Record<string, number>;
  shownBgs: Set<number>;
  logs: string[];
  gcmbField2: number;
  introData: IntroSequenceData | null;
  ewramGameCode: number;
  sNidorinoJumpMult: number;
  sNidorinoAnimDelayTime: number;
  sNidorinoJumpDiv: number;
  sNidorinoRecoilReturnTime: number;
  sNidorinoUnusedVar: number;
  sStarSpeedX: number;
  sStarSpeedY: number;
  sStarSparklesXmodMask: number;
  sStarSparklesSpawnRate: number;
  sStarSparklesFlickerStartTime: number;
  sStarSparklesDestroySpriteTime: number;
  sStarSparklesGravityShift: number;
  sStarSparklesXspeed: number;
  sStarSparklesYspeed: number;
  sStarSparklesXprecision: number;
  sStarSparklesYprecision: number;
}

const BG_GF_TEXT_LOGO = 2;
const BG_GF_BACKGROUND = 3;
const BG_SCENE1_GRASS = 0;
const BG_SCENE1_BACKGROUND = 1;
const BG_SCENE2_PLANTS = 0;
const BG_SCENE2_NIDORINO = 1;
const BG_SCENE2_GENGAR = 2;
const BG_SCENE2_BACKGROUND = 3;
const BG_SCENE3_GENGAR = 0;
const BG_SCENE3_BACKGROUND = 1;
const sGengarZoomMatrixAnchors = [[63, 63], [0, 63], [63, 0], [0, 0]] as const;
const sTextSparkleCoords = [[72, 80], [136, 74], [168, 80], [120, 80], [104, 86], [88, 74], [184, 74], [56, 86], [152, 86]] as const;
const RAND_MULT = 1103515245;
const sine = (idx: number): number => Math.trunc(Math.sin(((idx & 0xff) / 256) * Math.PI * 2) * 256);
const joyNew = (runtime: IntroRuntime, mask: number): boolean => (runtime.newKeys & mask) !== 0;
let activeRuntime: IntroRuntime | null = null;

const requireRuntime = (runtime?: IntroRuntime): IntroRuntime => {
  const resolved = runtime ?? activeRuntime;
  if (resolved === null) throw new Error('Intro runtime is not active');
  return resolved;
};

const createSprite = (runtime: IntroRuntime, x: number, y: number, callback = 'SpriteCallbackDummy'): IntroSprite => {
  const sprite: IntroSprite = { x, y, x2: 0, y2: 0, data: Array.from({ length: 16 }, () => 0), callback, invisible: false, animEnded: false, anim: 0, affineAnim: 0, destroyed: false, oam: { shape: 0, size: 0, affineMode: 0, tileNum: 0 } };
  runtime.sprites.push(sprite);
  return sprite;
};

const startSpriteAnim = (sprite: IntroSprite | null, anim: number): void => { if (sprite) { sprite.anim = anim; sprite.animEnded = false; } };
const startSpriteAffineAnim = (sprite: IntroSprite | null, anim: number): void => { if (sprite) sprite.affineAnim = anim; };
const destroySprite = (sprite: IntroSprite | null): void => { if (sprite) { sprite.destroyed = true; sprite.callback = 'SpriteCallbackDummy'; } };
const setBgX = (runtime: IntroRuntime, bg: number, value: number): number => { runtime.bgX[bg] = value; return value; };
const changeBgX = (runtime: IntroRuntime, bg: number, value: number, mode: 'set' | 'add' | 'sub'): number => {
  const prev = runtime.bgX[bg] ?? 0;
  const next = mode === 'set' ? value : mode === 'add' ? prev + value : prev - value;
  runtime.bgX[bg] = next >>> 0;
  return runtime.bgX[bg];
};
const changeBgY = (runtime: IntroRuntime, bg: number, value: number, mode: 'set' | 'add' | 'sub'): number => {
  const prev = runtime.bgY[bg] ?? 0;
  const next = mode === 'set' ? value : mode === 'add' ? prev + value : prev - value;
  runtime.bgY[bg] = next >>> 0;
  return runtime.bgY[bg];
};
const showBg = (runtime: IntroRuntime, bg: number): void => { runtime.shownBgs.add(bg); };
const hideBg = (runtime: IntroRuntime, bg: number): void => { runtime.shownBgs.delete(bg); };
const setGpuReg = (runtime: IntroRuntime, reg: string, value: number): void => { runtime.gpuRegs[reg] = value; };
const setCbTask = (runtime: IntroRuntime, name: string, cb: (taskId: number, runtime?: IntroRuntime) => void): void => registerTaskCallback(runtime.taskRuntime, name, (taskId) => cb(taskId, runtime));

export const createIntroRuntime = (): IntroRuntime => {
  const runtime: IntroRuntime = { taskRuntime: createTaskRuntime(), mainState: 0, mainCallback2: '', vblankCallback: '', hblankCallback: '', serialCallback: '', paletteFadeActive: false, blendTaskActive: false, dmaBusy: false, tempBusy: false, newKeys: 0, sprites: [], bgX: {}, bgY: {}, gpuRegs: {}, shownBgs: new Set(), logs: [], gcmbField2: 0, introData: null, ewramGameCode: 0, sNidorinoJumpMult: 0, sNidorinoAnimDelayTime: 0, sNidorinoJumpDiv: 0, sNidorinoRecoilReturnTime: 0, sNidorinoUnusedVar: 0, sStarSpeedX: 0, sStarSpeedY: 0, sStarSparklesXmodMask: 0, sStarSparklesSpawnRate: 0, sStarSparklesFlickerStartTime: 0, sStarSparklesDestroySpriteTime: 0, sStarSparklesGravityShift: 0, sStarSparklesXspeed: 0, sStarSparklesYspeed: 0, sStarSparklesXprecision: 0, sStarSparklesYprecision: 0 };
  [
    ['Task_CallIntroCallback', Task_CallIntroCallback], ['Scene1_Task_AnimateGrass', Scene1_Task_AnimateGrass], ['Scene1_Task_BgZoom', Scene1_Task_BgZoom], ['Scene2_Task_PanForest', Scene2_Task_PanForest], ['Scene2_Task_PanMons', Scene2_Task_PanMons], ['Scene3_Task_BgScroll', Scene3_Task_BgScroll], ['Scene3_Task_GengarBounce', Scene3_Task_GengarBounce], ['GFScene_Task_NameSparklesSmall', GFScene_Task_NameSparklesSmall], ['GFScene_Task_NameSparklesBig', GFScene_Task_NameSparklesBig], ['Scene3_Task_GengarAttack', Scene3_Task_GengarAttack], ['Scene3_Task_GengarEnter', Scene3_Task_GengarEnter]
  ].forEach(([name, fn]) => setCbTask(runtime, name as string, fn as (taskId: number, runtime?: IntroRuntime) => void));
  activeRuntime = runtime;
  return runtime;
};

export function VBlankCB_Copyright(runtime = requireRuntime()): void { runtime.logs.push('VBlankCB_Copyright'); }
export function CB2_WaitFadeBeforeSetUpIntro(runtime = requireRuntime()): void { if (!runtime.paletteFadeActive) runtime.mainCallback2 = 'CB2_SetUpIntro'; }
export function LoadCopyrightGraphics(charBase: number, screenBase: number, palOffset: number, runtime = requireRuntime()): void { runtime.logs.push(`LoadCopyrightGraphics:${charBase}:${screenBase}:${palOffset}`); }
export function SerialCB_CopyrightScreen(runtime = requireRuntime()): void { runtime.logs.push('SerialCB_CopyrightScreen'); }
export function SetUpCopyrightScreen(runtime = requireRuntime()): boolean {
  switch (runtime.mainState) {
    case 0:
      runtime.vblankCallback = 'VBlankCB_Copyright';
      runtime.serialCallback = 'SerialCB_CopyrightScreen';
      LoadCopyrightGraphics(0, 7, 0, runtime);
      runtime.paletteFadeActive = true;
      runtime.mainState += 1;
      break;
    case 140:
      if (runtime.gcmbField2 !== 1) { runtime.paletteFadeActive = true; runtime.mainState += 1; }
      break;
    case 141:
      if (!runtime.paletteFadeActive) {
        runtime.mainState += 1;
        if (runtime.gcmbField2 === 2 && runtime.ewramGameCode === COLOSSEUM_GAME_CODE) runtime.logs.push('GameCubeMultiBoot_ExecuteProgram');
        else if (runtime.gcmbField2 === 0) runtime.serialCallback = 'SerialCB';
        return false;
      }
      break;
    case 142:
      runtime.mainCallback2 = 'CB2_WaitFadeBeforeSetUpIntro';
      break;
    default:
      runtime.mainState += 1;
      break;
  }
  return true;
}
export function CB2_InitCopyrightScreenAfterBootup(runtime = requireRuntime()): void { if (!SetUpCopyrightScreen(runtime)) runtime.logs.push('LoadGameSave'); }
export function CB2_InitCopyrightScreenAfterTitleScreen(runtime = requireRuntime()): void { SetUpCopyrightScreen(runtime); }
export function CB2_SetUpIntro(runtime = requireRuntime()): void {
  switch (runtime.mainState) {
    default: runtime.mainState = 0;
    case 0:
      resetTasks(runtime.taskRuntime); Intro_ResetGpuRegs(runtime); runtime.mainState += 1; break;
    case 1:
      runtime.logs.push('LoadGameFreakScene'); runtime.mainState += 1; break;
    case 2:
      if (!runtime.tempBusy) { StartIntroSequence(runtime); runtime.mainCallback2 = 'CB2_Intro'; runtime.vblankCallback = 'VBlankCB_Intro'; }
      break;
  }
}
export function CB2_Intro(runtime = requireRuntime()): void { runTasks(runtime.taskRuntime); runtime.paletteFadeActive = false; }
export function VBlankCB_Intro(runtime = requireRuntime()): void { runtime.logs.push('VBlankCB_Intro'); }
export function Intro_ResetGpuRegs(runtime = requireRuntime()): void { ['DISPCNT', 'BLDCNT', 'BLDALPHA', 'BLDY', 'BG0HOFS', 'BG0VOFS', 'BG1HOFS', 'BG1VOFS', 'BG2HOFS', 'BG2VOFS', 'BG3HOFS', 'BG3VOFS'].forEach((r) => setGpuReg(runtime, r, 0)); setGpuReg(runtime, 'DISPCNT_BITS', 0x1040); }
export function StartIntroSequence(runtime = requireRuntime()): void { const ptr = createIntroSequenceData(); runtime.introData = ptr; SetIntroCB(ptr, 'IntroCB_Init'); ptr.taskId = createTask(runtime.taskRuntime, 'Task_CallIntroCallback', 3); setWordTaskArg(runtime.taskRuntime, ptr.taskId, 0, 1); }
export function SetIntroCB(ptr: IntroSequenceData, cb: string): void { ptr.callback = cb; ptr.state = 0; }
export function Task_CallIntroCallback(taskId: number, runtime = requireRuntime()): void { const ptr = runtime.introData; if (!ptr) return; getWordTaskArg(runtime.taskRuntime, taskId, 0); if (joyNew(runtime, A_BUTTON | START_BUTTON | SELECT_BUTTON) && ptr.callback !== 'IntroCB_ExitToTitleScreen') SetIntroCB(ptr, 'IntroCB_ExitToTitleScreen'); introCallbacks[ptr.callback](ptr, runtime); }

const createIntroSequenceData = (): IntroSequenceData => ({ callback: 'IntroCB_Init', state: 0, taskId: 0, gengarAttackLanded: false, data: [0, 0, 0, 0, 0], timer: 0, gameFreakLogoArtSprite: null, scene3NidorinoSprite: null, scene2GengarSprite: null, scene2NidorinoSprite: null, scene3GrassSprite: null, scene3GengarSprites: Array.from({ length: NUM_GENGAR_BACK_SPRITES }, () => null), gameFreakLogoGfx: Array.from({ length: 0x400 }, () => 0), gameFreakTextGfx: Array.from({ length: 0x400 }, () => 0) });
const advanceAfterTimer = (ptr: IntroSequenceData, next: string, limit: number): void => { ptr.timer += 1; if (ptr.timer > limit) SetIntroCB(ptr, next); };

export function IntroCB_Init(ptr: IntroSequenceData, runtime = requireRuntime()): void { if (ptr.state === 0) { runtime.logs.push('IntroCB_Init:gfx'); ptr.state += 1; } else if (!runtime.dmaBusy) SetIntroCB(ptr, 'IntroCB_GF_OpenWindow'); }
export function IntroCB_GF_OpenWindow(ptr: IntroSequenceData, runtime = requireRuntime()): void { if (ptr.state === 0) { ptr.timer = 0; ptr.state += 1; } else if (ptr.state === 1) { showBg(runtime, BG_GF_BACKGROUND); ptr.state += 1; } else { ptr.timer = Math.min(48, ptr.timer + 8); setGpuReg(runtime, 'WIN1V', ptr.timer); if (ptr.timer === 48) SetIntroCB(ptr, 'IntroCB_GF_Star'); } }
export function IntroCB_GF_Star(ptr: IntroSequenceData, runtime = requireRuntime()): void { if (ptr.state === 0) { runtime.logs.push('MUS_GAME_FREAK'); GFScene_LoadGfxCreateStar(runtime); ptr.timer = 0; ptr.state += 1; } else if (ptr.state === 1 && ++ptr.timer === 30) { GFScene_StartNameSparklesSmall(runtime); ptr.timer = 0; ptr.state += 1; } else if (ptr.state === 2 && ++ptr.timer === 90) SetIntroCB(ptr, 'IntroCB_GF_RevealName'); }
export function IntroCB_GF_RevealName(ptr: IntroSequenceData, runtime = requireRuntime()): void { if (ptr.state === 0) { GFScene_StartNameSparklesBig(runtime); ptr.timer = 0; ptr.state += 1; } else if (ptr.state === 1 && ++ptr.timer >= 40) ptr.state += 1; else if (ptr.state === 2) { runtime.blendTaskActive = true; ptr.state += 1; } else if (ptr.state === 3) { showBg(runtime, BG_GF_TEXT_LOGO); ptr.state += 1; } else if (ptr.state === 4 && !runtime.blendTaskActive) { ptr.timer = 0; ptr.state += 1; } else if (ptr.state === 5) advanceAfterTimer(ptr, 'IntroCB_GF_RevealLogo', 50); }
export function IntroCB_GF_RevealLogo(ptr: IntroSequenceData, runtime = requireRuntime()): void { if (ptr.state === 0) { runtime.blendTaskActive = true; ptr.timer = 0; ptr.state += 1; } else if (ptr.state === 1) { ptr.gameFreakLogoArtSprite = GFScene_CreateLogoSprite(runtime); ptr.state += 1; } else if (ptr.state === 2 && !runtime.blendTaskActive) ptr.state += 1; else if (ptr.state === 3 && !runtime.dmaBusy) { destroySprite(ptr.gameFreakLogoArtSprite); GFScene_CreatePresentsSprite(runtime); ptr.timer = 0; ptr.state += 1; } else if (ptr.state === 4 && ++ptr.timer > 90) { runtime.blendTaskActive = true; ptr.state += 1; } else if (ptr.state === 5 && !runtime.blendTaskActive) { hideBg(runtime, BG_GF_TEXT_LOGO); ptr.state += 1; } else if (ptr.state === 6) { runtime.sprites = []; ptr.timer = 0; ptr.state += 1; } else if (ptr.state === 7 && ++ptr.timer > 20) SetIntroCB(ptr, 'IntroCB_Scene1'); }
export function IntroCB_Scene1(ptr: IntroSequenceData, runtime = requireRuntime()): void { if (ptr.state === 0) { LoadFightSceneSpriteGraphics(runtime); showBg(runtime, BG_SCENE1_BACKGROUND); hideBg(runtime, BG_SCENE1_GRASS); ptr.state += 1; } else if (ptr.state === 1 && !runtime.tempBusy) ptr.state += 1; else if (ptr.state === 2 && !runtime.tempBusy) { showBg(runtime, BG_SCENE1_GRASS); createTask(runtime.taskRuntime, 'Scene1_Task_AnimateGrass', 0); runtime.paletteFadeActive = true; ptr.state += 1; } else if (ptr.state === 3 && !runtime.paletteFadeActive) { runtime.logs.push('MUS_INTRO_FIGHT'); ptr.timer = 0; ptr.state += 1; } else if (ptr.state === 4) { if (++ptr.timer === 20) { createTask(runtime.taskRuntime, 'Scene1_Task_BgZoom', 0); Scene1_StartGrassScrolling(runtime); } if (ptr.timer >= 30) SetIntroCB(ptr, 'IntroCB_Scene2'); } }
export function Scene1_Task_AnimateGrass(taskId: number, runtime = requireRuntime()): void { const data = runtime.taskRuntime.tasks[taskId].data; if (++data[0] > 5) { data[0] = 0; if (++data[1] >= 3) data[1] = 0; changeBgY(runtime, BG_SCENE1_GRASS, data[1] << 15, 'set'); } if (data[2]) { data[3] += 0x120; changeBgY(runtime, BG_SCENE1_GRASS, data[3], 'sub'); } }
export function Scene1_StartGrassScrolling(runtime = requireRuntime()): void { runtime.taskRuntime.tasks[findTaskIdByFunc(runtime.taskRuntime, 'Scene1_Task_AnimateGrass')].data[2] = 1; }
export function Scene1_Task_BgZoom(taskId: number, runtime = requireRuntime()): void { const data = runtime.taskRuntime.tasks[taskId].data; if (++data[0] > 3) { data[0] = 0; if (data[1] < 2) data[1] += 1; changeBgY(runtime, BG_SCENE1_BACKGROUND, data[1] << 15, 'set'); } }
export function IntroCB_Scene2(ptr: IntroSequenceData, runtime = requireRuntime()): void { if (ptr.state === 0) { showBg(runtime, BG_SCENE2_BACKGROUND); ptr.state += 1; } else if (ptr.state === 1 && !runtime.tempBusy) { showBg(runtime, BG_SCENE2_PLANTS); hideBg(runtime, BG_SCENE2_NIDORINO); hideBg(runtime, BG_SCENE2_GENGAR); createTask(runtime.taskRuntime, 'Scene2_Task_PanForest', 0); Scene2_CreateMonSprites(ptr, runtime); ptr.state += 1; } else if (ptr.state === 2 && !runtime.tempBusy) { runtime.paletteFadeActive = true; ptr.state += 1; } else if (ptr.state === 3 && !runtime.paletteFadeActive) { ptr.timer = 0; ptr.state += 1; } else if (ptr.state === 4 && ++ptr.timer >= 60) { destroyTask(runtime.taskRuntime, findTaskIdByFunc(runtime.taskRuntime, 'Scene2_Task_PanForest')); Scene2_DestroyMonSprites(ptr); createTask(runtime.taskRuntime, 'Scene2_Task_PanMons', 0); ptr.timer = 0; ptr.state += 1; } else if (ptr.state === 5 && !runtime.dmaBusy) { ptr.timer = 0; ptr.state += 1; } else if (ptr.state === 6 && ++ptr.timer >= 60) SetIntroCB(ptr, 'IntroCB_Scene3_Entrance'); }
export function Scene2_Task_PanForest(_taskId: number, runtime = requireRuntime()): void { changeBgX(runtime, BG_SCENE2_BACKGROUND, 0x0e0, 'sub'); changeBgX(runtime, BG_SCENE2_PLANTS, 0x110, 'add'); }
export function Scene2_Task_PanMons(_taskId: number, runtime = requireRuntime()): void { changeBgY(runtime, BG_SCENE2_GENGAR, 0x020, 'add'); changeBgY(runtime, BG_SCENE2_NIDORINO, 0x024, 'sub'); }
export function Scene2_CreateMonSprites(ptr: IntroSequenceData, runtime = requireRuntime()): void { ptr.scene2NidorinoSprite = createSprite(runtime, 168, 80); ptr.scene2GengarSprite = createSprite(runtime, 72, 80); }
export function Scene2_DestroyMonSprites(ptr: IntroSequenceData): void { destroySprite(ptr.scene2GengarSprite); destroySprite(ptr.scene2NidorinoSprite); }
export function IntroCB_Scene3_Entrance(ptr: IntroSequenceData, runtime = requireRuntime()): void { if (ptr.state === 0) { showBg(runtime, BG_SCENE3_BACKGROUND); hideBg(runtime, BG_SCENE3_GENGAR); ptr.state += 1; } else if (ptr.state === 1 && !runtime.tempBusy) { changeBgX(runtime, BG_SCENE3_GENGAR, 0x1800, 'set'); changeBgY(runtime, BG_SCENE3_GENGAR, 0x1f000, 'set'); ptr.state += 1; } else if (ptr.state === 2 && !runtime.tempBusy) { showBg(runtime, BG_SCENE3_GENGAR); createTask(runtime.taskRuntime, 'Scene3_Task_GengarBounce', 0); Scene3_CreateNidorinoSprite(ptr, runtime); Scene3_StartNidorinoEntrance(ptr.scene3NidorinoSprite!, 0, 180, 52); createTask(runtime.taskRuntime, 'Scene3_Task_GengarEnter', 0); Scene3_StartBgScroll(runtime); ptr.timer = 0; ptr.state += 1; } else if (ptr.state === 3) { if (++ptr.timer === 16) Scene3_CreateGrassSprite(ptr, runtime); if (!Scene3_IsNidorinoEntering(ptr) && !funcIsActiveTask(runtime.taskRuntime, 'Scene3_Task_GengarEnter')) SetIntroCB(ptr, 'IntroCB_Scene3_Fight'); } }
export function Scene3_Task_BgScroll(taskId: number, runtime = requireRuntime()): void { changeBgX(runtime, BG_SCENE3_BACKGROUND, runtime.taskRuntime.tasks[taskId].data[0] ? 0x020 : 0x400, 'sub'); }
export function Scene3_StartBgScroll(runtime = requireRuntime()): void { createTask(runtime.taskRuntime, 'Scene3_Task_BgScroll', 0); }
export function Scene3_SlowBgScroll(runtime = requireRuntime()): void { runtime.taskRuntime.tasks[findTaskIdByFunc(runtime.taskRuntime, 'Scene3_Task_BgScroll')].data[0] = 1; }
export function Scene3_Task_GengarBounce(taskId: number, runtime = requireRuntime()): void { const data = runtime.taskRuntime.tasks[taskId].data; if (!data[0] && ++data[1] >= 30) { data[1] = 0; data[2] ^= 1; changeBgY(runtime, BG_SCENE3_GENGAR, (data[2] << 15) + 0x1f000, 'set'); } }
export function Scene3_PauseGengarBounce(runtime = requireRuntime()): void { runtime.taskRuntime.tasks[findTaskIdByFunc(runtime.taskRuntime, 'Scene3_Task_GengarBounce')].data[0] = 1; }
export function Scene3_ResumeGengarBounce(runtime = requireRuntime()): void { runtime.taskRuntime.tasks[findTaskIdByFunc(runtime.taskRuntime, 'Scene3_Task_GengarBounce')].data[0] = 0; }
export function Scene3_IsGengarMidBounce(runtime = requireRuntime()): boolean { return !!runtime.taskRuntime.tasks[findTaskIdByFunc(runtime.taskRuntime, 'Scene3_Task_GengarBounce')].data[2]; }
export function Scene3_CreateGrassSprite(ptr: IntroSequenceData, runtime = requireRuntime()): void { ptr.scene3GrassSprite = createSprite(runtime, 296, 112, 'SpriteCB_Grass'); }
export function SpriteCB_Grass(sprite: IntroSprite, runtime = requireRuntime()): void { if (sprite.data[0] === 0) { sprite.data[1] = sprite.x << 5; sprite.data[2] = 160; sprite.data[0] += 1; } if (sprite.data[0] === 1) { sprite.data[1] -= sprite.data[2]; sprite.x = sprite.data[1] >> 5; if (sprite.x <= 52) { Scene3_SlowBgScroll(runtime); sprite.data[0] += 1; } } else if (sprite.data[0] === 2) { sprite.data[1] -= 32; sprite.x = sprite.data[1] >> 5; if (sprite.x <= -32) destroySprite(sprite); } }
export function IntroCB_Scene3_Fight(ptr: IntroSequenceData, runtime = requireRuntime()): void { if (ptr.state === 0) { ptr.timer = 0; ptr.state += 1; } else if (ptr.state === 1 && ++ptr.timer > 30) { Scene3_StartNidorinoCry(ptr); ptr.state += 1; } else if (ptr.state === 2 && !Scene3_NidorinoAnimIsRunning(ptr)) { ptr.timer = 0; ptr.state += 1; } else if (ptr.state === 3 && ++ptr.timer > 30) { Scene3_PauseGengarBounce(runtime); Scene3_StartGengarAttack(ptr, runtime); ptr.timer = 0; ptr.state += 1; } else if (ptr.state === 4 && ptr.gengarAttackLanded) { Scene3_StartNidorinoRecoil(ptr, runtime); ptr.state += 1; } else if (ptr.state === 15 && ++ptr.timer > 60) SetIntroCB(ptr, 'IntroCB_ExitToTitleScreen'); else if (ptr.state > 4) ptr.state += 1; }
export function Scene3_CalcCenterToCornerVec(sprite: IntroSprite): void { sprite.data[15] = 1; }
export function Scene3_CreateGengarSprite(ptr: IntroSequenceData, runtime = requireRuntime()): void { for (let i = 0; i < NUM_GENGAR_BACK_SPRITES; i += 1) { const sprite = createSprite(runtime, (i & 1) * 48 + 49, Math.floor(i / 2) * 64 + 72); startSpriteAnim(sprite, i); ptr.scene3GengarSprites[i] = sprite; Scene3_CalcCenterToCornerVec(sprite); } }
export function Scene3_NidorinoZoom(ptr: IntroSequenceData): void { const s = ptr.scene3NidorinoSprite!; s.x += s.x2; s.y += s.y2; s.callback = 'SpriteCallbackDummy'; startSpriteAffineAnim(s, AFFINEANIM_ZOOM); }
export function SpriteCB_Idle(_sprite: IntroSprite): void {}
export function Scene3_GengarZoom(ptr: IntroSequenceData): void { ptr.scene3GengarSprites.forEach((s, i) => { if (s) { startSpriteAffineAnim(s, AFFINEANIM_ZOOM); s.callback = 'SpriteCB_Idle'; s.data[14] = sGengarZoomMatrixAnchors[i][0]; s.data[15] = sGengarZoomMatrixAnchors[i][1]; } }); }
export function IntroCB_ExitToTitleScreen(ptr: IntroSequenceData, runtime = requireRuntime()): void { if (ptr.state === 0) ptr.state += 1; else if (!runtime.tempBusy) { destroyTask(runtime.taskRuntime, ptr.taskId); runtime.introData = null; runtime.hblankCallback = ''; runtime.mainCallback2 = 'CB2_InitTitleScreen'; } }
export function GFScene_LoadGfxCreateStar(runtime = requireRuntime()): void { runtime.sStarSpeedX = 96; runtime.sStarSpeedY = 16; runtime.sStarSparklesXmodMask = 7; runtime.sStarSparklesSpawnRate = 8; runtime.sStarSparklesFlickerStartTime = 90; runtime.sStarSparklesDestroySpriteTime = 120; runtime.sStarSparklesXspeed = 1; runtime.sStarSparklesYspeed = 1; runtime.sStarSparklesXprecision = 5; runtime.sStarSparklesYprecision = 5; const s = createSprite(runtime, 248, 55, 'SpriteCB_Star'); s.data[0] = 248 << 4; s.data[1] = 55 << 4; s.data[2] = runtime.sStarSpeedX; s.data[3] = runtime.sStarSpeedY; s.data[6] = 354128453 & 0xffff; s.data[7] = 354128453 >>> 16; }
export function GFScene_CreateStarSparkle(x: number, y: number, random: number, runtime = requireRuntime()): void { const xMod = (random & runtime.sStarSparklesXmodMask) + 2; if (x + xMod > 0 && x + xMod < DISPLAY_WIDTH) { const s = createSprite(runtime, x + xMod, y, 'SpriteCB_SparklesSmall_Star'); s.data[0] = s.x << runtime.sStarSparklesXprecision; s.data[1] = s.y << runtime.sStarSparklesYprecision; s.data[2] = runtime.sStarSparklesXspeed * xMod; } }
export function GFScene_StartNameSparklesSmall(runtime = requireRuntime()): void { createTask(runtime.taskRuntime, 'GFScene_Task_NameSparklesSmall', 1); }
export function GFScene_Task_NameSparklesSmall(taskId: number, runtime = requireRuntime()): void { const data = runtime.taskRuntime.tasks[taskId].data; data[2] += 1; data[3] += 1; if (data[2] > 6) { data[2] = 0; const i = data[0]; const s = createSprite(runtime, sTextSparkleCoords[i][0], sTextSparkleCoords[i][1], 'SpriteCB_SparklesSmall_Name'); startSpriteAnim(s, ANIM_SPARKLE_ONCE); s.data[1] = s.y << 4; s.data[2] = 120; s.data[3] = data[1] < 0 ? 1 : data[1]; if (++data[0] >= sTextSparkleCoords.length) { if (++data[1] > 1) destroyTask(runtime.taskRuntime, taskId); else data[0] = 0; } } }
export function GFScene_StartNameSparklesBig(runtime = requireRuntime()): void { createTask(runtime.taskRuntime, 'GFScene_Task_NameSparklesBig', 2); }
export function GFScene_Task_NameSparklesBig(taskId: number, runtime = requireRuntime()): void { const data = runtime.taskRuntime.tasks[taskId].data; if (data[0] === 0) { const i = data[1]; data[1] = (data[1] + 4) % sTextSparkleCoords.length; createSprite(runtime, sTextSparkleCoords[i][0], sTextSparkleCoords[i][1], 'SpriteCB_SparklesBig'); if (++data[2] >= sTextSparkleCoords.length) destroyTask(runtime.taskRuntime, taskId); } if (++data[0] > 9) data[0] = 0; }
export function GFScene_CreateLogoSprite(runtime = requireRuntime()): IntroSprite { return createSprite(runtime, 120, 70); }
export function GFScene_CreatePresentsSprite(runtime = requireRuntime()): void { createSprite(runtime, 104, 108); createSprite(runtime, 136, 108).oam.tileNum += 4; }
export function Scene3_StartGengarAttack(ptr: IntroSequenceData, runtime = requireRuntime()): void { ptr.gengarAttackLanded = false; const taskId = createTask(runtime.taskRuntime, 'Scene3_Task_GengarAttack', 4); setWordTaskArg(runtime.taskRuntime, taskId, 5, 1); runtime.taskRuntime.tasks[taskId].data[3] = 64; runtime.taskRuntime.tasks[taskId].data[4] = runtime.bgX[BG_SCENE3_GENGAR] ?? 0; }
export function Scene3_ApplyGengarAnim(frame: number, xSub: number, ySub: number, xBase: number, runtime = requireRuntime()): void { changeBgY(runtime, BG_SCENE3_GENGAR, (frame << 15) + 0x1f000, 'set'); setBgX(runtime, BG_SCENE3_GENGAR, xBase - (xSub << 8)); changeBgY(runtime, BG_SCENE3_GENGAR, ySub << 8, 'sub'); }
export function Scene3_Task_GengarAttack(taskId: number, runtime = requireRuntime()): void { const d = runtime.taskRuntime.tasks[taskId].data; if (d[0] === 0) { d[7] = 2; d[1] = 0; d[8] = 6; d[9] = 32; d[0] += 1; } else if (d[0] === 1) { d[3] -= 2; if (++d[1] > 15) { d[1] = 0; d[0] += 1; } } else if (d[0] === 2) { if (++d[1] === 14 && runtime.introData) runtime.introData.gengarAttackLanded = true; if (d[1] > 15) { d[1] = 0; d[0] += 1; } } else if (d[0] === 3) { d[3] += 8; if (++d[1] === 4) { Scene3_CreateGengarSwipeSprites(runtime); d[8] = 32; d[9] = 48; d[7] = 3; } if (d[1] > 7) { d[1] = 0; d[0] += 1; } } else if (d[0] === 4) { d[3] -= 8; if (++d[1] > 3) { d[7] = 0; d[3] = 64; d[1] = 0; d[0] += 1; } } else { destroyTask(runtime.taskRuntime, taskId); return; } Scene3_ApplyGengarAnim(d[7], -((sine(d[3] + 64) * d[9]) >> 8), d[8] - ((sine(d[3]) * d[8]) >> 8), d[4], runtime); }
export function Scene3_CreateGengarSwipeSprites(runtime = requireRuntime()): void { createSprite(runtime, 132, 78, 'SpriteCB_GengarSwipe'); const bottom = createSprite(runtime, 132, 118, 'SpriteCB_GengarSwipe'); startSpriteAnim(bottom, ANIM_SWIPE_BOTTOM); }
export function SpriteCB_GengarSwipe(sprite: IntroSprite): void { sprite.invisible = !sprite.invisible; if (sprite.animEnded) destroySprite(sprite); }
export function Scene3_Task_GengarEnter(taskId: number, runtime = requireRuntime()): void { const d = runtime.taskRuntime.tasks[taskId].data; if (d[0] === 0) { d[1] = 0x400; d[0] += 1; } if (++d[2] >= 40 && d[1] > 16) d[1] -= 16; const scroll = changeBgX(runtime, BG_SCENE3_GENGAR, d[1], 'add'); if (scroll >= 0xef00) { changeBgX(runtime, BG_SCENE3_GENGAR, 0xef00, 'set'); destroyTask(runtime.taskRuntime, taskId); } }
export function SpriteCB_Star(sprite: IntroSprite, runtime = requireRuntime()): void { sprite.data[0] -= sprite.data[2]; sprite.data[1] += sprite.data[3]; sprite.data[4] += 48; sprite.x = sprite.data[0] >> 4; sprite.y = sprite.data[1] >> 4; sprite.y2 = sine((sprite.data[4] >> 4) + 64) >> 5; sprite.data[5] += 1; if (sprite.data[5] % runtime.sStarSparklesSpawnRate) GFScene_CreateStarSparkle(sprite.x, sprite.y + sprite.y2, ((sprite.data[7] << 16) | sprite.data[6]) >>> 16, runtime); if (sprite.x < -8) destroySprite(sprite); }
export function SpriteCB_SparklesSmall_Star(sprite: IntroSprite, runtime = requireRuntime()): void { sprite.data[0] += sprite.data[2]; sprite.data[1] += sprite.data[3]; sprite.data[5] += ++sprite.data[4]; sprite.data[7] += 1; sprite.x = sprite.data[0] >> runtime.sStarSparklesXprecision; sprite.y = sprite.data[1] >> runtime.sStarSparklesYprecision; if (sprite.data[7] > runtime.sStarSparklesFlickerStartTime) { sprite.invisible = !sprite.invisible; if (sprite.data[7] > runtime.sStarSparklesDestroySpriteTime) destroySprite(sprite); } if (sprite.y + sprite.y2 < 0 || sprite.y + sprite.y2 > DISPLAY_HEIGHT) destroySprite(sprite); }
export function SpriteCB_SparklesSmall_Name(sprite: IntroSprite): void { if (sprite.data[2]) { sprite.data[2] -= 1; sprite.data[1] += 1; sprite.y = sprite.data[1] >> 4; if (sprite.y > 86) { sprite.y = 74; sprite.data[1] = 74 << 4; } } else { if (sprite.data[3]) destroySprite(sprite); if (++sprite.data[4] > 50) destroySprite(sprite); } }
export function SpriteCB_SparklesBig(sprite: IntroSprite): void { if (sprite.animEnded) destroySprite(sprite); }
export function Scene3_CreateNidorinoSprite(ptr: IntroSequenceData, runtime = requireRuntime()): void { ptr.scene3NidorinoSprite = createSprite(runtime, 0, 0); }
export function Scene3_StartNidorinoEntrance(sprite: IntroSprite, xStart: number, x1: number, time: number): void { sprite.data[0] = xStart << 4; sprite.data[1] = Math.trunc(((x1 - xStart) << 4) / time); sprite.data[2] = time; sprite.data[3] = x1; sprite.data[4] = 0; sprite.x = xStart; sprite.y = 100; sprite.callback = 'Scene3_SpriteCB_NidorinoEnter'; }
export function Scene3_SpriteCB_NidorinoEnter(sprite: IntroSprite): void { if (++sprite.data[4] >= 40 && sprite.data[1] > 1) sprite.data[1] -= 1; sprite.data[0] += sprite.data[1]; sprite.x = sprite.data[0] >> 4; if (sprite.x >= sprite.data[3]) { sprite.x = sprite.data[3]; sprite.callback = 'SpriteCallbackDummy'; } }
export function Scene3_IsNidorinoEntering(ptr: IntroSequenceData): boolean { return ptr.scene3NidorinoSprite?.callback === 'Scene3_SpriteCB_NidorinoEnter'; }
export function Scene3_StartNidorinoCry(ptr: IntroSequenceData): void { const s = ptr.scene3NidorinoSprite!; startSpriteAnim(s, ANIM_NIDORINO_CROUCH); s.data[0] = 0; s.data[1] = 0; s.y2 = 3; s.callback = 'SpriteCB_NidorinoCry'; }
export function SpriteCB_NidorinoCry(sprite: IntroSprite, runtime = requireRuntime()): void { if (sprite.data[0] === 0 && ++sprite.data[1] > 8) { startSpriteAnim(sprite, ANIM_NIDORINO_CRY); sprite.y2 = 0; sprite.data[0] += 1; } else if (sprite.data[0] === 1) { runtime.logs.push('Cry:Nidorino'); sprite.data[1] = 0; sprite.data[0] += 1; } else if (sprite.data[0] === 2) { if (++sprite.data[2] > 1) { sprite.data[2] = 0; sprite.y2 = sprite.y2 === 0 ? 1 : 0; } if (++sprite.data[1] > 48) { startSpriteAnim(sprite, ANIM_NIDORINO_NORMAL); sprite.y2 = 0; sprite.callback = 'SpriteCallbackDummy'; } } }
export function Scene3_StartNidorinoRecoil(ptr: IntroSequenceData, runtime = requireRuntime()): void { runtime.sNidorinoRecoilReturnTime = 16; runtime.sNidorinoJumpMult = 3; runtime.sNidorinoJumpDiv = 5; runtime.sNidorinoAnimDelayTime = 0; const s = ptr.scene3NidorinoSprite!; startSpriteAnim(s, ANIM_NIDORINO_CROUCH); s.data.fill(0); s.data[7] = 40; s.callback = 'SpriteCB_NidorinoRecoil'; }
export function SpriteCB_NidorinoRecoil(sprite: IntroSprite, runtime = requireRuntime()): void { if (sprite.data[0] === 0 && ++sprite.data[1] > 4) { startSpriteAnim(sprite, ANIM_NIDORINO_HOP); sprite.data[0] += 1; } else if (sprite.data[0] === 1) { sprite.data[2] += sprite.data[7]; sprite.data[3] += 8; sprite.x2 = sprite.data[2] >> 4; sprite.y2 = -((sine(sprite.data[3]) * runtime.sNidorinoJumpMult) >> runtime.sNidorinoJumpDiv); if (++sprite.data[4] > 15) { startSpriteAnim(sprite, ANIM_NIDORINO_CROUCH); sprite.data[1] = 0; sprite.data[6] = 0x4757; sprite.data[7] = 28; sprite.data[0] += 1; } } else if (sprite.data[0] === 2) { sprite.data[2] += sprite.data[7]; sprite.x2 = sprite.data[2] >> 4; if (++sprite.data[1] > 6) { CreateNidorinoRecoilDustSprites(sprite.x + sprite.x2, sprite.y + sprite.y2, sprite.data[6], runtime); sprite.data[6] *= RAND_MULT; } if (sprite.data[1] > 12) { startSpriteAnim(sprite, ANIM_NIDORINO_NORMAL); sprite.data[1] = 0; sprite.data[0] += 1; } } else if (sprite.data[0] === 3 && ++sprite.data[1] > 16) Scene3_StartNidorinoHop(sprite, runtime.sNidorinoRecoilReturnTime, -sprite.x2, 4); }
export function Scene3_NidorinoAnimIsRunning(ptr: IntroSequenceData): boolean { return ptr.scene3NidorinoSprite?.callback !== 'SpriteCallbackDummy'; }
export function CreateNidorinoRecoilDustSprites(x: number, y: number, seed: number, runtime = requireRuntime()): void { for (let i = 0; i < 2; i += 1) { const s = createSprite(runtime, x - 22, y + 24, 'SpriteCB_RecoilDust'); s.data[3] = (seed % 13) + 8; s.data[4] = seed % 3; s.data[7] = i; seed *= RAND_MULT; } }
export function SpriteCB_RecoilDust(sprite: IntroSprite): void { if (sprite.data[0] === 0) { sprite.data[1] = sprite.x << 4; sprite.data[2] = sprite.y << 4; sprite.data[0] += 1; } sprite.data[1] -= sprite.data[3]; sprite.data[2] += sprite.data[4]; sprite.x = sprite.data[1] >> 4; sprite.y = sprite.data[2] >> 4; if (sprite.animEnded) destroySprite(sprite); if (++sprite.data[7] > 1) { sprite.data[7] = 0; sprite.invisible = !sprite.invisible; } }
export function Scene3_StartNidorinoHop(sprite: IntroSprite, time: number, targetX: number, heightShift: number): void { sprite.data[0] = 0; sprite.data[1] = time; sprite.data[2] = sprite.x2 << 4; sprite.data[3] = Math.trunc((targetX << 4) / time); sprite.data[4] = 0; sprite.data[5] = Math.trunc(0x800 / time); sprite.data[6] = 0; sprite.data[7] = heightShift; startSpriteAnim(sprite, ANIM_NIDORINO_CROUCH); sprite.callback = 'SpriteCB_NidorinoHop'; }
export function SpriteCB_NidorinoHop(sprite: IntroSprite): void { if (sprite.data[0] === 0 && ++sprite.data[6] > 4) { startSpriteAnim(sprite, ANIM_NIDORINO_HOP); sprite.data[6] = 0; sprite.data[0] += 1; } else if (sprite.data[0] === 1) { if (--sprite.data[1]) { sprite.data[2] += sprite.data[3]; sprite.data[4] += sprite.data[5]; sprite.x2 = sprite.data[2] >> 4; sprite.y2 = -(sine(sprite.data[4] >> 4) >> sprite.data[7]); } else { sprite.x2 = sprite.data[2] >> 4; sprite.y2 = 0; startSpriteAnim(sprite, ANIM_NIDORINO_CROUCH); if (sprite.data[7] === 5) sprite.callback = 'SpriteCallbackDummy'; else { sprite.data[6] = 0; sprite.data[0] += 1; } } } else if (sprite.data[0] === 2 && ++sprite.data[6] > 4) { startSpriteAnim(sprite, ANIM_NIDORINO_NORMAL); sprite.callback = 'SpriteCallbackDummy'; } }
export function Scene3_StartNidorinoAttack(ptr: IntroSequenceData, runtime = requireRuntime()): void { const s = ptr.scene3NidorinoSprite!; s.data.fill(0); s.x += s.x2; s.x2 = 0; runtime.sNidorinoUnusedVar = 36; runtime.sNidorinoAnimDelayTime = 40; runtime.sNidorinoJumpMult = 3; runtime.sNidorinoJumpDiv = 4; s.data[7] = 36; startSpriteAnim(s, ANIM_NIDORINO_CROUCH); s.callback = 'SpriteCB_NidorinoAttack'; }
export function SpriteCB_NidorinoAttack(sprite: IntroSprite, runtime = requireRuntime()): void { if (sprite.data[0] === 0) { if (++sprite.data[1] & 1) sprite.x2 += (++sprite.data[2] & 1) ? 1 : -1; if (sprite.data[1] > 17) { sprite.data[1] = 0; sprite.data[0] += 1; } } else if (sprite.data[0] === 1) { if (++sprite.data[1] >= runtime.sNidorinoAnimDelayTime) { startSpriteAnim(sprite, ANIM_NIDORINO_ATTACK); sprite.data[1] = 0; sprite.data[2] = 0; sprite.data[0] += 1; } } else if (sprite.data[0] === 2) { sprite.data[1] += sprite.data[7]; sprite.x2 = -(sprite.data[1] >> 4); sprite.y2 = -((sine(sprite.data[1] >> 4) * runtime.sNidorinoJumpMult) >> runtime.sNidorinoJumpDiv); if (sprite.data[7] > 12) sprite.data[7] -= 1; if ((sprite.data[1] >> 4) > 63) sprite.callback = 'SpriteCallbackDummy'; } }
export function LoadFightSceneSpriteGraphics(runtime = requireRuntime()): void { runtime.logs.push('LoadFightSceneSpriteGraphics'); }

const introCallbacks: Record<string, (ptr: IntroSequenceData, runtime: IntroRuntime) => void> = {
  IntroCB_Init, IntroCB_GF_OpenWindow, IntroCB_GF_Star, IntroCB_GF_RevealName, IntroCB_GF_RevealLogo, IntroCB_Scene1, IntroCB_Scene2, IntroCB_Scene3_Entrance, IntroCB_Scene3_Fight, IntroCB_ExitToTitleScreen
};
