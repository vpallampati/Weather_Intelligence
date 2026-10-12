import { DailyForecastItem, PlanningRecommendations, WeatherData } from '../types';

export interface WeatherConditionInfo {
  label: string;
  description: string;
  iconName: string;
}

export function getWeatherCondition(code: number, isDay = true): WeatherConditionInfo {
  switch (code) {
    case 0:
      return {
        label: isDay ? 'Sunny' : 'Clear Sky',
        description: 'Clear, cloudless skies',
        iconName: isDay ? 'Sun' : 'Moon',
      };
    case 1:
      return {
        label: isDay ? 'Mainly Sunny' : 'Mainly Clear',
        description: 'A few passing clouds',
        iconName: isDay ? 'CloudSun' : 'CloudMoon',
      };
    case 2:
      return {
        label: 'Partly Cloudy',
        description: 'Intermittent clouds and clear patches',
        iconName: isDay ? 'CloudSun' : 'CloudMoon',
      };
    case 3:
      return {
        label: 'Overcast',
        description: 'Dense cloud cover across the sky',
        iconName: 'Cloud',
      };
    case 45:
    case 48:
      return {
        label: 'Foggy',
        description: 'Reduced visibility due to mist or fog',
        iconName: 'CloudFog',
      };
    case 51:
      return {
        label: 'Light Drizzle',
        description: 'Gentle, fine mist-like precipitation',
        iconName: 'CloudDrizzle',
      };
    case 53:
      return {
        label: 'Moderate Drizzle',
        description: 'Steady light drizzle',
        iconName: 'CloudDrizzle',
      };
    case 55:
      return {
        label: 'Dense Drizzle',
        description: 'Continuous damp drizzle',
        iconName: 'CloudDrizzle',
      };
    case 56:
    case 57:
      return {
        label: 'Freezing Drizzle',
        description: 'Sub-zero freezing moisture causing slick surfaces',
        iconName: 'CloudSnow',
      };
    case 61:
      return {
        label: 'Light Rain',
        description: 'Scattered gentle rainfall',
        iconName: 'CloudRain',
      };
    case 63:
      return {
        label: 'Moderate Rain',
        description: 'Steady rainfall',
        iconName: 'CloudRain',
      };
    case 65:
      return {
        label: 'Heavy Rain',
        description: 'Significant, torrential downpour',
        iconName: 'CloudRain',
      };
    case 66:
    case 67:
      return {
        label: 'Freezing Rain',
        description: 'Rain freezing instantly on ground contact',
        iconName: 'CloudSnow',
      };
    case 71:
      return {
        label: 'Light Snow',
        description: 'Gentle flurries of snowfall',
        iconName: 'CloudSnow',
      };
    case 73:
      return {
        label: 'Moderate Snow',
        description: 'Steady accumulation of snow',
        iconName: 'CloudSnow',
      };
    case 75:
      return {
        label: 'Heavy Snow',
        description: 'Substantial snowfall with reduced visibility',
        iconName: 'CloudSnow',
      };
    case 77:
      return {
        label: 'Snow Grains',
        description: 'Small ice grains falling gently',
        iconName: 'CloudSnow',
      };
    case 80:
      return {
        label: 'Light Showers',
        description: 'Passing brief rain showers',
        iconName: 'CloudRain',
      };
    case 81:
      return {
        label: 'Moderate Showers',
        description: 'Periods of brisk rainfall',
        iconName: 'CloudRain',
      };
    case 82:
      return {
        label: 'Violent Showers',
        description: 'Sudden, severe cloudburst showers',
        iconName: 'CloudRain',
      };
    case 85:
    case 86:
      return {
        label: 'Snow Showers',
        description: 'Gusty, intermittent snow showers',
        iconName: 'CloudSnow',
      };
    case 95:
      return {
        label: 'Thunderstorm',
        description: 'Lightning activity with brisk rain gusts',
        iconName: 'CloudLightning',
      };
    case 96:
    case 99:
      return {
        label: 'Severe Thunderstorm',
        description: 'Severe electrical storm with hail risk',
        iconName: 'CloudLightning',
      };
    default:
      return {
        label: 'Fair',
        description: 'Stable atmospheric conditions',
        iconName: isDay ? 'Sun' : 'Moon',
      };
  }
}

export function toFahrenheit(celsius: number): number {
  return Math.round((celsius * 9) / 5 + 32);
}

export function formatTemp(tempC: number, unit: 'celsius' | 'fahrenheit'): string {
  if (unit === 'fahrenheit') {
    return `${toFahrenheit(tempC)}°`;
  }
  return `${Math.round(tempC)}°`;
}

export function formatWindSpeed(kmh: number, unit: 'kmh' | 'mph'): string {
  if (unit === 'mph') {
    const mph = Math.round(kmh * 0.621371);
    return `${mph} mph`;
  }
  return `${Math.round(kmh)} km/h`;
}

export function getWindDirection(deg: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round((deg % 360) / 22.5) % 16;
  return directions[index];
}

export function getUvCategory(uv: number): { text: string; colorClass: string } {
  if (uv <= 2) return { text: 'Low', colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  if (uv <= 5) return { text: 'Moderate', colorClass: 'text-amber-700 bg-amber-50 border-amber-200' };
  if (uv <= 7) return { text: 'High', colorClass: 'text-orange-700 bg-orange-50 border-orange-200' };
  if (uv <= 10) return { text: 'Very High', colorClass: 'text-red-700 bg-red-50 border-red-200' };
  return { text: 'Extreme', colorClass: 'text-purple-700 bg-purple-50 border-purple-200' };
}

export function formatHour(isoTime: string): string {
  const date = new Date(isoTime);
  return date.toLocaleTimeString([], { hour: 'numeric', hour12: true });
}

export function formatDayName(isoDate: string, isFirst = false): string {
  if (isFirst) return 'Today';
  const date = new Date(isoDate + 'T12:00:00');
  return date.toLocaleDateString([], { weekday: 'short' });
}

export function formatFullDate(isoDate: string): string {
  const date = new Date(isoDate + 'T12:00:00');
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', weekday: 'long' });
}

/**
 * Generates intelligent rule-based planning recommendations
 * when Gemini API response is not requested or as instant heuristic fallback.
 */
export function generateHeuristicRecommendations(data: WeatherData): PlanningRecommendations {
  const { current, daily } = data;
  const today = daily[0] || ({} as DailyForecastItem);
  const temp = current.temperature;
  const precipProb = today.precipitationProbabilityMax ?? current.precipitation;
  const wind = current.windSpeed;
  const uv = today.uvIndexMax ?? 0;
  const code = current.weatherCode;

  // Attire logic
  let attireTitle = 'Comfortable Casual';
  let attireAdvice = 'A light shirt or breathable top with pants is ideal for current temperatures.';
  let attireLevel: 'optimal' | 'moderate' | 'caution' | 'alert' = 'optimal';
  let attireAction = 'Dress in breathable layers';

  if (temp < 0) {
    attireTitle = 'Heavy Winter Gear';
    attireAdvice = 'Freezing conditions. Wear a thermal base layer, insulated down coat, gloves, and a warm beanie.';
    attireLevel = 'alert';
    attireAction = 'Thermal coat, gloves & scarf required';
  } else if (temp < 10) {
    attireTitle = 'Warm Jacket & Layers';
    attireAdvice = 'Chilly weather. A warm jacket or wool coat paired with layered knitwear will keep you comfortable.';
    attireLevel = 'caution';
    attireAction = 'Insulated jacket or coat recommended';
  } else if (temp < 18) {
    attireTitle = 'Light Jacket or Cardigan';
    attireAdvice = 'Mild but brisk. Bring along a medium pullover, light jacket, or windbreaker for morning and evening dips.';
    attireLevel = 'moderate';
    attireAction = 'Pack an extra layer';
  } else if (temp > 28) {
    attireTitle = 'Lightweight & Breathable';
    attireAdvice = 'Warm to hot temperatures. Opt for loose-fitting cotton or linen clothes and UV protective sunglasses.';
    attireLevel = 'caution';
    attireAction = 'Sunhat & breathable clothing';
  }

  if (precipProb > 40 || code >= 50) {
    attireAdvice += ' Keep a waterproof shell jacket or compact umbrella handy.';
    attireAction += ' + Compact umbrella';
  }

  // Outdoor activities logic
  let activityTitle = 'Favorable for Outdoor Activities';
  let activityAdvice = 'Great atmospheric conditions for outdoor walks, running, cycling, or park visits.';
  let activityLevel: 'optimal' | 'moderate' | 'caution' | 'alert' = 'optimal';
  let bestHours = 'Late morning to mid-afternoon (10:00 AM - 4:00 PM)';

  if (code >= 95) {
    activityTitle = 'Avoid Outdoor Recreation';
    activityAdvice = 'Thunderstorm risk present. Postpone outdoor sports, trail hikes, and open-air events.';
    activityLevel = 'alert';
    bestHours = 'Indoor activities recommended';
  } else if (precipProb > 60 || code >= 60) {
    activityTitle = 'Intermittent Rain Expected';
    activityAdvice = 'High likelihood of rain. Prefer covered pavilions or indoor fitness centers.';
    activityLevel = 'caution';
    bestHours = 'Check real-time radar for dry gaps';
  } else if (wind > 40) {
    activityTitle = 'Brisk Winds';
    activityAdvice = 'Gusty winds may make cycling or racket sports challenging. Seek sheltered walking paths.';
    activityLevel = 'moderate';
    bestHours = 'Early morning before winds pick up';
  } else if (temp > 30) {
    activityTitle = 'Heat Caution';
    activityAdvice = 'High heat. Schedule vigorous workouts for early morning or dusk to avoid thermal fatigue.';
    activityLevel = 'caution';
    bestHours = 'Early morning (6:00 AM - 8:30 AM)';
  } else if (temp < 5) {
    bestHours = 'Midday peak sun (12:00 PM - 3:00 PM)';
  }

  // Commute and travel logic
  let commuteTitle = 'Smooth Travel Conditions';
  let commuteAdvice = 'Dry pavements and clear visibility expected throughout primary transit corridors.';
  let commuteLevel: 'optimal' | 'moderate' | 'caution' | 'alert' = 'optimal';
  let commuteAction = 'Normal commute times expected';

  if (code === 45 || code === 48) {
    commuteTitle = 'Fog & Low Visibility';
    commuteAdvice = 'Dense fog may reduce highway sight lines. Allow extra following distance and use low beams.';
    commuteLevel = 'caution';
    commuteAction = 'Use low beams & allow 10 min extra';
  } else if (code >= 95 || code >= 71 || code === 56 || code === 66) {
    commuteTitle = 'Potential Travel Disruption';
    commuteAdvice = 'Precipitation or winter road conditions could cause slick surfaces and transit slowdowns.';
    commuteLevel = 'alert';
    commuteAction = 'Check road reports before driving';
  } else if (precipProb > 50) {
    commuteTitle = 'Wet Road Surfaces';
    commuteAdvice = 'Rain showers will cause damp roads and braking distances to lengthen.';
    commuteLevel = 'moderate';
    commuteAction = 'Keep umbrella in your vehicle or bag';
  }

  // Health and comfort logic
  let healthTitle = 'Pleasant & Balanced Air';
  let healthAdvice = 'Atmospheric pressure and humidity levels are in the optimal comfort range.';
  let healthLevel: 'optimal' | 'moderate' | 'caution' | 'alert' = 'optimal';
  let healthAction = 'Enjoy the fresh air';

  if (uv >= 8) {
    healthTitle = 'Very High UV Radiation';
    healthAdvice = 'Sunburn can occur in under 15 minutes. Apply SPF 50+ sunscreen, seek shade, and wear UV sunglasses.';
    healthLevel = 'alert';
    healthAction = 'Apply SPF 50+ sunscreen & wear UV lenses';
  } else if (uv >= 6) {
    healthTitle = 'High UV Index';
    healthAdvice = 'Moderate to high UV levels. Sun protection recommended between 11:00 AM and 4:00 PM.';
    healthLevel = 'caution';
    healthAction = 'Apply SPF 30+ if outdoors for >30 mins';
  } else if (current.relativeHumidity > 80 && temp > 25) {
    healthTitle = 'Muggy & Elevated Humidity';
    healthAdvice = 'High humidity inhibits natural evaporative cooling. Increase fluid intake and stay hydrated.';
    healthLevel = 'moderate';
    healthAction = 'Drink extra fluids';
  } else if (current.relativeHumidity < 25) {
    healthTitle = 'Dry Ambient Air';
    healthAdvice = 'Dry air may irritate sensitive skin or eyes. Consider using moisturizer or lip balm.';
    healthLevel = 'moderate';
    healthAction = 'Stay hydrated & moisturize';
  }

  const summary = `Weather in ${data.city.name} is currently ${getWeatherCondition(current.weatherCode, current.isDay).label.toLowerCase()} at ${Math.round(current.temperature)}°C (${toFahrenheit(current.temperature)}°F). ${
    precipProb > 30 ? `Precipitation risk is elevated (${precipProb}%).` : 'Skies remain relatively calm.'
  } Plan attire and outdoor tasks accordingly.`;

  return {
    summary,
    attire: {
      title: attireTitle,
      advice: attireAdvice,
      level: attireLevel,
      iconName: 'Shirt',
      actionItem: attireAction,
    },
    outdoorActivities: {
      title: activityTitle,
      advice: activityAdvice,
      level: activityLevel,
      iconName: 'Activity',
      actionItem: `Best window: ${bestHours}`,
    },
    commuteAndTravel: {
      title: commuteTitle,
      advice: commuteAdvice,
      level: commuteLevel,
      iconName: 'Navigation',
      actionItem: commuteAction,
    },
    healthAndComfort: {
      title: healthTitle,
      advice: healthAdvice,
      level: healthLevel,
      iconName: 'ShieldAlert',
      actionItem: healthAction,
    },
    bestOutdoorHours: bestHours,
    source: 'heuristic',
  };
}
