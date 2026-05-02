import { describe, expect, test } from 'vitest';
import {
  RFU_USER_NAME_LENGTH,
  SLOOP_SVC,
  SVC4B_EXIT_EARLY,
  SVC4B_RESEED_RNG,
  call_svc_BadWordCheck,
  createSloopSvcRuntime,
  setSloopSvcReturnValue,
  svc_40,
  svc_41,
  svc_42,
  svc_43,
  svc_44,
  svc_45_rfu_link_status,
  svc_47,
  svc_49,
  svc_4a,
  svc_4b,
  svc_4f,
  svc_50,
  svc_51,
  svc_53,
  svc_BadWordCheck,
  svc_CommsAllowedByParentalControls,
  svc_FinishSave,
  svc_IncrementLinkError,
  svc_ReplaceSector,
  svc_SetActivity,
  svc_SetSaveBlock2,
  svc_SetStarter,
  svc_WriteSector,
  svc_stubbed
} from '../src/game/decompSloopSvc';

describe('decomp Sloop SVC', () => {
  test('svc_47 copies the exact fixed RFU fields and stores the RFU link status pointer', () => {
    const rfuLinkStatus = { connected: true };
    const runtime = createSloopSvcRuntime({
      hostRfuGameData: Uint8Array.from(Array.from({ length: 0x20 }, (_, i) => i + 1)),
      hostRfuUsername: Uint8Array.from([90, 91, 92, 93, 94, 95, 96, 97, 98]),
      rfuLinkStatus
    });

    svc_47(runtime);

    expect([...runtime.svc47Params.hostRfuGameData]).toEqual(
      Array.from({ length: 0x10 }, (_, i) => i + 1)
    );
    expect([...runtime.svc47Params.hostRfuUsername]).toEqual([90, 91, 92, 93, 94, 95, 96, 97]);
    expect([...runtime.svc47Params.bytes]).toEqual([
      ...Array.from({ length: 0x10 }, (_, i) => i + 1),
      90, 91, 92, 93, 94, 95, 96, 97
    ]);
    expect(runtime.svcCalls).toEqual([{ svc: SLOOP_SVC.SVC_47, args: [runtime.svc47Params.bytes] }]);
    expect(runtime.sloopRfuLinkStatus).toBe(rfuLinkStatus);
  });

  test('no-argument SVC wrappers record the same syscall numbers', () => {
    const runtime = createSloopSvcRuntime();

    svc_40(runtime);
    svc_41(runtime);
    svc_42(runtime);
    svc_44(runtime);
    svc_FinishSave(runtime);
    svc_IncrementLinkError(runtime);
    svc_stubbed(runtime);

    expect(runtime.svcCalls.map((call) => call.svc)).toEqual([
      SLOOP_SVC.SVC_40,
      SLOOP_SVC.SVC_41,
      SLOOP_SVC.SVC_42,
      SLOOP_SVC.SVC_44,
      SLOOP_SVC.SVC_FINISH_SAVE,
      SLOOP_SVC.SVC_INCREMENT_LINK_ERROR
    ]);
  });

  test('argument SVC wrappers pass masked C-width values and pointer-like objects through', () => {
    const saveBlock2 = { optionsButtonMode: 1 };
    const rfuLinkStatus = { players: 2 };
    const runtime = createSloopSvcRuntime({ rfuLinkStatus });

    svc_45_rfu_link_status(runtime);
    svc_43(runtime, 0x12345);
    svc_4f(runtime, -1);
    svc_SetSaveBlock2(runtime, saveBlock2);
    svc_SetStarter(runtime, 0x100000001);
    svc_SetActivity(runtime, 0x100000002);

    expect(runtime.svcCalls).toEqual([
      { svc: SLOOP_SVC.SVC_45, args: [rfuLinkStatus] },
      { svc: SLOOP_SVC.SVC_43, args: [0x2345] },
      { svc: SLOOP_SVC.SVC_4F, args: [0xffffffff] },
      { svc: SLOOP_SVC.SVC_SET_SAVE_BLOCK2, args: [saveBlock2] },
      { svc: SLOOP_SVC.SVC_SET_STARTER, args: [1] },
      { svc: SLOOP_SVC.SVC_SET_ACTIVITY, args: [2] }
    ]);
  });

  test('returning SVC wrappers read configured r0-style return values', () => {
    const runtime = createSloopSvcRuntime();
    setSloopSvcReturnValue(runtime, SLOOP_SVC.SVC_49, 49);
    setSloopSvcReturnValue(runtime, SLOOP_SVC.SVC_4A, 0x10000004a);
    setSloopSvcReturnValue(runtime, SLOOP_SVC.SVC_4B, SVC4B_EXIT_EARLY | SVC4B_RESEED_RNG);
    setSloopSvcReturnValue(runtime, SLOOP_SVC.SVC_50, 50);
    setSloopSvcReturnValue(runtime, SLOOP_SVC.SVC_51, 51);
    setSloopSvcReturnValue(runtime, SLOOP_SVC.SVC_53, 53);
    setSloopSvcReturnValue(runtime, SLOOP_SVC.SVC_COMMS_ALLOWED_BY_PARENTAL_CONTROLS, 54);

    expect(svc_49(runtime)).toBe(49);
    expect(svc_4a(runtime)).toBe(0x4a);
    expect(svc_4b(runtime)).toBe(SVC4B_EXIT_EARLY | SVC4B_RESEED_RNG);
    expect(svc_50(runtime)).toBe(50);
    expect(svc_51(runtime)).toBe(51);
    expect(svc_53(runtime)).toBe(53);
    expect(svc_CommsAllowedByParentalControls(runtime)).toBe(54);
  });

  test('save-sector SVC wrappers pass sector bytes and snapshot the sector payload', () => {
    const runtime = createSloopSvcRuntime();
    const writeData = Uint8Array.from([1, 2, 3]);
    const replaceData = Uint8Array.from([4, 5, 6]);

    svc_WriteSector(runtime, 0x123, writeData);
    svc_ReplaceSector(runtime, 0x456, replaceData);
    writeData[0] = 99;
    replaceData[0] = 88;

    expect(runtime.svcCalls[0].svc).toBe(SLOOP_SVC.SVC_WRITE_SECTOR);
    expect(runtime.svcCalls[0].args[0]).toBe(0x23);
    expect([...(runtime.svcCalls[0].args[1] as Uint8Array)]).toEqual([1, 2, 3]);
    expect(runtime.svcCalls[1].svc).toBe(SLOOP_SVC.SVC_REPLACE_SECTOR);
    expect(runtime.svcCalls[1].args[0]).toBe(0x56);
    expect([...(runtime.svcCalls[1].args[1] as Uint8Array)]).toEqual([4, 5, 6]);
  });

  test('svc_BadWordCheck converts to ASCII, calls svc 0x4d with arg2 zero, then converts back', () => {
    const str = Uint8Array.from([10, 11, 12, 0]);
    const events: string[] = [];
    const runtime = createSloopSvcRuntime({
      pkmnStrToASCII: (dest, src) => {
        events.push('to-ascii');
        dest.fill(0);
        for (let i = 0; i < src.length; i += 1) {
          dest[i] = src[i] + 1;
        }
      },
      asciiToPkmnStr: (dest, src) => {
        events.push('to-pkmn');
        for (let i = 0; i < dest.length; i += 1) {
          dest[i] = src[i] + 2;
        }
      }
    });
    setSloopSvcReturnValue(runtime, SLOOP_SVC.SVC_BAD_WORD_CHECK, 123);

    expect(svc_BadWordCheck(runtime, str)).toBe(123);

    expect(events).toEqual(['to-ascii', 'to-pkmn']);
    expect(runtime.svcCalls).toEqual([
      { svc: SLOOP_SVC.SVC_BAD_WORD_CHECK, args: [runtime.badWordAsciiString, 0] }
    ]);
    expect([...runtime.badWordAsciiString.slice(0, 4)]).toEqual([11, 12, 13, 1]);
    expect([...str]).toEqual([13, 14, 15, 3]);
  });

  test('call_svc_BadWordCheck preserves the inline helper surface', () => {
    const runtime = createSloopSvcRuntime();
    const ascii = new Uint8Array(256);
    setSloopSvcReturnValue(runtime, SLOOP_SVC.SVC_BAD_WORD_CHECK, 7);

    expect(call_svc_BadWordCheck(runtime, ascii, -1)).toBe(7);

    expect(runtime.svcCalls).toEqual([
      { svc: SLOOP_SVC.SVC_BAD_WORD_CHECK, args: [ascii, -1] }
    ]);
  });

  test('runtime defaults mirror the C static buffer sizes', () => {
    const runtime = createSloopSvcRuntime();

    expect(runtime.hostRfuGameData).toHaveLength(0x10);
    expect(runtime.hostRfuUsername).toHaveLength(RFU_USER_NAME_LENGTH);
    expect(runtime.svc47Params.hostRfuGameData).toHaveLength(0x10);
    expect(runtime.svc47Params.hostRfuUsername).toHaveLength(RFU_USER_NAME_LENGTH);
    expect(runtime.svc47Params.bytes).toHaveLength(0x10 + RFU_USER_NAME_LENGTH);
    expect(runtime.badWordAsciiString).toHaveLength(256);
  });
});
