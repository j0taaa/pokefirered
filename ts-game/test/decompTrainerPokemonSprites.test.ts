import { describe, expect, test } from 'vitest';
import {
  AssignSpriteAnimsTable,
  CreateMonPicSprite,
  CreateMonPicSprite_HandleDeoxys,
  CreatePicSprite,
  CreatePicSprite_HandleDeoxys,
  CreateTrainerCardMonIconSprite,
  CreateTrainerCardSprite,
  CreateTrainerCardTrainerPicSprite,
  CreateTrainerPicSprite,
  DecompressPic,
  DecompressPic_HandleDeoxys,
  DummyPicSpriteCallback,
  FreeAndDestroyMonPicSprite,
  FreeAndDestroyPicSpriteInternal,
  FreeAndDestroyTrainerPicSprite,
  LoadMonPicInWindow,
  LoadPicPaletteBySlot,
  LoadPicPaletteByTagOrSlot,
  LoadPicSpriteInWindow,
  LoadTrainerPicInWindow,
  MALE,
  PICS_COUNT,
  PlayerGenderToFrontTrainerPicId,
  ResetAllPicSprites,
  TAG_NONE,
  assignSpriteAnimsTable,
  createMonPicSprite,
  createMonPicSpriteHandleDeoxys,
  createPicSprite,
  createPicSpriteHandleDeoxys,
  createTrainerCardMonIconSprite,
  createTrainerCardSprite,
  createTrainerCardTrainerPicSprite,
  createTrainerPicSprite,
  createTrainerPokemonSpritesRuntime,
  decompressPic,
  decompressPicHandleDeoxys,
  dummyPicSpriteCallback,
  freeAndDestroyMonPicSprite,
  freeAndDestroyPicSpriteInternal,
  freeAndDestroyTrainerPicSprite,
  loadMonPicInWindow,
  loadPicPaletteBySlot,
  loadPicPaletteByTagOrSlot,
  loadPicSpriteInWindow,
  loadTrainerPicInWindow,
  playerGenderToFrontTrainerPicId,
  resetAllPicSprites
} from '../src/game/decompTrainerPokemonSprites';

describe('decomp trainer_pokemon_sprites', () => {
  test('exact C function names are exported as the implemented trainer pokemon sprite routines', () => {
    expect(DummyPicSpriteCallback).toBe(dummyPicSpriteCallback);
    expect(ResetAllPicSprites).toBe(resetAllPicSprites);
    expect(DecompressPic).toBe(decompressPic);
    expect(DecompressPic_HandleDeoxys).toBe(decompressPicHandleDeoxys);
    expect(LoadPicPaletteByTagOrSlot).toBe(loadPicPaletteByTagOrSlot);
    expect(LoadPicPaletteBySlot).toBe(loadPicPaletteBySlot);
    expect(AssignSpriteAnimsTable).toBe(assignSpriteAnimsTable);
    expect(CreatePicSprite).toBe(createPicSprite);
    expect(CreatePicSprite_HandleDeoxys).toBe(createPicSpriteHandleDeoxys);
    expect(FreeAndDestroyPicSpriteInternal).toBe(freeAndDestroyPicSpriteInternal);
    expect(LoadPicSpriteInWindow).toBe(loadPicSpriteInWindow);
    expect(CreateTrainerCardSprite).toBe(createTrainerCardSprite);
    expect(CreateMonPicSprite).toBe(createMonPicSprite);
    expect(CreateMonPicSprite_HandleDeoxys).toBe(createMonPicSpriteHandleDeoxys);
    expect(FreeAndDestroyMonPicSprite).toBe(freeAndDestroyMonPicSprite);
    expect(LoadMonPicInWindow).toBe(loadMonPicInWindow);
    expect(CreateTrainerCardMonIconSprite).toBe(createTrainerCardMonIconSprite);
    expect(CreateTrainerPicSprite).toBe(createTrainerPicSprite);
    expect(FreeAndDestroyTrainerPicSprite).toBe(freeAndDestroyTrainerPicSprite);
    expect(LoadTrainerPicInWindow).toBe(loadTrainerPicInWindow);
    expect(CreateTrainerCardTrainerPicSprite).toBe(createTrainerCardTrainerPicSprite);
    expect(PlayerGenderToFrontTrainerPicId).toBe(playerGenderToFrontTrainerPicId);
  });

  test('ResetAllPicSprites clears all eight slots and returns FALSE', () => {
    const runtime = createTrainerPokemonSpritesRuntime();
    runtime.spritePics[0].active = true;
    expect(resetAllPicSprites(runtime)).toBe(false);
    expect(runtime.spritePics.every((pic) => pic.active === false && pic.frames === null)).toBe(true);
  });

  test('CreatePicSprite allocates first free slot, builds frame images, palette, and sprite', () => {
    const runtime = createTrainerPokemonSpritesRuntime();
    const spriteId = createPicSprite(runtime, 25, 123, 456, true, 10, 20, 3, TAG_NONE, false, true);

    expect(spriteId).toBe(0);
    expect(runtime.decompressions[0]).toMatchObject({
      species: 25,
      personality: 456,
      isFrontPic: true,
      isTrainer: false,
      ignoreDeoxys: true,
      destSize: 0x2000
    });
    expect(runtime.creatingSpriteTemplate).toMatchObject({
      tileTag: TAG_NONE,
      paletteTag: TAG_NONE,
      oam: 'sOamData_Normal',
      anims: 'gAnims_MonPic',
      affineAnims: 'gDummySpriteAffineAnimTable',
      callback: 'DummyPicSpriteCallback'
    });
    expect(runtime.spritePics[0].images).toEqual([
      { dataOffset: 0, size: 0x800 },
      { dataOffset: 0x800, size: 0x800 },
      { dataOffset: 0x1000, size: 0x800 },
      { dataOffset: 0x1800, size: 0x800 }
    ]);
    expect(runtime.sprites[0]).toMatchObject({ x: 10, y: 20, oam: { paletteNum: 3 } });
    expect(runtime.loadedPalettes[0]).toMatchObject({ kind: 'compressed', source: 'mon:25:123:456', slotOrTag: 3 });
  });

  test('CreatePicSprite failure paths return 0xFFFF and free frames when image allocation fails', () => {
    const runtime = createTrainerPokemonSpritesRuntime();
    runtime.allocationsFailAt.add('frames');
    expect(createPicSprite(runtime, 1, 0, 0, true, 0, 0, 0, TAG_NONE, false, false)).toBe(TAG_NONE);

    runtime.allocationsFailAt.clear();
    runtime.allocationsFailAt.add('images');
    expect(createPicSprite(runtime, 1, 0, 0, true, 0, 0, 0, TAG_NONE, false, false)).toBe(TAG_NONE);
    expect(runtime.freedFrameBuffers).toBe(1);

    runtime.allocationsFailAt.clear();
    runtime.decompressionShouldFail = true;
    expect(createPicSprite(runtime, 1, 0, 0, true, 0, 0, 0, TAG_NONE, false, false)).toBe(TAG_NONE);
  });

  test('CreatePicSprite returns 0xFFFF when all pic slots are active', () => {
    const runtime = createTrainerPokemonSpritesRuntime();
    for (let i = 0; i < PICS_COUNT; i += 1) {
      runtime.spritePics[i].active = true;
    }
    expect(createPicSprite(runtime, 1, 0, 0, true, 0, 0, 0, TAG_NONE, false, false)).toBe(TAG_NONE);
  });

  test('FreeAndDestroyPicSpriteInternal frees tracked buffers and tagged palettes', () => {
    const runtime = createTrainerPokemonSpritesRuntime();
    const spriteId = createTrainerPicSprite(runtime, 7, true, 4, 5, 2, 99);
    runtime.sprites[spriteId].oam.paletteNum = 6;

    expect(freeAndDestroyPicSpriteInternal(runtime, spriteId)).toBe(0);
    expect(runtime.sprites[spriteId].destroyed).toBe(true);
    expect(runtime.freedFrameBuffers).toBe(1);
    expect(runtime.freedImageBuffers).toBe(1);
    expect(runtime.freedSpritePaletteTags).toEqual([6]);
    expect(runtime.spritePics[0].active).toBe(false);
    expect(freeAndDestroyMonPicSprite(runtime, 123)).toBe(TAG_NONE);
  });

  test('palette helpers and wrapper functions choose trainer or mon branches', () => {
    const runtime = createTrainerPokemonSpritesRuntime();
    loadPicPaletteByTagOrSlot(runtime, 3, 4, 5, 1, 88, false);
    loadPicPaletteByTagOrSlot(runtime, 6, 0, 0, 2, TAG_NONE, true);
    loadPicPaletteBySlot(runtime, 9, 10, 11, 7, false);
    assignSpriteAnimsTable(runtime, true);

    expect(runtime.loadedPalettes[0]).toMatchObject({ kind: 'sprite', source: 'monStruct:3:4:5', slotOrTag: 88 });
    expect(runtime.loadedPalettes[1]).toMatchObject({ kind: 'compressed', source: 'trainer:6', slotOrTag: 2 });
    expect(runtime.loadedPalettes[2]).toMatchObject({ source: 'mon:9:10:11', slotOrTag: 7 });
    expect(runtime.creatingSpriteTemplate.anims).toBe('gTrainerFrontAnimsPtrTable[0]');

    expect(createMonPicSprite(runtime, 1, 2, 3, false, 4, 5, 6, TAG_NONE, true)).toBe(0);
    expect(createMonPicSpriteHandleDeoxys(runtime, 2, 3, 4, true, 5, 6, 7, TAG_NONE)).toBe(1);
    expect(runtime.decompressions.at(-1)?.ignoreDeoxys).toBe(false);
  });

  test('window and trainer-card helpers decompress, blit, load palette, and free temporary frames', () => {
    const runtime = createTrainerPokemonSpritesRuntime();
    expect(loadPicSpriteInWindow(runtime, 1, 2, 3, true, 4, 5, true)).toBe(0);
    expect(runtime.decompressions[0].isTrainer).toBe(false);
    expect(runtime.loadedPalettes[0]).toMatchObject({ source: 'trainer:1', slotOrTag: 4 });

    expect(createTrainerCardSprite(runtime, 8, 9, 10, false, 11, 12, 13, 14, true)).toBe(0);
    expect(runtime.blits[0]).toEqual({ windowId: 14, destX: 11, destY: 12, width: 0x40, height: 0x40 });
    expect(runtime.freedFrameBuffers).toBe(1);

    expect(loadMonPicInWindow(runtime, 1, 2, 3, true, 4, 9)).toBe(0);
    expect(createTrainerCardMonIconSprite(runtime, 1, 2, 3, true, 6, 7, 8, 9)).toBe(0);

    expect(loadTrainerPicInWindow(runtime, 12, true, 2, 6)).toBe(0);
    expect(runtime.decompressions.at(-1)).toMatchObject({ species: 12, isTrainer: false });
    expect(runtime.loadedPalettes.at(-1)).toMatchObject({ source: 'trainer:12', slotOrTag: 2 });

    expect(createTrainerCardTrainerPicSprite(runtime, 14, false, 3, 4, 5, 6)).toBe(0);
    expect(runtime.decompressions.at(-1)).toMatchObject({ species: 14, isTrainer: true });
    expect(runtime.blits.at(-1)).toEqual({ windowId: 6, destX: 3, destY: 4, width: 0x40, height: 0x40 });
  });

  test('PlayerGenderToFrontTrainerPicId returns gender or facility class pic based on getClass', () => {
    expect(playerGenderToFrontTrainerPicId(MALE, false)).toBe(MALE);
    expect(playerGenderToFrontTrainerPicId(1, false)).toBe(1);
    expect(playerGenderToFrontTrainerPicId(MALE, true)).toBe(0);
    expect(playerGenderToFrontTrainerPicId(1, true)).toBe(1);
  });
});
