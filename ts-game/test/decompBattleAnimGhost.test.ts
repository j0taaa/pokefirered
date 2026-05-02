import { describe, expect, test } from 'vitest';
import {
  B_SIDE_OPPONENT,
  B_SIDE_PLAYER,
  AnimConfuseRayBallBounce,
  AnimConfuseRayBallBounce_Step1,
  AnimConfuseRayBallBounce_Step2,
  AnimConfuseRayBallSpiral,
  AnimConfuseRayBallSpiral_Step,
  AnimCurseNail,
  AnimCurseNail_End,
  AnimCurseNail_Step1,
  AnimCurseNail_Step2,
  AnimDestinyBondWhiteShadow,
  AnimDestinyBondWhiteShadow_Step,
  AnimGhostStatusSprite,
  AnimGhostStatusSprite_End,
  AnimGrudgeFlame,
  AnimLick,
  AnimLick_Step,
  AnimMonMoveCircular,
  AnimMonMoveCircular_Step,
  AnimShadowBall,
  AnimShadowBall_Step,
  AnimTask_CurseStretchingBlackBg,
  AnimTask_CurseStretchingBlackBg_Step1,
  AnimTask_CurseStretchingBlackBg_Step2,
  AnimTask_DestinyBondWhiteShadow,
  AnimTask_DestinyBondWhiteShadow_Step,
  AnimTask_GhostGetOut,
  AnimTask_GhostGetOut_Step1,
  AnimTask_GhostGetOut_Step2,
  AnimTask_GhostGetOut_Step3,
  AnimTask_GrudgeFlames,
  AnimTask_GrudgeFlames_Step,
  AnimTask_NightShadeClone,
  AnimTask_NightShadeClone_Step1,
  AnimTask_NightShadeClone_Step2,
  AnimTask_NightmareClone,
  AnimTask_NightmareClone_Step,
  AnimTask_SpiteTargetShadow,
  AnimTask_SpiteTargetShadow_Step1,
  AnimTask_SpiteTargetShadow_Step2,
  AnimTask_SpiteTargetShadow_Step3,
  UpdateConfuseRayBallBlend,
  ST_OAM_HFLIP,
  ST_OAM_OBJ_BLEND,
  animConfuseRayBallBounce,
  animConfuseRayBallBounceStep1,
  animConfuseRayBallBounceStep2,
  animConfuseRayBallSpiral,
  animConfuseRayBallSpiralStep,
  animCurseNail,
  animCurseNailEnd,
  animCurseNailStep1,
  animCurseNailStep2,
  animDestinyBondWhiteShadow,
  animDestinyBondWhiteShadowStep,
  animGhostStatusSprite,
  animGhostStatusSpriteEnd,
  animGrudgeFlame,
  animLick,
  animLickStep,
  animMonMoveCircular,
  animMonMoveCircularStep,
  animShadowBall,
  animShadowBallStep,
  animTaskCurseStretchingBlackBg,
  animTaskCurseStretchingBlackBgStep1,
  animTaskCurseStretchingBlackBgStep2,
  animTaskDestinyBondWhiteShadow,
  animTaskDestinyBondWhiteShadowStep,
  animTaskGhostGetOut,
  animTaskGhostGetOutStep1,
  animTaskGhostGetOutStep2,
  animTaskGhostGetOutStep3,
  animTaskGrudgeFlames,
  animTaskGrudgeFlamesStep,
  animTaskNightShadeClone,
  animTaskNightShadeCloneStep1,
  animTaskNightShadeCloneStep2,
  animTaskNightmareClone,
  animTaskNightmareCloneStep,
  animTaskSpiteTargetShadow,
  animTaskSpiteTargetShadowStep1,
  animTaskSpiteTargetShadowStep2,
  animTaskSpiteTargetShadowStep3,
  updateConfuseRayBallBlend,
  createGhostRuntime,
  createGhostSprite,
  createGhostTask,
  gConfuseRayBallBounceSpriteTemplate,
  gConfuseRayBallSpiralSpriteTemplate,
  gCurseGhostSpriteTemplate,
  gCurseNailSpriteTemplate,
  gDestinyBondWhiteShadowSpriteTemplate,
  gGrudgeFlameSpriteTemplate,
  gLickSpriteTemplate,
  gNightmareDevilSpriteTemplate,
  gShadowBallSpriteTemplate,
  sMonMoveCircularSpriteTemplate
} from '../src/game/decompBattleAnimGhost';

describe('decomp battle_anim_ghost.c parity', () => {
  test('exports exact C callback and task names as aliases of the implemented logic', () => {
    expect(AnimConfuseRayBallBounce).toBe(animConfuseRayBallBounce);
    expect(AnimConfuseRayBallBounce_Step1).toBe(animConfuseRayBallBounceStep1);
    expect(AnimConfuseRayBallBounce_Step2).toBe(animConfuseRayBallBounceStep2);
    expect(UpdateConfuseRayBallBlend).toBe(updateConfuseRayBallBlend);
    expect(AnimConfuseRayBallSpiral).toBe(animConfuseRayBallSpiral);
    expect(AnimConfuseRayBallSpiral_Step).toBe(animConfuseRayBallSpiralStep);
    expect(AnimTask_NightShadeClone).toBe(animTaskNightShadeClone);
    expect(AnimTask_NightShadeClone_Step1).toBe(animTaskNightShadeCloneStep1);
    expect(AnimTask_NightShadeClone_Step2).toBe(animTaskNightShadeCloneStep2);
    expect(AnimShadowBall).toBe(animShadowBall);
    expect(AnimShadowBall_Step).toBe(animShadowBallStep);
    expect(AnimLick).toBe(animLick);
    expect(AnimLick_Step).toBe(animLickStep);
    expect(AnimTask_NightmareClone).toBe(animTaskNightmareClone);
    expect(AnimTask_NightmareClone_Step).toBe(animTaskNightmareCloneStep);
    expect(AnimTask_SpiteTargetShadow).toBe(animTaskSpiteTargetShadow);
    expect(AnimTask_SpiteTargetShadow_Step1).toBe(animTaskSpiteTargetShadowStep1);
    expect(AnimTask_SpiteTargetShadow_Step2).toBe(animTaskSpiteTargetShadowStep2);
    expect(AnimTask_SpiteTargetShadow_Step3).toBe(animTaskSpiteTargetShadowStep3);
    expect(AnimDestinyBondWhiteShadow).toBe(animDestinyBondWhiteShadow);
    expect(AnimDestinyBondWhiteShadow_Step).toBe(animDestinyBondWhiteShadowStep);
    expect(AnimTask_DestinyBondWhiteShadow).toBe(animTaskDestinyBondWhiteShadow);
    expect(AnimTask_DestinyBondWhiteShadow_Step).toBe(animTaskDestinyBondWhiteShadowStep);
    expect(AnimTask_CurseStretchingBlackBg).toBe(animTaskCurseStretchingBlackBg);
    expect(AnimTask_CurseStretchingBlackBg_Step1).toBe(animTaskCurseStretchingBlackBgStep1);
    expect(AnimTask_CurseStretchingBlackBg_Step2).toBe(animTaskCurseStretchingBlackBgStep2);
    expect(AnimCurseNail).toBe(animCurseNail);
    expect(AnimCurseNail_Step1).toBe(animCurseNailStep1);
    expect(AnimCurseNail_Step2).toBe(animCurseNailStep2);
    expect(AnimCurseNail_End).toBe(animCurseNailEnd);
    expect(AnimGhostStatusSprite).toBe(animGhostStatusSprite);
    expect(AnimGhostStatusSprite_End).toBe(animGhostStatusSpriteEnd);
    expect(AnimTask_GrudgeFlames).toBe(animTaskGrudgeFlames);
    expect(AnimTask_GrudgeFlames_Step).toBe(animTaskGrudgeFlamesStep);
    expect(AnimGrudgeFlame).toBe(animGrudgeFlame);
    expect(AnimTask_GhostGetOut).toBe(animTaskGhostGetOut);
    expect(AnimTask_GhostGetOut_Step1).toBe(animTaskGhostGetOutStep1);
    expect(AnimTask_GhostGetOut_Step2).toBe(animTaskGhostGetOutStep2);
    expect(AnimTask_GhostGetOut_Step3).toBe(animTaskGhostGetOutStep3);
    expect(AnimMonMoveCircular).toBe(animMonMoveCircular);
    expect(AnimMonMoveCircular_Step).toBe(animMonMoveCircularStep);
  });

  test('sprite templates preserve ghost animation tags and callbacks', () => {
    expect(gConfuseRayBallBounceSpriteTemplate.callback).toBe('AnimConfuseRayBallBounce');
    expect(gConfuseRayBallSpiralSpriteTemplate.oam).toBe('gOamData_AffineOff_ObjBlend_16x16');
    expect(gShadowBallSpriteTemplate.affineAnims).toHaveLength(1);
    expect(gLickSpriteTemplate.anims).toHaveLength(1);
    expect(gDestinyBondWhiteShadowSpriteTemplate.tileTag).toBe('ANIM_TAG_WHITE_SHADOW');
    expect(gCurseNailSpriteTemplate.callback).toBe('AnimCurseNail');
    expect(gCurseGhostSpriteTemplate.callback).toBe('AnimGhostStatusSprite');
    expect(gNightmareDevilSpriteTemplate.tileTag).toBe('ANIM_TAG_DEVIL');
    expect(gGrudgeFlameSpriteTemplate.callback).toBe('AnimGrudgeFlame');
    expect(sMonMoveCircularSpriteTemplate.callback).toBe('AnimMonMoveCircular');
  });

  test('confuse ray bounce and spiral use exact counters, blend state, and fixed-point travel', () => {
    const runtime = createGhostRuntime({ battleAnimArgs: [4, 5, 4], animCustomPanning: -12 });
    const ball = createGhostSprite();
    animConfuseRayBallBounce(runtime, ball);
    expect(ball.x).toBe(52);
    expect(ball.y).toBe(69);
    expect(ball.data.slice(0, 5)).toEqual([4, 7936, 1345, 0, 0]);
    expect(runtime.registers.BLDALPHA).toBe(16);
    animConfuseRayBallBounceStep1(runtime, ball);
    expect(ball.x2).toBe(31);
    expect(ball.y2).toBe(10);
    expect(runtime.operations).toContain('PlaySE12WithPanning:SE_M_CONFUSE_RAY:-12');
    for (let i = 0; i < 4; i++) animConfuseRayBallBounceStep1(runtime, ball);
    expect(ball.callback).toBe('AnimConfuseRayBallBounce_Step2');
    ball.data[6] = 0;
    animConfuseRayBallBounceStep2(runtime, ball);
    expect(ball.invisible).toBe(true);
    expect(ball.callback).toBe('DestroyAnimSpriteAndDisableBlend');

    const spiral = createGhostSprite();
    animConfuseRayBallSpiral(runtime, spiral);
    expect(spiral.callback).toBe('AnimConfuseRayBallSpiral_Step');
    for (let i = 0; i < 60; i++) animConfuseRayBallSpiralStep(spiral);
    expect(spiral.destroyed).toBe(true);
  });

  test('night shade, shadow ball, lick, and nightmare clone keep C task/sprite phases', () => {
    const runtime = createGhostRuntime({ battleAnimArgs: [2, 3, 4] });
    const night = createGhostTask(runtime);
    animTaskNightShadeClone(runtime, night);
    expect(runtime.sprites[0].oam.objMode).toBe(ST_OAM_OBJ_BLEND);
    for (let i = 0; i < 27; i++) animTaskNightShadeCloneStep1(runtime, night);
    expect(runtime.tasks[night]?.func).toBe('AnimTask_NightShadeClone_Step2');
    for (let i = 0; i < 18; i++) animTaskNightShadeCloneStep2(runtime, night);
    expect(runtime.tasks[night]?.destroyed).toBe(true);
    expect(runtime.registers.BLDCNT).toBe(0);

    const shadow = createGhostSprite();
    shadow.x = 96;
    shadow.y = 88;
    runtime.battleAnimArgs = [4, 2, 5];
    animShadowBall(runtime, shadow);
    expect(shadow.data.slice(0, 8)).toEqual([0, 4, 2, 5, 768, 1024, 96, 48]);
    for (let i = 0; i < 13; i++) animShadowBallStep(runtime, shadow);
    expect(shadow.data[0]).toBe(3);
    animShadowBallStep(runtime, shadow);
    expect(shadow.destroyed).toBe(true);

    const lick = createGhostSprite();
    lick.animEnded = true;
    animLick(runtime, lick);
    for (let i = 0; i < 41; i++) animLickStep(lick);
    expect(lick.destroyed).toBe(true);

    const nightmare = createGhostTask(runtime);
    animTaskNightmareClone(runtime, nightmare);
    expect(runtime.sprites[runtime.tasks[nightmare]!.data[0]].callback).toBe('TranslateSpriteLinearFixedPoint');
    for (let i = 0; i < 84; i++) animTaskNightmareCloneStep(runtime, nightmare);
    expect(runtime.tasks[nightmare]?.data[4]).toBe(2);
    animTaskNightmareCloneStep(runtime, nightmare);
    expect(runtime.tasks[nightmare]?.destroyed).toBe(true);
  });

  test('spite shadow, destiny bond, and curse background preserve staged register/palette flow', () => {
    const runtime = createGhostRuntime({ battleAnimArgs: [2, 8] });
    const spite = createGhostTask(runtime);
    animTaskSpiteTargetShadow(runtime, spite);
    for (let i = 0; i < 4; i++) animTaskSpiteTargetShadowStep1(runtime, spite);
    expect(runtime.tasks[spite]?.func).toBe('AnimTask_SpiteTargetShadow_Step2');
    expect(runtime.operations.some((op) => op.startsWith('ScanlineEffect_InitWave'))).toBe(true);
    for (let i = 0; i < 128; i++) animTaskSpiteTargetShadowStep2(runtime, spite);
    expect(runtime.tasks[spite]?.func).toBe('AnimTask_SpiteTargetShadow_Step3');
    animTaskSpiteTargetShadowStep3(runtime, spite);
    animTaskSpiteTargetShadowStep3(runtime, spite);
    expect(runtime.tasks[spite]?.destroyed).toBe(true);

    const shadow = createGhostSprite();
    animDestinyBondWhiteShadow(runtime, shadow);
    expect(shadow.x).toBe(176);
    expect(shadow.y).toBe(76);
    expect(shadow.data.slice(0, 8)).toEqual([2816, 1216, -256, 48, 8, 48, 100, 4]);
    for (let i = 0; i < 8; i++) animDestinyBondWhiteShadowStep(shadow);
    expect(shadow.data[0]).toBe(0);

    const destinyTask = createGhostTask(runtime);
    animTaskDestinyBondWhiteShadow(runtime, destinyTask);
    expect(runtime.tasks[destinyTask]?.data[12]).toBe(2);
    for (let i = 0; i < 120; i++) animTaskDestinyBondWhiteShadowStep(runtime, destinyTask);
    expect(runtime.tasks[destinyTask]?.destroyed).toBe(true);

    const curseBg = createGhostTask(runtime);
    animTaskCurseStretchingBlackBg(runtime, curseBg);
    expect(runtime.battleWin0H).toBe((200 << 8) | 200);
    for (let i = 0; i < 17; i++) animTaskCurseStretchingBlackBgStep1(runtime, curseBg);
    expect(runtime.tasks[curseBg]?.func).toBe('AnimTask_CurseStretchingBlackBg_Step2');
    runtime.paletteFadeActive = false;
    animTaskCurseStretchingBlackBgStep2(runtime, curseBg);
    expect(runtime.tasks[curseBg]?.destroyed).toBe(true);
  });

  test('curse nail, status ghost, grudge flames, ghost get-out, and circular mon motion match state transitions', () => {
    const runtime = createGhostRuntime({ battleAnimArgs: [4, 5], battlerSides: { 0: B_SIDE_PLAYER, 1: B_SIDE_OPPONENT } });
    const nail = createGhostSprite();
    animCurseNail(runtime, nail);
    expect(nail.x).toBe(76);
    expect(nail.oam.matrixNum).toBe(ST_OAM_HFLIP);
    for (let i = 0; i < 152; i++) animCurseNailStep1(nail);
    expect(nail.callback).toBe('WaitAnimForDuration');
    expect(nail.storedCallback).toBe('AnimCurseNail_Step2');
    nail.data[0] = 0;
    for (let i = 0; i < 50; i++) animCurseNailStep2(runtime, nail);
    expect(nail.callback).toBe('AnimCurseNail_End');
    animCurseNailEnd(runtime, nail);
    expect(nail.destroyed).toBe(true);

    const ghost = createGhostSprite();
    for (let i = 0; i < 47; i++) animGhostStatusSprite(runtime, ghost);
    expect(ghost.callback).toBe('AnimGhostStatusSprite_End');
    animGhostStatusSpriteEnd(runtime, ghost);
    expect(ghost.destroyed).toBe(true);

    const grudge = createGhostTask(runtime);
    animTaskGrudgeFlames(runtime, grudge);
    animTaskGrudgeFlamesStep(runtime, grudge);
    expect(runtime.tasks[grudge]?.data[7]).toBe(6);
    const flameId = 4;
    animGrudgeFlame(runtime, runtime.sprites[flameId]);
    expect(runtime.sprites[flameId].y2).not.toBe(0);
    for (let i = 0; i < 90; i++) animTaskGrudgeFlamesStep(runtime, grudge);
    for (let i = 4; i < 10; i++) animGrudgeFlame(runtime, runtime.sprites[i]);
    animTaskGrudgeFlamesStep(runtime, grudge);
    animTaskGrudgeFlamesStep(runtime, grudge);
    expect(runtime.tasks[grudge]?.destroyed).toBe(true);

    const getOut = createGhostTask(runtime);
    animTaskGhostGetOut(runtime, getOut);
    for (let guard = 0; guard < 80 && runtime.tasks[getOut]?.func === 'AnimTask_GhostGetOut_Step1'; guard++) {
      animTaskGhostGetOutStep1(runtime, getOut);
    }
    expect(runtime.tasks[getOut]?.func).toBe('AnimTask_GhostGetOut_Step2');
    for (let i = 0; i < 128; i++) animTaskGhostGetOutStep2(runtime, getOut);
    expect(runtime.tasks[getOut]?.func).toBe('AnimTask_GhostGetOut_Step3');
    for (let guard = 0; guard < 40 && !runtime.tasks[getOut]?.destroyed; guard++) {
      animTaskGhostGetOutStep3(runtime, getOut);
    }
    expect(runtime.tasks[getOut]?.destroyed).toBe(true);

    const circular = createGhostSprite();
    runtime.battleAnimArgs = [32, 3];
    runtime.sprites[0].y = 72;
    animMonMoveCircular(runtime, circular);
    expect(runtime.sprites[0].y).toBe(80);
    for (let i = 0; i < 3; i++) animMonMoveCircularStep(runtime, circular);
    animMonMoveCircularStep(runtime, circular);
    expect(circular.callback).toBe('DestroySpriteAndMatrix');
    expect(runtime.sprites[0].y).toBe(72);
  });
});
