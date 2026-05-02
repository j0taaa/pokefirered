import { describe, expect, test } from 'vitest';
import {
  gText_EasyChatKeyboard_ABCDEFothers,
  gText_NamingScreenKeyboard_Symbols1,
  gText_NamingScreenKeyboard_Symbols2,
  gText_UnionRoomChatKeyboard_Emoji10,
  gText_UnionRoomChatKeyboard_Emoji4,
  gText_UnionRoomChatKeyboard_PunctuationUpper,
  gText_UnionRoomChatKeyboard_SymbolsUpper,
  gText_UnionRoomChatKeyboard_Z,
  gText_UnionRoomChatKeyboard_z
} from '../src/game/decompKeyboardText';

describe('decomp keyboard_text', () => {
  test('preserves easy chat and naming-screen row literals exactly', () => {
    expect(gText_EasyChatKeyboard_ABCDEFothers).toBe(
      '{CLEAR 11}A{CLEAR 6}B{CLEAR 6}C{CLEAR 26}D{CLEAR 6}E{CLEAR 6}F{CLEAR 26}others'
    );
    expect(gText_NamingScreenKeyboard_Symbols1).toBe('{CLEAR 11}!{CLEAR 16}?{CLEAR 16}♂{CLEAR 16}♀{CLEAR 16}/{CLEAR 16}-');
    expect(gText_NamingScreenKeyboard_Symbols2).toBe('{CLEAR 11}…{CLEAR 16}“{CLEAR 16}”{CLEAR 18}‘{CLEAR 18}\'{CLEAR 18} ');
  });

  test('preserves union-room rows and emoji rows exactly', () => {
    expect(gText_UnionRoomChatKeyboard_Z).toBe('Z    ');
    expect(gText_UnionRoomChatKeyboard_z).toBe('z    ');
    expect(gText_UnionRoomChatKeyboard_PunctuationUpper).toBe('.,!? ');
    expect(gText_UnionRoomChatKeyboard_SymbolsUpper).toBe('-/&… ');
    expect(gText_UnionRoomChatKeyboard_Emoji4).toBe('♂♀{EMOJI_LEFT_PAREN}{EMOJI_RIGHT_PAREN}{EMOJI_TILDE}');
    expect(gText_UnionRoomChatKeyboard_Emoji10).toBe('{EMOJI_HIGHBAR}{EMOJI_UNDERSCORE};: ');
  });
});
