import { describe, expect, test } from 'vitest';
import {
  MG_LINK_BUFFER_SIZE,
  MGL_BLOCK_SIZE,
  MGL_HasReceived,
  MGL_Receive,
  MGL_ReceiveBlock,
  MGL_ResetReceived,
  MGL_Send,
  MysteryGiftLink_Init,
  MysteryGiftLink_InitRecv,
  MysteryGiftLink_InitSend,
  MysteryGiftLink_Recv,
  MysteryGiftLink_Send,
  calcCRC16WithTable,
  createMysteryGiftLink,
  createMysteryGiftLinkRuntime,
  mysteryGiftLinkInit,
  mysteryGiftLinkInitRecv,
  mysteryGiftLinkInitSend,
  mysteryGiftLinkRecv,
  mysteryGiftLinkSend
} from '../src/game/decompMysteryGiftLink';

describe('decompMysteryGiftLink', () => {
  test('Init, InitSend, and InitRecv reset the same fields as C', () => {
    const link = createMysteryGiftLink();
    mysteryGiftLinkInit(link, 1, 2);
    expect(link).toMatchObject({
      sendPlayerId: 1,
      recvPlayerId: 2,
      state: 0,
      sendCRC: 0,
      sendSize: 0,
      recvCRC: 0,
      recvSize: 0,
      sendFunc: 'MGL_Send',
      recvFunc: 'MGL_Receive'
    });

    mysteryGiftLinkInitSend(link, 55, [1, 2, 3], 0);
    expect(link).toMatchObject({ sendIdent: 55, sendCounter: 0, sendSize: MG_LINK_BUFFER_SIZE });
    mysteryGiftLinkInitRecv(link, 66, 8);
    expect(link).toMatchObject({ recvIdent: 66, recvCounter: 0, recvSize: 0 });
    expect(link.recvBuffer).toHaveLength(8);
  });

  test('Receive validates header, copies 252-byte blocks, and verifies CRC', () => {
    const runtime = createMysteryGiftLinkRuntime();
    const link = createMysteryGiftLink();
    const payload = Array.from({ length: MGL_BLOCK_SIZE + 3 }, (_, i) => i & 0xff);
    mysteryGiftLinkInit(link, 0, 1);
    mysteryGiftLinkInitRecv(link, 99, payload.length);
    runtime.blockRecvBuffers[1] = { ident: 99, size: payload.length, crc: calcCRC16WithTable(payload, payload.length) };
    runtime.blockReceivedStatus = 1 << 1;

    expect(mysteryGiftLinkRecv(runtime, link)).toBe(false);
    expect(link.state).toBe(1);
    expect(runtime.blockReceivedStatus).toBe(0);

    runtime.blockRecvBuffers[1] = payload.slice(0, MGL_BLOCK_SIZE);
    runtime.blockReceivedStatus = 1 << 1;
    expect(mysteryGiftLinkRecv(runtime, link)).toBe(false);
    expect(link.recvCounter).toBe(1);
    expect(link.state).toBe(1);

    runtime.blockRecvBuffers[1] = payload.slice(MGL_BLOCK_SIZE);
    runtime.blockReceivedStatus = 1 << 1;
    expect(mysteryGiftLinkRecv(runtime, link)).toBe(false);
    expect(link.state).toBe(2);
    expect(mysteryGiftLinkRecv(runtime, link)).toBe(true);
    expect(link.state).toBe(0);
    expect(link.recvBuffer.slice(0, payload.length)).toEqual(payload);
  });

  test('Receive reports fatal errors for oversize, ident mismatch, and bad CRC', () => {
    const runtime = createMysteryGiftLinkRuntime();
    const link = createMysteryGiftLink();
    mysteryGiftLinkInit(link, 0, 1);
    mysteryGiftLinkInitRecv(link, 1);
    runtime.blockRecvBuffers[1] = { ident: 1, size: MG_LINK_BUFFER_SIZE + 1, crc: 0 };
    runtime.blockReceivedStatus = 1 << 1;
    expect(mysteryGiftLinkRecv(runtime, link)).toBe(false);
    expect(runtime.fatalError).toBe(true);

    const mismatchRuntime = createMysteryGiftLinkRuntime();
    mysteryGiftLinkInitRecv(link, 2);
    mismatchRuntime.blockRecvBuffers[1] = { ident: 3, size: 1, crc: 0 };
    mismatchRuntime.blockReceivedStatus = 1 << 1;
    mysteryGiftLinkRecv(mismatchRuntime, link);
    expect(mismatchRuntime.fatalError).toBe(true);

    const badCrcRuntime = createMysteryGiftLinkRuntime();
    mysteryGiftLinkInitRecv(link, 4, 2);
    badCrcRuntime.blockRecvBuffers[1] = { ident: 4, size: 2, crc: 0xffff };
    badCrcRuntime.blockReceivedStatus = 1 << 1;
    mysteryGiftLinkRecv(badCrcRuntime, link);
    badCrcRuntime.blockRecvBuffers[1] = [1, 2];
    badCrcRuntime.blockReceivedStatus = 1 << 1;
    mysteryGiftLinkRecv(badCrcRuntime, link);
    mysteryGiftLinkRecv(badCrcRuntime, link);
    expect(badCrcRuntime.fatalError).toBe(true);
  });

  test('Send emits header, waits for acknowledgements, chunks data, validates CRC, and completes on final ack', () => {
    const runtime = createMysteryGiftLinkRuntime();
    const link = createMysteryGiftLink();
    const payload = Array.from({ length: MGL_BLOCK_SIZE + 2 }, (_, i) => (i * 3) & 0xff);
    mysteryGiftLinkInit(link, 1, 0);
    mysteryGiftLinkInitSend(link, 77, payload, payload.length);

    expect(mysteryGiftLinkSend(runtime, link)).toBe(false);
    expect(runtime.sentBlocks[0]).toMatchObject({
      playerId: 0,
      data: { ident: 77, size: payload.length, crc: calcCRC16WithTable(payload, payload.length) },
      size: 6
    });
    expect(link.state).toBe(1);

    runtime.blockReceivedStatus = 1 << 1;
    mysteryGiftLinkSend(runtime, link);
    expect(runtime.sentBlocks[1].data).toEqual(payload.slice(0, MGL_BLOCK_SIZE));
    runtime.blockReceivedStatus = 1 << 1;
    mysteryGiftLinkSend(runtime, link);
    expect(runtime.sentBlocks[2].data).toEqual(payload.slice(MGL_BLOCK_SIZE));
    expect(link.state).toBe(2);

    mysteryGiftLinkSend(runtime, link);
    expect(link.state).toBe(3);
    runtime.blockReceivedStatus = 1 << 1;
    expect(mysteryGiftLinkSend(runtime, link)).toBe(true);
    expect(link.state).toBe(0);
  });

  test('exact C-name Mystery Gift link helpers preserve init, block status, receive, and send flow', () => {
    const runtime = createMysteryGiftLinkRuntime();
    const link = createMysteryGiftLink();
    const payload = Array.from({ length: MGL_BLOCK_SIZE + 1 }, (_, i) => (i * 5) & 0xff);

    MysteryGiftLink_Init(link, 1, 2);
    expect(link).toMatchObject({ sendPlayerId: 1, recvPlayerId: 2, state: 0 });
    MysteryGiftLink_InitRecv(link, 88, payload.length);
    runtime.blockRecvBuffers[2] = { ident: 88, size: payload.length, crc: calcCRC16WithTable(payload, payload.length) };
    runtime.blockReceivedStatus = 1 << 2;
    expect(MGL_HasReceived(runtime, 2)).toBe(true);
    expect(MGL_ReceiveBlock(runtime, 2)).toEqual(runtime.blockRecvBuffers[2]);
    expect(MysteryGiftLink_Recv(runtime, link)).toBe(false);
    expect(MGL_HasReceived(runtime, 2)).toBe(false);

    runtime.blockRecvBuffers[2] = payload.slice(0, MGL_BLOCK_SIZE);
    runtime.blockReceivedStatus = 1 << 2;
    expect(MGL_Receive(runtime, link)).toBe(false);
    runtime.blockRecvBuffers[2] = payload.slice(MGL_BLOCK_SIZE);
    runtime.blockReceivedStatus = 1 << 2;
    expect(MGL_Receive(runtime, link)).toBe(false);
    expect(MysteryGiftLink_Recv(runtime, link)).toBe(true);
    expect(link.recvBuffer.slice(0, payload.length)).toEqual(payload);

    MysteryGiftLink_InitSend(link, 99, payload, payload.length);
    expect(MysteryGiftLink_Send(runtime, link)).toBe(false);
    expect(runtime.sentBlocks.at(-1)).toMatchObject({
      playerId: 0,
      data: { ident: 99, size: payload.length, crc: calcCRC16WithTable(payload, payload.length) },
      size: 6
    });
    runtime.blockReceivedStatus = 1 << 1;
    MGL_ResetReceived(runtime, 1);
    expect(runtime.blockReceivedStatus).toBe(0);
    runtime.blockReceivedStatus = 1 << 1;
    expect(MGL_Send(runtime, link)).toBe(false);
    expect(runtime.sentBlocks.at(-1)?.data).toEqual(payload.slice(0, MGL_BLOCK_SIZE));
  });
});
