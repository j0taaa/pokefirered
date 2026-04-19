import { getItemDefinition } from './bag';
import type { ScriptRuntimeState } from './scripts';

export interface MartDialogueState {
  active: boolean;
  speakerId: string | null;
  text: string;
  queue: string[];
  queueIndex: number;
}

const openDialogueSequence = (
  dialogue: MartDialogueState,
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

export interface MartStock {
  mapId: string;
  scriptId: string;
  clerkLocalId: string;
  items: string[];
}

export interface TwoIslandMartTier {
  varValue: number;
  items: string[];
  introText: string;
  introFlag: string;
}

export const TWO_ISLAND_TIERS: TwoIslandMartTier[] = [
  {
    varValue: 1,
    items: ['ITEM_GREAT_BALL', 'ITEM_FRESH_WATER'],
    introText:
      "Oh!\nHello, welcome to my shop!\nWe've only opened up recently.\nOur merchandise is limited, but I\nhope we can serve your needs.",
    introFlag: 'FLAG_TWO_ISLAND_SHOP_INTRODUCED'
  },
  {
    varValue: 2,
    items: [
      'ITEM_ULTRA_BALL',
      'ITEM_GREAT_BALL',
      'ITEM_SODA_POP',
      'ITEM_FRESH_WATER'
    ],
    introText:
      "I can't tell you how grateful I am\nfor your rescue of LOSTELLE.\nThanks to your feat, the people of\nTHREE ISLAND have changed their\nattitudes about KANTO people.\nAnd, I'm from KANTO, you see.\nThe people of THREE ISLAND\nhelped me add to my merchandise.",
    introFlag: 'FLAG_TWO_ISLAND_SHOP_EXPANDED_1'
  },
  {
    varValue: 3,
    items: [
      'ITEM_ULTRA_BALL',
      'ITEM_GREAT_BALL',
      'ITEM_LEMONADE',
      'ITEM_SODA_POP',
      'ITEM_FRESH_WATER',
      'ITEM_MOOMOO_MILK'
    ],
    introText:
      "Hi! I'm giving it my best here.\nI hope you do too, {PLAYER}.",
    introFlag: 'FLAG_TWO_ISLAND_SHOP_EXPANDED_2'
  },
  {
    varValue: 4,
    items: [
      'ITEM_ULTRA_BALL',
      'ITEM_REPEAT_BALL',
      'ITEM_TIMER_BALL',
      'ITEM_LEMONADE',
      'ITEM_SODA_POP',
      'ITEM_FRESH_WATER',
      'ITEM_MOOMOO_MILK',
      'ITEM_LAVA_COOKIE'
    ],
    introText:
      "Oh, hello, {PLAYER}!\nWelcome!\nI've started bringing in items from\ndistant lands.\nI've got some rare items in, too.\nPlease have a look!",
    introFlag: 'FLAG_TWO_ISLAND_SHOP_EXPANDED_3'
  }
];

export const MART_STOCKS: MartStock[] = [
  {
    mapId: 'MAP_VIRIDIAN_CITY_MART',
    scriptId: 'ViridianCity_Mart_EventScript_Clerk',
    clerkLocalId: 'LOCALID_VIRIDIAN_MART_CLERK',
    items: [
      'ITEM_POKE_BALL',
      'ITEM_POTION',
      'ITEM_ANTIDOTE',
      'ITEM_PARALYZE_HEAL'
    ]
  },
  {
    mapId: 'MAP_PEWTER_CITY_MART',
    scriptId: 'PewterCity_Mart_EventScript_Clerk',
    clerkLocalId: 'PewterCity_Mart_ObjectEvent_Clerk',
    items: [
      'ITEM_POKE_BALL',
      'ITEM_POTION',
      'ITEM_ANTIDOTE',
      'ITEM_PARALYZE_HEAL',
      'ITEM_AWAKENING',
      'ITEM_BURN_HEAL',
      'ITEM_ESCAPE_ROPE',
      'ITEM_REPEL'
    ]
  },
  {
    mapId: 'MAP_CERULEAN_CITY_MART',
    scriptId: 'CeruleanCity_Mart_EventScript_Clerk',
    clerkLocalId: 'CeruleanCity_Mart_ObjectEvent_Clerk',
    items: [
      'ITEM_POKE_BALL',
      'ITEM_SUPER_POTION',
      'ITEM_POTION',
      'ITEM_ANTIDOTE',
      'ITEM_PARALYZE_HEAL',
      'ITEM_AWAKENING',
      'ITEM_BURN_HEAL',
      'ITEM_ESCAPE_ROPE',
      'ITEM_REPEL'
    ]
  },
  {
    mapId: 'MAP_VERMILION_CITY_MART',
    scriptId: 'VermilionCity_Mart_EventScript_Clerk',
    clerkLocalId: 'VermilionCity_Mart_ObjectEvent_Clerk',
    items: [
      'ITEM_POKE_BALL',
      'ITEM_SUPER_POTION',
      'ITEM_ANTIDOTE',
      'ITEM_PARALYZE_HEAL',
      'ITEM_AWAKENING',
      'ITEM_ICE_HEAL',
      'ITEM_REPEL'
    ]
  },
  {
    mapId: 'MAP_LAVENDER_TOWN_MART',
    scriptId: 'LavenderTown_Mart_EventScript_Clerk',
    clerkLocalId: 'LavenderTown_Mart_ObjectEvent_Clerk',
    items: [
      'ITEM_GREAT_BALL',
      'ITEM_SUPER_POTION',
      'ITEM_REVIVE',
      'ITEM_ANTIDOTE',
      'ITEM_PARALYZE_HEAL',
      'ITEM_BURN_HEAL',
      'ITEM_ICE_HEAL',
      'ITEM_ESCAPE_ROPE',
      'ITEM_SUPER_REPEL'
    ]
  },
  {
    mapId: 'MAP_SAFFRON_CITY_MART',
    scriptId: 'SaffronCity_Mart_EventScript_Clerk',
    clerkLocalId: 'SaffronCity_Mart_ObjectEvent_Clerk',
    items: [
      'ITEM_GREAT_BALL',
      'ITEM_HYPER_POTION',
      'ITEM_REVIVE',
      'ITEM_FULL_HEAL',
      'ITEM_ESCAPE_ROPE',
      'ITEM_MAX_REPEL'
    ]
  },
  {
    mapId: 'MAP_FUCHSIA_CITY_MART',
    scriptId: 'FuchsiaCity_Mart_EventScript_Clerk',
    clerkLocalId: 'FuchsiaCity_Mart_ObjectEvent_Clerk',
    items: [
      'ITEM_ULTRA_BALL',
      'ITEM_GREAT_BALL',
      'ITEM_SUPER_POTION',
      'ITEM_REVIVE',
      'ITEM_FULL_HEAL',
      'ITEM_MAX_REPEL'
    ]
  },
  {
    mapId: 'MAP_CINNABAR_ISLAND_MART',
    scriptId: 'CinnabarIsland_Mart_EventScript_Clerk',
    clerkLocalId: 'CinnabarIsland_Mart_ObjectEvent_Clerk',
    items: [
      'ITEM_ULTRA_BALL',
      'ITEM_GREAT_BALL',
      'ITEM_HYPER_POTION',
      'ITEM_REVIVE',
      'ITEM_FULL_HEAL',
      'ITEM_ESCAPE_ROPE',
      'ITEM_MAX_REPEL'
    ]
  },
  {
    mapId: 'MAP_INDIGO_PLATEAU_POKEMON_CENTER_1F',
    scriptId: 'IndigoPlateau_PokemonCenter_1F_EventScript_Clerk',
    clerkLocalId: 'IndigoPlateau_PokemonCenter_1F_ObjectEvent_Clerk',
    items: [
      'ITEM_ULTRA_BALL',
      'ITEM_GREAT_BALL',
      'ITEM_FULL_RESTORE',
      'ITEM_MAX_POTION',
      'ITEM_REVIVE',
      'ITEM_FULL_HEAL',
      'ITEM_MAX_REPEL'
    ]
  },
  {
    mapId: 'MAP_CELADON_CITY_DEPARTMENT_STORE_2F',
    scriptId: 'CeladonCity_DepartmentStore_2F_EventScript_ClerkItems',
    clerkLocalId: 'CeladonCity_DepartmentStore_2F_ObjectEvent_ClerkItems',
    items: [
      'ITEM_GREAT_BALL',
      'ITEM_SUPER_POTION',
      'ITEM_REVIVE',
      'ITEM_ANTIDOTE',
      'ITEM_PARALYZE_HEAL',
      'ITEM_AWAKENING',
      'ITEM_BURN_HEAL',
      'ITEM_ICE_HEAL',
      'ITEM_SUPER_REPEL'
    ]
  },
  {
    mapId: 'MAP_CELADON_CITY_DEPARTMENT_STORE_2F',
    scriptId: 'CeladonCity_DepartmentStore_2F_EventScript_ClerkTMs',
    clerkLocalId: 'CeladonCity_DepartmentStore_2F_ObjectEvent_ClerkTMs',
    items: [
      'ITEM_TM05',
      'ITEM_TM15',
      'ITEM_TM28',
      'ITEM_TM31',
      'ITEM_TM43',
      'ITEM_TM45'
    ]
  },
  {
    mapId: 'MAP_CELADON_CITY_DEPARTMENT_STORE_4F',
    scriptId: 'CeladonCity_DepartmentStore_4F_EventScript_Clerk',
    clerkLocalId: 'CeladonCity_DepartmentStore_4F_ObjectEvent_Clerk',
    items: [
      'ITEM_POKE_DOLL',
      'ITEM_RETRO_MAIL',
      'ITEM_FIRE_STONE',
      'ITEM_THUNDER_STONE',
      'ITEM_WATER_STONE',
      'ITEM_LEAF_STONE'
    ]
  },
  {
    mapId: 'MAP_CELADON_CITY_DEPARTMENT_STORE_5F',
    scriptId: 'CeladonCity_DepartmentStore_5F_EventScript_ClerkXItems',
    clerkLocalId: 'CeladonCity_DepartmentStore_5F_ObjectEvent_ClerkXItems',
    items: [
      'ITEM_X_ATTACK',
      'ITEM_X_DEFEND',
      'ITEM_X_SPEED',
      'ITEM_X_SPECIAL',
      'ITEM_X_ACCURACY',
      'ITEM_GUARD_SPEC',
      'ITEM_DIRE_HIT'
    ]
  },
  {
    mapId: 'MAP_CELADON_CITY_DEPARTMENT_STORE_5F',
    scriptId: 'CeladonCity_DepartmentStore_5F_EventScript_ClerkVitamins',
    clerkLocalId: 'CeladonCity_DepartmentStore_5F_ObjectEvent_ClerkVitamins',
    items: [
      'ITEM_HP_UP',
      'ITEM_PROTEIN',
      'ITEM_IRON',
      'ITEM_CALCIUM',
      'ITEM_ZINC',
      'ITEM_CARBOS'
    ]
  },
  {
    mapId: 'MAP_TWO_ISLAND',
    scriptId: 'TwoIsland_EventScript_Clerk',
    clerkLocalId: 'TwoIsland_ObjectEvent_Clerk',
    items: ['ITEM_GREAT_BALL', 'ITEM_FRESH_WATER']
  },
  {
    mapId: 'MAP_THREE_ISLAND_MART',
    scriptId: 'ThreeIsland_Mart_EventScript_Clerk',
    clerkLocalId: 'ThreeIsland_Mart_ObjectEvent_Clerk',
    items: [
      'ITEM_ULTRA_BALL',
      'ITEM_HYPER_POTION',
      'ITEM_REVIVE',
      'ITEM_FULL_HEAL',
      'ITEM_ESCAPE_ROPE',
      'ITEM_MAX_REPEL'
    ]
  },
  {
    mapId: 'MAP_FOUR_ISLAND_MART',
    scriptId: 'FourIsland_Mart_EventScript_Clerk',
    clerkLocalId: 'FourIsland_Mart_ObjectEvent_Clerk',
    items: [
      'ITEM_ULTRA_BALL',
      'ITEM_FULL_RESTORE',
      'ITEM_MAX_POTION',
      'ITEM_REVIVE',
      'ITEM_ICE_HEAL',
      'ITEM_FULL_HEAL',
      'ITEM_ESCAPE_ROPE',
      'ITEM_MAX_REPEL'
    ]
  },
  {
    mapId: 'MAP_SIX_ISLAND_MART',
    scriptId: 'SixIsland_Mart_EventScript_Clerk',
    clerkLocalId: 'SixIsland_Mart_ObjectEvent_Clerk',
    items: [
      'ITEM_ULTRA_BALL',
      'ITEM_FULL_RESTORE',
      'ITEM_MAX_POTION',
      'ITEM_REVIVE',
      'ITEM_FULL_HEAL',
      'ITEM_ESCAPE_ROPE',
      'ITEM_MAX_REPEL',
      'ITEM_DREAM_MAIL'
    ]
  },
  {
    mapId: 'MAP_SEVEN_ISLAND_MART',
    scriptId: 'SevenIsland_Mart_EventScript_Clerk',
    clerkLocalId: 'SevenIsland_Mart_ObjectEvent_Clerk',
    items: [
      'ITEM_ULTRA_BALL',
      'ITEM_GREAT_BALL',
      'ITEM_FULL_RESTORE',
      'ITEM_MAX_POTION',
      'ITEM_HYPER_POTION',
      'ITEM_REVIVE',
      'ITEM_FULL_HEAL',
      'ITEM_ESCAPE_ROPE',
      'ITEM_MAX_REPEL'
    ]
  }
];

export const CLERK_DIALOGUE = {
  mayIHelpYou: 'Hi, there!\nMay I help you?',
  pleaseComeAgain: 'Please come again!'
} as const;

export const CLERK_STANDARD_DIALOGUE_QUEUE: string[] = [
  CLERK_DIALOGUE.mayIHelpYou,
  CLERK_DIALOGUE.pleaseComeAgain
];

const stockSummaryLine = (items: readonly string[]): string =>
  `Shop UI stub: ${items
    .map((itemId) => getItemDefinition(itemId).name.replace(/\u00e9/gu, 'e').toUpperCase())
    .join(', ')}.`;

export type MartHandlerContext = {
  dialogue: MartDialogueState;
  runtime: ScriptRuntimeState;
};

export const createClerkScriptHandler = (
  clerkLocalId: string,
  items: readonly string[]
): ((context: MartHandlerContext) => void) => {
  return ({ dialogue }: MartHandlerContext): void => {
    const stockLine = stockSummaryLine(items);
    openDialogueSequence(dialogue, clerkLocalId, [
      CLERK_DIALOGUE.mayIHelpYou,
      stockLine,
      CLERK_DIALOGUE.pleaseComeAgain
    ]);
  };
};

const TWO_ISLAND_VAR = 'VAR_MAP_SCENE_TWO_ISLAND';

export const getTwoIslandTier = (
  runtime: ScriptRuntimeState
): TwoIslandMartTier => {
  const varValue = runtime.vars[TWO_ISLAND_VAR] ?? 1;
  return (
    TWO_ISLAND_TIERS.find((t) => t.varValue === varValue) ?? TWO_ISLAND_TIERS[0]
  );
};

export const getTwoIslandTierItems = (
  runtime: ScriptRuntimeState
): readonly string[] => getTwoIslandTier(runtime).items;

export const createTwoIslandClerkHandler = (
  clerkLocalId: string
): ((context: MartHandlerContext) => void) => {
  return ({ dialogue, runtime }: MartHandlerContext): void => {
    const tier = getTwoIslandTier(runtime);
    const lines: string[] = [];
    if (!runtime.flags.has(tier.introFlag)) {
      lines.push(tier.introText);
    }
    lines.push(CLERK_DIALOGUE.mayIHelpYou);
    lines.push(stockSummaryLine(tier.items));
    lines.push(CLERK_DIALOGUE.pleaseComeAgain);
    openDialogueSequence(dialogue, clerkLocalId, lines);
  };
};

export const getMartStockForMap = (mapId: string): MartStock | undefined =>
  MART_STOCKS.find((stock) => stock.mapId === mapId);

export const getMartItemsForMap = (mapId: string): readonly string[] => {
  const stock = getMartStockForMap(mapId);
  return stock ? stock.items : [];
};

export interface MartNpcDialogue {
  scriptId: string;
  speakerId: string;
  lines: string[];
}

export const MART_NPC_DIALOGUES: MartNpcDialogue[] = [
  {
    scriptId: 'ViridianCity_Mart_EventScript_Woman',
    speakerId: 'ViridianCity_Mart_ObjectEvent_Woman',
    lines: [
      'This shop does good business in',
      "ANTIDOTES, I've heard."
    ]
  },
  {
    scriptId: 'ViridianCity_Mart_EventScript_Youngster',
    speakerId: 'ViridianCity_Mart_ObjectEvent_Youngster',
    lines: [
      "I've got to buy some POTIONS.",
      'You never know when your POKeMON',
      'will need quick healing.'
    ]
  },
  {
    scriptId: 'PewterCity_Mart_EventScript_Youngster',
    speakerId: 'PewterCity_Mart_ObjectEvent_Youngster',
    lines: [
      'A shady old guy sucked me into',
      'buying this weird fish POKeMON!',
      "It's totally weak and it cost \u00a5500!"
    ]
  },
  {
    scriptId: 'PewterCity_Mart_EventScript_Boy',
    speakerId: 'PewterCity_Mart_ObjectEvent_Boy',
    lines: [
      'Good things can happen if you raise',
      'POK\u00e9MON diligently.',
      'Even the weak ones can surprise',
      "you if you don't give up on them."
    ]
  },
  {
    scriptId: 'CeruleanCity_Mart_EventScript_Youngster',
    speakerId: 'CeruleanCity_Mart_ObjectEvent_Youngster',
    lines: [
      'REPEL not only keeps bugs away,',
      'it also works on weak POK\u00e9MON.',
      'Put your strongest POK\u00e9MON at the',
      'left of the POK\u00e9MON LIST.',
      'If your first POK\u00e9MON is strong,',
      "REPEL's effect is boosted."
    ]
  },
  {
    scriptId: 'CeruleanCity_Mart_EventScript_Woman',
    speakerId: 'CeruleanCity_Mart_ObjectEvent_Woman',
    lines: [
      'Do you know about RARE CANDY?',
      "They don't sell it in shops.",
      'I think it makes POK\u00e9MON grow',
      'very quickly all of a sudden.'
    ]
  },
  {
    scriptId: 'VermilionCity_Mart_EventScript_CooltrainerF',
    speakerId: 'VermilionCity_Mart_ObjectEvent_CooltrainerF',
    lines: [
      'I think POK\u00e9MON can be good or',
      'bad. It depends on the TRAINER.'
    ]
  },
  {
    scriptId: 'VermilionCity_Mart_EventScript_BaldingMan',
    speakerId: 'VermilionCity_Mart_ObjectEvent_BaldingMan',
    lines: [
      'There are wicked people who will',
      'use POK\u00e9MON for criminal acts.',
      'TEAM ROCKET traffics in rare',
      'POK\u00e9MON, for example.',
      'They also abandon POK\u00e9MON that',
      'they consider unpopular or useless.',
      "That's the sort of horrid people",
      'they are, TEAM ROCKET.'
    ]
  },
  {
    scriptId: 'LavenderTown_Mart_EventScript_BaldingMan',
    speakerId: 'LavenderTown_Mart_ObjectEvent_BaldingMan',
    lines: [
      "I'm searching for items that raise",
      'the stats of POK\u00e9MON.',
      "They're effective over the course",
      'of a single battle.',
      'X ATTACK, X DEFEND, X SPEED,',
      "and X SPECIAL are what I'm after.",
      'Do you know where I can get them?'
    ]
  },
  {
    scriptId: 'LavenderTown_Mart_EventScript_Rocker',
    speakerId: 'LavenderTown_Mart_ObjectEvent_Rocker',
    lines: [
      'Did you buy some REVIVES?',
      'They revive any fainted POK\u00e9MON!'
    ]
  },
  {
    scriptId: 'LavenderTown_Mart_EventScript_Youngster',
    speakerId: 'LavenderTown_Mart_ObjectEvent_Youngster',
    lines: [
      'Sometimes, a TRAINER duo will',
      'challenge you with two POK\u00e9MON',
      'at the same time.',
      'If that happens, you have to send',
      'out two POK\u00e9MON to battle, too.'
    ]
  },
  {
    scriptId: 'SaffronCity_Mart_EventScript_Lass',
    speakerId: 'SaffronCity_Mart_ObjectEvent_Lass',
    lines: [
      'REVIVE is costly, but it revives',
      'fainted POK\u00e9MON!'
    ]
  },
  {
    scriptId: 'SaffronCity_Mart_EventScript_Youngster',
    speakerId: 'SaffronCity_Mart_ObjectEvent_Youngster',
    lines: [
      'MAX REPEL keeps weaker POK\u00e9MON',
      'from appearing.',
      'MAX REPEL stays effective longer',
      'than SUPER REPEL.'
    ]
  },
  {
    scriptId: 'FuchsiaCity_Mart_EventScript_CooltrainerF',
    speakerId: 'FuchsiaCity_Mart_ObjectEvent_CooltrainerF',
    lines: [
      'Did you try X SPEED?',
      'It speeds up a POK\u00e9MON in battle.'
    ]
  },
  {
    scriptId: 'FuchsiaCity_Mart_EventScript_Gentleman',
    speakerId: 'FuchsiaCity_Mart_ObjectEvent_Gentleman',
    lines: [
      "Don't they have any pennants",
      'promoting the SAFARI ZONE?',
      'How about some paper lanterns?',
      "Aren't there even any calendars?"
    ]
  },
  {
    scriptId: 'CinnabarIsland_Mart_EventScript_Woman',
    speakerId: 'CinnabarIsland_Mart_ObjectEvent_Woman',
    lines: [
      "Don't they have X ATTACK?",
      'I like it because it raises the',
      'ATTACK stat in battle.'
    ]
  },
  {
    scriptId: 'CinnabarIsland_Mart_EventScript_Scientist',
    speakerId: 'CinnabarIsland_Mart_ObjectEvent_Scientist',
    lines: [
      'It never hurts to have extra items.',
      'You never know what might happen.'
    ]
  },
  {
    scriptId: 'CeladonCity_DepartmentStore_2F_EventScript_Lass',
    speakerId: 'CeladonCity_DepartmentStore_2F_ObjectEvent_Lass',
    lines: [
      'For long outings, you should buy',
      'REVIVE.'
    ]
  },
  {
    scriptId: 'CeladonCity_DepartmentStore_2F_EventScript_Woman',
    speakerId: 'CeladonCity_DepartmentStore_2F_ObjectEvent_Woman',
    lines: [
      'We have a customer, LANCE, who',
      'occasionally comes.',
      'He always buys capes.',
      'I wonder\u2026 Does he have many',
      'identical capes at home?'
    ]
  },
  {
    scriptId: 'CeladonCity_DepartmentStore_4F_EventScript_Man',
    speakerId: 'CeladonCity_DepartmentStore_4F_ObjectEvent_Man',
    lines: [
      "I'm getting a present for my",
      'girlfriend.',
      "I guess a POK\u00e9 DOLL will be it.",
      "It's the popular thing."
    ]
  },
  {
    scriptId: 'CeladonCity_DepartmentStore_4F_EventScript_Youngster',
    speakerId: 'CeladonCity_DepartmentStore_4F_ObjectEvent_Youngster',
    lines: [
      'I heard something useful.',
      'If a wild POK\u00e9MON appears, you can',
      'distract it with a POK\u00e9 DOLL.',
      'You can run away while the wild',
      'POK\u00e9MON is distracted.'
    ]
  },
  {
    scriptId: 'CeladonCity_DepartmentStore_5F_EventScript_Gentleman',
    speakerId: 'CeladonCity_DepartmentStore_5F_ObjectEvent_Gentleman',
    lines: [
      'POK\u00e9MON stat enhancers can be',
      'bought only here.',
      'HP UP increases the base HP of a',
      'POK\u00e9MON.',
      'CALCIUM raises the base SP. ATK',
      'stat of one POK\u00e9MON.',
      'ZINC boosts the base SP. DEF stat',
      'of one POK\u00e9MON.',
      'CARBOS enhances the base SPEED',
      'stat.'
    ]
  },
  {
    scriptId: 'CeladonCity_DepartmentStore_5F_EventScript_Sailor',
    speakerId: 'CeladonCity_DepartmentStore_5F_ObjectEvent_Sailor',
    lines: [
      "I'm here for POK\u00e9MON stat",
      'enhancers.',
      'PROTEIN increases the base ATTACK',
      'power.',
      'IRON increases the base DEFENSE',
      'stat.'
    ]
  },
  {
    scriptId: 'ThreeIsland_Mart_EventScript_Picnicker',
    speakerId: 'ThreeIsland_Mart_ObjectEvent_Picnicker',
    lines: [
      'Is it true?',
      'CELADON DEPT. STORE is several',
      'times bigger than this shop?'
    ]
  },
  {
    scriptId: 'ThreeIsland_Mart_EventScript_BugCatcher',
    speakerId: 'ThreeIsland_Mart_ObjectEvent_BugCatcher',
    lines: [
      'I sometimes buy medicine here.',
      'But a lot of people heal POK\u00e9MON',
      'with BERRIES from BERRY FOREST.',
      'After all, BERRIES are free and',
      'they never run out.'
    ]
  },
  {
    scriptId: 'ThreeIsland_Mart_EventScript_Youngster',
    speakerId: 'ThreeIsland_Mart_ObjectEvent_Youngster',
    lines: [
      'Those BIKERS were about to trash',
      'this POK\u00e9MON MART.',
      'Am I glad they decided to leave!'
    ]
  },
  {
    scriptId: 'FourIsland_Mart_EventScript_Camper',
    speakerId: 'FourIsland_Mart_ObjectEvent_Camper',
    lines: [
      'The SEVII ISLANDS are in a warm',
      'region overall.',
      'But there is one exception you',
      'need to know about.',
      'The ICEFALL CAVE is frigid because',
      'of the POK\u00e9MON that live in it.'
    ]
  },
  {
    scriptId: 'SixIsland_Mart_EventScript_Picnicker',
    speakerId: 'SixIsland_Mart_ObjectEvent_Picnicker',
    lines: [
      'I should buy some MAIL and write',
      'him a letter\u2026'
    ]
  },
  {
    scriptId: 'SevenIsland_Mart_EventScript_Lass',
    speakerId: 'SevenIsland_Mart_ObjectEvent_Lass',
    lines: [
      'POK\u00e9MON have personalities of their',
      'own, just like people.',
      'My PIKACHU has a HASTY nature,',
      'so it grew to be a speedy POK\u00e9MON.'
    ]
  },
  {
    scriptId: 'SevenIsland_Mart_EventScript_Hiker',
    speakerId: 'SevenIsland_Mart_ObjectEvent_Hiker',
    lines: [
      'Okay, preparations are complete',
      'for me to explore the RUINS.'
    ]
  },
  {
    scriptId: 'SevenIsland_Mart_EventScript_Fisher',
    speakerId: 'SevenIsland_Mart_ObjectEvent_Fisher',
    lines: [
      'I need to fish on SEVEN ISLAND.',
      'That will complete my fishing tour',
      'of the SEVII ISLANDS.',
      "I'd better stock up on some",
      'POK\u00e9 BALLS first, though.'
    ]
  }
];

export const buildMartNpcScriptEntries = (): Record<
  string,
  (context: { dialogue: MartDialogueState }) => void
> => {
  const entries: Record<string, (context: { dialogue: MartDialogueState }) => void> = {};
  for (const npc of MART_NPC_DIALOGUES) {
    entries[npc.scriptId] = ({ dialogue }) => {
      openDialogueSequence(dialogue, npc.speakerId, npc.lines);
    };
  }
  return entries;
};

const TWO_ISLAND_SCRIPT_ID = 'TwoIsland_EventScript_Clerk';

export const buildClerkScriptEntries = (): Record<
  string,
  (context: MartHandlerContext) => void
> => {
  const entries: Record<string, (context: MartHandlerContext) => void> = {};
  for (const stock of MART_STOCKS) {
    if (stock.scriptId === TWO_ISLAND_SCRIPT_ID) {
      entries[stock.scriptId] = createTwoIslandClerkHandler(stock.clerkLocalId);
    } else {
      entries[stock.scriptId] = createClerkScriptHandler(
        stock.clerkLocalId,
        stock.items
      );
    }
  }
  return entries;
};

export const getAllMartScriptHandlers = (): Record<
  string,
  (context: MartHandlerContext) => void
> => ({
  ...buildClerkScriptEntries(),
  ...buildMartNpcScriptEntries()
});
