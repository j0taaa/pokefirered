import { describe, expect, test } from 'vitest';
import {
  MULTIBOOT_CLIENT_DLREADY,
  MULTIBOOT_CLIENT_INFO,
  MULTIBOOT_CONNECTION_CHECK_WAIT,
  MULTIBOOT_ERROR_BOOT_FAILURE,
  MULTIBOOT_ERROR_HANDSHAKE_FAILURE,
  MULTIBOOT_ERROR_NO_DLREADY,
  MULTIBOOT_ERROR_NO_PROBE_TARGET,
  MULTIBOOT_HANDSHAKE_TIMEOUT,
  MULTIBOOT_MASTER_REQUEST_DLREADY,
  MULTIBOOT_MASTER_START_DL,
  MULTIBOOT_MASTER_START_PROBE,
  MULTIBOOT_SEND_SIZE_MAX,
  MULTIBOOT_SEND_SIZE_MIN,
  MULTIBOOT_SERVER_TYPE_QUICK,
  MultiBootCheckComplete,
  MultiBootHandShake,
  MultiBootInit,
  MultiBootMain,
  MultiBootSend,
  MultiBootStartMaster,
  MultiBootStartProbe,
  SIO_115200_BPS,
  SIO_MULTI_MODE,
  SIO_MULTI_SD,
  SIO_MULTI_SI,
  SIO_START,
  createMultiBootParam,
  createMultiBootRuntime
} from '../src/game/decompMultiboot';

describe('decomp multiboot', () => {
  test('MultiBootInit resets state and serial registers', () => {
    const runtime = createMultiBootRuntime({ regSIOCNT: 999, regSIODATA8: 123 });
    const mp = createMultiBootParam({ client_bit: 7, probe_count: 3, sendflag: 1, handshake_timeout: 9 });

    MultiBootInit(runtime, mp);

    expect(mp).toMatchObject({
      client_bit: 0,
      probe_count: 0,
      response_bit: 0,
      check_wait: MULTIBOOT_CONNECTION_CHECK_WAIT,
      sendflag: 0,
      handshake_timeout: 0
    });
    expect(runtime.regSIOCNT).toBe(SIO_MULTI_MODE | SIO_115200_BPS);
    expect(runtime.regSIODATA8).toBe(0);
  });

  test('MultiBootSend writes SIODATA8 and reports line-state errors exactly', () => {
    const runtime = createMultiBootRuntime({ regSIOCNT: SIO_MULTI_SD });
    const mp = createMultiBootParam();

    expect(MultiBootSend(runtime, mp, 0x1234)).toBe(0);
    expect(runtime.regSIODATA8).toBe(0x1234);
    expect(runtime.sentData).toEqual([0x1234]);
    expect(runtime.regSIOCNT).toBe(SIO_MULTI_MODE | SIO_START | SIO_115200_BPS);
    expect(mp.sendflag).toBe(1);

    const bad = createMultiBootRuntime({ regSIOCNT: SIO_MULTI_SI });
    expect(MultiBootSend(bad, mp, 1)).toBe(SIO_MULTI_SI ^ SIO_MULTI_SD);
    expect(mp.probe_count).toBe(0);
    expect(mp.check_wait).toBe(MULTIBOOT_CONNECTION_CHECK_WAIT);
  });

  test('probe and master setup validate state, length bounds, alignment, and palette encoding', () => {
    const runtime = createMultiBootRuntime();
    const mp = createMultiBootParam({ probe_count: 1 });
    MultiBootStartProbe(runtime, mp);
    expect(mp.probe_count).toBe(0);

    const ready = createMultiBootParam({ client_bit: 0x0e, check_wait: 0 });
    MultiBootStartMaster(runtime, ready, new Uint8Array(0x101), 0x101, 4, 1);
    expect(ready.boot_endp).toBe(0x110);
    expect(ready.palette_data).toBe((((4 << 3) | 0) & 0x3f) << 1 | 0x81);
    expect(ready.probe_count).toBe(0xd0);

    const invalid = createMultiBootParam({ client_bit: 0x0e, check_wait: 0 });
    MultiBootStartMaster(runtime, invalid, new Uint8Array(1), MULTIBOOT_SEND_SIZE_MIN - 17, 1, 0);
    expect(invalid.probe_count).toBe(0);
    expect(invalid.check_wait).toBe(MULTIBOOT_CONNECTION_CHECK_WAIT);

    const tooLarge = createMultiBootParam({ client_bit: 0x0e, check_wait: 0 });
    MultiBootStartMaster(runtime, tooLarge, new Uint8Array(1), MULTIBOOT_SEND_SIZE_MAX + 1, 1, -4);
    expect(tooLarge.probe_count).toBe(0);
  });

  test('MultiBootMain sends master info while waiting and starts probe when clients respond', () => {
    const runtime = createMultiBootRuntime({
      regSIOCNT: SIO_MULTI_SD,
      sioMulti: [0, (MULTIBOOT_CLIENT_INFO << 8) | 2, (MULTIBOOT_CLIENT_INFO << 8) | 4, 0xffff]
    });
    const mp = createMultiBootParam({ check_wait: 0 });

    expect(MultiBootMain(runtime, mp)).toBe(0);
    expect(mp.probe_count).toBe(2);
    expect(mp.probe_target_bit).toBe(0x06);
    expect(runtime.sentData.at(-1)).toBe((MULTIBOOT_MASTER_START_PROBE << 8) | 0x06);
  });

  test('probe header path drops mismatched children and errors when no target remains', () => {
    const runtime = createMultiBootRuntime({ regSIOCNT: SIO_MULTI_SD, sioMulti: [0, 0, 0, 0] });
    runtime.requiredData[0] = (MULTIBOOT_CLIENT_INFO << 8) | 2;
    const mp = createMultiBootParam({ probe_count: 2, probe_target_bit: 0x02 });

    expect(MultiBootMain(runtime, mp)).toBe(MULTIBOOT_ERROR_NO_PROBE_TARGET);
    expect(mp.probe_count).toBe(0);
  });

  test('download-ready states request readiness, start download, boot, or return the matching errors', () => {
    const runtime = createMultiBootRuntime({
      regSIOCNT: SIO_MULTI_SD,
      sioMulti: [0, (MULTIBOOT_CLIENT_INFO << 8) | 2, 0xffff, 0xffff]
    });
    runtime.requiredData[0] = (MULTIBOOT_CLIENT_INFO << 8) | 2;
    const mp = createMultiBootParam({ probe_count: 0xd0, probe_target_bit: 0x02, palette_data: 0xab });
    expect(MultiBootMain(runtime, mp)).toBe(0);
    expect(runtime.sentData.at(-1)).toBe((MULTIBOOT_MASTER_REQUEST_DLREADY << 8) | 0xab);

    runtime.regSIOCNT = SIO_MULTI_SD;
    runtime.sioMulti[1] = (MULTIBOOT_CLIENT_DLREADY << 8) | 2;
    expect(MultiBootMain(runtime, mp)).toBe(0);
    expect(mp.probe_count).toBe(0xd1);
    expect(runtime.sentData.at(-1)! >> 8).toBe(MULTIBOOT_MASTER_START_DL);

    runtime.regSIOCNT = SIO_MULTI_SD;
    expect(MultiBootMain(runtime, mp)).toBe(0);
    expect(mp.probe_count).toBe(0xe0);
    expect(mp.handshake_timeout).toBe(MULTIBOOT_HANDSHAKE_TIMEOUT);

    const badReady = createMultiBootParam({ probe_count: 0xd0, probe_target_bit: 0x02 });
    expect(MultiBootMain(createMultiBootRuntime({ sioMulti: [0, 0x1200, 0xffff, 0xffff] }), badReady)).toBe(MULTIBOOT_ERROR_NO_DLREADY);

    const bootFail = createMultiBootRuntime({ sioMulti: [0, (MULTIBOOT_CLIENT_DLREADY << 8) | 2, 0xffff, 0xffff], biosMultiBootReturn: 1 });
    const bootMp = createMultiBootParam({ probe_count: 0xd1, probe_target_bit: 0x02 });
    expect(MultiBootMain(bootFail, bootMp)).toBe(MULTIBOOT_ERROR_BOOT_FAILURE);
    expect(bootMp.check_wait).toBe(MULTIBOOT_CONNECTION_CHECK_WAIT * 2);
  });

  test('handshake path sends shifted data, completes at e9, and handles failures/timeouts', () => {
    const runtime = createMultiBootRuntime({ regSIOCNT: SIO_MULTI_SD });
    const mp = createMultiBootParam({ probe_count: 0xe0, client_bit: 0x02, handshake_timeout: 2 });
    expect(MultiBootHandShake(runtime, mp)).toBe(0);
    expect(mp.probe_count).toBe(0xe1);
    expect(runtime.sentData.at(-1)).toBe(0);

    runtime.regSIOCNT = SIO_MULTI_SD;
    runtime.sioMulti[1] = 0;
    expect(MultiBootHandShake(runtime, mp)).toBe(0);
    expect(mp.probe_count).toBe(0xe2);
    expect(mp.system_work[1]).toBe(0);

    const complete = createMultiBootParam({ probe_count: 0xe8, client_bit: 0 });
    expect(MultiBootHandShake(runtime, complete)).toBe(0);
    expect(complete.probe_count).toBe(0xe9);
    expect(MultiBootCheckComplete(complete)).toBe(true);

    const fail = createMultiBootParam({ probe_count: 0xe7, client_bit: 0x02, system_work: [0, 0x1234, 0, 0, 0] });
    runtime.sioMulti[1] = 0;
    expect(MultiBootHandShake(runtime, fail)).toBe(MULTIBOOT_ERROR_HANDSHAKE_FAILURE);

    runtime.regSIOCNT = SIO_MULTI_SD;
    const timeout = createMultiBootParam({ probe_count: 0xe1, client_bit: 0, handshake_timeout: 0 });
    expect(MultiBootMain(runtime, timeout)).toBe(MULTIBOOT_ERROR_HANDSHAKE_FAILURE);
  });

  test('quick mode waits for send completion and rechecks child replies during header sends', () => {
    const masterp = new Uint8Array(0x200);
    masterp[1] = 0x12;
    masterp[2] = 0x34;
    const runtime = createMultiBootRuntime({
      regSIOCNT: SIO_MULTI_SD,
      sioMulti: [0, (MULTIBOOT_MASTER_START_PROBE << 8) | 2, 0xffff, 0xffff]
    });
    const mp = createMultiBootParam({
      probe_count: 2,
      probe_target_bit: 0x02,
      server_type: MULTIBOOT_SERVER_TYPE_QUICK,
      masterp
    });
    runtime.requiredData[0] = (MULTIBOOT_MASTER_START_PROBE << 8) | 2;

    expect(MultiBootMain(runtime, mp)).toBe(MULTIBOOT_ERROR_NO_PROBE_TARGET);
    expect(runtime.waitSendDoneCalls).toBeGreaterThan(0);
    expect(runtime.waitCyclesCalls).toContain(600);
  });
});
