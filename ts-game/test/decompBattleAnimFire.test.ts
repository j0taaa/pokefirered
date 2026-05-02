import { describe, expect, test } from 'vitest';
import {
  AnimBurnFlame,
  AnimEmberFlare,
  AnimEruptionFallingRock,
  AnimEruptionFallingRock_Step,
  AnimEruptionLaunchRock,
  AnimFireCross,
  AnimFirePlume,
  AnimFireRing,
  AnimFireRing_Step1,
  AnimFireRing_Step2,
  AnimFireRing_Step3,
  AnimFireSpiralInward,
  AnimFireSpiralOutward,
  AnimFireSpiralOutward_Step1,
  AnimFireSpiralOutward_Step2,
  AnimFireSpread,
  AnimLargeFlame,
  AnimLargeFlame_Step,
  AnimSunlight,
  AnimTask_BlendBackground,
  AnimTask_EruptionLaunchRocks,
  AnimTask_EruptionLaunchRocks_Step,
  AnimTask_MoveHeatWaveTargets,
  AnimTask_MoveHeatWaveTargets_Step,
  AnimTask_ShakeTargetInPattern,
  AnimUnusedSmallEmber,
  AnimUnusedSmallEmber_Step,
  AnimWillOWispFire,
  AnimWillOWispOrb,
  AnimWillOWispOrb_Step,
  B_SIDE_OPPONENT,
  CreateEruptionLaunchRocks,
  GetEruptionLaunchRockInitialYPos,
  InitEruptionLaunchRockCoordData,
  SE_M_FLAME_WHEEL,
  UpdateEruptionLaunchRockPos,
  UpdateFireRingCircleOffset,
  animBurnFlame,
  animEmberFlare,
  animEruptionFallingRock,
  animEruptionFallingRockStep,
  animEruptionLaunchRock,
  animFireCross,
  animFirePlume,
  animFireRing,
  animFireRingStep1,
  animFireRingStep2,
  animFireRingStep3,
  animFireSpiralInward,
  animFireSpiralOutward,
  animFireSpiralOutwardStep1,
  animFireSpiralOutwardStep2,
  animFireSpread,
  animLargeFlame,
  animLargeFlameStep,
  animSunlight,
  animTaskBlendBackground,
  animTaskEruptionLaunchRocks,
  animTaskEruptionLaunchRocksStep,
  animTaskMoveHeatWaveTargets,
  animTaskMoveHeatWaveTargetsStep,
  animTaskShakeTargetInPattern,
  animUnusedSmallEmber,
  animUnusedSmallEmberStep,
  animWillOWispFire,
  animWillOWispOrb,
  animWillOWispOrbStep,
  createEruptionLaunchRocks,
  createFireRuntime,
  createFireSprite,
  createFireTask,
  gBurnFlameSpriteTemplate,
  gEmberFlareSpriteTemplate,
  gEmberSpriteTemplate,
  gEruptionFallingRockSpriteTemplate,
  gFireBlastCrossSpriteTemplate,
  gFireBlastRingSpriteTemplate,
  gFirePlumeSpriteTemplate,
  gFireSpiralInwardSpriteTemplate,
  gFireSpiralOutwardSpriteTemplate,
  gFireSpreadSpriteTemplate,
  gLargeFlameScatterSpriteTemplate,
  gLargeFlameSpriteTemplate,
  gSunlightRaySpriteTemplate,
  gWeatherBallFireDownSpriteTemplate,
  gWillOWispFireSpriteTemplate,
  gWillOWispOrbSpriteTemplate,
  getEruptionLaunchRockInitialYPos,
  initEruptionLaunchRockCoordData,
  sEruptionLaunchRockSpeeds,
  sShakeDirsPattern0,
  sShakeDirsPattern1,
  sUnusedEmberFirePlumeSpriteTemplate,
  sUnusedSmallEmberSpriteTemplate,
  updateEruptionLaunchRockPos,
  updateFireRingCircleOffset
} from '../src/game/decompBattleAnimFire';

describe('decomp battle_anim_fire.c parity', () => {
  test('exports exact C callback and task names as aliases of the implemented logic', () => {
    expect(AnimFireSpiralInward).toBe(animFireSpiralInward);
    expect(AnimFireSpread).toBe(animFireSpread);
    expect(AnimFirePlume).toBe(animFirePlume);
    expect(AnimLargeFlame).toBe(animLargeFlame);
    expect(AnimLargeFlame_Step).toBe(animLargeFlameStep);
    expect(AnimUnusedSmallEmber).toBe(animUnusedSmallEmber);
    expect(AnimUnusedSmallEmber_Step).toBe(animUnusedSmallEmberStep);
    expect(AnimSunlight).toBe(animSunlight);
    expect(AnimEmberFlare).toBe(animEmberFlare);
    expect(AnimBurnFlame).toBe(animBurnFlame);
    expect(AnimFireRing).toBe(animFireRing);
    expect(AnimFireRing_Step1).toBe(animFireRingStep1);
    expect(AnimFireRing_Step2).toBe(animFireRingStep2);
    expect(AnimFireRing_Step3).toBe(animFireRingStep3);
    expect(UpdateFireRingCircleOffset).toBe(updateFireRingCircleOffset);
    expect(AnimFireCross).toBe(animFireCross);
    expect(AnimFireSpiralOutward).toBe(animFireSpiralOutward);
    expect(AnimFireSpiralOutward_Step1).toBe(animFireSpiralOutwardStep1);
    expect(AnimFireSpiralOutward_Step2).toBe(animFireSpiralOutwardStep2);
    expect(AnimTask_EruptionLaunchRocks).toBe(animTaskEruptionLaunchRocks);
    expect(AnimTask_EruptionLaunchRocks_Step).toBe(animTaskEruptionLaunchRocksStep);
    expect(CreateEruptionLaunchRocks).toBe(createEruptionLaunchRocks);
    expect(AnimEruptionLaunchRock).toBe(animEruptionLaunchRock);
    expect(GetEruptionLaunchRockInitialYPos).toBe(getEruptionLaunchRockInitialYPos);
    expect(InitEruptionLaunchRockCoordData).toBe(initEruptionLaunchRockCoordData);
    expect(UpdateEruptionLaunchRockPos).toBe(updateEruptionLaunchRockPos);
    expect(AnimEruptionFallingRock).toBe(animEruptionFallingRock);
    expect(AnimEruptionFallingRock_Step).toBe(animEruptionFallingRockStep);
    expect(AnimWillOWispOrb).toBe(animWillOWispOrb);
    expect(AnimWillOWispOrb_Step).toBe(animWillOWispOrbStep);
    expect(AnimWillOWispFire).toBe(animWillOWispFire);
    expect(AnimTask_MoveHeatWaveTargets).toBe(animTaskMoveHeatWaveTargets);
    expect(AnimTask_MoveHeatWaveTargets_Step).toBe(animTaskMoveHeatWaveTargetsStep);
    expect(AnimTask_BlendBackground).toBe(animTaskBlendBackground);
    expect(AnimTask_ShakeTargetInPattern).toBe(animTaskShakeTargetInPattern);
  });

  test('sprite templates preserve fire animation tags and callbacks', () => {
    expect(gFireSpiralInwardSpriteTemplate.callback).toBe('AnimFireSpiralInward');
    expect(gFireSpreadSpriteTemplate.callback).toBe('AnimFireSpread');
    expect(gLargeFlameSpriteTemplate.affineAnims).toHaveLength(1);
    expect(gLargeFlameScatterSpriteTemplate.oam).toBe('gOamData_AffineOff_ObjNormal_32x32');
    expect(gFirePlumeSpriteTemplate.tileTag).toBe('ANIM_TAG_FIRE_PLUME');
    expect(sUnusedEmberFirePlumeSpriteTemplate.callback).toBe('AnimFirePlume');
    expect(sUnusedSmallEmberSpriteTemplate.callback).toBe('AnimUnusedSmallEmber');
    expect(gSunlightRaySpriteTemplate.tileTag).toBe('ANIM_TAG_SUNLIGHT');
    expect(gEmberSpriteTemplate.callback).toBe('TranslateAnimSpriteToTargetMonLocation');
    expect(gEmberFlareSpriteTemplate.callback).toBe('AnimEmberFlare');
    expect(gBurnFlameSpriteTemplate.callback).toBe('AnimBurnFlame');
    expect(gFireBlastRingSpriteTemplate.callback).toBe('AnimFireRing');
    expect(gFireBlastCrossSpriteTemplate.callback).toBe('AnimFireCross');
    expect(gFireSpiralOutwardSpriteTemplate.callback).toBe('AnimFireSpiralOutward');
    expect(gWeatherBallFireDownSpriteTemplate.callback).toBe('AnimWeatherBallDown');
    expect(gEruptionFallingRockSpriteTemplate.callback).toBe('AnimEruptionFallingRock');
    expect(gWillOWispOrbSpriteTemplate.anims).toHaveLength(4);
    expect(gWillOWispFireSpriteTemplate.callback).toBe('AnimWillOWispFire');
  });

  test('simple flame callbacks preserve side offsets, timers, stored callbacks, and destroy conditions', () => {
    const runtime = createFireRuntime({ battleAnimArgs: [7, -3, 6, 4, 2, 1, 0] });
    const inward = createFireSprite();
    animFireSpiralInward(runtime, inward);
    expect(inward.data.slice(0, 5)).toEqual([7, 0x3c, 9, 0x1e, -0x200]);
    expect(inward.callback).toBe('TranslateSpriteInGrowingCircle');
    expect(inward.storedCallback).toBe('DestroyAnimSprite');

    const spread = createFireSprite();
    spread.x = 10;
    spread.y = 20;
    animFireSpread(runtime, spread);
    expect(spread.x).toBe(17);
    expect(spread.y).toBe(17);
    expect(spread.data.slice(0, 3)).toEqual([2, 6, 4]);
    expect(spread.callback).toBe('TranslateSpriteLinearFixedPoint');

    const plumeRuntime = createFireRuntime({ battleAnimArgs: [5, 4, 3, 4, 6, 2], battleAnimAttacker: 1, battlerSides: { 1: B_SIDE_OPPONENT } });
    const plume = createFireSprite();
    animFirePlume(plumeRuntime, plume);
    expect(plume.x).toBe(171);
    expect(plume.y).toBe(52);
    expect(plume.data.slice(1, 5)).toEqual([3, -6, 2, 4]);

    const flame = createFireSprite();
    animLargeFlame(runtime, flame);
    expect(flame.data.slice(1, 5)).toEqual([6, -2, 1, 4]);
    for (let i = 0; i < 6; i++) animLargeFlameStep(flame);
    expect(flame.destroyed).toBe(true);

    const ember = createFireSprite();
    animUnusedSmallEmber(runtime, ember);
    expect(ember.subpriority).toBe(8);
    animUnusedSmallEmberStep(ember);
    expect(ember.data[3]).toBe(0);
    animUnusedSmallEmberStep(ember);
    expect(ember.destroyed).toBe(true);

    const sunlight = createFireSprite();
    animSunlight(sunlight);
    expect(sunlight.data.slice(0, 5)).toEqual([60, 0, 140, 0, 80]);
    expect(sunlight.callback).toBe('StartAnimLinearTranslation');
  });

  test('diagonal travel, fire ring, cross, and outward spiral match callback/data transitions', () => {
    const flareRuntime = createFireRuntime({ battleAnimAttacker: 2, battleAnimTarget: 0, battleAnimArgs: [0, 0, 9] });
    const flare = createFireSprite();
    animEmberFlare(flareRuntime, flare);
    expect(flareRuntime.battleAnimArgs[2]).toBe(-9);
    expect(flare.callback).toBe('AnimTravelDiagonally');

    const burn = createFireSprite();
    animBurnFlame(flareRuntime, burn);
    expect(flareRuntime.battleAnimArgs[0]).toBe(-0);
    expect(flareRuntime.battleAnimArgs[2]).toBe(9);

    const ringRuntime = createFireRuntime({ battleAnimArgs: [0, 0, 0] });
    const ring = createFireSprite();
    animFireRing(ringRuntime, ring);
    for (let i = 0; i < 18; i++) animFireRingStep1(ringRuntime, ring);
    expect(ring.callback).toBe('AnimFireRing_Step2');
    expect(ring.data[0]).toBe(0x19);
    for (let i = 0; i < 25; i++) animFireRingStep2(ringRuntime, ring);
    expect(ring.callback).toBe('AnimFireRing_Step3');
    for (let i = 0; i < 30; i++) animFireRingStep3(ring);
    expect(ring.destroyed).toBe(true);

    const cross = createFireSprite();
    cross.x = 5;
    cross.y = 6;
    flareRuntime.battleAnimArgs = [3, 4, 5, 6, 7];
    animFireCross(flareRuntime, cross);
    expect(cross.x).toBe(8);
    expect(cross.y).toBe(10);
    expect(cross.data.slice(0, 3)).toEqual([5, 6, 7]);
    expect(cross.callback).toBe('TranslateSpriteLinear');

    const outward = createFireSprite();
    flareRuntime.battleAnimArgs = [0, 0, 2, 1];
    animFireSpiralOutward(flareRuntime, outward);
    expect(outward.invisible).toBe(true);
    expect(outward.storedCallback).toBe('AnimFireSpiralOutward_Step1');
    animFireSpiralOutwardStep1(outward);
    expect(outward.callback).toBe('AnimFireSpiralOutward_Step2');
    animFireSpiralOutwardStep2(outward);
    animFireSpiralOutwardStep2(outward);
    expect(outward.destroyed).toBe(true);
  });

  test('eruption launch task, rock creation, and launch-rock physics preserve active counts and offscreen destroy', () => {
    const runtime = createFireRuntime();
    runtime.sprites[0].x = 50;
    runtime.sprites[0].y = 40;
    runtime.sprites[0].centerToCornerVecY = -16;
    const taskId = createFireTask(runtime);
    animTaskEruptionLaunchRocks(runtime, taskId);
    expect(runtime.tasks[taskId]?.data.slice(0, 7)).toEqual([0, 0, 0, 0, 40, 0, 0]);
    animTaskEruptionLaunchRocksStep(runtime, taskId);
    expect(runtime.tasks[taskId]?.data[0]).toBe(1);

    expect(getEruptionLaunchRockInitialYPos(runtime, 0)).toBe(98);
    createEruptionLaunchRocks(runtime, 0, taskId, 6);
    const rocks = runtime.sprites.filter((sprite) => sprite.callback === 'AnimEruptionLaunchRock');
    expect(rocks).toHaveLength(7);
    expect(runtime.tasks[taskId]?.data[6]).toBe(7);
    expect(rocks[0].oam.tileNum).toBe(0x40);
    expect(rocks[0].data.slice(2, 6)).toEqual([38 * 8, 98 * 8, sEruptionLaunchRockSpeeds[0][0] * 8, sEruptionLaunchRockSpeeds[0][1] * 8]);

    const rock = rocks[0];
    initEruptionLaunchRockCoordData(rock, -20, 0);
    for (let i = 0; i < 4; i++) updateEruptionLaunchRockPos(rock);
    expect(rock.x).toBeLessThan(38);
    rock.x = -9;
    rock.data[2] = -9 * 8;
    animEruptionLaunchRock(runtime, rock);
    expect(rock.destroyed).toBe(true);
    expect(runtime.tasks[taskId]?.data[6]).toBe(6);
  });

  test('eruption falling rock waits, falls, bounces, and destroys after landing timer', () => {
    const runtime = createFireRuntime({ battleAnimArgs: [20, 0, 2, 18, 3] });
    const rock = createFireSprite();
    animEruptionFallingRock(runtime, rock);
    expect(rock.oam.tileNum).toBe(48);
    animEruptionFallingRockStep(rock);
    expect(rock.y).toBe(0);
    animEruptionFallingRockStep(rock);
    animEruptionFallingRockStep(rock);
    expect(rock.y).toBe(8);
    animEruptionFallingRockStep(rock);
    animEruptionFallingRockStep(rock);
    expect(rock.y).toBe(18);
    for (let i = 0; i < 17; i++) animEruptionFallingRockStep(rock);
    expect(rock.destroyed).toBe(true);
  });

  test('Will-O-Wisp orb and fire preserve staged movement, priority changes, sound trigger, blinking, and destroy', () => {
    const runtime = createFireRuntime({ battleAnimArgs: [0, 0, 0], animCustomPanning: -12 });
    const orb = createFireSprite();
    animWillOWispOrb(runtime, orb);
    expect(orb.animIndex).toBe(0);
    expect(orb.data[4]).toBe(-4);
    animWillOWispOrb(runtime, orb);
    expect(orb.data[0]).toBe(2);
    for (let i = 0; i < 31; i++) animWillOWispOrb(runtime, orb);
    expect(orb.callback).toBe('AnimWillOWispOrb_Step');
    expect(orb.data[2]).toBe(176);
    animWillOWispOrbStep(runtime, orb);
    expect(runtime.sounds).toEqual([{ song: SE_M_FLAME_WHEEL, pan: -12 }]);

    const fire = createFireSprite();
    runtime.battleAnimArgs[0] = 0;
    for (let i = 0; i < 21; i++) animWillOWispFire(runtime, fire);
    expect(fire.invisible).toBe(true);
    for (let i = 0; i < 9; i++) animWillOWispFire(runtime, fire);
    expect(fire.destroyed).toBe(true);

    const contest = createFireRuntime({ contest: true, battleAnimArgs: [0] });
    const contestFire = createFireSprite();
    animWillOWispFire(contest, contestFire);
    expect(contestFire.subpriority).toBe(0x1d);
  });

  test('heat wave target movement, background blend, and shake patterns preserve task globals', () => {
    const runtime = createFireRuntime();
    const heatTask = createFireTask(runtime);
    animTaskMoveHeatWaveTargets(runtime, heatTask);
    expect(runtime.tasks[heatTask]?.data.slice(12, 16)).toEqual([1, 2, 1, 3]);
    animTaskMoveHeatWaveTargetsStep(runtime, heatTask);
    expect(runtime.sprites[1].x2).toBe(2);
    expect(runtime.sprites[3].x2).toBe(2);
    for (let i = 0; i < 16 + 96 + 16 + 1; i++) animTaskMoveHeatWaveTargetsStep(runtime, heatTask);
    expect(runtime.sprites[1].x2).toBe(0);
    expect(runtime.tasks[heatTask]?.destroyed).toBe(true);

    const bgTask = createFireTask(runtime);
    runtime.battleAnimArgs = [5, 0x1234];
    animTaskBlendBackground(runtime, bgTask);
    expect(runtime.blends.at(-1)).toEqual({ offset: 16, size: 16, coeff: 5, color: 0x1234 });
    expect(runtime.tasks[bgTask]?.destroyed).toBe(true);

    const shakeTask = createFireTask(runtime);
    runtime.battleAnimArgs = [3, 4, 0, 0];
    animTaskShakeTargetInPattern(runtime, shakeTask);
    expect(runtime.sprites[1].x2).toBe(4 * sShakeDirsPattern0[1]);
    animTaskShakeTargetInPattern(runtime, shakeTask);
    expect(runtime.sprites[1].x2).toBe(4 * sShakeDirsPattern0[2]);
    animTaskShakeTargetInPattern(runtime, shakeTask);
    expect(runtime.sprites[1].x2).toBe(0);
    expect(runtime.tasks[shakeTask]?.destroyed).toBe(true);

    const verticalTask = createFireTask(runtime);
    runtime.battleAnimArgs = [2, 5, 1, 1];
    animTaskShakeTargetInPattern(runtime, verticalTask);
    expect(runtime.sprites[1].y2).toBe(Math.abs(5 * sShakeDirsPattern1[1]));
  });
});
