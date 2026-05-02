import { describe, expect, test } from 'vitest';
import { calcCRC16WithTable } from '../src/game/decompMysteryGiftLink';
import {
  CLI_RETURN,
  MG_LINKID_CARD,
  MG_LINKID_GAME_DATA,
  MG_LINKID_NEWS,
  MG_LINKID_READY_END,
  sClientScript_CantAccept
} from '../src/game/decompMysteryGiftScripts';
import {
  FUNC_DONE,
  FUNC_RECV,
  FUNC_RUN,
  FUNC_SEND,
  MysterGiftServer_CreateForCard,
  MysterGiftServer_CreateForNews,
  MysterGiftServer_Run,
  MysteryGiftServer_CallFunc,
  MysteryGiftServer_Compare,
  MysteryGiftServer_Free,
  MysteryGiftServer_Init,
  MysteryGiftServer_InitSend,
  Server_Done,
  Server_Init,
  Server_Run,
  Server_Send,
  SVR_CHECK_GAME_DATA,
  SVR_COPY_GAME_DATA,
  SVR_COPY_SAVED_CARD,
  SVR_COPY_SAVED_NEWS,
  SVR_GOTO,
  SVR_GOTO_IF_EQ,
  SVR_LOAD_CARD,
  SVR_LOAD_CLIENT_SCRIPT,
  SVR_LOAD_NEWS,
  SVR_READ_RESPONSE,
  SVR_RECV,
  SVR_RET_ACTIVE,
  SVR_RET_END,
  SVR_RET_INIT,
  SVR_RETURN,
  SVR_SEND,
  WONDER_CARD_SIZE,
  WONDER_NEWS_SIZE,
  createMysteryGiftServerRuntime,
  mysteryGiftServerCallFunc,
  mysteryGiftServerCompare,
  mysterGiftServerCreateForCard,
  mysterGiftServerCreateForNews,
  mysterGiftServerRun,
  type MysteryGiftServerRuntime
} from '../src/game/decompMysteryGiftServer';

const ackPlayer0 = (runtime: MysteryGiftServerRuntime): void => {
  runtime.linkRuntime.blockReceivedStatus |= 1;
};

const recvFromPlayer1 = (
  runtime: MysteryGiftServerRuntime,
  ident: number,
  payload: readonly number[]
): void => {
  runtime.linkRuntime.blockRecvBuffers[1] = {
    ident,
    size: payload.length,
    crc: calcCRC16WithTable(payload, payload.length)
  };
  runtime.linkRuntime.blockReceivedStatus |= 1 << 1;
};

const finishSend = (runtime: MysteryGiftServerRuntime): void => {
  for (let i = 0; i < 8 && runtime.server?.funcId === FUNC_SEND; i += 1) {
    ackPlayer0(runtime);
    mysteryGiftServerCallFunc(runtime, runtime.server);
  }
};

describe('decomp mystery_gift_server', () => {
  test('server creation initializes news/card scripts and init transitions to RUN', () => {
    const runtime = createMysteryGiftServerRuntime();

    mysterGiftServerCreateForNews(runtime);
    expect(runtime.server?.funcId).toBe(0);
    expect(mysterGiftServerRun(runtime, { value: 0 })).toBe(SVR_RET_INIT);
    expect(runtime.server?.funcId).toBe(FUNC_RUN);
    expect(runtime.server?.news).toHaveLength(WONDER_NEWS_SIZE);

    mysterGiftServerCreateForCard(runtime);
    expect(runtime.server?.card).toHaveLength(WONDER_CARD_SIZE);
  });

  test('RETURN stores the end value and public Run frees the active server', () => {
    const runtime = createMysteryGiftServerRuntime();
    runtime.scripts.done = [{ instr: SVR_RETURN, param: 77 }];
    runtime.server = {
      ...runtime.server!,
      unused: 0,
      param: 0,
      funcId: FUNC_RUN,
      cmdidx: 0,
      script: runtime.scripts.done,
      recvBuffer: new Uint8Array(0x400),
      card: new Uint8Array(WONDER_CARD_SIZE),
      news: new Uint8Array(WONDER_NEWS_SIZE),
      linkGameData: new Uint8Array(0x400),
      ramScript: [],
      ramScriptSize: 0,
      clientScript: [],
      clientScriptSize: 0,
      stamp: 0,
      manager: runtime.server?.manager ?? {
        state: 0,
        sendPlayerId: 0,
        recvPlayerId: 1,
        recvIdent: 0,
        recvCounter: 0,
        recvCRC: 0,
        recvSize: 0,
        sendIdent: 0,
        sendCounter: 0,
        sendCRC: 0,
        sendSize: 0,
        recvBuffer: [],
        sendBuffer: [],
        sendFunc: 'MGL_Send',
        recvFunc: 'MGL_Receive'
      }
    };
    const endVal = { value: 0 };

    expect(mysterGiftServerRun(runtime, endVal)).toBe(SVR_RET_ACTIVE);
    expect(runtime.server?.funcId).toBe(FUNC_DONE);
    expect(mysterGiftServerRun(runtime, endVal)).toBe(SVR_RET_END);
    expect(endVal.value).toBe(77);
    expect(runtime.server).toBeNull();
  });

  test('GOTO, CHECK_GAME_DATA, and GOTO_IF_EQ preserve command flow', () => {
    const runtime = createMysteryGiftServerRuntime();
    runtime.validateLinkGameDataResult = 0;
    runtime.scripts.start = [
      { instr: SVR_CHECK_GAME_DATA },
      { instr: SVR_GOTO_IF_EQ, param: 0, ptr: 'fail' },
      { instr: SVR_RETURN, param: 1 }
    ];
    runtime.scripts.fail = [{ instr: SVR_RETURN, param: 99 }];
    mysterGiftServerCreateForNews(runtime);
    runtime.server!.script = runtime.scripts.start;
    runtime.server!.funcId = FUNC_RUN;

    mysteryGiftServerCallFunc(runtime, runtime.server!);
    expect(runtime.server!.param).toBe(0);
    mysteryGiftServerCallFunc(runtime, runtime.server!);
    expect(runtime.server!.script).toBe(runtime.scripts.fail);
    expect(runtime.server!.cmdidx).toBe(0);
    mysteryGiftServerCallFunc(runtime, runtime.server!);
    expect(runtime.server!.param).toBe(99);
  });

  test('RECV initializes link receive and copies received payload into server buffers', () => {
    const runtime = createMysteryGiftServerRuntime();
    mysterGiftServerCreateForNews(runtime);
    const server = runtime.server!;
    server.script = [{ instr: SVR_RECV, param: MG_LINKID_GAME_DATA }, { instr: SVR_COPY_GAME_DATA }];
    server.funcId = FUNC_RUN;

    mysteryGiftServerCallFunc(runtime, server);
    expect(server.funcId).toBe(FUNC_RECV);
    expect(server.manager.recvIdent).toBe(MG_LINKID_GAME_DATA);

    recvFromPlayer1(runtime, MG_LINKID_GAME_DATA, [1, 2, 3, 4]);
    mysteryGiftServerCallFunc(runtime, server);
    runtime.linkRuntime.blockRecvBuffers[1] = [1, 2, 3, 4];
    runtime.linkRuntime.blockReceivedStatus |= 1 << 1;
    mysteryGiftServerCallFunc(runtime, server);
    mysteryGiftServerCallFunc(runtime, server);
    expect(server.funcId).toBe(FUNC_RUN);
    expect([...server.recvBuffer.slice(0, 4)]).toEqual([1, 2, 3, 4]);

    mysteryGiftServerCallFunc(runtime, server);
    expect([...server.linkGameData.slice(0, 4)]).toEqual([1, 2, 3, 4]);
  });

  test('LOAD_CARD/LOAD_NEWS and SEND use the shared Mystery Gift link runtime', () => {
    const runtime = createMysteryGiftServerRuntime();
    mysterGiftServerCreateForCard(runtime);
    const server = runtime.server!;
    server.card.set([9, 8, 7, 6]);
    server.news.set([5, 4, 3, 2]);

    server.script = [{ instr: SVR_LOAD_CARD }, { instr: SVR_SEND }, { instr: SVR_LOAD_NEWS }];
    server.funcId = FUNC_RUN;
    mysteryGiftServerCallFunc(runtime, server);
    expect(server.manager.sendIdent).toBe(MG_LINKID_CARD);
    expect(server.manager.sendSize).toBe(WONDER_CARD_SIZE);
    expect(server.manager.sendBuffer.slice(0, 4)).toEqual([9, 8, 7, 6]);

    mysteryGiftServerCallFunc(runtime, server);
    expect(server.funcId).toBe(FUNC_SEND);
    mysteryGiftServerCallFunc(runtime, server);
    finishSend(runtime);
    expect(server.funcId).toBe(FUNC_RUN);
    expect(runtime.linkRuntime.sentBlocks[0].data).toMatchObject({ ident: MG_LINKID_CARD });

    mysteryGiftServerCallFunc(runtime, server);
    expect(server.manager.sendIdent).toBe(MG_LINKID_NEWS);
    expect(server.manager.sendSize).toBe(WONDER_NEWS_SIZE);
  });

  test('script data, response reads, saved copies, and pointer compare match server commands', () => {
    const runtime = createMysteryGiftServerRuntime();
    runtime.clientScripts.sClientScript_CantAccept = sClientScript_CantAccept;
    runtime.savedWonderCard = [11, 22, 33];
    runtime.savedWonderNews = [44, 55, 66];
    runtime.scripts.local = [
      { instr: SVR_COPY_SAVED_CARD },
      { instr: SVR_COPY_SAVED_NEWS },
      { instr: SVR_LOAD_CLIENT_SCRIPT, ptr: 'sClientScript_CantAccept', param: sClientScript_CantAccept.length * 8 },
      { instr: SVR_READ_RESPONSE },
      { instr: SVR_GOTO, ptr: 'done' }
    ];
    runtime.scripts.done = [{ instr: SVR_RETURN, param: 5 }];
    mysterGiftServerCreateForCard(runtime);
    const server = runtime.server!;
    server.script = runtime.scripts.local;
    server.funcId = FUNC_RUN;
    server.recvBuffer.set([0xef, 0xbe, 0xad, 0xde]);

    mysteryGiftServerCallFunc(runtime, server);
    expect([...server.card.slice(0, 3)]).toEqual([11, 22, 33]);
    expect(runtime.disabledCardSending).toBe(1);
    mysteryGiftServerCallFunc(runtime, server);
    expect([...server.news.slice(0, 3)]).toEqual([44, 55, 66]);
    mysteryGiftServerCallFunc(runtime, server);
    expect(server.manager.sendIdent).toBe(16);
    expect(server.manager.sendSize).toBe(sClientScript_CantAccept.length * 8);
    expect(server.manager.sendBuffer[0]).toBe(sClientScript_CantAccept[0].instr);
    expect(server.manager.sendBuffer.at(-8)).toBe(CLI_RETURN);
    mysteryGiftServerCallFunc(runtime, server);
    expect(server.param).toBe(0xdeadbeef);
    mysteryGiftServerCallFunc(runtime, server);
    expect(server.script).toBe(runtime.scripts.done);

    expect(mysteryGiftServerCompare(3, 2)).toBe(0);
    expect(mysteryGiftServerCompare(3, 3)).toBe(1);
    expect(mysteryGiftServerCompare(3, 4)).toBe(2);
  });

  test('server run returns END immediately when no server exists', () => {
    const runtime = createMysteryGiftServerRuntime();
    expect(mysterGiftServerRun(runtime, { value: 0 })).toBe(SVR_RET_END);
    expect(MG_LINKID_READY_END).toBe(20);
  });

  test('exact C-name mystery gift server exports preserve create/init/run/send/done/free behavior', () => {
    const runtime = createMysteryGiftServerRuntime();
    const endVal = { value: 0 };

    expect(MysterGiftServer_Run(runtime, endVal)).toBe(SVR_RET_END);
    MysterGiftServer_CreateForNews(runtime);
    expect(runtime.server?.news).toHaveLength(WONDER_NEWS_SIZE);
    expect(MysteryGiftServer_CallFunc(runtime, runtime.server!)).toBe(SVR_RET_INIT);
    expect(runtime.server?.funcId).toBe(FUNC_RUN);

    runtime.server!.script = [{ instr: SVR_LOAD_CARD }, { instr: SVR_SEND }, { instr: SVR_RETURN, param: 44 }];
    runtime.server!.cmdidx = 0;
    runtime.server!.funcId = FUNC_RUN;
    runtime.server!.card.set([1, 2, 3, 4]);
    expect(Server_Run(runtime, runtime.server!)).toBe(SVR_RET_ACTIVE);
    expect(runtime.server!.manager.sendIdent).toBe(MG_LINKID_CARD);

    expect(Server_Run(runtime, runtime.server!)).toBe(SVR_RET_ACTIVE);
    expect(runtime.server!.funcId).toBe(FUNC_SEND);
    expect(Server_Send(runtime, runtime.server!)).toBe(SVR_RET_ACTIVE);
    finishSend(runtime);
    expect(runtime.server!.funcId).toBe(FUNC_RUN);

    expect(Server_Run(runtime, runtime.server!)).toBe(SVR_RET_ACTIVE);
    expect(runtime.server!.funcId).toBe(FUNC_DONE);
    expect(Server_Done(runtime.server!)).toBe(SVR_RET_END);
    expect(MysterGiftServer_Run(runtime, endVal)).toBe(SVR_RET_END);
    expect(endVal.value).toBe(44);
    expect(runtime.server).toBeNull();

    MysterGiftServer_CreateForCard(runtime);
    const server = runtime.server!;
    MysteryGiftServer_Init(server, runtime.scripts.gMysteryGiftServerScript_SendWonderNews, 0, 1);
    expect(server.funcId).toBe(0);
    expect(Server_Init(server)).toBe(SVR_RET_INIT);
    MysteryGiftServer_InitSend(server, MG_LINKID_NEWS, [9, 8, 7], 3);
    expect(server.manager.sendIdent).toBe(MG_LINKID_NEWS);
    expect(server.manager.sendBuffer.slice(0, 3)).toEqual([9, 8, 7]);
    expect(MysteryGiftServer_Compare(2, 3)).toBe(2);
    MysteryGiftServer_Free(server);
    expect(server.card).toHaveLength(0);
    expect(server.news).toHaveLength(0);
  });
});
