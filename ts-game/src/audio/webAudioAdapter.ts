import type { AudioEvent } from '../game/decompFieldSound';

export interface AudioPlaybackSink {
  playTone(frequencyHz: number, durationSeconds: number, gain: number): void;
  stopAll(): void;
}

export interface WebAudioAdapterOptions {
  sink?: AudioPlaybackSink;
  createContext?: () => AudioContext | null;
}

const eventFrequency = (event: AudioEvent): number => {
  if (event.kind === 'cry') {
    const speciesValue = typeof event.species === 'number'
      ? event.species
      : [...event.species].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return 440 + (speciesValue % 180);
  }
  if (event.kind === 'sfx') return 660 + (event.id % 120);
  if (event.kind === 'fanfare') return event.action === 'start' ? 784 : 392;
  if (event.kind === 'fade') return 220;
  return 330 + (event.id % 90);
};

const eventDuration = (event: AudioEvent): number => {
  if (event.kind === 'fanfare' && event.action === 'start') return Math.min(1.2, (event.duration ?? 60) / 120);
  if (event.kind === 'music') return 0.08;
  if (event.kind === 'cry') return 0.2;
  return 0.05;
};

export class BrowserAudioPlaybackSink implements AudioPlaybackSink {
  private readonly context: AudioContext | null;
  private readonly activeNodes: OscillatorNode[] = [];

  constructor(createContext: () => AudioContext | null = () => {
    if (typeof window === 'undefined') return null;
    const AudioContextCtor = window.AudioContext ?? window.webkitAudioContext;
    return AudioContextCtor ? new AudioContextCtor() : null;
  }) {
    this.context = createContext();
  }

  playTone(frequencyHz: number, durationSeconds: number, gain: number): void {
    if (!this.context) return;
    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();
    oscillator.frequency.value = frequencyHz;
    gainNode.gain.value = gain;
    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);
    oscillator.start();
    oscillator.stop(this.context.currentTime + durationSeconds);
    this.activeNodes.push(oscillator);
    oscillator.addEventListener('ended', () => {
      const index = this.activeNodes.indexOf(oscillator);
      if (index >= 0) this.activeNodes.splice(index, 1);
      oscillator.disconnect();
      gainNode.disconnect();
    });
  }

  stopAll(): void {
    for (const node of [...this.activeNodes]) {
      try {
        node.stop();
      } catch {
        // Already stopped nodes are harmless; deterministic event order lives outside Web Audio.
      }
    }
    this.activeNodes.length = 0;
  }
}

export class WebAudioEventAdapter {
  private readonly sink: AudioPlaybackSink;
  private nextSeq = 0;

  constructor(options: WebAudioAdapterOptions = {}) {
    this.sink = options.sink ?? new BrowserAudioPlaybackSink(options.createContext);
  }

  consume(events: readonly AudioEvent[]): AudioEvent[] {
    const pending = events.filter((event) => event.seq >= this.nextSeq).sort((a, b) => a.seq - b.seq);
    for (const event of pending) {
      this.play(event);
      this.nextSeq = event.seq + 1;
    }
    return pending;
  }

  reset(): void {
    this.nextSeq = 0;
    this.sink.stopAll();
  }

  private play(event: AudioEvent): void {
    if (event.kind === 'music' && (event.action === 'stop' || event.action === 'fadeOut')) {
      this.sink.stopAll();
      return;
    }
    this.sink.playTone(eventFrequency(event), eventDuration(event), event.kind === 'music' ? 0.015 : 0.03);
  }
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
