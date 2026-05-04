import { describe, expect, test } from 'vitest';
import { createScriptRuntimeState, setScriptFlag } from '../src/game/scripts';
import { applySaveSnapshot, loadGameFromStorage, saveGameToStorage } from '../src/game/saveData';
import { createTestPlayer, MemoryStorage } from './saveTestUtils';

const roundTrip = (mapId: string, mutate: (runtime: ReturnType<typeof createScriptRuntimeState>) => void) => {
  const storage = new MemoryStorage();
  const runtime = createScriptRuntimeState();
  mutate(runtime);
  const saveResult = saveGameToStorage(storage, mapId, createTestPlayer(4, 5, 'up'), runtime);
  expect(saveResult.ok).toBe(true);
  const snapshot = loadGameFromStorage(storage);
  expect(snapshot).not.toBeNull();

  const restoredRuntime = createScriptRuntimeState();
  const restoredPlayer = createTestPlayer();
  expect(applySaveSnapshot(snapshot!, mapId, restoredPlayer, restoredRuntime)).toBe(true);
  return { snapshot: snapshot!, restoredRuntime, restoredPlayer };
};

describe('save milestone round trips', () => {
  test('new game state', () => {
    const { restoredRuntime, restoredPlayer } = roundTrip('MAP_PALLET_TOWN_PLAYERS_HOUSE_2F', (runtime) => {
      runtime.startMenu.playerName = 'RED';
      runtime.startMenu.hasPokedex = false;
      runtime.startMenu.hasPokemon = false;
      runtime.newGame.pcItems.push({ itemId: 'ITEM_POTION', quantity: 1 });
    });

    expect(restoredRuntime.startMenu.playerName).toBe('RED');
    expect(restoredRuntime.startMenu.hasPokedex).toBe(false);
    expect(restoredRuntime.newGame.pcItems).toContainEqual({ itemId: 'ITEM_POTION', quantity: 1 });
    expect(restoredPlayer.position.x).toBe(4);
  });

  test('post-badge story state', () => {
    const { restoredRuntime } = roundTrip('MAP_PEWTER_CITY', (runtime) => {
      runtime.vars.BADGE01_GET = 1;
      runtime.vars.money = 12345;
      setScriptFlag(runtime, 'FLAG_BADGE01_GET');
      runtime.party[0]!.championRibbon = true;
    });

    expect(restoredRuntime.vars.BADGE01_GET).toBe(1);
    expect(restoredRuntime.vars.money).toBe(12345);
    expect(restoredRuntime.flags.has('FLAG_BADGE01_GET')).toBe(true);
    expect(restoredRuntime.party[0]!.championRibbon).toBe(true);
  });

  test('mid-story Sevii and dynamic warp state', () => {
    const { restoredRuntime } = roundTrip('MAP_ONE_ISLAND', (runtime) => {
      runtime.vars.seviiProgress = 4;
      setScriptFlag(runtime, 'FLAG_DELIVERED_METEORITE');
      runtime.dynamicWarp = { mapId: 'MAP_THREE_ISLAND', warpId: 2, x: 10, y: 11 };
      runtime.newGame.unionRoomRegisteredTextsInitialized = true;
    });

    expect(restoredRuntime.vars.seviiProgress).toBe(4);
    expect(restoredRuntime.flags.has('FLAG_DELIVERED_METEORITE')).toBe(true);
    expect(restoredRuntime.dynamicWarp).toEqual({ mapId: 'MAP_THREE_ISLAND', warpId: 2, x: 10, y: 11 });
    expect(restoredRuntime.newGame.unionRoomRegisteredTextsInitialized).toBe(true);
  });

  test('Safari state', () => {
    const { restoredRuntime } = roundTrip('MAP_SAFARI_ZONE_CENTER', (runtime) => {
      runtime.startMenu.mode = 'safari';
      runtime.vars.safariBalls = 17;
      runtime.vars.safariSteps = 432;
      runtime.consumedTriggerIds.add('MAP_SAFARI_ZONE_CENTER:gift:HM03');
    });

    expect(restoredRuntime.startMenu.mode).toBe('safari');
    expect(restoredRuntime.vars.safariBalls).toBe(17);
    expect(restoredRuntime.vars.safariSteps).toBe(432);
    expect(restoredRuntime.consumedTriggerIds.has('MAP_SAFARI_ZONE_CENTER:gift:HM03')).toBe(true);
  });

  test('post-Hall of Fame state', () => {
    const { restoredRuntime } = roundTrip('MAP_INDIGO_PLATEAU_POKEMON_CENTER_1F', (runtime) => {
      setScriptFlag(runtime, 'FLAG_SYS_GAME_CLEAR');
      runtime.vars.hallOfFameWins = 1;
      runtime.party[0]!.championRibbon = true;
      runtime.fameChecker.updates.push({ person: 25, value: 1, special: 'SPECIAL_HALL_OF_FAME' });
      runtime.roamer.roamer.active = true;
      runtime.roamer.roamer.hp = 22;
    });

    expect(restoredRuntime.flags.has('FLAG_SYS_GAME_CLEAR')).toBe(true);
    expect(restoredRuntime.vars.hallOfFameWins).toBe(1);
    expect(restoredRuntime.party[0]!.championRibbon).toBe(true);
    expect(restoredRuntime.fameChecker.updates[0]!.special).toBe('SPECIAL_HALL_OF_FAME');
    expect(restoredRuntime.roamer.roamer.hp).toBe(22);
  });
});
