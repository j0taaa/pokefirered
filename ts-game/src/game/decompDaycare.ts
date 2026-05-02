import { getExperienceForLevel, getLevelForExperience } from './decompExperience';
import {
  FLAG_SET_CAUGHT,
  FLAG_SET_SEEN,
  getNationalDexNumber,
  getSetPokedexFlag,
  type DecompPokedexFlagState
} from './decompPokedex';
import {
  getEggMoves as getSpeciesEggMoves,
  getLevelUpLearnset,
  getLevelUpLearnsetSymbol,
  getTmhmMoves
} from './decompPokemonLearnsets';
import { getSpeciesName } from './decompSpeciesNames';
import { getRawSpeciesInfo, type DecompGrowthRate } from './decompSpecies';
import {
  gDaycareText_DontLikeOther,
  gDaycareText_GetAlong,
  gDaycareText_GetAlongVeryWell,
  gDaycareText_PlayOther,
  gExpandedPlaceholder_Empty,
  gOtherText_Exit,
  gText_HatchedFromEgg,
  gText_FemaleSymbol,
  gText_Lv,
  gText_MaleSymbol,
  gText_NickHatchPrompt
} from './decompStrings';
import {
  ITEM_TM01,
  ItemIdToBattleMoveId,
  NUM_HIDDEN_MACHINES,
  NUM_TECHNICAL_MACHINES
} from './decompTmCase';
import { sin } from './decompTrig';

export const DAYCARE_MON_COUNT = 2;
export const PARENTS_INCOMPATIBLE = 0;
export const PARENTS_LOW_COMPATIBILITY = 20;
export const PARENTS_MED_COMPATIBILITY = 50;
export const PARENTS_MAX_COMPATIBILITY = 70;
export const DAYCARE_NO_MONS = 0;
export const DAYCARE_EGG_WAITING = 1;
export const DAYCARE_ONE_MON = 2;
export const DAYCARE_TWO_MONS = 3;
export const EGG_HATCH_LEVEL = 5;
export const EGG_GENDER_MALE = 0x8000;
export const MAX_LEVEL = 100;
export const PARTY_SIZE = 6;
export const MAX_MON_MOVES = 4;
export const MOVE_NONE = 0;
export const MON_HAS_MAX_MOVES = 0xffff;
export const MON_ALREADY_KNOWS_MOVE = 0xfffe;
export const DAYCARE_LEVEL_MENU_EXIT = 5;
export const DAYCARE_EXITED_LEVEL_MENU = 2;
export const EVOS_PER_MON = 5;
export const NUM_STATS = 6;
export const EGG_MOVES_ARRAY_COUNT = 10;
export const EGG_LVL_UP_MOVES_ARRAY_COUNT = 50;
export const PALETTES_ALL = 0xffffffff;
export const SE_BALL = 23;
export const SE_EGG_HATCH = 167;
export const MUS_EVOLVED = 259;
export const MUS_EVOLUTION_INTRO = 263;
export const MUS_EVOLUTION = 264;
export const REG_OFFSET_DISPCNT = 0;
export const DISPCNT_OBJ_ON = 0x1000;
export const DISPCNT_OBJ_1D_MAP = 0x0040;
export const RGB_BLACK = 0;
export const NAMING_SCREEN_NICKNAME = 3;
export const ITEM_POKE_BALL = 4;
export const LANGUAGE_JAPANESE = 1;
export const LANGUAGE_ENGLISH = 2;
export const GAME_LANGUAGE = LANGUAGE_ENGLISH;
export const USE_RANDOM_IVS = 32;
export const OT_ID_PLAYER_ID = 0;
export const METLOC_SPECIAL_EGG = 0xfd;
export const FONT_NORMAL_COPY_2 = 3;
export const COPYWIN_FULL = 3;
export const A_BUTTON = 1;
export const B_BUTTON = 2;
export const ST_OAM_AFFINE_OFF = 0;
export const SPRITE_SHAPE_32x32 = 0;
export const SPRITE_SIZE_32x32 = 2;
export const SPRITE_SHAPE_8x8 = 0;
export const SPRITE_SIZE_8x8 = 0;

export const SPECIES_NONE = 0;
export const SPECIES_NIDORAN_F = 29;
export const SPECIES_NIDORAN_M = 32;
export const SPECIES_DITTO = 132;
export const SPECIES_PIKACHU = 25;
export const SPECIES_PICHU = 172;
export const SPECIES_MARILL = 183;
export const SPECIES_AZUMARILL = 184;
export const SPECIES_WOBBUFFET = 202;
export const SPECIES_AZURILL = 350;
export const SPECIES_WYNAUT = 360;
export const SPECIES_VOLBEAT = 386;
export const SPECIES_ILLUMISE = 387;
export const ITEM_NONE = 0;
export const ITEM_SEA_INCENSE = 220;
export const ITEM_LAX_INCENSE = 221;
export const MON_MALE = 0x00;
export const MON_FEMALE = 0xfe;
export const MON_GENDERLESS = 0xff;
export const CHAR_MALE = '♂';
export const CHAR_FEMALE = '♀';

export const EGG_GROUP_DITTO = 'EGG_GROUP_DITTO';
export const EGG_GROUP_UNDISCOVERED = 'EGG_GROUP_UNDISCOVERED';

export interface DaycareWindowTemplate {
  bg: number;
  tilemapLeft: number;
  tilemapTop: number;
  width: number;
  height: number;
  paletteNum: number;
  baseBlock: number;
}

export interface DaycareListMenuItem {
  name: string;
  id: number;
}

export interface DaycareListMenuTemplate {
  items: DaycareListMenuItem[];
  moveCursorFunc: string;
  itemPrintFunc: string;
  totalItems: number;
  maxShowed: number;
  windowId: number;
  header_X: number;
  item_X: number;
  cursor_X: number;
  upText_Y: number;
  cursorPal: number;
  fillValue: number;
  cursorShadowPal: number;
  lettersSpacing: number;
  itemVerticalPadding: number;
  scrollMultiple: number;
  fontId: number;
  cursorKind: number;
}

export interface DaycareOamData {
  y: number;
  affineMode: number;
  objMode: number;
  mosaic: boolean;
  bpp: number;
  shape: number;
  x: number;
  matrixNum: number;
  size: number;
  tileNum: number;
  priority: number;
  paletteNum: number;
  affineParam: number;
}

export interface DaycareSpriteSheet {
  data: string;
  size: number;
  tag: number;
}

export interface DaycareSpritePalette {
  data: string;
  tag: number;
}

export interface DaycareSpriteTemplate {
  tileTag: number;
  paletteTag: number;
  oam: DaycareOamData;
  anims: string;
  images: null;
  affineAnims: string;
  callback: EggHatchSpriteCallback;
}

export interface DaycareBgTemplate {
  bg: number;
  charBaseIndex: number;
  mapBaseIndex: number;
  screenSize: number;
  paletteMode: number;
  priority: number;
  baseTile: number;
}

export const sDaycareLevelMenuWindowTemplate: DaycareWindowTemplate = {
  bg: 0,
  tilemapLeft: 12,
  tilemapTop: 1,
  width: 17,
  height: 5,
  paletteNum: 15,
  baseBlock: 8
};

export const sLevelMenuItems: DaycareListMenuItem[] = [
  { name: gExpandedPlaceholder_Empty, id: 0 },
  { name: gExpandedPlaceholder_Empty, id: 1 },
  { name: gOtherText_Exit, id: DAYCARE_LEVEL_MENU_EXIT }
];

export const sDaycareListMenuLevelTemplate: DaycareListMenuTemplate = {
  items: sLevelMenuItems,
  moveCursorFunc: 'ListMenuDefaultCursorMoveFunc',
  itemPrintFunc: 'DaycarePrintMonInfo',
  totalItems: 3,
  maxShowed: 3,
  windowId: 0,
  header_X: 2,
  item_X: 8,
  cursor_X: 0,
  upText_Y: 0,
  cursorPal: 2,
  fillValue: 1,
  cursorShadowPal: 3,
  lettersSpacing: 1,
  itemVerticalPadding: 0,
  scrollMultiple: 0,
  fontId: FONT_NORMAL_COPY_2,
  cursorKind: 0
};

export const sCompatibilityMessages = [
  gDaycareText_GetAlongVeryWell,
  gDaycareText_GetAlong,
  gDaycareText_DontLikeOther,
  gDaycareText_PlayOther
];

export const sNewLineText = '\n';
export const sJapaneseEggNickname = 'タマゴ';
export const sEggPalette = { incbin: 'graphics/pokemon/egg/normal.gbapal', type: 'u16' } as const;
export const sEggHatchTiles = { incbin: 'graphics/misc/egg_hatch.4bpp', type: 'u8' } as const;
export const sEggShardTiles = { incbin: 'graphics/misc/egg_shard.4bpp', type: 'u8' } as const;

export const sOamData_EggHatch: DaycareOamData = {
  y: 0,
  affineMode: ST_OAM_AFFINE_OFF,
  objMode: 0,
  mosaic: false,
  bpp: 0,
  shape: SPRITE_SHAPE_32x32,
  x: 0,
  matrixNum: 0,
  size: SPRITE_SIZE_32x32,
  tileNum: 0,
  priority: 1,
  paletteNum: 0,
  affineParam: 0
};

export const sSpriteAnim_EggHatch0 = [{ frame: 0, duration: 5 }, 'ANIMCMD_END'] as const;
export const sSpriteAnim_EggHatch1 = [{ frame: 16, duration: 5 }, 'ANIMCMD_END'] as const;
export const sSpriteAnim_EggHatch2 = [{ frame: 32, duration: 5 }, 'ANIMCMD_END'] as const;
export const sSpriteAnim_EggHatch3 = [{ frame: 48, duration: 5 }, 'ANIMCMD_END'] as const;
export const sSpriteAnimTable_EggHatch = [
  sSpriteAnim_EggHatch0,
  sSpriteAnim_EggHatch1,
  sSpriteAnim_EggHatch2,
  sSpriteAnim_EggHatch3
];

export const sEggHatch_Sheet: DaycareSpriteSheet = {
  data: 'sEggHatchTiles',
  size: 2048,
  tag: 12345
};

export const sEggShards_Sheet: DaycareSpriteSheet = {
  data: 'sEggShardTiles',
  size: 128,
  tag: 23456
};

export const sEgg_SpritePalette: DaycareSpritePalette = {
  data: 'sEggPalette',
  tag: 54321
};

export const sSpriteTemplate_EggHatch: DaycareSpriteTemplate = {
  tileTag: 12345,
  paletteTag: 54321,
  oam: sOamData_EggHatch,
  anims: 'sSpriteAnimTable_EggHatch',
  images: null,
  affineAnims: 'gDummySpriteAffineAnimTable',
  callback: 'SpriteCallbackDummy'
};

export const sOamData_EggShard: DaycareOamData = {
  y: 0,
  affineMode: ST_OAM_AFFINE_OFF,
  objMode: 0,
  mosaic: false,
  bpp: 0,
  shape: SPRITE_SHAPE_8x8,
  x: 0,
  matrixNum: 0,
  size: SPRITE_SIZE_8x8,
  tileNum: 0,
  priority: 2,
  paletteNum: 0,
  affineParam: 0
};

export const sSpriteAnim_EggShard0 = [{ frame: 0, duration: 5 }, 'ANIMCMD_END'] as const;
export const sSpriteAnim_EggShard1 = [{ frame: 1, duration: 5 }, 'ANIMCMD_END'] as const;
export const sSpriteAnim_EggShard2 = [{ frame: 2, duration: 5 }, 'ANIMCMD_END'] as const;
export const sSpriteAnim_EggShard3 = [{ frame: 3, duration: 5 }, 'ANIMCMD_END'] as const;
export const sSpriteAnimTable_EggShard = [
  sSpriteAnim_EggShard0,
  sSpriteAnim_EggShard1,
  sSpriteAnim_EggShard2,
  sSpriteAnim_EggShard3
];

export const sSpriteTemplate_EggShard: DaycareSpriteTemplate = {
  tileTag: 23456,
  paletteTag: 54321,
  oam: sOamData_EggShard,
  anims: 'sSpriteAnimTable_EggShard',
  images: null,
  affineAnims: 'gDummySpriteAffineAnimTable',
  callback: 'SpriteCB_EggShard'
};

export const sBgTemplates_EggHatch: DaycareBgTemplate[] = [
  { bg: 0, charBaseIndex: 2, mapBaseIndex: 24, screenSize: 3, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 0, mapBaseIndex: 8, screenSize: 1, paletteMode: 0, priority: 2, baseTile: 0 }
];

export const sWinTemplates_EggHatch: Array<DaycareWindowTemplate | 'DUMMY_WIN_TEMPLATE'> = [
  { bg: 0, tilemapLeft: 2, tilemapTop: 15, width: 26, height: 4, paletteNum: 0, baseBlock: 64 },
  'DUMMY_WIN_TEMPLATE'
];

export const sYesNoWinTemplate: DaycareWindowTemplate = {
  bg: 0,
  tilemapLeft: 21,
  tilemapTop: 9,
  width: 6,
  height: 4,
  paletteNum: 15,
  baseBlock: 424
};

export interface DaycareBoxMon {
  species: string | number;
  nickname?: string;
  otName?: string;
  otId?: number;
  personality?: number;
  exp?: number;
  growthRate?: DecompGrowthRate;
  heldItem?: number;
  gender?: number;
  ivs?: number[];
  level?: number;
  moves?: Array<string | number>;
  ppRestored?: boolean;
  statsCalculated?: boolean;
  mail?: DaycareMail['message'];
  mailId?: number;
  zeroed?: boolean;
  isEgg?: boolean | number;
  badEgg?: boolean;
  friendship?: number;
  pokeball?: number;
  metLevel?: number;
  language?: number;
  metLocation?: number;
  metGame?: number;
  markings?: number;
  pokerus?: number;
  modernFatefulEncounter?: number;
  createdLevel?: number;
  fixedIv?: number;
  hasFixedPersonality?: boolean;
  otIdType?: number;
  calls?: Array<{ fn: string; args: unknown[] }>;
}

export interface DaycareMail {
  otName: string;
  monName: string;
  message: {
    itemId: number;
    [key: string]: unknown;
  };
}

export interface DaycareMon {
  mon: DaycareBoxMon;
  steps: number;
  mail: DaycareMail;
}

export interface DayCare {
  mons: DaycareMon[];
  offspringPersonality: number;
  stepCounter: number;
}

export interface DaycareSaveContext {
  playerName: string;
  mail: Array<DaycareMail['message']>;
}

export interface DaycarePartyContext {
  party: DaycareBoxMon[];
  partyCount: number;
  operations: string[];
}

export interface DaycareFieldRuntime {
  savedCallback: string | null;
  operations: string[];
}

export interface DaycareTextPrinterTemplate {
  currentChar: string;
  windowId: number;
  fontId: number;
  x: number;
  y: number;
  currentX: number;
  currentY: number;
  unk: number;
  letterSpacing: number;
  lineSpacing: number;
  fgColor: number;
  bgColor: number;
  shadowColor: number;
}

export interface DaycareTextRuntime {
  useAlternateDownArrow: number;
  stringWidthOverrides: Map<string, number>;
  calls: Array<{ fn: string; args: unknown[] }>;
}

export interface DaycareMenuTask {
  data: number[];
  destroyed: boolean;
}

export interface DaycareMenuRuntime {
  nextWindowId: number;
  nextListMenuTaskId: number;
  nextTaskId: number;
  listMenuInput: number;
  newKeys: number;
  specialVarResult: number;
  tasks: Array<DaycareMenuTask | undefined>;
  calls: Array<{ fn: string; args: unknown[] }>;
}

export interface DaycareStringVarRuntime {
  gStringVar1: string;
  gStringVar2: string;
  gStringVar3: string;
  gStringVar4: string;
}

export interface DaycareHatchRuntime extends DaycareStringVarRuntime, DecompPokedexFlagState {
  playerParty: DaycareBoxMon[];
  enemyParty: DaycareBoxMon[];
  currentRegionMapSectionId: number;
  calls: Array<{ fn: string; args: unknown[] }>;
}

export interface DaycareSpecialVars {
  gSpecialVar_0x8004: number;
  gSpecialVar_0x8005?: number;
}

export interface DaycareEggHooks {
  evolutionTable: EvolutionTable;
  random(): number;
  inheritIVs(egg: DaycareBoxMon, daycare: DayCare): void;
  buildEggMoveset(egg: DaycareBoxMon, father: DaycareBoxMon, mother: DaycareBoxMon): void;
}

export interface DaycareExperienceHooks {
  moveToLearn: number;
  tryIncrementMonLevel(mon: DaycareBoxMon): boolean;
  monTryLearningNewMove(mon: DaycareBoxMon, firstMove: boolean): number;
  deleteFirstMoveAndGiveMoveToMon(mon: DaycareBoxMon, move: number): void;
  calculateMonStats(mon: DaycareBoxMon): void;
}

export interface RecordMixingDayCareMail {
  holdsItem: boolean[];
  numDaycareMons: number;
}

export type EggHatchSpriteCallback =
  | 'SpriteCB_Egg_0'
  | 'SpriteCB_Egg_1'
  | 'SpriteCB_Egg_2'
  | 'SpriteCB_Egg_3'
  | 'SpriteCB_Egg_4'
  | 'SpriteCB_Egg_5'
  | 'SpriteCB_EggShard'
  | 'SpriteCallbackDummy'
  | 'Destroyed';

export interface EggHatchSprite {
  id: number;
  x: number;
  y: number;
  x2: number;
  y2: number;
  data: number[];
  invisible: boolean;
  callback: EggHatchSpriteCallback;
  animNum: number | null;
  affineAnimNum: number | null;
}

export interface EggHatchData {
  eggSpriteID: number;
  pokeSpriteID: number;
  CB2_state: number;
  CB2_PalCounter: number;
  eggPartyID: number;
  unused_5: number;
  unused_6: number;
  eggShardVelocityID: number;
  windowId: number;
  unused_9: number;
  unused_A: number;
  species: string | number;
  textColor: number[];
}

export interface EggHatchTask {
  data: number[];
  destroyed: boolean;
}

export interface EggHatchRuntime extends DaycareHatchRuntime {
  sEggHatchData: EggHatchData;
  sprites: EggHatchSprite[];
  monFrontPicCoords: Record<string | number, { y_offset: number }>;
  paletteFadeActive: boolean;
  mainState: number;
  mainCallback2: string | null;
  fieldCallback: string | null;
  vblankCallback: string | null;
  specialVars: DaycareSpecialVars & { gSpecialVar_0x8005: number };
  currentMapMusic: number;
  helpSystemEnabled: boolean;
  allocatedEggHatchData: boolean;
  monSpritesGfxAllocated: boolean;
  cryFinished: boolean;
  fanfareTaskInactive: boolean;
  textPrinterActive: boolean;
  menuInput: number;
  bgTilemapBuffers: Record<number, number | null>;
  gpuRegs: Record<string, number>;
  tasks: Array<EggHatchTask | undefined>;
  nextTaskId: number;
  nextSpriteId: number;
  random: () => number;
}

const normalizeSpecies = (species: string | number): string =>
  typeof species === 'number'
    ? `SPECIES_${species}`
    : species.startsWith('SPECIES_')
      ? species.toUpperCase()
      : `SPECIES_${species.toUpperCase()}`;

const rawSpeciesByName = new Map(getRawSpeciesInfo().map((info) => [info.species, info]));

export const createEmptyDaycareMail = (): DaycareMail => ({
  otName: '',
  monName: '',
  message: { itemId: ITEM_NONE }
});

export const createEmptyDaycareMon = (): DaycareMon => ({
  mon: { species: SPECIES_NONE },
  steps: 0,
  mail: createEmptyDaycareMail()
});

export const createDayCare = (mons: DaycareMon[] = []): DayCare => ({
  mons: Array.from({ length: DAYCARE_MON_COUNT }, (_, i) => mons[i] ?? createEmptyDaycareMon()),
  offspringPersonality: 0,
  stepCounter: 0
});

export const createDaycarePartyContext = (party: DaycareBoxMon[] = []): DaycarePartyContext => ({
  party: Array.from({ length: PARTY_SIZE }, (_, i) => party[i] ?? { species: SPECIES_NONE }),
  partyCount: party.filter((entry) => !isSpeciesNone(entry.species)).length,
  operations: []
});

export const createDaycareFieldRuntime = (overrides: Partial<DaycareFieldRuntime> = {}): DaycareFieldRuntime => ({
  savedCallback: null,
  operations: [],
  ...overrides
});

export const createDaycareTextRuntime = (overrides: Partial<DaycareTextRuntime> = {}): DaycareTextRuntime => ({
  useAlternateDownArrow: 0,
  stringWidthOverrides: new Map(),
  calls: [],
  ...overrides
});

export const createDaycareMenuRuntime = (overrides: Partial<DaycareMenuRuntime> = {}): DaycareMenuRuntime => ({
  nextWindowId: 0,
  nextListMenuTaskId: 0,
  nextTaskId: 0,
  listMenuInput: 0,
  newKeys: 0,
  specialVarResult: 0,
  tasks: [],
  calls: [],
  ...overrides
});

export const createDaycareStringVarRuntime = (overrides: Partial<DaycareStringVarRuntime> = {}): DaycareStringVarRuntime => ({
  gStringVar1: '',
  gStringVar2: '',
  gStringVar3: '',
  gStringVar4: '',
  ...overrides
});

export const createDaycareHatchRuntime = (overrides: Partial<DaycareHatchRuntime> = {}): DaycareHatchRuntime => ({
  gStringVar1: '',
  gStringVar2: '',
  gStringVar3: '',
  gStringVar4: '',
  playerParty: Array.from({ length: PARTY_SIZE }, () => ({ species: SPECIES_NONE })),
  enemyParty: Array.from({ length: PARTY_SIZE }, () => ({ species: SPECIES_NONE })),
  currentRegionMapSectionId: 0,
  pokedex: {
    seenSpecies: [],
    caughtSpecies: []
  },
  calls: [],
  ...overrides
});

export const createEggHatchSprite = (
  overrides: Partial<EggHatchSprite> = {}
): EggHatchSprite => ({
  id: 0,
  x: 0,
  y: 0,
  x2: 0,
  y2: 0,
  data: Array.from({ length: 8 }, () => 0),
  invisible: false,
  callback: 'SpriteCallbackDummy',
  animNum: null,
  affineAnimNum: null,
  ...overrides
});

export const createEggHatchRuntime = (overrides: Partial<EggHatchRuntime> = {}): EggHatchRuntime => ({
  gStringVar1: '',
  gStringVar2: '',
  gStringVar3: '',
  gStringVar4: '',
  pokedex: {
    seenSpecies: [],
    caughtSpecies: []
  },
  sEggHatchData: {
    eggSpriteID: 0,
    pokeSpriteID: 1,
    CB2_state: 0,
    CB2_PalCounter: 0,
    eggPartyID: 0,
    unused_5: 0,
    unused_6: 0,
    eggShardVelocityID: 0,
    windowId: 0,
    unused_9: 0,
    unused_A: 0,
    species: SPECIES_NONE,
    textColor: [0, 0, 0]
  },
  sprites: [
    createEggHatchSprite({ id: 0, callback: 'SpriteCB_Egg_0' }),
    createEggHatchSprite({ id: 1, invisible: true })
  ],
  playerParty: [{ species: SPECIES_NONE }],
  enemyParty: [{ species: SPECIES_NONE }],
  currentRegionMapSectionId: 0,
  monFrontPicCoords: {},
  paletteFadeActive: false,
  mainState: 0,
  mainCallback2: null,
  fieldCallback: null,
  vblankCallback: null,
  specialVars: { gSpecialVar_0x8004: 0, gSpecialVar_0x8005: 0 },
  currentMapMusic: 0,
  helpSystemEnabled: true,
  allocatedEggHatchData: false,
  monSpritesGfxAllocated: false,
  cryFinished: false,
  fanfareTaskInactive: false,
  textPrinterActive: false,
  menuInput: -2,
  bgTilemapBuffers: {},
  gpuRegs: {},
  tasks: [],
  nextTaskId: 0,
  nextSpriteId: 2,
  random: () => 0,
  calls: [],
  ...overrides
});

const isSpeciesNone = (species: string | number): boolean =>
  species === SPECIES_NONE || species === 'SPECIES_NONE' || species === 'NONE';

export const DayCare_GetMonNickname = (mon: DaycareBoxMon): string =>
  mon.nickname ?? '';

export const DayCare_GetBoxMonNickname = (mon: DaycareBoxMon): string =>
  mon.nickname ?? '';

export const countPokemonInDaycare = (daycare: DayCare): number => {
  let count = 0;
  for (let i = 0; i < DAYCARE_MON_COUNT; i += 1) {
    if (!isSpeciesNone(daycare.mons[i]?.mon.species ?? SPECIES_NONE)) count += 1;
  }
  return count;
};

export const CountPokemonInDaycare = (daycare: DayCare): number =>
  countPokemonInDaycare(daycare);

export const initDaycareMailRecordMixing = (daycare: DayCare): RecordMixingDayCareMail => {
  const daycareMail: RecordMixingDayCareMail = {
    holdsItem: Array.from({ length: DAYCARE_MON_COUNT }, () => true),
    numDaycareMons: 0
  };

  for (let i = 0; i < DAYCARE_MON_COUNT; i += 1) {
    const mon = daycare.mons[i]?.mon ?? { species: SPECIES_NONE };
    if (!isSpeciesNone(mon.species)) {
      daycareMail.numDaycareMons += 1;
      daycareMail.holdsItem[i] = (mon.heldItem ?? ITEM_NONE) !== ITEM_NONE;
    } else {
      daycareMail.holdsItem[i] = true;
    }
  }

  return daycareMail;
};

export const InitDaycareMailRecordMixing = (daycare: DayCare): RecordMixingDayCareMail =>
  initDaycareMailRecordMixing(daycare);

export const daycareFindEmptySpot = (daycare: DayCare): number => {
  for (let i = 0; i < DAYCARE_MON_COUNT; i += 1) {
    if (isSpeciesNone(daycare.mons[i]?.mon.species ?? SPECIES_NONE)) return i;
  }
  return -1;
};

export const Daycare_FindEmptySpot = (daycare: DayCare): number =>
  daycareFindEmptySpot(daycare);

export const clearDaycareMonMail = (mail: DaycareMail): void => {
  mail.otName = '';
  mail.monName = '';
  mail.message = { itemId: ITEM_NONE };
};

export const ClearDaycareMonMail = (mail: DaycareMail): void => {
  clearDaycareMonMail(mail);
};

export const clearDaycareMon = (daycareMon: DaycareMon): void => {
  daycareMon.mon = { species: SPECIES_NONE };
  daycareMon.steps = 0;
  clearDaycareMonMail(daycareMon.mail);
};

export const ClearDaycareMon = (daycareMon: DaycareMon): void => {
  clearDaycareMon(daycareMon);
};

export const clearAllDaycareData = (daycare: DayCare): void => {
  for (let i = 0; i < DAYCARE_MON_COUNT; i += 1) clearDaycareMon(daycare.mons[i]);
  daycare.offspringPersonality = 0;
  daycare.stepCounter = 0;
};

export const ClearAllDaycareData = (daycare: DayCare): void => {
  clearAllDaycareData(daycare);
};

export const shiftDaycareSlots = (daycare: DayCare): void => {
  if (
    !isSpeciesNone(daycare.mons[1].mon.species)
    && isSpeciesNone(daycare.mons[0].mon.species)
  ) {
    daycare.mons[0].mon = { ...daycare.mons[1].mon };
    daycare.mons[1].mon = { species: SPECIES_NONE };
    daycare.mons[0].mail = {
      otName: daycare.mons[1].mail.otName,
      monName: daycare.mons[1].mail.monName,
      message: { ...daycare.mons[1].mail.message }
    };
    daycare.mons[0].steps = daycare.mons[1].steps;
    daycare.mons[1].steps = 0;
    clearDaycareMonMail(daycare.mons[1].mail);
  }
};

export const ShiftDaycareSlots = (daycare: DayCare): void => {
  shiftDaycareSlots(daycare);
};

const boxMonRestorePP = (mon: DaycareBoxMon): void => {
  mon.ppRestored = true;
};

const zeroMonData = (mon: DaycareBoxMon): void => {
  for (const key of Object.keys(mon) as Array<keyof DaycareBoxMon>)
    delete mon[key];
  mon.species = SPECIES_NONE;
  mon.zeroed = true;
};

const compactPartySlots = (context: DaycarePartyContext): void => {
  const compacted = context.party.filter((entry) => !isSpeciesNone(entry.species));
  context.party = Array.from({ length: PARTY_SIZE }, (_, i) => compacted[i] ?? { species: SPECIES_NONE });
  context.operations.push('CompactPartySlots');
};

const calculatePlayerPartyCount = (context: DaycarePartyContext): void => {
  context.partyCount = context.party.filter((entry) => !isSpeciesNone(entry.species)).length;
  context.operations.push('CalculatePlayerPartyCount');
};

const cloneBoxMon = (mon: DaycareBoxMon): DaycareBoxMon => ({
  ...mon,
  ivs: mon.ivs ? [...mon.ivs] : undefined,
  moves: mon.moves ? [...mon.moves] : undefined,
  mail: mon.mail ? { ...mon.mail } : undefined
});

export const monHasMail = (mon: DaycareBoxMon): boolean =>
  (mon.mailId ?? -1) >= 0 || (mon.mail?.itemId ?? ITEM_NONE) !== ITEM_NONE;

export const storePokemonInDaycare = (
  mon: DaycareBoxMon,
  daycareMon: DaycareMon,
  save: DaycareSaveContext,
  partyContext: DaycarePartyContext
): void => {
  if (monHasMail(mon)) {
    const mailId = mon.mailId ?? 0;
    daycareMon.mail.otName = save.playerName;
    daycareMon.mail.monName = mon.nickname ?? '';
    daycareMon.mail.message = { ...(save.mail[mailId] ?? mon.mail ?? { itemId: ITEM_NONE }) };
    delete mon.mail;
    delete mon.mailId;
  }

  daycareMon.mon = cloneBoxMon(mon);
  boxMonRestorePP(daycareMon.mon);
  daycareMon.steps = 0;
  zeroMonData(mon);
  compactPartySlots(partyContext);
  calculatePlayerPartyCount(partyContext);
};

export const StorePokemonInDaycare = (
  mon: DaycareBoxMon,
  daycareMon: DaycareMon,
  save: DaycareSaveContext,
  partyContext: DaycarePartyContext
): void => {
  storePokemonInDaycare(mon, daycareMon, save, partyContext);
};

export const storePokemonInEmptyDaycareSlot = (
  mon: DaycareBoxMon,
  daycare: DayCare,
  save: DaycareSaveContext,
  partyContext: DaycarePartyContext
): void => {
  const slotId = daycareFindEmptySpot(daycare);
  storePokemonInDaycare(mon, daycare.mons[slotId], save, partyContext);
};

export const StorePokemonInEmptyDaycareSlot = (
  mon: DaycareBoxMon,
  daycare: DayCare,
  save: DaycareSaveContext,
  partyContext: DaycarePartyContext
): void => {
  storePokemonInEmptyDaycareSlot(mon, daycare, save, partyContext);
};

export const StoreSelectedPokemonInDaycare = (
  daycare: DayCare,
  partyContext: DaycarePartyContext,
  monId: number,
  save: DaycareSaveContext
): void => {
  storePokemonInEmptyDaycareSlot(partyContext.party[monId], daycare, save, partyContext);
};

export const ChooseSendDaycareMon = (runtime: DaycareFieldRuntime): void => {
  runtime.operations.push('ChooseMonForDaycare');
  runtime.savedCallback = 'CB2_ReturnToField';
};

export const PutMonInRoute5Daycare = (
  partyContext: DaycarePartyContext,
  monIdx: number,
  route5DayCareMon: DaycareMon,
  save: DaycareSaveContext
): void => {
  storePokemonInDaycare(partyContext.party[monIdx], route5DayCareMon, save, partyContext);
};

export const applyDaycareExperience = (
  mon: DaycareBoxMon,
  hooks: DaycareExperienceHooks
): void => {
  for (let i = 0; i < MAX_LEVEL; i += 1) {
    if (hooks.tryIncrementMonLevel(mon)) {
      let firstMove = true;
      let learnedMove: number;
      while ((learnedMove = hooks.monTryLearningNewMove(mon, firstMove)) !== 0) {
        firstMove = false;
        if (learnedMove === MON_HAS_MAX_MOVES)
          hooks.deleteFirstMoveAndGiveMoveToMon(mon, hooks.moveToLearn);
      }
    } else {
      break;
    }
  }

  hooks.calculateMonStats(mon);
};

export const ApplyDaycareExperience = (
  mon: DaycareBoxMon,
  hooks: DaycareExperienceHooks
): void => {
  applyDaycareExperience(mon, hooks);
};

export const createDefaultDaycareExperienceHooks = (): DaycareExperienceHooks => ({
  moveToLearn: 0,
  tryIncrementMonLevel(mon) {
    const level = mon.level ?? getLevelForExperience(growthRateForMon(mon), mon.exp ?? 0);
    if (level >= MAX_LEVEL) return false;
    mon.level = level + 1;
    return false;
  },
  monTryLearningNewMove() {
    return 0;
  },
  deleteFirstMoveAndGiveMoveToMon(mon, move) {
    mon.moves = [...(mon.moves ?? []).slice(1), move];
  },
  calculateMonStats(mon) {
    mon.statsCalculated = true;
  }
});

export const takeSelectedPokemonFromDaycare = (
  daycareMon: DaycareMon,
  partyContext: DaycarePartyContext,
  hooks: DaycareExperienceHooks = createDefaultDaycareExperienceHooks()
): string | number => {
  const species = daycareMon.mon.species;
  const pokemon = cloneBoxMon(daycareMon.mon);

  if ((pokemon.level ?? getLevelForExperience(growthRateForMon(pokemon), pokemon.exp ?? 0)) !== MAX_LEVEL) {
    pokemon.exp = (pokemon.exp ?? 0) + daycareMon.steps;
    applyDaycareExperience(pokemon, hooks);
  }

  partyContext.party[PARTY_SIZE - 1] = pokemon;
  if (daycareMon.mail.message.itemId) {
    partyContext.party[PARTY_SIZE - 1].mail = { ...daycareMon.mail.message };
    clearDaycareMonMail(daycareMon.mail);
  }

  daycareMon.mon = { species: SPECIES_NONE, zeroed: true };
  daycareMon.steps = 0;
  compactPartySlots(partyContext);
  calculatePlayerPartyCount(partyContext);
  return species;
};

export const TakeSelectedPokemonFromDaycare = (
  daycareMon: DaycareMon,
  partyContext: DaycarePartyContext,
  hooks: DaycareExperienceHooks = createDefaultDaycareExperienceHooks()
): string | number => takeSelectedPokemonFromDaycare(daycareMon, partyContext, hooks);

export const takeSelectedPokemonMonFromDaycareShiftSlots = (
  daycare: DayCare,
  slotId: number,
  partyContext: DaycarePartyContext,
  hooks: DaycareExperienceHooks = createDefaultDaycareExperienceHooks()
): string | number => {
  const species = takeSelectedPokemonFromDaycare(daycare.mons[slotId], partyContext, hooks);
  shiftDaycareSlots(daycare);
  return species;
};

export const TakeSelectedPokemonMonFromDaycareShiftSlots = (
  daycare: DayCare,
  slotId: number,
  partyContext: DaycarePartyContext,
  hooks: DaycareExperienceHooks = createDefaultDaycareExperienceHooks()
): string | number => takeSelectedPokemonMonFromDaycareShiftSlots(daycare, slotId, partyContext, hooks);

export const TakePokemonFromDaycare = (
  daycare: DayCare,
  specialVars: DaycareSpecialVars,
  partyContext: DaycarePartyContext,
  hooks: DaycareExperienceHooks = createDefaultDaycareExperienceHooks()
): string | number =>
  takeSelectedPokemonMonFromDaycareShiftSlots(daycare, specialVars.gSpecialVar_0x8004, partyContext, hooks);

const speciesInfo = (species: string | number) =>
  rawSpeciesByName.get(normalizeSpecies(species));

const speciesEqual = (left: string | number, right: string | number): boolean =>
  typeof left === 'number' && typeof right === 'number'
    ? left === right
    : normalizeSpecies(left) === normalizeSpecies(right);

const getEggCycles = (species: string | number): number =>
  Number.parseInt(speciesInfo(species)?.eggCycles ?? '0', 10) || 0;

const recordMonCall = (mon: DaycareBoxMon, fn: string, ...args: unknown[]): void => {
  mon.calls = mon.calls ?? [];
  mon.calls.push({ fn, args });
};

const genderRatioValue = (token: string): number => {
  if (token === 'MON_MALE') return MON_MALE;
  if (token === 'MON_FEMALE') return MON_FEMALE;
  if (token === 'MON_GENDERLESS') return MON_GENDERLESS;
  const percent = Number.parseFloat(token.match(/PERCENT_FEMALE\((\d+(?:\.\d+)?)\)/u)?.[1] ?? '50');
  return Math.min(254, Math.trunc((percent * 255) / 100));
};

export const getGenderFromSpeciesAndPersonality = (species: string | number, personality: number): number => {
  const ratio = genderRatioValue(speciesInfo(species)?.genderRatio ?? 'MON_GENDERLESS');
  switch (ratio) {
    case MON_MALE:
    case MON_FEMALE:
    case MON_GENDERLESS:
      return ratio;
    default:
      return ratio > (personality & 0xff) ? MON_FEMALE : MON_MALE;
  }
};

export const getBoxMonGender = (mon: DaycareBoxMon): number =>
  mon.gender ?? getGenderFromSpeciesAndPersonality(mon.species, mon.personality ?? 0);

export interface EvolutionEntry {
  targetSpecies: string | number;
}

export type EvolutionTable = Array<readonly EvolutionEntry[]>;

export const getEggSpecies = (
  species: string | number,
  evolutionTable: EvolutionTable,
  numSpecies = evolutionTable.length
): string | number => {
  let result = species;

  for (let i = 0; i < EVOS_PER_MON; i += 1) {
    let found = false;
    let j: number;
    for (j = 1; j < numSpecies; j += 1) {
      const entries = evolutionTable[j] ?? [];
      for (let k = 0; k < EVOS_PER_MON; k += 1) {
        if (entries[k] && speciesEqual(entries[k].targetSpecies, result)) {
          result = j;
          found = true;
          break;
        }
      }

      if (found)
        break;
    }

    if (j === numSpecies)
      break;
  }

  return result;
};

export const GetEggSpecies = (
  species: string | number,
  evolutionTable: EvolutionTable,
  numSpecies = evolutionTable.length
): string | number => getEggSpecies(species, evolutionTable, numSpecies);

export const triggerPendingDaycareEgg = (daycare: DayCare, random: () => number): void => {
  daycare.offspringPersonality = (random() % 0xfffe) + 1;
};

export const TriggerPendingDaycareEgg = (daycare: DayCare, random: () => number): void => {
  triggerPendingDaycareEgg(daycare, random);
};

export const triggerPendingDaycareMaleEgg = (daycare: DayCare, random: () => number): void => {
  daycare.offspringPersonality = random() | EGG_GENDER_MALE;
};

export const TriggerPendingDaycareMaleEgg = (daycare: DayCare, random: () => number): void => {
  triggerPendingDaycareMaleEgg(daycare, random);
};

export const removeEggFromDayCare = (daycare: DayCare): void => {
  daycare.offspringPersonality = 0;
  daycare.stepCounter = 0;
};

export const RemoveEggFromDayCare = (daycare: DayCare): void => {
  removeEggFromDayCare(daycare);
};

export const RejectEggFromDayCare = (daycare: DayCare): void => {
  removeEggFromDayCare(daycare);
};

export const TryProduceOrHatchEgg = (
  daycare: DayCare,
  playerParty: DaycareBoxMon[],
  specialVars: DaycareSpecialVars,
  random: () => number
): boolean => {
  let validEggs = 0;

  for (let i = 0; i < DAYCARE_MON_COUNT; i += 1) {
    if (!isSpeciesNone(daycare.mons[i].mon.species)) {
      daycare.mons[i].steps += 1;
      validEggs += 1;
    }
  }

  if (daycare.offspringPersonality === 0 && validEggs === DAYCARE_MON_COUNT && (daycare.mons[1].steps & 0xff) === 0xff) {
    const compatibility = getDaycareCompatibilityScore(daycare);
    if (compatibility > Math.trunc((random() * 100) / 0xffff))
      triggerPendingDaycareEgg(daycare, random);
  }

  daycare.stepCounter += 1;
  if (daycare.stepCounter === 255) {
    for (let i = 0; i < playerParty.length; i += 1) {
      if (!playerParty[i].isEgg)
        continue;
      if (playerParty[i].badEgg)
        continue;

      let steps = playerParty[i].friendship ?? 0;
      if (steps !== 0) {
        steps -= 1;
        playerParty[i].friendship = steps;
      } else {
        specialVars.gSpecialVar_0x8004 = i;
        return true;
      }
    }
  }

  return false;
};

export const ShouldEggHatch = (
  daycare: DayCare,
  route5DayCareMon: DaycareMon,
  playerParty: DaycareBoxMon[],
  specialVars: DaycareSpecialVars,
  random: () => number
): boolean => {
  if (!isSpeciesNone(route5DayCareMon.mon.species))
    route5DayCareMon.steps += 1;
  return TryProduceOrHatchEgg(daycare, playerParty, specialVars, random);
};

export const alterEggSpeciesWithIncenseItem = (species: string | number, daycare: DayCare): string | number => {
  let result = species;
  if (speciesEqual(result, SPECIES_WYNAUT) || speciesEqual(result, SPECIES_AZURILL)) {
    const motherItem = daycare.mons[0].mon.heldItem ?? ITEM_NONE;
    const fatherItem = daycare.mons[1].mon.heldItem ?? ITEM_NONE;
    if (speciesEqual(result, SPECIES_WYNAUT) && motherItem !== ITEM_LAX_INCENSE && fatherItem !== ITEM_LAX_INCENSE)
      result = SPECIES_WOBBUFFET;

    if (speciesEqual(result, SPECIES_AZURILL) && motherItem !== ITEM_SEA_INCENSE && fatherItem !== ITEM_SEA_INCENSE)
      result = SPECIES_MARILL;
  }

  return result;
};

export const determineEggSpeciesAndParentSlots = (
  daycare: DayCare,
  parentSlots: number[],
  evolutionTable: EvolutionTable
): string | number => {
  const species = Array.from({ length: DAYCARE_MON_COUNT }, (_, i) => daycare.mons[i].mon.species);

  for (let i = 0; i < DAYCARE_MON_COUNT; i += 1) {
    if (speciesEqual(species[i], SPECIES_DITTO)) {
      parentSlots[0] = i ^ 1;
      parentSlots[1] = i;
    } else if (getBoxMonGender(daycare.mons[i].mon) === MON_FEMALE) {
      parentSlots[0] = i;
      parentSlots[1] = i ^ 1;
    }
  }

  let eggSpecies = getEggSpecies(species[parentSlots[0]], evolutionTable);
  if (speciesEqual(eggSpecies, SPECIES_NIDORAN_F) && (daycare.offspringPersonality & EGG_GENDER_MALE))
    eggSpecies = SPECIES_NIDORAN_M;
  if (speciesEqual(eggSpecies, SPECIES_ILLUMISE) && (daycare.offspringPersonality & EGG_GENDER_MALE))
    eggSpecies = SPECIES_VOLBEAT;

  if (speciesEqual(species[parentSlots[1]], SPECIES_DITTO) && getBoxMonGender(daycare.mons[parentSlots[0]].mon) !== MON_FEMALE) {
    const ditto = parentSlots[1];
    parentSlots[1] = parentSlots[0];
    parentSlots[0] = ditto;
  }

  return eggSpecies;
};

export const CreateEgg = (
  mon: DaycareBoxMon,
  species: string | number,
  setHotSpringsLocation: boolean
): void => {
  recordMonCall(mon, 'CreateMon', species, EGG_HATCH_LEVEL, USE_RANDOM_IVS, false, 0, OT_ID_PLAYER_ID, 0);
  mon.species = species;
  mon.level = EGG_HATCH_LEVEL;
  mon.createdLevel = EGG_HATCH_LEVEL;
  mon.fixedIv = USE_RANDOM_IVS;
  mon.hasFixedPersonality = false;
  mon.personality = 0;
  mon.otIdType = OT_ID_PLAYER_ID;
  mon.pokeball = ITEM_POKE_BALL;
  mon.nickname = sJapaneseEggNickname;
  mon.friendship = getEggCycles(species);
  mon.metLevel = 0;
  mon.language = LANGUAGE_JAPANESE;
  if (setHotSpringsLocation)
    mon.metLocation = METLOC_SPECIAL_EGG;
  mon.isEgg = true;
};

export const SetInitialEggData = (
  mon: DaycareBoxMon,
  species: string | number,
  daycare: DayCare,
  random: () => number
): void => {
  const personality = (daycare.offspringPersonality | (random() << 16)) >>> 0;
  recordMonCall(mon, 'CreateMon', species, EGG_HATCH_LEVEL, USE_RANDOM_IVS, true, personality, OT_ID_PLAYER_ID, 0);
  mon.species = species;
  mon.level = EGG_HATCH_LEVEL;
  mon.createdLevel = EGG_HATCH_LEVEL;
  mon.fixedIv = USE_RANDOM_IVS;
  mon.hasFixedPersonality = true;
  mon.personality = personality;
  mon.otIdType = OT_ID_PLAYER_ID;
  mon.pokeball = ITEM_POKE_BALL;
  mon.nickname = sJapaneseEggNickname;
  mon.friendship = getEggCycles(species);
  mon.metLevel = 0;
  mon.language = LANGUAGE_JAPANESE;
};

export const _GiveEggFromDaycare = (
  daycare: DayCare,
  partyContext: DaycarePartyContext,
  hooks: DaycareEggHooks
): DaycareBoxMon => {
  const egg: DaycareBoxMon = { species: SPECIES_NONE };
  const parentSlots = Array.from({ length: DAYCARE_MON_COUNT }, () => 0);
  let species = determineEggSpeciesAndParentSlots(daycare, parentSlots, hooks.evolutionTable);
  species = alterEggSpeciesWithIncenseItem(species, daycare);
  SetInitialEggData(egg, species, daycare, hooks.random);
  hooks.inheritIVs(egg, daycare);
  hooks.buildEggMoveset(egg, daycare.mons[parentSlots[1]].mon, daycare.mons[parentSlots[0]].mon);
  egg.isEgg = true;
  partyContext.party[PARTY_SIZE - 1] = egg;
  compactPartySlots(partyContext);
  calculatePlayerPartyCount(partyContext);
  removeEggFromDayCare(daycare);
  return egg;
};

export const GiveEggFromDaycare = (
  daycare: DayCare,
  partyContext: DaycarePartyContext,
  hooks: DaycareEggHooks
): DaycareBoxMon => _GiveEggFromDaycare(daycare, partyContext, hooks);

export const removeIVIndexFromList = (ivs: number[], selectedIv: number): void => {
  const temp = Array.from({ length: NUM_STATS }, (_, i) => ivs[i]);

  ivs[selectedIv] = 0xff;
  for (let i = 0; i < NUM_STATS; i += 1)
    temp[i] = ivs[i];

  let j = 0;
  for (let i = 0; i < NUM_STATS; i += 1) {
    if (temp[i] !== 0xff)
      ivs[j++] = temp[i];
  }
};

export const RemoveIVIndexFromList = (ivs: number[], selectedIv: number): void => {
  removeIVIndexFromList(ivs, selectedIv);
};

export const inheritIVs = (
  egg: DaycareBoxMon,
  daycare: DayCare,
  random: () => number
): { selectedIvs: number[]; whichParent: number[] } => {
  const selectedIvs = Array.from({ length: 3 }, () => 0);
  const availableIVs = Array.from({ length: NUM_STATS }, (_, i) => i);
  const whichParent = Array.from({ length: selectedIvs.length }, () => 0);
  egg.ivs = egg.ivs ?? Array.from({ length: NUM_STATS }, () => 0);

  for (let i = 0; i < selectedIvs.length; i += 1) {
    selectedIvs[i] = availableIVs[random() % (NUM_STATS - i)];
    removeIVIndexFromList(availableIVs, selectedIvs[i]);
  }

  for (let i = 0; i < selectedIvs.length; i += 1)
    whichParent[i] = random() % DAYCARE_MON_COUNT;

  for (let i = 0; i < selectedIvs.length; i += 1) {
    const iv = daycare.mons[whichParent[i]].mon.ivs?.[selectedIvs[i]] ?? 0;
    egg.ivs[selectedIvs[i]] = iv;
  }

  return { selectedIvs, whichParent };
};

export const InheritIVs = (
  egg: DaycareBoxMon,
  daycare: DayCare,
  random: () => number
): { selectedIvs: number[]; whichParent: number[] } => inheritIVs(egg, daycare, random);

const isMoveNone = (move: string | number | undefined): boolean =>
  move === undefined || move === MOVE_NONE || move === 'MOVE_NONE';

const normalizeMove = (move: string | number): string | number =>
  typeof move === 'number'
    ? move
    : move.startsWith('MOVE_')
      ? move.toUpperCase()
      : `MOVE_${move.toUpperCase()}`;

const movesEqual = (left: string | number, right: string | number): boolean =>
  typeof left === 'number' && typeof right === 'number'
    ? left === right
    : normalizeMove(left) === normalizeMove(right);

const normalizeTmhmMove = (tmhm: string): string =>
  `MOVE_${tmhm.replace(/^(?:TM|HM)\d+_/u, '')}`;

export const giveMoveToMon = (mon: DaycareBoxMon, move: string | number): string | number => {
  mon.moves = Array.from({ length: MAX_MON_MOVES }, (_, i) => mon.moves?.[i] ?? MOVE_NONE);
  for (let i = 0; i < MAX_MON_MOVES; i += 1) {
    const existingMove = mon.moves[i];
    if (isMoveNone(existingMove)) {
      mon.moves[i] = move;
      return move;
    }
    if (movesEqual(existingMove!, move))
      return MON_ALREADY_KNOWS_MOVE;
  }
  return MON_HAS_MAX_MOVES;
};

export const deleteFirstMoveAndGiveMoveToMon = (mon: DaycareBoxMon, move: string | number): void => {
  mon.moves = Array.from({ length: MAX_MON_MOVES }, (_, i) => mon.moves?.[i] ?? MOVE_NONE);
  const moves = Array.from({ length: MAX_MON_MOVES }, () => MOVE_NONE as string | number);
  for (let i = 0; i < MAX_MON_MOVES - 1; i += 1)
    moves[i] = mon.moves[i + 1] ?? MOVE_NONE;
  moves[MAX_MON_MOVES - 1] = move;
  mon.moves = moves;
};

export const getEggMoves = (pokemon: DaycareBoxMon): Array<string | number> =>
  getSpeciesEggMoves(normalizeSpecies(pokemon.species)).slice(0, EGG_MOVES_ARRAY_COUNT);

export const GetEggMoves = (pokemon: DaycareBoxMon): Array<string | number> =>
  getEggMoves(pokemon);

export const getLevelUpMovesBySpecies = (species: string | number): Array<string | number> => {
  const symbol = getLevelUpLearnsetSymbol(normalizeSpecies(species));
  if (!symbol)
    return [];
  return getLevelUpLearnset(symbol)?.moves.map((entry) => entry.move).slice(0, EGG_LVL_UP_MOVES_ARRAY_COUNT) ?? [];
};

export const canMonLearnTMHM = (mon: DaycareBoxMon, tm: number): boolean => {
  const move = ItemIdToBattleMoveId(ITEM_TM01 + tm);
  if (!move)
    return false;
  return getTmhmMoves(normalizeSpecies(mon.species)).some((tmhm) => movesEqual(normalizeTmhmMove(tmhm), move));
};

export const BuildEggMoveset = (
  egg: DaycareBoxMon,
  father: DaycareBoxMon,
  mother: DaycareBoxMon
): void => {
  let numSharedParentMoves = 0;
  const sHatchedEggMotherMoves = Array.from({ length: MAX_MON_MOVES }, () => MOVE_NONE as string | number);
  const sHatchedEggFatherMoves = Array.from({ length: MAX_MON_MOVES }, () => MOVE_NONE as string | number);
  const sHatchedEggFinalMoves = Array.from({ length: MAX_MON_MOVES }, () => MOVE_NONE as string | number);
  const sHatchedEggEggMoves = Array.from({ length: EGG_MOVES_ARRAY_COUNT }, () => MOVE_NONE as string | number);
  const sHatchedEggLevelUpMoves = Array.from({ length: EGG_LVL_UP_MOVES_ARRAY_COUNT }, () => MOVE_NONE as string | number);

  const levelUpMoves = getLevelUpMovesBySpecies(egg.species);
  const numLevelUpMoves = levelUpMoves.length;
  for (let i = 0; i < numLevelUpMoves; i += 1)
    sHatchedEggLevelUpMoves[i] = levelUpMoves[i];

  for (let i = 0; i < MAX_MON_MOVES; i += 1) {
    sHatchedEggFatherMoves[i] = father.moves?.[i] ?? MOVE_NONE;
    sHatchedEggMotherMoves[i] = mother.moves?.[i] ?? MOVE_NONE;
  }

  const eggMoves = getEggMoves(egg);
  const numEggMoves = eggMoves.length;
  for (let i = 0; i < numEggMoves; i += 1)
    sHatchedEggEggMoves[i] = eggMoves[i];

  for (let i = 0; i < MAX_MON_MOVES; i += 1) {
    if (!isMoveNone(sHatchedEggFatherMoves[i])) {
      for (let j = 0; j < numEggMoves; j += 1) {
        if (movesEqual(sHatchedEggFatherMoves[i], sHatchedEggEggMoves[j])) {
          if (giveMoveToMon(egg, sHatchedEggFatherMoves[i]) === MON_HAS_MAX_MOVES)
            deleteFirstMoveAndGiveMoveToMon(egg, sHatchedEggFatherMoves[i]);
          break;
        }
      }
    } else {
      break;
    }
  }

  for (let i = 0; i < MAX_MON_MOVES; i += 1) {
    if (!isMoveNone(sHatchedEggFatherMoves[i])) {
      for (let j = 0; j < NUM_TECHNICAL_MACHINES + NUM_HIDDEN_MACHINES; j += 1) {
        const tmhmMove = ItemIdToBattleMoveId(ITEM_TM01 + j);
        if (tmhmMove && movesEqual(sHatchedEggFatherMoves[i], tmhmMove) && canMonLearnTMHM(egg, j)) {
          if (giveMoveToMon(egg, sHatchedEggFatherMoves[i]) === MON_HAS_MAX_MOVES)
            deleteFirstMoveAndGiveMoveToMon(egg, sHatchedEggFatherMoves[i]);
        }
      }
    }
  }

  for (let i = 0; i < MAX_MON_MOVES; i += 1) {
    if (isMoveNone(sHatchedEggFatherMoves[i]))
      break;
    for (let j = 0; j < MAX_MON_MOVES; j += 1) {
      if (movesEqual(sHatchedEggFatherMoves[i], sHatchedEggMotherMoves[j]) && !isMoveNone(sHatchedEggFatherMoves[i]))
        sHatchedEggFinalMoves[numSharedParentMoves++] = sHatchedEggFatherMoves[i];
    }
  }

  for (let i = 0; i < MAX_MON_MOVES; i += 1) {
    if (isMoveNone(sHatchedEggFinalMoves[i]))
      break;
    for (let j = 0; j < numLevelUpMoves; j += 1) {
      if (!isMoveNone(sHatchedEggLevelUpMoves[j]) && movesEqual(sHatchedEggFinalMoves[i], sHatchedEggLevelUpMoves[j])) {
        if (giveMoveToMon(egg, sHatchedEggFinalMoves[i]) === MON_HAS_MAX_MOVES)
          deleteFirstMoveAndGiveMoveToMon(egg, sHatchedEggFinalMoves[i]);
        break;
      }
    }
  }
};

export const eggGroupsOverlap = (eggGroups1: readonly string[], eggGroups2: readonly string[]): boolean => {
  for (let i = 0; i < 2; i += 1) {
    for (let j = 0; j < 2; j += 1) {
      if (eggGroups1[i] === eggGroups2[j]) return true;
    }
  }
  return false;
};

export const getDaycareCompatibilityScore = (daycare: DayCare): number => {
  const species = daycare.mons.map((entry) => entry.mon.species);
  const trainerIds = daycare.mons.map((entry) => entry.mon.otId ?? 0);
  const genders = daycare.mons.map((entry) => getGenderFromSpeciesAndPersonality(entry.mon.species, entry.mon.personality ?? 0));
  const eggGroups = daycare.mons.map((entry) => {
    const info = speciesInfo(entry.mon.species);
    return info?.eggGroups ?? [EGG_GROUP_UNDISCOVERED, EGG_GROUP_UNDISCOVERED];
  });

  if (eggGroups[0][0] === EGG_GROUP_UNDISCOVERED || eggGroups[1][0] === EGG_GROUP_UNDISCOVERED) {
    return PARENTS_INCOMPATIBLE;
  }
  if (eggGroups[0][0] === EGG_GROUP_DITTO && eggGroups[1][0] === EGG_GROUP_DITTO) {
    return PARENTS_INCOMPATIBLE;
  }
  if (eggGroups[0][0] === EGG_GROUP_DITTO || eggGroups[1][0] === EGG_GROUP_DITTO) {
    if (trainerIds[0] === trainerIds[1]) return PARENTS_LOW_COMPATIBILITY;
    return PARENTS_MED_COMPATIBILITY;
  }

  if (genders[0] === genders[1]) return PARENTS_INCOMPATIBLE;
  if (genders[0] === MON_GENDERLESS || genders[1] === MON_GENDERLESS) return PARENTS_INCOMPATIBLE;
  if (!eggGroupsOverlap(eggGroups[0], eggGroups[1])) return PARENTS_INCOMPATIBLE;

  if (normalizeSpecies(species[0]) === normalizeSpecies(species[1])) {
    if (trainerIds[0] === trainerIds[1]) return PARENTS_MED_COMPATIBILITY;
    return PARENTS_MAX_COMPATIBILITY;
  }

  if (trainerIds[0] !== trainerIds[1]) return PARENTS_MED_COMPATIBILITY;
  return PARENTS_LOW_COMPATIBILITY;
};

export const GetDaycareCompatibilityScoreFromSave = (daycare: DayCare): number =>
  getDaycareCompatibilityScore(daycare);

export const SetDaycareCompatibilityString = (
  daycare: DayCare,
  runtime: DaycareStringVarRuntime
): void => {
  const relationshipScore = GetDaycareCompatibilityScoreFromSave(daycare);
  let whichString = 0;
  if (relationshipScore === PARENTS_INCOMPATIBLE)
    whichString = 3;
  if (relationshipScore === PARENTS_LOW_COMPATIBILITY)
    whichString = 2;
  if (relationshipScore === PARENTS_MED_COMPATIBILITY)
    whichString = 1;
  if (relationshipScore === PARENTS_MAX_COMPATIBILITY)
    whichString = 0;

  runtime.gStringVar4 = sCompatibilityMessages[whichString];
};

export const isEggPending = (daycare: DayCare): boolean =>
  daycare.offspringPersonality !== 0;

export const _GetDaycareMonNicknames = (
  daycare: DayCare,
  runtime: DaycareStringVarRuntime
): void => {
  if (!isSpeciesNone(daycare.mons[0].mon.species)) {
    runtime.gStringVar1 = daycare.mons[0].mon.nickname ?? '';
    runtime.gStringVar3 = daycare.mons[0].mon.otName ?? '';
  }

  if (!isSpeciesNone(daycare.mons[1].mon.species))
    runtime.gStringVar2 = daycare.mons[1].mon.nickname ?? '';
};

export const GetSelectedMonNicknameAndSpecies = (
  party: DaycareBoxMon[],
  monIdx: number,
  runtime: DaycareStringVarRuntime
): string | number => {
  runtime.gStringVar1 = party[monIdx]?.nickname ?? '';
  return party[monIdx]?.species ?? SPECIES_NONE;
};

export const GetDaycareMonNicknames = (
  daycare: DayCare,
  runtime: DaycareStringVarRuntime
): void => {
  _GetDaycareMonNicknames(daycare, runtime);
};

export const getDaycareState = (daycare: DayCare): number => {
  if (isEggPending(daycare)) return DAYCARE_EGG_WAITING;
  const numMons = countPokemonInDaycare(daycare);
  if (numMons !== 0) return numMons + 1;
  return DAYCARE_NO_MONS;
};

export const GetDaycareState = (daycare: DayCare): number =>
  getDaycareState(daycare);

export const getDaycarePokemonCount = (daycare: DayCare): number => {
  const ret = countPokemonInDaycare(daycare);
  if (ret) return ret;
  return 0;
};

export const GetDaycarePokemonCount = (daycare: DayCare): number =>
  getDaycarePokemonCount(daycare);

const growthRateForMon = (mon: DaycareBoxMon): DecompGrowthRate =>
  mon.growthRate ?? ((speciesInfo(mon.species)?.growthRate as DecompGrowthRate | undefined) ?? 'GROWTH_MEDIUM_FAST');

export const getLevelAfterDaycareSteps = (mon: DaycareBoxMon, steps: number): number =>
  getLevelForExperience(growthRateForMon(mon), (mon.exp ?? getExperienceForLevel(growthRateForMon(mon), 1)) + steps);

export const GetLevelAfterDaycareSteps = (mon: DaycareBoxMon, steps: number): number =>
  getLevelAfterDaycareSteps(mon, steps);

export const getNumLevelsGainedFromSteps = (daycareMon: DaycareMon): number => {
  const levelBefore = getLevelForExperience(growthRateForMon(daycareMon.mon), daycareMon.mon.exp ?? 0);
  const levelAfter = getLevelAfterDaycareSteps(daycareMon.mon, daycareMon.steps);
  return levelAfter - levelBefore;
};

export const GetNumLevelsGainedFromSteps = (daycareMon: DaycareMon): number =>
  getNumLevelsGainedFromSteps(daycareMon);

export const GetNumLevelsGainedForDaycareMon = (
  daycareMon: DaycareMon,
  runtime?: DaycareStringVarRuntime
): number => {
  const numLevelsGained = getNumLevelsGainedFromSteps(daycareMon);
  if (runtime) {
    runtime.gStringVar2 = String(numLevelsGained).padEnd(2, ' ');
    runtime.gStringVar1 = DayCare_GetBoxMonNickname(daycareMon.mon);
  }
  return numLevelsGained;
};

export const getDaycareCostForSelectedMon = (daycareMon: DaycareMon): number =>
  100 + 100 * getNumLevelsGainedFromSteps(daycareMon);

export const GetDaycareCostForSelectedMon = (
  daycareMon: DaycareMon,
  runtime?: DaycareStringVarRuntime
): number => {
  const cost = getDaycareCostForSelectedMon(daycareMon);
  if (runtime) {
    runtime.gStringVar1 = DayCare_GetBoxMonNickname(daycareMon.mon);
    runtime.gStringVar2 = String(cost).padEnd(5, ' ');
  }
  return cost;
};

export const getDaycareCostForMon = (daycare: DayCare, slotId: number): number =>
  getDaycareCostForSelectedMon(daycare.mons[slotId]);

export const GetDaycareCostForMon = (
  daycare: DayCare,
  slotId: number,
  runtime?: DaycareStringVarRuntime
): number => GetDaycareCostForSelectedMon(daycare.mons[slotId], runtime);

export const GetDaycareCost = (
  daycare: DayCare,
  specialVars: DaycareSpecialVars,
  runtime?: DaycareStringVarRuntime
): void => {
  specialVars.gSpecialVar_0x8005 = GetDaycareCostForMon(daycare, specialVars.gSpecialVar_0x8004, runtime);
};

export const GetNumLevelsGainedFromDaycare = (
  daycare: DayCare,
  specialVars: DaycareSpecialVars,
  runtime?: DaycareStringVarRuntime
): number => {
  if (!isSpeciesNone(daycare.mons[specialVars.gSpecialVar_0x8004].mon.species))
    return GetNumLevelsGainedForDaycareMon(daycare.mons[specialVars.gSpecialVar_0x8004], runtime);
  return 0;
};

export const GetCostToWithdrawRoute5DaycareMon = (route5DayCareMon: DaycareMon): number =>
  getDaycareCostForSelectedMon(route5DayCareMon);

export const IsThereMonInRoute5Daycare = (route5DayCareMon: DaycareMon): boolean =>
  !isSpeciesNone(route5DayCareMon.mon.species);

export const GetNumLevelsGainedForRoute5DaycareMon = (route5DayCareMon: DaycareMon): number =>
  getNumLevelsGainedFromSteps(route5DayCareMon);

export const TakePokemonFromRoute5Daycare = (
  route5DayCareMon: DaycareMon,
  partyContext: DaycarePartyContext,
  hooks: DaycareExperienceHooks = createDefaultDaycareExperienceHooks()
): string | number => takeSelectedPokemonFromDaycare(route5DayCareMon, partyContext, hooks);

export const CreatedHatchedMon = (egg: DaycareBoxMon, temp: DaycareBoxMon): void => {
  const species = egg.species;
  const moves = Array.from({ length: MAX_MON_MOVES }, (_, i) => egg.moves?.[i] ?? MOVE_NONE);
  const personality = egg.personality ?? 0;
  const ivs = Array.from({ length: NUM_STATS }, (_, i) => egg.ivs?.[i] ?? 0);
  const gameMet = egg.metGame ?? 0;
  const markings = egg.markings ?? 0;
  const pokerus = egg.pokerus ?? 0;
  const isModernFatefulEncounter = egg.modernFatefulEncounter ?? 0;

  recordMonCall(temp, 'CreateMon', species, EGG_HATCH_LEVEL, USE_RANDOM_IVS, true, personality, OT_ID_PLAYER_ID, 0);
  temp.species = species;
  temp.level = EGG_HATCH_LEVEL;
  temp.createdLevel = EGG_HATCH_LEVEL;
  temp.fixedIv = USE_RANDOM_IVS;
  temp.hasFixedPersonality = true;
  temp.personality = personality;
  temp.otIdType = OT_ID_PLAYER_ID;
  temp.moves = moves;
  temp.ivs = ivs;
  temp.language = GAME_LANGUAGE;
  temp.metGame = gameMet;
  temp.markings = markings;
  temp.friendship = 120;
  temp.pokerus = pokerus;
  temp.modernFatefulEncounter = isModernFatefulEncounter;

  for (const key of Object.keys(egg) as Array<keyof DaycareBoxMon>)
    delete egg[key];
  Object.assign(egg, cloneBoxMon(temp), {
    calls: temp.calls ? temp.calls.map((call) => ({ fn: call.fn, args: [...call.args] })) : undefined
  });
};

const monRestorePP = (mon: DaycareBoxMon): void => {
  mon.ppRestored = true;
};

const calculateMonStats = (mon: DaycareBoxMon): void => {
  mon.statsCalculated = true;
};

export const AddHatchedMonToParty = (
  runtime: DaycareHatchRuntime,
  id: number
): DaycareBoxMon => {
  const mon = runtime.playerParty[id];
  const temp = runtime.enemyParty[0] ?? { species: SPECIES_NONE };
  runtime.enemyParty[0] = temp;

  CreatedHatchedMon(mon, temp);
  mon.isEgg = 0x46;

  const species = mon.species;
  mon.nickname = getSpeciesName(normalizeSpecies(species)) ?? normalizeSpecies(species).replace(/^SPECIES_/u, '');

  const pokeNum = getNationalDexNumber(normalizeSpecies(species)) ?? 0;
  getSetPokedexFlag(runtime, pokeNum, FLAG_SET_SEEN);
  getSetPokedexFlag(runtime, pokeNum, FLAG_SET_CAUGHT);

  runtime.gStringVar1 = mon.nickname ?? '';
  mon.pokeball = ITEM_POKE_BALL;
  mon.metLevel = 0;
  mon.metLocation = runtime.currentRegionMapSectionId;
  monRestorePP(mon);
  calculateMonStats(mon);
  runtime.calls.push({ fn: 'AddHatchedMonToParty', args: [id] });
  return mon;
};

export const ScriptHatchMon = (
  runtime: DaycareHatchRuntime,
  specialVars: DaycareSpecialVars
): DaycareBoxMon => AddHatchedMonToParty(runtime, specialVars.gSpecialVar_0x8004);

export const BufferDayCareMonReceivedMail = (
  daycare: DayCare,
  daycareId: number,
  playerName: string,
  runtime: DaycareStringVarRuntime
): boolean => {
  const daycareMon = daycare.mons[daycareId];
  const nick = daycareMon.mon.nickname ?? '';
  if (
    daycareMon.mail.message.itemId !== ITEM_NONE
    && (nick !== daycareMon.mail.monName || playerName !== daycareMon.mail.otName)
  ) {
    runtime.gStringVar1 = nick;
    runtime.gStringVar2 = daycareMon.mail.otName;
    runtime.gStringVar3 = daycareMon.mail.monName;
    return true;
  }
  return false;
};

export const DaycareMonReceivedMail = (
  daycare: DayCare,
  daycareId: number,
  playerName: string,
  runtime: DaycareStringVarRuntime
): boolean => BufferDayCareMonReceivedMail(daycare, daycareId, playerName, runtime);

export const Debug_AddDaycareSteps = (
  daycare: DayCare,
  route5DayCareMon: DaycareMon,
  numSteps: number
): void => {
  daycare.mons[0].steps += numSteps;
  daycare.mons[1].steps += numSteps;
  route5DayCareMon.steps += numSteps;
};

export const nameHasGenderSymbol = (name: string, genderRatio: number): boolean => {
  let maleCount = 0;
  let femaleCount = 0;
  for (const char of name) {
    if (char === CHAR_MALE) maleCount += 1;
    if (char === CHAR_FEMALE) femaleCount += 1;
  }
  if (genderRatio === MON_MALE && maleCount !== 0 && femaleCount === 0) return true;
  if (genderRatio === MON_FEMALE && femaleCount !== 0 && maleCount === 0) return true;
  return false;
};

export const appendGenderSymbol = (name: string, gender: number): string => {
  if (gender === MON_MALE) {
    if (!nameHasGenderSymbol(name, MON_MALE)) return `${name}${gText_MaleSymbol}`;
  } else if (gender === MON_FEMALE) {
    if (!nameHasGenderSymbol(name, MON_FEMALE)) return `${name}${gText_FemaleSymbol}`;
  }
  return name;
};

export const appendMonGenderSymbol = (name: string, boxMon: DaycareBoxMon): string =>
  appendGenderSymbol(name, getGenderFromSpeciesAndPersonality(boxMon.species, boxMon.personality ?? 0));

export const AppendGenderSymbol = appendGenderSymbol;
export const AppendMonGenderSymbol = appendMonGenderSymbol;

export const getDaycareLevelMenuText = (daycare: DayCare): string => {
  const monNames = daycare.mons.map((entry) => appendMonGenderSymbol(entry.mon.nickname ?? '', entry.mon));
  return `${monNames[0]}\n${monNames[1]}\n${gOtherText_Exit}`;
};

export const getDaycareLevelMenuLevelText = (daycare: DayCare): string => {
  let dest = '';
  for (let i = 0; i < DAYCARE_MON_COUNT; i += 1) {
    const level = getLevelAfterDaycareSteps(daycare.mons[i].mon, daycare.mons[i].steps);
    dest += `${gText_Lv}${String(level).padEnd(3, ' ')}\n`;
  }
  return dest;
};

export const _TriggerPendingDaycareEgg = triggerPendingDaycareEgg;
export const _TriggerPendingDaycareMaleEgg = triggerPendingDaycareMaleEgg;
export const AlterEggSpeciesWithIncenseItem = alterEggSpeciesWithIncenseItem;
export const DetermineEggSpeciesAndParentSlots = determineEggSpeciesAndParentSlots;
export const IsEggPending = isEggPending;
export const EggGroupsOverlap = eggGroupsOverlap;
export const GetDaycareCompatibilityScore = getDaycareCompatibilityScore;
export const NameHasGenderSymbol = nameHasGenderSymbol;
export const GetDaycareLevelMenuText = getDaycareLevelMenuText;
export const GetDaycareLevelMenuLevelText = getDaycareLevelMenuLevelText;

const getStringWidth = (
  runtime: DaycareTextRuntime,
  fontId: number,
  text: string,
  letterSpacing: number
): number => runtime.stringWidthOverrides.get(`${fontId}:${text}:${letterSpacing}`) ?? text.length * 8;

export const DaycareAddTextPrinter = (
  runtime: DaycareTextRuntime,
  windowId: number,
  text: string,
  x: number,
  y: number
): void => {
  const printer: DaycareTextPrinterTemplate = {
    currentChar: text,
    windowId,
    fontId: FONT_NORMAL_COPY_2,
    x,
    y,
    currentX: x,
    currentY: y,
    unk: 0,
    letterSpacing: 1,
    lineSpacing: 1,
    fgColor: 2,
    bgColor: 1,
    shadowColor: 3
  };

  runtime.useAlternateDownArrow = 0;
  runtime.calls.push({ fn: 'AddTextPrinter', args: [printer, 0xff, null] });
};

export const DaycarePrintMonNickname = (
  runtime: DaycareTextRuntime,
  daycare: DayCare,
  windowId: number,
  daycareSlotId: number,
  y: number
): void => {
  const nickname = appendMonGenderSymbol(daycare.mons[daycareSlotId].mon.nickname ?? '', daycare.mons[daycareSlotId].mon);
  DaycareAddTextPrinter(runtime, windowId, nickname, 8, y);
};

export const DaycarePrintMonLvl = (
  runtime: DaycareTextRuntime,
  daycare: DayCare,
  windowId: number,
  daycareSlotId: number,
  y: number
): void => {
  const level = getLevelAfterDaycareSteps(daycare.mons[daycareSlotId].mon, daycare.mons[daycareSlotId].steps);
  const lvlText = `${gText_Lv}${String(level).padEnd(3, ' ')}`;
  const x = 132 - getStringWidth(runtime, FONT_NORMAL_COPY_2, lvlText, 0);
  DaycareAddTextPrinter(runtime, windowId, lvlText, x, y);
};

export const DaycarePrintMonInfo = (
  runtime: DaycareTextRuntime,
  daycare: DayCare,
  windowId: number,
  daycareSlotId: number,
  y: number
): void => {
  if (daycareSlotId < DAYCARE_MON_COUNT) {
    DaycarePrintMonNickname(runtime, daycare, windowId, daycareSlotId, y);
    DaycarePrintMonLvl(runtime, daycare, windowId, daycareSlotId, y);
  }
};

export const Task_HandleDaycareLevelMenuInput = (
  runtime: DaycareMenuRuntime,
  taskId: number
): void => {
  const task = runtime.tasks[taskId];
  if (!task)
    return;

  const input = runtime.listMenuInput;
  runtime.calls.push({ fn: 'ListMenu_ProcessInput', args: [task.data[0], input] });

  if (runtime.newKeys & A_BUTTON) {
    switch (input) {
      case 0:
      case 1:
        runtime.specialVarResult = input;
        break;
      case DAYCARE_LEVEL_MENU_EXIT:
        runtime.specialVarResult = DAYCARE_EXITED_LEVEL_MENU;
        break;
    }
  } else if (runtime.newKeys & B_BUTTON) {
    runtime.specialVarResult = DAYCARE_EXITED_LEVEL_MENU;
  } else {
    return;
  }

  runtime.calls.push({ fn: 'DestroyListMenuTask', args: [task.data[0], null, null] });
  runtime.calls.push({ fn: 'ClearStdWindowAndFrame', args: [task.data[1], true] });
  runtime.calls.push({ fn: 'RemoveWindow', args: [task.data[1]] });
  task.destroyed = true;
  runtime.calls.push({ fn: 'DestroyTask', args: [taskId] });
  runtime.calls.push({ fn: 'ScriptContext_Enable', args: [] });
};

export const ShowDaycareLevelMenu = (runtime: DaycareMenuRuntime): number => {
  const windowId = runtime.nextWindowId;
  runtime.nextWindowId += 1;
  runtime.calls.push({ fn: 'AddWindow', args: [sDaycareLevelMenuWindowTemplate, windowId] });
  runtime.calls.push({ fn: 'DrawStdWindowFrame', args: [windowId, false] });

  const menuTemplate = { ...sDaycareListMenuLevelTemplate, windowId };
  const listMenuTaskId = runtime.nextListMenuTaskId;
  runtime.nextListMenuTaskId += 1;
  runtime.calls.push({ fn: 'ListMenuInit', args: [menuTemplate, 0, 0, listMenuTaskId] });
  runtime.calls.push({ fn: 'CopyWindowToVram', args: [windowId, COPYWIN_FULL] });

  const daycareMenuTaskId = runtime.nextTaskId;
  runtime.nextTaskId += 1;
  runtime.tasks[daycareMenuTaskId] = { data: Array.from({ length: 16 }, () => 0), destroyed: false };
  runtime.calls.push({ fn: 'CreateTask', args: ['Task_HandleDaycareLevelMenuInput', 3, daycareMenuTaskId] });
  runtime.tasks[daycareMenuTaskId]!.data[0] = listMenuTaskId;
  runtime.tasks[daycareMenuTaskId]!.data[1] = windowId;
  return daycareMenuTaskId;
};

const q8_8 = (value: number): number => Math.trunc(value * 256);

export const sEggShardVelocities = [
  [q8_8(-1.5), q8_8(-3.75)],
  [q8_8(-5), q8_8(-3)],
  [q8_8(3.5), q8_8(-3)],
  [q8_8(-4), q8_8(-3.75)],
  [q8_8(2), q8_8(-1.5)],
  [q8_8(-0.5), q8_8(-6.75)],
  [q8_8(5), q8_8(-2.25)],
  [q8_8(-1.5), q8_8(-3.75)],
  [q8_8(4.5), q8_8(-1.5)],
  [q8_8(-1), q8_8(-6.75)],
  [q8_8(4), q8_8(-2.25)],
  [q8_8(-3.5), q8_8(-3.75)],
  [q8_8(1), q8_8(-1.5)],
  [q8_8(-3.515625), q8_8(-6.75)],
  [q8_8(4.5), q8_8(-2.25)],
  [q8_8(-0.5), q8_8(-7.5)],
  [q8_8(1), q8_8(-4.5)],
  [q8_8(-2.5), q8_8(-2.25)],
  [q8_8(2.5), q8_8(-7.5)]
] as const;

const callEggHatch = (runtime: EggHatchRuntime, fn: string, ...args: unknown[]): void => {
  runtime.calls.push({ fn, args });
};

const startSpriteAnim = (runtime: EggHatchRuntime, sprite: EggHatchSprite, animNum: number): void => {
  sprite.animNum = animNum;
  callEggHatch(runtime, 'StartSpriteAnim', sprite.id, animNum);
};

const startSpriteAffineAnim = (runtime: EggHatchRuntime, sprite: EggHatchSprite, animNum: number): void => {
  sprite.affineAnimNum = animNum;
  callEggHatch(runtime, 'StartSpriteAffineAnim', sprite.id, animNum);
};

const playSE = (runtime: EggHatchRuntime, songNum: number): void => {
  callEggHatch(runtime, 'PlaySE', songNum);
};

const playFanfare = (runtime: EggHatchRuntime, songNum: number): void => {
  runtime.fanfareTaskInactive = false;
  callEggHatch(runtime, 'PlayFanfare', songNum);
};

const stringExpandPlaceholders = (template: string, runtime: DaycareStringVarRuntime): string =>
  template
    .replace(/\{STR_VAR_1\}/gu, runtime.gStringVar1)
    .replace(/\{STR_VAR_2\}/gu, runtime.gStringVar2)
    .replace(/\{STR_VAR_3\}/gu, runtime.gStringVar3);

const beginNormalPaletteFade = (
  runtime: EggHatchRuntime,
  selectedPalettes: number,
  delay: number,
  startY: number,
  targetY: number,
  color: number
): void => {
  runtime.paletteFadeActive = true;
  callEggHatch(runtime, 'BeginNormalPaletteFade', selectedPalettes, delay, startY, targetY, color);
};

const destroyEggHatchSprite = (runtime: EggHatchRuntime, sprite: EggHatchSprite): void => {
  sprite.callback = 'Destroyed';
  callEggHatch(runtime, 'DestroySprite', sprite.id);
};

const createEggHatchTask = (runtime: EggHatchRuntime, fn: string, priority: number): number => {
  const taskId = runtime.nextTaskId++;
  runtime.tasks[taskId] = { data: Array.from({ length: 16 }, () => 0), destroyed: false };
  callEggHatch(runtime, 'CreateTask', fn, priority, taskId);
  return taskId;
};

const destroyEggHatchTask = (runtime: EggHatchRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  if (task)
    task.destroyed = true;
  callEggHatch(runtime, 'DestroyTask', taskId);
};

const runEggHatchFrameEnd = (runtime: EggHatchRuntime): void => {
  callEggHatch(runtime, 'RunTasks');
  callEggHatch(runtime, 'RunTextPrinters');
  callEggHatch(runtime, 'AnimateSprites');
  callEggHatch(runtime, 'BuildOamBuffer');
  callEggHatch(runtime, 'UpdatePaletteFade');
};

export const EggHatchSetMonNickname = (runtime: EggHatchRuntime): void => {
  runtime.playerParty[runtime.specialVars.gSpecialVar_0x8004].nickname = runtime.gStringVar3;
  callEggHatch(runtime, 'SetMonData', runtime.specialVars.gSpecialVar_0x8004, 'MON_DATA_NICKNAME', runtime.gStringVar3);
  runtime.monSpritesGfxAllocated = false;
  callEggHatch(runtime, 'FreeMonSpritesGfx');
  runtime.allocatedEggHatchData = false;
  callEggHatch(runtime, 'Free', 'sEggHatchData');
  runtime.helpSystemEnabled = true;
  callEggHatch(runtime, 'HelpSystem_Enable');
  runtime.mainCallback2 = 'CB2_ReturnToField';
  callEggHatch(runtime, 'SetMainCallback2', 'CB2_ReturnToField');
};

export const Task_EggHatchPlayBGM = (runtime: EggHatchRuntime, taskID: number): void => {
  const task = runtime.tasks[taskID];
  if (!task)
    return;
  if (task.data[0] === 0)
    callEggHatch(runtime, 'StopMapMusic');
  if (task.data[0] === 1)
    callEggHatch(runtime, 'PlayBGM', MUS_EVOLUTION_INTRO);
  if (task.data[0] > 60) {
    callEggHatch(runtime, 'PlayBGM', MUS_EVOLUTION);
    destroyEggHatchTask(runtime, taskID);
  }
  task.data[0]++;
};

export const VBlankCB_EggHatch = (runtime: EggHatchRuntime): void => {
  callEggHatch(runtime, 'LoadOam');
  callEggHatch(runtime, 'ProcessSpriteCopyRequests');
  callEggHatch(runtime, 'TransferPlttBuffer');
};

export const EggHatch = (runtime: EggHatchRuntime): number => {
  callEggHatch(runtime, 'LockPlayerFieldControls');
  const taskId = createEggHatchTask(runtime, 'Task_EggHatch', 10);
  beginNormalPaletteFade(runtime, PALETTES_ALL, 0, 0, 16, 0);
  runtime.helpSystemEnabled = false;
  callEggHatch(runtime, 'HelpSystem_Disable');
  return taskId;
};

export const Task_EggHatch = (runtime: EggHatchRuntime, taskID: number): void => {
  if (!runtime.paletteFadeActive) {
    callEggHatch(runtime, 'CleanupOverworldWindowsAndTilemaps');
    runtime.mainCallback2 = 'CB2_EggHatch_0';
    callEggHatch(runtime, 'SetMainCallback2', 'CB2_EggHatch_0');
    runtime.fieldCallback = 'FieldCB_ContinueScriptHandleMusic';
    destroyEggHatchTask(runtime, taskID);
  }
};

export const EggHatchCreateMonSprite = (
  runtime: EggHatchRuntime,
  a0: number,
  switchID: number,
  pokeID: number
): number => {
  let r4 = 0;
  let spriteID = 0;
  const mon = runtime.playerParty[pokeID];

  if (a0 === 0)
    r4 = 1;
  if (a0 === 1)
    r4 = 3;

  switch (switchID) {
    case 0: {
      const species = mon.species;
      const pid = mon.personality ?? 0;
      callEggHatch(runtime, 'HandleLoadSpecialPokePic', species, (a0 * 2) + 1, species, pid);
      callEggHatch(runtime, 'LoadCompressedSpritePalette', species);
      runtime.sEggHatchData.species = species;
      break;
    }
    case 1: {
      callEggHatch(runtime, 'SetMultiuseSpriteTemplateToPokemon', mon.species, r4);
      spriteID = runtime.nextSpriteId++;
      const sprite = createEggHatchSprite({
        id: spriteID,
        x: 120,
        y: 70,
        invisible: true,
        callback: 'SpriteCallbackDummy'
      });
      runtime.sprites[spriteID] = sprite;
      callEggHatch(runtime, 'CreateSprite', 'gMultiuseSpriteTemplate', 120, 70, 6, spriteID);
      break;
    }
  }
  return spriteID;
};

export const CB2_EggHatch_0 = (runtime: EggHatchRuntime): void => {
  switch (runtime.mainState) {
    case 0:
      runtime.gpuRegs.REG_OFFSET_DISPCNT = 0;
      callEggHatch(runtime, 'SetGpuReg', REG_OFFSET_DISPCNT, 0);
      runtime.allocatedEggHatchData = true;
      callEggHatch(runtime, 'Alloc', 'sizeof(struct EggHatchData)');
      runtime.monSpritesGfxAllocated = true;
      callEggHatch(runtime, 'AllocateMonSpritesGfx');
      runtime.sEggHatchData.eggPartyID = runtime.specialVars.gSpecialVar_0x8004;
      runtime.sEggHatchData.eggShardVelocityID = 0;
      runtime.vblankCallback = 'VBlankCB_EggHatch';
      callEggHatch(runtime, 'SetVBlankCallback', 'VBlankCB_EggHatch');
      runtime.specialVars.gSpecialVar_0x8005 = runtime.currentMapMusic;
      callEggHatch(runtime, 'GetCurrentMapMusic', runtime.currentMapMusic);
      callEggHatch(runtime, 'ResetTempTileDataBuffers');
      callEggHatch(runtime, 'ResetBgsAndClearDma3BusyFlags', 0);
      callEggHatch(runtime, 'InitBgsFromTemplates', 0, sBgTemplates_EggHatch, sBgTemplates_EggHatch.length);
      callEggHatch(runtime, 'ChangeBgX', 1, 0, 0);
      callEggHatch(runtime, 'ChangeBgY', 1, 0, 0);
      callEggHatch(runtime, 'ChangeBgX', 0, 0, 0);
      callEggHatch(runtime, 'ChangeBgY', 0, 0, 0);
      callEggHatch(runtime, 'SetBgAttribute', 1, 7, 2);
      runtime.bgTilemapBuffers[1] = 0x1000;
      runtime.bgTilemapBuffers[0] = 0x2000;
      callEggHatch(runtime, 'SetBgTilemapBuffer', 1, 0x1000);
      callEggHatch(runtime, 'SetBgTilemapBuffer', 0, 0x2000);
      callEggHatch(runtime, 'DeactivateAllTextPrinters');
      runtime.paletteFadeActive = false;
      callEggHatch(runtime, 'ResetPaletteFade');
      callEggHatch(runtime, 'FreeAllSpritePalettes');
      callEggHatch(runtime, 'ResetSpriteData');
      callEggHatch(runtime, 'ResetTasks');
      callEggHatch(runtime, 'ScanlineEffect_Stop');
      callEggHatch(runtime, 'm4aSoundVSyncOn');
      runtime.mainState++;
      break;
    case 1:
      callEggHatch(runtime, 'InitWindows', sWinTemplates_EggHatch);
      runtime.sEggHatchData.windowId = 0;
      runtime.mainState++;
      break;
    case 2:
      callEggHatch(runtime, 'DecompressAndLoadBgGfxUsingHeap', 0, 'gBattleInterface_Textbox_Gfx', 0, 0, 0);
      callEggHatch(runtime, 'CopyToBgTilemapBuffer', 0, 'gBattleInterface_Textbox_Tilemap', 0, 0);
      callEggHatch(runtime, 'LoadCompressedPalette', 'gBattleInterface_Textbox_Pal', 'BG_PLTT_ID(0)', 'PLTT_SIZE_4BPP');
      runtime.mainState++;
      break;
    case 3:
      callEggHatch(runtime, 'LoadSpriteSheet', sEggHatch_Sheet);
      callEggHatch(runtime, 'LoadSpriteSheet', sEggShards_Sheet);
      callEggHatch(runtime, 'LoadSpritePalette', sEgg_SpritePalette);
      runtime.mainState++;
      break;
    case 4:
      callEggHatch(runtime, 'CopyBgTilemapBufferToVram', 0);
      AddHatchedMonToParty(runtime, runtime.sEggHatchData.eggPartyID);
      runtime.mainState++;
      break;
    case 5:
      EggHatchCreateMonSprite(runtime, 0, 0, runtime.sEggHatchData.eggPartyID);
      runtime.mainState++;
      break;
    case 6:
      runtime.sEggHatchData.pokeSpriteID = EggHatchCreateMonSprite(runtime, 0, 1, runtime.sEggHatchData.eggPartyID);
      runtime.mainState++;
      break;
    case 7:
      runtime.gpuRegs.REG_OFFSET_DISPCNT = DISPCNT_OBJ_ON | DISPCNT_OBJ_1D_MAP;
      callEggHatch(runtime, 'SetGpuReg', REG_OFFSET_DISPCNT, DISPCNT_OBJ_ON | DISPCNT_OBJ_1D_MAP);
      callEggHatch(runtime, 'LoadPalette', 'gTradeGba2_Pal', 'BG_PLTT_ID(1)', '5 * PLTT_SIZE_4BPP');
      callEggHatch(runtime, 'LoadBgTiles', 1, 'gTradeGba_Gfx', 0x1420, 0);
      callEggHatch(runtime, 'CopyToBgTilemapBuffer', 1, 'gTradeOrHatchMonShadowTilemap', 0x1000, 0);
      callEggHatch(runtime, 'CopyBgTilemapBufferToVram', 1);
      runtime.mainState++;
      break;
    case 8:
      runtime.mainCallback2 = 'CB2_EggHatch_1';
      callEggHatch(runtime, 'SetMainCallback2', 'CB2_EggHatch_1');
      runtime.sEggHatchData.CB2_state = 0;
      break;
  }
  runEggHatchFrameEnd(runtime);
};

export const CB2_EggHatch_1 = (runtime: EggHatchRuntime): void => {
  switch (runtime.sEggHatchData.CB2_state) {
    case 0: {
      beginNormalPaletteFade(runtime, PALETTES_ALL, 0, 0x10, 0, RGB_BLACK);
      const spriteID = runtime.nextSpriteId++;
      runtime.sEggHatchData.eggSpriteID = spriteID;
      runtime.sprites[spriteID] = createEggHatchSprite({
        id: spriteID,
        x: 120,
        y: 75,
        callback: 'SpriteCallbackDummy'
      });
      callEggHatch(runtime, 'CreateSprite', 'sSpriteTemplate_EggHatch', 120, 75, 5, spriteID);
      callEggHatch(runtime, 'ShowBg', 0);
      callEggHatch(runtime, 'ShowBg', 1);
      runtime.sEggHatchData.CB2_state++;
      createEggHatchTask(runtime, 'Task_EggHatchPlayBGM', 5);
      break;
    }
    case 1:
      if (!runtime.paletteFadeActive) {
        callEggHatch(runtime, 'FillWindowPixelBuffer', runtime.sEggHatchData.windowId, 0x00);
        runtime.sEggHatchData.CB2_PalCounter = 0;
        runtime.sEggHatchData.CB2_state++;
      }
      break;
    case 2:
      if (++runtime.sEggHatchData.CB2_PalCounter > 30) {
        runtime.sEggHatchData.CB2_state++;
        runtime.sprites[runtime.sEggHatchData.eggSpriteID].callback = 'SpriteCB_Egg_0';
      }
      break;
    case 3:
      if (runtime.sprites[runtime.sEggHatchData.eggSpriteID].callback === 'SpriteCallbackDummy') {
        callEggHatch(runtime, 'PlayCry_Normal', runtime.sEggHatchData.species, 0);
        runtime.cryFinished = false;
        runtime.sEggHatchData.CB2_state++;
      }
      break;
    case 4:
      if (runtime.cryFinished)
        runtime.sEggHatchData.CB2_state++;
      break;
    case 5:
      runtime.gStringVar1 = runtime.playerParty[runtime.sEggHatchData.eggPartyID].nickname ?? '';
      runtime.gStringVar4 = stringExpandPlaceholders(gText_HatchedFromEgg, runtime);
      EggHatchPrintMessage(runtime, runtime.sEggHatchData.windowId, runtime.gStringVar4, 0, 3, 0xff);
      playFanfare(runtime, MUS_EVOLVED);
      runtime.sEggHatchData.CB2_state++;
      callEggHatch(runtime, 'PutWindowTilemap', runtime.sEggHatchData.windowId);
      callEggHatch(runtime, 'CopyWindowToVram', runtime.sEggHatchData.windowId, COPYWIN_FULL);
      break;
    case 6:
      if (runtime.fanfareTaskInactive)
        runtime.sEggHatchData.CB2_state++;
      break;
    case 7:
      if (runtime.fanfareTaskInactive)
        runtime.sEggHatchData.CB2_state++;
      break;
    case 8:
      runtime.gStringVar1 = runtime.playerParty[runtime.sEggHatchData.eggPartyID].nickname ?? '';
      runtime.gStringVar4 = stringExpandPlaceholders(gText_NickHatchPrompt, runtime);
      EggHatchPrintMessage(runtime, runtime.sEggHatchData.windowId, runtime.gStringVar4, 0, 2, 1);
      runtime.sEggHatchData.CB2_state++;
      break;
    case 9:
      if (!runtime.textPrinterActive) {
        callEggHatch(runtime, 'LoadUserWindowGfx2', runtime.sEggHatchData.windowId, 0x140, 'BG_PLTT_ID(14)');
        callEggHatch(runtime, 'CreateYesNoMenu', sYesNoWinTemplate, FONT_NORMAL_COPY_2, 0, 2, 0x140, 14, 0);
        runtime.sEggHatchData.CB2_state++;
      }
      break;
    case 10:
      callEggHatch(runtime, 'Menu_ProcessInputNoWrapClearOnChoose', runtime.menuInput);
      switch (runtime.menuInput) {
        case 0: {
          const mon = runtime.playerParty[runtime.sEggHatchData.eggPartyID];
          runtime.gStringVar3 = mon.nickname ?? '';
          const species = mon.species;
          const gender = getBoxMonGender(mon);
          const personality = mon.personality ?? 0;
          callEggHatch(
            runtime,
            'DoNamingScreen',
            NAMING_SCREEN_NICKNAME,
            runtime.gStringVar3,
            species,
            gender,
            personality,
            'EggHatchSetMonNickname'
          );
          break;
        }
        case 1:
        case -1:
          runtime.sEggHatchData.CB2_state++;
          break;
      }
      break;
    case 11:
      beginNormalPaletteFade(runtime, PALETTES_ALL, 0, 0, 0x10, RGB_BLACK);
      runtime.sEggHatchData.CB2_state++;
      break;
    case 12:
      if (!runtime.paletteFadeActive) {
        callEggHatch(runtime, 'RemoveWindow', runtime.sEggHatchData.windowId);
        runtime.bgTilemapBuffers[0] = null;
        runtime.bgTilemapBuffers[1] = null;
        callEggHatch(runtime, 'UnsetBgTilemapBuffer', 0);
        callEggHatch(runtime, 'UnsetBgTilemapBuffer', 1);
        runtime.allocatedEggHatchData = false;
        callEggHatch(runtime, 'Free', 'sEggHatchData');
        runtime.mainCallback2 = 'CB2_ReturnToField';
        callEggHatch(runtime, 'SetMainCallback2', 'CB2_ReturnToField');
        runtime.helpSystemEnabled = true;
        callEggHatch(runtime, 'HelpSystem_Enable');
      }
      break;
  }

  runEggHatchFrameEnd(runtime);
};

export const CreateEggShardSprite = (
  runtime: EggHatchRuntime,
  x: number,
  y: number,
  data1: number,
  data2: number,
  data3: number,
  spriteAnimIndex: number
): number => {
  const spriteID = runtime.sprites.length;
  const sprite = createEggHatchSprite({
    id: spriteID,
    x,
    y,
    callback: 'SpriteCB_EggShard'
  });
  runtime.sprites.push(sprite);
  callEggHatch(runtime, 'CreateSprite', 'sSpriteTemplate_EggShard', x, y, 4);
  sprite.data[1] = data1;
  sprite.data[2] = data2;
  sprite.data[3] = data3;
  startSpriteAnim(runtime, sprite, spriteAnimIndex);
  return spriteID;
};

export const CreateRandomEggShardSprite = (runtime: EggHatchRuntime): number => {
  const velocity1 = sEggShardVelocities[runtime.sEggHatchData.eggShardVelocityID][0];
  const velocity2 = sEggShardVelocities[runtime.sEggHatchData.eggShardVelocityID][1];
  runtime.sEggHatchData.eggShardVelocityID++;
  const spriteAnimIndex = runtime.random() % 4;
  return CreateEggShardSprite(runtime, 120, 60, velocity1, velocity2, 100, spriteAnimIndex);
};

export const SpriteCB_Egg_0 = (runtime: EggHatchRuntime, sprite: EggHatchSprite): void => {
  if (++sprite.data[0] > 20) {
    sprite.callback = 'SpriteCB_Egg_1';
    sprite.data[0] = 0;
  } else {
    sprite.data[1] = (sprite.data[1] + 20) & 0xff;
    sprite.x2 = sin(sprite.data[1], 1);
    if (sprite.data[0] === 15) {
      playSE(runtime, SE_BALL);
      startSpriteAnim(runtime, sprite, 1);
      CreateRandomEggShardSprite(runtime);
    }
  }
};

export const SpriteCB_Egg_1 = (runtime: EggHatchRuntime, sprite: EggHatchSprite): void => {
  if (++sprite.data[2] > 30) {
    if (++sprite.data[0] > 20) {
      sprite.callback = 'SpriteCB_Egg_2';
      sprite.data[0] = 0;
      sprite.data[2] = 0;
    } else {
      sprite.data[1] = (sprite.data[1] + 20) & 0xff;
      sprite.x2 = sin(sprite.data[1], 2);
      if (sprite.data[0] === 15) {
        playSE(runtime, SE_BALL);
        startSpriteAnim(runtime, sprite, 2);
      }
    }
  }
};

export const SpriteCB_Egg_2 = (runtime: EggHatchRuntime, sprite: EggHatchSprite): void => {
  if (++sprite.data[2] > 30) {
    if (++sprite.data[0] > 38) {
      sprite.callback = 'SpriteCB_Egg_3';
      sprite.data[0] = 0;
      const species = runtime.playerParty[runtime.sEggHatchData.eggPartyID].species;
      const pokeSprite = runtime.sprites[runtime.sEggHatchData.pokeSpriteID];
      pokeSprite.x2 = 0;
      pokeSprite.y2 = runtime.monFrontPicCoords[species]?.y_offset ?? 0;
    } else {
      sprite.data[1] = (sprite.data[1] + 20) & 0xff;
      sprite.x2 = sin(sprite.data[1], 2);
      if (sprite.data[0] === 15) {
        playSE(runtime, SE_BALL);
        startSpriteAnim(runtime, sprite, 2);
        CreateRandomEggShardSprite(runtime);
        CreateRandomEggShardSprite(runtime);
      }
      if (sprite.data[0] === 30)
        playSE(runtime, SE_BALL);
    }
  }
};

export const SpriteCB_Egg_3 = (_runtime: EggHatchRuntime, sprite: EggHatchSprite): void => {
  if (++sprite.data[0] > 50) {
    sprite.callback = 'SpriteCB_Egg_4';
    sprite.data[0] = 0;
  }
};

export const SpriteCB_Egg_4 = (runtime: EggHatchRuntime, sprite: EggHatchSprite): void => {
  if (sprite.data[0] === 0)
    beginNormalPaletteFade(runtime, PALETTES_ALL, -1, 0, 0x10, 0xffff);
  if (sprite.data[0] < 4) {
    for (let i = 0; i <= 3; i += 1)
      CreateRandomEggShardSprite(runtime);
  }
  sprite.data[0]++;
  if (!runtime.paletteFadeActive) {
    playSE(runtime, SE_EGG_HATCH);
    sprite.invisible = true;
    sprite.callback = 'SpriteCB_Egg_5';
    sprite.data[0] = 0;
  }
};

export const SpriteCB_Egg_5 = (runtime: EggHatchRuntime, sprite: EggHatchSprite): void => {
  const pokeSprite = runtime.sprites[runtime.sEggHatchData.pokeSpriteID];
  if (sprite.data[0] === 0) {
    pokeSprite.invisible = false;
    startSpriteAffineAnim(runtime, pokeSprite, 1);
  }
  if (sprite.data[0] === 8)
    beginNormalPaletteFade(runtime, PALETTES_ALL, -1, 0x10, 0, 0xffff);
  if (sprite.data[0] <= 9)
    pokeSprite.y -= 1;
  if (sprite.data[0] > 40)
    sprite.callback = 'SpriteCallbackDummy';
  sprite.data[0]++;
};

export const SpriteCB_EggShard = (runtime: EggHatchRuntime, sprite: EggHatchSprite): void => {
  sprite.data[4] += sprite.data[1];
  sprite.data[5] += sprite.data[2];

  sprite.x2 = Math.trunc(sprite.data[4] / 256);
  sprite.y2 = Math.trunc(sprite.data[5] / 256);

  sprite.data[2] += sprite.data[3];

  if (sprite.y + sprite.y2 > sprite.y + 20 && sprite.data[2] > 0)
    destroyEggHatchSprite(runtime, sprite);
};

export const EggHatchPrintMessage = (
  runtime: EggHatchRuntime,
  windowId: number,
  string: string,
  x: number,
  y: number,
  speed: number
): void => {
  callEggHatch(runtime, 'FillWindowPixelBuffer', windowId, 0xff);
  runtime.sEggHatchData.textColor[0] = 0;
  runtime.sEggHatchData.textColor[1] = 5;
  runtime.sEggHatchData.textColor[2] = 6;
  callEggHatch(runtime, 'AddTextPrinterParameterized4', windowId, 'FONT_NORMAL_COPY_2', x, y, 1, 1, [...runtime.sEggHatchData.textColor], speed, string);
};
