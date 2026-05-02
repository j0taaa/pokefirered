import { describe, expect, it } from 'vitest';
import {
  AddTextPrinterParameterized3,
  AddTextPrinterParameterized4,
  AddTextPrinterParameterized5,
  FONTATTR_COLOR_BACKGROUND,
  FONTATTR_COLOR_FOREGROUND,
  FONTATTR_COLOR_SHADOW,
  FONTATTR_LETTER_SPACING,
  FONTATTR_LINE_SPACING,
  FONT_NORMAL,
  GetUnownLetterByPersonalityLoByte,
  IsBlendTaskActive,
  Menu2_GetMonPosAttribute,
  Menu2_GetStarSpritePosAttribute,
  Menu_PrintFormatIntlPlayerName,
  PSA_MON_ATTR_COUNT,
  PSA_MON_ATTR_ITEM_Y_POS,
  PSA_MON_ATTR_TMHM_X_POS,
  PSA_MON_ATTR_TMHM_Y_POS,
  REG_OFFSET_BLDALPHA,
  SPECIES_CONSTANTS,
  SPECIES_NONE,
  SPECIES_OLD_UNOWN_B,
  SPECIES_OLD_UNOWN_EMARK,
  SPECIES_OLD_UNOWN_QMARK,
  SPECIES_UNOWN,
  StartBlendTask,
  Task_SmoothBlendLayers,
  UnusedBlitBitmapRect,
  createMenu2Runtime,
  sMonPosAttributes,
} from '../src/game/decompMenu2';

const personalityForUnownLetter = (letter: number): number => {
  return (letter & 3) | (((letter >> 2) & 3) << 8) | (((letter >> 4) & 3) << 16) | (((letter >> 6) & 3) << 24);
};

describe('decompMenu2', () => {
  it('parses the full C species position table and preserves representative rows', () => {
    expect(PSA_MON_ATTR_COUNT).toBe(5);
    expect(SPECIES_CONSTANTS.SPECIES_BULBASAUR).toBe(1);
    expect(SPECIES_CONSTANTS.SPECIES_DEOXYS).toBe(410);
    expect(SPECIES_CONSTANTS.NUM_SPECIES).toBe(412);
    expect(SPECIES_OLD_UNOWN_EMARK).toBe(412);
    expect(SPECIES_OLD_UNOWN_QMARK).toBe(413);

    expect(sMonPosAttributes[SPECIES_CONSTANTS.SPECIES_BULBASAUR - 1]).toEqual([22, 27, 48, 22, 41]);
    expect(sMonPosAttributes[SPECIES_CONSTANTS.SPECIES_CHARIZARD - 1]).toEqual([27, 7, 40, 26, 25]);
    expect(sMonPosAttributes[SPECIES_CONSTANTS.SPECIES_DEOXYS - 1]).toEqual([27, 8, 40, 28, 22]);
    expect(sMonPosAttributes[SPECIES_OLD_UNOWN_B - 1]).toEqual([31, 18, 8, 30, 28]);
    expect(sMonPosAttributes[SPECIES_OLD_UNOWN_EMARK - 1]).toEqual([32, 33, 8, 32, 43]);
    expect(sMonPosAttributes[SPECIES_OLD_UNOWN_QMARK - 1]).toEqual([32, 35, 8, 32, 45]);
  });

  it('gets mon and star sprite position attributes including Unown remapping and fallbacks', () => {
    expect(Menu2_GetMonPosAttribute(SPECIES_CONSTANTS.SPECIES_BULBASAUR, 0, PSA_MON_ATTR_TMHM_X_POS)).toBe(22);
    expect(Menu2_GetMonPosAttribute(SPECIES_CONSTANTS.SPECIES_BULBASAUR, 0, PSA_MON_ATTR_ITEM_Y_POS)).toBe(41);
    expect(Menu2_GetStarSpritePosAttribute(SPECIES_CONSTANTS.SPECIES_BULBASAUR, 0, PSA_MON_ATTR_TMHM_Y_POS)).toBe(-5);

    expect(GetUnownLetterByPersonalityLoByte(0)).toBe(0);
    expect(Menu2_GetMonPosAttribute(SPECIES_UNOWN, personalityForUnownLetter(0), PSA_MON_ATTR_TMHM_X_POS)).toBe(32);
    expect(Menu2_GetMonPosAttribute(SPECIES_UNOWN, personalityForUnownLetter(1), PSA_MON_ATTR_TMHM_X_POS)).toBe(31);
    expect(Menu2_GetMonPosAttribute(SPECIES_UNOWN, personalityForUnownLetter(26), PSA_MON_ATTR_ITEM_Y_POS)).toBe(43);
    expect(Menu2_GetMonPosAttribute(SPECIES_UNOWN, personalityForUnownLetter(27), PSA_MON_ATTR_ITEM_Y_POS)).toBe(45);

    expect(Menu2_GetMonPosAttribute(SPECIES_NONE, 0, PSA_MON_ATTR_TMHM_X_POS)).toBe(32);
    expect(Menu2_GetMonPosAttribute(SPECIES_CONSTANTS.SPECIES_BULBASAUR, 0, PSA_MON_ATTR_COUNT)).toBe(32);
  });

  it('constructs text printer templates exactly for parameterized variants', () => {
    const runtime = createMenu2Runtime();
    runtime.fontAttributes.set(`${FONT_NORMAL}:${FONTATTR_LETTER_SPACING}`, 7);
    runtime.fontAttributes.set(`${FONT_NORMAL}:${FONTATTR_LINE_SPACING}`, 8);
    runtime.fontAttributes.set(`${FONT_NORMAL}:${FONTATTR_COLOR_FOREGROUND}`, 9);
    runtime.fontAttributes.set(`${FONT_NORMAL}:${FONTATTR_COLOR_BACKGROUND}`, 10);
    runtime.fontAttributes.set(`${FONT_NORMAL}:${FONTATTR_COLOR_SHADOW}`, 11);

    AddTextPrinterParameterized3(runtime, 1, FONT_NORMAL, 2, 3, [4, 5, 6], -1, 'hello');
    expect(runtime.printers.at(-1)).toMatchObject({
      template: {
        currentChar: 'hello',
        windowId: 1,
        fontId: FONT_NORMAL,
        x: 2,
        y: 3,
        currentX: 2,
        currentY: 3,
        letterSpacing: 7,
        lineSpacing: 8,
        unk: 0,
        fgColor: 5,
        bgColor: 4,
        shadowColor: 6,
      },
      speed: -1,
      callback: null,
    });

    AddTextPrinterParameterized4(runtime, 2, FONT_NORMAL, 3, 4, 12, 13, [1, 2, 3], 9, 'world');
    expect(runtime.printers.at(-1)?.template).toMatchObject({ currentChar: 'world', windowId: 2, letterSpacing: 12, lineSpacing: 13, fgColor: 2, bgColor: 1, shadowColor: 3 });

    const callback = () => undefined;
    AddTextPrinterParameterized5(runtime, 3, FONT_NORMAL, 'fifth', 4, 5, 6, callback, 14, 15);
    expect(runtime.printers.at(-1)).toMatchObject({
      template: { currentChar: 'fifth', windowId: 3, currentX: 4, currentY: 5, letterSpacing: 14, lineSpacing: 15, fgColor: 9, bgColor: 10, shadowColor: 11 },
      speed: 6,
      callback,
    });
  });

  it('uses the international player-name width branch at length exactly five', () => {
    const runtime = createMenu2Runtime();

    runtime.gSaveBlock2Ptr.playerName = 'RED';
    Menu_PrintFormatIntlPlayerName(runtime, 1, 'Hi {PLAYER}', 2, 3);
    expect(runtime.gStringVar4).toBe('Hi {PLAYER}');
    expect(runtime.operations.slice(-2)).toEqual([
      'StringExpandPlaceholders:Hi {PLAYER}',
      'AddTextPrinterParameterized:1:1:Hi {PLAYER}:2:3:255:NULL',
    ]);

    runtime.gSaveBlock2Ptr.playerName = 'GREEN';
    Menu_PrintFormatIntlPlayerName(runtime, 4, 'Yo {PLAYER}', 5, 6);
    expect(runtime.operations).toContain('StringExpandPlaceholders:Yo {PLAYER}');
    expect(runtime.printers.at(-1)?.template).toMatchObject({ windowId: 4, currentChar: 'Yo {PLAYER}', x: 5, y: 6, letterSpacing: 0, lineSpacing: 0 });
  });

  it('runs StartBlendTask and Task_SmoothBlendLayers with the same alternating A/B update cadence', () => {
    const runtime = createMenu2Runtime();
    const taskId = StartBlendTask(runtime, 2, 14, 10, 6, 4, 80);
    const task = runtime.tasks[taskId];

    expect(task.priority).toBe(80);
    expect(task.data.slice(0, 9)).toEqual([2 << 8, 14 << 8, 10, 6, 512, -512, 0, 0, 4]);
    expect(runtime.gpuRegs.get(REG_OFFSET_BLDALPHA)).toBe((14 << 8) | 2);
    expect(IsBlendTaskActive(runtime)).toBe(true);

    Task_SmoothBlendLayers(runtime, taskId);
    expect(task.data[0]).toBe(4 << 8);
    expect(task.data[1]).toBe(14 << 8);
    expect(task.data[6]).toBe(1);
    expect(task.data[8]).toBe(4);
    expect(runtime.gpuRegs.get(REG_OFFSET_BLDALPHA)).toBe((14 << 8) | 4);

    Task_SmoothBlendLayers(runtime, taskId);
    expect(task.data[0]).toBe(4 << 8);
    expect(task.data[1]).toBe(12 << 8);
    expect(task.data[6]).toBe(0);
    expect(task.data[8]).toBe(3);
    expect(runtime.gpuRegs.get(REG_OFFSET_BLDALPHA)).toBe((12 << 8) | 4);

    Task_SmoothBlendLayers(runtime, taskId);
    Task_SmoothBlendLayers(runtime, taskId);
    Task_SmoothBlendLayers(runtime, taskId);
    Task_SmoothBlendLayers(runtime, taskId);
    Task_SmoothBlendLayers(runtime, taskId);
    Task_SmoothBlendLayers(runtime, taskId);
    expect(task.data[0]).toBe(10 << 8);
    expect(task.data[1]).toBe(6 << 8);
    expect(task.data[8]).toBe(0);
    expect(task.destroyed).toBe(true);
    expect(IsBlendTaskActive(runtime)).toBe(false);
    expect(runtime.gpuRegs.get(REG_OFFSET_BLDALPHA)).toBe((6 << 8) | 10);
  });

  it('copies 4bpp bitmap nibbles for the unused blitter with clipping', () => {
    const src = { width: 8, height: 8, pixels: Array(32).fill(0) };
    const dst = { width: 8, height: 8, pixels: Array(32).fill(0xff) };
    src.pixels[0] = 0xba;
    src.pixels[1] = 0xdc;
    src.pixels[4] = 0x31;

    UnusedBlitBitmapRect(src, dst, 0, 0, 0, 0, 4, 2);

    expect(dst.pixels[0]).toBe(0xba);
    expect(dst.pixels[1]).toBe(0xdc);
    expect(dst.pixels[4]).toBe(0x31);
    expect(dst.pixels[5]).toBe(0x00);
  });
});
