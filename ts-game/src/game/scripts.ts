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
  },
  PewterCity_Gym_EventScript_Brock: ({ dialogue, runtime }) => {
    if (isScriptFlagSet(runtime, 'FLAG_DEFEATED_LEADER_BROCK')) {
      openDialogueSequence(dialogue, 'PewterCity_Gym_ObjectEvent_Brock', [
        'There are all kinds of TRAINERS in this huge world of ours.',
        'You appear to be very gifted as a POKéMON TRAINER.',
        'So let me make a suggestion.',
        'Go to the GYM in CERULEAN and test your abilities.'
      ]);
      return;
    }
    openDialogueSequence(dialogue, 'PewterCity_Gym_ObjectEvent_Brock', [
      "So, you're here. I'm BROCK.",
      "I'm PEWTER's GYM LEADER.",
      'My rock-hard willpower is evident even in my POKéMON.',
      "My POKéMON are all rock hard, and have true-grit determination.",
      "That's right - my POKéMON are all the ROCK type!",
      "Fuhaha! You're going to challenge me knowing that you'll lose?",
      "That's the TRAINER's honor that compels you to challenge me.",
      'Fine, then! Show me your best!',
      '(Brock battle stub — trainer battle pending script engine.)'
    ]);
  },
  PewterCity_Gym_EventScript_Liam: ({ dialogue, runtime }) => {
    if (isScriptFlagSet(runtime, 'FLAG_DEFEATED_CAMPER_LIAM')) {
      openScriptDialogue(
        dialogue,
        'PewterCity_Gym_ObjectEvent_Liam',
        "You're pretty hot. …But not as hot as BROCK!"
      );
      return;
    }
    openDialogueSequence(dialogue, 'PewterCity_Gym_ObjectEvent_Liam', [
      "Stop right there, kid!",
      "You're ten thousand light-years from facing BROCK!",
      '(Liam trainer battle stub — pending battle system.)'
    ]);
  },
  PewterCity_Gym_EventScript_GymGuy: ({ dialogue, runtime }) => {
    const defeated = isScriptFlagSet(runtime, 'FLAG_DEFEATED_LEADER_BROCK');
    if (defeated) {
      openScriptDialogue(
        dialogue,
        'PewterCity_Gym_ObjectEvent_GymGuy',
        'You pulled it off! You beat BROCK! You must be dreaming about this. But keep dreaming, because the next challenge awaits!'
      );
      return;
    }
    openDialogueSequence(dialogue, 'PewterCity_Gym_ObjectEvent_GymGuy', [
      'Yo! Champ in the making!',
      "BROCK uses rock-type POKéMON.",
      'The ROCK type is really durable against physical attacks.',
      "If you can inflict Special damage, you'll have an edge.",
      'Your POKéMON will need the right moves, though.'
    ]);
  },
  PewterCity_Gym_EventScript_GymStatue: ({ dialogue, runtime }) => {
    const defeated = isScriptFlagSet(runtime, 'FLAG_DEFEATED_LEADER_BROCK');
    openScriptDialogue(
      dialogue,
      'sign',
      defeated
        ? 'PEWTER POKéMON GYM\nLEADER: BROCK'
        : 'PEWTER POKéMON GYM\nLEADER: ?'
    );
  },
  PewterCity_House1_EventScript_BaldingMan: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'PewterCity_House1_ObjectEvent_BaldingMan', [
      "Our POKéMON's an outsider, so it's finicky and hard to handle.",
      'An outsider is a POKéMON that you get in a trade.',
      'It grows fast, but it may ignore an unskilled TRAINER in battle.',
      'If only we had some BADGES…'
    ]);
  },
  PewterCity_House1_EventScript_LittleBoy: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'PewterCity_House1_ObjectEvent_LittleBoy',
      'NIDORAN, sit!'
    );
  },
  PewterCity_House1_EventScript_Nidoran: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'LOCALID_PEWTER_HOUSE_NIDORAN',
      'NIDORAN\u2642: Bowbow!'
    );
  },
  PewterCity_House2_EventScript_OldMan: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'PewterCity_House2_ObjectEvent_OldMan', [
      'POKéMON learn new techniques as they grow.',
      'But some moves must be taught to them by people.'
    ]);
  },
  PewterCity_House2_EventScript_LittleBoy: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'PewterCity_House2_ObjectEvent_LittleBoy', [
      'A POKéMON becomes easier to catch if it has a status problem.',
      'Sleep, poison, burn, or paralysis…',
      "Those are all effective. But catching POKéMON is never a sure thing!"
    ]);
  },
  PewterCity_Museum_1F_EventScript_Scientist1: ({ dialogue, runtime }) => {
    const paid = getScriptVar(runtime, 'VAR_MAP_SCENE_PEWTER_CITY_MUSEUM_1F') !== 0;
    if (paid) {
      openScriptDialogue(
        dialogue,
        'LOCALID_MUSEUM_SCIENTIST1',
        'Please enjoy the exhibits!'
      );
      return;
    }
    openDialogueSequence(dialogue, 'LOCALID_MUSEUM_SCIENTIST1', [
      "It's \u00a550 for a child's ticket.",
      'Would you like to come in?',
      '(Museum admission stub — yes/no choice pending script engine.)'
    ]);
  },
  PewterCity_Museum_1F_EventScript_OldMan: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'PewterCity_Museum_1F_ObjectEvent_OldMan', [
      'I should be grateful for my long life.',
      'Never did I think I would get to see the bones of a dragon!'
    ]);
  },
  PewterCity_Museum_1F_EventScript_OldAmberScientist: ({ dialogue, runtime }) => {
    if (isScriptFlagSet(runtime, 'FLAG_HIDE_OLD_AMBER')) {
      openScriptDialogue(
        dialogue,
        'PewterCity_Museum_1F_ObjectEvent_OldAmberScientist',
        'Take good care of that OLD AMBER!'
      );
      return;
    }
    openDialogueSequence(dialogue, 'PewterCity_Museum_1F_ObjectEvent_OldAmberScientist', [
      'Ssh! Listen, I need to share a secret with someone.',
      'I think that this chunk of AMBER contains POKéMON DNA!',
      "I want you to get this examined at a POKéMON LAB somewhere.",
      '(OLD AMBER give item stub — pending script engine.)'
    ]);
  },
  PewterCity_Museum_1F_EventScript_OldAmber: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'system',
      "It's a piece of amber containing ancient POKéMON DNA."
    );
  },
  PewterCity_Museum_1F_EventScript_Scientist2: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'PewterCity_Museum_1F_ObjectEvent_Scientist2', [
      'We have two fossils of rare, prehistoric POKéMON on exhibit.'
    ]);
  },
  PewterCity_Museum_1F_EventScript_SeismicTossTutor: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'PewterCity_Museum_1F_ObjectEvent_SeismicTossTutor', [
      'The secrets of space… The mysteries of earth…',
      '…The only thing you should toss…',
      'Well, how about SEISMIC TOSS?',
      'Should I teach that to a POKéMON?',
      '(Seismic Toss tutor stub — pending move teaching system.)'
    ]);
  },
  PewterCity_Museum_1F_EventScript_AerodactylFossil: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'system',
      'AERODACTYL Fossil\nA primitive and rare POKéMON.'
    );
  },
  PewterCity_Museum_1F_EventScript_KabutopsFossil: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'system',
      'KABUTOPS Fossil\nA primitive and rare POKéMON.'
    );
  },
  PewterCity_Museum_1F_EventScript_PokemonJournalBrock: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'system',
      "It's a POKéMON journal about BROCK. (Content stub pending script engine.)"
    );
  },
  PewterCity_Museum_1F_EventScript_EntranceTriggerLeft: ({ dialogue, runtime }) => {
    if (getScriptVar(runtime, 'VAR_MAP_SCENE_PEWTER_CITY_MUSEUM_1F') !== 0) {
      return;
    }
    openDialogueSequence(dialogue, 'LOCALID_MUSEUM_SCIENTIST1', [
      "Come again, come again! You're always welcome!"
    ]);
  },
  PewterCity_Museum_1F_EventScript_EntranceTriggerMid: ({ dialogue, runtime }) => {
    if (getScriptVar(runtime, 'VAR_MAP_SCENE_PEWTER_CITY_MUSEUM_1F') !== 0) {
      return;
    }
    openDialogueSequence(dialogue, 'LOCALID_MUSEUM_SCIENTIST1', [
      "Come again, come again! You're always welcome!"
    ]);
  },
  PewterCity_Museum_1F_EventScript_EntranceTriggerRight: ({ dialogue, runtime }) => {
    if (getScriptVar(runtime, 'VAR_MAP_SCENE_PEWTER_CITY_MUSEUM_1F') !== 0) {
      return;
    }
    openDialogueSequence(dialogue, 'LOCALID_MUSEUM_SCIENTIST1', [
      "Come again, come again! You're always welcome!"
    ]);
  },
  PewterCity_Museum_2F_EventScript_Scientist: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'PewterCity_Museum_2F_ObjectEvent_Scientist', [
      'This month, we are running a space exhibit.'
    ]);
  },
  PewterCity_Museum_2F_EventScript_Man: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'PewterCity_Museum_2F_ObjectEvent_Man', [
      'July 20, 1969!',
      "Humankind first set foot on the moon that day.",
      'I bought a color TV just so I could watch that news.'
    ]);
  },
  PewterCity_Museum_2F_EventScript_OldMan: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'PewterCity_Museum_2F_ObjectEvent_OldMan', [
      'MOON STONE, huh?',
      "What's so special about it?",
      'Looks like an ordinary rock to me.'
    ]);
  },
  PewterCity_Museum_2F_EventScript_LittleGirl: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'PewterCity_Museum_2F_ObjectEvent_LittleGirl',
      'I want a PIKACHU! It is so cute! I asked my daddy to catch me one!'
    );
  },
  PewterCity_Museum_2F_EventScript_BaldingMan: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'PewterCity_Museum_2F_ObjectEvent_BaldingMan',
      'Yeah, a PIKACHU soon, I promise!'
    );
  },
  PewterCity_Museum_2F_EventScript_MoonStone: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'system',
      "A meteorite that fell on MT. MOON.\nIt is thought to be a MOON STONE."
    );
  },
  PewterCity_Museum_2F_EventScript_SpaceShuttle: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'system',
      'Space Shuttle'
    );
  },
  PewterCity_Mart_EventScript_Clerk: ({ dialogue }) => {
    const pewterStock = getMartStockForMap('MAP_PEWTER_CITY_MART');
    const items = pewterStock ? pewterStock.items : [];
    const stockLine = `Shop UI stub: ${items
      .map((itemId) => getItemDefinition(itemId).name.replace(/\u00e9/gu, 'e').toUpperCase())
      .join(', ')}.`;
    openDialogueSequence(dialogue, 'PewterCity_Mart_ObjectEvent_Clerk', [
      'Hi, there!\nMay I help you?',
      stockLine,
      'Please come again!'
    ]);
  },
  PewterCity_Mart_EventScript_Youngster: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'PewterCity_Mart_ObjectEvent_Youngster',
      'You can buy things here that you cannot find elsewhere.'
    );
  },
  PewterCity_Mart_EventScript_Boy: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'PewterCity_Mart_ObjectEvent_Boy',
      'All POKéMON are different. Even the same type of POKéMON can have different moves.'
    );
  },
  PewterCity_PokemonCenter_1F_EventScript_Jigglypuff: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'PewterCity_PokemonCenter_1F_ObjectEvent_Jigglypuff',
      'JIGGLYPUFF: Puu pupuu!'
    );
  },
  PewterCity_PokemonCenter_1F_EventScript_Gentleman: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'PewterCity_PokemonCenter_1F_ObjectEvent_Gentleman',
      'I heard that there are many trainers with outstanding POKéMON in CERULEAN CITY.'
    );
  },
  PewterCity_PokemonCenter_1F_EventScript_Youngster: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'PewterCity_PokemonCenter_1F_ObjectEvent_Youngster', [
      'POKéMON LEAGUE registration is over at the reception desk.',
      'If you want to enter, go over there.'
    ]);
  },
  PewterCity_PokemonCenter_1F_EventScript_GBAKid1: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'PewterCity_PokemonCenter_1F_ObjectEvent_GBAKid1',
      'You can trade POKéMON with your friends. (Link stub — pending connectivity.)'
    );
  },
  PewterCity_PokemonCenter_1F_EventScript_GBAKid2: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'PewterCity_PokemonCenter_1F_ObjectEvent_GBAKid2',
      'You can battle POKéMON with your friends. (Link stub — pending connectivity.)'
    );
  },
  MysteryEventClub_EventScript_Woman: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'MysteryEventClub_ObjectEvent_Woman',
      'Welcome to the MYSTERY EVENT CLUB! (Mystery event stub — pending connectivity.)'
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
