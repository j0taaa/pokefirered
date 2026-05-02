import { describe, expect, test } from 'vitest';
import {
  CHAR_0,
  CHAR_A,
  CHAR_EXTRA_SYMBOL,
  CHAR_NEWLINE,
  CHAR_SPACE,
  ConvertInternationalString,
  EOS,
  EXT_CTRL_CODE_BEGIN,
  FEMALE,
  GetExtCtrlCodeLength,
  LANGUAGE_JAPANESE,
  PLACEHOLDER_BEGIN,
  PLACEHOLDER_ID_AQUA,
  PLACEHOLDER_ID_PLAYER,
  PLACEHOLDER_ID_RIVAL,
  StringCompare,
  StringCompareN,
  StringCompareWithoutExtCtrlCodes,
  StringConvertMode,
  StringLength,
  StringLength_Multibyte,
  StripExtCtrlCodes,
  convertIntToDecimalStringN,
  convertIntToHexStringN,
  convertInternationalString,
  decodeDecompString,
  encodeDecompString,
  formatDecompDecimal,
  formatDecompHex,
  getExpandedPlaceholder,
  getExtCtrlCodeLength,
  stringBraille,
  stringCompareWithoutExtCtrlCodes,
  stringCopyNMultibyte,
  stringExpandPlaceholders,
  stringLengthMultibyte,
  stripExtCtrlCodes,
  writeColorChangeControlCode
} from '../src/game/decompStringUtil';

describe('decomp string_util', () => {
  test('matches decimal conversion modes and overflow behavior', () => {
    const buffer: number[] = [];
    convertIntToDecimalStringN(buffer, 12, StringConvertMode.LEFT_ALIGN, 3);
    expect(decodeDecompString(buffer)).toBe('12');

    convertIntToDecimalStringN(buffer, 12, StringConvertMode.RIGHT_ALIGN, 3);
    expect(decodeDecompString(buffer)).toBe(' 12');

    convertIntToDecimalStringN(buffer, 12, StringConvertMode.LEADING_ZEROS, 3);
    expect(decodeDecompString(buffer)).toBe('012');

    convertIntToDecimalStringN(buffer, 1234, StringConvertMode.LEFT_ALIGN, 3);
    expect(decodeDecompString(buffer)).toBe('?34');
  });

  test('matches hex conversion modes', () => {
    const buffer: number[] = [];
    convertIntToHexStringN(buffer, 0x1af, StringConvertMode.LEFT_ALIGN, 3);
    expect(decodeDecompString(buffer)).toBe('1AF');

    convertIntToHexStringN(buffer, 0x2b, StringConvertMode.RIGHT_ALIGN, 4);
    expect(decodeDecompString(buffer)).toBe('  2B');

    convertIntToHexStringN(buffer, 0x2b, StringConvertMode.LEADING_ZEROS, 4);
    expect(decodeDecompString(buffer)).toBe('002B');
  });

  test('expands placeholders with the same FireRed placeholder table', () => {
    const src = [
      PLACEHOLDER_BEGIN, PLACEHOLDER_ID_PLAYER,
      CHAR_SPACE,
      PLACEHOLDER_BEGIN, PLACEHOLDER_ID_RIVAL,
      CHAR_SPACE,
      PLACEHOLDER_BEGIN, PLACEHOLDER_ID_AQUA,
      EOS
    ];
    const dest: number[] = [];

    stringExpandPlaceholders(dest, src, {
      playerName: encodeDecompString('RED'),
      playerGender: FEMALE,
      version: 'LEAFGREEN'
    });

    expect(decodeDecompString(dest)).toBe('RED RED MAGMA');
    expect(decodeDecompString(getExpandedPlaceholder(PLACEHOLDER_ID_RIVAL, { playerGender: FEMALE }))).toBe('RED');
  });

  test('passes extended control codes through placeholder expansion', () => {
    const src = [
      EXT_CTRL_CODE_BEGIN, 0x04, 0x02, 0x03, 0x04,
      PLACEHOLDER_BEGIN, PLACEHOLDER_ID_PLAYER,
      EOS
    ];
    const dest: number[] = [];

    stringExpandPlaceholders(dest, src, { playerName: encodeDecompString('BLUE') });

    expect(dest.slice(0, 5)).toEqual([EXT_CTRL_CODE_BEGIN, 0x04, 0x02, 0x03, 0x04]);
    expect(decodeDecompString(dest.slice(5))).toBe('BLUE');
  });

  test('mirrors braille conversion and multibyte helpers', () => {
    const brailleDest: number[] = [];
    stringBraille(brailleDest, [CHAR_A, CHAR_NEWLINE, CHAR_0, EOS]);
    expect(brailleDest).toEqual([0xfc, 0x06, 0x06, CHAR_A, CHAR_A + 0x40, 0xfe, 0xfc, 0x0e, 0x02, CHAR_0, CHAR_0 + 0x40, EOS]);

    const multibyteSrc = [CHAR_EXTRA_SYMBOL, 0x08, CHAR_A, EOS];
    const multibyteDest: number[] = [];
    stringCopyNMultibyte(multibyteDest, multibyteSrc, 1);
    expect(multibyteDest).toEqual([CHAR_EXTRA_SYMBOL, 0x08, EOS]);
    expect(stringLengthMultibyte(multibyteSrc)).toBe(2);
  });

  test('mirrors control-code comparison and stripping', () => {
    const left = [EXT_CTRL_CODE_BEGIN, 0x01, 0x02, CHAR_A, EOS];
    const right = [CHAR_A, EOS];
    expect(stringCompareWithoutExtCtrlCodes(left, right)).toBe(0);

    const stripBuffer = [EXT_CTRL_CODE_BEGIN, 0x01, 0x02, CHAR_A, EOS];
    stripExtCtrlCodes(stripBuffer);
    expect(stripBuffer.slice(0, 2)).toEqual([CHAR_A, EOS]);
  });

  test('matches Japanese international-string conversion', () => {
    const buffer = [EXT_CTRL_CODE_BEGIN, 0x01, 0x04, CHAR_A, EOS];
    convertInternationalString(buffer, LANGUAGE_JAPANESE);
    expect(buffer.slice(0, 6)).toEqual([0xfc, 21, CHAR_A, 0xfc, 22, EOS]);
  });

  test('matches helper wrappers and control-code metadata', () => {
    expect(formatDecompDecimal(600, StringConvertMode.RIGHT_ALIGN, 3)).toBe('600');
    expect(formatDecompHex(0x2f, StringConvertMode.LEADING_ZEROS, 4)).toBe('002F');
    expect(getExtCtrlCodeLength(0x04)).toBe(4);
    expect(getExtCtrlCodeLength(0x30)).toBe(0);

    const colorBuffer: number[] = [];
    writeColorChangeControlCode(colorBuffer, 1, 5);
    expect(colorBuffer).toEqual([EXT_CTRL_CODE_BEGIN, 3, 5, EOS]);
  });

  test('exact C-name utility exports mirror string comparison and control-code helpers', () => {
    expect(StringLength(encodeDecompString('RED'))).toBe(3);
    expect(StringCompare(encodeDecompString('RED'), encodeDecompString('RED'))).toBe(0);
    expect(StringCompare(encodeDecompString('BLUE'), encodeDecompString('RED'))).toBeLessThan(0);
    expect(StringCompareN(encodeDecompString('RED'), encodeDecompString('REX'), 2)).toBe(0);
    expect(StringLength_Multibyte([CHAR_EXTRA_SYMBOL, 0x08, CHAR_A, EOS])).toBe(2);
    expect(GetExtCtrlCodeLength(0x04)).toBe(4);

    const left = [EXT_CTRL_CODE_BEGIN, 0x01, 0x02, CHAR_A, EOS];
    const right = [CHAR_A, EOS];
    expect(StringCompareWithoutExtCtrlCodes(left, right)).toBe(0);

    const stripBuffer = [EXT_CTRL_CODE_BEGIN, 0x01, 0x02, CHAR_A, EOS];
    StripExtCtrlCodes(stripBuffer);
    expect(stripBuffer.slice(0, 2)).toEqual([CHAR_A, EOS]);

    const international = [EXT_CTRL_CODE_BEGIN, 0x01, 0x04, CHAR_A, EOS];
    ConvertInternationalString(international, LANGUAGE_JAPANESE);
    expect(international.slice(0, 6)).toEqual([0xfc, 21, CHAR_A, 0xfc, 22, EOS]);
  });
});
