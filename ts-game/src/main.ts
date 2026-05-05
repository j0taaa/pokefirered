import './style.css';
import { GameLoop } from './core/gameLoop';
import { GameSession } from './core/gameSession';
import { BrowserInputAdapter } from './input/inputState';
import { playMenuSoundEffect, type AudioEvent } from './game/decompFieldSound';
import { createHud, updateHud } from './ui/hud';
import {
  BrowserAudioAdapter,
  BrowserRenderAdapter,
  BrowserStorageAdapter
} from './browser/browserAdapters';
import {
  InMemoryLinkHub,
  LINK_MESSAGES,
  cancelLinkSession,
  createBrowserLinkRuntime,
  runUnionRoomHandshake,
  setLinkReady,
  tickLinkSession,
  type LinkSessionView
} from './game/browserLink';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('Unable to mount app shell');
}

const shell = document.createElement('div');
shell.className = 'game-shell';
const viewport = document.createElement('div');
viewport.className = 'game-viewport';
const canvas = document.createElement('canvas');
viewport.append(canvas);

const hud = createHud();
shell.append(viewport, hud.root);
app.append(shell);

const input = new BrowserInputAdapter();
input.attach();
const audio = new BrowserAudioAdapter();
const render = new BrowserRenderAdapter(canvas);
render.preload();

const session = new GameSession({
  storage: new BrowserStorageAdapter(),
  audio,
  input,
  render
});

const initialFrameState = session.getRenderableState();
render.resize(initialFrameState.camera.viewportWidth, initialFrameState.camera.viewportHeight);

window.__pokemonFireRedAudioEvents = session.getRuntimeState().scriptRuntime.fieldAudio.events;
window.__pokemonFireRedAudioDebug = {
  emitMenuBeep: () => playMenuSoundEffect(session.getRuntimeState().scriptRuntime, 5, 'browser-qa-menu'),
  getEvents: () => session.getRuntimeState().scriptRuntime.fieldAudio.events
};
window.__pokemonFireRedLinkDebug = {
  runTwoClientUnionRoomReadyFlow: () => {
    const hub = new InMemoryLinkHub();
    const red = createBrowserLinkRuntime({
      clientId: 'browser-red',
      trainerName: 'RED',
      partyCount: 2,
      hasPokedex: true,
      hasWirelessAdapter: true
    }, hub);
    const leaf = createBrowserLinkRuntime({
      clientId: 'browser-leaf',
      trainerName: 'LEAF',
      partyCount: 2,
      hasPokedex: true,
      hasWirelessAdapter: true
    }, hub);
    const redOpen = runUnionRoomHandshake(red, 'browser-union-room-ready');
    const leafOpen = runUnionRoomHandshake(leaf, 'browser-union-room-ready');
    const redReadyToConfirm = tickLinkSession(red, redOpen.sessionId);
    const leafReadyToConfirm = tickLinkSession(leaf, leafOpen.sessionId);
    setLinkReady(red, redOpen.sessionId, true);
    setLinkReady(leaf, leafOpen.sessionId, true);
    return {
      redReadyToConfirm,
      leafReadyToConfirm,
      redEstablished: tickLinkSession(red, redOpen.sessionId),
      leafEstablished: tickLinkSession(leaf, leafOpen.sessionId),
      expectedEstablishedMessage: LINK_MESSAGES.wirelessLinkEstablished
    };
  },
  runTwoClientUnionRoomCancelFlow: () => {
    const hub = new InMemoryLinkHub();
    const red = createBrowserLinkRuntime({
      clientId: 'browser-red',
      trainerName: 'RED',
      partyCount: 2,
      hasPokedex: true,
      hasWirelessAdapter: true
    }, hub);
    const leaf = createBrowserLinkRuntime({
      clientId: 'browser-leaf',
      trainerName: 'LEAF',
      partyCount: 2,
      hasPokedex: true,
      hasWirelessAdapter: true
    }, hub);
    const redOpen = runUnionRoomHandshake(red, 'browser-union-room-cancel');
    const leafOpen = runUnionRoomHandshake(leaf, 'browser-union-room-cancel');
    tickLinkSession(red, redOpen.sessionId);
    tickLinkSession(leaf, leafOpen.sessionId);
    const leafCanceled = cancelLinkSession(leaf, leafOpen.sessionId);
    return {
      leafCanceled,
      redCanceled: tickLinkSession(red, redOpen.sessionId),
      expectedCancelMessage: LINK_MESSAGES.wirelessSearchCanceled
    };
  }
};

const loop = new GameLoop({
  update(dt) {
    void dt;
    session.step(input.readSnapshot());
  },
  render() {
    const frameState = session.getRenderableState();
    render.render(frameState);
    updateHud(
      hud,
      frameState.player,
      [...frameState.visibleNpcs],
      frameState.hud.fps,
      frameState.camera,
      frameState.overlays.dialogue,
      frameState.hud.lastScriptId,
      frameState.overlays.startMenu,
      frameState.overlays.battle
    );
  }
});

loop.start();
window.addEventListener('beforeunload', () => {
  input.detach();
  session.cleanup();
  loop.stop();
});

declare global {
  interface Window {
    __pokemonFireRedAudioEvents?: AudioEvent[];
    __pokemonFireRedAudioDebug?: {
      emitMenuBeep(): void;
      getEvents(): AudioEvent[];
    };
    __pokemonFireRedLinkDebug?: {
      runTwoClientUnionRoomReadyFlow(): {
        redReadyToConfirm: LinkSessionView;
        leafReadyToConfirm: LinkSessionView;
        redEstablished: LinkSessionView;
        leafEstablished: LinkSessionView;
        expectedEstablishedMessage: string;
      };
      runTwoClientUnionRoomCancelFlow(): {
        leafCanceled: LinkSessionView;
        redCanceled: LinkSessionView;
        expectedCancelMessage: string;
      };
    };
  }
}
