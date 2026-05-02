import { describe, expect, it } from 'vitest';
import {
  A_BUTTON,
  AgbMain,
  AgbMainLoopIteration,
  B_BUTTON,
  BuildDateTime,
  CallCallbacks,
  ClearPokemonCrySongs,
  DisableVBlankCounter1,
  DoSoftReset,
  EnableVCountIntrAtLine150,
  GetGeneratedTrainerIdLower,
  HBlankIntr,
  INTR_FLAG_HBLANK,
  INTR_FLAG_SERIAL,
  INTR_FLAG_VBLANK,
  INTR_FLAG_VCOUNT,
  InitIntrHandlers,
  InitKeys,
  InitMainCallbacks,
  KEYS_MASK,
  L_BUTTON,
  OPTIONS_BUTTON_MODE_L_EQUALS_A,
  REG_OFFSET_DISPSTAT,
  RESET_ALL,
  RESET_SIO_REGS,
  ReadKeys,
  RestoreSerialTimer3IntrHandlers,
  SELECT_BUTTON,
  START_BUTTON,
  SeedRngAndSetTrainerId,
  SerialIntr,
  SetHBlankCallback,
  SetMainCallback2,
  SetSerialCallback,
  SetVBlankCallback,
  SetVBlankCounter1Ptr,
  SetVCountCallback,
  StartTimer1,
  VBlankIntr,
  VCountIntr,
  VERSION_FIRE_RED,
  WaitForVBlank,
  createMainRuntime,
  gGameLanguage,
  gGameVersion,
  LANGUAGE_ENGLISH,
  QL_PLAYBACK_STATE_STOPPED,
} from '../src/game/decompMain';

describe('decompMain', () => {
  it('exports the same FireRed version constants and fixed build date', () => {
    expect(gGameVersion).toBe(VERSION_FIRE_RED);
    expect(gGameLanguage).toBe(LANGUAGE_ENGLISH);
    expect(BuildDateTime).toBe('2004 04 26 11:20');
  });

  it('InitKeys and ReadKeys preserve raw/remapped key and repeat behavior', () => {
    const runtime = createMainRuntime();
    runtime.gSaveBlock2Ptr = runtime.gSaveBlock2;
    runtime.gSaveBlock2.optionsButtonMode = OPTIONS_BUTTON_MODE_L_EQUALS_A;
    runtime.gMain.watchedKeysMask = A_BUTTON;

    InitKeys(runtime);
    expect(runtime.gKeyRepeatContinueDelay).toBe(5);
    expect(runtime.gKeyRepeatStartDelay).toBe(40);

    runtime.REG_KEYINPUT = KEYS_MASK ^ L_BUTTON;
    ReadKeys(runtime);
    expect(runtime.gMain.heldKeysRaw).toBe(L_BUTTON);
    expect(runtime.gMain.newKeysRaw).toBe(L_BUTTON);
    expect(runtime.gMain.newKeys).toBe(L_BUTTON | A_BUTTON);
    expect(runtime.gMain.heldKeys).toBe(L_BUTTON | A_BUTTON);
    expect(runtime.gMain.newAndRepeatedKeys).toBe(L_BUTTON);
    expect(runtime.gMain.watchedKeysPressed).toBe(true);
    expect(runtime.gMain.keyRepeatCounter).toBe(40);

    runtime.gMain.keyRepeatCounter = 1;
    runtime.REG_KEYINPUT = KEYS_MASK ^ L_BUTTON;
    ReadKeys(runtime);
    expect(runtime.gMain.newKeysRaw).toBe(0);
    expect(runtime.gMain.newAndRepeatedKeys).toBe(0);
    expect(runtime.gMain.keyRepeatCounter).toBe(40);

    runtime.gSaveBlock2.optionsButtonMode = 0;
    runtime.gMain.heldKeys = A_BUTTON;
    runtime.gMain.heldKeysRaw = A_BUTTON;
    runtime.gMain.keyRepeatCounter = 1;
    runtime.REG_KEYINPUT = KEYS_MASK ^ A_BUTTON;
    ReadKeys(runtime);
    expect(runtime.gMain.newAndRepeatedKeys).toBe(A_BUTTON);
    expect(runtime.gMain.keyRepeatCounter).toBe(5);

    runtime.gMain.keyRepeatCounter = 0;
    ReadKeys(runtime);
    expect(runtime.gMain.keyRepeatCounter).toBe(0xffff);
    expect(runtime.gMain.newAndRepeatedKeys).toBe(0);
  });

  it('SetMainCallback2 resets state and callback gates match CallCallbacks', () => {
    const runtime = createMainRuntime();
    const calls: string[] = [];
    runtime.gMain.state = 9;
    runtime.gMain.callback1 = () => calls.push('callback1');
    const callback2 = () => calls.push('callback2');

    SetMainCallback2(runtime, callback2);
    expect(runtime.gMain.callback2).toBe(callback2);
    expect(runtime.gMain.state).toBe(0);

    runtime.runSaveFailedScreenResult = true;
    CallCallbacks(runtime);
    expect(calls).toEqual([]);

    runtime.runSaveFailedScreenResult = false;
    runtime.runHelpSystemCallbackResult = true;
    CallCallbacks(runtime);
    expect(calls).toEqual([]);

    runtime.runHelpSystemCallbackResult = false;
    CallCallbacks(runtime);
    expect(calls).toEqual(['callback1', 'callback2']);
  });

  it('InitMainCallbacks wires save blocks and boot callback exactly like main.c', () => {
    const runtime = createMainRuntime();
    runtime.gMain.vblankCounter1 = { value: 7 };
    runtime.gMain.vblankCounter2 = 99;
    runtime.gMain.callback1 = () => {};
    runtime.gSaveBlock2.encryptionKey = 123;
    runtime.gQuestLogPlaybackState = 44;

    InitMainCallbacks(runtime);

    expect(runtime.gMain.vblankCounter1).toBeNull();
    expect(runtime.gMain.vblankCounter2).toBe(0);
    expect(runtime.gMain.callback1).toBeNull();
    expect(runtime.gMain.callback2).not.toBeNull();
    expect(runtime.gSaveBlock1Ptr).toBe(runtime.gSaveBlock1);
    expect(runtime.gSaveBlock2Ptr).toBe(runtime.gSaveBlock2);
    expect(runtime.gSaveBlock2.encryptionKey).toBe(0);
    expect(runtime.gQuestLogPlaybackState).toBe(QL_PLAYBACK_STATE_STOPPED);
  });

  it('timer/trainer id helpers and VCount interrupt setup mirror register writes', () => {
    const runtime = createMainRuntime();
    runtime.REG_TM1CNT_L = 0x12345;

    StartTimer1(runtime);
    expect(runtime.REG_TM1CNT_H).toBe(0x80);

    SeedRngAndSetTrainerId(runtime);
    expect(runtime.log).toContain('SeedRng:9029');
    expect(runtime.REG_TM1CNT_H).toBe(0);
    expect(GetGeneratedTrainerIdLower(runtime)).toBe(0x2345);

    runtime.gpuRegs.set(REG_OFFSET_DISPSTAT, 0x12ab);
    EnableVCountIntrAtLine150(runtime);
    expect(runtime.gpuRegs.get(REG_OFFSET_DISPSTAT)).toBe((0xab | (150 << 8) | 0x20) & 0xffff);
    expect(runtime.enabledInterrupts & INTR_FLAG_VCOUNT).toBe(INTR_FLAG_VCOUNT);
  });

  it('interrupt initialization, callbacks, and VBlank side effects follow main.c order', () => {
    const runtime = createMainRuntime();
    const counter = { value: 7 };
    const calls: string[] = [];
    runtime.gSoundInfo.pcmDmaCounter = 23;
    runtime.REG_VCOUNT = 88;

    InitIntrHandlers(runtime);
    expect(runtime.gIntrTable).toHaveLength(14);
    expect(runtime.INTR_VECTOR).toBe(runtime.IntrMain_Buffer);
    expect(runtime.REG_IME).toBe(1);
    expect(runtime.enabledInterrupts & INTR_FLAG_VBLANK).toBe(INTR_FLAG_VBLANK);

    SetVBlankCounter1Ptr(runtime, counter);
    SetVBlankCallback(runtime, () => calls.push('vblank'));
    VBlankIntr(runtime);
    expect(counter.value).toBe(8);
    expect(calls).toEqual(['vblank']);
    expect(runtime.gMain.vblankCounter2).toBe(1);
    expect(runtime.gPcmDmaCounter).toBe(23);
    expect(runtime.sVcountBeforeSound).toBe(88);
    expect(runtime.sVcountAfterSound).toBe(88);
    expect(runtime.INTR_CHECK & INTR_FLAG_VBLANK).toBe(INTR_FLAG_VBLANK);
    expect(runtime.gMain.intrCheck & INTR_FLAG_VBLANK).toBe(INTR_FLAG_VBLANK);
    expect(runtime.log.slice(0, 7)).toEqual([
      'LinkVSync',
      'CopyBufferedValuesToGpuRegs',
      'ProcessDma3Requests',
      'm4aSoundMain',
      'TryReceiveLinkBattleData',
      'Random',
      'UpdateWirelessStatusIndicatorSprite',
    ]);

    DisableVBlankCounter1(runtime);
    expect(runtime.gMain.vblankCounter1).toBeNull();
  });

  it('HBlank, VCount, Serial, and restore handlers update the matching interrupt bits', () => {
    const runtime = createMainRuntime();
    const calls: string[] = [];
    SetHBlankCallback(runtime, () => calls.push('hblank'));
    SetVCountCallback(runtime, () => calls.push('unused-vcount'));
    SetSerialCallback(runtime, () => calls.push('serial'));
    runtime.REG_VCOUNT = 111;

    HBlankIntr(runtime);
    VCountIntr(runtime);
    SerialIntr(runtime);

    expect(calls).toEqual(['hblank', 'serial']);
    expect(runtime.sVcountAtIntr).toBe(111);
    expect(runtime.INTR_CHECK & INTR_FLAG_HBLANK).toBe(INTR_FLAG_HBLANK);
    expect(runtime.INTR_CHECK & INTR_FLAG_VCOUNT).toBe(INTR_FLAG_VCOUNT);
    expect(runtime.INTR_CHECK & INTR_FLAG_SERIAL).toBe(INTR_FLAG_SERIAL);
    expect(runtime.log).toContain('m4aSoundVSync');

    runtime.gIntrTable[1] = () => calls.push('old-serial');
    runtime.gIntrTable[2] = () => calls.push('old-timer3');
    RestoreSerialTimer3IntrHandlers(runtime);
    runtime.gIntrTable[1](runtime);
    runtime.gIntrTable[2](runtime);
    expect(calls).toEqual(['hblank', 'serial', 'serial']);
    expect(runtime.log).toContain('Timer3Intr');
  });

  it('DoSoftReset and ClearPokemonCrySongs mirror shutdown calls and fill16 clear', () => {
    const runtime = createMainRuntime();
    runtime.REG_IME = 1;

    DoSoftReset(runtime);

    expect(runtime.REG_IME).toBe(0);
    expect(runtime.log).toEqual([
      'm4aSoundVSyncOff',
      'ScanlineEffect_Stop',
      'DmaStop:1',
      'DmaStop:2',
      'DmaStop:3',
      `SoftReset:${RESET_ALL & ~RESET_SIO_REGS}`,
    ]);

    ClearPokemonCrySongs(runtime);
    expect(runtime.gPokemonCrySongs.every((song) => song.value === 0)).toBe(true);
  });

  it('AgbMainLoopIteration follows soft-reset and link-transfer branches', () => {
    const runtime = createMainRuntime();
    const callbackTransfers: boolean[] = [];
    runtime.gSaveBlock2Ptr = runtime.gSaveBlock2;
    runtime.gMain.callback1 = () => callbackTransfers.push(runtime.gLinkTransferringData);
    runtime.REG_KEYINPUT = KEYS_MASK ^ (A_BUTTON | B_BUTTON | START_BUTTON | SELECT_BUTTON);
    runtime.overworldRecvKeysFromLinkRunning = 1;
    runtime.onWaitForVBlankPoll = (rt) => {
      rt.gMain.intrCheck |= INTR_FLAG_VBLANK;
    };

    AgbMainLoopIteration(runtime);

    expect(runtime.log.slice(0, 7)).toEqual([
      'rfu_REQ_stopMode',
      'rfu_waitREQComplete',
      'm4aSoundVSyncOff',
      'ScanlineEffect_Stop',
      'DmaStop:1',
      'DmaStop:2',
      'DmaStop:3',
    ]);
    expect(runtime.log).toContain(`SoftReset:${RESET_ALL & ~RESET_SIO_REGS}`);
    expect(runtime.log).toContain('ClearSpriteCopyRequests');
    expect(callbackTransfers).toEqual([false, true]);
    expect(runtime.gLinkTransferringData).toBe(false);
    expect(runtime.gMain.newKeys).toBe(0);
    expect(runtime.log.slice(-4)).toEqual([
      'PlayTimeCounter_Update',
      'BattleTraceHarness_TryBoot',
      'BattleTraceHarness_Update',
      'MapMusicMain',
    ]);
  });

  it('AgbMain performs finite startup and exact loop bodies for tests', () => {
    const runtime = createMainRuntime();
    runtime.onWaitForVBlankPoll = (rt) => {
      rt.gMain.intrCheck |= INTR_FLAG_VBLANK;
    };

    AgbMain(runtime, 1);

    expect(runtime.gSoftResetDisabled).toBe(false);
    expect(runtime.gHelpSystemEnabled).toBe(false);
    expect(runtime.gSaveBlock1Ptr).toBe(runtime.gSaveBlock1);
    expect(runtime.gSaveBlock2Ptr).toBe(runtime.gSaveBlock2);
    expect(runtime.gMain.callback2).not.toBeNull();
    expect(runtime.enabledInterrupts & INTR_FLAG_VBLANK).toBe(INTR_FLAG_VBLANK);
    expect(runtime.enabledInterrupts & INTR_FLAG_VCOUNT).toBe(INTR_FLAG_VCOUNT);
    expect(runtime.log.filter((entry) => entry === 'BattleTraceHarness_TryBoot')).toHaveLength(2);
  });

  it('WaitForVBlank clears the bit before polling and throws if no interrupt arrives', () => {
    const runtime = createMainRuntime();
    runtime.gMain.intrCheck = INTR_FLAG_VBLANK;
    runtime.onWaitForVBlankPoll = (rt, polls) => {
      if (polls === 2) {
        rt.gMain.intrCheck |= INTR_FLAG_VBLANK;
      }
    };

    WaitForVBlank(runtime);
    expect(runtime.gMain.intrCheck & INTR_FLAG_VBLANK).toBe(INTR_FLAG_VBLANK);

    const stuck = createMainRuntime();
    stuck.waitForVBlankPollLimit = 1;
    expect(() => WaitForVBlank(stuck)).toThrow('WaitForVBlank poll limit reached');
  });

  it('send-keys link branch wraps the single callback pass in transfer state', () => {
    const runtime = createMainRuntime();
    const transfers: boolean[] = [];
    runtime.gMain.callback1 = () => transfers.push(runtime.gLinkTransferringData);
    runtime.overworldSendKeysToLinkRunning = true;
    runtime.onWaitForVBlankPoll = (rt) => {
      rt.gMain.intrCheck |= INTR_FLAG_VBLANK;
    };

    AgbMainLoopIteration(runtime);

    expect(transfers).toEqual([true]);
    expect(runtime.gLinkTransferringData).toBe(false);
  });
});
