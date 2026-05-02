import { describe, expect, test } from 'vitest';
import { RGB } from '../src/game/decompPalette';
import {
  B_EXPBAR_NUM_TILES,
  B_HEALTHBAR_NUM_PIXELS,
  B_HEALTHBAR_NUM_TILES,
  B_INTERFACE_GFX_EXP_BAR,
  B_INTERFACE_GFX_BALL_CAUGHT,
  B_INTERFACE_GFX_BOTTOM_RIGHT_CORNER_HP_AS_TEXT,
  B_INTERFACE_GFX_HP_BAR_GREEN,
  B_INTERFACE_GFX_HP_BAR_HP_TEXT,
  B_INTERFACE_GFX_HP_BAR_LEFT_BORDER,
  B_INTERFACE_GFX_HP_BAR_RED,
  B_INTERFACE_GFX_HP_BAR_YELLOW,
  B_INTERFACE_GFX_STATUS_BRN_BATTLER0,
  B_INTERFACE_GFX_STATUS_FRZ_BATTLER0,
  B_INTERFACE_GFX_STATUS_NONE,
  B_INTERFACE_GFX_STATUS_PAR_BATTLER0,
  B_INTERFACE_GFX_STATUS_PSN_BATTLER0,
  B_INTERFACE_GFX_STATUS_SLP_BATTLER0,
  B_INTERFACE_GFX_TRANSPARENT,
  B_POSITION_OPPONENT_LEFT,
  B_POSITION_OPPONENT_RIGHT,
  B_POSITION_PLAYER_LEFT,
  B_POSITION_PLAYER_RIGHT,
  B_SIDE_OPPONENT,
  B_SIDE_PLAYER,
  BATTLE_TYPE_FIRST_BATTLE,
  BATTLE_TYPE_MULTI,
  BATTLE_TYPE_OLD_MAN_TUTORIAL,
  BATTLE_TYPE_POKEDUDE,
  BATTLE_TYPE_SAFARI,
  BATTLE_TYPE_TRAINER,
  B_INTERFACE_GFX_BOTTOM_RIGHT_CORNER_HP_AS_BAR,
  B_INTERFACE_GFX_SAFARI_HEALTHBOX_0,
  B_INTERFACE_GFX_SAFARI_HEALTHBOX_1,
  B_INTERFACE_GFX_SAFARI_HEALTHBOX_2,
  BLDCNT_EFFECT_BLEND,
  BLDCNT_TGT2_ALL,
  BLDALPHA_BLEND,
  AddTextPrinterAndCreateWindowOnHealthbox,
  CalcBarFilledPixels,
  CalcNewBarValue,
  CalcNewHealthbarValue,
  CHAR_FEMALE,
  CHAR_MALE,
  CreateBattlerHealthboxSprites,
  CreatePartyStatusSummarySprites,
  CreateSafariPlayerHealthboxSprites,
  Debug_DrawNumber,
  Debug_DrawNumberPair,
  DISPLAY_WIDTH,
  DestoryHealthboxSprite,
  DoDrawHealthbarOntoScreen,
  DrawHealthbarOntoScreen,
  DummyBattleInterfaceFunc,
  EXP_BAR,
  GetBattleInterfaceGfxPtr,
  GetHPBarLevel,
  GetReceivedValueInPixels,
  GetScaledHPFraction,
  GetStatusIconForBattlerId,
  HEALTH_BAR,
  HEALTHBOX_ALL,
  HEALTHBOX_HEALTH_BAR,
  HEALTHBOX_LEVEL,
  HEALTHBOX_NICK,
  HEALTHBOX_SAFARI_ALL_TEXT,
  HEALTHBOX_SAFARI_BALLS_TEXT,
  HEALTHBOX_STATUS_ICON,
  HP_BAR_EMPTY,
  HP_BAR_FULL,
  HP_BAR_GREEN,
  HP_BAR_RED,
  HEALTHBAR_TYPE_OPPONENT,
  HEALTHBAR_TYPE_PLAYER_DOUBLE,
  HEALTHBAR_TYPE_PLAYER_SINGLE,
  InitBattlerHealthboxCoords,
  HP_BAR_YELLOW,
  HP_EMPTY_SLOT,
  MAX_LEVEL,
  MoveBattleBar,
  MoveBattleBarGraphically,
  PAL_STATUS_BRN,
  PAL_STATUS_FRZ,
  PAL_STATUS_PAR,
  PAL_STATUS_PSN,
  PAL_STATUS_SLP,
  PIXEL_FILL,
  MON_FEMALE,
  MON_MALE,
  RemoveWindowOnHealthbox,
  SetHealthboxSpriteInvisible,
  SetHealthboxSpriteVisible,
  SpriteCB_HealthBar,
  SpriteCB_HealthBoxOther,
  SpriteCB_PartySummaryBall_Exit,
  SpriteCB_PartySummaryBall_OnBattleStart,
  SpriteCB_PartySummaryBall_OnSwitchout,
  SpriteCB_PartySummaryBar,
  SpriteCB_PartySummaryBar_Exit,
  SetBattleBarStruct,
  PrintSafariMonInfo,
  PARTY_SIZE,
  REG_OFFSET_BLDALPHA,
  REG_OFFSET_BLDCNT,
  SE_BALL_TRAY_BALL,
  SE_BALL_TRAY_ENTER,
  SE_BALL_TRAY_EXIT,
  SafariTextIntoHealthboxObject,
  SOUND_PAN_ATTACKER,
  SOUND_PAN_TARGET,
  ST_OAM_OBJ_BLEND,
  ST_OAM_HFLIP,
  STATUS1_BURN,
  STATUS1_PSN_ANY,
  SPECIES_NIDORAN_F,
  SPRITE_SHAPE_64x64,
  SUBSPRITES_IGNORE_PRIORITY,
  TAG_HEALTHBAR_OPPONENT1_TILE,
  TAG_HEALTHBAR_OPPONENT2_TILE,
  TAG_HEALTHBAR_PAL,
  TAG_HEALTHBAR_PLAYER1_TILE,
  TAG_HEALTHBAR_PLAYER2_TILE,
  TAG_HEALTHBOX_OPPONENT1_TILE,
  TAG_HEALTHBOX_OPPONENT2_TILE,
  TAG_HEALTHBOX_PAL,
  TAG_HEALTHBOX_PLAYER1_TILE,
  TAG_HEALTHBOX_PLAYER2_TILE,
  TAG_HEALTHBOX_SAFARI_TILE,
  TAG_PARTY_SUMMARY_BALL_OPPONENT_PAL,
  TAG_PARTY_SUMMARY_BALL_OPPONENT_TILE,
  TAG_PARTY_SUMMARY_BALL_PLAYER_PAL,
  TAG_PARTY_SUMMARY_BALL_PLAYER_TILE,
  TAG_PARTY_SUMMARY_BAR_OPPONENT_PAL,
  TAG_PARTY_SUMMARY_BAR_OPPONENT_TILE,
  TAG_PARTY_SUMMARY_BAR_PLAYER_PAL,
  TAG_PARTY_SUMMARY_BAR_PLAYER_TILE,
  Task_HidePartyStatusSummary,
  Task_HidePartyStatusSummary_BattleStart_1,
  Task_HidePartyStatusSummary_BattleStart_2,
  Task_HidePartyStatusSummary_DuringBattle,
  TextIntoHealthboxObject,
  TILE_SIZE_4BPP,
  TryAddPokeballIconToHealthbox,
  UpdateAndDrawHealthbarOntoScreen,
  UpdateHealthboxAttribute,
  UpdateHpTextInHealthbox,
  UpdateHpTextInHealthboxInDoubles,
  UpdateLeftNoOfBallsTextOnHealthbox,
  UpdateLvlInHealthbox,
  UpdateNickInHealthbox,
  UpdateSafariBallsTextOnHealthbox,
  UpdateStatusIconInHealthbox,
  UpdateSpritePos,
  UpdateOamPriorityInAllHealthboxes,
  WINDOW_TILE_DATA,
  SwapHpBarsWithHpText,
  TEXT_DYNAMIC_COLOR_1,
  TEXT_DYNAMIC_COLOR_2,
  createBattleInterfaceSprite,
  createBattleInterfaceRuntime,
  sHealthBar_SubspriteTable,
  sHealthBar_Subsprites_Opponent,
  sHealthBar_Subsprites_Player,
  sHealthbarSpriteTemplates,
  sHealthboxOpponentSpriteTemplates,
  sHealthboxPlayerSpriteTemplates,
  sHealthboxSafariSpriteTemplate,
  sHealthboxWindowTemplate,
  sBattleInterface_Unused,
  sOamData_Healthbar,
  sOamData_Healthbox,
  sOamData_Healthbox2,
  sOamData_PartySummaryBall,
  sPartySummaryBallSpritePals,
  sPartySummaryBallSpriteSheets,
  sPartySummaryBallSpriteTemplates,
  sPartySummaryBarSpritePals,
  sPartySummaryBarSpriteSheets,
  sPartySummaryBarSpriteTemplates,
  sStatusIconColors,
  sStatusSummaryBar_SubspriteTable_Enter,
  sStatusSummaryBar_SubspriteTable_Exit,
  sStatusSummaryBar_Subsprites_Enter,
  sStatusSummaryBar_Subsprites_Exit,
  sText_Slash,
  sUnused_SubspriteTable,
  sUnused_Subsprites_0,
  sUnused_Subsprites_1,
  sUnused_Subsprites_2,
  sUnused_Subsprites_3
} from '../src/game/decompBattleInterface';

describe('decompBattleInterface', () => {
  test('battle interface gfx section constants match battle_interface.c', () => {
    expect(B_INTERFACE_GFX_HP_BAR_GREEN).toBe(3);
    expect(B_INTERFACE_GFX_EXP_BAR).toBe(12);
    expect(B_INTERFACE_GFX_HP_BAR_YELLOW).toBe(47);
    expect(B_INTERFACE_GFX_HP_BAR_RED).toBe(56);
  });

  test('status icon palette indexes and colors match battle_interface.c', () => {
    expect([PAL_STATUS_PSN, PAL_STATUS_PAR, PAL_STATUS_SLP, PAL_STATUS_FRZ, PAL_STATUS_BRN]).toEqual([0, 1, 2, 3, 4]);
    expect(sStatusIconColors).toEqual([
      RGB(24, 12, 24),
      RGB(23, 23, 3),
      RGB(20, 20, 17),
      RGB(17, 22, 28),
      RGB(28, 14, 10)
    ]);
  });

  test('static slash text and unused interface incbin marker match battle_interface.c', () => {
    expect(sText_Slash).toBe('/');
    expect(sBattleInterface_Unused).toEqual({
      incbin: 'graphics/battle_interface/unused.4bpp',
      type: 'u16'
    });
  });

  test('GetBattleInterfaceGfxPtr returns the exact battle interface gfx element pointer marker', () => {
    expect(GetBattleInterfaceGfxPtr(B_INTERFACE_GFX_HP_BAR_HP_TEXT)).toBe('gBattleInterface_Gfx[1]');
    expect(GetBattleInterfaceGfxPtr(B_INTERFACE_GFX_BALL_CAUGHT)).toBe('gBattleInterface_Gfx[70]');
  });

  test('healthbox and status-summary subsprite tables match battle_interface.c', () => {
    expect(sUnused_Subsprites_0).toEqual([
      { x: -16, y: 0, shape: 1, size: 3, tileOffset: 0, priority: 1 },
      { x: 48, y: 0, shape: 0, size: 2, tileOffset: 32, priority: 1 },
      { x: -16, y: 32, shape: 1, size: 1, tileOffset: 48, priority: 1 },
      { x: 16, y: 32, shape: 1, size: 1, tileOffset: 52, priority: 1 },
      { x: 48, y: 32, shape: 1, size: 1, tileOffset: 56, priority: 1 }
    ]);
    expect(sUnused_Subsprites_1).toEqual([
      { x: -16, y: 0, shape: 1, size: 3, tileOffset: 0, priority: 1 },
      { x: 48, y: 0, shape: 0, size: 2, tileOffset: 32, priority: 1 }
    ]);
    expect(sUnused_Subsprites_2).toEqual([
      { x: -16, y: 0, shape: 1, size: 3, tileOffset: 64, priority: 1 },
      { x: 48, y: 0, shape: 0, size: 2, tileOffset: 96, priority: 1 },
      { x: -16, y: 32, shape: 1, size: 1, tileOffset: 112, priority: 1 },
      { x: 16, y: 32, shape: 1, size: 1, tileOffset: 116, priority: 1 },
      { x: 48, y: 32, shape: 1, size: 1, tileOffset: 120, priority: 1 }
    ]);
    expect(sUnused_Subsprites_3).toEqual(sUnused_Subsprites_1);
    expect(sUnused_SubspriteTable.map((table) => table.count)).toEqual([5, 2, 5, 2]);

    expect(sHealthBar_Subsprites_Player).toEqual([
      { x: -16, y: 0, shape: 1, size: 1, tileOffset: 0, priority: 1 },
      { x: 16, y: 0, shape: 1, size: 1, tileOffset: 4, priority: 1 }
    ]);
    expect(sHealthBar_Subsprites_Opponent).toEqual([
      { x: -16, y: 0, shape: 1, size: 1, tileOffset: 0, priority: 1 },
      { x: 16, y: 0, shape: 1, size: 1, tileOffset: 4, priority: 1 },
      { x: -32, y: 0, shape: 0, size: 0, tileOffset: 8, priority: 1 }
    ]);
    expect(sHealthBar_SubspriteTable).toEqual([
      { count: 2, subsprites: sHealthBar_Subsprites_Player },
      { count: 3, subsprites: sHealthBar_Subsprites_Opponent }
    ]);

    expect(sStatusSummaryBar_Subsprites_Enter.map((subsprite) => subsprite.tileOffset)).toEqual([0, 4, 8, 12]);
    expect(sStatusSummaryBar_Subsprites_Enter.map((subsprite) => subsprite.x)).toEqual([-96, -64, -32, 0]);
    expect(sStatusSummaryBar_Subsprites_Exit.map((subsprite) => subsprite.tileOffset)).toEqual([0, 4, 8, 8, 8, 12]);
    expect(sStatusSummaryBar_Subsprites_Exit.map((subsprite) => subsprite.x)).toEqual([-96, -64, -32, 0, 32, 64]);
    expect(sStatusSummaryBar_SubspriteTable_Enter).toEqual([{ count: 4, subsprites: sStatusSummaryBar_Subsprites_Enter }]);
    expect(sStatusSummaryBar_SubspriteTable_Exit).toEqual([{ count: 6, subsprites: sStatusSummaryBar_Subsprites_Exit }]);
  });

  test('healthbox, healthbar, and party summary sprite templates match battle_interface.c', () => {
    expect([TAG_HEALTHBOX_PLAYER1_TILE, TAG_HEALTHBOX_PLAYER2_TILE, TAG_HEALTHBOX_OPPONENT1_TILE, TAG_HEALTHBOX_OPPONENT2_TILE]).toEqual([55039, 55040, 55041, 55042]);
    expect([TAG_HEALTHBAR_PLAYER1_TILE, TAG_HEALTHBAR_OPPONENT1_TILE, TAG_HEALTHBAR_PLAYER2_TILE, TAG_HEALTHBAR_OPPONENT2_TILE]).toEqual([55044, 55045, 55046, 55047]);
    expect([TAG_PARTY_SUMMARY_BAR_PLAYER_TILE, TAG_PARTY_SUMMARY_BAR_OPPONENT_TILE, TAG_PARTY_SUMMARY_BAR_PLAYER_PAL, TAG_PARTY_SUMMARY_BAR_OPPONENT_PAL]).toEqual([55052, 55053, 55056, 55057]);
    expect([TAG_PARTY_SUMMARY_BALL_PLAYER_PAL, TAG_PARTY_SUMMARY_BALL_OPPONENT_PAL, TAG_PARTY_SUMMARY_BALL_PLAYER_TILE, TAG_PARTY_SUMMARY_BALL_OPPONENT_TILE]).toEqual([55058, 55059, 55060, 55061]);
    expect([TAG_HEALTHBOX_PAL, TAG_HEALTHBAR_PAL, TAG_HEALTHBOX_SAFARI_TILE]).toEqual([TAG_HEALTHBOX_PLAYER1_TILE, TAG_HEALTHBAR_PLAYER1_TILE, 55051]);

    expect(sOamData_Healthbox).toEqual({ shape: 1, size: 3, priority: 1 });
    expect(sOamData_Healthbox2).toEqual(sOamData_Healthbox);
    expect(sOamData_Healthbar).toEqual({ shape: 1, size: 1, priority: 1 });
    expect(sOamData_PartySummaryBall).toEqual({ shape: 0, size: 0, priority: 1 });

    expect(sHealthboxPlayerSpriteTemplates.map((template) => [template.tileTag, template.paletteTag, template.oam, template.callback])).toEqual([
      [TAG_HEALTHBOX_PLAYER1_TILE, TAG_HEALTHBOX_PAL, sOamData_Healthbox, 'SpriteCallbackDummy'],
      [TAG_HEALTHBOX_PLAYER2_TILE, TAG_HEALTHBOX_PAL, sOamData_Healthbox, 'SpriteCallbackDummy']
    ]);
    expect(sHealthboxOpponentSpriteTemplates.map((template) => [template.tileTag, template.paletteTag, template.oam, template.callback])).toEqual([
      [TAG_HEALTHBOX_OPPONENT1_TILE, TAG_HEALTHBOX_PAL, sOamData_Healthbox, 'SpriteCallbackDummy'],
      [TAG_HEALTHBOX_OPPONENT2_TILE, TAG_HEALTHBOX_PAL, sOamData_Healthbox, 'SpriteCallbackDummy']
    ]);
    expect(sHealthboxSafariSpriteTemplate).toMatchObject({
      tileTag: TAG_HEALTHBOX_SAFARI_TILE,
      paletteTag: TAG_HEALTHBOX_PAL,
      oam: sOamData_Healthbox,
      callback: 'SpriteCallbackDummy'
    });
    expect(sHealthbarSpriteTemplates.map((template) => [template.tileTag, template.paletteTag, template.oam, template.callback])).toEqual([
      [TAG_HEALTHBAR_PLAYER1_TILE, TAG_HEALTHBAR_PAL, sOamData_Healthbar, 'SpriteCB_HealthBar'],
      [TAG_HEALTHBAR_OPPONENT1_TILE, TAG_HEALTHBAR_PAL, sOamData_Healthbar, 'SpriteCB_HealthBar'],
      [TAG_HEALTHBAR_PLAYER2_TILE, TAG_HEALTHBAR_PAL, sOamData_Healthbar, 'SpriteCB_HealthBar'],
      [TAG_HEALTHBAR_OPPONENT2_TILE, TAG_HEALTHBAR_PAL, sOamData_Healthbar, 'SpriteCB_HealthBar']
    ]);

    expect(sPartySummaryBarSpriteSheets).toEqual([
      { data: 'gBattleInterface_PartySummaryBar_Gfx', size: 16 * TILE_SIZE_4BPP, tag: TAG_PARTY_SUMMARY_BAR_PLAYER_TILE },
      { data: 'gBattleInterface_PartySummaryBar_Gfx', size: 16 * TILE_SIZE_4BPP, tag: TAG_PARTY_SUMMARY_BAR_OPPONENT_TILE }
    ]);
    expect(sPartySummaryBallSpriteSheets).toEqual([
      { data: 'gBattleInterface_Gfx+66', size: 4 * TILE_SIZE_4BPP, tag: TAG_PARTY_SUMMARY_BALL_PLAYER_TILE },
      { data: 'gBattleInterface_Gfx+66', size: 4 * TILE_SIZE_4BPP, tag: TAG_PARTY_SUMMARY_BALL_OPPONENT_TILE }
    ]);
    expect(sPartySummaryBarSpritePals).toEqual([
      { data: 'gBattleInterface_Healthbox_Pal', tag: TAG_PARTY_SUMMARY_BAR_PLAYER_PAL },
      { data: 'gBattleInterface_Healthbox_Pal', tag: TAG_PARTY_SUMMARY_BAR_OPPONENT_PAL }
    ]);
    expect(sPartySummaryBallSpritePals).toEqual([
      { data: 'gBattleInterface_Healthbar_Pal', tag: TAG_PARTY_SUMMARY_BALL_PLAYER_PAL },
      { data: 'gBattleInterface_Healthbar_Pal', tag: TAG_PARTY_SUMMARY_BALL_OPPONENT_PAL }
    ]);
    expect(sPartySummaryBarSpriteTemplates.map((template) => [template.tileTag, template.paletteTag, template.oam, template.callback])).toEqual([
      [TAG_PARTY_SUMMARY_BAR_PLAYER_TILE, TAG_PARTY_SUMMARY_BAR_PLAYER_PAL, sOamData_Healthbox, 'SpriteCB_PartySummaryBar'],
      [TAG_PARTY_SUMMARY_BAR_OPPONENT_TILE, TAG_PARTY_SUMMARY_BAR_OPPONENT_PAL, sOamData_Healthbox, 'SpriteCB_PartySummaryBar']
    ]);
    expect(sPartySummaryBallSpriteTemplates.map((template) => [template.tileTag, template.paletteTag, template.oam, template.callback])).toEqual([
      [TAG_PARTY_SUMMARY_BALL_PLAYER_TILE, TAG_PARTY_SUMMARY_BALL_PLAYER_PAL, sOamData_PartySummaryBall, 'SpriteCB_PartySummaryBall_OnBattleStart'],
      [TAG_PARTY_SUMMARY_BALL_OPPONENT_TILE, TAG_PARTY_SUMMARY_BALL_OPPONENT_PAL, sOamData_PartySummaryBall, 'SpriteCB_PartySummaryBall_OnBattleStart']
    ]);
  });

  test('healthbox window template matches battle_interface.c', () => {
    expect(sHealthboxWindowTemplate).toEqual({
      bg: 0,
      tilemapLeft: 0,
      tilemapTop: 0,
      width: 8,
      height: 2,
      paletteNum: 0,
      baseBlock: 0
    });
  });

  test('healthbox text/window helpers mirror the exact C helper side effects', () => {
    const runtime = createBattleInterfaceRuntime();

    const created = AddTextPrinterAndCreateWindowOnHealthbox(runtime, 'ABC', 4, 5);
    TextIntoHealthboxObject(runtime, 0x1000, created.windowTileData, 0x40, 2);
    SafariTextIntoHealthboxObject(runtime, 0x2000, created.windowTileData, 0x80, 3);
    RemoveWindowOnHealthbox(runtime, created.windowId);

    expect(created).toEqual({ windowTileData: 'windowTileData:0', windowId: 0 });
    expect(runtime.textWindows).toEqual([
      { fn: 'AddTextPrinterAndCreateWindowOnHealthbox', text: 'ABC', x: 4, y: 5, windowId: 0 }
    ]);
    expect(runtime.healthboxTextCopies).toEqual([
      { fn: 'TextIntoHealthboxObject', dest: 0x1000, text: 'windowTileData:0', sourceOffset: 0x40, width: 2 },
      { fn: 'SafariTextIntoHealthboxObject', dest: 0x2000, text: 'windowTileData:0', sourceOffset: 0x80, width: 3 }
    ]);
    expect(runtime.vramCopies).toEqual([
      { src: 'windowTileData:0+320', dest: 0x1100, size: 2 * TILE_SIZE_4BPP },
      { src: 'windowTileData:0+84', dest: 0x1014, size: 12 },
      { src: 'windowTileData:0+116', dest: 0x1034, size: 12 },
      { src: 'windowTileData:0+128', dest: 0x2000, size: 3 * TILE_SIZE_4BPP },
      { src: 'windowTileData:0+384', dest: 0x2100, size: 3 * TILE_SIZE_4BPP }
    ]);
    expect(runtime.calls.map((call) => call.fn)).toEqual([
      'AddTextPrinterAndCreateWindowOnHealthbox',
      'AddWindow',
      'FillWindowPixelBuffer',
      'AddTextPrinterParameterized4',
      'GetWindowAttribute',
      'TextIntoHealthboxObject',
      'CpuCopy32',
      'CpuCopy32',
      'CpuCopy32',
      'SafariTextIntoHealthboxObject',
      'CpuCopy32',
      'CpuCopy32',
      'RemoveWindowOnHealthbox',
      'RemoveWindow'
    ]);
  });

  test('GetStatusIconForBattlerId maps only base status elements through the exact C switch', () => {
    const cases = [
      [B_INTERFACE_GFX_STATUS_PSN_BATTLER0, [21, 71, 86, 101]],
      [B_INTERFACE_GFX_STATUS_PAR_BATTLER0, [24, 74, 89, 104]],
      [B_INTERFACE_GFX_STATUS_SLP_BATTLER0, [27, 77, 92, 107]],
      [B_INTERFACE_GFX_STATUS_FRZ_BATTLER0, [30, 80, 95, 110]],
      [B_INTERFACE_GFX_STATUS_BRN_BATTLER0, [33, 83, 98, 113]]
    ] as const;

    for (const [baseElement, battlerResults] of cases) {
      for (let battlerId = 0; battlerId < 4; battlerId += 1)
        expect(GetStatusIconForBattlerId(baseElement, battlerId)).toBe(battlerResults[battlerId]);
    }

    expect(GetStatusIconForBattlerId(B_INTERFACE_GFX_STATUS_NONE, 3)).toBe(B_INTERFACE_GFX_STATUS_NONE);
    expect(GetStatusIconForBattlerId(B_INTERFACE_GFX_STATUS_PSN_BATTLER0, 99)).toBe(101);
  });

  test('UpdateStatusIconInHealthbox clears three status tiles and restores HP text when no status is set', () => {
    const healthbox = createBattleInterfaceSprite(2);
    const healthbar = createBattleInterfaceSprite(6);
    healthbox.oam.tileNum = 10;
    healthbox.data[5] = 6;
    healthbox.data[6] = 0;
    healthbar.oam.tileNum = 40;
    const runtime = createBattleInterfaceRuntime({
      isDoubleBattle: false,
      battlerSides: [B_SIDE_PLAYER],
      playerParty: [{ status: 0 }],
      battlerPartyIndexes: [0],
      sprites: Object.assign([], { 2: healthbox, 6: healthbar })
    });

    UpdateStatusIconInHealthbox(runtime, 2);

    expect(runtime.vramCopies).toEqual([
      { src: `gBattleInterface_Gfx[${B_INTERFACE_GFX_STATUS_NONE}]`, dest: (10 + 0x1a) * TILE_SIZE_4BPP, size: TILE_SIZE_4BPP },
      { src: `gBattleInterface_Gfx[${B_INTERFACE_GFX_STATUS_NONE}]`, dest: (10 + 0x1a + 1) * TILE_SIZE_4BPP, size: TILE_SIZE_4BPP },
      { src: `gBattleInterface_Gfx[${B_INTERFACE_GFX_STATUS_NONE}]`, dest: (10 + 0x1a + 2) * TILE_SIZE_4BPP, size: TILE_SIZE_4BPP },
      { src: `gBattleInterface_Gfx[${B_INTERFACE_GFX_HP_BAR_HP_TEXT}]`, dest: 40 * TILE_SIZE_4BPP, size: 2 * TILE_SIZE_4BPP }
    ]);
    expect(runtime.paletteFills).toEqual([]);
    expect(runtime.vramFills).toEqual([]);
  });

  test('UpdateStatusIconInHealthbox follows status priority and statused opponent VRAM/palette writes', () => {
    const healthbox = createBattleInterfaceSprite(2);
    const healthbar = createBattleInterfaceSprite(6);
    healthbox.oam.tileNum = 5;
    healthbox.oam.paletteNum = 2;
    healthbox.data[5] = 6;
    healthbox.data[6] = 1;
    healthbar.oam.tileNum = 20;
    const runtime = createBattleInterfaceRuntime({
      battlerSides: [B_SIDE_PLAYER, B_SIDE_OPPONENT],
      battlerPartyIndexes: [0, 0],
      enemyParty: [{ species: 25, status: STATUS1_PSN_ANY | STATUS1_BURN }],
      caughtNationalDexNums: new Set([25]),
      sprites: Object.assign([], { 2: healthbox, 6: healthbar })
    });

    UpdateStatusIconInHealthbox(runtime, 2);

    const pltAdder = 2 * 16 + 1 + 12;
    expect(runtime.paletteFills).toEqual([{ value: RGB(24, 12, 24), offset: 0x100 + pltAdder, size: 2 }]);
    expect(runtime.paletteCopies16).toEqual([{ srcOffset: 0x100 + pltAdder, dest: pltAdder, size: 2 }]);
    expect(runtime.gPlttBufferUnfaded[0x100 + pltAdder]).toBe(RGB(24, 12, 24));
    expect(runtime.objPltt[pltAdder]).toBe(RGB(24, 12, 24));
    expect(runtime.vramCopies).toEqual([
      { src: 'gBattleInterface_Gfx[71]', dest: (5 + 0x11) * TILE_SIZE_4BPP, size: 3 * TILE_SIZE_4BPP },
      { src: `gBattleInterface_Gfx[${B_INTERFACE_GFX_TRANSPARENT}]`, dest: 20 * TILE_SIZE_4BPP, size: TILE_SIZE_4BPP },
      { src: `gBattleInterface_Gfx[${B_INTERFACE_GFX_HP_BAR_LEFT_BORDER}]`, dest: (20 + 1) * TILE_SIZE_4BPP, size: TILE_SIZE_4BPP }
    ]);
    expect(runtime.vramFills).toEqual([{ value: 0, dest: (20 + 8) * TILE_SIZE_4BPP, size: TILE_SIZE_4BPP }]);
  });

  test('Safari healthbox text helpers create windows and copy the same tile slices as battle_interface.c', () => {
    const healthbox = createBattleInterfaceSprite(4);
    healthbox.oam.tileNum = 3;
    const runtime = createBattleInterfaceRuntime({
      gNumSafariBalls: 7,
      stringWidthOverrides: new Map([['{HIGHLIGHT 2}Left: 7', 31]]),
      sprites: Object.assign([], { 4: healthbox })
    });

    UpdateSafariBallsTextOnHealthbox(runtime, 4);
    UpdateLeftNoOfBallsTextOnHealthbox(runtime, 4);

    expect(runtime.textWindows).toEqual([
      { fn: 'AddTextPrinterAndCreateWindowOnHealthbox', text: '{HIGHLIGHT 2}SAFARI BALLS', x: 0, y: 3, windowId: 0 },
      { fn: 'AddTextPrinterAndCreateWindowOnHealthbox', text: '{HIGHLIGHT 2}Left: 7', x: 16, y: 3, windowId: 1 }
    ]);
    expect(runtime.calls.slice(0, 5)).toEqual([
      { fn: 'AddTextPrinterAndCreateWindowOnHealthbox', args: ['{HIGHLIGHT 2}SAFARI BALLS', 0, 3, 0] },
      { fn: 'AddWindow', args: [sHealthboxWindowTemplate, 0] },
      { fn: 'FillWindowPixelBuffer', args: [0, PIXEL_FILL(2)] },
      { fn: 'AddTextPrinterParameterized4', args: [0, 0, 0, 3, 0, 0, [2, 1, 3], -1, '{HIGHLIGHT 2}SAFARI BALLS'] },
      { fn: 'GetWindowAttribute', args: [0, WINDOW_TILE_DATA, 'windowTileData:0'] }
    ]);
    expect(runtime.calls).toContainEqual({ fn: 'RemoveWindow', args: [0] });
    expect(runtime.healthboxTextCopies).toEqual([
      { fn: 'TextIntoHealthboxObject', dest: 0x40 + 3 * TILE_SIZE_4BPP, text: 'windowTileData:0', sourceOffset: 0, width: 6 },
      { fn: 'TextIntoHealthboxObject', dest: 0x800 + 3 * TILE_SIZE_4BPP, text: 'windowTileData:0', sourceOffset: 0xc0, width: 2 },
      { fn: 'SafariTextIntoHealthboxObject', dest: 0x2c0 + 3 * TILE_SIZE_4BPP, text: 'windowTileData:1', sourceOffset: 0, width: 2 },
      { fn: 'SafariTextIntoHealthboxObject', dest: 0xa00 + 3 * TILE_SIZE_4BPP, text: 'windowTileData:1', sourceOffset: 0x40, width: 4 }
    ]);
    expect(runtime.vramCopies).toEqual([
      { src: 'windowTileData:0+256', dest: 0x40 + 3 * TILE_SIZE_4BPP + 256, size: 6 * TILE_SIZE_4BPP },
      { src: 'windowTileData:0+20', dest: 0x40 + 3 * TILE_SIZE_4BPP + 20, size: 12 },
      { src: 'windowTileData:0+52', dest: 0x40 + 3 * TILE_SIZE_4BPP + 52, size: 12 },
      { src: 'windowTileData:0+84', dest: 0x40 + 3 * TILE_SIZE_4BPP + 84, size: 12 },
      { src: 'windowTileData:0+116', dest: 0x40 + 3 * TILE_SIZE_4BPP + 116, size: 12 },
      { src: 'windowTileData:0+148', dest: 0x40 + 3 * TILE_SIZE_4BPP + 148, size: 12 },
      { src: 'windowTileData:0+180', dest: 0x40 + 3 * TILE_SIZE_4BPP + 180, size: 12 },
      { src: 'windowTileData:0+448', dest: 0x800 + 3 * TILE_SIZE_4BPP + 256, size: 2 * TILE_SIZE_4BPP },
      { src: 'windowTileData:0+212', dest: 0x800 + 3 * TILE_SIZE_4BPP + 20, size: 12 },
      { src: 'windowTileData:0+244', dest: 0x800 + 3 * TILE_SIZE_4BPP + 52, size: 12 },
      { src: 'windowTileData:1+0', dest: 0x2c0 + 3 * TILE_SIZE_4BPP, size: 2 * TILE_SIZE_4BPP },
      { src: 'windowTileData:1+256', dest: 0x2c0 + 3 * TILE_SIZE_4BPP + 256, size: 2 * TILE_SIZE_4BPP },
      { src: 'windowTileData:1+64', dest: 0xa00 + 3 * TILE_SIZE_4BPP, size: 4 * TILE_SIZE_4BPP },
      { src: 'windowTileData:1+320', dest: 0xa00 + 3 * TILE_SIZE_4BPP + 256, size: 4 * TILE_SIZE_4BPP }
    ]);
  });

  test('UpdateLvlInHealthbox prints level text to exact single, double, and opponent destinations', () => {
    const playerSingle = createBattleInterfaceSprite(2);
    const playerDouble = createBattleInterfaceSprite(3);
    const opponent = createBattleInterfaceSprite(4);
    playerSingle.oam.tileNum = 1;
    playerSingle.data[6] = 0;
    playerDouble.oam.tileNum = 2;
    playerDouble.data[6] = 0;
    opponent.oam.tileNum = 3;
    opponent.data[6] = 1;

    const singles = createBattleInterfaceRuntime({
      battlerSides: [B_SIDE_PLAYER, B_SIDE_OPPONENT],
      sprites: Object.assign([], { 2: playerSingle, 4: opponent })
    });
    UpdateLvlInHealthbox(singles, 2, 7);
    UpdateLvlInHealthbox(singles, 4, 100);
    expect(singles.textWindows.map((entry) => [entry.text, entry.x, entry.y])).toEqual([
      ['{LV_2}7', 10, 3],
      ['{LV_2}100', 0, 3]
    ]);
    expect(singles.healthboxTextCopies).toEqual([
      { fn: 'TextIntoHealthboxObject', dest: 1 * TILE_SIZE_4BPP + 0x820, text: 'windowTileData:0', sourceOffset: 0, width: 3 },
      { fn: 'TextIntoHealthboxObject', dest: 3 * TILE_SIZE_4BPP + 0x400, text: 'windowTileData:1', sourceOffset: 0, width: 3 }
    ]);

    const doubles = createBattleInterfaceRuntime({
      isDoubleBattle: true,
      battlerSides: [B_SIDE_PLAYER],
      sprites: Object.assign([], { 3: playerDouble })
    });
    UpdateLvlInHealthbox(doubles, 3, 42);
    expect(doubles.healthboxTextCopies).toEqual([
      { fn: 'TextIntoHealthboxObject', dest: 2 * TILE_SIZE_4BPP + 0x420, text: 'windowTileData:0', sourceOffset: 0, width: 3 }
    ]);
  });

  test('UpdateHpTextInHealthbox writes single-battle player current and max HP text like the C function', () => {
    const healthbox = createBattleInterfaceSprite(2);
    healthbox.oam.tileNum = 5;
    healthbox.data[6] = 0;
    const runtime = createBattleInterfaceRuntime({
      battlerSides: [B_SIDE_PLAYER],
      sprites: Object.assign([], { 2: healthbox })
    });

    UpdateHpTextInHealthbox(runtime, 2, 84, 0);
    UpdateHpTextInHealthbox(runtime, 2, 123, 1);

    expect(runtime.textWindows).toEqual([
      { fn: 'AddTextPrinterAndCreateWindowOnHealthbox', text: ' 84/', x: 4, y: 5, windowId: 0 },
      { fn: 'AddTextPrinterAndCreateWindowOnHealthbox', text: '123', x: 0, y: 5, windowId: 1 }
    ]);
    expect(runtime.textWindows[0]?.text.endsWith(sText_Slash)).toBe(true);
    expect(runtime.healthboxTextCopies).toEqual([
      { fn: 'TextIntoHealthboxObject', dest: 5 * TILE_SIZE_4BPP + 0x2e0, text: 'windowTileData:0', sourceOffset: 0, width: 1 },
      { fn: 'TextIntoHealthboxObject', dest: 5 * TILE_SIZE_4BPP + 0xa00, text: 'windowTileData:0', sourceOffset: 0x20, width: 2 },
      { fn: 'TextIntoHealthboxObject', dest: 5 * TILE_SIZE_4BPP + 0xa40, text: 'windowTileData:1', sourceOffset: 0, width: 2 }
    ]);
  });

  test('UpdateHpTextInHealthboxInDoubles is a no-op unless hpNumbersNoBars is set', () => {
    const playerDouble = createBattleInterfaceSprite(2);
    const healthbar = createBattleInterfaceSprite(6);
    playerDouble.data[5] = 6;
    playerDouble.data[6] = 0;
    const runtime = createBattleInterfaceRuntime({
      isDoubleBattle: true,
      battlerSides: [B_SIDE_PLAYER],
      sprites: Object.assign([], { 2: playerDouble, 6: healthbar })
    });

    UpdateHpTextInHealthboxInDoubles(runtime, 2, 33, 0);

    expect(runtime.renderedBarFontTexts).toEqual([]);
    expect(runtime.vramCopies).toEqual([]);
    expect(runtime.vramFills).toEqual([]);
  });

  test('UpdateHpTextInHealthboxInDoubles copies current HP digits, slash tile, and clears HP text tile', () => {
    const playerDouble = createBattleInterfaceSprite(2);
    const healthbar = createBattleInterfaceSprite(6);
    playerDouble.data[5] = 6;
    playerDouble.data[6] = 0;
    healthbar.oam.tileNum = 20;

    const runtime = createBattleInterfaceRuntime({
      isDoubleBattle: true,
      battlerSides: [B_SIDE_PLAYER],
      battlerData: [{ hpNumbersNoBars: true }],
      sprites: Object.assign([], { 2: playerDouble, 6: healthbar })
    });

    UpdateHpTextInHealthboxInDoubles(runtime, 2, 33, 0);

    expect(runtime.renderedBarFontTexts).toEqual([{ target: 'gMonSpritesGfxPtr->barFontGfx', text: '{COLOR 01}{HIGHLIGHT 00} 33/', x: 0, y: 0 }]);
    expect(runtime.vramCopies).toEqual([
      { src: 'gMonSpritesGfxPtr->barFontGfx[32]', dest: (1 + 20 + 0) * TILE_SIZE_4BPP, size: TILE_SIZE_4BPP },
      { src: 'gMonSpritesGfxPtr->barFontGfx[96]', dest: (1 + 20 + 1) * TILE_SIZE_4BPP, size: TILE_SIZE_4BPP },
      { src: 'gMonSpritesGfxPtr->barFontGfx[160]', dest: (1 + 20 + 2) * TILE_SIZE_4BPP, size: TILE_SIZE_4BPP },
      { src: 'gMonSpritesGfxPtr->barFontGfx[224]', dest: (20 + 4) * TILE_SIZE_4BPP, size: TILE_SIZE_4BPP }
    ]);
    expect(runtime.vramFills).toEqual([{ value: 0, dest: 20 * TILE_SIZE_4BPP, size: TILE_SIZE_4BPP }]);
  });

  test('UpdateHpTextInHealthboxInDoubles copies max HP digits and player corner tile only for player side', () => {
    const playerBox = createBattleInterfaceSprite(2);
    const playerBar = createBattleInterfaceSprite(6);
    const opponentBox = createBattleInterfaceSprite(3);
    const opponentBar = createBattleInterfaceSprite(7);
    playerBox.oam.tileNum = 5;
    playerBox.data[5] = 6;
    playerBox.data[6] = 0;
    playerBar.oam.tileNum = 20;
    opponentBox.oam.tileNum = 8;
    opponentBox.data[5] = 7;
    opponentBox.data[6] = 1;
    opponentBar.oam.tileNum = 30;
    const runtime = createBattleInterfaceRuntime({
      isDoubleBattle: true,
      battlerSides: [B_SIDE_PLAYER, B_SIDE_OPPONENT],
      battlerData: [{ hpNumbersNoBars: true }, { hpNumbersNoBars: true }],
      sprites: Object.assign([], { 2: playerBox, 3: opponentBox, 6: playerBar, 7: opponentBar })
    });

    UpdateHpTextInHealthboxInDoubles(runtime, 2, 99, 1);
    UpdateHpTextInHealthboxInDoubles(runtime, 3, 44, 1);

    expect(runtime.renderedBarFontTexts).toEqual([
      { target: 'gMonSpritesGfxPtr->barFontGfx', text: '{COLOR 01}{HIGHLIGHT 00} 99', x: 0, y: 0 },
      { target: 'gMonSpritesGfxPtr->barFontGfx', text: '{COLOR 01}{HIGHLIGHT 00} 44', x: 0, y: 0 }
    ]);
    expect(runtime.vramCopies).toEqual([
      { src: 'gMonSpritesGfxPtr->barFontGfx[32]', dest: 0x20 + (4 + 20) * TILE_SIZE_4BPP, size: TILE_SIZE_4BPP },
      { src: 'gMonSpritesGfxPtr->barFontGfx[96]', dest: 0x20 + (5 + 20) * TILE_SIZE_4BPP, size: TILE_SIZE_4BPP },
      { src: 'gMonSpritesGfxPtr->barFontGfx[160]', dest: 0x20 + (6 + 20) * TILE_SIZE_4BPP, size: TILE_SIZE_4BPP },
      { src: `gBattleInterface_Gfx[${B_INTERFACE_GFX_BOTTOM_RIGHT_CORNER_HP_AS_TEXT}]`, dest: (5 + 52) * TILE_SIZE_4BPP, size: TILE_SIZE_4BPP },
      { src: 'gMonSpritesGfxPtr->barFontGfx[32]', dest: 0x20 + (4 + 30) * TILE_SIZE_4BPP, size: TILE_SIZE_4BPP },
      { src: 'gMonSpritesGfxPtr->barFontGfx[96]', dest: 0x20 + (5 + 30) * TILE_SIZE_4BPP, size: TILE_SIZE_4BPP },
      { src: 'gMonSpritesGfxPtr->barFontGfx[160]', dest: 0x20 + (6 + 30) * TILE_SIZE_4BPP, size: TILE_SIZE_4BPP }
    ]);
  });

  test('PrintSafariMonInfo renders nature/status debug tiles with exact Safari element classification and factor copies', () => {
    const healthbox = createBattleInterfaceSprite(2);
    const healthbar = createBattleInterfaceSprite(6);
    healthbox.oam.tileNum = 10;
    healthbox.data[5] = 6;
    healthbox.data[6] = 0;
    healthbar.oam.tileNum = 40;
    const runtime = createBattleInterfaceRuntime({
      battlerPositions: [B_POSITION_PLAYER_RIGHT],
      natureNames: ['7KzA{'],
      safariCatchFactor: 3,
      safariEscapeFactor: 12,
      sprites: Object.assign([], { 2: healthbox, 6: healthbar })
    });

    PrintSafariMonInfo(runtime, 2, { nature: 0 });

    expect(runtime.renderedBarFontTexts).toEqual([
      { target: 'gMonSpritesGfxPtr->barFontGfx[2080]', text: '{COLOR 01}{HIGHLIGHT 02}7KzA{', x: 0, y: 0 },
      { target: 'gMonSpritesGfxPtr->barFontGfx', text: '{COLOR 01}{HIGHLIGHT 02} 3/12', x: 0, y: 0 }
    ]);
    expect(runtime.vramCopies.slice(0, 5)).toEqual([
      { src: `gBattleInterface_Gfx[${B_INTERFACE_GFX_SAFARI_HEALTHBOX_1}]`, dest: 2080, size: 0x20 },
      { src: `gBattleInterface_Gfx[${B_INTERFACE_GFX_SAFARI_HEALTHBOX_2}]`, dest: 2144, size: 0x20 },
      { src: `gBattleInterface_Gfx[${B_INTERFACE_GFX_SAFARI_HEALTHBOX_0}]`, dest: 2208, size: 0x20 },
      { src: `gBattleInterface_Gfx[${B_INTERFACE_GFX_SAFARI_HEALTHBOX_1}]`, dest: 2272, size: 0x20 },
      { src: `gBattleInterface_Gfx[${B_INTERFACE_GFX_SAFARI_HEALTHBOX_0}]`, dest: 2336, size: 0x20 }
    ]);
    expect(runtime.vramCopies.slice(-5)).toEqual([
      { src: 'gMonSpritesGfxPtr->barFontGfx[32]', dest: (40 + 2) * TILE_SIZE_4BPP, size: 32 },
      { src: 'gMonSpritesGfxPtr->barFontGfx[96]', dest: (40 + 3) * TILE_SIZE_4BPP, size: 32 },
      { src: 'gMonSpritesGfxPtr->barFontGfx[160]', dest: 0xc0 + (40 + 2) * TILE_SIZE_4BPP, size: 32 },
      { src: 'gMonSpritesGfxPtr->barFontGfx[224]', dest: 0xc0 + (40 + 3) * TILE_SIZE_4BPP, size: 32 },
      { src: 'gMonSpritesGfxPtr->barFontGfx[288]', dest: 0xc0 + (40 + 4) * TILE_SIZE_4BPP, size: 32 }
    ]);
  });

  test('SwapHpBarsWithHpText toggles eligible double-battle player boxes between bars and text exactly', () => {
    const healthbox = createBattleInterfaceSprite(2);
    const healthbar = createBattleInterfaceSprite(6);
    healthbox.callback = 'SpriteCallbackDummy';
    healthbox.oam.tileNum = 5;
    healthbox.data[5] = 6;
    healthbox.data[6] = 0;
    healthbar.oam.tileNum = 20;
    const runtime = createBattleInterfaceRuntime({
      isDoubleBattle: true,
      battlersCount: 1,
      battlerSides: [B_SIDE_PLAYER],
      battlerPartyIndexes: [0],
      healthboxSpriteIds: [2],
      playerParty: [{ hp: 33, maxHp: 99, status: 0 }],
      sprites: Object.assign([], { 2: healthbox, 6: healthbar })
    });

    SwapHpBarsWithHpText(runtime);

    expect(runtime.battlerData[0].hpNumbersNoBars).toBe(true);
    expect(healthbox.data[7]).toBe(1);
    expect(runtime.vramFills).toEqual([
      { value: 0, dest: 20 * TILE_SIZE_4BPP, size: 8 * TILE_SIZE_4BPP },
      { value: 0, dest: 20 * TILE_SIZE_4BPP, size: TILE_SIZE_4BPP }
    ]);
    expect(runtime.renderedBarFontTexts.map((entry) => entry.text)).toEqual([
      '{COLOR 01}{HIGHLIGHT 00} 33/',
      '{COLOR 01}{HIGHLIGHT 00} 99'
    ]);

    runtime.vramCopies = [];
    runtime.vramFills = [];
    runtime.renderedBarFontTexts = [];
    SwapHpBarsWithHpText(runtime);

    expect(runtime.battlerData[0].hpNumbersNoBars).toBe(false);
    expect(healthbox.data[7]).toBe(0);
    expect(runtime.vramCopies).toContainEqual({
      src: `gBattleInterface_Gfx[${B_INTERFACE_GFX_BOTTOM_RIGHT_CORNER_HP_AS_BAR}]`,
      dest: 0x680 + 5 * TILE_SIZE_4BPP,
      size: TILE_SIZE_4BPP
    });
  });

  test('SwapHpBarsWithHpText preserves C filtering for safari player boxes and opponents', () => {
    const playerBox = createBattleInterfaceSprite(2);
    const opponentBox = createBattleInterfaceSprite(3);
    playerBox.callback = 'SpriteCallbackDummy';
    opponentBox.callback = 'SpriteCallbackDummy';
    playerBox.data[6] = 0;
    opponentBox.data[6] = 1;
    const runtime = createBattleInterfaceRuntime({
      isDoubleBattle: true,
      battleTypeFlags: BATTLE_TYPE_SAFARI,
      battlersCount: 2,
      battlerSides: [B_SIDE_PLAYER, B_SIDE_OPPONENT],
      healthboxSpriteIds: [2, 3],
      sprites: Object.assign([], { 2: playerBox, 3: opponentBox })
    });

    SwapHpBarsWithHpText(runtime);

    expect(runtime.battlerData[0].hpNumbersNoBars).toBe(true);
    expect(playerBox.data[7]).toBe(0);
    expect(runtime.battlerData[1].hpNumbersNoBars).toBe(false);
    expect(opponentBox.data[7]).toBe(0);
    expect(runtime.vramCopies).toEqual([]);
    expect(runtime.vramFills).toEqual([]);
  });

  test('party summary bar callbacks preserve enter and exit speed math', () => {
    const runtime = createBattleInterfaceRuntime();
    const bar = createBattleInterfaceSprite(8);
    bar.x2 = 100;
    bar.data[0] = -5;

    SpriteCB_PartySummaryBar(runtime, bar);
    expect(bar.x2).toBe(95);

    bar.x2 = 0;
    SpriteCB_PartySummaryBar(runtime, bar);
    expect(bar.x2).toBe(0);

    const exitingPositive = createBattleInterfaceSprite(9);
    exitingPositive.x2 = 10;
    exitingPositive.data[0] = 5;
    exitingPositive.data[1] = 0;
    SpriteCB_PartySummaryBar_Exit(runtime, exitingPositive);
    expect(exitingPositive.x2).toBe(12);
    expect(exitingPositive.data[1]).toBe(0);

    const exitingNegative = createBattleInterfaceSprite(10);
    exitingNegative.x2 = -10;
    exitingNegative.data[0] = -5;
    exitingNegative.data[1] = 8;
    SpriteCB_PartySummaryBar_Exit(runtime, exitingNegative);
    expect(exitingNegative.x2).toBe(-12);
    expect(exitingNegative.data[1]).toBe(8);
  });

  test('party summary battle-start ball callback waits, accelerates, clamps, plays panned sound, and becomes dummy', () => {
    const waiting = createBattleInterfaceSprite(1);
    waiting.data[1] = 2;
    waiting.x2 = 120;
    SpriteCB_PartySummaryBall_OnBattleStart(createBattleInterfaceRuntime(), waiting);
    expect(waiting.data[1]).toBe(1);
    expect(waiting.x2).toBe(120);

    const playerBall = createBattleInterfaceSprite(2);
    const runtime = createBattleInterfaceRuntime();
    playerBall.x2 = 2;
    playerBall.data[2] = 0;
    playerBall.data[3] = 0;
    playerBall.data[7] = 0;
    SpriteCB_PartySummaryBall_OnBattleStart(runtime, playerBall);
    expect(playerBall.x2).toBe(0);
    expect(playerBall.data[3]).toBe(48);
    expect(playerBall.callback).toBe('SpriteCallbackDummy');
    expect(runtime.soundPans).toEqual([{ fn: 'PlaySE1WithPanning', se: SE_BALL_TRAY_BALL, pan: SOUND_PAN_TARGET }]);

    const opponentEmptyBall = createBattleInterfaceSprite(3);
    const opponentRuntime = createBattleInterfaceRuntime();
    opponentEmptyBall.x2 = -2;
    opponentEmptyBall.data[2] = 1;
    opponentEmptyBall.data[3] = 0;
    opponentEmptyBall.data[7] = 1;
    SpriteCB_PartySummaryBall_OnBattleStart(opponentRuntime, opponentEmptyBall);
    expect(opponentEmptyBall.x2).toBe(0);
    expect(opponentEmptyBall.callback).toBe('SpriteCallbackDummy');
    expect(opponentRuntime.soundPans).toEqual([{ fn: 'PlaySE2WithPanning', se: SE_BALL_TRAY_EXIT, pan: SOUND_PAN_ATTACKER }]);
  });

  test('party summary ball exit callback waits, accelerates outward, and hides offscreen balls', () => {
    const waiting = createBattleInterfaceSprite(1, 40);
    waiting.data[1] = 1;
    waiting.x2 = 0;
    SpriteCB_PartySummaryBall_Exit(createBattleInterfaceRuntime(), waiting);
    expect(waiting.data[1]).toBe(0);
    expect(waiting.x2).toBe(0);

    const playerBall = createBattleInterfaceSprite(2, -6);
    playerBall.x2 = 0;
    playerBall.data[2] = 0;
    playerBall.data[3] = 56;
    SpriteCB_PartySummaryBall_Exit(createBattleInterfaceRuntime(), playerBall);
    expect(playerBall.x2).toBe(-7);
    expect(playerBall.data[3]).toBe(112);
    expect(playerBall.invisible).toBe(true);
    expect(playerBall.callback).toBe('SpriteCallbackDummy');

    const opponentBall = createBattleInterfaceSprite(3, DISPLAY_WIDTH + 7);
    opponentBall.x2 = 0;
    opponentBall.data[2] = 1;
    opponentBall.data[3] = 56;
    SpriteCB_PartySummaryBall_Exit(createBattleInterfaceRuntime(), opponentBall);
    expect(opponentBall.x2).toBe(7);
    expect(opponentBall.invisible).toBe(true);
    expect(opponentBall.callback).toBe('SpriteCallbackDummy');
  });

  test('party summary switchout ball callback mirrors linked summary bar offsets', () => {
    const bar = createBattleInterfaceSprite(5);
    const ball = createBattleInterfaceSprite(6);
    bar.x2 = -88;
    bar.y2 = 12;
    ball.data[0] = 5;
    const runtime = createBattleInterfaceRuntime({
      sprites: Object.assign([], { 5: bar, 6: ball })
    });

    SpriteCB_PartySummaryBall_OnSwitchout(runtime, ball);

    expect(ball.x2).toBe(-88);
    expect(ball.y2).toBe(12);
  });

  test('CreatePartyStatusSummarySprites creates player battle-start summary sprites and task data in C order', () => {
    const runtime = createBattleInterfaceRuntime({
      battlerSides: [B_SIDE_PLAYER],
      battlerPositions: [B_POSITION_PLAYER_LEFT]
    });
    const partyInfo = [
      { hp: 12, status: 0 },
      { hp: 0, status: 0 },
      { hp: 22, status: STATUS1_BURN },
      { hp: HP_EMPTY_SLOT, status: 0 },
      { hp: HP_EMPTY_SLOT, status: 0 },
      { hp: HP_EMPTY_SLOT, status: 0 }
    ];

    const taskId = CreatePartyStatusSummarySprites(runtime, 0, partyInfo, false, true);

    expect(taskId).toBe(0);
    expect(runtime.loadedSpriteResources).toEqual([
      { fn: 'LoadCompressedSpriteSheetUsingHeap', resource: sPartySummaryBarSpriteSheets[0] },
      { fn: 'LoadSpriteSheet', resource: sPartySummaryBallSpriteSheets[0] },
      { fn: 'LoadSpritePalette', resource: sPartySummaryBarSpritePals[0] },
      { fn: 'LoadSpritePalette', resource: sPartySummaryBallSpritePals[0] }
    ]);
    expect(runtime.spriteCreations.map((creation) => [creation.fn, creation.template, creation.x, creation.y, creation.subpriority])).toEqual([
      ['CreateSprite', 'sPartySummaryBarSpriteTemplates[0]', 136, 96, 10],
      ['CreateSpriteAtEnd', 'sPartySummaryBallSpriteTemplates[0]', 136, 92, 9],
      ['CreateSpriteAtEnd', 'sPartySummaryBallSpriteTemplates[0]', 136, 92, 9],
      ['CreateSpriteAtEnd', 'sPartySummaryBallSpriteTemplates[0]', 136, 92, 9],
      ['CreateSpriteAtEnd', 'sPartySummaryBallSpriteTemplates[0]', 136, 92, 9],
      ['CreateSpriteAtEnd', 'sPartySummaryBallSpriteTemplates[0]', 136, 92, 9],
      ['CreateSpriteAtEnd', 'sPartySummaryBallSpriteTemplates[0]', 136, 92, 9]
    ]);
    const summary = runtime.sprites[0]!;
    expect(summary).toMatchObject({ x: 232, y: 96, x2: 100, data: expect.arrayContaining([-5]), callback: 'SpriteCB_PartySummaryBar' });
    expect(runtime.subspriteTableSets).toEqual([{ spriteId: 0, table: 'sStatusSummaryBar_SubspriteTable_Enter' }]);
    expect(Array.from({ length: PARTY_SIZE }, (_, index) => runtime.sprites[index + 1]!.x)).toEqual([160, 170, 180, 190, 200, 210]);
    expect(Array.from({ length: PARTY_SIZE }, (_, index) => runtime.sprites[index + 1]!.data[1])).toEqual([10, 17, 24, 31, 38, 45]);
    expect(Array.from({ length: PARTY_SIZE }, (_, index) => runtime.sprites[index + 1]!.x2)).toEqual([120, 120, 120, 120, 120, 120]);
    expect(Array.from({ length: PARTY_SIZE }, (_, index) => runtime.sprites[index + 1]!.oam.tileNum)).toEqual([0, 3, 2, 1, 1, 1]);
    expect(Array.from({ length: PARTY_SIZE }, (_, index) => runtime.sprites[index + 1]!.data[7])).toEqual([0, 0, 0, 1, 1, 1]);
    expect(runtime.tasks[0]).toMatchObject({
      id: 0,
      func: 'TaskDummy',
      destroyed: false,
      data: expect.arrayContaining([0, 0])
    });
    expect(runtime.tasks[0]!.data.slice(3, 9)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(runtime.tasks[0]!.data[10]).toBe(1);
    expect(runtime.soundPans).toEqual([{ fn: 'PlaySE12WithPanning', se: SE_BALL_TRAY_ENTER, pan: 0 }]);
  });

  test('CreatePartyStatusSummarySprites preserves opponent reversal, switchout callback, multi slots, and hflip', () => {
    const runtime = createBattleInterfaceRuntime({
      isDoubleBattle: true,
      battleTypeFlags: BATTLE_TYPE_MULTI,
      battlerSides: [B_SIDE_PLAYER, B_SIDE_OPPONENT],
      battlerPositions: [B_POSITION_PLAYER_LEFT, B_POSITION_OPPONENT_RIGHT]
    });
    const partyInfo = [
      { hp: HP_EMPTY_SLOT, status: 0 },
      { hp: 0, status: 0 },
      { hp: 10, status: STATUS1_BURN },
      { hp: 20, status: 0 },
      { hp: 30, status: STATUS1_BURN },
      { hp: HP_EMPTY_SLOT, status: 0 }
    ];

    const taskId = CreatePartyStatusSummarySprites(runtime, 1, partyInfo, true, false);

    expect(taskId).toBe(0);
    expect(runtime.spriteCreations[0]).toMatchObject({ template: 'sPartySummaryBarSpriteTemplates[1]', x: 104, y: 40 });
    expect(runtime.sprites[0]).toMatchObject({ x: 8, y: 40, x2: -100, data: expect.arrayContaining([5]), callback: 'SpriteCB_PartySummaryBar' });
    expect(runtime.sprites[0]!.oam.affineParam).toBe(ST_OAM_HFLIP);
    expect(Array.from({ length: PARTY_SIZE }, (_, index) => runtime.sprites[index + 1]!.callback)).toEqual([
      'SpriteCB_PartySummaryBall_OnSwitchout',
      'SpriteCB_PartySummaryBall_OnSwitchout',
      'SpriteCB_PartySummaryBall_OnSwitchout',
      'SpriteCB_PartySummaryBall_OnSwitchout',
      'SpriteCB_PartySummaryBall_OnSwitchout',
      'SpriteCB_PartySummaryBall_OnSwitchout'
    ]);
    expect(Array.from({ length: PARTY_SIZE }, (_, index) => runtime.sprites[index + 1]!.x)).toEqual([30, 40, 50, 60, 70, 80]);
    expect(Array.from({ length: PARTY_SIZE }, (_, index) => runtime.sprites[index + 1]!.data[1])).toEqual([52, 45, 38, 31, 24, 17]);
    expect(Array.from({ length: PARTY_SIZE }, (_, index) => runtime.sprites[index + 1]!.x2)).toEqual([-120, -120, -120, -120, -120, -120]);
    expect(Array.from({ length: PARTY_SIZE }, (_, index) => runtime.sprites[index + 1]!.data[2])).toEqual([1, 1, 1, 1, 1, 1]);
    expect(Array.from({ length: PARTY_SIZE }, (_, index) => runtime.sprites[index + 1]!.oam.tileNum)).toEqual([1, 2, 0, 2, 3, 1]);
    expect(Array.from({ length: PARTY_SIZE }, (_, index) => runtime.sprites[index + 1]!.data[7])).toEqual([1, 0, 0, 0, 0, 1]);
    expect(runtime.tasks[0]!.data.slice(0, 11)).toEqual([1, 0, 0, 1, 2, 3, 4, 5, 6, 0, 0]);
  });

  test('Task_HidePartyStatusSummary initializes battle-start fade, blend mode, and exit callbacks in C data order', () => {
    const summary = createBattleInterfaceSprite(10);
    summary.data[0] = -6;
    const balls = Array.from({ length: PARTY_SIZE }, (_, index) => createBattleInterfaceSprite(20 + index));
    const task = {
      id: 1,
      data: Array.from({ length: 16 }, () => 0),
      func: null,
      destroyed: false
    };
    task.data[0] = 0;
    task.data[1] = 10;
    for (let i = 0; i < PARTY_SIZE; i += 1)
      task.data[3 + i] = 20 + i;
    task.data[10] = 1;
    const runtime = createBattleInterfaceRuntime({
      battlerSides: [B_SIDE_PLAYER],
      sprites: Object.assign([], { 10: summary, 20: balls[0], 21: balls[1], 22: balls[2], 23: balls[3], 24: balls[4], 25: balls[5] }),
      tasks: Object.assign([], { 1: task })
    });

    Task_HidePartyStatusSummary(runtime, 1);

    expect(runtime.gpuRegs.get(REG_OFFSET_BLDCNT)).toBe(BLDCNT_TGT2_ALL | BLDCNT_EFFECT_BLEND);
    expect(runtime.gpuRegs.get(REG_OFFSET_BLDALPHA)).toBe(BLDALPHA_BLEND(16, 0));
    expect(task.data[15]).toBe(16);
    expect([summary, ...balls].map((sprite) => sprite.oam.objMode)).toEqual(Array.from({ length: 7 }, () => ST_OAM_OBJ_BLEND));
    expect(balls.map((sprite) => [sprite.data[1], sprite.data[3], sprite.data[4], sprite.callback])).toEqual([
      [0, 0, 0, 'SpriteCB_PartySummaryBall_Exit'],
      [7, 0, 0, 'SpriteCB_PartySummaryBall_Exit'],
      [14, 0, 0, 'SpriteCB_PartySummaryBall_Exit'],
      [21, 0, 0, 'SpriteCB_PartySummaryBall_Exit'],
      [28, 0, 0, 'SpriteCB_PartySummaryBall_Exit'],
      [35, 0, 0, 'SpriteCB_PartySummaryBall_Exit']
    ]);
    expect(summary.data[0]).toBe(-3);
    expect(summary.data[1]).toBe(0);
    expect(summary.callback).toBe('SpriteCB_PartySummaryBar_Exit');
    expect(runtime.subspriteTableSets).toEqual([{ spriteId: 10, table: 'sStatusSummaryBar_SubspriteTable_Exit' }]);
    expect(task.func).toBe('Task_HidePartyStatusSummary_BattleStart_1');
  });

  test('Task_HidePartyStatusSummary reverses battle-start ball timer assignment for non-player battlers', () => {
    const summary = createBattleInterfaceSprite(10);
    const balls = Array.from({ length: PARTY_SIZE }, (_, index) => createBattleInterfaceSprite(20 + index));
    const task = {
      id: 2,
      data: Array.from({ length: 16 }, () => 0),
      func: null,
      destroyed: false
    };
    task.data[0] = 1;
    task.data[1] = 10;
    for (let i = 0; i < PARTY_SIZE; i += 1)
      task.data[3 + i] = 20 + i;
    task.data[10] = 1;
    const runtime = createBattleInterfaceRuntime({
      battlerSides: [B_SIDE_PLAYER, B_SIDE_OPPONENT],
      sprites: Object.assign([], { 10: summary, 20: balls[0], 21: balls[1], 22: balls[2], 23: balls[3], 24: balls[4], 25: balls[5] }),
      tasks: Object.assign([], { 2: task })
    });

    Task_HidePartyStatusSummary(runtime, 2);

    expect(balls.map((sprite) => sprite.data[1])).toEqual([35, 28, 21, 14, 7, 0]);
  });

  test('Task_HidePartyStatusSummary_BattleStart_1 fades every other tick and advances at zero weight', () => {
    const task = { id: 1, data: Array.from({ length: 16 }, () => 0), func: null, destroyed: false };
    task.data[11] = 0;
    task.data[15] = 2;
    const runtime = createBattleInterfaceRuntime({ tasks: Object.assign([], { 1: task }) });

    Task_HidePartyStatusSummary_BattleStart_1(runtime, 1);
    expect(task.data[11]).toBe(1);
    expect(task.data[15]).toBe(1);
    expect(runtime.gpuRegs.get(REG_OFFSET_BLDALPHA)).toBe(BLDALPHA_BLEND(1, 15));

    Task_HidePartyStatusSummary_BattleStart_1(runtime, 1);
    expect(task.data[11]).toBe(2);
    expect(task.data[15]).toBe(1);

    Task_HidePartyStatusSummary_BattleStart_1(runtime, 1);
    expect(task.data[15]).toBe(0);
    expect(task.func).toBe('Task_HidePartyStatusSummary_BattleStart_2');
  });

  test('Task_HidePartyStatusSummary_BattleStart_2 destroys resources at -1 and clears blend regs at -3', () => {
    const summary = createBattleInterfaceSprite(10);
    const balls = Array.from({ length: PARTY_SIZE }, (_, index) => createBattleInterfaceSprite(20 + index));
    const task = { id: 1, data: Array.from({ length: 16 }, () => 0), func: null, destroyed: false };
    task.data[1] = 10;
    for (let i = 0; i < PARTY_SIZE; i += 1)
      task.data[3 + i] = 20 + i;
    task.data[15] = 0;
    const runtime = createBattleInterfaceRuntime({
      sprites: Object.assign([], { 10: summary, 20: balls[0], 21: balls[1], 22: balls[2], 23: balls[3], 24: balls[4], 25: balls[5] }),
      tasks: Object.assign([], { 1: task })
    });

    Task_HidePartyStatusSummary_BattleStart_2(runtime, 1);
    expect(task.data[15]).toBe(-1);
    expect(runtime.destroyedSpriteResources).toEqual([10, 20]);
    expect(runtime.destroyedSprites).toEqual([21, 22, 23, 24, 25]);

    Task_HidePartyStatusSummary_BattleStart_2(runtime, 1);
    expect(task.data[15]).toBe(-2);
    expect(runtime.destroyedTasks).toEqual([]);

    Task_HidePartyStatusSummary_BattleStart_2(runtime, 1);
    expect(task.data[15]).toBe(-3);
    expect(runtime.gpuRegs.get(REG_OFFSET_BLDCNT)).toBe(0);
    expect(runtime.gpuRegs.get(REG_OFFSET_BLDALPHA)).toBe(0);
    expect(task.destroyed).toBe(true);
    expect(runtime.destroyedTasks).toEqual([1]);
  });

  test('Task_HidePartyStatusSummary_DuringBattle fades immediately then uses the same destroy and cleanup thresholds', () => {
    const summary = createBattleInterfaceSprite(10);
    const balls = Array.from({ length: PARTY_SIZE }, (_, index) => createBattleInterfaceSprite(20 + index));
    const task = { id: 1, data: Array.from({ length: 16 }, () => 0), func: null, destroyed: false };
    task.data[1] = 10;
    for (let i = 0; i < PARTY_SIZE; i += 1)
      task.data[3 + i] = 20 + i;
    task.data[15] = 1;
    const runtime = createBattleInterfaceRuntime({
      sprites: Object.assign([], { 10: summary, 20: balls[0], 21: balls[1], 22: balls[2], 23: balls[3], 24: balls[4], 25: balls[5] }),
      tasks: Object.assign([], { 1: task })
    });

    Task_HidePartyStatusSummary_DuringBattle(runtime, 1);
    expect(task.data[15]).toBe(0);
    expect(runtime.gpuRegs.get(REG_OFFSET_BLDALPHA)).toBe(BLDALPHA_BLEND(0, 16));

    Task_HidePartyStatusSummary_DuringBattle(runtime, 1);
    expect(runtime.destroyedSpriteResources).toEqual([10, 20]);
    expect(runtime.destroyedSprites).toEqual([21, 22, 23, 24, 25]);

    Task_HidePartyStatusSummary_DuringBattle(runtime, 1);
    expect(runtime.destroyedTasks).toEqual([]);

    Task_HidePartyStatusSummary_DuringBattle(runtime, 1);
    expect(runtime.gpuRegs.get(REG_OFFSET_BLDCNT)).toBe(0);
    expect(runtime.gpuRegs.get(REG_OFFSET_BLDALPHA)).toBe(0);
    expect(runtime.destroyedTasks).toEqual([1]);
  });

  test('UpdateNickInHealthbox renders player nickname, male symbol, and single-battle second tile copy like C', () => {
    const healthbox = createBattleInterfaceSprite(4);
    healthbox.oam.tileNum = 7;
    healthbox.data[6] = 0;
    const runtime = createBattleInterfaceRuntime({
      battlerSides: [B_SIDE_PLAYER],
      isDoubleBattle: false,
      sprites: Object.assign([], { 4: healthbox })
    });

    UpdateNickInHealthbox(runtime, 4, { nickname: 'RHYDON', species: 112, gender: MON_MALE });

    expect(runtime.textWindows).toEqual([
      { fn: 'AddTextPrinterAndCreateWindowOnHealthbox', text: `{HIGHLIGHT 02}RHYDON${TEXT_DYNAMIC_COLOR_2}${CHAR_MALE}`, x: 0, y: 3, windowId: 0 }
    ]);
    expect(runtime.healthboxTextCopies).toEqual([
      { fn: 'TextIntoHealthboxObject', dest: 0x40 + 7 * TILE_SIZE_4BPP, text: 'windowTileData:0', sourceOffset: 0, width: 6 },
      { fn: 'TextIntoHealthboxObject', dest: 7 * TILE_SIZE_4BPP + 0x800, text: 'windowTileData:0', sourceOffset: 0xc0, width: 1 }
    ]);
    expect(runtime.calls.slice(-2)).toEqual([
      { fn: 'RemoveWindowOnHealthbox', args: [0] },
      { fn: 'RemoveWindow', args: [0] }
    ]);
  });

  test('UpdateNickInHealthbox uses female color/symbol and double-battle player copy offset', () => {
    const healthbox = createBattleInterfaceSprite(4);
    healthbox.oam.tileNum = 3;
    healthbox.data[6] = 0;
    const runtime = createBattleInterfaceRuntime({
      battlerSides: [B_SIDE_PLAYER],
      isDoubleBattle: true,
      sprites: Object.assign([], { 4: healthbox })
    });

    UpdateNickInHealthbox(runtime, 4, { nickname: 'CHANSEY', species: 113, gender: MON_FEMALE });

    expect(runtime.textWindows[0].text).toBe(`{HIGHLIGHT 02}CHANSEY${TEXT_DYNAMIC_COLOR_1}${CHAR_FEMALE}`);
    expect(runtime.healthboxTextCopies).toEqual([
      { fn: 'TextIntoHealthboxObject', dest: 0x40 + 3 * TILE_SIZE_4BPP, text: 'windowTileData:0', sourceOffset: 0, width: 6 },
      { fn: 'TextIntoHealthboxObject', dest: 3 * TILE_SIZE_4BPP + 0x400, text: 'windowTileData:0', sourceOffset: 0xc0, width: 1 }
    ]);
  });

  test('UpdateNickInHealthbox suppresses gender for Nidoran species names and ghost battlers, then uses opponent layout', () => {
    const nidoranHealthbox = createBattleInterfaceSprite(4);
    nidoranHealthbox.oam.tileNum = 2;
    nidoranHealthbox.data[6] = 2;
    const ghostHealthbox = createBattleInterfaceSprite(5);
    ghostHealthbox.oam.tileNum = 5;
    ghostHealthbox.data[6] = 1;
    const runtime = createBattleInterfaceRuntime({
      battlerSides: [B_SIDE_PLAYER, B_SIDE_OPPONENT, B_SIDE_OPPONENT],
      ghostBattlers: new Set([1]),
      sprites: Object.assign([], { 4: nidoranHealthbox, 5: ghostHealthbox })
    });

    UpdateNickInHealthbox(runtime, 4, { nickname: 'NIDORAN♀', species: SPECIES_NIDORAN_F, gender: MON_FEMALE });
    UpdateNickInHealthbox(runtime, 5, { nickname: 'GHOST', species: 105, gender: MON_MALE });

    expect(runtime.textWindows.map((window) => window.text)).toEqual([
      `{HIGHLIGHT 02}NIDORAN♀${TEXT_DYNAMIC_COLOR_2}`,
      `{HIGHLIGHT 02}GHOST${TEXT_DYNAMIC_COLOR_2}`
    ]);
    expect(runtime.healthboxTextCopies).toEqual([
      { fn: 'TextIntoHealthboxObject', dest: 0x20 + 2 * TILE_SIZE_4BPP, text: 'windowTileData:0', sourceOffset: 0, width: 7 },
      { fn: 'TextIntoHealthboxObject', dest: 0x20 + 5 * TILE_SIZE_4BPP, text: 'windowTileData:1', sourceOffset: 0, width: 7 }
    ]);
  });

  test('UpdateHealthboxAttribute dispatches player-side HEALTHBOX_ALL in the exact C order', () => {
    const healthbox = createBattleInterfaceSprite(2);
    const healthbar = createBattleInterfaceSprite(6);
    healthbox.oam.tileNum = 4;
    healthbox.data[5] = 6;
    healthbox.data[6] = 0;
    healthbar.oam.tileNum = 30;
    const runtime = createBattleInterfaceRuntime({
      battlerSides: [B_SIDE_PLAYER],
      battlerPartyIndexes: [0],
      playerParty: [{ status: 0 }],
      speciesInfo: Object.assign([], { 25: { growthRate: 0 } }),
      experienceTables: [Array.from({ length: 102 }, (_, level) => level * level * level)],
      sprites: Object.assign([], { 2: healthbox, 6: healthbar })
    });

    UpdateHealthboxAttribute(runtime, 2, { level: 5, hp: 18, maxHp: 30, species: 25, exp: 140, nickname: 'Pika' }, HEALTHBOX_ALL);

    const helperCallNames = runtime.calls.map((call) => call.fn).filter((fn) => ![
      'CpuCopy32',
      'AddWindow',
      'FillWindowPixelBuffer',
      'AddTextPrinterParameterized4',
      'GetWindowAttribute',
      'RemoveWindow'
    ].includes(fn));
    expect(helperCallNames.slice(0, 16)).toEqual([
      'AddTextPrinterAndCreateWindowOnHealthbox',
      'TextIntoHealthboxObject',
      'RemoveWindowOnHealthbox',
      'AddTextPrinterAndCreateWindowOnHealthbox',
      'TextIntoHealthboxObject',
      'TextIntoHealthboxObject',
      'RemoveWindowOnHealthbox',
      'AddTextPrinterAndCreateWindowOnHealthbox',
      'TextIntoHealthboxObject',
      'RemoveWindowOnHealthbox',
      'LoadBattleBarGfx',
      'LoadBattleBarGfx',
      'AddTextPrinterAndCreateWindowOnHealthbox',
      'TextIntoHealthboxObject',
      'TextIntoHealthboxObject',
      'RemoveWindowOnHealthbox'
    ]);
    expect(runtime.textWindows.slice(0, 4)).toEqual([
      { fn: 'AddTextPrinterAndCreateWindowOnHealthbox', text: '{LV_2}5', x: 10, y: 3, windowId: 0 },
      { fn: 'AddTextPrinterAndCreateWindowOnHealthbox', text: ' 18/', x: 4, y: 5, windowId: 1 },
      { fn: 'AddTextPrinterAndCreateWindowOnHealthbox', text: ' 30', x: 0, y: 5, windowId: 2 },
      { fn: 'AddTextPrinterAndCreateWindowOnHealthbox', text: `{HIGHLIGHT 02}Pika${TEXT_DYNAMIC_COLOR_2}`, x: 0, y: 3, windowId: 3 }
    ]);
    expect(runtime.loadedBattleBarGfx).toEqual([0, 3]);
    expect(runtime.battleBars[0]).toEqual({
      healthboxSpriteId: 2,
      maxValue: 91,
      oldValue: 15,
      receivedValue: 0,
      currValue: 0
    });
  });

  test('UpdateHealthboxAttribute dispatches targeted safari and opponent attributes without player-only branches', () => {
    const playerBox = createBattleInterfaceSprite(2);
    const opponentBox = createBattleInterfaceSprite(3);
    const opponentBar = createBattleInterfaceSprite(7);
    playerBox.oam.tileNum = 2;
    playerBox.data[6] = 0;
    opponentBox.data[5] = 7;
    opponentBox.data[6] = 1;
    opponentBar.oam.tileNum = 11;
    const runtime = createBattleInterfaceRuntime({
      gNumSafariBalls: 12,
      battlerSides: [B_SIDE_PLAYER, B_SIDE_OPPONENT],
      battlerPartyIndexes: [0, 0],
      enemyParty: [{ species: 25, status: 0 }],
      sprites: Object.assign([], { 2: playerBox, 3: opponentBox, 7: opponentBar })
    });

    UpdateHealthboxAttribute(runtime, 2, {}, HEALTHBOX_SAFARI_ALL_TEXT);
    expect(runtime.textWindows.map((entry) => entry.text)).toEqual(['{HIGHLIGHT 2}SAFARI BALLS', '{HIGHLIGHT 2}Left: 12']);

    UpdateHealthboxAttribute(runtime, 2, {}, HEALTHBOX_SAFARI_BALLS_TEXT);
    expect(runtime.textWindows.map((entry) => entry.text).at(-1)).toBe('{HIGHLIGHT 2}Left: 12');

    UpdateHealthboxAttribute(runtime, 3, { level: 9, hp: 20, maxHp: 40, nickname: 'Oddish' }, HEALTHBOX_LEVEL);
    UpdateHealthboxAttribute(runtime, 3, { level: 9, hp: 20, maxHp: 40, nickname: 'Oddish' }, HEALTHBOX_HEALTH_BAR);
    UpdateHealthboxAttribute(runtime, 3, { level: 9, hp: 20, maxHp: 40, nickname: 'Oddish' }, HEALTHBOX_NICK);
    UpdateHealthboxAttribute(runtime, 3, { level: 9, hp: 20, maxHp: 40, nickname: 'Oddish' }, HEALTHBOX_STATUS_ICON);

    expect(runtime.textWindows).toContainEqual({ fn: 'AddTextPrinterAndCreateWindowOnHealthbox', text: '{LV_2}9', x: 10, y: 3, windowId: 3 });
    expect(runtime.loadedBattleBarGfx.at(-1)).toBe(0);
    expect(runtime.textWindows).toContainEqual({ fn: 'AddTextPrinterAndCreateWindowOnHealthbox', text: `{HIGHLIGHT 02}Oddish${TEXT_DYNAMIC_COLOR_2}`, x: 0, y: 3, windowId: 4 });
    expect(runtime.healthboxTextCopies).toContainEqual({ fn: 'TextIntoHealthboxObject', dest: 0x20, text: 'windowTileData:4', sourceOffset: 0, width: 7 });
    expect(runtime.calls.some((call) => call.fn === 'UpdateHpTextInHealthbox' && call.args[0] === 3)).toBe(false);
  });

  test('Debug_DrawNumber writes digit and blank tile ids while preserving upper tile bits', () => {
    const dest = Array.from({ length: 0x40 }, () => 0xfc00 | 999);

    Debug_DrawNumber(42, dest, false);

    expect(dest[0]).toBe(0xfc00 | 30);
    expect(dest[1]).toBe(0xfc00 | 30);
    expect(dest[2]).toBe(0xfc00 | 24);
    expect(dest[3]).toBe(0xfc00 | 22);
    expect(dest[0x20]).toBe(0xfc00 | 30);
    expect(dest[0x21]).toBe(0xfc00 | 30);
    expect(dest[0x22]).toBe(0xfc00 | (24 + TILE_SIZE_4BPP));
    expect(dest[0x23]).toBe(0xfc00 | (22 + TILE_SIZE_4BPP));
  });

  test('Debug_DrawNumber singleRow path and zero special case match the C helper', () => {
    const zero = Array.from({ length: 0x40 }, () => 0xa800 | 777);
    Debug_DrawNumber(0, zero, true);
    expect(zero.slice(0, 4)).toEqual([0xa800 | 30, 0xa800 | 30, 0xa800 | 30, 0xa800 | 20]);
    expect(zero.slice(0x20, 0x24)).toEqual([
      0xa800 | 30,
      0xa800 | 30,
      0xa800 | 30,
      0xa800 | (20 + TILE_SIZE_4BPP)
    ]);

    const dest = Array.from({ length: 0x40 }, () => 0x5400 | 888);
    Debug_DrawNumber(9876, dest, true);
    expect(dest.slice(0, 4)).toEqual([0x5400 | 29, 0x5400 | 28, 0x5400 | 27, 0x5400 | 26]);
    expect(dest.slice(0x20, 0x24)).toEqual([
      0x5400 | (29 + TILE_SIZE_4BPP),
      0x5400 | (28 + TILE_SIZE_4BPP),
      0x5400 | (27 + TILE_SIZE_4BPP),
      0x5400 | (26 + TILE_SIZE_4BPP)
    ]);
  });

  test('Debug_DrawNumberPair writes the separator and mutates the second number at dest plus five', () => {
    const dest = Array.from({ length: 0x40 }, () => 0xf000 | 123);

    Debug_DrawNumberPair(7, 89, dest);

    expect(dest[4]).toBe(30);
    expect(dest.slice(0, 4)).toEqual([0xf000 | 30, 0xf000 | 30, 0xf000 | 28, 0xf000 | 29]);
    expect(dest.slice(0x20, 0x24)).toEqual([
      0xf000 | 30,
      0xf000 | 30,
      0xf000 | (28 + TILE_SIZE_4BPP),
      0xf000 | (29 + TILE_SIZE_4BPP)
    ]);
    expect(dest.slice(5, 9)).toEqual([0xf000 | 30, 0xf000 | 30, 0xf000 | 30, 0xf000 | 27]);
    expect(dest.slice(5 + 0x20, 9 + 0x20)).toEqual([
      0xf000 | 30,
      0xf000 | 30,
      0xf000 | 30,
      0xf000 | (27 + TILE_SIZE_4BPP)
    ]);
  });

  test('SpriteCB_HealthBar syncs healthbar position from linked healthbox and type', () => {
    const healthbox = createBattleInterfaceSprite(2, 100, 40);
    healthbox.x2 = -3;
    healthbox.y2 = 5;
    const healthbar = createBattleInterfaceSprite(6);
    healthbar.data[5] = 2;
    healthbar.data[6] = 0;
    const runtime = createBattleInterfaceRuntime({
      sprites: Object.assign([], { 2: healthbox, 6: healthbar })
    });

    SpriteCB_HealthBar(runtime, healthbar);
    expect(healthbar.x).toBe(116);
    expect(healthbar.y).toBe(40);
    expect(healthbar.x2).toBe(-3);
    expect(healthbar.y2).toBe(5);

    healthbar.data[6] = 1;
    SpriteCB_HealthBar(runtime, healthbar);
    expect(healthbar.x).toBe(116);

    healthbar.data[6] = 2;
    SpriteCB_HealthBar(runtime, healthbar);
    expect(healthbar.x).toBe(108);

    healthbar.data[6] = 99;
    SpriteCB_HealthBar(runtime, healthbar);
    expect(healthbar.x).toBe(108);
  });

  test('SpriteCB_HealthBoxOther syncs right healthbox sprite from main healthbox', () => {
    const healthbox = createBattleInterfaceSprite(2, 80, 44);
    healthbox.x2 = 7;
    healthbox.y2 = -2;
    const other = createBattleInterfaceSprite(9);
    other.data[5] = 2;
    const runtime = createBattleInterfaceRuntime({
      sprites: Object.assign([], { 2: healthbox, 9: other })
    });

    SpriteCB_HealthBoxOther(runtime, other);

    expect(other.x).toBe(144);
    expect(other.y).toBe(44);
    expect(other.x2).toBe(7);
    expect(other.y2).toBe(-2);
  });

  test('CreateBattlerHealthboxSprites builds single-battle player sprites with exact C wiring', () => {
    const runtime = createBattleInterfaceRuntime({
      isDoubleBattle: false,
      battlerSides: [B_SIDE_PLAYER],
      battlerPositions: [B_POSITION_PLAYER_LEFT]
    });

    const healthboxSpriteId = CreateBattlerHealthboxSprites(runtime, 0);

    expect(healthboxSpriteId).toBe(0);
    expect(runtime.spriteCreations).toEqual([
      { fn: 'CreateSprite', template: 'sHealthboxPlayerSpriteTemplates[0]', x: 240, y: 160, subpriority: 1, spriteId: 0 },
      { fn: 'CreateSpriteAtEnd', template: 'sHealthboxPlayerSpriteTemplates[0]', x: 240, y: 160, subpriority: 1, spriteId: 1 },
      { fn: 'CreateSpriteAtEnd', template: 'sHealthbarSpriteTemplates[0]', x: 140, y: 60, subpriority: 0, spriteId: 2 }
    ]);
    expect(runtime.sprites[0]).toMatchObject({
      invisible: true,
      data: expect.arrayContaining([0, 0, 0, 0, 0, 2, 0]),
      callback: 'SpriteCallbackDummy',
      oam: expect.objectContaining({ shape: SPRITE_SHAPE_64x64, size: 3, affineParam: 1 })
    });
    expect(runtime.sprites[1]).toMatchObject({
      invisible: true,
      callback: 'SpriteCB_HealthBoxOther',
      data: expect.arrayContaining([0, 0, 0, 0, 0, 0]),
      oam: expect.objectContaining({ shape: SPRITE_SHAPE_64x64, size: 3, tileNum: 2 * TILE_SIZE_4BPP })
    });
    expect(runtime.sprites[2]).toMatchObject({
      invisible: true,
      data: expect.arrayContaining([0, 0, 0, 0, 0, 0, HEALTHBAR_TYPE_PLAYER_SINGLE]),
      callback: 'SpriteCB_HealthBar',
      subspriteMode: SUBSPRITES_IGNORE_PRIORITY,
      oam: expect.objectContaining({ priority: 1, shape: 1, size: 1 })
    });
    expect(runtime.subspriteTableSets).toEqual([{ spriteId: 2, table: 'sHealthBar_SubspriteTable[0]' }]);
    expect(runtime.vramCopies).toContainEqual({
      src: `gBattleInterface_Gfx[${B_INTERFACE_GFX_HP_BAR_HP_TEXT}]`,
      dest: 0,
      size: 2 * TILE_SIZE_4BPP
    });
  });

  test('CreateBattlerHealthboxSprites preserves double-battle template selection and opponent healthbar type', () => {
    const playerRuntime = createBattleInterfaceRuntime({
      isDoubleBattle: true,
      battlerSides: [B_SIDE_PLAYER],
      battlerPositions: [B_POSITION_PLAYER_RIGHT]
    });

    CreateBattlerHealthboxSprites(playerRuntime, 0);

    expect(playerRuntime.spriteCreations.map((creation) => creation.template)).toEqual([
      'sHealthboxPlayerSpriteTemplates[1]',
      'sHealthboxPlayerSpriteTemplates[1]',
      'sHealthbarSpriteTemplates[2]'
    ]);
    expect(playerRuntime.sprites[1]!.oam.tileNum).toBe(1 * TILE_SIZE_4BPP);
    expect(playerRuntime.sprites[2]!.data[6]).toBe(HEALTHBAR_TYPE_PLAYER_DOUBLE);

    const opponentRuntime = createBattleInterfaceRuntime({
      isDoubleBattle: true,
      battlerSides: [B_SIDE_PLAYER, B_SIDE_OPPONENT],
      battlerPositions: [B_POSITION_PLAYER_LEFT, B_POSITION_OPPONENT_RIGHT]
    });

    CreateBattlerHealthboxSprites(opponentRuntime, 1);

    expect(opponentRuntime.spriteCreations.map((creation) => creation.template)).toEqual([
      'sHealthboxOpponentSpriteTemplates[1]',
      'sHealthboxOpponentSpriteTemplates[1]',
      'sHealthbarSpriteTemplates[3]'
    ]);
    expect(opponentRuntime.sprites[1]!.oam.tileNum).toBe(1 * TILE_SIZE_4BPP);
    expect(opponentRuntime.sprites[2]!.data[6]).toBe(HEALTHBAR_TYPE_OPPONENT);
    expect(opponentRuntime.subspriteTableSets).toEqual([{ spriteId: 2, table: 'sHealthBar_SubspriteTable[1]' }]);
  });

  test('CreateSafariPlayerHealthboxSprites creates the two safari healthbox halves exactly', () => {
    const runtime = createBattleInterfaceRuntime();

    const healthboxSpriteId = CreateSafariPlayerHealthboxSprites(runtime);

    expect(healthboxSpriteId).toBe(0);
    expect(runtime.spriteCreations).toEqual([
      { fn: 'CreateSprite', template: 'sHealthboxSafariSpriteTemplate', x: 240, y: 160, subpriority: 1, spriteId: 0 },
      { fn: 'CreateSpriteAtEnd', template: 'sHealthboxSafariSpriteTemplate', x: 240, y: 160, subpriority: 1, spriteId: 1 }
    ]);
    expect(runtime.sprites[0]).toMatchObject({
      callback: 'SpriteCallbackDummy',
      oam: expect.objectContaining({ shape: SPRITE_SHAPE_64x64, size: 3, affineParam: 1 })
    });
    expect(runtime.sprites[1]).toMatchObject({
      callback: 'SpriteCB_HealthBoxOther',
      data: expect.arrayContaining([0, 0, 0, 0, 0, 0]),
      oam: expect.objectContaining({ shape: SPRITE_SHAPE_64x64, size: 3, tileNum: 2 * TILE_SIZE_4BPP })
    });
  });

  test('SetHealthboxSpriteInvisible and SetHealthboxSpriteVisible toggle all linked sprites', () => {
    const healthbox = createBattleInterfaceSprite(2);
    const healthbar = createBattleInterfaceSprite(6);
    const other = createBattleInterfaceSprite(9);
    healthbox.data[5] = 6;
    healthbox.oam.affineParam = 9;
    const runtime = createBattleInterfaceRuntime({
      sprites: Object.assign([], { 2: healthbox, 6: healthbar, 9: other })
    });

    SetHealthboxSpriteInvisible(runtime, 2);
    expect([healthbox.invisible, healthbar.invisible, other.invisible]).toEqual([true, true, true]);

    SetHealthboxSpriteVisible(runtime, 2);
    expect([healthbox.invisible, healthbar.invisible, other.invisible]).toEqual([false, false, false]);
  });

  test('UpdateSpritePos, DestoryHealthboxSprite, and DummyBattleInterfaceFunc preserve direct C side effects', () => {
    const healthbox = createBattleInterfaceSprite(2);
    const healthbar = createBattleInterfaceSprite(6);
    const other = createBattleInterfaceSprite(9);
    healthbox.data[5] = 6;
    healthbox.oam.affineParam = 9;
    const runtime = createBattleInterfaceRuntime({
      sprites: Object.assign([], { 2: healthbox, 6: healthbar, 9: other })
    });

    UpdateSpritePos(runtime, 2, 123, 45);
    expect(healthbox.x).toBe(123);
    expect(healthbox.y).toBe(45);

    DummyBattleInterfaceFunc(runtime, 2, true);
    expect(runtime.calls).toEqual([]);

    DestoryHealthboxSprite(runtime, 2);
    expect(other.destroyed).toBe(true);
    expect(healthbar.destroyed).toBe(true);
    expect(healthbox.destroyed).toBe(true);
    expect(runtime.destroyedSprites).toEqual([9, 6, 2]);
    expect(runtime.calls).toEqual([
      { fn: 'DestroySprite', args: [9] },
      { fn: 'DestroySprite', args: [6] },
      { fn: 'DestroySprite', args: [2] }
    ]);
  });

  test('UpdateOamPriorityInAllHealthboxes applies priority to every linked healthbox sprite', () => {
    const main0 = createBattleInterfaceSprite(2);
    const bar0 = createBattleInterfaceSprite(6);
    const other0 = createBattleInterfaceSprite(9);
    const main1 = createBattleInterfaceSprite(3);
    const bar1 = createBattleInterfaceSprite(7);
    const other1 = createBattleInterfaceSprite(10);
    main0.data[5] = 6;
    main0.oam.affineParam = 9;
    main1.data[5] = 7;
    main1.oam.affineParam = 10;
    const runtime = createBattleInterfaceRuntime({
      healthboxSpriteIds: [2, 3],
      sprites: Object.assign([], { 2: main0, 3: main1, 6: bar0, 7: bar1, 9: other0, 10: other1 })
    });

    UpdateOamPriorityInAllHealthboxes(runtime, 0);

    expect([main0.oam.priority, bar0.oam.priority, other0.oam.priority]).toEqual([0, 0, 0]);
    expect([main1.oam.priority, bar1.oam.priority, other1.oam.priority]).toEqual([0, 0, 0]);
  });

  test('InitBattlerHealthboxCoords uses exact single battle player and opponent coordinates', () => {
    const playerBox = createBattleInterfaceSprite(2);
    const opponentBox = createBattleInterfaceSprite(3);
    const runtime = createBattleInterfaceRuntime({
      isDoubleBattle: false,
      healthboxSpriteIds: [2, 3],
      battlerSides: [B_SIDE_PLAYER, B_SIDE_OPPONENT],
      sprites: Object.assign([], { 2: playerBox, 3: opponentBox })
    });

    InitBattlerHealthboxCoords(runtime, 0);
    InitBattlerHealthboxCoords(runtime, 1);

    expect([playerBox.x, playerBox.y]).toEqual([158, 88]);
    expect([opponentBox.x, opponentBox.y]).toEqual([44, 30]);
  });

  test('InitBattlerHealthboxCoords uses exact double battle coordinates for every battler position', () => {
    const sprites = [0, 1, 2, 3].map((id) => createBattleInterfaceSprite(id));
    const runtime = createBattleInterfaceRuntime({
      isDoubleBattle: true,
      healthboxSpriteIds: [0, 1, 2, 3],
      battlerPositions: [
        B_POSITION_PLAYER_LEFT,
        B_POSITION_PLAYER_RIGHT,
        B_POSITION_OPPONENT_LEFT,
        B_POSITION_OPPONENT_RIGHT
      ],
      sprites: Object.assign([], { 0: sprites[0], 1: sprites[1], 2: sprites[2], 3: sprites[3] })
    });

    for (let battler = 0; battler < 4; battler += 1) {
      InitBattlerHealthboxCoords(runtime, battler);
    }

    expect(sprites.map((sprite) => [sprite.x, sprite.y])).toEqual([
      [159, 75],
      [171, 100],
      [44, 19],
      [32, 44]
    ]);
  });

  test('TryAddPokeballIconToHealthbox returns without VRAM writes for skipped battle types, player side, ghost, or uncaught species', () => {
    const healthbox = createBattleInterfaceSprite(2);
    const healthbar = createBattleInterfaceSprite(6);
    healthbox.data[5] = 6;
    healthbox.data[6] = 1;
    const baseRuntime = {
      battlerSides: [B_SIDE_PLAYER, B_SIDE_OPPONENT],
      battlerPartyIndexes: [0, 0],
      enemyParty: [{ species: 25 }],
      caughtNationalDexNums: new Set([25]),
      sprites: Object.assign([], { 2: healthbox, 6: healthbar })
    };

    for (const flag of [BATTLE_TYPE_FIRST_BATTLE, BATTLE_TYPE_OLD_MAN_TUTORIAL, BATTLE_TYPE_POKEDUDE, BATTLE_TYPE_TRAINER]) {
      const runtime = createBattleInterfaceRuntime({ ...baseRuntime, battleTypeFlags: flag });
      TryAddPokeballIconToHealthbox(runtime, 2, true);
      expect(runtime.vramCopies).toEqual([]);
      expect(runtime.vramFills).toEqual([]);
    }

    const playerSide = createBattleInterfaceRuntime({
      ...baseRuntime,
      battlerSides: [B_SIDE_PLAYER, B_SIDE_PLAYER]
    });
    TryAddPokeballIconToHealthbox(playerSide, 2, true);
    expect(playerSide.vramCopies).toEqual([]);

    const ghost = createBattleInterfaceRuntime({
      ...baseRuntime,
      ghostBattlers: new Set([1])
    });
    TryAddPokeballIconToHealthbox(ghost, 2, true);
    expect(ghost.vramCopies).toEqual([]);

    const uncaught = createBattleInterfaceRuntime({
      ...baseRuntime,
      caughtNationalDexNums: new Set()
    });
    TryAddPokeballIconToHealthbox(uncaught, 2, true);
    expect(uncaught.vramCopies).toEqual([]);
  });

  test('TryAddPokeballIconToHealthbox copies caught ball tile or clears it based on status state', () => {
    const healthbox = createBattleInterfaceSprite(2);
    const healthbar = createBattleInterfaceSprite(6);
    healthbox.data[5] = 6;
    healthbox.data[6] = 1;
    healthbar.oam.tileNum = 20;
    const runtime = createBattleInterfaceRuntime({
      battlerSides: [B_SIDE_PLAYER, B_SIDE_OPPONENT],
      battlerPartyIndexes: [0, 0],
      enemyParty: [{ species: 25 }],
      caughtNationalDexNums: new Set([25]),
      sprites: Object.assign([], { 2: healthbox, 6: healthbar })
    });

    TryAddPokeballIconToHealthbox(runtime, 2, true);

    expect(runtime.vramCopies).toEqual([
      {
        src: `gBattleInterface_Gfx[${B_INTERFACE_GFX_BALL_CAUGHT}]`,
        dest: (20 + 8) * TILE_SIZE_4BPP,
        size: TILE_SIZE_4BPP
      }
    ]);

    TryAddPokeballIconToHealthbox(runtime, 2, false);

    expect(runtime.vramFills).toEqual([
      {
        value: 0,
        dest: (20 + 8) * TILE_SIZE_4BPP,
        size: TILE_SIZE_4BPP
      }
    ]);
  });

  test('SetBattleBarStruct initializes the battle bar fields and sentinel currValue', () => {
    const runtime = createBattleInterfaceRuntime();
    SetBattleBarStruct(runtime, 2, 9, 100, 75, 25);

    expect(runtime.battleBars[2]).toEqual({
      healthboxSpriteId: 9,
      maxValue: 100,
      oldValue: 75,
      receivedValue: 25,
      currValue: -32768
    });
  });

  test('CalcNewBarValue follows normal drain/fill, completion, clamping, and small-max Q24.8 paths', () => {
    const drain = { value: -32768 };
    expect(CalcNewBarValue(100, 80, 30, drain, B_HEALTHBAR_NUM_TILES, 1)).toBe(79);
    expect(drain.value).toBe(79);

    const fill = { value: -32768 };
    expect(CalcNewBarValue(100, 40, -20, fill, B_HEALTHBAR_NUM_TILES, 5)).toBe(45);
    expect(fill.value).toBe(45);

    const done = { value: 50 };
    expect(CalcNewBarValue(100, 80, 30, done, B_HEALTHBAR_NUM_TILES, 1)).toBe(-1);

    const clampLow = { value: -32768 };
    while (CalcNewBarValue(100, 5, 30, clampLow, B_HEALTHBAR_NUM_TILES, 10) !== 0) {}
    expect(clampLow.value).toBe(0);

    const smallDrain = { value: -32768 };
    expect(CalcNewBarValue(12, 10, 3, smallDrain, B_HEALTHBAR_NUM_TILES, 1)).toBe(10);
    expect(smallDrain.value).toBe(2496);
    expect(CalcNewBarValue(12, 10, 3, smallDrain, B_HEALTHBAR_NUM_TILES, 1)).toBe(10);

    const smallFill = { value: -32768 };
    expect(CalcNewBarValue(12, 6, -3, smallFill, B_HEALTHBAR_NUM_TILES, 1)).toBe(6);
    expect(CalcNewBarValue(12, 6, -3, smallFill, B_HEALTHBAR_NUM_TILES, 1)).toBe(6);
  });

  test('CalcBarFilledPixels clears output, applies one-pixel minimum, and fills tiles in order', () => {
    const pixels = [9, 9, 9, 9, 9, 9];
    expect(CalcBarFilledPixels(100, 100, 98, { value: 1 }, pixels, B_HEALTHBAR_NUM_TILES)).toBe(1);
    expect(pixels).toEqual([1, 0, 0, 0, 0, 0]);

    expect(CalcBarFilledPixels(100, 100, 50, { value: 50 }, pixels, B_HEALTHBAR_NUM_TILES)).toBe(24);
    expect(pixels).toEqual([8, 8, 8, 0, 0, 0]);

    expect(CalcBarFilledPixels(12, 10, 3, { value: 7 << 8 }, pixels, B_HEALTHBAR_NUM_TILES)).toBe(28);
    expect(pixels).toEqual([8, 8, 8, 4, 0, 0]);
  });

  test('DrawHealthbarOntoScreen builds six palette/tile words and copies the same BG rect as C', () => {
    const runtime = createBattleInterfaceRuntime();
    const currValue = { value: 30 };

    DrawHealthbarOntoScreen(runtime, { maxValue: 48, oldValue: 30, receivedValue: 0, pal: 3, tileOffset: 200 }, currValue, 1, 4, 5);

    const expectedTiles = [
      (3 << 12) | 208,
      (3 << 12) | 208,
      (3 << 12) | 208,
      (3 << 12) | 206,
      (3 << 12) | 200,
      (3 << 12) | 200
    ];
    expect(runtime.bgTilemapBufferRects).toEqual([
      { bg: 1, tiles: expectedTiles, x: 4, y: 5, width: 6, height: 1, palette: 17 }
    ]);
    expect(runtime.calls).toEqual([
      { fn: 'CopyToBgTilemapBufferRect_ChangePalette', args: [1, expectedTiles, 4, 5, 6, 1, 17] }
    ]);
  });

  test('unused healthbar wrappers call CalcNewBarValue and DrawHealthbarOntoScreen in C order', () => {
    const runtime = createBattleInterfaceRuntime();
    const barInfo = { maxValue: 100, oldValue: 80, receivedValue: 20, pal: 2, tileOffset: 50 };
    const currValue = { value: -32768 };

    const hpVal = UpdateAndDrawHealthbarOntoScreen(runtime, barInfo, currValue, 2, 7, 9);

    expect(hpVal).toBe(79);
    expect(currValue.value).toBe(79);
    expect(runtime.bgTilemapBufferRects).toHaveLength(1);
    expect(runtime.bgTilemapBufferRects[0]).toMatchObject({ bg: 2, x: 7, y: 9, width: 6, height: 1, palette: 17 });

    expect(CalcNewHealthbarValue(barInfo, currValue)).toBe(78);
    DoDrawHealthbarOntoScreen(runtime, barInfo, currValue, 3, 1, 2);
    expect(runtime.bgTilemapBufferRects.at(-1)).toMatchObject({ bg: 3, x: 1, y: 2, width: 6, height: 1, palette: 17 });
  });

  test('GetReceivedValueInPixels and scaled HP helpers preserve C integer truncation and minimum nonzero pixel', () => {
    expect(GetReceivedValueInPixels(80, 30, 100, B_EXPBAR_NUM_TILES)).toBe(19);
    expect(GetReceivedValueInPixels(10, -20, 100, B_EXPBAR_NUM_TILES)).toBe(13);
    expect(GetScaledHPFraction(1, 999, B_HEALTHBAR_NUM_PIXELS)).toBe(1);
    expect(GetScaledHPFraction(0, 999, B_HEALTHBAR_NUM_PIXELS)).toBe(0);
  });

  test('GetHPBarLevel returns exact EMPTY/RED/YELLOW/GREEN/FULL enum values from battle_interface.c', () => {
    expect(GetHPBarLevel(100, 100)).toBe(HP_BAR_FULL);
    expect(GetHPBarLevel(0, 100)).toBe(HP_BAR_EMPTY);
    expect(GetHPBarLevel(1, 100)).toBe(HP_BAR_RED);
    expect(GetHPBarLevel(21, 100)).toBe(HP_BAR_YELLOW);
    expect(GetHPBarLevel(53, 100)).toBe(HP_BAR_GREEN);
  });

  test('MoveBattleBarGraphically records health color thresholds and clears max-level exp pixels', () => {
    const healthbox = createBattleInterfaceSprite(3);
    const healthbar = createBattleInterfaceSprite(13);
    const expHealthbox = createBattleInterfaceSprite(4);
    healthbox.data[5] = 13;
    healthbar.oam.tileNum = 20;
    expHealthbox.oam.tileNum = 30;
    const runtime = createBattleInterfaceRuntime({
      sprites: Object.assign([], { 3: healthbox, 4: expHealthbox, 13: healthbar })
    });
    SetBattleBarStruct(runtime, 0, 3, 100, 80, 0);
    runtime.battleBars[0].currValue = 80;
    MoveBattleBarGraphically(runtime, 0, HEALTH_BAR);
    expect(runtime.graphicalUpdates.at(-1)).toMatchObject({
      battlerId: 0,
      whichBar: HEALTH_BAR,
      totalFilledPixels: 38,
      barElementId: B_INTERFACE_GFX_HP_BAR_GREEN
    });
    expect(runtime.vramCopies.slice(0, 6)).toEqual([
      { src: `gBattleInterface_Gfx[${B_INTERFACE_GFX_HP_BAR_GREEN}]+256`, dest: (20 + 2) * TILE_SIZE_4BPP, size: TILE_SIZE_4BPP },
      { src: `gBattleInterface_Gfx[${B_INTERFACE_GFX_HP_BAR_GREEN}]+256`, dest: (20 + 3) * TILE_SIZE_4BPP, size: TILE_SIZE_4BPP },
      { src: `gBattleInterface_Gfx[${B_INTERFACE_GFX_HP_BAR_GREEN}]+256`, dest: 64 + (2 + 20) * TILE_SIZE_4BPP, size: TILE_SIZE_4BPP },
      { src: `gBattleInterface_Gfx[${B_INTERFACE_GFX_HP_BAR_GREEN}]+256`, dest: 64 + (3 + 20) * TILE_SIZE_4BPP, size: TILE_SIZE_4BPP },
      { src: `gBattleInterface_Gfx[${B_INTERFACE_GFX_HP_BAR_GREEN}]+192`, dest: 64 + (4 + 20) * TILE_SIZE_4BPP, size: TILE_SIZE_4BPP },
      { src: `gBattleInterface_Gfx[${B_INTERFACE_GFX_HP_BAR_GREEN}]+0`, dest: 64 + (5 + 20) * TILE_SIZE_4BPP, size: TILE_SIZE_4BPP }
    ]);

    runtime.battleBars[0].currValue = 30;
    MoveBattleBarGraphically(runtime, 0, HEALTH_BAR);
    expect(runtime.graphicalUpdates.at(-1)).toMatchObject({ totalFilledPixels: 14, barElementId: B_INTERFACE_GFX_HP_BAR_YELLOW });

    runtime.battleBars[0].currValue = 10;
    MoveBattleBarGraphically(runtime, 0, HEALTH_BAR);
    expect(runtime.graphicalUpdates.at(-1)).toMatchObject({ totalFilledPixels: 4, barElementId: B_INTERFACE_GFX_HP_BAR_RED });

    SetBattleBarStruct(runtime, 1, 4, 100, 50, 0);
    runtime.battleBars[1].currValue = 50;
    runtime.battlerPartyIndexes[1] = 2;
    runtime.playerPartyLevels[2] = MAX_LEVEL;
    MoveBattleBarGraphically(runtime, 1, EXP_BAR);
    expect(runtime.graphicalUpdates.at(-1)).toEqual({
      battlerId: 1,
      whichBar: EXP_BAR,
      filledPixels: Array.from({ length: B_EXPBAR_NUM_TILES }, () => 0),
      totalFilledPixels: 32,
      barElementId: B_INTERFACE_GFX_EXP_BAR
    });
    expect(runtime.vramCopies.slice(-8)).toEqual([
      { src: `gBattleInterface_Gfx[${B_INTERFACE_GFX_EXP_BAR}]+0`, dest: (30 + 36) * TILE_SIZE_4BPP, size: TILE_SIZE_4BPP },
      { src: `gBattleInterface_Gfx[${B_INTERFACE_GFX_EXP_BAR}]+0`, dest: (30 + 37) * TILE_SIZE_4BPP, size: TILE_SIZE_4BPP },
      { src: `gBattleInterface_Gfx[${B_INTERFACE_GFX_EXP_BAR}]+0`, dest: (30 + 38) * TILE_SIZE_4BPP, size: TILE_SIZE_4BPP },
      { src: `gBattleInterface_Gfx[${B_INTERFACE_GFX_EXP_BAR}]+0`, dest: (30 + 39) * TILE_SIZE_4BPP, size: TILE_SIZE_4BPP },
      { src: `gBattleInterface_Gfx[${B_INTERFACE_GFX_EXP_BAR}]+0`, dest: 0xb80 + (4 + 30) * TILE_SIZE_4BPP, size: TILE_SIZE_4BPP },
      { src: `gBattleInterface_Gfx[${B_INTERFACE_GFX_EXP_BAR}]+0`, dest: 0xb80 + (5 + 30) * TILE_SIZE_4BPP, size: TILE_SIZE_4BPP },
      { src: `gBattleInterface_Gfx[${B_INTERFACE_GFX_EXP_BAR}]+0`, dest: 0xb80 + (6 + 30) * TILE_SIZE_4BPP, size: TILE_SIZE_4BPP },
      { src: `gBattleInterface_Gfx[${B_INTERFACE_GFX_EXP_BAR}]+0`, dest: 0xb80 + (7 + 30) * TILE_SIZE_4BPP, size: TILE_SIZE_4BPP }
    ]);
  });

  test('MoveBattleBar drives health/exp values, skips hidden HP bars, and resets currValue on completion', () => {
    const healthbox8 = createBattleInterfaceSprite(8);
    const healthbar18 = createBattleInterfaceSprite(18);
    const healthbox9 = createBattleInterfaceSprite(9);
    const healthbox10 = createBattleInterfaceSprite(10);
    const healthbar20 = createBattleInterfaceSprite(20);
    healthbox8.data[5] = 18;
    healthbox9.oam.tileNum = 12;
    healthbox10.data[5] = 20;
    const runtime = createBattleInterfaceRuntime({
      sprites: Object.assign([], { 8: healthbox8, 9: healthbox9, 10: healthbox10, 18: healthbar18, 20: healthbar20 })
    });
    SetBattleBarStruct(runtime, 0, 8, 100, 80, 30);
    expect(MoveBattleBar(runtime, 0, 8, HEALTH_BAR, 0)).toBe(79);
    expect(runtime.graphicalUpdates).toHaveLength(1);

    runtime.battlerData[0].hpNumbersNoBars = true;
    expect(MoveBattleBar(runtime, 0, 8, HEALTH_BAR, 0)).toBe(78);
    expect(runtime.graphicalUpdates).toHaveLength(1);

    SetBattleBarStruct(runtime, 1, 9, 100, 20, -30);
    expect(MoveBattleBar(runtime, 1, 9, EXP_BAR, 0)).toBe(21);
    expect(runtime.graphicalUpdates.at(-1)?.whichBar).toBe(EXP_BAR);

    SetBattleBarStruct(runtime, 2, 10, 100, 50, 0);
    expect(MoveBattleBar(runtime, 2, 10, HEALTH_BAR, 0)).toBe(-1);
    expect(runtime.battleBars[2].currValue).toBe(0);
  });
});
