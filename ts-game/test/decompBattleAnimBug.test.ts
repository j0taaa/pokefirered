import { describe, expect, test } from 'vitest';
import {
  B_SIDE_OPPONENT,
  B_SIDE_PLAYER,
  AnimLeechLifeNeedle,
  AnimMegahornHorn,
  AnimMissileArc,
  AnimMissileArc_Step,
  AnimSpiderWeb,
  AnimSpiderWeb_End,
  AnimSpiderWeb_Step,
  AnimStringWrap,
  AnimStringWrap_Step,
  AnimTailGlowOrb,
  AnimTranslateStinger,
  AnimTranslateWebThread,
  AnimTranslateWebThread_Step,
  animLeechLifeNeedle,
  animMegahornHorn,
  animMissileArc,
  animMissileArcStep,
  animSpiderWeb,
  animSpiderWebEnd,
  animSpiderWebStep,
  animStringWrap,
  animStringWrapStep,
  animTailGlowOrb,
  animTranslateStinger,
  animTranslateWebThread,
  animTranslateWebThreadStep,
  createBugRuntime,
  createBugSprite,
  gIcicleSpearSpriteTemplate,
  gMegahornHornSpriteTemplate,
  gPinMissileSpriteTemplate,
  gSpiderWebSpriteTemplate,
  gTailGlowOrbSpriteTemplate,
  gWebThreadSpriteTemplate
} from '../src/game/decompBattleAnimBug';

describe('decomp battle_anim_bug', () => {
  test('exact C callback names are exported as the implemented callbacks', () => {
    expect(AnimMegahornHorn).toBe(animMegahornHorn);
    expect(AnimLeechLifeNeedle).toBe(animLeechLifeNeedle);
    expect(AnimTranslateWebThread).toBe(animTranslateWebThread);
    expect(AnimTranslateWebThread_Step).toBe(animTranslateWebThreadStep);
    expect(AnimStringWrap).toBe(animStringWrap);
    expect(AnimStringWrap_Step).toBe(animStringWrapStep);
    expect(AnimSpiderWeb).toBe(animSpiderWeb);
    expect(AnimSpiderWeb_Step).toBe(animSpiderWebStep);
    expect(AnimSpiderWeb_End).toBe(animSpiderWebEnd);
    expect(AnimTranslateStinger).toBe(animTranslateStinger);
    expect(AnimMissileArc).toBe(animMissileArc);
    expect(AnimMissileArc_Step).toBe(animMissileArcStep);
    expect(AnimTailGlowOrb).toBe(animTailGlowOrb);
  });

  test('sprite templates preserve bug animation tags, OAM, affine tables, and callbacks', () => {
    expect(gMegahornHornSpriteTemplate).toMatchObject({
      tileTag: 'ANIM_TAG_HORN_HIT_2',
      oam: 'gOamData_AffineDouble_ObjNormal_32x16',
      callback: 'AnimMegahornHorn'
    });
    expect(gWebThreadSpriteTemplate.callback).toBe('AnimTranslateWebThread');
    expect(gSpiderWebSpriteTemplate.affineAnims).toEqual(['sAffineAnim_SpiderWeb']);
    expect(gPinMissileSpriteTemplate.callback).toBe('AnimMissileArc');
    expect(gIcicleSpearSpriteTemplate.tileTag).toBe('ANIM_TAG_ICICLE_SPEAR');
    expect(gTailGlowOrbSpriteTemplate.callback).toBe('AnimTailGlowOrb');
  });

  test('AnimMegahornHorn flips args for player-side target and stores linear translation data', () => {
    const runtime = createBugRuntime();
    runtime.battleAnimTarget = 0;
    runtime.battlerSides[0] = B_SIDE_PLAYER;
    runtime.battleAnimArgs = [7, 3, 11, -5, 14, 0, 0, 0];
    const sprite = createBugSprite();

    animMegahornHorn(runtime, sprite);

    expect(sprite.affineAnimIndex).toBe(1);
    expect(runtime.battleAnimArgs.slice(0, 4)).toEqual([-7, -3, -11, 5]);
    expect(sprite).toMatchObject({ x: 41, y: 61, callback: 'StartAnimLinearTranslation', storedCallback: 'DestroyAnimSprite' });
    expect(sprite.data[0]).toBe(14);
    expect(sprite.data[2]).toBe(37);
    expect(sprite.data[4]).toBe(69);
  });

  test('AnimLeechLifeNeedle contest path flips x offset and starts affine anim 2', () => {
    const runtime = createBugRuntime();
    runtime.contest = true;
    runtime.battleAnimArgs = [12, -4, 9, 0, 0, 0, 0, 0];
    const sprite = createBugSprite();

    animLeechLifeNeedle(runtime, sprite);

    expect(runtime.battleAnimArgs[0]).toBe(-12);
    expect(sprite.affineAnimIndex).toBe(2);
    expect(sprite.x).toBe(148);
    expect(sprite.y).toBe(52);
    expect(sprite.data.slice(0, 5)).toEqual([9, 0, 160, 0, 56]);
  });

  test('AnimTranslateWebThread initializes attacker-to-target data and sine step destroys after duration', () => {
    const runtime = createBugRuntime();
    runtime.battleAnimArgs = [5, -2, 1, 6, 0, 0, 0, 0];
    const sprite = createBugSprite();

    animTranslateWebThread(runtime, sprite);

    expect(sprite).toMatchObject({ x: 53, y: 62, callback: 'AnimTranslateWebThread_Step' });
    expect(sprite.data.slice(0, 6)).toEqual([1, 53, 160, 62, 56, 6]);
    animTranslateWebThreadStep(sprite);
    expect(sprite.destroyed).toBe(false);
    expect(sprite.data[6]).toBe(13);
    animTranslateWebThreadStep(sprite);
    expect(sprite.destroyed).toBe(true);
  });

  test('AnimStringWrap positions around average target and flickers until frame 51 destroys it', () => {
    const runtime = createBugRuntime();
    runtime.battleAnimArgs = [10, 4, 0, 0, 0, 0, 0, 0];
    runtime.battlerSides[1] = B_SIDE_PLAYER;
    const sprite = createBugSprite();

    animStringWrap(runtime, sprite);

    expect(sprite).toMatchObject({ x: 170, y: 68, callback: 'AnimStringWrap_Step' });
    for (let i = 0; i < 3; i += 1) {
      animStringWrapStep(sprite);
    }
    expect(sprite.invisible).toBe(true);
    for (let i = 3; i < 51; i += 1) {
      animStringWrapStep(sprite);
    }
    expect(sprite.destroyed).toBe(true);
  });

  test('Spider Web fades blend registers, hides, then clears blend on end', () => {
    const runtime = createBugRuntime();
    const sprite = createBugSprite();

    animSpiderWeb(runtime, sprite);
    expect(sprite.data[0]).toBe(16);
    expect(runtime.gpuRegs.REG_OFFSET_BLDCNT).toBe(0x3f40);

    sprite.data[2] = 20;
    for (let i = 0; i < 33; i += 1) {
      animSpiderWebStep(runtime, sprite);
    }
    expect(sprite.invisible).toBe(true);
    expect(sprite.callback).toBe('AnimSpiderWeb_End');

    animSpiderWebEnd(runtime, sprite);
    expect(runtime.gpuRegs.REG_OFFSET_BLDCNT).toBe(0);
    expect(runtime.gpuRegs.REG_OFFSET_BLDALPHA).toBe(0);
    expect(sprite.destroyed).toBe(true);
  });

  test('AnimTranslateStinger mirrors same-side target offsets and records rotation/translation', () => {
    const runtime = createBugRuntime();
    runtime.battlerSides[1] = B_SIDE_PLAYER;
    runtime.battleAnimArgs = [6, 2, 12, -4, 17, 0, 0, 0];
    const sprite = createBugSprite();

    animTranslateStinger(runtime, sprite);

    expect(runtime.battleAnimArgs.slice(0, 4)).toEqual([-6, 2, -12, -4]);
    expect(sprite.x).toBe(42);
    expect(sprite.y).toBe(66);
    expect(sprite.data.slice(0, 5)).toEqual([17, 0, 148, 0, 52]);
    expect(sprite.rotScale?.xScale).toBe(0x100);
    expect(sprite.callback).toBe('StartAnimLinearTranslation');
  });

  test('AnimMissileArc starts invisible and step reveals before destruction after duration', () => {
    const runtime = createBugRuntime();
    runtime.battleAnimAttacker = 1;
    runtime.battlerSides[1] = B_SIDE_OPPONENT;
    runtime.battleAnimArgs = [3, 4, 8, -5, 1, 9, 0, 0];
    const sprite = createBugSprite();

    animMissileArc(runtime, sprite);

    expect(runtime.battleAnimArgs[2]).toBe(-8);
    expect(sprite.invisible).toBe(true);
    expect(sprite.data.slice(0, 6)).toEqual([1, 0, 152, 0, 51, 9]);
    animMissileArcStep(sprite);
    expect(sprite.invisible).toBe(false);
    expect(sprite.destroyed).toBe(false);
    animMissileArcStep(sprite);
    expect(sprite.destroyed).toBe(true);
  });

  test('AnimTailGlowOrb chooses attacker or target and stores destroy-matrix callback', () => {
    const runtime = createBugRuntime();
    runtime.battleAnimArgs[0] = 1;
    const sprite = createBugSprite();

    animTailGlowOrb(runtime, sprite);

    expect(sprite.x).toBe(160);
    expect(sprite.y).toBe(74);
    expect(sprite.callback).toBe('RunStoredCallbackWhenAffineAnimEnds');
    expect(sprite.storedCallback).toBe('DestroySpriteAndMatrix');
  });
});
