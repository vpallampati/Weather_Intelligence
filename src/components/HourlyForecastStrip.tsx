import React from 'react';
import { Clock, Droplets } from 'lucide-react';
import { HourlyForecastItem, TemperatureUnit } from '../types';
import { formatHour, formatTemp, getWeatherCondition } from '../utils/weatherUtils';
import { WeatherIcon } from './WeatherIcon';

interface HourlyForecastStripProps {
  hourly: HourlyForecastItem[];
  temperatureUnit: TemperatureUnit;
  isDark?: boolean;
}

export const HourlyForecastStrip: React.FC<HourlyForecastStripProps> = ({
  hourly,
  temperatureUnit,
  isDark = false,
}) => {
  // Take next 24 hours
  const next24 = hourly.slice(0, 24);

  const containerClass = isDark
    ? 'bg-slate-900/80 backdrop-blur-md border-slate-700/80 text-white shadow-lg'
    : 'bg-white/85 backdrop-blur-md border-white/70 text-stone-900 shadow-sm';
  const textTitle = isDark ? 'text-white' : 'text-stone-900';
  const textSubtle = isDark ? 'text-slate-400' : 'text-stone-400';

  return (
    <div
      id="hourly-forecast-container"
      className={`${containerClass} border rounded-2xl p-5 sm:p-6 space-y-4 transition-colors duration-500`}
    >
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-2 ${textTitle} font-bold text-base`}>
          <Clock className={`w-4 h-4 ${isDark ? 'text-sky-400' : 'text-stone-500'}`} />
          <h3>24-Hour Atmospheric Trajectory</h3>
        </div>
        <span className={`text-xs ${textSubtle}`}>Hourly resolution</span>
      </div>

      <div
        id="hourly-scroll-strip"
        className="flex gap-3 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-stone-200 scrollbar-track-transparent"
      >
        {next24.map((item, index) => {
          const condition = getWeatherCondition(item.weatherCode, true);
          const isFirst = index === 0;

          const activeCard = isDark
            ? 'bg-sky-500/20 text-white border-sky-400 shadow-xs'
            : 'bg-stone-900 text-white border-stone-900 shadow-xs';
          const defaultCard = isDark
            ? 'bg-slate-800/70 hover:bg-slate-700/70 text-slate-100 border-slate-700/80'
            : 'bg-white/70 hover:bg-white text-stone-800 border-stone-200/80';

          return (
            <div
              key={item.time}
              className={`flex flex-col items-center justify-between min-w-[76px] p-3 rounded-xl border text-center transition-colors shrink-0 ${
                isFirst ? activeCard : defaultCard
              }`}
            >
              <span className={`text-xs font-semibold ${isFirst ? (isDark ? 'text-sky-200' : 'text-stone-300') : (isDark ? 'text-slate-400' : 'text-stone-500')}`}>
                {isFirst ? 'Now' : formatHour(item.time)}
              </span>

              <div className="my-2.5">
                <WeatherIcon
                  name={condition.iconName}
                  className={`w-6 h-6 ${isFirst ? 'text-amber-300' : (isDark ? 'text-sky-300' : 'text-stone-700')}`}
                />
              </div>

              <span className="text-sm font-extrabold tracking-tight">
                {formatTemp(item.temperature, temperatureUnit)}
              </span>

              <div className="mt-2 flex items-center gap-1 text-[11px] font-medium">
                <Droplets className={`w-3 h-3 ${isFirst ? (isDark ? 'text-sky-300' : 'text-sky-300') : 'text-sky-500'}`} />
                <span className={isFirst ? (isDark ? 'text-sky-200' : 'text-sky-200') : (isDark ? 'text-slate-300' : 'text-stone-600')}>
                  {item.precipitationProbability}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
