export const BATTLE_TOWER_EREADER_TRAINER_ID = 300;
export const BATTLE_TOWER_RECORD_MIXING_TRAINER_BASE_ID = 200;
export const BTSPECIAL_RESULT_SAVE_SCUM = 1;
export const BTSPECIAL_RESULT_WON7 = 2;
export const BTSPECIAL_RESULT_LOST = 3;
export const BTSPECIAL_RESULT_QUICKSAVE = 4;
export const BTSPECIAL_RESULT_INACTIVE = 5;
export const BTSPECIAL_TEST = 6;
export const VAR_TEMP_0 = 0x4000;
export const VAR_OBJ_GFX_ID_0 = 0x4001;
export const OBJ_EVENT_GFX_YOUNGSTER = 1;
export const MALE = 0;
export const PARTY_SIZE = 6;
export const ITEM_NONE = 0;
export const SPECIES_NONE = 0;
export const SPECIES_EGG = 0xffff;
export const MOVE_FRUSTRATION = 218;
export const B_OUTCOME_DREW = 1;
export const B_OUTCOME_WON = 2;
export const BATTLE_TYPE_BATTLE_TOWER = 1 << 0;
export const BATTLE_TYPE_TRAINER = 1 << 1;
export const BATTLE_TYPE_EREADER_TRAINER = 1 << 2;
export const GAME_STAT_BATTLE_TOWER_BEST_STREAK = 10;
export const GAME_STAT_RECEIVED_RIBBONS = 11;
export const MON_DATA_WINNING_RIBBON = 100;
export const MON_DATA_VICTORY_RIBBON = 101;

export const gBattleTowerBannedSpecies = [151, 150, 250, 249, 251, 382, 383, 384, 385, 386, 0xffff] as const;
export const sShortStreakPrizes = [45, 46, 47, 48, 49, 50] as const;
export const sLongStreakPrizes = [51, 52, 53, 54, 55, 56, 57, 58, 59] as const;

export interface TowerMon {
  species: number;
  heldItem: number;
  hp: number;
  level: number;
  moves: number[];
  evSpread?: number;
  friendship?: number;
  nickname?: number[];
  ribbons?: Record<number, number>;
}

export interface BattleTowerPokemonTemplate {
  species: number;
  heldItem: number;
  moves: number[];
  evSpread: number;
  teamFlags: number;
}

export interface BattleTowerTrainer {
  trainerClass: number;
  name: number[];
  greeting: number[];
  teamFlags: number;
}

export interface BattleTowerRecord {
  battleTowerLevelType: number;
  trainerClass: number;
  trainerId: number[];
  name: number[];
  winStreak: number;
  greeting: number[];
  party: TowerMon[];
  checksum: number;
}

export interface BattleTowerEReaderTrainer extends BattleTowerRecord {
  farewellPlayerLost: number[];
  farewellPlayerWon: number[];
}

export interface BattleTowerSave {
  var_4AE: number[];
  curChallengeBattleNum: number[];
  curStreakChallengesNum: number[];
  battleTowerLevelType: number;
  battleTowerTrainerId: number;
  battledTrainerIds: number[];
  ereaderTrainer: BattleTowerEReaderTrainer;
  records: BattleTowerRecord[];
  playerRecord: BattleTowerRecord;
  selectedPartyMons: number[];
  totalBattleTowerWins: number;
  currentWinStreaks: number[];
  recordWinStreaks: number[];
  bestBattleTowerWinStreak: number;
  unk_554: number;
  lastStreakLevelType: number;
  battleOutcome: number;
  prizeItem: number;
  defeatedByTrainerName: number[];
  defeatedBySpecies: number;
  firstMonSpecies: number;
  firstMonNickname: number[];
}

export interface BattleTowerRuntime {
  battleTower: BattleTowerSave;
  playerGender: number;
  playerTrainerId: number[];
  playerName: number[];
  easyChatBattleStart: number[];
  playerParty: TowerMon[];
  savedPlayerParty: TowerMon[];
  enemyParty: TowerMon[];
  battleMons: TowerMon[];
  selectedOrderFromParty: number[];
  gSpecialVar_0x8004: number;
  gSpecialVar_0x8005: number;
  gSpecialVar_Result: number;
  gStringVar1: string;
  gStringVar4: string;
  gBattleOutcome: number;
  gBattleTypeFlags: number;
  gTrainerBattleOpponent_A: number;
  ewram160FB: number;
  sSpecialVar_0x8004_Copy: number;
  randomValues: number[];
  randomFallback: number;
  vars: Record<number, number>;
  gameStats: Record<number, number>;
  operations: string[];
  bagAcceptsItem: boolean;
  battleTransitionDone: boolean;
  facilityClassToPicIndex: number[];
  facilityClassToTrainerClass: number[];
  battleTowerTrainers: BattleTowerTrainer[];
  level50Mons: BattleTowerPokemonTemplate[];
  level100Mons: BattleTowerPokemonTemplate[];
  pokedexCaught: Set<number>;
}

export const createBattleTowerRuntime = (overrides: Partial<BattleTowerRuntime> = {}): BattleTowerRuntime => {
  const battleTower = createBattleTowerSave();
  const runtime: BattleTowerRuntime = {
    battleTower,
    playerGender: MALE,
    playerTrainerId: [1, 2, 3, 4],
    playerName: [80, 76, 65, 89, 69, 82, 0],
    easyChatBattleStart: [1, 2, 3, 4, 5, 6],
    playerParty: Array.from({ length: PARTY_SIZE }, (_, i) => createTowerMon({ species: i + 1, hp: 10, level: 50 })),
    savedPlayerParty: Array.from({ length: PARTY_SIZE }, () => createTowerMon()),
    enemyParty: Array.from({ length: 3 }, () => createTowerMon()),
    battleMons: [createTowerMon({ species: 10, nickname: [65, 0] }), createTowerMon({ species: 11 })],
    selectedOrderFromParty: [1, 2, 3],
    gSpecialVar_0x8004: 0,
    gSpecialVar_0x8005: 0,
    gSpecialVar_Result: 0,
    gStringVar1: '',
    gStringVar4: '',
    gBattleOutcome: 0,
    gBattleTypeFlags: 0,
    gTrainerBattleOpponent_A: 0,
    ewram160FB: 0,
    sSpecialVar_0x8004_Copy: 0,
    randomValues: [],
    randomFallback: 0,
    vars: {},
    gameStats: {},
    operations: [],
    bagAcceptsItem: true,
    battleTransitionDone: false,
    facilityClassToPicIndex: Array.from({ length: 256 }, (_, i) => i + 100),
    facilityClassToTrainerClass: Array.from({ length: 256 }, (_, i) => i + 200),
    battleTowerTrainers: Array.from({ length: 100 }, (_, i) => ({ trainerClass: i % 10, name: [65 + (i % 26), 0], greeting: [1, 2, 3, 4, 5, 6], teamFlags: 0 })),
    level50Mons: Array.from({ length: 300 }, (_, i) => ({ species: i + 1, heldItem: i % 10, moves: [1, 2, 3, 4], evSpread: 0, teamFlags: 0 })),
    level100Mons: Array.from({ length: 300 }, (_, i) => ({ species: i + 1, heldItem: i % 10, moves: [1, 2, 3, 4], evSpread: 0, teamFlags: 0 })),
    pokedexCaught: new Set(),
    ...overrides
  };
  return runtime;
};

export const createTowerMon = (overrides: Partial<TowerMon> = {}): TowerMon => ({
  species: SPECIES_NONE,
  heldItem: ITEM_NONE,
  hp: 0,
  level: 0,
  moves: [0, 0, 0, 0],
  evSpread: 0,
  friendship: 255,
  nickname: [],
  ribbons: {},
  ...overrides
});

export const createBattleTowerRecord = (overrides: Partial<BattleTowerRecord> = {}): BattleTowerRecord => ({
  battleTowerLevelType: 0,
  trainerClass: 0,
  trainerId: [0, 0, 0, 0],
  name: [0, 0, 0, 0, 0, 0, 0],
  winStreak: 0,
  greeting: [0, 0, 0, 0, 0, 0],
  party: Array.from({ length: 3 }, () => createTowerMon()),
  checksum: 0,
  ...overrides
});

export const createEReaderTrainer = (overrides: Partial<BattleTowerEReaderTrainer> = {}): BattleTowerEReaderTrainer => ({
  ...createBattleTowerRecord(),
  farewellPlayerLost: [0, 0, 0, 0, 0, 0],
  farewellPlayerWon: [0, 0, 0, 0, 0, 0],
  ...overrides
});

export const createBattleTowerSave = (): BattleTowerSave => ({
  var_4AE: [0, 0],
  curChallengeBattleNum: [1, 1],
  curStreakChallengesNum: [1, 1],
  battleTowerLevelType: 0,
  battleTowerTrainerId: 0,
  battledTrainerIds: Array.from({ length: 7 }, () => 0),
  ereaderTrainer: createEReaderTrainer(),
  records: Array.from({ length: 5 }, () => createBattleTowerRecord()),
  playerRecord: createBattleTowerRecord(),
  selectedPartyMons: [1, 2, 3],
  totalBattleTowerWins: 0,
  currentWinStreaks: [0, 0],
  recordWinStreaks: [0, 0],
  bestBattleTowerWinStreak: 0,
  unk_554: 0,
  lastStreakLevelType: 0,
  battleOutcome: 0,
  prizeItem: 0,
  defeatedByTrainerName: [],
  defeatedBySpecies: 0,
  firstMonSpecies: 0,
  firstMonNickname: []
});

export const BattleTowerMapScript2 = (runtime: BattleTowerRuntime): void => {
  let count = 0;
  for (let levelType = 0; levelType < 2; levelType++) {
    switch (runtime.battleTower.var_4AE[levelType]) {
      default:
      case 0:
        ResetBattleTowerStreak(runtime, levelType);
        if (count === 0) VarSet(runtime, VAR_TEMP_0, 5);
        break;
      case 1:
        ResetBattleTowerStreak(runtime, levelType);
        VarSet(runtime, VAR_TEMP_0, BTSPECIAL_RESULT_SAVE_SCUM);
        count++;
        break;
      case 3:
      case 6:
        break;
      case 4:
        VarSet(runtime, VAR_TEMP_0, BTSPECIAL_RESULT_WON7);
        count++;
        break;
      case 5:
        VarSet(runtime, VAR_TEMP_0, BTSPECIAL_RESULT_LOST);
        count++;
        break;
      case 2:
        VarSet(runtime, VAR_TEMP_0, BTSPECIAL_RESULT_QUICKSAVE);
        count++;
        break;
    }
  }
  if (runtime.battleTower.var_4AE[0] === 3 && runtime.battleTower.var_4AE[1] === 3) VarSet(runtime, VAR_TEMP_0, BTSPECIAL_RESULT_INACTIVE);
  ValidateBattleTowerRecordChecksums(runtime);
};

export const ResetBattleTowerStreak = (runtime: BattleTowerRuntime, levelType: number): void => {
  runtime.battleTower.var_4AE[levelType] = 0;
  runtime.battleTower.curChallengeBattleNum[levelType] = 1;
  runtime.battleTower.curStreakChallengesNum[levelType] = 1;
};

export const ShouldBattleEReaderTrainer = (runtime: BattleTowerRuntime, levelType: number, winStreak: number): boolean => {
  const validPartySpecies: number[] = [];
  const validPartyHeldItems: number[] = [];
  ValidateEReaderTrainer(runtime);
  if (runtime.gSpecialVar_Result !== 0 || runtime.battleTower.ereaderTrainer.winStreak !== winStreak) return false;
  const trainerTeamLevel = levelType !== 0 ? 100 : 50;
  for (let i = 0; i < 3; i++) {
    const mon = runtime.battleTower.ereaderTrainer.party[i];
    if (mon.level !== trainerTeamLevel) return false;
    CheckMonBattleTowerBanlist(mon.species, mon.heldItem, 1, levelType, mon.level, validPartySpecies, validPartyHeldItems);
  }
  return validPartySpecies.length === 3;
};

export const ChooseSpecialBattleTowerTrainer = (runtime: BattleTowerRuntime): boolean => {
  const levelType = runtime.battleTower.battleTowerLevelType;
  const winStreak = GetCurrentBattleTowerWinStreak(runtime, levelType);
  if (ShouldBattleEReaderTrainer(runtime, levelType, winStreak)) {
    runtime.battleTower.battleTowerTrainerId = BATTLE_TOWER_EREADER_TRAINER_ID;
    return true;
  }
  const trainerIds: number[] = [];
  for (let recordIndex = 0; recordIndex < 5; recordIndex++) {
    const record = runtime.battleTower.records[recordIndex];
    const recordHasData = checksumWords(record, false, true) !== 0;
    const checksum = checksumWords(record);
    if (record.winStreak === winStreak && record.battleTowerLevelType === levelType && recordHasData && record.checksum === checksum) trainerIds.push(recordIndex);
  }
  if (trainerIds.length === 0) return false;
  runtime.battleTower.battleTowerTrainerId = trainerIds[Random(runtime) % trainerIds.length] + BATTLE_TOWER_RECORD_MIXING_TRAINER_BASE_ID;
  return true;
};

export const ChooseNextBattleTowerTrainer = (runtime: BattleTowerRuntime): void => {
  const levelType = runtime.battleTower.battleTowerLevelType;
  if (ChooseSpecialBattleTowerTrainer(runtime)) {
    SetBattleTowerTrainerGfxId(runtime, runtime.battleTower.battleTowerTrainerId);
    runtime.battleTower.battledTrainerIds[runtime.battleTower.curChallengeBattleNum[levelType] - 1] = runtime.battleTower.battleTowerTrainerId;
    return;
  }
  let trainerId = 0;
  if (runtime.battleTower.curStreakChallengesNum[levelType] <= 7) {
    if (runtime.battleTower.curChallengeBattleNum[levelType] === 7) {
      do {
        trainerId = (((Random(runtime) & 0xff) * 5) >> 7) + (runtime.battleTower.curStreakChallengesNum[levelType] - 1) * 10 + 20;
      } while (wasBattled(runtime, trainerId, levelType));
    } else {
      do {
        trainerId = (((Random(runtime) & 0xff) * 5) >> 6) + (runtime.battleTower.curStreakChallengesNum[levelType] - 1) * 10;
      } while (wasBattled(runtime, trainerId, levelType));
    }
  } else {
    do {
      trainerId = (((Random(runtime) & 0xff) * 30) >> 8) + 70;
    } while (wasBattled(runtime, trainerId, levelType));
  }
  runtime.battleTower.battleTowerTrainerId = trainerId;
  SetBattleTowerTrainerGfxId(runtime, trainerId);
  if (runtime.battleTower.curChallengeBattleNum[levelType] < 7) runtime.battleTower.battledTrainerIds[runtime.battleTower.curChallengeBattleNum[levelType] - 1] = trainerId;
};

export const SetBattleTowerTrainerGfxId = (runtime: BattleTowerRuntime, _trainerClass: number): void => {
  VarSet(runtime, VAR_OBJ_GFX_ID_0, OBJ_EVENT_GFX_YOUNGSTER);
};
export const SetEReaderTrainerGfxId = (runtime: BattleTowerRuntime): void => SetBattleTowerTrainerGfxId(runtime, BATTLE_TOWER_EREADER_TRAINER_ID);

export const GetBattleTowerTrainerFrontSpriteId = (runtime: BattleTowerRuntime): number => runtime.facilityClassToPicIndex[getTrainerClass(runtime)];
export const GetBattleTowerTrainerClassNameId = (runtime: BattleTowerRuntime): number => runtime.facilityClassToTrainerClass[getTrainerClass(runtime)];
export const GetBattleTowerTrainerName = (runtime: BattleTowerRuntime): number[] => {
  const id = runtime.battleTower.battleTowerTrainerId;
  const src = id === BATTLE_TOWER_EREADER_TRAINER_ID
    ? runtime.battleTower.ereaderTrainer.name.slice(0, 7)
    : id < BATTLE_TOWER_RECORD_MIXING_TRAINER_BASE_ID
      ? (runtime.battleTowerTrainers[id]?.name ?? []).slice(0, 3)
      : runtime.battleTower.records[id - BATTLE_TOWER_RECORD_MIXING_TRAINER_BASE_ID].name.slice(0, 7);
  return [...src, 0];
};

export const FillBattleTowerTrainerParty = (runtime: BattleTowerRuntime): void => {
  let battleMonsOffset = 0;
  let monPoolSize = 60;
  let fixedIV = 6;
  let friendship = 255;
  const id = runtime.battleTower.battleTowerTrainerId;
  runtime.enemyParty = Array.from({ length: 3 }, () => createTowerMon());
  if (id < 20) fixedIV = 6;
  else if (id < 30) { fixedIV = 9; battleMonsOffset = 30; }
  else if (id < 40) { fixedIV = 12; battleMonsOffset = 60; }
  else if (id < 50) { fixedIV = 15; battleMonsOffset = 90; }
  else if (id < 60) { fixedIV = 18; battleMonsOffset = 120; }
  else if (id < 70) { fixedIV = 21; battleMonsOffset = 150; }
  else if (id < 80) { fixedIV = 31; battleMonsOffset = 180; }
  else if (id < BATTLE_TOWER_RECORD_MIXING_TRAINER_BASE_ID) { fixedIV = 31; battleMonsOffset = 200; monPoolSize = 100; }
  else if (id === BATTLE_TOWER_EREADER_TRAINER_ID) {
    runtime.enemyParty = runtime.battleTower.ereaderTrainer.party.map((mon) => createTowerMon({ ...mon }));
    return;
  } else {
    runtime.enemyParty = runtime.battleTower.records[id - BATTLE_TOWER_RECORD_MIXING_TRAINER_BASE_ID].party.map((mon) => createTowerMon({ ...mon }));
    return;
  }
  const battleTowerMons = runtime.battleTower.battleTowerLevelType !== 0 ? runtime.level100Mons : runtime.level50Mons;
  const level = runtime.battleTower.battleTowerLevelType !== 0 ? 100 : 50;
  const teamFlags = runtime.battleTowerTrainers[id]?.teamFlags ?? 0;
  const chosenMonIndices: number[] = [];
  let partyIndex = 0;
  while (partyIndex !== 3) {
    const battleMonIndex = Math.floor(((Random(runtime) & 0xff) * monPoolSize) / 256) + battleMonsOffset;
    const tmpl = battleTowerMons[battleMonIndex];
    if (!tmpl) continue;
    if (teamFlags === 0 || (tmpl.teamFlags & teamFlags) === teamFlags) {
      if (runtime.enemyParty.slice(0, partyIndex).some((mon) => mon.species === tmpl.species)) continue;
      const held = sBattleTowerHeldItems[tmpl.heldItem] ?? ITEM_NONE;
      if (held !== ITEM_NONE && runtime.enemyParty.slice(0, partyIndex).some((mon) => mon.heldItem === held)) continue;
      if (chosenMonIndices.includes(battleMonIndex)) continue;
      chosenMonIndices[partyIndex] = battleMonIndex;
      if (tmpl.moves.includes(MOVE_FRUSTRATION)) friendship = 0;
      runtime.enemyParty[partyIndex] = createTowerMon({ species: tmpl.species, level, heldItem: held, moves: [...tmpl.moves], evSpread: tmpl.evSpread, friendship, hp: fixedIV });
      partyIndex++;
    }
  }
};

export const CheckMonBattleTowerBanlist = (species: number, heldItem: number, hp: number, levelType: number, monLevel: number, validPartySpecies: number[], validPartyHeldItems: number[]): void => {
  if (species === SPECIES_EGG || species === SPECIES_NONE) return;
  if (gBattleTowerBannedSpecies.includes(species as never)) return;
  if (levelType === 0 && monLevel > 50) return;
  if (validPartySpecies.includes(species)) return;
  if (heldItem !== ITEM_NONE && validPartyHeldItems.includes(heldItem)) return;
  if (hp === 0) return;
  validPartySpecies.push(species);
  validPartyHeldItems.push(heldItem);
};

export const CheckPartyBattleTowerBanlist = (runtime: BattleTowerRuntime): void => {
  const validSpecies: number[] = [];
  const validItems: number[] = [];
  for (let i = 0; i < PARTY_SIZE; i++) {
    const mon = runtime.playerParty[i];
    CheckMonBattleTowerBanlist(mon.species, mon.heldItem, mon.hp, runtime.gSpecialVar_Result, mon.level, validSpecies, validItems);
  }
  if (validSpecies.length < 3) {
    runtime.gStringVar1 = '';
    runtime.gSpecialVar_0x8004 = 1;
    let count = 0;
    for (const species of gBattleTowerBannedSpecies) {
      if (species === 0xffff) break;
      count = AppendBattleTowerBannedSpeciesName(runtime, species, count);
    }
    runtime.gStringVar1 = runtime.gStringVar1.replace(/\s$/, '');
    runtime.gStringVar1 += count < 3 ? ' is banned.' : ' are banned.';
  } else {
    runtime.gSpecialVar_0x8004 = 0;
    runtime.battleTower.battleTowerLevelType = runtime.gSpecialVar_Result;
  }
};

export const AppendBattleTowerBannedSpeciesName = (runtime: BattleTowerRuntime, species: number, count: number): number => {
  if (runtime.pokedexCaught.has(species)) {
    if (count === 0) runtime.gStringVar1 += ' ';
    count++;
    runtime.gStringVar1 += `Species${species}`;
    runtime.gStringVar1 += [2].includes(count) ? '\n\n' : [5, 8, 11].includes(count) ? '\n' : ' ';
  }
  return count;
};

export const BufferBattleTowerTrainerMessage = (runtime: BattleTowerRuntime, greeting: number[]): void => {
  runtime.gStringVar4 = greeting.join(',');
  if (greeting.length <= 6) runtime.gStringVar4 += '|PROMPT_SCROLL';
};
export const PrintBattleTowerTrainerGreeting = (runtime: BattleTowerRuntime): void => BufferBattleTowerTrainerMessage(runtime, getGreeting(runtime));

export const StartSpecialBattle = (runtime: BattleTowerRuntime): void => {
  runtime.sSpecialVar_0x8004_Copy = runtime.gSpecialVar_0x8004;
  switch (runtime.sSpecialVar_0x8004_Copy) {
    case 0:
      runtime.gBattleTypeFlags = BATTLE_TYPE_BATTLE_TOWER | BATTLE_TYPE_TRAINER;
      runtime.gTrainerBattleOpponent_A = 0;
      FillBattleTowerTrainerParty(runtime);
      startBattleTransition(runtime);
      break;
    case 1:
      for (let i = 0; i < PARTY_SIZE; i++) runtime.savedPlayerParty[i].heldItem = runtime.playerParty[i].heldItem;
      startBattleTransition(runtime);
      break;
    case 2:
      runtime.enemyParty = runtime.battleTower.ereaderTrainer.party.map((mon) => createTowerMon({ ...mon }));
      runtime.gBattleTypeFlags = BATTLE_TYPE_EREADER_TRAINER | BATTLE_TYPE_TRAINER;
      runtime.gTrainerBattleOpponent_A = 0;
      startBattleTransition(runtime);
      break;
  }
};

export const Task_WaitBT = (runtime: BattleTowerRuntime, taskId: number): void => {
  if (runtime.battleTransitionDone) {
    op(runtime, 'savedCallback:CB2_FinishEReaderBattle');
    op(runtime, 'CleanupOverworldWindowsAndTilemaps');
    op(runtime, 'SetMainCallback2:CB2_InitBattle');
    op(runtime, `DestroyTask:${taskId}`);
  }
};

export const CB2_FinishEReaderBattle = (runtime: BattleTowerRuntime): void => {
  if (runtime.sSpecialVar_0x8004_Copy === 1) {
    for (let i = 0; i < PARTY_SIZE; i++) runtime.playerParty[i].heldItem = runtime.savedPlayerParty[i].heldItem;
  } else if (runtime.sSpecialVar_0x8004_Copy === 2) PrintEReaderTrainerFarewellMessage(runtime);
  op(runtime, 'SetMainCallback2:CB2_ReturnToFieldContinueScriptPlayMapMusic');
};

export const SetBattleTowerProperty = (runtime: BattleTowerRuntime): void => {
  const levelType = runtime.battleTower.battleTowerLevelType;
  switch (runtime.gSpecialVar_0x8004) {
    case 0: runtime.ewram160FB = runtime.battleTower.var_4AE[levelType]; runtime.battleTower.var_4AE[levelType] = runtime.gSpecialVar_0x8005; break;
    case 1: runtime.battleTower.battleTowerLevelType = runtime.gSpecialVar_0x8005; break;
    case 2: runtime.battleTower.curChallengeBattleNum[levelType] = runtime.gSpecialVar_0x8005; break;
    case 3: runtime.battleTower.curStreakChallengesNum[levelType] = runtime.gSpecialVar_0x8005; break;
    case 4: runtime.battleTower.battleTowerTrainerId = runtime.gSpecialVar_0x8005; break;
    case 5: for (let i = 0; i < 3; i++) runtime.battleTower.selectedPartyMons[i] = runtime.selectedOrderFromParty[i]; break;
    case 6:
      if (runtime.battleTower.battleTowerTrainerId === BATTLE_TOWER_EREADER_TRAINER_ID) ClearEReaderTrainer(runtime, runtime.battleTower.ereaderTrainer);
      if (runtime.battleTower.totalBattleTowerWins < 9999) runtime.battleTower.totalBattleTowerWins++;
      runtime.battleTower.curChallengeBattleNum[levelType]++;
      SaveCurrentWinStreak(runtime);
      runtime.gSpecialVar_Result = runtime.battleTower.curChallengeBattleNum[levelType];
      runtime.gStringVar1 = String.fromCharCode(runtime.battleTower.curChallengeBattleNum[levelType] + 0xa1);
      break;
    case 7:
      if (runtime.battleTower.curStreakChallengesNum[levelType] < 1430) runtime.battleTower.curStreakChallengesNum[levelType]++;
      SaveCurrentWinStreak(runtime);
      runtime.gSpecialVar_Result = runtime.battleTower.curStreakChallengesNum[levelType];
      break;
    case 8: runtime.battleTower.unk_554 = runtime.gSpecialVar_0x8005; break;
    case 10: SetGameStat(runtime, GAME_STAT_BATTLE_TOWER_BEST_STREAK, runtime.battleTower.bestBattleTowerWinStreak); break;
    case 11: if (runtime.battleTower.var_4AE[levelType] !== 3) ResetBattleTowerStreak(runtime, levelType); break;
    case 12: runtime.battleTower.var_4AE[levelType] = runtime.ewram160FB; break;
    case 13: runtime.battleTower.currentWinStreaks[levelType] = GetCurrentBattleTowerWinStreak(runtime, levelType); break;
    case 14: runtime.battleTower.lastStreakLevelType = runtime.battleTower.battleTowerLevelType; break;
  }
};

export const BattleTowerUtil = (runtime: BattleTowerRuntime): void => {
  const levelType = runtime.battleTower.battleTowerLevelType;
  switch (runtime.gSpecialVar_0x8004) {
    case 0: runtime.gSpecialVar_Result = runtime.battleTower.var_4AE[levelType]; break;
    case 1: runtime.gSpecialVar_Result = runtime.battleTower.battleTowerLevelType; break;
    case 2: runtime.gSpecialVar_Result = runtime.battleTower.curChallengeBattleNum[levelType]; break;
    case 3: runtime.gSpecialVar_Result = runtime.battleTower.curStreakChallengesNum[levelType]; break;
    case 4: runtime.gSpecialVar_Result = runtime.battleTower.battleTowerTrainerId; break;
    case 8: runtime.gSpecialVar_Result = runtime.battleTower.unk_554; break;
    case 9: runtime.gSpecialVar_Result = GetCurrentBattleTowerWinStreak(runtime, levelType); break;
    case 10: SetGameStat(runtime, GAME_STAT_BATTLE_TOWER_BEST_STREAK, runtime.battleTower.bestBattleTowerWinStreak); break;
    case 11: ResetBattleTowerStreak(runtime, levelType); break;
    case 12: runtime.battleTower.var_4AE[levelType] = runtime.ewram160FB; break;
    case 13: runtime.battleTower.currentWinStreaks[levelType] = GetCurrentBattleTowerWinStreak(runtime, levelType); break;
    case 14: runtime.battleTower.lastStreakLevelType = runtime.battleTower.battleTowerLevelType; break;
  }
};

export const SetBattleTowerParty = (runtime: BattleTowerRuntime): void => {
  for (let i = 0; i < 3; i++) runtime.selectedOrderFromParty[i] = runtime.battleTower.selectedPartyMons[i];
  op(runtime, 'ReducePlayerPartyToThree');
};

export const SaveCurrentWinStreak = (runtime: BattleTowerRuntime): void => {
  const levelType = runtime.battleTower.battleTowerLevelType;
  let streak = GetCurrentBattleTowerWinStreak(runtime, levelType);
  if (runtime.battleTower.recordWinStreaks[levelType] < streak) runtime.battleTower.recordWinStreaks[levelType] = streak;
  streak = runtime.battleTower.recordWinStreaks[0] > runtime.battleTower.recordWinStreaks[1] ? runtime.battleTower.recordWinStreaks[0] : runtime.battleTower.recordWinStreaks[1];
  SetGameStat(runtime, GAME_STAT_BATTLE_TOWER_BEST_STREAK, streak);
  runtime.battleTower.bestBattleTowerWinStreak = streak > 9999 ? 9999 : streak;
};

export const SaveBattleTowerProgress = (runtime: BattleTowerRuntime): void => {
  const levelType = runtime.battleTower.battleTowerLevelType;
  if ((runtime.gSpecialVar_0x8004 === 3 || runtime.gSpecialVar_0x8004 === 0)
    && (runtime.battleTower.curStreakChallengesNum[levelType] > 1 || runtime.battleTower.curChallengeBattleNum[levelType] > 1)) SetPlayerBattleTowerRecord(runtime);
  PopulateBravoTrainerBattleTowerLostData(runtime);
  runtime.battleTower.battleOutcome = runtime.gBattleOutcome;
  if (runtime.gSpecialVar_0x8004 !== 3) runtime.battleTower.var_4AE[levelType] = runtime.gSpecialVar_0x8004;
  VarSet(runtime, VAR_TEMP_0, BTSPECIAL_TEST);
  runtime.battleTower.unk_554 = 1;
  op(runtime, 'TrySavingData:SAVE_EREADER');
};

export const SetPlayerBattleTowerRecord = (runtime: BattleTowerRuntime): void => {
  const record = runtime.battleTower.playerRecord;
  const levelType = runtime.battleTower.battleTowerLevelType;
  const ids = runtime.playerTrainerId.reduce((a, b) => a + b, 0);
  record.battleTowerLevelType = levelType;
  record.trainerClass = ids % 10;
  record.trainerId = [...runtime.playerTrainerId];
  record.name = [...runtime.playerName];
  record.winStreak = GetCurrentBattleTowerWinStreak(runtime, levelType);
  record.greeting = runtime.easyChatBattleStart.slice(0, 6);
  for (let i = 0; i < 3; i++) record.party[i] = createTowerMon({ ...runtime.playerParty[runtime.battleTower.selectedPartyMons[i] - 1] });
  SetBattleTowerRecordChecksum(record);
  SaveCurrentWinStreak(runtime);
};

export const ValidateBattleTowerRecordChecksums = (runtime: BattleTowerRuntime): void => {
  if (runtime.battleTower.playerRecord.checksum !== checksumWords(runtime.battleTower.playerRecord)) ClearBattleTowerRecord(runtime.battleTower.playerRecord);
  for (const record of runtime.battleTower.records) if (record.checksum !== checksumWords(record)) ClearBattleTowerRecord(record);
};
export const SetBattleTowerRecordChecksum = (record: BattleTowerRecord): void => { record.checksum = checksumWords(record); };
export const ClearBattleTowerRecord = (record: BattleTowerRecord): void => {
  Object.assign(record, createBattleTowerRecord());
};

const cloneTowerMon = (mon: TowerMon): TowerMon => createTowerMon({
  ...mon,
  moves: [...mon.moves],
  nickname: mon.nickname ? [...mon.nickname] : undefined,
  ribbons: mon.ribbons ? { ...mon.ribbons } : undefined
});

const cloneBattleTowerRecord = (record: BattleTowerRecord): BattleTowerRecord => ({
  battleTowerLevelType: record.battleTowerLevelType,
  trainerClass: record.trainerClass,
  trainerId: [...record.trainerId],
  name: [...record.name],
  winStreak: record.winStreak,
  greeting: [...record.greeting],
  party: record.party.map((mon) => cloneTowerMon(mon)),
  checksum: record.checksum
});

export const UpdateOrInsertReceivedBattleTowerRecord = (
  runtime: BattleTowerRuntime,
  record0: BattleTowerRecord
): void => {
  const record = record0;
  const winStreaks = Array.from({ length: 6 }, () => 0);
  const indices = Array.from({ length: 6 }, () => 0);
  let l = 0;
  let i = 0;
  let j = 0;
  let k = 0;

  for (i = 0; i < 5; i += 1) {
    k = 0;
    for (j = 0; j < 4; j += 1) {
      if (runtime.battleTower.records[i].trainerId[j] !== record.trainerId[j]) {
        break;
      }
    }
    if (j === 4) {
      for (k = 0; k < 7; k += 1) {
        if (runtime.battleTower.records[i].name[j] !== record.name[j]) {
          break;
        }
        if (record.name[j] === 0) {
          k = 7;
          break;
        }
      }
    }
    if (k === 7) {
      break;
    }
  }

  if (i < 5) {
    runtime.battleTower.records[i] = cloneBattleTowerRecord(record);
    return;
  }

  for (i = 0; i < 5; i += 1) {
    if (runtime.battleTower.records[i].winStreak === 0) {
      break;
    }
  }

  if (i < 5) {
    runtime.battleTower.records[i] = cloneBattleTowerRecord(record);
    return;
  }

  winStreaks[0] = runtime.battleTower.records[0].winStreak;
  indices[0] = 0;
  l += 1;

  for (i = 1; i < 5; i += 1) {
    for (j = 0; j < l; j += 1) {
      if (runtime.battleTower.records[i].winStreak < winStreaks[j]) {
        j = 0;
        l = 1;
        winStreaks[0] = runtime.battleTower.records[i].winStreak;
        indices[0] = i;
        break;
      }
      if (runtime.battleTower.records[i].winStreak > winStreaks[j]) {
        break;
      }
    }
    if (j === l) {
      winStreaks[l] = runtime.battleTower.records[i].winStreak;
      indices[l] = i;
      l += 1;
    }
  }

  i = Random(runtime) % l;
  runtime.battleTower.records[indices[i]] = cloneBattleTowerRecord(record);
};

const getDebugTrainerClassFromPlayer = (runtime: BattleTowerRuntime): number => {
  const sum = runtime.playerTrainerId[0] + runtime.playerTrainerId[1] + runtime.playerTrainerId[2] + runtime.playerTrainerId[3];
  return sum % 10;
};

export const Debug_FillEReaderTrainerWithPlayerData = (runtime: BattleTowerRuntime): void => {
  const ereaderTrainer = runtime.battleTower.ereaderTrainer;
  ereaderTrainer.trainerClass = getDebugTrainerClassFromPlayer(runtime);
  ereaderTrainer.trainerId = [...runtime.playerTrainerId];
  ereaderTrainer.name = [...runtime.playerName];
  ereaderTrainer.winStreak = 1;

  let j = 7;
  for (let i = 0; i < 6; i += 1) {
    ereaderTrainer.greeting[i] = runtime.easyChatBattleStart[i];
    ereaderTrainer.farewellPlayerLost[i] = j;
    ereaderTrainer.farewellPlayerWon[i] = j + 6;
    j += 1;
  }

  for (let i = 0; i < 3; i += 1) {
    ereaderTrainer.party[i] = cloneTowerMon(runtime.playerParty[i]);
  }

  SetEReaderTrainerChecksum(ereaderTrainer);
};

export const PopulateBravoTrainerBattleTowerLostData = (runtime: BattleTowerRuntime): void => {
  runtime.battleTower.defeatedByTrainerName = GetBattleTowerTrainerName(runtime);
  runtime.battleTower.defeatedBySpecies = runtime.battleMons[1]?.species ?? SPECIES_NONE;
  runtime.battleTower.firstMonSpecies = runtime.battleMons[0]?.species ?? SPECIES_NONE;
  runtime.battleTower.firstMonNickname = [...(runtime.battleMons[0]?.nickname ?? [])];
};

export const GetCurrentBattleTowerWinStreak = (runtime: BattleTowerRuntime, levelType: number): number => {
  const winStreak = (runtime.battleTower.curStreakChallengesNum[levelType] - 1) * 7 - 1 + runtime.battleTower.curChallengeBattleNum[levelType];
  return winStreak > 9999 ? 9999 : winStreak;
};

export const DetermineBattleTowerPrize = (runtime: BattleTowerRuntime): void => {
  const levelType = runtime.battleTower.battleTowerLevelType;
  runtime.battleTower.prizeItem = runtime.battleTower.curStreakChallengesNum[levelType] - 1 > 5
    ? sLongStreakPrizes[Random(runtime) % sLongStreakPrizes.length]
    : sShortStreakPrizes[Random(runtime) % sShortStreakPrizes.length];
};

export const GiveBattleTowerPrize = (runtime: BattleTowerRuntime): void => {
  const levelType = runtime.battleTower.battleTowerLevelType;
  if (runtime.bagAcceptsItem) {
    runtime.gStringVar1 = `Item${runtime.battleTower.prizeItem}`;
    runtime.gSpecialVar_Result = 1;
  } else {
    runtime.gSpecialVar_Result = 0;
    runtime.battleTower.var_4AE[levelType] = 6;
  }
};

export const AwardBattleTowerRibbons = (runtime: BattleTowerRuntime): void => {
  const levelType = runtime.battleTower.battleTowerLevelType;
  const ribbonType = levelType !== 0 ? MON_DATA_VICTORY_RIBBON : MON_DATA_WINNING_RIBBON;
  runtime.gSpecialVar_Result = 0;
  if (GetCurrentBattleTowerWinStreak(runtime, levelType) > 55) {
    for (let i = 0; i < 3; i++) {
      const mon = runtime.playerParty[runtime.battleTower.selectedPartyMons[i] - 1];
      mon.ribbons ??= {};
      if (!mon.ribbons[ribbonType]) {
        runtime.gSpecialVar_Result = 1;
        mon.ribbons[ribbonType] = 1;
      }
    }
  }
  if (runtime.gSpecialVar_Result !== 0) IncrementGameStat(runtime, GAME_STAT_RECEIVED_RIBBONS);
};

export const ValidateEReaderTrainer = (runtime: BattleTowerRuntime): void => {
  runtime.gSpecialVar_Result = 0;
  const trainer = runtime.battleTower.ereaderTrainer;
  if (checksumWords(trainer, false, true) === 0) {
    runtime.gSpecialVar_Result = 1;
    return;
  }
  if (trainer.checksum !== checksumWords(trainer)) {
    ClearEReaderTrainer(runtime, trainer);
    runtime.gSpecialVar_Result = 1;
  }
};
export const SetEReaderTrainerChecksum = (trainer: BattleTowerEReaderTrainer): void => { trainer.checksum = checksumWords(trainer); };
export const ClearEReaderTrainer = (_runtime: BattleTowerRuntime, trainer: BattleTowerEReaderTrainer): void => {
  Object.assign(trainer, createEReaderTrainer());
};
export const GetEreaderTrainerFrontSpriteId = (runtime: BattleTowerRuntime): number => runtime.facilityClassToPicIndex[runtime.battleTower.ereaderTrainer.trainerClass];
export const GetEreaderTrainerClassId = (runtime: BattleTowerRuntime): number => runtime.facilityClassToTrainerClass[runtime.battleTower.ereaderTrainer.trainerClass];
export const CopyEReaderTrainerName5 = (runtime: BattleTowerRuntime): number[] => [...runtime.battleTower.ereaderTrainer.name.slice(0, 5), 0];
export const BufferEReaderTrainerGreeting = (runtime: BattleTowerRuntime): void => BufferBattleTowerTrainerMessage(runtime, runtime.battleTower.ereaderTrainer.greeting);

export const PrintEReaderTrainerFarewellMessage = (runtime: BattleTowerRuntime): void => {
  if (runtime.gBattleOutcome === B_OUTCOME_DREW) runtime.gStringVar4 = '';
  else if (runtime.gBattleOutcome === B_OUTCOME_WON) BufferBattleTowerTrainerMessage(runtime, runtime.battleTower.ereaderTrainer.farewellPlayerWon);
  else BufferBattleTowerTrainerMessage(runtime, runtime.battleTower.ereaderTrainer.farewellPlayerLost);
};

export const BattleTower_SoftReset = (runtime: BattleTowerRuntime): void => op(runtime, 'DoSoftReset');
export const Dummy_TryEnableBravoTrainerBattleTower = (runtime: BattleTowerRuntime): void => {
  for (let i = 0; i < 2; i++) if (runtime.battleTower.var_4AE[i] === 1) op(runtime, 'TakeBravoTrainerBattleTowerOffTheAir');
};

export const sBattleTowerHeldItems = Array.from({ length: 64 }, (_, i) => i === 0 ? ITEM_NONE : i + 100);

const getTrainerClass = (runtime: BattleTowerRuntime): number => {
  const id = runtime.battleTower.battleTowerTrainerId;
  if (id === BATTLE_TOWER_EREADER_TRAINER_ID) return runtime.battleTower.ereaderTrainer.trainerClass;
  if (id >= BATTLE_TOWER_RECORD_MIXING_TRAINER_BASE_ID) return runtime.battleTower.records[id - BATTLE_TOWER_RECORD_MIXING_TRAINER_BASE_ID].trainerClass;
  return runtime.battleTowerTrainers[id]?.trainerClass ?? 0;
};
const getGreeting = (runtime: BattleTowerRuntime): number[] => {
  const id = runtime.battleTower.battleTowerTrainerId;
  if (id === BATTLE_TOWER_EREADER_TRAINER_ID) return runtime.battleTower.ereaderTrainer.greeting;
  if (id < BATTLE_TOWER_RECORD_MIXING_TRAINER_BASE_ID) return runtime.battleTowerTrainers[id]?.greeting ?? [];
  return runtime.battleTower.records[id - BATTLE_TOWER_RECORD_MIXING_TRAINER_BASE_ID].greeting;
};
const wasBattled = (runtime: BattleTowerRuntime, trainerId: number, levelType: number): boolean => {
  for (let i = 0; i < runtime.battleTower.curChallengeBattleNum[levelType] - 1; i++) if (runtime.battleTower.battledTrainerIds[i] === trainerId) return true;
  return false;
};
const startBattleTransition = (runtime: BattleTowerRuntime): void => {
  op(runtime, 'CreateTask:Task_WaitBT:1');
  op(runtime, 'PlayMapChosenOrBattleBGM:0');
  op(runtime, 'BattleTransition_StartOnField:BattleTower');
};
const Random = (runtime: BattleTowerRuntime): number => runtime.randomValues.length ? runtime.randomValues.shift()! : (runtime.randomFallback++ & 0xff);
const VarSet = (runtime: BattleTowerRuntime, variable: number, value: number): void => { runtime.vars[variable] = value; };
const SetGameStat = (runtime: BattleTowerRuntime, stat: number, value: number): void => { runtime.gameStats[stat] = value; };
const IncrementGameStat = (runtime: BattleTowerRuntime, stat: number): void => { runtime.gameStats[stat] = (runtime.gameStats[stat] ?? 0) + 1; };
const op = (runtime: BattleTowerRuntime, operation: string): void => { runtime.operations.push(operation); };

const checksumWords = (value: unknown, includeChecksum = false, bitwiseOr = false): number => {
  const words = flattenWords(value, includeChecksum);
  return words.reduce((acc, word) => bitwiseOr ? (acc | word) >>> 0 : (acc + word) >>> 0, 0);
};
const flattenWords = (value: unknown, includeChecksum: boolean): number[] => {
  if (typeof value === 'number') return [value >>> 0];
  if (Array.isArray(value)) return value.flatMap((v) => flattenWords(v, includeChecksum));
  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .filter(([key]) => includeChecksum || key !== 'checksum')
      .flatMap(([, v]) => flattenWords(v, includeChecksum));
  }
  return [0];
};
