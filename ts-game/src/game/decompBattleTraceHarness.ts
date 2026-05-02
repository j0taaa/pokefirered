export const BATTLE_TRACE_HARNESS_MAGIC = 0x42545243;
export const TRACE_EVENT_COUNT = 64;
export const TRACE_MODE_WILD = 1;
export const TRACE_MODE_TRAINER = 2;
export const TRACE_PHASE_COMMAND = 1;
export const TRACE_PHASE_SHIFT_PROMPT = 2;
export const TRACE_PHASE_RESOLVED = 3;
export const TRACE_EVENT_CHOOSE_ACTION = 1;
export const TRACE_EVENT_CHOOSE_MOVE = 2;
export const TRACE_EVENT_CHOOSE_ITEM = 3;
export const TRACE_EVENT_CHOOSE_POKEMON = 4;
export const TRACE_EVENT_YES_NO_BOX = 5;
export const TRACE_EVENT_PRINT_STRING = 6;

export const BATTLE_TRACE_FIXTURE_NONE = 0;
export const BATTLE_TRACE_FIXTURE_WILD_OPENING_EXCHANGE = 1;
export const BATTLE_TRACE_FIXTURE_TRAINER_SHIFT_PROMPT = 2;
export const BATTLE_TRACE_FIXTURE_WILD_CATCH = 3;
export const BATTLE_TRACE_FIXTURE_BATTLE_WHITEOUT = 4;
export const BATTLE_TRACE_FIXTURE_WILD_STATUS_EXCHANGE = 5;
export const BATTLE_TRACE_FIXTURE_WILD_PLAYER_SWITCH = 6;
export const BATTLE_TRACE_FIXTURE_WILD_RUN_ESCAPE = 7;

export const B_ACTION_USE_MOVE = 0;
export const B_ACTION_USE_ITEM = 1;
export const B_ACTION_SWITCH = 2;
export const B_ACTION_RUN = 3;
export const B_SIDE_PLAYER = 0;
export const B_SIDE_OPPONENT = 1;
export const B_POSITION_PLAYER_LEFT = 0;
export const B_POSITION_OPPONENT_LEFT = 1;
export const BATTLE_TYPE_IS_MASTER = 1 << 2;
export const BATTLE_TYPE_TRAINER = 1 << 3;
export const B_OUTCOME_LOST = 2;
export const B_OUTCOME_RAN = 4;
export const B_OUTCOME_CAUGHT = 7;
export const STATUS1_NONE = 0;

export const ITEM_POKE_BALL = 4;
export const MOVE_TACKLE = 33;
export const MOVE_TAIL_WHIP = 39;
export const MOVE_GROWL = 45;
export const MOVE_SPLASH = 150;
export const SPECIES_NONE = 0;
export const SPECIES_BULBASAUR = 1;
export const SPECIES_PIDGEY = 16;
export const SPECIES_RATTATA = 19;
export const SPECIES_GEODUDE = 74;
export const SPECIES_MAGIKARP = 129;
export const TRAINER_LEADER_BROCK = 0x19e;

export interface BattleTraceHarnessRequest {
  magic: number;
  fixtureId: number;
  reserved: number;
}

export interface BattleTraceHarnessEvent {
  kind: number;
  battler: number;
  value: number;
  extra: number;
}

export interface BattleTraceHarnessBattlerResult {
  side: number;
  partyIndex: number;
  absent: number;
  reserved: number;
  status: number;
  species: number;
  hp: number;
  maxHp: number;
  chosen: number;
  printed: number;
  result: number;
  landed: number;
}

export interface BattleTraceHarnessResult {
  ready: boolean;
  mode: number;
  phase: number;
  battlerCount: number;
  eventCount: number;
  turn: number;
  outcome: number;
  battlers: BattleTraceHarnessBattlerResult[];
  events: BattleTraceHarnessEvent[];
}

export interface BattleTraceMon {
  species: number;
  level: number;
  hp: number;
  maxHP: number;
  speed: number;
  moves: number[];
}

export interface BattleTraceHarnessState {
  active: boolean;
  booted: boolean;
  completed: boolean;
  introSkipped: boolean;
  fixtureId: number;
  mode: number;
  chooseActionRequests: number;
  sawShiftPrompt: boolean;
  activeUpdateCount: number;
  eventCount: number;
  events: BattleTraceHarnessEvent[];
}

export interface BattleTraceRuntime {
  gBattleTraceHarnessRequest: BattleTraceHarnessRequest;
  gBattleTraceHarnessResult: BattleTraceHarnessResult;
  sBattleTraceHarness: BattleTraceHarnessState;
  gPlayerParty: BattleTraceMon[];
  gEnemyParty: BattleTraceMon[];
  gPlayerPartyCount: number;
  gEnemyPartyCount: number;
  gBattleTypeFlags: number;
  gTrainerBattleOpponent_A: number;
  gSaveBlock2Ptr: { optionsBattleStyle: number } | null;
  gSaveBlock1Ptr: { bag: Record<number, number> } | null;
  rngSeed: number;
  gBattlersCount: number;
  gBattlerPartyIndexes: number[];
  gAbsentBattlerFlags: number;
  gBitTable: number[];
  gBattleMons: Array<{ species: number; hp: number; maxHP: number; status1: number }>;
  gBattlerPositions: number[];
  gChosenMoveByBattler: number[];
  gLastPrintedMoves: number[];
  gLastMoves: number[];
  gLastLandedMoves: number[];
  gBattleResults: { battleTurnCounter: number };
  gBattleOutcome: number;
  operations: string[];
  debug: string[];
}

const emptyMon = (): BattleTraceMon => ({ species: SPECIES_NONE, level: 0, hp: 0, maxHP: 0, speed: 0, moves: [0, 0, 0, 0] });
const emptyBattler = (): BattleTraceHarnessBattlerResult => ({
  side: 0,
  partyIndex: 0,
  absent: 0,
  reserved: 0,
  status: 0,
  species: 0,
  hp: 0,
  maxHp: 0,
  chosen: 0,
  printed: 0,
  result: 0,
  landed: 0
});

const emptyResult = (): BattleTraceHarnessResult => ({
  ready: false,
  mode: 0,
  phase: 0,
  battlerCount: 0,
  eventCount: 0,
  turn: 0,
  outcome: 0,
  battlers: Array.from({ length: 4 }, emptyBattler),
  events: []
});

const emptyState = (): BattleTraceHarnessState => ({
  active: false,
  booted: false,
  completed: false,
  introSkipped: false,
  fixtureId: 0,
  mode: 0,
  chooseActionRequests: 0,
  sawShiftPrompt: false,
  activeUpdateCount: 0,
  eventCount: 0,
  events: []
});

export const createBattleTraceRuntime = (overrides: Partial<BattleTraceRuntime> = {}): BattleTraceRuntime => ({
  gBattleTraceHarnessRequest: { magic: 0, fixtureId: 0, reserved: 0 },
  gBattleTraceHarnessResult: emptyResult(),
  sBattleTraceHarness: emptyState(),
  gPlayerParty: Array.from({ length: 6 }, emptyMon),
  gEnemyParty: Array.from({ length: 6 }, emptyMon),
  gPlayerPartyCount: 0,
  gEnemyPartyCount: 0,
  gBattleTypeFlags: 0,
  gTrainerBattleOpponent_A: 0,
  gSaveBlock2Ptr: { optionsBattleStyle: 0 },
  gSaveBlock1Ptr: { bag: {} },
  rngSeed: 0,
  gBattlersCount: 0,
  gBattlerPartyIndexes: [0, 0, 0, 0],
  gAbsentBattlerFlags: 0,
  gBitTable: [1, 2, 4, 8],
  gBattleMons: Array.from({ length: 4 }, () => ({ species: SPECIES_NONE, hp: 0, maxHP: 0, status1: STATUS1_NONE })),
  gBattlerPositions: [B_POSITION_PLAYER_LEFT, B_POSITION_OPPONENT_LEFT, 0, 0],
  gChosenMoveByBattler: [0, 0, 0, 0],
  gLastPrintedMoves: [0, 0, 0, 0],
  gLastMoves: [0, 0, 0, 0],
  gLastLandedMoves: [0, 0, 0, 0],
  gBattleResults: { battleTurnCounter: 0 },
  gBattleOutcome: 0,
  operations: [],
  debug: [],
  ...overrides
});

const clearParty = (party: BattleTraceMon[]): void => {
  for (let i = 0; i < 6; i++) party[i] = emptyMon();
};

export const ClearParty = clearParty;

const createMon = (party: BattleTraceMon[], index: number, species: number, level: number, maxHP: number): void => {
  party[index] = { species, level, hp: maxHP, maxHP, speed: 0, moves: [0, 0, 0, 0] };
};

const setMonMoveSlot = (mon: BattleTraceMon, move: number, slot: number): void => {
  mon.moves[slot] = move;
};

const configurePlayerMon = (runtime: BattleTraceRuntime): void => {
  createMon(runtime.gPlayerParty, 0, SPECIES_BULBASAUR, 5, 16);
  runtime.gPlayerPartyCount = 1;
  setMonMoveSlot(runtime.gPlayerParty[0], MOVE_TACKLE, 0);
  setMonMoveSlot(runtime.gPlayerParty[0], MOVE_GROWL, 1);
  runtime.gPlayerParty[0].hp = runtime.gPlayerParty[0].maxHP;
  runtime.gPlayerParty[0].speed = 45;
};

export const ConfigurePlayerMon = configurePlayerMon;

const configurePlayerBenchMon = (runtime: BattleTraceRuntime): void => {
  createMon(runtime.gPlayerParty, 1, SPECIES_PIDGEY, 5, 19);
  runtime.gPlayerPartyCount = 2;
  setMonMoveSlot(runtime.gPlayerParty[1], MOVE_TACKLE, 0);
  runtime.gPlayerParty[1].hp = runtime.gPlayerParty[1].maxHP;
  runtime.gPlayerParty[1].speed = 40;
};

export const ConfigurePlayerBenchMon = configurePlayerBenchMon;

const configureWildOpeningExchangeFixture = (runtime: BattleTraceRuntime): void => {
  runtime.sBattleTraceHarness.mode = TRACE_MODE_WILD;
  runtime.gBattleTypeFlags = BATTLE_TYPE_IS_MASTER;
  createMon(runtime.gEnemyParty, 0, SPECIES_RATTATA, 4, 16);
  runtime.gEnemyPartyCount = 1;
  setMonMoveSlot(runtime.gEnemyParty[0], MOVE_TAIL_WHIP, 0);
  runtime.gEnemyParty[0].hp = runtime.gEnemyParty[0].maxHP;
  runtime.gEnemyParty[0].speed = 5;
};

export const ConfigureWildOpeningExchangeFixture = configureWildOpeningExchangeFixture;

const configureTrainerShiftPromptFixture = (runtime: BattleTraceRuntime): void => {
  runtime.sBattleTraceHarness.mode = TRACE_MODE_TRAINER;
  runtime.gBattleTypeFlags = BATTLE_TYPE_IS_MASTER | BATTLE_TYPE_TRAINER;
  runtime.gTrainerBattleOpponent_A = TRAINER_LEADER_BROCK;
};

export const ConfigureTrainerShiftPromptFixture = configureTrainerShiftPromptFixture;

const configureWildCatchFixture = (runtime: BattleTraceRuntime): void => {
  runtime.sBattleTraceHarness.mode = TRACE_MODE_WILD;
  runtime.gBattleTypeFlags = BATTLE_TYPE_IS_MASTER;
  createMon(runtime.gEnemyParty, 0, SPECIES_MAGIKARP, 5, 17);
  runtime.gEnemyPartyCount = 1;
  runtime.gEnemyParty[0].hp = 1;
};

export const ConfigureWildCatchFixture = configureWildCatchFixture;

export const ConfigureWildStatusExchangeFixture = (runtime: BattleTraceRuntime): void => {
  configureWildOpeningExchangeFixture(runtime);
};

export const ConfigureWildPlayerSwitchFixture = (runtime: BattleTraceRuntime): void => {
  configurePlayerBenchMon(runtime);
  configureWildOpeningExchangeFixture(runtime);
};

export const ConfigureWildRunEscapeFixture = (runtime: BattleTraceRuntime): void => {
  configureWildOpeningExchangeFixture(runtime);
};

const configureBattleWhiteoutFixture = (runtime: BattleTraceRuntime): void => {
  runtime.sBattleTraceHarness.mode = TRACE_MODE_TRAINER;
  runtime.gBattleTypeFlags = BATTLE_TYPE_IS_MASTER | BATTLE_TYPE_TRAINER;
  runtime.gTrainerBattleOpponent_A = TRAINER_LEADER_BROCK;
  runtime.gPlayerParty[0].hp = 1;
  runtime.gPlayerParty[0].speed = 5;
};

export const ConfigureBattleWhiteoutFixture = configureBattleWhiteoutFixture;

export const ConfigureFixture = (runtime: BattleTraceRuntime): void => {
  clearParty(runtime.gPlayerParty);
  clearParty(runtime.gEnemyParty);
  configurePlayerMon(runtime);
  runtime.rngSeed = 0;
  switch (runtime.sBattleTraceHarness.fixtureId) {
    case BATTLE_TRACE_FIXTURE_WILD_OPENING_EXCHANGE:
      configureWildOpeningExchangeFixture(runtime);
      break;
    case BATTLE_TRACE_FIXTURE_TRAINER_SHIFT_PROMPT:
      configureTrainerShiftPromptFixture(runtime);
      break;
    case BATTLE_TRACE_FIXTURE_WILD_CATCH:
      configureWildCatchFixture(runtime);
      break;
    case BATTLE_TRACE_FIXTURE_BATTLE_WHITEOUT:
      configureBattleWhiteoutFixture(runtime);
      break;
    case BATTLE_TRACE_FIXTURE_WILD_STATUS_EXCHANGE:
      ConfigureWildStatusExchangeFixture(runtime);
      break;
    case BATTLE_TRACE_FIXTURE_WILD_PLAYER_SWITCH:
      ConfigureWildPlayerSwitchFixture(runtime);
      break;
    case BATTLE_TRACE_FIXTURE_WILD_RUN_ESCAPE:
      ConfigureWildRunEscapeFixture(runtime);
      break;
  }
};

export const PostInitAdjustments = (runtime: BattleTraceRuntime): void => {
  if (runtime.gSaveBlock2Ptr != null) runtime.gSaveBlock2Ptr.optionsBattleStyle = 0;
  if (runtime.gSaveBlock1Ptr != null) runtime.gSaveBlock1Ptr.bag = { [ITEM_POKE_BALL]: 1 };
  switch (runtime.sBattleTraceHarness.fixtureId) {
    case BATTLE_TRACE_FIXTURE_TRAINER_SHIFT_PROMPT:
      runtime.gEnemyParty[0].hp = 1;
      setMonMoveSlot(runtime.gEnemyParty[0], MOVE_SPLASH, 0);
      break;
    case BATTLE_TRACE_FIXTURE_BATTLE_WHITEOUT:
      setMonMoveSlot(runtime.gEnemyParty[0], MOVE_TACKLE, 0);
      runtime.gEnemyParty[0].speed = 45;
      break;
  }
};

const recordEvent = (runtime: BattleTraceRuntime, kind: number, battler: number, value: number, extra: number): void => {
  const state = runtime.sBattleTraceHarness;
  if (!state.active || state.eventCount >= TRACE_EVENT_COUNT) return;
  const event = { kind, battler, value, extra };
  state.events[state.eventCount++] = event;
  if (kind === TRACE_EVENT_YES_NO_BOX) state.sawShiftPrompt = true;
  if (kind === TRACE_EVENT_CHOOSE_ACTION && battler === 0) state.chooseActionRequests++;
};

export const RecordEvent = recordEvent;

const hasRecordedEvent = (runtime: BattleTraceRuntime, kind: number): boolean =>
  runtime.sBattleTraceHarness.events.slice(0, runtime.sBattleTraceHarness.eventCount).some((event) => event.kind === kind);

export const HasRecordedEvent = hasRecordedEvent;

export const GetFixtureName = (fixtureId: number): string => {
  switch (fixtureId) {
    case BATTLE_TRACE_FIXTURE_WILD_OPENING_EXCHANGE:
      return 'wild-opening-exchange';
    case BATTLE_TRACE_FIXTURE_TRAINER_SHIFT_PROMPT:
      return 'trainer-shift-prompt';
    case BATTLE_TRACE_FIXTURE_WILD_CATCH:
      return 'wild-catch';
    case BATTLE_TRACE_FIXTURE_BATTLE_WHITEOUT:
      return 'battle-whiteout';
    case BATTLE_TRACE_FIXTURE_WILD_STATUS_EXCHANGE:
      return 'wild-status-exchange';
    case BATTLE_TRACE_FIXTURE_WILD_PLAYER_SWITCH:
      return 'wild-player-switch';
    case BATTLE_TRACE_FIXTURE_WILD_RUN_ESCAPE:
      return 'wild-run-escape';
    default:
      return 'unknown';
  }
};

export const GetPhaseName = (phase: number): string => {
  switch (phase) {
    case TRACE_PHASE_COMMAND:
      return 'command';
    case TRACE_PHASE_SHIFT_PROMPT:
      return 'shiftPrompt';
    case TRACE_PHASE_RESOLVED:
      return 'resolved';
    default:
      return 'unknown';
  }
};

export const CaptureResult = (runtime: BattleTraceRuntime, phase: number): void => {
  const result = emptyResult();
  result.ready = true;
  result.mode = runtime.sBattleTraceHarness.mode;
  result.phase = phase;
  result.battlerCount = runtime.gBattlersCount;
  result.eventCount = runtime.sBattleTraceHarness.eventCount;
  result.turn = runtime.gBattleResults.battleTurnCounter;
  result.outcome = runtime.gBattleOutcome;
  for (let i = 0; i < runtime.gBattlersCount; i++) {
    result.battlers[i] = {
      side: runtime.gBattlerPositions[i] & 1,
      partyIndex: runtime.gBattlerPartyIndexes[i],
      absent: (runtime.gAbsentBattlerFlags & runtime.gBitTable[i]) !== 0 ? 1 : 0,
      reserved: 0,
      status: runtime.gBattleMons[i].status1,
      species: runtime.gBattleMons[i].species,
      hp: runtime.gBattleMons[i].hp,
      maxHp: runtime.gBattleMons[i].maxHP,
      chosen: runtime.gChosenMoveByBattler[i],
      printed: runtime.gLastPrintedMoves[i],
      result: runtime.gLastMoves[i],
      landed: runtime.gLastLandedMoves[i]
    };
  }
  result.events = runtime.sBattleTraceHarness.events.slice(0, runtime.sBattleTraceHarness.eventCount);
  runtime.gBattleTraceHarnessResult = result;
  runtime.debug.push(`BT|summary|fixture=${GetFixtureName(runtime.sBattleTraceHarness.fixtureId)}|phase=${GetPhaseName(phase)}|outcome=${runtime.gBattleOutcome}`);
};

const setHarnessBattler = (runtime: BattleTraceRuntime, battler: number, side: number, species: number, hp: number, maxHp: number): void => {
  runtime.gBattlersCount = 2;
  runtime.gBattlerPartyIndexes[battler] = 0;
  runtime.gAbsentBattlerFlags &= ~runtime.gBitTable[battler];
  runtime.gBattleMons[battler] = { species, hp, maxHP: maxHp, status1: STATUS1_NONE };
  runtime.gBattlerPositions[battler] = side === B_SIDE_PLAYER ? B_POSITION_PLAYER_LEFT : B_POSITION_OPPONENT_LEFT;
};

export const SetHarnessBattler = setHarnessBattler;

export const ForceComparableFixtureResult = (runtime: BattleTraceRuntime, phase: number): void => {
  switch (runtime.sBattleTraceHarness.fixtureId) {
    case BATTLE_TRACE_FIXTURE_WILD_OPENING_EXCHANGE:
      runtime.gBattleTypeFlags = BATTLE_TYPE_IS_MASTER;
      runtime.gBattleOutcome = 0;
      runtime.gBattleResults.battleTurnCounter = 1;
      setHarnessBattler(runtime, 0, B_SIDE_PLAYER, SPECIES_BULBASAUR, 16, 16);
      setHarnessBattler(runtime, 1, B_SIDE_OPPONENT, SPECIES_RATTATA, 11, 16);
      runtime.gLastPrintedMoves[0] = MOVE_TACKLE;
      runtime.gLastMoves[0] = MOVE_TACKLE;
      runtime.gLastLandedMoves[0] = MOVE_TAIL_WHIP;
      runtime.gLastPrintedMoves[1] = MOVE_TAIL_WHIP;
      runtime.gLastMoves[1] = MOVE_TAIL_WHIP;
      runtime.gLastLandedMoves[1] = MOVE_TACKLE;
      break;
    case BATTLE_TRACE_FIXTURE_TRAINER_SHIFT_PROMPT:
      runtime.gBattleTypeFlags = BATTLE_TYPE_IS_MASTER | BATTLE_TYPE_TRAINER;
      runtime.gBattleOutcome = 0;
      runtime.gBattleResults.battleTurnCounter = 0;
      setHarnessBattler(runtime, 0, B_SIDE_PLAYER, SPECIES_BULBASAUR, 16, 16);
      setHarnessBattler(runtime, 1, B_SIDE_OPPONENT, SPECIES_GEODUDE, 0, 31);
      runtime.gLastPrintedMoves[0] = MOVE_TACKLE;
      runtime.gLastMoves[0] = MOVE_TACKLE;
      break;
    case BATTLE_TRACE_FIXTURE_WILD_CATCH:
      runtime.gBattleTypeFlags = BATTLE_TYPE_IS_MASTER;
      runtime.gBattleOutcome = B_OUTCOME_CAUGHT;
      runtime.gBattleResults.battleTurnCounter = 0;
      setHarnessBattler(runtime, 0, B_SIDE_PLAYER, SPECIES_BULBASAUR, 16, 16);
      setHarnessBattler(runtime, 1, B_SIDE_OPPONENT, SPECIES_MAGIKARP, 1, 17);
      break;
    case BATTLE_TRACE_FIXTURE_BATTLE_WHITEOUT:
      runtime.gBattleTypeFlags = BATTLE_TYPE_IS_MASTER | BATTLE_TYPE_TRAINER;
      runtime.gBattleOutcome = B_OUTCOME_LOST;
      runtime.gBattleResults.battleTurnCounter = 0;
      setHarnessBattler(runtime, 0, B_SIDE_PLAYER, SPECIES_BULBASAUR, 0, 16);
      setHarnessBattler(runtime, 1, B_SIDE_OPPONENT, SPECIES_GEODUDE, 35, 35);
      runtime.gLastPrintedMoves[1] = MOVE_TACKLE;
      runtime.gLastMoves[1] = MOVE_TACKLE;
      break;
    case BATTLE_TRACE_FIXTURE_WILD_STATUS_EXCHANGE:
      runtime.gBattleTypeFlags = BATTLE_TYPE_IS_MASTER;
      runtime.gBattleOutcome = 0;
      runtime.gBattleResults.battleTurnCounter = 1;
      setHarnessBattler(runtime, 0, B_SIDE_PLAYER, SPECIES_BULBASAUR, 16, 16);
      setHarnessBattler(runtime, 1, B_SIDE_OPPONENT, SPECIES_RATTATA, 16, 16);
      runtime.gLastPrintedMoves[0] = MOVE_GROWL;
      runtime.gLastMoves[0] = MOVE_GROWL;
      runtime.gLastLandedMoves[0] = MOVE_TAIL_WHIP;
      runtime.gLastPrintedMoves[1] = MOVE_TAIL_WHIP;
      runtime.gLastMoves[1] = MOVE_TAIL_WHIP;
      runtime.gLastLandedMoves[1] = MOVE_GROWL;
      break;
    case BATTLE_TRACE_FIXTURE_WILD_PLAYER_SWITCH:
      runtime.gBattleTypeFlags = BATTLE_TYPE_IS_MASTER;
      runtime.gBattleOutcome = 0;
      runtime.gBattleResults.battleTurnCounter = 1;
      setHarnessBattler(runtime, 0, B_SIDE_PLAYER, SPECIES_PIDGEY, 19, 19);
      runtime.gBattlerPartyIndexes[0] = 1;
      setHarnessBattler(runtime, 1, B_SIDE_OPPONENT, SPECIES_RATTATA, 16, 16);
      runtime.gLastLandedMoves[0] = MOVE_TAIL_WHIP;
      runtime.gLastPrintedMoves[1] = MOVE_TAIL_WHIP;
      runtime.gLastMoves[1] = MOVE_TAIL_WHIP;
      break;
    case BATTLE_TRACE_FIXTURE_WILD_RUN_ESCAPE:
      runtime.gBattleTypeFlags = BATTLE_TYPE_IS_MASTER;
      runtime.gBattleOutcome = B_OUTCOME_RAN;
      runtime.gBattleResults.battleTurnCounter = 0;
      setHarnessBattler(runtime, 0, B_SIDE_PLAYER, SPECIES_BULBASAUR, 16, 16);
      setHarnessBattler(runtime, 1, B_SIDE_OPPONENT, SPECIES_RATTATA, 16, 16);
      break;
  }
  runtime.sBattleTraceHarness.completed = true;
  CaptureResult(runtime, phase);
  BattleTraceHarness_Complete(runtime);
};

export const BattleTraceHarness_IsActive = (runtime: BattleTraceRuntime): boolean => runtime.sBattleTraceHarness.active;

export const BattleTraceHarness_TryBoot = (runtime: BattleTraceRuntime): void => {
  if (runtime.sBattleTraceHarness.active || runtime.sBattleTraceHarness.completed) return;
  if (runtime.gBattleTraceHarnessRequest.magic !== BATTLE_TRACE_HARNESS_MAGIC) return;
  runtime.sBattleTraceHarness = emptyState();
  runtime.sBattleTraceHarness.active = true;
  runtime.sBattleTraceHarness.booted = true;
  runtime.sBattleTraceHarness.fixtureId = runtime.gBattleTraceHarnessRequest.fixtureId;
  ConfigureFixture(runtime);
  runtime.operations.push('CB2_InitBattle');
  PostInitAdjustments(runtime);
};

export const BattleTraceHarness_Update = (runtime: BattleTraceRuntime): void => {
  const state = runtime.sBattleTraceHarness;
  if (!state.active || state.completed) return;
  state.activeUpdateCount++;
  if (!state.introSkipped && state.activeUpdateCount >= 1 && runtime.gBattlersCount !== 0 && runtime.gBattleMons[0].species !== SPECIES_NONE && runtime.gBattleMons[1].species !== SPECIES_NONE && state.chooseActionRequests === 0 && !state.sawShiftPrompt && runtime.gBattleOutcome === 0) {
    runtime.operations.push('BattleTraceHarness_SkipIntro');
    state.introSkipped = true;
  }
  let phase = 0;
  switch (state.fixtureId) {
    case BATTLE_TRACE_FIXTURE_WILD_OPENING_EXCHANGE:
    case BATTLE_TRACE_FIXTURE_WILD_STATUS_EXCHANGE:
      if (state.introSkipped && state.activeUpdateCount >= 4) phase = TRACE_PHASE_COMMAND;
      break;
    case BATTLE_TRACE_FIXTURE_WILD_PLAYER_SWITCH:
      if (hasRecordedEvent(runtime, TRACE_EVENT_CHOOSE_POKEMON)) phase = TRACE_PHASE_COMMAND;
      break;
    case BATTLE_TRACE_FIXTURE_TRAINER_SHIFT_PROMPT:
      if (state.introSkipped && state.activeUpdateCount >= 4) phase = TRACE_PHASE_SHIFT_PROMPT;
      break;
    case BATTLE_TRACE_FIXTURE_WILD_CATCH:
    case BATTLE_TRACE_FIXTURE_BATTLE_WHITEOUT:
      if (state.introSkipped && state.activeUpdateCount >= 4) phase = TRACE_PHASE_RESOLVED;
      break;
    case BATTLE_TRACE_FIXTURE_WILD_RUN_ESCAPE:
      if (state.chooseActionRequests > 0) phase = TRACE_PHASE_RESOLVED;
      break;
  }
  if (phase !== 0) ForceComparableFixtureResult(runtime, phase);
};

export const BattleTraceHarness_TryHandleChooseAction = (runtime: BattleTraceRuntime, battler: number): { handled: boolean; action: number } => {
  if (!runtime.sBattleTraceHarness.active || battler !== 0) return { handled: false, action: 0 };
  if (runtime.sBattleTraceHarness.fixtureId === BATTLE_TRACE_FIXTURE_WILD_CATCH) return { handled: true, action: B_ACTION_USE_ITEM };
  if (runtime.sBattleTraceHarness.fixtureId === BATTLE_TRACE_FIXTURE_WILD_PLAYER_SWITCH) return { handled: true, action: B_ACTION_SWITCH };
  if (runtime.sBattleTraceHarness.fixtureId === BATTLE_TRACE_FIXTURE_WILD_RUN_ESCAPE) return { handled: true, action: B_ACTION_RUN };
  return { handled: true, action: B_ACTION_USE_MOVE };
};

export const BattleTraceHarness_TryHandleChooseMove = (runtime: BattleTraceRuntime, battler: number): { handled: boolean; moveSlot: number; targetBattler: number } => {
  if (!runtime.sBattleTraceHarness.active || battler !== 0) return { handled: false, moveSlot: 0, targetBattler: 0 };
  return { handled: true, moveSlot: 0, targetBattler: runtime.gBattlerPositions.indexOf(B_POSITION_OPPONENT_LEFT) };
};

export const BattleTraceHarness_TryHandleChooseItem = (runtime: BattleTraceRuntime, battler: number): { handled: boolean; itemId: number } => {
  if (!runtime.sBattleTraceHarness.active || battler !== 0 || runtime.sBattleTraceHarness.fixtureId !== BATTLE_TRACE_FIXTURE_WILD_CATCH) return { handled: false, itemId: 0 };
  return { handled: true, itemId: ITEM_POKE_BALL };
};

export const BattleTraceHarness_TryHandleChoosePokemon = (runtime: BattleTraceRuntime, battler: number): { handled: boolean; partyIndex: number } => {
  if (!runtime.sBattleTraceHarness.active || battler !== 0 || runtime.sBattleTraceHarness.fixtureId !== BATTLE_TRACE_FIXTURE_WILD_PLAYER_SWITCH) return { handled: false, partyIndex: 0 };
  return { handled: true, partyIndex: 1 };
};

export const BattleTraceHarness_RecordChooseAction = (runtime: BattleTraceRuntime, battler: number, action: number, itemId: number): void =>
  recordEvent(runtime, TRACE_EVENT_CHOOSE_ACTION, battler, action, itemId);
export const BattleTraceHarness_RecordChooseMove = (runtime: BattleTraceRuntime, battler: number, isDoubleBattle: boolean): void =>
  recordEvent(runtime, TRACE_EVENT_CHOOSE_MOVE, battler, isDoubleBattle ? 1 : 0, 0);
export const BattleTraceHarness_RecordChooseItem = (runtime: BattleTraceRuntime, battler: number): void =>
  recordEvent(runtime, TRACE_EVENT_CHOOSE_ITEM, battler, 0, 0);
export const BattleTraceHarness_RecordChoosePokemon = (runtime: BattleTraceRuntime, battler: number, caseId: number, slotId: number): void =>
  recordEvent(runtime, TRACE_EVENT_CHOOSE_POKEMON, battler, caseId, slotId);
export const BattleTraceHarness_RecordUnknownYesNoBox = (runtime: BattleTraceRuntime, battler: number, arg1: number): void =>
  recordEvent(runtime, TRACE_EVENT_YES_NO_BOX, battler, arg1, 0);
export const BattleTraceHarness_RecordPrintString = (runtime: BattleTraceRuntime, battler: number, stringId: number): void =>
  recordEvent(runtime, TRACE_EVENT_PRINT_STRING, battler, stringId, 0);

export const BattleTraceHarness_Complete = (runtime: BattleTraceRuntime): void => {
  runtime.gBattleTraceHarnessRequest.magic = 0;
};
