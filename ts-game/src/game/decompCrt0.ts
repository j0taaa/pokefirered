export const PSR_IRQ_MODE = 0x12;
export const PSR_SYS_MODE = 0x1f;
export const PSR_I_BIT = 0x80;
export const PSR_F_BIT = 0x40;
export const PSR_MODE_MASK = 0x1f;

export const IWRAM_START = 0x03000000;
export const IWRAM_END = IWRAM_START + 0x8000;
export const INTR_VECTOR = 0x03007ffc;

export const INTR_FLAG_VBLANK = 1 << 0;
export const INTR_FLAG_HBLANK = 1 << 1;
export const INTR_FLAG_VCOUNT = 1 << 2;
export const INTR_FLAG_TIMER0 = 1 << 3;
export const INTR_FLAG_TIMER1 = 1 << 4;
export const INTR_FLAG_TIMER2 = 1 << 5;
export const INTR_FLAG_TIMER3 = 1 << 6;
export const INTR_FLAG_SERIAL = 1 << 7;
export const INTR_FLAG_DMA0 = 1 << 8;
export const INTR_FLAG_DMA1 = 1 << 9;
export const INTR_FLAG_DMA2 = 1 << 10;
export const INTR_FLAG_DMA3 = 1 << 11;
export const INTR_FLAG_KEYPAD = 1 << 12;
export const INTR_FLAG_GAMEPAK = 1 << 13;

export const CRT0_INTERRUPT_PRIORITY = [
  INTR_FLAG_VCOUNT,
  INTR_FLAG_SERIAL,
  INTR_FLAG_TIMER3,
  INTR_FLAG_HBLANK,
  INTR_FLAG_VBLANK,
  INTR_FLAG_TIMER0,
  INTR_FLAG_TIMER1,
  INTR_FLAG_TIMER2,
  INTR_FLAG_DMA0,
  INTR_FLAG_DMA1,
  INTR_FLAG_DMA2,
  INTR_FLAG_DMA3,
  INTR_FLAG_KEYPAD,
  INTR_FLAG_GAMEPAK
] as const;

export type Crt0InterruptName =
  | 'VCOUNT'
  | 'SERIAL'
  | 'TIMER3'
  | 'HBLANK'
  | 'VBLANK'
  | 'TIMER0'
  | 'TIMER1'
  | 'TIMER2'
  | 'DMA0'
  | 'DMA1'
  | 'DMA2'
  | 'DMA3'
  | 'KEYPAD'
  | 'GAMEPAK';

export const CRT0_INTERRUPT_NAMES: readonly Crt0InterruptName[] = [
  'VCOUNT',
  'SERIAL',
  'TIMER3',
  'HBLANK',
  'VBLANK',
  'TIMER0',
  'TIMER1',
  'TIMER2',
  'DMA0',
  'DMA1',
  'DMA2',
  'DMA3',
  'KEYPAD',
  'GAMEPAK'
] as const;

export interface Crt0Runtime {
  cpsr: number;
  spsr: number;
  spIrq: number;
  spUsr: number;
  intrVector: string | null;
  regIE: number;
  regIF: number;
  regIME: number;
  regSoundCntX: number;
  gSTWIStatusTimerId: number;
  gIntrTable: Array<((runtime: Crt0Runtime) => void) | null>;
  agbMainCalls: number;
  handlerCalls: Crt0InterruptName[];
  operations: string[];
}

export interface IntrMainResult {
  handled: boolean;
  spunOnGamePak: boolean;
  interruptFlag: number;
  interruptName: Crt0InterruptName | null;
  tableOffset: number;
  temporaryIE: number;
  restoredIE: number;
  restoredIME: number;
}

export const createCrt0Runtime = (): Crt0Runtime => ({
  cpsr: 0,
  spsr: 0,
  spIrq: 0,
  spUsr: 0,
  intrVector: null,
  regIE: 0,
  regIF: 0,
  regIME: 0,
  regSoundCntX: 0,
  gSTWIStatusTimerId: 0,
  gIntrTable: Array.from({ length: CRT0_INTERRUPT_PRIORITY.length }, () => null),
  agbMainCalls: 0,
  handlerCalls: [],
  operations: []
});

const u16 = (value: number): number => value & 0xffff;
const record = (runtime: Crt0Runtime, op: string): void => {
  runtime.operations.push(op);
};

export const sp_usr = IWRAM_END - 0x1c0;
export const sp_irq = IWRAM_END - 0x60;

export const start_vector = (runtime: Crt0Runtime): void => {
  runtime.cpsr = PSR_IRQ_MODE;
  runtime.spIrq = sp_irq;
  record(runtime, `msr cpsr_cf:${PSR_IRQ_MODE}`);
  record(runtime, `ldr sp:sp_irq:${sp_irq}`);
  runtime.cpsr = PSR_SYS_MODE;
  runtime.spUsr = sp_usr;
  record(runtime, `msr cpsr_cf:${PSR_SYS_MODE}`);
  record(runtime, `ldr sp:sp_usr:${sp_usr}`);
  runtime.intrVector = 'intr_main';
  record(runtime, `str intr_main:[${INTR_VECTOR}]`);
  runtime.agbMainCalls += 1;
  record(runtime, 'bx AgbMain');
  record(runtime, 'b start_vector');
};

export const makeDefaultIntrTable = (): Array<(runtime: Crt0Runtime) => void> =>
  CRT0_INTERRUPT_NAMES.map((name) => (runtime: Crt0Runtime) => {
    runtime.handlerCalls.push(name);
    record(runtime, `handler:${name}`);
  });

export const intr_main = (runtime: Crt0Runtime): IntrMainResult => {
  const combinedIeIf = (u16(runtime.regIE) | (u16(runtime.regIF) << 16)) >>> 0;
  const savedIme = u16(runtime.regIME);
  const savedSpsr = runtime.spsr;
  record(runtime, `push:{spsr,r0-r3,lr}:${savedSpsr}`);
  runtime.regIME = 0;

  const requested = u16(combinedIeIf & (combinedIeIf >>> 16));
  let tableOffset = 0;
  let interruptFlag = 0;
  let interruptName: Crt0InterruptName | null = null;

  for (let i = 0; i < CRT0_INTERRUPT_PRIORITY.length; i += 1) {
    const flag = CRT0_INTERRUPT_PRIORITY[i];
    if ((requested & flag) !== 0) {
      interruptFlag = flag;
      interruptName = CRT0_INTERRUPT_NAMES[i];
      break;
    }
    if (i === 0) {
      runtime.regIME = 1;
    }
    tableOffset += 4;
  }

  if (interruptFlag === INTR_FLAG_GAMEPAK) {
    runtime.regSoundCntX = INTR_FLAG_GAMEPAK & 0xff;
    record(runtime, 'strb GAMEPAK:REG_SOUNDCNT_X');
    record(runtime, 'loop:bne loop');
    return {
      handled: false,
      spunOnGamePak: true,
      interruptFlag,
      interruptName,
      tableOffset,
      temporaryIE: runtime.regIE,
      restoredIE: runtime.regIE,
      restoredIME: runtime.regIME
    };
  }

  if (interruptFlag === 0) {
    return {
      handled: false,
      spunOnGamePak: false,
      interruptFlag: 0,
      interruptName: null,
      tableOffset,
      temporaryIE: runtime.regIE,
      restoredIE: runtime.regIE,
      restoredIME: runtime.regIME
    };
  }

  runtime.regIF = interruptFlag;
  const clearedCombined = (combinedIeIf & ~interruptFlag) >>> 0;
  const stwiTimerMask = (INTR_FLAG_TIMER0 << runtime.gSTWIStatusTimerId) | INTR_FLAG_GAMEPAK;
  const nestedMask = stwiTimerMask | INTR_FLAG_SERIAL | INTR_FLAG_TIMER3 | INTR_FLAG_VCOUNT | INTR_FLAG_HBLANK;
  const temporaryIE = u16(clearedCombined & nestedMask);
  runtime.regIE = temporaryIE;
  record(runtime, `strh IF:${interruptFlag}`);
  record(runtime, `strh IE temporary:${temporaryIE}`);

  runtime.cpsr = (runtime.cpsr & ~(PSR_I_BIT | PSR_F_BIT | PSR_MODE_MASK)) | PSR_SYS_MODE;
  const tableIndex = tableOffset / 4;
  const handler = runtime.gIntrTable[tableIndex];
  record(runtime, `bx gIntrTable[${tableIndex}]`);
  if (handler) {
    handler(runtime);
  }

  runtime.cpsr = (runtime.cpsr & ~(PSR_I_BIT | PSR_F_BIT | PSR_MODE_MASK)) | PSR_I_BIT | PSR_IRQ_MODE;
  runtime.regIE = u16(clearedCombined);
  runtime.regIME = savedIme;
  runtime.spsr = savedSpsr;
  record(runtime, `restore IE:${runtime.regIE}`);
  record(runtime, `restore IME:${runtime.regIME}`);
  record(runtime, `restore SPSR:${runtime.spsr}`);

  return {
    handled: true,
    spunOnGamePak: false,
    interruptFlag,
    interruptName,
    tableOffset,
    temporaryIE,
    restoredIE: runtime.regIE,
    restoredIME: runtime.regIME
  };
};
