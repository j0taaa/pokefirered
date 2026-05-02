export const MAX_MON_ICONS = 40;
export const PARTY_SIZE = 6;
export const IN_BOX_ROWS = 5;
export const IN_BOX_COLUMNS = 6;
export const IN_BOX_COUNT = IN_BOX_ROWS * IN_BOX_COLUMNS;
export const TOTAL_BOXES_COUNT = 14;
export const SPECIES_NONE = 0;
export const OPTION_MOVE_ITEMS = 1;
export const MODE_PARTY = 0;
export const MODE_BOX = 1;
export const MODE_MOVE = 2;
export const RELEASE_ANIM_RELEASE = 0;
export const RELEASE_ANIM_COME_BACK = 1;
export const ST_OAM_OBJ_NORMAL = 0;
export const ST_OAM_OBJ_BLEND = 1;
export const ST_OAM_AFFINE_OFF = 0;
export const ST_OAM_AFFINE_NORMAL = 1;
export const DISPLAY_WIDTH = 240;
export const GFXTAG_BOX_TITLE = 0x102;
export const GFXTAG_BOX_TITLE_ALT = 0x103;
export const GFXTAG_BOX_SCROLL_ARROW = 0x104;

export interface StorageMon {
  species: number;
  personality: number;
  heldItem: number;
}

export interface StorageSprite {
  id: number;
  x: number;
  y: number;
  x2: number;
  y2: number;
  centerToCornerVecY: number;
  invisible: boolean;
  destroyed: boolean;
  callback: StorageCallbackName;
  subpriority: number;
  anim: number;
  affineAnim: number;
  affineAnimEnded: boolean;
  data: number[];
  oam: {
    objMode: number;
    priority: number;
    affineMode: number;
    matrixNum: number;
    tileNum: number;
    paletteNum: number;
  };
}

export type StorageCallbackName =
  | 'SpriteCallbackDummy'
  | 'SpriteCB_HeldMon'
  | 'SpriteCB_BoxMonIconScrollIn'
  | 'SpriteCB_BoxMonIconScrollOut'
  | 'SpriteCB_MovePartySpriteToNextSlot'
  | 'SpriteCB_IncomingBoxTitle'
  | 'SpriteCB_OutgoingBoxTitle'
  | 'SpriteCB_BoxScrollArrow'
  | 'Destroyed';

export interface StorageTask {
  id: number;
  func: 'Task_InitBox';
  data: number[];
  destroyed: boolean;
}

export interface PokemonStorageGraphicsRuntime {
  numIconsPerSpecies: number[];
  iconSpeciesList: number[];
  partySprites: Array<StorageSprite | null>;
  boxMonsSprites: Array<StorageSprite | null>;
  movingMonSprite: StorageSprite | null;
  movingMon: StorageMon;
  cursorSprite: StorageSprite;
  unusedField1: number;
  boxOption: number;
  currentBox: number;
  boxWallpapers: number[];
  boxes: StorageMon[][];
  playerParty: StorageMon[];
  boxSpecies: number[];
  boxPersonalities: number[];
  incomingBoxId: number;
  iconScrollState: number;
  iconScrollToBoxId: number;
  iconScrollDirection: number;
  iconScrollDistance: number;
  iconScrollSpeed: number;
  iconScrollNumIncoming: number;
  iconScrollCurColumn: number;
  iconScrollPos: number;
  numPartySpritesToCompact: number;
  shiftMonSpritePtr: { kind: 'party' | 'box'; index: number } | null;
  shiftTimer: number;
  releaseMonSpritePtr: { kind: 'party' | 'box' | 'move'; index: number } | null;
  wallpaperOffset: number;
  wallpaperBgTilemapBuffer: number[];
  wallpaperTilemap: number[];
  wallpaperLoadState: number;
  wallpaperLoadBoxId: number;
  wallpaperLoadDir: number;
  wallpaperPalBits: number;
  wallpaperChangeState: number;
  bg2_X: number;
  scrollSpeed: number;
  scrollTimer: number;
  scrollToBoxId: number;
  scrollDirection: number;
  scrollState: number;
  scrollUnused1: number;
  scrollUnused2: number;
  scrollUnused3: number;
  scrollUnused4: number;
  scrollUnused5: number;
  scrollUnused6: number;
  scrollToBoxIdUnused: number;
  scrollDirectionUnused: number;
  boxTitleText: string;
  boxNames: string[];
  boxTitleCycleId: number;
  boxTitlePalOffset: number;
  boxTitleAltPalOffset: number;
  curBoxTitleSprites: Array<StorageSprite | null>;
  nextBoxTitleSprites: Array<StorageSprite | null>;
  arrowSprites: Array<StorageSprite | null>;
  cursorOnBoxTitle: boolean;
  dmaBusy: boolean;
  paletteFadeActive: boolean;
  tasks: StorageTask[];
  sprites: StorageSprite[];
  operations: string[];
}

export const sBoxTitleColors: Array<[number, number]> = Array.from({ length: 16 }, () => [0x1ce7, 0x7fff]);

const createSpriteObject = (id: number, x: number, y: number, subpriority: number): StorageSprite => ({
  id,
  x,
  y,
  x2: 0,
  y2: 0,
  centerToCornerVecY: 0,
  invisible: false,
  destroyed: false,
  callback: 'SpriteCallbackDummy',
  subpriority,
  anim: 0,
  affineAnim: 0,
  affineAnimEnded: true,
  data: Array.from({ length: 8 }, () => 0),
  oam: { objMode: ST_OAM_OBJ_NORMAL, priority: 0, affineMode: ST_OAM_AFFINE_OFF, matrixNum: 0, tileNum: 0, paletteNum: 0 }
});

const emptyMon = (): StorageMon => ({ species: SPECIES_NONE, personality: 0, heldItem: 0 });

export const createPokemonStorageGraphicsRuntime = (overrides: Partial<PokemonStorageGraphicsRuntime> = {}): PokemonStorageGraphicsRuntime => {
  const cursor = createSpriteObject(0, 120, 80, 0);
  return {
    numIconsPerSpecies: Array.from({ length: MAX_MON_ICONS }, () => 0),
    iconSpeciesList: Array.from({ length: MAX_MON_ICONS }, () => SPECIES_NONE),
    partySprites: Array.from({ length: PARTY_SIZE }, () => null),
    boxMonsSprites: Array.from({ length: IN_BOX_COUNT }, () => null),
    movingMonSprite: null,
    movingMon: { species: 1, personality: 0x1234, heldItem: 0 },
    cursorSprite: cursor,
    unusedField1: 0,
    boxOption: 0,
    currentBox: 0,
    boxWallpapers: Array.from({ length: TOTAL_BOXES_COUNT }, (_, i) => i % 16),
    boxes: Array.from({ length: TOTAL_BOXES_COUNT }, () => Array.from({ length: IN_BOX_COUNT }, emptyMon)),
    playerParty: Array.from({ length: PARTY_SIZE }, emptyMon),
    boxSpecies: Array.from({ length: IN_BOX_COUNT }, () => SPECIES_NONE),
    boxPersonalities: Array.from({ length: IN_BOX_COUNT }, () => 0),
    incomingBoxId: 0,
    iconScrollState: 0,
    iconScrollToBoxId: 0,
    iconScrollDirection: 0,
    iconScrollDistance: 0,
    iconScrollSpeed: 0,
    iconScrollNumIncoming: 0,
    iconScrollCurColumn: 0,
    iconScrollPos: 0,
    numPartySpritesToCompact: 0,
    shiftMonSpritePtr: null,
    shiftTimer: 0,
    releaseMonSpritePtr: null,
    wallpaperOffset: 0,
    wallpaperBgTilemapBuffer: Array.from({ length: 0x800 }, () => 0),
    wallpaperTilemap: Array.from({ length: 20 * 18 }, () => 0),
    wallpaperLoadState: 0,
    wallpaperLoadBoxId: 0,
    wallpaperLoadDir: 0,
    wallpaperPalBits: 0,
    wallpaperChangeState: 0,
    bg2_X: 0,
    scrollSpeed: 0,
    scrollTimer: 0,
    scrollToBoxId: 0,
    scrollDirection: 0,
    scrollState: 0,
    scrollUnused1: 0,
    scrollUnused2: 0,
    scrollUnused3: 0,
    scrollUnused4: 0,
    scrollUnused5: 0,
    scrollUnused6: 0,
    scrollToBoxIdUnused: 0,
    scrollDirectionUnused: 0,
    boxTitleText: '',
    boxNames: Array.from({ length: TOTAL_BOXES_COUNT }, (_, i) => `BOX${i + 1}`),
    boxTitleCycleId: 0,
    boxTitlePalOffset: 0,
    boxTitleAltPalOffset: 0,
    curBoxTitleSprites: [null, null],
    nextBoxTitleSprites: [null, null],
    arrowSprites: [null, null],
    cursorOnBoxTitle: false,
    dmaBusy: false,
    paletteFadeActive: false,
    tasks: [],
    sprites: [cursor],
    operations: [],
    ...overrides
  };
};

const createSprite = (runtime: PokemonStorageGraphicsRuntime, x: number, y: number, subpriority: number): StorageSprite => {
  const sprite = createSpriteObject(runtime.sprites.length, x, y, subpriority);
  runtime.sprites.push(sprite);
  return sprite;
};

const ptrGet = (runtime: PokemonStorageGraphicsRuntime, ptr: { kind: 'party' | 'box' | 'move'; index: number } | null): StorageSprite | null => {
  if (ptr == null) return null;
  if (ptr.kind === 'party') return runtime.partySprites[ptr.index];
  if (ptr.kind === 'box') return runtime.boxMonsSprites[ptr.index];
  return runtime.movingMonSprite;
};

const ptrSet = (runtime: PokemonStorageGraphicsRuntime, ptr: { kind: 'party' | 'box' | 'move'; index: number } | null, sprite: StorageSprite | null): void => {
  if (ptr == null) return;
  if (ptr.kind === 'party') runtime.partySprites[ptr.index] = sprite;
  else if (ptr.kind === 'box') runtime.boxMonsSprites[ptr.index] = sprite;
  else runtime.movingMonSprite = sprite;
};

const getIconSpecies = (species: number, _personality: number): number => species;
const storageGetCurrentBox = (runtime: PokemonStorageGraphicsRuntime): number => runtime.currentBox;
const getBoxWallpaper = (runtime: PokemonStorageGraphicsRuntime, boxId: number): number => runtime.boxWallpapers[boxId] ?? 0;
const setBoxWallpaper = (runtime: PokemonStorageGraphicsRuntime, boxId: number, wallpaperId: number): void => {
  runtime.boxWallpapers[boxId] = wallpaperId;
};

export const InitMonIconFields = (runtime: PokemonStorageGraphicsRuntime): void => {
  runtime.operations.push('LoadMonIconPalettes');
  for (let i = 0; i < MAX_MON_ICONS; i++) runtime.numIconsPerSpecies[i] = 0;
  for (let i = 0; i < MAX_MON_ICONS; i++) runtime.iconSpeciesList[i] = SPECIES_NONE;
  for (let i = 0; i < PARTY_SIZE; i++) runtime.partySprites[i] = null;
  for (let i = 0; i < IN_BOX_COUNT; i++) runtime.boxMonsSprites[i] = null;
  runtime.movingMonSprite = null;
  runtime.unusedField1 = 0;
};

export const IsCursorInBox = (runtime: PokemonStorageGraphicsRuntime): boolean => runtime.cursorSprite.data[0] === MODE_BOX;
export const GetMonIconPriorityByCursorArea = (runtime: PokemonStorageGraphicsRuntime): number => (IsCursorInBox(runtime) ? 2 : 1);

export const TryLoadMonIconTiles = (runtime: PokemonStorageGraphicsRuntime, species: number): number => {
  let i = 0;
  for (; i < MAX_MON_ICONS; i++) {
    if (runtime.iconSpeciesList[i] === species) break;
  }
  if (i === MAX_MON_ICONS) {
    for (i = 0; i < MAX_MON_ICONS; i++) {
      if (runtime.iconSpeciesList[i] === SPECIES_NONE) break;
    }
    if (i === MAX_MON_ICONS) return 0xffff;
  }
  runtime.iconSpeciesList[i] = species;
  runtime.numIconsPerSpecies[i]++;
  const offset = 16 * i;
  runtime.operations.push(`CpuCopy32:GetMonIconTiles:${species}:${offset}`);
  return offset;
};

export const RemoveSpeciesFromIconList = (runtime: PokemonStorageGraphicsRuntime, species: number): void => {
  for (let i = 0; i < MAX_MON_ICONS; i++) {
    if (runtime.iconSpeciesList[i] === species) {
      if (--runtime.numIconsPerSpecies[i] === 0) runtime.iconSpeciesList[i] = SPECIES_NONE;
      break;
    }
  }
};

export const CreateMonIconSprite = (runtime: PokemonStorageGraphicsRuntime, species: number, personality: number, x: number, y: number, oamPriority: number, subpriority: number): StorageSprite | null => {
  const iconSpecies = getIconSpecies(species, personality);
  const tileNum = TryLoadMonIconTiles(runtime, iconSpecies);
  if (tileNum === 0xffff) return null;
  const sprite = createSprite(runtime, x, y, subpriority);
  sprite.oam.tileNum = tileNum;
  sprite.oam.priority = oamPriority;
  sprite.data[0] = iconSpecies;
  return sprite;
};

export const DestroyBoxMonIcon = (runtime: PokemonStorageGraphicsRuntime, sprite: StorageSprite): void => {
  RemoveSpeciesFromIconList(runtime, sprite.data[0]);
  sprite.destroyed = true;
  sprite.callback = 'Destroyed';
  runtime.operations.push(`DestroySprite:${sprite.id}`);
};

export const CreateMovingMonIcon = (runtime: PokemonStorageGraphicsRuntime): void => {
  const priority = GetMonIconPriorityByCursorArea(runtime);
  runtime.movingMonSprite = CreateMonIconSprite(runtime, runtime.movingMon.species, runtime.movingMon.personality, 0, 0, priority, 7);
  if (runtime.movingMonSprite != null) runtime.movingMonSprite.callback = 'SpriteCB_HeldMon';
};

export const InitBoxMonSprites = (runtime: PokemonStorageGraphicsRuntime, boxId: number): void => {
  let boxPosition = 0;
  let count = 0;
  for (let i = 0; i < IN_BOX_ROWS; i++) {
    for (let j = 0; j < IN_BOX_COLUMNS; j++) {
      const mon = runtime.boxes[boxId][boxPosition];
      if (mon.species !== SPECIES_NONE) runtime.boxMonsSprites[count] = CreateMonIconSprite(runtime, mon.species, mon.personality, 8 * (3 * j) + 100, 8 * (3 * i) + 44, 2, 19 - j);
      else runtime.boxMonsSprites[count] = null;
      boxPosition++;
      count++;
    }
  }
  if (runtime.boxOption === OPTION_MOVE_ITEMS) {
    for (boxPosition = 0; boxPosition < IN_BOX_COUNT; boxPosition++) {
      if (runtime.boxes[boxId][boxPosition].heldItem === 0 && runtime.boxMonsSprites[boxPosition] != null) runtime.boxMonsSprites[boxPosition]!.oam.objMode = ST_OAM_OBJ_BLEND;
    }
  }
};

export const CreateBoxMonIconAtPos = (runtime: PokemonStorageGraphicsRuntime, boxPosition: number): void => {
  const mon = runtime.boxes[runtime.currentBox][boxPosition];
  if (mon.species === SPECIES_NONE) return;
  const x = 8 * (3 * (boxPosition % IN_BOX_COLUMNS)) + 100;
  const y = 8 * (3 * Math.floor(boxPosition / IN_BOX_COLUMNS)) + 44;
  runtime.boxMonsSprites[boxPosition] = CreateMonIconSprite(runtime, mon.species, mon.personality, x, y, 2, 19 - (boxPosition % IN_BOX_COLUMNS));
  if (runtime.boxOption === OPTION_MOVE_ITEMS && runtime.boxMonsSprites[boxPosition] != null) runtime.boxMonsSprites[boxPosition]!.oam.objMode = ST_OAM_OBJ_BLEND;
};

export const StartBoxMonIconsScrollOut = (runtime: PokemonStorageGraphicsRuntime, speed: number): void => {
  for (let i = 0; i < IN_BOX_COUNT; i++) {
    const sprite = runtime.boxMonsSprites[i];
    if (sprite != null) {
      sprite.data[2] = speed;
      sprite.data[4] = 1;
      sprite.callback = 'SpriteCB_BoxMonIconScrollOut';
    }
  }
};

export const SpriteCB_BoxMonIconScrollIn = (runtime: PokemonStorageGraphicsRuntime, sprite: StorageSprite): void => {
  if (sprite.data[1] !== 0) {
    sprite.data[1]--;
    sprite.x += sprite.data[2];
  } else {
    runtime.iconScrollNumIncoming--;
    sprite.x = sprite.data[3];
    sprite.callback = 'SpriteCallbackDummy';
  }
};

export const SpriteCB_BoxMonIconScrollOut = (_runtime: PokemonStorageGraphicsRuntime, sprite: StorageSprite): void => {
  if (sprite.data[4] !== 0) sprite.data[4]--;
  else {
    sprite.x += sprite.data[2];
    sprite.data[5] = sprite.x + sprite.x2;
    if (sprite.data[5] <= 68 || sprite.data[5] >= 252) sprite.callback = 'SpriteCallbackDummy';
  }
};

export const DestroyAllIconsInColumn = (runtime: PokemonStorageGraphicsRuntime, column: number): void => {
  let boxPosition = column;
  for (let row = 0; row < IN_BOX_ROWS; row++) {
    const sprite = runtime.boxMonsSprites[boxPosition];
    if (sprite != null) {
      DestroyBoxMonIcon(runtime, sprite);
      runtime.boxMonsSprites[boxPosition] = null;
    }
    boxPosition += IN_BOX_COLUMNS;
  }
};

export const CreateBoxMonIconsInColumn = (runtime: PokemonStorageGraphicsRuntime, column: number, distance: number, speed: number): number => {
  let y = 44;
  const xDest = 8 * (3 * column) + 100;
  const x = xDest - ((distance + 1) * speed);
  const subpriority = 19 - column;
  let count = 0;
  let boxPosition = column;
  for (let i = 0; i < IN_BOX_ROWS; i++) {
    if (runtime.boxSpecies[boxPosition] !== SPECIES_NONE) {
      const sprite = CreateMonIconSprite(runtime, runtime.boxSpecies[boxPosition], runtime.boxPersonalities[boxPosition], x, y, 2, subpriority);
      runtime.boxMonsSprites[boxPosition] = sprite;
      if (sprite != null) {
        sprite.data[1] = distance;
        sprite.data[2] = speed;
        sprite.data[3] = xDest;
        sprite.callback = 'SpriteCB_BoxMonIconScrollIn';
        if (runtime.boxOption === OPTION_MOVE_ITEMS && runtime.boxes[runtime.incomingBoxId][boxPosition].heldItem === 0) sprite.oam.objMode = ST_OAM_OBJ_BLEND;
        count++;
      }
    }
    boxPosition += IN_BOX_COLUMNS;
    y += 24;
  }
  return count;
};

export const SetBoxSpeciesAndPersonalities = (runtime: PokemonStorageGraphicsRuntime, boxId: number): void => {
  let boxPosition = 0;
  for (let i = 0; i < IN_BOX_ROWS; i++) {
    for (let j = 0; j < IN_BOX_COLUMNS; j++) {
      const mon = runtime.boxes[boxId][boxPosition];
      runtime.boxSpecies[boxPosition] = mon.species;
      if (mon.species !== SPECIES_NONE) runtime.boxPersonalities[boxPosition] = mon.personality;
      boxPosition++;
    }
  }
  runtime.incomingBoxId = boxId;
};

export const InitBoxMonIconScroll = (runtime: PokemonStorageGraphicsRuntime, boxId: number, direction: number): void => {
  runtime.iconScrollState = 0;
  runtime.iconScrollToBoxId = boxId;
  runtime.iconScrollDirection = direction;
  runtime.iconScrollDistance = 32;
  runtime.iconScrollSpeed = -(6 * direction);
  runtime.iconScrollNumIncoming = 0;
  SetBoxSpeciesAndPersonalities(runtime, boxId);
  runtime.iconScrollCurColumn = direction > 0 ? 0 : IN_BOX_COLUMNS - 1;
  runtime.iconScrollPos = 24 * runtime.iconScrollCurColumn + 100;
  StartBoxMonIconsScrollOut(runtime, runtime.iconScrollSpeed);
};

export const UpdateBoxMonIconScroll = (runtime: PokemonStorageGraphicsRuntime): boolean => {
  if (runtime.iconScrollDistance !== 0) runtime.iconScrollDistance--;
  switch (runtime.iconScrollState) {
    case 0:
      runtime.iconScrollPos += runtime.iconScrollSpeed;
      if (runtime.iconScrollPos <= 64 || runtime.iconScrollPos >= 252) {
        DestroyAllIconsInColumn(runtime, runtime.iconScrollCurColumn);
        runtime.iconScrollPos += runtime.iconScrollDirection * 24;
        runtime.iconScrollState++;
      }
      break;
    case 1:
      runtime.iconScrollPos += runtime.iconScrollSpeed;
      runtime.iconScrollNumIncoming += CreateBoxMonIconsInColumn(runtime, runtime.iconScrollCurColumn, runtime.iconScrollDistance, runtime.iconScrollSpeed);
      if ((runtime.iconScrollDirection > 0 && runtime.iconScrollCurColumn === IN_BOX_COLUMNS - 1) || (runtime.iconScrollDirection < 0 && runtime.iconScrollCurColumn === 0)) runtime.iconScrollState++;
      else {
        runtime.iconScrollCurColumn += runtime.iconScrollDirection;
        runtime.iconScrollState = 0;
      }
      break;
    case 2:
      if (runtime.iconScrollNumIncoming === 0) {
        runtime.iconScrollDistance++;
        return false;
      }
      break;
    default:
      return false;
  }
  return true;
};

export const DestroyBoxMonIconAtPosition = (runtime: PokemonStorageGraphicsRuntime, boxPosition: number): void => {
  const sprite = runtime.boxMonsSprites[boxPosition];
  if (sprite != null) {
    DestroyBoxMonIcon(runtime, sprite);
    runtime.boxMonsSprites[boxPosition] = null;
  }
};

export const SetBoxMonIconObjMode = (runtime: PokemonStorageGraphicsRuntime, boxPosition: number, objMode: number): void => {
  if (runtime.boxMonsSprites[boxPosition] != null) runtime.boxMonsSprites[boxPosition]!.oam.objMode = objMode;
};

export const CreatePartyMonsSprites = (runtime: PokemonStorageGraphicsRuntime, visible: boolean): void => {
  const first = runtime.playerParty[0];
  runtime.partySprites[0] = CreateMonIconSprite(runtime, first.species, first.personality, 104, 64, 1, 12);
  let count = 1;
  for (let i = 1; i < PARTY_SIZE; i++) {
    const mon = runtime.playerParty[i];
    if (mon.species !== SPECIES_NONE) {
      runtime.partySprites[i] = CreateMonIconSprite(runtime, mon.species, mon.personality, 152, 8 * (3 * (i - 1)) + 16, 1, 12);
      count++;
    } else runtime.partySprites[i] = null;
  }
  if (!visible) {
    for (let i = 0; i < count; i++) {
      if (runtime.partySprites[i] != null) {
        runtime.partySprites[i]!.y -= 160;
        runtime.partySprites[i]!.invisible = true;
      }
    }
  }
  if (runtime.boxOption === OPTION_MOVE_ITEMS) {
    for (let i = 0; i < PARTY_SIZE; i++) {
      if (runtime.partySprites[i] != null && runtime.playerParty[i].heldItem === 0) runtime.partySprites[i]!.oam.objMode = ST_OAM_OBJ_BLEND;
    }
  }
};

export const MovePartySpriteToNextSlot = (sprite: StorageSprite, partyId: number): void => {
  const x = partyId === 0 ? 104 : 152;
  const y = partyId === 0 ? 64 : 8 * (3 * (partyId - 1)) + 16;
  sprite.data[1] = partyId;
  sprite.data[2] = sprite.x * 8;
  sprite.data[3] = sprite.y * 8;
  sprite.data[4] = (x * 8 - sprite.data[2]) / 8;
  sprite.data[5] = (y * 8 - sprite.data[3]) / 8;
  sprite.data[6] = 8;
  sprite.callback = 'SpriteCB_MovePartySpriteToNextSlot';
};

export const CompactPartySprites = (runtime: PokemonStorageGraphicsRuntime): void => {
  runtime.numPartySpritesToCompact = 0;
  let targetPartyId = 0;
  for (let i = 0; i < PARTY_SIZE; i++) {
    const sprite = runtime.partySprites[i];
    if (sprite != null) {
      if (i !== targetPartyId) {
        MovePartySpriteToNextSlot(sprite, targetPartyId);
        runtime.partySprites[i] = null;
        runtime.numPartySpritesToCompact++;
      }
      targetPartyId++;
    }
  }
};

export const SpriteCB_MovePartySpriteToNextSlot = (runtime: PokemonStorageGraphicsRuntime, sprite: StorageSprite): void => {
  if (sprite.data[6] !== 0) {
    const x = (sprite.data[2] += sprite.data[4]);
    const y = (sprite.data[3] += sprite.data[5]);
    sprite.x = Math.trunc(x / 8);
    sprite.y = Math.trunc(y / 8);
    sprite.data[6]--;
  } else {
    if (sprite.data[1] === 0) {
      sprite.x = 104;
      sprite.y = 64;
    } else {
      sprite.x = 152;
      sprite.y = 8 * (3 * (sprite.data[1] - 1)) + 16;
    }
    sprite.callback = 'SpriteCallbackDummy';
    runtime.partySprites[sprite.data[1]] = sprite;
    runtime.numPartySpritesToCompact--;
  }
};

export const GetNumPartySpritesCompacting = (runtime: PokemonStorageGraphicsRuntime): number => runtime.numPartySpritesToCompact;

export const DestroyMovingMonIcon = (runtime: PokemonStorageGraphicsRuntime): void => {
  if (runtime.movingMonSprite != null) {
    DestroyBoxMonIcon(runtime, runtime.movingMonSprite);
    runtime.movingMonSprite = null;
  }
};

export const MovePartySprites = (runtime: PokemonStorageGraphicsRuntime, yDelta: number): void => {
  for (let i = 0; i < PARTY_SIZE; i++) {
    const sprite = runtime.partySprites[i];
    if (sprite != null) {
      sprite.y += yDelta;
      let posY = sprite.y + sprite.y2 + sprite.centerToCornerVecY;
      posY += 16;
      sprite.invisible = posY > 192;
    }
  }
};

export const DestroyPartyMonIcon = (runtime: PokemonStorageGraphicsRuntime, partyId: number): void => {
  const sprite = runtime.partySprites[partyId];
  if (sprite != null) {
    DestroyBoxMonIcon(runtime, sprite);
    runtime.partySprites[partyId] = null;
  }
};

export const DestroyAllPartyMonIcons = (runtime: PokemonStorageGraphicsRuntime): void => {
  for (let i = 0; i < PARTY_SIZE; i++) DestroyPartyMonIcon(runtime, i);
};

export const SetPartyMonIconObjMode = (runtime: PokemonStorageGraphicsRuntime, partyId: number, objMode: number): void => {
  if (runtime.partySprites[partyId] != null) runtime.partySprites[partyId]!.oam.objMode = objMode;
};

export const SetMovingMonSprite = (runtime: PokemonStorageGraphicsRuntime, mode: number, id: number): void => {
  if (mode === MODE_PARTY) {
    runtime.movingMonSprite = runtime.partySprites[id];
    runtime.partySprites[id] = null;
  } else if (mode === MODE_BOX) {
    runtime.movingMonSprite = runtime.boxMonsSprites[id];
    runtime.boxMonsSprites[id] = null;
  } else return;
  if (runtime.movingMonSprite == null) return;
  runtime.movingMonSprite.callback = 'SpriteCB_HeldMon';
  runtime.movingMonSprite.oam.priority = GetMonIconPriorityByCursorArea(runtime);
  runtime.movingMonSprite.subpriority = 7;
};

export const SetPlacedMonSprite = (runtime: PokemonStorageGraphicsRuntime, boxId: number, position: number): void => {
  if (runtime.movingMonSprite == null) return;
  if (boxId === TOTAL_BOXES_COUNT) {
    runtime.partySprites[position] = runtime.movingMonSprite;
    runtime.partySprites[position]!.oam.priority = 1;
    runtime.partySprites[position]!.subpriority = 12;
  } else {
    runtime.boxMonsSprites[position] = runtime.movingMonSprite;
    runtime.boxMonsSprites[position]!.oam.priority = 2;
    runtime.boxMonsSprites[position]!.subpriority = 19 - (position % IN_BOX_COLUMNS);
  }
  runtime.movingMonSprite.callback = 'SpriteCallbackDummy';
  runtime.movingMonSprite = null;
};

export const SetShiftMonSpritePtr = (runtime: PokemonStorageGraphicsRuntime, boxId: number, position: number): void => {
  runtime.shiftMonSpritePtr = boxId === TOTAL_BOXES_COUNT ? { kind: 'party', index: position } : { kind: 'box', index: position };
  if (runtime.movingMonSprite != null) runtime.movingMonSprite.callback = 'SpriteCallbackDummy';
  runtime.shiftTimer = 0;
};

const sine = (index: number): number => Math.round(Math.sin((index / 256) * 2 * Math.PI) * 256);

export const ShiftMons = (runtime: PokemonStorageGraphicsRuntime): boolean => {
  const target = ptrGet(runtime, runtime.shiftMonSpritePtr);
  if (runtime.shiftTimer === 16) return false;
  if (target == null || runtime.movingMonSprite == null) return true;
  runtime.shiftTimer++;
  if (runtime.shiftTimer & 1) {
    target.y--;
    runtime.movingMonSprite.y++;
  }
  target.x2 = Math.trunc(sine(runtime.shiftTimer * 8) / 16);
  runtime.movingMonSprite.x2 = -Math.trunc(sine(runtime.shiftTimer * 8) / 16);
  if (runtime.shiftTimer === 8) {
    runtime.movingMonSprite.oam.priority = target.oam.priority;
    runtime.movingMonSprite.subpriority = target.subpriority;
    target.oam.priority = GetMonIconPriorityByCursorArea(runtime);
    target.subpriority = 7;
  }
  if (runtime.shiftTimer === 16) {
    const sprite = runtime.movingMonSprite;
    runtime.movingMonSprite = target;
    ptrSet(runtime, runtime.shiftMonSpritePtr, sprite);
    runtime.movingMonSprite.callback = 'SpriteCB_HeldMon';
    sprite.callback = 'SpriteCallbackDummy';
  }
  return true;
};

export const DoReleaseMonAnim = (runtime: PokemonStorageGraphicsRuntime, mode: number, position: number): void => {
  if (mode === MODE_PARTY) runtime.releaseMonSpritePtr = { kind: 'party', index: position };
  else if (mode === MODE_BOX) runtime.releaseMonSpritePtr = { kind: 'box', index: position };
  else if (mode === MODE_MOVE) runtime.releaseMonSpritePtr = { kind: 'move', index: 0 };
  else return;
  const sprite = ptrGet(runtime, runtime.releaseMonSpritePtr);
  if (sprite != null) {
    sprite.oam.affineMode = ST_OAM_AFFINE_NORMAL;
    sprite.affineAnim = RELEASE_ANIM_RELEASE;
    sprite.affineAnimEnded = false;
  }
};

export const TryHideReleaseMonSprite = (runtime: PokemonStorageGraphicsRuntime): boolean => {
  const sprite = ptrGet(runtime, runtime.releaseMonSpritePtr);
  if (sprite == null || sprite.invisible) return false;
  if (sprite.affineAnimEnded) sprite.invisible = true;
  return true;
};

export const DestroyReleaseMonIcon = (runtime: PokemonStorageGraphicsRuntime): void => {
  const sprite = ptrGet(runtime, runtime.releaseMonSpritePtr);
  if (sprite != null) {
    runtime.operations.push(`FreeOamMatrix:${sprite.oam.matrixNum}`);
    DestroyBoxMonIcon(runtime, sprite);
    ptrSet(runtime, runtime.releaseMonSpritePtr, null);
  }
};

export const DoReleaseMonComeBackAnim = (runtime: PokemonStorageGraphicsRuntime): void => {
  const sprite = ptrGet(runtime, runtime.releaseMonSpritePtr);
  if (sprite != null) {
    sprite.invisible = false;
    sprite.affineAnim = RELEASE_ANIM_COME_BACK;
    sprite.affineAnimEnded = false;
  }
};

export const ResetReleaseMonSpritePtr = (runtime: PokemonStorageGraphicsRuntime): boolean => {
  if (runtime.releaseMonSpritePtr == null) return false;
  const sprite = ptrGet(runtime, runtime.releaseMonSpritePtr);
  if (sprite?.affineAnimEnded) runtime.releaseMonSpritePtr = null;
  return true;
};

export const SetMovingMonPriority = (runtime: PokemonStorageGraphicsRuntime, priority: number): void => {
  if (runtime.movingMonSprite != null) runtime.movingMonSprite.oam.priority = priority;
};

export const SpriteCB_HeldMon = (runtime: PokemonStorageGraphicsRuntime, sprite: StorageSprite): void => {
  sprite.x = runtime.cursorSprite.x;
  sprite.y = runtime.cursorSprite.y + runtime.cursorSprite.y2 + 4;
};

export const DetermineBoxScrollDirection = (runtime: PokemonStorageGraphicsRuntime, boxId: number): number => {
  let i = 0;
  let currentBox = storageGetCurrentBox(runtime);
  for (; currentBox !== boxId; i++) {
    currentBox++;
    if (currentBox >= TOTAL_BOXES_COUNT) currentBox = 0;
  }
  return i < TOTAL_BOXES_COUNT / 2 ? 1 : -1;
};

export const CreateInitBoxTask = (runtime: PokemonStorageGraphicsRuntime, boxId: number): void => {
  const task: StorageTask = { id: runtime.tasks.length, func: 'Task_InitBox', data: Array.from({ length: 16 }, () => 0), destroyed: false };
  task.data[2] = boxId;
  runtime.tasks.push(task);
};

export const IsInitBoxActive = (runtime: PokemonStorageGraphicsRuntime): boolean => runtime.tasks.some((task) => task.func === 'Task_InitBox' && !task.destroyed);

export const Task_InitBox = (runtime: PokemonStorageGraphicsRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  switch (task.data[0]) {
    case 0:
      runtime.wallpaperOffset = 0;
      runtime.bg2_X = 0;
      task.data[1] = 1;
      runtime.operations.push('RequestDma3Fill:wallpaperBgTilemapBuffer');
      break;
    case 1:
      if (runtime.dmaBusy) return;
      runtime.operations.push('SetBgTilemapBuffer:2', 'ShowBg:2');
      break;
    case 2:
      LoadWallpaperGfx(runtime, task.data[2], 0);
      break;
    case 3:
      if (!WaitForWallpaperGfxLoad(runtime)) return;
      InitBoxTitle(runtime, task.data[2]);
      CreateBoxScrollArrows(runtime);
      InitBoxMonSprites(runtime, task.data[2]);
      runtime.operations.push('SetGpuReg:BG2CNT');
      break;
    case 4:
      task.destroyed = true;
      break;
    default:
      task.data[0] = 0;
      return;
  }
  task.data[0]++;
};

export const SetUpScrollToBox = (runtime: PokemonStorageGraphicsRuntime, boxId: number): void => {
  const direction = DetermineBoxScrollDirection(runtime, boxId);
  runtime.scrollSpeed = direction > 0 ? 6 : -6;
  runtime.scrollUnused1 = direction > 0 ? 1 : 2;
  runtime.scrollTimer = 32;
  runtime.scrollToBoxIdUnused = boxId;
  runtime.scrollUnused2 = direction <= 0 ? 5 : 0;
  runtime.scrollDirectionUnused = direction;
  runtime.scrollUnused3 = direction > 0 ? 264 : 56;
  runtime.scrollUnused4 = direction <= 0 ? 5 : 0;
  runtime.scrollUnused5 = 0;
  runtime.scrollUnused6 = 2;
  runtime.scrollToBoxId = boxId;
  runtime.scrollDirection = direction;
  runtime.scrollState = 0;
};

export const ScrollToBox = (runtime: PokemonStorageGraphicsRuntime): boolean => {
  let isStillScrolling = true;
  switch (runtime.scrollState) {
    case 0:
      LoadWallpaperGfx(runtime, runtime.scrollToBoxId, runtime.scrollDirection);
      runtime.scrollState++;
    // fallthrough
    case 1:
      if (!WaitForWallpaperGfxLoad(runtime)) return true;
      InitBoxMonIconScroll(runtime, runtime.scrollToBoxId, runtime.scrollDirection);
      CreateIncomingBoxTitle(runtime, runtime.scrollToBoxId, runtime.scrollDirection);
      StartBoxScrollArrowsSlide(runtime, runtime.scrollDirection);
      break;
    case 2:
      isStillScrolling = UpdateBoxMonIconScroll(runtime);
      if (runtime.scrollTimer !== 0) {
        runtime.bg2_X += runtime.scrollSpeed;
        if (--runtime.scrollTimer !== 0) return true;
        CycleBoxTitleSprites(runtime);
        StopBoxScrollArrowsSlide(runtime);
      }
      return isStillScrolling;
  }
  runtime.scrollState++;
  return true;
};

export const SetWallpaperForCurrentBox = (runtime: PokemonStorageGraphicsRuntime, wallpaperId: number): void => {
  setBoxWallpaper(runtime, storageGetCurrentBox(runtime), wallpaperId);
  runtime.wallpaperChangeState = 0;
};

export const DoWallpaperGfxChange = (runtime: PokemonStorageGraphicsRuntime): boolean => {
  switch (runtime.wallpaperChangeState) {
    case 0:
      runtime.paletteFadeActive = true;
      runtime.operations.push(`BeginNormalPaletteFade:${runtime.wallpaperPalBits}:1:0:16`);
      runtime.wallpaperChangeState++;
      break;
    case 1:
      if (!runtime.paletteFadeActive) {
        LoadWallpaperGfx(runtime, storageGetCurrentBox(runtime), 0);
        runtime.wallpaperChangeState++;
      }
      break;
    case 2:
      if (WaitForWallpaperGfxLoad(runtime)) {
        CycleBoxTitleColor(runtime);
        runtime.paletteFadeActive = true;
        runtime.operations.push(`BeginNormalPaletteFade:${runtime.wallpaperPalBits}:1:16:0`);
        runtime.wallpaperChangeState++;
      }
      break;
    case 3:
      if (!runtime.paletteFadeActive) runtime.wallpaperChangeState++;
      break;
    case 4:
      return false;
  }
  return true;
};

export const LoadWallpaperGfx = (runtime: PokemonStorageGraphicsRuntime, boxId: number, direction: number): void => {
  runtime.wallpaperLoadState = 0;
  runtime.wallpaperLoadBoxId = boxId;
  runtime.wallpaperLoadDir = direction;
  if (direction !== 0) {
    runtime.wallpaperOffset = runtime.wallpaperOffset ? 0 : 1;
    TrimOldWallpaper(runtime);
  }
  const wallpaperId = getBoxWallpaper(runtime, boxId);
  DrawWallpaper(runtime, direction, runtime.wallpaperOffset);
  runtime.operations.push(direction !== 0 ? `LoadPalette:wallpaper:${wallpaperId}:${runtime.wallpaperOffset}` : `CpuCopy16:wallpaperPalette:${wallpaperId}:${runtime.wallpaperOffset}`);
  runtime.operations.push(`DecompressAndLoadBgGfxUsingHeap:2:${wallpaperId}:${256 * runtime.wallpaperOffset}`, 'CopyBgTilemapBufferToVram:2');
};

export const WaitForWallpaperGfxLoad = (runtime: PokemonStorageGraphicsRuntime): boolean => !runtime.dmaBusy;

export const DrawWallpaper = (runtime: PokemonStorageGraphicsRuntime, direction: number, offset: number): void => {
  const paletteNum = offset * 2 + 3;
  let x = ((Math.trunc(runtime.bg2_X / 8) + 10 + direction * 24) & 0x3f);
  runtime.operations.push(`CopyRectToBgTilemapBufferRect:2:${x}:2:20:18:${offset << 8}:${paletteNum}`);
  if (direction === 0) return;
  if (direction > 0) x += 20;
  else x -= 4;
  runtime.operations.push(`FillBgTilemapBufferRect:2:${x}:2:4:18`);
};

export const TrimOldWallpaper = (runtime: PokemonStorageGraphicsRuntime): void => {
  let right = ((Math.trunc(runtime.bg2_X / 8) + 10 + 20) & 0x3f);
  let dest = right < 32 ? right + 0x260 : right + 0x640;
  for (let i = 0; i < 44; i++) {
    runtime.wallpaperBgTilemapBuffer[dest++] = 0;
    right = (right + 1) & 0x3f;
    if (right === 0) dest -= 0x420;
    if (right === 32) dest += 0x3e0;
  }
};

export const GetBoxTitleBaseX = (boxName: string): number => DISPLAY_WIDTH - 64 - Math.trunc(boxName.length * 8 / 2);

export const InitBoxTitle = (runtime: PokemonStorageGraphicsRuntime, boxId: number): void => {
  const wallpaperId = getBoxWallpaper(runtime, boxId);
  runtime.wallpaperPalBits = 0x3f0;
  runtime.boxTitlePalOffset = 14;
  runtime.boxTitleAltPalOffset = 14;
  runtime.wallpaperPalBits |= 1 << 16;
  runtime.boxTitleText = runtime.boxNames[boxId].padEnd(8, '\0').slice(0, 8);
  const x = GetBoxTitleBaseX(runtime.boxNames[boxId]);
  for (let i = 0; i < 2; i++) {
    const sprite = createSprite(runtime, x + i * 32, 28, 24);
    runtime.curBoxTitleSprites[i] = sprite;
    sprite.anim = i;
  }
  runtime.boxTitleCycleId = 0;
  runtime.operations.push(`LoadSpritePalettes:boxTitle:${wallpaperId}`, 'LoadSpriteSheet:boxTitle');
};

export const CreateIncomingBoxTitle = (runtime: PokemonStorageGraphicsRuntime, boxId: number, direction: number): void => {
  runtime.boxTitleCycleId = runtime.boxTitleCycleId ? 0 : 1;
  const tag = runtime.boxTitleCycleId === 0 ? GFXTAG_BOX_TITLE : GFXTAG_BOX_TITLE_ALT;
  runtime.boxTitleText = runtime.boxNames[boxId].padEnd(8, '\0').slice(0, 8);
  runtime.operations.push(`LoadSpriteSheet:${tag}`, `LoadPalette:boxTitle:${getBoxWallpaper(runtime, boxId)}`);
  const x = GetBoxTitleBaseX(runtime.boxNames[boxId]);
  const adjustedX = x + direction * 192;
  for (let i = 0; i < 2; i++) {
    const sprite = createSprite(runtime, i * 32 + adjustedX, 28, 24);
    runtime.nextBoxTitleSprites[i] = sprite;
    sprite.data[0] = -direction * 6;
    sprite.data[1] = i * 32 + x;
    sprite.data[2] = 0;
    sprite.callback = 'SpriteCB_IncomingBoxTitle';
    sprite.anim = i;
    const cur = runtime.curBoxTitleSprites[i];
    if (cur != null) {
      cur.data[0] = -direction * 6;
      cur.data[1] = 1;
      cur.callback = 'SpriteCB_OutgoingBoxTitle';
    }
  }
};

export const CycleBoxTitleSprites = (runtime: PokemonStorageGraphicsRuntime): void => {
  runtime.operations.push(runtime.boxTitleCycleId === 0 ? `FreeSpriteTilesByTag:${GFXTAG_BOX_TITLE_ALT}` : `FreeSpriteTilesByTag:${GFXTAG_BOX_TITLE}`);
  runtime.curBoxTitleSprites[0] = runtime.nextBoxTitleSprites[0];
  runtime.curBoxTitleSprites[1] = runtime.nextBoxTitleSprites[1];
};

export const SpriteCB_IncomingBoxTitle = (_runtime: PokemonStorageGraphicsRuntime, sprite: StorageSprite): void => {
  if (sprite.data[2] !== 0) sprite.data[2]--;
  else if ((sprite.x += sprite.data[0]) === sprite.data[1]) sprite.callback = 'SpriteCallbackDummy';
};

export const SpriteCB_OutgoingBoxTitle = (_runtime: PokemonStorageGraphicsRuntime, sprite: StorageSprite): void => {
  if (sprite.data[1] !== 0) sprite.data[1]--;
  else {
    sprite.x += sprite.data[0];
    sprite.data[2] = sprite.x + sprite.x2;
    if (sprite.data[2] < 0x40 || sprite.data[2] > 0x100) {
      sprite.destroyed = true;
      sprite.callback = 'Destroyed';
    }
  }
};

export const CycleBoxTitleColor = (runtime: PokemonStorageGraphicsRuntime): void => {
  const boxId = storageGetCurrentBox(runtime);
  const wallpaperId = getBoxWallpaper(runtime, boxId);
  runtime.operations.push(`CpuCopy16:boxTitleColor:${wallpaperId}:${runtime.boxTitleCycleId === 0 ? runtime.boxTitlePalOffset : runtime.boxTitleAltPalOffset}`);
};

export const CreateBoxScrollArrows = (runtime: PokemonStorageGraphicsRuntime): void => {
  runtime.operations.push(`LoadSpriteSheet:${GFXTAG_BOX_SCROLL_ARROW}`);
  for (let i = 0; i < 2; i++) {
    const sprite = createSprite(runtime, 92 + i * 136, 28, 22);
    sprite.anim = i;
    sprite.data[3] = i === 0 ? -1 : 1;
    sprite.callback = 'SpriteCB_BoxScrollArrow';
    runtime.arrowSprites[i] = sprite;
  }
  if (runtime.cursorOnBoxTitle) AnimateBoxScrollArrows(runtime, true);
};

export const StartBoxScrollArrowsSlide = (runtime: PokemonStorageGraphicsRuntime, direction: number): void => {
  for (let i = 0; i < 2; i++) {
    const sprite = runtime.arrowSprites[i];
    if (sprite == null) continue;
    sprite.x2 = 0;
    sprite.data[0] = 2;
  }
  if (direction < 0) {
    runtime.arrowSprites[0]!.data[1] = 29;
    runtime.arrowSprites[1]!.data[1] = 5;
    runtime.arrowSprites[0]!.data[2] = 72;
    runtime.arrowSprites[1]!.data[2] = 72;
  } else {
    runtime.arrowSprites[0]!.data[1] = 5;
    runtime.arrowSprites[1]!.data[1] = 29;
    runtime.arrowSprites[0]!.data[2] = DISPLAY_WIDTH + 8;
    runtime.arrowSprites[1]!.data[2] = DISPLAY_WIDTH + 8;
  }
  runtime.arrowSprites[0]!.data[7] = 0;
  runtime.arrowSprites[1]!.data[7] = 1;
};

export const StopBoxScrollArrowsSlide = (runtime: PokemonStorageGraphicsRuntime): void => {
  for (let i = 0; i < 2; i++) {
    const sprite = runtime.arrowSprites[i];
    if (sprite == null) continue;
    sprite.x = 136 * i + 92;
    sprite.x2 = 0;
    sprite.invisible = false;
  }
  AnimateBoxScrollArrows(runtime, true);
};

export const AnimateBoxScrollArrows = (runtime: PokemonStorageGraphicsRuntime, animate: boolean): void => {
  for (let i = 0; i < 2; i++) {
    const sprite = runtime.arrowSprites[i];
    if (sprite == null) continue;
    if (animate) {
      sprite.data[0] = 1;
      sprite.data[1] = 0;
      sprite.data[2] = 0;
      sprite.data[4] = 0;
    } else {
      sprite.data[0] = 0;
    }
  }
};

export const SpriteCB_BoxScrollArrow = (runtime: PokemonStorageGraphicsRuntime, sprite: StorageSprite): void => {
  switch (sprite.data[0]) {
    case 0:
      sprite.x2 = 0;
      break;
    case 1:
      if (++sprite.data[1] > 3) {
        sprite.data[1] = 0;
        sprite.x2 += sprite.data[3];
        if (++sprite.data[2] > 5) {
          sprite.data[2] = 0;
          sprite.x2 = 0;
        }
      }
      break;
    case 2:
      sprite.data[0] = 3;
      break;
    case 3:
      sprite.x -= runtime.scrollSpeed;
      if (sprite.x <= 72 || sprite.x >= DISPLAY_WIDTH + 8) sprite.invisible = true;
      if (--sprite.data[1] === 0) {
        sprite.x = sprite.data[2];
        sprite.invisible = false;
        sprite.data[0] = 4;
      }
      break;
    case 4:
      sprite.x -= runtime.scrollSpeed;
      break;
  }
};

export const CreateChooseBoxArrows = (runtime: PokemonStorageGraphicsRuntime, x: number, y: number, animId: number, priority: number, subpriority: number): StorageSprite | null => {
  const sprite = createSprite(runtime, x, y, subpriority);
  sprite.anim = animId % 2;
  sprite.oam.priority = priority;
  sprite.callback = 'SpriteCallbackDummy';
  return sprite;
};
