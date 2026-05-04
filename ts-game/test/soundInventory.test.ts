import { describe, expect, test } from 'vitest';
import {
  fadeInFieldBgm,
  fadeOutFieldBgm,
  getMissingRequiredAudioEvents,
  logBattleMusicTransition,
  logBikeMusicStart,
  logCreditsMusicStart,
  logLowHpMusicStart,
  logLowHpMusicStop,
  logPokemonCry,
  logSurfMusicStart,
  playFieldBgm,
  playFieldFanfare,
  playFieldSoundEffect,
  playMenuSoundEffect,
  updateFieldFanfare
} from '../src/game/decompFieldSound';
import { createScriptRuntimeState } from '../src/game/scripts';

const MUS_HEAL = 256;
const MUS_EVOLVED = 259;
const MUS_CYCLING = 282;
const MUS_CREDITS = 290;
const MUS_SURF = 305;
const MUS_BATTLE = 352;
const SE_SELECT = 5;
const SE_LOW_HEALTH = 83;

const finishCurrentFanfare = (runtime: ReturnType<typeof createScriptRuntimeState>): void => {
  runtime.fieldAudio.fanfareCounter = 0;
  updateFieldFanfare(runtime);
};

describe('audio inventory gate', () => {
  test('reports zero missing required music, sfx, cry, fanfare, fade, and sound-event categories', () => {
    const runtime = createScriptRuntimeState();

    playFieldBgm(runtime, 301, true);
    playFieldSoundEffect(runtime, SE_SELECT);
    playMenuSoundEffect(runtime, SE_SELECT);
    playFieldFanfare(runtime, MUS_HEAL);
    finishCurrentFanfare(runtime);
    playFieldFanfare(runtime, MUS_EVOLVED);
    finishCurrentFanfare(runtime);
    fadeOutFieldBgm(runtime, 8);
    fadeInFieldBgm(runtime, 8);
    logPokemonCry(runtime, 'SPECIES_PIKACHU', 'normal');
    logBattleMusicTransition(runtime, MUS_BATTLE);
    logLowHpMusicStart(runtime, SE_LOW_HEALTH);
    logLowHpMusicStop(runtime, SE_LOW_HEALTH);
    logBikeMusicStart(runtime, MUS_CYCLING);
    logSurfMusicStart(runtime, MUS_SURF);
    logCreditsMusicStart(runtime, MUS_CREDITS);

    expect(getMissingRequiredAudioEvents(runtime.fieldAudio.events)).toEqual([]);
  });
});
