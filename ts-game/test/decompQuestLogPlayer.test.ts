import { describe, expect, test } from 'vitest';
import {
  DIR_EAST,
  DIR_NORTH,
  DIR_SOUTH,
  DIR_WEST,
  FLDEFF_SURF_BLOB,
  FLDEFF_USE_VS_SEEKER,
  PLAYER_AVATAR_FLAG_MACH_BIKE,
  PLAYER_AVATAR_FLAG_ON_FOOT,
  PLAYER_AVATAR_FLAG_SURFING,
  PLAYER_AVATAR_GFX_BIKE,
  PLAYER_AVATAR_GFX_FISH,
  PLAYER_AVATAR_GFX_NORMAL,
  PLAYER_AVATAR_GFX_RIDE,
  QL_GfxTransition_Bike,
  QL_GfxTransition_Fish,
  QL_GfxTransition_Normal,
  QL_GfxTransition_StartSurf,
  QL_GfxTransition_StopSurfEast,
  QL_GfxTransition_StopSurfNorth,
  QL_GfxTransition_StopSurfSouth,
  QL_GfxTransition_StopSurfWest,
  QL_GfxTransition_VSSeeker,
  QL_SetObjectGraphicsId,
  QL_PLAYBACK_STATE_ACTION_END,
  QL_PLAYBACK_STATE_RECORDING,
  QL_PLAYBACK_STATE_RUNNING,
  QL_PLAYER_GFX_BIKE,
  QL_PLAYER_GFX_FISH,
  QL_PLAYER_GFX_NORMAL,
  QL_PLAYER_GFX_STOP_SURF_E,
  QL_PLAYER_GFX_STOP_SURF_N,
  QL_PLAYER_GFX_STOP_SURF_S,
  QL_PLAYER_GFX_STOP_SURF_W,
  QL_PLAYER_GFX_SURF,
  QL_PLAYER_GFX_VSSEEKER,
  QuestLogCallUpdatePlayerSprite,
  QuestLogTryRecordPlayerAvatarGfxTransition,
  QuestLogUpdatePlayerSprite,
  Task_QLFishMovement,
  Task_QLVSSeekerMovement,
  createQuestLogPlayerRuntimeState,
  questLogTryRecordPlayerAvatarGfxTransition,
  questLogUpdatePlayerSprite,
  taskQlFishMovement,
  taskQlVSSeekerMovement
} from '../src/game/decompQuestLogPlayer';

describe('decompQuestLogPlayer', () => {
  test('normal and bike transitions set graphics, turn to movement direction, and update avatar flags', () => {
    const runtime = createQuestLogPlayerRuntimeState();
    runtime.objectEvents[0].movementDirection = DIR_WEST;

    questLogUpdatePlayerSprite(runtime, QL_PLAYER_GFX_BIKE);
    expect(runtime.objectEvents[0].graphicsId).toBe(PLAYER_AVATAR_GFX_BIKE);
    expect(runtime.objectEvents[0].facingDirection).toBe(DIR_WEST);
    expect(runtime.playerAvatar.flags).toBe(PLAYER_AVATAR_FLAG_MACH_BIKE);
    expect(runtime.bikeClearStateCalls).toEqual([[0, 0]]);

    questLogUpdatePlayerSprite(runtime, QL_PLAYER_GFX_NORMAL);
    expect(runtime.objectEvents[0].graphicsId).toBe(PLAYER_AVATAR_GFX_NORMAL);
    expect(runtime.playerAvatar.flags).toBe(PLAYER_AVATAR_FLAG_ON_FOOT);
  });

  test('recording transition only appends during QL_PLAYBACK_STATE_RECORDING', () => {
    const runtime = createQuestLogPlayerRuntimeState();

    expect(questLogTryRecordPlayerAvatarGfxTransition(runtime, QL_PLAYER_GFX_BIKE)).toBe(false);
    runtime.questLogPlaybackState = QL_PLAYBACK_STATE_RECORDING;
    expect(questLogTryRecordPlayerAvatarGfxTransition(runtime, QL_PLAYER_GFX_BIKE)).toBe(true);
    expect(runtime.recordedTransitions).toEqual([QL_PLAYER_GFX_BIKE]);
  });

  test('fish transition runs immediately outside playback and uses task sequence during playback', () => {
    const runtime = createQuestLogPlayerRuntimeState();
    runtime.objectEvents[0].facingDirection = DIR_NORTH;
    questLogUpdatePlayerSprite(runtime, QL_PLAYER_GFX_FISH);
    expect(runtime.objectEvents[0].graphicsId).toBe(PLAYER_AVATAR_GFX_FISH);
    expect(runtime.objectEvents[0].sprite.animIndex).toBe(DIR_NORTH);

    const playbackRuntime = createQuestLogPlayerRuntimeState();
    playbackRuntime.questLogPlaybackState = QL_PLAYBACK_STATE_RUNNING;
    playbackRuntime.playerFacingDirection = DIR_EAST;
    questLogUpdatePlayerSprite(playbackRuntime, QL_PLAYER_GFX_FISH);
    expect(playbackRuntime.lockedControls).toBe(true);
    expect(playbackRuntime.playerAvatar.preventStep).toBe(true);
    expect(playbackRuntime.tasks[0]).toMatchObject({ kind: 'fish', priority: 0xff, data: expect.arrayContaining([0]) });

    taskQlFishMovement(playbackRuntime, 0);
    expect(playbackRuntime.objectEvents[0]).toMatchObject({
      graphicsId: PLAYER_AVATAR_GFX_FISH,
      enableAnim: true,
      heldMovementCleared: true
    });
    playbackRuntime.tasks[0].data[0] = 1;
    playbackRuntime.tasks[0].data[1] = 60;
    taskQlFishMovement(playbackRuntime, 0);
    expect(playbackRuntime.tasks[0].data[0]).toBe(2);
    taskQlFishMovement(playbackRuntime, 0);
    expect(playbackRuntime.objectEvents[0].sprite.animIndex).toBe(4 + DIR_EAST);
    playbackRuntime.objectEvents[0].sprite.animEnded = true;
    playbackRuntime.objectEvents[0].sprite.x2 = 3;
    playbackRuntime.objectEvents[0].sprite.y2 = 4;
    taskQlFishMovement(playbackRuntime, 0);
    expect(playbackRuntime.objectEvents[0]).toMatchObject({
      graphicsId: PLAYER_AVATAR_GFX_NORMAL,
      facingDirection: DIR_SOUTH
    });
    expect(playbackRuntime.lockedControls).toBe(false);
    expect(playbackRuntime.tasks[0].destroyed).toBe(true);
    expect(playbackRuntime.objectEvents[0].sprite).toMatchObject({ x2: 0, y2: 0 });
  });

  test('fish task restores ride graphics when the player is surfing', () => {
    const runtime = createQuestLogPlayerRuntimeState();
    runtime.questLogPlaybackState = QL_PLAYBACK_STATE_ACTION_END;
    runtime.playerAvatar.flags = PLAYER_AVATAR_FLAG_SURFING;
    questLogUpdatePlayerSprite(runtime, QL_PLAYER_GFX_FISH);
    runtime.tasks[0].data[0] = 3;
    runtime.objectEvents[0].sprite.animEnded = true;

    taskQlFishMovement(runtime, 0);

    expect(runtime.objectEvents[0].graphicsId).toBe(PLAYER_AVATAR_GFX_RIDE);
  });

  test('surf, stop-surf, and VS Seeker transitions mirror field-effect side effects', () => {
    const runtime = createQuestLogPlayerRuntimeState();
    runtime.objectEvents[0].currentCoords = { x: 11, y: 22 };

    questLogUpdatePlayerSprite(runtime, QL_PLAYER_GFX_SURF);
    expect(runtime.playerAvatar.flags).toBe(PLAYER_AVATAR_FLAG_SURFING);
    expect(runtime.objectEvents[0].graphicsId).toBe(PLAYER_AVATAR_GFX_RIDE);
    expect(runtime.fieldEffectArguments).toEqual([11, 22, 0]);
    expect(runtime.startedFieldEffects).toEqual([FLDEFF_SURF_BLOB]);
    expect(runtime.objectEvents[0].fieldEffectSpriteId).toBe(0);
    expect(runtime.surfBlobBobStates).toEqual([{ fieldEffectId: 0, bobState: 1 }]);

    questLogUpdatePlayerSprite(runtime, QL_PLAYER_GFX_SURF);
    expect(runtime.startedFieldEffects).toEqual([FLDEFF_SURF_BLOB]);

    questLogUpdatePlayerSprite(runtime, QL_PLAYER_GFX_STOP_SURF_S);
    questLogUpdatePlayerSprite(runtime, QL_PLAYER_GFX_STOP_SURF_N);
    questLogUpdatePlayerSprite(runtime, QL_PLAYER_GFX_STOP_SURF_W);
    questLogUpdatePlayerSprite(runtime, QL_PLAYER_GFX_STOP_SURF_E);
    expect(runtime.stopSurfingDirections).toEqual([DIR_SOUTH, DIR_NORTH, DIR_WEST, DIR_EAST]);

    runtime.lockedControls = true;
    questLogUpdatePlayerSprite(runtime, QL_PLAYER_GFX_VSSEEKER);
    expect(runtime.startedFieldEffects.at(-1)).toBe(FLDEFF_USE_VS_SEEKER);
    expect(runtime.tasks.at(-1)).toMatchObject({ kind: 'vsSeeker', priority: 0 });
    taskQlVSSeekerMovement(runtime, 0);
    expect(runtime.tasks[0].destroyed).toBe(false);
    runtime.activeFieldEffects.delete(FLDEFF_USE_VS_SEEKER);
    taskQlVSSeekerMovement(runtime, 0);
    expect(runtime.unfreezeObjectEventsCount).toBe(1);
    expect(runtime.lockedControls).toBe(false);
    expect(runtime.tasks[0].destroyed).toBe(true);
  });

  test('exact C-name exports drive the same quest log player transitions and tasks', () => {
    const runtime = createQuestLogPlayerRuntimeState();
    runtime.objectEvents[0].movementDirection = DIR_WEST;

    QuestLogUpdatePlayerSprite(runtime, QL_PLAYER_GFX_NORMAL);
    expect(runtime.objectEvents[0].graphicsId).toBe(PLAYER_AVATAR_GFX_NORMAL);
    expect(runtime.playerAvatar.flags).toBe(PLAYER_AVATAR_FLAG_ON_FOOT);

    QL_GfxTransition_Bike(runtime);
    expect(runtime.objectEvents[0].graphicsId).toBe(PLAYER_AVATAR_GFX_BIKE);
    expect(runtime.objectEvents[0].facingDirection).toBe(DIR_WEST);
    expect(runtime.playerAvatar.flags).toBe(PLAYER_AVATAR_FLAG_MACH_BIKE);

    QL_SetObjectGraphicsId(runtime.objectEvents[0], 99);
    expect(runtime.objectEvents[0].graphicsId).toBe(99);

    QL_GfxTransition_Normal(runtime);
    expect(runtime.objectEvents[0].graphicsId).toBe(PLAYER_AVATAR_GFX_NORMAL);

    expect(QuestLogTryRecordPlayerAvatarGfxTransition(runtime, QL_PLAYER_GFX_BIKE)).toBe(false);
    runtime.questLogPlaybackState = QL_PLAYBACK_STATE_RECORDING;
    expect(QuestLogTryRecordPlayerAvatarGfxTransition(runtime, QL_PLAYER_GFX_BIKE)).toBe(true);
    expect(runtime.recordedTransitions).toEqual([QL_PLAYER_GFX_BIKE]);

    QuestLogCallUpdatePlayerSprite(runtime, QL_PLAYER_GFX_SURF);
    expect(runtime.playerAvatar.flags).toBe(PLAYER_AVATAR_FLAG_SURFING);
    expect(runtime.startedFieldEffects.at(-1)).toBe(FLDEFF_SURF_BLOB);

    runtime.questLogPlaybackState = QL_PLAYBACK_STATE_RUNNING;
    QL_GfxTransition_Fish(runtime);
    const fishTaskId = runtime.tasks.length - 1;
    expect(runtime.tasks[fishTaskId]).toMatchObject({ kind: 'fish', priority: 0xff });
    Task_QLFishMovement(runtime, fishTaskId);
    expect(runtime.objectEvents[0].graphicsId).toBe(PLAYER_AVATAR_GFX_FISH);
    runtime.tasks[fishTaskId].data[0] = 3;
    runtime.objectEvents[0].sprite.animEnded = true;
    Task_QLFishMovement(runtime, fishTaskId);
    expect(runtime.tasks[fishTaskId].destroyed).toBe(true);

    QL_GfxTransition_StartSurf(runtime);
    QL_GfxTransition_VSSeeker(runtime);
    const vsTaskId = runtime.tasks.length - 1;
    expect(runtime.startedFieldEffects.at(-1)).toBe(FLDEFF_USE_VS_SEEKER);
    runtime.activeFieldEffects.delete(FLDEFF_USE_VS_SEEKER);
    Task_QLVSSeekerMovement(runtime, vsTaskId);
    expect(runtime.tasks[vsTaskId].destroyed).toBe(true);

    QL_GfxTransition_StopSurfSouth(runtime);
    QL_GfxTransition_StopSurfNorth(runtime);
    QL_GfxTransition_StopSurfWest(runtime);
    QL_GfxTransition_StopSurfEast(runtime);
    expect(runtime.stopSurfingDirections.slice(-4)).toEqual([DIR_SOUTH, DIR_NORTH, DIR_WEST, DIR_EAST]);
  });
});
