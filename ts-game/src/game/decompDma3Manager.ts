export const MAX_DMA_REQUESTS = 128;
export const DMA3_32BIT = 1;
export const DMA3_16BIT = 0;
export const DMA_REQUEST_COPY32 = 1;
export const DMA_REQUEST_FILL32 = 2;
export const DMA_REQUEST_COPY16 = 3;
export const DMA_REQUEST_FILL16 = 4;
export const DMA_TRANSFER_BYTE_LIMIT = 40 * 1024;

export interface Dma3Request {
  src: Uint8Array | null;
  dest: Uint8Array | null;
  size: number;
  mode: number;
  value: number;
}

export interface Dma3ManagerState {
  requests: Dma3Request[];
  locked: boolean;
  requestCursor: number;
}

export const createDma3ManagerState = (): Dma3ManagerState => ({
  requests: Array.from({ length: MAX_DMA_REQUESTS }, () => ({
    src: null,
    dest: null,
    size: 0,
    mode: 0,
    value: 0
  })),
  locked: false,
  requestCursor: 0
});

export const clearDma3Requests = (state: Dma3ManagerState): void => {
  state.locked = true;
  state.requestCursor = 0;
  for (const request of state.requests) {
    request.size = 0;
    request.src = null;
    request.dest = null;
  }
  state.locked = false;
};

const clearRequest = (request: Dma3Request): void => {
  request.src = null;
  request.dest = null;
  request.size = 0;
  request.mode = 0;
  request.value = 0;
};

const copyBytes = (src: Uint8Array, dest: Uint8Array, size: number): void => {
  dest.set(src.slice(0, size), 0);
};

const fillBytes = (value: number, dest: Uint8Array, size: number, bytesPerUnit: 2 | 4): void => {
  const normalized = value >>> 0;
  for (let i = 0; i < size; i += bytesPerUnit) {
    for (let byte = 0; byte < bytesPerUnit && i + byte < size; byte += 1) {
      dest[i + byte] = (normalized >>> (byte * 8)) & 0xff;
    }
  }
};

export const processDma3Requests = (
  state: Dma3ManagerState,
  vcount: number
): void => {
  if (state.locked) {
    return;
  }

  let bytesTransferred = 0;
  while (state.requests[state.requestCursor].size !== 0) {
    const request = state.requests[state.requestCursor];
    bytesTransferred += request.size;
    if (bytesTransferred > DMA_TRANSFER_BYTE_LIMIT || vcount > 224) {
      return;
    }

    if (request.dest) {
      switch (request.mode) {
        case DMA_REQUEST_COPY32:
        case DMA_REQUEST_COPY16:
          if (request.src) {
            copyBytes(request.src, request.dest, request.size);
          }
          break;
        case DMA_REQUEST_FILL32:
          fillBytes(request.value, request.dest, request.size, 4);
          break;
        case DMA_REQUEST_FILL16:
          fillBytes(request.value, request.dest, request.size, 2);
          break;
      }
    }

    clearRequest(request);
    state.requestCursor += 1;
    if (state.requestCursor >= MAX_DMA_REQUESTS) {
      state.requestCursor = 0;
    }
  }
};

const findFreeRequestSlot = (state: Dma3ManagerState): number => {
  let cursor = state.requestCursor;
  for (let checked = 0; checked < MAX_DMA_REQUESTS; checked += 1) {
    if (!state.requests[cursor].size) {
      return cursor;
    }
    cursor += 1;
    if (cursor >= MAX_DMA_REQUESTS) {
      cursor = 0;
    }
  }
  return -1;
};

export const requestDma3Copy = (
  state: Dma3ManagerState,
  src: Uint8Array,
  dest: Uint8Array,
  size: number,
  mode: number
): number => {
  state.locked = true;
  const cursor = findFreeRequestSlot(state);
  if (cursor >= 0) {
    const request = state.requests[cursor];
    request.src = src;
    request.dest = dest;
    request.size = size & 0xffff;
    request.mode = mode === DMA3_32BIT ? DMA_REQUEST_COPY32 : DMA_REQUEST_COPY16;
    request.value = 0;
  }
  state.locked = false;
  return cursor;
};

export const requestDma3Fill = (
  state: Dma3ManagerState,
  value: number,
  dest: Uint8Array,
  size: number,
  mode: number
): number => {
  state.locked = true;
  const cursor = findFreeRequestSlot(state);
  if (cursor >= 0) {
    const request = state.requests[cursor];
    request.src = null;
    request.dest = dest;
    request.size = size & 0xffff;
    request.mode = mode === DMA3_32BIT ? DMA_REQUEST_FILL32 : DMA_REQUEST_FILL16;
    request.value = value >>> 0;
  }
  state.locked = false;
  return cursor;
};

export const waitDma3Request = (
  state: Dma3ManagerState,
  index: number
): number => {
  if (index === -1) {
    return state.requests.some((request) => request.size) ? -1 : 0;
  }
  return state.requests[index]?.size ? -1 : 0;
};

export function ClearDma3Requests(state: Dma3ManagerState): void {
  clearDma3Requests(state);
}

export function ProcessDma3Requests(
  state: Dma3ManagerState,
  vcount: number
): void {
  processDma3Requests(state, vcount);
}

export function RequestDma3Copy(
  state: Dma3ManagerState,
  src: Uint8Array,
  dest: Uint8Array,
  size: number,
  mode: number
): number {
  return requestDma3Copy(state, src, dest, size, mode);
}

export function RequestDma3Fill(
  state: Dma3ManagerState,
  value: number,
  dest: Uint8Array,
  size: number,
  mode: number
): number {
  return requestDma3Fill(state, value, dest, size, mode);
}

export function WaitDma3Request(
  state: Dma3ManagerState,
  index: number
): number {
  return waitDma3Request(state, index);
}
