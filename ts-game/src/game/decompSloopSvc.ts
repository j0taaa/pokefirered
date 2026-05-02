export const RFU_USER_NAME_LENGTH = 8;
export const SVC4B_EXIT_EARLY = 1 << 0;
export const SVC4B_RESEED_RNG = 1 << 1;

export const SLOOP_SVC = {
  SVC_40: 0x40,
  SVC_41: 0x41,
  SVC_42: 0x42,
  SVC_43: 0x43,
  SVC_44: 0x44,
  SVC_45: 0x45,
  SVC_47: 0x47,
  SVC_WRITE_SECTOR: 0x48,
  SVC_49: 0x49,
  SVC_4A: 0x4a,
  SVC_4B: 0x4b,
  SVC_FINISH_SAVE: 0x4c,
  SVC_BAD_WORD_CHECK: 0x4d,
  SVC_4F: 0x4f,
  SVC_50: 0x50,
  SVC_51: 0x51,
  SVC_53: 0x53,
  SVC_COMMS_ALLOWED_BY_PARENTAL_CONTROLS: 0x54,
  SVC_SET_SAVE_BLOCK2: 0x55,
  SVC_REPLACE_SECTOR: 0x56,
  SVC_SET_STARTER: 0x57,
  SVC_SET_ACTIVITY: 0x61,
  SVC_INCREMENT_LINK_ERROR: 0x62
} as const;

export interface SloopSvc47Params {
  bytes: Uint8Array;
  hostRfuGameData: Uint8Array;
  hostRfuUsername: Uint8Array;
}

export interface SloopSvcCall {
  svc: number;
  args: unknown[];
}

export interface SloopSvcRuntime {
  hostRfuGameData: Uint8Array;
  hostRfuUsername: Uint8Array;
  rfuLinkStatus: unknown;
  sloopRfuLinkStatus: unknown;
  svc47Params: SloopSvc47Params;
  badWordAsciiString: Uint8Array;
  svcCalls: SloopSvcCall[];
  returnValues: Map<number, number>;
  pkmnStrToASCII: (dest: Uint8Array, src: Uint8Array) => void;
  asciiToPkmnStr: (dest: Uint8Array, src: Uint8Array) => void;
}

const createSvc47Params = (): SloopSvc47Params => {
  const bytes = new Uint8Array(0x10 + RFU_USER_NAME_LENGTH);
  return {
    bytes,
    hostRfuGameData: bytes.subarray(0, 0x10),
    hostRfuUsername: bytes.subarray(0x10)
  };
};

const copyFixed = (dest: Uint8Array, src: Uint8Array): void => {
  dest.fill(0);
  dest.set(src.subarray(0, dest.length));
};

const identityPkmnStringCopy = (dest: Uint8Array, src: Uint8Array): void => {
  copyFixed(dest, src);
};

export const createSloopSvcRuntime = (
  overrides: Partial<Omit<SloopSvcRuntime, 'svc47Params' | 'svcCalls' | 'returnValues'>> & {
    svc47Params?: SloopSvc47Params;
    svcCalls?: SloopSvcCall[];
    returnValues?: Map<number, number>;
  } = {}
): SloopSvcRuntime => ({
  hostRfuGameData: overrides.hostRfuGameData ?? new Uint8Array(0x10),
  hostRfuUsername: overrides.hostRfuUsername ?? new Uint8Array(RFU_USER_NAME_LENGTH),
  rfuLinkStatus: overrides.rfuLinkStatus ?? null,
  sloopRfuLinkStatus: overrides.sloopRfuLinkStatus ?? null,
  svc47Params: overrides.svc47Params ?? createSvc47Params(),
  badWordAsciiString: overrides.badWordAsciiString ?? new Uint8Array(256),
  svcCalls: overrides.svcCalls ?? [],
  returnValues: overrides.returnValues ?? new Map(),
  pkmnStrToASCII: overrides.pkmnStrToASCII ?? identityPkmnStringCopy,
  asciiToPkmnStr: overrides.asciiToPkmnStr ?? identityPkmnStringCopy
});

export const setSloopSvcReturnValue = (
  runtime: SloopSvcRuntime,
  svc: number,
  value: number
): void => {
  runtime.returnValues.set(svc, value >>> 0);
};

const callSloopSvc = (
  runtime: SloopSvcRuntime,
  svc: number,
  args: unknown[] = []
): number => {
  runtime.svcCalls.push({ svc, args });
  return runtime.returnValues.get(svc) ?? 0;
};

export function svc_40(runtime: SloopSvcRuntime): void {
  callSloopSvc(runtime, SLOOP_SVC.SVC_40);
}

export function svc_41(runtime: SloopSvcRuntime): void {
  callSloopSvc(runtime, SLOOP_SVC.SVC_41);
}

export function svc_47(runtime: SloopSvcRuntime): void {
  copyFixed(runtime.svc47Params.hostRfuGameData, runtime.hostRfuGameData);
  copyFixed(runtime.svc47Params.hostRfuUsername, runtime.hostRfuUsername);
  callSloopSvc(runtime, SLOOP_SVC.SVC_47, [runtime.svc47Params.bytes]);
  runtime.sloopRfuLinkStatus = runtime.rfuLinkStatus;
}

export function svc_42(runtime: SloopSvcRuntime): void {
  callSloopSvc(runtime, SLOOP_SVC.SVC_42);
}

export function svc_49(runtime: SloopSvcRuntime): number {
  return callSloopSvc(runtime, SLOOP_SVC.SVC_49) >>> 0;
}

export function svc_45_rfu_link_status(runtime: SloopSvcRuntime): void {
  callSloopSvc(runtime, SLOOP_SVC.SVC_45, [runtime.rfuLinkStatus]);
}

export function svc_4a(runtime: SloopSvcRuntime): number {
  return callSloopSvc(runtime, SLOOP_SVC.SVC_4A) >>> 0;
}

export function svc_43(runtime: SloopSvcRuntime, pid: number): void {
  callSloopSvc(runtime, SLOOP_SVC.SVC_43, [pid & 0xffff]);
}

export function svc_44(runtime: SloopSvcRuntime): void {
  callSloopSvc(runtime, SLOOP_SVC.SVC_44);
}

export function svc_53(runtime: SloopSvcRuntime): number {
  return callSloopSvc(runtime, SLOOP_SVC.SVC_53) >>> 0;
}

export function svc_51(runtime: SloopSvcRuntime): number {
  return callSloopSvc(runtime, SLOOP_SVC.SVC_51) >>> 0;
}

export function svc_4b(runtime: SloopSvcRuntime): number {
  return callSloopSvc(runtime, SLOOP_SVC.SVC_4B) >>> 0;
}

export function svc_WriteSector(
  runtime: SloopSvcRuntime,
  sector: number,
  data: Uint8Array
): void {
  callSloopSvc(runtime, SLOOP_SVC.SVC_WRITE_SECTOR, [sector & 0xff, Uint8Array.from(data)]);
}

export function svc_ReplaceSector(
  runtime: SloopSvcRuntime,
  sector: number,
  data: Uint8Array
): void {
  callSloopSvc(runtime, SLOOP_SVC.SVC_REPLACE_SECTOR, [sector & 0xff, Uint8Array.from(data)]);
}

export function svc_FinishSave(runtime: SloopSvcRuntime): void {
  callSloopSvc(runtime, SLOOP_SVC.SVC_FINISH_SAVE);
}

export function svc_CommsAllowedByParentalControls(runtime: SloopSvcRuntime): number {
  return callSloopSvc(runtime, SLOOP_SVC.SVC_COMMS_ALLOWED_BY_PARENTAL_CONTROLS) >>> 0;
}

export function call_svc_BadWordCheck(
  runtime: SloopSvcRuntime,
  string: Uint8Array,
  arg2: number
): number {
  return callSloopSvc(runtime, SLOOP_SVC.SVC_BAD_WORD_CHECK, [string, arg2 | 0]) >>> 0;
}

export function svc_BadWordCheck(runtime: SloopSvcRuntime, str: Uint8Array): number {
  runtime.pkmnStrToASCII(runtime.badWordAsciiString, str);
  const ret = call_svc_BadWordCheck(runtime, runtime.badWordAsciiString, 0);
  runtime.asciiToPkmnStr(str, runtime.badWordAsciiString);
  return ret;
}

export function svc_4f(runtime: SloopSvcRuntime, arg: number): void {
  callSloopSvc(runtime, SLOOP_SVC.SVC_4F, [arg >>> 0]);
}

export function svc_50(runtime: SloopSvcRuntime): number {
  return callSloopSvc(runtime, SLOOP_SVC.SVC_50) >>> 0;
}

export function svc_SetSaveBlock2(runtime: SloopSvcRuntime, saveBlock2: unknown): void {
  callSloopSvc(runtime, SLOOP_SVC.SVC_SET_SAVE_BLOCK2, [saveBlock2]);
}

export function svc_stubbed(_runtime: SloopSvcRuntime): void {
  // Intentionally empty, matching the decompiled no-op stub.
}

export function svc_SetStarter(runtime: SloopSvcRuntime, species: number): void {
  callSloopSvc(runtime, SLOOP_SVC.SVC_SET_STARTER, [species >>> 0]);
}

export function svc_SetActivity(runtime: SloopSvcRuntime, activity: number): void {
  callSloopSvc(runtime, SLOOP_SVC.SVC_SET_ACTIVITY, [activity >>> 0]);
}

export function svc_IncrementLinkError(runtime: SloopSvcRuntime): void {
  callSloopSvc(runtime, SLOOP_SVC.SVC_INCREMENT_LINK_ERROR);
}
