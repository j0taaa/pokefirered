import { describe, expect, it } from 'vitest';
import {
  AnimateBg2VerticalScroll,
  AnimateSeletGroupModeAndHelpSpriteEnter,
  AnimateFrameResize,
  ClearECRowsWin2,
  CreateFooterWindow,
  CreateRedRectangularCursorSpritePair,
  CreateSelectGroupHelpSprite,
  CreateSelectWordCursorSprite,
  CreateStartSelectButtonsSprites,
  CreateVerticalScrollArrowSprites,
  DestroyRedRectangularCursor,
  DestroySelectWordCursorSprite,
  ECInterfaceCmd_02,
  ECInterfaceCmd_03,
  ECInterfaceCmd_04,
  ECInterfaceCmd_09,
  ECInterfaceCmd_11,
  ECInterfaceCmd_15,
  ECInterfaceCmd_21,
  ECInterfaceCmd_22,
  EasyChatInterfaceCommand_Run,
  EasyChatInterfaceCommand_Setup,
  FreezeSelectDestFieldCursorSprite,
  GetBg2ScrollRow,
  HideStartSelectButtonSprites,
  HideVerticalScrollArrowSprites,
  InitBg2Scroll,
  LoadEasyChatGraphics,
  MODEWINDOW_ANIM_TO_ALPHABET,
  MODEWINDOW_ANIM_TO_GROUP,
  MODEWINDOW_ANIM_TO_HIDDEN,
  MODEWINDOW_ANIM_TRANSITION,
  ModeIconsSpriteAnimIsEnded,
  MoveCursor_Alpha,
  MoveCursor_Group,
  RECTCURSOR_ANIM_ON_BUTTON,
  RECTCURSOR_ANIM_ON_GROUP,
  RECTCURSOR_ANIM_ON_LETTER,
  RECTCURSOR_ANIM_ON_OTHERS,
  RedrawFrameByIndex,
  RedrawFrameByRect,
  RunModeIconHidingAnimation,
  ScheduleBg2VerticalScroll,
  SetRegWin0Coords,
  SetSelectDestFieldCursorSpritePosAndResetAnim,
  SetSelectWordCursorSpritePos,
  SetSelectWordCursorSpritePosExplicit,
  ShowModeIconsSprite,
  ShrinkModeIconsSprite,
  StartWin2FrameAnim,
  SpriteCB_BounceCursor,
  SpriteCB_SelectWordCursorSprite,
  StartModeIconHidingAnimation,
  UnfreezeSelectDestFieldCursorSprite,
  UpdateStartSelectButtonSpriteVisibility,
  UpdateVerticalScrollArrowSpriteXPos,
  UpdateVerticalScrollArrowVisibility,
  WIN_RANGE,
  createEasyChat3Runtime,
  createEasyChatSprite
} from '../src/game/decompEasyChat3';

describe('decompEasyChat3', () => {
  it('WIN_RANGE and SetRegWin0Coords match GBA register packing', () => {
    const runtime = createEasyChat3Runtime();

    expect(WIN_RANGE(8, 24)).toBe((8 << 8) | 24);
    SetRegWin0Coords(runtime, 16, 24, 32, 40);

    expect(runtime.win0H).toBe(WIN_RANGE(16, 48));
    expect(runtime.win0V).toBe(WIN_RANGE(24, 64));
  });

  it('StartWin2FrameAnim initializes every decompiled animation range and delta', () => {
    const runtime = createEasyChat3Runtime();
    const expected = [
      [0, 10, 1],
      [9, 0, -1],
      [11, 17, 1],
      [17, 0, -1],
      [17, 10, -1],
      [18, 22, 1],
      [22, 18, -1]
    ];

    expected.forEach(([idx, target, delta], animNo) => {
      StartWin2FrameAnim(runtime, animNo);
      expect([runtime.frameAnimIdx, runtime.frameAnimTarget, runtime.frameAnimDelta]).toEqual([idx, target, delta]);
    });
  });

  it('AnimateFrameResize advances one step, redraws by index, and returns false at target', () => {
    const runtime = createEasyChat3Runtime();

    StartWin2FrameAnim(runtime, 0);
    expect(AnimateFrameResize(runtime)).toBe(true);
    expect(runtime.frameAnimIdx).toBe(1);
    expect(runtime.filledRects[0]).toEqual({ bg: 1, tile: 0, left: 0, top: 10, width: 30, height: 10 });
    expect(runtime.copiedBgIds).toEqual([1]);

    for (let i = 0; i < 8; i += 1) {
      expect(AnimateFrameResize(runtime)).toBe(true);
    }
    expect(AnimateFrameResize(runtime)).toBe(false);
    expect(runtime.frameAnimIdx).toBe(10);
  });

  it('RedrawFrameByRect writes exact corner, edge, fill tiles and WIN0 interior', () => {
    const runtime = createEasyChat3Runtime();

    RedrawFrameByRect(runtime, 2, 3, 5, 4);
    const tile = (x: number, y: number) => runtime.bg1TilemapBuffer[y * 32 + x];

    expect(tile(2, 3)).toBe(0x4001);
    expect(tile(3, 3)).toBe(0x4002);
    expect(tile(6, 3)).toBe(0x4003);
    expect(tile(2, 4)).toBe(0x4005);
    expect(tile(3, 4)).toBe(0x4000);
    expect(tile(6, 4)).toBe(0x4007);
    expect(tile(2, 6)).toBe(0x4009);
    expect(tile(3, 6)).toBe(0x400a);
    expect(tile(6, 6)).toBe(0x400b);
    expect(runtime.win0H).toBe(WIN_RANGE(24, 48));
    expect(runtime.win0V).toBe(WIN_RANGE(32, 48));
  });

  it('RedrawFrameByIndex preserves special case 0 and maps frame 17 to full width', () => {
    const runtime = createEasyChat3Runtime();

    RedrawFrameByIndex(runtime, 0);
    expect(runtime.filledRects).toEqual([{ bg: 1, tile: 0, left: 0, top: 10, width: 30, height: 10 }]);
    expect(runtime.copiedBgIds).toEqual([1]);
    expect(runtime.win0H).toBe(0);

    RedrawFrameByIndex(runtime, 17);
    expect(runtime.win0H).toBe(WIN_RANGE(8, 232));
    expect(runtime.win0V).toBe(WIN_RANGE(88, 152));
  });

  it('BG2 scroll init, immediate scheduling, animated scheduling, and row tracking match C', () => {
    const runtime = createEasyChat3Runtime();

    InitBg2Scroll(runtime);
    expect(runtime.bg2Y).toBe(0x800);
    expect(GetBg2ScrollRow(runtime)).toBe(0);

    ScheduleBg2VerticalScroll(runtime, 1, 0);
    expect(runtime.bg2Y).toBe(0x1800);
    expect(GetBg2ScrollRow(runtime)).toBe(1);

    ScheduleBg2VerticalScroll(runtime, -2, 3);
    expect(runtime.bg2Y).toBe(0x1800);
    expect(runtime.tgtBgY).toBe(-0x800);
    expect(runtime.deltaBgY).toBe(-0x300);
    expect(GetBg2ScrollRow(runtime)).toBe(-1);
    expect(AnimateBg2VerticalScroll(runtime)).toBe(true);
    expect(runtime.bg2Y).toBe(0x1500);
    runtime.bg2Y = runtime.tgtBgY;
    expect(AnimateBg2VerticalScroll(runtime)).toBe(false);
  });

  it('group cursor positions sprites exactly like easy_chat_3.c', () => {
    const runtime = createEasyChat3Runtime({
      rectCursorSpriteRight: createEasyChatSprite(),
      rectCursorSpriteLeft: createEasyChatSprite()
    });

    MoveCursor_Group(runtime, 1, 2);
    expect(runtime.rectCursorSpriteRight).toMatchObject({ animNum: RECTCURSOR_ANIM_ON_GROUP, x: 142, y: 128 });
    expect(runtime.rectCursorSpriteLeft).toMatchObject({ animNum: RECTCURSOR_ANIM_ON_GROUP, x: 142, y: 128 });

    MoveCursor_Group(runtime, -1, 1);
    expect(runtime.rectCursorSpriteRight).toMatchObject({ animNum: RECTCURSOR_ANIM_ON_BUTTON, x: 216, y: 128 });
    expect(runtime.rectCursorSpriteLeft).toMatchObject({ animNum: RECTCURSOR_ANIM_ON_BUTTON, x: 216, y: 128 });
  });

  it('alphabet cursor handles letters, Others, out-of-range fallback, and button row', () => {
    const runtime = createEasyChat3Runtime({
      rectCursorSpriteRight: createEasyChatSprite(),
      rectCursorSpriteLeft: createEasyChatSprite()
    });

    MoveCursor_Alpha(runtime, 3, 1);
    expect(runtime.rectCursorSpriteRight).toMatchObject({ animNum: RECTCURSOR_ANIM_ON_LETTER, x: 88, y: 112 });
    expect(runtime.rectCursorSpriteLeft).toMatchObject({ animNum: RECTCURSOR_ANIM_ON_LETTER, x: 88, y: 112 });

    MoveCursor_Alpha(runtime, 6, 0);
    expect(runtime.rectCursorSpriteRight).toMatchObject({ animNum: RECTCURSOR_ANIM_ON_OTHERS, x: 157, y: 96 });

    MoveCursor_Alpha(runtime, 99, 2);
    expect(runtime.rectCursorSpriteRight).toMatchObject({ animNum: RECTCURSOR_ANIM_ON_LETTER, x: 32, y: 128 });

    MoveCursor_Alpha(runtime, -1, 2);
    expect(runtime.rectCursorSpriteRight).toMatchObject({ animNum: RECTCURSOR_ANIM_ON_BUTTON, x: 216, y: 144 });
  });

  it('select-destination cursor bounce, freeze, unfreeze, and reposition match C state updates', () => {
    const sprite = createEasyChatSprite({ data: [0, 1, 0, 0], x2: -1 });
    SpriteCB_BounceCursor(sprite);
    SpriteCB_BounceCursor(sprite);
    expect(sprite).toMatchObject({ data: [2, 1, 0, 0], x2: -1 });
    SpriteCB_BounceCursor(sprite);
    expect(sprite).toMatchObject({ data: [0, 1, 0, 0], x2: 0 });
    SpriteCB_BounceCursor(sprite);
    SpriteCB_BounceCursor(sprite);
    SpriteCB_BounceCursor(sprite);
    expect(sprite).toMatchObject({ data: [0, 1, 0, 0], x2: -6 });

    const runtime = createEasyChat3Runtime({ selectDestFieldCursorSprite: sprite });
    SetSelectDestFieldCursorSpritePosAndResetAnim(runtime, 37, 49);
    expect(sprite).toMatchObject({ x: 37, y: 49, x2: 0, data: [0, 1, 0, 0] });
    FreezeSelectDestFieldCursorSprite(runtime);
    expect(sprite).toMatchObject({ x2: 0, data: [0, 0, 0, 0] });
    UnfreezeSelectDestFieldCursorSprite(runtime);
    expect(sprite.data[1]).toBe(1);
  });

  it('creates and destroys rectangular cursor pair with the same x2 and hFlip setup', () => {
    const runtime = createEasyChat3Runtime();
    CreateRedRectangularCursorSpritePair(runtime);

    expect(runtime.rectCursorSpriteRight).toMatchObject({ x2: 32, hFlip: true, destroyed: false });
    expect(runtime.rectCursorSpriteLeft).toMatchObject({ x2: -32, hFlip: false, destroyed: false });

    DestroyRedRectangularCursor(runtime);
    expect(runtime.rectCursorSpriteRight).toBeNull();
    expect(runtime.rectCursorSpriteLeft).toBeNull();
  });

  it('word cursor creation, explicit positioning, callback bounce, auto positioning, and destroy match C', () => {
    const runtime = createEasyChat3Runtime({ selectWordCursorX: 1, selectWordCursorY: 2 });
    CreateSelectWordCursorSprite(runtime);

    expect(runtime.selectWordCursorSprite).toMatchObject({ x: 132, y: 129, x2: 0, data: [0, 0, 0, 0] });
    SetSelectWordCursorSpritePosExplicit(runtime, 4, 6);
    expect(runtime.selectWordCursorSprite).toMatchObject({ x: 36, y: 57, x2: 0, data: [0, 0, 0, 0] });

    const sprite = runtime.selectWordCursorSprite!;
    SpriteCB_SelectWordCursorSprite(sprite);
    SpriteCB_SelectWordCursorSprite(sprite);
    SpriteCB_SelectWordCursorSprite(sprite);
    expect(sprite).toMatchObject({ data: [0, 0, 0, 0], x2: -6 });

    runtime.selectWordCursorX = 0;
    runtime.selectWordCursorY = 0;
    SetSelectWordCursorSpritePos(runtime);
    expect(sprite).toMatchObject({ x: 28, y: 97, x2: 0, data: [0, 0, 0, 0] });

    DestroySelectWordCursorSprite(runtime);
    expect(runtime.selectWordCursorSprite).toBeNull();
  });

  it('mode/help sprites run the same enter, hide, shrink, show, and inverted-ended checks', () => {
    const runtime = createEasyChat3Runtime();
    CreateSelectGroupHelpSprite(runtime);
    expect(runtime.selectGroupHelpSprite).toMatchObject({ x: 208, y: 128, x2: -64 });
    expect(runtime.modeIconsSprite).toMatchObject({ x: 208, y: 80 });

    for (let i = 0; i < 7; i += 1) {
      expect(AnimateSeletGroupModeAndHelpSpriteEnter(runtime)).toBe(true);
    }
    expect(runtime.selectGroupHelpSprite).toMatchObject({ x2: -8 });
    expect(AnimateSeletGroupModeAndHelpSpriteEnter(runtime)).toBe(true);
    expect(runtime.selectGroupHelpSprite).toMatchObject({ x2: 0 });
    expect(runtime.modeIconsSprite).toMatchObject({ animNum: MODEWINDOW_ANIM_TO_GROUP, animEnded: false });
    expect(runtime.modeIconState).toBe(1);
    runtime.modeIconsSprite!.animEnded = true;
    expect(AnimateSeletGroupModeAndHelpSpriteEnter(runtime)).toBe(false);
    expect(runtime.modeIconState).toBe(2);

    runtime.isAlphaMode = true;
    ShowModeIconsSprite(runtime);
    expect(runtime.modeIconsSprite).toMatchObject({ animNum: MODEWINDOW_ANIM_TO_ALPHABET, animEnded: false });
    ShrinkModeIconsSprite(runtime);
    expect(runtime.modeIconsSprite).toMatchObject({ animNum: MODEWINDOW_ANIM_TRANSITION, animEnded: false });
    expect(ModeIconsSpriteAnimIsEnded(runtime)).toBe(true);
    runtime.modeIconsSprite!.animEnded = true;
    expect(ModeIconsSpriteAnimIsEnded(runtime)).toBe(false);

    StartModeIconHidingAnimation(runtime);
    expect(runtime.modeIconsSprite).toMatchObject({ animNum: MODEWINDOW_ANIM_TO_HIDDEN, animEnded: false });
    expect(RunModeIconHidingAnimation(runtime)).toBe(true);
    runtime.modeIconsSprite!.animEnded = true;
    expect(RunModeIconHidingAnimation(runtime)).toBe(true);
    expect(runtime.modeIconState).toBe(1);
    for (let i = 0; i < 7; i += 1) {
      expect(RunModeIconHidingAnimation(runtime)).toBe(true);
    }
    expect(RunModeIconHidingAnimation(runtime)).toBe(false);
    expect(runtime.modeIconsSprite).toBeNull();
    expect(runtime.selectGroupHelpSprite).toBeNull();
  });

  it('vertical scroll arrows and start/select button sprites use the exact positions, flips, anims, and visibility rules', () => {
    const runtime = createEasyChat3Runtime({ shouldDrawUpArrow: true, shouldDrawDownArrow: false });
    CreateVerticalScrollArrowSprites(runtime);
    expect(runtime.upTriangleCursorSprite).toMatchObject({ x: 96, y: 80, invisible: true });
    expect(runtime.downTriangleCursorSprite).toMatchObject({ x: 96, y: 156, vFlip: true, invisible: true });

    UpdateVerticalScrollArrowVisibility(runtime);
    expect(runtime.upTriangleCursorSprite).toMatchObject({ invisible: false });
    expect(runtime.downTriangleCursorSprite).toMatchObject({ invisible: true });
    UpdateVerticalScrollArrowSpriteXPos(runtime, 1);
    expect(runtime.upTriangleCursorSprite).toMatchObject({ x: 120 });
    expect(runtime.downTriangleCursorSprite).toMatchObject({ x: 120 });
    HideVerticalScrollArrowSprites(runtime);
    expect(runtime.upTriangleCursorSprite).toMatchObject({ invisible: true });
    expect(runtime.downTriangleCursorSprite).toMatchObject({ invisible: true });

    runtime.shouldDrawUpArrow = false;
    runtime.shouldDrawDownArrow = true;
    CreateStartSelectButtonsSprites(runtime);
    expect(runtime.startPgUpButtonSprite).toMatchObject({ x: 220, y: 84, invisible: true });
    expect(runtime.selectPgDnButtonSprite).toMatchObject({ x: 220, y: 156, animNum: 1, invisible: true });
    UpdateStartSelectButtonSpriteVisibility(runtime);
    expect(runtime.startPgUpButtonSprite).toMatchObject({ invisible: true });
    expect(runtime.selectPgDnButtonSprite).toMatchObject({ invisible: false });
    HideStartSelectButtonSprites(runtime);
    expect(runtime.startPgUpButtonSprite).toMatchObject({ invisible: true });
    expect(runtime.selectPgDnButtonSprite).toMatchObject({ invisible: true });
  });

  it('LoadEasyChatGraphics advances through the decompiled staged loader and waits when DMA is busy', () => {
    const runtime = createEasyChat3Runtime({
      titleText: 'TITLE',
      instructionsText1: 'Use words',
      easyChatWordBuffer: [1, 0xffff, 2, 3],
      easyChatWords: new Map([[1, 'HELLO'], [2, 'WORLD'], [3, '!']])
    });

    for (let state = 0; state < 5; state += 1) {
      expect(LoadEasyChatGraphics(runtime)).toBe(true);
      expect(runtime.state).toBe(state + 1);
    }
    runtime.dmaBusy = true;
    expect(LoadEasyChatGraphics(runtime)).toBe(true);
    expect(runtime.state).toBe(5);
    runtime.dmaBusy = false;
    expect(LoadEasyChatGraphics(runtime)).toBe(true);
    expect(runtime.state).toBe(6);
    expect(runtime.bgVisibility).toEqual([true, true, true, true]);
    expect(runtime.selectDestFieldCursorSprite).not.toBeNull();
    expect(runtime.upTriangleCursorSprite).toMatchObject({ invisible: true });
    expect(runtime.selectPgDnButtonSprite).toMatchObject({ animNum: 1, invisible: true });
    expect(LoadEasyChatGraphics(runtime)).toBe(false);
  });

  it('print helpers match phrase frame, word menu, clear wrapping, and footer side effects', () => {
    const runtime = createEasyChat3Runtime({
      screenFrameId: 0,
      selectedGroups: [4, 5, 6],
      groupRowsAbove: 2,
      displayedWords: [10, 11, 0xffff, 12, 13, 14],
      easyChatWords: new Map([[10, 'ONE'], [11, 'TWO'], [12, 'THREE'], [13, 'FOUR'], [14, 'FIVE']])
    });

    CreateFooterWindow(runtime);
    expect(runtime.printedTexts.at(-1)).toMatchObject({ windowId: 4, text: 'DEL ALL/CANCEL/OK', y: 2 });

    EasyChatInterfaceCommand_Setup(runtime, 9);
    expect(runtime.state).toBe(1);
    expect(runtime.bgVisibility[0]).toBe(false);
    expect(runtime.bg2ScrollRow).toBe(2);
    expect(runtime.printedTexts.map((entry) => entry.text)).toContain('GROUP_4');
    expect(runtime.printedTexts.map((entry) => entry.text)).toContain('GROUP_6');

    runtime.pixelRects = [];
    ClearECRowsWin2(runtime, 10, 8);
    expect(runtime.pixelRects).toEqual([
      { windowId: 2, fill: 1, x: 0, y: 0, width: 224, height: 128 }
    ]);
    ClearECRowsWin2(runtime, 9, 8);
    expect(runtime.pixelRects.at(-2)).toEqual({ windowId: 2, fill: 1, x: 0, y: 240, width: 224, height: 16 });
    expect(runtime.pixelRects.at(-1)).toEqual({ windowId: 2, fill: 1, x: 0, y: 0, width: 224, height: 112 });
  });

  it('interface commands position cursors and confirmation prompts exactly like C branches', () => {
    const runtime = createEasyChat3Runtime({
      selectDestFieldCursorSprite: createEasyChatSprite({ data: [1, 1, 0, 0], x2: -3 }),
      easyChatWordBuffer: [100, 0xffff, 101, 102],
      easyChatWords: new Map([[100, 'AAA'], [101, 'BBBB'], [102, 'CC']]),
      mainCursorColumn: 1,
      mainCursorRow: 0,
      numColumns: 2,
      screenFrameId: 0,
      confirmDeletionText1: 'Delete?',
      confirmDeletionText2: 'Really?'
    });

    expect(ECInterfaceCmd_02(runtime)).toBe(false);
    expect(runtime.selectDestFieldCursorSprite).toMatchObject({ x: 78, y: 41, x2: 0, data: [0, 1, 0, 0] });

    runtime.mainCursorColumn = 2;
    expect(ECInterfaceCmd_03(runtime)).toBe(false);
    expect(runtime.selectDestFieldCursorSprite).toMatchObject({ x: 191, y: 97 });
    runtime.mainCursorColumn = 9;
    expect(ECInterfaceCmd_03(runtime)).toBe(false);

    runtime.state = 0;
    expect(ECInterfaceCmd_04(runtime)).toBe(true);
    expect(runtime.selectDestFieldCursorSprite).toMatchObject({ data: [0, 0, 0, 0], x2: 0 });
    expect(runtime.yesNoInitialCursorPos).toBe(1);
    expect(runtime.printedTexts.map((entry) => entry.text)).toContain('Delete?');
    runtime.dmaBusy = true;
    expect(ECInterfaceCmd_04(runtime)).toBe(true);
    runtime.dmaBusy = false;
    expect(ECInterfaceCmd_04(runtime)).toBe(false);
  });

  it('interface command state machines keep C return values for group, word, scroll, and mode-switch flows', () => {
    const runtime = createEasyChat3Runtime({
      selectDestFieldCursorSprite: createEasyChatSprite({ data: [0, 1, 0, 0] }),
      selectedGroups: [1],
      displayedWords: [1, 2, 3, 4, 5, 6, 7, 8],
      easyChatWords: new Map([[1, 'A'], [2, 'B'], [3, 'C'], [4, 'D'], [5, 'E'], [6, 'F'], [7, 'G'], [8, 'H']]),
      shouldDrawUpArrow: true,
      shouldDrawDownArrow: true,
      groupCursorX: 1,
      groupCursorY: 1,
      wordRowsAbove: 3,
      wordNumRows: 8
    });
    CreateVerticalScrollArrowSprites(runtime);
    CreateStartSelectButtonsSprites(runtime);

    EasyChatInterfaceCommand_Setup(runtime, 9);
    while (runtime.state < 4)
      expect(EasyChatInterfaceCommand_Run(runtime)).toBe(true);
    for (let i = 0; i < 8; i += 1)
      expect(ECInterfaceCmd_09(runtime)).toBe(true);
    runtime.modeIconsSprite!.animEnded = true;
    expect(ECInterfaceCmd_09(runtime)).toBe(false);
    expect(runtime.rectCursorSpriteRight).toMatchObject({ x2: 32 });

    runtime.state = 0;
    expect(ECInterfaceCmd_15(runtime)).toBe(true);
    runtime.bg2Y = runtime.tgtBgY;
    expect(ECInterfaceCmd_15(runtime)).toBe(false);
    expect(runtime.rectCursorSpriteRight).toMatchObject({ x: 142, y: 112 });

    runtime.state = 0;
    expect(ECInterfaceCmd_11(runtime)).toBe(true);
    runtime.modeIconsSprite!.animEnded = true;
    while (runtime.modeIconState < 2)
      ECInterfaceCmd_11(runtime);
    while (runtime.state < 4)
      ECInterfaceCmd_11(runtime);
    expect(ECInterfaceCmd_11(runtime)).toBe(false);
    expect(runtime.selectWordCursorSprite).not.toBeNull();
    expect(runtime.upTriangleCursorSprite).toMatchObject({ x: 120, invisible: false });

    runtime.state = 0;
    runtime.bg2Y = 0x800;
    runtime.bg2ScrollRow = 1;
    expect(ECInterfaceCmd_21(runtime)).toBe(true);
    expect(ECInterfaceCmd_21(runtime)).toBe(true);
    expect(runtime.tgtBgY).toBe(0x2800);
    runtime.bg2Y = runtime.tgtBgY;
    expect(ECInterfaceCmd_21(runtime)).toBe(false);

    runtime.modeIconsSprite = createEasyChatSprite({ animEnded: true });
    runtime.rectCursorSpriteRight = createEasyChatSprite();
    runtime.rectCursorSpriteLeft = createEasyChatSprite();
    runtime.state = 0;
    expect(ECInterfaceCmd_22(runtime)).toBe(true);
    while (runtime.state < 2) {
      if (runtime.frameAnimIdx === runtime.frameAnimTarget)
        runtime.modeIconsSprite!.animEnded = true;
      ECInterfaceCmd_22(runtime);
    }
    expect(runtime.state).toBe(2);
  });
});
