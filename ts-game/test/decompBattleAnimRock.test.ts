import { describe, expect, test } from 'vitest';
import {
  B_SIDE_OPPONENT,
  DISPLAY_WIDTH,
  AnimFallingRock,
  AnimFallingRock_Step,
  AnimFlyingSandCrescent,
  AnimParticleInVortex,
  AnimParticleInVortex_Step,
  AnimRaiseSprite,
  AnimRockBlastRock,
  AnimRockFragment,
  AnimRockScatter,
  AnimRockScatter_Step,
  AnimRockTomb,
  AnimRockTomb_Step,
  AnimRolloutParticle,
  AnimTask_GetSeismicTossDamageLevel,
  AnimTask_LoadSandstormBackground,
  AnimTask_LoadSandstormBackground_Step,
  AnimTask_MoveSeismicTossBg,
  AnimTask_Rollout,
  AnimTask_Rollout_Step,
  AnimTask_SeismicTossBgAccelerateDownAtEnd,
  CreateRolloutDirtSprite,
  GetRolloutCounter,
  SE_M_DIG,
  SE_M_HEADBUTT,
  animFallingRock,
  animFallingRockStep,
  animFlyingSandCrescent,
  animParticleInVortex,
  animParticleInVortexStep,
  animRaiseSprite,
  animRockBlastRock,
  animRockFragment,
  animRockScatter,
  animRockScatterStep,
  animRockTomb,
  animRockTombStep,
  animRolloutParticle,
  animTaskGetSeismicTossDamageLevel,
  animTaskLoadSandstormBackground,
  animTaskLoadSandstormBackgroundStep,
  animTaskMoveSeismicTossBg,
  animTaskRollout,
  animTaskRolloutStep,
  animTaskSeismicTossBgAccelerateDownAtEnd,
  createRockRuntime,
  createRockSprite,
  createRockTask,
  createRolloutDirtSprite,
  gAncientPowerRockSpriteTemplate,
  gFallingRockSpriteTemplate,
  gFireSpinSpriteTemplate,
  gFlyingSandCrescentSpriteTemplate,
  gRockBlastRockSpriteTemplate,
  gRockFragmentSpriteTemplate,
  gRockScatterSpriteTemplate,
  gRockTombRockSpriteTemplate,
  gRolloutMudSpriteTemplate,
  gRolloutRockSpriteTemplate,
  gSwirlingDirtSpriteTemplate,
  gWeatherBallRockDownSpriteTemplate,
  gWhirlpoolSpriteTemplate,
  getRolloutCounter
} from '../src/game/decompBattleAnimRock';

describe('decomp battle_anim_rock.c parity', () => {
  test('exports exact C callback and task names for battle_anim_rock', () => {
    expect(AnimFallingRock).toBe(animFallingRock);
    expect(AnimFallingRock_Step).toBe(animFallingRockStep);
    expect(AnimRockFragment).toBe(animRockFragment);
    expect(AnimParticleInVortex).toBe(animParticleInVortex);
    expect(AnimParticleInVortex_Step).toBe(animParticleInVortexStep);
    expect(AnimTask_LoadSandstormBackground).toBe(animTaskLoadSandstormBackground);
    expect(AnimTask_LoadSandstormBackground_Step).toBe(
      animTaskLoadSandstormBackgroundStep
    );
    expect(AnimFlyingSandCrescent).toBe(animFlyingSandCrescent);
    expect(AnimRaiseSprite).toBe(animRaiseSprite);
    expect(AnimTask_Rollout).toBe(animTaskRollout);
    expect(AnimTask_Rollout_Step).toBe(animTaskRolloutStep);
    expect(CreateRolloutDirtSprite).toBe(createRolloutDirtSprite);
    expect(AnimRolloutParticle).toBe(animRolloutParticle);
    expect(GetRolloutCounter).toBe(getRolloutCounter);
    expect(AnimRockTomb).toBe(animRockTomb);
    expect(AnimRockTomb_Step).toBe(animRockTombStep);
    expect(AnimRockBlastRock).toBe(animRockBlastRock);
    expect(AnimRockScatter).toBe(animRockScatter);
    expect(AnimRockScatter_Step).toBe(animRockScatterStep);
    expect(AnimTask_GetSeismicTossDamageLevel).toBe(
      animTaskGetSeismicTossDamageLevel
    );
    expect(AnimTask_MoveSeismicTossBg).toBe(animTaskMoveSeismicTossBg);
    expect(AnimTask_SeismicTossBgAccelerateDownAtEnd).toBe(
      animTaskSeismicTossBgAccelerateDownAtEnd
    );
  });

  test('sprite templates preserve rock tags, OAM names, animation slices, and callbacks', () => {
    expect(gFallingRockSpriteTemplate).toMatchObject({ tileTag: 'ANIM_TAG_ROCKS', callback: 'AnimFallingRock' });
    expect(gRockFragmentSpriteTemplate.callback).toBe('AnimRockFragment');
    expect(gSwirlingDirtSpriteTemplate.callback).toBe('AnimParticleInVortex');
    expect(gWhirlpoolSpriteTemplate.affineAnims).toEqual(['sAffineAnim_Whirlpool']);
    expect(gFireSpinSpriteTemplate.tileTag).toBe('ANIM_TAG_SMALL_EMBER');
    expect(gFlyingSandCrescentSpriteTemplate.callback).toBe('AnimFlyingSandCrescent');
    expect(gAncientPowerRockSpriteTemplate.callback).toBe('AnimRaiseSprite');
    expect(gRolloutMudSpriteTemplate.callback).toBe('AnimRolloutParticle');
    expect(gRolloutRockSpriteTemplate.callback).toBe('AnimRolloutParticle');
    expect(gRockTombRockSpriteTemplate.callback).toBe('AnimRockTomb');
    expect(gRockBlastRockSpriteTemplate.affineAnims).toHaveLength(2);
    expect(gRockScatterSpriteTemplate.callback).toBe('AnimRockScatter');
    expect(gWeatherBallRockDownSpriteTemplate.callback).toBe('AnimWeatherBallDown');
  });

  test('falling rock optionally starts at average target position, stores ellipse data, then re-enters with impact data', () => {
    const runtime = createRockRuntime();
    runtime.battleAnimArgs = [9, 2, -5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const sprite = createRockSprite();

    animFallingRock(runtime, sprite);
    expect(sprite.x).toBe(183);
    expect(sprite.y).toBe(88);
    expect(sprite.animIndex).toBe(2);
    expect(sprite.data.slice(0, 6)).toEqual([0, 0, 4, 16, -70, -5]);
    expect(sprite.storedCallback).toBe('AnimFallingRock_Step');
    expect(sprite.callback).toBe('TranslateSpriteInEllipse');

    animFallingRockStep(sprite);
    expect(sprite.x).toBe(178);
    expect(sprite.data.slice(0, 6)).toEqual([192, -5, 4, 32, -24, -5]);
    expect(sprite.storedCallback).toBe('DestroySpriteAndMatrix');
  });

  test('rock fragment mirrors x offset for opponent attacker and rewrites linear data like C', () => {
    const runtime = createRockRuntime();
    runtime.battleAnimAttacker = 1;
    runtime.battlerSides[1] = B_SIDE_OPPONENT;
    runtime.battleAnimArgs = [6, -4, 10, 12, 18, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const sprite = createRockSprite();
    sprite.x = 100;
    sprite.y = 50;

    animRockFragment(runtime, sprite);

    expect(sprite.animIndex).toBe(2);
    expect(sprite.x).toBe(94);
    expect(sprite.y).toBe(46);
    expect(sprite.data.slice(0, 7)).toEqual([18, 94, 104, 0, 0, 0, 1]);
    expect(sprite.callback).toBe('TranslateSpriteLinearFixedPoint');
    expect(sprite.storedCallback).toBe('DestroySpriteAndMatrix');
  });

  test('vortex particle initializes from attacker or target and updates fixed y, sine x, angle, and destruction frame', () => {
    const runtime = createRockRuntime();
    runtime.battleAnimArgs = [3, 4, 256, 1, 16, 64, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const sprite = createRockSprite();

    animParticleInVortex(runtime, sprite);
    expect(sprite.x).toBe(179);
    expect(sprite.y).toBe(76);
    expect(sprite.data.slice(0, 4)).toEqual([1, 256, 16, 64]);

    animParticleInVortexStep(sprite);
    expect(sprite.y2).toBe(-1);
    expect(sprite.x2).toBe(0);
    expect(sprite.data[5]).toBe(16);
    expect(sprite.destroyed).toBe(false);
    animParticleInVortexStep(sprite);
    expect(sprite.destroyed).toBe(true);
  });

  test('sandstorm background setup and state machine blend in, wait, blend out, reset bg attributes, and destroy', () => {
    const runtime = createRockRuntime();
    runtime.battleAnimAttacker = 1;
    runtime.battleAnimArgs[0] = 1;
    const taskId = createRockTask(runtime, 'AnimTask_LoadSandstormBackground_Step');

    animTaskLoadSandstormBackground(runtime, taskId);
    const task = runtime.tasks[taskId]!;
    expect(task.data[0]).toBe(1);
    expect(task.func).toBe('AnimTask_LoadSandstormBackground_Step');
    expect(runtime.gpuRegs.REG_OFFSET_BLDALPHA).toBe(0x1000);
    expect(runtime.bgAttrs['1:BG_ANIM_CHAR_BASE_BLOCK']).toBe(1);
    expect(runtime.operations).toContain('AnimLoadCompressedBgTilemap:1');

    for (let i = 0; i < 28; i++) animTaskLoadSandstormBackgroundStep(runtime, taskId);
    expect(task.data[12]).toBe(1);
    expect(runtime.gpuRegs.REG_OFFSET_BLDALPHA).toBe(0x0907);
    task.data[11] = 100;
    animTaskLoadSandstormBackgroundStep(runtime, taskId);
    expect(task.data[12]).toBe(2);
    for (let i = 0; i < 28; i++) animTaskLoadSandstormBackgroundStep(runtime, taskId);
    expect(task.data[12]).toBe(3);
    animTaskLoadSandstormBackgroundStep(runtime, taskId);
    expect(runtime.operations).toContain('InitBattleAnimBg:1');
    task.data[12] = 4;
    animTaskLoadSandstormBackgroundStep(runtime, taskId);
    expect(runtime.battleBg1X).toBe(0);
    expect(runtime.battleBg1Y).toBe(0);
    expect(runtime.gpuRegs.REG_OFFSET_BLDCNT).toBe(0);
    expect(runtime.tasks[taskId]?.func).toBe('DestroyAnimVisualTask');
  });

  test('flying sand crescent starts offscreen, optionally hflips for opponent, accumulates fixed-point travel, and swaps callback at bounds', () => {
    const runtime = createRockRuntime();
    const sprite = createRockSprite();
    runtime.battleAnimArgs = [12, 0x180, 0x80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    animFlyingSandCrescent(runtime, sprite);
    expect(sprite.x).toBe(-64);
    expect(sprite.y).toBe(12);
    expect(sprite.subspriteTableSet).toBe(true);
    animFlyingSandCrescent(runtime, sprite);
    expect(sprite.x2).toBe(1);
    expect(sprite.y2).toBe(0);

    sprite.x2 = DISPLAY_WIDTH + 97;
    animFlyingSandCrescent(runtime, sprite);
    expect(sprite.callback).toBe('DestroyAnimSprite');

    const opponent = createRockRuntime();
    opponent.battleAnimAttacker = 1;
    opponent.battleAnimArgs = [7, 0x100, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const oppSprite = createRockSprite();
    animFlyingSandCrescent(opponent, oppSprite);
    expect(oppSprite.x).toBe(304);
    expect(opponent.battleAnimArgs[1]).toBe(-0x100);
    expect(oppSprite.oam.matrixNum).toBe(1);
  });

  test('raise sprite starts attacker translation toward terminal y and stores destroy callback', () => {
    const runtime = createRockRuntime();
    runtime.battleAnimArgs = [5, -3, -30, 24, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const sprite = createRockSprite();

    animRaiseSprite(runtime, sprite);

    expect(sprite.animIndex).toBe(4);
    expect(sprite.x).toBe(53);
    expect(sprite.y).toBe(61);
    expect(sprite.data[0]).toBe(24);
    expect(sprite.data[2]).toBe(53);
    expect(sprite.data[4]).toBe(31);
    expect(sprite.callback).toBe('StartAnimLinearTranslation');
    expect(sprite.storedCallback).toBe('DestroyAnimSprite');
  });

  test('rollout initialization derives counter, duration, deltas, panning, and attacker sprite slot', () => {
    const runtime = createRockRuntime();
    runtime.rolloutTimerStartValue = 5;
    runtime.rolloutTimer = 2;
    const taskId = createRockTask(runtime, 'AnimTask_Rollout_Step');

    animTaskRollout(runtime, taskId);

    const task = runtime.tasks[taskId]!;
    expect(task.func).toBe('AnimTask_Rollout_Step');
    expect(task.data[1]).toBe(3);
    expect(task.data[8]).toBe(24);
    expect(task.data[10]).toBe(2);
    expect(task.data[2]).toBe(384);
    expect(task.data[3]).toBe(768);
    expect(task.data[4]).toBe(42);
    expect(task.data[5]).toBe(2);
    expect(task.data[13]).toBe(-64);
    expect(task.data[14]).toBe(5);
    expect(task.data[15]).toBe(0);
  });

  test('rollout step retreats, waits, returns, creates dirt, tracks sounds, and destroys after spawned particles finish', () => {
    const runtime = createRockRuntime();
    const taskId = createRockTask(runtime, 'AnimTask_Rollout_Step');
    animTaskRollout(runtime, taskId);
    const task = runtime.tasks[taskId]!;

    for (let i = 0; i < 10; i++) animTaskRolloutStep(runtime, taskId);
    expect(task.data[0]).toBe(1);
    expect(task.data[11]).toBe(20);
    expect(runtime.panningLog.at(-1)).toEqual({ song: SE_M_HEADBUTT, pan: -64 });

    task.data[11] = 1;
    animTaskRolloutStep(runtime, taskId);
    expect(task.data[0]).toBe(2);

    task.data[9] = 1;
    animTaskRolloutStep(runtime, taskId);
    expect(task.data[0]).toBe(3);
    expect(runtime.sprites[0].x2).toBe(0);

    task.data[9] = task.data[10] - 1;
    animTaskRolloutStep(runtime, taskId);
    expect(runtime.createdSprites).toHaveLength(1);
    expect(task.data[11]).toBe(1);
    expect(task.data[12]).toBe(-1);
    expect(runtime.panningLog.at(-1)?.song).toBe(SE_M_DIG);

    task.data[8] = 1;
    animTaskRolloutStep(runtime, taskId);
    expect(task.data[0]).toBe(4);
    task.data[11] = 0;
    animTaskRolloutStep(runtime, taskId);
    expect(runtime.tasks[taskId]?.func).toBe('DestroyAnimVisualTask');
  });

  test('CreateRolloutDirtSprite chooses template/tile offsets by rollout counter and flips side multiplier', () => {
    const runtime = createRockRuntime();
    const taskId = createRockTask(runtime, 'AnimTask_Rollout_Step');
    const task = runtime.tasks[taskId]!;
    task.data[1] = 5;
    task.data[2] = 80;
    task.data[3] = 160;
    task.data[12] = 1;

    const spriteId = createRolloutDirtSprite(runtime, task);
    const sprite = runtime.sprites[spriteId];

    expect(sprite.templateName).toBe('gRolloutRockSpriteTemplate');
    expect(sprite.x).toBe(14);
    expect(sprite.y).toBe(20);
    expect(sprite.data[0]).toBe(18);
    expect(sprite.data[2]).toBe(49);
    expect(sprite.data[4]).toBe(20);
    expect(sprite.data[5]).toBe(-26);
    expect(sprite.oam.tileNum).toBe(48);
    expect(task.data[11]).toBe(1);
    expect(task.data[12]).toBe(-1);
  });

  test('rollout particle decrements rollout active sprite count and destroys after arc completes', () => {
    const runtime = createRockRuntime();
    const taskId = createRockTask(runtime, 'AnimTask_Rollout_Step');
    runtime.tasks[taskId]!.data[11] = 2;
    const sprite = createRockSprite();
    sprite.data[0] = 1;

    animRolloutParticle(runtime, sprite);

    expect(runtime.tasks[taskId]?.data[11]).toBe(1);
    expect(sprite.destroyed).toBe(true);
  });

  test('GetRolloutCounter wraps invalid ranges back to one', () => {
    const runtime = createRockRuntime();
    runtime.rolloutTimerStartValue = 7;
    runtime.rolloutTimer = 1;
    expect(getRolloutCounter(runtime)).toBe(1);
    runtime.rolloutTimerStartValue = 4;
    runtime.rolloutTimer = 2;
    expect(getRolloutCounter(runtime)).toBe(2);
  });

  test('Rock Tomb hides initially, falls with increasing acceleration, then waits duration before destruction', () => {
    const runtime = createRockRuntime();
    runtime.battleAnimArgs = [7, 40, 12, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const sprite = createRockSprite();

    animRockTomb(runtime, sprite);
    expect(sprite.animIndex).toBe(3);
    expect(sprite.x2).toBe(7);
    expect(sprite.data.slice(0, 4)).toEqual([3, 2, 40, -12]);
    expect(sprite.invisible).toBe(true);

    animRockTombStep(sprite);
    expect(sprite.invisible).toBe(false);
    expect(sprite.y2).toBe(28);
    expect(sprite.data[3]).toBe(-9);
    sprite.data[3] = 0;
    animRockTombStep(sprite);
    expect(sprite.destroyed).toBe(false);
    animRockTombStep(sprite);
    expect(sprite.destroyed).toBe(true);
  });

  test('Rock Blast starts opposite affine anim for opponent attacker and translates toward target', () => {
    const runtime = createRockRuntime();
    runtime.battleAnimAttacker = 1;
    const sprite = createRockSprite();

    animRockBlastRock(runtime, sprite);

    expect(sprite.affineAnimIndex).toBe(1);
    expect(sprite.data[2]).toBe(176);
    expect(sprite.data[4]).toBe(72);
    expect(sprite.callback).toBe('StartAnimLinearTranslation');
  });

  test('Rock Scatter initializes from target position and applies accumulating offsets plus sine bounce until frame 144', () => {
    const runtime = createRockRuntime();
    runtime.battleAnimArgs = [8, -3, 20, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const sprite = createRockSprite();

    animRockScatter(runtime, sprite);
    expect(sprite.x).toBe(168);
    expect(sprite.y).toBe(77);
    expect(sprite.animIndex).toBe(5);
    expect(sprite.callback).toBe('AnimRockScatter_Step');

    animRockScatterStep(sprite);
    expect(sprite.data[0]).toBe(8);
    expect(sprite.data[3]).toBe(8);
    expect(sprite.data[4]).toBe(-3);
    expect(sprite.destroyed).toBe(false);
    for (let i = 0; i < 18; i++) animRockScatterStep(sprite);
    expect(sprite.destroyed).toBe(true);
  });

  test('Seismic Toss damage level uses three independent C if statements and destroys task', () => {
    const runtime = createRockRuntime();
    const taskId = createRockTask(runtime, 'DestroyAnimVisualTask');
    runtime.animMoveDmg = 65;
    animTaskGetSeismicTossDamageLevel(runtime, taskId);
    expect(runtime.battleAnimArgs[15]).toBe(1);
    expect(runtime.tasks[taskId]?.func).toBe('DestroyAnimVisualTask');

    const high = createRockRuntime();
    const highTask = createRockTask(high, 'DestroyAnimVisualTask');
    high.animMoveDmg = 66;
    animTaskGetSeismicTossDamageLevel(high, highTask);
    expect(high.battleAnimArgs[15]).toBe(2);
  });

  test('Seismic Toss bg move toggles BG3 mode first frame and destroys exactly at frame 120', () => {
    const runtime = createRockRuntime();
    const taskId = createRockTask(runtime, 'DestroyAnimVisualTask');

    animTaskMoveSeismicTossBg(runtime, taskId);
    expect(runtime.bg3Mode).toBe(0);
    expect(runtime.battleBg3Y).toBe(20);
    expect(runtime.tasks[taskId]?.data[0]).toBe(1);

    runtime.tasks[taskId]!.data[0] = 120;
    animTaskMoveSeismicTossBg(runtime, taskId);
    expect(runtime.bg3Mode).toBe(1);
    expect(runtime.tasks[taskId]?.func).toBe('DestroyAnimVisualTask');
  });

  test('Seismic Toss end acceleration stores initial BG3 y, applies cosine wobble, and terminates on arg7 0xFFF', () => {
    const runtime = createRockRuntime();
    runtime.battleBg3Y = 30;
    const taskId = createRockTask(runtime, 'DestroyAnimVisualTask');

    animTaskSeismicTossBgAccelerateDownAtEnd(runtime, taskId);
    expect(runtime.bg3Mode).toBe(0);
    expect(runtime.tasks[taskId]?.data[2]).toBe(30);
    expect(runtime.tasks[taskId]?.data[1]).toBe(80);
    expect(runtime.battleBg3Y).not.toBe(30);

    runtime.battleAnimArgs[7] = 0xfff;
    animTaskSeismicTossBgAccelerateDownAtEnd(runtime, taskId);
    expect(runtime.battleBg3Y).toBe(0);
    expect(runtime.bg3Mode).toBe(1);
    expect(runtime.tasks[taskId]?.func).toBe('DestroyAnimVisualTask');
  });
});
