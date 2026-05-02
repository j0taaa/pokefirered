export const MAX_BATTLERS_COUNT = 4;
export const SPECIES_NONE = 0;
export const SPECIES_CASTFORM = 351;
export const MOVE_SUBSTITUTE = 164;
export const BIT_FLANK = 2;

export const BATTLE_TYPE_SAFARI = 1 << 5;
export const B_SIDE_PLAYER = 0;
export const B_SIDE_OPPONENT = 1;
export const B_POSITION_PLAYER_LEFT = 0;
export const B_POSITION_OPPONENT_LEFT = 1;
export const B_POSITION_PLAYER_RIGHT = 2;
export const B_POSITION_OPPONENT_RIGHT = 3;

export const STATUS1_FREEZE = 1 << 5;
export const STATUS1_POISON = 1 << 3;
export const STATUS1_TOXIC_POISON = 1 << 4;
export const STATUS1_BURN = 1 << 6;
export const STATUS1_SLEEP = 0x7;
export const STATUS1_PARALYSIS = 1 << 7;
export const STATUS1_ANY = STATUS1_SLEEP | STATUS1_POISON | STATUS1_BURN | STATUS1_FREEZE | STATUS1_PARALYSIS;
export const STATUS1_TOXIC_COUNTER = 0xf00;

export const STATUS2_CONFUSION = 1 << 0;
export const STATUS2_INFATUATION = 1 << 3;
export const STATUS2_WRAPPED = 1 << 4;
export const STATUS2_CURSED = 1 << 5;
export const STATUS2_NIGHTMARE = 1 << 6;

export const B_ANIM_STATUS_PSN = 0;
export const B_ANIM_STATUS_CONFUSION = 1;
export const B_ANIM_STATUS_BRN = 2;
export const B_ANIM_STATUS_INFATUATION = 3;
export const B_ANIM_STATUS_SLP = 4;
export const B_ANIM_STATUS_PRZ = 5;
export const B_ANIM_STATUS_FRZ = 6;
export const B_ANIM_STATUS_CURSED = 7;
export const B_ANIM_STATUS_NIGHTMARE = 8;
export const B_ANIM_STATUS_WRAPPED = 9;

export const B_ANIM_SUBSTITUTE_FADE = 1;
export const B_ANIM_RAIN_CONTINUES = 2;
export const B_ANIM_SUN_CONTINUES = 3;
export const B_ANIM_SANDSTORM_CONTINUES = 4;
export const B_ANIM_HAIL_CONTINUES = 5;
export const B_ANIM_SNATCH_MOVE = 6;
export const B_ANIM_CASTFORM_CHANGE = 7;

export const HP_BAR_RED = 0;
export const HP_BAR_YELLOW = 1;
export const HP_BAR_GREEN = 2;
export const ST_OAM_AFFINE_OFF = 0;
export const SE_LOW_HEALTH = 'SE_LOW_HEALTH';

export interface BattleGfxSprite {
  affineAnimEnded: boolean;
  invisible: boolean;
  animPaused: number;
  animEnded: boolean;
  callback: string;
  x: number;
  y: number;
  x2: number;
  data: number[];
  inUse: boolean;
  oam: { tileNum: number; affineMode: number; matrixNum: number };
}

export interface BattleGfxPokemon {
  species: number;
  personality: number;
  otId: number;
  hp: number;
  maxHP: number;
  status: number;
  nickname?: string;
}

export interface BattleSpriteInfo {
  behindSubstitute: number;
  transformSpecies: number;
  invisible: boolean;
  lowHpSong: number;
}

export interface BattleHealthboxInfo {
  statusAnimActive: number;
  animFromTableActive: number;
  specialAnimActive: number;
  soundTimer: number;
  matrixNum: number;
  shadowSpriteId: number;
}

export interface BattleGfxTask {
  data: number[];
  func: string;
  destroyed: boolean;
}

export interface BattleGfxRuntime {
  gBattleSpritesDataPtr: {
    battlerData: BattleSpriteInfo[];
    healthBoxesData: BattleHealthboxInfo[];
    animationData: { animArg: number };
    battleBars: unknown[];
  } | null;
  gSprites: BattleGfxSprite[];
  gActiveBattler: number;
  gBattleAnimAttacker: number;
  gBattleAnimTarget: number;
  gBattleMonForms: number[];
  gTransformedPersonalities: number[];
  gBattlerSpriteIds: number[];
  gHealthboxSpriteIds: number[];
  gBattlerPositions: number[];
  gBattlerPartyIndexes: number[];
  gBattlersCount: number;
  gBattleTypeFlags: number;
  gAnimScriptActive: boolean;
  gIntroSlideFlags: number;
  gMain: { inBattle: boolean };
  sePlaying: boolean;
  isDoubleBattle: boolean;
  battlerSides: number[];
  battlerAtPosition: Record<number, number>;
  battlerSpritePresent: boolean[];
  enemyMonElevation: Record<number, number>;
  playerParty: BattleGfxPokemon[];
  enemyParty: BattleGfxPokemon[];
  tasks: BattleGfxTask[];
  operations: string[];
  vram240: number[];
  vram600: number[];
  nextSpriteId: number;
}

const makeSprite = (): BattleGfxSprite => ({
  affineAnimEnded: true,
  invisible: false,
  animPaused: 0,
  animEnded: false,
  callback: 'SpriteCallbackDummy',
  x: 0,
  y: 0,
  x2: 0,
  data: Array.from({ length: 8 }, () => 0),
  inUse: true,
  oam: { tileNum: 0, affineMode: 0, matrixNum: 0 }
});

export const createBattleGfxRuntime = (overrides: Partial<BattleGfxRuntime> = {}): BattleGfxRuntime => ({
  gBattleSpritesDataPtr: null,
  gSprites: Array.from({ length: 32 }, () => makeSprite()),
  gActiveBattler: 0,
  gBattleAnimAttacker: 0,
  gBattleAnimTarget: 0,
  gBattleMonForms: [0, 0, 0, 0],
  gTransformedPersonalities: [0, 0, 0, 0],
  gBattlerSpriteIds: [0, 1, 2, 3],
  gHealthboxSpriteIds: [4, 5, 6, 7],
  gBattlerPositions: [0, 1, 2, 3],
  gBattlerPartyIndexes: [0, 0, 1, 1],
  gBattlersCount: 4,
  gBattleTypeFlags: 0,
  gAnimScriptActive: false,
  gIntroSlideFlags: 0,
  gMain: { inBattle: true },
  sePlaying: false,
  isDoubleBattle: false,
  battlerSides: [B_SIDE_PLAYER, B_SIDE_OPPONENT, B_SIDE_PLAYER, B_SIDE_OPPONENT],
  battlerAtPosition: { [B_POSITION_PLAYER_LEFT]: 0, [B_POSITION_OPPONENT_LEFT]: 1, [B_POSITION_PLAYER_RIGHT]: 2, [B_POSITION_OPPONENT_RIGHT]: 3 },
  battlerSpritePresent: [true, true, true, true],
  enemyMonElevation: {},
  playerParty: [],
  enemyParty: [],
  tasks: [],
  operations: [],
  vram240: Array.from({ length: 9 * 16 }, () => 0),
  vram600: Array.from({ length: 18 * 16 }, () => 0),
  nextSpriteId: 8,
  ...overrides
});

const data = (runtime: BattleGfxRuntime) => {
  if (!runtime.gBattleSpritesDataPtr) throw new Error('gBattleSpritesDataPtr is NULL');
  return runtime.gBattleSpritesDataPtr;
};

export const sSpriteSheet_SinglesPlayerHealthbox = { data: 'gHealthboxSinglesPlayerGfx', size: 0x1000, tag: 'TAG_HEALTHBOX_PLAYER1_TILE' } as const;
export const sSpriteSheet_SinglesOpponentHealthbox = { data: 'gHealthboxSinglesOpponentGfx', size: 0x1000, tag: 'TAG_HEALTHBOX_OPPONENT1_TILE' } as const;
export const sSpriteSheets_DoublesPlayerHealthbox = [
  { data: 'gHealthboxDoublesPlayerGfx', size: 0x800, tag: 'TAG_HEALTHBOX_PLAYER1_TILE' },
  { data: 'gHealthboxDoublesPlayerGfx', size: 0x800, tag: 'TAG_HEALTHBOX_PLAYER2_TILE' }
] as const;
export const sSpriteSheets_DoublesOpponentHealthbox = [
  { data: 'gHealthboxDoublesOpponentGfx', size: 0x800, tag: 'TAG_HEALTHBOX_OPPONENT1_TILE' },
  { data: 'gHealthboxDoublesOpponentGfx', size: 0x800, tag: 'TAG_HEALTHBOX_OPPONENT2_TILE' }
] as const;
export const sSpriteSheet_SafariHealthbox = { data: 'gHealthboxSafariGfx', size: 0x1000, tag: 'TAG_HEALTHBOX_SAFARI_TILE' } as const;
export const sSpriteSheets_HealthBar = [
  { data: 'gBlankGfxCompressed', size: 0x100, tag: 'TAG_HEALTHBAR_PLAYER1_TILE' },
  { data: 'gBlankGfxCompressed', size: 0x120, tag: 'TAG_HEALTHBAR_OPPONENT1_TILE' },
  { data: 'gBlankGfxCompressed', size: 0x100, tag: 'TAG_HEALTHBAR_PLAYER2_TILE' },
  { data: 'gBlankGfxCompressed', size: 0x120, tag: 'TAG_HEALTHBAR_OPPONENT2_TILE' }
] as const;
export const sSpritePalettes_HealthBoxHealthBar = [
  { data: 'gBattleInterface_Healthbox_Pal', tag: 'TAG_HEALTHBOX_PAL' },
  { data: 'gBattleInterface_Healthbar_Pal', tag: 'TAG_HEALTHBAR_PAL' }
] as const;

export const allocateBattleSpritesData = (runtime: BattleGfxRuntime): void => {
  runtime.gBattleSpritesDataPtr = {
    battlerData: Array.from({ length: MAX_BATTLERS_COUNT }, () => ({ behindSubstitute: 0, transformSpecies: SPECIES_NONE, invisible: false, lowHpSong: 0 })),
    healthBoxesData: Array.from({ length: MAX_BATTLERS_COUNT }, () => ({ statusAnimActive: 0, animFromTableActive: 0, specialAnimActive: 0, soundTimer: 0, matrixNum: 0, shadowSpriteId: 0 })),
    animationData: { animArg: 0 },
    battleBars: Array.from({ length: MAX_BATTLERS_COUNT }, () => ({}))
  };
};

export const freeBattleSpritesData = (runtime: BattleGfxRuntime): void => {
  if (runtime.gBattleSpritesDataPtr) runtime.gBattleSpritesDataPtr = null;
};

export const spriteCBWaitForBattlerBallReleaseAnim = (runtime: BattleGfxRuntime, sprite: BattleGfxSprite): void => {
  const target = runtime.gSprites[sprite.data[1]];
  if (!target.affineAnimEnded) return;
  if (target.invisible) return;
  if (target.animPaused) target.animPaused = 0;
  else if (target.animEnded) {
    target.callback = 'SetIdleSpriteCallback';
    runtime.operations.push(`StartSpriteAffineAnim(${sprite.data[1]}, 0)`);
    sprite.callback = 'SpriteCallbackDummy';
  }
};

export const doBattleSpriteAffineAnim = (runtime: BattleGfxRuntime, sprite: BattleGfxSprite, _arg1: boolean): void => {
  sprite.animPaused = 1;
  sprite.callback = 'SpriteCallbackDummy';
  runtime.operations.push('StartSpriteAffineAnim(sprite, 1)');
  runtime.operations.push('AnimateSprite(sprite)');
};

export const spriteCBTrainerSlideIn = (runtime: BattleGfxRuntime, sprite: BattleGfxSprite): void => {
  if ((runtime.gIntroSlideFlags & 1) === 0) {
    sprite.x2 += sprite.data[0];
    if (sprite.x2 === 0) sprite.callback = 'SpriteCallbackDummy';
  }
};

const launchStatusAnimation = (runtime: BattleGfxRuntime, battler: number, anim: number): void => {
  runtime.operations.push(`LaunchStatusAnimation(${battler}, ${anim})`);
};

export const initAndLaunchChosenStatusAnimation = (runtime: BattleGfxRuntime, isStatus2: boolean, status: number): void => {
  data(runtime).healthBoxesData[runtime.gActiveBattler].statusAnimActive = 1;
  if (!isStatus2) {
    if (status === STATUS1_FREEZE) launchStatusAnimation(runtime, runtime.gActiveBattler, B_ANIM_STATUS_FRZ);
    else if (status === STATUS1_POISON || (status & STATUS1_TOXIC_POISON) !== 0) launchStatusAnimation(runtime, runtime.gActiveBattler, B_ANIM_STATUS_PSN);
    else if (status === STATUS1_BURN) launchStatusAnimation(runtime, runtime.gActiveBattler, B_ANIM_STATUS_BRN);
    else if ((status & STATUS1_SLEEP) !== 0) launchStatusAnimation(runtime, runtime.gActiveBattler, B_ANIM_STATUS_SLP);
    else if (status === STATUS1_PARALYSIS) launchStatusAnimation(runtime, runtime.gActiveBattler, B_ANIM_STATUS_PRZ);
    else data(runtime).healthBoxesData[runtime.gActiveBattler].statusAnimActive = 0;
  } else {
    if ((status & STATUS2_INFATUATION) !== 0) launchStatusAnimation(runtime, runtime.gActiveBattler, B_ANIM_STATUS_INFATUATION);
    else if ((status & STATUS2_CONFUSION) !== 0) launchStatusAnimation(runtime, runtime.gActiveBattler, B_ANIM_STATUS_CONFUSION);
    else if ((status & STATUS2_CURSED) !== 0) launchStatusAnimation(runtime, runtime.gActiveBattler, B_ANIM_STATUS_CURSED);
    else if ((status & STATUS2_NIGHTMARE) !== 0) launchStatusAnimation(runtime, runtime.gActiveBattler, B_ANIM_STATUS_NIGHTMARE);
    else if ((status & STATUS2_WRAPPED) !== 0) launchStatusAnimation(runtime, runtime.gActiveBattler, B_ANIM_STATUS_WRAPPED);
    else data(runtime).healthBoxesData[runtime.gActiveBattler].statusAnimActive = 0;
  }
};

export const shouldAnimBeDoneRegardlessOfSubstitute = (animId: number): boolean =>
  [B_ANIM_SUBSTITUTE_FADE, B_ANIM_RAIN_CONTINUES, B_ANIM_SUN_CONTINUES, B_ANIM_SANDSTORM_CONTINUES, B_ANIM_HAIL_CONTINUES, B_ANIM_SNATCH_MOVE].includes(animId);

export const tryHandleLaunchBattleTableAnimation = (runtime: BattleGfxRuntime, activeBattler: number, atkBattler: number, defBattler: number, tableId: number, argument: number): boolean => {
  if (tableId === B_ANIM_CASTFORM_CHANGE && (argument & 0x80) !== 0) {
    runtime.gBattleMonForms[activeBattler] = argument & ~0x80;
    return true;
  }
  if (data(runtime).battlerData[activeBattler].behindSubstitute && !shouldAnimBeDoneRegardlessOfSubstitute(tableId)) return true;
  if (data(runtime).battlerData[activeBattler].behindSubstitute && tableId === B_ANIM_SUBSTITUTE_FADE && runtime.gSprites[runtime.gBattlerSpriteIds[activeBattler]].invisible) {
    loadBattleMonGfxAndAnimate(runtime, activeBattler, true, runtime.gBattlerSpriteIds[activeBattler]);
    clearBehindSubstituteBit(runtime, activeBattler);
    return true;
  }
  runtime.gBattleAnimAttacker = atkBattler;
  runtime.gBattleAnimTarget = defBattler;
  data(runtime).animationData.animArg = argument;
  runtime.operations.push(`LaunchBattleAnimation(gBattleAnims_General, ${tableId}, FALSE)`);
  const taskId = createTask(runtime, 'Task_ClearBitWhenBattleTableAnimDone');
  runtime.tasks[taskId].data[0] = activeBattler;
  data(runtime).healthBoxesData[activeBattler].animFromTableActive = 1;
  return false;
};

export const taskClearBitWhenBattleTableAnimDone = (runtime: BattleGfxRuntime, taskId: number): void => {
  runtime.operations.push('gAnimScriptCallback');
  if (!runtime.gAnimScriptActive) {
    data(runtime).healthBoxesData[runtime.tasks[taskId].data[0]].animFromTableActive = 0;
    runtime.tasks[taskId].destroyed = true;
  }
};

export const initAndLaunchSpecialAnimation = (runtime: BattleGfxRuntime, activeBattler: number, atkBattler: number, defBattler: number, tableId: number): void => {
  runtime.gBattleAnimAttacker = atkBattler;
  runtime.gBattleAnimTarget = defBattler;
  runtime.operations.push(`LaunchBattleAnimation(gBattleAnims_Special, ${tableId}, FALSE)`);
  const taskId = createTask(runtime, 'Task_ClearBitWhenSpecialAnimDone');
  runtime.tasks[taskId].data[0] = activeBattler;
  data(runtime).healthBoxesData[activeBattler].specialAnimActive = 1;
};

export const taskClearBitWhenSpecialAnimDone = (runtime: BattleGfxRuntime, taskId: number): void => {
  runtime.operations.push('gAnimScriptCallback');
  if (!runtime.gAnimScriptActive) {
    data(runtime).healthBoxesData[runtime.tasks[taskId].data[0]].specialAnimActive = 0;
    runtime.tasks[taskId].destroyed = true;
  }
};

export const isMoveWithoutAnimation = (_moveId: number, _animationTurn: number): boolean => false;

export const isBattleSEPlaying = (runtime: BattleGfxRuntime, battlerId: number): boolean => {
  if (runtime.sePlaying) {
    data(runtime).healthBoxesData[battlerId].soundTimer += 1;
    if (data(runtime).healthBoxesData[runtime.gActiveBattler].soundTimer < 30) return true;
    runtime.operations.push('m4aMPlayStop(SE1)');
    runtime.operations.push('m4aMPlayStop(SE2)');
  }
  data(runtime).healthBoxesData[battlerId].soundTimer = 0;
  return false;
};

export const battleLoadOpponentMonSpriteGfx = (runtime: BattleGfxRuntime, mon: BattleGfxPokemon, battlerId: number): void => loadMonSpriteGfx(runtime, mon, battlerId, 'front');
export const battleLoadPlayerMonSpriteGfx = (runtime: BattleGfxRuntime, mon: BattleGfxPokemon, battlerId: number): void => loadMonSpriteGfx(runtime, mon, battlerId, 'back');

const loadMonSpriteGfx = (runtime: BattleGfxRuntime, mon: BattleGfxPokemon, battlerId: number, side: 'front' | 'back'): void => {
  const transformed = data(runtime).battlerData[battlerId].transformSpecies !== SPECIES_NONE;
  const species = transformed ? data(runtime).battlerData[battlerId].transformSpecies : mon.species;
  const personality = transformed ? runtime.gTransformedPersonalities[battlerId] : mon.personality;
  runtime.operations.push(`HandleLoadSpecialPokePic_${side}(${species}, ${personality})`);
  runtime.operations.push(`LoadPalette(${battlerId})`);
  runtime.operations.push(`LoadPalette(bg-${battlerId})`);
  if (species === SPECIES_CASTFORM) runtime.operations.push(`LoadCastformPalette(${runtime.gBattleMonForms[battlerId]})`);
  if (transformed) {
    runtime.operations.push(`BlendPalette(${battlerId}, 16, 6, RGB_WHITE)`);
    runtime.operations.push(`CpuCopy32Palette(${battlerId})`);
  }
};

export const decompressGhostFrontPic = (runtime: BattleGfxRuntime, _unused: unknown, battlerId: number): void => {
  runtime.operations.push(`LZ77UnCompWram(gGhostFrontPic, position=${getBattlerPosition(runtime, battlerId)})`);
  runtime.operations.push(`LoadPalette(gGhostPalette, ${battlerId})`);
  runtime.operations.push(`LoadPalette(gGhostPaletteBg, ${battlerId})`);
};

export const decompressTrainerFrontPic = (runtime: BattleGfxRuntime, frontPicId: number, battlerId: number): void => {
  runtime.operations.push(`DecompressPicFromTable(${frontPicId}, position=${getBattlerPosition(runtime, battlerId)})`);
  runtime.operations.push(`LoadSpriteSheet(${frontPicId})`);
  runtime.operations.push(`LoadCompressedSpritePaletteUsingHeap(${frontPicId})`);
};

export const decompressTrainerBackPalette = (runtime: BattleGfxRuntime, index: number, palette: number): void => {
  runtime.operations.push(`LoadCompressedPalette(trainerBack=${index}, OBJ_PLTT_ID2(${palette}))`);
};

export const battleGfxSfxDummy3 = (_gender: number): void => undefined;
export const freeTrainerFrontPicPaletteAndTile = (runtime: BattleGfxRuntime, frontPicId: number): void => {
  runtime.operations.push(`FreeSpritePaletteByTag(frontPic=${frontPicId})`);
  runtime.operations.push(`FreeSpriteTilesByTag(frontPic=${frontPicId})`);
};

export const battleLoadAllHealthBoxesGfxAtOnce = (runtime: BattleGfxRuntime): void => {
  runtime.operations.push('LoadSpritePalette(TAG_HEALTHBOX_PAL)');
  runtime.operations.push('LoadSpritePalette(TAG_HEALTHBAR_PAL)');
  if (!runtime.isDoubleBattle) {
    runtime.operations.push('LoadCompressedSpriteSheet(TAG_HEALTHBOX_PLAYER1_TILE)');
    runtime.operations.push('LoadCompressedSpriteSheet(TAG_HEALTHBOX_OPPONENT1_TILE)');
    for (let i = 0; i < 2; i += 1) {
      runtime.operations.push(`LoadCompressedSpriteSheet(${sSpriteSheets_HealthBar[runtime.gBattlerPositions[i]].tag})`);
    }
  } else {
    runtime.operations.push('LoadCompressedSpriteSheet(TAG_HEALTHBOX_PLAYER1_TILE)');
    runtime.operations.push('LoadCompressedSpriteSheet(TAG_HEALTHBOX_PLAYER2_TILE)');
    runtime.operations.push('LoadCompressedSpriteSheet(TAG_HEALTHBOX_OPPONENT1_TILE)');
    runtime.operations.push('LoadCompressedSpriteSheet(TAG_HEALTHBOX_OPPONENT2_TILE)');
    for (let i = 0; i < MAX_BATTLERS_COUNT; i += 1) {
      runtime.operations.push(`LoadCompressedSpriteSheet(${sSpriteSheets_HealthBar[runtime.gBattlerPositions[i]].tag})`);
    }
  }
};

export const battleLoadAllHealthBoxesGfx = (runtime: BattleGfxRuntime, state: number): boolean => {
  let retVal = false;
  if (state) {
    if (state === 1) {
      runtime.operations.push('LoadSpritePalette(TAG_HEALTHBOX_PAL)');
      runtime.operations.push('LoadSpritePalette(TAG_HEALTHBAR_PAL)');
    } else if (!runtime.isDoubleBattle) {
      if (state === 2) runtime.operations.push(runtime.gBattleTypeFlags & BATTLE_TYPE_SAFARI ? 'LoadCompressedSpriteSheet(TAG_HEALTHBOX_SAFARI_TILE)' : 'LoadCompressedSpriteSheet(TAG_HEALTHBOX_PLAYER1_TILE)');
      else if (state === 3) runtime.operations.push('LoadCompressedSpriteSheet(TAG_HEALTHBOX_OPPONENT1_TILE)');
      else if (state === 4) runtime.operations.push(`LoadCompressedSpriteSheet(${sSpriteSheets_HealthBar[runtime.gBattlerPositions[0]].tag})`);
      else if (state === 5) runtime.operations.push(`LoadCompressedSpriteSheet(${sSpriteSheets_HealthBar[runtime.gBattlerPositions[1]].tag})`);
      else retVal = true;
    } else {
      if (state >= 2 && state <= 5) runtime.operations.push(`LoadCompressedSpriteSheet(double-healthbox-${state})`);
      else if (state >= 6 && state <= 9) runtime.operations.push(`LoadCompressedSpriteSheet(${sSpriteSheets_HealthBar[runtime.gBattlerPositions[state - 6]].tag})`);
      else retVal = true;
    }
  }
  return retVal;
};

export const loadBattleBarGfx = (runtime: BattleGfxRuntime, _arg0: number): void => {
  runtime.operations.push('LZDecompressWram(gInterfaceGfx_HPNumbers, barFontGfx)');
};

export const battleInitAllSprites = (runtime: BattleGfxRuntime, state: { value: number }, battlerId: { value: number }): boolean => {
  let retVal = false;
  switch (state.value) {
    case 0:
      clearSpritesBattlerHealthboxAnimData(runtime);
      state.value += 1;
      break;
    case 1:
      if (!battleLoadAllHealthBoxesGfx(runtime, battlerId.value)) battlerId.value += 1;
      else { battlerId.value = 0; state.value += 1; }
      break;
    case 2:
      state.value += 1;
      break;
    case 3:
      runtime.gHealthboxSpriteIds[battlerId.value] = (runtime.gBattleTypeFlags & BATTLE_TYPE_SAFARI) && battlerId.value === 0 ? createSafariPlayerHealthboxSprites(runtime) : createBattlerHealthboxSprites(runtime, battlerId.value);
      battlerId.value += 1;
      if (battlerId.value === runtime.gBattlersCount) { battlerId.value = 0; state.value += 1; }
      break;
    case 4:
      runtime.operations.push(`InitBattlerHealthboxCoords(${battlerId.value})`);
      runtime.operations.push(`DummyBattleInterfaceFunc(${runtime.gHealthboxSpriteIds[battlerId.value]}, ${runtime.gBattlerPositions[battlerId.value] > 1})`);
      battlerId.value += 1;
      if (battlerId.value === runtime.gBattlersCount) { battlerId.value = 0; state.value += 1; }
      break;
    case 5:
      if (getBattlerSide(runtime, battlerId.value) === B_SIDE_PLAYER) {
        if (!(runtime.gBattleTypeFlags & BATTLE_TYPE_SAFARI)) runtime.operations.push(`UpdateHealthboxAttribute(player, ${battlerId.value})`);
      } else runtime.operations.push(`UpdateHealthboxAttribute(enemy, ${battlerId.value})`);
      runtime.operations.push(`SetHealthboxSpriteInvisible(${runtime.gHealthboxSpriteIds[battlerId.value]})`);
      battlerId.value += 1;
      if (battlerId.value === runtime.gBattlersCount) { battlerId.value = 0; state.value += 1; }
      break;
    case 6:
      loadAndCreateEnemyShadowSprites(runtime);
      runtime.operations.push('BufferBattlePartyCurrentOrder');
      retVal = true;
      break;
  }
  return retVal;
};

export const clearSpritesHealthboxAnimData = (runtime: BattleGfxRuntime): void => {
  data(runtime).healthBoxesData = Array.from({ length: MAX_BATTLERS_COUNT }, () => ({ statusAnimActive: 0, animFromTableActive: 0, specialAnimActive: 0, soundTimer: 0, matrixNum: 0, shadowSpriteId: 0 }));
  data(runtime).animationData = { animArg: 0 };
};

export const clearSpritesBattlerHealthboxAnimData = (runtime: BattleGfxRuntime): void => {
  clearSpritesHealthboxAnimData(runtime);
  data(runtime).battlerData = Array.from({ length: MAX_BATTLERS_COUNT }, () => ({ behindSubstitute: 0, transformSpecies: SPECIES_NONE, invisible: false, lowHpSong: 0 }));
};

export const copyAllBattleSpritesInvisibilities = (runtime: BattleGfxRuntime): void => {
  for (let i = 0; i < runtime.gBattlersCount; i += 1) copyBattleSpriteInvisibility(runtime, i);
};
export const copyBattleSpriteInvisibility = (runtime: BattleGfxRuntime, battlerId: number): void => {
  data(runtime).battlerData[battlerId].invisible = runtime.gSprites[runtime.gBattlerSpriteIds[battlerId]].invisible;
};

export const handleSpeciesGfxDataChange = (runtime: BattleGfxRuntime, battlerAtk: number, battlerDef: number, transformType: number): void => {
  if (transformType === 255) {
    const targetSpecies = runtime.enemyParty[runtime.gBattlerPartyIndexes[battlerAtk]]?.species ?? SPECIES_NONE;
    runtime.operations.push(`GhostUnveil(${battlerAtk}, species=${targetSpecies})`);
    runtime.gSprites[runtime.gBattlerSpriteIds[battlerAtk]].y = getBattlerSpriteDefaultY(battlerAtk);
    runtime.gSprites[runtime.gBattlerSpriteIds[battlerAtk]].callback = 'StartSpriteAnim';
  } else if (transformType) {
    runtime.operations.push(`StartSpriteAnim(${runtime.gBattlerSpriteIds[battlerAtk]}, ${data(runtime).animationData.animArg})`);
    runtime.operations.push(`LoadCastformPalette(${data(runtime).animationData.animArg})`);
    runtime.gBattleMonForms[battlerAtk] = data(runtime).animationData.animArg;
    if (data(runtime).battlerData[battlerAtk].transformSpecies !== SPECIES_NONE) runtime.operations.push(`BlendPalette(${battlerAtk}, 16, 6, RGB_WHITE)`);
    runtime.gSprites[runtime.gBattlerSpriteIds[battlerAtk]].y = getBattlerSpriteDefaultY(battlerAtk);
  } else {
    const targetParty = getBattlerSide(runtime, battlerDef) === B_SIDE_OPPONENT ? runtime.enemyParty : runtime.playerParty;
    const targetSpecies = targetParty[runtime.gBattlerPartyIndexes[battlerDef]]?.species ?? SPECIES_NONE;
    runtime.operations.push(`TransformMove(${battlerAtk}, targetSpecies=${targetSpecies})`);
    data(runtime).battlerData[battlerAtk].transformSpecies = targetSpecies;
    runtime.gBattleMonForms[battlerAtk] = runtime.gBattleMonForms[battlerDef];
    runtime.gSprites[runtime.gBattlerSpriteIds[battlerAtk]].y = getBattlerSpriteDefaultY(battlerAtk);
    runtime.operations.push(`StartSpriteAnim(${runtime.gBattlerSpriteIds[battlerAtk]}, ${runtime.gBattleMonForms[battlerAtk]})`);
  }
};

export const battleLoadSubstituteOrMonSpriteGfx = (runtime: BattleGfxRuntime, battlerId: number, loadMonSprite: boolean): void => {
  if (!loadMonSprite) {
    runtime.operations.push(getBattlerSide(runtime, battlerId) !== B_SIDE_PLAYER ? 'LZDecompressVram(gSubstituteDollFrontGfx)' : 'LZDecompressVram(gSubstituteDollBackGfx)');
    for (let i = 1; i < 4; i += 1) runtime.operations.push(`DmaCopy32Defvars(substitute frame ${i})`);
    runtime.operations.push(`LoadCompressedPalette(gSubstituteDollPal, ${battlerId})`);
  } else if (getBattlerSide(runtime, battlerId) !== B_SIDE_PLAYER) battleLoadOpponentMonSpriteGfx(runtime, runtime.enemyParty[runtime.gBattlerPartyIndexes[battlerId]], battlerId);
  else battleLoadPlayerMonSpriteGfx(runtime, runtime.playerParty[runtime.gBattlerPartyIndexes[battlerId]], battlerId);
};

export const loadBattleMonGfxAndAnimate = (runtime: BattleGfxRuntime, battlerId: number, loadMonSprite: boolean, spriteId: number): void => {
  battleLoadSubstituteOrMonSpriteGfx(runtime, battlerId, loadMonSprite);
  runtime.operations.push(`StartSpriteAnim(${spriteId}, ${runtime.gBattleMonForms[battlerId]})`);
  runtime.gSprites[spriteId].y = loadMonSprite ? getBattlerSpriteDefaultY(battlerId) : getSubstituteSpriteDefaultY(battlerId);
};

export const trySetBehindSubstituteSpriteBit = (runtime: BattleGfxRuntime, battlerId: number, move: number): void => {
  if (move === MOVE_SUBSTITUTE) data(runtime).battlerData[battlerId].behindSubstitute = 1;
};
export const clearBehindSubstituteBit = (runtime: BattleGfxRuntime, battlerId: number): void => { data(runtime).battlerData[battlerId].behindSubstitute = 0; };

export const getHPBarLevel = (hp: number, maxHP: number): number => {
  if (hp === 0) return HP_BAR_RED;
  if (hp * 4 <= maxHP) return HP_BAR_RED;
  if (hp * 2 <= maxHP) return HP_BAR_YELLOW;
  return HP_BAR_GREEN;
};

export const getMonHPBarLevel = (mon: BattleGfxPokemon): number => getHPBarLevel(mon.hp, mon.maxHP);

export const handleLowHpMusicChange = (runtime: BattleGfxRuntime, mon: BattleGfxPokemon, battlerId: number): void => {
  if (getHPBarLevel(mon.hp, mon.maxHP) === HP_BAR_RED) {
    if (!data(runtime).battlerData[battlerId].lowHpSong) {
      if (!data(runtime).battlerData[battlerId ^ BIT_FLANK].lowHpSong) runtime.operations.push(`PlaySE(${SE_LOW_HEALTH})`);
      data(runtime).battlerData[battlerId].lowHpSong = 1;
    }
  } else {
    data(runtime).battlerData[battlerId].lowHpSong = 0;
    if (!runtime.isDoubleBattle || !data(runtime).battlerData[battlerId ^ BIT_FLANK].lowHpSong) runtime.operations.push(`m4aSongNumStop(${SE_LOW_HEALTH})`);
  }
};

export const battleStopLowHpSound = (runtime: BattleGfxRuntime): void => {
  const playerBattler = getBattlerAtPosition(runtime, B_POSITION_PLAYER_LEFT);
  data(runtime).battlerData[playerBattler].lowHpSong = 0;
  if (runtime.isDoubleBattle) data(runtime).battlerData[playerBattler ^ BIT_FLANK].lowHpSong = 0;
  runtime.operations.push(`m4aSongNumStop(${SE_LOW_HEALTH})`);
};

export const handleBattleLowHpMusicChange = (runtime: BattleGfxRuntime): void => {
  if (!runtime.gMain.inBattle) return;
  const b1 = getBattlerAtPosition(runtime, B_POSITION_PLAYER_LEFT);
  const b2 = getBattlerAtPosition(runtime, B_POSITION_PLAYER_RIGHT);
  const p1 = runtime.playerParty[runtime.gBattlerPartyIndexes[b1]];
  const p2 = runtime.playerParty[runtime.gBattlerPartyIndexes[b2]];
  if (p1?.hp !== 0) handleLowHpMusicChange(runtime, p1, b1);
  if (runtime.isDoubleBattle && p2?.hp !== 0) handleLowHpMusicChange(runtime, p2, b2);
};

export const setBattlerSpriteAffineMode = (runtime: BattleGfxRuntime, affineMode: number): void => {
  for (let i = 0; i < runtime.gBattlersCount; i += 1) {
    if (isBattlerSpritePresent(runtime, i)) {
      const sprite = runtime.gSprites[runtime.gBattlerSpriteIds[i]];
      sprite.oam.affineMode = affineMode;
      if (affineMode === ST_OAM_AFFINE_OFF) {
        data(runtime).healthBoxesData[i].matrixNum = sprite.oam.matrixNum;
        sprite.oam.matrixNum = 0;
      } else sprite.oam.matrixNum = data(runtime).healthBoxesData[i].matrixNum;
    }
  }
};

export const loadAndCreateEnemyShadowSprites = (runtime: BattleGfxRuntime): void => {
  runtime.operations.push('LoadCompressedSpriteSheet(gSpriteSheet_EnemyShadow)');
  let battlerId = getBattlerAtPosition(runtime, B_POSITION_OPPONENT_LEFT);
  data(runtime).healthBoxesData[battlerId].shadowSpriteId = createShadowSprite(runtime, battlerId);
  if (runtime.isDoubleBattle) {
    battlerId = getBattlerAtPosition(runtime, B_POSITION_OPPONENT_RIGHT);
    data(runtime).healthBoxesData[battlerId].shadowSpriteId = createShadowSprite(runtime, battlerId);
  }
};

export const spriteCBEnemyShadow = (runtime: BattleGfxRuntime, shadowSprite: BattleGfxSprite): void => {
  let invisible = false;
  const battlerId = shadowSprite.data[0];
  const battlerSprite = runtime.gSprites[runtime.gBattlerSpriteIds[battlerId]];
  if (!battlerSprite.inUse || !isBattlerSpritePresent(runtime, battlerId)) {
    shadowSprite.callback = 'SpriteCB_SetInvisible';
    return;
  }
  if (runtime.gAnimScriptActive || battlerSprite.invisible) invisible = true;
  else if (data(runtime).battlerData[battlerId].transformSpecies !== SPECIES_NONE && (runtime.enemyMonElevation[data(runtime).battlerData[battlerId].transformSpecies] ?? 0) === 0) invisible = true;
  if (data(runtime).battlerData[battlerId].behindSubstitute) invisible = true;
  shadowSprite.x = battlerSprite.x;
  shadowSprite.x2 = battlerSprite.x2;
  shadowSprite.invisible = invisible;
};

export const spriteCBSetInvisible = (sprite: BattleGfxSprite): void => { sprite.invisible = true; };

export const setBattlerShadowSpriteCallback = (runtime: BattleGfxRuntime, battlerId: number, species: number): void => {
  if (getBattlerSide(runtime, battlerId) === B_SIDE_PLAYER) return;
  const shadowId = data(runtime).healthBoxesData[battlerId].shadowSpriteId;
  const actualSpecies = data(runtime).battlerData[battlerId].transformSpecies !== SPECIES_NONE ? data(runtime).battlerData[battlerId].transformSpecies : species;
  runtime.gSprites[shadowId].callback = (runtime.enemyMonElevation[actualSpecies] ?? 0) !== 0 ? 'SpriteCB_EnemyShadow' : 'SpriteCB_SetInvisible';
};

export const hideBattlerShadowSprite = (runtime: BattleGfxRuntime, battlerId: number): void => {
  runtime.gSprites[data(runtime).healthBoxesData[battlerId].shadowSpriteId].callback = 'SpriteCB_SetInvisible';
};

export const battleInterfaceSetWindowPals = (runtime: BattleGfxRuntime): void => {
  runtime.vram240 = runtime.vram240.map((value) => setZeroNibbles(value, 0xf));
  runtime.vram600 = runtime.vram600.map((value) => setZeroNibbles(value, 0x6));
};

export const clearTemporarySpeciesSpriteData = (runtime: BattleGfxRuntime, battlerId: number, dontClearSubstitute: boolean): void => {
  data(runtime).battlerData[battlerId].transformSpecies = SPECIES_NONE;
  runtime.gBattleMonForms[battlerId] = 0;
  if (!dontClearSubstitute) clearBehindSubstituteBit(runtime, battlerId);
};

export const allocateMonSpritesGfx = (runtime: BattleGfxRuntime): void => {
  runtime.operations.push('AllocZeroed(gMonSpritesGfxPtr)');
  runtime.operations.push('AllocZeroed(firstDecompressed=0x8000)');
  for (let i = 0; i < MAX_BATTLERS_COUNT; i += 1) {
    runtime.operations.push(`InitMonSpriteTemplate(${i})`);
    for (let j = 0; j < 4; j += 1) runtime.operations.push(`InitMonSpriteImage(${i}, ${j}, size=0x800)`);
  }
  runtime.operations.push('AllocZeroed(barFontGfx=0x1000)');
};

export const freeMonSpritesGfx = (runtime: BattleGfxRuntime): void => {
  runtime.operations.push('FREE_AND_SET_NULL(multiUseBuffer)');
  runtime.operations.push('FREE_AND_SET_NULL(field_178)');
  runtime.operations.push('FREE_AND_SET_NULL(barFontGfx)');
  runtime.operations.push('FREE_AND_SET_NULL(firstDecompressed)');
  runtime.operations.push('sprites[0..3]=NULL');
  runtime.operations.push('FREE_AND_SET_NULL(gMonSpritesGfxPtr)');
};

export const shouldPlayNormalMonCry = (mon: BattleGfxPokemon): boolean => {
  if ((mon.status & (STATUS1_ANY | STATUS1_TOXIC_COUNTER)) !== 0) return false;
  if (getHPBarLevel(mon.hp, mon.maxHP) <= HP_BAR_YELLOW) return false;
  return true;
};

export const AllocateBattleSpritesData = allocateBattleSpritesData;
export const FreeBattleSpritesData = freeBattleSpritesData;
export const SpriteCB_WaitForBattlerBallReleaseAnim = spriteCBWaitForBattlerBallReleaseAnim;
export const DoBattleSpriteAffineAnim = doBattleSpriteAffineAnim;
export const SpriteCB_TrainerSlideIn = spriteCBTrainerSlideIn;
export const InitAndLaunchChosenStatusAnimation = initAndLaunchChosenStatusAnimation;
export const TryHandleLaunchBattleTableAnimation = tryHandleLaunchBattleTableAnimation;
export const Task_ClearBitWhenBattleTableAnimDone = taskClearBitWhenBattleTableAnimDone;
export const ShouldAnimBeDoneRegardlessOfSubsitute = shouldAnimBeDoneRegardlessOfSubstitute;
export const InitAndLaunchSpecialAnimation = initAndLaunchSpecialAnimation;
export const Task_ClearBitWhenSpecialAnimDone = taskClearBitWhenSpecialAnimDone;
export const IsMoveWithoutAnimation = isMoveWithoutAnimation;
export const IsBattleSEPlaying = isBattleSEPlaying;
export const BattleLoadOpponentMonSpriteGfx = battleLoadOpponentMonSpriteGfx;
export const BattleLoadPlayerMonSpriteGfx = battleLoadPlayerMonSpriteGfx;
export const DecompressGhostFrontPic = decompressGhostFrontPic;
export const DecompressTrainerFrontPic = decompressTrainerFrontPic;
export const DecompressTrainerBackPalette = decompressTrainerBackPalette;
export const BattleGfxSfxDummy3 = battleGfxSfxDummy3;
export const FreeTrainerFrontPicPaletteAndTile = freeTrainerFrontPicPaletteAndTile;
export const BattleLoadAllHealthBoxesGfxAtOnce = battleLoadAllHealthBoxesGfxAtOnce;
export const BattleLoadAllHealthBoxesGfx = battleLoadAllHealthBoxesGfx;
export const LoadBattleBarGfx = loadBattleBarGfx;
export const BattleInitAllSprites = battleInitAllSprites;
export const ClearSpritesHealthboxAnimData = clearSpritesHealthboxAnimData;
export const ClearSpritesBattlerHealthboxAnimData = clearSpritesBattlerHealthboxAnimData;
export const CopyAllBattleSpritesInvisibilities = copyAllBattleSpritesInvisibilities;
export const CopyBattleSpriteInvisibility = copyBattleSpriteInvisibility;
export const HandleSpeciesGfxDataChange = handleSpeciesGfxDataChange;
export const BattleLoadSubstituteOrMonSpriteGfx = battleLoadSubstituteOrMonSpriteGfx;
export const LoadBattleMonGfxAndAnimate = loadBattleMonGfxAndAnimate;
export const TrySetBehindSubstituteSpriteBit = trySetBehindSubstituteSpriteBit;
export const ClearBehindSubstituteBit = clearBehindSubstituteBit;
export const HandleLowHpMusicChange = handleLowHpMusicChange;
export const BattleStopLowHpSound = battleStopLowHpSound;
export const GetMonHPBarLevel = getMonHPBarLevel;
export const HandleBattleLowHpMusicChange = handleBattleLowHpMusicChange;
export const SetBattlerSpriteAffineMode = setBattlerSpriteAffineMode;
export const LoadAndCreateEnemyShadowSprites = loadAndCreateEnemyShadowSprites;
export const SpriteCB_EnemyShadow = spriteCBEnemyShadow;
export const SpriteCB_SetInvisible = spriteCBSetInvisible;
export const SetBattlerShadowSpriteCallback = setBattlerShadowSpriteCallback;
export const HideBattlerShadowSprite = hideBattlerShadowSprite;
export const BattleInterfaceSetWindowPals = battleInterfaceSetWindowPals;
export const ClearTemporarySpeciesSpriteData = clearTemporarySpeciesSpriteData;
export const AllocateMonSpritesGfx = allocateMonSpritesGfx;
export const FreeMonSpritesGfx = freeMonSpritesGfx;
export const ShouldPlayNormalMonCry = shouldPlayNormalMonCry;

const createTask = (runtime: BattleGfxRuntime, func: string): number => {
  const id = runtime.tasks.length;
  runtime.tasks.push({ func, data: Array.from({ length: 16 }, () => 0), destroyed: false });
  return id;
};
const getBattlerPosition = (runtime: BattleGfxRuntime, battlerId: number): number => runtime.gBattlerPositions[battlerId];
const getBattlerSide = (runtime: BattleGfxRuntime, battlerId: number): number => runtime.battlerSides[battlerId];
const getBattlerAtPosition = (runtime: BattleGfxRuntime, position: number): number => runtime.battlerAtPosition[position];
const isBattlerSpritePresent = (runtime: BattleGfxRuntime, battlerId: number): boolean => runtime.battlerSpritePresent[battlerId];
const getBattlerSpriteDefaultY = (battlerId: number): number => 40 + battlerId;
const getSubstituteSpriteDefaultY = (battlerId: number): number => 80 + battlerId;
const createBattlerHealthboxSprites = (runtime: BattleGfxRuntime, battlerId: number): number => { runtime.operations.push(`CreateBattlerHealthboxSprites(${battlerId})`); return 20 + battlerId; };
const createSafariPlayerHealthboxSprites = (runtime: BattleGfxRuntime): number => { runtime.operations.push('CreateSafariPlayerHealthboxSprites'); return 19; };
const createShadowSprite = (runtime: BattleGfxRuntime, battlerId: number): number => {
  const id = runtime.nextSpriteId++;
  runtime.gSprites[id] = makeSprite();
  runtime.gSprites[id].data[0] = battlerId;
  runtime.operations.push(`CreateSprite(gSpriteTemplate_EnemyShadow, battler=${battlerId})`);
  return id;
};
const setZeroNibbles = (value: number, replacement: number): number => {
  let out = value & 0xffff;
  for (let shift = 0; shift <= 12; shift += 4) {
    if ((out & (0xf << shift)) === 0) out |= replacement << shift;
  }
  return out & 0xffff;
};
