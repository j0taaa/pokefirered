import { describe, expect, test } from 'vitest';
import {
  Alloc,
  AllocInternal,
  AllocZeroed,
  AllocZeroedInternal,
  CheckHeap,
  CheckMemBlock,
  CheckMemBlockInternal,
  Free,
  FreeInternal,
  InitHeap,
  MALLOC_SYSTEM_ID,
  MEM_BLOCK_HEADER_SIZE,
  PutFirstMemBlockHeader,
  PutMemBlockHeader,
  alloc,
  allocZeroed,
  checkHeap,
  checkMemBlock,
  createHeapRuntime,
  free,
  initHeap
} from '../src/game/decompMalloc';

describe('decompMalloc', () => {
  test('InitHeap puts the first circular free block header', () => {
    const runtime = createHeapRuntime();
    initHeap(runtime, 0x1000, 0x100);
    const head = runtime.blocks.get(0x1000);
    expect(head).toMatchObject({
      flag: false,
      magicNumber: MALLOC_SYSTEM_ID,
      size: 0x100 - MEM_BLOCK_HEADER_SIZE,
      prev: 0x1000,
      next: 0x1000
    });
  });

  test('Alloc aligns and splits large blocks, then CheckHeap validates links', () => {
    const runtime = createHeapRuntime();
    initHeap(runtime, 0x1000, 0x100);
    const ptr = alloc(runtime, 5);
    expect(ptr).toBe(0x1000 + MEM_BLOCK_HEADER_SIZE);
    const first = runtime.blocks.get(0x1000)!;
    expect(first).toMatchObject({ flag: true, size: 8, next: 0x1000 + MEM_BLOCK_HEADER_SIZE + 8 });
    const split = runtime.blocks.get(first.next)!;
    expect(split).toMatchObject({ flag: false, prev: 0x1000, next: 0x1000 });
    expect(checkMemBlock(runtime, ptr!)).toBe(true);
    expect(checkHeap(runtime)).toBe(true);
  });

  test('Alloc consumes a nearly exact block without splitting and returns null when exhausted', () => {
    const runtime = createHeapRuntime();
    initHeap(runtime, 0x2000, 0x30);
    const ptr = alloc(runtime, 24);
    expect(ptr).toBe(0x2000 + MEM_BLOCK_HEADER_SIZE);
    expect(runtime.blocks.get(0x2000)!.next).toBe(0x2000);
    expect(alloc(runtime, 4)).toBeNull();
    expect(runtime.assertions).toEqual(['AllocInternal: no block large enough']);
  });

  test('Free merges next and previous free blocks and marks merged headers invalid', () => {
    const runtime = createHeapRuntime();
    initHeap(runtime, 0x3000, 0x100);
    const a = alloc(runtime, 8)!;
    const b = alloc(runtime, 8)!;
    const c = alloc(runtime, 8)!;

    free(runtime, b);
    expect(runtime.blocks.get(b - MEM_BLOCK_HEADER_SIZE)!.flag).toBe(false);
    free(runtime, a);
    expect(runtime.blocks.get(a - MEM_BLOCK_HEADER_SIZE)!.size).toBe(32);
    expect(runtime.blocks.get(b - MEM_BLOCK_HEADER_SIZE)!.magicNumber).toBe(0);
    free(runtime, c);
    expect(runtime.blocks.get(0x3000)!.next).toBe(0x3000);
    expect(runtime.blocks.get(0x3000)!.size).toBe(0x100 - MEM_BLOCK_HEADER_SIZE);
  });

  test('AllocZeroed clears aligned size and Free null records assertion', () => {
    const runtime = createHeapRuntime();
    initHeap(runtime, 0x4000, 0x80);
    const ptr = allocZeroed(runtime, 7)!;
    const block = runtime.blocks.get(ptr - MEM_BLOCK_HEADER_SIZE)!;
    block.data[0] = 99;
    const ptr2 = allocZeroed(runtime, 4)!;
    expect(runtime.blocks.get(ptr2 - MEM_BLOCK_HEADER_SIZE)!.data).toEqual([0, 0, 0, 0]);
    free(runtime, null);
    expect(runtime.assertions).toContain('FreeInternal: pointer != NULL');
  });

  test('exact C-name allocator functions preserve headers, links, allocation, zeroing, and free checks', () => {
    const runtime = createHeapRuntime();

    PutMemBlockHeader(runtime, 0x5000, 0x5000, 0x5000, 0x40);
    expect(runtime.blocks.get(0x5000)).toMatchObject({
      flag: false,
      magicNumber: MALLOC_SYSTEM_ID,
      size: 0x40,
      prev: 0x5000,
      next: 0x5000
    });

    PutFirstMemBlockHeader(runtime, 0x6000, 0x80);
    expect(runtime.blocks.get(0x6000)!.size).toBe(0x80 - MEM_BLOCK_HEADER_SIZE);

    InitHeap(runtime, 0x7000, 0x100);
    const a = AllocInternal(runtime, 0x7000, 5)!;
    expect(a).toBe(0x7000 + MEM_BLOCK_HEADER_SIZE);
    expect(CheckMemBlockInternal(runtime, 0x7000, a)).toBe(true);

    const b = Alloc(runtime, 8)!;
    expect(CheckMemBlock(runtime, b)).toBe(true);
    const c = AllocZeroedInternal(runtime, 0x7000, 7)!;
    expect(runtime.blocks.get(c - MEM_BLOCK_HEADER_SIZE)!.data).toEqual(Array.from({ length: 8 }, () => 0));
    const d = AllocZeroed(runtime, 4)!;
    expect(runtime.blocks.get(d - MEM_BLOCK_HEADER_SIZE)!.data).toEqual([0, 0, 0, 0]);

    FreeInternal(runtime, 0x7000, b);
    expect(runtime.blocks.get(b - MEM_BLOCK_HEADER_SIZE)!.flag).toBe(false);
    Free(runtime, a);
    expect(CheckHeap(runtime)).toBe(true);
  });
});
