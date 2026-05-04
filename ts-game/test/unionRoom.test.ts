import { describe, expect, test } from 'vitest';
import {
  InMemoryLinkHub,
  LINK_MESSAGES,
  createBrowserLinkRuntime,
  recordUnionRoomInteraction,
  runUnionRoomHandshake,
  setLinkReady,
  tickLinkSession
} from '../src/game/browserLink';
import { createScriptRuntimeState } from '../src/game/scripts';

describe('Union Room browser parity hooks', () => {
  test('requires wireless adapter and keeps failed sessions runtime-only', () => {
    const runtime = createBrowserLinkRuntime({
      clientId: 'red',
      trainerName: 'RED',
      partyCount: 2,
      hasPokedex: true,
      hasWirelessAdapter: false
    }, new InMemoryLinkHub());

    const result = runUnionRoomHandshake(runtime, 'union-room-no-adapter');
    expect(result.status).toBe('unsupported');
    expect(result.message).toBe(LINK_MESSAGES.unionRoomAdapterNotConnected);
    expect(runtime.sessions.size).toBe(0);
  });

  test('records durable Union Room interaction count after established wireless link', () => {
    const hub = new InMemoryLinkHub();
    const red = createBrowserLinkRuntime({
      clientId: 'red',
      trainerName: 'RED',
      partyCount: 2,
      hasPokedex: true,
      hasWirelessAdapter: true
    }, hub);
    const leaf = createBrowserLinkRuntime({
      clientId: 'leaf',
      trainerName: 'LEAF',
      partyCount: 2,
      hasPokedex: true,
      hasWirelessAdapter: true
    }, hub);
    const save = createScriptRuntimeState();

    const redOpen = runUnionRoomHandshake(red, 'union-room-record');
    const leafOpen = runUnionRoomHandshake(leaf, 'union-room-record');
    tickLinkSession(red, redOpen.sessionId);
    tickLinkSession(leaf, leafOpen.sessionId);
    setLinkReady(red, redOpen.sessionId, true);
    setLinkReady(leaf, leafOpen.sessionId, true);

    expect(tickLinkSession(red, redOpen.sessionId).status).toBe('established');
    recordUnionRoomInteraction(save);

    expect(save.vars.unionRoomNum).toBe(1);
    expect(save.newGame.unionRoomRegisteredTextsInitialized).toBe(true);
  });
});
