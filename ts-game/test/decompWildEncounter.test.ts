import { describe, expect, it } from 'vitest';
import {
  ABILITY_ILLUMINATE,
  ABILITY_STENCH,
  AddToWildEncounterRateBuff,
  ApplyCleanseTagEncounterRateMod,
  ApplyFluteEncounterRateMod,
  ChooseWildMonIndex_Fishing,
  ChooseWildMonIndex_Land,
  ChooseWildMonIndex_WaterRock,
  ChooseWildMonLevel,
  createWildEncounterRuntime,
  DisableWildEncounters,
  DoesCurrentMapHaveFishingMons,
  DoGlobalWildEncounterDiceRoll,
  DoWildEncounterRateTest,
  FishingWildEncounter,
  FLAG_SYS_UNLOCKED_TANOBY_RUINS,
  FLAG_SYS_BLACK_FLUTE_ACTIVE,
  FLAG_SYS_WHITE_FLUTE_ACTIVE,
  GAME_STAT_FISHING_CAPTURES,
  GenerateUnownPersonalityByLetter,
  GetAbilityEncounterRateModType,
  GetCurrentMapWildMonHeaderId,
  GetFluteEncounterRateModType,
  GetLocalWaterMon,
  GetLocalWildMon,
  GetMapBaseEncounterCooldown,
  GetUnownLetterByPersonalityLoByte,
  HandleWildEncounterCooldown,
  HEADER_NONE,
  ITEM_CLEANSE_TAG,
  IsWildLevelAllowedByRepel,
  IsLeadMonHoldingCleanseTag,
  MAP_SEVEN_ISLAND_TANOBY_RUINS_GROUP,
  MAP_SEVEN_ISLAND_TANOBY_RUINS_MONEAN_CHAMBER_NUM,
  MAP_SIX_ISLAND_ALTERING_CAVE_GROUP,
  MAP_SIX_ISLAND_ALTERING_CAVE_NUM,
  mapGridSetMetatileAttributesAt,
  makeMetatileAttrs,
  PLAYER_AVATAR_FLAG_MACH_BIKE,
  PLAYER_AVATAR_FLAG_SURFING,
  QL_STATE_PLAYBACK,
  RockSmashWildEncounter,
  SeedWildEncounterRng,
  SPECIES_NONE,
  SPECIES_UNOWN,
  StandardWildEncounter,
  SweetScentWildEncounter,
  TILE_ENCOUNTER_LAND,
  TILE_ENCOUNTER_NONE,
  TILE_ENCOUNTER_WATER,
  TryGenerateWildMon,
  TryStandardWildEncounter,
  UnlockedTanobyOrAreNotInTanoby,
  UpdateRepelCounter,
  VAR_ALTERING_CAVE_WILD_SET,
  VAR_REPEL_STEP_COUNT,
  varGet,
  varSet,
  WILD_AREA_LAND,
  WILD_CHECK_KEEN_EYE,
  WILD_CHECK_REPEL,
  WildEncounterRandom,
  type WildPokemonHeader,
  type WildPokemonInfo
} from '../src/game/decompWildEncounter';
import { GOOD_ROD, OLD_ROD, SUPER_ROD } from '../src/game/decompFishing';

const mons = (prefix: string, count: number, encounterRate = 50): WildPokemonInfo => ({
  encounterRate,
  wildPokemon: Array.from({ length: count }, (_, i) => ({
    minLevel: i + 2,
    maxLevel: i + 4,
    species: `${prefix}${i}`
  }))
});

const header = (overrides: Partial<WildPokemonHeader> = {}): WildPokemonHeader => ({
  mapGroup: 1,
  mapNum: 1,
  landMonsInfo: mons('L', 12),
  waterMonsInfo: mons('W', 5),
  rockSmashMonsInfo: mons('R', 5),
  fishingMonsInfo: mons('F', 10),
  ...overrides
});

describe('decompWildEncounter', () => {
  it('matches the land, water/rock, and fishing cumulative slot thresholds', () => {
    const runtime = createWildEncounterRuntime();
    runtime.randomQueue.push(0, 19, 20, 39, 40, 49, 50, 59, 60, 69, 70, 79, 80, 84, 85, 89, 90, 93, 94, 97, 98, 99);
    expect(Array.from({ length: 12 }, () => ChooseWildMonIndex_Land(runtime))).toEqual([0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5]);
    expect(Array.from({ length: 5 }, () => ChooseWildMonIndex_Land(runtime))).toEqual([6, 6, 7, 7, 8]);
    expect(Array.from({ length: 5 }, () => ChooseWildMonIndex_Land(runtime))).toEqual([8, 9, 9, 10, 11]);

    runtime.randomQueue.push(0, 59, 60, 89, 90, 94, 95, 98, 99);
    expect(Array.from({ length: 9 }, () => ChooseWildMonIndex_WaterRock(runtime))).toEqual([0, 0, 1, 1, 2, 2, 3, 3, 4]);

    runtime.randomQueue.push(69, 70, 59, 60, 80, 39, 40, 80, 95, 99);
    expect(ChooseWildMonIndex_Fishing(runtime, OLD_ROD)).toBe(0);
    expect(ChooseWildMonIndex_Fishing(runtime, OLD_ROD)).toBe(1);
    expect(ChooseWildMonIndex_Fishing(runtime, GOOD_ROD)).toBe(2);
    expect(ChooseWildMonIndex_Fishing(runtime, GOOD_ROD)).toBe(3);
    expect(ChooseWildMonIndex_Fishing(runtime, GOOD_ROD)).toBe(4);
    expect(ChooseWildMonIndex_Fishing(runtime, SUPER_ROD)).toBe(5);
    expect(ChooseWildMonIndex_Fishing(runtime, SUPER_ROD)).toBe(6);
    expect(ChooseWildMonIndex_Fishing(runtime, SUPER_ROD)).toBe(7);
    expect(ChooseWildMonIndex_Fishing(runtime, SUPER_ROD)).toBe(8);
    expect(ChooseWildMonIndex_Fishing(runtime, SUPER_ROD)).toBe(9);
  });

  it('swaps reversed level bounds and uses inclusive modulo like C', () => {
    const runtime = createWildEncounterRuntime();
    runtime.randomQueue.push(0, 2, 3);
    expect(ChooseWildMonLevel(runtime, { species: 'A', minLevel: 7, maxLevel: 5 })).toBe(5);
    expect(ChooseWildMonLevel(runtime, { species: 'A', minLevel: 7, maxLevel: 5 })).toBe(7);
    expect(ChooseWildMonLevel(runtime, { species: 'A', minLevel: 7, maxLevel: 5 })).toBe(5);
  });

  it('looks up current map headers with Altering Cave offsets and locked Tanoby gating', () => {
    const runtime = createWildEncounterRuntime([
      header({ mapGroup: MAP_SIX_ISLAND_ALTERING_CAVE_GROUP, mapNum: MAP_SIX_ISLAND_ALTERING_CAVE_NUM }),
      header({ mapGroup: MAP_SIX_ISLAND_ALTERING_CAVE_GROUP, mapNum: MAP_SIX_ISLAND_ALTERING_CAVE_NUM, landMonsInfo: mons('AC1', 12) }),
      header({ mapGroup: MAP_SIX_ISLAND_ALTERING_CAVE_GROUP, mapNum: MAP_SIX_ISLAND_ALTERING_CAVE_NUM, landMonsInfo: mons('AC2', 12) }),
      header({ mapGroup: MAP_SEVEN_ISLAND_TANOBY_RUINS_GROUP, mapNum: MAP_SEVEN_ISLAND_TANOBY_RUINS_MONEAN_CHAMBER_NUM })
    ]);
    runtime.saveBlock1.location = { mapGroup: MAP_SIX_ISLAND_ALTERING_CAVE_GROUP, mapNum: MAP_SIX_ISLAND_ALTERING_CAVE_NUM };
    varSet(runtime, VAR_ALTERING_CAVE_WILD_SET, 2);
    expect(GetCurrentMapWildMonHeaderId(runtime)).toBe(2);
    varSet(runtime, VAR_ALTERING_CAVE_WILD_SET, 99);
    expect(GetCurrentMapWildMonHeaderId(runtime)).toBe(0);

    runtime.saveBlock1.location = { mapGroup: MAP_SEVEN_ISLAND_TANOBY_RUINS_GROUP, mapNum: MAP_SEVEN_ISLAND_TANOBY_RUINS_MONEAN_CHAMBER_NUM };
    expect(UnlockedTanobyOrAreNotInTanoby(runtime)).toBe(false);
    expect(GetCurrentMapWildMonHeaderId(runtime)).toBe(HEADER_NONE);
    runtime.flags.add(FLAG_SYS_UNLOCKED_TANOBY_RUINS);
    expect(UnlockedTanobyOrAreNotInTanoby(runtime)).toBe(true);
    expect(GetCurrentMapWildMonHeaderId(runtime)).toBe(3);
  });

  it('keeps repel checks exact, including the flags equality quirk', () => {
    const runtime = createWildEncounterRuntime([header()]);
    varSet(runtime, VAR_REPEL_STEP_COUNT, 10);
    runtime.playerParty = [{ hp: 0, level: 99 }, { hp: 7, level: 20, isEgg: true }, { hp: 1, level: 20 }];
    expect(IsWildLevelAllowedByRepel(runtime, 19)).toBe(false);
    expect(IsWildLevelAllowedByRepel(runtime, 20)).toBe(true);
    runtime.randomQueue.push(0, 0, 0, 0);
    expect(TryGenerateWildMon(runtime, runtime.wildMonHeaders[0].landMonsInfo!, WILD_AREA_LAND, WILD_CHECK_REPEL | WILD_CHECK_KEEN_EYE)).toBe(true);
    expect(runtime.enemyParty[0]).toMatchObject({ species: 'L0', level: 2 });
    runtime.enemyParty = [];
    runtime.randomQueue.push(0, 0);
    expect(TryGenerateWildMon(runtime, runtime.wildMonHeaders[0].landMonsInfo!, WILD_AREA_LAND, WILD_CHECK_REPEL)).toBe(false);
    expect(runtime.enemyParty).toEqual([]);
  });

  it('generates Unown letters using the same personality low-byte macro', () => {
    const runtime = createWildEncounterRuntime();
    runtime.randomQueue.push(0, 0, 0, 1);
    expect(GetUnownLetterByPersonalityLoByte(0)).toBe(0);
    expect(GenerateUnownPersonalityByLetter(runtime, 1)).toBe(1);
  });

  it('uses the ISO_RANDOMIZE2 stream for wild encounter rate dice rolls', () => {
    const runtime = createWildEncounterRuntime();
    SeedWildEncounterRng(runtime, 0);
    expect(WildEncounterRandom(runtime)).toBe(0);
    expect(WildEncounterRandom(runtime)).toBe(54236);
  });

  it('applies bike, buff, flute, cleanse tag, ability, and cap modifiers in rate tests', () => {
    const runtime = createWildEncounterRuntime();
    runtime.playerAvatarFlags = PLAYER_AVATAR_FLAG_MACH_BIKE;
    runtime.flags.add(FLAG_SYS_WHITE_FLUTE_ACTIVE);
    runtime.sWildEncounterData.encounterRateBuff = 200;
    runtime.sWildEncounterData.leadMonHeldItem = ITEM_CLEANSE_TAG;
    runtime.sWildEncounterData.abilityEffect = ABILITY_STENCH === 1 ? 1 : 0;
    runtime.sWildEncounterData.rngState = 0;
    expect(DoWildEncounterRateTest(runtime, 100, false)).toBe(true);

    const capped = createWildEncounterRuntime();
    capped.sWildEncounterData.abilityEffect = 2;
    capped.sWildEncounterData.rngState = 0;
    expect(DoWildEncounterRateTest(capped, 1000, false)).toBe(true);
  });

  it('exact C-name encounter-rate helpers preserve flute, cleanse tag, and repel buff behavior', () => {
    const runtime = createWildEncounterRuntime();
    expect(GetFluteEncounterRateModType(runtime)).toBe(0);
    expect(ApplyFluteEncounterRateMod(runtime, 100)).toBe(100);

    runtime.flags.add(FLAG_SYS_WHITE_FLUTE_ACTIVE);
    expect(GetFluteEncounterRateModType(runtime)).toBe(1);
    expect(ApplyFluteEncounterRateMod(runtime, 100)).toBe(150);
    runtime.flags.delete(FLAG_SYS_WHITE_FLUTE_ACTIVE);
    runtime.flags.add(FLAG_SYS_BLACK_FLUTE_ACTIVE);
    expect(GetFluteEncounterRateModType(runtime)).toBe(2);
    expect(ApplyFluteEncounterRateMod(runtime, 101)).toBe(50);

    expect(IsLeadMonHoldingCleanseTag(runtime)).toBe(false);
    expect(ApplyCleanseTagEncounterRateMod(runtime, 99)).toBe(99);
    runtime.sWildEncounterData.leadMonHeldItem = ITEM_CLEANSE_TAG;
    expect(IsLeadMonHoldingCleanseTag(runtime)).toBe(true);
    expect(ApplyCleanseTagEncounterRateMod(runtime, 99)).toBe(66);

    AddToWildEncounterRateBuff(runtime, 40);
    expect(runtime.sWildEncounterData.encounterRateBuff).toBe(40);
    varSet(runtime, VAR_REPEL_STEP_COUNT, 1);
    AddToWildEncounterRateBuff(runtime, 40);
    expect(runtime.sWildEncounterData.encounterRateBuff).toBe(0);
  });

  it('reads the lead ability exactly once into abilityEffect unless the lead is a sanity egg', () => {
    const runtime = createWildEncounterRuntime();
    runtime.playerParty = [{ hp: 1, level: 5, ability: ABILITY_STENCH }];
    expect(GetAbilityEncounterRateModType(runtime)).toBe(1);
    runtime.playerParty[0] = { hp: 1, level: 5, ability: ABILITY_ILLUMINATE };
    expect(GetAbilityEncounterRateModType(runtime)).toBe(2);
    runtime.playerParty[0] = { hp: 1, level: 5, ability: ABILITY_ILLUMINATE, sanityIsEgg: true };
    expect(GetAbilityEncounterRateModType(runtime)).toBe(0);
  });

  it('runs standard land encounters, rate failures, roamer branches, and disabled guard', () => {
    const runtime = createWildEncounterRuntime([header({ landMonsInfo: mons('L', 12, 50) })]);
    const land = makeMetatileAttrs(2, TILE_ENCOUNTER_LAND);
    DisableWildEncounters(runtime, true);
    expect(StandardWildEncounter(runtime, land, 2)).toBe(false);
    DisableWildEncounters(runtime, false);

    SeedWildEncounterRng(runtime, 0);
    runtime.sWildEncounterData.rngState = 1;
    expect(StandardWildEncounter(runtime, land, 2)).toBe(false);
    expect(runtime.sWildEncounterData.encounterRateBuff).toBe(50);

    runtime.sWildEncounterData.rngState = 0;
    runtime.tryStartRoamerEncounterResult = true;
    varSet(runtime, VAR_REPEL_STEP_COUNT, 1);
    runtime.saveBlock1.roamer.level = 10;
    runtime.playerParty = [{ hp: 1, level: 20 }];
    expect(StandardWildEncounter(runtime, land, 2)).toBe(false);
    runtime.saveBlock1.roamer.level = 20;
    runtime.sWildEncounterData.rngState = 0;
    expect(StandardWildEncounter(runtime, land, 2)).toBe(true);
    expect(runtime.operations.at(-1)).toBe('StartRoamerBattle');
  });

  it('runs normal water, bridge-surfing, rock smash, sweet scent, and fishing side effects', () => {
    const runtime = createWildEncounterRuntime([header()]);
    const water = makeMetatileAttrs(4, TILE_ENCOUNTER_WATER);
    runtime.sWildEncounterData.rngState = 0;
    runtime.randomQueue.push(0, 0, 0);
    expect(StandardWildEncounter(runtime, water, 4)).toBe(true);
    expect(runtime.enemyParty[0]).toMatchObject({ species: 'W0', level: 2 });
    expect(runtime.operations.at(-1)).toBe('StartWildBattle');

    const bridgeRuntime = createWildEncounterRuntime([header()]);
    bridgeRuntime.playerAvatarFlags = PLAYER_AVATAR_FLAG_SURFING;
    bridgeRuntime.metatileBehaviorIsBridge = (behavior) => behavior === 77;
    bridgeRuntime.sWildEncounterData.rngState = 0;
    bridgeRuntime.randomQueue.push(0, 0, 0);
    expect(StandardWildEncounter(bridgeRuntime, makeMetatileAttrs(77, TILE_ENCOUNTER_NONE), 77)).toBe(true);

    const rockRuntime = createWildEncounterRuntime([header()]);
    rockRuntime.sWildEncounterData.rngState = 0;
    rockRuntime.randomQueue.push(0, 0, 0);
    RockSmashWildEncounter(rockRuntime);
    expect(rockRuntime.specialVarResult).toBe(true);
    expect(rockRuntime.enemyParty[0].species).toBe('R0');

    const scentRuntime = createWildEncounterRuntime([header()]);
    mapGridSetMetatileAttributesAt(scentRuntime, 3, 4, makeMetatileAttrs(1, TILE_ENCOUNTER_LAND));
    scentRuntime.playerDestCoords = { x: 3, y: 4 };
    scentRuntime.randomQueue.push(99, 0, 0);
    expect(SweetScentWildEncounter(scentRuntime)).toBe(true);
    expect(scentRuntime.enemyParty[0].species).toBe('L11');

    const fishRuntime = createWildEncounterRuntime([header()]);
    fishRuntime.randomQueue.push(99, 0, 0);
    expect(DoesCurrentMapHaveFishingMons(fishRuntime)).toBe(true);
    FishingWildEncounter(fishRuntime, SUPER_ROD);
    expect(fishRuntime.enemyParty[0].species).toBe('F9');
    expect(fishRuntime.gameStats.get(GAME_STAT_FISHING_CAPTURES)).toBe(1);
  });

  it('returns local land/water species with the same 80 percent mixed-map choice', () => {
    const runtime = createWildEncounterRuntime([header()]);
    runtime.randomQueue.push(79, 0, 80, 99);
    expect(GetLocalWildMon(runtime)).toEqual({ species: 'L0', isWaterMon: false });
    expect(GetLocalWildMon(runtime)).toEqual({ species: 'W4', isWaterMon: true });

    const waterOnly = createWildEncounterRuntime([header({ landMonsInfo: null })]);
    waterOnly.randomQueue.push(60);
    expect(GetLocalWildMon(waterOnly)).toEqual({ species: 'W1', isWaterMon: true });
    waterOnly.randomQueue.push(99);
    expect(GetLocalWaterMon(waterOnly)).toBe('W4');

    const none = createWildEncounterRuntime([header({ landMonsInfo: null, waterMonsInfo: null })]);
    expect(GetLocalWildMon(none)).toEqual({ species: SPECIES_NONE, isWaterMon: false });
  });

  it('updates repel counter only outside union room and quest playback', () => {
    const runtime = createWildEncounterRuntime();
    varSet(runtime, VAR_REPEL_STEP_COUNT, 1);
    runtime.inUnionRoom = true;
    expect(UpdateRepelCounter(runtime)).toBe(false);
    expect(varGet(runtime, VAR_REPEL_STEP_COUNT)).toBe(1);
    runtime.inUnionRoom = false;
    runtime.questLogState = QL_STATE_PLAYBACK;
    expect(UpdateRepelCounter(runtime)).toBe(false);
    runtime.questLogState = 0;
    expect(UpdateRepelCounter(runtime)).toBe(true);
    expect(runtime.operations).toContain('EventScript_RepelWoreOff');
  });

  it('handles cooldown modifiers and TryStandardWildEncounter state resets', () => {
    const runtime = createWildEncounterRuntime([header({ landMonsInfo: mons('L', 12, 40) })]);
    const land = makeMetatileAttrs(8, TILE_ENCOUNTER_LAND);
    expect(GetMapBaseEncounterCooldown(runtime, TILE_ENCOUNTER_LAND)).toBe(4);
    runtime.playerParty = [{ hp: 1, level: 5, heldItem: ITEM_CLEANSE_TAG, ability: ABILITY_ILLUMINATE }];
    runtime.randomQueue.push(99);
    expect(HandleWildEncounterCooldown(runtime, land)).toBe(false);
    expect(runtime.sWildEncounterData.stepsSinceLastEncounter).toBe(1);
    runtime.sWildEncounterData.stepsSinceLastEncounter = 99;
    expect(HandleWildEncounterCooldown(runtime, land)).toBe(true);

    const tryRuntime = createWildEncounterRuntime([header({ landMonsInfo: mons('L', 12, 90) })]);
    tryRuntime.randomQueue.push(0, 0, 0, 0);
    tryRuntime.sWildEncounterData.encounterRateBuff = 20;
    expect(TryStandardWildEncounter(tryRuntime, makeMetatileAttrs(3, TILE_ENCOUNTER_LAND))).toBe(true);
    expect(tryRuntime.sWildEncounterData.encounterRateBuff).toBe(0);
    expect(tryRuntime.sWildEncounterData.stepsSinceLastEncounter).toBe(0);
    expect(tryRuntime.sWildEncounterData.prevMetatileBehavior).toBe(3);
  });

  it('creates Unown encounters from the chamber/slot letter table', () => {
    const runtime = createWildEncounterRuntime([header({
      mapGroup: MAP_SEVEN_ISLAND_TANOBY_RUINS_GROUP,
      mapNum: MAP_SEVEN_ISLAND_TANOBY_RUINS_MONEAN_CHAMBER_NUM,
      landMonsInfo: {
        encounterRate: 90,
        wildPokemon: Array.from({ length: 12 }, () => ({ minLevel: 5, maxLevel: 5, species: SPECIES_UNOWN }))
      }
    })]);
    runtime.flags.add(FLAG_SYS_UNLOCKED_TANOBY_RUINS);
    runtime.saveBlock1.location = { mapGroup: MAP_SEVEN_ISLAND_TANOBY_RUINS_GROUP, mapNum: MAP_SEVEN_ISLAND_TANOBY_RUINS_MONEAN_CHAMBER_NUM };
    runtime.randomQueue.push(0, 0, 0, 0);
    expect(TryGenerateWildMon(runtime, runtime.wildMonHeaders[0].landMonsInfo!, WILD_AREA_LAND, 0)).toBe(true);
    expect(runtime.enemyParty[0]).toMatchObject({ species: SPECIES_UNOWN, level: 5, slot: 0, personality: 0 });
  });

  it('keeps global dice roll at Random modulo 100 below 60', () => {
    const runtime = createWildEncounterRuntime();
    runtime.randomQueue.push(59, 60);
    expect(DoGlobalWildEncounterDiceRoll(runtime)).toBe(true);
    expect(DoGlobalWildEncounterDiceRoll(runtime)).toBe(false);
  });
});
