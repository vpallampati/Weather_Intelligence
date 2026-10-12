# Weather Intelligence 🌦️

A modern, high-precision meteorological dashboard and lifestyle planning platform built with **React 18**, **TypeScript**, **Tailwind CSS**, **Motion**, **Express.js**, **Open-Meteo APIs**, and **Google Gemini AI**.

Designed for complete situational awareness, Weather Intelligence combines real-time synoptic telemetry, dynamic atmospheric particle simulations, interactive hourly temperature curves, 7-day extended forecasts with daily hourly drill-downs, and proactive AI lifestyle & outdoor activity planning.

---

## 🌟 Comprehensive Features

### 1. Dynamic Atmospheric Visual Engine
- **Living Weather Canvas**: An animated atmospheric simulation directly embedded into the city hero card and page backdrop that realistically portrays:
  - **Solar & Lunar Dynamics**: Realistic solar rays during the day, glowing starfields and crescent moon phases at night.
  - **Precipitation Engine**: Real-time canvas particle systems rendering light drizzle, heavy rain with ground splash ripples, and drifting hexagonal snowflakes.
  - **Thunderstorms**: Atmospheric cloud rumbles accompanied by realistic full-frame lightning flashes during severe convective events.
  - **Mist & Fog**: Drifting multi-layered low-visibility mist bands calibrated to high relative humidity and fog WMO codes.
- **Atmospheric Theme Ribbon**: Easily preview different meteorological scenes (**Clear Day**, **Starry Night**, **Rain**, **Thunderstorm**, **Crisp Snow**, **Mist & Fog**) or keep it locked to **🛰️ Live Open-Meteo** telemetry.

---

### 2. Real-Time Meteorological Telemetry
- **Instant Weather Status**: High-contrast, unboxed temperature readout, apparent "feels-like" temperature, and color-coded daily maximum/minimum boundaries.
- **Deep Meteorological Telemetry Grid**:
  - **Relative Humidity**: Real-time atmospheric moisture percentage.
  - **Surface Pressure**: Calibrated atmospheric pressure in hectopascals (hPa).
  - **Cloud Cover**: Total sky coverage percentage.
  - **Wind Vector**: Accurate wind speed, directional compass heading (N/NE/E/SE/S/SW/W/NW), and instantaneous wind gust telemetry.
  - **Precipitation**: Current accumulation in millimeters.
  - **Solar Cycle**: Exact local sunrise and sunset timings derived from astronomical coordinates.
  - **Atmospheric Beacon Badge**: Live local timezone offset and coordinates beacon.

---

### 3. Today's Outlook: 24-Hour Interactive Forecast
- **Continuous Timeline**: Displays hour-by-hour weather transitions for the next 24 to 48 hours.
- **Interactive SVG Temperature Curve**:
  - Smooth Bezier curve showing temperature highs, lows, and daytime/nighttime inflection points.
  - Embedded precipitation probability bars along the timeline.
  - Hover tooltips displaying exact hourly readings, UV ratings, and condition icons.
- **Display Mode Switcher**:
  - **Chart + Cards**: Full combination view with the visual curve and horizontal scrolling cards.
  - **Chart Only**: Compact analytics view focused solely on the temperature and precipitation curve.
  - **Cards Only**: Scannable, touch-friendly horizontal card carousel.

---

### 4. 7-Day Synoptic Extended Forecast & Daily Drill-Down
- **Visual Temperature Range Bars**: Weekly outlook featuring min/max temperature range bars graphically calibrated against the week's highest and lowest temperatures.
- **Daily Metrics**: Daily weather condition icons, maximum UV index indicators, expected total precipitation sum (mm), and peak wind speeds.
- **Interactive Hourly Drill-Down Modal**: Click on **any day** of the 7-day forecast to open a dedicated modal displaying the complete 24-hour hourly progression (temperatures, precipitation chance, and hourly weather codes) for that specific day.

---

### 5. AI-Powered Lifestyle & Planning Recommendations
- **Dual-Engine Architecture**:
  - **Gemini AI Integration**: Uses server-side Google Gemini models to synthesize complex telemetry into human-centered advice.
  - **Deterministic Heuristic Engine**: Automatically falls back to an offline meteorological heuristic system if no Gemini API key is supplied, ensuring recommendations work everywhere out of the box.
- **Actionable Categories**:
  - 🏃 **Outdoor Activity Suitability**: Scored assessments for running, cycling, hiking, photography, outdoor dining, and commuting.
  - 🧥 **Clothing & Gear Guide**: Layering recommendations, waterproof outerwear requirements, thermal protection, and eyewear advice.
  - 🌿 **Health & Environmental Advisory**: Sun safety precautions based on UV index, hydration guidelines for high heat indices, and respiratory comfort based on humidity and air stagnation.
  - ⏰ **Prime Window of the Day**: Identifies the ideal hourly window for outdoor endeavors before rain or excessive heat arrives.

---

### 6. Severe Weather Alerts & Simulation Sandbox
- **Official Warning Feeds**: Integrated with the **National Weather Service (NWS)** API to ingest active real-time warnings, watches, and advisories for US locations.
- **Meteorological Extreme Threshold Detector**: Automatically detects severe conditions globally using live telemetry thresholds:
  - Excessive Heat Warnings (Heat index > 40°C / 104°F)
  - Freeze & Frost Watches (Temperatures < 0°C / 32°F)
  - High Wind & Gale Warnings (Sustained winds > 60 km/h or gusts > 85 km/h)
  - Severe Convective Thunderstorms & Flash Floods
- **Interactive Simulation Sandbox**: Test emergency UI states with one click (**Severe Thunderstorm**, **Blizzard Warning**, **Excessive Heat**, or **Gale Warning**) directly inside the alert banner.

---

### 7. Global Search & Geolocation
- **Debounced City Search**: Search any global city, town, or administrative district powered by the Open-Meteo Geocoding database.
- **Geographic Disambiguation**: Displays state/province and country tags for accurate city selection.
- **Browser Geolocation**: One-click **"Use Current Location"** button with automatic reverse geocoding to resolve your immediate coordinates to a local city name.
- **Quick-Pick Metros**: Instant one-click selection for global hubs (New York, London, Tokyo, Paris, Sydney, Dubai, Singapore).

---

### 8. Measurement Units & Accessibility
- **Instant Unit Toggling**:
  - Temperature: **Celsius (°C)** ⇄ **Fahrenheit (°F)**.
  - Wind Speed: **Kilometers per hour (km/h)** ⇄ **Miles per hour (mph)**.
- **Contrast & Legibility**: High-contrast, WCAG AA compliant typography on both light and dark atmospheric horizons.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend UI** | React 18, TypeScript, Tailwind CSS, Motion (`motion/react`), Lucide React |
| **Backend Server** | Express.js, Node.js 22, `esbuild`, `tsx` |
| **AI Integration** | `@google/genai` (Google Gen AI TypeScript SDK) with server-side proxying |
| **Meteorological APIs** | Open-Meteo Forecast & Geocoding APIs, National Weather Service (NWS) API |
| **Containerization** | Docker, Docker Compose, Multi-stage Linux (`node:22-slim`) build |

---

## 🐳 WSL (Windows Subsystem for Linux) & Docker Setup Guide

This project is tailored for local execution inside **WSL (Ubuntu)** on Windows.

### Prerequisites

1. **WSL 2 installed on Windows**:
   ```powershell
   # In Windows PowerShell (Admin):
   wsl --status
   ```
2. **Docker installed and accessible in WSL**:
   - **Recommended**: [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/) with WSL 2 integration enabled:
     *Open Docker Desktop → Settings (gear icon) → Resources → WSL Integration → Toggle ON for your Ubuntu distribution.*
   - **Alternative**: Native Docker Engine installed directly inside Ubuntu (`sudo apt install docker.io docker-compose-v2`).

---

### Step-by-Step WSL Setup

#### 1. Navigate to your project directory in WSL
```bash
# Example if your files are located on your D: drive in Windows:
cd /mnt/d/weather-intelligence

# Or if inside your Linux home directory:
cd ~/weather-intelligence
```

#### 2. Initialize Docker configuration files (if exporting from ZIP)
*Note: Some ZIP export tools strip extensionless files like `Dockerfile`. If `ls Dockerfile` reports not found, simply run:*
```bash
bash setup-docker.sh
# OR: npm run docker:init
```
This generates `Dockerfile`, `.dockerignore`, and `docker-compose.yml`.

---

#### 3. (Optional) Configure Gemini API Key
Weather Intelligence runs out of the box with heuristic meteorological intelligence. If you wish to enable Google Gemini AI forecasts:
```bash
echo 'GEMINI_API_KEY="your-google-ai-studio-api-key"' > .env
```

---

#### 4. Run with Docker Compose (Recommended)

```bash
# Build the image and launch container in the background:
docker compose up --build -d
```

Monitor live container logs:
```bash
docker compose logs -f
```

To stop the container:
```bash
docker compose down
```

---

#### 5. Alternative: Run with standard Docker CLI
```bash
# 1. Build the Docker image:
docker build -t weather-intelligence-app .

# 2. Run container on port 8080 (without Gemini API Key):
docker run -d -p 8080:3000 --name weather-app weather-intelligence-app

# OR run with Gemini API Key on port 8080:
docker run -d -p 8080:3000 -e GEMINI_API_KEY="your_api_key_here" --name weather-app weather-intelligence-app

# 3. View logs:
docker logs -f weather-app

# 4. Stop and remove:
docker stop weather-app && docker rm weather-app
```

---

#### 6. Accessing the Application in Windows Browser
Open your browser in Windows or WSL and navigate to:
👉 **[http://localhost:8080](http://localhost:8080)**

*WSL 2 automatically forwards `localhost:8080` to your Windows host.*

---

## 💻 Running Directly with Node.js in WSL Ubuntu (Without Docker)

If you prefer to run directly on the host without Docker containers:

### 1. Ensure Node.js 20 or 22 is installed
```bash
# Check version:
node -v
npm -v
```
*(If needed, install via NodeSource: `curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt-get install -y nodejs`)*

### 2. Install dependencies
```bash
npm install
```

### 3. Run in Development Mode (Live Hot Reloading)
```bash
npm run dev
```

### 4. Run in Production Mode (Compiled Single-Bundle Server)
```bash
# Compiles client to dist/ and backend to dist/server.cjs:
npm run build

# Start production server:
npm start
```
Access at: **[http://localhost:3000](http://localhost:3000)**

---

## ⚙️ Environment Variables

| Variable | Description | Default | Required |
|---|---|---|---|
| `PORT` | Local port the HTTP server binds to | `3000` | No |
| `NODE_ENV` | Environment mode (`development` or `production`) | `production` | No |
| `GEMINI_API_KEY` | Google Gemini API Key for AI planning recommendations | `undefined` | No (App falls back to heuristic engine) |

---

## 🛠️ Useful Commands Summary

| Command | Description |
|---|---|
| `bash setup-docker.sh` | Restores Dockerfile and Compose configurations locally |
| `docker compose up --build -d` | Builds and starts the container in background |
| `docker compose logs -f` | Follows live container logs |
| `docker compose down` | Stops and removes container resources |
| `npm run dev` | Runs the Express + Vite server in development mode |
| `npm run build` | Compiles frontend assets & bundles `server.ts` to `dist/server.cjs` |
| `npm start` | Launches compiled production server |
| `npm run lint` | Runs TypeScript compiler verification (`tsc --noEmit`) |

---

## 📄 License
Licensed under the Apache-2.0 License.
