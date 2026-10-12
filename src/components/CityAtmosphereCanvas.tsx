import React, { useEffect, useState, useMemo } from 'react';
import { WeatherCategory } from '../utils/weatherThemes';

interface CityAtmosphereCanvasProps {
  category: WeatherCategory;
  isDay: boolean;
  isDark?: boolean;
  className?: string;
}

// Generate stable deterministic or randomized particles
interface Star {
  id: number;
  top: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
}

interface RainDrop {
  id: number;
  left: number;
  delay: number;
  duration: number;
  height: number;
  opacity: number;
}

interface Snowflake {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  swayDuration: number;
  opacity: number;
}

interface Splash {
  id: number;
  left: number;
  delay: number;
  duration: number;
}

export const CityAtmosphereCanvas: React.FC<CityAtmosphereCanvasProps> = ({
  category,
  isDay,
  isDark = false,
  className = '',
}) => {
  // Lightning strike state for thunderstorm
  const [lightningActive, setLightningActive] = useState(false);
  const [lightningBranch, setLightningBranch] = useState<number>(0);

  // Periodic randomized lightning flash generator
  useEffect(() => {
    if (category !== 'thunderstorm') {
      setLightningActive(false);
      return;
    }

    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const triggerStrike = () => {
      if (!isMounted) return;
      setLightningBranch(Math.floor(Math.random() * 3));
      setLightningActive(true);

      // Flash sequence: quick flash, brief pause, secondary flash
      setTimeout(() => {
        if (!isMounted) return;
        setLightningActive(false);

        setTimeout(() => {
          if (!isMounted) return;
          setLightningActive(true);

          setTimeout(() => {
            if (!isMounted) return;
            setLightningActive(false);

            // Schedule next strike between 3.5s and 7s
            const nextDelay = 3500 + Math.random() * 3500;
            timeoutId = setTimeout(triggerStrike, nextDelay);
          }, 140);
        }, 80);
      }, 120);
    };

    // First strike after 1.5s
    timeoutId = setTimeout(triggerStrike, 1500);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [category]);

  // Pre-generate stars for clear night
  const stars: Star[] = useMemo(() => {
    return Array.from({ length: 38 }, (_, i) => ({
      id: i,
      top: (i * 17) % 85 + 5,
      left: (i * 23) % 94 + 3,
      size: i % 7 === 0 ? 3 : i % 3 === 0 ? 2 : 1.5,
      delay: (i * 0.4) % 3,
      duration: 1.8 + ((i * 0.3) % 2.5),
      opacity: 0.4 + ((i * 0.1) % 0.6),
    }));
  }, []);

  // Pre-generate raindrops
  const raindrops: RainDrop[] = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: (i * 2.05) % 100,
      delay: ((i * 0.08) % 1.2),
      duration: 0.65 + ((i * 0.04) % 0.45),
      height: 14 + ((i * 3) % 18),
      opacity: 0.4 + ((i * 0.08) % 0.5),
    }));
  }, []);

  // Pre-generate splashes for rain
  const splashes: Splash[] = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => ({
      id: i,
      left: 6 + (i * 6.8) % 88,
      delay: (i * 0.25) % 1.5,
      duration: 0.8 + ((i * 0.1) % 0.5),
    }));
  }, []);

  // Pre-generate snowflakes
  const snowflakes: Snowflake[] = useMemo(() => {
    return Array.from({ length: 36 }, (_, i) => ({
      id: i,
      left: (i * 2.8) % 98,
      delay: (i * 0.18) % 4,
      duration: 3.5 + ((i * 0.3) % 3),
      size: i % 5 === 0 ? 5 : i % 2 === 0 ? 3.5 : 2,
      swayDuration: 2 + ((i * 0.2) % 2),
      opacity: 0.5 + ((i * 0.1) % 0.5),
    }));
  }, []);

  // Pre-generate sun motes
  const sunMotes = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: 55 + ((i * 7.5) % 40),
      top: 10 + ((i * 6) % 50),
      size: 2 + (i % 3),
      delay: (i * 0.5) % 3,
      duration: 2.5 + ((i * 0.4) % 2.5),
    }));
  }, []);

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none rounded-2xl ${className}`}
      aria-hidden="true"
    >
      <style>{`
        @keyframes citySunRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes citySunPulse {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(1.08); opacity: 1; }
        }
        @keyframes cityStarTwinkle {
          0%, 100% { opacity: 0.25; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes cityShootingStar {
          0% { transform: translateX(0) translateY(0) rotate(-35deg); opacity: 0; width: 0; }
          10% { opacity: 1; width: 90px; }
          30% { transform: translateX(260px) translateY(180px) rotate(-35deg); opacity: 0; width: 0; }
          100% { transform: translateX(260px) translateY(180px) rotate(-35deg); opacity: 0; width: 0; }
        }
        @keyframes cityRainFall {
          0% { transform: translateY(-40px) translateX(0); opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translateY(220px) translateX(-25px); opacity: 0; }
        }
        @keyframes cityRainSplash {
          0% { transform: scale(0.1); opacity: 0.9; }
          70% { transform: scale(1.4); opacity: 0.3; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes citySnowFall {
          0% { transform: translateY(-20px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(220px); opacity: 0; }
        }
        @keyframes citySnowSway {
          0%, 100% { transform: translateX(-12px); }
          50% { transform: translateX(12px); }
        }
        @keyframes cityFogDrift1 {
          0% { transform: translateX(-12%); }
          50% { transform: translateX(12%); }
          100% { transform: translateX(-12%); }
        }
        @keyframes cityFogDrift2 {
          0% { transform: translateX(15%); }
          50% { transform: translateX(-15%); }
          100% { transform: translateX(15%); }
        }
        @keyframes cityCloudDrift {
          0% { transform: translateX(-8%); }
          50% { transform: translateX(8%); }
          100% { transform: translateX(-8%); }
        }
        @keyframes cityMoteFloat {
          0% { transform: translateY(0) scale(0.8); opacity: 0.3; }
          50% { transform: translateY(-25px) scale(1.2); opacity: 0.9; }
          100% { transform: translateY(-50px) scale(0.8); opacity: 0; }
        }
      `}</style>

      {/* ========================================================
          1. CLEAR DAY / SUN
          ======================================================== */}
      {category === 'clear-day' && (
        <div className="absolute inset-0">
          {/* Sunny atmospheric golden-blue horizon wash */}
          <div className="absolute inset-0 bg-gradient-to-br from-sky-400/20 via-amber-200/25 to-sky-100/10 dark:from-sky-900/30 dark:via-amber-500/15 dark:to-slate-900/30" />

          {/* Sun Container situated at the upper right */}
          <div className="absolute top-2 right-4 sm:right-10 w-44 h-44 pointer-events-none">
            {/* Outer golden corona glow */}
            <div
              className="absolute inset-2 rounded-full bg-gradient-to-r from-amber-300/35 to-yellow-400/35 blur-2xl"
              style={{ animation: 'citySunPulse 4s ease-in-out infinite' }}
            />

            {/* Rotating Radiant Sun Rays */}
            <svg
              className="absolute inset-0 w-full h-full text-amber-400/40 dark:text-amber-300/30"
              viewBox="0 0 100 100"
              style={{ animation: 'citySunRotate 45s linear infinite' }}
            >
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
                <g key={angle} transform={`rotate(${angle} 50 50)`}>
                  <line
                    x1="50"
                    y1="16"
                    x2="50"
                    y2="6"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <line
                    x1="50"
                    y1="22"
                    x2="50"
                    y2="18"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    opacity="0.6"
                  />
                </g>
              ))}
            </svg>

            {/* Core Radiant Sun Disc */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-yellow-200 via-amber-300 to-amber-500 shadow-[0_0_35px_rgba(251,191,36,0.65)] flex items-center justify-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-yellow-100/80 blur-xs" />
            </div>
          </div>

          {/* Floating Warm Golden Sun Motes */}
          {sunMotes.map((mote) => (
            <div
              key={mote.id}
              className="absolute rounded-full bg-amber-300/80 dark:bg-yellow-200/70 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
              style={{
                top: `${mote.top}%`,
                left: `${mote.left}%`,
                width: `${mote.size}px`,
                height: `${mote.size}px`,
                animation: `cityMoteFloat ${mote.duration}s ease-in-out infinite`,
                animationDelay: `${mote.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* ========================================================
          2. CLEAR NIGHT / MOON & STARS
          ======================================================== */}
      {category === 'clear-night' && (
        <div className="absolute inset-0">
          {/* Deep celestial night gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-slate-900/50 to-blue-950/40" />

          {/* Twinkling Constellation Stars */}
          {stars.map((star) => (
            <div
              key={star.id}
              className="absolute rounded-full bg-white shadow-[0_0_4px_rgba(255,255,255,0.9)]"
              style={{
                top: `${star.top}%`,
                left: `${star.left}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animation: `cityStarTwinkle ${star.duration}s ease-in-out infinite`,
                animationDelay: `${star.delay}s`,
              }}
            />
          ))}

          {/* Occasional Shooting Star Streak */}
          <div
            className="absolute top-4 left-10 h-0.5 bg-gradient-to-r from-transparent via-sky-200 to-white shadow-[0_0_8px_rgba(186,230,253,0.9)] pointer-events-none rounded-full"
            style={{
              animation: 'cityShootingStar 11s cubic-bezier(0.25, 1, 0.5, 1) infinite',
              animationDelay: '3s',
            }}
          />

          {/* Luminous Celestial Moon */}
          <div className="absolute top-3 right-6 sm:right-12 w-36 h-36 pointer-events-none">
            {/* Lunar atmospheric glow halo */}
            <div className="absolute inset-2 rounded-full bg-indigo-300/20 blur-xl animate-pulse" />

            {/* Moon Crescent / Luminous Disc */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-slate-100 via-sky-100 to-indigo-200 shadow-[0_0_28px_rgba(199,210,254,0.6)] relative overflow-hidden">
              {/* Moon craters / textures */}
              <div className="absolute top-2 left-3 w-3.5 h-3.5 rounded-full bg-slate-300/40 blur-[0.5px]" />
              <div className="absolute top-6 left-7 w-4.5 h-4.5 rounded-full bg-slate-300/35 blur-[0.5px]" />
              <div className="absolute top-8 left-2.5 w-3 h-3 rounded-full bg-slate-300/30 blur-[0.5px]" />
              <div className="absolute top-3.5 left-8 w-2 h-2 rounded-full bg-slate-300/25 blur-[0.5px]" />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          3. RAIN / DRIZZLE / SHOWERS
          ======================================================== */}
      {category === 'rain' && (
        <div className="absolute inset-0">
          {/* Overcast rain wash */}
          <div className="absolute inset-0 bg-gradient-to-b from-sky-950/20 via-blue-900/15 to-sky-900/25" />

          {/* Top storm cloud bank */}
          <div className="absolute -top-10 inset-x-0 h-28 bg-gradient-to-b from-slate-800/30 via-slate-700/20 to-transparent blur-md" />

          {/* Dynamic falling raindrops */}
          <div className="absolute inset-0 overflow-hidden">
            {raindrops.map((drop) => (
              <div
                key={drop.id}
                className="absolute w-[1.5px] bg-gradient-to-b from-transparent via-sky-300 to-sky-200 rounded-full"
                style={{
                  left: `${drop.left}%`,
                  height: `${drop.height}px`,
                  opacity: drop.opacity,
                  animation: `cityRainFall ${drop.duration}s linear infinite`,
                  animationDelay: `${drop.delay}s`,
                }}
              />
            ))}
          </div>

          {/* Water splash ripples along bottom horizon */}
          <div className="absolute bottom-2 inset-x-0 h-5 overflow-hidden">
            {splashes.map((splash) => (
              <div
                key={splash.id}
                className="absolute bottom-0 w-3 h-1.5 rounded-[50%] border border-sky-300/70"
                style={{
                  left: `${splash.left}%`,
                  animation: `cityRainSplash ${splash.duration}s ease-out infinite`,
                  animationDelay: `${splash.delay}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          4. THUNDERSTORM / LIGHTNING
          ======================================================== */}
      {category === 'thunderstorm' && (
        <div className="absolute inset-0">
          {/* Dark moody convective storm background */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-indigo-950/30 to-purple-950/35" />

          {/* Top heavy storm cumulonimbus clouds */}
          <div className="absolute -top-12 inset-x-0 h-36 bg-gradient-to-b from-slate-900/60 via-indigo-950/40 to-transparent blur-lg" />

          {/* Heavy slanted rain sheets */}
          <div className="absolute inset-0 overflow-hidden opacity-85">
            {raindrops.map((drop) => (
              <div
                key={drop.id}
                className="absolute w-[2px] bg-gradient-to-b from-transparent via-blue-200 to-indigo-200 rounded-full"
                style={{
                  left: `${drop.left}%`,
                  height: `${drop.height * 1.3}px`,
                  opacity: drop.opacity * 1.1,
                  animation: `cityRainFall ${drop.duration * 0.75}s linear infinite`,
                  animationDelay: `${drop.delay}s`,
                }}
              />
            ))}
          </div>

          {/* Full-Frame Lightning Flash Overlay */}
          <div
            className={`absolute inset-0 bg-indigo-100/40 dark:bg-sky-100/35 backdrop-blur-[0.5px] transition-opacity duration-75 pointer-events-none ${
              lightningActive ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Forked Lightning Bolt Strikes */}
          {lightningActive && (
            <svg
              className="absolute top-0 right-16 sm:right-32 w-56 h-56 text-yellow-100 filter drop-shadow-[0_0_12px_rgba(254,240,138,0.95)] z-10 pointer-events-none"
              viewBox="0 0 120 160"
            >
              {lightningBranch === 0 && (
                <path
                  d="M60 0 L48 45 L62 52 L35 105 L50 112 L20 160"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="miter"
                />
              )}
              {lightningBranch === 1 && (
                <g>
                  <path
                    d="M80 0 L65 50 L78 58 L52 110 L65 116 L40 160"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M78 58 L95 85 L88 92 L105 125"
                    fill="none"
                    stroke="#fef08a"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </g>
              )}
              {lightningBranch === 2 && (
                <g>
                  <path
                    d="M40 0 L55 42 L42 50 L68 95 L55 102 L80 160"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M55 42 L30 75 L38 82 L22 115"
                    fill="none"
                    stroke="#e0e7ff"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </g>
              )}
            </svg>
          )}

          {/* Ambient electric purple thundercloud pulse */}
          <div className="absolute top-2 right-1/4 w-48 h-32 rounded-full bg-purple-600/15 blur-3xl" />
        </div>
      )}

      {/* ========================================================
          5. SNOW / FLURRIES / BLIZZARD
          ======================================================== */}
      {category === 'snow' && (
        <div className="absolute inset-0">
          {/* Crisp winter frost wash */}
          <div className="absolute inset-0 bg-gradient-to-b from-sky-200/20 via-slate-100/15 to-indigo-100/20 dark:from-slate-900/40 dark:via-sky-950/30 dark:to-slate-900/40" />

          {/* Falling and swaying snowflakes */}
          <div className="absolute inset-0 overflow-hidden">
            {snowflakes.map((flake) => (
              <div
                key={flake.id}
                className="absolute"
                style={{
                  left: `${flake.left}%`,
                  animation: `citySnowFall ${flake.duration}s linear infinite`,
                  animationDelay: `${flake.delay}s`,
                }}
              >
                <div
                  className="rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.9)]"
                  style={{
                    width: `${flake.size}px`,
                    height: `${flake.size}px`,
                    opacity: flake.opacity,
                    animation: `citySnowSway ${flake.swayDuration}s ease-in-out infinite`,
                  }}
                />
              </div>
            ))}
          </div>

          {/* Frost glint on bottom border */}
          <div className="absolute bottom-0 inset-x-0 h-4 bg-gradient-to-t from-white/25 dark:from-white/10 to-transparent blur-[1px]" />
        </div>
      )}

      {/* ========================================================
          6. FOG / MIST / HAZE
          ======================================================== */}
      {category === 'fog' && (
        <div className="absolute inset-0">
          {/* Shrouded muted background */}
          <div className="absolute inset-0 bg-gradient-to-b from-stone-300/30 via-slate-200/25 to-stone-400/20 dark:from-slate-800/45 dark:via-stone-900/40 dark:to-slate-800/45" />

          {/* Layer 1: Drifting Upper Mist Bank */}
          <div
            className="absolute top-2 -inset-x-12 h-32 bg-gradient-to-r from-stone-300/40 via-white/50 to-stone-300/40 dark:from-slate-700/35 dark:via-slate-600/45 dark:to-slate-700/35 blur-2xl rounded-full"
            style={{ animation: 'cityFogDrift1 22s ease-in-out infinite' }}
          />

          {/* Layer 2: Drifting Mid-Level Volumetric Mist */}
          <div
            className="absolute top-12 -inset-x-16 h-28 bg-gradient-to-r from-slate-200/35 via-stone-100/45 to-slate-200/35 dark:from-slate-800/40 dark:via-stone-700/40 dark:to-slate-800/40 blur-xl rounded-full"
            style={{ animation: 'cityFogDrift2 17s ease-in-out infinite' }}
          />

          {/* Layer 3: Low Ground Vapor Sheet */}
          <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-stone-300/45 via-white/30 to-transparent dark:from-slate-800/50 dark:via-slate-900/30 dark:to-transparent blur-lg" />
        </div>
      )}

      {/* ========================================================
          7. CLOUDY / OVERCAST (DAY & NIGHT)
          ======================================================== */}
      {(category === 'cloudy-day' || category === 'cloudy-night') && (
        <div className="absolute inset-0">
          {/* Subtle sky background */}
          <div className={`absolute inset-0 ${
            category === 'cloudy-day'
              ? 'bg-gradient-to-b from-sky-200/25 via-slate-200/20 to-stone-200/25 dark:from-slate-800/35 dark:via-slate-900/40 dark:to-slate-800/35'
              : 'bg-gradient-to-b from-indigo-950/35 via-slate-900/40 to-slate-950/40'
          }`} />

          {/* Soft sunlight or moonlight filtered through clouds */}
          {category === 'cloudy-day' ? (
            <div className="absolute top-4 right-14 w-28 h-28 rounded-full bg-amber-200/30 blur-2xl" />
          ) : (
            <div className="absolute top-4 right-14 w-24 h-24 rounded-full bg-indigo-300/25 blur-xl" />
          )}

          {/* Layered Drifting Cloud Formations */}
          <div
            className="absolute -top-6 -left-8 w-96 h-40 bg-slate-300/40 dark:bg-slate-700/35 rounded-full blur-2xl"
            style={{ animation: 'cityCloudDrift 28s ease-in-out infinite' }}
          />
          <div
            className="absolute top-6 right-0 w-80 h-36 bg-stone-300/35 dark:bg-slate-800/40 rounded-full blur-2xl"
            style={{ animation: 'cityCloudDrift 22s ease-in-out infinite', animationDirection: 'reverse' }}
          />
        </div>
      )}
    </div>
  );
};
