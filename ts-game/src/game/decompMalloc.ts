export const MALLOC_SYSTEM_ID = 0xa3a3;
export const MEM_BLOCK_HEADER_SIZE = 16;

export interface MemBlock {
  address: number;
  flag: boolean;
  magicNumber: number;
  size: number;
  prev: number;
  next: number;
  data: number[];
}

export interface HeapRuntime {
  heapStart: number;
  heapSize: number;
  blocks: Map<number, MemBlock>;
  assertions: string[];
}

export const createHeapRuntime = (): HeapRuntime => ({
  heapStart: 0,
  heapSize: 0,
  blocks: new Map(),
  assertions: []
});

const align4 = (size: number): number =>
  (size & 3) !== 0 ? 4 * (Math.trunc(size / 4) + 1) : size;

const getBlock = (runtime: HeapRuntime, address: number): MemBlock =>
  runtime.blocks.get(address) as MemBlock;

export const putMemBlockHeader = (
  runtime: HeapRuntime,
  block: number,
  prev: number,
  next: number,
  size: number
): void => {
  runtime.blocks.set(block, {
    address: block,
    flag: false,
    magicNumber: MALLOC_SYSTEM_ID,
    size,
    prev,
    next,
    data: Array.from({ length: Math.max(0, size) }, () => 0)
  });
};

export function PutMemBlockHeader(
  runtime: HeapRuntime,
  block: number,
  prev: number,
  next: number,
  size: number
): void {
  putMemBlockHeader(runtime, block, prev, next, size);
}

export const putFirstMemBlockHeader = (
  runtime: HeapRuntime,
  block: number,
  size: number
): void => {
  putMemBlockHeader(runtime, block, block, block, size - MEM_BLOCK_HEADER_SIZE);
};

export function PutFirstMemBlockHeader(
  runtime: HeapRuntime,
  block: number,
  size: number
): void {
  putFirstMemBlockHeader(runtime, block, size);
}

export const initHeap = (
  runtime: HeapRuntime,
  heapStart: number,
  heapSize: number
): void => {
  runtime.heapStart = heapStart;
  runtime.heapSize = heapSize;
  runtime.blocks.clear();
  putFirstMemBlockHeader(runtime, heapStart, heapSize);
};

export function InitHeap(
  runtime: HeapRuntime,
  heapStart: number,
  heapSize: number
): void {
  initHeap(runtime, heapStart, heapSize);
}

export const allocInternal = (
  runtime: HeapRuntime,
  heapStart: number,
  requestedSize: number
): number | null => {
  let pos = getBlock(runtime, heapStart);
  const head = pos;
  const size = align4(requestedSize);

  for (;;) {
    if (!pos.flag) {
      const foundBlockSize = pos.size;
      if (foundBlockSize >= size) {
        if (foundBlockSize - size < 2 * MEM_BLOCK_HEADER_SIZE) {
          pos.flag = true;
          return pos.address + MEM_BLOCK_HEADER_SIZE;
        }

        const splitBlockSize = foundBlockSize - MEM_BLOCK_HEADER_SIZE - size;
        const splitAddress = pos.address + MEM_BLOCK_HEADER_SIZE + size;
        pos.flag = true;
        pos.size = size;
        pos.data = Array.from({ length: size }, () => 0);
        putMemBlockHeader(runtime, splitAddress, pos.address, pos.next, splitBlockSize);
        pos.next = splitAddress;
        const splitBlock = getBlock(runtime, splitAddress);
        if (splitBlock.next !== head.address) {
          getBlock(runtime, splitBlock.next).prev = splitAddress;
        }
        return pos.address + MEM_BLOCK_HEADER_SIZE;
      }
    }

    if (pos.next === head.address) {
      runtime.assertions.push('AllocInternal: no block large enough');
      return null;
    }
    pos = getBlock(runtime, pos.next);
  }
};

export function AllocInternal(
  runtime: HeapRuntime,
  heapStart: number,
  size: number
): number | null {
  return allocInternal(runtime, heapStart, size);
}

export const freeInternal = (
  runtime: HeapRuntime,
  heapStart: number,
  pointer: number | null
): void => {
  if (pointer === null) {
    runtime.assertions.push('FreeInternal: pointer != NULL');
    return;
  }
  const head = getBlock(runtime, heapStart);
  const pos = getBlock(runtime, pointer - MEM_BLOCK_HEADER_SIZE);

  if (pos.magicNumber !== MALLOC_SYSTEM_ID) {
    runtime.assertions.push('FreeInternal: magic_number');
  }
  if (pos.flag !== true) {
    runtime.assertions.push('FreeInternal: flag');
  }
  pos.flag = false;

  if (pos.next !== head.address) {
    const next = getBlock(runtime, pos.next);
    if (!next.flag) {
      if (next.magicNumber !== MALLOC_SYSTEM_ID) {
        runtime.assertions.push('FreeInternal: next magic_number');
      }
      pos.size += MEM_BLOCK_HEADER_SIZE + next.size;
      pos.data = Array.from({ length: pos.size }, () => 0);
      next.magicNumber = 0;
      pos.next = next.next;
      if (pos.next !== head.address) {
        getBlock(runtime, pos.next).prev = pos.address;
      }
    }
  }

  if (pos.address !== head.address) {
    const prev = getBlock(runtime, pos.prev);
    if (!prev.flag) {
      if (prev.magicNumber !== MALLOC_SYSTEM_ID) {
        runtime.assertions.push('FreeInternal: prev magic_number');
      }
      prev.next = pos.next;
      if (pos.next !== head.address) {
        getBlock(runtime, pos.next).prev = prev.address;
      }
      pos.magicNumber = 0;
      prev.size += MEM_BLOCK_HEADER_SIZE + pos.size;
      prev.data = Array.from({ length: prev.size }, () => 0);
    }
  }
};

export function FreeInternal(
  runtime: HeapRuntime,
  heapStart: number,
  pointer: number | null
): void {
  freeInternal(runtime, heapStart, pointer);
}

export const allocZeroedInternal = (
  runtime: HeapRuntime,
  heapStart: number,
  size: number
): number | null => {
  const mem = allocInternal(runtime, heapStart, size);
  if (mem !== null) {
    getBlock(runtime, mem - MEM_BLOCK_HEADER_SIZE).data = Array.from({ length: align4(size) }, () => 0);
  }
  return mem;
};

export function AllocZeroedInternal(
  runtime: HeapRuntime,
  heapStart: number,
  size: number
): number | null {
  return allocZeroedInternal(runtime, heapStart, size);
}

export const checkMemBlockInternal = (
  runtime: HeapRuntime,
  heapStart: number,
  pointer: number
): boolean => {
  const head = getBlock(runtime, heapStart);
  const block = getBlock(runtime, pointer - MEM_BLOCK_HEADER_SIZE);
  if (!block || block.magicNumber !== MALLOC_SYSTEM_ID) return false;
  const next = getBlock(runtime, block.next);
  if (!next || next.magicNumber !== MALLOC_SYSTEM_ID) return false;
  if (block.next !== head.address && next.prev !== block.address) return false;
  const prev = getBlock(runtime, block.prev);
  if (!prev || prev.magicNumber !== MALLOC_SYSTEM_ID) return false;
  if (block.prev !== head.address && prev.next !== block.address) return false;
  if (block.next !== head.address && block.next !== block.address + MEM_BLOCK_HEADER_SIZE + block.size) return false;
  return true;
};

export function CheckMemBlockInternal(
  runtime: HeapRuntime,
  heapStart: number,
  pointer: number
): boolean {
  return checkMemBlockInternal(runtime, heapStart, pointer);
}

export const alloc = (runtime: HeapRuntime, size: number): number | null =>
  allocInternal(runtime, runtime.heapStart, size);

export function Alloc(runtime: HeapRuntime, size: number): number | null {
  return alloc(runtime, size);
}

export const allocZeroed = (runtime: HeapRuntime, size: number): number | null =>
  allocZeroedInternal(runtime, runtime.heapStart, size);

export function AllocZeroed(runtime: HeapRuntime, size: number): number | null {
  return allocZeroed(runtime, size);
}

export const free = (runtime: HeapRuntime, pointer: number | null): void =>
  freeInternal(runtime, runtime.heapStart, pointer);

export function Free(runtime: HeapRuntime, pointer: number | null): void {
  free(runtime, pointer);
}

export const checkMemBlock = (
  runtime: HeapRuntime,
  pointer: number
): boolean => checkMemBlockInternal(runtime, runtime.heapStart, pointer);

export function CheckMemBlock(
  runtime: HeapRuntime,
  pointer: number
): boolean {
  return checkMemBlock(runtime, pointer);
}

export const checkHeap = (runtime: HeapRuntime): boolean => {
  let pos = getBlock(runtime, runtime.heapStart);
  do {
    if (!checkMemBlockInternal(runtime, runtime.heapStart, pos.address + MEM_BLOCK_HEADER_SIZE)) {
      return false;
    }
    pos = getBlock(runtime, pos.next);
  } while (pos.address !== runtime.heapStart);
  return true;
};

export function CheckHeap(runtime: HeapRuntime): boolean {
  return checkHeap(runtime);
}
