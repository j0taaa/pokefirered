import { describe, expect, test } from 'vitest';
import {
  CB2_UpdateLinkTrade,
  CB2_WaitTradeComplete,
  CheckLinkTimeout,
  CheckPartnersMonForRibbons,
  CreateInGameTradePokemonInternal,
  DoTradeAnim_Cable,
  GetInGameTradeSpeciesInfo,
  GetTradeSpecies,
  HandleLinkDataReceive,
  HandleLinkDataSend,
  LINKCMD_CONFIRM_FINISH_TRADE,
  LINKCMD_READY_FINISH_TRADE,
  SPECIES_NONE,
  STATUS_CANCEL,
  STATUS_READY,
  STATE_END_LINK_TRADE,
  STATE_MON_SLIDE_IN,
  STATE_SEND_MSG,
  STATE_START,
  SpriteCB_BouncingPokeball,
  SpriteCB_BouncingPokeballArrive,
  SpriteCB_BouncingPokeballDepart,
  SpriteCB_CableEndReceiving,
  SpriteCB_CableEndSending,
  SpriteCB_GbaScreen,
  SpriteCB_LinkMonGlow,
  SpriteCB_LinkMonGlowWireless,
  SpriteCB_LinkMonShadow,
  Task_AnimateWirelessSignal,
  Task_CloseCenterWhiteColumn,
  Task_OpenCenterWhiteColumn,
  TradeBufferOTnameAndNicknames,
  TradeMons,
  createTradeSceneAnim,
  createTradeSceneMon,
  createTradeSceneRuntime,
  createTradeSceneSprite,
  type InGameTrade
} from '../src/game/decompTradeScene';

const inGameTrade = (overrides: Partial<InGameTrade> = {}): InGameTrade => ({
  nickname: 'SPEARY',
  species: 21,
  ivs: [1, 2, 3, 4, 5, 6],
  abilityNum: 1,
  otId: 0x12345678,
  conditions: [10, 20, 30, 40, 50],
  personality: 0xabcdef,
  heldItem: 222,
  mailNum: 0,
  otName: 'Dux',
  otGender: 1,
  sheen: 7,
  requestedSpecies: 25,
  ...overrides
});

describe('decompTradeScene', () => {
  test('sprite callbacks preserve the C counters, sounds, movement, palette loads, and destruction thresholds', () => {
    const runtime = createTradeSceneRuntime();
    const glow = createTradeSceneSprite({ data: [9, 0, 0, 0, 0, 0, 0, 0] });
    SpriteCB_LinkMonGlow(runtime, glow);
    expect(glow.data[0]).toBe(0);
    expect(runtime.operations).toContain('PlaySE:SE_BALL');

    const wireless = createTradeSceneSprite({ invisible: true, data: [9, 0, 0, 0, 0, 0, 0, 0] });
    SpriteCB_LinkMonGlowWireless(runtime, wireless);
    expect(wireless.data[0]).toBe(9);
    wireless.invisible = false;
    SpriteCB_LinkMonGlowWireless(runtime, wireless);
    expect(runtime.operations).toContain('PlaySE:SE_M_SWAGGER2');

    const shadow = createTradeSceneSprite({ paletteNum: 2, data: [11, 0, 0, 0, 0, 0, 0, 0] });
    SpriteCB_LinkMonShadow(runtime, shadow);
    expect(shadow.data[0]).toBe(0);
    expect(runtime.loadedPalettes.at(-1)).toMatchObject({ name: 'sLinkMonShadow_Pal[0]', offset: 36, size: 1 });

    const sending = createTradeSceneSprite({ data: [9, 0, 0, 0, 0, 0, 0, 0] });
    SpriteCB_CableEndSending(runtime, sending);
    expect(sending).toMatchObject({ y2: 1, destroyed: true });

    const receiving = createTradeSceneSprite({ data: [9, 0, 0, 0, 0, 0, 0, 0] });
    SpriteCB_CableEndReceiving(runtime, receiving);
    expect(receiving).toMatchObject({ y2: -1, destroyed: true });

    const screen = createTradeSceneSprite({ data: [14, 0, 0, 0, 0, 0, 0, 0] });
    SpriteCB_GbaScreen(runtime, screen);
    expect(screen.data[0]).toBe(0);
    expect(runtime.operations).toContain('PlaySE:SE_M_MINIMIZE');
  });

  test('bouncing Pokeball callbacks match the original fixed-point and vertical velocity table rules', () => {
    const runtime = createTradeSceneRuntime();
    const bounce = createTradeSceneSprite({ x: 0, y: 80, data: [20, 10, 50, 3, 2, 1190, 0, 0] });
    SpriteCB_BouncingPokeball(runtime, bounce);
    expect(bounce.y).toBe(76);
    expect(bounce.x).toBe(120);
    expect(bounce.data[0]).toBe(-8);
    expect(bounce.data[1]).toBe(0);
    expect(bounce.data[7]).toBe(1);
    expect(bounce.callback).toBe('SpriteCallbackDummy');

    const depart = createTradeSceneSprite({ data: [43, 0, 0, 0, 0, 0, 0, 0] });
    SpriteCB_BouncingPokeballDepart(runtime, depart);
    expect(depart.callback).toBe('SpriteCB_BouncingPokeballDepartEnd');
    expect(depart.data[0]).toBe(0);
    expect(runtime.operations).toContain('PlaySE:SE_M_MEGA_KICK');

    const arrive = createTradeSceneSprite({ y: 9, data: [0, 0, 0, 10, 0, 0, 0, 0] });
    SpriteCB_BouncingPokeballArrive(runtime, arrive);
    expect(arrive.data[2]).toBe(1);
    expect(arrive.data[0]).toBe(22);
    expect(runtime.operations).toContain('PlaySE:SE_BALL_BOUNCE_1');
  });

  test('link timeout, send, receive, and wait-complete follow the decompiled link status transitions', () => {
    const runtime = createTradeSceneRuntime({
      tradeAnim: createTradeSceneAnim({ linkTimeoutTimer: 300, linkTimeoutCheck1: 7, linkTimeoutCheck2: 7 })
    });
    CheckLinkTimeout(runtime);
    expect(runtime.mainCallback2).toBe('CB2_LinkError');
    expect(runtime.tradeAnim?.linkTimeoutTimer).toBe(0);

    runtime.tradeAnim = createTradeSceneAnim({ scheduleLinkTransfer: 1, linkData: [LINKCMD_READY_FINISH_TRADE, 2] });
    HandleLinkDataSend(runtime);
    expect(runtime.sentBlocks).toEqual([{ bitmask: 0xffffffff, data: [LINKCMD_READY_FINISH_TRADE, 2], size: 2 }]);
    expect(runtime.tradeAnim.scheduleLinkTransfer).toBe(0);

    runtime.blockReceivedStatus = 0b11;
    runtime.blockRecvBuffer = [[LINKCMD_CONFIRM_FINISH_TRADE], [LINKCMD_READY_FINISH_TRADE]];
    HandleLinkDataReceive(runtime);
    expect(runtime.mainCallback2).toBe('CB2_TryLinkTradeEvolution');
    expect(runtime.tradeAnim.partnerFinishStatus).toBe(STATUS_READY);
    expect(runtime.resetBlockReceivedFlags).toEqual([0, 1]);

    runtime.tradeAnim.playerFinishStatus = STATUS_READY;
    runtime.tradeAnim.partnerFinishStatus = STATUS_READY;
    runtime.blockReceivedStatus = 0;
    CB2_WaitTradeComplete(runtime);
    expect(runtime.sentBlocks.at(-1)?.data[0]).toBe(LINKCMD_CONFIRM_FINISH_TRADE);
    expect(runtime.tradeAnim.playerFinishStatus).toBe(STATUS_CANCEL);
    expect(runtime.tradeAnim.partnerFinishStatus).toBe(STATUS_CANCEL);
  });

  test('TradeMons swaps parties, clears sent mail, attaches partner mail, friendship, and pokedex effects', () => {
    const runtime = createTradeSceneRuntime({
      saveMail: [{ words: [], playerName: 'ME', trainerId: [], species: 1, itemId: 1 }],
      linkPartnerMail: [{ words: [1], playerName: 'THEM', trainerId: [0], species: 2, itemId: 2 }],
      playerParty: [createTradeSceneMon({ species: 1, speciesOrEgg: 1, nickname: 'SENT', mail: 0 })],
      enemyParty: [createTradeSceneMon({ species: 2, speciesOrEgg: 2, nickname: 'GOT', personality: 44, mail: 0 })]
    });
    TradeMons(runtime, 0, 0);
    expect(runtime.playerParty[0]).toMatchObject({ nickname: 'GOT', friendship: 70, mail: 0 });
    expect(runtime.enemyParty[0]).toMatchObject({ nickname: 'SENT' });
    expect(runtime.saveMail[0]).toBeNull();
    expect(runtime.operations).toContain('PokedexSeen:2:44');
    expect(runtime.operations).toContain('PokedexCaught:2:44');
  });

  test('in-game trade helpers fill strings, species, mail, and generated Pokemon data exactly from records', () => {
    const runtime = createTradeSceneRuntime({
      playerParty: [createTradeSceneMon({ species: 10, nickname: 'RAT', level: 17 })],
      enemyParty: [createTradeSceneMon()],
      inGameTrades: [inGameTrade()],
      inGameTradeMailMessages: [[9, 8, 7]],
      speciesNames: Object.assign([], { 21: 'SPEAROW', 25: 'PIKACHU' }),
      specialVar8004: 0,
      specialVar8005: 0
    });

    expect(GetInGameTradeSpeciesInfo(runtime)).toBe(25);
    expect(runtime.stringVar1).toBe('PIKACHU');
    expect(runtime.stringVar2).toBe('SPEAROW');
    expect(GetTradeSpecies(runtime)).toBe(10);
    runtime.playerParty[0].isEgg = true;
    expect(GetTradeSpecies(runtime)).toBe(SPECIES_NONE);

    CreateInGameTradePokemonInternal(runtime, 0, 0);
    expect(runtime.enemyParty[0]).toMatchObject({
      species: 21,
      level: 17,
      nickname: 'SPEARY',
      otName: 'Dux',
      heldItem: 222,
      mail: 0,
      statsCalculated: true
    });
    expect(runtime.enemyParty[0].ivs).toEqual([1, 2, 3, 4, 5, 6]);
    expect(runtime.linkPartnerMail[0]).toMatchObject({
      words: [9, 8, 7],
      playerName: 'Dux',
      trainerId: [0x12, 0x34, 0x56, 0x78],
      species: 21,
      itemId: 222
    });
  });

  test('trade animation entry states and finish callback perform the same high-level mutations', () => {
    const runtime = createTradeSceneRuntime({
      currentMapMusic: 123,
      tradeAnim: createTradeSceneAnim({ isCableTrade: true, state: STATE_START, bg2hofs: 3, monSpecies: [10, 20] }),
      sprites: [createTradeSceneSprite({ id: 0, invisible: true }), createTradeSceneSprite({ id: 1 })]
    });
    expect(DoTradeAnim_Cable(runtime)).toBe(false);
    expect(runtime.sprites[0]).toMatchObject({ invisible: false, x2: -180 });
    expect(runtime.tradeAnim?.cachedMapMusic).toBe(123);

    runtime.tradeAnim!.state = STATE_MON_SLIDE_IN;
    expect(DoTradeAnim_Cable(runtime)).toBe(false);
    expect(runtime.sprites[0].x2).toBe(-177);
    expect(runtime.tradeAnim?.bg2hofs).toBe(0);

    runtime.tradeAnim!.state = STATE_SEND_MSG;
    expect(DoTradeAnim_Cable(runtime)).toBe(false);
    expect(runtime.stringVar4).toBe('gText_XWillBeSentToY');
    expect(runtime.operations).toContain('PlayCry_Normal:10');

    runtime.tradeAnim!.state = STATE_END_LINK_TRADE;
    expect(DoTradeAnim_Cable(runtime)).toBe(true);

    runtime.tradeAnim!.state = STATE_END_LINK_TRADE;
    CB2_UpdateLinkTrade(runtime);
    expect(runtime.mainCallback2).toBe('CB2_WaitTradeComplete');
    expect(runtime.sentBlocks.at(-1)?.data[0]).toBe(LINKCMD_READY_FINISH_TRADE);
  });

  test('wireless signal and center column tasks preserve task data and destroy conditions', () => {
    const runtime = createTradeSceneRuntime({
      tasks: [{ id: 0, data: Array.from({ length: 16 }, () => 0), destroyed: false }]
    });
    Task_AnimateWirelessSignal(runtime, 0);
    expect(runtime.loadedPalettes.at(-1)).toMatchObject({ name: 'sWirelessSignalAnimPals_Outbound', offset: 0 });
    expect(runtime.operations).toContain('PlaySE:SE_M_HEAL_BELL');
    expect(runtime.tasks[0].data[1]).toBe(1);
    Task_AnimateWirelessSignal(runtime, 0);
    expect(runtime.tasks[0].data[0]).toBe(1);
    expect(runtime.tasks[0].data[1]).toBe(0);

    runtime.tasks[0] = { id: 0, data: Array.from({ length: 16 }, () => 0), destroyed: false };
    Task_OpenCenterWhiteColumn(runtime, 0);
    expect(runtime.tradeAnim).toMatchObject({ win0left: 115, win0right: 125, win0top: 0, win0bottom: 160 });
    while (!runtime.tasks[0].destroyed)
      Task_OpenCenterWhiteColumn(runtime, 0);
    expect(runtime.tradeAnim!.win0left).toBeLessThan(80);

    runtime.tasks[0] = { id: 0, data: Array.from({ length: 16 }, () => 0), destroyed: false };
    Task_CloseCenterWhiteColumn(runtime, 0);
    expect(runtime.tradeAnim).toMatchObject({ win0left: 85, win0right: 155 });
    while (!runtime.tasks[0].destroyed)
      Task_CloseCenterWhiteColumn(runtime, 0);
    expect(runtime.tradeAnim).toMatchObject({ win0left: 120, win0right: 120 });
  });

  test('nickname buffering and ribbon checks follow link vs in-game branches', () => {
    const runtime = createTradeSceneRuntime({
      tradeAnim: createTradeSceneAnim({ isLinkTrade: true }),
      selectedTradeMonPositions: [0, 0],
      linkPlayers: [{ name: 'PLAYER' }, { name: 'FRIEND' }],
      playerParty: [createTradeSceneMon({ nickname: 'MINE' })],
      enemyParty: [createTradeSceneMon({ nickname: 'THEIRS', ribbons: [0, 0, 1] })],
      inGameTrades: [inGameTrade({ nickname: 'DUX', otName: 'ELYSIA' })]
    });
    TradeBufferOTnameAndNicknames(runtime);
    expect([runtime.stringVar1, runtime.stringVar2, runtime.stringVar3]).toEqual(['FRIEND', 'MINE', 'THEIRS']);

    runtime.tradeAnim!.isLinkTrade = false;
    TradeBufferOTnameAndNicknames(runtime);
    expect([runtime.stringVar1, runtime.stringVar2, runtime.stringVar3]).toEqual(['ELYSIA', 'MINE', 'DUX']);

    CheckPartnersMonForRibbons(runtime);
    expect(runtime.flags.has('FLAG_SYS_RIBBON_GET')).toBe(true);
  });
});
