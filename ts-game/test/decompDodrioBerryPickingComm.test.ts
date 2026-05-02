import { describe, expect, test } from 'vitest';
import {
  PACKET_GAME_STATE,
  PACKET_PICK_STATE,
  PACKET_READY_END,
  PACKET_READY_START,
  RFUCMD_SEND_PACKET,
  RecvPacket_GameState,
  RecvPacket_PickState,
  RecvPacket_ReadyToEnd,
  RecvPacket_ReadyToStart,
  SendPacket_GameState,
  SendPacket_PickState,
  SendPacket_ReadyToEnd,
  SendPacket_ReadyToStart,
  createDodrioCommData,
  createDodrioCommRuntime,
  createDodrioGamePlayer,
  recvPacketGameState,
  recvPacketPickState,
  recvPacketReadyToEnd,
  recvPacketReadyToStart,
  sendPacketGameState,
  sendPacketPickState,
  sendPacketReadyToEnd,
  sendPacketReadyToStart
} from '../src/game/decompDodrioBerryPickingComm';

describe('decomp dodrio_berry_picking_comm', () => {
  test('ready-to-start packet sends id and receives only under RFU send command', () => {
    const runtime = createDodrioCommRuntime();
    sendPacketReadyToStart(runtime, true);
    expect(runtime.sentPackets[0]).toEqual({ id: PACKET_READY_START, ready: true });

    runtime.recvCmds[1].packet = { id: PACKET_READY_START, ready: true };
    expect(recvPacketReadyToStart(runtime, 1)).toBe(false);
    runtime.recvCmds[0].command = RFUCMD_SEND_PACKET;
    expect(recvPacketReadyToStart(runtime, 1)).toBe(true);
    runtime.recvCmds[1].packet = { id: PACKET_READY_END, ready: true };
    expect(recvPacketReadyToStart(runtime, 1)).toBe(false);
  });

  test('game-state packet packs ten berry columns and five player comm states', () => {
    const runtime = createDodrioCommRuntime();
    const player = createDodrioGamePlayer();
    player.berries.fallDist = [0, 1, 2, 3, 4, 5, 6, 7, 8, 31, 99];
    player.berries.ids = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 99];
    const comms = Array.from({ length: 5 }, (_, i) => ({
      pickState: i + 1,
      ateBerry: i % 2 === 0,
      missedBerry: i % 2 === 1
    }));

    sendPacketGameState(runtime, player, comms[0], comms[1], comms[2], comms[3], comms[4], 63, true, false);

    expect(runtime.sentPackets[0]).toMatchObject({
      id: PACKET_GAME_STATE,
      fallDist: [0, 1, 2, 3, 4, 5, 6, 7, 8, 15],
      berryId: [0, 1, 2, 3, 0, 1, 2, 3, 0, 1],
      pickState: [1, 2, 3, 0, 1],
      ateBerry: [true, false, true, false, true],
      missedBerry: [false, true, false, true, false],
      numGraySquares: 31,
      berriesFalling: true,
      allReadyToEnd: false
    });
  });

  test('RecvPacket_GameState reads slot zero packet and mirrors column zero into index ten', () => {
    const runtime = createDodrioCommRuntime();
    runtime.recvCmds[0].command = RFUCMD_SEND_PACKET;
    runtime.recvCmds[0].packet = {
      id: PACKET_GAME_STATE,
      fallDist: [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
      berryId: [3, 2, 1, 0, 3, 2, 1, 0, 3, 2],
      pickState: [0, 1, 2, 3, 0],
      ateBerry: [true, true, false, false, true],
      missedBerry: [false, true, false, true, false],
      numGraySquares: 12,
      berriesFalling: false,
      allReadyToEnd: true
    };
    const player = createDodrioGamePlayer();
    const comms = Array.from({ length: 5 }, () => createDodrioCommData());
    const numGraySquares = { value: 0 };
    const berriesFalling = { value: true };
    const allReadyToEnd = { value: false };

    expect(recvPacketGameState(runtime, 4, player, comms[0], comms[1], comms[2], comms[3], comms[4], numGraySquares, berriesFalling, allReadyToEnd)).toBe(true);

    expect(player.berries.fallDist).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 9]);
    expect(player.berries.ids).toEqual([3, 2, 1, 0, 3, 2, 1, 0, 3, 2, 3]);
    expect(comms.map((comm) => comm.pickState)).toEqual([0, 1, 2, 3, 0]);
    expect(comms.map((comm) => comm.ateBerry)).toEqual([true, true, false, false, true]);
    expect(comms.map((comm) => comm.missedBerry)).toEqual([false, true, false, true, false]);
    expect(numGraySquares.value).toBe(12);
    expect(berriesFalling.value).toBe(false);
    expect(allReadyToEnd.value).toBe(true);
  });

  test('pick-state and ready-to-end packets use player-specific receive slots', () => {
    const runtime = createDodrioCommRuntime();
    sendPacketPickState(runtime, 0x123);
    sendPacketReadyToEnd(runtime, true);
    expect(runtime.sentPackets[0]).toEqual({ id: PACKET_PICK_STATE, pickState: 0x23 });
    expect(runtime.sentPackets[1]).toEqual({ id: PACKET_READY_END, ready: true });

    runtime.recvCmds[0].command = RFUCMD_SEND_PACKET;
    runtime.recvCmds[2].packet = { id: PACKET_PICK_STATE, pickState: 7 };
    const pickState = { value: 0 };
    expect(recvPacketPickState(runtime, 2, pickState)).toBe(true);
    expect(pickState.value).toBe(7);

    runtime.recvCmds[3].packet = { id: PACKET_READY_END, ready: true };
    expect(recvPacketReadyToEnd(runtime, 3)).toBe(true);
    runtime.recvCmds[3].packet = { id: PACKET_PICK_STATE, pickState: 1 };
    expect(recvPacketReadyToEnd(runtime, 3)).toBe(false);
  });

  test('exact C-name packet helpers mirror the lower-case ported API', () => {
    const runtime = createDodrioCommRuntime();
    const player = createDodrioGamePlayer();
    const comms = Array.from({ length: 5 }, (_, i) => ({
      pickState: i,
      ateBerry: i === 0,
      missedBerry: i === 4
    }));

    SendPacket_ReadyToStart(runtime, true);
    SendPacket_PickState(runtime, 2);
    SendPacket_ReadyToEnd(runtime, false);
    SendPacket_GameState(runtime, player, comms[0], comms[1], comms[2], comms[3], comms[4], 3, true, false);

    expect(runtime.sentPackets.map((packet) => packet.id)).toEqual([
      PACKET_READY_START,
      PACKET_PICK_STATE,
      PACKET_READY_END,
      PACKET_GAME_STATE
    ]);

    runtime.recvCmds[0].command = RFUCMD_SEND_PACKET;
    runtime.recvCmds[1].packet = { id: PACKET_READY_START, ready: true };
    runtime.recvCmds[2].packet = { id: PACKET_PICK_STATE, pickState: 3 };
    runtime.recvCmds[3].packet = { id: PACKET_READY_END, ready: true };
    expect(RecvPacket_ReadyToStart(runtime, 1)).toBe(true);
    const pickState = { value: 0 };
    expect(RecvPacket_PickState(runtime, 2, pickState)).toBe(true);
    expect(pickState.value).toBe(3);
    expect(RecvPacket_ReadyToEnd(runtime, 3)).toBe(true);

    runtime.recvCmds[0].packet = runtime.sentPackets[3];
    const outPlayer = createDodrioGamePlayer();
    const outComms = Array.from({ length: 5 }, () => createDodrioCommData());
    const numGraySquares = { value: 0 };
    const berriesFalling = { value: false };
    const allReadyToEnd = { value: true };
    expect(
      RecvPacket_GameState(
        runtime,
        0,
        outPlayer,
        outComms[0],
        outComms[1],
        outComms[2],
        outComms[3],
        outComms[4],
        numGraySquares,
        berriesFalling,
        allReadyToEnd
      )
    ).toBe(true);
    expect(numGraySquares.value).toBe(3);
    expect(berriesFalling.value).toBe(true);
    expect(allReadyToEnd.value).toBe(false);
  });
});
