export const PLAYER_NAME_LENGTH = 7;
export const EOS = 0xff;

export const MALE = 0;
export const FEMALE = 1;

export const SPRITE_TYPE_PIKACHU = 0;
export const SPRITE_TYPE_PLATFORM = 1;

export const MALE_PLAYER_PIC = 0;
export const FEMALE_PLAYER_PIC = 1;
export const RIVAL_PIC = 2;
export const OAK_PIC = 3;

export const PIKACHU_BODY_PLATFORM_LEFT = 0;
export const PIKACHU_EARS_PLATFORM_MIDDLE = 1;
export const PIKACHU_EYES_PLATFORM_RIGHT = 2;
export const NUM_PIKACHU_PLATFORM_SPRITES = 3;

export const WIN_INTRO_TEXTBOX = 0;
export const MENU_B_PRESSED = -1;
export const PALETTES_OBJECTS = 0xffff0000;

export const REG_OFFSET_BLDCNT = 'REG_OFFSET_BLDCNT';
export const REG_OFFSET_BLDALPHA = 'REG_OFFSET_BLDALPHA';
export const REG_OFFSET_BLDY = 'REG_OFFSET_BLDY';
export const REG_OFFSET_DISPCNT = 'REG_OFFSET_DISPCNT';
export const REG_OFFSET_WIN0H = 'REG_OFFSET_WIN0H';
export const REG_OFFSET_WIN0V = 'REG_OFFSET_WIN0V';
export const REG_OFFSET_WININ = 'REG_OFFSET_WININ';
export const REG_OFFSET_WINOUT = 'REG_OFFSET_WINOUT';

export const BLDCNT_TGT1_BG2 = 1 << 2;
export const BLDCNT_TGT1_BG0 = 1;
export const BLDCNT_EFFECT_BLEND = 1 << 6;
export const BLDCNT_TGT2_BG1 = 1 << 9;
export const BLDCNT_TGT2_OBJ = 1 << 12;
export const DISPCNT_OBJ_1D_MAP = 0x0040;
export const DISPCNT_OBJ_ON = 0x1000;
export const DISPCNT_WIN0_ON = 0x2000;
export const PALETTES_ALL = 0xffffffff;
export const A_BUTTON = 0x0001;
export const B_BUTTON = 0x0002;

export const RGB_BLACK = 0x0000;
export const RGB_WHITE = 0x7fff;
export const SE_SELECT = 5;
export const SE_WARP_IN = 39;

export const sMaleNameChoices = [
  'RED',
  'FIRE',
  'ASH',
  'KENE',
  'GEKI',
  'JAK',
  'JANNE',
  'JONN',
  'KAMON',
  'KARL',
  'TAYLOR',
  'OSCAR',
  'HIRO',
  'MAX',
  'JON',
  'RALPH',
  'KAY',
  'TOSH',
  'ROAK'
] as const;

export const sFemaleNameChoices = [
  'RED',
  'FIRE',
  'OMI',
  'JODI',
  'AMANDA',
  'HILLARY',
  'MAKEY',
  'MICHI',
  'PAULA',
  'JUNE',
  'CASSIE',
  'REY',
  'SEDA',
  'KIKO',
  'MINA',
  'NORIE',
  'SAI',
  'MOMO',
  'SUZI'
] as const;

export const sRivalNameChoices = ['GREEN', 'GARY', 'KAZ', 'TORU'] as const;

export interface OakSpeechTask {
  id: number;
  data: number[];
  func: string;
  destroyed: boolean;
}

export interface OakSpeechSprite {
  invisible: boolean;
  x?: number;
  y?: number;
  y2?: number;
  animCmdIndex?: number;
  priority?: number;
  animPaused?: boolean;
  coordOffsetEnabled?: boolean;
  callback?: string;
  data?: number[];
}

export interface OakSpeechResources {
  hasPlayerBeenNamed: boolean;
  shrinkTimer: number;
}

export interface OakSpeechRuntime {
  resources: OakSpeechResources;
  playerGender: number;
  playerName: number[];
  rivalName: number[];
  tasks: OakSpeechTask[];
  sprites: OakSpeechSprite[];
  gpuRegs: Record<string, number>;
  paletteFadeActive: boolean;
  bgAffineCalls: Array<{ bg: number; srcCenterX: number; srcCenterY: number; destCenterX: number; destCenterY: number; scaleX: number; scaleY: number; rotation: number }>;
  bgAttributeCalls: Array<{ bg: number; attr: string; value: number }>;
  paletteBlends: Array<{ start: number; count: number; coefficient: number; color: number }>;
  paletteFades: Array<{ palettes: number; delay: number; startY: number; targetY: number; color: number }>;
  clearDialogWindowAndFrameCalls: Array<{ windowId: number; copyToVram: boolean }>;
  printedMessages: Array<{ text: string; speed: number }>;
  loadedTrainerPics: Array<{ whichPic: number; tileOffset: number; palette: string; paletteOffset: number; tiles: string; vramOffset: number }>;
  trainerPicTilemap: number[] | null;
  fillBgTilemapBufferRectCalls: Array<{ bg: number; value: number; x: number; y: number; width: number; height: number; palette: number }>;
  copyRectToBgTilemapBufferRectCalls: Array<{
    bg: number;
    srcX: number;
    srcY: number;
    srcWidth: number;
    srcHeight: number;
    destX: number;
    destY: number;
    destWidth: number;
    destHeight: number;
    palette: number;
    tileOffset: number;
    mode: number;
  }>;
  copyBgTilemapBufferToVramCalls: number[];
  plttBufferFaded: number[];
  plttBufferUnfaded: number[];
  playedSoundEffects: number[];
  destroyedSpriteTypes: Array<{ taskId: number; spriteType: number }>;
  allWindowBuffersFreed: boolean;
  monSpritesGfxManagerDestroyed: boolean;
  oakSpeechResourcesFreed: boolean;
  textFlagsCanABSpeedUpPrint: boolean;
  mainCallback2: string | null;
  mainState: number;
  mainCallback1: string | null;
  vblankCallback: string | null;
  hblankCallback: string | null;
  mainNewKeys: number;
  menuInput: number;
  nameMenuOptions: string[];
  currentPage: number;
  textSpeed: number;
  textPrinterActive: boolean;
  cryFinished: boolean;
  spriteCoordOffsetX: number;
  spriteCoordOffsetY: number;
  nextSpriteId: number;
  nextWindowId: number;
  namingScreenCalls: Array<{ type: string; dest: 'playerName' | 'rivalName'; gender: number; callback: string }>;
  bgm: string[];
  fadedBgm: number[];
  shownBgs: number[];
  hiddenBgs: number[];
  callbacksRun: string[];
  windowOps: string[];
  createdSpriteTypes: Array<{ taskId: number; spriteType: number; spriteIds: number[] }>;
  nidoranCreated: number[];
}

export const BLDALPHA_BLEND = (target1: number, target2: number): number => ((target2 & 0x1f) << 8) | (target1 & 0x1f);

export const Q_8_8_inv = (y: number): number => Math.trunc(0x10000 / y);

export const stringToBytes = (value: string): number[] => [...value].map((char) => char.charCodeAt(0)).concat(EOS);

export const bytesToString = (bytes: readonly number[]): string => {
  const chars: string[] = [];
  for (const byte of bytes) {
    if (byte === EOS)
      break;
    chars.push(String.fromCharCode(byte));
  }
  return chars.join('');
};

export const createOakSpeechRuntime = (overrides: Partial<OakSpeechRuntime> = {}): OakSpeechRuntime => ({
  resources: { hasPlayerBeenNamed: false, shrinkTimer: 0 },
  playerGender: MALE,
  playerName: Array.from({ length: PLAYER_NAME_LENGTH + 1 }, () => EOS),
  rivalName: Array.from({ length: PLAYER_NAME_LENGTH + 1 }, () => EOS),
  tasks: [],
  sprites: Array.from({ length: 32 }, () => ({ invisible: false, data: Array.from({ length: 8 }, () => 0) })),
  gpuRegs: {},
  paletteFadeActive: false,
  bgAffineCalls: [],
  bgAttributeCalls: [],
  paletteBlends: [],
  paletteFades: [],
  clearDialogWindowAndFrameCalls: [],
  printedMessages: [],
  loadedTrainerPics: [],
  trainerPicTilemap: null,
  fillBgTilemapBufferRectCalls: [],
  copyRectToBgTilemapBufferRectCalls: [],
  copyBgTilemapBufferToVramCalls: [],
  plttBufferFaded: Array.from({ length: 256 }, () => 0),
  plttBufferUnfaded: Array.from({ length: 256 }, () => 0),
  playedSoundEffects: [],
  destroyedSpriteTypes: [],
  allWindowBuffersFreed: false,
  monSpritesGfxManagerDestroyed: false,
  oakSpeechResourcesFreed: false,
  textFlagsCanABSpeedUpPrint: true,
  mainCallback2: null,
  mainState: 0,
  mainCallback1: null,
  vblankCallback: null,
  hblankCallback: null,
  mainNewKeys: 0,
  menuInput: MENU_B_PRESSED,
  nameMenuOptions: [],
  currentPage: 0,
  textSpeed: 0,
  textPrinterActive: false,
  cryFinished: true,
  spriteCoordOffsetX: 0,
  spriteCoordOffsetY: 0,
  nextSpriteId: 0,
  nextWindowId: 0,
  namingScreenCalls: [],
  bgm: [],
  fadedBgm: [],
  shownBgs: [],
  hiddenBgs: [],
  callbacksRun: [],
  windowOps: [],
  createdSpriteTypes: [],
  nidoranCreated: [],
  ...overrides
});

export const createOakSpeechTask = (runtime: OakSpeechRuntime, func: string, id = runtime.tasks.length): OakSpeechTask => {
  const task: OakSpeechTask = {
    id,
    data: Array.from({ length: 16 }, () => 0),
    func,
    destroyed: false
  };
  runtime.tasks[id] = task;
  return task;
};

const setGpuReg = (runtime: OakSpeechRuntime, reg: string, value: number): void => {
  runtime.gpuRegs[reg] = value;
};

const setGpuRegBits = (runtime: OakSpeechRuntime, reg: string, value: number): void => {
  runtime.gpuRegs[reg] = (runtime.gpuRegs[reg] ?? 0) | value;
};

const clearGpuRegBits = (runtime: OakSpeechRuntime, reg: string, value: number): void => {
  runtime.gpuRegs[reg] = (runtime.gpuRegs[reg] ?? 0) & ~value;
};

const destroyTask = (task: OakSpeechTask): void => {
  task.destroyed = true;
};

const playSE = (runtime: OakSpeechRuntime, soundEffect: number): void => {
  runtime.playedSoundEffects.push(soundEffect);
};

const playBGM = (runtime: OakSpeechRuntime, music: string): void => {
  runtime.bgm.push(music);
};

const fadeOutBGM = (runtime: OakSpeechRuntime, speed: number): void => {
  runtime.fadedBgm.push(speed);
};

const showBg = (runtime: OakSpeechRuntime, bg: number): void => {
  runtime.shownBgs.push(bg);
};

const allocWindow = (runtime: OakSpeechRuntime): number => runtime.nextWindowId++;

const createSprite = (runtime: OakSpeechRuntime, x: number, y: number, priority: number): number => {
  const spriteId = runtime.nextSpriteId++;
  runtime.sprites[spriteId] = {
    invisible: false,
    x,
    y,
    y2: 0,
    animCmdIndex: 0,
    priority,
    data: Array.from({ length: 8 }, () => 0)
  };
  return spriteId;
};

const BG_PLTT_ID = (paletteNum: number): number => paletteNum * 16;

const beginNormalPaletteFade = (
  runtime: OakSpeechRuntime,
  palettes: number,
  delay: number,
  startY: number,
  targetY: number,
  color: number
): void => {
  runtime.paletteFades.push({ palettes, delay, startY, targetY, color });
  runtime.paletteFadeActive = true;
};

const clearDialogWindowAndFrame = (runtime: OakSpeechRuntime, windowId: number, copyToVram: boolean): void => {
  runtime.clearDialogWindowAndFrameCalls.push({ windowId, copyToVram });
};

const oakSpeechPrintMessage = (runtime: OakSpeechRuntime, text: string, speed: number): void => {
  runtime.printedMessages.push({ text, speed });
};

const fillBgTilemapBufferRect = (
  runtime: OakSpeechRuntime,
  bg: number,
  value: number,
  x: number,
  y: number,
  width: number,
  height: number,
  palette: number
): void => {
  runtime.fillBgTilemapBufferRectCalls.push({ bg, value, x, y, width, height, palette });
};

const copyRectToBgTilemapBufferRect = (
  runtime: OakSpeechRuntime,
  bg: number,
  srcX: number,
  srcY: number,
  srcWidth: number,
  srcHeight: number,
  destX: number,
  destY: number,
  destWidth: number,
  destHeight: number,
  palette: number,
  tileOffset: number,
  mode: number
): void => {
  runtime.copyRectToBgTilemapBufferRectCalls.push({ bg, srcX, srcY, srcWidth, srcHeight, destX, destY, destWidth, destHeight, palette, tileOffset, mode });
};

const copyBgTilemapBufferToVram = (runtime: OakSpeechRuntime, bg: number): void => {
  runtime.copyBgTilemapBufferToVramCalls.push(bg);
};

const setBgAffine = (
  runtime: OakSpeechRuntime,
  bg: number,
  srcCenterX: number,
  srcCenterY: number,
  destCenterX: number,
  destCenterY: number,
  scaleX: number,
  scaleY: number,
  rotation: number
): void => {
  runtime.bgAffineCalls.push({ bg, srcCenterX, srcCenterY, destCenterX, destCenterY, scaleX, scaleY, rotation });
};

export const PrintNameChoiceOptions = (runtime: OakSpeechRuntime, hasPlayerBeenNamed: boolean): string[] => {
  const textPtrs = hasPlayerBeenNamed
    ? sRivalNameChoices
    : runtime.playerGender === MALE
      ? sMaleNameChoices
      : sFemaleNameChoices;

  const printed = ['NEW NAME'];
  for (let i = 0; i < sRivalNameChoices.length; i++)
    printed.push(textPtrs[i]);
  runtime.nameMenuOptions = printed;
  return printed;
};

export const GetDefaultName = (
  runtime: OakSpeechRuntime,
  hasPlayerBeenNamed: boolean,
  rivalNameChoice: number,
  random: () => number
): void => {
  let src: string;
  const dest = hasPlayerBeenNamed ? runtime.rivalName : runtime.playerName;

  if (hasPlayerBeenNamed === false) {
    if (runtime.playerGender === MALE)
      src = sMaleNameChoices[random() % sMaleNameChoices.length];
    else
      src = sFemaleNameChoices[random() % sFemaleNameChoices.length];
  } else {
    src = sRivalNameChoices[rivalNameChoice];
  }

  const srcBytes = stringToBytes(src);
  let i = 0;
  for (; i < PLAYER_NAME_LENGTH && srcBytes[i] !== EOS; i++)
    dest[i] = srcBytes[i];
  for (; i < PLAYER_NAME_LENGTH + 1; i++)
    dest[i] = EOS;
};

export const CreateFadeInTask = (runtime: OakSpeechRuntime, parentTask: OakSpeechTask, delay: number): OakSpeechTask => {
  setGpuReg(runtime, REG_OFFSET_BLDCNT, BLDCNT_TGT1_BG2 | BLDCNT_EFFECT_BLEND | BLDCNT_TGT2_BG1 | BLDCNT_TGT2_OBJ);
  setGpuReg(runtime, REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(16, 0));
  setGpuReg(runtime, REG_OFFSET_BLDY, 0);
  parentTask.data[2] = 0;

  const child = createOakSpeechTask(runtime, 'Task_SlowFadeIn');
  child.data[0] = parentTask.id;
  child.data[1] = 16;
  child.data[2] = 0;
  child.data[3] = delay;
  child.data[4] = delay;
  for (let i = PIKACHU_BODY_PLATFORM_LEFT; i < NUM_PIKACHU_PLATFORM_SPRITES; i++)
    child.data[7 + i] = parentTask.data[7 + i];
  return child;
};

export const Task_SlowFadeIn = (runtime: OakSpeechRuntime, task: OakSpeechTask): void => {
  let i = 0;
  if (task.data[1] === 0) {
    runtime.tasks[task.data[0]].data[2] = 1;
    destroyTask(task);
    for (i = PIKACHU_BODY_PLATFORM_LEFT; i < NUM_PIKACHU_PLATFORM_SPRITES; i++)
      runtime.sprites[task.data[7 + i]].invisible = true;
  } else if (task.data[4] !== 0) {
    task.data[4]--;
  } else {
    task.data[4] = task.data[3];
    task.data[1]--;
    task.data[2]++;
    if (task.data[1] === 8) {
      for (i = PIKACHU_BODY_PLATFORM_LEFT; i < NUM_PIKACHU_PLATFORM_SPRITES; i++)
        runtime.sprites[task.data[7 + i]].invisible = !runtime.sprites[task.data[7 + i]].invisible;
    }
    setGpuReg(runtime, REG_OFFSET_BLDALPHA, task.data[2] * 256 + task.data[1]);
  }
};

export const CreateFadeOutTask = (runtime: OakSpeechRuntime, parentTask: OakSpeechTask, delay: number): OakSpeechTask => {
  setGpuReg(runtime, REG_OFFSET_BLDCNT, BLDCNT_TGT1_BG2 | BLDCNT_EFFECT_BLEND | BLDCNT_TGT2_BG1 | BLDCNT_TGT2_OBJ);
  setGpuReg(runtime, REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(0, 16));
  setGpuReg(runtime, REG_OFFSET_BLDY, 0);
  parentTask.data[2] = 0;

  const child = createOakSpeechTask(runtime, 'Task_SlowFadeOut');
  child.data[0] = parentTask.id;
  child.data[1] = 0;
  child.data[2] = 16;
  child.data[3] = delay;
  child.data[4] = delay;
  for (let i = PIKACHU_BODY_PLATFORM_LEFT; i < NUM_PIKACHU_PLATFORM_SPRITES; i++)
    child.data[7 + i] = parentTask.data[7 + i];
  return child;
};

export const Task_SlowFadeOut = (runtime: OakSpeechRuntime, task: OakSpeechTask): void => {
  let i = 0;
  if (task.data[1] === 16) {
    if (!runtime.paletteFadeActive) {
      runtime.tasks[task.data[0]].data[2] = 1;
      destroyTask(task);
    }
  } else if (task.data[4] !== 0) {
    task.data[4]--;
  } else {
    task.data[4] = task.data[3];
    task.data[1] += 2;
    task.data[2] -= 2;
    if (task.data[1] === 8) {
      for (i = PIKACHU_BODY_PLATFORM_LEFT; i < NUM_PIKACHU_PLATFORM_SPRITES; i++)
        runtime.sprites[task.data[7 + i]].invisible = !runtime.sprites[task.data[7 + i]].invisible;
    }
    setGpuReg(runtime, REG_OFFSET_BLDALPHA, task.data[2] * 256 + task.data[1]);
  }
};

export const Task_OakSpeech_SetUpShrinkPlayerPic = (runtime: OakSpeechRuntime, task: OakSpeechTask): void => {
  runtime.bgAttributeCalls.push({ bg: 2, attr: 'BG_ATTR_WRAPAROUND', value: 1 });
  task.data[0] = 0;
  task.data[1] = 0;
  task.data[2] = 256;
  task.data[15] = 0;
  task.func = 'Task_OakSpeech_ShrinkPlayerPic';
};

export const Task_OakSpeech_ShrinkPlayerPic = (runtime: OakSpeechRuntime, task: OakSpeechTask): void => {
  let x: number;
  let y: number;

  runtime.resources.shrinkTimer++;
  if (runtime.resources.shrinkTimer % 20 === 0) {
    if (runtime.resources.shrinkTimer === 40)
      playSE(runtime, SE_WARP_IN);
    const oldScaleDelta = task.data[2];
    task.data[2] -= 32;
    x = Q_8_8_inv(oldScaleDelta - 8);
    y = Q_8_8_inv(task.data[2] - 16);
    setBgAffine(runtime, 2, 0x7800, 0x5400, 120, 84, x, y, 0);
    if (task.data[2] <= 96) {
      task.data[15] = 1;
      task.data[0] = 36;
      task.func = 'Task_OakSpeech_FadePlayerPicToBlack';
    }
  }
};

export const Task_OakSpeech_SetUpFadePlayerPicWhite = (runtime: OakSpeechRuntime): OakSpeechTask => {
  const child = createOakSpeechTask(runtime, 'Task_OakSpeech_FadePlayerPicWhite');
  child.data[0] = 8;
  child.data[1] = 0;
  child.data[2] = 8;
  child.data[14] = 0;
  child.data[15] = 0;
  return child;
};

export const Task_OakSpeech_SetUpDestroyPlatformSprites = (runtime: OakSpeechRuntime): OakSpeechTask => {
  const child = createOakSpeechTask(runtime, 'Task_OakSpeech_DestroyPlatformSprites');
  child.data[0] = 0;
  child.data[1] = 0;
  child.data[2] = 0;
  child.data[15] = 0;
  beginNormalPaletteFade(runtime, PALETTES_OBJECTS | 0x0fcf, 4, 0, 16, RGB_BLACK);
  return child;
};

export const Task_OakSpeech_DestroyPlatformSprites = (runtime: OakSpeechRuntime, task: OakSpeechTask): void => {
  if (!runtime.paletteFadeActive) {
    if (task.data[1] !== 0) {
      destroyTask(task);
      DestroyPikachuOrPlatformSprites(runtime, task, SPRITE_TYPE_PLATFORM);
    } else {
      task.data[1]++;
      beginNormalPaletteFade(runtime, 0x0000 | 0xf000, 0, 0, 16, RGB_BLACK);
    }
  }
};

export const Task_OakSpeech_FadePlayerPicWhite = (runtime: OakSpeechRuntime, task: OakSpeechTask): void => {
  if (task.data[0] !== 0) {
    task.data[0]--;
  } else {
    if (task.data[1] <= 0 && task.data[2] !== 0)
      task.data[2]--;
    runtime.paletteBlends.push({ start: BG_PLTT_ID(4), count: 0x20, coefficient: task.data[14], color: RGB_WHITE });
    task.data[14]++;
    task.data[1]--;
    task.data[0] = task.data[2];
    if (task.data[14] > 14) {
      for (let i = 0; i < 32; i++) {
        runtime.plttBufferFaded[i + BG_PLTT_ID(4)] = RGB_WHITE;
        runtime.plttBufferUnfaded[i + BG_PLTT_ID(4)] = RGB_WHITE;
      }
      destroyTask(task);
    }
  }
};

export const Task_OakSpeech_FadePlayerPicToBlack = (runtime: OakSpeechRuntime, task: OakSpeechTask): void => {
  if (task.data[0] !== 0) {
    task.data[0]--;
  } else {
    beginNormalPaletteFade(runtime, 0x0000 | 0x0030, 2, 0, 16, RGB_BLACK);
    task.func = 'Task_OakSpeech_WaitForFade';
  }
};

export const Task_OakSpeech_WaitForFade = (runtime: OakSpeechRuntime, task: OakSpeechTask): void => {
  if (!runtime.paletteFadeActive)
    task.func = 'Task_OakSpeech_FreeResources';
};

export const Task_OakSpeech_FreeResources = (runtime: OakSpeechRuntime, task: OakSpeechTask): void => {
  runtime.allWindowBuffersFreed = true;
  runtime.monSpritesGfxManagerDestroyed = true;
  runtime.oakSpeechResourcesFreed = true;
  runtime.textFlagsCanABSpeedUpPrint = false;
  runtime.mainCallback2 = 'CB2_NewGame';
  destroyTask(task);
};

export const Task_OakSpeech_HandleConfirmNameInput = (
  runtime: OakSpeechRuntime,
  task: OakSpeechTask,
  input: number
): void => {
  switch (input) {
    case 0:
      playSE(runtime, SE_SELECT);
      task.data[3] = 40;
      if (runtime.resources.hasPlayerBeenNamed === false) {
        clearDialogWindowAndFrame(runtime, WIN_INTRO_TEXTBOX, true);
        CreateFadeInTask(runtime, task, 2);
        task.func = 'Task_OakSpeech_FadeOutPlayerPic';
      } else {
        oakSpeechPrintMessage(runtime, 'gOakSpeech_Text_RememberRivalsName', 0);
        task.func = 'Task_OakSpeech_FadeOutRivalPic';
      }
      break;
    case 1:
    case MENU_B_PRESSED:
      playSE(runtime, SE_SELECT);
      if (runtime.resources.hasPlayerBeenNamed === false)
        task.func = 'Task_OakSpeech_FadeOutForPlayerNamingScreen';
      else
        task.func = 'Task_OakSpeech_RepeatNameQuestion';
      break;
  }
};

export const LoadTrainerPic = (runtime: OakSpeechRuntime, whichPic: number, tileOffset: number): void => {
  const pics: Record<number, { palette: string; paletteOffset: number; tiles: string }> = {
    [MALE_PLAYER_PIC]: { palette: 'sOakSpeech_Red_Pal', paletteOffset: BG_PLTT_ID(4), tiles: 'sOakSpeech_Red_Tiles' },
    [FEMALE_PLAYER_PIC]: { palette: 'sOakSpeech_Leaf_Pal', paletteOffset: BG_PLTT_ID(4), tiles: 'sOakSpeech_Leaf_Tiles' },
    [RIVAL_PIC]: { palette: 'sOakSpeech_Rival_Pal', paletteOffset: BG_PLTT_ID(6), tiles: 'sOakSpeech_Rival_Tiles' },
    [OAK_PIC]: { palette: 'sOakSpeech_Oak_Pal', paletteOffset: BG_PLTT_ID(6), tiles: 'sOakSpeech_Oak_Tiles' }
  };
  const pic = pics[whichPic];
  if (!pic)
    return;

  runtime.loadedTrainerPics.push({ whichPic, tileOffset, palette: pic.palette, paletteOffset: pic.paletteOffset, tiles: pic.tiles, vramOffset: 0x600 + tileOffset });
  runtime.trainerPicTilemap = Array.from({ length: 0x60 }, (_, i) => i);
  fillBgTilemapBufferRect(runtime, 2, 0, 0, 0, 32, 32, 16);
  copyRectToBgTilemapBufferRect(runtime, 2, 0, 0, 8, 12, 11, 2, 8, 12, 16, Math.trunc(tileOffset / 64) + 24, 0);
  copyBgTilemapBufferToVram(runtime, 2);
  runtime.trainerPicTilemap = null;
};

export const ClearTrainerPic = (runtime: OakSpeechRuntime): void => {
  fillBgTilemapBufferRect(runtime, 2, 0, 11, 1, 8, 12, 16);
  copyBgTilemapBufferToVram(runtime, 2);
};

export const DestroyPikachuOrPlatformSprites = (
  runtime: OakSpeechRuntime,
  task: OakSpeechTask,
  spriteType: number
): void => {
  for (let i = PIKACHU_BODY_PLATFORM_LEFT; i < NUM_PIKACHU_PLATFORM_SPRITES; i++)
    runtime.sprites[task.data[7 + i]].invisible = true;
  runtime.destroyedSpriteTypes.push({ taskId: task.id, spriteType });
};

export const VBlankCB_NewGameScene = (runtime: OakSpeechRuntime): void => {
  runtime.callbacksRun.push('LoadOam');
  runtime.callbacksRun.push('ProcessSpriteCopyRequests');
  runtime.callbacksRun.push('TransferPlttBuffer');
};

export const CB2_NewGameScene = (runtime: OakSpeechRuntime): void => {
  runtime.callbacksRun.push('RunTasks');
  runtime.callbacksRun.push('RunTextPrinters');
  runtime.callbacksRun.push('AnimateSprites');
  runtime.callbacksRun.push('BuildOamBuffer');
  runtime.callbacksRun.push('UpdatePaletteFade');
};

export const StartNewGameScene = (runtime: OakSpeechRuntime): OakSpeechTask => {
  runtime.plttBufferUnfaded[0] = RGB_BLACK;
  runtime.plttBufferFaded[0] = RGB_BLACK;
  const task = createOakSpeechTask(runtime, 'Task_NewGameScene');
  runtime.mainCallback2 = 'CB2_NewGameScene';
  return task;
};

export const Task_NewGameScene = (runtime: OakSpeechRuntime, task: OakSpeechTask): void => {
  switch (runtime.mainState) {
    case 0:
      runtime.vblankCallback = null;
      runtime.hblankCallback = null;
      runtime.windowOps.push('ResetPaletteFade', 'ScanlineEffect_Stop', 'ResetSpriteData', 'FreeAllSpritePalettes', 'ResetTempTileDataBuffers', 'SetHelpContext:HELPCONTEXT_NEW_GAME');
      break;
    case 1:
      runtime.resources = { hasPlayerBeenNamed: false, shrinkTimer: 0 };
      runtime.windowOps.push('AllocZeroed:sOakSpeechResources', 'CreateMonSpritesGfxManager:1:1');
      break;
    case 2:
      for (const reg of [REG_OFFSET_WIN0H, REG_OFFSET_WIN0V, REG_OFFSET_WININ, REG_OFFSET_WINOUT, REG_OFFSET_BLDCNT, REG_OFFSET_BLDALPHA, REG_OFFSET_BLDY])
        setGpuReg(runtime, reg, 0);
      break;
    case 3:
      runtime.spriteCoordOffsetX = 0;
      runtime.spriteCoordOffsetY = 0;
      runtime.windowOps.push('ResetBgsAndClearDma3BusyFlags', 'InitBgsFromTemplates', 'SetBgTilemapBuffer:1', 'SetBgTilemapBuffer:2');
      break;
    case 4:
      runtime.windowOps.push('InitStandardTextBoxWindows', 'InitTextBoxGfxAndPrinters', 'Menu_LoadStdPalAt', 'LoadPalette:OakSpeechBackground');
      break;
    case 5:
      runtime.textFlagsCanABSpeedUpPrint = true;
      runtime.windowOps.push('DecompressAndCopyTileDataToVram:ControlsGuidePikachuIntro');
      break;
    case 6:
      clearDialogWindowAndFrame(runtime, WIN_INTRO_TEXTBOX, true);
      fillBgTilemapBufferRect(runtime, 1, 0, 0, 0, 32, 32, 0);
      copyBgTilemapBufferToVram(runtime, 1);
      break;
    case 7:
      ControlsGuide_LoadPage1(runtime);
      task.data[5] = createSprite(runtime, 230, 149, 0);
      runtime.paletteBlends.push({ start: 0, count: 256, coefficient: 16, color: RGB_BLACK });
      break;
    case 10:
      beginNormalPaletteFade(runtime, PALETTES_ALL, 0, 16, 0, RGB_BLACK);
      setGpuReg(runtime, REG_OFFSET_DISPCNT, DISPCNT_OBJ_1D_MAP | DISPCNT_OBJ_ON);
      showBg(runtime, 0);
      showBg(runtime, 1);
      runtime.vblankCallback = 'VBlankCB_NewGameScene';
      playBGM(runtime, 'MUS_NEW_GAME_INSTRUCT');
      task.func = 'Task_ControlsGuide_HandleInput';
      runtime.mainState = 0;
      return;
  }
  runtime.mainState++;
};

export const ControlsGuide_LoadPage1 = (runtime: OakSpeechRuntime): void => {
  runtime.windowOps.push('TopBarWindowPrintTwoStrings:gText_Controls:gText_ABUTTONNext');
  runtime.windowOps.push('AddWindow:ControlsGuidePage1');
  runtime.currentPage = 0;
  copyBgTilemapBufferToVram(runtime, 1);
};

export const Task_ControlsGuide_LoadPage = (runtime: OakSpeechRuntime, task: OakSpeechTask): void => {
  if (runtime.currentPage === 0)
    ControlsGuide_LoadPage1(runtime);
  else
    runtime.windowOps.push(`LoadControlsGuidePage:${runtime.currentPage}`);
  beginNormalPaletteFade(runtime, PALETTES_OBJECTS | 0xdfff, -1, 16, 0, RGB_BLACK);
  task.func = 'Task_ControlsGuide_HandleInput';
};

export const Task_ControlsGuide_HandleInput = (runtime: OakSpeechRuntime, task: OakSpeechTask): void => {
  if (runtime.paletteFadeActive)
    return;
  if ((runtime.mainNewKeys & (A_BUTTON | B_BUTTON)) === 0)
    return;
  if ((runtime.mainNewKeys & A_BUTTON) !== 0) {
    task.data[15] = 1;
    if (runtime.currentPage < 2)
      beginNormalPaletteFade(runtime, PALETTES_OBJECTS | 0xdfff, -1, 0, 16, RGB_BLACK);
  } else {
    if (runtime.currentPage === 0)
      return;
    task.data[15] = -1;
    beginNormalPaletteFade(runtime, PALETTES_OBJECTS | 0xdfff, -1, 0, 16, RGB_BLACK);
  }
  playSE(runtime, SE_SELECT);
  task.func = 'Task_ControlsGuide_ChangePage';
};

export const Task_ControlsGuide_ChangePage = (runtime: OakSpeechRuntime, task: OakSpeechTask): void => {
  if (runtime.paletteFadeActive)
    return;
  runtime.currentPage += task.data[15];
  runtime.windowOps.push('ClearControlsGuideWindows');
  if (runtime.currentPage < 3)
    task.func = 'Task_ControlsGuide_LoadPage';
  else {
    beginNormalPaletteFade(runtime, PALETTES_ALL, 2, 0, 16, 0);
    task.func = 'Task_ControlsGuide_Clear';
  }
};

export const Task_ControlsGuide_Clear = (runtime: OakSpeechRuntime, task: OakSpeechTask): void => {
  if (runtime.paletteFadeActive)
    return;
  runtime.windowOps.push('ClearControlsGuideAllWindows');
  fillBgTilemapBufferRect(runtime, 1, 0, 0, 2, 30, 18, 0);
  copyBgTilemapBufferToVram(runtime, 1);
  runtime.sprites[task.data[5]].invisible = true;
  task.data[3] = 32;
  task.func = 'Task_PikachuIntro_LoadPage1';
};

export const Task_PikachuIntro_LoadPage1 = (runtime: OakSpeechRuntime, task: OakSpeechTask): void => {
  if (task.data[3] !== 0) {
    task.data[3]--;
    return;
  }
  playBGM(runtime, 'MUS_NEW_GAME_INTRO');
  runtime.windowOps.push('ClearTopBarWindow', 'TopBarWindowPrintString:gText_ABUTTONNext', 'LoadPikachuIntroTilemap');
  task.data[14] = allocWindow(runtime);
  runtime.currentPage = 0;
  runtime.mainState = 0;
  task.data[15] = 16;
  oakSpeechPrintMessage(runtime, 'sPikachuIntro_Strings[0]', 0);
  task.data[5] = createSprite(runtime, 226, 145, 0);
  CreatePikachuOrPlatformSprites(runtime, task, SPRITE_TYPE_PIKACHU);
  beginNormalPaletteFade(runtime, PALETTES_ALL, 2, 16, 0, 0);
  task.func = 'Task_PikachuIntro_HandleInput';
};

export const Task_PikachuIntro_HandleInput = (runtime: OakSpeechRuntime, task: OakSpeechTask): void => {
  switch (runtime.mainState) {
    case 0:
      if (!runtime.paletteFadeActive) {
        setGpuReg(runtime, REG_OFFSET_WIN0H, 240);
        setGpuReg(runtime, REG_OFFSET_WIN0V, (16 << 8) | 160);
        setGpuRegBits(runtime, REG_OFFSET_DISPCNT, DISPCNT_WIN0_ON);
        runtime.mainState = 1;
      }
      break;
    case 1:
      if ((runtime.mainNewKeys & (A_BUTTON | B_BUTTON)) !== 0) {
        if ((runtime.mainNewKeys & A_BUTTON) !== 0)
          runtime.currentPage++;
        else if (runtime.currentPage !== 0)
          runtime.currentPage--;
        else
          break;
        playSE(runtime, SE_SELECT);
        runtime.mainState = runtime.currentPage === 3 ? 4 : 2;
      }
      break;
    case 2:
      task.data[15] -= 2;
      setGpuReg(runtime, REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(task.data[15], 16 - task.data[15]));
      if (task.data[15] <= 0) {
        oakSpeechPrintMessage(runtime, `sPikachuIntro_Strings[${runtime.currentPage}]`, 0);
        runtime.mainState = 3;
      }
      break;
    case 3:
      task.data[15] += 2;
      setGpuReg(runtime, REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(task.data[15], 16 - task.data[15]));
      if (task.data[15] >= 16) {
        task.data[15] = 16;
        setGpuReg(runtime, REG_OFFSET_BLDCNT, 0);
        setGpuReg(runtime, REG_OFFSET_BLDALPHA, 0);
        runtime.mainState = 1;
      }
      break;
    case 4:
      runtime.sprites[task.data[5]].invisible = true;
      playBGM(runtime, 'MUS_NEW_GAME_EXIT');
      task.data[15] = 24;
      runtime.mainState++;
      break;
    default:
      if (task.data[15] !== 0)
        task.data[15]--;
      else {
        runtime.mainState = 0;
        runtime.currentPage = 0;
        setGpuReg(runtime, REG_OFFSET_WIN0H, 0);
        setGpuReg(runtime, REG_OFFSET_WIN0V, 0);
        clearGpuRegBits(runtime, REG_OFFSET_DISPCNT, DISPCNT_WIN0_ON);
        beginNormalPaletteFade(runtime, PALETTES_ALL, 2, 0, 16, RGB_BLACK);
        task.func = 'Task_PikachuIntro_Clear';
      }
      break;
  }
};

export const Task_PikachuIntro_Clear = (runtime: OakSpeechRuntime, task: OakSpeechTask): void => {
  if (runtime.paletteFadeActive)
    return;
  runtime.windowOps.push('DestroyTopBarWindow', 'ClearPikachuIntroTextbox');
  task.data[14] = 0;
  fillBgTilemapBufferRect(runtime, 1, 0, 0, 0, 30, 20, 0);
  copyBgTilemapBufferToVram(runtime, 1);
  DestroyPikachuOrPlatformSprites(runtime, task, SPRITE_TYPE_PIKACHU);
  task.data[3] = 80;
  task.func = 'Task_OakSpeech_Init';
};

export const Task_OakSpeech_Init = (runtime: OakSpeechRuntime, task: OakSpeechTask): void => {
  if (task.data[3] !== 0) {
    task.data[3]--;
    return;
  }
  runtime.windowOps.push('LoadOakSpeechBackground');
  CreateNidoranFSprite(runtime, task);
  LoadTrainerPic(runtime, OAK_PIC, 0);
  CreatePikachuOrPlatformSprites(runtime, task, SPRITE_TYPE_PLATFORM);
  playBGM(runtime, 'MUS_ROUTE24');
  beginNormalPaletteFade(runtime, PALETTES_ALL, 5, 16, 0, RGB_BLACK);
  task.data[3] = 80;
  showBg(runtime, 2);
  task.func = 'Task_OakSpeech_WelcomeToTheWorld';
};

export const Task_OakSpeech_WelcomeToTheWorld = (runtime: OakSpeechRuntime, task: OakSpeechTask): void => {
  if (runtime.paletteFadeActive)
    return;
  if (task.data[3] !== 0) {
    task.data[3]--;
    return;
  }
  oakSpeechPrintMessage(runtime, 'gOakSpeech_Text_WelcomeToTheWorld', runtime.textSpeed);
  task.func = 'Task_OakSpeech_ThisWorld';
};

export const Task_OakSpeech_ThisWorld = (runtime: OakSpeechRuntime, task: OakSpeechTask): void => {
  if (runtime.textPrinterActive)
    return;
  oakSpeechPrintMessage(runtime, 'gOakSpeech_Text_ThisWorld', runtime.textSpeed);
  task.data[3] = 30;
  task.func = 'Task_OakSpeech_ReleaseNidoranFFromPokeBall';
};

export const Task_OakSpeech_ReleaseNidoranFFromPokeBall = (runtime: OakSpeechRuntime, task: OakSpeechTask): void => {
  if (runtime.textPrinterActive)
    return;
  if (task.data[3] !== 0)
    task.data[3]--;
  const spriteId = task.data[4];
  runtime.sprites[spriteId].invisible = false;
  runtime.sprites[spriteId].data![0] = 0;
  task.data[6] = createSprite(runtime, 100, 66, 0);
  task.func = 'Task_OakSpeech_IsInhabitedFarAndWide';
  task.data[3] = 0;
};

export const Task_OakSpeech_IsInhabitedFarAndWide = (runtime: OakSpeechRuntime, task: OakSpeechTask): void => {
  if (runtime.cryFinished && task.data[3] >= 96)
    task.func = 'Task_OakSpeech_IStudyPokemon';
  if (task.data[3] < 0x4000) {
    task.data[3]++;
    if (task.data[3] === 32) {
      oakSpeechPrintMessage(runtime, 'gOakSpeech_Text_IsInhabitedFarAndWide', runtime.textSpeed);
      runtime.windowOps.push('PlayCry_Normal:INTRO_SPECIES:0');
    }
  }
};

export const Task_OakSpeech_IStudyPokemon = (runtime: OakSpeechRuntime, task: OakSpeechTask): void => {
  if (runtime.textPrinterActive)
    return;
  oakSpeechPrintMessage(runtime, 'gOakSpeech_Text_IStudyPokemon', runtime.textSpeed);
  task.func = 'Task_OakSpeech_ReturnNidoranFToPokeBall';
};

export const Task_OakSpeech_ReturnNidoranFToPokeBall = (runtime: OakSpeechRuntime, task: OakSpeechTask): void => {
  if (runtime.textPrinterActive)
    return;
  clearDialogWindowAndFrame(runtime, WIN_INTRO_TEXTBOX, true);
  task.data[6] = createSprite(runtime, 100, 66, 0);
  task.data[3] = 48;
  task.data[0] = 64;
  task.func = 'Task_OakSpeech_TellMeALittleAboutYourself';
};

export const Task_OakSpeech_TellMeALittleAboutYourself = (runtime: OakSpeechRuntime, task: OakSpeechTask): void => {
  if (task.data[0] !== 0) {
    if (task.data[0] < 24)
      runtime.sprites[task.data[4]].y = (runtime.sprites[task.data[4]].y ?? 0) - 1;
    task.data[0]--;
    return;
  }
  if (task.data[3] === 48) {
    runtime.sprites[task.data[4]].invisible = true;
    runtime.sprites[task.data[6]].invisible = true;
  }
  if (task.data[3] !== 0)
    task.data[3]--;
  else {
    oakSpeechPrintMessage(runtime, 'gOakSpeech_Text_TellMeALittleAboutYourself', runtime.textSpeed);
    task.func = 'Task_OakSpeech_FadeOutOak';
  }
};

export const Task_OakSpeech_FadeOutOak = (runtime: OakSpeechRuntime, task: OakSpeechTask): void => {
  if (runtime.textPrinterActive)
    return;
  clearDialogWindowAndFrame(runtime, WIN_INTRO_TEXTBOX, true);
  CreateFadeInTask(runtime, task, 2);
  task.data[3] = 48;
  task.func = 'Task_OakSpeech_AskPlayerGender';
};

export const Task_OakSpeech_AskPlayerGender = (runtime: OakSpeechRuntime, task: OakSpeechTask): void => {
  if (task.data[2] === 0)
    return;
  if (task.data[3] !== 0) {
    task.data[3]--;
    return;
  }
  task.data[1] = -60;
  ClearTrainerPic(runtime);
  oakSpeechPrintMessage(runtime, 'gOakSpeech_Text_AskPlayerGender', runtime.textSpeed);
  task.func = 'Task_OakSpeech_ShowGenderOptions';
};

export const Task_OakSpeech_ShowGenderOptions = (runtime: OakSpeechRuntime, task: OakSpeechTask): void => {
  if (runtime.textPrinterActive)
    return;
  task.data[13] = allocWindow(runtime);
  runtime.windowOps.push('ShowGenderOptions');
  task.func = 'Task_OakSpeech_HandleGenderInput';
};

export const Task_OakSpeech_HandleGenderInput = (runtime: OakSpeechRuntime, task: OakSpeechTask): void => {
  switch (runtime.menuInput) {
    case 0:
      runtime.playerGender = MALE;
      break;
    case 1:
      runtime.playerGender = FEMALE;
      break;
    case MENU_B_PRESSED:
      return;
    default:
      return;
  }
  task.func = 'Task_OakSpeech_ClearGenderWindows';
};

export const Task_OakSpeech_ClearGenderWindows = (runtime: OakSpeechRuntime, task: OakSpeechTask): void => {
  runtime.windowOps.push(`ClearGenderWindow:${task.data[13]}`);
  task.data[13] = WIN_INTRO_TEXTBOX;
  clearDialogWindowAndFrame(runtime, task.data[13], true);
  fillBgTilemapBufferRect(runtime, 0, 0, 0, 0, 30, 20, 0);
  copyBgTilemapBufferToVram(runtime, 0);
  task.func = 'Task_OakSpeech_LoadPlayerPic';
};

export const Task_OakSpeech_LoadPlayerPic = (runtime: OakSpeechRuntime, task: OakSpeechTask): void => {
  LoadTrainerPic(runtime, runtime.playerGender === MALE ? MALE_PLAYER_PIC : FEMALE_PLAYER_PIC, 0);
  CreateFadeOutTask(runtime, task, 2);
  task.data[3] = 32;
  task.func = 'Task_OakSpeech_YourNameWhatIsIt';
};

export const Task_OakSpeech_YourNameWhatIsIt = (runtime: OakSpeechRuntime, task: OakSpeechTask): void => {
  if (task.data[2] === 0)
    return;
  if (task.data[3] !== 0) {
    task.data[3]--;
    return;
  }
  task.data[1] = 0;
  oakSpeechPrintMessage(runtime, 'gOakSpeech_Text_YourNameWhatIsIt', runtime.textSpeed);
  task.func = 'Task_OakSpeech_FadeOutForPlayerNamingScreen';
};

export const Task_OakSpeech_FadeOutForPlayerNamingScreen = (runtime: OakSpeechRuntime, task: OakSpeechTask): void => {
  if (runtime.textPrinterActive)
    return;
  beginNormalPaletteFade(runtime, PALETTES_ALL, 0, 0, 16, RGB_BLACK);
  runtime.resources.hasPlayerBeenNamed = false;
  task.func = 'Task_OakSpeech_DoNamingScreen';
};

export const Task_OakSpeech_MoveRivalDisplayNameOptions = (runtime: OakSpeechRuntime, task: OakSpeechTask): void => {
  if (runtime.textPrinterActive)
    return;
  if (task.data[1] > -60) {
    task.data[1] -= 2;
    runtime.spriteCoordOffsetX += 2;
    runtime.windowOps.push('ChangeBgX:2:0x200:SUB');
  } else {
    task.data[1] = -60;
    PrintNameChoiceOptions(runtime, runtime.resources.hasPlayerBeenNamed);
    task.func = 'Task_OakSpeech_HandleRivalNameInput';
  }
};

export const Task_OakSpeech_RepeatNameQuestion = (runtime: OakSpeechRuntime, task: OakSpeechTask): void => {
  PrintNameChoiceOptions(runtime, runtime.resources.hasPlayerBeenNamed);
  oakSpeechPrintMessage(runtime, runtime.resources.hasPlayerBeenNamed ? 'gOakSpeech_Text_YourRivalsNameWhatWasIt' : 'gOakSpeech_Text_YourNameWhatIsIt', 0);
  task.func = 'Task_OakSpeech_HandleRivalNameInput';
};

export const Task_OakSpeech_HandleRivalNameInput = (runtime: OakSpeechRuntime, task: OakSpeechTask): void => {
  const input = runtime.menuInput;
  switch (input) {
    case 0:
      playSE(runtime, SE_SELECT);
      beginNormalPaletteFade(runtime, PALETTES_ALL, 0, 0, 16, RGB_BLACK);
      task.func = 'Task_OakSpeech_DoNamingScreen';
      break;
    case 1:
    case 2:
    case 3:
    case 4:
      playSE(runtime, SE_SELECT);
      runtime.windowOps.push(`ClearNameMenu:${task.data[13]}`);
      GetDefaultName(runtime, runtime.resources.hasPlayerBeenNamed, input - 1, () => 0);
      task.data[15] = 1;
      task.func = 'Task_OakSpeech_ConfirmName';
      break;
  }
};

export const Task_OakSpeech_DoNamingScreen = (runtime: OakSpeechRuntime, task: OakSpeechTask): void => {
  if (runtime.paletteFadeActive)
    return;
  GetDefaultName(runtime, runtime.resources.hasPlayerBeenNamed, 0, () => 0);
  if (runtime.resources.hasPlayerBeenNamed === false)
    runtime.namingScreenCalls.push({ type: 'NAMING_SCREEN_PLAYER', dest: 'playerName', gender: runtime.playerGender, callback: 'CB2_ReturnFromNamingScreen' });
  else {
    runtime.windowOps.push(`ClearRivalNameMenu:${task.data[13]}`);
    runtime.namingScreenCalls.push({ type: 'NAMING_SCREEN_RIVAL', dest: 'rivalName', gender: 0, callback: 'CB2_ReturnFromNamingScreen' });
  }
  DestroyPikachuOrPlatformSprites(runtime, task, SPRITE_TYPE_PLATFORM);
  runtime.allWindowBuffersFreed = true;
};

export const Task_OakSpeech_ConfirmName = (runtime: OakSpeechRuntime, task: OakSpeechTask): void => {
  if (runtime.paletteFadeActive)
    return;
  if (task.data[15] === 1) {
    oakSpeechPrintMessage(runtime, runtime.resources.hasPlayerBeenNamed ? 'gOakSpeech_Text_ConfirmRivalName' : 'gOakSpeech_Text_SoYourNameIsPlayer', runtime.textSpeed);
    task.data[15] = 0;
    task.data[3] = 25;
  } else if (!runtime.textPrinterActive) {
    if (task.data[3] !== 0)
      task.data[3]--;
    else {
      runtime.windowOps.push('CreateYesNoMenu');
      task.func = 'Task_OakSpeech_HandleConfirmNameInput';
    }
  }
};

export const Task_OakSpeech_FadeOutPlayerPic = (runtime: OakSpeechRuntime, task: OakSpeechTask): void => {
  if (task.data[2] === 0)
    return;
  ClearTrainerPic(runtime);
  if (task.data[3] !== 0)
    task.data[3]--;
  else
    task.func = 'Task_OakSpeech_FadeInRivalPic';
};

export const Task_OakSpeech_FadeOutRivalPic = (runtime: OakSpeechRuntime, task: OakSpeechTask): void => {
  if (runtime.textPrinterActive)
    return;
  clearDialogWindowAndFrame(runtime, WIN_INTRO_TEXTBOX, true);
  CreateFadeInTask(runtime, task, 2);
  task.func = 'Task_OakSpeech_ReshowPlayersPic';
};

export const Task_OakSpeech_FadeInRivalPic = (runtime: OakSpeechRuntime, task: OakSpeechTask): void => {
  runtime.windowOps.push('ChangeBgX:2:0:SET');
  task.data[1] = 0;
  runtime.spriteCoordOffsetX = 0;
  LoadTrainerPic(runtime, RIVAL_PIC, 0);
  CreateFadeOutTask(runtime, task, 2);
  task.func = 'Task_OakSpeech_AskRivalsName';
};

export const Task_OakSpeech_AskRivalsName = (runtime: OakSpeechRuntime, task: OakSpeechTask): void => {
  if (task.data[2] === 0)
    return;
  oakSpeechPrintMessage(runtime, 'gOakSpeech_Text_WhatWasHisName', runtime.textSpeed);
  runtime.resources.hasPlayerBeenNamed = true;
  task.func = 'Task_OakSpeech_MoveRivalDisplayNameOptions';
};

export const Task_OakSpeech_ReshowPlayersPic = (runtime: OakSpeechRuntime, task: OakSpeechTask): void => {
  if (task.data[2] === 0)
    return;
  ClearTrainerPic(runtime);
  if (task.data[3] !== 0) {
    task.data[3]--;
    return;
  }
  LoadTrainerPic(runtime, runtime.playerGender === MALE ? MALE_PLAYER_PIC : FEMALE_PLAYER_PIC, 0);
  task.data[1] = 0;
  runtime.spriteCoordOffsetX = 0;
  runtime.windowOps.push('ChangeBgX:2:0:SET');
  CreateFadeOutTask(runtime, task, 2);
  task.func = 'Task_OakSpeech_LetsGo';
};

export const Task_OakSpeech_LetsGo = (runtime: OakSpeechRuntime, task: OakSpeechTask): void => {
  if (task.data[2] === 0)
    return;
  oakSpeechPrintMessage(runtime, 'gOakSpeech_Text_LetsGo', runtime.textSpeed);
  task.data[3] = 30;
  task.func = 'Task_OakSpeech_FadeOutBGM';
};

export const Task_OakSpeech_FadeOutBGM = (runtime: OakSpeechRuntime, task: OakSpeechTask): void => {
  if (runtime.textPrinterActive)
    return;
  if (task.data[3] !== 0)
    task.data[3]--;
  else {
    fadeOutBGM(runtime, 4);
    task.func = 'Task_OakSpeech_SetUpExitAnimation';
  }
};

export const Task_OakSpeech_SetUpExitAnimation = (runtime: OakSpeechRuntime, task: OakSpeechTask): void => {
  runtime.resources.shrinkTimer = 0;
  Task_OakSpeech_SetUpDestroyPlatformSprites(runtime);
  Task_OakSpeech_SetUpFadePlayerPicWhite(runtime);
  Task_OakSpeech_SetUpShrinkPlayerPic(runtime, task);
};

export const CB2_ReturnFromNamingScreen = (runtime: OakSpeechRuntime): void => {
  switch (runtime.mainState) {
    case 0:
      runtime.vblankCallback = null;
      runtime.windowOps.push('ReturnNaming:clearVramOamPltt', 'ResetPaletteFade', 'ScanlineEffect_Stop', 'ResetSpriteData', 'FreeAllSpritePalettes', 'ResetTempTileDataBuffers');
      break;
    case 1:
      runtime.windowOps.push('ReturnNaming:initBgs');
      break;
    case 2:
      for (const reg of [REG_OFFSET_WIN0H, REG_OFFSET_WIN0V, REG_OFFSET_WININ, REG_OFFSET_WINOUT, REG_OFFSET_BLDCNT, REG_OFFSET_BLDALPHA, REG_OFFSET_BLDY])
        setGpuReg(runtime, reg, 0);
      break;
    case 3:
      runtime.allWindowBuffersFreed = true;
      runtime.windowOps.push('ReturnNaming:initTextBoxes', 'ReturnNaming:loadBackgroundPaletteWithBugRange');
      break;
    case 4:
      runtime.windowOps.push('ReturnNaming:decompressOakBackground');
      break;
    case 5:
      fillBgTilemapBufferRect(runtime, 1, 0, 0, 0, 30, 20, 0);
      fillBgTilemapBufferRect(runtime, 2, 0, 0, 0, 30, 20, 0);
      copyBgTilemapBufferToVram(runtime, 1);
      copyBgTilemapBufferToVram(runtime, 2);
      break;
    case 6: {
      const task = createOakSpeechTask(runtime, 'Task_OakSpeech_ConfirmName');
      LoadTrainerPic(runtime, runtime.resources.hasPlayerBeenNamed ? RIVAL_PIC : runtime.playerGender === MALE ? MALE_PLAYER_PIC : FEMALE_PLAYER_PIC, 0);
      task.data[1] = -60;
      runtime.spriteCoordOffsetX += 60;
      runtime.windowOps.push('ChangeBgX:2:0xFFFFC400:SET');
      CreatePikachuOrPlatformSprites(runtime, task, SPRITE_TYPE_PLATFORM);
      task.data[15] = 1;
      break;
    }
    case 7:
      beginNormalPaletteFade(runtime, PALETTES_ALL, 0, 16, 0, RGB_BLACK);
      setGpuReg(runtime, REG_OFFSET_DISPCNT, DISPCNT_OBJ_1D_MAP | DISPCNT_OBJ_ON);
      showBg(runtime, 0);
      showBg(runtime, 1);
      showBg(runtime, 2);
      runtime.vblankCallback = 'VBlankCB_NewGameScene';
      runtime.textFlagsCanABSpeedUpPrint = true;
      runtime.mainCallback2 = 'CB2_NewGameScene';
      return;
  }
  runtime.mainState++;
};

export const CreateNidoranFSprite = (runtime: OakSpeechRuntime, task: OakSpeechTask): number => {
  const spriteId = createSprite(runtime, 96, 96, 1);
  runtime.sprites[spriteId].callback = 'SpriteCallbackDummy';
  runtime.sprites[spriteId].priority = 1;
  runtime.sprites[spriteId].invisible = true;
  task.data[4] = spriteId;
  runtime.nidoranCreated.push(spriteId);
  return spriteId;
};

export const SpriteCB_Pikachu = (runtime: OakSpeechRuntime, sprite: OakSpeechSprite): void => {
  const bodySpriteId = sprite.data?.[0] ?? 0;
  sprite.y2 = runtime.sprites[bodySpriteId].animCmdIndex ?? 0;
};

export const CreatePikachuOrPlatformSprites = (
  runtime: OakSpeechRuntime,
  task: OakSpeechTask,
  spriteType: number
): void => {
  const spriteIds: number[] = [];
  switch (spriteType) {
    case SPRITE_TYPE_PIKACHU: {
      const body = createSprite(runtime, 16, 17, 2);
      runtime.sprites[body].priority = 0;
      task.data[7 + PIKACHU_BODY_PLATFORM_LEFT] = body;
      spriteIds.push(body);
      const ears = createSprite(runtime, 16, 9, 3);
      runtime.sprites[ears].priority = 0;
      runtime.sprites[ears].data![0] = body;
      runtime.sprites[ears].callback = 'SpriteCB_Pikachu';
      task.data[7 + PIKACHU_EARS_PLATFORM_MIDDLE] = ears;
      spriteIds.push(ears);
      const eyes = createSprite(runtime, 24, 13, 1);
      runtime.sprites[eyes].priority = 0;
      runtime.sprites[eyes].data![0] = body;
      runtime.sprites[eyes].callback = 'SpriteCB_Pikachu';
      task.data[7 + PIKACHU_EYES_PLATFORM_RIGHT] = eyes;
      spriteIds.push(eyes);
      break;
    }
    case SPRITE_TYPE_PLATFORM:
      for (let i = PIKACHU_BODY_PLATFORM_LEFT; i < NUM_PIKACHU_PLATFORM_SPRITES; i++) {
        const spriteId = createSprite(runtime, i * 32 + 88, 112, 1);
        runtime.sprites[spriteId].priority = 2;
        runtime.sprites[spriteId].animPaused = true;
        runtime.sprites[spriteId].coordOffsetEnabled = true;
        task.data[7 + i] = spriteId;
        spriteIds.push(spriteId);
      }
      break;
  }
  runtime.createdSpriteTypes.push({ taskId: task.id, spriteType, spriteIds });
};
