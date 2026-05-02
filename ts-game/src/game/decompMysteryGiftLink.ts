export const MG_LINK_BUFFER_SIZE = 0x400;
export const MGL_BLOCK_SIZE = 252;

export interface SendRecvHeader {
  ident: number;
  crc: number;
  size: number;
}

export interface MysteryGiftLinkState {
  state: number;
  sendPlayerId: number;
  recvPlayerId: number;
  recvIdent: number;
  recvCounter: number;
  recvCRC: number;
  recvSize: number;
  sendIdent: number;
  sendCounter: number;
  sendCRC: number;
  sendSize: number;
  recvBuffer: number[];
  sendBuffer: number[];
  sendFunc: 'MGL_Send';
  recvFunc: 'MGL_Receive';
}

export interface MysteryGiftLinkRuntime {
  blockRecvBuffers: Record<number, number[] | SendRecvHeader>;
  blockReceivedStatus: number;
  sentBlocks: Array<{ playerId: number; data: number[] | SendRecvHeader; size: number }>;
  linkTaskFinished: boolean;
  fatalError: boolean;
}

export const createMysteryGiftLink = (): MysteryGiftLinkState => ({
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
  sendFunc: 'MGL_Send',
  recvFunc: 'MGL_Receive'
});

export const createMysteryGiftLinkRuntime = (): MysteryGiftLinkRuntime => ({
  blockRecvBuffers: {},
  blockReceivedStatus: 0,
  sentBlocks: [],
  linkTaskFinished: true,
  fatalError: false
});

export const calcCRC16WithTable = (
  data: readonly number[],
  size: number
): number => {
  let crc = 0xffff;
  for (let i = 0; i < size; i += 1) {
    crc ^= (data[i] ?? 0) & 0xff;
    for (let bit = 0; bit < 8; bit += 1) {
      if ((crc & 1) !== 0) {
        crc = (crc >>> 1) ^ 0xa001;
      } else {
        crc >>>= 1;
      }
    }
  }
  return crc & 0xffff;
};

export const mysteryGiftLinkInit = (
  link: MysteryGiftLinkState,
  sendPlayerId: number,
  recvPlayerId: number
): void => {
  link.sendPlayerId = sendPlayerId;
  link.recvPlayerId = recvPlayerId;
  link.state = 0;
  link.sendCRC = 0;
  link.sendSize = 0;
  link.sendCounter = 0;
  link.recvCRC = 0;
  link.recvSize = 0;
  link.recvCounter = 0;
  link.sendBuffer = [];
  link.recvBuffer = [];
  link.sendFunc = 'MGL_Send';
  link.recvFunc = 'MGL_Receive';
};

export const mysteryGiftLinkInitSend = (
  link: MysteryGiftLinkState,
  ident: number,
  src: readonly number[],
  size: number
): void => {
  link.state = 0;
  link.sendIdent = ident;
  link.sendCounter = 0;
  link.sendCRC = 0;
  link.sendSize = size !== 0 ? size : MG_LINK_BUFFER_SIZE;
  link.sendBuffer = Array.from(src);
};

export const mysteryGiftLinkInitRecv = (
  link: MysteryGiftLinkState,
  ident: number,
  destSize = MG_LINK_BUFFER_SIZE
): void => {
  link.state = 0;
  link.recvIdent = ident;
  link.recvCounter = 0;
  link.recvCRC = 0;
  link.recvSize = 0;
  link.recvBuffer = Array.from({ length: destSize }, () => 0);
};

const hasReceived = (
  runtime: MysteryGiftLinkRuntime,
  playerId: number
): boolean => ((runtime.blockReceivedStatus >> playerId) & 1) !== 0;

const resetReceived = (
  runtime: MysteryGiftLinkRuntime,
  playerId: number
): void => {
  runtime.blockReceivedStatus &= ~(1 << playerId);
};

const receiveBlock = (
  runtime: MysteryGiftLinkRuntime,
  playerId: number
): number[] | SendRecvHeader => runtime.blockRecvBuffers[playerId] ?? [];

const sendBlock = (
  runtime: MysteryGiftLinkRuntime,
  playerId: number,
  data: number[] | SendRecvHeader,
  size: number
): void => {
  runtime.sentBlocks.push({ playerId, data: Array.isArray(data) ? data.slice(0, size) : { ...data }, size });
};

const fatalError = (runtime: MysteryGiftLinkRuntime): void => {
  runtime.fatalError = true;
};

export const mysteryGiftLinkRecv = (
  runtime: MysteryGiftLinkRuntime,
  link: MysteryGiftLinkState
): boolean => {
  switch (link.state) {
    case 0:
      if (hasReceived(runtime, link.recvPlayerId)) {
        const header = receiveBlock(runtime, link.recvPlayerId) as SendRecvHeader;
        link.recvSize = header.size;
        link.recvCRC = header.crc;
        if (link.recvSize > MG_LINK_BUFFER_SIZE) {
          fatalError(runtime);
          return false;
        }
        if (link.recvIdent !== header.ident) {
          fatalError(runtime);
          return false;
        }
        link.recvCounter = 0;
        resetReceived(runtime, link.recvPlayerId);
        link.state += 1;
      }
      break;
    case 1:
      if (hasReceived(runtime, link.recvPlayerId)) {
        const blocksize = link.recvCounter * MGL_BLOCK_SIZE;
        const remaining = link.recvSize - blocksize;
        const copySize = remaining <= MGL_BLOCK_SIZE ? remaining : MGL_BLOCK_SIZE;
        const block = receiveBlock(runtime, link.recvPlayerId) as number[];
        for (let i = 0; i < copySize; i += 1) {
          link.recvBuffer[blocksize + i] = block[i] ?? 0;
        }
        link.recvCounter += 1;
        if (remaining <= MGL_BLOCK_SIZE) {
          link.state += 1;
        }
        resetReceived(runtime, link.recvPlayerId);
      }
      break;
    case 2:
      if (calcCRC16WithTable(link.recvBuffer, link.recvSize) !== link.recvCRC) {
        fatalError(runtime);
        return false;
      }
      link.state = 0;
      return true;
  }
  return false;
};

export const mysteryGiftLinkSend = (
  runtime: MysteryGiftLinkRuntime,
  link: MysteryGiftLinkState
): boolean => {
  switch (link.state) {
    case 0:
      if (runtime.linkTaskFinished) {
        const header = {
          ident: link.sendIdent,
          size: link.sendSize,
          crc: calcCRC16WithTable(link.sendBuffer, link.sendSize)
        };
        link.sendCRC = header.crc;
        link.sendCounter = 0;
        sendBlock(runtime, 0, header, 6);
        link.state += 1;
      }
      break;
    case 1:
      if (runtime.linkTaskFinished && hasReceived(runtime, link.sendPlayerId)) {
        resetReceived(runtime, link.sendPlayerId);
        const blocksize = MGL_BLOCK_SIZE * link.sendCounter;
        const remaining = link.sendSize - blocksize;
        const copySize = remaining <= MGL_BLOCK_SIZE ? remaining : MGL_BLOCK_SIZE;
        sendBlock(runtime, 0, link.sendBuffer.slice(blocksize), copySize);
        link.sendCounter += 1;
        if (remaining <= MGL_BLOCK_SIZE) {
          link.state += 1;
        }
      }
      break;
    case 2:
      if (runtime.linkTaskFinished) {
        if (calcCRC16WithTable(link.sendBuffer, link.sendSize) !== link.sendCRC) {
          fatalError(runtime);
        } else {
          link.state += 1;
        }
      }
      break;
    case 3:
      if (hasReceived(runtime, link.sendPlayerId)) {
        resetReceived(runtime, link.sendPlayerId);
        link.state = 0;
        return true;
      }
      break;
  }
  return false;
};

export function MysteryGiftLink_Recv(
  runtime: MysteryGiftLinkRuntime,
  link: MysteryGiftLinkState
): boolean {
  return mysteryGiftLinkRecv(runtime, link);
}

export function MysteryGiftLink_Send(
  runtime: MysteryGiftLinkRuntime,
  link: MysteryGiftLinkState
): boolean {
  return mysteryGiftLinkSend(runtime, link);
}

export function MysteryGiftLink_Init(
  link: MysteryGiftLinkState,
  sendPlayerId: number,
  recvPlayerId: number
): void {
  mysteryGiftLinkInit(link, sendPlayerId, recvPlayerId);
}

export function MysteryGiftLink_InitSend(
  link: MysteryGiftLinkState,
  ident: number,
  src: readonly number[],
  size: number
): void {
  mysteryGiftLinkInitSend(link, ident, src, size);
}

export function MysteryGiftLink_InitRecv(
  link: MysteryGiftLinkState,
  ident: number,
  destSize = MG_LINK_BUFFER_SIZE
): void {
  mysteryGiftLinkInitRecv(link, ident, destSize);
}

export function MGL_ReceiveBlock(
  runtime: MysteryGiftLinkRuntime,
  playerId: number
): number[] | SendRecvHeader {
  return receiveBlock(runtime, playerId);
}

export function MGL_HasReceived(
  runtime: MysteryGiftLinkRuntime,
  playerId: number
): boolean {
  return hasReceived(runtime, playerId);
}

export function MGL_ResetReceived(
  runtime: MysteryGiftLinkRuntime,
  playerId: number
): void {
  resetReceived(runtime, playerId);
}

export function MGL_Receive(
  runtime: MysteryGiftLinkRuntime,
  link: MysteryGiftLinkState
): boolean {
  return mysteryGiftLinkRecv(runtime, link);
}

export function MGL_Send(
  runtime: MysteryGiftLinkRuntime,
  link: MysteryGiftLinkState
): boolean {
  return mysteryGiftLinkSend(runtime, link);
}
