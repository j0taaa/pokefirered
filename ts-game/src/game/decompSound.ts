export const MUS_DUMMY = 0;
export const MUS_HEAL = 256;
export const MUS_LEVEL_UP = 257;
export const MUS_OBTAIN_ITEM = 258;
export const MUS_EVOLVED = 259;
export const MUS_OBTAIN_BADGE = 260;
export const MUS_OBTAIN_TMHM = 261;
export const MUS_OBTAIN_BERRY = 262;
export const MUS_SLOTS_JACKPOT = 268;
export const MUS_SLOTS_WIN = 269;
export const MUS_MOVE_DELETED = 270;
export const MUS_TOO_BAD = 271;
export const MUS_DEX_RATING = 317;
export const MUS_OBTAIN_KEY_ITEM = 318;
export const MUS_POKE_FLUTE = 338;
export const MUS_NONE = 0xffff;

export const FANFARE_LEVEL_UP = 0;
export const FANFARE_OBTAIN_ITEM = 1;
export const FANFARE_EVOLVED = 2;
export const FANFARE_OBTAIN_TMHM = 3;
export const FANFARE_HEAL = 4;
export const FANFARE_OBTAIN_BADGE = 5;
export const FANFARE_MOVE_DELETED = 6;
export const FANFARE_OBTAIN_BERRY = 7;
export const FANFARE_SLOTS_JACKPOT = 8;
export const FANFARE_SLOTS_WIN = 9;
export const FANFARE_TOO_BAD = 10;
export const FANFARE_POKE_FLUTE = 11;
export const FANFARE_KEY_ITEM = 12;
export const FANFARE_DEX_EVAL = 13;

export const CRY_MODE_NORMAL = 0;
export const CRY_MODE_DOUBLES = 1;
export const CRY_MODE_ENCOUNTER = 2;
export const CRY_MODE_HIGH_PITCH = 3;
export const CRY_MODE_ECHO_START = 4;
export const CRY_MODE_FAINT = 5;
export const CRY_MODE_ECHO_END = 6;
export const CRY_MODE_ROAR_1 = 7;
export const CRY_MODE_ROAR_2 = 8;
export const CRY_MODE_GROWL_1 = 9;
export const CRY_MODE_GROWL_2 = 10;
export const CRY_MODE_WEAK = 11;
export const CRY_MODE_WEAK_DOUBLES = 12;
export const CRY_PRIORITY_NORMAL = 10;
export const CRY_VOLUME = 120;

export const QL_STATE_PLAYBACK = 2;
export const QL_STATE_PLAYBACK_LAST = 3;
export const BATTLE_TYPE_MULTI = 1 << 6;
export const MUSICPLAYER_STATUS_TRACK = 0x0000ffff;
export const MUSICPLAYER_STATUS_PAUSE = 0x80000000;
export const TRACKS_ALL = 0xffff;

export type SoundTaskFunc = 'Task_Fanfare' | 'Task_DuckBGMForPokemonCry';
export type MusicPlayerName = 'BGM' | 'SE1' | 'SE2' | 'SE3' | 'PokemonCry';

export type MusicPlayerInfo = {
  name: MusicPlayerName;
  status: number;
  volume: number;
  pan: number;
};

export type SoundTask = {
  func: SoundTaskFunc;
  priority: number;
  destroyed: boolean;
};

export type CryToneSelection = {
  table: number;
  index: number;
  reverse: boolean;
};

export type PokemonCryParams = {
  species: number;
  pan: number;
  volume: number;
  priority: number;
  mode: number;
  length: number;
  reverse: boolean;
  release: number;
  pitch: number;
  chorus: number;
  progress: number;
  tone: CryToneSelection;
};

export type SoundRuntime = {
  gDisableMapMusicChangeOnMapLoad: number;
  gDisableHelpSystemVolumeReduce: boolean;
  gDisableMusic: boolean;
  gBattleTypeFlags: number;
  gQuestLogState: number;
  gMPlayInfo_BGM: MusicPlayerInfo;
  gMPlayInfo_SE1: MusicPlayerInfo;
  gMPlayInfo_SE2: MusicPlayerInfo;
  gMPlayInfo_SE3: MusicPlayerInfo;
  gMPlay_PokemonCry: MusicPlayerInfo | null;
  gPokemonCryBGMDuckingCounter: number;
  sCurrentMapMusic: number;
  sNextMapMusic: number;
  sMapMusicState: number;
  sMapMusicFadeInSpeed: number;
  sFanfareCounter: number;
  tasks: SoundTask[];
  operations: string[];
  pokemonCryPlaying: boolean;
  lastCryParams: PokemonCryParams | null;
  speciesToCryId: (species: number) => number;
};

export const sFanfares = [
  { songNum: MUS_LEVEL_UP, duration: 80 },
  { songNum: MUS_OBTAIN_ITEM, duration: 160 },
  { songNum: MUS_EVOLVED, duration: 220 },
  { songNum: MUS_OBTAIN_TMHM, duration: 220 },
  { songNum: MUS_HEAL, duration: 160 },
  { songNum: MUS_OBTAIN_BADGE, duration: 340 },
  { songNum: MUS_MOVE_DELETED, duration: 180 },
  { songNum: MUS_OBTAIN_BERRY, duration: 120 },
  { songNum: MUS_SLOTS_JACKPOT, duration: 250 },
  { songNum: MUS_SLOTS_WIN, duration: 150 },
  { songNum: MUS_TOO_BAD, duration: 160 },
  { songNum: MUS_POKE_FLUTE, duration: 450 },
  { songNum: MUS_OBTAIN_KEY_ITEM, duration: 170 },
  { songNum: MUS_DEX_RATING, duration: 196 },
] as const;

const player = (name: MusicPlayerName): MusicPlayerInfo => ({ name, status: 0, volume: 256, pan: 0 });

export const createSoundRuntime = (): SoundRuntime => ({
  gDisableMapMusicChangeOnMapLoad: 0,
  gDisableHelpSystemVolumeReduce: false,
  gDisableMusic: false,
  gBattleTypeFlags: 0,
  gQuestLogState: 0,
  gMPlayInfo_BGM: player('BGM'),
  gMPlayInfo_SE1: player('SE1'),
  gMPlayInfo_SE2: player('SE2'),
  gMPlayInfo_SE3: player('SE3'),
  gMPlay_PokemonCry: null,
  gPokemonCryBGMDuckingCounter: 0,
  sCurrentMapMusic: 0,
  sNextMapMusic: 0,
  sMapMusicState: 0,
  sMapMusicFadeInSpeed: 0,
  sFanfareCounter: 0,
  tasks: [],
  operations: [],
  pokemonCryPlaying: false,
  lastCryParams: null,
  speciesToCryId: (species) => species,
});

const qlIsPlaybackState = (runtime: SoundRuntime): boolean => runtime.gQuestLogState === QL_STATE_PLAYBACK || runtime.gQuestLogState === QL_STATE_PLAYBACK_LAST;

export const CreateTask = (runtime: SoundRuntime, func: SoundTaskFunc, priority: number): number => {
  const id = runtime.tasks.length;
  runtime.tasks.push({ func, priority, destroyed: false });
  runtime.operations.push(`CreateTask:${func}:${priority}`);
  return id;
};

export const DestroyTask = (runtime: SoundRuntime, taskId: number): void => {
  runtime.tasks[taskId].destroyed = true;
  runtime.operations.push(`DestroyTask:${taskId}`);
};

export const FuncIsActiveTask = (runtime: SoundRuntime, func: SoundTaskFunc): boolean => runtime.tasks.some((task) => task.func === func && !task.destroyed);

export const m4aSongNumStart = (runtime: SoundRuntime, songNum: number): void => {
  runtime.operations.push(`m4aSongNumStart:${songNum}`);
};

export const m4aSongNumStop = (runtime: SoundRuntime, songNum: number): void => {
  runtime.operations.push(`m4aSongNumStop:${songNum}`);
};

export const m4aMPlayStop = (runtime: SoundRuntime, playerInfo: MusicPlayerInfo | null): void => {
  if (playerInfo) playerInfo.status = 0;
  runtime.operations.push(`m4aMPlayStop:${playerInfo?.name ?? 'null'}`);
};

export const m4aMPlayContinue = (runtime: SoundRuntime, playerInfo: MusicPlayerInfo): void => {
  playerInfo.status &= ~MUSICPLAYER_STATUS_PAUSE;
  runtime.operations.push(`m4aMPlayContinue:${playerInfo.name}`);
};

export const m4aMPlayImmInit = (runtime: SoundRuntime, playerInfo: MusicPlayerInfo): void => {
  runtime.operations.push(`m4aMPlayImmInit:${playerInfo.name}`);
};

export const m4aMPlayVolumeControl = (runtime: SoundRuntime, playerInfo: MusicPlayerInfo, tracks: number, volume: number): void => {
  playerInfo.volume = volume;
  runtime.operations.push(`m4aMPlayVolumeControl:${playerInfo.name}:${tracks}:${volume}`);
};

export const m4aMPlayPanpotControl = (runtime: SoundRuntime, playerInfo: MusicPlayerInfo, tracks: number, pan: number): void => {
  playerInfo.pan = pan;
  runtime.operations.push(`m4aMPlayPanpotControl:${playerInfo.name}:${tracks}:${pan}`);
};

export const m4aMPlayFadeIn = (runtime: SoundRuntime, playerInfo: MusicPlayerInfo, speed: number): void => {
  runtime.operations.push(`m4aMPlayFadeIn:${playerInfo.name}:${speed}`);
};

export const m4aMPlayFadeOut = (runtime: SoundRuntime, playerInfo: MusicPlayerInfo, speed: number): void => {
  runtime.operations.push(`m4aMPlayFadeOut:${playerInfo.name}:${speed}`);
};

export const m4aMPlayFadeOutTemporarily = (runtime: SoundRuntime, playerInfo: MusicPlayerInfo, speed: number): void => {
  runtime.operations.push(`m4aMPlayFadeOutTemporarily:${playerInfo.name}:${speed}`);
};

export const InitMapMusic = (runtime: SoundRuntime): void => {
  runtime.gDisableMusic = false;
  ResetMapMusic(runtime);
};

export const ResetMapMusic = (runtime: SoundRuntime): void => {
  runtime.sCurrentMapMusic = 0;
  runtime.sNextMapMusic = 0;
  runtime.sMapMusicState = 0;
  runtime.sMapMusicFadeInSpeed = 0;
};

export const GetCurrentMapMusic = (runtime: SoundRuntime): number => runtime.sCurrentMapMusic;

export const MapMusicMain = (runtime: SoundRuntime): void => {
  switch (runtime.sMapMusicState) {
    case 0:
    case 2:
    case 3:
    case 4:
      break;
    case 1:
      runtime.sMapMusicState = 2;
      PlayBGM(runtime, runtime.sCurrentMapMusic);
      break;
    case 5:
      if (IsBGMStopped(runtime)) {
        runtime.sNextMapMusic = 0;
        runtime.sMapMusicState = 0;
      }
      break;
    case 6:
      if (IsBGMStopped(runtime) && IsFanfareTaskInactive(runtime)) {
        runtime.sCurrentMapMusic = runtime.sNextMapMusic;
        runtime.sNextMapMusic = 0;
        runtime.sMapMusicState = 2;
        PlayBGM(runtime, runtime.sCurrentMapMusic);
      }
      break;
    case 7:
      if (IsBGMStopped(runtime) && IsFanfareTaskInactive(runtime)) {
        FadeInNewBGM(runtime, runtime.sNextMapMusic, runtime.sMapMusicFadeInSpeed);
        runtime.sCurrentMapMusic = runtime.sNextMapMusic;
        runtime.sNextMapMusic = 0;
        runtime.sMapMusicState = 2;
        runtime.sMapMusicFadeInSpeed = 0;
      }
      break;
  }
};

export const PlayNewMapMusic = (runtime: SoundRuntime, songNum: number): void => {
  runtime.sCurrentMapMusic = songNum;
  runtime.sNextMapMusic = 0;
  runtime.sMapMusicState = 1;
};

export const StopMapMusic = (runtime: SoundRuntime): void => {
  runtime.sCurrentMapMusic = 0;
  runtime.sNextMapMusic = 0;
  runtime.sMapMusicState = 1;
};

export const FadeOutMapMusic = (runtime: SoundRuntime, speed: number): void => {
  if (IsNotWaitingForBGMStop(runtime)) FadeOutBGM(runtime, speed);
  runtime.sCurrentMapMusic = 0;
  runtime.sNextMapMusic = 0;
  runtime.sMapMusicState = 5;
};

export const FadeOutAndPlayNewMapMusic = (runtime: SoundRuntime, songNum: number, speed: number): void => {
  FadeOutMapMusic(runtime, speed);
  runtime.sCurrentMapMusic = 0;
  runtime.sNextMapMusic = songNum;
  runtime.sMapMusicState = 6;
};

export const FadeOutAndFadeInNewMapMusic = (runtime: SoundRuntime, songNum: number, fadeOutSpeed: number, fadeInSpeed: number): void => {
  FadeOutMapMusic(runtime, fadeOutSpeed);
  runtime.sCurrentMapMusic = 0;
  runtime.sNextMapMusic = songNum;
  runtime.sMapMusicState = 7;
  runtime.sMapMusicFadeInSpeed = fadeInSpeed;
};

export const FadeInNewMapMusic = (runtime: SoundRuntime, songNum: number, speed: number): void => {
  FadeInNewBGM(runtime, songNum, speed);
  runtime.sCurrentMapMusic = songNum;
  runtime.sNextMapMusic = 0;
  runtime.sMapMusicState = 2;
  runtime.sMapMusicFadeInSpeed = 0;
};

export const IsNotWaitingForBGMStop = (runtime: SoundRuntime): boolean => runtime.sMapMusicState !== 6 && runtime.sMapMusicState !== 5 && runtime.sMapMusicState !== 7;

export const PlayFanfareByFanfareNum = (runtime: SoundRuntime, fanfareNum: number): void => {
  if (runtime.gQuestLogState === QL_STATE_PLAYBACK) {
    runtime.sFanfareCounter = 0xff;
  } else {
    m4aMPlayStop(runtime, runtime.gMPlayInfo_BGM);
    runtime.sFanfareCounter = sFanfares[fanfareNum].duration;
    m4aSongNumStart(runtime, sFanfares[fanfareNum].songNum);
  }
};

export const WaitFanfare = (runtime: SoundRuntime, stop: boolean): boolean => {
  if (runtime.sFanfareCounter) {
    runtime.sFanfareCounter -= 1;
    return false;
  }
  if (!stop) m4aMPlayContinue(runtime, runtime.gMPlayInfo_BGM);
  else m4aSongNumStart(runtime, MUS_DUMMY);
  return true;
};

export const StopFanfareByFanfareNum = (runtime: SoundRuntime, fanfareNum: number): void => {
  m4aSongNumStop(runtime, sFanfares[fanfareNum].songNum);
};

export const PlayFanfare = (runtime: SoundRuntime, songNum: number): void => {
  for (let i = 0; i < sFanfares.length; i += 1) {
    if (sFanfares[i].songNum === songNum) {
      PlayFanfareByFanfareNum(runtime, i);
      CreateFanfareTask(runtime);
      return;
    }
  }
  PlayFanfareByFanfareNum(runtime, 0);
  CreateFanfareTask(runtime);
};

export const IsFanfareTaskInactive = (runtime: SoundRuntime): boolean => FuncIsActiveTask(runtime, 'Task_Fanfare') !== true;

export const Task_Fanfare = (runtime: SoundRuntime, taskId: number): void => {
  if (runtime.sFanfareCounter) runtime.sFanfareCounter -= 1;
  else {
    m4aMPlayContinue(runtime, runtime.gMPlayInfo_BGM);
    DestroyTask(runtime, taskId);
  }
};

export const CreateFanfareTask = (runtime: SoundRuntime): void => {
  if (FuncIsActiveTask(runtime, 'Task_Fanfare') !== true) CreateTask(runtime, 'Task_Fanfare', 80);
};

export const FadeInNewBGM = (runtime: SoundRuntime, songNum: number, speed: number): void => {
  let resolvedSongNum = songNum;
  if (runtime.gDisableMusic) resolvedSongNum = 0;
  if (resolvedSongNum === MUS_NONE) resolvedSongNum = 0;
  m4aSongNumStart(runtime, resolvedSongNum);
  m4aMPlayImmInit(runtime, runtime.gMPlayInfo_BGM);
  m4aMPlayVolumeControl(runtime, runtime.gMPlayInfo_BGM, TRACKS_ALL, 0);
  m4aSongNumStop(runtime, resolvedSongNum);
  m4aMPlayFadeIn(runtime, runtime.gMPlayInfo_BGM, speed);
};

export const FadeOutBGMTemporarily = (runtime: SoundRuntime, speed: number): void => m4aMPlayFadeOutTemporarily(runtime, runtime.gMPlayInfo_BGM, speed);
export const IsBGMPausedOrStopped = (runtime: SoundRuntime): boolean => !!(runtime.gMPlayInfo_BGM.status & MUSICPLAYER_STATUS_PAUSE) || !(runtime.gMPlayInfo_BGM.status & MUSICPLAYER_STATUS_TRACK);
export const FadeInBGM = (runtime: SoundRuntime, speed: number): void => m4aMPlayFadeIn(runtime, runtime.gMPlayInfo_BGM, speed);
export const FadeOutBGM = (runtime: SoundRuntime, speed: number): void => m4aMPlayFadeOut(runtime, runtime.gMPlayInfo_BGM, speed);
export const IsBGMStopped = (runtime: SoundRuntime): boolean => !(runtime.gMPlayInfo_BGM.status & MUSICPLAYER_STATUS_TRACK);

export const PlayCry_Normal = (runtime: SoundRuntime, species: number, pan: number): void => {
  m4aMPlayVolumeControl(runtime, runtime.gMPlayInfo_BGM, TRACKS_ALL, 85);
  PlayCryInternal(runtime, species, pan, CRY_VOLUME, CRY_PRIORITY_NORMAL, CRY_MODE_NORMAL);
  runtime.gPokemonCryBGMDuckingCounter = 2;
  RestoreBGMVolumeAfterPokemonCry(runtime);
};

export const PlayCry_NormalNoDucking = (runtime: SoundRuntime, species: number, pan: number, volume: number, priority: number): void => {
  PlayCryInternal(runtime, species, pan, volume, priority, CRY_MODE_NORMAL);
};

export const PlayCry_ByMode = (runtime: SoundRuntime, species: number, pan: number, mode: number): void => {
  if (mode === CRY_MODE_DOUBLES) {
    PlayCryInternal(runtime, species, pan, CRY_VOLUME, CRY_PRIORITY_NORMAL, mode);
  } else {
    m4aMPlayVolumeControl(runtime, runtime.gMPlayInfo_BGM, TRACKS_ALL, 85);
    PlayCryInternal(runtime, species, pan, CRY_VOLUME, CRY_PRIORITY_NORMAL, mode);
    runtime.gPokemonCryBGMDuckingCounter = 2;
    RestoreBGMVolumeAfterPokemonCry(runtime);
  }
};

export const PlayCry_ReleaseDouble = (runtime: SoundRuntime, species: number, pan: number, mode: number): void => {
  if (mode === CRY_MODE_DOUBLES) {
    PlayCryInternal(runtime, species, pan, CRY_VOLUME, CRY_PRIORITY_NORMAL, mode);
  } else {
    if (!(runtime.gBattleTypeFlags & BATTLE_TYPE_MULTI)) m4aMPlayVolumeControl(runtime, runtime.gMPlayInfo_BGM, TRACKS_ALL, 85);
    PlayCryInternal(runtime, species, pan, CRY_VOLUME, CRY_PRIORITY_NORMAL, mode);
  }
};

export const PlayCry_Script = (runtime: SoundRuntime, species: number, mode: number): void => {
  if (!qlIsPlaybackState(runtime)) {
    m4aMPlayVolumeControl(runtime, runtime.gMPlayInfo_BGM, TRACKS_ALL, 85);
    PlayCryInternal(runtime, species, 0, CRY_VOLUME, CRY_PRIORITY_NORMAL, mode);
  }
  runtime.gPokemonCryBGMDuckingCounter = 2;
  RestoreBGMVolumeAfterPokemonCry(runtime);
};

export const PlayCryInternal = (runtime: SoundRuntime, species: number, pan: number, volume: number, priority: number, mode: number): void => {
  let crySpecies = species - 1;
  let length = 140;
  let reverse = false;
  let release = 0;
  let pitch = 15360;
  let chorus = 0;
  let resolvedVolume = volume;

  switch (mode) {
    case CRY_MODE_NORMAL:
      break;
    case CRY_MODE_DOUBLES:
      length = 20; release = 225; break;
    case CRY_MODE_ENCOUNTER:
      release = 225; pitch = 15600; chorus = 20; resolvedVolume = 90; break;
    case CRY_MODE_HIGH_PITCH:
      length = 50; release = 200; pitch = 15800; chorus = 20; resolvedVolume = 90; break;
    case CRY_MODE_ECHO_START:
      length = 25; reverse = true; release = 100; pitch = 15600; chorus = 192; resolvedVolume = 90; break;
    case CRY_MODE_FAINT:
      release = 200; pitch = 14440; break;
    case CRY_MODE_ECHO_END:
      release = 220; pitch = 15555; chorus = 192; resolvedVolume = 90; break;
    case CRY_MODE_ROAR_1:
      length = 10; release = 100; pitch = 14848; break;
    case CRY_MODE_ROAR_2:
      length = 60; release = 225; pitch = 15616; break;
    case CRY_MODE_GROWL_1:
      length = 15; reverse = true; release = 125; pitch = 15200; break;
    case CRY_MODE_GROWL_2:
      length = 100; release = 225; pitch = 15200; break;
    case CRY_MODE_WEAK_DOUBLES:
      length = 20; release = 225;
    // fallthrough
    case CRY_MODE_WEAK:
      pitch = 15000; break;
  }

  crySpecies = runtime.speciesToCryId(crySpecies);
  const index = crySpecies % 128;
  const table = Math.trunc(crySpecies / 128);
  runtime.gMPlay_PokemonCry = runtime.gMPlay_PokemonCry ?? player('PokemonCry');
  runtime.pokemonCryPlaying = true;
  runtime.lastCryParams = {
    species: crySpecies,
    pan,
    volume: resolvedVolume,
    priority,
    mode,
    length,
    reverse,
    release,
    pitch,
    chorus,
    progress: 0,
    tone: { table, index, reverse },
  };
  runtime.operations.push(`SetPokemonCryVolume:${resolvedVolume}`);
  runtime.operations.push(`SetPokemonCryPanpot:${pan}`);
  runtime.operations.push(`SetPokemonCryPitch:${pitch}`);
  runtime.operations.push(`SetPokemonCryLength:${length}`);
  runtime.operations.push('SetPokemonCryProgress:0');
  runtime.operations.push(`SetPokemonCryRelease:${release}`);
  runtime.operations.push(`SetPokemonCryChorus:${chorus}`);
  runtime.operations.push(`SetPokemonCryPriority:${priority}`);
  if (table >= 0 && table <= 3) runtime.operations.push(`SetPokemonCryTone:${table}:${index}:${reverse ? 'reverse' : 'normal'}`);
};

export const ClearPokemonCrySongs = (runtime: SoundRuntime): void => {
  runtime.pokemonCryPlaying = false;
  runtime.operations.push('ClearPokemonCrySongs');
};

export const IsPokemonCryPlaying = (runtime: SoundRuntime, _playerInfo: MusicPlayerInfo | null): boolean => runtime.pokemonCryPlaying;

export const IsCryFinished = (runtime: SoundRuntime): boolean => {
  if (FuncIsActiveTask(runtime, 'Task_DuckBGMForPokemonCry') === true) return false;
  ClearPokemonCrySongs(runtime);
  return true;
};

export const StopCryAndClearCrySongs = (runtime: SoundRuntime): void => {
  m4aMPlayStop(runtime, runtime.gMPlay_PokemonCry);
  ClearPokemonCrySongs(runtime);
};

export const StopCry = (runtime: SoundRuntime): void => m4aMPlayStop(runtime, runtime.gMPlay_PokemonCry);

export const IsCryPlayingOrClearCrySongs = (runtime: SoundRuntime): boolean => {
  if (IsPokemonCryPlaying(runtime, runtime.gMPlay_PokemonCry)) return true;
  ClearPokemonCrySongs(runtime);
  return false;
};

export const IsCryPlaying = (runtime: SoundRuntime): boolean => IsPokemonCryPlaying(runtime, runtime.gMPlay_PokemonCry) ? true : false;

export const Task_DuckBGMForPokemonCry = (runtime: SoundRuntime, taskId: number): void => {
  if (runtime.gPokemonCryBGMDuckingCounter) {
    runtime.gPokemonCryBGMDuckingCounter -= 1;
    return;
  }
  if (!IsPokemonCryPlaying(runtime, runtime.gMPlay_PokemonCry)) {
    m4aMPlayVolumeControl(runtime, runtime.gMPlayInfo_BGM, TRACKS_ALL, 256);
    DestroyTask(runtime, taskId);
  }
};

export const RestoreBGMVolumeAfterPokemonCry = (runtime: SoundRuntime): void => {
  if (FuncIsActiveTask(runtime, 'Task_DuckBGMForPokemonCry') !== true) CreateTask(runtime, 'Task_DuckBGMForPokemonCry', 80);
};

export const PlayBGM = (runtime: SoundRuntime, songNum: number): void => {
  let resolvedSongNum = songNum;
  if (runtime.gDisableMusic) resolvedSongNum = 0;
  if (resolvedSongNum === MUS_NONE) resolvedSongNum = 0;
  m4aSongNumStart(runtime, resolvedSongNum);
};

export const PlaySE = (runtime: SoundRuntime, songNum: number): void => {
  if (runtime.gDisableMapMusicChangeOnMapLoad === 0 && runtime.gQuestLogState !== QL_STATE_PLAYBACK) m4aSongNumStart(runtime, songNum);
};

export const PlaySE12WithPanning = (runtime: SoundRuntime, songNum: number, pan: number): void => {
  m4aSongNumStart(runtime, songNum);
  m4aMPlayImmInit(runtime, runtime.gMPlayInfo_SE1);
  m4aMPlayImmInit(runtime, runtime.gMPlayInfo_SE2);
  m4aMPlayPanpotControl(runtime, runtime.gMPlayInfo_SE1, TRACKS_ALL, pan);
  m4aMPlayPanpotControl(runtime, runtime.gMPlayInfo_SE2, TRACKS_ALL, pan);
};

export const PlaySE1WithPanning = (runtime: SoundRuntime, songNum: number, pan: number): void => {
  m4aSongNumStart(runtime, songNum);
  m4aMPlayImmInit(runtime, runtime.gMPlayInfo_SE1);
  m4aMPlayPanpotControl(runtime, runtime.gMPlayInfo_SE1, TRACKS_ALL, pan);
};

export const PlaySE2WithPanning = (runtime: SoundRuntime, songNum: number, pan: number): void => {
  m4aSongNumStart(runtime, songNum);
  m4aMPlayImmInit(runtime, runtime.gMPlayInfo_SE2);
  m4aMPlayPanpotControl(runtime, runtime.gMPlayInfo_SE2, TRACKS_ALL, pan);
};

export const SE12PanpotControl = (runtime: SoundRuntime, pan: number): void => {
  m4aMPlayPanpotControl(runtime, runtime.gMPlayInfo_SE1, TRACKS_ALL, pan);
  m4aMPlayPanpotControl(runtime, runtime.gMPlayInfo_SE2, TRACKS_ALL, pan);
};

export const IsSEPlaying = (runtime: SoundRuntime): boolean => {
  if ((runtime.gMPlayInfo_SE1.status & MUSICPLAYER_STATUS_PAUSE) && (runtime.gMPlayInfo_SE2.status & MUSICPLAYER_STATUS_PAUSE)) return false;
  if (!(runtime.gMPlayInfo_SE1.status & MUSICPLAYER_STATUS_TRACK) && !(runtime.gMPlayInfo_SE2.status & MUSICPLAYER_STATUS_TRACK)) return false;
  return true;
};

export const IsBGMPlaying = (runtime: SoundRuntime): boolean => {
  if (runtime.gMPlayInfo_BGM.status & MUSICPLAYER_STATUS_PAUSE) return false;
  if (!(runtime.gMPlayInfo_BGM.status & MUSICPLAYER_STATUS_TRACK)) return false;
  return true;
};

export const IsSpecialSEPlaying = (runtime: SoundRuntime): boolean => {
  if (runtime.gMPlayInfo_SE3.status & MUSICPLAYER_STATUS_PAUSE) return false;
  if (!(runtime.gMPlayInfo_SE3.status & MUSICPLAYER_STATUS_TRACK)) return false;
  return true;
};

export const SetBGMVolume_SuppressHelpSystemReduction = (runtime: SoundRuntime, volume: number): void => {
  runtime.gDisableHelpSystemVolumeReduce = true;
  m4aMPlayVolumeControl(runtime, runtime.gMPlayInfo_BGM, TRACKS_ALL, volume);
};

export const BGMVolumeMax_EnableHelpSystemReduction = (runtime: SoundRuntime): void => {
  runtime.gDisableHelpSystemVolumeReduce = false;
  m4aMPlayVolumeControl(runtime, runtime.gMPlayInfo_BGM, TRACKS_ALL, 256);
};

export const runSoundTask = (runtime: SoundRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  if (task.destroyed) return;
  if (task.func === 'Task_Fanfare') Task_Fanfare(runtime, taskId);
  else Task_DuckBGMForPokemonCry(runtime, taskId);
};
