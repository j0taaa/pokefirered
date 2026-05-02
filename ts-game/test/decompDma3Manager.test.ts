import { describe, expect, test } from 'vitest';
import {
  DMA3_16BIT,
  DMA3_32BIT,
  DMA_REQUEST_COPY16,
  DMA_REQUEST_COPY32,
  DMA_REQUEST_FILL16,
  DMA_REQUEST_FILL32,
  DMA_TRANSFER_BYTE_LIMIT,
  ClearDma3Requests,
  MAX_DMA_REQUESTS,
  ProcessDma3Requests,
  RequestDma3Copy,
  RequestDma3Fill,
  WaitDma3Request,
  createDma3ManagerState,
} from '../src/game/decompDma3Manager';

describe('decompDma3Manager', () => {
  test('ClearDma3Requests clears all request slots and resets cursor', () => {
    const state = createDma3ManagerState();
    state.requests[5].size = 4;
    state.requests[5].src = Uint8Array.of(1);
    state.requests[5].dest = new Uint8Array(1);
    state.requestCursor = 5;
    ClearDma3Requests(state);
    expect(state.requestCursor).toBe(0);
    expect(state.locked).toBe(false);
    expect(state.requests.every((request) => request.size === 0 && request.src === null && request.dest === null)).toBe(true);
  });

  test('RequestDma3Copy and RequestDma3Fill choose modes and find free slots from cursor', () => {
    const state = createDma3ManagerState();
    state.requestCursor = 2;
    const src = Uint8Array.of(1, 2, 3, 4);
    const dest = new Uint8Array(4);
    expect(RequestDma3Copy(state, src, dest, 4, DMA3_32BIT)).toBe(2);
    expect(state.requests[2]).toMatchObject({ size: 4, mode: DMA_REQUEST_COPY32 });
    expect(RequestDma3Fill(state, 0x12345678, new Uint8Array(4), 4, DMA3_16BIT)).toBe(3);
    expect(state.requests[3]).toMatchObject({ size: 4, mode: DMA_REQUEST_FILL16, value: 0x12345678 });
  });

  test('requests wrap and return -1 when all slots are full', () => {
    const state = createDma3ManagerState();
    state.requestCursor = MAX_DMA_REQUESTS - 1;
    state.requests[MAX_DMA_REQUESTS - 1].size = 1;
    expect(RequestDma3Fill(state, 1, new Uint8Array(1), 1, DMA3_32BIT)).toBe(0);
    for (const request of state.requests) {
      request.size = 1;
    }
    expect(RequestDma3Fill(state, 1, new Uint8Array(1), 1, DMA3_32BIT)).toBe(-1);
  });

  test('ProcessDma3Requests copies/fills and clears processed requests', () => {
    const state = createDma3ManagerState();
    const src = Uint8Array.of(1, 2, 3, 4);
    const copyDest = new Uint8Array(4);
    const fill32Dest = new Uint8Array(4);
    const fill16Dest = new Uint8Array(4);
    RequestDma3Copy(state, src, copyDest, 4, DMA3_32BIT);
    RequestDma3Fill(state, 0x11223344, fill32Dest, 4, DMA3_32BIT);
    RequestDma3Fill(state, 0x5566, fill16Dest, 4, DMA3_16BIT);

    ProcessDma3Requests(state, 100);

    expect([...copyDest]).toEqual([1, 2, 3, 4]);
    expect([...fill32Dest]).toEqual([0x44, 0x33, 0x22, 0x11]);
    expect([...fill16Dest]).toEqual([0x66, 0x55, 0x66, 0x55]);
    expect(state.requestCursor).toBe(3);
    expect(WaitDma3Request(state, -1)).toBe(0);
  });

  test('ProcessDma3Requests stops when locked, over byte budget, or leaving vblank', () => {
    const locked = createDma3ManagerState();
    locked.locked = true;
    RequestDma3Copy(locked, Uint8Array.of(1), new Uint8Array(1), 1, DMA3_16BIT);
    locked.locked = true;
    ProcessDma3Requests(locked, 100);
    expect(locked.requests[0].size).toBe(1);

    const tooLarge = createDma3ManagerState();
    RequestDma3Fill(tooLarge, 1, new Uint8Array(DMA_TRANSFER_BYTE_LIMIT + 1), DMA_TRANSFER_BYTE_LIMIT + 1, DMA3_32BIT);
    ProcessDma3Requests(tooLarge, 100);
    expect(tooLarge.requests[0].size).toBe(DMA_TRANSFER_BYTE_LIMIT + 1);

    const lateVblank = createDma3ManagerState();
    RequestDma3Fill(lateVblank, 1, new Uint8Array(4), 4, DMA3_32BIT);
    ProcessDma3Requests(lateVblank, 225);
    expect(lateVblank.requests[0].size).toBe(4);
  });

  test('WaitDma3Request reports pending individual or global requests', () => {
    const state = createDma3ManagerState();
    RequestDma3Fill(state, 1, new Uint8Array(4), 4, DMA3_32BIT);
    expect(WaitDma3Request(state, 0)).toBe(-1);
    expect(WaitDma3Request(state, -1)).toBe(-1);
    ProcessDma3Requests(state, 100);
    expect(WaitDma3Request(state, 0)).toBe(0);
    expect(WaitDma3Request(state, -1)).toBe(0);
    expect(DMA_REQUEST_COPY16).toBe(3);
    expect(DMA_REQUEST_FILL32).toBe(2);
  });
});
