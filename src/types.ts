export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type WindSpeedUnit = 'kmh' | 'mph';

export interface CityLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  country_code?: string;
  admin1?: string;
  timezone?: string;
  elevation?: number;
}

export interface CurrentWeather {
  time: string;
  temperature: number;
  apparentTemperature: number;
  relativeHumidity: number;
  isDay: boolean;
  weatherCode: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  precipitation: number;
  cloudCover: number;
  pressure: number;
}

export interface HourlyForecastItem {
  time: string;
  temperature: number;
  weatherCode: number;
  precipitationProbability: number;
  uvIndex: number;
}

export interface DailyForecastItem {
  date: string;
  weatherCode: number;
  temperatureMax: number;
  temperatureMin: number;
  apparentTemperatureMax: number;
  apparentTemperatureMin: number;
  precipitationProbabilityMax: number;
  precipitationSum: number;
  uvIndexMax: number;
  windSpeedMax: number;
  sunrise: string;
  sunset: string;
}

export interface WeatherData {
  city: CityLocation;
  current: CurrentWeather;
  hourly: HourlyForecastItem[];
  allHourly?: HourlyForecastItem[];
  daily: DailyForecastItem[];
  timezone: string;
  fetchedAt: string;
}

export interface RecommendationItem {
  title: string;
  advice: string;
  level: 'optimal' | 'moderate' | 'caution' | 'alert';
  iconName: string;
  actionItem?: string;
}

export interface PlanningRecommendations {
  summary: string;
  attire: RecommendationItem;
  outdoorActivities: RecommendationItem;
  commuteAndTravel: RecommendationItem;
  healthAndComfort: RecommendationItem;
  bestOutdoorHours?: string;
  source: 'gemini' | 'heuristic';
}

export type AlertSeverity = 'Extreme' | 'Severe' | 'Moderate' | 'Minor' | 'Advisory';

export interface WeatherAlert {
  id: string;
  event: string;
  headline: string;
  severity: AlertSeverity;
  urgency: 'Immediate' | 'Expected' | 'Future' | 'Unknown';
  certainty?: string;
  senderName: string;
  description: string;
  instruction?: string;
  areaDesc?: string;
  effective?: string;
  expires?: string;
  source: 'NWS' | 'WMO_METEOROLOGICAL' | 'SIMULATED';
}
