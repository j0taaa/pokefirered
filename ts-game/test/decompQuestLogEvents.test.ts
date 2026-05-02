import { describe, expect, it } from 'vitest';
import { QL_ACTION_GFX_CHANGE, QL_ACTION_INPUT, QL_ACTION_MOVEMENT, QL_ACTION_SCENE_END, QL_ACTION_WAIT } from '../src/game/decompQuestLog';
import {
  CMD_HEADER_SIZE,
  EOS,
  EXT_CTRL_CODE_BEGIN,
  EXT_CTRL_CODE_ENG,
  EXT_CTRL_CODE_JPN,
  FIELD_MOVE_DIG,
  FIELD_MOVE_TELEPORT,
  InQuestLogDisabledLocation,
  MAX_CMD_REPEAT,
  MAP_GROUP_CELADON_CITY_DEPT_STORE,
  MAP_GROUP_ROCKET_HIDEOUT,
  MAP_GROUP_SAFFRON_CITY,
  MAP_GROUP_SEVEN_ISLAND_HOUSE,
  MAP_GROUP_TRAINER_TOWER,
  MAP_NUM_CELADON_CITY_DEPARTMENT_STORE_ELEVATOR,
  MAP_NUM_ROCKET_HIDEOUT_ELEVATOR,
  MAP_NUM_SAFFRON_CITY_POKEMON_TRAINER_FAN_CLUB,
  MAP_NUM_SEVEN_ISLAND_HOUSE_ROOM2,
  MAP_NUM_TRAINER_TOWER_1F,
  MAP_NUM_TRAINER_TOWER_ELEVATOR,
  QL_CMD_COUNT_SHIFT,
  QL_CMD_COUNT_MASK,
  QL_PLAYBACK_STATE_STOPPED,
  QL_STATE_PLAYBACK,
  QL_STATE_PLAYBACK_LAST,
  QL_STATE_RECORDING,
  QL_EVENT_ARRIVED,
  QL_EVENT_BOUGHT_ITEM,
  QL_EVENT_DEFEATED_CHAMPION,
  QL_EVENT_DEFEATED_E4_MEMBER,
  QL_EVENT_DEFEATED_GYM_LEADER,
  QL_EVENT_DEFEATED_TRAINER,
  QL_EVENT_DEFEATED_WILD_MON,
  QL_EVENT_DEPARTED,
  QL_EVENT_DEPOSITED_ITEM_PC,
  QL_EVENT_GFX_CHANGE,
  QL_EVENT_GAVE_HELD_ITEM,
  QL_EVENT_INPUT,
  QL_EVENT_LINK_BATTLED_MULTI,
  QL_EVENT_LINK_BATTLED_SINGLE,
  QL_EVENT_LINK_TRADED,
  QL_EVENT_LINK_TRADED_UNION,
  QL_EVENT_MOVEMENT,
  QL_EVENT_MOVED_MON_BETWEEN_BOXES,
  QL_EVENT_MOVED_MON_WITHIN_BOX,
  QL_EVENT_OBTAINED_STORY_ITEM,
  QL_EVENT_SCENE_END,
  QL_EVENT_SOLD_ITEM,
  QL_EVENT_SWITCHED_MONS_BETWEEN_BOXES,
  QL_EVENT_SWITCHED_MONS_WITHIN_BOX,
  QL_EVENT_SWITCHED_MULTIPLE_MONS,
  QL_EVENT_SWITCHED_PARTY_MON_FOR_PC_MON,
  QL_EVENT_USED_UNION_ROOM_CHAT,
  QL_EVENT_USED_PKMN_CENTER,
  QL_EVENT_USED_ITEM,
  QL_EVENT_WAIT,
  QL_LOCATION_GAME_CORNER,
  QL_LOCATION_SAFARI_ZONE,
  POCKET_BERRY_POUCH,
  POCKET_KEY_ITEMS,
  POCKET_TM_CASE,
  ITEM_HM01,
  MAPSEC_PALLET_TOWN,
  LoadEvent_ArrivedInLocation,
  LoadEvent_DepartedLocation,
  LoadEvent_ObtainedStoryItem,
  LoadEvent_Shop,
  LoadEvent_UsedFieldMove,
  QuestLog_RecordEnteredMap,
  QuestLog_ShouldEndSceneOnMapChange,
  QuestLogEvents_HandleEndTrainerBattle,
  QuestLog_GetSpeciesName,
  QuestLog_StartRecordingInputsAfterDeferredEvent,
  RecordEvent_ArrivedInLocation,
  RecordEvent_BoughtItem,
  RecordEvent_DepartedLocation,
  RecordEvent_DefeatedChampion,
  RecordEvent_DefeatedGymLeader,
  RecordEvent_DefeatedNormalTrainer,
  RecordEvent_DefeatedWildMon,
  RecordEvent_DepositedItemInPC,
  RecordEvent_GaveHeldItemFromPartyMenu,
  RecordEvent_LinkBattledMulti,
  RecordEvent_LinkBattledSingle,
  RecordEvent_LinkTraded,
  RecordEvent_MovedMonBetweenBoxes,
  RecordEvent_MovedMonWithinBox,
  RecordEvent_SwappedHeldItemFromBag,
  RecordEvent_SwitchedMonsBetweenBoxes,
  RecordEvent_SwitchedMonsWithinBox,
  RecordEvent_SwitchedMultipleMons,
  RecordEvent_SwitchedPartyMonForPCMon,
  RecordEvent_ObtainedStoryItem,
  RecordEvent_SoldItem,
  RecordEvent_UsedFieldMove,
  RecordEvent_UsedItem,
  RecordEvent_UsedPkmnCenter,
  QL_IsRoomToSaveEvent,
  ITEM_ESCAPE_ROPE,
  STEP_RECORDING_MODE_DISABLED,
  STEP_RECORDING_MODE_DISABLED_UNTIL_DEPART,
  QL_LoadAction_Input,
  QL_LoadAction_MovementOrGfxChange,
  QL_LoadAction_SceneEnd,
  QL_LoadAction_Wait,
  QL_LoadEvent,
  LoadEvent_DefeatedTrainer,
  LoadEvent_DefeatedChampion,
  LoadEvent_DefeatedWildMon,
  LoadEvent_GiveTakeHeldItem,
  LoadEvent_ItemIdOnly,
  LoadEvent_LinkBattled,
  LoadEvent_LinkTraded,
  LoadEvent_BoxPayload,
  LoadEvent_SwappedHeldItem,
  LoadEvent_UsedItem,
  LoadEvent_UsedPkmnCenter,
  QL_LoadEventHeader,
  QL_RecordAction_Input,
  QL_RecordAction_MovementOrGfxChange,
  QL_RecordAction_SceneEnd,
  QL_RecordAction_Wait,
  QL_ResetEventStates,
  QL_ResetRepeatEventTracker,
  QL_SkipCommand,
  QL_TryRepeatEvent,
  QL_TryRepeatEventHeader,
  QL_UpdateLastDepartedLocation,
  IsEventWithSpecialEncounterSpecies,
  IsLinkQuestLogEvent,
  IsSpeciesFromSpecialEncounter,
  QL_EnableRecordingSteps,
  ResetDeferredLinkEvent,
  SetQuestLogEvent,
  SetQuestLogEvent_Arrived,
  SetQLPlayedTheSlots,
  ShouldRegisterEvent_DepartedGameCorner,
  ShouldRegisterEvent_HandleDeparted,
  ShouldRegisterEvent_HandleBeatStoryTrainer,
  ShouldRegisterEvent_HandlePartyActions,
  SPECIES_ARTICUNO,
  SPECIES_DEOXYS,
  SPECIES_EGG,
  SPECIES_MEWTWO,
  SPECIES_SNORLAX,
  TRAINER_CLASS_BOSS,
  TRAINER_CLASS_CHAMPION,
  TRAINER_CLASS_RIVAL_EARLY,
  TranslateLinkPartnersName,
  TryDeferLinkEvent,
  TryDeferTrainerBattleEvent,
  RecordEventHeader,
  RecordQuestLogEventPayload,
  UpdateRepeatEventCounter,
  createEmptyQuestLogAction,
  createQuestLogEventsRuntime,
  getByte,
  readU16,
  setByte,
  sLoadEventFuncs,
  sRecordEventFuncs,
  sQuestLogEventCmdSizes,
  writeU16,
  LoadEventPayloadOffset
} from '../src/game/decompQuestLogEvents';

describe('decompQuestLogEvents', () => {
  it('QuestLog_GetSpeciesName copies regular species names and egg nickname for both write paths', () => {
    const runtime = createQuestLogEventsRuntime();

    expect(QuestLog_GetSpeciesName(runtime, 25, 1, 0)).toBe('SPECIES_25');
    expect(runtime.stringVars[1]).toBe('SPECIES_25');
    expect(QuestLog_GetSpeciesName(runtime, SPECIES_EGG, 2, 0)).toBe('EGG');
    expect(runtime.stringVars[2]).toBe('EGG');

    expect(QuestLog_GetSpeciesName(runtime, 133, null, 3)).toBe('SPECIES_133');
    expect(runtime.stringVars[3]).toBe('SPECIES_133');
    expect(QuestLog_GetSpeciesName(runtime, SPECIES_EGG, null, 0)).toBe('EGG');
    expect(runtime.stringVars[0]).toBe('EGG');
  });

  it('command sizes preserve the C table including headerless scene-end and wait actions', () => {
    expect(sQuestLogEventCmdSizes).toHaveLength(43);
    expect(sRecordEventFuncs).toHaveLength(43);
    expect(sLoadEventFuncs).toHaveLength(43);
    expect(sQuestLogEventCmdSizes[QL_EVENT_INPUT]).toBe(8);
    expect(sQuestLogEventCmdSizes[QL_EVENT_MOVEMENT]).toBe(8);
    expect(sQuestLogEventCmdSizes[QL_EVENT_USED_ITEM]).toBe(CMD_HEADER_SIZE + 6);
    expect(sQuestLogEventCmdSizes[QL_EVENT_DEFEATED_CHAMPION]).toBe(CMD_HEADER_SIZE + 6);
    expect(sQuestLogEventCmdSizes[QL_EVENT_SCENE_END]).toBe(2);
    expect(sQuestLogEventCmdSizes[QL_EVENT_WAIT]).toBe(4);
    expect(sRecordEventFuncs[QL_EVENT_INPUT]).toBeNull();
    expect(sRecordEventFuncs[QL_EVENT_USED_ITEM]).not.toBeNull();
    expect(sRecordEventFuncs[QL_EVENT_SCENE_END]).toBeNull();
    expect(sLoadEventFuncs[QL_EVENT_MOVEMENT]).toBeNull();
    expect(sLoadEventFuncs[QL_EVENT_LINK_TRADED]).not.toBeNull();
    expect(sLoadEventFuncs[QL_EVENT_WAIT]).toBeNull();
  });

  it('room check matches inclusive cursor <= end - size rule', () => {
    expect(QL_IsRoomToSaveEvent(0, 4, 0, 4)).toBe(true);
    expect(QL_IsRoomToSaveEvent(1, 4, 0, 4)).toBe(false);
    expect(QL_IsRoomToSaveEvent(-1, 4, 0, 8)).toBe(false);
    expect(QL_IsRoomToSaveEvent(4, 4, 0, 8)).toBe(true);
  });

  it('scene-end and wait actions record/load exact halfword layout', () => {
    const script = Array.from({ length: 16 }, () => 0xaa);
    const sceneAction = createEmptyQuestLogAction();
    const waitAction = createEmptyQuestLogAction();

    expect(QL_RecordAction_SceneEnd(script, 0, 0, script.length)).toBe(2);
    expect(readU16(script, 0)).toBe(QL_EVENT_SCENE_END);
    expect(QL_LoadAction_SceneEnd(script, 0, sceneAction, 0, script.length)).toBe(2);
    expect(sceneAction.type).toBe(QL_ACTION_SCENE_END);
    expect(sceneAction.duration).toBe(0);
    expect(sceneAction.data.raw).toEqual([0, 0, 0, 0]);

    expect(QL_RecordAction_Wait(script, 2, 0x3456, 0, script.length)).toBe(6);
    expect(readU16(script, 2)).toBe(QL_EVENT_WAIT);
    expect(readU16(script, 4)).toBe(0x3456);
    expect(QL_LoadAction_Wait(script, 2, waitAction, 0, script.length)).toBe(6);
    expect(waitAction.type).toBe(QL_ACTION_WAIT);
    expect(waitAction.duration).toBe(0x3456);
    expect(waitAction.data.raw).toEqual([0, 0, 0, 0]);
  });

  it('input action uses u16 header/duration then four raw bytes at script + 4', () => {
    const script = Array.from({ length: 12 }, () => 0);
    const action = createEmptyQuestLogAction({ type: QL_ACTION_INPUT, duration: 0x1234 });
    action.data.raw = [0x9a, 0xbc, 0xde, 0xf0];

    expect(QL_RecordAction_Input(script, 0, action, 0, script.length)).toBe(8);
    expect(script.slice(0, 8)).toEqual([QL_EVENT_INPUT, 0, 0x34, 0x12, 0x9a, 0xbc, 0xde, 0xf0]);

    const loaded = createEmptyQuestLogAction();
    expect(QL_LoadAction_Input(script, 0, loaded, 0, script.length)).toBe(8);
    expect(loaded.type).toBe(QL_ACTION_INPUT);
    expect(loaded.duration).toBe(0x1234);
    expect(loaded.data.raw).toEqual([0x9a, 0xbc, 0xde, 0xf0]);
  });

  it('movement/gfx action chooses event id by action type and loads non-movement as gfx', () => {
    const script = Array.from({ length: 20 }, () => 0);
    const movement = createEmptyQuestLogAction({ type: QL_ACTION_MOVEMENT, duration: 7 });
    movement.data.raw = [1, 2, 3, 4];
    const gfx = createEmptyQuestLogAction({ type: QL_ACTION_GFX_CHANGE, duration: 9 });
    gfx.data.raw = [5, 6, 7, 8];

    expect(QL_RecordAction_MovementOrGfxChange(script, 0, movement, 0, script.length)).toBe(8);
    expect(QL_RecordAction_MovementOrGfxChange(script, 8, gfx, 0, script.length)).toBe(16);
    expect(readU16(script, 0)).toBe(QL_EVENT_MOVEMENT);
    expect(readU16(script, 8)).toBe(QL_EVENT_GFX_CHANGE);

    const loadedMovement = createEmptyQuestLogAction();
    const loadedGfx = createEmptyQuestLogAction();
    QL_LoadAction_MovementOrGfxChange(script, 0, loadedMovement, 0, script.length);
    QL_LoadAction_MovementOrGfxChange(script, 8, loadedGfx, 0, script.length);
    expect(loadedMovement.type).toBe(QL_ACTION_MOVEMENT);
    expect(loadedMovement.duration).toBe(7);
    expect(loadedMovement.data.raw).toEqual([1, 2, 3, 4]);
    expect(loadedGfx.type).toBe(QL_ACTION_GFX_CHANGE);
    expect(loadedGfx.duration).toBe(9);
    expect(loadedGfx.data.raw).toEqual([5, 6, 7, 8]);
  });

  it('repeat tracker resets on new event/action and saturates one over max repeat', () => {
    const runtime = createQuestLogEventsRuntime({ gQuestLogCurActionIdx: 3 });

    UpdateRepeatEventCounter(runtime, QL_EVENT_USED_ITEM);
    expect(runtime.gQuestLogRepeatEventTracker).toEqual({ id: QL_EVENT_USED_ITEM, numRepeats: 0, counter: 3 });

    for (let i = 0; i < 8; i++)
      UpdateRepeatEventCounter(runtime, QL_EVENT_USED_ITEM);
    expect(runtime.gQuestLogRepeatEventTracker.numRepeats).toBe(MAX_CMD_REPEAT + 1);

    runtime.gQuestLogCurActionIdx = 4;
    UpdateRepeatEventCounter(runtime, QL_EVENT_USED_ITEM);
    expect(runtime.gQuestLogRepeatEventTracker).toEqual({ id: QL_EVENT_USED_ITEM, numRepeats: 0, counter: 4 });

    QL_ResetRepeatEventTracker(runtime);
    expect(runtime.gQuestLogRepeatEventTracker).toEqual({ id: 0, numRepeats: 0, counter: 0 });
  });

  it('RecordEventHeader writes first header and then appends repeat payload position using byte math', () => {
    const runtime = createQuestLogEventsRuntime({ gQuestLogCurActionIdx: 12 });
    const script = Array.from({ length: 64 }, () => 0);

    runtime.gQuestLogRepeatEventTracker.numRepeats = 0;
    expect(RecordEventHeader(runtime, script, QL_EVENT_USED_ITEM, 0, 0, script.length)).toBe(4);
    expect(readU16(script, 0)).toBe(QL_EVENT_USED_ITEM);
    expect(readU16(script, 2)).toBe(12);

    runtime.gQuestLogRepeatEventTracker.numRepeats = 2;
    expect(RecordEventHeader(runtime, script, QL_EVENT_USED_ITEM, 16, 0, script.length)).toBe(16);
    expect(readU16(script, 0)).toBe(QL_EVENT_USED_ITEM + (2 << QL_CMD_COUNT_SHIFT));
    expect(readU16(script, 2)).toBe(12);
  });

  it('RecordEventHeader with max+1 repeats shifts out oldest payload and returns replacement slot', () => {
    const runtime = createQuestLogEventsRuntime({
      gQuestLogCurActionIdx: 5,
      gQuestLogRepeatEventTracker: { id: QL_EVENT_USED_ITEM, numRepeats: MAX_CMD_REPEAT + 1, counter: 5 }
    });
    const script = Array.from({ length: 64 }, () => 0);
    const payloadSize = sQuestLogEventCmdSizes[QL_EVENT_USED_ITEM] - CMD_HEADER_SIZE;
    const dest = CMD_HEADER_SIZE + (MAX_CMD_REPEAT + 1) * payloadSize;

    for (let repeat = 0; repeat < MAX_CMD_REPEAT + 1; repeat++) {
      for (let j = 0; j < payloadSize; j++)
        script[CMD_HEADER_SIZE + repeat * payloadSize + j] = repeat * 10 + j;
    }

    expect(RecordEventHeader(runtime, script, QL_EVENT_USED_ITEM, dest, 0, script.length)).toBe(
      CMD_HEADER_SIZE + MAX_CMD_REPEAT * payloadSize
    );
    expect(readU16(script, 0)).toBe(QL_EVENT_USED_ITEM + (MAX_CMD_REPEAT << QL_CMD_COUNT_SHIFT));
    expect(readU16(script, 2)).toBe(5);
    expect(script.slice(CMD_HEADER_SIZE, CMD_HEADER_SIZE + payloadSize)).toEqual([10, 11, 12, 13, 14, 15]);
    expect(script.slice(CMD_HEADER_SIZE + 3 * payloadSize, CMD_HEADER_SIZE + 4 * payloadSize)).toEqual([40, 41, 42, 43, 44, 45]);
  });

  it('LoadEventPayloadOffset and skip command preserve repeated-command pointer calculations', () => {
    const runtime = createQuestLogEventsRuntime({ gQuestLogRepeatEventTracker: { id: QL_EVENT_USED_ITEM, numRepeats: 4, counter: 3 } });
    const payloadSize = sQuestLogEventCmdSizes[QL_EVENT_USED_ITEM] - CMD_HEADER_SIZE;
    expect(LoadEventPayloadOffset(runtime, QL_EVENT_USED_ITEM, 20)).toBe(20 + CMD_HEADER_SIZE + 3 * payloadSize);

    const script = Array.from({ length: 80 }, () => 0);
    writeU16(script, 10, QL_EVENT_USED_ITEM + (3 << QL_CMD_COUNT_SHIFT));
    const prev = { value: null as number | null };
    expect(QL_SkipCommand(script, 10, prev)).toBe(10 + sQuestLogEventCmdSizes[QL_EVENT_USED_ITEM] + payloadSize * 3);
    expect(prev.value).toBe(10);

    writeU16(script, 30, QL_EVENT_DEFEATED_CHAMPION + (3 << QL_CMD_COUNT_SHIFT));
    expect(QL_SkipCommand(script, 30, prev)).toBe(30 + sQuestLogEventCmdSizes[QL_EVENT_DEFEATED_CHAMPION]);

    writeU16(script, 40, QL_EVENT_INPUT);
    expect(QL_SkipCommand(script, 40, prev)).toBeNull();
  });

  it('departed-location, load-header, repeat-header, and event-state helpers match C globals', () => {
    const runtime = createQuestLogEventsRuntime({
      gQuestLogCurActionIdx: 9,
      sNewlyEnteredMap: true,
      sLastDepartedLocation: 7,
      sPlayedTheSlots: true
    });
    const script = Array.from({ length: 24 }, () => 0);

    writeU16(script, 0, QL_EVENT_DEPARTED);
    script[5] = 3;
    QL_UpdateLastDepartedLocation(runtime, script, 0);
    expect(runtime.sLastDepartedLocation).toBe(4);
    writeU16(script, 0, QL_EVENT_USED_ITEM);
    QL_UpdateLastDepartedLocation(runtime, script, 0);
    expect(runtime.sLastDepartedLocation).toBe(0);

    QL_ResetEventStates(runtime);
    expect(runtime.sNewlyEnteredMap).toBe(false);
    expect(runtime.sLastDepartedLocation).toBe(0);
    expect(runtime.sPlayedTheSlots).toBe(false);

    writeU16(script, 8, QL_EVENT_USED_ITEM + (2 << QL_CMD_COUNT_SHIFT));
    writeU16(script, 10, 10);
    expect(QL_LoadEventHeader(runtime, script, 8)).toBe(false);
    writeU16(script, 10, 9);
    expect(QL_LoadEventHeader(runtime, script, 8)).toBe(true);
    expect(runtime.gQuestLogRepeatEventTracker).toEqual({ id: QL_EVENT_USED_ITEM, numRepeats: 2, counter: 1 });

    expect(QL_TryRepeatEventHeader(runtime)).toBe(true);
    expect(runtime.gQuestLogRepeatEventTracker.counter).toBe(2);
    expect(QL_TryRepeatEventHeader(runtime)).toBe(true);
    expect(runtime.gQuestLogRepeatEventTracker).toEqual({ id: 0, numRepeats: 0, counter: 0 });
    expect(QL_TryRepeatEventHeader(runtime)).toBe(false);
  });

  it('QL_LoadEvent and QL_TryRepeatEvent dispatch through the C load table with u8 tracker id truncation', () => {
    const runtime = createQuestLogEventsRuntime({ gQuestLogCurActionIdx: 5 });
    const script = Array.from({ length: 32 }, () => 0);

    writeU16(script, 0, QL_EVENT_USED_ITEM + (1 << QL_CMD_COUNT_SHIFT));
    writeU16(script, 2, 5);
    writeU16(script, 4, 11);
    writeU16(script, 6, 0xffff);
    writeU16(script, 8, 0xffff);
    writeU16(script, 10, 12);
    writeU16(script, 12, 25);
    writeU16(script, 14, 0xffff);

    expect(QL_LoadEvent(runtime, script, 0)).toBe(true);
    expect(runtime.gQuestLogRepeatEventTracker).toEqual({ id: QL_EVENT_USED_ITEM, numRepeats: 1, counter: 1 });
    expect(runtime.loadedEventText).toBe('UsedTheItem');
    expect(runtime.stringVars[0]).toBe('ITEM_11');

    expect(QL_TryRepeatEvent(runtime, script, 0)).toBe(true);
    expect(runtime.gQuestLogRepeatEventTracker).toEqual({ id: 0, numRepeats: 0, counter: 0 });
    expect(runtime.loadedEventText).toBe('UsedItemOnMonAtThisLocation');
    expect(runtime.stringVars.slice(0, 2)).toEqual(['ITEM_12', 'SPECIES_25']);
  });

  it('item and held-item event payload serializers match C halfword layouts and side effects', () => {
    const runtime = createQuestLogEventsRuntime({ gQuestLogCurActionIdx: 6 });
    const script = Array.from({ length: 80 }, () => 0);

    expect(RecordEvent_UsedItem(runtime, script, 0, { itemId: ITEM_ESCAPE_ROPE, species: 25, itemParam: 9 }, 0, script.length * 2)).toBe(10);
    expect(readU16(script, 0)).toBe(QL_EVENT_USED_ITEM);
    expect(readU16(script, 2)).toBe(6);
    expect([readU16(script, 4), readU16(script, 6), readU16(script, 8)]).toEqual([ITEM_ESCAPE_ROPE, 25, 9]);
    expect(runtime.sStepRecordingMode).toBe(STEP_RECORDING_MODE_DISABLED_UNTIL_DEPART);
    expect(LoadEvent_UsedItem(runtime, script, 0)).toBe(10);
    expect(runtime.loadedEventText).toBe('UsedEscapeRope');
    expect(runtime.stringVars.slice(0, 2)).toEqual([`ITEM_${ITEM_ESCAPE_ROPE}`, 'MAPSEC_9']);

    expect(RecordEvent_GaveHeldItemFromPartyMenu(runtime, script, 10, { itemId: 50, species: 133 }, 0, script.length * 2)).toBe(18);
    expect([readU16(script, 10), readU16(script, 12), readU16(script, 14), readU16(script, 16)]).toEqual([QL_EVENT_GAVE_HELD_ITEM, 6, 50, 133]);
    expect(LoadEvent_GiveTakeHeldItem(runtime, script, 10, QL_EVENT_GAVE_HELD_ITEM, 'GaveMonHeldItem')).toBe(18);
    expect(runtime.stringVars.slice(0, 2)).toEqual(['SPECIES_133', 'ITEM_50']);

    expect(RecordEvent_SwappedHeldItemFromBag(runtime, script, 18, { takenItemId: 1, givenItemId: 2, species: 3 }, 0, script.length * 2)).toBe(28);
    expect([readU16(script, 22), readU16(script, 24), readU16(script, 26)]).toEqual([1, 2, 3]);
    expect(LoadEvent_SwappedHeldItem(runtime, script, 18)).toBe(28);
    expect(runtime.stringVars.slice(0, 3)).toEqual(['SPECIES_3', 'ITEM_1', 'ITEM_2']);

    expect(RecordEvent_DepositedItemInPC(runtime, script, 28, { itemId: 77, species: 0 }, 0, script.length * 2)).toBe(34);
    expect([readU16(script, 28), readU16(script, 30), readU16(script, 32)]).toEqual([QL_EVENT_DEPOSITED_ITEM_PC, 6, 77]);
    expect(LoadEvent_ItemIdOnly(runtime, script, 28, QL_EVENT_DEPOSITED_ITEM_PC, 'StoredItemInPC')).toBe(34);
    expect(runtime.stringVars[0]).toBe('ITEM_77');
  });

  it('used-item loader selects the same quest-log text branch as ItemId_GetPocket', () => {
    const runtime = createQuestLogEventsRuntime({ gQuestLogCurActionIdx: 1 });
    const script = Array.from({ length: 64 }, () => 0);
    const context = {
      itemPocketById: (itemId: number): number => itemId === 10 ? POCKET_KEY_ITEMS : itemId >= 300 ? POCKET_TM_CASE : POCKET_BERRY_POUCH,
      itemToMoveId: (itemId: number): number => itemId + 1000
    };

    expect(RecordEvent_UsedItem(runtime, script, 0, { itemId: 1, species: 0xffff, itemParam: 0xffff }, 0, script.length * 2)).toBe(10);
    expect(LoadEvent_UsedItem(runtime, script, 0, context)).toBe(10);
    expect(runtime.loadedEventText).toBe('UsedTheItem');
    expect(runtime.stringVars[0]).toBe('ITEM_1');

    expect(RecordEvent_UsedItem(runtime, script, 10, { itemId: 10, species: 0xffff, itemParam: 0xffff }, 0, script.length * 2)).toBe(20);
    expect(LoadEvent_UsedItem(runtime, script, 10, context)).toBe(20);
    expect(runtime.loadedEventText).toBe('UsedTheKeyItem');

    expect(RecordEvent_UsedItem(runtime, script, 20, { itemId: 300, species: 25, itemParam: 99 }, 0, script.length * 2)).toBe(30);
    expect(LoadEvent_UsedItem(runtime, script, 20, context)).toBe(30);
    expect(runtime.loadedEventText).toBe('MonReplacedMoveWithTM');
    expect(runtime.stringVars).toEqual(['SPECIES_25', 'MOVE_1300', 'MOVE_99', '']);

    expect(RecordEvent_UsedItem(runtime, script, 30, { itemId: ITEM_HM01, species: 6, itemParam: 0xffff }, 0, script.length * 2)).toBe(40);
    expect(LoadEvent_UsedItem(runtime, script, 30, context)).toBe(40);
    expect(runtime.loadedEventText).toBe('MonLearnedMoveFromHM');
    expect(runtime.stringVars.slice(0, 2)).toEqual(['SPECIES_6', `MOVE_${ITEM_HM01 + 1000}`]);
  });

  it('link trade and battle serializers preserve unaligned byte-name layouts', () => {
    const runtime = createQuestLogEventsRuntime({ gQuestLogCurActionIdx: 4, playerName: 'LEAF' });
    const script = Array.from({ length: 80 }, () => 0);

    expect(RecordEvent_LinkTraded(runtime, script, 0, { speciesSent: 1, speciesReceived: 2, partnerName: 'BLUE' })).toBe(16);
    expect([readU16(script, 0), readU16(script, 2), readU16(script, 4), readU16(script, 6)]).toEqual([QL_EVENT_LINK_TRADED, 4, 1, 2]);
    expect(Array.from({ length: 7 }, (_, i) => getByte(script, 8 + i))).toEqual([66, 76, 85, 69, 0xff, 0xff, 0xff]);
    setByte(script, 15, 88);
    expect(LoadEvent_LinkTraded(runtime, script, 0)).toBe(16);
    expect(runtime.stringVars).toEqual(['BLUE', 'SPECIES_2', 'SPECIES_1', '']);

    expect(RecordEvent_LinkBattledSingle(runtime, script, 16, { outcome: 2, playerNames: ['RED'] })).toBe(28);
    expect([readU16(script, 16), readU16(script, 18), getByte(script, 20)]).toEqual([QL_EVENT_LINK_BATTLED_SINGLE, 4, 2]);
    expect(Array.from({ length: 7 }, (_, i) => getByte(script, 21 + i))).toEqual([82, 69, 68, 0xff, 0xff, 0xff, 0xff]);
    expect(LoadEvent_LinkBattled(runtime, script, 16, QL_EVENT_LINK_BATTLED_SINGLE, 1)).toBe(28);
    expect(runtime.stringVars.slice(0, 2)).toEqual(['RED', 'OUTCOME_2']);

    expect(RecordEvent_LinkBattledMulti(runtime, script, 28, { outcome: 1, playerNames: ['A', 'B', 'C'] })).toBe(54);
    expect(readU16(script, 28)).toBe(QL_EVENT_LINK_BATTLED_MULTI);
    expect(getByte(script, 32)).toBe(1);
    expect([getByte(script, 33), getByte(script, 40), getByte(script, 47)]).toEqual([65, 66, 67]);
    expect(LoadEvent_LinkBattled(runtime, script, 28, QL_EVENT_LINK_BATTLED_MULTI, 3)).toBe(54);
    expect(runtime.stringVars).toEqual(['LEAF', 'A', 'B', 'C', 'OUTCOME_1']);

    expect(RecordQuestLogEventPayload(runtime, script, QL_EVENT_SWITCHED_MONS_BETWEEN_BOXES, 54, { species1: 7, species2: 8, box1: 9, box2: 10 }, 0, script.length * 2)).toBe(64);
    expect([readU16(script, 54), readU16(script, 58), readU16(script, 60), getByte(script, 62), getByte(script, 63)]).toEqual([QL_EVENT_SWITCHED_MONS_BETWEEN_BOXES, 7, 8, 9, 10]);
  });

  it('TranslateLinkPartnersName mutates JPN control-code names exactly like the C pointer loop', () => {
    const fiveCharName = [EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_JPN, 65, 66, 67, 68, 69, 0, 0, 0];
    TranslateLinkPartnersName(fiveCharName);
    expect(fiveCharName).toEqual([EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_JPN, 65, 66, 67, 68, 69, EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_ENG, EOS]);

    const earlyControlCode = [EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_JPN, 65, 66, EXT_CTRL_CODE_BEGIN, 0, 0, 0];
    TranslateLinkPartnersName(earlyControlCode);
    expect(earlyControlCode).toEqual([EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_JPN, 65, 66, EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_ENG, EOS, 0]);

    const englishName = [EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_ENG, 65, 66, 67, 0, 0, 0];
    TranslateLinkPartnersName(englishName);
    expect(englishName).toEqual([EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_ENG, 65, 66, 67, 0, 0, 0]);
  });

  it('box, trainer, pokemon-center, and wild-battle payloads keep C byte packing', () => {
    const runtime = createQuestLogEventsRuntime({ gQuestLogCurActionIdx: 11 });
    const script = Array.from({ length: 96 }, () => 0);

    expect(RecordEvent_UsedPkmnCenter(runtime, script, 0, 0, script.length * 2)).toBe(4);
    expect([readU16(script, 0), readU16(script, 2)]).toEqual([QL_EVENT_USED_PKMN_CENTER, 11]);
    runtime.gQuestLogRepeatEventTracker = { id: QL_EVENT_USED_PKMN_CENTER, numRepeats: 1, counter: 11 };
    expect(RecordEvent_UsedPkmnCenter(runtime, script, 4, 0, script.length * 2)).toBe(4);
    expect(LoadEvent_UsedPkmnCenter(runtime, script, 0)).toBe(4);
    expect(runtime.loadedEventText).toBe('MonsWereFullyRestoredAtCenter');

    runtime.gQuestLogRepeatEventTracker = { id: 0, numRepeats: 0, counter: 0 };
    expect(RecordEvent_SwitchedMonsBetweenBoxes(runtime, script, 4, { species1: 10, species2: 20, box1: 1, box2: 2 }, 0, script.length * 2)).toBe(14);
    expect([readU16(script, 8), readU16(script, 10), getByte(script, 12), getByte(script, 13)]).toEqual([10, 20, 1, 2]);
    expect(LoadEvent_BoxPayload(runtime, script, 4, QL_EVENT_SWITCHED_MONS_BETWEEN_BOXES, 6)).toBe(14);
    expect(runtime.stringVars).toEqual(['BOX_1', 'SPECIES_10', 'BOX_2', 'SPECIES_20']);

    const eventData = Array.from({ length: 4 }, () => 0);
    writeU16(eventData, 0, 30);
    writeU16(eventData, 2, 40);
    setByte(eventData, 4, 14);
    setByte(eventData, 5, 7);
    expect(RecordEvent_SwitchedMonsWithinBox(runtime, script, 14, eventData, 0, script.length * 2)).toBe(24);
    expect(LoadEvent_BoxPayload(runtime, script, 14, QL_EVENT_SWITCHED_MONS_WITHIN_BOX, 6)).toBe(24);
    expect(runtime.stringVars).toEqual(['BOX_14', 'SPECIES_30', 'SPECIES_40', '']);

    expect(RecordEvent_SwitchedPartyMonForPCMon(runtime, script, 24, eventData, 0, script.length * 2)).toBe(34);
    expect([readU16(script, 28), readU16(script, 30), getByte(script, 32)]).toEqual([40, 30, 7]);
    expect(LoadEvent_BoxPayload(runtime, script, 24, QL_EVENT_SWITCHED_PARTY_MON_FOR_PC_MON, 6)).toBe(34);
    expect(runtime.stringVars).toEqual(['BOX_7', 'SPECIES_40', 'SPECIES_30', '']);

    writeU16(eventData, 0, 55);
    setByte(eventData, 4, 3);
    setByte(eventData, 5, 4);
    expect(RecordEvent_MovedMonBetweenBoxes(runtime, script, 34, eventData, 0, script.length * 2)).toBe(42);
    expect([readU16(script, 38), getByte(script, 40), getByte(script, 41)]).toEqual([55, 3, 4]);
    expect(LoadEvent_BoxPayload(runtime, script, 34, QL_EVENT_MOVED_MON_BETWEEN_BOXES, 4)).toBe(42);
    expect(runtime.stringVars).toEqual(['BOX_3', 'SPECIES_55', 'BOX_4', '']);

    expect(RecordEvent_MovedMonWithinBox(runtime, script, 42, eventData, 0, script.length * 2)).toBe(50);
    expect(LoadEvent_BoxPayload(runtime, script, 42, QL_EVENT_MOVED_MON_WITHIN_BOX, 4)).toBe(50);
    expect(runtime.stringVars).toEqual(['BOX_3', 'SPECIES_55', '', '']);

    expect(RecordEvent_SwitchedMultipleMons(runtime, script, 50, eventData, 0, script.length * 2)).toBe(56);
    expect(LoadEvent_BoxPayload(runtime, script, 50, QL_EVENT_SWITCHED_MULTIPLE_MONS, 2)).toBe(56);
    expect(runtime.stringVars).toEqual(['BOX_3', 'BOX_4', '', '']);

    expect(RecordEvent_DefeatedGymLeader(runtime, script, 56, { speciesOpponent: 1, speciesPlayer: 2, trainerId: 3, mapSec: 4, hpFractionId: 5 }, 0, script.length * 2)).toBe(68);
    expect(runtime.sStepRecordingMode).toBe(STEP_RECORDING_MODE_DISABLED);
    expect([readU16(script, 60), readU16(script, 62), readU16(script, 64), getByte(script, 66), getByte(script, 67)]).toEqual([1, 2, 3, 4, 5]);
    expect(LoadEvent_DefeatedTrainer(runtime, script, 56, QL_EVENT_DEFEATED_GYM_LEADER, 'GymLeader')).toBe(68);
    expect(runtime.stringVars).toEqual(['MAPSEC_4', 'TRAINER_3', 'SPECIES_1', 'SPECIES_2', 'FLAVOR_5']);

    expect(RecordEvent_DefeatedNormalTrainer(runtime, script, 68, { speciesOpponent: 11, speciesPlayer: 12, trainerId: 13, mapSec: 14, hpFractionId: 1 }, 0, script.length * 2)).toBe(80);
    expect(LoadEvent_DefeatedTrainer(runtime, script, 68, QL_EVENT_DEFEATED_E4_MEMBER, 'EliteFourMember')).toBe(80);
    expect(runtime.loadedEventText).toBe('TookOnEliteFoursMonWithMonAndWon');
    expect(runtime.stringVars).toEqual(['TRAINER_13', 'SPECIES_11', 'SPECIES_12', 'FLAVOR_1']);

    expect(RecordEvent_DefeatedWildMon(runtime, script, 80, { defeatedSpecies: 100, caughtSpecies: 0, mapSec: 9 }, 0, script.length * 2)).toBe(92);
    expect(RecordEvent_DefeatedWildMon(runtime, script, 80, { defeatedSpecies: 0, caughtSpecies: 101, mapSec: 9 }, 0, script.length * 2)).toBe(92);
    expect([readU16(script, 84), readU16(script, 86), getByte(script, 88), getByte(script, 89), getByte(script, 90)]).toEqual([100, 101, 1, 1, 9]);
    expect(LoadEvent_DefeatedWildMon(runtime, script, 80)).toBe(92);
    expect(runtime.stringVars).toEqual(['MAPSEC_9', 'SPECIES_100', '1', 'SPECIES_101', '1', 'PLAYER']);
  });

  it('wild battle and champion loaders pick the same text variants as the C counters', () => {
    const runtime = createQuestLogEventsRuntime({ gQuestLogCurActionIdx: 1, playerName: 'RED', rivalName: 'BLUE' });
    const script = Array.from({ length: 96 }, () => 0);

    expect(RecordEvent_DefeatedWildMon(runtime, script, 0, { defeatedSpecies: 0, caughtSpecies: 25, mapSec: 3 }, 0, script.length * 2)).toBe(12);
    expect(LoadEvent_DefeatedWildMon(runtime, script, 0)).toBe(12);
    expect(runtime.loadedEventText).toBe('CaughtWildMon');

    expect(RecordEvent_DefeatedWildMon(runtime, script, 12, { defeatedSpecies: 25, caughtSpecies: 0, mapSec: 3 }, 0, script.length * 2)).toBe(24);
    expect(LoadEvent_DefeatedWildMon(runtime, script, 12)).toBe(24);
    expect(runtime.loadedEventText).toBe('DefeatedWildMon');

    expect(RecordEvent_DefeatedWildMon(runtime, script, 24, { defeatedSpecies: 25, caughtSpecies: 0, mapSec: 3 }, 0, script.length * 2)).toBe(36);
    expect(RecordEvent_DefeatedWildMon(runtime, script, 24, { defeatedSpecies: 0, caughtSpecies: 26, mapSec: 3 }, 0, script.length * 2)).toBe(36);
    expect(RecordEvent_DefeatedWildMon(runtime, script, 24, { defeatedSpecies: 0, caughtSpecies: 27, mapSec: 3 }, 0, script.length * 2)).toBe(36);
    expect(LoadEvent_DefeatedWildMon(runtime, script, 24)).toBe(36);
    expect(runtime.loadedEventText).toBe('DefeatedWildMonAndCaughtWildMons');

    expect(RecordEvent_DefeatedChampion(runtime, script, 36, { speciesOpponent: 6, speciesPlayer: 25, trainerId: 0, mapSec: 0, hpFractionId: 2 }, 0, script.length * 2)).toBe(46);
    runtime.gQuestLogRepeatEventTracker.counter = 0;
    expect(LoadEvent_DefeatedChampion(runtime, script, 36)).toBe(46);
    expect(runtime.loadedEventText).toBe('PlayerBattledChampionRival');
    expect(runtime.stringVars.slice(0, 2)).toEqual(['RED', 'BLUE']);
    runtime.gQuestLogRepeatEventTracker.counter = 1;
    expect(LoadEvent_DefeatedChampion(runtime, script, 36)).toBe(46);
    expect(runtime.loadedEventText).toBe('PlayerSentOutMon1RivalSentOutMon2');
    expect(runtime.stringVars).toEqual(['BLUE', 'SPECIES_6', 'RED', 'SPECIES_25']);
    runtime.gQuestLogRepeatEventTracker.counter = 2;
    expect(LoadEvent_DefeatedChampion(runtime, script, 36)).toBe(46);
    expect(runtime.loadedEventText).toBe('WonTheMatchAsAResult');
    expect(runtime.stringVars[0]).toBe('CHAMPION_FLAVOR_2');
  });

  it('champion and normal trainer recorders preserve their special C step and repeat behavior', () => {
    const runtime = createQuestLogEventsRuntime({ gQuestLogCurActionIdx: 12 });
    const script = Array.from({ length: 64 }, () => 0);

    expect(RecordEvent_DefeatedChampion(runtime, script, 0, { speciesOpponent: 6, speciesPlayer: 25, trainerId: 99, mapSec: 7, hpFractionId: 2 }, 0, script.length * 2)).toBe(10);
    expect(readU16(script, 0) & QL_CMD_COUNT_MASK).toBe(2 << QL_CMD_COUNT_SHIFT);
    expect(readU16(script, 0) & 0x0fff).toBe(QL_EVENT_DEFEATED_CHAMPION);
    expect([readU16(script, 2), readU16(script, 4), readU16(script, 6), getByte(script, 8), getByte(script, 9)]).toEqual([12, 6, 25, 2, 0]);
    expect(runtime.sStepRecordingMode).toBe(STEP_RECORDING_MODE_DISABLED);

    runtime.sStepRecordingMode = 0;
    expect(RecordEvent_DefeatedNormalTrainer(runtime, script, 10, { speciesOpponent: 1, speciesPlayer: 2, trainerId: 3, mapSec: 4, hpFractionId: 5 }, 0, script.length * 2)).toBe(22);
    expect([readU16(script, 10), readU16(script, 12), readU16(script, 14), readU16(script, 16), readU16(script, 18), getByte(script, 20), getByte(script, 21)]).toEqual([34, 12, 1, 2, 3, 4, 5]);
    expect(runtime.sStepRecordingMode).toBe(STEP_RECORDING_MODE_DISABLED);
  });

  it('departed, field-move, shop, story-item, and arrived payloads match C packing', () => {
    const runtime = createQuestLogEventsRuntime({ gQuestLogCurActionIdx: 9 });
    const script = Array.from({ length: 128 }, () => 0);

    expect(RecordEvent_DepartedLocation(runtime, script, 0, { mapSec: 44, locationId: QL_LOCATION_SAFARI_ZONE }, 0, script.length * 2)).toBe(6);
    expect([readU16(script, 0), readU16(script, 2), getByte(script, 4), getByte(script, 5)]).toEqual([QL_EVENT_DEPARTED, 9, 44, QL_LOCATION_SAFARI_ZONE]);
    expect(runtime.sStepRecordingMode).toBe(STEP_RECORDING_MODE_DISABLED);
    expect(LoadEvent_DepartedLocation(runtime, script, 0)).toBe(6);
    expect(runtime.loadedEventText).toBe('HadGreatTimeInSafariZone');
    expect(runtime.stringVars.slice(0, 2)).toEqual(['MAPSEC_44', `QL_LOCATION_${QL_LOCATION_SAFARI_ZONE}`]);

    expect(RecordEvent_UsedFieldMove(runtime, script, 6, { species: 25, fieldMove: FIELD_MOVE_DIG, mapSec: 88 }, 0, script.length * 2)).toBe(14);
    expect([readU16(script, 10), getByte(script, 12), getByte(script, 13)]).toEqual([25, FIELD_MOVE_DIG, 88]);
    expect(runtime.sStepRecordingMode).toBe(STEP_RECORDING_MODE_DISABLED_UNTIL_DEPART);
    expect(LoadEvent_UsedFieldMove(runtime, script, 6)).toBe(14);
    expect(runtime.loadedEventText).toBe('UsedDigInLocation');
    expect(runtime.stringVars.slice(0, 3)).toEqual(['SPECIES_25', 'MAPSEC_88', '']);

    expect(RecordEvent_UsedFieldMove(runtime, script, 14, { species: 133, fieldMove: FIELD_MOVE_TELEPORT, mapSec: MAPSEC_PALLET_TOWN }, 0, script.length * 2)).toBe(22);
    expect(LoadEvent_UsedFieldMove(runtime, script, 14)).toBe(22);
    expect(runtime.loadedEventText).toBe('UsedTeleportToLocation');
    expect(runtime.stringVars.slice(0, 3)).toEqual(['SPECIES_133', `MAPSEC_${MAPSEC_PALLET_TOWN}`, 'Home']);

    expect(RecordEvent_BoughtItem(runtime, script, 22, { lastItemId: 100, itemQuantity: 3, totalMoney: 0x12345678, mapSec: 12, hasMultipleTransactions: false }, 0, script.length * 2)).toBe(36);
    expect([readU16(script, 26), readU16(script, 28), readU16(script, 30), readU16(script, 32), getByte(script, 34), getByte(script, 35)]).toEqual([100, 3, 0x1234, 0x5678, 12, 1]);
    expect(LoadEvent_Shop(runtime, script, 22, QL_EVENT_BOUGHT_ITEM, 'BoughtItem')).toBe(36);
    expect(runtime.loadedEventText).toBe('BoughtItemsIncludingItem');
    expect(runtime.stringVars).toEqual(['MAPSEC_12', 'ITEM_100', `${0x12345678}`, '']);

    expect(RecordEvent_SoldItem(runtime, script, 36, { lastItemId: 101, itemQuantity: 1, totalMoney: 0x00020003, mapSec: 13, hasMultipleTransactions: false }, 0, script.length * 2)).toBe(50);
    expect([readU16(script, 40), readU16(script, 42), readU16(script, 44), readU16(script, 46), getByte(script, 48), getByte(script, 49)]).toEqual([101, 1, 2, 3, 13, 0]);
    expect(LoadEvent_Shop(runtime, script, 36, QL_EVENT_SOLD_ITEM, 'SoldItem')).toBe(50);
    expect(runtime.loadedEventText).toBe('SoldNumOfItem');
    expect(runtime.stringVars).toEqual(['PLAYER', 'MAPSEC_13', 'ITEM_101', 'JustOne']);

    expect(RecordEvent_ObtainedStoryItem(runtime, script, 50, { itemId: 200, mapSec: 14 }, 0, script.length * 2)).toBe(58);
    expect([readU16(script, 54), getByte(script, 56), getByte(script, 57)]).toEqual([200, 14, 0]);
    expect(LoadEvent_ObtainedStoryItem(runtime, script, 50)).toBe(58);
    expect(runtime.stringVars.slice(0, 2)).toEqual(['MAPSEC_14', 'ITEM_200']);

    expect(RecordEvent_ArrivedInLocation(runtime, script, 58, 15, 0, script.length * 2)).toBe(64);
    expect([readU16(script, 58), readU16(script, 60), readU16(script, 62)]).toEqual([QL_EVENT_ARRIVED, 9, 15]);
    expect(LoadEvent_ArrivedInLocation(runtime, script, 58)).toBe(64);
    expect(runtime.stringVars[0]).toBe('MAPSEC_15');
  });

  it('departed filtering and world-map entry flags mirror quest_log_events.c state updates', () => {
    const runtime = createQuestLogEventsRuntime();

    expect(ShouldRegisterEvent_HandleDeparted(runtime, QL_EVENT_DEPARTED, { mapSec: 1, locationId: 4 })).toBe(true);
    expect(runtime.sLastDepartedLocation).toBe(5);
    expect(ShouldRegisterEvent_HandleDeparted(runtime, QL_EVENT_DEPARTED, { mapSec: 1, locationId: 4 })).toBe(false);
    expect(ShouldRegisterEvent_HandleDeparted(runtime, QL_EVENT_USED_ITEM, { mapSec: 1, locationId: 4 })).toBe(true);
    expect(runtime.sLastDepartedLocation).toBe(0);

    expect(ShouldRegisterEvent_DepartedGameCorner(runtime, QL_EVENT_DEPARTED, { mapSec: 1, locationId: QL_LOCATION_GAME_CORNER })).toBe(false);
    SetQLPlayedTheSlots(runtime);
    expect(ShouldRegisterEvent_DepartedGameCorner(runtime, QL_EVENT_DEPARTED, { mapSec: 1, locationId: QL_LOCATION_GAME_CORNER })).toBe(true);
    expect(runtime.sPlayedTheSlots).toBe(false);

    QuestLog_RecordEnteredMap(runtime, 20, () => false, [10, 20, 30]);
    expect(runtime.sNewlyEnteredMap).toBe(true);
    QuestLog_RecordEnteredMap(runtime, 20, () => true, [10, 20, 30]);
    expect(runtime.sNewlyEnteredMap).toBe(false);
    QuestLog_RecordEnteredMap(runtime, 99, () => false, [10, 20, 30]);
    expect(runtime.sNewlyEnteredMap).toBe(false);

    runtime.sNewlyEnteredMap = false;
    QuestLog_RecordEnteredMap(runtime, 20, () => false, [10, 20, 30], QL_STATE_PLAYBACK);
    expect(runtime.sNewlyEnteredMap).toBe(false);
    QuestLog_RecordEnteredMap(runtime, 20, () => false, [10, 20, 30], QL_STATE_PLAYBACK_LAST);
    expect(runtime.sNewlyEnteredMap).toBe(false);
  });

  it('deferred link events copy only the C event data that needs to survive until recording resumes', () => {
    const runtime = createQuestLogEventsRuntime({ gQuestLogCurActionIdx: 3, gQuestLogRecordingPointer: 0, sLastDepartedLocation: 8 });
    const script = Array.from({ length: 64 }, () => 0);
    const trade = { speciesSent: 1, speciesReceived: 2, partnerName: 'BLUE' };

    expect(IsLinkQuestLogEvent(QL_EVENT_LINK_TRADED)).toBe(true);
    expect(IsLinkQuestLogEvent(QL_EVENT_DEFEATED_TRAINER)).toBe(false);
    expect(TryDeferLinkEvent(runtime, QL_EVENT_LINK_TRADED_UNION, trade)).toBe(true);
    trade.speciesSent = 9;
    expect(runtime.sDeferredEvent).toEqual({ id: QL_EVENT_LINK_TRADED_UNION, data: { speciesSent: 1, speciesReceived: 2, partnerName: 'BLUE' } });

    expect(QuestLog_StartRecordingInputsAfterDeferredEvent(runtime, script, 0, script.length * 2)).toBe(16);
    expect(runtime.sLastDepartedLocation).toBe(0);
    expect(runtime.recordedActions).toEqual([QL_EVENT_LINK_TRADED_UNION]);
    expect([readU16(script, 0), readU16(script, 2), readU16(script, 4), readU16(script, 6)]).toEqual([QL_EVENT_LINK_TRADED_UNION, 3, 1, 2]);
    expect(runtime.sDeferredEvent).toEqual({ id: 0, data: null });

    expect(TryDeferLinkEvent(runtime, QL_EVENT_USED_UNION_ROOM_CHAT, { outcome: 1, playerNames: ['A'] })).toBe(true);
    expect(runtime.sDeferredEvent).toEqual({ id: QL_EVENT_USED_UNION_ROOM_CHAT, data: null });
    ResetDeferredLinkEvent(runtime);
    expect(runtime.sDeferredEvent.id).toBe(0);
    expect(TryDeferLinkEvent(runtime, QL_EVENT_DEFEATED_TRAINER, null)).toBe(false);
  });

  it('trainer battle deferral and end-battle handler follow quest_log_events.c replay gates', () => {
    const trainerClasses = new Map<number, number>([
      [1, 0],
      [2, TRAINER_CLASS_RIVAL_EARLY],
      [3, TRAINER_CLASS_CHAMPION],
      [4, TRAINER_CLASS_BOSS]
    ]);
    const getTrainerClass = (trainerId: number): number => trainerClasses.get(trainerId) ?? 0;
    const runtime = createQuestLogEventsRuntime({ gQuestLogCurActionIdx: 5, gQuestLogRecordingPointer: 0, sLastDepartedLocation: 7 });
    const script = Array.from({ length: 64 }, () => 0);
    const normalTrainer = { speciesOpponent: 10, speciesPlayer: 20, trainerId: 1, mapSec: 30, hpFractionId: 2 };

    expect(ShouldRegisterEvent_HandleBeatStoryTrainer(QL_EVENT_DEFEATED_TRAINER, normalTrainer, getTrainerClass)).toBe(true);
    expect(ShouldRegisterEvent_HandleBeatStoryTrainer(QL_EVENT_DEFEATED_TRAINER, { ...normalTrainer, trainerId: 2 }, getTrainerClass)).toBe(false);
    expect(ShouldRegisterEvent_HandleBeatStoryTrainer(QL_EVENT_DEFEATED_TRAINER, { ...normalTrainer, trainerId: 3 }, getTrainerClass)).toBe(false);
    expect(ShouldRegisterEvent_HandleBeatStoryTrainer(QL_EVENT_DEFEATED_TRAINER, { ...normalTrainer, trainerId: 4 }, getTrainerClass)).toBe(false);

    expect(TryDeferTrainerBattleEvent(runtime, QL_EVENT_DEFEATED_TRAINER, normalTrainer, QL_PLAYBACK_STATE_STOPPED, false, getTrainerClass)).toBe(true);
    expect(runtime.sDeferredEvent).toEqual({ id: 0, data: null });

    expect(TryDeferTrainerBattleEvent(runtime, QL_EVENT_DEFEATED_TRAINER, { ...normalTrainer, trainerId: 2 }, QL_PLAYBACK_STATE_STOPPED, false, getTrainerClass)).toBe(true);
    expect(runtime.sDeferredEvent.id).toBe(QL_EVENT_DEFEATED_TRAINER);
    expect(QuestLogEvents_HandleEndTrainerBattle(runtime, script, QL_PLAYBACK_STATE_STOPPED, 0, script.length * 2)).toBe(16);
    expect(runtime.recordedActions).toEqual([QL_EVENT_DEFEATED_TRAINER]);
    expect(runtime.finishedRecordingScenes).toBe(1);
    expect(runtime.gQuestLogCurActionIdx).toBe(6);
    expect(runtime.sLastDepartedLocation).toBe(0);
    expect([readU16(script, 0), readU16(script, 2), readU16(script, 4), readU16(script, 6), readU16(script, 8), getByte(script, 10), getByte(script, 11)]).toEqual([QL_EVENT_DEFEATED_TRAINER, 5, 10, 20, 2, 30, 2]);
    expect([readU16(script, 12), readU16(script, 14)]).toEqual([QL_EVENT_WAIT, 1]);

    expect(TryDeferTrainerBattleEvent(runtime, QL_EVENT_DEFEATED_E4_MEMBER, normalTrainer, QL_PLAYBACK_STATE_STOPPED, false, getTrainerClass)).toBe(true);
    expect(runtime.sDeferredEvent.id).toBe(QL_EVENT_DEFEATED_E4_MEMBER);
    expect(TryDeferTrainerBattleEvent(runtime, QL_EVENT_USED_ITEM, normalTrainer, QL_PLAYBACK_STATE_STOPPED, false, getTrainerClass)).toBe(false);

    const fullRuntime = createQuestLogEventsRuntime({ gQuestLogCurActionIdx: 2, gQuestLogRecordingPointer: 0 });
    expect(TryDeferTrainerBattleEvent(fullRuntime, QL_EVENT_DEFEATED_E4_MEMBER, normalTrainer, QL_PLAYBACK_STATE_STOPPED, false, getTrainerClass)).toBe(true);
    expect(QuestLogEvents_HandleEndTrainerBattle(fullRuntime, [], QL_PLAYBACK_STATE_STOPPED, 0, 0)).toBeNull();
    expect(fullRuntime.gQuestLogRecordingPointer).toBeNull();
    expect(fullRuntime.gQuestLogCurActionIdx).toBe(3);
    expect(fullRuntime.finishedRecordingScenes).toBe(1);
    expect(fullRuntime.sDeferredEvent).toEqual({ id: 0, data: null });
  });

  it('party-action and special-encounter filters match the C registration gates', () => {
    const trainer = { speciesOpponent: 1, speciesPlayer: 2, trainerId: 3, mapSec: 4, hpFractionId: 5 };
    const getTrainerClass = () => 0;
    const runtime = createQuestLogEventsRuntime({ sStepRecordingMode: STEP_RECORDING_MODE_DISABLED });

    expect(ShouldRegisterEvent_HandlePartyActions(QL_EVENT_USED_PKMN_CENTER, null, { gameClear: true, canLinkWithRs: true }, getTrainerClass)).toBe(true);
    expect(ShouldRegisterEvent_HandlePartyActions(QL_EVENT_USED_ITEM, null, { gameClear: true, canLinkWithRs: false }, getTrainerClass)).toBe(true);
    expect(ShouldRegisterEvent_HandlePartyActions(QL_EVENT_DEFEATED_WILD_MON, null, { gameClear: false, canLinkWithRs: true }, getTrainerClass)).toBe(true);
    expect(ShouldRegisterEvent_HandlePartyActions(QL_EVENT_DEFEATED_TRAINER, trainer, { gameClear: false, canLinkWithRs: true }, getTrainerClass)).toBe(true);
    expect(ShouldRegisterEvent_HandlePartyActions(QL_EVENT_DEFEATED_TRAINER, trainer, { gameClear: true, canLinkWithRs: true }, getTrainerClass)).toBe(false);

    expect(IsSpeciesFromSpecialEncounter(SPECIES_SNORLAX)).toBe(true);
    expect(IsSpeciesFromSpecialEncounter(SPECIES_ARTICUNO)).toBe(true);
    expect(IsSpeciesFromSpecialEncounter(SPECIES_MEWTWO)).toBe(true);
    expect(IsSpeciesFromSpecialEncounter(SPECIES_DEOXYS)).toBe(true);
    expect(IsSpeciesFromSpecialEncounter(25)).toBe(false);
    expect(IsEventWithSpecialEncounterSpecies(QL_EVENT_DEFEATED_WILD_MON, { defeatedSpecies: 25, caughtSpecies: SPECIES_SNORLAX, mapSec: 1 })).toBe(true);
    expect(IsEventWithSpecialEncounterSpecies(QL_EVENT_DEFEATED_TRAINER, { defeatedSpecies: SPECIES_SNORLAX, caughtSpecies: 0, mapSec: 1 })).toBe(false);

    QL_EnableRecordingSteps(runtime);
    expect(runtime.sStepRecordingMode).toBe(0);
  });

  it('disabled-location and map-change helpers mirror the C map group/num checks', () => {
    const runtime = createQuestLogEventsRuntime();

    expect(InQuestLogDisabledLocation({ mapGroup: MAP_GROUP_TRAINER_TOWER, mapNum: MAP_NUM_TRAINER_TOWER_1F })).toBe(true);
    expect(InQuestLogDisabledLocation({ mapGroup: MAP_GROUP_TRAINER_TOWER, mapNum: MAP_NUM_TRAINER_TOWER_ELEVATOR })).toBe(true);
    expect(InQuestLogDisabledLocation({ mapGroup: MAP_GROUP_SAFFRON_CITY, mapNum: MAP_NUM_SAFFRON_CITY_POKEMON_TRAINER_FAN_CLUB })).toBe(true);
    expect(InQuestLogDisabledLocation({ mapGroup: MAP_GROUP_SEVEN_ISLAND_HOUSE, mapNum: MAP_NUM_SEVEN_ISLAND_HOUSE_ROOM2 })).toBe(true);
    expect(InQuestLogDisabledLocation({ mapGroup: MAP_GROUP_ROCKET_HIDEOUT, mapNum: MAP_NUM_ROCKET_HIDEOUT_ELEVATOR })).toBe(true);
    expect(InQuestLogDisabledLocation({ mapGroup: MAP_GROUP_CELADON_CITY_DEPT_STORE, mapNum: MAP_NUM_CELADON_CITY_DEPARTMENT_STORE_ELEVATOR })).toBe(true);
    expect(InQuestLogDisabledLocation({ mapGroup: MAP_GROUP_TRAINER_TOWER, mapNum: MAP_NUM_TRAINER_TOWER_ELEVATOR + 1 })).toBe(false);
    expect(InQuestLogDisabledLocation({ mapGroup: 99, mapNum: 99 })).toBe(false);

    expect(QuestLog_ShouldEndSceneOnMapChange(runtime, { mapGroup: 99, mapNum: 99 }, QL_STATE_RECORDING)).toBe(false);
    expect(runtime.cutRecordingScenes).toBe(0);
    expect(QuestLog_ShouldEndSceneOnMapChange(runtime, { mapGroup: MAP_GROUP_SAFFRON_CITY, mapNum: MAP_NUM_SAFFRON_CITY_POKEMON_TRAINER_FAN_CLUB }, QL_STATE_PLAYBACK)).toBe(true);
    expect(runtime.cutRecordingScenes).toBe(0);
    expect(QuestLog_ShouldEndSceneOnMapChange(runtime, { mapGroup: MAP_GROUP_ROCKET_HIDEOUT, mapNum: MAP_NUM_ROCKET_HIDEOUT_ELEVATOR }, QL_STATE_RECORDING)).toBe(false);
    expect(runtime.cutRecordingScenes).toBe(1);
  });

  it('SetQuestLogEvent preserves C early-return order and recording pointer side effects', () => {
    const runtime = createQuestLogEventsRuntime({
      gQuestLogCurActionIdx: 2,
      gQuestLogRecordingPointer: 0,
      sStepRecordingMode: STEP_RECORDING_MODE_DISABLED_UNTIL_DEPART
    });
    const script = Array.from({ length: 96 }, () => 0);
    const baseContext = {
      questLogState: 0,
      playbackState: QL_PLAYBACK_STATE_STOPPED,
      location: { mapGroup: 0, mapNum: 0 },
      linkActive: false,
      inUnionRoom: false,
      flags: { gameClear: true, canLinkWithRs: true },
      trainerClassById: () => 0,
      start: 0,
      end: script.length * 2
    };

    expect(SetQuestLogEvent(runtime, script, QL_EVENT_DEPARTED, { mapSec: 1, locationId: 2 }, baseContext)).toBe(0);
    expect(runtime.sStepRecordingMode).toBe(0);
    expect(readU16(script, 0)).toBe(0);

    expect(SetQuestLogEvent(runtime, script, QL_EVENT_LINK_TRADED, { speciesSent: 1, speciesReceived: 2, partnerName: 'BLUE' }, { ...baseContext, linkActive: true })).toBe(0);
    expect(runtime.sDeferredEvent.id).toBe(QL_EVENT_LINK_TRADED);
    expect(readU16(script, 0)).toBe(0);
    ResetDeferredLinkEvent(runtime);

    expect(SetQuestLogEvent(runtime, script, QL_EVENT_USED_ITEM, { itemId: 1, species: 2, itemParam: 3 }, { ...baseContext, location: { mapGroup: MAP_GROUP_TRAINER_TOWER, mapNum: MAP_NUM_TRAINER_TOWER_1F } })).toBe(0);
    expect(readU16(script, 0)).toBe(0);

    expect(SetQuestLogEvent(runtime, script, QL_EVENT_OBTAINED_STORY_ITEM, { itemId: 5, mapSec: 6 }, { ...baseContext, playbackState: 1 })).toBe(0);
    expect(readU16(script, 0)).toBe(0);

    expect(SetQuestLogEvent(runtime, script, QL_EVENT_DEPARTED, { mapSec: 7, locationId: QL_LOCATION_GAME_CORNER }, baseContext)).toBe(0);
    expect(readU16(script, 0)).toBe(0);
    SetQLPlayedTheSlots(runtime);
    expect(SetQuestLogEvent(runtime, script, QL_EVENT_DEPARTED, { mapSec: 7, locationId: QL_LOCATION_GAME_CORNER }, baseContext)).toBe(6);
    expect(runtime.recordedActions).toEqual([QL_EVENT_DEPARTED]);
    expect([readU16(script, 0), readU16(script, 2), getByte(script, 4), getByte(script, 5)]).toEqual([QL_EVENT_DEPARTED, 2, 7, QL_LOCATION_GAME_CORNER]);

    expect(SetQuestLogEvent(runtime, script, QL_EVENT_DEFEATED_WILD_MON, { defeatedSpecies: 10, caughtSpecies: 0, mapSec: 8 }, { ...baseContext, start: 6 })).toBe(18);
    expect(runtime.gQuestLogDefeatedWildMonRecord).toBe(6);
    expect(SetQuestLogEvent(runtime, script, QL_EVENT_DEFEATED_WILD_MON, { defeatedSpecies: 0, caughtSpecies: 11, mapSec: 8 }, { ...baseContext, start: 6 })).toBe(18);
    expect([readU16(script, 10), readU16(script, 12), getByte(script, 14), getByte(script, 15), getByte(script, 16)]).toEqual([10, 11, 1, 1, 8]);

    runtime.gQuestLogRepeatEventTracker = { id: 0, numRepeats: 0, counter: 0 };
    runtime.gQuestLogRecordingPointer = 18;
    runtime.sNewlyEnteredMap = true;
    expect(SetQuestLogEvent_Arrived(runtime, script, 88, { ...baseContext, start: 18 })).toBe(24);
    expect(runtime.sNewlyEnteredMap).toBe(false);
    expect([readU16(script, 18), readU16(script, 20), readU16(script, 22)]).toEqual([QL_EVENT_ARRIVED, 2, 88]);

    runtime.sNewlyEnteredMap = false;
    expect(SetQuestLogEvent_Arrived(runtime, script, 99, { ...baseContext, start: 24 })).toBe(24);
    expect(readU16(script, 24)).toBe(0);

    runtime.sNewlyEnteredMap = true;
    expect(SetQuestLogEvent_Arrived(runtime, script, 99, { ...baseContext, questLogState: QL_STATE_PLAYBACK, start: 24 })).toBe(24);
    expect(runtime.sNewlyEnteredMap).toBe(true);
    expect(readU16(script, 24)).toBe(0);

    runtime.gQuestLogRepeatEventTracker = { id: 0, numRepeats: 0, counter: 0 };
    runtime.gQuestLogRecordingPointer = script.length * 2;
    const finishedBefore = runtime.finishedRecordingScenes;
    expect(SetQuestLogEvent(runtime, script, QL_EVENT_USED_ITEM, { itemId: 1, species: 2, itemParam: 3 }, baseContext)).toBe(script.length * 2);
    expect(runtime.finishedRecordingScenes).toBe(finishedBefore + 1);
  });
});
