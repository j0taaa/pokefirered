import { describe, expect, it } from 'vitest';
import {
  A_BUTTON,
  B_BUTTON,
  BackUpMapLayout,
  BackUpTrainerRematches,
  CHAR_NEWLINE,
  ClearSavedScene,
  CommitQuestLogWindow1,
  COPYWIN_FULL,
  COPYWIN_GFX,
  COPYWIN_MAP,
  DIR_EAST,
  DIR_NONE,
  DIR_NORTH,
  DIR_SOUTH,
  DIR_WEST,
  END_MODE_FINISH,
  END_MODE_NONE,
  END_MODE_SCENE,
  EOS,
  FADE_TO_BLACK,
  GetQuestLogTextDisplayDuration,
  GetQuestLogStartType,
  GetQuestLogState,
  IN_BOX_COUNT,
  IsLinkQuestLogEvent,
  LOCALID_PLAYER,
  MAP_GROUP_ROUTE1,
  MAP_NUM_ROUTE1,
  MOVEMENT_ACTION_FACE_DOWN,
  MOVEMENT_ACTION_FACE_LEFT,
  MOVEMENT_ACTION_FACE_RIGHT,
  MOVEMENT_ACTION_FACE_UP,
  MOVEMENT_ACTION_NONE,
  PALETTES_ALL,
  QL_ACTION_EMPTY,
  QL_ACTION_GFX_CHANGE,
  QL_ACTION_INPUT,
  QL_ACTION_MOVEMENT,
  QL_ACTION_SCENE_END,
  QL_ACTION_WAIT,
  QL_AfterRecordFishActionSuccessful,
  QL_AddASLROffset,
  QL_ESCALATOR_IN,
  QL_ESCALATOR_OUT,
  QL_EVENT_DEPARTED,
  QL_EVENT_LINK_BATTLED_UNION,
  QL_EVENT_LINK_TRADED,
  QL_GetPlaybackState,
  QL_HandleInput,
  QL_IsRoomToSaveAction,
  QL_IsRoomToSaveEvent,
  QL_IsTrainerSightDisabled,
  QL_LoadObjectsAndTemplates,
  QL_PLAYBACK_STATE_ACTION_END,
  QL_PLAYBACK_STATE_RECORDING_NO_DELAY,
  QL_PLAYBACK_STATE_RECORDING,
  QL_PLAYBACK_STATE_RUNNING,
  QL_PLAYBACK_STATE_STOPPED,
  QL_PLAYER_GFX_NONE,
  QL_RecordFieldInput,
  QL_STATE_PLAYBACK_LAST,
  QL_STATE_PLAYBACK,
  QL_STATE_RECORDING,
  QL_START_NORMAL,
  QL_START_WARP,
  QL_InitSceneObjectsAndActions,
  QL_CopySaveState,
  QL_AvoidDisplay,
  QL_RestoreMapLayoutId,
  QL_ResetPartyAndPC,
  QL_SlightlyDarkenSomePals,
  QL_StartRecordingAction,
  QL_TryRunActions,
  QL_UpdateObject,
  QLPlayback_InitOverworldState,
  FieldCB2_QuestLogStartPlaybackStandingInPlace,
  FieldCB2_QuestLogStartPlaybackWithWarpExit,
  FieldCB2_FinalScene,
  QLogCB_Playback,
  QLogCB_Recording,
  QL_ResetDefeatedWildMonRecord,
  QuestLog_AdvancePlayhead,
  QuestLog_AdvancePlayhead_,
  QuestLogScenePlaybackIsEnding,
  Task_EndQuestLog,
  Task_AvoidDisplay,
  Task_FinalScene_WaitFade,
  Task_QuestLogScene_SavedGame,
  Task_WaitAtEndOfQuestLog,
  QuestLog_GetBoxMonCount,
  QuestLog_GetPartyCount,
  ResetQuestLog,
  RunQuestLogCB,
  SetGameStateAtScene,
  SetNPCInitialCoordsAtScene,
  SetPlayerInitialCoordsAtScene,
  SetPokemonCounts,
  SetQuestLogState,
  QuestLogRecordNPCStep,
  QuestLogRecordNPCStepWithDuration,
  QuestLogRecordPlayerAvatarGfxTransition,
  QuestLogRecordPlayerAvatarGfxTransitionWithDuration,
  QuestLogRecordPlayerStep,
  QuestLogRecordPlayerStepWithDuration,
  QuestLog_PlayCurrentEvent,
  QuestLog_OnEscalatorWarp,
  QuestLog_CloseTextWindow,
  QuestLog_CutRecording,
  QuestLog_DrawPreviouslyOnQuestHeaderIfInPlaybackMode,
  QuestLog_BackUpPalette,
  QuestLog_InitPalettesBackup,
  QuestLogGetFlagOrVarPtr,
  QuestLog_WaitFadeAndCancelPlayback,
  QuestLogResetFlagsOrVars,
  QuestLogSetFlagOrVar,
  RecordHeadAtEndOfEntry,
  QL_FinishRecordingScene,
  QL_RecordWait,
  RecordHeadAtEndOfEntryOrScriptContext2Enabled,
  RecordSceneEnd,
  ResetActions,
  SaveQuestLogData,
  SortQuestLogInSav1,
  TogglePlaybackStateForOverworldLock,
  TryRecordActionSequence,
  TryStartQuestLogPlayback,
  NUM_PC_COUNT_BITS,
  OBJECT_EVENT_TEMPLATES_COUNT,
  PARTY_SIZE,
  TOTAL_BOXES_COUNT,
  VAR_QLBAK_MAP_LAYOUT,
  VAR_QLBAK_TRAINER_REMATCHES,
  VAR_QUEST_LOG_MON_COUNTS,
  WARP_ID_NONE,
  PLTT_U16_COUNT,
  WIN_BOTTOM_BAR,
  WIN_DESCRIPTION,
  WIN_TOP_BAR,
  DrawPreviouslyOnQuestHeader,
  DrawSceneDescription,
  SAVE_NORMAL,
  createQuestLogAction,
  createQuestLogObjectEventTemplate,
  createQuestLogScene,
  createSaveObjectEventTemplate,
  createQuestLogRuntime
} from '../src/game/decompQuestLog';
import {
  QL_EVENT_DEPARTED as QL_SCRIPT_EVENT_DEPARTED,
  QL_EVENT_INPUT as QL_SCRIPT_EVENT_INPUT,
  QL_EVENT_MOVEMENT as QL_SCRIPT_EVENT_MOVEMENT,
  QL_EVENT_SCENE_END as QL_SCRIPT_EVENT_SCENE_END,
  QL_EVENT_WAIT as QL_SCRIPT_EVENT_WAIT,
  writeU16
} from '../src/game/decompQuestLogEvents';

describe('decompQuestLog', () => {
  it('room-to-save helpers reject cursors before start and after end-size inclusively', () => {
    expect(QL_IsRoomToSaveEvent(100, 8, 100, 132)).toBe(true);
    expect(QL_IsRoomToSaveEvent(124, 8, 100, 132)).toBe(true);
    expect(QL_IsRoomToSaveEvent(125, 8, 100, 132)).toBe(false);
    expect(QL_IsRoomToSaveEvent(99, 8, 100, 132)).toBe(false);
    expect(QL_IsRoomToSaveAction(124, 8, 100, 132)).toBe(true);
  });

  it('top-level reset, ASLR, callback, and state helpers mirror quest_log.c globals', () => {
    const runtime = createQuestLogRuntime({
      saveBlockAddress: 1200,
      gQuestLogState: 0,
      gQuestLogRecordingPointer: 10,
      gQuestLogDefeatedWildMonRecord: 20,
      sEventData: [30, null, 40, ...Array.from({ length: 29 }, () => null)],
      questLogScenes: [
        createQuestLogScene({ startType: 1, script: [1] }),
        createQuestLogScene({ startType: 2, script: [2] }),
        createQuestLogScene({ startType: 1, script: [3] }),
        createQuestLogScene({ startType: 2, script: [4] })
      ],
      sCurrentSceneNum: 1,
      sQuestLogCB: () => {
        runtime.specialVarResult = 77;
      }
    });

    QL_AddASLROffset(runtime, 1000);
    expect(runtime.gQuestLogDefeatedWildMonRecord).toBe(220);
    expect(runtime.gQuestLogRecordingPointer).toBe(10);
    expect(runtime.sEventData.slice(0, 3)).toEqual([30, null, 40]);

    runtime.gQuestLogState = QL_STATE_PLAYBACK;
    QL_AddASLROffset(runtime, 1100);
    expect(runtime.gQuestLogDefeatedWildMonRecord).toBe(320);
    expect(runtime.gQuestLogRecordingPointer).toBe(110);
    expect(runtime.sEventData.slice(0, 3)).toEqual([130, null, 140]);

    RunQuestLogCB(runtime);
    expect(runtime.specialVarResult).toBe(77);
    QL_ResetDefeatedWildMonRecord(runtime);
    expect(runtime.gQuestLogDefeatedWildMonRecord).toBeNull();

    ResetQuestLog(runtime);
    expect(runtime.questLogScenes.map((scene) => scene.startType)).toEqual([0, 0, 0, 0]);
    expect(runtime.sCurrentSceneNum).toBe(0);
    expect(runtime.gQuestLogState).toBe(0);
    expect(runtime.sQuestLogCB).toBeNull();
    expect(runtime.gQuestLogRecordingPointer).toBeNull();
    expect(runtime.qlResetEventStatesCount).toBe(1);
    expect(runtime.resetDeferredLinkEventCount).toBe(1);

    SetQuestLogState(runtime, QL_STATE_RECORDING);
    expect(runtime.gQuestLogState).toBe(QL_STATE_RECORDING);
    expect(runtime.sQuestLogCB).toBe('QLogCB_Recording');
    SetQuestLogState(runtime, QL_STATE_PLAYBACK);
    expect(runtime.sQuestLogCB).toBe('QLogCB_Playback');
    GetQuestLogState(runtime);
    expect(runtime.specialVarResult).toBe(QL_STATE_PLAYBACK);
    runtime.questLogScenes[0].startType = QL_START_WARP;
    expect(GetQuestLogStartType(runtime)).toBe(QL_START_WARP);
  });

  it('recording and playback callbacks preserve quest_log.c branch order', () => {
    const recordingRuntime = createQuestLogRuntime({
      gQuestLogState: QL_STATE_RECORDING,
      gQuestLogPlaybackState: QL_PLAYBACK_STATE_RUNNING,
      sQuestLogCB: 'QLogCB_Recording',
      sCurrentSceneNum: 3
    });

    QLogCB_Recording(recordingRuntime);
    expect(recordingRuntime.triedRecordActionSequences).toBe(1);
    expect(recordingRuntime.gQuestLogState).toBe(QL_STATE_RECORDING);
    recordingRuntime.gQuestLogRecordingPointer = null;
    recordingRuntime.gQuestLogCurActionIdx = 1;
    QLogCB_Recording(recordingRuntime);
    expect(recordingRuntime.gQuestLogPlaybackState).toBe(QL_PLAYBACK_STATE_STOPPED);
    expect(recordingRuntime.recordedSceneEnds).toBe(1);
    expect(recordingRuntime.sCurrentSceneNum).toBe(0);
    expect(recordingRuntime.gQuestLogState).toBe(0);
    expect(recordingRuntime.sQuestLogCB).toBeNull();

    const playbackRuntime = createQuestLogRuntime({
      gQuestLogPlaybackState: QL_PLAYBACK_STATE_STOPPED,
      sPlaybackControl: { state: 2, playingEvent: false, endMode: END_MODE_NONE, cursor: 0, timer: 0, overlapTimer: 0 },
      sEventData: [null, ...Array.from({ length: 31 }, () => null)]
    });
    QLogCB_Playback(playbackRuntime);
    expect(playbackRuntime.sPlaybackControl.state).toBe(0);
    expect(playbackRuntime.sPlaybackControl.endMode).toBe(END_MODE_SCENE);
    expect(playbackRuntime.fieldControlsLocked).toBe(true);
    expect(playbackRuntime.sceneEndTransitionDelay).toBe(0);
    expect(playbackRuntime.questLogPlayCurrentEventCalls).toBe(0);

    const activeRuntime = createQuestLogRuntime({
      gQuestLogPlaybackState: QL_PLAYBACK_STATE_STOPPED,
      sPlaybackControl: { state: 0, playingEvent: false, endMode: END_MODE_NONE, cursor: 1, timer: 0, overlapTimer: 0 },
      sEventData: [null, 44, ...Array.from({ length: 30 }, () => null)]
    });
    QLogCB_Playback(activeRuntime);
    expect(activeRuntime.questLogPlayCurrentEventCalls).toBe(1);
    expect(activeRuntime.sPlaybackControl.endMode).toBe(END_MODE_NONE);

    activeRuntime.sPlaybackControl.endMode = END_MODE_FINISH;
    QLogCB_Playback(activeRuntime);
    expect(activeRuntime.questLogPlayCurrentEventCalls).toBe(1);
  });

  it('RunQuestLogCB dispatches stored quest-log callback symbols like C function pointers', () => {
    const recordingRuntime = createQuestLogRuntime({
      sQuestLogCB: 'QLogCB_Recording',
      gQuestLogState: QL_STATE_RECORDING,
      gQuestLogPlaybackState: QL_PLAYBACK_STATE_RUNNING,
      gQuestLogRecordingPointer: 0,
      sCurSceneActions: [createQuestLogAction({ type: QL_ACTION_MOVEMENT })],
      gQuestLogCurActionIdx: 1
    });
    RunQuestLogCB(recordingRuntime);
    expect(recordingRuntime.triedRecordActionSequences).toBe(1);
    expect(recordingRuntime.recordedQuestLogActions).toEqual([
      { kind: 'movementOrGfxChange', offset: 0, actionIdx: 0, duration: undefined }
    ]);

    const playbackRuntime = createQuestLogRuntime({
      sQuestLogCB: 'QLogCB_Playback',
      gQuestLogPlaybackState: QL_PLAYBACK_STATE_STOPPED,
      sPlaybackControl: { state: 0, playingEvent: false, endMode: END_MODE_NONE, cursor: 0, timer: 0, overlapTimer: 0 },
      sEventData: [9, ...Array.from({ length: 31 }, () => null)]
    });
    RunQuestLogCB(playbackRuntime);
    expect(playbackRuntime.questLogPlayCurrentEventCalls).toBe(1);

    const advanceRuntime = createQuestLogRuntime({
      sQuestLogCB: 'QuestLog_AdvancePlayhead',
      sCurrentSceneNum: 0,
      questLogScenes: [
        createQuestLogScene({ startType: QL_START_NORMAL }),
        createQuestLogScene(),
        createQuestLogScene(),
        createQuestLogScene()
      ]
    });
    RunQuestLogCB(advanceRuntime);
    expect(advanceRuntime.gQuestLogState).toBe(QL_STATE_PLAYBACK_LAST);

    const cancelRuntime = createQuestLogRuntime({
      sQuestLogCB: 'QuestLog_WaitFadeAndCancelPlayback',
      sCurrentSceneNum: 0,
      questLogScenes: [
        createQuestLogScene(),
        createQuestLogScene(),
        createQuestLogScene(),
        createQuestLogScene()
      ]
    });
    RunQuestLogCB(cancelRuntime);
    expect(cancelRuntime.gQuestLogState).toBe(QL_STATE_PLAYBACK_LAST);
  });

  it('QL_StartRecordingAction chooses start type and setup calls exactly like C', () => {
    expect(IsLinkQuestLogEvent(QL_EVENT_LINK_TRADED)).toBe(true);
    expect(IsLinkQuestLogEvent(QL_EVENT_LINK_BATTLED_UNION)).toBe(true);
    expect(IsLinkQuestLogEvent(QL_EVENT_DEPARTED)).toBe(false);

    const actions = Array.from({ length: 4 }, () => createQuestLogAction());
    const runtime = createQuestLogRuntime({
      sCurrentSceneNum: 5,
      sCurSceneActions: actions,
      gQuestLogDefeatedWildMonRecord: 99,
      playerFacingDirection: DIR_WEST
    });

    QL_StartRecordingAction(runtime, 4, actions);
    expect(runtime.sCurrentSceneNum).toBe(0);
    expect(runtime.questLogScenes[0].startType).toBe(QL_START_NORMAL);
    expect(runtime.gQuestLogRecordingPointer).toBe(16);
    expect(runtime.recordedQuestLogActions).toEqual([
      { kind: 'movementOrGfxChange', offset: 0, actionIdx: 0, duration: undefined },
      { kind: 'input', offset: 8, actionIdx: 1, duration: undefined }
    ]);
    expect(runtime.gQuestLogDefeatedWildMonRecord).toBeNull();
    expect(runtime.qlResetRepeatEventTrackerCount).toBe(1);
    expect(runtime.pokemonCountsSet).toBe(1);
    expect(runtime.playerInitialCoordsScenes).toEqual([0]);
    expect(runtime.npcInitialCoordsScenes).toEqual([0]);
    expect(runtime.backedUpTrainerRematches).toBe(1);
    expect(runtime.backedUpMapLayout).toBe(1);
    expect(runtime.gameStateScenes).toEqual([0]);
    expect(runtime.sRecordSequenceStartIdx).toBe(2);
    expect(runtime.gQuestLogCurActionIdx).toBe(2);
    expect(actions[0]).toMatchObject({
      duration: 0,
      type: QL_ACTION_MOVEMENT,
      data: { a: { localId: 0, movementActionId: MOVEMENT_ACTION_FACE_LEFT } }
    });
    expect(runtime.triedRecordActionSequences).toBe(1);
    expect(runtime.gQuestLogState).toBe(QL_STATE_RECORDING);
    expect(runtime.sQuestLogCB).toBe('QLogCB_Recording');

    const linkRuntime = createQuestLogRuntime({ sCurSceneActions: Array.from({ length: 3 }, () => createQuestLogAction()) });
    QL_StartRecordingAction(linkRuntime, QL_EVENT_LINK_TRADED, linkRuntime.sCurSceneActions);
    expect(linkRuntime.questLogScenes[0].startType).toBe(QL_START_WARP);

    const departedRuntime = createQuestLogRuntime({ sCurSceneActions: Array.from({ length: 3 }, () => createQuestLogAction()) });
    QL_StartRecordingAction(departedRuntime, QL_EVENT_DEPARTED, departedRuntime.sCurSceneActions);
    expect(departedRuntime.questLogScenes[0].startType).toBe(QL_START_WARP);
  });

  it('scene snapshot helpers copy player, NPC templates, flags, vars, and inverse object template loading exactly', () => {
    const runtime = createQuestLogRuntime({
      location: { mapGroup: 1, mapNum: 2, warpId: 3 },
      pos: { x: 40, y: -9 },
      flags: [1, 2, 3],
      vars: [4, 5],
      objectEventTemplates: [
        createSaveObjectEventTemplate({ x: -12, y: 34, elevation: 5, movementType: 6 }),
        createSaveObjectEventTemplate({ x: 250, y: -7, elevation: 8, movementType: 9 }),
        ...Array.from({ length: OBJECT_EVENT_TEMPLATES_COUNT - 2 }, () => createSaveObjectEventTemplate())
      ]
    });

    SetPlayerInitialCoordsAtScene(runtime, 0);
    expect(runtime.questLogScenes[0]).toMatchObject({ mapGroup: 1, mapNum: 2, warpId: 3, x: 40, y: -9 });
    expect(runtime.playerInitialCoordsScenes).toEqual([0]);

    SetNPCInitialCoordsAtScene(runtime, 0);
    expect(runtime.qlRecordObjectsScenes).toEqual([0]);
    expect(runtime.npcInitialCoordsScenes).toEqual([0]);
    expect(runtime.questLogScenes[0].objectEventTemplates[0]).toEqual({
      x: 12,
      negx: true,
      y: 34,
      negy: false,
      elevation: 5,
      movementType: 6
    });
    expect(runtime.questLogScenes[0].objectEventTemplates[1]).toEqual({
      x: 250,
      negx: false,
      y: 7,
      negy: true,
      elevation: 8,
      movementType: 9
    });

    SetGameStateAtScene(runtime, 0);
    expect(runtime.questLogScenes[0].flags).toEqual([1, 2, 3]);
    expect(runtime.questLogScenes[0].vars).toEqual([4, 5]);
    runtime.flags[0] = 99;
    runtime.vars[0] = 88;
    expect(runtime.questLogScenes[0].flags).toEqual([1, 2, 3]);
    expect(runtime.questLogScenes[0].vars).toEqual([4, 5]);

    runtime.questLogScenes[1].objectEventTemplates[0] = createQuestLogObjectEventTemplate({ x: 11, negx: true, y: 22, negy: true, elevation: 3, movementType: 4 });
    runtime.questLogScenes[1].objectEventTemplates[1] = createQuestLogObjectEventTemplate({ x: 33, negx: false, y: 44, negy: false, elevation: 5, movementType: 6 });
    QL_LoadObjectsAndTemplates(runtime, 1);
    expect(runtime.objectEventTemplates[0]).toEqual({ x: -11, y: -22, elevation: 3, movementType: 4 });
    expect(runtime.objectEventTemplates[1]).toEqual({ x: 33, y: 44, elevation: 5, movementType: 6 });
    expect(runtime.qlLoadObjectsScenes).toEqual([1]);
  });

  it('quest-log playback startup counts scenes, disables help, and branches like C', () => {
    const emptyRuntime = createQuestLogRuntime({ helpSystemEnabled: true });

    TryStartQuestLogPlayback(emptyRuntime, 7);

    expect(emptyRuntime.qlEnableRecordingStepsCount).toBe(1);
    expect(emptyRuntime.sNumScenes).toBe(0);
    expect(emptyRuntime.helpSystemEnabled).toBe(true);
    expect(emptyRuntime.mainCallback2).toBe('CB2_ContinueSavedGame');
    expect(emptyRuntime.destroyedTasks).toEqual([7]);

    const runtime = createQuestLogRuntime({
      questLogScenes: [
        createQuestLogScene({ startType: QL_START_NORMAL, mapGroup: 9, mapNum: 8, warpId: 7, x: 6, y: 5 }),
        createQuestLogScene(),
        createQuestLogScene({ startType: QL_START_WARP }),
        createQuestLogScene()
      ]
    });

    TryStartQuestLogPlayback(runtime, 8);

    expect(runtime.qlEnableRecordingStepsCount).toBe(1);
    expect(runtime.sNumScenes).toBe(2);
    expect(runtime.helpSystemEnabled).toBe(false);
    expect(runtime.destroyedTasks).toEqual([8]);
    expect(runtime.location).toEqual({ mapGroup: 9, mapNum: 8, warpId: 7 });
    expect(runtime.pos).toEqual({ x: 6, y: 5 });
    expect(runtime.sCurrentSceneNum).toBe(0);
    expect(runtime.gDisableMapMusicChangeOnMapLoad).toBe(1);
    expect(runtime.wildEncountersDisabled).toBe(true);
    expect(runtime.gQuestLogState).toBe(QL_STATE_PLAYBACK);
    expect(runtime.mainCallback2).toBe('CB2_SetUpOverworldForQLPlayback');
    expect(runtime.fieldCallback2).toBe('FieldCB2_QuestLogStartPlaybackStandingInPlace');

    const warpRuntime = createQuestLogRuntime({
      location: { mapGroup: 1, mapNum: 2, warpId: 3 },
      pos: { x: 4, y: 5 },
      questLogScenes: [
        createQuestLogScene({ startType: QL_START_WARP, mapGroup: 11, mapNum: 12, warpId: 13, x: 14, y: 15 }),
        createQuestLogScene(),
        createQuestLogScene(),
        createQuestLogScene()
      ]
    });

    TryStartQuestLogPlayback(warpRuntime, 9);

    expect(warpRuntime.sNumScenes).toBe(1);
    expect(warpRuntime.location).toEqual({ mapGroup: MAP_GROUP_ROUTE1, mapNum: MAP_NUM_ROUTE1, warpId: WARP_ID_NONE });
    expect(warpRuntime.pos).toEqual({ x: 4, y: 5 });
    expect(warpRuntime.warpDestination).toEqual({ mapGroup: 11, mapNum: 12, warpId: 13, x: 14, y: 15 });
    expect(warpRuntime.warpIntoMapCount).toBe(1);
    expect(warpRuntime.mainCallback2).toBe('CB2_SetUpOverworldForQLPlaybackWithWarpExit');
    expect(warpRuntime.fieldCallback2).toBe('FieldCB2_QuestLogStartPlaybackWithWarpExit');
  });

  it('QLPlayback_InitOverworldState preserves normal-position and warp-destination side effects', () => {
    const normalRuntime = createQuestLogRuntime({
      sCurrentSceneNum: 0,
      questLogScenes: [
        createQuestLogScene({ startType: QL_START_NORMAL, mapGroup: 9, mapNum: 8, warpId: 7, x: 6, y: 5 }),
        createQuestLogScene(),
        createQuestLogScene(),
        createQuestLogScene()
      ]
    });

    QLPlayback_InitOverworldState(normalRuntime);

    expect(normalRuntime.gQuestLogState).toBe(QL_STATE_PLAYBACK);
    expect(normalRuntime.resetSpecialVarsCount).toBe(1);
    expect(normalRuntime.clearedBagCount).toBe(1);
    expect(normalRuntime.clearedPCItemSlotsCount).toBe(1);
    expect(normalRuntime.location).toEqual({ mapGroup: 9, mapNum: 8, warpId: 7 });
    expect(normalRuntime.pos).toEqual({ x: 6, y: 5 });
    expect(normalRuntime.warpDestination).toBeNull();
    expect(normalRuntime.warpIntoMapCount).toBe(0);

    const warpRuntime = createQuestLogRuntime({
      location: { mapGroup: 1, mapNum: 2, warpId: 3 },
      pos: { x: 4, y: 5 },
      questLogScenes: [
        createQuestLogScene({ startType: QL_START_WARP, mapGroup: 10, mapNum: 11, warpId: 12, x: 13, y: 14 }),
        createQuestLogScene(),
        createQuestLogScene(),
        createQuestLogScene()
      ]
    });

    QLPlayback_InitOverworldState(warpRuntime);

    expect(warpRuntime.location).toEqual({ mapGroup: 1, mapNum: 2, warpId: 3 });
    expect(warpRuntime.pos).toEqual({ x: 4, y: 5 });
    expect(warpRuntime.warpDestination).toEqual({ mapGroup: 10, mapNum: 11, warpId: 12, x: 13, y: 14 });
    expect(warpRuntime.warpIntoMapCount).toBe(1);
  });

  it('quest-log playback field callbacks load palette, set playback state, and reset control struct', () => {
    const standingRuntime = createQuestLogRuntime({
      sPlaybackControl: { state: 9, playingEvent: true, endMode: END_MODE_FINISH, cursor: 8, timer: 7, overlapTimer: 6 }
    });

    expect(FieldCB2_QuestLogStartPlaybackStandingInPlace(standingRuntime)).toBe(true);
    expect(standingRuntime.loadedTextWindowPalettes).toEqual([4]);
    expect(standingRuntime.gQuestLogState).toBe(QL_STATE_PLAYBACK);
    expect(standingRuntime.sQuestLogCB).toBe('QLogCB_Playback');
    expect(standingRuntime.fieldWarpExitFadeFromBlackCount).toBe(1);
    expect(standingRuntime.sPlaybackControl).toEqual({
      state: 2,
      playingEvent: false,
      endMode: END_MODE_NONE,
      cursor: 0,
      timer: 0,
      overlapTimer: 0
    });

    const warpRuntime = createQuestLogRuntime();
    expect(FieldCB2_QuestLogStartPlaybackWithWarpExit(warpRuntime)).toBe(true);
    expect(warpRuntime.loadedTextWindowPalettes).toEqual([4]);
    expect(warpRuntime.fieldDefaultWarpExitCount).toBe(1);
    expect(warpRuntime.sPlaybackControl.state).toBe(2);
  });

  it('QL_InitSceneObjectsAndActions reads saved script, resets repeat tracker, actions, and objects', () => {
    const actions = Array.from({ length: 32 }, () => createQuestLogAction());
    const script: number[] = [];
    writeU16(script, 0, QL_SCRIPT_EVENT_DEPARTED);
    writeU16(script, 2, 0);
    script[5] = 6;
    writeU16(script, 6, QL_SCRIPT_EVENT_MOVEMENT);
    writeU16(script, 8, 7);
    script[10] = MOVEMENT_ACTION_FACE_LEFT;
    writeU16(script, 14, QL_SCRIPT_EVENT_INPUT);
    writeU16(script, 16, 8);
    script[18] = 1;
    script[19] = 2;
    script[20] = 3;
    script[21] = 4;
    writeU16(script, 22, QL_SCRIPT_EVENT_WAIT);
    writeU16(script, 24, 9);
    writeU16(script, 26, QL_SCRIPT_EVENT_SCENE_END);

    const runtime = createQuestLogRuntime({
      sCurrentSceneNum: 1,
      sCurSceneActions: actions,
      sMovementScripts: Array.from({ length: 3 }, () => [0, 0]),
      questLogScenes: [
        createQuestLogScene(),
        createQuestLogScene({
          script,
          objectEventTemplates: [
            createQuestLogObjectEventTemplate({ x: 11, negx: true, y: 12, negy: false, elevation: 13, movementType: 14 }),
            ...Array.from({ length: OBJECT_EVENT_TEMPLATES_COUNT - 1 }, () => createQuestLogObjectEventTemplate())
          ]
        }),
        createQuestLogScene(),
        createQuestLogScene()
      ]
    });

    QL_InitSceneObjectsAndActions(runtime, actions);

    expect(runtime.readQuestLogScriptScenes).toEqual([1]);
    expect(runtime.sEventData[0]).toBe(0);
    expect(runtime.sLastDepartedLocation).toBe(7);
    expect(runtime.qlResetRepeatEventTrackerCount).toBe(1);
    expect(runtime.gQuestLogPlaybackState).toBe(QL_PLAYBACK_STATE_RUNNING);
    expect(runtime.sNextActionDelay).toBe(7);
    expect(runtime.sMovementScripts[0]).toEqual([MOVEMENT_ACTION_FACE_LEFT, QL_PLAYER_GFX_NONE]);
    expect(actions[0]).toMatchObject({ type: QL_ACTION_MOVEMENT, duration: 7 });
    expect(actions[1]).toMatchObject({ type: QL_ACTION_INPUT, duration: 8, data: { raw: [1, 2, 3, 4] } });
    expect(actions[2]).toMatchObject({ type: QL_ACTION_WAIT, duration: 9 });
    expect(actions[3]).toMatchObject({ type: QL_ACTION_SCENE_END, duration: 0 });
    expect(runtime.objectEventTemplates[0]).toEqual({ x: -11, y: 12, elevation: 13, movementType: 14 });
    expect(runtime.qlLoadObjectsScenes).toEqual([1]);
  });

  it('ReadQuestLogScriptFromSav1 clears stale departed location when the first normal event is not departed', () => {
    const actions = Array.from({ length: 32 }, () => createQuestLogAction());
    const script: number[] = [];
    writeU16(script, 0, 3);
    writeU16(script, 2, 0);

    const runtime = createQuestLogRuntime({
      sLastDepartedLocation: 99,
      questLogScenes: [
        createQuestLogScene({ script }),
        createQuestLogScene(),
        createQuestLogScene(),
        createQuestLogScene()
      ]
    });

    QL_InitSceneObjectsAndActions(runtime, actions);

    expect(runtime.sEventData[0]).toBe(0);
    expect(runtime.sLastDepartedLocation).toBe(0);
  });

  it('quest-log header/window helpers preserve C window setup, commit, and playback-only draw gates', () => {
    const runtime = createQuestLogRuntime();

    DrawPreviouslyOnQuestHeader(runtime, 3);

    expect(runtime.sWindowIds).toEqual([0, 1, 2]);
    expect(runtime.addedWindowTemplates).toEqual([WIN_TOP_BAR, WIN_BOTTOM_BAR, WIN_DESCRIPTION]);
    expect(runtime.fillWindowPixelRects).toEqual([
      { windowId: 0, fillValue: 15, x: 0, y: 0, width: 240, height: 16 },
      { windowId: 1, fillValue: 15, x: 0, y: 0, width: 240, height: 16 },
      { windowId: 2, fillValue: 15, x: 0, y: 0, width: 240, height: 48 }
    ]);
    expect(runtime.questLogHeaderTexts).toEqual(['Previously on your quest 3']);
    expect(runtime.textPrinterCalls).toEqual([{ windowId: 0, x: 2, y: 2, text: 'Previously on your quest 3' }]);
    expect(runtime.putWindowTilemaps).toEqual([0, 1]);
    expect(runtime.copyWindowToVramCalls).toEqual([
      { windowId: 0, mode: COPYWIN_GFX },
      { windowId: 2, mode: COPYWIN_GFX },
      { windowId: 1, mode: COPYWIN_FULL }
    ]);

    CommitQuestLogWindow1(runtime);
    expect(runtime.putWindowTilemaps.at(-1)).toBe(1);
    expect(runtime.copyWindowToVramCalls.at(-1)).toEqual({ windowId: 1, mode: COPYWIN_MAP });

    const gatedRuntime = createQuestLogRuntime({ gQuestLogState: 0, sNumScenes: 2 });
    QuestLog_DrawPreviouslyOnQuestHeaderIfInPlaybackMode(gatedRuntime);
    expect(gatedRuntime.previouslyOnQuestHeaderScenes).toEqual([]);
    gatedRuntime.gQuestLogState = QL_STATE_PLAYBACK;
    QuestLog_DrawPreviouslyOnQuestHeaderIfInPlaybackMode(gatedRuntime);
    expect(gatedRuntime.previouslyOnQuestHeaderScenes).toEqual([2]);
  });

  it('description and close-window helpers keep newline counting and window call order from C', () => {
    const runtime = createQuestLogRuntime({
      sWindowIds: [10, 11, 12],
      questLogText: [65, CHAR_NEWLINE, 66, CHAR_NEWLINE, 67, EOS]
    });

    DrawSceneDescription(runtime);

    expect(runtime.questLogDescriptionDrawnCount).toBe(1);
    expect(runtime.questLogDescriptionLineCounts).toEqual([2]);
    expect(runtime.questLogDescriptionTextYs).toEqual([3]);
    expect(runtime.putWindowTilemaps).toEqual([12]);
    expect(runtime.descriptionWindowTileCopies).toEqual([12]);
    expect(runtime.textPrinterCalls).toEqual([{ windowId: 12, x: 2, y: 3, text: '65,254,66,254,67,255' }]);
    expect(runtime.bgCopyTilemapSchedules).toEqual([0]);

    QuestLog_CloseTextWindow(runtime);
    expect(runtime.questLogTextWindowClosedCount).toBe(1);
    expect(runtime.clearWindowTilemaps).toEqual([12]);
    expect(runtime.fillWindowPixelRects.at(-1)).toEqual({ windowId: 12, fillValue: 15, x: 0, y: 0, width: 0xf0, height: 0x30 });
    expect(runtime.copyWindowToVramCalls).toEqual([
      { windowId: 12, mode: COPYWIN_GFX },
      { windowId: 11, mode: COPYWIN_MAP }
    ]);
    expect(runtime.putWindowTilemaps.at(-1)).toBe(11);
  });

  it('QuestLog_AdvancePlayhead waits for fade, advances scenes, or starts the final scene exactly', () => {
    const fadingRuntime = createQuestLogRuntime({
      paletteFadeActive: true,
      sCurrentSceneNum: 0,
      sNumScenes: 2,
      fieldControlsLocked: false
    });

    QuestLog_AdvancePlayhead(fadingRuntime);
    expect(fadingRuntime.sCurrentSceneNum).toBe(0);
    expect(fadingRuntime.fieldControlsLocked).toBe(false);

    const nextRuntime = createQuestLogRuntime({
      sCurrentSceneNum: 0,
      sNumScenes: 2,
      questLogScenes: [
        createQuestLogScene({ startType: QL_START_NORMAL }),
        createQuestLogScene({ startType: QL_START_WARP, mapGroup: 5, mapNum: 6, warpId: 7, x: 8, y: 9 }),
        createQuestLogScene(),
        createQuestLogScene()
      ]
    });

    QuestLog_AdvancePlayhead(nextRuntime);
    expect(nextRuntime.fieldControlsLocked).toBe(true);
    expect(nextRuntime.sCurrentSceneNum).toBe(1);
    expect(nextRuntime.sNumScenes).toBe(1);
    expect(nextRuntime.gQuestLogState).toBe(QL_STATE_PLAYBACK);
    expect(nextRuntime.warpDestination).toEqual({ mapGroup: 5, mapNum: 6, warpId: 7, x: 8, y: 9 });
    expect(nextRuntime.mainCallback2).toBe('CB2_SetUpOverworldForQLPlaybackWithWarpExit');

    const finalRuntime = createQuestLogRuntime({
      sCurrentSceneNum: 0,
      sNumScenes: 1,
      gQuestLogPlaybackState: QL_PLAYBACK_STATE_RUNNING,
      questLogScenes: [
        createQuestLogScene({ startType: QL_START_NORMAL }),
        createQuestLogScene(),
        createQuestLogScene(),
        createQuestLogScene()
      ],
      sQuestLogCB: 'QuestLog_AdvancePlayhead'
    });

    QuestLog_AdvancePlayhead_(finalRuntime);
    expect(finalRuntime.gQuestLogPlaybackState).toBe(QL_PLAYBACK_STATE_STOPPED);
    expect(finalRuntime.resetSpecialVarsCount).toBe(1);
    expect(finalRuntime.saveResetSaveCountersCount).toBe(1);
    expect(finalRuntime.loadGameSaveCalls).toEqual([SAVE_NORMAL]);
    expect(finalRuntime.mainCallback2).toBe('CB2_EnterFieldFromQuestLog');
    expect(finalRuntime.fieldCallback2).toBe('FieldCB2_FinalScene');
    expect(finalRuntime.freeAllWindowBuffersCount).toBe(1);
    expect(finalRuntime.gQuestLogState).toBe(QL_STATE_PLAYBACK_LAST);
    expect(finalRuntime.sQuestLogCB).toBeNull();
  });

  it('FieldCB2_FinalScene and final-scene wait tasks mirror the C task transitions', () => {
    const runtime = createQuestLogRuntime({ fieldControlsLocked: false, gQuestLogState: QL_STATE_PLAYBACK_LAST });

    expect(FieldCB2_FinalScene(runtime)).toBe(true);
    expect(runtime.loadedTextWindowPalettes).toEqual([4]);
    expect(runtime.previouslyOnQuestHeaderScenes).toEqual([0]);
    expect(runtime.fieldWarpExitFadeFromBlackCount).toBe(1);
    expect(runtime.createdTasks).toEqual([{ id: 0, func: 'Task_FinalScene_WaitFade', priority: 0xff }]);

    Task_FinalScene_WaitFade(runtime, 0);
    expect(runtime.frozeObjectEventsCount).toBe(1);
    expect(runtime.enforcedLookDirectionCount).toBe(1);
    expect(runtime.stoppedPlayerAvatarCount).toBe(1);
    expect(runtime.fieldControlsLocked).toBe(true);
    expect(runtime.tasks[0].func).toBe('Task_QuestLogScene_SavedGame');

    runtime.paletteFadeActive = true;
    Task_QuestLogScene_SavedGame(runtime, 0);
    expect(runtime.tasks[0].func).toBe('Task_QuestLogScene_SavedGame');

    runtime.paletteFadeActive = false;
    Task_QuestLogScene_SavedGame(runtime, 0);
    expect(runtime.mapNameLookups).toEqual([0]);
    expect(runtime.questLogDescriptionDrawnCount).toBe(1);
    expect(runtime.tasks[0].data[0]).toBe(0);
    expect(runtime.tasks[0].data[1]).toBe(0);
    expect(runtime.tasks[0].func).toBe('Task_WaitAtEndOfQuestLog');
    expect(runtime.frozeObjectEventsCount).toBe(2);

    Task_WaitAtEndOfQuestLog(runtime, 0, 0);
    expect(runtime.tasks[0].data[0]).toBe(1);
    expect(runtime.gQuestLogState).not.toBe(0);
    Task_WaitAtEndOfQuestLog(runtime, 0, A_BUTTON);
    expect(runtime.questLogTextWindowClosedCount).toBe(1);
    expect(runtime.tasks[0].data[0]).toBe(0);
    expect(runtime.tasks[0].func).toBe('Task_EndQuestLog');
    expect(runtime.gQuestLogState).toBe(0);
  });

  it('Task_EndQuestLog preserves staged cleanup, wait frame, and finish-mode popup behavior', () => {
    const runtime = createQuestLogRuntime({
      tasks: { 4: { data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], func: 'Task_EndQuestLog', priority: 0xff, wordArgs: {} } },
      gDisableMapMusicChangeOnMapLoad: 1,
      fieldControlsLocked: true,
      helpSystemEnabled: false,
      wildEncountersDisabled: true,
      textAutoScroll: true,
      globalFieldTintMode: 9,
      sPlaybackControl: { state: 3, playingEvent: true, endMode: END_MODE_FINISH, cursor: 5, timer: 6, overlapTimer: 7 },
      sWindowIds: [10, 11, 12],
      sPalettesBackup: Array.from({ length: PLTT_U16_COUNT }, (_, i) => i),
      plttBufferUnfaded: Array.from({ length: PLTT_U16_COUNT }, () => 0xffff)
    });

    Task_EndQuestLog(runtime, 4);
    expect(runtime.gDisableMapMusicChangeOnMapLoad).toBe(0);
    expect(runtime.overworldSpecialMapMusicCount).toBe(1);
    expect(runtime.slightlyDarkenedPalsCount).toBe(1);
    expect(runtime.fillWindowPixelRects.at(-1)).toEqual({ windowId: 10, fillValue: 0x0f, x: 0, y: 0, width: 240, height: 16 });
    expect(runtime.tasks[4].data[0]).toBe(1);

    for (let i = 0; i < 17; i += 1)
      Task_EndQuestLog(runtime, 4);
    expect(runtime.clearedWindowIds).toEqual([0, 1, 2]);
    expect(runtime.removedWindowIds).toEqual([0, 1, 2]);
    expect(runtime.clearWindowTilemaps.slice(-3)).toEqual([10, 11, 12]);
    expect(runtime.copyWindowToVramCalls.slice(-3)).toEqual([
      { windowId: 10, mode: COPYWIN_MAP },
      { windowId: 11, mode: COPYWIN_MAP },
      { windowId: 12, mode: COPYWIN_MAP }
    ]);
    expect(runtime.removedWindows).toEqual([10, 11, 12]);
    expect(runtime.tasks[4].data[1]).toBe(0);
    expect(runtime.tasks[4].data[0]).toBe(2);
    expect(runtime.invertedTintCopies[0]).toEqual({ sourceOffset: 1, destOffset: 1, size: 0xdf, tint: 15 });
    expect(runtime.fillWindowPixelRects.some((rect) => rect.windowId === 10 && rect.y === 15 && rect.height === 1)).toBe(true);

    for (let i = 0; i < 33; i += 1)
      Task_EndQuestLog(runtime, 4);
    expect(runtime.tasks[4].data[0]).toBe(3);

    Task_EndQuestLog(runtime, 4);
    expect(runtime.mapNamePopupShown).toEqual([true]);
    expect(runtime.copiedPalettesBackupCount).toBe(1);
    expect(runtime.freedPalettesBackupCount).toBe(1);
    expect(runtime.sPlaybackControl).toEqual({ state: 0, playingEvent: false, endMode: END_MODE_NONE, cursor: 0, timer: 0, overlapTimer: 0 });
    expect(runtime.clearedPlayerHeldMovementCount).toBe(1);
    expect(runtime.fieldControlsLocked).toBe(false);
    expect(runtime.unlockedPlayerFieldControlsCount).toBe(1);
    expect(runtime.textAutoScroll).toBe(false);
    expect(runtime.globalFieldTintMode).toBe(0);
    expect(runtime.wildEncountersDisabled).toBe(false);
    expect(runtime.helpSystemEnabled).toBe(true);
    expect(runtime.destroyedTasks).toEqual([4]);
    expect(runtime.tasks[4]).toBeUndefined();
  });

  it('cancel playback and palette helpers preserve fade gates, scene script draining, and palette copies', () => {
    const fadingRuntime = createQuestLogRuntime({
      paletteFadeActive: true,
      fieldControlsLocked: false,
      sCurrentSceneNum: 1,
      gQuestLogPlaybackState: QL_PLAYBACK_STATE_RUNNING
    });

    QuestLog_WaitFadeAndCancelPlayback(fadingRuntime);
    expect(fadingRuntime.fieldControlsLocked).toBe(false);
    expect(fadingRuntime.sCurrentSceneNum).toBe(1);
    expect(fadingRuntime.gQuestLogPlaybackState).toBe(QL_PLAYBACK_STATE_RUNNING);

    const runtime = createQuestLogRuntime({
      sCurrentSceneNum: 1,
      sCurSceneActions: Array.from({ length: 32 }, () => createQuestLogAction()),
      gQuestLogPlaybackState: QL_PLAYBACK_STATE_RUNNING,
      questLogScenes: [
        createQuestLogScene({ startType: QL_START_NORMAL }),
        createQuestLogScene({ startType: QL_START_NORMAL, script: [QL_SCRIPT_EVENT_SCENE_END, 0] }),
        createQuestLogScene({ startType: QL_START_WARP, script: [QL_SCRIPT_EVENT_SCENE_END, 0] }),
        createQuestLogScene()
      ]
    });

    QuestLog_WaitFadeAndCancelPlayback(runtime);
    expect(runtime.fieldControlsLocked).toBe(true);
    expect(runtime.readQuestLogScriptScenes).toEqual([1, 2]);
    expect(runtime.sCurrentSceneNum).toBe(3);
    expect(runtime.gQuestLogPlaybackState).toBe(QL_PLAYBACK_STATE_STOPPED);
    expect(runtime.gQuestLogState).toBe(QL_STATE_PLAYBACK_LAST);
    expect(runtime.mainCallback2).toBe('CB2_EnterFieldFromQuestLog');

    const noAllocRuntime = createQuestLogRuntime({ gQuestLogState: QL_STATE_PLAYBACK });
    QuestLog_InitPalettesBackup(noAllocRuntime);
    expect(noAllocRuntime.sPalettesBackup).toBeNull();

    const paletteRuntime = createQuestLogRuntime({
      gQuestLogState: QL_STATE_PLAYBACK_LAST,
      plttBufferUnfaded: Array.from({ length: PLTT_U16_COUNT }, (_, i) => i)
    });
    QuestLog_InitPalettesBackup(paletteRuntime);
    expect(paletteRuntime.paletteBackupAllocs).toBe(1);
    expect(paletteRuntime.sPalettesBackup).toHaveLength(PLTT_U16_COUNT);
    expect(paletteRuntime.sPalettesBackup?.[2]).toBe(0);

    QuestLog_BackUpPalette(paletteRuntime, 2, 4);
    expect(paletteRuntime.backupPaletteCopies).toEqual([{ offset: 2, size: 4 }]);
    expect(paletteRuntime.sPalettesBackup?.slice(0, 7)).toEqual([0, 0, 2, 3, 4, 5, 0]);

    const originalBackup = paletteRuntime.sPalettesBackup!.slice();
    paletteRuntime.sPalettesBackup![0] = 0xffff;
    QL_SlightlyDarkenSomePals(paletteRuntime);
    expect(paletteRuntime.slightlyDarkenedPalsCount).toBe(1);
    expect(paletteRuntime.slightlyDarkenedPalRanges).toEqual([
      { offset: 0, count: 13 * 16 },
      { offset: 0x110, count: 16 },
      { offset: 0x160, count: 64 },
      { offset: 0x1b0, count: 80 }
    ]);
    expect(paletteRuntime.plttBufferUnfaded[0]).toBe(0x7bde);
    expect(paletteRuntime.sPalettesBackup).toEqual([0xffff, ...originalBackup.slice(1)]);
  });

  it('QL_AvoidDisplay cuts recording, creates playback task, and Task_AvoidDisplay mirrors callback timing', () => {
    const idleRuntime = createQuestLogRuntime({ gQuestLogState: 0 });
    expect(QL_AvoidDisplay(idleRuntime, 'QL_DestroyAbortedDisplay')).toBe(false);
    expect(idleRuntime.createdTasks).toEqual([]);

    const recordingRuntime = createQuestLogRuntime({
      gQuestLogState: QL_STATE_RECORDING,
      gQuestLogPlaybackState: QL_PLAYBACK_STATE_RUNNING,
      gQuestLogRecordingPointer: 12,
      gQuestLogDefeatedWildMonRecord: 34
    });
    expect(QL_AvoidDisplay(recordingRuntime, 'QL_DestroyAbortedDisplay')).toBe(false);
    expect(recordingRuntime.triedRecordActionSequences).toBe(1);
    expect(recordingRuntime.recordedWaitDurations).toEqual([1]);
    expect(recordingRuntime.recordedSceneEnds).toBe(1);
    expect(recordingRuntime.gQuestLogPlaybackState).toBe(QL_PLAYBACK_STATE_STOPPED);
    expect(recordingRuntime.gQuestLogState).toBe(0);
    expect(recordingRuntime.gQuestLogRecordingPointer).toBeNull();
    expect(recordingRuntime.gQuestLogDefeatedWildMonRecord).toBeNull();

    let callbackCount = 0;
    const playbackRuntime = createQuestLogRuntime({
      gQuestLogState: QL_STATE_PLAYBACK,
      gQuestLogPlaybackState: QL_PLAYBACK_STATE_RUNNING
    });

    expect(QL_AvoidDisplay(playbackRuntime, () => {
      callbackCount += 1;
    })).toBe(true);
    expect(playbackRuntime.gQuestLogPlaybackState).toBe(QL_PLAYBACK_STATE_ACTION_END);
    expect(playbackRuntime.createdTasks).toEqual([{ id: 0, func: 'Task_AvoidDisplay', priority: 80 }]);
    expect(playbackRuntime.tasks[0].data[0]).toBe(0);
    expect(playbackRuntime.tasks[0].data[1]).toBe(0);

    for (let i = 0; i < 126; i += 1)
      Task_AvoidDisplay(playbackRuntime, 0);
    expect(playbackRuntime.tasks[0].data[0]).toBe(126);
    expect(playbackRuntime.tasks[0].data[1]).toBe(0);
    expect(playbackRuntime.normalPaletteFades).toEqual([]);
    expect(playbackRuntime.sPlaybackControl.endMode).toBe(END_MODE_NONE);

    Task_AvoidDisplay(playbackRuntime, 0);
    expect(playbackRuntime.tasks[0].data[0]).toBe(127);
    expect(playbackRuntime.tasks[0].data[1]).toBe(1);
    expect(playbackRuntime.normalPaletteFades).toEqual([{ palettes: PALETTES_ALL, delay: 0, startY: 0, targetY: 16, color: 0 }]);
    expect(playbackRuntime.sPlaybackControl.endMode).toBe(END_MODE_SCENE);

    Task_AvoidDisplay(playbackRuntime, 0);
    expect(callbackCount).toBe(0);
    expect(playbackRuntime.destroyedTasks).toEqual([]);

    playbackRuntime.paletteFadeActive = false;
    Task_AvoidDisplay(playbackRuntime, 0);
    expect(playbackRuntime.gQuestLogPlaybackState).toBe(QL_PLAYBACK_STATE_STOPPED);
    expect(callbackCount).toBe(1);
    expect(playbackRuntime.avoidedDisplayCallbacksCalled).toBe(1);
    expect(playbackRuntime.destroyedTasks).toEqual([0]);
    expect(playbackRuntime.tasks[0]).toBeUndefined();
    expect(playbackRuntime.sQuestLogCB).toBe('QuestLog_AdvancePlayhead');
  });

  it('trainer rematch, map layout, save-state, and Pokemon count helpers match C packing', () => {
    const runtime = createQuestLogRuntime({
      trainerRematches: Array.from({ length: 100 }, (_, i) => (i === 0 || i === 3 || i === 16 || i === 63 ? 1 : 0)),
      mapLayoutId: 77,
      flags: [10, 11],
      vars: [12, 13],
      partyMons: [true, false, true, true, false, false],
      boxMons: Array.from({ length: TOTAL_BOXES_COUNT }, (_, box) =>
        Array.from({ length: IN_BOX_COUNT }, (_, slot) => (box === 0 && slot < 2) || (box === 13 && slot === 29))
      ),
      questLogScenes: [
        createQuestLogScene({ flags: [1, 2], vars: [3, 4] }),
        createQuestLogScene(),
        createQuestLogScene(),
        createQuestLogScene()
      ],
      sCurrentSceneNum: 0
    });

    expect(PARTY_SIZE).toBe(6);
    expect(QuestLog_GetPartyCount(runtime)).toBe(3);
    expect(QuestLog_GetBoxMonCount(runtime)).toBe(3);
    SetPokemonCounts(runtime);
    expect(runtime.varStore[VAR_QUEST_LOG_MON_COUNTS]).toBe((3 << NUM_PC_COUNT_BITS) + 3);

    BackUpTrainerRematches(runtime);
    expect(runtime.varStore[VAR_QLBAK_TRAINER_REMATCHES]).toBe((1 << 0) + (1 << 3));
    expect(runtime.varStore[VAR_QLBAK_TRAINER_REMATCHES + 1]).toBe(1);
    expect(runtime.varStore[VAR_QLBAK_TRAINER_REMATCHES + 3]).toBe(1 << 15);

    runtime.trainerRematches.fill(9);
    QL_CopySaveState(runtime);
    expect(runtime.flags).toEqual([1, 2]);
    expect(runtime.vars).toEqual([3, 4]);
    expect(runtime.trainerRematches.slice(0, 5)).toEqual([30, 0, 0, 30, 0]);
    expect(runtime.trainerRematches[16]).toBe(30);
    expect(runtime.trainerRematches[63]).toBe(30);
    expect(runtime.restoredTrainerRematches).toBe(1);

    BackUpMapLayout(runtime);
    expect(runtime.varStore[VAR_QLBAK_MAP_LAYOUT]).toBe(77);
    runtime.mapLayoutId = 0;
    QL_RestoreMapLayoutId(runtime);
    expect(runtime.mapLayoutId).toBe(77);

    runtime.varStore[VAR_QLBAK_MAP_LAYOUT] = 0;
    runtime.fallbackMapLayoutId = 123;
    QL_RestoreMapLayoutId(runtime);
    expect(runtime.mapLayoutId).toBe(123);
  });

  it('QL_ResetPartyAndPC reconciles party and box counts with the same destructive loop order as C', () => {
    const trimRuntime = createQuestLogRuntime({
      partyMons: [true, true, true, true, false, false],
      boxMons: Array.from({ length: TOTAL_BOXES_COUNT }, (_, box) =>
        Array.from({ length: IN_BOX_COUNT }, (_, slot) => box === 0 && slot < 4)
      ),
      varStore: { [VAR_QUEST_LOG_MON_COUNTS]: (2 << NUM_PC_COUNT_BITS) + 2 }
    });

    QL_ResetPartyAndPC(trimRuntime);
    expect(trimRuntime.qlResetPartyAndPCCalls).toBe(1);
    expect(trimRuntime.zeroedPartySlots).toEqual([5, 4]);
    expect(trimRuntime.partyMons).toEqual([true, true, true, true, false, false]);
    expect(trimRuntime.zeroedBoxSlots).toEqual([{ box: 0, slot: 0 }, { box: 0, slot: 1 }]);
    expect(QuestLog_GetBoxMonCount(trimRuntime)).toBe(2);

    const fillRuntime = createQuestLogRuntime({
      partyMons: [true, false, false, false, false, false],
      boxMons: Array.from({ length: TOTAL_BOXES_COUNT }, (_, box) =>
        Array.from({ length: IN_BOX_COUNT }, (_, slot) => box === 0 && slot < 3)
      ),
      varStore: { [VAR_QUEST_LOG_MON_COUNTS]: (3 << NUM_PC_COUNT_BITS) + 4 }
    });

    QL_ResetPartyAndPC(fillRuntime);
    expect(fillRuntime.zeroedBoxSlots).toEqual([
      { box: 0, slot: 0 },
      { box: 0, slot: 1 },
      { box: 0, slot: 2 },
      { box: 0, slot: 3 },
      { box: 0, slot: 4 }
    ]);
    expect(fillRuntime.placeholderPartySlots).toEqual([1, 2]);
    expect(fillRuntime.partyMons).toEqual([true, true, true, false, false, false]);
    expect(fillRuntime.placeholderBoxSlots).toEqual([
      { box: 0, slot: 0 },
      { box: 0, slot: 1 },
      { box: 0, slot: 2 },
      { box: 0, slot: 3 }
    ]);
    expect(QuestLog_GetBoxMonCount(fillRuntime)).toBe(4);
  });

  it('QL_UpdateObject consumes player and NPC movement scripts exactly like quest_log.c', () => {
    const runtime = createQuestLogRuntime({
      objectEvents: Array.from({ length: OBJECT_EVENT_TEMPLATES_COUNT }, (_, i) => ({
        localId: i === 2 ? LOCALID_PLAYER : i,
        heldMovement: null,
        currentMovementUpdates: 0
      })),
      sMovementScripts: Array.from({ length: OBJECT_EVENT_TEMPLATES_COUNT }, () => [MOVEMENT_ACTION_NONE, QL_PLAYER_GFX_NONE])
    });

    runtime.sMovementScripts[0][0] = MOVEMENT_ACTION_FACE_UP;
    runtime.sMovementScripts[0][1] = 33;
    QL_UpdateObject(runtime, { data: [2] });
    expect(runtime.objectEvents[2].heldMovement).toBe(MOVEMENT_ACTION_FACE_UP);
    expect(runtime.playerSpriteUpdates).toEqual([33]);
    expect(runtime.sMovementScripts[0]).toEqual([MOVEMENT_ACTION_NONE, QL_PLAYER_GFX_NONE]);
    expect(runtime.objectEvents[2].currentMovementUpdates).toBe(1);

    runtime.sMovementScripts[4][0] = MOVEMENT_ACTION_FACE_LEFT;
    runtime.sMovementScripts[4][1] = 44;
    QL_UpdateObject(runtime, { data: [4] });
    expect(runtime.objectEvents[4].heldMovement).toBe(MOVEMENT_ACTION_FACE_LEFT);
    expect(runtime.sMovementScripts[4][0]).toBe(MOVEMENT_ACTION_NONE);
    expect(runtime.sMovementScripts[4][1]).toBe(44);
    expect(runtime.playerSpriteUpdates).toEqual([33]);
    expect(runtime.objectEvents[4].currentMovementUpdates).toBe(1);

    QL_UpdateObject(runtime, { data: [5] });
    expect(runtime.objectEvents[5].heldMovement).toBeNull();
    expect(runtime.objectEvents[5].currentMovementUpdates).toBe(1);
  });

  it('record-head predicates match action-index limits and field-control lock', () => {
    const runtime = createQuestLogRuntime({ gQuestLogCurActionIdx: 2, sMaxActionsInScene: 3 });

    expect(RecordHeadAtEndOfEntry(runtime)).toBe(false);
    expect(RecordHeadAtEndOfEntryOrScriptContext2Enabled(runtime)).toBe(false);
    runtime.fieldControlsLocked = true;
    expect(RecordHeadAtEndOfEntry(runtime)).toBe(false);
    expect(RecordHeadAtEndOfEntryOrScriptContext2Enabled(runtime)).toBe(true);
    runtime.gQuestLogCurActionIdx = 3;
    expect(RecordHeadAtEndOfEntry(runtime)).toBe(true);
    expect(RecordHeadAtEndOfEntryOrScriptContext2Enabled(runtime)).toBe(true);
  });

  it('ResetActions default branch stops playback', () => {
    const runtime = createQuestLogRuntime({ gQuestLogPlaybackState: QL_PLAYBACK_STATE_RUNNING });

    ResetActions(runtime, 99, [], 0);

    expect(runtime.gQuestLogPlaybackState).toBe(QL_PLAYBACK_STATE_STOPPED);
  });

  it('ResetActions running initializes movement scripts and current action delay exactly', () => {
    const actions = [
      createQuestLogAction({
        duration: 7,
        data: {
          a: { localId: 0, mapNum: 0, mapGroup: 0, movementActionId: MOVEMENT_ACTION_FACE_LEFT },
          b: { localId: 0, mapNum: 0, mapGroup: 0, gfxState: 0 },
          fieldInput: [0, 0, 0, 0],
          raw: [0, 0, 0, 0]
        }
      })
    ];
    const runtime = createQuestLogRuntime({
      sMovementScripts: Array.from({ length: 3 }, () => [0, 0])
    });

    expect(createQuestLogRuntime().sMovementScripts).toHaveLength(OBJECT_EVENT_TEMPLATES_COUNT);

    ResetActions(runtime, QL_PLAYBACK_STATE_RUNNING, actions, 24);

    expect(runtime.sCurSceneActions).toBe(actions);
    expect(runtime.sMaxActionsInScene).toBe(3);
    expect(runtime.gQuestLogCurActionIdx).toBe(0);
    expect(runtime.sNextActionDelay).toBe(7);
    expect(runtime.sMovementScripts).toEqual([
      [MOVEMENT_ACTION_FACE_LEFT, QL_PLAYER_GFX_NONE],
      [MOVEMENT_ACTION_NONE, QL_PLAYER_GFX_NONE],
      [MOVEMENT_ACTION_NONE, QL_PLAYER_GFX_NONE]
    ]);
    expect(runtime.gQuestLogFieldInput.raw).toEqual([0, 0, 0, 0]);
    expect(runtime.gQuestLogPlaybackState).toBe(QL_PLAYBACK_STATE_RUNNING);
  });

  it('ResetActions recording seeds scene-end entries, facing movement, and an empty input action', () => {
    const facings = [
      [DIR_NONE, MOVEMENT_ACTION_FACE_DOWN],
      [DIR_SOUTH, MOVEMENT_ACTION_FACE_DOWN],
      [DIR_EAST, MOVEMENT_ACTION_FACE_RIGHT],
      [DIR_NORTH, MOVEMENT_ACTION_FACE_UP],
      [DIR_WEST, MOVEMENT_ACTION_FACE_LEFT]
    ];

    facings.forEach(([direction, movement]) => {
      const actions = Array.from({ length: 4 }, () => createQuestLogAction());
      const runtime = createQuestLogRuntime({ playerFacingDirection: direction });

      ResetActions(runtime, QL_PLAYBACK_STATE_RECORDING, actions, 32);

      expect(runtime.sMaxActionsInScene).toBe(4);
      expect(actions[2]).toMatchObject({ duration: 0xffff, type: QL_ACTION_SCENE_END });
      expect(actions[0]).toMatchObject({
        duration: 0,
        type: QL_ACTION_MOVEMENT,
        data: { a: { localId: 0, movementActionId: movement } }
      });
      expect(actions[1]).toMatchObject({
        duration: 0,
        type: QL_ACTION_INPUT,
        data: { fieldInput: [0, 0, 0, 0] }
      });
      expect(runtime.gQuestLogCurActionIdx).toBe(2);
      expect(runtime.gQuestLogPlaybackState).toBe(QL_PLAYBACK_STATE_RECORDING);
    });
  });

  it('quest-log movement, gfx, and input recorders preserve C action slots and delays', () => {
    const actions = Array.from({ length: 8 }, () => createQuestLogAction());
    const runtime = createQuestLogRuntime({
      sCurSceneActions: actions,
      sMaxActionsInScene: actions.length,
      gQuestLogCurActionIdx: 1,
      sNextActionDelay: 4,
      sLastQuestLogCursor: 0
    });
    actions[0].data.a.movementActionId = MOVEMENT_ACTION_FACE_DOWN;

    QuestLogRecordNPCStep(runtime, 3, 4, 5, MOVEMENT_ACTION_FACE_LEFT);
    expect(actions[1]).toMatchObject({
      duration: 4,
      type: QL_ACTION_MOVEMENT,
      data: { a: { localId: 3, mapNum: 4, mapGroup: 5, movementActionId: MOVEMENT_ACTION_FACE_LEFT } }
    });
    expect(runtime.gQuestLogCurActionIdx).toBe(2);
    expect(runtime.sNextActionDelay).toBe(0);

    QuestLogRecordNPCStepWithDuration(runtime, 6, 7, 8, MOVEMENT_ACTION_FACE_RIGHT, 9);
    expect(actions[2]).toMatchObject({
      duration: 0,
      type: QL_ACTION_MOVEMENT,
      data: { a: { localId: 6, mapNum: 7, mapGroup: 8, movementActionId: MOVEMENT_ACTION_FACE_RIGHT } }
    });
    expect(runtime.sNextActionDelay).toBe(9);

    QuestLogRecordPlayerStep(runtime, MOVEMENT_ACTION_FACE_DOWN);
    expect(runtime.gQuestLogCurActionIdx).toBe(3);
    QuestLogRecordPlayerStep(runtime, MOVEMENT_ACTION_FACE_UP);
    expect(actions[3]).toMatchObject({
      duration: 9,
      type: QL_ACTION_MOVEMENT,
      data: { a: { localId: 0, movementActionId: MOVEMENT_ACTION_FACE_UP } }
    });
    expect(runtime.sLastQuestLogCursor).toBe(3);
    expect(runtime.sNextActionDelay).toBe(0);

    QuestLogRecordPlayerStep(runtime, MOVEMENT_ACTION_NONE);
    expect(actions[4]).toMatchObject({
      duration: 0,
      type: QL_ACTION_MOVEMENT,
      data: { a: { localId: 0, movementActionId: MOVEMENT_ACTION_NONE } }
    });

    QuestLogRecordPlayerStepWithDuration(runtime, MOVEMENT_ACTION_FACE_RIGHT, 12);
    expect(actions[5]).toMatchObject({
      duration: 0,
      type: QL_ACTION_MOVEMENT,
      data: { a: { localId: 0, movementActionId: MOVEMENT_ACTION_FACE_RIGHT } }
    });
    expect(runtime.sNextActionDelay).toBe(12);

    QuestLogRecordPlayerAvatarGfxTransition(runtime, 33);
    expect(actions[6]).toMatchObject({
      duration: 12,
      type: QL_ACTION_GFX_CHANGE,
      data: { b: { localId: 0, gfxState: 33 } }
    });
    expect(runtime.sNextActionDelay).toBe(0);

    QuestLogRecordPlayerAvatarGfxTransitionWithDuration(runtime, 44, 13);
    expect(actions[7]).toMatchObject({
      duration: 0,
      type: QL_ACTION_GFX_CHANGE,
      data: { b: { localId: 0, gfxState: 44 } }
    });
    expect(runtime.sNextActionDelay).toBe(13);
  });

  it('QL_RecordFieldInput masks the same raw fields and sets delay from field-control lock', () => {
    const actions = Array.from({ length: 2 }, () => createQuestLogAction());
    const runtime = createQuestLogRuntime({
      sCurSceneActions: actions,
      sMaxActionsInScene: actions.length,
      gQuestLogCurActionIdx: 0,
      sNextActionDelay: 6
    });

    QL_RecordFieldInput(runtime, 0xffffffff);
    expect(actions[0]).toMatchObject({
      duration: 6,
      type: QL_ACTION_INPUT,
      data: { fieldInput: [0xf3, 0x00, 0xff, 0x00] }
    });
    expect(runtime.sNextActionDelay).toBe(0);

    runtime.fieldControlsLocked = true;
    QL_RecordFieldInput(runtime, 0x12345678);
    expect(actions[1]).toMatchObject({
      duration: 0,
      type: QL_ACTION_INPUT,
      data: { fieldInput: [0x70, 0x00, 0x34, 0x00] }
    });
    expect(runtime.sNextActionDelay).toBe(1);
  });

  it('QL_TryRunActions follows running, action-end, wait, and recording branches exactly', () => {
    const actions = [
      createQuestLogAction({
        duration: 0,
        type: QL_ACTION_MOVEMENT,
        data: {
          a: { localId: 2, mapNum: 0, mapGroup: 0, movementActionId: MOVEMENT_ACTION_FACE_LEFT },
          b: { localId: 0, mapNum: 0, mapGroup: 0, gfxState: 0 },
          fieldInput: [0, 0, 0, 0],
          raw: [0, 0, 0, 0]
        }
      }),
      createQuestLogAction({
        duration: 0xffff,
        type: QL_ACTION_INPUT,
        data: {
          a: { localId: 0, mapNum: 0, mapGroup: 0, movementActionId: 0 },
          b: { localId: 0, mapNum: 0, mapGroup: 0, gfxState: 0 },
          fieldInput: [1, 2, 3, 4],
          raw: [0, 0, 0, 0]
        }
      }),
      createQuestLogAction({
        duration: 0,
        type: QL_ACTION_EMPTY
      }),
      createQuestLogAction({
        duration: 5,
        type: QL_ACTION_SCENE_END
      })
    ];
    const runtime = createQuestLogRuntime({
      gQuestLogPlaybackState: QL_PLAYBACK_STATE_RUNNING,
      sCurSceneActions: actions,
      sMaxActionsInScene: actions.length,
      sMovementScripts: Array.from({ length: 4 }, () => [MOVEMENT_ACTION_NONE, QL_PLAYER_GFX_NONE])
    });

    QL_TryRunActions(runtime);
    expect(runtime.sMovementScripts[2][0]).toBe(MOVEMENT_ACTION_FACE_LEFT);
    expect(runtime.gQuestLogFieldInput.raw).toEqual([1, 2, 3, 4]);
    expect(runtime.gQuestLogCurActionIdx).toBe(3);
    expect(runtime.gQuestLogPlaybackState).toBe(QL_PLAYBACK_STATE_ACTION_END);

    runtime.gQuestLogPlaybackState = QL_PLAYBACK_STATE_RUNNING;
    runtime.gQuestLogCurActionIdx = 0;
    runtime.sNextActionDelay = 2;
    QL_TryRunActions(runtime);
    expect(runtime.sNextActionDelay).toBe(1);
    expect(runtime.gQuestLogCurActionIdx).toBe(0);

    runtime.gQuestLogPlaybackState = QL_PLAYBACK_STATE_RECORDING;
    runtime.sNextActionDelay = 3;
    runtime.fieldControlsLocked = false;
    QL_TryRunActions(runtime);
    expect(runtime.sNextActionDelay).toBe(4);

    runtime.fieldControlsLocked = true;
    QL_TryRunActions(runtime);
    expect(runtime.sNextActionDelay).toBe(4);
  });

  it('playback lock toggles, escalator warp, normalized state, and fishing delay match C branches', () => {
    const actions = Array.from({ length: 3 }, () => createQuestLogAction());
    const runtime = createQuestLogRuntime({
      gQuestLogPlaybackState: QL_PLAYBACK_STATE_RUNNING,
      sCurSceneActions: actions,
      sMaxActionsInScene: actions.length,
      sNextActionDelay: 7
    });

    TogglePlaybackStateForOverworldLock(runtime, 1);
    expect(runtime.gQuestLogPlaybackState).toBe(QL_PLAYBACK_STATE_ACTION_END);
    TogglePlaybackStateForOverworldLock(runtime, 2);
    expect(runtime.gQuestLogPlaybackState).toBe(QL_PLAYBACK_STATE_RUNNING);
    expect(QL_GetPlaybackState(runtime)).toBe(QL_PLAYBACK_STATE_RUNNING);

    QuestLog_OnEscalatorWarp(runtime, QL_ESCALATOR_OUT);
    expect(runtime.gQuestLogPlaybackState).toBe(QL_PLAYBACK_STATE_ACTION_END);
    QuestLog_OnEscalatorWarp(runtime, QL_ESCALATOR_IN);
    expect(runtime.gQuestLogPlaybackState).toBe(QL_PLAYBACK_STATE_RUNNING);

    runtime.gQuestLogPlaybackState = QL_PLAYBACK_STATE_RECORDING;
    runtime.gQuestLogCurActionIdx = 0;
    QuestLog_OnEscalatorWarp(runtime, QL_ESCALATOR_OUT);
    expect(actions[0]).toMatchObject({ duration: 7, type: QL_ACTION_EMPTY });
    expect(runtime.gQuestLogCurActionIdx).toBe(1);
    expect(runtime.sNextActionDelay).toBe(0);
    expect(runtime.gQuestLogPlaybackState).toBe(QL_PLAYBACK_STATE_RECORDING_NO_DELAY);
    expect(QL_GetPlaybackState(runtime)).toBe(QL_PLAYBACK_STATE_RECORDING);

    QuestLog_OnEscalatorWarp(runtime, QL_ESCALATOR_IN);
    expect(runtime.gQuestLogPlaybackState).toBe(QL_PLAYBACK_STATE_RECORDING);
    QL_AfterRecordFishActionSuccessful(runtime);
    expect(runtime.sNextActionDelay).toBe(1);
  });

  it('QuestLog_PlayCurrentEvent mirrors countdown, overlap close, repeat/load event, and message handling branches', () => {
    const waitingRuntime = createQuestLogRuntime({
      gQuestLogPlaybackState: QL_PLAYBACK_STATE_ACTION_END,
      sPlaybackControl: { state: 1, playingEvent: false, endMode: END_MODE_NONE, cursor: 0, timer: 2, overlapTimer: 0 },
      sEventData: [55, ...Array.from({ length: 31 }, () => null)]
    });

    QuestLog_PlayCurrentEvent(waitingRuntime);
    expect(waitingRuntime.sPlaybackControl.timer).toBe(1);
    expect(waitingRuntime.sPlaybackControl.state).toBe(1);
    expect(waitingRuntime.qlTryRepeatEventArgs).toEqual([]);
    expect(waitingRuntime.gQuestLogPlaybackState).toBe(QL_PLAYBACK_STATE_ACTION_END);

    const repeatRuntime = createQuestLogRuntime({
      gQuestLogPlaybackState: QL_PLAYBACK_STATE_ACTION_END,
      sPlaybackControl: { state: 1, playingEvent: false, endMode: END_MODE_NONE, cursor: 0, timer: 1, overlapTimer: 0 },
      sEventData: [55, ...Array.from({ length: 31 }, () => null)],
      qlTryRepeatEventResults: [true],
      questLogText: Array.from({ length: 19 }, () => 1).concat(EOS)
    });

    QuestLog_PlayCurrentEvent(repeatRuntime);
    expect(repeatRuntime.gQuestLogPlaybackState).toBe(QL_PLAYBACK_STATE_ACTION_END);
    expect(repeatRuntime.sPlaybackControl).toEqual({
      state: 1,
      playingEvent: false,
      endMode: END_MODE_NONE,
      cursor: 1,
      timer: 0x5f,
      overlapTimer: 0
    });
    expect(repeatRuntime.qlTryRepeatEventArgs).toEqual([55]);
    expect(repeatRuntime.qlLoadEventArgs).toEqual([]);
    expect(repeatRuntime.questLogDescriptionDrawnCount).toBe(1);
    expect(repeatRuntime.handledQuestLogMessages).toBe(1);

    const loadRuntime = createQuestLogRuntime({
      gQuestLogPlaybackState: QL_PLAYBACK_STATE_RUNNING,
      sPlaybackControl: { state: 0, playingEvent: false, endMode: END_MODE_NONE, cursor: 0, timer: 0, overlapTimer: 0 },
      sEventData: [77, ...Array.from({ length: 31 }, () => null)],
      qlTryRepeatEventResults: [false],
      qlLoadEventResults: [true],
      questLogText: Array.from({ length: 35 }, () => 1).concat(EOS)
    });

    QuestLog_PlayCurrentEvent(loadRuntime);
    expect(loadRuntime.qlTryRepeatEventArgs).toEqual([77]);
    expect(loadRuntime.qlLoadEventArgs).toEqual([77]);
    expect(loadRuntime.sPlaybackControl.timer).toBe(0x7f);
    expect(loadRuntime.sPlaybackControl.cursor).toBe(1);
    expect(loadRuntime.gQuestLogPlaybackState).toBe(QL_PLAYBACK_STATE_ACTION_END);

    const repeatedCounterRuntime = createQuestLogRuntime({
      gQuestLogPlaybackState: QL_PLAYBACK_STATE_RUNNING,
      sPlaybackControl: { state: 0, playingEvent: false, endMode: END_MODE_NONE, cursor: 4, timer: 0, overlapTimer: 0 },
      sEventData: [null, null, null, null, 99, ...Array.from({ length: 27 }, () => null)],
      qlTryRepeatEventResults: [true],
      questLogRepeatEventCounter: 2
    });

    QuestLog_PlayCurrentEvent(repeatedCounterRuntime);
    expect(repeatedCounterRuntime.sPlaybackControl.cursor).toBe(4);
    expect(repeatedCounterRuntime.questLogDescriptionDrawnCount).toBe(1);

    const overlapRuntime = createQuestLogRuntime({
      sPlaybackControl: { state: 0, playingEvent: true, endMode: END_MODE_NONE, cursor: 32, timer: 0, overlapTimer: 15 }
    });

    QuestLog_PlayCurrentEvent(overlapRuntime);
    expect(overlapRuntime.questLogTextWindowClosedCount).toBe(1);
    expect(overlapRuntime.sPlaybackControl.playingEvent).toBe(false);
    expect(overlapRuntime.sPlaybackControl.overlapTimer).toBe(0);
    expect(overlapRuntime.qlTryRepeatEventArgs).toEqual([]);

    const boundaryRuntime = createQuestLogRuntime({
      gQuestLogPlaybackState: QL_PLAYBACK_STATE_RUNNING,
      sPlaybackControl: { state: 0, playingEvent: false, endMode: END_MODE_NONE, cursor: 31, timer: 0, overlapTimer: 0 },
      sEventData: [...Array.from({ length: 31 }, () => null), 123],
      qlTryRepeatEventResults: [true]
    });

    QuestLog_PlayCurrentEvent(boundaryRuntime);
    expect(boundaryRuntime.sPlaybackControl.cursor).toBe(32);
    expect(boundaryRuntime.questLogDescriptionDrawnCount).toBe(1);
  });

  it('quest-log text duration counts non-newline bytes up to EOS with C thresholds', () => {
    expect(GetQuestLogTextDisplayDuration([...Array.from({ length: 19 }, () => 65), EOS])).toBe(0x5f);
    expect(GetQuestLogTextDisplayDuration([...Array.from({ length: 20 }, () => 65), EOS])).toBe(0x7f);
    expect(GetQuestLogTextDisplayDuration([...Array.from({ length: 35 }, () => 65), EOS])).toBe(0x7f);
    expect(GetQuestLogTextDisplayDuration([...Array.from({ length: 36 }, () => 65), EOS])).toBe(0xbf);
    expect(GetQuestLogTextDisplayDuration([...Array.from({ length: 45 }, () => 65), EOS])).toBe(0xbf);
    expect(GetQuestLogTextDisplayDuration([...Array.from({ length: 46 }, () => 65), EOS])).toBe(0xff);
    expect(GetQuestLogTextDisplayDuration([65, CHAR_NEWLINE, 66, EOS, ...Array.from({ length: 50 }, () => 65)])).toBe(0x5f);
  });

  it('trainer sight, playback ending, and A/B input handling match C playback-control gates', () => {
    const runtime = createQuestLogRuntime({
      gQuestLogState: QL_STATE_PLAYBACK,
      gQuestLogPlaybackState: QL_PLAYBACK_STATE_RUNNING,
      sPlaybackControl: { state: 0, playingEvent: false, endMode: END_MODE_NONE, cursor: 0, timer: 0, overlapTimer: 0 }
    });

    expect(QL_IsTrainerSightDisabled(runtime)).toBe(false);
    runtime.gQuestLogPlaybackState = QL_PLAYBACK_STATE_STOPPED;
    expect(QL_IsTrainerSightDisabled(runtime)).toBe(true);
    runtime.gQuestLogPlaybackState = QL_PLAYBACK_STATE_RUNNING;
    runtime.sPlaybackControl.state = 1;
    expect(QL_IsTrainerSightDisabled(runtime)).toBe(true);
    runtime.sPlaybackControl.state = 2;
    expect(QL_IsTrainerSightDisabled(runtime)).toBe(true);
    runtime.gQuestLogState = 0;
    expect(QL_IsTrainerSightDisabled(runtime)).toBe(false);

    runtime.gQuestLogState = QL_STATE_PLAYBACK;
    runtime.sPlaybackControl.state = 0;
    expect(QuestLogScenePlaybackIsEnding(runtime)).toBe(false);
    QL_HandleInput(runtime, A_BUTTON | B_BUTTON);
    expect(runtime.sPlaybackControl.endMode).toBe(END_MODE_SCENE);
    expect(runtime.gQuestLogPlaybackState).toBe(QL_PLAYBACK_STATE_STOPPED);
    expect(runtime.sceneEndTransitionDelay).toBe(-3);
    expect(runtime.fadeScreenCalls).toEqual([{ mode: FADE_TO_BLACK, delay: -3 }]);
    expect(runtime.skipToEndTransitionDelay).toBeNull();
    expect(QuestLogScenePlaybackIsEnding(runtime)).toBe(true);

    runtime.gQuestLogPlaybackState = QL_PLAYBACK_STATE_RUNNING;
    QL_HandleInput(runtime, B_BUTTON);
    expect(runtime.sPlaybackControl.endMode).toBe(END_MODE_SCENE);
    expect(runtime.gQuestLogPlaybackState).toBe(QL_PLAYBACK_STATE_RUNNING);
    expect(runtime.skipToEndTransitionDelay).toBeNull();

    const finishRuntime = createQuestLogRuntime({
      gQuestLogPlaybackState: QL_PLAYBACK_STATE_RUNNING,
      sPlaybackControl: { state: 0, playingEvent: false, endMode: END_MODE_NONE, cursor: 0, timer: 0, overlapTimer: 0 }
    });
    QL_HandleInput(finishRuntime, B_BUTTON);
    expect(finishRuntime.sPlaybackControl.endMode).toBe(END_MODE_FINISH);
    expect(finishRuntime.gQuestLogPlaybackState).toBe(QL_PLAYBACK_STATE_STOPPED);
    expect(finishRuntime.sceneEndTransitionDelay).toBeNull();
    expect(finishRuntime.skipToEndTransitionDelay).toBe(-3);
    expect(finishRuntime.fadeScreenCalls).toEqual([{ mode: FADE_TO_BLACK, delay: -3 }]);
  });

  it('recording finish, cut, and scene-end helpers preserve quest_log.c cleanup side effects', () => {
    const runtime = createQuestLogRuntime({
      gQuestLogState: QL_STATE_RECORDING,
      gQuestLogPlaybackState: QL_PLAYBACK_STATE_RUNNING,
      sCurrentSceneNum: 3,
      sQuestLogCB: 'QLogCB_Recording',
      gQuestLogRecordingPointer: 12,
      gQuestLogDefeatedWildMonRecord: 4
    });

    QL_RecordWait(runtime, 9);
    expect(runtime.recordedWaitDurations).toEqual([9]);

    RecordSceneEnd(runtime);
    expect(runtime.recordedSceneEnds).toBe(1);
    expect(runtime.sCurrentSceneNum).toBe(0);

    QL_FinishRecordingScene(runtime);
    expect(runtime.triedRecordActionSequences).toBe(1);
    expect(runtime.recordedSceneEnds).toBe(2);
    expect(runtime.sCurrentSceneNum).toBe(1);
    expect(runtime.gQuestLogState).toBe(0);
    expect(runtime.sQuestLogCB).toBeNull();
    expect(runtime.gQuestLogDefeatedWildMonRecord).toBeNull();
    expect(runtime.gQuestLogRecordingPointer).toBeNull();
    expect(runtime.gQuestLogPlaybackState).toBe(QL_PLAYBACK_STATE_STOPPED);

    const cutRuntime = createQuestLogRuntime({
      gQuestLogState: QL_STATE_RECORDING,
      gQuestLogPlaybackState: QL_PLAYBACK_STATE_ACTION_END,
      sCurrentSceneNum: 2,
      sQuestLogCB: 'QLogCB_Recording',
      gQuestLogRecordingPointer: 99,
      gQuestLogDefeatedWildMonRecord: 44
    });
    QuestLog_CutRecording(cutRuntime);
    expect(cutRuntime.triedRecordActionSequences).toBe(1);
    expect(cutRuntime.recordedWaitDurations).toEqual([1]);
    expect(cutRuntime.recordedSceneEnds).toBe(1);
    expect(cutRuntime.sCurrentSceneNum).toBe(3);
    expect(cutRuntime.gQuestLogPlaybackState).toBe(QL_PLAYBACK_STATE_STOPPED);
    expect(cutRuntime.gQuestLogState).toBe(0);
    expect(cutRuntime.sQuestLogCB).toBeNull();
    expect(cutRuntime.gQuestLogDefeatedWildMonRecord).toBeNull();
    expect(cutRuntime.gQuestLogRecordingPointer).toBeNull();

    const stoppedRuntime = createQuestLogRuntime({
      gQuestLogState: QL_STATE_RECORDING,
      gQuestLogPlaybackState: QL_PLAYBACK_STATE_STOPPED,
      gQuestLogRecordingPointer: 8,
      gQuestLogDefeatedWildMonRecord: 7
    });
    QuestLog_CutRecording(stoppedRuntime);
    expect(stoppedRuntime.triedRecordActionSequences).toBe(0);
    expect(stoppedRuntime.recordedWaitDurations).toEqual([]);
    expect(stoppedRuntime.recordedSceneEnds).toBe(0);
    expect(stoppedRuntime.gQuestLogState).toBe(QL_STATE_RECORDING);
    expect(stoppedRuntime.gQuestLogDefeatedWildMonRecord).toBeNull();
    expect(stoppedRuntime.gQuestLogRecordingPointer).toBeNull();
  });

  it('TryRecordActionSequence records only new action slots, handles overflow, and scene-end stop branch like C', () => {
    const actions = [
      createQuestLogAction({ type: QL_ACTION_MOVEMENT }),
      createQuestLogAction({ type: QL_ACTION_GFX_CHANGE }),
      createQuestLogAction({ type: QL_ACTION_INPUT })
    ];
    const runtime = createQuestLogRuntime({
      sCurSceneActions: actions,
      sRecordSequenceStartIdx: 1,
      gQuestLogCurActionIdx: 3,
      gQuestLogPlaybackState: QL_PLAYBACK_STATE_RECORDING,
      gQuestLogRecordingPointer: 4,
      questLogScriptCapacity: 40
    });

    expect(TryRecordActionSequence(runtime, actions)).toBe(true);
    expect(runtime.recordedQuestLogActions).toEqual([
      { kind: 'movementOrGfxChange', offset: 4, actionIdx: 1, duration: undefined },
      { kind: 'input', offset: 12, actionIdx: 2, duration: undefined }
    ]);
    expect(runtime.gQuestLogRecordingPointer).toBe(20);
    expect(runtime.sRecordSequenceStartIdx).toBe(3);

    const stoppedRuntime = createQuestLogRuntime({
      sCurSceneActions: actions,
      sRecordSequenceStartIdx: 0,
      gQuestLogCurActionIdx: 0,
      gQuestLogPlaybackState: QL_PLAYBACK_STATE_STOPPED,
      gQuestLogRecordingPointer: 20,
      questLogScriptCapacity: 40
    });
    expect(TryRecordActionSequence(stoppedRuntime, actions)).toBe(false);
    expect(stoppedRuntime.recordedQuestLogActions).toEqual([{ kind: 'sceneEnd', offset: 20, actionIdx: undefined, duration: undefined }]);
    expect(stoppedRuntime.gQuestLogRecordingPointer).toBe(22);
    expect(stoppedRuntime.sRecordSequenceStartIdx).toBe(0);

    const overflowRuntime = createQuestLogRuntime({
      sCurSceneActions: actions,
      sRecordSequenceStartIdx: 0,
      gQuestLogCurActionIdx: 1,
      gQuestLogPlaybackState: QL_PLAYBACK_STATE_RECORDING,
      gQuestLogRecordingPointer: 35,
      questLogScriptCapacity: 40
    });
    expect(TryRecordActionSequence(overflowRuntime, actions)).toBe(false);
    expect(overflowRuntime.gQuestLogRecordingPointer).toBeNull();
    expect(overflowRuntime.gQuestLogPlaybackState).toBe(QL_PLAYBACK_STATE_STOPPED);

    const nullRuntime = createQuestLogRuntime({
      sCurSceneActions: actions,
      sRecordSequenceStartIdx: 0,
      gQuestLogCurActionIdx: 1,
      gQuestLogRecordingPointer: null
    });
    expect(TryRecordActionSequence(nullRuntime, actions)).toBe(false);
    expect(nullRuntime.recordedQuestLogActions).toEqual([]);
  });

  it('SortQuestLogInSav1 and SaveQuestLogData preserve C ring-buffer order and link-active gate', () => {
    const scenes = [
      createQuestLogScene({ startType: 1, script: [0] }),
      createQuestLogScene({ startType: 0, script: [1] }),
      createQuestLogScene({ startType: 2, script: [2] }),
      createQuestLogScene({ startType: 1, script: [3] })
    ];
    const runtime = createQuestLogRuntime({
      sCurrentSceneNum: 2,
      questLogScenes: scenes
    });

    SortQuestLogInSav1(runtime);
    expect(runtime.sCurrentSceneNum).toBe(3);
    expect(runtime.questLogScenes.map((scene) => scene.startType)).toEqual([2, 1, 1, 0]);
    expect(runtime.questLogScenes.map((scene) => scene.script[0] ?? -1)).toEqual([2, 3, 0, -1]);
    expect(runtime.questLogScenes[0]).not.toBe(scenes[2]);

    ClearSavedScene(runtime, 1);
    expect(runtime.questLogScenes[1]).toMatchObject({ startType: 0, mapGroup: 0, mapNum: 0, warpId: 0, x: 0, y: 0, flags: [], vars: [], script: [] });
    expect(runtime.questLogScenes[1].objectEventTemplates).toHaveLength(OBJECT_EVENT_TEMPLATES_COUNT);
    expect(runtime.gQuestLogDefeatedWildMonRecord).toBeNull();

    const linkRuntime = createQuestLogRuntime({
      gQuestLogState: QL_STATE_RECORDING,
      gQuestLogPlaybackState: QL_PLAYBACK_STATE_RUNNING,
      sCurrentSceneNum: 1,
      questLogScenes: [
        createQuestLogScene({ startType: 1, script: [10] }),
        createQuestLogScene({ startType: 2, script: [11] }),
        createQuestLogScene({ startType: 0, script: [12] }),
        createQuestLogScene({ startType: 1, script: [13] })
      ],
      gQuestLogRecordingPointer: 1
    });
    SaveQuestLogData(linkRuntime, true);
    expect(linkRuntime.gQuestLogState).toBe(QL_STATE_RECORDING);
    expect(linkRuntime.gQuestLogRecordingPointer).toBe(1);
    expect(linkRuntime.questLogScenes.map((scene) => scene.script[0] ?? -1)).toEqual([10, 11, 12, 13]);

    SaveQuestLogData(linkRuntime, false);
    expect(linkRuntime.gQuestLogState).toBe(0);
    expect(linkRuntime.gQuestLogRecordingPointer).toBeNull();
    expect(linkRuntime.recordedWaitDurations).toEqual([1]);
    expect(linkRuntime.questLogScenes.map((scene) => scene.startType)).toEqual([1, 1, 2, 0]);
    expect(linkRuntime.questLogScenes.map((scene) => scene.script[0] ?? -1)).toEqual([13, 10, 11, -1]);
  });

  it('QuestLogGetFlagOrVarPtr advances only on matching record and valid action head', () => {
    const records = [
      { idx: 10, isFlag: true, value: 111 },
      { idx: 11, isFlag: false, value: 222 }
    ];
    const runtime = createQuestLogRuntime({
      gQuestLogCurActionIdx: 1,
      sMaxActionsInScene: 4,
      sFlagOrVarRecords: records,
      sNumFlagsOrVars: 2
    });

    expect(QuestLogGetFlagOrVarPtr(runtime, false, 10)).toBeNull();
    expect(runtime.sFlagOrVarPlayhead).toBe(0);
    expect(QuestLogGetFlagOrVarPtr(runtime, true, 10)).toEqual({ record: records[0], value: 111 });
    expect(runtime.sFlagOrVarPlayhead).toBe(1);
    expect(QuestLogGetFlagOrVarPtr(runtime, false, 11)).toEqual({ record: records[1], value: 222 });
    expect(runtime.sFlagOrVarPlayhead).toBe(2);
    expect(QuestLogGetFlagOrVarPtr(runtime, false, 11)).toBeNull();

    runtime.gQuestLogCurActionIdx = 0;
    runtime.sFlagOrVarPlayhead = 0;
    expect(QuestLogGetFlagOrVarPtr(runtime, true, 10)).toBeNull();
  });

  it('QuestLogSetFlagOrVar writes sequential records only inside valid bounds', () => {
    const records = [
      { idx: 0, isFlag: false, value: 0 },
      { idx: 0, isFlag: false, value: 0 }
    ];
    const runtime = createQuestLogRuntime({
      gQuestLogCurActionIdx: 1,
      sMaxActionsInScene: 3,
      sFlagOrVarRecords: records,
      sNumFlagsOrVars: 2
    });

    QuestLogSetFlagOrVar(runtime, true, 25, 99);
    QuestLogSetFlagOrVar(runtime, false, 26, 100);
    QuestLogSetFlagOrVar(runtime, true, 27, 101);

    expect(records).toEqual([
      { idx: 25, isFlag: true, value: 99 },
      { idx: 26, isFlag: false, value: 100 }
    ]);
    expect(runtime.sFlagOrVarPlayhead).toBe(2);

    runtime.gQuestLogCurActionIdx = 0;
    runtime.sFlagOrVarPlayhead = 0;
    QuestLogSetFlagOrVar(runtime, true, 1, 2);
    expect(records[0]).toEqual({ idx: 25, isFlag: true, value: 99 });
  });

  it('QuestLogResetFlagsOrVars stops invalid states and fills playback dummy records', () => {
    const runtime = createQuestLogRuntime({
      gQuestLogPlaybackState: QL_PLAYBACK_STATE_RUNNING,
      sMaxActionsInScene: 3
    });
    const records = Array.from({ length: 4 }, () => ({ idx: 9, isFlag: true, value: 9 }));

    QuestLogResetFlagsOrVars(runtime, 0, records, 16);
    expect(runtime.gQuestLogPlaybackState).toBe(QL_PLAYBACK_STATE_STOPPED);

    QuestLogResetFlagsOrVars(runtime, QL_STATE_PLAYBACK, records, 16);
    expect(runtime.sFlagOrVarRecords).toBe(records);
    expect(runtime.sNumFlagsOrVars).toBe(4);
    expect(runtime.sFlagOrVarPlayhead).toBe(0);
    expect(records.slice(0, 3)).toEqual([
      { idx: 0, isFlag: false, value: 0x7fff },
      { idx: 0, isFlag: false, value: 0x7fff },
      { idx: 0, isFlag: false, value: 0x7fff }
    ]);
    expect(records[3]).toEqual({ idx: 9, isFlag: true, value: 9 });
  });
});
