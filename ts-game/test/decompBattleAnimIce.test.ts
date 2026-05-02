import { describe, expect, test } from 'vitest';
import {
  AnimFlickerIceEffectParticle,
  AnimHailBegin,
  AnimHailContinue,
  AnimIceBallParticle,
  AnimIceBeamParticle,
  AnimIceEffectParticle,
  AnimIcePunchSwirlingParticle,
  AnimMoveParticleBeyondTarget,
  AnimSwirlingFogAnim,
  AnimSwirlingSnowball,
  AnimSwirlingSnowball_End,
  AnimSwirlingSnowball_Step1,
  AnimSwirlingSnowball_Step2,
  AnimTask_GetRolloutCounter,
  AnimTask_Hail,
  AnimTask_Hail2,
  AnimTask_HazeScrollingFog,
  AnimTask_HazeScrollingFog_Step,
  AnimTask_MistBallFog,
  AnimTask_MistBallFog_Step,
  AnimThrowIceBall,
  AnimThrowMistBall,
  AnimUnusedIceCrystalThrow,
  AnimUnusedIceCrystalThrow_Step,
  AnimWaveFromCenterOfTarget,
  AnimWiggleParticleTowardsTarget,
  B_SIDE_PLAYER,
  GenerateHailParticle,
  InitIceBallAnim,
  InitIceBallParticle,
  InitPoisonGasCloudAnim,
  InitSwirlingFogAnim,
  MovePoisonGasCloud,
  animFlickerIceEffectParticle,
  animHailBegin,
  animHailContinue,
  animIceBallParticle,
  animIceBeamParticle,
  animIceEffectParticle,
  animIcePunchSwirlingParticle,
  animMoveParticleBeyondTarget,
  animSwirlingFogAnim,
  animSwirlingSnowball,
  animSwirlingSnowballEnd,
  animSwirlingSnowballStep1,
  animSwirlingSnowballStep2,
  animTaskGetRolloutCounter,
  animTaskHail,
  animTaskHail2,
  animTaskHazeScrollingFog,
  animTaskHazeScrollingFogStep,
  animTaskMistBallFog,
  animTaskMistBallFogStep,
  animThrowIceBall,
  animThrowMistBall,
  animUnusedIceCrystalThrow,
  animUnusedIceCrystalThrowStep,
  animWaveFromCenterOfTarget,
  animWiggleParticleTowardsTarget,
  createIceRuntime,
  createIceSprite,
  createIceTask,
  gBlizzardIceCrystalSpriteTemplate,
  gIceBallChunkSpriteTemplate,
  gIceBallImpactShardSpriteTemplate,
  gIceBeamInnerCrystalSpriteTemplate,
  gIceBeamOuterCrystalSpriteTemplate,
  gIceCrystalHitLargeSpriteTemplate,
  gIceCrystalHitSmallSpriteTemplate,
  gIceCrystalSpiralInwardLarge,
  gIceCrystalSpiralInwardSmall,
  gIceGroundSpikeSpriteTemplate,
  gMistBallSpriteTemplate,
  gMistCloudSpriteTemplate,
  gPoisonGasCloudSpriteTemplate,
  gPowderSnowSnowballSpriteTemplate,
  gSmogCloudSpriteTemplate,
  gSwirlingSnowballSpriteTemplate,
  gWeatherBallIceDownSpriteTemplate,
  generateHailParticle,
  initIceBallAnim,
  initIceBallParticle,
  initPoisonGasCloudAnim,
  initSwirlingFogAnim,
  movePoisonGasCloud,
  sHailCoordData,
  sUnusedIceCrystalThrowSpriteTemplate
} from '../src/game/decompBattleAnimIce';

describe('decomp battle_anim_ice.c parity', () => {
  test('exports exact C callback and task names as aliases of the implemented logic', () => {
    expect(AnimUnusedIceCrystalThrow).toBe(animUnusedIceCrystalThrow);
    expect(AnimUnusedIceCrystalThrow_Step).toBe(animUnusedIceCrystalThrowStep);
    expect(AnimIcePunchSwirlingParticle).toBe(animIcePunchSwirlingParticle);
    expect(AnimIceBeamParticle).toBe(animIceBeamParticle);
    expect(AnimIceEffectParticle).toBe(animIceEffectParticle);
    expect(AnimFlickerIceEffectParticle).toBe(animFlickerIceEffectParticle);
    expect(AnimSwirlingSnowball).toBe(animSwirlingSnowball);
    expect(AnimSwirlingSnowball_Step1).toBe(animSwirlingSnowballStep1);
    expect(AnimSwirlingSnowball_Step2).toBe(animSwirlingSnowballStep2);
    expect(AnimSwirlingSnowball_End).toBe(animSwirlingSnowballEnd);
    expect(AnimMoveParticleBeyondTarget).toBe(animMoveParticleBeyondTarget);
    expect(AnimWiggleParticleTowardsTarget).toBe(animWiggleParticleTowardsTarget);
    expect(AnimWaveFromCenterOfTarget).toBe(animWaveFromCenterOfTarget);
    expect(InitSwirlingFogAnim).toBe(initSwirlingFogAnim);
    expect(AnimSwirlingFogAnim).toBe(animSwirlingFogAnim);
    expect(AnimTask_HazeScrollingFog).toBe(animTaskHazeScrollingFog);
    expect(AnimTask_HazeScrollingFog_Step).toBe(animTaskHazeScrollingFogStep);
    expect(AnimThrowMistBall).toBe(animThrowMistBall);
    expect(AnimTask_MistBallFog).toBe(animTaskMistBallFog);
    expect(AnimTask_MistBallFog_Step).toBe(animTaskMistBallFogStep);
    expect(InitPoisonGasCloudAnim).toBe(initPoisonGasCloudAnim);
    expect(MovePoisonGasCloud).toBe(movePoisonGasCloud);
    expect(AnimTask_Hail).toBe(animTaskHail);
    expect(AnimTask_Hail2).toBe(animTaskHail2);
    expect(GenerateHailParticle).toBe(generateHailParticle);
    expect(AnimHailBegin).toBe(animHailBegin);
    expect(AnimHailContinue).toBe(animHailContinue);
    expect(InitIceBallAnim).toBe(initIceBallAnim);
    expect(AnimThrowIceBall).toBe(animThrowIceBall);
    expect(InitIceBallParticle).toBe(initIceBallParticle);
    expect(AnimIceBallParticle).toBe(animIceBallParticle);
    expect(AnimTask_GetRolloutCounter).toBe(animTaskGetRolloutCounter);
  });

  test('sprite templates preserve ice animation tags and callbacks', () => {
    expect(sUnusedIceCrystalThrowSpriteTemplate.callback).toBe('AnimUnusedIceCrystalThrow');
    expect(gIceCrystalSpiralInwardLarge.callback).toBe('AnimIcePunchSwirlingParticle');
    expect(gIceCrystalSpiralInwardSmall.oam).toBe('gOamData_AffineOff_ObjBlend_8x8');
    expect(gIceBeamInnerCrystalSpriteTemplate.callback).toBe('AnimIceBeamParticle');
    expect(gIceBeamOuterCrystalSpriteTemplate.anims).toHaveLength(1);
    expect(gIceCrystalHitLargeSpriteTemplate.callback).toBe('AnimIceEffectParticle');
    expect(gIceCrystalHitSmallSpriteTemplate.affineAnims).toHaveLength(1);
    expect(gSwirlingSnowballSpriteTemplate.callback).toBe('AnimSwirlingSnowball');
    expect(gBlizzardIceCrystalSpriteTemplate.callback).toBe('AnimMoveParticleBeyondTarget');
    expect(gPowderSnowSnowballSpriteTemplate.tileTag).toBe('ANIM_TAG_ICE_CRYSTALS');
    expect(gIceGroundSpikeSpriteTemplate.callback).toBe('AnimWaveFromCenterOfTarget');
    expect(gMistCloudSpriteTemplate.callback).toBe('InitSwirlingFogAnim');
    expect(gSmogCloudSpriteTemplate.tileTag).toBe('ANIM_TAG_PURPLE_GAS_CLOUD');
    expect(gMistBallSpriteTemplate.callback).toBe('AnimThrowMistBall');
    expect(gPoisonGasCloudSpriteTemplate.callback).toBe('InitPoisonGasCloudAnim');
    expect(gWeatherBallIceDownSpriteTemplate.callback).toBe('AnimWeatherBallDown');
    expect(gIceBallChunkSpriteTemplate.callback).toBe('InitIceBallAnim');
    expect(gIceBallImpactShardSpriteTemplate.callback).toBe('InitIceBallParticle');
    expect(sHailCoordData).toHaveLength(10);
  });

  test('ice crystal throw, punch swirl, beam, hit flicker, and wave particle preserve data mutation', () => {
    const runtime = createIceRuntime({ battleAnimArgs: [4, 5, -8, 3, 6, 7, 9] });
    const thrown = createIceSprite();
    animUnusedIceCrystalThrow(runtime, thrown);
    expect(thrown.oam.tileNum).toBe(7);
    expect(thrown.callback).toBe('AnimUnusedIceCrystalThrow_Step');
    expect(thrown.data[0]).toBe(6);
    animUnusedIceCrystalThrowStep(thrown);
    expect(thrown.data[0]).toBe(5);
    while (!thrown.destroyed) animUnusedIceCrystalThrowStep(thrown);
    expect(thrown.destroyed).toBe(true);

    const swirl = createIceSprite();
    animIcePunchSwirlingParticle(swirl, [64]);
    expect(swirl.callback).toBe('TranslateSpriteInGrowingCircle');
    expect(swirl.storedCallback).toBe('DestroyAnimSprite');

    runtime.battleAnimArgs = [2, 3, 5, -4, 8];
    const beam = createIceSprite();
    animIceBeamParticle(runtime, beam);
    expect(beam.x).toBe(50);
    expect(beam.y).toBe(67);
    expect(beam.data[0]).toBe(8);
    expect(beam.data[2]).toBe(181);
    expect(beam.callback).toBe('StartAnimLinearTranslation');

    const effect = createIceSprite();
    runtime.battleAnimArgs = [6, 7, 1];
    animIceEffectParticle(runtime, effect);
    expect(effect.x).toBe(182);
    expect(effect.y).toBe(55);
    expect(effect.storedCallback).toBe('AnimFlickerIceEffectParticle');
    for (let i = 0; i < 20; i++) animFlickerIceEffectParticle(effect);
    expect(effect.destroyed).toBe(true);

    const wave = createIceSprite();
    runtime.battleAnimArgs = [1, 2, 0];
    animWaveFromCenterOfTarget(runtime, wave);
    expect(wave.data[0]).toBe(1);
    wave.animEnded = true;
    animWaveFromCenterOfTarget(runtime, wave);
    expect(wave.destroyed).toBe(true);
  });

  test('snowballs, move-beyond-target, swirling fog, mist ball, and poison gas keep callback phases', () => {
    const runtime = createIceRuntime({ battleAnimArgs: [4, 5, 6, -2, 12, 0, 4, 0] });
    const snow = createIceSprite();
    animSwirlingSnowball(runtime, snow);
    expect(snow.callback).toBe('InitAnimFastLinearTranslationWithSpeedAndPos');
    animSwirlingSnowballStep1(runtime, snow);
    expect(snow.callback).toBe('AnimSwirlingSnowball_Step2');
    for (let i = 0; i < 32; i++) animSwirlingSnowballStep2(runtime, snow);
    animSwirlingSnowballStep2(runtime, snow);
    expect(snow.callback).toBe('AnimSwirlingSnowball_End');
    snow.x = 280;
    animSwirlingSnowballEnd(snow);
    expect(snow.destroyed).toBe(true);

    const beyond = createIceSprite();
    runtime.battleAnimArgs = [3, 4, 5, 6, 10, 7, 8, 0];
    animMoveParticleBeyondTarget(runtime, beyond);
    expect(beyond.callback).toBe('AnimWiggleParticleTowardsTarget');
    animWiggleParticleTowardsTarget(beyond);
    expect(beyond.data[7]).toBe(8);

    const fog = createIceSprite();
    runtime.doubleBattle = true;
    runtime.battleAnimArgs = [2, 3, -12, 6, 0, 1];
    initSwirlingFogAnim(runtime, fog);
    expect(fog.callback).toBe('AnimSwirlingFogAnim');
    expect(fog.data[6]).toBe(0x40);
    for (let i = 0; i < 7; i++) animSwirlingFogAnim(runtime, fog);
    expect(fog.destroyed).toBe(true);

    const mistBall = createIceSprite();
    animThrowMistBall(runtime, mistBall);
    expect(mistBall.x).toBe(48);
    expect(mistBall.callback).toBe('TranslateAnimSpriteToTargetMonLocation');

    const gasRuntime = createIceRuntime({
      battleAnimArgs: [2, 3, 4, 5, 6, 0, 0, 0],
      battlerPositions: { 0: 0, 1: B_SIDE_PLAYER },
      battlerSides: { 0: B_SIDE_PLAYER, 1: B_SIDE_PLAYER }
    });
    const gas = createIceSprite();
    initPoisonGasCloudAnim(gasRuntime, gas);
    expect(gas.callback).toBe('MovePoisonGasCloud');
    expect(gas.data[6]).toBe(1);
    for (let i = 0; i < 4; i++) movePoisonGasCloud(gasRuntime, gas);
    expect(gas.data[7] & 0xff).toBeGreaterThanOrEqual(1);
  });

  test('haze and mist fog tasks preserve blend arrays, hold counters, and cleanup', () => {
    const runtime = createIceRuntime();
    const haze = createIceTask(runtime);
    animTaskHazeScrollingFog(runtime, haze);
    expect(runtime.tasks[haze]?.func).toBe('AnimTask_HazeScrollingFog_Step');
    for (let i = 0; i < 260 && !runtime.tasks[haze]?.destroyed; i++) animTaskHazeScrollingFogStep(runtime, haze);
    expect(runtime.tasks[haze]?.destroyed).toBe(true);
    expect(runtime.registers.BLDCNT).toBe(0);

    const mist = createIceTask(runtime);
    animTaskMistBallFog(runtime, mist);
    expect(runtime.tasks[mist]?.data[15]).toBe(-1);
    for (let i = 0; i < 260 && !runtime.tasks[mist]?.destroyed; i++) animTaskMistBallFogStep(runtime, mist);
    expect(runtime.tasks[mist]?.destroyed).toBe(true);
    expect(runtime.battleBg1X).toBe(0);
  });

  test('hail, ice ball, impact shards, and rollout counter match C lifecycle state', () => {
    const runtime = createIceRuntime({ randomValues: [0x102, 0x1ff], rolloutTimerStartValue: 6, rolloutTimer: 2, battleAnimArgs: [1, 2, 3, 4, 5, -16] });
    const hailTask = createIceTask(runtime);
    animTaskHail(runtime, hailTask);
    expect(runtime.tasks[hailTask]?.func).toBe('AnimTask_Hail2');
    for (let i = 0; i < 9; i++) animTaskHail2(runtime, hailTask);
    expect(runtime.tasks[hailTask]?.data[1]).toBeGreaterThan(0);
    expect(generateHailParticle(runtime, 1, 0, hailTask, 1)).toBe(true);
    const hail = runtime.sprites.find((sprite) => sprite.callback === 'AnimHailBegin' && sprite.data[0] === 1 && sprite.data[5] === 0)!;
    hail.x = hail.data[3];
    hail.y = hail.data[4];
    animHailBegin(runtime, hail);
    const hit = runtime.sprites.find((sprite) => sprite.callback === 'AnimHailContinue')!;
    for (let i = 0; i < 20; i++) animHailContinue(runtime, hit);
    expect(hit.destroyed).toBe(true);

    const ball = createIceSprite();
    initIceBallAnim(runtime, ball);
    expect(ball.affineAnimNum).toBe(3);
    expect(ball.callback).toBe('AnimThrowIceBall');
    for (let i = 0; i < 7; i++) animThrowIceBall(ball);
    expect(ball.callback).toBe('RunStoredCallbackWhenAnimEnds');
    expect(ball.storedCallback).toBe('DestroyAnimSprite');

    const shard = createIceSprite();
    initIceBallParticle(runtime, shard);
    expect(shard.oam.tileNum).toBe(8);
    expect(shard.data[1]).toBe(0x102);
    expect(shard.data[2]).toBe(-255);
    for (let i = 0; i < 21; i++) animIceBallParticle(shard);
    expect(shard.destroyed).toBe(true);

    const counterTask = createIceTask(runtime);
    runtime.battleAnimArgs = [4, 0, 0, 0, 0];
    animTaskGetRolloutCounter(runtime, counterTask);
    expect(runtime.battleAnimArgs[4]).toBe(3);
    expect(runtime.tasks[counterTask]?.destroyed).toBe(true);
  });
});
