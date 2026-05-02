export const MULTIBOOT_NCHILD = 3;
export const MULTIBOOT_HEADER_SIZE = 0xc0;
export const MULTIBOOT_SEND_SIZE_MIN = 0x100;
export const MULTIBOOT_SEND_SIZE_MAX = 0x40000;

export const MULTIBOOT_MASTER_INFO = 0x62;
export const MULTIBOOT_CLIENT_INFO = 0x72;
export const MULTIBOOT_MASTER_START_PROBE = 0x61;
export const MULTIBOOT_MASTER_REQUEST_DLREADY = 0x63;
export const MULTIBOOT_CLIENT_DLREADY = 0x73;
export const MULTIBOOT_MASTER_START_DL = 0x64;

export const MULTIBOOT_ERROR_NO_PROBE_TARGET = 0x50;
export const MULTIBOOT_ERROR_NO_DLREADY = 0x60;
export const MULTIBOOT_ERROR_BOOT_FAILURE = 0x70;
export const MULTIBOOT_ERROR_HANDSHAKE_FAILURE = 0x71;

export const MULTIBOOT_CONNECTION_CHECK_WAIT = 15;
export const MULTIBOOT_SERVER_TYPE_NORMAL = 0;
export const MULTIBOOT_SERVER_TYPE_QUICK = 1;
export const MULTIBOOT_HANDSHAKE_TIMEOUT = 400;

export const SIO_MULTI_MODE = 0x2000;
export const SIO_115200_BPS = 0x0003;
export const SIO_MULTI_SI = 0x0004;
export const SIO_MULTI_SD = 0x0008;
export const SIO_MULTI_BUSY = 0x0080;
export const SIO_ERROR = 0x0040;
export const SIO_ID = 0x0030;
export const SIO_START = 0x0080;

export interface MultiBootParam {
  system_work: number[];
  handshake_data: number;
  handshake_timeout: number;
  probe_count: number;
  client_data: number[];
  palette_data: number;
  response_bit: number;
  client_bit: number;
  boot_srcp: Uint8Array | null;
  boot_endp: number;
  masterp: Uint8Array;
  sendflag: number;
  probe_target_bit: number;
  check_wait: number;
  server_type: number;
}

export interface MultiBootRuntime {
  regRCNT: number;
  regSIOCNT: number;
  regSIODATA8: number;
  sioMulti: number[];
  requiredData: number[];
  sentData: number[];
  waitSendDoneCalls: number;
  waitCyclesCalls: number[];
  biosMultiBootReturn: number;
}

export const createMultiBootParam = (overrides: Partial<MultiBootParam> = {}): MultiBootParam => ({
  system_work: overrides.system_work ?? [0, 0, 0, 0, 0],
  handshake_data: overrides.handshake_data ?? 0,
  handshake_timeout: overrides.handshake_timeout ?? 0,
  probe_count: overrides.probe_count ?? 0,
  client_data: overrides.client_data ?? Array(MULTIBOOT_NCHILD).fill(0),
  palette_data: overrides.palette_data ?? 0,
  response_bit: overrides.response_bit ?? 0,
  client_bit: overrides.client_bit ?? 0,
  boot_srcp: overrides.boot_srcp ?? null,
  boot_endp: overrides.boot_endp ?? 0,
  masterp: overrides.masterp ?? new Uint8Array(0x200),
  sendflag: overrides.sendflag ?? 0,
  probe_target_bit: overrides.probe_target_bit ?? 0,
  check_wait: overrides.check_wait ?? 0,
  server_type: overrides.server_type ?? MULTIBOOT_SERVER_TYPE_NORMAL
});

export const createMultiBootRuntime = (
  overrides: Partial<MultiBootRuntime> = {}
): MultiBootRuntime => ({
  regRCNT: overrides.regRCNT ?? 0,
  regSIOCNT: overrides.regSIOCNT ?? SIO_MULTI_SD,
  regSIODATA8: overrides.regSIODATA8 ?? 0,
  sioMulti: overrides.sioMulti ?? [0, 0xffff, 0xffff, 0xffff],
  requiredData: overrides.requiredData ?? Array(MULTIBOOT_NCHILD).fill(0),
  sentData: overrides.sentData ?? [],
  waitSendDoneCalls: overrides.waitSendDoneCalls ?? 0,
  waitCyclesCalls: overrides.waitCyclesCalls ?? [],
  biosMultiBootReturn: overrides.biosMultiBootReturn ?? 0
});

const u8 = (value: number): number => value & 0xff;
const u16 = (value: number): number => value & 0xffff;

export function MultiBootInit(runtime: MultiBootRuntime, mp: MultiBootParam): void {
  mp.client_bit = 0;
  mp.probe_count = 0;
  mp.response_bit = 0;
  mp.check_wait = MULTIBOOT_CONNECTION_CHECK_WAIT;
  mp.sendflag = 0;
  mp.handshake_timeout = 0;
  runtime.regRCNT = 0;
  runtime.regSIOCNT = SIO_MULTI_MODE | SIO_115200_BPS;
  runtime.regSIODATA8 = 0;
}

export function MultiBootCheckComplete(mp: MultiBootParam): boolean {
  return mp.probe_count === 0xe9;
}

export function MultiBootSend(
  runtime: MultiBootRuntime,
  mp: MultiBootParam,
  data: number
): number {
  const i = runtime.regSIOCNT & (SIO_MULTI_BUSY | SIO_MULTI_SD | SIO_MULTI_SI);
  if (i !== SIO_MULTI_SD) {
    MultiBootInit(runtime, mp);
    return i ^ SIO_MULTI_SD;
  }
  runtime.regSIODATA8 = u16(data);
  runtime.sentData.push(runtime.regSIODATA8);
  runtime.regSIOCNT = SIO_MULTI_MODE | SIO_START | SIO_115200_BPS;
  mp.sendflag = 1;
  return 0;
}

export function MultiBootStartProbe(runtime: MultiBootRuntime, mp: MultiBootParam): void {
  if (mp.probe_count !== 0) {
    MultiBootInit(runtime, mp);
    return;
  }
  mp.check_wait = 0;
  mp.client_bit = 0;
  mp.probe_count = 1;
}

export function MultiBootStartMaster(
  runtime: MultiBootRuntime,
  mp: MultiBootParam,
  srcp: Uint8Array,
  length: number,
  paletteColor: number,
  paletteSpeed: number
): void {
  let i = 0;
  if (mp.probe_count !== 0 || mp.client_bit === 0 || mp.check_wait !== 0) {
    MultiBootInit(runtime, mp);
    return;
  }
  mp.boot_srcp = srcp;
  const alignedLength = (length + 15) & ~15;
  if (alignedLength < MULTIBOOT_SEND_SIZE_MIN || alignedLength > MULTIBOOT_SEND_SIZE_MAX) {
    MultiBootInit(runtime, mp);
    return;
  }
  mp.boot_endp = alignedLength;
  switch (paletteSpeed) {
    case -4:
    case -3:
    case -2:
    case -1:
      i = (paletteColor << 3) | (3 - paletteSpeed);
      break;
    case 0:
      i = 0x38 | paletteColor;
      break;
    case 1:
    case 2:
    case 3:
    case 4:
      i = (paletteColor << 3) | (paletteSpeed - 1);
      break;
  }
  mp.palette_data = u8(((i & 0x3f) << 1) | 0x81);
  mp.probe_count = 0xd0;
}

const biosMultiBoot = (runtime: MultiBootRuntime): number => runtime.biosMultiBootReturn;

export function MultiBootWaitCycles(runtime: MultiBootRuntime, cycles: number): void {
  runtime.waitCyclesCalls.push(cycles >>> 0);
}

export function MultiBootWaitSendDone(runtime: MultiBootRuntime): void {
  runtime.waitSendDoneCalls += 1;
  MultiBootWaitCycles(runtime, 600);
  runtime.regSIOCNT = SIO_MULTI_SD;
}

export function MultiBootHandShake(
  runtime: MultiBootRuntime,
  mp: MultiBootParam
): number {
  const sendDataIndex = 0;
  const mustDataIndex = 1;
  switch (mp.probe_count) {
    case 0xe0:
      mp.probe_count = 0xe1;
      mp.system_work[mustDataIndex] = 0x0000;
      mp.system_work[sendDataIndex] = 0x100000;
      return MultiBootSend(runtime, mp, 0x0000);
    case 0xe7:
    case 0xe8:
      for (let i = MULTIBOOT_NCHILD; i !== 0; i -= 1) {
        const j = runtime.sioMulti[i];
        if ((mp.client_bit & (1 << i)) && j !== mp.system_work[mustDataIndex]) {
          MultiBootInit(runtime, mp);
          return MULTIBOOT_ERROR_HANDSHAKE_FAILURE;
        }
      }
      mp.probe_count += 1;
      if (mp.probe_count === 0xe9) {
        return 0;
      }
      mp.system_work[sendDataIndex] = mp.masterp[0xae] | (mp.masterp[0xaf] << 8);
      mp.system_work[mustDataIndex] = mp.system_work[sendDataIndex];
      return MultiBootSend(runtime, mp, mp.system_work[sendDataIndex]);
    default:
      for (let i = MULTIBOOT_NCHILD; i !== 0; i -= 1) {
        const j = runtime.sioMulti[i];
        if ((mp.client_bit & (1 << i)) && j !== mp.system_work[mustDataIndex]) {
          mp.probe_count = 0xe1;
          mp.system_work[mustDataIndex] = 0x0000;
          mp.system_work[sendDataIndex] = 0x100000;
          return MultiBootSend(runtime, mp, 0x0000);
        }
      }
      mp.probe_count += 1;
      mp.system_work[mustDataIndex] = mp.system_work[sendDataIndex] & 0xffff;
      if (mp.system_work[sendDataIndex] === 0x0000) {
        mp.system_work[mustDataIndex] = mp.masterp[0xac] | (mp.masterp[0xad] << 8);
        mp.system_work[sendDataIndex] = mp.system_work[mustDataIndex] << 5;
      }
      mp.system_work[sendDataIndex] >>>= 5;
      return MultiBootSend(runtime, mp, mp.system_work[sendDataIndex]);
  }
}

export function MultiBootMain(
  runtime: MultiBootRuntime,
  mp: MultiBootParam
): number {
  while (true) {
    if (MultiBootCheckComplete(mp)) {
      return 0;
    }
    if (mp.check_wait > MULTIBOOT_CONNECTION_CHECK_WAIT) {
      mp.check_wait -= 1;
      return 0;
    }

    if (mp.sendflag) {
      mp.sendflag = 0;
      const i = runtime.regSIOCNT & (SIO_MULTI_BUSY | SIO_ERROR | SIO_ID | SIO_MULTI_SD | SIO_MULTI_SI);
      if (i !== SIO_MULTI_SD) {
        MultiBootInit(runtime, mp);
        return i ^ SIO_MULTI_SD;
      }
    }

    if (mp.probe_count >= 0xe0) {
      const handshakeResult = MultiBootHandShake(runtime, mp);
      if (handshakeResult) return handshakeResult;
      if (mp.server_type === MULTIBOOT_SERVER_TYPE_QUICK && mp.probe_count > 0xe1 && !MultiBootCheckComplete(mp)) {
        MultiBootWaitSendDone(runtime);
        continue;
      }
      if (!MultiBootCheckComplete(mp)) {
        if (mp.handshake_timeout === 0) {
          MultiBootInit(runtime, mp);
          return MULTIBOOT_ERROR_HANDSHAKE_FAILURE;
        }
        mp.handshake_timeout -= 1;
      }
      return 0;
    }

    switch (mp.probe_count) {
      case 0: {
        let k = 0x0e;
        for (let i = MULTIBOOT_NCHILD; i !== 0; i -= 1) {
          if (runtime.sioMulti[i] !== 0xffff) break;
          k >>= 1;
        }
        k &= 0x0e;
        mp.response_bit = u8(k);
        for (let i = MULTIBOOT_NCHILD; i !== 0; i -= 1) {
          const j = runtime.sioMulti[i];
          if (mp.client_bit & (1 << i)) {
            if (j !== ((MULTIBOOT_CLIENT_INFO << 8) | (1 << i))) {
              k = 0;
              break;
            }
          }
        }
        mp.client_bit &= k;
        if (k === 0) mp.check_wait = MULTIBOOT_CONNECTION_CHECK_WAIT;
        if (mp.check_wait) {
          mp.check_wait -= 1;
        } else if (mp.response_bit !== mp.client_bit) {
          MultiBootStartProbe(runtime, mp);
          mp.probe_target_bit = 0;
          for (let i = MULTIBOOT_NCHILD; i !== 0; i -= 1) {
            let j = runtime.sioMulti[i];
            if ((j >> 8) === MULTIBOOT_CLIENT_INFO) {
              runtime.requiredData[i - 1] = j;
              j &= 0xff;
              if (j === (1 << i)) mp.probe_target_bit |= j;
            }
          }
          if (mp.response_bit !== mp.probe_target_bit) {
            return MultiBootSend(runtime, mp, (MULTIBOOT_MASTER_INFO << 8) | mp.client_bit);
          }
          mp.probe_count = 2;
          return MultiBootSend(runtime, mp, (MULTIBOOT_MASTER_START_PROBE << 8) | mp.probe_target_bit);
        }
        return MultiBootSend(runtime, mp, (MULTIBOOT_MASTER_INFO << 8) | mp.client_bit);
      }
      case 1:
        mp.probe_target_bit = 0;
        for (let i = MULTIBOOT_NCHILD; i !== 0; i -= 1) {
          let j = runtime.sioMulti[i];
          if ((j >> 8) === MULTIBOOT_CLIENT_INFO) {
            runtime.requiredData[i - 1] = j;
            j &= 0xff;
            if (j === (1 << i)) mp.probe_target_bit |= j;
          }
        }
        if (mp.response_bit !== mp.probe_target_bit) {
          return MultiBootSend(runtime, mp, (MULTIBOOT_MASTER_INFO << 8) | mp.client_bit);
        }
        mp.probe_count = 2;
        return MultiBootSend(runtime, mp, (MULTIBOOT_MASTER_START_PROBE << 8) | mp.probe_target_bit);
      case 2:
        for (let i = MULTIBOOT_NCHILD; i !== 0; i -= 1) {
          if (mp.probe_target_bit & (1 << i)) {
            const j = runtime.sioMulti[i];
            if (j !== runtime.requiredData[i - 1]) mp.probe_target_bit ^= 1 << i;
          }
        }
        break;
      case 0xd0: {
        let k = 1;
        for (let i = MULTIBOOT_NCHILD; i !== 0; i -= 1) {
          const j = runtime.sioMulti[i];
          mp.client_data[i - 1] = u8(j);
          if (mp.probe_target_bit & (1 << i)) {
            if ((j >> 8) !== MULTIBOOT_CLIENT_INFO && (j >> 8) !== MULTIBOOT_CLIENT_DLREADY) {
              MultiBootInit(runtime, mp);
              return MULTIBOOT_ERROR_NO_DLREADY;
            }
            if (j === runtime.requiredData[i - 1]) k = 0;
          }
        }
        if (k === 0) {
          return MultiBootSend(runtime, mp, (MULTIBOOT_MASTER_REQUEST_DLREADY << 8) | mp.palette_data);
        }
        mp.probe_count = 0xd1;
        k = 0x11;
        for (let i = MULTIBOOT_NCHILD; i !== 0; i -= 1) k += mp.client_data[i - 1];
        mp.handshake_data = u8(k);
        return MultiBootSend(runtime, mp, (MULTIBOOT_MASTER_START_DL << 8) | (k & 0xff));
      }
      case 0xd1: {
        for (let i = MULTIBOOT_NCHILD; i !== 0; i -= 1) {
          const j = runtime.sioMulti[i];
          if (mp.probe_target_bit & (1 << i)) {
            if ((j >> 8) !== MULTIBOOT_CLIENT_DLREADY) {
              MultiBootInit(runtime, mp);
              return MULTIBOOT_ERROR_NO_DLREADY;
            }
          }
        }
        const bootResult = biosMultiBoot(runtime);
        if (bootResult === 0) {
          mp.probe_count = 0xe0;
          mp.handshake_timeout = MULTIBOOT_HANDSHAKE_TIMEOUT;
          return 0;
        }
        MultiBootInit(runtime, mp);
        mp.check_wait = MULTIBOOT_CONNECTION_CHECK_WAIT * 2;
        return MULTIBOOT_ERROR_BOOT_FAILURE;
      }
      default:
        for (let i = MULTIBOOT_NCHILD; i !== 0; i -= 1) {
          if (mp.probe_target_bit & (1 << i)) {
            const j = runtime.sioMulti[i];
            if ((j >> 8) !== (MULTIBOOT_MASTER_START_PROBE + 1 - (mp.probe_count >> 1)) || ((j & 0xff) !== (1 << i))) {
              mp.probe_target_bit ^= 1 << i;
            }
          }
        }
        if (mp.probe_count === 0xc4) {
          mp.client_bit = mp.probe_target_bit & 0x0e;
          mp.probe_count = 0;
          return MultiBootSend(runtime, mp, (MULTIBOOT_MASTER_INFO << 8) | mp.client_bit);
        }
        break;
    }

    if (mp.probe_target_bit === 0) {
      MultiBootInit(runtime, mp);
      return MULTIBOOT_ERROR_NO_PROBE_TARGET;
    }
    mp.probe_count += 2;
    if (mp.probe_count === 0xc4) {
      return MultiBootSend(runtime, mp, (MULTIBOOT_MASTER_INFO << 8) | mp.client_bit);
    }
    const result = MultiBootSend(runtime, mp, (mp.masterp[mp.probe_count - 4 + 1] << 8) | mp.masterp[mp.probe_count - 4]);
    if (result) return result;
    if (mp.server_type === MULTIBOOT_SERVER_TYPE_QUICK) {
      MultiBootWaitSendDone(runtime);
      continue;
    }
    return 0;
  }
}
