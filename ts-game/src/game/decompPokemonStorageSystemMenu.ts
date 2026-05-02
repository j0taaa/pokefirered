export const SPECIES_NONE = 0;
export const PARTY_SIZE = 6;
export const IN_BOX_ROWS = 5;
export const IN_BOX_COLUMNS = 6;
export const IN_BOX_COUNT = IN_BOX_ROWS * IN_BOX_COLUMNS;
export const TOTAL_BOXES_COUNT = 14;
export const BOX_NAME_LENGTH = 8;
export const MAX_DEFAULT_WALLPAPER = 3;
export const BOXID_NONE_CHOSEN = 200;
export const BOXID_CANCELED = 201;
export const A_BUTTON = 0x0001;
export const B_BUTTON = 0x0002;
export const DPAD_RIGHT = 0x0010;
export const DPAD_LEFT = 0x0020;
export const DPAD_UP = 0x0040;
export const DPAD_DOWN = 0x0080;
export const MENU_NOTHING_CHOSEN = -2;
export const MENU_B_PRESSED = -1;
export const FADE_TO_BLACK = 1;

export const OPTION_WITHDRAW = 0;
export const OPTION_DEPOSIT = 1;
export const OPTION_MOVE_MONS = 2;
export const OPTION_MOVE_ITEMS = 3;
export const OPTION_EXIT = 4;
export const OPTIONS_COUNT = 5;

export const STATE_LOAD = 0;
export const STATE_FADE_IN = 1;
export const STATE_HANDLE_INPUT = 2;
export const STATE_ERROR_MSG = 3;
export const STATE_ENTER_PC = 4;

export type PcMenuTaskFunc = 'Task_PCMainMenu';

export type PcMenuTask = {
  func: PcMenuTaskFunc;
  data: number[];
  destroyed: boolean;
  priority: number;
};

export type BoxMon = {
  species: number;
};

export type PartyMon = {
  species: number;
  isEgg: boolean;
  hp: number;
};

export type StorageSprite = {
  id: number;
  x: number;
  y: number;
  x2: number;
  subpriority: number;
  data: number[];
  oam: { size: string; paletteNum: number };
  callback: 'SpriteCallbackDummy' | 'SpriteCB_ChooseBoxArrow' | string;
  destroyed: boolean;
  animNum: number;
};

export type ChooseBoxMenu = {
  curBox: number;
  tileTag: number;
  paletteTag: number;
  subpriority: number;
  loadedPalette: boolean;
  menuSprite: StorageSprite | null;
  menuCornerSprites: Array<StorageSprite | null>;
  arrowSprites: Array<StorageSprite | null>;
  strbuf: string;
  buffer: number[];
  printedText: Array<{ text: string; x: number; y: number }>;
};

export type StorageMenuRuntime = {
  sPreviousBoxOption: number;
  sChooseBoxMenu: ChooseBoxMenu | null;
  tasks: PcMenuTask[];
  nextWindowId: number;
  windows: Map<number, { width: number; height: number; pixels: number[]; tileData: number[]; cleared: boolean }>;
  operations: string[];
  playerLocked: boolean;
  scriptContextEnabled: boolean;
  weatherNotFadingIn: boolean;
  paletteFadeActive: boolean;
  menuInput: number;
  newKeys: number;
  cursorPos: number;
  currentBox: number;
  boxes: BoxMon[][];
  boxNames: string[];
  boxWallpapers: number[];
  party: PartyMon[];
  gSpecialVar_0x8004: number;
  gFieldCallback: 'FieldTask_ReturnToPcMenu' | null;
  mainCallback2: string;
  vblankCallback: string | null;
  sprites: StorageSprite[];
  nextSpriteId: number;
};

export const sMainMenuTexts = [
  { text: 'Withdraw Pokemon', desc: 'Withdraw Mon Description' },
  { text: 'Deposit Pokemon', desc: 'Deposit Mon Description' },
  { text: 'Move Pokemon', desc: 'Move Mon Description' },
  { text: 'Move Items', desc: 'Move Items Description' },
  { text: 'See Ya', desc: 'See Ya Description' },
] as const;

export const createChooseBoxMenu = (): ChooseBoxMenu => ({
  curBox: 0,
  tileTag: 0,
  paletteTag: 0,
  subpriority: 0,
  loadedPalette: false,
  menuSprite: null,
  menuCornerSprites: [null, null, null, null],
  arrowSprites: [null, null],
  strbuf: '',
  buffer: [],
  printedText: [],
});

export const createStorageMenuRuntime = (): StorageMenuRuntime => ({
  sPreviousBoxOption: 0,
  sChooseBoxMenu: null,
  tasks: [],
  nextWindowId: 1,
  windows: new Map([[0, { width: 30, height: 20, pixels: [], tileData: Array(24 * 2 * 32).fill(0), cleared: false }]]),
  operations: [],
  playerLocked: false,
  scriptContextEnabled: false,
  weatherNotFadingIn: true,
  paletteFadeActive: false,
  menuInput: MENU_NOTHING_CHOSEN,
  newKeys: 0,
  cursorPos: 0,
  currentBox: 0,
  boxes: Array.from({ length: TOTAL_BOXES_COUNT }, () => Array.from({ length: IN_BOX_COUNT }, () => ({ species: SPECIES_NONE }))),
  boxNames: Array(TOTAL_BOXES_COUNT).fill(''),
  boxWallpapers: Array(TOTAL_BOXES_COUNT).fill(0),
  party: Array.from({ length: PARTY_SIZE }, () => ({ species: SPECIES_NONE, isEgg: false, hp: 0 })),
  gSpecialVar_0x8004: 0,
  gFieldCallback: null,
  mainCallback2: '',
  vblankCallback: 'VBlank',
  sprites: [],
  nextSpriteId: 0,
});

const tState = 0;
const tSelectedOption = 1;
const tInput = 2;
const tNextOption = 3;
const tWindowId = 15;

export const AddWindow = (runtime: StorageMenuRuntime, template: { width: number; height: number }): number => {
  const id = runtime.nextWindowId++;
  runtime.windows.set(id, { width: template.width, height: template.height, pixels: [], tileData: Array(template.width * template.height * 32).fill(0), cleared: false });
  runtime.operations.push(`AddWindow:${id}:${template.width}:${template.height}`);
  return id;
};

export const RemoveWindow = (runtime: StorageMenuRuntime, windowId: number): void => {
  runtime.windows.delete(windowId);
  runtime.operations.push(`RemoveWindow:${windowId}`);
};

export const FillWindowPixelBuffer = (runtime: StorageMenuRuntime, windowId: number, fill: number): void => {
  const win = runtime.windows.get(windowId);
  if (win) win.pixels = Array(win.width * win.height * 32).fill(fill);
  runtime.operations.push(`FillWindowPixelBuffer:${windowId}:${fill}`);
};

export const DrawTextWindowAndBufferTiles = (runtime: StorageMenuRuntime, string: string, dst: number[], zero1: number, zero2: number, _unused: unknown, bytesToBuffer: number): void => {
  const windowId = AddWindow(runtime, { width: 24, height: 2 });
  FillWindowPixelBuffer(runtime, windowId, zero2);
  const txtColor0 = !zero1 ? 'TRANSPARENT' : String(zero2);
  runtime.operations.push(`AddTextPrinterParameterized4:${windowId}:FONT_NORMAL_COPY_1:0:2:0:0:${txtColor0}:DYNAMIC6:DYNAMIC5:-1:${string}`);
  const tileBytesToBuffer = bytesToBuffer > 6 ? 6 : bytesToBuffer;
  const remainingBytes = bytesToBuffer - 6;
  for (let i = tileBytesToBuffer; i !== 0; i -= 1) {
    dst.push(...Array(0x100).fill(`${string}:${i}` as unknown as number));
  }
  if (remainingBytes > 0) dst.push(...Array(remainingBytes * 0x100).fill((zero2 << 4) | zero2));
  RemoveWindow(runtime, windowId);
};

export const PrintStringToBufferCopyNow = (runtime: StorageMenuRuntime, string: string, dst: number[], offset: number, bgColor: number, fgColor: number, shadowColor: number, _unused: unknown): void => {
  const width = string.length;
  const windowId = AddWindow(runtime, { width, height: 2 });
  FillWindowPixelBuffer(runtime, windowId, bgColor);
  runtime.operations.push(`AddTextPrinterParameterized4:${windowId}:FONT_NORMAL_COPY_1:0:2:0:0:${bgColor}:${fgColor}:${shadowColor}:-1:${string}`);
  for (let i = 0; i < width * 32; i += 1) dst[i] = string.charCodeAt(i % string.length) || 0;
  for (let i = 0; i < width * 32; i += 1) dst[offset + i] = string.charCodeAt(i % string.length) || 0;
  RemoveWindow(runtime, windowId);
};

export const CountMonsInBox = (runtime: StorageMenuRuntime, boxId: number): number => {
  let count = 0;
  for (let i = 0; i < IN_BOX_COUNT; i += 1) if (runtime.boxes[boxId][i].species !== SPECIES_NONE) count += 1;
  return count;
};

export const GetFirstFreeBoxSpot = (runtime: StorageMenuRuntime, boxId: number): number => {
  for (let i = 0; i < IN_BOX_COUNT; i += 1) if (runtime.boxes[boxId][i].species === SPECIES_NONE) return i;
  return -1;
};

export const CountPartyNonEggMons = (runtime: StorageMenuRuntime): number => runtime.party.filter((mon) => mon.species !== SPECIES_NONE && !mon.isEgg).length;
export const CountPartyAliveNonEggMonsExcept = (runtime: StorageMenuRuntime, slotToIgnore: number): number => runtime.party.filter((mon, i) => i !== slotToIgnore && mon.species !== SPECIES_NONE && !mon.isEgg && mon.hp !== 0).length;
export const CountPartyAliveNonEggMons_IgnoreVar0x8004Slot = (runtime: StorageMenuRuntime): number => CountPartyAliveNonEggMonsExcept(runtime, runtime.gSpecialVar_0x8004);
export const CountPartyMons = (runtime: StorageMenuRuntime): number => runtime.party.filter((mon) => mon.species !== SPECIES_NONE).length;

export const StringCopyAndFillWithSpaces = (_runtime: StorageMenuRuntime, src: string, n: number): string => src + ' '.repeat(Math.max(0, n - src.length));

export const UnusedWriteRectCpu = (_runtime: StorageMenuRuntime, dest: number[], destLeft: number, destTop: number, src: number[], srcLeft: number, srcTop: number, destWidth: number, destHeight: number, srcWidth: number): void => {
  for (let i = 0; i < destHeight; i += 1) {
    const destOffset = (destTop + i) * 0x20 + destLeft;
    const srcOffset = (srcTop + i) * srcWidth + srcLeft;
    for (let j = 0; j < destWidth; j += 1) dest[destOffset + j] = src[srcOffset + j] ?? 0;
  }
};

export const UnusedWriteRectDma = (_runtime: StorageMenuRuntime, dest: number[], destLeft: number, destTop: number, width: number, height: number): void => {
  for (let i = 0; i < height; i += 1) {
    const destOffset = (destTop + i) * 0x20 + destLeft;
    for (let j = 0; j < width; j += 1) dest[destOffset + j] = 0;
  }
};

export const CreateTask = (runtime: StorageMenuRuntime, priority: number): number => {
  const taskId = runtime.tasks.length;
  runtime.tasks.push({ func: 'Task_PCMainMenu', data: Array(16).fill(0), destroyed: false, priority });
  return taskId;
};

export const DestroyTask = (runtime: StorageMenuRuntime, taskId: number): void => { runtime.tasks[taskId].destroyed = true; };

export const CreatePCMainMenu = (runtime: StorageMenuRuntime, whichMenu: number, windowIdPtr: { value: number }): void => {
  const windowId = AddWindow(runtime, { width: 17, height: 10 });
  runtime.operations.push(`DrawStdWindowFrame:${windowId}:false`);
  runtime.operations.push(`PrintTextArray:${windowId}:FONT_NORMAL:${OPTIONS_COUNT}`);
  runtime.operations.push(`Menu_InitCursor:${windowId}:FONT_NORMAL:0:2:16:${OPTIONS_COUNT}:${whichMenu}`);
  runtime.cursorPos = whichMenu;
  windowIdPtr.value = windowId;
};

export const Task_PCMainMenu = (runtime: StorageMenuRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  switch (task.data[tState]) {
    case STATE_LOAD: {
      runtime.operations.push('SetHelpContext:HELPCONTEXT_BILLS_PC');
      const windowIdPtr = { value: task.data[tWindowId] };
      CreatePCMainMenu(runtime, task.data[tSelectedOption], windowIdPtr);
      task.data[tWindowId] = windowIdPtr.value;
      runtime.operations.push('LoadStdWindowFrameGfx');
      runtime.operations.push('DrawDialogueFrame:0:false');
      FillWindowPixelBuffer(runtime, 0, 1);
      runtime.operations.push(`AddTextPrinterParameterized2:0:FONT_NORMAL:${sMainMenuTexts[task.data[tSelectedOption]].desc}:TEXT_SKIP_DRAW`);
      runtime.operations.push('CopyWindowToVram:0:COPYWIN_FULL');
      runtime.operations.push(`CopyWindowToVram:${task.data[tWindowId]}:COPYWIN_FULL`);
      task.data[tState] += 1;
      break;
    }
    case STATE_FADE_IN:
      if (runtime.weatherNotFadingIn) task.data[tState] += 1;
      break;
    case STATE_HANDLE_INPUT:
      task.data[tInput] = runtime.menuInput;
      switch (task.data[tInput]) {
        case MENU_NOTHING_CHOSEN:
          task.data[tNextOption] = task.data[tSelectedOption];
          if ((runtime.newKeys & DPAD_UP) && --task.data[tNextOption] < 0) task.data[tNextOption] = OPTIONS_COUNT - 1;
          if ((runtime.newKeys & DPAD_DOWN) && ++task.data[tNextOption] > OPTIONS_COUNT - 1) task.data[tNextOption] = 0;
          if (task.data[tSelectedOption] !== task.data[tNextOption]) {
            task.data[tSelectedOption] = task.data[tNextOption];
            FillWindowPixelBuffer(runtime, 0, 1);
            runtime.operations.push(`AddTextPrinterParameterized2:0:FONT_NORMAL:${sMainMenuTexts[task.data[tSelectedOption]].desc}:0`);
          }
          break;
        case MENU_B_PRESSED:
        case OPTION_EXIT:
          runtime.operations.push('ClearStdWindowAndFrame:0:true');
          runtime.operations.push(`ClearStdWindowAndFrame:${task.data[tWindowId]}:true`);
          runtime.playerLocked = false;
          runtime.scriptContextEnabled = true;
          DestroyTask(runtime, taskId);
          break;
        default:
          if (task.data[tInput] === OPTION_WITHDRAW && CountPartyMons(runtime) === PARTY_SIZE) {
            FillWindowPixelBuffer(runtime, 0, 1);
            runtime.operations.push('AddTextPrinterParameterized2:0:FONT_NORMAL:gText_PartyFull:0');
            task.data[tState] = STATE_ERROR_MSG;
          } else if (task.data[tInput] === OPTION_DEPOSIT && CountPartyMons(runtime) === 1) {
            FillWindowPixelBuffer(runtime, 0, 1);
            runtime.operations.push('AddTextPrinterParameterized2:0:FONT_NORMAL:gText_JustOnePkmn:0');
            task.data[tState] = STATE_ERROR_MSG;
          } else {
            runtime.operations.push(`FadeScreen:${FADE_TO_BLACK}:0`);
            task.data[tState] = STATE_ENTER_PC;
          }
          break;
      }
      break;
    case STATE_ERROR_MSG:
      if (runtime.newKeys & (A_BUTTON | B_BUTTON)) {
        FillWindowPixelBuffer(runtime, 0, 1);
        runtime.operations.push(`AddTextPrinterParameterized2:0:FONT_NORMAL:${sMainMenuTexts[task.data[tSelectedOption]].desc}:0`);
        task.data[tState] = STATE_HANDLE_INPUT;
      } else if (runtime.newKeys & DPAD_UP) {
        if (--task.data[tSelectedOption] < 0) task.data[tSelectedOption] = 4;
        runtime.operations.push('Menu_MoveCursor:-1');
        task.data[tSelectedOption] = runtime.cursorPos;
        FillWindowPixelBuffer(runtime, 0, 1);
        runtime.operations.push(`AddTextPrinterParameterized2:0:FONT_NORMAL:${sMainMenuTexts[task.data[tSelectedOption]].desc}:0`);
        task.data[tState] = STATE_HANDLE_INPUT;
      } else if (runtime.newKeys & DPAD_DOWN) {
        if (++task.data[tSelectedOption] > 3) task.data[tSelectedOption] = 0;
        runtime.operations.push('Menu_MoveCursor:1');
        task.data[tSelectedOption] = runtime.cursorPos;
        FillWindowPixelBuffer(runtime, 0, 1);
        runtime.operations.push(`AddTextPrinterParameterized2:0:FONT_NORMAL:${sMainMenuTexts[task.data[tSelectedOption]].desc}:0`);
        task.data[tState] = STATE_HANDLE_INPUT;
      }
      break;
    case STATE_ENTER_PC:
      if (!runtime.paletteFadeActive) {
        runtime.operations.push('CleanupOverworldWindowsAndTilemaps');
        runtime.operations.push(`EnterPokeStorage:${task.data[tInput]}`);
        DestroyTask(runtime, taskId);
      }
      break;
  }
};

export const ShowPokemonStorageSystemPC = (runtime: StorageMenuRuntime): number => {
  const taskId = CreateTask(runtime, 80);
  runtime.tasks[taskId].data[tState] = STATE_LOAD;
  runtime.tasks[taskId].data[tSelectedOption] = 0;
  runtime.playerLocked = true;
  runtime.operations.push('LockPlayerFieldControls');
  return taskId;
};

export const FieldTask_ReturnToPcMenu = (runtime: StorageMenuRuntime): number => {
  const vblankCb = runtime.vblankCallback;
  runtime.vblankCallback = null;
  runtime.operations.push('SetVBlankCallback:NULL');
  const taskId = CreateTask(runtime, 80);
  runtime.tasks[taskId].data[tState] = STATE_LOAD;
  runtime.tasks[taskId].data[tSelectedOption] = runtime.sPreviousBoxOption;
  Task_PCMainMenu(runtime, taskId);
  runtime.vblankCallback = vblankCb;
  runtime.operations.push(`SetVBlankCallback:${vblankCb}`);
  runtime.operations.push('FadeInFromBlack');
  return taskId;
};

export const CB2_ExitPokeStorage = (runtime: StorageMenuRuntime): void => {
  runtime.sPreviousBoxOption = runtime.currentBox;
  runtime.gFieldCallback = 'FieldTask_ReturnToPcMenu';
  runtime.mainCallback2 = 'CB2_ReturnToField';
  runtime.operations.push('SetMainCallback2:CB2_ReturnToField');
};

export const ResetPokemonStorageSystem = (runtime: StorageMenuRuntime): void => {
  runtime.currentBox = 0;
  for (let boxId = 0; boxId < TOTAL_BOXES_COUNT; boxId += 1) {
    for (let boxPosition = 0; boxPosition < IN_BOX_COUNT; boxPosition += 1) runtime.boxes[boxId][boxPosition] = { species: SPECIES_NONE };
  }
  for (let boxId = 0; boxId < TOTAL_BOXES_COUNT; boxId += 1) runtime.boxNames[boxId] = `BOX${String(boxId + 1).padStart(2, ' ')}`;
  for (let boxId = 0; boxId < TOTAL_BOXES_COUNT; boxId += 1) runtime.boxWallpapers[boxId] = boxId % (MAX_DEFAULT_WALLPAPER + 1);
};

export const LoadChooseBoxMenuGfx = (runtime: StorageMenuRuntime, menu: ChooseBoxMenu, tileTag: number, palTag: number, subpriority: number, loadPal: boolean): void => {
  if (loadPal) runtime.operations.push(`LoadSpritePalette:${palTag}`);
  runtime.operations.push(`LoadSpriteSheets:${tileTag}:${tileTag + 1}`);
  runtime.sChooseBoxMenu = menu;
  menu.tileTag = tileTag;
  menu.paletteTag = palTag;
  menu.subpriority = subpriority;
  menu.loadedPalette = loadPal;
};

export const FreeBoxSelectionPopupSpriteGfx = (runtime: StorageMenuRuntime): void => {
  const menu = runtime.sChooseBoxMenu!;
  if (menu.loadedPalette) runtime.operations.push(`FreeSpritePaletteByTag:${menu.paletteTag}`);
  runtime.operations.push(`FreeSpriteTilesByTag:${menu.tileTag}`);
  runtime.operations.push(`FreeSpriteTilesByTag:${menu.tileTag + 1}`);
};

const createSprite = (runtime: StorageMenuRuntime, x: number, y: number, subpriority: number): StorageSprite => {
  const sprite: StorageSprite = { id: runtime.nextSpriteId++, x, y, x2: 0, subpriority, data: Array(8).fill(0), oam: { size: '64x64', paletteNum: 0 }, callback: 'SpriteCallbackDummy', destroyed: false, animNum: 0 };
  runtime.sprites.push(sprite);
  return sprite;
};

export const CreateChooseBoxMenuSprites = (runtime: StorageMenuRuntime, curBox: number): void => {
  const menu = runtime.sChooseBoxMenu!;
  menu.curBox = curBox;
  menu.menuSprite = createSprite(runtime, 160, 96, 0);
  menu.menuSprite.oam.paletteNum = 1;
  for (let i = 0; i < menu.menuCornerSprites.length; i += 1) {
    const sprite = createSprite(runtime, 124, 80, menu.subpriority);
    let animNum = 0;
    if (i & 2) {
      sprite.x = 196;
      animNum = 2;
    }
    if (i & 1) {
      sprite.y = 112;
      sprite.oam.size = '8x16';
      animNum += 1;
    } else sprite.oam.size = '8x32';
    sprite.animNum = animNum;
    menu.menuCornerSprites[i] = sprite;
  }
  for (let i = 0; i < menu.arrowSprites.length; i += 1) {
    const sprite = createSprite(runtime, 72 * i + 124, 88, menu.subpriority);
    sprite.data[0] = i === 0 ? -1 : 1;
    sprite.callback = 'SpriteCB_ChooseBoxArrow';
    menu.arrowSprites[i] = sprite;
  }
  ChooseBoxMenu_PrintBoxNameAndCount(runtime);
  ChooseBoxMenu_PrintTextToSprite(runtime, '/30', 5, 3);
};

export const ChooseBoxMenu_CreateSprites = CreateChooseBoxMenuSprites;

export const DestroyChooseBoxMenuSprites = (runtime: StorageMenuRuntime): void => {
  const menu = runtime.sChooseBoxMenu!;
  if (menu.menuSprite) {
    menu.menuSprite.destroyed = true;
    menu.menuSprite = null;
  }
  for (let i = 0; i < menu.menuCornerSprites.length; i += 1) {
    if (menu.menuCornerSprites[i]) menu.menuCornerSprites[i]!.destroyed = true;
    menu.menuCornerSprites[i] = null;
  }
  for (let i = 0; i < menu.arrowSprites.length; i += 1) if (menu.arrowSprites[i]) menu.arrowSprites[i]!.destroyed = true;
};

export const ChooseBoxMenu_DestroySprites = DestroyChooseBoxMenuSprites;

export const ChooseBoxMenu_MoveRight = (runtime: StorageMenuRuntime): void => {
  const menu = runtime.sChooseBoxMenu!;
  if (++menu.curBox >= TOTAL_BOXES_COUNT) menu.curBox = 0;
  ChooseBoxMenu_PrintBoxNameAndCount(runtime);
};

export const ChooseBoxMenu_MoveLeft = (runtime: StorageMenuRuntime): void => {
  const menu = runtime.sChooseBoxMenu!;
  menu.curBox = menu.curBox === 0 ? TOTAL_BOXES_COUNT - 1 : menu.curBox - 1;
  ChooseBoxMenu_PrintBoxNameAndCount(runtime);
};

export const ChooseBoxMenu_PrintBoxNameAndCount = (runtime: StorageMenuRuntime): void => {
  const menu = runtime.sChooseBoxMenu!;
  const numMonInBox = CountMonsInBox(runtime, menu.curBox);
  menu.strbuf = StringCopyAndFillWithSpaces(runtime, runtime.boxNames[menu.curBox], BOX_NAME_LENGTH);
  ChooseBoxMenu_PrintTextToSprite(runtime, menu.strbuf, 0, 1);
  menu.strbuf = String(numMonInBox).padStart(2, ' ');
  ChooseBoxMenu_PrintTextToSprite(runtime, menu.strbuf, 3, 3);
};

export const ChooseBoxMenu_PrintTextToSprite = (runtime: StorageMenuRuntime, str: string, x: number, y: number): void => {
  const menu = runtime.sChooseBoxMenu!;
  menu.printedText.push({ text: str, x, y });
  runtime.operations.push(`ChooseBoxMenu_PrintTextToSprite:${str}:${x}:${y}`);
};

export const HandleBoxChooseSelectionInput = (runtime: StorageMenuRuntime): number => {
  if (runtime.newKeys & B_BUTTON) {
    runtime.operations.push('PlaySE:SE_SELECT');
    return BOXID_CANCELED;
  }
  if (runtime.newKeys & A_BUTTON) {
    runtime.operations.push('PlaySE:SE_SELECT');
    return runtime.sChooseBoxMenu!.curBox;
  }
  if (runtime.newKeys & DPAD_LEFT) {
    runtime.operations.push('PlaySE:SE_SELECT');
    ChooseBoxMenu_MoveLeft(runtime);
  } else if (runtime.newKeys & DPAD_RIGHT) {
    runtime.operations.push('PlaySE:SE_SELECT');
    ChooseBoxMenu_MoveRight(runtime);
  }
  return BOXID_NONE_CHOSEN;
};

export const SpriteCB_ChooseBoxArrow = (sprite: StorageSprite): void => {
  if (++sprite.data[1] > 3) {
    sprite.data[1] = 0;
    sprite.x2 += sprite.data[0];
    if (++sprite.data[2] > 5) {
      sprite.data[2] = 0;
      sprite.x2 = 0;
    }
  }
};
