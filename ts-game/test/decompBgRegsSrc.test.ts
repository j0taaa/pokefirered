import { describe, expect, test } from 'vitest';
import {
  gBGControlRegOffsets,
  gBGControlRegs,
  gBGHOffsetRegOffsets,
  gBGHOffsetRegs,
  gBGVOffsetRegOffsets,
  gBGVOffsetRegs,
  gBLDCNTTarget1BGFlags,
  gDISPCNTBGFlags,
  gOverworldBackgroundLayerFlags
} from '../src/game/decompBgRegs';

describe('src/bg_regs.c parity tables', () => {
  test('register pointer and offset tables preserve BG0-BG3 order', () => {
    expect(gBGControlRegs).toEqual(['REG_BG0CNT', 'REG_BG1CNT', 'REG_BG2CNT', 'REG_BG3CNT']);
    expect(gBGHOffsetRegs).toEqual(['REG_BG0HOFS', 'REG_BG1HOFS', 'REG_BG2HOFS', 'REG_BG3HOFS']);
    expect(gBGVOffsetRegs).toEqual(['REG_BG0VOFS', 'REG_BG1VOFS', 'REG_BG2VOFS', 'REG_BG3VOFS']);
    expect(gBGControlRegOffsets).toEqual([0x08, 0x0a, 0x0c, 0x0e]);
    expect(gBGHOffsetRegOffsets).toEqual([0x10, 0x14, 0x18, 0x1c]);
    expect(gBGVOffsetRegOffsets).toEqual([0x12, 0x16, 0x1a, 0x1e]);
  });

  test('DISPCNT and BLDCNT flag tables preserve C constants by layer', () => {
    expect(gDISPCNTBGFlags).toEqual([0x0100, 0x0200, 0x0400, 0x0800]);
    expect(gOverworldBackgroundLayerFlags).toEqual([0x0100, 0x0200, 0x0400, 0x0800]);
    expect(gBLDCNTTarget1BGFlags).toEqual([0x0001, 0x0002, 0x0004, 0x0008]);
  });
});
