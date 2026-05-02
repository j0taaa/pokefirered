export const FANCLUB_MEMBER1 = 0;
export const FANCLUB_MEMBER2 = 1;
export const FANCLUB_MEMBER3 = 2;
export const FANCLUB_MEMBER4 = 3;
export const FANCLUB_MEMBER5 = 4;
export const FANCLUB_MEMBER6 = 5;
export const FANCLUB_MEMBER7 = 6;
export const FANCLUB_MEMBER8 = 7;
export const NUM_TRAINER_FAN_CLUB_MEMBERS = 8;
export const B_OUTCOME_WON = 1;

export interface TrainerFanClub {
  timer: number;
  gotInitialFans: boolean;
  fanFlags: number;
}

export interface TrainerFanClubRuntime {
  fanClub: TrainerFanClub;
  loseFanTimer: number;
  mapScene: number;
  playTimeHours: number;
  specialVar8004: number;
  battleOutcome: number;
  randomValues: number[];
  hiddenFlagsCleared: string[];
  rivalName: string;
  linkBattleRecords: { entries: { name: string }[] };
  stringVar1: string;
}

export const createTrainerFanClubRuntime = (): TrainerFanClubRuntime => ({
  fanClub: { timer: 0, gotInitialFans: false, fanFlags: 0 },
  loseFanTimer: 0,
  mapScene: 0,
  playTimeHours: 0,
  specialVar8004: 0,
  battleOutcome: 0,
  randomValues: [],
  hiddenFlagsCleared: [],
  rivalName: 'RIVAL',
  linkBattleRecords: { entries: [{ name: '' }, { name: '' }] },
  stringVar1: ''
});

const random = (runtime: TrainerFanClubRuntime): number => runtime.randomValues.shift() ?? 0;
const getFlag = (fanClub: TrainerFanClub, flag: number): boolean => ((fanClub.fanFlags >> flag) & 1) !== 0;
const setFlag = (fanClub: TrainerFanClub, flag: number): void => {
  fanClub.fanFlags |= 1 << flag;
};
const flipFlag = (fanClub: TrainerFanClub, flag: number): void => {
  fanClub.fanFlags ^= 1 << flag;
};

export const resetTrainerFanClub = (runtime: TrainerFanClubRuntime): void => {
  runtime.fanClub = { timer: 0, gotInitialFans: false, fanFlags: 0 };
  runtime.loseFanTimer = 0;
};

export const didPlayerGetFirstFans = (fanClub: TrainerFanClub): boolean => fanClub.gotInitialFans;
export const setPlayerGotFirstFans = (fanClub: TrainerFanClub): void => {
  fanClub.gotInitialFans = true;
};

export const setInitialFansOfPlayer = (fanClub: TrainerFanClub): void => {
  setFlag(fanClub, FANCLUB_MEMBER1);
  setFlag(fanClub, FANCLUB_MEMBER2);
  setFlag(fanClub, FANCLUB_MEMBER3);
};

export const getNumFansOfPlayerInTrainerFanClub = (fanClub: TrainerFanClub): number => {
  let count = 0;
  for (let i = 0; i < NUM_TRAINER_FAN_CLUB_MEMBERS; i += 1) {
    if (getFlag(fanClub, i)) {
      count += 1;
    }
  }
  return count;
};

export const updateTrainerFanClubGameClear = (
  runtime: TrainerFanClubRuntime,
  fanClub = runtime.fanClub
): void => {
  if (!fanClub.gotInitialFans) {
    setPlayerGotFirstFans(fanClub);
    setInitialFansOfPlayer(fanClub);
    runtime.loseFanTimer = runtime.playTimeHours;
    runtime.hiddenFlagsCleared.push(
      'FLAG_HIDE_SAFFRON_FAN_CLUB_BLACK_BELT',
      'FLAG_HIDE_SAFFRON_FAN_CLUB_ROCKER',
      'FLAG_HIDE_SAFFRON_FAN_CLUB_WOMAN',
      'FLAG_HIDE_SAFFRON_FAN_CLUB_BEAUTY'
    );
    runtime.mapScene = 1;
  }
};

const gainOrder = [
  FANCLUB_MEMBER2,
  FANCLUB_MEMBER4,
  FANCLUB_MEMBER6,
  FANCLUB_MEMBER1,
  FANCLUB_MEMBER8,
  FANCLUB_MEMBER7,
  FANCLUB_MEMBER5,
  FANCLUB_MEMBER3
];

const loseOrder = [
  FANCLUB_MEMBER6,
  FANCLUB_MEMBER7,
  FANCLUB_MEMBER4,
  FANCLUB_MEMBER8,
  FANCLUB_MEMBER5,
  FANCLUB_MEMBER2,
  FANCLUB_MEMBER1,
  FANCLUB_MEMBER3
];

export const playerGainRandomTrainerFan = (
  runtime: TrainerFanClubRuntime,
  fanClub: TrainerFanClub
): number => {
  let idx = 0;
  for (let i = 0; i < NUM_TRAINER_FAN_CLUB_MEMBERS; i += 1) {
    if (!getFlag(fanClub, gainOrder[i])) {
      idx = i;
      if (random(runtime) % 2) {
        setFlag(fanClub, gainOrder[i]);
        return gainOrder[i];
      }
    }
  }
  setFlag(fanClub, gainOrder[idx]);
  return gainOrder[idx];
};

export const playerLoseRandomTrainerFan = (
  runtime: TrainerFanClubRuntime,
  fanClub: TrainerFanClub
): number => {
  let idx = 0;
  if (getNumFansOfPlayerInTrainerFanClub(fanClub) === 1) {
    return 0;
  }
  for (let i = 0; i < NUM_TRAINER_FAN_CLUB_MEMBERS; i += 1) {
    if (getFlag(fanClub, loseOrder[i])) {
      idx = i;
      if (random(runtime) % 2) {
        flipFlag(fanClub, loseOrder[i]);
        return loseOrder[i];
      }
    }
  }
  if (getFlag(fanClub, loseOrder[idx])) {
    flipFlag(fanClub, loseOrder[idx]);
  }
  return loseOrder[idx];
};

export const tryGainNewFanFromCounter = (
  runtime: TrainerFanClubRuntime,
  fanClub: TrainerFanClub,
  a1: number
): number => {
  const increments = [2, 1, 2, 1];
  if (runtime.mapScene === 2) {
    if (fanClub.timer + increments[a1] >= 20) {
      if (getNumFansOfPlayerInTrainerFanClub(fanClub) < 3) {
        playerGainRandomTrainerFan(runtime, fanClub);
        fanClub.timer = 0;
      } else {
        fanClub.timer = 20;
      }
    } else {
      fanClub.timer += increments[a1];
    }
  }
  return fanClub.timer;
};

export const tryLoseFansFromPlayTime = (
  runtime: TrainerFanClubRuntime,
  fanClub: TrainerFanClub
): void => {
  let i = 0;
  if (runtime.playTimeHours < 999) {
    while (true) {
      if (getNumFansOfPlayerInTrainerFanClub(fanClub) < 5) {
        runtime.loseFanTimer = runtime.playTimeHours;
        break;
      }
      if (i === NUM_TRAINER_FAN_CLUB_MEMBERS) {
        break;
      }
      if (runtime.playTimeHours - runtime.loseFanTimer < 12) {
        break;
      }
      playerLoseRandomTrainerFan(runtime, fanClub);
      runtime.loseFanTimer += 12;
      i += 1;
    }
  }
};

export const tryLoseFansFromPlayTimeAfterLinkBattle = (
  runtime: TrainerFanClubRuntime,
  fanClub = runtime.fanClub
): void => {
  if (didPlayerGetFirstFans(fanClub)) {
    tryLoseFansFromPlayTime(runtime, fanClub);
    runtime.loseFanTimer = runtime.playTimeHours;
  }
};

export const isFanClubMemberFanOfPlayer = (
  runtime: TrainerFanClubRuntime,
  fanClub = runtime.fanClub
): boolean => getFlag(fanClub, runtime.specialVar8004);

export const bufferFanClubTrainerName = (
  runtime: TrainerFanClubRuntime,
  whichLinkTrainer: number,
  whichNPCTrainer: number
): void => {
  const linkTrainerName = runtime.linkBattleRecords.entries[whichLinkTrainer]?.name ?? '';
  if (linkTrainerName.length === 0) {
    switch (whichNPCTrainer) {
      case 0:
        runtime.stringVar1 = runtime.rivalName;
        break;
      case 1:
        runtime.stringVar1 = 'LT. SURGE';
        break;
      case 2:
        runtime.stringVar1 = 'KOGA';
        break;
      default:
        runtime.stringVar1 = runtime.rivalName;
        break;
    }
  } else {
    runtime.stringVar1 = linkTrainerName.slice(0, 7);
    if (runtime.stringVar1.startsWith('{JPN}')) {
      runtime.stringVar1 = `${runtime.stringVar1}{ENG}`;
    }
  }
};

export const scriptBufferFanClubTrainerName = (runtime: TrainerFanClubRuntime): void => {
  let whichLinkTrainer = 0;
  let whichNPCTrainer = 0;
  switch (runtime.specialVar8004) {
    case FANCLUB_MEMBER1:
      whichNPCTrainer = 0;
      whichLinkTrainer = 0;
      break;
    case FANCLUB_MEMBER5:
      whichNPCTrainer = 1;
      whichLinkTrainer = 0;
      break;
    case FANCLUB_MEMBER6:
      whichNPCTrainer = 0;
      whichLinkTrainer = 1;
      break;
    case FANCLUB_MEMBER7:
      whichNPCTrainer = 2;
      whichLinkTrainer = 1;
      break;
  }
  bufferFanClubTrainerName(runtime, whichLinkTrainer, whichNPCTrainer);
};

export const updateTrainerFansAfterLinkBattle = (
  runtime: TrainerFanClubRuntime,
  fanClub = runtime.fanClub
): void => {
  if (runtime.mapScene === 2) {
    tryLoseFansFromPlayTimeAfterLinkBattle(runtime, fanClub);
    if (runtime.battleOutcome === B_OUTCOME_WON) {
      playerGainRandomTrainerFan(runtime, fanClub);
    } else {
      playerLoseRandomTrainerFan(runtime, fanClub);
    }
  }
};

export const scriptTryGainNewFanFromCounter = (runtime: TrainerFanClubRuntime): number =>
  tryGainNewFanFromCounter(runtime, runtime.fanClub, runtime.specialVar8004);

export const ResetTrainerFanClub = resetTrainerFanClub;
export const Script_TryLoseFansFromPlayTimeAfterLinkBattle =
  tryLoseFansFromPlayTimeAfterLinkBattle;
export const TryLoseFansFromPlayTimeAfterLinkBattle =
  tryLoseFansFromPlayTimeAfterLinkBattle;
export const Script_UpdateTrainerFanClubGameClear = updateTrainerFanClubGameClear;
export const UpdateTrainerFanClubGameClear = updateTrainerFanClubGameClear;
export const TryGainNewFanFromCounter = tryGainNewFanFromCounter;
export const PlayerGainRandomTrainerFan = playerGainRandomTrainerFan;
export const PlayerLoseRandomTrainerFan = playerLoseRandomTrainerFan;
export const Script_GetNumFansOfPlayerInTrainerFanClub = (
  runtime: TrainerFanClubRuntime
): number => getNumFansOfPlayerInTrainerFanClub(runtime.fanClub);
export const GetNumFansOfPlayerInTrainerFanClub =
  getNumFansOfPlayerInTrainerFanClub;
export const Script_TryLoseFansFromPlayTime = (
  runtime: TrainerFanClubRuntime
): void => {
  tryLoseFansFromPlayTime(runtime, runtime.fanClub);
};
export const TryLoseFansFromPlayTime = tryLoseFansFromPlayTime;
export const Script_IsFanClubMemberFanOfPlayer = isFanClubMemberFanOfPlayer;
export const IsFanClubMemberFanOfPlayer = isFanClubMemberFanOfPlayer;
export const SetInitialFansOfPlayer = setInitialFansOfPlayer;
export const Script_BufferFanClubTrainerName = scriptBufferFanClubTrainerName;
export const BufferFanClubTrainerName = bufferFanClubTrainerName;
export const Special_UpdateTrainerFansAfterLinkBattle =
  updateTrainerFansAfterLinkBattle;
export const UpdateTrainerFansAfterLinkBattle = updateTrainerFansAfterLinkBattle;
export const DidPlayerGetFirstFans = didPlayerGetFirstFans;
export const Script_SetPlayerGotFirstFans = (
  runtime: TrainerFanClubRuntime
): void => {
  setPlayerGotFirstFans(runtime.fanClub);
};
export const SetPlayerGotFirstFans = setPlayerGotFirstFans;
export const Script_TryGainNewFanFromCounter = scriptTryGainNewFanFromCounter;
