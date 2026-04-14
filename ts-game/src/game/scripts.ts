import { openDialogueSequence, type DialogueState } from './interaction';
import type { PlayerState } from './player';

export interface ScriptRuntimeState {
  vars: Record<string, number>;
  consumedTriggerIds: Set<string>;
  lastScriptId: string | null;
}

export interface ScriptContext {
  player: PlayerState;
  dialogue: DialogueState;
  runtime: ScriptRuntimeState;
}

export type ScriptHandler = (context: ScriptContext) => void;

export const createScriptRuntimeState = (): ScriptRuntimeState => ({
  vars: {},
  consumedTriggerIds: new Set<string>(),
  lastScriptId: null
});

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
    const seenCount = runtime.vars.routeWarningSeen ?? 0;
    runtime.vars.routeWarningSeen = seenCount + 1;
    openScriptDialogue(
      dialogue,
      'system',
      seenCount === 0
        ? 'A chill wind blows from the east...'
        : 'You feel that same chill again.'
    );
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
    const seenCount = runtime.vars.bugcatcherSeen ?? 0;
    runtime.vars.bugcatcherSeen = seenCount + 1;
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
