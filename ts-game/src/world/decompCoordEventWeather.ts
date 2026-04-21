export const COORD_EVENT_WEATHER_IDS = [
  'WEATHER_NONE',
  'WEATHER_SUNNY_CLOUDS',
  'WEATHER_SUNNY',
  'WEATHER_RAIN',
  'WEATHER_SNOW',
  'WEATHER_RAIN_THUNDERSTORM',
  'WEATHER_FOG_HORIZONTAL',
  'WEATHER_VOLCANIC_ASH',
  'WEATHER_SANDSTORM',
  'WEATHER_FOG_DIAGONAL',
  'WEATHER_UNDERWATER',
  'WEATHER_SHADE',
  'WEATHER_ROUTE119_CYCLE',
  'WEATHER_ROUTE123_CYCLE'
] as const;

export type CoordEventWeatherId = typeof COORD_EVENT_WEATHER_IDS[number];

const coordEventWeatherCallbacks: ReadonlyArray<{
  weatherId: CoordEventWeatherId;
  callback: () => CoordEventWeatherId;
}> = COORD_EVENT_WEATHER_IDS.map((weatherId) => ({
  weatherId,
  callback: () => weatherId
}));

export const isCoordEventWeatherId = (value: unknown): value is CoordEventWeatherId =>
  typeof value === 'string' && COORD_EVENT_WEATHER_IDS.includes(value as CoordEventWeatherId);

export const normalizeCoordEventWeatherId = (value: unknown): CoordEventWeatherId | undefined =>
  isCoordEventWeatherId(value) ? value : undefined;

export const doCoordEventWeather = (weatherId: CoordEventWeatherId | undefined): CoordEventWeatherId | null => {
  if (!weatherId) {
    return null;
  }

  for (const entry of coordEventWeatherCallbacks) {
    if (entry.weatherId === weatherId) {
      return entry.callback();
    }
  }

  return null;
};
