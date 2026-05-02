import { describe, expect, test } from 'vitest';
import {
  BG_ATTR_BGTYPE,
  BG_ATTR_SCREENSIZE,
  TilemapUtil_Draw,
  TilemapUtil_DrawPrev,
  TilemapUtil_Free,
  TilemapUtil_Init,
  TilemapUtil_Move,
  TilemapUtil_SetPos,
  TilemapUtil_SetRect,
  TilemapUtil_SetSavedMap,
  TilemapUtil_SetTilemap,
  TilemapUtil_Update,
  TilemapUtil_UpdateAll,
  createTilemapUtilRuntime,
  getBgAttribute,
  tilemapUtilFree,
  tilemapUtilInit,
  tilemapUtilMove,
  tilemapUtilSetBgAttributes,
  tilemapUtilSetPos,
  tilemapUtilSetRect,
  tilemapUtilSetSavedMap,
  tilemapUtilSetTilemap,
  tilemapUtilUpdate,
  tilemapUtilUpdateAll
} from '../src/game/decompTilemapUtil';

describe('decomp tilemap_util', () => {
  test('init, set tilemap, and attribute-derived fields follow C setup', () => {
    const runtime = createTilemapUtilRuntime();
    tilemapUtilSetBgAttributes(runtime, 1, 2, 0);
    tilemapUtilInit(runtime, 2);
    const tilemap = new Uint8Array(64);

    tilemapUtilSetTilemap(runtime, 0, 1, tilemap, 8, 4);

    expect(getBgAttribute(runtime, 1, BG_ATTR_SCREENSIZE)).toBe(2);
    expect(getBgAttribute(runtime, 1, BG_ATTR_BGTYPE)).toBe(0);
    expect(runtime.entries?.[0]).toMatchObject({
      bg: 1,
      width: 8,
      height: 4,
      altWidth: 256,
      altHeight: 512,
      tileSize: 2,
      rowSize: 16,
      active: true
    });
    expect(runtime.entries?.[0].prev).toEqual(runtime.entries?.[0].cur);
  });

  test('position, rectangle, and move modes mutate current rect exactly', () => {
    const runtime = createTilemapUtilRuntime();
    tilemapUtilInit(runtime, 1);
    tilemapUtilSetTilemap(runtime, 0, 0, new Uint8Array(100), 10, 5);
    tilemapUtilSetPos(runtime, 0, 2, 3);
    tilemapUtilSetRect(runtime, 0, 1, 2, 6, 3);

    tilemapUtilMove(runtime, 0, 0, 2);
    expect(runtime.entries?.[0].cur).toMatchObject({ destX: 4, width: 4 });
    tilemapUtilMove(runtime, 0, 1, 3);
    expect(runtime.entries?.[0].cur).toMatchObject({ x: 4, width: 7 });
    tilemapUtilMove(runtime, 0, 2, 1);
    expect(runtime.entries?.[0].cur).toMatchObject({ destY: 4, height: 2 });
    tilemapUtilMove(runtime, 0, 3, 4);
    expect(runtime.entries?.[0].cur).toMatchObject({ y: -2, height: 6 });
    tilemapUtilMove(runtime, 0, 4, 1);
    tilemapUtilMove(runtime, 0, 5, 2);
    expect(runtime.entries?.[0].cur).toMatchObject({ destX: 5, destY: 6 });
  });

  test('update draws saved previous rect first and current rect row by row', () => {
    const runtime = createTilemapUtilRuntime();
    tilemapUtilInit(runtime, 1);
    const tilemap = Uint8Array.from({ length: 32 }, (_unused, i) => i);
    const saved = Uint8Array.from({ length: 512 * 2 }, (_unused, i) => 255 - (i & 0xff));
    tilemapUtilSetTilemap(runtime, 0, 0, tilemap, 4, 4);
    tilemapUtilSetSavedMap(runtime, 0, saved);
    tilemapUtilSetRect(runtime, 0, 1, 1, 2, 2);
    tilemapUtilSetPos(runtime, 0, 5, 6);

    tilemapUtilUpdate(runtime, 0);

    expect(runtime.copies).toHaveLength(6);
    expect(runtime.copies[0]).toMatchObject({ destX: 0, destY: 0, width: 4, height: 1 });
    expect(runtime.copies[4]).toMatchObject({ destX: 5, destY: 6, width: 2, height: 1 });
    expect([...runtime.copies[4].tiles]).toEqual([10, 11, 12, 13]);
    expect(runtime.entries?.[0].prev).toEqual(runtime.entries?.[0].cur);
  });

  test('update all skips inactive entries and free clears the allocation pointer', () => {
    const runtime = createTilemapUtilRuntime();
    tilemapUtilInit(runtime, 2);
    tilemapUtilSetTilemap(runtime, 1, 0, new Uint8Array(8), 2, 2);

    tilemapUtilUpdateAll(runtime);
    expect(runtime.copies).toHaveLength(2);

    tilemapUtilFree(runtime);
    expect(runtime.entries).toBeNull();
  });

  test('exact C-name tilemap util exports preserve setup, movement, drawing, update all, and free behavior', () => {
    const runtime = createTilemapUtilRuntime();
    tilemapUtilSetBgAttributes(runtime, 2, 1, 0);
    TilemapUtil_Init(runtime, 2);
    const tilemap = Uint8Array.from({ length: 64 }, (_unused, i) => i);
    const saved = Uint8Array.from({ length: 512 * 2 }, (_unused, i) => 200 - (i & 0xff));

    TilemapUtil_SetTilemap(runtime, 0, 2, tilemap, 8, 4);
    expect(runtime.entries?.[0]).toMatchObject({
      bg: 2,
      width: 8,
      height: 4,
      altWidth: 512,
      altHeight: 256,
      tileSize: 2,
      rowSize: 16,
      active: true
    });

    TilemapUtil_SetSavedMap(runtime, 0, saved);
    TilemapUtil_SetPos(runtime, 0, 4, 5);
    TilemapUtil_SetRect(runtime, 0, 1, 1, 3, 2);
    TilemapUtil_Move(runtime, 0, 4, 2);
    TilemapUtil_Move(runtime, 0, 5, 1);
    expect(runtime.entries?.[0].cur).toMatchObject({ x: 1, y: 1, width: 3, height: 2, destX: 6, destY: 6 });

    TilemapUtil_DrawPrev(runtime, 0);
    expect(runtime.copies).toHaveLength(4);
    expect(runtime.copies[0]).toMatchObject({ bg: 2, destX: 0, destY: 0, width: 8, height: 1 });

    TilemapUtil_Draw(runtime, 0);
    expect(runtime.copies).toHaveLength(6);
    expect(runtime.copies[4]).toMatchObject({ bg: 2, destX: 6, destY: 6, width: 3, height: 1 });
    expect([...runtime.copies[4].tiles]).toEqual([18, 19, 20, 21, 22, 23]);

    runtime.copies = [];
    TilemapUtil_Update(runtime, 0);
    expect(runtime.copies).toHaveLength(6);
    expect(runtime.entries?.[0].prev).toEqual(runtime.entries?.[0].cur);

    TilemapUtil_SetTilemap(runtime, 1, 2, new Uint8Array(8), 2, 2);
    runtime.copies = [];
    TilemapUtil_UpdateAll(runtime);
    expect(runtime.copies.length).toBeGreaterThan(0);

    TilemapUtil_Free(runtime);
    expect(runtime.entries).toBeNull();
  });
});
