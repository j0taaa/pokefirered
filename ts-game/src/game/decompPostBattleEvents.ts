import { addBagItem, checkBagHasItem, type BagState } from './bag';
import { type PlayTimeCounter } from './decompPlayTime';
import { setPostgameFlags } from './decompSaveLocation';
import { setRespawn } from './pokemonCenterTemplate';
import { healParty, type FieldPokemon } from './pokemonStorage';

export const FLAG_SYS_GAME_CLEAR = 'FLAG_SYS_GAME_CLEAR';
export const FLAG_SYS_RIBBON_GET = 'FLAG_SYS_RIBBON_GET';
export const FLAG_ENABLE_SHIP_BIRTH_ISLAND = 'FLAG_ENABLE_SHIP_BIRTH_ISLAND';
export const FLAG_RECEIVED_AURORA_TICKET = 'FLAG_RECEIVED_AURORA_TICKET';
export const FLAG_ENABLE_SHIP_NAVEL_ROCK = 'FLAG_ENABLE_SHIP_NAVEL_ROCK';
export const FLAG_RECEIVED_MYSTIC_TICKET = 'FLAG_RECEIVED_MYSTIC_TICKET';

export const GAME_STAT_FIRST_HOF_PLAY_TIME = 'gameStatFirstHallOfFamePlayTime';
export const GAME_STAT_RECEIVED_RIBBONS = 'gameStatReceivedRibbons';

export interface PostBattleEventsRuntimeState {
  vars: Record<string, number>;
  flags: Set<string>;
  party: FieldPokemon[];
  bag: BagState;
  playTime: PlayTimeCounter;
  specialSaveWarpFlags: number;
  gcnLinkFlags: number;
}

export interface HallOfFameResult {
  firstEntry: boolean;
  hasHallOfFameRecords: boolean;
  gaveAtLeastOneRibbon: boolean;
  awardedTickets: boolean;
  packedFirstHallOfFamePlayTime: number;
}

const packPlayTime = (playTime: PlayTimeCounter): number =>
  ((playTime.hours & 0xffff) << 16) | ((playTime.minutes & 0xff) << 8) | (playTime.seconds & 0xff);

export const enterHallOfFame = (runtime: PostBattleEventsRuntimeState): HallOfFameResult => {
  healParty(runtime.party);

  const firstEntry = !runtime.flags.has(FLAG_SYS_GAME_CLEAR);
  const hasHallOfFameRecords = !firstEntry;
  if (firstEntry) {
    runtime.flags.add(FLAG_SYS_GAME_CLEAR);
  }

  const packedPlayTime = packPlayTime(runtime.playTime);
  if ((runtime.vars[GAME_STAT_FIRST_HOF_PLAY_TIME] ?? 0) === 0) {
    runtime.vars[GAME_STAT_FIRST_HOF_PLAY_TIME] = packedPlayTime >>> 0;
    runtime.vars.hofDebutHours = runtime.playTime.hours;
    runtime.vars.hofDebutMinutes = runtime.playTime.minutes;
    runtime.vars.hofDebutSeconds = runtime.playTime.seconds;
  }

  setPostgameFlags(runtime);
  setRespawn(runtime, 'HEAL_LOCATION_PALLET_TOWN');

  let gaveAtLeastOneRibbon = false;
  for (const pokemon of runtime.party) {
    if (!pokemon.championRibbon) {
      pokemon.championRibbon = true;
      gaveAtLeastOneRibbon = true;
    }
  }

  let awardedTickets = false;
  if (gaveAtLeastOneRibbon) {
    runtime.vars[GAME_STAT_RECEIVED_RIBBONS] = Math.max(
      0,
      Math.trunc(runtime.vars[GAME_STAT_RECEIVED_RIBBONS] ?? 0)
    ) + 1;
    runtime.flags.add(FLAG_SYS_RIBBON_GET);

    if (!checkBagHasItem(runtime.bag, 'ITEM_AURORA_TICKET', 1)) {
      addBagItem(runtime.bag, 'ITEM_AURORA_TICKET', 1);
      runtime.flags.add(FLAG_ENABLE_SHIP_BIRTH_ISLAND);
      runtime.flags.add(FLAG_RECEIVED_AURORA_TICKET);
      addBagItem(runtime.bag, 'ITEM_MYSTIC_TICKET', 1);
      runtime.flags.add(FLAG_ENABLE_SHIP_NAVEL_ROCK);
      runtime.flags.add(FLAG_RECEIVED_MYSTIC_TICKET);
      awardedTickets = true;
    }
  }

  return {
    firstEntry,
    hasHallOfFameRecords,
    gaveAtLeastOneRibbon,
    awardedTickets,
    packedFirstHallOfFamePlayTime: runtime.vars[GAME_STAT_FIRST_HOF_PLAY_TIME] ?? packedPlayTime
  };
};

export const setCb2WhiteOut = (): 'CB2_WhiteOut' => 'CB2_WhiteOut';
