import { describe, expect, test } from 'vitest';
import {
  ANIM_ATTACKER,
  ANIM_ATK_PARTNER,
  ANIM_TARGET,
  AnimTask_RotateMonSpriteToSide,
  AnimTask_RotateMonSpriteToSide_Step,
  AnimTask_RotateMonToSideAndRestore,
  AnimTask_ScaleMonAndRestore,
  AnimTask_ScaleMonAndRestore_Step,
  AnimTask_ShakeAndSinkMon,
  AnimTask_ShakeAndSinkMon_Step,
  AnimTask_ShakeMon,
  AnimTask_ShakeMon2,
  AnimTask_ShakeMon2Step,
  AnimTask_ShakeMonInPlace,
  AnimTask_ShakeMonInPlace_Step,
  AnimTask_ShakeMon_Step,
  AnimTask_ShakeTargetBasedOnMovePowerOrDmg,
  AnimTask_ShakeTargetBasedOnMovePowerOrDmg_Step,
  AnimTask_SlideOffScreen,
  AnimTask_SlideOffScreen_Step,
  AnimTask_SwayMon,
  AnimTask_SwayMon_Step,
  AnimTask_TranslateMonElliptical,
  AnimTask_TranslateMonEllipticalRespectSide,
  AnimTask_TranslateMonElliptical_Step,
  AnimTask_WindUpLunge,
  AnimTask_WindUpLunge_Step1,
  AnimTask_WindUpLunge_Step2,
  B_SIDE_OPPONENT,
  DoHorizontalLunge,
  DoVerticalDip,
  ReverseHorizontalLungeDirection,
  ReverseVerticalDipDirection,
  SlideMonToOffset,
  SlideMonToOffsetAndBack,
  SlideMonToOffsetAndBack_End,
  SlideMonToOriginalPos,
  SlideMonToOriginalPos_Step,
  animTaskRotateMonSpriteToSide,
  animTaskRotateMonSpriteToSideStep,
  animTaskRotateMonToSideAndRestore,
  animTaskScaleMonAndRestore,
  animTaskScaleMonAndRestoreStep,
  animTaskShakeAndSinkMon,
  animTaskShakeAndSinkMonStep,
  animTaskShakeMon,
  animTaskShakeMon2,
  animTaskShakeMon2Step,
  animTaskShakeMonStep,
  animTaskShakeMonInPlace,
  animTaskShakeMonInPlaceStep,
  animTaskShakeTargetBasedOnMovePowerOrDmg,
  animTaskShakeTargetBasedOnMovePowerOrDmgStep,
  animTaskSlideOffScreen,
  animTaskSlideOffScreenStep,
  animTaskSwayMon,
  animTaskSwayMonStep,
  animTaskTranslateMonEllipticalRespectSide,
  animTaskTranslateMonElliptical,
  animTaskTranslateMonEllipticalStep,
  animTaskWindUpLunge,
  animTaskWindUpLungeStep1,
  animTaskWindUpLungeStep2,
  createMonMovementRuntime,
  createMonMovementSprite,
  createMonMovementTask,
  doHorizontalLunge,
  doVerticalDip,
  gHorizontalLungeSpriteTemplate,
  gSlideMonToOffsetAndBackSpriteTemplate,
  gSlideMonToOffsetSpriteTemplate,
  gSlideMonToOriginalPosSpriteTemplate,
  gVerticalDipSpriteTemplate,
  reverseHorizontalLungeDirection,
  reverseVerticalDipDirection,
  slideMonToOffset,
  slideMonToOffsetAndBack,
  slideMonToOffsetAndBackEnd,
  slideMonToOriginalPos,
  slideMonToOriginalPosStep
} from '../src/game/decompBattleAnimMonMovement';

describe('decomp battle_anim_mon_movement.c parity', () => {
  test('exports exact C callback and task names as aliases of the implemented logic', () => {
    expect(AnimTask_ShakeMon).toBe(animTaskShakeMon);
    expect(AnimTask_ShakeMon_Step).toBe(animTaskShakeMonStep);
    expect(AnimTask_ShakeMon2).toBe(animTaskShakeMon2);
    expect(AnimTask_ShakeMon2Step).toBe(animTaskShakeMon2Step);
    expect(AnimTask_ShakeMonInPlace).toBe(animTaskShakeMonInPlace);
    expect(AnimTask_ShakeMonInPlace_Step).toBe(animTaskShakeMonInPlaceStep);
    expect(AnimTask_ShakeAndSinkMon).toBe(animTaskShakeAndSinkMon);
    expect(AnimTask_ShakeAndSinkMon_Step).toBe(animTaskShakeAndSinkMonStep);
    expect(AnimTask_TranslateMonElliptical).toBe(animTaskTranslateMonElliptical);
    expect(AnimTask_TranslateMonElliptical_Step).toBe(animTaskTranslateMonEllipticalStep);
    expect(AnimTask_TranslateMonEllipticalRespectSide).toBe(animTaskTranslateMonEllipticalRespectSide);
    expect(DoHorizontalLunge).toBe(doHorizontalLunge);
    expect(ReverseHorizontalLungeDirection).toBe(reverseHorizontalLungeDirection);
    expect(DoVerticalDip).toBe(doVerticalDip);
    expect(ReverseVerticalDipDirection).toBe(reverseVerticalDipDirection);
    expect(SlideMonToOriginalPos).toBe(slideMonToOriginalPos);
    expect(SlideMonToOriginalPos_Step).toBe(slideMonToOriginalPosStep);
    expect(SlideMonToOffset).toBe(slideMonToOffset);
    expect(SlideMonToOffsetAndBack).toBe(slideMonToOffsetAndBack);
    expect(SlideMonToOffsetAndBack_End).toBe(slideMonToOffsetAndBackEnd);
    expect(AnimTask_WindUpLunge).toBe(animTaskWindUpLunge);
    expect(AnimTask_WindUpLunge_Step1).toBe(animTaskWindUpLungeStep1);
    expect(AnimTask_WindUpLunge_Step2).toBe(animTaskWindUpLungeStep2);
    expect(AnimTask_SlideOffScreen).toBe(animTaskSlideOffScreen);
    expect(AnimTask_SlideOffScreen_Step).toBe(animTaskSlideOffScreenStep);
    expect(AnimTask_SwayMon).toBe(animTaskSwayMon);
    expect(AnimTask_SwayMon_Step).toBe(animTaskSwayMonStep);
    expect(AnimTask_ScaleMonAndRestore).toBe(animTaskScaleMonAndRestore);
    expect(AnimTask_ScaleMonAndRestore_Step).toBe(animTaskScaleMonAndRestoreStep);
    expect(AnimTask_RotateMonSpriteToSide).toBe(animTaskRotateMonSpriteToSide);
    expect(AnimTask_RotateMonToSideAndRestore).toBe(animTaskRotateMonToSideAndRestore);
    expect(AnimTask_RotateMonSpriteToSide_Step).toBe(animTaskRotateMonSpriteToSideStep);
    expect(AnimTask_ShakeTargetBasedOnMovePowerOrDmg).toBe(animTaskShakeTargetBasedOnMovePowerOrDmg);
    expect(AnimTask_ShakeTargetBasedOnMovePowerOrDmg_Step).toBe(animTaskShakeTargetBasedOnMovePowerOrDmgStep);
  });

  test('sprite templates preserve mon movement callback identities', () => {
    expect(gHorizontalLungeSpriteTemplate.callback).toBe('DoHorizontalLunge');
    expect(gVerticalDipSpriteTemplate.callback).toBe('DoVerticalDip');
    expect(gSlideMonToOriginalPosSpriteTemplate.callback).toBe('SlideMonToOriginalPos');
    expect(gSlideMonToOffsetSpriteTemplate.callback).toBe('SlideMonToOffset');
    expect(gSlideMonToOffsetAndBackSpriteTemplate.callback).toBe('SlideMonToOffsetAndBack');
  });

  test('shake tasks toggle offsets, handle position selectors, and preserve in-place double x add', () => {
    const shake = createMonMovementRuntime({ battleAnimArgs: [ANIM_TARGET, 5, -3, 2, 0] });
    const shakeTask = createMonMovementTask(shake);
    animTaskShakeMon(shake, shakeTask);
    expect(shake.sprites[1].x2).toBe(0);
    expect(shake.sprites[1].y2).toBe(0);
    expect(shake.tasks[shakeTask]?.func).toBe('AnimTask_ShakeMon_Step');
    animTaskShakeMonStep(shake, shakeTask);
    expect(shake.tasks[shakeTask]?.destroyed).toBe(true);
    expect(shake.sprites[1].x2).toBe(0);

    const selected = createMonMovementRuntime({ battleAnimArgs: [5, 4, 2, 2, 0] });
    const selectedTask = createMonMovementTask(selected);
    animTaskShakeMon2(selected, selectedTask);
    expect(selected.sprites[2].x2).toBe(-4);
    expect(selected.sprites[2].y2).toBe(-2);
    animTaskShakeMon2Step(selected, selectedTask);
    expect(selected.tasks[selectedTask]?.destroyed).toBe(true);

    const invisible = createMonMovementRuntime({ battleAnimArgs: [5, 4, 2, 2, 0], battlerVisible: { 0: true, 1: true, 2: false, 3: true } });
    const invisibleTask = createMonMovementTask(invisible);
    animTaskShakeMon2(invisible, invisibleTask);
    expect(invisible.tasks[invisibleTask]?.destroyed).toBe(true);

    const inPlace = createMonMovementRuntime({ battleAnimArgs: [ANIM_ATTACKER, 2, 3, 2, 0] });
    const inPlaceTask = createMonMovementTask(inPlace);
    animTaskShakeMonInPlace(inPlace, inPlaceTask);
    expect(inPlace.sprites[0].x2).toBe(-2);
    expect(inPlace.sprites[0].y2).toBe(-3);
    animTaskShakeMonInPlaceStep(inPlace, inPlaceTask);
    expect(inPlace.sprites[0].x2).toBe(4);
    expect(inPlace.sprites[0].y2).toBe(0);
    expect(inPlace.tasks[inPlaceTask]?.destroyed).toBe(true);
  });

  test('sink and elliptical tasks preserve counters, fixed-point y sink, side flip, and speed clamp', () => {
    const sink = createMonMovementRuntime({ battleAnimArgs: [ANIM_ATTACKER, 4, 0, 0x180, 2] });
    const sinkTask = createMonMovementTask(sink);
    animTaskShakeAndSinkMon(sink, sinkTask);
    expect(sink.sprites[0].x2).toBe(0);
    expect(sink.sprites[0].y2).toBe(1);
    animTaskShakeAndSinkMonStep(sink, sinkTask);
    expect(sink.sprites[0].x2).toBe(-4);
    expect(sink.sprites[0].y2).toBe(3);
    expect(sink.tasks[sinkTask]?.destroyed).toBe(true);

    const elliptical = createMonMovementRuntime({
      battleAnimAttacker: 1,
      battleAnimArgs: [ANIM_ATTACKER, 8, 4, 1, 9],
      battlerSides: { 0: 0, 1: B_SIDE_OPPONENT, 2: 0, 3: B_SIDE_OPPONENT }
    });
    const ellipticalTask = createMonMovementTask(elliptical);
    animTaskTranslateMonEllipticalRespectSide(elliptical, ellipticalTask);
    expect(elliptical.battleAnimArgs[1]).toBe(-8);
    expect(elliptical.battleAnimArgs[4]).toBe(5);
    expect(elliptical.tasks[ellipticalTask]?.data[4]).toBe(32);
    for (let i = 0; i < 7; i++) animTaskTranslateMonEllipticalStep(elliptical, ellipticalTask);
    expect(elliptical.tasks[ellipticalTask]?.destroyed).toBe(true);
    expect(elliptical.sprites[1].x2).toBe(0);
    expect(elliptical.sprites[1].y2).toBe(0);
  });

  test('lunge and slide sprite callbacks copy args, flip opponent offsets, and install stored callbacks', () => {
    const horizontalRuntime = createMonMovementRuntime({
      battleAnimAttacker: 1,
      battleAnimArgs: [5, 7],
      battlerSides: { 0: 0, 1: B_SIDE_OPPONENT, 2: 0, 3: B_SIDE_OPPONENT }
    });
    const horizontal = createMonMovementSprite();
    doHorizontalLunge(horizontalRuntime, horizontal);
    expect(horizontal.invisible).toBe(true);
    expect(horizontal.data.slice(0, 5)).toEqual([5, -7, 0, 1, 5]);
    expect(horizontal.callback).toBe('TranslateSpriteLinearById');
    expect(horizontal.storedCallback).toBe('ReverseHorizontalLungeDirection');
    reverseHorizontalLungeDirection(horizontal);
    expect(horizontal.data[1]).toBe(7);
    expect(horizontal.storedCallback).toBe('DestroyAnimSprite');

    const verticalRuntime = createMonMovementRuntime({ battleAnimArgs: [6, 9, ANIM_TARGET] });
    const vertical = createMonMovementSprite();
    doVerticalDip(verticalRuntime, vertical);
    expect(vertical.data.slice(0, 5)).toEqual([6, 0, 9, 1, 6]);
    expect(vertical.storedCallback).toBe('ReverseVerticalDipDirection');
    reverseVerticalDipDirection(vertical);
    expect(vertical.data[2]).toBe(-9);
    expect(vertical.storedCallback).toBe('DestroyAnimSprite');

    const originalRuntime = createMonMovementRuntime({ battleAnimArgs: [0, 0, 0] });
    originalRuntime.sprites[0].x = 10;
    originalRuntime.sprites[0].y = 20;
    originalRuntime.sprites[0].x2 = 8;
    originalRuntime.sprites[0].y2 = -4;
    const original = createMonMovementSprite();
    slideMonToOriginalPos(originalRuntime, original);
    expect(original.callback).toBe('SlideMonToOriginalPos_Step');
    slideMonToOriginalPosStep(originalRuntime, original);
    expect(originalRuntime.sprites[0].x2).toBe(0);
    expect(originalRuntime.sprites[0].y2).toBe(0);
    expect(original.destroyed).toBe(true);

    const offsetRuntime = createMonMovementRuntime({
      battleAnimArgs: [1, 5, 6, 1, 4],
      battlerSides: { 0: 0, 1: B_SIDE_OPPONENT, 2: 0, 3: B_SIDE_OPPONENT }
    });
    offsetRuntime.sprites[1].x = 80;
    offsetRuntime.sprites[1].y = 40;
    const offset = createMonMovementSprite();
    slideMonToOffset(offsetRuntime, offset);
    expect(offsetRuntime.battleAnimArgs.slice(1, 3)).toEqual([-5, -6]);
    expect(offset.data.slice(0, 6)).toEqual([4, 80, 75, 0, 0, 1]);
    expect(offset.callback).toBe('TranslateSpriteLinearByIdFixedPoint');
    expect(offset.storedCallback).toBe('DestroyAnimSprite');

    const backRuntime = createMonMovementRuntime({ battleAnimArgs: [ANIM_ATTACKER, 3, -2, 0, 5, 1] });
    backRuntime.sprites[0].x2 = 6;
    backRuntime.sprites[0].y2 = -7;
    const back = createMonMovementSprite();
    slideMonToOffsetAndBack(backRuntime, back);
    expect(back.data[3]).toBe(6 << 8);
    expect(back.data[4]).toBe(-7 << 8);
    expect(back.storedCallback).toBe('SlideMonToOffsetAndBack_End');
    slideMonToOffsetAndBackEnd(backRuntime, back);
    expect(backRuntime.sprites[0].x2).toBe(0);
    expect(backRuntime.sprites[0].y2).toBe(0);
    expect(back.destroyed).toBe(true);
  });

  test('wind-up, off-screen, sway, scale, rotate, and power shake tasks keep exact state transitions', () => {
    const lunge = createMonMovementRuntime({ battleAnimArgs: [ANIM_ATTACKER, 12, 5, 2, 0, 20, 2] });
    const lungeTask = createMonMovementTask(lunge);
    animTaskWindUpLunge(lunge, lungeTask);
    animTaskWindUpLungeStep1(lunge, lungeTask);
    animTaskWindUpLungeStep1(lunge, lungeTask);
    expect(lunge.tasks[lungeTask]?.func).toBe('AnimTask_WindUpLunge_Step2');
    animTaskWindUpLungeStep2(lunge, lungeTask);
    expect(lunge.sprites[0].x2).toBe(22);
    animTaskWindUpLungeStep2(lunge, lungeTask);
    expect(lunge.sprites[0].x2).toBe(32);
    expect(lunge.tasks[lungeTask]?.destroyed).toBe(true);

    const offscreen = createMonMovementRuntime({ battleAnimArgs: [ANIM_TARGET, 30] });
    offscreen.sprites[1].x = 250;
    const offscreenTask = createMonMovementTask(offscreen);
    animTaskSlideOffScreen(offscreen, offscreenTask);
    animTaskSlideOffScreenStep(offscreen, offscreenTask);
    expect(offscreen.tasks[offscreenTask]?.destroyed).toBe(true);

    const hiddenPartner = createMonMovementRuntime({ battleAnimArgs: [ANIM_ATK_PARTNER, 5], battlerVisible: { 0: true, 1: true, 2: false, 3: true } });
    const hiddenPartnerTask = createMonMovementTask(hiddenPartner);
    animTaskSlideOffScreen(hiddenPartner, hiddenPartnerTask);
    expect(hiddenPartner.tasks[hiddenPartnerTask]?.destroyed).toBe(true);

    const sway = createMonMovementRuntime({ battleAnimArgs: [0, 8, 0x8000, 1, ANIM_ATTACKER] });
    const swayTask = createMonMovementTask(sway);
    animTaskSwayMon(sway, swayTask);
    animTaskSwayMonStep(sway, swayTask);
    expect(sway.tasks[swayTask]?.destroyed).toBe(true);
    expect(sway.sprites[0].x2).toBe(0);

    const scale = createMonMovementRuntime({ battleAnimArgs: [8, -4, 1, ANIM_ATTACKER, 2] });
    const scaleTask = createMonMovementTask(scale);
    animTaskScaleMonAndRestore(scale, scaleTask);
    animTaskScaleMonAndRestoreStep(scale, scaleTask);
    expect(scale.sprites[0].rotScale).toEqual({ xScale: 0x108, yScale: 0xfc, rotation: 0 });
    animTaskScaleMonAndRestoreStep(scale, scaleTask);
    expect(scale.sprites[0].rotScale).toBeNull();
    expect(scale.tasks[scaleTask]?.destroyed).toBe(true);

    const rotate = createMonMovementRuntime({ battleAnimArgs: [2, 5, ANIM_ATTACKER, 2] });
    const rotateTask = createMonMovementTask(rotate);
    animTaskRotateMonSpriteToSide(rotate, rotateTask);
    animTaskRotateMonSpriteToSideStep(rotate, rotateTask);
    expect(rotate.sprites[0].rotScale).toEqual({ xScale: 0x100, yScale: 0x100, rotation: -5 });
    animTaskRotateMonSpriteToSideStep(rotate, rotateTask);
    expect(rotate.tasks[rotateTask]?.data[6]).toBe(1);
    animTaskRotateMonSpriteToSideStep(rotate, rotateTask);
    animTaskRotateMonSpriteToSideStep(rotate, rotateTask);
    expect(rotate.sprites[0].yOffsetFromRotation).toBe(true);
    expect(rotate.sprites[0].rotScale).toBeNull();
    expect(rotate.tasks[rotateTask]?.destroyed).toBe(true);

    const powerShake = createMonMovementRuntime({ battleAnimArgs: [0, 0, 2, 1, 1], animMovePower: 80 });
    const powerShakeTask = createMonMovementTask(powerShake);
    animTaskShakeTargetBasedOnMovePowerOrDmg(powerShake, powerShakeTask);
    animTaskShakeTargetBasedOnMovePowerOrDmgStep(powerShake, powerShakeTask);
    expect(powerShake.sprites[1].x2).toBe(3);
    expect(powerShake.sprites[1].y2).toBe(6);
    animTaskShakeTargetBasedOnMovePowerOrDmgStep(powerShake, powerShakeTask);
    expect(powerShake.sprites[1].x2).toBe(0);
    expect(powerShake.sprites[1].y2).toBe(0);
    expect(powerShake.tasks[powerShakeTask]?.destroyed).toBe(true);
  });
});
