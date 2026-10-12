import React, { useState } from 'react';
import { Calendar, ChevronDown, Droplets } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DailyForecastItem, HourlyForecastItem, TemperatureUnit, WindSpeedUnit } from '../types';
import {
  formatDayName,
  formatFullDate,
  formatTemp,
  getWeatherCondition,
} from '../utils/weatherUtils';
import { WeatherIcon } from './WeatherIcon';
import { DayHourlyForecastView } from './DayHourlyForecastView';

interface SevenDayForecastProps {
  daily: DailyForecastItem[];
  allHourly?: HourlyForecastItem[];
  temperatureUnit: TemperatureUnit;
  windUnit: WindSpeedUnit;
  isDark?: boolean;
}

export const SevenDayForecast: React.FC<SevenDayForecastProps> = ({
  daily,
  allHourly = [],
  temperatureUnit,
  windUnit,
  isDark = false,
}) => {
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  // Take the 7 days
  const sevenDays = daily.slice(0, 7);

  // Compute global min & max for normalized temperature visual bars
  const globalMin = Math.min(...sevenDays.map((d) => d.temperatureMin));
  const globalMax = Math.max(...sevenDays.map((d) => d.temperatureMax));
  const tempRange = Math.max(globalMax - globalMin, 1);

  const toggleExpand = (date: string) => {
    setExpandedDate((prev) => (prev === date ? null : date));
  };

  const containerClass = isDark
    ? 'bg-slate-900/80 backdrop-blur-md border-slate-700/80 text-white shadow-lg'
    : 'bg-white/85 backdrop-blur-md border-white/70 text-stone-900 shadow-sm';
  const textTitle = isDark ? 'text-white' : 'text-stone-900';
  const textSubtle = isDark ? 'text-slate-400' : 'text-stone-400';
  const dividerClass = isDark ? 'divide-slate-800' : 'divide-stone-100';
  const rowHover = isDark ? 'hover:bg-slate-800/60 text-slate-100' : 'hover:bg-white/60 text-stone-900';

  return (
    <div
      id="seven-day-forecast-card"
      className={`${containerClass} border rounded-2xl p-5 sm:p-6 space-y-4 transition-colors duration-500`}
    >
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-2 ${textTitle} font-bold text-base`}>
          <Calendar className={`w-4 h-4 ${isDark ? 'text-sky-400' : 'text-stone-500'}`} />
          <h3>7-Day Synoptic Forecast</h3>
        </div>
        <span className={`text-xs ${textSubtle}`}>Click any day for 24-hour hourly chart</span>
      </div>

      <div className={`divide-y ${dividerClass}`}>
        {sevenDays.map((day, index) => {
          const condition = getWeatherCondition(day.weatherCode, true);
          const isExpanded = expandedDate === day.date;

          // Calculate percentage offsets for min-max bar
          const leftPercent = Math.max(0, ((day.temperatureMin - globalMin) / tempRange) * 100);
          const barWidth = Math.max(8, ((day.temperatureMax - day.temperatureMin) / tempRange) * 100);

          return (
            <div key={day.date} className="py-2.5 transition-colors">
              {/* Mobile Layout (sm:hidden): 2-tier structure preventing any viewport overflow */}
              <div className="sm:hidden">
                <button
                  id={`forecast-day-row-mobile-${day.date}`}
                  type="button"
                  onClick={() => toggleExpand(day.date)}
                  className={`w-full flex flex-col gap-2 text-left ${rowHover} p-2.5 rounded-xl transition-colors cursor-pointer`}
                >
                  {/* Line 1: Day Name on Left, High / Low Temps on Right */}
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-baseline gap-2">
                      <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-stone-900'}`}>
                        {formatDayName(day.date, index === 0)}
                      </span>
                      <span className={`text-[11px] ${textSubtle}`}>
                        {formatFullDate(day.date).split(',')[0]}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-semibold ${textSubtle}`}>
                        {formatTemp(day.temperatureMin, temperatureUnit)}
                      </span>
                      <span className="text-xs opacity-40">/</span>
                      <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-stone-900'}`}>
                        {formatTemp(day.temperatureMax, temperatureUnit)}
                      </span>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.22 }}
                        className={`${textSubtle} ml-0.5`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Line 2: Weather Condition & Normalized Range Bar */}
                  <div className="flex items-center justify-between gap-3 w-full">
                    <div className="flex items-center gap-2 min-w-0">
                      <WeatherIcon
                        name={condition.iconName}
                        className={`w-4 h-4 ${isDark ? 'text-sky-300' : 'text-stone-700'} shrink-0`}
                      />
                      <span className={`text-xs font-medium ${isDark ? 'text-slate-200' : 'text-stone-800'} truncate`}>
                        {condition.label}
                      </span>
                      {day.precipitationProbabilityMax > 0 && (
                        <span className={`text-[11px] ${isDark ? 'text-sky-300' : 'text-sky-700'} flex items-center gap-0.5 shrink-0`}>
                          <Droplets className="w-2.5 h-2.5" />
                          {day.precipitationProbabilityMax}%
                        </span>
                      )}
                    </div>

                    {/* Compact gauge bar on mobile */}
                    <div className={`w-20 h-1.5 ${isDark ? 'bg-slate-800' : 'bg-stone-200/70'} rounded-full relative overflow-hidden shrink-0`}>
                      <div
                        className={`absolute top-0 bottom-0 ${isDark ? 'bg-sky-400' : 'bg-stone-700'} rounded-full`}
                        style={{
                          left: `${leftPercent}%`,
                          width: `${barWidth}%`,
                        }}
                      />
                    </div>
                  </div>
                </button>
              </div>

              {/* Desktop / Tablet Layout (hidden sm:flex) */}
              <div className="hidden sm:block">
                <button
                  id={`forecast-day-row-${day.date}`}
                  type="button"
                  onClick={() => toggleExpand(day.date)}
                  className={`w-full flex items-center justify-between gap-3 text-left ${rowHover} p-2 rounded-xl transition-colors cursor-pointer`}
                >
                  {/* Day column */}
                  <div className="w-24 sm:w-28 shrink-0">
                    <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-stone-900'} block`}>
                      {formatDayName(day.date, index === 0)}
                    </span>
                    <span className={`text-[11px] ${textSubtle}`}>
                      {formatFullDate(day.date).split(',')[0]}
                    </span>
                  </div>

                  {/* Condition & precipitation */}
                  <div className="flex items-center gap-2.5 w-32 sm:w-40 shrink-0">
                    <WeatherIcon name={condition.iconName} className={`w-5 h-5 ${isDark ? 'text-sky-300' : 'text-stone-700'} shrink-0`} />
                    <div className="truncate">
                      <span className={`text-xs font-medium ${isDark ? 'text-slate-200' : 'text-stone-800'} block truncate`}>
                        {condition.label}
                      </span>
                      {day.precipitationProbabilityMax > 0 && (
                        <span className={`text-[11px] ${isDark ? 'text-sky-300' : 'text-sky-700'} flex items-center gap-1`}>
                          <Droplets className="w-2.5 h-2.5" />
                          {day.precipitationProbabilityMax}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Temperature bar & numbers */}
                  <div className="flex-1 flex items-center justify-end gap-3 max-w-xs sm:max-w-md">
                    <span className={`text-xs font-semibold ${textSubtle} w-8 text-right shrink-0`}>
                      {formatTemp(day.temperatureMin, temperatureUnit)}
                    </span>

                    {/* Relative temperature gauge bar */}
                    <div className={`flex-1 h-2 ${isDark ? 'bg-slate-800' : 'bg-stone-200/70'} rounded-full relative overflow-hidden`}>
                      <div
                        className={`absolute top-0 bottom-0 ${isDark ? 'bg-sky-400' : 'bg-stone-700'} rounded-full`}
                        style={{
                          left: `${leftPercent}%`,
                          width: `${barWidth}%`,
                        }}
                      />
                    </div>

                    <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-stone-900'} w-8 text-right shrink-0`}>
                      {formatTemp(day.temperatureMax, temperatureUnit)}
                    </span>

                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.22 }}
                      className={`${textSubtle} pl-1`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </motion.div>
                  </div>
                </button>
              </div>

              {/* Expandable Daily Hourly Chart & Metrics Panel */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    key={`day-hourly-expand-${day.date}`}
                    initial={{ opacity: 0, height: 0, scale: 0.995 }}
                    animate={{ opacity: 1, height: 'auto', scale: 1 }}
                    exit={{ opacity: 0, height: 0, scale: 0.995 }}
                    transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <DayHourlyForecastView
                      date={day.date}
                      dayItem={day}
                      hourly={allHourly}
                      temperatureUnit={temperatureUnit}
                      windUnit={windUnit}
                      isDark={isDark}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};
