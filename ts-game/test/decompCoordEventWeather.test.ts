import { describe, expect, test } from 'vitest';
import {
  doCoordEventWeather,
  normalizeCoordEventWeatherId
} from '../src/world/decompCoordEventWeather';
import {
  loadRoute2Map,
  loadThreeIslandBerryForestMap,
  loadViridianForestMap
} from '../src/world/mapSource';

describe('decomp coord_event_weather', () => {
  test('normalizes and dispatches known weather ids from the decomp table', () => {
    expect(normalizeCoordEventWeatherId('WEATHER_SHADE')).toBe('WEATHER_SHADE');
    expect(normalizeCoordEventWeatherId('WEATHER_FAKE')).toBeUndefined();
    expect(doCoordEventWeather('WEATHER_SUNNY')).toBe('WEATHER_SUNNY');
    expect(doCoordEventWeather(undefined)).toBeNull();
  });

  test('preserves map weather metadata in loaded TS maps', () => {
    expect(loadRoute2Map().coordEventWeather).toBe('WEATHER_SUNNY');
    expect(loadViridianForestMap().coordEventWeather).toBe('WEATHER_SHADE');
    expect(loadThreeIslandBerryForestMap().coordEventWeather).toBe('WEATHER_SHADE');
  });
});
