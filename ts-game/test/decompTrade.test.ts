import { describe, expect, test } from 'vitest';
import {
  CAN_REGISTER_MON,
  CAN_TRADE_MON,
  BOTH_MONS_VALID,
  A_BUTTON,
  CB_CANCEL_TRADE_PROMPT,
  CB_READY_WAIT,
  CB_SELECTED_MON,
  CANT_REGISTER_EGG,
  CANT_REGISTER_MON,
  CANT_TRADE_EGG_YET,
  CANT_TRADE_INVALID_MON,
  CANT_TRADE_LAST_MON,
  CANT_TRADE_NATIONAL,
  CANT_TRADE_PARTNER_EGG_YET,
  CB_ProcessMenuInput,
  CB_ProcessSelectedMonInput,
  CanRegisterMonForTradingBoard,
  CanTradeSelectedMon,
  CheckValidityOfTradeMons,
  ComputePartyHPBarLevels,
  ComputePartyTradeableFlags,
  CommunicateWhetherMonCanBeTraded,
  DIR_RIGHT,
  DoQueuedActions,
  GetGameProgressForLinkTrade,
  GetNewCursorPosition,
  GetUnionRoomTradeMessageId,
  IsDeoxysOrMewUntradable,
  LINKCMD_INIT_BLOCK,
  LINKCMD_READY_CANCEL_TRADE,
  MENU_NOTHING_CHOSEN,
  MSG_ONLY_MON2,
  MSG_STANDBY,
  PARTNER_MON_INVALID,
  PARTY_CANCEL,
  PLAYER_MON_INVALID,
  QueueAction,
  QUEUE_ONLY_MON2,
  QUEUE_SEND_DATA,
  SaveTradeGiftRibbons,
  SetActiveMenuOptions,
  SetReadyToTrade,
  SPECIES_DEOXYS,
  SPECIES_EGG,
  SPECIES_MEW,
  SPECIES_NONE,
  STATUS_READY,
  TRADE_BOTH_PLAYERS_READY,
  TRADE_PARTNER,
  TRADE_PARTNER_NOT_READY,
  TRADE_PLAYER,
  TRADE_PLAYER_NOT_READY,
  TradeMenuMoveCursor,
  UR_TRADE_MSG_CANT_TRADE_WITH_PARTNER_1,
  UR_TRADE_MSG_CANT_TRADE_WITH_PARTNER_2,
  UR_TRADE_MSG_EGG_CANT_BE_TRADED,
  UR_TRADE_MSG_MON_CANT_BE_TRADED_1,
  UR_TRADE_MSG_MON_CANT_BE_TRADED_2,
  UR_TRADE_MSG_NONE,
  UR_TRADE_MSG_NOT_EGG,
  UR_TRADE_MSG_NOT_MON_PARTNER_WANTS,
  UR_TRADE_MSG_PARTNER_CANT_ACCEPT_MON,
  UR_TRADE_MSG_PARTNERS_MON_CANT_BE_TRADED,
  VERSION_EMERALD,
  VERSION_FIRE_RED,
  VERSION_LEAF_GREEN,
  VERSION_RUBY,
  createTradeMenuRuntime,
  type RfuGameCompatibilityData,
  type SpeciesInfoForTrade,
  type TradeMon
} from '../src/game/decompTrade';

const mon = (overrides: Partial<TradeMon> = {}): TradeMon => ({
  species: 1,
  speciesOrEgg: 1,
  hp: 10,
  maxHp: 20,
  isEgg: false,
  isModernFatefulEncounter: true,
  ...overrides
});

const compat = (overrides: Partial<RfuGameCompatibilityData> = {}): RfuGameCompatibilityData => ({
  hasNationalDex: true,
  canLinkNationally: true,
  version: VERSION_FIRE_RED,
  ...overrides
});

const speciesInfo = (types: readonly [number, number]): SpeciesInfoForTrade[] => {
  const table: SpeciesInfoForTrade[] = Array.from({ length: SPECIES_EGG + 1 }, () => ({ types: [0, 0] as const }));
  table[1] = { types };
  table[152] = { types };
  table[SPECIES_EGG] = { types: [0, 0] };
  return table;
};

describe('decompTrade', () => {
  test('CanTradeSelectedMon preserves National Dex checks including the original non-BUGFIX egg quirk', () => {
    const linkPlayers = [
      { version: VERSION_FIRE_RED, progressFlagsCopy: 0xf },
      { version: VERSION_LEAF_GREEN, progressFlagsCopy: 0xf }
    ];

    expect(CanTradeSelectedMon([mon({ speciesOrEgg: 152 }), mon()], 2, 0, false, linkPlayers, 0)).toBe(CANT_TRADE_NATIONAL);
    expect(CanTradeSelectedMon([mon({ speciesOrEgg: SPECIES_EGG }), mon()], 2, 0, false, linkPlayers, 0)).toBe(CANT_TRADE_NATIONAL);
    expect(CanTradeSelectedMon([mon({ speciesOrEgg: SPECIES_NONE }), mon()], 2, 0, false, linkPlayers, 0)).toBe(CANT_TRADE_EGG_YET);
  });

  test('CanTradeSelectedMon applies partner readiness, fateful encounter, and last-mon rules exactly', () => {
    const blockedPartner = [
      { version: VERSION_FIRE_RED, progressFlagsCopy: 0xf },
      { version: VERSION_LEAF_GREEN, progressFlagsCopy: 0 }
    ];
    const readyPartner = [
      { version: VERSION_FIRE_RED, progressFlagsCopy: 0xf },
      { version: VERSION_LEAF_GREEN, progressFlagsCopy: 0xf }
    ];

    expect(CanTradeSelectedMon([mon({ speciesOrEgg: SPECIES_EGG }), mon()], 2, 0, true, blockedPartner, 0)).toBe(CANT_TRADE_PARTNER_EGG_YET);
    expect(CanTradeSelectedMon([mon({ speciesOrEgg: 152 }), mon()], 2, 0, true, blockedPartner, 0)).toBe(CANT_TRADE_INVALID_MON);
    expect(CanTradeSelectedMon([mon({ species: SPECIES_MEW, speciesOrEgg: SPECIES_MEW, isModernFatefulEncounter: false }), mon()], 2, 0, true, readyPartner, 0)).toBe(CANT_TRADE_INVALID_MON);
    expect(CanTradeSelectedMon([mon()], 1, 0, true, readyPartner, 0)).toBe(CANT_TRADE_LAST_MON);
    expect(CanTradeSelectedMon([mon(), mon()], 2, 0, true, readyPartner, 0)).toBe(CAN_TRADE_MON);
  });

  test('GetGameProgressForLinkTrade matches FRLG/RSE/other version progress branches', () => {
    expect(GetGameProgressForLinkTrade(false, [], 0)).toBe(TRADE_BOTH_PLAYERS_READY);
    expect(GetGameProgressForLinkTrade(true, [
      { version: VERSION_FIRE_RED, progressFlagsCopy: 0 },
      { version: VERSION_LEAF_GREEN, progressFlagsCopy: 0 }
    ], 0)).toBe(TRADE_BOTH_PLAYERS_READY);
    expect(GetGameProgressForLinkTrade(true, [
      { version: VERSION_FIRE_RED, progressFlagsCopy: 0 },
      { version: VERSION_RUBY, progressFlagsCopy: 0 }
    ], 0)).toBe(TRADE_PLAYER_NOT_READY);
    expect(GetGameProgressForLinkTrade(true, [
      { version: VERSION_FIRE_RED, progressFlagsCopy: 0xf0 },
      { version: VERSION_EMERALD, progressFlagsCopy: 0 }
    ], 0)).toBe(TRADE_PARTNER_NOT_READY);
    expect(GetGameProgressForLinkTrade(true, [
      { version: VERSION_FIRE_RED, progressFlagsCopy: 0xf0 },
      { version: VERSION_EMERALD, progressFlagsCopy: 0xf0 }
    ], 0)).toBe(TRADE_BOTH_PLAYERS_READY);
  });

  test('Union Room trade message follows partner version, requested species/type, dex, and fateful checks', () => {
    expect(GetUnionRoomTradeMessageId(compat({ canLinkNationally: false }), compat({ version: VERSION_RUBY }), 1, 1, 7, 1, true, speciesInfo([7, 8]))).toBe(UR_TRADE_MSG_CANT_TRADE_WITH_PARTNER_1);
    expect(GetUnionRoomTradeMessageId(compat(), compat({ version: VERSION_RUBY, canLinkNationally: false }), 1, 1, 7, 1, true, speciesInfo([7, 8]))).toBe(UR_TRADE_MSG_CANT_TRADE_WITH_PARTNER_2);
    expect(GetUnionRoomTradeMessageId(compat(), compat(), 1, 1, 7, SPECIES_DEOXYS, false, speciesInfo([7, 8]))).toBe(UR_TRADE_MSG_MON_CANT_BE_TRADED_2);
    expect(GetUnionRoomTradeMessageId(compat(), compat(), 1, SPECIES_EGG, 7, 1, true, speciesInfo([7, 8]))).toBe(UR_TRADE_MSG_NOT_EGG);
    expect(GetUnionRoomTradeMessageId(compat(), compat(), 1, 1, 9, 1, true, speciesInfo([7, 8]))).toBe(UR_TRADE_MSG_NOT_MON_PARTNER_WANTS);
    expect(GetUnionRoomTradeMessageId(compat(), compat(), SPECIES_EGG, 1, 0, 1, true, speciesInfo([0, 0]))).toBe(UR_TRADE_MSG_MON_CANT_BE_TRADED_1);
    expect(GetUnionRoomTradeMessageId(compat({ hasNationalDex: false }), compat(), SPECIES_EGG, SPECIES_EGG, 0, 1, true, speciesInfo([0, 0]))).toBe(UR_TRADE_MSG_EGG_CANT_BE_TRADED);
    expect(GetUnionRoomTradeMessageId(compat({ hasNationalDex: false }), compat(), 152, 1, 7, 152, true, speciesInfo([7, 8]))).toBe(UR_TRADE_MSG_MON_CANT_BE_TRADED_2);
    expect(GetUnionRoomTradeMessageId(compat({ hasNationalDex: false }), compat(), 1, 152, 7, 1, true, speciesInfo([7, 8]))).toBe(UR_TRADE_MSG_PARTNERS_MON_CANT_BE_TRADED);
    expect(GetUnionRoomTradeMessageId(compat(), compat({ hasNationalDex: false }), 152, 1, 7, 152, true, speciesInfo([7, 8]))).toBe(UR_TRADE_MSG_PARTNER_CANT_ACCEPT_MON);
    expect(GetUnionRoomTradeMessageId(compat(), compat(), 1, 1, 7, 1, true, speciesInfo([7, 8]))).toBe(UR_TRADE_MSG_NONE);
  });

  test('CanRegisterMonForTradingBoard and Deoxys/Mew helper preserve exact C conditions', () => {
    expect(IsDeoxysOrMewUntradable(SPECIES_MEW, false)).toBe(true);
    expect(IsDeoxysOrMewUntradable(SPECIES_MEW, true)).toBe(false);
    expect(CanRegisterMonForTradingBoard(compat(), SPECIES_EGG, 1, true)).toBe(CAN_REGISTER_MON);
    expect(CanRegisterMonForTradingBoard(compat({ hasNationalDex: false }), SPECIES_EGG, 1, true)).toBe(CANT_REGISTER_EGG);
    expect(CanRegisterMonForTradingBoard(compat({ hasNationalDex: false }), 152, 152, true)).toBe(CANT_REGISTER_MON);
    expect(CanRegisterMonForTradingBoard(compat({ hasNationalDex: false }), 1, SPECIES_DEOXYS, false)).toBe(CANT_REGISTER_MON);
  });

  test('party flag, HP level, gift ribbon, and queued action helpers match trade.c side effects', () => {
    const runtime = createTradeMenuRuntime({ partyCounts: [3, 2], giftRibbons: [0, 7, 8], linkData: [1, 2, 3] });
    const parties: [TradeMon[], TradeMon[]] = [
      [mon(), mon({ hp: 0 }), mon({ isEgg: true })],
      [mon({ hp: 5, maxHp: 10 }), mon({ isEgg: true })]
    ];

    ComputePartyTradeableFlags(runtime, TRADE_PLAYER, parties);
    ComputePartyTradeableFlags(runtime, TRADE_PARTNER, parties);
    expect(runtime.isLiveMon[TRADE_PLAYER].slice(0, 3)).toEqual([true, false, false]);
    expect(runtime.isEgg[TRADE_PLAYER].slice(0, 3)).toEqual([false, false, true]);
    expect(runtime.isLiveMon[TRADE_PARTNER].slice(0, 2)).toEqual([true, false]);
    expect(runtime.isEgg[TRADE_PARTNER].slice(0, 2)).toEqual([false, true]);

    ComputePartyHPBarLevels(runtime, TRADE_PLAYER, parties, (cur, max) => cur + max);
    expect(runtime.hpBarLevels[TRADE_PLAYER].slice(0, 3)).toEqual([30, 20, 30]);

    const saveGiftRibbons = [1, 0, 0];
    SaveTradeGiftRibbons(runtime, saveGiftRibbons);
    expect(saveGiftRibbons).toEqual([1, 7, 8]);

    QueueAction(runtime, 1, QUEUE_ONLY_MON2);
    QueueAction(runtime, 0, QUEUE_SEND_DATA);
    DoQueuedActions(runtime, 0b10);
    expect(runtime.printedMessages).toEqual([]);
    expect(runtime.sentBlocks).toEqual([{ bitmask: 0b10, data: [1, 2, 3], size: 20 }]);
    DoQueuedActions(runtime, 0b10);
    expect(runtime.printedMessages).toEqual([MSG_ONLY_MON2]);
    expect(runtime.queuedActions.every((action) => !action.active)).toBe(true);
  });

  test('trade menu cursor movement uses the decompiled destination table and active option skipping', () => {
    const runtime = createTradeMenuRuntime({ partyCounts: [2, 2], repeatKeys: 0 });
    SetActiveMenuOptions(runtime);

    expect(GetNewCursorPosition(runtime, 0, DIR_RIGHT)).toBe(1);
    expect(TradeMenuMoveCursor(runtime, 1, DIR_RIGHT)).toBe(6);
    expect(runtime.cursorSprite).toMatchObject({ x: 160, y: 40, anim: 'CURSOR_ANIM_NORMAL' });

    runtime.optionsActive[6] = false;
    runtime.optionsActive[7] = false;
    expect(TradeMenuMoveCursor(runtime, 1, DIR_RIGHT)).toBe(0);

    expect(TradeMenuMoveCursor(runtime, 7, 1)).toBe(PARTY_CANCEL);
    expect(runtime.cursorSprite).toMatchObject({ x: 224, y: 160, anim: 'CURSOR_ANIM_ON_CANCEL' });
  });

  test('menu selection opens player actions, partner summary, and cancel prompt exactly by cursor range', () => {
    const playerRuntime = createTradeMenuRuntime({ cursorPosition: 0, newKeys: A_BUTTON, menuInput: MENU_NOTHING_CHOSEN });
    CB_ProcessMenuInput(playerRuntime);
    expect(playerRuntime.callbackId).toBe(CB_SELECTED_MON);

    const partnerRuntime = createTradeMenuRuntime({ cursorPosition: 6, newKeys: A_BUTTON });
    CB_ProcessMenuInput(partnerRuntime);
    expect(partnerRuntime.callbackId).toBe(2);
    expect(partnerRuntime.paletteFadeActive).toBe(true);

    const cancelRuntime = createTradeMenuRuntime({ cursorPosition: PARTY_CANCEL, newKeys: A_BUTTON });
    CB_ProcessMenuInput(cancelRuntime);
    expect(cancelRuntime.callbackId).toBe(CB_CANCEL_TRADE_PROMPT);
    expect(cancelRuntime.bottomText).toBe('gText_CancelTrade');
  });

  test('selected-mon trade path preserves CanTradeSelectedMon result handling and ready status', () => {
    const runtime = createTradeMenuRuntime({
      partyCounts: [2, 1],
      cursorPosition: 0,
      menuInput: 1,
      playerParty: [mon(), mon()],
      partnerParty: [mon()],
      linkData: []
    });

    CB_ProcessSelectedMonInput(runtime);
    expect(runtime.callbackId).toBe(CB_READY_WAIT);
    expect(runtime.playerSelectStatus).toBe(STATUS_READY);
    expect(runtime.cursorSprite.invisible).toBe(true);
    expect(runtime.printedMessages).toEqual([MSG_STANDBY]);

    const followerRuntime = createTradeMenuRuntime({ multiplayerId: 1, cursorPosition: 2, linkData: [] });
    SetReadyToTrade(followerRuntime);
    expect(followerRuntime.sentBlocks.at(-1)?.data.slice(0, 2)).toEqual([0x4401, 2]);
  });

  test('trade confirmation validates last live mon and invalid partner species before sending link data', () => {
    const runtime = createTradeMenuRuntime({
      partyCounts: [2, 1],
      cursorPosition: 0,
      partnerCursorPosition: 6,
      isLiveMon: [[true, true, false, false, false, false], [true, false, false, false, false, false]],
      playerParty: [mon(), mon()],
      partnerParty: [mon()],
      linkData: []
    });

    expect(CheckValidityOfTradeMons(runtime, [1, 1], 2, 0)).toBe(BOTH_MONS_VALID);
    CommunicateWhetherMonCanBeTraded(runtime);
    expect(runtime.linkData[0]).toBe(LINKCMD_INIT_BLOCK);
    expect(runtime.sentBlocks.at(-1)?.data[0]).toBe(LINKCMD_INIT_BLOCK);

    const lastMonRuntime = createTradeMenuRuntime({
      partyCounts: [1, 1],
      cursorPosition: 0,
      partnerCursorPosition: 6,
      isLiveMon: [[true, false, false, false, false, false], [true, false, false, false, false, false]],
      playerParty: [mon()],
      partnerParty: [mon()],
      linkData: []
    });
    expect(CheckValidityOfTradeMons(lastMonRuntime, [1], 1, 0)).toBe(PLAYER_MON_INVALID);
    CommunicateWhetherMonCanBeTraded(lastMonRuntime);
    expect(lastMonRuntime.linkData[0]).toBe(LINKCMD_READY_CANCEL_TRADE);

    const invalidPartnerRuntime = createTradeMenuRuntime({
      partyCounts: [2, 1],
      cursorPosition: 0,
      partnerCursorPosition: 6,
      isLiveMon: [[true, true, false, false, false, false], [true, false, false, false, false, false]],
      playerParty: [mon(), mon()],
      partnerParty: [mon({ species: SPECIES_MEW, speciesOrEgg: SPECIES_MEW, isModernFatefulEncounter: false })],
      linkData: []
    });
    expect(CheckValidityOfTradeMons(invalidPartnerRuntime, [1, 1], 2, 0)).toBe(PARTNER_MON_INVALID);
    CommunicateWhetherMonCanBeTraded(invalidPartnerRuntime);
    expect(invalidPartnerRuntime.linkData[0]).toBe(LINKCMD_READY_CANCEL_TRADE);
  });
});
