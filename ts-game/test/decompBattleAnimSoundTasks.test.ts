import { describe, expect, test } from 'vitest';
import {
  ANIM_TARGET,
  CRY_MODE_ECHO_END,
  CRY_MODE_ECHO_START,
  CRY_MODE_GROWL_1,
  CRY_MODE_GROWL_2,
  CRY_MODE_HIGH_PITCH,
  DOUBLE_CRY_GROWL,
  SOUND_PAN_ATTACKER,
  SOUND_PAN_TARGET,
  SoundTask_AdjustPanningVar,
  SoundTask_AdjustPanningVar_Step,
  SoundTask_FireBlast,
  SoundTask_FireBlast_Step1,
  SoundTask_FireBlast_Step2,
  SoundTask_LoopSEAdjustPanning,
  SoundTask_LoopSEAdjustPanning_Step,
  SoundTask_PlayCryHighPitch,
  SoundTask_PlayCryWithEcho,
  SoundTask_PlayCryWithEcho_Step,
  SoundTask_PlayDoubleCry,
  SoundTask_PlayDoubleCry_Step,
  SoundTask_PlaySE1WithPanning,
  SoundTask_PlaySE2WithPanning,
  SoundTask_WaitForCry,
  battleAnimAdjustPanning,
  calculatePanIncrement,
  createBattleAnimSoundRuntime,
  createBattleAnimSoundTask,
  keepPanInRange,
  soundTaskAdjustPanningVar,
  soundTaskAdjustPanningVarStep,
  soundTaskFireBlast,
  soundTaskFireBlastStep1,
  soundTaskFireBlastStep2,
  soundTaskLoopSEAdjustPanning,
  soundTaskLoopSEAdjustPanningStep,
  soundTaskPlayCryHighPitch,
  soundTaskPlayCryWithEcho,
  soundTaskPlayCryWithEchoStep,
  soundTaskPlayDoubleCry,
  soundTaskPlayDoubleCryStep,
  soundTaskPlaySE1WithPanning,
  soundTaskPlaySE2WithPanning,
  soundTaskWaitForCry
} from '../src/game/decompBattleAnimSoundTasks';

describe('decomp battle_anim_sound_tasks', () => {
  test('panning helpers follow BattleAnimAdjustPanning, CalculatePanIncrement, and KeepPanInRange', () => {
    const runtime = createBattleAnimSoundRuntime();
    expect(battleAnimAdjustPanning(runtime, SOUND_PAN_ATTACKER)).toBe(SOUND_PAN_ATTACKER);
    expect(battleAnimAdjustPanning(runtime, SOUND_PAN_TARGET)).toBe(SOUND_PAN_TARGET);
    runtime.battleAnimAttacker = 1;
    runtime.battleAnimTarget = 0;
    expect(battleAnimAdjustPanning(runtime, 20)).toBe(-20);
    runtime.statusAnimActive = true;
    expect(battleAnimAdjustPanning(runtime, 20)).toBe(SOUND_PAN_TARGET);
    expect(calculatePanIncrement(-64, 63, -2)).toBe(2);
    expect(calculatePanIncrement(63, -64, 2)).toBe(-2);
    expect(keepPanInRange(90, 0)).toBe(63);
    expect(keepPanInRange(-90, 0)).toBe(-64);
  });

  test('SoundTask_FireBlast loops first sound, switches step, then plays ending sound twice before destroy', () => {
    const runtime = createBattleAnimSoundRuntime();
    runtime.battleAnimArgs = [100, 200, 0, 0, 0, 0, 0, 0];
    const taskId = createBattleAnimSoundTask(runtime);

    soundTaskFireBlast(runtime, taskId);
    expect(runtime.tasks[taskId].func).toBe('SoundTask_FireBlast_Step1');
    expect(runtime.tasks[taskId].data.slice(0, 5)).toEqual([100, 200, -64, 63, 2]);

    for (let i = 0; i < 111; i += 1) {
      soundTaskFireBlastStep1(runtime, taskId);
    }
    expect(runtime.tasks[taskId].func).toBe('SoundTask_FireBlast_Step2');
    expect(runtime.seLog.filter((entry) => entry.songId === 100)).toHaveLength(10);

    for (let i = 0; i < 12; i += 1) {
      soundTaskFireBlastStep2(runtime, taskId);
    }
    expect(runtime.seLog.filter((entry) => entry.songId === 200)).toHaveLength(2);
    expect(runtime.tasks[taskId].destroyed).toBe(true);
    expect(runtime.tasks[taskId].destroyKind).toBe('sound');
  });

  test('SoundTask_LoopSEAdjustPanning plays immediately, decrements loop count, and adjusts pan on cadence', () => {
    const runtime = createBattleAnimSoundRuntime();
    runtime.battleAnimArgs = [44, SOUND_PAN_ATTACKER, SOUND_PAN_TARGET, 8, 2, 0, 0, 0];
    const taskId = createBattleAnimSoundTask(runtime);

    soundTaskLoopSEAdjustPanning(runtime, taskId);
    expect(runtime.seLog).toEqual([{ kind: 'SE12', songId: 44, pan: -64 }]);
    expect(runtime.tasks[taskId].data[4]).toBe(1);
    expect(runtime.tasks[taskId].data[11]).toBe(-56);

    soundTaskLoopSEAdjustPanningStep(runtime, taskId);
    expect(runtime.seLog).toHaveLength(2);
    expect(runtime.tasks[taskId].destroyed).toBe(true);
  });

  test('cry tasks select battler species, visibility gate, delayed second cry, and wait-for-cry destroy', () => {
    const runtime = createBattleAnimSoundRuntime();
    let taskId = createBattleAnimSoundTask(runtime);
    runtime.battleAnimArgs = [ANIM_TARGET, 0, 0, 0, 0, 0, 0, 0];
    soundTaskPlayCryHighPitch(runtime, taskId);
    expect(runtime.cryLog.at(-1)).toEqual({ species: 25, pan: -64, mode: CRY_MODE_HIGH_PITCH });
    expect(runtime.tasks[taskId].destroyKind).toBe('visual');

    taskId = createBattleAnimSoundTask(runtime);
    runtime.battlerVisible[1] = false;
    soundTaskPlayCryHighPitch(runtime, taskId);
    expect(runtime.tasks[taskId].destroyed).toBe(true);
    expect(runtime.cryLog).toHaveLength(1);

    runtime.battlerVisible[1] = true;
    runtime.cryPlaying = false;
    taskId = createBattleAnimSoundTask(runtime);
    runtime.battleAnimArgs = [ANIM_TARGET, DOUBLE_CRY_GROWL, 0, 0, 0, 0, 0, 0];
    soundTaskPlayDoubleCry(runtime, taskId);
    expect(runtime.cryLog.at(-1)).toMatchObject({ species: 25, mode: CRY_MODE_GROWL_1 });
    soundTaskPlayDoubleCryStep(runtime, taskId);
    soundTaskPlayDoubleCryStep(runtime, taskId);
    runtime.cryPlaying = false;
    soundTaskPlayDoubleCryStep(runtime, taskId);
    expect(runtime.cryLog.at(-1)).toMatchObject({ species: 25, mode: CRY_MODE_GROWL_2 });
    expect(runtime.tasks[taskId].destroyed).toBe(true);

    taskId = createBattleAnimSoundTask(runtime);
    soundTaskWaitForCry(runtime, taskId);
    soundTaskWaitForCry(runtime, taskId);
    runtime.cryPlaying = false;
    soundTaskWaitForCry(runtime, taskId);
    expect(runtime.tasks[taskId].destroyed).toBe(true);
  });

  test('echo cry task plays start mode, waits, then plays end mode when cry stops', () => {
    const runtime = createBattleAnimSoundRuntime();
    const taskId = createBattleAnimSoundTask(runtime);

    soundTaskPlayCryWithEcho(runtime, taskId);
    expect(runtime.cryLog).toEqual([{ species: 1, pan: -64, mode: CRY_MODE_ECHO_START }]);
    soundTaskPlayCryWithEchoStep(runtime, taskId);
    soundTaskPlayCryWithEchoStep(runtime, taskId);
    runtime.cryPlaying = false;
    soundTaskPlayCryWithEchoStep(runtime, taskId);
    expect(runtime.cryLog.at(-1)).toEqual({ species: 1, pan: -64, mode: CRY_MODE_ECHO_END });
    expect(runtime.tasks[taskId].destroyed).toBe(true);
  });

  test('direct SE tasks play through selected channel and destroy visual task', () => {
    const runtime = createBattleAnimSoundRuntime();
    runtime.battleAnimArgs = [7, SOUND_PAN_TARGET, 0, 0, 0, 0, 0, 0];
    const task1 = createBattleAnimSoundTask(runtime);
    soundTaskPlaySE1WithPanning(runtime, task1);
    expect(runtime.seLog.at(-1)).toEqual({ kind: 'SE1', songId: 7, pan: 63 });
    expect(runtime.tasks[task1].destroyKind).toBe('visual');

    const task2 = createBattleAnimSoundTask(runtime);
    soundTaskPlaySE2WithPanning(runtime, task2);
    expect(runtime.seLog.at(-1)).toEqual({ kind: 'SE2', songId: 7, pan: 63 });
    expect(runtime.tasks[task2].destroyKind).toBe('visual');
  });

  test('SoundTask_AdjustPanningVar updates gAnimCustomPanning and destroys at target pan', () => {
    const runtime = createBattleAnimSoundRuntime();
    runtime.battleAnimArgs = [SOUND_PAN_ATTACKER, SOUND_PAN_TARGET, 63, 0, 0, 0, 0, 0];
    const taskId = createBattleAnimSoundTask(runtime);

    soundTaskAdjustPanningVar(runtime, taskId);
    expect(runtime.animCustomPanning).toBe(-1);
    expect(runtime.tasks[taskId].destroyed).toBe(false);
    soundTaskAdjustPanningVarStep(runtime, taskId);
    expect(runtime.animCustomPanning).toBe(62);
    soundTaskAdjustPanningVarStep(runtime, taskId);
    expect(runtime.animCustomPanning).toBe(63);
    expect(runtime.tasks[taskId].destroyed).toBe(true);
  });

  test('exact C-name exports dispatch every sound task entrypoint and static step helper', () => {
    const runtime = createBattleAnimSoundRuntime();

    runtime.battleAnimArgs = [100, 200, 0, 0, 0, 0, 0, 0];
    let taskId = createBattleAnimSoundTask(runtime);
    SoundTask_FireBlast(runtime, taskId);
    expect(runtime.tasks[taskId].func).toBe('SoundTask_FireBlast_Step1');
    SoundTask_FireBlast_Step1(runtime, taskId);
    expect(runtime.tasks[taskId].data[11]).toBe(1);
    runtime.tasks[taskId].data[10] = 5;
    SoundTask_FireBlast_Step2(runtime, taskId);
    expect(runtime.seLog.at(-1)).toEqual({ kind: 'SE12', songId: 200, pan: 63 });

    runtime.battleAnimArgs = [44, SOUND_PAN_ATTACKER, SOUND_PAN_TARGET, 8, 2, 0, 0, 0];
    taskId = createBattleAnimSoundTask(runtime);
    SoundTask_LoopSEAdjustPanning(runtime, taskId);
    expect(runtime.tasks[taskId].func).toBe('SoundTask_LoopSEAdjustPanning_Step');
    SoundTask_LoopSEAdjustPanning_Step(runtime, taskId);
    expect(runtime.tasks[taskId].destroyed).toBe(true);

    runtime.battleAnimArgs = [ANIM_TARGET, 0, 0, 0, 0, 0, 0, 0];
    taskId = createBattleAnimSoundTask(runtime);
    SoundTask_PlayCryHighPitch(runtime, taskId);
    expect(runtime.cryLog.at(-1)).toEqual({ species: 25, pan: -64, mode: CRY_MODE_HIGH_PITCH });

    runtime.cryPlaying = false;
    runtime.battleAnimArgs = [ANIM_TARGET, DOUBLE_CRY_GROWL, 0, 0, 0, 0, 0, 0];
    taskId = createBattleAnimSoundTask(runtime);
    SoundTask_PlayDoubleCry(runtime, taskId);
    SoundTask_PlayDoubleCry_Step(runtime, taskId);
    SoundTask_PlayDoubleCry_Step(runtime, taskId);
    runtime.cryPlaying = false;
    SoundTask_PlayDoubleCry_Step(runtime, taskId);
    expect(runtime.cryLog.at(-1)).toMatchObject({ species: 25, mode: CRY_MODE_GROWL_2 });

    taskId = createBattleAnimSoundTask(runtime);
    SoundTask_WaitForCry(runtime, taskId);
    SoundTask_WaitForCry(runtime, taskId);
    runtime.cryPlaying = false;
    SoundTask_WaitForCry(runtime, taskId);
    expect(runtime.tasks[taskId].destroyed).toBe(true);

    taskId = createBattleAnimSoundTask(runtime);
    SoundTask_PlayCryWithEcho(runtime, taskId);
    SoundTask_PlayCryWithEcho_Step(runtime, taskId);
    SoundTask_PlayCryWithEcho_Step(runtime, taskId);
    runtime.cryPlaying = false;
    SoundTask_PlayCryWithEcho_Step(runtime, taskId);
    expect(runtime.cryLog.at(-1)).toEqual({ species: 1, pan: -64, mode: CRY_MODE_ECHO_END });

    runtime.battleAnimArgs = [7, SOUND_PAN_TARGET, 0, 0, 0, 0, 0, 0];
    taskId = createBattleAnimSoundTask(runtime);
    SoundTask_PlaySE1WithPanning(runtime, taskId);
    expect(runtime.seLog.at(-1)).toEqual({ kind: 'SE1', songId: 7, pan: 63 });
    taskId = createBattleAnimSoundTask(runtime);
    SoundTask_PlaySE2WithPanning(runtime, taskId);
    expect(runtime.seLog.at(-1)).toEqual({ kind: 'SE2', songId: 7, pan: 63 });

    runtime.battleAnimArgs = [SOUND_PAN_ATTACKER, SOUND_PAN_TARGET, 63, 0, 0, 0, 0, 0];
    taskId = createBattleAnimSoundTask(runtime);
    SoundTask_AdjustPanningVar(runtime, taskId);
    SoundTask_AdjustPanningVar_Step(runtime, taskId);
    SoundTask_AdjustPanningVar_Step(runtime, taskId);
    expect(runtime.animCustomPanning).toBe(63);
  });
});
