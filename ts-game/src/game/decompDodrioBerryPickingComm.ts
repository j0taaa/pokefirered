export const RFUCMD_SEND_PACKET = 0x2f00;
export const RFUCMD_MASK = 0xff00;

export const PACKET_READY_START = 1;
export const PACKET_GAME_STATE = 2;
export const PACKET_PICK_STATE = 3;
export const PACKET_READY_END = 4;

export interface DodrioGameBerries {
  fallDist: number[];
  ids: number[];
}

export interface DodrioGamePlayer {
  berries: DodrioGameBerries;
}

export interface DodrioGamePlayerCommData {
  pickState: number;
  ateBerry: boolean;
  missedBerry: boolean;
}

export type DodrioPacket =
  | { id: typeof PACKET_READY_START; ready: boolean }
  | {
      id: typeof PACKET_GAME_STATE;
      fallDist: number[];
      berryId: number[];
      pickState: number[];
      ateBerry: boolean[];
      missedBerry: boolean[];
      numGraySquares: number;
      allReadyToEnd: boolean;
      berriesFalling: boolean;
    }
  | { id: typeof PACKET_PICK_STATE; pickState: number }
  | { id: typeof PACKET_READY_END; ready: boolean };

export interface DodrioCommRuntime {
  recvCmds: { command: number; packet: DodrioPacket | null }[];
  sentPackets: DodrioPacket[];
}

export const createDodrioCommRuntime = (): DodrioCommRuntime => ({
  recvCmds: Array.from({ length: 5 }, () => ({ command: 0, packet: null })),
  sentPackets: []
});

export const createDodrioGamePlayer = (): DodrioGamePlayer => ({
  berries: {
    fallDist: Array.from({ length: 11 }, () => 0),
    ids: Array.from({ length: 11 }, () => 0)
  }
});

export const createDodrioCommData = (): DodrioGamePlayerCommData => ({
  pickState: 0,
  ateBerry: false,
  missedBerry: false
});

const sendPacket = (runtime: DodrioCommRuntime, packet: DodrioPacket): void => {
  runtime.sentPackets.push(packet);
};

const hasPacketCommand = (runtime: DodrioCommRuntime): boolean =>
  (runtime.recvCmds[0].command & RFUCMD_MASK) === RFUCMD_SEND_PACKET;

export const sendPacketReadyToStart = (
  runtime: DodrioCommRuntime,
  ready: boolean
): void => {
  sendPacket(runtime, { id: PACKET_READY_START, ready });
};

export function SendPacket_ReadyToStart(
  runtime: DodrioCommRuntime,
  ready: boolean
): void {
  sendPacketReadyToStart(runtime, ready);
}

export const recvPacketReadyToStart = (
  runtime: DodrioCommRuntime,
  playerId: number
): boolean => {
  if (!hasPacketCommand(runtime)) {
    return false;
  }
  const packet = runtime.recvCmds[playerId]?.packet;
  if (packet?.id === PACKET_READY_START) {
    return packet.ready;
  }
  return false;
};

export function RecvPacket_ReadyToStart(
  runtime: DodrioCommRuntime,
  playerId: number
): boolean {
  return recvPacketReadyToStart(runtime, playerId);
}

export const sendPacketGameState = (
  runtime: DodrioCommRuntime,
  player: DodrioGamePlayer,
  player1: DodrioGamePlayerCommData,
  player2: DodrioGamePlayerCommData,
  player3: DodrioGamePlayerCommData,
  player4: DodrioGamePlayerCommData,
  player5: DodrioGamePlayerCommData,
  numGraySquares: number,
  berriesFalling: boolean,
  allReadyToEnd: boolean
): void => {
  const berries = player.berries;
  sendPacket(runtime, {
    id: PACKET_GAME_STATE,
    fallDist: berries.fallDist.slice(0, 10).map((value) => value & 0xf),
    berryId: berries.ids.slice(0, 10).map((value) => value & 0x3),
    pickState: [player1, player2, player3, player4, player5].map((value) => value.pickState & 0x3),
    ateBerry: [player1, player2, player3, player4, player5].map((value) => value.ateBerry),
    missedBerry: [player1, player2, player3, player4, player5].map((value) => value.missedBerry),
    numGraySquares: numGraySquares & 0x1f,
    allReadyToEnd,
    berriesFalling
  });
};

export function SendPacket_GameState(
  runtime: DodrioCommRuntime,
  player: DodrioGamePlayer,
  player1: DodrioGamePlayerCommData,
  player2: DodrioGamePlayerCommData,
  player3: DodrioGamePlayerCommData,
  player4: DodrioGamePlayerCommData,
  player5: DodrioGamePlayerCommData,
  numGraySquares: number,
  berriesFalling: boolean,
  allReadyToEnd: boolean
): void {
  sendPacketGameState(
    runtime,
    player,
    player1,
    player2,
    player3,
    player4,
    player5,
    numGraySquares,
    berriesFalling,
    allReadyToEnd
  );
}

export const recvPacketGameState = (
  runtime: DodrioCommRuntime,
  _playerId: number,
  player: DodrioGamePlayer,
  player1: DodrioGamePlayerCommData,
  player2: DodrioGamePlayerCommData,
  player3: DodrioGamePlayerCommData,
  player4: DodrioGamePlayerCommData,
  player5: DodrioGamePlayerCommData,
  numGraySquares: { value: number },
  berriesFalling: { value: boolean },
  allReadyToEnd: { value: boolean }
): boolean => {
  if (!hasPacketCommand(runtime)) {
    return false;
  }
  const packet = runtime.recvCmds[0].packet;
  if (packet?.id !== PACKET_GAME_STATE) {
    return false;
  }
  const berries = player.berries;
  for (let i = 0; i < 10; i += 1) {
    berries.fallDist[i] = packet.fallDist[i] & 0xf;
    berries.ids[i] = packet.berryId[i] & 0x3;
  }
  berries.fallDist[10] = packet.fallDist[0] & 0xf;
  berries.ids[10] = packet.berryId[0] & 0x3;

  [player1, player2, player3, player4, player5].forEach((comm, i) => {
    comm.pickState = packet.pickState[i] & 0x3;
    comm.ateBerry = packet.ateBerry[i];
    comm.missedBerry = packet.missedBerry[i];
  });
  numGraySquares.value = packet.numGraySquares & 0x1f;
  berriesFalling.value = packet.berriesFalling;
  allReadyToEnd.value = packet.allReadyToEnd;
  return true;
};

export function RecvPacket_GameState(
  runtime: DodrioCommRuntime,
  playerId: number,
  player: DodrioGamePlayer,
  player1: DodrioGamePlayerCommData,
  player2: DodrioGamePlayerCommData,
  player3: DodrioGamePlayerCommData,
  player4: DodrioGamePlayerCommData,
  player5: DodrioGamePlayerCommData,
  numGraySquares: { value: number },
  berriesFalling: { value: boolean },
  allReadyToEnd: { value: boolean }
): boolean {
  return recvPacketGameState(
    runtime,
    playerId,
    player,
    player1,
    player2,
    player3,
    player4,
    player5,
    numGraySquares,
    berriesFalling,
    allReadyToEnd
  );
}

export const sendPacketPickState = (
  runtime: DodrioCommRuntime,
  pickState: number
): void => {
  sendPacket(runtime, { id: PACKET_PICK_STATE, pickState: pickState & 0xff });
};

export function SendPacket_PickState(
  runtime: DodrioCommRuntime,
  pickState: number
): void {
  sendPacketPickState(runtime, pickState);
}

export const recvPacketPickState = (
  runtime: DodrioCommRuntime,
  playerId: number,
  pickState: { value: number }
): boolean => {
  if (!hasPacketCommand(runtime)) {
    return false;
  }
  const packet = runtime.recvCmds[playerId]?.packet;
  if (packet?.id === PACKET_PICK_STATE) {
    pickState.value = packet.pickState & 0xff;
    return true;
  }
  return false;
};

export function RecvPacket_PickState(
  runtime: DodrioCommRuntime,
  playerId: number,
  pickState: { value: number }
): boolean {
  return recvPacketPickState(runtime, playerId, pickState);
}

export const sendPacketReadyToEnd = (
  runtime: DodrioCommRuntime,
  ready: boolean
): void => {
  sendPacket(runtime, { id: PACKET_READY_END, ready });
};

export function SendPacket_ReadyToEnd(
  runtime: DodrioCommRuntime,
  ready: boolean
): void {
  sendPacketReadyToEnd(runtime, ready);
}

export const recvPacketReadyToEnd = (
  runtime: DodrioCommRuntime,
  playerId: number
): boolean => {
  if (!hasPacketCommand(runtime)) {
    return false;
  }
  const packet = runtime.recvCmds[playerId]?.packet;
  if (packet?.id === PACKET_READY_END) {
    return packet.ready;
  }
  return false;
};

export function RecvPacket_ReadyToEnd(
  runtime: DodrioCommRuntime,
  playerId: number
): boolean {
  return recvPacketReadyToEnd(runtime, playerId);
}
