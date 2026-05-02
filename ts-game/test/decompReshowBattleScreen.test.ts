import { describe, expect, test } from 'vitest';
import {
  BATTLE_TYPE_DOUBLE,
  BATTLE_TYPE_GHOST,
  BATTLE_TYPE_GHOST_UNVEILED,
  BATTLE_TYPE_LINK,
  BATTLE_TYPE_OLD_MAN_TUTORIAL,
  BATTLE_TYPE_SAFARI,
  BATTLE_TYPE_TRAINER,
  B_SIDE_OPPONENT,
  B_SIDE_PLAYER,
  HEALTHBOX_ALL,
  HEALTHBOX_SAFARI_ALL_TEXT,
  HELPCONTEXT_SAFARI_BATTLE,
  HELPCONTEXT_TRAINER_BATTLE_DOUBLE,
  HELPCONTEXT_TRAINER_BATTLE_SINGLE,
  HELPCONTEXT_WILD_BATTLE,
  TRAINER_BACK_PIC_OLD_MAN,
  CB2_ReshowBattleScreenAfterMenu,
  CreateBattlerSprite,
  CreateHealthboxSprite,
  LoadBattlerSpriteGfx,
  ReshowBattleScreenAfterMenu,
  ReshowBattleScreenDummy,
  ReshowBattleScreen_TurnOnDisplay,
  cb2ReshowBattleScreenAfterMenu,
  createBattlerSprite,
  createHealthboxSprite,
  createReshowBattleRuntime,
  isBattleTypeGhostWithoutScope,
  loadBattlerSpriteGfx,
  reshowBattleScreenAfterMenu,
  reshowBattleScreenTurnOnDisplay
} from '../src/game/decompReshowBattleScreen';

describe('decomp reshow_battle_screen', () => {
  test('ReshowBattleScreenAfterMenu resets state, disables transfers, selects help context, and installs CB2', () => {
    const runtime = createReshowBattleRuntime();
    runtime.battleTypeFlags = BATTLE_TYPE_TRAINER | BATTLE_TYPE_DOUBLE;
    runtime.battleScripting.reshowMainState = 9;
    runtime.battleScripting.reshowHelperState = 4;

    reshowBattleScreenAfterMenu(runtime);
    expect(runtime.paletteFade.bufferTransferDisabled).toBe(1);
    expect(runtime.hblankCallback).toBeNull();
    expect(runtime.gpuRegs.MOSAIC).toBe(0);
    expect(runtime.battleScripting).toEqual({ reshowMainState: 0, reshowHelperState: 0 });
    expect(runtime.helpContextLog).toEqual([HELPCONTEXT_TRAINER_BATTLE_DOUBLE]);
    expect(runtime.mainCallback2).toBe('CB2_ReshowBattleScreenAfterMenu');

    runtime.helpContextLog = [];
    runtime.battleTypeFlags = BATTLE_TYPE_TRAINER;
    reshowBattleScreenAfterMenu(runtime);
    expect(runtime.helpContextLog).toEqual([HELPCONTEXT_TRAINER_BATTLE_SINGLE]);

    runtime.helpContextLog = [];
    runtime.battleTypeFlags = BATTLE_TYPE_SAFARI;
    reshowBattleScreenAfterMenu(runtime);
    expect(runtime.helpContextLog).toEqual([HELPCONTEXT_SAFARI_BATTLE]);

    runtime.helpContextLog = [];
    runtime.battleTypeFlags = 0;
    reshowBattleScreenAfterMenu(runtime);
    expect(runtime.helpContextLog).toEqual([HELPCONTEXT_WILD_BATTLE]);

    runtime.helpContextLog = [];
    runtime.battleTypeFlags = BATTLE_TYPE_LINK | BATTLE_TYPE_TRAINER;
    reshowBattleScreenAfterMenu(runtime);
    expect(runtime.helpContextLog).toEqual([]);
  });

  test('CB2_ReshowBattleScreenAfterMenu follows the early setup states and healthbox retry loop', () => {
    const runtime = createReshowBattleRuntime();
    runtime.healthboxGfxReadyAfter = 2;

    cb2ReshowBattleScreenAfterMenu(runtime);
    expect(runtime.logs).toContain('ResetSpriteData');
    expect(runtime.battleScripting.reshowMainState).toBe(1);

    cb2ReshowBattleScreenAfterMenu(runtime);
    expect(runtime.vblankCallback).toBeNull();
    expect(runtime.logs).toEqual(expect.arrayContaining(['ScanlineEffect_Clear', 'BattleInitBgsAndWindows', 'ResetPaletteFade']));
    expect(runtime.bgAttributes).toEqual([
      { bg: 1, attr: 'BG_ATTR_CHARBASEINDEX', value: 0 },
      { bg: 2, attr: 'BG_ATTR_CHARBASEINDEX', value: 0 }
    ]);
    expect(runtime.bgShown).toEqual([0, 1, 2, 3]);
    expect(runtime.gpuRegs.BG0_X).toBe(0);

    runtime.battleScripting.reshowMainState = 6;
    cb2ReshowBattleScreenAfterMenu(runtime);
    expect(runtime.battleScripting.reshowMainState).toBe(6);
    expect(runtime.battleScripting.reshowHelperState).toBe(1);
    cb2ReshowBattleScreenAfterMenu(runtime);
    expect(runtime.battleScripting.reshowMainState).toBe(6);
    expect(runtime.battleScripting.reshowHelperState).toBe(2);
    cb2ReshowBattleScreenAfterMenu(runtime);
    expect(runtime.battleScripting.reshowMainState).toBe(7);
    expect(runtime.battleScripting.reshowHelperState).toBe(0);
    expect(runtime.logs).toEqual(expect.arrayContaining([
      'BattleLoadAllHealthBoxesGfx:0',
      'BattleLoadAllHealthBoxesGfx:1',
      'BattleLoadAllHealthBoxesGfx:2'
    ]));
  });

  test('LoadBattlerSpriteGfx preserves ghost, substitute, safari, old man, and inactive battler branches', () => {
    const runtime = createReshowBattleRuntime();

    runtime.battleTypeFlags = BATTLE_TYPE_GHOST;
    loadBattlerSpriteGfx(runtime, 1);
    expect(runtime.loadedSpriteGfx.at(-1)).toEqual({ battler: 1, kind: 'DecompressGhostFrontPic' });
    expect(isBattleTypeGhostWithoutScope(BATTLE_TYPE_GHOST | BATTLE_TYPE_GHOST_UNVEILED)).toBe(false);

    runtime.battleTypeFlags = 0;
    runtime.battleSpritesData.battlerData[1].behindSubstitute = true;
    loadBattlerSpriteGfx(runtime, 1);
    expect(runtime.loadedSpriteGfx.at(-1)).toEqual({ battler: 1, kind: 'BattleLoadSubstituteOrMonSpriteGfx:false' });

    runtime.battleTypeFlags = BATTLE_TYPE_SAFARI;
    runtime.playerGender = 1;
    loadBattlerSpriteGfx(runtime, 0);
    expect(runtime.loadedSpriteGfx.at(-1)).toEqual({ battler: 0, kind: 'DecompressTrainerBackPalette:1' });

    runtime.battleTypeFlags = BATTLE_TYPE_OLD_MAN_TUTORIAL;
    loadBattlerSpriteGfx(runtime, 0);
    expect(runtime.loadedSpriteGfx.at(-1)).toEqual({
      battler: 0,
      kind: `DecompressTrainerBackPalette:${TRAINER_BACK_PIC_OLD_MAN}`
    });

    runtime.battleTypeFlags = 0;
    runtime.battleSpritesData.battlerData[0].behindSubstitute = true;
    loadBattlerSpriteGfx(runtime, 0);
    expect(runtime.loadedSpriteGfx.at(-1)).toEqual({ battler: 0, kind: 'BattleLoadSubstituteOrMonSpriteGfx:false' });

    runtime.battlersCount = 1;
    const count = runtime.loadedSpriteGfx.length;
    expect(loadBattlerSpriteGfx(runtime, 3)).toBe(true);
    expect(runtime.loadedSpriteGfx).toHaveLength(count);
  });

  test('CreateBattlerSprite skips fainted mons and creates the exact sprite variants', () => {
    const runtime = createReshowBattleRuntime();
    runtime.battleMonForms[1] = 3;
    runtime.enemyParty[0].hp = 0;
    createBattlerSprite(runtime, 1);
    expect(runtime.createdBattlerSprites).toEqual([]);

    runtime.enemyParty[0].hp = 5;
    runtime.battleSpritesData.battlerData[1].invisible = true;
    createBattlerSprite(runtime, 1);
    expect(runtime.createdBattlerSprites.at(-1)).toMatchObject({ battler: 1, kind: 'Pokemon' });
    const opponentSpriteId = runtime.battlerSpriteIds[1];
    expect(runtime.sprites[opponentSpriteId].oam.paletteNum).toBe(1);
    expect(runtime.sprites[opponentSpriteId].data[0]).toBe(1);
    expect(runtime.sprites[opponentSpriteId].data[2]).toBe(25);
    expect(runtime.sprites[opponentSpriteId].anim).toBe(3);
    expect(runtime.sprites[opponentSpriteId].invisible).toBe(true);

    runtime.battleTypeFlags = BATTLE_TYPE_SAFARI;
    createBattlerSprite(runtime, 0);
    expect(runtime.createdBattlerSprites.at(-1)).toMatchObject({
      battler: 0,
      kind: 'TrainerBack:0',
      x: 0x50,
      y: 80
    });

    runtime.battleTypeFlags = BATTLE_TYPE_OLD_MAN_TUTORIAL;
    createBattlerSprite(runtime, 0);
    expect(runtime.createdBattlerSprites.at(-1)).toMatchObject({
      battler: 0,
      kind: 'TrainerBack:5',
      x: 0x50,
      y: 80
    });

    runtime.battleTypeFlags = 0;
    runtime.playerParty[0].hp = 0;
    const before = runtime.createdBattlerSprites.length;
    createBattlerSprite(runtime, 0);
    expect(runtime.createdBattlerSprites).toHaveLength(before);
  });

  test('CreateHealthboxSprite handles safari, old-man skip, right-side flags, updates, and faint invisibility', () => {
    const runtime = createReshowBattleRuntime();
    runtime.battleTypeFlags = BATTLE_TYPE_SAFARI;
    createHealthboxSprite(runtime, 0);
    expect(runtime.createdHealthboxes.at(-1)).toEqual({
      battler: 0,
      kind: 'CreateSafariPlayerHealthboxSprites',
      healthboxSpriteId: 100
    });
    expect(runtime.healthboxUpdates.at(-1)).toEqual({
      healthboxSpriteId: 100,
      battler: 0,
      side: B_SIDE_PLAYER,
      attr: HEALTHBOX_SAFARI_ALL_TEXT
    });

    runtime.battleTypeFlags = BATTLE_TYPE_OLD_MAN_TUTORIAL;
    createHealthboxSprite(runtime, 0);
    expect(runtime.createdHealthboxes).toHaveLength(1);

    runtime.battleTypeFlags = 0;
    createHealthboxSprite(runtime, 2);
    expect(runtime.healthboxUpdates.at(-1)).toMatchObject({ battler: 2, side: B_SIDE_PLAYER, attr: HEALTHBOX_ALL });
    expect(runtime.dummyBattleInterfaceCalls.at(-1)).toEqual({ healthboxSpriteId: 101, rightSide: true });

    runtime.enemyParty[0].hp = 0;
    createHealthboxSprite(runtime, 1);
    expect(runtime.healthboxUpdates.at(-1)).toMatchObject({ battler: 1, side: B_SIDE_OPPONENT, attr: HEALTHBOX_ALL });
    expect(runtime.invisibleHealthboxes).toContain(102);
  });

  test('state 19 restores shadows/cursor/wireless and state 20 returns to BattleMainCB2', () => {
    const runtime = createReshowBattleRuntime();
    runtime.battleTypeFlags = BATTLE_TYPE_DOUBLE;
    runtime.battlerInMenuId = 2;
    runtime.actionSelectionCursor[2] = 5;
    runtime.wirelessCommType = 1;
    runtime.receivedRemoteLinkPlayers = 1;

    runtime.battleScripting.reshowMainState = 19;
    cb2ReshowBattleScreenAfterMenu(runtime);
    expect(runtime.shadowCallbacks).toEqual([
      { battler: 1, species: 25 },
      { battler: 3, species: 26 }
    ]);
    expect(runtime.logs).toEqual(expect.arrayContaining([
      'LoadAndCreateEnemyShadowSprites',
      'ActionSelectionCreateCursorAt:5:0',
      'LoadWirelessStatusIndicatorSpriteGfx',
      'CreateWirelessStatusIndicatorSprite:0:0'
    ]));

    cb2ReshowBattleScreenAfterMenu(runtime);
    expect(runtime.vblankCallback).toBe('VBlankCB_Battle');
    expect(runtime.gpuRegs.WININ).toBe(0x3f);
    expect(runtime.gpuRegs.DISPCNT_BITS).toBe(0x7040);
    expect(runtime.paletteFade.bufferTransferDisabled).toBe(0);
    expect(runtime.mainCallback2).toBe('BattleMainCB2');
    expect(runtime.logs).toEqual(expect.arrayContaining([
      'BeginHardwarePaletteFade:255:0:16:0:1',
      'BattleInterfaceSetWindowPals'
    ]));
  });

  test('full CB2 sprite/loading states dispatch battlers 0 through 3 in order', () => {
    const runtime = createReshowBattleRuntime();
    runtime.healthboxGfxReadyAfter = 0;

    for (let i = 0; i <= 18; i += 1) {
      cb2ReshowBattleScreenAfterMenu(runtime);
    }

    expect(runtime.loadedSpriteGfx.map((entry) => entry.battler)).toEqual([0, 1, 2, 3]);
    expect(runtime.createdBattlerSprites.map((entry) => entry.battler)).toEqual([0, 1, 2, 3]);
    expect(runtime.createdHealthboxes.map((entry) => entry.battler)).toEqual([0, 1, 2, 3]);
    expect(runtime.battleScripting.reshowMainState).toBe(19);
  });

  test('ReshowBattleScreen_TurnOnDisplay writes the display/window registers directly', () => {
    const runtime = createReshowBattleRuntime();
    reshowBattleScreenTurnOnDisplay(runtime);
    expect(runtime.logs).toContain('EnableInterrupts:INTR_FLAG_VBLANK');
    expect(runtime.gpuRegs).toMatchObject({
      BLDCNT: 0,
      BLDALPHA: 0,
      BLDY: 0,
      WININ: 0x3f,
      WINOUT: 0x3f,
      WIN0H: 0,
      WIN0V: 0,
      WIN1H: 0,
      WIN1V: 0,
      DISPCNT_BITS: 0x7040
    });
  });

  test('exact C-name entry points dispatch through the same reshow helpers', () => {
    const runtime = createReshowBattleRuntime();
    runtime.battleTypeFlags = BATTLE_TYPE_TRAINER;

    expect(() => ReshowBattleScreenDummy()).not.toThrow();
    ReshowBattleScreenAfterMenu(runtime);
    expect(runtime.paletteFade.bufferTransferDisabled).toBe(1);
    expect(runtime.helpContextLog).toEqual([HELPCONTEXT_TRAINER_BATTLE_SINGLE]);
    expect(runtime.mainCallback2).toBe('CB2_ReshowBattleScreenAfterMenu');

    CB2_ReshowBattleScreenAfterMenu(runtime);
    expect(runtime.logs).toContain('ResetSpriteData');
    expect(runtime.battleScripting.reshowMainState).toBe(1);

    expect(LoadBattlerSpriteGfx(runtime, 1)).toBe(true);
    expect(runtime.loadedSpriteGfx.at(-1)).toEqual({ battler: 1, kind: 'BattleLoadOpponentMonSpriteGfx' });

    CreateBattlerSprite(runtime, 1);
    expect(runtime.createdBattlerSprites.at(-1)).toMatchObject({ battler: 1, kind: 'Pokemon' });

    CreateHealthboxSprite(runtime, 1);
    expect(runtime.createdHealthboxes.at(-1)).toMatchObject({ battler: 1, kind: 'CreateBattlerHealthboxSprites' });

    ReshowBattleScreen_TurnOnDisplay(runtime);
    expect(runtime.gpuRegs).toMatchObject({ BLDCNT: 0, WININ: 0x3f, DISPCNT_BITS: 0x7040 });
  });
});
