import { healParty, type FieldPokemon } from './pokemonStorage';

export interface CenterRuntimeState {
  vars: Record<string, number>;
  party: FieldPokemon[];
}

export interface CenterDialogueState {
  active: boolean;
  speakerId: string | null;
  text: string;
  queue: string[];
  queueIndex: number;
}

const openDialogue = (
  dialogue: CenterDialogueState,
  speakerId: string,
  lines: string[]
): void => {
  if (lines.length === 0) {
    dialogue.active = false;
    dialogue.speakerId = null;
    dialogue.text = '';
    dialogue.queue = [];
    dialogue.queueIndex = 0;
    return;
  }
  dialogue.active = true;
  dialogue.speakerId = speakerId;
  dialogue.queue = [...lines];
  dialogue.queueIndex = 0;
  dialogue.text = dialogue.queue[0];
};

export interface HealLocation {
  id: string;
  map: string;
  x: number;
  y: number;
  respawnMap: string;
  respawnNpc: string;
  respawnX: number;
  respawnY: number;
}

export const HEAL_LOCATIONS: HealLocation[] = [
  {
    id: 'HEAL_LOCATION_PALLET_TOWN',
    map: 'MAP_PALLET_TOWN',
    x: 6,
    y: 8,
    respawnMap: 'MAP_PALLET_TOWN_PLAYERS_HOUSE_1F',
    respawnNpc: 'LOCALID_MOM',
    respawnX: 8,
    respawnY: 5
  },
  {
    id: 'HEAL_LOCATION_VIRIDIAN_CITY',
    map: 'MAP_VIRIDIAN_CITY',
    x: 26,
    y: 27,
    respawnMap: 'MAP_VIRIDIAN_CITY_POKEMON_CENTER_1F',
    respawnNpc: 'LOCALID_VIRIDIAN_NURSE',
    respawnX: 7,
    respawnY: 4
  },
  {
    id: 'HEAL_LOCATION_PEWTER_CITY',
    map: 'MAP_PEWTER_CITY',
    x: 17,
    y: 26,
    respawnMap: 'MAP_PEWTER_CITY_POKEMON_CENTER_1F',
    respawnNpc: 'LOCALID_PEWTER_NURSE',
    respawnX: 7,
    respawnY: 4
  },
  {
    id: 'HEAL_LOCATION_CERULEAN_CITY',
    map: 'MAP_CERULEAN_CITY',
    x: 22,
    y: 20,
    respawnMap: 'MAP_CERULEAN_CITY_POKEMON_CENTER_1F',
    respawnNpc: 'LOCALID_CERULEAN_NURSE',
    respawnX: 7,
    respawnY: 4
  },
  {
    id: 'HEAL_LOCATION_LAVENDER_TOWN',
    map: 'MAP_LAVENDER_TOWN',
    x: 6,
    y: 6,
    respawnMap: 'MAP_LAVENDER_TOWN_POKEMON_CENTER_1F',
    respawnNpc: 'LOCALID_LAVENDER_NURSE',
    respawnX: 7,
    respawnY: 4
  },
  {
    id: 'HEAL_LOCATION_VERMILION_CITY',
    map: 'MAP_VERMILION_CITY',
    x: 15,
    y: 7,
    respawnMap: 'MAP_VERMILION_CITY_POKEMON_CENTER_1F',
    respawnNpc: 'LOCALID_VERMILION_NURSE',
    respawnX: 7,
    respawnY: 4
  },
  {
    id: 'HEAL_LOCATION_CELADON_CITY',
    map: 'MAP_CELADON_CITY',
    x: 48,
    y: 12,
    respawnMap: 'MAP_CELADON_CITY_POKEMON_CENTER_1F',
    respawnNpc: 'LOCALID_CELADON_NURSE',
    respawnX: 7,
    respawnY: 4
  },
  {
    id: 'HEAL_LOCATION_FUCHSIA_CITY',
    map: 'MAP_FUCHSIA_CITY',
    x: 25,
    y: 32,
    respawnMap: 'MAP_FUCHSIA_CITY_POKEMON_CENTER_1F',
    respawnNpc: 'LOCALID_FUCHSIA_NURSE',
    respawnX: 7,
    respawnY: 4
  },
  {
    id: 'HEAL_LOCATION_CINNABAR_ISLAND',
    map: 'MAP_CINNABAR_ISLAND',
    x: 14,
    y: 12,
    respawnMap: 'MAP_CINNABAR_ISLAND_POKEMON_CENTER_1F',
    respawnNpc: 'LOCALID_CINNABAR_NURSE',
    respawnX: 7,
    respawnY: 4
  },
  {
    id: 'HEAL_LOCATION_INDIGO_PLATEAU',
    map: 'MAP_INDIGO_PLATEAU_EXTERIOR',
    x: 11,
    y: 7,
    respawnMap: 'MAP_INDIGO_PLATEAU_POKEMON_CENTER_1F',
    respawnNpc: 'LOCALID_LEAGUE_NURSE',
    respawnX: 13,
    respawnY: 12
  },
  {
    id: 'HEAL_LOCATION_SAFFRON_CITY',
    map: 'MAP_SAFFRON_CITY',
    x: 24,
    y: 39,
    respawnMap: 'MAP_SAFFRON_CITY_POKEMON_CENTER_1F',
    respawnNpc: 'LOCALID_SAFFRON_NURSE',
    respawnX: 7,
    respawnY: 4
  },
  {
    id: 'HEAL_LOCATION_ROUTE4',
    map: 'MAP_ROUTE4',
    x: 12,
    y: 6,
    respawnMap: 'MAP_ROUTE4_POKEMON_CENTER_1F',
    respawnNpc: 'LOCALID_ROUTE4_NURSE',
    respawnX: 7,
    respawnY: 4
  },
  {
    id: 'HEAL_LOCATION_ROUTE10',
    map: 'MAP_ROUTE10',
    x: 13,
    y: 21,
    respawnMap: 'MAP_ROUTE10_POKEMON_CENTER_1F',
    respawnNpc: 'LOCALID_ROUTE10_NURSE',
    respawnX: 7,
    respawnY: 4
  },
  {
    id: 'HEAL_LOCATION_ONE_ISLAND',
    map: 'MAP_ONE_ISLAND',
    x: 14,
    y: 6,
    respawnMap: 'MAP_ONE_ISLAND_POKEMON_CENTER_1F',
    respawnNpc: 'LOCALID_ONE_ISLAND_NURSE',
    respawnX: 5,
    respawnY: 4
  },
  {
    id: 'HEAL_LOCATION_TWO_ISLAND',
    map: 'MAP_TWO_ISLAND',
    x: 21,
    y: 8,
    respawnMap: 'MAP_TWO_ISLAND_POKEMON_CENTER_1F',
    respawnNpc: 'LOCALID_TWO_ISLAND_NURSE',
    respawnX: 7,
    respawnY: 4
  },
  {
    id: 'HEAL_LOCATION_THREE_ISLAND',
    map: 'MAP_THREE_ISLAND',
    x: 14,
    y: 28,
    respawnMap: 'MAP_THREE_ISLAND_POKEMON_CENTER_1F',
    respawnNpc: 'LOCALID_THREE_ISLAND_NURSE',
    respawnX: 7,
    respawnY: 4
  },
  {
    id: 'HEAL_LOCATION_FOUR_ISLAND',
    map: 'MAP_FOUR_ISLAND',
    x: 18,
    y: 21,
    respawnMap: 'MAP_FOUR_ISLAND_POKEMON_CENTER_1F',
    respawnNpc: 'LOCALID_FOUR_ISLAND_NURSE',
    respawnX: 7,
    respawnY: 4
  },
  {
    id: 'HEAL_LOCATION_FIVE_ISLAND',
    map: 'MAP_FIVE_ISLAND',
    x: 18,
    y: 7,
    respawnMap: 'MAP_FIVE_ISLAND_POKEMON_CENTER_1F',
    respawnNpc: 'LOCALID_FIVE_ISLAND_NURSE',
    respawnX: 7,
    respawnY: 4
  },
  {
    id: 'HEAL_LOCATION_SIX_ISLAND',
    map: 'MAP_SIX_ISLAND',
    x: 11,
    y: 12,
    respawnMap: 'MAP_SIX_ISLAND_POKEMON_CENTER_1F',
    respawnNpc: 'LOCALID_SIX_ISLAND_NURSE',
    respawnX: 7,
    respawnY: 4
  },
  {
    id: 'HEAL_LOCATION_SEVEN_ISLAND',
    map: 'MAP_SEVEN_ISLAND',
    x: 12,
    y: 4,
    respawnMap: 'MAP_SEVEN_ISLAND_POKEMON_CENTER_1F',
    respawnNpc: 'LOCALID_SEVEN_ISLAND_NURSE',
    respawnX: 7,
    respawnY: 4
  }
];

const RESPAWN_VAR = 'lastHealLocationId';

export const getHealLocationById = (id: string): HealLocation | undefined =>
  HEAL_LOCATIONS.find((loc) => loc.id === id);

export const getHealLocationForMap = (centerMapId: string): HealLocation | undefined =>
  HEAL_LOCATIONS.find((loc) => loc.respawnMap === centerMapId);

export const setRespawn = (runtime: CenterRuntimeState, healLocationId: string): void => {
  const loc = getHealLocationById(healLocationId);
  if (loc) {
    runtime.vars[RESPAWN_VAR] = HEAL_LOCATIONS.indexOf(loc);
  }
};

export const getRespawnLocation = (runtime: CenterRuntimeState): HealLocation | undefined => {
  const idx = runtime.vars[RESPAWN_VAR];
  if (typeof idx === 'number' && idx >= 0 && idx < HEAL_LOCATIONS.length) {
    return HEAL_LOCATIONS[idx];
  }
  return HEAL_LOCATIONS[0];
};

export const NURSE_DIALOGUE = {
  welcome:
    'Welcome to our POKeMON CENTER!\nWould you like me to heal your POKeMON back to perfect health?',
  takePkmn: "Okay, I'll take your POKeMON for a few seconds.",
  restored: "Thank you for waiting.\nWe've restored your POKeMON to full health.",
  goodbye: 'We hope to see you again!'
} as const;

export const NURSE_HEAL_DIALOGUE_QUEUE: string[] = [
  NURSE_DIALOGUE.welcome,
  NURSE_DIALOGUE.takePkmn,
  NURSE_DIALOGUE.restored,
  NURSE_DIALOGUE.goodbye
];

export type NurseHandlerContext = {
  player: unknown;
  dialogue: CenterDialogueState;
  runtime: CenterRuntimeState;
};

export const createNurseScriptHandler = (
  nurseLocalId: string,
  healLocationId: string
): ((context: NurseHandlerContext) => void) => {
  return ({ dialogue, runtime }: NurseHandlerContext): void => {
    healParty(runtime.party);
    setRespawn(runtime, healLocationId);
    openDialogue(dialogue, nurseLocalId, NURSE_HEAL_DIALOGUE_QUEUE);
  };
};

const CENTER_MAP_TO_HEAL_LOCATION: Record<string, string> = {};
for (const loc of HEAL_LOCATIONS) {
  CENTER_MAP_TO_HEAL_LOCATION[loc.respawnMap] = loc.id;
}

export const getHealLocationIdForCenterMap = (centerMapId: string): string | undefined =>
  CENTER_MAP_TO_HEAL_LOCATION[centerMapId];

export interface CenterNpcDialogue {
  scriptId: string;
  speakerId: string;
  lines: string[];
}

export const CENTER_NPC_DIALOGUES: CenterNpcDialogue[] = [
  {
    scriptId: 'ViridianCity_PokemonCenter_1F_EventScript_Boy',
    speakerId: 'ViridianCity_PokemonCenter_1F_ObjectEvent_Boy',
    lines: [
      "There's a POKeMON CENTER in every town ahead.",
      "They charge no money, so don't be shy about healing POKeMON."
    ]
  },
  {
    scriptId: 'ViridianCity_PokemonCenter_1F_EventScript_Gentleman',
    speakerId: 'ViridianCity_PokemonCenter_1F_ObjectEvent_Gentleman',
    lines: [
      'Please feel free to use that PC in the corner.',
      "The receptionist told me so. It's so kind of her!"
    ]
  },
  {
    scriptId: 'ViridianCity_PokemonCenter_1F_EventScript_Youngster',
    speakerId: 'ViridianCity_PokemonCenter_1F_ObjectEvent_Youngster',
    lines: [
      'POKeMON CENTERS heal your tired, hurt, or fainted POKeMON.',
      'They make all POKeMON completely healthy.'
    ]
  },
  {
    scriptId: 'PewterCity_PokemonCenter_1F_EventScript_Gentleman',
    speakerId: 'PewterCity_PokemonCenter_1F_ObjectEvent_Gentleman',
    lines: [
      'What!?',
      'TEAM ROCKET is at MT. MOON?',
      'Huh?',
      "I'm on the phone!",
      'Scram!'
    ]
  },
  {
    scriptId: 'PewterCity_PokemonCenter_1F_EventScript_Jigglypuff',
    speakerId: 'PewterCity_PokemonCenter_1F_ObjectEvent_Jigglypuff',
    lines: ['JIGGLYPUFF: Puu pupuu!']
  },
  {
    scriptId: 'PewterCity_PokemonCenter_1F_EventScript_Youngster',
    speakerId: 'PewterCity_PokemonCenter_1F_ObjectEvent_Youngster',
    lines: [
      'Yawn!',
      'When JIGGLYPUFF sings, POKeMON get drowsy…',
      '…Me, too…',
      'Snore…'
    ]
  },
  {
    scriptId: 'PewterCity_PokemonCenter_1F_EventScript_GBAKid1',
    speakerId: 'PewterCity_PokemonCenter_1F_ObjectEvent_GBAKid1',
    lines: [
      "I really want a PIKACHU, so I'm trading my CLEFAIRY for one."
    ]
  },
  {
    scriptId: 'PewterCity_PokemonCenter_1F_EventScript_GBAKid2',
    speakerId: 'PewterCity_PokemonCenter_1F_ObjectEvent_GBAKid2',
    lines: [
      "I'm trading POKeMON with that kid there.",
      'I had two PIKACHU, so I figured I might as well trade one.'
    ]
  },
  {
    scriptId: 'CeruleanCity_PokemonCenter_1F_EventScript_Gentleman',
    speakerId: 'CeruleanCity_PokemonCenter_1F_ObjectEvent_Gentleman',
    lines: [
      'Have you heard about BILL?',
      'Everyone calls him a POKeMANIAC!',
      'I think people are just jealous of BILL, though.',
      "Who wouldn't want to boast about their POKeMON?"
    ]
  },
  {
    scriptId: 'CeruleanCity_PokemonCenter_1F_EventScript_Rocker',
    speakerId: 'CeruleanCity_PokemonCenter_1F_ObjectEvent_Rocker',
    lines: [
      'That BILL!',
      "I heard that he'll do whatever it takes to get rare POKeMON.",
      "He's not above doing all sorts of things, I've heard."
    ]
  },
  {
    scriptId: 'CeruleanCity_PokemonCenter_1F_EventScript_Youngster',
    speakerId: 'CeruleanCity_PokemonCenter_1F_ObjectEvent_Youngster',
    lines: [
      'BILL has lots of POKeMON!',
      'He collects rare ones, too!'
    ]
  },
  {
    scriptId: 'CeruleanCity_PokemonCenter_1F_EventScript_Lass',
    speakerId: 'CeruleanCity_PokemonCenter_1F_ObjectEvent_Lass',
    lines: [
      "Why don't you go upstairs and try trading POKeMON with your friends?",
      'You could get a lot more variety by trading.',
      'The POKeMON you get in trades grow quickly, too.'
    ]
  },
  {
    scriptId: 'LavenderTown_PokemonCenter_1F_EventScript_Gentleman',
    speakerId: 'LavenderTown_PokemonCenter_1F_ObjectEvent_Gentleman',
    lines: [
      'TEAM ROCKET will do anything for the sake of money!',
      'There is no job too dirty, no deed too heinous, no crime too wicked!'
    ]
  },
  {
    scriptId: 'LavenderTown_PokemonCenter_1F_EventScript_Lass',
    speakerId: 'LavenderTown_PokemonCenter_1F_ObjectEvent_Lass',
    lines: [
      "I saw CUBONE's mother trying to escape from TEAM ROCKET.",
      'She was killed trying to get away…'
    ]
  },
  {
    scriptId: 'LavenderTown_PokemonCenter_1F_EventScript_Youngster',
    speakerId: 'LavenderTown_PokemonCenter_1F_ObjectEvent_Youngster',
    lines: [
      "You know how the CUBONE species wears skulls, right?",
      'People will pay a lot for one.'
    ]
  },
  {
    scriptId: 'VermilionCity_PokemonCenter_1F_EventScript_Man',
    speakerId: 'VermilionCity_PokemonCenter_1F_ObjectEvent_Man',
    lines: [
      'My POKeMON was poisoned!',
      'It fainted while we were walking!'
    ]
  },
  {
    scriptId: 'VermilionCity_PokemonCenter_1F_EventScript_Hiker',
    speakerId: 'VermilionCity_PokemonCenter_1F_ObjectEvent_Hiker',
    lines: [
      'Even if they are the same level, POKeMON can have very different stats and abilities.',
      'A POKeMON raised by a TRAINER is stronger than one in the wild.'
    ]
  },
  {
    scriptId: 'VermilionCity_PokemonCenter_1F_EventScript_Youngster',
    speakerId: 'VermilionCity_PokemonCenter_1F_ObjectEvent_Youngster',
    lines: [
      'It is true that a higher-level POKeMON will be more powerful…',
      'But, all POKeMON will have weak points against specific types.',
      'So, there appears to be no universally strong POKeMON.'
    ]
  },
  {
    scriptId: 'CeladonCity_PokemonCenter_1F_EventScript_Gentleman',
    speakerId: 'CeladonCity_PokemonCenter_1F_ObjectEvent_Gentleman',
    lines: [
      'A POKe FLUTE awakens sleeping POKeMON. You know that.',
      'It does so with a sound that only they can hear.'
    ]
  },
  {
    scriptId: 'CeladonCity_PokemonCenter_1F_EventScript_CooltrainerF',
    speakerId: 'CeladonCity_PokemonCenter_1F_ObjectEvent_CooltrainerF',
    lines: [
      'I rode here from FUCHSIA.',
      "It's an uphill ride on CYCLING ROAD, so I'm exhausted."
    ]
  },
  {
    scriptId: 'CeladonCity_PokemonCenter_1F_EventScript_Youngster',
    speakerId: 'CeladonCity_PokemonCenter_1F_ObjectEvent_Youngster',
    lines: [
      'If I had a BIKE, I would go to CYCLING ROAD!'
    ]
  },
  {
    scriptId: 'FuchsiaCity_PokemonCenter_1F_EventScript_Man',
    speakerId: 'FuchsiaCity_PokemonCenter_1F_ObjectEvent_Man',
    lines: [
      "You can't become a good TRAINER with just one strong POKeMON.",
      'But raising many POKeMON evenly is no easy task, either.'
    ]
  },
  {
    scriptId: 'FuchsiaCity_PokemonCenter_1F_EventScript_CooltrainerF',
    speakerId: 'FuchsiaCity_PokemonCenter_1F_ObjectEvent_CooltrainerF',
    lines: [
      "There's a narrow trail west of VIRIDIAN CITY.",
      'It goes to the POKeMON LEAGUE HQ.',
      'The HQ governs all TRAINERS.'
    ]
  },
  {
    scriptId: 'FuchsiaCity_PokemonCenter_1F_EventScript_Youngster',
    speakerId: 'FuchsiaCity_PokemonCenter_1F_ObjectEvent_Youngster',
    lines: [
      "If you're working on a POKeDEX, visit the SAFARI ZONE.",
      'All sorts of rare POKeMON breed there.'
    ]
  },
  {
    scriptId: 'CinnabarIsland_PokemonCenter_1F_EventScript_Gentleman',
    speakerId: 'CinnabarIsland_PokemonCenter_1F_ObjectEvent_Gentleman',
    lines: [
      'Do you have lots of friends?',
      'Linking up with the usual friends is fun, of course.',
      'But how about visiting the UNION ROOM every so often?',
      'Who knows, you may end up making new friends.',
      'I think it would be worth your time to check the UNION ROOM.'
    ]
  },
  {
    scriptId: 'CinnabarIsland_PokemonCenter_1F_EventScript_CooltrainerF',
    speakerId: 'CinnabarIsland_PokemonCenter_1F_ObjectEvent_CooltrainerF',
    lines: [
      'I came to visit the CINNABAR GYM, but the door is locked tight.',
      'There should be a key for it somewhere.',
      'Could it be in that burned-out mansion?',
      "The GYM LEADER's friend used to live there, they say."
    ]
  },
  {
    scriptId: 'CinnabarIsland_PokemonCenter_1F_EventScript_Youngster',
    speakerId: 'CinnabarIsland_PokemonCenter_1F_ObjectEvent_Youngster',
    lines: [
      'POKeMON can still learn techniques after canceling evolution.',
      'Evolution can wait until new moves have been learned.'
    ]
  },
  {
    scriptId: 'SaffronCity_PokemonCenter_1F_EventScript_Gentleman',
    speakerId: 'SaffronCity_PokemonCenter_1F_ObjectEvent_Gentleman',
    lines: [
      'SILPH CO. is widely known to all.',
      "It's a victim of its own fame - it attracted TEAM ROCKET."
    ]
  },
  {
    scriptId: 'SaffronCity_PokemonCenter_1F_EventScript_Woman',
    speakerId: 'SaffronCity_PokemonCenter_1F_ObjectEvent_Woman',
    lines: [
      'POKeMON growth rates differ from species to species.'
    ]
  },
  {
    scriptId: 'SaffronCity_PokemonCenter_1F_EventScript_Youngster',
    speakerId: 'SaffronCity_PokemonCenter_1F_ObjectEvent_Youngster',
    lines: [
      'Sigh…',
      "Wouldn't this be great?",
      'If the ELITE FOUR came and stomped TEAM ROCKET?'
    ]
  },
  {
    scriptId: 'Route4_PokemonCenter_1F_EventScript_Boy',
    speakerId: 'Route4_PokemonCenter_1F_ObjectEvent_Boy',
    lines: [
      'Okay, set six POKe BALLS in my belt…',
      "Yeah, that'll do it. At most, you can have six POKeMON with you."
    ]
  },
  {
    scriptId: 'Route4_PokemonCenter_1F_EventScript_Gentleman',
    speakerId: 'Route4_PokemonCenter_1F_ObjectEvent_Gentleman',
    lines: [
      'TEAM ROCKET attacks CERULEAN citizens…',
      'Not a day goes by without TEAM ROCKET being in the news.'
    ]
  },
  {
    scriptId: 'Route4_PokemonCenter_1F_EventScript_Youngster',
    speakerId: 'Route4_PokemonCenter_1F_ObjectEvent_Youngster',
    lines: [
      "Sometimes, you'll have too many POKeMON with you to add any more.",
      'In that case, you should just store some using any PC.'
    ]
  },
  {
    scriptId: 'Route4_PokemonCenter_1F_EventScript_Newspaper',
    speakerId: 'Route4_PokemonCenter_1F_ObjectEvent_Newspaper',
    lines: ["It's a newspaper."]
  },
  {
    scriptId: 'Route4_PokemonCenter_1F_EventScript_MagikarpSalesman',
    speakerId: 'Route4_PokemonCenter_1F_ObjectEvent_MagikarpSalesman',
    lines: [
      "MAN: Hello there, laddie!",
      "Have I got a deal just for you!",
      "I'll let you have a secret POKeMON - a MAGIKARP - for just ¥500!",
      "So, you'll buy it, am I right?",
      '(Magikarp purchase stub — pending money/party/item system.)'
    ]
  },
  {
    scriptId: 'Route10_PokemonCenter_1F_EventScript_FatMan',
    speakerId: 'Route10_PokemonCenter_1F_ObjectEvent_FatMan',
    lines: [
      'A NUGGET is totally useless.',
      'So I sold it for ¥5000.'
    ]
  },
  {
    scriptId: 'Route10_PokemonCenter_1F_EventScript_Gentleman',
    speakerId: 'Route10_PokemonCenter_1F_ObjectEvent_Gentleman',
    lines: [
      'The types of POKeMON match up differently with each other.',
      'Every type is stronger than some types and weaker than others.'
    ]
  },
  {
    scriptId: 'Route10_PokemonCenter_1F_EventScript_Youngster',
    speakerId: 'Route10_PokemonCenter_1F_ObjectEvent_Youngster',
    lines: [
      'I heard that ghosts haunt LAVENDER TOWN.'
    ]
  },
  {
    scriptId: 'Route10_PokemonCenter_1F_EventScript_Aide',
    speakerId: 'Route10_PokemonCenter_1F_ObjectEvent_Aide',
    lines: [
      "Oh… {PLAYER}!",
      "I've been looking for you!",
      "It's me, one of the ever-present AIDES to PROF. OAK.",
      "If your POKeDEX has complete data on twenty species, I'm supposed to give you a reward from PROF. OAK.",
      'He entrusted me with this EVERSTONE.',
      "So, {PLAYER}, let me ask you.",
      'Have you gathered data on at least twenty kinds of POKeMON?',
      "(Oak's Aide EVERSTONE reward stub — pending Dex count/item system.)"
    ]
  },
  {
    scriptId: 'IndigoPlateau_PokemonCenter_1F_EventScript_DoorGuard',
    speakerId: 'LOCALID_LEAGUE_DOOR_GUARD',
    lines: [
      'From here on, you face the ELITE FOUR one by one.',
      'If you win, a door opens to the next TRAINER. Good luck!'
    ]
  },
  {
    scriptId: 'IndigoPlateau_PokemonCenter_1F_EventScript_GymGuy',
    speakerId: 'IndigoPlateau_PokemonCenter_1F_ObjectEvent_GymGuy',
    lines: [
      'Yo!',
      'Champ in the making!',
      'At the POKeMON LEAGUE, you will face the ELITE FOUR all in a row.',
      'If you lose, you have to start all over again!',
      'This is it!',
      'Go for it!'
    ]
  },
  {
    scriptId: 'IndigoPlateau_PokemonCenter_1F_EventScript_BlackBelt',
    speakerId: 'IndigoPlateau_PokemonCenter_1F_ObjectEvent_BlackBelt',
    lines: [
      "AGATHA's GHOST-type POKeMON are horrifically terrifying in toughness.",
      'I took my FIGHTING-type POKeMON and raised them to the max.',
      'I went at AGATHA feeling pretty confident, but she whupped us.',
      "That old lady's also got a really short fuse, too.",
      "It doesn't take anything to get that scary lady hollering."
    ]
  },
  {
    scriptId: 'IndigoPlateau_PokemonCenter_1F_EventScript_CooltrainerM',
    speakerId: 'IndigoPlateau_PokemonCenter_1F_ObjectEvent_CooltrainerM',
    lines: [
      'Maybe becoming an ELITE FOUR member is in the blood.',
      "From what I've heard, LANCE has a cousin who's a GYM LEADER somewhere far away."
    ]
  },
  {
    scriptId: 'IndigoPlateau_PokemonCenter_1F_EventScript_PokemonJournal',
    speakerId: 'system',
    lines: ["It's a POKeMON journal. (Content stub pending script engine.)"]
  }
];

export const buildCenterNpcScriptEntries = (): Record<
  string,
  (context: { dialogue: CenterDialogueState }) => void
> => {
  const entries: Record<string, (context: { dialogue: CenterDialogueState }) => void> = {};
  for (const npc of CENTER_NPC_DIALOGUES) {
    entries[npc.scriptId] = ({ dialogue }) => {
      openDialogue(dialogue, npc.speakerId, npc.lines);
    };
  }
  return entries;
};

const NURSE_SCRIPT_MAP: ReadonlyArray<{
  scriptId: string;
  nurseLocalId: string;
  healLocationId: string;
}> = [
  {
    scriptId: 'ViridianCity_PokemonCenter_1F_EventScript_Nurse',
    nurseLocalId: 'LOCALID_VIRIDIAN_NURSE',
    healLocationId: 'HEAL_LOCATION_VIRIDIAN_CITY'
  },
  {
    scriptId: 'PewterCity_PokemonCenter_1F_EventScript_Nurse',
    nurseLocalId: 'LOCALID_PEWTER_NURSE',
    healLocationId: 'HEAL_LOCATION_PEWTER_CITY'
  },
  {
    scriptId: 'CeruleanCity_PokemonCenter_1F_EventScript_Nurse',
    nurseLocalId: 'LOCALID_CERULEAN_NURSE',
    healLocationId: 'HEAL_LOCATION_CERULEAN_CITY'
  },
  {
    scriptId: 'LavenderTown_PokemonCenter_1F_EventScript_Nurse',
    nurseLocalId: 'LOCALID_LAVENDER_NURSE',
    healLocationId: 'HEAL_LOCATION_LAVENDER_TOWN'
  },
  {
    scriptId: 'VermilionCity_PokemonCenter_1F_EventScript_Nurse',
    nurseLocalId: 'LOCALID_VERMILION_NURSE',
    healLocationId: 'HEAL_LOCATION_VERMILION_CITY'
  },
  {
    scriptId: 'CeladonCity_PokemonCenter_1F_EventScript_Nurse',
    nurseLocalId: 'LOCALID_CELADON_NURSE',
    healLocationId: 'HEAL_LOCATION_CELADON_CITY'
  },
  {
    scriptId: 'FuchsiaCity_PokemonCenter_1F_EventScript_Nurse',
    nurseLocalId: 'LOCALID_FUCHSIA_NURSE',
    healLocationId: 'HEAL_LOCATION_FUCHSIA_CITY'
  },
  {
    scriptId: 'CinnabarIsland_PokemonCenter_1F_EventScript_Nurse',
    nurseLocalId: 'LOCALID_CINNABAR_NURSE',
    healLocationId: 'HEAL_LOCATION_CINNABAR_ISLAND'
  },
  {
    scriptId: 'IndigoPlateau_PokemonCenter_1F_EventScript_Nurse',
    nurseLocalId: 'LOCALID_LEAGUE_NURSE',
    healLocationId: 'HEAL_LOCATION_INDIGO_PLATEAU'
  },
  {
    scriptId: 'SaffronCity_PokemonCenter_1F_EventScript_Nurse',
    nurseLocalId: 'LOCALID_SAFFRON_NURSE',
    healLocationId: 'HEAL_LOCATION_SAFFRON_CITY'
  },
  {
    scriptId: 'Route4_PokemonCenter_1F_EventScript_Nurse',
    nurseLocalId: 'LOCALID_ROUTE4_NURSE',
    healLocationId: 'HEAL_LOCATION_ROUTE4'
  },
  {
    scriptId: 'Route10_PokemonCenter_1F_EventScript_Nurse',
    nurseLocalId: 'LOCALID_ROUTE10_NURSE',
    healLocationId: 'HEAL_LOCATION_ROUTE10'
  },
  {
    scriptId: 'OneIsland_PokemonCenter_1F_EventScript_Nurse',
    nurseLocalId: 'LOCALID_ONE_ISLAND_NURSE',
    healLocationId: 'HEAL_LOCATION_ONE_ISLAND'
  },
  {
    scriptId: 'TwoIsland_PokemonCenter_1F_EventScript_Nurse',
    nurseLocalId: 'LOCALID_TWO_ISLAND_NURSE',
    healLocationId: 'HEAL_LOCATION_TWO_ISLAND'
  },
  {
    scriptId: 'ThreeIsland_PokemonCenter_1F_EventScript_Nurse',
    nurseLocalId: 'LOCALID_THREE_ISLAND_NURSE',
    healLocationId: 'HEAL_LOCATION_THREE_ISLAND'
  },
  {
    scriptId: 'FourIsland_PokemonCenter_1F_EventScript_Nurse',
    nurseLocalId: 'LOCALID_FOUR_ISLAND_NURSE',
    healLocationId: 'HEAL_LOCATION_FOUR_ISLAND'
  },
  {
    scriptId: 'FiveIsland_PokemonCenter_1F_EventScript_Nurse',
    nurseLocalId: 'LOCALID_FIVE_ISLAND_NURSE',
    healLocationId: 'HEAL_LOCATION_FIVE_ISLAND'
  },
  {
    scriptId: 'SixIsland_PokemonCenter_1F_EventScript_Nurse',
    nurseLocalId: 'LOCALID_SIX_ISLAND_NURSE',
    healLocationId: 'HEAL_LOCATION_SIX_ISLAND'
  },
  {
    scriptId: 'SevenIsland_PokemonCenter_1F_EventScript_Nurse',
    nurseLocalId: 'LOCALID_SEVEN_ISLAND_NURSE',
    healLocationId: 'HEAL_LOCATION_SEVEN_ISLAND'
  }
];

export const buildNurseScriptEntries = (): Record<
  string,
  (context: NurseHandlerContext) => void
> => {
  const entries: Record<string, (context: NurseHandlerContext) => void> = {};
  for (const entry of NURSE_SCRIPT_MAP) {
    entries[entry.scriptId] = createNurseScriptHandler(
      entry.nurseLocalId,
      entry.healLocationId
    );
  }
  return entries;
};

export const getAllCenterScriptHandlers = (): Record<
  string,
  (context: NurseHandlerContext) => void
> => ({
  ...buildNurseScriptEntries(),
  ...buildCenterNpcScriptEntries()
});
