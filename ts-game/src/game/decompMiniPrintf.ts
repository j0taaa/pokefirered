export const CHAR_SPACE = 0x00;
export const CHAR_A = 0xbb;
export const CHAR_Z = 0xd4;
export const CHAR_a = 0xd5;
export const CHAR_z = 0xee;
export const CHAR_0 = 0xa1;
export const CHAR_9 = 0xaa;
export const CHAR_EXCL_MARK = 0xab;
export const CHAR_QUESTION_MARK = 0xac;
export const CHAR_PERIOD = 0xad;
export const CHAR_DBL_QUOTE_LEFT = 0xb1;
export const CHAR_DBL_QUOTE_RIGHT = 0xb2;
export const CHAR_SGL_QUOTE_LEFT = 0xb3;
export const CHAR_SGL_QUOTE_RIGHT = 0xb4;
export const CHAR_CURRENCY = 0xb0;
export const CHAR_COMMA = 0xb8;
export const CHAR_MULT_SIGN = 0xb5;
export const CHAR_SLASH = 0xba;
export const CHAR_LESS_THAN = 0x85;
export const CHAR_GREATER_THAN = 0x86;
export const CHAR_PERCENT = 0xb7;
export const CHAR_LEFT_PAREN = 0xb9;
export const CHAR_RIGHT_PAREN = 0xb6;

export const miniPcharDecode = (encoded: number): string => {
  if (encoded >= CHAR_a && encoded <= CHAR_z) {
    return String.fromCharCode(encoded - (CHAR_a - 'a'.charCodeAt(0)));
  }
  if (encoded >= CHAR_A && encoded <= CHAR_Z) {
    return String.fromCharCode(encoded - (CHAR_A - 'A'.charCodeAt(0)));
  }
  if (encoded >= CHAR_0 && encoded <= CHAR_9) {
    return String.fromCharCode(encoded - (CHAR_0 - '0'.charCodeAt(0)));
  }
  switch (encoded) {
    case CHAR_SPACE:
      return ' ';
    case CHAR_EXCL_MARK:
      return '!';
    case CHAR_QUESTION_MARK:
      return '?';
    case CHAR_PERIOD:
      return '.';
    case CHAR_DBL_QUOTE_LEFT:
    case CHAR_DBL_QUOTE_RIGHT:
      return '"';
    case CHAR_SGL_QUOTE_LEFT:
    case CHAR_SGL_QUOTE_RIGHT:
      return "'";
    case CHAR_CURRENCY:
      return '$';
    case CHAR_COMMA:
      return ',';
    case CHAR_MULT_SIGN:
      return '#';
    case CHAR_SLASH:
      return '/';
    case CHAR_LESS_THAN:
      return '<';
    case CHAR_GREATER_THAN:
      return '>';
    case CHAR_PERCENT:
      return '%';
    case CHAR_LEFT_PAREN:
      return '(';
    case CHAR_RIGHT_PAREN:
      return ')';
    default:
      return '?';
  }
};

export function mini_pchar_decode(encoded: number): string {
  return miniPcharDecode(encoded);
}

export interface MiniBuffer {
  buffer: string;
  bufferLen: number;
}

const writeToBuffer = (buf: MiniBuffer | null, text: string): number => {
  if (buf === null) {
    return text.length;
  }
  const room = Math.max(0, buf.bufferLen - 1 - buf.buffer.length);
  if (room > 0) {
    buf.buffer += text.slice(0, room);
  }
  return buf.buffer.length;
};

export const putsAscii = (text: string, len: number, buf: MiniBuffer | null): number =>
  writeToBuffer(buf, text.slice(0, len));

export function _putsAscii(text: string, len: number, buf: MiniBuffer | null): number {
  return putsAscii(text, len, buf);
}

export const putsEncoded = (encoded: readonly number[], len: number, buf: MiniBuffer | null): number =>
  writeToBuffer(buf, encoded.slice(0, len).map(miniPcharDecode).join(''));

export function _putsEncoded(encoded: readonly number[], len: number, buf: MiniBuffer | null): number {
  return putsEncoded(encoded, len, buf);
}

export const miniStrlen = (text: string): number => {
  let len = 0;
  while (len < text.length && text[len] !== '\0') {
    len += 1;
  }
  return len;
};

export function mini_strlen(text: string): number {
  return miniStrlen(text);
}

export const miniItoa = (
  value: number,
  radix: number,
  uppercase: boolean,
  unsig: boolean
): string => {
  if (radix > 16) {
    return '';
  }
  let v = value | 0;
  let negative = false;
  if (v < 0 && !unsig) {
    negative = true;
    v = -v;
  } else if (unsig) {
    v = value >>> 0;
  }
  const digits = uppercase ? '0123456789ABCDEF' : '0123456789abcdef';
  let out = '';
  do {
    const digit = v % radix;
    out += digits[digit];
    v = Math.trunc(v / radix);
  } while (v > 0);
  if (negative) {
    out += '-';
  }
  return out.split('').reverse().join('');
};

export function mini_itoa(
  value: number,
  radix: number,
  uppercase: boolean,
  unsig: boolean
): string {
  return miniItoa(value, radix, uppercase, unsig);
}

export const miniPad = (
  ptr: string,
  len: number,
  padChar: string,
  padTo: number
): string => {
  let l = len;
  let overflow = false;
  if (padTo === 0) {
    padTo = l;
  }
  if (l > padTo) {
    l = padTo;
    overflow = true;
  }
  let out = `${padChar.repeat(padTo - l)}${ptr.slice(0, l)}`;
  if (overflow) {
    const chars = out.split('');
    for (let i = 0; i < 3 && chars.length - 1 - i >= 0; i += 1) {
      chars[chars.length - 1 - i] = '*';
    }
    out = chars.join('');
  }
  return out;
};

export function mini_pad(
  ptr: string,
  len: number,
  padChar: string,
  padTo: number
): string {
  return miniPad(ptr, len, padChar, padTo);
}

export type MiniArg = number | string | number[];

export const miniVpprintf = (
  buf: MiniBuffer | null,
  fmt: string,
  args: MiniArg[]
): number => {
  let n = 0;
  let argIndex = 0;
  for (let i = 0; i < fmt.length;) {
    let ch = fmt[i++];
    let len = 0;
    if (ch !== '%') {
      len = putsAscii(ch, 1, buf);
    } else {
      let padChar = ' ';
      let padTo = 0;
      let l = false;
      ch = fmt[i++] ?? '\0';
      if (ch === '0') {
        padChar = '0';
        ch = fmt[i++] ?? '\0';
      }
      while (ch >= '0' && ch <= '9') {
        padTo = padTo * 10 + (ch.charCodeAt(0) - '0'.charCodeAt(0));
        ch = fmt[i++] ?? '\0';
      }
      if (padTo > 24) {
        padTo = 24;
      }
      if (ch === 'l') {
        l = true;
        ch = fmt[i++] ?? '\0';
      }
      switch (ch) {
        case '\0':
          return n;
        case 'u':
        case 'd': {
          const value = Number(args[argIndex++]);
          const converted = miniItoa(value, 10, false, ch === 'u' || l);
          len = putsAscii(miniPad(converted, converted.length, padChar, padTo), miniPad(converted, converted.length, padChar, padTo).length, buf);
          break;
        }
        case 'x':
        case 'X': {
          const value = Number(args[argIndex++]);
          const converted = miniItoa(value, 16, ch === 'X', true);
          const padded = miniPad(converted, converted.length, padChar, padTo);
          len = putsAscii(padded, padded.length, buf);
          break;
        }
        case 'c': {
          const value = Number(args[argIndex++]);
          const char = String.fromCharCode(value & 0xff);
          const padded = miniPad(char, 1, padChar, padTo);
          len = putsAscii(padded, padded.length, buf);
          break;
        }
        case 's': {
          const ptr = String(args[argIndex++]);
          const sLen = miniStrlen(ptr);
          if (padTo > 0) {
            const padded = miniPad(ptr, sLen, padChar, padTo);
            len = putsAscii(padded, padded.length, buf);
          } else {
            len = putsAscii(ptr, sLen, buf);
          }
          break;
        }
        case 'S': {
          const ptr = args[argIndex++] as number[];
          const sLen = ptr.indexOf(0xff) >= 0 ? ptr.indexOf(0xff) : ptr.length;
          if (padTo > 0) {
            const padded = miniPad(String.fromCharCode(...ptr.slice(0, sLen)), sLen, padChar, padTo);
            len = putsAscii(padded.split('').map((c) => miniPcharDecode(c.charCodeAt(0))).join(''), padded.length, buf);
          } else {
            len = putsEncoded(ptr, sLen, buf);
          }
          break;
        }
        default:
          len = putsAscii(ch, 1, buf);
          break;
      }
    }
    n += len;
  }
  return n;
};

export function mini_vpprintf(
  buf: MiniBuffer | null,
  fmt: string,
  args: MiniArg[]
): number {
  return miniVpprintf(buf, fmt, args);
}

export const miniVsnprintf = (
  bufferLen: number,
  fmt: string,
  args: MiniArg[]
): { written: string; returnValue: number } => {
  const b: MiniBuffer = { buffer: '', bufferLen };
  if (bufferLen === 0) {
    return { written: '', returnValue: miniVpprintf(null, fmt, args) };
  }
  const n = miniVpprintf(b, fmt, args);
  return { written: b.buffer, returnValue: n };
};

export function mini_vsnprintf(
  bufferLen: number,
  fmt: string,
  args: MiniArg[]
): { written: string; returnValue: number } {
  return miniVsnprintf(bufferLen, fmt, args);
}
