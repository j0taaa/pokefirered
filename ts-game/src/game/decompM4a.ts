export const ID_NUMBER = 0x68736d53;
export const C_V = 0x40;
export const SOUND_MODE_REVERB_VAL = 0x0000007f;
export const SOUND_MODE_REVERB_SET = 0x00000080;
export const SOUND_MODE_MAXCHN = 0x00000f00;
export const SOUND_MODE_MAXCHN_SHIFT = 8;
export const SOUND_MODE_MASVOL = 0x0000f000;
export const SOUND_MODE_MASVOL_SHIFT = 12;
export const SOUND_MODE_FREQ_13379 = 0x00040000;
export const SOUND_MODE_FREQ = 0x000f0000;
export const SOUND_MODE_DA_BIT_8 = 0x00900000;
export const SOUND_MODE_DA_BIT = 0x00b00000;
export const MUSICPLAYER_STATUS_TRACK = 0x0000ffff;
export const MUSICPLAYER_STATUS_PAUSE = 0x80000000;
export const MPT_FLG_VOLSET = 0x01;
export const MPT_FLG_VOLCHG = 0x03;
export const MPT_FLG_PITSET = 0x04;
export const MPT_FLG_PITCHG = 0x0c;
export const MPT_FLG_START = 0x40;
export const MPT_FLG_EXIST = 0x80;
export const TEMPORARY_FADE = 0x0001;
export const FADE_IN = 0x0002;
export const FADE_VOL_SHIFT = 2;
export const MAX_MUSICPLAYER_TRACKS = 16;
export const MAX_DIRECTSOUND_CHANNELS = 12;
export const MAX_POKEMON_CRIES = 2;
export const PCM_DMA_BUF_SIZE = 1584;
export const SOUND_CHANNEL_SF_START = 0x80;
export const SOUND_CHANNEL_SF_STOP = 0x40;
export const SOUND_CHANNEL_SF_IEC = 0x04;
export const SOUND_CHANNEL_SF_ENV = 0x03;
export const SOUND_CHANNEL_SF_ON = SOUND_CHANNEL_SF_START | SOUND_CHANNEL_SF_STOP | SOUND_CHANNEL_SF_IEC | SOUND_CHANNEL_SF_ENV;

export interface WaveData {
  freq: number;
  size?: number;
}

export interface ToneData {
  type: number;
  key: number;
  length: number;
  pan_sweep: number;
  wav: WaveData | number | null;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

export interface MusicPlayerTrack {
  flags: number;
  wait: number;
  keyM: number;
  pitM: number;
  keyShift: number;
  keyShiftX: number;
  tune: number;
  pitX: number;
  bend: number;
  bendRange: number;
  volMR: number;
  volML: number;
  vol: number;
  volX: number;
  pan: number;
  panX: number;
  modM: number;
  mod: number;
  modT: number;
  lfoSpeed: number;
  lfoSpeedC: number;
  pseudoEchoVolume: number;
  pseudoEchoLength: number;
  chan: SoundChannel | CgbChannel | null;
  tone: ToneData;
  timer: number;
  unk_3C: number;
  cmdPtr: number[];
  cmdIndex: number;
}

export interface SongHeader {
  trackCount: number;
  blockCount?: number;
  priority: number;
  reverb: number;
  tone: ToneData | null;
  part: number[][];
}

export interface Song {
  header: SongHeader;
  ms: number;
  me?: number;
}

export interface MusicPlayerInfo {
  songHeader: SongHeader | null;
  status: number;
  trackCount: number;
  priority: number;
  cmd: number;
  unk_B: number;
  clock: number;
  memAccArea: number[];
  tempoD: number;
  tempoU: number;
  tempoI: number;
  tempoC: number;
  fadeOI: number;
  fadeOC: number;
  fadeOV: number;
  tracks: MusicPlayerTrack[];
  tone: ToneData | null;
  ident: number;
  MPlayMainNext: string | null;
  musicPlayerNext: MusicPlayerInfo | null;
}

export interface MusicPlayer {
  info: MusicPlayerInfo;
  track: MusicPlayerTrack[];
  unk_8: number;
  unk_A: number;
}

export interface SoundChannel {
  statusFlags: number;
  type: number;
  track: MusicPlayerTrack | null;
}

export interface CgbChannel extends SoundChannel {
  rightVolume: number;
  leftVolume: number;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  envelopeVolume: number;
  envelopeGoal: number;
  sustainGoal: number;
  pan: number;
  panMask: number;
  modify: number;
  frequency: number;
  currentPointer: number[] | null;
  wavePointer: number[] | null;
}

export interface SoundInfo {
  ident: number;
  pcmDmaCounter: number;
  reverb: number;
  maxChans: number;
  masterVolume: number;
  freq: number;
  mode: number;
  c15: number;
  pcmDmaPeriod: number;
  maxLines: number;
  pcmSamplesPerVBlank: number;
  pcmFreq: number;
  divFreq: number;
  cgbChans: CgbChannel[] | null;
  MPlayMainHead: string | null;
  musicPlayerHead: MusicPlayerInfo | null;
  CgbSound: string;
  CgbOscOff: string;
  MidiKeyToCgbFreq: string;
  MPlayJumpTable: string[];
  plynote: string;
  ExtVolPit: string;
  chans: SoundChannel[];
  pcmBuffer: number[];
}

export interface PokemonCrySong extends SongHeader {
  part0: number;
  tuneValue: number;
  gotoCmd: number;
  gotoTarget: number;
  part1: number;
  tuneValue2: number;
  volumeValue: number;
  unkCmd0DParam: number;
  releaseValue: number;
  panValue: number;
  tieKeyValue: number;
  tieVelocityValue: number;
  length: number;
}

export interface M4aRuntime {
  gSoundInfo: SoundInfo;
  gPokemonCrySongs: PokemonCrySong[];
  gPokemonCryMusicPlayers: MusicPlayerInfo[];
  gMPlayJumpTable: string[];
  gCgbChans: CgbChannel[];
  gPokemonCryTracks: MusicPlayerTrack[];
  gPokemonCrySong: PokemonCrySong;
  gMPlayInfo_BGM: MusicPlayerInfo;
  gMPlayInfo_SE1: MusicPlayerInfo;
  gMPlayInfo_SE2: MusicPlayerInfo;
  gMPlayInfo_SE3: MusicPlayerInfo;
  gMPlayMemAccArea: number[];
  gMPlayTable: MusicPlayer[];
  gSongTable: Song[];
  registers: Record<string, number>;
  operations: string[];
}

export const gScaleTable = Array.from({ length: 15 }, (_, octave) => Array.from({ length: 12 }, (_, key) => ((14 - octave) << 4) | key)).flat();
export const gFreqTable = [2147483648, 2275179671, 2410468894, 2553802834, 2705659852, 2866546760, 3037000500, 3217589947, 3408917802, 3611622603, 3826380858, 4053909305];
export const gPcmSamplesPerVBlankTable = [96, 132, 176, 224, 264, 304, 352, 448, 528, 608, 672, 704];
export const gCgbScaleTable = Array.from({ length: 11 }, (_, octave) => Array.from({ length: 12 }, (_, key) => (octave << 4) | key)).flat();
export const gCgbFreqTable = [-2004, -1891, -1785, -1685, -1591, -1501, -1417, -1337, -1262, -1192, -1125, -1062];
export const gNoiseTable = [0xd7, 0xd6, 0xd5, 0xd4, 0xc7, 0xc6, 0xc5, 0xc4, 0xb7, 0xb6, 0xb5, 0xb4, 0xa7, 0xa6, 0xa5, 0xa4, 0x97, 0x96, 0x95, 0x94, 0x87, 0x86, 0x85, 0x84, 0x77, 0x76, 0x75, 0x74, 0x67, 0x66, 0x65, 0x64, 0x57, 0x56, 0x55, 0x54, 0x47, 0x46, 0x45, 0x44, 0x37, 0x36, 0x35, 0x34, 0x27, 0x26, 0x25, 0x24, 0x17, 0x16, 0x15, 0x14, 0x07, 0x06, 0x05, 0x04, 0x03, 0x02, 0x01, 0x00];

const tone = (overrides: Partial<ToneData> = {}): ToneData => ({ type: 1, key: 0, length: 0, pan_sweep: 0, wav: null, attack: 0, decay: 0, sustain: 0, release: 0, ...overrides });
export const createMusicPlayerTrack = (): MusicPlayerTrack => ({ flags: 0, wait: 0, keyM: 0, pitM: 0, keyShift: 0, keyShiftX: 0, tune: 0, pitX: 0, bend: 0, bendRange: 0, volMR: 0, volML: 0, vol: 0, volX: 0, pan: 0, panX: 0, modM: 0, mod: 0, modT: 0, lfoSpeed: 0, lfoSpeedC: 0, pseudoEchoVolume: 0, pseudoEchoLength: 0, chan: null, tone: tone(), timer: 0, unk_3C: 0, cmdPtr: [], cmdIndex: 0 });
export const createMusicPlayerInfo = (trackCount = 0): MusicPlayerInfo => ({ songHeader: null, status: 0, trackCount, priority: 0, cmd: 0, unk_B: 0, clock: 0, memAccArea: [], tempoD: 0, tempoU: 0, tempoI: 0, tempoC: 0, fadeOI: 0, fadeOC: 0, fadeOV: 0, tracks: Array.from({ length: trackCount }, createMusicPlayerTrack), tone: null, ident: 0, MPlayMainNext: null, musicPlayerNext: null });
export const createCgbChannel = (type = 0, panMask = 0): CgbChannel => ({ statusFlags: 0, type, track: null, rightVolume: 0, leftVolume: 0, attack: 0, decay: 0, sustain: 0, release: 0, envelopeVolume: 0, envelopeGoal: 0, sustainGoal: 0, pan: 0, panMask, modify: 0, frequency: 0, currentPointer: null, wavePointer: null });
export const createPokemonCrySong = (): PokemonCrySong => ({ trackCount: 1, blockCount: 0, priority: 255, reverb: 0, tone: tone(), part: [[], []], part0: 0xbc, tuneValue: C_V, gotoCmd: 0xb2, gotoTarget: 0, part1: 0xbc, tuneValue2: C_V + 16, volumeValue: 127, unkCmd0DParam: 0, releaseValue: 0, panValue: C_V, tieKeyValue: 60, tieVelocityValue: 127, length: 60 });

const createSoundInfo = (): SoundInfo => ({
  ident: 0, pcmDmaCounter: 0, reverb: 0, maxChans: 0, masterVolume: 0, freq: 0, mode: 0, c15: 0, pcmDmaPeriod: 0, maxLines: 0, pcmSamplesPerVBlank: 0, pcmFreq: 0, divFreq: 0,
  cgbChans: null, MPlayMainHead: null, musicPlayerHead: null, CgbSound: 'DummyFunc', CgbOscOff: 'DummyFunc', MidiKeyToCgbFreq: 'DummyFunc', MPlayJumpTable: [], plynote: 'ply_note', ExtVolPit: 'DummyFunc',
  chans: Array.from({ length: MAX_DIRECTSOUND_CHANNELS }, () => ({ statusFlags: 0, type: 0, track: null })),
  pcmBuffer: Array(PCM_DMA_BUF_SIZE * 2).fill(0)
});

export const createM4aRuntime = (overrides: Partial<M4aRuntime> = {}): M4aRuntime => {
  const bgm = createMusicPlayerInfo(4);
  const se1 = createMusicPlayerInfo(2);
  const se2 = createMusicPlayerInfo(2);
  const se3 = createMusicPlayerInfo(2);
  const runtime: M4aRuntime = {
    gSoundInfo: createSoundInfo(),
    gPokemonCrySongs: Array.from({ length: MAX_POKEMON_CRIES }, createPokemonCrySong),
    gPokemonCryMusicPlayers: Array.from({ length: MAX_POKEMON_CRIES }, () => createMusicPlayerInfo(2)),
    gMPlayJumpTable: Array(36).fill(''),
    gCgbChans: [createCgbChannel(), createCgbChannel(), createCgbChannel(), createCgbChannel()],
    gPokemonCryTracks: Array.from({ length: MAX_POKEMON_CRIES * 2 }, createMusicPlayerTrack),
    gPokemonCrySong: createPokemonCrySong(),
    gMPlayInfo_BGM: bgm,
    gMPlayInfo_SE1: se1,
    gMPlayInfo_SE2: se2,
    gMPlayInfo_SE3: se3,
    gMPlayMemAccArea: Array(0x10).fill(0),
    gMPlayTable: [{ info: bgm, track: bgm.tracks, unk_8: bgm.trackCount, unk_A: 0 }, { info: se1, track: se1.tracks, unk_8: se1.trackCount, unk_A: 0 }, { info: se2, track: se2.tracks, unk_8: se2.trackCount, unk_A: 0 }, { info: se3, track: se3.tracks, unk_8: se3.trackCount, unk_A: 0 }],
    gSongTable: [],
    registers: {},
    operations: []
  };
  return { ...runtime, ...overrides };
};

const u8 = (n: number): number => n & 0xff;
const s8 = (n: number): number => { const v = n & 0xff; return v > 127 ? v - 256 : v; };
const u16 = (n: number): number => n & 0xffff;
const hiMul = (a: number, b: number): number => Number((BigInt(a >>> 0) * BigInt(b >>> 0)) >> 32n) >>> 0;

export const MidiKeyToFreq = (wav: WaveData, key: number, fineAdjust: number): number => {
  let fineAdjustShifted = fineAdjust << 24;
  if (key > 178) {
    key = 178;
    fineAdjustShifted = 255 << 24;
  }
  const val1Scale = gScaleTable[key]!;
  const val1 = gFreqTable[val1Scale & 0xf]! >>> (val1Scale >> 4);
  const val2Scale = gScaleTable[key + 1]!;
  const val2 = gFreqTable[val2Scale & 0xf]! >>> (val2Scale >> 4);
  return hiMul(wav.freq, val1 + hiMul(val2 - val1, fineAdjustShifted));
};

export const UnusedDummyFunc = (): void => {};

export const MusicPlayerJumpTableCopy = (runtime: M4aRuntime): void => {
  runtime.operations.push('swi:0x2A');
};

export const ClearChain = (runtime: M4aRuntime, x: unknown): void => {
  runtime.operations.push(`ClearChain:${runtime.gMPlayJumpTable[34] ?? ''}`);
  if (Array.isArray(x)) x.length = 0;
};

export const Clear64byte = (runtime: M4aRuntime, x: unknown): void => {
  runtime.operations.push(`Clear64byte:${runtime.gMPlayJumpTable[35] ?? ''}`);
  if (Array.isArray(x)) {
    for (let i = 0; i < Math.min(64, x.length); i++) x[i] = 0;
  }
};

export const MPlayContinue = (mplayInfo: MusicPlayerInfo): void => {
  if (mplayInfo.ident === ID_NUMBER) {
    mplayInfo.ident++;
    mplayInfo.status &= ~MUSICPLAYER_STATUS_PAUSE;
    mplayInfo.ident = ID_NUMBER;
  }
};

export const MPlayFadeOut = (mplayInfo: MusicPlayerInfo, speed: number): void => {
  if (mplayInfo.ident === ID_NUMBER) {
    mplayInfo.ident++;
    mplayInfo.fadeOC = speed;
    mplayInfo.fadeOI = speed;
    mplayInfo.fadeOV = 64 << FADE_VOL_SHIFT;
    mplayInfo.ident = ID_NUMBER;
  }
};

export const SoundInit = (runtime: M4aRuntime, soundInfo = runtime.gSoundInfo): void => {
  Object.assign(soundInfo, createSoundInfo());
  soundInfo.maxChans = 8;
  soundInfo.masterVolume = 15;
  soundInfo.MPlayJumpTable = runtime.gMPlayJumpTable;
  SampleFreqSet(runtime, SOUND_MODE_FREQ_13379);
  soundInfo.ident = ID_NUMBER;
};

export const SampleFreqSet = (runtime: M4aRuntime, freq: number): void => {
  const soundInfo = runtime.gSoundInfo;
  const index = ((freq & SOUND_MODE_FREQ) >> 16) - 1;
  soundInfo.freq = (freq & SOUND_MODE_FREQ) >> 16;
  soundInfo.pcmSamplesPerVBlank = gPcmSamplesPerVBlankTable[index]!;
  soundInfo.pcmDmaPeriod = Math.trunc(PCM_DMA_BUF_SIZE / soundInfo.pcmSamplesPerVBlank);
  soundInfo.pcmFreq = Math.trunc((597275 * soundInfo.pcmSamplesPerVBlank + 5000) / 10000);
  soundInfo.divFreq = (Math.trunc(16777216 / soundInfo.pcmFreq) + 1) >> 1;
  runtime.registers.REG_TM0CNT_L = -Math.trunc(280896 / soundInfo.pcmSamplesPerVBlank);
  runtime.registers.REG_TM0CNT_H = 1;
  m4aSoundVSyncOn(runtime);
};

export const m4aSoundMode = (runtime: M4aRuntime, mode: number): void => {
  const soundInfo = runtime.gSoundInfo;
  if (soundInfo.ident !== ID_NUMBER) return;
  soundInfo.ident++;
  const reverb = mode & (SOUND_MODE_REVERB_SET | SOUND_MODE_REVERB_VAL);
  if (reverb) soundInfo.reverb = reverb & SOUND_MODE_REVERB_VAL;
  const maxChn = mode & SOUND_MODE_MAXCHN;
  if (maxChn) {
    soundInfo.maxChans = maxChn >> SOUND_MODE_MAXCHN_SHIFT;
    for (const chan of soundInfo.chans) chan.statusFlags = 0;
  }
  const masVol = mode & SOUND_MODE_MASVOL;
  if (masVol) soundInfo.masterVolume = masVol >> SOUND_MODE_MASVOL_SHIFT;
  if (mode & SOUND_MODE_DA_BIT) runtime.registers.REG_SOUNDBIAS_H = mode & SOUND_MODE_DA_BIT;
  if (mode & SOUND_MODE_FREQ) {
    m4aSoundVSyncOff(runtime);
    SampleFreqSet(runtime, mode & SOUND_MODE_FREQ);
  }
  soundInfo.ident = ID_NUMBER;
};

export const MPlayExtender = (runtime: M4aRuntime, cgbChans = runtime.gCgbChans): void => {
  const soundInfo = runtime.gSoundInfo;
  const ident = soundInfo.ident;
  if (ident !== ID_NUMBER) return;
  soundInfo.ident++;
  Object.assign(runtime.gMPlayJumpTable, { 8: 'ply_memacc', 17: 'ply_lfos', 19: 'ply_mod', 28: 'ply_xcmd', 29: 'ply_endtie', 30: 'SampleFreqSet', 31: 'TrackStop', 32: 'FadeOutBody', 33: 'TrkVolPitSet' });
  soundInfo.cgbChans = cgbChans;
  soundInfo.CgbSound = 'CgbSound';
  soundInfo.CgbOscOff = 'CgbOscOff';
  soundInfo.MidiKeyToCgbFreq = 'MidiKeyToCgbFreq';
  soundInfo.maxLines = 0;
  cgbChans.splice(0, cgbChans.length, createCgbChannel(1, 0x11), createCgbChannel(2, 0x22), createCgbChannel(3, 0x44), createCgbChannel(4, 0x88));
  soundInfo.ident = ident;
};

export const m4aSoundInit = (runtime: M4aRuntime): void => {
  SoundInit(runtime);
  MPlayExtender(runtime, runtime.gCgbChans);
  m4aSoundMode(runtime, SOUND_MODE_DA_BIT_8 | SOUND_MODE_FREQ_13379 | (12 << SOUND_MODE_MASVOL_SHIFT) | (5 << SOUND_MODE_MAXCHN_SHIFT));
  for (const entry of runtime.gMPlayTable) {
    MPlayOpen(runtime, entry.info, entry.track, entry.unk_8);
    entry.info.unk_B = entry.unk_A;
    entry.info.memAccArea = runtime.gMPlayMemAccArea;
  }
  runtime.gPokemonCrySong = createPokemonCrySong();
  for (let i = 0; i < MAX_POKEMON_CRIES; i++) {
    const tracks = runtime.gPokemonCryTracks.slice(i * 2, i * 2 + 2);
    MPlayOpen(runtime, runtime.gPokemonCryMusicPlayers[i]!, tracks, 2);
    tracks[0]!.chan = null;
  }
};

export const m4aSoundMain = (runtime: M4aRuntime): void => { runtime.operations.push('SoundMain'); };

export const MPlayOpen = (runtime: M4aRuntime, mplayInfo: MusicPlayerInfo, tracks: MusicPlayerTrack[], trackCount: number): void => {
  if (trackCount === 0) return;
  if (trackCount > MAX_MUSICPLAYER_TRACKS) trackCount = MAX_MUSICPLAYER_TRACKS;
  const soundInfo = runtime.gSoundInfo;
  if (soundInfo.ident !== ID_NUMBER) return;
  soundInfo.ident++;
  Object.assign(mplayInfo, createMusicPlayerInfo(0));
  mplayInfo.tracks = tracks;
  mplayInfo.trackCount = trackCount;
  mplayInfo.status = MUSICPLAYER_STATUS_PAUSE;
  for (let i = 0; i < trackCount; i++) tracks[i]!.flags = 0;
  if (soundInfo.MPlayMainHead !== null) {
    mplayInfo.MPlayMainNext = soundInfo.MPlayMainHead;
    mplayInfo.musicPlayerNext = soundInfo.musicPlayerHead;
    soundInfo.MPlayMainHead = null;
  }
  soundInfo.musicPlayerHead = mplayInfo;
  soundInfo.MPlayMainHead = 'MPlayMain';
  soundInfo.ident = ID_NUMBER;
  mplayInfo.ident = ID_NUMBER;
};

export const MPlayStart = (runtime: M4aRuntime, mplayInfo: MusicPlayerInfo, songHeader: SongHeader): void => {
  if (mplayInfo.ident !== ID_NUMBER) return;
  const canStart = !mplayInfo.unk_B || ((!mplayInfo.songHeader || !(mplayInfo.tracks[0]?.flags & MPT_FLG_START)) && ((mplayInfo.status & MUSICPLAYER_STATUS_TRACK) === 0 || !!(mplayInfo.status & MUSICPLAYER_STATUS_PAUSE))) || mplayInfo.priority <= songHeader.priority;
  if (!canStart) return;
  mplayInfo.ident++;
  mplayInfo.status = 0;
  mplayInfo.songHeader = songHeader;
  mplayInfo.tone = songHeader.tone;
  mplayInfo.priority = songHeader.priority;
  mplayInfo.clock = 0;
  mplayInfo.tempoD = 150;
  mplayInfo.tempoI = 150;
  mplayInfo.tempoU = 0x100;
  mplayInfo.tempoC = 0;
  mplayInfo.fadeOI = 0;
  let i = 0;
  while (i < songHeader.trackCount && i < mplayInfo.trackCount) {
    TrackStop(mplayInfo, mplayInfo.tracks[i]!);
    mplayInfo.tracks[i]!.flags = MPT_FLG_EXIST | MPT_FLG_START;
    mplayInfo.tracks[i]!.chan = null;
    mplayInfo.tracks[i]!.cmdPtr = songHeader.part[i] ?? [];
    mplayInfo.tracks[i]!.cmdIndex = 0;
    i++;
  }
  while (i < mplayInfo.trackCount) {
    TrackStop(mplayInfo, mplayInfo.tracks[i]!);
    mplayInfo.tracks[i]!.flags = 0;
    i++;
  }
  if (songHeader.reverb & SOUND_MODE_REVERB_SET) m4aSoundMode(runtime, songHeader.reverb);
  mplayInfo.ident = ID_NUMBER;
};

export const TrackStop = (_mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void => {
  if (track.chan) track.chan.track = null;
  track.chan = null;
  track.flags &= ~MPT_FLG_START;
};

const songPlayer = (runtime: M4aRuntime, n: number): MusicPlayer => runtime.gMPlayTable[runtime.gSongTable[n]!.ms]!;
export const m4aSongNumStart = (runtime: M4aRuntime, n: number): void => MPlayStart(runtime, songPlayer(runtime, n).info, runtime.gSongTable[n]!.header);
export const m4aSongNumStartOrChange = (runtime: M4aRuntime, n: number): void => {
  const song = runtime.gSongTable[n]!;
  const mplay = songPlayer(runtime, n);
  if (mplay.info.songHeader !== song.header || (mplay.info.status & MUSICPLAYER_STATUS_TRACK) === 0 || (mplay.info.status & MUSICPLAYER_STATUS_PAUSE)) MPlayStart(runtime, mplay.info, song.header);
};
export const m4aSongNumStartOrContinue = (runtime: M4aRuntime, n: number): void => {
  const song = runtime.gSongTable[n]!;
  const mplay = songPlayer(runtime, n);
  if (mplay.info.songHeader !== song.header || (mplay.info.status & MUSICPLAYER_STATUS_TRACK) === 0) MPlayStart(runtime, mplay.info, song.header);
  else if (mplay.info.status & MUSICPLAYER_STATUS_PAUSE) MPlayContinue(mplay.info);
};
export const m4aSongNumStop = (runtime: M4aRuntime, n: number): void => { const song = runtime.gSongTable[n]!; const mplay = songPlayer(runtime, n); if (mplay.info.songHeader === song.header) m4aMPlayStop(mplay.info); };
export const m4aSongNumContinue = (runtime: M4aRuntime, n: number): void => { const song = runtime.gSongTable[n]!; const mplay = songPlayer(runtime, n); if (mplay.info.songHeader === song.header) MPlayContinue(mplay.info); };
export const m4aMPlayAllStop = (runtime: M4aRuntime): void => { for (const entry of runtime.gMPlayTable) m4aMPlayStop(entry.info); for (const info of runtime.gPokemonCryMusicPlayers) m4aMPlayStop(info); };
export const m4aMPlayContinue = MPlayContinue;
export const m4aMPlayAllContinue = (runtime: M4aRuntime): void => { for (const entry of runtime.gMPlayTable) MPlayContinue(entry.info); for (const info of runtime.gPokemonCryMusicPlayers) MPlayContinue(info); };
export const m4aMPlayFadeOut = MPlayFadeOut;
export const m4aMPlayFadeOutTemporarily = (mplayInfo: MusicPlayerInfo, speed: number): void => { if (mplayInfo.ident === ID_NUMBER) { mplayInfo.ident++; mplayInfo.fadeOC = speed; mplayInfo.fadeOI = speed; mplayInfo.fadeOV = (64 << FADE_VOL_SHIFT) | TEMPORARY_FADE; mplayInfo.ident = ID_NUMBER; } };
export const m4aMPlayFadeIn = (mplayInfo: MusicPlayerInfo, speed: number): void => { if (mplayInfo.ident === ID_NUMBER) { mplayInfo.ident++; mplayInfo.fadeOC = speed; mplayInfo.fadeOI = speed; mplayInfo.fadeOV = FADE_IN; mplayInfo.status &= ~MUSICPLAYER_STATUS_PAUSE; mplayInfo.ident = ID_NUMBER; } };

export const m4aMPlayStop = (mplayInfo: MusicPlayerInfo): void => {
  if (mplayInfo.ident !== ID_NUMBER) return;
  mplayInfo.ident++;
  mplayInfo.status |= MUSICPLAYER_STATUS_PAUSE;
  for (let i = 0; i < mplayInfo.trackCount; i++) TrackStop(mplayInfo, mplayInfo.tracks[i]!);
  mplayInfo.ident = ID_NUMBER;
};

export const FadeOutBody = (mplayInfo: MusicPlayerInfo): void => {
  if (mplayInfo.fadeOI === 0) return;
  if (--mplayInfo.fadeOC !== 0) return;
  mplayInfo.fadeOC = mplayInfo.fadeOI;
  if (mplayInfo.fadeOV & FADE_IN) {
    mplayInfo.fadeOV = u16(mplayInfo.fadeOV + (4 << FADE_VOL_SHIFT));
    if (mplayInfo.fadeOV >= (64 << FADE_VOL_SHIFT)) {
      mplayInfo.fadeOV = 64 << FADE_VOL_SHIFT;
      mplayInfo.fadeOI = 0;
    }
  } else {
    mplayInfo.fadeOV = u16(mplayInfo.fadeOV - (4 << FADE_VOL_SHIFT));
    if (s8(mplayInfo.fadeOV & 0xff) <= 0 || mplayInfo.fadeOV === 0) {
      for (const track of mplayInfo.tracks.slice(0, mplayInfo.trackCount)) {
        TrackStop(mplayInfo, track);
        if (!(mplayInfo.fadeOV & TEMPORARY_FADE)) track.flags = 0;
      }
      mplayInfo.status = (mplayInfo.fadeOV & TEMPORARY_FADE) ? (mplayInfo.status | MUSICPLAYER_STATUS_PAUSE) : MUSICPLAYER_STATUS_PAUSE;
      mplayInfo.fadeOI = 0;
      return;
    }
  }
  for (const track of mplayInfo.tracks.slice(0, mplayInfo.trackCount)) if (track.flags & MPT_FLG_EXIST) { track.volX = mplayInfo.fadeOV >> FADE_VOL_SHIFT; track.flags |= MPT_FLG_VOLCHG; }
};

export const m4aMPlayImmInit = (mplayInfo: MusicPlayerInfo): void => {
  for (const track of mplayInfo.tracks.slice(0, mplayInfo.trackCount)) {
    if ((track.flags & MPT_FLG_EXIST) && (track.flags & MPT_FLG_START)) {
      Object.assign(track, createMusicPlayerTrack(), { flags: MPT_FLG_EXIST, bendRange: 2, volX: 64, lfoSpeed: 22, tone: tone({ type: 1 }) });
    }
  }
};

export const SoundClear = (runtime: M4aRuntime): void => {
  const soundInfo = runtime.gSoundInfo;
  if (soundInfo.ident !== ID_NUMBER) return;
  soundInfo.ident++;
  for (const chan of soundInfo.chans) chan.statusFlags = 0;
  if (soundInfo.cgbChans) for (let i = 0; i < 4; i++) { CgbOscOff(runtime, i + 1); soundInfo.cgbChans[i]!.statusFlags = 0; }
  soundInfo.ident = ID_NUMBER;
};

export const m4aSoundVSyncOff = (runtime: M4aRuntime): void => {
  const soundInfo = runtime.gSoundInfo;
  if (soundInfo.ident >= ID_NUMBER && soundInfo.ident <= ID_NUMBER + 1) {
    soundInfo.ident += 10;
    soundInfo.pcmBuffer.fill(0);
  }
};

export const m4aSoundVSyncOn = (runtime: M4aRuntime): void => {
  const soundInfo = runtime.gSoundInfo;
  const ident = soundInfo.ident;
  if (ident === ID_NUMBER) return;
  soundInfo.pcmDmaCounter = 0;
  soundInfo.ident = ident - 10;
};

export const TrkVolPitSet = (_mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void => {
  if (track.flags & MPT_FLG_VOLSET) {
    let x = (track.vol * track.volX) >>> 5;
    if (track.modT === 1) x = (x * (track.modM + 128)) >>> 7;
    let y = 2 * track.pan + track.panX;
    if (track.modT === 2) y += track.modM;
    if (y < -128) y = -128;
    else if (y > 127) y = 127;
    track.volMR = ((y + 128) * x) >>> 8;
    track.volML = ((127 - y) * x) >>> 8;
  }
  if (track.flags & MPT_FLG_PITSET) {
    const bend = track.bend * track.bendRange;
    const x = (track.tune + bend) * 4 + (track.keyShift << 8) + (track.keyShiftX << 8) + track.pitX + (track.modT === 0 ? 16 * track.modM : 0);
    track.keyM = x >> 8;
    track.pitM = x;
  }
  track.flags &= ~(MPT_FLG_PITSET | MPT_FLG_VOLSET);
};

export const MidiKeyToCgbFreq = (chanNum: number, key: number, fineAdjust: number): number => {
  if (chanNum === 4) {
    if (key <= 20) key = 0;
    else { key -= 21; if (key > 59) key = 59; }
    return gNoiseTable[key]!;
  }
  if (key <= 35) { fineAdjust = 0; key = 0; }
  else { key -= 36; if (key > 130) { key = 130; fineAdjust = 255; } }
  const s1 = gCgbScaleTable[key]!;
  const val1 = gCgbFreqTable[s1 & 0xf]! >> (s1 >> 4);
  const s2 = gCgbScaleTable[key + 1]!;
  const val2 = gCgbFreqTable[s2 & 0xf]! >> (s2 >> 4);
  return val1 + ((fineAdjust * (val2 - val1)) >> 8) + 2048;
};

export const CgbOscOff = (runtime: M4aRuntime, chanNum: number): void => { runtime.operations.push(`CgbOscOff(${chanNum})`); };
export const CgbSound = (runtime: M4aRuntime): void => {
  const soundInfo = runtime.gSoundInfo;
  soundInfo.c15 = soundInfo.c15 ? soundInfo.c15 - 1 : 14;
  runtime.operations.push('CgbSound');
};

export const m4aMPlayTempoControl = (mplayInfo: MusicPlayerInfo, tempo: number): void => { if (mplayInfo.ident === ID_NUMBER) { mplayInfo.ident++; mplayInfo.tempoU = tempo; mplayInfo.tempoI = (mplayInfo.tempoD * mplayInfo.tempoU) >> 8; mplayInfo.ident = ID_NUMBER; } };
export const m4aMPlayVolumeControl = (mplayInfo: MusicPlayerInfo, trackBits: number, volume: number): void => controlTracks(mplayInfo, trackBits, (track) => { track.volX = Math.trunc(volume / 4); track.flags |= MPT_FLG_VOLCHG; });
export const m4aMPlayPitchControl = (mplayInfo: MusicPlayerInfo, trackBits: number, pitch: number): void => controlTracks(mplayInfo, trackBits, (track) => { track.keyShiftX = pitch >> 8; track.pitX = pitch; track.flags |= MPT_FLG_PITCHG; });
export const m4aMPlayPanpotControl = (mplayInfo: MusicPlayerInfo, trackBits: number, pan: number): void => controlTracks(mplayInfo, trackBits, (track) => { track.panX = pan; track.flags |= MPT_FLG_VOLCHG; });
export const ClearModM = (track: MusicPlayerTrack): void => { track.lfoSpeedC = 0; track.modM = 0; track.flags |= track.modT === 0 ? MPT_FLG_PITCHG : MPT_FLG_VOLCHG; };
export const m4aMPlayModDepthSet = (mplayInfo: MusicPlayerInfo, trackBits: number, modDepth: number): void => controlTracks(mplayInfo, trackBits, (track) => { track.mod = modDepth; if (!track.mod) ClearModM(track); });
export const m4aMPlayLFOSpeedSet = (mplayInfo: MusicPlayerInfo, trackBits: number, lfoSpeed: number): void => controlTracks(mplayInfo, trackBits, (track) => { track.lfoSpeed = lfoSpeed; if (!track.lfoSpeed) ClearModM(track); });

const controlTracks = (mplayInfo: MusicPlayerInfo, trackBits: number, mutator: (track: MusicPlayerTrack) => void): void => {
  if (mplayInfo.ident !== ID_NUMBER) return;
  mplayInfo.ident++;
  let bit = 1;
  for (const track of mplayInfo.tracks.slice(0, mplayInfo.trackCount)) {
    if ((trackBits & bit) && (track.flags & MPT_FLG_EXIST)) mutator(track);
    bit <<= 1;
  }
  mplayInfo.ident = ID_NUMBER;
};

const readCmd = (track: MusicPlayerTrack): number => track.cmdPtr[track.cmdIndex++] ?? 0;
export const ply_memacc = (runtime: M4aRuntime, mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void => {
  const op = readCmd(track);
  const addrIndex = readCmd(track);
  const data = readCmd(track);
  const area = mplayInfo.memAccArea;
  const rhs = op >= 12 && op <= 17 ? area[data]! : data;
  const lhs = area[addrIndex] ?? 0;
  if (op === 0) area[addrIndex] = data;
  else if (op === 1) area[addrIndex] = u8(lhs + data);
  else if (op === 2) area[addrIndex] = u8(lhs - data);
  else if (op === 3) area[addrIndex] = area[data] ?? 0;
  else if (op === 4) area[addrIndex] = u8(lhs + (area[data] ?? 0));
  else if (op === 5) area[addrIndex] = u8(lhs - (area[data] ?? 0));
  else if (op >= 6 && op <= 17) {
    const conds = [lhs === data, lhs !== data, lhs > data, lhs >= data, lhs <= data, lhs < data, lhs === rhs, lhs !== rhs, lhs > rhs, lhs >= rhs, lhs <= rhs, lhs < rhs];
    if (conds[op - 6]) runtime.operations.push('ply_goto');
    else track.cmdIndex += 4;
  }
};
export const ply_xcmd = (runtime: M4aRuntime, mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void => { const n = readCmd(track); runtime.operations.push(`xcmd(${n})`); gXcmdTable[n]?.(runtime, mplayInfo, track); };
export const ply_xxx = (runtime: M4aRuntime): void => { runtime.operations.push('ply_xxx'); };
export const ply_xwave = (_runtime: M4aRuntime, _mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void => { track.tone.wav = readWord(track); };
export const ply_xtype = (_runtime: M4aRuntime, _mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void => { track.tone.type = readCmd(track); };
export const ply_xatta = (_runtime: M4aRuntime, _mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void => { track.tone.attack = readCmd(track); };
export const ply_xdeca = (_runtime: M4aRuntime, _mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void => { track.tone.decay = readCmd(track); };
export const ply_xsust = (_runtime: M4aRuntime, _mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void => { track.tone.sustain = readCmd(track); };
export const ply_xrele = (_runtime: M4aRuntime, _mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void => { track.tone.release = readCmd(track); };
export const ply_xiecv = (_runtime: M4aRuntime, _mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void => { track.pseudoEchoVolume = readCmd(track); };
export const ply_xiecl = (_runtime: M4aRuntime, _mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void => { track.pseudoEchoLength = readCmd(track); };
export const ply_xleng = (_runtime: M4aRuntime, _mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void => { track.tone.length = readCmd(track); };
export const ply_xswee = (_runtime: M4aRuntime, _mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void => { track.tone.pan_sweep = readCmd(track); };
export const ply_xwait = (_runtime: M4aRuntime, _mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void => { const saved = track.cmdIndex; const len = readCmd(track) | (readCmd(track) << 8); if (track.timer < u16(len)) { track.timer++; track.cmdIndex = saved; track.wait = 1; } else track.timer = 0; };
export const ply_xcmd_0D = (_runtime: M4aRuntime, _mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void => { track.unk_3C = readWord(track); };

const readWord = (track: MusicPlayerTrack): number => readCmd(track) | (readCmd(track) << 8) | (readCmd(track) << 16) | (readCmd(track) << 24);
export const gXcmdTable = [ply_xxx, ply_xwave, ply_xtype, ply_xxx, ply_xatta, ply_xdeca, ply_xsust, ply_xrele, ply_xiecv, ply_xiecl, ply_xleng, ply_xswee, ply_xwait, ply_xcmd_0D];

export const SetPokemonCryTone = (runtime: M4aRuntime, toneData: ToneData): MusicPlayerInfo => {
  let maxClock = 0;
  let i = 0;
  for (; i < MAX_POKEMON_CRIES; i++) {
    const track = runtime.gPokemonCryTracks[i * 2]!;
    if (!track.flags && (!track.chan || track.chan.track !== track)) break;
    if (maxClock < runtime.gPokemonCryMusicPlayers[i]!.clock) maxClock = runtime.gPokemonCryMusicPlayers[i]!.clock;
  }
  if (i === MAX_POKEMON_CRIES) i = 0;
  const mplayInfo = runtime.gPokemonCryMusicPlayers[i]!;
  mplayInfo.ident++;
  runtime.gPokemonCrySongs[i] = { ...runtime.gPokemonCrySong, tone: toneData, part: [[], []], gotoTarget: 0 };
  mplayInfo.ident = ID_NUMBER;
  MPlayStart(runtime, mplayInfo, runtime.gPokemonCrySongs[i]!);
  return mplayInfo;
};

export const SetPokemonCryVolume = (runtime: M4aRuntime, val: number): void => { runtime.gPokemonCrySong.volumeValue = val & 0x7f; };
export const SetPokemonCryPanpot = (runtime: M4aRuntime, val: number): void => { runtime.gPokemonCrySong.panValue = (val + C_V) & 0x7f; };
export const SetPokemonCryPitch = (runtime: M4aRuntime, val: number): void => { const b = val + 0x80; const a = runtime.gPokemonCrySong.tuneValue2 - runtime.gPokemonCrySong.tuneValue; runtime.gPokemonCrySong.tieKeyValue = (b >> 8) & 0x7f; runtime.gPokemonCrySong.tuneValue = (b >> 1) & 0x7f; runtime.gPokemonCrySong.tuneValue2 = (a + ((b >> 1) & 0x7f)) & 0x7f; };
export const SetPokemonCryLength = (runtime: M4aRuntime, val: number): void => { runtime.gPokemonCrySong.length = val; };
export const SetPokemonCryRelease = (runtime: M4aRuntime, val: number): void => { runtime.gPokemonCrySong.releaseValue = val; };
export const SetPokemonCryProgress = (runtime: M4aRuntime, val: number): void => { runtime.gPokemonCrySong.unkCmd0DParam = val; };
export const IsPokemonCryPlaying = (mplayInfo: MusicPlayerInfo): boolean => { const track = mplayInfo.tracks[0]!; return !!(track.chan && track.chan.track === track); };
export const SetPokemonCryChorus = (runtime: M4aRuntime, val: number): void => { if (val) { runtime.gPokemonCrySong.trackCount = 2; runtime.gPokemonCrySong.tuneValue2 = (val + runtime.gPokemonCrySong.tuneValue) & 0x7f; } else runtime.gPokemonCrySong.trackCount = 1; };
export const SetPokemonCryStereo = (runtime: M4aRuntime, val: number): void => { if (val) runtime.gSoundInfo.mode &= ~1; else runtime.gSoundInfo.mode |= 1; };

export const CgbPan = (chan: CgbChannel): number => {
  const rightVolume = u8(chan.rightVolume);
  const leftVolume = u8(chan.leftVolume);

  if (rightVolume >= leftVolume) {
    if (Math.trunc(rightVolume / 2) >= leftVolume) {
      chan.pan = 0x0f;
      return 1;
    }
  } else if (Math.trunc(leftVolume / 2) >= rightVolume) {
    chan.pan = 0xf0;
    return 1;
  }

  return 0;
};

export const CgbModVol = (runtime: M4aRuntime, chan: CgbChannel): void => {
  if ((runtime.gSoundInfo.mode & 1) || !CgbPan(chan)) {
    chan.pan = 0xff;
    chan.envelopeGoal = Math.trunc((chan.leftVolume + chan.rightVolume) / 16);
  } else {
    chan.envelopeGoal = Math.trunc((chan.leftVolume + chan.rightVolume) / 16);
    if (chan.envelopeGoal > 15) chan.envelopeGoal = 15;
  }
};

export const DummyFunc = (): void => {};
export const SetPokemonCryPriority = (runtime: M4aRuntime, val: number): void => { runtime.gPokemonCrySong.priority = val; };
