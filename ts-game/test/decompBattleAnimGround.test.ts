import { describe, expect, test } from 'vitest';
import {
  AnimBoneHitProjectile,
  AnimBonemerangProjectile,
  AnimBonemerangProjectile_End,
  AnimBonemerangProjectile_Step,
  AnimDigDirtMound,
  AnimDirtPlumeParticle,
  AnimDirtPlumeParticle_Step,
  AnimDirtScatter,
  AnimMudSportDirt,
  AnimMudSportDirtFalling,
  AnimMudSportDirtRising,
  AnimTask_DigBounceMovement,
  AnimTask_DigDisappear,
  AnimTask_DigDownMovement,
  AnimTask_DigRiseUpFromHole,
  AnimTask_DigSetVisibleUnderground,
  AnimTask_DigUpMovement,
  AnimTask_HorizontalShake,
  AnimTask_IsPowerOver99,
  AnimTask_PositionFissureBgOnBattler,
  AnimTask_ShakeBattlers,
  AnimTask_ShakeTerrain,
  B_SIDE_OPPONENT,
  DISPLAY_HEIGHT,
  MAX_BATTLERS_COUNT,
  SPRITE_NONE,
  SetBattlersXOffsetForShake,
  SetDigScanlineEffect,
  WaitForFissureCompletion,
  animBoneHitProjectile,
  animBonemerangProjectile,
  animBonemerangProjectileEnd,
  animBonemerangProjectileStep,
  animDigDirtMound,
  animDirtPlumeParticle,
  animDirtPlumeParticleStep,
  animDirtScatter,
  animMudSportDirt,
  animMudSportDirtFalling,
  animMudSportDirtRising,
  animTaskDigBounceMovement,
  animTaskDigDisappear,
  animTaskDigDownMovement,
  animTaskDigRiseUpFromHole,
  animTaskDigSetVisibleUnderground,
  animTaskDigUpMovement,
  animTaskHorizontalShake,
  animTaskIsPowerOver99,
  animTaskPositionFissureBgOnBattler,
  animTaskShakeBattlers,
  animTaskShakeTerrain,
  createGroundRuntime,
  createGroundSprite,
  createGroundTask,
  gBonemerangSpriteTemplate,
  gDirtMoundSpriteTemplate,
  gDirtPlumeSpriteTemplate,
  gMudsportMudSpriteTemplate,
  gSandAttackDirtSpriteTemplate,
  gSpinningBoneSpriteTemplate,
  runGroundTask,
  setBattlersXOffsetForShake,
  setDigScanlineEffect,
  waitForFissureCompletion
} from '../src/game/decompBattleAnimGround';

describe('decomp battle_anim_ground.c parity', () => {
  test('exports exact C callback and task names as aliases of the implemented logic', () => {
    expect(AnimBonemerangProjectile).toBe(animBonemerangProjectile);
    expect(AnimBonemerangProjectile_Step).toBe(animBonemerangProjectileStep);
    expect(AnimBonemerangProjectile_End).toBe(animBonemerangProjectileEnd);
    expect(AnimBoneHitProjectile).toBe(animBoneHitProjectile);
    expect(AnimDirtScatter).toBe(animDirtScatter);
    expect(AnimMudSportDirt).toBe(animMudSportDirt);
    expect(AnimMudSportDirtRising).toBe(animMudSportDirtRising);
    expect(AnimMudSportDirtFalling).toBe(animMudSportDirtFalling);
    expect(AnimTask_DigDownMovement).toBe(animTaskDigDownMovement);
    expect(AnimTask_DigBounceMovement).toBe(animTaskDigBounceMovement);
    expect(AnimTask_DigDisappear).toBe(animTaskDigDisappear);
    expect(AnimTask_DigUpMovement).toBe(animTaskDigUpMovement);
    expect(AnimTask_DigSetVisibleUnderground).toBe(animTaskDigSetVisibleUnderground);
    expect(AnimTask_DigRiseUpFromHole).toBe(animTaskDigRiseUpFromHole);
    expect(SetDigScanlineEffect).toBe(setDigScanlineEffect);
    expect(AnimDirtPlumeParticle).toBe(animDirtPlumeParticle);
    expect(AnimDirtPlumeParticle_Step).toBe(animDirtPlumeParticleStep);
    expect(AnimDigDirtMound).toBe(animDigDirtMound);
    expect(AnimTask_HorizontalShake).toBe(animTaskHorizontalShake);
    expect(AnimTask_ShakeTerrain).toBe(animTaskShakeTerrain);
    expect(AnimTask_ShakeBattlers).toBe(animTaskShakeBattlers);
    expect(SetBattlersXOffsetForShake).toBe(setBattlersXOffsetForShake);
    expect(AnimTask_IsPowerOver99).toBe(animTaskIsPowerOver99);
    expect(AnimTask_PositionFissureBgOnBattler).toBe(animTaskPositionFissureBgOnBattler);
    expect(WaitForFissureCompletion).toBe(waitForFissureCompletion);
  });

  test('sprite templates preserve tags, oam names, affine tables, and callback identities', () => {
    expect(gBonemerangSpriteTemplate).toMatchObject({
      tileTag: 'ANIM_TAG_BONE',
      oam: 'gOamData_AffineNormal_ObjNormal_32x32',
      callback: 'AnimBonemerangProjectile'
    });
    expect(gSpinningBoneSpriteTemplate.callback).toBe('AnimBoneHitProjectile');
    expect(gSandAttackDirtSpriteTemplate.callback).toBe('AnimDirtScatter');
    expect(gMudsportMudSpriteTemplate.callback).toBe('AnimMudSportDirt');
    expect(gDirtPlumeSpriteTemplate.callback).toBe('AnimDirtPlumeParticle');
    expect(gDirtMoundSpriteTemplate.callback).toBe('AnimDigDirtMound');
  });

  test('Bonemerang arcs to target, reinitializes back to attacker, then destroys at end of return arc', () => {
    const runtime = createGroundRuntime();
    const sprite = createGroundSprite();

    animBonemerangProjectile(runtime, sprite);
    expect(sprite.x).toBe(48);
    expect(sprite.y).toBe(72);
    expect(sprite.data.slice(0, 6)).toEqual([20, 0, 176, 0, 64, -40]);
    expect(sprite.callback).toBe('AnimBonemerangProjectile_Step');

    sprite.data[0] = 1;
    sprite.x2 = 7;
    sprite.y2 = -3;
    animBonemerangProjectileStep(runtime, sprite);
    expect(sprite.x).toBe(55);
    expect(sprite.y).toBe(69);
    expect(sprite.x2).toBe(0);
    expect(sprite.y2).toBe(0);
    expect(sprite.data.slice(0, 6)).toEqual([20, 0, 48, 0, 72, 40]);
    expect(sprite.callback).toBe('AnimBonemerangProjectile_End');

    sprite.data[0] = 1;
    animBonemerangProjectileEnd(sprite);
    expect(sprite.destroyed).toBe(true);
  });

  test('Bone hit flips target x offset for opponent-side attacker and stores linear destroy callback', () => {
    const runtime = createGroundRuntime();
    runtime.battleAnimAttacker = 1;
    runtime.battlerSides[1] = B_SIDE_OPPONENT;
    runtime.battleAnimArgs = [5, -6, 12, 7, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const sprite = createGroundSprite();

    animBoneHitProjectile(runtime, sprite);

    expect(runtime.battleAnimArgs[2]).toBe(-12);
    expect(sprite.x).toBe(171);
    expect(sprite.y).toBe(58);
    expect(sprite.data[0]).toBe(9);
    expect(sprite.data[2]).toBe(164);
    expect(sprite.data[4]).toBe(71);
    expect(sprite.callback).toBe('StartAnimLinearTranslation');
    expect(sprite.storedCallback).toBe('DestroyAnimSprite');
  });

  test('Dirt scatter initializes attacker position, signed random offsets, and matrix destroy callback', () => {
    const runtime = createGroundRuntime();
    runtime.randomValues.push(31, 12);
    runtime.battleAnimArgs = [2, 3, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const sprite = createGroundSprite();

    animDirtScatter(runtime, sprite);

    expect(sprite.x).toBe(50);
    expect(sprite.y).toBe(75);
    expect(sprite.data[0]).toBe(14);
    expect(sprite.data[2]).toBe(161);
    expect(sprite.data[4]).toBe(76);
    expect(sprite.callback).toBe('StartAnimLinearTranslation');
    expect(sprite.storedCallback).toBe('DestroySpriteAndMatrix');
  });

  test('Mud Sport rising dirt increments tile, moves horizontally every other frame, and destroys above screen', () => {
    const runtime = createGroundRuntime();
    runtime.battleAnimArgs = [0, -5, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const sprite = createGroundSprite();

    animMudSportDirt(runtime, sprite);
    expect(sprite.oam.tileNum).toBe(1);
    expect(sprite.x).toBe(43);
    expect(sprite.y).toBe(76);
    expect(sprite.data[0]).toBe(-1);
    expect(sprite.callback).toBe('AnimMudSportDirtRising');

    animMudSportDirtRising(sprite);
    expect(sprite.x).toBe(43);
    expect(sprite.y).toBe(72);
    animMudSportDirtRising(sprite);
    expect(sprite.x).toBe(42);
    sprite.y = -4;
    animMudSportDirtRising(sprite);
    expect(sprite.destroyed).toBe(true);
  });

  test('Mud Sport falling dirt raises y2 to zero then toggles invisible ten times before destruction', () => {
    const runtime = createGroundRuntime();
    runtime.battleAnimArgs = [1, 20, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const sprite = createGroundSprite();

    animMudSportDirt(runtime, sprite);
    expect(sprite.x).toBe(20);
    expect(sprite.y).toBe(8);
    expect(sprite.y2).toBe(-8);
    expect(sprite.callback).toBe('AnimMudSportDirtFalling');

    animMudSportDirtFalling(sprite);
    expect(sprite.y2).toBe(-4);
    animMudSportDirtFalling(sprite);
    expect(sprite.y2).toBe(0);
    expect(sprite.data[0]).toBe(1);

    for (let i = 0; i < 10; i++) {
      animMudSportDirtFalling(sprite);
    }
    expect(sprite.destroyed).toBe(true);
  });

  test('Dig down bounce initializes sprite/bg state, scanline buffers, sine displacement, and final destroy state', () => {
    const runtime = createGroundRuntime();
    const taskId = createGroundTask(runtime, 'AnimTask_DigBounceMovement');

    animTaskDigDownMovement(runtime, taskId);
    const task = runtime.tasks[taskId]!;
    expect(task.func).toBe('AnimTask_DigBounceMovement');
    expect(task.data[10]).toBe(0);
    expect(task.data[11]).toBe(1);
    expect(task.data[12]).toBe(10);
    expect(task.data[13]).toBe(20);
    expect(task.data[14]).toBe(48);
    expect(task.data[15]).toBe(112);
    expect(runtime.sprites[0].invisible).toBe(true);

    animTaskDigBounceMovement(runtime, taskId);
    expect(runtime.scanlineEffect.params?.dmaDest).toBe('REG_BG1HOFS');
    expect(runtime.scanlineEffectRegBuffers[0][47]).toBe(0);
    expect(runtime.scanlineEffectRegBuffers[0][48]).toBe(10);
    expect(runtime.scanlineEffectRegBuffers[0][112]).toBe(250);

    animTaskDigBounceMovement(runtime, taskId);
    expect(task.data[2]).toBe(6);
    expect(runtime.battleBg1Y).toBe(20 - task.data[5]);

    task.data[5] = 64;
    task.data[3] = 64;
    animTaskDigBounceMovement(runtime, taskId);
    expect(task.data[0]).toBe(3);
    expect(runtime.sprites[0].x2).toBe(272);
    animTaskDigBounceMovement(runtime, taskId);
    expect(runtime.scanlineEffect.state).toBe(3);
    animTaskDigBounceMovement(runtime, taskId);
    expect(runtime.tasks[taskId]?.func).toBe('DestroyAnimVisualTask');
  });

  test('Dig disappear hides attacker, clears offsets, zeroes selected BG y, and destroys visual task', () => {
    const runtime = createGroundRuntime();
    runtime.battleAnimAttacker = 1;
    runtime.sprites[1].x2 = 9;
    runtime.sprites[1].y2 = -3;
    const taskId = createGroundTask(runtime, 'AnimTask_DigDisappear');

    animTaskDigDisappear(runtime, taskId);

    expect(runtime.sprites[1].invisible).toBe(true);
    expect(runtime.sprites[1].x2).toBe(0);
    expect(runtime.sprites[1].y2).toBe(0);
    expect(runtime.battleBg2Y).toBe(0);
    expect(runtime.tasks[taskId]?.func).toBe('DestroyAnimVisualTask');
  });

  test('Dig up underground path makes attacker visible below display then destroys on second state', () => {
    const runtime = createGroundRuntime();
    runtime.sprites[0].y = 70;
    const taskId = createGroundTask(runtime, 'AnimTask_DigSetVisibleUnderground');

    animTaskDigUpMovement(runtime, taskId);
    expect(runtime.tasks[taskId]?.func).toBe('AnimTask_DigSetVisibleUnderground');
    expect(runtime.sprites[0].invisible).toBe(false);
    expect(runtime.sprites[0].x2).toBe(0);
    expect(runtime.sprites[0].y2).toBe(DISPLAY_HEIGHT - 70);

    animTaskDigSetVisibleUnderground(runtime, taskId);
    expect(runtime.tasks[taskId]?.func).toBe('DestroyAnimVisualTask');
  });

  test('Dig rise path sets scanline effect, starts y2 at 96, rises by 8, and clears scanline on arrival', () => {
    const runtime = createGroundRuntime();
    runtime.battleAnimArgs[0] = 1;
    const taskId = createGroundTask(runtime, 'AnimTask_DigRiseUpFromHole');

    animTaskDigUpMovement(runtime, taskId);
    const task = runtime.tasks[taskId]!;
    expect(task.func).toBe('AnimTask_DigRiseUpFromHole');
    expect(task.data[14]).toBe(48);
    expect(task.data[15]).toBe(112);

    animTaskDigRiseUpFromHole(runtime, taskId);
    expect(runtime.scanlineEffect.params?.dmaDest).toBe('REG_BG1HOFS');
    animTaskDigRiseUpFromHole(runtime, taskId);
    expect(runtime.sprites[0].y2).toBe(96);
    for (let i = 0; i < 12; i++) {
      animTaskDigRiseUpFromHole(runtime, taskId);
    }
    expect(runtime.sprites[0].y2).toBe(0);
    expect(runtime.scanlineEffect.state).toBe(3);
    animTaskDigRiseUpFromHole(runtime, taskId);
    expect(runtime.tasks[taskId]?.func).toBe('DestroyAnimVisualTask');
  });

  test('SetDigScanlineEffect clamps negative y and fills foreground and wrapped regions exactly', () => {
    const runtime = createGroundRuntime();
    runtime.battleBg2X = 33;

    setDigScanlineEffect(runtime, 0, -5, 2);

    expect(runtime.scanlineEffect.params).toEqual({
      dmaDest: 'REG_BG2HOFS',
      dmaControl: 'SCANLINE_EFFECT_DMACNT_16BIT',
      initState: 1,
      unused9: 0
    });
    expect(runtime.scanlineEffectRegBuffers[0][0]).toBe(33);
    expect(runtime.scanlineEffectRegBuffers[1][1]).toBe(33);
    expect(runtime.scanlineEffectRegBuffers[0][2]).toBe(273);
  });

  test('Dirt plume chooses attacker or target side, flips right-side offsets, and destroys at arc completion', () => {
    const runtime = createGroundRuntime();
    runtime.battleAnimArgs = [1, 1, 12, -7, 18, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const sprite = createGroundSprite();

    animDirtPlumeParticle(runtime, sprite);

    expect(runtime.battleAnimArgs[2]).toBe(-12);
    expect(sprite.x).toBe(152);
    expect(sprite.y).toBe(102);
    expect(sprite.data.slice(0, 6)).toEqual([2, 0, 140, 0, 95, 18]);
    expect(sprite.callback).toBe('AnimDirtPlumeParticle_Step');

    animDirtPlumeParticleStep(sprite);
    expect(sprite.destroyed).toBe(false);
    animDirtPlumeParticleStep(sprite);
    expect(sprite.destroyed).toBe(true);
  });

  test('Dig dirt mound positions either half, offsets tile number, stores destroy callback, and waits duration', () => {
    const runtime = createGroundRuntime();
    runtime.battleAnimArgs = [0, 1, 23, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const sprite = createGroundSprite();
    sprite.oam.tileNum = 4;

    animDigDirtMound(runtime, sprite);

    expect(sprite.x).toBe(48);
    expect(sprite.y).toBe(112);
    expect(sprite.oam.tileNum).toBe(12);
    expect(sprite.storedCallback).toBe('DestroyAnimSprite');
    expect(sprite.data[0]).toBe(23);
    expect(sprite.callback).toBe('WaitAnimForDuration');
  });

  test('horizontal terrain shake uses explicit intensity, max time, initial BG3 x, and decays to original position', () => {
    const runtime = createGroundRuntime();
    runtime.battleAnimArgs = [MAX_BATTLERS_COUNT + 1, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const taskId = createGroundTask(runtime, 'AnimTask_ShakeTerrain');

    animTaskHorizontalShake(runtime, taskId);
    const task = runtime.tasks[taskId]!;
    expect(task.func).toBe('AnimTask_ShakeTerrain');
    expect(task.data[13]).toBe(50);
    expect(task.data[14]).toBe(5);
    expect(task.data[15]).toBe(5);

    animTaskShakeTerrain(runtime, taskId);
    expect(runtime.battleBg3X).toBe(50);
    animTaskShakeTerrain(runtime, taskId);
    expect(runtime.battleBg3X).toBe(55);
    animTaskShakeTerrain(runtime, taskId);
    animTaskShakeTerrain(runtime, taskId);
    expect(runtime.battleBg3X).toBe(45);
    expect(task.data[0]).toBe(1);

    task.data[14] = 1;
    task.data[2] = 3;
    animTaskShakeTerrain(runtime, taskId);
    animTaskShakeTerrain(runtime, taskId);
    expect(task.data[0]).toBe(2);
    animTaskShakeTerrain(runtime, taskId);
    expect(runtime.battleBg3X).toBe(50);
    expect(runtime.tasks[taskId]?.func).toBe('DestroyAnimVisualTask');
  });

  test('horizontal battler shake collects visible battlers, applies rounded alternating offsets, and resets x2 on completion', () => {
    const runtime = createGroundRuntime();
    runtime.battlerVisible[2] = false;
    runtime.battleAnimArgs = [MAX_BATTLERS_COUNT, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    runtime.animMovePower = 70;
    const taskId = createGroundTask(runtime, 'AnimTask_ShakeBattlers');

    animTaskHorizontalShake(runtime, taskId);
    const task = runtime.tasks[taskId]!;
    expect(task.func).toBe('AnimTask_ShakeBattlers');
    expect(task.data[13]).toBe(3);
    expect(task.data.slice(9, 12)).toEqual([0, 1, 3]);
    expect(task.data[14]).toBe(10);

    task.data[2] = 0;
    setBattlersXOffsetForShake(runtime, task);
    expect(runtime.sprites[0].x2).toBe(5);
    task.data[2] = 1;
    setBattlersXOffsetForShake(runtime, task);
    expect(runtime.sprites[1].x2).toBe(-5);

    task.data[0] = 2;
    runtime.sprites[0].x2 = 4;
    runtime.sprites[1].x2 = -4;
    runtime.sprites[3].x2 = 2;
    animTaskShakeBattlers(runtime, taskId);
    expect(runtime.sprites[0].x2).toBe(0);
    expect(runtime.sprites[1].x2).toBe(0);
    expect(runtime.sprites[3].x2).toBe(0);
    expect(runtime.tasks[taskId]?.func).toBe('DestroyAnimVisualTask');
  });

  test('horizontal shake specific battler destroys immediately for missing sprite otherwise stores one battler', () => {
    const missing = createGroundRuntime();
    missing.battlerSpriteIds[1] = SPRITE_NONE;
    missing.battleAnimArgs = [1, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const missingTask = createGroundTask(missing, 'AnimTask_ShakeBattlers');
    animTaskHorizontalShake(missing, missingTask);
    expect(missing.tasks[missingTask]?.func).toBe('DestroyAnimVisualTask');

    const runtime = createGroundRuntime();
    runtime.battleAnimArgs = [1, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const taskId = createGroundTask(runtime, 'AnimTask_ShakeBattlers');
    animTaskHorizontalShake(runtime, taskId);
    expect(runtime.tasks[taskId]?.data[9]).toBe(1);
    expect(runtime.tasks[taskId]?.data[13]).toBe(1);
  });

  test('power check writes arg15 and destroys visual task', () => {
    const runtime = createGroundRuntime();
    runtime.animMovePower = 100;
    const taskId = createGroundTask(runtime, 'DestroyAnimVisualTask');

    animTaskIsPowerOver99(runtime, taskId);

    expect(runtime.battleAnimArgs[15]).toBe(1);
    expect(runtime.tasks[taskId]?.func).toBe('DestroyAnimVisualTask');
  });

  test('Fissure positions BG3 on selected/flanked battler and hold task resets only after terminator arg matches', () => {
    const runtime = createGroundRuntime();
    runtime.battleAnimArgs = [3, 6, 77, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const visualTask = createGroundTask(runtime, 'DestroyAnimVisualTask');

    const holdTask = animTaskPositionFissureBgOnBattler(runtime, visualTask);

    expect(runtime.tasks[visualTask]?.func).toBe('DestroyAnimVisualTask');
    expect(runtime.tasks[holdTask]?.priority).toBe(6);
    expect(runtime.battleBg3X).toBe((32 - 216) & 0x1ff);
    expect(runtime.battleBg3Y).toBe((64 - 84) & 0xff);
    expect(runtime.tasks[holdTask]?.data[3]).toBe(77);

    runtime.battleBg3X = 0;
    runtime.battleBg3Y = 0;
    waitForFissureCompletion(runtime, holdTask);
    expect(runtime.battleBg3X).toBe((32 - 216) & 0x1ff);
    expect(runtime.battleBg3Y).toBe((64 - 84) & 0xff);

    runtime.battleAnimArgs[7] = 77;
    waitForFissureCompletion(runtime, holdTask);
    expect(runtime.battleBg3X).toBe(0);
    expect(runtime.battleBg3Y).toBe(0);
    expect(runtime.tasks[holdTask]).toBeNull();
  });

  test('runGroundTask dispatches current task func', () => {
    const runtime = createGroundRuntime();
    const taskId = createGroundTask(runtime, 'AnimTask_DigDisappear');

    runGroundTask(runtime, taskId);

    expect(runtime.sprites[0].invisible).toBe(true);
    expect(runtime.tasks[taskId]?.func).toBe('DestroyAnimVisualTask');
  });
});
