import { describe, expect, test } from 'vitest';
import {
  CURSOR_ANIM_BOUNCE,
  CURSOR_AREA_BOX_TITLE,
  CURSOR_AREA_IN_BOX,
  CURSOR_AREA_IN_HAND,
  CURSOR_AREA_IN_PARTY,
  ITEM_ANIM_APPEAR,
  ITEM_ANIM_PICK_UP,
  ITEM_ANIM_PUT_AWAY,
  ITEM_CB_WAIT_ANIM,
  ITEM_NONE,
  MAX_ITEM_ICONS,
  MULTIMOVE_CHANGE_SELECTION,
  MULTIMOVE_GRAB_SELECTION,
  MULTIMOVE_PLACE_MONS,
  OPTION_MOVE_ITEMS,
  CreateItemIconSprites,
  GetItemIconIdxByPosition,
  GetMovingItem,
  InitItemIconInCursor,
  InitItemInfoWindow,
  IsActiveItemMoving,
  IsItemIconAnimActive,
  Item_FromMonToMoving,
  Item_GiveMovingToMon,
  Item_SwitchMonsWithMoving,
  MoveHeldItemWithPartyMenu,
  MoveItemFromCursorToBag,
  MultiMove_CanPlaceSelection,
  MultiMove_Free,
  MultiMove_GetMonsFromSelection,
  MultiMove_GetOriginPosition,
  MultiMove_Init,
  MultiMove_RunFunction,
  MultiMove_SetFunction,
  MultiMove_TryMoveGroup,
  PrintItemDescription,
  SetItemIconActive,
  SetItemIconCallback,
  SetItemIconPosition,
  SpriteCB_ItemIcon_HideParty,
  SpriteCB_ItemIcon_SwapToHand,
  SpriteCB_ItemIcon_SwapToMon,
  SpriteCB_ItemIcon_ToHand,
  SpriteCB_ItemIcon_ToMon,
  SpriteCB_ItemIcon_WaitAnim,
  TryHideItemIconAtPos,
  TryLoadItemIconAtPos,
  UnkUtil_CpuAdd,
  UnkUtil_DmaAdd,
  UnkUtil_Init,
  UnkUtil_Run,
  UpdateItemInfoWindowSlideIn,
  UpdateItemInfoWindowSlideOut,
  callItemIconCallback,
  createBoxPokemon,
  createPokemonStorageMiscRuntime,
  type UnkUtil
} from '../src/game/decompPokemonStorageSystemMisc';

describe('decomp pokemon_storage_system_misc', () => {
  test('multi-move init/start/change/grab/place preserves state and box mutations', () => {
    const runtime = createPokemonStorageMiscRuntime();
    runtime.boxes[0][7] = createBoxPokemon({ species: 25, personality: 123, heldItem: 10 });
    runtime.boxes[0][8] = createBoxPokemon({ species: 26, personality: 456, heldItem: 11 });
    runtime.cursorColumn = 1;
    runtime.cursorRow = 1;
    expect(MultiMove_Init(runtime)).toBe(true);

    MultiMove_SetFunction(runtime, MULTIMOVE_CHANGE_SELECTION);
    const mm = runtime.sMultiMove!;
    mm.fromColumn = 1;
    mm.fromRow = 1;
    mm.toColumn = 1;
    mm.toRow = 1;
    runtime.cursorColumn = 2;
    runtime.cursorRow = 1;
    expect(MultiMove_RunFunction(runtime)).toBe(true);
    expect(mm.state).toBe(1);
    expect(mm.toColumn).toBe(2);
    expect(runtime.operations.some((op) => op.includes('species26'))).toBe(true);
    expect(MultiMove_RunFunction(runtime)).toBe(false);

    MultiMove_SetFunction(runtime, MULTIMOVE_GRAB_SELECTION);
    expect(MultiMove_RunFunction(runtime)).toBe(true);
    expect(mm.minColumn).toBe(1);
    expect(mm.columnsTotal).toBe(2);
    expect(runtime.boxes[0][7].species).toBe(0);
    expect(runtime.operations).toContain('DestroyBoxMonIconAtPosition:7');
    runtime.monPlaceMovingResults = [false, false];
    expect(MultiMove_RunFunction(runtime)).toBe(true);
    expect(mm.bgMoveSteps).toBe(8);
    for (let i = 0; i < 7; i++) expect(MultiMove_RunFunction(runtime)).toBe(true);
    expect(MultiMove_RunFunction(runtime)).toBe(false);

    expect(MultiMove_TryMoveGroup(runtime, 3)).toBe(true);
    expect(mm.minColumn).toBe(2);
    expect(mm.bgX).toBe(-1024);
    expect(MultiMove_CanPlaceSelection(runtime)).toBe(true);
    runtime.boxes[0][8] = createBoxPokemon({ species: 99 });
    expect(MultiMove_CanPlaceSelection(runtime)).toBe(false);
    runtime.boxes[0][8] = createBoxPokemon();

    MultiMove_SetFunction(runtime, MULTIMOVE_PLACE_MONS);
    expect(MultiMove_RunFunction(runtime)).toBe(true);
    expect(runtime.boxes[0][8].species).toBe(25);
    expect(runtime.boxes[0][9].species).toBe(26);
    mm.bgMoveSteps = 0;
    runtime.monPlaceMovingResults = [false, false, false];
    expect(MultiMove_RunFunction(runtime)).toBe(true);
    expect(runtime.operations).toContain('CreateBoxMonIconAtPos:8');
    expect(MultiMove_RunFunction(runtime)).toBe(true);
    expect(runtime.operations).toContain(`StartCursorAnim:${CURSOR_ANIM_BOUNCE}`);
    expect(MultiMove_RunFunction(runtime)).toBe(false);

    mm.fromColumn = 3;
    mm.fromRow = 4;
    expect(MultiMove_GetOriginPosition(runtime)).toBe(27);
    MultiMove_GetMonsFromSelection(runtime);
    MultiMove_Free(runtime);
    expect(runtime.sMultiMove).toBeNull();
  });

  test('item icon loading and item transfer functions match positions, callbacks, and held item writes', () => {
    const runtime = createPokemonStorageMiscRuntime({ boxOption: OPTION_MOVE_ITEMS });
    runtime.boxes[0][0] = createBoxPokemon({ species: 1, heldItem: 50 });
    runtime.boxes[0][1] = createBoxPokemon({ species: 2, heldItem: 60 });
    runtime.party[0] = createBoxPokemon({ species: 3, heldItem: 70 });
    runtime.displayMonItemId = 50;

    CreateItemIconSprites(runtime);
    expect(runtime.movingItemId).toBe(ITEM_NONE);
    TryLoadItemIconAtPos(runtime, CURSOR_AREA_IN_BOX, 0);
    const id = GetItemIconIdxByPosition(runtime, CURSOR_AREA_IN_BOX, 0);
    expect(id).toBe(0);
    expect(runtime.itemIcons[id].sprite).toMatchObject({ x: 112, y: 56, invisible: false });
    expect(runtime.operations).toContain(`StartSpriteAffineAnim:${id}:${ITEM_ANIM_APPEAR}`);
    TryLoadItemIconAtPos(runtime, CURSOR_AREA_IN_BOX, 0);
    expect(runtime.itemIcons.filter((icon) => icon.active)).toHaveLength(1);

    Item_FromMonToMoving(runtime, CURSOR_AREA_IN_BOX, 0);
    expect(runtime.boxes[0][0].heldItem).toBe(ITEM_NONE);
    expect(runtime.movingItemId).toBe(50);
    expect(runtime.itemIcons[id].cursorArea).toBe(CURSOR_AREA_IN_HAND);
    expect(runtime.itemIcons[id].sprite.callback).toBe('SpriteCB_ItemIcon_ToHand');
    expect(runtime.operations).toContain(`StartSpriteAffineAnim:${id}:${ITEM_ANIM_PICK_UP}`);

    TryLoadItemIconAtPos(runtime, CURSOR_AREA_IN_BOX, 1);
    const otherId = GetItemIconIdxByPosition(runtime, CURSOR_AREA_IN_BOX, 1);
    Item_SwitchMonsWithMoving(runtime, CURSOR_AREA_IN_BOX, 1);
    expect(runtime.boxes[0][1].heldItem).toBe(50);
    expect(runtime.movingItemId).toBe(60);
    expect(runtime.itemIcons[otherId].sprite.callback).toBe('SpriteCB_ItemIcon_SwapToHand');
    expect(runtime.itemIcons[id].sprite.callback).toBe('SpriteCB_ItemIcon_SwapToMon');

    Item_GiveMovingToMon(runtime, CURSOR_AREA_IN_PARTY, 0);
    expect(runtime.party[0].heldItem).toBe(60);
    expect(runtime.itemIcons[id].sprite.callback).toBe('SpriteCB_ItemIcon_ToMon');
    TryHideItemIconAtPos(runtime, CURSOR_AREA_IN_BOX, 1);
    expect(runtime.itemIcons[otherId].sprite.callback).toBe('SpriteCB_ItemIcon_WaitAnim');
    runtime.itemIcons[otherId].sprite.affineAnimEnded = true;
    SpriteCB_ItemIcon_WaitAnim(runtime, runtime.itemIcons[otherId].sprite);
    expect(runtime.itemIcons[otherId].active).toBe(false);

    InitItemIconInCursor(runtime, 99);
    expect(GetMovingItem(runtime)).toBe(99);
    MoveItemFromCursorToBag(runtime);
    expect(runtime.operations).toContain(`StartSpriteAffineAnim:${id}:${ITEM_ANIM_PUT_AWAY}`);
    SetItemIconPosition(runtime, id, CURSOR_AREA_IN_PARTY, 0);
    SetItemIconActive(runtime, id, true);
    MoveHeldItemWithPartyMenu(runtime);
    expect(runtime.itemIcons[id].sprite.callback).toBe('SpriteCB_ItemIcon_HideParty');
    SetItemIconCallback(runtime, id, ITEM_CB_WAIT_ANIM, CURSOR_AREA_IN_HAND, 0);
    expect(runtime.itemIcons[id].sprite.callback).toBe('SpriteCB_ItemIcon_WaitAnim');
  });

  test('item icon callbacks keep C fall-through motion and active checks', () => {
    const runtime = createPokemonStorageMiscRuntime();
    const icon = runtime.itemIcons[0];
    icon.active = true;
    icon.sprite.invisible = false;
    icon.sprite.x = 112;
    icon.sprite.y = 56;

    SpriteCB_ItemIcon_ToHand(runtime, icon.sprite);
    expect(icon.sprite.data[0]).toBe(1);
    expect(icon.sprite.x).toBeLessThan(112);
    for (let i = 0; i < 11; i++) SpriteCB_ItemIcon_ToHand(runtime, icon.sprite);
    expect(icon.sprite.callback).toBe('SpriteCB_ItemIcon_SetPosToCursor');
    callItemIconCallback(runtime, icon.sprite);
    expect(icon.sprite).toMatchObject({ x: 124, y: 88 });

    icon.sprite.callback = 'SpriteCB_ItemIcon_ToMon';
    icon.sprite.data[0] = 0;
    icon.sprite.data[6] = CURSOR_AREA_IN_BOX;
    icon.sprite.data[7] = 5;
    for (let i = 0; i < 12; i++) SpriteCB_ItemIcon_ToMon(runtime, icon.sprite);
    expect(icon.sprite.callback).toBe('SpriteCallbackDummy');
    expect(icon.cursorPos).toBe(5);

    icon.sprite.callback = 'SpriteCB_ItemIcon_SwapToHand';
    icon.sprite.data[0] = 0;
    icon.sprite.data[6] = CURSOR_AREA_IN_HAND;
    icon.sprite.data[7] = 0;
    SpriteCB_ItemIcon_SwapToHand(runtime, icon.sprite);
    SpriteCB_ItemIcon_SwapToHand(runtime, icon.sprite);
    expect(icon.sprite.x2).not.toBe(0);
    for (let i = 0; i < 10; i++) SpriteCB_ItemIcon_SwapToHand(runtime, icon.sprite);
    expect(icon.sprite.callback).toBe('SpriteCB_ItemIcon_SetPosToCursor');

    icon.sprite.callback = 'SpriteCB_ItemIcon_SwapToMon';
    icon.sprite.data[0] = 0;
    icon.sprite.data[6] = CURSOR_AREA_IN_PARTY;
    icon.sprite.data[7] = 1;
    for (let i = 0; i < 12; i++) SpriteCB_ItemIcon_SwapToMon(runtime, icon.sprite);
    expect(icon.sprite.callback).toBe('SpriteCallbackDummy');

    icon.sprite.y = -8;
    icon.sprite.y2 = 0;
    icon.sprite.callback = 'SpriteCB_ItemIcon_HideParty';
    SpriteCB_ItemIcon_HideParty(runtime, icon.sprite);
    SpriteCB_ItemIcon_HideParty(runtime, icon.sprite);
    expect(icon.active).toBe(false);

    icon.active = true;
    icon.cursorArea = CURSOR_AREA_BOX_TITLE;
    expect(IsActiveItemMoving(runtime)).toBe(true);
    icon.sprite.affineAnimEnded = false;
    icon.sprite.affineAnimBeginning = true;
    expect(IsItemIconAnimActive(runtime)).toBe(true);
    PrintItemDescription(runtime);
    expect(runtime.operations.at(-1)).toBe('AddTextPrinterParameterized5:2:Item0Description');
  });

  test('item info window slide and unused copy utility follow frame/count math', () => {
    const runtime = createPokemonStorageMiscRuntime();
    InitItemInfoWindow(runtime);
    expect(runtime.itemInfoWindowOffset).toBe(25);
    expect(UpdateItemInfoWindowSlideIn(runtime)).toBe(true);
    expect(runtime.itemInfoWindowOffset).toBe(24);
    for (let i = 0; i < 24; i++) UpdateItemInfoWindowSlideIn(runtime);
    expect(UpdateItemInfoWindowSlideIn(runtime)).toBe(false);
    expect(UpdateItemInfoWindowSlideOut(runtime)).toBe(true);
    for (let i = 0; i < 24; i++) UpdateItemInfoWindowSlideOut(runtime);
    expect(UpdateItemInfoWindowSlideOut(runtime)).toBe(false);

    const util: UnkUtil = { data: [], max: 0, numActive: 0 };
    UnkUtil_Init(runtime, util, [], 2);
    expect(UnkUtil_CpuAdd(runtime, 1000, 1, 2, 2000, 3, 4, 5, 2, 6)).toBe(true);
    expect(UnkUtil_DmaAdd(runtime, 3000, 2, 3, 4, 2)).toBe(true);
    expect(UnkUtil_DmaAdd(runtime, 0, 0, 0, 1, 1)).toBe(false);
    UnkUtil_Run(runtime);
    expect(util.numActive).toBe(0);
    expect(runtime.operations).toContain('CpuCopy16:2054:1130:10');
    expect(runtime.operations).toContain('Dma3FillLarge_:0:3196:8:16');

    expect(GetItemIconIdxByPosition(runtime, 99, 99)).toBe(MAX_ITEM_ICONS);
  });
});
