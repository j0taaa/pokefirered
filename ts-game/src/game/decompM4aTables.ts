export const gMPlayJumpTableTemplate = [
  'ply_fine',
  'ply_goto',
  'ply_patt',
  'ply_pend',
  'ply_rept',
  'ply_fine',
  'ply_fine',
  'ply_fine',
  'ply_fine',
  'ply_prio',
  'ply_tempo',
  'ply_keysh',
  'ply_voice',
  'ply_vol',
  'ply_pan',
  'ply_bend',
  'ply_bendr',
  'ply_lfos',
  'ply_lfodl',
  'ply_mod',
  'ply_modt',
  'ply_fine',
  'ply_fine',
  'ply_tune',
  'ply_fine',
  'ply_fine',
  'ply_fine',
  'ply_port',
  'ply_fine',
  'ply_endtie',
  'SampleFreqSet',
  'TrackStop',
  'FadeOutBody',
  'TrkVolPitSet',
  'RealClearChain',
  'SoundMainBTM'
] as const;

export const gDeltaEncodingTable = [
  0, 1, 4, 9, 16, 25, 36, 49, -64, -49, -36, -25, -16, -9, -4, -1
] as const;

export const gScaleTable = Array.from({ length: 15 * 12 }, (_unused, i) => {
  const row = Math.trunc(i / 12);
  const col = i % 12;
  return ((14 - row) << 4) | col;
});

export const gFreqTable = [
  2147483648, 2275179671, 2410468894, 2553802834, 2705659852, 2866546760,
  3037000500, 3217589947, 3408917802, 3611622603, 3826380858, 4053909305
] as const;

export const gPcmSamplesPerVBlankTable = [
  96, 132, 176, 224, 264, 304, 352, 448, 528, 608, 672, 704
] as const;

export const gCgbScaleTable = Array.from({ length: 12 * 12 }, (_unused, i) => {
  const row = Math.trunc(i / 12);
  const col = i % 12;
  return (row << 4) | col;
});

export const gCgbFreqTable = [
  -2004, -1891, -1785, -1685, -1591, -1501, -1417, -1337, -1262, -1192, -1125, -1062
] as const;

export const gNoiseTable = [
  0xd7, 0xd6, 0xd5, 0xd4,
  0xc7, 0xc6, 0xc5, 0xc4,
  0xb7, 0xb6, 0xb5, 0xb4,
  0xa7, 0xa6, 0xa5, 0xa4,
  0x97, 0x96, 0x95, 0x94,
  0x87, 0x86, 0x85, 0x84,
  0x77, 0x76, 0x75, 0x74,
  0x67, 0x66, 0x65, 0x64,
  0x57, 0x56, 0x55, 0x54,
  0x47, 0x46, 0x45, 0x44,
  0x37, 0x36, 0x35, 0x34,
  0x27, 0x26, 0x25, 0x24,
  0x17, 0x16, 0x15, 0x14,
  0x07, 0x06, 0x05, 0x04,
  0x03, 0x02, 0x01, 0x00
] as const;

export const gCgb3Vol = [
  0x00, 0x00,
  0x60, 0x60, 0x60, 0x60,
  0x40, 0x40, 0x40, 0x40,
  0x80, 0x80, 0x80, 0x80,
  0x20, 0x20
] as const;

export const gClockTable = [
  0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
  0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f,
  0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17,
  0x18, 0x1c, 0x1e, 0x20, 0x24, 0x28, 0x2a, 0x2c,
  0x30, 0x34, 0x36, 0x38, 0x3c, 0x40, 0x42, 0x44,
  0x48, 0x4c, 0x4e, 0x50, 0x54, 0x58, 0x5a, 0x5c,
  0x60
] as const;

export const FINE = 0xb1;
export const GOTO = 0xb2;
export const PATT = 0xb3;
export const PEND = 0xb4;
export const REPT = 0xb5;
export const MEMACC = 0xb9;
export const PRIO = 0xba;
export const TEMPO = 0xbb;
export const KEYSH = 0xbc;
export const VOICE = 0xbd;
export const VOL = 0xbe;
export const PAN = 0xbf;
export const BEND = 0xc0;
export const BENDR = 0xc1;
export const LFOS = 0xc2;
export const LFODL = 0xc3;
export const MOD = 0xc4;
export const MODT = 0xc5;
export const TUNE = 0xc8;
export const XCMD = 0xcd;
export const xRELE = 0x07;
export const xIECV = 0x08;
export const xIECL = 0x09;
export const xWAIT = 0x0c;
export const EOT = 0xce;
export const TIE = 0xcf;
export const C_V = 0x40;

export interface PokemonCrySongTemplate {
  trackCount: number;
  blockCount: number;
  priority: number;
  reverb: number;
  voicegroup: string;
  part: (number | [number, number])[];
}

export const gPokemonCrySongTemplate: PokemonCrySongTemplate = {
  trackCount: 1,
  blockCount: 0,
  priority: 255,
  reverb: 0,
  voicegroup: 'voicegroup000',
  part: [
    TUNE,
    C_V,
    GOTO,
    0,
    TUNE,
    C_V + 16,
    [VOICE, 0],
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
  ]
};

export const gXcmdTable = [
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
] as const;
