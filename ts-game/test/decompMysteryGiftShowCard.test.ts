import { describe, expect, test } from 'vitest';
import {
  CARD_TYPE_COUNT,
  CARD_TYPE_GIFT,
  CARD_TYPE_LINK_STAT,
  CARD_TYPE_STAMP,
  CHAR_DYNAMIC,
  COPYWIN_FULL,
  MAX_STAMP_CARD_STAMPS,
  NUM_WONDER_BGS,
  SPRITE_NONE,
  TAG_STAMP_SHADOW,
  WIN_BODY,
  WIN_FOOTER,
  WIN_HEADER,
  BufferCardText,
  CreateCardSprites,
  DestroyCardSprites,
  DrawCardWindow,
  WonderCard_Destroy,
  WonderCard_Enter,
  WonderCard_Exit,
  WonderCard_Init,
  bufferCardText,
  createCardSprites,
  createWonderCard,
  createWonderCardMetadata,
  createWonderCardRuntime,
  destroyCardSprites,
  drawCardWindow,
  sCardGraphics,
  sFooterTextOffsets,
  sSpritePalettesStampShadow,
  sSpriteSheetStampShadow,
  sWindowTemplates,
  textBytesToString,
  wonderCardDestroy,
  wonderCardEnter,
  wonderCardExit,
  wonderCardInit
} from '../src/game/decompMysteryGiftShowCard';

describe('decomp mystery_gift_show_card', () => {
  test('WonderCard_Init rejects null/allocation failure and clamps bg/type/stamps', () => {
    const runtime = createWonderCardRuntime();
    expect(wonderCardInit(runtime, null, createWonderCardMetadata())).toBe(false);
    expect(wonderCardInit(runtime, createWonderCard(), null)).toBe(false);
    runtime.allocFails = true;
    expect(wonderCardInit(runtime, createWonderCard(), createWonderCardMetadata())).toBe(false);

    runtime.allocFails = false;
    expect(wonderCardInit(runtime, createWonderCard({ bgType: NUM_WONDER_BGS, type: CARD_TYPE_COUNT, maxStamps: MAX_STAMP_CARD_STAMPS + 1 }), createWonderCardMetadata())).toBe(true);
    expect(runtime.data?.card.bgType).toBe(0);
    expect(runtime.data?.card.type).toBe(CARD_TYPE_GIFT);
    expect(runtime.data?.card.maxStamps).toBe(0);
    expect(runtime.data?.gfx).toBe(sCardGraphics[0]);
  });

  test('WonderCard_Destroy clears allocation and enter/exit return -1 afterward', () => {
    const runtime = createWonderCardRuntime();
    wonderCardInit(runtime, createWonderCard({ bgType: 3 }), createWonderCardMetadata());
    wonderCardDestroy(runtime);
    expect(runtime.data).toBeNull();
    expect(wonderCardEnter(runtime)).toBe(-1);
    expect(wonderCardExit(runtime, false)).toBe(-1);
  });

  test('BufferCardText copies gift card text, clamps id number, and preserves footer line 2', () => {
    const runtime = createWonderCardRuntime();
    wonderCardInit(runtime, createWonderCard({
      idNumber: 1_000_000,
      titleText: Array.from('Title', (c) => c.charCodeAt(0)),
      subtitleText: Array.from('Sub', (c) => c.charCodeAt(0)),
      bodyText: ['a', 'b', 'c', 'd'].map((s) => Array.from(s, (c) => c.charCodeAt(0))),
      footerLine1Text: Array.from('Footer1', (c) => c.charCodeAt(0)),
      footerLine2Text: Array.from('Footer2', (c) => c.charCodeAt(0))
    }), createWonderCardMetadata());

    bufferCardText(runtime);

    expect(runtime.data?.card.idNumber).toBe(999999);
    expect(textBytesToString(runtime.data!.titleText)).toBe('Title');
    expect(textBytesToString(runtime.data!.subtitleText)).toBe('Sub');
    expect(textBytesToString(runtime.data!.idNumberText)).toBe('999999');
    expect(runtime.data?.bodyText.map(textBytesToString)).toEqual(['a', 'b', 'c', 'd']);
    expect(textBytesToString(runtime.data!.footerLine1Text)).toBe('Footer1');
    expect(textBytesToString(runtime.data!.footerLine2Text)).toBe('Footer2');
  });

  test('BufferCardText clears stamp footer line 2 and parses link-stat dynamic records exactly', () => {
    const stampRuntime = createWonderCardRuntime();
    wonderCardInit(stampRuntime, createWonderCard({ type: CARD_TYPE_STAMP, footerLine2Text: Array.from('ignored', (c) => c.charCodeAt(0)) }), createWonderCardMetadata());
    bufferCardText(stampRuntime);
    expect(textBytesToString(stampRuntime.data!.footerLine2Text)).toBe('');

    const linkRuntime = createWonderCardRuntime();
    const footer = [
      ...Array.from('W', (c) => c.charCodeAt(0)), CHAR_DYNAMIC, 0, 4,
      ...Array.from(' L', (c) => c.charCodeAt(0)), CHAR_DYNAMIC, 1, 5,
      ...Array.from(' T', (c) => c.charCodeAt(0)), CHAR_DYNAMIC, 2, 6,
      CHAR_DYNAMIC, 9, 99
    ];
    wonderCardInit(linkRuntime, createWonderCard({ type: CARD_TYPE_LINK_STAT, footerLine2Text: footer }), createWonderCardMetadata({
      battlesWon: 1000,
      battlesLost: 8,
      numTrades: 12
    }));

    bufferCardText(linkRuntime);

    expect(linkRuntime.data?.recordIdx).toBe(3);
    expect(textBytesToString(linkRuntime.data!.statTextData[0].statText)).toBe('W');
    expect(textBytesToString(linkRuntime.data!.statTextData[0].statNumberText)).toBe('999');
    expect(linkRuntime.data?.statTextData[0].width).toBe(4);
    expect(textBytesToString(linkRuntime.data!.statTextData[1].statText)).toBe(' L');
    expect(textBytesToString(linkRuntime.data!.statTextData[1].statNumberText)).toBe('008');
    expect(textBytesToString(linkRuntime.data!.statTextData[2].statNumberText)).toBe('012');
  });

  test('DrawCardWindow renders header/body/footer variants and copies each window to VRAM', () => {
    const runtime = createWonderCardRuntime();
    wonderCardInit(runtime, createWonderCard({
      type: CARD_TYPE_LINK_STAT,
      idNumber: 55,
      titleText: Array.from('T', (c) => c.charCodeAt(0)),
      subtitleText: Array.from('S', (c) => c.charCodeAt(0)),
      bodyText: ['one', 'two', 'three', 'four'].map((s) => Array.from(s, (c) => c.charCodeAt(0))),
      footerLine1Text: Array.from('F1', (c) => c.charCodeAt(0)),
      footerLine2Text: [CHAR_DYNAMIC, 0, 2]
    }), createWonderCardMetadata({ battlesWon: 3 }));
    runtime.data!.windowIds = [10, 11, 12];
    bufferCardText(runtime);

    drawCardWindow(runtime, WIN_HEADER);
    drawCardWindow(runtime, WIN_BODY);
    drawCardWindow(runtime, WIN_FOOTER);

    expect(runtime.textPrinters[0]).toMatchObject({ windowId: 10, font: 'FONT_NORMAL_COPY_2', x: 0, y: 1, text: 'T' });
    expect(runtime.textPrinters[1]).toMatchObject({ windowId: 10, x: 152, y: 17, text: 'S' });
    expect(runtime.textPrinters[2]).toMatchObject({ windowId: 10, font: 'FONT_NORMAL', x: 166, y: 17, text: '55' });
    expect(runtime.textPrinters.filter((p) => p.windowId === 11).map((p) => p.y)).toEqual([2, 18, 34, 50]);
    expect(runtime.textPrinters.find((p) => p.windowId === 12 && p.text === 'F1')?.y).toBe(sFooterTextOffsets[CARD_TYPE_LINK_STAT]);
    expect(runtime.textPrinters.find((p) => p.windowId === 12 && p.text === '003')?.font).toBe('FONT_NORMAL');
    expect(runtime.copiedWindows).toEqual([{ windowId: 10, mode: COPYWIN_FULL }, { windowId: 11, mode: COPYWIN_FULL }, { windowId: 12, mode: COPYWIN_FULL }]);
  });

  test('CreateCardSprites creates icon, stamp shadows, stamped mon icons, and DestroyCardSprites mirrors the decomp bug path', () => {
    const runtime = createWonderCardRuntime();
    wonderCardInit(runtime, createWonderCard({ type: CARD_TYPE_STAMP, maxStamps: 3, bgType: 2 }), createWonderCardMetadata({
      iconSpecies: 25,
      stampData: [[1, 0, 4]]
    }));

    createCardSprites(runtime);

    expect(runtime.data?.monIconSpriteId).toBe(0);
    expect(runtime.sprites[0]).toMatchObject({ kind: 'monIcon', species: 25, x: 220, y: 20, priority: 2 });
    expect(runtime.loadedSpriteSheets).toEqual([sSpriteSheetStampShadow]);
    expect(runtime.loadedSpritePalettes).toEqual([sSpritePalettesStampShadow[2]]);
    expect(runtime.data?.stampSpriteIds.slice(0, 3)).toEqual([[1, 2], [3, SPRITE_NONE], [4, 5]]);
    expect(runtime.sprites[1]).toMatchObject({ kind: 'stampShadow', x: 216, y: 0x90, subpriority: 8 });
    expect(runtime.sprites[2]).toMatchObject({ kind: 'monIcon', species: 1, x: 216, y: 136, priority: 2 });

    destroyCardSprites(runtime);
    expect(runtime.sprites[0].destroyed).toBe(true);
    expect(runtime.sprites[1].destroyed).toBe(true);
    expect(runtime.sprites[2].destroyed).toBe(true);
    expect(runtime.sprites[3].destroyed).toBe(true);
    expect(runtime.operations.some((entry) => entry.op === 'DestroyMonIcon' && entry.args[0] === SPRITE_NONE)).toBe(true);
    expect(runtime.freedSpriteTiles).toEqual([TAG_STAMP_SHADOW]);
    expect(runtime.freedSpritePalettes).toEqual([TAG_STAMP_SHADOW]);
  });

  test('WonderCard_Enter runs the full enter state machine and respects busy waits', () => {
    const runtime = createWonderCardRuntime();
    runtime.paletteFadeBusyQueue = [true, false, false];
    runtime.tempTileDataBusyQueue = [true, false];
    wonderCardInit(runtime, createWonderCard({ bgType: 7, titleText: Array.from('Hi', (c) => c.charCodeAt(0)) }), createWonderCardMetadata({ iconSpecies: 7 }));

    expect(wonderCardEnter(runtime)).toBe(0);
    expect(runtime.data?.enterExitState).toBe(1);
    expect(wonderCardEnter(runtime)).toBe(0);
    expect(runtime.data?.enterExitState).toBe(1);
    expect(wonderCardEnter(runtime)).toBe(0);
    expect(runtime.data?.enterExitState).toBe(2);
    expect(wonderCardEnter(runtime)).toBe(0);
    expect(runtime.data?.windowIds).toEqual([0, 1, 2]);
    expect(runtime.windows.get(0)).toEqual(sWindowTemplates[WIN_HEADER]);
    expect(wonderCardEnter(runtime)).toBe(0);
    expect(runtime.data?.enterExitState).toBe(3);
    expect(wonderCardEnter(runtime)).toBe(0);
    expect(runtime.paletteFade.bufferTransferDisabled).toBe(true);
    expect(wonderCardEnter(runtime)).toBe(0);
    expect(textBytesToString(runtime.data!.titleText)).toBe('Hi');
    expect(wonderCardEnter(runtime)).toBe(0);
    expect(runtime.textPrinters.length).toBeGreaterThan(0);
    expect(wonderCardEnter(runtime)).toBe(0);
    expect(runtime.loadedMonIconPalettes).toBe(true);
    expect(wonderCardEnter(runtime)).toBe(0);
    expect([...runtime.shownBgs]).toEqual([1, 2]);
    expect(runtime.paletteFade.bufferTransferDisabled).toBe(false);
    expect(runtime.sprites[runtime.data!.monIconSpriteId].species).toBe(7);
    expect(wonderCardEnter(runtime)).toBe(1);
    expect(runtime.data?.enterExitState).toBe(0);
    expect(runtime.operations.some((entry) => entry.op === 'DecompressAndCopyTileDataToVram' && entry.args[1] === 'sCard7Gfx')).toBe(true);
  });

  test('WonderCard_Exit removes windows, destroys sprites, prints top menu, fades back, and resets state', () => {
    const runtime = createWonderCardRuntime();
    runtime.paletteFadeBusyQueue = [true, false, false];
    wonderCardInit(runtime, createWonderCard({ type: CARD_TYPE_STAMP, maxStamps: 1 }), createWonderCardMetadata({ iconSpecies: 2, stampData: [[3]] }));
    runtime.data!.windowIds = [5, 6, 7];
    runtime.windows.set(5, sWindowTemplates[WIN_HEADER]);
    runtime.windows.set(6, sWindowTemplates[WIN_BODY]);
    runtime.windows.set(7, sWindowTemplates[WIN_FOOTER]);
    createCardSprites(runtime);
    runtime.giftIsFromEReader = true;

    expect(wonderCardExit(runtime, true)).toBe(0);
    expect(runtime.data?.enterExitState).toBe(1);
    expect(wonderCardExit(runtime, true)).toBe(0);
    expect(runtime.data?.enterExitState).toBe(1);
    expect(wonderCardExit(runtime, true)).toBe(0);
    expect(wonderCardExit(runtime, true)).toBe(0);
    expect(wonderCardExit(runtime, true)).toBe(0);
    expect(runtime.removedWindows).toEqual([7, 6, 5]);
    expect([...runtime.hiddenBgs]).toEqual([1, 2]);
    expect(wonderCardExit(runtime, true)).toBe(0);
    expect(runtime.freedMonIconPalettes).toBe(true);
    expect(wonderCardExit(runtime, true)).toBe(0);
    expect(runtime.operations.at(-1)).toEqual({ op: 'PrintMysteryGiftOrEReaderTopMenu', args: [true, true] });
    expect(wonderCardExit(runtime, true)).toBe(0);
    expect(runtime.operations.at(-1)?.op).toBe('BeginNormalPaletteFade');
    expect(wonderCardExit(runtime, true)).toBe(1);
    expect(runtime.data?.enterExitState).toBe(0);
  });

  test('exact C-name Wonder Card helpers preserve init, draw, sprite, enter/exit, and destroy behavior', () => {
    const runtime = createWonderCardRuntime();
    const card = createWonderCard({
      type: CARD_TYPE_STAMP,
      bgType: 1,
      maxStamps: 2,
      idNumber: 77,
      titleText: Array.from('Exact', (c) => c.charCodeAt(0)),
      subtitleText: Array.from('Card', (c) => c.charCodeAt(0)),
      footerLine1Text: Array.from('Footer', (c) => c.charCodeAt(0))
    });
    const metadata = createWonderCardMetadata({ iconSpecies: 25, stampData: [[1, 0]] });

    expect(WonderCard_Init(runtime, card, metadata)).toBe(true);
    expect(runtime.data?.gfx).toBe(sCardGraphics[1]);

    BufferCardText(runtime);
    expect(textBytesToString(runtime.data!.titleText)).toBe('Exact');
    expect(textBytesToString(runtime.data!.idNumberText)).toBe('77');

    runtime.data!.windowIds = [20, 21, 22];
    DrawCardWindow(runtime, WIN_HEADER);
    expect(runtime.textPrinters[0]).toMatchObject({ windowId: 20, text: 'Exact' });

    CreateCardSprites(runtime);
    expect(runtime.data?.monIconSpriteId).not.toBe(SPRITE_NONE);
    expect(runtime.data?.stampSpriteIds[0][0]).not.toBe(SPRITE_NONE);
    DestroyCardSprites(runtime);
    expect(runtime.freedSpriteTiles).toEqual([TAG_STAMP_SHADOW]);

    runtime.data!.enterExitState = 0;
    expect(WonderCard_Enter(runtime)).toBe(0);
    expect(runtime.data!.enterExitState).toBe(1);
    runtime.data!.enterExitState = 0;
    expect(WonderCard_Exit(runtime, false)).toBe(0);
    expect(runtime.data!.enterExitState).toBe(1);

    WonderCard_Destroy(runtime);
    expect(runtime.data).toBeNull();
    expect(WonderCard_Enter(runtime)).toBe(-1);
    expect(WonderCard_Exit(runtime, false)).toBe(-1);
  });
});
