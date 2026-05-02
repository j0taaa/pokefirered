import { describe, expect, test } from 'vitest';
import {
  ANIM_ATTACKER,
  ANIM_TARGET,
  AnimArmThrustHit,
  AnimArmThrustHit_Step,
  AnimBasicFistOrFoot,
  AnimBrickBreakWall,
  AnimBrickBreakWallShard,
  AnimBrickBreakWallShard_Step,
  AnimBrickBreakWall_Step,
  AnimCrossChopHand,
  AnimCrossChopHand_Step,
  AnimDizzyPunchDuck,
  AnimFistOrFootRandomPos,
  AnimFistOrFootRandomPos_Step,
  AnimFocusPunchFist,
  AnimJumpKick,
  AnimRevengeScratch,
  AnimSlideHandOrFootToTarget,
  AnimSlidingKick,
  AnimSlidingKick_Step,
  AnimSpinningKickOrPunch,
  AnimSpinningKickOrPunchFinish,
  AnimStompFoot,
  AnimStompFootEnd,
  AnimStompFootStep,
  AnimSuperpowerFireball,
  AnimSuperpowerOrb,
  AnimSuperpowerOrb_Step,
  AnimSuperpowerRock,
  AnimSuperpowerRock_Step1,
  AnimSuperpowerRock_Step2,
  AnimTask_MoveSkyUppercutBg,
  AnimUnusedHumanoidFoot,
  B_SIDE_OPPONENT,
  B_SIDE_PLAYER,
  MAX_SPRITES,
  ST_OAM_HFLIP,
  ST_OAM_VFLIP,
  animArmThrustHit,
  animArmThrustHitStep,
  animBasicFistOrFoot,
  animBrickBreakWall,
  animBrickBreakWallShard,
  animBrickBreakWallShardStep,
  animBrickBreakWallStep,
  animCrossChopHand,
  animCrossChopHandStep,
  animDizzyPunchDuck,
  animFistOrFootRandomPos,
  animFistOrFootRandomPosStep,
  animFocusPunchFist,
  animJumpKick,
  animRevengeScratch,
  animSlideHandOrFootToTarget,
  animSlidingKick,
  animSlidingKickStep,
  animSpinningKickOrPunch,
  animSpinningKickOrPunchFinish,
  animStompFoot,
  animStompFootEnd,
  animStompFootStep,
  animSuperpowerFireball,
  animSuperpowerOrb,
  animSuperpowerOrbStep,
  animSuperpowerRock,
  animSuperpowerRockStep1,
  animSuperpowerRockStep2,
  animTaskMoveSkyUppercutBg,
  animUnusedHumanoidFoot,
  createFightRuntime,
  createFightSprite,
  createFightTask,
  gArmThrustHandSpriteTemplate,
  gBrickBreakWallShardSpriteTemplate,
  gBrickBreakWallSpriteTemplate,
  gCrossChopHandSpriteTemplate,
  gDizzyPunchDuckSpriteTemplate,
  gFistFootRandomPosSpriteTemplate,
  gFistFootSpriteTemplate,
  gFocusPunchFistSpriteTemplate,
  gJumpKickSpriteTemplate,
  gKarateChopSpriteTemplate,
  gMegaPunchKickSpriteTemplate,
  gRevengeBigScratchSpriteTemplate,
  gRevengeSmallScratchSpriteTemplate,
  gSlidingKickSpriteTemplate,
  gSpinningHandOrFootSpriteTemplate,
  gStompFootSpriteTemplate,
  gSuperpowerFireballSpriteTemplate,
  gSuperpowerOrbSpriteTemplate,
  gSuperpowerRockSpriteTemplate
} from '../src/game/decompBattleAnimFight';

describe('decomp battle_anim_fight.c parity', () => {
  test('exports exact C callback and task names as aliases of the implemented logic', () => {
    expect(AnimUnusedHumanoidFoot).toBe(animUnusedHumanoidFoot);
    expect(AnimSlideHandOrFootToTarget).toBe(animSlideHandOrFootToTarget);
    expect(AnimJumpKick).toBe(animJumpKick);
    expect(AnimBasicFistOrFoot).toBe(animBasicFistOrFoot);
    expect(AnimFistOrFootRandomPos).toBe(animFistOrFootRandomPos);
    expect(AnimFistOrFootRandomPos_Step).toBe(animFistOrFootRandomPosStep);
    expect(AnimCrossChopHand).toBe(animCrossChopHand);
    expect(AnimCrossChopHand_Step).toBe(animCrossChopHandStep);
    expect(AnimSlidingKick).toBe(animSlidingKick);
    expect(AnimSlidingKick_Step).toBe(animSlidingKickStep);
    expect(AnimSpinningKickOrPunch).toBe(animSpinningKickOrPunch);
    expect(AnimSpinningKickOrPunchFinish).toBe(animSpinningKickOrPunchFinish);
    expect(AnimStompFoot).toBe(animStompFoot);
    expect(AnimStompFootStep).toBe(animStompFootStep);
    expect(AnimStompFootEnd).toBe(animStompFootEnd);
    expect(AnimDizzyPunchDuck).toBe(animDizzyPunchDuck);
    expect(AnimBrickBreakWall).toBe(animBrickBreakWall);
    expect(AnimBrickBreakWall_Step).toBe(animBrickBreakWallStep);
    expect(AnimBrickBreakWallShard).toBe(animBrickBreakWallShard);
    expect(AnimBrickBreakWallShard_Step).toBe(animBrickBreakWallShardStep);
    expect(AnimSuperpowerOrb).toBe(animSuperpowerOrb);
    expect(AnimSuperpowerOrb_Step).toBe(animSuperpowerOrbStep);
    expect(AnimSuperpowerRock).toBe(animSuperpowerRock);
    expect(AnimSuperpowerRock_Step1).toBe(animSuperpowerRockStep1);
    expect(AnimSuperpowerRock_Step2).toBe(animSuperpowerRockStep2);
    expect(AnimSuperpowerFireball).toBe(animSuperpowerFireball);
    expect(AnimArmThrustHit_Step).toBe(animArmThrustHitStep);
    expect(AnimArmThrustHit).toBe(animArmThrustHit);
    expect(AnimRevengeScratch).toBe(animRevengeScratch);
    expect(AnimFocusPunchFist).toBe(animFocusPunchFist);
    expect(AnimTask_MoveSkyUppercutBg).toBe(animTaskMoveSkyUppercutBg);
  });

  test('sprite templates preserve tags, animation slices, affine tables, and callback identities', () => {
    expect(gKarateChopSpriteTemplate.callback).toBe('AnimSlideHandOrFootToTarget');
    expect(gJumpKickSpriteTemplate.callback).toBe('AnimJumpKick');
    expect(gFistFootSpriteTemplate.callback).toBe('AnimBasicFistOrFoot');
    expect(gFistFootRandomPosSpriteTemplate.callback).toBe('AnimFistOrFootRandomPos');
    expect(gCrossChopHandSpriteTemplate.anims).toHaveLength(2);
    expect(gSlidingKickSpriteTemplate.anims).toHaveLength(4);
    expect(gSpinningHandOrFootSpriteTemplate.affineAnims).toHaveLength(1);
    expect(gMegaPunchKickSpriteTemplate.affineAnims).toHaveLength(1);
    expect(gStompFootSpriteTemplate.callback).toBe('AnimStompFoot');
    expect(gDizzyPunchDuckSpriteTemplate.tileTag).toBe('ANIM_TAG_DUCK');
    expect(gBrickBreakWallSpriteTemplate.oam).toBe('gOamData_AffineOff_ObjBlend_64x64');
    expect(gBrickBreakWallShardSpriteTemplate.tileTag).toBe('ANIM_TAG_TORN_METAL');
    expect(gSuperpowerOrbSpriteTemplate.affineAnims).toHaveLength(1);
    expect(gSuperpowerRockSpriteTemplate.callback).toBe('AnimSuperpowerRock');
    expect(gSuperpowerFireballSpriteTemplate.tileTag).toBe('ANIM_TAG_METEOR');
    expect(gArmThrustHandSpriteTemplate.callback).toBe('AnimArmThrustHit');
    expect(gRevengeSmallScratchSpriteTemplate.anims).toHaveLength(3);
    expect(gRevengeBigScratchSpriteTemplate.oam).toBe('gOamData_AffineOff_ObjNormal_64x64');
    expect(gFocusPunchFistSpriteTemplate.affineAnims).toHaveLength(1);
  });

  test('unused foot, slide hand, jump kick, and basic fist/foot preserve setup mutations and stored destroy callback', () => {
    const runtime = createFightRuntime({ battleAnimArgs: [8, 4, 12, 0, 2, 0, 3, 1] });
    const sprite = createFightSprite();
    animUnusedHumanoidFoot(runtime, sprite);
    expect(sprite.x).toBe(8);
    expect(sprite.y).toBe(4);
    expect(sprite.data[0]).toBe(15);
    expect(sprite.callback).toBe('WaitAnimForDuration');
    expect(sprite.storedCallback).toBe('DestroyAnimSprite');

    runtime.battleAnimAttacker = 1;
    runtime.battlerSides[1] = B_SIDE_OPPONENT;
    runtime.battleAnimArgs = [0, 5, 0, 7, 0, 0, 4, 1];
    const slide = createFightSprite();
    animSlideHandOrFootToTarget(runtime, slide);
    expect(runtime.battleAnimArgs[1]).toBe(-5);
    expect(runtime.battleAnimArgs[3]).toBe(-7);
    expect(runtime.battleAnimArgs[6]).toBe(0);
    expect(slide.animIndex).toBe(4);
    expect(slide.callback).toBe('StartAnimLinearTranslation');

    const jump = createFightRuntime({ contest: true, battleAnimArgs: [0, 6, 0, 9, 0, 0, 1, 0] });
    const jumpSprite = createFightSprite();
    animJumpKick(jump, jumpSprite);
    expect(jump.battleAnimArgs[1]).toBe(-6);
    expect(jump.battleAnimArgs[3]).toBe(-9);

    const basic = createFightRuntime({ battleAnimArgs: [3, -4, 17, 1, 2] });
    const basicSprite = createFightSprite();
    animBasicFistOrFoot(basic, basicSprite);
    expect(basicSprite.x).toBe(179);
    expect(basicSprite.y).toBe(68);
    expect(basicSprite.animIndex).toBe(2);
    expect(basicSprite.data[0]).toBe(17);
    expect(basicSprite.storedCallback).toBe('DestroyAnimSprite');
  });

  test('random fist/foot picks battler, random animation/offset signs, creates hit splat, and frees it on expiry', () => {
    const runtime = createFightRuntime({
      battleAnimArgs: [1, 3, -1],
      randomValues: [7, 11, 5, 1, 0]
    });
    const sprite = createFightSprite();
    sprite.subpriority = 4;
    animFistOrFootRandomPos(runtime, sprite);

    expect(runtime.battleAnimArgs[2]).toBe(2);
    expect(sprite.animIndex).toBe(2);
    expect(sprite.x).toBe(165);
    expect(sprite.y).toBe(77);
    expect(sprite.data[0]).toBe(3);
    expect(sprite.data[7]).not.toBe(MAX_SPRITES);
    expect(runtime.sprites[sprite.data[7]].callback).toBe('SpriteCallbackDummy');
    expect(runtime.operations[0]).toContain('CreateSprite:gBasicHitSplatSpriteTemplate');

    animFistOrFootRandomPosStep(runtime, sprite);
    expect(sprite.data[0]).toBe(2);
    sprite.data[0] = 0;
    animFistOrFootRandomPosStep(runtime, sprite);
    expect(runtime.sprites[sprite.data[7]].destroyed).toBe(true);
    expect(sprite.destroyed).toBe(true);
  });

  test('cross chop, sliding kick, spinning kick, and stomp perform their staged callback rewrites', () => {
    const cross = createFightRuntime({ battleAnimArgs: [0, 0, 1] });
    const crossSprite = createFightSprite();
    animCrossChopHand(cross, crossSprite);
    expect(crossSprite.data[2]).toBe(196);
    expect(crossSprite.hFlip).toBe(1);
    expect(crossSprite.storedCallback).toBe('AnimCrossChopHand_Step');
    crossSprite.x2 = 5;
    crossSprite.y2 = -2;
    crossSprite.data[5] = 10;
    animCrossChopHandStep(crossSprite);
    expect(crossSprite.data[0]).toBe(8);
    expect(crossSprite.x2).toBe(0);
    expect(crossSprite.storedCallback).toBe('DestroyAnimSprite');

    const kick = createFightRuntime({ battleAnimAttacker: 1, battleAnimArgs: [4, 2, 12, 2, 0x100, 3] });
    kick.battlerSides[1] = B_SIDE_OPPONENT;
    const kickSprite = createFightSprite();
    animSlidingKick(kick, kickSprite);
    expect(kick.battleAnimArgs[2]).toBe(-12);
    expect(kickSprite.data.slice(0, 8)).toEqual([2, 172, 160, 74, 74, 3, 0x100, 0]);
    animSlidingKickStep(kickSprite);
    expect(kickSprite.data[0]).toBe(1);
    kickSprite.data[0] = 0;
    animSlidingKickStep(kickSprite);
    expect(kickSprite.destroyed).toBe(true);

    const spin = createFightRuntime({ battleAnimArgs: [1, 2, 4, 13] });
    const spinSprite = createFightSprite();
    animSpinningKickOrPunch(spin, spinSprite);
    expect(spinSprite.animIndex).toBe(4);
    expect(spinSprite.data[0]).toBe(13);
    expect(spinSprite.storedCallback).toBe('AnimSpinningKickOrPunchFinish');
    animSpinningKickOrPunchFinish(spinSprite);
    expect(spinSprite.affineAnimIndex).toBe(0);
    expect(spinSprite.affineAnimPaused).toBe(1);
    expect(spinSprite.data[0]).toBe(20);

    const stomp = createFightRuntime({ battleAnimArgs: [0, -10, 0] });
    const stompSprite = createFightSprite();
    animStompFoot(stomp, stompSprite);
    animStompFootStep(stomp, stompSprite);
    expect(stompSprite.data[0]).toBe(6);
    expect(stompSprite.data[2]).toBe(176);
    expect(stompSprite.storedCallback).toBe('AnimStompFootEnd');
    animStompFootEnd(stompSprite);
    expect(stompSprite.data[0]).toBe(15);
  });

  test('dizzy punch duck oscillates, blinks after angle 100, and destroys past 120', () => {
    const runtime = createFightRuntime({ battleAnimArgs: [2, 3, 0x100, 99] });
    const sprite = createFightSprite();
    animDizzyPunchDuck(runtime, sprite);
    expect(sprite.x).toBe(178);
    expect(sprite.y).toBe(75);
    expect(sprite.data[1]).toBe(0x100);
    expect(sprite.data[2]).toBe(99);

    animDizzyPunchDuck(runtime, sprite);
    expect(sprite.x2).toBe(1);
    expect(sprite.data[3]).toBe(3);
    expect(sprite.invisible).toBe(false);
    sprite.data[3] = 121;
    animDizzyPunchDuck(runtime, sprite);
    expect(sprite.destroyed).toBe(true);
  });

  test('brick break wall waits, shakes, destroys, and shards choose all velocity quadrants', () => {
    const runtime = createFightRuntime({ battleAnimArgs: [1, 4, -5, 1, 2] });
    const wall = createFightSprite();
    animBrickBreakWall(runtime, wall);
    expect(wall.x).toBe(164);
    expect(wall.y).toBe(75);
    animBrickBreakWallStep(wall);
    expect(wall.data[0]).toBe(1);
    animBrickBreakWallStep(wall);
    expect(wall.x2).toBe(0);
    animBrickBreakWallStep(wall);
    expect(wall.x2).toBe(2);
    expect(wall.destroyed).toBe(true);

    for (const [tile, velocity] of [[0, [-3, -3]], [1, [3, -3]], [2, [-3, 3]], [3, [3, 3]]] as const) {
      const shardRuntime = createFightRuntime({ battleAnimArgs: [ANIM_ATTACKER, tile, 7, 8] });
      const shard = createFightSprite();
      animBrickBreakWallShard(shardRuntime, shard);
      expect(shard.oam.tileNum).toBe(tile * 16);
      expect(shard.data.slice(6, 8)).toEqual(velocity);
      animBrickBreakWallShardStep(shard);
      expect(shard.x).toBe(32 + 7 + velocity[0]);
      expect(shard.y).toBe(72 + 8 + velocity[1]);
    }

    const invalid = createFightSprite();
    animBrickBreakWallShard(createFightRuntime({ battleAnimArgs: [ANIM_TARGET, 4, 0, 0] }), invalid);
    expect(invalid.destroyed).toBe(true);
  });

  test('superpower orb, rock, and fireball mirror target selection, flips, linear data, and destroy bounds', () => {
    const orbRuntime = createFightRuntime({ battleAnimArgs: [0] });
    const orb = createFightSprite();
    animSuperpowerOrb(orbRuntime, orb);
    expect(orb.x).toBe(48);
    expect(orb.y).toBe(64);
    expect(orb.data.slice(0, 3)).toEqual([0, 12, 8]);
    orb.data[0] = 179;
    animSuperpowerOrbStep(orbRuntime, orb);
    expect(orbRuntime.gpuRegs.REG_OFFSET_BLDCNT).toBe(0);
    expect(orb.data.slice(0, 5)).toEqual([16, 48, 176, 64, 72]);
    expect(orb.callback).toBe('AnimTranslateLinear_WithFollowup');
    expect(orb.storedCallback).toBe('DestroySpriteAndMatrix');

    const rockRuntime = createFightRuntime({ battleAnimArgs: [20, 0x200, 2, 2] });
    const rock = createFightSprite();
    animSuperpowerRock(rockRuntime, rock);
    expect(rock.y).toBe(120);
    expect(rock.oam.tileNum).toBe(8);
    animSuperpowerRockStep1(rockRuntime, rock);
    expect(rock.y).toBe(118);
    rock.data[0] = 0;
    animSuperpowerRockStep1(rockRuntime, rock);
    expect(rock.callback).toBe('AnimSuperpowerRock_Step2');
    expect(rock.data.slice(0, 4)).toEqual([128, 8, 320, 1888]);
    for (let i = 0; i < 30 && !rock.destroyed; i++) animSuperpowerRockStep2(rock);
    expect(rock.destroyed).toBe(true);

    const fireballRuntime = createFightRuntime({ battleAnimArgs: [ANIM_ATTACKER] });
    fireballRuntime.battlerSides[1] = B_SIDE_PLAYER;
    const fireball = createFightSprite();
    animSuperpowerFireball(fireballRuntime, fireball);
    expect(fireball.oam.matrixNum & (ST_OAM_HFLIP | ST_OAM_VFLIP)).toBe(ST_OAM_HFLIP | ST_OAM_VFLIP);
    expect(fireball.data.slice(0, 5)).toEqual([16, 48, 176, 64, 72]);
    expect(fireball.storedCallback).toBe('DestroyAnimSprite');
  });

  test('arm thrust, revenge scratch, focus punch, and sky uppercut BG task keep C branch behavior', () => {
    const arm = createFightRuntime({ battleAnimArgs: [9, -4, 3, 1], animMoveTurn: 0 });
    arm.battlerSides[1] = B_SIDE_PLAYER;
    const armSprite = createFightSprite();
    animArmThrustHit(arm, armSprite);
    expect(armSprite.animIndex).toBe(2);
    expect(armSprite.x2).toBe(-9);
    expect(armSprite.y2).toBe(-4);
    armSprite.data[0] = 3;
    animArmThrustHitStep(armSprite);
    expect(armSprite.destroyed).toBe(true);

    const revenge = createFightRuntime({ battleAnimAttacker: 1, battleAnimArgs: [5, 6, ANIM_ATTACKER] });
    revenge.battlerSides[1] = B_SIDE_OPPONENT;
    const revengeSprite = createFightSprite();
    animRevengeScratch(revenge, revengeSprite);
    expect(revengeSprite.animIndex).toBe(1);
    expect(revengeSprite.callback).toBe('RunStoredCallbackWhenAnimEnds');

    const focus = createFightSprite();
    focus.affineAnimEnded = true;
    for (let i = 0; i < 41; i++) animFocusPunchFist(focus);
    expect(focus.destroyed).toBe(true);

    const sky = createFightRuntime({ battleAnimArgs: [2, 0, 0, 0, 0, 0, 0, 0] });
    const taskId = createFightTask(sky);
    animTaskMoveSkyUppercutBg(sky, taskId);
    expect(sky.bg3Mode).toBe(0);
    expect(sky.tasks[taskId]?.data[8]).toBe(2);
    animTaskMoveSkyUppercutBg(sky, taskId);
    animTaskMoveSkyUppercutBg(sky, taskId);
    animTaskMoveSkyUppercutBg(sky, taskId);
    expect(sky.tasks[taskId]?.data[0]).toBe(2);
    animTaskMoveSkyUppercutBg(sky, taskId);
    expect(sky.battleBg3X).toBeLessThan(0);
    expect(sky.battleBg3Y).toBeGreaterThan(0);
    sky.battleAnimArgs[7] = -1;
    animTaskMoveSkyUppercutBg(sky, taskId);
    expect(sky.battleBg3X).toBe(0);
    expect(sky.battleBg3Y).toBe(0);
    expect(sky.bg3Mode).toBe(1);
    expect(sky.tasks[taskId]?.destroyed).toBe(true);
  });
});
