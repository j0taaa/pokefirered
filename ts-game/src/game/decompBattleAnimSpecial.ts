import { cos, sin } from './decompTrig';
import { BG_PLTT_ID, OBJ_PLTT_ID, RGB, RGB_BLACK, RGB_WHITE } from './decompPalette';

export const TAG_PARTICLES_POKEBALL = 55020;
export const TAG_PARTICLES_GREATBALL = 55021;
export const TAG_PARTICLES_SAFARIBALL = 55022;
export const TAG_PARTICLES_ULTRABALL = 55023;
export const TAG_PARTICLES_MASTERBALL = 55024;
export const TAG_PARTICLES_NETBALL = 55025;
export const TAG_PARTICLES_DIVEBALL = 55026;
export const TAG_PARTICLES_NESTBALL = 55027;
export const TAG_PARTICLES_REPEATBALL = 55028;
export const TAG_PARTICLES_TIMERBALL = 55029;
export const TAG_PARTICLES_LUXURYBALL = 55030;
export const TAG_PARTICLES_PREMIERBALL = 55031;

export const ITEM_MASTER_BALL = 1;
export const ITEM_ULTRA_BALL = 2;
export const ITEM_GREAT_BALL = 3;
export const ITEM_POKE_BALL = 4;
export const ITEM_SAFARI_BALL = 5;
export const ITEM_NET_BALL = 6;
export const ITEM_DIVE_BALL = 7;
export const ITEM_NEST_BALL = 8;
export const ITEM_REPEAT_BALL = 9;
export const ITEM_TIMER_BALL = 10;
export const ITEM_LUXURY_BALL = 11;
export const ITEM_PREMIER_BALL = 12;
export const FEMALE = 1;

export const BALL_POKE = 0;
export const BALL_GREAT = 1;
export const BALL_SAFARI = 2;
export const BALL_ULTRA = 3;
export const BALL_MASTER = 4;
export const BALL_NET = 5;
export const BALL_DIVE = 6;
export const BALL_NEST = 7;
export const BALL_REPEAT = 8;
export const BALL_TIMER = 9;
export const BALL_LUXURY = 10;
export const BALL_PREMIER = 11;
export const POKEBALL_COUNT = 12;

export const SE_BALL = 23;
export const SE_BALL_OPEN = 15;
export const SE_SHINY = 95;
export const SE_BALL_BOUNCE_1 = 49;
export const SE_BALL_BOUNCE_2 = 50;
export const SE_BALL_BOUNCE_3 = 51;
export const SE_BALL_BOUNCE_4 = 52;
export const SE_BALL_TRADE = 53;
export const SE_BALL_THROW = 54;
export const SE_BALL_CLICK = 247;
export const MUS_CAUGHT_INTRO = 319;
export const SPRITE_TILE_START_NONE = 0xffff;
export const MAX_SPRITES = 64;
export const SHINY_ODDS = 8;
export const ANIM_SPRITES_START = 10000;
export const ANIM_TAG_ROCKS = ANIM_SPRITES_START + 58;
export const ANIM_TAG_GOLD_STARS = ANIM_SPRITES_START + 233;
export const ANIM_TAG_SAFARI_BAIT = ANIM_SPRITES_START + 269;
export const GFX_TAG_POKE_BALL = 55000;
export const TAG_HEALTHBOX_PALS_1 = 55049;
export const TAG_HEALTHBOX_PALS_2 = 55050;
export const TAG_HEALTHBOX_PAL = 55039;
export const TAG_HEALTHBAR_PAL = 55044;
export const B_SIDE_PLAYER = 0;
export const B_SIDE_OPPONENT = 1;
export const B_POSITION_PLAYER_LEFT = 0;
export const B_POSITION_OPPONENT_LEFT = 1;
export const BATTLER_COORD_X = 0;
export const BATTLER_COORD_Y = 1;
export const SOUND_PAN_ATTACKER = -64;
export const SOUND_PAN_TARGET = 63;
export const ARG_RET_ID = 7;
export const MULTISTRING_CHOOSER = 5;
export const NUM_SAFARI_REACTIONS = 3;
export const MOVE_FIRE_SPIN = 83;
export const MOVE_CLAMP = 128;
export const MOVE_WHIRLPOOL = 250;
export const MOVE_SAND_TOMB = 328;
export const BATTLE_TYPE_OLD_MAN_TUTORIAL = 1 << 9;
export const TRAP_ANIM_BIND = 0;
export const TRAP_ANIM_FIRE_SPIN = 1;
export const TRAP_ANIM_WHIRLPOOL = 2;
export const TRAP_ANIM_CLAMP = 3;
export const TRAP_ANIM_SAND_TOMB = 4;
export const BALL_NO_SHAKES = 0;
export const BALL_3_SHAKES_SUCCESS = 4;
export const BALL_TRAINER_BLOCK = 5;
export const BALL_GHOST_DODGE = 6;
export const ST_OAM_OBJ_NORMAL = 0;
export const ST_OAM_OBJ_BLEND = 1;
export const ST_OAM_OBJ_WINDOW = 2;
export const REG_OFFSET_DISPCNT = 0x00;
export const REG_OFFSET_WIN0H = 0x40;
export const REG_OFFSET_WIN0V = 0x44;
export const REG_OFFSET_WININ = 0x48;
export const REG_OFFSET_WINOUT = 0x4a;
export const REG_OFFSET_BLDCNT = 0x50;
export const REG_OFFSET_BLDALPHA = 0x52;
export const DISPCNT_OBJWIN_ON = 0x8000;
export const WININ_WIN0_BG_ALL = 0x0f;
export const WININ_WIN0_OBJ = 1 << 4;
export const WININ_WIN0_CLR = 1 << 5;
export const WININ_WIN1_BG_ALL = 0x0f00;
export const WININ_WIN1_OBJ = 1 << 12;
export const WININ_WIN1_CLR = 1 << 13;
export const WINOUT_WIN01_BG0 = 1 << 0;
export const WINOUT_WIN01_BG2 = 1 << 2;
export const WINOUT_WIN01_BG3 = 1 << 3;
export const WINOUT_WIN01_BG_ALL = 0x0f;
export const WINOUT_WIN01_OBJ = 1 << 4;
export const WINOUT_WIN01_CLR = 1 << 5;
export const WINOUT_WINOBJ_BG_ALL = 0x0f00;
export const WINOUT_WINOBJ_OBJ = 1 << 12;
export const WINOUT_WINOBJ_CLR = 1 << 13;
export const BLDCNT_TGT1_BG1 = 1 << 1;
export const BLDCNT_TGT1_BG2 = 1 << 2;
export const BLDCNT_EFFECT_BLEND = 1 << 6;
export const BLDCNT_TGT2_ALL = 0x3f00;
export const BG_ANIM_SCREEN_SIZE = 0;
export const BG_ANIM_AREA_OVERFLOW_MODE = 1;
export const BG_ANIM_CHAR_BASE_BLOCK = 3;
export const BG_ANIM_PRIORITY = 4;
export const TILE_SIZE_4BPP = 32;
export const PLTT_SIZE_4BPP = 32;
export const DMA3_32BIT = 1;

export const BLDALPHA_BLEND = (
  target1: number,
  target2: number
): number => (target2 << 8) | target1;

export interface CompressedSpriteSheet {
  data: string;
  size: number;
  tag: number;
}

export interface CompressedSpritePalette {
  data: string;
  tag: number;
}

export interface BallParticleTask {
  id: number;
  func: string;
  priority: number;
  data: number[];
  isActive?: boolean;
}

export type BallParticleSpriteCallbackName =
  | 'PokeBallOpenParticleAnimation_Step1'
  | 'PokeBallOpenParticleAnimation_Step2'
  | 'FanOutBallOpenParticles_Step1'
  | 'RepeatBallOpenParticleAnimation_Step1'
  | 'PremierBallOpenParticleAnimation_Step1'
  | 'SpriteCB_PlayerThrowInit'
  | 'SpriteCB_ShinySparkles_1'
  | 'SpriteCB_ShinySparkles_2'
  | 'SpriteCB_SafariBaitOrRock_WaitPlayerThrow'
  | 'SpriteCB_SafariBaitOrRock_ArcFlight'
  | 'SpriteCB_SafariBaitOrRock_Finish'
  | 'SpriteCallbackDummy'
  | 'SpriteCB_ThrowBall_Init'
  | 'SpriteCB_ThrowBall_ArcFlight'
  | 'TrainerBallBlock'
  | 'TrainerBallBlock2'
  | 'GhostBallDodge'
  | 'GhostBallDodge2'
  | 'SpriteCB_ThrowBall_TenFrameDelay'
  | 'SpriteCB_ThrowBall_ShrinkMon'
  | 'SpriteCB_ThrowBall_InitialFall'
  | 'SpriteCB_ThrowBall_Bounce'
  | 'SpriteCB_ThrowBall_DelayThenBreakOut'
  | 'SpriteCB_ThrowBall_InitShake'
  | 'SpriteCB_ThrowBall_DoShake'
  | 'SpriteCB_ThrowBall_BeginBreakOut'
  | 'SpriteCB_ThrowBall_RunBreakOut'
  | 'SpriteCB_ThrowBall_InitClick'
  | 'SpriteCB_ThrowBall_DoClick'
  | 'SpriteCB_ThrowBall_FinishClick'
  | 'BattleAnimObj_SignalEnd'
  | 'SpriteCB_BallCaptureSuccessStar';

export interface BallParticleSprite {
  id: number;
  x: number;
  y: number;
  x2: number;
  y2: number;
  subpriority: number;
  animNum: number;
  animCmdIndex: number;
  animEnded: boolean;
  animPaused: boolean;
  affineAnimNum: number;
  affineAnimPaused: boolean;
  affineAnimEnded: boolean;
  template: string;
  data: number[];
  oam: {
    priority: number;
    tileNum: number;
    paletteNum: number;
    matrixNum: number;
    affineParam: number;
    objMode: number;
  };
  invisible: boolean;
  callback: BallParticleSpriteCallbackName | null;
  destroyed: boolean;
  freedResources: boolean;
  oamMatrixFreed: boolean;
}

export interface BattleAnimSpecialPokemon {
  otId: number;
  personality: number;
}

export interface BattleAnimSpecialRuntime {
  inBattle: boolean;
  numBallParticles: number;
  paletteFadeActive: boolean;
  battleAnimArgs: number[];
  battleAnimAttacker: number;
  battleAnimTarget: number;
  effectBattler: number;
  animationDataAnimArg: number;
  battleTypeFlags: number;
  playerGender: number;
  ballThrowCaseId: number;
  lastUsedItem: number;
  wildMonInvisible: boolean;
  doingBattleAnim: boolean;
  ballSubpx: number;
  monShrinkDuration: number;
  monShrinkDelta: number;
  monShrinkDistance: number;
  battleCommunication: number[];
  battlerPartyIndexes: Record<number, number>;
  playerParty: Array<{ pokeball: number }>;
  enemyParty: Array<{ pokeball: number }>;
  battlerSpriteIds: Record<number, number>;
  battlerSides: Record<number, number>;
  battlersAtPositions: Record<number, number>;
  battlerBgPriorityRanks: Record<number, number>;
  battlerSpriteVisible: Record<number, boolean>;
  battlerCoords: Record<number, Record<number, number>>;
  healthboxSpriteIds: Record<number, number>;
  healthBoxesData: Record<number, { triedShinyMonAnim: boolean; finishedShinyMonAnim: boolean }>;
  nextSpritePaletteId: number;
  allocatedSpritePalettes: Array<{ tag: number; paletteId: number }>;
  loadedPalettes: Array<{ src: string; offset: number; size: number }>;
  loadedCompressedPalettes: Array<{ src: string; offset: number; size: number }>;
  loadedBgTilemaps: Array<{ bgId: number; src: string }>;
  loadedBgGfx: Array<{ bgId: number; src: string; tilesOffset: number }>;
  resetBattleAnimBgs: number[];
  animBgAttributes: Array<{ bgId: number; attributeId: number; value: number }>;
  battleAnimBg1Data: { bgId: number; paletteId: number; tilesOffset: number };
  battle_WIN0H: number;
  battle_WIN0V: number;
  battle_BG1_X: number;
  battle_BG1_Y: number;
  isContest: boolean;
  spritePaletteTagIndexes: Record<number, number>;
  loadedTileTags: Set<number>;
  loadedPaletteTags: Set<number>;
  tasks: BallParticleTask[];
  sprites: Array<BallParticleSprite | undefined>;
  sounds: number[];
  destroyedTasks: number[];
  destroyedSprites: number[];
  destroyedTargetSprites: number[];
  freedResourceSprites: number[];
  freedTileTags: number[];
  freedPaletteTags: number[];
  loadedBallGfx: Set<number>;
  freedBallGfx: number[];
  indexedSpritePaletteTags: number[];
  blendedPalettes: Array<{ offset: number; count: number; coefficient: number; color: number }>;
  paletteFades: Array<{ selectedPalettes: number; delay: number; startY: number; targetY: number; color: number }>;
  gpuRegs: Record<number, number>;
  dmaFills: Array<{ value: number; dest: number; size: number; mode: number }>;
  clearedBehindSubstituteBattlers: number[];
  healthboxPriorityUpdates: number[];
  allMusicStopped: number;
  loadedBattleMonGfx: Array<{ battler: number; mode: number; spriteId: number }>;
  destroyedVisualTasks: number[];
  battlerData: Record<number, { behindSubstitute: number }>;
  pannedSounds: Array<{ id: number; pan: number }>;
  freedOamMatrices: number[];
  preparedRotScaleSprites: Array<{ spriteId: number; objMode: number }>;
  spriteRotScales: Array<{ spriteId: number; xScale: number; yScale: number; rotation: number }>;
  resetRotScaleSprites: number[];
  battlerSpriteYScaleOffsets: number[];
  spriteAffineAnims: Array<{ spriteId: number; animNum: number; kind: 'start' | 'change' }>;
  animatedSprites: number[];
  calls: Array<{ fn: string; args: unknown[] }>;
}

export const createBattleAnimSpecialRuntime = (
  overrides: Partial<BattleAnimSpecialRuntime> = {}
): BattleAnimSpecialRuntime => ({
  inBattle: overrides.inBattle ?? true,
  numBallParticles: overrides.numBallParticles ?? 0,
  paletteFadeActive: overrides.paletteFadeActive ?? false,
  battleAnimArgs: overrides.battleAnimArgs ?? Array.from({ length: 8 }, () => 0),
  battleAnimAttacker: overrides.battleAnimAttacker ?? 0,
  battleAnimTarget: overrides.battleAnimTarget ?? 1,
  effectBattler: overrides.effectBattler ?? 1,
  animationDataAnimArg: overrides.animationDataAnimArg ?? 0,
  battleTypeFlags: overrides.battleTypeFlags ?? 0,
  playerGender: overrides.playerGender ?? 0,
  ballThrowCaseId: overrides.ballThrowCaseId ?? 0,
  lastUsedItem: overrides.lastUsedItem ?? ITEM_POKE_BALL,
  wildMonInvisible: overrides.wildMonInvisible ?? false,
  doingBattleAnim: overrides.doingBattleAnim ?? true,
  ballSubpx: overrides.ballSubpx ?? 0,
  monShrinkDuration: overrides.monShrinkDuration ?? 0,
  monShrinkDelta: overrides.monShrinkDelta ?? 0,
  monShrinkDistance: overrides.monShrinkDistance ?? 0,
  battleCommunication: overrides.battleCommunication ?? Array.from({ length: 8 }, () => 0),
  battlerPartyIndexes: overrides.battlerPartyIndexes ?? { 0: 0, 1: 0, 2: 1, 3: 1 },
  playerParty: overrides.playerParty ?? [{ pokeball: ITEM_POKE_BALL }, { pokeball: ITEM_GREAT_BALL }],
  enemyParty: overrides.enemyParty ?? [{ pokeball: ITEM_ULTRA_BALL }, { pokeball: ITEM_MASTER_BALL }],
  battlerSpriteIds: overrides.battlerSpriteIds ?? { 0: 0, 1: 1, 2: 2, 3: 3 },
  battlerSides: overrides.battlerSides ?? { 0: B_SIDE_PLAYER, 1: B_SIDE_OPPONENT, 2: B_SIDE_PLAYER, 3: B_SIDE_OPPONENT },
  battlersAtPositions: overrides.battlersAtPositions ?? {
    [B_POSITION_PLAYER_LEFT]: 0,
    [B_POSITION_OPPONENT_LEFT]: 1
  },
  battlerBgPriorityRanks: overrides.battlerBgPriorityRanks ?? {
    0: B_POSITION_PLAYER_LEFT,
    1: B_POSITION_OPPONENT_LEFT,
    2: B_POSITION_PLAYER_LEFT,
    3: B_POSITION_OPPONENT_LEFT
  },
  battlerSpriteVisible: overrides.battlerSpriteVisible ?? { 0: true, 1: true, 2: true, 3: true },
  battlerCoords: overrides.battlerCoords ?? {
    0: { [BATTLER_COORD_X]: 40, [BATTLER_COORD_Y]: 80 },
    1: { [BATTLER_COORD_X]: 200, [BATTLER_COORD_Y]: 80 },
    2: { [BATTLER_COORD_X]: 72, [BATTLER_COORD_Y]: 96 },
    3: { [BATTLER_COORD_X]: 176, [BATTLER_COORD_Y]: 96 }
  },
  healthBoxesData: overrides.healthBoxesData ?? {},
  healthboxSpriteIds: overrides.healthboxSpriteIds ?? { 0: 0, 1: 1, 2: 2, 3: 3 },
  nextSpritePaletteId: overrides.nextSpritePaletteId ?? 0,
  allocatedSpritePalettes: overrides.allocatedSpritePalettes ?? [],
  loadedPalettes: overrides.loadedPalettes ?? [],
  loadedCompressedPalettes: overrides.loadedCompressedPalettes ?? [],
  loadedBgTilemaps: overrides.loadedBgTilemaps ?? [],
  loadedBgGfx: overrides.loadedBgGfx ?? [],
  resetBattleAnimBgs: overrides.resetBattleAnimBgs ?? [],
  animBgAttributes: overrides.animBgAttributes ?? [],
  battleAnimBg1Data: overrides.battleAnimBg1Data ?? { bgId: 1, paletteId: 1, tilesOffset: 0x200 },
  battle_WIN0H: overrides.battle_WIN0H ?? 0,
  battle_WIN0V: overrides.battle_WIN0V ?? 0,
  battle_BG1_X: overrides.battle_BG1_X ?? 0,
  battle_BG1_Y: overrides.battle_BG1_Y ?? 0,
  isContest: overrides.isContest ?? false,
  spritePaletteTagIndexes: overrides.spritePaletteTagIndexes ?? {},
  loadedTileTags: overrides.loadedTileTags ?? new Set<number>(),
  loadedPaletteTags: overrides.loadedPaletteTags ?? new Set<number>(),
  tasks: overrides.tasks ?? [],
  sprites: overrides.sprites ?? [],
  sounds: overrides.sounds ?? [],
  destroyedTasks: overrides.destroyedTasks ?? [],
  destroyedSprites: overrides.destroyedSprites ?? [],
  destroyedTargetSprites: overrides.destroyedTargetSprites ?? [],
  freedResourceSprites: overrides.freedResourceSprites ?? [],
  freedTileTags: overrides.freedTileTags ?? [],
  freedPaletteTags: overrides.freedPaletteTags ?? [],
  loadedBallGfx: overrides.loadedBallGfx ?? new Set<number>(),
  freedBallGfx: overrides.freedBallGfx ?? [],
  indexedSpritePaletteTags: overrides.indexedSpritePaletteTags ?? [],
  blendedPalettes: overrides.blendedPalettes ?? [],
  paletteFades: overrides.paletteFades ?? [],
  gpuRegs: overrides.gpuRegs ?? {},
  dmaFills: overrides.dmaFills ?? [],
  clearedBehindSubstituteBattlers: overrides.clearedBehindSubstituteBattlers ?? [],
  healthboxPriorityUpdates: overrides.healthboxPriorityUpdates ?? [],
  allMusicStopped: overrides.allMusicStopped ?? 0,
  loadedBattleMonGfx: overrides.loadedBattleMonGfx ?? [],
  destroyedVisualTasks: overrides.destroyedVisualTasks ?? [],
  battlerData: overrides.battlerData ?? {},
  pannedSounds: overrides.pannedSounds ?? [],
  freedOamMatrices: overrides.freedOamMatrices ?? [],
  preparedRotScaleSprites: overrides.preparedRotScaleSprites ?? [],
  spriteRotScales: overrides.spriteRotScales ?? [],
  resetRotScaleSprites: overrides.resetRotScaleSprites ?? [],
  battlerSpriteYScaleOffsets: overrides.battlerSpriteYScaleOffsets ?? [],
  spriteAffineAnims: overrides.spriteAffineAnims ?? [],
  animatedSprites: overrides.animatedSprites ?? [],
  calls: overrides.calls ?? []
});

export const createBallParticleSprite = (
  id: number,
  x = 0,
  y = 0,
  subpriority = 0
): BallParticleSprite => ({
  id,
  x,
  y,
  x2: 0,
  y2: 0,
  subpriority,
  animNum: 0,
  animCmdIndex: 0,
  animEnded: false,
  animPaused: false,
  affineAnimNum: 0,
  affineAnimPaused: false,
  affineAnimEnded: false,
  template: '',
  data: Array.from({ length: 8 }, () => 0),
  oam: {
    priority: 0,
    tileNum: 0,
    paletteNum: 0,
    matrixNum: 0,
    affineParam: 0,
    objMode: ST_OAM_OBJ_NORMAL
  },
  invisible: false,
  callback: null,
  destroyed: false,
  freedResources: false,
  oamMatrixFreed: false
});

export const sCaptureStar = [
  { xOffset: 10, yOffset: 2, amplitude: -3 },
  { xOffset: 15, yOffset: 0, amplitude: -4 },
  { xOffset: -10, yOffset: 2, amplitude: -4 }
] as const;

const ballParticleTags = [
  TAG_PARTICLES_POKEBALL,
  TAG_PARTICLES_GREATBALL,
  TAG_PARTICLES_SAFARIBALL,
  TAG_PARTICLES_ULTRABALL,
  TAG_PARTICLES_MASTERBALL,
  TAG_PARTICLES_NETBALL,
  TAG_PARTICLES_DIVEBALL,
  TAG_PARTICLES_NESTBALL,
  TAG_PARTICLES_REPEATBALL,
  TAG_PARTICLES_TIMERBALL,
  TAG_PARTICLES_LUXURYBALL,
  TAG_PARTICLES_PREMIERBALL
] as const;

const ballNames = ['Poke', 'Great', 'Safari', 'Ultra', 'Master', 'Net', 'Dive', 'Nest', 'Repeat', 'Timer', 'Luxury', 'Premier'] as const;

export const gBallSpriteSheets: readonly CompressedSpriteSheet[] = ballNames.map((name, index) => ({
  data: `gBallGfx_${name}`,
  size: 384,
  tag: GFX_TAG_POKE_BALL + index
}));

export const gBallSpritePalettes: readonly CompressedSpritePalette[] = ballNames.map((name, index) => ({
  data: `gBallPal_${name}`,
  tag: GFX_TAG_POKE_BALL + index
}));

export const gBallSpriteTemplates = ballNames.map((_name, index) => ({
  tileTag: GFX_TAG_POKE_BALL + index,
  paletteTag: GFX_TAG_POKE_BALL + index,
  callback: 'SpriteCallbackDummy'
}));

export const gBallParticleSpritesheets: readonly CompressedSpriteSheet[] = ballParticleTags.map((tag) => ({
  data: 'gBattleAnimSpriteGfx_Particles',
  size: 0x100,
  tag
}));

export const gBallParticlePalettes: readonly CompressedSpritePalette[] = ballParticleTags.map((tag) => ({
  data: 'gBattleAnimSpritePal_CircleImpact',
  tag
}));

export const gSafariBaitSpriteTemplate = {
  tileTag: ANIM_TAG_SAFARI_BAIT,
  paletteTag: ANIM_TAG_SAFARI_BAIT,
  oam: 'gOamData_AffineOff_ObjNormal_16x16',
  anims: 'gDummySpriteAnimTable',
  images: null,
  affineAnims: 'gDummySpriteAffineAnimTable',
  callback: 'SpriteCB_SafariBaitOrRock_Init'
} as const;

export const sSpriteAnim_SafariRock_0 = [
  { frame: 64, duration: 1 },
  'ANIMCMD_END'
] as const;

export const sSpriteAnimTable_SafariRock = [sSpriteAnim_SafariRock_0] as const;

export const gSafariRockTemplate = {
  tileTag: ANIM_TAG_ROCKS,
  paletteTag: ANIM_TAG_ROCKS,
  oam: 'gOamData_AffineOff_ObjNormal_32x32',
  anims: sSpriteAnimTable_SafariRock,
  images: null,
  affineAnims: 'gDummySpriteAffineAnimTable',
  callback: 'SpriteCB_SafariBaitOrRock_Init'
} as const;

export const sBallParticleAnimNums = [
  0,
  0,
  0,
  5,
  1,
  2,
  2,
  3,
  5,
  5,
  4,
  4
] as const;

export const sBallParticleAnimationFuncs = [
  'PokeBallOpenParticleAnimation',
  'GreatBallOpenParticleAnimation',
  'SafariBallOpenParticleAnimation',
  'UltraBallOpenParticleAnimation',
  'MasterBallOpenParticleAnimation',
  'SafariBallOpenParticleAnimation',
  'DiveBallOpenParticleAnimation',
  'UltraBallOpenParticleAnimation',
  'RepeatBallOpenParticleAnimation',
  'TimerBallOpenParticleAnimation',
  'GreatBallOpenParticleAnimation',
  'PremierBallOpenParticleAnimation'
] as const;

export const sBallOpenFadeColors = [
  RGB(31, 22, 30),
  RGB(16, 23, 30),
  RGB(23, 30, 20),
  RGB(31, 31, 15),
  RGB(23, 20, 28),
  RGB(21, 31, 25),
  RGB(12, 25, 30),
  RGB(30, 27, 10),
  RGB(31, 24, 16),
  RGB(29, 30, 30),
  RGB(31, 17, 10),
  RGB(31, 9, 10),
  RGB_BLACK,
  RGB(1, 16, 0),
  RGB(3, 0, 1),
  RGB(1, 8, 0),
  RGB(0, 8, 0),
  RGB(3, 8, 1),
  RGB(6, 8, 1),
  RGB(4, 0, 0)
] as const;

export const ItemIdToBallId = (ballItem: number): number => {
  switch (ballItem) {
    case ITEM_MASTER_BALL:
      return BALL_MASTER;
    case ITEM_ULTRA_BALL:
      return BALL_ULTRA;
    case ITEM_GREAT_BALL:
      return BALL_GREAT;
    case ITEM_SAFARI_BALL:
      return BALL_SAFARI;
    case ITEM_NET_BALL:
      return BALL_NET;
    case ITEM_DIVE_BALL:
      return BALL_DIVE;
    case ITEM_NEST_BALL:
      return BALL_NEST;
    case ITEM_REPEAT_BALL:
      return BALL_REPEAT;
    case ITEM_TIMER_BALL:
      return BALL_TIMER;
    case ITEM_LUXURY_BALL:
      return BALL_LUXURY;
    case ITEM_PREMIER_BALL:
      return BALL_PREMIER;
    case ITEM_POKE_BALL:
    default:
      return BALL_POKE;
  }
};

export const GetSpriteTileStartByTag = (
  runtime: BattleAnimSpecialRuntime,
  tag: number
): number => runtime.loadedTileTags.has(tag) ? 0 : SPRITE_TILE_START_NONE;

export const LoadBallGfx = (
  runtime: BattleAnimSpecialRuntime,
  ballId: number
): void => {
  if (GetSpriteTileStartByTag(runtime, gBallSpriteSheets[ballId].tag) === SPRITE_TILE_START_NONE) {
    runtime.calls.push({ fn: 'LoadCompressedSpriteSheetUsingHeap', args: [gBallSpriteSheets[ballId]] });
    runtime.calls.push({ fn: 'LoadCompressedSpritePaletteUsingHeap', args: [gBallSpritePalettes[ballId]] });
    runtime.loadedTileTags.add(gBallSpriteSheets[ballId].tag);
    runtime.loadedPaletteTags.add(gBallSpritePalettes[ballId].tag);
  }

  runtime.loadedBallGfx.add(ballId);
  switch (ballId) {
    case BALL_DIVE:
    case BALL_LUXURY:
    case BALL_PREMIER:
      break;
    default:
      runtime.calls.push({
        fn: 'LZDecompressVram',
        args: ['gOpenPokeballGfx', `OBJ_VRAM0 + 0x100 + ${GetSpriteTileStartByTag(runtime, gBallSpriteSheets[ballId].tag)} * 32`]
      });
      break;
  }
};

export const FreeBallGfx = (
  runtime: BattleAnimSpecialRuntime,
  ballId: number
): void => {
  runtime.loadedTileTags.delete(gBallSpriteSheets[ballId].tag);
  runtime.loadedPaletteTags.delete(gBallSpritePalettes[ballId].tag);
  runtime.loadedBallGfx.delete(ballId);
  runtime.freedBallGfx.push(ballId);
  runtime.freedTileTags.push(gBallSpriteSheets[ballId].tag);
  runtime.freedPaletteTags.push(gBallSpritePalettes[ballId].tag);
  runtime.calls.push({ fn: 'FreeSpriteTilesByTag', args: [gBallSpriteSheets[ballId].tag] });
  runtime.calls.push({ fn: 'FreeSpritePaletteByTag', args: [gBallSpritePalettes[ballId].tag] });
};

export const AnimTask_LoadBallGfx = (
  runtime: BattleAnimSpecialRuntime,
  taskId: number
): void => {
  const ballId = ItemIdToBallId(runtime.lastUsedItem);

  LoadBallGfx(runtime, ballId);
  destroyAnimVisualTask(runtime, taskId);
};

export const AnimTask_FreeBallGfx = (
  runtime: BattleAnimSpecialRuntime,
  taskId: number
): void => {
  const ballId = ItemIdToBallId(runtime.lastUsedItem);

  FreeBallGfx(runtime, ballId);
  destroyAnimVisualTask(runtime, taskId);
};

export const AnimTask_IsBallBlockedByTrainerOrDodged = (
  runtime: BattleAnimSpecialRuntime,
  taskId: number
): void => {
  switch (runtime.ballThrowCaseId) {
    case BALL_TRAINER_BLOCK:
      runtime.battleAnimArgs[ARG_RET_ID] = -1;
      break;
    case BALL_GHOST_DODGE:
      runtime.battleAnimArgs[ARG_RET_ID] = -2;
      break;
    default:
      runtime.battleAnimArgs[ARG_RET_ID] = 0;
      break;
  }

  destroyAnimVisualTask(runtime, taskId);
};

export const AnimTask_SwitchOutShrinkMon = (
  runtime: BattleAnimSpecialRuntime,
  taskId: number
): void => {
  const spriteId = runtime.battlerSpriteIds[runtime.battleAnimAttacker];
  const task = runtime.tasks[taskId];

  switch (task.data[0]) {
    case 0:
      prepareBattlerSpriteForRotScale(runtime, spriteId, ST_OAM_OBJ_NORMAL);
      task.data[10] = 0x100;
      task.data[0] += 1;
      break;
    case 1:
      task.data[10] += 0x30;
      setSpriteRotScale(runtime, spriteId, task.data[10], task.data[10], 0);
      setBattlerSpriteYOffsetFromYScale(runtime, spriteId);
      if (task.data[10] >= 0x2d0) {
        task.data[0] += 1;
      }
      break;
    case 2:
      resetSpriteRotScale(runtime, spriteId);
      runtime.sprites[spriteId]!.invisible = true;
      destroyAnimVisualTask(runtime, taskId);
      break;
  }
};

export const AnimTask_SwitchOutBallEffect = (
  runtime: BattleAnimSpecialRuntime,
  taskId: number
): void => {
  const spriteId = runtime.battlerSpriteIds[runtime.battleAnimAttacker];
  const partyIndex = runtime.battlerPartyIndexes[runtime.battleAnimAttacker] ?? 0;
  const ball = getBattlerSide(runtime, runtime.battleAnimAttacker) === B_SIDE_PLAYER
    ? runtime.playerParty[partyIndex]?.pokeball ?? ITEM_POKE_BALL
    : runtime.enemyParty[partyIndex]?.pokeball ?? ITEM_POKE_BALL;
  const ballId = ItemIdToBallId(ball);
  const task = runtime.tasks[taskId];

  switch (task.data[0]) {
    case 0: {
      const x = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, BATTLER_COORD_X);
      const y = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, BATTLER_COORD_Y);
      const priority = runtime.sprites[spriteId]!.oam.priority;
      const subpriority = runtime.sprites[spriteId]!.subpriority;
      task.data[10] = AnimateBallOpenParticles(runtime, x, y + 32, priority, subpriority, ballId);
      const selectedPalettes = GetBattlePalettesMask(runtime, true, false, false, false, false, false, false);
      task.data[11] = LaunchBallFadeMonTask(runtime, false, runtime.battleAnimAttacker, selectedPalettes, ballId);
      task.data[0] += 1;
      break;
    }
    case 1:
      if (!runtime.tasks[task.data[10]]?.isActive && !runtime.tasks[task.data[11]]?.isActive) {
        destroyAnimVisualTask(runtime, taskId);
      }
      break;
  }
};

export const AnimTask_ThrowBall = (
  runtime: BattleAnimSpecialRuntime,
  taskId: number
): void => {
  const ballId = ItemIdToBallId(runtime.lastUsedItem);
  const spriteId = createBallSprite(runtime, ballId, 32, 80, 29);
  const sprite = runtime.sprites[spriteId]!;

  sprite.data[0] = 34;
  sprite.data[1] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, BATTLER_COORD_X);
  sprite.data[2] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, BATTLER_COORD_Y) - 16;
  sprite.callback = 'SpriteCB_ThrowBall_Init';
  runtime.wildMonInvisible = runtime.sprites[runtime.battlerSpriteIds[runtime.battleAnimTarget]]?.invisible ?? false;
  runtime.tasks[taskId].data[0] = spriteId;
  runtime.tasks[taskId].func = 'AnimTask_ThrowBall_WaitAnimObjComplete';
};

export const AnimTask_ThrowBall_WaitAnimObjComplete = (
  runtime: BattleAnimSpecialRuntime,
  taskId: number
): void => {
  const spriteId = runtime.tasks[taskId].data[0];

  if (toU16(runtime.sprites[spriteId]?.data[0] ?? 0) === 0xffff) {
    destroyAnimVisualTask(runtime, taskId);
  }
};

export const AnimTask_ThrowBallSpecial = (
  runtime: BattleAnimSpecialRuntime,
  taskId: number
): void => {
  let x: number;
  let y: number;

  if (runtime.battleTypeFlags & BATTLE_TYPE_OLD_MAN_TUTORIAL) {
    x = 28;
    y = 11;
  } else {
    x = 23;
    y = 11;
    if (runtime.playerGender === FEMALE) {
      y = 13;
    }
  }

  const ballId = ItemIdToBallId(runtime.lastUsedItem);
  const subpriority = getBattlerSpriteSubpriority(runtime, getBattlerAtPosition(runtime, B_POSITION_OPPONENT_LEFT)) + 1;
  const spriteId = createBallSprite(runtime, ballId, x | 32, y | 80, subpriority);
  const sprite = runtime.sprites[spriteId]!;

  sprite.data[0] = 34;
  sprite.data[1] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, BATTLER_COORD_X);
  sprite.data[2] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, BATTLER_COORD_Y) - 16;
  sprite.callback = 'SpriteCallbackDummy';
  runtime.sprites[runtime.battlerSpriteIds[getBattlerAtPosition(runtime, B_POSITION_PLAYER_LEFT)]]!.callback = 'SpriteCB_PlayerThrowInit';
  runtime.tasks[taskId].data[0] = spriteId;
  runtime.tasks[taskId].func = 'AnimTask_ThrowBallSpecial_PlaySfx';
};

export const AnimTask_ThrowBallSpecial_PlaySfx = (
  runtime: BattleAnimSpecialRuntime,
  taskId: number
): void => {
  const playerBattler = getBattlerAtPosition(runtime, B_POSITION_PLAYER_LEFT);
  const playerSprite = runtime.sprites[runtime.battlerSpriteIds[playerBattler]]!;

  if (playerSprite.animCmdIndex === 1) {
    playSE12WithPanning(runtime, SE_BALL_THROW, 0);
    runtime.sprites[runtime.tasks[taskId].data[0]]!.callback = 'SpriteCB_ThrowBall_Init';
    createTaskWithFunc(runtime, 'AnimTask_ThrowBallSpecial_ResetPlayerSprite', 10);
    runtime.tasks[taskId].func = 'AnimTask_ThrowBall_WaitAnimObjComplete';
  }
};

export const AnimTask_ThrowBallSpecial_ResetPlayerSprite = (
  runtime: BattleAnimSpecialRuntime,
  taskId: number
): void => {
  const playerBattler = getBattlerAtPosition(runtime, B_POSITION_PLAYER_LEFT);
  const playerSprite = runtime.sprites[runtime.battlerSpriteIds[playerBattler]]!;

  if (playerSprite.animEnded) {
    startSpriteAnim(runtime, playerSprite, 0);
    destroyTask(runtime, taskId);
  }
};

export const LoadBallParticleGfx = (
  runtime: BattleAnimSpecialRuntime,
  ballId: number
): void => {
  if (GetSpriteTileStartByTag(runtime, gBallParticleSpritesheets[ballId].tag) === SPRITE_TILE_START_NONE) {
    runtime.calls.push({ fn: 'LoadCompressedSpriteSheetUsingHeap', args: [gBallParticleSpritesheets[ballId]] });
    runtime.calls.push({ fn: 'LoadCompressedSpritePaletteUsingHeap', args: [gBallParticlePalettes[ballId]] });
    runtime.loadedTileTags.add(gBallParticleSpritesheets[ballId].tag);
    runtime.loadedPaletteTags.add(gBallParticlePalettes[ballId].tag);
  }
};

export const AnimateBallOpenParticles = (
  runtime: BattleAnimSpecialRuntime,
  x: number,
  y: number,
  priority: number,
  subpriority: number,
  ballId: number
): number => {
  LoadBallParticleGfx(runtime, ballId);
  const taskId = runtime.tasks.length;
  runtime.tasks.push({
    id: taskId,
    func: sBallParticleAnimationFuncs[ballId],
    priority: 5,
    data: Array.from({ length: 16 }, () => 0),
    isActive: true
  });
  runtime.tasks[taskId].data[1] = x;
  runtime.tasks[taskId].data[2] = y;
  runtime.tasks[taskId].data[3] = priority;
  runtime.tasks[taskId].data[4] = subpriority;
  runtime.tasks[taskId].data[15] = ballId;
  runtime.sounds.push(SE_BALL_OPEN);
  runtime.calls.push({ fn: 'CreateTask', args: [sBallParticleAnimationFuncs[ballId], 5] });
  runtime.calls.push({ fn: 'PlaySE', args: [SE_BALL_OPEN] });
  return taskId;
};

export const IncrementBattleParticleCounter = (
  runtime: BattleAnimSpecialRuntime
): void => {
  if (runtime.inBattle) {
    runtime.numBallParticles += 1;
  }
};

const destroyTask = (
  runtime: BattleAnimSpecialRuntime,
  taskId: number
): void => {
  if (runtime.tasks[taskId]) {
    runtime.tasks[taskId].isActive = false;
  }
  runtime.destroyedTasks.push(taskId);
  runtime.calls.push({ fn: 'DestroyTask', args: [taskId] });
};

const createTaskWithFunc = (
  runtime: BattleAnimSpecialRuntime,
  func: string,
  priority: number
): number => {
  const taskId = runtime.tasks.length;
  runtime.tasks.push({
    id: taskId,
    func,
    priority,
    data: Array.from({ length: 16 }, () => 0),
    isActive: true
  });
  runtime.calls.push({ fn: 'CreateTask', args: [func, priority] });
  return taskId;
};

export const BlendPalette = (
  runtime: BattleAnimSpecialRuntime,
  offset: number,
  count: number,
  coefficient: number,
  color: number
): void => {
  runtime.blendedPalettes.push({ offset, count, coefficient, color });
  runtime.calls.push({ fn: 'BlendPalette', args: [offset, count, coefficient, color] });
};

export const BlendPalettes = (
  runtime: BattleAnimSpecialRuntime,
  selectedPalettes: number,
  coefficient: number,
  color: number
): void => {
  runtime.blendedPalettes.push({ offset: selectedPalettes >>> 0, count: 0, coefficient, color });
  runtime.calls.push({ fn: 'BlendPalettes', args: [selectedPalettes >>> 0, coefficient, color] });
};

export const BeginNormalPaletteFade = (
  runtime: BattleAnimSpecialRuntime,
  selectedPalettes: number,
  delay: number,
  startY: number,
  targetY: number,
  color: number
): void => {
  runtime.paletteFadeActive = true;
  runtime.paletteFades.push({ selectedPalettes: selectedPalettes >>> 0, delay, startY, targetY, color });
  runtime.calls.push({
    fn: 'BeginNormalPaletteFade',
    args: [selectedPalettes >>> 0, delay, startY, targetY, color]
  });
};

const combineTaskPaletteMask = (
  task: BallParticleTask
): number => ((task.data[10] & 0xffff) | ((task.data[11] & 0xffff) << 16)) >>> 0;

const destroyAnimVisualTask = (
  runtime: BattleAnimSpecialRuntime,
  taskId: number
): void => {
  if (runtime.tasks[taskId]) {
    runtime.tasks[taskId].isActive = false;
  }
  runtime.destroyedVisualTasks.push(taskId);
  runtime.calls.push({ fn: 'DestroyAnimVisualTask', args: [taskId] });
};

const div = (left: number, right: number): number => Math.trunc(left / right);
const toU16 = (value: number): number => value & 0xffff;
const toU8 = (value: number): number => value & 0xff;
const maybeNegate = (value: number, negative: boolean): number =>
  negative && value !== 0 ? -value : value;

const getBattlerSide = (
  runtime: BattleAnimSpecialRuntime,
  battler: number
): number => runtime.battlerSides[battler] ?? B_SIDE_PLAYER;

const getBattlerAtPosition = (
  runtime: BattleAnimSpecialRuntime,
  position: number
): number => runtime.battlersAtPositions[position] ?? 0;

const getBattlerSpriteBGPriorityRank = (
  runtime: BattleAnimSpecialRuntime,
  battler: number
): number => runtime.battlerBgPriorityRanks[battler] ?? B_POSITION_PLAYER_LEFT;

const getBattlerSpriteCoord = (
  runtime: BattleAnimSpecialRuntime,
  battler: number,
  coordType: number
): number => runtime.battlerCoords[battler]?.[coordType] ?? 0;

const getBattlerSpriteSubpriority = (
  runtime: BattleAnimSpecialRuntime,
  battler: number
): number => runtime.sprites[runtime.battlerSpriteIds[battler]]?.subpriority ?? 0;

const battlePartner = (
  battler: number
): number => battler ^ 2;

const isBattlerSpriteVisible = (
  runtime: BattleAnimSpecialRuntime,
  battler: number
): boolean => runtime.battlerSpriteVisible[battler] ?? false;

export const GetBattlePalettesMask = (
  runtime: BattleAnimSpecialRuntime,
  battleBackground: boolean,
  attacker: boolean,
  target: boolean,
  attackerPartner: boolean,
  targetPartner: boolean,
  anim1: boolean,
  anim2: boolean
): number => {
  let selectedPalettes = 0;

  if (battleBackground) {
    selectedPalettes = 0xe;
  }
  if (attacker) {
    selectedPalettes |= 1 << (runtime.battleAnimAttacker + 16);
  }
  if (target) {
    selectedPalettes |= 1 << (runtime.battleAnimTarget + 16);
  }
  if (attackerPartner && isBattlerSpriteVisible(runtime, battlePartner(runtime.battleAnimAttacker))) {
    selectedPalettes |= 1 << (battlePartner(runtime.battleAnimAttacker) + 16);
  }
  if (targetPartner && isBattlerSpriteVisible(runtime, battlePartner(runtime.battleAnimTarget))) {
    selectedPalettes |= 1 << (battlePartner(runtime.battleAnimTarget) + 16);
  }
  if (anim1) {
    selectedPalettes |= 1 << 4;
  }
  if (anim2) {
    selectedPalettes |= 1 << 5;
  }

  return selectedPalettes >>> 0;
};

const getHealthBoxData = (
  runtime: BattleAnimSpecialRuntime,
  battler: number
): { triedShinyMonAnim: boolean; finishedShinyMonAnim: boolean } => {
  runtime.healthBoxesData[battler] ??= {
    triedShinyMonAnim: false,
    finishedShinyMonAnim: false
  };
  return runtime.healthBoxesData[battler];
};

const setGpuReg = (
  runtime: BattleAnimSpecialRuntime,
  reg: number,
  value: number
): void => {
  runtime.gpuRegs[reg] = value;
  runtime.calls.push({ fn: 'SetGpuReg', args: [reg, value] });
};

const getGpuReg = (
  runtime: BattleAnimSpecialRuntime,
  reg: number
): number => runtime.gpuRegs[reg] ?? 0;

const setGpuRegBits = (
  runtime: BattleAnimSpecialRuntime,
  reg: number,
  value: number
): void => {
  runtime.gpuRegs[reg] = getGpuReg(runtime, reg) | value;
  runtime.calls.push({ fn: 'SetGpuRegBits', args: [reg, value] });
};

const setAnimBgAttribute = (
  runtime: BattleAnimSpecialRuntime,
  bgId: number,
  attributeId: number,
  value: number
): void => {
  runtime.animBgAttributes.push({ bgId, attributeId, value });
  runtime.calls.push({ fn: 'SetAnimBgAttribute', args: [bgId, attributeId, value] });
};

const resetBattleAnimBg = (
  runtime: BattleAnimSpecialRuntime,
  bgId: number
): void => {
  runtime.resetBattleAnimBgs.push(bgId);
  runtime.calls.push({ fn: 'ResetBattleAnimBg', args: [bgId] });
};

const loadCompressedPalette = (
  runtime: BattleAnimSpecialRuntime,
  src: string,
  offset: number,
  size: number
): void => {
  runtime.loadedCompressedPalettes.push({ src, offset, size });
  runtime.calls.push({ fn: 'LoadCompressedPalette', args: [src, offset, size] });
};

const loadBattleMonGfxAndAnimate = (
  runtime: BattleAnimSpecialRuntime,
  battler: number,
  mode: number,
  spriteId: number
): void => {
  runtime.loadedBattleMonGfx.push({ battler, mode, spriteId });
  runtime.calls.push({ fn: 'LoadBattleMonGfxAndAnimate', args: [battler, mode, spriteId] });
};

const requestDma3Fill = (
  runtime: BattleAnimSpecialRuntime,
  value: number,
  dest: number,
  size: number,
  mode: number
): void => {
  runtime.dmaFills.push({ value, dest, size, mode });
  runtime.calls.push({ fn: 'RequestDma3Fill', args: [value, dest, size, mode] });
};

const clearBehindSubstituteBit = (
  runtime: BattleAnimSpecialRuntime,
  battler: number
): void => {
  runtime.clearedBehindSubstituteBattlers.push(battler);
  runtime.calls.push({ fn: 'ClearBehindSubstituteBit', args: [battler] });
};

const playSE12WithPanning = (
  runtime: BattleAnimSpecialRuntime,
  id: number,
  pan: number
): void => {
  runtime.pannedSounds.push({ id, pan });
  runtime.calls.push({ fn: 'PlaySE12WithPanning', args: [id, pan] });
};

const playSE = (
  runtime: BattleAnimSpecialRuntime,
  id: number
): void => {
  runtime.sounds.push(id);
  runtime.calls.push({ fn: 'PlaySE', args: [id] });
};

const indexOfSpritePaletteTag = (
  runtime: BattleAnimSpecialRuntime,
  tag: number
): number => {
  runtime.indexedSpritePaletteTags.push(tag);
  runtime.calls.push({ fn: 'IndexOfSpritePaletteTag', args: [tag] });
  return runtime.spritePaletteTagIndexes[tag] ?? 0;
};

const allocSpritePalette = (
  runtime: BattleAnimSpecialRuntime,
  tag: number
): number => {
  const paletteId = runtime.nextSpritePaletteId;
  runtime.nextSpritePaletteId += 1;
  runtime.allocatedSpritePalettes.push({ tag, paletteId });
  runtime.calls.push({ fn: 'AllocSpritePalette', args: [tag] });
  return paletteId;
};

const loadPalette = (
  runtime: BattleAnimSpecialRuntime,
  src: string,
  offset: number,
  size: number
): void => {
  runtime.loadedPalettes.push({ src, offset, size });
  runtime.calls.push({ fn: 'LoadPalette', args: [src, offset, size] });
};

export const DoLoadHealthboxPalsForLevelUp = (
  runtime: BattleAnimSpecialRuntime,
  battler: number
): { paletteId1: number; paletteId2: number } => {
  const healthBoxSpriteId = runtime.healthboxSpriteIds[battler];
  const healthBoxSprite = runtime.sprites[healthBoxSpriteId]!;
  const spriteId1 = healthBoxSprite.oam.affineParam;
  const spriteId2 = healthBoxSprite.data[5];
  const sprite2 = runtime.sprites[spriteId2]!;
  const paletteId1 = allocSpritePalette(runtime, TAG_HEALTHBOX_PALS_1);
  const paletteId2 = allocSpritePalette(runtime, TAG_HEALTHBOX_PALS_2);
  const offset1 = OBJ_PLTT_ID(healthBoxSprite.oam.paletteNum);
  const offset2 = OBJ_PLTT_ID(sprite2.oam.paletteNum);

  loadPalette(runtime, `gPlttBufferUnfaded[${offset1}]`, OBJ_PLTT_ID(paletteId1), PLTT_SIZE_4BPP);
  loadPalette(runtime, `gPlttBufferUnfaded[${offset2}]`, OBJ_PLTT_ID(paletteId2), PLTT_SIZE_4BPP);
  healthBoxSprite.oam.paletteNum = paletteId1;
  runtime.sprites[spriteId1]!.oam.paletteNum = paletteId1;
  sprite2.oam.paletteNum = paletteId2;

  return { paletteId1, paletteId2 };
};

export const AnimTask_LoadHealthboxPalsForLevelUp = (
  runtime: BattleAnimSpecialRuntime,
  taskId: number
): void => {
  DoLoadHealthboxPalsForLevelUp(runtime, runtime.battleAnimAttacker);
  destroyAnimVisualTask(runtime, taskId);
};

export const DoFreeHealthboxPalsForLevelUp = (
  runtime: BattleAnimSpecialRuntime,
  battler: number
): void => {
  const healthBoxSpriteId = runtime.healthboxSpriteIds[battler];
  const healthBoxSprite = runtime.sprites[healthBoxSpriteId]!;
  const spriteId1 = healthBoxSprite.oam.affineParam;
  const spriteId2 = healthBoxSprite.data[5];

  runtime.freedPaletteTags.push(TAG_HEALTHBOX_PALS_1);
  runtime.calls.push({ fn: 'FreeSpritePaletteByTag', args: [TAG_HEALTHBOX_PALS_1] });
  runtime.freedPaletteTags.push(TAG_HEALTHBOX_PALS_2);
  runtime.calls.push({ fn: 'FreeSpritePaletteByTag', args: [TAG_HEALTHBOX_PALS_2] });

  const paletteId1 = indexOfSpritePaletteTag(runtime, TAG_HEALTHBOX_PAL);
  const paletteId2 = indexOfSpritePaletteTag(runtime, TAG_HEALTHBAR_PAL);

  healthBoxSprite.oam.paletteNum = paletteId1;
  runtime.sprites[spriteId1]!.oam.paletteNum = paletteId1;
  runtime.sprites[spriteId2]!.oam.paletteNum = paletteId2;
};

export const AnimTask_FreeHealthboxPalsForLevelUp = (
  runtime: BattleAnimSpecialRuntime,
  taskId: number
): void => {
  DoFreeHealthboxPalsForLevelUp(runtime, runtime.battleAnimAttacker);
  destroyAnimVisualTask(runtime, taskId);
};

export const AnimTask_FlashHealthboxOnLevelUp = (
  runtime: BattleAnimSpecialRuntime,
  taskId: number
): void => {
  const task = runtime.tasks[taskId]!;
  task.data[10] = runtime.battleAnimArgs[0];
  task.data[11] = runtime.battleAnimArgs[1];
  task.func = 'AnimTask_FlashHealthboxOnLevelUp_Step';
};

export const AnimTask_FlashHealthboxOnLevelUp_Step = (
  runtime: BattleAnimSpecialRuntime,
  taskId: number
): void => {
  const task = runtime.tasks[taskId]!;
  task.data[0] += 1;
  if (task.data[0]++ >= task.data[11]) {
    task.data[0] = 0;
    const paletteNum = indexOfSpritePaletteTag(runtime, TAG_HEALTHBOX_PALS_1);
    const colorOffset = task.data[10] === 0 ? 6 : 2;
    const paletteOffset = OBJ_PLTT_ID(paletteNum);

    switch (task.data[1]) {
      case 0:
        task.data[2] += 2;
        if (task.data[2] > 16) {
          task.data[2] = 16;
        }
        BlendPalette(runtime, paletteOffset + colorOffset, 1, task.data[2], RGB(20, 27, 31));
        if (task.data[2] === 16) {
          task.data[1] += 1;
        }
        break;
      case 1:
        task.data[2] -= 2;
        if (task.data[2] < 0) {
          task.data[2] = 0;
        }
        BlendPalette(runtime, paletteOffset + colorOffset, 1, task.data[2], RGB(20, 27, 31));
        if (task.data[2] === 0) {
          destroyAnimVisualTask(runtime, taskId);
        }
        break;
    }
  }
};

export const AnimTask_LevelUpHealthBox = (
  runtime: BattleAnimSpecialRuntime,
  taskId: number
): void => {
  const task = runtime.tasks[taskId]!;
  const battler = runtime.battleAnimAttacker;
  runtime.battle_WIN0H = 0;
  runtime.battle_WIN0V = 0;
  setGpuReg(
    runtime,
    REG_OFFSET_WININ,
    WININ_WIN0_BG_ALL | WININ_WIN0_OBJ | WININ_WIN0_CLR | WININ_WIN1_BG_ALL | WININ_WIN1_OBJ | WININ_WIN1_CLR
  );
  setGpuReg(
    runtime,
    REG_OFFSET_WINOUT,
    WINOUT_WIN01_BG0 | WINOUT_WIN01_BG2 | WINOUT_WIN01_BG3 | WINOUT_WIN01_OBJ | WINOUT_WIN01_CLR | WINOUT_WINOBJ_BG_ALL | WINOUT_WINOBJ_OBJ | WINOUT_WINOBJ_CLR
  );
  setGpuRegBits(runtime, REG_OFFSET_DISPCNT, DISPCNT_OBJWIN_ON);
  setGpuReg(runtime, REG_OFFSET_BLDCNT, BLDCNT_TGT1_BG1 | BLDCNT_EFFECT_BLEND | BLDCNT_TGT2_ALL);
  setGpuReg(runtime, REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(0, 16));
  setAnimBgAttribute(runtime, 1, BG_ANIM_PRIORITY, 0);
  setAnimBgAttribute(runtime, 1, BG_ANIM_SCREEN_SIZE, 0);
  setAnimBgAttribute(runtime, 1, BG_ANIM_AREA_OVERFLOW_MODE, 1);
  setAnimBgAttribute(runtime, 1, BG_ANIM_CHAR_BASE_BLOCK, 1);

  const healthBoxSpriteId = runtime.healthboxSpriteIds[battler];
  const healthBoxSprite = runtime.sprites[healthBoxSpriteId]!;
  const spriteId1 = healthBoxSprite.oam.affineParam;
  const spriteId2 = healthBoxSprite.data[5];
  const spriteId3 = createInvisibleSpriteWithCallback(runtime, 'SpriteCallbackDummy');
  const spriteId4 = createInvisibleSpriteWithCallback(runtime, 'SpriteCallbackDummy');

  healthBoxSprite.oam.priority = 1;
  runtime.sprites[spriteId1]!.oam.priority = 1;
  runtime.sprites[spriteId2]!.oam.priority = 1;
  copySpriteIntoSlot(runtime, spriteId3, healthBoxSprite);
  copySpriteIntoSlot(runtime, spriteId4, runtime.sprites[spriteId1]!);
  runtime.sprites[spriteId3]!.oam.objMode = ST_OAM_OBJ_WINDOW;
  runtime.sprites[spriteId4]!.oam.objMode = ST_OAM_OBJ_WINDOW;
  runtime.sprites[spriteId3]!.callback = 'SpriteCallbackDummy';
  runtime.sprites[spriteId4]!.callback = 'SpriteCallbackDummy';

  const animBgData = runtime.battleAnimBg1Data;
  runtime.calls.push({ fn: 'GetBattleAnimBg1Data', args: [animBgData] });
  runtime.loadedBgTilemaps.push({ bgId: animBgData.bgId, src: 'gUnusedLevelupAnimationTilemap' });
  runtime.calls.push({ fn: 'AnimLoadCompressedBgTilemap', args: [animBgData.bgId, 'gUnusedLevelupAnimationTilemap'] });
  runtime.loadedBgGfx.push({ bgId: animBgData.bgId, src: 'gUnusedLevelupAnimationGfx', tilesOffset: animBgData.tilesOffset });
  runtime.calls.push({ fn: 'AnimLoadCompressedBgGfx', args: [animBgData.bgId, 'gUnusedLevelupAnimationGfx', animBgData.tilesOffset] });
  loadCompressedPalette(runtime, 'gCureBubblesPal', BG_PLTT_ID(animBgData.paletteId), PLTT_SIZE_4BPP);

  runtime.battle_BG1_X = -runtime.sprites[spriteId3]!.x + 32;
  runtime.battle_BG1_Y = -runtime.sprites[spriteId3]!.y - 32;
  task.data[1] = 640;
  task.data[0] = spriteId3;
  task.data[2] = spriteId4;
  task.func = 'AnimTask_UnusedLevelUpHealthBox_Step';
};

export const AnimTask_UnusedLevelUpHealthBox_Step = (
  runtime: BattleAnimSpecialRuntime,
  taskId: number
): void => {
  const task = runtime.tasks[taskId]!;
  const battler = runtime.battleAnimAttacker;
  task.data[13] += task.data[1];
  runtime.battle_BG1_Y += (task.data[13] & 0xffff) >> 8;
  task.data[13] &= 0xff;

  switch (task.data[15]) {
    case 0:
      if (task.data[11]++ > 1) {
        task.data[11] = 0;
        task.data[12] += 1;
        setGpuReg(runtime, REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(task.data[12], 16 - task.data[12]));
        if (task.data[12] === 8) {
          task.data[15] += 1;
        }
      }
      break;
    case 1:
      task.data[10] += 1;
      if (task.data[10] === 30) {
        task.data[15] += 1;
      }
      break;
    case 2:
      if (task.data[11]++ > 1) {
        task.data[11] = 0;
        task.data[12] -= 1;
        setGpuReg(runtime, REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(task.data[12], 16 - task.data[12]));
        if (task.data[12] === 0) {
          resetBattleAnimBg(runtime, 0);
          runtime.battle_WIN0H = 0;
          runtime.battle_WIN0V = 0;
          setGpuReg(
            runtime,
            REG_OFFSET_WININ,
            WININ_WIN0_BG_ALL | WININ_WIN0_OBJ | WININ_WIN0_CLR | WININ_WIN1_BG_ALL | WININ_WIN1_OBJ | WININ_WIN1_CLR
          );
          setGpuReg(
            runtime,
            REG_OFFSET_WINOUT,
            WINOUT_WIN01_BG_ALL | WINOUT_WIN01_OBJ | WINOUT_WIN01_CLR | WINOUT_WINOBJ_BG_ALL | WINOUT_WINOBJ_OBJ | WINOUT_WINOBJ_CLR
          );
          if (!runtime.isContest) {
            setAnimBgAttribute(runtime, 1, BG_ANIM_CHAR_BASE_BLOCK, 0);
          }

          setGpuReg(runtime, REG_OFFSET_DISPCNT, getGpuReg(runtime, REG_OFFSET_DISPCNT) ^ DISPCNT_OBJWIN_ON);
          setGpuReg(runtime, REG_OFFSET_BLDCNT, 0);
          setGpuReg(runtime, REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(0, 0));
          destroySprite(runtime, runtime.sprites[task.data[0]]!);
          destroySprite(runtime, runtime.sprites[task.data[2]]!);
          setAnimBgAttribute(runtime, 1, BG_ANIM_AREA_OVERFLOW_MODE, 0);

          const healthBoxSpriteId = runtime.healthboxSpriteIds[battler];
          const healthBoxSprite = runtime.sprites[healthBoxSpriteId]!;
          const spriteId1 = healthBoxSprite.oam.affineParam;
          const spriteId2 = healthBoxSprite.data[5];
          healthBoxSprite.oam.priority = 1;
          runtime.sprites[spriteId1]!.oam.priority = 1;
          runtime.sprites[spriteId2]!.oam.priority = 1;
          destroyAnimVisualTask(runtime, taskId);
        }
      }
      break;
  }
};

const freeSpriteOamMatrix = (
  runtime: BattleAnimSpecialRuntime,
  sprite: BallParticleSprite
): void => {
  sprite.oamMatrixFreed = true;
  runtime.freedOamMatrices.push(sprite.id);
  runtime.calls.push({ fn: 'FreeSpriteOamMatrix', args: [sprite.id] });
};

const freeOamMatrix = (
  runtime: BattleAnimSpecialRuntime,
  matrixNum: number
): void => {
  runtime.freedOamMatrices.push(matrixNum);
  runtime.calls.push({ fn: 'FreeOamMatrix', args: [matrixNum] });
};

const updateOamPriorityInAllHealthboxes = (
  runtime: BattleAnimSpecialRuntime,
  priority: number
): void => {
  runtime.healthboxPriorityUpdates.push(priority);
  runtime.calls.push({ fn: 'UpdateOamPriorityInAllHealthboxes', args: [priority] });
};

const m4aMPlayAllStop = (
  runtime: BattleAnimSpecialRuntime
): void => {
  runtime.allMusicStopped += 1;
  runtime.calls.push({ fn: 'm4aMPlayAllStop', args: [] });
};

const createSprite = (
  runtime: BattleAnimSpecialRuntime,
  ballId: number,
  x: number,
  y: number,
  subpriority: number
): number => {
  let spriteId = runtime.sprites.findIndex((sprite) => sprite === undefined);
  if (spriteId === -1) {
    spriteId = runtime.sprites.length;
  }

  if (spriteId >= MAX_SPRITES) {
    return MAX_SPRITES;
  }

  runtime.sprites[spriteId] = createBallParticleSprite(spriteId, x, y, subpriority);
  runtime.sprites[spriteId]!.template = `sBallParticlesSpriteTemplates[${ballId}]`;
  runtime.calls.push({
    fn: 'CreateSprite',
    args: [`sBallParticlesSpriteTemplates[${ballId}]`, x, y, subpriority, spriteId]
  });
  return spriteId;
};

const createBallSprite = (
  runtime: BattleAnimSpecialRuntime,
  ballId: number,
  x: number,
  y: number,
  subpriority: number
): number => {
  let spriteId = runtime.sprites.findIndex((sprite) => sprite === undefined);
  if (spriteId === -1) {
    spriteId = runtime.sprites.length;
  }

  if (spriteId >= MAX_SPRITES) {
    return MAX_SPRITES;
  }

  runtime.sprites[spriteId] = createBallParticleSprite(spriteId, x, y, subpriority);
  runtime.sprites[spriteId]!.template = `gBallSpriteTemplates[${ballId}]`;
  runtime.calls.push({
    fn: 'CreateSprite',
    args: [gBallSpriteTemplates[ballId], x, y, subpriority, spriteId]
  });
  return spriteId;
};

const createTemplateSprite = (
  runtime: BattleAnimSpecialRuntime,
  template: string,
  x: number,
  y: number,
  subpriority: number
): number => {
  let spriteId = runtime.sprites.findIndex((sprite) => sprite === undefined);
  if (spriteId === -1) {
    spriteId = runtime.sprites.length;
  }

  if (spriteId >= MAX_SPRITES) {
    return MAX_SPRITES;
  }

  runtime.sprites[spriteId] = createBallParticleSprite(spriteId, x, y, subpriority);
  runtime.sprites[spriteId]!.template = template;
  runtime.calls.push({ fn: 'CreateSprite', args: [template, x, y, subpriority, spriteId] });
  return spriteId;
};

const createInvisibleSpriteWithCallback = (
  runtime: BattleAnimSpecialRuntime,
  callback: BallParticleSpriteCallbackName
): number => {
  let spriteId = runtime.sprites.findIndex((sprite) => sprite === undefined);
  if (spriteId === -1) {
    spriteId = runtime.sprites.length;
  }

  if (spriteId >= MAX_SPRITES) {
    return MAX_SPRITES;
  }

  runtime.sprites[spriteId] = createBallParticleSprite(spriteId);
  runtime.sprites[spriteId]!.invisible = true;
  runtime.sprites[spriteId]!.callback = callback;
  runtime.calls.push({ fn: 'CreateInvisibleSpriteWithCallback', args: [callback, spriteId] });
  return spriteId;
};

const copySpriteIntoSlot = (
  runtime: BattleAnimSpecialRuntime,
  destSpriteId: number,
  srcSprite: BallParticleSprite
): void => {
  runtime.sprites[destSpriteId] = {
    ...srcSprite,
    id: destSpriteId,
    data: [...srcSprite.data],
    oam: { ...srcSprite.oam }
  };
};

const startSpriteAnim = (
  runtime: BattleAnimSpecialRuntime,
  sprite: BallParticleSprite,
  animNum: number
): void => {
  sprite.animNum = animNum;
  runtime.calls.push({ fn: 'StartSpriteAnim', args: [sprite.id, animNum] });
};

const startSpriteAffineAnim = (
  runtime: BattleAnimSpecialRuntime,
  sprite: BallParticleSprite,
  animNum: number
): void => {
  sprite.affineAnimNum = animNum;
  runtime.spriteAffineAnims.push({ spriteId: sprite.id, animNum, kind: 'start' });
  runtime.calls.push({ fn: 'StartSpriteAffineAnim', args: [sprite.id, animNum] });
};

const changeSpriteAffineAnim = (
  runtime: BattleAnimSpecialRuntime,
  sprite: BallParticleSprite,
  animNum: number
): void => {
  sprite.affineAnimNum = animNum;
  runtime.spriteAffineAnims.push({ spriteId: sprite.id, animNum, kind: 'change' });
  runtime.calls.push({ fn: 'ChangeSpriteAffineAnim', args: [sprite.id, animNum] });
};

const animateSprite = (
  runtime: BattleAnimSpecialRuntime,
  sprite: BallParticleSprite
): void => {
  runtime.animatedSprites.push(sprite.id);
  runtime.calls.push({ fn: 'AnimateSprite', args: [sprite.id] });
};

const destroyAnimSprite = (
  runtime: BattleAnimSpecialRuntime,
  sprite: BallParticleSprite
): void => {
  sprite.destroyed = true;
  runtime.destroyedSprites.push(sprite.id);
  runtime.calls.push({ fn: 'DestroyAnimSprite', args: [sprite.id] });
};

const destroySprite = (
  runtime: BattleAnimSpecialRuntime,
  sprite: BallParticleSprite
): void => {
  sprite.destroyed = true;
  runtime.destroyedSprites.push(sprite.id);
  runtime.calls.push({ fn: 'DestroySprite', args: [sprite.id] });
};

const prepareBattlerSpriteForRotScale = (
  runtime: BattleAnimSpecialRuntime,
  spriteId: number,
  objMode: number
): void => {
  runtime.preparedRotScaleSprites.push({ spriteId, objMode });
  runtime.sprites[spriteId]!.affineAnimPaused = true;
  runtime.calls.push({ fn: 'PrepareBattlerSpriteForRotScale', args: [spriteId, objMode] });
};

const setSpriteRotScale = (
  runtime: BattleAnimSpecialRuntime,
  spriteId: number,
  xScale: number,
  yScale: number,
  rotation: number
): void => {
  runtime.spriteRotScales.push({ spriteId, xScale, yScale, rotation });
  runtime.calls.push({ fn: 'SetSpriteRotScale', args: [spriteId, xScale, yScale, rotation] });
};

const resetSpriteRotScale = (
  runtime: BattleAnimSpecialRuntime,
  spriteId: number
): void => {
  runtime.resetRotScaleSprites.push(spriteId);
  runtime.sprites[spriteId]!.affineAnimPaused = false;
  runtime.calls.push({ fn: 'ResetSpriteRotScale', args: [spriteId] });
};

const setBattlerSpriteYOffsetFromYScale = (
  runtime: BattleAnimSpecialRuntime,
  spriteId: number
): void => {
  runtime.battlerSpriteYScaleOffsets.push(spriteId);
  runtime.calls.push({ fn: 'SetBattlerSpriteYOffsetFromYScale', args: [spriteId] });
};

const setAnimSpriteInitialXOffset = (
  runtime: BattleAnimSpecialRuntime,
  sprite: BallParticleSprite,
  xOffset: number
): void => {
  const attackerX = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, BATTLER_COORD_X);
  const targetX = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, BATTLER_COORD_X);

  if (attackerX > targetX) {
    sprite.x -= xOffset;
  } else if (attackerX < targetX) {
    sprite.x += xOffset;
  } else if (getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER) {
    sprite.x -= xOffset;
  } else {
    sprite.x += xOffset;
  }
};

const initSpritePosToAnimAttacker = (
  runtime: BattleAnimSpecialRuntime,
  sprite: BallParticleSprite,
  respectMonPicOffsets: boolean
): void => {
  if (!respectMonPicOffsets) {
    sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, BATTLER_COORD_X);
    sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, BATTLER_COORD_Y);
  } else {
    sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, BATTLER_COORD_X);
    sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, BATTLER_COORD_Y);
  }

  setAnimSpriteInitialXOffset(runtime, sprite, runtime.battleAnimArgs[0]);
  sprite.y += runtime.battleAnimArgs[1];
};

const initAnimLinearTranslation = (
  sprite: BallParticleSprite
): void => {
  const x = sprite.data[2] - sprite.data[1];
  const y = sprite.data[4] - sprite.data[3];
  const movingLeft = x < 0;
  const movingUp = y < 0;
  let xDelta = Math.abs(x) << 8;
  let yDelta = Math.abs(y) << 8;

  xDelta = div(xDelta, sprite.data[0]);
  yDelta = div(yDelta, sprite.data[0]);

  if (movingLeft) {
    xDelta |= 1;
  } else {
    xDelta &= ~1;
  }

  if (movingUp) {
    yDelta |= 1;
  } else {
    yDelta &= ~1;
  }

  sprite.data[1] = xDelta;
  sprite.data[2] = yDelta;
  sprite.data[4] = 0;
  sprite.data[3] = 0;
};

const initAnimArcTranslation = (
  sprite: BallParticleSprite
): void => {
  sprite.data[1] = sprite.x;
  sprite.data[3] = sprite.y;
  initAnimLinearTranslation(sprite);
  sprite.data[6] = div(0x8000, sprite.data[0]);
  sprite.data[7] = 0;
};

const animTranslateLinear = (
  sprite: BallParticleSprite
): boolean => {
  if (!sprite.data[0]) {
    return true;
  }

  const v1 = toU16(sprite.data[1]);
  const v2 = toU16(sprite.data[2]);
  const x = toU16(toU16(sprite.data[3]) + v1);
  const y = toU16(toU16(sprite.data[4]) + v2);
  sprite.x2 = maybeNegate(x >> 8, (v1 & 1) !== 0);
  sprite.y2 = maybeNegate(y >> 8, (v2 & 1) !== 0);
  sprite.data[3] = x;
  sprite.data[4] = y;
  --sprite.data[0];
  return false;
};

const translateAnimHorizontalArc = (
  sprite: BallParticleSprite
): boolean => {
  if (animTranslateLinear(sprite)) {
    return true;
  }

  sprite.data[7] += sprite.data[6];
  sprite.y2 += sin(toU8(sprite.data[7] >> 8), sprite.data[5]);
  return false;
};

const translateAnimVerticalArc = (
  sprite: BallParticleSprite
): boolean => {
  if (animTranslateLinear(sprite)) {
    return true;
  }

  sprite.data[7] += sprite.data[6];
  sprite.x2 += sin(toU8(sprite.data[7] >> 8), sprite.data[5]);
  return false;
};

const createFanOutParticle = (
  runtime: BattleAnimSpecialRuntime,
  task: BallParticleTask,
  ballId: number,
  angle: number,
  data4: number,
  data5: number,
  data6: number
): number => {
  const spriteId = createSprite(runtime, ballId, task.data[1], task.data[2], task.data[4]);
  if (spriteId !== MAX_SPRITES) {
    const sprite = runtime.sprites[spriteId]!;
    IncrementBattleParticleCounter(runtime);
    startSpriteAnim(runtime, sprite, sBallParticleAnimNums[ballId]);
    sprite.callback = 'FanOutBallOpenParticles_Step1';
    sprite.oam.priority = task.data[3];
    sprite.data[0] = angle;
    sprite.data[4] = data4;
    sprite.data[5] = data5;
    sprite.data[6] = data6;
  }
  return spriteId;
};

const markLastSpriteForFreeResourcesOutsideBattle = (
  runtime: BattleAnimSpecialRuntime,
  spriteId: number
): void => {
  if (!runtime.inBattle && spriteId !== MAX_SPRITES) {
    runtime.sprites[spriteId]!.data[7] = 1;
  }
};

export const PokeBallOpenParticleAnimation = (
  runtime: BattleAnimSpecialRuntime,
  taskId: number
): void => {
  const task = runtime.tasks[taskId];
  const ballId = task.data[15];
  let spriteId = MAX_SPRITES;

  if (task.data[0] < 16) {
    spriteId = createSprite(runtime, ballId, task.data[1], task.data[2], task.data[4]);
    if (spriteId !== MAX_SPRITES) {
      const sprite = runtime.sprites[spriteId]!;
      IncrementBattleParticleCounter(runtime);
      startSpriteAnim(runtime, sprite, sBallParticleAnimNums[ballId]);
      sprite.callback = 'PokeBallOpenParticleAnimation_Step1';
      sprite.oam.priority = task.data[3];

      let var0 = task.data[0] & 0xff;
      if (var0 >= 8) {
        var0 -= 8;
      }

      sprite.data[0] = var0 * 32;
    }

    if (task.data[0] === 15) {
      markLastSpriteForFreeResourcesOutsideBattle(runtime, spriteId);
      destroyTask(runtime, taskId);
      return;
    }
  }

  task.data[0] += 1;
};

export const PokeBallOpenParticleAnimation_Step1 = (
  sprite: BallParticleSprite
): void => {
  if (sprite.data[1] === 0) {
    sprite.callback = 'PokeBallOpenParticleAnimation_Step2';
  } else {
    sprite.data[1] -= 1;
  }
};

export const PokeBallOpenParticleAnimation_Step2 = (
  runtime: BattleAnimSpecialRuntime,
  sprite: BallParticleSprite
): void => {
  sprite.x2 = sin(sprite.data[0], sprite.data[1]);
  sprite.y2 = cos(sprite.data[0], sprite.data[1]);
  sprite.data[1] += 2;
  if (sprite.data[1] === 50) {
    DestroyBallOpenAnimationParticle(runtime, sprite);
  }
};

export const TimerBallOpenParticleAnimation = (
  runtime: BattleAnimSpecialRuntime,
  taskId: number
): void => {
  const task = runtime.tasks[taskId];
  const ballId = task.data[15];
  let spriteId = MAX_SPRITES;

  for (let i = 0; i < 8; i += 1) {
    spriteId = createFanOutParticle(runtime, task, ballId, i * 32, 10, 2, 1);
  }

  markLastSpriteForFreeResourcesOutsideBattle(runtime, spriteId);
  destroyTask(runtime, taskId);
};

export const DiveBallOpenParticleAnimation = (
  runtime: BattleAnimSpecialRuntime,
  taskId: number
): void => {
  const task = runtime.tasks[taskId];
  const ballId = task.data[15];
  let spriteId = MAX_SPRITES;

  for (let i = 0; i < 8; i += 1) {
    spriteId = createFanOutParticle(runtime, task, ballId, i * 32, 10, 1, 2);
  }

  markLastSpriteForFreeResourcesOutsideBattle(runtime, spriteId);
  destroyTask(runtime, taskId);
};

export const SafariBallOpenParticleAnimation = (
  runtime: BattleAnimSpecialRuntime,
  taskId: number
): void => {
  const task = runtime.tasks[taskId];
  const ballId = task.data[15];
  let spriteId = MAX_SPRITES;

  for (let i = 0; i < 8; i += 1) {
    spriteId = createFanOutParticle(runtime, task, ballId, i * 32, 4, 1, 1);
  }

  markLastSpriteForFreeResourcesOutsideBattle(runtime, spriteId);
  destroyTask(runtime, taskId);
};

export const UltraBallOpenParticleAnimation = (
  runtime: BattleAnimSpecialRuntime,
  taskId: number
): void => {
  const task = runtime.tasks[taskId];
  const ballId = task.data[15];
  let spriteId = MAX_SPRITES;

  for (let i = 0; i < 10; i += 1) {
    spriteId = createFanOutParticle(runtime, task, ballId, i * 25, 5, 1, 1);
  }

  markLastSpriteForFreeResourcesOutsideBattle(runtime, spriteId);
  destroyTask(runtime, taskId);
};

export const GreatBallOpenParticleAnimation = (
  runtime: BattleAnimSpecialRuntime,
  taskId: number
): void => {
  const task = runtime.tasks[taskId];
  let spriteId = MAX_SPRITES;

  if (task.data[7]) {
    task.data[7] -= 1;
  } else {
    const ballId = task.data[15];

    for (let i = 0; i < 8; i += 1) {
      spriteId = createFanOutParticle(runtime, task, ballId, i * 32, 8, 2, 2);
    }

    task.data[7] = 8;
    task.data[0] += 1;
    if (task.data[0] === 2) {
      markLastSpriteForFreeResourcesOutsideBattle(runtime, spriteId);
      destroyTask(runtime, taskId);
    }
  }
};

export const FanOutBallOpenParticles_Step1 = (
  runtime: BattleAnimSpecialRuntime,
  sprite: BallParticleSprite
): void => {
  sprite.x2 = sin(sprite.data[0], sprite.data[1]);
  sprite.y2 = cos(sprite.data[0], sprite.data[2]);
  sprite.data[0] = (sprite.data[0] + sprite.data[4]) & 0xff;
  sprite.data[1] += sprite.data[5];
  sprite.data[2] += sprite.data[6];
  sprite.data[3] += 1;
  if (sprite.data[3] === 51) {
    DestroyBallOpenAnimationParticle(runtime, sprite);
  }
};

export const RepeatBallOpenParticleAnimation = (
  runtime: BattleAnimSpecialRuntime,
  taskId: number
): void => {
  const task = runtime.tasks[taskId];
  const ballId = task.data[15];
  let spriteId = MAX_SPRITES;

  for (let i = 0; i < POKEBALL_COUNT; i += 1) {
    spriteId = createSprite(runtime, ballId, task.data[1], task.data[2], task.data[4]);
    if (spriteId !== MAX_SPRITES) {
      const sprite = runtime.sprites[spriteId]!;
      IncrementBattleParticleCounter(runtime);
      startSpriteAnim(runtime, sprite, sBallParticleAnimNums[ballId]);
      sprite.callback = 'RepeatBallOpenParticleAnimation_Step1';
      sprite.oam.priority = task.data[3];
      sprite.data[0] = i * 21;
    }
  }

  markLastSpriteForFreeResourcesOutsideBattle(runtime, spriteId);
  destroyTask(runtime, taskId);
};

export const RepeatBallOpenParticleAnimation_Step1 = (
  runtime: BattleAnimSpecialRuntime,
  sprite: BallParticleSprite
): void => {
  sprite.x2 = sin(sprite.data[0], sprite.data[1]);
  sprite.y2 = cos(sprite.data[0], sin(sprite.data[0], sprite.data[2]));
  sprite.data[0] = (sprite.data[0] + 6) & 0xff;
  sprite.data[1] += 1;
  sprite.data[2] += 1;
  sprite.data[3] += 1;
  if (sprite.data[3] === 51) {
    DestroyBallOpenAnimationParticle(runtime, sprite);
  }
};

export const MasterBallOpenParticleAnimation = (
  runtime: BattleAnimSpecialRuntime,
  taskId: number
): void => {
  const task = runtime.tasks[taskId];
  const ballId = task.data[15];
  let spriteId = MAX_SPRITES;

  for (let j = 0; j < 2; j += 1) {
    for (let i = 0; i < 8; i += 1) {
      spriteId = createFanOutParticle(runtime, task, ballId, i * 32, 8, j === 0 ? 2 : 1, j === 0 ? 1 : 2);
    }
  }

  markLastSpriteForFreeResourcesOutsideBattle(runtime, spriteId);
  destroyTask(runtime, taskId);
};

export const PremierBallOpenParticleAnimation = (
  runtime: BattleAnimSpecialRuntime,
  taskId: number
): void => {
  const task = runtime.tasks[taskId];
  const ballId = task.data[15];
  let spriteId = MAX_SPRITES;

  for (let i = 0; i < 8; i += 1) {
    spriteId = createSprite(runtime, ballId, task.data[1], task.data[2], task.data[4]);
    if (spriteId !== MAX_SPRITES) {
      const sprite = runtime.sprites[spriteId]!;
      IncrementBattleParticleCounter(runtime);
      startSpriteAnim(runtime, sprite, sBallParticleAnimNums[ballId]);
      sprite.callback = 'PremierBallOpenParticleAnimation_Step1';
      sprite.oam.priority = task.data[3];
      sprite.data[0] = i * 32;
    }
  }

  markLastSpriteForFreeResourcesOutsideBattle(runtime, spriteId);
  destroyTask(runtime, taskId);
};

export const PremierBallOpenParticleAnimation_Step1 = (
  runtime: BattleAnimSpecialRuntime,
  sprite: BallParticleSprite
): void => {
  sprite.x2 = sin(sprite.data[0], sprite.data[1]);
  sprite.y2 = cos(sprite.data[0], sin(sprite.data[0] & 0x3f, sprite.data[2]));
  sprite.data[0] = (sprite.data[0] + 10) & 0xff;
  sprite.data[1] += 1;
  sprite.data[2] += 1;
  sprite.data[3] += 1;
  if (sprite.data[3] === 51) {
    DestroyBallOpenAnimationParticle(runtime, sprite);
  }
};

export const DestroyBallOpenAnimationParticle = (
  runtime: BattleAnimSpecialRuntime,
  sprite: BallParticleSprite
): void => {
  if (!runtime.inBattle) {
    if (sprite.data[7] === 1) {
      sprite.freedResources = true;
      runtime.freedResourceSprites.push(sprite.id);
      runtime.calls.push({ fn: 'DestroySpriteAndFreeResources', args: [sprite.id] });
    } else {
      runtime.calls.push({ fn: 'DestroySprite', args: [sprite.id] });
    }
    sprite.destroyed = true;
    runtime.destroyedSprites.push(sprite.id);
  } else {
    runtime.numBallParticles -= 1;
    if (runtime.numBallParticles === 0) {
      for (let j = 0; j < POKEBALL_COUNT; j += 1) {
        runtime.loadedTileTags.delete(gBallParticleSpritesheets[j].tag);
        runtime.loadedPaletteTags.delete(gBallParticlePalettes[j].tag);
        runtime.freedTileTags.push(gBallParticleSpritesheets[j].tag);
        runtime.freedPaletteTags.push(gBallParticlePalettes[j].tag);
        runtime.calls.push({ fn: 'FreeSpriteTilesByTag', args: [gBallParticleSpritesheets[j].tag] });
        runtime.calls.push({ fn: 'FreeSpritePaletteByTag', args: [gBallParticlePalettes[j].tag] });
      }
    }
    sprite.destroyed = true;
    runtime.destroyedSprites.push(sprite.id);
    runtime.calls.push({ fn: 'DestroySprite', args: [sprite.id] });
  }
};

export const SpriteCB_ThrowBall_Init = (
  runtime: BattleAnimSpecialRuntime,
  sprite: BallParticleSprite
): void => {
  void runtime;
  const destX = sprite.data[1];
  const destY = sprite.data[2];

  sprite.data[1] = sprite.x;
  sprite.data[2] = destX;
  sprite.data[3] = sprite.y;
  sprite.data[4] = destY;
  sprite.data[5] = -40;
  initAnimArcTranslation(sprite);
  sprite.callback = 'SpriteCB_ThrowBall_ArcFlight';
};

export const SpriteCB_ThrowBall_ArcFlight = (
  runtime: BattleAnimSpecialRuntime,
  sprite: BallParticleSprite
): void => {
  if (translateAnimHorizontalArc(sprite)) {
    if (runtime.ballThrowCaseId === BALL_TRAINER_BLOCK) {
      sprite.callback = 'TrainerBallBlock';
    } else if (runtime.ballThrowCaseId === BALL_GHOST_DODGE) {
      sprite.callback = 'GhostBallDodge';
    } else {
      startSpriteAnim(runtime, sprite, 1);
      sprite.x += sprite.x2;
      sprite.y += sprite.y2;
      sprite.x2 = 0;
      sprite.y2 = 0;

      for (let i = 0; i < 8; i += 1) {
        sprite.data[i] = 0;
      }

      sprite.data[5] = 0;
      sprite.callback = 'SpriteCB_ThrowBall_TenFrameDelay';

      const ballId = ItemIdToBallId(runtime.lastUsedItem);
      if (ballId >= 0 && ballId < POKEBALL_COUNT) {
        AnimateBallOpenParticles(runtime, sprite.x, sprite.y - 5, 1, 28, ballId);
        LaunchBallFadeMonTask(runtime, false, runtime.battleAnimTarget, 14, ballId);
      }
    }
  }
};

export const SpriteCB_ThrowBall_TenFrameDelay = (
  runtime: BattleAnimSpecialRuntime,
  sprite: BallParticleSprite
): void => {
  if (++sprite.data[5] === 10) {
    sprite.data[5] = createTaskWithFunc(runtime, 'TaskDummy', 50);
    sprite.callback = 'SpriteCB_ThrowBall_ShrinkMon';
    runtime.sprites[runtime.battlerSpriteIds[runtime.battleAnimTarget]]!.data[1] = 0;
  }
};

export const SpriteCB_ThrowBall_ShrinkMon = (
  runtime: BattleAnimSpecialRuntime,
  sprite: BallParticleSprite
): void => {
  const spriteId = runtime.battlerSpriteIds[runtime.battleAnimTarget];
  const taskId = sprite.data[5];
  const task = runtime.tasks[taskId];

  if (++task.data[1] === 11) {
    playSE(runtime, SE_BALL_TRADE);
  }

  switch (task.data[0]) {
    case 0:
      prepareBattlerSpriteForRotScale(runtime, spriteId, ST_OAM_OBJ_NORMAL);
      task.data[10] = 256;
      runtime.monShrinkDuration = 28;
      runtime.monShrinkDistance = (runtime.sprites[spriteId]!.y + runtime.sprites[spriteId]!.y2) - (sprite.y + sprite.y2);
      runtime.monShrinkDelta = div(runtime.monShrinkDistance * 256, runtime.monShrinkDuration);
      task.data[2] = runtime.monShrinkDelta;
      task.data[0] += 1;
      break;
    case 1:
      task.data[10] += 0x20;
      setSpriteRotScale(runtime, spriteId, task.data[10], task.data[10], 0);
      task.data[3] += task.data[2];
      runtime.sprites[spriteId]!.y2 = (-task.data[3]) >> 8;
      if (task.data[10] >= 0x480) {
        task.data[0] += 1;
      }
      break;
    case 2:
      resetSpriteRotScale(runtime, spriteId);
      runtime.sprites[spriteId]!.invisible = true;
      task.data[0] += 1;
      break;
    default:
      if (task.data[1] > 10) {
        destroyTask(runtime, taskId);
        startSpriteAnim(runtime, sprite, 2);
        sprite.data[5] = 0;
        sprite.callback = 'SpriteCB_ThrowBall_InitialFall';
      }
      break;
  }
};

export const SpriteCB_ThrowBall_InitialFall = (
  runtime: BattleAnimSpecialRuntime,
  sprite: BallParticleSprite
): void => {
  void runtime;
  if (sprite.animEnded) {
    sprite.data[3] = 0;
    sprite.data[4] = 40;
    sprite.data[5] = 0;
    const angle = 0;
    sprite.y += cos(angle, 40);
    sprite.y2 = -cos(angle, sprite.data[4]);
    sprite.callback = 'SpriteCB_ThrowBall_Bounce';
  }
};

export const SpriteCB_ThrowBall_Bounce = (
  runtime: BattleAnimSpecialRuntime,
  sprite: BallParticleSprite
): void => {
  let lastBounce = false;

  switch (sprite.data[3] & 0xff) {
    case 0:
      sprite.y2 = -cos(sprite.data[5], sprite.data[4]);
      sprite.data[5] += (sprite.data[3] >> 8) + 4;
      if (sprite.data[5] >= 64) {
        sprite.data[4] -= 10;
        sprite.data[3] += 257;

        const bounceCount = sprite.data[3] >> 8;
        if (bounceCount === 4) {
          lastBounce = true;
        }

        switch (bounceCount) {
          case 1:
            playSE(runtime, SE_BALL_BOUNCE_1);
            break;
          case 2:
            playSE(runtime, SE_BALL_BOUNCE_2);
            break;
          case 3:
            playSE(runtime, SE_BALL_BOUNCE_3);
            break;
          default:
            playSE(runtime, SE_BALL_BOUNCE_4);
            break;
        }
      }
      break;
    case 1:
      sprite.y2 = -cos(sprite.data[5], sprite.data[4]);
      sprite.data[5] -= (sprite.data[3] >> 8) + 4;
      if (sprite.data[5] <= 0) {
        sprite.data[5] = 0;
        sprite.data[3] &= -0x100;
      }
      break;
  }

  if (lastBounce) {
    sprite.data[3] = 0;
    sprite.y += cos(64, 40);
    sprite.y2 = 0;
    if (runtime.ballThrowCaseId === BALL_NO_SHAKES) {
      sprite.data[5] = 0;
      sprite.callback = 'SpriteCB_ThrowBall_DelayThenBreakOut';
    } else {
      sprite.callback = 'SpriteCB_ThrowBall_InitShake';
      sprite.data[4] = 1;
      sprite.data[5] = 0;
    }
  }
};

export const SpriteCB_ThrowBall_InitShake = (
  runtime: BattleAnimSpecialRuntime,
  sprite: BallParticleSprite
): void => {
  if (++sprite.data[3] === 31) {
    sprite.data[3] = 0;
    sprite.affineAnimPaused = true;
    startSpriteAffineAnim(runtime, sprite, 1);
    runtime.ballSubpx = 0;
    sprite.callback = 'SpriteCB_ThrowBall_DoShake';
    playSE(runtime, SE_BALL);
  }
};

export const SpriteCB_ThrowBall_DoShake = (
  runtime: BattleAnimSpecialRuntime,
  sprite: BallParticleSprite
): void => {
  let var0: number;

  switch (sprite.data[3] & 0xff) {
    case 0:
      if (runtime.ballSubpx > 0xff) {
        sprite.x2 += sprite.data[4];
        runtime.ballSubpx &= 0xff;
      } else {
        runtime.ballSubpx += 0xb0;
      }

      sprite.data[5] += 1;
      sprite.affineAnimPaused = false;
      var0 = sprite.data[5] + 7;
      if (var0 > 14) {
        runtime.ballSubpx = 0;
        sprite.data[3] += 1;
        sprite.data[5] = 0;
      }
      break;
    case 1:
      if (++sprite.data[5] === 1) {
        sprite.data[5] = 0;
        sprite.data[4] = -sprite.data[4];
        sprite.data[3] += 1;
        sprite.affineAnimPaused = false;
        if (sprite.data[4] < 0) {
          changeSpriteAffineAnim(runtime, sprite, 2);
        } else {
          changeSpriteAffineAnim(runtime, sprite, 1);
        }
      } else {
        sprite.affineAnimPaused = true;
      }
      break;
    case 2:
      if (runtime.ballSubpx > 0xff) {
        sprite.x2 += sprite.data[4];
        runtime.ballSubpx &= 0xff;
      } else {
        runtime.ballSubpx += 0xb0;
      }

      sprite.data[5] += 1;
      sprite.affineAnimPaused = false;
      var0 = sprite.data[5] + 12;
      if (var0 > 24) {
        runtime.ballSubpx = 0;
        sprite.data[3] += 1;
        sprite.data[5] = 0;
      }
      break;
    case 3:
      if (sprite.data[5]++ < 0) {
        sprite.affineAnimPaused = true;
        break;
      }

      sprite.data[5] = 0;
      sprite.data[4] = -sprite.data[4];
      sprite.data[3] += 1;
      sprite.affineAnimPaused = false;
      if (sprite.data[4] < 0) {
        changeSpriteAffineAnim(runtime, sprite, 2);
      } else {
        changeSpriteAffineAnim(runtime, sprite, 1);
      }
    // fall through
    case 4:
      if (runtime.ballSubpx > 0xff) {
        sprite.x2 += sprite.data[4];
        runtime.ballSubpx &= 0xff;
      } else {
        runtime.ballSubpx += 0xb0;
      }

      sprite.data[5] += 1;
      sprite.affineAnimPaused = false;
      var0 = sprite.data[5] + 4;
      if (var0 > 8) {
        runtime.ballSubpx = 0;
        sprite.data[3] += 1;
        sprite.data[5] = 0;
        sprite.data[4] = -sprite.data[4];
      }
      break;
    case 5:
      sprite.data[3] += 0x100;
      if ((sprite.data[3] >> 8) === runtime.ballThrowCaseId) {
        sprite.affineAnimPaused = true;
        sprite.callback = 'SpriteCB_ThrowBall_DelayThenBreakOut';
      } else if (runtime.ballThrowCaseId === BALL_3_SHAKES_SUCCESS && (sprite.data[3] >> 8) === 3) {
        sprite.callback = 'SpriteCB_ThrowBall_InitClick';
        sprite.affineAnimPaused = true;
      } else {
        sprite.data[3] += 1;
        sprite.affineAnimPaused = true;
      }
      break;
    case 6:
    default:
      if (++sprite.data[5] === 31) {
        sprite.data[5] = 0;
        sprite.data[3] &= -0x100;
        startSpriteAffineAnim(runtime, sprite, 3);
        if (sprite.data[4] < 0) {
          startSpriteAffineAnim(runtime, sprite, 2);
        } else {
          startSpriteAffineAnim(runtime, sprite, 1);
        }

        playSE(runtime, SE_BALL);
      }
      break;
  }
};

export const SpriteCB_ThrowBall_DelayThenBreakOut = (
  runtime: BattleAnimSpecialRuntime,
  sprite: BallParticleSprite
): void => {
  void runtime;
  if (++sprite.data[5] === 31) {
    sprite.data[5] = 0;
    sprite.callback = 'SpriteCB_ThrowBall_BeginBreakOut';
  }
};

export const SpriteCB_ThrowBall_InitClick = (
  runtime: BattleAnimSpecialRuntime,
  sprite: BallParticleSprite
): void => {
  void runtime;
  sprite.animPaused = true;
  sprite.callback = 'SpriteCB_ThrowBall_DoClick';
  sprite.data[3] = 0;
  sprite.data[4] = 0;
  sprite.data[5] = 0;
};

export const SpriteCB_ThrowBall_DoClick = (
  runtime: BattleAnimSpecialRuntime,
  sprite: BallParticleSprite
): void => {
  sprite.data[4] += 1;
  if (sprite.data[4] === 40) {
    playSE(runtime, SE_BALL_CLICK);
    BlendPalettes(runtime, 0x10000 << sprite.oam.paletteNum, 6, RGB_BLACK);
    CreateStarsWhenBallClicks(runtime, sprite);
  } else if (sprite.data[4] === 60) {
    BeginNormalPaletteFade(runtime, 0x10000 << sprite.oam.paletteNum, 2, 6, 0, RGB_BLACK);
  } else if (sprite.data[4] === 95) {
    runtime.doingBattleAnim = false;
    updateOamPriorityInAllHealthboxes(runtime, 1);
    m4aMPlayAllStop(runtime);
    playSE(runtime, MUS_CAUGHT_INTRO);
  } else if (sprite.data[4] === 315) {
    const battlerSprite = runtime.sprites[runtime.battlerSpriteIds[runtime.battleAnimTarget]]!;
    freeOamMatrix(runtime, battlerSprite.oam.matrixNum);
    battlerSprite.destroyed = true;
    runtime.destroyedTargetSprites.push(battlerSprite.id);
    runtime.calls.push({ fn: 'DestroySprite', args: [battlerSprite.id] });
    sprite.data[0] = 0;
    sprite.callback = 'SpriteCB_ThrowBall_FinishClick';
  }
};

export const SpriteCB_ThrowBall_FinishClick = (
  runtime: BattleAnimSpecialRuntime,
  sprite: BallParticleSprite
): void => {
  switch (sprite.data[0]) {
    case 0: {
      sprite.data[1] = 0;
      sprite.data[2] = 0;
      sprite.oam.objMode = ST_OAM_OBJ_BLEND;
      setGpuReg(runtime, REG_OFFSET_BLDCNT, BLDCNT_EFFECT_BLEND | BLDCNT_TGT2_ALL);
      setGpuReg(runtime, REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(16, 0));
      const paletteIndex = indexOfSpritePaletteTag(runtime, gBallSpriteTemplates[ItemIdToBallId(runtime.lastUsedItem)].paletteTag);
      BeginNormalPaletteFade(runtime, 1 << (paletteIndex + 0x10), 0, 0, 16, RGB_WHITE);
      sprite.data[0] += 1;
      break;
    }
    case 1:
      if (sprite.data[1]++ > 0) {
        sprite.data[1] = 0;
        sprite.data[2] += 1;
        setGpuReg(runtime, REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(16 - sprite.data[2], sprite.data[2]));
        if (sprite.data[2] === 16) {
          sprite.data[0] += 1;
        }
      }
      break;
    case 2:
      sprite.invisible = true;
      sprite.data[0] += 1;
      break;
    default:
      if (!runtime.paletteFadeActive) {
        setGpuReg(runtime, REG_OFFSET_BLDCNT, 0);
        setGpuReg(runtime, REG_OFFSET_BLDALPHA, 0);
        sprite.data[0] = 0;
        sprite.callback = 'BattleAnimObj_SignalEnd';
      }
      break;
  }
};

export const BattleAnimObj_SignalEnd = (
  runtime: BattleAnimSpecialRuntime,
  sprite: BallParticleSprite
): void => {
  if (sprite.data[0] === 0) {
    sprite.data[0] = -1;
  } else {
    freeSpriteOamMatrix(runtime, sprite);
    sprite.destroyed = true;
    runtime.destroyedSprites.push(sprite.id);
    runtime.calls.push({ fn: 'DestroySprite', args: [sprite.id] });
  }
};

export const CreateStarsWhenBallClicks = (
  runtime: BattleAnimSpecialRuntime,
  sprite: BallParticleSprite
): void => {
  let subpriority: number;

  if (sprite.subpriority) {
    subpriority = sprite.subpriority - 1;
  } else {
    subpriority = 0;
    sprite.subpriority = 1;
  }

  LoadBallParticleGfx(runtime, BALL_MASTER);
  for (let i = 0; i < 3; i += 1) {
    const spriteId = createSprite(runtime, BALL_MASTER, sprite.x, sprite.y, subpriority);
    if (spriteId !== MAX_SPRITES) {
      const star = runtime.sprites[spriteId]!;
      star.data[0] = 24;
      star.data[2] = sprite.x + sCaptureStar[i].xOffset;
      star.data[4] = sprite.y + sCaptureStar[i].yOffset;
      star.data[5] = sCaptureStar[i].amplitude;
      initAnimArcTranslation(star);
      star.callback = 'SpriteCB_BallCaptureSuccessStar';
      startSpriteAnim(runtime, star, sBallParticleAnimNums[BALL_MASTER]);
    }
  }
};

export const SpriteCB_BallCaptureSuccessStar = (
  runtime: BattleAnimSpecialRuntime,
  sprite: BallParticleSprite
): void => {
  sprite.invisible = !sprite.invisible;
  if (translateAnimHorizontalArc(sprite)) {
    sprite.destroyed = true;
    runtime.destroyedSprites.push(sprite.id);
    runtime.calls.push({ fn: 'DestroySprite', args: [sprite.id] });
  }
};

export const SpriteCB_ThrowBall_BeginBreakOut = (
  runtime: BattleAnimSpecialRuntime,
  sprite: BallParticleSprite
): void => {
  startSpriteAnim(runtime, sprite, 1);
  startSpriteAffineAnim(runtime, sprite, 0);
  sprite.callback = 'SpriteCB_ThrowBall_RunBreakOut';
  const ballId = ItemIdToBallId(runtime.lastUsedItem);
  if (ballId >= 0 && ballId < POKEBALL_COUNT) {
    AnimateBallOpenParticles(runtime, sprite.x, sprite.y - 5, 1, 28, ballId);
    LaunchBallFadeMonTask(runtime, true, runtime.battleAnimTarget, 14, ballId);
  }

  const target = runtime.sprites[runtime.battlerSpriteIds[runtime.battleAnimTarget]]!;
  target.invisible = false;
  startSpriteAffineAnim(runtime, target, 1);
  animateSprite(runtime, target);
  target.data[1] = 0x1000;
};

export const SpriteCB_ThrowBall_RunBreakOut = (
  runtime: BattleAnimSpecialRuntime,
  sprite: BallParticleSprite
): void => {
  let next = false;
  const target = runtime.sprites[runtime.battlerSpriteIds[runtime.battleAnimTarget]]!;

  if (sprite.animEnded) {
    sprite.invisible = true;
  }

  if (target.affineAnimEnded) {
    startSpriteAffineAnim(runtime, target, 0);
    next = true;
  } else {
    target.data[1] -= 288;
    target.y2 = target.data[1] >> 8;
  }

  if (sprite.animEnded && next) {
    target.y2 = 0;
    target.invisible = runtime.wildMonInvisible;
    sprite.data[0] = 0;
    sprite.callback = 'BattleAnimObj_SignalEnd';
    runtime.doingBattleAnim = false;
    updateOamPriorityInAllHealthboxes(runtime, 1);
  }
};

export const TrainerBallBlock = (
  runtime: BattleAnimSpecialRuntime,
  sprite: BallParticleSprite
): void => {
  void runtime;
  sprite.x += sprite.x2;
  sprite.y += sprite.y2;
  sprite.x2 = 0;
  sprite.y2 = 0;
  for (let i = 0; i < 6; i += 1) {
    sprite.data[i] = 0;
  }

  sprite.callback = 'TrainerBallBlock2';
};

export const TrainerBallBlock2 = (
  runtime: BattleAnimSpecialRuntime,
  sprite: BallParticleSprite
): void => {
  const var0 = sprite.data[0] + 0x800;
  const var1 = sprite.data[1] + 0x680;

  sprite.x2 -= var1 >> 8;
  sprite.y2 += var0 >> 8;
  sprite.data[0] = (sprite.data[0] + 0x800) & 0xff;
  sprite.data[1] = (sprite.data[1] + 0x680) & 0xff;
  if (sprite.y + sprite.y2 > 160 || sprite.x + sprite.x2 < -8) {
    sprite.data[0] = 0;
    sprite.callback = 'BattleAnimObj_SignalEnd';
    runtime.doingBattleAnim = false;
    updateOamPriorityInAllHealthboxes(runtime, 1);
  }
};

export const GhostBallDodge = (
  runtime: BattleAnimSpecialRuntime,
  sprite: BallParticleSprite
): void => {
  void runtime;
  sprite.x += sprite.x2;
  sprite.y += sprite.y2;
  sprite.x2 = 0;
  sprite.y2 = 0;
  sprite.data[0] = 0x22;
  sprite.data[1] = sprite.x;
  sprite.data[2] = sprite.x - 8;
  sprite.data[3] = sprite.y;
  sprite.data[4] = 0x90;
  sprite.data[5] = 0x20;
  initAnimArcTranslation(sprite);
  translateAnimVerticalArc(sprite);
  sprite.callback = 'GhostBallDodge2';
};

export const GhostBallDodge2 = (
  runtime: BattleAnimSpecialRuntime,
  sprite: BallParticleSprite
): void => {
  if (!translateAnimVerticalArc(sprite)) {
    if ((sprite.y + sprite.y2) < 65) {
      return;
    }
  }

  sprite.data[0] = 0;
  sprite.callback = 'BattleAnimObj_SignalEnd';
  runtime.doingBattleAnim = false;
  updateOamPriorityInAllHealthboxes(runtime, 1);
};

export const LaunchBallFadeMonTask = (
  runtime: BattleAnimSpecialRuntime,
  unfadeLater: boolean,
  battler: number,
  selectedPalettes: number,
  ballId: number
): number => {
  const taskId = createTaskWithFunc(runtime, 'Task_FadeMon_ToBallColor', 5);
  const task = runtime.tasks[taskId];
  task.data[15] = ballId;
  task.data[3] = battler;
  task.data[10] = selectedPalettes & 0xffff;
  task.data[11] = (selectedPalettes >>> 16) & 0xffff;

  if (!unfadeLater) {
    BlendPalette(runtime, OBJ_PLTT_ID(battler), 16, 0, sBallOpenFadeColors[ballId]);
    task.data[1] = 1;
  } else {
    BlendPalette(runtime, OBJ_PLTT_ID(battler), 16, 16, sBallOpenFadeColors[ballId]);
    task.data[0] = 16;
    task.data[1] = -1;
    task.func = 'Task_FadeMon_ToNormal';
  }

  BeginNormalPaletteFade(runtime, selectedPalettes, 0, 0, 16, RGB_WHITE);
  return taskId;
};

export const Task_FadeMon_ToBallColor = (
  runtime: BattleAnimSpecialRuntime,
  taskId: number
): void => {
  const task = runtime.tasks[taskId];
  const ballId = task.data[15];

  if (task.data[2] <= 16) {
    BlendPalette(runtime, OBJ_PLTT_ID(task.data[3]), 16, task.data[0], sBallOpenFadeColors[ballId]);
    task.data[0] += task.data[1];
    task.data[2] += 1;
  } else if (!runtime.paletteFadeActive) {
    BeginNormalPaletteFade(runtime, combineTaskPaletteMask(task), 0, 16, 0, RGB_WHITE);
    destroyTask(runtime, taskId);
  }
};

export const Task_FadeMon_ToNormal = (
  runtime: BattleAnimSpecialRuntime,
  taskId: number
): void => {
  const task = runtime.tasks[taskId];

  if (!runtime.paletteFadeActive) {
    BeginNormalPaletteFade(runtime, combineTaskPaletteMask(task), 0, 16, 0, RGB_WHITE);
    task.func = 'Task_FadeMon_ToNormal_Step';
  }
};

export const Task_FadeMon_ToNormal_Step = (
  runtime: BattleAnimSpecialRuntime,
  taskId: number
): void => {
  const task = runtime.tasks[taskId];
  const ballId = task.data[15];

  if (task.data[2] <= 16) {
    BlendPalette(runtime, OBJ_PLTT_ID(task.data[3]), 16, task.data[0], sBallOpenFadeColors[ballId]);
    task.data[0] += task.data[1];
    task.data[2] += 1;
  } else {
    destroyTask(runtime, taskId);
  }
};

export const AnimTask_SwapMonSpriteToFromSubstitute = (
  runtime: BattleAnimSpecialRuntime,
  taskId: number
): void => {
  const task = runtime.tasks[taskId];
  const spriteId = runtime.battlerSpriteIds[runtime.battleAnimAttacker];
  const sprite = runtime.sprites[spriteId]!;
  let done = false;

  switch (task.data[10]) {
    case 0: {
      task.data[11] = runtime.battleAnimArgs[0];
      task.data[0] += 0x500;
      if (getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER) {
        sprite.x2 += task.data[0] >> 8;
      } else {
        sprite.x2 -= task.data[0] >> 8;
      }

      task.data[0] &= 0xff;
      const x = sprite.x + sprite.x2 + 32;
      if (x > 304) {
        task.data[10] += 1;
      }
      break;
    }
    case 1:
      loadBattleMonGfxAndAnimate(runtime, runtime.battleAnimAttacker, task.data[11], spriteId);
      task.data[10] += 1;
      break;
    case 2:
      task.data[0] += 0x500;
      if (getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER) {
        sprite.x2 -= task.data[0] >> 8;
      } else {
        sprite.x2 += task.data[0] >> 8;
      }

      task.data[0] &= 0xff;
      if (getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER) {
        if (sprite.x2 <= 0) {
          sprite.x2 = 0;
          done = true;
        }
      } else if (sprite.x2 >= 0) {
        sprite.x2 = 0;
        done = true;
      }

      if (done) {
        destroyAnimVisualTask(runtime, taskId);
      }
      break;
  }
};

export const AnimTask_SubstituteFadeToInvisible = (
  runtime: BattleAnimSpecialRuntime,
  taskId: number
): void => {
  const task = runtime.tasks[taskId];
  let spriteId: number;

  switch (task.data[15]) {
    case 0:
      if (getBattlerSpriteBGPriorityRank(runtime, runtime.battleAnimAttacker) === B_POSITION_OPPONENT_LEFT) {
        setGpuReg(runtime, REG_OFFSET_BLDCNT, BLDCNT_TGT1_BG1 | BLDCNT_EFFECT_BLEND | BLDCNT_TGT2_ALL);
      } else {
        setGpuReg(runtime, REG_OFFSET_BLDCNT, BLDCNT_TGT1_BG2 | BLDCNT_EFFECT_BLEND | BLDCNT_TGT2_ALL);
      }

      setGpuReg(runtime, REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(16, 0));
      task.data[15] += 1;
      break;
    case 1:
      if (task.data[1] > 1) {
        task.data[1] = 0;
        task.data[0] += 1;
        setGpuReg(runtime, REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(16 - task.data[0], task.data[0]));
        if (task.data[0] === 16) {
          task.data[15] += 1;
        }
      } else {
        task.data[1] += 1;
      }
      break;
    case 2:
      spriteId = runtime.battlerSpriteIds[runtime.battleAnimAttacker];
      requestDma3Fill(runtime, 0, runtime.sprites[spriteId]!.oam.tileNum * TILE_SIZE_4BPP, 0x800, DMA3_32BIT);
      clearBehindSubstituteBit(runtime, runtime.battleAnimAttacker);
      destroyAnimVisualTask(runtime, taskId);
      break;
  }
};

export const AnimTask_IsAttackerBehindSubstitute = (
  runtime: BattleAnimSpecialRuntime,
  taskId: number
): void => {
  runtime.battleAnimArgs[ARG_RET_ID] = runtime.battlerData[runtime.battleAnimAttacker]?.behindSubstitute ?? 0;
  destroyAnimVisualTask(runtime, taskId);
};

export const AnimTask_SetTargetToEffectBattler = (
  runtime: BattleAnimSpecialRuntime,
  taskId: number
): void => {
  runtime.battleAnimTarget = runtime.effectBattler;
  destroyAnimVisualTask(runtime, taskId);
};

export const GetShinyValue = (
  otId: number,
  personality: number
): number => (((otId >>> 16) & 0xffff) ^ (otId & 0xffff) ^ ((personality >>> 16) & 0xffff) ^ (personality & 0xffff)) & 0xffff;

export const TryShinyAnimation = (
  runtime: BattleAnimSpecialRuntime,
  battler: number,
  mon: BattleAnimSpecialPokemon
): void => {
  let isShiny = false;
  const healthBoxData = getHealthBoxData(runtime, battler);
  healthBoxData.triedShinyMonAnim = true;
  const otId = mon.otId >>> 0;
  const personality = mon.personality >>> 0;

  if (isBattlerSpriteVisible(runtime, battler)) {
    const shinyValue = GetShinyValue(otId, personality);
    if (shinyValue < SHINY_ODDS) {
      isShiny = true;
    }

    if (isShiny) {
      if (GetSpriteTileStartByTag(runtime, ANIM_TAG_GOLD_STARS) === SPRITE_TILE_START_NONE) {
        runtime.calls.push({ fn: 'LoadCompressedSpriteSheetUsingHeap', args: [`gBattleAnimPicTable[${ANIM_TAG_GOLD_STARS - ANIM_SPRITES_START}]`] });
        runtime.calls.push({ fn: 'LoadCompressedSpritePaletteUsingHeap', args: [`gBattleAnimPaletteTable[${ANIM_TAG_GOLD_STARS - ANIM_SPRITES_START}]`] });
        runtime.loadedTileTags.add(ANIM_TAG_GOLD_STARS);
        runtime.loadedPaletteTags.add(ANIM_TAG_GOLD_STARS);
      }

      const taskId1 = createTaskWithFunc(runtime, 'AnimTask_ShinySparkles', 10);
      const taskId2 = createTaskWithFunc(runtime, 'AnimTask_ShinySparkles', 10);
      runtime.tasks[taskId1].data[0] = battler;
      runtime.tasks[taskId2].data[0] = battler;
      runtime.tasks[taskId1].data[1] = 0;
      runtime.tasks[taskId2].data[1] = 1;
      return;
    }
  }

  healthBoxData.finishedShinyMonAnim = true;
};

export const AnimTask_ShinySparkles = (
  runtime: BattleAnimSpecialRuntime,
  taskId: number
): void => {
  const task = runtime.tasks[taskId];
  let spriteId: number;

  if (task.data[13] < 60) {
    task.data[13] += 1;
    return;
  }

  if (runtime.numBallParticles) {
    return;
  }

  const counter = task.data[10];
  task.data[10] += 1;
  if (counter & 3) {
    return;
  }

  const battler = task.data[0];
  const x = getBattlerSpriteCoord(runtime, battler, BATTLER_COORD_X);
  const y = getBattlerSpriteCoord(runtime, battler, BATTLER_COORD_Y);
  const state = task.data[11];
  if (state === 0) {
    spriteId = createTemplateSprite(runtime, 'gWishStarSpriteTemplate', x, y, 5);
  } else if (state >= 0 && task.data[11] < 4) {
    spriteId = createTemplateSprite(runtime, 'gMiniTwinklingStarSpriteTemplate', x, y, 5);
    runtime.sprites[spriteId]!.oam.tileNum += 4;
  } else {
    spriteId = createTemplateSprite(runtime, 'gMiniTwinklingStarSpriteTemplate', x, y, 5);
    runtime.sprites[spriteId]!.oam.tileNum += 5;
  }

  if (task.data[1] === 0) {
    runtime.sprites[spriteId]!.callback = 'SpriteCB_ShinySparkles_1';
  } else {
    const sprite = runtime.sprites[spriteId]!;
    sprite.callback = 'SpriteCB_ShinySparkles_2';
    sprite.x2 = -32;
    sprite.y2 = 32;
    sprite.invisible = true;
    if (task.data[11] === 0) {
      const pan = getBattlerSide(runtime, battler) === B_SIDE_PLAYER ? SOUND_PAN_ATTACKER : SOUND_PAN_TARGET;
      playSE12WithPanning(runtime, SE_SHINY, pan);
    }
  }

  runtime.sprites[spriteId]!.data[0] = taskId;
  task.data[11] += 1;
  if (spriteId !== MAX_SPRITES) {
    task.data[12] += 1;
  }

  if (task.data[11] === 5) {
    task.func = 'AnimTask_ShinySparkles_WaitSparkles';
  }
};

export const AnimTask_ShinySparkles_WaitSparkles = (
  runtime: BattleAnimSpecialRuntime,
  taskId: number
): void => {
  const task = runtime.tasks[taskId];

  if (task.data[12] === 0) {
    if (task.data[1] === 1) {
      const battler = task.data[0];
      getHealthBoxData(runtime, battler).finishedShinyMonAnim = true;
    }

    destroyTask(runtime, taskId);
  }
};

export const SpriteCB_ShinySparkles_1 = (
  runtime: BattleAnimSpecialRuntime,
  sprite: BallParticleSprite
): void => {
  sprite.x2 = sin(sprite.data[1], 24);
  sprite.y2 = cos(sprite.data[1], 24);
  sprite.data[1] += 12;
  if (sprite.data[1] > 0xff) {
    runtime.tasks[sprite.data[0]].data[12] -= 1;
    freeSpriteOamMatrix(runtime, sprite);
    sprite.destroyed = true;
    runtime.destroyedSprites.push(sprite.id);
    runtime.calls.push({ fn: 'DestroySprite', args: [sprite.id] });
  }
};

export const SpriteCB_ShinySparkles_2 = (
  runtime: BattleAnimSpecialRuntime,
  sprite: BallParticleSprite
): void => {
  if (sprite.data[1] < 4) {
    sprite.data[1] += 1;
  } else {
    sprite.invisible = false;
    sprite.x2 += 5;
    sprite.y2 -= 5;
    if (sprite.x2 > 32) {
      runtime.tasks[sprite.data[0]].data[12] -= 1;
      freeSpriteOamMatrix(runtime, sprite);
      sprite.destroyed = true;
      runtime.destroyedSprites.push(sprite.id);
      runtime.calls.push({ fn: 'DestroySprite', args: [sprite.id] });
    }
  }
};

export const AnimTask_LoadBaitGfx = (
  runtime: BattleAnimSpecialRuntime,
  taskId: number
): void => {
  runtime.calls.push({ fn: 'LoadCompressedSpriteSheetUsingHeap', args: [`gBattleAnimPicTable[${ANIM_TAG_SAFARI_BAIT - ANIM_SPRITES_START}]`] });
  runtime.calls.push({ fn: 'LoadCompressedSpritePaletteUsingHeap', args: [`gBattleAnimPaletteTable[${ANIM_TAG_SAFARI_BAIT - ANIM_SPRITES_START}]`] });
  runtime.loadedTileTags.add(ANIM_TAG_SAFARI_BAIT);
  runtime.loadedPaletteTags.add(ANIM_TAG_SAFARI_BAIT);
  indexOfSpritePaletteTag(runtime, ANIM_TAG_SAFARI_BAIT);
  destroyAnimVisualTask(runtime, taskId);
};

export const AnimTask_FreeBaitGfx = (
  runtime: BattleAnimSpecialRuntime,
  taskId: number
): void => {
  runtime.loadedTileTags.delete(ANIM_TAG_SAFARI_BAIT);
  runtime.loadedPaletteTags.delete(ANIM_TAG_SAFARI_BAIT);
  runtime.freedTileTags.push(ANIM_TAG_SAFARI_BAIT);
  runtime.freedPaletteTags.push(ANIM_TAG_SAFARI_BAIT);
  runtime.calls.push({ fn: 'FreeSpriteTilesByTag', args: [ANIM_TAG_SAFARI_BAIT] });
  runtime.calls.push({ fn: 'FreeSpritePaletteByTag', args: [ANIM_TAG_SAFARI_BAIT] });
  destroyAnimVisualTask(runtime, taskId);
};

export const SpriteCB_SafariBaitOrRock_Init = (
  runtime: BattleAnimSpecialRuntime,
  sprite: BallParticleSprite
): void => {
  initSpritePosToAnimAttacker(runtime, sprite, false);
  sprite.data[0] = 30;
  sprite.data[2] = getBattlerSpriteCoord(runtime, getBattlerAtPosition(runtime, B_POSITION_OPPONENT_LEFT), BATTLER_COORD_X) + runtime.battleAnimArgs[2];
  sprite.data[4] = getBattlerSpriteCoord(runtime, getBattlerAtPosition(runtime, B_POSITION_OPPONENT_LEFT), BATTLER_COORD_Y) + runtime.battleAnimArgs[3];
  sprite.data[5] = -32;
  initAnimArcTranslation(sprite);
  runtime.sprites[runtime.battlerSpriteIds[runtime.battleAnimAttacker]]!.callback = 'SpriteCB_PlayerThrowInit';
  sprite.callback = 'SpriteCB_SafariBaitOrRock_WaitPlayerThrow';
};

export const SpriteCB_SafariBaitOrRock_WaitPlayerThrow = (
  runtime: BattleAnimSpecialRuntime,
  sprite: BallParticleSprite
): void => {
  if (runtime.sprites[runtime.battlerSpriteIds[runtime.battleAnimAttacker]]!.animCmdIndex === 1) {
    sprite.callback = 'SpriteCB_SafariBaitOrRock_ArcFlight';
  }
};

export const SpriteCB_SafariBaitOrRock_ArcFlight = (
  runtime: BattleAnimSpecialRuntime,
  sprite: BallParticleSprite
): void => {
  void runtime;
  if (translateAnimHorizontalArc(sprite)) {
    sprite.data[0] = 0;
    sprite.invisible = true;
    sprite.callback = 'SpriteCB_SafariBaitOrRock_Finish';
  }
};

export const SpriteCB_SafariBaitOrRock_Finish = (
  runtime: BattleAnimSpecialRuntime,
  sprite: BallParticleSprite
): void => {
  if (runtime.sprites[runtime.battlerSpriteIds[runtime.battleAnimAttacker]]!.animEnded) {
    if (++sprite.data[0] > 0) {
      startSpriteAnim(runtime, runtime.sprites[runtime.battlerSpriteIds[runtime.battleAnimAttacker]]!, 0);
      destroyAnimSprite(runtime, sprite);
    }
  }
};

export const AnimTask_SafariOrGhost_DecideAnimSides = (
  runtime: BattleAnimSpecialRuntime,
  taskId: number
): void => {
  switch (runtime.battleAnimArgs[0]) {
    case 0:
      runtime.battleAnimAttacker = getBattlerAtPosition(runtime, B_POSITION_PLAYER_LEFT);
      runtime.battleAnimTarget = getBattlerAtPosition(runtime, B_POSITION_OPPONENT_LEFT);
      break;
    case 1:
      runtime.battleAnimAttacker = getBattlerAtPosition(runtime, B_POSITION_OPPONENT_LEFT);
      runtime.battleAnimTarget = getBattlerAtPosition(runtime, B_POSITION_PLAYER_LEFT);
      break;
  }

  destroyAnimVisualTask(runtime, taskId);
};

export const AnimTask_SafariGetReaction = (
  runtime: BattleAnimSpecialRuntime,
  taskId: number
): void => {
  if (runtime.battleCommunication[MULTISTRING_CHOOSER] >= NUM_SAFARI_REACTIONS) {
    runtime.battleAnimArgs[7] = 0;
  } else {
    runtime.battleAnimArgs[7] = runtime.battleCommunication[MULTISTRING_CHOOSER];
  }

  destroyAnimVisualTask(runtime, taskId);
};

export const AnimTask_GetTrappedMoveAnimId = (
  runtime: BattleAnimSpecialRuntime,
  taskId: number
): void => {
  if (runtime.animationDataAnimArg === MOVE_FIRE_SPIN) {
    runtime.battleAnimArgs[0] = TRAP_ANIM_FIRE_SPIN;
  } else if (runtime.animationDataAnimArg === MOVE_WHIRLPOOL) {
    runtime.battleAnimArgs[0] = TRAP_ANIM_WHIRLPOOL;
  } else if (runtime.animationDataAnimArg === MOVE_CLAMP) {
    runtime.battleAnimArgs[0] = TRAP_ANIM_CLAMP;
  } else if (runtime.animationDataAnimArg === MOVE_SAND_TOMB) {
    runtime.battleAnimArgs[0] = TRAP_ANIM_SAND_TOMB;
  } else {
    runtime.battleAnimArgs[0] = TRAP_ANIM_BIND;
  }

  destroyAnimVisualTask(runtime, taskId);
};

export const AnimTask_GetBattlersFromArg = (
  runtime: BattleAnimSpecialRuntime,
  taskId: number
): void => {
  runtime.battleAnimAttacker = runtime.animationDataAnimArg;
  runtime.battleAnimTarget = runtime.animationDataAnimArg >> 8;
  destroyAnimVisualTask(runtime, taskId);
};
