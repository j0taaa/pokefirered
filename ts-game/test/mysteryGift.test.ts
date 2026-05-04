import { describe, expect, test } from 'vitest';
import {
  InMemoryLinkHub,
  LINK_MESSAGES,
  createBrowserLinkRuntime,
  exchangeMysteryGift,
  markMysteryGiftCleared,
  openLinkSession,
  setLinkReady,
  tickLinkSession
} from '../src/game/browserLink';
import { createScriptRuntimeState } from '../src/game/scripts';

const giftProfile = (clientId: string, trainerName: string, hasWonderCard = false) => ({
  clientId,
  trainerName,
  partyCount: 2,
  hasPokedex: true,
  hasWirelessAdapter: true,
  mysteryGiftEnabled: true,
  hasWonderCard
});

describe('Mystery Gift browser adapter branches', () => {
  test('unavailable branch does not fake success without wireless state', () => {
    const runtime = createBrowserLinkRuntime({
      clientId: 'red',
      trainerName: 'RED',
      partyCount: 2,
      hasPokedex: true,
      hasWirelessAdapter: false,
      mysteryGiftEnabled: false
    }, new InMemoryLinkHub());

    const result = exchangeMysteryGift(runtime, 'missing-session');
    expect(result.status).toBe('unavailable');
    expect(result.receivedPayload).toBeNull();
    expect(result.message).toBe(LINK_MESSAGES.mysteryGiftCantUse);
  });

  test('receives Wonder Card only after deterministic two-client state exchange', () => {
    const hub = new InMemoryLinkHub();
    const sender = createBrowserLinkRuntime(giftProfile('sender', 'BLUE'), hub);
    const receiver = createBrowserLinkRuntime(giftProfile('receiver', 'RED'), hub);
    const request = {
      roomId: 'mystery-gift-room',
      activity: 'mysteryGift' as const,
      transport: 'wireless' as const,
      minPlayers: 2,
      maxPlayers: 2
    };

    const senderOpen = openLinkSession(sender, request);
    const receiverOpen = openLinkSession(receiver, request);
    tickLinkSession(sender, senderOpen.sessionId);
    tickLinkSession(receiver, receiverOpen.sessionId);
    setLinkReady(sender, senderOpen.sessionId, true);
    setLinkReady(receiver, receiverOpen.sessionId, true);

    const waiting = exchangeMysteryGift(receiver, receiverOpen.sessionId);
    expect(waiting.status).toBe('waiting');

    exchangeMysteryGift(sender, senderOpen.sessionId, {
      kind: 'wonderCard',
      id: 'AURORA_TICKET',
      title: 'AURORA TICKET'
    });
    const received = exchangeMysteryGift(receiver, receiverOpen.sessionId);

    expect(received.status).toBe('received');
    expect(received.receivedPayload?.id).toBe('AURORA_TICKET');
    expect(receiver.profile.hasWonderCard).toBe(true);
  });

  test('already-held Wonder Card and persistent cleared flag are represented', () => {
    const hub = new InMemoryLinkHub();
    const sender = createBrowserLinkRuntime(giftProfile('sender', 'BLUE'), hub);
    const receiver = createBrowserLinkRuntime(giftProfile('receiver', 'RED', true), hub);
    const save = createScriptRuntimeState();
    const request = {
      roomId: 'mystery-gift-duplicate',
      activity: 'mysteryGift' as const,
      transport: 'wireless' as const,
      minPlayers: 2,
      maxPlayers: 2
    };

    const senderOpen = openLinkSession(sender, request);
    const receiverOpen = openLinkSession(receiver, request);
    tickLinkSession(sender, senderOpen.sessionId);
    tickLinkSession(receiver, receiverOpen.sessionId);
    exchangeMysteryGift(sender, senderOpen.sessionId, {
      kind: 'wonderCard',
      id: 'MYSTIC_TICKET',
      title: 'MYSTIC TICKET'
    });

    const duplicate = exchangeMysteryGift(receiver, receiverOpen.sessionId);
    markMysteryGiftCleared(save);

    expect(duplicate.status).toBe('alreadyHadCard');
    expect(duplicate.message).toBe(LINK_MESSAGES.alreadyHadCard);
    expect(save.newGame.mysteryGiftCleared).toBe(true);
    expect(save.flags.has('FLAG_MYSTERY_GIFT_DONE')).toBe(true);
  });
});
