import { WeatherData, WeatherAlert, AlertSeverity } from '../types';

/**
 * Evaluates live meteorological telemetry against international WMO & National Weather Service
 * threshold definitions for extreme weather conditions.
 */
export function detectExtremeWeatherAlerts(data: WeatherData): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  const { current, daily, city } = data;
  const today = daily[0];

  // 1. Extreme Heat Warning
  if (current.temperature >= 38 || (today && today.temperatureMax >= 39) || current.apparentTemperature >= 41) {
    alerts.push({
      id: `wmo-heat-${city.id}-${Date.now()}`,
      event: 'Excessive Heat Warning',
      headline: `Excessive Heat Warning for ${city.name} — Dangerously High Temperatures`,
      severity: 'Extreme',
      urgency: 'Immediate',
      senderName: 'Meteorological Observation & Synoptic Network',
      description: `Current ambient temperature is ${Math.round(current.temperature)}°C (apparent heat index feels like ${Math.round(current.apparentTemperature)}°C). High temperatures create a high risk of heat exhaustion or heat stroke during prolonged outdoor exposure.`,
      instruction: 'Drink plenty of fluids, stay in an air-conditioned room, stay out of the direct sun, and check up on relatives and neighbors. Never leave children or pets unattended in vehicles.',
      areaDesc: `${city.name} and surrounding regional basin`,
      source: 'WMO_METEOROLOGICAL',
      effective: new Date().toISOString(),
      expires: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
    });
  }

  // 2. Severe Convective Thunderstorm Warning
  if ([95, 96, 99].includes(current.weatherCode)) {
    const isHail = [96, 99].includes(current.weatherCode);
    alerts.push({
      id: `wmo-storm-${city.id}-${Date.now()}`,
      event: isHail ? 'Severe Thunderstorm Warning with Hail' : 'Severe Thunderstorm Warning',
      headline: `Severe Thunderstorm Warning in effect for ${city.name}`,
      severity: isHail ? 'Extreme' : 'Severe',
      urgency: 'Immediate',
      senderName: 'National Meteorological Warning Radar',
      description: `Severe convective thunderstorm cells active over ${city.name}. Expect frequent cloud-to-ground lightning, rapid wind acceleration${isHail ? ', and damaging hail' : ''}. Flash rainfall may cause localized pooling.`,
      instruction: 'Seek shelter in a sturdy building immediately. Stay away from windows and do not use electrical equipment during lightning strikes. If outdoors or on water, evacuate to safe enclosed structures.',
      areaDesc: `${city.name} Metropolitan Area`,
      source: 'WMO_METEOROLOGICAL',
      effective: new Date().toISOString(),
      expires: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
    });
  }

  // 3. High Wind & Damaging Gale Warning
  if (current.windGusts >= 75 || current.windSpeed >= 55) {
    alerts.push({
      id: `wmo-wind-${city.id}-${Date.now()}`,
      event: 'High Wind & Gale Warning',
      headline: `High Wind Warning for ${city.name} — Damaging Gusts Up to ${Math.round(current.windGusts)} km/h`,
      severity: current.windGusts >= 90 ? 'Extreme' : 'Severe',
      urgency: 'Immediate',
      senderName: 'Atmospheric Wind Telemetry Station',
      description: `Damaging winds reaching ${Math.round(current.windSpeed)} km/h with gusts exceeding ${Math.round(current.windGusts)} km/h. Unsecured objects will be blown away. Tree limbs could be blown down and isolated power outages may occur.`,
      instruction: 'Secure loose outdoor furniture and objects. Drivers of high-profile vehicles should exercise extreme caution or delay transit until winds subside.',
      areaDesc: city.name,
      source: 'WMO_METEOROLOGICAL',
      effective: new Date().toISOString(),
      expires: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
    });
  }

  // 4. Torrential Rainfall & Flash Flood Threat
  if (current.precipitation >= 12 || (today && today.precipitationSum >= 45) || [65, 82].includes(current.weatherCode)) {
    alerts.push({
      id: `wmo-flood-${city.id}-${Date.now()}`,
      event: 'Flash Flood & Heavy Rain Advisory',
      headline: `Flash Flood Watch / Torrential Precipitation in ${city.name}`,
      severity: current.precipitation >= 20 ? 'Extreme' : 'Severe',
      urgency: 'Immediate',
      senderName: 'Hydrological & Meteorological Survey',
      description: `Intense precipitation rates detected (current rate: ${current.precipitation} mm/h; 24-hr sum forecast: ${today ? today.precipitationSum : 30} mm). Urban drainage systems may be overwhelmed, causing rapid water accumulation on roadways and underpasses.`,
      instruction: 'Turn around, do not drown when encountering flooded roads. Most flood deaths occur in vehicles. Be especially cautious at night when water depths are difficult to recognize.',
      areaDesc: `${city.name} low-lying districts and drainage corridors`,
      source: 'WMO_METEOROLOGICAL',
      effective: new Date().toISOString(),
      expires: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
    });
  }

  // 5. Extreme Freeze / Blizzard Alert
  if (current.temperature <= -12 || [75, 85, 86].includes(current.weatherCode)) {
    const isBlizzard = [75, 85, 86].includes(current.weatherCode) && current.windSpeed >= 35;
    alerts.push({
      id: `wmo-cold-${city.id}-${Date.now()}`,
      event: isBlizzard ? 'Blizzard Warning' : 'Extreme Cold & Frost Freeze Warning',
      headline: `${isBlizzard ? 'Blizzard Warning' : 'Hard Freeze Warning'} for ${city.name}`,
      severity: isBlizzard || current.temperature <= -20 ? 'Extreme' : 'Severe',
      urgency: 'Expected',
      senderName: 'Arctic & Winter Weather Advisory Service',
      description: `Severe winter cold with temperatures at ${Math.round(current.temperature)}°C. Frostbite can occur on exposed skin within 15 minutes. ${isBlizzard ? 'Heavy blowing snow causing near-zero visibility and hazardous transit.' : ''}`,
      instruction: 'Dress in multiple insulating layers covering all exposed skin. Keep pets indoors and ensure vehicle winter emergency kits are stocked with thermal blankets and traction devices.',
      areaDesc: city.name,
      source: 'WMO_METEOROLOGICAL',
      effective: new Date().toISOString(),
      expires: new Date(Date.now() + 16 * 3600 * 1000).toISOString(),
    });
  }

  // 6. Extreme UV Radiation Warning
  if (today && today.uvIndexMax >= 10) {
    alerts.push({
      id: `wmo-uv-${city.id}-${Date.now()}`,
      event: 'Extreme UV Radiation Warning',
      headline: `Extreme Solar UV Radiation Alert (Index: ${today.uvIndexMax.toFixed(1)})`,
      severity: 'Moderate',
      urgency: 'Expected',
      senderName: 'Solar Atmospheric Radiation Monitoring',
      description: `Peak solar ultraviolet index will reach ${today.uvIndexMax.toFixed(1)}. Unprotected skin and eyes will burn rapidly in under 10 minutes of direct midday sun exposure.`,
      instruction: 'Take full precautions: wear broad-spectrum SPF 50+ sunscreen, sunglasses with UV protection, and a wide-brimmed hat. Avoid direct sun exposure between 10:00 AM and 4:00 PM.',
      areaDesc: city.name,
      source: 'WMO_METEOROLOGICAL',
      effective: today.date,
      expires: `${today.date}T18:00:00Z`,
    });
  }

  return alerts;
}

/**
 * Curated realistic National Weather Service (NWS / NOAA) alert simulation presets
 * allowing instant demonstration and verification of alert banners, beacons, and safety instructions.
 */
export const SIMULATED_NWS_ALERTS: Record<string, WeatherAlert> = {
  storm: {
    id: 'nws-sim-storm',
    event: 'Severe Thunderstorm Warning',
    headline: 'Severe Thunderstorm Warning issued by National Weather Service',
    severity: 'Severe',
    urgency: 'Immediate',
    certainty: 'Observed',
    senderName: 'National Weather Service (NOAA)',
    description:
      'At 1:25 PM, National Weather Service Doppler radar indicated a severe thunderstorm capable of producing destructive winds in excess of 65 mph and quarter-sized hail. Locations impacted include metro residential centers, interstate corridors, and regional air terminals.',
    instruction:
      'For your protection move to an interior room on the lowest floor of a building. Torrential rainfall is occurring with this storm, and may lead to flash flooding. Do not drive your vehicle through flooded roadways.',
    areaDesc: 'Metropolitan County and surrounding localized corridors',
    effective: new Date().toISOString(),
    expires: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
    source: 'SIMULATED',
  },
  flood: {
    id: 'nws-sim-flood',
    event: 'Flash Flood Emergency',
    headline: 'Flash Flood Emergency for rapid water rises in low-lying corridors',
    severity: 'Extreme',
    urgency: 'Immediate',
    certainty: 'Observed',
    senderName: 'National Weather Service Hydrologic Unit',
    description:
      'Between 2 and 4 inches of rain have fallen in the past 90 minutes. Additional rainfall amounts of 1 to 2 inches are possible in the warned area. Flash flooding of small creeks, urban highways, underpasses, and drainage channels is actively ongoing.',
    instruction:
      'MOVE TO HIGHER GROUND NOW. This is an extremely dangerous and life-threatening situation. Do not attempt to travel unless you are fleeing an area subject to flooding or under an evacuation order.',
    areaDesc: 'Urban River Basin, Low Water Crossings, and Highway Underpasses',
    effective: new Date().toISOString(),
    expires: new Date(Date.now() + 5 * 3600 * 1000).toISOString(),
    source: 'SIMULATED',
  },
  heat: {
    id: 'nws-sim-heat',
    event: 'Excessive Heat Warning',
    headline: 'Excessive Heat Warning remains in effect through evening hours',
    severity: 'Extreme',
    urgency: 'Expected',
    certainty: 'Likely',
    senderName: 'National Weather Service Heat Health Office',
    description:
      'Dangerously hot conditions with heat index values peaking up to 108°F (42°C). High temperatures and high humidity will combine to create a situation in which heat illnesses are probable with outdoor activity.',
    instruction:
      'Drink plenty of water and electrolyte solutions. Reschedule strenuous outdoor tasks to early morning or late evening. Wear lightweight, loose-fitting clothing. Take frequent breaks in air-conditioned spaces.',
    areaDesc: 'Regional metro area and inland valleys',
    effective: new Date().toISOString(),
    expires: new Date(Date.now() + 10 * 3600 * 1000).toISOString(),
    source: 'SIMULATED',
  },
  blizzard: {
    id: 'nws-sim-blizzard',
    event: 'Blizzard & Winter Storm Warning',
    headline: 'Blizzard Warning with zero visibility and life-threatening wind chills',
    severity: 'Extreme',
    urgency: 'Immediate',
    certainty: 'Observed',
    senderName: 'National Weather Service Winter Weather Command',
    description:
      'Blizzard conditions observed. Additional snow accumulations of 8 to 14 inches with sustained winds of 35 to 45 mph and gusts to 60 mph. Whiteout conditions will make travel treacherous or impossible.',
    instruction:
      'Travel should be restricted to emergencies only. If you must travel, have a winter survival kit with you. If you get stranded, stay with your vehicle to avoid disorienting whiteouts.',
    areaDesc: 'Entire forecast warning area and transit passes',
    effective: new Date().toISOString(),
    expires: new Date(Date.now() + 14 * 3600 * 1000).toISOString(),
    source: 'SIMULATED',
  },
};

export function getSeverityBadgeStyles(severity: AlertSeverity, isDark = false) {
  switch (severity) {
    case 'Extreme':
      return {
        badgeBg: isDark ? 'bg-red-950/80 border-red-500/50 text-red-300' : 'bg-red-100 border-red-300 text-red-900',
        pulseColor: 'bg-red-500',
        containerBg: isDark ? 'bg-red-950/40 border-red-800/60' : 'bg-red-50/95 border-red-200',
        iconColor: 'text-red-600 dark:text-red-400',
      };
    case 'Severe':
      return {
        badgeBg: isDark ? 'bg-amber-950/80 border-amber-500/50 text-amber-300' : 'bg-amber-100 border-amber-300 text-amber-900',
        pulseColor: 'bg-amber-500',
        containerBg: isDark ? 'bg-amber-950/40 border-amber-800/60' : 'bg-amber-50/95 border-amber-200',
        iconColor: 'text-amber-600 dark:text-amber-400',
      };
    case 'Moderate':
      return {
        badgeBg: isDark ? 'bg-yellow-950/80 border-yellow-500/50 text-yellow-300' : 'bg-yellow-100 border-yellow-300 text-yellow-900',
        pulseColor: 'bg-yellow-400',
        containerBg: isDark ? 'bg-yellow-950/30 border-yellow-800/60' : 'bg-yellow-50/95 border-yellow-200',
        iconColor: 'text-yellow-600 dark:text-yellow-500',
      };
    default:
      return {
        badgeBg: isDark ? 'bg-sky-950/80 border-sky-500/50 text-sky-300' : 'bg-sky-100 border-sky-300 text-sky-900',
        pulseColor: 'bg-sky-400',
        containerBg: isDark ? 'bg-sky-950/30 border-sky-800/60' : 'bg-sky-50/95 border-sky-200',
        iconColor: 'text-sky-600 dark:text-sky-400',
      };
  }
}
