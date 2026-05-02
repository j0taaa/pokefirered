import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';
import {
  CreateMonIcon,
  CreateMonIcon_HandleDeoxys,
  CreateMonIconSprite,
  DestroyMonIcon,
  DestroyMonIconInternal,
  FreeMonIconPalette,
  FreeMonIconPalettes,
  GetIconSpecies,
  GetMonIconPaletteIndexFromSpecies,
  GetMonIconPtr,
  GetMonIconTiles,
  GetUnownLetterByPersonality,
  GetValidMonIconPalIndex,
  GetValidMonIconPalettePtr,
  LoadMonIconPalette,
  LoadMonIconPalettes,
  LoadMonIconPalettesAt,
  MailSpeciesToIconSpecies,
  NUM_SPECIES,
  OBJ_VRAM0,
  POKE_ICON_BASE_PAL_TAG,
  PLTT_SIZE_4BPP,
  SPECIES_CONSTANTS,
  SPECIES_DEOXYS,
  SPECIES_NONE,
  SPECIES_UNOWN,
  SPECIES_UNOWN_B,
  SafeFreeMonIconPalette,
  SafeLoadMonIconPalette,
  SetPartyHPBarSprite,
  SpriteCB_MonIcon,
  TILE_SIZE_4BPP,
  UpdateMonIconFrame,
  createPokemonIconRuntime,
  gMonIconPaletteIndices,
  gMonIconPaletteTable,
  gMonIconTable,
  sSpriteImageSizes
} from '../src/game/decompPokemonIcon';

const repoRoot = resolve(__dirname, '../..');
const pokemonIconC = readFileSync(resolve(repoRoot, 'src/pokemon_icon.c'), 'utf8');

const parseCIconEntries = (): Array<[number, string]> => {
  const body = pokemonIconC.match(/const u8 \*const gMonIconTable\[\] = \{([\s\S]*?)\n\};/u)?.[1] ?? '';
  return [...body.matchAll(/\[(SPECIES_[A-Z0-9_]+)\]\s*=\s*(gMonIcon_[A-Za-z0-9_]+)/gu)].map(([, species, icon]) => [
    SPECIES_CONSTANTS[species],
    icon
  ]);
};

const parseCPaletteEntries = (): Array<[number, number]> => {
  const body = pokemonIconC.match(/const u8 gMonIconPaletteIndices\[\] = \{([\s\S]*?)\n\};/u)?.[1] ?? '';
  return [...body.matchAll(/\[(SPECIES_[A-Z0-9_]+)\]\s*=\s*(\d+)/gu)].map(([, species, palette]) => [
    SPECIES_CONSTANTS[species],
    Number.parseInt(palette, 10)
  ]);
};

describe('decomp pokemon_icon', () => {
  test('gMonIconTable and gMonIconPaletteIndices preserve every C designated initializer', () => {
    const iconEntries = parseCIconEntries();
    const paletteEntries = parseCPaletteEntries();

    expect(iconEntries.length).toBeGreaterThan(430);
    expect(paletteEntries.length).toBe(iconEntries.length);
    for (const [species, icon] of iconEntries) {
      expect(gMonIconTable[species]).toBe(icon);
    }
    for (const [species, palette] of paletteEntries) {
      expect(gMonIconPaletteIndices[species]).toBe(palette);
    }
  });

  test('GetUnownLetterByPersonality and GetIconSpecies match the C branches', () => {
    expect(GetUnownLetterByPersonality(0)).toBe(0);
    expect(GetIconSpecies(SPECIES_UNOWN, 0)).toBe(SPECIES_UNOWN);
    expect(GetUnownLetterByPersonality(1)).toBe(1);
    expect(GetIconSpecies(SPECIES_UNOWN, 1)).toBe(SPECIES_UNOWN_B);
    expect(GetIconSpecies(NUM_SPECIES + 1, 123)).toBe(SPECIES_NONE);
    expect(GetIconSpecies(SPECIES_CONSTANTS.SPECIES_PIKACHU, 999)).toBe(SPECIES_CONSTANTS.SPECIES_PIKACHU);
  });

  test('MailSpeciesToIconSpecies mirrors Unown form remapping and invalid mail-species fallback', () => {
    const runtime = createPokemonIconRuntime();
    runtime.mailSpeciesToSpecies = (species) => (
      species === 77
        ? { species: SPECIES_UNOWN, value: 3 }
        : { species, value: 0 }
    );

    expect(MailSpeciesToIconSpecies(runtime, 77)).toBe(SPECIES_UNOWN_B + 2);
    expect(MailSpeciesToIconSpecies(runtime, SPECIES_UNOWN_B)).toBe(SPECIES_NONE);
    expect(MailSpeciesToIconSpecies(runtime, SPECIES_CONSTANTS.SPECIES_EEVEE)).toBe(SPECIES_CONSTANTS.SPECIES_EEVEE);
  });

  test('GetMonIconTiles and GetMonIconPtr keep Deoxys extra-frame and invalid-species behavior', () => {
    expect(GetMonIconTiles(SPECIES_DEOXYS, 0)).toEqual({ symbol: 'gMonIcon_Deoxys', offset: 0 });
    expect(GetMonIconTiles(SPECIES_DEOXYS, 1)).toEqual({ symbol: 'gMonIcon_Deoxys', offset: 0x400 });
    expect(GetMonIconPtr(SPECIES_UNOWN, 1, 0)).toEqual({ symbol: 'gMonIcon_UnownB', offset: 0 });
    expect(GetMonIconPtr(NUM_SPECIES + 50, 0, 0)).toEqual({ symbol: 'gMonIcon_QuestionMark', offset: 0 });
  });

  test('CreateMonIcon, CreateMonIcon_HandleDeoxys, UpdateMonIconFrame, SpriteCB, Destroy, and SetPartyHPBarSprite preserve sprite state transitions', () => {
    const runtime = createPokemonIconRuntime();
    const spriteId = CreateMonIcon(runtime, SPECIES_CONSTANTS.SPECIES_PIKACHU, 'SpriteCB_MonIcon', 10, 20, 3, 0, 0);
    const sprite = runtime.sprites[spriteId];

    expect(sprite.animPaused).toBe(1);
    expect(sprite.animBeginning).toBe(0);
    expect(sprite.paletteTag).toBe(POKE_ICON_BASE_PAL_TAG + gMonIconPaletteIndices[SPECIES_CONSTANTS.SPECIES_PIKACHU]);
    expect(sprite.images).toEqual({ symbol: 'gMonIcon_Pikachu', offset: 0 });
    expect(runtime.spriteCopyRequests[0]).toMatchObject({
      src: { symbol: 'gMonIcon_Pikachu', offset: 0 },
      srcOffset: 0,
      dest: OBJ_VRAM0,
      size: sSpriteImageSizes[0][2]
    });
    expect(sprite.animDelayCounter).toBe(6);
    expect(sprite.animCmdIndex).toBe(1);

    expect(UpdateMonIconFrame(runtime, sprite)).toBe(0);
    expect(sprite.animDelayCounter).toBe(5);
    sprite.animDelayCounter = 0;
    expect(SpriteCB_MonIcon(runtime, sprite)).toBeUndefined();
    expect(runtime.spriteCopyRequests.at(-1)).toMatchObject({
      srcOffset: sSpriteImageSizes[0][2],
      dest: OBJ_VRAM0,
      size: TILE_SIZE_4BPP * 0x10
    });

    sprite.animDelayCounter = 0;
    sprite.animCmdIndex = 2;
    expect(UpdateMonIconFrame(runtime, sprite)).toBe(0);
    expect(sprite.animCmdIndex).toBe(0);

    SetPartyHPBarSprite(sprite, 4);
    expect(sprite.animNum).toBe(4);
    expect(sprite.animDelayCounter).toBe(0);
    expect(sprite.animCmdIndex).toBe(0);

    DestroyMonIcon(sprite);
    expect(sprite.destroyed).toBe(true);
    expect(sprite.images).toBe(null);

    const deoxysSpriteId = CreateMonIcon_HandleDeoxys(runtime, SPECIES_DEOXYS, 'cb', 1, 2, 3, 1);
    expect(runtime.sprites[deoxysSpriteId].images).toEqual({ symbol: 'gMonIcon_Deoxys', offset: 0x400 });

    const rawSpriteId = CreateMonIconSprite(runtime, { image: { symbol: 'raw', offset: 12 }, callback: 'rawCb', paletteTag: 77 }, 4, 5, 6);
    const rawSprite = runtime.sprites[rawSpriteId];
    expect(rawSprite).toMatchObject({ x: 4, y: 5, subpriority: 6, animPaused: 1, animBeginning: 0, images: { symbol: 'raw', offset: 12 }, callback: 'rawCb', paletteTag: 77 });
    DestroyMonIconInternal(rawSprite);
    expect(rawSprite.destroyed).toBe(true);
    expect(rawSprite.images).toBeNull();
  });

  test('palette loading/freeing functions preserve safe and unsafe species handling', () => {
    const runtime = createPokemonIconRuntime();

    LoadMonIconPalettes(runtime);
    expect(runtime.loadedSpritePalettes.map((palette) => palette.tag)).toEqual([56000, 56001, 56002, 56003, 56004, 56005]);

    SafeLoadMonIconPalette(runtime, NUM_SPECIES + 1);
    expect(runtime.loadedSpritePalettes).toHaveLength(6);

    const runtime2 = createPokemonIconRuntime();
    LoadMonIconPalette(runtime2, SPECIES_CONSTANTS.SPECIES_BULBASAUR);
    LoadMonIconPalette(runtime2, SPECIES_CONSTANTS.SPECIES_BULBASAUR);
    expect(runtime2.loadedSpritePalettes).toHaveLength(1);

    SafeFreeMonIconPalette(runtime2, NUM_SPECIES + 99);
    FreeMonIconPalette(runtime2, SPECIES_CONSTANTS.SPECIES_BULBASAUR);
    FreeMonIconPalettes(runtime2);
    expect(runtime2.freedPaletteTags).toEqual([56000, 56001, 56000, 56001, 56002, 56003, 56004, 56005]);

    expect(GetValidMonIconPalettePtr(NUM_SPECIES + 1)).toBe('gMonIconPalettes[0]');
    expect(GetValidMonIconPalIndex(NUM_SPECIES + 1)).toBe(0);
    expect(GetMonIconPaletteIndexFromSpecies(SPECIES_CONSTANTS.SPECIES_BULBASAUR)).toBe(1);
    expect(gMonIconPaletteTable[5]).toEqual({ data: 'gMonIconPalettes[5]', tag: 56005 });
  });

  test('LoadMonIconPalettesAt copies six 4bpp palettes only when the offset fits', () => {
    const runtime = createPokemonIconRuntime();

    LoadMonIconPalettesAt(runtime, 160);
    expect(runtime.loadedPaletteOffsets).toHaveLength(6);
    expect(runtime.loadedPaletteOffsets[0]).toEqual({ data: 'gMonIconPalettes[0]', offset: 160, size: PLTT_SIZE_4BPP });
    expect(runtime.loadedPaletteOffsets[5]).toEqual({ data: 'gMonIconPalettes[5]', offset: 240, size: PLTT_SIZE_4BPP });

    LoadMonIconPalettesAt(runtime, 161);
    expect(runtime.loadedPaletteOffsets).toHaveLength(6);
  });
});
