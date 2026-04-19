import { openDialogueSequence, type DialogueState } from './interaction';
import type { PlayerState } from './player';
import { createBagState, getItemDefinition, type BagState } from './bag';
import {
  createDefaultParty,
  createDefaultPokedex,
  type FieldPokemon,
  type PokedexState
} from './pokemonStorage';
import { getAllCenterScriptHandlers } from './pokemonCenterTemplate';
import { getAllMartScriptHandlers, getMartStockForMap } from './martTemplate';

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
  ViridianCity_Mart_EventScript_Clerk: ({ dialogue, runtime }) => {
    if (getScriptVar(runtime, 'VAR_MAP_SCENE_VIRIDIAN_CITY_MART') === 1) {
      openDialogueSequence(dialogue, 'LOCALID_VIRIDIAN_MART_CLERK', [
        'Okay, thanks! Please say hi to',
        'PROF. OAK for me, too.'
      ]);
      return;
    }

    const viridianStock = getMartStockForMap('MAP_VIRIDIAN_CITY_MART');
    const items = viridianStock ? viridianStock.items : [];
    const stockLine = `Shop UI stub: ${items
      .map((itemId) => getItemDefinition(itemId).name.replace(/\u00e9/gu, 'e').toUpperCase())
      .join(', ')}.`;
    openDialogueSequence(dialogue, 'LOCALID_VIRIDIAN_MART_CLERK', [
      'Hi, there!\nMay I help you?',
      stockLine,
      'Please come again!'
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
  },
  ViridianCity_House_EventScript_BaldingMan: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'ViridianCity_House_ObjectEvent_BaldingMan', [
      'Coming up with nicknames is fun,',
      "but it's not so easy to do.",
      'Clever names are nice, but simple',
      'names are easier to remember.'
    ]);
  },
  ViridianCity_House_EventScript_LittleGirl: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'ViridianCity_House_ObjectEvent_LittleGirl',
      'My daddy loves POKéMON, too.'
    );
  },
  ViridianCity_House_EventScript_Speary: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'ViridianCity_House_ObjectEvent_Speary', [
      'SPEARY: Tetweet!'
    ]);
  },
  ViridianCity_House_EventScript_NicknameSign: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'system',
      'SPEAROW\nName: SPEARY'
    );
  },
  ViridianCity_EventScript_GymDoorLocked: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'system', [
      "VIRIDIAN GYM's doors are locked..."
    ]);
  },
  ViridianCity_EventScript_GymDoor: ({ dialogue, runtime }) => {
    if (getScriptVar(runtime, 'VAR_MAP_SCENE_VIRIDIAN_CITY_GYM_DOOR') === 1) {
      return;
    }
    openScriptDialogue(
      dialogue,
      'system',
      "VIRIDIAN GYM's doors are locked..."
    );
  },
  ViridianCity_EventScript_GymSign: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'sign',
      'VIRIDIAN CITY\nPOKeMON GYM'
    );
  },
  ViridianCity_Gym_EventScript_GymStatue: ({ dialogue, runtime }) => {
    const defeated = isScriptFlagSet(runtime, 'FLAG_BADGE08_GET');
    openScriptDialogue(
      dialogue,
      'sign',
      defeated
        ? 'VIRIDIAN POKeMON GYM\nLEADER: GIOVANNI'
        : 'VIRIDIAN POKeMON GYM\nLEADER: ?'
    );
  },
  ViridianCity_Gym_EventScript_Giovanni: ({ dialogue, runtime }) => {
    if (isScriptFlagSet(runtime, 'FLAG_DEFEATED_LEADER_GIOVANNI')) {
      openDialogueSequence(dialogue, 'LOCALID_VIRIDIAN_GIOVANNI', [
        'Having lost, I cannot face my underlings!',
        'TEAM ROCKET is done forever!',
        'I will dedicate my life to the study of POKeMON!',
        'Let us meet again some day. Farewell!'
      ]);
      return;
    }
    openDialogueSequence(dialogue, 'LOCALID_VIRIDIAN_GIOVANNI', [
      'So, I must say, you have finally arrived.',
      "I am GIOVANNI, the leader of TEAM ROCKET. I am the VIRIDIAN GYM's LEADER.",
      "I've waited a long time for a challenger like you.",
      '(Giovanni battle stub — trainer battle pending script engine.)'
    ]);
  },
  ViridianCity_Gym_EventScript_GymGuy: ({ dialogue, runtime }) => {
    const defeated = isScriptFlagSet(runtime, 'FLAG_DEFEATED_LEADER_GIOVANNI');
    if (defeated) {
      openScriptDialogue(
        dialogue,
        'ViridianCity_Gym_ObjectEvent_GymGuy',
        'Blow me away! GIOVANNI was the GYM LEADER of VIRIDIAN?'
      );
      return;
    }
    openDialogueSequence(dialogue, 'ViridianCity_Gym_ObjectEvent_GymGuy', [
      'Yo! Champ in the making!',
      "Even I don't know the VIRIDIAN LEADER's identity.",
      "But one thing's certain. This will be the toughest of all the GYM LEADERS.",
      'Also, I heard that the TRAINERS here like GROUND-type POKeMON.'
    ]);
  },
  ViridianCity_Gym_EventScript_Takashi: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'ViridianCity_Gym_ObjectEvent_Takashi', [
      '(Takashi trainer battle stub — pending battle system.)'
    ]);
  },
  ViridianCity_Gym_EventScript_Yuji: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'ViridianCity_Gym_ObjectEvent_Yuji', [
      '(Yuji trainer battle stub — pending battle system.)'
    ]);
  },
  ViridianCity_Gym_EventScript_Atsushi: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'ViridianCity_Gym_ObjectEvent_Atsushi', [
      '(Atsushi trainer battle stub — pending battle system.)'
    ]);
  },
  ViridianCity_Gym_EventScript_Jason: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'ViridianCity_Gym_ObjectEvent_Jason', [
      '(Jason trainer battle stub — pending battle system.)'
    ]);
  },
  ViridianCity_Gym_EventScript_Cole: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'ViridianCity_Gym_ObjectEvent_Cole', [
      '(Cole trainer battle stub — pending battle system.)'
    ]);
  },
  ViridianCity_Gym_EventScript_Kiyo: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'ViridianCity_Gym_ObjectEvent_Kiyo', [
      '(Kiyo trainer battle stub — pending battle system.)'
    ]);
  },
  ViridianCity_Gym_EventScript_Samuel: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'ViridianCity_Gym_ObjectEvent_Samuel', [
      '(Samuel trainer battle stub — pending battle system.)'
    ]);
  },
  ViridianCity_Gym_EventScript_Warren: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'ViridianCity_Gym_ObjectEvent_Warren', [
      '(Warren trainer battle stub — pending battle system.)'
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

const VIRIDIAN_GYM_DOOR_VAR = 'VAR_MAP_SCENE_VIRIDIAN_CITY_GYM_DOOR';

const VIRIDIAN_GYM_REQUIRED_BADGES = [
  'FLAG_BADGE02_GET',
  'FLAG_BADGE03_GET',
  'FLAG_BADGE04_GET',
  'FLAG_BADGE05_GET',
  'FLAG_BADGE06_GET',
  'FLAG_BADGE07_GET'
] as const;

export const viridianCityTryUnlockGym = (runtime: ScriptRuntimeState): boolean => {
  if (getScriptVar(runtime, VIRIDIAN_GYM_DOOR_VAR) !== 0) {
    return false;
  }

  const allBadgesSet = VIRIDIAN_GYM_REQUIRED_BADGES.every((flag) =>
    isScriptFlagSet(runtime, flag)
  );
  if (!allBadgesSet) {
    return false;
  }

  setScriptVar(runtime, VIRIDIAN_GYM_DOOR_VAR, 1);
  return true;
};

export const isViridianGymLocked = (runtime: ScriptRuntimeState): boolean =>
  getScriptVar(runtime, VIRIDIAN_GYM_DOOR_VAR) === 0;

export const registerCenterScripts = (): void => {
  const centerScripts = getAllCenterScriptHandlers();
  for (const [key, handler] of Object.entries(centerScripts)) {
    if (!prototypeScriptRegistry[key]) {
      prototypeScriptRegistry[key] = handler;
    }
  }
};

registerCenterScripts();

export const registerMartScripts = (): void => {
  const martScripts = getAllMartScriptHandlers();
  for (const [key, handler] of Object.entries(martScripts)) {
    if (!prototypeScriptRegistry[key]) {
      prototypeScriptRegistry[key] = handler;
    }
  }
};

registerMartScripts();
