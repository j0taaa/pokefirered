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

export const runFindItemScript = (
  dialogue: DialogueState,
  runtime: ScriptRuntimeState,
  itemId: string,
  flag: string,
  count = 1
): boolean => {
  if (isScriptFlagSet(runtime, flag)) {
    openScriptDialogue(dialogue, 'item', 'There is nothing here.');
    return false;
  }

  if (!checkBagHasSpace(runtime, itemId, count)) {
    openScriptDialogue(dialogue, 'item', 'The BAG is full.');
    return false;
  }

  addBagItem(runtime, itemId, count);
  setScriptFlag(runtime, flag);
  openDialogueSequence(dialogue, 'item', [
    `PLAYER found ${count > 1 ? `${count} ` : 'a '}${itemId.replace(/^ITEM_/, '').replace(/_/g, ' ')}!`,
    `PLAYER put the ${itemId.replace(/^ITEM_/, '').replace(/_/g, ' ')} away in the BAG ITEMS POCKET.`
  ]);
  return true;
};

const runViridianTutorialOldManScript = (
  dialogue: DialogueState,
  runtime: ScriptRuntimeState
): void => {
  if (isScriptFlagSet(runtime, 'FLAG_BADGE01_GET')) {
    openDialogueSequence(dialogue, 'LOCALID_TUTORIAL_MAN', [
      'Well, now, I have had my coffee, and that is what I need to get going!',
      'Incidentally, is my old TEACHY TV helping you?',
      'Wahaha! It is my grandson on the show!'
    ]);
    return;
  }

  const scene = getScriptVar(runtime, 'VAR_MAP_SCENE_VIRIDIAN_CITY_OLD_MAN');
  if (scene >= 2) {
    openDialogueSequence(dialogue, 'LOCALID_TUTORIAL_MAN', [
      'Well, now, I have had my coffee, and that is what I need to get going!',
      'At first, focus on weakening the POKEMON before trying to catch it.'
    ]);
    return;
  }

  if (scene === 1) {
    setScriptVar(runtime, 'VAR_MAP_SCENE_VIRIDIAN_CITY_OLD_MAN', 2);
    addBagItem(runtime, 'ITEM_TEACHY_TV', 1);
    openDialogueSequence(dialogue, 'LOCALID_TUTORIAL_MAN', [
      'Well, now, I have had my coffee, and that is what I need to get going!',
      'I suppose I had better show you how to catch a POKEMON!',
      'There! Now tell me, that was educational, was it not?',
      'PLAYER received the TEACHY TV.',
      'If there is something you do not understand, watch that.'
    ]);
    return;
  }

  openDialogueSequence(dialogue, 'LOCALID_TUTORIAL_MAN', [
    'I absolutely forbid you from going through here!',
    'This is private property!'
  ]);
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
  },
  PalletTown_EventScript_OakTriggerLeft: ({ dialogue, runtime }) => {
    setScriptVar(runtime, 'VAR_TEMP_1', 0);
    setScriptVar(runtime, 'VAR_MAP_SCENE_PALLET_TOWN_OAK', 1);
    setScriptFlag(runtime, 'FLAG_HIDE_OAK_IN_PALLET_TOWN');
    openDialogueSequence(dialogue, 'LOCALID_PALLET_PROF_OAK', [
      'OAK: Hey! Wait!',
      'Do not go out!',
      'It is unsafe! Wild POKEMON live in tall grass!',
      'You need your own POKEMON for your protection.'
    ]);
  },
  PalletTown_EventScript_OakTriggerRight: ({ dialogue, runtime }) => {
    setScriptVar(runtime, 'VAR_TEMP_1', 1);
    setScriptVar(runtime, 'VAR_MAP_SCENE_PALLET_TOWN_OAK', 1);
    setScriptFlag(runtime, 'FLAG_HIDE_OAK_IN_PALLET_TOWN');
    openDialogueSequence(dialogue, 'LOCALID_PALLET_PROF_OAK', [
      'OAK: Hey! Wait!',
      'Do not go out!',
      'It is unsafe! Wild POKEMON live in tall grass!',
      'You need your own POKEMON for your protection.'
    ]);
  },
  PalletTown_EventScript_SignLadyTrigger: ({ dialogue, runtime }) => {
    setScriptFlag(runtime, 'FLAG_OPENED_START_MENU');
    setScriptVar(runtime, 'VAR_MAP_SCENE_PALLET_TOWN_SIGN_LADY', 1);
    setScriptVar(runtime, 'SIGN_LADY_READY', 0);
    openDialogueSequence(dialogue, 'LOCALID_PALLET_SIGN_LADY', [
      'Look, look!',
      'I copied what it said on one of those TRAINER TIPS signs!',
      'TRAINER TIPS!',
      'Press START to open the MENU!'
    ]);
  },
  EventScript_CutTree: ({ dialogue }) => {
    openScriptDialogue(dialogue, 'field', 'This tree looks like it can be CUT down.');
  },
  ViridianCity_EventScript_CitySign: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'sign', [
      'VIRIDIAN CITY',
      'The Eternally Green Paradise'
    ]);
  },
  ViridianCity_EventScript_TrainerTips1: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'sign', [
      'TRAINER TIPS',
      'Catch POKEMON and expand your collection.',
      'The more you have, the easier it is to battle.'
    ]);
  },
  ViridianCity_EventScript_TrainerTips2: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'sign', [
      'TRAINER TIPS',
      'The battle moves of POKEMON are limited by their POWER POINTS, PP.',
      'To replenish PP, rest your tired POKEMON at a POKEMON CENTER.'
    ]);
  },
  ViridianCity_EventScript_GymSign: ({ dialogue }) => {
    openScriptDialogue(dialogue, 'sign', 'VIRIDIAN CITY POKEMON GYM');
  },
  ViridianCity_EventScript_GymDoor: ({ dialogue }) => {
    openScriptDialogue(dialogue, 'sign', "VIRIDIAN GYM's doors are locked...");
  },
  ViridianCity_EventScript_GymDoorLocked: ({ dialogue }) => {
    openScriptDialogue(dialogue, 'system', "VIRIDIAN GYM's doors are locked...");
  },
  ViridianCity_EventScript_Boy: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'ViridianCity_ObjectEvent_Boy', [
      'Those POKE BALLS at your waist!',
      'You have POKEMON, do you not?',
      'It is great that you can carry and use POKEMON anytime, anywhere.'
    ]);
  },
  ViridianCity_EventScript_OldMan: ({ dialogue, runtime }) => {
    if (getScriptVar(runtime, 'VAR_MAP_SCENE_VIRIDIAN_CITY_GYM_DOOR') === 1) {
      openScriptDialogue(dialogue, 'LOCALID_VIRIDIAN_OLD_MAN', "VIRIDIAN GYM's LEADER returned!");
      return;
    }

    openDialogueSequence(dialogue, 'LOCALID_VIRIDIAN_OLD_MAN', [
      'This POKEMON GYM is always closed.',
      'I wonder who the LEADER is?'
    ]);
  },
  ViridianCity_EventScript_TutorialOldMan: ({ dialogue, runtime }) => {
    runViridianTutorialOldManScript(dialogue, runtime);
  },
  ViridianCity_EventScript_Youngster: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'ViridianCity_ObjectEvent_Youngster', [
      'You want to know about the two kinds of caterpillar POKEMON?',
      'CATERPIE has no poison, but WEEDLE does.',
      "Watch that your POKEMON are not stabbed by WEEDLE's POISON STING."
    ]);
  },
  ViridianCity_EventScript_Woman: ({ dialogue, runtime }) => {
    if (getScriptVar(runtime, 'VAR_MAP_SCENE_VIRIDIAN_CITY_OLD_MAN') === 0) {
      openDialogueSequence(dialogue, 'LOCALID_VIRIDIAN_WOMAN', [
        'Oh, Grandpa! Do not be so mean!',
        'I am so sorry. He has not had his coffee yet.'
      ]);
      return;
    }

    openDialogueSequence(dialogue, 'LOCALID_VIRIDIAN_WOMAN', [
      'I go shopping in PEWTER CITY occasionally.',
      'I have to take the winding trail in VIRIDIAN FOREST when I go.'
    ]);
  },
  ViridianCity_EventScript_DreamEaterTutor: ({ dialogue }) => {
    openScriptDialogue(dialogue, 'ViridianCity_ObjectEvent_DreamEaterTutor', 'A sleepy old man is thinking about a move called DREAM EATER.');
  },
  ViridianCity_EventScript_RoadBlocked: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'system', [
      'I absolutely forbid you from going through here!',
      'This is private property!'
    ]);
  },
  ViridianCity_EventScript_TutorialTriggerLeft: ({ dialogue, runtime }) => {
    runViridianTutorialOldManScript(dialogue, runtime);
  },
  ViridianCity_EventScript_TutorialTriggerRight: ({ dialogue, runtime }) => {
    runViridianTutorialOldManScript(dialogue, runtime);
  },
  ViridianCity_EventScript_ItemPotion: ({ dialogue, runtime }) => {
    runFindItemScript(dialogue, runtime, 'ITEM_POTION', 'FLAG_HIDE_VIRIDIAN_CITY_POTION');
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
