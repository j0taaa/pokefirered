import { describe, expect, test } from 'vitest';
import { createPlayer } from '../src/game/player';
import {
  ClearBattleTower,
  ClearPokedexFlags,
  CopyTrainerId,
  InitPlayerTrainerId,
  NewGameInitData,
  copyTrainerId,
  ResetMenuAndMonGlobals,
  ResetMiniGamesResults,
  Sav2_ClearSetDefault,
  SetDefaultOptions,
  SetTrainerId,
  WarpToPlayersRoom,
  newGameInitData,
  packTrainerId,
  PLAYERS_ROOM_WARP,
  setTrainerId,
  startNewGame
} from '../src/game/decompNewGame';
import { getCoins } from '../src/game/decompCoins';
import { getMoney } from '../src/game/decompMoney';
import { createScriptRuntimeState } from '../src/game/scripts';
import { loadMapById } from '../src/world/mapSource';

describe('decomp new_game', () => {
  test('setTrainerId / copyTrainerId preserve the C byte order', () => {
    const trainerIdBytes = setTrainerId(0x1234abcd);
    expect(trainerIdBytes).toEqual([0xcd, 0xab, 0x34, 0x12]);
    expect(copyTrainerId(trainerIdBytes)).toEqual([0xcd, 0xab, 0x34, 0x12]);
    expect(packTrainerId(trainerIdBytes)).toBe(0x1234abcd);
  });

  test('newGameInitData mirrors the FireRed runtime reset path in TS state', () => {
    const runtime = createScriptRuntimeState();
    runtime.flags.add('FLAG_BADGE01_GET');
    runtime.consumedTriggerIds.add('used.trigger');
    runtime.vars.story = 99;
    runtime.stringVars.rivalName = 'BLUE';
    runtime.options.sound = 'stereo';
    runtime.party[0]!.nickname = 'BLAZE';
    runtime.pokedex.caughtSpecies = ['CHARMANDER'];
    runtime.newGame.differentSaveFile = false;

    const warp = newGameInitData(runtime, {
      generatedTrainerIdLower: 0x1234,
      randomHigh16: 0x5678
    });

    expect(warp).toEqual(PLAYERS_ROOM_WARP);
    expect([...runtime.flags].sort()).toEqual([
      'FLAG_HIDE_OAK_IN_HIS_LAB',
      'FLAG_HIDE_OAK_IN_PALLET_TOWN',
      'FLAG_HIDE_POKEDEX'
    ]);
    expect(runtime.consumedTriggerIds.size).toBe(0);
    expect(runtime.stringVars.rivalName).toBe('BLUE');
    expect(runtime.startMenu.hasPokemon).toBe(false);
    expect(runtime.startMenu.hasPokedex).toBe(false);
    expect(runtime.options).toMatchObject({
      textSpeed: 'mid',
      battleScene: true,
      battleStyle: 'shift',
      sound: 'mono',
      buttonMode: 'help',
      frameType: 0
    });
    expect(runtime.vars.playerTrainerId).toBe(0x56781234);
    expect(runtime.vars.trainerId).toBe(0x1234);
    expect(runtime.party).toEqual([]);
    expect(runtime.pokedex.seenSpecies).toEqual([]);
    expect(runtime.pokedex.caughtSpecies).toEqual([]);
    expect(getMoney(runtime)).toBe(3000);
    expect(getCoins(runtime)).toBe(0);
    expect(runtime.newGame.differentSaveFile).toBe(true);
    expect(runtime.newGame.unkFlag1).toBe(true);
    expect(runtime.newGame.unkFlag2).toBe(false);
    expect(runtime.newGame.pcItems).toEqual([{ itemId: 'ITEM_POTION', quantity: 1 }]);
    expect(runtime.newGame.mail).toHaveLength(16);
    expect(runtime.newGame.mail[0]).toMatchObject({
      playerName: '',
      trainerId: 0,
      species: 'SPECIES_BULBASAUR',
      itemId: null
    });
    expect(runtime.newGame.mail[0]?.words).toEqual(Array.from({ length: 9 }, () => 0xffff));
  });

  test('startNewGame warps the player to the upstairs bedroom map', () => {
    const runtime = createScriptRuntimeState();
    const player = createPlayer();

    const result = startNewGame(runtime, player, loadMapById, {
      generatedTrainerIdLower: 0xabcd,
      randomHigh16: 0x1357
    });

    expect(result).not.toBeNull();
    expect(result?.map.id).toBe('MAP_PALLET_TOWN_PLAYERS_HOUSE_2F');
    expect(player.position.x).toBe(6 * result!.map.tileSize);
    expect(player.position.y).toBe(6 * result!.map.tileSize);
    expect(player.facing).toBe('down');
  });

  test('exact C-name new_game exports preserve trainer id, defaults, resets, and start warp logic', () => {
    const runtime = createScriptRuntimeState();
    runtime.options.sound = 'stereo';
    runtime.pokedex.seenSpecies = ['MEWTWO'];
    runtime.pokedex.caughtSpecies = ['MEWTWO'];
    runtime.party = [runtime.party[0]!];
    runtime.pendingTrainerBattle = { id: 'battle' } as unknown as typeof runtime.pendingTrainerBattle;
    runtime.vars.specialVarResult = 123;

    expect(SetTrainerId(0x89abcdef)).toEqual([0xef, 0xcd, 0xab, 0x89]);
    expect(CopyTrainerId([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4]);
    expect(InitPlayerTrainerId(runtime, {
      generatedTrainerIdLower: 0xbeef,
      randomHigh16: 0x1234
    })).toEqual([0xef, 0xbe, 0x34, 0x12]);
    expect(runtime.vars.playerTrainerId).toBe(0x1234beef);

    SetDefaultOptions(runtime);
    expect(runtime.options).toMatchObject({
      textSpeed: 'mid',
      battleScene: true,
      battleStyle: 'shift',
      sound: 'mono',
      buttonMode: 'help',
      frameType: 0
    });

    ClearPokedexFlags(runtime);
    expect(runtime.pokedex.seenSpecies).toEqual([]);
    expect(runtime.pokedex.caughtSpecies).toEqual([]);

    ClearBattleTower(runtime);
    expect(runtime.newGame.battleTowerCleared).toBe(true);
    expect(WarpToPlayersRoom()).toEqual(PLAYERS_ROOM_WARP);

    ResetMenuAndMonGlobals(runtime);
    expect(runtime.newGame.differentSaveFile).toBe(false);
    expect(runtime.party).toEqual([]);
    expect(runtime.pendingTrainerBattle).toBeNull();
    expect(runtime.vars.specialVarResult).toBe(0);

    ResetMiniGamesResults(runtime);
    expect(runtime.newGame.berryPowderAmount).toBe(0);
    expect(runtime.newGame.berryPickingResultsCleared).toBe(true);
    expect(runtime.newGame.pokemonJumpResultsCleared).toBe(true);

    runtime.options.sound = 'stereo';
    Sav2_ClearSetDefault(runtime);
    expect(runtime.newGame.mail).toHaveLength(16);
    expect(runtime.options.sound).toBe('mono');

    const warp = NewGameInitData(runtime, {
      generatedTrainerIdLower: 0xabcd,
      randomHigh16: 0x1357
    });
    expect(warp).toEqual(PLAYERS_ROOM_WARP);
    expect(runtime.vars.playerTrainerId).toBe(0x1357abcd);
    expect(getMoney(runtime)).toBe(3000);
    expect(getCoins(runtime)).toBe(0);
  });
});
