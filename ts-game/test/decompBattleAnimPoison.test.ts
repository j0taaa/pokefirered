import { describe, expect, test } from 'vitest';
import {
  ANIM_TAG_POISON_BUBBLE,
  ANIM_TAG_SMALL_BUBBLES,
  AnimAcidPoisonBubble,
  AnimAcidPoisonBubble_Step,
  AnimAcidPoisonDroplet,
  AnimBubbleEffect,
  AnimBubbleEffect_Step,
  AnimSludgeBombHitParticle,
  AnimSludgeBombHitParticle_Step,
  AnimSludgeProjectile,
  AnimSludgeProjectile_Step,
  B_SIDE_OPPONENT,
  B_SIDE_PLAYER,
  animAcidPoisonBubble,
  animAcidPoisonBubbleStep,
  animAcidPoisonDroplet,
  animBubbleEffect,
  animBubbleEffectStep,
  animSludgeBombHitParticle,
  animSludgeBombHitParticleStep,
  animSludgeProjectile,
  animSludgeProjectileStep,
  createPoisonAnimRuntime,
  createPoisonAnimSprite,
  gAcidPoisonBubbleSpriteTemplate,
  gPoisonBubbleSpriteTemplate,
  gSludgeProjectileSpriteTemplate,
  gWaterBubbleSpriteTemplate,
  sin
} from '../src/game/decompBattleAnimPoison';

describe('decomp battle_anim_poison', () => {
  test('sprite templates preserve poison bubble tags and callbacks', () => {
    expect(gSludgeProjectileSpriteTemplate).toMatchObject({
      tileTag: ANIM_TAG_POISON_BUBBLE,
      paletteTag: ANIM_TAG_POISON_BUBBLE,
      callback: 'AnimSludgeProjectile'
    });
    expect(gAcidPoisonBubbleSpriteTemplate.callback).toBe('AnimAcidPoisonBubble');
    expect(gPoisonBubbleSpriteTemplate.callback).toBe('AnimBubbleEffect');
    expect(gWaterBubbleSpriteTemplate).toMatchObject({
      tileTag: ANIM_TAG_SMALL_BUBBLES,
      paletteTag: ANIM_TAG_SMALL_BUBBLES,
      callback: 'AnimBubbleEffect'
    });
  });

  test('AnimSludgeProjectile initializes arc data toward target and destroys when arc finishes', () => {
    const runtime = createPoisonAnimRuntime();
    runtime.battleAnimArgs = [3, 4, 2, 0, 0, 0, 0, 0];
    const sprite = createPoisonAnimSprite();

    animSludgeProjectile(runtime, sprite);

    expect(sprite.animIndex).toBe(2);
    expect(sprite.x).toBe(43);
    expect(sprite.y).toBe(76);
    expect(sprite.data.slice(0, 6)).toEqual([2, 0, 168, 0, 64, -30]);
    expect(sprite.callback).toBe('AnimSludgeProjectile_Step');

    animSludgeProjectileStep(sprite);
    expect(sprite.destroyed).toBe(false);
    animSludgeProjectileStep(sprite);
    expect(sprite.destroyed).toBe(true);
  });

  test('AnimAcidPoisonBubble flips horizontal offset for non-player attacker and uses average target position', () => {
    const runtime = createPoisonAnimRuntime();
    runtime.battleAnimAttacker = 1;
    runtime.battlerSides[1] = B_SIDE_OPPONENT;
    runtime.battleAnimArgs = [0, 0, 1, 0, 12, -6, 0, 0];
    const sprite = createPoisonAnimSprite();

    animAcidPoisonBubble(runtime, sprite);

    expect(runtime.battleAnimArgs[4]).toBe(-12);
    expect(sprite.data.slice(0, 6)).toEqual([1, 0, 156, 0, 58, -30]);
    expect(sprite.callback).toBe('AnimAcidPoisonBubble_Step');
    animAcidPoisonBubbleStep(sprite);
    expect(sprite.destroyed).toBe(true);
  });

  test('AnimSludgeBombHitParticle stores linear translation data and subtracts fixed-point deltas each step', () => {
    const runtime = createPoisonAnimRuntime();
    runtime.battleAnimArgs = [18, -9, 3, 0, 0, 0, 0, 0];
    const sprite = createPoisonAnimSprite(30, 21);

    animSludgeBombHitParticle(runtime, sprite);

    expect(sprite.data.slice(0, 7)).toEqual([3, 30, 48, 21, 12, 10, 16]);
    expect(sprite.callback).toBe('AnimSludgeBombHitParticle_Step');
    animSludgeBombHitParticleStep(sprite);
    expect(sprite.data.slice(0, 3)).toEqual([2, 20, 32]);
    expect(sprite.destroyed).toBe(false);
    animSludgeBombHitParticleStep(sprite);
    animSludgeBombHitParticleStep(sprite);
    expect(sprite.destroyed).toBe(true);
  });

  test('AnimAcidPoisonDroplet positions from target average, flips for opponent attacker, and stores destroy callback', () => {
    const runtime = createPoisonAnimRuntime();
    runtime.battleAnimAttacker = 1;
    runtime.battlerSides[1] = B_SIDE_OPPONENT;
    runtime.battleAnimArgs = [7, 5, 11, 0, 13, 0, 0, 0];
    const sprite = createPoisonAnimSprite();

    animAcidPoisonDroplet(runtime, sprite);

    expect(runtime.battleAnimArgs[0]).toBe(-7);
    expect(sprite.x).toBe(161);
    expect(sprite.y).toBe(69);
    expect(sprite.data[0]).toBe(13);
    expect(sprite.data[2]).toBe(172);
    expect(sprite.data[4]).toBe(82);
    expect(sprite.callback).toBe('StartAnimLinearTranslation');
    expect(sprite.storedCallback).toBe('DestroyAnimSprite');
  });

  test('AnimBubbleEffect uses target position for single target and average position for multitarget', () => {
    const single = createPoisonAnimRuntime();
    single.battleAnimArgs = [4, -3, 0, 0, 0, 0, 0, 0];
    const singleSprite = createPoisonAnimSprite();
    animBubbleEffect(single, singleSprite);
    expect(singleSprite).toMatchObject({ x: 172, y: 61, callback: 'AnimBubbleEffect_Step' });

    const multi = createPoisonAnimRuntime();
    multi.battleAnimAttacker = 0;
    multi.battlerSides[0] = B_SIDE_PLAYER;
    multi.battleAnimArgs = [5, 6, 1, 0, 0, 0, 0, 0];
    const multiSprite = createPoisonAnimSprite();
    animBubbleEffect(multi, multiSprite);
    expect(multiSprite).toMatchObject({ x: 173, y: 70, callback: 'AnimBubbleEffect_Step' });
  });

  test('AnimBubbleEffect_Step sways via Sin, rises in fixed-point, and destroys after affine anim ends', () => {
    const sprite = createPoisonAnimSprite();

    animBubbleEffectStep(sprite);

    expect(sprite.data[0]).toBe(0x0b);
    expect(sprite.x2).toBe(sin(0x0b, 4));
    expect(sprite.data[1]).toBe(0x30);
    expect(sprite.y2).toBe(0);
    expect(sprite.destroyed).toBe(false);

    sprite.affineAnimEnded = true;
    animBubbleEffectStep(sprite);
    expect(sprite.destroyed).toBe(true);
  });

  test('exact C-name poison animation callbacks preserve projectile, droplet, particle, and bubble behavior', () => {
    const projectileRuntime = createPoisonAnimRuntime();
    projectileRuntime.battleAnimArgs = [3, 4, 2, 0, 0, 0, 0, 0];
    const projectile = createPoisonAnimSprite();
    AnimSludgeProjectile(projectileRuntime, projectile);
    expect(projectile.data.slice(0, 6)).toEqual([2, 0, 168, 0, 64, -30]);
    expect(projectile.callback).toBe('AnimSludgeProjectile_Step');
    AnimSludgeProjectile_Step(projectile);
    AnimSludgeProjectile_Step(projectile);
    expect(projectile.destroyed).toBe(true);

    const acidRuntime = createPoisonAnimRuntime();
    acidRuntime.battleAnimAttacker = 1;
    acidRuntime.battlerSides[1] = B_SIDE_OPPONENT;
    acidRuntime.battleAnimArgs = [0, 0, 1, 0, 12, -6, 0, 0];
    const acid = createPoisonAnimSprite();
    AnimAcidPoisonBubble(acidRuntime, acid);
    expect(acidRuntime.battleAnimArgs[4]).toBe(-12);
    expect(acid.data.slice(0, 6)).toEqual([1, 0, 156, 0, 58, -30]);
    AnimAcidPoisonBubble_Step(acid);
    expect(acid.destroyed).toBe(true);

    const particleRuntime = createPoisonAnimRuntime();
    particleRuntime.battleAnimArgs = [18, -9, 3, 0, 0, 0, 0, 0];
    const particle = createPoisonAnimSprite(30, 21);
    AnimSludgeBombHitParticle(particleRuntime, particle);
    expect(particle.data.slice(0, 7)).toEqual([3, 30, 48, 21, 12, 10, 16]);
    AnimSludgeBombHitParticle_Step(particle);
    expect(particle.data.slice(0, 3)).toEqual([2, 20, 32]);

    const dropletRuntime = createPoisonAnimRuntime();
    dropletRuntime.battleAnimArgs = [7, 5, 11, 0, 13, 0, 0, 0];
    const droplet = createPoisonAnimSprite();
    AnimAcidPoisonDroplet(dropletRuntime, droplet);
    expect(droplet).toMatchObject({ x: 175, y: 69, callback: 'StartAnimLinearTranslation' });
    expect(droplet.storedCallback).toBe('DestroyAnimSprite');

    const bubbleRuntime = createPoisonAnimRuntime();
    bubbleRuntime.battleAnimArgs = [4, -3, 0, 0, 0, 0, 0, 0];
    const bubble = createPoisonAnimSprite();
    AnimBubbleEffect(bubbleRuntime, bubble);
    expect(bubble).toMatchObject({ x: 172, y: 61, callback: 'AnimBubbleEffect_Step' });
    AnimBubbleEffect_Step(bubble);
    expect(bubble.x2).toBe(sin(0x0b, 4));
    bubble.affineAnimEnded = true;
    AnimBubbleEffect_Step(bubble);
    expect(bubble.destroyed).toBe(true);
  });
});
