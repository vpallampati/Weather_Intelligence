import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wind,
  Droplets,
  Sun,
  Sunrise,
  Sunset,
  Gauge,
  Cloud,
  ArrowUp,
  ArrowDown,
  Compass,
  Sparkles,
} from 'lucide-react';
import { TemperatureUnit, WeatherData, WindSpeedUnit } from '../types';
import {
  formatTemp,
  formatWindSpeed,
  getWeatherCondition,
  getWindDirection,
  getUvCategory,
} from '../utils/weatherUtils';
import { WeatherCategory, getWeatherThemeConfig } from '../utils/weatherThemes';
import { WeatherIcon } from './WeatherIcon';
import { CityAtmosphereCanvas } from './CityAtmosphereCanvas';

interface CurrentWeatherCardProps {
  data: WeatherData;
  temperatureUnit: TemperatureUnit;
  windUnit: WindSpeedUnit;
  isDark?: boolean;
  themeCategory?: WeatherCategory;
}

export const CurrentWeatherCard: React.FC<CurrentWeatherCardProps> = ({
  data,
  temperatureUnit,
  windUnit,
  isDark = false,
  themeCategory,
}) => {
  const { city, current, daily } = data;
  const today = daily[0];
  const condition = getWeatherCondition(current.weatherCode, current.isDay);
  const uvInfo = getUvCategory(today?.uvIndexMax ?? 0);
  const windDir = getWindDirection(current.windDirection);

  const activeCategory: WeatherCategory =
    themeCategory || getWeatherThemeConfig(current.weatherCode, current.isDay).category;

  const getAtmosphereFeelInfo = (cat: WeatherCategory) => {
    switch (cat) {
      case 'clear-day':
        return { label: 'Radiant Sunshine • Clear Skies' };
      case 'clear-night':
        return { label: 'Starlit Celestial • Clear Night' };
      case 'rain':
        return { label: 'Active Precipitation • Rainfall' };
      case 'thunderstorm':
        return { label: 'Convective Storm • Lightning Active' };
      case 'snow':
        return { label: 'Winter Flurries • Crisp Snowfall' };
      case 'fog':
        return { label: 'Volumetric Mist • Low Visibility' };
      case 'cloudy-day':
        return { label: 'Diffused Sunlight • Passing Clouds' };
      case 'cloudy-night':
        return { label: 'Overcast Celestial • Cloud Cover' };
      default:
        return { label: 'Live Atmospheric Conditions' };
    }
  };

  const feelInfo = getAtmosphereFeelInfo(activeCategory);

  const formatSunTime = (isoTime?: string) => {
    if (!isoTime) return '--:--';
    const d = new Date(isoTime);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const cardBase = isDark
    ? 'bg-slate-900/90 backdrop-blur-md border-slate-700/80 text-white shadow-lg'
    : 'bg-white/95 backdrop-blur-md border-stone-200 text-stone-900 shadow-sm';
  const subCardBase = isDark
    ? 'bg-slate-800/80 border-slate-700 text-slate-100 shadow-xs'
    : 'bg-white/90 border-stone-200 text-stone-900 shadow-xs';
  const textSubtle = isDark ? 'text-slate-300' : 'text-stone-600';
  const textPrimary = isDark ? 'text-white' : 'text-stone-950';
  const borderDivider = isDark ? 'border-slate-800' : 'border-stone-200';

  // Dedicated high-contrast typography tokens for City Atmosphere Frame
  const framePrimary = isDark
    ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]'
    : 'text-stone-950';
  const frameCountry = isDark
    ? 'text-slate-200 font-normal drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]'
    : 'text-stone-600 font-normal';
  const frameDesc = isDark
    ? 'text-slate-100 font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'
    : 'text-stone-800 font-semibold';
  const frameMeta = isDark
    ? 'text-slate-200 font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'
    : 'text-stone-700 font-semibold';
  const frameFeels = isDark
    ? 'text-slate-200 font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'
    : 'text-stone-700 font-medium';

  return (
    <div
      id="current-weather-card"
      className={`${cardBase} border rounded-2xl p-4 sm:p-6 transition-colors duration-500`}
    >
      {/* City Atmosphere Frame with Live Weather Animations (Sun, Moon, Rain, Thunderstorm, Snow, Fog) */}
      <div
        id="city-atmosphere-frame"
        className={`relative overflow-hidden rounded-2xl border p-5 sm:p-7 mb-6 transition-all duration-500 shadow-sm ${
          isDark
            ? 'bg-slate-950/85 border-slate-700 shadow-slate-950/40 text-white'
            : 'bg-white/90 border-stone-200 shadow-stone-200/50 text-stone-950'
        }`}
      >
        {/* Animated Weather Feel Canvas Engine */}
        <CityAtmosphereCanvas
          category={activeCategory}
          isDay={current.isDay}
          isDark={isDark}
        />

        {/* Contrast Protection Scrim for Uncompromised Text Readability */}
        <div
          className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${
            isDark
              ? 'bg-gradient-to-r from-slate-950/92 via-slate-950/75 to-slate-950/30'
              : 'bg-gradient-to-r from-white/95 via-white/85 to-white/35'
          }`}
        />

        {/* Foreground Telemetry with Crystal-Clear Contrast */}
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className={`flex items-center gap-2 text-xs uppercase tracking-wider ${frameMeta}`}>
              <span>Current Conditions</span>
              <span>•</span>
              <span>{data.timezone}</span>
            </div>

            {/* Live Atmosphere Feel Pill */}
            <div
              id="live-atmosphere-feel-badge"
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border transition-all ${
                isDark
                  ? 'bg-slate-900/95 border-slate-600 text-sky-200 shadow-sm'
                  : 'bg-white/95 border-stone-300 text-stone-900 shadow-sm'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500" />
              </span>
              <span>{feelInfo.label}</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-1">
            {/* City and Condition overview */}
            <div className="space-y-1 max-w-xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${city.name}-${city.country || ''}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25 }}
                >
                  <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-black ${framePrimary} tracking-tight`}>
                    {city.name}
                    {city.country && (
                      <span className={`${frameCountry} ml-2.5 text-2xl sm:text-3xl`}>
                        {city.country}
                      </span>
                    )}
                  </h2>
                  <div className="flex items-center gap-2.5 pt-1.5">
                    <WeatherIcon
                      name={condition.iconName}
                      className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 ${
                        isDark ? 'text-amber-300' : 'text-amber-600'
                      }`}
                    />
                    <p className={`${frameDesc} text-sm sm:text-base`}>
                      {condition.description}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Temperature Hero - Clean & unboxed to let the atmospheric animation shine */}
            <div className="flex flex-col items-start md:items-end">
              <div className="flex items-baseline">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={`temp-${current.temperature}-${temperatureUnit}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className={`text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter ${framePrimary} block`}
                  >
                    {formatTemp(current.temperature, temperatureUnit)}
                  </motion.span>
                </AnimatePresence>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 text-xs mt-1.5">
                <span className={frameFeels}>
                  Feels like <strong>{formatTemp(current.apparentTemperature, temperatureUnit)}</strong>
                </span>
                {today && (
                  <div className="flex items-center gap-1.5 font-bold">
                    <span
                      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[11px] border ${
                        isDark
                          ? 'bg-red-950/60 border-red-800/80 text-red-200'
                          : 'bg-red-50 border-red-200 text-red-700'
                      }`}
                    >
                      <ArrowUp className="w-3 h-3 text-red-500 inline" />
                      {formatTemp(today.temperatureMax, temperatureUnit)}
                    </span>
                    <span
                      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[11px] border ${
                        isDark
                          ? 'bg-blue-950/60 border-blue-800/80 text-sky-200'
                          : 'bg-blue-50 border-blue-200 text-blue-700'
                      }`}
                    >
                      <ArrowDown className="w-3 h-3 text-blue-500 inline" />
                      {formatTemp(today.temperatureMin, temperatureUnit)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Atmospheric Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 pt-6">
        {/* Wind */}
        <div className={`${subCardBase} border rounded-xl p-3.5 space-y-1`}>
          <div className={`flex items-center justify-between ${textSubtle} text-xs font-medium`}>
            <span>Wind</span>
            <Wind className="w-3.5 h-3.5" />
          </div>
          <p className={`text-base font-bold ${textPrimary} truncate`}>
            {formatWindSpeed(current.windSpeed, windUnit)}
          </p>
          <div className={`flex items-center gap-1 text-[11px] ${textSubtle}`}>
            <Compass className="w-3 h-3" />
            <span>{windDir} ({Math.round(current.windDirection)}°)</span>
          </div>
        </div>

        {/* Humidity */}
        <div className={`${subCardBase} border rounded-xl p-3.5 space-y-1`}>
          <div className={`flex items-center justify-between ${textSubtle} text-xs font-medium`}>
            <span>Humidity</span>
            <Droplets className="w-3.5 h-3.5" />
          </div>
          <p className={`text-base font-bold ${textPrimary}`}>
            {Math.round(current.relativeHumidity)}%
          </p>
          <p className={`text-[11px] ${textSubtle}`}>
            {current.relativeHumidity > 65 ? 'Humid' : current.relativeHumidity < 35 ? 'Dry' : 'Balanced'}
          </p>
        </div>

        {/* UV Index */}
        <div className={`${subCardBase} border rounded-xl p-3.5 space-y-1`}>
          <div className={`flex items-center justify-between ${textSubtle} text-xs font-medium`}>
            <span>UV Peak</span>
            <Sun className="w-3.5 h-3.5" />
          </div>
          <p className={`text-base font-bold ${textPrimary}`}>
            {today?.uvIndexMax !== undefined ? today.uvIndexMax.toFixed(1) : '--'}
          </p>
          <div className="pt-0.5">
            <span
              className={`inline-block px-1.5 py-0.5 text-[10px] font-semibold rounded border ${uvInfo.colorClass}`}
            >
              {uvInfo.text}
            </span>
          </div>
        </div>

        {/* Pressure */}
        <div className={`${subCardBase} border rounded-xl p-3.5 space-y-1`}>
          <div className={`flex items-center justify-between ${textSubtle} text-xs font-medium`}>
            <span>Pressure</span>
            <Gauge className="w-3.5 h-3.5" />
          </div>
          <p className={`text-base font-bold ${textPrimary}`}>
            {Math.round(current.pressure)} hPa
          </p>
          <p className={`text-[11px] ${textSubtle}`}>
            {current.pressure > 1013 ? 'High pressure' : 'Low pressure'}
          </p>
        </div>

        {/* Cloud Cover */}
        <div className={`${subCardBase} border rounded-xl p-3.5 space-y-1`}>
          <div className={`flex items-center justify-between ${textSubtle} text-xs font-medium`}>
            <span>Cloud Cover</span>
            <Cloud className="w-3.5 h-3.5" />
          </div>
          <p className={`text-base font-bold ${textPrimary}`}>
            {Math.round(current.cloudCover)}%
          </p>
          <p className={`text-[11px] ${textSubtle}`}>
            {condition.label}
          </p>
        </div>

        {/* Precipitation Rate */}
        <div className={`${subCardBase} border rounded-xl p-3.5 space-y-1`}>
          <div className={`flex items-center justify-between ${textSubtle} text-xs font-medium`}>
            <span>Precipitation</span>
            <Droplets className="w-3.5 h-3.5" />
          </div>
          <p className={`text-base font-bold ${textPrimary}`}>
            {current.precipitation} mm
          </p>
          <p className={`text-[11px] ${textSubtle}`}>
            {today?.precipitationProbabilityMax ? `${today.precipitationProbabilityMax}% chance` : 'Dry'}
          </p>
        </div>
      </div>

      {/* Sun Cycle Strip */}
      {today?.sunrise && today?.sunset && (
        <div className={`mt-4 pt-4 border-t ${borderDivider} flex flex-wrap items-center justify-between gap-4 text-xs ${isDark ? 'text-slate-300' : 'text-stone-600'}`}>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Sunrise className="w-4 h-4 text-amber-500" />
              <span>Sunrise: <strong className={textPrimary}>{formatSunTime(today.sunrise)}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Sunset className="w-4 h-4 text-orange-500" />
              <span>Sunset: <strong className={textPrimary}>{formatSunTime(today.sunset)}</strong></span>
            </div>
          </div>
          <span className={`${textSubtle} font-mono text-[11px]`}>
            Coords: {city.latitude.toFixed(2)}°N, {city.longitude.toFixed(2)}°E
          </span>
        </div>
      )}
    </div>
  );
};
