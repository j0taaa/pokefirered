import { describe, expect, it } from 'vitest';
import {
  BATTLE_TYPE_MULTI,
  BGMVolumeMax_EnableHelpSystemReduction,
  CRY_MODE_DOUBLES,
  CRY_MODE_ECHO_START,
  CRY_MODE_ENCOUNTER,
  CRY_MODE_FAINT,
  CRY_MODE_GROWL_1,
  CRY_MODE_GROWL_2,
  CRY_MODE_HIGH_PITCH,
  CRY_MODE_NORMAL,
  CRY_MODE_ROAR_1,
  CRY_MODE_ROAR_2,
  CRY_MODE_WEAK,
  CRY_MODE_WEAK_DOUBLES,
  CRY_PRIORITY_NORMAL,
  CRY_VOLUME,
  CreateFanfareTask,
  FANFARE_DEX_EVAL,
  FANFARE_LEVEL_UP,
  FadeInNewBGM,
  FadeOutAndFadeInNewMapMusic,
  FadeOutAndPlayNewMapMusic,
  FadeOutMapMusic,
  FuncIsActiveTask,
  InitMapMusic,
  IsBGMPlaying,
  IsBGMPausedOrStopped,
  IsBGMStopped,
  IsCryFinished,
  IsCryPlaying,
  IsCryPlayingOrClearCrySongs,
  IsFanfareTaskInactive,
  IsNotWaitingForBGMStop,
  IsSEPlaying,
  IsSpecialSEPlaying,
  MapMusicMain,
  MUSICPLAYER_STATUS_PAUSE,
  MUSICPLAYER_STATUS_TRACK,
  MUS_DEX_RATING,
  MUS_DUMMY,
  MUS_EVOLVED,
  MUS_LEVEL_UP,
  MUS_NONE,
  PlayCry_ByMode,
  PlayCryInternal,
  PlayCry_Normal,
  PlayCry_NormalNoDucking,
  PlayCry_ReleaseDouble,
  PlayCry_Script,
  PlayFanfare,
  PlayFanfareByFanfareNum,
  PlayNewMapMusic,
  PlaySE,
  PlaySE12WithPanning,
  QL_STATE_PLAYBACK,
  QL_STATE_PLAYBACK_LAST,
  ResetMapMusic,
  SE12PanpotControl,
  SetBGMVolume_SuppressHelpSystemReduction,
  StopCry,
  StopCryAndClearCrySongs,
  StopFanfareByFanfareNum,
  StopMapMusic,
  TRACKS_ALL,
  WaitFanfare,
  createSoundRuntime,
  runSoundTask,
  sFanfares,
} from '../src/game/decompSound';
import type { PokemonCryParams } from '../src/game/decompSound';

describe('decompSound', () => {
  it('initializes, resets, starts, stops, and advances map music states exactly', () => {
    const runtime = createSoundRuntime();
    runtime.gDisableMusic = true;
    runtime.sCurrentMapMusic = 123;
    runtime.sNextMapMusic = 456;
    runtime.sMapMusicState = 7;
    runtime.sMapMusicFadeInSpeed = 9;

    InitMapMusic(runtime);
    expect(runtime.gDisableMusic).toBe(false);
    expect([runtime.sCurrentMapMusic, runtime.sNextMapMusic, runtime.sMapMusicState, runtime.sMapMusicFadeInSpeed]).toEqual([0, 0, 0, 0]);

    PlayNewMapMusic(runtime, MUS_LEVEL_UP);
    expect([runtime.sCurrentMapMusic, runtime.sNextMapMusic, runtime.sMapMusicState]).toEqual([MUS_LEVEL_UP, 0, 1]);
    runtime.gDisableMusic = true;
    runtime.sCurrentMapMusic = MUS_NONE;
    MapMusicMain(runtime);
    expect(runtime.sMapMusicState).toBe(2);
    expect(runtime.operations).toContain('m4aSongNumStart:0');

    runtime.gDisableMusic = false;
    StopMapMusic(runtime);
    MapMusicMain(runtime);
    expect(runtime.operations.at(-1)).toBe('m4aSongNumStart:0');

    ResetMapMusic(runtime);
    runtime.gMPlayInfo_BGM.status = MUSICPLAYER_STATUS_TRACK;
    FadeOutMapMusic(runtime, 4);
    expect(runtime.operations).toContain('m4aMPlayFadeOut:BGM:4');
    expect(runtime.sMapMusicState).toBe(5);
    expect(IsNotWaitingForBGMStop(runtime)).toBe(false);
    FadeOutMapMusic(runtime, 6);
    expect(runtime.operations.filter((op) => op === 'm4aMPlayFadeOut:BGM:6')).toHaveLength(0);
    runtime.gMPlayInfo_BGM.status = 0;
    MapMusicMain(runtime);
    expect(runtime.sMapMusicState).toBe(0);

    FadeOutAndPlayNewMapMusic(runtime, MUS_EVOLVED, 5);
    expect([runtime.sCurrentMapMusic, runtime.sNextMapMusic, runtime.sMapMusicState]).toEqual([0, MUS_EVOLVED, 6]);
    MapMusicMain(runtime);
    expect([runtime.sCurrentMapMusic, runtime.sNextMapMusic, runtime.sMapMusicState]).toEqual([MUS_EVOLVED, 0, 2]);
    expect(runtime.operations.at(-1)).toBe(`m4aSongNumStart:${MUS_EVOLVED}`);

    FadeOutAndFadeInNewMapMusic(runtime, MUS_DEX_RATING, 3, 11);
    MapMusicMain(runtime);
    expect(runtime.operations.slice(-5)).toEqual([
      `m4aSongNumStart:${MUS_DEX_RATING}`,
      'm4aMPlayImmInit:BGM',
      `m4aMPlayVolumeControl:BGM:${TRACKS_ALL}:0`,
      `m4aSongNumStop:${MUS_DEX_RATING}`,
      'm4aMPlayFadeIn:BGM:11',
    ]);
    expect([runtime.sCurrentMapMusic, runtime.sNextMapMusic, runtime.sMapMusicState, runtime.sMapMusicFadeInSpeed]).toEqual([MUS_DEX_RATING, 0, 2, 0]);
  });

  it('preserves fanfare table durations, playback fallback, wait behavior, and fanfare task lifecycle', () => {
    const runtime = createSoundRuntime();

    expect(sFanfares[FANFARE_LEVEL_UP]).toEqual({ songNum: MUS_LEVEL_UP, duration: 80 });
    expect(sFanfares[FANFARE_DEX_EVAL]).toEqual({ songNum: MUS_DEX_RATING, duration: 196 });

    PlayFanfareByFanfareNum(runtime, FANFARE_LEVEL_UP);
    expect(runtime.sFanfareCounter).toBe(80);
    expect(runtime.operations.slice(-2)).toEqual(['m4aMPlayStop:BGM', `m4aSongNumStart:${MUS_LEVEL_UP}`]);
    expect(WaitFanfare(runtime, false)).toBe(false);
    expect(runtime.sFanfareCounter).toBe(79);
    runtime.sFanfareCounter = 0;
    expect(WaitFanfare(runtime, false)).toBe(true);
    expect(runtime.operations.at(-1)).toBe('m4aMPlayContinue:BGM');
    expect(WaitFanfare(runtime, true)).toBe(true);
    expect(runtime.operations.at(-1)).toBe(`m4aSongNumStart:${MUS_DUMMY}`);

    runtime.gQuestLogState = QL_STATE_PLAYBACK;
    PlayFanfareByFanfareNum(runtime, FANFARE_DEX_EVAL);
    expect(runtime.sFanfareCounter).toBe(0xff);
    expect(runtime.operations.at(-1)).toBe(`m4aSongNumStart:${MUS_DUMMY}`);
    runtime.gQuestLogState = 0;

    PlayFanfare(runtime, 9999);
    expect(runtime.sFanfareCounter).toBe(80);
    expect(runtime.operations).toContain(`m4aSongNumStart:${MUS_LEVEL_UP}`);
    expect(FuncIsActiveTask(runtime, 'Task_Fanfare')).toBe(true);
    CreateFanfareTask(runtime);
    expect(runtime.tasks.filter((task) => task.func === 'Task_Fanfare')).toHaveLength(1);
    expect(IsFanfareTaskInactive(runtime)).toBe(false);
    runtime.sFanfareCounter = 0;
    runSoundTask(runtime, 0);
    expect(runtime.tasks[0].destroyed).toBe(true);
    expect(IsFanfareTaskInactive(runtime)).toBe(true);

    StopFanfareByFanfareNum(runtime, FANFARE_LEVEL_UP);
    expect(runtime.operations.at(-1)).toBe(`m4aSongNumStop:${MUS_LEVEL_UP}`);
  });

  it('applies FadeInNewBGM and playback status predicates using the same status bits', () => {
    const runtime = createSoundRuntime();

    FadeInNewBGM(runtime, MUS_NONE, 7);
    expect(runtime.operations.slice(-5)).toEqual([
      'm4aSongNumStart:0',
      'm4aMPlayImmInit:BGM',
      `m4aMPlayVolumeControl:BGM:${TRACKS_ALL}:0`,
      'm4aSongNumStop:0',
      'm4aMPlayFadeIn:BGM:7',
    ]);

    runtime.gMPlayInfo_BGM.status = 0;
    expect(IsBGMStopped(runtime)).toBe(true);
    expect(IsBGMPausedOrStopped(runtime)).toBe(true);
    expect(IsBGMPlaying(runtime)).toBe(false);
    runtime.gMPlayInfo_BGM.status = MUSICPLAYER_STATUS_TRACK;
    expect(IsBGMStopped(runtime)).toBe(false);
    expect(IsBGMPausedOrStopped(runtime)).toBe(false);
    expect(IsBGMPlaying(runtime)).toBe(true);
    runtime.gMPlayInfo_BGM.status = MUSICPLAYER_STATUS_TRACK | MUSICPLAYER_STATUS_PAUSE;
    expect(IsBGMPlaying(runtime)).toBe(false);

    expect(IsSEPlaying(runtime)).toBe(false);
    runtime.gMPlayInfo_SE1.status = MUSICPLAYER_STATUS_TRACK;
    expect(IsSEPlaying(runtime)).toBe(true);
    runtime.gMPlayInfo_SE1.status = MUSICPLAYER_STATUS_PAUSE;
    runtime.gMPlayInfo_SE2.status = MUSICPLAYER_STATUS_PAUSE;
    expect(IsSEPlaying(runtime)).toBe(false);
    runtime.gMPlayInfo_SE3.status = MUSICPLAYER_STATUS_TRACK;
    expect(IsSpecialSEPlaying(runtime)).toBe(true);
    runtime.gMPlayInfo_SE3.status = MUSICPLAYER_STATUS_TRACK | MUSICPLAYER_STATUS_PAUSE;
    expect(IsSpecialSEPlaying(runtime)).toBe(false);
  });

  it('plays SE and pan-controlled SE with the same quest-log and map-load gates', () => {
    const runtime = createSoundRuntime();

    PlaySE(runtime, 5);
    expect(runtime.operations.at(-1)).toBe('m4aSongNumStart:5');
    runtime.gQuestLogState = QL_STATE_PLAYBACK;
    PlaySE(runtime, 6);
    expect(runtime.operations.at(-1)).toBe('m4aSongNumStart:5');
    runtime.gQuestLogState = QL_STATE_PLAYBACK_LAST;
    PlaySE(runtime, 7);
    expect(runtime.operations.at(-1)).toBe('m4aSongNumStart:7');
    runtime.gDisableMapMusicChangeOnMapLoad = 1;
    PlaySE(runtime, 8);
    expect(runtime.operations.at(-1)).toBe('m4aSongNumStart:7');

    PlaySE12WithPanning(runtime, 9, -32);
    expect(runtime.operations.slice(-5)).toEqual([
      'm4aSongNumStart:9',
      'm4aMPlayImmInit:SE1',
      'm4aMPlayImmInit:SE2',
      `m4aMPlayPanpotControl:SE1:${TRACKS_ALL}:-32`,
      `m4aMPlayPanpotControl:SE2:${TRACKS_ALL}:-32`,
    ]);
    SE12PanpotControl(runtime, 24);
    expect(runtime.gMPlayInfo_SE1.pan).toBe(24);
    expect(runtime.gMPlayInfo_SE2.pan).toBe(24);
  });

  it('maps every cry mode to the exact internal length, release, pitch, chorus, volume, and reverse values', () => {
    const runtime = createSoundRuntime();
    runtime.speciesToCryId = (species) => species + 128;

    const cases = [
      [CRY_MODE_NORMAL, { length: 140, release: 0, pitch: 15360, chorus: 0, volume: 77, reverse: false }],
      [CRY_MODE_DOUBLES, { length: 20, release: 225, pitch: 15360, chorus: 0, volume: 77, reverse: false }],
      [CRY_MODE_ENCOUNTER, { length: 140, release: 225, pitch: 15600, chorus: 20, volume: 90, reverse: false }],
      [CRY_MODE_HIGH_PITCH, { length: 50, release: 200, pitch: 15800, chorus: 20, volume: 90, reverse: false }],
      [CRY_MODE_ECHO_START, { length: 25, release: 100, pitch: 15600, chorus: 192, volume: 90, reverse: true }],
      [CRY_MODE_FAINT, { length: 140, release: 200, pitch: 14440, chorus: 0, volume: 77, reverse: false }],
      [CRY_MODE_ROAR_1, { length: 10, release: 100, pitch: 14848, chorus: 0, volume: 77, reverse: false }],
      [CRY_MODE_ROAR_2, { length: 60, release: 225, pitch: 15616, chorus: 0, volume: 77, reverse: false }],
      [CRY_MODE_GROWL_1, { length: 15, release: 125, pitch: 15200, chorus: 0, volume: 77, reverse: true }],
      [CRY_MODE_GROWL_2, { length: 100, release: 225, pitch: 15200, chorus: 0, volume: 77, reverse: false }],
      [CRY_MODE_WEAK, { length: 140, release: 0, pitch: 15000, chorus: 0, volume: 77, reverse: false }],
      [CRY_MODE_WEAK_DOUBLES, { length: 20, release: 225, pitch: 15000, chorus: 0, volume: 77, reverse: false }],
    ] as const;

    for (const [mode, expected] of cases) {
      runtime.lastCryParams = null;
      PlayCryInternal(runtime, 2, -5, 77, 4, mode);
      const params = runtime.lastCryParams as unknown as PokemonCryParams;
      expect(params).toMatchObject({ ...expected, priority: 4, pan: -5, mode });
      expect(params.tone).toEqual({ table: 1, index: 1, reverse: expected.reverse });
    }

    PlayCry_NormalNoDucking(runtime, 130, 11, 99, 3);
    expect(runtime.lastCryParams).toMatchObject({ species: 257, pan: 11, volume: 99, priority: 3, length: 140 });
    expect(runtime.lastCryParams?.tone).toEqual({ table: 2, index: 1, reverse: false });
  });

  it('preserves cry wrapper ducking, playback-state, multi-battle, and clear/stop behavior', () => {
    const runtime = createSoundRuntime();

    PlayCry_Normal(runtime, 25, 7);
    expect(runtime.gPokemonCryBGMDuckingCounter).toBe(2);
    expect(runtime.operations).toContain(`m4aMPlayVolumeControl:BGM:${TRACKS_ALL}:85`);
    expect(FuncIsActiveTask(runtime, 'Task_DuckBGMForPokemonCry')).toBe(true);
    expect(runtime.lastCryParams).toMatchObject({ volume: CRY_VOLUME, priority: CRY_PRIORITY_NORMAL, mode: CRY_MODE_NORMAL });

    const duckTaskId = runtime.tasks.findIndex((task) => task.func === 'Task_DuckBGMForPokemonCry');
    runSoundTask(runtime, duckTaskId);
    expect(runtime.gPokemonCryBGMDuckingCounter).toBe(1);
    runtime.gPokemonCryBGMDuckingCounter = 0;
    runtime.pokemonCryPlaying = false;
    runSoundTask(runtime, duckTaskId);
    expect(runtime.gMPlayInfo_BGM.volume).toBe(256);
    expect(runtime.tasks[duckTaskId].destroyed).toBe(true);

    const doublesRuntime = createSoundRuntime();
    PlayCry_ByMode(doublesRuntime, 10, 3, CRY_MODE_DOUBLES);
    expect(doublesRuntime.operations.some((op) => op === `m4aMPlayVolumeControl:BGM:${TRACKS_ALL}:85`)).toBe(false);

    const multiRuntime = createSoundRuntime();
    multiRuntime.gBattleTypeFlags = BATTLE_TYPE_MULTI;
    PlayCry_ReleaseDouble(multiRuntime, 10, 3, CRY_MODE_WEAK);
    expect(multiRuntime.operations.some((op) => op === `m4aMPlayVolumeControl:BGM:${TRACKS_ALL}:85`)).toBe(false);

    const scriptRuntime = createSoundRuntime();
    scriptRuntime.gQuestLogState = QL_STATE_PLAYBACK_LAST;
    PlayCry_Script(scriptRuntime, 10, CRY_MODE_FAINT);
    expect(scriptRuntime.lastCryParams).toBeNull();
    expect(scriptRuntime.gPokemonCryBGMDuckingCounter).toBe(2);
    expect(FuncIsActiveTask(scriptRuntime, 'Task_DuckBGMForPokemonCry')).toBe(true);

    expect(IsCryFinished(scriptRuntime)).toBe(false);
    scriptRuntime.tasks[0].destroyed = true;
    expect(IsCryFinished(scriptRuntime)).toBe(true);
    expect(scriptRuntime.operations.at(-1)).toBe('ClearPokemonCrySongs');

    PlayCry_NormalNoDucking(scriptRuntime, 1, 0, CRY_VOLUME, CRY_PRIORITY_NORMAL);
    expect(IsCryPlaying(scriptRuntime)).toBe(true);
    expect(IsCryPlayingOrClearCrySongs(scriptRuntime)).toBe(true);
    StopCry(scriptRuntime);
    expect(scriptRuntime.operations.at(-1)).toBe('m4aMPlayStop:PokemonCry');
    scriptRuntime.pokemonCryPlaying = false;
    expect(IsCryPlayingOrClearCrySongs(scriptRuntime)).toBe(false);
    StopCryAndClearCrySongs(scriptRuntime);
    expect(scriptRuntime.operations.slice(-2)).toEqual(['m4aMPlayStop:PokemonCry', 'ClearPokemonCrySongs']);
  });

  it('toggles help-system volume suppression exactly around BGM volume writes', () => {
    const runtime = createSoundRuntime();

    SetBGMVolume_SuppressHelpSystemReduction(runtime, 123);
    expect(runtime.gDisableHelpSystemVolumeReduce).toBe(true);
    expect(runtime.gMPlayInfo_BGM.volume).toBe(123);
    BGMVolumeMax_EnableHelpSystemReduction(runtime);
    expect(runtime.gDisableHelpSystemVolumeReduce).toBe(false);
    expect(runtime.gMPlayInfo_BGM.volume).toBe(256);
  });
});
