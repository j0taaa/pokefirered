import { describe, expect, test } from 'vitest';
import {
  CLI_COPY_MSG,
  CLI_COPY_RECV,
  CLI_COPY_RECV_IF,
  CLI_COPY_RECV_IF_N,
  CLI_LOAD_GAME_DATA,
  CLI_LOAD_TOSS_RESPONSE,
  CLI_PRINT_MSG,
  CLI_RECV,
  CLI_RET_ACTIVE,
  CLI_RET_COPY_MSG,
  CLI_RET_END,
  CLI_RET_INIT,
  CLI_RET_PRINT_MSG,
  CLI_RET_YES_NO,
  CLI_RETURN,
  CLI_RUN_BUFFER_SCRIPT,
  CLI_RUN_MEVENT_SCRIPT,
  CLI_SAVE_CARD,
  CLI_SAVE_NEWS,
  CLI_SEND_LOADED,
  CLI_SEND_READY_END,
  CLI_SEND_STAT,
  CLI_YES_NO,
  CLIENT_MAX_MSG_SIZE,
  Client_Done,
  Client_Init,
  Client_Recv,
  Client_Run,
  Client_RunBufferScript,
  Client_RunMysteryEventScript,
  Client_Send,
  Client_Wait,
  FUNC_DONE,
  FUNC_RECV,
  FUNC_RUN,
  FUNC_RUN_BUFFER,
  FUNC_RUN_MEVENT,
  FUNC_SEND,
  FUNC_WAIT,
  MysteryGiftClient_AdvanceState,
  MysteryGiftClient_CallFunc,
  MysteryGiftClient_CopyRecvScript,
  MysteryGiftClient_Create,
  MysteryGiftClient_Free,
  MysteryGiftClient_GetMsg,
  MysteryGiftClient_Init,
  MysteryGiftClient_InitSendWord,
  MysteryGiftClient_Run,
  MysteryGiftClient_SetParam,
  createMysteryGiftClientRuntime,
  mysteryGiftClientAdvanceState,
  mysteryGiftClientCallFunc,
  mysteryGiftClientCopyRecvScript,
  mysteryGiftClientCreate,
  mysteryGiftClientGetMsg,
  mysteryGiftClientInitSendWord,
  mysteryGiftClientRun,
  mysteryGiftClientSetParam
} from '../src/game/decompMysteryGiftClient';
import { MG_LINKID_GAME_DATA, MG_LINKID_READY_END, MG_LINKID_RESPONSE } from '../src/game/decompMysteryGiftScripts';

const commandBytes = (...cmds: { instr: number; parameter: number }[]): Uint8Array => {
  const bytes = new Uint8Array(0x400);
  cmds.forEach((cmd, i) => {
    const offset = i * 8;
    bytes[offset] = cmd.instr & 0xff;
    bytes[offset + 1] = (cmd.instr >>> 8) & 0xff;
    bytes[offset + 2] = (cmd.instr >>> 16) & 0xff;
    bytes[offset + 3] = (cmd.instr >>> 24) & 0xff;
    bytes[offset + 4] = cmd.parameter & 0xff;
    bytes[offset + 5] = (cmd.parameter >>> 8) & 0xff;
    bytes[offset + 6] = (cmd.parameter >>> 16) & 0xff;
    bytes[offset + 7] = (cmd.parameter >>> 24) & 0xff;
  });
  return bytes;
};

describe('decomp mystery_gift_client', () => {
  test('create/init and first run load the init script and return CLI_RET_INIT', () => {
    const runtime = createMysteryGiftClientRuntime();
    mysteryGiftClientCreate(runtime);
    const endVal = { value: 0 };

    expect(mysteryGiftClientRun(runtime, endVal)).toBe(CLI_RET_INIT);
    expect(runtime.client?.funcId).toBe(FUNC_RUN);
    expect(runtime.client?.link.sendPlayerId).toBe(1);
    expect(runtime.client?.link.recvPlayerId).toBe(0);
  });

  test('return command ends client and copies param into endVal', () => {
    const runtime = createMysteryGiftClientRuntime();
    mysteryGiftClientCreate(runtime);
    const client = runtime.client!;
    client.funcId = FUNC_RUN;
    client.script = [{ instr: CLI_RETURN, parameter: 77 }];

    const endVal = { value: 0 };
    expect(mysteryGiftClientRun(runtime, endVal)).toBe(CLI_RET_ACTIVE);
    expect(client.funcId).toBe(FUNC_DONE);
    expect(mysteryGiftClientRun(runtime, endVal)).toBe(CLI_RET_END);
    expect(endVal.value).toBe(77);
    expect(runtime.client).toBeNull();
  });

  test('recv and send states wait for link completion before returning to RUN', () => {
    const runtime = createMysteryGiftClientRuntime();
    mysteryGiftClientCreate(runtime);
    const client = runtime.client!;
    client.funcId = FUNC_RUN;
    client.script = [{ instr: CLI_RECV, parameter: 22 }, { instr: CLI_SEND_LOADED, parameter: 0 }];

    mysteryGiftClientCallFunc(runtime, client);
    expect(client.funcId).toBe(FUNC_RECV);
    expect(client.link.recvIdent).toBe(22);
    runtime.linkRecvResults = [false, true];
    mysteryGiftClientCallFunc(runtime, client);
    expect(client.funcId).toBe(FUNC_RECV);
    mysteryGiftClientCallFunc(runtime, client);
    expect(client.funcId).toBe(FUNC_RUN);

    mysteryGiftClientCallFunc(runtime, client);
    expect(client.funcId).toBe(FUNC_SEND);
    runtime.linkSendResults = [true];
    mysteryGiftClientCallFunc(runtime, client);
    expect(client.funcId).toBe(FUNC_RUN);
  });

  test('copy recv script and wait/message commands follow client script semantics', () => {
    const runtime = createMysteryGiftClientRuntime();
    mysteryGiftClientCreate(runtime);
    const client = runtime.client!;
    client.funcId = FUNC_RUN;
    client.recvBuffer.set(commandBytes({ instr: CLI_RETURN, parameter: 9 }));
    mysteryGiftClientCopyRecvScript(client);
    expect(client.script[0]).toEqual({ instr: CLI_RETURN, parameter: 9 });
    expect(client.cmdidx).toBe(0);

    client.param = 0;
    client.script = [{ instr: CLI_COPY_RECV_IF_N, parameter: 0 }];
    mysteryGiftClientCallFunc(runtime, client);
    expect(client.script[0]).toEqual({ instr: CLI_RETURN, parameter: 9 });

    client.param = 1;
    client.cmdidx = 0;
    client.script = [{ instr: CLI_COPY_RECV_IF, parameter: 0 }];
    mysteryGiftClientCallFunc(runtime, client);
    expect(client.script[0]).toEqual({ instr: CLI_RETURN, parameter: 9 });

    client.script = [{ instr: CLI_COPY_RECV, parameter: 0 }, { instr: CLI_YES_NO, parameter: 0 }];
    client.cmdidx = 1;
    client.recvBuffer.fill(0xab, 0, CLIENT_MAX_MSG_SIZE);
    expect(mysteryGiftClientCallFunc(runtime, client)).toBe(CLI_RET_YES_NO);
    expect(client.funcId).toBe(FUNC_WAIT);
    expect(mysteryGiftClientGetMsg(client)[0]).toBe(0xab);
    expect(mysteryGiftClientCallFunc(runtime, client)).toBe(CLI_RET_ACTIVE);
    mysteryGiftClientAdvanceState(client);
    expect(mysteryGiftClientCallFunc(runtime, client)).toBe(CLI_RET_ACTIVE);
    expect(client.funcId).toBe(FUNC_RUN);

    client.script = [{ instr: CLI_PRINT_MSG, parameter: 0 }, { instr: CLI_COPY_MSG, parameter: 0 }];
    client.cmdidx = 0;
    expect(mysteryGiftClientCallFunc(runtime, client)).toBe(CLI_RET_PRINT_MSG);
    client.funcId = FUNC_RUN;
    expect(mysteryGiftClientCallFunc(runtime, client)).toBe(CLI_RET_COPY_MSG);
  });

  test('send-word based commands initialize the link with expected identifiers and word payload', () => {
    const runtime = createMysteryGiftClientRuntime();
    mysteryGiftClientCreate(runtime);
    const client = runtime.client!;
    runtime.gameStats.set(4, 1234);

    mysteryGiftClientInitSendWord(client, MG_LINKID_RESPONSE, 0x89abcdef);
    expect([...client.sendBuffer.slice(0, 4)]).toEqual([0xef, 0xcd, 0xab, 0x89]);
    expect(client.link.sendIdent).toBe(MG_LINKID_RESPONSE);
    expect(client.link.sendSize).toBe(4);

    client.funcId = FUNC_RUN;
    client.script = [
      { instr: CLI_SEND_READY_END, parameter: 0 },
      { instr: CLI_SEND_STAT, parameter: 4 },
      { instr: CLI_LOAD_TOSS_RESPONSE, parameter: 0 },
      { instr: CLI_LOAD_GAME_DATA, parameter: 0 }
    ];
    mysteryGiftClientCallFunc(runtime, client);
    expect(client.link.sendIdent).toBe(MG_LINKID_READY_END);
    expect(client.funcId).toBe(FUNC_SEND);
    client.funcId = FUNC_RUN;
    mysteryGiftClientCallFunc(runtime, client);
    expect(client.link.sendIdent).toBe(18);
    expect([...client.sendBuffer.slice(0, 4)]).toEqual([0xd2, 0x04, 0x00, 0x00]);
    client.funcId = FUNC_RUN;
    mysteryGiftClientSetParam(client, 5);
    mysteryGiftClientCallFunc(runtime, client);
    expect(client.link.sendIdent).toBe(MG_LINKID_RESPONSE);
    expect(client.sendBuffer[0]).toBe(5);
    client.funcId = FUNC_RUN;
    mysteryGiftClientCallFunc(runtime, client);
    expect(runtime.loadedGameData).toBe(1);
    expect(client.link.sendIdent).toBe(MG_LINKID_GAME_DATA);
  });

  test('save and script-run commands record side effects and return to RUN when finished', () => {
    const runtime = createMysteryGiftClientRuntime();
    mysteryGiftClientCreate(runtime);
    const client = runtime.client!;
    client.funcId = FUNC_RUN;
    client.recvBuffer.fill(0x11);
    client.script = [
      { instr: CLI_SAVE_CARD, parameter: 0 },
      { instr: CLI_SAVE_NEWS, parameter: 0 },
      { instr: CLI_RUN_MEVENT_SCRIPT, parameter: 0 },
      { instr: CLI_RUN_BUFFER_SCRIPT, parameter: 0 }
    ];

    mysteryGiftClientCallFunc(runtime, client);
    expect(runtime.savedCards).toHaveLength(1);
    mysteryGiftClientCallFunc(runtime, client);
    expect(runtime.savedNews).toHaveLength(1);
    expect(client.link.sendIdent).toBe(MG_LINKID_RESPONSE);
    expect(client.sendBuffer[0]).toBe(0);

    mysteryGiftClientCallFunc(runtime, client);
    expect(client.funcId).toBe(FUNC_RUN_MEVENT);
    runtime.meventParam = 44;
    mysteryGiftClientCallFunc(runtime, client);
    mysteryGiftClientCallFunc(runtime, client);
    expect(client.funcId).toBe(FUNC_RUN);
    expect(client.param).toBe(44);

    mysteryGiftClientCallFunc(runtime, client);
    expect(client.funcId).toBe(FUNC_RUN_BUFFER);
    runtime.bufferScriptResult = 1;
    runtime.bufferScriptParam = 55;
    mysteryGiftClientCallFunc(runtime, client);
    expect(client.funcId).toBe(FUNC_RUN);
    expect(client.param).toBe(55);
  });

  test('exact C-name exports dispatch create/run/client state machine helpers and free buffers', () => {
    const runtime = createMysteryGiftClientRuntime();
    MysteryGiftClient_Create(runtime);
    const client = runtime.client!;
    const endVal = { value: 0 };

    expect(MysteryGiftClient_Run(runtime, endVal)).toBe(CLI_RET_INIT);
    expect(client.funcId).toBe(FUNC_RUN);

    MysteryGiftClient_SetParam(client, 77);
    expect(client.param).toBe(77);
    expect(MysteryGiftClient_GetMsg(client)).toBe(client.msg);
    MysteryGiftClient_AdvanceState(client);
    expect(client.funcState).toBe(1);

    MysteryGiftClient_InitSendWord(client, MG_LINKID_RESPONSE, 0x01020304);
    expect([...client.sendBuffer.slice(0, 4)]).toEqual([4, 3, 2, 1]);
    expect(client.link.sendIdent).toBe(MG_LINKID_RESPONSE);

    client.recvBuffer.set(commandBytes({ instr: CLI_RETURN, parameter: 99 }));
    MysteryGiftClient_CopyRecvScript(client);
    expect(client.script[0]).toEqual({ instr: CLI_RETURN, parameter: 99 });

    client.funcId = FUNC_RUN;
    expect(Client_Run(runtime, client)).toBe(CLI_RET_ACTIVE);
    expect(client.funcId).toBe(FUNC_DONE);
    expect(Client_Done(client)).toBe(CLI_RET_END);

    MysteryGiftClient_Init(client, 2, 3);
    expect(client.link.sendPlayerId).toBe(2);
    expect(client.link.recvPlayerId).toBe(3);
    expect(Client_Init(client)).toBe(CLI_RET_INIT);
    expect(client.funcId).toBe(FUNC_RUN);

    client.funcId = FUNC_RECV;
    runtime.linkRecvResults = [true];
    expect(Client_Recv(runtime, client)).toBe(CLI_RET_ACTIVE);
    expect(client.funcId).toBe(FUNC_RUN);

    client.funcId = FUNC_SEND;
    runtime.linkSendResults = [true];
    expect(Client_Send(runtime, client)).toBe(CLI_RET_ACTIVE);
    expect(client.funcId).toBe(FUNC_RUN);

    client.funcId = FUNC_WAIT;
    client.funcState = 1;
    expect(Client_Wait(client)).toBe(CLI_RET_ACTIVE);
    expect(client.funcId).toBe(FUNC_RUN);

    client.funcId = FUNC_RUN_MEVENT;
    client.funcState = 0;
    expect(Client_RunMysteryEventScript(runtime, client)).toBe(CLI_RET_ACTIVE);
    runtime.meventParam = 123;
    expect(Client_RunMysteryEventScript(runtime, client)).toBe(CLI_RET_ACTIVE);
    expect(client.funcId).toBe(FUNC_RUN);
    expect(client.param).toBe(123);

    client.funcId = FUNC_RUN_BUFFER;
    runtime.bufferScriptResult = 1;
    runtime.bufferScriptParam = 456;
    expect(Client_RunBufferScript(runtime, client)).toBe(CLI_RET_ACTIVE);
    expect(client.funcId).toBe(FUNC_RUN);
    expect(client.param).toBe(456);

    client.funcId = FUNC_DONE;
    expect(MysteryGiftClient_CallFunc(runtime, client)).toBe(CLI_RET_END);

    MysteryGiftClient_Free(client);
    expect(client.sendBuffer).toHaveLength(0);
    expect(client.recvBuffer).toHaveLength(0);
    expect(client.script).toHaveLength(0);
    expect(client.msg).toHaveLength(0);
  });
});
