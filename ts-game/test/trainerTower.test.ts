import { describe, expect, test } from 'vitest';
import {
  LINK_MESSAGES,
  clearTrainerTowerResults,
  createTrainerTowerRecordBoard,
  finishTrainerTowerChallenge,
  recordTrainerTowerFloorCleared,
  transferEReaderData,
  createBrowserLinkRuntime,
  InMemoryLinkHub,
  openLinkSession,
  tickLinkSession
} from '../src/game/browserLink';
import { createScriptRuntimeState } from '../src/game/scripts';

describe('Trainer Tower records and e-Reader branches', () => {
  test('Trainer Tower hooks update persisted record vars without storing transient sessions', () => {
    const save = createScriptRuntimeState();

    expect(createTrainerTowerRecordBoard(save, 'single')).toEqual({
      challengeType: 'single',
      bestTimeSeconds: null,
      floorsCleared: 0,
      playerLost: false
    });
    expect(recordTrainerTowerFloorCleared(save, 'single').floorsCleared).toBe(1);
    expect(finishTrainerTowerChallenge(save, 'single', 612, false)).toMatchObject({
      bestTimeSeconds: 612,
      playerLost: false
    });
    expect(finishTrainerTowerChallenge(save, 'single', 900, false).bestTimeSeconds).toBe(612);
    expect(finishTrainerTowerChallenge(save, 'single', 500, true)).toMatchObject({
      bestTimeSeconds: 612,
      playerLost: true
    });

    clearTrainerTowerResults(save);
    expect(createTrainerTowerRecordBoard(save, 'single')).toMatchObject({
      bestTimeSeconds: null,
      floorsCleared: 0
    });
    expect(save.newGame.trainerTowerResultsCleared).toBe(true);
  });

  test('e-Reader send/receive and unsupported checksum branches mirror helper outcomes', () => {
    const hub = new InMemoryLinkHub();
    const sender = createBrowserLinkRuntime({
      clientId: 'sender',
      trainerName: 'BLUE',
      partyCount: 2,
      hasPokedex: true,
      hasWirelessAdapter: true
    }, hub);
    const receiver = createBrowserLinkRuntime({
      clientId: 'receiver',
      trainerName: 'RED',
      partyCount: 2,
      hasPokedex: true,
      hasWirelessAdapter: true
    }, hub);
    const request = {
      roomId: 'ereader-room',
      activity: 'eReader' as const,
      transport: 'eReader' as const,
      minPlayers: 2,
      maxPlayers: 2
    };
    const senderOpen = openLinkSession(sender, request);
    const receiverOpen = openLinkSession(receiver, request);
    tickLinkSession(sender, senderOpen.sessionId);
    tickLinkSession(receiver, receiverOpen.sessionId);

    const payload = { cardId: 'TRAINER_TOWER_CARD_1', words: [10, 20, 30], checksum: 60 };
    expect(transferEReaderData(sender, senderOpen.sessionId, payload, 'send')).toMatchObject({
      status: 'sent',
      message: LINK_MESSAGES.eReaderSent
    });
    expect(transferEReaderData(receiver, receiverOpen.sessionId, null, 'recv')).toMatchObject({
      status: 'received',
      payload
    });
    expect(transferEReaderData(sender, senderOpen.sessionId, {
      cardId: 'BAD_CARD',
      words: [1, 2],
      checksum: 99
    }, 'send')).toMatchObject({
      status: 'checksumError',
      message: LINK_MESSAGES.eReaderCantBeUsed
    });
  });
});
