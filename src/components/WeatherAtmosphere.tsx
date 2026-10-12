import React from 'react';
import { WeatherCategory } from '../utils/weatherThemes';

interface WeatherAtmosphereProps {
  category: WeatherCategory;
  ambientOverlay: string;
}

export const WeatherAtmosphere: React.FC<WeatherAtmosphereProps> = ({ category, ambientOverlay }) => {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
      <style>{`
        @keyframes ambientRainAnim {
          0% { transform: translateY(-100px); }
          100% { transform: translateY(100px); }
        }
        @keyframes ambientFogDrift {
          0% { transform: translateX(-5%); }
          50% { transform: translateX(5%); }
          100% { transform: translateX(-5%); }
        }
      `}</style>

      {/* Dynamic atmospheric radial illumination layer */}
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{ background: ambientOverlay }}
      />

      {/* Weather condition specific visual elements */}
      {category === 'clear-day' && (
        <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none opacity-40">
          <div className="absolute top-10 right-10 w-48 h-48 rounded-full bg-amber-300 blur-3xl animate-pulse" />
          <div className="absolute top-4 right-4 w-72 h-72 rounded-full bg-yellow-200 blur-2xl opacity-60" />
        </div>
      )}

      {category === 'clear-night' && (
        <div className="absolute inset-0 opacity-60">
          {/* Subtle twinkling stars */}
          <div className="absolute top-[8%] left-[15%] w-1 h-1 bg-white rounded-full animate-ping opacity-75" />
          <div className="absolute top-[14%] left-[75%] w-1.5 h-1.5 bg-blue-200 rounded-full animate-pulse" />
          <div className="absolute top-[22%] left-[45%] w-1 h-1 bg-white rounded-full opacity-60" />
          <div className="absolute top-[35%] left-[85%] w-1 h-1 bg-slate-200 rounded-full animate-ping opacity-50" />
          <div className="absolute top-[48%] left-[20%] w-1 h-1 bg-white rounded-full opacity-40" />
          <div className="absolute top-[60%] left-[68%] w-1.5 h-1.5 bg-indigo-200 rounded-full animate-pulse" />
          <div className="absolute top-[75%] left-[30%] w-1 h-1 bg-white rounded-full opacity-70" />
          <div className="absolute top-[85%] left-[90%] w-1 h-1 bg-white rounded-full opacity-50" />
          {/* Subtle lunar glow */}
          <div className="absolute top-8 right-16 w-32 h-32 rounded-full bg-indigo-400/20 blur-2xl" />
        </div>
      )}

      {category === 'rain' && (
        <div className="absolute inset-0 opacity-30 overflow-hidden">
          {/* Animated Rain streaks */}
          <svg
            className="w-full h-[120%]"
            xmlns="http://www.w3.org/2000/svg"
            style={{ animation: 'ambientRainAnim 1s linear infinite' }}
          >
            <defs>
              <pattern id="rain-pattern" width="60" height="120" patternUnits="userSpaceOnUse">
                <line x1="10" y1="0" x2="5" y2="45" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
                <line x1="35" y1="40" x2="30" y2="85" stroke="#38bdf8" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
                <line x1="55" y1="15" x2="50" y2="60" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#rain-pattern)" />
          </svg>
        </div>
      )}

      {category === 'thunderstorm' && (
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-indigo-900/15 animate-pulse" />
          <svg
            className="w-full h-[120%] opacity-40"
            xmlns="http://www.w3.org/2000/svg"
            style={{ animation: 'ambientRainAnim 0.7s linear infinite' }}
          >
            <defs>
              <pattern id="storm-rain-pattern" width="50" height="100" patternUnits="userSpaceOnUse">
                <line x1="15" y1="0" x2="8" y2="50" stroke="#93c5fd" strokeWidth="1.6" strokeLinecap="round" opacity="0.8" />
                <line x1="40" y1="30" x2="33" y2="80" stroke="#60a5fa" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#storm-rain-pattern)" />
          </svg>
          <div className="absolute top-12 left-1/4 w-80 h-80 rounded-full bg-indigo-600/15 blur-3xl" />
        </div>
      )}

      {category === 'snow' && (
        <div className="absolute inset-0 opacity-40 overflow-hidden">
          {/* Falling snowflakes pattern */}
          <div className="absolute top-[10%] left-[20%] w-2 h-2 bg-white rounded-full blur-[0.5px] opacity-80 animate-bounce" />
          <div className="absolute top-[25%] left-[60%] w-3 h-3 bg-sky-100 rounded-full blur-[1px] opacity-70" />
          <div className="absolute top-[40%] left-[80%] w-1.5 h-1.5 bg-white rounded-full opacity-90" />
          <div className="absolute top-[55%] left-[35%] w-2.5 h-2.5 bg-indigo-100 rounded-full blur-[0.5px] opacity-75" />
          <div className="absolute top-[70%] left-[75%] w-2 h-2 bg-white rounded-full opacity-85" />
          <div className="absolute top-[85%] left-[15%] w-3 h-3 bg-sky-50 rounded-full blur-[1px] opacity-80" />
        </div>
      )}

      {category === 'fog' && (
        <div className="absolute inset-0 opacity-50 overflow-hidden">
          <div
            className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-stone-300/40 via-stone-200/20 to-transparent blur-xl"
            style={{ animation: 'ambientFogDrift 18s ease-in-out infinite' }}
          />
        </div>
      )}

      {(category === 'cloudy-day' || category === 'cloudy-night') && (
        <div className="absolute top-0 inset-x-0 h-80 opacity-40">
          <div className="absolute -top-10 left-10 w-96 h-48 bg-slate-300/30 rounded-full blur-3xl" />
          <div className="absolute top-10 right-20 w-80 h-40 bg-stone-300/30 rounded-full blur-2xl" />
        </div>
      )}
    </div>
  );
};
