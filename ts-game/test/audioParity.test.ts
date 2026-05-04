import { describe, expect, test } from 'vitest';
import { WebAudioEventAdapter, type AudioPlaybackSink } from '../src/audio/webAudioAdapter';
import {
  fadeInFieldBgm,
  fadeOutFieldBgm,
  playFieldBgm,
  playFieldFanfare,
  playFieldSoundEffect,
  updateFieldFanfare
} from '../src/game/decompFieldSound';
import { createScriptRuntimeState } from '../src/game/scripts';

class RecordingSink implements AudioPlaybackSink {
  readonly tones: Array<{ frequencyHz: number; durationSeconds: number; gain: number }> = [];
  stops = 0;

  playTone(frequencyHz: number, durationSeconds: number, gain: number): void {
    this.tones.push({ frequencyHz, durationSeconds, gain });
  }

  stopAll(): void {
    this.stops += 1;
  }
}

describe('deterministic audio event stream', () => {
  test('field script audio emits ordered music, sfx, fanfare, fade, and resume events', () => {
    const runtime = createScriptRuntimeState();

    playFieldBgm(runtime, 301, true);
    playFieldSoundEffect(runtime, 5);
    playFieldFanfare(runtime, 256);
    runtime.fieldAudio.fanfareCounter = 0;
    updateFieldFanfare(runtime);
    fadeOutFieldBgm(runtime, 8);
    fadeInFieldBgm(runtime, 8);

    expect(runtime.fieldAudio.events.map((event) => event.seq)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(runtime.fieldAudio.events.map((event) => {
      if (event.kind === 'cry') return `${event.kind}:${event.species}`;
      return `${event.kind}:${'action' in event ? event.action : event.id}`;
    })).toEqual([
      'music:start',
      'sfx:5',
      'fanfare:start',
      'fanfare:end',
      'music:stop',
      'music:fadeOut',
      'music:resume',
      'music:fadeIn'
    ]);
  });

  test('Web Audio adapter consumes the same event stream once without reordering', () => {
    const runtime = createScriptRuntimeState();
    const sink = new RecordingSink();
    const adapter = new WebAudioEventAdapter({ sink });

    playFieldBgm(runtime, 301, true);
    playFieldSoundEffect(runtime, 5);
    fadeOutFieldBgm(runtime, 8);

    const firstBatch = adapter.consume(runtime.fieldAudio.events);
    const secondBatch = adapter.consume(runtime.fieldAudio.events);

    expect(firstBatch.map((event) => event.seq)).toEqual([0, 1, 2, 3]);
    expect(secondBatch).toEqual([]);
    expect(sink.tones).toHaveLength(2);
    expect(sink.stops).toBe(2);
  });
});
