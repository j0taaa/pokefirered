import { describe, expect, test } from 'vitest';
// @ts-ignore Vitest imports the ESM exporter directly for parity checks.
import { exportMap } from '../scripts/export-decomp-map.mjs';
import {
  loadPalletTownProfessorOaksLabMap,
  mapFromCompactSource,
  parseCompactMapSource,
  type CompactMapSource
} from '../src/world/mapSource';
import palletTownProfessorOaksLabMapJson from '../src/world/maps/palletTownProfessorOaksLab.json';

const toWalkable = (collisionRows: string[]): boolean[] =>
  collisionRows.flatMap((row) => [...row].map((tile) => tile === '.'));

const toEncounterTiles = (encounterRows: string[]): string[] => encounterRows.flatMap((row) => [...row]);

describe("Pallet Town Professor Oak's Lab compact map source", () => {
  test('matches the decomp exporter output exactly', () => {
    expect(palletTownProfessorOaksLabMapJson).toEqual(exportMap('PalletTown_ProfessorOaksLab'));
  });

  test("loads Professor Oak's Lab into the runtime tile map shape", () => {
    const exported = exportMap('PalletTown_ProfessorOaksLab');
    const map = loadPalletTownProfessorOaksLabMap();

    expect(map.id).toBe(exported.id);
    expect(map.width).toBe(exported.width);
    expect(map.height).toBe(exported.height);
    expect(map.tileSize).toBe(exported.tileSize);
    expect(map.walkable).toEqual(toWalkable(exported.collisionRows));
    expect(map.connections).toEqual([]);
    expect(map.encounterTiles).toEqual(toEncounterTiles(exported.encounterRows));
    expect(map.wildEncounters).toEqual(undefined);
    expect(map.triggers).toEqual(exported.triggers);
    expect(map.visual).toEqual(exported.visual);
    expect(map.npcs).toEqual(exported.npcs);
    expect(map.hiddenItems).toEqual([]);
    expect(map.warps).toEqual(exported.warps);
  });

  test('validates compact rows and preserves Oak Lab starter-table, NPC, and warp parity', () => {
    const baseSource = palletTownProfessorOaksLabMapJson as CompactMapSource & { encounterRows: string[] };

    expect(() => parseCompactMapSource({
      ...baseSource,
      collisionRows: baseSource.collisionRows.slice(0, -1)
    })).toThrow(/collision rows/i);

    expect(() => parseCompactMapSource({
      ...baseSource,
      encounterRows: ['X'.repeat(baseSource.width), ...baseSource.encounterRows.slice(1)]
    })).toThrow(/encounterRows/i);

    const compactSource = parseCompactMapSource(palletTownProfessorOaksLabMapJson);
    const map = mapFromCompactSource(compactSource);

    expect(map.encounterTiles).toEqual(toEncounterTiles(compactSource.encounterRows ?? []));
    expect(map.triggers).toEqual([
      {
        id: 'PalletTown_ProfessorOaksLab_EventScript_LeaveStarterSceneTrigger',
        x: 5,
        y: 8,
        activation: 'step',
        scriptId: 'PalletTown_ProfessorOaksLab_EventScript_LeaveStarterSceneTrigger',
        facing: 'any',
        once: false,
        conditionVar: 'VAR_MAP_SCENE_PALLET_TOWN_PROFESSOR_OAKS_LAB',
        conditionEquals: 2
      },
      {
        id: 'PalletTown_ProfessorOaksLab_EventScript_LeaveStarterSceneTrigger',
        x: 6,
        y: 8,
        activation: 'step',
        scriptId: 'PalletTown_ProfessorOaksLab_EventScript_LeaveStarterSceneTrigger',
        facing: 'any',
        once: false,
        conditionVar: 'VAR_MAP_SCENE_PALLET_TOWN_PROFESSOR_OAKS_LAB',
        conditionEquals: 2
      },
      {
        id: 'PalletTown_ProfessorOaksLab_EventScript_LeaveStarterSceneTrigger',
        x: 7,
        y: 8,
        activation: 'step',
        scriptId: 'PalletTown_ProfessorOaksLab_EventScript_LeaveStarterSceneTrigger',
        facing: 'any',
        once: false,
        conditionVar: 'VAR_MAP_SCENE_PALLET_TOWN_PROFESSOR_OAKS_LAB',
        conditionEquals: 2
      },
      {
        id: 'PalletTown_ProfessorOaksLab_EventScript_RivalBattleTriggerLeft',
        x: 5,
        y: 8,
        activation: 'step',
        scriptId: 'PalletTown_ProfessorOaksLab_EventScript_RivalBattleTriggerLeft',
        facing: 'any',
        once: false,
        conditionVar: 'VAR_MAP_SCENE_PALLET_TOWN_PROFESSOR_OAKS_LAB',
        conditionEquals: 3
      },
      {
        id: 'PalletTown_ProfessorOaksLab_EventScript_RivalBattleTriggerMid',
        x: 6,
        y: 8,
        activation: 'step',
        scriptId: 'PalletTown_ProfessorOaksLab_EventScript_RivalBattleTriggerMid',
        facing: 'any',
        once: false,
        conditionVar: 'VAR_MAP_SCENE_PALLET_TOWN_PROFESSOR_OAKS_LAB',
        conditionEquals: 3
      },
      {
        id: 'PalletTown_ProfessorOaksLab_EventScript_RivalBattleTriggerRight',
        x: 7,
        y: 8,
        activation: 'step',
        scriptId: 'PalletTown_ProfessorOaksLab_EventScript_RivalBattleTriggerRight',
        facing: 'any',
        once: false,
        conditionVar: 'VAR_MAP_SCENE_PALLET_TOWN_PROFESSOR_OAKS_LAB',
        conditionEquals: 3
      },
      {
        id: 'PalletTown_ProfessorOaksLab_EventScript_Computer',
        x: 2,
        y: 1,
        activation: 'interact',
        scriptId: 'PalletTown_ProfessorOaksLab_EventScript_Computer',
        facing: 'any',
        once: false
      },
      {
        id: 'PalletTown_ProfessorOaksLab_EventScript_Computer',
        x: 3,
        y: 1,
        activation: 'interact',
        scriptId: 'PalletTown_ProfessorOaksLab_EventScript_Computer',
        facing: 'any',
        once: false
      },
      {
        id: 'PalletTown_ProfessorOaksLab_EventScript_LeftSign',
        x: 6,
        y: 1,
        activation: 'interact',
        scriptId: 'PalletTown_ProfessorOaksLab_EventScript_LeftSign',
        facing: 'any',
        once: false
      },
      {
        id: 'PalletTown_ProfessorOaksLab_EventScript_RightSign',
        x: 7,
        y: 1,
        activation: 'interact',
        scriptId: 'PalletTown_ProfessorOaksLab_EventScript_RightSign',
        facing: 'any',
        once: false
      }
    ]);
    expect(map.warps).toEqual([
      { x: 6, y: 12, elevation: 3, destMap: 'MAP_PALLET_TOWN', destWarpId: 2 },
      { x: 7, y: 12, elevation: 3, destMap: 'MAP_PALLET_TOWN', destWarpId: 2 },
      { x: 5, y: 12, elevation: 3, destMap: 'MAP_PALLET_TOWN', destWarpId: 2 }
    ]);
    expect(map.npcs).toEqual([
      {
        id: 'PalletTown_ProfessorOaksLab_ObjectEvent_Aide1',
        x: 3,
        y: 11,
        graphicsId: 'OBJ_EVENT_GFX_SCIENTIST',
        movementType: 'MOVEMENT_TYPE_LOOK_AROUND',
        movementRangeX: 0,
        movementRangeY: 0,
        trainerType: 'TRAINER_TYPE_NONE',
        trainerSightOrBerryTreeId: 0,
        scriptId: 'PalletTown_ProfessorOaksLab_EventScript_Aide1',
        flag: '0'
      },
      {
        id: 'PalletTown_ProfessorOaksLab_ObjectEvent_Aide3',
        x: 2,
        y: 10,
        graphicsId: 'OBJ_EVENT_GFX_WORKER_F',
        movementType: 'MOVEMENT_TYPE_WANDER_UP_AND_DOWN',
        movementRangeX: 0,
        movementRangeY: 4,
        trainerType: 'TRAINER_TYPE_NONE',
        trainerSightOrBerryTreeId: 0,
        scriptId: 'PalletTown_ProfessorOaksLab_EventScript_Aide3',
        flag: '0'
      },
      {
        id: 'PalletTown_ProfessorOaksLab_ObjectEvent_Aide2',
        x: 11,
        y: 10,
        graphicsId: 'OBJ_EVENT_GFX_SCIENTIST',
        movementType: 'MOVEMENT_TYPE_LOOK_AROUND',
        movementRangeX: 0,
        movementRangeY: 0,
        trainerType: 'TRAINER_TYPE_NONE',
        trainerSightOrBerryTreeId: 0,
        scriptId: 'PalletTown_ProfessorOaksLab_EventScript_Aide2',
        flag: '0'
      },
      {
        id: 'LOCALID_OAKS_LAB_PROF_OAK',
        x: 6,
        y: 3,
        graphicsId: 'OBJ_EVENT_GFX_PROF_OAK',
        movementType: 'MOVEMENT_TYPE_FACE_DOWN',
        movementRangeX: 1,
        movementRangeY: 1,
        trainerType: 'TRAINER_TYPE_NONE',
        trainerSightOrBerryTreeId: 0,
        scriptId: 'PalletTown_ProfessorOaksLab_EventScript_ProfOak',
        flag: 'FLAG_HIDE_OAK_IN_HIS_LAB'
      },
      {
        id: 'LOCALID_BULBASAUR_BALL',
        x: 8,
        y: 4,
        graphicsId: 'OBJ_EVENT_GFX_ITEM_BALL',
        movementType: 'MOVEMENT_TYPE_FACE_DOWN',
        movementRangeX: 1,
        movementRangeY: 1,
        trainerType: 'TRAINER_TYPE_NONE',
        trainerSightOrBerryTreeId: 0,
        scriptId: 'PalletTown_ProfessorOaksLab_EventScript_BulbasaurBall',
        flag: 'FLAG_HIDE_BULBASAUR_BALL'
      },
      {
        id: 'LOCALID_SQUIRTLE_BALL',
        x: 9,
        y: 4,
        graphicsId: 'OBJ_EVENT_GFX_ITEM_BALL',
        movementType: 'MOVEMENT_TYPE_FACE_DOWN',
        movementRangeX: 1,
        movementRangeY: 1,
        trainerType: 'TRAINER_TYPE_NONE',
        trainerSightOrBerryTreeId: 0,
        scriptId: 'PalletTown_ProfessorOaksLab_EventScript_SquirtleBall',
        flag: 'FLAG_HIDE_SQUIRTLE_BALL'
      },
      {
        id: 'LOCALID_CHARMANDER_BALL',
        x: 10,
        y: 4,
        graphicsId: 'OBJ_EVENT_GFX_ITEM_BALL',
        movementType: 'MOVEMENT_TYPE_FACE_DOWN',
        movementRangeX: 1,
        movementRangeY: 1,
        trainerType: 'TRAINER_TYPE_NONE',
        trainerSightOrBerryTreeId: 0,
        scriptId: 'PalletTown_ProfessorOaksLab_EventScript_CharmanderBall',
        flag: 'FLAG_HIDE_CHARMANDER_BALL'
      },
      {
        id: 'LOCALID_OAKS_LAB_RIVAL',
        x: 5,
        y: 4,
        graphicsId: 'OBJ_EVENT_GFX_BLUE',
        movementType: 'MOVEMENT_TYPE_FACE_DOWN',
        movementRangeX: 1,
        movementRangeY: 1,
        trainerType: 'TRAINER_TYPE_NONE',
        trainerSightOrBerryTreeId: 0,
        scriptId: 'PalletTown_ProfessorOaksLab_EventScript_Rival',
        flag: 'FLAG_HIDE_RIVAL_IN_LAB'
      },
      {
        id: 'LOCALID_POKEDEX_1',
        x: 4,
        y: 1,
        graphicsId: 'OBJ_EVENT_GFX_POKEDEX',
        movementType: 'MOVEMENT_TYPE_FACE_DOWN',
        movementRangeX: 1,
        movementRangeY: 1,
        trainerType: 'TRAINER_TYPE_NONE',
        trainerSightOrBerryTreeId: 0,
        scriptId: 'PalletTown_ProfessorOaksLab_EventScript_Pokedex',
        flag: 'FLAG_HIDE_POKEDEX'
      },
      {
        id: 'LOCALID_POKEDEX_2',
        x: 5,
        y: 1,
        graphicsId: 'OBJ_EVENT_GFX_POKEDEX',
        movementType: 'MOVEMENT_TYPE_FACE_DOWN',
        movementRangeX: 1,
        movementRangeY: 1,
        trainerType: 'TRAINER_TYPE_NONE',
        trainerSightOrBerryTreeId: 0,
        scriptId: 'PalletTown_ProfessorOaksLab_EventScript_Pokedex',
        flag: 'FLAG_HIDE_POKEDEX'
      }
    ]);
  });
});
