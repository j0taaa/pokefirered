import { describe, expect, test } from 'vitest';
import {
  buildNurseScriptEntries,
  buildCenterNpcScriptEntries,
  CENTER_NPC_DIALOGUES,
  createNurseScriptHandler,
  getAllCenterScriptHandlers,
  getHealLocationById,
  getHealLocationForMap,
  getHealLocationIdForCenterMap,
  getRespawnLocation,
  HEAL_LOCATIONS,
  NURSE_DIALOGUE,
  NURSE_HEAL_DIALOGUE_QUEUE,
  setRespawn
} from '../src/game/pokemonCenterTemplate';
import { createDialogueState } from '../src/game/interaction';
import { createPlayer } from '../src/game/player';
import { createScriptRuntimeState, prototypeScriptRegistry, runScriptById } from '../src/game/scripts';

const DECOMP_HEAL_LOCATION_IDS = [
  'HEAL_LOCATION_PALLET_TOWN',
  'HEAL_LOCATION_VIRIDIAN_CITY',
  'HEAL_LOCATION_PEWTER_CITY',
  'HEAL_LOCATION_CERULEAN_CITY',
  'HEAL_LOCATION_LAVENDER_TOWN',
  'HEAL_LOCATION_VERMILION_CITY',
  'HEAL_LOCATION_CELADON_CITY',
  'HEAL_LOCATION_FUCHSIA_CITY',
  'HEAL_LOCATION_CINNABAR_ISLAND',
  'HEAL_LOCATION_INDIGO_PLATEAU',
  'HEAL_LOCATION_SAFFRON_CITY',
  'HEAL_LOCATION_ROUTE4',
  'HEAL_LOCATION_ROUTE10',
  'HEAL_LOCATION_ONE_ISLAND',
  'HEAL_LOCATION_TWO_ISLAND',
  'HEAL_LOCATION_THREE_ISLAND',
  'HEAL_LOCATION_FOUR_ISLAND',
  'HEAL_LOCATION_FIVE_ISLAND',
  'HEAL_LOCATION_SIX_ISLAND',
  'HEAL_LOCATION_SEVEN_ISLAND'
];

const DECOMP_CENTER_MAP_IDS = [
  'MAP_PALLET_TOWN_PLAYERS_HOUSE_1F',
  'MAP_VIRIDIAN_CITY_POKEMON_CENTER_1F',
  'MAP_PEWTER_CITY_POKEMON_CENTER_1F',
  'MAP_CERULEAN_CITY_POKEMON_CENTER_1F',
  'MAP_LAVENDER_TOWN_POKEMON_CENTER_1F',
  'MAP_VERMILION_CITY_POKEMON_CENTER_1F',
  'MAP_CELADON_CITY_POKEMON_CENTER_1F',
  'MAP_FUCHSIA_CITY_POKEMON_CENTER_1F',
  'MAP_CINNABAR_ISLAND_POKEMON_CENTER_1F',
  'MAP_INDIGO_PLATEAU_POKEMON_CENTER_1F',
  'MAP_SAFFRON_CITY_POKEMON_CENTER_1F',
  'MAP_ROUTE4_POKEMON_CENTER_1F',
  'MAP_ROUTE10_POKEMON_CENTER_1F',
  'MAP_ONE_ISLAND_POKEMON_CENTER_1F',
  'MAP_TWO_ISLAND_POKEMON_CENTER_1F',
  'MAP_THREE_ISLAND_POKEMON_CENTER_1F',
  'MAP_FOUR_ISLAND_POKEMON_CENTER_1F',
  'MAP_FIVE_ISLAND_POKEMON_CENTER_1F',
  'MAP_SIX_ISLAND_POKEMON_CENTER_1F',
  'MAP_SEVEN_ISLAND_POKEMON_CENTER_1F'
];

describe('heal locations data parity', () => {
  test('has all 20 decomp heal location ids', () => {
    const ids = HEAL_LOCATIONS.map((loc) => loc.id);
    for (const decompId of DECOMP_HEAL_LOCATION_IDS) {
      expect(ids).toContain(decompId);
    }
    expect(HEAL_LOCATIONS).toHaveLength(20);
  });

  test('all heal locations have correct respawn map', () => {
    const respawnMaps = HEAL_LOCATIONS.map((loc) => loc.respawnMap);
    for (const mapId of DECOMP_CENTER_MAP_IDS) {
      expect(respawnMaps).toContain(mapId);
    }
  });

  test('every heal location has required fields', () => {
    for (const loc of HEAL_LOCATIONS) {
      expect(loc.id).toMatch(/^HEAL_LOCATION_/);
      expect(loc.map).toMatch(/^MAP_/);
      expect(loc.x).toBeGreaterThanOrEqual(0);
      expect(loc.y).toBeGreaterThanOrEqual(0);
      expect(loc.respawnMap).toMatch(/^MAP_/);
      expect(loc.respawnNpc).toMatch(/^LOCALID_/);
      expect(loc.respawnX).toBeGreaterThanOrEqual(0);
      expect(loc.respawnY).toBeGreaterThanOrEqual(0);
    }
  });

  test('no duplicate heal location ids', () => {
    const ids = HEAL_LOCATIONS.map((loc) => loc.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('no duplicate respawn maps', () => {
    const maps = HEAL_LOCATIONS.map((loc) => loc.respawnMap);
    expect(new Set(maps).size).toBe(maps.length);
  });

  test('getHealLocationById finds correct location', () => {
    const loc = getHealLocationById('HEAL_LOCATION_VIRIDIAN_CITY');
    expect(loc).toBeDefined();
    expect(loc!.respawnMap).toBe('MAP_VIRIDIAN_CITY_POKEMON_CENTER_1F');
    expect(loc!.respawnNpc).toBe('LOCALID_VIRIDIAN_NURSE');
  });

  test('getHealLocationById returns undefined for unknown id', () => {
    expect(getHealLocationById('HEAL_LOCATION_NONEXISTENT')).toBeUndefined();
  });

  test('getHealLocationForMap finds location by center map', () => {
    const loc = getHealLocationForMap('MAP_PEWTER_CITY_POKEMON_CENTER_1F');
    expect(loc).toBeDefined();
    expect(loc!.id).toBe('HEAL_LOCATION_PEWTER_CITY');
  });

  test('getHealLocationForMap returns undefined for unknown map', () => {
    expect(getHealLocationForMap('MAP_UNKNOWN')).toBeUndefined();
  });

  test('getHealLocationIdForCenterMap returns correct id', () => {
    expect(getHealLocationIdForCenterMap('MAP_INDIGO_PLATEAU_POKEMON_CENTER_1F')).toBe(
      'HEAL_LOCATION_INDIGO_PLATEAU'
    );
  });
});

describe('respawn state', () => {
  test('setRespawn records location index', () => {
    const runtime = createScriptRuntimeState();
    setRespawn(runtime, 'HEAL_LOCATION_CERULEAN_CITY');
    const loc = getRespawnLocation(runtime);
    expect(loc).toBeDefined();
    expect(loc!.id).toBe('HEAL_LOCATION_CERULEAN_CITY');
  });

  test('setRespawn updates on repeated calls', () => {
    const runtime = createScriptRuntimeState();
    setRespawn(runtime, 'HEAL_LOCATION_VIRIDIAN_CITY');
    setRespawn(runtime, 'HEAL_LOCATION_PEWTER_CITY');
    expect(getRespawnLocation(runtime)!.id).toBe('HEAL_LOCATION_PEWTER_CITY');
  });

  test('getRespawnLocation defaults to Pallet Town', () => {
    const runtime = createScriptRuntimeState();
    expect(getRespawnLocation(runtime)!.id).toBe('HEAL_LOCATION_PALLET_TOWN');
  });

  test('setRespawn ignores unknown location id', () => {
    const runtime = createScriptRuntimeState();
    setRespawn(runtime, 'HEAL_LOCATION_NONEXISTENT');
    expect(getRespawnLocation(runtime)!.id).toBe('HEAL_LOCATION_PALLET_TOWN');
  });
});

describe('nurse script handler', () => {
  test('heals party and sets respawn', () => {
    const handler = createNurseScriptHandler('LOCALID_TEST_NURSE', 'HEAL_LOCATION_VIRIDIAN_CITY');
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runtime.party[0].hp = 1;
    runtime.party[0].status = 'poison';
    runtime.party[1].hp = 5;

    handler({ player, dialogue, runtime });

    expect(runtime.party[0].hp).toBe(runtime.party[0].maxHp);
    expect(runtime.party[0].status).toBe('none');
    expect(runtime.party[1].hp).toBe(runtime.party[1].maxHp);
    expect(getRespawnLocation(runtime)!.id).toBe('HEAL_LOCATION_VIRIDIAN_CITY');
  });

  test('uses correct nurse local id as speaker', () => {
    const handler = createNurseScriptHandler('LOCALID_PEWTER_NURSE', 'HEAL_LOCATION_PEWTER_CITY');
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    handler({ player, dialogue, runtime });

    expect(dialogue.speakerId).toBe('LOCALID_PEWTER_NURSE');
  });

  test('nurse dialogue matches decomp text', () => {
    expect(NURSE_HEAL_DIALOGUE_QUEUE).toEqual([
      NURSE_DIALOGUE.welcome,
      NURSE_DIALOGUE.takePkmn,
      NURSE_DIALOGUE.restored,
      NURSE_DIALOGUE.goodbye
    ]);
    expect(NURSE_DIALOGUE.welcome).toContain('Welcome to our POKeMON CENTER');
    expect(NURSE_DIALOGUE.takePkmn).toContain("I'll take your POKeMON");
    expect(NURSE_DIALOGUE.restored).toContain('restored your POKeMON to full health');
    expect(NURSE_DIALOGUE.goodbye).toContain('We hope to see you again');
  });
});

describe('nurse script registry', () => {
  const nurseScripts = buildNurseScriptEntries();

  const EXPECTED_NURSE_SCRIPTS = [
    'ViridianCity_PokemonCenter_1F_EventScript_Nurse',
    'PewterCity_PokemonCenter_1F_EventScript_Nurse',
    'CeruleanCity_PokemonCenter_1F_EventScript_Nurse',
    'LavenderTown_PokemonCenter_1F_EventScript_Nurse',
    'VermilionCity_PokemonCenter_1F_EventScript_Nurse',
    'CeladonCity_PokemonCenter_1F_EventScript_Nurse',
    'FuchsiaCity_PokemonCenter_1F_EventScript_Nurse',
    'CinnabarIsland_PokemonCenter_1F_EventScript_Nurse',
    'IndigoPlateau_PokemonCenter_1F_EventScript_Nurse',
    'SaffronCity_PokemonCenter_1F_EventScript_Nurse',
    'Route4_PokemonCenter_1F_EventScript_Nurse',
    'Route10_PokemonCenter_1F_EventScript_Nurse',
    'OneIsland_PokemonCenter_1F_EventScript_Nurse',
    'TwoIsland_PokemonCenter_1F_EventScript_Nurse',
    'ThreeIsland_PokemonCenter_1F_EventScript_Nurse',
    'FourIsland_PokemonCenter_1F_EventScript_Nurse',
    'FiveIsland_PokemonCenter_1F_EventScript_Nurse',
    'SixIsland_PokemonCenter_1F_EventScript_Nurse',
    'SevenIsland_PokemonCenter_1F_EventScript_Nurse'
  ];

  test('all 19 center nurse scripts are registered', () => {
    for (const scriptId of EXPECTED_NURSE_SCRIPTS) {
      expect(nurseScripts[scriptId]).toBeDefined();
    }
    expect(Object.keys(nurseScripts)).toHaveLength(19);
  });

  test('each nurse handler heals and sets correct respawn', () => {
    for (const [scriptId, handler] of Object.entries(nurseScripts)) {
      const runtime = createScriptRuntimeState();
      const dialogue = createDialogueState();
      const player = createPlayer();

      runtime.party[0].hp = 1;
      handler({ player, dialogue, runtime });

      expect(runtime.party[0].hp).toBe(runtime.party[0].maxHp);
      expect(dialogue.active).toBe(true);
      expect(dialogue.queue).toHaveLength(4);

      const respawnLoc = getRespawnLocation(runtime);
      expect(respawnLoc).toBeDefined();
      void scriptId;
    }
  });
});

describe('center NPC dialogue registry', () => {
  const npcScripts = buildCenterNpcScriptEntries();

  test('all CENTER_NPC_DIALOGUES have corresponding script handlers', () => {
    for (const npc of CENTER_NPC_DIALOGUES) {
      expect(npcScripts[npc.scriptId]).toBeDefined();
    }
  });

  test('NPC dialogue handlers produce correct dialogue output', () => {
    for (const npc of CENTER_NPC_DIALOGUES) {
      const dialogue = createDialogueState();
      npcScripts[npc.scriptId]({ dialogue });
      expect(dialogue.active).toBe(true);
      expect(dialogue.speakerId).toBe(npc.speakerId);
      expect(dialogue.queue).toEqual(npc.lines);
    }
  });

  test('covers Viridian, Pewter, Cerulean, Lavender, Vermilion, Celadon, Fuchsia, Cinnabar, Saffron, Route4, Route10, Indigo', () => {
    const coveredMaps = new Set<string>();
    for (const npc of CENTER_NPC_DIALOGUES) {
      const match = npc.scriptId.match(/^([A-Za-z0-9]+)_PokemonCenter_1F/);
      if (match) coveredMaps.add(match[1]);
    }
    expect(coveredMaps).toContain('ViridianCity');
    expect(coveredMaps).toContain('PewterCity');
    expect(coveredMaps).toContain('CeruleanCity');
    expect(coveredMaps).toContain('LavenderTown');
    expect(coveredMaps).toContain('VermilionCity');
    expect(coveredMaps).toContain('CeladonCity');
    expect(coveredMaps).toContain('FuchsiaCity');
    expect(coveredMaps).toContain('CinnabarIsland');
    expect(coveredMaps).toContain('SaffronCity');
    expect(coveredMaps).toContain('Route4');
    expect(coveredMaps).toContain('Route10');
    expect(coveredMaps).toContain('IndigoPlateau');
  });
});

describe('getAllCenterScriptHandlers', () => {
  const allScripts = getAllCenterScriptHandlers();

  test('merges nurse and NPC handlers', () => {
    const nurseCount = Object.keys(buildNurseScriptEntries()).length;
    const npcCount = Object.keys(buildCenterNpcScriptEntries()).length;
    expect(Object.keys(allScripts).length).toBe(nurseCount + npcCount);
  });
});

describe('integration with prototypeScriptRegistry', () => {
  test('Viridian nurse still works through global registry', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runtime.party[0].hp = 1;
    runtime.party[0].status = 'poison';

    expect(
      runScriptById('ViridianCity_PokemonCenter_1F_EventScript_Nurse', {
        player,
        dialogue,
        runtime
      })
    ).toBe(true);

    expect(runtime.party[0].hp).toBe(runtime.party[0].maxHp);
    expect(runtime.party[0].status).toBe('none');
    expect(dialogue.queue).toEqual(NURSE_HEAL_DIALOGUE_QUEUE);
  });

  test('Indigo Plateau nurse registered in global registry', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    expect(
      runScriptById('IndigoPlateau_PokemonCenter_1F_EventScript_Nurse', {
        player,
        dialogue,
        runtime
      })
    ).toBe(true);

    expect(runtime.party[0].hp).toBe(runtime.party[0].maxHp);
    expect(dialogue.speakerId).toBe('LOCALID_LEAGUE_NURSE');
  });

  test('Viridian center NPC handlers work through global registry', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runScriptById('ViridianCity_PokemonCenter_1F_EventScript_Boy', {
      player,
      dialogue,
      runtime
    });
    expect(dialogue.queue[0]).toContain("POKeMON CENTER in every town");

    runScriptById('ViridianCity_PokemonCenter_1F_EventScript_Gentleman', {
      player,
      dialogue,
      runtime
    });
    expect(dialogue.queue[0]).toContain('PC in the corner');
  });

  test('Indigo Plateau GymGuy dialogue works through global registry', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runScriptById('IndigoPlateau_PokemonCenter_1F_EventScript_GymGuy', {
      player,
      dialogue,
      runtime
    });
    expect(dialogue.queue).toContain('Yo!');
    expect(dialogue.queue).toContain('Champ in the making!');
  });

  test('Indigo Plateau Clerk is handled by mart template', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runScriptById('IndigoPlateau_PokemonCenter_1F_EventScript_Clerk', {
      player,
      dialogue,
      runtime
    });
    const joined = dialogue.queue.join(' ');
    expect(joined).toContain('May I help you?');
    expect(joined).toContain('ULTRA BALL');
    expect(joined).toContain('Please come again');
  });

  test('Pewter center Jigglypuff dialogue works', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runScriptById('PewterCity_PokemonCenter_1F_EventScript_Jigglypuff', {
      player,
      dialogue,
      runtime
    });
    expect(dialogue.queue).toEqual(['JIGGLYPUFF: Puu pupuu!']);
  });

  test('Saffron center Youngster has Rockets dialogue', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runScriptById('SaffronCity_PokemonCenter_1F_EventScript_Youngster', {
      player,
      dialogue,
      runtime
    });
    expect(dialogue.queue).toContain('Sigh…');
    expect(dialogue.queue).toContain('If the ELITE FOUR came and stomped TEAM ROCKET?');
  });

  test('all 19 nurse scripts accessible through global registry', () => {
    const nurseIds = [
      'ViridianCity_PokemonCenter_1F_EventScript_Nurse',
      'PewterCity_PokemonCenter_1F_EventScript_Nurse',
      'CeruleanCity_PokemonCenter_1F_EventScript_Nurse',
      'LavenderTown_PokemonCenter_1F_EventScript_Nurse',
      'VermilionCity_PokemonCenter_1F_EventScript_Nurse',
      'CeladonCity_PokemonCenter_1F_EventScript_Nurse',
      'FuchsiaCity_PokemonCenter_1F_EventScript_Nurse',
      'CinnabarIsland_PokemonCenter_1F_EventScript_Nurse',
      'IndigoPlateau_PokemonCenter_1F_EventScript_Nurse',
      'SaffronCity_PokemonCenter_1F_EventScript_Nurse',
      'Route4_PokemonCenter_1F_EventScript_Nurse',
      'Route10_PokemonCenter_1F_EventScript_Nurse',
      'OneIsland_PokemonCenter_1F_EventScript_Nurse',
      'TwoIsland_PokemonCenter_1F_EventScript_Nurse',
      'ThreeIsland_PokemonCenter_1F_EventScript_Nurse',
      'FourIsland_PokemonCenter_1F_EventScript_Nurse',
      'FiveIsland_PokemonCenter_1F_EventScript_Nurse',
      'SixIsland_PokemonCenter_1F_EventScript_Nurse',
      'SevenIsland_PokemonCenter_1F_EventScript_Nurse'
    ];

    for (const scriptId of nurseIds) {
      const runtime = createScriptRuntimeState();
      const dialogue = createDialogueState();
      const player = createPlayer();

      const result = runScriptById(scriptId, { player, dialogue, runtime }, prototypeScriptRegistry);
      expect(result).toBe(true);
      expect(dialogue.active).toBe(true);
    }
  });
});
