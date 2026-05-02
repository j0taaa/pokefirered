import {
  LE26FV10N1TS,
  LE_MAX_TIME,
  type FlashSetupInfo
} from './decompAgbFlashLe';

export { LE26FV10N1TS };

export const AGB_LIB_FLASH_VERSION = 'FLASH1M_V103';
export const WAITCNT_SRAM_MASK = 0x0003;
export const WAITCNT_SRAM_8 = 0x0003;

export const MX_MAX_TIME = LE_MAX_TIME;

export const MX29L010: FlashSetupInfo = {
  programFlashByte: 'ProgramFlashByte_MX',
  programFlashSector: 'ProgramFlashSector_MX',
  eraseFlashChip: 'EraseFlashChip_MX',
  eraseFlashSector: 'EraseFlashSector_MX',
  waitForFlashWrite: 'WaitForFlashWrite_Common',
  maxTime: MX_MAX_TIME,
  romSize: 131072,
  sector: {
    sectorSize: 4096,
    sectorShift: 12,
    sectorCount: 32,
    unused: 0
  },
  waitStateSetup: [3, 1],
  id: [0xc2, 0x09]
};

export const DEFAULT_FLASH: FlashSetupInfo = {
  ...MX29L010,
  id: [0x00, 0x00]
};

export const SETUP_INFOS = [
  MX29L010,
  LE26FV10N1TS,
  DEFAULT_FLASH
] as const;

export interface FlashRuntimeState {
  regWAITCNT: number;
  programFlashByte: string | null;
  programFlashSector: string | null;
  eraseFlashChip: string | null;
  eraseFlashSector: string | null;
  waitForFlashWrite: string | null;
  flashMaxTime: readonly number[] | null;
  flash: FlashSetupInfo | null;
  timeoutFlag: boolean;
  flashWrites: Array<{
    address: number;
    value: number;
  }>;
  timerStartedPhase: number | null;
  timerStopped: boolean;
}

export interface IdentifyFlashEnvironment {
  readFlashId: () => number;
}

export interface WaitForFlashWriteEnvironment {
  pollFlashStatus: () => number;
  startFlashTimer?: (phase: number) => void;
  stopFlashTimer?: () => void;
}

export const createFlashRuntimeState = (): FlashRuntimeState => ({
  regWAITCNT: 0,
  programFlashByte: null,
  programFlashSector: null,
  eraseFlashChip: null,
  eraseFlashSector: null,
  waitForFlashWrite: null,
  flashMaxTime: null,
  flash: null,
  timeoutFlag: false,
  flashWrites: [],
  timerStartedPhase: null,
  timerStopped: false
});

const joinedFlashId = (setupInfo: FlashSetupInfo): number =>
  ((setupInfo.id[1] << 8) | setupInfo.id[0]) & 0xffff;

const makerId = (setupInfo: FlashSetupInfo): number =>
  setupInfo.id[0] & 0xff;

const writeFlash = (
  runtime: FlashRuntimeState,
  address: number,
  value: number
): void => {
  runtime.flashWrites.push({
    address: address & 0xffff,
    value: value & 0xff
  });
};

export const identifyFlash = (
  runtime: FlashRuntimeState,
  environment: IdentifyFlashEnvironment
): 0 | 1 => {
  runtime.regWAITCNT = (runtime.regWAITCNT & ~WAITCNT_SRAM_MASK) | WAITCNT_SRAM_8;
  const flashId = environment.readFlashId() & 0xffff;

  let result: 0 | 1 = 1;
  let setupInfo: FlashSetupInfo = DEFAULT_FLASH;
  for (const candidate of SETUP_INFOS) {
    setupInfo = candidate;
    if (makerId(candidate) === 0) {
      break;
    }

    if (flashId === joinedFlashId(candidate)) {
      result = 0;
      break;
    }
  }

  runtime.programFlashByte = setupInfo.programFlashByte;
  runtime.programFlashSector = setupInfo.programFlashSector;
  runtime.eraseFlashChip = setupInfo.eraseFlashChip;
  runtime.eraseFlashSector = setupInfo.eraseFlashSector;
  runtime.waitForFlashWrite = setupInfo.waitForFlashWrite;
  runtime.flashMaxTime = setupInfo.maxTime;
  runtime.flash = setupInfo;

  return result;
};

export function IdentifyFlash(
  runtime: FlashRuntimeState,
  environment: IdentifyFlashEnvironment
): 0 | 1 {
  return identifyFlash(runtime, environment);
}

export const waitForFlashWriteCommon = (
  runtime: FlashRuntimeState,
  phase: number,
  lastData: number,
  environment: WaitForFlashWriteEnvironment
): number => {
  const normalizedPhase = phase & 0xff;
  const normalizedLastData = lastData & 0xff;
  let result = 0;

  runtime.timerStartedPhase = normalizedPhase;
  runtime.timerStopped = false;
  environment.startFlashTimer?.(normalizedPhase);

  for (;;) {
    const status = environment.pollFlashStatus() & 0xff;
    if (status === normalizedLastData) {
      break;
    }

    if ((status & 0x20) !== 0) {
      if ((environment.pollFlashStatus() & 0xff) === normalizedLastData) {
        break;
      }

      writeFlash(runtime, 0x5555, 0xf0);
      result = normalizedPhase | 0xa000;
      break;
    }

    if (runtime.timeoutFlag) {
      if ((environment.pollFlashStatus() & 0xff) === normalizedLastData) {
        break;
      }

      writeFlash(runtime, 0x5555, 0xf0);
      result = normalizedPhase | 0xc000;
      break;
    }
  }

  environment.stopFlashTimer?.();
  runtime.timerStopped = true;
  return result & 0xffff;
};

export function WaitForFlashWrite_Common(
  runtime: FlashRuntimeState,
  phase: number,
  lastData: number,
  environment: WaitForFlashWriteEnvironment
): number {
  return waitForFlashWriteCommon(runtime, phase, lastData, environment);
}
