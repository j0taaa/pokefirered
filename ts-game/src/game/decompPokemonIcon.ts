import pokemonIconSource from '../../../src/pokemon_icon.c?raw';
import speciesConstantsSource from '../../../include/constants/species.h?raw';

export const POKE_ICON_BASE_PAL_TAG = 56000;
export const TAG_NONE = 0xffff;
export const OBJ_VRAM0 = 0x06010000;
export const TILE_SIZE_4BPP = 0x20;
export const PLTT_SIZE_4BPP = 0x20;
export const ST_OAM_SQUARE = 0;
export const ST_OAM_H_RECTANGLE = 1;
export const ST_OAM_V_RECTANGLE = 2;
export const ST_OAM_SIZE_0 = 0;
export const ST_OAM_SIZE_1 = 1;
export const ST_OAM_SIZE_2 = 2;
export const ST_OAM_SIZE_3 = 3;

export interface IconTiles {
  symbol: string;
  offset: number;
}

export interface SpritePalette {
  data: string;
  tag: number;
}

export interface OamData {
  shape: number;
  size: number;
  tileNum: number;
  priority: number;
  paletteNum: number;
}

export interface AnimFrame {
  imageValue: number;
  duration: number;
}

export interface Sprite {
  oam: OamData;
  anims: readonly (readonly AnimFrame[])[];
  animNum: number;
  animCmdIndex: number;
  animDelayCounter: number;
  animPaused: number;
  animBeginning: number;
  images: IconTiles | null;
  callback: string;
  x: number;
  y: number;
  subpriority: number;
  paletteTag: number;
  destroyed: boolean;
}

export interface SpriteCopyRequest {
  src: IconTiles | null;
  srcOffset: number;
  dest: number;
  size: number;
}

export interface PaletteLoadAt {
  data: string;
  offset: number;
  size: number;
}

export interface PokemonIconRuntime {
  sprites: Sprite[];
  spriteCopyRequests: SpriteCopyRequest[];
  loadedSpritePalettes: SpritePalette[];
  freedPaletteTags: number[];
  loadedPaletteOffsets: PaletteLoadAt[];
  mailSpeciesToSpecies: (species: number) => { species: number; value: number };
}

export const SPECIES_CONSTANTS = parseSpeciesConstants(speciesConstantsSource);
export const SPECIES_NONE = SPECIES_CONSTANTS.SPECIES_NONE;
export const SPECIES_UNOWN = SPECIES_CONSTANTS.SPECIES_UNOWN;
export const SPECIES_DEOXYS = SPECIES_CONSTANTS.SPECIES_DEOXYS;
export const SPECIES_EGG = SPECIES_CONSTANTS.SPECIES_EGG;
export const NUM_SPECIES = SPECIES_CONSTANTS.NUM_SPECIES;
export const SPECIES_UNOWN_B = SPECIES_CONSTANTS.SPECIES_UNOWN_B;

export const gMonIconTable = parseIconTable(pokemonIconSource, SPECIES_CONSTANTS);
export const gMonIconPaletteIndices = parsePaletteIndices(pokemonIconSource, SPECIES_CONSTANTS);
export const gMonIconPaletteTable: readonly SpritePalette[] = Array.from({ length: 6 }, (_, i) => ({
  data: `gMonIconPalettes[${i}]`,
  tag: POKE_ICON_BASE_PAL_TAG + i
}));

export const sMonIconOamData: OamData = {
  shape: ST_OAM_SQUARE,
  size: ST_OAM_SIZE_2,
  tileNum: 0,
  priority: 1,
  paletteNum: 0
};

export const sMonIconAnim_Fast: readonly AnimFrame[] = [
  { imageValue: 0, duration: 6 },
  { imageValue: 1, duration: 6 },
  { imageValue: -2, duration: 0 }
];
export const sMonIconAnim_MediumFast: readonly AnimFrame[] = [
  { imageValue: 0, duration: 8 },
  { imageValue: 1, duration: 8 },
  { imageValue: -2, duration: 0 }
];
export const sMonIconAnim_MediumSlow: readonly AnimFrame[] = [
  { imageValue: 0, duration: 14 },
  { imageValue: 1, duration: 14 },
  { imageValue: -2, duration: 0 }
];
export const sMonIconAnim_Slow: readonly AnimFrame[] = [
  { imageValue: 0, duration: 22 },
  { imageValue: 1, duration: 22 },
  { imageValue: -2, duration: 0 }
];
export const sMonIconAnim_Still: readonly AnimFrame[] = [
  { imageValue: 0, duration: 29 },
  { imageValue: 0, duration: 29 },
  { imageValue: -2, duration: 0 }
];
export const sMonIconAnims = [
  sMonIconAnim_Fast,
  sMonIconAnim_MediumFast,
  sMonIconAnim_MediumSlow,
  sMonIconAnim_Slow,
  sMonIconAnim_Still
] as const;

export const sSpriteImageSizes = [
  [0x020, 0x080, 0x200, 0x800],
  [0x040, 0x080, 0x100, 0x400],
  [0x040, 0x080, 0x100, 0x400]
] as const;

export const createPokemonIconRuntime = (): PokemonIconRuntime => ({
  sprites: [],
  spriteCopyRequests: [],
  loadedSpritePalettes: [],
  freedPaletteTags: [],
  loadedPaletteOffsets: [],
  mailSpeciesToSpecies: (species) => ({ species, value: 0 })
});

export const CreateMonIcon = (
  runtime: PokemonIconRuntime,
  species: number,
  callback: string,
  x: number,
  y: number,
  subpriority: number,
  personality: number,
  extra: number
): number => {
  const paletteTag = species > NUM_SPECIES
    ? POKE_ICON_BASE_PAL_TAG
    : POKE_ICON_BASE_PAL_TAG + (gMonIconPaletteIndices[species] ?? 0);
  const spriteId = CreateMonIconSprite(
    runtime,
    {
      image: GetMonIconPtr(species, personality, extra),
      callback,
      paletteTag
    },
    x,
    y,
    subpriority
  );
  UpdateMonIconFrame(runtime, runtime.sprites[spriteId]);
  return spriteId;
};

export const CreateMonIcon_HandleDeoxys = (
  runtime: PokemonIconRuntime,
  species: number,
  callback: string,
  x: number,
  y: number,
  subpriority: number,
  extra: number
): number => {
  const spriteId = CreateMonIconSprite(
    runtime,
    {
      image: GetMonIconTiles(species, extra),
      callback,
      paletteTag: POKE_ICON_BASE_PAL_TAG + (gMonIconPaletteIndices[species] ?? 0)
    },
    x,
    y,
    subpriority
  );
  UpdateMonIconFrame(runtime, runtime.sprites[spriteId]);
  return spriteId;
};

export const GetIconSpecies = (species: number, personality: number): number => {
  if (species === SPECIES_UNOWN) {
    let letter = GetUnownLetterByPersonality(personality);
    if (letter === 0) {
      letter = SPECIES_UNOWN;
    } else {
      letter += SPECIES_UNOWN_B - 1;
    }
    return letter;
  }
  if (species > NUM_SPECIES) {
    return SPECIES_NONE;
  }
  return species;
};

export const GetUnownLetterByPersonality = (personality: number): number => {
  if (!personality) {
    return 0;
  }
  return (
    (((personality & 0x3000000) >>> 18)
      | ((personality & 0x30000) >>> 12)
      | ((personality & 0x300) >>> 6)
      | (personality & 0x3)) % 0x1c
  ) >>> 0;
};

export const MailSpeciesToIconSpecies = (runtime: PokemonIconRuntime, species: number): number => {
  const converted = runtime.mailSpeciesToSpecies(species);
  let value = converted.value;
  if (converted.species === SPECIES_UNOWN) {
    if (value === 0) {
      value += SPECIES_UNOWN;
    } else {
      value += SPECIES_UNOWN_B - 1;
    }
    return value;
  }
  let iconSpecies = species;
  if (iconSpecies > SPECIES_UNOWN_B - 1) {
    iconSpecies = SPECIES_NONE;
  }
  return GetIconSpecies(iconSpecies, 0);
};

export const GetMonIconTiles = (species: number, extra: number): IconTiles => {
  const iconSprite = { symbol: gMonIconTable[species] ?? 'gMonIcon_QuestionMark', offset: 0 };
  if (species === SPECIES_DEOXYS && extra === 1) {
    iconSprite.offset += 0x400;
  }
  return iconSprite;
};

export const GetMonIconPtr = (species: number, personality: number, extra: number): IconTiles =>
  GetMonIconTiles(GetIconSpecies(species, personality), extra);

export const DestroyMonIcon = (sprite: Sprite): void => {
  DestroyMonIconInternal(sprite);
};

export const LoadMonIconPalettes = (runtime: PokemonIconRuntime): void => {
  for (let i = 0; i < gMonIconPaletteTable.length; i++) {
    LoadSpritePalette(runtime, gMonIconPaletteTable[i]);
  }
};

export const SafeLoadMonIconPalette = (runtime: PokemonIconRuntime, speciesArg: number): void => {
  let species = speciesArg;
  if (species > NUM_SPECIES) {
    species = SPECIES_NONE;
  }
  const palIndex = gMonIconPaletteIndices[species] ?? 0;
  if (IndexOfSpritePaletteTag(runtime, gMonIconPaletteTable[palIndex].tag) === 0xff) {
    LoadSpritePalette(runtime, gMonIconPaletteTable[palIndex]);
  }
};

export const LoadMonIconPalette = (runtime: PokemonIconRuntime, species: number): void => {
  const palIndex = gMonIconPaletteIndices[species] ?? 0;
  if (IndexOfSpritePaletteTag(runtime, gMonIconPaletteTable[palIndex].tag) === 0xff) {
    LoadSpritePalette(runtime, gMonIconPaletteTable[palIndex]);
  }
};

export const FreeMonIconPalettes = (runtime: PokemonIconRuntime): void => {
  for (let i = 0; i < gMonIconPaletteTable.length; i++) {
    FreeSpritePaletteByTag(runtime, gMonIconPaletteTable[i].tag);
  }
};

export const SafeFreeMonIconPalette = (runtime: PokemonIconRuntime, speciesArg: number): void => {
  let species = speciesArg;
  if (species > NUM_SPECIES) {
    species = SPECIES_NONE;
  }
  const palIndex = gMonIconPaletteIndices[species] ?? 0;
  FreeSpritePaletteByTag(runtime, gMonIconPaletteTable[palIndex].tag);
};

export const FreeMonIconPalette = (runtime: PokemonIconRuntime, species: number): void => {
  const palIndex = gMonIconPaletteIndices[species] ?? 0;
  FreeSpritePaletteByTag(runtime, gMonIconPaletteTable[palIndex].tag);
};

export const SpriteCB_MonIcon = (runtime: PokemonIconRuntime, sprite: Sprite): void => {
  UpdateMonIconFrame(runtime, sprite);
};

export const LoadMonIconPalettesAt = (runtime: PokemonIconRuntime, offsetArg: number): void => {
  let offset = offsetArg;
  if (offset <= BG_PLTT_ID(16 - gMonIconPaletteTable.length)) {
    for (let i = 0; i < gMonIconPaletteTable.length; i++) {
      LoadPalette(runtime, gMonIconPaletteTable[i].data, offset, PLTT_SIZE_4BPP);
      offset += 16;
    }
  }
};

export const GetValidMonIconPalettePtr = (speciesArg: number): string => {
  let species = speciesArg;
  if (species > NUM_SPECIES) {
    species = SPECIES_NONE;
  }
  return gMonIconPaletteTable[gMonIconPaletteIndices[species] ?? 0].data;
};

export const GetValidMonIconPalIndex = (speciesArg: number): number => {
  let species = speciesArg;
  if (species > NUM_SPECIES) {
    species = SPECIES_NONE;
  }
  return gMonIconPaletteIndices[species] ?? 0;
};

export const GetMonIconPaletteIndexFromSpecies = (species: number): number => gMonIconPaletteIndices[species] ?? 0;

export const UpdateMonIconFrame = (runtime: PokemonIconRuntime, sprite: Sprite): number => {
  let result = 0;
  if (sprite.animDelayCounter === 0) {
    const frame = sprite.anims[sprite.animNum][sprite.animCmdIndex]?.imageValue ?? -1;
    switch (frame) {
      case -1:
        break;
      case -2:
        sprite.animCmdIndex = 0;
        break;
      default: {
        const size = sSpriteImageSizes[sprite.oam.shape][sprite.oam.size];
        RequestSpriteCopy(runtime, sprite.images, size * frame, OBJ_VRAM0 + sprite.oam.tileNum * TILE_SIZE_4BPP, size);
        sprite.animDelayCounter = sprite.anims[sprite.animNum][sprite.animCmdIndex].duration & 0xff;
        sprite.animCmdIndex++;
        result = sprite.animCmdIndex;
        break;
      }
    }
  } else {
    sprite.animDelayCounter--;
  }
  return result;
};

export const SetPartyHPBarSprite = (sprite: Sprite, animNum: number): void => {
  sprite.animNum = animNum;
  sprite.animDelayCounter = 0;
  sprite.animCmdIndex = 0;
};

export const CreateMonIconSprite = (
  runtime: PokemonIconRuntime,
  iconTemplate: { image: IconTiles; callback: string; paletteTag: number },
  x: number,
  y: number,
  subpriority: number
): number => {
  const spriteId = runtime.sprites.length;
  runtime.sprites.push({
    oam: { ...sMonIconOamData },
    anims: sMonIconAnims,
    animNum: 0,
    animCmdIndex: 0,
    animDelayCounter: 0,
    animPaused: 1,
    animBeginning: 0,
    images: iconTemplate.image,
    callback: iconTemplate.callback,
    x,
    y,
    subpriority,
    paletteTag: iconTemplate.paletteTag,
    destroyed: false
  });
  return spriteId;
};

export const DestroyMonIconInternal = (sprite: Sprite): void => {
  sprite.images = null;
  sprite.destroyed = true;
};

const RequestSpriteCopy = (runtime: PokemonIconRuntime, src: IconTiles | null, srcOffset: number, dest: number, size: number): void => {
  runtime.spriteCopyRequests.push({ src, srcOffset, dest, size });
};

const LoadSpritePalette = (runtime: PokemonIconRuntime, palette: SpritePalette): void => {
  runtime.loadedSpritePalettes.push(palette);
};

const FreeSpritePaletteByTag = (runtime: PokemonIconRuntime, tag: number): void => {
  runtime.freedPaletteTags.push(tag);
};

const IndexOfSpritePaletteTag = (runtime: PokemonIconRuntime, tag: number): number =>
  runtime.loadedSpritePalettes.some((palette) => palette.tag === tag) ? 0 : 0xff;

const LoadPalette = (runtime: PokemonIconRuntime, data: string, offset: number, size: number): void => {
  runtime.loadedPaletteOffsets.push({ data, offset, size });
};

const BG_PLTT_ID = (index: number): number => index * 16;

function parseSpeciesConstants(source: string): Record<string, number> {
  const constants: Record<string, number> = {};
  let changed = true;
  while (changed) {
    changed = false;
    for (const [, name, expression] of source.matchAll(/^#define\s+(SPECIES_[A-Z0-9_]+|NUM_SPECIES)\s+(.+)$/gm)) {
      if (constants[name] !== undefined) continue;
      const value = evalConstantExpression(expression.replace(/\/\/.*$/u, '').trim(), constants);
      if (value !== undefined) {
        constants[name] = value;
        changed = true;
      }
    }
  }
  return constants;
}

function evalConstantExpression(expression: string, constants: Record<string, number>): number | undefined {
  const substituted = expression.replace(/\b[A-Z][A-Z0-9_]*\b/gu, (token) => {
    if (constants[token] === undefined) return 'NaN';
    return String(constants[token]);
  });
  if (!/^[\d\s()+\-*/%xXa-fA-F]+$/u.test(substituted)) return undefined;
  const value = Function(`"use strict"; return (${substituted});`)() as number;
  return Number.isFinite(value) ? value : undefined;
}

function parseIconTable(source: string, constants: Record<string, number>): string[] {
  const body = source.match(/const u8 \*const gMonIconTable\[\] = \{([\s\S]*?)\n\};/u)?.[1] ?? '';
  const table = Array(Math.max(...Object.values(constants).filter(Number.isFinite)) + 1).fill('gMonIcon_QuestionMark') as string[];
  for (const [, speciesToken, iconSymbol] of body.matchAll(/\[(SPECIES_[A-Z0-9_]+)\]\s*=\s*(gMonIcon_[A-Za-z0-9_]+)/gu)) {
    const species = constants[speciesToken];
    if (species !== undefined) {
      table[species] = iconSymbol;
    }
  }
  return table;
}

function parsePaletteIndices(source: string, constants: Record<string, number>): number[] {
  const body = source.match(/const u8 gMonIconPaletteIndices\[\] = \{([\s\S]*?)\n\};/u)?.[1] ?? '';
  const table = Array(Math.max(...Object.values(constants).filter(Number.isFinite)) + 1).fill(0) as number[];
  for (const [, speciesToken, palette] of body.matchAll(/\[(SPECIES_[A-Z0-9_]+)\]\s*=\s*(\d+)/gu)) {
    const species = constants[speciesToken];
    if (species !== undefined) {
      table[species] = Number.parseInt(palette, 10);
    }
  }
  return table;
}
