export interface MailIncbinAssetRef {
  symbol: string;
  type: 'u16' | 'u32';
  path: string;
}

const mailAsset = (symbol: string, type: 'u16' | 'u32', path: string): MailIncbinAssetRef => ({
  symbol,
  type,
  path
});

export const MAIL_GRAPHICS_VARIANTS = [
  'orange',
  'harbor',
  'glitter',
  'mech',
  'wood',
  'wave',
  'bead',
  'shadow',
  'tropic',
  'dream',
  'fab',
  'retro'
] as const;

export type MailGraphicsVariant = typeof MAIL_GRAPHICS_VARIANTS[number];

const mailSymbolVariant = (variant: MailGraphicsVariant): string =>
  variant === 'mech' ? 'mech' : variant;

export const gFile_graphics_mail_palette_pals: readonly MailIncbinAssetRef[] = MAIL_GRAPHICS_VARIANTS.map((variant) =>
  mailAsset(
    `gFile_graphics_mail_${mailSymbolVariant(variant)}_palette_pal`,
    'u16',
    `graphics/mail/${variant}/palette.gbapal`
  )
);

export const gFile_graphics_mail_tiles_sheets: readonly MailIncbinAssetRef[] = MAIL_GRAPHICS_VARIANTS.map((variant) =>
  mailAsset(
    `gFile_graphics_mail_${mailSymbolVariant(variant)}_tiles_sheet`,
    'u32',
    `graphics/mail/${variant}/tiles.4bpp.lz`
  )
);

export const gFile_graphics_mail_map_tilemaps: readonly MailIncbinAssetRef[] = MAIL_GRAPHICS_VARIANTS.map((variant) =>
  mailAsset(
    `gFile_graphics_mail_${mailSymbolVariant(variant)}_map_tilemap`,
    'u32',
    `graphics/mail/${variant}/map.bin.lz`
  )
);

export const MAIL_GRAPHICS_ASSETS: readonly MailIncbinAssetRef[] = [
  ...gFile_graphics_mail_palette_pals,
  ...gFile_graphics_mail_tiles_sheets,
  ...gFile_graphics_mail_map_tilemaps
];
