import { describe, expect, test } from 'vitest';
import * as water from '../src/game/decompBattleAnimWater';
import {
  animAuroraBeamRings,
  animAuroraBeamRingsStep,
  animHydroCannonBeam,
  animHydroCannonCharge,
  animHydroCannonChargeStep,
  animRainDrop,
  animRainDropStep,
  animSmallBubblePair,
  animSmallBubblePairStep,
  animSmallDriftingBubbles,
  animSmallDriftingBubblesStep,
  animSmallWaterOrb,
  animTaskCreateRaindrops,
  animTaskCreateSurfWave,
  animTaskCreateSurfWaveStep1,
  animTaskCreateSurfWaveStep2,
  animTaskRotateAuroraRingColors,
  animTaskRotateAuroraRingColorsStep,
  animTaskRunSinAnimTimer,
  animTaskStartSinAnimTimer,
  animTaskSurfWaveScanlineEffect,
  animTaskWaterSport,
  animTaskWaterSportStep,
  animTaskWaterSpoutLaunch,
  animTaskWaterSpoutLaunchStep,
  animTaskWaterSpoutRain,
  animTaskWaterSpoutRainStep,
  animToTargetInSinWave,
  animToTargetInSinWaveStep,
  animWaterBubbleProjectile,
  animWaterBubbleProjectileStep1,
  animWaterBubbleProjectileStep2,
  animWaterBubbleProjectileStep3,
  animWaterGunDroplet,
  animWaterPulseBubble,
  animWaterPulseBubbleStep,
  animWaterPulseRing,
  animWaterPulseRingBubble,
  animWaterPulseRingStep,
  animWaterSportDroplet,
  animWaterSportDropletStep,
  animWaterSpoutRain,
  animWaterSpoutRainHit,
  createWaterRuntime,
  createWaterSprite,
  createWaterTask,
  createWaterPulseRingBubbles,
  createWaterSportDroplet,
  createWaterSpoutLaunchDroplets,
  createWaterSpoutRainDroplet,
  gAuroraBeamRingSpriteTemplate,
  gFlamethrowerFlameSpriteTemplate,
  gHydroCannonBeamSpriteTemplate,
  gHydroCannonChargeSpriteTemplate,
  gHydroPumpOrbSpriteTemplate,
  gMudShotOrbSpriteTemplate,
  gPsywaveRingSpriteTemplate,
  gRainDropSpriteTemplate,
  gSignalBeamGreenOrbSpriteTemplate,
  gSignalBeamRedOrbSpriteTemplate,
  gSmallBubblePairSpriteTemplate,
  gSmallDriftingBubblesSpriteTemplate,
  gSmallWaterOrbSpriteTemplate,
  gWaterBubbleProjectileSpriteTemplate,
  gWaterGunDropletSpriteTemplate,
  gWaterGunProjectileSpriteTemplate,
  gWaterPulseBubbleSpriteTemplate,
  gWaterPulseRingBubbleSpriteTemplate,
  gWeatherBallWaterDownSpriteTemplate,
  getWaterSpoutPowerForAnim
} from '../src/game/decompBattleAnimWater';

describe('decomp battle_anim_water.c parity', () => {
  test('exports exact C callback, task, and helper names as aliases of the implemented logic', () => {
    expect(water.AnimTask_CreateRaindrops).toBe(water.animTaskCreateRaindrops);
    expect(water.AnimRainDrop).toBe(water.animRainDrop);
    expect(water.AnimRainDrop_Step).toBe(water.animRainDropStep);
    expect(water.AnimWaterBubbleProjectile).toBe(water.animWaterBubbleProjectile);
    expect(water.AnimWaterBubbleProjectile_Step1).toBe(water.animWaterBubbleProjectileStep1);
    expect(water.AnimWaterBubbleProjectile_Step2).toBe(water.animWaterBubbleProjectileStep2);
    expect(water.AnimWaterBubbleProjectile_Step3).toBe(water.animWaterBubbleProjectileStep3);
    expect(water.AnimAuroraBeamRings).toBe(water.animAuroraBeamRings);
    expect(water.AnimAuroraBeamRings_Step).toBe(water.animAuroraBeamRingsStep);
    expect(water.AnimTask_RotateAuroraRingColors).toBe(water.animTaskRotateAuroraRingColors);
    expect(water.AnimTask_RotateAuroraRingColors_Step).toBe(water.animTaskRotateAuroraRingColorsStep);
    expect(water.AnimToTargetInSinWave).toBe(water.animToTargetInSinWave);
    expect(water.AnimToTargetInSinWave_Step).toBe(water.animToTargetInSinWaveStep);
    expect(water.AnimTask_StartSinAnimTimer).toBe(water.animTaskStartSinAnimTimer);
    expect(water.AnimTask_RunSinAnimTimer).toBe(water.animTaskRunSinAnimTimer);
    expect(water.AnimHydroCannonCharge).toBe(water.animHydroCannonCharge);
    expect(water.AnimHydroCannonCharge_Step).toBe(water.animHydroCannonChargeStep);
    expect(water.AnimHydroCannonBeam).toBe(water.animHydroCannonBeam);
    expect(water.AnimWaterGunDroplet).toBe(water.animWaterGunDroplet);
    expect(water.AnimSmallBubblePair).toBe(water.animSmallBubblePair);
    expect(water.AnimSmallBubblePair_Step).toBe(water.animSmallBubblePairStep);
    expect(water.AnimTask_CreateSurfWave).toBe(water.animTaskCreateSurfWave);
    expect(water.AnimTask_CreateSurfWave_Step1).toBe(water.animTaskCreateSurfWaveStep1);
    expect(water.AnimTask_CreateSurfWave_Step2).toBe(water.animTaskCreateSurfWaveStep2);
    expect(water.AnimTask_SurfWaveScanlineEffect).toBe(water.animTaskSurfWaveScanlineEffect);
    expect(water.AnimSmallDriftingBubbles).toBe(water.animSmallDriftingBubbles);
    expect(water.AnimSmallDriftingBubbles_Step).toBe(water.animSmallDriftingBubblesStep);
    expect(water.AnimTask_WaterSpoutLaunch).toBe(water.animTaskWaterSpoutLaunch);
    expect(water.AnimTask_WaterSpoutLaunch_Step).toBe(water.animTaskWaterSpoutLaunchStep);
    expect(water.GetWaterSpoutPowerForAnim).toBe(water.getWaterSpoutPowerForAnim);
    expect(water.CreateWaterSpoutLaunchDroplets).toBe(water.createWaterSpoutLaunchDroplets);
    expect(water.AnimSmallWaterOrb).toBe(water.animSmallWaterOrb);
    expect(water.AnimTask_WaterSpoutRain).toBe(water.animTaskWaterSpoutRain);
    expect(water.AnimTask_WaterSpoutRain_Step).toBe(water.animTaskWaterSpoutRainStep);
    expect(water.CreateWaterSpoutRainDroplet).toBe(water.createWaterSpoutRainDroplet);
    expect(water.AnimWaterSpoutRain).toBe(water.animWaterSpoutRain);
    expect(water.AnimWaterSpoutRainHit).toBe(water.animWaterSpoutRainHit);
    expect(water.AnimTask_WaterSport).toBe(water.animTaskWaterSport);
    expect(water.AnimTask_WaterSport_Step).toBe(water.animTaskWaterSportStep);
    expect(water.CreateWaterSportDroplet).toBe(water.createWaterSportDroplet);
    expect(water.AnimWaterSportDroplet).toBe(water.animWaterSportDroplet);
    expect(water.AnimWaterSportDroplet_Step).toBe(water.animWaterSportDropletStep);
    expect(water.AnimWaterPulseBubble).toBe(water.animWaterPulseBubble);
    expect(water.AnimWaterPulseBubble_Step).toBe(water.animWaterPulseBubbleStep);
    expect(water.AnimWaterPulseRingBubble).toBe(water.animWaterPulseRingBubble);
    expect(water.AnimWaterPulseRing).toBe(water.animWaterPulseRing);
    expect(water.AnimWaterPulseRing_Step).toBe(water.animWaterPulseRingStep);
    expect(water.CreateWaterPulseRingBubbles).toBe(water.createWaterPulseRingBubbles);
  });

  test('sprite templates preserve water animation tags and callbacks', () => {
    expect(gRainDropSpriteTemplate.callback).toBe('AnimRainDrop');
    expect(gWaterBubbleProjectileSpriteTemplate.affineAnims).toHaveLength(1);
    expect(gAuroraBeamRingSpriteTemplate.callback).toBe('AnimAuroraBeamRings');
    expect(gHydroPumpOrbSpriteTemplate.callback).toBe('AnimToTargetInSinWave');
    expect(gMudShotOrbSpriteTemplate.tileTag).toBe('ANIM_TAG_BROWN_ORB');
    expect(gSignalBeamRedOrbSpriteTemplate.tileTag).toBe('ANIM_TAG_GLOWY_RED_ORB');
    expect(gSignalBeamGreenOrbSpriteTemplate.tileTag).toBe('ANIM_TAG_GLOWY_GREEN_ORB');
    expect(gFlamethrowerFlameSpriteTemplate.callback).toBe('AnimToTargetInSinWave');
    expect(gPsywaveRingSpriteTemplate.affineAnims).toBe('gGrowingRingAffineAnimTable');
    expect(gHydroCannonChargeSpriteTemplate.callback).toBe('AnimHydroCannonCharge');
    expect(gHydroCannonBeamSpriteTemplate.callback).toBe('AnimHydroCannonBeam');
    expect(gWaterGunProjectileSpriteTemplate.callback).toBe('AnimThrowProjectile');
    expect(gWaterGunDropletSpriteTemplate.callback).toBe('AnimWaterGunDroplet');
    expect(gSmallBubblePairSpriteTemplate.tileTag).toBe('ANIM_TAG_ICE_CRYSTALS');
    expect(gSmallDriftingBubblesSpriteTemplate.callback).toBe('AnimSmallDriftingBubbles');
    expect(gSmallWaterOrbSpriteTemplate.callback).toBe('AnimSmallWaterOrb');
    expect(gWaterPulseBubbleSpriteTemplate.callback).toBe('AnimWaterPulseBubble');
    expect(gWaterPulseRingBubbleSpriteTemplate.callback).toBe('AnimWaterPulseRingBubble');
    expect(gWeatherBallWaterDownSpriteTemplate.callback).toBe('AnimWeatherBallDown');
  });

  test('raindrops, bubble projectile, aurora rings, palette rotation, and sine timer match counters', () => {
    const runtime = createWaterRuntime({ battleAnimArgs: [0, 2, 5], randomValues: [9, 17] });
    const rainTask = createWaterTask(runtime);
    for (let i = 0; i < 5; i++) animTaskCreateRaindrops(runtime, rainTask);
    expect(runtime.tasks[rainTask]?.destroyed).toBe(true);
    expect(runtime.operations.some((op) => op.startsWith('CreateSprite:AnimRainDrop'))).toBe(true);

    const drop = createWaterSprite();
    animRainDrop(drop);
    expect(drop.callback).toBe('AnimRainDrop_Step');
    for (let i = 0; i < 13; i++) animRainDropStep(drop);
    expect(drop.x2).toBe(13);
    drop.animEnded = true;
    animRainDropStep(drop);
    expect(drop.destroyed).toBe(true);

    runtime.battleAnimArgs = [4, 5, 6, 7, 8, 256, 3];
    const bubble = createWaterSprite();
    animWaterBubbleProjectile(runtime, bubble);
    expect(bubble.callback).toBe('AnimWaterBubbleProjectile_Step1');
    expect(bubble.animPaused).toBe(true);
    for (let i = 0; i < 3; i++) animWaterBubbleProjectileStep1(runtime, bubble);
    expect(bubble.callback).toBe('AnimWaterBubbleProjectile_Step2');
    animWaterBubbleProjectileStep2(bubble);
    expect(bubble.storedCallback).toBe('AnimWaterBubbleProjectile_Step3');
    animWaterBubbleProjectileStep3(bubble);
    expect(bubble.storedCallback).toBe('DestroySpriteAndMatrix');

    runtime.battleAnimArgs = [2, 3, 4, 5, 6, 0, 0, 0xffff];
    const aurora = createWaterSprite();
    animAuroraBeamRings(runtime, aurora);
    expect(aurora.affineAnimPaused).toBe(false);
    for (let i = 0; i < 7; i++) animAuroraBeamRingsStep(runtime, aurora);
    expect(aurora.destroyed).toBe(true);

    const palTask = createWaterTask(runtime);
    runtime.battleAnimArgs = [4];
    const old = runtime.plttBufferFaded[0x100 + 3 * 16 + 1];
    animTaskRotateAuroraRingColors(runtime, palTask);
    for (let i = 0; i < 3; i++) animTaskRotateAuroraRingColorsStep(runtime, palTask);
    expect(runtime.plttBufferFaded[0x100 + 3 * 16 + 8]).toBe(old);

    const sinTask = createWaterTask(runtime);
    runtime.battleAnimArgs = [3, 0, 0, 0, 0, 0, 0, 88];
    animTaskStartSinAnimTimer(runtime, sinTask);
    for (let i = 0; i < 3; i++) animTaskRunSinAnimTimer(runtime, sinTask);
    expect(runtime.battleAnimArgs[7]).toBe(9);
    expect(runtime.tasks[sinTask]?.destroyed).toBe(true);
  });

  test('sine wave projectiles, hydro cannon, droplets, bubbles, and surf task preserve phases', () => {
    const runtime = createWaterRuntime({ battleAnimArgs: [3, 4, 5, 6, 7, 0, 0, 130] });
    const sine = createWaterSprite();
    animToTargetInSinWave(runtime, sine);
    expect(sine.callback).toBe('AnimToTargetInSinWave_Step');
    expect(sine.data[7]).toBe(-6);
    for (let i = 0; i < 31; i++) animToTargetInSinWaveStep(sine);
    expect(sine.destroyed).toBe(true);

    const charge = createWaterSprite();
    animHydroCannonCharge(runtime, charge);
    expect(charge.x2).toBe(10);
    charge.affineAnimEnded = true;
    animHydroCannonChargeStep(charge);
    expect(charge.destroyed).toBe(true);

    runtime.battleAnimArgs = [2, 3, 4, 5, 6, 0];
    const beam = createWaterSprite();
    animHydroCannonBeam(runtime, beam);
    expect(beam.callback).toBe('StartAnimLinearTranslation');
    expect(beam.storedCallback).toBe('DestroyAnimSprite');

    const droplet = createWaterSprite();
    animWaterGunDroplet(runtime, droplet);
    expect(droplet.callback).toBe('StartAnimLinearTranslation');
    expect(droplet.data[4]).toBe(droplet.y + runtime.battleAnimArgs[4]);

    const pair = createWaterSprite();
    runtime.battleAnimArgs = [1, 2, 2, 0];
    animSmallBubblePair(runtime, pair);
    animSmallBubblePairStep(pair);
    animSmallBubblePairStep(pair);
    animSmallBubblePairStep(pair);
    expect(pair.destroyed).toBe(true);

    const drift = createWaterSprite();
    runtime.randomValues = [0x101, 0x1ff];
    animSmallDriftingBubbles(runtime, drift);
    expect(drift.data[1]).toBe(0x101);
    expect(drift.data[2]).toBe(-255);
    for (let i = 0; i < 21; i++) animSmallDriftingBubblesStep(drift);
    expect(drift.destroyed).toBe(true);

    const surf = createWaterTask(runtime);
    runtime.battleAnimArgs = [0];
    animTaskCreateSurfWave(runtime, surf);
    expect(runtime.tasks[surf]?.func).toBe('AnimTask_CreateSurfWave_Step1');
    const scanline = runtime.tasks[surf]!.data[15];
    animTaskSurfWaveScanlineEffect(runtime, scanline);
    expect(runtime.tasks[scanline]?.data[0]).toBe(1);
    for (let i = 0; i < 160 && runtime.tasks[surf]?.func === 'AnimTask_CreateSurfWave_Step1'; i++) animTaskCreateSurfWaveStep1(runtime, surf);
    expect(runtime.tasks[surf]?.func).toBe('AnimTask_CreateSurfWave_Step2');
    animTaskCreateSurfWaveStep2(runtime, surf);
    animTaskCreateSurfWaveStep2(runtime, surf);
    expect(runtime.tasks[surf]?.destroyed).toBe(true);
    for (let i = 0; i < 80 && !runtime.tasks[scanline]?.destroyed; i++) animTaskSurfWaveScanlineEffect(runtime, scanline);
    expect(runtime.tasks[scanline]?.destroyed).toBe(true);
  });

  test('water spout launch/rain, water sport, and pulse rings keep C lifecycle data', () => {
    const runtime = createWaterRuntime({ playerParty: [{ hp: 20, maxHp: 100 }], randomValues: [1, 2, 3, 4, 5, 6] });
    expect(getWaterSpoutPowerForAnim(runtime)).toBe(0);
    runtime.playerParty[0].hp = 100;
    expect(getWaterSpoutPowerForAnim(runtime)).toBe(3);

    const launch = createWaterTask(runtime);
    animTaskWaterSpoutLaunch(runtime, launch);
    for (let i = 0; i < 90 && !runtime.tasks[launch]?.destroyed; i++) animTaskWaterSpoutLaunchStep(runtime, launch);
    expect(runtime.tasks[launch]?.data[0]).toBeGreaterThanOrEqual(7);
    const launchTask = runtime.tasks[launch]!;
    createWaterSpoutLaunchDroplets(runtime, launchTask, launch);
    expect(launchTask.data[2]).toBeGreaterThan(0);
    const orb = runtime.sprites.find((sprite) => sprite.callback === 'AnimSmallWaterOrb')!;
    orb.data[2] = 300 * 16;
    animSmallWaterOrb(runtime, orb);
    expect(orb.destroyed).toBe(true);

    const rain = createWaterTask(runtime);
    animTaskWaterSpoutRain(runtime, rain);
    createWaterSpoutRainDroplet(runtime, runtime.tasks[rain]!, rain);
    const rainDrop = runtime.sprites.find((sprite) => sprite.callback === 'AnimWaterSpoutRain')!;
    rainDrop.y = rainDrop.data[5];
    animWaterSpoutRain(runtime, rainDrop);
    const hit = runtime.sprites.find((sprite) => sprite.callback === 'AnimWaterSpoutRainHit')!;
    for (let i = 0; i < 24; i++) animWaterSpoutRainHit(runtime, hit);
    expect(hit.destroyed).toBe(true);
    for (let i = 0; i < 30 && !runtime.tasks[rain]?.destroyed; i++) animTaskWaterSpoutRainStep(runtime, rain);
    expect(runtime.tasks[rain]?.func).toBe('AnimTask_WaterSpoutRain_Step');

    const sport = createWaterTask(runtime);
    animTaskWaterSport(runtime, sport);
    createWaterSportDroplet(runtime, runtime.tasks[sport]!, sport);
    createWaterSportDroplet(runtime, runtime.tasks[sport]!, sport);
    const sportDrop = runtime.sprites.find((sprite) => sprite.callback === 'AnimWaterSportDroplet')!;
    sportDrop.data[0] = 0;
    animWaterSportDroplet(runtime, sportDrop);
    expect(sportDrop.callback).toBe('AnimWaterSportDroplet_Step');
    sportDrop.data[0] = 0;
    animWaterSportDropletStep(runtime, sportDrop);
    expect(runtime.tasks[sport]?.data[10]).toBe(1);
    runtime.tasks[sport]!.data[0] = 6;
    runtime.tasks[sport]!.data[8] = 0;
    animTaskWaterSportStep(runtime, sport);
    animTaskWaterSportStep(runtime, sport);
    expect(runtime.tasks[sport]?.destroyed).toBe(true);

    const pulse = createWaterSprite();
    runtime.battleAnimArgs = [10, 20, 4, 8, 6, 3];
    animWaterPulseBubble(runtime, pulse);
    for (let i = 0; i < 3; i++) animWaterPulseBubbleStep(pulse);
    expect(pulse.destroyed).toBe(true);

    const ringBubble = createWaterSprite();
    ringBubble.data[0] = 1;
    ringBubble.data[1] = 128;
    ringBubble.data[2] = -128;
    animWaterPulseRingBubble(ringBubble);
    expect(ringBubble.destroyed).toBe(true);

    const ring = createWaterSprite();
    runtime.battleAnimArgs = [0, 0, 4, 2];
    runtime.randomValues = [5, 8, 2, 1];
    animWaterPulseRing(runtime, ring);
    for (let i = 0; i < 5; i++) animWaterPulseRingStep(runtime, ring);
    expect(ring.destroyed).toBe(true);
    createWaterPulseRingBubbles(runtime, ring, 10, -5);
    expect(runtime.operations.filter((op) => op.startsWith('CreateSprite:AnimWaterPulseRingBubble')).length).toBeGreaterThanOrEqual(2);
  });
});
