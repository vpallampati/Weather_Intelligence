# Running Weather Intelligence in WSL (Ubuntu)

This project is configured for full-stack Node.js execution locally in WSL (Windows Subsystem for Linux) Ubuntu, either using **Docker** or directly using **Node.js**.

---

## Option 1: Running with Docker (Recommended)

### 1. Prerequisites in WSL Ubuntu
Make sure Docker is running. You can use either:
- **Docker Desktop for Windows** with the **WSL 2 backend** enabled (*Settings → Resources → WSL Integration → enable Ubuntu*), OR
- Native Docker Engine installed inside WSL Ubuntu (`sudo service docker status` / `sudo service docker start`).

Verify in your WSL terminal:
```bash
docker --version
```

---

### 2. Method A: Quick Run with Docker Compose

1. *(Optional)* Create a `.env` file in the project root if you want AI-powered forecasts:
   ```bash
   echo 'GEMINI_API_KEY="your-gemini-api-key-here"' > .env
   ```
   *(Note: The app works seamlessly even without an API key using built-in meteorological heuristics!)*

2. Build and start the container:
   ```bash
   docker compose up --build -d
   ```

3. View live logs:
   ```bash
   docker compose logs -f
   ```

4. Stop the container:
   ```bash
   docker compose down
   ```

---

### 3. Method B: Standard Docker CLI Commands

1. **Build the Docker image:**
   ```bash
   docker build -t weather-intelligence-app .
   ```

2. **Run the container:**
   ```bash
   # Without Gemini API Key:
   docker run -d -p 3000:3000 --name weather-app weather-intelligence-app

   # OR with Gemini API Key:
   docker run -d -p 3000:3000 -e GEMINI_API_KEY="your_api_key_here" --name weather-app weather-intelligence-app
   ```

3. **Check container status and logs:**
   ```bash
   docker ps
   docker logs -f weather-app
   ```

4. **Stop and clean up:**
   ```bash
   docker stop weather-app && docker rm weather-app
   ```

---

## Option 2: Running directly with Node.js in WSL Ubuntu (Without Docker)

If you prefer to run directly inside WSL Ubuntu with native Node.js:

1. **Install Node.js 20 or 22** (if not already installed):
   ```bash
   # Check version:
   node -v
   npm -v
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run in Development Mode (Live Hot Reload):**
   ```bash
   npm run dev
   ```

4. **OR Run in Production Mode:**
   ```bash
   npm run build
   npm start
   ```

---

## Accessing the App

Once running (via Docker or native Node.js):
- Open your browser in Windows or WSL and navigate to:
  **[http://localhost:3000](http://localhost:3000)**

WSL 2 automatically forwards `localhost:3000` to your Windows host browser.
