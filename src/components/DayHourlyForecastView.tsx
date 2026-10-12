import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  Thermometer,
  CloudRain,
  Sun,
  Wind,
  Sunrise,
  Droplets,
  Layers,
  Clock,
} from 'lucide-react';
import {
  DailyForecastItem,
  HourlyForecastItem,
  TemperatureUnit,
  WindSpeedUnit,
} from '../types';
import {
  formatTemp,
  formatWindSpeed,
  getUvCategory,
  getWeatherCondition,
} from '../utils/weatherUtils';
import { WeatherIcon } from './WeatherIcon';

interface DayHourlyForecastViewProps {
  date: string;
  dayItem: DailyForecastItem;
  hourly: HourlyForecastItem[];
  temperatureUnit: TemperatureUnit;
  windUnit: WindSpeedUnit;
  isDark?: boolean;
}

type DayMetricMode = 'combined' | 'temperature' | 'rain';

export const DayHourlyForecastView: React.FC<DayHourlyForecastViewProps> = ({
  date,
  dayItem,
  hourly,
  temperatureUnit,
  windUnit,
  isDark = false,
}) => {
  const [metricMode, setMetricMode] = useState<DayMetricMode>('combined');

  const convertTemp = (celsius: number) => {
    if (temperatureUnit === 'fahrenheit') {
      return Math.round((celsius * 9) / 5 + 32);
    }
    return Math.round(celsius);
  };

  const tempUnitSymbol = temperatureUnit === 'fahrenheit' ? '°F' : '°C';

  // Extract hourly data matching this specific day's date (YYYY-MM-DD)
  const dayHours = useMemo(() => {
    if (!hourly || hourly.length === 0) return [];
    const matched = hourly.filter((h) => h.time.startsWith(date));
    if (matched.length > 0) return matched;

    // Fallback: match by ISO substring
    const isoMatched = hourly.filter((h) => {
      try {
        return new Date(h.time).toISOString().slice(0, 10) === date;
      } catch {
        return false;
      }
    });
    if (isoMatched.length > 0) return isoMatched;

    // If beyond available hourly horizon, synthesize 24-hour diurnal curve from min/max
    const synthetic: HourlyForecastItem[] = [];
    const minT = dayItem.temperatureMin;
    const maxT = dayItem.temperatureMax;
    for (let hour = 0; hour < 24; hour++) {
      // Diurnal curve: lowest around 06:00 (sunrise), highest around 15:00
      const rad = ((hour - 6) / 24) * 2 * Math.PI;
      const factor = (Math.sin(rad - Math.PI / 2) + 1) / 2;
      const t = minT + (maxT - minT) * factor;
      synthetic.push({
        time: `${date}T${hour.toString().padStart(2, '0')}:00`,
        temperature: Number(t.toFixed(1)),
        weatherCode: dayItem.weatherCode,
        precipitationProbability:
          hour >= 12 && hour <= 19 ? dayItem.precipitationProbabilityMax : Math.round(dayItem.precipitationProbabilityMax * 0.4),
        uvIndex: hour >= 9 && hour <= 17 ? Math.max(0, dayItem.uvIndexMax * Math.sin(((hour - 8) / 9) * Math.PI)) : 0,
      });
    }
    return synthetic;
  }, [hourly, date, dayItem]);

  // Transform data for recharts
  const chartData = useMemo(() => {
    return dayHours.map((item) => {
      const dateObj = new Date(item.time);
      const condition = getWeatherCondition(item.weatherCode, true);
      const hourNum = dateObj.getHours();

      // Format clean hour label, e.g. "6 AM", "12 PM"
      const hourLabel =
        hourNum === 0
          ? '12 AM'
          : hourNum === 12
          ? '12 PM'
          : hourNum > 12
          ? `${hourNum - 12} PM`
          : `${hourNum} AM`;

      return {
        time: item.time,
        label: hourLabel,
        hourNum,
        fullTime: dateObj.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        temperature: convertTemp(item.temperature),
        rawTemp: item.temperature,
        precipitation: item.precipitationProbability ?? 0,
        uvIndex: Number((item.uvIndex ?? 0).toFixed(1)),
        conditionLabel: condition.label,
        iconName: condition.iconName,
      };
    });
  }, [dayHours, temperatureUnit]);

  // Compute scale boundaries for Y-axis
  const tempValues = chartData.map((d) => d.temperature);
  const minTemp = tempValues.length > 0 ? Math.min(...tempValues) : 0;
  const maxTemp = tempValues.length > 0 ? Math.max(...tempValues) : 30;
  const yTempDomain = [Math.floor(minTemp - 2), Math.ceil(maxTemp + 2)];

  // Theme styling tokens
  const uvInfo = getUvCategory(dayItem.uvIndexMax);
  const textSubtle = isDark ? 'text-slate-400' : 'text-stone-500';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
  const tickColor = isDark ? '#94a3b8' : '#78716c';

  const formatSunTime = (isoTime?: string) => {
    if (!isoTime) return '--:--';
    const d = new Date(isoTime);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      id={`day-hourly-view-${date}`}
      className={`mt-3 p-4 sm:p-5 rounded-2xl border transition-all space-y-5 ${
        isDark
          ? 'bg-slate-900/90 border-slate-700/80 text-white shadow-inner'
          : 'bg-white/95 border-stone-200/90 text-stone-900 shadow-xs'
      }`}
    >
      {/* 4 Summary Metric Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pb-1">
        <div
          className={`p-3 rounded-xl border ${
            isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-stone-50 border-stone-200/70'
          }`}
        >
          <span className={`${textSubtle} flex items-center gap-1.5 font-medium mb-1`}>
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            UV Index Peak
          </span>
          <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-stone-900'}`}>
            {dayItem.uvIndexMax.toFixed(1)}{' '}
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${uvInfo.colorClass}`}>
              {uvInfo.text}
            </span>
          </p>
        </div>

        <div
          className={`p-3 rounded-xl border ${
            isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-stone-50 border-stone-200/70'
          }`}
        >
          <span className={`${textSubtle} flex items-center gap-1.5 font-medium mb-1`}>
            <Wind className={`w-3.5 h-3.5 ${isDark ? 'text-sky-400' : 'text-stone-600'}`} />
            Peak Wind Gust
          </span>
          <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-stone-900'}`}>
            {formatWindSpeed(dayItem.windSpeedMax, windUnit)}
          </p>
        </div>

        <div
          className={`p-3 rounded-xl border ${
            isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-stone-50 border-stone-200/70'
          }`}
        >
          <span className={`${textSubtle} flex items-center gap-1.5 font-medium mb-1`}>
            <Droplets className="w-3.5 h-3.5 text-sky-500" />
            Precipitation
          </span>
          <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-stone-900'}`}>
            {dayItem.precipitationSum} mm ({dayItem.precipitationProbabilityMax}%)
          </p>
        </div>

        <div
          className={`p-3 rounded-xl border ${
            isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-stone-50 border-stone-200/70'
          }`}
        >
          <span className={`${textSubtle} flex items-center gap-1.5 font-medium mb-1`}>
            <Sunrise className="w-3.5 h-3.5 text-amber-500" />
            Daylight Span
          </span>
          <p className={`font-medium text-xs mt-0.5 ${isDark ? 'text-slate-200' : 'text-stone-800'}`}>
            {formatSunTime(dayItem.sunrise)} – {formatSunTime(dayItem.sunset)}
          </p>
        </div>
      </div>

      {/* Hourly Chart Header & Controls */}
      <div className="pt-2 border-t border-black/10 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Clock className={`w-4 h-4 ${isDark ? 'text-sky-400' : 'text-stone-700'}`} />
          <span className="font-bold text-sm">24-Hour Hourly Trajectory</span>
          <span className={`text-xs ${textSubtle}`}>• {dayHours.length} hourly data points</span>
        </div>

        {/* Metric Toggles */}
        <div
          id={`day-metric-toggle-${date}`}
          className={`inline-flex rounded-lg p-0.5 border text-xs font-medium self-start sm:self-auto ${
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-stone-100 border-stone-200'
          }`}
        >
          <button
            type="button"
            onClick={() => setMetricMode('combined')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              metricMode === 'combined'
                ? isDark
                  ? 'bg-sky-500 text-white shadow-xs font-semibold'
                  : 'bg-white text-stone-900 shadow-xs font-semibold'
                : isDark
                ? 'text-slate-300 hover:text-white'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Combined</span>
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('temperature')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              metricMode === 'temperature'
                ? isDark
                  ? 'bg-sky-500 text-white shadow-xs font-semibold'
                  : 'bg-white text-stone-900 shadow-xs font-semibold'
                : isDark
                ? 'text-slate-300 hover:text-white'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Thermometer className="w-3 h-3" />
            <span>Temp</span>
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('rain')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              metricMode === 'rain'
                ? isDark
                  ? 'bg-sky-500 text-white shadow-xs font-semibold'
                  : 'bg-white text-stone-900 shadow-xs font-semibold'
                : isDark
                ? 'text-slate-300 hover:text-white'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <CloudRain className="w-3 h-3" />
            <span>Rain %</span>
          </button>
        </div>
      </div>

      {/* 24-Hour Recharts Canvas */}
      <div id={`day-chart-canvas-${date}`} className="w-full h-52 sm:h-56 select-none">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 12, right: 10, left: -14, bottom: 2 }}>
            <defs>
              <linearGradient id={`dayTempGrad-${date}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isDark ? '#38bdf8' : '#f59e0b'} stopOpacity={0.4} />
                <stop offset="95%" stopColor={isDark ? '#38bdf8' : '#f59e0b'} stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id={`dayRainGrad-${date}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0284c7" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.2} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />

            <XAxis
              dataKey="label"
              tickLine={false}
              stroke={tickColor}
              tick={{ fontSize: 10, fill: tickColor }}
              interval={2} // Show every 3rd hour for clean density
            />

            {/* Left Y-Axis for Temperature */}
            <YAxis
              yAxisId="left"
              domain={metricMode === 'rain' ? [0, 100] : yTempDomain}
              orientation="left"
              tickLine={false}
              stroke={tickColor}
              tick={{ fontSize: 10, fill: tickColor }}
              unit={metricMode === 'rain' ? '%' : tempUnitSymbol}
            />

            {/* Right Y-Axis for Rain % in Combined Mode */}
            {metricMode === 'combined' && (
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                tickLine={false}
                stroke={tickColor}
                tick={{ fontSize: 10, fill: tickColor }}
                unit="%"
              />
            )}

            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload;
                return (
                  <div
                    className={`p-2.5 rounded-xl border shadow-xl text-xs space-y-1.5 backdrop-blur-md ${
                      isDark
                        ? 'bg-slate-900/95 border-slate-700 text-white'
                        : 'bg-white/95 border-stone-200 text-stone-900'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 border-b pb-1 border-stone-200/50 dark:border-slate-700">
                      <span className="font-bold">{d.fullTime}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isDark ? 'bg-slate-800 text-sky-300' : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {d.conditionLabel}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-0.5">
                      <div className="flex items-center gap-1.5">
                        <Thermometer className="w-3 h-3 text-amber-500" />
                        <span className={textSubtle}>Temp:</span>
                        <span className="font-bold">
                          {d.temperature}
                          {tempUnitSymbol}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CloudRain className="w-3 h-3 text-sky-500" />
                        <span className={textSubtle}>Rain:</span>
                        <span className="font-bold">{d.precipitation}%</span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />

            {/* Rain Precipitation Bars */}
            {(metricMode === 'combined' || metricMode === 'rain') && (
              <Bar
                yAxisId={metricMode === 'combined' ? 'right' : 'left'}
                dataKey="precipitation"
                name="Rain Chance %"
                fill={`url(#dayRainGrad-${date})`}
                radius={[4, 4, 0, 0]}
                maxBarSize={16}
              />
            )}

            {/* Temperature Curve Area */}
            {(metricMode === 'combined' || metricMode === 'temperature') && (
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="temperature"
                name="Temperature"
                stroke={isDark ? '#38bdf8' : '#f59e0b'}
                strokeWidth={2.5}
                fill={`url(#dayTempGrad-${date})`}
                dot={{
                  r: 2,
                  fill: isDark ? '#38bdf8' : '#f59e0b',
                  strokeWidth: 0,
                }}
                activeDot={{
                  r: 5,
                  strokeWidth: 2,
                  stroke: isDark ? '#0f172a' : '#ffffff',
                }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 24-Hour Micro-Card Timeline Scroll Strip */}
      <div className="space-y-1.5 pt-1">
        <span className={`text-[11px] font-semibold uppercase tracking-wider ${textSubtle} block`}>
          Hourly Timeline Breakdown
        </span>
        <div
          id={`day-hourly-scroll-${date}`}
          className="flex gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-stone-200 dark:scrollbar-thumb-slate-700"
        >
          {chartData.map((item) => {
            return (
              <div
                key={item.time}
                className={`flex flex-col items-center justify-between min-w-[58px] p-2 rounded-xl border text-center transition-colors shrink-0 ${
                  isDark
                    ? 'bg-slate-800/60 hover:bg-slate-800 text-slate-200 border-slate-700/80'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-200/80'
                }`}
              >
                <span className="text-[11px] font-semibold opacity-75">{item.label}</span>
                <div className="my-1.5">
                  <WeatherIcon
                    name={item.iconName}
                    className={`w-4 h-4 ${isDark ? 'text-sky-300' : 'text-stone-700'}`}
                  />
                </div>
                <span className="text-xs font-bold">
                  {item.temperature}
                  {tempUnitSymbol}
                </span>
                {item.precipitation > 0 ? (
                  <span className="text-[10px] text-sky-500 font-medium flex items-center gap-0.5 mt-0.5">
                    <Droplets className="w-2.5 h-2.5" />
                    {item.precipitation}%
                  </span>
                ) : (
                  <span className="text-[10px] opacity-35 mt-0.5">—</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
