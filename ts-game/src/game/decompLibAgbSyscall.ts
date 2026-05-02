export const REG_IME = 0x04000208;
export const USER_STACK = 0x03007f00;

export const GBA_BIOS_SVC = {
  ArcTan2: 0x0a,
  BgAffineSet: 0x0e,
  CpuFastSet: 0x0c,
  CpuSet: 0x0b,
  Div: 0x06,
  LZ77UnCompVram: 0x12,
  LZ77UnCompWram: 0x11,
  MultiBoot: 0x25,
  ObjAffineSet: 0x0f,
  RegisterRamReset: 0x01,
  SoftReset: 0x00,
  Sqrt: 0x08,
  VBlankIntrWait: 0x05
} as const;

export type GbaBiosSvcName = keyof typeof GBA_BIOS_SVC;

export interface GbaBiosCall {
  svc: number;
  args: unknown[];
}

export interface GbaBiosRuntime {
  calls: GbaBiosCall[];
  registers: Record<string, number>;
  memory8: Record<number, number>;
  stackPointer: number;
  returnValues: Partial<Record<GbaBiosSvcName, unknown>>;
}

export const createGbaBiosRuntime = (
  overrides: Partial<GbaBiosRuntime> = {}
): GbaBiosRuntime => ({
  calls: overrides.calls ?? [],
  registers: overrides.registers ?? {},
  memory8: overrides.memory8 ?? {},
  stackPointer: overrides.stackPointer ?? 0,
  returnValues: overrides.returnValues ?? {}
});

const callBios = <T = unknown>(
  runtime: GbaBiosRuntime,
  name: GbaBiosSvcName,
  args: unknown[] = []
): T => {
  runtime.calls.push({ svc: GBA_BIOS_SVC[name], args });
  return runtime.returnValues[name] as T;
};

export const ArcTan2 = (runtime: GbaBiosRuntime, x: number, y: number): number =>
  callBios<number>(runtime, 'ArcTan2', [x, y]);

export const BgAffineSet = (
  runtime: GbaBiosRuntime,
  src: unknown,
  dest: unknown,
  count: number
): void => {
  callBios(runtime, 'BgAffineSet', [src, dest, count]);
};

export const CpuFastSet = (
  runtime: GbaBiosRuntime,
  src: unknown,
  dest: unknown,
  control: number
): void => {
  callBios(runtime, 'CpuFastSet', [src, dest, control]);
};

export const CpuSet = (
  runtime: GbaBiosRuntime,
  src: unknown,
  dest: unknown,
  control: number
): void => {
  callBios(runtime, 'CpuSet', [src, dest, control]);
};

export const Div = (runtime: GbaBiosRuntime, numerator: number, denominator: number): number =>
  callBios<number>(runtime, 'Div', [numerator, denominator]);

export const LZ77UnCompVram = (runtime: GbaBiosRuntime, src: unknown, dest: unknown): void => {
  callBios(runtime, 'LZ77UnCompVram', [src, dest]);
};

export const LZ77UnCompWram = (runtime: GbaBiosRuntime, src: unknown, dest: unknown): void => {
  callBios(runtime, 'LZ77UnCompWram', [src, dest]);
};

export const MultiBoot = (runtime: GbaBiosRuntime, param: unknown): number =>
  callBios<number>(runtime, 'MultiBoot', [param, 1]);

export const ObjAffineSet = (
  runtime: GbaBiosRuntime,
  src: unknown,
  dest: unknown,
  count: number,
  offset: number
): void => {
  callBios(runtime, 'ObjAffineSet', [src, dest, count, offset]);
};

export const RegisterRamReset = (runtime: GbaBiosRuntime, resetFlags: number): void => {
  callBios(runtime, 'RegisterRamReset', [resetFlags]);
};

export const SoftReset = (runtime: GbaBiosRuntime): void => {
  runtime.memory8[REG_IME] = 0;
  runtime.stackPointer = USER_STACK;
  callBios(runtime, 'RegisterRamReset');
  callBios(runtime, 'SoftReset');
};

export const Sqrt = (runtime: GbaBiosRuntime, value: number): number =>
  callBios<number>(runtime, 'Sqrt', [value]);

export const VBlankIntrWait = (runtime: GbaBiosRuntime): void => {
  runtime.registers.r2 = 0;
  callBios(runtime, 'VBlankIntrWait');
};
