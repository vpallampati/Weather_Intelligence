export type WeatherCategory =
  | 'clear-day'
  | 'clear-night'
  | 'cloudy-day'
  | 'cloudy-night'
  | 'rain'
  | 'thunderstorm'
  | 'snow'
  | 'fog';

export interface WeatherThemeConfig {
  category: WeatherCategory;
  name: string;
  icon: string;
  // Gradient for background
  gradientClass: string;
  // Subtle radial illumination overlay
  ambientOverlay: string;
  // Card styles
  isDarkTheme: boolean;
  cardClass: string;
  subCardClass: string;
  borderClass: string;
  textPrimaryClass: string;
  textSecondaryClass: string;
  badgeClass: string;
}

export function getWeatherThemeConfig(weatherCode: number, isDay: boolean): WeatherThemeConfig {
  // Thunderstorm
  if (weatherCode >= 95) {
    return {
      category: 'thunderstorm',
      name: 'Electric Thunderstorm',
      icon: 'CloudLightning',
      gradientClass: 'from-slate-950 via-indigo-950 to-slate-900',
      ambientOverlay: 'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(99, 102, 241, 0.3), transparent 70%), radial-gradient(circle at 80% 30%, rgba(56, 189, 248, 0.15), transparent 50%)',
      isDarkTheme: true,
      cardClass: 'bg-slate-900/80 backdrop-blur-md border-slate-700/80 text-white shadow-lg',
      subCardClass: 'bg-slate-800/80 border-slate-700/70 text-slate-100',
      borderClass: 'border-slate-700',
      textPrimaryClass: 'text-white',
      textSecondaryClass: 'text-slate-300',
      badgeClass: 'bg-indigo-950/90 text-indigo-300 border-indigo-700',
    };
  }

  // Snow
  if (
    (weatherCode >= 71 && weatherCode <= 77) ||
    weatherCode === 85 ||
    weatherCode === 86 ||
    weatherCode === 56 ||
    weatherCode === 66 ||
    weatherCode === 67
  ) {
    if (isDay) {
      return {
        category: 'snow',
        name: 'Crisp Snowfall',
        icon: 'CloudSnow',
        gradientClass: 'from-sky-200 via-indigo-50/80 to-slate-100',
        ambientOverlay: 'radial-gradient(ellipse 80% 50% at 50% -5%, rgba(224, 242, 254, 0.9), transparent 70%), radial-gradient(circle at 10% 40%, rgba(241, 245, 249, 0.8), transparent 60%)',
        isDarkTheme: false,
        cardClass: 'bg-white/85 backdrop-blur-md border-sky-100 text-stone-900 shadow-sm',
        subCardClass: 'bg-sky-50/70 border-sky-100 text-stone-800',
        borderClass: 'border-sky-200',
        textPrimaryClass: 'text-stone-900',
        textSecondaryClass: 'text-stone-600',
        badgeClass: 'bg-sky-50 text-sky-800 border-sky-200',
      };
    } else {
      return {
        category: 'snow',
        name: 'Winter Night',
        icon: 'CloudSnow',
        gradientClass: 'from-slate-950 via-slate-900 to-indigo-950',
        ambientOverlay: 'radial-gradient(ellipse 70% 50% at 50% -10%, rgba(148, 163, 184, 0.2), transparent 70%)',
        isDarkTheme: true,
        cardClass: 'bg-slate-900/80 backdrop-blur-md border-slate-800 text-white shadow-lg',
        subCardClass: 'bg-slate-800/80 border-slate-700/70 text-slate-100',
        borderClass: 'border-slate-800',
        textPrimaryClass: 'text-white',
        textSecondaryClass: 'text-slate-300',
        badgeClass: 'bg-slate-800 text-slate-200 border-slate-700',
      };
    }
  }

  // Rain / Drizzle / Showers
  if ((weatherCode >= 51 && weatherCode <= 65) || (weatherCode >= 80 && weatherCode <= 82)) {
    if (isDay) {
      return {
        category: 'rain',
        name: 'Rainy Atmosphere',
        icon: 'CloudRain',
        gradientClass: 'from-slate-300 via-sky-200 to-slate-200',
        ambientOverlay: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(147, 197, 253, 0.4), transparent 70%), radial-gradient(circle at 90% 20%, rgba(148, 163, 184, 0.4), transparent 60%)',
        isDarkTheme: false,
        cardClass: 'bg-white/85 backdrop-blur-md border-sky-100 text-stone-900 shadow-sm',
        subCardClass: 'bg-sky-50/60 border-sky-100 text-stone-800',
        borderClass: 'border-sky-200',
        textPrimaryClass: 'text-stone-900',
        textSecondaryClass: 'text-stone-600',
        badgeClass: 'bg-sky-100 text-sky-900 border-sky-300',
      };
    } else {
      return {
        category: 'rain',
        name: 'Rainy Night',
        icon: 'CloudRain',
        gradientClass: 'from-slate-950 via-slate-900 to-sky-950',
        ambientOverlay: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(14, 116, 144, 0.25), transparent 70%)',
        isDarkTheme: true,
        cardClass: 'bg-slate-900/80 backdrop-blur-md border-slate-800 text-white shadow-lg',
        subCardClass: 'bg-slate-800/80 border-slate-700 text-slate-100',
        borderClass: 'border-slate-800',
        textPrimaryClass: 'text-white',
        textSecondaryClass: 'text-slate-300',
        badgeClass: 'bg-sky-950 text-sky-300 border-sky-800',
      };
    }
  }

  // Fog / Mist
  if (weatherCode === 45 || weatherCode === 48) {
    return {
      category: 'fog',
      name: 'Misty & Foggy',
      icon: 'CloudFog',
      gradientClass: 'from-stone-300 via-slate-200 to-stone-100',
      ambientOverlay: 'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(214, 211, 209, 0.8), transparent 70%)',
      isDarkTheme: false,
      cardClass: 'bg-white/85 backdrop-blur-md border-stone-200 text-stone-900 shadow-sm',
      subCardClass: 'bg-stone-50/70 border-stone-200 text-stone-800',
      borderClass: 'border-stone-200',
      textPrimaryClass: 'text-stone-900',
      textSecondaryClass: 'text-stone-600',
      badgeClass: 'bg-stone-100 text-stone-800 border-stone-300',
    };
  }

  // Cloudy / Overcast
  if (weatherCode === 2 || weatherCode === 3) {
    if (isDay) {
      return {
        category: 'cloudy-day',
        name: 'Overcast Skies',
        icon: 'Cloud',
        gradientClass: 'from-sky-100 via-slate-200 to-stone-100',
        ambientOverlay: 'radial-gradient(ellipse 90% 55% at 50% -5%, rgba(203, 213, 225, 0.7), transparent 70%)',
        isDarkTheme: false,
        cardClass: 'bg-white/85 backdrop-blur-md border-stone-200 text-stone-900 shadow-sm',
        subCardClass: 'bg-stone-50/70 border-stone-200 text-stone-800',
        borderClass: 'border-stone-200',
        textPrimaryClass: 'text-stone-900',
        textSecondaryClass: 'text-stone-600',
        badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
      };
    } else {
      return {
        category: 'cloudy-night',
        name: 'Overcast Night',
        icon: 'CloudMoon',
        gradientClass: 'from-slate-950 via-slate-900 to-stone-900',
        ambientOverlay: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(75, 85, 99, 0.3), transparent 70%)',
        isDarkTheme: true,
        cardClass: 'bg-slate-900/80 backdrop-blur-md border-slate-800 text-white shadow-lg',
        subCardClass: 'bg-slate-800/80 border-slate-700 text-slate-100',
        borderClass: 'border-slate-800',
        textPrimaryClass: 'text-white',
        textSecondaryClass: 'text-slate-300',
        badgeClass: 'bg-stone-800 text-stone-300 border-stone-700',
      };
    }
  }

  // Clear / Sunny
  if (isDay) {
    return {
      category: 'clear-day',
      name: 'Sunny & Clear Skies',
      icon: 'Sun',
      gradientClass: 'from-sky-300 via-sky-100 to-amber-50',
      ambientOverlay: 'radial-gradient(ellipse 85% 60% at 50% -10%, rgba(254, 240, 138, 0.45), transparent 70%), radial-gradient(circle at 85% 15%, rgba(253, 224, 71, 0.35), transparent 50%)',
      isDarkTheme: false,
      cardClass: 'bg-white/85 backdrop-blur-md border-amber-100/70 text-stone-900 shadow-sm',
      subCardClass: 'bg-amber-50/50 border-amber-100/60 text-stone-800',
      borderClass: 'border-amber-200/60',
      textPrimaryClass: 'text-stone-900',
      textSecondaryClass: 'text-stone-600',
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    };
  } else {
    return {
      category: 'clear-night',
      name: 'Starlit Night Sky',
      icon: 'Moon',
      gradientClass: 'from-slate-950 via-indigo-950 to-slate-900',
      ambientOverlay: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(30, 58, 138, 0.35), transparent 70%), radial-gradient(circle at 80% 20%, rgba(148, 163, 184, 0.2), transparent 45%)',
      isDarkTheme: true,
      cardClass: 'bg-slate-900/80 backdrop-blur-md border-slate-800 text-white shadow-lg',
      subCardClass: 'bg-slate-800/80 border-slate-700 text-slate-100',
      borderClass: 'border-slate-800',
      textPrimaryClass: 'text-white',
      textSecondaryClass: 'text-slate-300',
      badgeClass: 'bg-indigo-950 text-indigo-300 border-indigo-800',
    };
  }
}

export function getThemeByCategory(category: WeatherCategory): WeatherThemeConfig {
  switch (category) {
    case 'clear-day':
      return getWeatherThemeConfig(0, true);
    case 'clear-night':
      return getWeatherThemeConfig(0, false);
    case 'cloudy-day':
      return getWeatherThemeConfig(3, true);
    case 'cloudy-night':
      return getWeatherThemeConfig(3, false);
    case 'rain':
      return getWeatherThemeConfig(63, true);
    case 'thunderstorm':
      return getWeatherThemeConfig(95, false);
    case 'snow':
      return getWeatherThemeConfig(71, true);
    case 'fog':
      return getWeatherThemeConfig(45, true);
    default:
      return getWeatherThemeConfig(0, true);
  }
}
