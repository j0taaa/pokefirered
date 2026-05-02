export const TRADE_PLAYER = 0;
export const TRADE_PARTNER = 1;

export const PARTY_SIZE = 6;

export const VERSION_SAPPHIRE = 1;
export const VERSION_RUBY = 2;
export const VERSION_EMERALD = 3;
export const VERSION_FIRE_RED = 4;
export const VERSION_LEAF_GREEN = 5;

export const SPECIES_NONE = 0;
export const SPECIES_MEW = 151;
export const KANTO_SPECIES_END = SPECIES_MEW;
export const SPECIES_DEOXYS = 410;
export const SPECIES_EGG = 412;

export const CAN_TRADE_MON = 0;
export const CANT_TRADE_LAST_MON = 1;
export const CANT_TRADE_NATIONAL = 2;
export const CANT_TRADE_EGG_YET = 3;
export const CANT_TRADE_INVALID_MON = 4;
export const CANT_TRADE_PARTNER_EGG_YET = 5;

export const TRADE_BOTH_PLAYERS_READY = 0;
export const TRADE_PLAYER_NOT_READY = 1;
export const TRADE_PARTNER_NOT_READY = 2;

export const STATUS_NONE = 0;
export const STATUS_READY = 1;
export const STATUS_CANCEL = 2;

export const CB_MAIN_MENU = 0;
export const CB_SELECTED_MON = 1;
export const CB_SHOW_MON_SUMMARY = 2;
export const CB_CONFIRM_TRADE_PROMPT = 3;
export const CB_CANCEL_TRADE_PROMPT = 4;
export const CB_READY_WAIT = 5;
export const CB_SET_SELECTED_MONS = 6;
export const CB_PRINT_IS_THIS_OKAY = 7;
export const CB_HANDLE_TRADE_CANCELED = 8;
export const CB_FADE_TO_START_TRADE = 9;
export const CB_WAIT_TO_START_TRADE = 10;
export const CB_INIT_EXIT_CANCELED_TRADE = 11;
export const CB_EXIT_CANCELED_TRADE = 12;
export const CB_START_LINK_TRADE = 13;
export const CB_INIT_CONFIRM_TRADE_PROMPT = 14;
export const CB_UNUSED_CLOSE_MSG = 15;
export const CB_WAIT_TO_START_RFU_TRADE = 16;
export const CB_IDLE = 100;

export const LINKCMD_REQUEST_CANCEL = 0x4400;
export const LINKCMD_READY_TO_TRADE = 0x4401;
export const LINKCMD_INIT_BLOCK = 0xbbbb;
export const LINKCMD_READY_CANCEL_TRADE = 0x4402;
export const LINKCMD_BOTH_CANCEL_TRADE = 0x4403;
export const LINKCMD_PARTNER_CANCEL_TRADE = 0x4404;
export const LINKCMD_SET_MONS_TO_TRADE = 0x4405;
export const LINKCMD_START_TRADE = 0x4406;
export const LINKCMD_PLAYER_CANCEL_TRADE = 0x4407;

export const PLAYER_MON_INVALID = 0;
export const BOTH_MONS_VALID = 1;
export const PARTNER_MON_INVALID = 2;
export const DRAW_SELECTED_FINISH = 5;
export const PARTY_CANCEL = PARTY_SIZE * 2;
export const MENU_B_PRESSED = -1;
export const MENU_NOTHING_CHOSEN = -2;
export const A_BUTTON = 0x0001;
export const B_BUTTON = 0x0002;
export const DPAD_UP = 0x0040;
export const DPAD_DOWN = 0x0080;
export const DPAD_LEFT = 0x0020;
export const DPAD_RIGHT = 0x0010;
export const DIR_UP = 0;
export const DIR_DOWN = 1;
export const DIR_LEFT = 2;
export const DIR_RIGHT = 3;
export const PALETTES_ALL = 0xffffffff;
export const RGB_BLACK = 0;

export const UR_TRADE_MSG_NONE = 0;
export const UR_TRADE_MSG_NOT_MON_PARTNER_WANTS = 1;
export const UR_TRADE_MSG_NOT_EGG = 2;
export const UR_TRADE_MSG_MON_CANT_BE_TRADED_1 = 3;
export const UR_TRADE_MSG_MON_CANT_BE_TRADED_2 = 4;
export const UR_TRADE_MSG_PARTNERS_MON_CANT_BE_TRADED = 5;
export const UR_TRADE_MSG_EGG_CANT_BE_TRADED = 6;
export const UR_TRADE_MSG_PARTNER_CANT_ACCEPT_MON = 7;
export const UR_TRADE_MSG_CANT_TRADE_WITH_PARTNER_1 = 8;
export const UR_TRADE_MSG_CANT_TRADE_WITH_PARTNER_2 = 9;

export const CAN_REGISTER_MON = 0;
export const CANT_REGISTER_MON = 1;
export const CANT_REGISTER_EGG = 2;

export const QUEUE_SEND_DATA = 0;
export const QUEUE_STANDBY = 1;
export const QUEUE_ONLY_MON1 = 2;
export const QUEUE_ONLY_MON2 = 3;
export const QUEUE_UNUSED1 = 4;
export const QUEUE_UNUSED2 = 5;
export const QUEUE_MON_CANT_BE_TRADED = 6;
export const QUEUE_EGG_CANT_BE_TRADED = 7;
export const QUEUE_FRIENDS_MON_CANT_BE_TRADED = 8;

export const MSG_STANDBY = 0;
export const MSG_CANCELED = 1;
export const MSG_ONLY_MON1 = 2;
export const MSG_ONLY_MON2 = 3;
export const MSG_WAITING_FOR_FRIEND = 4;
export const MSG_FRIEND_WANTS_TO_TRADE = 5;
export const MSG_MON_CANT_BE_TRADED = 6;
export const MSG_EGG_CANT_BE_TRADED = 7;
export const MSG_FRIENDS_MON_CANT_BE_TRADED = 8;
export const QUEUE_DELAY_MSG = 3;
export const QUEUE_DELAY_DATA = 5;
export const MOVE_NONE = 0;
export const MON_MALE = 0;
export const MON_FEMALE = 254;

export interface TradeMon {
  species: number;
  speciesOrEgg: number;
  hp: number;
  maxHp: number;
  isEgg: boolean;
  isModernFatefulEncounter: boolean;
  nickname?: string;
  level?: number;
  gender?: number;
  moves?: number[];
}

export interface LinkPlayerForTrade {
  version: number;
  progressFlagsCopy: number;
}

export interface RfuGameCompatibilityData {
  hasNationalDex: boolean;
  canLinkNationally: boolean;
  version: number;
}

export interface SpeciesInfoForTrade {
  types: readonly [number, number];
}

export interface QueuedTradeAction {
  active: boolean;
  delay: number;
  actionId: number;
}

export interface TradeMenuRuntime {
  partyCounts: [number, number];
  isLiveMon: boolean[][];
  isEgg: boolean[][];
  hpBarLevels: number[][];
  giftRibbons: number[];
  queuedActions: QueuedTradeAction[];
  linkData: number[];
  sentBlocks: Array<{ bitmask: number; data: number[]; size: number }>;
  printedMessages: number[];
  callbackId: number;
  bufferPartyState: number;
  timer: number;
  cursorPosition: number;
  partnerCursorPosition: number;
  playerSelectStatus: number;
  partnerSelectStatus: number;
  playerConfirmStatus: number;
  partnerConfirmStatus: number;
  optionsActive: boolean[];
  partySpriteIds: number[][];
  spriteInvisible: boolean[];
  cursorSpriteId: number;
  cursorSprite: { x: number; y: number; anim: string; invisible: boolean };
  drawSelectedMonState: number[];
  selectedMonIdx: number[];
  selectedTradeMonPositions: number[];
  multiplayerId: number;
  wirelessCommType: number;
  receivedRemoteLinkPlayers: boolean;
  paletteFadeActive: boolean;
  linkTaskFinished: boolean;
  linkRecoveryActive: boolean;
  blockReceivedStatus: number;
  blockRecvBuffer: number[][];
  mainState: number;
  mainCallback2: string | null;
  mainCallback1: string | null;
  savedCallback: string | null;
  menuInput: number;
  newKeys: number;
  repeatKeys: number;
  playerParty: TradeMon[];
  partnerParty: TradeMon[];
  nationalPokedexEnabled: boolean;
  linkPlayers: LinkPlayerForTrade[];
  operations: string[];
  copiedBytes: number[];
  summaryScreen: { party: number; index: number; max: number } | null;
  bottomText: string;
  loadedUiSpriteSteps: number[];
  monNicknameWidth: number;
}

export const createTradeMenuRuntime = (overrides: Partial<TradeMenuRuntime> = {}): TradeMenuRuntime => ({
  partyCounts: [0, 0],
  isLiveMon: [Array(PARTY_SIZE).fill(false), Array(PARTY_SIZE).fill(false)],
  isEgg: [Array(PARTY_SIZE).fill(false), Array(PARTY_SIZE).fill(false)],
  hpBarLevels: [Array(PARTY_SIZE).fill(0), Array(PARTY_SIZE).fill(0)],
  giftRibbons: [],
  queuedActions: Array.from({ length: 4 }, () => ({ active: false, delay: 0, actionId: 0 })),
  linkData: [],
  sentBlocks: [],
  printedMessages: [],
  callbackId: CB_MAIN_MENU,
  bufferPartyState: 0,
  timer: 0,
  cursorPosition: 0,
  partnerCursorPosition: PARTY_SIZE,
  playerSelectStatus: STATUS_NONE,
  partnerSelectStatus: STATUS_NONE,
  playerConfirmStatus: STATUS_NONE,
  partnerConfirmStatus: STATUS_NONE,
  optionsActive: Array.from({ length: PARTY_SIZE * 2 + 1 }, () => false),
  partySpriteIds: [
    Array.from({ length: PARTY_SIZE }, (_, i) => i),
    Array.from({ length: PARTY_SIZE }, (_, i) => i + PARTY_SIZE)
  ],
  spriteInvisible: Array.from({ length: PARTY_SIZE * 2 + 1 }, () => true),
  cursorSpriteId: PARTY_SIZE * 2,
  cursorSprite: { x: 0, y: 0, anim: 'normal', invisible: false },
  drawSelectedMonState: [0, 0],
  selectedMonIdx: [0, PARTY_SIZE],
  selectedTradeMonPositions: [0, PARTY_SIZE],
  multiplayerId: 0,
  wirelessCommType: 0,
  receivedRemoteLinkPlayers: true,
  paletteFadeActive: false,
  linkTaskFinished: true,
  linkRecoveryActive: false,
  blockReceivedStatus: 0,
  blockRecvBuffer: [Array.from({ length: 4 }, () => 0), Array.from({ length: 4 }, () => 0)],
  mainState: 0,
  mainCallback2: null,
  mainCallback1: null,
  savedCallback: null,
  menuInput: MENU_NOTHING_CHOSEN,
  newKeys: 0,
  repeatKeys: 0,
  playerParty: [],
  partnerParty: [],
  nationalPokedexEnabled: true,
  linkPlayers: [
    { version: VERSION_FIRE_RED, progressFlagsCopy: 0xf },
    { version: VERSION_LEAF_GREEN, progressFlagsCopy: 0xf }
  ],
  operations: [],
  copiedBytes: [],
  summaryScreen: null,
  bottomText: '',
  loadedUiSpriteSteps: [],
  monNicknameWidth: 0,
  ...overrides
});

export const IsDeoxysOrMewUntradable = (species: number, isModernFatefulEncounter: boolean): boolean => {
  if (species === SPECIES_DEOXYS || species === SPECIES_MEW) {
    if (!isModernFatefulEncounter)
      return true;
  }
  return false;
};

export const CanTradeSelectedMon = (
  playerParty: readonly TradeMon[],
  partyCount: number,
  monIdx: number,
  nationalPokedexEnabled: boolean,
  linkPlayers: readonly LinkPlayerForTrade[],
  multiplayerId: number
): number => {
  const species = Array.from({ length: PARTY_SIZE }, () => 0);
  const species2 = Array.from({ length: PARTY_SIZE }, () => 0);

  for (let i = 0; i < partyCount; i += 1) {
    species2[i] = playerParty[i].speciesOrEgg;
    species[i] = playerParty[i].species;
  }

  if (!nationalPokedexEnabled) {
    if (species2[monIdx] > KANTO_SPECIES_END)
      return CANT_TRADE_NATIONAL;

    if (species2[monIdx] === SPECIES_NONE)
      return CANT_TRADE_EGG_YET;
  }

  const partner = linkPlayers[multiplayerId ^ 1];
  if (
    (partner.version & 0xff) !== VERSION_RUBY
    && (partner.version & 0xff) !== VERSION_SAPPHIRE
  ) {
    if (!(partner.progressFlagsCopy & 0xf)) {
      if (species2[monIdx] === SPECIES_EGG)
        return CANT_TRADE_PARTNER_EGG_YET;

      if (species2[monIdx] > KANTO_SPECIES_END)
        return CANT_TRADE_INVALID_MON;
    }
  }

  if (species[monIdx] === SPECIES_DEOXYS || species[monIdx] === SPECIES_MEW) {
    if (!playerParty[monIdx].isModernFatefulEncounter)
      return CANT_TRADE_INVALID_MON;
  }

  for (let i = 0; i < partyCount; i += 1) {
    if (species2[i] === SPECIES_EGG)
      species2[i] = SPECIES_NONE;
  }

  let numMonsLeft = 0;
  for (let i = 0; i < partyCount; i += 1) {
    if (i !== monIdx)
      numMonsLeft += species2[i];
  }

  if (numMonsLeft !== 0)
    return CAN_TRADE_MON;
  return CANT_TRADE_LAST_MON;
};

export const GetGameProgressForLinkTrade = (
  receivedRemoteLinkPlayers: boolean,
  linkPlayers: readonly LinkPlayerForTrade[],
  multiplayerId: number
): number => {
  let versionId: number;
  let version: number;

  if (receivedRemoteLinkPlayers) {
    versionId = 0;
    version = linkPlayers[multiplayerId ^ 1].version & 0xff;

    if (version === VERSION_FIRE_RED || version === VERSION_LEAF_GREEN)
      versionId = 0;
    else if (version === VERSION_RUBY || version === VERSION_SAPPHIRE)
      versionId = 1;
    else
      versionId = 2;

    if (versionId > 0) {
      if (linkPlayers[multiplayerId].progressFlagsCopy & 0xf0) {
        if (versionId === 2) {
          if (linkPlayers[multiplayerId ^ 1].progressFlagsCopy & 0xf0)
            return TRADE_BOTH_PLAYERS_READY;
          return TRADE_PARTNER_NOT_READY;
        }
      } else {
        return TRADE_PLAYER_NOT_READY;
      }
    }
  }
  return TRADE_BOTH_PLAYERS_READY;
};

export const GetUnionRoomTradeMessageId = (
  player: RfuGameCompatibilityData,
  partner: RfuGameCompatibilityData,
  playerSpecies2: number,
  partnerSpecies: number,
  requestedType: number,
  playerSpecies: number,
  isModernFatefulEncounter: boolean,
  speciesInfo: readonly SpeciesInfoForTrade[]
): number => {
  const playerHasNationalDex = player.hasNationalDex;
  const playerCanLinkNationally = player.canLinkNationally;
  const partnerHasNationalDex = partner.hasNationalDex;
  const partnerCanLinkNationally = partner.canLinkNationally;
  const partnerVersion = partner.version;
  let isNotFRLG: boolean;

  if (partnerVersion === VERSION_FIRE_RED || partnerVersion === VERSION_LEAF_GREEN)
    isNotFRLG = false;
  else
    isNotFRLG = true;

  if (isNotFRLG) {
    if (!playerCanLinkNationally)
      return UR_TRADE_MSG_CANT_TRADE_WITH_PARTNER_1;
    if (!partnerCanLinkNationally)
      return UR_TRADE_MSG_CANT_TRADE_WITH_PARTNER_2;
  }

  if (IsDeoxysOrMewUntradable(playerSpecies, isModernFatefulEncounter))
    return UR_TRADE_MSG_MON_CANT_BE_TRADED_2;

  if (partnerSpecies === SPECIES_EGG) {
    if (playerSpecies2 !== partnerSpecies)
      return UR_TRADE_MSG_NOT_EGG;
  } else {
    if (
      speciesInfo[playerSpecies2].types[0] !== requestedType
      && speciesInfo[playerSpecies2].types[1] !== requestedType
    )
      return UR_TRADE_MSG_NOT_MON_PARTNER_WANTS;
  }

  if (playerSpecies2 === SPECIES_EGG && playerSpecies2 !== partnerSpecies)
    return UR_TRADE_MSG_MON_CANT_BE_TRADED_1;

  if (!playerHasNationalDex) {
    if (playerSpecies2 === SPECIES_EGG)
      return UR_TRADE_MSG_EGG_CANT_BE_TRADED;

    if (playerSpecies2 > KANTO_SPECIES_END)
      return UR_TRADE_MSG_MON_CANT_BE_TRADED_2;

    if (partnerSpecies > KANTO_SPECIES_END)
      return UR_TRADE_MSG_PARTNERS_MON_CANT_BE_TRADED;
  }

  if (!partnerHasNationalDex && playerSpecies2 > KANTO_SPECIES_END)
    return UR_TRADE_MSG_PARTNER_CANT_ACCEPT_MON;

  return UR_TRADE_MSG_NONE;
};

export const CanRegisterMonForTradingBoard = (
  player: RfuGameCompatibilityData,
  species2: number,
  species: number,
  isModernFatefulEncounter: boolean
): number => {
  const hasNationalDex = player.hasNationalDex;

  if (IsDeoxysOrMewUntradable(species, isModernFatefulEncounter))
    return CANT_REGISTER_MON;

  if (hasNationalDex)
    return CAN_REGISTER_MON;

  if (species2 === SPECIES_EGG)
    return CANT_REGISTER_EGG;

  if (species2 > KANTO_SPECIES_END && species2 !== SPECIES_EGG)
    return CANT_REGISTER_MON;

  return CAN_REGISTER_MON;
};

export const ComputePartyTradeableFlags = (
  runtime: TradeMenuRuntime,
  whichParty: number,
  parties: readonly [readonly TradeMon[], readonly TradeMon[]]
): void => {
  switch (whichParty) {
    case TRADE_PLAYER:
      for (let i = 0; i < runtime.partyCounts[whichParty]; i += 1) {
        if (parties[TRADE_PLAYER][i].isEgg) {
          runtime.isLiveMon[whichParty][i] = false;
          runtime.isEgg[whichParty][i] = true;
        } else if (parties[TRADE_PLAYER][i].hp === 0) {
          runtime.isLiveMon[whichParty][i] = false;
          runtime.isEgg[whichParty][i] = false;
        } else {
          runtime.isLiveMon[whichParty][i] = true;
          runtime.isEgg[whichParty][i] = false;
        }
      }
      break;
    case TRADE_PARTNER:
      for (let i = 0; i < runtime.partyCounts[whichParty]; i += 1) {
        if (parties[TRADE_PARTNER][i].isEgg) {
          runtime.isLiveMon[whichParty][i] = false;
          runtime.isEgg[whichParty][i] = true;
        } else if (parties[TRADE_PARTNER][i].hp === 0) {
          runtime.isLiveMon[whichParty][i] = false;
          runtime.isEgg[whichParty][i] = false;
        } else {
          runtime.isLiveMon[whichParty][i] = true;
          runtime.isEgg[whichParty][i] = false;
        }
      }
      break;
  }
};

export const ComputePartyHPBarLevels = (
  runtime: TradeMenuRuntime,
  whichParty: number,
  parties: readonly [readonly TradeMon[], readonly TradeMon[]],
  getHPBarLevel: (curHp: number, maxHp: number) => number
): void => {
  switch (whichParty) {
    case TRADE_PLAYER:
      for (let i = 0; i < runtime.partyCounts[TRADE_PLAYER]; i += 1)
        runtime.hpBarLevels[TRADE_PLAYER][i] = getHPBarLevel(parties[TRADE_PLAYER][i].hp, parties[TRADE_PLAYER][i].maxHp);
      break;
    case TRADE_PARTNER:
      for (let i = 0; i < runtime.partyCounts[TRADE_PARTNER]; i += 1)
        runtime.hpBarLevels[TRADE_PARTNER][i] = getHPBarLevel(parties[TRADE_PARTNER][i].hp, parties[TRADE_PARTNER][i].maxHp);
      break;
  }
};

export const SaveTradeGiftRibbons = (runtime: TradeMenuRuntime, saveGiftRibbons: number[]): void => {
  for (let i = 0; i < runtime.giftRibbons.length; i += 1) {
    if (saveGiftRibbons[i] === 0 && runtime.giftRibbons[i] !== 0)
      saveGiftRibbons[i] = runtime.giftRibbons[i];
  }
};

export const QueueAction = (runtime: TradeMenuRuntime, delay: number, actionId: number): void => {
  for (let i = 0; i < runtime.queuedActions.length; i += 1) {
    if (!runtime.queuedActions[i].active) {
      runtime.queuedActions[i].delay = delay;
      runtime.queuedActions[i].actionId = actionId;
      runtime.queuedActions[i].active = true;
      break;
    }
  }
};

const printTradeMessage = (runtime: TradeMenuRuntime, messageId: number): void => {
  runtime.printedMessages.push(messageId);
};

export const DoQueuedActions = (
  runtime: TradeMenuRuntime,
  bitmaskAllOtherLinkPlayers: number
): void => {
  for (let i = 0; i < runtime.queuedActions.length; i += 1) {
    if (runtime.queuedActions[i].active) {
      if (runtime.queuedActions[i].delay !== 0) {
        runtime.queuedActions[i].delay--;
      } else {
        switch (runtime.queuedActions[i].actionId) {
          case QUEUE_SEND_DATA:
            runtime.sentBlocks.push({ bitmask: bitmaskAllOtherLinkPlayers, data: runtime.linkData.slice(), size: 20 });
            break;
          case QUEUE_STANDBY:
            printTradeMessage(runtime, MSG_STANDBY);
            break;
          case QUEUE_ONLY_MON1:
            printTradeMessage(runtime, MSG_ONLY_MON1);
            break;
          case QUEUE_ONLY_MON2:
          case QUEUE_UNUSED1:
          case QUEUE_UNUSED2:
            printTradeMessage(runtime, MSG_ONLY_MON2);
            break;
          case QUEUE_MON_CANT_BE_TRADED:
            printTradeMessage(runtime, MSG_MON_CANT_BE_TRADED);
            break;
          case QUEUE_EGG_CANT_BE_TRADED:
            printTradeMessage(runtime, MSG_EGG_CANT_BE_TRADED);
            break;
          case QUEUE_FRIENDS_MON_CANT_BE_TRADED:
            printTradeMessage(runtime, MSG_FRIENDS_MON_CANT_BE_TRADED);
            break;
        }
        runtime.queuedActions[i].active = false;
      }
    }
  }
};

const queueLinkData = (runtime: TradeMenuRuntime, linkCmd: number, cursorPosition: number): void => {
  runtime.linkData[0] = linkCmd;
  runtime.linkData[1] = cursorPosition;
  QueueAction(runtime, 0, QUEUE_SEND_DATA);
};

const beginFade = (runtime: TradeMenuRuntime): void => {
  runtime.paletteFadeActive = true;
  runtime.operations.push(`BeginNormalPaletteFade:${PALETTES_ALL}:0:0:16:${RGB_BLACK}`);
};

const cursorMoveDestinations: readonly (readonly (readonly number[])[])[] = [
  [[4, 2, 12, 12, 0, 0], [2, 4, 12, 12, 0, 0], [7, 6, 1, 0, 0, 0], [1, 6, 7, 0, 0, 0]],
  [[5, 3, 12, 12, 0, 0], [3, 5, 12, 12, 0, 0], [0, 7, 6, 1, 0, 0], [6, 7, 0, 1, 0, 0]],
  [[0, 0, 0, 0, 0, 0], [4, 0, 0, 0, 0, 0], [9, 8, 7, 6, 0, 0], [3, 1, 0, 0, 0, 0]],
  [[1, 1, 1, 1, 0, 0], [5, 1, 1, 1, 0, 0], [2, 9, 8, 7, 0, 0], [8, 9, 6, 6, 0, 0]],
  [[2, 2, 2, 2, 0, 0], [0, 0, 0, 0, 0, 0], [11, 10, 9, 8, 7, 6], [5, 3, 1, 0, 0, 0]],
  [[3, 3, 3, 3, 0, 0], [1, 1, 1, 1, 0, 0], [4, 4, 4, 4, 0, 0], [10, 8, 6, 0, 0, 0]],
  [[10, 8, 12, 0, 0, 0], [8, 10, 12, 0, 0, 0], [1, 0, 0, 0, 0, 0], [7, 0, 1, 0, 0, 0]],
  [[12, 0, 0, 0, 0, 0], [9, 12, 0, 0, 0, 0], [6, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0]],
  [[6, 0, 0, 0, 0, 0], [10, 6, 0, 0, 0, 0], [3, 2, 1, 0, 0, 0], [9, 7, 0, 0, 0, 0]],
  [[7, 0, 0, 0, 0, 0], [11, 12, 0, 0, 0, 0], [8, 0, 0, 0, 0, 0], [2, 1, 0, 0, 0, 0]],
  [[8, 0, 0, 0, 0, 0], [6, 0, 0, 0, 0, 0], [5, 4, 3, 2, 1, 0], [11, 9, 7, 0, 0, 0]],
  [[9, 0, 0, 0, 0, 0], [12, 0, 0, 0, 0, 0], [10, 0, 0, 0, 0, 0], [4, 2, 0, 0, 0, 0]],
  [[11, 9, 7, 6, 0, 0], [7, 6, 0, 0, 0, 0], [12, 0, 0, 0, 0, 0], [12, 0, 0, 0, 0, 0]]
];

const tradeMonSpriteCoords: readonly (readonly [number, number])[] = [
  [1, 5], [8, 5], [1, 10], [8, 10], [1, 15], [8, 15],
  [16, 5], [23, 5], [16, 10], [23, 10], [16, 15], [23, 15],
  [23, 18]
];

const tradeMonLevelCoords: readonly (readonly [number, number])[] = [
  [5, 4], [12, 4], [5, 9], [12, 9], [5, 14], [12, 14],
  [20, 4], [27, 4], [20, 9], [27, 9], [20, 14], [27, 14]
];

const tradeMonBoxCoords: readonly (readonly [number, number])[] = [
  [1, 3], [8, 3], [1, 8], [8, 8], [1, 13], [8, 13],
  [16, 3], [23, 3], [16, 8], [23, 8], [16, 13], [23, 13]
];

const selectedMonLevelGenderCoords: readonly (readonly [number, number])[] = [[5, 4], [20, 4]];

const partyFor = (runtime: TradeMenuRuntime, whichParty: number): readonly TradeMon[] =>
  whichParty === TRADE_PLAYER ? runtime.playerParty : runtime.partnerParty;

export const PrintTradeMessage = (runtime: TradeMenuRuntime, messageId: number): void => {
  printTradeMessage(runtime, messageId);
  runtime.operations.push(`PrintTradeMessage:${messageId}`);
};

export const InitTradeMenu = (runtime: TradeMenuRuntime): void => {
  runtime.operations.push('ResetSpriteData', 'FreeAllSpritePalettes', 'ResetTasks', 'ResetPaletteFade');
  runtime.operations.push('SetVBlankCallback:VBlankCB_TradeMenu', 'LoadPalette:standard:15', 'LoadPalette:standard:13');
  runtime.bufferPartyState = 0;
  runtime.callbackId = CB_MAIN_MENU;
  runtime.drawSelectedMonState = [0, 0];
  runtime.playerConfirmStatus = STATUS_NONE;
  runtime.partnerConfirmStatus = STATUS_NONE;
  runtime.timer = 0;
};

export const CB2_StartCreateTradeMenu = (runtime: TradeMenuRuntime): void => {
  runtime.mainCallback2 = 'CB2_CreateTradeMenu';
};

export const CB2_CreateTradeMenu = (runtime: TradeMenuRuntime): void => {
  switch (runtime.mainState) {
    case 0:
      InitTradeMenu(runtime);
      runtime.operations.push('AllocZeroed:sTradeMenu', 'AllocZeroed:sMenuTextTileBuffer');
      runtime.mainState++;
      break;
    case 1:
      PrintTradeMessage(runtime, MSG_STANDBY);
      runtime.operations.push('ShowBg:0', runtime.wirelessCommType ? 'OpenLink:wireless' : 'OpenLink:cable');
      runtime.mainState++;
      break;
    default:
      runtime.mainCallback2 = 'CB2_TradeMenu';
      runtime.mainCallback1 = 'CB1_UpdateLink';
      break;
  }
};

export const CB2_ReturnToTradeMenuFromSummary = (runtime: TradeMenuRuntime): void => {
  runtime.mainCallback2 = 'CB2_CreateTradeMenu';
  runtime.operations.push('ReturnToTradeMenuFromSummary');
};

export const VBlankCB_TradeMenu = (runtime: TradeMenuRuntime): void => {
  runtime.operations.push('LoadOam', 'ProcessSpriteCopyRequests', 'TransferPlttBuffer');
};

export const CB_FadeToStartTrade = (runtime: TradeMenuRuntime): void => {
  runtime.timer++;
  if (runtime.timer >= 16) {
    beginFade(runtime);
    runtime.callbackId = CB_WAIT_TO_START_TRADE;
  }
};

export const CB_WaitToStartTrade = (runtime: TradeMenuRuntime): void => {
  if (!runtime.paletteFadeActive) {
    runtime.selectedTradeMonPositions[TRADE_PLAYER] = runtime.cursorPosition;
    runtime.selectedTradeMonPositions[TRADE_PARTNER] = runtime.partnerCursorPosition;
    runtime.callbackId = runtime.wirelessCommType !== 0 ? CB_WAIT_TO_START_RFU_TRADE : CB_START_LINK_TRADE;
    if (runtime.wirelessCommType === 0)
      runtime.operations.push('SetCloseLinkCallbackAndType:32');
  }
};

export const CB_StartLinkTrade = (runtime: TradeMenuRuntime): void => {
  runtime.savedCallback = 'CB2_StartCreateTradeMenu';
  if ((runtime.wirelessCommType !== 0 && runtime.linkTaskFinished) || (runtime.wirelessCommType === 0 && !runtime.receivedRemoteLinkPlayers)) {
    runtime.operations.push('Free:sMenuTextTileBuffer', 'FreeAllWindowBuffers', 'Free:sTradeMenu');
    runtime.mainCallback1 = null;
    runtime.mainCallback2 = 'CB2_LinkTrade';
  }
};

export const CB2_TradeMenu = (runtime: TradeMenuRuntime): void => {
  RunTradeMenuCallback(runtime);
  DoQueuedActions(runtime, 1);
  DrawSelectedMonScreen(runtime, TRADE_PLAYER);
  DrawSelectedMonScreen(runtime, TRADE_PARTNER);
  runtime.operations.push('ScrollTradeBgs');
};

export const LoadTradeBgGfx = (runtime: TradeMenuRuntime, state: number): void => {
  runtime.operations.push(`LoadTradeBgGfx:${state}`);
};

export const SetActiveMenuOptions = (runtime: TradeMenuRuntime): void => {
  for (let i = 0; i < PARTY_SIZE; i += 1) {
    runtime.optionsActive[i] = i < runtime.partyCounts[TRADE_PLAYER];
    runtime.optionsActive[i + PARTY_SIZE] = i < runtime.partyCounts[TRADE_PARTNER];
    if (runtime.optionsActive[i])
      runtime.spriteInvisible[runtime.partySpriteIds[TRADE_PLAYER][i]] = false;
    if (runtime.optionsActive[i + PARTY_SIZE])
      runtime.spriteInvisible[runtime.partySpriteIds[TRADE_PARTNER][i]] = false;
  }
  runtime.optionsActive[PARTY_CANCEL] = true;
};

export const Trade_Memcpy = (dest: number[], src: readonly number[], size: number): void => {
  for (let i = 0; i < size; i += 1)
    dest[i] = src[i] ?? 0;
};

export const BufferTradeParties = (runtime: TradeMenuRuntime): boolean => {
  switch (runtime.bufferPartyState) {
    case 0:
      runtime.operations.push('SendPlayerPartyMons:0-1');
      runtime.bufferPartyState++;
      runtime.timer = 0;
      return false;
    case 1:
      if (runtime.linkTaskFinished)
        runtime.bufferPartyState++;
      return false;
    case 2:
      runtime.operations.push('SendPlayerPartyMons:2-3');
      runtime.bufferPartyState++;
      return false;
    case 3:
      if (runtime.linkTaskFinished)
        runtime.bufferPartyState++;
      return false;
    case 4:
      runtime.operations.push('SendPlayerPartyMons:4-5');
      runtime.bufferPartyState++;
      return false;
    case 5:
      if (runtime.linkTaskFinished) {
        runtime.bufferPartyState = 0;
        return true;
      }
      return false;
  }
  return false;
};

export const PrintIsThisTradeOkay = (runtime: TradeMenuRuntime): void => {
  DrawBottomRowText(runtime, 'gText_IsThisTradeOkay', [], 0x18);
};

export const Leader_ReadLinkBuffer = (runtime: TradeMenuRuntime, _mpId: number, status: number): void => {
  if (status & 1) {
    switch (runtime.blockRecvBuffer[0][0]) {
      case LINKCMD_REQUEST_CANCEL:
        runtime.playerSelectStatus = STATUS_CANCEL;
        break;
      case LINKCMD_READY_TO_TRADE:
        runtime.playerSelectStatus = STATUS_READY;
        break;
      case LINKCMD_INIT_BLOCK:
        runtime.playerConfirmStatus = STATUS_READY;
        break;
      case LINKCMD_READY_CANCEL_TRADE:
        runtime.playerConfirmStatus = STATUS_CANCEL;
        break;
    }
  }
  if (status & 2) {
    switch (runtime.blockRecvBuffer[1][0]) {
      case LINKCMD_REQUEST_CANCEL:
        runtime.partnerSelectStatus = STATUS_CANCEL;
        break;
      case LINKCMD_READY_TO_TRADE:
        runtime.partnerCursorPosition = runtime.blockRecvBuffer[1][1] + PARTY_SIZE;
        runtime.partnerSelectStatus = STATUS_READY;
        break;
      case LINKCMD_INIT_BLOCK:
        runtime.partnerConfirmStatus = STATUS_READY;
        break;
      case LINKCMD_READY_CANCEL_TRADE:
        runtime.partnerConfirmStatus = STATUS_CANCEL;
        break;
    }
  }
  runtime.operations.push(`ResetBlockReceivedFlag:${status}`);
};

export const Follower_ReadLinkBuffer = (runtime: TradeMenuRuntime, _mpId: number, status: number): void => {
  if (status & 1) {
    switch (runtime.blockRecvBuffer[0][0]) {
      case LINKCMD_BOTH_CANCEL_TRADE:
        beginFade(runtime);
        PrintTradeMessage(runtime, MSG_STANDBY);
        runtime.callbackId = CB_INIT_EXIT_CANCELED_TRADE;
        break;
      case LINKCMD_PARTNER_CANCEL_TRADE:
        PrintTradeMessage(runtime, MSG_ONLY_MON1);
        runtime.callbackId = CB_HANDLE_TRADE_CANCELED;
        break;
      case LINKCMD_SET_MONS_TO_TRADE:
        runtime.partnerCursorPosition = runtime.blockRecvBuffer[0][1] + PARTY_SIZE;
        SetSelectedMon(runtime, runtime.cursorPosition);
        SetSelectedMon(runtime, runtime.partnerCursorPosition);
        runtime.callbackId = CB_PRINT_IS_THIS_OKAY;
        break;
      case LINKCMD_START_TRADE:
        beginFade(runtime);
        runtime.callbackId = CB_WAIT_TO_START_TRADE;
        break;
      case LINKCMD_PLAYER_CANCEL_TRADE:
        PrintTradeMessage(runtime, MSG_STANDBY);
        runtime.callbackId = CB_HANDLE_TRADE_CANCELED;
        break;
    }
  }
  runtime.operations.push(`ResetBlockReceivedFlag:${status}`);
};

export const Leader_HandleCommunication = (runtime: TradeMenuRuntime): void => {
  if (runtime.playerSelectStatus !== STATUS_NONE && runtime.partnerSelectStatus !== STATUS_NONE) {
    if (runtime.playerSelectStatus === STATUS_READY && runtime.partnerSelectStatus === STATUS_READY) {
      runtime.callbackId = CB_SET_SELECTED_MONS;
      queueLinkData(runtime, LINKCMD_SET_MONS_TO_TRADE, runtime.cursorPosition);
    } else if (runtime.playerSelectStatus === STATUS_READY && runtime.partnerSelectStatus === STATUS_CANCEL) {
      PrintTradeMessage(runtime, MSG_STANDBY);
      queueLinkData(runtime, LINKCMD_PARTNER_CANCEL_TRADE, 0);
      runtime.callbackId = CB_HANDLE_TRADE_CANCELED;
    } else if (runtime.playerSelectStatus === STATUS_CANCEL && runtime.partnerSelectStatus === STATUS_READY) {
      PrintTradeMessage(runtime, MSG_ONLY_MON1);
      queueLinkData(runtime, LINKCMD_PLAYER_CANCEL_TRADE, 0);
      runtime.callbackId = CB_HANDLE_TRADE_CANCELED;
    } else {
      queueLinkData(runtime, LINKCMD_BOTH_CANCEL_TRADE, 0);
      beginFade(runtime);
      runtime.callbackId = CB_INIT_EXIT_CANCELED_TRADE;
    }
    runtime.playerSelectStatus = STATUS_NONE;
    runtime.partnerSelectStatus = STATUS_NONE;
  }

  if (runtime.playerConfirmStatus !== STATUS_NONE && runtime.partnerConfirmStatus !== STATUS_NONE) {
    if (runtime.playerConfirmStatus === STATUS_READY && runtime.partnerConfirmStatus === STATUS_READY) {
      queueLinkData(runtime, LINKCMD_START_TRADE, 0);
      runtime.callbackId = CB_FADE_TO_START_TRADE;
    } else if (runtime.playerConfirmStatus === STATUS_CANCEL || runtime.partnerConfirmStatus === STATUS_CANCEL) {
      PrintTradeMessage(runtime, MSG_STANDBY);
      queueLinkData(runtime, LINKCMD_PLAYER_CANCEL_TRADE, 0);
      runtime.callbackId = CB_HANDLE_TRADE_CANCELED;
    }
    runtime.playerConfirmStatus = STATUS_NONE;
    runtime.partnerConfirmStatus = STATUS_NONE;
  }
};

export const CB1_UpdateLink = (runtime: TradeMenuRuntime): void => {
  if (runtime.blockReceivedStatus) {
    if (runtime.multiplayerId === 0)
      Leader_ReadLinkBuffer(runtime, runtime.multiplayerId, runtime.blockReceivedStatus);
    else
      Follower_ReadLinkBuffer(runtime, runtime.multiplayerId, runtime.blockReceivedStatus);
  }
  if (runtime.multiplayerId === 0)
    Leader_HandleCommunication(runtime);
};

export const GetNewCursorPosition = (runtime: TradeMenuRuntime, oldPosition: number, direction: number): number => {
  let newPosition = oldPosition;

  for (let i = 0; i < PARTY_SIZE; i += 1) {
    const candidate = cursorMoveDestinations[oldPosition][direction][i];
    if (runtime.optionsActive[candidate]) {
      newPosition = candidate;
      break;
    }
  }

  return newPosition;
};

export const TradeMenuMoveCursor = (runtime: TradeMenuRuntime, cursorPosition: number, direction: number): number => {
  const newPosition = GetNewCursorPosition(runtime, cursorPosition, direction);

  if (newPosition === PARTY_CANCEL) {
    runtime.cursorSprite.anim = 'CURSOR_ANIM_ON_CANCEL';
    runtime.cursorSprite.x = 240 - 16;
    runtime.cursorSprite.y = 160;
  } else {
    runtime.cursorSprite.anim = 'CURSOR_ANIM_NORMAL';
    runtime.cursorSprite.x = tradeMonSpriteCoords[newPosition][0] * 8 + 32;
    runtime.cursorSprite.y = tradeMonSpriteCoords[newPosition][1] * 8;
  }

  if (cursorPosition !== newPosition)
    runtime.operations.push('PlaySE:SE_SELECT');

  runtime.cursorPosition = newPosition;
  return newPosition;
};

export const SetReadyToTrade = (runtime: TradeMenuRuntime): void => {
  PrintTradeMessage(runtime, MSG_STANDBY);
  runtime.callbackId = CB_READY_WAIT;

  if (runtime.multiplayerId === 1) {
    runtime.linkData[0] = LINKCMD_READY_TO_TRADE;
    runtime.linkData[1] = runtime.cursorPosition;
    runtime.sentBlocks.push({ bitmask: 1, data: runtime.linkData.slice(), size: 20 });
  } else {
    runtime.playerSelectStatus = STATUS_READY;
  }
};

export const CB_ProcessMenuInput = (runtime: TradeMenuRuntime): void => {
  if (runtime.repeatKeys & DPAD_UP)
    TradeMenuMoveCursor(runtime, runtime.cursorPosition, DIR_UP);
  else if (runtime.repeatKeys & DPAD_DOWN)
    TradeMenuMoveCursor(runtime, runtime.cursorPosition, DIR_DOWN);
  else if (runtime.repeatKeys & DPAD_LEFT)
    TradeMenuMoveCursor(runtime, runtime.cursorPosition, DIR_LEFT);
  else if (runtime.repeatKeys & DPAD_RIGHT)
    TradeMenuMoveCursor(runtime, runtime.cursorPosition, DIR_RIGHT);

  if (runtime.newKeys & A_BUTTON) {
    runtime.operations.push('PlaySE:SE_SELECT');

    if (runtime.cursorPosition < PARTY_SIZE) {
      runtime.operations.push('DrawTextBorderOuter:1', 'FillWindowPixelBuffer:1', 'PrintMenuTable:SummaryTrade', 'Menu_InitCursor:1', 'PutWindowTilemap:1', 'CopyWindowToVram:1:full');
      runtime.callbackId = CB_SELECTED_MON;
    } else if (runtime.cursorPosition < PARTY_SIZE * 2) {
      beginFade(runtime);
      runtime.callbackId = CB_SHOW_MON_SUMMARY;
    } else if (runtime.cursorPosition === PARTY_CANCEL) {
      runtime.operations.push('CreateYesNoMenu:CancelTrade');
      runtime.callbackId = CB_CANCEL_TRADE_PROMPT;
      DrawBottomRowText(runtime, 'gText_CancelTrade', [], 24);
    }
  }

  if (runtime.newKeys & 0x0100) {
    for (let i = 0; i < 10; i += 1)
      runtime.linkData[i] = i;
    runtime.sentBlocks.push({ bitmask: 1, data: runtime.linkData.slice(), size: 20 });
  }
};

export const RedrawChooseAPokemonWindow = (runtime: TradeMenuRuntime): void => {
  PrintTradePartnerPartyNicknames(runtime);
  runtime.callbackId = CB_MAIN_MENU;
  runtime.cursorSprite.invisible = false;
  DrawBottomRowText(runtime, 'gTradeText_ChooseAPokemon', [], 24);
};

export const CB_ProcessSelectedMonInput = (runtime: TradeMenuRuntime): void => {
  switch (runtime.menuInput) {
    case MENU_B_PRESSED:
      runtime.operations.push('PlaySE:SE_SELECT');
      RedrawChooseAPokemonWindow(runtime);
      break;
    case MENU_NOTHING_CHOSEN:
      break;
    case 0:
      beginFade(runtime);
      runtime.callbackId = CB_SHOW_MON_SUMMARY;
      break;
    case 1:
      switch (CanTradeSelectedMon(runtime.playerParty, runtime.partyCounts[TRADE_PLAYER], runtime.cursorPosition, runtime.nationalPokedexEnabled, runtime.linkPlayers, runtime.multiplayerId)) {
        case CAN_TRADE_MON:
          SetReadyToTrade(runtime);
          runtime.cursorSprite.invisible = true;
          break;
        case CANT_TRADE_LAST_MON:
          QueueAction(runtime, QUEUE_DELAY_MSG, QUEUE_ONLY_MON2);
          runtime.callbackId = CB_HANDLE_TRADE_CANCELED;
          break;
        case CANT_TRADE_NATIONAL:
        case CANT_TRADE_INVALID_MON:
          QueueAction(runtime, QUEUE_DELAY_MSG, QUEUE_MON_CANT_BE_TRADED);
          runtime.callbackId = CB_HANDLE_TRADE_CANCELED;
          break;
        case CANT_TRADE_EGG_YET:
        case CANT_TRADE_PARTNER_EGG_YET:
          QueueAction(runtime, QUEUE_DELAY_MSG, QUEUE_EGG_CANT_BE_TRADED);
          runtime.callbackId = CB_HANDLE_TRADE_CANCELED;
          break;
      }
      break;
  }
};

export const CB_ChooseMonAfterButtonPress = (runtime: TradeMenuRuntime): void => {
  if ((runtime.newKeys & A_BUTTON) || (runtime.newKeys & B_BUTTON)) {
    runtime.operations.push('PlaySE:SE_SELECT');
    RedrawChooseAPokemonWindow(runtime);
  }
};

export const CB_ShowTradeMonSummaryScreen = (runtime: TradeMenuRuntime): void => {
  if (!runtime.paletteFadeActive) {
    if (runtime.cursorPosition < PARTY_SIZE)
      runtime.summaryScreen = { party: TRADE_PLAYER, index: runtime.cursorPosition, max: runtime.partyCounts[TRADE_PLAYER] - 1 };
    else
      runtime.summaryScreen = { party: TRADE_PARTNER, index: runtime.cursorPosition - PARTY_SIZE, max: runtime.partyCounts[TRADE_PARTNER] - 1 };
    runtime.operations.push('ShowPokemonSummaryScreen:PSS_MODE_TRADE', 'FreeAllWindowBuffers');
  }
};

export const CheckValidityOfTradeMons = (runtime: TradeMenuRuntime, aliveMons: readonly number[], playerPartyCount: number, cursorPos: number): number => {
  let hasLiveMon = 0;

  for (let i = 0; i < playerPartyCount; i += 1) {
    if (cursorPos !== i)
      hasLiveMon += aliveMons[i] ?? 0;
  }

  const partnerMon = runtime.partnerParty[runtime.partnerCursorPosition % PARTY_SIZE];
  if (partnerMon && IsDeoxysOrMewUntradable(partnerMon.species, partnerMon.isModernFatefulEncounter))
    return PARTNER_MON_INVALID;

  if (hasLiveMon !== 0)
    hasLiveMon = BOTH_MONS_VALID;

  return hasLiveMon;
};

export const CommunicateWhetherMonCanBeTraded = (runtime: TradeMenuRuntime): void => {
  const aliveMons = Array.from({ length: PARTY_SIZE * 2 }, () => 0);

  for (let i = 0; i < runtime.partyCounts[TRADE_PLAYER]; i += 1)
    aliveMons[i] = runtime.isLiveMon[TRADE_PLAYER][i] ? 1 : 0;

  switch (CheckValidityOfTradeMons(runtime, aliveMons, runtime.partyCounts[TRADE_PLAYER], runtime.cursorPosition)) {
    case PLAYER_MON_INVALID:
      QueueAction(runtime, QUEUE_DELAY_MSG, QUEUE_ONLY_MON2);
      runtime.linkData[0] = LINKCMD_READY_CANCEL_TRADE;
      QueueAction(runtime, 180, QUEUE_SEND_DATA);
      break;
    case BOTH_MONS_VALID:
      QueueAction(runtime, QUEUE_DELAY_MSG, QUEUE_STANDBY);
      runtime.linkData[0] = LINKCMD_INIT_BLOCK;
      if (runtime.linkTaskFinished)
        runtime.sentBlocks.push({ bitmask: 1, data: runtime.linkData.slice(), size: 20 });
      break;
    case PARTNER_MON_INVALID:
      QueueAction(runtime, QUEUE_DELAY_MSG, QUEUE_FRIENDS_MON_CANT_BE_TRADED);
      runtime.linkData[0] = LINKCMD_READY_CANCEL_TRADE;
      QueueAction(runtime, 180, QUEUE_SEND_DATA);
      break;
  }
};

export const CB_ProcessConfirmTradeInput = (runtime: TradeMenuRuntime): void => {
  switch (runtime.menuInput) {
    case 0:
      CommunicateWhetherMonCanBeTraded(runtime);
      runtime.callbackId = CB_IDLE;
      runtime.operations.push('PutWindowTilemap:17');
      break;
    case 1:
    case MENU_B_PRESSED:
      QueueAction(runtime, QUEUE_DELAY_MSG, QUEUE_STANDBY);
      if (runtime.linkTaskFinished) {
        runtime.linkData[0] = LINKCMD_READY_CANCEL_TRADE;
        runtime.sentBlocks.push({ bitmask: 1, data: runtime.linkData.slice(), size: 20 });
      }
      runtime.callbackId = CB_IDLE;
      runtime.operations.push('PutWindowTilemap:17');
      break;
  }
};

export const RestoreNicknamesCoveredByYesNo = (runtime: TradeMenuRuntime): void => {
  for (let i = 0; i < runtime.partyCounts[TRADE_PARTNER] - 4; i += 1)
    runtime.operations.push(`PutWindowTilemap:${i + PARTY_SIZE * 2}`, `CopyWindowToVram:${i + PARTY_SIZE * 2}:map`);
};

export const CB_ProcessCancelTradeInput = (runtime: TradeMenuRuntime): void => {
  switch (runtime.menuInput) {
    case 0:
      PrintTradeMessage(runtime, MSG_WAITING_FOR_FRIEND);
      queueLinkData(runtime, LINKCMD_REQUEST_CANCEL, 0);
      runtime.cursorSprite.invisible = true;
      runtime.callbackId = CB_IDLE;
      RestoreNicknamesCoveredByYesNo(runtime);
      break;
    case 1:
    case MENU_B_PRESSED:
      runtime.operations.push('PlaySE:SE_SELECT');
      RedrawChooseAPokemonWindow(runtime);
      break;
  }
};

export const CB_SetSelectedMons = (runtime: TradeMenuRuntime): void => {
  if (runtime.multiplayerId === 0) {
    runtime.operations.push('rbox_fill_rectangle:0');
    SetSelectedMon(runtime, runtime.cursorPosition);
    SetSelectedMon(runtime, runtime.partnerCursorPosition);
  }
  runtime.callbackId = CB_PRINT_IS_THIS_OKAY;
};

export const CB_PrintIsThisTradeOkay = (runtime: TradeMenuRuntime): void => {
  if (runtime.drawSelectedMonState[TRADE_PLAYER] === DRAW_SELECTED_FINISH && runtime.drawSelectedMonState[TRADE_PARTNER] === DRAW_SELECTED_FINISH) {
    PrintIsThisTradeOkay(runtime);
    runtime.callbackId = CB_INIT_CONFIRM_TRADE_PROMPT;
  }
};

export const CB_InitConfirmTradePrompt = (runtime: TradeMenuRuntime): void => {
  runtime.timer++;
  if (runtime.timer > 120) {
    runtime.operations.push('CreateYesNoMenu:ConfirmTrade');
    runtime.timer = 0;
    runtime.callbackId = CB_CONFIRM_TRADE_PROMPT;
  }
};

export const CB_HandleTradeCanceled = (runtime: TradeMenuRuntime): void => {
  if (runtime.newKeys & A_BUTTON) {
    runtime.operations.push('PlaySE:SE_SELECT', 'rbox_fill_rectangle:0', 'rbox_fill_rectangle:1');
    for (let i = 0; i < 4; i += 1)
      runtime.operations.push(`FillWindowPixelBuffer:${i + 14}`, `rbox_fill_rectangle:${i + 14}`);
    RedrawPartyWindow(runtime, TRADE_PLAYER);
    RedrawPartyWindow(runtime, TRADE_PARTNER);
    runtime.callbackId = CB_MAIN_MENU;
    runtime.cursorSprite.invisible = false;
  }
};

export const CB_InitExitCanceledTrade = (runtime: TradeMenuRuntime): void => {
  if (runtime.linkTaskFinished && !runtime.paletteFadeActive) {
    runtime.operations.push(runtime.wirelessCommType ? 'SetLinkStandbyCallback' : 'SetCloseLinkCallbackAndType:12');
    runtime.callbackId = CB_EXIT_CANCELED_TRADE;
  }
};

export const CB_ExitCanceledTrade = (runtime: TradeMenuRuntime): void => {
  if (runtime.wirelessCommType) {
    if (runtime.linkTaskFinished) {
      runtime.operations.push('Free:sMenuTextTileBuffer', 'Free:sTradeMenu', 'FreeAllWindowBuffers', 'DestroyWirelessStatusIndicatorSprite');
      runtime.mainCallback2 = 'CB2_ReturnToFieldFromMultiplayer';
    }
  } else if (!runtime.receivedRemoteLinkPlayers) {
    runtime.operations.push('Free:sMenuTextTileBuffer', 'Free:sTradeMenu', 'FreeAllWindowBuffers');
    runtime.mainCallback2 = 'CB2_ReturnToFieldFromMultiplayer';
  }
};

export const CB_WaitToStartRfuTrade = (runtime: TradeMenuRuntime): void => {
  if (!runtime.linkRecoveryActive) {
    runtime.operations.push('SetLinkStandbyCallback');
    runtime.callbackId = CB_START_LINK_TRADE;
  }
};

export const RunTradeMenuCallback = (runtime: TradeMenuRuntime): void => {
  switch (runtime.callbackId) {
    case CB_MAIN_MENU:
      CB_ProcessMenuInput(runtime);
      break;
    case CB_SELECTED_MON:
      CB_ProcessSelectedMonInput(runtime);
      break;
    case CB_SHOW_MON_SUMMARY:
      CB_ShowTradeMonSummaryScreen(runtime);
      break;
    case CB_CONFIRM_TRADE_PROMPT:
      CB_ProcessConfirmTradeInput(runtime);
      break;
    case CB_CANCEL_TRADE_PROMPT:
      CB_ProcessCancelTradeInput(runtime);
      break;
    case CB_READY_WAIT:
      break;
    case CB_SET_SELECTED_MONS:
      CB_SetSelectedMons(runtime);
      break;
    case CB_PRINT_IS_THIS_OKAY:
      CB_PrintIsThisTradeOkay(runtime);
      break;
    case CB_HANDLE_TRADE_CANCELED:
      CB_HandleTradeCanceled(runtime);
      break;
    case CB_FADE_TO_START_TRADE:
      CB_FadeToStartTrade(runtime);
      break;
    case CB_WAIT_TO_START_TRADE:
      CB_WaitToStartTrade(runtime);
      break;
    case CB_INIT_EXIT_CANCELED_TRADE:
      CB_InitExitCanceledTrade(runtime);
      break;
    case CB_EXIT_CANCELED_TRADE:
      CB_ExitCanceledTrade(runtime);
      break;
    case CB_START_LINK_TRADE:
      CB_StartLinkTrade(runtime);
      break;
    case CB_INIT_CONFIRM_TRADE_PROMPT:
      CB_InitConfirmTradePrompt(runtime);
      break;
    case CB_UNUSED_CLOSE_MSG:
      CB_ChooseMonAfterButtonPress(runtime);
      break;
    case CB_WAIT_TO_START_RFU_TRADE:
      CB_WaitToStartRfuTrade(runtime);
      break;
  }
};

export const SetSelectedMon = (runtime: TradeMenuRuntime, cursorPosition: number): void => {
  const whichParty = Math.floor(cursorPosition / PARTY_SIZE);
  if (runtime.drawSelectedMonState[whichParty] === 0) {
    runtime.drawSelectedMonState[whichParty] = 1;
    runtime.selectedMonIdx[whichParty] = cursorPosition;
  }
};

export const DrawSelectedMonScreen = (runtime: TradeMenuRuntime, whichParty: number): void => {
  const selectedMonIdx = runtime.selectedMonIdx[whichParty];
  const selectedMonParty = selectedMonIdx < PARTY_SIZE ? TRADE_PLAYER : TRADE_PARTNER;
  const partyIdx = selectedMonIdx % PARTY_SIZE;

  switch (runtime.drawSelectedMonState[whichParty]) {
    case 1:
      for (let i = 0; i < runtime.partyCounts[whichParty]; i += 1)
        runtime.spriteInvisible[runtime.partySpriteIds[selectedMonParty][i]] = true;
      for (let i = 0; i < PARTY_SIZE; i += 1)
        runtime.operations.push(`ClearWindowTilemap:${i + (whichParty * PARTY_SIZE + 2)}`);
      runtime.spriteInvisible[runtime.partySpriteIds[selectedMonParty][partyIdx]] = false;
      runtime.operations.push(`Trade_MoveSelectedMonToTarget:${selectedMonParty}:${partyIdx}`, `CopyTradePartyBox:${whichParty}`);
      runtime.drawSelectedMonState[whichParty]++;
      if (selectedMonParty === TRADE_PLAYER)
        PrintTradePartnerPartyNicknames(runtime);
      break;
    case 2:
      runtime.drawSelectedMonState[whichParty] = 3;
      break;
    case 3: {
      runtime.operations.push(`CopyTradeMovesBox:${selectedMonParty}`);
      const nickname = { text: '' };
      const nameStringWidth = GetMonNicknameWidth(runtime, nickname, selectedMonParty, partyIdx);
      BufferMovesString(runtime, selectedMonParty, partyIdx);
      runtime.monNicknameWidth = nameStringWidth;
      runtime.operations.push(`PrintSelectedNickname:${(whichParty * 2) + 14}:${nickname.text}`, `PrintSelectedMoves:${(whichParty * 2) + 15}`);
      runtime.drawSelectedMonState[whichParty]++;
      break;
    }
    case 4:
      PrintLevelAndGender(runtime, whichParty, partyIdx, selectedMonLevelGenderCoords[whichParty][0] + 4, selectedMonLevelGenderCoords[whichParty][1] + 1, selectedMonLevelGenderCoords[whichParty][0], selectedMonLevelGenderCoords[whichParty][1]);
      runtime.drawSelectedMonState[whichParty]++;
      break;
  }
};

export const GetMonNicknameWidth = (runtime: TradeMenuRuntime, dest: { text: string }, whichParty: number, partyIdx: number): number => {
  const nickname = partyFor(runtime, whichParty)[partyIdx]?.nickname ?? '';
  dest.text = nickname;
  return nickname.length * 6;
};

export const BufferMovesString = (runtime: TradeMenuRuntime, whichParty: number, partyIdx: number): string => {
  let movesString = '';
  const mon = partyFor(runtime, whichParty)[partyIdx];
  if (!runtime.isEgg[whichParty][partyIdx]) {
    for (let i = 0; i < 4; i += 1) {
      const move = mon?.moves?.[i] ?? MOVE_NONE;
      if (move !== MOVE_NONE)
        movesString += `MOVE_${move}`;
      movesString += '\n';
    }
  } else {
    movesString += '????';
  }
  runtime.operations.push(`BufferMovesString:${whichParty}:${partyIdx}:${movesString}`);
  return movesString;
};

export const PrintPartyMonNickname = (runtime: TradeMenuRuntime, whichParty: number, windowId: number, str: string): void => {
  const adjustedWindowId = windowId + (whichParty * PARTY_SIZE) + 2;
  const xPos = Math.floor((64 - str.length * 6) / 2);
  runtime.operations.push(`PrintPartyMonNickname:${adjustedWindowId}:${xPos}:${str}`, `PutWindowTilemap:${adjustedWindowId}`, `CopyWindowToVram:${adjustedWindowId}:full`);
};

export const PrintPartyNicknames = (runtime: TradeMenuRuntime, whichParty: number): void => {
  const party = partyFor(runtime, whichParty);
  for (let i = 0; i < runtime.partyCounts[whichParty]; i += 1)
    PrintPartyMonNickname(runtime, whichParty, i, party[i]?.nickname ?? '');
};

export const PrintLevelAndGender = (runtime: TradeMenuRuntime, whichParty: number, monIdx: number, x: number, y: number, winLeft: number, winTop: number): void => {
  const mon = partyFor(runtime, whichParty)[monIdx];
  let symbolTile = 0x83;

  runtime.operations.push(`CopyMonBox:${winLeft}:${winTop}:6:3`);

  if (runtime.isEgg[whichParty][monIdx]) {
    symbolTile = 0x480;
  } else {
    if (mon?.gender === MON_MALE)
      symbolTile = mon.nickname?.includes('♂') ? 0x83 : 0x84;
    else if (mon?.gender === MON_FEMALE)
      symbolTile = mon.nickname?.includes('♀') ? 0x83 : 0x85;
  }

  runtime.operations.push(`PrintLevelAndGender:${whichParty}:${monIdx}:${x}:${y}:level=${mon?.level ?? 0}:symbol=${symbolTile}`);
};

export const PrintPartyLevelsAndGenders = (runtime: TradeMenuRuntime, whichParty: number): void => {
  for (let i = 0; i < runtime.partyCounts[whichParty]; i += 1) {
    const j = i + PARTY_SIZE * whichParty;
    PrintLevelAndGender(runtime, whichParty, i, tradeMonLevelCoords[j][0], tradeMonLevelCoords[j][1], tradeMonBoxCoords[j][0], tradeMonBoxCoords[j][1]);
  }
};

export const ShowTradePartyMonIcons = (runtime: TradeMenuRuntime, whichParty: number): void => {
  for (let i = 0; i < runtime.partyCounts[whichParty]; i += 1) {
    const spriteId = runtime.partySpriteIds[whichParty][i];
    runtime.spriteInvisible[spriteId] = false;
    runtime.operations.push(`ShowTradePartyMonIcon:${whichParty}:${i}:${tradeMonSpriteCoords[(whichParty * PARTY_SIZE) + i][0] * 8 + 14}:${tradeMonSpriteCoords[(whichParty * PARTY_SIZE) + i][1] * 8 - 12}`);
  }
};

export const PrintTradePartnerPartyNicknames = (runtime: TradeMenuRuntime): void => {
  runtime.operations.push('rbox_fill_rectangle:1');
  PrintPartyNicknames(runtime, TRADE_PARTNER);
};

export const RedrawPartyWindow = (runtime: TradeMenuRuntime, whichParty: number): void => {
  runtime.operations.push(`CopyTradePartyBox:${whichParty}`, 'CopyBgTilemapBufferToVram:1');
  PrintPartyLevelsAndGenders(runtime, whichParty);
  PrintPartyNicknames(runtime, whichParty);
  ShowTradePartyMonIcons(runtime, whichParty);
  DrawBottomRowText(runtime, 'gTradeText_ChooseAPokemon', [], 24);
  runtime.drawSelectedMonState[whichParty] = 0;
};

export const Task_DrawSelectionSummary = (runtime: TradeMenuRuntime, _taskId: number): void => {
  runtime.operations.push('FillBgTilemapBufferRect_Palette0:0:0:0:0:30:20', 'CopyBgTilemapBufferToVram:0');
};

export const Task_DrawSelectionTrade = (runtime: TradeMenuRuntime, _taskId: number): void => {
  runtime.operations.push('FillBgTilemapBufferRect_Palette0:0:0:0:30:20', 'CopyBgTilemapBufferToVram:0');
};

export const LoadUISpriteGfx = (runtime: TradeMenuRuntime): boolean => {
  if (runtime.timer < 18)
    runtime.operations.push(`LoadSpriteSheet:GFXTAG_MENU_TEXT+${runtime.timer}`);

  switch (runtime.timer) {
    case 8:
      runtime.loadedUiSpriteSteps.push(runtime.timer);
      runtime.timer++;
      break;
    case 18:
      runtime.operations.push('LoadSpritePalette:sSpritePalette_MenuText');
      runtime.timer++;
      break;
    case 19:
      runtime.operations.push('LoadSpritePalette:sCursor_SpritePalette');
      runtime.timer++;
      break;
    case 20:
      runtime.operations.push('LoadSpriteSheet:sCursor_SpriteSheet');
      runtime.timer++;
      break;
    case 21:
      runtime.timer = 0;
      return true;
    default:
      runtime.loadedUiSpriteSteps.push(runtime.timer);
      runtime.timer++;
      break;
  }

  return false;
};

export const DrawBottomRowText = (runtime: TradeMenuRuntime, name: string, _dest: unknown, unused: number): void => {
  runtime.bottomText = name;
  runtime.operations.push(`DrawBottomRowText:${name}:${unused}`);
};

export const SetTradePartyHPBarSprites = (runtime: TradeMenuRuntime, whichParty: number): void => {
  for (let i = 0; i < runtime.partyCounts[whichParty]; i += 1)
    runtime.operations.push(`SetTradePartyHPBarSprite:${whichParty}:${i}:${runtime.hpBarLevels[whichParty][i]}`);
};
