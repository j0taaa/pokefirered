import {
  MG_LINK_BUFFER_SIZE,
  MysteryGiftLinkState,
  mysteryGiftLinkInit,
  mysteryGiftLinkInitRecv,
  mysteryGiftLinkInitSend
} from './decompMysteryGiftLink';
import {
  CLI_COPY_MSG,
  CLI_COPY_RECV,
  CLI_LOAD_GAME_DATA,
  CLI_LOAD_TOSS_RESPONSE,
  CLI_RECV,
  CLI_RETURN,
  CLI_SAVE_CARD,
  CLI_SAVE_NEWS,
  CLI_SEND_LOADED,
  CLI_SEND_READY_END,
  MG_LINKID_GAME_DATA,
  MG_LINKID_READY_END,
  MG_LINKID_RESPONSE,
  gMysteryGiftClientScript_Init
} from './decompMysteryGiftScripts';

export {
  CLI_COPY_MSG,
  CLI_COPY_RECV,
  CLI_LOAD_GAME_DATA,
  CLI_LOAD_TOSS_RESPONSE,
  CLI_RECV,
  CLI_RETURN,
  CLI_SAVE_CARD,
  CLI_SAVE_NEWS,
  CLI_SEND_LOADED,
  CLI_SEND_READY_END
};

export const CLI_NONE = 0;
export const CLI_COPY_RECV_IF_N = 6;
export const CLI_COPY_RECV_IF = 7;
export const CLI_YES_NO = 5;
export const CLI_PRINT_MSG = 11;
export const CLI_RUN_MEVENT_SCRIPT = 15;
export const CLI_ASK_TOSS = 13;
export const CLI_SAVE_STAMP = 16;
export const CLI_SAVE_RAM_SCRIPT = 17;
export const CLI_RECV_EREADER_TRAINER = 18;
export const CLI_SEND_STAT = 19;
export const CLI_RUN_BUFFER_SCRIPT = 21;

export const CLI_RET_INIT = 0;
export const CLI_RET_ACTIVE = 1;
export const CLI_RET_YES_NO = 2;
export const CLI_RET_PRINT_MSG = 3;
export const CLI_RET_ASK_TOSS = 4;
export const CLI_RET_COPY_MSG = 5;
export const CLI_RET_END = 6;
export const CLIENT_MAX_MSG_SIZE = 64;

export const FUNC_INIT = 0;
export const FUNC_DONE = 1;
export const FUNC_RECV = 2;
export const FUNC_SEND = 3;
export const FUNC_RUN = 4;
export const FUNC_WAIT = 5;
export const FUNC_RUN_MEVENT = 6;
export const FUNC_RUN_BUFFER = 7;

export interface MysteryGiftClientCmd {
  instr: number;
  parameter: number;
}

export interface MysteryGiftClient {
  unused: number;
  param: number;
  funcId: number;
  funcState: number;
  cmdidx: number;
  sendBuffer: Uint8Array;
  recvBuffer: Uint8Array;
  script: MysteryGiftClientCmd[];
  msg: Uint8Array;
  link: MysteryGiftLinkState;
}

export interface MysteryGiftClientRuntime {
  client: MysteryGiftClient | null;
  linkRecvResults: boolean[];
  linkSendResults: boolean[];
  gameStats: Map<number, number>;
  loadedGameData: number;
  savedCards: Uint8Array[];
  savedNews: Uint8Array[];
  wonderNewsSame: boolean;
  meventRunsRemaining: number;
  meventParam: number;
  bufferScriptResult: number;
  bufferScriptParam: number;
  stampsSaved: number;
  ramScriptsInitialized: number;
  ereaderValidated: number;
  decompressionBuffer: Uint8Array;
}

export const createMysteryGiftClientRuntime = (): MysteryGiftClientRuntime => ({
  client: null,
  linkRecvResults: [],
  linkSendResults: [],
  gameStats: new Map(),
  loadedGameData: 0,
  savedCards: [],
  savedNews: [],
  wonderNewsSame: false,
  meventRunsRemaining: 0,
  meventParam: 0,
  bufferScriptResult: 0,
  bufferScriptParam: 0,
  stampsSaved: 0,
  ramScriptsInitialized: 0,
  ereaderValidated: 0,
  decompressionBuffer: new Uint8Array(MG_LINK_BUFFER_SIZE)
});

const emptyClient = (): MysteryGiftClient => ({
  unused: 0,
  param: 0,
  funcId: FUNC_INIT,
  funcState: 0,
  cmdidx: 0,
  sendBuffer: new Uint8Array(MG_LINK_BUFFER_SIZE),
  recvBuffer: new Uint8Array(MG_LINK_BUFFER_SIZE),
  script: [],
  msg: new Uint8Array(CLIENT_MAX_MSG_SIZE),
  link: {
    state: 0,
    sendPlayerId: 0,
    recvPlayerId: 0,
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
    recvFunc: 'MGL_Receive',
    sendFunc: 'MGL_Send'
  }
});

export const mysteryGiftClientInit = (
  client: MysteryGiftClient,
  sendPlayerId: number,
  recvPlayerId: number
): void => {
  client.unused = 0;
  client.funcId = FUNC_INIT;
  client.funcState = 0;
  client.sendBuffer = new Uint8Array(MG_LINK_BUFFER_SIZE);
  client.recvBuffer = new Uint8Array(MG_LINK_BUFFER_SIZE);
  client.script = [];
  client.msg = new Uint8Array(CLIENT_MAX_MSG_SIZE);
  mysteryGiftLinkInit(client.link, sendPlayerId, recvPlayerId);
};

export const mysteryGiftClientCreate = (runtime: MysteryGiftClientRuntime): void => {
  const client = emptyClient();
  mysteryGiftClientInit(client, 1, 0);
  runtime.client = client;
};

export const mysteryGiftClientRun = (
  runtime: MysteryGiftClientRuntime,
  endVal: { value: number }
): number => {
  if (runtime.client === null) {
    return CLI_RET_END;
  }
  const result = mysteryGiftClientCallFunc(runtime, runtime.client);
  if (result === CLI_RET_END) {
    endVal.value = runtime.client.param & 0xffff;
    runtime.client = null;
  }
  return result;
};

export const mysteryGiftClientAdvanceState = (client: MysteryGiftClient): void => {
  client.funcState += 1;
};

export const mysteryGiftClientGetMsg = (client: MysteryGiftClient): Uint8Array => client.msg;
export const mysteryGiftClientSetParam = (client: MysteryGiftClient, val: number): void => {
  client.param = val >>> 0;
};

export const mysteryGiftClientFree = (client: MysteryGiftClient): void => {
  client.sendBuffer = new Uint8Array(0);
  client.recvBuffer = new Uint8Array(0);
  client.script = [];
  client.msg = new Uint8Array(0);
};

export const mysteryGiftClientCopyRecvScript = (client: MysteryGiftClient): void => {
  client.script = bytesToCommands(client.recvBuffer);
  client.cmdidx = 0;
};

const bytesToCommands = (bytes: Uint8Array): MysteryGiftClientCmd[] => {
  const commands: MysteryGiftClientCmd[] = [];
  for (let i = 0; i + 7 < bytes.length; i += 8) {
    const instr = bytes[i] | (bytes[i + 1] << 8) | (bytes[i + 2] << 16) | (bytes[i + 3] << 24);
    const parameter = bytes[i + 4] | (bytes[i + 5] << 8) | (bytes[i + 6] << 16) | (bytes[i + 7] << 24);
    commands.push({ instr: instr >>> 0, parameter: parameter >>> 0 });
    if (instr === CLI_RETURN) {
      break;
    }
  }
  return commands;
};

export const mysteryGiftClientInitSendWord = (
  client: MysteryGiftClient,
  ident: number,
  word: number
): void => {
  client.sendBuffer.fill(0);
  client.sendBuffer[0] = word & 0xff;
  client.sendBuffer[1] = (word >>> 8) & 0xff;
  client.sendBuffer[2] = (word >>> 16) & 0xff;
  client.sendBuffer[3] = (word >>> 24) & 0xff;
  mysteryGiftLinkInitSend(client.link, ident, Array.from(client.sendBuffer), 4);
};

const clientInit = (client: MysteryGiftClient): number => {
  client.script = gMysteryGiftClientScript_Init.map((cmd) => ({ instr: cmd.instr, parameter: cmd.parameter ?? 0 }));
  client.cmdidx = 0;
  client.funcId = FUNC_RUN;
  client.funcState = 0;
  return CLI_RET_INIT;
};

const clientDone = (_client: MysteryGiftClient): number => CLI_RET_END;

const clientRecv = (runtime: MysteryGiftClientRuntime, client: MysteryGiftClient): number => {
  if (runtime.linkRecvResults.shift() === true) {
    client.funcId = FUNC_RUN;
    client.funcState = 0;
  }
  return CLI_RET_ACTIVE;
};

const clientSend = (runtime: MysteryGiftClientRuntime, client: MysteryGiftClient): number => {
  if (runtime.linkSendResults.shift() === true) {
    client.funcId = FUNC_RUN;
    client.funcState = 0;
  }
  return CLI_RET_ACTIVE;
};

const copyMsg = (client: MysteryGiftClient): void => {
  client.msg.set(client.recvBuffer.subarray(0, CLIENT_MAX_MSG_SIZE));
};

const clientRun = (runtime: MysteryGiftClientRuntime, client: MysteryGiftClient): number => {
  const cmd = client.script[client.cmdidx++] ?? { instr: CLI_RETURN, parameter: 0 };
  switch (cmd.instr) {
    case CLI_NONE:
      break;
    case CLI_RETURN:
      client.param = cmd.parameter;
      client.funcId = FUNC_DONE;
      client.funcState = 0;
      break;
    case CLI_RECV:
      mysteryGiftLinkInitRecv(client.link, cmd.parameter, MG_LINK_BUFFER_SIZE);
      client.funcId = FUNC_RECV;
      client.funcState = 0;
      break;
    case CLI_SEND_LOADED:
      client.funcId = FUNC_SEND;
      client.funcState = 0;
      break;
    case CLI_SEND_READY_END:
      mysteryGiftLinkInitSend(client.link, MG_LINKID_READY_END, Array.from(client.sendBuffer), 0);
      client.funcId = FUNC_SEND;
      client.funcState = 0;
      break;
    case CLI_SEND_STAT:
      mysteryGiftClientInitSendWord(client, 18, runtime.gameStats.get(cmd.parameter) ?? 0);
      client.funcId = FUNC_SEND;
      client.funcState = 0;
      break;
    case CLI_COPY_RECV_IF_N:
      if (client.param === 0) mysteryGiftClientCopyRecvScript(client);
      break;
    case CLI_COPY_RECV_IF:
      if (client.param === 1) mysteryGiftClientCopyRecvScript(client);
      break;
    case CLI_COPY_RECV:
      mysteryGiftClientCopyRecvScript(client);
      break;
    case CLI_YES_NO:
      copyMsg(client);
      client.funcId = FUNC_WAIT;
      client.funcState = 0;
      return CLI_RET_YES_NO;
    case CLI_PRINT_MSG:
      copyMsg(client);
      client.funcId = FUNC_WAIT;
      client.funcState = 0;
      return CLI_RET_PRINT_MSG;
    case CLI_COPY_MSG:
      copyMsg(client);
      client.funcId = FUNC_WAIT;
      client.funcState = 0;
      return CLI_RET_COPY_MSG;
    case CLI_ASK_TOSS:
      client.funcId = FUNC_WAIT;
      client.funcState = 0;
      return CLI_RET_ASK_TOSS;
    case CLI_LOAD_GAME_DATA:
      runtime.loadedGameData += 1;
      mysteryGiftLinkInitSend(client.link, MG_LINKID_GAME_DATA, Array.from(client.sendBuffer), 0);
      break;
    case CLI_LOAD_TOSS_RESPONSE:
      mysteryGiftClientInitSendWord(client, MG_LINKID_RESPONSE, client.param);
      break;
    case CLI_SAVE_CARD:
      runtime.savedCards.push(new Uint8Array(client.recvBuffer));
      break;
    case CLI_SAVE_NEWS:
      if (!runtime.wonderNewsSame) {
        runtime.savedNews.push(new Uint8Array(client.recvBuffer));
        mysteryGiftClientInitSendWord(client, MG_LINKID_RESPONSE, 0);
      } else {
        mysteryGiftClientInitSendWord(client, MG_LINKID_RESPONSE, 1);
      }
      break;
    case CLI_RUN_MEVENT_SCRIPT:
      client.funcId = FUNC_RUN_MEVENT;
      client.funcState = 0;
      break;
    case CLI_SAVE_STAMP:
      runtime.stampsSaved += 1;
      break;
    case CLI_SAVE_RAM_SCRIPT:
      runtime.ramScriptsInitialized += 1;
      break;
    case CLI_RECV_EREADER_TRAINER:
      runtime.ereaderValidated += 1;
      break;
    case CLI_RUN_BUFFER_SCRIPT:
      runtime.decompressionBuffer.set(client.recvBuffer);
      client.funcId = FUNC_RUN_BUFFER;
      client.funcState = 0;
      break;
  }
  return CLI_RET_ACTIVE;
};

const clientWait = (client: MysteryGiftClient): number => {
  if (client.funcState) {
    client.funcId = FUNC_RUN;
    client.funcState = 0;
  }
  return CLI_RET_ACTIVE;
};

const clientRunMysteryEventScript = (runtime: MysteryGiftClientRuntime, client: MysteryGiftClient): number => {
  switch (client.funcState) {
    case 0:
      client.funcState += 1;
      break;
    case 1:
      if (runtime.meventRunsRemaining <= 0) {
        client.param = runtime.meventParam;
        client.funcId = FUNC_RUN;
        client.funcState = 0;
      } else {
        runtime.meventRunsRemaining -= 1;
      }
      break;
  }
  return CLI_RET_ACTIVE;
};

const clientRunBufferScript = (runtime: MysteryGiftClientRuntime, client: MysteryGiftClient): number => {
  client.param = runtime.bufferScriptParam;
  if (runtime.bufferScriptResult === 1) {
    client.funcId = FUNC_RUN;
    client.funcState = 0;
  }
  return CLI_RET_ACTIVE;
};

export const mysteryGiftClientCallFunc = (
  runtime: MysteryGiftClientRuntime,
  client: MysteryGiftClient
): number => {
  switch (client.funcId) {
    case FUNC_INIT:
      return clientInit(client);
    case FUNC_DONE:
      return clientDone(client);
    case FUNC_RECV:
      return clientRecv(runtime, client);
    case FUNC_SEND:
      return clientSend(runtime, client);
    case FUNC_RUN:
      return clientRun(runtime, client);
    case FUNC_WAIT:
      return clientWait(client);
    case FUNC_RUN_MEVENT:
      return clientRunMysteryEventScript(runtime, client);
    case FUNC_RUN_BUFFER:
      return clientRunBufferScript(runtime, client);
    default:
      return CLI_RET_ACTIVE;
  }
};

export const MysteryGiftClient_Create = mysteryGiftClientCreate;
export const MysteryGiftClient_Run = mysteryGiftClientRun;
export const MysteryGiftClient_AdvanceState = mysteryGiftClientAdvanceState;
export const MysteryGiftClient_GetMsg = mysteryGiftClientGetMsg;
export const MysteryGiftClient_SetParam = mysteryGiftClientSetParam;
export const MysteryGiftClient_Init = mysteryGiftClientInit;
export const MysteryGiftClient_Free = mysteryGiftClientFree;
export const MysteryGiftClient_CopyRecvScript = mysteryGiftClientCopyRecvScript;
export const MysteryGiftClient_InitSendWord = mysteryGiftClientInitSendWord;
export const Client_Init = clientInit;
export const Client_Done = clientDone;
export const Client_Recv = clientRecv;
export const Client_Send = clientSend;
export const Client_Run = clientRun;
export const Client_Wait = clientWait;
export const Client_RunMysteryEventScript = clientRunMysteryEventScript;
export const Client_RunBufferScript = clientRunBufferScript;
export const MysteryGiftClient_CallFunc = mysteryGiftClientCallFunc;
