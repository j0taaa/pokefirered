import { describe, it, expect } from 'vitest';
import {
  MART_STOCKS,
  MART_NPC_DIALOGUES,
  CLERK_DIALOGUE,
  TWO_ISLAND_TIERS,
  getMartStockForMap,
  getMartItemsForMap,
  getTwoIslandTier,
  getTwoIslandTierItems,
  createClerkScriptHandler,
  createTwoIslandClerkHandler,
  buildClerkScriptEntries,
  buildMartNpcScriptEntries,
  getAllMartScriptHandlers,
  type MartStock
} from '../src/game/martTemplate';
import { createScriptRuntimeState } from '../src/game/scripts';
import { createDialogueState } from '../src/game/interaction';

const DECOMP_MART_ITEMS: Record<string, string[]> = {
  MAP_VIRIDIAN_CITY_MART: [
    'ITEM_POKE_BALL', 'ITEM_POTION', 'ITEM_ANTIDOTE', 'ITEM_PARALYZE_HEAL'
  ],
  MAP_PEWTER_CITY_MART: [
    'ITEM_POKE_BALL', 'ITEM_POTION', 'ITEM_ANTIDOTE', 'ITEM_PARALYZE_HEAL',
    'ITEM_AWAKENING', 'ITEM_BURN_HEAL', 'ITEM_ESCAPE_ROPE', 'ITEM_REPEL'
  ],
  MAP_CERULEAN_CITY_MART: [
    'ITEM_POKE_BALL', 'ITEM_SUPER_POTION', 'ITEM_POTION', 'ITEM_ANTIDOTE',
    'ITEM_PARALYZE_HEAL', 'ITEM_AWAKENING', 'ITEM_BURN_HEAL', 'ITEM_ESCAPE_ROPE', 'ITEM_REPEL'
  ],
  MAP_VERMILION_CITY_MART: [
    'ITEM_POKE_BALL', 'ITEM_SUPER_POTION', 'ITEM_ANTIDOTE', 'ITEM_PARALYZE_HEAL',
    'ITEM_AWAKENING', 'ITEM_ICE_HEAL', 'ITEM_REPEL'
  ],
  MAP_LAVENDER_TOWN_MART: [
    'ITEM_GREAT_BALL', 'ITEM_SUPER_POTION', 'ITEM_REVIVE', 'ITEM_ANTIDOTE',
    'ITEM_PARALYZE_HEAL', 'ITEM_BURN_HEAL', 'ITEM_ICE_HEAL', 'ITEM_ESCAPE_ROPE', 'ITEM_SUPER_REPEL'
  ],
  MAP_SAFFRON_CITY_MART: [
    'ITEM_GREAT_BALL', 'ITEM_HYPER_POTION', 'ITEM_REVIVE',
    'ITEM_FULL_HEAL', 'ITEM_ESCAPE_ROPE', 'ITEM_MAX_REPEL'
  ],
  MAP_FUCHSIA_CITY_MART: [
    'ITEM_ULTRA_BALL', 'ITEM_GREAT_BALL', 'ITEM_SUPER_POTION',
    'ITEM_REVIVE', 'ITEM_FULL_HEAL', 'ITEM_MAX_REPEL'
  ],
  MAP_CINNABAR_ISLAND_MART: [
    'ITEM_ULTRA_BALL', 'ITEM_GREAT_BALL', 'ITEM_HYPER_POTION',
    'ITEM_REVIVE', 'ITEM_FULL_HEAL', 'ITEM_ESCAPE_ROPE', 'ITEM_MAX_REPEL'
  ],
  MAP_INDIGO_PLATEAU_POKEMON_CENTER_1F: [
    'ITEM_ULTRA_BALL', 'ITEM_GREAT_BALL', 'ITEM_FULL_RESTORE',
    'ITEM_MAX_POTION', 'ITEM_REVIVE', 'ITEM_FULL_HEAL', 'ITEM_MAX_REPEL'
  ],
  MAP_TWO_ISLAND: [
    'ITEM_GREAT_BALL', 'ITEM_FRESH_WATER'
  ],
  MAP_THREE_ISLAND_MART: [
    'ITEM_ULTRA_BALL', 'ITEM_HYPER_POTION', 'ITEM_REVIVE',
    'ITEM_FULL_HEAL', 'ITEM_ESCAPE_ROPE', 'ITEM_MAX_REPEL'
  ],
  MAP_FOUR_ISLAND_MART: [
    'ITEM_ULTRA_BALL', 'ITEM_FULL_RESTORE', 'ITEM_MAX_POTION',
    'ITEM_REVIVE', 'ITEM_ICE_HEAL', 'ITEM_FULL_HEAL', 'ITEM_ESCAPE_ROPE', 'ITEM_MAX_REPEL'
  ],
  MAP_SIX_ISLAND_MART: [
    'ITEM_ULTRA_BALL', 'ITEM_FULL_RESTORE', 'ITEM_MAX_POTION', 'ITEM_REVIVE',
    'ITEM_FULL_HEAL', 'ITEM_ESCAPE_ROPE', 'ITEM_MAX_REPEL', 'ITEM_DREAM_MAIL'
  ],
  MAP_SEVEN_ISLAND_MART: [
    'ITEM_ULTRA_BALL', 'ITEM_GREAT_BALL', 'ITEM_FULL_RESTORE', 'ITEM_MAX_POTION',
    'ITEM_HYPER_POTION', 'ITEM_REVIVE', 'ITEM_FULL_HEAL', 'ITEM_ESCAPE_ROPE', 'ITEM_MAX_REPEL'
  ]
};

const DECOMP_DEPT_STORE_ITEMS: Record<string, { scriptId: string; items: string[] }[]> = {
  MAP_CELADON_CITY_DEPARTMENT_STORE_2F: [
    {
      scriptId: 'CeladonCity_DepartmentStore_2F_EventScript_ClerkItems',
      items: [
        'ITEM_GREAT_BALL', 'ITEM_SUPER_POTION', 'ITEM_REVIVE', 'ITEM_ANTIDOTE',
        'ITEM_PARALYZE_HEAL', 'ITEM_AWAKENING', 'ITEM_BURN_HEAL', 'ITEM_ICE_HEAL',
        'ITEM_SUPER_REPEL'
      ]
    },
    {
      scriptId: 'CeladonCity_DepartmentStore_2F_EventScript_ClerkTMs',
      items: [
        'ITEM_TM05', 'ITEM_TM15', 'ITEM_TM28', 'ITEM_TM31', 'ITEM_TM43', 'ITEM_TM45'
      ]
    }
  ],
  MAP_CELADON_CITY_DEPARTMENT_STORE_4F: [
    {
      scriptId: 'CeladonCity_DepartmentStore_4F_EventScript_Clerk',
      items: [
        'ITEM_POKE_DOLL', 'ITEM_RETRO_MAIL', 'ITEM_FIRE_STONE',
        'ITEM_THUNDER_STONE', 'ITEM_WATER_STONE', 'ITEM_LEAF_STONE'
      ]
    }
  ],
  MAP_CELADON_CITY_DEPARTMENT_STORE_5F: [
    {
      scriptId: 'CeladonCity_DepartmentStore_5F_EventScript_ClerkXItems',
      items: [
        'ITEM_X_ATTACK', 'ITEM_X_DEFEND', 'ITEM_X_SPEED', 'ITEM_X_SPECIAL',
        'ITEM_X_ACCURACY', 'ITEM_GUARD_SPEC', 'ITEM_DIRE_HIT'
      ]
    },
    {
      scriptId: 'CeladonCity_DepartmentStore_5F_EventScript_ClerkVitamins',
      items: [
        'ITEM_HP_UP', 'ITEM_PROTEIN', 'ITEM_IRON', 'ITEM_CALCIUM',
        'ITEM_ZINC', 'ITEM_CARBOS'
      ]
    }
  ]
};

describe('martTemplate MART_STOCKS', () => {
  it('covers 19 clerk entries across 17 unique map ids', () => {
    expect(MART_STOCKS).toHaveLength(19);
    const uniqueMapIds = new Set(MART_STOCKS.map((s) => s.mapId));
    expect(uniqueMapIds.size).toBe(17);
  });

  it('has unique script ids', () => {
    const ids = MART_STOCKS.map((s) => s.scriptId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  for (const mapId of Object.keys(DECOMP_MART_ITEMS)) {
    describe(mapId, () => {
      const stock = (): MartStock => {
        const s = MART_STOCKS.find((m) => m.mapId === mapId);
        expect(s).toBeDefined();
        return s!;
      };

      it('has MAP_ prefix', () => {
        expect(stock().mapId).toMatch(/^MAP_/);
      });

      it('has a clerk script id', () => {
        expect(stock().scriptId.length).toBeGreaterThan(0);
      });

      it('has a non-empty clerk local id', () => {
        expect(stock().clerkLocalId.length).toBeGreaterThan(0);
      });

      it('items match decomp parity', () => {
        const expected = DECOMP_MART_ITEMS[mapId];
        expect(expected).toBeDefined();
        expect(stock().items).toEqual(expected);
      });

      it('all items have ITEM_ prefix', () => {
        for (const item of stock().items) {
          expect(item).toMatch(/^ITEM_/);
        }
      });
    });
  }

  for (const [mapId, clerks] of Object.entries(DECOMP_DEPT_STORE_ITEMS)) {
    describe(`Celadon Dept Store ${mapId}`, () => {
      for (const clerk of clerks) {
        it(`${clerk.scriptId} items match decomp parity`, () => {
          const stock = MART_STOCKS.find((m) => m.scriptId === clerk.scriptId);
          expect(stock).toBeDefined();
          expect(stock!.items).toEqual(clerk.items);
        });
      }
    });
  }
});

describe('martTemplate getMartStockForMap', () => {
  it('returns stock for known maps', () => {
    const viridian = getMartStockForMap('MAP_VIRIDIAN_CITY_MART');
    expect(viridian).toBeDefined();
    expect(viridian!.items).toContain('ITEM_POKE_BALL');
  });

  it('returns first stock entry for multi-clerk maps', () => {
    const celadon2f = getMartStockForMap('MAP_CELADON_CITY_DEPARTMENT_STORE_2F');
    expect(celadon2f).toBeDefined();
    expect(celadon2f!.scriptId).toBe('CeladonCity_DepartmentStore_2F_EventScript_ClerkItems');
  });

  it('returns undefined for unknown maps', () => {
    expect(getMartStockForMap('MAP_NONEXISTENT')).toBeUndefined();
  });
});

describe('martTemplate getMartItemsForMap', () => {
  it('returns items for known maps', () => {
    expect(getMartItemsForMap('MAP_PEWTER_CITY_MART')).toEqual(
      DECOMP_MART_ITEMS.MAP_PEWTER_CITY_MART
    );
  });

  it('returns empty array for unknown maps', () => {
    expect(getMartItemsForMap('MAP_UNKNOWN')).toEqual([]);
  });
});

describe('martTemplate clerk dialogue', () => {
  it('has shared mayIHelpYou and pleaseComeAgain', () => {
    expect(CLERK_DIALOGUE.mayIHelpYou).toContain('May I help you?');
    expect(CLERK_DIALOGUE.pleaseComeAgain).toBe('Please come again!');
  });
});

describe('martTemplate createClerkScriptHandler', () => {
  it('opens dialogue with clerk lines', () => {
    const dialogue = { active: false, speakerId: null as string | null, text: '', queue: [] as string[], queueIndex: 0 };
    const handler = createClerkScriptHandler('TEST_CLERK', ['ITEM_POTION', 'ITEM_POKE_BALL']);
    handler({ dialogue, runtime: { vars: {}, flags: new Set() } } as any);
    expect(dialogue.active).toBe(true);
    expect(dialogue.speakerId).toBe('TEST_CLERK');
    expect(dialogue.queue[0]).toContain('May I help you?');
    expect(dialogue.queue[1]).toContain('POTION');
    expect(dialogue.queue[2]).toContain('Please come again!');
  });
});

describe('martTemplate buildClerkScriptEntries', () => {
  it('has entry for every mart stock', () => {
    const entries = buildClerkScriptEntries();
    for (const stock of MART_STOCKS) {
      expect(entries[stock.scriptId]).toBeDefined();
    }
  });

  it('has 19 clerk entries', () => {
    expect(Object.keys(buildClerkScriptEntries())).toHaveLength(19);
  });
});

describe('martTemplate Two Island progressive shop', () => {
  it('has 4 tiers', () => {
    expect(TWO_ISLAND_TIERS).toHaveLength(4);
  });

  it('tiers have ascending varValues 1-4', () => {
    expect(TWO_ISLAND_TIERS.map((t) => t.varValue)).toEqual([1, 2, 3, 4]);
  });

  it('each tier has unique introFlag', () => {
    const flags = TWO_ISLAND_TIERS.map((t) => t.introFlag);
    expect(new Set(flags).size).toBe(flags.length);
  });

  it('each tier has non-empty items and introText', () => {
    for (const tier of TWO_ISLAND_TIERS) {
      expect(tier.items.length).toBeGreaterThan(0);
      expect(tier.introText.length).toBeGreaterThan(0);
      for (const item of tier.items) {
        expect(item).toMatch(/^ITEM_/);
      }
    }
  });

  it('tier 1 items match decomp ShopInitial parity', () => {
    expect(TWO_ISLAND_TIERS[0].items).toEqual(['ITEM_GREAT_BALL', 'ITEM_FRESH_WATER']);
  });

  it('tier 2 items match decomp ShopExpanded1 parity', () => {
    expect(TWO_ISLAND_TIERS[1].items).toEqual([
      'ITEM_ULTRA_BALL', 'ITEM_GREAT_BALL', 'ITEM_SODA_POP', 'ITEM_FRESH_WATER'
    ]);
  });

  it('tier 3 items match decomp ShopExpanded2 parity', () => {
    expect(TWO_ISLAND_TIERS[2].items).toEqual([
      'ITEM_ULTRA_BALL', 'ITEM_GREAT_BALL', 'ITEM_LEMONADE',
      'ITEM_SODA_POP', 'ITEM_FRESH_WATER', 'ITEM_MOOMOO_MILK'
    ]);
  });

  it('tier 4 items match decomp ShopExpanded3 parity', () => {
    expect(TWO_ISLAND_TIERS[3].items).toEqual([
      'ITEM_ULTRA_BALL', 'ITEM_REPEAT_BALL', 'ITEM_TIMER_BALL',
      'ITEM_LEMONADE', 'ITEM_SODA_POP', 'ITEM_FRESH_WATER',
      'ITEM_MOOMOO_MILK', 'ITEM_LAVA_COOKIE'
    ]);
  });

  it('items grow across tiers', () => {
    for (let i = 1; i < TWO_ISLAND_TIERS.length; i++) {
      expect(TWO_ISLAND_TIERS[i].items.length).toBeGreaterThanOrEqual(
        TWO_ISLAND_TIERS[i - 1].items.length
      );
    }
  });

  it('getTwoIslandTier returns tier 1 by default', () => {
    const runtime = createScriptRuntimeState();
    const tier = getTwoIslandTier(runtime);
    expect(tier.varValue).toBe(1);
    expect(tier.items).toEqual(['ITEM_GREAT_BALL', 'ITEM_FRESH_WATER']);
  });

  it('getTwoIslandTier respects VAR_MAP_SCENE_TWO_ISLAND', () => {
    const runtime = createScriptRuntimeState();
    runtime.vars['VAR_MAP_SCENE_TWO_ISLAND'] = 3;
    const tier = getTwoIslandTier(runtime);
    expect(tier.varValue).toBe(3);
    expect(tier.items).toContain('ITEM_MOOMOO_MILK');
  });

  it('getTwoIslandTier falls back to tier 1 for unknown var', () => {
    const runtime = createScriptRuntimeState();
    runtime.vars['VAR_MAP_SCENE_TWO_ISLAND'] = 99;
    const tier = getTwoIslandTier(runtime);
    expect(tier.varValue).toBe(1);
  });

  it('getTwoIslandTierItems returns tier items', () => {
    const runtime = createScriptRuntimeState();
    runtime.vars['VAR_MAP_SCENE_TWO_ISLAND'] = 4;
    const items = getTwoIslandTierItems(runtime);
    expect(items).toContain('ITEM_REPEAT_BALL');
    expect(items).toContain('ITEM_LAVA_COOKIE');
  });

  it('createTwoIslandClerkHandler shows intro on first visit', () => {
    const handler = createTwoIslandClerkHandler('TwoIsland_Clerk');
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    handler({ dialogue, runtime });
    expect(dialogue.active).toBe(true);
    expect(dialogue.queue[0]).toContain('welcome to my shop');
    expect(dialogue.queue[1]).toContain('May I help you?');
    expect(dialogue.queue[2]).toContain('GREAT BALL');
    expect(dialogue.queue[3]).toContain('Please come again!');
  });

  it('createTwoIslandClerkHandler skips intro on repeat visit', () => {
    const handler = createTwoIslandClerkHandler('TwoIsland_Clerk');
    const runtime = createScriptRuntimeState();
    runtime.flags.add('FLAG_TWO_ISLAND_SHOP_INTRODUCED');
    const dialogue = createDialogueState();
    handler({ dialogue, runtime });
    expect(dialogue.active).toBe(true);
    expect(dialogue.queue[0]).toContain('May I help you?');
    expect(dialogue.queue).toHaveLength(3);
  });

  it('createTwoIslandClerkHandler shows expanded stock for tier 2', () => {
    const handler = createTwoIslandClerkHandler('TwoIsland_Clerk');
    const runtime = createScriptRuntimeState();
    runtime.vars['VAR_MAP_SCENE_TWO_ISLAND'] = 2;
    runtime.flags.add('FLAG_TWO_ISLAND_SHOP_EXPANDED_1');
    const dialogue = createDialogueState();
    handler({ dialogue, runtime });
    expect(dialogue.queue[0]).toContain('May I help you?');
    expect(dialogue.queue[1]).toContain('ULTRA BALL');
    expect(dialogue.queue[1]).toContain('SODA POP');
  });

  it('createTwoIslandClerkHandler shows expanded intro for new tier', () => {
    const handler = createTwoIslandClerkHandler('TwoIsland_Clerk');
    const runtime = createScriptRuntimeState();
    runtime.vars['VAR_MAP_SCENE_TWO_ISLAND'] = 2;
    const dialogue = createDialogueState();
    handler({ dialogue, runtime });
    expect(dialogue.queue[0]).toContain('LOSTELLE');
    expect(dialogue.queue[1]).toContain('May I help you?');
  });

  it('createTwoIslandClerkHandler expands {PLAYER} in tier 4 intro', () => {
    const handler = createTwoIslandClerkHandler('TwoIsland_Clerk');
    const runtime = createScriptRuntimeState();
    runtime.startMenu.playerName = 'LEAF';
    runtime.vars['VAR_MAP_SCENE_TWO_ISLAND'] = 4;
    const dialogue = createDialogueState();
    handler({ dialogue, runtime });
    expect(dialogue.queue[0]).toContain('LEAF');
    expect(dialogue.queue[1]).toContain('May I help you?');
    expect(dialogue.queue[2]).toContain('REPEAT BALL');
  });
});

describe('martTemplate MART_NPC_DIALOGUES', () => {
  it('has 31 NPC dialogue entries', () => {
    expect(MART_NPC_DIALOGUES).toHaveLength(31);
  });

  it('every entry has non-empty scriptId, speakerId, and lines', () => {
    for (const npc of MART_NPC_DIALOGUES) {
      expect(npc.scriptId.length).toBeGreaterThan(0);
      expect(npc.speakerId.length).toBeGreaterThan(0);
      expect(npc.lines.length).toBeGreaterThan(0);
    }
  });

  it('has unique scriptIds', () => {
    const ids = MART_NPC_DIALOGUES.map((n) => n.scriptId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  const expectedScripts: [string, string][] = [
    ['ViridianCity_Mart_EventScript_Woman', 'ViridianCity_Mart_ObjectEvent_Woman'],
    ['ViridianCity_Mart_EventScript_Youngster', 'ViridianCity_Mart_ObjectEvent_Youngster'],
    ['PewterCity_Mart_EventScript_Youngster', 'PewterCity_Mart_ObjectEvent_Youngster'],
    ['PewterCity_Mart_EventScript_Boy', 'PewterCity_Mart_ObjectEvent_Boy'],
    ['CeruleanCity_Mart_EventScript_Youngster', 'CeruleanCity_Mart_ObjectEvent_Youngster'],
    ['CeruleanCity_Mart_EventScript_Woman', 'CeruleanCity_Mart_ObjectEvent_Woman'],
    ['VermilionCity_Mart_EventScript_CooltrainerF', 'VermilionCity_Mart_ObjectEvent_CooltrainerF'],
    ['VermilionCity_Mart_EventScript_BaldingMan', 'VermilionCity_Mart_ObjectEvent_BaldingMan'],
    ['LavenderTown_Mart_EventScript_BaldingMan', 'LavenderTown_Mart_ObjectEvent_BaldingMan'],
    ['LavenderTown_Mart_EventScript_Rocker', 'LavenderTown_Mart_ObjectEvent_Rocker'],
    ['LavenderTown_Mart_EventScript_Youngster', 'LavenderTown_Mart_ObjectEvent_Youngster'],
    ['SaffronCity_Mart_EventScript_Lass', 'SaffronCity_Mart_ObjectEvent_Lass'],
    ['SaffronCity_Mart_EventScript_Youngster', 'SaffronCity_Mart_ObjectEvent_Youngster'],
    ['FuchsiaCity_Mart_EventScript_CooltrainerF', 'FuchsiaCity_Mart_ObjectEvent_CooltrainerF'],
    ['FuchsiaCity_Mart_EventScript_Gentleman', 'FuchsiaCity_Mart_ObjectEvent_Gentleman'],
    ['CinnabarIsland_Mart_EventScript_Woman', 'CinnabarIsland_Mart_ObjectEvent_Woman'],
    ['CinnabarIsland_Mart_EventScript_Scientist', 'CinnabarIsland_Mart_ObjectEvent_Scientist'],
    ['CeladonCity_DepartmentStore_2F_EventScript_Lass', 'CeladonCity_DepartmentStore_2F_ObjectEvent_Lass'],
    ['CeladonCity_DepartmentStore_2F_EventScript_Woman', 'CeladonCity_DepartmentStore_2F_ObjectEvent_Woman'],
    ['CeladonCity_DepartmentStore_4F_EventScript_Man', 'CeladonCity_DepartmentStore_4F_ObjectEvent_Man'],
    ['CeladonCity_DepartmentStore_4F_EventScript_Youngster', 'CeladonCity_DepartmentStore_4F_ObjectEvent_Youngster'],
    ['CeladonCity_DepartmentStore_5F_EventScript_Gentleman', 'CeladonCity_DepartmentStore_5F_ObjectEvent_Gentleman'],
    ['CeladonCity_DepartmentStore_5F_EventScript_Sailor', 'CeladonCity_DepartmentStore_5F_ObjectEvent_Sailor'],
    ['ThreeIsland_Mart_EventScript_Picnicker', 'ThreeIsland_Mart_ObjectEvent_Picnicker'],
    ['ThreeIsland_Mart_EventScript_BugCatcher', 'ThreeIsland_Mart_ObjectEvent_BugCatcher'],
    ['ThreeIsland_Mart_EventScript_Youngster', 'ThreeIsland_Mart_ObjectEvent_Youngster'],
    ['FourIsland_Mart_EventScript_Camper', 'FourIsland_Mart_ObjectEvent_Camper'],
    ['SixIsland_Mart_EventScript_Picnicker', 'SixIsland_Mart_ObjectEvent_Picnicker'],
    ['SevenIsland_Mart_EventScript_Lass', 'SevenIsland_Mart_ObjectEvent_Lass'],
    ['SevenIsland_Mart_EventScript_Hiker', 'SevenIsland_Mart_ObjectEvent_Hiker'],
    ['SevenIsland_Mart_EventScript_Fisher', 'SevenIsland_Mart_ObjectEvent_Fisher']
  ];

  for (const [scriptId, speakerId] of expectedScripts) {
    it(`contains ${scriptId}`, () => {
      const entry = MART_NPC_DIALOGUES.find((n) => n.scriptId === scriptId);
      expect(entry).toBeDefined();
      expect(entry!.speakerId).toBe(speakerId);
    });
  }

  it('Pewter Youngster mentions weird fish and 500', () => {
    const entry = MART_NPC_DIALOGUES.find((n) => n.scriptId === 'PewterCity_Mart_EventScript_Youngster')!;
    const joined = entry.lines.join(' ');
    expect(joined).toContain('weird fish');
    expect(joined).toContain('500');
  });

  it('Lavender Balding Man mentions X ATTACK', () => {
    const entry = MART_NPC_DIALOGUES.find((n) => n.scriptId === 'LavenderTown_Mart_EventScript_BaldingMan')!;
    const joined = entry.lines.join(' ');
    expect(joined).toContain('X ATTACK');
  });

  it('Celadon 2F Woman mentions LANCE', () => {
    const entry = MART_NPC_DIALOGUES.find((n) => n.scriptId === 'CeladonCity_DepartmentStore_2F_EventScript_Woman')!;
    const joined = entry.lines.join(' ');
    expect(joined).toContain('LANCE');
    expect(joined).toContain('capes');
  });

  it('Celadon 4F Youngster mentions POKé DOLL', () => {
    const entry = MART_NPC_DIALOGUES.find((n) => n.scriptId === 'CeladonCity_DepartmentStore_4F_EventScript_Youngster')!;
    const joined = entry.lines.join(' ');
    expect(joined).toContain('POK');
    expect(joined).toContain('DOLL');
  });

  it('Celadon 5F Gentleman mentions stat enhancers', () => {
    const entry = MART_NPC_DIALOGUES.find((n) => n.scriptId === 'CeladonCity_DepartmentStore_5F_EventScript_Gentleman')!;
    const joined = entry.lines.join(' ');
    expect(joined).toContain('HP UP');
    expect(joined).toContain('CALCIUM');
  });

  it('Seven Island Fisher mentions fishing and POKE BALLS', () => {
    const entry = MART_NPC_DIALOGUES.find((n) => n.scriptId === 'SevenIsland_Mart_EventScript_Fisher')!;
    const joined = entry.lines.join(' ');
    expect(joined).toContain('fish');
    expect(joined).toContain('POK');
  });

  it('covers NPCs from Viridian, Pewter, Cerulean, Vermilion, Lavender, Saffron, Fuchsia, Cinnabar, Celadon Dept Store, Three Island, Four Island, Six Island, Seven Island', () => {
    const coveredMaps = new Set<string>();
    for (const npc of MART_NPC_DIALOGUES) {
      const match = npc.scriptId.match(/^([A-Za-z0-9]+?)(?:_DepartmentStore|_Mart|_EventScript)/);
      if (match) coveredMaps.add(match[1]);
    }
    expect(coveredMaps).toContain('ViridianCity');
    expect(coveredMaps).toContain('PewterCity');
    expect(coveredMaps).toContain('CeruleanCity');
    expect(coveredMaps).toContain('VermilionCity');
    expect(coveredMaps).toContain('LavenderTown');
    expect(coveredMaps).toContain('SaffronCity');
    expect(coveredMaps).toContain('FuchsiaCity');
    expect(coveredMaps).toContain('CinnabarIsland');
    expect(coveredMaps).toContain('CeladonCity');
    expect(coveredMaps).toContain('ThreeIsland');
    expect(coveredMaps).toContain('FourIsland');
    expect(coveredMaps).toContain('SixIsland');
    expect(coveredMaps).toContain('SevenIsland');
  });
});

describe('martTemplate buildMartNpcScriptEntries', () => {
  it('has 31 NPC entries', () => {
    expect(Object.keys(buildMartNpcScriptEntries())).toHaveLength(31);
  });

  it('each handler opens dialogue', () => {
    const entries = buildMartNpcScriptEntries();
    for (const [scriptId, handler] of Object.entries(entries)) {
      const dialogue = { active: false, speakerId: null as string | null, text: '', queue: [] as string[], queueIndex: 0 };
      handler({ dialogue });
      expect(dialogue.active, `${scriptId} did not activate dialogue`).toBe(true);
      expect(dialogue.queue.length, `${scriptId} had empty queue`).toBeGreaterThan(0);
    }
  });
});

describe('martTemplate getAllMartScriptHandlers', () => {
  it('has 50 total entries (19 clerks + 31 NPCs)', () => {
    expect(Object.keys(getAllMartScriptHandlers())).toHaveLength(50);
  });

  it('includes clerk and NPC scriptIds without collision', () => {
    const handlers = getAllMartScriptHandlers();
    const clerkIds = MART_STOCKS.map((s) => s.scriptId);
    const npcIds = MART_NPC_DIALOGUES.map((n) => n.scriptId);
    const allIds = [...clerkIds, ...npcIds];
    const handlerIds = Object.keys(handlers);
    expect(new Set(handlerIds).size).toBe(allIds.length);
    for (const id of allIds) {
      expect(handlers[id]).toBeDefined();
    }
  });
});

describe('martTemplate item progression', () => {
  it('Pewter has more items than Viridian', () => {
    expect(getMartItemsForMap('MAP_PEWTER_CITY_MART').length).toBeGreaterThan(
      getMartItemsForMap('MAP_VIRIDIAN_CITY_MART').length
    );
  });

  it('Cerulean has more items than Pewter', () => {
    expect(getMartItemsForMap('MAP_CERULEAN_CITY_MART').length).toBeGreaterThan(
      getMartItemsForMap('MAP_PEWTER_CITY_MART').length
    );
  });

  it('Saffron sells GREAT_BALL but not POKE_BALL', () => {
    const items = getMartItemsForMap('MAP_SAFFRON_CITY_MART');
    expect(items).toContain('ITEM_GREAT_BALL');
    expect(items).not.toContain('ITEM_POKE_BALL');
  });

  it('Fuchsia sells ULTRA_BALL and GREAT_BALL', () => {
    const items = getMartItemsForMap('MAP_FUCHSIA_CITY_MART');
    expect(items).toContain('ITEM_ULTRA_BALL');
    expect(items).toContain('ITEM_GREAT_BALL');
  });

  it('Indigo Plateau sells FULL_RESTORE', () => {
    const items = getMartItemsForMap('MAP_INDIGO_PLATEAU_POKEMON_CENTER_1F');
    expect(items).toContain('ITEM_FULL_RESTORE');
    expect(items).toContain('ITEM_MAX_POTION');
    expect(items).toContain('ITEM_ULTRA_BALL');
  });

  it('Celadon 4F sells evolution stones', () => {
    const stock4f = MART_STOCKS.find(
      (s) => s.scriptId === 'CeladonCity_DepartmentStore_4F_EventScript_Clerk'
    );
    expect(stock4f).toBeDefined();
    expect(stock4f!.items).toContain('ITEM_FIRE_STONE');
    expect(stock4f!.items).toContain('ITEM_WATER_STONE');
    expect(stock4f!.items).toContain('ITEM_THUNDER_STONE');
    expect(stock4f!.items).toContain('ITEM_LEAF_STONE');
  });

  it('Celadon 5F sells vitamins', () => {
    const stockVit = MART_STOCKS.find(
      (s) => s.scriptId === 'CeladonCity_DepartmentStore_5F_EventScript_ClerkVitamins'
    );
    expect(stockVit).toBeDefined();
    expect(stockVit!.items).toContain('ITEM_HP_UP');
    expect(stockVit!.items).toContain('ITEM_PROTEIN');
    expect(stockVit!.items).toContain('ITEM_CALCIUM');
  });

  it('Celadon 2F sells TMs', () => {
    const stockTM = MART_STOCKS.find(
      (s) => s.scriptId === 'CeladonCity_DepartmentStore_2F_EventScript_ClerkTMs'
    );
    expect(stockTM).toBeDefined();
    expect(stockTM!.items).toContain('ITEM_TM15');
    expect(stockTM!.items).toContain('ITEM_TM28');
  });

  it('Six Island sells DREAM_MAIL', () => {
    expect(getMartItemsForMap('MAP_SIX_ISLAND_MART')).toContain('ITEM_DREAM_MAIL');
  });

  it('Seven Island has the most items of standard marts', () => {
    const sevenCount = getMartItemsForMap('MAP_SEVEN_ISLAND_MART').length;
    const standardMapIds = [
      'MAP_VIRIDIAN_CITY_MART', 'MAP_PEWTER_CITY_MART', 'MAP_CERULEAN_CITY_MART',
      'MAP_VERMILION_CITY_MART', 'MAP_LAVENDER_TOWN_MART', 'MAP_SAFFRON_CITY_MART',
      'MAP_FUCHSIA_CITY_MART', 'MAP_CINNABAR_ISLAND_MART', 'MAP_THREE_ISLAND_MART',
      'MAP_FOUR_ISLAND_MART', 'MAP_SIX_ISLAND_MART'
    ];
    for (const mapId of standardMapIds) {
      expect(getMartItemsForMap(mapId).length).toBeLessThanOrEqual(sevenCount);
    }
  });
});

describe('martTemplate integration with prototypeScriptRegistry', () => {
  it('Indigo Plateau clerk is registered through mart template', () => {
    const entries = getAllMartScriptHandlers();
    expect(entries['IndigoPlateau_PokemonCenter_1F_EventScript_Clerk']).toBeDefined();
  });

  it('Celadon 2F Items clerk is registered', () => {
    const entries = getAllMartScriptHandlers();
    expect(entries['CeladonCity_DepartmentStore_2F_EventScript_ClerkItems']).toBeDefined();
  });

  it('Celadon 2F TM clerk is registered', () => {
    const entries = getAllMartScriptHandlers();
    expect(entries['CeladonCity_DepartmentStore_2F_EventScript_ClerkTMs']).toBeDefined();
  });

  it('Celadon 4F clerk is registered', () => {
    const entries = getAllMartScriptHandlers();
    expect(entries['CeladonCity_DepartmentStore_4F_EventScript_Clerk']).toBeDefined();
  });

  it('Two Island clerk is registered', () => {
    const entries = getAllMartScriptHandlers();
    expect(entries['TwoIsland_EventScript_Clerk']).toBeDefined();
  });

  it('Indigo Plateau clerk shows correct stock', () => {
    const handler = getAllMartScriptHandlers()['IndigoPlateau_PokemonCenter_1F_EventScript_Clerk'];
    const dialogue = createDialogueState();
    const runtime = createScriptRuntimeState();
    handler({ dialogue, runtime });
    expect(dialogue.active).toBe(true);
    expect(dialogue.queue[0]).toContain('May I help you?');
    const stockLine = dialogue.queue[1];
    expect(stockLine).toContain('ULTRA BALL');
    expect(stockLine).toContain('FULL RESTORE');
    expect(stockLine).toContain('MAX REPEL');
  });
});
