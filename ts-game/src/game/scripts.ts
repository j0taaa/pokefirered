import { openDialogueSequence, type DialogueState } from './interaction';
import type { PlayerState } from './player';

export interface ScriptRuntimeState {
  vars: Record<string, number>;
  flags: Set<string>;
  consumedTriggerIds: Set<string>;
  bag: {
    items: Record<string, number>;
    itemCapacity: number;
    maxStackQuantity: number;
  };
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
  bag: {
    items: {},
    itemCapacity: 42,
    maxStackQuantity: 999
  },
  saveCounter: 0,
  lastScriptId: null,
  startMenu: {
    mode: 'normal',
    playerName: 'PLAYER',
    hasPokedex: true,
    hasPokemon: true,
    seenPokemonCount: 1
  },
  options: {
    textSpeed: 'mid',
    battleScene: true,
    battleStyle: 'shift'
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

export const checkBagHasSpace = (
  runtime: ScriptRuntimeState,
  itemId: string,
  count: number
): boolean => {
  const currentQuantity = runtime.bag.items[itemId];
  if (currentQuantity !== undefined) {
    return currentQuantity + count <= runtime.bag.maxStackQuantity;
  }

  return Object.keys(runtime.bag.items).length < runtime.bag.itemCapacity;
};

export const addBagItem = (
  runtime: ScriptRuntimeState,
  itemId: string,
  count: number
): boolean => {
  if (!checkBagHasSpace(runtime, itemId, count)) {
    return false;
  }

  runtime.bag.items[itemId] = (runtime.bag.items[itemId] ?? 0) + count;
  return true;
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
  Route1_EventScript_RouteSign: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'sign', [
      'ROUTE 1',
      'PALLET TOWN - VIRIDIAN CITY'
    ]);
  },
  Route1_EventScript_Boy: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'Route1_ObjectEvent_Boy', [
      'See those ledges along the road?',
      'It is a bit scary, but you can jump from them.',
      'You can get back to PALLET TOWN quicker that way.'
    ]);
  },
  Route1_EventScript_MartClerk: ({ dialogue, runtime }) => {
    if (isScriptFlagSet(runtime, 'FLAG_GOT_POTION_ON_ROUTE_1')) {
      openDialogueSequence(dialogue, 'Route1_ObjectEvent_MartClerk', [
        'Please come see us if you need POKE BALLS for catching POKEMON.'
      ]);
      return;
    }

    if (!checkBagHasSpace(runtime, 'ITEM_POTION', 1)) {
      openDialogueSequence(dialogue, 'Route1_ObjectEvent_MartClerk', [
        'The BAG is full.'
      ]);
      return;
    }

    addBagItem(runtime, 'ITEM_POTION', 1);
    setScriptFlag(runtime, 'FLAG_GOT_POTION_ON_ROUTE_1');
    openDialogueSequence(dialogue, 'Route1_ObjectEvent_MartClerk', [
      'Hi! I work at a POKEMON MART.',
      'Please, visit us in VIRIDIAN CITY.',
      'I know, I will give you a sample. Here you go!',
      'PLAYER put the POTION away in the BAG ITEMS POCKET.'
    ]);
  },
  PalletTown_EventScript_SignLady: ({ dialogue, runtime }) => {
    const scene = getScriptVar(runtime, 'VAR_MAP_SCENE_PALLET_TOWN_SIGN_LADY');
    if (scene === 2) {
      openDialogueSequence(dialogue, 'LOCALID_PALLET_SIGN_LADY', [
        'I am raising POKEMON, too.',
        'When they get strong, they can protect me.'
      ]);
      return;
    }

    if (scene === 1) {
      openScriptDialogue(dialogue, 'LOCALID_PALLET_SIGN_LADY', 'Signs are useful, are they not?');
      return;
    }

    if (isScriptFlagSet(runtime, 'FLAG_TEMP_2')) {
      openScriptDialogue(dialogue, 'LOCALID_PALLET_SIGN_LADY', 'Read it, read it!');
      return;
    }

    openDialogueSequence(dialogue, 'LOCALID_PALLET_SIGN_LADY', [
      'Hmm...',
      'Is that right...'
    ]);
  },
  PalletTown_EventScript_FatMan: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'LOCALID_PALLET_FAT_MAN', [
      'Technology is incredible!',
      'You can now store and recall items and POKEMON as data via PC.'
    ]);
  },
  PalletTown_EventScript_OaksLabSign: ({ dialogue }) => {
    openScriptDialogue(dialogue, 'sign', 'OAK POKEMON RESEARCH LAB');
  },
  PalletTown_EventScript_PlayersHouseSign: ({ dialogue, runtime }) => {
    openScriptDialogue(dialogue, 'sign', `${runtime.startMenu.playerName}'s house`);
  },
  PalletTown_EventScript_RivalsHouseSign: ({ dialogue }) => {
    openScriptDialogue(dialogue, 'sign', "RIVAL's house");
  },
  PalletTown_EventScript_TownSign: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'sign', [
      'PALLET TOWN',
      'Shades of your journey await!'
    ]);
  },
  PalletTown_EventScript_TrainerTips: ({ dialogue, runtime }) => {
    setScriptVar(runtime, 'VAR_MAP_SCENE_PALLET_TOWN_SIGN_LADY', 1);
    openDialogueSequence(dialogue, 'sign', [
      'TRAINER TIPS',
      'Press START to open the MENU!'
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
