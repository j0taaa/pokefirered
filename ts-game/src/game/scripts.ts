import { openDialogueSequence, type DialogueState } from './interaction';
import type { PlayerState } from './player';

export interface ScriptRuntimeState {
  vars: Record<string, number>;
  flags: Set<string>;
  consumedTriggerIds: Set<string>;
  lastScriptId: string | null;
  startMenu: {
    mode: 'normal' | 'safari' | 'link' | 'unionRoom';
    playerName: string;
    hasPokedex: boolean;
    hasPokemon: boolean;
  };
}

export interface ScriptContext {
  player: PlayerState;
  dialogue: DialogueState;
  runtime: ScriptRuntimeState;
}

export type ScriptHandler = (context: ScriptContext) => void;

export const createScriptRuntimeState = (): ScriptRuntimeState => ({
  vars: {},
  flags: new Set<string>(),
  consumedTriggerIds: new Set<string>(),
  lastScriptId: null,
  startMenu: {
    mode: 'normal',
    playerName: 'PLAYER',
    hasPokedex: true,
    hasPokemon: true
  }
});

export const getScriptVar = (runtime: ScriptRuntimeState, key: string): number =>
  runtime.vars[key] ?? 0;

export const setScriptVar = (runtime: ScriptRuntimeState, key: string, value: number): void => {
  runtime.vars[key] = value;
};

export const addScriptVar = (runtime: ScriptRuntimeState, key: string, amount: number): number => {
  const nextValue = getScriptVar(runtime, key) + amount;
  runtime.vars[key] = nextValue;
  return nextValue;
};

export const isScriptFlagSet = (runtime: ScriptRuntimeState, flag: string): boolean =>
  runtime.flags.has(flag);

export const setScriptFlag = (runtime: ScriptRuntimeState, flag: string): void => {
  runtime.flags.add(flag);
};

export const clearScriptFlag = (runtime: ScriptRuntimeState, flag: string): void => {
  runtime.flags.delete(flag);
};

export const openScriptDialogue = (
  dialogue: DialogueState,
  speakerId: string,
  text: string
): void => {
  openDialogueSequence(dialogue, speakerId, [text]);
};

// Script callbacks are intentionally registry-based, mirroring how the original
// engine resolves script pointers from events in field_control_avatar.c.
export const prototypeScriptRegistry: Record<string, ScriptHandler> = {
  'sign.route-tips': ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'sign',
      'TRAINER TIPS: Press and hold Shift to run faster.'
    );
  },
  'sign.route-post': ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'sign',
      'ROUTE: Prototype path ahead. Watch for NPC patrols.'
    );
  },
  'coord.route-warning': ({ dialogue, runtime }) => {
    const seenCount = getScriptVar(runtime, 'routeWarningSeen');
    setScriptVar(runtime, 'routeWarningSeen', seenCount + 1);
    openScriptDialogue(
      dialogue,
      'system',
      seenCount === 0
        ? 'A chill wind blows from the east...'
        : 'You feel that same chill again.'
    );
  },
  'coord.route-warning-followup': ({ dialogue, runtime }) => {
    setScriptFlag(runtime, 'routeWarningAcknowledged');
    openScriptDialogue(dialogue, 'system', 'You steel yourself and push onward.');
  },
  'warp.route-pool': ({ dialogue, player }) => {
    player.position.x = 2 * 16;
    player.position.y = 2 * 16;
    openScriptDialogue(dialogue, 'system', 'You were whisked back to the trailhead.');
  },
  'object.npc-lass-01.interact': ({ dialogue }) => {
    openDialogueSequence(dialogue, 'npc-lass-01', [
      'The grass rustles when wild Pokémon are near.',
      'I am pacing this route to train my team!'
    ]);
  },
  'object.npc-bugcatcher-01.interact': ({ dialogue, runtime }) => {
    const seenCount = getScriptVar(runtime, 'bugcatcherSeen');
    addScriptVar(runtime, 'bugcatcherSeen', 1);
    openDialogueSequence(dialogue, 'npc-bugcatcher-01', [
      'My Caterpie and I are taking a breather.',
      seenCount === 0
        ? 'Talk to me again and I will share more bug-catching tips.'
        : 'Remember: look for moving grass to find wild encounters.'
    ]);
  }
};

export const runScriptById = (
  scriptId: string,
  context: ScriptContext,
  registry: Record<string, ScriptHandler> = prototypeScriptRegistry
): boolean => {
  const handler = registry[scriptId];
  if (!handler) {
    return false;
  }

  handler(context);
  context.runtime.lastScriptId = scriptId;
  return true;
};
