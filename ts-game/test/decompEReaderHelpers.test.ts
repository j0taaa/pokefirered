import { describe, expect, test } from 'vitest';
import {
  B_BUTTON,
  CloseSerial,
  DetermineSendRecvState,
  DisableTm3,
  EReaderHandleTransfer,
  EReaderHelper_ClearsSendRecvMgr,
  EReaderHelper_RestoreRegsState,
  EReaderHelper_SaveRegsState,
  EReaderHelper_SerialCallback,
  EReaderHelper_Timer3Callback,
  EReader_Recv,
  EReader_Send,
  EREADER_CANCEL_KEY,
  EREADER_CANCEL_KEY_MASK,
  EREADER_CANCEL_SHIFT,
  EREADER_CANCEL_TIMEOUT_MASK,
  EREADER_CHECKSUM_ERR,
  EREADER_CHECKSUM_OK,
  EREADER_CHECKSUM_OK_MASK,
  EREADER_XFER_CHK,
  EREADER_XFER_EXE,
  EREADER_XFR_STATE_CHECKSUM,
  EREADER_XFR_STATE_DONE,
  EREADER_XFR_STATE_HANDSHAKE,
  EREADER_XFR_STATE_INIT,
  EREADER_XFR_STATE_START,
  EREADER_XFR_STATE_TRANSFER,
  EREADER_XFR_STATE_TRANSFER_DONE,
  EnableSio,
  GetKeyInput,
  INTR_FLAG_SERIAL,
  INTR_FLAG_TIMER3,
  OpenSerial32,
  OpenSerialMulti,
  SIO_115200_BPS,
  SIO_32BIT_MODE,
  SIO_38400_BPS,
  SIO_ENABLE,
  SIO_INTR_ENABLE,
  SIO_MULTI_MODE,
  SIO_MULTI_SD,
  TIMER_ENABLE,
  TIMER_INTR_ENABLE,
  SetUpTransferManager,
  StartTm3,
  closeSerial,
  createEReaderRuntime,
  determineSendRecvState,
  disableTm3,
  eReaderHandleTransfer,
  eReaderHelperClearsSendRecvMgr,
  eReaderHelperRestoreRegsState,
  eReaderHelperSaveRegsState,
  eReaderHelperSerialCallback,
  eReaderHelperTimer3Callback,
  eReaderRecv,
  eReaderSend,
  enableSio,
  getKeyInput,
  openSerial32,
  openSerialMulti,
  setUpTransferManager,
  startTm3
} from '../src/game/decompEReaderHelpers';

describe('decomp ereader_helpers', () => {
  test('exports exact C names as aliases of the implemented e-Reader helper logic', () => {
    expect(EReader_Send).toBe(eReaderSend);
    expect(EReader_Recv).toBe(eReaderRecv);
    expect(CloseSerial).toBe(closeSerial);
    expect(OpenSerialMulti).toBe(openSerialMulti);
    expect(OpenSerial32).toBe(openSerial32);
    expect(EReaderHandleTransfer).toBe(eReaderHandleTransfer);
    expect(DetermineSendRecvState).toBe(determineSendRecvState);
    expect(SetUpTransferManager).toBe(setUpTransferManager);
    expect(StartTm3).toBe(startTm3);
    expect(EReaderHelper_Timer3Callback).toBe(eReaderHelperTimer3Callback);
    expect(EReaderHelper_SerialCallback).toBe(eReaderHelperSerialCallback);
    expect(EnableSio).toBe(enableSio);
    expect(DisableTm3).toBe(disableTm3);
    expect(GetKeyInput).toBe(getKeyInput);
    expect(EReaderHelper_SaveRegsState).toBe(eReaderHelperSaveRegsState);
    expect(EReaderHelper_RestoreRegsState).toBe(eReaderHelperRestoreRegsState);
    expect(EReaderHelper_ClearsSendRecvMgr).toBe(eReaderHelperClearsSendRecvMgr);
  });

  test('open/close serial routines preserve register bit operations from C', () => {
    const runtime = createEReaderRuntime();
    runtime.regs.REG_IE = 0xffff;
    runtime.mgr.state = EREADER_XFR_STATE_INIT;

    openSerialMulti(runtime);
    expect(runtime.regs.REG_RCNT).toBe(0);
    expect(runtime.regs.REG_SIOCNT).toBe(SIO_MULTI_MODE | SIO_INTR_ENABLE | SIO_115200_BPS);
    expect(runtime.regs.REG_IE & INTR_FLAG_SERIAL).toBe(INTR_FLAG_SERIAL);

    openSerial32(runtime);
    expect(runtime.regs.REG_SIOCNT).toBe(SIO_INTR_ENABLE | SIO_32BIT_MODE | SIO_MULTI_SD);
    expect(runtime.gShouldAdvanceLinkState).toBe(0);
    expect(runtime.sCounter1).toBe(0);
    expect(runtime.sCounter2).toBe(0);

    closeSerial(runtime);
    expect(runtime.regs.REG_SIOCNT).toBe(0);
    expect(runtime.regs.REG_TM3CNT_H).toBe(0);
    expect(runtime.regs.REG_IF).toBe(INTR_FLAG_TIMER3 | INTR_FLAG_SERIAL);
    expect(runtime.regs.REG_IE & (INTR_FLAG_TIMER3 | INTR_FLAG_SERIAL)).toBe(0);
  });

  test('EReaderHandleTransfer initializes, handshakes, starts transfer, cancels by key, and closes serial', () => {
    const runtime = createEReaderRuntime();

    expect(eReaderHandleTransfer(runtime, 1, 8, [11, 22], null)).toBe(EREADER_XFER_EXE);
    expect(runtime.mgr.state).toBe(EREADER_XFR_STATE_HANDSHAKE);

    runtime.regs.REG_SIOCNT = SIO_MULTI_SD;
    expect(eReaderHandleTransfer(runtime, 1, 8, [11, 22], null)).toBe(EREADER_XFER_EXE);
    expect(runtime.mgr.master_slave).toBe(1);
    expect(runtime.regs.REG_SIOCNT & SIO_ENABLE).toBe(SIO_ENABLE);

    runtime.gShouldAdvanceLinkState = 2;
    expect(eReaderHandleTransfer(runtime, 1, 8, [11, 22], null)).toBe(EREADER_XFER_EXE | (EREADER_CANCEL_KEY << EREADER_CANCEL_SHIFT));
    expect(runtime.mgr.state).toBe(EREADER_XFR_STATE_DONE);
    expect(eReaderHandleTransfer(runtime, 1, 8, [11, 22], null)).toBe(EREADER_CANCEL_KEY_MASK);
    expect(runtime.mgr.xferState).toBe(0);
  });

  test('DetermineSendRecvState only elects master when SD is set and mode is send', () => {
    const runtime = createEReaderRuntime();
    runtime.regs.REG_SIOCNT = SIO_MULTI_SD;
    expect(determineSendRecvState(runtime, 1)).toBe(1);
    expect(runtime.mgr.master_slave).toBe(1);
    expect(determineSendRecvState(runtime, 0)).toBe(0);
    runtime.regs.REG_SIOCNT = 0;
    expect(determineSendRecvState(runtime, 1)).toBe(0);
  });

  test('SetUpTransferManager sends size, word count, baud, dataptr, and starts timer in master mode', () => {
    const runtime = createEReaderRuntime();
    runtime.mgr.master_slave = 1;
    runtime.regs.REG_IE = 0;

    setUpTransferManager(runtime, 8, [0x11111111, 0x22222222], null);

    expect(runtime.regs.REG_SIOCNT & SIO_38400_BPS).toBe(SIO_38400_BPS);
    expect(runtime.regs.REG_SIODATA32).toBe(8);
    expect(runtime.mgr.size).toBe(3);
    expect(runtime.mgr.dataptr).toEqual([0x11111111, 0x22222222]);
    expect(runtime.regs.REG_TM3CNT_L).toBe(0xfda7);
    expect(runtime.regs.REG_TM3CNT_H).toBe(TIMER_INTR_ENABLE);
    expect(runtime.regs.REG_IE & INTR_FLAG_TIMER3).toBe(INTR_FLAG_TIMER3);
  });

  test('SetUpTransferManager stores recv buffer and 9600 baud path in slave mode', () => {
    const runtime = createEReaderRuntime();
    const dest = [0, 0];
    runtime.mgr.master_slave = 0;

    setUpTransferManager(runtime, 0, null, dest);

    expect(runtime.regs.REG_SIOCNT & SIO_38400_BPS).toBe(0);
    expect(runtime.mgr.dataptr).toBe(dest);
  });

  test('Serial callback handshake requires exactly two CCD0 responses and no non-FFFF noise', () => {
    const runtime = createEReaderRuntime();
    runtime.mgr.state = EREADER_XFR_STATE_HANDSHAKE;
    runtime.regs.REG_SIOMLT_RECV = [0xccd0, 0xffff, 0xccd0, 0xffff];

    eReaderHelperSerialCallback(runtime);

    expect(runtime.regs.REG_SIOMLT_SEND).toBe(0xccd0);
    expect(runtime.mgr.state).toBe(EREADER_XFR_STATE_START);

    runtime.mgr.state = EREADER_XFR_STATE_HANDSHAKE;
    runtime.regs.REG_SIOMLT_RECV = [0xccd0, 0x1234, 0xccd0, 0xffff];
    eReaderHelperSerialCallback(runtime);
    expect(runtime.mgr.state).toBe(EREADER_XFR_STATE_HANDSHAKE);
  });

  test('Serial callback master sends payload words, accumulates checksum, then sends checksum', () => {
    const runtime = createEReaderRuntime();
    runtime.mgr.state = EREADER_XFR_STATE_TRANSFER;
    runtime.mgr.master_slave = 1;
    runtime.mgr.dataptr = [5, 7];
    runtime.mgr.size = 2;

    eReaderHelperSerialCallback(runtime);
    expect(runtime.regs.REG_SIODATA32).toBe(5);
    expect(runtime.mgr.checksum).toBe(5);
    expect(runtime.regs.REG_TM3CNT_H & TIMER_ENABLE).toBe(TIMER_ENABLE);

    eReaderHelperSerialCallback(runtime);
    expect(runtime.regs.REG_SIODATA32).toBe(7);
    expect(runtime.mgr.checksum).toBe(12);

    eReaderHelperSerialCallback(runtime);
    expect(runtime.regs.REG_SIODATA32).toBe(12);
    expect(runtime.mgr.state).toBe(EREADER_XFR_STATE_TRANSFER);

    eReaderHelperSerialCallback(runtime);
    expect(runtime.mgr.state).toBe(EREADER_XFR_STATE_TRANSFER_DONE);
    expect(runtime.sCounter1).toBe(0);
  });

  test('Serial callback slave receives size, payload, checksum OK/ERR, and resets timeout counter', () => {
    const runtime = createEReaderRuntime();
    const dest = [0, 0];
    runtime.mgr.state = EREADER_XFR_STATE_TRANSFER;
    runtime.mgr.master_slave = 0;
    runtime.mgr.dataptr = dest;
    runtime.sCounter2 = 30;

    runtime.regs.REG_SIODATA32 = 8;
    eReaderHelperSerialCallback(runtime);
    expect(runtime.mgr.size).toBe(3);
    expect(runtime.sCounter2).toBe(0);

    runtime.regs.REG_SIODATA32 = 4;
    eReaderHelperSerialCallback(runtime);
    runtime.regs.REG_SIODATA32 = 6;
    eReaderHelperSerialCallback(runtime);
    runtime.regs.REG_SIODATA32 = 10;
    eReaderHelperSerialCallback(runtime);
    expect(dest).toEqual([4, 6, 10]);
    runtime.regs.REG_SIODATA32 = 20;
    eReaderHelperSerialCallback(runtime);
    expect(runtime.mgr.checksumResult).toBe(EREADER_CHECKSUM_OK);

    const errRuntime = createEReaderRuntime();
    errRuntime.mgr.state = EREADER_XFR_STATE_TRANSFER;
    errRuntime.mgr.master_slave = 0;
    errRuntime.mgr.dataptr = [0];
    errRuntime.mgr.size = 1;
    errRuntime.mgr.cursor = 2;
    errRuntime.mgr.checksum = 3;
    errRuntime.regs.REG_SIODATA32 = 9;
    eReaderHelperSerialCallback(errRuntime);
    expect(errRuntime.mgr.checksumResult).toBe(EREADER_CHECKSUM_ERR);
  });

  test('transfer/checksum states timeout and checksum callback resolves done state', () => {
    const runtime = createEReaderRuntime();
    runtime.mgr.state = EREADER_XFR_STATE_TRANSFER;
    runtime.mgr.master_slave = 0;
    runtime.sCounter2 = 60;
    expect(eReaderHandleTransfer(runtime, 0, 0, null, [])).toBe(EREADER_XFER_CHK | EREADER_CANCEL_TIMEOUT_MASK);
    expect(runtime.mgr.state).toBe(EREADER_XFR_STATE_DONE);

    const checksumRuntime = createEReaderRuntime();
    checksumRuntime.mgr.state = EREADER_XFR_STATE_TRANSFER_DONE;
    checksumRuntime.mgr.xferState = EREADER_XFER_CHK;
    eReaderHandleTransfer(checksumRuntime, 0, 0, null, []);
    expect(checksumRuntime.mgr.state).toBe(EREADER_XFR_STATE_CHECKSUM);

    checksumRuntime.sCounter1 = 60;
    expect(eReaderHandleTransfer(checksumRuntime, 0, 0, null, [])).toBe(EREADER_XFER_CHK | EREADER_CANCEL_TIMEOUT_MASK);

    const okRuntime = createEReaderRuntime();
    okRuntime.mgr.state = EREADER_XFR_STATE_CHECKSUM;
    okRuntime.mgr.master_slave = 1;
    okRuntime.regs.REG_SIOMLT_RECV = [0xffff, EREADER_CHECKSUM_OK, 0xffff, 0xffff];
    eReaderHelperSerialCallback(okRuntime);
    expect(okRuntime.mgr.checksumResult).toBe(EREADER_CHECKSUM_OK);
    expect(okRuntime.mgr.state).toBe(EREADER_XFR_STATE_DONE);
  });

  test('timer callback disables timer and enables SIO', () => {
    const runtime = createEReaderRuntime();
    runtime.regs.REG_TM3CNT_H = TIMER_ENABLE | TIMER_INTR_ENABLE;

    eReaderHelperTimer3Callback(runtime);

    expect(runtime.regs.REG_TM3CNT_H & TIMER_ENABLE).toBe(0);
    expect(runtime.regs.REG_TM3CNT_L).toBe(0xfda7);
    expect(runtime.regs.REG_SIOCNT & SIO_ENABLE).toBe(SIO_ENABLE);

    startTm3(runtime);
    disableTm3(runtime);
    expect(runtime.regs.REG_TM3CNT_H & TIMER_ENABLE).toBe(0);
    enableSio(runtime);
    expect(runtime.regs.REG_SIOCNT & SIO_ENABLE).toBe(SIO_ENABLE);
  });

  test('GetKeyInput calculates new key edges from inverted REG_KEYINPUT', () => {
    const runtime = createEReaderRuntime();
    runtime.regs.REG_KEYINPUT = 0x03ff ^ B_BUTTON;
    getKeyInput(runtime);
    expect(runtime.sJoyNew).toBe(B_BUTTON);
    expect(runtime.sJoyNewOrRepeated).toBe(B_BUTTON);
    getKeyInput(runtime);
    expect(runtime.sJoyNew).toBe(0);
  });

  test('save/restore register state and clear manager mirror helpers', () => {
    const runtime = createEReaderRuntime();
    runtime.regs.REG_IME = 3;
    runtime.regs.REG_IE = 4;
    runtime.regs.REG_TM3CNT_H = 5;
    runtime.regs.REG_SIOCNT = 6;
    runtime.regs.REG_RCNT = 7;
    eReaderHelperSaveRegsState(runtime);

    runtime.regs.REG_IME = 30;
    runtime.regs.REG_IE = 40;
    runtime.regs.REG_TM3CNT_H = 50;
    runtime.regs.REG_SIOCNT = 60;
    runtime.regs.REG_RCNT = 70;
    eReaderHelperRestoreRegsState(runtime);
    expect(runtime.regs).toMatchObject({ REG_IME: 3, REG_IE: 4, REG_TM3CNT_H: 5, REG_SIOCNT: 6, REG_RCNT: 7 });

    runtime.mgr.state = EREADER_XFR_STATE_DONE;
    runtime.mgr.checksum = 99;
    eReaderHelperClearsSendRecvMgr(runtime);
    expect(runtime.mgr.state).toBe(EREADER_XFR_STATE_INIT);
    expect(runtime.mgr.checksum).toBe(0);
  });

  test('blocking send and recv return canceled, timeout, and success statuses then clear manager and restore regs', () => {
    const canceled = createEReaderRuntime();
    canceled.regs.REG_KEYINPUT = 0x03ff ^ B_BUTTON;
    canceled.regs.REG_IE = 123;
    expect(eReaderSend(canceled, 4, [1])).toBe(2);
    expect(canceled.mgr.state).toBe(EREADER_XFR_STATE_INIT);
    expect(canceled.regs.REG_IE).toBe(123);

    const timeout = createEReaderRuntime();
    timeout.maxBlockingIterations = 1;
    expect(eReaderRecv(timeout, [])).toBe(2);
    expect(timeout.vblankWaits).toBe(1);

    const success = createEReaderRuntime();
    success.mgr.xferState = 0;
    success.mgr.checksumResult = EREADER_CHECKSUM_OK;
    success.mgr.state = EREADER_XFR_STATE_DONE;
    expect(eReaderSend(success, 4, [1])).toBe(0);
    expect(success.sSendRecvStatus).toBe(EREADER_CHECKSUM_OK_MASK);
  });
});
