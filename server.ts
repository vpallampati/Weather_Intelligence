import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Weather Intelligence API',
      aiConfigured: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // Geocoding Proxy endpoint (queries Open-Meteo geocoding service)
  app.get('/api/geocoding', async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.trim().length === 0) {
        return res.json({ results: [] });
      }

      const openMeteoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        query.trim()
      )}&count=8&language=en&format=json`;

      const response = await fetch(openMeteoUrl);
      if (!response.ok) {
        return res.status(response.status).json({ error: 'Failed to search cities' });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Error fetching geocoding data:', error);
      res.status(500).json({ error: 'Internal geocoding proxy error' });
    }
  });

  // Weather Proxy endpoint (queries Open-Meteo forecast API)
  app.get('/api/weather', async (req, res) => {
    try {
      const lat = req.query.lat as string;
      const lon = req.query.lon as string;

      if (!lat || !lon) {
        return res.status(400).json({ error: 'Latitude and longitude query parameters are required' });
      }

      const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(
        lat
      )}&longitude=${encodeURIComponent(
        lon
      )}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,precipitation_probability,weather_code,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;

      const response = await fetch(openMeteoUrl);
      if (!response.ok) {
        return res.status(response.status).json({ error: 'Failed to fetch weather from Open-Meteo' });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      res.status(500).json({ error: 'Internal weather proxy error' });
    }
  });

  // National Weather Service (NWS / NOAA) & Extreme Alerts endpoint
  app.get('/api/alerts', async (req, res) => {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lon = parseFloat(req.query.lon as string);

      if (isNaN(lat) || isNaN(lon)) {
        return res.status(400).json({ error: 'Valid numeric lat and lon required' });
      }

      // Check if location coordinates fall within United States geographic territory
      const isUS = lat >= 18 && lat <= 72 && lon >= -180 && lon <= -65;
      const alerts: any[] = [];

      if (isUS) {
        try {
          const nwsUrl = `https://api.weather.gov/alerts/active?point=${lat.toFixed(4)},${lon.toFixed(4)}`;
          const response = await fetch(nwsUrl, {
            headers: {
              'User-Agent': '(WeatherIntelligenceApp, support@weatherintelligence.internal)',
              Accept: 'application/geo+json',
            },
          });

          if (response.ok) {
            const nwsData = (await response.json()) as any;
            if (nwsData && Array.isArray(nwsData.features)) {
              for (const feat of nwsData.features) {
                const props = feat.properties || {};
                alerts.push({
                  id: feat.id || props.id || `nws-${Math.random()}`,
                  event: props.event || 'Weather Warning',
                  headline: props.headline || props.event,
                  severity: props.severity || 'Severe',
                  urgency: props.urgency || 'Expected',
                  certainty: props.certainty || 'Observed',
                  senderName: props.senderName || 'National Weather Service (NOAA)',
                  description: props.description || '',
                  instruction: props.instruction || '',
                  areaDesc: props.areaDesc || '',
                  effective: props.effective || '',
                  expires: props.expires || '',
                  source: 'NWS',
                });
              }
            }
          }
        } catch (nwsErr) {
          console.warn('NWS API query warning:', nwsErr);
        }
      }

      res.json({ alerts, isUS });
    } catch (error) {
      console.error('Error in alerts proxy:', error);
      res.status(500).json({ error: 'Internal alerts proxy error', alerts: [] });
    }
  });

  // AI Planning Recommendations endpoint
  app.post('/api/recommendations', async (req, res) => {
    const { city, current, daily, timezone } = req.body;

    if (!city || !current || !daily) {
      return res.status(400).json({ error: 'Weather details (city, current, daily) are required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Graceful response indicating fallback heuristic should be used
      return res.json({
        available: false,
        message: 'GEMINI_API_KEY not set. Using local meteorological heuristics.',
      });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const today = daily[0] || {};
      const prompt = `Analyze this weather data for ${city.name}, ${city.country || ''} (${timezone}):
- Current temperature: ${current.temperature}°C (feels like ${current.apparentTemperature}°C)
- Current condition code: ${current.weatherCode}
- Humidity: ${current.relativeHumidity}%
- Wind speed: ${current.windSpeed} km/h (gusts ${current.windGusts} km/h)
- Precipitation: ${current.precipitation} mm
- Today's forecast: High ${today.temperatureMax}°C, Low ${today.temperatureMin}°C
- Rain probability: ${today.precipitationProbabilityMax}%
- UV index max: ${today.uvIndexMax}
- Sunrise: ${today.sunrise}, Sunset: ${today.sunset}

Upcoming 7 days overview:
${daily.slice(0, 7).map((d: any, idx: number) => `Day ${idx + 1} (${d.date}): High ${d.temperatureMax}°C / Low ${d.temperatureMin}°C, Precip ${d.precipitationProbabilityMax}%, UV ${d.uvIndexMax}`).join('\n')}

Provide practical, high-value life and outdoor planning recommendations structured strictly in JSON. Ensure level is one of: "optimal", "moderate", "caution", or "alert".`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are an expert meteorological intelligence analyst. Your goal is to give concrete, real-world, actionable daily lifestyle recommendations based strictly on weather forecasts: wardrobe/attire, outdoor recreation feasibility, commute & transit precautions, and health/comfort precautions.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: {
                type: Type.STRING,
                description: 'A 2-3 sentence executive intelligence briefing about today and the 7-day outlook.',
              },
              attire: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  advice: { type: Type.STRING },
                  level: { type: Type.STRING },
                  actionItem: { type: Type.STRING },
                },
                required: ['title', 'advice', 'level', 'actionItem'],
              },
              outdoorActivities: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  advice: { type: Type.STRING },
                  level: { type: Type.STRING },
                  actionItem: { type: Type.STRING },
                },
                required: ['title', 'advice', 'level', 'actionItem'],
              },
              commuteAndTravel: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  advice: { type: Type.STRING },
                  level: { type: Type.STRING },
                  actionItem: { type: Type.STRING },
                },
                required: ['title', 'advice', 'level', 'actionItem'],
              },
              healthAndComfort: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  advice: { type: Type.STRING },
                  level: { type: Type.STRING },
                  actionItem: { type: Type.STRING },
                },
                required: ['title', 'advice', 'level', 'actionItem'],
              },
              bestOutdoorHours: {
                type: Type.STRING,
                description: 'The optimal time window during the day for outdoor exercise or walking.',
              },
            },
            required: ['summary', 'attire', 'outdoorActivities', 'commuteAndTravel', 'healthAndComfort', 'bestOutdoorHours'],
          },
        },
      });

      const parsed = JSON.parse(response.text?.trim() || '{}');
      res.json({
        available: true,
        source: 'gemini',
        recommendations: {
          ...parsed,
          attire: { ...parsed.attire, iconName: 'Shirt' },
          outdoorActivities: { ...parsed.outdoorActivities, iconName: 'Activity' },
          commuteAndTravel: { ...parsed.commuteAndTravel, iconName: 'Navigation' },
          healthAndComfort: { ...parsed.healthAndComfort, iconName: 'ShieldAlert' },
          source: 'gemini',
        },
      });
    } catch (error) {
      console.error('Gemini API recommendations generation failed:', error);
      res.status(500).json({
        available: false,
        error: 'Failed to generate AI recommendations from Gemini',
      });
    }
  });

  // Vite middleware in development vs Static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Weather Intelligence server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
