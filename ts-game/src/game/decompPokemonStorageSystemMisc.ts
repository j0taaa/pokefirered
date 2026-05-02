export const IN_BOX_COLUMNS = 6;
export const IN_BOX_ROWS = 5;
export const IN_BOX_COUNT = IN_BOX_COLUMNS * IN_BOX_ROWS;
export const MAX_ITEM_ICONS = 3;
export const WINDOW_NONE = 0xff;
export const ITEM_NONE = 0;
export const SPECIES_NONE = 0;
export const OPTION_MOVE_ITEMS = 1;

export const MON_DATA_SPECIES_OR_EGG = 1;
export const MON_DATA_PERSONALITY = 2;
export const MON_DATA_SANITY_HAS_SPECIES = 3;
export const MON_DATA_HELD_ITEM = 4;

export const MULTIMOVE_START = 0;
export const MULTIMOVE_SINGLE = 1;
export const MULTIMOVE_CHANGE_SELECTION = 2;
export const MULTIMOVE_GRAB_SELECTION = 3;
export const MULTIMOVE_MOVE_MONS = 4;
export const MULTIMOVE_PLACE_MONS = 5;

export const CURSOR_AREA_IN_BOX = 0;
export const CURSOR_AREA_IN_PARTY = 1;
export const CURSOR_AREA_IN_HAND = 2;
export const CURSOR_AREA_BOX_TITLE = 3;

export const CURSOR_ANIM_OPEN = 0;
export const CURSOR_ANIM_BOUNCE = 1;
export const CURSOR_ANIM_FIST = 2;

export const ITEM_ANIM_NONE = 0;
export const ITEM_ANIM_APPEAR = 1;
export const ITEM_ANIM_DISAPPEAR = 2;
export const ITEM_ANIM_PICK_UP = 3;
export const ITEM_ANIM_PUT_DOWN = 4;
export const ITEM_ANIM_PUT_AWAY = 5;
export const ITEM_ANIM_LARGE = 6;

export const ITEM_CB_WAIT_ANIM = 0;
export const ITEM_CB_TO_HAND = 1;
export const ITEM_CB_TO_MON = 2;
export const ITEM_CB_SWAP_TO_HAND = 3;
export const ITEM_CB_SWAP_TO_MON = 4;
export const ITEM_CB_HIDE_PARTY = 7;

export type StorageSpriteCallback =
  | 'SpriteCallbackDummy'
  | 'SpriteCB_ItemIcon_WaitAnim'
  | 'SpriteCB_ItemIcon_ToHand'
  | 'SpriteCB_ItemIcon_SetPosToCursor'
  | 'SpriteCB_ItemIcon_ToMon'
  | 'SpriteCB_ItemIcon_SwapToHand'
  | 'SpriteCB_ItemIcon_SwapToMon'
  | 'SpriteCB_ItemIcon_HideParty';

export interface StorageSprite {
  id: number;
  x: number;
  y: number;
  x2: number;
  y2: number;
  data: number[];
  oam: { priority: number };
  invisible: boolean;
  affineAnimEnded: boolean;
  affineAnimBeginning: boolean;
  callback: StorageSpriteCallback;
}

export interface BoxPokemon {
  species: number;
  personality: number;
  heldItem: number;
}

export interface ItemIcon {
  active: boolean;
  cursorArea: number;
  cursorPos: number;
  sprite: StorageSprite;
  tiles: string;
  palIndex: number;
}

export interface MultiMoveState {
  funcId: number;
  state: number;
  fromColumn: number;
  fromRow: number;
  toColumn: number;
  toRow: number;
  cursorColumn: number;
  cursorRow: number;
  minColumn: number;
  minRow: number;
  columnsTotal: number;
  rowsTotal: number;
  bgX: number;
  bgY: number;
  bgMoveSteps: number;
  boxMons: BoxPokemon[];
}

export interface UnkUtilData {
  size: number;
  dest: number;
  src: number;
  height: number;
  unk: number;
  func: 'UnkUtil_CpuRun' | 'UnkUtil_DmaRun';
}

export interface UnkUtil {
  data: UnkUtilData[];
  max: number;
  numActive: number;
}

export interface PokemonStorageMiscRuntime {
  sMultiMove: MultiMoveState | null;
  multiMoveWindowId: number;
  boxOption: number;
  movingItemId: number;
  displayMonItemId: number;
  itemInfoWindowOffset: number;
  itemIcons: ItemIcon[];
  sprites: StorageSprite[];
  cursorSprite: StorageSprite;
  currentBox: number;
  boxes: BoxPokemon[][];
  party: BoxPokemon[];
  cursorColumn: number;
  cursorRow: number;
  dmaBusyResults: boolean[];
  cursorMovingResults: boolean[];
  monPlaceMovingResults: boolean[];
  operations: string[];
  sUnkUtil: UnkUtil | null;
}

export const createPokemonStorageMiscRuntime = (overrides: Partial<PokemonStorageMiscRuntime> = {}): PokemonStorageMiscRuntime => {
  const sprites = Array.from({ length: MAX_ITEM_ICONS }, (_, id) => createSprite(id));
  const runtime: PokemonStorageMiscRuntime = {
    sMultiMove: null,
    multiMoveWindowId: WINDOW_NONE,
    boxOption: OPTION_MOVE_ITEMS,
    movingItemId: ITEM_NONE,
    displayMonItemId: ITEM_NONE,
    itemInfoWindowOffset: 0,
    itemIcons: sprites.map((sprite, i) => ({ active: false, cursorArea: 0, cursorPos: 0, sprite, tiles: `tiles${i}`, palIndex: i })),
    sprites,
    cursorSprite: { ...createSprite(99), x: 120, y: 80, y2: 0, oam: { priority: 1 } },
    currentBox: 0,
    boxes: [Array.from({ length: IN_BOX_COUNT }, () => createBoxPokemon())],
    party: Array.from({ length: 6 }, () => createBoxPokemon()),
    cursorColumn: 0,
    cursorRow: 0,
    dmaBusyResults: [],
    cursorMovingResults: [],
    monPlaceMovingResults: [],
    operations: [],
    sUnkUtil: null
  };
  return Object.assign(runtime, overrides);
};

export const createBoxPokemon = (overrides: Partial<BoxPokemon> = {}): BoxPokemon => ({ species: SPECIES_NONE, personality: 0, heldItem: ITEM_NONE, ...overrides });
export const createSprite = (id: number): StorageSprite => ({
  id,
  x: 0,
  y: 0,
  x2: 0,
  y2: 0,
  data: Array.from({ length: 8 }, () => 0),
  oam: { priority: 0 },
  invisible: true,
  affineAnimEnded: true,
  affineAnimBeginning: false,
  callback: 'SpriteCallbackDummy'
});

export const MultiMove_Init = (runtime: PokemonStorageMiscRuntime): boolean => {
  runtime.sMultiMove = {
    funcId: 0,
    state: 0,
    fromColumn: 0,
    fromRow: 0,
    toColumn: 0,
    toRow: 0,
    cursorColumn: 0,
    cursorRow: 0,
    minColumn: 0,
    minRow: 0,
    columnsTotal: 0,
    rowsTotal: 0,
    bgX: 0,
    bgY: 0,
    bgMoveSteps: 0,
    boxMons: Array.from({ length: IN_BOX_COUNT }, () => createBoxPokemon())
  };
  runtime.multiMoveWindowId = AddWindow8Bit(runtime);
  if (runtime.multiMoveWindowId !== WINDOW_NONE) {
    op(runtime, `FillWindowPixelBuffer:${runtime.multiMoveWindowId}:0`);
    return true;
  }
  return false;
};

export const MultiMove_Free = (runtime: PokemonStorageMiscRuntime): void => {
  runtime.sMultiMove = null;
};

export const MultiMove_SetFunction = (runtime: PokemonStorageMiscRuntime, funcId: number): void => {
  const mm = mustMultiMove(runtime);
  mm.funcId = funcId;
  mm.state = 0;
};

export const MultiMove_RunFunction = (runtime: PokemonStorageMiscRuntime): boolean => {
  switch (mustMultiMove(runtime).funcId) {
    case MULTIMOVE_START: return MultiMove_Function_Start(runtime);
    case MULTIMOVE_SINGLE: return MultiMove_Function_Single(runtime);
    case MULTIMOVE_CHANGE_SELECTION: return MultiMove_Function_ChangeSelection(runtime);
    case MULTIMOVE_GRAB_SELECTION: return MultiMove_Function_GrabSelection(runtime);
    case MULTIMOVE_MOVE_MONS: return MultiMove_Function_MoveMons(runtime);
    case MULTIMOVE_PLACE_MONS: return MultiMove_Function_PlaceMons(runtime);
  }
  return false;
};

export const MultiMove_Function_Start = (runtime: PokemonStorageMiscRuntime): boolean => {
  const mm = mustMultiMove(runtime);
  switch (mm.state) {
    case 0:
      op(runtime, 'HideBg:0');
      op(runtime, 'LoadMonIconPalettesAt:8');
      mm.state++;
      break;
    case 1:
      [mm.fromColumn, mm.fromRow] = GetCursorBoxColumnAndRow(runtime);
      mm.toColumn = mm.fromColumn;
      mm.toRow = mm.fromRow;
      op(runtime, 'ChangeBgX:0:-1024:set');
      op(runtime, 'ChangeBgY:0:-1024:set');
      op(runtime, 'FillBgTilemapBufferRect_Palette0:0:0:0:0:32:32');
      op(runtime, `FillWindowPixelBuffer8Bit:${runtime.multiMoveWindowId}:0`);
      MultiMove_SetIconToBg(runtime, mm.fromColumn, mm.fromRow);
      op(runtime, 'SetBgAttribute:0:palettemode:1');
      op(runtime, `PutWindowTilemap:${runtime.multiMoveWindowId}`);
      op(runtime, `CopyWindowToVram8Bit:${runtime.multiMoveWindowId}:full`);
      op(runtime, 'BlendPalettes:0x3f00:8:white');
      StartCursorAnim(runtime, CURSOR_ANIM_OPEN);
      op(runtime, 'SetGpuRegBits:BG0CNT:256COLOR');
      mm.state++;
      break;
    case 2:
      if (!IsDma3ManagerBusyWithBgCopy(runtime)) {
        op(runtime, 'ShowBg:0');
        return false;
      }
      break;
  }
  return true;
};

export const MultiMove_Function_Single = (runtime: PokemonStorageMiscRuntime): boolean => {
  const mm = mustMultiMove(runtime);
  switch (mm.state) {
    case 0:
      op(runtime, 'HideBg:0');
      mm.state++;
      break;
    case 1:
      MultiMove_ResetBg(runtime);
      StartCursorAnim(runtime, CURSOR_ANIM_BOUNCE);
      mm.state++;
      break;
    case 2:
      if (!IsDma3ManagerBusyWithBgCopy(runtime)) {
        op(runtime, 'SetCursorPriorityTo1');
        op(runtime, 'LoadPalette:GetTextWindowPalette3:13:4bpp');
        op(runtime, 'ShowBg:0');
        return false;
      }
      break;
  }
  return true;
};

export const MultiMove_Function_ChangeSelection = (runtime: PokemonStorageMiscRuntime): boolean => {
  const mm = mustMultiMove(runtime);
  switch (mm.state) {
    case 0:
      if (!UpdateCursorPos(runtime)) {
        [mm.cursorColumn, mm.cursorRow] = GetCursorBoxColumnAndRow(runtime);
        MultiMove_UpdateSelectedIcons(runtime);
        mm.toColumn = mm.cursorColumn;
        mm.toRow = mm.cursorRow;
        op(runtime, `CopyWindowToVram8Bit:${runtime.multiMoveWindowId}:gfx`);
        mm.state++;
      }
      break;
    case 1:
      return IsDma3ManagerBusyWithBgCopy(runtime);
  }
  return true;
};

export const MultiMove_Function_GrabSelection = (runtime: PokemonStorageMiscRuntime): boolean => {
  const mm = mustMultiMove(runtime);
  switch (mm.state) {
    case 0:
      MultiMove_GetMonsFromSelection(runtime);
      MultiMove_RemoveMonsFromBox(runtime);
      op(runtime, 'InitMultiMonPlaceChange:false');
      mm.state++;
      break;
    case 1:
      if (!DoMonPlaceChange(runtime)) {
        StartCursorAnim(runtime, CURSOR_ANIM_FIST);
        MultiMove_InitBg(runtime, 0, 256, 8);
        op(runtime, 'InitMultiMonPlaceChange:true');
        mm.state++;
      }
      break;
    case 2: {
      const movingBg = MultiMove_UpdateBg(runtime);
      const movingMon = DoMonPlaceChange(runtime);
      if (!movingBg && !movingMon) return false;
      break;
    }
  }
  return true;
};

export const MultiMove_Function_MoveMons = (runtime: PokemonStorageMiscRuntime): boolean => {
  const movingCursor = UpdateCursorPos(runtime);
  const movingBg = MultiMove_UpdateBg(runtime);
  return !!(movingCursor || movingBg);
};

export const MultiMove_Function_PlaceMons = (runtime: PokemonStorageMiscRuntime): boolean => {
  const mm = mustMultiMove(runtime);
  switch (mm.state) {
    case 0:
      MultiMove_SetPlacedMonData(runtime);
      MultiMove_InitBg(runtime, 0, -256, 8);
      op(runtime, 'InitMultiMonPlaceChange:false');
      mm.state++;
      break;
    case 1:
      if (!DoMonPlaceChange(runtime) && !MultiMove_UpdateBg(runtime)) {
        MultiMove_CreatePlacedMonIcons(runtime);
        StartCursorAnim(runtime, CURSOR_ANIM_OPEN);
        op(runtime, 'InitMultiMonPlaceChange:true');
        op(runtime, 'HideBg:0');
        mm.state++;
      }
      break;
    case 2:
      if (!DoMonPlaceChange(runtime)) {
        StartCursorAnim(runtime, CURSOR_ANIM_BOUNCE);
        MultiMove_ResetBg(runtime);
        mm.state++;
      }
      break;
    case 3:
      if (!IsDma3ManagerBusyWithBgCopy(runtime)) {
        op(runtime, 'LoadPalette:GetTextWindowPalette3:13:4bpp');
        op(runtime, 'SetCursorPriorityTo1');
        op(runtime, 'ShowBg:0');
        return false;
      }
      break;
  }
  return true;
};

export const MultiMove_TryMoveGroup = (runtime: PokemonStorageMiscRuntime, dir: number): boolean => {
  const mm = mustMultiMove(runtime);
  switch (dir) {
    case 0:
      if (mm.minRow === 0) return false;
      mm.minRow--;
      MultiMove_InitBg(runtime, 0, 1024, 6);
      break;
    case 1:
      if (mm.minRow + mm.rowsTotal >= 5) return false;
      mm.minRow++;
      MultiMove_InitBg(runtime, 0, -1024, 6);
      break;
    case 2:
      if (mm.minColumn === 0) return false;
      mm.minColumn--;
      MultiMove_InitBg(runtime, 1024, 0, 6);
      break;
    case 3:
      if (mm.minColumn + mm.columnsTotal > 5) return false;
      mm.minColumn++;
      MultiMove_InitBg(runtime, -1024, 0, 6);
      break;
  }
  return true;
};

export const MultiMove_UpdateSelectedIcons = (runtime: PokemonStorageMiscRuntime): void => {
  const mm = mustMultiMove(runtime);
  const columnChange = Math.abs(mm.fromColumn - mm.cursorColumn) - Math.abs(mm.fromColumn - mm.toColumn);
  const rowChange = Math.abs(mm.fromRow - mm.cursorRow) - Math.abs(mm.fromRow - mm.toRow);
  if (columnChange > 0) MultiMove_SelectColumn(runtime, mm.cursorColumn, mm.fromRow, mm.toRow);
  if (columnChange < 0) {
    MultiMove_DeselectColumn(runtime, mm.toColumn, mm.fromRow, mm.toRow);
    MultiMove_SelectColumn(runtime, mm.cursorColumn, mm.fromRow, mm.toRow);
  }
  if (rowChange > 0) MultiMove_SelectRow(runtime, mm.cursorRow, mm.fromColumn, mm.toColumn);
  if (rowChange < 0) {
    MultiMove_DeselectRow(runtime, mm.toRow, mm.fromColumn, mm.toColumn);
    MultiMove_SelectRow(runtime, mm.cursorRow, mm.fromColumn, mm.toColumn);
  }
};

export const MultiMove_SelectColumn = (runtime: PokemonStorageMiscRuntime, column: number, minRow: number, maxRow: number): void => {
  if (minRow > maxRow) [minRow, maxRow] = [maxRow, minRow];
  while (minRow <= maxRow) MultiMove_SetIconToBg(runtime, column, minRow++);
};
export const MultiMove_SelectRow = (runtime: PokemonStorageMiscRuntime, row: number, minColumn: number, maxColumn: number): void => {
  if (minColumn > maxColumn) [minColumn, maxColumn] = [maxColumn, minColumn];
  while (minColumn <= maxColumn) MultiMove_SetIconToBg(runtime, minColumn++, row);
};
export const MultiMove_DeselectColumn = (runtime: PokemonStorageMiscRuntime, column: number, minRow: number, maxRow: number): void => {
  if (minRow > maxRow) [minRow, maxRow] = [maxRow, minRow];
  while (minRow <= maxRow) MultiMove_ClearIconFromBg(runtime, column, minRow++);
};
export const MultiMove_DeselectRow = (runtime: PokemonStorageMiscRuntime, row: number, minColumn: number, maxColumn: number): void => {
  if (minColumn > maxColumn) [minColumn, maxColumn] = [maxColumn, minColumn];
  while (minColumn <= maxColumn) MultiMove_ClearIconFromBg(runtime, minColumn++, row);
};

export const MultiMove_SetIconToBg = (runtime: PokemonStorageMiscRuntime, x: number, y: number): void => {
  const position = x + IN_BOX_COLUMNS * y;
  const species = GetCurrentBoxMonData(runtime, position, MON_DATA_SPECIES_OR_EGG);
  const personality = GetCurrentBoxMonData(runtime, position, MON_DATA_PERSONALITY);
  if (species !== SPECIES_NONE) op(runtime, `BlitBitmapRectToWindow4BitTo8Bit:${runtime.multiMoveWindowId}:species${species}:personality${personality}:${24 * x}:${24 * y}:pal${GetValidMonIconPalIndex(species) + 8}`);
};

export const MultiMove_ClearIconFromBg = (runtime: PokemonStorageMiscRuntime, x: number, y: number): void => {
  const position = x + IN_BOX_COLUMNS * y;
  if (GetCurrentBoxMonData(runtime, position, MON_DATA_SPECIES_OR_EGG) !== SPECIES_NONE) op(runtime, `FillWindowPixelRect8Bit:${runtime.multiMoveWindowId}:0:${24 * x}:${24 * y}:32:32`);
};

export const MultiMove_InitBg = (runtime: PokemonStorageMiscRuntime, bgX: number, bgY: number, duration: number): void => {
  const mm = mustMultiMove(runtime);
  mm.bgX = bgX;
  mm.bgY = bgY;
  mm.bgMoveSteps = duration;
};

export const MultiMove_UpdateBg = (runtime: PokemonStorageMiscRuntime): number => {
  const mm = mustMultiMove(runtime);
  if (mm.bgMoveSteps !== 0) {
    op(runtime, `ChangeBgX:0:${mm.bgX}:add`);
    op(runtime, `ChangeBgY:0:${mm.bgY}:add`);
    mm.bgMoveSteps--;
  }
  return mm.bgMoveSteps;
};

export const MultiMove_GetMonsFromSelection = (runtime: PokemonStorageMiscRuntime): void => {
  const mm = mustMultiMove(runtime);
  mm.minColumn = Math.min(mm.fromColumn, mm.toColumn);
  mm.minRow = Math.min(mm.fromRow, mm.toRow);
  mm.columnsTotal = Math.abs(mm.fromColumn - mm.toColumn) + 1;
  mm.rowsTotal = Math.abs(mm.fromRow - mm.toRow) + 1;
  let monArrayId = 0;
  for (let i = mm.minRow; i < mm.minRow + mm.rowsTotal; i++) {
    let boxPosition = IN_BOX_COLUMNS * i + mm.minColumn;
    for (let j = mm.minColumn; j < mm.minColumn + mm.columnsTotal; j++, boxPosition++) {
      void j;
      mm.boxMons[monArrayId++] = { ...GetBoxedMonPtr(runtime, runtime.currentBox, boxPosition) };
    }
  }
};

export const MultiMove_RemoveMonsFromBox = (runtime: PokemonStorageMiscRuntime): void => {
  const mm = mustMultiMove(runtime);
  for (let i = mm.minRow; i < mm.minRow + mm.rowsTotal; i++) {
    let boxPosition = IN_BOX_COLUMNS * i + mm.minColumn;
    for (let j = mm.minColumn; j < mm.minColumn + mm.columnsTotal; j++, boxPosition++) {
      void j;
      op(runtime, `DestroyBoxMonIconAtPosition:${boxPosition}`);
      runtime.boxes[runtime.currentBox][boxPosition] = createBoxPokemon();
    }
  }
};

export const MultiMove_CreatePlacedMonIcons = (runtime: PokemonStorageMiscRuntime): void => {
  const mm = mustMultiMove(runtime);
  let monArrayId = 0;
  for (let i = mm.minRow; i < mm.minRow + mm.rowsTotal; i++) {
    let boxPosition = IN_BOX_COLUMNS * i + mm.minColumn;
    for (let j = mm.minColumn; j < mm.minColumn + mm.columnsTotal; j++, boxPosition++) {
      void j;
      if (GetBoxMonData(mm.boxMons[monArrayId], MON_DATA_SANITY_HAS_SPECIES)) op(runtime, `CreateBoxMonIconAtPos:${boxPosition}`);
      monArrayId++;
    }
  }
};

export const MultiMove_SetPlacedMonData = (runtime: PokemonStorageMiscRuntime): void => {
  const mm = mustMultiMove(runtime);
  let monArrayId = 0;
  for (let i = mm.minRow; i < mm.minRow + mm.rowsTotal; i++) {
    let boxPosition = IN_BOX_COLUMNS * i + mm.minColumn;
    for (let j = mm.minColumn; j < mm.minColumn + mm.columnsTotal; j++, boxPosition++, monArrayId++) {
      void j;
      if (GetBoxMonData(mm.boxMons[monArrayId], MON_DATA_SANITY_HAS_SPECIES)) runtime.boxes[runtime.currentBox][boxPosition] = { ...mm.boxMons[monArrayId] };
    }
  }
};

export const MultiMove_ResetBg = (runtime: PokemonStorageMiscRuntime): void => {
  op(runtime, 'ChangeBgX:0:0:set');
  op(runtime, 'ChangeBgY:0:0:set');
  op(runtime, 'SetBgAttribute:0:palettemode:0');
  op(runtime, 'ClearGpuRegBits:BG0CNT:256COLOR');
  op(runtime, 'FillBgTilemapBufferRect_Palette0:0:0:0:0:32:32');
  op(runtime, 'CopyBgTilemapBufferToVram:0');
};

export const MultiMove_GetOriginPosition = (runtime: PokemonStorageMiscRuntime): number => {
  const mm = mustMultiMove(runtime);
  return IN_BOX_COLUMNS * mm.fromRow + mm.fromColumn;
};

export const MultiMove_CanPlaceSelection = (runtime: PokemonStorageMiscRuntime): boolean => {
  const mm = mustMultiMove(runtime);
  let monArrayId = 0;
  for (let i = mm.minRow; i < mm.minRow + mm.rowsTotal; i++) {
    let boxPosition = IN_BOX_COLUMNS * i + mm.minColumn;
    for (let j = mm.minColumn; j < mm.minColumn + mm.columnsTotal; j++, boxPosition++, monArrayId++) {
      void j;
      if (GetBoxMonData(mm.boxMons[monArrayId], MON_DATA_SANITY_HAS_SPECIES) && GetCurrentBoxMonData(runtime, boxPosition, MON_DATA_SANITY_HAS_SPECIES)) return false;
    }
  }
  return true;
};

export const CreateItemIconSprites = (runtime: PokemonStorageMiscRuntime): void => {
  if (runtime.boxOption === OPTION_MOVE_ITEMS) {
    for (let i = 0; i < MAX_ITEM_ICONS; i++) {
      op(runtime, `LoadCompressedSpriteSheet:${i}`);
      runtime.itemIcons[i].tiles = `OBJ_VRAM0:${i}`;
      runtime.itemIcons[i].palIndex = i;
      runtime.itemIcons[i].sprite.invisible = true;
      runtime.itemIcons[i].active = false;
    }
  }
  runtime.movingItemId = ITEM_NONE;
};

export const TryLoadItemIconAtPos = (runtime: PokemonStorageMiscRuntime, cursorArea: number, cursorPos: number): void => {
  if (runtime.boxOption !== OPTION_MOVE_ITEMS || IsItemIconAtPosition(runtime, cursorArea, cursorPos)) return;
  let heldItem = ITEM_NONE;
  if (cursorArea === CURSOR_AREA_IN_BOX) {
    if (!GetCurrentBoxMonData(runtime, cursorPos, MON_DATA_SANITY_HAS_SPECIES)) return;
    heldItem = GetCurrentBoxMonData(runtime, cursorPos, MON_DATA_HELD_ITEM);
  } else if (cursorArea === CURSOR_AREA_IN_PARTY) {
    if (!GetMonData(runtime.party[cursorPos], MON_DATA_SANITY_HAS_SPECIES)) return;
    heldItem = GetMonData(runtime.party[cursorPos], MON_DATA_HELD_ITEM);
  } else return;
  if (heldItem !== ITEM_NONE) {
    const id = GetNewItemIconIdx(runtime);
    SetItemIconPosition(runtime, id, cursorArea, cursorPos);
    LoadItemIconGfx(runtime, id, GetItemIconPic(heldItem), GetItemIconPalette(heldItem));
    SetItemIconAffineAnim(runtime, id, ITEM_ANIM_APPEAR);
    SetItemIconActive(runtime, id, true);
  }
};

export const TryHideItemIconAtPos = (runtime: PokemonStorageMiscRuntime, cursorArea: number, cursorPos: number): void => {
  if (runtime.boxOption !== OPTION_MOVE_ITEMS) return;
  const id = GetItemIconIdxByPosition(runtime, cursorArea, cursorPos);
  SetItemIconAffineAnim(runtime, id, ITEM_ANIM_DISAPPEAR);
  SetItemIconCallback(runtime, id, ITEM_CB_WAIT_ANIM, cursorArea, cursorPos);
};

export const Item_FromMonToMoving = (runtime: PokemonStorageMiscRuntime, cursorArea: number, cursorPos: number): void => {
  if (runtime.boxOption !== OPTION_MOVE_ITEMS) return;
  const id = GetItemIconIdxByPosition(runtime, cursorArea, cursorPos);
  SetItemIconAffineAnim(runtime, id, ITEM_ANIM_PICK_UP);
  SetItemIconCallback(runtime, id, ITEM_CB_TO_HAND, cursorArea, cursorPos);
  SetItemIconPosition(runtime, id, CURSOR_AREA_IN_HAND, 0);
  if (cursorArea === CURSOR_AREA_IN_BOX) {
    SetCurrentBoxMonData(runtime, cursorPos, MON_DATA_HELD_ITEM, ITEM_NONE);
    op(runtime, `SetBoxMonIconObjMode:${cursorPos}:blend`);
  } else {
    SetMonData(runtime.party[cursorPos], MON_DATA_HELD_ITEM, ITEM_NONE);
    op(runtime, `SetPartyMonIconObjMode:${cursorPos}:blend`);
  }
  runtime.movingItemId = runtime.displayMonItemId;
};

export const InitItemIconInCursor = (runtime: PokemonStorageMiscRuntime, item: number): void => {
  const id = GetNewItemIconIdx(runtime);
  LoadItemIconGfx(runtime, id, GetItemIconPic(item), GetItemIconPalette(item));
  SetItemIconAffineAnim(runtime, id, ITEM_ANIM_LARGE);
  SetItemIconCallback(runtime, id, ITEM_CB_TO_HAND, 0, 0);
  SetItemIconPosition(runtime, id, CURSOR_AREA_IN_HAND, 0);
  SetItemIconActive(runtime, id, true);
  runtime.movingItemId = item;
};

export const Item_SwitchMonsWithMoving = (runtime: PokemonStorageMiscRuntime, cursorArea: number, cursorPos: number): void => {
  if (runtime.boxOption !== OPTION_MOVE_ITEMS) return;
  let id = GetItemIconIdxByPosition(runtime, cursorArea, cursorPos);
  SetItemIconAffineAnim(runtime, id, ITEM_ANIM_PICK_UP);
  SetItemIconCallback(runtime, id, ITEM_CB_SWAP_TO_HAND, CURSOR_AREA_IN_HAND, 0);
  if (cursorArea === CURSOR_AREA_IN_BOX) {
    const item = GetCurrentBoxMonData(runtime, cursorPos, MON_DATA_HELD_ITEM);
    SetCurrentBoxMonData(runtime, cursorPos, MON_DATA_HELD_ITEM, runtime.movingItemId);
    runtime.movingItemId = item;
  } else {
    const item = GetMonData(runtime.party[cursorPos], MON_DATA_HELD_ITEM);
    SetMonData(runtime.party[cursorPos], MON_DATA_HELD_ITEM, runtime.movingItemId);
    runtime.movingItemId = item;
  }
  id = GetItemIconIdxByPosition(runtime, CURSOR_AREA_IN_HAND, 0);
  SetItemIconAffineAnim(runtime, id, ITEM_ANIM_PUT_DOWN);
  SetItemIconCallback(runtime, id, ITEM_CB_SWAP_TO_MON, cursorArea, cursorPos);
};

export const Item_GiveMovingToMon = (runtime: PokemonStorageMiscRuntime, cursorArea: number, cursorPos: number): void => {
  if (runtime.boxOption !== OPTION_MOVE_ITEMS) return;
  const id = GetItemIconIdxByPosition(runtime, CURSOR_AREA_IN_HAND, 0);
  SetItemIconAffineAnim(runtime, id, ITEM_ANIM_PUT_DOWN);
  SetItemIconCallback(runtime, id, ITEM_CB_TO_MON, cursorArea, cursorPos);
  if (cursorArea === CURSOR_AREA_IN_BOX) {
    SetCurrentBoxMonData(runtime, cursorPos, MON_DATA_HELD_ITEM, runtime.movingItemId);
    op(runtime, `SetBoxMonIconObjMode:${cursorPos}:normal`);
  } else {
    SetMonData(runtime.party[cursorPos], MON_DATA_HELD_ITEM, runtime.movingItemId);
    op(runtime, `SetPartyMonIconObjMode:${cursorPos}:normal`);
  }
};

export const Item_TakeMons = (runtime: PokemonStorageMiscRuntime, cursorArea: number, cursorPos: number): void => {
  if (runtime.boxOption !== OPTION_MOVE_ITEMS) return;
  const id = GetItemIconIdxByPosition(runtime, cursorArea, cursorPos);
  SetItemIconAffineAnim(runtime, id, ITEM_ANIM_DISAPPEAR);
  SetItemIconCallback(runtime, id, ITEM_CB_WAIT_ANIM, cursorArea, cursorPos);
  if (cursorArea === CURSOR_AREA_IN_BOX) {
    SetCurrentBoxMonData(runtime, cursorPos, MON_DATA_HELD_ITEM, ITEM_NONE);
    op(runtime, `SetBoxMonIconObjMode:${cursorPos}:blend`);
  } else {
    SetMonData(runtime.party[cursorPos], MON_DATA_HELD_ITEM, ITEM_NONE);
    op(runtime, `SetPartyMonIconObjMode:${cursorPos}:blend`);
  }
};

export const MoveItemFromCursorToBag = (runtime: PokemonStorageMiscRuntime): void => {
  if (runtime.boxOption === OPTION_MOVE_ITEMS) {
    const id = GetItemIconIdxByPosition(runtime, CURSOR_AREA_IN_HAND, 0);
    SetItemIconAffineAnim(runtime, id, ITEM_ANIM_PUT_AWAY);
    SetItemIconCallback(runtime, id, ITEM_CB_WAIT_ANIM, CURSOR_AREA_IN_HAND, 0);
  }
};

export const MoveHeldItemWithPartyMenu = (runtime: PokemonStorageMiscRuntime): void => {
  if (runtime.boxOption !== OPTION_MOVE_ITEMS) return;
  for (let i = 0; i < MAX_ITEM_ICONS; i++) {
    if (runtime.itemIcons[i].active && runtime.itemIcons[i].cursorArea === CURSOR_AREA_IN_PARTY) SetItemIconCallback(runtime, i, ITEM_CB_HIDE_PARTY, CURSOR_AREA_IN_HAND, 0);
  }
};

export const IsItemIconAnimActive = (runtime: PokemonStorageMiscRuntime): boolean =>
  runtime.itemIcons.some((icon) => icon.active && ((!icon.sprite.affineAnimEnded && icon.sprite.affineAnimBeginning) || (icon.sprite.callback !== 'SpriteCallbackDummy' && icon.sprite.callback !== 'SpriteCB_ItemIcon_SetPosToCursor')));

export const IsActiveItemMoving = (runtime: PokemonStorageMiscRuntime): boolean =>
  runtime.boxOption === OPTION_MOVE_ITEMS && runtime.itemIcons.some((icon) => icon.active && icon.cursorArea === CURSOR_AREA_BOX_TITLE);

export const GetMovingItemName = (runtime: PokemonStorageMiscRuntime): string => `Item${runtime.movingItemId}`;
export const GetMovingItem = (runtime: PokemonStorageMiscRuntime): number => runtime.movingItemId;

export const GetNewItemIconIdx = (runtime: PokemonStorageMiscRuntime): number => {
  for (let i = 0; i < MAX_ITEM_ICONS; i++) {
    if (!runtime.itemIcons[i].active) {
      runtime.itemIcons[i].active = true;
      return i;
    }
  }
  return MAX_ITEM_ICONS;
};

export const IsItemIconAtPosition = (runtime: PokemonStorageMiscRuntime, cursorArea: number, cursorPos: number): boolean =>
  runtime.itemIcons.some((icon) => icon.active && icon.cursorArea === cursorArea && icon.cursorPos === cursorPos);

export const GetItemIconIdxByPosition = (runtime: PokemonStorageMiscRuntime, cursorArea: number, cursorPos: number): number =>
  runtime.itemIcons.findIndex((icon) => icon.active && icon.cursorArea === cursorArea && icon.cursorPos === cursorPos) >= 0
    ? runtime.itemIcons.findIndex((icon) => icon.active && icon.cursorArea === cursorArea && icon.cursorPos === cursorPos)
    : MAX_ITEM_ICONS;

export const GetItemIconIdxBySprite = (runtime: PokemonStorageMiscRuntime, sprite: StorageSprite): number =>
  runtime.itemIcons.findIndex((icon) => icon.active && icon.sprite === sprite) >= 0
    ? runtime.itemIcons.findIndex((icon) => icon.active && icon.sprite === sprite)
    : MAX_ITEM_ICONS;

export const SetItemIconPosition = (runtime: PokemonStorageMiscRuntime, id: number, cursorArea: number, cursorPos: number): void => {
  if (id >= MAX_ITEM_ICONS) return;
  const sprite = runtime.itemIcons[id].sprite;
  if (cursorArea === CURSOR_AREA_IN_BOX) {
    const row = cursorPos % IN_BOX_COLUMNS;
    const column = Math.floor(cursorPos / IN_BOX_COLUMNS);
    sprite.x = 24 * row + 112;
    sprite.y = 24 * column + 56;
    sprite.oam.priority = 2;
  } else if (cursorArea === CURSOR_AREA_IN_PARTY) {
    if (cursorPos === 0) {
      sprite.x = 116;
      sprite.y = 76;
    } else {
      sprite.x = 164;
      sprite.y = 24 * (cursorPos - 1) + 28;
    }
    sprite.oam.priority = 1;
  }
  runtime.itemIcons[id].cursorArea = cursorArea;
  runtime.itemIcons[id].cursorPos = cursorPos;
};

export const LoadItemIconGfx = (runtime: PokemonStorageMiscRuntime, id: number, itemTiles: string, itemPal: string): void => {
  if (id >= MAX_ITEM_ICONS) return;
  op(runtime, `CpuFastFill:itemIconBuffer:0x200`);
  op(runtime, `LZ77UnCompWram:${itemTiles}:tileBuffer`);
  for (let i = 0; i < 3; i++) op(runtime, `CpuFastCopy:tileBuffer+${i * 0x60}:itemIconBuffer+${i * 0x80}:0x60`);
  op(runtime, `CpuFastCopy:itemIconBuffer:${runtime.itemIcons[id].tiles}:0x200`);
  op(runtime, `LZ77UnCompWram:${itemPal}:itemIconBuffer`);
  op(runtime, `LoadPalette:itemIconBuffer:${runtime.itemIcons[id].palIndex}:4bpp`);
};

export const SetItemIconAffineAnim = (runtime: PokemonStorageMiscRuntime, id: number, animNum: number): void => {
  if (id >= MAX_ITEM_ICONS) return;
  runtime.itemIcons[id].sprite.affineAnimEnded = false;
  runtime.itemIcons[id].sprite.affineAnimBeginning = true;
  op(runtime, `StartSpriteAffineAnim:${id}:${animNum}`);
};

export const SetItemIconCallback = (runtime: PokemonStorageMiscRuntime, id: number, callbackId: number, cursorArea: number, cursorPos: number): void => {
  if (id >= MAX_ITEM_ICONS) return;
  const sprite = runtime.itemIcons[id].sprite;
  switch (callbackId) {
    case ITEM_CB_WAIT_ANIM:
      sprite.data[0] = id;
      sprite.callback = 'SpriteCB_ItemIcon_WaitAnim';
      break;
    case ITEM_CB_TO_HAND:
      sprite.data[0] = 0;
      sprite.callback = 'SpriteCB_ItemIcon_ToHand';
      break;
    case ITEM_CB_TO_MON:
      sprite.data[0] = 0;
      sprite.data[6] = cursorArea;
      sprite.data[7] = cursorPos;
      sprite.callback = 'SpriteCB_ItemIcon_ToMon';
      break;
    case ITEM_CB_SWAP_TO_HAND:
      sprite.data[0] = 0;
      sprite.callback = 'SpriteCB_ItemIcon_SwapToHand';
      sprite.data[6] = cursorArea;
      sprite.data[7] = cursorPos;
      break;
    case ITEM_CB_SWAP_TO_MON:
      sprite.data[0] = 0;
      sprite.data[6] = cursorArea;
      sprite.data[7] = cursorPos;
      sprite.callback = 'SpriteCB_ItemIcon_SwapToMon';
      break;
    case ITEM_CB_HIDE_PARTY:
      sprite.callback = 'SpriteCB_ItemIcon_HideParty';
      break;
  }
};

export const SetItemIconActive = (runtime: PokemonStorageMiscRuntime, id: number, show: boolean): void => {
  if (id >= MAX_ITEM_ICONS) return;
  runtime.itemIcons[id].active = show;
  runtime.itemIcons[id].sprite.invisible = show === false;
};

export const PrintItemDescription = (runtime: PokemonStorageMiscRuntime): void => {
  const item = IsActiveItemMoving(runtime) ? runtime.movingItemId : runtime.displayMonItemId;
  op(runtime, 'FillWindowPixelBuffer:2:1');
  op(runtime, `AddTextPrinterParameterized5:2:Item${item}Description`);
};

export const InitItemInfoWindow = (runtime: PokemonStorageMiscRuntime): void => {
  runtime.itemInfoWindowOffset = 25;
  op(runtime, 'LoadBgTiles:0:sItemInfoFrame_Gfx:0x80:0x1a4');
  DrawItemInfoWindow(runtime, 0);
};

export const UpdateItemInfoWindowSlideIn = (runtime: PokemonStorageMiscRuntime): boolean => {
  if (runtime.itemInfoWindowOffset === 0) return false;
  runtime.itemInfoWindowOffset--;
  const pos = 25 - runtime.itemInfoWindowOffset;
  for (let i = 0; i < pos; i++) op(runtime, `WriteSequenceToBgTilemapBuffer:${0x14 + runtime.itemInfoWindowOffset + i}:${i}:12:1:8:15:25`);
  DrawItemInfoWindow(runtime, pos);
  return runtime.itemInfoWindowOffset !== 0;
};

export const UpdateItemInfoWindowSlideOut = (runtime: PokemonStorageMiscRuntime): boolean => {
  if (runtime.itemInfoWindowOffset === 25) return false;
  if (runtime.itemInfoWindowOffset === 0) op(runtime, 'FillBgTilemapBufferRect:0:0:25:11:1:10:17');
  runtime.itemInfoWindowOffset++;
  const pos = 25 - runtime.itemInfoWindowOffset;
  for (let i = 0; i < pos; i++) op(runtime, `WriteSequenceToBgTilemapBuffer:${0x14 + runtime.itemInfoWindowOffset + i}:${i}:12:1:8:15:25`);
  DrawItemInfoWindow(runtime, pos);
  op(runtime, `FillBgTilemapBufferRect:0:0:${pos}:11:1:10:17`);
  return runtime.itemInfoWindowOffset !== 25;
};

export const DrawItemInfoWindow = (runtime: PokemonStorageMiscRuntime, x: number): void => {
  if (x !== 0) {
    op(runtime, `FillBgTilemapBufferRect:0:0x1a4:0:11:${x}:1:15`);
    op(runtime, `FillBgTilemapBufferRect:0:0x9a4:0:20:${x}:1:15`);
  }
  op(runtime, `FillBgTilemapBufferRect:0:0x1a5:${x}:12:1:8:15`);
  op(runtime, `FillBgTilemapBufferRect:0:0x1a6:${x}:11:1:1:15`);
  op(runtime, `FillBgTilemapBufferRect:0:0x1a7:${x}:20:1:1:15`);
  op(runtime, 'ScheduleBgCopyTilemapToVram:0');
};

export const SpriteCB_ItemIcon_WaitAnim = (runtime: PokemonStorageMiscRuntime, sprite: StorageSprite): void => {
  if (sprite.affineAnimEnded) {
    SetItemIconActive(runtime, sprite.data[0], false);
    sprite.callback = 'SpriteCallbackDummy';
  }
};

export const SpriteCB_ItemIcon_ToHand = (_runtime: PokemonStorageMiscRuntime, sprite: StorageSprite): void => {
  switch (sprite.data[0]) {
    case 0:
      sprite.data[1] = sprite.x << 4; sprite.data[2] = sprite.y << 4; sprite.data[3] = 10; sprite.data[4] = 21; sprite.data[5] = 0; sprite.data[0]++;
    case 1:
      sprite.data[1] -= sprite.data[3]; sprite.data[2] -= sprite.data[4]; sprite.x = sprite.data[1] >> 4; sprite.y = sprite.data[2] >> 4;
      if (++sprite.data[5] > 11) sprite.callback = 'SpriteCB_ItemIcon_SetPosToCursor';
      break;
  }
};

export const SpriteCB_ItemIcon_SetPosToCursor = (runtime: PokemonStorageMiscRuntime, sprite: StorageSprite): void => {
  sprite.x = runtime.cursorSprite.x + 4;
  sprite.y = runtime.cursorSprite.y + runtime.cursorSprite.y2 + 8;
  sprite.oam.priority = runtime.cursorSprite.oam.priority;
};

export const SpriteCB_ItemIcon_ToMon = (runtime: PokemonStorageMiscRuntime, sprite: StorageSprite): void => moveIconToMon(runtime, sprite, false);
export const SpriteCB_ItemIcon_SwapToHand = (runtime: PokemonStorageMiscRuntime, sprite: StorageSprite): void => moveIconToHandSwap(runtime, sprite);
export const SpriteCB_ItemIcon_SwapToMon = (runtime: PokemonStorageMiscRuntime, sprite: StorageSprite): void => moveIconToMon(runtime, sprite, true);

export const SpriteCB_ItemIcon_HideParty = (runtime: PokemonStorageMiscRuntime, sprite: StorageSprite): void => {
  sprite.y -= 8;
  if (sprite.y + sprite.y2 < -16) {
    sprite.callback = 'SpriteCallbackDummy';
    SetItemIconActive(runtime, GetItemIconIdxBySprite(runtime, sprite), false);
  }
};

export const callItemIconCallback = (runtime: PokemonStorageMiscRuntime, sprite: StorageSprite): void => {
  switch (sprite.callback) {
    case 'SpriteCB_ItemIcon_WaitAnim': return SpriteCB_ItemIcon_WaitAnim(runtime, sprite);
    case 'SpriteCB_ItemIcon_ToHand': return SpriteCB_ItemIcon_ToHand(runtime, sprite);
    case 'SpriteCB_ItemIcon_SetPosToCursor': return SpriteCB_ItemIcon_SetPosToCursor(runtime, sprite);
    case 'SpriteCB_ItemIcon_ToMon': return SpriteCB_ItemIcon_ToMon(runtime, sprite);
    case 'SpriteCB_ItemIcon_SwapToHand': return SpriteCB_ItemIcon_SwapToHand(runtime, sprite);
    case 'SpriteCB_ItemIcon_SwapToMon': return SpriteCB_ItemIcon_SwapToMon(runtime, sprite);
    case 'SpriteCB_ItemIcon_HideParty': return SpriteCB_ItemIcon_HideParty(runtime, sprite);
    case 'SpriteCallbackDummy': return undefined;
  }
};

export const UnkUtil_Init = (runtime: PokemonStorageMiscRuntime, util: UnkUtil, data: UnkUtilData[], max: number): void => {
  runtime.sUnkUtil = util;
  util.data = data;
  util.max = max;
  util.numActive = 0;
};

export const UnkUtil_Run = (runtime: PokemonStorageMiscRuntime): void => {
  const util = runtime.sUnkUtil;
  if (!util?.numActive) return;
  for (let i = 0; i < util.numActive; i++) {
    const data = util.data[i];
    if (data.func === 'UnkUtil_CpuRun') UnkUtil_CpuRun(runtime, data);
    else UnkUtil_DmaRun(runtime, data);
  }
  util.numActive = 0;
};

export const UnkUtil_CpuAdd = (runtime: PokemonStorageMiscRuntime, dest: number, dLeft: number, dTop: number, src: number, sLeft: number, sTop: number, width: number, height: number, unkArg: number): boolean => {
  const util = runtime.sUnkUtil;
  if (!util || util.numActive >= util.max) return false;
  util.data[util.numActive++] = { size: width * 2, dest: dest + 2 * (dTop * 32 + dLeft), src: src + 2 * (sTop * unkArg + sLeft), height, unk: unkArg, func: 'UnkUtil_CpuRun' };
  return true;
};

export const UnkUtil_CpuRun = (runtime: PokemonStorageMiscRuntime, data: UnkUtilData): void => {
  for (let i = 0; i < data.height; i++) {
    op(runtime, `CpuCopy16:${data.src}:${data.dest}:${data.size}`);
    data.dest += 64;
    data.src += data.unk * 2;
  }
};

export const UnkUtil_DmaAdd = (runtime: PokemonStorageMiscRuntime, dest: number, dLeft: number, dTop: number, width: number, height: number): boolean => {
  const util = runtime.sUnkUtil;
  if (!util || util.numActive >= util.max) return false;
  util.data[util.numActive++] = { size: width * 2, dest: dest + ((dTop * 32) + dLeft) * 2, src: 0, height, unk: 0, func: 'UnkUtil_DmaRun' };
  return true;
};

export const UnkUtil_DmaRun = (runtime: PokemonStorageMiscRuntime, data: UnkUtilData): void => {
  for (let i = 0; i < data.height; i++) {
    op(runtime, `Dma3FillLarge_:0:${data.dest}:${data.size}:16`);
    data.dest += 64;
  }
};

const moveIconToMon = (runtime: PokemonStorageMiscRuntime, sprite: StorageSprite, sine: boolean): void => {
  switch (sprite.data[0]) {
    case 0:
      sprite.data[1] = sprite.x << 4; sprite.data[2] = sprite.y << 4; sprite.data[3] = 10; sprite.data[4] = 21; sprite.data[5] = 0; sprite.data[0]++;
    case 1:
      sprite.data[1] += sprite.data[3]; sprite.data[2] += sprite.data[4]; sprite.x = sprite.data[1] >> 4; sprite.y = sprite.data[2] >> 4;
      if (sine) sprite.x2 = -(gSine(sprite.data[5] * 8) >> 4);
      if (++sprite.data[5] > 11) {
        SetItemIconPosition(runtime, GetItemIconIdxBySprite(runtime, sprite), sprite.data[6], sprite.data[7]);
        sprite.callback = 'SpriteCallbackDummy';
        sprite.x2 = 0;
      }
      break;
  }
};

const moveIconToHandSwap = (runtime: PokemonStorageMiscRuntime, sprite: StorageSprite): void => {
  switch (sprite.data[0]) {
    case 0:
      sprite.data[1] = sprite.x << 4; sprite.data[2] = sprite.y << 4; sprite.data[3] = 10; sprite.data[4] = 21; sprite.data[5] = 0; sprite.data[0]++;
    case 1:
      sprite.data[1] -= sprite.data[3]; sprite.data[2] -= sprite.data[4]; sprite.x = sprite.data[1] >> 4; sprite.y = sprite.data[2] >> 4; sprite.x2 = gSine(sprite.data[5] * 8) >> 4;
      if (++sprite.data[5] > 11) {
        SetItemIconPosition(runtime, GetItemIconIdxBySprite(runtime, sprite), sprite.data[6], sprite.data[7]);
        sprite.x2 = 0;
        sprite.callback = 'SpriteCB_ItemIcon_SetPosToCursor';
      }
      break;
  }
};

const mustMultiMove = (runtime: PokemonStorageMiscRuntime): MultiMoveState => {
  if (!runtime.sMultiMove) throw new Error('sMultiMove is NULL');
  return runtime.sMultiMove;
};
const AddWindow8Bit = (_runtime: PokemonStorageMiscRuntime): number => 1;
const StartCursorAnim = (runtime: PokemonStorageMiscRuntime, anim: number): void => op(runtime, `StartCursorAnim:${anim}`);
const IsDma3ManagerBusyWithBgCopy = (runtime: PokemonStorageMiscRuntime): boolean => runtime.dmaBusyResults.length ? runtime.dmaBusyResults.shift()! : false;
const UpdateCursorPos = (runtime: PokemonStorageMiscRuntime): boolean => runtime.cursorMovingResults.length ? runtime.cursorMovingResults.shift()! : false;
const DoMonPlaceChange = (runtime: PokemonStorageMiscRuntime): boolean => runtime.monPlaceMovingResults.length ? runtime.monPlaceMovingResults.shift()! : false;
const GetCursorBoxColumnAndRow = (runtime: PokemonStorageMiscRuntime): [number, number] => [runtime.cursorColumn, runtime.cursorRow];
const StorageGetCurrentBox = (runtime: PokemonStorageMiscRuntime): number => runtime.currentBox;
const GetBoxedMonPtr = (runtime: PokemonStorageMiscRuntime, boxId: number, position: number): BoxPokemon => runtime.boxes[boxId][position];
const GetCurrentBoxMonData = (runtime: PokemonStorageMiscRuntime, position: number, field: number): number => GetBoxMonData(runtime.boxes[StorageGetCurrentBox(runtime)][position], field);
const SetCurrentBoxMonData = (runtime: PokemonStorageMiscRuntime, position: number, field: number, value: number): void => SetBoxMonData(runtime.boxes[StorageGetCurrentBox(runtime)][position], field, value);
const GetBoxMonData = (mon: BoxPokemon, field: number): number => {
  if (field === MON_DATA_SPECIES_OR_EGG) return mon.species;
  if (field === MON_DATA_PERSONALITY) return mon.personality;
  if (field === MON_DATA_SANITY_HAS_SPECIES) return mon.species !== SPECIES_NONE ? 1 : 0;
  if (field === MON_DATA_HELD_ITEM) return mon.heldItem;
  return 0;
};
const SetBoxMonData = (mon: BoxPokemon, field: number, value: number): void => {
  if (field === MON_DATA_HELD_ITEM) mon.heldItem = value;
};
const GetMonData = GetBoxMonData;
const SetMonData = SetBoxMonData;
const GetValidMonIconPalIndex = (species: number): number => species % 3;
const GetItemIconPic = (itemId: number): string => `ItemIconPic${itemId}`;
const GetItemIconPalette = (itemId: number): string => `ItemIconPal${itemId}`;
const gSine = (angle: number): number => Math.round(Math.sin((angle / 128) * Math.PI) * 256);
const op = (runtime: PokemonStorageMiscRuntime, operation: string): void => {
  runtime.operations.push(operation);
};
