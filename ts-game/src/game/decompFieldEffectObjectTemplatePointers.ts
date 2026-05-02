export const FLDEFFOBJ_SHADOW_S = 0;
export const FLDEFFOBJ_SHADOW_M = 1;
export const FLDEFFOBJ_SHADOW_L = 2;
export const FLDEFFOBJ_SHADOW_XL = 3;
export const FLDEFFOBJ_TALL_GRASS = 4;
export const FLDEFFOBJ_RIPPLE = 5;
export const FLDEFFOBJ_ASH = 6;
export const FLDEFFOBJ_SURF_BLOB = 7;
export const FLDEFFOBJ_ARROW = 8;
export const FLDEFFOBJ_GROUND_IMPACT_DUST = 9;
export const FLDEFFOBJ_JUMP_TALL_GRASS = 10;
export const FLDEFFOBJ_SAND_FOOTPRINTS = 11;
export const FLDEFFOBJ_JUMP_BIG_SPLASH = 12;
export const FLDEFFOBJ_SPLASH = 13;
export const FLDEFFOBJ_JUMP_SMALL_SPLASH = 14;
export const FLDEFFOBJ_LONG_GRASS = 15;
export const FLDEFFOBJ_JUMP_LONG_GRASS = 16;
export const FLDEFFOBJ_UNUSED_GRASS = 17;
export const FLDEFFOBJ_UNUSED_GRASS_2 = 18;
export const FLDEFFOBJ_UNUSED_SAND = 19;
export const FLDEFFOBJ_WATER_SURFACING = 20;
export const FLDEFFOBJ_REFLECTION_DISTORTION = 21;
export const FLDEFFOBJ_SPARKLE = 22;
export const FLDEFFOBJ_DEEP_SAND_FOOTPRINTS = 23;
export const FLDEFFOBJ_TREE_DISGUISE = 24;
export const FLDEFFOBJ_MOUNTAIN_DISGUISE = 25;
export const FLDEFFOBJ_BIRD = 26;
export const FLDEFFOBJ_BIKE_TIRE_TRACKS = 27;
export const FLDEFFOBJ_SAND_DISGUISE = 28;
export const FLDEFFOBJ_SAND_PILE = 29;
export const FLDEFFOBJ_SHORT_GRASS = 30;
export const FLDEFFOBJ_HOT_SPRINGS_WATER = 31;
export const FLDEFFOBJ_ASH_PUFF = 32;
export const FLDEFFOBJ_ASH_LAUNCH = 33;
export const FLDEFFOBJ_BUBBLES = 34;
export const FLDEFFOBJ_SMALL_SPARKLE = 35;

export type FieldEffectObjectTemplateName = string | null;

export const gFieldEffectObjectTemplatePointers: readonly FieldEffectObjectTemplateName[] = [
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
];

export const getFieldEffectObjectTemplatePointer = (fieldEffectObjectId: number): FieldEffectObjectTemplateName =>
  gFieldEffectObjectTemplatePointers[fieldEffectObjectId] ?? null;
