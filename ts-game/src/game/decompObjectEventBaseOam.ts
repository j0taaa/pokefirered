export interface ObjectEventBaseOam {
  symbol: string;
  shape: string;
  size: string;
  priority: number;
}

export const gObjectEventBaseOam_8x8: ObjectEventBaseOam = {
  symbol: 'gObjectEventBaseOam_8x8',
  shape: 'SPRITE_SHAPE(8x8)',
  size: 'SPRITE_SIZE(8x8)',
  priority: 2
};

export const gObjectEventBaseOam_16x8: ObjectEventBaseOam = {
  symbol: 'gObjectEventBaseOam_16x8',
  shape: 'SPRITE_SHAPE(16x8)',
  size: 'SPRITE_SIZE(16x8)',
  priority: 2
};

export const gObjectEventBaseOam_16x16: ObjectEventBaseOam = {
  symbol: 'gObjectEventBaseOam_16x16',
  shape: 'SPRITE_SHAPE(16x16)',
  size: 'SPRITE_SIZE(16x16)',
  priority: 2
};

export const gObjectEventBaseOam_32x16: ObjectEventBaseOam = {
  symbol: 'gObjectEventBaseOam_32x16',
  shape: 'SPRITE_SHAPE(32x16)',
  size: 'SPRITE_SIZE(32x16)',
  priority: 2
};

export const gObjectEventBaseOam_32x8: ObjectEventBaseOam = {
  symbol: 'gObjectEventBaseOam_32x8',
  shape: 'SPRITE_SHAPE(32x8)',
  size: 'SPRITE_SIZE(32x8)',
  priority: 2
};

export const gObjectEventBaseOam_64x32: ObjectEventBaseOam = {
  symbol: 'gObjectEventBaseOam_64x32',
  shape: 'SPRITE_SHAPE(64x32)',
  size: 'SPRITE_SIZE(64x32)',
  priority: 2
};

export const gObjectEventBaseOam_16x32: ObjectEventBaseOam = {
  symbol: 'gObjectEventBaseOam_16x32',
  shape: 'SPRITE_SHAPE(16x32)',
  size: 'SPRITE_SIZE(16x32)',
  priority: 2
};

export const gObjectEventBaseOam_32x32: ObjectEventBaseOam = {
  symbol: 'gObjectEventBaseOam_32x32',
  shape: 'SPRITE_SHAPE(32x32)',
  size: 'SPRITE_SIZE(32x32)',
  priority: 2
};

export const gObjectEventBaseOam_64x64: ObjectEventBaseOam = {
  symbol: 'gObjectEventBaseOam_64x64',
  shape: 'SPRITE_SHAPE(64x64)',
  size: 'SPRITE_SIZE(64x64)',
  priority: 2
};

export const OBJECT_EVENT_BASE_OAM: readonly ObjectEventBaseOam[] = [
  gObjectEventBaseOam_8x8,
  gObjectEventBaseOam_16x8,
  gObjectEventBaseOam_16x16,
  gObjectEventBaseOam_32x16,
  gObjectEventBaseOam_32x8,
  gObjectEventBaseOam_64x32,
  gObjectEventBaseOam_16x32,
  gObjectEventBaseOam_32x32,
  gObjectEventBaseOam_64x64
];

export const getObjectEventBaseOam = (symbol: string): ObjectEventBaseOam | undefined =>
  OBJECT_EVENT_BASE_OAM.find((oam) => oam.symbol === symbol);
