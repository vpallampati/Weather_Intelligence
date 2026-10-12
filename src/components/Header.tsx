import React from 'react';
import { CloudSun, RefreshCw } from 'lucide-react';
import { TemperatureUnit, WindSpeedUnit } from '../types';

interface HeaderProps {
  temperatureUnit: TemperatureUnit;
  onToggleTempUnit: () => void;
  windUnit: WindSpeedUnit;
  onToggleWindUnit: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated?: string;
}

export const Header: React.FC<HeaderProps> = ({
  temperatureUnit,
  onToggleTempUnit,
  windUnit,
  onToggleWindUnit,
  onRefresh,
  isRefreshing,
  lastUpdated,
}) => {
  return (
    <header
      id="app-header"
      className="w-full bg-stone-950/60 backdrop-blur-md text-stone-100 border-b border-white/10 px-4 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-amber-300">
          <CloudSun className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">Weather Intelligence</h1>
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Open-Meteo Live
            </span>
          </div>
          <p className="text-xs text-stone-300">Atmospheric telemetry & predictive planning</p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap justify-end">
        {lastUpdated && (
          <span className="text-xs text-stone-300 hidden md:inline">
            Updated {new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}

        {/* Temperature Unit Toggle */}
        <div className="inline-flex rounded-lg border border-white/15 bg-black/30 p-0.5">
          <button
            id="unit-celsius-btn"
            type="button"
            onClick={onToggleTempUnit}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              temperatureUnit === 'celsius'
                ? 'bg-white/20 text-white shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            °C
          </button>
          <button
            id="unit-fahrenheit-btn"
            type="button"
            onClick={onToggleTempUnit}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              temperatureUnit === 'fahrenheit'
                ? 'bg-white/20 text-white shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            °F
          </button>
        </div>

        {/* Wind Speed Unit Toggle */}
        <button
          id="toggle-wind-btn"
          type="button"
          onClick={onToggleWindUnit}
          className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-white/15 bg-black/30 text-stone-200 hover:text-white hover:bg-white/10 transition-colors"
          title="Toggle wind speed unit"
        >
          {windUnit === 'kmh' ? 'km/h' : 'mph'}
        </button>

        {/* Refresh Button */}
        <button
          id="refresh-weather-btn"
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-lg border border-white/15 bg-black/30 text-stone-200 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
          title="Refresh current data"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
        </button>
      </div>
    </header>
  );
};
