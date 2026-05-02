import {
  WEATHER_DOWNPOUR,
  WEATHER_FOG_DIAGONAL,
  WEATHER_FOG_HORIZONTAL,
  WEATHER_NONE,
  WEATHER_RAIN,
  WEATHER_RAIN_THUNDERSTORM,
  WEATHER_SANDSTORM,
  WEATHER_SHADE,
  WEATHER_SNOW,
  WEATHER_SUNNY,
  WEATHER_SUNNY_CLOUDS,
  WEATHER_UNDERWATER,
  WEATHER_UNDERWATER_BUBBLES,
  WEATHER_VOLCANIC_ASH
} from './decompFieldWeatherUtil';
import { gSineTable } from './decompTrig';

export {
  WEATHER_DOWNPOUR,
  WEATHER_FOG_DIAGONAL,
  WEATHER_FOG_HORIZONTAL,
  WEATHER_NONE,
  WEATHER_RAIN,
  WEATHER_RAIN_THUNDERSTORM,
  WEATHER_SANDSTORM,
  WEATHER_SHADE,
  WEATHER_SNOW,
  WEATHER_SUNNY,
  WEATHER_SUNNY_CLOUDS,
  WEATHER_UNDERWATER,
  WEATHER_UNDERWATER_BUBBLES,
  WEATHER_VOLCANIC_ASH
} from './decompFieldWeatherUtil';

export const WEATHER_DROUGHT = 12;

export const WEATHER_PAL_STATE_CHANGING_WEATHER = 0;
export const WEATHER_PAL_STATE_SCREEN_FADING_IN = 1;
export const WEATHER_PAL_STATE_SCREEN_FADING_OUT = 2;
export const WEATHER_PAL_STATE_IDLE = 3;

export const FADE_FROM_BLACK = 0;
export const FADE_TO_BLACK = 1;
export const FADE_FROM_WHITE = 2;
export const FADE_TO_WHITE = 3;

export const COORD_EVENT_WEATHER_SUNNY_CLOUDS = 1;
export const COORD_EVENT_WEATHER_SUNNY = 2;
export const COORD_EVENT_WEATHER_RAIN = 3;
export const COORD_EVENT_WEATHER_SNOW = 4;
export const COORD_EVENT_WEATHER_RAIN_THUNDERSTORM = 5;
export const COORD_EVENT_WEATHER_FOG_HORIZONTAL = 6;
export const COORD_EVENT_WEATHER_FOG_DIAGONAL = 7;
export const COORD_EVENT_WEATHER_VOLCANIC_ASH = 8;
export const COORD_EVENT_WEATHER_SANDSTORM = 9;
export const COORD_EVENT_WEATHER_SHADE = 10;

export const SE_THUNDERSTORM = 74;
export const SE_THUNDERSTORM_STOP = 75;
export const SE_DOWNPOUR = 76;
export const SE_DOWNPOUR_STOP = 77;
export const SE_RAIN = 78;
export const SE_RAIN_STOP = 79;
export const SE_THUNDER = 80;
export const SE_THUNDER2 = 81;

export const TSTORM_STATE_LOAD_RAIN = 0;
export const TSTORM_STATE_CREATE_RAIN = 1;
export const TSTORM_STATE_INIT_RAIN = 2;
export const TSTORM_STATE_WAIT_CHANGE = 3;
export const TSTORM_STATE_LOOP_START = 4;
export const TSTORM_STATE_LOOP_WAIT = 5;
export const TSTORM_STATE_INIT_THUNDER_SHORT_1 = 6;
export const TSTORM_STATE_INIT_THUNDER_SHORT_2 = 7;
export const TSTORM_STATE_TRY_THUNDER_SHORT = 8;
export const TSTORM_STATE_TRY_NEW_THUNDER = 9;
export const TSTORM_STATE_WAIT_THUNDER_SHORT = 10;
export const TSTORM_STATE_INIT_THUNDER_LONG = 11;
export const TSTORM_STATE_WAIT_THUNDER_LONG = 12;
export const TSTORM_STATE_FADE_THUNDER_LONG = 13;
export const TSTORM_STATE_END_THUNDER_LONG = 14;

export const GAMMA_NONE = 0;
export const GAMMA_NORMAL = 1;
export const GAMMA_ALT = 2;

export const PALETTES_ALL = 0xffffffff;
export const RGB_BLACK = 0;
export const RGB_WHITEALPHA = 0x7fff;
export const REG_OFFSET_WININ = 0x48;
export const REG_OFFSET_BLDCNT = 0x50;
export const REG_OFFSET_BLDALPHA = 0x52;
export const REG_OFFSET_BLDY = 0x54;
export const WIN_RANGE = (a: number, b: number): number => ((a & 0xff) << 8) | (b & 0xff);
export const BLDCNT_TGT1_BG1 = 1 << 1;
export const BLDCNT_TGT1_BG2 = 1 << 2;
export const BLDCNT_TGT1_BG3 = 1 << 3;
export const BLDCNT_TGT1_OBJ = 1 << 4;
export const BLDCNT_EFFECT_LIGHTEN = 2 << 6;

export const gDefaultWeatherSpritePalette = 'graphics/weather/default.gbapal';
export const gCloudsWeatherPalette = 'graphics/weather/cloud.gbapal';
export const gSandstormWeatherPalette = 'graphics/weather/sandstorm.gbapal';
export const gWeatherFogDiagonalTiles = 'graphics/weather/fog_diagonal.4bpp';
export const gWeatherFogHorizontalTiles = 'graphics/weather/fog_horizontal.4bpp';
export const gWeatherCloudTiles = 'graphics/weather/cloud.4bpp';
export const gWeatherSnow1Tiles = 'graphics/weather/snow0.4bpp';
export const gWeatherSnow2Tiles = 'graphics/weather/snow1.4bpp';
export const gWeatherBubbleTiles = 'graphics/weather/bubble.4bpp';
export const gWeatherAshTiles = 'graphics/weather/ash.4bpp';
export const gWeatherRainTiles = 'graphics/weather/rain.4bpp';
export const gWeatherSandstormTiles = 'graphics/weather/sandstorm.4bpp';
export const NUM_CLOUD_SPRITES = 3;
export const NUM_FOG_HORIZONTAL_SPRITES = 20;
export const NUM_FOG_DIAGONAL_SPRITES = 20;
export const NUM_ASH_SPRITES = 20;
export const NUM_SANDSTORM_SPRITES = 20;
export const NUM_SWIRL_SANDSTORM_SPRITES = 5;
export const MAX_RAIN_SPRITES = 24;
export const MAX_SPRITES = 128;
export const DISPLAY_WIDTH = 240;
export const DISPLAY_HEIGHT = 160;
export const MIN_SANDSTORM_WAVE_INDEX = 0x20;

export const sCloudSpriteMapCoords = [
  { x: 0, y: 66 },
  { x: 5, y: 73 },
  { x: 10, y: 78 }
] as const;

export const sRainSpriteMovement = [
  [-0x68, 0x0d0],
  [-0x0a0, 0x140]
] as const;

export const sRainSpriteFallingDurations = [
  [18, 7],
  [12, 10]
] as const;

export const sRainSpriteCoords = [
  { x: 0, y: 0 },
  { x: 0, y: 160 },
  { x: 0, y: 64 },
  { x: 144, y: 224 },
  { x: 144, y: 128 },
  { x: 32, y: 32 },
  { x: 32, y: 192 },
  { x: 32, y: 96 },
  { x: 72, y: 128 },
  { x: 72, y: 32 },
  { x: 72, y: 192 },
  { x: 216, y: 96 },
  { x: 216, y: 0 },
  { x: 104, y: 160 },
  { x: 104, y: 64 },
  { x: 104, y: 224 },
  { x: 144, y: 0 },
  { x: 144, y: 160 },
  { x: 144, y: 64 },
  { x: 32, y: 224 },
  { x: 32, y: 128 },
  { x: 72, y: 32 },
  { x: 72, y: 192 },
  { x: 48, y: 96 }
] as const;

export interface WeatherSprite {
  x: number;
  y: number;
  x2: number;
  y2: number;
  data: number[];
  invisible: boolean;
  animEnded: boolean;
  animNum: number;
  coordOffsetEnabled: boolean;
  callback: string;
  template: string;
  priority: number;
  centerToCornerVecX: number;
  centerToCornerVecY: number;
  oamSize: number;
}

export interface WeatherEffectTask {
  id: number;
  data: number[];
  func: string;
  destroyed: boolean;
}

export interface WeatherEffectsRuntime {
  isDownpour: boolean;
  palProcessingState: number;
  initStep: number;
  finishStep: number;
  weatherGfxLoaded: boolean;
  currWeather: number;
  nextWeather: number;
  gSpriteCoordOffsetX: number;
  gSpriteCoordOffsetY: number;
  rainSpriteCount: number;
  curRainSpriteIndex: number;
  targetRainSpriteCount: number;
  rainSpriteVisibleCounter: number;
  rainSpriteVisibleDelay: number;
  rainStrength: number;
  cloudSpritesCreated: boolean;
  cloudSprites: Array<WeatherSprite | null>;
  ashSpritesCreated: boolean;
  ashSprites: Array<WeatherSprite | null>;
  ashBaseSpritesX: number;
  ashUnused: number;
  fogHSpritesCreated: boolean;
  fogHSprites: Array<WeatherSprite | null>;
  fogHScrollCounter: number;
  fogHScrollOffset: number;
  fogHScrollPosX: number;
  fogDSpritesCreated: boolean;
  fogDSprites: Array<WeatherSprite | null>;
  fogDScrollXCounter: number;
  fogDScrollYCounter: number;
  fogDXOffset: number;
  fogDYOffset: number;
  fogDBaseSpritesX: number;
  fogDPosY: number;
  sandstormSpritesCreated: boolean;
  sandstormSwirlSpritesCreated: boolean;
  sandstormSprites1: Array<WeatherSprite | null>;
  sandstormSprites2: Array<WeatherSprite | null>;
  sandstormXOffset: number;
  sandstormYOffset: number;
  sandstormWaveIndex: number;
  sandstormWaveCounter: number;
  sandstormBaseSpritesX: number;
  sandstormPosY: number;
  bubblesSpritesCreated: boolean;
  bubblesDelayCounter: number;
  bubblesDelayIndex: number;
  bubblesCoordsIndex: number;
  bubblesSpriteCount: number;
  bubbleSprites: Array<WeatherSprite | null>;
  thunderTriggered: boolean;
  thunderAllowEnd: boolean;
  thunderSkipShort: number;
  thunderShortRetries: number;
  thunderDelay: number;
  thunderCounter: number;
  sePlaying: boolean;
  currBlendEVA: number;
  currBlendEVB: number;
  targetBlendEVA: number;
  targetBlendEVB: number;
  blendDelay: number;
  blendFrameCounter: number;
  blendUpdateCounter: number;
  gpuRegs: Map<number, number>;
  tasks: WeatherEffectTask[];
  gammaTargetIndex: number;
  gammaStepDelay: number;
  loadDroughtPalsIndex: number;
  loadDroughtPalsOffset: number;
  droughtBrightnessStage: number;
  droughtTimer: number;
  droughtState: number;
  droughtLastBrightnessStage: number;
  droughtFrameDelay: number;
  gSaveBlock1PosX: number;
  gSaveBlock1PosY: number;
  gFieldCameraX: number;
  gFieldCameraY: number;
  gTotalCameraPixelOffsetX: number;
  gTotalCameraPixelOffsetY: number;
  rainSprites: Array<WeatherSprite | null>;
  snowflakeTimer: number;
  snowflakeSpriteCount: number;
  targetSnowflakeSpriteCount: number;
  snowflakeVisibleCounter: number;
  snowflakeSprites: Array<WeatherSprite | null>;
  rngValues: number[];
  operations: string[];
  playedSoundEffects: number[];
}

export const createWeatherSprite = (overrides: Partial<WeatherSprite> = {}): WeatherSprite => ({
  x: 0,
  y: 0,
  x2: 0,
  y2: 0,
  data: Array.from({ length: 8 }, () => 0),
  invisible: false,
  animEnded: false,
  animNum: 0,
  coordOffsetEnabled: false,
  callback: '',
  template: '',
  priority: 0,
  centerToCornerVecX: 0,
  centerToCornerVecY: 0,
  oamSize: 0,
  ...overrides
});

export const createWeatherEffectsRuntime = (overrides: Partial<WeatherEffectsRuntime> = {}): WeatherEffectsRuntime => ({
  isDownpour: false,
  palProcessingState: WEATHER_PAL_STATE_IDLE,
  initStep: 0,
  finishStep: 0,
  weatherGfxLoaded: false,
  currWeather: WEATHER_NONE,
  nextWeather: WEATHER_NONE,
  gSpriteCoordOffsetX: 0,
  gSpriteCoordOffsetY: 0,
  rainSpriteCount: 0,
  curRainSpriteIndex: 0,
  targetRainSpriteCount: 0,
  rainSpriteVisibleCounter: 0,
  rainSpriteVisibleDelay: 0,
  rainStrength: 0,
  cloudSpritesCreated: false,
  cloudSprites: Array.from({ length: NUM_CLOUD_SPRITES }, () => null),
  ashSpritesCreated: false,
  ashSprites: Array.from({ length: NUM_ASH_SPRITES }, () => null),
  ashBaseSpritesX: 0,
  ashUnused: 0,
  fogHSpritesCreated: false,
  fogHSprites: Array.from({ length: NUM_FOG_HORIZONTAL_SPRITES }, () => null),
  fogHScrollCounter: 0,
  fogHScrollOffset: 0,
  fogHScrollPosX: 0,
  fogDSpritesCreated: false,
  fogDSprites: Array.from({ length: NUM_FOG_DIAGONAL_SPRITES }, () => null),
  fogDScrollXCounter: 0,
  fogDScrollYCounter: 0,
  fogDXOffset: 0,
  fogDYOffset: 0,
  fogDBaseSpritesX: 0,
  fogDPosY: 0,
  sandstormSpritesCreated: false,
  sandstormSwirlSpritesCreated: false,
  sandstormSprites1: Array.from({ length: NUM_SANDSTORM_SPRITES }, () => null),
  sandstormSprites2: Array.from({ length: NUM_SWIRL_SANDSTORM_SPRITES }, () => null),
  sandstormXOffset: 0,
  sandstormYOffset: 0,
  sandstormWaveIndex: 0,
  sandstormWaveCounter: 0,
  sandstormBaseSpritesX: 0,
  sandstormPosY: 0,
  bubblesSpritesCreated: false,
  bubblesDelayCounter: 0,
  bubblesDelayIndex: 0,
  bubblesCoordsIndex: 0,
  bubblesSpriteCount: 0,
  bubbleSprites: Array.from({ length: MAX_SPRITES }, () => null),
  thunderTriggered: false,
  thunderAllowEnd: false,
  thunderSkipShort: 0,
  thunderShortRetries: 0,
  thunderDelay: 0,
  thunderCounter: 0,
  sePlaying: false,
  currBlendEVA: 0,
  currBlendEVB: 0,
  targetBlendEVA: 0,
  targetBlendEVB: 0,
  blendDelay: 0,
  blendFrameCounter: 0,
  blendUpdateCounter: 0,
  gpuRegs: new Map(),
  tasks: [],
  gammaTargetIndex: 0,
  gammaStepDelay: 0,
  loadDroughtPalsIndex: 0,
  loadDroughtPalsOffset: 0,
  droughtBrightnessStage: 0,
  droughtTimer: 0,
  droughtState: 0,
  droughtLastBrightnessStage: 0,
  droughtFrameDelay: 0,
  gSaveBlock1PosX: 0,
  gSaveBlock1PosY: 0,
  gFieldCameraX: 0,
  gFieldCameraY: 0,
  gTotalCameraPixelOffsetX: 0,
  gTotalCameraPixelOffsetY: 0,
  rainSprites: Array.from({ length: MAX_RAIN_SPRITES }, () => null),
  snowflakeTimer: 0,
  snowflakeSpriteCount: 0,
  targetSnowflakeSpriteCount: 0,
  snowflakeVisibleCounter: 0,
  snowflakeSprites: Array.from({ length: 16 }, () => null),
  rngValues: [],
  operations: [],
  playedSoundEffects: [],
  ...overrides
});

const tCounter = 0;
const tRandom = 1;
const tPosX = 2;
const tPosY = 3;
const tState = 4;
const tActive = 5;
const tWaiting = 6;

const tSnowPosY = 0;
const tDeltaY = 1;
const tWaveDelta = 2;
const tWaveIndex = 3;
const tSnowflakeId = 4;
const tFallCounter = 5;
const tFallDuration = 6;
const tDeltaY2 = 7;

const u32 = (value: number): number => value >>> 0;
const s16Value = (value: number): number => (value << 16) >> 16;

export const isoRandomize2 = (value: number): number =>
  u32(Math.imul(1103515245, value >>> 0) + 12345);

const random = (runtime: WeatherEffectsRuntime): number =>
  (runtime.rngValues.shift() ?? 0) & 0xffff;

export const updateCloudSprite = (sprite: WeatherSprite): void => {
  sprite.data[0] = (sprite.data[0] + 1) & 1;
  if (sprite.data[0]) sprite.x -= 1;
};

export const weatherEffectsSetBlendCoeffs = (runtime: WeatherEffectsRuntime, eva: number, evb: number): void => {
  runtime.currBlendEVA = eva;
  runtime.currBlendEVB = evb;
  runtime.targetBlendEVA = eva;
  runtime.targetBlendEVB = evb;
  runtime.gpuRegs.set(REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(eva, evb));
};

export const weatherEffectsSetTargetBlendCoeffs = (
  runtime: WeatherEffectsRuntime,
  eva: number,
  evb: number,
  delay: number
): void => {
  runtime.targetBlendEVA = eva;
  runtime.targetBlendEVB = evb;
  runtime.blendDelay = delay;
  runtime.blendFrameCounter = 0;
  runtime.blendUpdateCounter = 0;
};

export const weatherEffectsUpdateBlend = (runtime: WeatherEffectsRuntime): boolean => {
  if (runtime.currBlendEVA === runtime.targetBlendEVA && runtime.currBlendEVB === runtime.targetBlendEVB)
    return true;

  if (++runtime.blendFrameCounter > runtime.blendDelay) {
    runtime.blendFrameCounter = 0;
    runtime.blendUpdateCounter++;

    if (runtime.blendUpdateCounter & 1) {
      if (runtime.currBlendEVA < runtime.targetBlendEVA) runtime.currBlendEVA++;
      else if (runtime.currBlendEVA > runtime.targetBlendEVA) runtime.currBlendEVA--;
    } else {
      if (runtime.currBlendEVB < runtime.targetBlendEVB) runtime.currBlendEVB++;
      else if (runtime.currBlendEVB > runtime.targetBlendEVB) runtime.currBlendEVB--;
    }
  }

  runtime.gpuRegs.set(REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(runtime.currBlendEVA, runtime.currBlendEVB));
  return runtime.currBlendEVA === runtime.targetBlendEVA && runtime.currBlendEVB === runtime.targetBlendEVB;
};

const setWeatherSpritePosToMapCoords = (
  runtime: WeatherEffectsRuntime,
  mapX: number,
  mapY: number
): { x: number; y: number } => {
  let dx = -runtime.gTotalCameraPixelOffsetX - runtime.gFieldCameraX;
  let dy = -runtime.gTotalCameraPixelOffsetY - runtime.gFieldCameraY;
  if (runtime.gFieldCameraX > 0)
    dx += 1 << 4;
  if (runtime.gFieldCameraX < 0)
    dx -= 1 << 4;
  if (runtime.gFieldCameraY > 0)
    dy += 1 << 4;
  if (runtime.gFieldCameraY < 0)
    dy -= 1 << 4;

  return {
    x: ((mapX - runtime.gSaveBlock1PosX) << 4) + dx,
    y: ((mapY - runtime.gSaveBlock1PosY) << 4) + dy
  };
};

export const createCloudSprites = (runtime: WeatherEffectsRuntime): void => {
  if (runtime.cloudSpritesCreated === true)
    return;

  runtime.operations.push('LoadSpriteSheet(sCloudSpriteSheet)');
  runtime.operations.push('LoadCustomWeatherSpritePalette(gCloudsWeatherPalette)');

  for (let i = 0; i < NUM_CLOUD_SPRITES; i += 1) {
    const pos = setWeatherSpritePosToMapCoords(runtime, sCloudSpriteMapCoords[i].x + 7, sCloudSpriteMapCoords[i].y + 7);
    const sprite = createWeatherSprite({ x: pos.x, y: pos.y, coordOffsetEnabled: true, callback: 'UpdateCloudSprite' });
    runtime.cloudSprites[i] = sprite;
    runtime.operations.push(`CreateSprite(sCloudSpriteTemplate):${i}`);
  }

  runtime.cloudSpritesCreated = true;
};

export const destroyCloudSprites = (runtime: WeatherEffectsRuntime): void => {
  if (!runtime.cloudSpritesCreated)
    return;

  for (let i = 0; i < NUM_CLOUD_SPRITES; i += 1) {
    if (runtime.cloudSprites[i] !== null)
      runtime.operations.push(`DestroySprite(cloudSprites[${i}])`);
    runtime.cloudSprites[i] = null;
  }

  runtime.operations.push('FreeSpriteTilesByTag(GFXTAG_CLOUD)');
  runtime.cloudSpritesCreated = false;
};

export const cloudsInitVars = (runtime: WeatherEffectsRuntime): void => {
  runtime.gammaTargetIndex = 0;
  runtime.gammaStepDelay = 20;
  runtime.initStep = 0;
  runtime.weatherGfxLoaded = false;
  if (!runtime.cloudSpritesCreated)
    weatherEffectsSetBlendCoeffs(runtime, 0, 16);
};

export const cloudsMain = (runtime: WeatherEffectsRuntime): void => {
  switch (runtime.initStep) {
    case 0:
      createCloudSprites(runtime);
      runtime.initStep++;
      break;
    case 1:
      weatherEffectsSetTargetBlendCoeffs(runtime, 12, 8, 1);
      runtime.initStep++;
      break;
    case 2:
      if (weatherEffectsUpdateBlend(runtime)) {
        runtime.weatherGfxLoaded = true;
        runtime.initStep++;
      }
      break;
  }
};

export const cloudsInitAll = (runtime: WeatherEffectsRuntime): void => {
  cloudsInitVars(runtime);
  while (!runtime.weatherGfxLoaded)
    cloudsMain(runtime);
};

export const cloudsFinish = (runtime: WeatherEffectsRuntime): boolean => {
  switch (runtime.finishStep) {
    case 0:
      weatherEffectsSetTargetBlendCoeffs(runtime, 0, 16, 1);
      runtime.finishStep++;
      return true;
    case 1:
      if (weatherEffectsUpdateBlend(runtime)) {
        destroyCloudSprites(runtime);
        runtime.finishStep++;
      }
      return true;
  }
  return false;
};

export const Clouds_InitVars = cloudsInitVars;
export const Clouds_InitAll = cloudsInitAll;
export const Clouds_Main = cloudsMain;
export const Clouds_Finish = cloudsFinish;

export const sunnyInitVars = (runtime: WeatherEffectsRuntime): void => {
  runtime.gammaTargetIndex = 0;
  runtime.gammaStepDelay = 20;
};

export const sunnyInitAll = (runtime: WeatherEffectsRuntime): void => {
  sunnyInitVars(runtime);
};

export const sunnyMain = (_runtime: WeatherEffectsRuntime): void => {
};

export const sunnyFinish = (_runtime: WeatherEffectsRuntime): boolean => false;

export const Sunny_InitVars = sunnyInitVars;
export const Sunny_InitAll = sunnyInitAll;
export const Sunny_Main = sunnyMain;
export const Sunny_Finish = sunnyFinish;

export const createWeatherEffectTask = (
  runtime: WeatherEffectsRuntime,
  func: string,
  priority: number
): WeatherEffectTask => {
  const task = {
    id: runtime.tasks.length,
    data: Array.from({ length: 16 }, () => 0),
    func,
    destroyed: false
  };
  runtime.tasks[task.id] = task;
  runtime.operations.push(`CreateTask:${func}:${priority}`);
  return task;
};

export const resetDroughtWeatherPaletteLoadingForEffects = (runtime: WeatherEffectsRuntime): void => {
  runtime.loadDroughtPalsIndex = 1;
  runtime.loadDroughtPalsOffset = 1;
  runtime.operations.push('ResetDroughtWeatherPaletteLoading');
};

export const loadDroughtWeatherPalettesForEffects = (runtime: WeatherEffectsRuntime): boolean => {
  if (runtime.loadDroughtPalsIndex < 32) {
    runtime.operations.push(`LoadDroughtWeatherPalette:${runtime.loadDroughtPalsIndex}:${runtime.loadDroughtPalsOffset}`);
    runtime.loadDroughtPalsIndex++;
    runtime.loadDroughtPalsOffset++;
    if (runtime.loadDroughtPalsIndex < 32)
      return true;
  }
  return false;
};

const setDroughtGammaForEffects = (runtime: WeatherEffectsRuntime, gammaIndex: number): void => {
  runtime.operations.push(`WeatherShiftGammaIfPalStateIdle:${-gammaIndex - 1}`);
};

export const droughtStateInitForEffects = (runtime: WeatherEffectsRuntime): void => {
  runtime.droughtBrightnessStage = 0;
  runtime.droughtTimer = 0;
  runtime.droughtState = 0;
  runtime.droughtLastBrightnessStage = 0;
  runtime.droughtFrameDelay = 5;
  runtime.operations.push('DroughtStateInit');
};

const sineTableValue = (index: number): number => Math.round(Math.sin((index & 0xff) * Math.PI * 2 / 256) * 256);

export const droughtStateRunForEffects = (runtime: WeatherEffectsRuntime): void => {
  switch (runtime.droughtState) {
    case 0:
      if (++runtime.droughtTimer > runtime.droughtFrameDelay) {
        runtime.droughtTimer = 0;
        setDroughtGammaForEffects(runtime, runtime.droughtBrightnessStage++);
        if (runtime.droughtBrightnessStage > 5) {
          runtime.droughtLastBrightnessStage = runtime.droughtBrightnessStage;
          runtime.droughtState = 1;
          runtime.droughtTimer = 60;
        }
      }
      break;
    case 1:
      runtime.droughtTimer = (runtime.droughtTimer + 3) & 0x7f;
      runtime.droughtBrightnessStage = ((sineTableValue(runtime.droughtTimer) - 1) >> 6) + 2;
      if (runtime.droughtBrightnessStage !== runtime.droughtLastBrightnessStage)
        setDroughtGammaForEffects(runtime, runtime.droughtBrightnessStage);
      runtime.droughtLastBrightnessStage = runtime.droughtBrightnessStage;
      break;
    case 2:
      if (++runtime.droughtTimer > runtime.droughtFrameDelay) {
        runtime.droughtTimer = 0;
        setDroughtGammaForEffects(runtime, --runtime.droughtBrightnessStage);
        if (runtime.droughtBrightnessStage === 3)
          runtime.droughtState = 0;
      }
      break;
  }
};

export const droughtInitVars = (runtime: WeatherEffectsRuntime): void => {
  runtime.initStep = 0;
  runtime.weatherGfxLoaded = false;
  runtime.gammaTargetIndex = 0;
  runtime.gammaStepDelay = 0;
};

export const droughtMain = (runtime: WeatherEffectsRuntime): void => {
  switch (runtime.initStep) {
    case 0:
      if (runtime.palProcessingState !== WEATHER_PAL_STATE_CHANGING_WEATHER)
        runtime.initStep++;
      break;
    case 1:
      resetDroughtWeatherPaletteLoadingForEffects(runtime);
      runtime.initStep++;
      break;
    case 2:
      if (!loadDroughtWeatherPalettesForEffects(runtime))
        runtime.initStep++;
      break;
    case 3:
      droughtStateInitForEffects(runtime);
      runtime.initStep++;
      break;
    case 4:
      droughtStateRunForEffects(runtime);
      if (runtime.droughtBrightnessStage === 6) {
        runtime.weatherGfxLoaded = true;
        runtime.initStep++;
      }
      break;
    default:
      droughtStateRunForEffects(runtime);
      break;
  }
};

export const droughtInitAll = (runtime: WeatherEffectsRuntime): void => {
  droughtInitVars(runtime);
  while (!runtime.weatherGfxLoaded)
    droughtMain(runtime);
};

export const droughtFinish = (_runtime: WeatherEffectsRuntime): boolean => false;

export const startDroughtWeatherBlend = (runtime: WeatherEffectsRuntime): WeatherEffectTask =>
  createWeatherEffectTask(runtime, 'UpdateDroughtBlend', 0x50);

const tDroughtBlendState = 0;
const tDroughtBlendY = 1;
const tDroughtBlendDelay = 2;
const tDroughtWinRange = 3;

export const updateDroughtBlend = (runtime: WeatherEffectsRuntime, task: WeatherEffectTask): void => {
  switch (task.data[tDroughtBlendState]) {
    case 0:
      task.data[tDroughtBlendY] = 0;
      task.data[tDroughtBlendDelay] = 0;
      task.data[tDroughtWinRange] = runtime.gpuRegs.get(REG_OFFSET_WININ) ?? 0;
      runtime.gpuRegs.set(REG_OFFSET_WININ, WIN_RANGE(63, 63));
      runtime.gpuRegs.set(
        REG_OFFSET_BLDCNT,
        BLDCNT_TGT1_BG1 | BLDCNT_TGT1_BG2 | BLDCNT_TGT1_BG3 | BLDCNT_TGT1_OBJ | BLDCNT_EFFECT_LIGHTEN
      );
      runtime.gpuRegs.set(REG_OFFSET_BLDY, 0);
      task.data[tDroughtBlendState]++;

    // fall through
    case 1:
      task.data[tDroughtBlendY] += 3;
      if (task.data[tDroughtBlendY] > 16)
        task.data[tDroughtBlendY] = 16;
      runtime.gpuRegs.set(REG_OFFSET_BLDY, task.data[tDroughtBlendY]);
      if (task.data[tDroughtBlendY] >= 16)
        task.data[tDroughtBlendState]++;
      break;
    case 2:
      task.data[tDroughtBlendDelay]++;
      if (task.data[tDroughtBlendDelay] > 9) {
        task.data[tDroughtBlendDelay] = 0;
        task.data[tDroughtBlendY]--;
        if (task.data[tDroughtBlendY] <= 0) {
          task.data[tDroughtBlendY] = 0;
          task.data[tDroughtBlendState]++;
        }
        runtime.gpuRegs.set(REG_OFFSET_BLDY, task.data[tDroughtBlendY]);
      }
      break;
    case 3:
      runtime.gpuRegs.set(REG_OFFSET_BLDCNT, 0);
      runtime.gpuRegs.set(REG_OFFSET_BLDY, 0);
      runtime.gpuRegs.set(REG_OFFSET_WININ, task.data[tDroughtWinRange]);
      task.data[tDroughtBlendState]++;
      break;
    case 4:
      runtime.operations.push('ScriptContext_Enable');
      task.destroyed = true;
      runtime.operations.push(`DestroyTask:${task.id}`);
      break;
  }
};

export const Drought_InitVars = droughtInitVars;
export const Drought_InitAll = droughtInitAll;
export const Drought_Main = droughtMain;
export const Drought_Finish = droughtFinish;
export const StartDroughtWeatherBlend = startDroughtWeatherBlend;
export const UpdateDroughtBlend = updateDroughtBlend;

const tFogHSpriteColumn = 0;

const updateFogHorizontalMovement = (runtime: WeatherEffectsRuntime): void => {
  runtime.fogHScrollPosX = (runtime.gSpriteCoordOffsetX - runtime.fogHScrollOffset) & 0xff;
  if (++runtime.fogHScrollCounter > 3) {
    runtime.fogHScrollCounter = 0;
    runtime.fogHScrollOffset++;
  }
};

export const fogHorizontalSpriteCallback = (runtime: WeatherEffectsRuntime, sprite: WeatherSprite): void => {
  sprite.y2 = runtime.gSpriteCoordOffsetY & 0xff;
  sprite.x = runtime.fogHScrollPosX + 32 + sprite.data[tFogHSpriteColumn] * 64;
  if (sprite.x >= DISPLAY_WIDTH + 32) {
    sprite.x = (DISPLAY_WIDTH * 2) + runtime.fogHScrollPosX - (4 - sprite.data[tFogHSpriteColumn]) * 64;
    sprite.x &= 0x1ff;
  }
};

export const createFogHorizontalSprites = (runtime: WeatherEffectsRuntime): void => {
  if (runtime.fogHSpritesCreated)
    return;

  runtime.operations.push('LoadSpriteSheet(sFogHorizontalSpriteSheet)');
  for (let i = 0; i < NUM_FOG_HORIZONTAL_SPRITES; i += 1) {
    const sprite = createWeatherSprite({
      x: (i % 5) * 64 + 32,
      y: Math.trunc(i / 5) * 64 + 32,
      callback: 'FogHorizontalSpriteCallback'
    });
    sprite.data[tFogHSpriteColumn] = i % 5;
    runtime.fogHSprites[i] = sprite;
    runtime.operations.push(`CreateSpriteAtEnd(sFogHorizontalSpriteTemplate):${i}:255`);
  }

  runtime.fogHSpritesCreated = true;
};

export const destroyFogHorizontalSprites = (runtime: WeatherEffectsRuntime): void => {
  if (!runtime.fogHSpritesCreated)
    return;

  for (let i = 0; i < NUM_FOG_HORIZONTAL_SPRITES; i += 1) {
    if (runtime.fogHSprites[i] !== null)
      runtime.operations.push(`DestroySprite(fogHSprites[${i}])`);
    runtime.fogHSprites[i] = null;
  }

  runtime.operations.push('FreeSpriteTilesByTag(GFXTAG_FOG_H)');
  runtime.fogHSpritesCreated = false;
};

export const fogHorizontalInitVars = (runtime: WeatherEffectsRuntime): void => {
  runtime.initStep = 0;
  runtime.weatherGfxLoaded = false;
  runtime.gammaTargetIndex = 0;
  runtime.gammaStepDelay = 20;
  if (!runtime.fogHSpritesCreated) {
    runtime.fogHScrollCounter = 0;
    runtime.fogHScrollOffset = 0;
    runtime.fogHScrollPosX = 0;
    weatherEffectsSetBlendCoeffs(runtime, 0, 16);
  }
};

export const fogHorizontalMain = (runtime: WeatherEffectsRuntime): void => {
  updateFogHorizontalMovement(runtime);
  switch (runtime.initStep) {
    case 0:
      createFogHorizontalSprites(runtime);
      if (runtime.currWeather === WEATHER_FOG_HORIZONTAL)
        weatherEffectsSetTargetBlendCoeffs(runtime, 12, 8, 3);
      else
        weatherEffectsSetTargetBlendCoeffs(runtime, 4, 16, 0);
      runtime.initStep++;
      break;
    case 1:
      if (weatherEffectsUpdateBlend(runtime)) {
        runtime.weatherGfxLoaded = true;
        runtime.initStep++;
      }
      break;
  }
};

export const fogHorizontalInitAll = (runtime: WeatherEffectsRuntime): void => {
  fogHorizontalInitVars(runtime);
  while (!runtime.weatherGfxLoaded)
    fogHorizontalMain(runtime);
};

export const fogHorizontalFinish = (runtime: WeatherEffectsRuntime): boolean => {
  updateFogHorizontalMovement(runtime);
  switch (runtime.finishStep) {
    case 0:
      weatherEffectsSetTargetBlendCoeffs(runtime, 0, 16, 3);
      runtime.finishStep++;
      break;
    case 1:
      if (weatherEffectsUpdateBlend(runtime))
        runtime.finishStep++;
      break;
    case 2:
      destroyFogHorizontalSprites(runtime);
      runtime.finishStep++;
      break;
    default:
      return false;
  }
  return true;
};

export const FogHorizontal_InitVars = fogHorizontalInitVars;
export const FogHorizontal_InitAll = fogHorizontalInitAll;
export const FogHorizontal_Main = fogHorizontalMain;
export const FogHorizontal_Finish = fogHorizontalFinish;

const tFogDSpriteColumn = 0;
const tFogDSpriteRow = 1;

export const updateFogDiagonalMovement = (runtime: WeatherEffectsRuntime): void => {
  if (++runtime.fogDScrollXCounter > 2) {
    runtime.fogDXOffset++;
    runtime.fogDScrollXCounter = 0;
  }

  if (++runtime.fogDScrollYCounter > 4) {
    runtime.fogDYOffset++;
    runtime.fogDScrollYCounter = 0;
  }

  runtime.fogDBaseSpritesX = (runtime.gSpriteCoordOffsetX - runtime.fogDXOffset) & 0xff;
  runtime.fogDPosY = runtime.gSpriteCoordOffsetY + runtime.fogDYOffset;
};

export const fogDiagonalSpriteCallback = (runtime: WeatherEffectsRuntime, sprite: WeatherSprite): void => {
  sprite.y2 = runtime.fogDPosY;
  sprite.x = runtime.fogDBaseSpritesX + 32 + sprite.data[tFogDSpriteColumn] * 64;
  if (sprite.x >= DISPLAY_WIDTH + 32) {
    sprite.x = runtime.fogDBaseSpritesX + (DISPLAY_WIDTH * 2) - (4 - sprite.data[tFogDSpriteColumn]) * 64;
    sprite.x &= 0x1ff;
  }
};

export const createFogDiagonalSprites = (runtime: WeatherEffectsRuntime): void => {
  if (runtime.fogDSpritesCreated)
    return;

  runtime.operations.push('LoadSpriteSheet(gFogDiagonalSpriteSheet)');
  for (let i = 0; i < NUM_FOG_DIAGONAL_SPRITES; i += 1) {
    const sprite = createWeatherSprite({
      x: 0,
      y: Math.trunc(i / 5) * 64,
      callback: 'UpdateFogDiagonalSprite'
    });
    sprite.data[tFogDSpriteColumn] = i % 5;
    sprite.data[tFogDSpriteRow] = Math.trunc(i / 5);
    runtime.fogDSprites[i] = sprite;
    runtime.operations.push(`CreateSpriteAtEnd(sFogDiagonalSpriteTemplate):${i}:255`);
  }

  runtime.fogDSpritesCreated = true;
};

export const destroyFogDiagonalSprites = (runtime: WeatherEffectsRuntime): void => {
  if (!runtime.fogDSpritesCreated)
    return;

  for (let i = 0; i < NUM_FOG_DIAGONAL_SPRITES; i += 1) {
    if (runtime.fogDSprites[i] !== null)
      runtime.operations.push(`DestroySprite(fogDSprites[${i}])`);
    runtime.fogDSprites[i] = null;
  }

  runtime.operations.push('FreeSpriteTilesByTag(GFXTAG_FOG_D)');
  runtime.fogDSpritesCreated = false;
};

export const fogDiagonalInitVars = (runtime: WeatherEffectsRuntime): void => {
  runtime.initStep = 0;
  runtime.weatherGfxLoaded = false;
  runtime.gammaTargetIndex = 0;
  runtime.gammaStepDelay = 20;
  runtime.fogHScrollCounter = 0;
  runtime.fogHScrollOffset = 1;
  if (!runtime.fogDSpritesCreated) {
    runtime.fogDScrollXCounter = 0;
    runtime.fogDScrollYCounter = 0;
    runtime.fogDXOffset = 0;
    runtime.fogDYOffset = 0;
    runtime.fogDBaseSpritesX = 0;
    runtime.fogDPosY = 0;
    weatherEffectsSetBlendCoeffs(runtime, 0, 16);
  }
};

export const fogDiagonalMain = (runtime: WeatherEffectsRuntime): void => {
  updateFogDiagonalMovement(runtime);
  switch (runtime.initStep) {
    case 0:
      createFogDiagonalSprites(runtime);
      runtime.initStep++;
      break;
    case 1:
      weatherEffectsSetTargetBlendCoeffs(runtime, 12, 8, 8);
      runtime.initStep++;
      break;
    case 2:
      if (!weatherEffectsUpdateBlend(runtime))
        break;
      runtime.weatherGfxLoaded = true;
      runtime.initStep++;
      break;
  }
};

export const fogDiagonalInitAll = (runtime: WeatherEffectsRuntime): void => {
  fogDiagonalInitVars(runtime);
  while (!runtime.weatherGfxLoaded)
    fogDiagonalMain(runtime);
};

export const fogDiagonalFinish = (runtime: WeatherEffectsRuntime): boolean => {
  updateFogDiagonalMovement(runtime);
  switch (runtime.finishStep) {
    case 0:
      weatherEffectsSetTargetBlendCoeffs(runtime, 0, 16, 1);
      runtime.finishStep++;
      break;
    case 1:
      if (!weatherEffectsUpdateBlend(runtime))
        break;
      runtime.finishStep++;
      break;
    case 2:
      destroyFogDiagonalSprites(runtime);
      runtime.finishStep++;
      break;
    default:
      return false;
  }
  return true;
};

export const FogDiagonal_InitVars = fogDiagonalInitVars;
export const FogDiagonal_InitAll = fogDiagonalInitAll;
export const FogDiagonal_Main = fogDiagonalMain;
export const FogDiagonal_Finish = fogDiagonalFinish;

const tSandSpriteColumn = 0;
const tSandSpriteRow = 1;
const tSandRadius = 0;
const tSandWaveIndex = 1;
const tSandRadiusCounter = 2;
const tSandEntranceDelay = 3;

export const sSwirlEntranceDelays = [0, 120, 80, 160, 40, 0] as const;

export const updateSandstormWaveIndex = (runtime: WeatherEffectsRuntime): void => {
  if (runtime.sandstormWaveCounter++ > 4) {
    runtime.sandstormWaveIndex++;
    runtime.sandstormWaveCounter = 0;
  }
};

export const updateSandstormMovement = (runtime: WeatherEffectsRuntime): void => {
  runtime.sandstormXOffset -= gSineTable[runtime.sandstormWaveIndex] * 4;
  runtime.sandstormYOffset -= gSineTable[runtime.sandstormWaveIndex];
  runtime.sandstormBaseSpritesX = (runtime.gSpriteCoordOffsetX + (runtime.sandstormXOffset >> 8)) & 0xff;
  runtime.sandstormPosY = runtime.gSpriteCoordOffsetY + (runtime.sandstormYOffset >> 8);
};

export const createSandstormSprites = (runtime: WeatherEffectsRuntime): void => {
  if (runtime.sandstormSpritesCreated)
    return;

  runtime.operations.push('LoadSpriteSheet(sSandstormSpriteSheet)');
  runtime.operations.push('LoadCustomWeatherSpritePalette(gSandstormWeatherPalette)');
  for (let i = 0; i < NUM_SANDSTORM_SPRITES; i += 1) {
    const sprite = createWeatherSprite({
      x: 0,
      y: Math.trunc(i / 5) * 64,
      callback: 'UpdateSandstormSprite'
    });
    sprite.data[tSandSpriteColumn] = i % 5;
    sprite.data[tSandSpriteRow] = Math.trunc(i / 5);
    runtime.sandstormSprites1[i] = sprite;
    runtime.operations.push(`CreateSpriteAtEnd(sSandstormSpriteTemplate):${i}:1`);
  }

  runtime.sandstormSpritesCreated = true;
};

export const createSwirlSandstormSprites = (runtime: WeatherEffectsRuntime): void => {
  if (runtime.sandstormSwirlSpritesCreated)
    return;

  for (let i = 0; i < NUM_SWIRL_SANDSTORM_SPRITES; i += 1) {
    const sprite = createWeatherSprite({
      x: i * 48 + 24,
      y: 208,
      animNum: 1,
      callback: 'WaitSandSwirlSpriteEntrance',
      oamSize: 2
    });
    sprite.data[tSandSpriteRow] = i * 51;
    sprite.data[tSandRadius] = 8;
    sprite.data[tSandRadiusCounter] = 0;
    sprite.data[4] = 0x6730;
    sprite.data[tSandEntranceDelay] = sSwirlEntranceDelays[i];
    sprite.centerToCornerVecX = 16;
    sprite.centerToCornerVecY = 16;
    runtime.sandstormSprites2[i] = sprite;
    runtime.operations.push(`CreateSpriteAtEnd(sSandstormSpriteTemplate.swirl):${i}:1`);
    runtime.operations.push(`StartSpriteAnim(sandstormSprites2[${i}]):1`);
    runtime.operations.push(`CalcCenterToCornerVec(sandstormSprites2[${i}]):32x32`);
    runtime.sandstormSwirlSpritesCreated = true;
  }
};

export const destroySandstormSprites = (runtime: WeatherEffectsRuntime): void => {
  if (runtime.sandstormSpritesCreated) {
    for (let i = 0; i < NUM_SANDSTORM_SPRITES; i += 1) {
      if (runtime.sandstormSprites1[i] !== null)
        runtime.operations.push(`DestroySprite(sandstormSprites1[${i}])`);
      runtime.sandstormSprites1[i] = null;
    }

    runtime.sandstormSpritesCreated = false;
    runtime.operations.push('FreeSpriteTilesByTag(GFXTAG_SANDSTORM)');
  }

  if (runtime.sandstormSwirlSpritesCreated) {
    for (let i = 0; i < NUM_SWIRL_SANDSTORM_SPRITES; i += 1) {
      if (runtime.sandstormSprites2[i] !== null)
        runtime.operations.push(`DestroySprite(sandstormSprites2[${i}])`);
      runtime.sandstormSprites2[i] = null;
    }

    runtime.sandstormSwirlSpritesCreated = false;
  }
};

export const updateSandstormSprite = (runtime: WeatherEffectsRuntime, sprite: WeatherSprite): void => {
  sprite.y2 = runtime.sandstormPosY;
  sprite.x = runtime.sandstormBaseSpritesX + 32 + sprite.data[tSandSpriteColumn] * 64;
  if (sprite.x >= DISPLAY_WIDTH + 32) {
    sprite.x = runtime.sandstormBaseSpritesX + (DISPLAY_WIDTH * 2) - (4 - sprite.data[tSandSpriteColumn]) * 64;
    sprite.x &= 0x1ff;
  }
};

export const waitSandSwirlSpriteEntrance = (_runtime: WeatherEffectsRuntime, sprite: WeatherSprite): void => {
  sprite.data[tSandEntranceDelay]--;
  if (sprite.data[tSandEntranceDelay] === -1)
    sprite.callback = 'UpdateSandstormSwirlSprite';
};

export const updateSandstormSwirlSprite = (_runtime: WeatherEffectsRuntime, sprite: WeatherSprite): void => {
  if (--sprite.y < -48) {
    sprite.y = DISPLAY_HEIGHT + 48;
    sprite.data[tSandRadius] = 4;
  }

  const x = sprite.data[tSandRadius] * gSineTable[sprite.data[tSandWaveIndex]];
  const y = sprite.data[tSandRadius] * gSineTable[sprite.data[tSandWaveIndex] + 0x40];
  sprite.x2 = x >> 8;
  sprite.y2 = y >> 8;
  sprite.data[tSandWaveIndex] = (sprite.data[tSandWaveIndex] + 10) & 0xff;
  if (++sprite.data[tSandRadiusCounter] > 8) {
    sprite.data[tSandRadiusCounter] = 0;
    sprite.data[tSandRadius]++;
  }
};

export const sandstormInitVars = (runtime: WeatherEffectsRuntime): void => {
  runtime.initStep = 0;
  runtime.weatherGfxLoaded = false;
  runtime.gammaTargetIndex = 0;
  runtime.gammaStepDelay = 20;
  if (!runtime.sandstormSpritesCreated) {
    runtime.sandstormXOffset = 0;
    runtime.sandstormYOffset = 0;
    runtime.sandstormWaveIndex = 8;
    runtime.sandstormWaveCounter = 0;
    if (runtime.sandstormWaveIndex >= 0x80 - MIN_SANDSTORM_WAVE_INDEX)
      runtime.sandstormWaveIndex = 0x80 - runtime.sandstormWaveIndex;

    weatherEffectsSetBlendCoeffs(runtime, 0, 16);
  }
};

export const sandstormMain = (runtime: WeatherEffectsRuntime): void => {
  updateSandstormMovement(runtime);
  updateSandstormWaveIndex(runtime);
  if (runtime.sandstormWaveIndex >= 0x80 - MIN_SANDSTORM_WAVE_INDEX)
    runtime.sandstormWaveIndex = MIN_SANDSTORM_WAVE_INDEX;

  switch (runtime.initStep) {
    case 0:
      createSandstormSprites(runtime);
      createSwirlSandstormSprites(runtime);
      runtime.initStep++;
      break;
    case 1:
      weatherEffectsSetTargetBlendCoeffs(runtime, 16, 0, 0);
      runtime.initStep++;
      break;
    case 2:
      if (weatherEffectsUpdateBlend(runtime)) {
        runtime.weatherGfxLoaded = true;
        runtime.initStep++;
      }
      break;
  }
};

export const sandstormInitAll = (runtime: WeatherEffectsRuntime): void => {
  sandstormInitVars(runtime);
  while (!runtime.weatherGfxLoaded)
    sandstormMain(runtime);
};

export const sandstormFinish = (runtime: WeatherEffectsRuntime): boolean => {
  updateSandstormMovement(runtime);
  updateSandstormWaveIndex(runtime);
  switch (runtime.finishStep) {
    case 0:
      weatherEffectsSetTargetBlendCoeffs(runtime, 0, 16, 0);
      runtime.finishStep++;
      break;
    case 1:
      if (weatherEffectsUpdateBlend(runtime))
        runtime.finishStep++;
      break;
    case 2:
      destroySandstormSprites(runtime);
      runtime.finishStep++;
      break;
    default:
      return false;
  }

  return true;
};

export const Sandstorm_InitVars = sandstormInitVars;
export const Sandstorm_InitAll = sandstormInitAll;
export const Sandstorm_Main = sandstormMain;
export const Sandstorm_Finish = sandstormFinish;

export const shadeInitVars = (runtime: WeatherEffectsRuntime): void => {
  runtime.initStep = 0;
  runtime.gammaTargetIndex = 3;
  runtime.gammaStepDelay = 20;
};

export const shadeInitAll = (runtime: WeatherEffectsRuntime): void => {
  shadeInitVars(runtime);
};

export const shadeMain = (_runtime: WeatherEffectsRuntime): void => {
};

export const shadeFinish = (_runtime: WeatherEffectsRuntime): boolean => false;

export const Shade_InitVars = shadeInitVars;
export const Shade_InitAll = shadeInitAll;
export const Shade_Main = shadeMain;
export const Shade_Finish = shadeFinish;

export const sBubbleStartDelays = [40, 90, 60, 90, 2, 60, 40, 30] as const;

export const sBubbleStartCoords = [
  [120, 160],
  [376, 160],
  [40, 140],
  [296, 140],
  [180, 130],
  [436, 130],
  [60, 160],
  [436, 160],
  [220, 180],
  [476, 180],
  [10, 90],
  [266, 90],
  [256, 160]
] as const;

const tBubbleScrollXCounter = 0;
const tBubbleScrollXDir = 1;
const tBubbleCounter = 2;

export const createBubbleSprite = (runtime: WeatherEffectsRuntime, coordsIndex: number): WeatherSprite | null => {
  const coords = sBubbleStartCoords[coordsIndex];
  const spriteId = runtime.bubbleSprites.findIndex((sprite) => sprite === null);
  if (spriteId === -1)
    return null;

  const sprite = createWeatherSprite({
    x: coords[0],
    y: coords[1] - runtime.gSpriteCoordOffsetY,
    priority: 1,
    coordOffsetEnabled: true,
    callback: 'UpdateBubbleSprite',
    template: 'sBubbleSpriteTemplate'
  });
  sprite.data[tBubbleScrollXCounter] = 0;
  sprite.data[tBubbleScrollXDir] = 0;
  sprite.data[tBubbleCounter] = 0;
  runtime.bubbleSprites[spriteId] = sprite;
  runtime.bubblesSpriteCount++;
  runtime.operations.push(`CreateSpriteAtEnd(sBubbleSpriteTemplate):${coordsIndex}:${spriteId}:0`);
  return sprite;
};

export const destroyBubbleSprites = (runtime: WeatherEffectsRuntime): void => {
  for (let i = 0; i < MAX_SPRITES; i += 1) {
    if (runtime.bubbleSprites[i]?.template === 'sBubbleSpriteTemplate') {
      runtime.operations.push(`DestroySprite(bubbleSprites[${i}])`);
      runtime.bubbleSprites[i] = null;
    }
  }

  runtime.operations.push('FreeSpriteTilesByTag(GFXTAG_BUBBLE)');
};

export const updateBubbleSprite = (runtime: WeatherEffectsRuntime, sprite: WeatherSprite): void => {
  ++sprite.data[tBubbleScrollXCounter];
  if (++sprite.data[tBubbleScrollXCounter] > 8) {
    sprite.data[tBubbleScrollXCounter] = 0;
    if (sprite.data[tBubbleScrollXDir] === 0) {
      if (++sprite.x2 > 4)
        sprite.data[tBubbleScrollXDir] = 1;
    } else {
      if (--sprite.x2 <= 0)
        sprite.data[tBubbleScrollXDir] = 0;
    }
  }

  sprite.y -= 3;
  if (++sprite.data[tBubbleCounter] >= 120) {
    const index = runtime.bubbleSprites.indexOf(sprite);
    if (index !== -1)
      runtime.bubbleSprites[index] = null;
    runtime.operations.push('DestroySprite(bubble)');
  }
};

export const bubblesInitVars = (runtime: WeatherEffectsRuntime): void => {
  fogHorizontalInitVars(runtime);
  if (!runtime.bubblesSpritesCreated) {
    runtime.operations.push('LoadSpriteSheet(sWeatherBubbleSpriteSheet)');
    runtime.bubblesDelayIndex = 0;
    runtime.bubblesDelayCounter = sBubbleStartDelays[0];
    runtime.bubblesCoordsIndex = 0;
    runtime.bubblesSpriteCount = 0;
  }
};

export const bubblesMain = (runtime: WeatherEffectsRuntime): void => {
  fogHorizontalMain(runtime);
  if (++runtime.bubblesDelayCounter > sBubbleStartDelays[runtime.bubblesDelayIndex]) {
    runtime.bubblesDelayCounter = 0;
    if (++runtime.bubblesDelayIndex > sBubbleStartDelays.length - 1)
      runtime.bubblesDelayIndex = 0;

    createBubbleSprite(runtime, runtime.bubblesCoordsIndex);
    if (++runtime.bubblesCoordsIndex > sBubbleStartCoords.length - 1)
      runtime.bubblesCoordsIndex = 0;
  }
};

export const bubblesInitAll = (runtime: WeatherEffectsRuntime): void => {
  bubblesInitVars(runtime);
  while (!runtime.weatherGfxLoaded)
    bubblesMain(runtime);
};

export const bubblesFinish = (runtime: WeatherEffectsRuntime): boolean => {
  if (!fogHorizontalFinish(runtime)) {
    destroyBubbleSprites(runtime);
    return false;
  }

  return true;
};

export const Bubbles_InitVars = bubblesInitVars;
export const Bubbles_InitAll = bubblesInitAll;
export const Bubbles_Main = bubblesMain;
export const Bubbles_Finish = bubblesFinish;

const tAshOffsetY = 0;
const tAshCounterY = 1;
const tAshSpriteColumn = 2;
const tAshSpriteRow = 3;

export const loadAshSpriteSheet = (runtime: WeatherEffectsRuntime): void => {
  runtime.operations.push('LoadSpriteSheet(sAshSpriteSheet)');
};

export const createAshSprites = (runtime: WeatherEffectsRuntime): void => {
  if (runtime.ashSpritesCreated)
    return;

  for (let i = 0; i < NUM_ASH_SPRITES; i += 1) {
    const sprite = createWeatherSprite({ callback: 'UpdateAshSprite' });
    sprite.data[tAshCounterY] = 0;
    sprite.data[tAshSpriteColumn] = i % 5;
    sprite.data[tAshSpriteRow] = Math.trunc(i / 5);
    sprite.data[tAshOffsetY] = sprite.data[tAshSpriteRow] * 64 + 32;
    runtime.ashSprites[i] = sprite;
    runtime.operations.push(`CreateSpriteAtEnd(sAshSpriteTemplate):${i}:78`);
  }

  runtime.ashSpritesCreated = true;
};

export const destroyAshSprites = (runtime: WeatherEffectsRuntime): void => {
  if (!runtime.ashSpritesCreated)
    return;

  for (let i = 0; i < NUM_ASH_SPRITES; i += 1) {
    if (runtime.ashSprites[i] !== null)
      runtime.operations.push(`DestroySprite(ashSprites[${i}])`);
    runtime.ashSprites[i] = null;
  }

  runtime.operations.push('FreeSpriteTilesByTag(GFXTAG_ASH)');
  runtime.ashSpritesCreated = false;
};

export const updateAshSprite = (runtime: WeatherEffectsRuntime, sprite: WeatherSprite): void => {
  if (++sprite.data[tAshCounterY] > 5) {
    sprite.data[tAshCounterY] = 0;
    sprite.data[tAshOffsetY]++;
  }

  sprite.y = runtime.gSpriteCoordOffsetY + sprite.data[tAshOffsetY];
  sprite.x = runtime.ashBaseSpritesX + 32 + sprite.data[tAshSpriteColumn] * 64;
  if (sprite.x >= DISPLAY_WIDTH + 32) {
    sprite.x = runtime.ashBaseSpritesX + (DISPLAY_WIDTH * 2) - (4 - sprite.data[tAshSpriteColumn]) * 64;
    sprite.x &= 0x1ff;
  }
};

export const ashInitVars = (runtime: WeatherEffectsRuntime): void => {
  runtime.initStep = 0;
  runtime.weatherGfxLoaded = false;
  runtime.gammaTargetIndex = 0;
  runtime.gammaStepDelay = 20;
  runtime.ashUnused = 20;
  if (!runtime.ashSpritesCreated) {
    weatherEffectsSetBlendCoeffs(runtime, 0, 16);
    runtime.gpuRegs.set(REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(64, 63));
  }
};

export const ashMain = (runtime: WeatherEffectsRuntime): void => {
  runtime.ashBaseSpritesX = runtime.gSpriteCoordOffsetX & 0x1ff;
  while (runtime.ashBaseSpritesX >= DISPLAY_WIDTH)
    runtime.ashBaseSpritesX -= DISPLAY_WIDTH;

  switch (runtime.initStep) {
    case 0:
      loadAshSpriteSheet(runtime);
      runtime.initStep++;
      break;
    case 1:
      if (!runtime.ashSpritesCreated)
        createAshSprites(runtime);

      weatherEffectsSetTargetBlendCoeffs(runtime, 16, 0, 1);
      runtime.initStep++;
      break;
    case 2:
      if (weatherEffectsUpdateBlend(runtime)) {
        runtime.weatherGfxLoaded = true;
        runtime.initStep++;
      }
      break;
    default:
      weatherEffectsUpdateBlend(runtime);
      break;
  }
};

export const ashInitAll = (runtime: WeatherEffectsRuntime): void => {
  ashInitVars(runtime);
  while (!runtime.weatherGfxLoaded)
    ashMain(runtime);
};

export const ashFinish = (runtime: WeatherEffectsRuntime): boolean => {
  switch (runtime.finishStep) {
    case 0:
      weatherEffectsSetTargetBlendCoeffs(runtime, 0, 16, 1);
      runtime.finishStep++;
      break;
    case 1:
      if (weatherEffectsUpdateBlend(runtime)) {
        destroyAshSprites(runtime);
        runtime.finishStep++;
      }
      break;
    case 2:
      runtime.gpuRegs.set(REG_OFFSET_BLDALPHA, 0);
      runtime.finishStep++;
      return false;
    default:
      return false;
  }
  return true;
};

export const Ash_InitVars = ashInitVars;
export const Ash_InitAll = ashInitAll;
export const Ash_Main = ashMain;
export const Ash_Finish = ashFinish;

export const startRainSpriteFall = (runtime: WeatherEffectsRuntime, sprite: WeatherSprite): void => {
  if (sprite.data[tRandom] === 0) sprite.data[tRandom] = 361;

  const rand = isoRandomize2(sprite.data[tRandom]);
  sprite.data[tRandom] = (((rand & 0x7fff0000) >>> 16) % 600) & 0xffff;

  const downpourIndex = runtime.isDownpour ? 1 : 0;
  const numFallingFrames = sRainSpriteFallingDurations[downpourIndex][0];
  const tileX = sprite.data[tRandom] % 30;
  const tileY = Math.trunc(sprite.data[tRandom] / 30);

  sprite.data[tPosX] = tileX << 7;
  sprite.data[tPosY] = tileY << 7;
  sprite.data[tPosX] -= sRainSpriteMovement[downpourIndex][0] * numFallingFrames;
  sprite.data[tPosY] -= sRainSpriteMovement[downpourIndex][1] * numFallingFrames;

  sprite.animNum = 0;
  sprite.data[tState] = 0;
  sprite.coordOffsetEnabled = false;
  sprite.data[tCounter] = numFallingFrames;
};

export const updateRainSprite = (runtime: WeatherEffectsRuntime, sprite: WeatherSprite): void => {
  if (sprite.data[tState] === 0) {
    const downpourIndex = runtime.isDownpour ? 1 : 0;
    sprite.data[tPosX] += sRainSpriteMovement[downpourIndex][0];
    sprite.data[tPosY] += sRainSpriteMovement[downpourIndex][1];
    sprite.x = sprite.data[tPosX] >> 4;
    sprite.y = sprite.data[tPosY] >> 4;

    sprite.invisible = !(
      sprite.data[tActive]
      && sprite.x >= -8
      && sprite.x <= DISPLAY_WIDTH + 8
      && sprite.y >= -16
      && sprite.y <= DISPLAY_HEIGHT + 16
    );

    sprite.data[tCounter] -= 1;
    if (sprite.data[tCounter] === 0) {
      sprite.animNum = (runtime.isDownpour ? 1 : 0) + 1;
      sprite.data[tState] = 1;
      sprite.x -= runtime.gSpriteCoordOffsetX;
      sprite.y -= runtime.gSpriteCoordOffsetY;
      sprite.coordOffsetEnabled = true;
    }
  } else if (sprite.animEnded) {
    sprite.invisible = true;
    startRainSpriteFall(runtime, sprite);
  }
};

export const waitRainSprite = (runtime: WeatherEffectsRuntime, sprite: WeatherSprite): void => {
  if (sprite.data[tCounter] === 0) {
    startRainSpriteFall(runtime, sprite);
    sprite.callback = 'UpdateRainSprite';
  } else {
    sprite.data[tCounter] -= 1;
  }
};

export const initRainSpriteMovement = (runtime: WeatherEffectsRuntime, sprite: WeatherSprite, val: number): void => {
  const downpourIndex = runtime.isDownpour ? 1 : 0;
  const numFallingFrames = sRainSpriteFallingDurations[downpourIndex][0];
  let numAdvanceRng = Math.trunc(val / (sRainSpriteFallingDurations[downpourIndex][1] + numFallingFrames));
  let frameVal = val % (sRainSpriteFallingDurations[downpourIndex][1] + numFallingFrames);

  while (((numAdvanceRng -= 1) & 0xffff) !== 0xffff) startRainSpriteFall(runtime, sprite);

  if (frameVal < numFallingFrames) {
    while (((frameVal -= 1) & 0xffff) !== 0xffff) updateRainSprite(runtime, sprite);
    sprite.data[tWaiting] = 0;
  } else {
    sprite.data[tCounter] = frameVal - numFallingFrames;
    sprite.invisible = true;
    sprite.data[tWaiting] = 1;
  }
};

export const setRainStrengthFromSoundEffectForEffects = (
  runtime: WeatherEffectsRuntime,
  soundEffect: number
): void => {
  if (runtime.palProcessingState !== WEATHER_PAL_STATE_SCREEN_FADING_OUT) {
    switch (soundEffect) {
      case SE_RAIN:
        runtime.rainStrength = 0;
        break;
      case SE_DOWNPOUR:
        runtime.rainStrength = 1;
        break;
      case SE_THUNDERSTORM:
        runtime.rainStrength = 2;
        break;
      default:
        return;
    }

    runtime.playedSoundEffects.push(soundEffect);
  }
};

export const rainInitVars = (runtime: WeatherEffectsRuntime): void => {
  runtime.initStep = 0;
  runtime.weatherGfxLoaded = false;
  runtime.rainSpriteVisibleCounter = 0;
  runtime.rainSpriteVisibleDelay = 8;
  runtime.isDownpour = false;
  runtime.targetRainSpriteCount = 10;
  setRainStrengthFromSoundEffectForEffects(runtime, SE_RAIN);
};

export const rainInitAll = (runtime: WeatherEffectsRuntime): void => {
  rainInitVars(runtime);
  while (!runtime.weatherGfxLoaded) rainMain(runtime);
};

export const loadRainSpriteSheet = (runtime: WeatherEffectsRuntime): void => {
  runtime.operations.push('LoadSpriteSheet(sRainSpriteSheet)');
};

export const createRainSprite = (runtime: WeatherEffectsRuntime): boolean => {
  if (runtime.rainSpriteCount === MAX_RAIN_SPRITES) return false;

  const spriteIndex = runtime.rainSpriteCount;
  const coords = sRainSpriteCoords[spriteIndex];
  const sprite = createWeatherSprite({ x: coords.x, y: coords.y });

  sprite.data[tActive] = 0;
  sprite.data[tRandom] = spriteIndex * 145;
  while (sprite.data[tRandom] >= 600) sprite.data[tRandom] -= 600;

  startRainSpriteFall(runtime, sprite);
  initRainSpriteMovement(runtime, sprite, spriteIndex * 9);
  sprite.invisible = true;
  runtime.rainSprites[spriteIndex] = sprite;

  runtime.rainSpriteCount += 1;
  if (runtime.rainSpriteCount === MAX_RAIN_SPRITES) {
    for (let i = 0; i < MAX_RAIN_SPRITES; i += 1) {
      const rainSprite = runtime.rainSprites[i];
      if (rainSprite !== null) {
        rainSprite.callback = !rainSprite.data[tWaiting] ? 'UpdateRainSprite' : 'WaitRainSprite';
      }
    }

    return false;
  }

  return true;
};

export const updateVisibleRainSprites = (runtime: WeatherEffectsRuntime): boolean => {
  if (runtime.curRainSpriteIndex === runtime.targetRainSpriteCount) return false;

  runtime.rainSpriteVisibleCounter += 1;
  if (runtime.rainSpriteVisibleCounter > runtime.rainSpriteVisibleDelay) {
    runtime.rainSpriteVisibleCounter = 0;
    if (runtime.curRainSpriteIndex < runtime.targetRainSpriteCount) {
      const rainSprite = runtime.rainSprites[runtime.curRainSpriteIndex];
      if (rainSprite !== null) rainSprite.data[tActive] = 1;
      runtime.curRainSpriteIndex += 1;
    } else {
      runtime.curRainSpriteIndex -= 1;
      const rainSprite = runtime.rainSprites[runtime.curRainSpriteIndex];
      if (rainSprite !== null) {
        rainSprite.data[tActive] = 0;
        rainSprite.invisible = true;
      }
    }
  }
  return true;
};

export const destroyRainSprites = (runtime: WeatherEffectsRuntime): void => {
  for (let i = 0; i < runtime.rainSpriteCount; i += 1) {
    if (runtime.rainSprites[i] !== null) runtime.operations.push(`DestroySprite(rainSprites[${i}])`);
    runtime.rainSprites[i] = null;
  }
  runtime.rainSpriteCount = 0;
  runtime.operations.push('FreeSpriteTilesByTag(GFXTAG_RAIN)');
};

export const rainMain = (runtime: WeatherEffectsRuntime): void => {
  switch (runtime.initStep) {
    case 0:
      loadRainSpriteSheet(runtime);
      runtime.initStep += 1;
      break;
    case 1:
      if (!createRainSprite(runtime)) runtime.initStep += 1;
      break;
    case 2:
      if (!updateVisibleRainSprites(runtime)) {
        runtime.weatherGfxLoaded = true;
        runtime.initStep += 1;
      }
      break;
  }
};

export const rainFinish = (runtime: WeatherEffectsRuntime): boolean => {
  switch (runtime.finishStep) {
    case 0:
      if (
        runtime.nextWeather === WEATHER_RAIN
        || runtime.nextWeather === WEATHER_RAIN_THUNDERSTORM
        || runtime.nextWeather === WEATHER_DOWNPOUR
      ) {
        runtime.finishStep = 0xff;
        return false;
      }
      runtime.targetRainSpriteCount = 0;
      runtime.finishStep += 1;

    // fall through
    case 1:
      if (!updateVisibleRainSprites(runtime)) {
        destroyRainSprites(runtime);
        runtime.finishStep += 1;
        return false;
      }
      return true;
  }
  return false;
};

export const Rain_InitVars = rainInitVars;
export const Rain_InitAll = rainInitAll;
export const Rain_Main = rainMain;
export const Rain_Finish = rainFinish;

export const updateThunderSound = (runtime: WeatherEffectsRuntime): void => {
  if (runtime.thunderTriggered === true) {
    if (runtime.thunderCounter === 0) {
      if (runtime.sePlaying)
        return;

      if (random(runtime) & 1)
        runtime.playedSoundEffects.push(SE_THUNDER);
      else
        runtime.playedSoundEffects.push(SE_THUNDER2);

      runtime.thunderTriggered = false;
    } else {
      runtime.thunderCounter--;
    }
  }
};

export const setThunderCounter = (runtime: WeatherEffectsRuntime, max: number): void => {
  if (!runtime.thunderTriggered) {
    runtime.thunderCounter = random(runtime) % max;
    runtime.thunderTriggered = true;
  }
};

const weatherShiftGammaIfPalStateIdleForEffects = (runtime: WeatherEffectsRuntime, gammaIndex: number): void => {
  runtime.operations.push(`WeatherShiftGammaIfPalStateIdle:${gammaIndex}`);
};

const weatherBeginGammaFadeForEffects = (
  runtime: WeatherEffectsRuntime,
  startGammaIndex: number,
  targetGammaIndex: number,
  gammaStepDelay: number
): void => {
  runtime.operations.push(`WeatherBeginGammaFade:${startGammaIndex}:${targetGammaIndex}:${gammaStepDelay}`);
};

export const thunderstormInitVars = (runtime: WeatherEffectsRuntime): void => {
  runtime.initStep = TSTORM_STATE_LOAD_RAIN;
  runtime.weatherGfxLoaded = false;
  runtime.rainSpriteVisibleCounter = 0;
  runtime.rainSpriteVisibleDelay = 4;
  runtime.isDownpour = false;
  runtime.targetRainSpriteCount = 16;
  runtime.gammaTargetIndex = 3;
  runtime.gammaStepDelay = 20;
  runtime.weatherGfxLoaded = false;
  runtime.thunderTriggered = false;
  setRainStrengthFromSoundEffectForEffects(runtime, SE_THUNDERSTORM);
};

export const downpourInitVars = (runtime: WeatherEffectsRuntime): void => {
  runtime.initStep = TSTORM_STATE_LOAD_RAIN;
  runtime.weatherGfxLoaded = false;
  runtime.rainSpriteVisibleCounter = 0;
  runtime.rainSpriteVisibleDelay = 4;
  runtime.isDownpour = true;
  runtime.targetRainSpriteCount = 24;
  runtime.gammaTargetIndex = 3;
  runtime.gammaStepDelay = 20;
  runtime.weatherGfxLoaded = false;
  setRainStrengthFromSoundEffectForEffects(runtime, SE_DOWNPOUR);
};

export const thunderstormMain = (runtime: WeatherEffectsRuntime): void => {
  updateThunderSound(runtime);
  switch (runtime.initStep) {
    case TSTORM_STATE_LOAD_RAIN:
      loadRainSpriteSheet(runtime);
      runtime.initStep++;
      break;
    case TSTORM_STATE_CREATE_RAIN:
      if (!createRainSprite(runtime))
        runtime.initStep++;
      break;
    case TSTORM_STATE_INIT_RAIN:
      if (!updateVisibleRainSprites(runtime)) {
        runtime.weatherGfxLoaded = true;
        runtime.initStep++;
      }
      break;
    case TSTORM_STATE_WAIT_CHANGE:
      if (runtime.palProcessingState !== WEATHER_PAL_STATE_CHANGING_WEATHER)
        runtime.initStep = TSTORM_STATE_INIT_THUNDER_SHORT_1;
      break;
    case TSTORM_STATE_LOOP_START:
      runtime.thunderAllowEnd = true;
      runtime.thunderDelay = (random(runtime) % 360) + 360;
      runtime.initStep++;

    // fall through
    case TSTORM_STATE_LOOP_WAIT:
      if (--runtime.thunderDelay === 0)
        runtime.initStep++;
      break;
    case TSTORM_STATE_INIT_THUNDER_SHORT_1:
      runtime.thunderAllowEnd = true;
      runtime.thunderSkipShort = random(runtime) % 2;
      runtime.initStep++;
      break;
    case TSTORM_STATE_INIT_THUNDER_SHORT_2:
      runtime.thunderShortRetries = (random(runtime) & 1) + 1;
      runtime.initStep++;

    // fall through
    case TSTORM_STATE_TRY_THUNDER_SHORT:
      weatherShiftGammaIfPalStateIdleForEffects(runtime, 19);
      if (!runtime.thunderSkipShort && runtime.thunderShortRetries === 1)
        setThunderCounter(runtime, 20);

      runtime.thunderDelay = (random(runtime) % 3) + 6;
      runtime.initStep++;
      break;
    case TSTORM_STATE_TRY_NEW_THUNDER:
      if (--runtime.thunderDelay === 0) {
        weatherShiftGammaIfPalStateIdleForEffects(runtime, 3);
        runtime.thunderAllowEnd = true;
        if (--runtime.thunderShortRetries !== 0) {
          runtime.thunderDelay = (random(runtime) % 16) + 60;
          runtime.initStep = TSTORM_STATE_WAIT_THUNDER_SHORT;
        } else if (!runtime.thunderSkipShort) {
          runtime.initStep = TSTORM_STATE_LOOP_START;
        } else {
          runtime.initStep = TSTORM_STATE_INIT_THUNDER_LONG;
        }
      }
      break;
    case TSTORM_STATE_WAIT_THUNDER_SHORT:
      if (--runtime.thunderDelay === 0)
        runtime.initStep = TSTORM_STATE_TRY_THUNDER_SHORT;
      break;
    case TSTORM_STATE_INIT_THUNDER_LONG:
      runtime.thunderDelay = (random(runtime) % 16) + 60;
      runtime.initStep++;
      break;
    case TSTORM_STATE_WAIT_THUNDER_LONG:
      if (--runtime.thunderDelay === 0) {
        setThunderCounter(runtime, 100);
        weatherShiftGammaIfPalStateIdleForEffects(runtime, 19);
        runtime.thunderDelay = (random(runtime) & 0xf) + 30;
        runtime.initStep++;
      }
      break;
    case TSTORM_STATE_FADE_THUNDER_LONG:
      if (--runtime.thunderDelay === 0) {
        weatherBeginGammaFadeForEffects(runtime, 19, 3, 5);
        runtime.initStep++;
      }
      break;
    case TSTORM_STATE_END_THUNDER_LONG:
      if (runtime.palProcessingState === WEATHER_PAL_STATE_IDLE) {
        runtime.thunderAllowEnd = true;
        runtime.initStep = TSTORM_STATE_LOOP_START;
      }
      break;
  }
};

export const thunderstormInitAll = (runtime: WeatherEffectsRuntime): void => {
  thunderstormInitVars(runtime);
  while (!runtime.weatherGfxLoaded)
    thunderstormMain(runtime);
};

export const downpourInitAll = (runtime: WeatherEffectsRuntime): void => {
  downpourInitVars(runtime);
  while (!runtime.weatherGfxLoaded)
    thunderstormMain(runtime);
};

export const thunderstormFinish = (runtime: WeatherEffectsRuntime): boolean => {
  switch (runtime.finishStep) {
    case 0:
      runtime.thunderAllowEnd = false;
      runtime.finishStep++;

    // fall through
    case 1:
      thunderstormMain(runtime);
      if (runtime.thunderAllowEnd) {
        if (
          runtime.nextWeather === WEATHER_RAIN
          || runtime.nextWeather === WEATHER_RAIN_THUNDERSTORM
          || runtime.nextWeather === WEATHER_DOWNPOUR
        )
          return false;

        runtime.targetRainSpriteCount = 0;
        runtime.finishStep++;
      }
      break;
    case 2:
      if (!updateVisibleRainSprites(runtime)) {
        destroyRainSprites(runtime);
        runtime.thunderTriggered = false;
        runtime.finishStep++;
        return false;
      }
      break;
    default:
      return false;
  }
  return true;
};

export const Thunderstorm_InitVars = thunderstormInitVars;
export const Thunderstorm_InitAll = thunderstormInitAll;
export const Thunderstorm_Main = thunderstormMain;
export const Thunderstorm_Finish = thunderstormFinish;
export const Downpour_InitVars = downpourInitVars;
export const Downpour_InitAll = downpourInitAll;

export const initSnowflakeSpriteMovement = (runtime: WeatherEffectsRuntime, sprite: WeatherSprite): void => {
  const randX = random(runtime);
  const x = ((sprite.data[tSnowflakeId] * 5) & 7) * 30 + (randX % 30);

  sprite.y = -3 - (runtime.gSpriteCoordOffsetY + sprite.centerToCornerVecY);
  sprite.x = x - (runtime.gSpriteCoordOffsetX + sprite.centerToCornerVecX);
  sprite.data[tSnowPosY] = sprite.y * 128;
  sprite.x2 = 0;
  const rand = random(runtime);
  sprite.data[tDeltaY] = (rand & 3) * 5 + 64;
  sprite.data[tDeltaY2] = sprite.data[tDeltaY];
  sprite.animNum = (rand & 1) ? 0 : 1;
  sprite.data[tWaveIndex] = 0;
  sprite.data[tWaveDelta] = (rand & 3) === 0 ? 2 : 1;
  sprite.data[tFallDuration] = (rand & 0x1f) + 210;
  sprite.data[tFallCounter] = 0;
};

export const createSnowflakeSprite = (runtime: WeatherEffectsRuntime): boolean => {
  if (runtime.snowflakeSpriteCount >= runtime.snowflakeSprites.length)
    return false;

  const sprite = createWeatherSprite({
    x: 0,
    y: 0,
    callback: 'UpdateSnowflakeSprite',
    template: 'sSnowflakeSpriteTemplate'
  });
  sprite.data[tSnowflakeId] = runtime.snowflakeSpriteCount;
  initSnowflakeSpriteMovement(runtime, sprite);
  sprite.coordOffsetEnabled = true;
  runtime.snowflakeSprites[runtime.snowflakeSpriteCount++] = sprite;
  runtime.operations.push(`CreateSpriteAtEnd(sSnowflakeSpriteTemplate):${runtime.snowflakeSpriteCount - 1}:78`);
  return true;
};

export const destroySnowflakeSprite = (runtime: WeatherEffectsRuntime): boolean => {
  if (runtime.snowflakeSpriteCount) {
    runtime.snowflakeSpriteCount--;
    runtime.snowflakeSprites[runtime.snowflakeSpriteCount] = null;
    runtime.operations.push(`DestroySprite(snowflakeSprites[${runtime.snowflakeSpriteCount}])`);
    return true;
  }

  return false;
};

export const updateVisibleSnowflakeSprites = (runtime: WeatherEffectsRuntime): boolean => {
  if (runtime.snowflakeSpriteCount === runtime.targetSnowflakeSpriteCount) return false;

  runtime.snowflakeVisibleCounter += 1;
  if (runtime.snowflakeVisibleCounter > 36) {
    runtime.snowflakeVisibleCounter = 0;
    if (runtime.snowflakeSpriteCount < runtime.targetSnowflakeSpriteCount) createSnowflakeSprite(runtime);
    else destroySnowflakeSprite(runtime);
  }

  return runtime.snowflakeSpriteCount !== runtime.targetSnowflakeSpriteCount;
};

export const snowInitVars = (runtime: WeatherEffectsRuntime): void => {
  runtime.initStep = 0;
  runtime.weatherGfxLoaded = false;
  runtime.gammaTargetIndex = 3;
  runtime.gammaStepDelay = 20;
  runtime.targetSnowflakeSpriteCount = 16;
  runtime.snowflakeVisibleCounter = 0;
};

export const snowMain = (runtime: WeatherEffectsRuntime): void => {
  if (runtime.initStep === 0 && !updateVisibleSnowflakeSprites(runtime)) {
    runtime.weatherGfxLoaded = true;
    runtime.initStep++;
  }
};

export const snowInitAll = (runtime: WeatherEffectsRuntime): void => {
  snowInitVars(runtime);
  while (!runtime.weatherGfxLoaded) {
    snowMain(runtime);
    for (let i = 0; i < runtime.snowflakeSpriteCount; i += 1) {
      const snowflake = runtime.snowflakeSprites[i];
      if (snowflake !== null)
        updateSnowflakeSprite(runtime, snowflake);
    }
  }
};

export const snowFinish = (runtime: WeatherEffectsRuntime): boolean => {
  switch (runtime.finishStep) {
    case 0:
      runtime.targetSnowflakeSpriteCount = 0;
      runtime.snowflakeVisibleCounter = 0;
      runtime.finishStep++;

    // fall through
    case 1:
      if (!updateVisibleSnowflakeSprites(runtime)) {
        runtime.finishStep++;
        return false;
      }
      return true;
  }

  return false;
};

export const Snow_InitVars = snowInitVars;
export const Snow_InitAll = snowInitAll;
export const Snow_Main = snowMain;
export const Snow_Finish = snowFinish;

export const waitSnowflakeSprite = (runtime: WeatherEffectsRuntime, sprite: WeatherSprite): void => {
  if (runtime.snowflakeTimer > 18) {
    sprite.invisible = false;
    sprite.callback = 'UpdateSnowflakeSprite';
    sprite.y = 250 - (runtime.gSpriteCoordOffsetY + sprite.centerToCornerVecY);
    sprite.data[tSnowPosY] = sprite.y * 128;
    runtime.snowflakeTimer = 0;
  }
};

export const updateSnowflakeSprite = (runtime: WeatherEffectsRuntime, sprite: WeatherSprite): void => {
  sprite.data[tSnowPosY] += sprite.data[tDeltaY];
  sprite.y = sprite.data[tSnowPosY] >> 7;
  sprite.data[tWaveIndex] += sprite.data[tWaveDelta];
  sprite.data[tWaveIndex] &= 0xff;
  sprite.x2 = Math.trunc(gSineTable[sprite.data[tWaveIndex]] / 64);

  let x = (sprite.x + sprite.centerToCornerVecX + runtime.gSpriteCoordOffsetX) & 0x1ff;
  if (x & 0x100) x = s16Value(x | -0x100);

  if (x < -3) sprite.x = 242 - (runtime.gSpriteCoordOffsetX + sprite.centerToCornerVecX);
  else if (x > 242) sprite.x = -3 - (runtime.gSpriteCoordOffsetX + sprite.centerToCornerVecX);

  const y = (sprite.y + sprite.centerToCornerVecY + runtime.gSpriteCoordOffsetY) & 0xff;
  if (y > 163 && y < 171) {
    sprite.y = 250 - (runtime.gSpriteCoordOffsetY + sprite.centerToCornerVecY);
    sprite.data[tSnowPosY] = sprite.y * 128;
    sprite.data[tFallCounter] = 0;
    sprite.data[tFallDuration] = 220;
  } else if (y > 242 && y < 250) {
    sprite.y = 163;
    sprite.data[tSnowPosY] = sprite.y * 128;
    sprite.data[tFallCounter] = 0;
    sprite.data[tFallDuration] = 220;
    sprite.invisible = true;
    sprite.callback = 'WaitSnowflakeSprite';
  }

  sprite.data[tFallCounter] += 1;
  if (sprite.data[tFallCounter] === sprite.data[tFallDuration]) {
    initSnowflakeSpriteMovement(runtime, sprite);
    sprite.y = 250;
    sprite.invisible = true;
    sprite.callback = 'WaitSnowflakeSprite';
  }
};

export const sBasePaletteGammaTypes = [
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0,
  2, 1, 2, 2, 2, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1
] as const;

export interface FieldWeather {
  gammaShifts: number[][];
  altGammaShifts: number[][];
  altGammaSpritePalIndex: number;
  weatherPicSpritePalIndex: number;
  rainSpriteCount: number;
  curRainSpriteIndex: number;
  cloudSpritesCreated: boolean;
  snowflakeSpriteCount: number;
  ashSpritesCreated: boolean;
  fogHSpritesCreated: boolean;
  fogDSpritesCreated: boolean;
  sandstormSpritesCreated: boolean;
  sandstormSwirlSpritesCreated: boolean;
  bubblesSpritesCreated: boolean;
  lightenedFogSpritePals: number[];
  lightenedFogSpritePalsCount: number;
  currWeather: number;
  nextWeather: number;
  palProcessingState: number;
  readyForInit: boolean;
  weatherChangeComplete: boolean;
  taskId: number;
  finishStep: number;
  gammaTargetIndex: number;
  gammaStepDelay: number;
  gammaIndex: number;
  gammaStepFrameCounter: number;
  fadeInCounter: number;
  fadeInActive: number;
  fadeScreenCounter: number;
  fadeDestColor: number;
  currBlendEVA: number;
  currBlendEVB: number;
  targetBlendEVA: number;
  targetBlendEVB: number;
  blendDelay: number;
  blendFrameCounter: number;
  blendUpdateCounter: number;
  rainStrength: number;
  loadDroughtPalsIndex: number;
  loadDroughtPalsOffset: number;
  droughtBrightnessStage: number;
  droughtTimer: number;
  droughtState: number;
  droughtLastBrightnessStage: number;
}

export interface FieldWeatherTask {
  func: 'Task_WeatherInit' | 'Task_WeatherMain';
  priority: number;
}

export interface FieldWeatherRuntime {
  weather: FieldWeather;
  gPlttBufferUnfaded: Uint16Array;
  gPlttBufferFaded: Uint16Array;
  gPaletteFade: { active: boolean; y: number; blendColor: number };
  tasks: FieldWeatherTask[];
  gpuRegs: Map<number, number>;
  operations: string[];
  playedSoundEffects: number[];
  specialSEPlaying: boolean;
  sFieldEffectPaletteGammaTypes: number[];
  sPaletteGammaTypes: readonly number[] | number[];
  sDroughtFrameDelay: number;
  nextSpritePaletteIndex: number;
  weatherFinishResults: Map<number, boolean>;
  savedWeatherCalls: number[];
}

const PLTT_ID = (n: number): number => n * 16;
const OBJ_PLTT_ID = (n: number): number => 0x100 + PLTT_ID(n);
const u16 = (value: number): number => value & 0xffff;
const s16 = (value: number): number => (value << 16) >> 16;
export const RGB = (r: number, g: number, b: number): number => u16(r | (g << 5) | (b << 10));
export const BLDALPHA_BLEND = (eva: number, evb: number): number => (eva & 0x1f) | ((evb & 0x1f) << 8);

const createGammaTable = (): number[][] => Array.from({ length: 19 }, () => Array(32).fill(0));

const createWeather = (): FieldWeather => ({
  gammaShifts: createGammaTable(),
  altGammaShifts: createGammaTable(),
  altGammaSpritePalIndex: 0,
  weatherPicSpritePalIndex: 0,
  rainSpriteCount: 0,
  curRainSpriteIndex: 0,
  cloudSpritesCreated: false,
  snowflakeSpriteCount: 0,
  ashSpritesCreated: false,
  fogHSpritesCreated: false,
  fogDSpritesCreated: false,
  sandstormSpritesCreated: false,
  sandstormSwirlSpritesCreated: false,
  bubblesSpritesCreated: false,
  lightenedFogSpritePals: Array(6).fill(0),
  lightenedFogSpritePalsCount: 0,
  currWeather: WEATHER_NONE,
  nextWeather: WEATHER_NONE,
  palProcessingState: WEATHER_PAL_STATE_IDLE,
  readyForInit: false,
  weatherChangeComplete: true,
  taskId: 0xff,
  finishStep: 0,
  gammaTargetIndex: 0,
  gammaStepDelay: 0,
  gammaIndex: 0,
  gammaStepFrameCounter: 0,
  fadeInCounter: 0,
  fadeInActive: 0,
  fadeScreenCounter: 0,
  fadeDestColor: 0,
  currBlendEVA: 0,
  currBlendEVB: 0,
  targetBlendEVA: 0,
  targetBlendEVB: 0,
  blendDelay: 0,
  blendFrameCounter: 0,
  blendUpdateCounter: 0,
  rainStrength: 0,
  loadDroughtPalsIndex: 0,
  loadDroughtPalsOffset: 0,
  droughtBrightnessStage: 0,
  droughtTimer: 0,
  droughtState: 0,
  droughtLastBrightnessStage: 0
});

export const createFieldWeatherRuntime = (): FieldWeatherRuntime => ({
  weather: createWeather(),
  gPlttBufferUnfaded: new Uint16Array(512),
  gPlttBufferFaded: new Uint16Array(512),
  gPaletteFade: { active: false, y: 0, blendColor: 0 },
  tasks: [],
  gpuRegs: new Map(),
  operations: [],
  playedSoundEffects: [],
  specialSEPlaying: false,
  sFieldEffectPaletteGammaTypes: Array(32).fill(0),
  sPaletteGammaTypes: sBasePaletteGammaTypes,
  sDroughtFrameDelay: 0,
  nextSpritePaletteIndex: 0,
  weatherFinishResults: new Map(),
  savedWeatherCalls: []
});

const colorParts = (color: number): [number, number, number] => [
  color & 0x1f,
  (color >> 5) & 0x1f,
  (color >> 10) & 0x1f
];

const blendChannel = (channel: number, target: number, coeff: number): number =>
  channel + (((target - channel) * coeff) >> 4);

const blendColor = (base: number, coeff: number, color: number): number => {
  const [r, g, b] = colorParts(base);
  const [rBlend, gBlend, bBlend] = colorParts(color);
  return RGB(blendChannel(r, rBlend, coeff), blendChannel(g, gBlend, coeff), blendChannel(b, bBlend, coeff));
};

const copyPaletteRange = (src: Uint16Array, dest: Uint16Array, offset: number, count: number): void => {
  for (let i = 0; i < count; i++) {
    dest[offset + i] = src[offset + i];
  }
};

const blendPalette = (runtime: FieldWeatherRuntime, offset: number, count: number, coeff: number, color: number): void => {
  for (let i = 0; i < count; i++) {
    runtime.gPlttBufferFaded[offset + i] = blendColor(runtime.gPlttBufferUnfaded[offset + i], coeff, color);
  }
};

export const blendPalettesAt = (palbuf: Uint16Array, color: number, coeff: number, size: number): void => {
  for (let i = 0; i < size; i++) {
    palbuf[i] = blendColor(palbuf[i], coeff, color);
  }
};

const recordWeatherFunc = (runtime: FieldWeatherRuntime, weather: number, name: string): void => {
  runtime.operations.push(`${weatherFuncName(weather)}_${name}`);
};

const weatherFuncName = (weather: number): string => {
  switch (weather) {
    case WEATHER_SUNNY_CLOUDS: return 'Clouds';
    case WEATHER_SUNNY: return 'Sunny';
    case WEATHER_RAIN: return 'Rain';
    case WEATHER_SNOW: return 'Snow';
    case WEATHER_RAIN_THUNDERSTORM: return 'Thunderstorm';
    case WEATHER_FOG_HORIZONTAL:
    case WEATHER_UNDERWATER: return 'FogHorizontal';
    case WEATHER_VOLCANIC_ASH: return 'Ash';
    case WEATHER_SANDSTORM: return 'Sandstorm';
    case WEATHER_FOG_DIAGONAL: return 'FogDiagonal';
    case WEATHER_SHADE: return 'Shade';
    case WEATHER_DROUGHT: return 'Drought';
    case WEATHER_DOWNPOUR: return 'Downpour';
    case WEATHER_UNDERWATER_BUBBLES: return 'Bubbles';
    default: return 'None';
  }
};

const weatherInitVars = (runtime: FieldWeatherRuntime, weather: number): void => {
  if (weather === WEATHER_NONE) {
    runtime.weather.gammaTargetIndex = 0;
    runtime.weather.gammaStepDelay = 0;
    return;
  }
  recordWeatherFunc(runtime, weather, 'InitVars');
};

const weatherMain = (runtime: FieldWeatherRuntime, weather: number): void => {
  if (weather !== WEATHER_NONE) {
    recordWeatherFunc(runtime, weather, 'Main');
  }
};

const weatherInitAll = (runtime: FieldWeatherRuntime, weather: number): void => {
  if (weather !== WEATHER_NONE) {
    recordWeatherFunc(runtime, weather, 'InitAll');
  }
};

const weatherFinish = (runtime: FieldWeatherRuntime, weather: number): boolean => {
  if (weather !== WEATHER_NONE) {
    recordWeatherFunc(runtime, weather, 'Finish');
  }
  return runtime.weatherFinishResults.get(weather) ?? false;
};

const funcIsActiveTask = (runtime: FieldWeatherRuntime, func: FieldWeatherTask['func']): boolean =>
  runtime.tasks.some((task) => task.func === func);

const createTask = (runtime: FieldWeatherRuntime, func: FieldWeatherTask['func'], priority: number): number => {
  runtime.tasks.push({ func, priority });
  return runtime.tasks.length - 1;
};

export const buildGammaShiftTables = (runtime: FieldWeatherRuntime): void => {
  runtime.sPaletteGammaTypes = sBasePaletteGammaTypes;
  for (let v0 = 0; v0 <= 1; v0++) {
    const gammaTable = v0 === 0 ? runtime.weather.gammaShifts : runtime.weather.altGammaShifts;
    for (let v2 = 0; v2 < 32; v2++) {
      let v4 = v2 << 8;
      const v5 = v0 === 0 ? Math.trunc((v2 << 8) / 16) : 0;
      let gammaIndex = 0;
      for (; gammaIndex <= 2; gammaIndex++) {
        v4 = u16(v4 - v5);
        gammaTable[gammaIndex][v2] = v4 >> 8;
      }
      const v9 = v4;
      const v10 = 0x1f00 - v4 < 0 ? 0x1f00 - v4 + 0xf : 0x1f00 - v4;
      const v11 = v10 >> 4;
      if (v2 < 12) {
        for (; gammaIndex < 19; gammaIndex++) {
          v4 = u16(v4 + v11);
          const dunno = s16(v4 - v9);
          if (dunno > 0) {
            v4 = u16(v4 - ((dunno + ((dunno & 0xffff) >> 15)) >> 1));
          }
          gammaTable[gammaIndex][v2] = Math.min(v4 >> 8, 0x1f);
        }
      } else {
        for (; gammaIndex < 19; gammaIndex++) {
          v4 = u16(v4 + v11);
          gammaTable[gammaIndex][v2] = Math.min(v4 >> 8, 0x1f);
        }
      }
    }
  }
};

export const startWeather = (runtime: FieldWeatherRuntime): void => {
  if (!funcIsActiveTask(runtime, 'Task_WeatherMain')) {
    const index = runtime.nextSpritePaletteIndex++;
    runtime.operations.push(`AllocSpritePalette(0x1200) -> ${index}`);
    runtime.operations.push(`CpuCopy32(${gDefaultWeatherSpritePalette}, gPlttBufferUnfaded[OBJ_PLTT_ID(${index})], PLTT_SIZE_4BPP)`);
    runtime.operations.push(`ApplyGlobalFieldPaletteTint(${index})`);
    buildGammaShiftTables(runtime);
    runtime.weather.altGammaSpritePalIndex = index;
    runtime.weather.weatherPicSpritePalIndex = index;
    runtime.weather.rainSpriteCount = 0;
    runtime.weather.curRainSpriteIndex = 0;
    runtime.weather.cloudSpritesCreated = false;
    runtime.weather.snowflakeSpriteCount = 0;
    runtime.weather.ashSpritesCreated = false;
    runtime.weather.fogHSpritesCreated = false;
    runtime.weather.fogDSpritesCreated = false;
    runtime.weather.sandstormSpritesCreated = false;
    runtime.weather.sandstormSwirlSpritesCreated = false;
    runtime.weather.bubblesSpritesCreated = false;
    runtime.weather.lightenedFogSpritePalsCount = 0;
    weatherSetBlendCoeffs(runtime, 16, 0);
    runtime.weather.currWeather = WEATHER_NONE;
    runtime.weather.palProcessingState = WEATHER_PAL_STATE_IDLE;
    runtime.weather.readyForInit = false;
    runtime.weather.weatherChangeComplete = true;
    runtime.weather.taskId = createTask(runtime, 'Task_WeatherInit', 80);
  }
};

export const setNextWeather = (runtime: FieldWeatherRuntime, weather: number): void => {
  if (weather !== WEATHER_RAIN && weather !== WEATHER_RAIN_THUNDERSTORM && weather !== WEATHER_DOWNPOUR) {
    playRainStoppingSoundEffect(runtime);
  }
  if (runtime.weather.nextWeather !== weather && runtime.weather.currWeather === weather) {
    weatherInitVars(runtime, weather);
  }
  runtime.weather.weatherChangeComplete = false;
  runtime.weather.nextWeather = weather;
  runtime.weather.finishStep = 0;
};

export const setCurrentAndNextWeather = (runtime: FieldWeatherRuntime, weather: number): void => {
  playRainStoppingSoundEffect(runtime);
  runtime.weather.currWeather = weather;
  runtime.weather.nextWeather = weather;
};

export const setCurrentAndNextWeatherNoDelay = (runtime: FieldWeatherRuntime, weather: number): void => {
  setCurrentAndNextWeather(runtime, weather);
  runtime.weather.readyForInit = true;
};

export const taskWeatherInit = (runtime: FieldWeatherRuntime, taskId: number): void => {
  if (runtime.weather.readyForInit) {
    weatherInitAll(runtime, runtime.weather.currWeather);
    runtime.tasks[taskId].func = 'Task_WeatherMain';
  }
};

export const taskWeatherMain = (runtime: FieldWeatherRuntime, _taskId: number): void => {
  if (runtime.weather.currWeather !== runtime.weather.nextWeather) {
    if (!weatherFinish(runtime, runtime.weather.currWeather)) {
      weatherInitVars(runtime, runtime.weather.nextWeather);
      runtime.weather.gammaStepFrameCounter = 0;
      runtime.weather.palProcessingState = WEATHER_PAL_STATE_CHANGING_WEATHER;
      runtime.weather.currWeather = runtime.weather.nextWeather;
      runtime.weather.weatherChangeComplete = true;
    }
  } else {
    weatherMain(runtime, runtime.weather.currWeather);
  }
  sWeatherPalStateFuncs[runtime.weather.palProcessingState]?.(runtime);
};

export const updateWeatherGammaShift = (runtime: FieldWeatherRuntime): void => {
  if (runtime.weather.gammaIndex === runtime.weather.gammaTargetIndex) {
    runtime.weather.palProcessingState = WEATHER_PAL_STATE_IDLE;
  } else if (++runtime.weather.gammaStepFrameCounter >= runtime.weather.gammaStepDelay) {
    runtime.weather.gammaStepFrameCounter = 0;
    if (runtime.weather.gammaIndex < runtime.weather.gammaTargetIndex) {
      runtime.weather.gammaIndex++;
    } else {
      runtime.weather.gammaIndex--;
    }
    applyGammaShift(runtime, 0, 32, runtime.weather.gammaIndex);
  }
};

export const fadeInScreenWithWeather = (runtime: FieldWeatherRuntime): void => {
  if (++runtime.weather.fadeInCounter > 1) {
    runtime.weather.fadeInActive = 0;
  }
  switch (runtime.weather.currWeather) {
    case WEATHER_RAIN:
    case WEATHER_RAIN_THUNDERSTORM:
    case WEATHER_DOWNPOUR:
    case WEATHER_SNOW:
    case WEATHER_SHADE:
      if (!fadeInScreenRainShowShade(runtime)) {
        runtime.weather.gammaIndex = 3;
        runtime.weather.palProcessingState = WEATHER_PAL_STATE_IDLE;
      }
      break;
    case WEATHER_DROUGHT:
      if (!fadeInScreenDrought(runtime)) {
        runtime.weather.gammaIndex = -6;
        runtime.weather.palProcessingState = WEATHER_PAL_STATE_IDLE;
      }
      break;
    case WEATHER_FOG_HORIZONTAL:
      if (!fadeInScreenFogHorizontal(runtime)) {
        runtime.weather.gammaIndex = 0;
        runtime.weather.palProcessingState = WEATHER_PAL_STATE_IDLE;
      }
      break;
    default:
      if (!runtime.gPaletteFade.active) {
        runtime.weather.gammaIndex = runtime.weather.gammaTargetIndex;
        runtime.weather.palProcessingState = WEATHER_PAL_STATE_IDLE;
      }
      break;
  }
};

export const fadeInScreenRainShowShade = (runtime: FieldWeatherRuntime): boolean => {
  if (runtime.weather.fadeScreenCounter === 16) {
    return false;
  }
  if (++runtime.weather.fadeScreenCounter >= 16) {
    applyGammaShift(runtime, 0, 32, 3);
    runtime.weather.fadeScreenCounter = 16;
    return false;
  }
  applyGammaShiftWithBlend(runtime, 0, 32, 3, 16 - runtime.weather.fadeScreenCounter, runtime.weather.fadeDestColor);
  return true;
};

export const fadeInScreenDrought = (runtime: FieldWeatherRuntime): boolean => {
  if (runtime.weather.fadeScreenCounter === 16) {
    return false;
  }
  if (++runtime.weather.fadeScreenCounter >= 16) {
    applyGammaShift(runtime, 0, 32, -6);
    runtime.weather.fadeScreenCounter = 16;
    return false;
  }
  applyDroughtGammaShiftWithBlend(runtime, -6, 16 - runtime.weather.fadeScreenCounter, runtime.weather.fadeDestColor);
  return true;
};

export const fadeInScreenFogHorizontal = (runtime: FieldWeatherRuntime): boolean => {
  if (runtime.weather.fadeScreenCounter === 16) {
    return false;
  }
  runtime.weather.fadeScreenCounter++;
  applyFogBlend(runtime, 16 - runtime.weather.fadeScreenCounter, runtime.weather.fadeDestColor);
  return true;
};

export const applyGammaShift = (runtime: FieldWeatherRuntime, startPalIndex: number, numPalettes: number, gammaIndex: number): void => {
  if (gammaIndex > 0) {
    const tableIndex = gammaIndex - 1;
    let palOffset = PLTT_ID(startPalIndex);
    const endPalIndex = numPalettes + startPalIndex;
    let curPalIndex = startPalIndex;
    while (curPalIndex < endPalIndex) {
      if (runtime.sPaletteGammaTypes[curPalIndex] === GAMMA_NONE) {
        copyPaletteRange(runtime.gPlttBufferUnfaded, runtime.gPlttBufferFaded, palOffset, 16);
        palOffset += 16;
      } else {
        const gammaTable = runtime.sPaletteGammaTypes[curPalIndex] === GAMMA_ALT || curPalIndex - 16 === runtime.weather.altGammaSpritePalIndex
          ? runtime.weather.altGammaShifts[tableIndex]
          : runtime.weather.gammaShifts[tableIndex];
        for (let i = 0; i < 16; i++) {
          const [r, g, b] = colorParts(runtime.gPlttBufferUnfaded[palOffset]);
          runtime.gPlttBufferFaded[palOffset++] = RGB(gammaTable[r], gammaTable[g], gammaTable[b]);
        }
      }
      curPalIndex++;
    }
  } else if (gammaIndex === 0) {
    copyPaletteRange(runtime.gPlttBufferUnfaded, runtime.gPlttBufferFaded, PLTT_ID(startPalIndex), numPalettes * 16);
  }
};

export const applyGammaShiftWithBlend = (
  runtime: FieldWeatherRuntime,
  startPalIndex: number,
  numPalettes: number,
  gammaIndex: number,
  blendCoeff: number,
  color: number
): void => {
  let palOffset = PLTT_ID(startPalIndex);
  const endPalIndex = numPalettes + startPalIndex;
  let curPalIndex = startPalIndex;
  const tableIndex = gammaIndex - 1;
  const [rBlend, gBlend, bBlend] = colorParts(color);
  while (curPalIndex < endPalIndex) {
    if (runtime.sPaletteGammaTypes[curPalIndex] === GAMMA_NONE) {
      blendPalette(runtime, palOffset, 16, blendCoeff, color);
      blendPalette(runtime, palOffset, 16, blendCoeff, color);
      palOffset += 16;
    } else {
      const gammaTable = runtime.sPaletteGammaTypes[curPalIndex] === GAMMA_NORMAL
        ? runtime.weather.gammaShifts[tableIndex]
        : runtime.weather.altGammaShifts[tableIndex];
      for (let i = 0; i < 16; i++) {
        const [baseR, baseG, baseB] = colorParts(runtime.gPlttBufferUnfaded[palOffset]);
        const r = blendChannel(gammaTable[baseR], rBlend, blendCoeff);
        const g = blendChannel(gammaTable[baseG], gBlend, blendCoeff);
        const b = blendChannel(gammaTable[baseB], bBlend, blendCoeff);
        runtime.gPlttBufferFaded[palOffset++] = RGB(r, g, b);
      }
    }
    curPalIndex++;
  }
};

export const applyDroughtGammaShiftWithBlend = (
  runtime: FieldWeatherRuntime,
  gammaIndex: number,
  blendCoeff: number,
  color: number
): void => {
  gammaIndex = -gammaIndex - 1;
  void gammaIndex;
  let palOffset = 0;
  for (let curPalIndex = 0; curPalIndex < 32; curPalIndex++) {
    if (runtime.sPaletteGammaTypes[curPalIndex] === GAMMA_NONE) {
      blendPalette(runtime, palOffset, 16, blendCoeff, color);
      palOffset += 16;
    } else {
      for (let i = 0; i < 16; i++) {
        runtime.gPlttBufferFaded[palOffset] = blendColor(runtime.gPlttBufferUnfaded[palOffset], blendCoeff, color);
        palOffset++;
      }
    }
  }
};

export const applyFogBlend = (runtime: FieldWeatherRuntime, blendCoeff: number, color: number): void => {
  blendPalette(runtime, 0, 256, blendCoeff, color);
  const [rBlend, gBlend, bBlend] = colorParts(color);
  for (let curPalIndex = 16; curPalIndex < 32; curPalIndex++) {
    if (lightenSpritePaletteInFog(runtime, curPalIndex)) {
      let palOffset = PLTT_ID(curPalIndex);
      const palEnd = PLTT_ID(curPalIndex + 1);
      while (palOffset < palEnd) {
        const [baseR, baseG, baseB] = colorParts(runtime.gPlttBufferUnfaded[palOffset]);
        const rLight = baseR + (((28 - baseR) * 3) >> 2);
        const gLight = baseG + (((31 - baseG) * 3) >> 2);
        const bLight = baseB + (((28 - baseB) * 3) >> 2);
        const r = blendChannel(rLight, rBlend, blendCoeff);
        const g = blendChannel(gLight, gBlend, blendCoeff);
        const b = blendChannel(bLight, bBlend, blendCoeff);
        runtime.gPlttBufferFaded[palOffset++] = RGB(r, g, b);
      }
    } else {
      blendPalette(runtime, PLTT_ID(curPalIndex), 16, blendCoeff, color);
    }
  }
};

export const markFogSpritePalToLighten = (runtime: FieldWeatherRuntime, paletteIndex: number): void => {
  if (runtime.weather.lightenedFogSpritePalsCount < 6) {
    runtime.weather.lightenedFogSpritePals[runtime.weather.lightenedFogSpritePalsCount] = paletteIndex;
    runtime.weather.lightenedFogSpritePalsCount++;
  }
};

export const lightenSpritePaletteInFog = (runtime: FieldWeatherRuntime, paletteIndex: number): boolean => {
  for (let i = 0; i < runtime.weather.lightenedFogSpritePalsCount; i++) {
    if (runtime.weather.lightenedFogSpritePals[i] === paletteIndex) {
      return true;
    }
  }
  return false;
};

export const weatherShiftGammaIfPalStateIdle = (runtime: FieldWeatherRuntime, gammaIndex: number): void => {
  if (runtime.weather.palProcessingState === WEATHER_PAL_STATE_IDLE) {
    applyGammaShift(runtime, 0, 32, gammaIndex);
    runtime.weather.gammaIndex = gammaIndex;
  }
};

export const weatherBeginGammaFade = (runtime: FieldWeatherRuntime, gammaIndex: number, gammaTargetIndex: number, gammaStepDelay: number): void => {
  if (runtime.weather.palProcessingState === WEATHER_PAL_STATE_IDLE) {
    runtime.weather.palProcessingState = WEATHER_PAL_STATE_CHANGING_WEATHER;
    runtime.weather.gammaIndex = gammaIndex;
    runtime.weather.gammaTargetIndex = gammaTargetIndex;
    runtime.weather.gammaStepFrameCounter = 0;
    runtime.weather.gammaStepDelay = gammaStepDelay;
    weatherShiftGammaIfPalStateIdle(runtime, gammaIndex);
  }
};

const fadeMode = (mode: number): { color: number; fadeOut: boolean } | undefined => {
  switch (mode) {
    case FADE_FROM_BLACK: return { color: RGB_BLACK, fadeOut: false };
    case FADE_FROM_WHITE: return { color: RGB_WHITEALPHA, fadeOut: false };
    case FADE_TO_BLACK: return { color: RGB_BLACK, fadeOut: true };
    case FADE_TO_WHITE: return { color: RGB_WHITEALPHA, fadeOut: true };
    default: return undefined;
  }
};

const usesWeatherPaletteFade = (weather: number): boolean =>
  weather === WEATHER_RAIN
  || weather === WEATHER_RAIN_THUNDERSTORM
  || weather === WEATHER_DOWNPOUR
  || weather === WEATHER_SNOW
  || weather === WEATHER_FOG_HORIZONTAL
  || weather === WEATHER_SHADE
  || weather === WEATHER_DROUGHT;

export const fadeScreen = (runtime: FieldWeatherRuntime, mode: number, delay: number): void => {
  fadeSelectedPals(runtime, mode, delay, PALETTES_ALL);
};

export const fadeSelectedPals = (runtime: FieldWeatherRuntime, mode: number, delay: number, selectedPalettes: number): void => {
  const fade = fadeMode(mode);
  if (!fade) {
    return;
  }
  const useWeatherPal = usesWeatherPaletteFade(runtime.weather.currWeather);
  if (fade.fadeOut) {
    if (useWeatherPal) {
      copyPaletteRange(runtime.gPlttBufferFaded, runtime.gPlttBufferUnfaded, 0, 512);
    }
    runtime.operations.push(`BeginNormalPaletteFade(${selectedPalettes}, ${delay}, 0, 16, ${fade.color})`);
    runtime.weather.palProcessingState = WEATHER_PAL_STATE_SCREEN_FADING_OUT;
  } else {
    runtime.weather.fadeDestColor = fade.color;
    if (useWeatherPal) {
      runtime.weather.fadeScreenCounter = 0;
    } else {
      runtime.operations.push(`BeginNormalPaletteFade(${selectedPalettes}, ${delay}, 16, 0, ${fade.color})`);
    }
    runtime.weather.palProcessingState = WEATHER_PAL_STATE_SCREEN_FADING_IN;
    runtime.weather.fadeInActive = 1;
    runtime.weather.fadeInCounter = 0;
    weatherSetBlendCoeffs(runtime, runtime.weather.currBlendEVA, runtime.weather.currBlendEVB);
    runtime.weather.readyForInit = true;
  }
};

export const isWeatherNotFadingIn = (runtime: FieldWeatherRuntime): boolean =>
  runtime.weather.palProcessingState !== WEATHER_PAL_STATE_SCREEN_FADING_IN;

export const updateSpritePaletteWithWeather = (runtime: FieldWeatherRuntime, spritePaletteIndex: number): void => {
  let paletteIndex = 16 + spritePaletteIndex;
  switch (runtime.weather.palProcessingState) {
    case WEATHER_PAL_STATE_SCREEN_FADING_IN:
      if (runtime.weather.fadeInActive !== 0) {
        if (runtime.weather.currWeather === WEATHER_FOG_HORIZONTAL) {
          markFogSpritePalToLighten(runtime, paletteIndex);
        }
        paletteIndex = PLTT_ID(paletteIndex);
        for (let i = 0; i < 16; i++) {
          runtime.gPlttBufferFaded[paletteIndex + i] = runtime.weather.fadeDestColor;
        }
      }
      break;
    case WEATHER_PAL_STATE_SCREEN_FADING_OUT:
      paletteIndex = PLTT_ID(paletteIndex);
      copyPaletteRange(runtime.gPlttBufferFaded, runtime.gPlttBufferUnfaded, paletteIndex, 16);
      blendPalette(runtime, paletteIndex, 16, runtime.gPaletteFade.y, runtime.gPaletteFade.blendColor);
      break;
    default:
      if (runtime.weather.currWeather !== WEATHER_FOG_HORIZONTAL) {
        applyGammaShift(runtime, paletteIndex, 1, runtime.weather.gammaIndex);
      } else {
        blendPalette(runtime, PLTT_ID(paletteIndex), 16, 12, RGB(28, 31, 28));
      }
      break;
  }
};

export const applyWeatherGammaShiftToPal = (runtime: FieldWeatherRuntime, paletteIndex: number): void => {
  applyGammaShift(runtime, paletteIndex, 1, runtime.weather.gammaIndex);
};

export const isWeatherFadingIn = (runtime: FieldWeatherRuntime): number =>
  runtime.weather.palProcessingState === WEATHER_PAL_STATE_SCREEN_FADING_IN ? runtime.weather.fadeInActive : 0;

export const loadCustomWeatherSpritePalette = (runtime: FieldWeatherRuntime, palette: ArrayLike<number>): void => {
  const offset = OBJ_PLTT_ID(runtime.weather.weatherPicSpritePalIndex);
  for (let i = 0; i < 16; i++) {
    runtime.gPlttBufferUnfaded[offset + i] = u16(palette[i] ?? 0);
  }
  updateSpritePaletteWithWeather(runtime, runtime.weather.weatherPicSpritePalIndex);
};

export const resetDroughtWeatherPaletteLoading = (runtime: FieldWeatherRuntime): void => {
  runtime.weather.loadDroughtPalsIndex = 1;
  runtime.weather.loadDroughtPalsOffset = 1;
  runtime.weather.loadDroughtPalsOffset = 1;
};

export const loadDroughtWeatherPalettes = (runtime: FieldWeatherRuntime): boolean => {
  if (runtime.weather.loadDroughtPalsIndex < 32) {
    if (runtime.weather.loadDroughtPalsIndex < 32) {
      return true;
    }
  }
  return false;
};

export const loadDroughtWeatherPalette = (_runtime: FieldWeatherRuntime, _gammaIndexPtr?: unknown, _a1?: unknown): void => {};

export const setDroughtGamma = (runtime: FieldWeatherRuntime, gammaIndex: number): void => {
  weatherShiftGammaIfPalStateIdle(runtime, -gammaIndex - 1);
};

export const droughtStateInit = (runtime: FieldWeatherRuntime): void => {
  runtime.weather.droughtBrightnessStage = 0;
  runtime.weather.droughtTimer = 0;
  runtime.weather.droughtState = 0;
  runtime.weather.droughtLastBrightnessStage = 0;
  runtime.sDroughtFrameDelay = 5;
};

export const droughtStateRun = (runtime: FieldWeatherRuntime): void => {
  switch (runtime.weather.droughtState) {
    case 0:
      if (++runtime.weather.droughtTimer > runtime.sDroughtFrameDelay) {
        runtime.weather.droughtTimer = 0;
        setDroughtGamma(runtime, runtime.weather.droughtBrightnessStage++);
        if (runtime.weather.droughtBrightnessStage > 5) {
          runtime.weather.droughtLastBrightnessStage = runtime.weather.droughtBrightnessStage;
          runtime.weather.droughtState = 1;
          runtime.weather.droughtTimer = 60;
        }
      }
      break;
    case 1:
      runtime.weather.droughtTimer = (runtime.weather.droughtTimer + 3) & 0x7f;
      runtime.weather.droughtBrightnessStage = ((sineTableValue(runtime.weather.droughtTimer) - 1) >> 6) + 2;
      if (runtime.weather.droughtBrightnessStage !== runtime.weather.droughtLastBrightnessStage) {
        setDroughtGamma(runtime, runtime.weather.droughtBrightnessStage);
      }
      runtime.weather.droughtLastBrightnessStage = runtime.weather.droughtBrightnessStage;
      break;
    case 2:
      if (++runtime.weather.droughtTimer > runtime.sDroughtFrameDelay) {
        runtime.weather.droughtTimer = 0;
        setDroughtGamma(runtime, --runtime.weather.droughtBrightnessStage);
        if (runtime.weather.droughtBrightnessStage === 3) {
          runtime.weather.droughtState = 0;
        }
      }
      break;
  }
};

export const weatherSetBlendCoeffs = (runtime: FieldWeatherRuntime, eva: number, evb: number): void => {
  runtime.weather.currBlendEVA = eva;
  runtime.weather.currBlendEVB = evb;
  runtime.weather.targetBlendEVA = eva;
  runtime.weather.targetBlendEVB = evb;
  runtime.gpuRegs.set(REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(eva, evb));
};

export const weatherSetTargetBlendCoeffs = (runtime: FieldWeatherRuntime, eva: number, evb: number, delay: number): void => {
  runtime.weather.targetBlendEVA = eva;
  runtime.weather.targetBlendEVB = evb;
  runtime.weather.blendDelay = delay;
  runtime.weather.blendFrameCounter = 0;
  runtime.weather.blendUpdateCounter = 0;
};

export const weatherUpdateBlend = (runtime: FieldWeatherRuntime): boolean => {
  if (runtime.weather.currBlendEVA === runtime.weather.targetBlendEVA && runtime.weather.currBlendEVB === runtime.weather.targetBlendEVB) {
    return true;
  }
  if (++runtime.weather.blendFrameCounter > runtime.weather.blendDelay) {
    runtime.weather.blendFrameCounter = 0;
    runtime.weather.blendUpdateCounter++;
    if (runtime.weather.blendUpdateCounter & 1) {
      if (runtime.weather.currBlendEVA < runtime.weather.targetBlendEVA) runtime.weather.currBlendEVA++;
      else if (runtime.weather.currBlendEVA > runtime.weather.targetBlendEVA) runtime.weather.currBlendEVA--;
    } else {
      if (runtime.weather.currBlendEVB < runtime.weather.targetBlendEVB) runtime.weather.currBlendEVB++;
      else if (runtime.weather.currBlendEVB > runtime.weather.targetBlendEVB) runtime.weather.currBlendEVB--;
    }
  }
  runtime.gpuRegs.set(REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(runtime.weather.currBlendEVA, runtime.weather.currBlendEVB));
  return runtime.weather.currBlendEVA === runtime.weather.targetBlendEVA && runtime.weather.currBlendEVB === runtime.weather.targetBlendEVB;
};

export const setFieldWeather = (runtime: FieldWeatherRuntime, weather: number): void => {
  switch (weather) {
    case COORD_EVENT_WEATHER_SUNNY_CLOUDS: runtime.savedWeatherCalls.push(WEATHER_SUNNY_CLOUDS); break;
    case COORD_EVENT_WEATHER_SUNNY: runtime.savedWeatherCalls.push(WEATHER_SUNNY); break;
    case COORD_EVENT_WEATHER_RAIN: runtime.savedWeatherCalls.push(WEATHER_RAIN); break;
    case COORD_EVENT_WEATHER_SNOW: runtime.savedWeatherCalls.push(WEATHER_SNOW); break;
    case COORD_EVENT_WEATHER_RAIN_THUNDERSTORM: runtime.savedWeatherCalls.push(WEATHER_RAIN_THUNDERSTORM); break;
    case COORD_EVENT_WEATHER_FOG_HORIZONTAL: runtime.savedWeatherCalls.push(WEATHER_FOG_HORIZONTAL); break;
    case COORD_EVENT_WEATHER_FOG_DIAGONAL: runtime.savedWeatherCalls.push(WEATHER_FOG_DIAGONAL); break;
    case COORD_EVENT_WEATHER_VOLCANIC_ASH: runtime.savedWeatherCalls.push(WEATHER_VOLCANIC_ASH); break;
    case COORD_EVENT_WEATHER_SANDSTORM: runtime.savedWeatherCalls.push(WEATHER_SANDSTORM); break;
    case COORD_EVENT_WEATHER_SHADE: runtime.savedWeatherCalls.push(WEATHER_SHADE); break;
  }
};

export const getCurrentWeather = (runtime: FieldWeatherRuntime): number => runtime.weather.currWeather;

export const setRainStrengthFromSoundEffect = (runtime: FieldWeatherRuntime, soundEffect: number): void => {
  if (runtime.weather.palProcessingState !== WEATHER_PAL_STATE_SCREEN_FADING_OUT) {
    switch (soundEffect) {
      case SE_RAIN:
        runtime.weather.rainStrength = 0;
        break;
      case SE_DOWNPOUR:
        runtime.weather.rainStrength = 1;
        break;
      case SE_THUNDERSTORM:
        runtime.weather.rainStrength = 2;
        break;
      default:
        return;
    }
    runtime.playedSoundEffects.push(soundEffect);
  }
};

export const playRainStoppingSoundEffect = (runtime: FieldWeatherRuntime): void => {
  if (runtime.specialSEPlaying) {
    switch (runtime.weather.rainStrength) {
      case 0:
        runtime.playedSoundEffects.push(SE_RAIN_STOP);
        break;
      case 1:
        runtime.playedSoundEffects.push(SE_DOWNPOUR_STOP);
        break;
      case 2:
      default:
        runtime.playedSoundEffects.push(SE_THUNDERSTORM_STOP);
        break;
    }
  }
};

export const isWeatherChangeComplete = (runtime: FieldWeatherRuntime): boolean => runtime.weather.weatherChangeComplete;

export const setWeatherScreenFadeOut = (runtime: FieldWeatherRuntime): void => {
  runtime.weather.palProcessingState = WEATHER_PAL_STATE_SCREEN_FADING_OUT;
};

export const weatherProcessingIdle = (runtime: FieldWeatherRuntime): void => {
  runtime.weather.palProcessingState = WEATHER_PAL_STATE_IDLE;
};

export const preservePaletteInWeather = (runtime: FieldWeatherRuntime, preservedPalIndex: number): void => {
  runtime.sFieldEffectPaletteGammaTypes = [...sBasePaletteGammaTypes];
  runtime.sFieldEffectPaletteGammaTypes[preservedPalIndex] = GAMMA_NONE;
  runtime.sPaletteGammaTypes = runtime.sFieldEffectPaletteGammaTypes;
};

export const resetPreservedPalettesInWeather = (runtime: FieldWeatherRuntime): void => {
  runtime.sPaletteGammaTypes = sBasePaletteGammaTypes;
};

export const slightlyDarkenPalsInWeather = (runtime: FieldWeatherRuntime, palbuf: Uint16Array, _unused: Uint16Array | undefined, size: number): void => {
  switch (runtime.weather.currWeather) {
    case WEATHER_RAIN:
    case WEATHER_SNOW:
    case WEATHER_RAIN_THUNDERSTORM:
    case WEATHER_SHADE:
    case WEATHER_DOWNPOUR:
      blendPalettesAt(palbuf, RGB_BLACK, 3, size);
      break;
  }
};

const doNothing = (_runtime: FieldWeatherRuntime): void => undefined;

export const noneInit = (runtime: FieldWeatherRuntime): void => {
  runtime.weather.gammaTargetIndex = 0;
  runtime.weather.gammaStepDelay = 0;
};

export const noneMain = (_runtime: FieldWeatherRuntime): void => {};
export const noneFinish = (_runtime: FieldWeatherRuntime): number => 0;

const sWeatherPalStateFuncs = [
  updateWeatherGammaShift,
  fadeInScreenWithWeather,
  doNothing,
  doNothing
] as const;

export const StartWeather = startWeather;
export const SetNextWeather = setNextWeather;
export const SetCurrentAndNextWeather = setCurrentAndNextWeather;
export const SetCurrentAndNextWeatherNoDelay = setCurrentAndNextWeatherNoDelay;
export const Task_WeatherInit = taskWeatherInit;
export const Task_WeatherMain = taskWeatherMain;
export const None_Init = noneInit;
export const None_Main = noneMain;
export const None_Finish = noneFinish;
export const BuildGammaShiftTables = buildGammaShiftTables;
export const UpdateWeatherGammaShift = updateWeatherGammaShift;
export const FadeInScreenWithWeather = fadeInScreenWithWeather;
export const FadeInScreen_RainShowShade = fadeInScreenRainShowShade;
export const FadeInScreen_Drought = fadeInScreenDrought;
export const FadeInScreen_FogHorizontal = fadeInScreenFogHorizontal;
export const DoNothing = doNothing;
export const ApplyGammaShift = applyGammaShift;
export const ApplyGammaShiftWithBlend = applyGammaShiftWithBlend;
export const ApplyDroughtGammaShiftWithBlend = applyDroughtGammaShiftWithBlend;
export const ApplyFogBlend = applyFogBlend;
export const MarkFogSpritePalToLighten = markFogSpritePalToLighten;
export const LightenSpritePaletteInFog = lightenSpritePaletteInFog;
export const WeatherShiftGammaIfPalStateIdle = weatherShiftGammaIfPalStateIdle;
export const WeatherBeginGammaFade = weatherBeginGammaFade;
export const FadeScreen = fadeScreen;
export const FadeSelectedPals = fadeSelectedPals;
export const IsWeatherNotFadingIn = isWeatherNotFadingIn;
export const UpdateSpritePaletteWithWeather = updateSpritePaletteWithWeather;
export const ApplyWeatherGammaShiftToPal = applyWeatherGammaShiftToPal;
export const IsWeatherFadingIn = isWeatherFadingIn;
export const LoadCustomWeatherSpritePalette = loadCustomWeatherSpritePalette;
export const LoadDroughtWeatherPalette = loadDroughtWeatherPalette;
export const ResetDroughtWeatherPaletteLoading = resetDroughtWeatherPaletteLoading;
export const LoadDroughtWeatherPalettes = loadDroughtWeatherPalettes;
export const SetDroughtGamma = setDroughtGamma;
export const DroughtStateInit = droughtStateInit;
export const DroughtStateRun = droughtStateRun;
export const Weather_SetBlendCoeffs = weatherSetBlendCoeffs;
export const Weather_SetTargetBlendCoeffs = weatherSetTargetBlendCoeffs;
export const Weather_UpdateBlend = weatherUpdateBlend;
export const SetFieldWeather = setFieldWeather;
export const GetCurrentWeather = getCurrentWeather;
export const SetRainStrengthFromSoundEffect = setRainStrengthFromSoundEffect;
export const PlayRainStoppingSoundEffect = playRainStoppingSoundEffect;
export const IsWeatherChangeComplete = isWeatherChangeComplete;
export const SetWeatherScreenFadeOut = setWeatherScreenFadeOut;
export const WeatherProcessingIdle = weatherProcessingIdle;
export const PreservePaletteInWeather = preservePaletteInWeather;
export const ResetPreservedPalettesInWeather = resetPreservedPalettesInWeather;
export const SlightlyDarkenPalsInWeather = slightlyDarkenPalsInWeather;
