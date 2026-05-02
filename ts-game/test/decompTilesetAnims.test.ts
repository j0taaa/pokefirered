import { describe, expect, test } from 'vitest';
import * as tilesetAnims from '../src/game/decompTilesetAnims';
import {
  TILE_SIZE_4BPP,
  appendTilesetAnimToBuffer,
  createTilesetAnimRuntime,
  initSecondaryTilesetAnimationPublic,
  initTilesetAnimCeladonCity,
  initTilesetAnimCeladonGym,
  initTilesetAnimGeneral,
  initTilesetAnimMtEmber,
  initTilesetAnimSilphCo,
  initTilesetAnimVermilionGym,
  initTilesetAnimations,
  queueAnimTilesGeneralFlower,
  queueAnimTilesGeneralSandWatersEdge,
  queueAnimTilesGeneralWaterCurrentLandWatersEdge,
  queueAnimTilesCeladonCityFountain,
  queueAnimTilesCeladonGymFlowers,
  queueAnimTilesMtEmberSteam,
  queueAnimTilesSilphCoFountain,
  queueAnimTilesVermilionGymMotorizedDoor,
  resetTilesetAnimBuffer,
  tileOffset4Bpp,
  tilesetAnimCeladonCity,
  tilesetAnimCeladonGym,
  tilesetAnimGeneral,
  tilesetAnimMtEmber,
  tilesetAnimSilphCo,
  tilesetAnimVermilionGym,
  transferTilesetAnimsBuffer,
  updateTilesetAnimations
} from '../src/game/decompTilesetAnims';

describe('decomp tileset_anims', () => {
  test('exports exact C tileset animation names as aliases of the implemented logic', () => {
    expect(tilesetAnims.ResetTilesetAnimBuffer).toBe(resetTilesetAnimBuffer);
    expect(tilesetAnims.AppendTilesetAnimToBuffer).toBe(appendTilesetAnimToBuffer);
    expect(tilesetAnims.TransferTilesetAnimsBuffer).toBe(transferTilesetAnimsBuffer);
    expect(tilesetAnims.InitTilesetAnimations).toBe(initTilesetAnimations);
    expect(tilesetAnims.InitSecondaryTilesetAnimation).toBe(initSecondaryTilesetAnimationPublic);
    expect(tilesetAnims.UpdateTilesetAnimations).toBe(updateTilesetAnimations);
    expect(tilesetAnims._InitPrimaryTilesetAnimation).toBeTypeOf('function');
    expect(tilesetAnims._InitSecondaryTilesetAnimation).toBeTypeOf('function');
    expect(tilesetAnims.QueueAnimTiles_General_Flower).toBe(queueAnimTilesGeneralFlower);
    expect(tilesetAnims.QueueAnimTiles_General_Water_Current_LandWatersEdge).toBe(queueAnimTilesGeneralWaterCurrentLandWatersEdge);
    expect(tilesetAnims.QueueAnimTiles_General_SandWatersEdge).toBe(queueAnimTilesGeneralSandWatersEdge);
    expect(tilesetAnims.TilesetAnim_General).toBe(tilesetAnimGeneral);
    expect(tilesetAnims.InitTilesetAnim_General).toBe(initTilesetAnimGeneral);
    expect(tilesetAnims.QueueAnimTiles_CeladonCity_Fountain).toBe(queueAnimTilesCeladonCityFountain);
    expect(tilesetAnims.TilesetAnim_CeladonCity).toBe(tilesetAnimCeladonCity);
    expect(tilesetAnims.InitTilesetAnim_CeladonCity).toBe(initTilesetAnimCeladonCity);
    expect(tilesetAnims.QueueAnimTiles_SilphCo_Fountain).toBe(queueAnimTilesSilphCoFountain);
    expect(tilesetAnims.TilesetAnim_SilphCo).toBe(tilesetAnimSilphCo);
    expect(tilesetAnims.InitTilesetAnim_SilphCo).toBe(initTilesetAnimSilphCo);
    expect(tilesetAnims.QueueAnimTiles_MtEmber_Steam).toBe(queueAnimTilesMtEmberSteam);
    expect(tilesetAnims.TilesetAnim_MtEmber).toBe(tilesetAnimMtEmber);
    expect(tilesetAnims.InitTilesetAnim_MtEmber).toBe(initTilesetAnimMtEmber);
    expect(tilesetAnims.QueueAnimTiles_VermilionGym_MotorizedDoor).toBe(queueAnimTilesVermilionGymMotorizedDoor);
    expect(tilesetAnims.TilesetAnim_VermilionGym).toBe(tilesetAnimVermilionGym);
    expect(tilesetAnims.InitTilesetAnim_VermilionGym).toBe(initTilesetAnimVermilionGym);
    expect(tilesetAnims.QueueAnimTiles_CeladonGym_Flowers).toBe(queueAnimTilesCeladonGymFlowers);
    expect(tilesetAnims.TilesetAnim_CeladonGym).toBe(tilesetAnimCeladonGym);
    expect(tilesetAnims.InitTilesetAnim_CeladonGym).toBe(initTilesetAnimCeladonGym);
  });

  test('append buffer caps at 20 entries and transfer uses DMA channel 3 then clears', () => {
    const runtime = createTilesetAnimRuntime();
    for (let i = 0; i < 21; i += 1) {
      appendTilesetAnimToBuffer(runtime, `src${i}`, i, i + 1);
    }

    expect(runtime.transferBuffer).toHaveLength(20);
    transferTilesetAnimsBuffer(runtime);
    expect(runtime.transferBuffer).toHaveLength(0);
    expect(runtime.dmaCopyLog).toHaveLength(20);
    expect(runtime.dmaCopyLog[0]).toEqual({ channel: 3, src: 'src0', dest: 0, size: 1 });
    expect(runtime.dmaCopyLog.at(-1)).toEqual({ channel: 3, src: 'src19', dest: 19, size: 20 });
  });

  test('init calls primary and secondary tileset callbacks after clearing counters and buffer', () => {
    const runtime = createTilesetAnimRuntime();
    runtime.primaryCounter = 99;
    runtime.secondaryCounter = 88;
    runtime.transferBuffer.push({ src: 'stale', dest: 1, size: 2 });
    runtime.primaryTilesetCallback = 'InitTilesetAnim_General';
    runtime.secondaryTilesetCallback = 'InitTilesetAnim_CeladonCity';

    initTilesetAnimations(runtime);
    expect(runtime.transferBuffer).toEqual([]);
    expect(runtime.primaryCounter).toBe(0);
    expect(runtime.primaryCounterMax).toBe(640);
    expect(runtime.primaryCallback).toBe('TilesetAnim_General');
    expect(runtime.secondaryCounter).toBe(0);
    expect(runtime.secondaryCounterMax).toBe(120);
    expect(runtime.secondaryCallback).toBe('TilesetAnim_CeladonCity');
  });

  test('InitSecondaryTilesetAnimation only resets and re-runs the secondary callback', () => {
    const runtime = createTilesetAnimRuntime();
    initTilesetAnimGeneral(runtime);
    runtime.primaryCounter = 5;
    runtime.secondaryCounter = 7;
    runtime.secondaryTilesetCallback = 'InitTilesetAnim_SilphCo';

    initSecondaryTilesetAnimationPublic(runtime);
    expect(runtime.primaryCounter).toBe(5);
    expect(runtime.primaryCallback).toBe('TilesetAnim_General');
    expect(runtime.secondaryCounter).toBe(0);
    expect(runtime.secondaryCounterMax).toBe(160);
    expect(runtime.secondaryCallback).toBe('TilesetAnim_SilphCo');
  });

  test('UpdateTilesetAnimations increments before callbacks, wraps counters, and resets buffer first', () => {
    const runtime = createTilesetAnimRuntime();
    initTilesetAnimGeneral(runtime);
    initTilesetAnimCeladonCity(runtime);
    runtime.primaryCounter = 639;
    runtime.secondaryCounter = 11;
    runtime.transferBuffer.push({ src: 'old', dest: 0, size: 0 });

    updateTilesetAnimations(runtime);
    expect(runtime.primaryCounter).toBe(0);
    expect(runtime.secondaryCounter).toBe(12);
    expect(runtime.transferBuffer).toEqual([
      {
        src: 'sTilesetAnims_General_SandWatersEdge_Frame0',
        dest: tileOffset4Bpp(464),
        size: 18 * TILE_SIZE_4BPP
      },
      {
        src: 'sTilesetAnims_CeladonCity_Fountain_Frame1',
        dest: tileOffset4Bpp(744),
        size: 8 * TILE_SIZE_4BPP
      }
    ]);
  });

  test('general animation queues sand, water edge, and flower on exact timer phases', () => {
    const runtime = createTilesetAnimRuntime();

    tilesetAnimGeneral(runtime, 0);
    tilesetAnimGeneral(runtime, 1);
    tilesetAnimGeneral(runtime, 2);
    tilesetAnimGeneral(runtime, 16);
    expect(runtime.transferBuffer).toEqual([
      {
        src: 'sTilesetAnims_General_SandWatersEdge_Frame0',
        dest: tileOffset4Bpp(464),
        size: 18 * TILE_SIZE_4BPP
      },
      {
        src: 'sTilesetAnims_General_Water_Current_LandWatersEdge_Frame0',
        dest: tileOffset4Bpp(416),
        size: 48 * TILE_SIZE_4BPP
      },
      {
        src: 'sTilesetAnims_General_Flower_Frame0',
        dest: tileOffset4Bpp(508),
        size: 4 * TILE_SIZE_4BPP
      },
      {
        src: 'sTilesetAnims_General_SandWatersEdge_Frame2',
        dest: tileOffset4Bpp(464),
        size: 18 * TILE_SIZE_4BPP
      }
    ]);
  });

  test('secondary animation callbacks queue at their exact cadences and frame loops', () => {
    const runtime = createTilesetAnimRuntime();

    tilesetAnimCeladonCity(runtime, 60);
    tilesetAnimSilphCo(runtime, 40);
    tilesetAnimMtEmber(runtime, 64);
    tilesetAnimVermilionGym(runtime, 6);
    tilesetAnimCeladonGym(runtime, 48);
    expect(runtime.transferBuffer).toEqual([
      {
        src: 'sTilesetAnims_CeladonCity_Fountain_Frame0',
        dest: tileOffset4Bpp(744),
        size: 8 * TILE_SIZE_4BPP
      },
      {
        src: 'sTilesetAnims_SilphCo_Fountain_Frame0',
        dest: tileOffset4Bpp(976),
        size: 8 * TILE_SIZE_4BPP
      },
      {
        src: 'sTilesetAnims_MtEmber_Steam_Frame0',
        dest: tileOffset4Bpp(896),
        size: 8 * TILE_SIZE_4BPP
      },
      {
        src: 'sTilesetAnims_VermilionGym_MotorizedDoor_Frame1',
        dest: tileOffset4Bpp(880),
        size: 7 * TILE_SIZE_4BPP
      },
      {
        src: 'sTilesetAnims_CeladonGym_Flowers_Frame1',
        dest: tileOffset4Bpp(739),
        size: 4 * TILE_SIZE_4BPP
      }
    ]);

    resetTilesetAnimBuffer(runtime);
    tilesetAnimCeladonCity(runtime, 61);
    tilesetAnimSilphCo(runtime, 41);
    tilesetAnimMtEmber(runtime, 65);
    tilesetAnimVermilionGym(runtime, 7);
    tilesetAnimCeladonGym(runtime, 49);
    expect(runtime.transferBuffer).toEqual([]);
  });

  test('individual queue helpers preserve destination and modulo frame selection', () => {
    const runtime = createTilesetAnimRuntime();
    queueAnimTilesGeneralFlower(runtime, 7);
    expect(runtime.transferBuffer).toEqual([
      {
        src: 'sTilesetAnims_General_Flower_Frame2',
        dest: tileOffset4Bpp(508),
        size: 4 * TILE_SIZE_4BPP
      }
    ]);
  });

  test('init helpers set the exact counter max and callback slot', () => {
    const runtime = createTilesetAnimRuntime();

    initTilesetAnimGeneral(runtime);
    expect([runtime.primaryCounter, runtime.primaryCounterMax, runtime.primaryCallback]).toEqual([
      0,
      640,
      'TilesetAnim_General'
    ]);

    initTilesetAnimMtEmber(runtime);
    expect([runtime.secondaryCounter, runtime.secondaryCounterMax, runtime.secondaryCallback]).toEqual([
      0,
      256,
      'TilesetAnim_MtEmber'
    ]);

    initTilesetAnimVermilionGym(runtime);
    expect([runtime.secondaryCounter, runtime.secondaryCounterMax, runtime.secondaryCallback]).toEqual([
      0,
      240,
      'TilesetAnim_VermilionGym'
    ]);

    initTilesetAnimCeladonGym(runtime);
    expect([runtime.secondaryCounter, runtime.secondaryCounterMax, runtime.secondaryCallback]).toEqual([
      0,
      256,
      'TilesetAnim_CeladonGym'
    ]);
  });
});
