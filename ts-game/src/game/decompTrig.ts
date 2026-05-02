// Values are the exact fixed-point entries from src/trig.c, compacted by symmetry.
const sineQuarterQ8_8 = [
  0, 6, 12, 18, 25, 31, 37, 43, 49, 56, 62, 68, 74, 80, 86, 92,
  97, 103, 109, 115, 120, 126, 131, 136, 142, 147, 152, 157, 162, 167, 171, 176,
  181, 185, 189, 193, 197, 201, 205, 209, 212, 216, 219, 222, 225, 228, 231, 234,
  236, 238, 241, 243, 244, 246, 248, 249, 251, 252, 253, 254, 254, 255, 255, 255,
  256
];

const sineDegreeHalfQ4_12 = [
  0, 71, 143, 214, 286, 357, 428, 499, 570, 641, 711, 782, 852,
  921, 991, 1060, 1129, 1198, 1266, 1334, 1401, 1468, 1534, 1600, 1666, 1731,
  1796, 1860, 1923, 1986, 2048, 2110, 2171, 2231, 2290, 2349, 2408, 2465, 2522,
  2578, 2633, 2687, 2741, 2793, 2845, 2896, 2946, 2996, 3044, 3091, 3138, 3183,
  3228, 3271, 3314, 3355, 3396, 3435, 3474, 3511, 3547, 3582, 3617, 3650, 3681,
  3712, 3742, 3770, 3798, 3824, 3849, 3873, 3896, 3917, 3937, 3956, 3974, 3991,
  4006, 4021, 4034, 4046, 4056, 4065, 4073, 4080, 4086, 4090, 4093, 4095, 4096
];

const buildSineTable = (): number[] => {
  const table: number[] = [];
  for (let i = 0; i <= 64; i += 1) {
    table.push(sineQuarterQ8_8[i]);
  }
  for (let i = 65; i <= 128; i += 1) {
    table.push(sineQuarterQ8_8[128 - i]);
  }
  for (let i = 129; i <= 192; i += 1) {
    table.push(-sineQuarterQ8_8[i - 128]);
  }
  for (let i = 193; i <= 256; i += 1) {
    const value = sineQuarterQ8_8[256 - i];
    table.push(value === 0 ? 0 : -value);
  }
  for (let i = 257; i <= 319; i += 1) {
    table.push(sineQuarterQ8_8[i - 256]);
  }
  return table;
};

const buildSineDegreeTable = (): number[] => {
  const table: number[] = [];
  for (let i = 0; i <= 90; i += 1) {
    table.push(sineDegreeHalfQ4_12[i]);
  }
  for (let i = 91; i <= 179; i += 1) {
    table.push(sineDegreeHalfQ4_12[180 - i]);
  }
  return table;
};

export const gSineTable = buildSineTable();
export const gSineDegreeTable = buildSineDegreeTable();

export const sin = (index: number, amplitude: number): number =>
  (amplitude * gSineTable[index]) >> 8;

export const cos = (index: number, amplitude: number): number =>
  (amplitude * gSineTable[index + 64]) >> 8;

export const sin2 = (angle: number): number => {
  const u16Angle = angle & 0xffff;
  const angleMod = u16Angle % 180;
  const negate = (Math.trunc(u16Angle / 180) & 1) !== 0;
  const value = gSineDegreeTable[angleMod];

  if (negate) {
    return value === 0 ? 0 : -value;
  }
  return value;
};

export const cos2 = (angle: number): number => sin2((angle & 0xffff) + 90);

export const TRIG_C_TRANSLATION_UNIT = 'src/trig.c';

export function Sin(index: number, amplitude: number): number { return sin(index, amplitude); }
export function Cos(index: number, amplitude: number): number { return cos(index, amplitude); }
export function Sin2(angle: number): number { return sin2(angle); }
export function Cos2(angle: number): number { return cos2(angle); }
