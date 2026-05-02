import { describe, expect, test } from 'vitest';
import {
  CgbModVol,
  CgbPan,
  Clear64byte,
  ClearChain,
  DummyFunc,
  FADE_IN,
  FADE_VOL_SHIFT,
  FadeOutBody,
  ID_NUMBER,
  IsPokemonCryPlaying,
  MPT_FLG_EXIST,
  MPT_FLG_PITCHG,
  MPT_FLG_PITSET,
  MPT_FLG_START,
  MPT_FLG_VOLSET,
  MUSICPLAYER_STATUS_PAUSE,
  MidiKeyToCgbFreq,
  MidiKeyToFreq,
  MusicPlayerJumpTableCopy,
  SetPokemonCryChorus,
  SetPokemonCryLength,
  SetPokemonCryPanpot,
  SetPokemonCryPitch,
  SetPokemonCryPriority,
  SetPokemonCryProgress,
  SetPokemonCryRelease,
  SetPokemonCryStereo,
  SetPokemonCryTone,
  SetPokemonCryVolume,
  SoundClear,
  SoundInit,
  TEMPORARY_FADE,
  TrkVolPitSet,
  UnusedDummyFunc,
  createCgbChannel,
  createM4aRuntime,
  createMusicPlayerInfo,
  createMusicPlayerTrack,
  m4aMPlayFadeIn,
  m4aMPlayFadeOutTemporarily,
  m4aMPlayImmInit,
  m4aMPlayLFOSpeedSet,
  m4aMPlayModDepthSet,
  m4aMPlayPanpotControl,
  m4aMPlayPitchControl,
  m4aMPlayStop,
  m4aMPlayTempoControl,
  m4aMPlayVolumeControl,
  m4aSongNumContinue,
  m4aSongNumStart,
  m4aSongNumStartOrChange,
  m4aSongNumStartOrContinue,
  m4aSongNumStop,
  m4aSoundInit,
  m4aSoundMode,
  ply_memacc,
  ply_xatta,
  ply_xcmd_0D,
  ply_xdeca,
  ply_xiecl,
  ply_xiecv,
  ply_xleng,
  ply_xrele,
  ply_xsust,
  ply_xtype,
  ply_xwait,
  ply_xwave
} from '../src/game/decompM4a';

describe('decompM4a', () => {
  test('frequency helpers clamp and interpolate with the original lookup tables', () => {
    expect(MidiKeyToFreq({ freq: 0x80000000 }, 0, 0)).toBe(65536);
    expect(MidiKeyToFreq({ freq: 0xffffffff }, 178, 255)).toBeGreaterThan(0);
    expect(MidiKeyToFreq({ freq: 0xffffffff }, 250, 0)).toBe(MidiKeyToFreq({ freq: 0xffffffff }, 178, 255));
    expect(MidiKeyToCgbFreq(4, 20, 99)).toBe(0xd7);
    expect(MidiKeyToCgbFreq(4, 100, 99)).toBe(0);
    expect(MidiKeyToCgbFreq(1, 35, 255)).toBe(44);
    expect(MidiKeyToCgbFreq(1, 200, 255)).toBeGreaterThan(0);
  });

  test('exact C-name low-level helpers dispatch jump-table clears and CGB pan/volume branches', () => {
    const runtime = createM4aRuntime();
    runtime.gMPlayJumpTable[34] = 'ClearChainImpl';
    runtime.gMPlayJumpTable[35] = 'Clear64byteImpl';
    const chain = [1, 2, 3];
    const bytes = [1, 2, 3, 4];

    expect(UnusedDummyFunc()).toBeUndefined();
    expect(DummyFunc()).toBeUndefined();
    MusicPlayerJumpTableCopy(runtime);
    ClearChain(runtime, chain);
    Clear64byte(runtime, bytes);

    expect(runtime.operations).toContain('swi:0x2A');
    expect(runtime.operations).toContain('ClearChain:ClearChainImpl');
    expect(runtime.operations).toContain('Clear64byte:Clear64byteImpl');
    expect(chain).toEqual([]);
    expect(bytes).toEqual([0, 0, 0, 0]);

    const right = createCgbChannel();
    right.rightVolume = 32;
    right.leftVolume = 8;
    expect(CgbPan(right)).toBe(1);
    expect(right.pan).toBe(0x0f);

    const left = createCgbChannel();
    left.rightVolume = 8;
    left.leftVolume = 32;
    expect(CgbPan(left)).toBe(1);
    expect(left.pan).toBe(0xf0);

    const balanced = createCgbChannel();
    balanced.rightVolume = 20;
    balanced.leftVolume = 16;
    expect(CgbPan(balanced)).toBe(0);

    CgbModVol(runtime, right);
    expect(right.pan).toBe(0x0f);
    expect(right.envelopeGoal).toBe(2);

    runtime.gSoundInfo.mode = 1;
    CgbModVol(runtime, left);
    expect(left.pan).toBe(0xff);
    expect(left.envelopeGoal).toBe(2);
  });

  test('sound init, mode, open, and song start/stop keep the C ident guards and track state', () => {
    const runtime = createM4aRuntime();
    const song = { trackCount: 2, priority: 5, reverb: 0x80 | 9, tone: null, part: [[1, 2], [3, 4]] };
    runtime.gSongTable[0] = { header: song, ms: 0 };

    m4aSoundInit(runtime);
    expect(runtime.gSoundInfo.ident).toBe(ID_NUMBER);
    expect(runtime.gSoundInfo.maxChans).toBe(5);
    expect(runtime.gSoundInfo.masterVolume).toBe(12);
    expect(runtime.gCgbChans.map((chan) => [chan.type, chan.panMask])).toEqual([[1, 0x11], [2, 0x22], [3, 0x44], [4, 0x88]]);
    expect(runtime.gMPlayInfo_BGM.ident).toBe(ID_NUMBER);
    expect(runtime.gPokemonCryMusicPlayers.every((info) => info.ident === ID_NUMBER)).toBe(true);

    m4aSongNumStart(runtime, 0);
    expect(runtime.gMPlayInfo_BGM.songHeader).toBe(song);
    expect(runtime.gMPlayInfo_BGM.priority).toBe(5);
    expect(runtime.gMPlayInfo_BGM.tempoD).toBe(150);
    expect(runtime.gMPlayInfo_BGM.tracks[0]).toMatchObject({ flags: MPT_FLG_EXIST | MPT_FLG_START, cmdPtr: [1, 2] });
    expect(runtime.gMPlayInfo_BGM.tracks[1]).toMatchObject({ flags: MPT_FLG_EXIST | MPT_FLG_START, cmdPtr: [3, 4] });
    expect(runtime.gSoundInfo.reverb).toBe(9);

    runtime.gMPlayInfo_BGM.status = MUSICPLAYER_STATUS_PAUSE;
    m4aSongNumStartOrContinue(runtime, 0);
    expect((runtime.gMPlayInfo_BGM.status & MUSICPLAYER_STATUS_PAUSE) === 0).toBe(true);
    m4aSongNumStartOrChange(runtime, 0);
    expect(runtime.gMPlayInfo_BGM.songHeader).toBe(song);
    m4aSongNumContinue(runtime, 0);
    m4aSongNumStop(runtime, 0);
    expect((runtime.gMPlayInfo_BGM.status & MUSICPLAYER_STATUS_PAUSE) >>> 0).toBe(MUSICPLAYER_STATUS_PAUSE);

    runtime.gSoundInfo.ident = 1;
    m4aSoundMode(runtime, 0x500);
    expect(runtime.gSoundInfo.maxChans).toBe(5);
  });

  test('fade, immediate init, and track control helpers mutate only existing tracks', () => {
    const info = createMusicPlayerInfo(3);
    info.ident = ID_NUMBER;
    info.trackCount = 3;
    info.tracks[0]!.flags = MPT_FLG_EXIST | MPT_FLG_START;
    info.tracks[1]!.flags = MPT_FLG_EXIST;

    m4aMPlayFadeOutTemporarily(info, 2);
    expect(info.fadeOV).toBe((64 << FADE_VOL_SHIFT) | TEMPORARY_FADE);
    m4aMPlayFadeIn(info, 3);
    expect(info.fadeOV).toBe(FADE_IN);
    expect(info.status & MUSICPLAYER_STATUS_PAUSE).toBe(0);

    m4aMPlayImmInit(info);
    expect(info.tracks[0]).toMatchObject({ flags: MPT_FLG_EXIST, bendRange: 2, volX: 64, lfoSpeed: 22 });

    m4aMPlayVolumeControl(info, 0b011, 100);
    expect(info.tracks[0]!.volX).toBe(25);
    expect(info.tracks[1]!.volX).toBe(25);
    expect(info.tracks[2]!.volX).toBe(0);

    m4aMPlayPitchControl(info, 0b001, 0x1234);
    expect(info.tracks[0]).toMatchObject({ keyShiftX: 0x12, pitX: 0x1234 });
    m4aMPlayPanpotControl(info, 0b010, -12);
    expect(info.tracks[1]).toMatchObject({ panX: -12 });
    m4aMPlayModDepthSet(info, 0b001, 0);
    expect(info.tracks[0]!.flags & MPT_FLG_PITCHG).toBe(MPT_FLG_PITCHG);
    m4aMPlayLFOSpeedSet(info, 0b010, 0);
    expect(info.tracks[1]!.flags & MPT_FLG_PITCHG).toBe(MPT_FLG_PITCHG);

    info.tempoD = 120;
    m4aMPlayTempoControl(info, 0x180);
    expect(info.tempoI).toBe(180);
  });

  test('FadeOutBody follows fade-in, fade-out, and temporary pause branches', () => {
    const info = createMusicPlayerInfo(1);
    info.ident = ID_NUMBER;
    info.trackCount = 1;
    info.tracks[0]!.flags = MPT_FLG_EXIST;
    info.fadeOI = 1;
    info.fadeOC = 1;
    info.fadeOV = FADE_IN | (60 << FADE_VOL_SHIFT);
    FadeOutBody(info);
    expect(info.fadeOV).toBe(64 << FADE_VOL_SHIFT);
    expect(info.fadeOI).toBe(0);

    info.fadeOI = 1;
    info.fadeOC = 1;
    info.fadeOV = TEMPORARY_FADE | (1 << FADE_VOL_SHIFT);
    FadeOutBody(info);
    expect((info.status & MUSICPLAYER_STATUS_PAUSE) >>> 0).toBe(MUSICPLAYER_STATUS_PAUSE);
    expect(info.fadeOI).toBe(0);
  });

  test('TrkVolPitSet and xcmd helpers mirror C field math and command pointer movement', () => {
    const track = createMusicPlayerTrack();
    track.flags = MPT_FLG_VOLSET | MPT_FLG_PITSET;
    track.vol = 64;
    track.volX = 32;
    track.pan = 20;
    track.panX = 4;
    track.bend = 3;
    track.bendRange = 2;
    track.tune = 1;
    track.keyShift = 1;
    track.keyShiftX = 2;
    track.pitX = 7;
    TrkVolPitSet(createMusicPlayerInfo(), track);
    expect(track.volMR).toBe(43);
    expect(track.volML).toBe(20);
    expect(track.keyM).toBe(3);
    expect(track.pitM).toBe(803);
    expect(track.flags).toBe(0);

    const runtime = createM4aRuntime();
    const info = createMusicPlayerInfo();
    const xtrack = createMusicPlayerTrack();
    xtrack.cmdPtr = [0x78, 0x56, 0x34, 0x12, 7, 8, 9, 10, 11, 12, 13, 5, 5, 0, 0xaa, 0xbb, 0xcc, 0xdd];
    ply_xwave(runtime, info, xtrack);
    expect(xtrack.tone.wav).toBe(0x12345678);
    ply_xtype(runtime, info, xtrack);
    ply_xatta(runtime, info, xtrack);
    ply_xdeca(runtime, info, xtrack);
    ply_xsust(runtime, info, xtrack);
    ply_xrele(runtime, info, xtrack);
    ply_xiecv(runtime, info, xtrack);
    ply_xiecl(runtime, info, xtrack);
    ply_xleng(runtime, info, xtrack);
    expect(xtrack.tone).toMatchObject({ type: 7, attack: 8, decay: 9, sustain: 10, release: 11, length: 5 });
    ply_xwait(runtime, info, xtrack);
    expect(xtrack.wait).toBe(1);
    expect(xtrack.cmdIndex).toBe(12);
    xtrack.timer = 5;
    ply_xwait(runtime, info, xtrack);
    expect(xtrack.timer).toBe(0);
    expect(xtrack.cmdIndex).toBe(14);
    ply_xcmd_0D(runtime, info, xtrack);
    expect(xtrack.unk_3C >>> 0).toBe(0xddccbbaa);
  });

  test('ply_memacc implements arithmetic and conditional skip/jump command semantics', () => {
    const runtime = createM4aRuntime();
    const info = createMusicPlayerInfo();
    info.memAccArea = Array(16).fill(0);
    const track = createMusicPlayerTrack();

    track.cmdPtr = [0, 2, 10, 1, 2, 5, 7, 2, 15, 1, 1, 1, 1];
    ply_memacc(runtime, info, track);
    expect(info.memAccArea[2]).toBe(10);
    ply_memacc(runtime, info, track);
    expect(info.memAccArea[2]).toBe(15);
    ply_memacc(runtime, info, track);
    expect(track.cmdIndex).toBe(13);
    track.cmdPtr = [6, 2, 15];
    track.cmdIndex = 0;
    ply_memacc(runtime, info, track);
    expect(runtime.operations).toContain('ply_goto');
  });

  test('Pokemon cry helpers preserve the packed value logic and playing detection', () => {
    const runtime = createM4aRuntime();
    SoundInit(runtime);
    runtime.gPokemonCryMusicPlayers[0]!.ident = ID_NUMBER;
    runtime.gPokemonCryMusicPlayers[0]!.tracks = runtime.gPokemonCryTracks.slice(0, 2);
    runtime.gPokemonCryMusicPlayers[0]!.trackCount = 2;

    SetPokemonCryVolume(runtime, 0xff);
    SetPokemonCryPanpot(runtime, -4);
    SetPokemonCryPitch(runtime, 0x180);
    SetPokemonCryLength(runtime, 77);
    SetPokemonCryRelease(runtime, 9);
    SetPokemonCryProgress(runtime, 0x12345678);
    SetPokemonCryChorus(runtime, 3);
    SetPokemonCryStereo(runtime, 0);
    SetPokemonCryPriority(runtime, 12);
    expect(runtime.gPokemonCrySong).toMatchObject({ volumeValue: 0x7f, panValue: 0x3c, tieKeyValue: 2, tuneValue: 0, length: 77, releaseValue: 9, unkCmd0DParam: 0x12345678, trackCount: 2, tuneValue2: 3, priority: 12 });

    const info = SetPokemonCryTone(runtime, { type: 1, key: 0, length: 0, pan_sweep: 0, wav: null, attack: 1, decay: 2, sustain: 3, release: 4 });
    expect(info.songHeader).toBe(runtime.gPokemonCrySongs[0]);
    const channel = createCgbChannel();
    info.tracks[0]!.chan = channel;
    channel.track = info.tracks[0]!;
    expect(IsPokemonCryPlaying(info)).toBe(true);
    m4aMPlayStop(info);
    expect(IsPokemonCryPlaying(info)).toBe(false);

    runtime.gSoundInfo.cgbChans = runtime.gCgbChans;
    runtime.gCgbChans[0]!.statusFlags = 1;
    SoundClear(runtime);
    expect(runtime.gCgbChans[0]!.statusFlags).toBe(0);
    expect(runtime.operations).toContain('CgbOscOff(1)');
  });
});
