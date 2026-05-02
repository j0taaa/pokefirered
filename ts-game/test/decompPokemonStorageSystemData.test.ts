import { describe, expect, test } from 'vitest';
import {
  A_BUTTON,
  B_BUTTON,
  CHANGE_GRAB,
  CHANGE_PLACE,
  CURSOR_AREA_BOX_TITLE,
  CURSOR_AREA_BUTTONS,
  CURSOR_AREA_IN_BOX,
  CURSOR_AREA_IN_PARTY,
  DPAD_DOWN,
  DPAD_RIGHT,
  INPUT_BOX_OPTIONS,
  INPUT_CLOSE_BOX,
  INPUT_HIDE_PARTY,
  INPUT_MOVE_CURSOR,
  INPUT_MULTIMOVE_CHANGE_SELECTION,
  INPUT_MULTIMOVE_GRAB_SELECTION,
  INPUT_MULTIMOVE_MOVE_MONS,
  INPUT_MULTIMOVE_PLACE_MONS,
  INPUT_MULTIMOVE_SINGLE,
  INPUT_MULTIMOVE_START,
  INPUT_PRESSED_B,
  INPUT_SCROLL_LEFT,
  INPUT_SHOW_PARTY,
  ITEM_NONE,
  MENU_B_PRESSED,
  MENU_TEXT_BAG,
  MENU_TEXT_CANCEL,
  MENU_TEXT_GIVE2,
  MENU_TEXT_INFO,
  MENU_TEXT_JUMP,
  MENU_TEXT_MARK,
  MENU_TEXT_MOVE,
  MENU_TEXT_RELEASE,
  MENU_TEXT_SUMMARY,
  MENU_TEXT_SWITCH,
  MENU_TEXT_TAKE,
  MENU_TEXT_WITHDRAW,
  MODE_PARTY,
  MOVE_DIVE,
  MOVE_MODE_MULTIPLE_SELECTING,
  MOVE_MODE_NORMAL,
  MOVE_SURF,
  OPTION_DEPOSIT,
  OPTION_MOVE_ITEMS,
  OPTION_MOVE_MONS,
  OPTION_WITHDRAW,
  PARTY_SIZE,
  RELEASE_MON_ALLOWED,
  RELEASE_MON_NOT_ALLOWED,
  RELEASE_MON_UNDETERMINED,
  SELECT_BUTTON,
  SPECIES_NONE,
  TOTAL_BOXES_COUNT,
  AddBoxMenu,
  AddMenu,
  CanMovePartyMon,
  CanShiftMon,
  CompactPartySlots,
  CreateCursorSprites,
  DoMonPlaceChange,
  DoTrySetDisplayMonData,
  GetCursorBoxColumnAndRow,
  GetCursorCoordsByPos,
  GetMovingMonOriginalBoxId,
  GetSavedCursorPos,
  HandleInput,
  HandleInput_BoxTitle,
  HandleInput_InBox_GrabbingMultiple,
  HandleInput_InBox_MovingMultiple,
  HandleInput_InBox_Normal,
  HandleInput_InParty,
  HandleInput_OnButtons,
  HandleMenuInput,
  InitCanReleaseMonVars,
  InitCursor,
  InitCursorOnReopen,
  InitMonPlaceChange,
  InitMultiMonPlaceChange,
  InitReleaseMon,
  InitSummaryScreenData,
  IsCursorInBox,
  IsCursorOnBoxTitle,
  IsCursorOnCloseBox,
  IsMenuLoading,
  IsMonBeingMoved,
  LoadSavedMovingMon,
  MonPlaceChange_MoveCursorDown,
  MonPlaceChange_MoveCursorUp,
  MoveMon,
  PlaceMon,
  ReleaseMon,
  RemoveMenu,
  ResetSelectionAfterDeposit,
  ReshowDisplayMon,
  RunCanReleaseMon,
  SaveCursorPos,
  SaveMovingMon,
  SetCursorBoxPosition,
  SetCursorInParty,
  SetCursorPosition,
  SetCursorPriorityTo1,
  SetDisplayMonData,
  SetMonMarkings,
  SetMovedMonData,
  SetPlacedMonData,
  SetSelectionMenuTexts,
  SetShiftedMonData,
  SpriteCB_CursorShadow,
  StartCursorAnim,
  TryHideItemAtCursor,
  TryHideReleaseMon,
  TrySetCursorFistAnim,
  TryShowItemAtCursor,
  TryStorePartyMonInBox,
  UpdateCursorPos,
  createEmptyBoxMon,
  createPokemonStorageDataRuntime,
  type DecompBoxPokemon
} from '../src/game/decompPokemonStorageSystemData';
import { POKEMON_STORAGE_SYSTEM_DATA_C_TRANSLATION_UNIT } from '../src/game/decompPokemonStorageSystemData';

const mon = (species: number, overrides: Partial<DecompBoxPokemon> = {}): DecompBoxPokemon => ({
  species,
  isEgg: false,
  nickname: `M${species}`,
  level: 5,
  data: {},
  ...overrides
});

describe('decompPokemonStorageSystemData', () => {
  test('module anchors the exact pokemon_storage_system_data.c translation unit', () => {
    expect(POKEMON_STORAGE_SYSTEM_DATA_C_TRANSLATION_UNIT).toBe('src/pokemon_storage_system_data.c');
  });

  test('cursor initialization, reopen, exact coordinate wrapper, saved position, and sprite shadow callbacks mirror C globals', () => {
    const runtime = createPokemonStorageDataRuntime({
      boxOption: OPTION_DEPOSIT,
      playerParty: [mon(1), ...Array.from({ length: PARTY_SIZE - 1 }, () => createEmptyBoxMon())],
      isMonBeingMoved: true,
      carriedMon: mon(99)
    });
    InitCursor(runtime);
    expect(runtime.cursorArea).toBe(CURSOR_AREA_IN_PARTY);
    expect(runtime.cursorPosition).toBe(0);
    expect(runtime.isMonBeingMoved).toBe(false);
    expect(runtime.inBoxMovingMode).toBe(MOVE_MODE_NORMAL);
    expect(runtime.cursorPrevPartyPos).toBe(1);
    expect(GetCursorCoordsByPos(CURSOR_AREA_IN_BOX, 7)).toEqual({ x: 124, y: 56 });

    runtime.isMonBeingMoved = true;
    InitCursorOnReopen(runtime);
    expect(runtime.movingMon.species).toBe(99);
    expect(runtime.operations).toContain('CreateMovingMonIcon');

    SaveCursorPos(runtime);
    expect(GetSavedCursorPos(runtime)).toBe(0);
    runtime.cursorPosition = 3;
    SaveCursorPos(runtime);
    expect(GetSavedCursorPos(runtime)).toBe(3);

    runtime.cursorSprite.x = 55;
    runtime.cursorSprite.y = 66;
    const shadow = { x: 0, y: 0, vFlip: false, oam: { priority: 1 } };
    SpriteCB_CursorShadow(runtime, shadow);
    expect(shadow).toMatchObject({ x: 55, y: 86 });
  });

  test('move/place/purge/shift helpers mutate party and box slots exactly by box id conventions', () => {
    const runtime = createPokemonStorageDataRuntime({
      cursorArea: CURSOR_AREA_IN_PARTY,
      cursorPosition: 0,
      playerParty: [mon(10), mon(20), ...Array.from({ length: PARTY_SIZE - 2 }, () => createEmptyBoxMon())]
    });
    runtime.storage.boxes[0][4] = mon(44);

    SetMovedMonData(runtime, TOTAL_BOXES_COUNT, 0);
    expect(runtime.movingMon.species).toBe(10);
    expect(runtime.playerParty[0].species).toBe(SPECIES_NONE);
    expect(GetMovingMonOriginalBoxId(runtime)).toBe(TOTAL_BOXES_COUNT);

    SetPlacedMonData(runtime, 0, 1);
    expect(runtime.storage.boxes[0][1].species).toBe(10);

    runtime.movingMon = mon(77);
    SetShiftedMonData(runtime, 0, 4);
    expect(runtime.storage.boxes[0][4].species).toBe(77);
    expect(runtime.movingMon.species).toBe(44);
    expect(runtime.displayMonSpecies).toBe(44);

    runtime.cursorArea = CURSOR_AREA_IN_BOX;
    runtime.cursorPosition = 4;
    MoveMon(runtime);
    expect(runtime.isMonBeingMoved).toBe(true);
    expect(runtime.storage.boxes[0][4].species).toBe(SPECIES_NONE);
    PlaceMon(runtime);
    expect(runtime.isMonBeingMoved).toBe(false);
    expect(runtime.storage.boxes[0][4].species).toBe(77);
  });

  test('mon place-change state machines preserve grab/place cursor y2 phases', () => {
    const runtime = createPokemonStorageDataRuntime({
      cursorArea: CURSOR_AREA_IN_PARTY,
      cursorPosition: 0,
      playerParty: [mon(12), ...Array.from({ length: PARTY_SIZE - 1 }, () => createEmptyBoxMon())]
    });
    InitMonPlaceChange(runtime, CHANGE_GRAB);
    expect(DoMonPlaceChange(runtime)).toBe(true);
    expect(runtime.operations).toContain('StartSpriteAnim:2');
    runtime.cursorSprite.y2 = 8;
    expect(DoMonPlaceChange(runtime)).toBe(true);
    expect(runtime.isMonBeingMoved).toBe(true);
    expect(runtime.movingMon.species).toBe(12);
    runtime.cursorSprite.y2 = 0;
    expect(DoMonPlaceChange(runtime)).toBe(true);
    expect(DoMonPlaceChange(runtime)).toBe(false);

    InitMonPlaceChange(runtime, CHANGE_PLACE);
    runtime.cursorSprite.y2 = 8;
    expect(DoMonPlaceChange(runtime)).toBe(true);
    expect(runtime.isMonBeingMoved).toBe(false);

    runtime.cursorSprite.y2 = 0;
    expect(MonPlaceChange_MoveCursorDown(runtime)).toBe(true);
    runtime.cursorSprite.y2 = 8;
    expect(MonPlaceChange_MoveCursorDown(runtime)).toBe(false);
    expect(MonPlaceChange_MoveCursorUp(runtime)).toBe(true);
  });

  test('deposit, release, save moving mon, summary, markings, and compact party helpers follow C side effects', () => {
    const runtime = createPokemonStorageDataRuntime({
      cursorArea: CURSOR_AREA_IN_PARTY,
      cursorPosition: 0,
      playerParty: [mon(1), mon(2), createEmptyBoxMon(), mon(3), createEmptyBoxMon(), createEmptyBoxMon()]
    });
    expect(TryStorePartyMonInBox(runtime, 0)).toBe(true);
    expect(runtime.storage.boxes[0][0].species).toBe(1);
    expect(runtime.playerParty[0].species).toBe(SPECIES_NONE);
    expect(runtime.operations).toContain('DestroyPartyMonIcon:0');

    ResetSelectionAfterDeposit(runtime);
    runtime.displayMonNickname = 'BIRD';
    InitReleaseMon(runtime);
    expect(runtime.releaseMonName).toBe('BIRD');
    expect(TryHideReleaseMon(runtime, false)).toBe(false);
    ReleaseMon(runtime);
    expect(runtime.playerParty[0].species).toBe(SPECIES_NONE);

    runtime.isMonBeingMoved = true;
    runtime.movingMon = mon(88);
    SaveMovingMon(runtime);
    runtime.movingMon = mon(99);
    LoadSavedMovingMon(runtime);
    expect(runtime.movingMon.species).toBe(88);
    InitSummaryScreenData(runtime);
    expect(runtime.summaryMonPtrKind).toBe('moving');

    SetMonMarkings(runtime, 7);
    expect((runtime.movingMon.data as Record<string, unknown>).markings).toBe(7);
    expect(CompactPartySlots(runtime)).toBe(0);
    expect(runtime.playerParty.slice(0, 2).map((p) => p.species)).toEqual([2, 3]);
  });

  test('release checks scan party first, then five boxed mons per RunCanReleaseMon call', () => {
    const runtime = createPokemonStorageDataRuntime({
      cursorArea: CURSOR_AREA_IN_PARTY,
      cursorPosition: 0,
      playerParty: [
        mon(1, { data: { moves: [MOVE_SURF] } as DecompBoxPokemon['data'] }),
        mon(2, { data: { moves: [MOVE_SURF] } as DecompBoxPokemon['data'] }),
        ...Array.from({ length: PARTY_SIZE - 2 }, () => createEmptyBoxMon())
      ]
    });
    InitCanReleaseMonVars(runtime);
    expect(runtime.releaseMonStatusResolved).toBe(false);
    expect(RunCanReleaseMon(runtime)).toBe(RELEASE_MON_UNDETERMINED);
    expect(runtime.releaseMonStatusResolved).toBe(true);
    expect(runtime.releaseMonStatus).toBe(RELEASE_MON_ALLOWED);

    const blocked = createPokemonStorageDataRuntime({
      cursorArea: CURSOR_AREA_IN_PARTY,
      cursorPosition: 0,
      playerParty: [mon(1, { data: { moves: [MOVE_DIVE] } as DecompBoxPokemon['data'] }), ...Array.from({ length: PARTY_SIZE - 1 }, () => createEmptyBoxMon())]
    });
    InitCanReleaseMonVars(blocked);
    let result = RELEASE_MON_UNDETERMINED;
    for (let i = 0; i < 90 && result === RELEASE_MON_UNDETERMINED; i++)
      result = RunCanReleaseMon(blocked);
    expect(result).toBe(RELEASE_MON_NOT_ALLOWED);
    expect(blocked.releaseMonStatus).toBe(RELEASE_MON_NOT_ALLOWED);
  });

  test('display data, selection menus, box menus, and menu input keep the decompiled item/mon branches', () => {
    const runtime = createPokemonStorageDataRuntime({
      boxOption: OPTION_MOVE_MONS,
      cursorArea: CURSOR_AREA_IN_BOX,
      cursorPosition: 0,
      itemIsMail: (id) => id === 99
    });
    runtime.storage.boxes[0][0] = mon(25, { nickname: 'PIKA', level: 18, data: { heldItem: 50, markings: 3 } as DecompBoxPokemon['data'] });
    DoTrySetDisplayMonData(runtime);
    expect(runtime.displayMonSpecies).toBe(25);
    expect(runtime.displayMonTexts[0]).toBe('PIKA ');

    expect(SetSelectionMenuTexts(runtime)).toBe(true);
    expect(runtime.menuItems.map((item) => item.textId)).toEqual([
      MENU_TEXT_MOVE,
      MENU_TEXT_SUMMARY,
      MENU_TEXT_WITHDRAW,
      MENU_TEXT_MARK,
      MENU_TEXT_RELEASE,
      MENU_TEXT_CANCEL
    ]);

    runtime.boxOption = OPTION_MOVE_ITEMS;
    runtime.displayMonItemId = ITEM_NONE;
    runtime.displayMonSpecies = 25;
    expect(SetSelectionMenuTexts(runtime)).toBe(true);
    expect(runtime.menuItems.map((item) => item.textId)).toEqual([MENU_TEXT_GIVE2, MENU_TEXT_CANCEL]);

    runtime.activeItemMoving = true;
    runtime.displayMonItemId = 50;
    expect(SetSelectionMenuTexts(runtime)).toBe(true);
    expect(runtime.menuItems.map((item) => item.textId)).toEqual([MENU_TEXT_SWITCH, MENU_TEXT_CANCEL]);

    runtime.activeItemMoving = false;
    runtime.displayMonItemId = 50;
    expect(SetSelectionMenuTexts(runtime)).toBe(true);
    expect(runtime.menuItems.map((item) => item.textId)).toEqual([MENU_TEXT_TAKE, MENU_TEXT_BAG, MENU_TEXT_INFO, MENU_TEXT_CANCEL]);

    AddBoxMenu(runtime);
    expect(runtime.menuItems[0].textId).toBe(MENU_TEXT_JUMP);
    AddMenu(runtime);
    expect(runtime.menuWindow).toMatchObject({ height: 8, tilemapTop: 7 });
    expect(IsMenuLoading()).toBe(false);
    runtime.newKeys = A_BUTTON;
    runtime.menuCursorPos = 1;
    expect(HandleMenuInput(runtime)).toBe(runtime.menuItems[1].textId);
    runtime.newKeys = B_BUTTON;
    expect(HandleMenuInput(runtime)).toBe(MENU_B_PRESSED);
  });

  test('input handlers cover box, multimove, party, title, buttons, dispatcher, and select toggle logic', () => {
    const runtime = createPokemonStorageDataRuntime({
      boxOption: OPTION_MOVE_MONS,
      cursorArea: CURSOR_AREA_IN_BOX,
      cursorPosition: 29,
      repeatKeys: DPAD_DOWN
    });
    expect(HandleInput_InBox_Normal(runtime)).toBe(INPUT_MOVE_CURSOR);
    expect(runtime.newCursorArea).toBe(CURSOR_AREA_BUTTONS);
    expect(runtime.cursorVerticalWrap).toBe(1);

    runtime.cursorArea = CURSOR_AREA_IN_BOX;
    runtime.cursorPosition = 0;
    runtime.storage.boxes[0][0] = mon(10);
    runtime.newKeys = A_BUTTON;
    runtime.repeatKeys = 0;
    runtime.inMultiMoveMode = true;
    expect(HandleInput_InBox_Normal(runtime)).toBe(INPUT_MULTIMOVE_START);
    expect(runtime.inBoxMovingMode).toBe(MOVE_MODE_MULTIPLE_SELECTING);

    runtime.heldKeys = A_BUTTON;
    runtime.repeatKeys = DPAD_RIGHT;
    expect(HandleInput_InBox_GrabbingMultiple(runtime)).toBe(INPUT_MULTIMOVE_CHANGE_SELECTION);
    runtime.heldKeys = 0;
    runtime.multiMoveOriginPosition = runtime.cursorPosition;
    expect(HandleInput_InBox_GrabbingMultiple(runtime)).toBe(INPUT_MULTIMOVE_SINGLE);
    runtime.multiMoveOriginPosition = -1;
    runtime.displayMonSpecies = 25;
    expect(HandleInput_InBox_GrabbingMultiple(runtime)).toBe(INPUT_MULTIMOVE_GRAB_SELECTION);

    runtime.repeatKeys = DPAD_RIGHT;
    runtime.multiMoveTryMoveGroup[3] = false;
    expect(HandleInput_InBox_MovingMultiple(runtime)).toBe(INPUT_SCROLL_LEFT + 1);
    runtime.multiMoveTryMoveGroup[3] = true;
    expect(HandleInput_InBox_MovingMultiple(runtime)).toBe(INPUT_MULTIMOVE_MOVE_MONS);
    runtime.repeatKeys = 0;
    runtime.newKeys = A_BUTTON;
    runtime.multiMoveCanPlaceSelection = true;
    expect(HandleInput_InBox_MovingMultiple(runtime)).toBe(INPUT_MULTIMOVE_PLACE_MONS);

    runtime.cursorArea = CURSOR_AREA_IN_PARTY;
    runtime.cursorPosition = PARTY_SIZE;
    runtime.boxOption = OPTION_DEPOSIT;
    runtime.newKeys = A_BUTTON;
    expect(HandleInput_InParty(runtime)).toBe(INPUT_CLOSE_BOX);
    runtime.boxOption = OPTION_WITHDRAW;
    runtime.newKeys = B_BUTTON;
    expect(HandleInput_InParty(runtime)).toBe(INPUT_HIDE_PARTY);

    runtime.cursorArea = CURSOR_AREA_BOX_TITLE;
    runtime.newKeys = A_BUTTON;
    runtime.repeatKeys = 0;
    expect(HandleInput_BoxTitle(runtime)).toBe(INPUT_BOX_OPTIONS);
    runtime.newKeys = B_BUTTON;
    expect(HandleInput_BoxTitle(runtime)).toBe(INPUT_PRESSED_B);

    runtime.cursorArea = CURSOR_AREA_BUTTONS;
    runtime.cursorPosition = 0;
    runtime.newKeys = A_BUTTON;
    expect(HandleInput_OnButtons(runtime)).toBe(INPUT_SHOW_PARTY);
    runtime.cursorPosition = 1;
    expect(HandleInput(runtime)).toBe(INPUT_CLOSE_BOX);

    runtime.newKeys = SELECT_BUTTON;
    runtime.cursorArea = CURSOR_AREA_IN_BOX;
    runtime.inBoxMovingMode = MOVE_MODE_NORMAL;
    expect(HandleInput(runtime)).toBe(0);
    expect(runtime.inMultiMoveMode).toBe(false);
  });

  test('small exact-name helpers expose cursor predicates, priorities, item visibility, can move/shift, and display reshow', () => {
    const runtime = createPokemonStorageDataRuntime({
      cursorArea: CURSOR_AREA_IN_BOX,
      cursorPosition: 5,
      isMonBeingMoved: true,
      movingMon: mon(42, { data: { hp: 1 } as DecompBoxPokemon['data'] }),
      carriedMon: mon(43),
      playerParty: [mon(1), ...Array.from({ length: PARTY_SIZE - 1 }, () => createEmptyBoxMon())]
    });
    expect(IsMonBeingMoved(runtime)).toBe(true);
    expect(IsCursorInBox(runtime)).toBe(true);
    expect(IsCursorOnBoxTitle(runtime)).toBe(false);
    runtime.cursorArea = CURSOR_AREA_BUTTONS;
    runtime.cursorPosition = 1;
    expect(IsCursorOnCloseBox(runtime)).toBe(true);

    SetCursorPriorityTo1(runtime);
    expect(runtime.cursorSprite.oam.priority).toBe(1);
    TryHideItemAtCursor(runtime);
    runtime.cursorArea = CURSOR_AREA_IN_BOX;
    TryShowItemAtCursor(runtime);
    expect(runtime.operations.at(-1)).toBe('TryLoadItemIconAtPos:0:1');

    StartCursorAnim(runtime, 3);
    expect(runtime.operations).toContain('StartSpriteAnim:3');
    TrySetCursorFistAnim(runtime);
    expect(runtime.operations.filter((op) => op === 'StartSpriteAnim:3').length).toBeGreaterThanOrEqual(2);

    runtime.cursorArea = CURSOR_AREA_IN_PARTY;
    runtime.cursorPosition = 0;
    runtime.isMonBeingMoved = false;
    expect(CanMovePartyMon(runtime)).toBe(true);
    runtime.isMonBeingMoved = true;
    expect(CanShiftMon(runtime)).toBe(true);

    SetDisplayMonData(runtime, mon(55, { nickname: 'ODD', level: 9 }), MODE_PARTY);
    expect(runtime.displayMonSpecies).toBe(55);
    runtime.carriedMon = mon(66);
    ReshowDisplayMon(runtime);
    expect(runtime.displayMonSpecies).toBe(66);

    CreateCursorSprites(runtime);
    SetCursorInParty(runtime);
    SetCursorBoxPosition(runtime, 7);
    SetCursorPosition(runtime, CURSOR_AREA_BOX_TITLE, 0);
    UpdateCursorPos(runtime);
    InitMultiMonPlaceChange(runtime, true);
    expect(DoMonPlaceChange(runtime)).toBe(runtime.cursorSprite.y2 !== 0);
    expect(GetCursorBoxColumnAndRow(runtime)).toEqual({ column: 0, row: 0 });
    RemoveMenu(runtime);
  });
});
