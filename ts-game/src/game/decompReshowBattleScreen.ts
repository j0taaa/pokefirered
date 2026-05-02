export const B_POSITION_PLAYER_LEFT = 0;
export const B_POSITION_OPPONENT_LEFT = 1;
export const B_POSITION_PLAYER_RIGHT = 2;
export const B_POSITION_OPPONENT_RIGHT = 3;
export const B_SIDE_PLAYER = 0;
export const B_SIDE_OPPONENT = 1;

export const BATTLE_TYPE_DOUBLE = 1 << 0;
export const BATTLE_TYPE_LINK = 1 << 1;
export const BATTLE_TYPE_TRAINER = 1 << 3;
export const BATTLE_TYPE_SAFARI = 1 << 7;
export const BATTLE_TYPE_OLD_MAN_TUTORIAL = 1 << 9;
export const BATTLE_TYPE_GHOST_UNVEILED = 1 << 13;
export const BATTLE_TYPE_GHOST = 1 << 15;

export const HELPCONTEXT_WILD_BATTLE = 23;
export const HELPCONTEXT_TRAINER_BATTLE_SINGLE = 24;
export const HELPCONTEXT_TRAINER_BATTLE_DOUBLE = 25;
export const HELPCONTEXT_SAFARI_BATTLE = 26;

export const MON_DATA_SPECIES = 'MON_DATA_SPECIES';
export const MON_DATA_HP = 'MON_DATA_HP';
export const HEALTHBOX_ALL = 'HEALTHBOX_ALL';
export const HEALTHBOX_SAFARI_ALL_TEXT = 'HEALTHBOX_SAFARI_ALL_TEXT';
export const TRAINER_BACK_PIC_OLD_MAN = 5;

export interface ReshowPokemon {
  species: number;
  hp: number;
  heldItem?: number;
}

export interface ReshowSprite {
  oam: { paletteNum: number };
  callback: string | null;
  data: number[];
  invisible: boolean;
  anim: number | null;
}

export interface ReshowBattleRuntime {
  paletteFade: { bufferTransferDisabled: number };
  battleScripting: { reshowMainState: number; reshowHelperState: number };
  battleTypeFlags: number;
  battlersCount: number;
  battlerInMenuId: number;
  actionSelectionCursor: Record<number, number>;
  battlerPartyIndexes: Record<number, number>;
  battlerPositions: Record<number, number>;
  battlerSides: Record<number, number>;
  battlerSpriteIds: Record<number, number>;
  healthboxSpriteIds: Record<number, number>;
  battleMonForms: Record<number, number>;
  battleSpritesData: { battlerData: Record<number, { behindSubstitute: boolean; invisible: boolean }> };
  enemyParty: ReshowPokemon[];
  playerParty: ReshowPokemon[];
  playerGender: number;
  wirelessCommType: number;
  receivedRemoteLinkPlayers: number;
  reservedSpritePaletteCount: number;
  sprites: ReshowSprite[];
  nextSpriteId: number;
  nextHealthboxSpriteId: number;
  healthboxGfxReadyAfter: number;
  logs: string[];
  helpContextLog: number[];
  mainCallback2: string | null;
  vblankCallback: string | null;
  hblankCallback: string | null;
  gpuRegs: Record<string, number>;
  bgAttributes: Array<{ bg: number; attr: string; value: number }>;
  bgShown: number[];
  createdBattlerSprites: Array<{ battler: number; kind: string; spriteId: number; x: number; y: number; subpriority: number }>;
  createdHealthboxes: Array<{ battler: number; kind: string; healthboxSpriteId: number }>;
  healthboxUpdates: Array<{ healthboxSpriteId: number; battler: number; side: number; attr: string }>;
  invisibleHealthboxes: number[];
  dummyBattleInterfaceCalls: Array<{ healthboxSpriteId: number; rightSide: boolean }>;
  shadowCallbacks: Array<{ battler: number; species: number }>;
  loadedSpriteGfx: Array<{ battler: number; kind: string }>;
}

export const createReshowBattleRuntime = (): ReshowBattleRuntime => ({
  paletteFade: { bufferTransferDisabled: 0 },
  battleScripting: { reshowMainState: 0, reshowHelperState: 0 },
  battleTypeFlags: 0,
  battlersCount: 4,
  battlerInMenuId: 0,
  actionSelectionCursor: { 0: 0, 1: 0, 2: 0, 3: 0 },
  battlerPartyIndexes: { 0: 0, 1: 0, 2: 1, 3: 1 },
  battlerPositions: {
    0: B_POSITION_PLAYER_LEFT,
    1: B_POSITION_OPPONENT_LEFT,
    2: B_POSITION_PLAYER_RIGHT,
    3: B_POSITION_OPPONENT_RIGHT
  },
  battlerSides: {
    0: B_SIDE_PLAYER,
    1: B_SIDE_OPPONENT,
    2: B_SIDE_PLAYER,
    3: B_SIDE_OPPONENT
  },
  battlerSpriteIds: {},
  healthboxSpriteIds: {},
  battleMonForms: { 0: 0, 1: 0, 2: 0, 3: 0 },
  battleSpritesData: {
    battlerData: {
      0: { behindSubstitute: false, invisible: false },
      1: { behindSubstitute: false, invisible: false },
      2: { behindSubstitute: false, invisible: false },
      3: { behindSubstitute: false, invisible: false }
    }
  },
  enemyParty: [
    { species: 25, hp: 10 },
    { species: 26, hp: 10 }
  ],
  playerParty: [
    { species: 1, hp: 10 },
    { species: 4, hp: 10 }
  ],
  playerGender: 0,
  wirelessCommType: 0,
  receivedRemoteLinkPlayers: 0,
  reservedSpritePaletteCount: 0,
  sprites: [],
  nextSpriteId: 0,
  nextHealthboxSpriteId: 100,
  healthboxGfxReadyAfter: 0,
  logs: [],
  helpContextLog: [],
  mainCallback2: null,
  vblankCallback: null,
  hblankCallback: null,
  gpuRegs: {},
  bgAttributes: [],
  bgShown: [],
  createdBattlerSprites: [],
  createdHealthboxes: [],
  healthboxUpdates: [],
  invisibleHealthboxes: [],
  dummyBattleInterfaceCalls: [],
  shadowCallbacks: [],
  loadedSpriteGfx: []
});

export const isBattleTypeGhostWithoutScope = (flags: number): boolean =>
  (flags & BATTLE_TYPE_GHOST) !== 0 && (flags & BATTLE_TYPE_GHOST_UNVEILED) === 0;

export const reshowBattleScreenDummy = (): void => {};

export function ReshowBattleScreenDummy(): void {
  reshowBattleScreenDummy();
}

export const reshowBattleScreenAfterMenu = (runtime: ReshowBattleRuntime): void => {
  runtime.paletteFade.bufferTransferDisabled = 1;
  runtime.hblankCallback = null;
  runtime.gpuRegs.MOSAIC = 0;
  runtime.battleScripting.reshowMainState = 0;
  runtime.battleScripting.reshowHelperState = 0;
  if (!(runtime.battleTypeFlags & BATTLE_TYPE_LINK)) {
    if (runtime.battleTypeFlags & BATTLE_TYPE_TRAINER) {
      if (runtime.battleTypeFlags & BATTLE_TYPE_DOUBLE) {
        setHelpContext(runtime, HELPCONTEXT_TRAINER_BATTLE_DOUBLE);
      } else {
        setHelpContext(runtime, HELPCONTEXT_TRAINER_BATTLE_SINGLE);
      }
    } else if (runtime.battleTypeFlags & BATTLE_TYPE_SAFARI) {
      setHelpContext(runtime, HELPCONTEXT_SAFARI_BATTLE);
    } else {
      setHelpContext(runtime, HELPCONTEXT_WILD_BATTLE);
    }
  }
  setMainCallback2(runtime, 'CB2_ReshowBattleScreenAfterMenu');
};

export function ReshowBattleScreenAfterMenu(runtime: ReshowBattleRuntime): void {
  reshowBattleScreenAfterMenu(runtime);
}

export const cb2ReshowBattleScreenAfterMenu = (runtime: ReshowBattleRuntime): void => {
  let opponentBattler: number;
  let species: number;

  switch (runtime.battleScripting.reshowMainState) {
    case 0:
      resetSpriteData(runtime);
      break;
    case 1:
      setVBlankCallback(runtime, null);
      scanlineEffectClear(runtime);
      battleInitBgsAndWindows(runtime);
      setBgAttribute(runtime, 1, 'BG_ATTR_CHARBASEINDEX', 0);
      setBgAttribute(runtime, 2, 'BG_ATTR_CHARBASEINDEX', 0);
      showBg(runtime, 0);
      showBg(runtime, 1);
      showBg(runtime, 2);
      showBg(runtime, 3);
      resetPaletteFade(runtime);
      runtime.gpuRegs.BG0_X = 0;
      runtime.gpuRegs.BG0_Y = 0;
      runtime.gpuRegs.BG1_X = 0;
      runtime.gpuRegs.BG1_Y = 0;
      runtime.gpuRegs.BG2_X = 0;
      runtime.gpuRegs.BG2_Y = 0;
      runtime.gpuRegs.BG3_X = 0;
      runtime.gpuRegs.BG3_Y = 0;
      break;
    case 2:
      runtime.logs.push('CpuFastFill:VRAM');
      break;
    case 3:
      runtime.logs.push('LoadBattleTextboxAndBackground');
      break;
    case 4:
      runtime.logs.push('FreeAllSpritePalettes');
      runtime.reservedSpritePaletteCount = 4;
      break;
    case 5:
      runtime.logs.push('ClearSpritesHealthboxAnimData');
      break;
    case 6:
      if (battleLoadAllHealthBoxesGfx(runtime, runtime.battleScripting.reshowHelperState)) {
        runtime.battleScripting.reshowHelperState = 0;
      } else {
        runtime.battleScripting.reshowHelperState += 1;
        runtime.battleScripting.reshowMainState -= 1;
      }
      break;
    case 7:
      if (!loadBattlerSpriteGfx(runtime, 0)) {
        runtime.battleScripting.reshowMainState -= 1;
      }
      break;
    case 8:
      if (!loadBattlerSpriteGfx(runtime, 1)) {
        runtime.battleScripting.reshowMainState -= 1;
      }
      break;
    case 9:
      if (!loadBattlerSpriteGfx(runtime, 2)) {
        runtime.battleScripting.reshowMainState -= 1;
      }
      break;
    case 10:
      if (!loadBattlerSpriteGfx(runtime, 3)) {
        runtime.battleScripting.reshowMainState -= 1;
      }
      break;
    case 11:
      createBattlerSprite(runtime, 0);
      break;
    case 12:
      createBattlerSprite(runtime, 1);
      break;
    case 13:
      createBattlerSprite(runtime, 2);
      break;
    case 14:
      createBattlerSprite(runtime, 3);
      break;
    case 15:
      createHealthboxSprite(runtime, 0);
      break;
    case 16:
      createHealthboxSprite(runtime, 1);
      break;
    case 17:
      createHealthboxSprite(runtime, 2);
      break;
    case 18:
      createHealthboxSprite(runtime, 3);
      break;
    case 19:
      runtime.logs.push('LoadAndCreateEnemyShadowSprites');
      opponentBattler = getBattlerAtPosition(runtime, B_POSITION_OPPONENT_LEFT);
      species = getMonData(enemyMon(runtime, opponentBattler), MON_DATA_SPECIES);
      setBattlerShadowSpriteCallback(runtime, opponentBattler, species);
      if (isDoubleBattle(runtime)) {
        opponentBattler = getBattlerAtPosition(runtime, B_POSITION_OPPONENT_RIGHT);
        species = getMonData(enemyMon(runtime, opponentBattler), MON_DATA_SPECIES);
        setBattlerShadowSpriteCallback(runtime, opponentBattler, species);
      }
      runtime.logs.push(`ActionSelectionCreateCursorAt:${runtime.actionSelectionCursor[runtime.battlerInMenuId] ?? 0}:0`);
      if (runtime.wirelessCommType && runtime.receivedRemoteLinkPlayers) {
        runtime.logs.push('LoadWirelessStatusIndicatorSpriteGfx');
        runtime.logs.push('CreateWirelessStatusIndicatorSprite:0:0');
      }
      break;
    case 20:
      setVBlankCallback(runtime, 'VBlankCB_Battle');
      reshowBattleScreenTurnOnDisplay(runtime);
      runtime.logs.push('BeginHardwarePaletteFade:255:0:16:0:1');
      runtime.paletteFade.bufferTransferDisabled = 0;
      setMainCallback2(runtime, 'BattleMainCB2');
      runtime.logs.push('BattleInterfaceSetWindowPals');
      break;
    default:
      break;
  }
  runtime.battleScripting.reshowMainState += 1;
};

export function CB2_ReshowBattleScreenAfterMenu(runtime: ReshowBattleRuntime): void {
  cb2ReshowBattleScreenAfterMenu(runtime);
}

export const reshowBattleScreenTurnOnDisplay = (runtime: ReshowBattleRuntime): void => {
  runtime.logs.push('EnableInterrupts:INTR_FLAG_VBLANK');
  runtime.gpuRegs.BLDCNT = 0;
  runtime.gpuRegs.BLDALPHA = 0;
  runtime.gpuRegs.BLDY = 0;
  runtime.gpuRegs.WININ = 0x3f;
  runtime.gpuRegs.WINOUT = 0x3f;
  runtime.gpuRegs.WIN0H = 0;
  runtime.gpuRegs.WIN0V = 0;
  runtime.gpuRegs.WIN1H = 0;
  runtime.gpuRegs.WIN1V = 0;
  runtime.gpuRegs.DISPCNT_BITS = 0x7040;
};

export function ReshowBattleScreen_TurnOnDisplay(runtime: ReshowBattleRuntime): void {
  reshowBattleScreenTurnOnDisplay(runtime);
}

export const loadBattlerSpriteGfx = (
  runtime: ReshowBattleRuntime,
  battler: number
): boolean => {
  if (battler < runtime.battlersCount) {
    if (getBattlerSide(runtime, battler) !== B_SIDE_PLAYER) {
      if (isBattleTypeGhostWithoutScope(runtime.battleTypeFlags)) {
        runtime.loadedSpriteGfx.push({ battler, kind: 'DecompressGhostFrontPic' });
      } else if (!runtime.battleSpritesData.battlerData[battler].behindSubstitute) {
        runtime.loadedSpriteGfx.push({ battler, kind: 'BattleLoadOpponentMonSpriteGfx' });
      } else {
        runtime.loadedSpriteGfx.push({ battler, kind: 'BattleLoadSubstituteOrMonSpriteGfx:false' });
      }
    } else if ((runtime.battleTypeFlags & BATTLE_TYPE_SAFARI) && battler === B_POSITION_PLAYER_LEFT) {
      runtime.loadedSpriteGfx.push({ battler, kind: `DecompressTrainerBackPalette:${runtime.playerGender}` });
    } else if (
      (runtime.battleTypeFlags & BATTLE_TYPE_OLD_MAN_TUTORIAL) &&
      battler === B_POSITION_PLAYER_LEFT
    ) {
      runtime.loadedSpriteGfx.push({ battler, kind: `DecompressTrainerBackPalette:${TRAINER_BACK_PIC_OLD_MAN}` });
    } else if (!runtime.battleSpritesData.battlerData[battler].behindSubstitute) {
      runtime.loadedSpriteGfx.push({ battler, kind: 'BattleLoadPlayerMonSpriteGfx' });
    } else {
      runtime.loadedSpriteGfx.push({ battler, kind: 'BattleLoadSubstituteOrMonSpriteGfx:false' });
    }
    runtime.battleScripting.reshowHelperState = 0;
  }
  return true;
};

export function LoadBattlerSpriteGfx(runtime: ReshowBattleRuntime, battler: number): boolean {
  return loadBattlerSpriteGfx(runtime, battler);
}

export const createBattlerSprite = (
  runtime: ReshowBattleRuntime,
  battler: number
): void => {
  if (battler < runtime.battlersCount) {
    let posY: number;

    if (isBattleTypeGhostWithoutScope(runtime.battleTypeFlags)) {
      posY = getGhostSpriteDefaultY(battler);
    } else if (runtime.battleSpritesData.battlerData[battler].behindSubstitute) {
      posY = getSubstituteSpriteDefaultY(battler);
    } else {
      posY = getBattlerSpriteDefaultY(battler);
    }
    if (getBattlerSide(runtime, battler) !== B_SIDE_PLAYER) {
      if (getMonData(enemyMon(runtime, battler), MON_DATA_HP) === 0) {
        return;
      }
      const spriteId = createSprite(runtime, battler, 'Pokemon', getBattlerSpriteCoord(battler, 'BATTLER_COORD_X_2'), posY, getBattlerSpriteSubpriority(battler));
      runtime.battlerSpriteIds[battler] = spriteId;
      runtime.sprites[spriteId].oam.paletteNum = battler;
      runtime.sprites[spriteId].callback = 'SpriteCallbackDummy';
      runtime.sprites[spriteId].data[0] = battler;
      runtime.sprites[spriteId].data[2] = getMonData(enemyMon(runtime, battler), MON_DATA_SPECIES);
      startSpriteAnim(runtime, spriteId, runtime.battleMonForms[battler] ?? 0);
    } else if ((runtime.battleTypeFlags & BATTLE_TYPE_SAFARI) && battler === B_POSITION_PLAYER_LEFT) {
      const y = (8 - trainerBackPicSize(runtime.playerGender)) * 4 + 80;
      const spriteId = createSprite(runtime, battler, `TrainerBack:${runtime.playerGender}`, 0x50, y, getBattlerSpriteSubpriority(0));
      runtime.battlerSpriteIds[battler] = spriteId;
      runtime.sprites[spriteId].oam.paletteNum = battler;
      runtime.sprites[spriteId].callback = 'SpriteCallbackDummy';
      runtime.sprites[spriteId].data[0] = battler;
    } else if (
      (runtime.battleTypeFlags & BATTLE_TYPE_OLD_MAN_TUTORIAL) &&
      battler === B_POSITION_PLAYER_LEFT
    ) {
      const y = (8 - trainerBackPicSize(TRAINER_BACK_PIC_OLD_MAN)) * 4 + 80;
      const spriteId = createSprite(runtime, battler, 'TrainerBack:5', 0x50, y, getBattlerSpriteSubpriority(0));
      runtime.battlerSpriteIds[battler] = spriteId;
      runtime.sprites[spriteId].oam.paletteNum = battler;
      runtime.sprites[spriteId].callback = 'SpriteCallbackDummy';
      runtime.sprites[spriteId].data[0] = battler;
    } else if (getMonData(playerMon(runtime, battler), MON_DATA_HP) === 0) {
      return;
    } else {
      const spriteId = createSprite(runtime, battler, 'Pokemon', getBattlerSpriteCoord(battler, 'BATTLER_COORD_X_2'), posY, getBattlerSpriteSubpriority(battler));
      runtime.battlerSpriteIds[battler] = spriteId;
      runtime.sprites[spriteId].oam.paletteNum = battler;
      runtime.sprites[spriteId].callback = 'SpriteCallbackDummy';
      runtime.sprites[spriteId].data[0] = battler;
      runtime.sprites[spriteId].data[2] = getMonData(playerMon(runtime, battler), MON_DATA_SPECIES);
      startSpriteAnim(runtime, spriteId, runtime.battleMonForms[battler] ?? 0);
    }
    runtime.sprites[runtime.battlerSpriteIds[battler]].invisible =
      runtime.battleSpritesData.battlerData[battler].invisible;
  }
};

export function CreateBattlerSprite(runtime: ReshowBattleRuntime, battler: number): void {
  createBattlerSprite(runtime, battler);
}

export const createHealthboxSprite = (
  runtime: ReshowBattleRuntime,
  battler: number
): void => {
  if (battler < runtime.battlersCount) {
    let healthboxSpriteId: number;

    if ((runtime.battleTypeFlags & BATTLE_TYPE_SAFARI) && battler === B_POSITION_PLAYER_LEFT) {
      healthboxSpriteId = createSafariPlayerHealthboxSprites(runtime, battler);
    } else if (
      (runtime.battleTypeFlags & BATTLE_TYPE_OLD_MAN_TUTORIAL) &&
      battler === B_POSITION_PLAYER_LEFT
    ) {
      return;
    } else {
      healthboxSpriteId = createBattlerHealthboxSprites(runtime, battler);
    }
    runtime.healthboxSpriteIds[battler] = healthboxSpriteId;
    runtime.logs.push(`InitBattlerHealthboxCoords:${battler}`);
    runtime.logs.push(`SetHealthboxSpriteVisible:${healthboxSpriteId}`);
    if (getBattlerSide(runtime, battler) !== B_SIDE_PLAYER) {
      updateHealthboxAttribute(runtime, healthboxSpriteId, battler, B_SIDE_OPPONENT, HEALTHBOX_ALL);
    } else if (runtime.battleTypeFlags & BATTLE_TYPE_SAFARI) {
      updateHealthboxAttribute(runtime, healthboxSpriteId, battler, B_SIDE_PLAYER, HEALTHBOX_SAFARI_ALL_TEXT);
    } else {
      updateHealthboxAttribute(runtime, healthboxSpriteId, battler, B_SIDE_PLAYER, HEALTHBOX_ALL);
    }
    if (
      getBattlerPosition(runtime, battler) === B_POSITION_OPPONENT_RIGHT ||
      getBattlerPosition(runtime, battler) === B_POSITION_PLAYER_RIGHT
    ) {
      dummyBattleInterfaceFunc(runtime, healthboxSpriteId, true);
    } else {
      dummyBattleInterfaceFunc(runtime, healthboxSpriteId, false);
    }
    if (getBattlerSide(runtime, battler) !== B_SIDE_PLAYER) {
      if (getMonData(enemyMon(runtime, battler), MON_DATA_HP) === 0) {
        setHealthboxSpriteInvisible(runtime, healthboxSpriteId);
      }
    } else if (
      !(runtime.battleTypeFlags & BATTLE_TYPE_SAFARI) &&
      getMonData(playerMon(runtime, battler), MON_DATA_HP) === 0
    ) {
      setHealthboxSpriteInvisible(runtime, healthboxSpriteId);
    }
  }
};

export function CreateHealthboxSprite(runtime: ReshowBattleRuntime, battler: number): void {
  createHealthboxSprite(runtime, battler);
}

const setHelpContext = (runtime: ReshowBattleRuntime, context: number): void => {
  runtime.helpContextLog.push(context);
};

const setMainCallback2 = (runtime: ReshowBattleRuntime, callback: string): void => {
  runtime.mainCallback2 = callback;
};

const setVBlankCallback = (runtime: ReshowBattleRuntime, callback: string | null): void => {
  runtime.vblankCallback = callback;
};

const resetSpriteData = (runtime: ReshowBattleRuntime): void => {
  runtime.logs.push('ResetSpriteData');
};

const scanlineEffectClear = (runtime: ReshowBattleRuntime): void => {
  runtime.logs.push('ScanlineEffect_Clear');
};

const battleInitBgsAndWindows = (runtime: ReshowBattleRuntime): void => {
  runtime.logs.push('BattleInitBgsAndWindows');
};

const setBgAttribute = (
  runtime: ReshowBattleRuntime,
  bg: number,
  attr: string,
  value: number
): void => {
  runtime.bgAttributes.push({ bg, attr, value });
};

const showBg = (runtime: ReshowBattleRuntime, bg: number): void => {
  runtime.bgShown.push(bg);
};

const resetPaletteFade = (runtime: ReshowBattleRuntime): void => {
  runtime.logs.push('ResetPaletteFade');
};

const battleLoadAllHealthBoxesGfx = (
  runtime: ReshowBattleRuntime,
  helperState: number
): boolean => {
  runtime.logs.push(`BattleLoadAllHealthBoxesGfx:${helperState}`);
  return helperState >= runtime.healthboxGfxReadyAfter;
};

const getBattlerSide = (runtime: ReshowBattleRuntime, battler: number): number =>
  runtime.battlerSides[battler] ?? B_SIDE_PLAYER;

const getBattlerPosition = (runtime: ReshowBattleRuntime, battler: number): number =>
  runtime.battlerPositions[battler] ?? battler;

const getBattlerAtPosition = (runtime: ReshowBattleRuntime, position: number): number => {
  for (const [battler, battlerPosition] of Object.entries(runtime.battlerPositions)) {
    if (battlerPosition === position) {
      return Number(battler);
    }
  }
  return position;
};

const isDoubleBattle = (runtime: ReshowBattleRuntime): boolean =>
  (runtime.battleTypeFlags & BATTLE_TYPE_DOUBLE) !== 0;

const enemyMon = (runtime: ReshowBattleRuntime, battler: number): ReshowPokemon =>
  runtime.enemyParty[runtime.battlerPartyIndexes[battler] ?? 0] ?? { species: 0, hp: 0 };

const playerMon = (runtime: ReshowBattleRuntime, battler: number): ReshowPokemon =>
  runtime.playerParty[runtime.battlerPartyIndexes[battler] ?? 0] ?? { species: 0, hp: 0 };

const getMonData = (mon: ReshowPokemon, attr: string): number => {
  if (attr === MON_DATA_HP) {
    return mon.hp;
  }
  return mon.species;
};

const getGhostSpriteDefaultY = (battler: number): number => 50 + battler;
const getSubstituteSpriteDefaultY = (battler: number): number => 60 + battler;
const getBattlerSpriteDefaultY = (battler: number): number => 70 + battler;
const getBattlerSpriteCoord = (battler: number, coord: string): number =>
  coord === 'BATTLER_COORD_X_2' ? 40 + battler * 32 : 80 + battler * 8;
const getBattlerSpriteSubpriority = (battler: number): number => battler;
const trainerBackPicSize = (_trainerPic: number): number => 8;

const createSprite = (
  runtime: ReshowBattleRuntime,
  battler: number,
  kind: string,
  x: number,
  y: number,
  subpriority: number
): number => {
  const spriteId = runtime.nextSpriteId++;
  runtime.sprites[spriteId] = {
    oam: { paletteNum: 0 },
    callback: null,
    data: Array.from({ length: 8 }, () => 0),
    invisible: false,
    anim: null
  };
  runtime.createdBattlerSprites.push({ battler, kind, spriteId, x, y, subpriority });
  return spriteId;
};

const startSpriteAnim = (
  runtime: ReshowBattleRuntime,
  spriteId: number,
  anim: number
): void => {
  runtime.sprites[spriteId].anim = anim;
};

const createSafariPlayerHealthboxSprites = (
  runtime: ReshowBattleRuntime,
  battler: number
): number => {
  const healthboxSpriteId = runtime.nextHealthboxSpriteId++;
  runtime.createdHealthboxes.push({ battler, kind: 'CreateSafariPlayerHealthboxSprites', healthboxSpriteId });
  return healthboxSpriteId;
};

const createBattlerHealthboxSprites = (
  runtime: ReshowBattleRuntime,
  battler: number
): number => {
  const healthboxSpriteId = runtime.nextHealthboxSpriteId++;
  runtime.createdHealthboxes.push({ battler, kind: 'CreateBattlerHealthboxSprites', healthboxSpriteId });
  return healthboxSpriteId;
};

const updateHealthboxAttribute = (
  runtime: ReshowBattleRuntime,
  healthboxSpriteId: number,
  battler: number,
  side: number,
  attr: string
): void => {
  runtime.healthboxUpdates.push({ healthboxSpriteId, battler, side, attr });
};

const dummyBattleInterfaceFunc = (
  runtime: ReshowBattleRuntime,
  healthboxSpriteId: number,
  rightSide: boolean
): void => {
  runtime.dummyBattleInterfaceCalls.push({ healthboxSpriteId, rightSide });
};

const setHealthboxSpriteInvisible = (
  runtime: ReshowBattleRuntime,
  healthboxSpriteId: number
): void => {
  runtime.invisibleHealthboxes.push(healthboxSpriteId);
};

const setBattlerShadowSpriteCallback = (
  runtime: ReshowBattleRuntime,
  battler: number,
  species: number
): void => {
  runtime.shadowCallbacks.push({ battler, species });
};
