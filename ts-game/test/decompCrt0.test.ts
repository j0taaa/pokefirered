import { describe, expect, test } from 'vitest';
import {
  CRT0_INTERRUPT_NAMES,
  CRT0_INTERRUPT_PRIORITY,
  INTR_FLAG_DMA0,
  INTR_FLAG_GAMEPAK,
  INTR_FLAG_HBLANK,
  INTR_FLAG_SERIAL,
  INTR_FLAG_TIMER0,
  INTR_FLAG_TIMER1,
  INTR_FLAG_TIMER3,
  INTR_FLAG_VBLANK,
  INTR_FLAG_VCOUNT,
  INTR_VECTOR,
  PSR_IRQ_MODE,
  PSR_SYS_MODE,
  createCrt0Runtime,
  intr_main,
  makeDefaultIntrTable,
  sp_irq,
  sp_usr,
  start_vector
} from '../src/game/decompCrt0';

describe('decomp crt0.s parity', () => {
  test('start_vector switches IRQ/SYS modes, installs intr_main, calls AgbMain, and loops', () => {
    const runtime = createCrt0Runtime();
    start_vector(runtime);
    expect(runtime.spIrq).toBe(sp_irq);
    expect(runtime.spUsr).toBe(sp_usr);
    expect(runtime.cpsr).toBe(PSR_SYS_MODE);
    expect(runtime.intrVector).toBe('intr_main');
    expect(runtime.agbMainCalls).toBe(1);
    expect(runtime.operations).toEqual([
      `msr cpsr_cf:${PSR_IRQ_MODE}`,
      `ldr sp:sp_irq:${sp_irq}`,
      `msr cpsr_cf:${PSR_SYS_MODE}`,
      `ldr sp:sp_usr:${sp_usr}`,
      `str intr_main:[${INTR_VECTOR}]`,
      'bx AgbMain',
      'b start_vector'
    ]);
  });

  test('interrupt priority table follows the exact crt0 scan order and offsets', () => {
    expect(CRT0_INTERRUPT_NAMES).toEqual([
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
    ]);
    expect(CRT0_INTERRUPT_PRIORITY).toEqual([
      INTR_FLAG_VCOUNT,
      INTR_FLAG_SERIAL,
      INTR_FLAG_TIMER3,
      INTR_FLAG_HBLANK,
      INTR_FLAG_VBLANK,
      INTR_FLAG_TIMER0,
      INTR_FLAG_TIMER1,
      1 << 5,
      INTR_FLAG_DMA0,
      1 << 9,
      1 << 10,
      1 << 11,
      1 << 12,
      INTR_FLAG_GAMEPAK
    ]);
  });

  test('intr_main dispatches the highest-priority requested interrupt and restores IE/IME', () => {
    const runtime = createCrt0Runtime();
    runtime.gIntrTable = makeDefaultIntrTable();
    runtime.regIE = INTR_FLAG_VBLANK | INTR_FLAG_SERIAL | INTR_FLAG_TIMER1;
    runtime.regIF = INTR_FLAG_VBLANK | INTR_FLAG_SERIAL | INTR_FLAG_TIMER1;
    runtime.regIME = 1;
    runtime.spsr = 0x1234;
    runtime.gSTWIStatusTimerId = 1;

    const result = intr_main(runtime);
    expect(result).toMatchObject({
      handled: true,
      spunOnGamePak: false,
      interruptFlag: INTR_FLAG_SERIAL,
      interruptName: 'SERIAL',
      tableOffset: 4,
      restoredIME: 1
    });
    expect(runtime.regIF).toBe(INTR_FLAG_SERIAL);
    expect(runtime.handlerCalls).toEqual(['SERIAL']);
    expect(runtime.regIE).toBe(INTR_FLAG_VBLANK | INTR_FLAG_TIMER1);
    expect(result.temporaryIE).toBe(INTR_FLAG_TIMER1);
    expect(runtime.spsr).toBe(0x1234);
  });

  test('VCOUNT is checked before crt0 re-enables IME, while later priorities set IME to 1 during scan', () => {
    const vcount = createCrt0Runtime();
    vcount.gIntrTable = makeDefaultIntrTable();
    vcount.regIE = INTR_FLAG_VCOUNT;
    vcount.regIF = INTR_FLAG_VCOUNT;
    vcount.regIME = 0;
    const vcountResult = intr_main(vcount);
    expect(vcountResult.interruptName).toBe('VCOUNT');
    expect(vcountResult.restoredIME).toBe(0);
    expect(vcount.operations).not.toContain('scan enabled IME');

    const serial = createCrt0Runtime();
    serial.gIntrTable = makeDefaultIntrTable();
    serial.regIE = INTR_FLAG_SERIAL;
    serial.regIF = INTR_FLAG_SERIAL;
    serial.regIME = 0;
    const serialResult = intr_main(serial);
    expect(serialResult.interruptName).toBe('SERIAL');
    expect(serial.regIME).toBe(0);
    expect(serialResult.tableOffset).toBe(4);
  });

  test('temporary IE mask allows STWI timer slot plus serial, timer3, vcount, hblank, and gamepak only', () => {
    const runtime = createCrt0Runtime();
    runtime.gIntrTable = makeDefaultIntrTable();
    runtime.regIE = INTR_FLAG_HBLANK | INTR_FLAG_VBLANK | INTR_FLAG_TIMER0 | INTR_FLAG_TIMER1 | INTR_FLAG_TIMER3 | INTR_FLAG_GAMEPAK;
    runtime.regIF = INTR_FLAG_VBLANK;
    runtime.regIME = 1;
    runtime.gSTWIStatusTimerId = 0;

    const result = intr_main(runtime);
    expect(result.interruptName).toBe('VBLANK');
    expect(result.temporaryIE).toBe(INTR_FLAG_HBLANK | INTR_FLAG_TIMER0 | INTR_FLAG_TIMER3 | INTR_FLAG_GAMEPAK);
    expect(result.restoredIE).toBe(INTR_FLAG_HBLANK | INTR_FLAG_TIMER0 | INTR_FLAG_TIMER1 | INTR_FLAG_TIMER3 | INTR_FLAG_GAMEPAK);
  });

  test('GAMEPAK writes SOUNDCNT_X low byte and spins without dispatching a handler', () => {
    const runtime = createCrt0Runtime();
    runtime.gIntrTable = makeDefaultIntrTable();
    runtime.regIE = INTR_FLAG_GAMEPAK;
    runtime.regIF = INTR_FLAG_GAMEPAK;
    runtime.regIME = 1;
    const result = intr_main(runtime);
    expect(result).toMatchObject({
      handled: false,
      spunOnGamePak: true,
      interruptFlag: INTR_FLAG_GAMEPAK,
      interruptName: 'GAMEPAK',
      tableOffset: 52
    });
    expect(runtime.regSoundCntX).toBe(0);
    expect(runtime.handlerCalls).toEqual([]);
    expect(runtime.operations).toContain('loop:bne loop');
  });

  test('no requested enabled interrupt leaves registers alone after the scan path', () => {
    const runtime = createCrt0Runtime();
    runtime.regIE = INTR_FLAG_VBLANK;
    runtime.regIF = INTR_FLAG_SERIAL;
    runtime.regIME = 1;
    const result = intr_main(runtime);
    expect(result.handled).toBe(false);
    expect(result.interruptName).toBe(null);
    expect(runtime.regIE).toBe(INTR_FLAG_VBLANK);
    expect(runtime.regIF).toBe(INTR_FLAG_SERIAL);
    expect(runtime.regIME).toBe(1);
  });
});
