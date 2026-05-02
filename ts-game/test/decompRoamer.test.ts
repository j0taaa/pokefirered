import { describe, expect, test } from 'vitest';
import {
  ClearRoamerData,
  CreateInitialRoamerMon,
  CreateRoamerMonInstance,
  GetRoamerLocation,
  GetRoamerLocationMapSectionId,
  InitRoamer,
  IsRoamerAt,
  MAP_NUM,
  MAP_UNDEFINED_NUM,
  ROAMER_LOCATIONS,
  ROAMER_MAP_GROUP,
  RoamerMove,
  RoamerMoveToOtherLocationSet,
  SetRoamerInactive,
  SPECIES_BULBASAUR,
  SPECIES_CHARMANDER,
  SPECIES_ENTEI,
  SPECIES_RAIKOU,
  SPECIES_SUICUNE,
  TryStartRoamerEncounter,
  UpdateLocationHistoryForRoamer,
  UpdateRoamerHPStatus,
  clearRoamerData,
  createRoamerMonInstance,
  createRoamerRuntime,
  getRoamerLocation,
  getRoamerLocationMapSectionId,
  getRoamerSpecies,
  initRoamer,
  isRoamerAt,
  roamerMove,
  roamerMoveToOtherLocationSet,
  setRoamerInactive,
  tryStartRoamerEncounter,
  updateLocationHistoryForRoamer,
  updateRoamerHPStatus
} from '../src/game/decompRoamer';
import { createScriptRuntimeState } from '../src/game/scripts';

describe('decomp roamer', () => {
  test('starter species chooses the matching legendary beast exactly like GetRoamerSpecies', () => {
    expect(getRoamerSpecies(SPECIES_BULBASAUR)).toBe(SPECIES_ENTEI);
    expect(getRoamerSpecies(SPECIES_CHARMANDER)).toBe(SPECIES_SUICUNE);
    expect(getRoamerSpecies(7)).toBe(SPECIES_RAIKOU);
  });

  test('clear and init reset state, create the initial mon, and place it in map group 3', () => {
    const runtime = createRoamerRuntime(1);
    runtime.starterSpecies = SPECIES_BULBASAUR;
    runtime.locationHistory[0] = [9, 9];
    runtime.roamerLocation = [8, 8];

    initRoamer(runtime);

    expect(runtime.roamer.active).toBe(true);
    expect(runtime.roamer.species).toBe(SPECIES_ENTEI);
    expect(runtime.roamer.level).toBe(50);
    expect(runtime.roamer.hp).toBe(runtime.enemyParty[0].maxHp);
    expect(runtime.roamerLocation[0]).toBe(ROAMER_MAP_GROUP);
    expect(ROAMER_LOCATIONS.map((set) => set[0])).toContain(runtime.roamerLocation[MAP_NUM]);

    clearRoamerData(runtime);
    expect(runtime.roamer.active).toBe(false);
    expect(runtime.roamerLocation).toEqual([0, 0]);
    expect(runtime.locationHistory).toEqual([[0, 0], [0, 0], [0, 0]]);
  });

  test('location history shifts current, previous, and two-moves-ago slots', () => {
    const runtime = createRoamerRuntime();
    updateLocationHistoryForRoamer(runtime, 3, 19);
    updateLocationHistoryForRoamer(runtime, 3, 20);
    updateLocationHistoryForRoamer(runtime, 3, 21);

    expect(runtime.locationHistory).toEqual([[3, 21], [3, 20], [3, 19]]);
  });

  test('movement follows the current location set and avoids undefined and two-moves-ago maps', () => {
    const runtime = createRoamerRuntime(0);
    runtime.roamer.active = true;
    runtime.roamerLocation = [ROAMER_MAP_GROUP, 19];
    runtime.locationHistory[2] = [ROAMER_MAP_GROUP, 20];

    for (let i = 0; i < 20; i += 1) {
      roamerMove(runtime);
      expect(runtime.roamerLocation[0]).toBe(ROAMER_MAP_GROUP);
      expect(runtime.roamerLocation[1]).not.toBe(MAP_UNDEFINED_NUM);
      expect(runtime.roamerLocation[1]).not.toBe(20);
      runtime.roamerLocation[1] = 19;
    }
  });

  test('move-to-other-set never keeps the same starting map', () => {
    const runtime = createRoamerRuntime(2);
    runtime.roamer.active = true;
    runtime.roamerLocation = [ROAMER_MAP_GROUP, 19];

    roamerMoveToOtherLocationSet(runtime);

    expect(runtime.roamerLocation[0]).toBe(ROAMER_MAP_GROUP);
    expect(runtime.roamerLocation[1]).not.toBe(19);
    expect(ROAMER_LOCATIONS.map((set) => set[0])).toContain(runtime.roamerLocation[1]);
  });

  test('encounter, HP/status update, inactive state, and map section lookup match exported API behavior', () => {
    const runtime = createRoamerRuntime(0);
    runtime.roamer.active = true;
    runtime.roamer.species = SPECIES_RAIKOU;
    runtime.roamer.level = 50;
    runtime.roamer.ivs = 123;
    runtime.roamer.personality = 456;
    runtime.roamer.hp = 77;
    runtime.roamerLocation = [ROAMER_MAP_GROUP, 23];
    runtime.mapSectionByLocation['3:23'] = 88;

    expect(isRoamerAt(runtime, ROAMER_MAP_GROUP, 23)).toBe(true);
    expect(getRoamerLocation(runtime)).toEqual({ mapGroup: ROAMER_MAP_GROUP, mapNum: 23 });
    expect(getRoamerLocationMapSectionId(runtime)).toBe(88);
    expect(tryStartRoamerEncounter(runtime, ROAMER_MAP_GROUP, 24)).toBe(false);

    const mon = createRoamerMonInstance(runtime);
    expect(mon.species).toBe(SPECIES_RAIKOU);
    expect(mon.hp).toBe(77);

    updateRoamerHPStatus(runtime, { hp: 12, status: 3 });
    expect(runtime.roamer.hp).toBe(12);
    expect(runtime.roamer.status).toBe(3);

    setRoamerInactive(runtime);
    expect(isRoamerAt(runtime, runtime.roamerLocation[0], runtime.roamerLocation[1])).toBe(false);
    expect(getRoamerLocationMapSectionId(runtime)).toBe(0);
  });

  test('script runtime owns roamer state for the InitRoamer field special hook', () => {
    const runtime = createScriptRuntimeState();
    runtime.roamer.starterSpecies = SPECIES_CHARMANDER;
    initRoamer(runtime.roamer);

    expect(runtime.roamer.roamer.active).toBe(true);
    expect(runtime.roamer.roamer.species).toBe(SPECIES_SUICUNE);
  });

  test('exact C-name roamer exports preserve init, history, movement, encounter, status, inactive, and location APIs', () => {
    const runtime = createRoamerRuntime(1);
    runtime.starterSpecies = SPECIES_BULBASAUR;

    InitRoamer(runtime);
    expect(runtime.roamer.active).toBe(true);
    expect(runtime.roamer.species).toBe(SPECIES_ENTEI);
    expect(runtime.roamerLocation[0]).toBe(ROAMER_MAP_GROUP);

    ClearRoamerData(runtime);
    expect(runtime.roamer.active).toBe(false);
    expect(runtime.roamerLocation).toEqual([0, 0]);

    CreateInitialRoamerMon(runtime);
    expect(runtime.roamer.active).toBe(true);
    expect(runtime.roamer.level).toBe(50);

    UpdateLocationHistoryForRoamer(runtime, 3, 19);
    UpdateLocationHistoryForRoamer(runtime, 3, 20);
    UpdateLocationHistoryForRoamer(runtime, 3, 21);
    expect(runtime.locationHistory).toEqual([[3, 21], [3, 20], [3, 19]]);

    runtime.roamerLocation = [ROAMER_MAP_GROUP, 19];
    runtime.locationHistory[2] = [ROAMER_MAP_GROUP, 20];
    RoamerMove(runtime);
    expect(runtime.roamerLocation[0]).toBe(ROAMER_MAP_GROUP);
    expect(runtime.roamerLocation[1]).not.toBe(MAP_UNDEFINED_NUM);
    expect(runtime.roamerLocation[1]).not.toBe(20);

    const previousMap = runtime.roamerLocation[1];
    RoamerMoveToOtherLocationSet(runtime);
    expect(runtime.roamerLocation[1]).not.toBe(previousMap);

    runtime.roamer.species = SPECIES_RAIKOU;
    runtime.roamer.level = 50;
    runtime.roamer.ivs = 123;
    runtime.roamer.personality = 456;
    runtime.roamer.hp = 77;
    runtime.roamerLocation = [ROAMER_MAP_GROUP, 23];
    runtime.mapSectionByLocation['3:23'] = 88;

    expect(IsRoamerAt(runtime, ROAMER_MAP_GROUP, 23)).toBe(true);
    expect(GetRoamerLocation(runtime)).toEqual({ mapGroup: ROAMER_MAP_GROUP, mapNum: 23 });
    expect(GetRoamerLocationMapSectionId(runtime)).toBe(88);
    expect(TryStartRoamerEncounter(runtime, ROAMER_MAP_GROUP, 24)).toBe(false);
    expect(CreateRoamerMonInstance(runtime)).toMatchObject({ species: SPECIES_RAIKOU, hp: 77 });

    UpdateRoamerHPStatus(runtime, { hp: 11, status: 4 });
    expect(runtime.roamer.hp).toBe(11);
    expect(runtime.roamer.status).toBe(4);

    SetRoamerInactive(runtime);
    expect(IsRoamerAt(runtime, runtime.roamerLocation[0], runtime.roamerLocation[1])).toBe(false);
    expect(GetRoamerLocationMapSectionId(runtime)).toBe(0);
  });
});
