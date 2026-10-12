/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { CurrentWeatherCard } from './components/CurrentWeatherCard';
import { HourlyForecastStrip } from './components/HourlyForecastStrip';
import { HourlyForecastChart } from './components/HourlyForecastChart';
import { SevenDayForecast } from './components/SevenDayForecast';
import { PlanningRecommendationsCard } from './components/PlanningRecommendations';
import { WeatherAtmosphere } from './components/WeatherAtmosphere';
import { WeatherAlertsBanner } from './components/WeatherAlertsBanner';
import {
  CityLocation,
  DailyForecastItem,
  HourlyForecastItem,
  PlanningRecommendations,
  TemperatureUnit,
  WeatherAlert,
  WeatherData,
  WindSpeedUnit,
} from './types';
import { generateHeuristicRecommendations } from './utils/weatherUtils';
import { detectExtremeWeatherAlerts } from './utils/alertDetection';
import {
  getWeatherThemeConfig,
  getThemeByCategory,
  WeatherCategory,
} from './utils/weatherThemes';

const DEFAULT_CITY: CityLocation = {
  id: 5128581,
  name: 'New York',
  latitude: 40.7128,
  longitude: -74.006,
  country: 'United States',
  admin1: 'New York',
};

const dashboardContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.22,
      ease: 'easeOut',
    },
  },
};

const dashboardItemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.38,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export default function App() {
  const [selectedCity, setSelectedCity] = useState<CityLocation>(DEFAULT_CITY);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [simulatedAlert, setSimulatedAlert] = useState<WeatherAlert | null>(null);
  const [recommendations, setRecommendations] = useState<PlanningRecommendations | null>(null);
  const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnit>('celsius');
  const [windUnit, setWindUnit] = useState<WindSpeedUnit>('kmh');
  const [atmosphereOverride, setAtmosphereOverride] = useState<WeatherCategory | 'auto'>('auto');
  const [hourlyDisplayMode, setHourlyDisplayMode] = useState<'both' | 'chart' | 'strip'>('both');

  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch National Weather Service (NWS) & WMO extreme alerts
  const fetchAlerts = useCallback(async (data: WeatherData) => {
    try {
      const res = await fetch(`/api/alerts?lat=${data.city.latitude}&lon=${data.city.longitude}`);
      let nwsAlerts: WeatherAlert[] = [];
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.alerts)) {
          nwsAlerts = json.alerts;
        }
      }

      // Detect severe meteorological telemetry thresholds
      const localExtremes = detectExtremeWeatherAlerts(data);
      const combined = [...nwsAlerts];
      for (const item of localExtremes) {
        if (!combined.some((a) => a.event.toLowerCase() === item.event.toLowerCase())) {
          combined.push(item);
        }
      }
      setAlerts(combined);
    } catch (err) {
      console.warn('Alert retrieval issue, utilizing local meteorological detector:', err);
      setAlerts(detectExtremeWeatherAlerts(data));
    }
  }, []);

  // Request AI recommendations from server
  const fetchRecommendations = useCallback(async (data: WeatherData) => {
    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: data.city,
          current: data.current,
          daily: data.daily,
          timezone: data.timezone,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.available && json.recommendations) {
          setRecommendations(json.recommendations);
          return;
        }
      }
      // If AI server returned unavailable or failed, fallback to local heuristics
      setRecommendations(generateHeuristicRecommendations(data));
    } catch (err) {
      console.warn('AI recommendations endpoint unavailable, using meteorological heuristic engine:', err);
      setRecommendations(generateHeuristicRecommendations(data));
    } finally {
      setIsLoadingAi(false);
    }
  }, []);

  // Fetch Weather from Open-Meteo via backend proxy
  const fetchWeather = useCallback(
    async (city: CityLocation) => {
      setIsLoadingWeather(true);
      setErrorMessage(null);

      try {
        const res = await fetch(`/api/weather?lat=${city.latitude}&lon=${city.longitude}`);
        if (!res.ok) {
          throw new Error(`Open-Meteo returned status ${res.status}`);
        }

        const raw = await res.json();

        // Process hourly (next 24-48 items)
        const hourlyItems: HourlyForecastItem[] = (raw.hourly?.time || []).map((t: string, idx: number) => ({
          time: t,
          temperature: raw.hourly?.temperature_2m?.[idx] ?? 0,
          weatherCode: raw.hourly?.weather_code?.[idx] ?? 0,
          precipitationProbability: raw.hourly?.precipitation_probability?.[idx] ?? 0,
          uvIndex: raw.hourly?.uv_index?.[idx] ?? 0,
        }));

        // Filter starting from the current hour
        const nowIso = new Date().toISOString();
        const currentHourIdx = hourlyItems.findIndex((h) => new Date(h.time).getTime() >= new Date(nowIso).getTime() - 3600000);
        const filteredHourly = currentHourIdx >= 0 ? hourlyItems.slice(currentHourIdx) : hourlyItems;

        // Process daily
        const dailyItems: DailyForecastItem[] = (raw.daily?.time || []).map((t: string, idx: number) => ({
          date: t,
          weatherCode: raw.daily?.weather_code?.[idx] ?? 0,
          temperatureMax: raw.daily?.temperature_2m_max?.[idx] ?? 0,
          temperatureMin: raw.daily?.temperature_2m_min?.[idx] ?? 0,
          apparentTemperatureMax: raw.daily?.apparent_temperature_max?.[idx] ?? 0,
          apparentTemperatureMin: raw.daily?.apparent_temperature_min?.[idx] ?? 0,
          precipitationProbabilityMax: raw.daily?.precipitation_probability_max?.[idx] ?? 0,
          precipitationSum: raw.daily?.precipitation_sum?.[idx] ?? 0,
          uvIndexMax: raw.daily?.uv_index_max?.[idx] ?? 0,
          windSpeedMax: raw.daily?.wind_speed_10m_max?.[idx] ?? 0,
          sunrise: raw.daily?.sunrise?.[idx] ?? '',
          sunset: raw.daily?.sunset?.[idx] ?? '',
        }));

        const compiledData: WeatherData = {
          city,
          current: {
            time: raw.current?.time || new Date().toISOString(),
            temperature: raw.current?.temperature_2m ?? 0,
            apparentTemperature: raw.current?.apparent_temperature ?? raw.current?.temperature_2m ?? 0,
            relativeHumidity: raw.current?.relative_humidity_2m ?? 50,
            isDay: raw.current?.is_day === 1,
            weatherCode: raw.current?.weather_code ?? 0,
            windSpeed: raw.current?.wind_speed_10m ?? 0,
            windDirection: raw.current?.wind_direction_10m ?? 0,
            windGusts: raw.current?.wind_gusts_10m ?? raw.current?.wind_speed_10m ?? 0,
            precipitation: raw.current?.precipitation ?? 0,
            cloudCover: raw.current?.cloud_cover ?? 0,
            pressure: raw.current?.surface_pressure ?? raw.current?.pressure_msl ?? 1013,
          },
          hourly: filteredHourly,
          allHourly: hourlyItems,
          daily: dailyItems,
          timezone: raw.timezone || 'UTC',
          fetchedAt: new Date().toISOString(),
        };

        setWeatherData(compiledData);

        // Fetch National Weather Service & Meteorological extreme alerts
        fetchAlerts(compiledData);

        // Immediately compute instant heuristic recommendations so UI is populated without delay
        const instantRecommendations = generateHeuristicRecommendations(compiledData);
        setRecommendations(instantRecommendations);

        // Then enhance with AI asynchronously
        fetchRecommendations(compiledData);
      } catch (err: any) {
        console.error('Weather retrieval failed:', err);
        setErrorMessage(
          err.message || 'Unable to fetch meteorological data from Open-Meteo. Please verify network connectivity.'
        );
      } finally {
        setIsLoadingWeather(false);
      }
    },
    [fetchAlerts, fetchRecommendations]
  );

  // Initial load
  useEffect(() => {
    fetchWeather(selectedCity);
  }, [selectedCity, fetchWeather]);

  // Geolocation detection
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
          // Attempt reverse geocoding via bigdatacloud or Open-Meteo reverse
          const reverseRes = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
          );
          let cityName = 'Current Location';
          let countryName = '';
          let admin1 = '';

          if (reverseRes.ok) {
            const locData = await reverseRes.json();
            cityName = locData.city || locData.locality || 'Current Location';
            countryName = locData.countryName || '';
            admin1 = locData.principalSubdivision || '';
          }

          const localCity: CityLocation = {
            id: Date.now(),
            name: cityName,
            latitude: lat,
            longitude: lon,
            country: countryName,
            admin1,
          };

          setSelectedCity(localCity);
        } catch (e) {
          // Fallback if reverse geocoding fails
          setSelectedCity({
            id: Date.now(),
            name: 'Local Coordinates',
            latitude: lat,
            longitude: lon,
          });
        } finally {
          setIsLocating(false);
        }
      },
      (geoError) => {
        setIsLocating(false);
        let msg = 'Could not access location.';
        if (geoError.code === geoError.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Please search your city manually.';
        } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
          msg = 'Location information is currently unavailable.';
        } else if (geoError.code === geoError.TIMEOUT) {
          msg = 'Location request timed out.';
        }
        setErrorMessage(msg);
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  const handleCitySelect = (city: CityLocation) => {
    setSimulatedAlert(null);
    setSelectedCity(city);
  };

  const handleRefresh = () => {
    fetchWeather(selectedCity);
  };

  const displayedAlerts = simulatedAlert
    ? [simulatedAlert, ...alerts.filter((a) => a.id !== simulatedAlert.id)]
    : alerts;
  const activeSimulatedKey = simulatedAlert ? simulatedAlert.id.replace('nws-sim-', '') : null;

  // Derive active weather theme
  const liveTheme = weatherData
    ? getWeatherThemeConfig(weatherData.current.weatherCode, weatherData.current.isDay)
    : getWeatherThemeConfig(0, true);

  const currentTheme =
    atmosphereOverride === 'auto'
      ? liveTheme
      : getThemeByCategory(atmosphereOverride);

  const atmospherePresets: Array<{ id: WeatherCategory | 'auto'; label: string }> = [
    { id: 'auto', label: '🛰️ Live Open-Meteo' },
    { id: 'clear-day', label: '☀️ Clear Day' },
    { id: 'clear-night', label: '🌙 Starry Night' },
    { id: 'rain', label: '🌧️ Rain' },
    { id: 'thunderstorm', label: '⚡ Thunderstorm' },
    { id: 'snow', label: '❄️ Crisp Snow' },
    { id: 'fog', label: '🌫️ Mist & Fog' },
  ];

  return (
    <div
      id="weather-intelligence-root"
      className={`min-h-screen relative flex flex-col antialiased transition-all duration-700 bg-gradient-to-b ${currentTheme.gradientClass} ${
        currentTheme.isDarkTheme ? 'text-white' : 'text-stone-900'
      }`}
    >
      {/* Dynamic Atmospheric Visual Layer */}
      <WeatherAtmosphere
        category={currentTheme.category}
        ambientOverlay={currentTheme.ambientOverlay}
      />

      <div className="relative z-10 flex flex-col flex-1">
        {/* App Header */}
        <Header
          temperatureUnit={temperatureUnit}
          onToggleTempUnit={() =>
            setTemperatureUnit((prev) => (prev === 'celsius' ? 'fahrenheit' : 'celsius'))
          }
          windUnit={windUnit}
          onToggleWindUnit={() => setWindUnit((prev) => (prev === 'kmh' ? 'mph' : 'kmh'))}
          onRefresh={handleRefresh}
          isRefreshing={isLoadingWeather}
          lastUpdated={weatherData?.fetchedAt}
        />

        {/* Atmospheric Status Ribbon & Scene Selector */}
        <div
          id="atmospheric-theme-ribbon"
          className={`w-full border-b py-2 px-4 sm:px-8 text-xs flex flex-wrap items-center justify-between gap-2.5 transition-colors ${
            currentTheme.isDarkTheme
              ? 'bg-slate-950/40 border-white/10 text-slate-300'
              : 'bg-white/40 border-stone-200/60 text-stone-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold">
              Atmosphere: <span className={currentTheme.isDarkTheme ? 'text-sky-300' : 'text-stone-900'}>{currentTheme.name}</span>
            </span>
            <span className="text-[11px] opacity-75 hidden md:inline">
              ({atmosphereOverride === 'auto' ? 'Synced with live city weather' : 'Preview Mode Active'})
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] opacity-75 mr-1 font-medium">Theme Scene:</span>
            {atmospherePresets.map((preset) => {
              const isSelected = atmosphereOverride === preset.id;
              return (
                <button
                  key={preset.id}
                  id={`atmosphere-preset-${preset.id}`}
                  type="button"
                  onClick={() => setAtmosphereOverride(preset.id)}
                  className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? (currentTheme.isDarkTheme
                          ? 'bg-sky-500 text-white shadow-xs'
                          : 'bg-stone-900 text-white shadow-xs')
                      : (currentTheme.isDarkTheme
                          ? 'bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10'
                          : 'bg-white/70 hover:bg-white text-stone-800 border border-stone-300')
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          {/* City Search and Quick Picks */}
          <SearchBar
            onSelectCity={handleCitySelect}
            onUseCurrentLocation={handleUseCurrentLocation}
            isLocating={isLocating}
            currentCityName={selectedCity.name}
            isDark={currentTheme.isDarkTheme}
          />

          {/* Error Notification Banner */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                id="error-notification-banner"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="p-4 bg-red-50/95 backdrop-blur-sm border border-red-200 rounded-xl flex items-start justify-between gap-3 text-red-800 text-sm shadow-sm"
              >
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold">Weather Telemetry Issue:</strong>{' '}
                    <span>{errorMessage}</span>
                  </div>
                </div>
                <button
                  id="error-retry-btn"
                  type="button"
                  onClick={handleRefresh}
                  className="inline-flex items-center gap-1 font-semibold text-xs text-red-700 hover:text-red-900 bg-red-100/80 hover:bg-red-200 px-2.5 py-1 rounded-md transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  Retry
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* National Weather Service & Extreme Weather Alerts Banner */}
          <WeatherAlertsBanner
            alerts={displayedAlerts}
            cityName={selectedCity.name}
            isDark={currentTheme.isDarkTheme}
            onSelectSimulatedAlert={(alert) => setSimulatedAlert(alert)}
            activeSimulatedKey={activeSimulatedKey}
          />

          {/* Weather Content Area with smooth Framer Motion layout transitions */}
          <AnimatePresence mode="wait">
            {isLoadingWeather && !weatherData ? (
              <motion.div
                key="initial-loading-spinner"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className={`py-24 flex flex-col items-center justify-center space-y-3 ${currentTheme.isDarkTheme ? 'text-slate-300' : 'text-stone-500'}`}
              >
                <Loader2 className={`w-8 h-8 animate-spin ${currentTheme.isDarkTheme ? 'text-sky-400' : 'text-stone-900'}`} />
                <p className="text-sm font-medium">Fetching meteorological telemetry for {selectedCity.name}...</p>
              </motion.div>
            ) : weatherData ? (
              <motion.div
                key={`${weatherData.city.name}_${weatherData.city.latitude}_${weatherData.city.longitude}_${weatherData.fetchedAt}`}
                variants={dashboardContainerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                {/* Subtle city telemetry update indicator banner */}
                <AnimatePresence>
                  {isLoadingWeather && (
                    <motion.div
                      key="telemetry-updating-pill"
                      initial={{ opacity: 0, height: 0, y: -6 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className={`flex items-center justify-center gap-2 py-1.5 px-4 text-xs font-medium rounded-xl border backdrop-blur-md shadow-xs ${
                        currentTheme.isDarkTheme ? 'bg-sky-950/70 border-sky-800/80 text-sky-300' : 'bg-sky-50/90 border-sky-200 text-sky-800'
                      }`}>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-500" />
                        <span>Updating telemetry for {selectedCity.name}...</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Current Weather Hero Card with City Atmosphere Frame */}
                <motion.div variants={dashboardItemVariants} layout="position">
                  <CurrentWeatherCard
                    data={weatherData}
                    temperatureUnit={temperatureUnit}
                    windUnit={windUnit}
                    isDark={currentTheme.isDarkTheme}
                    themeCategory={currentTheme.category}
                  />
                </motion.div>

                {/* Today's Outlook: Interactive Hourly Chart & Strip */}
                <motion.div variants={dashboardItemVariants} layout="position" id="hourly-forecast-section" className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <span className={`text-xs font-bold uppercase tracking-wider ${currentTheme.isDarkTheme ? 'text-slate-300' : 'text-stone-600'}`}>
                      Today's Outlook
                    </span>

                    <div
                      id="hourly-view-mode-toggle"
                      className={`inline-flex rounded-lg p-0.5 border text-xs font-medium backdrop-blur-sm ${
                        currentTheme.isDarkTheme
                          ? 'bg-slate-900/80 border-slate-700'
                          : 'bg-white/80 border-stone-200'
                      }`}
                    >
                      <button
                        id="hourly-view-both-btn"
                        type="button"
                        onClick={() => setHourlyDisplayMode('both')}
                        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                          hourlyDisplayMode === 'both'
                            ? currentTheme.isDarkTheme
                              ? 'bg-sky-500 text-white font-semibold shadow-xs'
                              : 'bg-stone-900 text-white font-semibold shadow-xs'
                            : currentTheme.isDarkTheme
                            ? 'text-slate-300 hover:text-white'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        Chart + Cards
                      </button>
                      <button
                        id="hourly-view-chart-btn"
                        type="button"
                        onClick={() => setHourlyDisplayMode('chart')}
                        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                          hourlyDisplayMode === 'chart'
                            ? currentTheme.isDarkTheme
                              ? 'bg-sky-500 text-white font-semibold shadow-xs'
                              : 'bg-stone-900 text-white font-semibold shadow-xs'
                            : currentTheme.isDarkTheme
                            ? 'text-slate-300 hover:text-white'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        Chart Only
                      </button>
                      <button
                        id="hourly-view-strip-btn"
                        type="button"
                        onClick={() => setHourlyDisplayMode('strip')}
                        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                          hourlyDisplayMode === 'strip'
                            ? currentTheme.isDarkTheme
                              ? 'bg-sky-500 text-white font-semibold shadow-xs'
                              : 'bg-stone-900 text-white font-semibold shadow-xs'
                            : currentTheme.isDarkTheme
                            ? 'text-slate-300 hover:text-white'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        Cards Only
                      </button>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={hourlyDisplayMode}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                      className="space-y-3"
                    >
                      {(hourlyDisplayMode === 'both' || hourlyDisplayMode === 'chart') && (
                        <HourlyForecastChart
                          hourly={weatherData.hourly}
                          temperatureUnit={temperatureUnit}
                          isDark={currentTheme.isDarkTheme}
                        />
                      )}

                      {(hourlyDisplayMode === 'both' || hourlyDisplayMode === 'strip') && (
                        <HourlyForecastStrip
                          hourly={weatherData.hourly}
                          temperatureUnit={temperatureUnit}
                          isDark={currentTheme.isDarkTheme}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </motion.div>

                {/* Planning Recommendations (AI & Heuristics) */}
                <motion.div variants={dashboardItemVariants} layout="position">
                  <PlanningRecommendationsCard
                    recommendations={recommendations}
                    isLoadingAi={isLoadingAi}
                    onRefreshAi={() => fetchRecommendations(weatherData)}
                    isDark={currentTheme.isDarkTheme}
                  />
                </motion.div>

                {/* 7-Day Synoptic Forecast */}
                <motion.div variants={dashboardItemVariants} layout="position">
                  <SevenDayForecast
                    daily={weatherData.daily}
                    allHourly={weatherData.allHourly || weatherData.hourly}
                    temperatureUnit={temperatureUnit}
                    windUnit={windUnit}
                    isDark={currentTheme.isDarkTheme}
                  />
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer
          id="app-footer"
          className={`w-full border-t py-4 px-4 sm:px-8 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 text-center transition-colors ${
            currentTheme.isDarkTheme
              ? 'border-white/10 bg-black/40 text-slate-400'
              : 'border-stone-200/70 bg-white/75 backdrop-blur-md text-stone-600'
          }`}
        >
          <p>
            Weather Intelligence • Grounded with live data from{' '}
            <a
              href="https://open-meteo.com"
              target="_blank"
              rel="noreferrer"
              className={`font-semibold underline ${currentTheme.isDarkTheme ? 'text-sky-300 hover:text-sky-200' : 'text-stone-900 hover:text-stone-700'}`}
            >
              Open-Meteo
            </a>{' '}
            and Gemini AI
          </p>
          <p className={currentTheme.isDarkTheme ? 'text-slate-400' : 'text-stone-500'}>
            Continuous 7-day meteorological forecasts & lifestyle planning
          </p>
        </footer>
      </div>
    </div>
  );
}
