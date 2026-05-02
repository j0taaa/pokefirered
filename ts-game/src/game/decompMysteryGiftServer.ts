import {
  MG_LINK_BUFFER_SIZE,
  MysteryGiftLinkRuntime,
  MysteryGiftLinkState,
  createMysteryGiftLink,
  createMysteryGiftLinkRuntime,
  mysteryGiftLinkInit,
  mysteryGiftLinkInitRecv,
  mysteryGiftLinkInitSend,
  mysteryGiftLinkRecv,
  mysteryGiftLinkSend
} from './decompMysteryGiftLink';
import {
  HAS_DIFF_CARD,
  MG_LINKID_CARD,
  MG_LINKID_CLIENT_SCRIPT,
  MG_LINKID_NEWS,
  MG_LINKID_RAM_SCRIPT,
  SVR_CHECK_EXISTING_CARD,
  SVR_CHECK_GAME_DATA,
  SVR_COPY_GAME_DATA,
  SVR_COPY_SAVED_CARD,
  SVR_COPY_SAVED_NEWS,
  SVR_COPY_SAVED_RAM_SCRIPT,
  SVR_GOTO,
  SVR_GOTO_IF_EQ,
  SVR_LOAD_CARD,
  SVR_LOAD_CLIENT_SCRIPT,
  SVR_LOAD_NEWS,
  SVR_LOAD_RAM_SCRIPT,
  SVR_READ_RESPONSE,
  SVR_RECV,
  SVR_RETURN,
  SVR_SEND,
  gMysteryGiftServerScript_SendWonderCard,
  gMysteryGiftServerScript_SendWonderNews,
  type MysteryGiftClientCmd,
  type MysteryGiftServerCmd
} from './decompMysteryGiftScripts';

export {
  SVR_CHECK_EXISTING_CARD,
  SVR_CHECK_GAME_DATA,
  SVR_COPY_GAME_DATA,
  SVR_COPY_SAVED_CARD,
  SVR_COPY_SAVED_NEWS,
  SVR_COPY_SAVED_RAM_SCRIPT,
  SVR_GOTO,
  SVR_GOTO_IF_EQ,
  SVR_LOAD_CARD,
  SVR_LOAD_CLIENT_SCRIPT,
  SVR_LOAD_NEWS,
  SVR_LOAD_RAM_SCRIPT,
  SVR_READ_RESPONSE,
  SVR_RECV,
  SVR_RETURN,
  SVR_SEND
};

export const SVR_RET_INIT = 0;
export const SVR_RET_ACTIVE = 1;
export const SVR_RET_UNUSED = 2;
export const SVR_RET_END = 3;

export const FUNC_INIT = 0;
export const FUNC_DONE = 1;
export const FUNC_RECV = 2;
export const FUNC_SEND = 3;
export const FUNC_RUN = 4;

export const SVR_CHECK_EXISTING_STAMPS = 9;
export const SVR_GET_CARD_STAT = 10;
export const SVR_CHECK_QUESTIONNAIRE = 11;
export const SVR_COMPARE = 12;
export const SVR_LOAD_STAMP = 16;
export const SVR_LOAD_UNK_2 = 17;
export const SVR_LOAD_EREADER_TRAINER = 19;
export const SVR_LOAD_MSG = 20;
export const SVR_COPY_STAMP = 21;
export const SVR_COPY_CARD = 22;
export const SVR_COPY_NEWS = 23;
export const SVR_SET_RAM_SCRIPT = 24;
export const SVR_SET_CLIENT_SCRIPT = 25;
export const SVR_LOAD_UNK_1 = 29;

export const MG_LINKID_GAME_STAT = 18;
export const MG_LINKID_DYNAMIC_MSG = 21;
export const MG_LINKID_STAMP = 24;
export const MG_LINKID_EREADER_TRAINER = 26;
export const MG_LINKID_UNK_1 = 27;
export const MG_LINKID_UNK_2 = 28;

export const WONDER_CARD_SIZE = 332;
export const WONDER_NEWS_SIZE = 444;
export const EREADER_TRAINER_SIZE = 0x1b0;
export const STAMP_SIZE = 4;

export interface MysteryGiftServer {
  unused: number;
  param: number;
  funcId: number;
  cmdidx: number;
  script: readonly MysteryGiftServerCmd[];
  recvBuffer: Uint8Array;
  card: Uint8Array;
  news: Uint8Array;
  linkGameData: Uint8Array;
  ramScript: ArrayLike<number>;
  ramScriptSize: number;
  clientScript: ArrayLike<number>;
  clientScriptSize: number;
  stamp: number;
  manager: MysteryGiftLinkState;
}

export interface MysteryGiftServerRuntime {
  server: MysteryGiftServer | null;
  linkRuntime: MysteryGiftLinkRuntime;
  scripts: Record<string, readonly MysteryGiftServerCmd[]>;
  clientScripts: Record<string, readonly MysteryGiftClientCmd[]>;
  data: Record<string, readonly number[]>;
  savedWonderCard: ArrayLike<number>;
  savedWonderNews: ArrayLike<number>;
  savedRamScript: ArrayLike<number> | null;
  validateLinkGameDataResult: number;
  compareCardFlagsResult: number;
  checkStampsResult: number;
  questionnaireMatchResult: number;
  cardStats: Map<number, number>;
  disabledCardSending: number;
}

const emptyBytes = (size: number): Uint8Array => new Uint8Array(size);

export const createMysteryGiftServerRuntime = (): MysteryGiftServerRuntime => ({
  server: null,
  linkRuntime: createMysteryGiftLinkRuntime(),
  scripts: {
    gMysteryGiftServerScript_SendWonderNews,
    gMysteryGiftServerScript_SendWonderCard
  },
  clientScripts: {},
  data: {},
  savedWonderCard: [],
  savedWonderNews: [],
  savedRamScript: null,
  validateLinkGameDataResult: 1,
  compareCardFlagsResult: HAS_DIFF_CARD,
  checkStampsResult: 0,
  questionnaireMatchResult: 0,
  cardStats: new Map(),
  disabledCardSending: 0
});

export const mysteryGiftServerInit = (
  server: MysteryGiftServer,
  script: readonly MysteryGiftServerCmd[],
  sendPlayerId: number,
  recvPlayerId: number
): void => {
  server.unused = 0;
  server.funcId = FUNC_INIT;
  server.card = emptyBytes(WONDER_CARD_SIZE);
  server.news = emptyBytes(WONDER_NEWS_SIZE);
  server.recvBuffer = emptyBytes(MG_LINK_BUFFER_SIZE);
  server.linkGameData = emptyBytes(MG_LINK_BUFFER_SIZE);
  server.script = script;
  server.cmdidx = 0;
  mysteryGiftLinkInit(server.manager, sendPlayerId, recvPlayerId);
};

const createServer = (script: readonly MysteryGiftServerCmd[]): MysteryGiftServer => {
  const server: MysteryGiftServer = {
    unused: 0,
    param: 0,
    funcId: FUNC_INIT,
    cmdidx: 0,
    script,
    recvBuffer: emptyBytes(MG_LINK_BUFFER_SIZE),
    card: emptyBytes(WONDER_CARD_SIZE),
    news: emptyBytes(WONDER_NEWS_SIZE),
    linkGameData: emptyBytes(MG_LINK_BUFFER_SIZE),
    ramScript: [],
    ramScriptSize: 0,
    clientScript: [],
    clientScriptSize: 0,
    stamp: 0,
    manager: createMysteryGiftLink()
  };
  mysteryGiftServerInit(server, script, 0, 1);
  return server;
};

export const mysterGiftServerCreateForNews = (runtime: MysteryGiftServerRuntime): void => {
  runtime.server = createServer(gMysteryGiftServerScript_SendWonderNews);
};

export const mysterGiftServerCreateForCard = (runtime: MysteryGiftServerRuntime): void => {
  runtime.server = createServer(gMysteryGiftServerScript_SendWonderCard);
};

export const mysterGiftServerRun = (
  runtime: MysteryGiftServerRuntime,
  endVal: { value: number }
): number => {
  if (runtime.server === null) {
    return SVR_RET_END;
  }
  const result = mysteryGiftServerCallFunc(runtime, runtime.server);
  if (result === SVR_RET_END) {
    endVal.value = runtime.server.param & 0xffff;
    runtime.server = null;
  }
  return result;
};

const copyInto = (dest: Uint8Array, source: ArrayLike<number>): void => {
  dest.fill(0);
  for (let i = 0; i < Math.min(dest.length, source.length); i += 1) {
    dest[i] = source[i] & 0xff;
  }
};

const encodeClientScript = (script: readonly MysteryGiftClientCmd[]): number[] => {
  const bytes: number[] = [];
  for (const cmd of script) {
    const instr = cmd.instr >>> 0;
    const parameter = (cmd.parameter ?? 0) >>> 0;
    bytes.push(instr & 0xff, (instr >>> 8) & 0xff, (instr >>> 16) & 0xff, (instr >>> 24) & 0xff);
    bytes.push(parameter & 0xff, (parameter >>> 8) & 0xff, (parameter >>> 16) & 0xff, (parameter >>> 24) & 0xff);
  }
  return bytes;
};

const resolveScript = (
  runtime: MysteryGiftServerRuntime,
  ptr: string | undefined
): readonly MysteryGiftServerCmd[] => {
  if (ptr === undefined || runtime.scripts[ptr] === undefined) {
    throw new Error(`unknown mystery gift server script ${ptr ?? '<null>'}`);
  }
  return runtime.scripts[ptr];
};

const resolveData = (
  runtime: MysteryGiftServerRuntime,
  ptr: string | undefined
): readonly number[] | null => {
  if (ptr === undefined) {
    return null;
  }
  if (runtime.data[ptr] !== undefined) {
    return runtime.data[ptr];
  }
  if (runtime.clientScripts[ptr] !== undefined) {
    return encodeClientScript(runtime.clientScripts[ptr]);
  }
  return null;
};

export const mysteryGiftServerInitSend = (
  server: MysteryGiftServer,
  ident: number,
  src: ArrayLike<number>,
  size: number
): void => {
  if (size > MG_LINK_BUFFER_SIZE) {
    throw new Error('MysteryGiftServer_InitSend size exceeds MG_LINK_BUFFER_SIZE');
  }
  mysteryGiftLinkInitSend(server.manager, ident, Array.from(src), size);
};

export const mysteryGiftServerGetSendData = (
  dynamicData: ArrayLike<number> | null,
  defaultData: ArrayLike<number>
): ArrayLike<number> => dynamicData ?? defaultData;

export const mysteryGiftServerCompare = (a: number, b: number): number => {
  if (b < a) {
    return 0;
  }
  if (b === a) {
    return 1;
  }
  return 2;
};

const readU32 = (bytes: Uint8Array): number =>
  (bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24)) >>> 0;

const serverInit = (server: MysteryGiftServer): number => {
  server.funcId = FUNC_RUN;
  return SVR_RET_INIT;
};

const serverDone = (_server: MysteryGiftServer): number => SVR_RET_END;

const serverRecv = (runtime: MysteryGiftServerRuntime, server: MysteryGiftServer): number => {
  if (mysteryGiftLinkRecv(runtime.linkRuntime, server.manager)) {
    copyInto(server.recvBuffer, server.manager.recvBuffer);
    server.funcId = FUNC_RUN;
  }
  return SVR_RET_ACTIVE;
};

const serverSend = (runtime: MysteryGiftServerRuntime, server: MysteryGiftServer): number => {
  if (mysteryGiftLinkSend(runtime.linkRuntime, server.manager)) {
    server.funcId = FUNC_RUN;
  }
  return SVR_RET_ACTIVE;
};

const loadSendData = (
  runtime: MysteryGiftServerRuntime,
  server: MysteryGiftServer,
  cmd: MysteryGiftServerCmd,
  ident: number,
  fallback: ArrayLike<number>,
  fallbackSize: number
): void => {
  const dynamic = resolveData(runtime, cmd.ptr);
  const data = mysteryGiftServerGetSendData(dynamic, fallback);
  mysteryGiftServerInitSend(server, ident, data, cmd.ptr === undefined ? fallbackSize : (Number(cmd.param ?? data.length) >>> 0));
};

const serverRun = (runtime: MysteryGiftServerRuntime, server: MysteryGiftServer): number => {
  const cmd = server.script[server.cmdidx];
  server.cmdidx += 1;

  switch (cmd.instr) {
    case SVR_RETURN:
      server.funcId = FUNC_DONE;
      server.param = Number(cmd.param ?? 0) >>> 0;
      break;
    case SVR_SEND:
      server.funcId = FUNC_SEND;
      break;
    case SVR_RECV:
      mysteryGiftLinkInitRecv(server.manager, Number(cmd.param ?? 0) >>> 0, MG_LINK_BUFFER_SIZE);
      server.funcId = FUNC_RECV;
      break;
    case SVR_GOTO:
      server.cmdidx = 0;
      server.script = resolveScript(runtime, cmd.ptr);
      break;
    case SVR_COPY_GAME_DATA:
      copyInto(server.linkGameData, server.recvBuffer);
      break;
    case SVR_CHECK_GAME_DATA:
      server.param = runtime.validateLinkGameDataResult >>> 0;
      break;
    case SVR_GOTO_IF_EQ:
      if (server.param === (Number(cmd.param ?? 0) >>> 0)) {
        server.cmdidx = 0;
        server.script = resolveScript(runtime, cmd.ptr);
      }
      break;
    case SVR_CHECK_EXISTING_CARD:
      server.param = runtime.compareCardFlagsResult >>> 0;
      break;
    case SVR_READ_RESPONSE:
      server.param = readU32(server.recvBuffer);
      break;
    case SVR_CHECK_EXISTING_STAMPS:
      server.param = runtime.checkStampsResult >>> 0;
      break;
    case SVR_GET_CARD_STAT:
      server.param = runtime.cardStats.get(Number(cmd.param ?? 0) >>> 0) ?? 0;
      break;
    case SVR_CHECK_QUESTIONNAIRE:
      server.param = runtime.questionnaireMatchResult >>> 0;
      break;
    case SVR_COMPARE:
      server.param = mysteryGiftServerCompare(Number(cmd.ptr ?? 0) >>> 0, readU32(server.recvBuffer));
      break;
    case SVR_LOAD_NEWS:
      loadSendData(runtime, server, cmd, MG_LINKID_NEWS, server.news, WONDER_NEWS_SIZE);
      break;
    case SVR_LOAD_CARD:
      loadSendData(runtime, server, cmd, MG_LINKID_CARD, server.card, WONDER_CARD_SIZE);
      break;
    case SVR_LOAD_STAMP:
      loadSendData(runtime, server, cmd, MG_LINKID_STAMP, [server.stamp & 0xff, (server.stamp >>> 8) & 0xff, (server.stamp >>> 16) & 0xff, (server.stamp >>> 24) & 0xff], STAMP_SIZE);
      break;
    case SVR_LOAD_RAM_SCRIPT:
      mysteryGiftServerInitSend(
        server,
        MG_LINKID_RAM_SCRIPT,
        cmd.ptr === undefined ? server.ramScript : (resolveData(runtime, cmd.ptr) ?? []),
        cmd.ptr === undefined ? server.ramScriptSize : (Number(cmd.param ?? 0) >>> 0)
      );
      break;
    case SVR_LOAD_CLIENT_SCRIPT:
      mysteryGiftServerInitSend(
        server,
        MG_LINKID_CLIENT_SCRIPT,
        cmd.ptr === undefined ? server.clientScript : (resolveData(runtime, cmd.ptr) ?? []),
        cmd.ptr === undefined ? server.clientScriptSize : (Number(cmd.param ?? 0) >>> 0)
      );
      break;
    case SVR_LOAD_EREADER_TRAINER:
      mysteryGiftServerInitSend(server, MG_LINKID_EREADER_TRAINER, resolveData(runtime, cmd.ptr) ?? [], EREADER_TRAINER_SIZE);
      break;
    case SVR_LOAD_MSG:
      mysteryGiftServerInitSend(server, MG_LINKID_DYNAMIC_MSG, resolveData(runtime, cmd.ptr) ?? [], Number(cmd.param ?? 0) >>> 0);
      break;
    case SVR_LOAD_UNK_2:
      mysteryGiftServerInitSend(server, MG_LINKID_UNK_2, resolveData(runtime, cmd.ptr) ?? [], Number(cmd.param ?? 0) >>> 0);
      break;
    case SVR_COPY_CARD:
      copyInto(server.card, resolveData(runtime, cmd.ptr) ?? []);
      break;
    case SVR_COPY_NEWS:
      copyInto(server.news, resolveData(runtime, cmd.ptr) ?? []);
      break;
    case SVR_COPY_STAMP:
      server.stamp = Number(resolveData(runtime, cmd.ptr)?.[0] ?? 0) >>> 0;
      break;
    case SVR_SET_RAM_SCRIPT:
      server.ramScript = resolveData(runtime, cmd.ptr) ?? [];
      server.ramScriptSize = Number(cmd.param ?? 0) >>> 0;
      break;
    case SVR_SET_CLIENT_SCRIPT:
      server.clientScript = resolveData(runtime, cmd.ptr) ?? [];
      server.clientScriptSize = Number(cmd.param ?? 0) >>> 0;
      break;
    case SVR_COPY_SAVED_CARD:
      copyInto(server.card, runtime.savedWonderCard);
      runtime.disabledCardSending += 1;
      break;
    case SVR_COPY_SAVED_NEWS:
      copyInto(server.news, runtime.savedWonderNews);
      break;
    case SVR_COPY_SAVED_RAM_SCRIPT:
      server.ramScript = runtime.savedRamScript ?? [];
      server.ramScriptSize = runtime.savedRamScript?.length ?? 0;
      break;
    case SVR_LOAD_UNK_1:
      mysteryGiftServerInitSend(server, MG_LINKID_UNK_1, resolveData(runtime, cmd.ptr) ?? [], Number(cmd.param ?? 0) >>> 0);
      break;
  }

  return SVR_RET_ACTIVE;
};

export const mysteryGiftServerCallFunc = (
  runtime: MysteryGiftServerRuntime,
  server: MysteryGiftServer
): number => {
  switch (server.funcId) {
    case FUNC_INIT:
      return serverInit(server);
    case FUNC_DONE:
      return serverDone(server);
    case FUNC_RECV:
      return serverRecv(runtime, server);
    case FUNC_SEND:
      return serverSend(runtime, server);
    case FUNC_RUN:
      return serverRun(runtime, server);
    default:
      throw new Error(`invalid mystery gift server funcId ${server.funcId}`);
  }
};

export function MysterGiftServer_CreateForNews(runtime: MysteryGiftServerRuntime): void {
  mysterGiftServerCreateForNews(runtime);
}

export function MysterGiftServer_CreateForCard(runtime: MysteryGiftServerRuntime): void {
  mysterGiftServerCreateForCard(runtime);
}

export function MysterGiftServer_Run(
  runtime: MysteryGiftServerRuntime,
  endVal: { value: number }
): number {
  return mysterGiftServerRun(runtime, endVal);
}

export function MysteryGiftServer_Init(
  server: MysteryGiftServer,
  script: readonly MysteryGiftServerCmd[],
  sendPlayerId: number,
  recvPlayerId: number
): void {
  mysteryGiftServerInit(server, script, sendPlayerId, recvPlayerId);
}

export function MysteryGiftServer_Free(server: MysteryGiftServer): void {
  server.card = emptyBytes(0);
  server.news = emptyBytes(0);
  server.recvBuffer = emptyBytes(0);
  server.linkGameData = emptyBytes(0);
}

export function MysteryGiftServer_InitSend(
  server: MysteryGiftServer,
  ident: number,
  src: ArrayLike<number>,
  size: number
): void {
  mysteryGiftServerInitSend(server, ident, src, size);
}

export function MysteryGiftServer_Compare(a: number, b: number): number {
  return mysteryGiftServerCompare(a, b);
}

export function Server_Init(server: MysteryGiftServer): number {
  return serverInit(server);
}

export function Server_Done(server: MysteryGiftServer): number {
  return serverDone(server);
}

export function Server_Recv(
  runtime: MysteryGiftServerRuntime,
  server: MysteryGiftServer
): number {
  return serverRecv(runtime, server);
}

export function Server_Send(
  runtime: MysteryGiftServerRuntime,
  server: MysteryGiftServer
): number {
  return serverSend(runtime, server);
}

export function Server_Run(
  runtime: MysteryGiftServerRuntime,
  server: MysteryGiftServer
): number {
  return serverRun(runtime, server);
}

export function MysteryGiftServer_CallFunc(
  runtime: MysteryGiftServerRuntime,
  server: MysteryGiftServer
): number {
  return mysteryGiftServerCallFunc(runtime, server);
}
