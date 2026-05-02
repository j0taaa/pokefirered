export const PICS_COUNT = 8;
export const TAG_NONE = 0xffff;
export const MALE = 0;
export const FACILITY_CLASS_RED = 0;
export const FACILITY_CLASS_LEAF = 1;
export const gFacilityClassToPicIndex = [0, 1] as const;

export interface SpriteFrameImage {
  dataOffset: number;
  size: number;
}

export interface PicData {
  frames: Uint8Array | null;
  images: SpriteFrameImage[] | null;
  paletteTag: number;
  spriteId: number;
  active: boolean;
}

export interface PicSprite {
  id: number;
  x: number;
  y: number;
  oam: { paletteNum: number };
  destroyed: boolean;
}

export interface CreatingSpriteTemplate {
  tileTag: number;
  paletteTag: number;
  oam: string;
  anims: string;
  images: SpriteFrameImage[] | null;
  affineAnims: string;
  callback: string;
}

export interface TrainerPokemonSpritesRuntime {
  creatingSpriteTemplate: CreatingSpriteTemplate;
  spritePics: PicData[];
  sprites: PicSprite[];
  allocationsFailAt: Set<string>;
  decompressions: {
    species: number;
    personality: number;
    isFrontPic: boolean;
    isTrainer: boolean;
    ignoreDeoxys: boolean;
    destSize: number;
  }[];
  decompressionShouldFail: boolean;
  loadedPalettes: { kind: 'compressed' | 'sprite'; source: string; slotOrTag: number; size?: number }[];
  freedFrameBuffers: number;
  freedImageBuffers: number;
  freedSpritePaletteTags: number[];
  blits: { windowId: number; destX: number; destY: number; width: number; height: number }[];
  windowTileData: Map<number, Uint8Array>;
}

const dummyPicData = (): PicData => ({
  frames: null,
  images: null,
  paletteTag: 0,
  spriteId: 0,
  active: false
});

export const createTrainerPokemonSpritesRuntime = (): TrainerPokemonSpritesRuntime => ({
  creatingSpriteTemplate: {
    tileTag: TAG_NONE,
    paletteTag: 0,
    oam: '',
    anims: '',
    images: null,
    affineAnims: '',
    callback: ''
  },
  spritePics: Array.from({ length: PICS_COUNT }, () => dummyPicData()),
  sprites: [],
  allocationsFailAt: new Set(),
  decompressions: [],
  decompressionShouldFail: false,
  loadedPalettes: [],
  freedFrameBuffers: 0,
  freedImageBuffers: 0,
  freedSpritePaletteTags: [],
  blits: [],
  windowTileData: new Map()
});

export const dummyPicSpriteCallback = (_sprite: PicSprite): void => {};

export const resetAllPicSprites = (runtime: TrainerPokemonSpritesRuntime): boolean => {
  for (let i = 0; i < PICS_COUNT; i += 1) {
    runtime.spritePics[i] = dummyPicData();
  }
  return false;
};

export const decompressPic = (
  runtime: TrainerPokemonSpritesRuntime,
  species: number,
  personality: number,
  isFrontPic: boolean,
  dest: Uint8Array,
  isTrainer: boolean,
  ignoreDeoxys: boolean
): boolean => {
  runtime.decompressions.push({ species, personality, isFrontPic, isTrainer, ignoreDeoxys, destSize: dest.length });
  if (runtime.decompressionShouldFail) {
    return true;
  }
  dest.fill((species + (isFrontPic ? 1 : 2) + (isTrainer ? 4 : 0) + (ignoreDeoxys ? 8 : 0)) & 0xff);
  return false;
};

export const decompressPicHandleDeoxys = (
  runtime: TrainerPokemonSpritesRuntime,
  species: number,
  personality: number,
  isFrontPic: boolean,
  dest: Uint8Array,
  isTrainer: boolean
): boolean => decompressPic(runtime, species, personality, isFrontPic, dest, isTrainer, false);

export const loadPicPaletteByTagOrSlot = (
  runtime: TrainerPokemonSpritesRuntime,
  species: number,
  otId: number,
  personality: number,
  paletteSlot: number,
  paletteTag: number,
  isTrainer: boolean
): void => {
  if (!isTrainer) {
    if (paletteTag === TAG_NONE) {
      runtime.creatingSpriteTemplate.paletteTag = TAG_NONE;
      runtime.loadedPalettes.push({ kind: 'compressed', source: `mon:${species}:${otId}:${personality}`, slotOrTag: paletteSlot, size: 32 });
    } else {
      runtime.creatingSpriteTemplate.paletteTag = paletteTag;
      runtime.loadedPalettes.push({ kind: 'sprite', source: `monStruct:${species}:${otId}:${personality}`, slotOrTag: paletteTag });
    }
  } else if (paletteTag === TAG_NONE) {
    runtime.creatingSpriteTemplate.paletteTag = TAG_NONE;
    runtime.loadedPalettes.push({ kind: 'compressed', source: `trainer:${species}`, slotOrTag: paletteSlot, size: 32 });
  } else {
    runtime.creatingSpriteTemplate.paletteTag = paletteTag;
    runtime.loadedPalettes.push({ kind: 'sprite', source: `trainerStruct:${species}`, slotOrTag: paletteTag });
  }
};

export const loadPicPaletteBySlot = (
  runtime: TrainerPokemonSpritesRuntime,
  species: number,
  otId: number,
  personality: number,
  paletteSlot: number,
  isTrainer: boolean
): void => {
  runtime.loadedPalettes.push({
    kind: 'compressed',
    source: isTrainer ? `trainer:${species}` : `mon:${species}:${otId}:${personality}`,
    slotOrTag: paletteSlot,
    size: 32
  });
};

export const assignSpriteAnimsTable = (
  runtime: TrainerPokemonSpritesRuntime,
  isTrainer: boolean
): void => {
  runtime.creatingSpriteTemplate.anims = !isTrainer ? 'gAnims_MonPic' : 'gTrainerFrontAnimsPtrTable[0]';
};

const allocFrames = (runtime: TrainerPokemonSpritesRuntime): Uint8Array | null =>
  runtime.allocationsFailAt.has('frames') ? null : new Uint8Array(4 * 0x800);

const allocImages = (runtime: TrainerPokemonSpritesRuntime): SpriteFrameImage[] | null =>
  runtime.allocationsFailAt.has('images')
    ? null
    : Array.from({ length: 4 }, () => ({ dataOffset: 0, size: 0 }));

const createSprite = (runtime: TrainerPokemonSpritesRuntime, x: number, y: number): number => {
  const id = runtime.sprites.length;
  runtime.sprites.push({ id, x, y, oam: { paletteNum: 0 }, destroyed: false });
  return id;
};

export const createPicSprite = (
  runtime: TrainerPokemonSpritesRuntime,
  species: number,
  otId: number,
  personality: number,
  isFrontPic: boolean,
  x: number,
  y: number,
  paletteSlot: number,
  paletteTag: number,
  isTrainer: boolean,
  ignoreDeoxys: boolean
): number => {
  let i = 0;
  for (; i < PICS_COUNT; i += 1) {
    if (!runtime.spritePics[i].active) {
      break;
    }
  }
  if (i === PICS_COUNT) {
    return TAG_NONE;
  }

  const framePics = allocFrames(runtime);
  if (framePics === null) {
    return TAG_NONE;
  }
  const images = allocImages(runtime);
  if (images === null) {
    runtime.freedFrameBuffers += 1;
    return TAG_NONE;
  }
  if (decompressPic(runtime, species, personality, isFrontPic, framePics, isTrainer, ignoreDeoxys)) {
    return TAG_NONE;
  }
  for (let j = 0; j < 4; j += 1) {
    images[j].dataOffset = 0x800 * j;
    images[j].size = 0x800;
  }
  runtime.creatingSpriteTemplate.tileTag = TAG_NONE;
  runtime.creatingSpriteTemplate.oam = 'sOamData_Normal';
  assignSpriteAnimsTable(runtime, isTrainer);
  runtime.creatingSpriteTemplate.images = images;
  runtime.creatingSpriteTemplate.affineAnims = 'gDummySpriteAffineAnimTable';
  runtime.creatingSpriteTemplate.callback = 'DummyPicSpriteCallback';
  loadPicPaletteByTagOrSlot(runtime, species, otId, personality, paletteSlot, paletteTag, isTrainer);
  const spriteId = createSprite(runtime, x, y);
  if (paletteTag === TAG_NONE) {
    runtime.sprites[spriteId].oam.paletteNum = paletteSlot;
  }
  runtime.spritePics[i] = { frames: framePics, images, paletteTag, spriteId, active: true };
  return spriteId;
};

export const createPicSpriteHandleDeoxys = (
  runtime: TrainerPokemonSpritesRuntime,
  species: number,
  otId: number,
  personality: number,
  isFrontPic: boolean,
  x: number,
  y: number,
  paletteSlot: number,
  paletteTag: number,
  isTrainer: boolean
): number => createPicSprite(runtime, species, otId, personality, isFrontPic, x, y, paletteSlot, paletteTag, isTrainer, false);

export const freeAndDestroyPicSpriteInternal = (
  runtime: TrainerPokemonSpritesRuntime,
  spriteId: number
): number => {
  let i = 0;
  for (; i < PICS_COUNT; i += 1) {
    if (runtime.spritePics[i].spriteId === spriteId) {
      break;
    }
  }
  if (i === PICS_COUNT) {
    return TAG_NONE;
  }
  if (runtime.spritePics[i].paletteTag !== TAG_NONE) {
    runtime.freedSpritePaletteTags.push(runtime.sprites[spriteId].oam.paletteNum);
  }
  runtime.sprites[spriteId].destroyed = true;
  runtime.freedFrameBuffers += 1;
  runtime.freedImageBuffers += 1;
  runtime.spritePics[i] = dummyPicData();
  return 0;
};

export const loadPicSpriteInWindow = (
  runtime: TrainerPokemonSpritesRuntime,
  species: number,
  otId: number,
  personality: number,
  isFrontPic: boolean,
  paletteSlot: number,
  windowId: number,
  isTrainer: boolean
): number => {
  const dest = runtime.windowTileData.get(windowId) ?? new Uint8Array(4 * 0x800);
  runtime.windowTileData.set(windowId, dest);
  if (decompressPicHandleDeoxys(runtime, species, personality, isFrontPic, dest, false)) {
    return TAG_NONE;
  }
  loadPicPaletteBySlot(runtime, species, otId, personality, paletteSlot, isTrainer);
  return 0;
};

export const createTrainerCardSprite = (
  runtime: TrainerPokemonSpritesRuntime,
  species: number,
  otId: number,
  personality: number,
  isFrontPic: boolean,
  destX: number,
  destY: number,
  paletteSlot: number,
  windowId: number,
  isTrainer: boolean
): number => {
  const framePics = allocFrames(runtime);
  if (framePics !== null && !decompressPicHandleDeoxys(runtime, species, personality, isFrontPic, framePics, isTrainer)) {
    runtime.blits.push({ windowId, destX, destY, width: 0x40, height: 0x40 });
    loadPicPaletteBySlot(runtime, species, otId, personality, paletteSlot, isTrainer);
    runtime.freedFrameBuffers += 1;
    return 0;
  }
  return TAG_NONE;
};

export const createMonPicSprite = (
  runtime: TrainerPokemonSpritesRuntime,
  species: number,
  otId: number,
  personality: number,
  isFrontPic: boolean,
  x: number,
  y: number,
  paletteSlot: number,
  paletteTag: number,
  ignoreDeoxys: boolean
): number => createPicSprite(runtime, species, otId, personality, isFrontPic, x, y, paletteSlot, paletteTag, false, ignoreDeoxys);

export const createMonPicSpriteHandleDeoxys = (
  runtime: TrainerPokemonSpritesRuntime,
  species: number,
  otId: number,
  personality: number,
  isFrontPic: boolean,
  x: number,
  y: number,
  paletteSlot: number,
  paletteTag: number
): number => createMonPicSprite(runtime, species, otId, personality, isFrontPic, x, y, paletteSlot, paletteTag, false);

export const freeAndDestroyMonPicSprite = freeAndDestroyPicSpriteInternal;

export const loadMonPicInWindow = (
  runtime: TrainerPokemonSpritesRuntime,
  species: number,
  otId: number,
  personality: number,
  isFrontPic: boolean,
  paletteSlot: number,
  windowId: number
): number => createTrainerCardSprite(runtime, species, otId, personality, isFrontPic, 0, 0, paletteSlot, windowId, false);

export const createTrainerCardMonIconSprite = (
  runtime: TrainerPokemonSpritesRuntime,
  species: number,
  otId: number,
  personality: number,
  isFrontPic: boolean,
  destX: number,
  destY: number,
  paletteSlot: number,
  windowId: number
): number => createTrainerCardSprite(runtime, species, otId, personality, isFrontPic, destX, destY, paletteSlot, windowId, false);

export const createTrainerPicSprite = (
  runtime: TrainerPokemonSpritesRuntime,
  species: number,
  isFrontPic: boolean,
  x: number,
  y: number,
  paletteSlot: number,
  paletteTag: number
): number => createPicSpriteHandleDeoxys(runtime, species, 0, 0, isFrontPic, x, y, paletteSlot, paletteTag, true);

export const freeAndDestroyTrainerPicSprite = freeAndDestroyPicSpriteInternal;

export const loadTrainerPicInWindow = (
  runtime: TrainerPokemonSpritesRuntime,
  species: number,
  isFrontPic: boolean,
  paletteSlot: number,
  windowId: number
): number => loadPicSpriteInWindow(runtime, species, 0, 0, isFrontPic, paletteSlot, windowId, true);

export const createTrainerCardTrainerPicSprite = (
  runtime: TrainerPokemonSpritesRuntime,
  species: number,
  isFrontPic: boolean,
  destX: number,
  destY: number,
  paletteSlot: number,
  windowId: number
): number => createTrainerCardSprite(runtime, species, 0, 0, isFrontPic, destX, destY, paletteSlot, windowId, true);

export const playerGenderToFrontTrainerPicId = (gender: number, getClass: boolean): number => {
  if (getClass === true) {
    if (gender !== MALE) {
      return gFacilityClassToPicIndex[FACILITY_CLASS_LEAF];
    }
    return gFacilityClassToPicIndex[FACILITY_CLASS_RED];
  }
  return gender;
};

export const DummyPicSpriteCallback = dummyPicSpriteCallback;
export const ResetAllPicSprites = resetAllPicSprites;
export const DecompressPic = decompressPic;
export const DecompressPic_HandleDeoxys = decompressPicHandleDeoxys;
export const LoadPicPaletteByTagOrSlot = loadPicPaletteByTagOrSlot;
export const LoadPicPaletteBySlot = loadPicPaletteBySlot;
export const AssignSpriteAnimsTable = assignSpriteAnimsTable;
export const CreatePicSprite = createPicSprite;
export const CreatePicSprite_HandleDeoxys = createPicSpriteHandleDeoxys;
export const FreeAndDestroyPicSpriteInternal = freeAndDestroyPicSpriteInternal;
export const LoadPicSpriteInWindow = loadPicSpriteInWindow;
export const CreateTrainerCardSprite = createTrainerCardSprite;
export const CreateMonPicSprite = createMonPicSprite;
export const CreateMonPicSprite_HandleDeoxys = createMonPicSpriteHandleDeoxys;
export const FreeAndDestroyMonPicSprite = freeAndDestroyMonPicSprite;
export const LoadMonPicInWindow = loadMonPicInWindow;
export const CreateTrainerCardMonIconSprite = createTrainerCardMonIconSprite;
export const CreateTrainerPicSprite = createTrainerPicSprite;
export const FreeAndDestroyTrainerPicSprite = freeAndDestroyTrainerPicSprite;
export const LoadTrainerPicInWindow = loadTrainerPicInWindow;
export const CreateTrainerCardTrainerPicSprite = createTrainerCardTrainerPicSprite;
export const PlayerGenderToFrontTrainerPicId = playerGenderToFrontTrainerPicId;
