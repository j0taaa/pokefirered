export const POKEMON_NAME_LENGTH = 10;
export const PLAYER_NAME_LENGTH = 7;

export const CHAR_SPACE = 0x00;
export const CHAR_QUESTION_MARK = 0xac;
export const CHAR_COLON = 0xf0;
export const CHAR_0 = 0xa1;
export const CHAR_A = 0xbb;
export const CHAR_a = 0xd5;
export const CHAR_EXTRA_SYMBOL = 0xf9;
export const CHAR_PROMPT_SCROLL = 0xfa;
export const CHAR_PROMPT_CLEAR = 0xfb;
export const EXT_CTRL_CODE_BEGIN = 0xfc;
export const PLACEHOLDER_BEGIN = 0xfd;
export const CHAR_NEWLINE = 0xfe;
export const EOS = 0xff;

export const LANGUAGE_JAPANESE = 1;
export const MALE = 0;
export const FEMALE = 1;

export const PLACEHOLDER_ID_UNKNOWN = 0x0;
export const PLACEHOLDER_ID_PLAYER = 0x1;
export const PLACEHOLDER_ID_STRING_VAR_1 = 0x2;
export const PLACEHOLDER_ID_STRING_VAR_2 = 0x3;
export const PLACEHOLDER_ID_STRING_VAR_3 = 0x4;
export const PLACEHOLDER_ID_KUN = 0x5;
export const PLACEHOLDER_ID_RIVAL = 0x6;
export const PLACEHOLDER_ID_VERSION = 0x7;
export const PLACEHOLDER_ID_MAGMA = 0x8;
export const PLACEHOLDER_ID_AQUA = 0x9;
export const PLACEHOLDER_ID_MAXIE = 0xa;
export const PLACEHOLDER_ID_ARCHIE = 0xb;
export const PLACEHOLDER_ID_GROUDON = 0xc;
export const PLACEHOLDER_ID_KYOGRE = 0xd;

const DIGIT_BYTES = [
  0xa1, 0xa2, 0xa3, 0xa4, 0xa5, 0xa6, 0xa7, 0xa8, 0xa9, 0xaa,
  0xbb, 0xbc, 0xbd, 0xbe, 0xbf, 0xc0
] as const;

const POWERS_OF_TEN = [
  1,
  10,
  100,
  1000,
  10000,
  100000,
  1000000,
  10000000,
  100000000,
  1000000000
] as const;

const ASCII_TO_DECOMP = new Map<string, number>([
  [' ', CHAR_SPACE],
  ['0', 0xa1],
  ['1', 0xa2],
  ['2', 0xa3],
  ['3', 0xa4],
  ['4', 0xa5],
  ['5', 0xa6],
  ['6', 0xa7],
  ['7', 0xa8],
  ['8', 0xa9],
  ['9', 0xaa],
  ['!', 0xab],
  ['?', 0xac],
  ['.', 0xad],
  ['-', 0xae],
  ['…', 0xb0],
  ['“', 0xb1],
  ['”', 0xb2],
  ['‘', 0xb3],
  ["'", 0xb4],
  ['♂', 0xb5],
  ['♀', 0xb6],
  [',', 0xb8],
  ['/', 0xba],
  [':', CHAR_COLON],
  ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((char, index) => [char, CHAR_A + index] as const),
  ...'abcdefghijklmnopqrstuvwxyz'.split('').map((char, index) => [char, CHAR_a + index] as const)
]);

const DECOMP_TO_ASCII = new Map<number, string>(
  [...ASCII_TO_DECOMP.entries()].map(([char, code]) => [code, char] as const)
);

const STATE_WAITING_FOR_NONZERO_DIGIT = 0;
const STATE_WRITING_DIGITS = 1;
const STATE_WRITING_SPACES = 2;

export enum StringConvertMode {
  LEFT_ALIGN = 0,
  RIGHT_ALIGN = 1,
  LEADING_ZEROS = 2
}

export interface DecompStringContext {
  unknownStringVar?: readonly number[];
  playerName?: readonly number[];
  stringVar1?: readonly number[];
  stringVar2?: readonly number[];
  stringVar3?: readonly number[];
  playerGender?: number;
  rivalName?: readonly number[];
  version?: 'FIRERED' | 'LEAFGREEN';
}

const terminated = (input: readonly number[]): number[] => {
  const copy = [...input];
  if (copy[copy.length - 1] !== EOS) {
    copy.push(EOS);
  }
  return copy;
};

const getByte = (buffer: readonly number[], index: number): number =>
  index < buffer.length ? (buffer[index] ?? EOS) : EOS;

const writeByte = (buffer: number[], index: number, value: number): void => {
  buffer[index] = value & 0xff;
};

const setTerminator = (buffer: number[], index: number): number => {
  writeByte(buffer, index, EOS);
  return index;
};

export const encodeDecompString = (text: string): number[] => {
  const bytes: number[] = [];
  for (const char of text) {
    const code = ASCII_TO_DECOMP.get(char);
    if (code === undefined) {
      throw new Error(`Unsupported decomp character: ${char}`);
    }
    bytes.push(code);
  }
  bytes.push(EOS);
  return bytes;
};

export const decodeDecompString = (bytes: readonly number[]): string => {
  let out = '';
  for (const byte of bytes) {
    if (byte === EOS) {
      break;
    }
    if (byte === CHAR_NEWLINE) {
      out += '\n';
      continue;
    }
    if (byte === EXT_CTRL_CODE_BEGIN || byte === PLACEHOLDER_BEGIN || byte === CHAR_PROMPT_SCROLL || byte === CHAR_PROMPT_CLEAR) {
      out += `\\x${byte.toString(16).padStart(2, '0')}`;
      continue;
    }
    out += DECOMP_TO_ASCII.get(byte) ?? `\\x${byte.toString(16).padStart(2, '0')}`;
  }
  return out;
};

export const stringCopyNickname = (dest: number[], src: readonly number[]): number => {
  const limit = POKEMON_NAME_LENGTH;
  for (let i = 0; i < limit; i++) {
    const value = getByte(src, i);
    writeByte(dest, i, value);
    if (value === EOS) {
      return i;
    }
  }
  writeByte(dest, limit, EOS);
  return limit;
};

export const stringGetNickname = (str: number[]): number => {
  const limit = POKEMON_NAME_LENGTH;
  for (let i = 0; i < limit; i++) {
    if (getByte(str, i) === EOS) {
      return i;
    }
  }
  writeByte(str, limit, EOS);
  return limit;
};

export const stringCopyPlayerName = (dest: number[], src: readonly number[]): number => {
  const limit = PLAYER_NAME_LENGTH;
  for (let i = 0; i < limit; i++) {
    const value = getByte(src, i);
    writeByte(dest, i, value);
    if (value === EOS) {
      return i;
    }
  }
  writeByte(dest, limit, EOS);
  return limit;
};

export const stringCopy = (dest: number[], src: readonly number[]): number => {
  let destIndex = 0;
  let srcIndex = 0;
  while (getByte(src, srcIndex) !== EOS) {
    writeByte(dest, destIndex++, getByte(src, srcIndex++));
  }
  return setTerminator(dest, destIndex);
};

export const stringAppend = (dest: number[], src: readonly number[]): number => {
  let destIndex = 0;
  while (getByte(dest, destIndex) !== EOS) {
    destIndex++;
  }
  let srcIndex = 0;
  while (getByte(src, srcIndex) !== EOS) {
    writeByte(dest, destIndex++, getByte(src, srcIndex++));
  }
  return setTerminator(dest, destIndex);
};

export const stringCopyN = (dest: number[], src: readonly number[], n: number): number => {
  for (let i = 0; i < n; i++) {
    writeByte(dest, i, src[i] ?? 0);
  }
  return n;
};

export const stringAppendN = (dest: number[], src: readonly number[], n: number): number => {
  let destIndex = 0;
  while (getByte(dest, destIndex) !== EOS) {
    destIndex++;
  }
  for (let i = 0; i < n; i++) {
    writeByte(dest, destIndex + i, src[i] ?? 0);
  }
  return destIndex + n;
};

export const stringLength = (str: readonly number[]): number => {
  let length = 0;
  while (getByte(str, length) !== EOS) {
    length++;
  }
  return length;
};

export function StringLength(str: readonly number[]): number { return stringLength(str); }

export const stringCompare = (str1: readonly number[], str2: readonly number[]): number => {
  let index = 0;
  while (getByte(str1, index) === getByte(str2, index)) {
    if (getByte(str1, index) === EOS) {
      return 0;
    }
    index++;
  }
  return getByte(str1, index) - getByte(str2, index);
};

export function StringCompare(str1: readonly number[], str2: readonly number[]): number { return stringCompare(str1, str2); }

export const stringCompareN = (str1: readonly number[], str2: readonly number[], n: number): number => {
  let index = 0;
  while (getByte(str1, index) === getByte(str2, index)) {
    if (getByte(str1, index) === EOS) {
      return 0;
    }
    index++;
    n--;
    if (n === 0) {
      return 0;
    }
  }
  return getByte(str1, index) - getByte(str2, index);
};

export function StringCompareN(str1: readonly number[], str2: readonly number[], n: number): number { return stringCompareN(str1, str2, n); }

export const convertIntToDecimalStringN = (
  dest: number[],
  value: number,
  mode: StringConvertMode,
  n: number
): number => {
  let state = STATE_WAITING_FOR_NONZERO_DIGIT;
  const largestPowerOfTen: number = POWERS_OF_TEN[n - 1] ?? 1;

  if (mode === StringConvertMode.RIGHT_ALIGN) {
    state = STATE_WRITING_SPACES;
  }

  if (mode === StringConvertMode.LEADING_ZEROS) {
    state = STATE_WRITING_DIGITS;
  }

  let destIndex = 0;
  for (let powerOfTen = largestPowerOfTen; powerOfTen > 0; powerOfTen = Math.trunc(powerOfTen / 10)) {
    const digit = Math.trunc(value / powerOfTen);
    const temp = value - (powerOfTen * digit);

    if (state === STATE_WRITING_DIGITS) {
      writeByte(dest, destIndex++, digit <= 9 ? DIGIT_BYTES[digit] : CHAR_QUESTION_MARK);
    } else if (digit !== 0 || powerOfTen === 1) {
      state = STATE_WRITING_DIGITS;
      writeByte(dest, destIndex++, digit <= 9 ? DIGIT_BYTES[digit] : CHAR_QUESTION_MARK);
    } else if (state === STATE_WRITING_SPACES) {
      writeByte(dest, destIndex++, CHAR_SPACE);
    }

    value = temp;
  }

  return setTerminator(dest, destIndex);
};

export const convertIntToHexStringN = (
  dest: number[],
  value: number,
  mode: StringConvertMode,
  n: number
): number => {
  let state = STATE_WAITING_FOR_NONZERO_DIGIT;
  let largestPowerOfSixteen: number = 1;

  for (let i = 1; i < n; i++) {
    largestPowerOfSixteen *= 16;
  }

  if (mode === StringConvertMode.RIGHT_ALIGN) {
    state = STATE_WRITING_SPACES;
  }

  if (mode === StringConvertMode.LEADING_ZEROS) {
    state = STATE_WRITING_DIGITS;
  }

  let destIndex = 0;
  for (let powerOfSixteen = largestPowerOfSixteen; powerOfSixteen > 0; powerOfSixteen = Math.trunc(powerOfSixteen / 16)) {
    const digit = Math.trunc(value / powerOfSixteen);
    const temp = value % powerOfSixteen;

    if (state === STATE_WRITING_DIGITS) {
      writeByte(dest, destIndex++, digit <= 0xf ? DIGIT_BYTES[digit] : CHAR_QUESTION_MARK);
    } else if (digit !== 0 || powerOfSixteen === 1) {
      state = STATE_WRITING_DIGITS;
      writeByte(dest, destIndex++, digit <= 0xf ? DIGIT_BYTES[digit] : CHAR_QUESTION_MARK);
    } else if (state === STATE_WRITING_SPACES) {
      writeByte(dest, destIndex++, CHAR_SPACE);
    }

    value = temp;
  }

  return setTerminator(dest, destIndex);
};

const EMPTY_PLACEHOLDER = encodeDecompString('');
const KUN_PLACEHOLDER = encodeDecompString('');
const CHAN_PLACEHOLDER = encodeDecompString('');
const SAPPHIRE_PLACEHOLDER = encodeDecompString('SAPPHIRE');
const RUBY_PLACEHOLDER = encodeDecompString('RUBY');
const AQUA_PLACEHOLDER = encodeDecompString('AQUA');
const MAGMA_PLACEHOLDER = encodeDecompString('MAGMA');
const ARCHIE_PLACEHOLDER = encodeDecompString('ARCHIE');
const MAXIE_PLACEHOLDER = encodeDecompString('MAXIE');
const KYOGRE_PLACEHOLDER = encodeDecompString('KYOGRE');
const GROUDON_PLACEHOLDER = encodeDecompString('GROUDON');
const RED_PLACEHOLDER = encodeDecompString('RED');
const GREEN_PLACEHOLDER = encodeDecompString('GREEN');

export const getExpandedPlaceholder = (id: number, context: DecompStringContext = {}): number[] => {
  const playerName = terminated(context.playerName ?? EMPTY_PLACEHOLDER);
  const unknownStringVar = terminated(context.unknownStringVar ?? EMPTY_PLACEHOLDER);
  const stringVar1 = terminated(context.stringVar1 ?? EMPTY_PLACEHOLDER);
  const stringVar2 = terminated(context.stringVar2 ?? EMPTY_PLACEHOLDER);
  const stringVar3 = terminated(context.stringVar3 ?? EMPTY_PLACEHOLDER);
  const rivalName = terminated(context.rivalName ?? EMPTY_PLACEHOLDER);
  const playerGender = context.playerGender ?? MALE;
  const version = context.version ?? 'FIRERED';

  switch (id) {
    case PLACEHOLDER_ID_UNKNOWN:
      return [...unknownStringVar];
    case PLACEHOLDER_ID_PLAYER:
      return [...playerName];
    case PLACEHOLDER_ID_STRING_VAR_1:
      return [...stringVar1];
    case PLACEHOLDER_ID_STRING_VAR_2:
      return [...stringVar2];
    case PLACEHOLDER_ID_STRING_VAR_3:
      return [...stringVar3];
    case PLACEHOLDER_ID_KUN:
      return playerGender === MALE ? [...KUN_PLACEHOLDER] : [...CHAN_PLACEHOLDER];
    case PLACEHOLDER_ID_RIVAL:
      if (getByte(rivalName, 0) === EOS) {
        return playerGender === MALE ? [...GREEN_PLACEHOLDER] : [...RED_PLACEHOLDER];
      }
      return [...rivalName];
    case PLACEHOLDER_ID_VERSION:
      return version === 'FIRERED' ? [...RUBY_PLACEHOLDER] : [...SAPPHIRE_PLACEHOLDER];
    case PLACEHOLDER_ID_MAGMA:
      return version === 'FIRERED' ? [...MAGMA_PLACEHOLDER] : [...AQUA_PLACEHOLDER];
    case PLACEHOLDER_ID_AQUA:
      return version === 'FIRERED' ? [...AQUA_PLACEHOLDER] : [...MAGMA_PLACEHOLDER];
    case PLACEHOLDER_ID_MAXIE:
      return version === 'FIRERED' ? [...MAXIE_PLACEHOLDER] : [...ARCHIE_PLACEHOLDER];
    case PLACEHOLDER_ID_ARCHIE:
      return version === 'FIRERED' ? [...ARCHIE_PLACEHOLDER] : [...MAXIE_PLACEHOLDER];
    case PLACEHOLDER_ID_GROUDON:
      return version === 'FIRERED' ? [...GROUDON_PLACEHOLDER] : [...KYOGRE_PLACEHOLDER];
    case PLACEHOLDER_ID_KYOGRE:
      return version === 'FIRERED' ? [...KYOGRE_PLACEHOLDER] : [...GROUDON_PLACEHOLDER];
    default:
      return [...EMPTY_PLACEHOLDER];
  }
};

export const stringExpandPlaceholders = (
  dest: number[],
  src: readonly number[],
  context: DecompStringContext = {}
): number => {
  let destIndex = 0;
  let srcIndex = 0;

  for (;;) {
    let c = getByte(src, srcIndex++);

    switch (c) {
      case PLACEHOLDER_BEGIN: {
        const placeholderId = getByte(src, srcIndex++);
        const expandedString = getExpandedPlaceholder(placeholderId, context);
        const buffer: number[] = [];
        stringExpandPlaceholders(buffer, expandedString, context);
        for (let i = 0; getByte(buffer, i) !== EOS; i++) {
          writeByte(dest, destIndex++, getByte(buffer, i));
        }
        break;
      }
      case EXT_CTRL_CODE_BEGIN:
        writeByte(dest, destIndex++, c);
        c = getByte(src, srcIndex++);
        writeByte(dest, destIndex++, c);

        switch (c) {
          case 0x07:
          case 0x09:
          case 0x0f:
          case 0x15:
          case 0x16:
          case 0x17:
          case 0x18:
            break;
          case 0x04:
            writeByte(dest, destIndex++, getByte(src, srcIndex++));
          case 0x0b:
            writeByte(dest, destIndex++, getByte(src, srcIndex++));
          default:
            writeByte(dest, destIndex++, getByte(src, srcIndex++));
        }
        break;
      case EOS:
        return setTerminator(dest, destIndex);
      default:
        writeByte(dest, destIndex++, c);
    }
  }
};

export const stringBraille = (dest: number[], src: readonly number[]): number => {
  const setBrailleFont = [0xfc, 0x06, 0x06, 0xff];
  const gotoLine2 = [0xfe, 0xfc, 0x0e, 0x02, 0xff];
  let destIndex = stringCopy(dest, setBrailleFont);
  let srcIndex = 0;

  for (;;) {
    const c = getByte(src, srcIndex++);
    switch (c) {
      case EOS:
        writeByte(dest, destIndex, c);
        return destIndex;
      case CHAR_NEWLINE:
        destIndex = stringAppend(dest, gotoLine2);
        break;
      default:
        writeByte(dest, destIndex++, c);
        writeByte(dest, destIndex++, c + 0x40);
        writeByte(dest, destIndex, EOS);
        break;
    }
  }
};

export const stringFill = (dest: number[], c: number, n: number): number => {
  for (let i = 0; i < n; i++) {
    writeByte(dest, i, c);
  }
  return setTerminator(dest, n);
};

export const stringCopyPadded = (dest: number[], src: readonly number[], c: number, n: number): number => {
  let destIndex = 0;
  let srcIndex = 0;
  let remaining = n & 0xffff;

  while (getByte(src, srcIndex) !== EOS) {
    writeByte(dest, destIndex++, getByte(src, srcIndex++));
    if (remaining !== 0) {
      remaining = (remaining - 1) & 0xffff;
    }
  }

  remaining = (remaining - 1) & 0xffff;
  while (remaining !== 0xffff) {
    writeByte(dest, destIndex++, c);
    remaining = (remaining - 1) & 0xffff;
  }

  return setTerminator(dest, destIndex);
};

export const stringFillWithTerminator = (dest: number[], n: number): number =>
  stringFill(dest, EOS, n);

export const stringCopyNMultibyte = (dest: number[], src: readonly number[], n: number): number => {
  let srcIndex = 0;
  let destIndex = 0;
  for (let i = ((n >>> 0) - 1) >>> 0; i !== 0xffffffff; i = ((i - 1) >>> 0)) {
    if (getByte(src, srcIndex) === EOS) {
      break;
    }

    writeByte(dest, destIndex++, getByte(src, srcIndex++));
    if (getByte(src, srcIndex - 1) === CHAR_EXTRA_SYMBOL) {
      writeByte(dest, destIndex++, getByte(src, srcIndex++));
    }
  }

  return setTerminator(dest, destIndex);
};

export const stringLengthMultibyte = (str: readonly number[]): number => {
  let index = 0;
  let length = 0;

  while (getByte(str, index) !== EOS) {
    if (getByte(str, index) === CHAR_EXTRA_SYMBOL) {
      index++;
    }
    index++;
    length++;
  }

  return length;
};

export function StringLength_Multibyte(str: readonly number[]): number { return stringLengthMultibyte(str); }

export const writeColorChangeControlCode = (dest: number[], colorType: number, color: number): number => {
  let destIndex = 0;
  writeByte(dest, destIndex++, EXT_CTRL_CODE_BEGIN);

  switch (colorType) {
    case 0:
      writeByte(dest, destIndex++, 1);
      break;
    case 1:
      writeByte(dest, destIndex++, 3);
      break;
    case 2:
      writeByte(dest, destIndex++, 2);
      break;
    default:
      break;
  }

  writeByte(dest, destIndex++, color);
  return setTerminator(dest, destIndex);
};

export const getExtCtrlCodeLength = (code: number): number => {
  const lengths = [
    1,
    2,
    2,
    2,
    4,
    2,
    2,
    1,
    2,
    1,
    1,
    3,
    2,
    2,
    2,
    1,
    3,
    2,
    2,
    2,
    2,
    1,
    1,
    1,
    1
  ] as const;

  return code < lengths.length ? lengths[code] : 0;
};

export function GetExtCtrlCodeLength(code: number): number { return getExtCtrlCodeLength(code); }

const skipExtCtrlCode = (input: readonly number[], startIndex: number): number => {
  let index = startIndex;
  while (getByte(input, index) === EXT_CTRL_CODE_BEGIN) {
    index++;
    index += getExtCtrlCodeLength(getByte(input, index));
  }
  return index;
};

export const stringCompareWithoutExtCtrlCodes = (str1: readonly number[], str2: readonly number[]): number => {
  let retVal = 0;
  let index1 = 0;
  let index2 = 0;

  for (;;) {
    index1 = skipExtCtrlCode(str1, index1);
    index2 = skipExtCtrlCode(str2, index2);

    const byte1 = getByte(str1, index1);
    const byte2 = getByte(str2, index2);

    if (byte1 > byte2) {
      break;
    }

    if (byte1 < byte2) {
      retVal = -1;
      if (byte2 === EOS) {
        retVal = 1;
      }
    }

    if (byte1 === EOS) {
      return retVal;
    }

    index1++;
    index2++;
  }

  retVal = 1;
  if (getByte(str1, index1) === EOS) {
    retVal = -1;
  }

  return retVal;
};

export function StringCompareWithoutExtCtrlCodes(str1: readonly number[], str2: readonly number[]): number { return stringCompareWithoutExtCtrlCodes(str1, str2); }

export const stripExtCtrlCodes = (str: number[]): void => {
  let srcIndex = 0;
  let destIndex = 0;

  while (getByte(str, srcIndex) !== EOS) {
    if (getByte(str, srcIndex) === EXT_CTRL_CODE_BEGIN) {
      srcIndex++;
      srcIndex += getExtCtrlCodeLength(getByte(str, srcIndex));
    } else {
      writeByte(str, destIndex++, getByte(str, srcIndex++));
    }
  }

  writeByte(str, destIndex, EOS);
};

export function StripExtCtrlCodes(str: number[]): void { stripExtCtrlCodes(str); }

export const convertInternationalString = (s: number[], language: number): void => {
  if (language === LANGUAGE_JAPANESE) {
    stripExtCtrlCodes(s);
    let i = stringLength(s);
    writeByte(s, i++, 0xfc);
    writeByte(s, i++, 22);
    writeByte(s, i++, 0xff);

    i--;
    while (i !== 0xff) {
      writeByte(s, i + 2, getByte(s, i));
      i = (i - 1) & 0xff;
    }

    writeByte(s, 0, 0xfc);
    writeByte(s, 1, 21);
  }
};

export function ConvertInternationalString(s: number[], language: number): void { convertInternationalString(s, language); }

export const formatDecompDecimal = (value: number, mode: StringConvertMode, n: number): string => {
  const buffer: number[] = [];
  convertIntToDecimalStringN(buffer, Math.trunc(value), mode, n);
  return decodeDecompString(buffer);
};

export const formatDecompHex = (value: number, mode: StringConvertMode, n: number): string => {
  const buffer: number[] = [];
  convertIntToHexStringN(buffer, Math.trunc(value), mode, n);
  return decodeDecompString(buffer);
};
