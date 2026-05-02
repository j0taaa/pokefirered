import { describe, expect, test } from 'vitest';
import {
  CURSOR_AREA_BOX_TITLE,
  CURSOR_AREA_BUTTONS,
  CURSOR_AREA_IN_BOX,
  CURSOR_AREA_IN_HAND,
  CURSOR_AREA_IN_PARTY,
  MOVE_MODE_MULTIPLE_SELECTING,
  MOVE_MODE_NORMAL,
  OPTION_DEPOSIT,
  OPTION_MOVE_ITEMS,
  PARTY_SIZE,
  IN_BOX_COUNT,
  SPECIES_NONE,
  TOTAL_BOXES_COUNT,
  WALLPAPER_COUNT,
  BackupPokemonStorage,
  BoxMonAtToMon,
  CopyBoxMonAt,
  CreateBoxMonAt,
  GetAndCopyBoxMonDataAt,
  GetBoxMonDataAt,
  GetBoxMonNickAt,
  GetBoxNamePtr,
  GetBoxWallpaper,
  GetBoxedMonPtr,
  GetCurrentBoxMonData,
  RestorePokemonStorage,
  SeekToNextMonInBox,
  SetBoxMonAt,
  SetBoxMonDataAt,
  SetBoxMonNickAt,
  SetBoxWallpaper,
  SetCurrentBox,
  SetCurrentBoxMonData,
  StorageGetCurrentBox,
  ZeroBoxMonAt,
  backupPokemonStorage,
  boxMonAtToMon,
  clearSavedCursorPos,
  compactPartySlots,
  copyBoxMonAt,
  createBoxMonAt,
  createPokemonStorage,
  createStorageCursorRuntime,
  getBoxCursorPosition,
  getAndCopyBoxMonDataAt,
  getBoxMonDataAt,
  getBoxMonNickAt,
  getBoxNamePtr,
  getBoxWallpaper,
  getBoxedMonPtr,
  getCursorBoxColumnAndRow,
  getCursorCoordsByPos,
  getCurrentBoxMonData,
  getSavedCursorPos,
  initCursorMove,
  initNewCursorPos,
  isCursorInBox,
  isCursorOnBoxTitle,
  isCursorOnCloseBox,
  isMonBeingMoved,
  restorePokemonStorage,
  saveCursorPos,
  seekToNextMonInBox,
  setBoxMonAt,
  setBoxMonDataAt,
  setBoxMonNickAt,
  setCursorBoxPosition,
  setCursorInParty,
  setCursorPosition,
  setBoxWallpaper,
  setCurrentBox,
  setCurrentBoxMonData,
  storageGetCurrentBox,
  updateCursorPos,
  zeroBoxMonAt
} from '../src/game/decompPokemonStorageSystem';

describe('decompPokemonStorageSystem', () => {
  test('exports exact C function names for pokemon_storage_system utilities', () => {
    expect(BackupPokemonStorage).toBe(backupPokemonStorage);
    expect(RestorePokemonStorage).toBe(restorePokemonStorage);
    expect(StorageGetCurrentBox).toBe(storageGetCurrentBox);
    expect(SetCurrentBox).toBe(setCurrentBox);
    expect(GetBoxMonDataAt).toBe(getBoxMonDataAt);
    expect(SetBoxMonDataAt).toBe(setBoxMonDataAt);
    expect(GetCurrentBoxMonData).toBe(getCurrentBoxMonData);
    expect(SetCurrentBoxMonData).toBe(setCurrentBoxMonData);
    expect(GetBoxMonNickAt).toBe(getBoxMonNickAt);
    expect(SetBoxMonNickAt).toBe(setBoxMonNickAt);
    expect(GetAndCopyBoxMonDataAt).toBe(getAndCopyBoxMonDataAt);
    expect(SetBoxMonAt).toBe(setBoxMonAt);
    expect(CopyBoxMonAt).toBe(copyBoxMonAt);
    expect(CreateBoxMonAt).toBe(createBoxMonAt);
    expect(ZeroBoxMonAt).toBe(zeroBoxMonAt);
    expect(BoxMonAtToMon).toBe(boxMonAtToMon);
    expect(GetBoxedMonPtr).toBe(getBoxedMonPtr);
    expect(GetBoxNamePtr).toBe(getBoxNamePtr);
    expect(GetBoxWallpaper).toBe(getBoxWallpaper);
    expect(SetBoxWallpaper).toBe(setBoxWallpaper);
    expect(SeekToNextMonInBox).toBe(seekToNextMonInBox);
  });

  test('backs up/restores storage and guards current box assignment', () => {
    const storage = createPokemonStorage();
    setCurrentBox(storage, 3);
    const backup = backupPokemonStorage(storage);
    setCurrentBox(storage, TOTAL_BOXES_COUNT);
    expect(storageGetCurrentBox(storage)).toBe(3);
    setCurrentBox(storage, 4);
    restorePokemonStorage(storage, backup);
    expect(storageGetCurrentBox(storage)).toBe(3);
  });

  test('box mon data and nickname accessors return zero/EOS on invalid slots', () => {
    const storage = createPokemonStorage();
    setBoxMonDataAt(storage, 1, 2, 0, 25);
    setBoxMonDataAt(storage, 1, 2, 1, true);
    setBoxMonDataAt(storage, 1, 2, 42, 99);
    setBoxMonNickAt(storage, 1, 2, 'PIKA');
    expect(getBoxMonDataAt(storage, 1, 2, 0)).toBe(25);
    expect(getBoxMonDataAt(storage, 1, 2, 1)).toBe(1);
    expect(getBoxMonDataAt(storage, 1, 2, 42)).toBe(99);
    expect(getBoxMonNickAt(storage, 1, 2)).toBe('PIKA');
    expect(getBoxMonDataAt(storage, TOTAL_BOXES_COUNT, 0, 0)).toBe(0);
    expect(getBoxMonNickAt(storage, 0, IN_BOX_COUNT)).toBe('');
  });

  test('current box data helpers route through storage currentBox', () => {
    const storage = createPokemonStorage();
    setCurrentBox(storage, 2);
    setCurrentBoxMonData(storage, 5, 0, 150);
    expect(getCurrentBoxMonData(storage, 5, 0)).toBe(150);
  });

  test('set/copy/create/zero boxed mon helpers mirror bounds behavior', () => {
    const storage = createPokemonStorage();
    setBoxMonAt(storage, 0, 0, { species: 10, nickname: 'A' });
    expect(copyBoxMonAt(storage, 0, 0)).toEqual({ species: 10, nickname: 'A' });
    expect(getBoxedMonPtr(storage, 0, 0)?.species).toBe(10);
    expect(copyBoxMonAt(storage, TOTAL_BOXES_COUNT, 0)).toBeNull();
    expect(getBoxedMonPtr(storage, 0, IN_BOX_COUNT)).toBeNull();

    createBoxMonAt(storage, 0, 1, 20, 5, 1, 1, 0x1234, 2, 0x5678);
    expect(storage.boxes[0][1]).toMatchObject({
      species: 20,
      level: 5,
      fixedIV: 1,
      hasFixedPersonality: 1,
      personality: 0x1234,
      otIDType: 2,
      otID: 0x5678
    });
    zeroBoxMonAt(storage, 0, 1);
    expect(storage.boxes[0][1].species).toBe(SPECIES_NONE);
  });

  test('GetAndCopyBoxMonDataAt and BoxMonAtToMon mirror destination-copy bounds behavior', () => {
    const storage = createPokemonStorage();
    setBoxMonAt(storage, 0, 0, { species: 151, nickname: 'MEW', isEgg: false });
    setBoxMonDataAt(storage, 0, 0, 42, 1234);

    const objectDst: { value?: number | string | boolean } = {};
    expect(getAndCopyBoxMonDataAt(storage, 0, 0, 42, objectDst)).toBe(1234);
    expect(objectDst.value).toBe(1234);

    const arrayDst: Array<number | string | boolean> = [];
    expect(getAndCopyBoxMonDataAt(storage, 0, 0, 0, arrayDst)).toBe(151);
    expect(arrayDst[0]).toBe(151);

    objectDst.value = 99;
    expect(getAndCopyBoxMonDataAt(storage, TOTAL_BOXES_COUNT, 0, 42, objectDst)).toBe(0);
    expect(objectDst.value).toBe(99);

    const dst = { species: SPECIES_NONE, nickname: '' };
    boxMonAtToMon(storage, 0, 0, dst);
    expect(dst).toMatchObject({ species: 151, nickname: 'MEW', isEgg: false });

    dst.species = 25;
    boxMonAtToMon(storage, TOTAL_BOXES_COUNT, 0, dst);
    expect(dst.species).toBe(25);
  });

  test('box name and wallpaper helpers use the exact bounds checks', () => {
    const storage = createPokemonStorage();
    expect(getBoxNamePtr(storage, 0)).toBe('BOX 1');
    expect(getBoxNamePtr(storage, TOTAL_BOXES_COUNT)).toBeNull();
    setBoxWallpaper(storage, 0, WALLPAPER_COUNT - 1);
    expect(getBoxWallpaper(storage, 0)).toBe(WALLPAPER_COUNT - 1);
    setBoxWallpaper(storage, 0, WALLPAPER_COUNT);
    expect(getBoxWallpaper(storage, 0)).toBe(WALLPAPER_COUNT - 1);
    expect(getBoxWallpaper(storage, TOTAL_BOXES_COUNT)).toBe(0);
  });

  test('SeekToNextMonInBox honors egg and backwards flags exactly', () => {
    const mons = [
      { species: SPECIES_NONE },
      { species: 1, isEgg: true },
      { species: 2, isEgg: false },
      { species: 3, isEgg: false }
    ];
    expect(seekToNextMonInBox(mons, 0, 3, 0)).toBe(2);
    expect(seekToNextMonInBox(mons, 0, 3, 1)).toBe(1);
    expect(seekToNextMonInBox(mons, 3, 3, 2)).toBe(2);
    expect(seekToNextMonInBox(mons, 2, 3, 3)).toBe(1);
    expect(seekToNextMonInBox(mons, 3, 3, 0)).toBe(-1);
  });

  test('GetCursorCoordsByPos matches every cursor area formula', () => {
    expect(getCursorCoordsByPos(CURSOR_AREA_IN_BOX, 0)).toEqual({ x: 100, y: 32 });
    expect(getCursorCoordsByPos(CURSOR_AREA_IN_BOX, 29)).toEqual({ x: 220, y: 128 });
    expect(getCursorCoordsByPos(CURSOR_AREA_IN_PARTY, 0)).toEqual({ x: 104, y: 52 });
    expect(getCursorCoordsByPos(CURSOR_AREA_IN_PARTY, PARTY_SIZE)).toEqual({ x: 152, y: 132 });
    expect(getCursorCoordsByPos(CURSOR_AREA_IN_PARTY, 3)).toEqual({ x: 152, y: 52 });
    expect(getCursorCoordsByPos(CURSOR_AREA_BOX_TITLE, 0)).toEqual({ x: 162, y: 12 });
    expect(getCursorCoordsByPos(CURSOR_AREA_BUTTONS, 1, false)).toEqual({ x: 208, y: 14 });
    expect(getCursorCoordsByPos(CURSOR_AREA_BUTTONS, 1, true)).toEqual({ x: 208, y: 8 });
    expect(getCursorCoordsByPos(CURSOR_AREA_IN_HAND, 0)).toEqual({ x: 160, y: 96 });
  });

  test('InitNewCursorPos and InitCursorMove use the C fixed-point movement setup', () => {
    const runtime = createStorageCursorRuntime({
      cursorSprite: { x: 100, y: 32, vFlip: false, oam: { priority: 1 } },
      cursorVerticalWrap: 0,
      cursorHorizontalWrap: 0
    });

    initNewCursorPos(runtime, CURSOR_AREA_IN_BOX, 7);
    expect(runtime).toMatchObject({
      newCursorArea: CURSOR_AREA_IN_BOX,
      newCursorPosition: 7,
      cursorTargetX: 124,
      cursorTargetY: 56
    });

    initCursorMove(runtime);
    expect(runtime.cursorMoveSteps).toBe(6);
    expect(runtime.cursorSpeedX).toBe(1024);
    expect(runtime.cursorSpeedY).toBe(1024);
    expect(runtime.cursorNewX).toBe(100 << 8);
    expect(runtime.cursorNewY).toBe(32 << 8);
  });

  test('InitCursorMove uses 12 steps and screen-sized wrap distances when wrapping', () => {
    const runtime = createStorageCursorRuntime({
      cursorSprite: { x: 220, y: 128, vFlip: false, oam: { priority: 1 } },
      cursorVerticalWrap: 1,
      cursorHorizontalWrap: -1
    });

    initNewCursorPos(runtime, CURSOR_AREA_IN_BOX, 0);
    initCursorMove(runtime);
    expect(runtime.cursorMoveSteps).toBe(12);
    expect(runtime.cursorSpeedX).toBe(Math.trunc(((100 - 192 - 220) << 8) / 12));
    expect(runtime.cursorSpeedY).toBe(Math.trunc(((32 + 192 - 128) << 8) / 12));
  });

  test('UpdateCursorPos advances, wraps sprite coordinates, flips vertically, and finalizes target', () => {
    const runtime = createStorageCursorRuntime({
      cursorSprite: { x: 250, y: -20, vFlip: false, oam: { priority: 1 } },
      cursorTargetX: 124,
      cursorTargetY: 56,
      cursorNewX: 250 << 8,
      cursorNewY: -20 << 8,
      cursorSpeedX: 20 << 8,
      cursorSpeedY: -4 << 8,
      cursorMoveSteps: 2,
      cursorFlipTimer: 1,
      newCursorArea: CURSOR_AREA_IN_BOX,
      newCursorPosition: 7
    });

    expect(updateCursorPos(runtime)).toBe(true);
    expect(runtime.cursorSprite.x).toBe(78);
    expect(runtime.cursorSprite.y).toBe(168);
    expect(runtime.cursorSprite.vFlip).toBe(true);

    expect(updateCursorPos(runtime)).toBe(true);
    expect(runtime.cursorSprite.x).toBe(124);
    expect(runtime.cursorSprite.y).toBe(56);
    expect(runtime.cursorArea).toBe(CURSOR_AREA_IN_BOX);
    expect(runtime.cursorPosition).toBe(7);
    expect(runtime.cursorShadowSprite.invisible).toBe(false);
    expect(runtime.movingMonPriority).toBe(2);
  });

  test('UpdateCursorPos returns item animation state only in move-items option with no motion', () => {
    const idle = createStorageCursorRuntime({ cursorMoveSteps: 0 });
    expect(updateCursorPos(idle, true)).toBe(false);

    const moveItems = createStorageCursorRuntime({ boxOption: OPTION_MOVE_ITEMS, cursorMoveSteps: 0 });
    expect(updateCursorPos(moveItems, true)).toBe(true);
    expect(updateCursorPos(moveItems, false)).toBe(false);
  });

  test('SetCursorPosition mirrors area priority and shadow side effects', () => {
    const runtime = createStorageCursorRuntime({
      cursorArea: CURSOR_AREA_IN_BOX,
      isMonBeingMoved: true,
      inBoxMovingMode: MOVE_MODE_NORMAL
    });

    setCursorPosition(runtime, CURSOR_AREA_IN_PARTY, 2);
    expect(runtime.cursorPrevPartyPos).toBe(1);
    expect(runtime.cursorShadowSprite.invisible).toBe(true);
    expect(runtime.cursorSprite.oam.priority).toBe(1);

    runtime.cursorArea = CURSOR_AREA_IN_BOX;
    setCursorPosition(runtime, CURSOR_AREA_IN_BOX, 5);
    expect(runtime.cursorSprite.oam.priority).toBe(2);
    expect(runtime.movingMonPriority).toBe(2);

    runtime.inBoxMovingMode = MOVE_MODE_MULTIPLE_SELECTING;
    setCursorPosition(runtime, CURSOR_AREA_IN_BOX, 6);
    expect(runtime.cursorSprite.oam.priority).toBe(0);
    expect(runtime.cursorShadowSprite.invisible).toBe(true);
  });

  test('SetCursorInParty clamps party count only while carrying a mon and keeps vFlip timer behavior', () => {
    const deposit = createStorageCursorRuntime({ boxOption: OPTION_DEPOSIT });
    expect(deposit.cursorArea).toBe(CURSOR_AREA_IN_PARTY);

    const runtime = createStorageCursorRuntime({ isMonBeingMoved: false });
    setCursorInParty(runtime, PARTY_SIZE);
    expect(runtime.newCursorPosition).toBe(0);

    runtime.isMonBeingMoved = true;
    runtime.cursorSprite.vFlip = true;
    setCursorInParty(runtime, PARTY_SIZE);
    expect(runtime.newCursorPosition).toBe(PARTY_SIZE - 1);
    expect(runtime.cursorFlipTimer).toBe(3);
  });

  test('saved cursor and exported cursor predicates match the static C helpers', () => {
    const runtime = createStorageCursorRuntime({ cursorArea: CURSOR_AREA_BUTTONS, cursorPosition: 1 });
    expect(isCursorOnCloseBox(runtime)).toBe(true);
    expect(isCursorOnBoxTitle(runtime)).toBe(false);
    expect(isCursorInBox(runtime)).toBe(false);
    expect(isMonBeingMoved(runtime)).toBe(false);
    expect(getBoxCursorPosition(runtime)).toBe(1);

    saveCursorPos(runtime);
    expect(getSavedCursorPos(runtime)).toBe(1);
    clearSavedCursorPos(runtime);
    expect(getSavedCursorPos(runtime)).toBe(0);

    runtime.cursorArea = CURSOR_AREA_BOX_TITLE;
    expect(isCursorOnBoxTitle(runtime)).toBe(true);
    runtime.cursorArea = CURSOR_AREA_IN_BOX;
    runtime.cursorPosition = 17;
    expect(isCursorInBox(runtime)).toBe(true);
    expect(getCursorBoxColumnAndRow(runtime)).toEqual({ column: 5, row: 2 });
    runtime.cursorArea = CURSOR_AREA_IN_PARTY;
    expect(getCursorBoxColumnAndRow(runtime)).toEqual({ column: 0, row: 0 });
  });

  test('SetCursorBoxPosition and CompactPartySlots preserve C helper behavior', () => {
    const runtime = createStorageCursorRuntime();
    setCursorBoxPosition(runtime, 12);
    expect(runtime.newCursorArea).toBe(CURSOR_AREA_IN_BOX);
    expect(runtime.newCursorPosition).toBe(12);

    const party = [
      { species: 0 },
      { species: 25, name: 'PIKA' },
      { species: 0 },
      { species: 1, name: 'BULBA' },
      { species: 4, name: 'CHAR' },
      { species: 0 }
    ];
    expect(compactPartySlots(party)).toBe(0);
    expect(party).toEqual([
      { species: 25, name: 'PIKA' },
      { species: 1, name: 'BULBA' },
      { species: 4, name: 'CHAR' },
      { species: 0 },
      { species: 0 },
      { species: 0 }
    ]);
  });
});
