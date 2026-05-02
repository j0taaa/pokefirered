import { describe, expect, test } from 'vitest';
import {
  ANIM_ATTACKER,
  ANIM_TARGET,
  AnimCirclingSparkle,
  AnimComplexPaletteBlend,
  AnimComplexPaletteBlend_Step1,
  AnimComplexPaletteBlend_Step2,
  AnimConfusionDuck,
  AnimConfusionDuck_Step,
  AnimCrossImpact,
  AnimFlashingHitSplat,
  AnimFlashingHitSplat_Step,
  AnimHitSplatBasic,
  AnimHitSplatHandleInvert,
  AnimHitSplatOnMonEdge,
  AnimHitSplatPersistent,
  AnimHitSplatRandom,
  AnimShakeMonOrBattleTerrain,
  AnimShakeMonOrBattleTerrain_Step,
  AnimShakeMonOrBattleTerrain_UpdateCoordOffsetEnabled,
  AnimSimplePaletteBlend,
  AnimSimplePaletteBlend_Step,
  AnimTask_BlendColorCycle,
  AnimTask_BlendColorCycleByTag,
  AnimTask_BlendColorCycleByTagLoop,
  AnimTask_BlendColorCycleExclude,
  AnimTask_BlendColorCycleExcludeLoop,
  AnimTask_BlendColorCycleLoop,
  AnimTask_FlashAnimTagWithColor,
  AnimTask_FlashAnimTagWithColor_Step1,
  AnimTask_FlashAnimTagWithColor_Step2,
  AnimTask_InvertScreenColor,
  AnimTask_ShakeBattleTerrain,
  AnimTask_ShakeBattleTerrain_Step,
  AnimTask_TintPalettes,
  B_SIDE_OPPONENT,
  BlendColorCycle,
  BlendColorCycleByTag,
  BlendColorCycleExclude,
  UnpackSelectedBattlePalettes,
  animCirclingSparkle,
  animComplexPaletteBlend,
  animComplexPaletteBlendStep1,
  animComplexPaletteBlendStep2,
  animConfusionDuck,
  animConfusionDuckStep,
  animCrossImpact,
  animFlashingHitSplat,
  animFlashingHitSplatStep,
  animHitSplatBasic,
  animHitSplatHandleInvert,
  animHitSplatOnMonEdge,
  animHitSplatPersistent,
  animHitSplatRandom,
  animShakeMonOrBattleTerrain,
  animShakeMonOrBattleTerrainStep,
  animShakeMonOrBattleTerrainUpdateCoordOffsetEnabled,
  animSimplePaletteBlend,
  animSimplePaletteBlendStep,
  animTaskBlendColorCycle,
  animTaskBlendColorCycleByTag,
  animTaskBlendColorCycleByTagLoop,
  animTaskBlendColorCycleExclude,
  animTaskBlendColorCycleExcludeLoop,
  animTaskBlendColorCycleLoop,
  animTaskFlashAnimTagWithColor,
  animTaskFlashAnimTagWithColorStep1,
  animTaskFlashAnimTagWithColorStep2,
  animTaskInvertScreenColor,
  animTaskShakeBattleTerrain,
  animTaskShakeBattleTerrainStep,
  animTaskTintPalettes,
  createNormalRuntime,
  createNormalSprite,
  createNormalTask,
  blendColorCycle,
  blendColorCycleByTag,
  blendColorCycleExclude,
  gBasicHitSplatSpriteTemplate,
  gComplexPaletteBlendSpriteTemplate,
  gConfusionDuckSpriteTemplate,
  gCrossImpactSpriteTemplate,
  gFlashingHitSplatSpriteTemplate,
  gHandleInvertHitSplatSpriteTemplate,
  gMonEdgeHitSplatSpriteTemplate,
  gPersistHitSplatSpriteTemplate,
  gRandomPosHitSplatSpriteTemplate,
  gShakeMonOrTerrainSpriteTemplate,
  gSimplePaletteBlendSpriteTemplate,
  gWaterHitSplatSpriteTemplate,
  sCirclingSparkleSpriteTemplate,
  unpackSelectedBattlePalettes
} from '../src/game/decompBattleAnimNormal';

describe('decomp battle_anim_normal.c parity', () => {
  test('exports exact C callback and task names as aliases of the implemented logic', () => {
    expect(AnimConfusionDuck).toBe(animConfusionDuck);
    expect(AnimConfusionDuck_Step).toBe(animConfusionDuckStep);
    expect(AnimSimplePaletteBlend).toBe(animSimplePaletteBlend);
    expect(UnpackSelectedBattlePalettes).toBe(unpackSelectedBattlePalettes);
    expect(AnimSimplePaletteBlend_Step).toBe(animSimplePaletteBlendStep);
    expect(AnimComplexPaletteBlend).toBe(animComplexPaletteBlend);
    expect(AnimComplexPaletteBlend_Step1).toBe(animComplexPaletteBlendStep1);
    expect(AnimComplexPaletteBlend_Step2).toBe(animComplexPaletteBlendStep2);
    expect(AnimCirclingSparkle).toBe(animCirclingSparkle);
    expect(AnimTask_BlendColorCycle).toBe(animTaskBlendColorCycle);
    expect(BlendColorCycle).toBe(blendColorCycle);
    expect(AnimTask_BlendColorCycleLoop).toBe(animTaskBlendColorCycleLoop);
    expect(AnimTask_BlendColorCycleExclude).toBe(animTaskBlendColorCycleExclude);
    expect(BlendColorCycleExclude).toBe(blendColorCycleExclude);
    expect(AnimTask_BlendColorCycleExcludeLoop).toBe(animTaskBlendColorCycleExcludeLoop);
    expect(AnimTask_BlendColorCycleByTag).toBe(animTaskBlendColorCycleByTag);
    expect(BlendColorCycleByTag).toBe(blendColorCycleByTag);
    expect(AnimTask_BlendColorCycleByTagLoop).toBe(animTaskBlendColorCycleByTagLoop);
    expect(AnimTask_FlashAnimTagWithColor).toBe(animTaskFlashAnimTagWithColor);
    expect(AnimTask_FlashAnimTagWithColor_Step1).toBe(animTaskFlashAnimTagWithColorStep1);
    expect(AnimTask_FlashAnimTagWithColor_Step2).toBe(animTaskFlashAnimTagWithColorStep2);
    expect(AnimTask_InvertScreenColor).toBe(animTaskInvertScreenColor);
    expect(AnimTask_TintPalettes).toBe(animTaskTintPalettes);
    expect(AnimShakeMonOrBattleTerrain).toBe(animShakeMonOrBattleTerrain);
    expect(AnimShakeMonOrBattleTerrain_Step).toBe(animShakeMonOrBattleTerrainStep);
    expect(AnimShakeMonOrBattleTerrain_UpdateCoordOffsetEnabled).toBe(animShakeMonOrBattleTerrainUpdateCoordOffsetEnabled);
    expect(AnimTask_ShakeBattleTerrain).toBe(animTaskShakeBattleTerrain);
    expect(AnimTask_ShakeBattleTerrain_Step).toBe(animTaskShakeBattleTerrainStep);
    expect(AnimHitSplatBasic).toBe(animHitSplatBasic);
    expect(AnimHitSplatPersistent).toBe(animHitSplatPersistent);
    expect(AnimHitSplatHandleInvert).toBe(animHitSplatHandleInvert);
    expect(AnimHitSplatRandom).toBe(animHitSplatRandom);
    expect(AnimHitSplatOnMonEdge).toBe(animHitSplatOnMonEdge);
    expect(AnimCrossImpact).toBe(animCrossImpact);
    expect(AnimFlashingHitSplat).toBe(animFlashingHitSplat);
    expect(AnimFlashingHitSplat_Step).toBe(animFlashingHitSplatStep);
  });

  test('sprite templates preserve normal animation tags, affine tables, and callback identities', () => {
    expect(gConfusionDuckSpriteTemplate.anims).toHaveLength(2);
    expect(gSimplePaletteBlendSpriteTemplate.callback).toBe('AnimSimplePaletteBlend');
    expect(gComplexPaletteBlendSpriteTemplate.callback).toBe('AnimComplexPaletteBlend');
    expect(sCirclingSparkleSpriteTemplate.tileTag).toBe('ANIM_TAG_SPARKLE_4');
    expect(gShakeMonOrTerrainSpriteTemplate.callback).toBe('AnimShakeMonOrBattleTerrain');
    expect(gBasicHitSplatSpriteTemplate.affineAnims).toHaveLength(4);
    expect(gHandleInvertHitSplatSpriteTemplate.callback).toBe('AnimHitSplatHandleInvert');
    expect(gWaterHitSplatSpriteTemplate.tileTag).toBe('ANIM_TAG_WATER_IMPACT');
    expect(gRandomPosHitSplatSpriteTemplate.callback).toBe('AnimHitSplatRandom');
    expect(gMonEdgeHitSplatSpriteTemplate.callback).toBe('AnimHitSplatOnMonEdge');
    expect(gCrossImpactSpriteTemplate.callback).toBe('AnimCrossImpact');
    expect(gFlashingHitSplatSpriteTemplate.callback).toBe('AnimFlashingHitSplat');
    expect(gPersistHitSplatSpriteTemplate.callback).toBe('AnimHitSplatPersistent');
  });

  test('confusion duck chooses side-dependent wave direction, priority, animation, and duration destroy', () => {
    const player = createNormalRuntime({ battleAnimArgs: [3, -2, 64, 8, 2] });
    const sprite = createNormalSprite();
    animConfusionDuck(player, sprite);
    expect(sprite.x).toBe(3);
    expect(sprite.y).toBe(-2);
    expect(sprite.animIndex).toBe(1);
    expect(sprite.data[1]).toBe(8);
    expect(sprite.oam.priority).toBe(1);
    expect(sprite.callback).toBe('AnimConfusionDuck_Step');
    animConfusionDuckStep(sprite);
    expect(sprite.destroyed).toBe(true);

    const opponent = createNormalRuntime({ battleAnimAttacker: 1, battleAnimArgs: [0, 0, 192, 6, 9] });
    opponent.battlerSides[1] = B_SIDE_OPPONENT;
    const oppSprite = createNormalSprite();
    animConfusionDuck(opponent, oppSprite);
    expect(oppSprite.data[1]).toBe(-6);
    expect(oppSprite.data[4]).toBe(1);
    expect(oppSprite.oam.priority).toBe(3);
  });

  test('simple and complex palette blends use unpacked palette masks and exact callback transitions', () => {
    const runtime = createNormalRuntime({ battleAnimArgs: [0x7f, 2, 3, 4, 0x1234] });
    expect(unpackSelectedBattlePalettes(runtime, 0x7f)).toBe(0x000e | (1 << 16) | (1 << 17) | (1 << 18) | (1 << 19) | (1 << 8) | (1 << 9));
    const simple = createNormalSprite();
    animSimplePaletteBlend(runtime, simple);
    expect(simple.invisible).toBe(true);
    expect(runtime.paletteFades.at(-1)).toEqual({ palettes: unpackSelectedBattlePalettes(runtime, 0x7f), delay: 2, start: 3, end: 4, color: 0x1234 });
    animSimplePaletteBlendStep(runtime, simple);
    expect(simple.destroyed).toBe(true);

    const complexRuntime = createNormalRuntime({ battleAnimArgs: [0x03, 0, 2, 11, 5, 22, 7] });
    const complex = createNormalSprite();
    animComplexPaletteBlend(complexRuntime, complex);
    expect(complex.callback).toBe('AnimComplexPaletteBlend_Step1');
    expect(complexRuntime.paletteBlends.at(-1)).toEqual({ palettes: unpackSelectedBattlePalettes(complexRuntime, 0x03), amount: 5, color: 11 });
    animComplexPaletteBlendStep1(complexRuntime, complex);
    expect(complex.data[1]).toBe(0x100);
    expect(complex.data[2]).toBe(1);
    expect(complexRuntime.paletteBlends.at(-1)).toEqual({ palettes: unpackSelectedBattlePalettes(complexRuntime, 0x03), amount: 7, color: 22 });
    complex.data[0] = 0;
    animComplexPaletteBlendStep1(complexRuntime, complex);
    expect(complex.data[2]).toBe(0);
    complex.data[0] = 0;
    animComplexPaletteBlendStep1(complexRuntime, complex);
    expect(complex.callback).toBe('AnimComplexPaletteBlend_Step2');
    animComplexPaletteBlendStep2(complexRuntime, complex);
    expect(complexRuntime.paletteBlends.at(-1)).toEqual({ palettes: unpackSelectedBattlePalettes(complexRuntime, 0x03), amount: 0, color: 0 });
    expect(complex.destroyed).toBe(true);
  });

  test('circling sparkle and color-cycle tasks initialize and alternate exactly through final restore', () => {
    const sparkleRuntime = createNormalRuntime({ battleAnimArgs: [4, 5] });
    const sparkle = createNormalSprite();
    animCirclingSparkle(sparkleRuntime, sparkle);
    expect(sparkle.x).toBe(4);
    expect(sparkle.y).toBe(5);
    expect(sparkle.data.slice(0, 6)).toEqual([0, 10, 8, 40, 112, 0]);
    expect(sparkle.storedCallback).toBe('DestroySpriteAndMatrix');

    const runtime = createNormalRuntime({ battleAnimArgs: [0x03, 1, 3, 2, 10, 0x5555] });
    const taskId = createNormalTask(runtime);
    animTaskBlendColorCycle(runtime, taskId);
    const task = runtime.tasks[taskId]!;
    expect(task.func).toBe('AnimTask_BlendColorCycleLoop');
    expect(task.data[2]).toBe(2);
    expect(task.data[8]).toBe(1);
    expect(runtime.paletteFades.at(-1)?.start).toBe(0);
    animTaskBlendColorCycleLoop(runtime, taskId);
    expect(runtime.paletteFades.at(-1)).toMatchObject({ start: 10, end: 2 });
    animTaskBlendColorCycleLoop(runtime, taskId);
    expect(runtime.paletteFades.at(-1)).toMatchObject({ start: 2, end: 0 });
    animTaskBlendColorCycleLoop(runtime, taskId);
    expect(runtime.tasks[taskId]?.destroyed).toBe(true);
  });

  test('exclude, by-tag, flash, invert, and tint palette tasks preserve selected masks and timers', () => {
    const exclude = createNormalRuntime({ battleAnimArgs: [1, 0, 2, 4, 8, 0x2222] });
    const excludeTask = createNormalTask(exclude);
    animTaskBlendColorCycleExclude(exclude, excludeTask);
    expect(exclude.paletteFades.at(-1)?.palettes).toBe((1 << 18) | (1 << 19) | 0x0e);
    animTaskBlendColorCycleExcludeLoop(exclude, excludeTask);
    animTaskBlendColorCycleExcludeLoop(exclude, excludeTask);
    expect(exclude.tasks[excludeTask]?.destroyed).toBe(true);

    const byTag = createNormalRuntime({ battleAnimArgs: [42, 0, 2, 1, 9, 0x1111], paletteTagIndexes: { 42: 5 } });
    const byTagTask = createNormalTask(byTag);
    animTaskBlendColorCycleByTag(byTag, byTagTask);
    expect(byTag.paletteFades.at(-1)?.palettes).toBe(1 << 21);
    animTaskBlendColorCycleByTagLoop(byTag, byTagTask);
    animTaskBlendColorCycleByTagLoop(byTag, byTagTask);
    expect(byTag.tasks[byTagTask]?.destroyed).toBe(true);

    const flash = createNormalRuntime({ battleAnimArgs: [77, 0, 1, 0x3333, 6, 0x4444, 10], paletteTagIndexes: { 77: 4 } });
    const flashTask = createNormalTask(flash);
    animTaskFlashAnimTagWithColor(flash, flashTask);
    expect(flash.paletteFades.at(-1)).toMatchObject({ palettes: 1 << 20, start: 6, end: 6, color: 0x3333 });
    animTaskFlashAnimTagWithColorStep1(flash, flashTask);
    expect(flash.paletteFades.at(-1)).toMatchObject({ start: 10, end: 10, color: 0x4444 });
    animTaskFlashAnimTagWithColorStep1(flash, flashTask);
    expect(flash.tasks[flashTask]?.func).toBe('AnimTask_FlashAnimTagWithColor_Step2');
    animTaskFlashAnimTagWithColorStep2(flash, flashTask);
    expect(flash.tasks[flashTask]?.destroyed).toBe(true);

    const invert = createNormalRuntime({ battleAnimArgs: [0x100, 0x100, 0x100], battleAnimAttacker: 0, battleAnimTarget: 1 });
    const invertTask = createNormalTask(invert);
    animTaskInvertScreenColor(invert, invertTask);
    expect(invert.invertedPalettes[0]).toBe(0x0e | (0x10000 << 0) | (0x10000 << 1));

    const tint = createNormalRuntime({ battleAnimArgs: [0x101, 0x100, 0x100, 2, 1, 2, 3], paletteTagIndexes: { 9: 6 } });
    tint.sprites[tint.healthboxSpriteIds[0]].templatePaletteTag = 9;
    const tintTask = createNormalTask(tint);
    animTaskTintPalettes(tint, tintTask);
    expect(tint.tintedPalettes.at(-1)).toMatchObject({ palettes: 0xffff | (1 << 22) | (1 << 16) | (1 << 17), r: 1, g: 2, b: 3 });
    animTaskTintPalettes(tint, tintTask);
    expect(tint.unfadedPalettes).toHaveLength(1);
    expect(tint.tasks[tintTask]?.destroyed).toBe(true);
  });

  test('shake sprite and terrain task mutate selected target refs, coord flags, and cleanup state', () => {
    const runtime = createNormalRuntime({ battleAnimArgs: [5, 0, 2, 2, 2], spriteCoordOffsetX: 9 });
    const sprite = createNormalSprite();
    animShakeMonOrBattleTerrain(runtime, sprite);
    expect(sprite.invisible).toBe(true);
    expect(runtime.sprites[0].coordOffsetEnabled).toBe(true);
    expect(runtime.sprites[1].coordOffsetEnabled).toBe(true);
    animShakeMonOrBattleTerrainStep(runtime, sprite);
    expect(runtime.spriteCoordOffsetX).toBe(4);
    animShakeMonOrBattleTerrainStep(runtime, sprite);
    expect(runtime.spriteCoordOffsetX).toBe(9);
    sprite.data[3] = 0;
    animShakeMonOrBattleTerrainStep(runtime, sprite);
    expect(runtime.spriteCoordOffsetX).toBe(9);
    expect(sprite.destroyed).toBe(true);
    expect(runtime.sprites[0].coordOffsetEnabled).toBe(false);

    const terrain = createNormalRuntime({ battleAnimArgs: [6, 3, 2, 0] });
    const taskId = createNormalTask(terrain);
    animTaskShakeBattleTerrain(terrain, taskId);
    expect(terrain.battleBg3X).toBe(-6);
    expect(terrain.battleBg3Y).toBe(-3);
    animTaskShakeBattleTerrainStep(terrain, taskId);
    expect(terrain.battleBg3X).toBe(0);
    expect(terrain.battleBg3Y).toBe(0);
    expect(terrain.tasks[taskId]?.destroyed).toBe(true);
  });

  test('hit splat variants position against attacker/target, random offsets, mon edge, persistence, cross impact, and flashing', () => {
    const basicRuntime = createNormalRuntime({ battleAnimArgs: [4, -3, 0, 2, 9] });
    const basic = createNormalSprite();
    animHitSplatBasic(basicRuntime, basic);
    expect(basic.x).toBe(52);
    expect(basic.y).toBe(61);
    expect(basic.affineAnimIndex).toBe(2);
    expect(basic.storedCallback).toBe('DestroyAnimSprite');

    const persist = createNormalSprite();
    animHitSplatPersistent(basicRuntime, persist);
    expect(persist.data[0]).toBe(9);
    expect(persist.storedCallback).toBe('DestroyAnimSpriteAfterTimer');

    const invert = createNormalRuntime({ battleAnimAttacker: 1, battleAnimArgs: [5, 7, 1, 3] });
    invert.battlerSides[1] = B_SIDE_OPPONENT;
    const invertSprite = createNormalSprite();
    animHitSplatHandleInvert(invert, invertSprite);
    expect(invert.battleAnimArgs[1]).toBe(-7);
    expect(invertSprite.y).toBe(65);

    const random = createNormalRuntime({ battleAnimArgs: [ANIM_TARGET, -1], randomValues: [6, 50, 35] });
    const randomSprite = createNormalSprite();
    animHitSplatRandom(random, randomSprite);
    expect(random.battleAnimArgs[1]).toBe(2);
    expect(randomSprite.x2).toBe(-22);
    expect(randomSprite.y2).toBe(-1);
    expect(randomSprite.storedCallback).toBe('DestroySpriteAndMatrix');

    const edgeRuntime = createNormalRuntime({ battleAnimArgs: [ANIM_ATTACKER, 11, -12, 1] });
    edgeRuntime.sprites[0].x = 40;
    edgeRuntime.sprites[0].x2 = 3;
    edgeRuntime.sprites[0].y = 50;
    edgeRuntime.sprites[0].y2 = -2;
    const edge = createNormalSprite();
    animHitSplatOnMonEdge(edgeRuntime, edge);
    expect(edge.x).toBe(43);
    expect(edge.y).toBe(48);
    expect(edge.x2).toBe(11);
    expect(edge.y2).toBe(-12);

    const cross = createNormalSprite();
    animCrossImpact(createNormalRuntime({ battleAnimArgs: [2, 3, ANIM_TARGET, 17] }), cross);
    expect(cross.x).toBe(178);
    expect(cross.y).toBe(75);
    expect(cross.data[0]).toBe(17);
    expect(cross.callback).toBe('WaitAnimForDuration');

    const flash = createNormalSprite();
    animFlashingHitSplat(createNormalRuntime({ battleAnimArgs: [1, 2, ANIM_ATTACKER, 3] }), flash);
    expect(flash.callback).toBe('AnimFlashingHitSplat_Step');
    for (let i = 0; i < 14; i++) animFlashingHitSplatStep(flash);
    expect(flash.destroyed).toBe(true);
  });
});
