import { describe, expect, test } from 'vitest';
import {
  AnimAirWaveCrescent,
  AnimBounceBallLand,
  AnimBounceBallShrink,
  AnimDiveBall,
  AnimDiveBall_Step1,
  AnimDiveBall_Step2,
  AnimDiveWaterSplash,
  AnimEllipticalGust,
  AnimEllipticalGust_Step,
  AnimFallingFeather,
  AnimFallingFeather_Step,
  AnimFlyBallAttack,
  AnimFlyBallAttack_Step,
  AnimFlyBallUp,
  AnimFlyBallUp_Step,
  AnimGustToTarget,
  AnimGustToTarget_Step,
  AnimSkyAttackBird,
  AnimSkyAttackBird_Step,
  AnimSprayWaterDroplet,
  AnimSprayWaterDroplet_Step,
  AnimTask_AnimateGustTornadoPalette,
  AnimTask_AnimateGustTornadoPalette_Step,
  AnimTask_DrillPeckHitSplats,
  AnimTask_SetAttackerVisibility,
  AnimUnusedBubbleThrow,
  AnimUnusedFeather,
  AnimUnusedFeather_Step,
  AnimUnusedFlashingLight,
  AnimUnusedFlashingLight_Step,
  AnimWhirlwindLine,
  AnimWhirlwindLine_Step,
  B_SIDE_OPPONENT,
  DestroyAnimSpriteAfterTimer,
  animAirWaveCrescent,
  animBounceBallLand,
  animBounceBallShrink,
  animDiveBall,
  animDiveBallStep1,
  animDiveBallStep2,
  animDiveWaterSplash,
  animEllipticalGust,
  animEllipticalGustStep,
  animFallingFeather,
  animFallingFeatherStep,
  animFlyBallAttack,
  animFlyBallAttackStep,
  animFlyBallUp,
  animFlyBallUpStep,
  animGustToTarget,
  animGustToTargetStep,
  animSkyAttackBird,
  animSkyAttackBirdStep,
  animSprayWaterDroplet,
  animSprayWaterDropletStep,
  animTaskAnimateGustTornadoPalette,
  animTaskAnimateGustTornadoPaletteStep,
  animTaskDrillPeckHitSplats,
  animTaskSetAttackerVisibility,
  animUnusedBubbleThrow,
  animUnusedFeather,
  animUnusedFeatherStep,
  animUnusedFlashingLight,
  animUnusedFlashingLightStep,
  animWhirlwindLine,
  animWhirlwindLineStep,
  createFlyingRuntime,
  createFlyingSprite,
  createFlyingTask,
  destroyAnimSpriteAfterTimer,
  gAirWaveCrescentSpriteTemplate,
  gBounceBallLandSpriteTemplate,
  gBounceBallShrinkSpriteTemplate,
  gDiveBallSpriteTemplate,
  gDiveWaterSplashSpriteTemplate,
  gEllipticalGustSpriteTemplate,
  gFallingFeatherSpriteTemplate,
  gFlyBallAttackSpriteTemplate,
  gFlyBallUpSpriteTemplate,
  gGustToTargetSpriteTemplate,
  gSkyAttackBirdSpriteTemplate,
  gSprayWaterDropletSpriteTemplate,
  gWhirlwindLineSpriteTemplate,
  sUnusedBubbleThrowSpriteTemplate,
  sUnusedFeatherSpriteTemplate,
  sUnusedFlashingLightSpriteTemplate,
  sUnusedPal
} from '../src/game/decompBattleAnimFlying';

describe('decomp battle_anim_flying.c parity', () => {
  test('exports exact C callback and task names as aliases of the implemented logic', () => {
    expect(AnimEllipticalGust).toBe(animEllipticalGust);
    expect(AnimEllipticalGust_Step).toBe(animEllipticalGustStep);
    expect(AnimTask_AnimateGustTornadoPalette).toBe(animTaskAnimateGustTornadoPalette);
    expect(AnimTask_AnimateGustTornadoPalette_Step).toBe(animTaskAnimateGustTornadoPaletteStep);
    expect(AnimGustToTarget).toBe(animGustToTarget);
    expect(AnimGustToTarget_Step).toBe(animGustToTargetStep);
    expect(AnimAirWaveCrescent).toBe(animAirWaveCrescent);
    expect(AnimFlyBallUp).toBe(animFlyBallUp);
    expect(AnimFlyBallUp_Step).toBe(animFlyBallUpStep);
    expect(AnimFlyBallAttack).toBe(animFlyBallAttack);
    expect(AnimFlyBallAttack_Step).toBe(animFlyBallAttackStep);
    expect(DestroyAnimSpriteAfterTimer).toBe(destroyAnimSpriteAfterTimer);
    expect(AnimFallingFeather).toBe(animFallingFeather);
    expect(AnimFallingFeather_Step).toBe(animFallingFeatherStep);
    expect(AnimUnusedBubbleThrow).toBe(animUnusedBubbleThrow);
    expect(AnimUnusedFeather).toBe(animUnusedFeather);
    expect(AnimUnusedFeather_Step).toBe(animUnusedFeatherStep);
    expect(AnimWhirlwindLine).toBe(animWhirlwindLine);
    expect(AnimWhirlwindLine_Step).toBe(animWhirlwindLineStep);
    expect(AnimTask_DrillPeckHitSplats).toBe(animTaskDrillPeckHitSplats);
    expect(AnimBounceBallShrink).toBe(animBounceBallShrink);
    expect(AnimBounceBallLand).toBe(animBounceBallLand);
    expect(AnimDiveBall).toBe(animDiveBall);
    expect(AnimDiveBall_Step1).toBe(animDiveBallStep1);
    expect(AnimDiveBall_Step2).toBe(animDiveBallStep2);
    expect(AnimDiveWaterSplash).toBe(animDiveWaterSplash);
    expect(AnimSprayWaterDroplet).toBe(animSprayWaterDroplet);
    expect(AnimSprayWaterDroplet_Step).toBe(animSprayWaterDropletStep);
    expect(AnimUnusedFlashingLight).toBe(animUnusedFlashingLight);
    expect(AnimUnusedFlashingLight_Step).toBe(animUnusedFlashingLightStep);
    expect(AnimSkyAttackBird).toBe(animSkyAttackBird);
    expect(AnimSkyAttackBird_Step).toBe(animSkyAttackBirdStep);
    expect(AnimTask_SetAttackerVisibility).toBe(animTaskSetAttackerVisibility);
  });

  test('sprite templates preserve flying animation tags and callbacks', () => {
    expect(gEllipticalGustSpriteTemplate.callback).toBe('AnimEllipticalGust');
    expect(gGustToTargetSpriteTemplate.affineAnims).toHaveLength(1);
    expect(gAirWaveCrescentSpriteTemplate.anims).toHaveLength(1);
    expect(gFlyBallUpSpriteTemplate.callback).toBe('AnimFlyBallUp');
    expect(gFlyBallAttackSpriteTemplate.callback).toBe('AnimFlyBallAttack');
    expect(gFallingFeatherSpriteTemplate.tileTag).toBe('ANIM_TAG_WHITE_FEATHER');
    expect(sUnusedPal).toHaveLength(1);
    expect(sUnusedBubbleThrowSpriteTemplate.callback).toBe('AnimUnusedBubbleThrow');
    expect(sUnusedFeatherSpriteTemplate.callback).toBe('AnimUnusedFeather');
    expect(gWhirlwindLineSpriteTemplate.callback).toBe('AnimWhirlwindLine');
    expect(gBounceBallShrinkSpriteTemplate.callback).toBe('AnimBounceBallShrink');
    expect(gBounceBallLandSpriteTemplate.callback).toBe('AnimBounceBallLand');
    expect(gDiveBallSpriteTemplate.callback).toBe('AnimDiveBall');
    expect(gDiveWaterSplashSpriteTemplate.callback).toBe('AnimDiveWaterSplash');
    expect(gSprayWaterDropletSpriteTemplate.callback).toBe('AnimSprayWaterDroplet');
    expect(sUnusedFlashingLightSpriteTemplate.callback).toBe('AnimUnusedFlashingLight');
    expect(gSkyAttackBirdSpriteTemplate.callback).toBe('AnimSkyAttackBird');
  });

  test('elliptical gust and gust palette task follow exact counters and palette rotation', () => {
    const runtime = createFlyingRuntime({ battleAnimArgs: [2, -3] });
    const gust = createFlyingSprite();
    animEllipticalGust(runtime, gust);
    expect(gust.x).toBe(178);
    expect(gust.y).toBe(65);
    expect(gust.callback).toBe('AnimEllipticalGust_Step');
    for (let i = 0; i < 70; i++) animEllipticalGustStep(gust);
    expect(gust.destroyed).toBe(true);

    const taskId = createFlyingTask(runtime);
    runtime.battleAnimArgs = [0, 2];
    const old = runtime.plttBufferFaded[16 * 16 + 3 * 16 + 8];
    animTaskAnimateGustTornadoPalette(runtime, taskId);
    animTaskAnimateGustTornadoPaletteStep(runtime, taskId);
    expect(runtime.plttBufferFaded[3 * 16 + 0x100 + 1]).toBe(old);
    animTaskAnimateGustTornadoPaletteStep(runtime, taskId);
    expect(runtime.tasks[taskId]?.destroyed).toBe(true);
  });

  test('gust-to-target, air wave, fly up, and fly attack preserve side flips and linear data', () => {
    const runtime = createFlyingRuntime({ battleAnimArgs: [4, 5, 6, -2, 3] });
    const gust = createFlyingSprite();
    animGustToTarget(runtime, gust);
    expect(gust.data.slice(0, 5)).toEqual([3, 11092, 1963, 0, 0]);
    expect(gust.storedCallback).toBe('AnimGustToTarget_Step');
    for (let i = 0; i < 4; i++) animGustToTargetStep(gust);
    expect(gust.destroyed).toBe(true);

    const airRuntime = createFlyingRuntime({ battleAnimAttacker: 1, battlerSides: { 1: B_SIDE_OPPONENT }, contest: true, battleAnimArgs: [3, 4, 5, 6, 8, 2, 0] });
    const air = createFlyingSprite();
    animAirWaveCrescent(airRuntime, air);
    expect(airRuntime.battleAnimArgs.slice(0, 4)).toEqual([-3, 4, -5, 6]);
    expect(air.x).toBe(173);
    expect(air.y).toBe(52);
    expect(air.data[0]).toBe(8);
    expect(air.animNum).toBe(2);

    const fly = createFlyingSprite();
    runtime.battleAnimArgs = [0, 0, 1, 0x200];
    animFlyBallUp(runtime, fly);
    expect(runtime.sprites[0].invisible).toBe(true);
    animFlyBallUpStep(fly);
    animFlyBallUpStep(fly);
    expect(fly.y2).toBe(-2);

    const attackRuntime = createFlyingRuntime({ battleAnimAttacker: 1, battlerSides: { 1: B_SIDE_OPPONENT }, battleAnimArgs: [2] });
    const attack = createFlyingSprite();
    animFlyBallAttack(attackRuntime, attack);
    expect(attack.x).toBe(272);
    expect(attack.animNum).toBe(1);
    for (let i = 0; i < 5; i++) animFlyBallAttackStep(attackRuntime, attack);
    expect(attack.destroyed).toBe(true);
  });

  test('timer destroy, falling feather, unused feather conversion, bubble throw, and whirlwind line preserve state', () => {
    const runtime = createFlyingRuntime({ battleAnimArgs: [5, 3, 0x4020, 2, 0x100, 0x0608, 20, 0x100] });
    const timer = createFlyingSprite();
    timer.data[0] = 0;
    timer.oam.affineMode = 1;
    runtime.animVisualTaskCount = 1;
    destroyAnimSpriteAfterTimer(runtime, timer);
    expect(timer.destroyed).toBe(true);
    expect(runtime.animVisualTaskCount).toBe(0);

    const feather = createFlyingSprite();
    animFallingFeather(runtime, feather);
    expect(feather.callback).toBe('AnimFallingFeather_Step');
    expect(feather.feather?.unk2).toBe(0x20);
    animFallingFeatherStep(runtime, feather);
    expect(feather.y).toBeGreaterThan(0);

    const unused = createFlyingSprite();
    const unusedRuntime = createFlyingRuntime({ battleAnimArgs: [0x2000, 4, 0x210, 7, 1], randomValues: [0x8001] });
    animUnusedFeather(unusedRuntime, unused);
    expect(unused.hFlip).toBe(true);
    for (let i = 0; i < 6; i++) animUnusedFeatherStep(unused);
    expect(unused.callback).toBe('AnimFallingFeather_Step');
    expect(unused.feather).not.toBeNull();

    const bubble = createFlyingSprite();
    animUnusedBubbleThrow(runtime, bubble);
    expect(bubble.x).toBe(48);
    expect(bubble.y).toBe(64);
    expect(bubble.callback).toBe('TranslateAnimSpriteToTargetMonLocation');

    const line = createFlyingSprite();
    runtime.battleAnimArgs = [1, 2, 1, 2, 3];
    animWhirlwindLine(runtime, line);
    expect(line.x).toBe(145);
    expect(line.x2).toBe(36);
    animWhirlwindLineStep(line);
    animWhirlwindLineStep(line);
    animWhirlwindLineStep(line);
    expect(line.destroyed).toBe(true);
  });

  test('drill peck, bounce, dive, splash, droplet, flashing light, sky bird, and visibility helper keep task/sprite transitions', () => {
    const runtime = createFlyingRuntime();
    const drill = createFlyingTask(runtime, 'AnimTask_DrillPeckHitSplats');
    animTaskDrillPeckHitSplats(runtime, drill);
    expect(runtime.animVisualTaskCount).toBe(1);
    expect(runtime.operations.at(-1)).toContain('gFlashingHitSplatSpriteTemplate');
    for (let i = 0; i < 32; i++) animTaskDrillPeckHitSplats(runtime, drill);
    expect(runtime.tasks[drill]?.destroyed).toBe(true);

    const shrink = createFlyingSprite();
    animBounceBallShrink(runtime, shrink);
    expect(runtime.sprites[0].invisible).toBe(true);
    shrink.affineAnimEnded = true;
    animBounceBallShrink(runtime, shrink);
    expect(shrink.destroyed).toBe(true);

    const land = createFlyingSprite();
    animBounceBallLand(runtime, land);
    expect(land.y2).toBe(-80);
    for (let i = 0; i < 9; i++) animBounceBallLand(runtime, land);
    expect(land.data[0]).toBe(2);

    const dive = createFlyingSprite();
    runtime.battleAnimArgs = [0, 0, 0, 0x400];
    animDiveBall(runtime, dive);
    for (let i = 0; i < 30 && dive.callback === 'AnimDiveBall_Step1'; i++) animDiveBallStep1(dive);
    expect(dive.invisible).toBe(true);
    dive.callback = 'AnimDiveBall_Step2';
    dive.y2 = -10;
    animDiveBallStep2(dive);
    expect(dive.destroyed).toBe(true);

    const splash = createFlyingSprite();
    runtime.battleAnimArgs = [1];
    animDiveWaterSplash(runtime, splash);
    expect(splash.x).toBe(176);
    animDiveWaterSplash(runtime, splash);
    expect(splash.rotScale).not.toBeNull();

    const dropletRuntime = createFlyingRuntime({ battleAnimArgs: [1, 0], randomValues: [3, 4] });
    const droplet = createFlyingSprite();
    animSprayWaterDroplet(dropletRuntime, droplet);
    expect(droplet.data.slice(0, 3)).toEqual([739, 892, 1]);
    animSprayWaterDropletStep(droplet);
    expect(droplet.x2).toBe(-2);
    expect(droplet.y2).toBe(-3);

    const flash = createFlyingSprite();
    animUnusedFlashingLight(flash);
    for (let i = 0; i < 64; i++) animUnusedFlashingLightStep(flash);
    expect(flash.destroyed).toBe(true);

    const bird = createFlyingSprite();
    bird.x = 300;
    bird.y = 200;
    animSkyAttackBird(runtime, bird);
    expect(bird.callback).toBe('AnimSkyAttackBird_Step');
    for (let i = 0; i < 20; i++) animSkyAttackBirdStep(bird);
    expect(bird.destroyed).toBe(true);

    const visTask = createFlyingTask(runtime);
    runtime.battleAnimArgs[0] = 0;
    animTaskSetAttackerVisibility(runtime, visTask);
    expect(runtime.sprites[0].invisible).toBe(true);
    expect(runtime.tasks[visTask]?.destroyed).toBe(true);
  });
});
