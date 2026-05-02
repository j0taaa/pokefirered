import { describe, expect, test } from 'vitest';
import {
  C_V,
  EOT,
  FINE,
  PAN,
  TIE,
  TUNE,
  VOL,
  XCMD,
  gCgb3Vol,
  gCgbFreqTable,
  gCgbScaleTable,
  gClockTable,
  gDeltaEncodingTable,
  gFreqTable,
  gMPlayJumpTableTemplate,
  gNoiseTable,
  gPcmSamplesPerVBlankTable,
  gPokemonCrySongTemplate,
  gScaleTable,
  gXcmdTable,
  xRELE,
  xWAIT
} from '../src/game/decompM4aTables';

describe('decomp m4a_tables', () => {
  test('jump tables preserve the original function-pointer order', () => {
    expect(gMPlayJumpTableTemplate).toHaveLength(36);
    expect(gMPlayJumpTableTemplate.slice(0, 5)).toEqual([
      'ply_fine',
      'ply_goto',
      'ply_patt',
      'ply_pend',
      'ply_rept'
    ]);
    expect(gMPlayJumpTableTemplate.slice(-6)).toEqual([
      'SampleFreqSet',
      'TrackStop',
      'FadeOutBody',
      'TrkVolPitSet',
      'RealClearChain',
      'SoundMainBTM'
    ]);
    expect(gXcmdTable).toEqual([
      'ply_xxx',
      'ply_xwave',
      'ply_xtype',
      'ply_xxx',
      'ply_xatta',
      'ply_xdeca',
      'ply_xsust',
      'ply_xrele',
      'ply_xiecv',
      'ply_xiecl',
      'ply_xleng',
      'ply_xswee',
      'ply_xwait',
      'ply_xcmd_0D'
    ]);
  });

  test('audio lookup tables match the C constants', () => {
    expect(gDeltaEncodingTable).toEqual([
      0, 1, 4, 9, 16, 25, 36, 49, -64, -49, -36, -25, -16, -9, -4, -1
    ]);
    expect(gScaleTable.slice(0, 14)).toEqual([
      0xe0, 0xe1, 0xe2, 0xe3, 0xe4, 0xe5, 0xe6, 0xe7, 0xe8, 0xe9, 0xea, 0xeb, 0xd0, 0xd1
    ]);
    expect(gScaleTable.at(-1)).toBe(0x0b);
    expect(gFreqTable[0]).toBe(2147483648);
    expect(gFreqTable[11]).toBe(4053909305);
    expect(gPcmSamplesPerVBlankTable).toEqual([96, 132, 176, 224, 264, 304, 352, 448, 528, 608, 672, 704]);
    expect(gCgbScaleTable.slice(0, 14)).toEqual([
      0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x10, 0x11
    ]);
    expect(gCgbFreqTable).toEqual([-2004, -1891, -1785, -1685, -1591, -1501, -1417, -1337, -1262, -1192, -1125, -1062]);
    expect(gNoiseTable.slice(0, 8)).toEqual([0xd7, 0xd6, 0xd5, 0xd4, 0xc7, 0xc6, 0xc5, 0xc4]);
    expect(gNoiseTable.slice(-4)).toEqual([0x03, 0x02, 0x01, 0x00]);
    expect(gCgb3Vol).toEqual([0x00, 0x00, 0x60, 0x60, 0x60, 0x60, 0x40, 0x40, 0x40, 0x40, 0x80, 0x80, 0x80, 0x80, 0x20, 0x20]);
    expect(gClockTable.slice(24, 32)).toEqual([0x18, 0x1c, 0x1e, 0x20, 0x24, 0x28, 0x2a, 0x2c]);
    expect(gClockTable.at(-1)).toBe(0x60);
  });

  test('Pokemon cry song template keeps the byte command sequence', () => {
    expect(gPokemonCrySongTemplate).toMatchObject({
      trackCount: 1,
      blockCount: 0,
      priority: 255,
      reverb: 0,
      voicegroup: 'voicegroup000'
    });
    expect(gPokemonCrySongTemplate.part).toEqual([
      TUNE,
      C_V,
      0xb2,
      0,
      TUNE,
      C_V + 16,
      [0xbd, 0],
      VOL,
      127,
      [XCMD, 0x0d],
      0,
      [XCMD, xRELE],
      0,
      PAN,
      C_V,
      TIE,
      60,
      127,
      [XCMD, xWAIT],
      60,
      [EOT, FINE]
    ]);
  });
});
