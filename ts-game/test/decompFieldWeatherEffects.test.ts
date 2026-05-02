import { describe, expect, test } from 'vitest';
import {
  DISPLAY_HEIGHT,
  DISPLAY_WIDTH,
  MAX_RAIN_SPRITES,
  NUM_CLOUD_SPRITES,
  Clouds_Finish,
  Clouds_InitAll,
  Clouds_InitVars,
  Clouds_Main,
  BLDCNT_EFFECT_LIGHTEN,
  BLDCNT_TGT1_BG1,
  BLDCNT_TGT1_BG2,
  BLDCNT_TGT1_BG3,
  BLDCNT_TGT1_OBJ,
  REG_OFFSET_BLDALPHA,
  REG_OFFSET_BLDCNT,
  REG_OFFSET_BLDY,
  REG_OFFSET_WININ,
  Rain_Finish,
  Rain_InitAll,
  Rain_InitVars,
  Rain_Main,
  Downpour_InitAll,
  Downpour_InitVars,
  Snow_Finish,
  Snow_InitAll,
  Snow_InitVars,
  Snow_Main,
  SE_RAIN,
  SE_DOWNPOUR,
  SE_THUNDER2,
  SE_THUNDERSTORM,
  WEATHER_RAIN,
  WEATHER_RAIN_THUNDERSTORM,
  WEATHER_SUNNY,
  BLDALPHA_BLEND,
  Ash_Finish,
  Ash_InitAll,
  Ash_InitVars,
  Ash_Main,
  Drought_Finish,
  Drought_InitAll,
  Drought_InitVars,
  Drought_Main,
  FogHorizontal_Finish,
  FogHorizontal_InitAll,
  FogHorizontal_InitVars,
  FogHorizontal_Main,
  FogDiagonal_Finish,
  FogDiagonal_InitAll,
  FogDiagonal_InitVars,
  FogDiagonal_Main,
  Sandstorm_Finish,
  Sandstorm_InitAll,
  Sandstorm_InitVars,
  Sandstorm_Main,
  Shade_Finish,
  Shade_InitAll,
  Shade_InitVars,
  Shade_Main,
  Bubbles_Finish,
  Bubbles_InitAll,
  Bubbles_InitVars,
  Bubbles_Main,
  Sunny_Finish,
  Sunny_InitAll,
  Sunny_InitVars,
  Sunny_Main,
  Thunderstorm_Finish,
  Thunderstorm_InitAll,
  Thunderstorm_InitVars,
  Thunderstorm_Main,
  NUM_ASH_SPRITES,
  NUM_FOG_DIAGONAL_SPRITES,
  NUM_FOG_HORIZONTAL_SPRITES,
  NUM_SANDSTORM_SPRITES,
  NUM_SWIRL_SANDSTORM_SPRITES,
  MAX_SPRITES,
  StartDroughtWeatherBlend,
  UpdateDroughtBlend,
  WEATHER_PAL_STATE_CHANGING_WEATHER,
  WEATHER_PAL_STATE_IDLE,
  WEATHER_FOG_HORIZONTAL,
  WEATHER_UNDERWATER,
  WIN_RANGE,
  TSTORM_STATE_CREATE_RAIN,
  TSTORM_STATE_END_THUNDER_LONG,
  TSTORM_STATE_FADE_THUNDER_LONG,
  TSTORM_STATE_INIT_RAIN,
  TSTORM_STATE_INIT_THUNDER_LONG,
  TSTORM_STATE_INIT_THUNDER_SHORT_1,
  TSTORM_STATE_INIT_THUNDER_SHORT_2,
  TSTORM_STATE_LOAD_RAIN,
  TSTORM_STATE_LOOP_START,
  TSTORM_STATE_LOOP_WAIT,
  TSTORM_STATE_TRY_NEW_THUNDER,
  TSTORM_STATE_WAIT_CHANGE,
  TSTORM_STATE_WAIT_THUNDER_LONG,
  createCloudSprites,
  createAshSprites,
  createFogDiagonalSprites,
  createFogHorizontalSprites,
  createSandstormSprites,
  createSwirlSandstormSprites,
  createBubbleSprite,
  createSnowflakeSprite,
  createWeatherEffectsRuntime,
  createWeatherSprite,
  destroyAshSprites,
  destroyCloudSprites,
  destroyFogDiagonalSprites,
  destroyFogHorizontalSprites,
  destroySandstormSprites,
  createRainSprite,
  destroyRainSprites,
  destroySnowflakeSprite,
  initRainSpriteMovement,
  initSnowflakeSpriteMovement,
  isoRandomize2,
  sCloudSpriteMapCoords,
  sRainSpriteCoords,
  sRainSpriteFallingDurations,
  sRainSpriteMovement,
  startRainSpriteFall,
  updateCloudSprite,
  updateAshSprite,
  fogHorizontalSpriteCallback,
  fogDiagonalSpriteCallback,
  updateSandstormMovement,
  updateSandstormSprite,
  updateSandstormSwirlSprite,
  updateSandstormWaveIndex,
  waitSandSwirlSpriteEntrance,
  sSwirlEntranceDelays,
  sBubbleStartDelays,
  sBubbleStartCoords,
  setThunderCounter,
  updateThunderSound,
  updateBubbleSprite,
  weatherEffectsSetBlendCoeffs,
  weatherEffectsSetTargetBlendCoeffs,
  weatherEffectsUpdateBlend,
  updateRainSprite,
  updateVisibleRainSprites,
  updateSnowflakeSprite,
  updateVisibleSnowflakeSprites,
  waitRainSprite,
  waitSnowflakeSprite,
  FIELD_WEATHER_EFFECTS_C_TRANSLATION_UNIT
} from '../src/game/decompFieldWeatherEffects';

describe('decomp field weather effects', () => {
  test('anchors the exact field_weather_effects.c translation unit', () => {
    expect(FIELD_WEATHER_EFFECTS_C_TRANSLATION_UNIT).toBe('src/field_weather_effects.c');
  });

  test('exports cloud and rain constants exactly from field_weather_effects.c', () => {
    expect(NUM_CLOUD_SPRITES).toBe(3);
    expect(MAX_RAIN_SPRITES).toBe(24);
    expect(DISPLAY_WIDTH).toBe(240);
    expect(DISPLAY_HEIGHT).toBe(160);
    expect(sCloudSpriteMapCoords).toEqual([
      { x: 0, y: 66 },
      { x: 5, y: 73 },
      { x: 10, y: 78 }
    ]);
    expect(sRainSpriteMovement).toEqual([
      [-0x68, 0x0d0],
      [-0x0a0, 0x140]
    ]);
    expect(sRainSpriteFallingDurations).toEqual([
      [18, 7],
      [12, 10]
    ]);
    expect(sRainSpriteCoords[0]).toEqual({ x: 0, y: 0 });
    expect(sRainSpriteCoords[23]).toEqual({ x: 48, y: 96 });
  });

  test('UpdateCloudSprite moves one pixel left every two callbacks', () => {
    const sprite = createWeatherSprite({ x: 10 });
    updateCloudSprite(sprite);
    expect(sprite.x).toBe(9);
    expect(sprite.data[0]).toBe(1);
    updateCloudSprite(sprite);
    expect(sprite.x).toBe(9);
    expect(sprite.data[0]).toBe(0);
    updateCloudSprite(sprite);
    expect(sprite.x).toBe(8);
  });

  test('Weather effect blend helpers alternate EVA and EVB exactly like Weather_UpdateBlend', () => {
    const runtime = createWeatherEffectsRuntime();
    weatherEffectsSetBlendCoeffs(runtime, 0, 16);
    expect(runtime.gpuRegs.get(REG_OFFSET_BLDALPHA)).toBe(BLDALPHA_BLEND(0, 16));

    weatherEffectsSetTargetBlendCoeffs(runtime, 2, 14, 0);
    expect(weatherEffectsUpdateBlend(runtime)).toBe(false);
    expect([runtime.currBlendEVA, runtime.currBlendEVB]).toEqual([1, 16]);
    expect(weatherEffectsUpdateBlend(runtime)).toBe(false);
    expect([runtime.currBlendEVA, runtime.currBlendEVB]).toEqual([1, 15]);
    expect(weatherEffectsUpdateBlend(runtime)).toBe(false);
    expect([runtime.currBlendEVA, runtime.currBlendEVB]).toEqual([2, 15]);
    expect(weatherEffectsUpdateBlend(runtime)).toBe(true);
    expect([runtime.currBlendEVA, runtime.currBlendEVB]).toEqual([2, 14]);
  });

  test('CreateCloudSprites follows the C cloud sprite loop and SetSpritePosToMapCoords formula', () => {
    const runtime = createWeatherEffectsRuntime({
      gSaveBlock1PosX: 2,
      gSaveBlock1PosY: 60,
      gFieldCameraX: 1,
      gFieldCameraY: -1,
      gTotalCameraPixelOffsetX: 3,
      gTotalCameraPixelOffsetY: 4
    });

    createCloudSprites(runtime);

    expect(runtime.cloudSpritesCreated).toBe(true);
    expect(runtime.cloudSprites).toHaveLength(NUM_CLOUD_SPRITES);
    expect(runtime.cloudSprites[0]).toMatchObject({
      x: ((0 + 7 - 2) << 4) + (-3 - 1 + 16),
      y: ((66 + 7 - 60) << 4) + (-4 - -1 - 16),
      coordOffsetEnabled: true,
      callback: 'UpdateCloudSprite'
    });
    expect(runtime.operations).toEqual([
      'LoadSpriteSheet(sCloudSpriteSheet)',
      'LoadCustomWeatherSpritePalette(gCloudsWeatherPalette)',
      'CreateSprite(sCloudSpriteTemplate):0',
      'CreateSprite(sCloudSpriteTemplate):1',
      'CreateSprite(sCloudSpriteTemplate):2'
    ]);

    createCloudSprites(runtime);
    expect(runtime.operations).toHaveLength(5);
  });

  test('Clouds init, main, init-all, finish, and destroy mirror WEATHER_SUNNY_CLOUDS state machine', () => {
    const runtime = createWeatherEffectsRuntime();

    Clouds_InitVars(runtime);
    expect(runtime.gammaTargetIndex).toBe(0);
    expect(runtime.gammaStepDelay).toBe(20);
    expect(runtime.initStep).toBe(0);
    expect(runtime.weatherGfxLoaded).toBe(false);
    expect(runtime.gpuRegs.get(REG_OFFSET_BLDALPHA)).toBe(BLDALPHA_BLEND(0, 16));

    Clouds_Main(runtime);
    expect(runtime.cloudSpritesCreated).toBe(true);
    expect(runtime.initStep).toBe(1);

    Clouds_Main(runtime);
    expect(runtime.initStep).toBe(2);
    expect([runtime.targetBlendEVA, runtime.targetBlendEVB, runtime.blendDelay]).toEqual([12, 8, 1]);

    while (!runtime.weatherGfxLoaded)
      Clouds_Main(runtime);
    expect(runtime.initStep).toBe(3);
    expect([runtime.currBlendEVA, runtime.currBlendEVB]).toEqual([12, 8]);

    expect(Clouds_Finish(runtime)).toBe(true);
    expect(runtime.finishStep).toBe(1);
    expect([runtime.targetBlendEVA, runtime.targetBlendEVB]).toEqual([0, 16]);

    while (runtime.finishStep === 1)
      expect(Clouds_Finish(runtime)).toBe(true);
    expect(runtime.finishStep).toBe(2);
    expect(runtime.cloudSpritesCreated).toBe(false);
    expect(runtime.cloudSprites.every((sprite) => sprite === null)).toBe(true);
    expect(runtime.operations).toContain('FreeSpriteTilesByTag(GFXTAG_CLOUD)');
    expect(Clouds_Finish(runtime)).toBe(false);

    const allRuntime = createWeatherEffectsRuntime();
    Clouds_InitAll(allRuntime);
    expect(allRuntime.weatherGfxLoaded).toBe(true);
    expect(allRuntime.initStep).toBe(3);
  });

  test('DestroyCloudSprites is a no-op until clouds exist, then frees all non-null sprites and tiles', () => {
    const runtime = createWeatherEffectsRuntime();
    destroyCloudSprites(runtime);
    expect(runtime.operations).toEqual([]);

    runtime.cloudSpritesCreated = true;
    runtime.cloudSprites[0] = createWeatherSprite();
    runtime.cloudSprites[1] = null;
    runtime.cloudSprites[2] = createWeatherSprite();

    destroyCloudSprites(runtime);
    expect(runtime.cloudSpritesCreated).toBe(false);
    expect(runtime.cloudSprites).toEqual([null, null, null]);
    expect(runtime.operations).toEqual([
      'DestroySprite(cloudSprites[0])',
      'DestroySprite(cloudSprites[2])',
      'FreeSpriteTilesByTag(GFXTAG_CLOUD)'
    ]);
  });

  test('Sunny functions only set gamma target/delay and never finish', () => {
    const runtime = createWeatherEffectsRuntime({ gammaTargetIndex: 9, gammaStepDelay: 9 });

    Sunny_InitVars(runtime);
    expect(runtime.gammaTargetIndex).toBe(0);
    expect(runtime.gammaStepDelay).toBe(20);

    runtime.gammaTargetIndex = 4;
    runtime.gammaStepDelay = 5;
    Sunny_InitAll(runtime);
    expect(runtime.gammaTargetIndex).toBe(0);
    expect(runtime.gammaStepDelay).toBe(20);
    Sunny_Main(runtime);
    expect(Sunny_Finish(runtime)).toBe(false);
  });

  test('Thunderstorm and Downpour init vars mirror rain setup and sound strength', () => {
    const thunder = createWeatherEffectsRuntime();
    Thunderstorm_InitVars(thunder);
    expect(thunder.initStep).toBe(TSTORM_STATE_LOAD_RAIN);
    expect(thunder.weatherGfxLoaded).toBe(false);
    expect(thunder.rainSpriteVisibleDelay).toBe(4);
    expect(thunder.isDownpour).toBe(false);
    expect(thunder.targetRainSpriteCount).toBe(16);
    expect(thunder.gammaTargetIndex).toBe(3);
    expect(thunder.gammaStepDelay).toBe(20);
    expect(thunder.thunderTriggered).toBe(false);
    expect(thunder.playedSoundEffects).toEqual([SE_THUNDERSTORM]);

    const downpour = createWeatherEffectsRuntime();
    Downpour_InitVars(downpour);
    expect(downpour.initStep).toBe(TSTORM_STATE_LOAD_RAIN);
    expect(downpour.weatherGfxLoaded).toBe(false);
    expect(downpour.rainSpriteVisibleDelay).toBe(4);
    expect(downpour.isDownpour).toBe(true);
    expect(downpour.targetRainSpriteCount).toBe(24);
    expect(downpour.gammaTargetIndex).toBe(3);
    expect(downpour.gammaStepDelay).toBe(20);
    expect(downpour.playedSoundEffects).toEqual([SE_DOWNPOUR]);
  });

  test('Thunderstorm_Main loads rain, waits for palette change, and runs short thunder branches with fallthroughs', () => {
    const runtime = createWeatherEffectsRuntime({
      rngValues: [1, 0, 5, 2, 7],
      palProcessingState: WEATHER_PAL_STATE_CHANGING_WEATHER
    });
    Thunderstorm_InitVars(runtime);

    Thunderstorm_Main(runtime);
    expect(runtime.initStep).toBe(TSTORM_STATE_CREATE_RAIN);
    expect(runtime.operations).toContain('LoadSpriteSheet(sRainSpriteSheet)');

    while (runtime.initStep === TSTORM_STATE_CREATE_RAIN)
      Thunderstorm_Main(runtime);
    expect(runtime.initStep).toBe(TSTORM_STATE_INIT_RAIN);

    while (runtime.initStep === TSTORM_STATE_INIT_RAIN)
      Thunderstorm_Main(runtime);
    expect(runtime.weatherGfxLoaded).toBe(true);
    expect(runtime.initStep).toBe(TSTORM_STATE_WAIT_CHANGE);

    Thunderstorm_Main(runtime);
    expect(runtime.initStep).toBe(TSTORM_STATE_WAIT_CHANGE);

    runtime.palProcessingState = WEATHER_PAL_STATE_IDLE;
    Thunderstorm_Main(runtime);
    expect(runtime.initStep).toBe(TSTORM_STATE_INIT_THUNDER_SHORT_1);

    Thunderstorm_Main(runtime);
    expect(runtime.thunderSkipShort).toBe(1);
    expect(runtime.initStep).toBe(TSTORM_STATE_INIT_THUNDER_SHORT_2);

    Thunderstorm_Main(runtime);
    expect(runtime.thunderShortRetries).toBe(1);
    expect(runtime.operations.at(-1)).toBe('WeatherShiftGammaIfPalStateIdle:19');
    expect(runtime.thunderTriggered).toBe(false);
    expect(runtime.thunderDelay).toBe((5 % 3) + 6);
    expect(runtime.initStep).toBe(TSTORM_STATE_TRY_NEW_THUNDER);

    runtime.thunderDelay = 1;
    Thunderstorm_Main(runtime);
    expect(runtime.operations.at(-1)).toBe('WeatherShiftGammaIfPalStateIdle:3');
    expect(runtime.initStep).toBe(TSTORM_STATE_INIT_THUNDER_LONG);

    Thunderstorm_Main(runtime);
    expect(runtime.thunderDelay).toBe((2 % 16) + 60);
    expect(runtime.initStep).toBe(TSTORM_STATE_WAIT_THUNDER_LONG);
  });

  test('Thunderstorm long thunder, loop wait, counter sound, and finish paths match C', () => {
    const runtime = createWeatherEffectsRuntime({ rngValues: [4, 1, 0, 0] });
    runtime.initStep = TSTORM_STATE_WAIT_THUNDER_LONG;
    runtime.thunderDelay = 1;

    Thunderstorm_Main(runtime);
    expect(runtime.thunderCounter).toBe(4 % 100);
    expect(runtime.thunderTriggered).toBe(true);
    expect(runtime.operations.at(-1)).toBe('WeatherShiftGammaIfPalStateIdle:19');
    expect(runtime.thunderDelay).toBe((1 & 0xf) + 30);
    expect(runtime.initStep).toBe(TSTORM_STATE_FADE_THUNDER_LONG);

    runtime.thunderDelay = 1;
    Thunderstorm_Main(runtime);
    expect(runtime.operations.at(-1)).toBe('WeatherBeginGammaFade:19:3:5');
    expect(runtime.initStep).toBe(TSTORM_STATE_END_THUNDER_LONG);

    runtime.palProcessingState = WEATHER_PAL_STATE_IDLE;
    Thunderstorm_Main(runtime);
    expect(runtime.thunderAllowEnd).toBe(true);
    expect(runtime.initStep).toBe(TSTORM_STATE_LOOP_START);

    Thunderstorm_Main(runtime);
    expect(runtime.thunderDelay).toBe((0 % 360) + 360 - 1);
    expect(runtime.initStep).toBe(TSTORM_STATE_LOOP_WAIT);

    runtime.thunderCounter = 1;
    runtime.thunderTriggered = true;
    updateThunderSound(runtime);
    expect(runtime.thunderCounter).toBe(0);
    expect(runtime.thunderTriggered).toBe(true);
    updateThunderSound(runtime);
    expect(runtime.playedSoundEffects.at(-1)).toBe(SE_THUNDER2);
    expect(runtime.thunderTriggered).toBe(false);

    runtime.thunderTriggered = false;
    runtime.rngValues = [7];
    setThunderCounter(runtime, 20);
    expect(runtime.thunderCounter).toBe(7);
    expect(runtime.thunderTriggered).toBe(true);

    const keepRain = createWeatherEffectsRuntime({
      finishStep: 0,
      initStep: TSTORM_STATE_LOOP_START,
      rngValues: [0],
      nextWeather: WEATHER_RAIN_THUNDERSTORM
    });
    expect(Thunderstorm_Finish(keepRain)).toBe(false);
    expect(keepRain.finishStep).toBe(1);

    const finish = createWeatherEffectsRuntime({
      finishStep: 2,
      rainSpriteCount: 1,
      curRainSpriteIndex: 0,
      targetRainSpriteCount: 0,
      rainSprites: [
        createWeatherSprite(),
        ...Array.from({ length: MAX_RAIN_SPRITES - 1 }, () => null)
      ],
      thunderTriggered: true
    });
    expect(Thunderstorm_Finish(finish)).toBe(false);
    expect(finish.thunderTriggered).toBe(false);
    expect(finish.finishStep).toBe(3);
    expect(finish.operations).toContain('DestroySprite(rainSprites[0])');
  });

  test('Thunderstorm_InitAll and Downpour_InitAll stop after initial rain graphics are loaded', () => {
    const thunder = createWeatherEffectsRuntime();
    Thunderstorm_InitAll(thunder);
    expect(thunder.weatherGfxLoaded).toBe(true);
    expect(thunder.initStep).toBe(TSTORM_STATE_WAIT_CHANGE);
    expect(thunder.curRainSpriteIndex).toBe(16);

    const downpour = createWeatherEffectsRuntime();
    Downpour_InitAll(downpour);
    expect(downpour.weatherGfxLoaded).toBe(true);
    expect(downpour.initStep).toBe(TSTORM_STATE_WAIT_CHANGE);
    expect(downpour.curRainSpriteIndex).toBe(24);
    expect(downpour.isDownpour).toBe(true);
  });

  test('Drought init waits for palette processing, loads palettes, ramps to stage 6, and never finishes', () => {
    const runtime = createWeatherEffectsRuntime({ palProcessingState: WEATHER_PAL_STATE_CHANGING_WEATHER });

    Drought_InitVars(runtime);
    expect(runtime.initStep).toBe(0);
    expect(runtime.weatherGfxLoaded).toBe(false);
    expect(runtime.gammaTargetIndex).toBe(0);
    expect(runtime.gammaStepDelay).toBe(0);

    Drought_Main(runtime);
    expect(runtime.initStep).toBe(0);

    runtime.palProcessingState = WEATHER_PAL_STATE_IDLE;
    Drought_Main(runtime);
    expect(runtime.initStep).toBe(1);

    Drought_Main(runtime);
    expect(runtime.initStep).toBe(2);
    expect([runtime.loadDroughtPalsIndex, runtime.loadDroughtPalsOffset]).toEqual([1, 1]);
    expect(runtime.operations).toContain('ResetDroughtWeatherPaletteLoading');

    while (runtime.initStep === 2)
      Drought_Main(runtime);
    expect(runtime.initStep).toBe(3);
    expect(runtime.loadDroughtPalsIndex).toBe(32);

    Drought_Main(runtime);
    expect(runtime.initStep).toBe(4);
    expect(runtime.droughtFrameDelay).toBe(5);
    expect(runtime.operations).toContain('DroughtStateInit');

    while (!runtime.weatherGfxLoaded)
      Drought_Main(runtime);
    expect(runtime.initStep).toBe(5);
    expect(runtime.droughtBrightnessStage).toBe(6);
    expect(runtime.droughtState).toBe(1);
    expect(runtime.operations).toContain('WeatherShiftGammaIfPalStateIdle:-1');
    expect(runtime.operations).toContain('WeatherShiftGammaIfPalStateIdle:-6');
    expect(Drought_Finish(runtime)).toBe(false);

    const allRuntime = createWeatherEffectsRuntime();
    Drought_InitAll(allRuntime);
    expect(allRuntime.weatherGfxLoaded).toBe(true);
    expect(allRuntime.initStep).toBe(5);
  });

  test('StartDroughtWeatherBlend and UpdateDroughtBlend follow the C task register sequence', () => {
    const runtime = createWeatherEffectsRuntime();
    runtime.gpuRegs.set(REG_OFFSET_WININ, 0x1234);

    const task = StartDroughtWeatherBlend(runtime);
    expect(task.func).toBe('UpdateDroughtBlend');
    expect(runtime.operations).toEqual(['CreateTask:UpdateDroughtBlend:80']);

    UpdateDroughtBlend(runtime, task);
    expect(task.data.slice(0, 4)).toEqual([1, 3, 0, 0x1234]);
    expect(runtime.gpuRegs.get(REG_OFFSET_WININ)).toBe(WIN_RANGE(63, 63));
    expect(runtime.gpuRegs.get(REG_OFFSET_BLDCNT)).toBe(
      BLDCNT_TGT1_BG1 | BLDCNT_TGT1_BG2 | BLDCNT_TGT1_BG3 | BLDCNT_TGT1_OBJ | BLDCNT_EFFECT_LIGHTEN
    );
    expect(runtime.gpuRegs.get(REG_OFFSET_BLDY)).toBe(3);

    for (let i = 0; i < 5; i += 1)
      UpdateDroughtBlend(runtime, task);
    expect(task.data[0]).toBe(2);
    expect(task.data[1]).toBe(16);
    expect(runtime.gpuRegs.get(REG_OFFSET_BLDY)).toBe(16);

    for (let i = 0; i < 9; i += 1)
      UpdateDroughtBlend(runtime, task);
    expect(task.data[2]).toBe(9);
    expect(task.data[1]).toBe(16);

    UpdateDroughtBlend(runtime, task);
    expect(task.data[2]).toBe(0);
    expect(task.data[1]).toBe(15);
    expect(runtime.gpuRegs.get(REG_OFFSET_BLDY)).toBe(15);

    while (task.data[0] === 2)
      UpdateDroughtBlend(runtime, task);
    expect(task.data[0]).toBe(3);
    expect(task.data[1]).toBe(0);

    UpdateDroughtBlend(runtime, task);
    expect(task.data[0]).toBe(4);
    expect(runtime.gpuRegs.get(REG_OFFSET_BLDCNT)).toBe(0);
    expect(runtime.gpuRegs.get(REG_OFFSET_BLDY)).toBe(0);
    expect(runtime.gpuRegs.get(REG_OFFSET_WININ)).toBe(0x1234);

    UpdateDroughtBlend(runtime, task);
    expect(task.destroyed).toBe(true);
    expect(runtime.operations.slice(-2)).toEqual(['ScriptContext_Enable', `DestroyTask:${task.id}`]);
  });

  test('CreateFogHorizontalSprites builds the exact 20-sprite 5-column fog grid', () => {
    const runtime = createWeatherEffectsRuntime();

    createFogHorizontalSprites(runtime);

    expect(runtime.fogHSpritesCreated).toBe(true);
    expect(runtime.fogHSprites).toHaveLength(NUM_FOG_HORIZONTAL_SPRITES);
    expect(runtime.fogHSprites[0]).toMatchObject({ x: 32, y: 32, callback: 'FogHorizontalSpriteCallback' });
    expect(runtime.fogHSprites[0]?.data[0]).toBe(0);
    expect(runtime.fogHSprites[4]).toMatchObject({ x: 288, y: 32 });
    expect(runtime.fogHSprites[4]?.data[0]).toBe(4);
    expect(runtime.fogHSprites[5]).toMatchObject({ x: 32, y: 96 });
    expect(runtime.fogHSprites[19]).toMatchObject({ x: 288, y: 224 });
    expect(runtime.operations[0]).toBe('LoadSpriteSheet(sFogHorizontalSpriteSheet)');
    expect(runtime.operations.at(-1)).toBe('CreateSpriteAtEnd(sFogHorizontalSpriteTemplate):19:255');

    createFogHorizontalSprites(runtime);
    expect(runtime.operations).toHaveLength(NUM_FOG_HORIZONTAL_SPRITES + 1);
  });

  test('FogHorizontalSpriteCallback mirrors y2 cast and horizontal wrap math', () => {
    const runtime = createWeatherEffectsRuntime({ gSpriteCoordOffsetY: -1, fogHScrollPosX: 220 });
    const sprite = createWeatherSprite({ data: [1, 0, 0, 0, 0, 0, 0, 0] });

    fogHorizontalSpriteCallback(runtime, sprite);

    expect(sprite.y2).toBe(255);
    expect(sprite.x).toBe((DISPLAY_WIDTH * 2 + 220 - (4 - 1) * 64) & 0x1ff);

    runtime.fogHScrollPosX = 10;
    sprite.data[0] = 2;
    fogHorizontalSpriteCallback(runtime, sprite);
    expect(sprite.x).toBe(10 + 32 + 2 * 64);
  });

  test('FogHorizontal init/main use different blend targets for fog and underwater and update scroll before switch', () => {
    const runtime = createWeatherEffectsRuntime({ currWeather: WEATHER_FOG_HORIZONTAL, gSpriteCoordOffsetX: 260 });

    FogHorizontal_InitVars(runtime);
    expect(runtime.initStep).toBe(0);
    expect(runtime.weatherGfxLoaded).toBe(false);
    expect(runtime.gammaTargetIndex).toBe(0);
    expect(runtime.gammaStepDelay).toBe(20);
    expect(runtime.fogHScrollCounter).toBe(0);
    expect(runtime.fogHScrollOffset).toBe(0);
    expect(runtime.gpuRegs.get(REG_OFFSET_BLDALPHA)).toBe(BLDALPHA_BLEND(0, 16));

    FogHorizontal_Main(runtime);
    expect(runtime.fogHScrollPosX).toBe(260 & 0xff);
    expect(runtime.fogHScrollCounter).toBe(1);
    expect(runtime.initStep).toBe(1);
    expect(runtime.fogHSpritesCreated).toBe(true);
    expect([runtime.targetBlendEVA, runtime.targetBlendEVB, runtime.blendDelay]).toEqual([12, 8, 3]);

    while (!runtime.weatherGfxLoaded)
      FogHorizontal_Main(runtime);
    expect(runtime.initStep).toBe(2);
    expect([runtime.currBlendEVA, runtime.currBlendEVB]).toEqual([12, 8]);

    const underwater = createWeatherEffectsRuntime({ currWeather: WEATHER_UNDERWATER });
    FogHorizontal_InitVars(underwater);
    FogHorizontal_Main(underwater);
    expect([underwater.targetBlendEVA, underwater.targetBlendEVB, underwater.blendDelay]).toEqual([4, 16, 0]);

    const allRuntime = createWeatherEffectsRuntime({ currWeather: WEATHER_UNDERWATER });
    FogHorizontal_InitAll(allRuntime);
    expect(allRuntime.weatherGfxLoaded).toBe(true);
    expect(allRuntime.initStep).toBe(2);
  });

  test('FogHorizontal_Finish scrolls while fading, destroys sprites on step 2, then returns false', () => {
    const runtime = createWeatherEffectsRuntime({
      currBlendEVA: 12,
      currBlendEVB: 8,
      targetBlendEVA: 12,
      targetBlendEVB: 8,
      fogHSpritesCreated: true,
      fogHSprites: [
        createWeatherSprite(),
        null,
        createWeatherSprite(),
        ...Array.from({ length: NUM_FOG_HORIZONTAL_SPRITES - 3 }, () => null)
      ]
    });

    expect(FogHorizontal_Finish(runtime)).toBe(true);
    expect(runtime.finishStep).toBe(1);
    expect(runtime.fogHScrollCounter).toBe(1);
    expect([runtime.targetBlendEVA, runtime.targetBlendEVB, runtime.blendDelay]).toEqual([0, 16, 3]);

    while (runtime.finishStep === 1)
      expect(FogHorizontal_Finish(runtime)).toBe(true);
    expect(runtime.finishStep).toBe(2);

    expect(FogHorizontal_Finish(runtime)).toBe(true);
    expect(runtime.finishStep).toBe(3);
    expect(runtime.fogHSpritesCreated).toBe(false);
    expect(runtime.fogHSprites.every((sprite) => sprite === null)).toBe(true);
    expect(runtime.operations).toContain('DestroySprite(fogHSprites[0])');
    expect(runtime.operations).toContain('DestroySprite(fogHSprites[2])');
    expect(runtime.operations).toContain('FreeSpriteTilesByTag(GFXTAG_FOG_H)');

    expect(FogHorizontal_Finish(runtime)).toBe(false);
  });

  test('DestroyFogHorizontalSprites is a no-op until fog exists, then frees only non-null slots and tiles', () => {
    const runtime = createWeatherEffectsRuntime();
    destroyFogHorizontalSprites(runtime);
    expect(runtime.operations).toEqual([]);

    runtime.fogHSpritesCreated = true;
    runtime.fogHSprites[0] = createWeatherSprite();
    runtime.fogHSprites[1] = null;
    runtime.fogHSprites[2] = createWeatherSprite();

    destroyFogHorizontalSprites(runtime);
    expect(runtime.fogHSpritesCreated).toBe(false);
    expect(runtime.fogHSprites.every((sprite) => sprite === null)).toBe(true);
    expect(runtime.operations).toEqual([
      'DestroySprite(fogHSprites[0])',
      'DestroySprite(fogHSprites[2])',
      'FreeSpriteTilesByTag(GFXTAG_FOG_H)'
    ]);
  });

  test('CreateFogDiagonalSprites builds the exact 20-sprite diagonal fog grid', () => {
    const runtime = createWeatherEffectsRuntime();

    createFogDiagonalSprites(runtime);

    expect(runtime.fogDSpritesCreated).toBe(true);
    expect(runtime.fogDSprites).toHaveLength(NUM_FOG_DIAGONAL_SPRITES);
    expect(runtime.fogDSprites[0]).toMatchObject({ x: 0, y: 0, callback: 'UpdateFogDiagonalSprite' });
    expect(runtime.fogDSprites[0]?.data.slice(0, 2)).toEqual([0, 0]);
    expect(runtime.fogDSprites[4]).toMatchObject({ x: 0, y: 0 });
    expect(runtime.fogDSprites[4]?.data.slice(0, 2)).toEqual([4, 0]);
    expect(runtime.fogDSprites[5]).toMatchObject({ x: 0, y: 64 });
    expect(runtime.fogDSprites[5]?.data.slice(0, 2)).toEqual([0, 1]);
    expect(runtime.fogDSprites[19]).toMatchObject({ x: 0, y: 192 });
    expect(runtime.fogDSprites[19]?.data.slice(0, 2)).toEqual([4, 3]);
    expect(runtime.operations[0]).toBe('LoadSpriteSheet(gFogDiagonalSpriteSheet)');
    expect(runtime.operations.at(-1)).toBe('CreateSpriteAtEnd(sFogDiagonalSpriteTemplate):19:255');

    createFogDiagonalSprites(runtime);
    expect(runtime.operations).toHaveLength(NUM_FOG_DIAGONAL_SPRITES + 1);
  });

  test('FogDiagonalSpriteCallback mirrors y2 and horizontal wrap math', () => {
    const runtime = createWeatherEffectsRuntime({ fogDPosY: -3, fogDBaseSpritesX: 220 });
    const sprite = createWeatherSprite({ data: [1, 0, 0, 0, 0, 0, 0, 0] });

    fogDiagonalSpriteCallback(runtime, sprite);
    expect(sprite.y2).toBe(-3);
    expect(sprite.x).toBe((220 + (DISPLAY_WIDTH * 2) - (4 - 1) * 64) & 0x1ff);

    runtime.fogDBaseSpritesX = 10;
    sprite.data[0] = 2;
    fogDiagonalSpriteCallback(runtime, sprite);
    expect(sprite.x).toBe(10 + 32 + 2 * 64);
  });

  test('FogDiagonal init/main advances X every 3 frames, Y every 5, and fades with delay 8', () => {
    const runtime = createWeatherEffectsRuntime({ gSpriteCoordOffsetX: 260, gSpriteCoordOffsetY: 5 });

    FogDiagonal_InitVars(runtime);
    expect(runtime.initStep).toBe(0);
    expect(runtime.weatherGfxLoaded).toBe(false);
    expect(runtime.gammaTargetIndex).toBe(0);
    expect(runtime.gammaStepDelay).toBe(20);
    expect(runtime.fogHScrollCounter).toBe(0);
    expect(runtime.fogHScrollOffset).toBe(1);
    expect(runtime.fogDScrollXCounter).toBe(0);
    expect(runtime.fogDScrollYCounter).toBe(0);
    expect(runtime.gpuRegs.get(REG_OFFSET_BLDALPHA)).toBe(BLDALPHA_BLEND(0, 16));

    FogDiagonal_Main(runtime);
    expect(runtime.fogDBaseSpritesX).toBe(260 & 0xff);
    expect(runtime.fogDPosY).toBe(5);
    expect(runtime.fogDScrollXCounter).toBe(1);
    expect(runtime.fogDScrollYCounter).toBe(1);
    expect(runtime.initStep).toBe(1);
    expect(runtime.fogDSpritesCreated).toBe(true);

    FogDiagonal_Main(runtime);
    expect(runtime.initStep).toBe(2);
    expect([runtime.targetBlendEVA, runtime.targetBlendEVB, runtime.blendDelay]).toEqual([12, 8, 8]);

    FogDiagonal_Main(runtime);
    expect(runtime.fogDScrollXCounter).toBe(0);
    expect(runtime.fogDXOffset).toBe(1);
    expect(runtime.fogDScrollYCounter).toBe(3);

    while (!runtime.weatherGfxLoaded)
      FogDiagonal_Main(runtime);
    expect(runtime.initStep).toBe(3);
    expect([runtime.currBlendEVA, runtime.currBlendEVB]).toEqual([12, 8]);

    const allRuntime = createWeatherEffectsRuntime();
    FogDiagonal_InitAll(allRuntime);
    expect(allRuntime.weatherGfxLoaded).toBe(true);
    expect(allRuntime.initStep).toBe(3);
  });

  test('FogDiagonal_Finish scrolls while fading, destroys sprites on step 2, then returns false', () => {
    const runtime = createWeatherEffectsRuntime({
      currBlendEVA: 12,
      currBlendEVB: 8,
      targetBlendEVA: 12,
      targetBlendEVB: 8,
      fogDSpritesCreated: true,
      fogDSprites: [
        createWeatherSprite(),
        null,
        createWeatherSprite(),
        ...Array.from({ length: NUM_FOG_DIAGONAL_SPRITES - 3 }, () => null)
      ]
    });

    expect(FogDiagonal_Finish(runtime)).toBe(true);
    expect(runtime.finishStep).toBe(1);
    expect(runtime.fogDScrollXCounter).toBe(1);
    expect(runtime.fogDScrollYCounter).toBe(1);
    expect([runtime.targetBlendEVA, runtime.targetBlendEVB, runtime.blendDelay]).toEqual([0, 16, 1]);

    while (runtime.finishStep === 1)
      expect(FogDiagonal_Finish(runtime)).toBe(true);
    expect(runtime.finishStep).toBe(2);

    expect(FogDiagonal_Finish(runtime)).toBe(true);
    expect(runtime.finishStep).toBe(3);
    expect(runtime.fogDSpritesCreated).toBe(false);
    expect(runtime.fogDSprites.every((sprite) => sprite === null)).toBe(true);
    expect(runtime.operations).toContain('DestroySprite(fogDSprites[0])');
    expect(runtime.operations).toContain('DestroySprite(fogDSprites[2])');
    expect(runtime.operations).toContain('FreeSpriteTilesByTag(GFXTAG_FOG_D)');

    expect(FogDiagonal_Finish(runtime)).toBe(false);
  });

  test('DestroyFogDiagonalSprites is a no-op until diagonal fog exists, then frees only non-null slots and tiles', () => {
    const runtime = createWeatherEffectsRuntime();
    destroyFogDiagonalSprites(runtime);
    expect(runtime.operations).toEqual([]);

    runtime.fogDSpritesCreated = true;
    runtime.fogDSprites[0] = createWeatherSprite();
    runtime.fogDSprites[1] = null;
    runtime.fogDSprites[2] = createWeatherSprite();

    destroyFogDiagonalSprites(runtime);
    expect(runtime.fogDSpritesCreated).toBe(false);
    expect(runtime.fogDSprites.every((sprite) => sprite === null)).toBe(true);
    expect(runtime.operations).toEqual([
      'DestroySprite(fogDSprites[0])',
      'DestroySprite(fogDSprites[2])',
      'FreeSpriteTilesByTag(GFXTAG_FOG_D)'
    ]);
  });

  test('CreateSandstormSprites builds the exact 20-sprite regular sandstorm grid', () => {
    const runtime = createWeatherEffectsRuntime();

    createSandstormSprites(runtime);

    expect(runtime.sandstormSpritesCreated).toBe(true);
    expect(runtime.sandstormSprites1).toHaveLength(NUM_SANDSTORM_SPRITES);
    expect(runtime.sandstormSprites1[0]).toMatchObject({ x: 0, y: 0, callback: 'UpdateSandstormSprite' });
    expect(runtime.sandstormSprites1[0]?.data.slice(0, 2)).toEqual([0, 0]);
    expect(runtime.sandstormSprites1[4]?.data.slice(0, 2)).toEqual([4, 0]);
    expect(runtime.sandstormSprites1[5]).toMatchObject({ x: 0, y: 64 });
    expect(runtime.sandstormSprites1[19]?.data.slice(0, 2)).toEqual([4, 3]);
    expect(runtime.operations.slice(0, 3)).toEqual([
      'LoadSpriteSheet(sSandstormSpriteSheet)',
      'LoadCustomWeatherSpritePalette(gSandstormWeatherPalette)',
      'CreateSpriteAtEnd(sSandstormSpriteTemplate):0:1'
    ]);
    expect(runtime.operations.at(-1)).toBe('CreateSpriteAtEnd(sSandstormSpriteTemplate):19:1');

    createSandstormSprites(runtime);
    expect(runtime.operations).toHaveLength(NUM_SANDSTORM_SPRITES + 2);
  });

  test('CreateSwirlSandstormSprites uses entrance delay table and shared data slots exactly', () => {
    const runtime = createWeatherEffectsRuntime();

    createSwirlSandstormSprites(runtime);

    expect(runtime.sandstormSwirlSpritesCreated).toBe(true);
    expect(sSwirlEntranceDelays).toEqual([0, 120, 80, 160, 40, 0]);
    expect(runtime.sandstormSprites2).toHaveLength(NUM_SWIRL_SANDSTORM_SPRITES);
    expect(runtime.sandstormSprites2[0]).toMatchObject({
      x: 24,
      y: 208,
      animNum: 1,
      callback: 'WaitSandSwirlSpriteEntrance',
      oamSize: 2,
      centerToCornerVecX: 16,
      centerToCornerVecY: 16
    });
    expect(runtime.sandstormSprites2[0]?.data.slice(0, 5)).toEqual([8, 0, 0, 0, 0x6730]);
    expect(runtime.sandstormSprites2[3]?.data.slice(0, 5)).toEqual([8, 153, 0, 160, 0x6730]);
    expect(runtime.operations).toContain('StartSpriteAnim(sandstormSprites2[4]):1');
    expect(runtime.operations).toContain('CalcCenterToCornerVec(sandstormSprites2[4]):32x32');

    createSwirlSandstormSprites(runtime);
    expect(runtime.operations).toHaveLength(NUM_SWIRL_SANDSTORM_SPRITES * 3);
  });

  test('Sandstorm movement, wave index, regular sprite callback, and swirl callbacks match C', () => {
    const runtime = createWeatherEffectsRuntime({
      gSpriteCoordOffsetX: 5,
      gSpriteCoordOffsetY: 7,
      sandstormWaveIndex: 8,
      sandstormWaveCounter: 5
    });

    updateSandstormMovement(runtime);
    expect(runtime.sandstormBaseSpritesX).toBe((5 + (runtime.sandstormXOffset >> 8)) & 0xff);
    expect(runtime.sandstormPosY).toBe(7 + (runtime.sandstormYOffset >> 8));

    updateSandstormWaveIndex(runtime);
    expect(runtime.sandstormWaveIndex).toBe(9);
    expect(runtime.sandstormWaveCounter).toBe(0);

    runtime.sandstormBaseSpritesX = 220;
    runtime.sandstormPosY = -4;
    const regular = createWeatherSprite({ data: [1, 0, 0, 0, 0, 0, 0, 0] });
    updateSandstormSprite(runtime, regular);
    expect(regular.y2).toBe(-4);
    expect(regular.x).toBe((220 + (DISPLAY_WIDTH * 2) - (4 - 1) * 64) & 0x1ff);

    const waiting = createWeatherSprite({ data: [0, 0, 0, 0, 0, 0, 0, 0], callback: 'WaitSandSwirlSpriteEntrance' });
    waitSandSwirlSpriteEntrance(runtime, waiting);
    expect(waiting.data[3]).toBe(-1);
    expect(waiting.callback).toBe('UpdateSandstormSwirlSprite');

    const swirl = createWeatherSprite({ y: -48, data: [4, 0, 8, 0, 0, 0, 0, 0] });
    updateSandstormSwirlSprite(runtime, swirl);
    expect(swirl.y).toBe(DISPLAY_HEIGHT + 48);
    expect(swirl.x2).toBe(0);
    expect(swirl.y2).toBe(4);
    expect(swirl.data[1]).toBe(10);
    expect(swirl.data[2]).toBe(0);
    expect(swirl.data[0]).toBe(5);

    updateSandstormSwirlSprite(runtime, swirl);
    expect(swirl.y).toBe(DISPLAY_HEIGHT + 47);
    expect(swirl.data[0]).toBe(5);
    expect(swirl.data[2]).toBe(1);
  });

  test('Sandstorm init/main/init-all/finish preserve blend and teardown state machine', () => {
    const runtime = createWeatherEffectsRuntime({ gSpriteCoordOffsetX: 3, gSpriteCoordOffsetY: 4 });

    Sandstorm_InitVars(runtime);
    expect(runtime.initStep).toBe(0);
    expect(runtime.weatherGfxLoaded).toBe(false);
    expect(runtime.gammaTargetIndex).toBe(0);
    expect(runtime.gammaStepDelay).toBe(20);
    expect(runtime.sandstormWaveIndex).toBe(8);
    expect(runtime.sandstormWaveCounter).toBe(0);
    expect(runtime.gpuRegs.get(REG_OFFSET_BLDALPHA)).toBe(BLDALPHA_BLEND(0, 16));

    Sandstorm_Main(runtime);
    expect(runtime.initStep).toBe(1);
    expect(runtime.sandstormSpritesCreated).toBe(true);
    expect(runtime.sandstormSwirlSpritesCreated).toBe(true);

    Sandstorm_Main(runtime);
    expect(runtime.initStep).toBe(2);
    expect([runtime.targetBlendEVA, runtime.targetBlendEVB, runtime.blendDelay]).toEqual([16, 0, 0]);

    while (!runtime.weatherGfxLoaded)
      Sandstorm_Main(runtime);
    expect(runtime.initStep).toBe(3);
    expect([runtime.currBlendEVA, runtime.currBlendEVB]).toEqual([16, 0]);

    expect(Sandstorm_Finish(runtime)).toBe(true);
    expect(runtime.finishStep).toBe(1);
    expect([runtime.targetBlendEVA, runtime.targetBlendEVB, runtime.blendDelay]).toEqual([0, 16, 0]);

    while (runtime.finishStep === 1)
      expect(Sandstorm_Finish(runtime)).toBe(true);
    expect(runtime.finishStep).toBe(2);

    expect(Sandstorm_Finish(runtime)).toBe(true);
    expect(runtime.finishStep).toBe(3);
    expect(runtime.sandstormSpritesCreated).toBe(false);
    expect(runtime.sandstormSwirlSpritesCreated).toBe(false);
    expect(runtime.operations).toContain('FreeSpriteTilesByTag(GFXTAG_SANDSTORM)');
    expect(Sandstorm_Finish(runtime)).toBe(false);

    const allRuntime = createWeatherEffectsRuntime();
    Sandstorm_InitAll(allRuntime);
    expect(allRuntime.weatherGfxLoaded).toBe(true);
    expect(allRuntime.initStep).toBe(3);
  });

  test('DestroySandstormSprites frees regular tiles before swirl sprites and is safe when absent', () => {
    const runtime = createWeatherEffectsRuntime();
    destroySandstormSprites(runtime);
    expect(runtime.operations).toEqual([]);

    runtime.sandstormSpritesCreated = true;
    runtime.sandstormSwirlSpritesCreated = true;
    runtime.sandstormSprites1[0] = createWeatherSprite();
    runtime.sandstormSprites1[1] = null;
    runtime.sandstormSprites2[0] = createWeatherSprite();
    runtime.sandstormSprites2[1] = null;

    destroySandstormSprites(runtime);
    expect(runtime.sandstormSpritesCreated).toBe(false);
    expect(runtime.sandstormSwirlSpritesCreated).toBe(false);
    expect(runtime.sandstormSprites1.every((sprite) => sprite === null)).toBe(true);
    expect(runtime.sandstormSprites2.every((sprite) => sprite === null)).toBe(true);
    expect(runtime.operations).toEqual([
      'DestroySprite(sandstormSprites1[0])',
      'FreeSpriteTilesByTag(GFXTAG_SANDSTORM)',
      'DestroySprite(sandstormSprites2[0])'
    ]);
  });

  test('Shade functions only set gamma target/delay and never finish', () => {
    const runtime = createWeatherEffectsRuntime({ initStep: 7, gammaTargetIndex: 0, gammaStepDelay: 0 });

    Shade_InitVars(runtime);
    expect(runtime.initStep).toBe(0);
    expect(runtime.gammaTargetIndex).toBe(3);
    expect(runtime.gammaStepDelay).toBe(20);

    runtime.initStep = 9;
    Shade_InitAll(runtime);
    expect(runtime.initStep).toBe(0);
    expect(runtime.gammaTargetIndex).toBe(3);
    expect(runtime.gammaStepDelay).toBe(20);
    Shade_Main(runtime);
    expect(Shade_Finish(runtime)).toBe(false);
  });

  test('Bubbles_InitVars piggybacks FogHorizontal init and resets bubble counters without setting created flag', () => {
    const runtime = createWeatherEffectsRuntime({ gSpriteCoordOffsetX: 3 });

    Bubbles_InitVars(runtime);

    expect(runtime.initStep).toBe(0);
    expect(runtime.weatherGfxLoaded).toBe(false);
    expect(runtime.fogHScrollCounter).toBe(0);
    expect(runtime.fogHScrollOffset).toBe(0);
    expect(runtime.bubblesDelayIndex).toBe(0);
    expect(runtime.bubblesDelayCounter).toBe(sBubbleStartDelays[0]);
    expect(runtime.bubblesCoordsIndex).toBe(0);
    expect(runtime.bubblesSpriteCount).toBe(0);
    expect(runtime.bubblesSpritesCreated).toBe(false);
    expect(runtime.operations).toEqual(['LoadSpriteSheet(sWeatherBubbleSpriteSheet)']);

    runtime.bubblesSpritesCreated = true;
    runtime.operations = [];
    runtime.bubblesDelayCounter = 99;
    Bubbles_InitVars(runtime);
    expect(runtime.bubblesDelayCounter).toBe(99);
    expect(runtime.operations).toEqual([]);
  });

  test('CreateBubbleSprite uses start coords, coord offset, first free slot, and increments count', () => {
    const runtime = createWeatherEffectsRuntime({ gSpriteCoordOffsetY: 5 });
    runtime.bubbleSprites[0] = createWeatherSprite();

    const sprite = createBubbleSprite(runtime, 2);

    expect(sprite).not.toBeNull();
    expect(runtime.bubbleSprites[1]).toBe(sprite);
    expect(sprite).toMatchObject({
      x: sBubbleStartCoords[2][0],
      y: sBubbleStartCoords[2][1] - 5,
      priority: 1,
      coordOffsetEnabled: true,
      callback: 'UpdateBubbleSprite',
      template: 'sBubbleSpriteTemplate'
    });
    expect(sprite?.data.slice(0, 3)).toEqual([0, 0, 0]);
    expect(runtime.bubblesSpriteCount).toBe(1);
    expect(runtime.operations).toEqual(['CreateSpriteAtEnd(sBubbleSpriteTemplate):2:1:0']);

    runtime.bubbleSprites = Array.from({ length: MAX_SPRITES }, () => createWeatherSprite());
    expect(createBubbleSprite(runtime, 0)).toBeNull();
  });

  test('UpdateBubbleSprite double-increments scroll counter, oscillates x2, rises, and destroys at 120 frames', () => {
    const runtime = createWeatherEffectsRuntime();
    const sprite = createBubbleSprite(runtime, 0)!;

    for (let i = 0; i < 4; i += 1)
      updateBubbleSprite(runtime, sprite);
    expect(sprite.data[0]).toBe(8);
    expect(sprite.x2).toBe(0);
    expect(sprite.y).toBe(160 - 12);

    updateBubbleSprite(runtime, sprite);
    expect(sprite.data[0]).toBe(0);
    expect(sprite.x2).toBe(1);
    expect(sprite.data[1]).toBe(0);

    sprite.x2 = 4;
    sprite.data[0] = 8;
    updateBubbleSprite(runtime, sprite);
    expect(sprite.x2).toBe(5);
    expect(sprite.data[1]).toBe(1);

    sprite.data[0] = 8;
    updateBubbleSprite(runtime, sprite);
    expect(sprite.x2).toBe(4);
    expect(sprite.data[1]).toBe(1);

    sprite.data[2] = 119;
    updateBubbleSprite(runtime, sprite);
    expect(runtime.bubbleSprites.includes(sprite)).toBe(false);
    expect(runtime.operations.at(-1)).toBe('DestroySprite(bubble)');
  });

  test('Bubbles_Main runs FogHorizontal_Main and spawns bubbles on the C delay/index cadence', () => {
    const runtime = createWeatherEffectsRuntime();
    Bubbles_InitVars(runtime);

    Bubbles_Main(runtime);
    expect(runtime.initStep).toBe(1);
    expect(runtime.fogHSpritesCreated).toBe(true);
    expect(runtime.bubblesDelayCounter).toBe(0);
    expect(runtime.bubblesDelayIndex).toBe(1);
    expect(runtime.bubblesCoordsIndex).toBe(1);
    expect(runtime.bubblesSpriteCount).toBe(1);
    expect(runtime.bubbleSprites[0]?.x).toBe(sBubbleStartCoords[0][0]);

    runtime.bubblesDelayCounter = sBubbleStartDelays[1];
    Bubbles_Main(runtime);
    expect(runtime.bubblesDelayIndex).toBe(2);
    expect(runtime.bubblesCoordsIndex).toBe(2);
    expect(runtime.bubblesSpriteCount).toBe(2);

    runtime.bubblesDelayIndex = sBubbleStartDelays.length - 1;
    runtime.bubblesDelayCounter = sBubbleStartDelays.at(-1)!;
    runtime.bubblesCoordsIndex = sBubbleStartCoords.length - 1;
    Bubbles_Main(runtime);
    expect(runtime.bubblesDelayIndex).toBe(0);
    expect(runtime.bubblesCoordsIndex).toBe(0);
  });

  test('Bubbles_InitAll and Bubbles_Finish delegate to horizontal fog then destroy bubble sprites', () => {
    const initRuntime = createWeatherEffectsRuntime();
    Bubbles_InitAll(initRuntime);
    expect(initRuntime.weatherGfxLoaded).toBe(true);
    expect(initRuntime.initStep).toBe(2);
    expect(initRuntime.bubblesSpriteCount).toBeGreaterThan(0);

    const runtime = createWeatherEffectsRuntime({
      finishStep: 3
    });
    createBubbleSprite(runtime, 0);

    expect(Bubbles_Finish(runtime)).toBe(false);
    expect(runtime.bubbleSprites.every((sprite) => sprite === null)).toBe(true);
    expect(runtime.operations).toContain('FreeSpriteTilesByTag(GFXTAG_BUBBLE)');

    const activeRuntime = createWeatherEffectsRuntime({
      finishStep: 0,
      currBlendEVA: 4,
      currBlendEVB: 16,
      targetBlendEVA: 4,
      targetBlendEVB: 16
    });
    expect(Bubbles_Finish(activeRuntime)).toBe(true);
  });

  test('CreateAshSprites builds the exact 20-sprite 5-column ash grid', () => {
    const runtime = createWeatherEffectsRuntime();

    createAshSprites(runtime);

    expect(runtime.ashSpritesCreated).toBe(true);
    expect(runtime.ashSprites).toHaveLength(NUM_ASH_SPRITES);
    expect(runtime.ashSprites[0]?.data.slice(0, 4)).toEqual([32, 0, 0, 0]);
    expect(runtime.ashSprites[4]?.data.slice(0, 4)).toEqual([32, 0, 4, 0]);
    expect(runtime.ashSprites[5]?.data.slice(0, 4)).toEqual([96, 0, 0, 1]);
    expect(runtime.ashSprites[19]?.data.slice(0, 4)).toEqual([224, 0, 4, 3]);
    expect(runtime.ashSprites.every((sprite) => sprite?.callback === 'UpdateAshSprite')).toBe(true);
    expect(runtime.operations[0]).toBe('CreateSpriteAtEnd(sAshSpriteTemplate):0:78');
    expect(runtime.operations.at(-1)).toBe('CreateSpriteAtEnd(sAshSpriteTemplate):19:78');

    createAshSprites(runtime);
    expect(runtime.operations).toHaveLength(NUM_ASH_SPRITES);
  });

  test('UpdateAshSprite scrolls Y every sixth frame and wraps X at DISPLAY_WIDTH + 32', () => {
    const runtime = createWeatherEffectsRuntime({ gSpriteCoordOffsetY: 7, ashBaseSpritesX: 220 });
    const sprite = createWeatherSprite({ data: [32, 5, 1, 0, 0, 0, 0, 0] });

    updateAshSprite(runtime, sprite);
    expect(sprite.data[1]).toBe(0);
    expect(sprite.data[0]).toBe(33);
    expect(sprite.y).toBe(40);
    expect(sprite.x).toBe((220 + (DISPLAY_WIDTH * 2) - (4 - 1) * 64) & 0x1ff);

    runtime.ashBaseSpritesX = 10;
    sprite.data[1] = 0;
    sprite.data[2] = 2;
    updateAshSprite(runtime, sprite);
    expect(sprite.data[1]).toBe(1);
    expect(sprite.data[0]).toBe(33);
    expect(sprite.x).toBe(10 + 32 + 2 * 64);
  });

  test('Ash init, main, init-all, finish, and destroy mirror volcanic ash state machine', () => {
    const runtime = createWeatherEffectsRuntime({ gSpriteCoordOffsetX: 721 });

    Ash_InitVars(runtime);
    expect(runtime.initStep).toBe(0);
    expect(runtime.weatherGfxLoaded).toBe(false);
    expect(runtime.gammaTargetIndex).toBe(0);
    expect(runtime.gammaStepDelay).toBe(20);
    expect(runtime.ashUnused).toBe(20);
    expect(runtime.gpuRegs.get(REG_OFFSET_BLDALPHA)).toBe(BLDALPHA_BLEND(64, 63));

    Ash_Main(runtime);
    expect(runtime.ashBaseSpritesX).toBe(721 & 0x1ff);
    expect(runtime.initStep).toBe(1);
    expect(runtime.operations).toEqual(['LoadSpriteSheet(sAshSpriteSheet)']);

    Ash_Main(runtime);
    expect(runtime.ashSpritesCreated).toBe(true);
    expect(runtime.initStep).toBe(2);
    expect([runtime.targetBlendEVA, runtime.targetBlendEVB, runtime.blendDelay]).toEqual([16, 0, 1]);

    while (!runtime.weatherGfxLoaded)
      Ash_Main(runtime);
    expect(runtime.initStep).toBe(3);
    expect([runtime.currBlendEVA, runtime.currBlendEVB]).toEqual([16, 0]);

    expect(Ash_Finish(runtime)).toBe(true);
    expect(runtime.finishStep).toBe(1);
    expect([runtime.targetBlendEVA, runtime.targetBlendEVB]).toEqual([0, 16]);

    while (runtime.finishStep === 1)
      expect(Ash_Finish(runtime)).toBe(true);
    expect(runtime.finishStep).toBe(2);
    expect(runtime.ashSpritesCreated).toBe(false);
    expect(runtime.ashSprites.every((sprite) => sprite === null)).toBe(true);
    expect(runtime.operations).toContain('FreeSpriteTilesByTag(GFXTAG_ASH)');

    expect(Ash_Finish(runtime)).toBe(false);
    expect(runtime.finishStep).toBe(3);
    expect(runtime.gpuRegs.get(REG_OFFSET_BLDALPHA)).toBe(0);
    expect(Ash_Finish(runtime)).toBe(false);

    const allRuntime = createWeatherEffectsRuntime();
    Ash_InitAll(allRuntime);
    expect(allRuntime.weatherGfxLoaded).toBe(true);
    expect(allRuntime.initStep).toBe(3);
  });

  test('DestroyAshSprites is a no-op until ash exists, then frees only non-null sprite slots and tiles', () => {
    const runtime = createWeatherEffectsRuntime();
    destroyAshSprites(runtime);
    expect(runtime.operations).toEqual([]);

    runtime.ashSpritesCreated = true;
    runtime.ashSprites[0] = createWeatherSprite();
    runtime.ashSprites[1] = null;
    runtime.ashSprites[2] = createWeatherSprite();

    destroyAshSprites(runtime);
    expect(runtime.ashSpritesCreated).toBe(false);
    expect(runtime.ashSprites.every((sprite) => sprite === null)).toBe(true);
    expect(runtime.operations).toEqual([
      'DestroySprite(ashSprites[0])',
      'DestroySprite(ashSprites[2])',
      'FreeSpriteTilesByTag(GFXTAG_ASH)'
    ]);
  });

  test('StartRainSpriteFall seeds tRandom, uses ISO_RANDOMIZE2, and rewinds fixed-point position', () => {
    const runtime = createWeatherEffectsRuntime({ isDownpour: false });
    const sprite = createWeatherSprite();

    startRainSpriteFall(runtime, sprite);
    const randomized = (((isoRandomize2(361) & 0x7fff0000) >>> 16) % 600);
    const tileX = randomized % 30;
    const tileY = Math.trunc(randomized / 30);
    expect(sprite.data[1]).toBe(randomized);
    expect(sprite.data[2]).toBe((tileX << 7) - (-0x68 * 18));
    expect(sprite.data[3]).toBe((tileY << 7) - (0x0d0 * 18));
    expect(sprite.animNum).toBe(0);
    expect(sprite.coordOffsetEnabled).toBe(false);
    expect(sprite.data[0]).toBe(18);
  });

  test('UpdateRainSprite advances falling drops, hides out-of-range inactive drops, and enters splash state', () => {
    const runtime = createWeatherEffectsRuntime({ gSpriteCoordOffsetX: 3, gSpriteCoordOffsetY: 4 });
    const sprite = createWeatherSprite({ data: [1, 0, 0, 0, 0, 1, 0, 0] });

    updateRainSprite(runtime, sprite);
    expect(sprite.data[2]).toBe(-0x68);
    expect(sprite.data[3]).toBe(0x0d0);
    expect(sprite.x).toBe(-10);
    expect(sprite.y).toBe(9);
    expect(sprite.invisible).toBe(false);
    expect(sprite.animNum).toBe(1);
    expect(sprite.data[4]).toBe(1);
    expect(sprite.coordOffsetEnabled).toBe(true);
  });

  test('UpdateRainSprite restarts falling after splash animation ends', () => {
    const runtime = createWeatherEffectsRuntime({ isDownpour: true });
    const sprite = createWeatherSprite({ animEnded: true, data: [0, 5, 0, 0, 1, 1, 0, 0] });

    updateRainSprite(runtime, sprite);
    expect(sprite.invisible).toBe(true);
    expect(sprite.data[4]).toBe(0);
    expect(sprite.data[0]).toBe(12);
    expect(sprite.animNum).toBe(0);
  });

  test('WaitRainSprite decrements until zero, then starts fall and swaps callback', () => {
    const runtime = createWeatherEffectsRuntime();
    const sprite = createWeatherSprite({ data: [2, 0, 0, 0, 0, 0, 0, 0] });

    waitRainSprite(runtime, sprite);
    expect(sprite.data[0]).toBe(1);
    expect(sprite.callback).toBe('');
    sprite.data[0] = 0;
    waitRainSprite(runtime, sprite);
    expect(sprite.callback).toBe('UpdateRainSprite');
    expect(sprite.data[0]).toBe(18);
  });

  test('InitRainSpriteMovement advances RNG cycles and chooses falling vs waiting branch', () => {
    const runtime = createWeatherEffectsRuntime();
    const falling = createWeatherSprite();
    startRainSpriteFall(runtime, falling);
    initRainSpriteMovement(runtime, falling, 5);
    expect(falling.data[6]).toBe(0);
    expect(falling.data[0]).toBe(13);
    expect(falling.y).toBe(-81);

    const waiting = createWeatherSprite();
    startRainSpriteFall(runtime, waiting);
    initRainSpriteMovement(runtime, waiting, 20);
    expect(waiting.invisible).toBe(true);
    expect(waiting.data[0]).toBe(2);
    expect(waiting.data[6]).toBe(1);
  });

  test('Rain_InitVars mirrors rain counters, target count, downpour flag, and rain SE side effect', () => {
    const runtime = createWeatherEffectsRuntime({ isDownpour: true, targetRainSpriteCount: 99 });

    Rain_InitVars(runtime);

    expect(runtime.initStep).toBe(0);
    expect(runtime.weatherGfxLoaded).toBe(false);
    expect(runtime.rainSpriteVisibleCounter).toBe(0);
    expect(runtime.rainSpriteVisibleDelay).toBe(8);
    expect(runtime.isDownpour).toBe(false);
    expect(runtime.targetRainSpriteCount).toBe(10);
    expect(runtime.rainStrength).toBe(0);
    expect(runtime.playedSoundEffects).toEqual([SE_RAIN]);
  });

  test('CreateRainSprite follows the exact 24-slot creation loop and callback handoff', () => {
    const runtime = createWeatherEffectsRuntime();

    for (let i = 0; i < MAX_RAIN_SPRITES - 1; i += 1) {
      expect(createRainSprite(runtime)).toBe(true);
      expect(runtime.rainSpriteCount).toBe(i + 1);
      expect(runtime.rainSprites[i]?.invisible).toBe(true);
    }

    expect(createRainSprite(runtime)).toBe(false);
    expect(runtime.rainSpriteCount).toBe(MAX_RAIN_SPRITES);
    expect(runtime.rainSprites[0]).toMatchObject({
      animNum: 0,
      invisible: true,
      callback: 'UpdateRainSprite'
    });
    expect(runtime.rainSprites[0]?.data[1]).toBe((((isoRandomize2(361) & 0x7fff0000) >>> 16) % 600));
    expect(runtime.rainSprites[23]).toMatchObject({
      invisible: true
    });
    expect(runtime.rainSprites.some((sprite) => sprite?.callback === 'WaitRainSprite')).toBe(true);
    expect(createRainSprite(runtime)).toBe(false);
  });

  test('UpdateVisibleRainSprites uses the preincrement delay and toggles active drops in order', () => {
    const runtime = createWeatherEffectsRuntime({
      targetRainSpriteCount: 2,
      rainSpriteVisibleDelay: 2
    });
    runtime.rainSprites[0] = createWeatherSprite();
    runtime.rainSprites[1] = createWeatherSprite();

    expect(updateVisibleRainSprites(runtime)).toBe(true);
    expect(runtime.curRainSpriteIndex).toBe(0);
    expect(updateVisibleRainSprites(runtime)).toBe(true);
    expect(runtime.curRainSpriteIndex).toBe(0);
    expect(updateVisibleRainSprites(runtime)).toBe(true);
    expect(runtime.curRainSpriteIndex).toBe(1);
    expect(runtime.rainSprites[0]?.data[5]).toBe(1);

    runtime.targetRainSpriteCount = 0;
    runtime.rainSprites[0]!.invisible = false;
    for (let i = 0; i < 3; i += 1) updateVisibleRainSprites(runtime);
    expect(runtime.curRainSpriteIndex).toBe(0);
    expect(runtime.rainSprites[0]?.data[5]).toBe(0);
    expect(runtime.rainSprites[0]?.invisible).toBe(true);
  });

  test('Rain_Main loads, creates all rain sprites, and reveals the target count before marking loaded', () => {
    const runtime = createWeatherEffectsRuntime();

    Rain_InitAll(runtime);

    expect(runtime.weatherGfxLoaded).toBe(true);
    expect(runtime.initStep).toBe(3);
    expect(runtime.operations[0]).toBe('LoadSpriteSheet(sRainSpriteSheet)');
    expect(runtime.rainSpriteCount).toBe(MAX_RAIN_SPRITES);
    expect(runtime.curRainSpriteIndex).toBe(10);
    expect(runtime.rainSprites.slice(0, 10).every((sprite) => sprite?.data[5] === 1)).toBe(true);

    Rain_Main(runtime);
    expect(runtime.initStep).toBe(3);
  });

  test('Rain_Finish preserves the C rain-to-rain short circuit and non-rain fadeout teardown', () => {
    const keepRain = createWeatherEffectsRuntime({ nextWeather: WEATHER_RAIN });
    expect(Rain_Finish(keepRain)).toBe(false);
    expect(keepRain.finishStep).toBe(0xff);

    const runtime = createWeatherEffectsRuntime({
      nextWeather: WEATHER_SUNNY,
      rainSpriteCount: 2,
      curRainSpriteIndex: 1,
      targetRainSpriteCount: 1,
      rainSpriteVisibleDelay: 0,
      rainSprites: [
        createWeatherSprite({ data: [0, 0, 0, 0, 0, 1, 0, 0], invisible: false }),
        createWeatherSprite(),
        ...Array.from({ length: MAX_RAIN_SPRITES - 2 }, () => null)
      ]
    });

    expect(Rain_Finish(runtime)).toBe(true);
    expect(runtime.finishStep).toBe(1);
    expect(runtime.targetRainSpriteCount).toBe(0);
    expect(runtime.curRainSpriteIndex).toBe(0);
    expect(runtime.rainSprites[0]?.data[5]).toBe(0);
    expect(Rain_Finish(runtime)).toBe(false);
    expect(runtime.finishStep).toBe(2);
    expect(runtime.rainSpriteCount).toBe(0);
    expect(runtime.operations).toContain('DestroySprite(rainSprites[0])');
    expect(runtime.operations).toContain('DestroySprite(rainSprites[1])');
    expect(runtime.operations).toContain('FreeSpriteTilesByTag(GFXTAG_RAIN)');
  });

  test('DestroyRainSprites frees only the counted rain sprite slots then resets count', () => {
    const runtime = createWeatherEffectsRuntime({ rainSpriteCount: 2 });
    runtime.rainSprites[0] = createWeatherSprite();
    runtime.rainSprites[1] = null;
    runtime.rainSprites[2] = createWeatherSprite();

    destroyRainSprites(runtime);

    expect(runtime.rainSpriteCount).toBe(0);
    expect(runtime.rainSprites[0]).toBeNull();
    expect(runtime.rainSprites[2]).not.toBeNull();
    expect(runtime.operations).toEqual([
      'DestroySprite(rainSprites[0])',
      'FreeSpriteTilesByTag(GFXTAG_RAIN)'
    ]);
  });

  test('UpdateVisibleSnowflakeSprites waits 37 frames between create/destroy count changes', () => {
    const runtime = createWeatherEffectsRuntime({ targetSnowflakeSpriteCount: 2 });
    for (let i = 0; i < 36; i += 1) {
      expect(updateVisibleSnowflakeSprites(runtime)).toBe(true);
    }
    expect(runtime.snowflakeSpriteCount).toBe(0);
    expect(updateVisibleSnowflakeSprites(runtime)).toBe(true);
    expect(runtime.snowflakeSpriteCount).toBe(1);
    expect(runtime.snowflakeSprites[0]?.template).toBe('sSnowflakeSpriteTemplate');
    runtime.targetSnowflakeSpriteCount = 0;
    for (let i = 0; i < 37; i += 1) updateVisibleSnowflakeSprites(runtime);
    expect(runtime.snowflakeSpriteCount).toBe(0);
    expect(runtime.snowflakeSprites[0]).toBeNull();
  });

  test('CreateSnowflakeSprite and DestroySnowflakeSprite preserve id assignment, movement init, and count behavior', () => {
    const runtime = createWeatherEffectsRuntime({ rngValues: [29, 0b101011] });

    expect(createSnowflakeSprite(runtime)).toBe(true);
    const sprite = runtime.snowflakeSprites[0]!;
    expect(runtime.snowflakeSpriteCount).toBe(1);
    expect(sprite.data[4]).toBe(0);
    expect(sprite.coordOffsetEnabled).toBe(true);
    expect(sprite.callback).toBe('UpdateSnowflakeSprite');
    expect(sprite.template).toBe('sSnowflakeSpriteTemplate');
    expect(runtime.operations).toEqual(['CreateSpriteAtEnd(sSnowflakeSpriteTemplate):0:78']);

    expect(destroySnowflakeSprite(runtime)).toBe(true);
    expect(runtime.snowflakeSpriteCount).toBe(0);
    expect(runtime.snowflakeSprites[0]).toBeNull();
    expect(runtime.operations.at(-1)).toBe('DestroySprite(snowflakeSprites[0])');
    expect(destroySnowflakeSprite(runtime)).toBe(false);
  });

  test('Snow init/main/init-all/finish mirror snow lifecycle and delayed create/destroy cadence', () => {
    const runtime = createWeatherEffectsRuntime();

    Snow_InitVars(runtime);
    expect(runtime.initStep).toBe(0);
    expect(runtime.weatherGfxLoaded).toBe(false);
    expect(runtime.gammaTargetIndex).toBe(3);
    expect(runtime.gammaStepDelay).toBe(20);
    expect(runtime.targetSnowflakeSpriteCount).toBe(16);
    expect(runtime.snowflakeVisibleCounter).toBe(0);

    Snow_Main(runtime);
    expect(runtime.weatherGfxLoaded).toBe(false);
    expect(runtime.initStep).toBe(0);

    while (!runtime.weatherGfxLoaded)
      Snow_Main(runtime);
    expect(runtime.initStep).toBe(1);
    expect(runtime.snowflakeSpriteCount).toBe(16);

    expect(Snow_Finish(runtime)).toBe(true);
    expect(runtime.finishStep).toBe(1);
    expect(runtime.targetSnowflakeSpriteCount).toBe(0);
    expect(runtime.snowflakeVisibleCounter).toBe(1);

    while (runtime.finishStep === 1)
      Snow_Finish(runtime);
    expect(runtime.finishStep).toBe(2);
    expect(runtime.snowflakeSpriteCount).toBe(0);
    expect(Snow_Finish(runtime)).toBe(false);

    const allRuntime = createWeatherEffectsRuntime();
    Snow_InitAll(allRuntime);
    expect(allRuntime.weatherGfxLoaded).toBe(true);
    expect(allRuntime.initStep).toBe(1);
    expect(allRuntime.snowflakeSpriteCount).toBe(16);
  });

  test('InitSnowflakeSpriteMovement uses sprite id, two Random calls, and exact movement fields', () => {
    const runtime = createWeatherEffectsRuntime({ rngValues: [29, 0b101011], gSpriteCoordOffsetX: 2, gSpriteCoordOffsetY: 3 });
    const sprite = createWeatherSprite({ data: [0, 0, 0, 0, 2, 0, 0, 0], centerToCornerVecX: 1, centerToCornerVecY: 1 });

    initSnowflakeSpriteMovement(runtime, sprite);
    expect(sprite.x).toBe((((2 * 5) & 7) * 30 + 29) - 3);
    expect(sprite.y).toBe(-7);
    expect(sprite.data[0]).toBe(-7 * 128);
    expect(sprite.data[1]).toBe(((0b101011 & 3) * 5) + 64);
    expect(sprite.data[7]).toBe(sprite.data[1]);
    expect(sprite.animNum).toBe(0);
    expect(sprite.data[3]).toBe(0);
    expect(sprite.data[2]).toBe(1);
    expect(sprite.data[6]).toBe((0b101011 & 0x1f) + 210);
    expect(sprite.data[5]).toBe(0);
  });

  test('WaitSnowflakeSprite only resumes after weather timer exceeds 18', () => {
    const runtime = createWeatherEffectsRuntime({ snowflakeTimer: 18, gSpriteCoordOffsetY: 4 });
    const sprite = createWeatherSprite({ invisible: true, centerToCornerVecY: 2 });

    waitSnowflakeSprite(runtime, sprite);
    expect(sprite.callback).toBe('');
    runtime.snowflakeTimer = 19;
    waitSnowflakeSprite(runtime, sprite);
    expect(sprite.invisible).toBe(false);
    expect(sprite.callback).toBe('UpdateSnowflakeSprite');
    expect(sprite.y).toBe(244);
    expect(sprite.data[0]).toBe(244 * 128);
    expect(runtime.snowflakeTimer).toBe(0);
  });

  test('UpdateSnowflakeSprite applies sine wave, x wrapping, ground wrap, and wait handoff', () => {
    const runtime = createWeatherEffectsRuntime({ gSpriteCoordOffsetX: 0, gSpriteCoordOffsetY: 0 });
    const sprite = createWeatherSprite({
      x: 243,
      y: 162,
      data: [162 * 128, 128, 1, 0, 0, 0, 220, 0]
    });

    updateSnowflakeSprite(runtime, sprite);
    expect(sprite.data[0]).toBe(163 * 128);
    expect(sprite.y).toBe(163);
    expect(sprite.data[3]).toBe(1);
    expect(sprite.x2).toBe(0);
    expect(sprite.x).toBe(-3);

    sprite.y = 164;
    sprite.data[0] = 164 * 128;
    updateSnowflakeSprite(runtime, sprite);
    expect(sprite.y).toBe(250);
    expect(sprite.data[0]).toBe(250 * 128);
    expect(sprite.data[5]).toBe(1);
    expect(sprite.data[6]).toBe(220);

    sprite.y = 243;
    sprite.data[0] = 243 * 128;
    updateSnowflakeSprite(runtime, sprite);
    expect(sprite.y).toBe(163);
    expect(sprite.invisible).toBe(true);
    expect(sprite.callback).toBe('WaitSnowflakeSprite');
  });

  test('UpdateSnowflakeSprite reinitializes and hides after fall duration expires', () => {
    const runtime = createWeatherEffectsRuntime({ rngValues: [0, 0] });
    const sprite = createWeatherSprite({
      data: [0, 0, 1, 0, 0, 219, 220, 0]
    });

    updateSnowflakeSprite(runtime, sprite);
    expect(sprite.y).toBe(250);
    expect(sprite.invisible).toBe(true);
    expect(sprite.callback).toBe('WaitSnowflakeSprite');
    expect(sprite.data[5]).toBe(0);
    expect(sprite.data[6]).toBe(210);
  });
});
