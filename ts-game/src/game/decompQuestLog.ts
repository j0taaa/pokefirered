export const QL_STATE_RECORDING = 1;
export const QL_STATE_PLAYBACK = 2;
export const QL_STATE_PLAYBACK_LAST = 3;

export const END_MODE_NONE = 0;
export const END_MODE_FINISH = 1;
export const END_MODE_SCENE = 2;

export const QL_PLAYBACK_STATE_STOPPED = 0;
export const QL_PLAYBACK_STATE_RUNNING = 1;
export const QL_PLAYBACK_STATE_RECORDING = 2;
export const QL_PLAYBACK_STATE_ACTION_END = 3;
export const QL_PLAYBACK_STATE_RECORDING_NO_DELAY = 4;

export const QL_START_NORMAL = 1;
export const QL_START_WARP = 2;

export const QL_ACTION_MOVEMENT = 0;
export const QL_ACTION_GFX_CHANGE = 1;
export const QL_ACTION_INPUT = 2;
export const QL_ACTION_EMPTY = 3;
export const QL_ACTION_WAIT = 254;
export const QL_ACTION_SCENE_END = 255;

export const MOVEMENT_ACTION_FACE_DOWN = 0;
export const MOVEMENT_ACTION_FACE_UP = 1;
export const MOVEMENT_ACTION_FACE_LEFT = 2;
export const MOVEMENT_ACTION_FACE_RIGHT = 3;
export const MOVEMENT_ACTION_NONE = 0xff;
export const QL_PLAYER_GFX_NONE = 0xff;
export const QL_ESCALATOR_OUT = 0;
export const QL_ESCALATOR_IN = 1;
export const A_BUTTON = 0x0001;
export const B_BUTTON = 0x0002;
export const CHAR_NEWLINE = 0xfe;
export const EOS = 0xff;
export const QUEST_LOG_SCENE_COUNT = 4;
export const OBJECT_EVENT_TEMPLATES_COUNT = 64;
export const PARTY_SIZE = 6;
export const TOTAL_BOXES_COUNT = 14;
export const IN_BOX_COUNT = 30;
export const NUM_PC_COUNT_BITS = 12;
export const VAR_QUEST_LOG_MON_COUNTS = 0x4027;
export const VAR_QLBAK_TRAINER_REMATCHES = 0x40aa;
export const VAR_QLBAK_MAP_LAYOUT = 0x40ae;
export const MAP_GROUP_ROUTE1 = 3;
export const MAP_NUM_ROUTE1 = 19;
export const WARP_ID_NONE = -1;
export const QL_EVENT_LINK_TRADED = 12;
export const QL_EVENT_LINK_BATTLED_UNION = 19;
export const QL_EVENT_DEPARTED = 35;
export const LOCALID_PLAYER = 255;
export const SAVE_NORMAL = 0;
export const QL_TINT_NONE = 0;
export const WIN_TOP_BAR = 0;
export const WIN_BOTTOM_BAR = 1;
export const WIN_DESCRIPTION = 2;
export const WIN_COUNT = 3;
export const DESC_WIN_WIDTH = 30;
export const DESC_WIN_HEIGHT = 6;
export const COPYWIN_MAP = 1;
export const COPYWIN_GFX = 2;
export const COPYWIN_FULL = 3;
export const PALETTES_ALL = 0xffffffff;
export const FADE_TO_BLACK = 1;
export const DATA_IDX_CALLBACK = 14;
export const PLTT_U16_COUNT = 0x200;

export const sQuestLogTextLineYCoords = [17, 10, 3] as const;

export interface QuestLogWindowTemplate {
  bg: number;
  tilemapLeft: number;
  tilemapTop: number;
  width: number;
  height: number;
  paletteNum: number;
  baseBlock: number;
}

export const sWindowTemplates: readonly QuestLogWindowTemplate[] = [
  { bg: 0, tilemapLeft: 0, tilemapTop: 0, width: 30, height: 2, paletteNum: 15, baseBlock: 0x0e9 },
  { bg: 0, tilemapLeft: 0, tilemapTop: 18, width: 30, height: 2, paletteNum: 15, baseBlock: 0x0ad },
  { bg: 0, tilemapLeft: 0, tilemapTop: 14, width: DESC_WIN_WIDTH, height: DESC_WIN_HEIGHT, paletteNum: 15, baseBlock: 0x14c }
];

export const DIR_NONE = 0;
export const DIR_SOUTH = 1;
export const DIR_NORTH = 2;
export const DIR_WEST = 3;
export const DIR_EAST = 4;

export interface QuestLogAction {
  data: {
    a: {
      localId: number;
      mapNum: number;
      mapGroup: number;
      movementActionId: number;
    };
    b: {
      localId: number;
      mapNum: number;
      mapGroup: number;
      gfxState: number;
    };
    fieldInput: number[];
    raw: number[];
  };
  duration: number;
  type: number;
}

export interface FlagOrVarRecord {
  idx: number;
  isFlag: boolean;
  value: number;
}

export interface PlaybackControl {
  state: number;
  playingEvent: boolean;
  endMode: number;
  cursor: number;
  timer: number;
  overlapTimer: number;
}

export interface QuestLogScene {
  startType: number;
  mapGroup: number;
  mapNum: number;
  warpId: number;
  x: number;
  y: number;
  objectEventTemplates: QuestLogObjectEventTemplate[];
  flags: number[];
  vars: number[];
  script: number[];
}

export interface QuestLogObjectEventTemplate {
  x: number;
  negx: boolean;
  y: number;
  negy: boolean;
  elevation: number;
  movementType: number;
}

export interface SaveObjectEventTemplate {
  x: number;
  y: number;
  elevation: number;
  movementType: number;
}

export interface QuestLogLocation {
  mapGroup: number;
  mapNum: number;
  warpId: number;
}

export interface QuestLogPosition {
  x: number;
  y: number;
}

export interface QuestLogTask {
  data: number[];
  func: string;
  priority: number;
  wordArgs: Record<number, string | (() => void) | null>;
}

export interface QuestLogSprite {
  data: number[];
}

export interface QuestLogObjectEvent {
  localId: number;
  heldMovement: number | null;
  currentMovementUpdates: number;
}

export interface QuestLogRuntime {
  gQuestLogState: number;
  gQuestLogPlaybackState: number;
  gQuestLogCurActionIdx: number;
  sMaxActionsInScene: number;
  sNextActionDelay: number;
  sLastQuestLogCursor: number;
  sCurSceneActions: QuestLogAction[];
  sMovementScripts: number[][];
  objectEvents: QuestLogObjectEvent[];
  playerSpriteUpdates: number[];
  gQuestLogFieldInput: { raw: number[] };
  sFlagOrVarRecords: FlagOrVarRecord[];
  sNumFlagsOrVars: number;
  sFlagOrVarPlayhead: number;
  sPlaybackControl: PlaybackControl;
  sCurrentSceneNum: number;
  questLogScenes: QuestLogScene[];
  location: QuestLogLocation;
  pos: QuestLogPosition;
  warpDestination: (QuestLogLocation & QuestLogPosition) | null;
  objectEventTemplates: SaveObjectEventTemplate[];
  flags: number[];
  vars: number[];
  trainerRematches: number[];
  varStore: Record<number, number>;
  mapLayoutId: number;
  fallbackMapLayoutId: number;
  partyMons: boolean[];
  boxMons: boolean[][];
  gQuestLogRecordingPointer: number | null;
  gQuestLogDefeatedWildMonRecord: number | null;
  sQuestLogCB: string | (() => void) | null;
  sRecordSequenceStartIdx: number;
  sEventData: Array<number | null>;
  sNumScenes: number;
  saveBlockAddress: number;
  specialVarResult: number;
  helpSystemEnabled: boolean;
  destroyedTasks: number[];
  mainCallback2: string | null;
  fieldCallback2: string | null;
  sWindowIds: number[];
  nextWindowId: number;
  addedWindowTemplates: number[];
  fillWindowPixelRects: Array<{ windowId: number; fillValue: number; x: number; y: number; width: number; height: number }>;
  putWindowTilemaps: number[];
  copyWindowToVramCalls: Array<{ windowId: number; mode: number }>;
  clearWindowTilemaps: number[];
  removedWindows: number[];
  textPrinterCalls: Array<{ windowId: number; x: number; y: number; text: string }>;
  descriptionWindowTileCopies: number[];
  bgCopyTilemapSchedules: number[];
  questLogHeaderTexts: string[];
  questLogDescriptionLineCounts: number[];
  questLogDescriptionTextYs: number[];
  gDisableMapMusicChangeOnMapLoad: number;
  wildEncountersDisabled: boolean;
  resetSpecialVarsCount: number;
  clearedBagCount: number;
  clearedPCItemSlotsCount: number;
  warpIntoMapCount: number;
  loadedTextWindowPalettes: number[];
  fieldDefaultWarpExitCount: number;
  fieldWarpExitFadeFromBlackCount: number;
  qlEnableRecordingStepsCount: number;
  qlResetRepeatEventTrackerCount: number;
  readQuestLogScriptScenes: number[];
  sLastDepartedLocation: number;
  paletteFadeActive: boolean;
  tasks: Record<number, QuestLogTask>;
  nextTaskId: number;
  createdTasks: Array<{ id: number; func: string; priority: number }>;
  saveResetSaveCountersCount: number;
  loadGameSaveCalls: number[];
  freeAllWindowBuffersCount: number;
  previouslyOnQuestHeaderScenes: number[];
  frozeObjectEventsCount: number;
  enforcedLookDirectionCount: number;
  stoppedPlayerAvatarCount: number;
  questLogDescriptionDrawnCount: number;
  mapNameLookups: number[];
  questLogTextWindowClosedCount: number;
  overworldSpecialMapMusicCount: number;
  slightlyDarkenedPalsCount: number;
  restoreScreenAfterPlaybackResults: boolean[];
  clearedWindowIds: number[];
  removedWindowIds: number[];
  mapNamePopupShown: boolean[];
  copiedPalettesBackupCount: number;
  freedPalettesBackupCount: number;
  sPalettesBackup: number[] | null;
  plttBufferUnfaded: number[];
  plttBufferFaded: number[];
  paletteBackupAllocs: number;
  backupPaletteCopies: Array<{ offset: number; size: number }>;
  invertedTintCopies: Array<{ sourceOffset: number; destOffset: number; size: number; tint: number }>;
  slightlyDarkenedPalRanges: Array<{ offset: number; count: number }>;
  normalPaletteFades: Array<{ palettes: number; delay: number; startY: number; targetY: number; color: number }>;
  fadeScreenCalls: Array<{ mode: number; delay: number }>;
  avoidedDisplayCallbacksCalled: number;
  clearedPlayerHeldMovementCount: number;
  unlockedPlayerFieldControlsCount: number;
  textAutoScroll: boolean;
  globalFieldTintMode: number;
  qlResetEventStatesCount: number;
  resetDeferredLinkEventCount: number;
  questLogPlayCurrentEventCalls: number;
  questLogText: number[];
  questLogRepeatEventCounter: number;
  qlTryRepeatEventResults: boolean[];
  qlLoadEventResults: boolean[];
  qlTryRepeatEventArgs: Array<number | null>;
  qlLoadEventArgs: Array<number | null>;
  handledQuestLogMessages: number;
  pokemonCountsSet: number;
  qlResetPartyAndPCCalls: number;
  zeroedPartySlots: number[];
  zeroedBoxSlots: Array<{ box: number; slot: number }>;
  placeholderPartySlots: number[];
  placeholderBoxSlots: Array<{ box: number; slot: number }>;
  playerInitialCoordsScenes: number[];
  npcInitialCoordsScenes: number[];
  qlRecordObjectsScenes: number[];
  qlLoadObjectsScenes: number[];
  backedUpTrainerRematches: number;
  backedUpMapLayout: number;
  restoredTrainerRematches: number;
  gameStateScenes: number[];
  triedRecordActionSequences: number;
  recordedSceneEnds: number;
  recordedWaitDurations: number[];
  questLogScriptCapacity: number;
  recordedQuestLogActions: Array<{ kind: string; offset: number; actionIdx?: number; duration?: number }>;
  fieldControlsLocked: boolean;
  playerFacingDirection: number;
  sceneEndTransitionDelay: number | null;
  skipToEndTransitionDelay: number | null;
}

export const createQuestLogAction = (overrides: Partial<QuestLogAction> = {}): QuestLogAction => ({
  data: {
    a: { localId: 0, mapNum: 0, mapGroup: 0, movementActionId: 0 },
    b: { localId: 0, mapNum: 0, mapGroup: 0, gfxState: 0 },
    fieldInput: [0, 0, 0, 0],
    raw: [0, 0, 0, 0]
  },
  duration: 0,
  type: 0,
  ...overrides
});

export const createQuestLogScene = (overrides: Partial<QuestLogScene> = {}): QuestLogScene => ({
  startType: 0,
  mapGroup: 0,
  mapNum: 0,
  warpId: 0,
  x: 0,
  y: 0,
  objectEventTemplates: Array.from({ length: OBJECT_EVENT_TEMPLATES_COUNT }, () => createQuestLogObjectEventTemplate()),
  flags: [],
  vars: [],
  script: [],
  ...overrides
});

export const createQuestLogObjectEventTemplate = (overrides: Partial<QuestLogObjectEventTemplate> = {}): QuestLogObjectEventTemplate => ({
  x: 0,
  negx: false,
  y: 0,
  negy: false,
  elevation: 0,
  movementType: 0,
  ...overrides
});

export const createSaveObjectEventTemplate = (overrides: Partial<SaveObjectEventTemplate> = {}): SaveObjectEventTemplate => ({
  x: 0,
  y: 0,
  elevation: 0,
  movementType: 0,
  ...overrides
});

export const createQuestLogRuntime = (overrides: Partial<QuestLogRuntime> = {}): QuestLogRuntime => ({
  gQuestLogState: 0,
  gQuestLogPlaybackState: QL_PLAYBACK_STATE_STOPPED,
  gQuestLogCurActionIdx: 0,
  sMaxActionsInScene: 0,
  sNextActionDelay: 0,
  sLastQuestLogCursor: 0,
  sCurSceneActions: [],
  sMovementScripts: Array.from({ length: OBJECT_EVENT_TEMPLATES_COUNT }, () => [0, 0]),
  objectEvents: Array.from({ length: OBJECT_EVENT_TEMPLATES_COUNT }, () => ({
    localId: 0,
    heldMovement: null,
    currentMovementUpdates: 0
  })),
  playerSpriteUpdates: [],
  gQuestLogFieldInput: { raw: [0, 0, 0, 0] },
  sFlagOrVarRecords: [],
  sNumFlagsOrVars: 0,
  sFlagOrVarPlayhead: 0,
  sPlaybackControl: { state: 0, playingEvent: false, endMode: END_MODE_NONE, cursor: 0, timer: 0, overlapTimer: 0 },
  sCurrentSceneNum: 0,
  questLogScenes: Array.from({ length: QUEST_LOG_SCENE_COUNT }, () => createQuestLogScene()),
  location: { mapGroup: 0, mapNum: 0, warpId: 0 },
  pos: { x: 0, y: 0 },
  warpDestination: null,
  objectEventTemplates: Array.from({ length: OBJECT_EVENT_TEMPLATES_COUNT }, () => createSaveObjectEventTemplate()),
  flags: [],
  vars: [],
  trainerRematches: Array.from({ length: 100 }, () => 0),
  varStore: {},
  mapLayoutId: 0,
  fallbackMapLayoutId: 0,
  partyMons: Array.from({ length: PARTY_SIZE }, () => false),
  boxMons: Array.from({ length: TOTAL_BOXES_COUNT }, () => Array.from({ length: IN_BOX_COUNT }, () => false)),
  gQuestLogRecordingPointer: null,
  gQuestLogDefeatedWildMonRecord: null,
  sQuestLogCB: null,
  sRecordSequenceStartIdx: 0,
  sEventData: Array.from({ length: 32 }, () => null),
  sNumScenes: 0,
  saveBlockAddress: 0,
  specialVarResult: 0,
  helpSystemEnabled: true,
  destroyedTasks: [],
  mainCallback2: null,
  fieldCallback2: null,
  sWindowIds: Array.from({ length: WIN_COUNT }, () => 0),
  nextWindowId: 0,
  addedWindowTemplates: [],
  fillWindowPixelRects: [],
  putWindowTilemaps: [],
  copyWindowToVramCalls: [],
  clearWindowTilemaps: [],
  removedWindows: [],
  textPrinterCalls: [],
  descriptionWindowTileCopies: [],
  bgCopyTilemapSchedules: [],
  questLogHeaderTexts: [],
  questLogDescriptionLineCounts: [],
  questLogDescriptionTextYs: [],
  gDisableMapMusicChangeOnMapLoad: 0,
  wildEncountersDisabled: false,
  resetSpecialVarsCount: 0,
  clearedBagCount: 0,
  clearedPCItemSlotsCount: 0,
  warpIntoMapCount: 0,
  loadedTextWindowPalettes: [],
  fieldDefaultWarpExitCount: 0,
  fieldWarpExitFadeFromBlackCount: 0,
  qlEnableRecordingStepsCount: 0,
  qlResetRepeatEventTrackerCount: 0,
  readQuestLogScriptScenes: [],
  sLastDepartedLocation: 0,
  paletteFadeActive: false,
  tasks: {},
  nextTaskId: 0,
  createdTasks: [],
  saveResetSaveCountersCount: 0,
  loadGameSaveCalls: [],
  freeAllWindowBuffersCount: 0,
  previouslyOnQuestHeaderScenes: [],
  frozeObjectEventsCount: 0,
  enforcedLookDirectionCount: 0,
  stoppedPlayerAvatarCount: 0,
  questLogDescriptionDrawnCount: 0,
  mapNameLookups: [],
  questLogTextWindowClosedCount: 0,
  overworldSpecialMapMusicCount: 0,
  slightlyDarkenedPalsCount: 0,
  restoreScreenAfterPlaybackResults: [],
  clearedWindowIds: [],
  removedWindowIds: [],
  mapNamePopupShown: [],
  copiedPalettesBackupCount: 0,
  freedPalettesBackupCount: 0,
  sPalettesBackup: null,
  plttBufferUnfaded: Array.from({ length: PLTT_U16_COUNT }, () => 0),
  plttBufferFaded: Array.from({ length: PLTT_U16_COUNT }, () => 0),
  paletteBackupAllocs: 0,
  backupPaletteCopies: [],
  invertedTintCopies: [],
  slightlyDarkenedPalRanges: [],
  normalPaletteFades: [],
  fadeScreenCalls: [],
  avoidedDisplayCallbacksCalled: 0,
  clearedPlayerHeldMovementCount: 0,
  unlockedPlayerFieldControlsCount: 0,
  textAutoScroll: false,
  globalFieldTintMode: 0,
  qlResetEventStatesCount: 0,
  resetDeferredLinkEventCount: 0,
  questLogPlayCurrentEventCalls: 0,
  questLogText: [EOS],
  questLogRepeatEventCounter: 0,
  qlTryRepeatEventResults: [],
  qlLoadEventResults: [],
  qlTryRepeatEventArgs: [],
  qlLoadEventArgs: [],
  handledQuestLogMessages: 0,
  pokemonCountsSet: 0,
  qlResetPartyAndPCCalls: 0,
  zeroedPartySlots: [],
  zeroedBoxSlots: [],
  placeholderPartySlots: [],
  placeholderBoxSlots: [],
  playerInitialCoordsScenes: [],
  npcInitialCoordsScenes: [],
  qlRecordObjectsScenes: [],
  qlLoadObjectsScenes: [],
  backedUpTrainerRematches: 0,
  backedUpMapLayout: 0,
  restoredTrainerRematches: 0,
  gameStateScenes: [],
  triedRecordActionSequences: 0,
  recordedSceneEnds: 0,
  recordedWaitDurations: [],
  questLogScriptCapacity: 0x400,
  recordedQuestLogActions: [],
  fieldControlsLocked: false,
  playerFacingDirection: DIR_SOUTH,
  sceneEndTransitionDelay: null,
  skipToEndTransitionDelay: null,
  ...overrides
});

export const QL_IsRoomToSaveEvent = (cursor: number, size: number, start: number, end: number): boolean => {
  const adjustedEnd = end - size;
  if (cursor < start || cursor > adjustedEnd) {
    return false;
  }
  return true;
};

export const QL_IsRoomToSaveAction = QL_IsRoomToSaveEvent;

export const IsLinkQuestLogEvent = (eventId: number): boolean =>
  eventId >= QL_EVENT_LINK_TRADED && eventId <= QL_EVENT_LINK_BATTLED_UNION;

export const QL_AddASLROffset = (runtime: QuestLogRuntime, oldSaveBlockPtr: number): void => {
  const offset = runtime.saveBlockAddress - oldSaveBlockPtr;
  if (runtime.gQuestLogDefeatedWildMonRecord !== null)
    runtime.gQuestLogDefeatedWildMonRecord += offset;

  if (runtime.gQuestLogState === 0)
    return;

  if (runtime.gQuestLogRecordingPointer !== null)
    runtime.gQuestLogRecordingPointer += offset;

  if (runtime.gQuestLogState === QL_STATE_PLAYBACK) {
    for (let i = 0; i < runtime.sEventData.length; i += 1) {
      if (runtime.sEventData[i] !== null)
        runtime.sEventData[i] = runtime.sEventData[i]! + offset;
    }
  }
};

export const QL_ResetEventStates = (runtime: QuestLogRuntime): void => {
  runtime.qlResetEventStatesCount += 1;
};

export const ResetDeferredLinkEvent = (runtime: QuestLogRuntime): void => {
  runtime.resetDeferredLinkEventCount += 1;
};

export const ResetQuestLog = (runtime: QuestLogRuntime): void => {
  runtime.questLogScenes = Array.from({ length: QUEST_LOG_SCENE_COUNT }, () => createQuestLogScene());
  runtime.sCurrentSceneNum = 0;
  runtime.gQuestLogState = 0;
  runtime.sQuestLogCB = null;
  runtime.gQuestLogRecordingPointer = null;
  runtime.gQuestLogDefeatedWildMonRecord = null;
  QL_ResetEventStates(runtime);
  ResetDeferredLinkEvent(runtime);
};

export const QL_ResetDefeatedWildMonRecord = (runtime: QuestLogRuntime): void => {
  runtime.gQuestLogDefeatedWildMonRecord = null;
};

export const RunQuestLogCB = (runtime: QuestLogRuntime): void => {
  if (typeof runtime.sQuestLogCB === 'function') {
    runtime.sQuestLogCB();
    return;
  }

  switch (runtime.sQuestLogCB) {
    case 'QLogCB_Recording':
      QLogCB_Recording(runtime);
      break;
    case 'QLogCB_Playback':
      QLogCB_Playback(runtime);
      break;
    case 'QuestLog_AdvancePlayhead':
      QuestLog_AdvancePlayhead(runtime);
      break;
    case 'QuestLog_WaitFadeAndCancelPlayback':
      QuestLog_WaitFadeAndCancelPlayback(runtime);
      break;
  }
};

export const SetQuestLogState = (runtime: QuestLogRuntime, state: number): void => {
  runtime.gQuestLogState = state;
  if (state === QL_STATE_RECORDING)
    runtime.sQuestLogCB = 'QLogCB_Recording';
  else
    runtime.sQuestLogCB = 'QLogCB_Playback';
};

export const GetQuestLogState = (runtime: QuestLogRuntime): void => {
  runtime.specialVarResult = runtime.gQuestLogState;
};

export const GetQuestLogStartType = (runtime: QuestLogRuntime): number =>
  runtime.questLogScenes[runtime.sCurrentSceneNum].startType;

const toU8 = (value: number): number => value & 0xff;
const cloneObjectEventTemplate = (template: QuestLogObjectEventTemplate): QuestLogObjectEventTemplate => ({ ...template });
const QL_CMD_EVENT_MASK = 0x0fff;
const QL_CMD_COUNT_SHIFT = 12;
const QL_SCRIPT_EVENT_INPUT = 0;
const QL_SCRIPT_EVENT_GFX_CHANGE = 1;
const QL_SCRIPT_EVENT_MOVEMENT = 2;
const QL_SCRIPT_EVENT_SCENE_END = 39;
const QL_SCRIPT_EVENT_WAIT = 41;
const QL_EVENT_CMD_SIZES = [
  8, 8, 8, 8, 10, 8, 8, 8, 8, 10, 10, 4, 16, 12, 12, 26, 4, 4, 16, 12, 10, 10, 10,
  8, 8, 8, 8, 6, 6, 6, 12, 12, 12, 10, 12, 6, 8, 14, 14, 2, 8, 4, 6
] as const;
const isValidQlEvent = (eventId: number): boolean => eventId >= 3 && eventId <= 42;

const readScriptU16 = (script: readonly number[], offset: number): number =>
  (script[offset] ?? 0) | (((script[offset + 1] ?? 0) << 8) & 0xff00);

const readScriptRaw4 = (script: readonly number[], offset: number): number[] => [
  script[offset] ?? 0,
  script[offset + 1] ?? 0,
  script[offset + 2] ?? 0,
  script[offset + 3] ?? 0
];

export const QuestLog_PlayCurrentEvent = (runtime: QuestLogRuntime): void => {
  runtime.questLogPlayCurrentEventCalls += 1;

  if (runtime.sPlaybackControl.state === 1) {
    runtime.sPlaybackControl.timer -= 1;
    if (runtime.sPlaybackControl.timer !== 0)
      return;
    runtime.sPlaybackControl.state = 0;
    runtime.sPlaybackControl.playingEvent = true;
    TogglePlaybackStateForOverworldLock(runtime, 2);
  }

  if (runtime.sPlaybackControl.playingEvent === true) {
    runtime.sPlaybackControl.overlapTimer += 1;
    if (runtime.sPlaybackControl.overlapTimer > 15) {
      QuestLog_CloseTextWindow(runtime);
      runtime.sPlaybackControl.playingEvent = false;
      runtime.sPlaybackControl.overlapTimer = 0;
    }
  }

  if (runtime.sPlaybackControl.cursor < runtime.sEventData.length) {
    const eventData = runtime.sEventData[runtime.sPlaybackControl.cursor];
    if (QL_TryRepeatEvent(runtime, eventData) === true)
      HandleShowQuestLogMessage(runtime);
    else if (QL_LoadEvent(runtime, eventData) === true)
      HandleShowQuestLogMessage(runtime);
  }
};

export const QL_TryRepeatEvent = (runtime: QuestLogRuntime, eventData: number | null): boolean => {
  runtime.qlTryRepeatEventArgs.push(eventData);
  return runtime.qlTryRepeatEventResults.shift() ?? false;
};

export const QL_LoadEvent = (runtime: QuestLogRuntime, eventData: number | null): boolean => {
  runtime.qlLoadEventArgs.push(eventData);
  return runtime.qlLoadEventResults.shift() ?? false;
};

export const HandleShowQuestLogMessage = (runtime: QuestLogRuntime): void => {
  runtime.handledQuestLogMessages += 1;
  if (runtime.sPlaybackControl.state === 0) {
    runtime.sPlaybackControl.state = 1;
    runtime.sPlaybackControl.playingEvent = false;
    runtime.sPlaybackControl.overlapTimer = 0;
    runtime.sPlaybackControl.timer = GetQuestLogTextDisplayDuration(runtime.questLogText);
    if (runtime.questLogRepeatEventCounter === 0)
      runtime.sPlaybackControl.cursor += 1;
    if (runtime.sPlaybackControl.cursor > runtime.sEventData.length)
      return;
    DrawSceneDescription(runtime);
  }
  TogglePlaybackStateForOverworldLock(runtime, 1);
};

export const QLogCB_Recording = (runtime: QuestLogRuntime): void => {
  if (TryRecordActionSequence(runtime) !== true) {
    runtime.gQuestLogPlaybackState = QL_PLAYBACK_STATE_STOPPED;
    RecordSceneEnd(runtime);
    runtime.gQuestLogState = 0;
    runtime.sQuestLogCB = null;
  }
};

export const QLogCB_Playback = (runtime: QuestLogRuntime): void => {
  if (runtime.sPlaybackControl.state === 2)
    runtime.sPlaybackControl.state = 0;

  if (runtime.sPlaybackControl.endMode === END_MODE_NONE) {
    if (
      runtime.gQuestLogPlaybackState !== QL_PLAYBACK_STATE_STOPPED
      || runtime.sPlaybackControl.state === 1
      || (
        runtime.sPlaybackControl.cursor < runtime.sEventData.length
        && runtime.sEventData[runtime.sPlaybackControl.cursor] !== null
      )
    ) {
      QuestLog_PlayCurrentEvent(runtime);
    } else {
      runtime.sPlaybackControl.endMode = END_MODE_SCENE;
      runtime.fieldControlsLocked = true;
      DoSceneEndTransition(runtime, 0);
    }
  }
};

export const SetPlayerInitialCoordsAtScene = (runtime: QuestLogRuntime, sceneNum: number): void => {
  const questLog = runtime.questLogScenes[sceneNum];
  questLog.mapGroup = runtime.location.mapGroup;
  questLog.mapNum = runtime.location.mapNum;
  questLog.warpId = runtime.location.warpId;
  questLog.x = runtime.pos.x;
  questLog.y = runtime.pos.y;
  runtime.playerInitialCoordsScenes.push(sceneNum);
};

export const QL_RecordObjects = (runtime: QuestLogRuntime, sceneNum: number): void => {
  runtime.qlRecordObjectsScenes.push(sceneNum);
};

export const SetNPCInitialCoordsAtScene = (runtime: QuestLogRuntime, sceneNum: number): void => {
  const questLog = runtime.questLogScenes[sceneNum];
  QL_RecordObjects(runtime, sceneNum);
  for (let i = 0; i < OBJECT_EVENT_TEMPLATES_COUNT; i += 1) {
    const source = runtime.objectEventTemplates[i] ?? createSaveObjectEventTemplate();
    const dest = questLog.objectEventTemplates[i] ?? createQuestLogObjectEventTemplate();
    if (source.x < 0) {
      dest.x = toU8(-source.x);
      dest.negx = true;
    } else {
      dest.x = toU8(source.x);
      dest.negx = false;
    }
    if (source.y < 0) {
      dest.y = toU8(-source.y);
      dest.negy = true;
    } else {
      dest.y = toU8(source.y);
      dest.negy = false;
    }
    dest.elevation = source.elevation;
    dest.movementType = source.movementType;
    questLog.objectEventTemplates[i] = dest;
  }
  runtime.npcInitialCoordsScenes.push(sceneNum);
};

export const BackUpTrainerRematches = (runtime: QuestLogRuntime): void => {
  for (let i = 0; i < 4; i += 1) {
    let value = 0;
    for (let j = 0; j < 16; j += 1) {
      if (runtime.trainerRematches[16 * i + j])
        value += 1 << j;
    }
    runtime.varStore[VAR_QLBAK_TRAINER_REMATCHES + i] = value;
  }
  runtime.backedUpTrainerRematches += 1;
};

export const BackUpMapLayout = (runtime: QuestLogRuntime): void => {
  runtime.varStore[VAR_QLBAK_MAP_LAYOUT] = runtime.mapLayoutId;
  runtime.backedUpMapLayout += 1;
};

export const SetGameStateAtScene = (runtime: QuestLogRuntime, sceneNum: number): void => {
  const questLog = runtime.questLogScenes[sceneNum];
  questLog.flags = runtime.flags.slice();
  questLog.vars = runtime.vars.slice();
  runtime.gameStateScenes.push(sceneNum);
};

export const QuestLog_GetPartyCount = (runtime: QuestLogRuntime): number => {
  let count = 0;
  for (let i = 0; i < PARTY_SIZE; i += 1) {
    if (runtime.partyMons[i])
      count += 1;
  }
  return count;
};

export const QuestLog_GetBoxMonCount = (runtime: QuestLogRuntime): number => {
  let count = 0;
  for (let i = 0; i < TOTAL_BOXES_COUNT; i += 1) {
    for (let j = 0; j < IN_BOX_COUNT; j += 1) {
      if (runtime.boxMons[i]?.[j])
        count += 1;
    }
  }
  return count;
};

export const SetPokemonCounts = (runtime: QuestLogRuntime): void => {
  const partyCount = QuestLog_GetPartyCount(runtime);
  const boxesCount = QuestLog_GetBoxMonCount(runtime);
  runtime.varStore[VAR_QUEST_LOG_MON_COUNTS] = (partyCount << NUM_PC_COUNT_BITS) + boxesCount;
  runtime.pokemonCountsSet += 1;
};

export const RestoreTrainerRematches = (runtime: QuestLogRuntime): void => {
  for (let i = 0; i < 4; i += 1) {
    let value = runtime.varStore[VAR_QLBAK_TRAINER_REMATCHES + i] ?? 0;
    for (let j = 0; j < 16; j += 1) {
      runtime.trainerRematches[16 * i + j] = (value & 1) !== 0 ? 30 : 0;
      value >>= 1;
    }
  }
  runtime.restoredTrainerRematches += 1;
};

export const QL_RestoreMapLayoutId = (runtime: QuestLogRuntime): void => {
  runtime.mapLayoutId = runtime.varStore[VAR_QLBAK_MAP_LAYOUT] ?? 0;
  if (runtime.mapLayoutId === 0)
    runtime.mapLayoutId = runtime.fallbackMapLayoutId;
};

export const QL_CopySaveState = (runtime: QuestLogRuntime): void => {
  const questLog = runtime.questLogScenes[runtime.sCurrentSceneNum];
  runtime.flags = questLog.flags.slice();
  runtime.vars = questLog.vars.slice();
  RestoreTrainerRematches(runtime);
};

export const QL_ResetPartyAndPC = (runtime: QuestLogRuntime): void => {
  const packedCounts = runtime.varStore[VAR_QUEST_LOG_MON_COUNTS] ?? 0;
  const prevPartyCount = packedCounts >> NUM_PC_COUNT_BITS;
  const prevBoxMonCount = packedCounts % (1 << NUM_PC_COUNT_BITS);
  let count: number;

  runtime.qlResetPartyAndPCCalls += 1;
  count = QuestLog_GetPartyCount(runtime);
  if (count > prevPartyCount) {
    for (let i = 0; i < count - prevPartyCount; i += 1) {
      const slot = PARTY_SIZE - 1 - i;
      runtime.partyMons[slot] = false;
      runtime.zeroedPartySlots.push(slot);
    }
  } else if (count < prevPartyCount) {
    for (let i = 0; i < PARTY_SIZE - 1; i += 1) {
      runtime.boxMons[0][i] = false;
      runtime.zeroedBoxSlots.push({ box: 0, slot: i });
    }

    for (let i = count; i < prevPartyCount; i += 1) {
      runtime.partyMons[i] = true;
      runtime.placeholderPartySlots.push(i);
    }
  }

  count = QuestLog_GetBoxMonCount(runtime);
  if (count > prevBoxMonCount) {
    for (let i = 0; i < TOTAL_BOXES_COUNT; i += 1) {
      for (let j = 0; j < IN_BOX_COUNT; j += 1) {
        if (runtime.boxMons[i][j]) {
          runtime.boxMons[i][j] = false;
          runtime.zeroedBoxSlots.push({ box: i, slot: j });
          count -= 1;
          if (count === prevBoxMonCount)
            break;
        }
      }
      if (count === prevBoxMonCount)
        break;
    }
  } else if (count < prevBoxMonCount) {
    for (let i = 0; i < TOTAL_BOXES_COUNT; i += 1) {
      for (let j = 0; j < IN_BOX_COUNT; j += 1) {
        if (!runtime.boxMons[i][j]) {
          runtime.boxMons[i][j] = true;
          runtime.placeholderBoxSlots.push({ box: i, slot: j });
          count += 1;
          if (count === prevBoxMonCount)
            break;
        }
      }
      if (count === prevBoxMonCount)
        break;
    }
  }
};

export const QL_LoadObjects = (runtime: QuestLogRuntime, sceneNum: number): void => {
  runtime.qlLoadObjectsScenes.push(sceneNum);
};

export const QL_LoadObjectsAndTemplates = (runtime: QuestLogRuntime, sceneNum: number): void => {
  const questLog = runtime.questLogScenes[sceneNum];
  for (let i = 0; i < OBJECT_EVENT_TEMPLATES_COUNT; i += 1) {
    const source = questLog.objectEventTemplates[i] ?? createQuestLogObjectEventTemplate();
    const dest = runtime.objectEventTemplates[i] ?? createSaveObjectEventTemplate();
    dest.x = source.negx ? -source.x : source.x;
    dest.y = source.negy ? -toU8(source.y) : source.y;
    dest.elevation = source.elevation;
    dest.movementType = source.movementType;
    runtime.objectEventTemplates[i] = dest;
  }
  QL_LoadObjects(runtime, sceneNum);
};

export const QL_EnableRecordingSteps = (runtime: QuestLogRuntime): void => {
  runtime.qlEnableRecordingStepsCount += 1;
};

export const DestroyTask = (runtime: QuestLogRuntime, taskId: number): void => {
  runtime.destroyedTasks.push(taskId);
  delete runtime.tasks[taskId];
};

export const CreateTask = (runtime: QuestLogRuntime, func: string, priority: number): number => {
  const taskId = runtime.nextTaskId;
  runtime.nextTaskId += 1;
  runtime.tasks[taskId] = { data: Array.from({ length: 16 }, () => 0), func, priority, wordArgs: {} };
  runtime.createdTasks.push({ id: taskId, func, priority });
  return taskId;
};

export const SetWordTaskArg = (
  runtime: QuestLogRuntime,
  taskId: number,
  dataIdx: number,
  value: string | (() => void) | null
): void => {
  const task = runtime.tasks[taskId];
  if (task)
    task.wordArgs[dataIdx] = value;
};

export const GetWordTaskArg = (
  runtime: QuestLogRuntime,
  taskId: number,
  dataIdx: number
): string | (() => void) | null => runtime.tasks[taskId]?.wordArgs[dataIdx] ?? null;

export const AddWindow = (runtime: QuestLogRuntime, templateIdx: number): number => {
  const windowId = runtime.nextWindowId;
  runtime.nextWindowId += 1;
  runtime.addedWindowTemplates.push(templateIdx);
  return windowId;
};

export const FillWindowPixelRect = (
  runtime: QuestLogRuntime,
  windowId: number,
  fillValue: number,
  x: number,
  y: number,
  width: number,
  height: number
): void => {
  runtime.fillWindowPixelRects.push({ windowId, fillValue, x, y, width, height });
};

export const PutWindowTilemap = (runtime: QuestLogRuntime, windowId: number): void => {
  runtime.putWindowTilemaps.push(windowId);
};

export const CopyWindowToVram = (runtime: QuestLogRuntime, windowId: number, mode: number): void => {
  runtime.copyWindowToVramCalls.push({ windowId, mode });
};

export const ClearWindowTilemap = (runtime: QuestLogRuntime, windowId: number): void => {
  runtime.clearWindowTilemaps.push(windowId);
};

export const RemoveWindow = (runtime: QuestLogRuntime, windowId: number): void => {
  runtime.removedWindows.push(windowId);
};

export const AddTextPrinterParameterized4 = (
  runtime: QuestLogRuntime,
  windowId: number,
  x: number,
  y: number,
  text: string
): void => {
  runtime.textPrinterCalls.push({ windowId, x, y, text });
};

export const ScheduleBgCopyTilemapToVram = (runtime: QuestLogRuntime, bg: number): void => {
  runtime.bgCopyTilemapSchedules.push(bg);
};

export const SetMainCallback2 = (runtime: QuestLogRuntime, callbackName: string): void => {
  runtime.mainCallback2 = callbackName;
};

export const DisableWildEncounters = (runtime: QuestLogRuntime, disabled: boolean): void => {
  runtime.wildEncountersDisabled = disabled;
};

export const ResetSpecialVars = (runtime: QuestLogRuntime): void => {
  runtime.resetSpecialVarsCount += 1;
};

export const ClearBag = (runtime: QuestLogRuntime): void => {
  runtime.clearedBagCount += 1;
};

export const ClearPCItemSlots = (runtime: QuestLogRuntime): void => {
  runtime.clearedPCItemSlotsCount += 1;
};

export const WarpIntoMap = (runtime: QuestLogRuntime): void => {
  runtime.warpIntoMapCount += 1;
};

export const LoadTextWindowPalette = (runtime: QuestLogRuntime, paletteId: number): void => {
  runtime.loadedTextWindowPalettes.push(paletteId);
};

export const FieldCB_DefaultWarpExit = (runtime: QuestLogRuntime): void => {
  runtime.fieldDefaultWarpExitCount += 1;
};

export const FieldCB_WarpExitFadeFromBlack = (runtime: QuestLogRuntime): void => {
  runtime.fieldWarpExitFadeFromBlackCount += 1;
};

export const QL_ResetRepeatEventTracker = (runtime: QuestLogRuntime): void => {
  runtime.qlResetRepeatEventTrackerCount += 1;
};

export const DrawPreviouslyOnQuestHeader = (runtime: QuestLogRuntime, sceneNum: number): void => {
  runtime.previouslyOnQuestHeaderScenes.push(sceneNum);
  for (let i = 0; i < WIN_COUNT; i += 1) {
    runtime.sWindowIds[i] = AddWindow(runtime, i);
    FillWindowPixelRect(
      runtime,
      runtime.sWindowIds[i],
      15,
      0,
      0,
      sWindowTemplates[i].width * 8,
      sWindowTemplates[i].height * 8
    );
  }

  const text = sceneNum !== 0 ? `Previously on your quest ${sceneNum}` : 'Previously on your quest';
  runtime.questLogHeaderTexts.push(text);
  AddTextPrinterParameterized4(runtime, runtime.sWindowIds[WIN_TOP_BAR], 2, 2, text);
  PutWindowTilemap(runtime, runtime.sWindowIds[WIN_TOP_BAR]);
  PutWindowTilemap(runtime, runtime.sWindowIds[WIN_BOTTOM_BAR]);
  CopyWindowToVram(runtime, runtime.sWindowIds[WIN_TOP_BAR], COPYWIN_GFX);
  CopyWindowToVram(runtime, runtime.sWindowIds[WIN_DESCRIPTION], COPYWIN_GFX);
  CopyWindowToVram(runtime, runtime.sWindowIds[WIN_BOTTOM_BAR], COPYWIN_FULL);
};

export const CommitQuestLogWindow1 = (runtime: QuestLogRuntime): void => {
  PutWindowTilemap(runtime, runtime.sWindowIds[WIN_BOTTOM_BAR]);
  CopyWindowToVram(runtime, runtime.sWindowIds[WIN_BOTTOM_BAR], COPYWIN_MAP);
};

export const QuestLog_DrawPreviouslyOnQuestHeaderIfInPlaybackMode = (runtime: QuestLogRuntime): void => {
  if (runtime.gQuestLogState === QL_STATE_PLAYBACK)
    DrawPreviouslyOnQuestHeader(runtime, runtime.sNumScenes);
};

export const FreezeObjectEvents = (runtime: QuestLogRuntime): void => {
  runtime.frozeObjectEventsCount += 1;
};

export const HandleEnforcedLookDirectionOnPlayerStopMoving = (runtime: QuestLogRuntime): void => {
  runtime.enforcedLookDirectionCount += 1;
};

export const StopPlayerAvatar = (runtime: QuestLogRuntime): void => {
  runtime.stoppedPlayerAvatarCount += 1;
};

export const LockPlayerFieldControls = (runtime: QuestLogRuntime): void => {
  runtime.fieldControlsLocked = true;
};

export const UnlockPlayerFieldControls = (runtime: QuestLogRuntime): void => {
  runtime.fieldControlsLocked = false;
  runtime.unlockedPlayerFieldControlsCount += 1;
};

export const DrawSceneDescription = (runtime: QuestLogRuntime): void => {
  runtime.questLogDescriptionDrawnCount += 1;
  let numLines = 0;
  for (let i = 0; i < 0x100 && runtime.questLogText[i] !== EOS; i += 1) {
    if (runtime.questLogText[i] === CHAR_NEWLINE)
      numLines += 1;
  }

  const textY = sQuestLogTextLineYCoords[numLines] ?? 0;
  runtime.questLogDescriptionLineCounts.push(numLines);
  runtime.questLogDescriptionTextYs.push(textY);
  PutWindowTilemap(runtime, runtime.sWindowIds[WIN_DESCRIPTION]);
  CopyDescriptionWindowTiles(runtime, runtime.sWindowIds[WIN_DESCRIPTION]);
  AddTextPrinterParameterized4(runtime, runtime.sWindowIds[WIN_DESCRIPTION], 2, textY, runtime.questLogText.join(','));
  ScheduleBgCopyTilemapToVram(runtime, 0);
};

export const QuestLog_CloseTextWindow = (runtime: QuestLogRuntime): void => {
  runtime.questLogTextWindowClosedCount += 1;
  ClearWindowTilemap(runtime, runtime.sWindowIds[WIN_DESCRIPTION]);
  FillWindowPixelRect(runtime, runtime.sWindowIds[WIN_DESCRIPTION], 15, 0, 0, 0xf0, 0x30);
  CopyWindowToVram(runtime, runtime.sWindowIds[WIN_DESCRIPTION], COPYWIN_GFX);
  PutWindowTilemap(runtime, runtime.sWindowIds[WIN_BOTTOM_BAR]);
  CopyWindowToVram(runtime, runtime.sWindowIds[WIN_BOTTOM_BAR], COPYWIN_MAP);
};

export const CopyDescriptionWindowTiles = (runtime: QuestLogRuntime, windowId: number): void => {
  runtime.descriptionWindowTileCopies.push(windowId);
};

export const Save_ResetSaveCounters = (runtime: QuestLogRuntime): void => {
  runtime.saveResetSaveCountersCount += 1;
};

export const LoadGameSave = (runtime: QuestLogRuntime, saveType: number): void => {
  runtime.loadGameSaveCalls.push(saveType);
};

export const FreeAllWindowBuffers = (runtime: QuestLogRuntime): void => {
  runtime.freeAllWindowBuffersCount += 1;
};

export const Overworld_PlaySpecialMapMusic = (runtime: QuestLogRuntime): void => {
  runtime.overworldSpecialMapMusicCount += 1;
};

export const QL_SlightlyDarkenSomePals = (runtime: QuestLogRuntime): void => {
  runtime.slightlyDarkenedPalsCount += 1;
  if (runtime.sPalettesBackup === null)
    return;

  const buffer = runtime.sPalettesBackup.slice();
  const ranges = [
    { offset: 0, count: 13 * 16 },
    { offset: 0x100 + 1 * 16, count: 1 * 16 },
    { offset: 0x100 + 6 * 16, count: 4 * 16 },
    { offset: 0x100 + 11 * 16, count: 5 * 16 }
  ];
  for (const range of ranges) {
    runtime.slightlyDarkenedPalRanges.push(range);
    for (let i = 0; i < range.count; i += 1) {
      const idx = range.offset + i;
      runtime.sPalettesBackup[idx] = (runtime.sPalettesBackup[idx] ?? 0) & 0x7bde;
    }
  }
  runtime.plttBufferUnfaded = runtime.sPalettesBackup.slice();
  runtime.sPalettesBackup = buffer;
};

export const RestoreScreenAfterPlayback = (runtime: QuestLogRuntime, taskId: number): boolean => {
  const task = runtime.tasks[taskId];
  if (!task)
    return false;

  const timer = task.data[1];
  if (timer > 15)
    return true;

  runtime.invertedTintCopies.push({ sourceOffset: 1, destOffset: 1, size: 0xdf, tint: 15 - timer });
  runtime.invertedTintCopies.push({ sourceOffset: 0x100, destOffset: 0x100, size: 0x100, tint: 15 - timer });
  FillWindowPixelRect(
    runtime,
    runtime.sWindowIds[WIN_TOP_BAR],
    0,
    0,
    sWindowTemplates[WIN_TOP_BAR].height * 8 - 1 - timer,
    sWindowTemplates[WIN_TOP_BAR].width * 8,
    1
  );
  FillWindowPixelRect(
    runtime,
    runtime.sWindowIds[WIN_BOTTOM_BAR],
    0,
    0,
    timer,
    sWindowTemplates[WIN_BOTTOM_BAR].width * 8,
    1
  );
  CopyWindowToVram(runtime, runtime.sWindowIds[WIN_TOP_BAR], COPYWIN_GFX);
  CopyWindowToVram(runtime, runtime.sWindowIds[WIN_BOTTOM_BAR], COPYWIN_GFX);
  task.data[1] += 1;
  return false;
};

export const ClearPlayerHeldMovementAndUnfreezeObjectEvents = (runtime: QuestLogRuntime): void => {
  runtime.clearedPlayerHeldMovementCount += 1;
};

export const ShowMapNamePopup = (runtime: QuestLogRuntime, flag: boolean): void => {
  runtime.mapNamePopupShown.push(flag);
};

export const BeginNormalPaletteFade = (
  runtime: QuestLogRuntime,
  palettes: number,
  delay: number,
  startY: number,
  targetY: number,
  color: number
): void => {
  runtime.normalPaletteFades.push({ palettes, delay, startY, targetY, color });
  runtime.paletteFadeActive = true;
};

export const FadeScreen = (runtime: QuestLogRuntime, mode: number, delay: number): void => {
  runtime.fadeScreenCalls.push({ mode, delay });
};

export const QLPlayback_SetInitialPlayerPosition = (runtime: QuestLogRuntime, sceneNum: number, isWarp: boolean): QuestLogLocation & QuestLogPosition => {
  const questLog = runtime.questLogScenes[sceneNum];
  const position = {
    mapGroup: questLog.mapGroup,
    mapNum: questLog.mapNum,
    warpId: questLog.warpId,
    x: questLog.x,
    y: questLog.y
  };
  if (!isWarp) {
    runtime.location = { mapGroup: position.mapGroup, mapNum: position.mapNum, warpId: position.warpId };
    runtime.pos = { x: position.x, y: position.y };
  } else {
    runtime.warpDestination = position;
  }
  return position;
};

const skipQuestLogCommand = (
  script: readonly number[],
  curPtr: number,
  prevPtr: { value: number | null }
): number | null => {
  const header = readScriptU16(script, curPtr);
  const eventId = header & QL_CMD_EVENT_MASK;
  let count = header >> QL_CMD_COUNT_SHIFT;

  if (eventId === 33)
    count = 0;

  if (!isValidQlEvent(eventId))
    return null;

  prevPtr.value = curPtr;
  return curPtr + QL_EVENT_CMD_SIZES[eventId] + (QL_EVENT_CMD_SIZES[eventId] - 4) * count;
};

const updateLastDepartedLocation = (runtime: QuestLogRuntime, script: readonly number[], offset: number): void => {
  const eventId = readScriptU16(script, offset) & QL_CMD_EVENT_MASK;
  if (eventId !== QL_EVENT_DEPARTED)
    runtime.sLastDepartedLocation = 0;
  else
    runtime.sLastDepartedLocation = (script[offset + 5] ?? 0) + 1;
};

export const ReadQuestLogScriptFromSav1 = (
  runtime: QuestLogRuntime,
  sceneNum: number,
  actions: QuestLogAction[]
): void => {
  let scriptOffset = 0;
  let actionNum = 0;
  let eventNum = 0;
  const script = runtime.questLogScenes[sceneNum].script;

  for (let i = 0; i < runtime.sEventData.length; i += 1)
    actions[i] = createQuestLogAction();
  for (let i = 0; i < runtime.sEventData.length; i += 1)
    runtime.sEventData[i] = null;

  runtime.readQuestLogScriptScenes.push(sceneNum);
  for (let i = 0; i < runtime.sEventData.length; i += 1) {
    const eventId = readScriptU16(script, scriptOffset) & QL_CMD_EVENT_MASK;
    let nextOffset: number | null;

    switch (eventId) {
      case QL_SCRIPT_EVENT_INPUT:
        actions[actionNum].type = QL_ACTION_INPUT;
        actions[actionNum].duration = readScriptU16(script, scriptOffset + 2);
        actions[actionNum].data.raw = readScriptRaw4(script, scriptOffset + 4);
        actions[actionNum].data.fieldInput = actions[actionNum].data.raw.slice();
        nextOffset = scriptOffset + 8;
        actionNum += 1;
        break;
      case QL_SCRIPT_EVENT_GFX_CHANGE:
      case QL_SCRIPT_EVENT_MOVEMENT:
        actions[actionNum].type = eventId === QL_SCRIPT_EVENT_MOVEMENT ? QL_ACTION_MOVEMENT : QL_ACTION_GFX_CHANGE;
        actions[actionNum].duration = readScriptU16(script, scriptOffset + 2);
        actions[actionNum].data.raw = readScriptRaw4(script, scriptOffset + 4);
        actions[actionNum].data.a.movementActionId = actions[actionNum].data.raw[0];
        actions[actionNum].data.b.gfxState = actions[actionNum].data.raw[0];
        nextOffset = scriptOffset + 8;
        actionNum += 1;
        break;
      case QL_SCRIPT_EVENT_SCENE_END:
        actions[actionNum].type = QL_ACTION_SCENE_END;
        actions[actionNum].duration = 0;
        actions[actionNum].data.raw = [0, 0, 0, 0];
        nextOffset = scriptOffset + 2;
        actionNum += 1;
        break;
      case QL_SCRIPT_EVENT_WAIT:
        actions[actionNum].type = QL_ACTION_WAIT;
        actions[actionNum].duration = readScriptU16(script, scriptOffset + 2);
        actions[actionNum].data.raw = [0, 0, 0, 0];
        nextOffset = scriptOffset + 4;
        actionNum += 1;
        break;
      default: {
        const eventData = { value: null };
        nextOffset = skipQuestLogCommand(script, scriptOffset, eventData);
        runtime.sEventData[eventNum] = eventData.value;
        if (eventNum === 0)
          updateLastDepartedLocation(runtime, script, eventData.value ?? scriptOffset);
        eventNum += 1;
        break;
      }
    }
    if (nextOffset === null)
      break;
    scriptOffset = nextOffset;
  }
};

export const QL_InitSceneObjectsAndActions = (
  runtime: QuestLogRuntime,
  actions: QuestLogAction[] = runtime.sCurSceneActions
): void => {
  ReadQuestLogScriptFromSav1(runtime, runtime.sCurrentSceneNum, actions);
  QL_ResetRepeatEventTracker(runtime);
  ResetActions(runtime, QL_PLAYBACK_STATE_RUNNING, actions, actions.length * 8);
  QL_LoadObjectsAndTemplates(runtime, runtime.sCurrentSceneNum);
};

export const FieldCB2_QuestLogStartPlaybackWithWarpExit = (runtime: QuestLogRuntime): boolean => {
  LoadTextWindowPalette(runtime, 4);
  SetQuestLogState(runtime, QL_STATE_PLAYBACK);
  FieldCB_DefaultWarpExit(runtime);
  runtime.sPlaybackControl = { state: 0, playingEvent: false, endMode: END_MODE_NONE, cursor: 0, timer: 0, overlapTimer: 0 };
  runtime.sPlaybackControl.state = 2;
  return true;
};

export const FieldCB2_QuestLogStartPlaybackStandingInPlace = (runtime: QuestLogRuntime): boolean => {
  LoadTextWindowPalette(runtime, 4);
  SetQuestLogState(runtime, QL_STATE_PLAYBACK);
  FieldCB_WarpExitFadeFromBlack(runtime);
  runtime.sPlaybackControl = { state: 0, playingEvent: false, endMode: END_MODE_NONE, cursor: 0, timer: 0, overlapTimer: 0 };
  runtime.sPlaybackControl.state = 2;
  return true;
};

export const QLPlayback_InitOverworldState = (runtime: QuestLogRuntime): void => {
  runtime.gQuestLogState = QL_STATE_PLAYBACK;
  ResetSpecialVars(runtime);
  ClearBag(runtime);
  ClearPCItemSlots(runtime);
  if (GetQuestLogStartType(runtime) === QL_START_NORMAL) {
    QLPlayback_SetInitialPlayerPosition(runtime, runtime.sCurrentSceneNum, false);
    runtime.fieldCallback2 = 'FieldCB2_QuestLogStartPlaybackStandingInPlace';
    SetMainCallback2(runtime, 'CB2_SetUpOverworldForQLPlayback');
  } else {
    QLPlayback_SetInitialPlayerPosition(runtime, runtime.sCurrentSceneNum, true);
    WarpIntoMap(runtime);
    runtime.fieldCallback2 = 'FieldCB2_QuestLogStartPlaybackWithWarpExit';
    SetMainCallback2(runtime, 'CB2_SetUpOverworldForQLPlaybackWithWarpExit');
  }
};

export const Task_BeginQuestLogPlayback = (runtime: QuestLogRuntime, _taskId: number): void => {
  runtime.location.mapGroup = MAP_GROUP_ROUTE1;
  runtime.location.mapNum = MAP_NUM_ROUTE1;
  runtime.location.warpId = WARP_ID_NONE;
  runtime.sCurrentSceneNum = 0;
  runtime.gDisableMapMusicChangeOnMapLoad = 1;
  DisableWildEncounters(runtime, true);
  QLPlayback_InitOverworldState(runtime);
};

export const TryStartQuestLogPlayback = (runtime: QuestLogRuntime, taskId: number): void => {
  QL_EnableRecordingSteps(runtime);
  runtime.sNumScenes = 0;
  for (let i = 0; i < QUEST_LOG_SCENE_COUNT; i += 1) {
    if (runtime.questLogScenes[i].startType !== 0)
      runtime.sNumScenes += 1;
  }

  if (runtime.sNumScenes !== 0) {
    runtime.helpSystemEnabled = false;
    Task_BeginQuestLogPlayback(runtime, taskId);
    DestroyTask(runtime, taskId);
  } else {
    SetMainCallback2(runtime, 'CB2_ContinueSavedGame');
    DestroyTask(runtime, taskId);
  }
};

export const QuestLog_StartFinalScene = (runtime: QuestLogRuntime): void => {
  ResetSpecialVars(runtime);
  Save_ResetSaveCounters(runtime);
  LoadGameSave(runtime, SAVE_NORMAL);
  SetMainCallback2(runtime, 'CB2_EnterFieldFromQuestLog');
  runtime.fieldCallback2 = 'FieldCB2_FinalScene';
  FreeAllWindowBuffers(runtime);
  runtime.gQuestLogState = QL_STATE_PLAYBACK_LAST;
  runtime.sQuestLogCB = null;
};

export const QuestLog_AdvancePlayhead = (runtime: QuestLogRuntime): void => {
  if (runtime.paletteFadeActive)
    return;

  LockPlayerFieldControls(runtime);
  runtime.sCurrentSceneNum += 1;
  if (
    runtime.sCurrentSceneNum < QUEST_LOG_SCENE_COUNT
    && runtime.questLogScenes[runtime.sCurrentSceneNum].startType !== 0
  ) {
    runtime.sNumScenes -= 1;
    QLPlayback_InitOverworldState(runtime);
  } else {
    runtime.gQuestLogPlaybackState = QL_PLAYBACK_STATE_STOPPED;
    QuestLog_StartFinalScene(runtime);
  }
};

export const QuestLog_AdvancePlayhead_ = (runtime: QuestLogRuntime): void => {
  QuestLog_AdvancePlayhead(runtime);
};

export const QuestLog_WaitFadeAndCancelPlayback = (runtime: QuestLogRuntime): void => {
  if (!runtime.paletteFadeActive) {
    LockPlayerFieldControls(runtime);
    for (; runtime.sCurrentSceneNum < QUEST_LOG_SCENE_COUNT; runtime.sCurrentSceneNum += 1) {
      if (runtime.questLogScenes[runtime.sCurrentSceneNum].startType === 0)
        break;
      ReadQuestLogScriptFromSav1(runtime, runtime.sCurrentSceneNum, runtime.sCurSceneActions);
    }
    runtime.gQuestLogPlaybackState = QL_PLAYBACK_STATE_STOPPED;
    QuestLog_StartFinalScene(runtime);
  }
};

export const QuestLog_InitPalettesBackup = (runtime: QuestLogRuntime): void => {
  if (runtime.gQuestLogState === QL_STATE_PLAYBACK_LAST) {
    runtime.sPalettesBackup = Array.from({ length: PLTT_U16_COUNT }, () => 0);
    runtime.paletteBackupAllocs += 1;
  }
};

export const QuestLog_BackUpPalette = (runtime: QuestLogRuntime, offset: number, size: number): void => {
  if (runtime.sPalettesBackup === null)
    return;
  for (let i = 0; i < size; i += 1)
    runtime.sPalettesBackup[offset + i] = runtime.plttBufferUnfaded[offset + i] ?? 0;
  runtime.backupPaletteCopies.push({ offset, size });
};

export const QL_AvoidDisplay = (
  runtime: QuestLogRuntime,
  callback: string | (() => void) | null = null
): boolean => {
  let taskId: number;

  switch (runtime.gQuestLogState) {
    case QL_STATE_RECORDING:
      QuestLog_CutRecording(runtime);
      break;
    case QL_STATE_PLAYBACK:
      runtime.gQuestLogPlaybackState = QL_PLAYBACK_STATE_ACTION_END;
      taskId = CreateTask(runtime, 'Task_AvoidDisplay', 80);
      runtime.tasks[taskId].data[0] = 0;
      runtime.tasks[taskId].data[1] = 0;
      SetWordTaskArg(runtime, taskId, DATA_IDX_CALLBACK, callback);
      return true;
  }
  return false;
};

export const Task_AvoidDisplay = (runtime: QuestLogRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  if (!task)
    return;

  switch (task.data[1]) {
    case 0:
      task.data[0] += 1;
      if (task.data[0] === 127) {
        BeginNormalPaletteFade(runtime, PALETTES_ALL, 0, 0, 16, 0);
        runtime.sPlaybackControl.endMode = END_MODE_SCENE;
        task.data[1] += 1;
      }
      break;
    case 1:
      if (!runtime.paletteFadeActive) {
        const routine = GetWordTaskArg(runtime, taskId, DATA_IDX_CALLBACK);
        runtime.gQuestLogPlaybackState = QL_PLAYBACK_STATE_STOPPED;
        if (typeof routine === 'function') {
          routine();
          runtime.avoidedDisplayCallbacksCalled += 1;
        } else if (routine !== null) {
          runtime.avoidedDisplayCallbacksCalled += 1;
        }
        DestroyTask(runtime, taskId);
        runtime.sQuestLogCB = 'QuestLog_AdvancePlayhead';
      }
      break;
  }
};

export const FieldCB2_FinalScene = (runtime: QuestLogRuntime): boolean => {
  LoadTextWindowPalette(runtime, 4);
  DrawPreviouslyOnQuestHeader(runtime, 0);
  FieldCB_WarpExitFadeFromBlack(runtime);
  CreateTask(runtime, 'Task_FinalScene_WaitFade', 0xff);
  return true;
};

export const Task_FinalScene_WaitFade = (runtime: QuestLogRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  if (!task)
    return;

  if (runtime.fieldControlsLocked !== true) {
    FreezeObjectEvents(runtime);
    HandleEnforcedLookDirectionOnPlayerStopMoving(runtime);
    StopPlayerAvatar(runtime);
    LockPlayerFieldControls(runtime);
    task.func = 'Task_QuestLogScene_SavedGame';
  }
};

export const Task_QuestLogScene_SavedGame = (runtime: QuestLogRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  if (!task)
    return;

  if (!runtime.paletteFadeActive) {
    if (runtime.sPlaybackControl.endMode !== END_MODE_FINISH) {
      runtime.mapNameLookups.push(0);
      DrawSceneDescription(runtime);
    }
    task.data[0] = 0;
    task.data[1] = 0;
    task.func = 'Task_WaitAtEndOfQuestLog';
    FreezeObjectEvents(runtime);
    LockPlayerFieldControls(runtime);
  }
};

export const Task_WaitAtEndOfQuestLog = (runtime: QuestLogRuntime, taskId: number, newKeys = 0): void => {
  const task = runtime.tasks[taskId];
  if (!task)
    return;

  if (
    (newKeys & (A_BUTTON | B_BUTTON)) !== 0
    || task.data[0] >= 127
    || runtime.sPlaybackControl.endMode === END_MODE_FINISH
  ) {
    QuestLog_CloseTextWindow(runtime);
    task.data[0] = 0;
    task.func = 'Task_EndQuestLog';
    runtime.gQuestLogState = 0;
  } else {
    task.data[0] += 1;
  }
};

export const Task_EndQuestLog = (runtime: QuestLogRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  if (!task)
    return;

  switch (task.data[0]) {
    case 0:
      runtime.gDisableMapMusicChangeOnMapLoad = 0;
      Overworld_PlaySpecialMapMusic(runtime);
      QL_SlightlyDarkenSomePals(runtime);
      FillWindowPixelRect(
        runtime,
        runtime.sWindowIds[WIN_TOP_BAR],
        0x0f,
        0,
        0,
        sWindowTemplates[WIN_TOP_BAR].width * 8,
        sWindowTemplates[WIN_TOP_BAR].height * 8
      );
      task.data[0] += 1;
      break;
    case 1:
      if (RestoreScreenAfterPlayback(runtime, taskId)) {
        for (let i = 0; i < WIN_COUNT; i += 1) {
          ClearWindowTilemap(runtime, runtime.sWindowIds[i]);
          CopyWindowToVram(runtime, runtime.sWindowIds[i], COPYWIN_MAP);
          RemoveWindow(runtime, runtime.sWindowIds[i]);
          runtime.clearedWindowIds.push(i);
          runtime.removedWindowIds.push(i);
        }
        task.data[1] = 0;
        task.data[0] += 1;
      }
      break;
    case 2:
      if (task.data[1] < 32)
        task.data[1] += 1;
      else
        task.data[0] += 1;
      break;
    default:
      if (runtime.sPlaybackControl.endMode === END_MODE_FINISH)
        ShowMapNamePopup(runtime, true);
      runtime.copiedPalettesBackupCount += 1;
      runtime.freedPalettesBackupCount += 1;
      runtime.sPlaybackControl = { state: 0, playingEvent: false, endMode: END_MODE_NONE, cursor: 0, timer: 0, overlapTimer: 0 };
      ClearPlayerHeldMovementAndUnfreezeObjectEvents(runtime);
      UnlockPlayerFieldControls(runtime);
      runtime.textAutoScroll = false;
      runtime.globalFieldTintMode = QL_TINT_NONE;
      DisableWildEncounters(runtime, false);
      runtime.helpSystemEnabled = true;
      DestroyTask(runtime, taskId);
      break;
  }
};

export const QL_StartRecordingAction = (runtime: QuestLogRuntime, eventId: number, actions: QuestLogAction[] = runtime.sCurSceneActions): void => {
  if (runtime.sCurrentSceneNum >= QUEST_LOG_SCENE_COUNT)
    runtime.sCurrentSceneNum = 0;

  ClearSavedScene(runtime, runtime.sCurrentSceneNum);
  QL_ResetRepeatEventTracker(runtime);
  runtime.gQuestLogRecordingPointer = 0;
  runtime.questLogScenes[runtime.sCurrentSceneNum].startType = IsLinkQuestLogEvent(eventId) || eventId === QL_EVENT_DEPARTED
    ? QL_START_WARP
    : QL_START_NORMAL;
  SetPokemonCounts(runtime);
  SetPlayerInitialCoordsAtScene(runtime, runtime.sCurrentSceneNum);
  SetNPCInitialCoordsAtScene(runtime, runtime.sCurrentSceneNum);
  BackUpTrainerRematches(runtime);
  BackUpMapLayout(runtime);
  SetGameStateAtScene(runtime, runtime.sCurrentSceneNum);
  runtime.sRecordSequenceStartIdx = 0;
  ResetActions(runtime, QL_PLAYBACK_STATE_RECORDING, actions, actions.length * 8);
  TryRecordActionSequence(runtime);
  SetQuestLogState(runtime, QL_STATE_RECORDING);
};

export const RecordHeadAtEndOfEntryOrScriptContext2Enabled = (runtime: QuestLogRuntime): boolean => {
  if (runtime.gQuestLogCurActionIdx >= runtime.sMaxActionsInScene || runtime.fieldControlsLocked === true) {
    return true;
  }
  return false;
};

export const RecordHeadAtEndOfEntry = (runtime: QuestLogRuntime): boolean => {
  if (runtime.gQuestLogCurActionIdx >= runtime.sMaxActionsInScene) {
    return true;
  }
  return false;
};

const movementForFacingDirection = (direction: number): number => {
  switch (direction) {
    case DIR_NONE:
    case DIR_SOUTH:
      return MOVEMENT_ACTION_FACE_DOWN;
    case DIR_EAST:
      return MOVEMENT_ACTION_FACE_RIGHT;
    case DIR_NORTH:
      return MOVEMENT_ACTION_FACE_UP;
    case DIR_WEST:
      return MOVEMENT_ACTION_FACE_LEFT;
    default:
      return MOVEMENT_ACTION_FACE_DOWN;
  }
};

export const ResetActions = (
  runtime: QuestLogRuntime,
  kind: number,
  actions: QuestLogAction[],
  size: number
): void => {
  let i: number;

  switch (kind) {
    default:
      runtime.gQuestLogPlaybackState = QL_PLAYBACK_STATE_STOPPED;
      break;
    case QL_PLAYBACK_STATE_RUNNING:
      runtime.sCurSceneActions = actions;
      runtime.sMaxActionsInScene = Math.trunc(size / 8);
      for (i = 0; i < runtime.sMovementScripts.length; i += 1) {
        runtime.sMovementScripts[i][0] |= MOVEMENT_ACTION_NONE;
        runtime.sMovementScripts[i][1] |= QL_PLAYER_GFX_NONE;
      }
      runtime.gQuestLogCurActionIdx = 0;
      runtime.sLastQuestLogCursor = 0;
      runtime.gQuestLogFieldInput = { raw: [0, 0, 0, 0] };
      runtime.sNextActionDelay = runtime.sCurSceneActions[runtime.gQuestLogCurActionIdx].duration;
      runtime.sMovementScripts[0][0] =
        runtime.sCurSceneActions[runtime.gQuestLogCurActionIdx].data.a.movementActionId;
      runtime.sMovementScripts[0][1] = QL_PLAYER_GFX_NONE;
      runtime.gQuestLogPlaybackState = QL_PLAYBACK_STATE_RUNNING;
      break;
    case QL_PLAYBACK_STATE_RECORDING:
      runtime.sCurSceneActions = actions;
      runtime.sMaxActionsInScene = Math.trunc(size / 8);
      for (i = 0; i < runtime.sMaxActionsInScene; i += 1) {
        runtime.sCurSceneActions[i] = createQuestLogAction({
          duration: 0xffff,
          type: QL_ACTION_SCENE_END
        });
      }
      runtime.gQuestLogCurActionIdx = 0;
      runtime.sNextActionDelay = 0;
      runtime.sCurSceneActions[runtime.gQuestLogCurActionIdx].duration = 0;
      runtime.sCurSceneActions[runtime.gQuestLogCurActionIdx].type = QL_ACTION_MOVEMENT;
      runtime.sCurSceneActions[runtime.gQuestLogCurActionIdx].data.a.localId = 0;
      runtime.sCurSceneActions[runtime.gQuestLogCurActionIdx].data.a.movementActionId =
        movementForFacingDirection(runtime.playerFacingDirection);
      runtime.sLastQuestLogCursor = 0;
      runtime.gQuestLogCurActionIdx += 1;
      runtime.sCurSceneActions[runtime.gQuestLogCurActionIdx].duration = 0;
      runtime.sCurSceneActions[runtime.gQuestLogCurActionIdx].type = QL_ACTION_INPUT;
      runtime.sCurSceneActions[runtime.gQuestLogCurActionIdx].data.fieldInput[0] = 0;
      runtime.sCurSceneActions[runtime.gQuestLogCurActionIdx].data.fieldInput[1] = 0;
      runtime.sCurSceneActions[runtime.gQuestLogCurActionIdx].data.fieldInput[2] = 0;
      runtime.sCurSceneActions[runtime.gQuestLogCurActionIdx].data.fieldInput[3] = 0;
      runtime.gQuestLogCurActionIdx += 1;
      runtime.gQuestLogPlaybackState = QL_PLAYBACK_STATE_RECORDING;
      break;
  }
};

export const QuestLogRecordNPCStep = (
  runtime: QuestLogRuntime,
  localId: number,
  mapNum: number,
  mapGroup: number,
  movementActionId: number
): void => {
  if (!RecordHeadAtEndOfEntryOrScriptContext2Enabled(runtime)) {
    const action = runtime.sCurSceneActions[runtime.gQuestLogCurActionIdx];
    action.duration = runtime.sNextActionDelay;
    action.type = QL_ACTION_MOVEMENT;
    action.data.a.localId = localId;
    action.data.a.mapNum = mapNum;
    action.data.a.mapGroup = mapGroup;
    action.data.a.movementActionId = movementActionId;
    runtime.gQuestLogCurActionIdx += 1;
    runtime.sNextActionDelay = 0;
  }
};

export const QuestLogRecordNPCStepWithDuration = (
  runtime: QuestLogRuntime,
  localId: number,
  mapNum: number,
  mapGroup: number,
  movementActionId: number,
  duration: number
): void => {
  if (!RecordHeadAtEndOfEntry(runtime)) {
    const action = runtime.sCurSceneActions[runtime.gQuestLogCurActionIdx];
    action.duration = runtime.sNextActionDelay;
    action.type = QL_ACTION_MOVEMENT;
    action.data.a.localId = localId;
    action.data.a.mapNum = mapNum;
    action.data.a.mapGroup = mapGroup;
    action.data.a.movementActionId = movementActionId;
    runtime.gQuestLogCurActionIdx += 1;
    runtime.sNextActionDelay = duration;
  }
};

export const QuestLogRecordPlayerStep = (runtime: QuestLogRuntime, movementActionId: number): void => {
  if (!RecordHeadAtEndOfEntryOrScriptContext2Enabled(runtime)) {
    if (
      movementActionId !== runtime.sCurSceneActions[runtime.sLastQuestLogCursor].data.a.movementActionId
      || movementActionId > MOVEMENT_ACTION_FACE_RIGHT
    ) {
      const action = runtime.sCurSceneActions[runtime.gQuestLogCurActionIdx];
      action.duration = runtime.sNextActionDelay;
      action.type = QL_ACTION_MOVEMENT;
      action.data.a.localId = 0;
      action.data.a.movementActionId = movementActionId;
      runtime.sLastQuestLogCursor = runtime.gQuestLogCurActionIdx;
      runtime.gQuestLogCurActionIdx += 1;
      runtime.sNextActionDelay = 0;
    }
  }
};

export const QuestLogRecordPlayerStepWithDuration = (
  runtime: QuestLogRuntime,
  movementActionId: number,
  duration: number
): void => {
  if (!RecordHeadAtEndOfEntry(runtime)) {
    const action = runtime.sCurSceneActions[runtime.gQuestLogCurActionIdx];
    action.duration = runtime.sNextActionDelay;
    action.type = QL_ACTION_MOVEMENT;
    action.data.a.localId = 0;
    action.data.a.movementActionId = movementActionId;
    runtime.sLastQuestLogCursor = runtime.gQuestLogCurActionIdx;
    runtime.gQuestLogCurActionIdx += 1;
    runtime.sNextActionDelay = duration;
  }
};

export const QuestLogRecordPlayerAvatarGfxTransition = (runtime: QuestLogRuntime, gfxState: number): void => {
  if (!RecordHeadAtEndOfEntry(runtime)) {
    const action = runtime.sCurSceneActions[runtime.gQuestLogCurActionIdx];
    action.duration = runtime.sNextActionDelay;
    action.type = QL_ACTION_GFX_CHANGE;
    action.data.b.localId = 0;
    action.data.b.gfxState = gfxState;
    runtime.gQuestLogCurActionIdx += 1;
    runtime.sNextActionDelay = 0;
  }
};

export const QuestLogRecordPlayerAvatarGfxTransitionWithDuration = (
  runtime: QuestLogRuntime,
  gfxState: number,
  duration: number
): void => {
  if (!RecordHeadAtEndOfEntry(runtime)) {
    const action = runtime.sCurSceneActions[runtime.gQuestLogCurActionIdx];
    action.duration = runtime.sNextActionDelay;
    action.type = QL_ACTION_GFX_CHANGE;
    action.data.b.localId = 0;
    action.data.b.gfxState = gfxState;
    runtime.gQuestLogCurActionIdx += 1;
    runtime.sNextActionDelay = duration;
  }
};

export const QL_RecordFieldInput = (runtime: QuestLogRuntime, fieldInputRaw: number): void => {
  if (runtime.gQuestLogCurActionIdx < runtime.sMaxActionsInScene) {
    const data = fieldInputRaw & 0x00ff00f3;
    const action = runtime.sCurSceneActions[runtime.gQuestLogCurActionIdx];
    action.duration = runtime.sNextActionDelay;
    action.type = QL_ACTION_INPUT;
    action.data.fieldInput[0] = data & 0xff;
    action.data.fieldInput[1] = (data >>> 8) & 0xff;
    action.data.fieldInput[2] = (data >>> 16) & 0xff;
    action.data.fieldInput[3] = (data >>> 24) & 0xff;
    runtime.gQuestLogCurActionIdx += 1;
    runtime.sNextActionDelay = runtime.fieldControlsLocked ? 1 : 0;
  }
};

export const TogglePlaybackStateForOverworldLock = (runtime: QuestLogRuntime, value: number): void => {
  switch (value) {
    case 1:
      if (runtime.gQuestLogPlaybackState === QL_PLAYBACK_STATE_RUNNING)
        runtime.gQuestLogPlaybackState = QL_PLAYBACK_STATE_ACTION_END;
      break;
    case 2:
      if (runtime.gQuestLogPlaybackState === QL_PLAYBACK_STATE_ACTION_END)
        runtime.gQuestLogPlaybackState = QL_PLAYBACK_STATE_RUNNING;
      break;
  }
};

export const QL_GetPlaybackState = (runtime: QuestLogRuntime): number => {
  switch (runtime.gQuestLogPlaybackState) {
    case QL_PLAYBACK_STATE_RUNNING:
    case QL_PLAYBACK_STATE_ACTION_END:
      return QL_PLAYBACK_STATE_RUNNING;
    case QL_PLAYBACK_STATE_RECORDING:
    case QL_PLAYBACK_STATE_RECORDING_NO_DELAY:
      return QL_PLAYBACK_STATE_RECORDING;
    case QL_PLAYBACK_STATE_STOPPED:
    default:
      return QL_PLAYBACK_STATE_STOPPED;
  }
};

export const QuestLog_OnEscalatorWarp = (runtime: QuestLogRuntime, direction: number): void => {
  const state = QL_GetPlaybackState(runtime);
  switch (direction) {
    case QL_ESCALATOR_OUT:
      if (state === QL_PLAYBACK_STATE_RUNNING) {
        runtime.gQuestLogPlaybackState = QL_PLAYBACK_STATE_ACTION_END;
      } else if (state === QL_PLAYBACK_STATE_RECORDING) {
        const action = runtime.sCurSceneActions[runtime.gQuestLogCurActionIdx];
        action.duration = runtime.sNextActionDelay;
        action.type = QL_ACTION_EMPTY;
        runtime.gQuestLogCurActionIdx += 1;
        runtime.sNextActionDelay = 0;
        runtime.gQuestLogPlaybackState = QL_PLAYBACK_STATE_RECORDING_NO_DELAY;
      }
      break;
    case QL_ESCALATOR_IN:
      if (state === QL_PLAYBACK_STATE_RUNNING)
        runtime.gQuestLogPlaybackState = QL_PLAYBACK_STATE_RUNNING;
      else if (state === QL_PLAYBACK_STATE_RECORDING)
        runtime.gQuestLogPlaybackState = QL_PLAYBACK_STATE_RECORDING;
      break;
  }
};

export const QL_TryRunActions = (runtime: QuestLogRuntime): void => {
  switch (runtime.gQuestLogPlaybackState) {
    case QL_PLAYBACK_STATE_STOPPED:
    case QL_PLAYBACK_STATE_ACTION_END:
    case QL_PLAYBACK_STATE_RECORDING_NO_DELAY:
      break;
    case QL_PLAYBACK_STATE_RUNNING:
      if (!RecordHeadAtEndOfEntryOrScriptContext2Enabled(runtime)) {
        if (runtime.sNextActionDelay !== 0) {
          runtime.sNextActionDelay -= 1;
        } else {
          do {
            const action = runtime.sCurSceneActions[runtime.gQuestLogCurActionIdx];
            switch (action.type) {
              case QL_ACTION_MOVEMENT:
                runtime.sMovementScripts[action.data.a.localId][0] = action.data.a.movementActionId;
                break;
              case QL_ACTION_GFX_CHANGE:
                runtime.sMovementScripts[action.data.b.localId][1] = action.data.b.gfxState;
                break;
              case QL_ACTION_INPUT:
                runtime.gQuestLogFieldInput.raw = [
                  action.data.fieldInput[0],
                  action.data.fieldInput[1],
                  action.data.fieldInput[2],
                  action.data.fieldInput[3]
                ];
                break;
              case QL_ACTION_EMPTY:
                runtime.gQuestLogPlaybackState = QL_PLAYBACK_STATE_ACTION_END;
                break;
              case QL_ACTION_WAIT:
                break;
              case QL_ACTION_SCENE_END:
                runtime.gQuestLogPlaybackState = QL_PLAYBACK_STATE_STOPPED;
                break;
            }

            if (runtime.gQuestLogPlaybackState === QL_PLAYBACK_STATE_STOPPED)
              break;
            runtime.gQuestLogCurActionIdx += 1;
            if (runtime.gQuestLogCurActionIdx >= runtime.sMaxActionsInScene) {
              runtime.gQuestLogPlaybackState = QL_PLAYBACK_STATE_STOPPED;
              break;
            }
            runtime.sNextActionDelay = runtime.sCurSceneActions[runtime.gQuestLogCurActionIdx].duration;
          } while (
            runtime.gQuestLogPlaybackState !== QL_PLAYBACK_STATE_ACTION_END
            && (runtime.sNextActionDelay === 0 || runtime.sNextActionDelay === 0xffff)
          );
        }
      } else if (runtime.gQuestLogCurActionIdx >= runtime.sMaxActionsInScene) {
        runtime.gQuestLogPlaybackState = QL_PLAYBACK_STATE_STOPPED;
      }
      break;
    case QL_PLAYBACK_STATE_RECORDING:
      if (runtime.fieldControlsLocked !== true) {
        runtime.sNextActionDelay += 1;
        if (runtime.gQuestLogCurActionIdx >= runtime.sMaxActionsInScene)
          runtime.gQuestLogPlaybackState = QL_PLAYBACK_STATE_STOPPED;
      }
      break;
  }
};

export const QL_AfterRecordFishActionSuccessful = (runtime: QuestLogRuntime): void => {
  runtime.sNextActionDelay += 1;
};

export const GetQuestLogTextDisplayDuration = (text: readonly number[]): number => {
  let count = 0;
  for (let i = 0; i < 0x400 && text[i] !== EOS; i += 1) {
    if (text[i] !== CHAR_NEWLINE)
      count += 1;
  }

  if (count < 20)
    return 0x5f;
  if (count < 36)
    return 0x7f;
  if (count < 46)
    return 0xbf;
  return 0xff;
};

export const QL_IsTrainerSightDisabled = (runtime: QuestLogRuntime): boolean => {
  if (runtime.gQuestLogState !== QL_STATE_PLAYBACK)
    return false;
  if (
    runtime.gQuestLogPlaybackState === QL_PLAYBACK_STATE_STOPPED
    || runtime.sPlaybackControl.state === 1
    || runtime.sPlaybackControl.state === 2
  )
    return true;
  return false;
};

export const DoSceneEndTransition = (runtime: QuestLogRuntime, delay: number): void => {
  FadeScreen(runtime, FADE_TO_BLACK, delay);
  runtime.sceneEndTransitionDelay = delay;
  runtime.sQuestLogCB = 'QuestLog_AdvancePlayhead';
};

export const DoSkipToEndTransition = (runtime: QuestLogRuntime, delay: number): void => {
  FadeScreen(runtime, FADE_TO_BLACK, delay);
  runtime.skipToEndTransitionDelay = delay;
  runtime.sQuestLogCB = 'QuestLog_WaitFadeAndCancelPlayback';
};

export const QL_HandleInput = (runtime: QuestLogRuntime, newKeys: number): void => {
  if (runtime.sPlaybackControl.endMode !== END_MODE_NONE)
    return;

  if ((newKeys & A_BUTTON) !== 0) {
    runtime.sPlaybackControl.endMode = END_MODE_SCENE;
    runtime.gQuestLogPlaybackState = QL_PLAYBACK_STATE_STOPPED;
    DoSceneEndTransition(runtime, -3);
  } else if ((newKeys & B_BUTTON) !== 0) {
    runtime.sPlaybackControl.endMode = END_MODE_FINISH;
    runtime.gQuestLogPlaybackState = QL_PLAYBACK_STATE_STOPPED;
    DoSkipToEndTransition(runtime, -3);
  }
};

export const QuestLogScenePlaybackIsEnding = (runtime: QuestLogRuntime): boolean => {
  if (runtime.sPlaybackControl.endMode !== END_MODE_NONE)
    return true;
  return false;
};

const cloneQuestLogScene = (scene: QuestLogScene): QuestLogScene => ({
  ...scene,
  objectEventTemplates: scene.objectEventTemplates.map(cloneObjectEventTemplate),
  flags: scene.flags.slice(),
  vars: scene.vars.slice(),
  script: scene.script.slice()
});

export const ClearSavedScene = (runtime: QuestLogRuntime, sceneNum: number): void => {
  runtime.questLogScenes[sceneNum] = createQuestLogScene();
  runtime.gQuestLogDefeatedWildMonRecord = null;
};

const recordQuestLogAction = (
  runtime: QuestLogRuntime,
  kind: string,
  size: number,
  actionIdx?: number,
  duration?: number
): number | null => {
  if (runtime.gQuestLogRecordingPointer === null)
    return null;
  if (!QL_IsRoomToSaveAction(runtime.gQuestLogRecordingPointer, size, 0, runtime.questLogScriptCapacity))
    return null;
  const offset = runtime.gQuestLogRecordingPointer;
  runtime.recordedQuestLogActions.push({ kind, offset, actionIdx, duration });
  return offset + size;
};

export const TryRecordActionSequence = (
  runtime: QuestLogRuntime,
  actions: QuestLogAction[] = runtime.sCurSceneActions
): boolean => {
  runtime.triedRecordActionSequences += 1;

  for (let i = runtime.sRecordSequenceStartIdx; i < runtime.gQuestLogCurActionIdx; i += 1) {
    if (runtime.gQuestLogRecordingPointer === null)
      return false;

    const action = actions[i] ?? createQuestLogAction();
    switch (action.type) {
      case QL_ACTION_MOVEMENT:
      case QL_ACTION_GFX_CHANGE:
        runtime.gQuestLogRecordingPointer = recordQuestLogAction(runtime, 'movementOrGfxChange', 8, i);
        break;
      default:
        runtime.gQuestLogRecordingPointer = recordQuestLogAction(runtime, 'input', 8, i);
        break;
    }

    if (runtime.gQuestLogRecordingPointer === null) {
      runtime.gQuestLogPlaybackState = QL_PLAYBACK_STATE_STOPPED;
      return false;
    }
  }

  if (runtime.gQuestLogPlaybackState === QL_PLAYBACK_STATE_STOPPED) {
    runtime.gQuestLogRecordingPointer = recordQuestLogAction(runtime, 'sceneEnd', 2);
    return false;
  }

  runtime.sRecordSequenceStartIdx = runtime.gQuestLogCurActionIdx;
  return true;
};

export const RecordSceneEnd = (runtime: QuestLogRuntime): void => {
  recordQuestLogAction(runtime, 'sceneEnd', 2);
  runtime.recordedSceneEnds += 1;
  runtime.sCurrentSceneNum += 1;
  if (runtime.sCurrentSceneNum >= QUEST_LOG_SCENE_COUNT)
    runtime.sCurrentSceneNum = 0;
};

export const QL_RecordWait = (runtime: QuestLogRuntime, duration: number): void => {
  runtime.gQuestLogRecordingPointer = recordQuestLogAction(runtime, 'wait', 4, undefined, duration);
  runtime.gQuestLogCurActionIdx += 1;
  runtime.recordedWaitDurations.push(duration);
};

export const QL_FinishRecordingScene = (runtime: QuestLogRuntime): void => {
  if (runtime.gQuestLogState === QL_STATE_RECORDING) {
    TryRecordActionSequence(runtime);
    RecordSceneEnd(runtime);
    runtime.gQuestLogState = 0;
    runtime.sQuestLogCB = null;
    runtime.gQuestLogDefeatedWildMonRecord = null;
    runtime.gQuestLogRecordingPointer = null;
    runtime.gQuestLogPlaybackState = QL_PLAYBACK_STATE_STOPPED;
  }
};

export const QuestLog_CutRecording = (runtime: QuestLogRuntime): void => {
  if (runtime.gQuestLogPlaybackState !== QL_PLAYBACK_STATE_STOPPED && runtime.gQuestLogState === QL_STATE_RECORDING) {
    TryRecordActionSequence(runtime);
    QL_RecordWait(runtime, 1);
    RecordSceneEnd(runtime);
    runtime.gQuestLogPlaybackState = QL_PLAYBACK_STATE_STOPPED;
    runtime.gQuestLogState = 0;
    runtime.sQuestLogCB = null;
  }
  runtime.gQuestLogDefeatedWildMonRecord = null;
  runtime.gQuestLogRecordingPointer = null;
};

export const SortQuestLogInSav1 = (runtime: QuestLogRuntime): void => {
  const buffer = Array.from({ length: QUEST_LOG_SCENE_COUNT }, () => createQuestLogScene());
  let sceneNum = runtime.sCurrentSceneNum;
  let count = 0;

  for (let i = 0; i < QUEST_LOG_SCENE_COUNT; i += 1) {
    if (sceneNum >= QUEST_LOG_SCENE_COUNT)
      sceneNum = 0;
    if (runtime.questLogScenes[sceneNum].startType !== 0) {
      buffer[count] = cloneQuestLogScene(runtime.questLogScenes[sceneNum]);
      count += 1;
    }
    sceneNum += 1;
  }
  runtime.sCurrentSceneNum = count % QUEST_LOG_SCENE_COUNT;
  runtime.questLogScenes = buffer;
};

export const SaveQuestLogData = (runtime: QuestLogRuntime, linkActive: boolean): void => {
  if (linkActive !== true) {
    QuestLog_CutRecording(runtime);
    SortQuestLogInSav1(runtime);
  }
};

export const ObjectEventSetHeldMovement = (objectEvent: QuestLogObjectEvent, movementActionId: number): void => {
  objectEvent.heldMovement = movementActionId;
};

export const QuestLogUpdatePlayerSprite = (runtime: QuestLogRuntime, gfxState: number): void => {
  runtime.playerSpriteUpdates.push(gfxState);
};

export const QL_UpdateObjectEventCurrentMovement = (objectEvent: QuestLogObjectEvent, _sprite: QuestLogSprite): void => {
  objectEvent.currentMovementUpdates += 1;
};

export const QL_UpdateObject = (runtime: QuestLogRuntime, sprite: QuestLogSprite): void => {
  const objectEvent = runtime.objectEvents[sprite.data[0]];
  if (objectEvent.localId === LOCALID_PLAYER) {
    if (runtime.sMovementScripts[0][0] !== MOVEMENT_ACTION_NONE) {
      ObjectEventSetHeldMovement(objectEvent, runtime.sMovementScripts[0][0]);
      runtime.sMovementScripts[0][0] = MOVEMENT_ACTION_NONE;
    }
    if (runtime.sMovementScripts[0][1] !== QL_PLAYER_GFX_NONE) {
      QuestLogUpdatePlayerSprite(runtime, runtime.sMovementScripts[0][1]);
      runtime.sMovementScripts[0][1] = QL_PLAYER_GFX_NONE;
    }
    QL_UpdateObjectEventCurrentMovement(objectEvent, sprite);
  } else {
    if (runtime.sMovementScripts[objectEvent.localId][0] !== MOVEMENT_ACTION_NONE) {
      ObjectEventSetHeldMovement(objectEvent, runtime.sMovementScripts[objectEvent.localId][0]);
      runtime.sMovementScripts[objectEvent.localId][0] = MOVEMENT_ACTION_NONE;
    }
    QL_UpdateObjectEventCurrentMovement(objectEvent, sprite);
  }
};

export const QuestLogGetFlagOrVarPtr = (
  runtime: QuestLogRuntime,
  isFlag: boolean,
  idx: number
): { record: FlagOrVarRecord; value: number } | null => {
  if (runtime.gQuestLogCurActionIdx === 0) {
    return null;
  }
  if (runtime.gQuestLogCurActionIdx >= runtime.sMaxActionsInScene) {
    return null;
  }
  if (runtime.sFlagOrVarPlayhead >= runtime.sNumFlagsOrVars) {
    return null;
  }
  if (
    runtime.sFlagOrVarRecords[runtime.sFlagOrVarPlayhead].idx === idx &&
    runtime.sFlagOrVarRecords[runtime.sFlagOrVarPlayhead].isFlag === isFlag
  ) {
    const record = runtime.sFlagOrVarRecords[runtime.sFlagOrVarPlayhead];
    runtime.sFlagOrVarPlayhead += 1;
    return { record, value: record.value };
  }
  return null;
};

export const QuestLogSetFlagOrVar = (
  runtime: QuestLogRuntime,
  isFlag: boolean,
  idx: number,
  value: number
): void => {
  if (runtime.gQuestLogCurActionIdx === 0) {
    return;
  }
  if (runtime.gQuestLogCurActionIdx >= runtime.sMaxActionsInScene) {
    return;
  }
  if (runtime.sFlagOrVarPlayhead >= runtime.sNumFlagsOrVars) {
    return;
  }
  runtime.sFlagOrVarRecords[runtime.sFlagOrVarPlayhead].idx = idx;
  runtime.sFlagOrVarRecords[runtime.sFlagOrVarPlayhead].isFlag = isFlag;
  runtime.sFlagOrVarRecords[runtime.sFlagOrVarPlayhead].value = value;
  runtime.sFlagOrVarPlayhead += 1;
};

export const QuestLogResetFlagsOrVars = (
  runtime: QuestLogRuntime,
  state: number,
  records: FlagOrVarRecord[],
  size: number
): void => {
  if (state === 0 || state > QL_STATE_PLAYBACK) {
    runtime.gQuestLogPlaybackState = QL_PLAYBACK_STATE_STOPPED;
  } else {
    runtime.sFlagOrVarRecords = records;
    runtime.sNumFlagsOrVars = Math.trunc(size / 4);
    runtime.sFlagOrVarPlayhead = 0;
    if (state === QL_STATE_PLAYBACK) {
      for (let i = 0; i < runtime.sMaxActionsInScene; i += 1) {
        runtime.sFlagOrVarRecords[i] = { idx: 0, isFlag: false, value: 0x7fff };
      }
    }
  }
};
