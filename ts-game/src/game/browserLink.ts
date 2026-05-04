import type { DecompNewGameState } from './decompNewGame';

export type LinkFeatureFlow =
  | 'link-cable-battle-single'
  | 'link-cable-battle-double'
  | 'link-cable-battle-multi'
  | 'link-cable-trade'
  | 'wireless-union-room'
  | 'wireless-mystery-gift'
  | 'ereader-transfer'
  | 'trainer-tower-records';

export type LinkActivity =
  | 'singleBattle'
  | 'doubleBattle'
  | 'multiBattle'
  | 'trade'
  | 'unionRoom'
  | 'mysteryGift'
  | 'eReader'
  | 'trainerTower';

export type LinkTransportKind = 'cable' | 'wireless' | 'eReader';
export type LinkSessionStatus =
  | 'waiting'
  | 'readyToConfirm'
  | 'established'
  | 'canceled'
  | 'failed'
  | 'unsupported';

export interface LinkRuntimeSaveState {
  vars: Record<string, number>;
  flags: Set<string>;
  newGame: DecompNewGameState;
}

export interface LinkClientProfile {
  clientId: string;
  trainerName: string;
  partyCount: number;
  hasPokedex: boolean;
  hasWirelessAdapter: boolean;
  hasWonderCard?: boolean;
  mysteryGiftEnabled?: boolean;
}

export interface LinkSessionRequest {
  roomId: string;
  activity: LinkActivity;
  transport: LinkTransportKind;
  minPlayers: number;
  maxPlayers: number;
}

export interface LinkSessionView {
  sessionId: string;
  status: LinkSessionStatus;
  message: string;
  playerCount: number;
  readyCount: number;
  remoteTrainerNames: string[];
}

interface WireHelloMessage {
  type: 'hello';
  sessionId: string;
  clientId: string;
  trainerName: string;
  activity: LinkActivity;
  transport: LinkTransportKind;
  ready: boolean;
}

interface WireCancelMessage {
  type: 'cancel';
  sessionId: string;
  clientId: string;
}

interface WirePayloadMessage {
  type: 'payload';
  sessionId: string;
  clientId: string;
  activity: LinkActivity;
  payload: MysteryGiftPayload | EReaderPayload;
}

type WireMessage = WireHelloMessage | WireCancelMessage | WirePayloadMessage;

export interface LinkEndpoint {
  readonly clientId: string;
  readonly roomId: string;
  send(message: WireMessage): void;
  drain(): WireMessage[];
  close(): void;
}

export interface BrowserLinkTransport {
  createEndpoint(clientId: string, roomId: string): LinkEndpoint;
}

interface QueuedMessage {
  seq: number;
  senderId: string;
  message: WireMessage;
}

interface InMemoryEndpointState {
  clientId: string;
  roomId: string;
  cursor: number;
  closed: boolean;
}

export class InMemoryLinkHub implements BrowserLinkTransport {
  private readonly rooms = new Map<string, QueuedMessage[]>();
  private seq = 0;

  createEndpoint(clientId: string, roomId: string): LinkEndpoint {
    const state: InMemoryEndpointState = { clientId, roomId, cursor: 0, closed: false };
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, []);
    }
    return {
      clientId,
      roomId,
      send: (message) => {
        if (state.closed) {
          return;
        }
        this.rooms.get(roomId)!.push({ seq: this.seq, senderId: clientId, message });
        this.seq += 1;
      },
      drain: () => {
        const messages = this.rooms.get(roomId) ?? [];
        const unread = messages
          .filter((entry) => entry.seq >= state.cursor && entry.senderId !== clientId)
          .map((entry) => entry.message);
        state.cursor = this.seq;
        return unread;
      },
      close: () => {
        state.closed = true;
      }
    };
  }
}

interface RemotePeerState {
  trainerName: string;
  activity: LinkActivity;
  transport: LinkTransportKind;
  ready: boolean;
}

interface ActiveLinkSession {
  request: LinkSessionRequest;
  endpoint: LinkEndpoint;
  ready: boolean;
  canceled: boolean;
  remotePeers: Map<string, RemotePeerState>;
  payloads: WirePayloadMessage[];
}

export interface BrowserLinkRuntime {
  profile: LinkClientProfile;
  transport: BrowserLinkTransport;
  sessions: Map<string, ActiveLinkSession>;
}

export interface MysteryGiftPayload {
  kind: 'wonderCard' | 'wonderNews';
  id: string;
  title: string;
}

export interface MysteryGiftResult {
  status: 'unavailable' | 'waiting' | 'received' | 'alreadyHadCard';
  message: string;
  receivedPayload: MysteryGiftPayload | null;
}

export interface EReaderPayload {
  cardId: string;
  checksum: number;
  words: number[];
}

export interface EReaderResult {
  status: 'unsupported' | 'sent' | 'received' | 'canceled' | 'checksumError';
  message: string;
  payload: EReaderPayload | null;
}

export interface TrainerTowerRecordBoard {
  challengeType: 'single' | 'double' | 'knockout' | 'mixed';
  bestTimeSeconds: number | null;
  floorsCleared: number;
  playerLost: boolean;
}

export const LINK_MESSAGES = {
  pleaseWaitBCancel: 'Please wait.\n… … B Button: Cancel',
  allReady: 'When all players are ready…\nA Button: Confirm\nB Button: Cancel',
  established: 'Please enter.',
  someoneNotReady: 'Someone is not ready to link.\n\nPlease come back after everyone has made preparations.',
  differentSelections: 'The link partners appear to have\nmade different selections.',
  incorrectParticipants: 'The number of participants is\nincorrect.',
  connectionError: 'Sorry, we have a link error…\nPlease reset and try again.',
  adapterNotConnected: 'The Wireless Adapter is not\nconnected properly.',
  unionRoomAdapterNotConnected: 'This is the POKéMON WIRELESS CLUB\nUNION ROOM.\n\nUnfortunately, your Wireless\nAdapter is not connected properly.\n\nPlease do come again.',
  wirelessSearchCanceled: 'The WIRELESS COMMUNICATION\nSYSTEM search has been canceled.',
  wirelessLinkEstablished: 'The WIRELESS COMMUNICATION\nSYSTEM link has been established.',
  wirelessLinkDropped: 'The WIRELESS COMMUNICATION\nSYSTEM link has been dropped…',
  mysteryGiftCantUse: "Mystery Gift can't be used\nwhile the Wireless Adapter is not connected.",
  mysteryGiftReceived: 'Wonder Card received.',
  alreadyHadCard: 'You already had that Wonder Card.',
  eReaderCantBeUsed: "This data can't be used in\nthis version.",
  eReaderCanceled: 'The e-Reader transfer has been canceled.',
  eReaderSent: 'e-Reader data was sent over.',
  eReaderReceived: 'e-Reader data was received.',
  trainerTowerTimeBoard: 'TIME BOARD'
} as const;

export const TRACKED_HARDWARE_DEPENDENT_FEATURE_FLOWS: LinkFeatureFlow[] = [
  'link-cable-battle-single',
  'link-cable-battle-double',
  'link-cable-battle-multi',
  'link-cable-trade',
  'wireless-union-room',
  'wireless-mystery-gift',
  'ereader-transfer',
  'trainer-tower-records'
];

const REQUIRED_HARDWARE_DEPENDENT_FEATURE_FLOWS: LinkFeatureFlow[] = [
  'link-cable-battle-single',
  'link-cable-battle-double',
  'link-cable-battle-multi',
  'link-cable-trade',
  'wireless-union-room',
  'wireless-mystery-gift',
  'ereader-transfer',
  'trainer-tower-records'
];

export const createBrowserLinkRuntime = (
  profile: LinkClientProfile,
  transport: BrowserLinkTransport
): BrowserLinkRuntime => ({
  profile,
  transport,
  sessions: new Map()
});

const sessionKey = (request: LinkSessionRequest): string =>
  `${request.transport}:${request.activity}:${request.roomId}`;

const getSession = (runtime: BrowserLinkRuntime, sessionId: string): ActiveLinkSession => {
  const session = runtime.sessions.get(sessionId);
  if (!session) {
    throw new Error(`Link session ${sessionId} is not active`);
  }
  return session;
};

const validateRequest = (
  profile: LinkClientProfile,
  request: LinkSessionRequest
): LinkSessionView | null => {
  if (request.transport === 'wireless' && !profile.hasWirelessAdapter) {
    return {
      sessionId: sessionKey(request),
      status: 'unsupported',
      message: request.activity === 'unionRoom'
        ? LINK_MESSAGES.unionRoomAdapterNotConnected
        : LINK_MESSAGES.adapterNotConnected,
      playerCount: 1,
      readyCount: 0,
      remoteTrainerNames: []
    };
  }
  if (request.activity === 'unionRoom' && profile.partyCount < 2) {
    return {
      sessionId: sessionKey(request),
      status: 'unsupported',
      message: 'To enter the UNION ROOM, you must\nhave at least two POKéMON.',
      playerCount: 1,
      readyCount: 0,
      remoteTrainerNames: []
    };
  }
  if ((request.activity === 'doubleBattle' || request.activity === 'trade') && profile.partyCount < 2) {
    return {
      sessionId: sessionKey(request),
      status: 'unsupported',
      message: request.activity === 'trade'
        ? 'For trading, you must have at\nleast two POKéMON with you.'
        : 'For a DOUBLE BATTLE, you must\nhave at least two POKéMON.',
      playerCount: 1,
      readyCount: 0,
      remoteTrainerNames: []
    };
  }
  return null;
};

const broadcastHello = (runtime: BrowserLinkRuntime, session: ActiveLinkSession): void => {
  session.endpoint.send({
    type: 'hello',
    sessionId: sessionKey(session.request),
    clientId: runtime.profile.clientId,
    trainerName: runtime.profile.trainerName,
    activity: session.request.activity,
    transport: session.request.transport,
    ready: session.ready
  });
};

const viewSession = (sessionId: string, session: ActiveLinkSession): LinkSessionView => {
  const peers = [...session.remotePeers.entries()];
  const playerCount = 1 + peers.length;
  const readyCount = (session.ready ? 1 : 0) + peers.filter(([, peer]) => peer.ready).length;
  const differentSelection = peers.some(([, peer]) =>
    peer.activity !== session.request.activity || peer.transport !== session.request.transport
  );
  if (session.canceled) {
    return {
      sessionId,
      status: 'canceled',
      message: session.request.transport === 'wireless'
        ? LINK_MESSAGES.wirelessSearchCanceled
        : LINK_MESSAGES.pleaseWaitBCancel,
      playerCount,
      readyCount,
      remoteTrainerNames: peers.map(([, peer]) => peer.trainerName)
    };
  }
  if (differentSelection) {
    return {
      sessionId,
      status: 'failed',
      message: LINK_MESSAGES.differentSelections,
      playerCount,
      readyCount,
      remoteTrainerNames: peers.map(([, peer]) => peer.trainerName)
    };
  }
  if (playerCount > session.request.maxPlayers) {
    return {
      sessionId,
      status: 'failed',
      message: LINK_MESSAGES.incorrectParticipants,
      playerCount,
      readyCount,
      remoteTrainerNames: peers.map(([, peer]) => peer.trainerName)
    };
  }
  if (playerCount >= session.request.minPlayers && readyCount === playerCount) {
    return {
      sessionId,
      status: 'established',
      message: session.request.transport === 'wireless'
        ? LINK_MESSAGES.wirelessLinkEstablished
        : LINK_MESSAGES.established,
      playerCount,
      readyCount,
      remoteTrainerNames: peers.map(([, peer]) => peer.trainerName)
    };
  }
  if (playerCount >= session.request.minPlayers) {
    return {
      sessionId,
      status: 'readyToConfirm',
      message: LINK_MESSAGES.allReady,
      playerCount,
      readyCount,
      remoteTrainerNames: peers.map(([, peer]) => peer.trainerName)
    };
  }
  return {
    sessionId,
    status: 'waiting',
    message: LINK_MESSAGES.pleaseWaitBCancel,
    playerCount,
    readyCount,
    remoteTrainerNames: peers.map(([, peer]) => peer.trainerName)
  };
};

export const openLinkSession = (
  runtime: BrowserLinkRuntime,
  request: LinkSessionRequest
): LinkSessionView => {
  const unsupported = validateRequest(runtime.profile, request);
  if (unsupported) {
    return unsupported;
  }
  const id = sessionKey(request);
  const endpoint = runtime.transport.createEndpoint(runtime.profile.clientId, request.roomId);
  const session: ActiveLinkSession = {
    request,
    endpoint,
    ready: false,
    canceled: false,
    remotePeers: new Map(),
    payloads: []
  };
  runtime.sessions.set(id, session);
  broadcastHello(runtime, session);
  return viewSession(id, session);
};

export const tickLinkSession = (
  runtime: BrowserLinkRuntime,
  sessionId: string
): LinkSessionView => {
  const session = getSession(runtime, sessionId);
  for (const message of session.endpoint.drain()) {
    if (message.type === 'hello') {
      session.remotePeers.set(message.clientId, {
        trainerName: message.trainerName,
        activity: message.activity,
        transport: message.transport,
        ready: message.ready
      });
    } else if (message.type === 'cancel') {
      session.canceled = true;
    } else if (message.type === 'payload') {
      session.payloads.push(message);
    }
  }
  return viewSession(sessionId, session);
};

export const setLinkReady = (
  runtime: BrowserLinkRuntime,
  sessionId: string,
  ready: boolean
): LinkSessionView => {
  const session = getSession(runtime, sessionId);
  session.ready = ready;
  broadcastHello(runtime, session);
  return tickLinkSession(runtime, sessionId);
};

export const cancelLinkSession = (
  runtime: BrowserLinkRuntime,
  sessionId: string
): LinkSessionView => {
  const session = getSession(runtime, sessionId);
  session.canceled = true;
  session.endpoint.send({ type: 'cancel', sessionId, clientId: runtime.profile.clientId });
  session.endpoint.close();
  return viewSession(sessionId, session);
};

export const runUnionRoomHandshake = (
  runtime: BrowserLinkRuntime,
  roomId: string
): LinkSessionView => openLinkSession(runtime, {
  roomId,
  activity: 'unionRoom',
  transport: 'wireless',
  minPlayers: 2,
  maxPlayers: 5
});

export const recordUnionRoomInteraction = (save: LinkRuntimeSaveState): void => {
  save.vars.unionRoomNum = (save.vars.unionRoomNum ?? 0) + 1;
  save.newGame.unionRoomRegisteredTextsInitialized = true;
};

export const exchangeMysteryGift = (
  runtime: BrowserLinkRuntime,
  sessionId: string,
  payload?: MysteryGiftPayload
): MysteryGiftResult => {
  if (!runtime.profile.hasWirelessAdapter || runtime.profile.mysteryGiftEnabled === false) {
    return {
      status: 'unavailable',
      message: LINK_MESSAGES.mysteryGiftCantUse,
      receivedPayload: null
    };
  }
  const session = getSession(runtime, sessionId);
  if (payload) {
    session.endpoint.send({
      type: 'payload',
      sessionId,
      clientId: runtime.profile.clientId,
      activity: 'mysteryGift',
      payload
    });
  }
  tickLinkSession(runtime, sessionId);
  const received = session.payloads.find((message) => message.activity === 'mysteryGift')?.payload as MysteryGiftPayload | undefined;
  if (!received) {
    return { status: 'waiting', message: LINK_MESSAGES.pleaseWaitBCancel, receivedPayload: null };
  }
  if (runtime.profile.hasWonderCard && received.kind === 'wonderCard') {
    return { status: 'alreadyHadCard', message: LINK_MESSAGES.alreadyHadCard, receivedPayload: received };
  }
  runtime.profile.hasWonderCard = received.kind === 'wonderCard' || runtime.profile.hasWonderCard;
  return { status: 'received', message: LINK_MESSAGES.mysteryGiftReceived, receivedPayload: received };
};

export const markMysteryGiftCleared = (save: LinkRuntimeSaveState): void => {
  save.newGame.mysteryGiftCleared = true;
  save.flags.add('FLAG_MYSTERY_GIFT_DONE');
};

const checksumWords = (words: readonly number[]): number =>
  words.reduce((sum, word) => (sum + (word >>> 0)) >>> 0, 0);

export const transferEReaderData = (
  runtime: BrowserLinkRuntime,
  sessionId: string,
  payload: EReaderPayload | null,
  mode: 'send' | 'recv' | 'cancel'
): EReaderResult => {
  if (mode === 'cancel') {
    cancelLinkSession(runtime, sessionId);
    return { status: 'canceled', message: LINK_MESSAGES.eReaderCanceled, payload: null };
  }
  const session = getSession(runtime, sessionId);
  if (mode === 'send') {
    if (!payload || checksumWords(payload.words) !== payload.checksum) {
      return { status: 'checksumError', message: LINK_MESSAGES.eReaderCantBeUsed, payload };
    }
    session.endpoint.send({
      type: 'payload',
      sessionId,
      clientId: runtime.profile.clientId,
      activity: 'eReader',
      payload
    });
    return { status: 'sent', message: LINK_MESSAGES.eReaderSent, payload };
  }
  tickLinkSession(runtime, sessionId);
  const received = session.payloads.find((message) => message.activity === 'eReader')?.payload as EReaderPayload | undefined;
  if (!received) {
    return { status: 'unsupported', message: LINK_MESSAGES.eReaderCantBeUsed, payload: null };
  }
  if (checksumWords(received.words) !== received.checksum) {
    return { status: 'checksumError', message: LINK_MESSAGES.eReaderCantBeUsed, payload: received };
  }
  return { status: 'received', message: LINK_MESSAGES.eReaderReceived, payload: received };
};

export const createTrainerTowerRecordBoard = (
  save: LinkRuntimeSaveState,
  challengeType: TrainerTowerRecordBoard['challengeType']
): TrainerTowerRecordBoard => ({
  challengeType,
  bestTimeSeconds: save.vars[`trainerTower.${challengeType}.bestTimeSeconds`] ?? null,
  floorsCleared: save.vars[`trainerTower.${challengeType}.floorsCleared`] ?? 0,
  playerLost: (save.vars[`trainerTower.${challengeType}.playerLost`] ?? 0) === 1
});

export const recordTrainerTowerFloorCleared = (
  save: LinkRuntimeSaveState,
  challengeType: TrainerTowerRecordBoard['challengeType']
): TrainerTowerRecordBoard => {
  const key = `trainerTower.${challengeType}.floorsCleared`;
  save.vars[key] = (save.vars[key] ?? 0) + 1;
  save.newGame.trainerTowerResultsCleared = false;
  return createTrainerTowerRecordBoard(save, challengeType);
};

export const finishTrainerTowerChallenge = (
  save: LinkRuntimeSaveState,
  challengeType: TrainerTowerRecordBoard['challengeType'],
  elapsedSeconds: number,
  playerLost: boolean
): TrainerTowerRecordBoard => {
  const bestKey = `trainerTower.${challengeType}.bestTimeSeconds`;
  const lostKey = `trainerTower.${challengeType}.playerLost`;
  const currentBest = save.vars[bestKey];
  if (!playerLost && (currentBest === undefined || elapsedSeconds < currentBest)) {
    save.vars[bestKey] = Math.trunc(elapsedSeconds);
  }
  save.vars[lostKey] = playerLost ? 1 : 0;
  return createTrainerTowerRecordBoard(save, challengeType);
};

export const clearTrainerTowerResults = (save: LinkRuntimeSaveState): void => {
  for (const key of Object.keys(save.vars)) {
    if (key.startsWith('trainerTower.')) {
      delete save.vars[key];
    }
  }
  save.newGame.trainerTowerResultsCleared = true;
};

export const getUntrackedHardwareDependentFeatureFlows = (): LinkFeatureFlow[] =>
  REQUIRED_HARDWARE_DEPENDENT_FEATURE_FLOWS.filter((flow) =>
    !TRACKED_HARDWARE_DEPENDENT_FEATURE_FLOWS.includes(flow)
  );
