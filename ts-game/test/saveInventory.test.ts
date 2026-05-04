import { describe, expect, test } from 'vitest';
import { createScriptRuntimeState, setScriptFlag } from '../src/game/scripts';
import { createSaveSnapshot } from '../src/game/saveData';
import { createTestPlayer } from './saveTestUtils';

describe('save inventory audit', () => {
  test('snapshot covers every long-lived ScriptRuntimeState field', () => {
    const runtime = createScriptRuntimeState();
    runtime.vars.BADGE01_GET = 1;
    runtime.stringVars.rivalName = 'BLUE';
    setScriptFlag(runtime, 'FLAG_SYS_GAME_CLEAR');
    runtime.consumedTriggerIds.add('MAP_SAFARI_ZONE_NORTH:12:9');
    runtime.startMenu.mode = 'safari';
    runtime.options.battleStyle = 'set';
    runtime.specialSaveWarpFlags = 3;
    runtime.gcnLinkFlags = 7;
    runtime.party[0]!.nickname = 'CHAMP';
    runtime.party[0]!.moves = ['MOVE_FLAMETHROWER', 'MOVE_SLASH'];
    runtime.party[0]!.evs = { hp: 1, attack: 2, defense: 3, speed: 4, spAttack: 5, spDefense: 6 };
    runtime.pokedex.dexMode = 'NATIONAL';
    runtime.bag.pockets.items.push({ itemId: 'ITEM_ESCAPE_ROPE', quantity: 2 });
    runtime.pcStorage.currentBox = 2;
    runtime.pcStorage.boxNames[2] = 'HOF TEAM';
    runtime.pcStorage.boxes[2]!.push({ ...runtime.party[0]!, nickname: 'BOXMON' });
    runtime.roamer.roamer = {
      species: 243,
      level: 50,
      status: 4,
      active: true,
      ivs: 123456,
      personality: 654321,
      hp: 17,
      cool: 1,
      beauty: 2,
      cute: 3,
      smart: 4,
      tough: 5
    };
    runtime.roamer.roamerLocation = [3, 42];
    runtime.dynamicWarp = { mapId: 'MAP_ONE_ISLAND', warpId: 1, x: 7, y: 8 };
    runtime.fameChecker.pickStates[3] = 1;
    runtime.fameChecker.flavorTextFlags[4] = 2;
    runtime.fameChecker.updates.push({ person: 5, value: 6, special: 'SPECIAL_FAME_CHECKER' });
    runtime.newGame.trainerTowerResultsCleared = true;
    runtime.newGame.unionRoomRegisteredTextsInitialized = true;
    runtime.newGame.pcItems.push({ itemId: 'ITEM_RARE_CANDY', quantity: 1 });
    runtime.fieldAudio.savedMusic = 301;
    runtime.fieldAudio.currentMapMusic = 302;

    const snapshot = createSaveSnapshot('MAP_SAFARI_ZONE_NORTH', createTestPlayer(12, 9), runtime, '2026-05-03T00:00:00.000Z');

    expect(snapshot.runtime.vars.BADGE01_GET).toBe(1);
    expect(snapshot.runtime.stringVars.rivalName).toBe('BLUE');
    expect(snapshot.runtime.flags).toContain('FLAG_SYS_GAME_CLEAR');
    expect(snapshot.runtime.consumedTriggerIds).toContain('MAP_SAFARI_ZONE_NORTH:12:9');
    expect(snapshot.runtime.startMenu.mode).toBe('safari');
    expect(snapshot.runtime.options.battleStyle).toBe('set');
    expect(snapshot.runtime.party[0]!.evs!.spDefense).toBe(6);
    expect(snapshot.runtime.bag.pockets.items).toContainEqual({ itemId: 'ITEM_ESCAPE_ROPE', quantity: 2 });
    expect(snapshot.runtime.pcStorage!.boxes[2]![0]!.nickname).toBe('BOXMON');
    expect(snapshot.runtime.roamer!.roamer.hp).toBe(17);
    expect(snapshot.runtime.roamer!.roamerLocation).toEqual([3, 42]);
    expect(snapshot.runtime.dynamicWarp).toEqual({ mapId: 'MAP_ONE_ISLAND', warpId: 1, x: 7, y: 8 });
    expect(snapshot.runtime.fameChecker!.updates[0]!.special).toBe('SPECIAL_FAME_CHECKER');
    expect(snapshot.runtime.newGame!.trainerTowerResultsCleared).toBe(true);
    expect(snapshot.runtime.newGame!.unionRoomRegisteredTextsInitialized).toBe(true);
    expect(snapshot.runtime.fieldAudio!.savedMusic).toBe(301);
    expect(snapshot.runtime.fieldAudio!.currentMapMusic).toBe(302);
  });
});
