import { describe, expect, test } from 'vitest';
import {
  A_BUTTON,
  ANIM_CURSOR,
  ANIM_TEXT,
  B_BUTTON,
  DPAD_DOWN,
  DPAD_UP,
  MAX_SPRITES,
  NUM_MON_MARKINGS,
  SELECTION_CANCEL,
  SELECTION_OK,
  SE_SELECT,
  SpriteCB_Cursor,
  SpriteCB_Marking,
  TILE_SIZE_4BPP,
  BufferMenuWindowTiles,
  BufferMenuFrameTiles,
  BufferMonMarkingsMenuTiles,
  CreateMonMarkingAllCombosSprite,
  CreateMonMarkingComboSprite,
  CreateMarkingComboSprite,
  CreateMonMarkingsMenuSprites,
  FreeMonMarkingsMenu,
  HandleMonMarkingsMenuInput,
  InitMonMarkingsMenu,
  OpenMonMarkingsMenu,
  UpdateMonMarkingTiles,
  createMonMarkingsMenu,
  createMonMarkingsRuntime
} from '../src/game/decompMonMarkings';

const frameTiles = (): Uint8Array =>
  Uint8Array.from(Array.from({ length: TILE_SIZE_4BPP * 9 }, (_, tile) => Math.floor(tile / TILE_SIZE_4BPP)));

describe('decomp mon markings', () => {
  test('BufferMonMarkingsMenuTiles expands frame tiles using top, middle, and bottom rows exactly', () => {
    const menu = createMonMarkingsMenu(100, 200);
    const runtime = createMonMarkingsRuntime({
      userWindowGraphics: [{ tiles: frameTiles(), palette: Uint16Array.of(7, 8, 9) }]
    });
    InitMonMarkingsMenu(runtime, menu);

    BufferMenuWindowTiles(runtime);
    expect(menu.framePalette).toEqual(Uint16Array.of(7, 8, 9));
    expect(menu.tileLoadState).toBe(0);
    expect(menu.windowSpriteTiles.every((byte) => byte === 0)).toBe(true);

    BufferMonMarkingsMenuTiles(runtime);

    expect(menu.framePalette).toEqual(Uint16Array.of(7, 8, 9));
    expect(menu.tileLoadState).toBe(14);
    expect([...menu.windowSpriteTiles.slice(0, 8 * TILE_SIZE_4BPP).filter((_, i) => i % TILE_SIZE_4BPP === 0)]).toEqual([0, 1, 1, 1, 1, 1, 1, 2]);
    const middleRow = 5 * 0x100;
    expect([...menu.windowSpriteTiles.slice(middleRow, middleRow + 8 * TILE_SIZE_4BPP).filter((_, i) => i % TILE_SIZE_4BPP === 0)]).toEqual([3, 4, 4, 4, 4, 4, 4, 5]);
    const bottomRow = 13 * 0x100;
    expect([...menu.windowSpriteTiles.slice(bottomRow, bottomRow + 8 * TILE_SIZE_4BPP).filter((_, i) => i % TILE_SIZE_4BPP === 0)]).toEqual([6, 7, 7, 7, 7, 7, 7, 8]);
    expect(BufferMenuFrameTiles(runtime)).toBe(false);
  });

  test('OpenMonMarkingsMenu initializes bits and creates window, marking, text, and cursor sprites', () => {
    const menu = createMonMarkingsMenu(300, 400);
    const runtime = createMonMarkingsRuntime();
    InitMonMarkingsMenu(runtime, menu);

    menu.markings = 0b1010;
    menu.markingsArray = [0, 1, 0, 1];
    CreateMonMarkingsMenuSprites(runtime, 20, 30, menu.baseTileTag, menu.basePaletteTag);

    expect(menu.markings).toBe(0b1010);
    expect(menu.markingsArray).toEqual([0, 1, 0, 1]);
    expect(runtime.loadedSpriteSheets.map((sheet) => [sheet.tag, sheet.size])).toEqual([[300, 0x1000], [301, 0x320]]);
    expect(runtime.loadedSpritePalettes.map((pal) => pal.tag)).toEqual([400, 401]);
    expect(menu.windowSprites.map((sprite) => sprite?.x)).toEqual([52, 52]);
    expect(menu.windowSprites.map((sprite) => sprite?.y)).toEqual([62, 126]);
    expect(menu.windowSprites.map((sprite) => sprite?.animNum)).toEqual([0, 1]);
    expect(menu.markingSprites.map((sprite) => sprite?.x)).toEqual([52, 52, 52, 52]);
    expect(menu.markingSprites.map((sprite) => sprite?.y)).toEqual([46, 62, 78, 94]);
    expect(menu.markingSprites.map((sprite) => sprite?.data[0])).toEqual([0, 1, 2, 3]);
    expect(menu.textSprite?.animNum).toBe(ANIM_TEXT);
    expect(menu.textSprite?.x).toBe(52);
    expect(menu.textSprite?.y).toBe(110);
    expect(menu.textSprite?.centerToCornerVec).toEqual({ shape: '32x16', size: '32x16', affineMode: 'off' });
    expect(menu.cursorSprite?.x).toBe(32);
    expect(menu.cursorSprite?.data[0]).toBe(46);
    expect(menu.cursorSprite?.animNum).toBe(ANIM_CURSOR);

    const opened = createMonMarkingsMenu(500, 600);
    const openedRuntime = createMonMarkingsRuntime();
    InitMonMarkingsMenu(openedRuntime, opened);
    OpenMonMarkingsMenu(openedRuntime, 0b1010, 20, 30);
    expect(opened.cursorPos).toBe(0);
  });

  test('marking and cursor callbacks update animations and y position from menu state', () => {
    const menu = createMonMarkingsMenu();
    const runtime = createMonMarkingsRuntime();
    InitMonMarkingsMenu(runtime, menu);
    OpenMonMarkingsMenu(runtime, 0b0101, 0, 0);

    for (const sprite of menu.markingSprites) {
      SpriteCB_Marking(runtime, sprite!);
    }
    expect(menu.markingSprites.map((sprite) => sprite?.animNum)).toEqual([1, 2, 5, 6]);

    menu.cursorPos = 3;
    SpriteCB_Cursor(runtime, menu.cursorSprite!);
    expect(menu.cursorSprite?.y).toBe(64);
  });

  test('HandleMonMarkingsMenuInput wraps cursor movement, toggles markings, confirms OK, and exits on cancel/B', () => {
    const menu = createMonMarkingsMenu();
    const runtime = createMonMarkingsRuntime();
    InitMonMarkingsMenu(runtime, menu);
    OpenMonMarkingsMenu(runtime, 0, 0, 0);

    runtime.joyNew = DPAD_UP;
    expect(HandleMonMarkingsMenuInput(runtime)).toBe(true);
    expect(menu.cursorPos).toBe(SELECTION_CANCEL);
    runtime.joyNew = DPAD_DOWN;
    expect(HandleMonMarkingsMenuInput(runtime)).toBe(true);
    expect(menu.cursorPos).toBe(0);

    runtime.joyNew = A_BUTTON;
    expect(HandleMonMarkingsMenuInput(runtime)).toBe(true);
    expect(menu.markingsArray[0]).toBe(1);

    menu.cursorPos = SELECTION_OK;
    menu.markingsArray = [1, 0, 1, 1];
    expect(HandleMonMarkingsMenuInput(runtime)).toBe(false);
    expect(menu.markings).toBe(0b1101);

    menu.cursorPos = SELECTION_CANCEL;
    expect(HandleMonMarkingsMenuInput(runtime)).toBe(false);
    runtime.joyNew = B_BUTTON;
    expect(HandleMonMarkingsMenuInput(runtime)).toBe(false);
    expect(runtime.playedSounds).toEqual([SE_SELECT, SE_SELECT, SE_SELECT, SE_SELECT, SE_SELECT, SE_SELECT]);
  });

  test('FreeMonMarkingsMenu frees tags and destroys sprites, preserving the C early-return on null slots', () => {
    const menu = createMonMarkingsMenu(10, 20);
    const runtime = createMonMarkingsRuntime();
    InitMonMarkingsMenu(runtime, menu);
    OpenMonMarkingsMenu(runtime, 0, 0, 0);
    menu.markingSprites[2] = null;

    FreeMonMarkingsMenu(runtime);

    expect(runtime.freedTileTags).toEqual([10, 11, 12]);
    expect(runtime.freedPaletteTags).toEqual([20, 21]);
    expect(runtime.destroyedSpriteIds).toEqual([
      menu.windowSprites[0]?.id,
      menu.windowSprites[1]?.id,
      menu.markingSprites[0]?.id,
      menu.markingSprites[1]?.id
    ]);
    expect(menu.cursorSprite?.destroyed).toBe(false);
    expect(menu.textSprite?.destroyed).toBe(false);
  });

  test('CreateMonMarking combo sprite helpers load exact sheet sizes and default/custom palettes', () => {
    const runtime = createMonMarkingsRuntime();
    const customPalette = Uint16Array.of(1, 2, 3);

    const all = CreateMonMarkingAllCombosSprite(runtime, 50, 60, null);
    const one = CreateMonMarkingComboSprite(runtime, 51, 61, customPalette);
    const direct = CreateMarkingComboSprite(runtime, 52, 62, customPalette, 2);

    expect(all?.tileTag).toBe(50);
    expect(one?.paletteTag).toBe(61);
    expect(direct?.tileTag).toBe(52);
    expect(runtime.loadedSpriteSheets.map((sheet) => [sheet.tag, sheet.size])).toEqual([
      [50, (1 << NUM_MON_MARKINGS) * 0x80],
      [51, 0x80],
      [52, 2 * 0x80]
    ]);
    expect(runtime.loadedSpritePalettes[0].data).toBe(runtime.monMarkingsPal);
    expect(runtime.loadedSpritePalettes[1].data).toBe(customPalette);
  });

  test('CreateMonMarking combo sprite returns null when CreateSprite fails', () => {
    const runtime = createMonMarkingsRuntime({ nextCreateSpriteResult: MAX_SPRITES });

    expect(CreateMonMarkingComboSprite(runtime, 1, 2, null)).toBeNull();
    expect(runtime.loadedSpriteSheets).toHaveLength(1);
    expect(runtime.loadedSpritePalettes).toHaveLength(1);
  });

  test('UpdateMonMarkingTiles copies the 0x80-byte marking combination block and records DMA3 mode', () => {
    const runtime = createMonMarkingsRuntime({
      monMarkingsGfx: Uint8Array.from(Array.from({ length: 16 * 0x80 }, (_, i) => i & 0xff))
    });
    const dest = new Uint8Array(0x80);

    UpdateMonMarkingTiles(runtime, 3, dest);

    expect([...dest]).toEqual([...runtime.monMarkingsGfx.slice(3 * 0x80, 4 * 0x80)]);
    expect(runtime.dma3Copies).toHaveLength(1);
    expect(runtime.dma3Copies[0]).toMatchObject({ dest, size: 0x80, mode: 'DMA3_32BIT' });
  });
});
