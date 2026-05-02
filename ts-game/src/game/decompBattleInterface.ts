import { OBJ_PLTT_OFFSET, PLTT_ID, RGB } from './decompPalette';

export const HP_CURRENT = 0;
export const HP_MAX = 1;

export const HEALTH_BAR = 0;
export const EXP_BAR = 1;

export const HP_BAR_EMPTY = 0;
export const HP_BAR_RED = 1;
export const HP_BAR_YELLOW = 2;
export const HP_BAR_GREEN = 3;
export const HP_BAR_FULL = 4;

export const HEALTHBOX_ALL = 0;
export const HEALTHBOX_CURRENT_HP = 1;
export const HEALTHBOX_MAX_HP = 2;
export const HEALTHBOX_LEVEL = 3;
export const HEALTHBOX_NICK = 4;
export const HEALTHBOX_HEALTH_BAR = 5;
export const HEALTHBOX_EXP_BAR = 6;
export const HEALTHBOX_UNUSED_7 = 7;
export const HEALTHBOX_UNUSED_8 = 8;
export const HEALTHBOX_STATUS_ICON = 9;
export const HEALTHBOX_SAFARI_ALL_TEXT = 10;
export const HEALTHBOX_SAFARI_BALLS_TEXT = 11;

export const B_SIDE_PLAYER = 0;
export const B_SIDE_OPPONENT = 1;
export const B_POSITION_PLAYER_LEFT = 0;
export const B_POSITION_OPPONENT_LEFT = 1;
export const B_POSITION_PLAYER_RIGHT = 2;
export const B_POSITION_OPPONENT_RIGHT = 3;
export const B_HEALTHBAR_NUM_PIXELS = 48;
export const B_HEALTHBAR_NUM_TILES = B_HEALTHBAR_NUM_PIXELS / 8;
export const B_EXPBAR_NUM_PIXELS = 64;
export const B_EXPBAR_NUM_TILES = B_EXPBAR_NUM_PIXELS / 8;
export const DISPLAY_WIDTH = 240;
export const PARTY_SIZE = 6;
export const B_INTERFACE_GFX_HP_BAR_GREEN = 3;
export const B_INTERFACE_GFX_EXP_BAR = 12;
export const B_INTERFACE_GFX_TRANSPARENT = 0;
export const B_INTERFACE_GFX_HP_BAR_HP_TEXT = 1;
export const B_INTERFACE_GFX_STATUS_PSN_BATTLER0 = 21;
export const B_INTERFACE_GFX_STATUS_PAR_BATTLER0 = 24;
export const B_INTERFACE_GFX_STATUS_SLP_BATTLER0 = 27;
export const B_INTERFACE_GFX_STATUS_FRZ_BATTLER0 = 30;
export const B_INTERFACE_GFX_STATUS_BRN_BATTLER0 = 33;
export const B_INTERFACE_GFX_STATUS_NONE = 39;
export const B_INTERFACE_GFX_SAFARI_HEALTHBOX_0 = 43;
export const B_INTERFACE_GFX_SAFARI_HEALTHBOX_1 = 44;
export const B_INTERFACE_GFX_SAFARI_HEALTHBOX_2 = 45;
export const B_INTERFACE_GFX_HP_BAR_YELLOW = 47;
export const B_INTERFACE_GFX_HP_BAR_RED = 56;
export const B_INTERFACE_GFX_HP_BAR_LEFT_BORDER = 65;
export const B_INTERFACE_GFX_BALL_PARTY_SUMMARY = 66;
export const B_INTERFACE_GFX_BALL_CAUGHT = 70;
export const B_INTERFACE_GFX_STATUS_PSN_BATTLER1 = 71;
export const B_INTERFACE_GFX_STATUS_PAR_BATTLER1 = 74;
export const B_INTERFACE_GFX_STATUS_SLP_BATTLER1 = 77;
export const B_INTERFACE_GFX_STATUS_FRZ_BATTLER1 = 80;
export const B_INTERFACE_GFX_STATUS_BRN_BATTLER1 = 83;
export const B_INTERFACE_GFX_STATUS_PSN_BATTLER2 = 86;
export const B_INTERFACE_GFX_STATUS_PAR_BATTLER2 = 89;
export const B_INTERFACE_GFX_STATUS_SLP_BATTLER2 = 92;
export const B_INTERFACE_GFX_STATUS_FRZ_BATTLER2 = 95;
export const B_INTERFACE_GFX_STATUS_BRN_BATTLER2 = 98;
export const B_INTERFACE_GFX_STATUS_PSN_BATTLER3 = 101;
export const B_INTERFACE_GFX_STATUS_PAR_BATTLER3 = 104;
export const B_INTERFACE_GFX_STATUS_SLP_BATTLER3 = 107;
export const B_INTERFACE_GFX_STATUS_FRZ_BATTLER3 = 110;
export const B_INTERFACE_GFX_STATUS_BRN_BATTLER3 = 113;
export const B_INTERFACE_GFX_BOTTOM_RIGHT_CORNER_HP_AS_TEXT = 116;
export const B_INTERFACE_GFX_BOTTOM_RIGHT_CORNER_HP_AS_BAR = 117;
export const MAX_LEVEL = 100;
export const TILE_SIZE_4BPP = 32;
export const TAG_HEALTHBOX_PLAYER1_TILE = 55039;
export const TAG_HEALTHBOX_PLAYER2_TILE = 55040;
export const TAG_HEALTHBOX_OPPONENT1_TILE = 55041;
export const TAG_HEALTHBOX_OPPONENT2_TILE = 55042;
export const TAG_HEALTHBAR_PLAYER1_TILE = 55044;
export const TAG_HEALTHBAR_OPPONENT1_TILE = 55045;
export const TAG_HEALTHBAR_PLAYER2_TILE = 55046;
export const TAG_HEALTHBAR_OPPONENT2_TILE = 55047;
export const TAG_HEALTHBOX_SAFARI_TILE = 55051;
export const TAG_PARTY_SUMMARY_BAR_PLAYER_TILE = 55052;
export const TAG_PARTY_SUMMARY_BAR_OPPONENT_TILE = 55053;
export const TAG_PARTY_SUMMARY_BAR_PLAYER_PAL = 55056;
export const TAG_PARTY_SUMMARY_BAR_OPPONENT_PAL = 55057;
export const TAG_PARTY_SUMMARY_BALL_PLAYER_PAL = 55058;
export const TAG_PARTY_SUMMARY_BALL_OPPONENT_PAL = 55059;
export const TAG_PARTY_SUMMARY_BALL_PLAYER_TILE = 55060;
export const TAG_PARTY_SUMMARY_BALL_OPPONENT_TILE = 55061;
export const TAG_HEALTHBOX_PAL = TAG_HEALTHBOX_PLAYER1_TILE;
export const TAG_HEALTHBAR_PAL = TAG_HEALTHBAR_PLAYER1_TILE;
export const BATTLE_TYPE_TRAINER = 1 << 3;
export const BATTLE_TYPE_FIRST_BATTLE = 1 << 4;
export const BATTLE_TYPE_MULTI = 1 << 6;
export const BATTLE_TYPE_SAFARI = 1 << 7;
export const BATTLE_TYPE_OLD_MAN_TUTORIAL = 1 << 9;
export const BATTLE_TYPE_POKEDUDE = 1 << 16;
export const SOUND_PAN_ATTACKER = -64;
export const SOUND_PAN_TARGET = 63;
export const SE_BALL_TRAY_EXIT = 149;
export const SE_BALL_TRAY_BALL = 150;
export const SE_BALL_TRAY_ENTER = 107;
export const REG_OFFSET_BLDCNT = 0x50;
export const REG_OFFSET_BLDALPHA = 0x52;
export const BLDCNT_TGT2_ALL = 0x3f00;
export const BLDCNT_EFFECT_BLEND = 0x0040;
export const BLDALPHA_BLEND = (eva: number, evb: number): number => (eva & 0x1f) | ((evb & 0x1f) << 8);
export const ST_OAM_OBJ_BLEND = 1;
export const ST_OAM_HFLIP = 0x08;
export const SPRITE_SHAPE_64x64 = 0;
export const SPRITE_SHAPE_64x32 = 1;
export const SPRITE_SHAPE_32x32 = 0;
export const SPRITE_SHAPE_32x8 = 1;
export const SPRITE_SHAPE_8x8 = 0;
export const SPRITE_SIZE_64x32 = 3;
export const SPRITE_SIZE_32x32 = 2;
export const SPRITE_SIZE_32x8 = 1;
export const SPRITE_SIZE_8x8 = 0;
export const SUBSPRITES_IGNORE_PRIORITY = 2;
export const HEALTHBAR_TYPE_PLAYER_SINGLE = 0;
export const HEALTHBAR_TYPE_PLAYER_DOUBLE = 1;
export const HEALTHBAR_TYPE_OPPONENT = 2;
export const HP_EMPTY_SLOT = 0xffff;

export const STATUS1_SLEEP = (1 << 0) | (1 << 1) | (1 << 2);
export const STATUS1_POISON = 1 << 3;
export const STATUS1_BURN = 1 << 4;
export const STATUS1_FREEZE = 1 << 5;
export const STATUS1_PARALYSIS = 1 << 6;
export const STATUS1_TOXIC_POISON = 1 << 7;
export const STATUS1_PSN_ANY = STATUS1_POISON | STATUS1_TOXIC_POISON;
export const SPECIES_NIDORAN_F = 29;
export const SPECIES_NIDORAN_M = 32;
export const MON_MALE = 0x00;
export const MON_FEMALE = 0xfe;
export const CHAR_MALE = '♂';
export const CHAR_FEMALE = '♀';
export const TEXT_DYNAMIC_COLOR_1 = '{DYNAMIC_COLOR_1}';
export const TEXT_DYNAMIC_COLOR_2 = '{DYNAMIC_COLOR_2}';

export const PLTT_SIZEOF = (n: number): number => n * 2;
export const PIXEL_FILL = (num: number): number => num | (num << 4);
export const FONT_SMALL = 0;
export const WINDOW_TILE_DATA = 'WINDOW_TILE_DATA';
export const STR_CONV_MODE_LEFT_ALIGN = 0;
export const STR_CONV_MODE_RIGHT_ALIGN = 1;
export const STR_CONV_MODE_LEADING_ZEROS = 2;
export const CHAR_SLASH = '/';
export const gText_SafariBalls = '{HIGHLIGHT 2}SAFARI BALLS';
export const gText_HighlightRed_Left = '{HIGHLIGHT 2}Left: ';
export const sText_HealthboxNickname = '{HIGHLIGHT 02}';
export const sText_Slash = '/';
export const sBattleInterface_Unused = {
  incbin: 'graphics/battle_interface/unused.4bpp',
  type: 'u16'
} as const;

const gSpeciesNames: Record<number, string> = {
  [SPECIES_NIDORAN_F]: 'NIDORAN♀',
  [SPECIES_NIDORAN_M]: 'NIDORAN♂'
};

export const PAL_STATUS_PSN = 0;
export const PAL_STATUS_PAR = 1;
export const PAL_STATUS_SLP = 2;
export const PAL_STATUS_FRZ = 3;
export const PAL_STATUS_BRN = 4;

export const sStatusIconColors = [
  RGB(24, 12, 24),
  RGB(23, 23, 3),
  RGB(20, 20, 17),
  RGB(17, 22, 28),
  RGB(28, 14, 10)
];

export interface BattleInterfaceSubsprite {
  x: number;
  y: number;
  shape: number;
  size: number;
  tileOffset: number;
  priority: number;
}

export interface BattleInterfaceSubspriteTable {
  count: number;
  subsprites: BattleInterfaceSubsprite[];
}

export const sUnused_Subsprites_0: BattleInterfaceSubsprite[] = [
  { x: -16, y: 0, shape: SPRITE_SHAPE_64x32, size: SPRITE_SIZE_64x32, tileOffset: 0, priority: 1 },
  { x: 48, y: 0, shape: SPRITE_SHAPE_32x32, size: SPRITE_SIZE_32x32, tileOffset: 32, priority: 1 },
  { x: -16, y: 32, shape: SPRITE_SHAPE_32x8, size: SPRITE_SIZE_32x8, tileOffset: 48, priority: 1 },
  { x: 16, y: 32, shape: SPRITE_SHAPE_32x8, size: SPRITE_SIZE_32x8, tileOffset: 52, priority: 1 },
  { x: 48, y: 32, shape: SPRITE_SHAPE_32x8, size: SPRITE_SIZE_32x8, tileOffset: 56, priority: 1 }
];

export const sUnused_Subsprites_2: BattleInterfaceSubsprite[] = [
  { x: -16, y: 0, shape: SPRITE_SHAPE_64x32, size: SPRITE_SIZE_64x32, tileOffset: 64, priority: 1 },
  { x: 48, y: 0, shape: SPRITE_SHAPE_32x32, size: SPRITE_SIZE_32x32, tileOffset: 96, priority: 1 },
  { x: -16, y: 32, shape: SPRITE_SHAPE_32x8, size: SPRITE_SIZE_32x8, tileOffset: 112, priority: 1 },
  { x: 16, y: 32, shape: SPRITE_SHAPE_32x8, size: SPRITE_SIZE_32x8, tileOffset: 116, priority: 1 },
  { x: 48, y: 32, shape: SPRITE_SHAPE_32x8, size: SPRITE_SIZE_32x8, tileOffset: 120, priority: 1 }
];

export const sUnused_Subsprites_1: BattleInterfaceSubsprite[] = [
  { x: -16, y: 0, shape: SPRITE_SHAPE_64x32, size: SPRITE_SIZE_64x32, tileOffset: 0, priority: 1 },
  { x: 48, y: 0, shape: SPRITE_SHAPE_32x32, size: SPRITE_SIZE_32x32, tileOffset: 32, priority: 1 }
];

export const sUnused_Subsprites_3: BattleInterfaceSubsprite[] = [
  { x: -16, y: 0, shape: SPRITE_SHAPE_64x32, size: SPRITE_SIZE_64x32, tileOffset: 0, priority: 1 },
  { x: 48, y: 0, shape: SPRITE_SHAPE_32x32, size: SPRITE_SIZE_32x32, tileOffset: 32, priority: 1 }
];

export const sHealthBar_Subsprites_Player: BattleInterfaceSubsprite[] = [
  { x: -16, y: 0, shape: SPRITE_SHAPE_32x8, size: SPRITE_SIZE_32x8, tileOffset: 0, priority: 1 },
  { x: 16, y: 0, shape: SPRITE_SHAPE_32x8, size: SPRITE_SIZE_32x8, tileOffset: 4, priority: 1 }
];

export const sHealthBar_Subsprites_Opponent: BattleInterfaceSubsprite[] = [
  { x: -16, y: 0, shape: SPRITE_SHAPE_32x8, size: SPRITE_SIZE_32x8, tileOffset: 0, priority: 1 },
  { x: 16, y: 0, shape: SPRITE_SHAPE_32x8, size: SPRITE_SIZE_32x8, tileOffset: 4, priority: 1 },
  { x: -32, y: 0, shape: SPRITE_SHAPE_8x8, size: SPRITE_SIZE_8x8, tileOffset: 8, priority: 1 }
];

export const sUnused_SubspriteTable: BattleInterfaceSubspriteTable[] = [
  { count: sUnused_Subsprites_0.length, subsprites: sUnused_Subsprites_0 },
  { count: sUnused_Subsprites_1.length, subsprites: sUnused_Subsprites_1 },
  { count: sUnused_Subsprites_2.length, subsprites: sUnused_Subsprites_2 },
  { count: sUnused_Subsprites_3.length, subsprites: sUnused_Subsprites_3 }
];

export const sHealthBar_SubspriteTable: BattleInterfaceSubspriteTable[] = [
  { count: sHealthBar_Subsprites_Player.length, subsprites: sHealthBar_Subsprites_Player },
  { count: sHealthBar_Subsprites_Opponent.length, subsprites: sHealthBar_Subsprites_Opponent }
];

export const sStatusSummaryBar_Subsprites_Enter: BattleInterfaceSubsprite[] = [
  { x: -96, y: 0, shape: SPRITE_SHAPE_32x8, size: SPRITE_SIZE_32x8, tileOffset: 0, priority: 1 },
  { x: -64, y: 0, shape: SPRITE_SHAPE_32x8, size: SPRITE_SIZE_32x8, tileOffset: 4, priority: 1 },
  { x: -32, y: 0, shape: SPRITE_SHAPE_32x8, size: SPRITE_SIZE_32x8, tileOffset: 8, priority: 1 },
  { x: 0, y: 0, shape: SPRITE_SHAPE_32x8, size: SPRITE_SIZE_32x8, tileOffset: 12, priority: 1 }
];

export const sStatusSummaryBar_Subsprites_Exit: BattleInterfaceSubsprite[] = [
  { x: -96, y: 0, shape: SPRITE_SHAPE_32x8, size: SPRITE_SIZE_32x8, tileOffset: 0, priority: 1 },
  { x: -64, y: 0, shape: SPRITE_SHAPE_32x8, size: SPRITE_SIZE_32x8, tileOffset: 4, priority: 1 },
  { x: -32, y: 0, shape: SPRITE_SHAPE_32x8, size: SPRITE_SIZE_32x8, tileOffset: 8, priority: 1 },
  { x: 0, y: 0, shape: SPRITE_SHAPE_32x8, size: SPRITE_SIZE_32x8, tileOffset: 8, priority: 1 },
  { x: 32, y: 0, shape: SPRITE_SHAPE_32x8, size: SPRITE_SIZE_32x8, tileOffset: 8, priority: 1 },
  { x: 64, y: 0, shape: SPRITE_SHAPE_32x8, size: SPRITE_SIZE_32x8, tileOffset: 12, priority: 1 }
];

export const sStatusSummaryBar_SubspriteTable_Enter: BattleInterfaceSubspriteTable[] = [
  { count: sStatusSummaryBar_Subsprites_Enter.length, subsprites: sStatusSummaryBar_Subsprites_Enter }
];

export const sStatusSummaryBar_SubspriteTable_Exit: BattleInterfaceSubspriteTable[] = [
  { count: sStatusSummaryBar_Subsprites_Exit.length, subsprites: sStatusSummaryBar_Subsprites_Exit }
];

export interface BattleInterfaceOamData {
  shape: number;
  size: number;
  priority: number;
}

export interface BattleInterfaceSpriteTemplateData {
  tileTag: number;
  paletteTag: number;
  oam: BattleInterfaceOamData;
  anims: string;
  affineAnims: string;
  callback: BattleInterfaceSpriteCallback;
}

export interface BattleInterfaceSpriteSheetData {
  data: string;
  size: number;
  tag: number;
}

export interface BattleInterfaceSpritePaletteData {
  data: string;
  tag: number;
}

export interface BattleInterfaceWindowTemplate {
  bg: number;
  tilemapLeft: number;
  tilemapTop: number;
  width: number;
  height: number;
  paletteNum: number;
  baseBlock: number;
}

export const sHealthboxWindowTemplate: BattleInterfaceWindowTemplate = {
  bg: 0,
  tilemapLeft: 0,
  tilemapTop: 0,
  width: 8,
  height: 2,
  paletteNum: 0,
  baseBlock: 0
};

export const sOamData_Healthbox: BattleInterfaceOamData = {
  shape: SPRITE_SHAPE_64x32,
  size: SPRITE_SIZE_64x32,
  priority: 1
};

export const sHealthboxPlayerSpriteTemplates: BattleInterfaceSpriteTemplateData[] = [
  { tileTag: TAG_HEALTHBOX_PLAYER1_TILE, paletteTag: TAG_HEALTHBOX_PAL, oam: sOamData_Healthbox, anims: 'gDummySpriteAnimTable', affineAnims: 'gDummySpriteAffineAnimTable', callback: 'SpriteCallbackDummy' },
  { tileTag: TAG_HEALTHBOX_PLAYER2_TILE, paletteTag: TAG_HEALTHBOX_PAL, oam: sOamData_Healthbox, anims: 'gDummySpriteAnimTable', affineAnims: 'gDummySpriteAffineAnimTable', callback: 'SpriteCallbackDummy' }
];

export const sHealthboxOpponentSpriteTemplates: BattleInterfaceSpriteTemplateData[] = [
  { tileTag: TAG_HEALTHBOX_OPPONENT1_TILE, paletteTag: TAG_HEALTHBOX_PAL, oam: sOamData_Healthbox, anims: 'gDummySpriteAnimTable', affineAnims: 'gDummySpriteAffineAnimTable', callback: 'SpriteCallbackDummy' },
  { tileTag: TAG_HEALTHBOX_OPPONENT2_TILE, paletteTag: TAG_HEALTHBOX_PAL, oam: sOamData_Healthbox, anims: 'gDummySpriteAnimTable', affineAnims: 'gDummySpriteAffineAnimTable', callback: 'SpriteCallbackDummy' }
];

export const sHealthboxSafariSpriteTemplate: BattleInterfaceSpriteTemplateData = {
  tileTag: TAG_HEALTHBOX_SAFARI_TILE,
  paletteTag: TAG_HEALTHBOX_PAL,
  oam: sOamData_Healthbox,
  anims: 'gDummySpriteAnimTable',
  affineAnims: 'gDummySpriteAffineAnimTable',
  callback: 'SpriteCallbackDummy'
};

export const sOamData_Healthbar: BattleInterfaceOamData = {
  shape: SPRITE_SHAPE_32x8,
  size: SPRITE_SIZE_32x8,
  priority: 1
};

export const sHealthbarSpriteTemplates: BattleInterfaceSpriteTemplateData[] = [
  { tileTag: TAG_HEALTHBAR_PLAYER1_TILE, paletteTag: TAG_HEALTHBAR_PAL, oam: sOamData_Healthbar, anims: 'gDummySpriteAnimTable', affineAnims: 'gDummySpriteAffineAnimTable', callback: 'SpriteCB_HealthBar' },
  { tileTag: TAG_HEALTHBAR_OPPONENT1_TILE, paletteTag: TAG_HEALTHBAR_PAL, oam: sOamData_Healthbar, anims: 'gDummySpriteAnimTable', affineAnims: 'gDummySpriteAffineAnimTable', callback: 'SpriteCB_HealthBar' },
  { tileTag: TAG_HEALTHBAR_PLAYER2_TILE, paletteTag: TAG_HEALTHBAR_PAL, oam: sOamData_Healthbar, anims: 'gDummySpriteAnimTable', affineAnims: 'gDummySpriteAffineAnimTable', callback: 'SpriteCB_HealthBar' },
  { tileTag: TAG_HEALTHBAR_OPPONENT2_TILE, paletteTag: TAG_HEALTHBAR_PAL, oam: sOamData_Healthbar, anims: 'gDummySpriteAnimTable', affineAnims: 'gDummySpriteAffineAnimTable', callback: 'SpriteCB_HealthBar' }
];

export const sPartySummaryBarSpriteSheets: BattleInterfaceSpriteSheetData[] = [
  { data: 'gBattleInterface_PartySummaryBar_Gfx', size: 16 * TILE_SIZE_4BPP, tag: TAG_PARTY_SUMMARY_BAR_PLAYER_TILE },
  { data: 'gBattleInterface_PartySummaryBar_Gfx', size: 16 * TILE_SIZE_4BPP, tag: TAG_PARTY_SUMMARY_BAR_OPPONENT_TILE }
];

export const sPartySummaryBarSpritePals: BattleInterfaceSpritePaletteData[] = [
  { data: 'gBattleInterface_Healthbox_Pal', tag: TAG_PARTY_SUMMARY_BAR_PLAYER_PAL },
  { data: 'gBattleInterface_Healthbox_Pal', tag: TAG_PARTY_SUMMARY_BAR_OPPONENT_PAL }
];

export const sPartySummaryBallSpritePals: BattleInterfaceSpritePaletteData[] = [
  { data: 'gBattleInterface_Healthbar_Pal', tag: TAG_PARTY_SUMMARY_BALL_PLAYER_PAL },
  { data: 'gBattleInterface_Healthbar_Pal', tag: TAG_PARTY_SUMMARY_BALL_OPPONENT_PAL }
];

export const sPartySummaryBallSpriteSheets: BattleInterfaceSpriteSheetData[] = [
  { data: `gBattleInterface_Gfx+${B_INTERFACE_GFX_BALL_PARTY_SUMMARY}`, size: 4 * TILE_SIZE_4BPP, tag: TAG_PARTY_SUMMARY_BALL_PLAYER_TILE },
  { data: `gBattleInterface_Gfx+${B_INTERFACE_GFX_BALL_PARTY_SUMMARY}`, size: 4 * TILE_SIZE_4BPP, tag: TAG_PARTY_SUMMARY_BALL_OPPONENT_TILE }
];

export const sOamData_Healthbox2: BattleInterfaceOamData = {
  shape: SPRITE_SHAPE_64x32,
  size: SPRITE_SIZE_64x32,
  priority: 1
};

export const sOamData_PartySummaryBall: BattleInterfaceOamData = {
  shape: SPRITE_SHAPE_8x8,
  size: SPRITE_SIZE_8x8,
  priority: 1
};

export const sPartySummaryBarSpriteTemplates: BattleInterfaceSpriteTemplateData[] = [
  { tileTag: TAG_PARTY_SUMMARY_BAR_PLAYER_TILE, paletteTag: TAG_PARTY_SUMMARY_BAR_PLAYER_PAL, oam: sOamData_Healthbox, anims: 'gDummySpriteAnimTable', affineAnims: 'gDummySpriteAffineAnimTable', callback: 'SpriteCB_PartySummaryBar' },
  { tileTag: TAG_PARTY_SUMMARY_BAR_OPPONENT_TILE, paletteTag: TAG_PARTY_SUMMARY_BAR_OPPONENT_PAL, oam: sOamData_Healthbox, anims: 'gDummySpriteAnimTable', affineAnims: 'gDummySpriteAffineAnimTable', callback: 'SpriteCB_PartySummaryBar' }
];

export const sPartySummaryBallSpriteTemplates: BattleInterfaceSpriteTemplateData[] = [
  { tileTag: TAG_PARTY_SUMMARY_BALL_PLAYER_TILE, paletteTag: TAG_PARTY_SUMMARY_BALL_PLAYER_PAL, oam: sOamData_PartySummaryBall, anims: 'gDummySpriteAnimTable', affineAnims: 'gDummySpriteAffineAnimTable', callback: 'SpriteCB_PartySummaryBall_OnBattleStart' },
  { tileTag: TAG_PARTY_SUMMARY_BALL_OPPONENT_TILE, paletteTag: TAG_PARTY_SUMMARY_BALL_OPPONENT_PAL, oam: sOamData_PartySummaryBall, anims: 'gDummySpriteAnimTable', affineAnims: 'gDummySpriteAffineAnimTable', callback: 'SpriteCB_PartySummaryBall_OnBattleStart' }
];

export interface BattleBar {
  healthboxSpriteId: number;
  maxValue: number;
  oldValue: number;
  receivedValue: number;
  currValue: number;
}

export interface TestingBar {
  maxValue: number;
  oldValue: number;
  receivedValue: number;
  pal: number;
  tileOffset: number;
}

export interface HpAndStatus {
  hp: number;
  status: number;
}

export type BattleInterfaceSpriteCallback =
  | 'SpriteCallbackDummy'
  | 'SpriteCB_HealthBar'
  | 'SpriteCB_HealthBoxOther'
  | 'SpriteCB_PartySummaryBar'
  | 'SpriteCB_PartySummaryBar_Exit'
  | 'SpriteCB_PartySummaryBall_OnBattleStart'
  | 'SpriteCB_PartySummaryBall_Exit'
  | 'SpriteCB_PartySummaryBall_OnSwitchout';

export interface BattleInterfaceSprite {
  id: number;
  x: number;
  y: number;
  x2: number;
  y2: number;
  invisible: boolean;
  data: number[];
  subpriority: number;
  subspriteMode: number;
  oam: {
    priority: number;
    shape: number;
    size: number;
    tileNum: number;
    affineParam: number;
    paletteNum: number;
    objMode: number;
  };
  callback: BattleInterfaceSpriteCallback | null;
  destroyed: boolean;
}

export interface BattleInterfaceRuntime {
  battleBars: BattleBar[];
  battlerData: Array<{ hpNumbersNoBars: boolean }>;
  playerParty: BattleInterfaceMon[];
  playerPartyLevels: number[];
  battlerPartyIndexes: number[];
  healthboxSpriteIds: number[];
  battlerSides: number[];
  battlerPositions: number[];
  battlersCount: number;
  isDoubleBattle: boolean;
  battleTypeFlags: number;
  gNumSafariBalls: number;
  safariCatchFactor: number;
  safariEscapeFactor: number;
  enemyParty: Array<BattleInterfaceMon & { species: number }>;
  natureNames: string[];
  speciesInfo: Array<{ growthRate: number }>;
  experienceTables: number[][];
  stringWidthOverrides: Map<string, number>;
  nextWindowId: number;
  caughtNationalDexNums: Set<number>;
  ghostBattlers: Set<number>;
  sprites: Array<BattleInterfaceSprite | undefined>;
  graphicalUpdates: Array<{
    battlerId: number;
    whichBar: number;
    filledPixels: number[];
    totalFilledPixels: number;
    barElementId: number;
  }>;
  destroyedSprites: number[];
  vramCopies: Array<{ src: string; dest: number; size: number }>;
  vramFills: Array<{ value: number; dest: number; size: number }>;
  gPlttBufferUnfaded: Uint16Array;
  gPlttBufferFaded: Uint16Array;
  objPltt: Uint16Array;
  paletteFills: Array<{ value: number; offset: number; size: number }>;
  paletteCopies16: Array<{ srcOffset: number; dest: number; size: number }>;
  textWindows: Array<{ fn: string; text: string; x: number; y: number; windowId: number }>;
  healthboxTextCopies: Array<{ fn: string; dest: number; text: string; sourceOffset: number; width: number }>;
  renderedBarFontTexts: Array<{ target: string; text: string; x: number; y: number }>;
  loadedBattleBarGfx: number[];
  soundPans: Array<{ fn: string; se: number; pan: number }>;
  tasks: Array<BattleInterfaceTask | undefined>;
  gpuRegs: Map<number, number>;
  destroyedTasks: number[];
  destroyedSpriteResources: number[];
  subspriteTableSets: Array<{ spriteId: number; table: string }>;
  bgTilemapBufferRects: Array<{
    bg: number;
    tiles: number[];
    x: number;
    y: number;
    width: number;
    height: number;
    palette: number;
  }>;
  spriteCreations: Array<{ fn: string; template: string; x: number; y: number; subpriority: number; spriteId: number }>;
  loadedSpriteResources: Array<{ fn: string; resource: BattleInterfaceSpriteSheetData | BattleInterfaceSpritePaletteData }>;
  calls: Array<{ fn: string; args: unknown[] }>;
}

export interface BattleInterfaceTask {
  id: number;
  data: number[];
  func: string | null;
  destroyed: boolean;
}

export interface BattleInterfaceMon {
  level?: number;
  hp?: number;
  maxHp?: number;
  species?: number;
  exp?: number;
  status?: number;
  nickname?: string;
  gender?: number;
  nature?: number;
}

export const createBattleInterfaceRuntime = (overrides: Partial<BattleInterfaceRuntime> = {}): BattleInterfaceRuntime => ({
  battleBars: Array.from({ length: 4 }, () => ({
    healthboxSpriteId: 0,
    maxValue: 0,
    oldValue: 0,
    receivedValue: 0,
    currValue: 0
  })),
  battlerData: Array.from({ length: 4 }, () => ({ hpNumbersNoBars: false })),
  playerParty: Array.from({ length: 6 }, () => ({ status: 0 })),
  playerPartyLevels: Array.from({ length: 6 }, () => 1),
  battlerPartyIndexes: Array.from({ length: 4 }, () => 0),
  healthboxSpriteIds: Array.from({ length: 4 }, (_, index) => index),
  battlerSides: [B_SIDE_PLAYER, B_SIDE_OPPONENT, B_SIDE_PLAYER, B_SIDE_OPPONENT],
  battlerPositions: [B_POSITION_PLAYER_LEFT, B_POSITION_OPPONENT_LEFT, B_POSITION_PLAYER_RIGHT, B_POSITION_OPPONENT_RIGHT],
  battlersCount: 4,
  isDoubleBattle: false,
  battleTypeFlags: 0,
  gNumSafariBalls: 0,
  safariCatchFactor: 0,
  safariEscapeFactor: 0,
  enemyParty: Array.from({ length: 6 }, () => ({ species: 0, status: 0 })),
  natureNames: ['Hardy', 'Lonely', 'Brave', 'Adamant', 'Naughty'],
  speciesInfo: Array.from({ length: 1 }, () => ({ growthRate: 0 })),
  experienceTables: [Array.from({ length: MAX_LEVEL + 2 }, (_, level) => level * level * level)],
  stringWidthOverrides: new Map<string, number>(),
  nextWindowId: 0,
  caughtNationalDexNums: new Set<number>(),
  ghostBattlers: new Set<number>(),
  sprites: [],
  graphicalUpdates: [],
  destroyedSprites: [],
  vramCopies: [],
  vramFills: [],
  gPlttBufferUnfaded: new Uint16Array(0x200),
  gPlttBufferFaded: new Uint16Array(0x200),
  objPltt: new Uint16Array(0x100),
  paletteFills: [],
  paletteCopies16: [],
  textWindows: [],
  healthboxTextCopies: [],
  renderedBarFontTexts: [],
  loadedBattleBarGfx: [],
  soundPans: [],
  tasks: [],
  gpuRegs: new Map<number, number>(),
  destroyedTasks: [],
  destroyedSpriteResources: [],
  subspriteTableSets: [],
  bgTilemapBufferRects: [],
  spriteCreations: [],
  loadedSpriteResources: [],
  calls: [],
  ...overrides
});

export const createBattleInterfaceSprite = (
  id: number,
  x = 0,
  y = 0
): BattleInterfaceSprite => ({
  id,
  x,
  y,
  x2: 0,
  y2: 0,
  invisible: false,
  data: Array.from({ length: 8 }, () => 0),
  subpriority: 0,
  subspriteMode: 0,
  oam: {
    priority: 1,
    shape: 0,
    size: 0,
    tileNum: 0,
    affineParam: 0,
    paletteNum: 0,
    objMode: 0
  },
  callback: null,
  destroyed: false
});

const div = (left: number, right: number): number => Math.trunc(left / right);
const q24_8 = (value: number): number => value << 8;
const q24_8ToInt = (value: number): number => value >> 8;

const getBattlerSide = (
  runtime: BattleInterfaceRuntime,
  battler: number
): number => runtime.battlerSides[battler] ?? B_SIDE_PLAYER;

const getBattlerPosition = (
  runtime: BattleInterfaceRuntime,
  battler: number
): number => runtime.battlerPositions[battler] ?? B_POSITION_PLAYER_LEFT;

const speciesToNationalPokedexNum = (species: number): number => species;

const checkBattleTypeGhost = (
  runtime: BattleInterfaceRuntime,
  _mon: { species: number },
  battlerId: number
): boolean => runtime.ghostBattlers.has(battlerId);

const getSetPokedexFlag = (
  runtime: BattleInterfaceRuntime,
  nationalDexNum: number
): boolean => runtime.caughtNationalDexNums.has(nationalDexNum);

export const GetBattleInterfaceGfxPtr = (elementId: number): string => `gBattleInterface_Gfx[${elementId}]`;

const convertIntToDecimalStringN = (
  value: number,
  mode: number,
  n: number
): string => {
  let state = 'WAITING_FOR_NONZERO_DIGIT';
  let powerOfTen = 10 ** (n - 1);
  let result = '';

  if (mode === STR_CONV_MODE_RIGHT_ALIGN)
    state = 'WRITING_SPACES';

  if (mode === STR_CONV_MODE_LEADING_ZEROS)
    state = 'WRITING_DIGITS';

  for (; powerOfTen > 0; powerOfTen = div(powerOfTen, 10)) {
    const digit = div(value, powerOfTen);
    const temp = value - powerOfTen * digit;

    if (state === 'WRITING_DIGITS') {
      result += digit <= 9 ? `${digit}` : '?';
    } else if (digit !== 0 || powerOfTen === 1) {
      state = 'WRITING_DIGITS';
      result += digit <= 9 ? `${digit}` : '?';
    } else if (state === 'WRITING_SPACES') {
      result += ' ';
    }

    value = temp;
  }

  return result;
};

const getStringWidth = (
  runtime: BattleInterfaceRuntime,
  fontId: number,
  text: string,
  letterSpacing: number
): number => {
  const key = `${fontId}:${text}:${letterSpacing}`;
  return runtime.stringWidthOverrides.get(key) ?? runtime.stringWidthOverrides.get(text) ?? text.length * 6;
};

export const AddTextPrinterAndCreateWindowOnHealthbox = (
  runtime: BattleInterfaceRuntime,
  text: string,
  x: number,
  y: number
): { windowTileData: string; windowId: number } => {
  const windowId = runtime.nextWindowId;
  runtime.nextWindowId += 1;
  runtime.textWindows.push({ fn: 'AddTextPrinterAndCreateWindowOnHealthbox', text, x, y, windowId });
  runtime.calls.push({ fn: 'AddTextPrinterAndCreateWindowOnHealthbox', args: [text, x, y, windowId] });
  runtime.calls.push({ fn: 'AddWindow', args: [sHealthboxWindowTemplate, windowId] });
  runtime.calls.push({ fn: 'FillWindowPixelBuffer', args: [windowId, PIXEL_FILL(2)] });
  runtime.calls.push({ fn: 'AddTextPrinterParameterized4', args: [windowId, FONT_SMALL, x, y, 0, 0, [2, 1, 3], -1, text] });
  runtime.calls.push({ fn: 'GetWindowAttribute', args: [windowId, WINDOW_TILE_DATA, `windowTileData:${windowId}`] });
  return { windowTileData: `windowTileData:${windowId}`, windowId };
};

export const TextIntoHealthboxObject = (
  runtime: BattleInterfaceRuntime,
  dest: number,
  windowTileData: string,
  sourceOffset: number,
  windowWidth: number
): void => {
  runtime.healthboxTextCopies.push({ fn: 'TextIntoHealthboxObject', dest, text: windowTileData, sourceOffset, width: windowWidth });
  runtime.calls.push({ fn: 'TextIntoHealthboxObject', args: [dest, `${windowTileData}+${sourceOffset}`, windowWidth] });
  cpuCopy32(runtime, `${windowTileData}+${sourceOffset + 256}`, dest + 256, windowWidth * TILE_SIZE_4BPP);

  let copyDest = dest;
  let copySourceOffset = sourceOffset;
  let remainingWidth = windowWidth;
  while (remainingWidth > 0) {
    cpuCopy32(runtime, `${windowTileData}+${copySourceOffset + 20}`, copyDest + 20, 12);
    copyDest += TILE_SIZE_4BPP;
    copySourceOffset += TILE_SIZE_4BPP;
    remainingWidth -= 1;
  }
};

export const SafariTextIntoHealthboxObject = (
  runtime: BattleInterfaceRuntime,
  dest: number,
  windowTileData: string,
  sourceOffset: number,
  windowWidth: number
): void => {
  runtime.healthboxTextCopies.push({ fn: 'SafariTextIntoHealthboxObject', dest, text: windowTileData, sourceOffset, width: windowWidth });
  runtime.calls.push({ fn: 'SafariTextIntoHealthboxObject', args: [dest, `${windowTileData}+${sourceOffset}`, windowWidth] });
  cpuCopy32(runtime, `${windowTileData}+${sourceOffset}`, dest, windowWidth * TILE_SIZE_4BPP);
  cpuCopy32(runtime, `${windowTileData}+${sourceOffset + 256}`, dest + 256, windowWidth * TILE_SIZE_4BPP);
};

export const RemoveWindowOnHealthbox = (
  runtime: BattleInterfaceRuntime,
  windowId: number
): void => {
  runtime.calls.push({ fn: 'RemoveWindowOnHealthbox', args: [windowId] });
  runtime.calls.push({ fn: 'RemoveWindow', args: [windowId] });
};

const renderTextHandleBold = (
  runtime: BattleInterfaceRuntime,
  text: string,
  x: number,
  y: number,
  target = 'gMonSpritesGfxPtr->barFontGfx'
): void => {
  runtime.renderedBarFontTexts.push({ target, text, x, y });
  runtime.calls.push({ fn: 'RenderTextHandleBold', args: [target, 0, text, x, y, 0, 0, 0] });
};

const loadBattleBarGfx = (
  runtime: BattleInterfaceRuntime,
  arg: number
): void => {
  runtime.loadedBattleBarGfx.push(arg);
  runtime.calls.push({ fn: 'LoadBattleBarGfx', args: [arg] });
};

const playSE1WithPanning = (
  runtime: BattleInterfaceRuntime,
  se: number,
  pan: number
): void => {
  runtime.soundPans.push({ fn: 'PlaySE1WithPanning', se, pan });
  runtime.calls.push({ fn: 'PlaySE1WithPanning', args: [se, pan] });
};

const playSE2WithPanning = (
  runtime: BattleInterfaceRuntime,
  se: number,
  pan: number
): void => {
  runtime.soundPans.push({ fn: 'PlaySE2WithPanning', se, pan });
  runtime.calls.push({ fn: 'PlaySE2WithPanning', args: [se, pan] });
};

export const SpriteCB_PartySummaryBar = (
  _runtime: BattleInterfaceRuntime,
  sprite: BattleInterfaceSprite
): void => {
  if (sprite.x2 !== 0)
    sprite.x2 += sprite.data[0];
};

export const SpriteCB_PartySummaryBar_Exit = (
  _runtime: BattleInterfaceRuntime,
  sprite: BattleInterfaceSprite
): void => {
  sprite.data[1] += 32;
  if (sprite.data[0] > 0)
    sprite.x2 += sprite.data[1] >> 4;
  else
    sprite.x2 -= sprite.data[1] >> 4;
  sprite.data[1] &= 0xf;
};

export const SpriteCB_PartySummaryBall_OnBattleStart = (
  runtime: BattleInterfaceRuntime,
  sprite: BattleInterfaceSprite
): void => {
  let isOpponent: number;
  let speed: number;

  if (sprite.data[1] > 0) {
    sprite.data[1] -= 1;
    return;
  }

  isOpponent = sprite.data[2];
  speed = sprite.data[3];
  speed += 56;
  sprite.data[3] = speed & 0xfff0;

  if (isOpponent !== 0) {
    sprite.x2 += div(speed, 16);
    if (sprite.x2 > 0)
      sprite.x2 = 0;
  } else {
    sprite.x2 -= div(speed, 16);
    if (sprite.x2 < 0)
      sprite.x2 = 0;
  }

  if (sprite.x2 === 0) {
    const pan = isOpponent ? SOUND_PAN_ATTACKER : SOUND_PAN_TARGET;
    if (sprite.data[7] !== 0)
      playSE2WithPanning(runtime, SE_BALL_TRAY_EXIT, pan);
    else
      playSE1WithPanning(runtime, SE_BALL_TRAY_BALL, pan);

    sprite.callback = 'SpriteCallbackDummy';
  }
};

export const SpriteCB_PartySummaryBall_Exit = (
  _runtime: BattleInterfaceRuntime,
  sprite: BattleInterfaceSprite
): void => {
  let isOpponent: number;
  let speed: number;

  if (sprite.data[1] > 0) {
    sprite.data[1] -= 1;
    return;
  }
  isOpponent = sprite.data[2];
  speed = sprite.data[3];
  speed += 56;
  sprite.data[3] = speed & 0xfff0;
  if (isOpponent !== 0)
    sprite.x2 += div(speed, 16);
  else
    sprite.x2 -= div(speed, 16);

  if (sprite.x2 + sprite.x > DISPLAY_WIDTH + 8 || sprite.x2 + sprite.x < -8) {
    sprite.invisible = true;
    sprite.callback = 'SpriteCallbackDummy';
  }
};

export const SpriteCB_PartySummaryBall_OnSwitchout = (
  runtime: BattleInterfaceRuntime,
  sprite: BattleInterfaceSprite
): void => {
  const summaryBarSpriteId = sprite.data[0];
  const summaryBarSprite = runtime.sprites[summaryBarSpriteId];
  if (!summaryBarSprite)
    return;

  sprite.x2 = summaryBarSprite.x2;
  sprite.y2 = summaryBarSprite.y2;
};

export const UpdateLvlInHealthbox = (
  runtime: BattleInterfaceRuntime,
  healthboxSpriteId: number,
  level: number
): void => {
  const healthboxSprite = runtime.sprites[healthboxSpriteId];
  if (!healthboxSprite)
    return;

  let text = '{LV_2}';
  const digits = convertIntToDecimalStringN(level, STR_CONV_MODE_LEFT_ALIGN, 3);
  text += digits;
  const xPos = 5 * (3 - digits.length);

  const { windowTileData, windowId } = AddTextPrinterAndCreateWindowOnHealthbox(runtime, text, xPos, 3);
  const spriteTileNum = healthboxSprite.oam.tileNum * TILE_SIZE_4BPP;
  let objVram: number;

  if (getBattlerSide(runtime, healthboxSprite.data[6]) === B_SIDE_PLAYER) {
    if (!runtime.isDoubleBattle)
      objVram = spriteTileNum + 0x820;
    else
      objVram = spriteTileNum + 0x420;
  } else {
    objVram = spriteTileNum + 0x400;
  }
  TextIntoHealthboxObject(runtime, objVram, windowTileData, 0, 3);
  RemoveWindowOnHealthbox(runtime, windowId);
};

export const UpdateHpTextInHealthbox = (
  runtime: BattleInterfaceRuntime,
  healthboxSpriteId: number,
  value: number,
  maxOrCurrent: number
): void => {
  const healthboxSprite = runtime.sprites[healthboxSpriteId];
  if (!healthboxSprite)
    return;

  if (getBattlerSide(runtime, healthboxSprite.data[6]) === B_SIDE_PLAYER && !runtime.isDoubleBattle) {
    let windowId: number;
    let windowTileData: string;

    if (maxOrCurrent !== HP_CURRENT) {
      const text = convertIntToDecimalStringN(value, STR_CONV_MODE_RIGHT_ALIGN, 3);
      const created = AddTextPrinterAndCreateWindowOnHealthbox(runtime, text, 0, 5);
      windowTileData = created.windowTileData;
      windowId = created.windowId;
      TextIntoHealthboxObject(runtime, healthboxSprite.oam.tileNum * TILE_SIZE_4BPP + 0xa40, windowTileData, 0, 2);
      RemoveWindowOnHealthbox(runtime, windowId);
    } else {
      const text = `${convertIntToDecimalStringN(value, STR_CONV_MODE_RIGHT_ALIGN, 3)}${sText_Slash}`;
      const created = AddTextPrinterAndCreateWindowOnHealthbox(runtime, text, 4, 5);
      windowTileData = created.windowTileData;
      windowId = created.windowId;
      TextIntoHealthboxObject(runtime, healthboxSprite.oam.tileNum * TILE_SIZE_4BPP + 0x2e0, windowTileData, 0, 1);
      TextIntoHealthboxObject(runtime, healthboxSprite.oam.tileNum * TILE_SIZE_4BPP + 0xa00, windowTileData, 0x20, 2);
      RemoveWindowOnHealthbox(runtime, windowId);
    }
  } else {
    const battler = healthboxSprite.data[6];
    if (runtime.isDoubleBattle === true || getBattlerSide(runtime, battler) === B_SIDE_OPPONENT) {
      UpdateHpTextInHealthboxInDoubles(runtime, healthboxSpriteId, value, maxOrCurrent);
    } else {
      let varValue: number;

      if (getBattlerSide(runtime, healthboxSprite.data[6]) === B_SIDE_PLAYER) {
        if (maxOrCurrent === HP_CURRENT)
          varValue = 29;
        else
          varValue = 89;
      } else {
        if (maxOrCurrent === HP_CURRENT)
          varValue = 20;
        else
          varValue = 48;
      }

      const text = `{COLOR 01}{HIGHLIGHT 02}${convertIntToDecimalStringN(value, STR_CONV_MODE_RIGHT_ALIGN, 3)}`;
      renderTextHandleBold(runtime, text, 0, 0);

      for (let i = 0; i < 3; i += 1)
        cpuCopy32(
          runtime,
          `gMonSpritesGfxPtr->barFontGfx[${i * 64 + 32}]`,
          TILE_SIZE_4BPP * (healthboxSprite.oam.tileNum + varValue + i),
          1 * TILE_SIZE_4BPP
        );
    }
  }
};

export const UpdateHpTextInHealthboxInDoubles = (
  runtime: BattleInterfaceRuntime,
  healthboxSpriteId: number,
  value: number,
  maxOrCurrent: number
): void => {
  const healthboxSprite = runtime.sprites[healthboxSpriteId];
  if (!healthboxSprite)
    return;

  const battlerId = healthboxSprite.data[6];

  if (runtime.battlerData[battlerId].hpNumbersNoBars) {
    let varValue = 4;
    let txtPtr: string;

    if (maxOrCurrent === HP_CURRENT)
      varValue = 0;

    const healthBarSpriteId = healthboxSprite.data[5];
    const healthBarSprite = runtime.sprites[healthBarSpriteId];
    if (!healthBarSprite)
      return;

    txtPtr = convertIntToDecimalStringN(value, STR_CONV_MODE_RIGHT_ALIGN, 3);
    if (maxOrCurrent === HP_CURRENT)
      txtPtr = `${txtPtr}${sText_Slash}`;

    renderTextHandleBold(runtime, `{COLOR 01}{HIGHLIGHT 00}${txtPtr}`, 0, 0);

    for (let i = varValue; i < varValue + 3; i += 1) {
      if (i < 3) {
        cpuCopy32(
          runtime,
          `gMonSpritesGfxPtr->barFontGfx[${((i - varValue) * 64) + 32}]`,
          (1 + healthBarSprite.oam.tileNum + i) * TILE_SIZE_4BPP,
          1 * TILE_SIZE_4BPP
        );
      } else {
        cpuCopy32(
          runtime,
          `gMonSpritesGfxPtr->barFontGfx[${((i - varValue) * 64) + 32}]`,
          0x20 + (i + healthBarSprite.oam.tileNum) * TILE_SIZE_4BPP,
          1 * TILE_SIZE_4BPP
        );
      }
    }

    if (maxOrCurrent === HP_CURRENT) {
      cpuCopy32(
        runtime,
        'gMonSpritesGfxPtr->barFontGfx[224]',
        (healthBarSprite.oam.tileNum + 4) * TILE_SIZE_4BPP,
        1 * TILE_SIZE_4BPP
      );
      cpuFill32(
        runtime,
        0,
        healthBarSprite.oam.tileNum * TILE_SIZE_4BPP,
        1 * TILE_SIZE_4BPP
      );
    } else if (getBattlerSide(runtime, battlerId) === B_SIDE_PLAYER) {
      cpuCopy32(
        runtime,
        GetBattleInterfaceGfxPtr(B_INTERFACE_GFX_BOTTOM_RIGHT_CORNER_HP_AS_TEXT),
        (healthboxSprite.oam.tileNum + 52) * TILE_SIZE_4BPP,
        1 * TILE_SIZE_4BPP
      );
    }
  }
};

export const UpdateNickInHealthbox = (
  runtime: BattleInterfaceRuntime,
  healthboxSpriteId: number,
  mon: BattleInterfaceMon
): void => {
  const healthboxSprite = runtime.sprites[healthboxSpriteId];
  if (!healthboxSprite)
    return;

  const nickname = mon.nickname ?? '';
  let text = `${sText_HealthboxNickname}${nickname}`;
  let gender = mon.gender ?? 100;
  const species = mon.species ?? 0;

  if ((species === SPECIES_NIDORAN_F || species === SPECIES_NIDORAN_M) && nickname === gSpeciesNames[species])
    gender = 100;

  if (checkBattleTypeGhost(runtime, { species }, healthboxSprite.data[6]))
    gender = 100;

  switch (gender) {
    default:
      text += `${TEXT_DYNAMIC_COLOR_2}`;
      break;
    case MON_MALE:
      text += `${TEXT_DYNAMIC_COLOR_2}${CHAR_MALE}`;
      break;
    case MON_FEMALE:
      text += `${TEXT_DYNAMIC_COLOR_1}${CHAR_FEMALE}`;
      break;
  }

  const { windowTileData, windowId } = AddTextPrinterAndCreateWindowOnHealthbox(runtime, text, 0, 3);
  const spriteTileNum = healthboxSprite.oam.tileNum * TILE_SIZE_4BPP;

  if (getBattlerSide(runtime, healthboxSprite.data[6]) === B_SIDE_PLAYER) {
    TextIntoHealthboxObject(runtime, 0x40 + spriteTileNum, windowTileData, 0, 6);

    if (!runtime.isDoubleBattle)
      TextIntoHealthboxObject(runtime, spriteTileNum + 0x800, windowTileData, 0xc0, 1);
    else
      TextIntoHealthboxObject(runtime, spriteTileNum + 0x400, windowTileData, 0xc0, 1);
  } else {
    TextIntoHealthboxObject(runtime, 0x20 + spriteTileNum, windowTileData, 0, 7);
  }

  RemoveWindowOnHealthbox(runtime, windowId);
};

export const PrintSafariMonInfo = (
  runtime: BattleInterfaceRuntime,
  healthboxSpriteId: number,
  mon: BattleInterfaceMon
): void => {
  const healthboxSprite = runtime.sprites[healthboxSpriteId];
  if (!healthboxSprite)
    return;

  let text = '{COLOR 01}{HIGHLIGHT 02}';
  const battlerId = healthboxSprite.data[6];
  let barFontGfxOffset = 0x520 + (getBattlerPosition(runtime, battlerId) * 384);
  const barFontGfx = `gMonSpritesGfxPtr->barFontGfx[${barFontGfxOffset}]`;
  const varValue = 5;
  const nature = mon.nature ?? 0;
  const natureText = runtime.natureNames[nature] ?? '';
  text += natureText;
  renderTextHandleBold(runtime, text, 0, 0, barFontGfx);

  for (let j = 6, i = 0; i < varValue; i += 1, j += 1) {
    let elementId: number;
    const charCode = natureText.charCodeAt(j - 6) || 0;

    if ((charCode >= 55 && charCode <= 74) || (charCode >= 135 && charCode <= 154))
      elementId = B_INTERFACE_GFX_SAFARI_HEALTHBOX_1;
    else if ((charCode >= 75 && charCode <= 79) || (charCode >= 155 && charCode <= 159))
      elementId = B_INTERFACE_GFX_SAFARI_HEALTHBOX_2;
    else
      elementId = B_INTERFACE_GFX_SAFARI_HEALTHBOX_0;

    cpuCopy32(
      runtime,
      GetBattleInterfaceGfxPtr(elementId),
      barFontGfxOffset + (i * 64),
      0x20
    );
  }

  for (let j = 1; j < varValue + 1; j += 1) {
    let spriteTileNum = (healthboxSprite.oam.tileNum + (j - (div(j, 8) * 8)) + (div(j, 8) * 64)) * TILE_SIZE_4BPP;
    cpuCopy32(runtime, `barFontGfx[${barFontGfxOffset}]`, spriteTileNum, 0x20);
    barFontGfxOffset += 0x20;

    spriteTileNum = (8 + healthboxSprite.oam.tileNum + (j - (div(j, 8) * 8)) + (div(j, 8) * 64)) * TILE_SIZE_4BPP;
    cpuCopy32(runtime, `barFontGfx[${barFontGfxOffset}]`, spriteTileNum, 0x20);
    barFontGfxOffset += 0x20;
  }

  const healthBarSpriteId = healthboxSprite.data[5];
  const healthBarSprite = runtime.sprites[healthBarSpriteId];
  if (!healthBarSprite)
    return;

  text = `{COLOR 01}{HIGHLIGHT 02}${convertIntToDecimalStringN(runtime.safariCatchFactor, STR_CONV_MODE_RIGHT_ALIGN, 2)}/${convertIntToDecimalStringN(runtime.safariEscapeFactor, STR_CONV_MODE_RIGHT_ALIGN, 2)}`;
  renderTextHandleBold(runtime, text, 0, 0);

  for (let j = 0; j < 5; j += 1) {
    if (j <= 1) {
      cpuCopy32(
        runtime,
        `gMonSpritesGfxPtr->barFontGfx[${0x40 * j + 0x20}]`,
        (healthBarSprite.oam.tileNum + 2 + j) * TILE_SIZE_4BPP,
        32
      );
    } else {
      cpuCopy32(
        runtime,
        `gMonSpritesGfxPtr->barFontGfx[${0x40 * j + 0x20}]`,
        0xc0 + (j + healthBarSprite.oam.tileNum) * TILE_SIZE_4BPP,
        32
      );
    }
  }
};

export const SwapHpBarsWithHpText = (
  runtime: BattleInterfaceRuntime
): void => {
  let healthBarSpriteId: number;

  for (let i = 0; i < runtime.battlersCount; i += 1) {
    const healthboxSpriteId = runtime.healthboxSpriteIds[i];
    const healthboxSprite = runtime.sprites[healthboxSpriteId];
    if (!healthboxSprite)
      continue;

    if (
      healthboxSprite.callback === 'SpriteCallbackDummy'
      && getBattlerSide(runtime, i) !== B_SIDE_OPPONENT
      && (runtime.isDoubleBattle || getBattlerSide(runtime, i) !== B_SIDE_PLAYER)
    ) {
      let noBars: boolean;

      runtime.battlerData[i].hpNumbersNoBars = !runtime.battlerData[i].hpNumbersNoBars;
      noBars = runtime.battlerData[i].hpNumbersNoBars;
      if (getBattlerSide(runtime, i) === B_SIDE_PLAYER) {
        if (!runtime.isDoubleBattle)
          continue;
        if (runtime.battleTypeFlags & BATTLE_TYPE_SAFARI)
          continue;

        if (noBars === true) {
          healthBarSpriteId = healthboxSprite.data[5];
          const healthBarSprite = runtime.sprites[healthBarSpriteId];
          if (!healthBarSprite)
            continue;

          cpuFill32(runtime, 0, healthBarSprite.oam.tileNum * TILE_SIZE_4BPP, 8 * TILE_SIZE_4BPP);
          const mon = runtime.playerParty[runtime.battlerPartyIndexes[i]] ?? {};
          UpdateHpTextInHealthboxInDoubles(runtime, healthboxSpriteId, mon.hp ?? 0, HP_CURRENT);
          UpdateHpTextInHealthboxInDoubles(runtime, healthboxSpriteId, mon.maxHp ?? 0, HP_MAX);
        } else {
          UpdateStatusIconInHealthbox(runtime, healthboxSpriteId);
          UpdateHealthboxAttribute(runtime, healthboxSpriteId, runtime.playerParty[runtime.battlerPartyIndexes[i]] ?? {}, HEALTHBOX_HEALTH_BAR);
          cpuCopy32(
            runtime,
            GetBattleInterfaceGfxPtr(B_INTERFACE_GFX_BOTTOM_RIGHT_CORNER_HP_AS_BAR),
            0x680 + healthboxSprite.oam.tileNum * TILE_SIZE_4BPP,
            1 * TILE_SIZE_4BPP
          );
        }
      } else {
        if (noBars === true) {
          if (runtime.battleTypeFlags & BATTLE_TYPE_SAFARI) {
            PrintSafariMonInfo(runtime, healthboxSpriteId, runtime.enemyParty[runtime.battlerPartyIndexes[i]] ?? { species: 0 });
          } else {
            healthBarSpriteId = healthboxSprite.data[5];
            const healthBarSprite = runtime.sprites[healthBarSpriteId];
            if (!healthBarSprite)
              continue;

            cpuFill32(runtime, 0, healthBarSprite.oam.tileNum * 32, 8 * TILE_SIZE_4BPP);
            const mon = runtime.enemyParty[runtime.battlerPartyIndexes[i]] ?? { species: 0 };
            UpdateHpTextInHealthboxInDoubles(runtime, healthboxSpriteId, mon.hp ?? 0, HP_CURRENT);
            UpdateHpTextInHealthboxInDoubles(runtime, healthboxSpriteId, mon.maxHp ?? 0, HP_MAX);
          }
        } else {
          UpdateStatusIconInHealthbox(runtime, healthboxSpriteId);
          UpdateHealthboxAttribute(runtime, healthboxSpriteId, runtime.enemyParty[runtime.battlerPartyIndexes[i]] ?? { species: 0 }, HEALTHBOX_HEALTH_BAR);
          if (runtime.battleTypeFlags & BATTLE_TYPE_SAFARI)
            UpdateHealthboxAttribute(runtime, healthboxSpriteId, runtime.enemyParty[runtime.battlerPartyIndexes[i]] ?? { species: 0 }, HEALTHBOX_NICK);
        }
      }
      healthboxSprite.data[7] ^= 1;
    }
  }
};

const cpuCopy32 = (
  runtime: BattleInterfaceRuntime,
  src: string,
  dest: number,
  size: number
): void => {
  runtime.vramCopies.push({ src, dest, size });
  runtime.calls.push({ fn: 'CpuCopy32', args: [src, dest, size] });
};

const cpuFill32 = (
  runtime: BattleInterfaceRuntime,
  value: number,
  dest: number,
  size: number
): void => {
  runtime.vramFills.push({ value, dest, size });
  runtime.calls.push({ fn: 'CpuFill32', args: [value, dest, size] });
};

const fillPalette = (
  runtime: BattleInterfaceRuntime,
  value: number,
  offset: number,
  size: number
): void => {
  const count = size >> 1;
  runtime.gPlttBufferUnfaded.fill(value & 0xffff, offset, offset + count);
  runtime.gPlttBufferFaded.fill(value & 0xffff, offset, offset + count);
  runtime.paletteFills.push({ value, offset, size });
  runtime.calls.push({ fn: 'FillPalette', args: [value, offset, size] });
};

const cpuCopy16 = (
  runtime: BattleInterfaceRuntime,
  srcOffset: number,
  dest: number,
  size: number
): void => {
  const count = size >> 1;
  for (let i = 0; i < count; i += 1)
    runtime.objPltt[dest + i] = runtime.gPlttBufferUnfaded[srcOffset + i];
  runtime.paletteCopies16.push({ srcOffset, dest, size });
  runtime.calls.push({ fn: 'CpuCopy16', args: [`gPlttBufferUnfaded[${srcOffset}]`, `OBJ_PLTT[${dest}]`, size] });
};

const copyToBgTilemapBufferRectChangePalette = (
  runtime: BattleInterfaceRuntime,
  bg: number,
  tiles: number[],
  x: number,
  y: number,
  width: number,
  height: number,
  palette: number
): void => {
  runtime.bgTilemapBufferRects.push({ bg, tiles: [...tiles], x, y, width, height, palette });
  runtime.calls.push({ fn: 'CopyToBgTilemapBufferRect_ChangePalette', args: [bg, [...tiles], x, y, width, height, palette] });
};

const debugDrawNumberAt = (
  number: number,
  dest: number[],
  singleRow: boolean,
  destOffset: number
): void => {
  const buff = Array.from({ length: 4 }, () => 0);
  let i: number;
  let j: number;

  for (i = 0; i < 4; i += 1) {
    buff[i] = 0;
  }

  for (i = 3; ; i -= 1) {
    if (number > 0) {
      buff[i] = number % 10;
      number = div(number, 10);
    } else {
      while (i > -1) {
        buff[i] = 0xff;
        i -= 1;
      }

      if (buff[3] === 0xff) {
        buff[3] = 0;
      }
      break;
    }
  }

  if (!singleRow) {
    for (i = 0, j = 0; i < 4; i += 1) {
      if (buff[j] === 0xff) {
        dest[destOffset + j + 0x00] &= 0xfc00;
        dest[destOffset + j + 0x00] |= 30;
        dest[destOffset + i + 0x20] &= 0xfc00;
        dest[destOffset + i + 0x20] |= 30;
      } else {
        dest[destOffset + j + 0x00] &= 0xfc00;
        dest[destOffset + j + 0x00] |= 20 + buff[j];
        dest[destOffset + i + 0x20] &= 0xfc00;
        dest[destOffset + i + 0x20] |= 20 + buff[i] + 1 * TILE_SIZE_4BPP;
      }
      j += 1;
    }
  } else {
    for (i = 0; i < 4; i += 1) {
      if (buff[i] === 0xff) {
        dest[destOffset + i + 0x00] &= 0xfc00;
        dest[destOffset + i + 0x00] |= 30;
        dest[destOffset + i + 0x20] &= 0xfc00;
        dest[destOffset + i + 0x20] |= 30;
      } else {
        dest[destOffset + i + 0x00] &= 0xfc00;
        dest[destOffset + i + 0x00] |= 20 + buff[i];
        dest[destOffset + i + 0x20] &= 0xfc00;
        dest[destOffset + i + 0x20] |= 20 + buff[i] + 1 * TILE_SIZE_4BPP;
      }
    }
  }
};

export const Debug_DrawNumber = (
  number: number,
  dest: number[],
  singleRow: boolean
): void => {
  debugDrawNumberAt(number, dest, singleRow, 0);
};

export const Debug_DrawNumberPair = (
  num1: number,
  num2: number,
  dest: number[]
): void => {
  dest[4] = 30;
  debugDrawNumberAt(num2, dest, false, 0);
  debugDrawNumberAt(num1, dest, true, 5);
};

export const SpriteCB_HealthBar = (
  runtime: BattleInterfaceRuntime,
  sprite: BattleInterfaceSprite
): void => {
  const healthboxSpriteId = sprite.data[5];
  const healthboxSprite = runtime.sprites[healthboxSpriteId]!;

  switch (sprite.data[6]) {
    case 0:
    case 1:
      sprite.x = healthboxSprite.x + 16;
      sprite.y = healthboxSprite.y;
      break;
    default:
    case 2:
      sprite.x = healthboxSprite.x + 8;
      sprite.y = healthboxSprite.y;
      break;
  }
  sprite.x2 = healthboxSprite.x2;
  sprite.y2 = healthboxSprite.y2;
};

export const SpriteCB_HealthBoxOther = (
  runtime: BattleInterfaceRuntime,
  sprite: BattleInterfaceSprite
): void => {
  const healthboxSpriteId = sprite.data[5];
  const healthboxSprite = runtime.sprites[healthboxSpriteId]!;

  sprite.x = healthboxSprite.x + 64;
  sprite.y = healthboxSprite.y;
  sprite.x2 = healthboxSprite.x2;
  sprite.y2 = healthboxSprite.y2;
};

export const SetBattleBarStruct = (
  runtime: BattleInterfaceRuntime,
  battlerId: number,
  healthboxSpriteId: number,
  maxVal: number,
  oldVal: number,
  receivedValue: number
): void => {
  runtime.battleBars[battlerId].healthboxSpriteId = healthboxSpriteId;
  runtime.battleBars[battlerId].maxValue = maxVal;
  runtime.battleBars[battlerId].oldValue = oldVal;
  runtime.battleBars[battlerId].receivedValue = receivedValue;
  runtime.battleBars[battlerId].currValue = -32768;
};

export const SetHealthboxSpriteInvisible = (
  runtime: BattleInterfaceRuntime,
  healthboxSpriteId: number
): void => {
  const healthboxSprite = runtime.sprites[healthboxSpriteId]!;
  healthboxSprite.invisible = true;
  runtime.sprites[healthboxSprite.data[5]]!.invisible = true;
  runtime.sprites[healthboxSprite.oam.affineParam]!.invisible = true;
};

export const SetHealthboxSpriteVisible = (
  runtime: BattleInterfaceRuntime,
  healthboxSpriteId: number
): void => {
  const healthboxSprite = runtime.sprites[healthboxSpriteId]!;
  healthboxSprite.invisible = false;
  runtime.sprites[healthboxSprite.data[5]]!.invisible = false;
  runtime.sprites[healthboxSprite.oam.affineParam]!.invisible = false;
};

export const UpdateSpritePos = (
  runtime: BattleInterfaceRuntime,
  spriteId: number,
  x: number,
  y: number
): void => {
  runtime.sprites[spriteId]!.x = x;
  runtime.sprites[spriteId]!.y = y;
};

const destroySprite = (
  runtime: BattleInterfaceRuntime,
  spriteId: number
): void => {
  runtime.sprites[spriteId]!.destroyed = true;
  runtime.destroyedSprites.push(spriteId);
  runtime.calls.push({ fn: 'DestroySprite', args: [spriteId] });
};

const destroySpriteAndFreeResources = (
  runtime: BattleInterfaceRuntime,
  spriteId: number
): void => {
  runtime.sprites[spriteId]!.destroyed = true;
  runtime.destroyedSpriteResources.push(spriteId);
  runtime.calls.push({ fn: 'DestroySpriteAndFreeResources', args: [spriteId] });
};

const setGpuReg = (
  runtime: BattleInterfaceRuntime,
  regOffset: number,
  value: number
): void => {
  runtime.gpuRegs.set(regOffset, value);
  runtime.calls.push({ fn: 'SetGpuReg', args: [regOffset, value] });
};

const destroyTask = (
  runtime: BattleInterfaceRuntime,
  taskId: number
): void => {
  const task = runtime.tasks[taskId];
  if (task)
    task.destroyed = true;
  runtime.destroyedTasks.push(taskId);
  runtime.calls.push({ fn: 'DestroyTask', args: [taskId] });
};

const setSubspriteTables = (
  runtime: BattleInterfaceRuntime,
  sprite: BattleInterfaceSprite,
  table: string
): void => {
  runtime.subspriteTableSets.push({ spriteId: sprite.id, table });
  runtime.calls.push({ fn: 'SetSubspriteTables', args: [sprite.id, table] });
};

const nextFreeSpriteId = (runtime: BattleInterfaceRuntime): number => {
  let spriteId = 0;
  while (runtime.sprites[spriteId])
    spriteId += 1;
  return spriteId;
};

const resolveSpriteTemplate = (
  template: string
): BattleInterfaceSpriteTemplateData | null => {
  const indexedTemplate = template.match(/^([A-Za-z0-9_]+)\[(\d+)\]$/u);
  if (indexedTemplate) {
    const [, name, rawIndex] = indexedTemplate;
    const index = Number(rawIndex);
    switch (name) {
      case 'sHealthboxPlayerSpriteTemplates':
        return sHealthboxPlayerSpriteTemplates[index] ?? null;
      case 'sHealthboxOpponentSpriteTemplates':
        return sHealthboxOpponentSpriteTemplates[index] ?? null;
      case 'sHealthbarSpriteTemplates':
        return sHealthbarSpriteTemplates[index] ?? null;
      case 'sPartySummaryBarSpriteTemplates':
        return sPartySummaryBarSpriteTemplates[index] ?? null;
      case 'sPartySummaryBallSpriteTemplates':
        return sPartySummaryBallSpriteTemplates[index] ?? null;
    }
  }

  if (template === 'sHealthboxSafariSpriteTemplate')
    return sHealthboxSafariSpriteTemplate;

  return null;
};

const createSpriteFromTemplate = (
  runtime: BattleInterfaceRuntime,
  fn: 'CreateSprite' | 'CreateSpriteAtEnd',
  template: string,
  x: number,
  y: number,
  subpriority: number
): number => {
  const spriteId = nextFreeSpriteId(runtime);
  const sprite = createBattleInterfaceSprite(spriteId, x, y);
  const templateData = resolveSpriteTemplate(template);
  if (templateData) {
    sprite.oam.shape = templateData.oam.shape;
    sprite.oam.size = templateData.oam.size;
    sprite.oam.priority = templateData.oam.priority;
    sprite.callback = templateData.callback;
  }
  sprite.subpriority = subpriority;
  runtime.sprites[spriteId] = sprite;
  runtime.spriteCreations.push({ fn, template, x, y, subpriority, spriteId });
  runtime.calls.push({ fn, args: [template, x, y, subpriority, spriteId] });
  return spriteId;
};

const loadCompressedSpriteSheetUsingHeap = (
  runtime: BattleInterfaceRuntime,
  resource: BattleInterfaceSpriteSheetData
): void => {
  runtime.loadedSpriteResources.push({ fn: 'LoadCompressedSpriteSheetUsingHeap', resource });
  runtime.calls.push({ fn: 'LoadCompressedSpriteSheetUsingHeap', args: [resource] });
};

const loadSpriteSheet = (
  runtime: BattleInterfaceRuntime,
  resource: BattleInterfaceSpriteSheetData
): void => {
  runtime.loadedSpriteResources.push({ fn: 'LoadSpriteSheet', resource });
  runtime.calls.push({ fn: 'LoadSpriteSheet', args: [resource] });
};

const loadSpritePalette = (
  runtime: BattleInterfaceRuntime,
  resource: BattleInterfaceSpritePaletteData
): void => {
  runtime.loadedSpriteResources.push({ fn: 'LoadSpritePalette', resource });
  runtime.calls.push({ fn: 'LoadSpritePalette', args: [resource] });
};

const createTask = (
  runtime: BattleInterfaceRuntime,
  func: string,
  priority: number
): number => {
  let taskId = 0;
  while (runtime.tasks[taskId])
    taskId += 1;
  runtime.tasks[taskId] = {
    id: taskId,
    data: Array.from({ length: 16 }, () => 0),
    func,
    destroyed: false
  };
  runtime.calls.push({ fn: 'CreateTask', args: [func, priority, taskId] });
  return taskId;
};

export const CreatePartyStatusSummarySprites = (
  runtime: BattleInterfaceRuntime,
  battlerId: number,
  partyInfo: HpAndStatus[],
  isSwitchingMons: boolean,
  isBattleStart: boolean
): number => {
  let isOpponent: boolean;
  let x: number;
  let y: number;
  let x2: number;
  let speed: number;
  const ballIconSpritesIds = Array.from({ length: PARTY_SIZE }, () => 0);

  if (!isSwitchingMons || getBattlerPosition(runtime, battlerId) !== B_POSITION_OPPONENT_RIGHT) {
    if (getBattlerSide(runtime, battlerId) === B_SIDE_PLAYER) {
      isOpponent = false;
      x = 136;
      y = 96;
      x2 = 100;
      speed = -5;
    } else {
      isOpponent = true;

      if (!isSwitchingMons || !runtime.isDoubleBattle) {
        x = 104;
        y = 40;
      } else {
        x = 104;
        y = 16;
      }

      x2 = -100;
      speed = 5;
    }
  } else {
    isOpponent = true;
    x = 104;
    y = 40;
    x2 = -100;
    speed = 5;
  }

  let nValidMons = 0;
  for (let i = 0; i < PARTY_SIZE; i += 1) {
    if ((partyInfo[i]?.hp ?? HP_EMPTY_SLOT) !== HP_EMPTY_SLOT)
      nValidMons += 1;
  }

  const isOpponentIndex = isOpponent ? 1 : 0;
  loadCompressedSpriteSheetUsingHeap(runtime, sPartySummaryBarSpriteSheets[isOpponentIndex]);
  loadSpriteSheet(runtime, sPartySummaryBallSpriteSheets[isOpponentIndex]);
  loadSpritePalette(runtime, sPartySummaryBarSpritePals[isOpponentIndex]);
  loadSpritePalette(runtime, sPartySummaryBallSpritePals[isOpponentIndex]);

  const summaryBarSpriteId = createSpriteFromTemplate(
    runtime,
    'CreateSprite',
    `sPartySummaryBarSpriteTemplates[${isOpponentIndex}]`,
    x,
    y,
    10
  );
  const summaryBar = runtime.sprites[summaryBarSpriteId]!;
  summaryBar.callback = 'SpriteCB_PartySummaryBar';
  setSubspriteTables(runtime, summaryBar, 'sStatusSummaryBar_SubspriteTable_Enter');
  summaryBar.x2 = x2;
  summaryBar.data[0] = speed;

  if (isOpponent) {
    summaryBar.x -= 96;
    summaryBar.oam.affineParam = ST_OAM_HFLIP;
  } else {
    summaryBar.x += 96;
  }

  for (let i = 0; i < PARTY_SIZE; i += 1) {
    ballIconSpritesIds[i] = createSpriteFromTemplate(
      runtime,
      'CreateSpriteAtEnd',
      `sPartySummaryBallSpriteTemplates[${isOpponentIndex}]`,
      x,
      y - 4,
      9
    );
    const ball = runtime.sprites[ballIconSpritesIds[i]]!;
    ball.callback = 'SpriteCB_PartySummaryBall_OnBattleStart';

    if (!isBattleStart)
      ball.callback = 'SpriteCB_PartySummaryBall_OnSwitchout';

    if (!isOpponent) {
      ball.x2 = 0;
      ball.y2 = 0;
    }

    ball.data[0] = summaryBarSpriteId;

    if (!isOpponent) {
      ball.x += 10 * i + 24;
      ball.data[1] = i * 7 + 10;
      ball.x2 = 120;
    } else {
      ball.x -= 10 * (5 - i) + 24;
      ball.data[1] = (6 - i) * 7 + 10;
      ball.x2 = -120;
    }

    ball.data[2] = isOpponent ? 1 : 0;
  }

  if (getBattlerSide(runtime, battlerId) === B_SIDE_PLAYER) {
    for (let i = 0; i < PARTY_SIZE; i += 1) {
      const ball = runtime.sprites[ballIconSpritesIds[i]]!;
      const info = partyInfo[i] ?? { hp: HP_EMPTY_SLOT, status: 0 };
      if (runtime.battleTypeFlags & BATTLE_TYPE_MULTI) {
        if (info.hp === HP_EMPTY_SLOT) {
          ball.oam.tileNum += 1;
          ball.data[7] = 1;
        } else if (info.hp === 0) {
          ball.oam.tileNum += 3;
        } else if (info.status !== 0) {
          ball.oam.tileNum += 2;
        }
      } else {
        if (i >= nValidMons) {
          ball.oam.tileNum += 1;
          ball.data[7] = 1;
        } else if (info.hp === 0) {
          ball.oam.tileNum += 3;
        } else if (info.status !== 0) {
          ball.oam.tileNum += 2;
        }
      }
    }
  } else {
    let s = 5;
    for (let i = 0; i < PARTY_SIZE; i += 1) {
      const ball = runtime.sprites[ballIconSpritesIds[s]]!;
      const info = partyInfo[i] ?? { hp: HP_EMPTY_SLOT, status: 0 };
      if (runtime.battleTypeFlags & BATTLE_TYPE_MULTI) {
        if (info.hp === HP_EMPTY_SLOT) {
          ball.oam.tileNum += 1;
          ball.data[7] = 1;
        } else if (info.hp === 0) {
          ball.oam.tileNum += 3;
        } else if (info.status !== 0) {
          ball.oam.tileNum += 2;
        }
        s -= 1;
      } else {
        if (i >= nValidMons) {
          ball.oam.tileNum += 1;
          ball.data[7] = 1;
        } else if (info.hp === 0) {
          ball.oam.tileNum += 3;
        } else if (info.status !== 0) {
          ball.oam.tileNum += 2;
        }
        s -= 1;
      }
    }
  }

  const taskId = createTask(runtime, 'TaskDummy', 5);
  const task = runtime.tasks[taskId]!;
  task.data[0] = battlerId;
  task.data[1] = summaryBarSpriteId;

  for (let i = 0; i < PARTY_SIZE; i += 1)
    task.data[3 + i] = ballIconSpritesIds[i];

  task.data[10] = isBattleStart ? 1 : 0;
  runtime.soundPans.push({ fn: 'PlaySE12WithPanning', se: SE_BALL_TRAY_ENTER, pan: 0 });
  runtime.calls.push({ fn: 'PlaySE12WithPanning', args: [SE_BALL_TRAY_ENTER, 0] });
  return taskId;
};

export const CreateBattlerHealthboxSprites = (
  runtime: BattleInterfaceRuntime,
  battlerId: number
): number => {
  let healthbarType = HEALTHBAR_TYPE_PLAYER_SINGLE;
  let healthboxSpriteId: number;
  let healthboxOtherSpriteId: number;

  if (!runtime.isDoubleBattle) {
    if (getBattlerSide(runtime, battlerId) === B_SIDE_PLAYER) {
      healthboxSpriteId = createSpriteFromTemplate(runtime, 'CreateSprite', 'sHealthboxPlayerSpriteTemplates[0]', 240, 160, 1);
      healthboxOtherSpriteId = createSpriteFromTemplate(runtime, 'CreateSpriteAtEnd', 'sHealthboxPlayerSpriteTemplates[0]', 240, 160, 1);

      runtime.sprites[healthboxSpriteId]!.oam.shape = SPRITE_SHAPE_64x64;
      runtime.sprites[healthboxOtherSpriteId]!.oam.shape = SPRITE_SHAPE_64x64;
      runtime.sprites[healthboxOtherSpriteId]!.oam.tileNum += 2 * TILE_SIZE_4BPP;
    } else {
      healthboxSpriteId = createSpriteFromTemplate(runtime, 'CreateSprite', 'sHealthboxOpponentSpriteTemplates[0]', 240, 160, 1);
      healthboxOtherSpriteId = createSpriteFromTemplate(runtime, 'CreateSpriteAtEnd', 'sHealthboxOpponentSpriteTemplates[0]', 240, 160, 1);

      runtime.sprites[healthboxOtherSpriteId]!.oam.tileNum += 1 * TILE_SIZE_4BPP;
      healthbarType = HEALTHBAR_TYPE_OPPONENT;
    }

    runtime.sprites[healthboxSpriteId]!.oam.affineParam = healthboxOtherSpriteId;
    runtime.sprites[healthboxOtherSpriteId]!.data[5] = healthboxSpriteId;
    runtime.sprites[healthboxOtherSpriteId]!.callback = 'SpriteCB_HealthBoxOther';
  } else {
    if (getBattlerSide(runtime, battlerId) === B_SIDE_PLAYER) {
      const templateIndex = div(getBattlerPosition(runtime, battlerId), 2);
      healthboxSpriteId = createSpriteFromTemplate(runtime, 'CreateSprite', `sHealthboxPlayerSpriteTemplates[${templateIndex}]`, 240, 160, 1);
      healthboxOtherSpriteId = createSpriteFromTemplate(runtime, 'CreateSpriteAtEnd', `sHealthboxPlayerSpriteTemplates[${templateIndex}]`, 240, 160, 1);

      runtime.sprites[healthboxSpriteId]!.oam.affineParam = healthboxOtherSpriteId;
      runtime.sprites[healthboxOtherSpriteId]!.data[5] = healthboxSpriteId;
      runtime.sprites[healthboxOtherSpriteId]!.oam.tileNum += 1 * TILE_SIZE_4BPP;
      runtime.sprites[healthboxOtherSpriteId]!.callback = 'SpriteCB_HealthBoxOther';
      healthbarType = HEALTHBAR_TYPE_PLAYER_DOUBLE;
    } else {
      const templateIndex = div(getBattlerPosition(runtime, battlerId), 2);
      healthboxSpriteId = createSpriteFromTemplate(runtime, 'CreateSprite', `sHealthboxOpponentSpriteTemplates[${templateIndex}]`, 240, 160, 1);
      healthboxOtherSpriteId = createSpriteFromTemplate(runtime, 'CreateSpriteAtEnd', `sHealthboxOpponentSpriteTemplates[${templateIndex}]`, 240, 160, 1);

      runtime.sprites[healthboxSpriteId]!.oam.affineParam = healthboxOtherSpriteId;
      runtime.sprites[healthboxOtherSpriteId]!.data[5] = healthboxSpriteId;
      runtime.sprites[healthboxOtherSpriteId]!.oam.tileNum += 1 * TILE_SIZE_4BPP;
      runtime.sprites[healthboxOtherSpriteId]!.callback = 'SpriteCB_HealthBoxOther';
      healthbarType = HEALTHBAR_TYPE_OPPONENT;
    }
  }

  const healthbarSpriteId = createSpriteFromTemplate(
    runtime,
    'CreateSpriteAtEnd',
    `sHealthbarSpriteTemplates[${runtime.battlerPositions[battlerId]}]`,
    140,
    60,
    0
  );
  const healthbarSprite = runtime.sprites[healthbarSpriteId]!;
  setSubspriteTables(runtime, healthbarSprite, `sHealthBar_SubspriteTable[${getBattlerSide(runtime, battlerId)}]`);
  healthbarSprite.subspriteMode = SUBSPRITES_IGNORE_PRIORITY;
  healthbarSprite.oam.priority = 1;
  cpuCopy32(
    runtime,
    GetBattleInterfaceGfxPtr(B_INTERFACE_GFX_HP_BAR_HP_TEXT),
    healthbarSprite.oam.tileNum * TILE_SIZE_4BPP,
    2 * TILE_SIZE_4BPP
  );

  runtime.sprites[healthboxSpriteId]!.data[5] = healthbarSpriteId;
  runtime.sprites[healthboxSpriteId]!.data[6] = battlerId;
  runtime.sprites[healthboxSpriteId]!.invisible = true;
  runtime.sprites[healthboxOtherSpriteId]!.invisible = true;
  healthbarSprite.data[5] = healthboxSpriteId;
  healthbarSprite.data[6] = healthbarType;
  healthbarSprite.invisible = true;

  return healthboxSpriteId;
};

export const CreateSafariPlayerHealthboxSprites = (
  runtime: BattleInterfaceRuntime
): number => {
  const healthboxSpriteId = createSpriteFromTemplate(runtime, 'CreateSprite', 'sHealthboxSafariSpriteTemplate', 240, 160, 1);
  const healthboxOtherSpriteId = createSpriteFromTemplate(runtime, 'CreateSpriteAtEnd', 'sHealthboxSafariSpriteTemplate', 240, 160, 1);

  runtime.sprites[healthboxSpriteId]!.oam.shape = SPRITE_SHAPE_64x64;
  runtime.sprites[healthboxOtherSpriteId]!.oam.shape = SPRITE_SHAPE_64x64;
  runtime.sprites[healthboxOtherSpriteId]!.oam.tileNum += 2 * TILE_SIZE_4BPP;
  runtime.sprites[healthboxSpriteId]!.oam.affineParam = healthboxOtherSpriteId;
  runtime.sprites[healthboxOtherSpriteId]!.data[5] = healthboxSpriteId;
  runtime.sprites[healthboxOtherSpriteId]!.callback = 'SpriteCB_HealthBoxOther';
  return healthboxSpriteId;
};

export const DestoryHealthboxSprite = (
  runtime: BattleInterfaceRuntime,
  healthboxSpriteId: number
): void => {
  const healthboxSprite = runtime.sprites[healthboxSpriteId]!;
  destroySprite(runtime, healthboxSprite.oam.affineParam);
  destroySprite(runtime, healthboxSprite.data[5]);
  destroySprite(runtime, healthboxSpriteId);
};

export const DummyBattleInterfaceFunc = (
  _runtime: BattleInterfaceRuntime,
  _healthboxSpriteId: number,
  _isDoubleBattleBattlerOnly: boolean
): void => {};

const getPartySummaryBallIconSpriteIds = (
  task: BattleInterfaceTask
): number[] => Array.from({ length: PARTY_SIZE }, (_, index) => task.data[3 + index]);

export const Task_HidePartyStatusSummary = (
  runtime: BattleInterfaceRuntime,
  taskId: number
): void => {
  const task = runtime.tasks[taskId];
  if (!task)
    return;

  const isBattleStart = task.data[10];
  const summaryBarSpriteId = task.data[1];
  const battlerId = task.data[0];
  const ballIconSpriteIds = getPartySummaryBallIconSpriteIds(task);

  setGpuReg(runtime, REG_OFFSET_BLDCNT, BLDCNT_TGT2_ALL | BLDCNT_EFFECT_BLEND);
  setGpuReg(runtime, REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(16, 0));

  task.data[15] = 16;

  for (let i = 0; i < PARTY_SIZE; i += 1)
    runtime.sprites[ballIconSpriteIds[i]]!.oam.objMode = ST_OAM_OBJ_BLEND;

  runtime.sprites[summaryBarSpriteId]!.oam.objMode = ST_OAM_OBJ_BLEND;

  if (isBattleStart) {
    for (let i = 0; i < PARTY_SIZE; i += 1) {
      if (getBattlerSide(runtime, battlerId) !== B_SIDE_PLAYER) {
        const ball = runtime.sprites[ballIconSpriteIds[5 - i]]!;
        ball.data[1] = 7 * i;
        ball.data[3] = 0;
        ball.data[4] = 0;
        ball.callback = 'SpriteCB_PartySummaryBall_Exit';
      } else {
        const ball = runtime.sprites[ballIconSpriteIds[i]]!;
        ball.data[1] = 7 * i;
        ball.data[3] = 0;
        ball.data[4] = 0;
        ball.callback = 'SpriteCB_PartySummaryBall_Exit';
      }
    }
    const summaryBar = runtime.sprites[summaryBarSpriteId]!;
    summaryBar.data[0] = Math.trunc(summaryBar.data[0] / 2);
    summaryBar.data[1] = 0;
    summaryBar.callback = 'SpriteCB_PartySummaryBar_Exit';
    setSubspriteTables(runtime, summaryBar, 'sStatusSummaryBar_SubspriteTable_Exit');
    task.func = 'Task_HidePartyStatusSummary_BattleStart_1';
  } else {
    task.func = 'Task_HidePartyStatusSummary_DuringBattle';
  }
};

export const Task_HidePartyStatusSummary_BattleStart_1 = (
  runtime: BattleInterfaceRuntime,
  taskId: number
): void => {
  const task = runtime.tasks[taskId];
  if (!task)
    return;

  if ((task.data[11]++ % 2) === 0) {
    task.data[15] -= 1;
    if (task.data[15] < 0)
      return;

    setGpuReg(runtime, REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(task.data[15], 16 - task.data[15]));
  }
  if (task.data[15] === 0)
    task.func = 'Task_HidePartyStatusSummary_BattleStart_2';
};

export const Task_HidePartyStatusSummary_BattleStart_2 = (
  runtime: BattleInterfaceRuntime,
  taskId: number
): void => {
  const task = runtime.tasks[taskId];
  if (!task)
    return;

  task.data[15] -= 1;
  if (task.data[15] === -1) {
    const summaryBarSpriteId = task.data[1];
    const ballIconSpriteIds = getPartySummaryBallIconSpriteIds(task);

    destroySpriteAndFreeResources(runtime, summaryBarSpriteId);
    destroySpriteAndFreeResources(runtime, ballIconSpriteIds[0]);

    for (let i = 1; i < PARTY_SIZE; i += 1)
      destroySprite(runtime, ballIconSpriteIds[i]);
  } else if (task.data[15] === -3) {
    setGpuReg(runtime, REG_OFFSET_BLDCNT, 0);
    setGpuReg(runtime, REG_OFFSET_BLDALPHA, 0);
    destroyTask(runtime, taskId);
  }
};

export const Task_HidePartyStatusSummary_DuringBattle = (
  runtime: BattleInterfaceRuntime,
  taskId: number
): void => {
  const task = runtime.tasks[taskId];
  if (!task)
    return;

  task.data[15] -= 1;
  if (task.data[15] >= 0) {
    setGpuReg(runtime, REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(task.data[15], 16 - task.data[15]));
  } else if (task.data[15] === -1) {
    const summaryBarSpriteId = task.data[1];
    const ballIconSpriteIds = getPartySummaryBallIconSpriteIds(task);

    destroySpriteAndFreeResources(runtime, summaryBarSpriteId);
    destroySpriteAndFreeResources(runtime, ballIconSpriteIds[0]);

    for (let i = 1; i < PARTY_SIZE; i += 1)
      destroySprite(runtime, ballIconSpriteIds[i]);
  } else if (task.data[15] === -3) {
    setGpuReg(runtime, REG_OFFSET_BLDCNT, 0);
    setGpuReg(runtime, REG_OFFSET_BLDALPHA, 0);
    destroyTask(runtime, taskId);
  }
};

export const UpdateOamPriorityInAllHealthboxes = (
  runtime: BattleInterfaceRuntime,
  priority: number
): void => {
  for (let i = 0; i < runtime.healthboxSpriteIds.length; i += 1) {
    const healthboxSpriteId = runtime.healthboxSpriteIds[i];
    const healthboxSprite = runtime.sprites[healthboxSpriteId]!;
    const healthboxOtherSpriteId = healthboxSprite.oam.affineParam;
    const healthbarSpriteId = healthboxSprite.data[5];

    healthboxSprite.oam.priority = priority;
    runtime.sprites[healthboxOtherSpriteId]!.oam.priority = priority;
    runtime.sprites[healthbarSpriteId]!.oam.priority = priority;
  }
};

export const InitBattlerHealthboxCoords = (
  runtime: BattleInterfaceRuntime,
  battler: number
): void => {
  let x = 0;
  let y = 0;

  if (!runtime.isDoubleBattle) {
    if (getBattlerSide(runtime, battler) !== B_SIDE_PLAYER) {
      x = 44;
      y = 30;
    } else {
      x = 158;
      y = 88;
    }
  } else {
    switch (getBattlerPosition(runtime, battler)) {
      case B_POSITION_PLAYER_LEFT:
        x = 159;
        y = 75;
        break;
      case B_POSITION_PLAYER_RIGHT:
        x = 171;
        y = 100;
        break;
      case B_POSITION_OPPONENT_LEFT:
        x = 44;
        y = 19;
        break;
      case B_POSITION_OPPONENT_RIGHT:
        x = 32;
        y = 44;
        break;
    }
  }

  UpdateSpritePos(runtime, runtime.healthboxSpriteIds[battler], x, y);
};

export const TryAddPokeballIconToHealthbox = (
  runtime: BattleInterfaceRuntime,
  healthboxSpriteId: number,
  noStatus: boolean
): void => {
  if (runtime.battleTypeFlags & (BATTLE_TYPE_FIRST_BATTLE | BATTLE_TYPE_OLD_MAN_TUTORIAL | BATTLE_TYPE_POKEDUDE)) {
    return;
  }

  if (runtime.battleTypeFlags & BATTLE_TYPE_TRAINER) {
    return;
  }

  const healthboxSprite = runtime.sprites[healthboxSpriteId]!;
  const battlerId = healthboxSprite.data[6];
  if (getBattlerSide(runtime, battlerId) === B_SIDE_PLAYER) {
    return;
  }

  const mon = runtime.enemyParty[runtime.battlerPartyIndexes[battlerId]];
  if (checkBattleTypeGhost(runtime, mon, battlerId)) {
    return;
  }

  if (!getSetPokedexFlag(runtime, speciesToNationalPokedexNum(mon.species))) {
    return;
  }

  const healthBarSpriteId = healthboxSprite.data[5];
  const dest = (runtime.sprites[healthBarSpriteId]!.oam.tileNum + 8) * TILE_SIZE_4BPP;
  if (noStatus) {
    cpuCopy32(runtime, GetBattleInterfaceGfxPtr(B_INTERFACE_GFX_BALL_CAUGHT), dest, 1 * TILE_SIZE_4BPP);
  } else {
    cpuFill32(runtime, 0, dest, 1 * TILE_SIZE_4BPP);
  }
};

export const CalcNewBarValue = (
  maxValue: number,
  oldValue: number,
  receivedValue: number,
  currValue: { value: number },
  totalPixels: number,
  increment: number
): number => {
  let ret: number;
  let newValue: number;
  totalPixels *= 8;

  if (currValue.value === -32768) {
    if (maxValue < totalPixels)
      currValue.value = q24_8(oldValue);
    else
      currValue.value = oldValue;
  }

  newValue = oldValue - receivedValue;
  if (newValue < 0)
    newValue = 0;
  else if (newValue > maxValue)
    newValue = maxValue;

  if (maxValue < totalPixels) {
    if (newValue === q24_8ToInt(currValue.value) && (currValue.value & 0xff) === 0)
      return -1;
  } else {
    if (newValue === currValue.value)
      return -1;
  }

  if (maxValue < totalPixels) {
    const incrementInQ = div(q24_8(maxValue), totalPixels);

    if (receivedValue < 0) {
      currValue.value += incrementInQ;
      ret = q24_8ToInt(currValue.value);
      if (ret >= newValue) {
        currValue.value = q24_8(newValue);
        ret = newValue;
      }
    } else {
      currValue.value -= incrementInQ;
      ret = q24_8ToInt(currValue.value);
      if ((currValue.value & 0xff) > 0)
        ret++;
      if (ret <= newValue) {
        currValue.value = q24_8(newValue);
        ret = newValue;
      }
    }
  } else if (receivedValue < 0) {
    currValue.value += increment;
    if (currValue.value > newValue)
      currValue.value = newValue;
    ret = currValue.value;
  } else {
    currValue.value -= increment;
    if (currValue.value < newValue)
      currValue.value = newValue;
    ret = currValue.value;
  }

  return ret;
};

export const CalcBarFilledPixels = (
  maxValue: number,
  oldValue: number,
  receivedValue: number,
  currValue: { value: number },
  filledPixels: number[],
  numTiles: number
): number => {
  let numPixelsToFill: number;
  let totalFilledPixels: number;
  let newValue = oldValue - receivedValue;
  if (newValue < 0)
    newValue = 0;
  else if (newValue > maxValue)
    newValue = maxValue;

  const totalPixels = numTiles * 8;

  for (let i = 0; i < numTiles; i += 1)
    filledPixels[i] = 0;

  if (maxValue < totalPixels)
    numPixelsToFill = q24_8ToInt(div(currValue.value * totalPixels, maxValue));
  else
    numPixelsToFill = div(currValue.value * totalPixels, maxValue);

  totalFilledPixels = numPixelsToFill;

  if (numPixelsToFill === 0 && newValue > 0) {
    filledPixels[0] = 1;
    totalFilledPixels = 1;
  } else {
    for (let i = 0; i < numTiles; i += 1) {
      if (numPixelsToFill >= 8)
        filledPixels[i] = 8;
      else {
        filledPixels[i] = numPixelsToFill;
        break;
      }
      numPixelsToFill -= 8;
    }
  }

  return totalFilledPixels;
};

export const DrawHealthbarOntoScreen = (
  runtime: BattleInterfaceRuntime,
  barInfo: TestingBar,
  currValue: { value: number },
  bg: number,
  x: number,
  y: number
): void => {
  const filledPixels = Array.from({ length: B_HEALTHBAR_NUM_TILES }, () => 0);
  const tiles = Array.from({ length: B_HEALTHBAR_NUM_TILES }, () => 0);

  CalcBarFilledPixels(
    barInfo.maxValue,
    barInfo.oldValue,
    barInfo.receivedValue,
    currValue,
    filledPixels,
    B_HEALTHBAR_NUM_TILES
  );

  for (let i = 0; i < tiles.length; i += 1)
    tiles[i] = ((barInfo.pal & 0x1f) << 12) | (barInfo.tileOffset + filledPixels[i]);

  copyToBgTilemapBufferRectChangePalette(runtime, bg, tiles, x, y, 6, 1, 17);
};

export const UpdateAndDrawHealthbarOntoScreen = (
  runtime: BattleInterfaceRuntime,
  barInfo: TestingBar,
  currValue: { value: number },
  bg: number,
  x: number,
  y: number
): number => {
  const hpVal = CalcNewBarValue(
    barInfo.maxValue,
    barInfo.oldValue,
    barInfo.receivedValue,
    currValue,
    B_HEALTHBAR_NUM_TILES,
    1
  );

  DrawHealthbarOntoScreen(runtime, barInfo, currValue, bg, x, y);

  return hpVal;
};

export const CalcNewHealthbarValue = (
  barInfo: TestingBar,
  currValue: { value: number }
): number => CalcNewBarValue(
  barInfo.maxValue,
  barInfo.oldValue,
  barInfo.receivedValue,
  currValue,
  B_HEALTHBAR_NUM_TILES,
  1
);

export const DoDrawHealthbarOntoScreen = (
  runtime: BattleInterfaceRuntime,
  barInfo: TestingBar,
  currValue: { value: number },
  bg: number,
  x: number,
  y: number
): void => {
  DrawHealthbarOntoScreen(runtime, barInfo, currValue, bg, x, y);
};

export const GetReceivedValueInPixels = (
  oldValue: number,
  receivedValue: number,
  maxValue: number,
  totalPixels: number
): number => {
  let newVal: number;
  let result: number;

  totalPixels *= 8;
  newVal = oldValue - receivedValue;

  if (newVal < 0)
    newVal = 0;
  else if (newVal > maxValue)
    newVal = maxValue;

  const oldToMax = div(oldValue * totalPixels, maxValue);
  const newToMax = div(newVal * totalPixels, maxValue);
  result = oldToMax - newToMax;

  return Math.abs(result);
};

export const GetScaledHPFraction = (hp: number, maxhp: number, scale: number): number => {
  const result = div(hp * scale, maxhp);

  if (result === 0 && hp > 0)
    return 1;

  return result;
};

export const GetHPBarLevel = (hp: number, maxhp: number): number => {
  let result: number;

  if (hp === maxhp) {
    result = HP_BAR_FULL;
  } else {
    const fraction = GetScaledHPFraction(hp, maxhp, B_HEALTHBAR_NUM_PIXELS);
    if (fraction > B_HEALTHBAR_NUM_PIXELS * 50 / 100)
      result = HP_BAR_GREEN;
    else if (fraction > B_HEALTHBAR_NUM_PIXELS * 20 / 100)
      result = HP_BAR_YELLOW;
    else if (fraction > 0)
      result = HP_BAR_RED;
    else
      result = HP_BAR_EMPTY;
  }

  return result;
};

export const MoveBattleBarGraphically = (
  runtime: BattleInterfaceRuntime,
  battlerId: number,
  whichBar: number
): void => {
  const numTiles = whichBar === HEALTH_BAR ? B_HEALTHBAR_NUM_TILES : B_EXPBAR_NUM_TILES;
  const filledPixels = Array.from({ length: numTiles }, () => 0);
  const bar = runtime.battleBars[battlerId];
  const currValue = { value: bar.currValue };
  const totalFilledPixels = CalcBarFilledPixels(
    bar.maxValue,
    bar.oldValue,
    bar.receivedValue,
    currValue,
    filledPixels,
    numTiles
  );
  bar.currValue = currValue.value;

  let barElementId = B_INTERFACE_GFX_EXP_BAR;
  if (whichBar === HEALTH_BAR) {
    if (totalFilledPixels > B_HEALTHBAR_NUM_PIXELS * 50 / 100)
      barElementId = B_INTERFACE_GFX_HP_BAR_GREEN;
    else if (totalFilledPixels > B_HEALTHBAR_NUM_PIXELS * 20 / 100)
      barElementId = B_INTERFACE_GFX_HP_BAR_YELLOW;
    else
      barElementId = B_INTERFACE_GFX_HP_BAR_RED;

    for (let i = 0; i < B_HEALTHBAR_NUM_TILES; i += 1) {
      const healthbarSpriteId = runtime.sprites[bar.healthboxSpriteId]!.data[5];
      const healthbarSprite = runtime.sprites[healthbarSpriteId]!;
      if (i < 2) {
        cpuCopy32(
          runtime,
          `${GetBattleInterfaceGfxPtr(barElementId)}+${filledPixels[i] * TILE_SIZE_4BPP}`,
          (healthbarSprite.oam.tileNum + 2 + i) * TILE_SIZE_4BPP,
          1 * TILE_SIZE_4BPP
        );
      } else {
        cpuCopy32(
          runtime,
          `${GetBattleInterfaceGfxPtr(barElementId)}+${filledPixels[i] * TILE_SIZE_4BPP}`,
          64 + (i + healthbarSprite.oam.tileNum) * TILE_SIZE_4BPP,
          1 * TILE_SIZE_4BPP
        );
      }
    }
  } else {
    const level = runtime.playerPartyLevels[runtime.battlerPartyIndexes[battlerId]];
    if (level === MAX_LEVEL) {
      for (let i = 0; i < B_EXPBAR_NUM_TILES; i += 1)
        filledPixels[i] = 0;
    }

    for (let i = 0; i < B_EXPBAR_NUM_TILES; i += 1) {
      const healthboxSprite = runtime.sprites[bar.healthboxSpriteId]!;
      if (i < 4) {
        cpuCopy32(
          runtime,
          `${GetBattleInterfaceGfxPtr(B_INTERFACE_GFX_EXP_BAR)}+${filledPixels[i] * TILE_SIZE_4BPP}`,
          (healthboxSprite.oam.tileNum + 36 + i) * TILE_SIZE_4BPP,
          1 * TILE_SIZE_4BPP
        );
      } else {
        cpuCopy32(
          runtime,
          `${GetBattleInterfaceGfxPtr(B_INTERFACE_GFX_EXP_BAR)}+${filledPixels[i] * TILE_SIZE_4BPP}`,
          0xb80 + (i + healthboxSprite.oam.tileNum) * TILE_SIZE_4BPP,
          1 * TILE_SIZE_4BPP
        );
      }
    }
  }

  runtime.graphicalUpdates.push({ battlerId, whichBar, filledPixels, totalFilledPixels, barElementId });
};

export const MoveBattleBar = (
  runtime: BattleInterfaceRuntime,
  battlerId: number,
  _healthboxSpriteId: number,
  whichBar: number,
  _unused: number
): number => {
  const bar = runtime.battleBars[battlerId];
  const currValue = { value: bar.currValue };
  let currentBarValue: number;

  if (whichBar === HEALTH_BAR) {
    currentBarValue = CalcNewBarValue(
      bar.maxValue,
      bar.oldValue,
      bar.receivedValue,
      currValue,
      B_HEALTHBAR_NUM_TILES,
      1
    );
  } else {
    let increment = GetReceivedValueInPixels(
      bar.oldValue,
      bar.receivedValue,
      bar.maxValue,
      B_EXPBAR_NUM_TILES
    );

    if (increment === 0)
      increment = 1;
    increment = Math.abs(div(bar.receivedValue, increment));

    currentBarValue = CalcNewBarValue(
      bar.maxValue,
      bar.oldValue,
      bar.receivedValue,
      currValue,
      B_EXPBAR_NUM_TILES,
      increment
    );
  }
  bar.currValue = currValue.value;

  if (whichBar === EXP_BAR || (whichBar === HEALTH_BAR && !runtime.battlerData[battlerId].hpNumbersNoBars))
    MoveBattleBarGraphically(runtime, battlerId, whichBar);

  if (currentBarValue === -1)
    bar.currValue = 0;

  return currentBarValue;
};

export const UpdateStatusIconInHealthbox = (
  runtime: BattleInterfaceRuntime,
  healthboxSpriteId: number
): void => {
  let i: number;
  let statusGfxPtr: string;
  let statusPalId: number;
  let tileNumAdder: number;

  const healthboxSprite = runtime.sprites[healthboxSpriteId];
  if (!healthboxSprite)
    return;

  const battlerId = healthboxSprite.data[6];
  const healthBarSpriteId = healthboxSprite.data[5];
  const healthBarSprite = runtime.sprites[healthBarSpriteId];
  if (!healthBarSprite)
    return;

  let status: number;
  if (getBattlerSide(runtime, battlerId) === B_SIDE_PLAYER) {
    status = runtime.playerParty[runtime.battlerPartyIndexes[battlerId]]?.status ?? 0;
    if (!runtime.isDoubleBattle)
      tileNumAdder = 0x1a;
    else
      tileNumAdder = 0x12;
  } else {
    status = runtime.enemyParty[runtime.battlerPartyIndexes[battlerId]]?.status ?? 0;
    tileNumAdder = 0x11;
  }

  if (status & STATUS1_SLEEP) {
    statusGfxPtr = GetBattleInterfaceGfxPtr(GetStatusIconForBattlerId(B_INTERFACE_GFX_STATUS_SLP_BATTLER0, battlerId));
    statusPalId = PAL_STATUS_SLP;
  } else if (status & STATUS1_PSN_ANY) {
    statusGfxPtr = GetBattleInterfaceGfxPtr(GetStatusIconForBattlerId(B_INTERFACE_GFX_STATUS_PSN_BATTLER0, battlerId));
    statusPalId = PAL_STATUS_PSN;
  } else if (status & STATUS1_BURN) {
    statusGfxPtr = GetBattleInterfaceGfxPtr(GetStatusIconForBattlerId(B_INTERFACE_GFX_STATUS_BRN_BATTLER0, battlerId));
    statusPalId = PAL_STATUS_BRN;
  } else if (status & STATUS1_FREEZE) {
    statusGfxPtr = GetBattleInterfaceGfxPtr(GetStatusIconForBattlerId(B_INTERFACE_GFX_STATUS_FRZ_BATTLER0, battlerId));
    statusPalId = PAL_STATUS_FRZ;
  } else if (status & STATUS1_PARALYSIS) {
    statusGfxPtr = GetBattleInterfaceGfxPtr(GetStatusIconForBattlerId(B_INTERFACE_GFX_STATUS_PAR_BATTLER0, battlerId));
    statusPalId = PAL_STATUS_PAR;
  } else {
    statusGfxPtr = GetBattleInterfaceGfxPtr(B_INTERFACE_GFX_STATUS_NONE);

    for (i = 0; i < 3; i += 1)
      cpuCopy32(
        runtime,
        statusGfxPtr,
        (healthboxSprite.oam.tileNum + tileNumAdder + i) * TILE_SIZE_4BPP,
        1 * TILE_SIZE_4BPP
      );

    if (!runtime.battlerData[battlerId].hpNumbersNoBars)
      cpuCopy32(
        runtime,
        GetBattleInterfaceGfxPtr(B_INTERFACE_GFX_HP_BAR_HP_TEXT),
        healthBarSprite.oam.tileNum * TILE_SIZE_4BPP,
        2 * TILE_SIZE_4BPP
      );

    TryAddPokeballIconToHealthbox(runtime, healthboxSpriteId, true);
    return;
  }

  let pltAdder = PLTT_ID(healthboxSprite.oam.paletteNum);
  pltAdder += battlerId + 12;

  fillPalette(runtime, sStatusIconColors[statusPalId], pltAdder + OBJ_PLTT_OFFSET, PLTT_SIZEOF(1));
  cpuCopy16(runtime, OBJ_PLTT_OFFSET + pltAdder, pltAdder, PLTT_SIZEOF(1));
  cpuCopy32(
    runtime,
    statusGfxPtr,
    (healthboxSprite.oam.tileNum + tileNumAdder) * TILE_SIZE_4BPP,
    3 * TILE_SIZE_4BPP
  );
  if (runtime.isDoubleBattle === true || getBattlerSide(runtime, battlerId) === B_SIDE_OPPONENT) {
    if (!runtime.battlerData[battlerId].hpNumbersNoBars) {
      cpuCopy32(
        runtime,
        GetBattleInterfaceGfxPtr(B_INTERFACE_GFX_TRANSPARENT),
        healthBarSprite.oam.tileNum * TILE_SIZE_4BPP,
        1 * TILE_SIZE_4BPP
      );
      cpuCopy32(
        runtime,
        GetBattleInterfaceGfxPtr(B_INTERFACE_GFX_HP_BAR_LEFT_BORDER),
        (healthBarSprite.oam.tileNum + 1) * TILE_SIZE_4BPP,
        1 * TILE_SIZE_4BPP
      );
    }
  }
  TryAddPokeballIconToHealthbox(runtime, healthboxSpriteId, false);
};

export const GetStatusIconForBattlerId = (
  statusElementId: number,
  battlerId: number
): number => {
  let ret = statusElementId;

  switch (statusElementId) {
    case B_INTERFACE_GFX_STATUS_PSN_BATTLER0:
      if (battlerId === 0)
        ret = B_INTERFACE_GFX_STATUS_PSN_BATTLER0;
      else if (battlerId === 1)
        ret = B_INTERFACE_GFX_STATUS_PSN_BATTLER1;
      else if (battlerId === 2)
        ret = B_INTERFACE_GFX_STATUS_PSN_BATTLER2;
      else
        ret = B_INTERFACE_GFX_STATUS_PSN_BATTLER3;
      break;
    case B_INTERFACE_GFX_STATUS_PAR_BATTLER0:
      if (battlerId === 0)
        ret = B_INTERFACE_GFX_STATUS_PAR_BATTLER0;
      else if (battlerId === 1)
        ret = B_INTERFACE_GFX_STATUS_PAR_BATTLER1;
      else if (battlerId === 2)
        ret = B_INTERFACE_GFX_STATUS_PAR_BATTLER2;
      else
        ret = B_INTERFACE_GFX_STATUS_PAR_BATTLER3;
      break;
    case B_INTERFACE_GFX_STATUS_SLP_BATTLER0:
      if (battlerId === 0)
        ret = B_INTERFACE_GFX_STATUS_SLP_BATTLER0;
      else if (battlerId === 1)
        ret = B_INTERFACE_GFX_STATUS_SLP_BATTLER1;
      else if (battlerId === 2)
        ret = B_INTERFACE_GFX_STATUS_SLP_BATTLER2;
      else
        ret = B_INTERFACE_GFX_STATUS_SLP_BATTLER3;
      break;
    case B_INTERFACE_GFX_STATUS_FRZ_BATTLER0:
      if (battlerId === 0)
        ret = B_INTERFACE_GFX_STATUS_FRZ_BATTLER0;
      else if (battlerId === 1)
        ret = B_INTERFACE_GFX_STATUS_FRZ_BATTLER1;
      else if (battlerId === 2)
        ret = B_INTERFACE_GFX_STATUS_FRZ_BATTLER2;
      else
        ret = B_INTERFACE_GFX_STATUS_FRZ_BATTLER3;
      break;
    case B_INTERFACE_GFX_STATUS_BRN_BATTLER0:
      if (battlerId === 0)
        ret = B_INTERFACE_GFX_STATUS_BRN_BATTLER0;
      else if (battlerId === 1)
        ret = B_INTERFACE_GFX_STATUS_BRN_BATTLER1;
      else if (battlerId === 2)
        ret = B_INTERFACE_GFX_STATUS_BRN_BATTLER2;
      else
        ret = B_INTERFACE_GFX_STATUS_BRN_BATTLER3;
      break;
  }
  return ret;
};

export const UpdateSafariBallsTextOnHealthbox = (
  runtime: BattleInterfaceRuntime,
  healthboxSpriteId: number
): void => {
  const healthboxSprite = runtime.sprites[healthboxSpriteId];
  if (!healthboxSprite)
    return;

  const { windowTileData, windowId } = AddTextPrinterAndCreateWindowOnHealthbox(runtime, gText_SafariBalls, 0, 3);
  const spriteTileNum = healthboxSprite.oam.tileNum * TILE_SIZE_4BPP;
  TextIntoHealthboxObject(runtime, 0x40 + spriteTileNum, windowTileData, 0, 6);
  TextIntoHealthboxObject(runtime, 0x800 + spriteTileNum, windowTileData, 0xc0, 2);
  RemoveWindowOnHealthbox(runtime, windowId);
};

export const UpdateLeftNoOfBallsTextOnHealthbox = (
  runtime: BattleInterfaceRuntime,
  healthboxSpriteId: number
): void => {
  const healthboxSprite = runtime.sprites[healthboxSpriteId];
  if (!healthboxSprite)
    return;

  const text = `${gText_HighlightRed_Left}${convertIntToDecimalStringN(runtime.gNumSafariBalls, STR_CONV_MODE_LEFT_ALIGN, 2)}`;
  const x = 47 - getStringWidth(runtime, FONT_SMALL, text, 0);
  const { windowTileData, windowId } = AddTextPrinterAndCreateWindowOnHealthbox(runtime, text, x, 3);
  const spriteTileNum = healthboxSprite.oam.tileNum * TILE_SIZE_4BPP;
  SafariTextIntoHealthboxObject(runtime, 0x2c0 + spriteTileNum, windowTileData, 0, 2);
  SafariTextIntoHealthboxObject(runtime, 0xa00 + spriteTileNum, windowTileData, 0x40, 4);
  RemoveWindowOnHealthbox(runtime, windowId);
};

export const UpdateHealthboxAttribute = (
  runtime: BattleInterfaceRuntime,
  healthboxSpriteId: number,
  mon: BattleInterfaceMon,
  elementId: number
): void => {
  let maxHp: number;
  let currHp: number;
  const healthboxSprite = runtime.sprites[healthboxSpriteId];
  if (!healthboxSprite)
    return;
  const battlerId = healthboxSprite.data[6];

  if (elementId === HEALTHBOX_ALL && !runtime.isDoubleBattle)
    getBattlerSide(runtime, battlerId);

  if (getBattlerSide(runtime, healthboxSprite.data[6]) === B_SIDE_PLAYER) {
    let isDoubles: boolean;

    if (elementId === HEALTHBOX_LEVEL || elementId === HEALTHBOX_ALL)
      UpdateLvlInHealthbox(runtime, healthboxSpriteId, mon.level ?? 0);
    if (elementId === HEALTHBOX_CURRENT_HP || elementId === HEALTHBOX_ALL)
      UpdateHpTextInHealthbox(runtime, healthboxSpriteId, mon.hp ?? 0, HP_CURRENT);
    if (elementId === HEALTHBOX_MAX_HP || elementId === HEALTHBOX_ALL)
      UpdateHpTextInHealthbox(runtime, healthboxSpriteId, mon.maxHp ?? 0, HP_MAX);
    if (elementId === HEALTHBOX_HEALTH_BAR || elementId === HEALTHBOX_ALL) {
      loadBattleBarGfx(runtime, 0);
      maxHp = mon.maxHp ?? 0;
      currHp = mon.hp ?? 0;
      SetBattleBarStruct(runtime, battlerId, healthboxSpriteId, maxHp, currHp, 0);
      MoveBattleBar(runtime, battlerId, healthboxSpriteId, HEALTH_BAR, 0);
    }
    isDoubles = runtime.isDoubleBattle;
    if (!isDoubles && (elementId === HEALTHBOX_EXP_BAR || elementId === HEALTHBOX_ALL)) {
      let species: number;
      let exp: number;
      let currLevelExp: number;
      let currExpBarValue: number;
      let maxExpBarValue: number;
      let level: number;

      loadBattleBarGfx(runtime, 3);
      species = mon.species ?? 0;
      level = mon.level ?? 0;
      exp = mon.exp ?? 0;
      const growthRate = runtime.speciesInfo[species]?.growthRate ?? 0;
      currLevelExp = runtime.experienceTables[growthRate]?.[level] ?? 0;
      currExpBarValue = exp - currLevelExp;
      maxExpBarValue = (runtime.experienceTables[growthRate]?.[level + 1] ?? currLevelExp) - currLevelExp;
      SetBattleBarStruct(runtime, battlerId, healthboxSpriteId, maxExpBarValue, currExpBarValue, isDoubles ? 1 : 0);
      MoveBattleBar(runtime, battlerId, healthboxSpriteId, EXP_BAR, 0);
    }
    if (elementId === HEALTHBOX_NICK || elementId === HEALTHBOX_ALL)
      UpdateNickInHealthbox(runtime, healthboxSpriteId, mon);
    if (elementId === HEALTHBOX_STATUS_ICON || elementId === HEALTHBOX_ALL)
      UpdateStatusIconInHealthbox(runtime, healthboxSpriteId);
    if (elementId === HEALTHBOX_SAFARI_ALL_TEXT)
      UpdateSafariBallsTextOnHealthbox(runtime, healthboxSpriteId);
    if (elementId === HEALTHBOX_SAFARI_ALL_TEXT || elementId === HEALTHBOX_SAFARI_BALLS_TEXT)
      UpdateLeftNoOfBallsTextOnHealthbox(runtime, healthboxSpriteId);
  } else {
    if (elementId === HEALTHBOX_LEVEL || elementId === HEALTHBOX_ALL)
      UpdateLvlInHealthbox(runtime, healthboxSpriteId, mon.level ?? 0);
    if (elementId === HEALTHBOX_HEALTH_BAR || elementId === HEALTHBOX_ALL) {
      loadBattleBarGfx(runtime, 0);
      maxHp = mon.maxHp ?? 0;
      currHp = mon.hp ?? 0;
      SetBattleBarStruct(runtime, battlerId, healthboxSpriteId, maxHp, currHp, 0);
      MoveBattleBar(runtime, battlerId, healthboxSpriteId, HEALTH_BAR, 0);
    }
    if (elementId === HEALTHBOX_NICK || elementId === HEALTHBOX_ALL)
      UpdateNickInHealthbox(runtime, healthboxSpriteId, mon);
    if (elementId === HEALTHBOX_STATUS_ICON || elementId === HEALTHBOX_ALL)
      UpdateStatusIconInHealthbox(runtime, healthboxSpriteId);
  }
};
