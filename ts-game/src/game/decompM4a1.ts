import {
  C_V,
  ID_NUMBER,
  MPT_FLG_EXIST,
  MPT_FLG_PITCHG,
  MPT_FLG_START,
  MPT_FLG_VOLCHG,
  MUSICPLAYER_STATUS_PAUSE,
  MidiKeyToFreq,
  SOUND_CHANNEL_SF_ON,
  SOUND_CHANNEL_SF_START,
  SOUND_CHANNEL_SF_STOP,
  TrkVolPitSet,
  ClearModM,
  FadeOutBody,
  type CgbChannel,
  type M4aRuntime,
  type MusicPlayerInfo,
  type MusicPlayerTrack,
  type SoundChannel,
  type ToneData
} from './decompM4a';

export const TONEDATA_TYPE_CGB = 0x07;
export const TONEDATA_TYPE_FIX = 0x08;
export const TONEDATA_TYPE_SPL = 0x40;
export const TONEDATA_TYPE_RHY = 0x80;
export const TONEDATA_P_S_PAN = 0xc0;
export const CGB_CHANNEL_MO_PIT = 0x02;
export const CGB_CHANNEL_MO_VOL = 0x01;

type AsmTrack = MusicPlayerTrack & {
  patternLevel?: number;
  patternStack?: number[];
  repN?: number;
  runningStatus?: number;
  gateTime?: number;
  priority?: number;
  lfoDelay?: number;
  lfoDelayC?: number;
  velocity?: number;
  key?: number;
};

type AsmChannel = (SoundChannel | CgbChannel) & {
  nextChannelPointer?: AsmChannel | null;
  prevChannelPointer?: AsmChannel | null;
  priority?: number;
  gateTime?: number;
  midiKey?: number;
  key?: number;
  velocity?: number;
  rhythmPan?: number;
  rightVolume?: number;
  leftVolume?: number;
  frequency?: number;
  wav?: { freq: number } | null;
  modify?: number;
};

const u8 = (value: number): number => value & 0xff;
const s8 = (value: number): number => {
  const byte = value & 0xff;
  return byte > 127 ? byte - 256 : byte;
};
const readCmd = (track: AsmTrack): number => track.cmdPtr[track.cmdIndex++] ?? 0;
const peekCmd = (track: AsmTrack, offset = 0): number => track.cmdPtr[track.cmdIndex + offset] ?? 0;
const readU32 = (track: AsmTrack): number => (readCmd(track) | (readCmd(track) << 8) | (readCmd(track) << 16) | (readCmd(track) << 24)) >>> 0;

export const umul3232H32 = (multiplier: number, multiplicand: number): number =>
  Number((BigInt(multiplier >>> 0) * BigInt(multiplicand >>> 0)) >> 32n) >>> 0;

export const SoundMain = (runtime: M4aRuntime): void => {
  const soundInfo = runtime.gSoundInfo;
  if (soundInfo.ident !== ID_NUMBER) return;
  soundInfo.ident++;
  if (soundInfo.MPlayMainHead) {
    let info = soundInfo.musicPlayerHead;
    while (info) {
      MPlayMain(runtime, info);
      info = info.musicPlayerNext;
    }
  }
  SoundMainRAM(runtime);
  soundInfo.ident = ID_NUMBER;
};

export const SoundMainRAM = (runtime: M4aRuntime): void => {
  runtime.operations.push('SoundMainRAM');
  for (const chan of runtime.gSoundInfo.chans) {
    if (!(chan.statusFlags & SOUND_CHANNEL_SF_ON)) continue;
    const asmChan = chan as AsmChannel;
    if (asmChan.gateTime !== undefined && asmChan.gateTime > 0) {
      asmChan.gateTime = u8(asmChan.gateTime - 1);
      if (asmChan.gateTime === 0) chan.statusFlags |= SOUND_CHANNEL_SF_STOP;
    }
  }
};

export const SoundMainBTM = (buffer: number[]): void => {
  buffer.fill(0);
};

export const RealClearChain = (chan: AsmChannel): void => {
  const track = chan.track as AsmTrack | null;
  if (!track) return;
  const next = chan.nextChannelPointer ?? null;
  const prev = chan.prevChannelPointer ?? null;
  if (prev) prev.nextChannelPointer = next;
  else track.chan = next;
  if (next) next.prevChannelPointer = prev;
  chan.track = null;
};

export const ply_fine = (_runtime: M4aRuntime, _mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void => {
  let chan = track.chan as AsmChannel | null;
  while (chan) {
    if (chan.statusFlags & SOUND_CHANNEL_SF_ON) chan.statusFlags |= SOUND_CHANNEL_SF_STOP;
    const next = chan.nextChannelPointer ?? null;
    RealClearChain(chan);
    chan = next;
  }
  track.flags = 0;
};

export const MPlayJumpTableCopy = (runtime: M4aRuntime): void => {
  const table = [
    'ply_fine', 'ply_goto', 'ply_patt', 'ply_pend', 'ply_rept', 'ply_prio',
    'ply_tempo', 'ply_keysh', 'ply_voice', 'ply_vol', 'ply_pan', 'ply_bend',
    'ply_bendr', 'ply_lfodl', 'ply_modt', 'ply_tune', 'ply_port', 'ply_lfos',
    'ply_mod', 'ply_xcmd', 'ply_endtie'
  ];
  for (let i = 0; i < 36; i++) runtime.gMPlayJumpTable[i] = table[i] ?? '';
};

export const ld_r3_tp_adr_i = (_runtime: M4aRuntime, _mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): number =>
  readCmd(track as AsmTrack);

export const ply_goto = (_runtime: M4aRuntime, _mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void => {
  (track as AsmTrack).cmdIndex = readU32(track as AsmTrack);
};

export const ply_patt = (runtime: M4aRuntime, mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void => {
  const t = track as AsmTrack;
  t.patternLevel ??= 0;
  t.patternStack ??= [0, 0, 0];
  if (t.patternLevel >= 3) {
    ply_fine(runtime, mplayInfo, track);
    return;
  }
  t.patternStack[t.patternLevel] = t.cmdIndex + 4;
  t.patternLevel++;
  ply_goto(runtime, mplayInfo, track);
};

export const ply_pend = (_runtime: M4aRuntime, _mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void => {
  const t = track as AsmTrack;
  t.patternLevel ??= 0;
  t.patternStack ??= [0, 0, 0];
  if (t.patternLevel) {
    t.patternLevel--;
    t.cmdIndex = t.patternStack[t.patternLevel] ?? t.cmdIndex;
  }
};

export const ply_rept = (runtime: M4aRuntime, mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void => {
  const t = track as AsmTrack;
  if (peekCmd(t) === 0) {
    t.cmdIndex++;
    ply_goto(runtime, mplayInfo, track);
    return;
  }
  t.repN = u8((t.repN ?? 0) + 1);
  const count = readCmd(t);
  if (t.repN < count) ply_goto(runtime, mplayInfo, track);
  else {
    t.repN = 0;
    t.cmdIndex += 4;
  }
};

export const ply_prio = (_runtime: M4aRuntime, _mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void => { (track as AsmTrack).priority = readCmd(track as AsmTrack); };
export const ply_tempo = (_runtime: M4aRuntime, mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void => {
  mplayInfo.tempoD = readCmd(track as AsmTrack) << 1;
  mplayInfo.tempoI = (mplayInfo.tempoD * mplayInfo.tempoU) >> 8;
};
export const ply_keysh = (_runtime: M4aRuntime, _mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void => { track.keyShift = s8(readCmd(track as AsmTrack)); track.flags |= MPT_FLG_PITCHG; };
export const ply_voice = (_runtime: M4aRuntime, mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void => {
  const voice = readCmd(track as AsmTrack);
  const table = (mplayInfo.tone as unknown as ToneData[] | null) ?? [];
  const source = table[voice] ?? mplayInfo.tone;
  if (source) track.tone = { ...source };
};
export const ply_vol = (_runtime: M4aRuntime, _mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void => { track.vol = readCmd(track as AsmTrack); track.flags |= MPT_FLG_VOLCHG; };
export const ply_pan = (_runtime: M4aRuntime, _mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void => { track.pan = s8(readCmd(track as AsmTrack) - C_V); track.flags |= MPT_FLG_VOLCHG; };
export const ply_bend = (_runtime: M4aRuntime, _mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void => { track.bend = s8(readCmd(track as AsmTrack) - C_V); track.flags |= MPT_FLG_PITCHG; };
export const ply_bendr = (_runtime: M4aRuntime, _mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void => { track.bendRange = readCmd(track as AsmTrack); track.flags |= MPT_FLG_PITCHG; };
export const ply_lfodl = (_runtime: M4aRuntime, _mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void => { (track as AsmTrack).lfoDelay = readCmd(track as AsmTrack); };
export const ply_modt = (_runtime: M4aRuntime, _mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void => {
  const value = readCmd(track as AsmTrack);
  if (track.modT !== value) {
    track.modT = value;
    track.flags |= MPT_FLG_VOLCHG | MPT_FLG_PITCHG;
  }
};
export const ply_tune = (_runtime: M4aRuntime, _mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void => { track.tune = s8(readCmd(track as AsmTrack) - C_V); track.flags |= MPT_FLG_PITCHG; };
export const ply_port = (runtime: M4aRuntime, _mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void => {
  const reg = readCmd(track as AsmTrack);
  runtime.registers[`REG_SOUND1CNT_L+${reg}`] = readCmd(track as AsmTrack);
};

export const m4aSoundVSync = (runtime: M4aRuntime): void => {
  const soundInfo = runtime.gSoundInfo;
  const delta = soundInfo.ident - ID_NUMBER;
  if (delta < 0 || delta > 1) return;
  soundInfo.pcmDmaCounter = s8(soundInfo.pcmDmaCounter - 1);
  if (soundInfo.pcmDmaCounter > 0) return;
  soundInfo.pcmDmaCounter = soundInfo.pcmDmaPeriod;
  runtime.operations.push('m4aSoundVSync:DMARefresh');
};

export const MPlayMain = (runtime: M4aRuntime, mplayInfo: MusicPlayerInfo): void => {
  if (mplayInfo.ident !== ID_NUMBER) return;
  mplayInfo.ident++;
  if (mplayInfo.status & MUSICPLAYER_STATUS_PAUSE) {
    mplayInfo.ident = ID_NUMBER;
    return;
  }
  FadeOutBody(mplayInfo);
  if (mplayInfo.status & MUSICPLAYER_STATUS_PAUSE) {
    mplayInfo.ident = ID_NUMBER;
    return;
  }
  mplayInfo.tempoC += mplayInfo.tempoI;
  while (mplayInfo.tempoC >= 150) {
    processMPlayTick(runtime, mplayInfo);
    mplayInfo.tempoC -= 150;
  }
  for (const track of mplayInfo.tracks.slice(0, mplayInfo.trackCount)) {
    if ((track.flags & MPT_FLG_EXIST) && (track.flags & (MPT_FLG_VOLCHG | MPT_FLG_PITCHG))) {
      TrkVolPitSet(mplayInfo, track);
      updateTrackChannels(runtime, track);
      track.flags &= 0xf0;
    }
  }
  mplayInfo.ident = ID_NUMBER;
};

const processMPlayTick = (runtime: M4aRuntime, mplayInfo: MusicPlayerInfo): void => {
  let activeMask = 0;
  let bit = 1;
  for (const track of mplayInfo.tracks.slice(0, mplayInfo.trackCount)) {
    const t = track as AsmTrack;
    if (track.flags & MPT_FLG_EXIST) {
      activeMask |= bit;
      updateGateTimes(track);
      if (track.flags & MPT_FLG_START) {
        Object.assign(track, { ...track, flags: MPT_FLG_EXIST, bendRange: 2, volX: 64, lfoSpeed: 22, tone: { ...track.tone, type: 1 } });
      }
      if (track.wait) track.wait = u8(track.wait - 1);
      else if (t.cmdPtr.length) runtime.operations.push(`MPlayMain:cmd:${track.cmdPtr[track.cmdIndex] ?? 0}`);
      applyLfo(track);
    }
    bit <<= 1;
  }
  mplayInfo.clock++;
  mplayInfo.status = activeMask || MUSICPLAYER_STATUS_PAUSE;
};

const updateGateTimes = (track: MusicPlayerTrack): void => {
  let chan = track.chan as AsmChannel | null;
  while (chan) {
    if ((chan.statusFlags & SOUND_CHANNEL_SF_ON) && chan.gateTime) {
      chan.gateTime = u8(chan.gateTime - 1);
      if (chan.gateTime === 0) chan.statusFlags |= SOUND_CHANNEL_SF_STOP;
    }
    chan = chan.nextChannelPointer ?? null;
  }
};

const applyLfo = (track: MusicPlayerTrack): void => {
  const t = track as AsmTrack;
  if (!track.lfoSpeed || !track.mod) return;
  if (t.lfoDelayC) {
    t.lfoDelayC = u8(t.lfoDelayC - 1);
    return;
  }
  track.lfoSpeedC = u8(track.lfoSpeedC + track.lfoSpeed);
  const phase = s8(track.lfoSpeedC);
  const wave = track.lfoSpeedC < 0x40 ? phase : 0x80 - track.lfoSpeedC;
  const modM = (track.mod * wave) >> 6;
  if (s8(track.modM) !== s8(modM)) {
    track.modM = s8(modM);
    track.flags |= track.modT === 0 ? MPT_FLG_PITCHG : MPT_FLG_VOLCHG;
  }
};

const updateTrackChannels = (_runtime: M4aRuntime, track: MusicPlayerTrack): void => {
  let chan = track.chan as AsmChannel | null;
  while (chan) {
    if (!(chan.statusFlags & SOUND_CHANNEL_SF_ON)) RealClearChain(chan);
    else {
      if (track.flags & MPT_FLG_VOLCHG) ChnVolSetAsm(chan, track);
      if (track.flags & MPT_FLG_PITCHG) {
        const key = Math.max(0, (chan.key ?? 0) + s8(track.keyM));
        chan.frequency = MidiKeyToFreq(chan.wav ?? { freq: 0 }, key, track.pitM);
        if ((chan.type & TONEDATA_TYPE_CGB) !== 0) chan.modify = (chan.modify ?? 0) | CGB_CHANNEL_MO_PIT;
      }
    }
    chan = chan.nextChannelPointer ?? null;
  }
};

export const TrackStop = (runtime: M4aRuntime, _mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void => {
  if (!(track.flags & MPT_FLG_EXIST)) return;
  let chan = track.chan as AsmChannel | null;
  while (chan) {
    if (chan.statusFlags && (chan.type & TONEDATA_TYPE_CGB)) runtime.operations.push('CgbOscOff');
    chan.statusFlags = 0;
    chan.track = null;
    chan = chan.nextChannelPointer ?? null;
  }
  track.chan = null;
};

export const ChnVolSetAsm = (chan: AsmChannel, track: MusicPlayerTrack): void => {
  const velocity = chan.velocity ?? 0;
  const rhythmPan = s8(chan.rhythmPan ?? 0);
  const right = (track.volMR * ((0x80 + rhythmPan) * velocity)) >> 14;
  const left = (track.volML * ((0x7f - rhythmPan) * velocity)) >> 14;
  chan.rightVolume = Math.min(right, 0xff);
  chan.leftVolume = Math.min(left, 0xff);
};

export const ply_note = (runtime: M4aRuntime, mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack, cmd: number): void => {
  const t = track as AsmTrack;
  t.gateTime = cmd;
  if (peekCmd(t) < 0x80) t.key = readCmd(t);
  if (peekCmd(t) < 0x80) t.velocity = readCmd(t);
  if (peekCmd(t) < 0x80) t.gateTime = u8((t.gateTime ?? 0) + readCmd(t));
  const chan = runtime.gSoundInfo.chans.find((entry) => !(entry.statusFlags & SOUND_CHANNEL_SF_ON)) as AsmChannel | undefined;
  if (!chan) return;
  RealClearChain(chan);
  chan.prevChannelPointer = null;
  chan.nextChannelPointer = (track.chan as AsmChannel | null) ?? null;
  if (chan.nextChannelPointer) chan.nextChannelPointer.prevChannelPointer = chan;
  track.chan = chan;
  chan.track = track;
  chan.gateTime = t.gateTime;
  chan.priority = Math.min(0xff, mplayInfo.priority + (t.priority ?? 0));
  chan.key = t.key ?? 0;
  chan.velocity = t.velocity ?? 0;
  chan.rhythmPan = 0;
  chan.type = track.tone.type;
  chan.wav = typeof track.tone.wav === 'object' ? track.tone.wav : null;
  TrkVolPitSet(mplayInfo, track);
  ChnVolSetAsm(chan, track);
  chan.frequency = MidiKeyToFreq(chan.wav ?? { freq: 0 }, Math.max(0, (chan.key ?? 0) + s8(track.keyM)), track.pitM);
  chan.statusFlags = SOUND_CHANNEL_SF_START;
  track.flags &= 0xf0;
};

export const ply_endtie = (_runtime: M4aRuntime, _mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void => {
  const t = track as AsmTrack;
  const key = peekCmd(t) < 0x80 ? readCmd(t) : t.key;
  let chan = track.chan as AsmChannel | null;
  while (chan) {
    if ((chan.statusFlags & SOUND_CHANNEL_SF_ON) && !(chan.statusFlags & SOUND_CHANNEL_SF_STOP) && chan.midiKey === key) {
      chan.statusFlags |= SOUND_CHANNEL_SF_STOP;
      return;
    }
    chan = chan.nextChannelPointer ?? null;
  }
};

export const clear_modM = (_runtime: M4aRuntime, _mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void => {
  ClearModM(track);
};

export const ply_lfos = (_runtime: M4aRuntime, _mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void => {
  track.lfoSpeed = readCmd(track as AsmTrack);
  if (!track.lfoSpeed) ClearModM(track);
};

export const ply_mod = (_runtime: M4aRuntime, _mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void => {
  track.mod = readCmd(track as AsmTrack);
  if (!track.mod) ClearModM(track);
};
