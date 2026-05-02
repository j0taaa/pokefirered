import { describe, expect, test } from 'vitest';
import {
  BitmaskAllOtherLinkPlayers,
  BLOCK_BUFFER_SIZE,
  BLOCK_REQ_SIZE_40,
  BLOCK_REQ_SIZE_100,
  BLOCK_REQ_SIZE_200,
  BLOCK_REQ_SIZE_220,
  BLOCK_REQ_SIZE_NONE,
  BuildSendCmd,
  BATTLE_TYPE_LINK_IN_BATTLE,
  A_BUTTON,
  B_BUTTON,
  BGCNT_CHARBASE,
  BGCNT_PRIORITY,
  BGCNT_SCREENBASE,
  CB2_LinkError,
  CB2_PrintErrorMessage,
  CB2_LinkTest,
  CheckLinkPlayersMatchSaved,
  CheckMasterOrSlave,
  CheckErrorStatus,
  CheckShouldAdvanceLinkState,
  ClearLinkCallback,
  ClearLinkCallback_2,
  CloseLink,
  CMD_LENGTH,
  DequeueRecvCmds,
  BG_SCREEN_SIZE,
  DISPCNT_BG0_ON,
  DISPCNT_BG2_ON,
  DISPCNT_MODE_0,
  DISPCNT_OBJ_1D_MAP,
  DISPCNT_OBJ_ON,
  DISPCNT_OBJWIN_ON,
  DISPCNT_WIN0_ON,
  DISPCNT_WIN1_ON,
  DoesLinkPlayerCountMatchSaved,
  DisableSerial,
  DoHandshake,
  DoRecv,
  DoSend,
  EnableSerial,
  EnqueueSendCmd,
  EXCHANGE_COMPLETE,
  EXCHANGE_DIFF_SELECTIONS,
  EXCHANGE_NOT_STARTED,
  EXCHANGE_PARTNER_NOT_READY,
  EXCHANGE_PLAYER_NOT_READY,
  EXCHANGE_TIMED_OUT,
  EXCHANGE_WRONG_NUM_PLAYERS,
  EXTRACT_CONN_ESTABLISHED,
  EXTRACT_LINK_ERRORS,
  EXTRACT_MASTER,
  EXTRACT_PLAYER_COUNT,
  EXTRACT_RECEIVED_NOTHING,
  GetBerryBlenderKeySendAttempts,
  GetDummy2,
  GetLinkRecvQueueLength,
  GetBlockReceivedStatus,
  GetLinkPlayerDataExchangeStatusTimed,
  GetLinkPlayerCount,
  GetLinkPlayerCountAsBitFlags,
  GetLinkPlayerCount_2,
  GetLinkPlayerTrainerId,
  GetMultiplayerId,
  GetSavedLinkPlayerCountAsBitFlags,
  GetSavedMultiplayerId,
  GetSavedPlayerCount,
  GetSioMultiSI,
  HandleLinkConnection,
  HandleReceiveRemoteLinkPlayer,
  HasLinkErrorOccurred,
  InitBlockSend,
  InitLocalLinkPlayer,
  InitTimer,
  InitLinkTestBG,
  InitLink,
  INTR_FLAG_SERIAL,
  INTR_FLAG_TIMER3,
  IsLinkConnectionEstablished,
  IsLinkPlayerDataExchangeComplete,
  IsLinkRecvQueueAtOverworldMax,
  IsLinkMaster,
  IsSioMultiMaster,
  IsSendingKeysToLink,
  IsLinkTaskFinished,
  IsWirelessAdapterConnected,
  L_BUTTON,
  LANGUAGE_ENGLISH,
  LANGUAGE_JAPANESE,
  LAG_MASTER,
  LAG_SLAVE,
  LINK_MASTER,
  LINK_PLAYER_BLOCK_SIZE,
  LINK_PLAYER_SIZE,
  LINK_SLAVE,
  LINK_STATE_CONN_ESTABLISHED,
  LINK_STATE_HANDSHAKE,
  LINK_STATE_INIT_TIMER,
  LINK_STATE_START1,
  LINKCMD_BLENDER_NO_PBLOCK_SPACE,
  LINKCMD_BLENDER_SEND_KEYS,
  LINKCMD_CONT_BLOCK,
  LINKCMD_DUMMY_1,
  LINKCMD_DUMMY_2,
  LINKCMD_INIT_BLOCK,
  LINKCMD_NONE,
  LINKCMD_READY_CLOSE_LINK,
  LINKCMD_READY_EXIT_STANDBY,
  LINKCMD_SEND_0xEE,
  LINKCMD_SEND_BLOCK_REQ,
  LINKCMD_SEND_EMPTY,
  LINKCMD_SEND_HELD_KEYS,
  LINKCMD_SEND_ITEM,
  LINKCMD_SEND_LINK_TYPE,
  LINK_STAT_CONN_ESTABLISHED,
  LINK_STAT_ERROR_CHECKSUM,
  LINK_STAT_ERROR_INVALID_ID,
  LINK_STAT_ERROR_LAG_MASTER,
  LINK_STAT_ERROR_LAG_SLAVE,
  LINK_STAT_ERRORS,
  LINK_STAT_MASTER,
  LINK_STAT_RECEIVED_NOTHING,
  LINK_MAGIC_GAME_FREAK_INC,
  LINK_TEST_PRINT,
  LINKTYPE_TRADE,
  LINKTYPE_TRADE_SETUP,
  HEAP_SIZE,
  LoadLinkTestBgGfx,
  LinkMain1,
  LinkMain2,
  LinkPlayerFromBlock,
  LinkCB_BlockSend,
  LinkCB_BlockSendBegin,
  LinkCB_BlockSendEnd,
  LinkCB_BerryBlenderSendHeldKeys,
  LinkCB_ReadyCloseLink,
  LinkCB_SendHeldKeys,
  LinkCB_Standby,
  LinkCB_StandbyForAll,
  LinkCB_WaitCloseLink,
  LinkVSync,
  LinkTestCalcBlockChecksum,
  LinkTest_PrintChar,
  LinkTest_PrintHex,
  LinkTest_PrintNumChar,
  LinkTest_PrintString,
  LinkTestProcessKeyInput,
  LinkTestScreen,
  LocalLinkPlayerToBlock,
  MASTER_HANDSHAKE,
  MAX_LINK_PLAYERS,
  MAX_RFU_PLAYERS,
  OVERWORLD_RECV_QUEUE_MAX,
  PLAYER_NAME_LENGTH,
  OpenLink,
  OpenLinkTimed,
  PALETTES_ALL,
  ProcessRecvCmds,
  QUEUE_CAPACITY,
  QUEUE_FULL_SEND,
  R_BUTTON,
  RFU_ID,
  REG_OFFSET_BG1CNT,
  REG_OFFSET_BG0HOFS,
  REG_OFFSET_BG0VOFS,
  REG_OFFSET_BG1HOFS,
  REG_OFFSET_BG1VOFS,
  REG_OFFSET_BG2CNT,
  REG_OFFSET_BG3CNT,
  REG_OFFSET_BLDALPHA,
  REG_OFFSET_DISPCNT,
  ResetBlockReceivedFlag,
  ResetBlockReceivedFlags,
  ResetBlockSend,
  ResetRecvBuffer,
  ResetSendBuffer,
  ResetLinkPlayerCount,
  ResetLinkPlayers,
  ResetSerial,
  SAVE_LINK,
  SELECT_BUTTON,
  SIO_START,
  SIO_MULTI_SI,
  SIO_MULTI_SD,
  SIO_MULTI_MODE,
  SIO_115200_BPS,
  SIO_INTR_ENABLE,
  SaveLinkPlayers,
  SendBlock,
  SendBlockRequest,
  SendBerryBlenderNoSpaceForPokeblocks,
  SE_BOO,
  SE_PIN,
  SerialCB,
  SetBerryBlenderLinkCallback,
  SetBlockReceivedFlag,
  SetCloseLinkCallback,
  SetCloseLinkCallbackAndType,
  SetLinkErrorFromRfu,
  SetLinkStandbyCallback,
  SetLinkDebugValues,
  SetLocalLinkPlayerId,
  SetSuppressLinkErrorMessage,
  SetWirelessCommType0,
  SetWirelessCommType0_Internal,
  SetWirelessCommType1,
  SLAVE_HANDSHAKE,
  START_BUTTON,
  StartTransfer,
  StartSendingKeysToLink,
  Task_DestroySelf,
  Task_PrintTestData,
  Task_TriggerHandshake,
  TestBlockTransfer,
  TIMER_64CLK,
  TIMER_ENABLE,
  Timer3Intr,
  StopTimer,
  SendRecvDone,
  TIMER_INTR_ENABLE,
  TRADE_BOTH_PLAYERS_READY,
  TRADE_PARTNER_NOT_READY,
  TRADE_PLAYER_NOT_READY,
  TRAINER_ID_LENGTH,
  VBlankCB_LinkError,
  createDecompLinkRuntime
} from '../src/game/decompLink';

function encodeLinkPlayerBlock(
  magic1: string,
  player: {
    version?: number;
    lp_field_2?: number;
    trainerId: number;
    name: string;
    progressFlags?: number;
    neverRead?: number;
    progressFlagsCopy?: number;
    gender?: number;
    linkType?: number;
    id?: number;
    language?: number;
  },
  magic2: string
): number[] {
  const bytes = Array.from({ length: BLOCK_BUFFER_SIZE }, () => 0);
  const writeString = (offset: number, text: string, length: number): void => {
    for (let i = 0; i < length; i += 1)
      bytes[offset + i] = i < text.length ? text.charCodeAt(i) & 0xff : 0;
  };
  const writeU16 = (offset: number, value: number): void => {
    bytes[offset] = value & 0xff;
    bytes[offset + 1] = (value >> 8) & 0xff;
  };
  const writeU32 = (offset: number, value: number): void => {
    writeU16(offset, value & 0xffff);
    writeU16(offset + 2, (value >>> 16) & 0xffff);
  };

  writeString(0x00, magic1, 16);
  writeU16(0x10, player.version ?? 0);
  writeU16(0x12, player.lp_field_2 ?? 0);
  writeU32(0x14, player.trainerId);
  writeString(0x18, player.name, PLAYER_NAME_LENGTH + 1);
  bytes[0x20] = player.progressFlags ?? 0;
  bytes[0x21] = player.neverRead ?? 0;
  bytes[0x22] = player.progressFlagsCopy ?? 0;
  bytes[0x23] = player.gender ?? 0;
  writeU32(0x24, player.linkType ?? 0);
  writeU16(0x28, player.id ?? 0);
  writeU16(0x2a, player.language ?? 0);
  writeString(0x2c, magic2, 16);

  return Array.from({ length: BLOCK_BUFFER_SIZE / 2 }, (_, i) => bytes[i * 2] | (bytes[i * 2 + 1] << 8));
}

describe('decomp link', () => {
  const convertedJapaneseName = (name: string): string =>
    `${String.fromCharCode(0xfc)}${String.fromCharCode(21)}${name}${String.fromCharCode(0xfc)}${String.fromCharCode(22)}${String.fromCharCode(0xff)}`;

  test('extracts link status fields using the same masks and shifts', () => {
    const status = LINK_STAT_MASTER | LINK_STAT_CONN_ESTABLISHED | (3 << 2) | (0x12 << 12);
    expect(EXTRACT_PLAYER_COUNT(status)).toBe(3);
    expect(EXTRACT_MASTER(status)).toBe(1);
    expect(EXTRACT_CONN_ESTABLISHED(status)).toBe(1);
    expect(EXTRACT_LINK_ERRORS(status)).toBe(0x12);
  });

  test('BuildSendCmd writes the exact command words and payload slots', () => {
    const runtime = createDecompLinkRuntime({
      gLinkType: 0x1133,
      gMainHeldKeys: 0x30,
      gSpecialVarItemId: 0x123,
      gBlockRequestType: 4,
      gReadyCloseLinkType: 7,
      gHeldKeyCodeToSend: 0x40,
      sBlockSend: { active: true, pos: 0, size: 0x20, multiplayerId: 2, src: [] }
    });

    BuildSendCmd(runtime, LINKCMD_SEND_LINK_TYPE);
    expect(runtime.gSendCmd.slice(0, 2)).toEqual([LINKCMD_SEND_LINK_TYPE, 0x1133]);
    BuildSendCmd(runtime, LINKCMD_READY_EXIT_STANDBY);
    expect(runtime.gSendCmd[0]).toBe(LINKCMD_READY_EXIT_STANDBY);
    BuildSendCmd(runtime, LINKCMD_BLENDER_SEND_KEYS);
    expect(runtime.gSendCmd.slice(0, 2)).toEqual([LINKCMD_BLENDER_SEND_KEYS, 0x30]);
    BuildSendCmd(runtime, LINKCMD_DUMMY_1);
    expect(runtime.gSendCmd[0]).toBe(LINKCMD_DUMMY_1);
    BuildSendCmd(runtime, LINKCMD_SEND_EMPTY);
    expect(runtime.gSendCmd.slice(0, 2)).toEqual([LINKCMD_SEND_EMPTY, 0]);
    BuildSendCmd(runtime, LINKCMD_SEND_0xEE);
    expect(runtime.gSendCmd.slice(0, 6)).toEqual([LINKCMD_SEND_0xEE, 0xee, 0xee, 0xee, 0xee, 0xee]);
    BuildSendCmd(runtime, LINKCMD_INIT_BLOCK);
    expect(runtime.gSendCmd.slice(0, 3)).toEqual([LINKCMD_INIT_BLOCK, 0x20, 0x82]);
    BuildSendCmd(runtime, LINKCMD_BLENDER_NO_PBLOCK_SPACE);
    expect(runtime.gSendCmd[0]).toBe(LINKCMD_BLENDER_NO_PBLOCK_SPACE);
    BuildSendCmd(runtime, LINKCMD_SEND_ITEM);
    expect(runtime.gSendCmd.slice(0, 2)).toEqual([LINKCMD_SEND_ITEM, 0x123]);
    BuildSendCmd(runtime, LINKCMD_SEND_BLOCK_REQ);
    expect(runtime.gSendCmd.slice(0, 2)).toEqual([LINKCMD_SEND_BLOCK_REQ, 4]);
    BuildSendCmd(runtime, LINKCMD_READY_CLOSE_LINK);
    expect(runtime.gSendCmd.slice(0, 2)).toEqual([LINKCMD_READY_CLOSE_LINK, 7]);
    BuildSendCmd(runtime, LINKCMD_DUMMY_2);
    expect(runtime.gSendCmd[0]).toBe(LINKCMD_DUMMY_2);
    BuildSendCmd(runtime, LINKCMD_SEND_HELD_KEYS);
    expect(runtime.gSendCmd.slice(0, 2)).toEqual([LINKCMD_SEND_HELD_KEYS, 0x40]);

    runtime.gHeldKeyCodeToSend = 0;
    runtime.gSendCmd.fill(0);
    BuildSendCmd(runtime, LINKCMD_SEND_HELD_KEYS);
    expect(runtime.gSendCmd.every((word) => word === 0)).toBe(true);

    runtime.gHeldKeyCodeToSend = 0x55;
    runtime.gLinkTransferringData = true;
    BuildSendCmd(runtime, LINKCMD_SEND_HELD_KEYS);
    expect(runtime.gSendCmd.every((word) => word === 0)).toBe(true);
  });

  test('InitBlockSend copies small blocks into gBlockSendBuffer and queues init command', () => {
    const runtime = createDecompLinkRuntime({ multiplayerId: 3 });
    const src = [1, 2, 3, 4];

    expect(InitBlockSend(runtime, src, src.length)).toBe(true);
    expect(runtime.sBlockSend).toMatchObject({
      active: true,
      pos: 0,
      size: 4,
      multiplayerId: 3
    });
    expect(runtime.sBlockSend.src).toBe(runtime.gBlockSendBuffer);
    expect(runtime.gBlockSendBuffer.slice(0, 4)).toEqual(src);
    expect(runtime.gSendCmd.slice(0, 3)).toEqual([LINKCMD_INIT_BLOCK, 4, 0x83]);
    expect(runtime.gLinkCallback).toBe('LinkCB_BlockSendBegin');
    expect(runtime.sBlockSendDelayCounter).toBe(0);
    expect(InitBlockSend(runtime, src, src.length)).toBe(false);
  });

  test('InitBlockSend keeps large block source and LinkCB_BlockSend packs little-endian words in 14-byte chunks', () => {
    const src = Array.from({ length: BLOCK_BUFFER_SIZE + 4 }, (_, i) => i & 0xff);
    const runtime = createDecompLinkRuntime({ multiplayerId: 1 });
    expect(SendBlock(runtime, src, src.length)).toBe(true);
    expect(runtime.sBlockSend.src).not.toBe(runtime.gBlockSendBuffer);

    LinkCB_BlockSendBegin(runtime);
    LinkCB_BlockSendBegin(runtime);
    expect(runtime.gLinkCallback).toBe('LinkCB_BlockSendBegin');
    LinkCB_BlockSendBegin(runtime);
    expect(runtime.gLinkCallback).toBe('LinkCB_BlockSend');

    LinkCB_BlockSend(runtime);
    expect(runtime.gSendCmd).toEqual([
      LINKCMD_CONT_BLOCK,
      0x0100,
      0x0302,
      0x0504,
      0x0706,
      0x0908,
      0x0b0a,
      0x0d0c
    ]);
    expect(runtime.sBlockSend.pos).toBe(14);
    expect(runtime.sBlockSend.active).toBe(true);
  });

  test('LinkCB_BlockSend ends after the final chunk and LinkCB_BlockSendEnd clears callback', () => {
    const runtime = createDecompLinkRuntime();
    expect(SendBlock(runtime, [1, 2, 3, 4], 4)).toBe(true);
    LinkCB_BlockSend(runtime);
    expect(runtime.sBlockSend.pos).toBe(14);
    expect(runtime.sBlockSend.active).toBe(false);
    expect(runtime.gLinkCallback).toBe('LinkCB_BlockSendEnd');
    LinkCB_BlockSendEnd(runtime);
    expect(IsLinkTaskFinished(runtime)).toBe(true);
  });

  test('key-send link callbacks preserve link.c wired/RFU branches and remote-player gate', () => {
    const runtime = createDecompLinkRuntime({ gHeldKeyCodeToSend: 0x44 });

    StartSendingKeysToLink(runtime);
    expect(runtime.gLinkCallback).toBe('LinkCB_SendHeldKeys');
    expect(IsSendingKeysToLink(runtime)).toBe(true);

    LinkCB_SendHeldKeys(runtime);
    expect(runtime.gSendCmd.every((word) => word === 0)).toBe(true);

    runtime.gReceivedRemoteLinkPlayers = true;
    LinkCB_SendHeldKeys(runtime);
    expect(runtime.gSendCmd.slice(0, 2)).toEqual([LINKCMD_SEND_HELD_KEYS, 0x44]);

    ClearLinkCallback(runtime);
    expect(runtime.gLinkCallback).toBeNull();
    expect(IsSendingKeysToLink(runtime)).toBe(false);

    const rfuRuntime = createDecompLinkRuntime({
      gWirelessCommType: 1,
      rfuKeysSending: true,
      gLinkCallback: 'LinkCB_BlockSend'
    });
    StartSendingKeysToLink(rfuRuntime);
    expect(rfuRuntime.rfuKeysStarted).toBe(1);
    expect(rfuRuntime.gLinkCallback).toBe('LinkCB_SendHeldKeys');
    expect(IsSendingKeysToLink(rfuRuntime)).toBe(true);

    ClearLinkCallback_2(rfuRuntime);
    expect(rfuRuntime.rfuCallbackCleared).toBe(1);
    expect(rfuRuntime.gLinkCallback).toBe('LinkCB_SendHeldKeys');

    rfuRuntime.gWirelessCommType = 0;
    ClearLinkCallback_2(rfuRuntime);
    expect(rfuRuntime.gLinkCallback).toBeNull();
  });

  test('Berry Blender key callback resets attempts, sends held keys, and increments attempts', () => {
    const runtime = createDecompLinkRuntime({
      gMainHeldKeys: 0x1234,
      gBerryBlenderKeySendAttempts: 99
    });

    SetBerryBlenderLinkCallback(runtime);
    expect(runtime.gBerryBlenderKeySendAttempts).toBe(0);
    expect(runtime.gLinkCallback).toBe('LinkCB_BerryBlenderSendHeldKeys');

    LinkCB_BerryBlenderSendHeldKeys(runtime);
    expect(runtime.gSendCmd.slice(0, 2)).toEqual([LINKCMD_BLENDER_SEND_KEYS, 0x1234]);
    expect(runtime.gBerryBlenderKeySendAttempts).toBe(1);
    expect(GetBerryBlenderKeySendAttempts(runtime)).toBe(1);

    SendBerryBlenderNoSpaceForPokeblocks(runtime);
    expect(runtime.gSendCmd[0]).toBe(LINKCMD_BLENDER_NO_PBLOCK_SPACE);
  });

  test('ResetBlockSend clears the active block state exactly', () => {
    const runtime = createDecompLinkRuntime({
      sBlockSend: { active: true, pos: 14, size: 20, multiplayerId: 2, src: [1] }
    });
    ResetBlockSend(runtime);
    expect(runtime.sBlockSend).toEqual({ active: false, pos: 0, size: 0, multiplayerId: 2, src: [] });
  });

  test('block request and received flag helpers mirror link.c bit order', () => {
    const runtime = createDecompLinkRuntime();
    expect(SendBlockRequest(runtime, 3)).toBe(true);
    expect(runtime.gBlockRequestType).toBe(3);
    expect(runtime.gSendCmd.slice(0, 2)).toEqual([LINKCMD_SEND_BLOCK_REQ, 3]);
    runtime.gLinkCallback = 'LinkCB_BlockSend';
    expect(SendBlockRequest(runtime, 4)).toBe(false);

    SetBlockReceivedFlag(runtime, 0);
    SetBlockReceivedFlag(runtime, 2);
    expect(GetBlockReceivedStatus(runtime)).toBe(0b0101);
    ResetBlockReceivedFlag(runtime, 2);
    expect(GetBlockReceivedStatus(runtime)).toBe(0b0001);
    ResetBlockReceivedFlags(runtime);
    expect(GetBlockReceivedStatus(runtime)).toBe(0);
  });

  test('RFU branches for ids, player counts, block flags, send requests, and task status mirror link.c delegates', () => {
    const runtime = createDecompLinkRuntime({
      gWirelessCommType: 1,
      multiplayerId: 2,
      rfuMultiplayerId: 4,
      gLinkStatus: LINK_STAT_MASTER | (3 << 2),
      rfuLinkPlayerCount: 5,
      rfuIsMaster: true,
      rfuTaskFinished: false
    });

    expect(GetMultiplayerId(runtime)).toBe(4);
    expect(BitmaskAllOtherLinkPlayers(runtime)).toBe(((1 << MAX_LINK_PLAYERS) - 1) ^ (1 << 4));
    expect(GetLinkPlayerCount(runtime)).toBe(5);
    expect(IsLinkMaster(runtime)).toBe(true);
    expect(IsLinkTaskFinished(runtime)).toBe(false);

    expect(SendBlock(runtime, [1, 2, 3], 3)).toBe(true);
    expect(runtime.rfuInitBlockSends).toEqual([{ src: [1, 2, 3], size: 3 }]);
    expect(runtime.sBlockSend.active).toBe(false);

    expect(SendBlockRequest(runtime, 4)).toBe(true);
    expect(runtime.rfuSendBlockRequests).toEqual([4]);
    expect(runtime.gSendCmd.every((word) => word === 0)).toBe(true);

    SetBlockReceivedFlag(runtime, 0);
    SetBlockReceivedFlag(runtime, 4);
    expect(GetBlockReceivedStatus(runtime)).toBe(0b10001);
    ResetBlockReceivedFlag(runtime, 4);
    expect(GetBlockReceivedStatus(runtime)).toBe(0b00001);
    ResetBlockReceivedFlags(runtime);
    expect(GetBlockReceivedStatus(runtime)).toBe(0);
  });

  test('checksum sums size/2 u16 words and truncates to u16', () => {
    expect(LinkTestCalcBlockChecksum([1, 2, 3, 4], 8)).toBe(10);
    expect(LinkTestCalcBlockChecksum([0xffff, 2], 4)).toBe(1);
    expect(LinkTestCalcBlockChecksum([10, 20, 30], 5)).toBe(30);
  });

  test('TestBlockTransfer mirrors link-test position printing, checksum, and flag reset logic', () => {
    const runtime = createDecompLinkRuntime({
      sBlockSend: { active: true, pos: 14, size: 28, multiplayerId: 0, src: [] },
      sBlockRecv: [
        { pos: 14, size: 2, multiplayerId: 0 },
        { pos: 28, size: 2, multiplayerId: 1 },
        { pos: 0, size: 2, multiplayerId: 2 },
        { pos: 42, size: 2, multiplayerId: 3 }
      ],
      gBlockReceivedStatus: [true, true, true, true],
      gBlockRecvBuffer: Array.from({ length: MAX_RFU_PLAYERS }, () => Array.from({ length: BLOCK_BUFFER_SIZE / 2 }, () => 0)),
      sLinkTestDebugValuesEnabled: true,
      sDummyFlag: true
    });
    runtime.gBlockRecvBuffer[0][0] = 0x0342;
    runtime.gBlockRecvBuffer[1][0] = 0x0001;
    runtime.gBlockRecvBuffer[2][0] = 0x0342;
    runtime.gBlockRecvBuffer[3][0] = 0x0341;

    TestBlockTransfer(runtime, 1, 1, 0);

    expect(runtime.linkTestPrintHexCalls).toEqual([
      { num: 14, x: 2, y: 3, length: 2 },
      { num: 14, x: 2, y: 4, length: 2 },
      { num: 28, x: 2, y: 5, length: 2 },
      { num: 42, x: 2, y: 7, length: 2 }
    ]);
    expect(runtime.sLinkTestLastBlockSendPos).toBe(14);
    expect(runtime.sLinkTestLastBlockRecvPos).toEqual([14, 28, 0, 42]);
    expect(runtime.gLinkTestBlockChecksums).toEqual([0x0342, 0x0001, 0x0342, 0x0341]);
    expect(runtime.gBlockReceivedStatus).toEqual([false, false, false, false]);
    expect(runtime.sLinkTestDebugValuesEnabled).toBe(false);
    expect(runtime.sDummyFlag).toBe(false);
  });

  test('LinkTestProcessKeyInput preserves all JOY_NEW/JOY_HELD branches and debug-value expression', () => {
    const runtime = createDecompLinkRuntime({
      mainNewKeys: A_BUTTON | L_BUTTON | START_BUTTON | R_BUTTON | SELECT_BUTTON,
      mainHeldKeysInput: B_BUTTON,
      vblankCounter2: 0x1234,
      sLinkTestDebugValuesEnabled: true
    });

    LinkTestProcessKeyInput(runtime);

    expect(runtime.gShouldAdvanceLinkState).toBe(1);
    expect(runtime.sBlockSend).toMatchObject({ active: true, pos: 0, size: 0x2004, multiplayerId: 0 });
    expect(runtime.gSendCmd.slice(0, 3)).toEqual([LINKCMD_INIT_BLOCK, 0x2004, 0x80]);
    expect(runtime.paletteFades).toEqual([{ selectedPalettes: PALETTES_ALL, delay: 0, startY: 16, targetY: 0, color: 2 }]);
    expect(runtime.gSuppressLinkErrorMessage).toBe(true);
    expect(runtime.saveAttempts).toEqual([SAVE_LINK]);
    expect(runtime.sReadyCloseLinkAttempts).toBe(1);
    expect(runtime.gLinkDebugSeed).toBe(0x1234);
    expect(runtime.gLinkDebugFlags).toBe(0);

    const noCallback = createDecompLinkRuntime({
      mainNewKeys: 0,
      mainHeldKeysInput: 0,
      gLinkVSyncDisabled: false,
      sLinkTestDebugValuesEnabled: true
    });
    LinkTestProcessKeyInput(noCallback);
    expect(noCallback.gLinkDebugFlags).toBe(0x10);
  });

  test('CB2_LinkTest runs input, block transfer, tasks, sprites, OAM, and palette fade once', () => {
    const runtime = createDecompLinkRuntime({ mainNewKeys: A_BUTTON });

    CB2_LinkTest(runtime);

    expect(runtime.gShouldAdvanceLinkState).toBe(1);
    expect(runtime.runTasksCount).toBe(1);
    expect(runtime.animateSpritesCount).toBe(1);
    expect(runtime.buildOamBufferCount).toBe(1);
    expect(runtime.updatePaletteFadeCount).toBe(1);
  });

  test('link-test print helpers write BG tilemap entries with palette and base char exactly', () => {
    const runtime = createDecompLinkRuntime({
      linkTestBGInfo: { screenBaseBlock: 4, paletteNum: 3, baseChar: 9, unused: 0 }
    });

    LinkTest_PrintNumChar(runtime, 0xa, 2, 3);
    expect(runtime.linkTestTilemap[3 * 32 + 2]).toBe((3 << 12) | (0xa + 1 + 9));

    LinkTest_PrintChar(runtime, 'P'.charCodeAt(0), 5, 6);
    expect(runtime.linkTestTilemap[6 * 32 + 5]).toBe((3 << 12) | ('P'.charCodeAt(0) + 9));

    LinkTest_PrintHex(runtime, 0x1a2b, 1, 1, 4);
    expect(runtime.linkTestPrintHexCalls.at(-1)).toEqual({ num: 0x1a2b, x: 1, y: 1, length: 4 });
    expect(runtime.linkTestTilemap.slice(1 * 32 + 1, 1 * 32 + 5)).toEqual([
      (3 << 12) | (0x1 + 1 + 9),
      (3 << 12) | (0xa + 1 + 9),
      (3 << 12) | (0x2 + 1 + 9),
      (3 << 12) | (0xb + 1 + 9)
    ]);

    LinkTest_PrintString(runtime, 'A\nB', 7, 8);
    expect(runtime.linkTestTilemap[8 * 32 + 7]).toBe((3 << 12) | ('A'.charCodeAt(0) + 9));
    expect(runtime.linkTestTilemap[9 * 32 + 7]).toBe((3 << 12) | ('B'.charCodeAt(0) + 9));
  });

  test('Task_PrintTestData emits the same fixed link-test fields and checksum rows', () => {
    const runtime = createDecompLinkRuntime({
      linkTestBGInfo: { screenBaseBlock: 4, paletteNum: 1, baseChar: 2, unused: 0 },
      gShouldAdvanceLinkState: 1,
      gLinkStatus: LINK_STAT_CONN_ESTABLISHED | LINK_STAT_MASTER | (3 << 2),
      multiplayerId: 2,
      gLastSendQueueCount: 7,
      gLastRecvQueueCount: 8,
      gBlockReceivedStatus: [true, false, true, false],
      gLinkDebugSeed: 0x12345678,
      gLinkDebugFlags: 0x9abcdef0,
      regSiocntTerminals: SIO_MULTI_SI,
      gLinkErrorOccurred: true,
      gLinkTestBlockChecksums: [0x1111, 0x2222, 0x3333, 0x4444]
    });
    runtime.gLink.state = LINK_STATE_HANDSHAKE;

    Task_PrintTestData(runtime, 9);

    const printedString = LINK_TEST_PRINT.replaceAll('\n', '');
    expect(runtime.linkTestTilemap[2 * 32 + 5]).toBe((1 << 12) | (printedString.charCodeAt(0) + 2));
    expect(runtime.linkTestPrintHexCalls).toEqual([
      { num: 1, x: 2, y: 1, length: 2 },
      { num: runtime.gLinkStatus, x: 15, y: 1, length: 8 },
      { num: LINK_STATE_HANDSHAKE, x: 2, y: 10, length: 2 },
      { num: 3, x: 15, y: 10, length: 2 },
      { num: 2, x: 15, y: 12, length: 2 },
      { num: 7, x: 25, y: 1, length: 2 },
      { num: 8, x: 25, y: 2, length: 2 },
      { num: 0b0101, x: 15, y: 5, length: 2 },
      { num: 0x12345678, x: 2, y: 12, length: 8 },
      { num: 0x9abcdef0, x: 2, y: 13, length: 8 },
      { num: 1, x: 25, y: 5, length: 1 },
      { num: 0, x: 25, y: 6, length: 1 },
      { num: 1, x: 25, y: 7, length: 1 },
      { num: 1, x: 25, y: 8, length: 1 },
      { num: 0x1111, x: 10, y: 4, length: 4 },
      { num: 0x2222, x: 10, y: 5, length: 4 },
      { num: 0x3333, x: 10, y: 6, length: 4 },
      { num: 0x4444, x: 10, y: 7, length: 4 }
    ]);
  });

  test('player count flags, multiplayer id, and master checks follow link status', () => {
    const runtime = createDecompLinkRuntime({
      multiplayerId: 2,
      gLinkStatus: LINK_STAT_MASTER | (3 << 2)
    });

    expect(GetMultiplayerId(runtime)).toBe(2);
    expect(BitmaskAllOtherLinkPlayers(runtime)).toBe(0b1011);
    expect(GetLinkPlayerCount(runtime)).toBe(3);
    expect(GetLinkPlayerCount_2(runtime)).toBe(3);
    expect(GetLinkPlayerCountAsBitFlags(runtime)).toBe(0b0111);
    expect(IsLinkMaster(runtime)).toBe(true);
    CheckShouldAdvanceLinkState(runtime);
    expect(runtime.gShouldAdvanceLinkState).toBe(1);
  });

  test('saved link player helpers copy all RFU slots and compare trainer IDs/names', () => {
    const runtime = createDecompLinkRuntime({
      multiplayerId: 1,
      gLinkPlayers: Array.from({ length: MAX_RFU_PLAYERS }, (_, i) => ({ trainerId: 100 + i, name: `P${i}` }))
    });

    SaveLinkPlayers(runtime, 3);
    expect(GetSavedPlayerCount(runtime)).toBe(3);
    expect(runtime.gSavedMultiplayerId).toBe(1);
    expect(GetSavedMultiplayerId(runtime)).toBe(1);
    expect(GetSavedLinkPlayerCountAsBitFlags(runtime)).toBe(0b0111);
    expect(DoesLinkPlayerCountMatchSaved(runtime)).toBe(true);
    expect(CheckLinkPlayersMatchSaved(runtime)).toBe(true);

    runtime.gLinkPlayers[1] = { trainerId: 101, name: 'OTHER' };
    expect(DoesLinkPlayerCountMatchSaved(runtime)).toBe(true);
    expect(CheckLinkPlayersMatchSaved(runtime)).toBe(false);
    expect(runtime.gLinkErrorOccurred).toBe(true);
    expect(runtime.closedLinkCount).toBe(1);
    expect(runtime.mainCallback2).toBe('CB2_LinkError');

    runtime.gLinkPlayers[1] = { trainerId: 999, name: 'P1' };
    expect(DoesLinkPlayerCountMatchSaved(runtime)).toBe(false);

    const multiMismatch = createDecompLinkRuntime({
      gSavedLinkPlayerCount: 3,
      gSavedLinkPlayers: [
        { trainerId: 1, name: 'A' },
        { trainerId: 2, name: 'B' },
        { trainerId: 3, name: 'C' },
        { trainerId: 0, name: '' },
        { trainerId: 0, name: '' }
      ],
      gLinkPlayers: [
        { trainerId: 9, name: 'A' },
        { trainerId: 2, name: 'B' },
        { trainerId: 8, name: 'C' },
        { trainerId: 0, name: '' },
        { trainerId: 0, name: '' }
      ]
    });
    expect(CheckLinkPlayersMatchSaved(multiMismatch)).toBe(false);
    expect(multiMismatch.closedLinkCount).toBe(2);
    expect(multiMismatch.mainCallback2).toBe('CB2_LinkError');
  });

  test('debug and dummy helpers preserve the unused link.c globals exactly', () => {
    const runtime = createDecompLinkRuntime({ sDummy2: 0x7f });
    expect(GetDummy2(runtime)).toBe(0x7f);

    SetLinkDebugValues(runtime, 0x123456789, -1);
    expect(runtime.gLinkDebugSeed).toBe(0x23456789);
    expect(runtime.gLinkDebugFlags).toBe(0xffffffff);
  });

  test('close-link callbacks wait for empty recv queue and all ready flags like link.c', () => {
    const runtime = createDecompLinkRuntime({
      gLinkStatus: 3 << 2,
      gLastRecvQueueCount: 1,
      gBattleTypeFlags: 0xffff0000 | BATTLE_TYPE_LINK_IN_BATTLE | 0x80
    });

    SetCloseLinkCallbackAndType(runtime, 7);
    expect(runtime.gLinkCallback).toBe('LinkCB_ReadyCloseLink');
    expect(runtime.gReadyCloseLinkType).toBe(7);
    LinkCB_ReadyCloseLink(runtime);
    expect(runtime.gLinkCallback).toBe('LinkCB_ReadyCloseLink');

    runtime.gLastRecvQueueCount = 0;
    LinkCB_ReadyCloseLink(runtime);
    expect(runtime.gSendCmd.slice(0, 2)).toEqual([LINKCMD_READY_CLOSE_LINK, 7]);
    expect(runtime.gLinkCallback).toBe('LinkCB_WaitCloseLink');

    runtime.gReadyToCloseLink = [true, false, true, false];
    LinkCB_WaitCloseLink(runtime);
    expect(runtime.gLinkCallback).toBe('LinkCB_WaitCloseLink');
    expect(runtime.closedLinkCount).toBe(0);

    runtime.gReadyToCloseLink[1] = true;
    LinkCB_WaitCloseLink(runtime);
    expect(runtime.gBattleTypeFlags).toBe(0x80);
    expect(runtime.gLinkVSyncDisabled).toBe(true);
    expect(runtime.closedLinkCount).toBe(1);
    expect(runtime.gLinkCallback).toBeNull();
    expect(runtime.gLinkDummy1).toBe(true);

    const busyRuntime = createDecompLinkRuntime({ gLinkCallback: 'LinkCB_BlockSend' });
    SetCloseLinkCallback(busyRuntime);
    expect(busyRuntime.sReadyCloseLinkAttempts).toBe(1);
    expect(busyRuntime.gLinkCallback).toBe('LinkCB_BlockSend');

    const rfuRuntime = createDecompLinkRuntime({ gWirelessCommType: 1 });
    SetCloseLinkCallbackAndType(rfuRuntime, 3);
    SetCloseLinkCallback(rfuRuntime);
    expect(rfuRuntime.rfuCloseLinkCallbacks).toBe(2);
  });

  test('standby callbacks send ready-exit command then clear all ready flags only when every player is ready', () => {
    const runtime = createDecompLinkRuntime({
      gLinkStatus: 3 << 2,
      gLastRecvQueueCount: 1,
      gLinkDummy1: true
    });

    SetLinkStandbyCallback(runtime);
    expect(runtime.gLinkCallback).toBe('LinkCB_Standby');
    expect(runtime.gLinkDummy1).toBe(false);
    LinkCB_Standby(runtime);
    expect(runtime.gLinkCallback).toBe('LinkCB_Standby');

    runtime.gLastRecvQueueCount = 0;
    LinkCB_Standby(runtime);
    expect(runtime.gSendCmd[0]).toBe(LINKCMD_READY_EXIT_STANDBY);
    expect(runtime.gLinkCallback).toBe('LinkCB_StandbyForAll');

    runtime.gReadyToExitStandby = [true, false, true, true];
    LinkCB_StandbyForAll(runtime);
    expect(runtime.gLinkCallback).toBe('LinkCB_StandbyForAll');

    runtime.gReadyToExitStandby[1] = true;
    LinkCB_StandbyForAll(runtime);
    expect(runtime.gReadyToExitStandby).toEqual([false, false, false, false]);
    expect(runtime.gLinkCallback).toBeNull();

    const rfuRuntime = createDecompLinkRuntime({ gWirelessCommType: 1 });
    SetLinkStandbyCallback(rfuRuntime);
    expect(rfuRuntime.rfuStandbyCallbacks).toBe(1);
  });

  test('error status helpers mirror suppressed/unsuppressed link-error side effects', () => {
    const runtime = createDecompLinkRuntime({
      sLinkOpen: true,
      gLinkStatus: LINK_STAT_ERRORS | (2 << 2),
      gLastRecvQueueCount: 5,
      gLastSendQueueCount: 6
    });

    expect(IsLinkConnectionEstablished(createDecompLinkRuntime({ gLinkStatus: LINK_STAT_CONN_ESTABLISHED }))).toBe(true);
    expect(HasLinkErrorOccurred(runtime)).toBe(false);
    CheckErrorStatus(runtime);
    expect(runtime.sLinkErrorBuffer).toEqual({
      status: LINK_STAT_ERRORS | (2 << 2),
      lastRecvQueueCount: 5,
      lastSendQueueCount: 6,
      disconnected: 0
    });
    expect(runtime.mainCallback2).toBe('CB2_LinkError');
    expect(runtime.gLinkErrorOccurred).toBe(true);
    expect(runtime.closedLinkCount).toBe(1);

    const suppressed = createDecompLinkRuntime({
      sLinkOpen: true,
      gLinkStatus: LINK_STAT_ERRORS,
      gSuppressLinkErrorMessage: true
    });
    SetSuppressLinkErrorMessage(suppressed, true);
    CheckErrorStatus(suppressed);
    expect(suppressed.mainCallback2).toBeNull();
    expect(suppressed.gLinkErrorOccurred).toBe(true);
    expect(suppressed.closedLinkCount).toBe(1);

    SetLinkErrorFromRfu(suppressed, 7, 8, 9, 1);
    expect(suppressed.sLinkErrorBuffer).toEqual({
      status: 7,
      lastSendQueueCount: 8,
      lastRecvQueueCount: 9,
      disconnected: 1
    });

    CloseLink(suppressed);
    expect(suppressed.gReceivedRemoteLinkPlayers).toBe(false);
    expect(suppressed.sLinkOpen).toBe(false);
  });

  test('CB2_LinkError preserves revision-0 setup side effects and wireless mode mutation', () => {
    const runtime = createDecompLinkRuntime({
      gWirelessCommType: 1,
      mainCallback1: 'RunMain',
      mainCallback2: 'OldCB2',
      softResetDisabled: true,
      sLinkErrorBuffer: { status: 0, lastRecvQueueCount: 0, lastSendQueueCount: 0, disconnected: 0 }
    });

    CB2_LinkError(runtime);
    expect(runtime.linkErrorSetupCount).toBe(1);
    expect(runtime.linkGpuRegs[REG_OFFSET_DISPCNT]).toBe(0);
    expect(runtime.musicPlayersStopped).toEqual(['gMPlayInfo_SE1', 'gMPlayInfo_SE2', 'gMPlayInfo_SE3']);
    expect(runtime.initHeapCalls).toEqual([{ heap: 'gHeap', size: HEAP_SIZE }]);
    expect(runtime.resetSpriteDataCount).toBe(1);
    expect(runtime.freeAllSpritePalettesCount).toBe(1);
    expect(runtime.resetPaletteFadeControlCount).toBe(1);
    expect(runtime.backdropColor).toBe(0);
    expect(runtime.resetTasksCount).toBe(1);
    expect(runtime.scanlineEffectStopCount).toBe(1);
    expect(runtime.gWirelessCommType).toBe(3);
    expect(runtime.resetLinkRfuGFLayerCount).toBe(1);
    expect(runtime.vblankCallback).toBe('VBlankCB_LinkError');
    expect(runtime.resetBgsAndClearDma3BusyFlagsArgs).toEqual([false]);
    expect(runtime.initBgsFromTemplatesCalls).toEqual([{ bgMode: 0, templateCount: 2 }]);
    expect(runtime.linkErrorBgTilemapBufferSize).toBe(BG_SCREEN_SIZE);
    expect(runtime.setBgTilemapBufferCalls).toEqual([{ bg: 1, size: BG_SCREEN_SIZE }]);
    expect(runtime.deactivateAllTextPrintersCount).toBe(1);
    expect(runtime.resetTempTileDataBuffersCount).toBe(1);
    expect(runtime.linkGpuRegs[REG_OFFSET_BLDALPHA]).toBe(0);
    expect(runtime.linkGpuRegs[REG_OFFSET_BG0HOFS]).toBe(0);
    expect(runtime.linkGpuRegs[REG_OFFSET_BG0VOFS]).toBe(0);
    expect(runtime.linkGpuRegs[REG_OFFSET_BG1HOFS]).toBe(0);
    expect(runtime.linkGpuRegs[REG_OFFSET_BG1VOFS]).toBe(0);
    expect(runtime.clearGpuRegBitsCalls).toEqual([{ reg: REG_OFFSET_DISPCNT, bits: DISPCNT_WIN0_ON | DISPCNT_WIN1_ON | DISPCNT_OBJWIN_ON }]);
    expect(runtime.loadedPalettes).toEqual([{ palette: 'gStandardMenuPalette', offset: 15 * 16, size: 32 }]);
    expect(runtime.softResetDisabled).toBe(false);
    expect(runtime.createdTasks).toEqual([{ func: 'Task_DestroySelf', priority: 0 }]);
    expect(runtime.stopMapMusicCount).toBe(1);
    expect(runtime.mainCallback1).toBeNull();
    expect(runtime.runTasksCount).toBe(1);
    expect(runtime.animateSpritesCount).toBe(1);
    expect(runtime.buildOamBufferCount).toBe(1);
    expect(runtime.updatePaletteFadeCount).toBe(1);
    expect(runtime.mainCallback2).toBe('CB2_PrintErrorMessage');

    const disconnected = createDecompLinkRuntime({
      gWirelessCommType: 2,
      initWindowsResult: false,
      mainCallback2: 'OldCB2',
      sLinkErrorBuffer: { status: 0, lastRecvQueueCount: 0, lastSendQueueCount: 0, disconnected: 1 }
    });
    CB2_LinkError(disconnected);
    expect(disconnected.gWirelessCommType).toBe(2);
    expect(disconnected.mainCallback2).toBe('OldCB2');
    expect(disconnected.createdTasks).toEqual([]);
    expect(disconnected.vblankCallback).toBe('VBlankCB_LinkError');
  });

  test('CB2_PrintErrorMessage follows state-specific screens, sounds, and A-button recovery branches', () => {
    const runtime = createDecompLinkRuntime({
      mainState: 0,
      sLinkErrorBuffer: { status: 0, lastRecvQueueCount: 0, lastSendQueueCount: 0, disconnected: 0 }
    });

    CB2_PrintErrorMessage(runtime);
    expect(runtime.linkErrorScreens).toEqual(['CheckConnections']);
    expect(runtime.fillWindowPixelBufferCalls).toEqual([
      { windowId: 1, fillValue: 0 },
      { windowId: 2, fillValue: 0 }
    ]);
    expect(runtime.textPrinterCalls).toEqual([
      { windowId: 1, font: 'FONT_NORMAL_COPY_2', x: 2, y: 0, color: [0, 1, 2], speed: 0, text: 'gText_CommErrorCheckConnections' }
    ]);
    expect(runtime.putWindowTilemapCalls).toEqual([1, 2]);
    expect(runtime.copyWindowToVramCalls).toEqual([
      { windowId: 1, mode: 'COPYWIN_NONE' },
      { windowId: 2, mode: 'COPYWIN_FULL' }
    ]);
    expect(runtime.showBgCalls).toEqual([0]);
    expect(runtime.mainState).toBe(1);

    runtime.mainState = 0;
    runtime.sLinkErrorBuffer.disconnected = 1;
    CB2_PrintErrorMessage(runtime);
    expect(runtime.linkErrorScreens.at(-1)).toBe('MoveCloserToPartner');
    expect(runtime.decompressedBgGfxCalls).toEqual([{ bg: 1, gfx: 'sWirelessLinkDisplayGfx', useHeap: false, size: 0, offset: 0 }]);
    expect(runtime.copyToBgTilemapBufferCalls).toEqual([{ bg: 1, tilemap: 'sWirelessLinkDisplayTilemap', mode: 0, destOffset: 0 }]);
    expect(runtime.copyBgTilemapBufferToVramCalls).toEqual([1]);
    expect(runtime.loadedPalettes.at(-1)).toEqual({ palette: 'sWirelessLinkDisplayPal', offset: 0, size: 32 });
    expect(runtime.textPrinterCalls.slice(-2)).toEqual([
      { windowId: 0, font: 'FONT_NORMAL_COPY_2', x: 2, y: 5, color: [0, 1, 2], speed: 0, text: 'gText_CommErrorEllipsis' },
      { windowId: 2, font: 'FONT_NORMAL_COPY_2', x: 2, y: 2, color: [0, 1, 2], speed: 0, text: 'gText_MoveCloserToLinkPartner' }
    ]);
    expect(runtime.showBgCalls.slice(-2)).toEqual([0, 1]);

    for (const state of [30, 60, 90]) {
      runtime.mainState = state;
      CB2_PrintErrorMessage(runtime);
    }
    expect(runtime.playedSoundEffects).toEqual([SE_BOO, SE_BOO, SE_BOO]);

    runtime.mainState = 130;
    runtime.gWirelessCommType = 1;
    CB2_PrintErrorMessage(runtime);
    expect(runtime.linkErrorScreens.at(-1)).toBe('ABtnRegistrationCounter');
    expect(runtime.textPrinterCalls.at(-1)).toEqual({
      windowId: 0,
      font: 'FONT_NORMAL_COPY_2',
      x: 2,
      y: 20,
      color: [0, 1, 2],
      speed: 0,
      text: 'gText_ABtnRegistrationCounter'
    });
    runtime.mainState = 130;
    runtime.gWirelessCommType = 2;
    CB2_PrintErrorMessage(runtime);
    expect(runtime.linkErrorScreens.at(-1)).toBe('ABtnTitleScreen');
    expect(runtime.textPrinterCalls.at(-1)).toEqual({
      windowId: 0,
      font: 'FONT_NORMAL_COPY_2',
      x: 2,
      y: 20,
      color: [0, 1, 2],
      speed: 0,
      text: 'gText_ABtnTitleScreen'
    });
    runtime.mainState = 130;
    runtime.gWirelessCommType = 3;
    const screenCountBeforeType3 = runtime.linkErrorScreens.length;
    const printerCountBeforeType3 = runtime.textPrinterCalls.length;
    CB2_PrintErrorMessage(runtime);
    expect(runtime.linkErrorScreens).toHaveLength(screenCountBeforeType3);
    expect(runtime.textPrinterCalls).toHaveLength(printerCountBeforeType3);

    runtime.mainState = 160;
    runtime.gWirelessCommType = 1;
    runtime.sLinkErrorBuffer.disconnected = 1;
    runtime.mainNewKeys = A_BUTTON;
    CB2_PrintErrorMessage(runtime);
    expect(runtime.helpSystemEnabled).toBe(true);
    expect(runtime.playedSoundEffects.at(-1)).toBe(SE_PIN);
    expect(runtime.gWirelessCommType).toBe(0);
    expect(runtime.sLinkErrorBuffer.disconnected).toBe(0);
    expect(runtime.reloadSaveCount).toBe(1);
    expect(runtime.mainState).toBe(160);

    const resetRuntime = createDecompLinkRuntime({ mainState: 160, gWirelessCommType: 2, mainNewKeys: A_BUTTON });
    CB2_PrintErrorMessage(resetRuntime);
    expect(resetRuntime.helpSystemEnabled).toBe(true);
    expect(resetRuntime.rfuStopModeCount).toBe(1);
    expect(resetRuntime.rfuWaitReqCompleteCount).toBe(1);
    expect(resetRuntime.softResetCount).toBe(1);
  });

  test('local link-player block helpers preserve init fields, magic validation, and name conversion side effect', () => {
    const runtime = createDecompLinkRuntime({
      playerTrainerId: [0x12, 0x34, 0x56, 0x78],
      playerName: 'RED',
      playerGender: 1,
      gameLanguage: 2,
      gameVersion: 3,
      gLinkType: 0x2233,
      nationalPokedexEnabled: true,
      canLinkWithRs: true
    });

    SetLocalLinkPlayerId(runtime, 5);
    expect(runtime.gLocalLinkPlayer.id).toBe(5);

    LocalLinkPlayerToBlock(runtime);
    expect(runtime.gLocalLinkPlayerBlock.magic1).toBe(LINK_MAGIC_GAME_FREAK_INC);
    expect(runtime.gLocalLinkPlayerBlock.magic2).toBe(LINK_MAGIC_GAME_FREAK_INC);
    expect(runtime.gLocalLinkPlayerBlock.linkPlayer).toMatchObject({
      trainerId: 0x78563412,
      name: 'RED',
      gender: 1,
      language: 2,
      version: 0x4003,
      lp_field_2: 0x8000,
      linkType: 0x2233,
      progressFlags: 0x11
    });
    expect(runtime.gBlockSendBuffer.slice(0, 16)).toEqual([
      ...Array.from(LINK_MAGIC_GAME_FREAK_INC, (ch) => ch.charCodeAt(0)),
      0,
      0
    ]);
    expect(runtime.gBlockSendBuffer.slice(0x10, 0x1c)).toEqual([
      0x03, 0x40,
      0x00, 0x80,
      0x12, 0x34, 0x56, 0x78,
      'R'.charCodeAt(0), 'E'.charCodeAt(0), 'D'.charCodeAt(0), 0
    ]);
    expect(runtime.gBlockSendBuffer.slice(0x1c, 0x2c)).toEqual([
      0, 0, 0, 0,
      0x11, 0, 0, 1,
      0x33, 0x22, 0, 0,
      5, 0,
      2, 0
    ]);
    expect(runtime.gBlockSendBuffer.slice(0x2c, 0x3c)).toEqual([
      ...Array.from(LINK_MAGIC_GAME_FREAK_INC, (ch) => ch.charCodeAt(0)),
      0,
      0
    ]);
    expect(LINK_PLAYER_SIZE).toBe(0x1c);
    expect(LINK_PLAYER_BLOCK_SIZE).toBe(0x3c);
    expect(PLAYER_NAME_LENGTH).toBe(7);

    runtime.gBlockRecvBuffer[2] = encodeLinkPlayerBlock(
      LINK_MAGIC_GAME_FREAK_INC,
      { trainerId: 99, name: 'BLUE', progressFlags: 0x10, language: 1 },
      LINK_MAGIC_GAME_FREAK_INC
    );
    LinkPlayerFromBlock(runtime, 2);
    expect(runtime.gLinkPlayers[2]).toEqual({
      trainerId: 99,
      name: convertedJapaneseName('BLUE'),
      version: 0,
      lp_field_2: 0,
      progressFlags: 0x10,
      neverRead: 0,
      gender: 0,
      linkType: 0,
      id: 0,
      language: 1,
      progressFlagsCopy: 0x10
    });
    expect(runtime.convertedInternationalStrings.at(-1)).toEqual({
      before: 'BLUE',
      after: convertedJapaneseName('BLUE'),
      language: LANGUAGE_JAPANESE
    });
    expect(runtime.mainCallback2).toBeNull();

    const colorHighlightedName = `A${String.fromCharCode(0xfc)}${String.fromCharCode(0x04)}${String.fromCharCode(1)}${String.fromCharCode(2)}${String.fromCharCode(3)}B${String.fromCharCode(0xff)}`;
    runtime.gBlockRecvBuffer[1] = encodeLinkPlayerBlock(
      LINK_MAGIC_GAME_FREAK_INC,
      { trainerId: 101, name: colorHighlightedName, progressFlags: 0x20, language: LANGUAGE_JAPANESE },
      LINK_MAGIC_GAME_FREAK_INC
    );
    LinkPlayerFromBlock(runtime, 1);
    expect(runtime.gLinkPlayers[1].name).toBe(convertedJapaneseName('AB'));
    expect(runtime.convertedInternationalStrings.at(-1)).toEqual({
      before: colorHighlightedName,
      after: convertedJapaneseName('AB'),
      language: LANGUAGE_JAPANESE
    });

    runtime.gBlockRecvBuffer[3] = encodeLinkPlayerBlock(
      'bad',
      { trainerId: 100, name: 'GREEN', progressFlags: 1 },
      LINK_MAGIC_GAME_FREAK_INC
    );
    LinkPlayerFromBlock(runtime, 3);
    expect(runtime.gLinkPlayers[3].progressFlagsCopy).toBe(1);
    expect(runtime.mainCallback2).toBe('CB2_LinkError');
  });

  test('wireless type, SIO terminal, and ResetSerial helpers mirror the guarded C side effects', () => {
    const runtime = createDecompLinkRuntime({ gWirelessCommType: 0 });
    SetWirelessCommType1(runtime);
    expect(runtime.gWirelessCommType).toBe(1);
    SetWirelessCommType0(runtime);
    expect(runtime.gWirelessCommType).toBe(0);

    runtime.gReceivedRemoteLinkPlayers = true;
    SetWirelessCommType1(runtime);
    expect(runtime.gWirelessCommType).toBe(0);

    runtime.regSiocntTerminals = SIO_MULTI_SD;
    expect(IsSioMultiMaster(runtime)).toBe(true);
    expect(GetSioMultiSI(runtime)).toBe(false);
    runtime.regSiocntTerminals = SIO_MULTI_SD | SIO_MULTI_SI;
    expect(IsSioMultiMaster(runtime)).toBe(false);
    expect(GetSioMultiSI(runtime)).toBe(true);

    runtime.gLink.state = LINK_STATE_CONN_ESTABLISHED;
    runtime.gLink.playerCount = 4;
    runtime.gLink.sendQueue.count = 2;
    runtime.sSendNonzeroCheck = 7;
    runtime.sChecksumAvailable = 1;
    runtime.regSiomltSend = 0x1234;
    runtime.regSiomltRecv = [1, 2, 3, 4];
    runtime.regRcnt = 0xffff;
    runtime.regSiocnt = 0xffff;
    runtime.regTm3cntH = 0xffff;
    runtime.regIf = 0;
    ResetSerial(runtime);
    expect(runtime.gLink.state).toBe(0);
    expect(runtime.gLink.playerCount).toBe(0);
    expect(runtime.gLink.sendQueue.count).toBe(0);
    expect(runtime.sSendNonzeroCheck).toBe(0);
    expect(runtime.sChecksumAvailable).toBe(0);
    expect(runtime.regSiomltSend).toBe(0);
    expect(runtime.regSiomltRecv).toEqual([0, 0, 0, 0]);
    expect(runtime.disabledInterrupts).toEqual([
      INTR_FLAG_TIMER3 | INTR_FLAG_SERIAL,
      INTR_FLAG_TIMER3 | INTR_FLAG_SERIAL
    ]);
    expect(runtime.enabledInterrupts).toEqual([INTR_FLAG_SERIAL]);
    expect(runtime.regRcnt).toBe(0);
    expect(runtime.regSiocnt).toBe(SIO_MULTI_MODE);
    expect(runtime.regTm3cntH).toBe(0);
    expect(runtime.regIf).toBe(INTR_FLAG_TIMER3 | INTR_FLAG_SERIAL);

    runtime.disabledInterrupts = [];
    runtime.enabledInterrupts = [];
    InitLink(runtime);
    expect(runtime.sLinkOpen).toBe(true);
    expect(runtime.gSendCmd.every((word) => word === LINKCMD_NONE)).toBe(true);
    expect(runtime.regSiocnt).toBe(SIO_MULTI_MODE | SIO_115200_BPS | SIO_INTR_ENABLE);
    expect(runtime.enabledInterrupts).toEqual([INTR_FLAG_SERIAL]);
  });

  test('IsWirelessAdapterConnected mirrors playback, successful RFU id, and failed adapter branches', () => {
    const playback = createDecompLinkRuntime({ qlPlaybackState: true });
    expect(IsWirelessAdapterConnected(playback)).toBe(false);
    expect(playback.gWirelessCommType).toBe(0);
    expect(playback.rfuApiInitialized).toBe(0);
    expect(playback.rfuOperations).toEqual([]);

    const connected = createDecompLinkRuntime({ rfuSoftResetCheckId: RFU_ID });
    expect(IsWirelessAdapterConnected(connected)).toBe(true);
    expect(connected.gWirelessCommType).toBe(1);
    expect(connected.rfuApiInitialized).toBe(1);
    expect(connected.rfuIgnoreError).toBe(true);
    expect(connected.rfuStopModeCount).toBe(1);
    expect(connected.rfuWaitReqCompleteCount).toBe(1);
    expect(connected.restoreSerialTimer3IntrHandlersCount).toBe(0);
    expect(connected.rfuOperations).toEqual([
      'SetWirelessCommType1',
      'InitRFUAPI',
      'RfuSetIgnoreError:true',
      'rfu_LMAN_REQBN_softReset_and_checkID',
      'rfu_REQ_stopMode',
      'rfu_waitREQComplete'
    ]);

    const failed = createDecompLinkRuntime({ rfuSoftResetCheckId: 0 });
    expect(IsWirelessAdapterConnected(failed)).toBe(false);
    expect(failed.gWirelessCommType).toBe(0);
    expect(failed.closedLinkCount).toBe(1);
    expect(failed.restoreSerialTimer3IntrHandlersCount).toBe(1);
    expect(failed.rfuStopModeCount).toBe(0);
    expect(failed.rfuOperations).toEqual([
      'SetWirelessCommType1',
      'InitRFUAPI',
      'RfuSetIgnoreError:true',
      'rfu_LMAN_REQBN_softReset_and_checkID',
      'SetWirelessCommType0_Internal',
      'CloseLink',
      'RestoreSerialTimer3IntrHandlers'
    ]);
  });

  test('link-test BG helpers and destroy-task helper preserve revision-0 side effects', () => {
    const runtime = createDecompLinkRuntime();
    Task_DestroySelf(runtime, 257);
    expect(runtime.destroyedTasks).toEqual([1]);

    InitLinkTestBG(runtime, 3, 2, 4, 1, 9);
    expect(runtime.linkTestBGInfo).toEqual({ screenBaseBlock: 4, paletteNum: 3, baseChar: 9, unused: 0 });
    expect(runtime.linkGpuRegs[REG_OFFSET_BG2CNT]).toBe(BGCNT_SCREENBASE(4) | BGCNT_PRIORITY(1) | BGCNT_CHARBASE(1));
    expect(runtime.linkGpuRegs.REG_OFFSET_BG2HOFS).toBe(0);
    expect(runtime.linkGpuRegs.REG_OFFSET_BG2VOFS).toBe(0);

    InitLinkTestBG(runtime, 1, 1, 5, 2, 7);
    expect(runtime.linkGpuRegs[REG_OFFSET_BG1CNT]).toBe(BGCNT_SCREENBASE(5) | BGCNT_PRIORITY(1) | BGCNT_CHARBASE(2));
    InitLinkTestBG(runtime, 1, 3, 6, 3, 8);
    expect(runtime.linkGpuRegs[REG_OFFSET_BG3CNT]).toBe(BGCNT_SCREENBASE(6) | BGCNT_PRIORITY(1) | BGCNT_CHARBASE(3));

    LoadLinkTestBgGfx(runtime, 2, 1, 12, 3);
    expect(runtime.linkTestBGInfo).toEqual({ screenBaseBlock: 12, paletteNum: 2, baseChar: 0, unused: 0 });
    expect(runtime.linkGpuRegs[REG_OFFSET_BG1CNT]).toBe(BGCNT_SCREENBASE(12) | BGCNT_CHARBASE(3));
  });

  test('VBlankCB_LinkError preserves the exact OAM, sprite-copy, palette-transfer call order', () => {
    const runtime = createDecompLinkRuntime();

    VBlankCB_LinkError(runtime);

    expect(runtime.vblankOperations).toEqual(['LoadOam', 'ProcessSpriteCopyRequests', 'TransferPlttBuffer']);
    expect(runtime.loadOamCount).toBe(1);
    expect(runtime.processSpriteCopyRequestsCount).toBe(1);
    expect(runtime.transferPlttBufferCount).toBe(1);
  });

  test('LinkTestScreen preserves unused link-test setup side effects and trainer-id RNG', () => {
    const runtime = createDecompLinkRuntime({
      vblankCounter2: 0x1234,
      gLinkCallback: 'LinkCB_BlockSend',
      sBlockSend: { active: true, pos: 14, size: 28, multiplayerId: 2, src: [1, 2] },
      playerName: 'TESTER',
      playerGender: 1,
      gameLanguage: 2,
      gameVersion: 3,
      nationalPokedexEnabled: true,
      canLinkWithRs: true,
      sDummy3: 99,
      createdTasks: [{ func: 'OldTask', priority: 9 }]
    });
    let rng = 0x1234;
    const expectedTrainerId: number[] = [];
    for (let i = 0; i < TRAINER_ID_LENGTH; i += 1) {
      rng = (Math.imul(1103515245, rng >>> 0) + 24691) >>> 0;
      expectedTrainerId.push((rng >>> 16) % 256);
    }

    LinkTestScreen(runtime);

    expect(runtime.resetSpriteDataCount).toBe(1);
    expect(runtime.freeAllSpritePalettesCount).toBe(1);
    expect(runtime.resetTasksCount).toBe(1);
    expect(runtime.vblankCallback).toBe('VBlankCB_LinkError');
    expect(runtime.gLinkType).toBe(LINKTYPE_TRADE);
    expect(runtime.gLinkCallback).toBe('LinkCB_RequestPlayerDataExchange');
    expect(runtime.sBlockSend.active).toBe(false);
    expect(runtime.rngValue).toBe(rng);
    expect(runtime.playerTrainerId).toEqual(expectedTrainerId);
    expect(runtime.linkTestBGInfo).toEqual({ screenBaseBlock: 4, paletteNum: 0, baseChar: 0, unused: 0 });
    expect(runtime.linkGpuRegs[REG_OFFSET_BG2CNT]).toBe(BGCNT_SCREENBASE(4) | BGCNT_PRIORITY(1) | BGCNT_CHARBASE(0));
    expect(runtime.linkGpuRegs[REG_OFFSET_DISPCNT]).toBe(DISPCNT_MODE_0 | DISPCNT_OBJ_1D_MAP | DISPCNT_BG0_ON | DISPCNT_BG2_ON | DISPCNT_OBJ_ON);
    expect(runtime.createdTasks).toEqual([
      { func: 'Task_TriggerHandshake', priority: 2 },
      { func: 'Task_DestroySelf', priority: 0 },
      { func: 'Task_PrintTestData', priority: 0 }
    ]);
    expect(runtime.runTasksCount).toBe(1);
    expect(runtime.animateSpritesCount).toBe(1);
    expect(runtime.buildOamBufferCount).toBe(1);
    expect(runtime.updatePaletteFadeCount).toBe(1);
    expect(runtime.sDummy3).toBe(0);
    expect(runtime.gLocalLinkPlayer).toMatchObject({
      trainerId: expectedTrainerId[0] | (expectedTrainerId[1] << 8) | (expectedTrainerId[2] << 16) | (expectedTrainerId[3] << 24),
      name: 'TESTER',
      gender: 1,
      linkType: LINKTYPE_TRADE,
      language: 2,
      version: 0x4003,
      lp_field_2: 0x8000,
      progressFlags: 0x11
    });
    expect(runtime.mainCallback2).toBe('CB2_LinkTest');
  });

  test('InitLink, OpenLink, and Task_TriggerHandshake preserve wired/RFU setup side effects', () => {
    const runtime = createDecompLinkRuntime({
      gSendCmd: [1, 2, 3, 4, 5, 6, 7, 8],
      gLinkCallback: 'LinkCB_BlockSend',
      gLinkVSyncDisabled: true,
      gLinkErrorOccurred: true,
      gSuppressLinkErrorMessage: true,
      sDummy1: true,
      gLinkDummy1: true,
      gLinkDummy2: true,
      gBlockReceivedStatus: [true, true, true, true],
      sBlockSend: { active: true, pos: 14, size: 28, multiplayerId: 1, src: [1] },
      gReadyToCloseLink: [true, true, true, true],
      gReadyToExitStandby: [true, true, true, true]
    });

    InitLink(runtime);
    expect(runtime.gSendCmd).toEqual(Array.from({ length: CMD_LENGTH }, () => LINKCMD_NONE));
    expect(runtime.sLinkOpen).toBe(true);
    expect(runtime.sChecksumAvailable).toBe(0);

    OpenLink(runtime);
    expect(runtime.gLinkCallback).toBe('LinkCB_RequestPlayerDataExchange');
    expect(runtime.gLinkVSyncDisabled).toBe(false);
    expect(runtime.gLinkErrorOccurred).toBe(false);
    expect(runtime.gSuppressLinkErrorMessage).toBe(false);
    expect(runtime.sDummy1).toBe(false);
    expect(runtime.gLinkDummy1).toBe(false);
    expect(runtime.gLinkDummy2).toBe(false);
    expect(runtime.gBlockReceivedStatus).toEqual([false, false, false, false]);
    expect(runtime.sBlockSend.active).toBe(false);
    expect(runtime.gReadyCloseLinkType).toBe(0);
    expect(runtime.gReceivedRemoteLinkPlayers).toBe(false);
    expect(runtime.gRemoteLinkPlayersNotReceived).toEqual([true, true, true, true]);
    expect(runtime.gReadyToCloseLink).toEqual([false, false, false, false]);
    expect(runtime.gReadyToExitStandby).toEqual([false, false, false, false]);
    expect(runtime.triggerHandshakeTasksCreated).toBe(1);

    const taskData = [0];
    for (let i = 0; i < 4; i += 1)
      expect(Task_TriggerHandshake(runtime, taskData)).toBe(false);
    expect(Task_TriggerHandshake(runtime, taskData)).toBe(true);
    expect(runtime.gShouldAdvanceLinkState).toBe(1);

    const rfuRuntime = createDecompLinkRuntime({ gWirelessCommType: 1, gReceivedRemoteLinkPlayers: true });
    OpenLink(rfuRuntime);
    expect(rfuRuntime.rfuApiInitialized).toBe(1);
    expect(rfuRuntime.gReceivedRemoteLinkPlayers).toBe(false);
  });

  test('LinkMain2 clears send command, stores held keys, dispatches callback, recv commands, and errors', () => {
    const runtime = createDecompLinkRuntime({
      sLinkOpen: true,
      gLinkStatus: LINK_STAT_CONN_ESTABLISHED | LINK_STAT_MASTER | (2 << 2),
      gLinkCallback: 'LinkCB_RequestPlayerDataExchange',
      gSendCmd: [1, 2, 3, 4, 5, 6, 7, 8],
      gRecvCmds: Array.from({ length: MAX_RFU_PLAYERS }, () => Array.from({ length: CMD_LENGTH }, () => 0))
    });

    expect(LinkMain2(createDecompLinkRuntime({ sLinkOpen: false }), 0x44)).toBe(0);
    expect(LinkMain2(runtime, 0x1234)).toBe(runtime.gLinkStatus);
    expect(runtime.gLinkHeldKeys).toBe(0x1234);
    expect(runtime.gSendCmd.slice(0, 2)).toEqual([LINKCMD_SEND_LINK_TYPE, runtime.gLinkType]);
    expect(runtime.gLinkCallback).toBeNull();

    const errorRuntime = createDecompLinkRuntime({
      sLinkOpen: true,
      gLinkStatus: LINK_STAT_CONN_ESTABLISHED | LINK_STAT_ERRORS,
      gLinkCallback: null
    });
    LinkMain2(errorRuntime, 0);
    expect(errorRuntime.gLinkErrorOccurred).toBe(true);
    expect(errorRuntime.closedLinkCount).toBe(1);
  });

  test('timed player-data exchange status follows link.c timeout, count, type, and trade readiness branches', () => {
    const runtime = createDecompLinkRuntime({
      sPlayerDataExchangeStatus: 99,
      sTimeOutCounter: 99,
      gLinkStatus: 2 << 2,
      gLinkPlayers: [
        { trainerId: 1, name: 'P0', linkType: 0x2222 },
        { trainerId: 2, name: 'P1', linkType: 0x2222 },
        { trainerId: 0, name: '' },
        { trainerId: 0, name: '' },
        { trainerId: 0, name: '' }
      ]
    });

    OpenLinkTimed(runtime);
    expect(runtime.sPlayerDataExchangeStatus).toBe(EXCHANGE_NOT_STARTED);
    expect(runtime.sTimeOutCounter).toBe(0);
    expect(runtime.gLinkCallback).toBe('LinkCB_RequestPlayerDataExchange');

    for (let i = 0; i < 600; i += 1)
      expect(GetLinkPlayerDataExchangeStatusTimed(runtime, 2, 4)).toBe(EXCHANGE_NOT_STARTED);
    expect(GetLinkPlayerDataExchangeStatusTimed(runtime, 2, 4)).toBe(EXCHANGE_TIMED_OUT);

    runtime.gReceivedRemoteLinkPlayers = true;
    runtime.gLinkStatus = 1 << 2;
    expect(GetLinkPlayerDataExchangeStatusTimed(runtime, 2, 4)).toBe(EXCHANGE_WRONG_NUM_PLAYERS);

    runtime.gLinkStatus = 2 << 2;
    runtime.gLinkPlayers[1].linkType = 0x3333;
    expect(GetLinkPlayerDataExchangeStatusTimed(runtime, 2, 4)).toBe(EXCHANGE_DIFF_SELECTIONS);

    runtime.gLinkPlayers[1].linkType = 0x2222;
    expect(GetLinkPlayerDataExchangeStatusTimed(runtime, 2, 4)).toBe(EXCHANGE_COMPLETE);

    runtime.gLinkPlayers[0].linkType = LINKTYPE_TRADE_SETUP;
    runtime.gLinkPlayers[1].linkType = LINKTYPE_TRADE_SETUP;
    runtime.tradeProgressForLinkTrade = TRADE_BOTH_PLAYERS_READY;
    expect(GetLinkPlayerDataExchangeStatusTimed(runtime, 2, 4)).toBe(EXCHANGE_COMPLETE);
    runtime.tradeProgressForLinkTrade = TRADE_PLAYER_NOT_READY;
    expect(GetLinkPlayerDataExchangeStatusTimed(runtime, 2, 4)).toBe(EXCHANGE_PLAYER_NOT_READY);
    runtime.tradeProgressForLinkTrade = TRADE_PARTNER_NOT_READY;
    expect(GetLinkPlayerDataExchangeStatusTimed(runtime, 2, 4)).toBe(EXCHANGE_PARTNER_NOT_READY);

    const disconnected = createDecompLinkRuntime({
      gReceivedRemoteLinkPlayers: true,
      gLinkStatus: 0,
      gLinkPlayers: [{ trainerId: 1, name: 'P0', linkType: 0 }, { trainerId: 0, name: '' }, { trainerId: 0, name: '' }, { trainerId: 0, name: '' }, { trainerId: 0, name: '' }]
    });
    expect(GetLinkPlayerDataExchangeStatusTimed(disconnected, 0, 4)).toBe(EXCHANGE_COMPLETE);
    expect(disconnected.gLinkErrorOccurred).toBe(true);
    expect(disconnected.closedLinkCount).toBe(1);
  });

  test('IsLinkPlayerDataExchangeComplete sets complete or diff-selection status from current link types', () => {
    const runtime = createDecompLinkRuntime({
      gLinkStatus: 3 << 2,
      gLinkPlayers: [
        { trainerId: 1, name: 'P0', linkType: 0x5555 },
        { trainerId: 2, name: 'P1', linkType: 0x5555 },
        { trainerId: 3, name: 'P2', linkType: 0x5555 },
        { trainerId: 0, name: '' },
        { trainerId: 0, name: '' }
      ]
    });

    expect(IsLinkPlayerDataExchangeComplete(runtime)).toBe(true);
    expect(runtime.sPlayerDataExchangeStatus).toBe(EXCHANGE_COMPLETE);

    runtime.gLinkPlayers[2].linkType = 0x9999;
    expect(IsLinkPlayerDataExchangeComplete(runtime)).toBe(false);
    expect(runtime.sPlayerDataExchangeStatus).toBe(EXCHANGE_DIFF_SELECTIONS);
  });

  test('ProcessRecvCmds mirrors command dispatch for keys, block flow, readiness flags, and callbacks', () => {
    const runtime = createDecompLinkRuntime({
      gLinkStatus: 2 << 2,
      gRecvCmds: Array.from({ length: MAX_RFU_PLAYERS }, () => Array.from({ length: CMD_LENGTH }, () => 0)),
      gRemoteLinkPlayersNotReceived: [true, true, false, false]
    });

    runtime.gRecvCmds[0] = [LINKCMD_SEND_LINK_TYPE, 0, 0, 0, 0, 0, 0, 0];
    ProcessRecvCmds(runtime, 0);
    expect(runtime.gLocalLinkPlayerBlock.magic1).toBe(LINK_MAGIC_GAME_FREAK_INC);
    expect(runtime.gLinkCallback).toBe('LinkCB_BlockSendBegin');
    expect(runtime.sBlockSend.size).toBe(LINK_PLAYER_BLOCK_SIZE);
    expect(runtime.sBlockSend.src).toBe(runtime.gBlockSendBuffer);

    runtime.gLinkCallback = null;
    runtime.gRecvCmds[0] = [LINKCMD_BLENDER_SEND_KEYS, 0x55, 0, 0, 0, 0, 0, 0];
    runtime.gRecvCmds[1] = [LINKCMD_SEND_HELD_KEYS, 0x66, 0, 0, 0, 0, 0, 0];
    ProcessRecvCmds(runtime, 0);
    expect(runtime.gLinkPartnersHeldKeys[0]).toBe(0x55);
    expect(runtime.gLinkPartnersHeldKeys[1]).toBe(0x66);

    runtime.gRecvCmds[0] = [LINKCMD_INIT_BLOCK, 20, 0x82, 0, 0, 0, 0, 0];
    runtime.gRecvCmds[1] = [0, 0, 0, 0, 0, 0, 0, 0];
    ProcessRecvCmds(runtime, 0);
    expect(runtime.sBlockRecv[0]).toEqual({ pos: 0, size: 20, multiplayerId: 0x82 });

    runtime.gBlockRecvBuffer[0] = encodeLinkPlayerBlock(
      LINK_MAGIC_GAME_FREAK_INC,
      { trainerId: 10, name: 'P0', version: 0x4001, progressFlags: 0x12, neverRead: 7 },
      LINK_MAGIC_GAME_FREAK_INC
    );
    runtime.sBlockRecv[0].pos = LINK_PLAYER_BLOCK_SIZE - 14;
    runtime.sBlockRecv[0].size = LINK_PLAYER_BLOCK_SIZE;
    runtime.gRecvCmds[0] = [LINKCMD_CONT_BLOCK, ...runtime.gBlockRecvBuffer[0].slice((LINK_PLAYER_BLOCK_SIZE - 14) / 2, LINK_PLAYER_BLOCK_SIZE / 2)];
    ProcessRecvCmds(runtime, 0);
    expect(runtime.gBlockRecvBuffer[0].slice((LINK_PLAYER_BLOCK_SIZE - 14) / 2, LINK_PLAYER_BLOCK_SIZE / 2)).toEqual(runtime.gRecvCmds[0].slice(1));
    expect(runtime.gLinkPlayers[0]).toMatchObject({ trainerId: 10, name: 'P0', progressFlags: 0, neverRead: 0, progressFlagsCopy: 0 });
    expect(runtime.convertedInternationalStrings.at(-1)).toEqual({ before: 'P0', after: 'P0', language: 0 });
    expect(runtime.gRemoteLinkPlayersNotReceived[0]).toBe(false);

    runtime.gBlockRecvBuffer[1] = encodeLinkPlayerBlock(
      LINK_MAGIC_GAME_FREAK_INC,
      { trainerId: 11, name: 'P1', version: 0x4003, progressFlags: 3 },
      LINK_MAGIC_GAME_FREAK_INC
    );
    runtime.sBlockRecv[1].pos = LINK_PLAYER_BLOCK_SIZE - 14;
    runtime.sBlockRecv[1].size = LINK_PLAYER_BLOCK_SIZE;
    runtime.gRecvCmds[0] = [0, 0, 0, 0, 0, 0, 0, 0];
    runtime.gRecvCmds[1] = [LINKCMD_CONT_BLOCK, ...runtime.gBlockRecvBuffer[1].slice((LINK_PLAYER_BLOCK_SIZE - 14) / 2, LINK_PLAYER_BLOCK_SIZE / 2)];
    ProcessRecvCmds(runtime, 0);
    expect(runtime.gReceivedRemoteLinkPlayers).toBe(true);

    runtime.gRemoteLinkPlayersNotReceived[1] = false;
    runtime.gRecvCmds[1] = [LINKCMD_CONT_BLOCK, 15, 16, 17, 18, 19, 20, 21];
    ProcessRecvCmds(runtime, 0);
    expect(runtime.gBlockReceivedStatus[1]).toBe(true);

    runtime.gRecvCmds[0] = [LINKCMD_READY_CLOSE_LINK, 0, 0, 0, 0, 0, 0, 0];
    runtime.gRecvCmds[1] = [LINKCMD_READY_EXIT_STANDBY, 0, 0, 0, 0, 0, 0, 0];
    runtime.gRecvCmds[2] = [LINKCMD_BLENDER_NO_PBLOCK_SPACE, 0, 0, 0, 0, 0, 0, 0];
    ProcessRecvCmds(runtime, 0);
    expect(runtime.gReadyToCloseLink[0]).toBe(true);
    expect(runtime.gReadyToExitStandby[1]).toBe(true);
    expect(runtime.gLinkCallback).toBe('LinkCB_BerryBlenderSendHeldKeys');

    runtime.gLinkCallback = null;
    ResetBlockSend(runtime);
    runtime.gRecvCmds[0] = [LINKCMD_SEND_BLOCK_REQ, BLOCK_REQ_SIZE_100, 0, 0, 0, 0, 0, 0];
    runtime.gRecvCmds[1] = [LINKCMD_DUMMY_1, 0, 0, 0, 0, 0, 0, 0];
    runtime.gRecvCmds[2] = [0, 0, 0, 0, 0, 0, 0, 0];
    ProcessRecvCmds(runtime, 0);
    expect(runtime.gLinkCallback).toBe('LinkCB_BlockSendBegin');
    expect(runtime.sBlockSend.size).toBe(100);
    expect(runtime.gLinkDummy1).toBe(false);
    expect(runtime.gLinkDummy2).toBe(true);
  });

  test('ProcessRecvCmds uses the exact link.c block request size table', () => {
    const cases: Array<[number, number]> = [
      [BLOCK_REQ_SIZE_NONE, 200],
      [BLOCK_REQ_SIZE_200, 200],
      [BLOCK_REQ_SIZE_100, 100],
      [BLOCK_REQ_SIZE_220, 220],
      [BLOCK_REQ_SIZE_40, 40]
    ];

    for (const [requestType, expectedSize] of cases) {
      const runtime = createDecompLinkRuntime({
        gRecvCmds: Array.from({ length: MAX_RFU_PLAYERS }, () => Array.from({ length: CMD_LENGTH }, () => 0))
      });
      runtime.gRecvCmds[0] = [LINKCMD_SEND_BLOCK_REQ, requestType, 0, 0, 0, 0, 0, 0];

      ProcessRecvCmds(runtime, 0);

      expect(runtime.gLinkCallback).toBe('LinkCB_BlockSendBegin');
      expect(runtime.sBlockSend.active).toBe(true);
      expect(runtime.sBlockSend.pos).toBe(0);
      expect(runtime.sBlockSend.size).toBe(expectedSize);
      expect(runtime.sBlockSend.src).toBe(runtime.gBlockSendBuffer);
      expect(runtime.gSendCmd.slice(0, 3)).toEqual([LINKCMD_INIT_BLOCK, expectedSize, 0x80]);
    }
  });

  test('ResetLinkPlayers clears MAX_LINK_PLAYERS plus one entries like the C loop', () => {
    const runtime = createDecompLinkRuntime({
      gLinkPlayers: Array.from({ length: MAX_RFU_PLAYERS }, (_, i) => ({ trainerId: 100 + i, name: `P${i}` }))
    });

    expect(GetLinkPlayerTrainerId(runtime, 2)).toBe(102);
    ResetLinkPlayers(runtime);
    for (let i = 0; i <= MAX_LINK_PLAYERS; i += 1) {
      expect(runtime.gLinkPlayers[i]).toEqual({ trainerId: 0, name: '' });
    }
  });

  test('ResetLinkPlayerCount clears saved count and saved multiplayer id', () => {
    const runtime = createDecompLinkRuntime({ gSavedLinkPlayerCount: 4, gSavedMultiplayerId: 2 });
    ResetLinkPlayerCount(runtime);
    expect(runtime.gSavedLinkPlayerCount).toBe(0);
    expect(runtime.gSavedMultiplayerId).toBe(0);
  });

  test('LinkMain1 follows start, handshake, init-timer fallthrough, and status bit assembly', () => {
    const runtime = createDecompLinkRuntime();
    const shouldAdvance = { value: 0 };
    const sendCmd = [0xabcd, 0, 0, 0, 0, 0, 0, 0];
    const recvCmds = Array.from({ length: MAX_LINK_PLAYERS }, () => Array.from({ length: CMD_LENGTH }, () => 0xffff));

    expect(LinkMain1(runtime, shouldAdvance, sendCmd, recvCmds)).toBe(0);
    expect(runtime.gLink.state).toBe(LINK_STATE_START1);
    expect(shouldAdvance.value).toBe(0);

    shouldAdvance.value = 1;
    expect(LinkMain1(runtime, shouldAdvance, sendCmd, recvCmds)).toBe(0);
    expect(runtime.gLink.state).toBe(LINK_STATE_HANDSHAKE);

    runtime.gLink.localId = 0;
    runtime.regSiocntTerminals = SIO_MULTI_SD;
    shouldAdvance.value = 0;
    expect(LinkMain1(runtime, shouldAdvance, sendCmd, recvCmds) & LINK_STAT_MASTER).toBe(LINK_STAT_MASTER);
    expect(runtime.gLink.isMaster).toBe(LINK_MASTER);

    runtime.gLink.playerCount = 2;
    shouldAdvance.value = 1;
    LinkMain1(runtime, shouldAdvance, sendCmd, recvCmds);
    expect(runtime.gLink.handshakeAsMaster).toBe(true);

    runtime.gLink.state = LINK_STATE_INIT_TIMER;
    runtime.gLink.localId = 0;
    runtime.gLink.playerCount = 2;
    runtime.gLink.receivedNothing = false;
    runtime.gLink.badChecksum = true;
    runtime.gLink.lag = LAG_MASTER;
    const status = LinkMain1(runtime, shouldAdvance, sendCmd, recvCmds);
    expect(runtime.gLink.state).toBe(LINK_STATE_CONN_ESTABLISHED);
    expect(runtime.timerReload).toBe(-197);
    expect(runtime.regTm3cntL).toBe(-197);
    expect(runtime.regTm3cntH).toBe(TIMER_64CLK | TIMER_INTR_ENABLE);
    expect(runtime.enabledInterrupts).toContain(INTR_FLAG_TIMER3);
    expect(sendCmd).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
    expect(runtime.gLink.sendQueue.count).toBe(1);
    expect(EXTRACT_CONN_ESTABLISHED(status)).toBe(1);
    expect(EXTRACT_PLAYER_COUNT(status)).toBe(2);
    expect(EXTRACT_MASTER(status)).toBe(1);
    expect(EXTRACT_RECEIVED_NOTHING(status)).toBe(1);
    expect(status & LINK_STAT_ERROR_CHECKSUM).toBe(LINK_STAT_ERROR_CHECKSUM);
    expect(status & LINK_STAT_ERROR_LAG_MASTER).toBe(LINK_STAT_ERROR_LAG_MASTER);

    runtime.gLink.localId = MAX_LINK_PLAYERS;
    const invalidStatus = LinkMain1(runtime, shouldAdvance, [0, 0, 0, 0, 0, 0, 0, 0], recvCmds);
    expect(invalidStatus & LINK_STAT_ERROR_INVALID_ID).toBe(LINK_STAT_ERROR_INVALID_ID);
  });

  test('C-named serial setup helpers preserve link.c register and local player side effects', () => {
    const runtime = createDecompLinkRuntime({
      playerTrainerId: [0x12, 0x34, 0x56, 0x78],
      playerName: 'RED',
      playerGender: 1,
      gameLanguage: LANGUAGE_ENGLISH,
      gameVersion: 3,
      gLinkType: LINKTYPE_TRADE,
      nationalPokedexEnabled: true,
      canLinkWithRs: true
    });

    InitLocalLinkPlayer(runtime);
    expect(runtime.gLocalLinkPlayer).toMatchObject({
      trainerId: 0x78563412,
      name: 'RED',
      gender: 1,
      language: LANGUAGE_ENGLISH,
      linkType: LINKTYPE_TRADE,
      version: 0x4003,
      lp_field_2: 0x8000,
      progressFlags: 0x11
    });

    runtime.gLink.state = LINK_STATE_CONN_ESTABLISHED;
    runtime.gLink.playerCount = 4;
    EnableSerial(runtime);
    expect(runtime.regRcnt).toBe(0);
    expect(runtime.regSiocnt).toBe(SIO_MULTI_MODE | SIO_115200_BPS | SIO_INTR_ENABLE);
    expect(runtime.enabledInterrupts).toContain(INTR_FLAG_SERIAL);
    expect(runtime.gLink.state).toBe(0);

    runtime.gLink.playerCount = 3;
    runtime.regSiomltSend = 0xffff;
    runtime.regSiomltRecv = [1, 2, 3, 4];
    DisableSerial(runtime);
    expect(runtime.regSiocnt).toBe(SIO_MULTI_MODE);
    expect(runtime.regTm3cntH).toBe(0);
    expect(runtime.regIf).toBe(INTR_FLAG_TIMER3 | INTR_FLAG_SERIAL);
    expect(runtime.regSiomltSend).toBe(0);
    expect(runtime.regSiomltRecv).toEqual([0, 0, 0, 0]);
    expect(runtime.gLink.playerCount).toBe(0);

    runtime.regSiocntTerminals = SIO_MULTI_SD;
    runtime.gLink.localId = 0;
    CheckMasterOrSlave(runtime);
    expect(runtime.gLink.isMaster).toBe(LINK_MASTER);
    InitTimer(runtime);
    expect(runtime.regTm3cntL).toBe(-197);
    expect(runtime.regTm3cntH).toBe(TIMER_64CLK | TIMER_INTR_ENABLE);

    StartTransfer(runtime);
    expect(runtime.regSiocnt & SIO_START).toBe(SIO_START);
    StopTimer(runtime);
    expect(runtime.regTm3cntH & TIMER_ENABLE).toBe(0);
    expect(runtime.regTm3cntL).toBe(-197);
  });

  test('C-named transfer helpers preserve handshake, recv, send, and completion state transitions', () => {
    const runtime = createDecompLinkRuntime();
    runtime.gLink.handshakeAsMaster = true;
    runtime.sHandshakePlayerCount = 2;
    runtime.regSiomltRecv = [MASTER_HANDSHAKE, SLAVE_HANDSHAKE + 1, 0xffff, 0xffff];

    expect(DoHandshake(runtime)).toBe(true);
    expect(runtime.regSiomltSend).toBe(MASTER_HANDSHAKE);
    expect(runtime.gLink.playerCount).toBe(2);
    expect(runtime.gLink.handshakeAsMaster).toBe(false);
    expect(runtime.regSiomltRecv).toEqual([0, 0, 0, 0]);

    runtime.gLink.playerCount = 2;
    runtime.gLink.sendCmdIndex = 1;
    runtime.gLink.recvCmdIndex = 0;
    runtime.regSiomltRecv = [0x10, 0x20, 0, 0];
    DoRecv(runtime);
    expect(runtime.gLink.checksum).toBe(0x30);
    expect(runtime.sRecvNonzeroCheck).toBe(0x30);
    expect(runtime.gLink.recvQueue.data[0][0][0]).toBe(0x10);
    expect(runtime.gLink.recvQueue.data[1][0][0]).toBe(0x20);

    runtime.gLink.sendQueue.count = 1;
    runtime.gLink.sendQueue.pos = 0;
    runtime.gLink.sendQueue.data[0][0] = 0x1111;
    runtime.gLink.sendCmdIndex = 0;
    runtime.sSendBufferEmpty = false;
    DoSend(runtime);
    expect(runtime.regSiomltSend).toBe(0x1111);
    expect(runtime.gLink.sendCmdIndex).toBe(1);

    runtime.gLink.sendCmdIndex = CMD_LENGTH;
    runtime.gLink.checksum = 0x3333;
    DoSend(runtime);
    expect(runtime.regSiomltSend).toBe(0x3333);
    expect(runtime.gLink.sendQueue.count).toBe(0);
    expect(runtime.gLink.sendQueue.pos).toBe(1);

    runtime.gLink.recvCmdIndex = CMD_LENGTH;
    runtime.gLink.sendCmdIndex = 7;
    SendRecvDone(runtime);
    expect(runtime.gLink.sendCmdIndex).toBe(0);
    expect(runtime.gLink.recvCmdIndex).toBe(0);

    runtime.gLink.isMaster = LINK_MASTER;
    runtime.gLink.recvCmdIndex = 1;
    runtime.regTm3cntH = 0;
    SendRecvDone(runtime);
    expect(runtime.regTm3cntH & TIMER_ENABLE).toBe(TIMER_ENABLE);
  });

  test('C-named remote-player and wireless helpers mirror their guarded global-state updates', () => {
    const runtime = createDecompLinkRuntime({
      gRemoteLinkPlayersNotReceived: [true, true, false, false],
      gReceivedRemoteLinkPlayers: false,
      gLinkStatus: 2 << 2
    });

    HandleReceiveRemoteLinkPlayer(runtime, 0);
    expect(runtime.gReceivedRemoteLinkPlayers).toBe(false);
    HandleReceiveRemoteLinkPlayer(runtime, 1);
    expect(runtime.gRemoteLinkPlayersNotReceived.slice(0, 2)).toEqual([false, false]);
    expect(runtime.gReceivedRemoteLinkPlayers).toBe(true);

    runtime.gWirelessCommType = 1;
    SetWirelessCommType0_Internal(runtime);
    expect(runtime.gWirelessCommType).toBe(1);

    const notReceived = createDecompLinkRuntime({ gWirelessCommType: 1, gReceivedRemoteLinkPlayers: false });
    SetWirelessCommType0_Internal(notReceived);
    expect(notReceived.gWirelessCommType).toBe(0);
  });

  test('HandleLinkConnection mirrors wired LinkMain1/LinkMain2 and RFU early-return branches', () => {
    const wired = createDecompLinkRuntime({
      sLinkOpen: true,
      gWirelessCommType: 0,
      gShouldAdvanceLinkState: 0,
      gMainHeldKeys: 0x1234,
      gLinkCallback: 'LinkCB_SendHeldKeys',
      gReceivedRemoteLinkPlayers: true
    });
    wired.gLink.state = LINK_STATE_CONN_ESTABLISHED;
    wired.gLink.playerCount = 2;
    wired.gLink.recvQueue.count = 0;

    expect(HandleLinkConnection(wired)).toBe(true);
    expect(wired.gShouldAdvanceLinkState).toBe(0);
    expect(wired.gLinkHeldKeys).toBe(0x1234);
    expect(wired.gLinkStatus & LINK_STAT_RECEIVED_NOTHING).toBe(LINK_STAT_RECEIVED_NOTHING);

    const wiredNotSending = createDecompLinkRuntime({
      sLinkOpen: true,
      gWirelessCommType: 0,
      gLinkCallback: null
    });
    wiredNotSending.gLink.state = LINK_STATE_CONN_ESTABLISHED;
    wiredNotSending.gLink.playerCount = 1;
    expect(HandleLinkConnection(wiredNotSending)).toBe(false);

    const wirelessNoCable = createDecompLinkRuntime({
      gWirelessCommType: 1,
      rfuMain1Result: true,
      rfuMain2Result: true,
      rfuRecvQueueEmpty: true
    });
    expect(HandleLinkConnection(wirelessNoCable)).toBe(false);
    expect(wirelessNoCable.rfuMain1Count).toBe(1);
    expect(wirelessNoCable.rfuMain2Count).toBe(1);

    const wirelessForcedCable = createDecompLinkRuntime({
      gWirelessCommType: 1,
      sendingKeysOverCableOverride: true,
      rfuMain1Result: false,
      rfuMain2Result: false,
      rfuRecvQueueEmpty: true
    });
    expect(HandleLinkConnection(wirelessForcedCable)).toBe(true);

    wirelessForcedCable.rfuRecvQueueEmpty = false;
    wirelessForcedCable.rfuMain2Result = true;
    expect(HandleLinkConnection(wirelessForcedCable)).toBe(true);

    wirelessForcedCable.rfuMain2Result = false;
    wirelessForcedCable.rfuMain1Result = true;
    expect(HandleLinkConnection(wirelessForcedCable)).toBe(true);

    wirelessForcedCable.rfuMain1Result = false;
    expect(HandleLinkConnection(wirelessForcedCable)).toBe(false);
  });

  test('LinkVSync and Timer3Intr preserve master/slave lag and transfer start behavior', () => {
    const master = createDecompLinkRuntime();
    master.gLink.isMaster = LINK_MASTER;
    master.gLink.state = LINK_STATE_CONN_ESTABLISHED;
    master.gLink.serialIntrCounter = 8;
    LinkVSync(master);
    expect(master.gLink.lag).toBe(LAG_MASTER);
    expect(master.serialStartedCount).toBe(0);

    master.gLink.hardwareError = true;
    LinkVSync(master);
    expect(master.serialStartedCount).toBe(1);
    expect(master.regSiocnt & SIO_START).toBe(SIO_START);

    master.gLink.hardwareError = false;
    master.gLink.lag = 0;
    master.gLink.serialIntrCounter = 9;
    master.regSiocnt = 0;
    LinkVSync(master);
    expect(master.gLink.serialIntrCounter).toBe(0);
    expect(master.serialStartedCount).toBe(2);
    expect(master.regSiocnt & SIO_START).toBe(SIO_START);

    master.timerEnabled = true;
    master.regTm3cntH = TIMER_ENABLE | TIMER_64CLK | TIMER_INTR_ENABLE;
    Timer3Intr(master);
    expect(master.timerEnabled).toBe(false);
    expect(master.timerReload).toBe(-197);
    expect(master.regTm3cntH & TIMER_ENABLE).toBe(0);
    expect(master.regTm3cntL).toBe(-197);
    expect(master.serialStartedCount).toBe(3);
    expect(master.regSiocnt & SIO_START).toBe(SIO_START);

    const slave = createDecompLinkRuntime();
    slave.gLink.isMaster = LINK_SLAVE;
    slave.gLink.state = LINK_STATE_CONN_ESTABLISHED;
    for (let i = 0; i < 11; i += 1)
      LinkVSync(slave);
    expect(slave.gLink.lag).toBe(LAG_SLAVE);
    const slaveStatus = LinkMain1(
      slave,
      { value: 0 },
      [0, 0, 0, 0, 0, 0, 0, 0],
      Array.from({ length: MAX_LINK_PLAYERS }, () => Array.from({ length: CMD_LENGTH }, () => 0))
    );
    expect(slaveStatus & LINK_STAT_ERROR_LAG_SLAVE).toBe(LINK_STAT_ERROR_LAG_SLAVE);

    const handshakingSlave = createDecompLinkRuntime();
    handshakingSlave.gLink.state = LINK_STATE_HANDSHAKE;
    handshakingSlave.gLink.playerCount = 2;
    handshakingSlave.gLink.link_field_F = 3;
    for (let i = 0; i < 11; i += 1)
      LinkVSync(handshakingSlave);
    expect(handshakingSlave.gLink.playerCount).toBe(0);
    expect(handshakingSlave.gLink.link_field_F).toBe(0);
  });

  test('SerialCB handles handshake completion, recv checksum checks, send queue stepping, and recv queue full', () => {
    const master = createDecompLinkRuntime();
    master.gLink.state = LINK_STATE_HANDSHAKE;
    master.gLink.isMaster = LINK_MASTER;
    master.gLink.handshakeAsMaster = true;
    master.sHandshakePlayerCount = 2;
    master.regSiomltRecv = [MASTER_HANDSHAKE, SLAVE_HANDSHAKE, 0xffff, 0xffff];

    SerialCB(master);
    expect(master.regSiomltSend).toBe(MASTER_HANDSHAKE);
    expect(master.gLink.state).toBe(LINK_STATE_INIT_TIMER);
    expect(master.gLink.serialIntrCounter).toBe(9);
    expect(master.sNumVBlanksWithoutSerialIntr).toBe(0);

    const slave = createDecompLinkRuntime();
    slave.gLink.state = LINK_STATE_HANDSHAKE;
    slave.gLink.isMaster = LINK_SLAVE;
    slave.sHandshakePlayerCount = 2;
    slave.regSiomltRecv = [MASTER_HANDSHAKE, SLAVE_HANDSHAKE + 1, 0xffff, 0xffff];
    SerialCB(slave);
    expect(slave.regSiomltSend).toBe(SLAVE_HANDSHAKE);
    expect(slave.gLink.state).toBe(LINK_STATE_CONN_ESTABLISHED);

    const runtime = createDecompLinkRuntime();
    runtime.gLink.state = LINK_STATE_CONN_ESTABLISHED;
    runtime.gLink.isMaster = LINK_MASTER;
    runtime.gLink.playerCount = 2;
    runtime.gLink.sendQueue.count = 1;
    runtime.gLink.sendQueue.pos = QUEUE_CAPACITY - 1;
    runtime.gLink.sendQueue.data[0][QUEUE_CAPACITY - 1] = 0x1111;
    runtime.gLink.sendQueue.data[1][QUEUE_CAPACITY - 1] = 0x2222;

    runtime.regSiomltRecv = [0, 0, 0, 0];
    SerialCB(runtime);
    expect(runtime.sChecksumAvailable).toBe(1);
    expect(runtime.gLink.sendCmdIndex).toBe(1);
    expect(runtime.regSiomltSend).toBe(0x1111);
    expect(runtime.timerEnabled).toBe(true);
    expect(runtime.regTm3cntH & TIMER_ENABLE).toBe(TIMER_ENABLE);

    runtime.regSiomltRecv = [0x10, 0x20, 0, 0];
    SerialCB(runtime);
    expect(runtime.gLink.recvCmdIndex).toBe(1);
    expect(runtime.gLink.checksum).toBe(0x30);
    expect(runtime.gLink.recvQueue.data[0][0][0]).toBe(0x10);
    expect(runtime.regSiomltSend).toBe(0x2222);

    runtime.gLink.sendCmdIndex = 1;
    runtime.gLink.recvCmdIndex = CMD_LENGTH - 1;
    runtime.sRecvNonzeroCheck = 1;
    runtime.regSiomltRecv = [7, 0x17, 0, 0];
    SerialCB(runtime);
    expect(runtime.gLink.recvQueue.count).toBe(1);
    expect(runtime.gLink.sendCmdIndex).toBe(0);
    expect(runtime.gLink.recvCmdIndex).toBe(0);

    runtime.gLink.sendCmdIndex = CMD_LENGTH;
    runtime.gLink.recvCmdIndex = 0;
    runtime.gLink.checksum = 0x3333;
    runtime.regSiomltRecv = [runtime.gLink.checksum, runtime.gLink.checksum, 0, 0];
    SerialCB(runtime);
    expect(runtime.gLink.badChecksum).toBe(false);
    expect(runtime.gLink.sendQueue.count).toBe(0);
    expect(runtime.gLink.sendQueue.pos).toBe(0);

    runtime.gLink.recvQueue.count = QUEUE_CAPACITY;
    runtime.gLink.sendCmdIndex = 1;
    runtime.gLink.recvCmdIndex = 0;
    runtime.regSiomltRecv = [1, 1, 0, 0];
    SerialCB(runtime);
    expect(runtime.gLink.queueFull).toBe(2);
  });

  test('EnqueueSendCmd mirrors link.c nonzero gate, wraparound slot, and full queue flag', () => {
    const runtime = createDecompLinkRuntime({ regIme: 1 });
    runtime.gLink.sendQueue.pos = QUEUE_CAPACITY - 2;
    runtime.gLink.sendQueue.count = 1;
    const sendCmd = [0x1111, 0, 0x2222, 0, 0, 0, 0, 0];

    EnqueueSendCmd(runtime, sendCmd);
    expect(runtime.gLinkSavedIme).toBe(1);
    expect(runtime.regIme).toBe(1);
    expect(runtime.imeTransitions).toEqual([
      { op: 'save', value: 1 },
      { op: 'disable', value: 0 },
      { op: 'restore', value: 1 }
    ]);
    expect(sendCmd).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
    expect(runtime.gLink.sendQueue.count).toBe(2);
    expect(runtime.gLastSendQueueCount).toBe(2);
    expect(runtime.gLink.sendQueue.data[0][QUEUE_CAPACITY - 1]).toBe(0x1111);
    expect(runtime.gLink.sendQueue.data[2][QUEUE_CAPACITY - 1]).toBe(0x2222);

    EnqueueSendCmd(runtime, [0, 0, 0, 0, 0, 0, 0, 0]);
    expect(runtime.gLink.sendQueue.count).toBe(2);
    expect(runtime.gLastSendQueueCount).toBe(2);

    runtime.gLink.sendQueue.count = QUEUE_CAPACITY;
    runtime.imeTransitions = [];
    EnqueueSendCmd(runtime, [1, 0, 0, 0, 0, 0, 0, 0]);
    expect(runtime.imeTransitions).toEqual([
      { op: 'save', value: 1 },
      { op: 'disable', value: 0 },
      { op: 'restore', value: 1 }
    ]);
    expect(runtime.gLink.queueFull).toBe(QUEUE_FULL_SEND);
    expect(runtime.gLastSendQueueCount).toBe(QUEUE_CAPACITY);
  });

  test('DequeueRecvCmds preserves empty receive zeroing and populated queue wraparound', () => {
    const runtime = createDecompLinkRuntime({ regIme: 1 });
    runtime.gLink.playerCount = 2;
    const recvCmds = Array.from({ length: MAX_LINK_PLAYERS }, () => Array.from({ length: CMD_LENGTH }, () => 0xffff));

    DequeueRecvCmds(runtime, recvCmds);
    expect(runtime.gLinkSavedIme).toBe(1);
    expect(runtime.regIme).toBe(1);
    expect(runtime.imeTransitions).toEqual([
      { op: 'save', value: 1 },
      { op: 'disable', value: 0 },
      { op: 'restore', value: 1 }
    ]);
    expect(recvCmds[0]).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
    expect(recvCmds[1]).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
    expect(recvCmds[2]).toEqual([0xffff, 0xffff, 0xffff, 0xffff, 0xffff, 0xffff, 0xffff, 0xffff]);
    expect(runtime.gLink.receivedNothing).toBe(true);

    runtime.gLink.recvQueue.count = 1;
    runtime.gLink.recvQueue.pos = QUEUE_CAPACITY - 1;
    for (let player = 0; player < 2; player += 1) {
      for (let slot = 0; slot < CMD_LENGTH; slot += 1)
        runtime.gLink.recvQueue.data[player][slot][QUEUE_CAPACITY - 1] = player * 0x100 + slot;
    }

    runtime.imeTransitions = [];
    DequeueRecvCmds(runtime, recvCmds);
    expect(runtime.imeTransitions).toEqual([
      { op: 'save', value: 1 },
      { op: 'disable', value: 0 },
      { op: 'restore', value: 1 }
    ]);
    expect(recvCmds[0]).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(recvCmds[1]).toEqual([0x100, 0x101, 0x102, 0x103, 0x104, 0x105, 0x106, 0x107]);
    expect(runtime.gLink.recvQueue.count).toBe(0);
    expect(runtime.gLink.recvQueue.pos).toBe(0);
    expect(runtime.gLink.receivedNothing).toBe(false);
  });

  test('receive queue length helpers use wired count or RFU count with the overworld max comparison', () => {
    const runtime = createDecompLinkRuntime();
    runtime.gLink.recvQueue.count = OVERWORLD_RECV_QUEUE_MAX;
    expect(GetLinkRecvQueueLength(runtime)).toBe(OVERWORLD_RECV_QUEUE_MAX);
    expect(IsLinkRecvQueueAtOverworldMax(runtime)).toBe(true);

    runtime.gWirelessCommType = 1;
    runtime.rfuRecvQueueLength = OVERWORLD_RECV_QUEUE_MAX - 1;
    expect(GetLinkRecvQueueLength(runtime)).toBe(OVERWORLD_RECV_QUEUE_MAX - 1);
    expect(IsLinkRecvQueueAtOverworldMax(runtime)).toBe(false);
  });

  test('ResetSendBuffer and ResetRecvBuffer clear positions and fill every queued word with LINKCMD_NONE', () => {
    const runtime = createDecompLinkRuntime();
    runtime.gLink.sendQueue.count = 4;
    runtime.gLink.sendQueue.pos = 3;
    runtime.gLink.sendQueue.data[1][2] = 0x1234;
    runtime.gLink.recvQueue.count = 5;
    runtime.gLink.recvQueue.pos = 7;
    runtime.gLink.recvQueue.data[2][3][4] = 0x5678;

    ResetSendBuffer(runtime);
    expect(runtime.gLink.sendQueue.count).toBe(0);
    expect(runtime.gLink.sendQueue.pos).toBe(0);
    for (let slot = 0; slot < CMD_LENGTH; slot += 1)
      expect(runtime.gLink.sendQueue.data[slot].every((word) => word === LINKCMD_NONE)).toBe(true);

    ResetRecvBuffer(runtime);
    expect(runtime.gLink.recvQueue.count).toBe(0);
    expect(runtime.gLink.recvQueue.pos).toBe(0);
    for (let player = 0; player < MAX_LINK_PLAYERS; player += 1) {
      for (let slot = 0; slot < CMD_LENGTH; slot += 1)
        expect(runtime.gLink.recvQueue.data[player][slot].every((word) => word === LINKCMD_NONE)).toBe(true);
    }
  });

  test('exports exact command and dimension constants used by link.c', () => {
    expect(CMD_LENGTH).toBe(8);
    expect(MAX_LINK_PLAYERS).toBe(4);
    expect(MAX_RFU_PLAYERS).toBe(5);
    expect(BLOCK_BUFFER_SIZE).toBe(0x100);
    expect(QUEUE_CAPACITY).toBe(50);
    expect(OVERWORLD_RECV_QUEUE_MAX).toBe(3);
  });
});
