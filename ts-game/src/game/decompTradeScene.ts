export const TRADE_PLAYER = 0;
export const TRADE_PARTNER = 1;
export const PARTY_SIZE = 6;
export const DISPLAY_WIDTH = 240;
export const DISPLAY_HEIGHT = 160;
export const SPECIES_NONE = 0;
export const SPECIES_EGG = 412;
export const ITEM_NONE = 0;
export const MAIL_NONE = 0xffff;
export const STATUS_NONE = 0;
export const STATUS_READY = 1;
export const STATUS_CANCEL = 2;
export const LINKCMD_READY_FINISH_TRADE = 0x4411;
export const LINKCMD_CONFIRM_FINISH_TRADE = 0x4412;
export const FLAG_SYS_RIBBON_GET = 'FLAG_SYS_RIBBON_GET';
export const MON_DATA_CHAMPION_RIBBON = 0;
export const MON_DATA_UNUSED_RIBBONS = 12;
export const METLOC_IN_GAME_TRADE = 0xfe;
export const STATE_START = 0;
export const STATE_MON_SLIDE_IN = 1;
export const STATE_SEND_MSG = 10;
export const STATE_BYE_BYE = 11;
export const STATE_POKEBALL_DEPART = 12;
export const STATE_END_LINK_TRADE = 70;
export const STATE_TRY_EVOLUTION = 71;

export type TradeSceneSpriteCallback =
  | 'SpriteCB_LinkMonGlow'
  | 'SpriteCB_LinkMonGlowWireless'
  | 'SpriteCB_LinkMonShadow'
  | 'SpriteCB_CableEndSending'
  | 'SpriteCB_CableEndReceiving'
  | 'SpriteCB_GbaScreen'
  | 'SpriteCB_BouncingPokeball'
  | 'SpriteCB_BouncingPokeballDepart'
  | 'SpriteCB_BouncingPokeballDepartEnd'
  | 'SpriteCB_BouncingPokeballArrive'
  | 'SpriteCallbackDummy'
  | string;

export interface TradeSceneSprite {
  id: number;
  x: number;
  y: number;
  x2: number;
  y2: number;
  data: number[];
  invisible: boolean;
  destroyed: boolean;
  callback: TradeSceneSpriteCallback;
  paletteNum: number;
  affineAnim: number;
  matrixFreed: boolean;
}

export interface TradeSceneMon {
  species: number;
  speciesOrEgg: number;
  personality: number;
  nickname: string;
  isEgg: boolean;
  level: number;
  mail: number;
  friendship: number;
  heldItem: number;
  otName: string;
  otGender: number;
  abilityNum: number;
  ivs: number[];
  conditions: number[];
  sheen: number;
  metLocation: number;
  ribbons: number[];
  statsCalculated: boolean;
}

export interface InGameTrade {
  nickname: string;
  species: number;
  ivs: number[];
  abilityNum: number;
  otId: number;
  conditions: number[];
  personality: number;
  heldItem: number;
  mailNum: number;
  otName: string;
  otGender: number;
  sheen: number;
  requestedSpecies: number;
}

export interface TradeSceneMail {
  words: number[];
  playerName: string;
  trainerId: number[];
  species: number;
  itemId: number;
}

export interface TradeSceneTask {
  id: number;
  data: number[];
  destroyed: boolean;
}

export interface TradeSceneAnim {
  timer: number;
  state: number;
  isLinkTrade: boolean;
  isCableTrade: boolean;
  playerFinishStatus: number;
  partnerFinishStatus: number;
  scheduleLinkTransfer: number;
  linkData: number[];
  linkTimeoutTimer: number;
  linkTimeoutCheck1: number;
  linkTimeoutCheck2: number;
  monSpriteIds: number[];
  monSpecies: number[];
  monPersonalities: number[];
  connectionSpriteIds: number[];
  cableEndSpriteId: number;
  releasePokeballSpriteId: number;
  bouncingPokeballSpriteId: number;
  bg1vofs: number;
  bg1hofs: number;
  bg2vofs: number;
  bg2hofs: number;
  bg2texX: number;
  bg2texY: number;
  bg2srcX: number;
  bg2srcY: number;
  sXY: number;
  bg2alpha: number;
  bg2Zoom: number;
  cachedMapMusic: number;
  questLogData: { speciesSent: number; speciesReceived: number; partnerName: string };
  textColor: number[];
  win0left: number;
  win0right: number;
  win0top: number;
  win0bottom: number;
}

export interface TradeSceneRuntime {
  tradeAnim: TradeSceneAnim | null;
  sprites: TradeSceneSprite[];
  tasks: TradeSceneTask[];
  mainState: number;
  mainCallback2: string | null;
  savedCallback: string | null;
  fieldCallback: string | null;
  paletteFadeActive: boolean;
  receivedRemoteLinkPlayers: boolean;
  multiplayerId: number;
  linkTaskFinished: boolean;
  linkMaster: boolean;
  linkPlayerCount: number;
  savedPlayerCount: number;
  linkPlayerDataExchangeComplete: boolean;
  blockReceivedStatus: number;
  blockRecvBuffer: number[][];
  resetBlockReceivedFlags: number[];
  selectedTradeMonPositions: number[];
  playerParty: TradeSceneMon[];
  enemyParty: TradeSceneMon[];
  saveMail: Array<TradeSceneMail | null>;
  linkPartnerMail: TradeSceneMail[];
  inGameTrades: InGameTrade[];
  inGameTradeMailMessages: number[][];
  linkPlayers: Array<{ name: string; trainerId?: number }>;
  speciesNames: string[];
  specialVar8004: number;
  specialVar8005: number;
  stringVar1: string;
  stringVar2: string;
  stringVar3: string;
  stringVar4: string;
  gpuRegs: Record<string, number>;
  operations: string[];
  sentBlocks: Array<{ bitmask: number; data: number[]; size: number }>;
  loadedPalettes: Array<{ name: string; offset: number; size: number }>;
  flags: Set<string>;
  softResetDisabled: boolean;
  wirelessCommType: number;
  linkErrorOccurred: boolean;
  currentMapMusic: number;
  bgmStopped: boolean;
  evolutionTargetSpecies: number;
  inUnionRoom: boolean;
  gameStats: Record<string, number>;
}

export const sTradeBallVerticalVelocityTable = [
  0, 0, 1, 0, 1, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4,
  -4, -4, -4, -3, -3, -3, -3, -2, -2, -2, -2, -1, -1, -1, -1, 0, -1, 0,
  -1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3,
  4, 4, 4, 4, -4, -3, -3, -2, -2, -1, -1, -1, 0, -1, 0, 0, 0, 0, 0, 0,
  1, 0, 1, 1, 1, 2, 2, 3, 3, 4, -4, -3, -2, -1, -1, -1, 0, 0, 0, 0,
  1, 0, 1, 1, 2, 3
] as const;

export const sWirelessSignalAnimParams = [
  [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 2], [6, 2], [7, 2],
  [8, 2], [9, 2], [10, 3], [11, 3], [12, 3], [13, 4], [14, 5], [15, 2],
  [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 2], [6, 2], [7, 2],
  [8, 2], [9, 2], [10, 3], [11, 3], [12, 3], [13, 4], [14, 5], [16, 1],
  [16, -1]
] as const;

export const createTradeSceneMon = (overrides: Partial<TradeSceneMon> = {}): TradeSceneMon => ({
  species: 1,
  speciesOrEgg: 1,
  personality: 0,
  nickname: 'MON',
  isEgg: false,
  level: 5,
  mail: MAIL_NONE,
  friendship: 0,
  heldItem: ITEM_NONE,
  otName: '',
  otGender: 0,
  abilityNum: 0,
  ivs: [0, 0, 0, 0, 0, 0],
  conditions: [0, 0, 0, 0, 0],
  sheen: 0,
  metLocation: 0,
  ribbons: Array.from({ length: MON_DATA_UNUSED_RIBBONS - MON_DATA_CHAMPION_RIBBON }, () => 0),
  statsCalculated: false,
  ...overrides
});

export const createTradeSceneSprite = (overrides: Partial<TradeSceneSprite> = {}): TradeSceneSprite => ({
  id: 0,
  x: 0,
  y: 0,
  x2: 0,
  y2: 0,
  data: Array.from({ length: 8 }, () => 0),
  invisible: false,
  destroyed: false,
  callback: 'SpriteCallbackDummy',
  paletteNum: 0,
  affineAnim: 0,
  matrixFreed: false,
  ...overrides
});

export const createTradeSceneAnim = (overrides: Partial<TradeSceneAnim> = {}): TradeSceneAnim => ({
  timer: 0,
  state: 0,
  isLinkTrade: false,
  isCableTrade: false,
  playerFinishStatus: STATUS_NONE,
  partnerFinishStatus: STATUS_NONE,
  scheduleLinkTransfer: 0,
  linkData: Array.from({ length: 20 }, () => 0),
  linkTimeoutTimer: 0,
  linkTimeoutCheck1: 0,
  linkTimeoutCheck2: 0,
  monSpriteIds: [0, 1],
  monSpecies: [SPECIES_NONE, SPECIES_NONE],
  monPersonalities: [0, 0],
  connectionSpriteIds: [],
  cableEndSpriteId: -1,
  releasePokeballSpriteId: -1,
  bouncingPokeballSpriteId: -1,
  bg1vofs: 0,
  bg1hofs: 0,
  bg2vofs: 0,
  bg2hofs: 0,
  bg2texX: 64,
  bg2texY: 64,
  bg2srcX: DISPLAY_WIDTH / 2,
  bg2srcY: DISPLAY_HEIGHT / 2,
  sXY: 256,
  bg2alpha: 0,
  bg2Zoom: 0,
  cachedMapMusic: 0,
  questLogData: { speciesSent: 0, speciesReceived: 0, partnerName: '' },
  textColor: [0, 0, 0],
  win0left: 0,
  win0right: 0,
  win0top: 0,
  win0bottom: 0,
  ...overrides
});

export const createTradeSceneRuntime = (overrides: Partial<TradeSceneRuntime> = {}): TradeSceneRuntime => ({
  tradeAnim: overrides.tradeAnim ?? createTradeSceneAnim(),
  sprites: overrides.sprites ?? [createTradeSceneSprite({ id: 0 }), createTradeSceneSprite({ id: 1 })],
  tasks: overrides.tasks ?? [],
  mainState: overrides.mainState ?? 0,
  mainCallback2: overrides.mainCallback2 ?? null,
  savedCallback: overrides.savedCallback ?? null,
  fieldCallback: overrides.fieldCallback ?? null,
  paletteFadeActive: overrides.paletteFadeActive ?? false,
  receivedRemoteLinkPlayers: overrides.receivedRemoteLinkPlayers ?? true,
  multiplayerId: overrides.multiplayerId ?? 0,
  linkTaskFinished: overrides.linkTaskFinished ?? true,
  linkMaster: overrides.linkMaster ?? true,
  linkPlayerCount: overrides.linkPlayerCount ?? 2,
  savedPlayerCount: overrides.savedPlayerCount ?? 2,
  linkPlayerDataExchangeComplete: overrides.linkPlayerDataExchangeComplete ?? true,
  blockReceivedStatus: overrides.blockReceivedStatus ?? 0,
  blockRecvBuffer: overrides.blockRecvBuffer ?? [[], []],
  resetBlockReceivedFlags: overrides.resetBlockReceivedFlags ?? [],
  selectedTradeMonPositions: overrides.selectedTradeMonPositions ?? [0, 0],
  playerParty: overrides.playerParty ?? Array.from({ length: PARTY_SIZE }, (_, i) => createTradeSceneMon({ species: i + 1, speciesOrEgg: i + 1, nickname: `P${i}` })),
  enemyParty: overrides.enemyParty ?? Array.from({ length: PARTY_SIZE }, (_, i) => createTradeSceneMon({ species: i + 11, speciesOrEgg: i + 11, nickname: `E${i}` })),
  saveMail: overrides.saveMail ?? Array.from({ length: PARTY_SIZE }, () => null),
  linkPartnerMail: overrides.linkPartnerMail ?? [],
  inGameTrades: overrides.inGameTrades ?? [],
  inGameTradeMailMessages: overrides.inGameTradeMailMessages ?? [],
  linkPlayers: overrides.linkPlayers ?? [{ name: 'PLAYER' }, { name: 'PARTNER' }],
  speciesNames: overrides.speciesNames ?? [],
  specialVar8004: overrides.specialVar8004 ?? 0,
  specialVar8005: overrides.specialVar8005 ?? 0,
  stringVar1: overrides.stringVar1 ?? '',
  stringVar2: overrides.stringVar2 ?? '',
  stringVar3: overrides.stringVar3 ?? '',
  stringVar4: overrides.stringVar4 ?? '',
  gpuRegs: overrides.gpuRegs ?? {},
  operations: overrides.operations ?? [],
  sentBlocks: overrides.sentBlocks ?? [],
  loadedPalettes: overrides.loadedPalettes ?? [],
  flags: overrides.flags ?? new Set<string>(),
  softResetDisabled: overrides.softResetDisabled ?? false,
  wirelessCommType: overrides.wirelessCommType ?? 0,
  linkErrorOccurred: overrides.linkErrorOccurred ?? false,
  currentMapMusic: overrides.currentMapMusic ?? 0,
  bgmStopped: overrides.bgmStopped ?? true,
  evolutionTargetSpecies: overrides.evolutionTargetSpecies ?? SPECIES_NONE,
  inUnionRoom: overrides.inUnionRoom ?? false,
  gameStats: overrides.gameStats ?? {}
});

const requireAnim = (runtime: TradeSceneRuntime): TradeSceneAnim => {
  if (!runtime.tradeAnim)
    runtime.tradeAnim = createTradeSceneAnim();
  return runtime.tradeAnim;
};

const createSprite = (runtime: TradeSceneRuntime, overrides: Partial<TradeSceneSprite>): number => {
  const id = runtime.sprites.length;
  runtime.sprites.push(createTradeSceneSprite({ id, ...overrides }));
  return id;
};

const sendBlock = (runtime: TradeSceneRuntime, data: number[], size = data.length): void => {
  runtime.sentBlocks.push({ bitmask: 0xffffffff, data: [...data], size });
};

const setMainCallback2 = (runtime: TradeSceneRuntime, callback: string): void => {
  runtime.mainCallback2 = callback;
};

export const SpriteCB_LinkMonGlow = (runtime: TradeSceneRuntime, sprite: TradeSceneSprite): void => {
  if (++sprite.data[0] === 10) {
    runtime.operations.push('PlaySE:SE_BALL');
    sprite.data[0] = 0;
  }
};

export const SpriteCB_LinkMonGlowWireless = (runtime: TradeSceneRuntime, sprite: TradeSceneSprite): void => {
  if (!sprite.invisible && ++sprite.data[0] === 10) {
    runtime.operations.push('PlaySE:SE_M_SWAGGER2');
    sprite.data[0] = 0;
  }
};

export const SpriteCB_LinkMonShadow = (runtime: TradeSceneRuntime, sprite: TradeSceneSprite): void => {
  if (sprite.data[1] === 0) {
    if (++sprite.data[0] === 12)
      sprite.data[0] = 0;
    runtime.loadedPalettes.push({ name: `sLinkMonShadow_Pal[${sprite.data[0]}]`, offset: sprite.paletteNum * 16 + 4, size: 1 });
  }
};

export const SpriteCB_CableEndSending = (_runtime: TradeSceneRuntime, sprite: TradeSceneSprite): void => {
  sprite.data[0]++;
  sprite.y2++;
  if (sprite.data[0] === 10)
    sprite.destroyed = true;
};

export const SpriteCB_CableEndReceiving = (_runtime: TradeSceneRuntime, sprite: TradeSceneSprite): void => {
  sprite.data[0]++;
  sprite.y2--;
  if (sprite.data[0] === 10)
    sprite.destroyed = true;
};

export const SpriteCB_GbaScreen = (runtime: TradeSceneRuntime, sprite: TradeSceneSprite): void => {
  if (++sprite.data[0] === 15) {
    runtime.operations.push('PlaySE:SE_M_MINIMIZE');
    sprite.data[0] = 0;
  }
};

export const SetTradeBGAffine = (runtime: TradeSceneRuntime): void => {
  const anim = requireAnim(runtime);
  runtime.gpuRegs.REG_OFFSET_BG2PA = anim.sXY;
  runtime.gpuRegs.REG_OFFSET_BG2PB = anim.bg2alpha;
  runtime.gpuRegs.REG_OFFSET_BG2PC = -anim.bg2alpha;
  runtime.gpuRegs.REG_OFFSET_BG2PD = anim.sXY;
  runtime.gpuRegs.REG_OFFSET_BG2X = anim.bg2texX * 0x100 - anim.bg2srcX * anim.sXY;
  runtime.gpuRegs.REG_OFFSET_BG2Y = anim.bg2texY * 0x100 - anim.bg2srcY * anim.sXY;
};

export const SetTradeGpuRegs = (runtime: TradeSceneRuntime): void => {
  const anim = requireAnim(runtime);
  runtime.gpuRegs.REG_OFFSET_BG1VOFS = anim.bg1vofs;
  runtime.gpuRegs.REG_OFFSET_BG1HOFS = anim.bg1hofs;
  if ((runtime.gpuRegs.REG_OFFSET_DISPCNT & 7) === 0) {
    runtime.gpuRegs.REG_OFFSET_BG2VOFS = anim.bg2vofs;
    runtime.gpuRegs.REG_OFFSET_BG2HOFS = anim.bg2hofs;
  } else {
    SetTradeBGAffine(runtime);
  }
};

export const VBlankCB_TradeAnim = (runtime: TradeSceneRuntime): void => {
  SetTradeGpuRegs(runtime);
  runtime.operations.push('LoadOam', 'ProcessSpriteCopyRequests', 'TransferPlttBuffer');
};

export const ClearLinkTimeoutTimer = (runtime: TradeSceneRuntime): void => {
  const anim = requireAnim(runtime);
  anim.linkTimeoutTimer = 0;
  anim.linkTimeoutCheck1 = 0;
  anim.linkTimeoutCheck2 = 0;
};

export const CheckLinkTimeout = (runtime: TradeSceneRuntime): void => {
  const anim = requireAnim(runtime);
  if (anim.linkTimeoutCheck1 === anim.linkTimeoutCheck2)
    anim.linkTimeoutTimer++;
  else
    anim.linkTimeoutTimer = 0;
  if (anim.linkTimeoutTimer > 300) {
    runtime.operations.push('CloseLink');
    setMainCallback2(runtime, 'CB2_LinkError');
    anim.linkTimeoutTimer = 0;
    anim.linkTimeoutCheck1 = 0;
    anim.linkTimeoutCheck2 = 0;
  }
  anim.linkTimeoutCheck2 = anim.linkTimeoutCheck1;
};

export const TradeGetMultiplayerId = (runtime: TradeSceneRuntime): number =>
  runtime.receivedRemoteLinkPlayers ? runtime.multiplayerId : 0;

export const LoadTradeMonPic = (runtime: TradeSceneRuntime, whichParty: number, state: number): void => {
  const anim = requireAnim(runtime);
  const partyIndex = whichParty === TRADE_PLAYER
    ? runtime.selectedTradeMonPositions[TRADE_PLAYER]
    : runtime.selectedTradeMonPositions[TRADE_PARTNER] % PARTY_SIZE;
  const mon = whichParty === TRADE_PLAYER ? runtime.playerParty[partyIndex] : runtime.enemyParty[partyIndex];
  if (state === 0) {
    anim.monSpecies[whichParty] = mon.speciesOrEgg;
    anim.monPersonalities[whichParty] = mon.personality;
    runtime.operations.push(`LoadTradeMonPic:gfx:${whichParty}:${mon.speciesOrEgg}:${mon.personality}`);
  } else if (state === 1) {
    anim.monSpriteIds[whichParty] = createSprite(runtime, { x: 120, y: 60, invisible: true, callback: 'SpriteCallbackDummy' });
  }
};

export const CB2_LinkTrade = (runtime: TradeSceneRuntime): void => {
  const anim = requireAnim(runtime);
  switch (runtime.mainState) {
    case 0:
      if (!runtime.receivedRemoteLinkPlayers)
        runtime.operations.push('CloseLink');
      runtime.tradeAnim = createTradeSceneAnim({ isLinkTrade: true });
      TradeAnimInit_LoadGfx(runtime);
      ClearLinkTimeoutTimer(runtime);
      runtime.mainState++;
      break;
    case 1:
      if (!runtime.receivedRemoteLinkPlayers) {
        requireAnim(runtime).isCableTrade = true;
        runtime.operations.push('OpenLink');
        runtime.mainState++;
      } else {
        runtime.mainState = 4;
      }
      break;
    case 2:
      if (++anim.timer > 60) {
        anim.timer = 0;
        runtime.mainState++;
      }
      break;
    case 3:
      if (runtime.linkMaster) {
        if (runtime.linkPlayerCount >= runtime.savedPlayerCount) {
          if (++anim.timer > 30)
            runtime.mainState++;
        } else {
          CheckLinkTimeout(runtime);
        }
      } else {
        runtime.mainState++;
      }
      break;
    case 4:
      CheckLinkTimeout(runtime);
      if (runtime.receivedRemoteLinkPlayers && runtime.linkPlayerDataExchangeComplete)
        runtime.mainState++;
      break;
    case 5:
      anim.playerFinishStatus = STATUS_NONE;
      anim.partnerFinishStatus = STATUS_NONE;
      anim.scheduleLinkTransfer = 0;
      LoadTradeMonPic(runtime, TRADE_PLAYER, 0);
      runtime.mainState++;
      break;
    case 6:
      LoadTradeMonPic(runtime, TRADE_PLAYER, 1);
      runtime.mainState++;
      break;
    case 7:
      LoadTradeMonPic(runtime, TRADE_PARTNER, 0);
      runtime.mainState++;
      break;
    case 8:
      LoadTradeMonPic(runtime, TRADE_PARTNER, 1);
      LinkTradeDrawWindow(runtime);
      runtime.mainState++;
      break;
    case 9:
      LoadTradeGbaSpriteGfx(runtime);
      runtime.operations.push('LoadSpriteSheet:sPokeBallSpriteSheet', 'LoadSpritePalette:sTradeBallSpritePal');
      runtime.mainState++;
      break;
    case 10:
      anim.questLogData.speciesSent = runtime.playerParty[runtime.selectedTradeMonPositions[TRADE_PLAYER]].speciesOrEgg;
      anim.questLogData.speciesReceived = runtime.enemyParty[runtime.selectedTradeMonPositions[TRADE_PARTNER] % PARTY_SIZE].speciesOrEgg;
      anim.questLogData.partnerName = runtime.linkPlayers[TradeGetMultiplayerId(runtime) ^ 1]?.name ?? '';
      runtime.paletteFadeActive = true;
      runtime.mainState++;
      break;
    case 11:
      InitTradeSequenceBgGpuRegs(runtime);
      TradeBufferOTnameAndNicknames(runtime);
      runtime.mainState++;
      break;
    case 12:
      if (!runtime.paletteFadeActive) {
        if (runtime.wirelessCommType !== 0)
          runtime.operations.push('CreateWirelessStatusIndicatorSprite');
        setMainCallback2(runtime, 'CB2_UpdateLinkTrade');
      }
      break;
  }
};

export const InitTradeSequenceBgGpuRegs = (runtime: TradeSceneRuntime): void => {
  SetTradeSequenceBgGpuRegs(runtime, 5);
  SetTradeSequenceBgGpuRegs(runtime, 0);
};

export const LinkTradeDrawWindow = (runtime: TradeSceneRuntime): void => {
  runtime.operations.push('FillWindowPixelBuffer:0:15', 'PutWindowTilemap:0', 'CopyWindowToVram:0:COPYWIN_FULL');
};

export const TradeAnimInit_LoadGfx = (runtime: TradeSceneRuntime): void => {
  runtime.gpuRegs.REG_OFFSET_DISPCNT = 0;
  runtime.operations.push('ResetBgsAndClearDma3BusyFlags', 'InitBgsFromTemplates', 'InitWindows');
};

export const CB2_InitInGameTrade = (runtime: TradeSceneRuntime): void => {
  switch (runtime.mainState) {
    case 0:
      runtime.selectedTradeMonPositions[TRADE_PLAYER] = runtime.specialVar8005;
      runtime.selectedTradeMonPositions[TRADE_PARTNER] = PARTY_SIZE;
      runtime.tradeAnim = createTradeSceneAnim({ isLinkTrade: false });
      TradeAnimInit_LoadGfx(runtime);
      runtime.mainState = 5;
      break;
    case 5:
      LoadTradeMonPic(runtime, TRADE_PLAYER, 0);
      runtime.mainState++;
      break;
    case 6:
      LoadTradeMonPic(runtime, TRADE_PLAYER, 1);
      runtime.mainState++;
      break;
    case 7:
      LoadTradeMonPic(runtime, TRADE_PARTNER, 0);
      runtime.mainState++;
      break;
    case 8:
      LoadTradeMonPic(runtime, TRADE_PARTNER, 1);
      LinkTradeDrawWindow(runtime);
      runtime.mainState++;
      break;
    case 9:
      LoadTradeGbaSpriteGfx(runtime);
      runtime.operations.push('LoadSpriteSheet:sPokeBallSpriteSheet', 'LoadSpritePalette:sTradeBallSpritePal');
      runtime.mainState++;
      break;
    case 10:
      runtime.mainState++;
      break;
    case 11:
      SetTradeSequenceBgGpuRegs(runtime, 5);
      SetTradeSequenceBgGpuRegs(runtime, 0);
      TradeBufferOTnameAndNicknames(runtime);
      runtime.mainState++;
      break;
    case 12:
      setMainCallback2(runtime, 'CB2_InGameTrade');
      break;
  }
};

export const UpdatePokedexForReceivedMon = (runtime: TradeSceneRuntime, partyIdx: number): void => {
  const mon = runtime.playerParty[partyIdx];
  if (!mon.isEgg)
    runtime.operations.push(`PokedexSeen:${mon.species}:${mon.personality}`, `PokedexCaught:${mon.species}:${mon.personality}`);
};

export const TryEnableNationalDexFromLinkPartner = (runtime: TradeSceneRuntime): void => {
  TradeGetMultiplayerId(runtime);
};

export const TradeMons = (runtime: TradeSceneRuntime, playerPartyIdx: number, partnerPartyIdx: number): void => {
  const playerMail = runtime.playerParty[playerPartyIdx].mail;
  const partnerMail = runtime.enemyParty[partnerPartyIdx].mail;
  if (playerMail !== MAIL_NONE)
    runtime.saveMail[playerMail] = null;
  const temp = runtime.playerParty[playerPartyIdx];
  runtime.playerParty[playerPartyIdx] = runtime.enemyParty[partnerPartyIdx];
  runtime.enemyParty[partnerPartyIdx] = temp;
  if (!runtime.playerParty[playerPartyIdx].isEgg)
    runtime.playerParty[playerPartyIdx].friendship = 70;
  if (partnerMail !== MAIL_NONE && runtime.linkPartnerMail[partnerMail])
    runtime.playerParty[playerPartyIdx].mail = partnerMail;
  UpdatePokedexForReceivedMon(runtime, playerPartyIdx);
  if (runtime.receivedRemoteLinkPlayers)
    TryEnableNationalDexFromLinkPartner(runtime);
};

export const HandleLinkDataSend = (runtime: TradeSceneRuntime): void => {
  const anim = requireAnim(runtime);
  switch (anim.scheduleLinkTransfer) {
    case 1:
      if (runtime.linkTaskFinished) {
        sendBlock(runtime, anim.linkData, anim.linkData.length);
        anim.scheduleLinkTransfer++;
      }
      anim.scheduleLinkTransfer = 0;
      break;
    case 2:
      anim.scheduleLinkTransfer = 0;
      break;
  }
};

export const CB2_InGameTrade = (runtime: TradeSceneRuntime): void => {
  DoTradeAnim(runtime);
};

export const SetTradeSequenceBgGpuRegs = (runtime: TradeSceneRuntime, state: number): void => {
  const anim = requireAnim(runtime);
  runtime.operations.push(`SetTradeSequenceBgGpuRegs:${state}`);
  switch (state) {
    case 0:
      anim.bg2vofs = 0;
      anim.bg2hofs = 0xb4;
      runtime.gpuRegs.REG_OFFSET_DISPCNT = 0;
      runtime.gpuRegs.REG_OFFSET_BG2CNT = 2;
      break;
    case 1:
      anim.bg1hofs = 0;
      anim.bg1vofs = 0x15c;
      runtime.gpuRegs.REG_OFFSET_BG1VOFS = 0x15c;
      break;
    case 2:
      anim.bg1vofs = 0;
      anim.bg1hofs = 0;
      runtime.gpuRegs.REG_OFFSET_DISPCNT = 1;
      break;
    case 3:
      anim.bg2vofs = 0x50;
      runtime.gpuRegs.REG_OFFSET_DISPCNT = 0;
      break;
    case 4:
      runtime.gpuRegs.REG_OFFSET_DISPCNT = 1;
      anim.bg2texX = 0x40;
      anim.bg2texY = 0x5c;
      anim.sXY = 0x20;
      anim.bg2Zoom = 0x400;
      anim.bg2alpha = 0;
      break;
    case 5:
      anim.bg1vofs = 0;
      anim.bg1hofs = 0;
      break;
    case 6:
      runtime.gpuRegs.REG_OFFSET_DISPCNT = 1;
      anim.bg2texX = 0x40;
      anim.bg2texY = 0x5c;
      anim.sXY = 0x100;
      anim.bg2Zoom = 0x80;
      anim.bg2srcX = 0x78;
      anim.bg2srcY = 0x50;
      anim.bg2alpha = 0;
      break;
    case 7:
      anim.bg2vofs = 0;
      anim.bg2hofs = 0;
      runtime.gpuRegs.REG_OFFSET_BLDCNT = 0;
      break;
  }
};

export const LoadTradeGbaSpriteGfx = (runtime: TradeSceneRuntime): void => {
  runtime.operations.push(
    'LoadSpriteSheet:sSpriteSheet_LinkMonGlow',
    'LoadSpriteSheet:sSpriteSheet_LinkMonShadow',
    'LoadSpriteSheet:sSpriteSheet_CableEnd',
    'LoadSpriteSheet:sTradeGBAScreenSpriteSheet',
    'LoadSpritePalette:sSpritePalette_LinkMon',
    'LoadSpritePalette:sSpritePalette_Gba'
  );
};

export const TradeBufferOTnameAndNicknames = (runtime: TradeSceneRuntime): void => {
  const anim = requireAnim(runtime);
  if (anim.isLinkTrade) {
    const mpId = TradeGetMultiplayerId(runtime);
    runtime.stringVar1 = runtime.linkPlayers[mpId ^ 1]?.name ?? '';
    runtime.stringVar3 = runtime.enemyParty[runtime.selectedTradeMonPositions[TRADE_PARTNER] % PARTY_SIZE]?.nickname ?? '';
    runtime.stringVar2 = runtime.playerParty[runtime.selectedTradeMonPositions[TRADE_PLAYER]]?.nickname ?? '';
  } else {
    const inGameTrade = runtime.inGameTrades[runtime.specialVar8004];
    runtime.stringVar1 = inGameTrade?.otName ?? '';
    runtime.stringVar3 = inGameTrade?.nickname ?? '';
    runtime.stringVar2 = runtime.playerParty[runtime.specialVar8005]?.nickname ?? '';
  }
};

export const DoTradeAnim = (runtime: TradeSceneRuntime): boolean =>
  requireAnim(runtime).isCableTrade ? DoTradeAnim_Cable(runtime) : DoTradeAnim_Wireless(runtime);

export const DoTradeAnim_Cable = (runtime: TradeSceneRuntime): boolean => {
  const anim = requireAnim(runtime);
  switch (anim.state) {
    case STATE_START: {
      const sprite = runtime.sprites[anim.monSpriteIds[TRADE_PLAYER]];
      if (sprite) {
        sprite.invisible = false;
        sprite.x2 = -180;
      }
      anim.cachedMapMusic = runtime.currentMapMusic;
      runtime.operations.push('PlayNewMapMusic:MUS_EVOLUTION');
      anim.state++;
      return false;
    }
    case STATE_MON_SLIDE_IN: {
      const sprite = runtime.sprites[anim.monSpriteIds[TRADE_PLAYER]];
      if (anim.bg2hofs > 0) {
        if (sprite)
          sprite.x2 += 3;
        anim.bg2hofs -= 3;
      } else {
        if (sprite)
          sprite.x2 = 0;
        anim.bg2hofs = 0;
        anim.state = STATE_SEND_MSG;
      }
      return false;
    }
    case STATE_SEND_MSG:
      DrawTextOnTradeWindow(runtime, 0, 'gText_XWillBeSentToY', 0);
      if (anim.monSpecies[TRADE_PLAYER] !== SPECIES_EGG)
        runtime.operations.push(`PlayCry_Normal:${anim.monSpecies[TRADE_PLAYER]}`);
      anim.state = STATE_BYE_BYE;
      anim.timer = 0;
      return false;
    case STATE_BYE_BYE:
      if (++anim.timer === 80) {
        anim.releasePokeballSpriteId = createSprite(runtime, { x: 120, y: 32, callback: 'SpriteCB_BouncingPokeballDepart' });
        DrawTextOnTradeWindow(runtime, 0, 'gText_ByeByeVar1', 0);
        anim.state++;
      }
      return false;
    case STATE_END_LINK_TRADE:
      return true;
    case STATE_TRY_EVOLUTION:
      setMainCallback2(runtime, 'CB2_TryLinkTradeEvolution');
      return false;
    default:
      anim.state++;
      return false;
  }
};

export const DoTradeAnim_Wireless = (runtime: TradeSceneRuntime): boolean => {
  const anim = requireAnim(runtime);
  runtime.operations.push(`DoTradeAnim_Wireless:${anim.state}`);
  return DoTradeAnim_Cable(runtime);
};

export const CB2_TryLinkTradeEvolution = (runtime: TradeSceneRuntime): void => {
  switch (runtime.mainState) {
    case 0:
      runtime.mainState = 4;
      runtime.softResetDisabled = true;
      break;
    case 4:
      if (runtime.evolutionTargetSpecies !== SPECIES_NONE)
        runtime.operations.push(`TradeEvolutionScene:${runtime.evolutionTargetSpecies}`);
      else
        setMainCallback2(runtime, 'CB2_SaveAndEndTrade');
      runtime.selectedTradeMonPositions[TRADE_PLAYER] = 0xff;
      break;
  }
};

export const HandleLinkDataReceive = (runtime: TradeSceneRuntime): void => {
  const anim = requireAnim(runtime);
  TradeGetMultiplayerId(runtime);
  const recvStatus = runtime.blockReceivedStatus;
  if (recvStatus & (1 << 0)) {
    if (runtime.blockRecvBuffer[0]?.[0] === LINKCMD_CONFIRM_FINISH_TRADE)
      setMainCallback2(runtime, 'CB2_TryLinkTradeEvolution');
    if (runtime.blockRecvBuffer[0]?.[0] === LINKCMD_READY_FINISH_TRADE)
      anim.playerFinishStatus = STATUS_READY;
    runtime.resetBlockReceivedFlags.push(0);
  }
  if (recvStatus & (1 << 1)) {
    if (runtime.blockRecvBuffer[1]?.[0] === LINKCMD_READY_FINISH_TRADE)
      anim.partnerFinishStatus = STATUS_READY;
    runtime.resetBlockReceivedFlags.push(1);
  }
};

export const SpriteCB_BouncingPokeball = (_runtime: TradeSceneRuntime, sprite: TradeSceneSprite): void => {
  sprite.y += Math.trunc(sprite.data[0] / 10);
  sprite.data[5] += sprite.data[1];
  sprite.x = Math.trunc(sprite.data[5] / 10);
  if (sprite.y > 76) {
    sprite.y = 76;
    sprite.data[0] = -Math.trunc((sprite.data[0] * sprite.data[2]) / 100);
    sprite.data[3]++;
  }
  if (sprite.x === 120)
    sprite.data[1] = 0;
  sprite.data[0] += sprite.data[4];
  if (sprite.data[3] === 4) {
    sprite.data[7] = 1;
    sprite.callback = 'SpriteCallbackDummy';
  }
};

export const SpriteCB_BouncingPokeballDepart = (runtime: TradeSceneRuntime, sprite: TradeSceneSprite): void => {
  sprite.y2 += sTradeBallVerticalVelocityTable[sprite.data[0]] ?? 0;
  if (sprite.data[0] === 22)
    runtime.operations.push('PlaySE:SE_BALL_BOUNCE_1');
  if (++sprite.data[0] === 44) {
    runtime.operations.push('PlaySE:SE_M_MEGA_KICK', 'BeginNormalPaletteFade:RGB_WHITEALPHA');
    sprite.callback = 'SpriteCB_BouncingPokeballDepartEnd';
    sprite.data[0] = 0;
  }
};

export const SpriteCB_BouncingPokeballDepartEnd = (_runtime: TradeSceneRuntime, sprite: TradeSceneSprite): void => {
  if (sprite.data[1] === 20)
    sprite.affineAnim = 1;
  if (++sprite.data[1] > 20) {
    sprite.y2 -= sTradeBallVerticalVelocityTable[sprite.data[0]] ?? 0;
    if (++sprite.data[0] === 23) {
      sprite.destroyed = true;
    }
  }
};

export const SpriteCB_BouncingPokeballArrive = (runtime: TradeSceneRuntime, sprite: TradeSceneSprite): void => {
  if (sprite.data[2] === 0) {
    sprite.y += 4;
    if (sprite.y > sprite.data[3]) {
      sprite.data[2]++;
      sprite.data[0] = 22;
      runtime.operations.push('PlaySE:SE_BALL_BOUNCE_1');
    }
  } else {
    if (sprite.data[0] === 66)
      runtime.operations.push('PlaySE:SE_BALL_BOUNCE_2');
    if (sprite.data[0] === 92)
      runtime.operations.push('PlaySE:SE_BALL_BOUNCE_3');
    if (sprite.data[0] === 107)
      runtime.operations.push('PlaySE:SE_BALL_BOUNCE_4');
    sprite.y2 += sTradeBallVerticalVelocityTable[sprite.data[0]] ?? 0;
    if (++sprite.data[0] === 108)
      sprite.callback = 'SpriteCallbackDummy';
  }
};

export const GetInGameTradeSpeciesInfo = (runtime: TradeSceneRuntime): number => {
  const inGameTrade = runtime.inGameTrades[runtime.specialVar8004];
  runtime.stringVar1 = runtime.speciesNames[inGameTrade.requestedSpecies] ?? '';
  runtime.stringVar2 = runtime.speciesNames[inGameTrade.species] ?? '';
  return inGameTrade.requestedSpecies;
};

export const BufferInGameTradeMonName = (runtime: TradeSceneRuntime): void => {
  const inGameTrade = runtime.inGameTrades[runtime.specialVar8004];
  runtime.stringVar1 = runtime.playerParty[runtime.specialVar8005].nickname;
  runtime.stringVar2 = runtime.speciesNames[inGameTrade.species] ?? '';
};

export const GetInGameTradeMail = (_runtime: TradeSceneRuntime, inGameTrade: InGameTrade, words: number[] = []): TradeSceneMail => ({
  words: [...words],
  playerName: inGameTrade.otName,
  trainerId: [
    (inGameTrade.otId >> 24) & 0xff,
    (inGameTrade.otId >> 16) & 0xff,
    (inGameTrade.otId >> 8) & 0xff,
    inGameTrade.otId & 0xff
  ],
  species: inGameTrade.species,
  itemId: inGameTrade.heldItem
});

export const CreateInGameTradePokemonInternal = (
  runtime: TradeSceneRuntime,
  playerSlot: number,
  inGameTradeIdx: number
): void => {
  const inGameTrade = runtime.inGameTrades[inGameTradeIdx];
  const playerMon = runtime.playerParty[playerSlot];
  const tradeMon = createTradeSceneMon({
    species: inGameTrade.species,
    speciesOrEgg: inGameTrade.species,
    personality: inGameTrade.personality,
    level: playerMon.level,
    nickname: inGameTrade.nickname,
    otName: inGameTrade.otName,
    otGender: inGameTrade.otGender,
    abilityNum: inGameTrade.abilityNum,
    ivs: [...inGameTrade.ivs],
    conditions: [...inGameTrade.conditions],
    sheen: inGameTrade.sheen,
    metLocation: METLOC_IN_GAME_TRADE,
    heldItem: inGameTrade.heldItem,
    statsCalculated: true
  });
  if (inGameTrade.heldItem !== ITEM_NONE && inGameTrade.mailNum >= 0) {
    const words = runtime.inGameTradeMailMessages[inGameTrade.mailNum] ?? [];
    runtime.linkPartnerMail[0] = GetInGameTradeMail(runtime, inGameTrade, words);
    tradeMon.mail = 0;
  }
  runtime.enemyParty[0] = tradeMon;
};

export const GetTradeSpecies = (runtime: TradeSceneRuntime): number => {
  const mon = runtime.playerParty[runtime.specialVar8005];
  return mon.isEgg ? SPECIES_NONE : mon.species;
};

export const CreateInGameTradePokemon = (runtime: TradeSceneRuntime): void => {
  CreateInGameTradePokemonInternal(runtime, runtime.specialVar8005, runtime.specialVar8004);
};

export const CB2_UpdateLinkTrade = (runtime: TradeSceneRuntime): void => {
  const anim = requireAnim(runtime);
  if (DoTradeAnim(runtime) === true) {
    runtime.sprites[anim.monSpriteIds[TRADE_PLAYER]].destroyed = true;
    runtime.sprites[anim.monSpriteIds[TRADE_PARTNER]].matrixFreed = true;
    TradeMons(runtime, runtime.selectedTradeMonPositions[TRADE_PLAYER], runtime.selectedTradeMonPositions[TRADE_PARTNER] % PARTY_SIZE);
    anim.linkData[0] = LINKCMD_READY_FINISH_TRADE;
    anim.scheduleLinkTransfer = 1;
    setMainCallback2(runtime, 'CB2_WaitTradeComplete');
  }
  HandleLinkDataSend(runtime);
  HandleLinkDataReceive(runtime);
};

export const CB2_WaitTradeComplete = (runtime: TradeSceneRuntime): void => {
  const anim = requireAnim(runtime);
  const mpId = TradeGetMultiplayerId(runtime);
  HandleLinkDataReceive(runtime);
  if (mpId === 0 && anim.playerFinishStatus === STATUS_READY && anim.partnerFinishStatus === STATUS_READY) {
    anim.linkData[0] = LINKCMD_CONFIRM_FINISH_TRADE;
    sendBlock(runtime, anim.linkData, anim.linkData.length);
    anim.playerFinishStatus = STATUS_CANCEL;
    anim.partnerFinishStatus = STATUS_CANCEL;
  }
};

export const CB2_SaveAndEndTrade = (runtime: TradeSceneRuntime): void => {
  const anim = requireAnim(runtime);
  switch (runtime.mainState) {
    case 0:
      runtime.mainState++;
      DrawTextOnTradeWindow(runtime, 0, 'gText_CommunicationStandby5', 0);
      break;
    case 1:
      runtime.operations.push('SetLinkStandbyCallback');
      runtime.mainState = 100;
      anim.timer = 0;
      break;
    case 100:
      if (++anim.timer > 180) {
        runtime.mainState = 101;
        anim.timer = 0;
      }
      if (runtime.linkTaskFinished)
        runtime.mainState = 2;
      break;
    case 101:
      if (runtime.linkTaskFinished)
        runtime.mainState = 2;
      break;
    case 2:
      runtime.mainState = 50;
      DrawTextOnTradeWindow(runtime, 0, 'gText_SavingDontTurnOffThePower2', 0);
      break;
    case 50:
      runtime.operations.push(runtime.inUnionRoom ? 'SetQuestLogEvent:QL_EVENT_LINK_TRADED_UNION' : 'SetQuestLogEvent:QL_EVENT_LINK_TRADED');
      if (!runtime.inUnionRoom)
        runtime.gameStats.GAME_STAT_POKEMON_TRADES = (runtime.gameStats.GAME_STAT_POKEMON_TRADES ?? 0) + 1;
      runtime.operations.push('SetContinueGameWarpStatusToDynamicWarp', 'LinkFullSave_Init');
      runtime.mainState = 52;
      anim.timer = 0;
      break;
    case 52:
      runtime.operations.push('LinkFullSave_WriteSector');
      runtime.mainState = 4;
      break;
    case 4:
      runtime.operations.push('LinkFullSave_ReplaceLastSector');
      runtime.mainState = 40;
      anim.timer = 0;
      break;
    case 40:
      if (++anim.timer > 50) {
        anim.timer = TradeGetMultiplayerId(runtime) === 0 ? 0 : 0;
        runtime.mainState = 41;
      }
      break;
    case 41:
      if (anim.timer === 0) {
        runtime.operations.push('SetLinkStandbyCallback');
        runtime.mainState = 42;
      } else {
        anim.timer--;
      }
      break;
    case 42:
      if (runtime.linkTaskFinished)
        runtime.mainState = 43;
      break;
    case 43:
      runtime.operations.push('SetLinkStandbyCallback');
      runtime.mainState = 44;
      break;
    case 44:
      if (runtime.linkTaskFinished) {
        runtime.operations.push('LinkFullSave_SetLastSectorSignature', 'svc_FinishSave');
        runtime.mainState = 5;
      }
      break;
    case 5:
      if (++anim.timer > 60) {
        runtime.mainState++;
        runtime.operations.push('SetLinkStandbyCallback');
      }
      break;
    case 6:
      if (runtime.linkTaskFinished) {
        runtime.paletteFadeActive = true;
        runtime.mainState++;
      }
      break;
    case 7:
      if (!runtime.paletteFadeActive) {
        runtime.operations.push('FadeOutBGM:3');
        runtime.mainState++;
      }
      break;
    case 8:
      if (runtime.bgmStopped) {
        runtime.operations.push(runtime.wirelessCommType && runtime.savedCallback === 'CB2_StartCreateTradeMenu' ? 'SetLinkStandbyCallback' : 'SetCloseLinkCallback');
        runtime.mainState++;
      }
      break;
    case 9:
      if ((runtime.wirelessCommType && runtime.savedCallback === 'CB2_StartCreateTradeMenu') || !runtime.receivedRemoteLinkPlayers) {
        runtime.softResetDisabled = false;
        setMainCallback2(runtime, 'CB2_FreeTradeAnim');
      }
      break;
  }
};

export const CB2_FreeTradeAnim = (runtime: TradeSceneRuntime): void => {
  if (!runtime.paletteFadeActive) {
    runtime.operations.push('FreeAllWindowBuffers', 'FreeMonSpritesGfx');
    runtime.tradeAnim = null;
    if (runtime.wirelessCommType !== 0)
      runtime.operations.push('DestroyWirelessStatusIndicatorSprite');
    setMainCallback2(runtime, runtime.savedCallback ?? '');
  }
};

export const DoInGameTradeScene = (runtime: TradeSceneRuntime): void => {
  runtime.operations.push('LockPlayerFieldControls', 'BeginNormalPaletteFade:RGB_BLACK', 'HelpSystem_Disable');
  runtime.tasks.push({ id: runtime.tasks.length, data: Array.from({ length: 16 }, () => 0), destroyed: false });
  runtime.paletteFadeActive = true;
};

export const Task_InGameTrade = (runtime: TradeSceneRuntime, taskId: number): void => {
  if (!runtime.paletteFadeActive) {
    setMainCallback2(runtime, 'CB2_InitInGameTrade');
    runtime.fieldCallback = 'FieldCB_ContinueScriptHandleMusic';
    runtime.tasks[taskId].destroyed = true;
  }
};

export const CheckPartnersMonForRibbons = (runtime: TradeSceneRuntime): void => {
  const mon = runtime.enemyParty[runtime.selectedTradeMonPositions[TRADE_PARTNER] % PARTY_SIZE];
  let numRibbons = 0;
  for (let i = 0; i < MON_DATA_UNUSED_RIBBONS - MON_DATA_CHAMPION_RIBBON; i++)
    numRibbons += mon.ribbons[i] ?? 0;
  if (numRibbons !== 0)
    runtime.flags.add(FLAG_SYS_RIBBON_GET);
};

export const LoadTradeAnimGfx = (runtime: TradeSceneRuntime): void => {
  TradeAnimInit_LoadGfx(runtime);
};

export const DrawTextOnTradeWindow = (runtime: TradeSceneRuntime, windowId: number, str: string, speed: number): void => {
  const anim = requireAnim(runtime);
  anim.textColor[0] = 15;
  anim.textColor[1] = 1;
  anim.textColor[2] = 6;
  runtime.stringVar4 = str;
  runtime.operations.push(`DrawTextOnTradeWindow:${windowId}:${speed}:${str}`);
};

export const Task_AnimateWirelessSignal = (runtime: TradeSceneRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  const idx = task.data[0];
  const counter = task.data[1];
  const comingBack = task.data[2] !== 0;
  const [paletteIdx, delay] = sWirelessSignalAnimParams[idx];
  const paletteName = paletteIdx === 16 ? 'sWirelessSignalAnimPals_Off' : comingBack ? 'sWirelessSignalAnimPals_Inbound' : 'sWirelessSignalAnimPals_Outbound';
  runtime.loadedPalettes.push({ name: paletteName, offset: paletteIdx * 16, size: 16 });
  if (paletteIdx === 0 && counter === 0)
    runtime.operations.push('PlaySE:SE_M_HEAL_BELL');
  if (counter === delay) {
    task.data[0]++;
    task.data[1] = 0;
    if (sWirelessSignalAnimParams[task.data[0]][1] === -1)
      task.destroyed = true;
  } else {
    task.data[1]++;
  }
};

export const Task_OpenCenterWhiteColumn = (runtime: TradeSceneRuntime, taskId: number): void => {
  const anim = requireAnim(runtime);
  const task = runtime.tasks[taskId];
  if (task.data[0] === 0) {
    anim.win0left = DISPLAY_WIDTH / 2;
    anim.win0right = DISPLAY_WIDTH / 2;
    anim.win0top = 0;
    anim.win0bottom = DISPLAY_HEIGHT;
    runtime.gpuRegs.REG_OFFSET_DISPCNT = (runtime.gpuRegs.REG_OFFSET_DISPCNT ?? 0) | 0x2000;
  }
  runtime.gpuRegs.REG_OFFSET_WIN0H = (anim.win0left << 8) | anim.win0right;
  runtime.gpuRegs.REG_OFFSET_WIN0V = (anim.win0top << 8) | anim.win0bottom;
  task.data[0]++;
  anim.win0left -= 5;
  anim.win0right += 5;
  if (anim.win0left < 80)
    task.destroyed = true;
};

export const Task_CloseCenterWhiteColumn = (runtime: TradeSceneRuntime, taskId: number): void => {
  const anim = requireAnim(runtime);
  const task = runtime.tasks[taskId];
  if (task.data[0] === 0) {
    anim.win0left = 80;
    anim.win0right = DISPLAY_WIDTH - 80;
  }
  runtime.gpuRegs.REG_OFFSET_WIN0H = (anim.win0left << 8) | anim.win0right;
  runtime.gpuRegs.REG_OFFSET_WIN0V = (anim.win0top << 8) | anim.win0bottom;
  if (anim.win0left !== DISPLAY_WIDTH / 2) {
    task.data[0]++;
    anim.win0left += 5;
    anim.win0right -= 5;
    if (anim.win0left > DISPLAY_WIDTH / 2 - 5)
      runtime.operations.push('BlendPalettes:RGB_WHITEALPHA');
  } else {
    runtime.gpuRegs.REG_OFFSET_DISPCNT = (runtime.gpuRegs.REG_OFFSET_DISPCNT ?? 0) & ~0x2000;
    task.destroyed = true;
  }
};
