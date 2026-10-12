import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  TrendingUp,
  Thermometer,
  CloudRain,
  Sun,
  Layers,
  CalendarRange,
} from 'lucide-react';
import { HourlyForecastItem, TemperatureUnit } from '../types';
import { getWeatherCondition } from '../utils/weatherUtils';

interface HourlyForecastChartProps {
  hourly: HourlyForecastItem[];
  temperatureUnit: TemperatureUnit;
  isDark?: boolean;
}

type ChartMetric = 'combined' | 'temperature' | 'precipitation' | 'uv';
type TimeframeOption = 12 | 24 | 48;

export const HourlyForecastChart: React.FC<HourlyForecastChartProps> = ({
  hourly,
  temperatureUnit,
  isDark = false,
}) => {
  const [activeMetric, setActiveMetric] = useState<ChartMetric>('combined');
  const [timeframe, setTimeframe] = useState<TimeframeOption>(24);

  const formatTemp = (celsius: number) => {
    if (temperatureUnit === 'fahrenheit') {
      return Math.round((celsius * 9) / 5 + 32);
    }
    return Math.round(celsius);
  };

  const tempUnitSymbol = temperatureUnit === 'fahrenheit' ? '°F' : '°C';

  // Format data for recharts
  const chartData = useMemo(() => {
    const sliceData = hourly.slice(0, timeframe);
    return sliceData.map((item, idx) => {
      const date = new Date(item.time);
      const condition = getWeatherCondition(item.weatherCode, true);
      const isNow = idx === 0;
      const hourLabel = isNow
        ? 'Now'
        : date.toLocaleTimeString([], { hour: 'numeric' });

      return {
        time: item.time,
        label: hourLabel,
        fullTime: date.toLocaleTimeString([], {
          weekday: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }),
        temperature: formatTemp(item.temperature),
        rawTemp: item.temperature,
        precipitation: item.precipitationProbability ?? 0,
        uvIndex: Number((item.uvIndex ?? 0).toFixed(1)),
        conditionLabel: condition.label,
        iconName: condition.iconName,
      };
    });
  }, [hourly, timeframe, temperatureUnit]);

  // Determine min and max for temperature axis with breathing room
  const tempValues = chartData.map((d) => d.temperature);
  const minTemp = tempValues.length > 0 ? Math.min(...tempValues) : 0;
  const maxTemp = tempValues.length > 0 ? Math.max(...tempValues) : 30;
  const yTempDomain = [Math.floor(minTemp - 2), Math.ceil(maxTemp + 2)];

  // Theme styling tokens
  const containerClass = isDark
    ? 'bg-slate-900/80 backdrop-blur-md border-slate-700/80 text-white shadow-lg'
    : 'bg-white/85 backdrop-blur-md border-white/70 text-stone-900 shadow-sm';
  const textTitle = isDark ? 'text-white' : 'text-stone-900';
  const textSubtle = isDark ? 'text-slate-400' : 'text-stone-500';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
  const tickColor = isDark ? '#94a3b8' : '#78716c';

  return (
    <div
      id="hourly-forecast-chart-container"
      className={`${containerClass} border rounded-2xl p-5 sm:p-6 space-y-5 transition-colors duration-500`}
    >
      {/* Header & Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isDark
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                : 'bg-stone-900 text-amber-300'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`font-bold text-base ${textTitle}`}>
                Hourly Atmospheric Telemetry
              </h3>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  isDark
                    ? 'bg-slate-800 text-sky-300 border-slate-700'
                    : 'bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                Next {timeframe} Hours
              </span>
            </div>
            <p className={`text-xs ${textSubtle}`}>
              High-resolution trends for temperature, precipitation risk, and UV exposure
            </p>
          </div>
        </div>

        {/* Action Controls: Metrics & Timeframe */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Metric Selector */}
          <div
            id="chart-metric-selector"
            className={`inline-flex rounded-xl p-1 border text-xs font-medium ${
              isDark
                ? 'bg-slate-800/80 border-slate-700'
                : 'bg-stone-100/90 border-stone-200'
            }`}
          >
            <button
              id="metric-combined-btn"
              type="button"
              onClick={() => setActiveMetric('combined')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
                activeMetric === 'combined'
                  ? isDark
                    ? 'bg-sky-500 text-white shadow-xs font-semibold'
                    : 'bg-white text-stone-900 shadow-xs font-semibold'
                  : isDark
                  ? 'text-slate-300 hover:text-white'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Combined</span>
            </button>

            <button
              id="metric-temp-btn"
              type="button"
              onClick={() => setActiveMetric('temperature')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
                activeMetric === 'temperature'
                  ? isDark
                    ? 'bg-sky-500 text-white shadow-xs font-semibold'
                    : 'bg-white text-stone-900 shadow-xs font-semibold'
                  : isDark
                  ? 'text-slate-300 hover:text-white'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Thermometer className="w-3.5 h-3.5" />
              <span>Temp</span>
            </button>

            <button
              id="metric-rain-btn"
              type="button"
              onClick={() => setActiveMetric('precipitation')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
                activeMetric === 'precipitation'
                  ? isDark
                    ? 'bg-sky-500 text-white shadow-xs font-semibold'
                    : 'bg-white text-stone-900 shadow-xs font-semibold'
                  : isDark
                  ? 'text-slate-300 hover:text-white'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <CloudRain className="w-3.5 h-3.5" />
              <span>Rain %</span>
            </button>

            <button
              id="metric-uv-btn"
              type="button"
              onClick={() => setActiveMetric('uv')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
                activeMetric === 'uv'
                  ? isDark
                    ? 'bg-sky-500 text-white shadow-xs font-semibold'
                    : 'bg-white text-stone-900 shadow-xs font-semibold'
                  : isDark
                  ? 'text-slate-300 hover:text-white'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>UV Index</span>
            </button>
          </div>

          {/* Timeframe Selector */}
          <div
            id="chart-timeframe-selector"
            className={`inline-flex rounded-xl p-1 border text-xs font-medium ${
              isDark
                ? 'bg-slate-800/80 border-slate-700'
                : 'bg-stone-100/90 border-stone-200'
            }`}
          >
            {([12, 24, 48] as TimeframeOption[]).map((hours) => (
              <button
                key={hours}
                id={`timeframe-${hours}h-btn`}
                type="button"
                onClick={() => setTimeframe(hours)}
                className={`px-2.5 py-1.5 rounded-lg transition-all ${
                  timeframe === hours
                    ? isDark
                      ? 'bg-sky-500 text-white shadow-xs font-semibold'
                      : 'bg-white text-stone-900 shadow-xs font-semibold'
                    : isDark
                    ? 'text-slate-300 hover:text-white'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {hours}h
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div id="hourly-chart-viewport" className="w-full h-72 sm:h-80 select-none">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 15, right: 12, left: -10, bottom: 5 }}
          >
            <defs>
              {/* Temperature Area Gradient */}
              <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={isDark ? '#38bdf8' : '#f59e0b'}
                  stopOpacity={0.45}
                />
                <stop
                  offset="95%"
                  stopColor={isDark ? '#38bdf8' : '#f59e0b'}
                  stopOpacity={0.0}
                />
              </linearGradient>

              {/* Rain Bar/Area Gradient */}
              <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0284c7" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.25} />
              </linearGradient>

              {/* UV Area Gradient */}
              <linearGradient id="uvGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#ec4899" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />

            <XAxis
              dataKey="label"
              tickLine={false}
              stroke={tickColor}
              tick={{ fontSize: 11, fill: tickColor }}
              interval={timeframe === 48 ? 3 : timeframe === 24 ? 1 : 0}
            />

            {/* Left Y-Axis for Temperature & UV */}
            <YAxis
              yAxisId="left"
              domain={activeMetric === 'uv' ? [0, 12] : yTempDomain}
              orientation="left"
              tickLine={false}
              stroke={tickColor}
              tick={{ fontSize: 11, fill: tickColor }}
              unit={activeMetric === 'uv' ? '' : tempUnitSymbol}
            />

            {/* Right Y-Axis for Precipitation Probability % */}
            {(activeMetric === 'combined' || activeMetric === 'precipitation') && (
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                tickLine={false}
                stroke={tickColor}
                tick={{ fontSize: 11, fill: tickColor }}
                unit="%"
              />
            )}

            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const data = payload[0].payload;
                return (
                  <div
                    className={`p-3 rounded-xl border shadow-xl text-xs space-y-2 backdrop-blur-md ${
                      isDark
                        ? 'bg-slate-900/95 border-slate-700 text-white'
                        : 'bg-white/95 border-stone-200 text-stone-900'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 border-b pb-1.5 border-stone-200/50 dark:border-slate-700">
                      <span className="font-bold">{data.fullTime}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isDark
                            ? 'bg-slate-800 text-sky-300'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {data.conditionLabel}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-0.5">
                      <div className="flex items-center gap-1.5">
                        <Thermometer
                          className={`w-3.5 h-3.5 ${
                            isDark ? 'text-amber-400' : 'text-amber-500'
                          }`}
                        />
                        <span className={textSubtle}>Temp:</span>
                        <span className="font-bold">
                          {data.temperature}
                          {tempUnitSymbol}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <CloudRain className="w-3.5 h-3.5 text-sky-400" />
                        <span className={textSubtle}>Precip:</span>
                        <span className="font-bold">{data.precipitation}%</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Sun className="w-3.5 h-3.5 text-pink-400" />
                        <span className={textSubtle}>UV Index:</span>
                        <span className="font-bold">{data.uvIndex}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <CalendarRange className={`w-3.5 h-3.5 ${textSubtle}`} />
                        <span className={textSubtle}>Condition:</span>
                        <span className="font-medium truncate max-w-[80px]">
                          {data.conditionLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />

            {/* Combined View */}
            {activeMetric === 'combined' && (
              <>
                <Bar
                  yAxisId="right"
                  dataKey="precipitation"
                  fill="url(#rainGradient)"
                  radius={[4, 4, 0, 0]}
                  barSize={12}
                  name="Rain Risk %"
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="temperature"
                  stroke={isDark ? '#38bdf8' : '#d97706'}
                  strokeWidth={2.5}
                  fill="url(#tempGradient)"
                  name="Temperature"
                />
              </>
            )}

            {/* Temperature Only */}
            {activeMetric === 'temperature' && (
              <>
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="temperature"
                  stroke={isDark ? '#38bdf8' : '#d97706'}
                  strokeWidth={3}
                  fill="url(#tempGradient)"
                  name="Temperature"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="temperature"
                  stroke={isDark ? '#7dd3fc' : '#b45309'}
                  strokeWidth={2}
                  dot={{ r: 3, fill: isDark ? '#38bdf8' : '#d97706', strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </>
            )}

            {/* Precipitation Only */}
            {activeMetric === 'precipitation' && (
              <Bar
                yAxisId="right"
                dataKey="precipitation"
                fill="url(#rainGradient)"
                radius={[5, 5, 0, 0]}
                barSize={18}
                name="Precipitation Probability"
              />
            )}

            {/* UV Index Only */}
            {activeMetric === 'uv' && (
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="uvIndex"
                stroke="#ec4899"
                strokeWidth={2.5}
                fill="url(#uvGradient)"
                name="UV Index"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Quick Summary Footer */}
      <div
        className={`pt-3 border-t flex flex-wrap items-center justify-between gap-3 text-xs ${
          isDark ? 'border-slate-800 text-slate-400' : 'border-stone-100 text-stone-500'
        }`}
      >
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-3 h-1.5 rounded-full ${
                isDark ? 'bg-sky-400' : 'bg-amber-500'
              }`}
            />
            <span className="font-medium">
              Temp Curve ({minTemp}
              {tempUnitSymbol} ~ {maxTemp}
              {tempUnitSymbol})
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-sky-500" />
            <span className="font-medium">Precipitation Probability (%)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-pink-500" />
            <span className="font-medium">UV Radiation Level</span>
          </div>
        </div>

        <span className="text-[11px] opacity-80">
          Tip: Hover along the graph curve to inspect hourly readings
        </span>
      </div>
    </div>
  );
};
