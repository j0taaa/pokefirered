import { describe, expect, test } from 'vitest';
import {
  CreatePageSwitchUISprites,
  SpriteCB_CharacterSelectCursor,
  SpriteCB_TextEntryCursor,
  UNION_ROOM_KB_PAGE_COUNT,
  UnionRoomChat_AnimateSelectorCursorReopen,
  UnionRoomChat_CreateSelectorCursorObj,
  UnionRoomChat_FreeSpriteWork,
  UnionRoomChat_MoveSelectorCursorObj,
  UnionRoomChat_SetSelectorCursorClosedImage,
  UnionRoomChat_SpawnTextEntryPointerSprites,
  UnionRoomChat_ToggleSelectorCursorObjVisibility,
  UnionRoomChat_TryAllocSpriteWork,
  UnionRoomChat_UpdateObjPalCycle,
  UpdateVisibleUnionRoomChatIcon,
  createPageSwitchUISprites,
  createUnionRoomChatObjectsRuntime,
  spriteCBCharacterSelectCursor,
  spriteCBTextEntryCursor,
  unionRoomChatAnimateSelectorCursorReopen,
  unionRoomChatCreateSelectorCursorObj,
  unionRoomChatFreeSpriteWork,
  unionRoomChatMoveSelectorCursorObj,
  unionRoomChatSetSelectorCursorClosedImage,
  unionRoomChatSpawnTextEntryPointerSprites,
  unionRoomChatToggleSelectorCursorObjVisibility,
  unionRoomChatTryAllocSpriteWork,
  unionRoomChatUpdateObjPalCycle,
  updateVisibleUnionRoomChatIcon
} from '../src/game/decompUnionRoomChatObjects';

describe('decomp union_room_chat_objects', () => {
  test('alloc work loads all sheets and palette, and allocation failure returns FALSE', () => {
    const runtime = createUnionRoomChatObjectsRuntime();
    expect(unionRoomChatTryAllocSpriteWork(runtime)).toBe(true);
    expect(runtime.loadedSheets.map((sheet) => sheet.tag)).toEqual([0, 1, 2, 3, 4]);
    expect(runtime.loadedSheets.map((sheet) => sheet.size)).toEqual([4096, 64, 64, 128, 1024]);
    expect(runtime.paletteLoaded).toBe(true);
    expect(runtime.work).not.toBeNull();

    unionRoomChatFreeSpriteWork(runtime);
    expect(runtime.work).toBeNull();

    const failRuntime = createUnionRoomChatObjectsRuntime();
    failRuntime.allocationFails = true;
    expect(unionRoomChatTryAllocSpriteWork(failRuntime)).toBe(false);
    expect(failRuntime.work).toBeNull();
  });

  test('selector cursor visibility, movement, close image, and reopen animation match page branches', () => {
    const runtime = createUnionRoomChatObjectsRuntime();
    unionRoomChatTryAllocSpriteWork(runtime);
    unionRoomChatCreateSelectorCursorObj(runtime);
    const sprite = runtime.work?.selectorCursorSprite;
    expect(sprite).toMatchObject({ x: 10, y: 24, subpriority: 0 });

    unionRoomChatToggleSelectorCursorObjVisibility(runtime, true);
    expect(sprite?.invisible).toBe(true);

    runtime.currentKeyboardPage = 1;
    runtime.cursorCol = 3;
    runtime.cursorRow = 2;
    unionRoomChatMoveSelectorCursorObj(runtime);
    expect(sprite).toMatchObject({ anim: 0, x: 34, y: 48 });

    unionRoomChatSetSelectorCursorClosedImage(runtime);
    expect(sprite?.anim).toBe(1);
    expect(runtime.work?.cursorBlinkTimer).toBe(0);
    expect(unionRoomChatAnimateSelectorCursorReopen(runtime)).toBe(true);
    expect(unionRoomChatAnimateSelectorCursorReopen(runtime)).toBe(true);
    expect(unionRoomChatAnimateSelectorCursorReopen(runtime)).toBe(true);
    expect(unionRoomChatAnimateSelectorCursorReopen(runtime)).toBe(false);
    expect(sprite?.anim).toBe(0);

    runtime.currentKeyboardPage = UNION_ROOM_KB_PAGE_COUNT;
    runtime.cursorRow = 4;
    unionRoomChatMoveSelectorCursorObj(runtime);
    expect(sprite).toMatchObject({ anim: 2, x: 24, y: 72 });
    unionRoomChatSetSelectorCursorClosedImage(runtime);
    expect(sprite?.anim).toBe(3);
  });

  test('palette cycle loads two colors from arg-derived source offset', () => {
    const runtime = createUnionRoomChatObjectsRuntime();
    unionRoomChatUpdateObjPalCycle(runtime, 5);
    expect(runtime.paletteLoads).toEqual([{ index: 1, sourceOffset: 11, size: 2 }]);
  });

  test('text-entry and character-select cursor callbacks mirror the C timers', () => {
    const runtime = createUnionRoomChatObjectsRuntime();
    unionRoomChatTryAllocSpriteWork(runtime);
    unionRoomChatSpawnTextEntryPointerSprites(runtime);
    const textSprite = runtime.work?.textEntryCursorSprite;
    const charSprite = runtime.work?.characterSelectCursorSprite;
    if (textSprite === undefined || textSprite === null || charSprite === undefined || charSprite === null) {
      throw new Error('sprites missing');
    }

    runtime.messageEntryCursorPosition = 3;
    spriteCBTextEntryCursor(runtime, textSprite);
    expect(textSprite).toMatchObject({ invisible: false, x: 100 });
    runtime.messageEntryCursorPosition = 15;
    spriteCBTextEntryCursor(runtime, textSprite);
    expect(textSprite.invisible).toBe(true);

    for (let i = 0; i < 5; i += 1) {
      spriteCBCharacterSelectCursor(charSprite);
    }
    expect(charSprite.data[0]).toBe(0);
    expect(charSprite.x2).toBe(1);
    for (let i = 0; i < 20; i += 1) {
      spriteCBCharacterSelectCursor(charSprite);
    }
    expect(charSprite.x2).toBe(0);
  });

  test('page switch UI sprites and visible icon updates follow register/toggle branches', () => {
    const runtime = createUnionRoomChatObjectsRuntime();
    unionRoomChatTryAllocSpriteWork(runtime);
    createPageSwitchUISprites(runtime);
    const icon = runtime.work?.chatIconsSprite;
    expect(runtime.work?.rButtonSprite).toMatchObject({ template: 'RButton', x: 8, y: 152, subpriority: 3 });
    expect(icon).toMatchObject({ template: 'UnionRoomChatIcons', x: 32, y: 152, invisible: true });

    runtime.currentKeyboardPage = UNION_ROOM_KB_PAGE_COUNT;
    runtime.messageEntryBufferLength = 2;
    updateVisibleUnionRoomChatIcon(runtime);
    expect(icon).toMatchObject({ invisible: false, anim: 3 });
    runtime.messageEntryBufferLength = 0;
    updateVisibleUnionRoomChatIcon(runtime);
    expect(icon?.invisible).toBe(true);

    runtime.currentKeyboardPage = 0;
    runtime.caseToggleIconAnim = 1;
    updateVisibleUnionRoomChatIcon(runtime);
    expect(icon).toMatchObject({ invisible: false, anim: 1 });
    runtime.caseToggleIconAnim = 3;
    updateVisibleUnionRoomChatIcon(runtime);
    expect(icon?.invisible).toBe(true);
  });

  test('exact C-name union room chat object exports preserve allocation, cursor, callback, and icon logic', () => {
    const runtime = createUnionRoomChatObjectsRuntime();
    expect(UnionRoomChat_TryAllocSpriteWork(runtime)).toBe(true);
    expect(runtime.loadedSheets.map((sheet) => sheet.tag)).toEqual([0, 1, 2, 3, 4]);

    UnionRoomChat_CreateSelectorCursorObj(runtime);
    const selector = runtime.work?.selectorCursorSprite;
    expect(selector).toMatchObject({ x: 10, y: 24, subpriority: 0 });

    UnionRoomChat_ToggleSelectorCursorObjVisibility(runtime, true);
    expect(selector?.invisible).toBe(true);
    runtime.currentKeyboardPage = 1;
    runtime.cursorCol = 2;
    runtime.cursorRow = 3;
    UnionRoomChat_MoveSelectorCursorObj(runtime);
    expect(selector).toMatchObject({ anim: 0, x: 26, y: 60 });

    UnionRoomChat_SetSelectorCursorClosedImage(runtime);
    expect(selector?.anim).toBe(1);
    expect(UnionRoomChat_AnimateSelectorCursorReopen(runtime)).toBe(true);
    expect(UnionRoomChat_AnimateSelectorCursorReopen(runtime)).toBe(true);
    expect(UnionRoomChat_AnimateSelectorCursorReopen(runtime)).toBe(true);
    expect(UnionRoomChat_AnimateSelectorCursorReopen(runtime)).toBe(false);
    expect(selector?.anim).toBe(0);

    UnionRoomChat_UpdateObjPalCycle(runtime, 4);
    expect(runtime.paletteLoads.at(-1)).toEqual({ index: 1, sourceOffset: 9, size: 2 });

    UnionRoomChat_SpawnTextEntryPointerSprites(runtime);
    const textSprite = runtime.work!.textEntryCursorSprite!;
    const charSprite = runtime.work!.characterSelectCursorSprite!;
    runtime.messageEntryCursorPosition = 4;
    SpriteCB_TextEntryCursor(runtime, textSprite);
    expect(textSprite).toMatchObject({ invisible: false, x: 108 });
    for (let i = 0; i < 5; i += 1) {
      SpriteCB_CharacterSelectCursor(charSprite);
    }
    expect(charSprite.x2).toBe(1);

    CreatePageSwitchUISprites(runtime);
    const icon = runtime.work!.chatIconsSprite!;
    runtime.currentKeyboardPage = UNION_ROOM_KB_PAGE_COUNT;
    runtime.messageEntryBufferLength = 1;
    UpdateVisibleUnionRoomChatIcon(runtime);
    expect(icon).toMatchObject({ invisible: false, anim: 3 });

    UnionRoomChat_FreeSpriteWork(runtime);
    expect(runtime.work).toBeNull();
  });
});
