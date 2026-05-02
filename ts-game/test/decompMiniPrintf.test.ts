import { describe, expect, test } from 'vitest';
import {
  CHAR_A,
  CHAR_CURRENCY,
  CHAR_EXCL_MARK,
  CHAR_LEFT_PAREN,
  CHAR_PERCENT,
  CHAR_a,
  CHAR_0,
  _putsAscii,
  _putsEncoded,
  miniItoa,
  miniPad,
  miniPcharDecode,
  miniStrlen,
  miniVpprintf,
  miniVsnprintf,
  mini_itoa,
  mini_pad,
  mini_strlen,
  mini_vpprintf,
  mini_vsnprintf,
  putsAscii,
  putsEncoded
} from '../src/game/decompMiniPrintf';

describe('decomp mini_printf', () => {
  test('mini_pchar_decode maps encoded Pokemon text bytes to ASCII log chars', () => {
    expect(miniPcharDecode(CHAR_A)).toBe('A');
    expect(miniPcharDecode(CHAR_a + 25)).toBe('z');
    expect(miniPcharDecode(CHAR_0 + 9)).toBe('9');
    expect(miniPcharDecode(CHAR_EXCL_MARK)).toBe('!');
    expect(miniPcharDecode(CHAR_CURRENCY)).toBe('$');
    expect(miniPcharDecode(CHAR_PERCENT)).toBe('%');
    expect(miniPcharDecode(CHAR_LEFT_PAREN)).toBe('(');
    expect(miniPcharDecode(0xfe)).toBe('?');
  });

  test('puts helpers honor null buffer and truncate to buffer_len - 1', () => {
    const b = { buffer: '', bufferLen: 4 };
    expect(putsAscii('hello', 5, b)).toBe(3);
    expect(b.buffer).toBe('hel');
    expect(putsAscii('!', 1, null)).toBe(1);

    const enc = { buffer: '', bufferLen: 6 };
    expect(putsEncoded([CHAR_A, CHAR_a, CHAR_0, CHAR_CURRENCY], 4, enc)).toBe(4);
    expect(enc.buffer).toBe('Aa0$');
  });

  test('itoa, strlen, and pad preserve the stripped C implementation behavior', () => {
    expect(miniStrlen('abc\0def')).toBe(3);
    expect(miniItoa(-42, 10, false, false)).toBe('-42');
    expect(miniItoa(-1, 10, false, true)).toBe('4294967295');
    expect(miniItoa(0xbeef, 16, false, true)).toBe('beef');
    expect(miniItoa(0xbeef, 16, true, true)).toBe('BEEF');
    expect(miniItoa(1, 17, false, false)).toBe('');
    expect(miniPad('abc', 3, '0', 5)).toBe('00abc');
    expect(miniPad('abcdef', 6, ' ', 4)).toBe('a***');
  });

  test('mini_vpprintf formats supported conversions and unknown conversion as literal char', () => {
    const b = { buffer: '', bufferLen: 100 };
    const ret = miniVpprintf(b, 'd=%04d u=%u x=%x X=%X c=%c s=%5s S=%S q=%q', [
      -7,
      -1,
      0xbeef,
      0xbeef,
      'Z'.charCodeAt(0),
      'hi',
      [CHAR_A, CHAR_a, CHAR_0, 0xff]
    ]);

    expect(b.buffer).toBe('d=00-7 u=4294967295 x=beef X=BEEF c=Z s=   hi S=Aa0 q=q');
    expect(ret).toBeGreaterThan(0);
  });

  test('mini_vsnprintf returns full formatter count for null buffer and stored count otherwise', () => {
    expect(miniVsnprintf(0, 'abc %d', [12])).toEqual({ written: '', returnValue: 6 });
    expect(miniVsnprintf(5, 'abcdef', [])).toEqual({ written: 'abcd', returnValue: 18 });
  });

  test('exact C-name exports mirror the formatter helpers', () => {
    const ascii = { buffer: '', bufferLen: 4 };
    expect(_putsAscii('hello', 5, ascii)).toBe(3);
    expect(ascii.buffer).toBe('hel');

    const encoded = { buffer: '', bufferLen: 4 };
    expect(_putsEncoded([CHAR_A, CHAR_a, CHAR_0], 3, encoded)).toBe(3);
    expect(encoded.buffer).toBe('Aa0');

    expect(mini_strlen('abc\0def')).toBe(3);
    expect(mini_itoa(0xbeef, 16, true, true)).toBe('BEEF');
    expect(mini_pad('abcdef', 6, ' ', 4)).toBe('a***');

    const b = { buffer: '', bufferLen: 100 };
    expect(mini_vpprintf(b, '%04d %S', [-7, [CHAR_A, CHAR_a, 0xff]])).toBe(16);
    expect(b.buffer).toBe('00-7 Aa');
    expect(mini_vsnprintf(5, 'abcdef', [])).toEqual({ written: 'abcd', returnValue: 18 });
  });
});
