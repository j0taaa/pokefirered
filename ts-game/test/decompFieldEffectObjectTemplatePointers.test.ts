import { describe, expect, test } from 'vitest';
import {
  FLDEFFOBJ_BIRD,
  FLDEFFOBJ_SHADOW_S,
  FLDEFFOBJ_SMALL_SPARKLE,
  FLDEFFOBJ_SPARKLE,
  getFieldEffectObjectTemplatePointer,
  gFieldEffectObjectTemplatePointers
} from '../src/game/decompFieldEffectObjectTemplatePointers';

describe('decomp field effect object template pointers', () => {
  test('preserves the full pointer table order including the NULL sparkle entry', () => {
    expect(gFieldEffectObjectTemplatePointers).toEqual([
      'gFieldEffectObjectTemplate_ShadowSmall',
      'gFieldEffectObjectTemplate_ShadowMedium',
      'gFieldEffectObjectTemplate_ShadowLarge',
      'gFieldEffectObjectTemplate_ShadowExtraLarge',
      'gFieldEffectObjectTemplate_TallGrass',
      'gFieldEffectObjectTemplate_Ripple',
      'gFieldEffectObjectTemplate_Ash',
      'gFieldEffectObjectTemplate_SurfBlob',
      'gFieldEffectObjectTemplate_Arrow',
      'gFieldEffectObjectTemplate_GroundImpactDust',
      'gFieldEffectObjectTemplate_JumpTallGrass',
      'gFieldEffectObjectTemplate_SandFootprints',
      'gFieldEffectObjectTemplate_JumpBigSplash',
      'gFieldEffectObjectTemplate_Splash',
      'gFieldEffectObjectTemplate_JumpSmallSplash',
      'gFieldEffectObjectTemplate_LongGrass',
      'gFieldEffectObjectTemplate_JumpLongGrass',
      'gFieldEffectObjectTemplate_UnusedGrass',
      'gFieldEffectObjectTemplate_UnusedGrass2',
      'gFieldEffectObjectTemplate_UnusedSand',
      'gFieldEffectObjectTemplate_WaterSurfacing',
      'gFieldEffectObjectTemplate_ReflectionDistortion',
      null,
      'gFieldEffectObjectTemplate_DeepSandFootprints',
      'gFieldEffectObjectTemplate_TreeDisguise',
      'gFieldEffectObjectTemplate_MountainDisguise',
      'gFieldEffectObjectTemplate_Bird',
      'gFieldEffectObjectTemplate_BikeTireTracks',
      'gFieldEffectObjectTemplate_SandDisguisePlaceholder',
      'gFieldEffectObjectTemplate_SandPile',
      'gFieldEffectObjectTemplate_ShortGrass',
      'gFieldEffectObjectTemplate_HotSpringsWater',
      'gFieldEffectObjectTemplate_AshPuff',
      'gFieldEffectObjectTemplate_AshLaunch',
      'gFieldEffectObjectTemplate_Bubbles',
      'gFieldEffectObjectTemplate_SmallSparkle'
    ]);
  });

  test('keeps field effect object constants aligned to pointer lookup indexes', () => {
    expect(FLDEFFOBJ_SHADOW_S).toBe(0);
    expect(FLDEFFOBJ_SPARKLE).toBe(22);
    expect(FLDEFFOBJ_SMALL_SPARKLE).toBe(35);
    expect(getFieldEffectObjectTemplatePointer(FLDEFFOBJ_BIRD)).toBe('gFieldEffectObjectTemplate_Bird');
    expect(getFieldEffectObjectTemplatePointer(FLDEFFOBJ_SPARKLE)).toBeNull();
    expect(getFieldEffectObjectTemplatePointer(999)).toBeNull();
  });
});
