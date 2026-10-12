import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Clock,
  MapPin,
  Flame,
  CloudLightning,
  Waves,
  Snowflake,
  ExternalLink,
  Volume2,
  VolumeX,
  Sparkles,
  X,
} from 'lucide-react';
import { WeatherAlert, AlertSeverity } from '../types';
import {
  SIMULATED_NWS_ALERTS,
  getSeverityBadgeStyles,
} from '../utils/alertDetection';

interface WeatherAlertsBannerProps {
  alerts: WeatherAlert[];
  cityName: string;
  isDark?: boolean;
  onSelectSimulatedAlert?: (alert: WeatherAlert | null) => void;
  activeSimulatedKey?: string | null;
}

export const WeatherAlertsBanner: React.FC<WeatherAlertsBannerProps> = ({
  alerts,
  cityName,
  isDark = false,
  onSelectSimulatedAlert,
  activeSimulatedKey,
}) => {
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(
    alerts.length > 0 ? alerts[0].id : null
  );
  const [activeAlertIndex, setActiveAlertIndex] = useState(0);
  const [showSimMenu, setShowSimMenu] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const hasAlerts = alerts.length > 0;
  const currentAlert = hasAlerts
    ? alerts[Math.min(activeAlertIndex, alerts.length - 1)]
    : null;

  const toggleExpand = (id: string) => {
    setExpandedAlertId((prev) => (prev === id ? null : id));
  };

  const playAlertChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.3); // A4
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch {
      // Audio context might be restricted before interaction
    }
  };

  const handleSimPreset = (key: string) => {
    if (onSelectSimulatedAlert) {
      if (activeSimulatedKey === key) {
        onSelectSimulatedAlert(null);
      } else {
        const preset = SIMULATED_NWS_ALERTS[key];
        if (preset) {
          onSelectSimulatedAlert(preset);
          playAlertChime();
        }
      }
    }
    setShowSimMenu(false);
  };

  // Severity styles for the active alert
  const severityStyles = currentAlert
    ? getSeverityBadgeStyles(currentAlert.severity, isDark)
    : null;

  return (
    <div id="weather-alerts-section" className="w-full space-y-3">
      {hasAlerts && currentAlert && severityStyles ? (
        <motion.div
          id="active-severe-weather-alert"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`border rounded-2xl p-4 sm:p-5 transition-all shadow-md backdrop-blur-md relative overflow-hidden ${severityStyles.containerBg}`}
        >
          {/* Pulsing Emergency Accent Glow */}
          <div
            className={`absolute -top-12 -right-12 w-36 h-36 rounded-full blur-2xl opacity-20 pointer-events-none ${severityStyles.pulseColor}`}
          />

          {/* Top Bar: Emergency Beacon + Source Badge + Multi-alert Carousel controls */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-black/10 dark:border-white/10">
            <div className="flex items-center gap-2.5">
              {/* Pulsing Siren/Beacon dot */}
              <span className="relative flex h-3 w-3">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${severityStyles.pulseColor}`}
                />
                <span
                  className={`relative inline-flex rounded-full h-3 w-3 ${severityStyles.pulseColor}`}
                />
              </span>

              <span
                className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${severityStyles.badgeBg}`}
              >
                {currentAlert.severity} ALERT
              </span>

              <span className="text-xs font-semibold opacity-90">
                {currentAlert.senderName}
              </span>

              {currentAlert.source === 'SIMULATED' && (
                <span className="text-[10px] font-bold uppercase bg-stone-900 text-amber-300 dark:bg-amber-400 dark:text-stone-950 px-2 py-0.5 rounded-sm">
                  Test Simulation
                </span>
              )}
            </div>

            {/* Controls: Audio Toggle, Multi-alert Pager & Dismiss Simulation */}
            <div className="flex items-center gap-2 text-xs">
              {/* Multi-alert navigator if more than 1 alert */}
              {alerts.length > 1 && (
                <div className="flex items-center gap-1.5 mr-2 font-medium opacity-85">
                  <span className="text-xs">
                    Alert {activeAlertIndex + 1} of {alerts.length}
                  </span>
                  <div className="flex gap-1">
                    {alerts.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveAlertIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          activeAlertIndex === idx
                            ? 'bg-current scale-125'
                            : 'bg-current opacity-30 hover:opacity-60'
                        }`}
                        aria-label={`Go to alert ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Sound alert chime toggle */}
              <button
                type="button"
                onClick={() => {
                  setSoundEnabled((p) => !p);
                  if (!soundEnabled) playAlertChime();
                }}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  soundEnabled
                    ? 'bg-amber-500 text-white border-amber-600'
                    : isDark
                    ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
                    : 'bg-white/80 hover:bg-white text-stone-700 border-stone-300'
                }`}
                title={soundEnabled ? 'Chime sound enabled' : 'Mute alert chime'}
              >
                {soundEnabled ? (
                  <Volume2 className="w-3.5 h-3.5" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Reset simulation if currently active */}
              {activeSimulatedKey && onSelectSimulatedAlert && (
                <button
                  type="button"
                  onClick={() => onSelectSimulatedAlert(null)}
                  className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-stone-900/80 hover:bg-stone-900 text-white dark:bg-white/20 dark:hover:bg-white/30 transition-colors"
                >
                  <X className="w-3 h-3" />
                  Exit Test
                </button>
              )}
            </div>
          </div>

          {/* Main Headline & Summary */}
          <div className="pt-3 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle
                    className={`w-5 h-5 shrink-0 ${severityStyles.iconColor}`}
                  />
                  <h4 className="font-extrabold text-base sm:text-lg leading-snug">
                    {currentAlert.event}
                  </h4>
                </div>
                <p className="text-sm font-medium opacity-90 pl-7">
                  {currentAlert.headline}
                </p>
              </div>

              <button
                id={`toggle-alert-details-${currentAlert.id}`}
                type="button"
                onClick={() => toggleExpand(currentAlert.id)}
                className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors shrink-0 cursor-pointer ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white'
                    : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-900'
                }`}
              >
                <span>
                  {expandedAlertId === currentAlert.id
                    ? 'Hide Details'
                    : 'Emergency Instructions'}
                </span>
                {expandedAlertId === currentAlert.id ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Quick Meta: Area and Expiration */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs opacity-80 pl-7">
              {currentAlert.areaDesc && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span>{currentAlert.areaDesc}</span>
                </div>
              )}
              {currentAlert.expires && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Expires: {new Date(currentAlert.expires).toLocaleTimeString([], {
                      weekday: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Expandable Emergency Details & Safety Protocol */}
          <AnimatePresence>
            {expandedAlertId === currentAlert.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-black/10 dark:border-white/10 space-y-3.5 text-xs overflow-hidden"
              >
                {/* Official Safety Instructions */}
                {currentAlert.instruction && (
                  <div
                    className={`p-3.5 rounded-xl border ${
                      isDark
                        ? 'bg-red-950/60 border-red-800/80 text-red-100'
                        : 'bg-red-50/90 border-red-200 text-red-950'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold mb-1.5 text-xs uppercase tracking-wide">
                      <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <span>Recommended Protective Action</span>
                    </div>
                    <p className="leading-relaxed font-medium">
                      {currentAlert.instruction}
                    </p>
                  </div>
                )}

                {/* Meteorologic Description */}
                {currentAlert.description && (
                  <div className="space-y-1">
                    <span className="font-bold opacity-75 uppercase tracking-wider text-[10px]">
                      Meteorological Narrative & Details
                    </span>
                    <p className="whitespace-pre-line leading-relaxed opacity-90 font-mono text-[11px] p-3 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 max-h-48 overflow-y-auto">
                      {currentAlert.description}
                    </p>
                  </div>
                )}

                {/* Footer disclaimer */}
                <div className="flex items-center justify-between text-[11px] opacity-75 pt-1">
                  <span>
                    Official CAP Feed grounded from National Weather Service & WMO
                  </span>
                  <a
                    href="https://www.weather.gov"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-semibold underline hover:opacity-100"
                  >
                    weather.gov
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ) : (
        /* "All Clear" State: Clean, confident status ribbon with simulated preview launcher */
        <div
          id="all-clear-weather-status"
          className={`border rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs backdrop-blur-sm transition-colors ${
            isDark
              ? 'bg-slate-900/60 border-emerald-500/30 text-slate-300'
              : 'bg-white/80 border-emerald-300/60 text-stone-700 shadow-xs'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-stone-900 dark:text-white">
                  All Clear — No Active Extreme Weather Warnings
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                  Normal Operations
                </span>
              </div>
              <p className="text-[11px] opacity-75">
                Continuous surveillance for {cityName} via National Weather Service & Open-Meteo
              </p>
            </div>
          </div>

          {/* Trigger Test Scenarios Button */}
          <div className="relative">
            <button
              id="simulate-alerts-toggle-btn"
              type="button"
              onClick={() => setShowSimMenu((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-sky-300'
                  : 'bg-stone-100 hover:bg-stone-200/80 border-stone-300 text-stone-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Simulate NWS Alert</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {/* Dropdown Menu for Simulated Alerts */}
            {showSimMenu && (
              <div
                id="simulate-alerts-dropdown"
                className={`absolute right-0 top-full mt-1.5 w-64 rounded-xl border p-1.5 shadow-xl z-30 space-y-1 text-xs backdrop-blur-md ${
                  isDark
                    ? 'bg-slate-900/95 border-slate-700 text-white'
                    : 'bg-white/95 border-stone-200 text-stone-900'
                }`}
              >
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-slate-400 border-b border-stone-200/50 dark:border-slate-800">
                  National Weather Service Scenarios
                </div>

                <button
                  type="button"
                  onClick={() => handleSimPreset('storm')}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-amber-500/10 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <CloudLightning className="w-4 h-4 text-amber-500 shrink-0" />
                  <div>
                    <span className="font-semibold block">Severe Thunderstorm</span>
                    <span className="text-[10px] opacity-75">65 mph winds + hail warning</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSimPreset('flood')}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-blue-500/10 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Waves className="w-4 h-4 text-sky-500 shrink-0" />
                  <div>
                    <span className="font-semibold block">Flash Flood Emergency</span>
                    <span className="text-[10px] opacity-75">Rapid flooding & road hazard</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSimPreset('heat')}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-red-500/10 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Flame className="w-4 h-4 text-red-500 shrink-0" />
                  <div>
                    <span className="font-semibold block">Excessive Heat Warning</span>
                    <span className="text-[10px] opacity-75">108°F (42°C) heat index danger</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSimPreset('blizzard')}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-indigo-500/10 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Snowflake className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div>
                    <span className="font-semibold block">Blizzard & Winter Storm</span>
                    <span className="text-[10px] opacity-75">8-14" snow & whiteout transit</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
