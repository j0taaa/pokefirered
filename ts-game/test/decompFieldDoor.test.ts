import { describe, expect, test } from 'vitest';
import {
  AnimateDoorFrame,
  AnimateDoorOpenInternal,
  BuildDoorTiles,
  CLOSED_DOOR_TILES_OFFSET,
  CopyDoorTilesToVram,
  DOOR_SIZE_1x1,
  DOOR_SIZE_1x2,
  DOOR_SOUND_NORMAL,
  DOOR_SOUND_SLIDING,
  DOOR_TILE_START,
  DrawClosedDoor,
  DrawClosedDoorTiles,
  DrawCurrentDoorAnimFrame,
  DrawDoor,
  DrawOpenedDoor,
  FieldAnimateDoorClose,
  FieldAnimateDoorOpen,
  FieldIsDoorAnimationRunning,
  FieldSetDoorClosed,
  FieldSetDoorOpened,
  GetDoorGraphics,
  GetDoorSoundEffect,
  GetDoorSoundType,
  GetLastDoorAnimFrame,
  MB_WARP_DOOR,
  METATILE_DepartmentStore_ElevatorDoor,
  METATILE_General_Door,
  METATILE_General_SlidingSingleDoor,
  SE_DOOR,
  SE_SLIDING_DOOR,
  StartDoorAnimationTask,
  StartDoorCloseAnimation,
  Task_AnimateDoor,
  TILE_SIZE_4BPP,
  animateDoorFrame,
  animateDoorOpenInternal,
  buildDoorTiles,
  copyDoorTilesToVram,
  createFieldDoorRuntime,
  drawClosedDoor,
  drawClosedDoorTiles,
  drawCurrentDoorAnimFrame,
  drawDoor,
  drawOpenedDoor,
  fieldAnimateDoorClose,
  fieldAnimateDoorOpen,
  fieldIsDoorAnimationRunning,
  fieldSetDoorClosed,
  fieldSetDoorOpened,
  getDoorGraphics,
  getDoorSoundEffect,
  getDoorSoundType,
  getLastDoorAnimFrame,
  sDoorAnimFrames_CloseLarge,
  sDoorAnimFrames_CloseSmall,
  sDoorAnimFrames_OpenLarge,
  sDoorAnimFrames_OpenSmall,
  sDoorGraphics,
  startDoorAnimationTask,
  startDoorCloseAnimation,
  taskAnimateDoor
} from '../src/game/decompFieldDoor';

describe('decomp field_door', () => {
  test('exact C function names are exported as the implemented field door routines', () => {
    expect(DrawDoor).toBe(drawDoor);
    expect(DrawClosedDoorTiles).toBe(drawClosedDoorTiles);
    expect(CopyDoorTilesToVram).toBe(copyDoorTilesToVram);
    expect(DrawCurrentDoorAnimFrame).toBe(drawCurrentDoorAnimFrame);
    expect(BuildDoorTiles).toBe(buildDoorTiles);
    expect(Task_AnimateDoor).toBe(taskAnimateDoor);
    expect(AnimateDoorFrame).toBe(animateDoorFrame);
    expect(GetDoorGraphics).toBe(getDoorGraphics);
    expect(StartDoorAnimationTask).toBe(startDoorAnimationTask);
    expect(DrawClosedDoor).toBe(drawClosedDoor);
    expect(DrawOpenedDoor).toBe(drawOpenedDoor);
    expect(GetLastDoorAnimFrame).toBe(getLastDoorAnimFrame);
    expect(AnimateDoorOpenInternal).toBe(animateDoorOpenInternal);
    expect(StartDoorCloseAnimation).toBe(startDoorCloseAnimation);
    expect(FieldSetDoorOpened).toBe(fieldSetDoorOpened);
    expect(FieldSetDoorClosed).toBe(fieldSetDoorClosed);
    expect(FieldAnimateDoorClose).toBe(fieldAnimateDoorClose);
    expect(FieldAnimateDoorOpen).toBe(fieldAnimateDoorOpen);
    expect(FieldIsDoorAnimationRunning).toBe(fieldIsDoorAnimationRunning);
    expect(GetDoorSoundEffect).toBe(getDoorSoundEffect);
    expect(GetDoorSoundType).toBe(getDoorSoundType);
  });

  test('door tables and lookup preserve metatile, sound, size, and sentinel behavior', () => {
    expect(sDoorAnimFrames_OpenSmall.map((frame) => frame.tileOffset)).toEqual([CLOSED_DOOR_TILES_OFFSET, 0, 4 * TILE_SIZE_4BPP, 8 * TILE_SIZE_4BPP, 0]);
    expect(sDoorAnimFrames_OpenLarge.map((frame) => frame.tileOffset)).toEqual([CLOSED_DOOR_TILES_OFFSET, 0, 8 * TILE_SIZE_4BPP, 16 * TILE_SIZE_4BPP, 0]);
    expect(sDoorAnimFrames_CloseSmall.map((frame) => frame.tileOffset)).toEqual([8 * TILE_SIZE_4BPP, 4 * TILE_SIZE_4BPP, 0, CLOSED_DOOR_TILES_OFFSET, 0]);
    expect(sDoorGraphics[0]).toMatchObject({ metatileId: METATILE_General_Door, sound: DOOR_SOUND_NORMAL, size: DOOR_SIZE_1x1 });
    expect(getDoorGraphics(sDoorGraphics, METATILE_General_SlidingSingleDoor)).toMatchObject({
      sound: DOOR_SOUND_SLIDING,
      size: DOOR_SIZE_1x1,
      tiles: 'graphics/door_anims/sliding_single.4bpp'
    });
    expect(getDoorGraphics(sDoorGraphics, METATILE_DepartmentStore_ElevatorDoor)).toMatchObject({ sound: DOOR_SOUND_SLIDING, size: DOOR_SIZE_1x2 });
    expect(getDoorGraphics(sDoorGraphics, 0xffff)).toBeNull();
    expect(getLastDoorAnimFrame(sDoorAnimFrames_OpenSmall)).toEqual({ duration: 4, tileOffset: 8 * TILE_SIZE_4BPP });
  });

  test('BuildDoorTiles uses door tile numbers for the bottom layer and palette-only zero tile for the top layer', () => {
    expect(buildDoorTiles(DOOR_TILE_START, [2, 3, 4, 5, 6, 7, 8, 9])).toEqual([
      (2 << 12) | DOOR_TILE_START,
      (3 << 12) | (DOOR_TILE_START + 1),
      (4 << 12) | (DOOR_TILE_START + 2),
      (5 << 12) | (DOOR_TILE_START + 3),
      6 << 12,
      7 << 12,
      8 << 12,
      9 << 12
    ]);
  });

  test('closed and current animation frame drawing preserve 1x1 and 1x2 coordinate order', () => {
    const runtime = createFieldDoorRuntime();
    const small = sDoorGraphics[0];
    const large = getDoorGraphics(sDoorGraphics, METATILE_DepartmentStore_ElevatorDoor)!;

    drawClosedDoorTiles(runtime, small, 5, 6);
    expect(runtime.currentMapDraws).toEqual([{ x: 5, y: 6 }]);

    drawClosedDoorTiles(runtime, large, 7, 8);
    expect(runtime.currentMapDraws.slice(-2)).toEqual([{ x: 7, y: 8 }, { x: 7, y: 7 }]);

    drawCurrentDoorAnimFrame(runtime, small, 1, 2, [2, 2, 2, 2, 2, 2, 2, 2]);
    expect(runtime.doorMetatileDraws.at(-1)).toEqual({ x: 1, y: 2, tiles: buildDoorTiles(DOOR_TILE_START, [2, 2, 2, 2, 2, 2, 2, 2]) });

    drawCurrentDoorAnimFrame(runtime, large, 9, 10, [8, 8, 2, 2, 2, 2, 2, 2]);
    expect(runtime.doorMetatileDraws.slice(-2)).toEqual([
      { x: 9, y: 9, tiles: buildDoorTiles(DOOR_TILE_START, [8, 8, 2, 2, 2, 2, 2, 2]) },
      { x: 9, y: 10, tiles: buildDoorTiles(DOOR_TILE_START + 4, [2, 2, 2, 2]) }
    ]);
  });

  test('DrawDoor chooses closed map redraw or tile copy plus animated metatile draw', () => {
    const runtime = createFieldDoorRuntime();
    const small = sDoorGraphics[0];

    drawDoor(runtime, small, { duration: 4, tileOffset: CLOSED_DOOR_TILES_OFFSET }, 1, 2);
    expect(runtime.currentMapDraws).toEqual([{ x: 1, y: 2 }]);

    drawDoor(runtime, small, { duration: 4, tileOffset: 4 * TILE_SIZE_4BPP }, 3, 4);
    expect(runtime.copiedDoorTiles.at(-1)).toEqual({
      tiles: 'graphics/door_anims/general.4bpp',
      offset: 4 * TILE_SIZE_4BPP,
      destTile: DOOR_TILE_START,
      size: 8 * TILE_SIZE_4BPP
    });
    expect(runtime.doorMetatileDraws.at(-1)?.x).toBe(3);

    copyDoorTilesToVram(runtime, 'asset', 96);
    expect(runtime.calls.at(-1)).toEqual({
      fn: 'CpuFastCopy',
      args: ['asset+96', `VRAM+TILE_OFFSET_4BPP(${DOOR_TILE_START})`, 8 * TILE_SIZE_4BPP]
    });
  });

  test('AnimateDoorFrame draws only when counter is zero, advances after duration, and stops at the sentinel frame', () => {
    const runtime = createFieldDoorRuntime();
    const data = [0, 0, 0, 0, 0, 0, 10, 11];

    expect(animateDoorFrame(runtime, sDoorGraphics[0], sDoorAnimFrames_OpenSmall, data)).toBe(true);
    expect(runtime.currentMapDraws).toEqual([{ x: 10, y: 11 }]);
    expect(data[4]).toBe(0);
    expect(data[5]).toBe(1);

    for (let i = 0; i < 3; i += 1) {
      expect(animateDoorFrame(runtime, sDoorGraphics[0], sDoorAnimFrames_OpenSmall, data)).toBe(true);
    }
    expect(data[4]).toBe(0);
    expect(data[5]).toBe(4);

    expect(animateDoorFrame(runtime, sDoorGraphics[0], sDoorAnimFrames_OpenSmall, data)).toBe(true);
    expect(data[4]).toBe(1);
    expect(data[5]).toBe(0);

    data[4] = 3;
    data[5] = 4;
    expect(animateDoorFrame(runtime, sDoorGraphics[0], sDoorAnimFrames_OpenSmall, data)).toBe(false);
    expect(data[4]).toBe(4);
  });

  test('door animation task creation rejects duplicate active tasks and Task_AnimateDoor destroys at completion', () => {
    const runtime = createFieldDoorRuntime();
    const taskId = startDoorAnimationTask(runtime, sDoorGraphics[0], sDoorAnimFrames_OpenSmall, 4, 5);

    expect(taskId).toBe(0);
    expect(runtime.tasks[taskId]).toMatchObject({ func: 'Task_AnimateDoor', priority: 80 });
    expect(runtime.tasks[taskId].data[6]).toBe(4);
    expect(runtime.tasks[taskId].data[7]).toBe(5);
    expect(startDoorAnimationTask(runtime, sDoorGraphics[0], sDoorAnimFrames_OpenSmall, 1, 1)).toBe(-1);

    for (let i = 0; i < 25 && !runtime.tasks[taskId].destroyed; i += 1) {
      taskAnimateDoor(runtime, taskId);
    }
    expect(runtime.tasks[taskId].destroyed).toBe(true);
    expect(fieldIsDoorAnimationRunning(runtime)).toBe(false);
  });

  test('open/close internals choose small or large frame tables based on metatile graphics and reject unknown metatiles', () => {
    const runtime = createFieldDoorRuntime();
    runtime.metatileIds['1,2'] = METATILE_General_Door;
    runtime.metatileIds['3,4'] = METATILE_DepartmentStore_ElevatorDoor;
    runtime.metatileIds['5,6'] = 0x777;

    const smallTaskId = animateDoorOpenInternal(runtime, sDoorGraphics, 1, 2);
    expect(runtime.tasks[smallTaskId].frames).toBe(sDoorAnimFrames_OpenSmall);
    runtime.tasks[smallTaskId].destroyed = true;

    const largeTaskId = animateDoorOpenInternal(runtime, sDoorGraphics, 3, 4);
    expect(runtime.tasks[largeTaskId].frames).toBe(sDoorAnimFrames_OpenLarge);
    runtime.tasks[largeTaskId].destroyed = true;

    const closeTaskId = startDoorCloseAnimation(runtime, sDoorGraphics, 3, 4);
    expect(runtime.tasks[closeTaskId].frames).toBe(sDoorAnimFrames_CloseLarge);
    runtime.tasks[closeTaskId].destroyed = true;

    expect(animateDoorOpenInternal(runtime, sDoorGraphics, 5, 6)).toBe(-1);
    expect(startDoorCloseAnimation(runtime, sDoorGraphics, 5, 6)).toBe(-1);
  });

  test('public open/close/set helpers gate on warp-door behavior and preserve FieldSetDoorClosed first-table-entry quirk', () => {
    const runtime = createFieldDoorRuntime();
    runtime.metatileIds['10,10'] = METATILE_DepartmentStore_ElevatorDoor;
    runtime.metatileBehaviors['10,10'] = MB_WARP_DOOR;
    runtime.metatileIds['20,20'] = METATILE_General_Door;
    runtime.metatileBehaviors['20,20'] = 0;

    expect(fieldAnimateDoorOpen(runtime, 20, 20)).toBe(-1);
    expect(fieldAnimateDoorClose(runtime, 20, 20)).toBe(-1);

    const openTaskId = fieldAnimateDoorOpen(runtime, 10, 10);
    expect(runtime.tasks[openTaskId].frames).toBe(sDoorAnimFrames_OpenLarge);
    runtime.tasks[openTaskId].destroyed = true;

    const closeTaskId = fieldAnimateDoorClose(runtime, 10, 10);
    expect(runtime.tasks[closeTaskId].frames).toBe(sDoorAnimFrames_CloseLarge);
    runtime.tasks[closeTaskId].destroyed = true;

    fieldSetDoorOpened(runtime, 10, 10);
    expect(runtime.doorMetatileDraws.slice(-2).map((draw) => draw.y)).toEqual([9, 10]);

    fieldSetDoorClosed(runtime, 10, 10);
    expect(runtime.currentMapDraws.at(-1)).toEqual({ x: 10, y: 10 });
    expect(runtime.currentMapDraws.at(-2)).not.toEqual({ x: 10, y: 9 });

    fieldSetDoorOpened(runtime, 20, 20);
    fieldSetDoorClosed(runtime, 20, 20);
    expect(runtime.currentMapDraws.at(-1)).toEqual({ x: 10, y: 10 });
  });

  test('door sound effects return normal, sliding, and sliding fallback for unknown graphics exactly like the C else branch', () => {
    const runtime = createFieldDoorRuntime();
    runtime.metatileIds['1,1'] = METATILE_General_Door;
    runtime.metatileIds['2,2'] = METATILE_General_SlidingSingleDoor;
    runtime.metatileIds['3,3'] = 0x555;

    expect(getDoorSoundType(runtime, sDoorGraphics, 1, 1)).toBe(DOOR_SOUND_NORMAL);
    expect(getDoorSoundType(runtime, sDoorGraphics, 2, 2)).toBe(DOOR_SOUND_SLIDING);
    expect(getDoorSoundType(runtime, sDoorGraphics, 3, 3)).toBe(-1);
    expect(getDoorSoundEffect(runtime, 1, 1)).toBe(SE_DOOR);
    expect(getDoorSoundEffect(runtime, 2, 2)).toBe(SE_SLIDING_DOOR);
    expect(getDoorSoundEffect(runtime, 3, 3)).toBe(SE_SLIDING_DOOR);
  });

  test('DrawOpenedDoor uses the last open frame for the door size and ignores missing graphics', () => {
    const runtime = createFieldDoorRuntime();
    runtime.metatileIds['4,4'] = METATILE_General_Door;
    runtime.metatileIds['5,5'] = METATILE_DepartmentStore_ElevatorDoor;
    runtime.metatileIds['6,6'] = 0x999;

    drawOpenedDoor(runtime, sDoorGraphics, 4, 4);
    expect(runtime.copiedDoorTiles.at(-1)?.offset).toBe(8 * TILE_SIZE_4BPP);

    drawOpenedDoor(runtime, sDoorGraphics, 5, 5);
    expect(runtime.copiedDoorTiles.at(-1)?.offset).toBe(16 * TILE_SIZE_4BPP);
    expect(runtime.doorMetatileDraws.slice(-2).map((draw) => draw.y)).toEqual([4, 5]);

    const drawCount = runtime.doorMetatileDraws.length;
    drawOpenedDoor(runtime, sDoorGraphics, 6, 6);
    expect(runtime.doorMetatileDraws).toHaveLength(drawCount);
  });
});
