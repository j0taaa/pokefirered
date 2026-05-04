import { describe, expect, test } from 'vitest';
import {
  InMemoryLinkHub,
  LINK_MESSAGES,
  cancelLinkSession,
  createBrowserLinkRuntime,
  getUntrackedHardwareDependentFeatureFlows,
  openLinkSession,
  runUnionRoomHandshake,
  setLinkReady,
  tickLinkSession
} from '../src/game/browserLink';

const makeProfile = (clientId: string, trainerName: string) => ({
  clientId,
  trainerName,
  partyCount: 2,
  hasPokedex: true,
  hasWirelessAdapter: true,
  mysteryGiftEnabled: true
});

describe('browser link and wireless adapters', () => {
  test('in-memory transport completes a two-client cable trade handshake with ready states', () => {
    const hub = new InMemoryLinkHub();
    const red = createBrowserLinkRuntime(makeProfile('red', 'RED'), hub);
    const leaf = createBrowserLinkRuntime(makeProfile('leaf', 'LEAF'), hub);

    const request = {
      roomId: 'cable-room-1',
      activity: 'trade' as const,
      transport: 'cable' as const,
      minPlayers: 2,
      maxPlayers: 2
    };
    const redOpen = openLinkSession(red, request);
    const leafOpen = openLinkSession(leaf, request);

    expect(redOpen.message).toBe(LINK_MESSAGES.pleaseWaitBCancel);
    expect(leafOpen.status).toBe('waiting');

    const redSeen = tickLinkSession(red, redOpen.sessionId);
    const leafSeen = tickLinkSession(leaf, leafOpen.sessionId);

    expect(redSeen).toMatchObject({ status: 'readyToConfirm', playerCount: 2, readyCount: 0 });
    expect(leafSeen.remoteTrainerNames).toEqual(['RED']);

    setLinkReady(red, redOpen.sessionId, true);
    const leafAfterRedReady = tickLinkSession(leaf, leafOpen.sessionId);
    expect(leafAfterRedReady).toMatchObject({ status: 'readyToConfirm', readyCount: 1 });

    const leafReady = setLinkReady(leaf, leafOpen.sessionId, true);
    expect(leafReady).toMatchObject({ status: 'established', readyCount: 2 });
    expect(leafReady.message).toBe(LINK_MESSAGES.established);
    expect(tickLinkSession(red, redOpen.sessionId).status).toBe('established');
  });

  test('wireless Union Room handshake exposes decomp cancel branch', () => {
    const hub = new InMemoryLinkHub();
    const red = createBrowserLinkRuntime(makeProfile('red', 'RED'), hub);
    const leaf = createBrowserLinkRuntime(makeProfile('leaf', 'LEAF'), hub);

    const redOpen = runUnionRoomHandshake(red, 'union-room-1');
    const leafOpen = runUnionRoomHandshake(leaf, 'union-room-1');
    tickLinkSession(red, redOpen.sessionId);
    tickLinkSession(leaf, leafOpen.sessionId);

    const canceled = cancelLinkSession(leaf, leafOpen.sessionId);
    expect(canceled).toMatchObject({ status: 'canceled' });
    expect(canceled.message).toBe(LINK_MESSAGES.wirelessSearchCanceled);
    expect(tickLinkSession(red, redOpen.sessionId).message).toBe(LINK_MESSAGES.wirelessSearchCanceled);
  });

  test('different link selections fail with Cable Club message', () => {
    const hub = new InMemoryLinkHub();
    const red = createBrowserLinkRuntime(makeProfile('red', 'RED'), hub);
    const leaf = createBrowserLinkRuntime(makeProfile('leaf', 'LEAF'), hub);

    const redOpen = openLinkSession(red, {
      roomId: 'mixed-room',
      activity: 'singleBattle',
      transport: 'cable',
      minPlayers: 2,
      maxPlayers: 2
    });
    openLinkSession(leaf, {
      roomId: 'mixed-room',
      activity: 'trade',
      transport: 'cable',
      minPlayers: 2,
      maxPlayers: 2
    });

    const result = tickLinkSession(red, redOpen.sessionId);
    expect(result.status).toBe('failed');
    expect(result.message).toBe(LINK_MESSAGES.differentSelections);
  });

  test('inventory gate reports zero untracked hardware-dependent feature flows', () => {
    expect(getUntrackedHardwareDependentFeatureFlows()).toEqual([]);
  });
});
