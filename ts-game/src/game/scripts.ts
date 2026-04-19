import { openDialogueSequence, type DialogueState } from './interaction';
import type { PlayerState } from './player';
import { createBagState, getItemDefinition, type BagState } from './bag';
import {
  createDefaultParty,
  createDefaultPokedex,
  healParty,
  type FieldPokemon,
  type PokedexState
} from './pokemonStorage';

export interface ScriptRuntimeState {
  vars: Record<string, number>;
  flags: Set<string>;
  consumedTriggerIds: Set<string>;
  saveCounter: number;
  lastScriptId: string | null;
  startMenu: {
    mode: 'normal' | 'safari' | 'link' | 'unionRoom';
    playerName: string;
    hasPokedex: boolean;
    hasPokemon: boolean;
    seenPokemonCount: number;
  };
  options: {
    textSpeed: 'slow' | 'mid' | 'fast';
    battleScene: boolean;
    battleStyle: 'shift' | 'set';
    sound: 'mono' | 'stereo';
    buttonMode: 'help' | 'lr' | 'lEqualsA';
    frameType: number;
  };
  party: FieldPokemon[];
  pokedex: PokedexState;
  bag: BagState;
}

export interface ScriptContext {
  player: PlayerState;
  dialogue: DialogueState;
  runtime: ScriptRuntimeState;
}

export type ScriptHandler = (context: ScriptContext) => void;

export const createScriptRuntimeState = (): ScriptRuntimeState => ({
  ...(() => {
    const pokedex = createDefaultPokedex();
    return {
      vars: {},
      flags: new Set<string>(),
      consumedTriggerIds: new Set<string>(),
      saveCounter: 0,
      lastScriptId: null,
      startMenu: {
        mode: 'normal' as const,
        playerName: 'PLAYER',
        hasPokedex: true,
        hasPokemon: true,
        seenPokemonCount: pokedex.seenSpecies.length
      },
      options: {
        textSpeed: 'mid' as const,
        battleScene: true,
        battleStyle: 'shift' as const,
        sound: 'stereo' as const,
        buttonMode: 'help' as const,
        frameType: 0
      },
      party: createDefaultParty(),
      pokedex,
      bag: createBagState()
    };
  })()
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

const VIRIDIAN_MART_STOCK = [
  'ITEM_POKE_BALL',
  'ITEM_POTION',
  'ITEM_ANTIDOTE',
  'ITEM_PARALYZE_HEAL'
] as const;

const viridianMartStockLine = (): string =>
  `Shop UI stub: ${VIRIDIAN_MART_STOCK
    .map((itemId) => getItemDefinition(itemId).name.replace('é', 'e').toUpperCase())
    .join(', ')}.`;

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
  'object.npc-lass-01.interact': ({ dialogue, runtime }) => {
    const seenIntro = isScriptFlagSet(runtime, 'npc.lass01.introSeen');
    if (!seenIntro) {
      setScriptFlag(runtime, 'npc.lass01.introSeen');
      openDialogueSequence(dialogue, 'npc-lass-01', [
        'The grass rustles when wild Pokémon are near.',
        'I am pacing this route to train my team!'
      ]);
      return;
    }

    const routeWarnings = getScriptVar(runtime, 'routeWarningSeen');
    openDialogueSequence(dialogue, 'npc-lass-01', [
      'Back again? Keep your Pokémon healthy out there.',
      routeWarnings >= 2
        ? 'That eastern wind still feels strange... stay alert.'
        : 'Try talking to every trainer and every sign.'
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
  },
  ViridianCity_PokemonCenter_1F_EventScript_Nurse: ({ dialogue, runtime }) => {
    healParty(runtime.party);
    openDialogueSequence(dialogue, 'LOCALID_VIRIDIAN_NURSE', [
      'Welcome to our POKeMON CENTER! We heal your POKeMON back to perfect health.',
      "Okay, I'll take your POKeMON for a few seconds.",
      "We've restored your POKeMON to full health.",
      'We hope to see you again!'
    ]);
  },
  ViridianCity_PokemonCenter_1F_EventScript_Boy: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'ViridianCity_PokemonCenter_1F_ObjectEvent_Boy', [
      "There's a POKeMON CENTER in every town ahead.",
      "They charge no money, so don't be shy about healing POKeMON."
    ]);
  },
  ViridianCity_PokemonCenter_1F_EventScript_Gentleman: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'ViridianCity_PokemonCenter_1F_ObjectEvent_Gentleman', [
      'Please feel free to use that PC in the corner.',
      "The receptionist told me so. It's so kind of her!"
    ]);
  },
  ViridianCity_PokemonCenter_1F_EventScript_Youngster: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'ViridianCity_PokemonCenter_1F_ObjectEvent_Youngster', [
      'POKeMON CENTERS heal your tired, hurt, or fainted POKeMON.',
      'They make all POKeMON completely healthy.'
    ]);
  },
  ViridianCity_Mart_EventScript_Clerk: ({ dialogue, runtime }) => {
    if (getScriptVar(runtime, 'VAR_MAP_SCENE_VIRIDIAN_CITY_MART') === 1) {
      openDialogueSequence(dialogue, 'LOCALID_VIRIDIAN_MART_CLERK', [
        'Okay, thanks! Please say hi to',
        'PROF. OAK for me, too.'
      ]);
      return;
    }

    openDialogueSequence(dialogue, 'LOCALID_VIRIDIAN_MART_CLERK', [
      'May I help you?',
      viridianMartStockLine(),
      'Please come again!'
    ]);
  },
  ViridianCity_Mart_EventScript_Woman: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'ViridianCity_Mart_ObjectEvent_Woman', [
      "This shop does good business in",
      "ANTIDOTES, I've heard."
    ]);
  },
  ViridianCity_Mart_EventScript_Youngster: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'ViridianCity_Mart_ObjectEvent_Youngster', [
      "I've got to buy some POTIONS.",
      'You never know when your POKeMON',
      'will need quick healing.'
    ]);
  },
  ViridianCity_School_EventScript_Woman: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'LOCALID_SCHOOL_WOMAN', [
      'Okay!',
      "Be sure to read what's on the blackboard carefully!"
    ]);
  },
  ViridianCity_School_EventScript_Lass: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'LOCALID_SCHOOL_LASS', [
      "Whew! I'm trying to memorize all my notes."
    ]);
  },
  ViridianCity_School_EventScript_Notebook: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'system', [
      "Let's check out the notebook.",
      'First page…',
      'POKe BALLS are used to catch POKeMON.',
      'Up to six POKeMON can be carried in your party.',
      'People who raise and battle with POKeMON are called TRAINERS.',
      '(Notebook multi-page stub — full yes/no paging pending script engine.)'
    ]);
  },
  ViridianCity_School_EventScript_Blackboard: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'system', [
      'The blackboard lists POKeMON STATUS problems during battles.',
      '(Blackboard multi-choice stub — Sleep, Poison, Paralysis, Burn, Freeze, Exit pending script engine.)'
    ]);
  },
  ViridianCity_School_EventScript_PokemonJournal: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'system',
      "It's a POKeMON journal. (Content stub pending script engine.)"
    );
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
