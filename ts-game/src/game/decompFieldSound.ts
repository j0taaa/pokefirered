import type { ScriptRuntimeState } from './scripts';

const MUS_LEVEL_UP = 257;
const MUS_OBTAIN_ITEM = 258;
const MUS_EVOLVED = 259;
const MUS_OBTAIN_BADGE = 260;
const MUS_OBTAIN_TMHM = 261;
const MUS_HEAL = 256;
const MUS_OBTAIN_BERRY = 262;
const MUS_SLOTS_JACKPOT = 268;
const MUS_SLOTS_WIN = 269;
const MUS_MOVE_DELETED = 270;
const MUS_TOO_BAD = 271;
const MUS_POKE_FLUTE = 338;
const MUS_OBTAIN_KEY_ITEM = 318;
const MUS_DEX_RATING = 317;

const FANFARE_DURATIONS_BY_SONG = new Map<number, number>([
  [MUS_LEVEL_UP, 80],
  [MUS_OBTAIN_ITEM, 160],
  [MUS_EVOLVED, 220],
  [MUS_OBTAIN_TMHM, 220],
  [MUS_HEAL, 160],
  [MUS_OBTAIN_BADGE, 340],
  [MUS_MOVE_DELETED, 180],
  [MUS_OBTAIN_BERRY, 120],
  [MUS_SLOTS_JACKPOT, 250],
  [MUS_SLOTS_WIN, 150],
  [MUS_TOO_BAD, 160],
  [MUS_POKE_FLUTE, 450],
  [MUS_OBTAIN_KEY_ITEM, 170],
  [MUS_DEX_RATING, 196]
]);

export interface FieldAudioState {
  fanfareCounter: number;
  fanfareTaskActive: boolean;
  fanfareSong: number | null;
  bgmPausedForFanfare: boolean;
  playedFanfares: number[];
  playedSoundEffects: number[];
  currentMapMusic: number;
  nextMapMusic: number;
  savedMusic: number;
  defaultMapMusic: number;
  mapMusicState: number;
  bgmHistory: Array<{
    kind: 'playNewMapMusic' | 'saveBgm' | 'fadeDefaultBgm' | 'fadeOutBgm' | 'fadeInBgm' | 'fadeNewBgm';
    song: number;
    save?: boolean;
    speed?: number;
  }>;
}

export const createFieldAudioState = (): FieldAudioState => ({
  fanfareCounter: 0,
  fanfareTaskActive: false,
  fanfareSong: null,
  bgmPausedForFanfare: false,
  playedFanfares: [],
  playedSoundEffects: [],
  currentMapMusic: 0,
  nextMapMusic: 0,
  savedMusic: 0,
  defaultMapMusic: 0,
  mapMusicState: 0,
  bgmHistory: []
});

export const playFieldSoundEffect = (runtime: ScriptRuntimeState, songNum: number): void => {
  runtime.fieldAudio.playedSoundEffects.push(songNum);
};

export const playFieldBgm = (runtime: ScriptRuntimeState, songNum: number, save: boolean): void => {
  if (save) {
    runtime.fieldAudio.savedMusic = songNum;
  }
  runtime.fieldAudio.currentMapMusic = songNum;
  runtime.fieldAudio.nextMapMusic = 0;
  runtime.fieldAudio.mapMusicState = 1;
  runtime.fieldAudio.bgmHistory.push({ kind: 'playNewMapMusic', song: songNum, save });
};

export const saveFieldBgm = (runtime: ScriptRuntimeState, songNum: number): void => {
  runtime.fieldAudio.savedMusic = songNum;
  runtime.fieldAudio.bgmHistory.push({ kind: 'saveBgm', song: songNum });
};

export const setFieldDefaultMapMusic = (runtime: ScriptRuntimeState, songNum: number): void => {
  runtime.fieldAudio.defaultMapMusic = songNum;
};

export const fadeDefaultFieldBgm = (runtime: ScriptRuntimeState): void => {
  const defaultMusic = runtime.fieldAudio.defaultMapMusic;
  if (runtime.fieldAudio.currentMapMusic === defaultMusic) {
    runtime.fieldAudio.bgmHistory.push({ kind: 'fadeDefaultBgm', song: defaultMusic, speed: 8 });
    return;
  }
  runtime.fieldAudio.currentMapMusic = 0;
  runtime.fieldAudio.nextMapMusic = defaultMusic;
  runtime.fieldAudio.mapMusicState = 6;
  runtime.fieldAudio.bgmHistory.push({ kind: 'fadeDefaultBgm', song: defaultMusic, speed: 8 });
};

export const fadeOutFieldBgm = (runtime: ScriptRuntimeState, speed: number): void => {
  runtime.fieldAudio.currentMapMusic = 0;
  runtime.fieldAudio.nextMapMusic = 0;
  runtime.fieldAudio.mapMusicState = 5;
  runtime.fieldAudio.bgmHistory.push({ kind: 'fadeOutBgm', song: 0, speed });
};

export const fadeInFieldBgm = (runtime: ScriptRuntimeState, speed: number): void => {
  const song = runtime.fieldAudio.currentMapMusic || runtime.fieldAudio.savedMusic;
  runtime.fieldAudio.currentMapMusic = song;
  runtime.fieldAudio.nextMapMusic = 0;
  runtime.fieldAudio.mapMusicState = 2;
  runtime.fieldAudio.bgmHistory.push({ kind: 'fadeInBgm', song, speed });
};

export const fadeNewFieldBgm = (runtime: ScriptRuntimeState, songNum: number, speed: number): void => {
  runtime.fieldAudio.currentMapMusic = 0;
  runtime.fieldAudio.nextMapMusic = songNum;
  runtime.fieldAudio.mapMusicState = 6;
  runtime.fieldAudio.bgmHistory.push({ kind: 'fadeNewBgm', song: songNum, speed });
};

export const playFieldFanfare = (runtime: ScriptRuntimeState, songNum: number): void => {
  const song = FANFARE_DURATIONS_BY_SONG.has(songNum) ? songNum : MUS_LEVEL_UP;
  runtime.fieldAudio.fanfareCounter = FANFARE_DURATIONS_BY_SONG.get(song) ?? 80;
  runtime.fieldAudio.fanfareTaskActive = true;
  runtime.fieldAudio.fanfareSong = song;
  runtime.fieldAudio.bgmPausedForFanfare = true;
  runtime.fieldAudio.playedFanfares.push(song);
};

export const updateFieldFanfare = (runtime: ScriptRuntimeState): boolean => {
  if (!runtime.fieldAudio.fanfareTaskActive) {
    return false;
  }

  if (runtime.fieldAudio.fanfareCounter > 0) {
    runtime.fieldAudio.fanfareCounter -= 1;
    return true;
  }

  runtime.fieldAudio.fanfareTaskActive = false;
  runtime.fieldAudio.fanfareSong = null;
  runtime.fieldAudio.bgmPausedForFanfare = false;
  return false;
};
