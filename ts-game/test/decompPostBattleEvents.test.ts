import { describe, expect, test } from 'vitest';
import { getBagQuantity } from '../src/game/bag';
import { createPlayTimeCounterFromSeconds } from '../src/game/decompPlayTime';
import {
  enterHallOfFame,
  FLAG_ENABLE_SHIP_BIRTH_ISLAND,
  FLAG_ENABLE_SHIP_NAVEL_ROCK,
  FLAG_RECEIVED_AURORA_TICKET,
  FLAG_RECEIVED_MYSTIC_TICKET,
  FLAG_SYS_GAME_CLEAR,
  FLAG_SYS_RIBBON_GET,
  GAME_STAT_FIRST_HOF_PLAY_TIME,
  GAME_STAT_RECEIVED_RIBBONS,
  setCb2WhiteOut
} from '../src/game/decompPostBattleEvents';
import { CHAMPION_SAVEWARP, POSTGAME_GCN_LINK_FLAGS_MASK } from '../src/game/decompSaveLocation';
import { getRespawnLocation } from '../src/game/pokemonCenterTemplate';
import { createScriptRuntimeState } from '../src/game/scripts';

describe('decomp post_battle_event_funcs', () => {
  test('enterHallOfFame applies FireRed game-clear rewards and trainer-card timing', () => {
    const runtime = createScriptRuntimeState();
    runtime.playTime = createPlayTimeCounterFromSeconds(3723, 0);
    runtime.party[0]!.hp = 1;
    runtime.party[0]!.status = 'poison';

    const result = enterHallOfFame(runtime);

    expect(result.firstEntry).toBe(true);
    expect(result.hasHallOfFameRecords).toBe(false);
    expect(result.gaveAtLeastOneRibbon).toBe(true);
    expect(result.awardedTickets).toBe(true);
    expect(runtime.party.every((pokemon) => pokemon.hp === pokemon.maxHp)).toBe(true);
    expect(runtime.party.every((pokemon) => pokemon.status === 'none')).toBe(true);
    expect(runtime.party.every((pokemon) => pokemon.championRibbon)).toBe(true);
    expect(runtime.flags.has(FLAG_SYS_GAME_CLEAR)).toBe(true);
    expect(runtime.flags.has(FLAG_SYS_RIBBON_GET)).toBe(true);
    expect(runtime.flags.has(FLAG_ENABLE_SHIP_BIRTH_ISLAND)).toBe(true);
    expect(runtime.flags.has(FLAG_RECEIVED_AURORA_TICKET)).toBe(true);
    expect(runtime.flags.has(FLAG_ENABLE_SHIP_NAVEL_ROCK)).toBe(true);
    expect(runtime.flags.has(FLAG_RECEIVED_MYSTIC_TICKET)).toBe(true);
    expect(runtime.vars[GAME_STAT_FIRST_HOF_PLAY_TIME]).toBe((1 << 16) | (2 << 8) | 3);
    expect(runtime.vars.hofDebutHours).toBe(1);
    expect(runtime.vars.hofDebutMinutes).toBe(2);
    expect(runtime.vars.hofDebutSeconds).toBe(3);
    expect(runtime.vars[GAME_STAT_RECEIVED_RIBBONS]).toBe(1);
    expect(runtime.specialSaveWarpFlags & CHAMPION_SAVEWARP).toBe(CHAMPION_SAVEWARP);
    expect(runtime.gcnLinkFlags & POSTGAME_GCN_LINK_FLAGS_MASK).toBe(POSTGAME_GCN_LINK_FLAGS_MASK);
    expect(getBagQuantity(runtime.bag, 'ITEM_AURORA_TICKET')).toBe(1);
    expect(getBagQuantity(runtime.bag, 'ITEM_MYSTIC_TICKET')).toBe(1);
    expect(getRespawnLocation(runtime)?.id).toBe('HEAL_LOCATION_PALLET_TOWN');
  });

  test('repeat Hall of Fame entries preserve first timing stat and do not re-award ribbons', () => {
    const runtime = createScriptRuntimeState();
    enterHallOfFame(runtime);

    const result = enterHallOfFame(runtime);

    expect(result.firstEntry).toBe(false);
    expect(result.hasHallOfFameRecords).toBe(true);
    expect(result.gaveAtLeastOneRibbon).toBe(false);
    expect(result.awardedTickets).toBe(false);
    expect(runtime.vars[GAME_STAT_RECEIVED_RIBBONS]).toBe(1);
  });

  test('SetCB2WhiteOut maps to the whiteout callback token', () => {
    expect(setCb2WhiteOut()).toBe('CB2_WhiteOut');
  });
});
