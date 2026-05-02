export const WEATHER_SUNNY_CLOUDS = 1;
export const WEATHER_SUNNY = 2;
export const WEATHER_RAIN = 3;
export const WEATHER_SNOW = 4;
export const WEATHER_RAIN_THUNDERSTORM = 5;
export const WEATHER_FOG_HORIZONTAL = 6;
export const WEATHER_VOLCANIC_ASH = 7;
export const WEATHER_SANDSTORM = 8;
export const WEATHER_FOG_DIAGONAL = 9;
export const WEATHER_UNDERWATER = 10;
export const WEATHER_SHADE = 11;
export const WEATHER_ROUTE119_CYCLE = 12;
export const WEATHER_ROUTE123_CYCLE = 13;

export interface CoordEventWeatherRuntime {
  callbacks: string[];
}

let activeRuntime: CoordEventWeatherRuntime | null = null;

export const createCoordEventWeatherRuntime = (overrides: Partial<CoordEventWeatherRuntime> = {}): CoordEventWeatherRuntime => {
  const runtime = { callbacks: [], ...overrides };
  activeRuntime = runtime;
  return runtime;
};

const runtimeOrNull = (runtime?: CoordEventWeatherRuntime): CoordEventWeatherRuntime | null => runtime ?? activeRuntime;

const record = (name: string, runtime?: CoordEventWeatherRuntime): void => {
  runtimeOrNull(runtime)?.callbacks.push(name);
};

export function WeatherCoordEvent_SunnyClouds(runtime?: CoordEventWeatherRuntime): void { record('WeatherCoordEvent_SunnyClouds', runtime); }
export function WeatherCoordEvent_Sunny(runtime?: CoordEventWeatherRuntime): void { record('WeatherCoordEvent_Sunny', runtime); }
export function WeatherCoordEvent_Rain(runtime?: CoordEventWeatherRuntime): void { record('WeatherCoordEvent_Rain', runtime); }
export function WeatherCoordEvent_Snow(runtime?: CoordEventWeatherRuntime): void { record('WeatherCoordEvent_Snow', runtime); }
export function WeatherCoordEvent_RainThunderstorm(runtime?: CoordEventWeatherRuntime): void { record('WeatherCoordEvent_RainThunderstorm', runtime); }
export function WeatherCoordEvent_FogHorizontal(runtime?: CoordEventWeatherRuntime): void { record('WeatherCoordEvent_FogHorizontal', runtime); }
export function WeatherCoordEvent_VolcanicAsh(runtime?: CoordEventWeatherRuntime): void { record('WeatherCoordEvent_VolcanicAsh', runtime); }
export function WeatherCoordEvent_Sandstorm(runtime?: CoordEventWeatherRuntime): void { record('WeatherCoordEvent_Sandstorm', runtime); }
export function WeatherCoordEvent_FogDiagonal(runtime?: CoordEventWeatherRuntime): void { record('WeatherCoordEvent_FogDiagonal', runtime); }
export function WeatherCoordEvent_Underwater(runtime?: CoordEventWeatherRuntime): void { record('WeatherCoordEvent_Underwater', runtime); }
export function WeatherCoordEvent_Shade(runtime?: CoordEventWeatherRuntime): void { record('WeatherCoordEvent_Shade', runtime); }
export function WeatherCoordEvent_Route119Cycle(runtime?: CoordEventWeatherRuntime): void { record('WeatherCoordEvent_Route119Cycle', runtime); }
export function WeatherCoordEvent_Route123Cycle(runtime?: CoordEventWeatherRuntime): void { record('WeatherCoordEvent_Route123Cycle', runtime); }

const sWeatherCoordEventFuncs: Array<{ weatherId: number; callback: (runtime?: CoordEventWeatherRuntime) => void }> = [
  { weatherId: WEATHER_SUNNY_CLOUDS, callback: WeatherCoordEvent_SunnyClouds },
  { weatherId: WEATHER_SUNNY, callback: WeatherCoordEvent_Sunny },
  { weatherId: WEATHER_RAIN, callback: WeatherCoordEvent_Rain },
  { weatherId: WEATHER_SNOW, callback: WeatherCoordEvent_Snow },
  { weatherId: WEATHER_RAIN_THUNDERSTORM, callback: WeatherCoordEvent_RainThunderstorm },
  { weatherId: WEATHER_FOG_HORIZONTAL, callback: WeatherCoordEvent_FogHorizontal },
  { weatherId: WEATHER_VOLCANIC_ASH, callback: WeatherCoordEvent_VolcanicAsh },
  { weatherId: WEATHER_SANDSTORM, callback: WeatherCoordEvent_Sandstorm },
  { weatherId: WEATHER_FOG_DIAGONAL, callback: WeatherCoordEvent_FogDiagonal },
  { weatherId: WEATHER_UNDERWATER, callback: WeatherCoordEvent_Underwater },
  { weatherId: WEATHER_SHADE, callback: WeatherCoordEvent_Shade },
  { weatherId: WEATHER_ROUTE119_CYCLE, callback: WeatherCoordEvent_Route119Cycle },
  { weatherId: WEATHER_ROUTE123_CYCLE, callback: WeatherCoordEvent_Route123Cycle }
];

export function DoCoordEventWeather(weatherId: number, runtime?: CoordEventWeatherRuntime): void {
  for (let i = 0; i < sWeatherCoordEventFuncs.length; i += 1) {
    if (sWeatherCoordEventFuncs[i].weatherId === weatherId) {
      sWeatherCoordEventFuncs[i].callback(runtime);
      return;
    }
  }
}
