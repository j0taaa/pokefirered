import { describe, expect, test } from 'vitest';
import {
  ID_NUMBER,
  MPT_FLG_EXIST,
  MPT_FLG_PITCHG,
  MPT_FLG_START,
  MPT_FLG_VOLCHG,
  SOUND_CHANNEL_SF_ON,
  SOUND_CHANNEL_SF_START,
  SOUND_CHANNEL_SF_STOP,
  createM4aRuntime,
  createMusicPlayerInfo,
  createMusicPlayerTrack
} from '../src/game/decompM4a';
import {
  ChnVolSetAsm,
  MPlayJumpTableCopy,
  MPlayMain,
  RealClearChain,
  SoundMain,
  SoundMainBTM,
  TrackStop,
  clear_modM,
  m4aSoundVSync,
  ply_bend,
  ply_bendr,
  ply_endtie,
  ply_fine,
  ply_goto,
  ply_keysh,
  ply_lfodl,
  ply_lfos,
  ply_mod,
  ply_modt,
  ply_pan,
  ply_patt,
  ply_pend,
  ply_port,
  ply_prio,
  ply_rept,
  ply_note,
  ply_tempo,
  ply_tune,
  ply_vol,
  umul3232H32
} from '../src/game/decompM4a1';

describe('decompM4a1', () => {
  test('umul3232H32, SoundMainBTM, jump table copy, and VSync mirror exported assembly helpers', () => {
    const runtime = createM4aRuntime();
    expect(umul3232H32(0xffffffff, 0xffffffff)).toBe(0xfffffffe);
    const pcm = [1, 2, 3, 4];
    SoundMainBTM(pcm);
    expect(pcm).toEqual([0, 0, 0, 0]);

    MPlayJumpTableCopy(runtime);
    expect(runtime.gMPlayJumpTable.slice(0, 6)).toEqual(['ply_fine', 'ply_goto', 'ply_patt', 'ply_pend', 'ply_rept', 'ply_prio']);

    runtime.gSoundInfo.ident = ID_NUMBER;
    runtime.gSoundInfo.pcmDmaCounter = 1;
    runtime.gSoundInfo.pcmDmaPeriod = 3;
    m4aSoundVSync(runtime);
    expect(runtime.gSoundInfo.pcmDmaCounter).toBe(3);
    expect(runtime.operations).toContain('m4aSoundVSync:DMARefresh');

    runtime.gSoundInfo.ident = 1;
    runtime.gSoundInfo.pcmDmaCounter = 1;
    m4aSoundVSync(runtime);
    expect(runtime.gSoundInfo.pcmDmaCounter).toBe(1);
  });

  test('RealClearChain and ply_fine unlink channel chains exactly through track ownership', () => {
    const runtime = createM4aRuntime();
    const info = createMusicPlayerInfo();
    const track = createMusicPlayerTrack();
    const first: any = { statusFlags: SOUND_CHANNEL_SF_ON, type: 0, track, nextChannelPointer: null, prevChannelPointer: null };
    const second: any = { statusFlags: SOUND_CHANNEL_SF_ON, type: 0, track, nextChannelPointer: null, prevChannelPointer: first };
    first.nextChannelPointer = second;
    track.chan = first;
    track.flags = MPT_FLG_EXIST;

    RealClearChain(first);
    expect(track.chan).toBe(second);
    expect(second.prevChannelPointer).toBeNull();
    expect(first.track).toBeNull();

    ply_fine(runtime, info, track);
    expect(track.flags).toBe(0);
    expect(second.statusFlags & SOUND_CHANNEL_SF_STOP).toBe(SOUND_CHANNEL_SF_STOP);
    expect(track.chan).toBeNull();
  });

  test('pattern, repeat, goto, and scalar command helpers update command pointers and flags', () => {
    const runtime = createM4aRuntime();
    const info = createMusicPlayerInfo();
    info.tempoU = 0x100;
    const track = createMusicPlayerTrack();
    track.cmdPtr = [8, 0, 0, 0, 99, 2, 20, 0, 0, 0, 2, 3, 4, 5, 0x50, 70, 72, 74, 76, 78, 80, 82, 84];

    ply_patt(runtime, info, track);
    expect(track.cmdIndex).toBe(8);
    expect((track as any).patternLevel).toBe(1);
    expect((track as any).patternStack[0]).toBe(4);
    ply_pend(runtime, info, track);
    expect(track.cmdIndex).toBe(4);

    track.cmdIndex = 5;
    ply_rept(runtime, info, track);
    expect((track as any).repN).toBe(1);
    expect(track.cmdIndex).toBe(20);
    track.cmdIndex = 10;
    ply_goto(runtime, info, track);
    expect(track.cmdIndex).toBe(0x05040302);

    track.cmdPtr = [7, 9, 65, 96, 62, 70, 12, 8, 3, 77, 55, 66, 0xaa];
    track.cmdIndex = 0;
    ply_prio(runtime, info, track);
    ply_tempo(runtime, info, track);
    ply_keysh(runtime, info, track);
    ply_pan(runtime, info, track);
    ply_bend(runtime, info, track);
    ply_bendr(runtime, info, track);
    ply_lfodl(runtime, info, track);
    ply_modt(runtime, info, track);
    ply_tune(runtime, info, track);
    ply_vol(runtime, info, track);
    ply_port(runtime, info, track);
    expect((track as any).priority).toBe(7);
    expect(info.tempoD).toBe(18);
    expect(track.keyShift).toBe(65);
    expect(track.pan).toBe(32);
    expect(track.bend).toBe(-2);
    expect(track.bendRange).toBe(70);
    expect((track as any).lfoDelay).toBe(12);
    expect(track.modT).toBe(8);
    expect(track.tune).toBe(-61);
    expect(track.vol).toBe(77);
    expect(runtime.registers['REG_SOUND1CNT_L+55']).toBe(66);
    expect(track.flags & (MPT_FLG_PITCHG | MPT_FLG_VOLCHG)).toBe(MPT_FLG_PITCHG | MPT_FLG_VOLCHG);
  });

  test('MPlayMain processes waits, lfo modulation, fade/ident guards, and SoundMain walks the player chain', () => {
    const runtime = createM4aRuntime();
    const info = createMusicPlayerInfo(1);
    info.ident = ID_NUMBER;
    info.tempoI = 150;
    info.tracks[0]!.flags = MPT_FLG_EXIST | MPT_FLG_START;
    info.tracks[0]!.wait = 1;
    info.tracks[0]!.mod = 4;
    info.tracks[0]!.lfoSpeed = 0x20;
    runtime.gSoundInfo.ident = ID_NUMBER;
    runtime.gSoundInfo.MPlayMainHead = 'MPlayMain';
    runtime.gSoundInfo.musicPlayerHead = info;

    SoundMain(runtime);
    expect(info.ident).toBe(ID_NUMBER);
    expect(info.clock).toBe(1);
    expect(info.tracks[0]!.flags & MPT_FLG_EXIST).toBe(MPT_FLG_EXIST);
    expect(runtime.operations).toContain('SoundMainRAM');

    MPlayMain(runtime, info);
    expect(info.clock).toBe(2);
    expect(info.status).not.toBe(0);
  });

  test('TrackStop, ChnVolSetAsm, note/endtie, and mod clear helpers mutate channel state like assembly', () => {
    const runtime = createM4aRuntime();
    const info = createMusicPlayerInfo(1);
    info.ident = ID_NUMBER;
    info.priority = 2;
    const track = info.tracks[0]!;
    track.flags = MPT_FLG_EXIST | MPT_FLG_VOLCHG | MPT_FLG_PITCHG;
    track.volMR = 64;
    track.volML = 64;
    track.tone = { type: 1, key: 0, length: 0, pan_sweep: 0, wav: { freq: 0x80000000 }, attack: 0, decay: 0, sustain: 0, release: 0 };
    track.cmdPtr = [60, 100, 4, 60];
    const channel = runtime.gSoundInfo.chans[0] as any;
    channel.statusFlags = 0;
    channel.velocity = 64;
    channel.rhythmPan = 0;

    ChnVolSetAsm(channel, track);
    expect(channel.rightVolume).toBe(32);
    expect(channel.leftVolume).toBe(31);

    runtime.gSoundInfo.maxChans = 1;
    runtime.gSoundInfo.chans[0] = channel;
    ply_note(runtime, info, track, 5);
    expect(track.chan).toBe(channel);
    expect(channel.statusFlags).toBe(SOUND_CHANNEL_SF_START);
    expect(channel.gateTime).toBe(9);

    channel.statusFlags = SOUND_CHANNEL_SF_ON;
    channel.midiKey = 60;
    track.cmdIndex = 3;
    ply_endtie(runtime, info, track);
    expect(channel.statusFlags & SOUND_CHANNEL_SF_STOP).toBe(SOUND_CHANNEL_SF_STOP);

    TrackStop(runtime, info, track);
    expect(track.chan).toBeNull();
    expect(channel.track).toBeNull();

    track.modT = 0;
    clear_modM(runtime, info, track);
    expect(track.flags & MPT_FLG_PITCHG).toBe(MPT_FLG_PITCHG);
    track.cmdPtr = [0, 0];
    track.cmdIndex = 0;
    ply_lfos(runtime, info, track);
    ply_mod(runtime, info, track);
    expect(track.modM).toBe(0);
  });
});
