import { describe, expect, test } from 'vitest';
import {
  CHAR_DYNAMIC,
  DYNAMIC_PLACEHOLDER_TEXT_UTIL_C_TRANSLATION_UNIT,
  DynamicPlaceholderTextUtil_ExpandPlaceholders,
  DynamicPlaceholderTextUtil_GetPlaceholderPtr,
  DynamicPlaceholderTextUtil_Reset,
  DynamicPlaceholderTextUtil_SetPlaceholderPtr,
  EOS,
  GetColorFromTextColorTable,
  expandDynamicPlaceholders,
  expandRuntimePlaceholders,
  getRuntimeDynamicPlaceholders
} from '../src/game/decompDynamicPlaceholderTextUtil';

describe('decomp dynamic placeholder text util', () => {
  test('exports exact dynamic_placeholder_text_util.c entry points', () => {
    expect(DYNAMIC_PLACEHOLDER_TEXT_UTIL_C_TRANSLATION_UNIT).toBe('src/dynamic_placeholder_text_util.c');
  });

  test('expands PLAYER and STR_VAR placeholders', () => {
    expect(
      expandDynamicPlaceholders('Hi, {PLAYER}! {STR_VAR_1} and {STR_VAR_2}.', {
        PLAYER: 'LEAF',
        STR_VAR_1: 'ORAN',
        STR_VAR_2: 'SITRUS'
      })
    ).toBe('Hi, LEAF! ORAN and SITRUS.');
  });

  test('derives placeholder values from runtime state', () => {
    const runtime = {
      startMenu: { playerName: 'RED' },
      stringVars: {
        STR_VAR_1: 'FLASH',
        STR_VAR_2: 'EXP. SHARE',
        STR_VAR_3: '20',
        STR_VAR_4: 'unused'
      }
    };

    expect(getRuntimeDynamicPlaceholders(runtime)).toEqual({
      PLAYER: 'RED',
      STR_VAR_1: 'FLASH',
      STR_VAR_2: 'EXP. SHARE',
      STR_VAR_3: '20',
      STR_VAR_4: 'unused'
    });
    expect(expandRuntimePlaceholders('Hello, {PLAYER}. Reward: {STR_VAR_2}.', runtime)).toBe(
      'Hello, RED. Reward: EXP. SHARE.'
    );
  });

  test('C placeholder table reset, set, get, and expansion preserve byte semantics', () => {
    DynamicPlaceholderTextUtil_Reset();
    expect(DynamicPlaceholderTextUtil_GetPlaceholderPtr(0)).toBeNull();

    const red = ['R'.charCodeAt(0), 'E'.charCodeAt(0), 'D'.charCodeAt(0), EOS];
    DynamicPlaceholderTextUtil_SetPlaceholderPtr(0, red);
    DynamicPlaceholderTextUtil_SetPlaceholderPtr(8, [1, EOS]);
    expect(DynamicPlaceholderTextUtil_GetPlaceholderPtr(0)).toBe(red);
    expect(DynamicPlaceholderTextUtil_GetPlaceholderPtr(8)).toBeNull();

    expect(
      DynamicPlaceholderTextUtil_ExpandPlaceholders([
        'H'.charCodeAt(0),
        'i'.charCodeAt(0),
        ' '.charCodeAt(0),
        CHAR_DYNAMIC,
        0,
        '!'.charCodeAt(0),
        EOS
      ])
    ).toEqual([
      'H'.charCodeAt(0),
      'i'.charCodeAt(0),
      ' '.charCodeAt(0),
      'R'.charCodeAt(0),
      'E'.charCodeAt(0),
      'D'.charCodeAt(0),
      '!'.charCodeAt(0),
      EOS
    ]);
  });

  test('text color table extracts low and high nybbles like C', () => {
    expect(GetColorFromTextColorTable(0)).toBe(0);
    expect(GetColorFromTextColorTable(7)).toBe(1);
    expect(GetColorFromTextColorTable(92)).toBe(3);
    expect(GetColorFromTextColorTable(151)).toBe(3);
    expect(GetColorFromTextColorTable(999)).toBe(3);
  });
});
