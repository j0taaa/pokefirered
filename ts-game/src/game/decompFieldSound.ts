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

export const AUDIO_EVENT_SOURCE_SCRIPT = 'script' as const;
export const AUDIO_EVENT_SOURCE_FIELD = 'field' as const;
export const AUDIO_EVENT_SOURCE_BATTLE = 'battle' as const;
export const AUDIO_EVENT_SOURCE_MENU = 'menu' as const;

export type AudioEventSource =
  | typeof AUDIO_EVENT_SOURCE_SCRIPT
  | typeof AUDIO_EVENT_SOURCE_FIELD
  | typeof AUDIO_EVENT_SOURCE_BATTLE
  | typeof AUDIO_EVENT_SOURCE_MENU;

export interface AudioEventBase {
  seq: number;
  source: AudioEventSource;
  scenario?: string;
}

export type AudioEvent =
  | (AudioEventBase & { kind: 'music'; action: 'start' | 'stop' | 'resume' | 'save' | 'fadeOut' | 'fadeIn' | 'fadeTo' | 'battleTransition' | 'lowHpStart' | 'lowHpStop' | 'surfStart' | 'bikeStart' | 'creditsStart'; id: number; speed?: number; save?: boolean })
  | (AudioEventBase & { kind: 'sfx'; id: number; pan?: number })
  | (AudioEventBase & { kind: 'cry'; species: string | number; mode: string; pan?: number })
  | (AudioEventBase & { kind: 'fanfare'; action: 'start' | 'end'; id: number; duration?: number })
  | (AudioEventBase & { kind: 'fade'; action: 'toBlack' | 'fromBlack' | 'audioFadeOut' | 'audioFadeIn'; speed: number; id?: number });

type AudioEventInput = AudioEvent extends infer Event ? Event extends AudioEvent ? Omit<Event, 'seq'> : never : never;

export interface RequiredAudioEventSpec {
  id: string;
  scenario: string;
  matches: (event: AudioEvent) => boolean;
}

export const REQUIRED_AUDIO_EVENT_SPECS: readonly RequiredAudioEventSpec[] = [
  { id: 'field-map-music-start', scenario: 'field', matches: (event) => event.kind === 'music' && event.action === 'start' },
  { id: 'field-music-stop', scenario: 'field', matches: (event) => event.kind === 'music' && event.action === 'stop' },
  { id: 'field-music-resume', scenario: 'field', matches: (event) => event.kind === 'music' && event.action === 'resume' },
  { id: 'script-sfx', scenario: 'script', matches: (event) => event.kind === 'sfx' && event.source === AUDIO_EVENT_SOURCE_SCRIPT },
  { id: 'menu-beep', scenario: 'menu', matches: (event) => event.kind === 'sfx' && event.source === AUDIO_EVENT_SOURCE_MENU },
  { id: 'pokemon-cry', scenario: 'cry', matches: (event) => event.kind === 'cry' },
  { id: 'fanfare-start', scenario: 'fanfare', matches: (event) => event.kind === 'fanfare' && event.action === 'start' },
  { id: 'fanfare-end', scenario: 'fanfare', matches: (event) => event.kind === 'fanfare' && event.action === 'end' },
  { id: 'music-fade-out', scenario: 'fade', matches: (event) => event.kind === 'music' && event.action === 'fadeOut' },
  { id: 'music-fade-in', scenario: 'fade', matches: (event) => event.kind === 'music' && event.action === 'fadeIn' },
  { id: 'battle-transition', scenario: 'battle', matches: (event) => event.kind === 'music' && event.action === 'battleTransition' },
  { id: 'low-hp-start', scenario: 'battle', matches: (event) => event.kind === 'music' && event.action === 'lowHpStart' },
  { id: 'low-hp-stop', scenario: 'battle', matches: (event) => event.kind === 'music' && event.action === 'lowHpStop' },
  { id: 'bike-music', scenario: 'bike', matches: (event) => event.kind === 'music' && event.action === 'bikeStart' },
  { id: 'surf-music', scenario: 'surf', matches: (event) => event.kind === 'music' && event.action === 'surfStart' },
  { id: 'pokemon-center-heal', scenario: 'pokemon-center', matches: (event) => event.kind === 'fanfare' && event.id === MUS_HEAL },
  { id: 'evolution-fanfare', scenario: 'evolution', matches: (event) => event.kind === 'fanfare' && event.id === MUS_EVOLVED },
  { id: 'credits-music', scenario: 'credits', matches: (event) => event.kind === 'music' && event.action === 'creditsStart' }
] as const;

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
  events: AudioEvent[];
  nextEventSeq: number;
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
  bgmHistory: [],
  events: [],
  nextEventSeq: 0
});

export const appendAudioEvent = (
  runtime: ScriptRuntimeState,
  event: AudioEventInput
): AudioEvent => {
  const emitted = { ...event, seq: runtime.fieldAudio.nextEventSeq } as AudioEvent;
  runtime.fieldAudio.nextEventSeq += 1;
  runtime.fieldAudio.events.push(emitted);
  return emitted;
};

export const getMissingRequiredAudioEvents = (events: readonly AudioEvent[]): string[] =>
  REQUIRED_AUDIO_EVENT_SPECS
    .filter((spec) => !events.some(spec.matches))
    .map((spec) => spec.id);

export const playFieldSoundEffect = (runtime: ScriptRuntimeState, songNum: number): void => {
  runtime.fieldAudio.playedSoundEffects.push(songNum);
  appendAudioEvent(runtime, { kind: 'sfx', source: AUDIO_EVENT_SOURCE_SCRIPT, id: songNum, scenario: 'script' });
};

export const playMenuSoundEffect = (runtime: ScriptRuntimeState, songNum: number, scenario = 'menu'): void => {
  runtime.fieldAudio.playedSoundEffects.push(songNum);
  appendAudioEvent(runtime, { kind: 'sfx', source: AUDIO_EVENT_SOURCE_MENU, id: songNum, scenario });
};

export const playFieldBgm = (runtime: ScriptRuntimeState, songNum: number, save: boolean): void => {
  if (save) {
    runtime.fieldAudio.savedMusic = songNum;
  }
  runtime.fieldAudio.currentMapMusic = songNum;
  runtime.fieldAudio.nextMapMusic = 0;
  runtime.fieldAudio.mapMusicState = 1;
  runtime.fieldAudio.bgmHistory.push({ kind: 'playNewMapMusic', song: songNum, save });
  appendAudioEvent(runtime, { kind: 'music', source: AUDIO_EVENT_SOURCE_SCRIPT, action: 'start', id: songNum, save, scenario: 'field' });
};

export const saveFieldBgm = (runtime: ScriptRuntimeState, songNum: number): void => {
  runtime.fieldAudio.savedMusic = songNum;
  runtime.fieldAudio.bgmHistory.push({ kind: 'saveBgm', song: songNum });
  appendAudioEvent(runtime, { kind: 'music', source: AUDIO_EVENT_SOURCE_SCRIPT, action: 'save', id: songNum, scenario: 'field' });
};

export const setFieldDefaultMapMusic = (runtime: ScriptRuntimeState, songNum: number): void => {
  runtime.fieldAudio.defaultMapMusic = songNum;
};

export const fadeDefaultFieldBgm = (runtime: ScriptRuntimeState): void => {
  const defaultMusic = runtime.fieldAudio.defaultMapMusic;
  if (runtime.fieldAudio.currentMapMusic === defaultMusic) {
    runtime.fieldAudio.bgmHistory.push({ kind: 'fadeDefaultBgm', song: defaultMusic, speed: 8 });
    appendAudioEvent(runtime, { kind: 'music', source: AUDIO_EVENT_SOURCE_SCRIPT, action: 'resume', id: defaultMusic, speed: 8, scenario: 'field' });
    return;
  }
  runtime.fieldAudio.currentMapMusic = 0;
  runtime.fieldAudio.nextMapMusic = defaultMusic;
  runtime.fieldAudio.mapMusicState = 6;
  runtime.fieldAudio.bgmHistory.push({ kind: 'fadeDefaultBgm', song: defaultMusic, speed: 8 });
  appendAudioEvent(runtime, { kind: 'music', source: AUDIO_EVENT_SOURCE_SCRIPT, action: 'fadeTo', id: defaultMusic, speed: 8, scenario: 'field' });
};

export const fadeOutFieldBgm = (runtime: ScriptRuntimeState, speed: number): void => {
  runtime.fieldAudio.currentMapMusic = 0;
  runtime.fieldAudio.nextMapMusic = 0;
  runtime.fieldAudio.mapMusicState = 5;
  runtime.fieldAudio.bgmHistory.push({ kind: 'fadeOutBgm', song: 0, speed });
  appendAudioEvent(runtime, { kind: 'music', source: AUDIO_EVENT_SOURCE_SCRIPT, action: 'stop', id: 0, speed, scenario: 'field' });
  appendAudioEvent(runtime, { kind: 'music', source: AUDIO_EVENT_SOURCE_SCRIPT, action: 'fadeOut', id: 0, speed, scenario: 'fade' });
};

export const fadeInFieldBgm = (runtime: ScriptRuntimeState, speed: number): void => {
  const song = runtime.fieldAudio.currentMapMusic || runtime.fieldAudio.savedMusic;
  runtime.fieldAudio.currentMapMusic = song;
  runtime.fieldAudio.nextMapMusic = 0;
  runtime.fieldAudio.mapMusicState = 2;
  runtime.fieldAudio.bgmHistory.push({ kind: 'fadeInBgm', song, speed });
  appendAudioEvent(runtime, { kind: 'music', source: AUDIO_EVENT_SOURCE_SCRIPT, action: 'resume', id: song, speed, scenario: 'field' });
  appendAudioEvent(runtime, { kind: 'music', source: AUDIO_EVENT_SOURCE_SCRIPT, action: 'fadeIn', id: song, speed, scenario: 'fade' });
};

export const fadeNewFieldBgm = (runtime: ScriptRuntimeState, songNum: number, speed: number): void => {
  runtime.fieldAudio.currentMapMusic = 0;
  runtime.fieldAudio.nextMapMusic = songNum;
  runtime.fieldAudio.mapMusicState = 6;
  runtime.fieldAudio.bgmHistory.push({ kind: 'fadeNewBgm', song: songNum, speed });
  appendAudioEvent(runtime, { kind: 'music', source: AUDIO_EVENT_SOURCE_SCRIPT, action: 'fadeTo', id: songNum, speed, scenario: 'field' });
};

export const playFieldFanfare = (runtime: ScriptRuntimeState, songNum: number): void => {
  const song = FANFARE_DURATIONS_BY_SONG.has(songNum) ? songNum : MUS_LEVEL_UP;
  runtime.fieldAudio.fanfareCounter = FANFARE_DURATIONS_BY_SONG.get(song) ?? 80;
  runtime.fieldAudio.fanfareTaskActive = true;
  runtime.fieldAudio.fanfareSong = song;
  runtime.fieldAudio.bgmPausedForFanfare = true;
  runtime.fieldAudio.playedFanfares.push(song);
  appendAudioEvent(runtime, { kind: 'fanfare', source: AUDIO_EVENT_SOURCE_SCRIPT, action: 'start', id: song, duration: runtime.fieldAudio.fanfareCounter, scenario: 'fanfare' });
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
  appendAudioEvent(runtime, { kind: 'fanfare', source: AUDIO_EVENT_SOURCE_SCRIPT, action: 'end', id: runtime.fieldAudio.playedFanfares.at(-1) ?? 0, scenario: 'fanfare' });
  return false;
};

export const logPokemonCry = (
  runtime: ScriptRuntimeState,
  species: string | number,
  mode = 'normal',
  pan?: number,
  scenario = 'cry'
): void => {
  appendAudioEvent(runtime, { kind: 'cry', source: AUDIO_EVENT_SOURCE_BATTLE, species, mode, pan, scenario });
};

export const logBattleMusicTransition = (runtime: ScriptRuntimeState, songNum: number, scenario = 'battle'): void => {
  appendAudioEvent(runtime, { kind: 'music', source: AUDIO_EVENT_SOURCE_BATTLE, action: 'battleTransition', id: songNum, scenario });
};

export const logLowHpMusicStart = (runtime: ScriptRuntimeState, songNum: number): void => {
  appendAudioEvent(runtime, { kind: 'music', source: AUDIO_EVENT_SOURCE_BATTLE, action: 'lowHpStart', id: songNum, scenario: 'battle' });
};

export const logLowHpMusicStop = (runtime: ScriptRuntimeState, songNum: number): void => {
  appendAudioEvent(runtime, { kind: 'music', source: AUDIO_EVENT_SOURCE_BATTLE, action: 'lowHpStop', id: songNum, scenario: 'battle' });
};

export const logBikeMusicStart = (runtime: ScriptRuntimeState, songNum: number): void => {
  appendAudioEvent(runtime, { kind: 'music', source: AUDIO_EVENT_SOURCE_FIELD, action: 'bikeStart', id: songNum, scenario: 'bike' });
};

export const logSurfMusicStart = (runtime: ScriptRuntimeState, songNum: number): void => {
  appendAudioEvent(runtime, { kind: 'music', source: AUDIO_EVENT_SOURCE_FIELD, action: 'surfStart', id: songNum, scenario: 'surf' });
};

export const logCreditsMusicStart = (runtime: ScriptRuntimeState, songNum: number): void => {
  appendAudioEvent(runtime, { kind: 'music', source: AUDIO_EVENT_SOURCE_FIELD, action: 'creditsStart', id: songNum, scenario: 'credits' });
};
