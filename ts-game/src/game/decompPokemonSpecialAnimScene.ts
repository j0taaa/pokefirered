import { advanceDecompRng } from './decompRandom';
import { gSineTable } from './decompTrig';

export const PSA_ITEM_ANIM_TYPE_TMHM = 3;
export const RGB_WHITE = 0x7fff;
export const RGB_BLACK = 0;
export const SE_BALL_TRAY_EXIT = 'SE_BALL_TRAY_EXIT';
export const SE_EXP_MAX = 'SE_EXP_MAX';
export const SE_M_MEGA_KICK = 'SE_M_MEGA_KICK';
export const SE_M_MILK_DRINK = 'SE_M_MILK_DRINK';
export const SE_M_REVERSAL = 'SE_M_REVERSAL';
export const SE_M_SWAGGER2 = 'SE_M_SWAGGER2';
export const SE_SWITCH = 'SE_SWITCH';

export const sAffineScales = [0x100, 0x155, 0x1aa, 0x200] as const;
export const sStarCoordOffsets = [
  [-8, -8],
  [6, -13],
  [8, -8]
] as const;

export type PsaSpriteCallback =
  | 'SpriteCallbackDummy'
  | 'SpriteCallback_MonSpriteWiggle'
  | 'SpriteCB_MachineSetWobble'
  | 'SpriteCB_Star'
  | 'SpriteCB_OutwardSpiralDots'
  | 'SpriteCallback_UseItem_OutwardSpiralDots'
  | 'SpriteCB_LevelUpVertical';

export type PsaTaskFunc =
  | 'Task_ZoomAnim'
  | 'Task_ItemUseOnMonAnim'
  | 'Task_UseItem_OutwardSpiralDots'
  | 'Task_LevelUpVerticalSprites';

export interface PsaSprite {
  id: number;
  kind: string;
  x: number;
  y: number;
  x2: number;
  y2: number;
  data: number[];
  callback: PsaSpriteCallback;
  invisible: boolean;
  destroyed: boolean;
  anim: number;
  affineAnim: number;
  affineAnims: 'zoom' | 'itemZoom' | 'dummy';
  affineAnimEnded: boolean;
  oam: {
    affineMode: number;
    priority: number;
  };
  subpriority: number;
}

export interface PsaTask {
  id: number;
  func: PsaTaskFunc;
  priority: number;
  data: number[];
  wordArgs: Record<number, unknown>;
  destroyed: boolean;
}

export interface PokemonSpecialAnimSceneState {
  state: number;
  field_0002: number;
  field_0004: number;
  monSpriteY1: number;
  monSpriteY2: number;
  lastCloseness: number;
  monSprite: PsaSprite | null;
  itemIconSprite: PsaSprite | null;
  textBuf: string;
}

export interface PokemonSpecialAnimSceneRuntime {
  scene: PokemonSpecialAnimSceneState;
  sprites: PsaSprite[];
  tasks: PsaTask[];
  operations: string[];
  sounds: string[];
  gPaletteFade: { active: boolean };
  tempTileBuffersBusyResults: boolean[];
  dmaBusyResults: boolean[];
  textPrinterActive: boolean;
  animType: number;
  itemId: number;
  monNickname: string;
  moveToTeachName: string;
  moveForgottenName: string;
  monLevel: number;
  monSpecies: number;
  monPersonality: number;
  itemNames: Record<number, string>;
  monPosAttributes: Record<string, number>;
  starPosAttributes: Record<string, number>;
}

const createData = (length = 16): number[] => Array.from({ length }, () => 0);

export const createPokemonSpecialAnimSceneRuntime = (
  overrides: Partial<PokemonSpecialAnimSceneRuntime> = {}
): PokemonSpecialAnimSceneRuntime => ({
  scene: {
    state: 0,
    field_0002: 0,
    field_0004: 0,
    monSpriteY1: 72,
    monSpriteY2: 96,
    lastCloseness: 0,
    monSprite: null,
    itemIconSprite: null,
    textBuf: '',
    ...overrides.scene
  },
  sprites: [],
  tasks: [],
  operations: [],
  sounds: [],
  gPaletteFade: { active: false, ...overrides.gPaletteFade },
  tempTileBuffersBusyResults: [],
  dmaBusyResults: [],
  textPrinterActive: false,
  animType: 0,
  itemId: 13,
  monNickname: 'MON',
  moveToTeachName: 'CUT',
  moveForgottenName: 'TACKLE',
  monLevel: 5,
  monSpecies: 1,
  monPersonality: 0,
  itemNames: { 13: 'POTION', 289: 'TM01', ...overrides.itemNames },
  monPosAttributes: {},
  starPosAttributes: {},
  ...overrides
});

const toI16 = (value: number): number => {
  const u16 = value & 0xffff;
  return u16 & 0x8000 ? u16 - 0x10000 : u16;
};

const abs = (value: number): number => Math.abs(toI16(value));

const createSprite = (
  runtime: PokemonSpecialAnimSceneRuntime,
  kind: string,
  x: number,
  y: number,
  subpriority: number,
  callback: PsaSpriteCallback
): PsaSprite => {
  const sprite: PsaSprite = {
    id: runtime.sprites.length,
    kind,
    x,
    y,
    x2: 0,
    y2: 0,
    data: createData(12),
    callback,
    invisible: false,
    destroyed: false,
    anim: 0,
    affineAnim: 0,
    affineAnims: 'dummy',
    affineAnimEnded: true,
    oam: { affineMode: 0, priority: 1 },
    subpriority
  };
  runtime.sprites.push(sprite);
  runtime.operations.push(`CreateSprite:${kind}:${sprite.id}:${x}:${y}:${subpriority}`);
  return sprite;
};

const destroySprite = (runtime: PokemonSpecialAnimSceneRuntime, sprite: PsaSprite | null): void => {
  if (sprite != null) sprite.destroyed = true;
  runtime.operations.push(`DestroySprite:${sprite?.id ?? 'NULL'}`);
};

const createTask = (runtime: PokemonSpecialAnimSceneRuntime, func: PsaTaskFunc, priority: number): number => {
  const task: PsaTask = { id: runtime.tasks.length, func, priority, data: createData(), wordArgs: {}, destroyed: false };
  runtime.tasks.push(task);
  runtime.operations.push(`CreateTask:${func}:${task.id}:${priority}`);
  return task.id;
};

const destroyTask = (runtime: PokemonSpecialAnimSceneRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  if (task) task.destroyed = true;
  runtime.operations.push(`DestroyTask:${taskId}`);
};

const findTaskIdByFunc = (runtime: PokemonSpecialAnimSceneRuntime, func: PsaTaskFunc): number =>
  runtime.tasks.findIndex((task) => task.func === func && !task.destroyed);

const funcIsActiveTask = (runtime: PokemonSpecialAnimSceneRuntime, func: PsaTaskFunc): boolean =>
  findTaskIdByFunc(runtime, func) !== -1;

const setWordTaskArg = (runtime: PokemonSpecialAnimSceneRuntime, taskId: number, offset: number, value: unknown): void => {
  runtime.tasks[taskId].wordArgs[offset] = value;
};

const getWordTaskArg = <T>(runtime: PokemonSpecialAnimSceneRuntime, taskId: number, offset: number): T =>
  runtime.tasks[taskId].wordArgs[offset] as T;

const playSE = (runtime: PokemonSpecialAnimSceneRuntime, sound: string): void => {
  runtime.sounds.push(sound);
  runtime.operations.push(`PlaySE:${sound}`);
};

const beginNormalPaletteFade = (
  runtime: PokemonSpecialAnimSceneRuntime,
  selectedPalettes: number,
  delay: number,
  startY: number,
  targetY: number,
  color: number
): void => {
  runtime.gPaletteFade.active = true;
  runtime.operations.push(`BeginNormalPaletteFade:${selectedPalettes}:${delay}:${startY}:${targetY}:${color}`);
};

const blendPalettes = (runtime: PokemonSpecialAnimSceneRuntime, selectedPalettes: number, coeff: number, color: number): void => {
  runtime.operations.push(`BlendPalettes:${selectedPalettes}:${coeff}:${color}`);
};

const loadOutwardSpiralDotsGfx = (runtime: PokemonSpecialAnimSceneRuntime): void => {
  runtime.operations.push('LoadCompressedSpriteSheet:UseItem_OutwardSpiralDots');
  runtime.operations.push('LoadSpritePalette:UseItem_OutwardSpiralDots');
};

export const LoadOutwardSpiralDotsGfx = loadOutwardSpiralDotsGfx;

const getMonPosAttribute = (runtime: PokemonSpecialAnimSceneRuntime, attr: string): number =>
  runtime.monPosAttributes[attr] ?? 0xff;

const getStarSpritePosAttribute = (runtime: PokemonSpecialAnimSceneRuntime, attr: string): number =>
  runtime.starPosAttributes[attr] ?? 0;

export const InitPokemonSpecialAnimScene = (runtime: PokemonSpecialAnimSceneRuntime, animType: number): void => {
  [
    'FreeAllWindowBuffers',
    'ResetTempTileDataBuffers',
    'SetGpuReg:DISPCNT:0',
    'ResetBgsAndClearDma3BusyFlags:FALSE',
    'InitBgsFromTemplates',
    'InitWindows',
    'ChangeBgX:0:0:0',
    'ChangeBgY:0:0:0',
    'ChangeBgX:3:0:0',
    'ChangeBgY:3:0:0',
    'SetBgTilemapBuffer:0:field_0914',
    'SetBgTilemapBuffer:3:field_1914',
    'RequestDma3Fill:BG_VRAM:32',
    'FillBgTilemapBufferRect_Palette0:0',
    'CopyToBgTilemapBuffer:3',
    'DecompressAndCopyTileDataToVram:3'
  ].forEach((op) => runtime.operations.push(op));
  runtime.operations.push(animType !== PSA_ITEM_ANIM_TYPE_TMHM ? 'LoadPalette:sBg_Pal' : 'LoadPalette:sBg_TmHm_Pal');
  [
    'FillWindowPixelBuffer:0:0',
    'LoadUserWindowGfx:0',
    'CopyWindowToVram:0:FULL',
    'ShowBg:0',
    'ShowBg:3',
    'HideBg:1',
    'HideBg:2',
    'CopyBgTilemapBufferToVram:0',
    'CopyBgTilemapBufferToVram:3',
    'SetGpuRegBits:DISPCNT',
    'SetGpuReg:BLDCNT:0'
  ].forEach((op) => runtime.operations.push(op));
};

export const LoadBgGfxByAnimType = (runtime: PokemonSpecialAnimSceneRuntime, animType: number): void => {
  runtime.operations.push('CopyToBgTilemapBuffer:3:sBg_Tilemap:0:0x000');
  runtime.operations.push('DecompressAndCopyTileDataToVram:3:sBg_Gfx:0:0x000:0');
  runtime.operations.push(animType !== PSA_ITEM_ANIM_TYPE_TMHM ? 'LoadPalette:sBg_Pal:BG_PLTT_ID(0)' : 'LoadPalette:sBg_TmHm_Pal:BG_PLTT_ID(0)');
};

export const PokemonSpecialAnimSceneInitIsNotFinished = (runtime: PokemonSpecialAnimSceneRuntime): boolean => {
  const tempBusy = runtime.tempTileBuffersBusyResults.shift() ?? false;
  if (!tempBusy) return runtime.dmaBusyResults.shift() ?? false;
  return true;
};

export const PSA_FreeWindowBuffers = (runtime: PokemonSpecialAnimSceneRuntime): void => {
  runtime.operations.push('FreeAllWindowBuffers');
};

export const PSA_ShowMessageWindow = (runtime: PokemonSpecialAnimSceneRuntime): void => {
  runtime.operations.push('PutWindowTilemap:0', 'FillWindowPixelBuffer:0:1', 'DrawTextBorderOuter:0:1:14', 'CopyWindowToVram:0:FULL');
};

export const PSA_HideMessageWindow = (runtime: PokemonSpecialAnimSceneRuntime): void => {
  runtime.operations.push('ClearWindowTilemap:0', 'ClearStdWindowAndFrameToTransparent:0:FALSE', 'CopyWindowToVram:0:MAP');
};

export const PSA_PrintMessage = (runtime: PokemonSpecialAnimSceneRuntime, messageId: number): void => {
  let strWidth = 0;
  let textSpeed = 2;
  switch (messageId) {
    case 0:
      runtime.scene.textBuf = `${runtime.itemNames[runtime.itemId] ?? `ITEM${runtime.itemId}`} was used on ${runtime.monNickname}.`;
      break;
    case 1: {
      const level = runtime.monLevel < 100 ? runtime.monLevel + 1 : runtime.monLevel;
      runtime.scene.textBuf = `${runtime.monNickname}'s level rose to ${level}.`;
      break;
    }
    case 9:
      runtime.scene.textBuf = `${runtime.monNickname} learned ${runtime.moveToTeachName}!`;
      break;
    case 4:
      strWidth += '2 and'.length * 6;
    // fallthrough
    case 3:
      strWidth += '1'.length * 6;
    // fallthrough
    case 2:
      runtime.scene.textBuf = ['1', '2 and', 'Poof'][messageId - 2]!;
      textSpeed = 1;
      break;
    case 5:
      runtime.scene.textBuf = `${runtime.monNickname} forgot ${runtime.moveForgottenName}.`;
      break;
    case 6:
      runtime.scene.textBuf = 'And...';
      break;
    case 7:
      runtime.scene.textBuf = 'Machine set!';
      break;
    case 8:
      runtime.scene.textBuf = 'Huh?';
      break;
    default:
      return;
  }
  runtime.operations.push(`AddTextPrinterParameterized5:0:${runtime.scene.textBuf}:${strWidth}:0:${textSpeed}:0:4`);
};

export const PSA_AfterPoof_ClearMessageWindow = (runtime: PokemonSpecialAnimSceneRuntime): void => {
  runtime.operations.push('FillWindowPixelBuffer:0:1', 'CopyWindowToVram:0:GFX');
};

export const PSA_IsMessagePrintTaskActive = (runtime: PokemonSpecialAnimSceneRuntime): boolean => runtime.textPrinterActive;

export const PSA_DarkenMonSprite = (runtime: PokemonSpecialAnimSceneRuntime): void => {
  runtime.scene.state = 0;
  blendPalettes(runtime, (0x10000 << 0) | 4, 16, RGB_BLACK);
  CreateStarSprites(runtime, runtime.scene);
};

export const PSA_RunPoofAnim = (runtime: PokemonSpecialAnimSceneRuntime): boolean => {
  switch (runtime.scene.state) {
    case 0:
      if (!AnyStarSpritesActive(runtime)) {
        beginNormalPaletteFade(runtime, (0x10000 << 0) | 4, -1, 16, 0, RGB_BLACK);
        runtime.scene.state++;
      }
      break;
    case 1:
      if (!runtime.gPaletteFade.active) return false;
      break;
  }
  return true;
};

export const PSA_UseTM_SetUpZoomOutAnim = (runtime: PokemonSpecialAnimSceneRuntime): void => {
  runtime.scene.state = 0;
};

export const PSA_UseTM_CleanUpForCancel = (runtime: PokemonSpecialAnimSceneRuntime): void => {
  StopMakingOutwardSpiralDots(runtime);
  runtime.gPaletteFade.active = false;
  runtime.operations.push('ResetPaletteFadeControl');
};

export const PSA_UseTM_RunZoomOutAnim = (runtime: PokemonSpecialAnimSceneRuntime): boolean => {
  const scene = runtime.scene;
  switch (scene.state) {
    case 0:
      StartZoomOutAnimForUseTM(runtime, 0);
      scene.state++;
      break;
    case 1:
      if (!PSA_IsZoomTaskActive(runtime)) {
        scene.field_0004 = 0;
        scene.state++;
      }
      break;
    case 2:
      scene.field_0004++;
      if (scene.field_0004 > 20) scene.state++;
      break;
    case 3:
      StartMonWiggleAnim(scene, 1, 0, 1);
      scene.field_0004 = 0;
      scene.state++;
      break;
    case 4:
      scene.field_0004++;
      if (scene.field_0004 > 0) {
        scene.field_0004 = 0;
        playSE(runtime, SE_M_MEGA_KICK);
        beginNormalPaletteFade(runtime, 1, 2, 0, 12, 0x7e68);
        PSAScene_SeedRandomInTask(runtime, scene);
        scene.state++;
      }
      break;
    case 5:
      scene.field_0004++;
      if (scene.field_0004 > 70) {
        StopMonWiggleAnim(scene);
        beginNormalPaletteFade(runtime, 1, 6, 12, 0, 0x7e68);
        scene.field_0004 = 0;
        scene.state++;
      }
      break;
    case 6:
      scene.field_0004++;
      if (!IsOutwardSpiralDotsTaskRunning(runtime) && scene.field_0004 > 40) {
        scene.field_0004 = 0;
        scene.state++;
      }
      break;
    case 7:
      scene.field_0004++;
      if (scene.field_0004 > 20) scene.state++;
      break;
    case 8:
      playSE(runtime, SE_EXP_MAX);
      destroySprite(runtime, scene.itemIconSprite);
      scene.state++;
      break;
    default:
      return false;
  }
  return true;
};

export const PSA_UseTM_SetUpMachineSetWobble = (runtime: PokemonSpecialAnimSceneRuntime): void => {
  runtime.scene.state = 0;
};

export const PSA_UseTM_RunMachineSetWobble = (runtime: PokemonSpecialAnimSceneRuntime): boolean => {
  switch (runtime.scene.state) {
    case 0:
      MachineSetWobbleInit(runtime);
      playSE(runtime, SE_SWITCH);
      runtime.scene.state++;
      break;
    case 1:
      return MachineSetWobbleCBIsRunning(runtime);
  }
  return true;
};

export const PSA_CreateLevelUpVerticalSpritesTask = (runtime: PokemonSpecialAnimSceneRuntime): void => {
  CreateLevelUpVerticalSpritesTask(runtime, 120, 56, 4, 4, 2, 0);
};

export const PSA_LevelUpVerticalSpritesTaskIsRunning = (runtime: PokemonSpecialAnimSceneRuntime): boolean =>
  LevelUpVerticalSpritesTaskIsRunning(runtime);

export const PSA_IsCopyingLevelUpWindowToVram = (runtime: PokemonSpecialAnimSceneRuntime): boolean =>
  runtime.dmaBusyResults.shift() ?? false;

export const PSA_CreateMonSpriteAtCloseness = (runtime: PokemonSpecialAnimSceneRuntime, closeness: number): void => {
  const yOffset = getMonPosAttribute(runtime, 'PSA_MON_ATTR_Y_OFFSET');
  if (yOffset !== 0xff) {
    runtime.scene.monSpriteY1 = 72;
    runtime.scene.monSpriteY2 = yOffset + 48;
  } else {
    runtime.scene.monSpriteY1 = 72;
    runtime.scene.monSpriteY2 = 96;
  }
  runtime.operations.push('Alloc:MON_PIC_SIZE*MAX_MON_PIC_FRAMES', 'Alloc:0x2000', 'Alloc:0x100');
  runtime.operations.push('HandleLoadSpecialPokePic', 'LZ77UnCompWram', 'LoadSpriteSheet:MonSprite', 'LoadSpritePalette:MonSprite');
  const sprite = createSprite(runtime, 'MonSprite', 120, runtime.scene.monSpriteY1, 4, 'SpriteCallbackDummy');
  sprite.oam.affineMode = 2;
  sprite.affineAnims = 'zoom';
  runtime.scene.monSprite = sprite;
  MonSpriteZoom_UpdateYPos(runtime, sprite, closeness);
  runtime.scene.lastCloseness = closeness;
  runtime.operations.push('Free:monPicBuffer', 'Free:unusedBuffer', 'Free:monPalBuffer');
};

export const LoadMonSpriteGraphics = (
  runtime: PokemonSpecialAnimSceneRuntime,
  tiles: unknown,
  palette: unknown
): void => {
  runtime.operations.push(`LoadSpriteSheet:MonSprite:${tiles === null ? 'NULL' : 'tiles'}:MON_PIC_SIZE:0`);
  runtime.operations.push(`LoadSpritePalette:MonSprite:${palette === null ? 'NULL' : 'palette'}:0`);
};

export const PSA_SetUpZoomAnim = (runtime: PokemonSpecialAnimSceneRuntime, closeness: number): void => {
  const scene = runtime.scene;
  if (closeness !== scene.lastCloseness) {
    const taskId = createTask(runtime, 'Task_ZoomAnim', 4);
    setWordTaskArg(runtime, taskId, 6, scene.monSprite);
    const data = runtime.tasks[taskId].data;
    data[1] = scene.lastCloseness;
    data[2] = closeness;
    data[5] = 6;
    data[3] = closeness > scene.lastCloseness ? 1 : -1;
  }
};

export const PSA_IsZoomTaskActive = (runtime: PokemonSpecialAnimSceneRuntime): boolean => funcIsActiveTask(runtime, 'Task_ZoomAnim');

export const Task_ZoomAnim = (runtime: PokemonSpecialAnimSceneRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  if (!task || task.destroyed) return;
  const data = task.data;
  const sprite = getWordTaskArg<PsaSprite>(runtime, taskId, 6);
  switch (data[0]) {
    case 0:
      SetSpriteWithCloseness(sprite, data[1]);
      if (data[8]) SetSpriteWithCloseness(getWordTaskArg<PsaSprite>(runtime, taskId, 9), data[1]);
      data[1] += data[3];
      data[0]++;
      break;
    case 1:
      if (!IsZoomSpriteCBActive(sprite)) {
        playSE(runtime, SE_BALL_TRAY_EXIT);
        MonSpriteZoom_UpdateYPos(runtime, sprite, data[1]);
        if (data[8]) ItemSpriteZoom_UpdateYPos(runtime, getWordTaskArg<PsaSprite>(runtime, taskId, 9), data[1]);
        if (data[1] === data[2]) {
          runtime.scene.lastCloseness = data[2];
          destroyTask(runtime, taskId);
        } else {
          data[4] = 0;
          data[0] = 2;
        }
      }
      break;
    case 2:
      data[4]++;
      if (data[4] > data[5]) data[0] = 0;
      break;
  }
};

export const SetSpriteWithCloseness = (sprite: PsaSprite, closeness: number): void => {
  sprite.data[0] = 0;
  sprite.data[1] = 0;
  sprite.data[2] = closeness;
};

export const IsZoomSpriteCBActive = (sprite: PsaSprite): boolean => sprite.callback !== 'SpriteCallbackDummy';

export const GetSpriteOffsetByScale = (pos: number, closeness: number): number => (toI16(pos) * sAffineScales[closeness]) >> 8;

export const GetYPosByScale = (runtime: PokemonSpecialAnimSceneRuntime, pos: number): number => {
  const scene = runtime.scene;
  const v = (((((scene.monSpriteY2 - scene.monSpriteY1) << 16) >> 8) / 256 * (pos - 256)) << 8) >> 16;
  return (v | 0) + scene.monSpriteY1;
};

export const MonSpriteZoom_UpdateYPos = (runtime: PokemonSpecialAnimSceneRuntime, sprite: PsaSprite, closeness: number): void => {
  const capped = closeness > 3 ? 3 : closeness;
  StartSpriteAffineAnim(sprite, capped);
  sprite.y = GetYPosByScale(runtime, sAffineScales[capped]);
};

export const ItemSpriteZoom_UpdateYPos = (runtime: PokemonSpecialAnimSceneRuntime, sprite: PsaSprite, closeness: number): void => {
  MonSpriteZoom_UpdateYPos(runtime, sprite, closeness);
  sprite.x2 = GetSpriteOffsetByScale(sprite.data[6] - 32, closeness);
  sprite.y2 = GetSpriteOffsetByScale(sprite.data[7] - 32, closeness);
};

export const StartMonWiggleAnim = (
  scene: PokemonSpecialAnimSceneState,
  frameLen: number,
  niter: number,
  amplitude: number
): void => {
  if (!scene.monSprite) return;
  scene.monSprite.data[0] = frameLen;
  scene.monSprite.data[1] = niter;
  scene.monSprite.data[2] = amplitude;
  scene.monSprite.callback = 'SpriteCallback_MonSpriteWiggle';
};

export const StopMonWiggleAnim = (scene: PokemonSpecialAnimSceneState): void => {
  if (!scene.monSprite) return;
  scene.monSprite.x2 = 0;
  scene.monSprite.callback = 'SpriteCallbackDummy';
};

export const SpriteCallback_MonSpriteWiggle = (_runtime: PokemonSpecialAnimSceneRuntime, sprite: PsaSprite): void => {
  sprite.data[7]++;
  if (sprite.data[7] > sprite.data[0]) {
    sprite.data[7] = 0;
    sprite.data[6]++;
    if (sprite.data[1] !== 0 && sprite.data[6] >= sprite.data[1]) {
      sprite.x2 = 0;
      sprite.callback = 'SpriteCallbackDummy';
    } else if (sprite.data[6] & 1) {
      sprite.x2 = sprite.data[2];
    } else {
      sprite.x2 = -sprite.data[2];
    }
  }
};

export const PSA_SetUpItemUseOnMonAnim = (
  runtime: PokemonSpecialAnimSceneRuntime,
  itemId: number,
  closeness: number,
  a2: boolean
): void => {
  const sprite = PSA_CreateItemIconObject(runtime, itemId);
  runtime.scene.itemIconSprite = sprite;
  if (sprite != null) {
    InitItemIconSpriteState(runtime, runtime.scene, sprite, closeness);
    StartSpriteAffineAnim(sprite, closeness);
    sprite.invisible = true;
    const taskId = createTask(runtime, 'Task_ItemUseOnMonAnim', 2);
    setWordTaskArg(runtime, taskId, 4, sprite);
    const data = runtime.tasks[taskId].data;
    data[2] = closeness;
    data[3] = GetYPosByScale(runtime, sAffineScales[closeness]);
    data[6] = a2 ? 1 : 0;
    data[9] = GetBlendColorByItemId(itemId);
  }
};

export const GetBlendColorByItemId = (_itemId: number): number => RGB_WHITE;

export const CreateItemIconSpriteAtMaxCloseness = (runtime: PokemonSpecialAnimSceneRuntime, itemId: number): void => {
  const sprite = PSA_CreateItemIconObject(runtime, itemId);
  runtime.scene.itemIconSprite = sprite;
  if (sprite != null) {
    StartSpriteAffineAnim(sprite, 3);
    InitItemIconSpriteState(runtime, runtime.scene, sprite, 3);
  }
};

export const PSA_CreateItemIconObject = (runtime: PokemonSpecialAnimSceneRuntime, itemId: number): PsaSprite => {
  const sprite = createSprite(runtime, `ItemIcon:${itemId}`, 0, 0, 1, 'SpriteCallbackDummy');
  sprite.oam.affineMode = 2;
  sprite.oam.priority = 1;
  sprite.subpriority = 1;
  sprite.affineAnims = 'zoom';
  runtime.operations.push(`AddItemIconObject:1:1:${itemId}`, `InitSpriteAffineAnim:${sprite.id}`);
  return sprite;
};

export const PSA_IsItemUseOnMonAnimActive = (runtime: PokemonSpecialAnimSceneRuntime): boolean =>
  funcIsActiveTask(runtime, 'Task_ItemUseOnMonAnim');

export const Task_ItemUseOnMonAnim = (runtime: PokemonSpecialAnimSceneRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  if (!task || task.destroyed) return;
  const data = task.data;
  const sprite = getWordTaskArg<PsaSprite>(runtime, taskId, 4);
  switch (data[0]) {
    case 0:
      data[1]++;
      if (data[1] > 20) {
        data[1] = 0;
        playSE(runtime, SE_M_SWAGGER2);
        sprite.invisible = false;
        if (!data[11]) loadOutwardSpiralDotsGfx(runtime);
        data[0] = 1;
      }
      break;
    case 1:
      data[1]++;
      if (data[1] > 30) {
        data[1] = 0;
        sprite.affineAnims = 'itemZoom';
        StartSpriteAffineAnim(sprite, data[2]);
        beginNormalPaletteFade(runtime, 0x10000 << 1, -2, 0, 12, data[9]);
        data[0] = 2;
        playSE(runtime, SE_M_MILK_DRINK);
      }
      break;
    case 2:
      if (sprite.affineAnimEnded) {
        sprite.invisible = true;
        data[10] = 20;
        data[0] = 3;
      }
      break;
    case 3:
      data[1]++;
      if (data[1] > data[10]) {
        data[1] = 0;
        if (!data[11]) CreateSprites_UseItem_OutwardSpiralDots(runtime, taskId, data, sprite);
        if (data[7] === 0) playSE(runtime, SE_M_REVERSAL);
        data[7]++;
        if (data[7] > 2) data[0] = 4;
        else data[10] = 8;
      }
      break;
    case 4:
      if (data[8] === 0) {
        if (data[6]) destroySprite(runtime, sprite);
        destroyTask(runtime, taskId);
      }
      break;
  }
};

export const CreateSprites_UseItem_OutwardSpiralDots = (
  runtime: PokemonSpecialAnimSceneRuntime,
  taskId: number,
  data: number[],
  sprite: PsaSprite
): void => {
  const x = sprite.x + sprite.x2 - 4;
  const y = sprite.y + sprite.y2 - 4;
  blendPalettes(runtime, 0x10000 << 5, 16, data[9]);
  for (let i = 0; i < 15; i++) {
    const dot = createSprite(runtime, 'UseItem_OutwardSpiralDots', x, y, 0, 'SpriteCB_OutwardSpiralDots');
    dot.data[1] = i << 4;
    dot.data[7] = taskId;
    StartSpriteAnim(dot, 1);
    data[8]++;
  }
};

export const SpriteCB_OutwardSpiralDots = (runtime: PokemonSpecialAnimSceneRuntime, sprite: PsaSprite): void => {
  const data = sprite.data;
  if (data[0] < 16) {
    data[0]++;
    data[1] = (data[1] + 7) & 0xff;
    data[2] += 4;
    sprite.x2 = (data[2] * gSineTable[data[1] + 0x40]) >> 8;
    sprite.y2 = (data[2] * gSineTable[data[1]]) >> 8;
  } else {
    runtime.tasks[data[7]].data[8]--;
    destroySprite(runtime, sprite);
  }
};

export const PSA_UseItem_CleanUpForCancel = (runtime: PokemonSpecialAnimSceneRuntime): void => {
  const taskId = findTaskIdByFunc(runtime, 'Task_ItemUseOnMonAnim');
  if (taskId !== -1) runtime.tasks[taskId].data[11] = 1;
};

export const InitItemIconSpriteState = (
  runtime: PokemonSpecialAnimSceneRuntime,
  scene: PokemonSpecialAnimSceneState,
  sprite: PsaSprite,
  closeness: number
): void => {
  if (closeness === 3) {
    sprite.x = 120;
    sprite.y = scene.monSpriteY2;
  } else {
    sprite.x = 120;
    sprite.y = scene.monSpriteY1;
  }
  sprite.x += 4;
  sprite.y += 4;
  const xAttr = runtime.animType === PSA_ITEM_ANIM_TYPE_TMHM ? 'PSA_MON_ATTR_TMHM_X_POS' : 'PSA_MON_ATTR_ITEM_X_POS';
  const yAttr = runtime.animType === PSA_ITEM_ANIM_TYPE_TMHM ? 'PSA_MON_ATTR_TMHM_Y_POS' : 'PSA_MON_ATTR_ITEM_Y_POS';
  const x = getMonPosAttribute(runtime, xAttr);
  const y = getMonPosAttribute(runtime, yAttr);
  sprite.data[6] = x === 0xff ? 0 : x;
  sprite.data[7] = y === 0xff ? 0 : y;
  ItemSpriteZoom_UpdateYPos(runtime, sprite, closeness);
};

export const MachineSetWobbleInit = (runtime: PokemonSpecialAnimSceneRuntime): void => {
  if (runtime.scene.monSprite) MachineSetWobble_SetCB(runtime.scene.monSprite);
  if (runtime.scene.itemIconSprite) MachineSetWobble_SetCB(runtime.scene.itemIconSprite);
};

export const MachineSetWobble_SetCB = (sprite: PsaSprite): void => {
  sprite.data[0] = 0;
  sprite.data[1] = 0;
  sprite.callback = 'SpriteCB_MachineSetWobble';
};

export const MachineSetWobbleCBIsRunning = (runtime: PokemonSpecialAnimSceneRuntime): boolean =>
  runtime.scene.monSprite?.callback !== 'SpriteCallbackDummy';

export const SpriteCB_MachineSetWobble = (_runtime: PokemonSpecialAnimSceneRuntime, sprite: PsaSprite): void => {
  switch (sprite.data[0]) {
    case 0:
      sprite.x += 3;
      sprite.data[0]++;
      break;
    case 1:
      sprite.data[1]++;
      if (sprite.data[1] > 30) {
        sprite.x -= 3;
        sprite.callback = 'SpriteCallbackDummy';
      }
      break;
  }
};

export const StartZoomOutAnimForUseTM = (runtime: PokemonSpecialAnimSceneRuntime, closeness: number): void => {
  const scene = runtime.scene;
  if (closeness !== scene.lastCloseness) {
    const taskId = createTask(runtime, 'Task_ZoomAnim', 1);
    setWordTaskArg(runtime, taskId, 6, scene.monSprite);
    setWordTaskArg(runtime, taskId, 9, scene.itemIconSprite);
    const data = runtime.tasks[taskId].data;
    data[1] = scene.lastCloseness;
    data[2] = closeness;
    data[8] = 1;
    data[5] = 6;
    data[3] = closeness > scene.lastCloseness ? 1 : -1;
  }
};

export const CreateStarSprites = (runtime: PokemonSpecialAnimSceneRuntime, scene: PokemonSpecialAnimSceneState): void => {
  runtime.operations.push('LoadCompressedSpriteSheet:Star', 'LoadSpritePalette:Star');
  scene.field_0002 = 0;
  for (const [xOff, yOff] of sStarCoordOffsets) {
    const sprite = createSprite(runtime, 'Star', 120 + xOff, scene.monSpriteY2 + yOff, 2, 'SpriteCB_Star');
    sprite.data[3] = xOff * 8;
    sprite.data[4] = yOff * 8;
    sprite.x += GetSpriteOffsetByScale(getStarSpritePosAttribute(runtime, 'PSA_MON_ATTR_TMHM_X_POS'), 3);
    sprite.y += GetSpriteOffsetByScale(getStarSpritePosAttribute(runtime, 'PSA_MON_ATTR_TMHM_Y_POS'), 3);
    scene.field_0002++;
  }
};

export const AnyStarSpritesActive = (runtime: PokemonSpecialAnimSceneRuntime): number => runtime.scene.field_0002;

export const SpriteCB_Star = (runtime: PokemonSpecialAnimSceneRuntime, sprite: PsaSprite): void => {
  sprite.data[0]++;
  if (sprite.data[0] < 10) {
    sprite.data[1] += sprite.data[3];
    sprite.data[2] += sprite.data[4];
    sprite.x2 = sprite.data[1] >> 4;
    sprite.y2 = sprite.data[2] >> 4;
  } else {
    runtime.scene.field_0002--;
    destroySprite(runtime, sprite);
  }
};

export const PSAScene_SeedRandomInTask = (runtime: PokemonSpecialAnimSceneRuntime, _scene: PokemonSpecialAnimSceneState): void => {
  loadOutwardSpiralDotsGfx(runtime);
  const taskId = createTask(runtime, 'Task_UseItem_OutwardSpiralDots', 1);
  setWordTaskArg(runtime, taskId, 3, 2022069025);
  runtime.tasks[taskId].data[5] = 0xe0;
};

export const StopMakingOutwardSpiralDots = (runtime: PokemonSpecialAnimSceneRuntime): void => {
  const taskId = findTaskIdByFunc(runtime, 'Task_UseItem_OutwardSpiralDots');
  if (taskId !== -1) runtime.tasks[taskId].data[0] = 1;
};

export const Task_UseItem_OutwardSpiralDots = (runtime: PokemonSpecialAnimSceneRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  if (!task || task.destroyed) return;
  const data = task.data;
  switch (data[0]) {
    case 0:
      if (data[1] === 0) {
        const item = runtime.scene.itemIconSprite;
        if (!item) return;
        const x = item.x + item.x2;
        const y = item.y + item.y2;
        const ampl = (PSAScene_RandomFromTask(runtime, taskId) % 21) + 70;
        const x2 = x + ((gSineTable[data[5] + 0x40] * ampl) >> 8);
        const y2 = y + ((gSineTable[data[5]] * ampl) >> 8);
        data[5] = (data[5] + 0x4c) & 0xff;
        const sprite = createSprite(runtime, 'UseItem_OutwardSpiralDots', x2, y2, 0, 'SpriteCallback_UseItem_OutwardSpiralDots');
        sprite.data[0] = 0;
        sprite.data[1] = (PSAScene_RandomFromTask(runtime, taskId) & 1) + 6;
        sprite.data[2] = x2;
        sprite.data[3] = y2;
        sprite.data[4] = x;
        sprite.data[5] = y;
        sprite.data[6] = taskId;
        data[2]++;
        data[6]++;
        if (data[6] > 47) data[0]++;
      } else {
        data[1]--;
      }
      break;
    case 1:
      if (data[2] === 0) destroyTask(runtime, taskId);
      break;
  }
};

export const PSAScene_RandomFromTask = (runtime: PokemonSpecialAnimSceneRuntime, taskId: number): number => {
  const state = advanceDecompRng(getWordTaskArg<number>(runtime, taskId, 3));
  setWordTaskArg(runtime, taskId, 3, state);
  return state >>> 16;
};

export const SpriteCallback_UseItem_OutwardSpiralDots = (runtime: PokemonSpecialAnimSceneRuntime, sprite: PsaSprite): void => {
  sprite.data[0] += sprite.data[1];
  if (sprite.data[0] > 255) {
    runtime.tasks[sprite.data[6]].data[2]--;
    destroySprite(runtime, sprite);
  } else {
    const x = (sprite.data[4] - sprite.data[2]) * sprite.data[0];
    const y = (sprite.data[5] - sprite.data[3]) * sprite.data[0];
    sprite.x = (x >> 8) + sprite.data[2];
    sprite.y = (y >> 8) + sprite.data[3];
  }
};

export const IsOutwardSpiralDotsTaskRunning = (runtime: PokemonSpecialAnimSceneRuntime): boolean =>
  funcIsActiveTask(runtime, 'Task_UseItem_OutwardSpiralDots');

export const CreateLevelUpVerticalSpritesTask = (
  runtime: PokemonSpecialAnimSceneRuntime,
  x: number,
  y: number,
  tileTag: number,
  paletteTag: number,
  priority: number,
  subpriority: number
): void => {
  runtime.operations.push(`LoadCompressedSpriteSheet:LevelUp:${tileTag}`, `LoadSpritePalette:LevelUp:${paletteTag}`);
  const taskId = createTask(runtime, 'Task_LevelUpVerticalSprites', 0);
  const data = runtime.tasks[taskId].data;
  data[4] = x - 32;
  data[5] = y + 32;
  data[6] = tileTag;
  data[7] = paletteTag;
  data[8] = priority;
  data[9] = subpriority;
  runtime.operations.push('SetGpuReg:BLDCNT:BLEND_NONE_TGT2_ALL', 'SetGpuReg:BLDALPHA:12:6');
};

export const LevelUpVerticalSpritesTaskIsRunning = (runtime: PokemonSpecialAnimSceneRuntime): boolean =>
  funcIsActiveTask(runtime, 'Task_LevelUpVerticalSprites');

export const Task_LevelUpVerticalSprites = (runtime: PokemonSpecialAnimSceneRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  if (!task || task.destroyed) return;
  const data = task.data;
  switch (data[0]) {
    case 0:
      if (data[3] === 0) {
        data[3]++;
        CreateLevelUpVerticalSprite(runtime, taskId, data);
        if (data[2] > 17) data[0]++;
      } else {
        data[3]++;
        if (data[3] === 2) data[3] = 0;
      }
      break;
    case 1:
      if (data[1] === 0) {
        runtime.operations.push(`FreeSpriteTilesByTag:${data[6]}`, `FreeSpritePaletteByTag:${data[7]}`);
        destroyTask(runtime, taskId);
      }
      break;
  }
};

export const CreateLevelUpVerticalSprite = (
  runtime: PokemonSpecialAnimSceneRuntime,
  taskId: number,
  data: number[]
): void => {
  data[2]++;
  const sprite = createSprite(runtime, 'LevelUpVertical', ((data[2] * 219) & 0x3f) + data[4], data[5], data[9], 'SpriteCB_LevelUpVertical');
  sprite.oam.priority = data[8];
  sprite.data[1] = 0;
  sprite.data[2] = (advanceDecompRng(data[2]) & 0x3f) + 0x20;
  sprite.data[7] = taskId;
  data[1]++;
};

export const SpriteCB_LevelUpVertical = (runtime: PokemonSpecialAnimSceneRuntime, sprite: PsaSprite): void => {
  sprite.data[1] -= sprite.data[2];
  sprite.y2 = sprite.data[1] >> 4;
  if (sprite.y2 < -0x40) {
    runtime.tasks[sprite.data[7]].data[1]--;
    destroySprite(runtime, sprite);
  }
};

export interface LevelUpWindowEntry {
  windowId: number;
  x: number;
  y: number;
  text: string;
  colors: [number, number, number];
}

const sLevelUpWindowStatNames = ['MAX. HP', 'ATTACK', 'DEFENSE', 'SP. ATK', 'SP. DEF', 'SPEED'];

export const DrawLevelUpWindowPg1 = (
  _runtime: PokemonSpecialAnimSceneRuntime,
  windowId: number,
  beforeStats: number[],
  afterStats: number[],
  bgColor: number,
  fgColor: number,
  shadowColor: number
): LevelUpWindowEntry[] => {
  const diffStats = [
    afterStats[0] - beforeStats[0],
    afterStats[1] - beforeStats[1],
    afterStats[2] - beforeStats[2],
    afterStats[4] - beforeStats[4],
    afterStats[5] - beforeStats[5],
    afterStats[3] - beforeStats[3]
  ].map(toI16);
  const colors: [number, number, number] = [bgColor, fgColor, shadowColor];
  const entries: LevelUpWindowEntry[] = [];
  for (let i = 0; i < 6; i++) {
    entries.push({ windowId, x: 0, y: i * 15, text: sLevelUpWindowStatNames[i], colors });
    entries.push({ windowId, x: 56, y: i * 15, text: diffStats[i] >= 0 ? '+' : '-', colors });
    const x = abs(diffStats[i]) < 10 ? 12 : 6;
    entries.push({ windowId, x: x + 56, y: i * 15, text: ` ${abs(diffStats[i])}`.padEnd(3, ' '), colors });
  }
  return entries;
};

export const PSA_DrawLevelUpWindowPg1 = (
  runtime: PokemonSpecialAnimSceneRuntime,
  statsBefore: number[],
  statsAfter: number[]
): LevelUpWindowEntry[] => {
  runtime.operations.push('DrawTextBorderOuter:1:0x001:14');
  const entries = DrawLevelUpWindowPg1(runtime, 1, statsBefore, statsAfter, 0, 1, 2);
  runtime.operations.push('PutWindowTilemap:1', 'CopyWindowToVram:1:FULL');
  return entries;
};

export const DrawLevelUpWindowPg2 = (
  _runtime: PokemonSpecialAnimSceneRuntime,
  windowId: number,
  currStats: number[],
  bgColor: number,
  fgColor: number,
  shadowColor: number
): LevelUpWindowEntry[] => {
  const statsRearrange = [currStats[0], currStats[1], currStats[2], currStats[4], currStats[5], currStats[3]];
  const colors: [number, number, number] = [bgColor, fgColor, shadowColor];
  const entries: LevelUpWindowEntry[] = [];
  for (let i = 0; i < 6; i++) {
    const ndigits = statsRearrange[i] >= 100 ? 3 : statsRearrange[i] >= 10 ? 2 : 1;
    const x = 6 * (4 - ndigits);
    entries.push({ windowId, x: 0, y: i * 15, text: sLevelUpWindowStatNames[i], colors });
    entries.push({ windowId, x: 56 + x, y: i * 15, text: `${statsRearrange[i]}`, colors });
  }
  return entries;
};

export const PSA_DrawLevelUpWindowPg2 = (
  runtime: PokemonSpecialAnimSceneRuntime,
  currStats: number[]
): LevelUpWindowEntry[] => {
  const entries = DrawLevelUpWindowPg2(runtime, 1, currStats, 0, 1, 2);
  runtime.operations.push('CopyWindowToVram:1:GFX');
  return entries;
};

export const StartSpriteAffineAnim = (sprite: PsaSprite, anim: number): void => {
  sprite.affineAnim = anim;
  sprite.affineAnimEnded = true;
};

export const StartSpriteAnim = (sprite: PsaSprite, anim: number): void => {
  sprite.anim = anim;
};

export const callPsaSpriteCallback = (runtime: PokemonSpecialAnimSceneRuntime, sprite: PsaSprite): void => {
  if (sprite.destroyed) return;
  switch (sprite.callback) {
    case 'SpriteCallback_MonSpriteWiggle':
      SpriteCallback_MonSpriteWiggle(runtime, sprite);
      break;
    case 'SpriteCB_MachineSetWobble':
      SpriteCB_MachineSetWobble(runtime, sprite);
      break;
    case 'SpriteCB_Star':
      SpriteCB_Star(runtime, sprite);
      break;
    case 'SpriteCB_OutwardSpiralDots':
      SpriteCB_OutwardSpiralDots(runtime, sprite);
      break;
    case 'SpriteCallback_UseItem_OutwardSpiralDots':
      SpriteCallback_UseItem_OutwardSpiralDots(runtime, sprite);
      break;
    case 'SpriteCB_LevelUpVertical':
      SpriteCB_LevelUpVertical(runtime, sprite);
      break;
    case 'SpriteCallbackDummy':
      break;
  }
};

export const callPsaTask = (runtime: PokemonSpecialAnimSceneRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  if (!task || task.destroyed) return;
  switch (task.func) {
    case 'Task_ZoomAnim':
      Task_ZoomAnim(runtime, taskId);
      break;
    case 'Task_ItemUseOnMonAnim':
      Task_ItemUseOnMonAnim(runtime, taskId);
      break;
    case 'Task_UseItem_OutwardSpiralDots':
      Task_UseItem_OutwardSpiralDots(runtime, taskId);
      break;
    case 'Task_LevelUpVerticalSprites':
      Task_LevelUpVerticalSprites(runtime, taskId);
      break;
  }
};
