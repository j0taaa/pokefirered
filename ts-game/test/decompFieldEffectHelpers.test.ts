import { describe, expect, test } from 'vitest';
import {
  BOB_MON_ONLY,
  DIR_EAST,
  FLDEFF_ASH,
  FLDEFF_BIKE_TIRE_TRACKS,
  FLDEFF_BUBBLES,
  FLDEFF_FEET_IN_FLOWING_WATER,
  FLDEFF_HOT_SPRINGS_WATER,
  FLDEFF_SAND_DISGUISE,
  FLDEFF_SAND_PILE,
  FLDEFF_SHADOW,
  FLDEFF_SHORT_GRASS,
  FLDEFF_SPARKLE,
  FLDEFF_SURF_BLOB,
  FLDEFF_TALL_GRASS,
  FldEff_JumpSmallSplash,
  MAX_SPRITES,
  PALSLOT_PLAYER,
  SE_PUDDLE,
  SHADOW_SIZE_XL,
  ST_OAM_AFFINE_NORMAL,
  ST_OAM_HFLIP,
  CreateWarpArrowSprite,
  FldEff_Ash,
  FldEff_BikeTireTracks,
  FldEff_Bubbles,
  FldEff_FeetInFlowingWater,
  FldEff_HotSpringsWater,
  FldEff_SandPile,
  FldEff_Shadow,
  FldEff_ShortGrass,
  FldEff_Sparkle,
  FldEff_SurfBlob,
  FldEff_TallGrass,
  SetSurfBlob_BobState,
  SetSurfBlob_DontSyncAnim,
  SetSurfBlob_PlayerOffset,
  SetUpReflection,
  ShowSandDisguiseFieldEffect,
  ShowWarpArrowSprite,
  SpriteCB_UnderwaterSurfBlob,
  StartAshFieldEffect,
  StartRevealDisguise,
  StartUnderwaterSurfBlobBobbing,
  SynchroniseSurfPosition,
  UpdateAshFieldEffect,
  UpdateBubblesFieldEffect,
  UpdateDisguiseFieldEffect,
  UpdateFeetInFlowingWaterFieldEffect,
  UpdateFootprintsTireTracksFieldEffect,
  UpdateHotSpringsWaterFieldEffect,
  UpdateObjectReflectionSprite,
  UpdateRevealDisguise,
  UpdateSandPileFieldEffect,
  UpdateShadowFieldEffect,
  UpdateShortGrassFieldEffect,
  UpdateSparkleFieldEffect,
  UpdateSurfBlobFieldEffect,
  UpdateTallGrassFieldEffect,
  WaitFieldEffectSpriteAnim,
  callFieldEffectCallback,
  createFieldEffectHelpersRuntime,
  createGraphicsInfo
} from '../src/game/decompFieldEffectHelpers';

describe('decomp field_effect_helpers', () => {
  test('reflection setup and callback copy the same object/sprite fields and bridge palette rules', () => {
    const runtime = createFieldEffectHelpersRuntime();
    runtime.graphicsInfo[2] = createGraphicsInfo({ height: 40, paletteSlot: PALSLOT_PLAYER, paletteTag: 77 });
    const objectEvent = runtime.gObjectEvents[0];
    objectEvent.graphicsId = 2;
    objectEvent.previousMetatileBehavior = 101;
    objectEvent.spriteId = 0;
    runtime.gSprites[0].data[0] = 0;
    runtime.gSprites[0].oam.paletteNum = 3;
    runtime.gSprites[0].oam.matrixNum = ST_OAM_HFLIP;
    runtime.gSprites[0].x = 50;
    runtime.gSprites[0].y = 60;
    runtime.gSprites[0].y2 = 5;

    SetUpReflection(runtime, objectEvent, runtime.gSprites[0], false);
    const reflection = runtime.gSprites.at(-1)!;
    expect(reflection).toMatchObject({ callback: 'UpdateObjectReflectionSprite', usingSheet: true });
    expect(reflection.oam.affineMode).toBe(ST_OAM_AFFINE_NORMAL);
    expect(reflection.data.slice(0, 3)).toEqual([0, 0, 28]);
    expect(runtime.operations).toContain('PatchObjectPalette:1:11');

    UpdateObjectReflectionSprite(runtime, reflection);
    expect(reflection).toMatchObject({ x: 50, y: 126, y2: -5 });
    expect(reflection.oam.matrixNum).toBe(1);
    objectEvent.hasReflection = false;
    UpdateObjectReflectionSprite(runtime, reflection);
    expect(reflection.inUse).toBe(false);
  });

  test('warp arrows, shadows, grass, and short grass use C data slots and stop conditions', () => {
    const runtime = createFieldEffectHelpersRuntime();
    runtime.graphicsInfo[0] = createGraphicsInfo({ height: 48, shadowSize: SHADOW_SIZE_XL });
    runtime.gFieldEffectArguments.splice(0, 8, 0, 0, 0, 2, (0 << 8) | 0, 0, 0, 0);
    runtime.gSprites[0].x = 64;
    runtime.gSprites[0].y = 80;
    runtime.gSprites[0].oam.priority = 2;

    const arrowId = CreateWarpArrowSprite(runtime);
    ShowWarpArrowSprite(runtime, arrowId, 3, 4, 5);
    expect(runtime.gSprites[arrowId]).toMatchObject({ x: 72, y: 88, invisible: false });
    expect(runtime.operations).toContain(`StartSpriteAnim:${arrowId}:2`);

    FldEff_Shadow(runtime);
    const shadow = runtime.gSprites.at(-1)!;
    expect(shadow.data.slice(0, 4)).toEqual([0, 0, 0, 8]);
    UpdateShadowFieldEffect(runtime, shadow);
    expect(shadow).toMatchObject({ x: 64, y: 88 });
    runtime.gObjectEvents[0].hasShadow = false;
    UpdateShadowFieldEffect(runtime, shadow);
    expect(runtime.stoppedEffects).toContainEqual({ spriteId: shadow.id, effect: FLDEFF_SHADOW });

    runtime.gObjectEvents[0].hasShadow = true;
    runtime.gObjectEvents[0].currentCoords = { x: 4, y: 5 };
    runtime.gObjectEvents[0].previousCoords = { x: 4, y: 5 };
    runtime.mapMetatileBehaviors.set('4,5', 1);
    runtime.gFieldEffectArguments.splice(0, 8, 4, 5, 2, 1, 0, 0, 0, 1);
    FldEff_TallGrass(runtime);
    const grass = runtime.gSprites.at(-1)!;
    expect(grass.callback).toBe('UpdateTallGrassFieldEffect');
    expect(grass.data.slice(0, 6)).toEqual([2, 4, 5, 0, 0, 0]);
    expect(runtime.operations).toContain(`SeekSpriteAnim:${grass.id}:4`);
    UpdateTallGrassFieldEffect(runtime, grass);
    expect(grass.inUse).toBe(true);
    runtime.mapMetatileBehaviors.set('4,5', 0);
    UpdateTallGrassFieldEffect(runtime, grass);
    expect(runtime.stoppedEffects).toContainEqual({ spriteId: grass.id, effect: FLDEFF_TALL_GRASS });

    runtime.gObjectEvents[0].inShortGrass = true;
    runtime.gSprites[0].x = 88;
    runtime.gSprites[0].y = 96;
    runtime.gFieldEffectArguments.splice(0, 3, 0, 0, 0);
    FldEff_ShortGrass(runtime);
    const shortGrass = runtime.gSprites.at(-1)!;
    runtime.gSprites[0].x = 90;
    shortGrass.animEnded = true;
    UpdateShortGrassFieldEffect(runtime, shortGrass);
    expect(shortGrass).toMatchObject({ x: 90, y: 96, y2: 16, subpriority: runtime.gSprites[0].subpriority - 1 });
    runtime.gObjectEvents[0].inShortGrass = false;
    UpdateShortGrassFieldEffect(runtime, shortGrass);
    expect(runtime.stoppedEffects).toContainEqual({ spriteId: shortGrass.id, effect: FLDEFF_SHORT_GRASS });
  });

  test('footprint timers, splash/water, hot springs, sand pile, bubbles, sparkle, and ash match callback frames', () => {
    const runtime = createFieldEffectHelpersRuntime();
    runtime.gFieldEffectArguments.splice(0, 8, 2, 3, 7, 1, 4, 0, 0, 0);
    const tireId = FldEff_BikeTireTracks(runtime);
    const tire = runtime.gSprites[tireId];
    expect(tire.data[7]).toBe(FLDEFF_BIKE_TIRE_TRACKS);
    for (let i = 0; i < 41; i++) UpdateFootprintsTireTracksFieldEffect(runtime, tire);
    expect(tire.data[0]).toBe(1);
    for (let i = 0; i < 16; i++) UpdateFootprintsTireTracksFieldEffect(runtime, tire);
    expect(runtime.stoppedEffects).toContainEqual({ spriteId: tire.id, effect: FLDEFF_BIKE_TIRE_TRACKS });

    runtime.gObjectEvents[0].inShallowFlowingWater = true;
    runtime.gObjectEvents[0].currentCoords = { x: 1, y: 1 };
    runtime.gFieldEffectArguments.splice(0, 3, 0, 0, 0);
    FldEff_FeetInFlowingWater(runtime);
    const feet = runtime.gSprites.at(-1)!;
    expect(feet.callback).toBe('UpdateFeetInFlowingWaterFieldEffect');
    UpdateFeetInFlowingWaterFieldEffect(runtime, feet);
    expect(runtime.sounds).toContain(SE_PUDDLE);
    runtime.gObjectEvents[0].inShallowFlowingWater = false;
    UpdateFeetInFlowingWaterFieldEffect(runtime, feet);
    expect(runtime.stoppedEffects).toContainEqual({ spriteId: feet.id, effect: FLDEFF_FEET_IN_FLOWING_WATER });

    runtime.gObjectEvents[0].inHotSprings = true;
    runtime.gSprites[0].y = 70;
    FldEff_HotSpringsWater(runtime);
    const spring = runtime.gSprites.at(-1)!;
    UpdateHotSpringsWaterFieldEffect(runtime, spring);
    expect(spring.y).toBe(78);
    runtime.gObjectEvents[0].inHotSprings = false;
    UpdateHotSpringsWaterFieldEffect(runtime, spring);
    expect(runtime.stoppedEffects).toContainEqual({ spriteId: spring.id, effect: FLDEFF_HOT_SPRINGS_WATER });

    runtime.gObjectEvents[0].inSandPile = true;
    FldEff_SandPile(runtime);
    const sand = runtime.gSprites.at(-1)!;
    runtime.gSprites[0].x++;
    sand.animEnded = true;
    UpdateSandPileFieldEffect(runtime, sand);
    expect(sand.x).toBe(runtime.gSprites[0].x);
    runtime.gObjectEvents[0].inSandPile = false;
    UpdateSandPileFieldEffect(runtime, sand);
    expect(runtime.stoppedEffects).toContainEqual({ spriteId: sand.id, effect: FLDEFF_SAND_PILE });

    FldEff_Bubbles(runtime);
    const bubbles = runtime.gSprites.at(-1)!;
    expect(bubbles.callback).toBe('UpdateBubblesFieldEffect');
    bubbles.animEnded = true;
    UpdateBubblesFieldEffect(runtime, bubbles);
    expect(runtime.stoppedEffects).toContainEqual({ spriteId: bubbles.id, effect: FLDEFF_BUBBLES });

    FldEff_Sparkle(runtime);
    const sparkle = runtime.gSprites.at(-1)!;
    expect(sparkle.callback).toBe('UpdateSparkleFieldEffect');
    sparkle.animEnded = true;
    UpdateSparkleFieldEffect(runtime, sparkle);
    expect(sparkle).toMatchObject({ invisible: true });
    for (let i = 0; i < 35; i++) UpdateSparkleFieldEffect(runtime, sparkle);
    expect(runtime.stoppedEffects).toContainEqual({ spriteId: sparkle.id, effect: FLDEFF_SPARKLE });

    StartAshFieldEffect(runtime, 8, 9, 123, 1);
    expect(runtime.startedEffects).toContain(FLDEFF_ASH);
    FldEff_Ash(runtime);
    const ash = runtime.gSprites.at(-1)!;
    UpdateAshFieldEffect(runtime, ash);
    UpdateAshFieldEffect(runtime, ash);
    expect(runtime.metatileWrites).toContainEqual({ x: 8, y: 9, metatileId: 123 });
    ash.animEnded = true;
    UpdateAshFieldEffect(runtime, ash);
    expect(runtime.stoppedEffects).toContainEqual({ spriteId: ash.id, effect: FLDEFF_ASH });

    FldEff_JumpSmallSplash(runtime);
    expect(runtime.gSprites.at(-1)!.callback).toBe('UpdateJumpImpactEffect');
  });

  test('surf blob bitfields, underwater bobbing, disguise reveal, and generic wait callbacks preserve C slots', () => {
    const runtime = createFieldEffectHelpersRuntime();
    runtime.gObjectEvents[0].movementDirection = DIR_EAST;
    runtime.gObjectEvents[0].currentCoords = { x: 4, y: 4 };
    runtime.mapElevations.set('5,4', 3);
    runtime.gFieldEffectArguments.splice(0, 3, 4, 4, 0);
    const surfId = FldEff_SurfBlob(runtime);
    expect(runtime.removedActiveEffects).toContain(FLDEFF_SURF_BLOB);
    SetSurfBlob_BobState(runtime, surfId, BOB_MON_ONLY);
    SetSurfBlob_DontSyncAnim(runtime, surfId, false);
    SetSurfBlob_PlayerOffset(runtime, surfId, true, 6);
    const surf = runtime.gSprites[surfId];
    UpdateSurfBlobFieldEffect(runtime, surf);
    expect(surf.data[5]).toBe(1);
    expect(runtime.operations).toContain(`StartSpriteAnim:${surf.id}:3`);
    SynchroniseSurfPosition(runtime, runtime.gObjectEvents[0], surf);

    const oldY2 = surf.y2;
    const bobId = StartUnderwaterSurfBlobBobbing(runtime, surfId);
    const bob = runtime.gSprites[bobId];
    SpriteCB_UnderwaterSurfBlob(runtime, bob);
    expect(surf.y2).toBe(oldY2 + 1);

    runtime.gFieldEffectArguments.splice(0, 3, 0, 0, 0);
    const disguiseId = ShowSandDisguiseFieldEffect(runtime);
    const disguise = runtime.gSprites[disguiseId];
    expect(disguise.oam.paletteNum).toBe(2);
    runtime.gObjectEvents[0].fieldEffectSpriteId = disguiseId;
    runtime.gObjectEvents[0].directionSequenceIndex = 1;
    StartRevealDisguise(runtime, runtime.gObjectEvents[0]);
    expect(disguise.data[0]).toBe(1);
    UpdateDisguiseFieldEffect(runtime, disguise);
    expect(disguise.data[0]).toBe(2);
    disguise.animEnded = true;
    UpdateDisguiseFieldEffect(runtime, disguise);
    expect(UpdateRevealDisguise(runtime, runtime.gObjectEvents[0])).toBe(true);
    expect(runtime.gObjectEvents[0].directionSequenceIndex).toBe(2);
    disguise.data[0] = 3;
    UpdateDisguiseFieldEffect(runtime, disguise);
    expect(runtime.stoppedEffects).toContainEqual({ spriteId: disguise.id, effect: FLDEFF_SAND_DISGUISE });

    const waitSprite = runtime.gSprites.at(-1)!;
    waitSprite.data[0] = 99;
    waitSprite.animEnded = true;
    WaitFieldEffectSpriteAnim(runtime, waitSprite);
    expect(runtime.stoppedEffects).toContainEqual({ spriteId: waitSprite.id, effect: 99 });
    expect(callFieldEffectCallback(runtime, { ...waitSprite, callback: 'SpriteCallbackDummy' })).toBeUndefined();

    runtime.gFieldEffectArguments.splice(0, 3, 99, 99, 99);
    expect(ShowSandDisguiseFieldEffect(runtime)).toBe(MAX_SPRITES);
  });
});
