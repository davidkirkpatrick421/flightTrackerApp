# Flight Tracker Deployment Guide
**Railway.app (Backend) + Vercel (Frontend)**

This guide walks you through deploying your Spring Boot backend on Railway and your React frontend on Vercel.

---

## Why This Stack?

**Railway.app** for backend:
- Free PostgreSQL database included
- Automatic deployments from GitHub
- Built-in environment variables
- Easy Spring Boot deployment
- No credit card required for starter tier

**Vercel** for frontend:
- Free React hosting
- Automatic deployments from GitHub
- Global CDN
- Custom domains included
- Optimized for static sites

---

## PART 1: RAILWAY (BACKEND DEPLOYMENT)

### Prerequisites
- Backend code pushed to GitHub
- Railway account (sign up at railway.app)
- Working Spring Boot application locally

---

### Step 1: Create Railway Account

1. Go to https://railway.app/
2. Click "Start a New Project"
3. Sign up with GitHub (recommended - enables auto-deploy)
4. Verify your email

---

### Step 2: Create a New Project

1. On Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Connect your GitHub account if not already connected
4. Select your `flight-tracker` repository (or whatever you named it)
5. Railway will detect it's a Spring Boot/Maven project

---

### Step 3: Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"**
3. Choose **"PostgreSQL"**
4. Railway automatically creates a database and connects it to your service

**Important:** Railway automatically provides these environment variables:
- `DATABASE_URL`
- `PGHOST`
- `PGPORT`
- `PGDATABASE`
- `PGUSER`
- `PGPASSWORD`

---

### Step 4: Configure Spring Boot for Railway

Update your `application.properties` or create `application-prod.properties`:

```properties
# application-prod.properties (for Railway)

# Database connection (Railway provides these via DATABASE_URL)
spring.datasource.url=${DATABASE_URL}
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# Server configuration
server.port=${PORT:8080}

# CORS - Allow your Vercel frontend
spring.web.cors.allowed-origins=https://your-app.vercel.app,http://localhost:3000
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.web.cors.allowed-headers=*
spring.web.cors.allow-credentials=true

# WebSocket configuration
spring.websocket.allowed-origins=https://your-app.vercel.app,http://localhost:3000

# OpenSky API (not needed in properties, but good for reference)
opensky.api.url=https://opensky-network.org/api/states/all
```

**Alternative:** If Railway doesn't automatically parse `DATABASE_URL`, use individual variables:

```properties
spring.datasource.url=jdbc:postgresql://${PGHOST}:${PGPORT}/${PGDATABASE}
spring.datasource.username=${PGUSER}
spring.datasource.password=${PGPASSWORD}
```

---

### Step 5: Set Environment Variables in Railway

1. In Railway project, click on your **service** (not the database)
2. Go to **"Variables"** tab
3. Add these environment variables:

```
SPRING_PROFILES_ACTIVE=prod
PORT=8080
```

Railway automatically provides:
- `DATABASE_URL`
- `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`

---

### Step 6: Configure Build Settings (if needed)

Railway usually auto-detects Maven/Spring Boot, but you can customize:

1. Click on your service
2. Go to **"Settings"**
3. Under **"Build Command"** (usually auto-detected):
   ```bash
   mvn clean install -DskipTests
   ```
4. Under **"Start Command"**:
   ```bash
   java -Dserver.port=$PORT -Dspring.profiles.active=prod -jar target/flighttracker-0.0.1-SNAPSHOT.jar
   ```

**Note:** Adjust the JAR filename to match your `pom.xml` artifact name.

---

### Step 7: Deploy

1. Push your code to GitHub
2. Railway automatically detects the push and starts building
3. Watch the build logs in Railway dashboard
4. Once deployed, Railway provides a public URL like:
   ```
   https://flighttracker-production-xxxx.up.railway.app
   ```

---

### Step 8: Verify Backend is Running

Test your deployed backend:

```bash
# Check if API is responding
curl https://your-app.up.railway.app/api/flights/current

# Test WebSocket endpoint (won't fully work via curl, but should respond)
curl https://your-app.up.railway.app/ws-flights
```

---

### Step 9: Configure CORS for Frontend

Once you know your Vercel URL (next section), update Railway environment variables:

1. In Railway, go to **Variables**
2. Add or update:
   ```
   ALLOWED_ORIGINS=https://your-app.vercel.app,http://localhost:3000
   ```

Then update your Spring Boot CORS configuration to use this variable:

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    
    @Value("${allowed.origins:http://localhost:3000}")
    private String allowedOrigins;
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(allowedOrigins.split(","))
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

---

## PART 2: VERCEL (FRONTEND DEPLOYMENT)

### Prerequisites
- React frontend code pushed to GitHub
- Vercel account (sign up at vercel.com)
- Working React app locally

---

### Step 1: Create Vercel Account

1. Go to https://vercel.com/
2. Click **"Sign Up"**
3. Sign up with GitHub (recommended)
4. Connect your GitHub account

---

### Step 2: Import Project

1. On Vercel dashboard, click **"Add New..."** → **"Project"**
2. Select **"Import Git Repository"**
3. Find your `flight-tracker-ui` (or frontend) repository
4. Click **"Import"**

---

### Step 3: Configure Build Settings

Vercel auto-detects React/Create React App, but verify:

**Framework Preset:** Create React App (or Vite if you're using Vite)

**Build Command:**
```bash
npm run build
```

**Output Directory:**
```
build
```
(or `dist` if using Vite)

**Install Command:**
```bash
npm install
```

---

### Step 4: Set Environment Variables

**Critical:** Your React app needs to know where your backend is.

1. Before deploying, in Vercel project settings, go to **"Environment Variables"**
2. Add these variables:

```
REACT_APP_API_URL=https://your-railway-app.up.railway.app
REACT_APP_WS_URL=https://your-railway-app.up.railway.app/ws-flights
REACT_APP_MAPBOX_TOKEN=your_mapbox_access_token_here
```

**Note:** 
- Replace `your-railway-app.up.railway.app` with your actual Railway URL
- Get Mapbox token from https://account.mapbox.com/

---

### Step 5: Update React Code to Use Environment Variables

In your React app, update API calls to use environment variables:

**`src/services/apiService.js`:**
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const getCurrentFlights = async () => {
  const response = await fetch(`${API_BASE_URL}/api/flights/current`);
  return response.json();
};

export const getFlightTrail = async (icao24) => {
  const response = await fetch(`${API_BASE_URL}/api/flights/${icao24}/trail`);
  return response.json();
};
```

**`src/services/websocketService.js`:**
```javascript
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_URL = process.env.REACT_APP_WS_URL || 'http://localhost:8080/ws-flights';

export const connectWebSocket = (onMessageCallback) => {
  const client = new Client({
    webSocketFactory: () => new SockJS(WS_URL),
    onConnect: () => {
      console.log('Connected to WebSocket');
      client.subscribe('/topic/flights', (message) => {
        onMessageCallback(JSON.parse(message.body));
      });
    },
    onStompError: (frame) => {
      console.error('WebSocket error:', frame);
    }
  });
  
  client.activate();
  return client;
};
```

**`src/components/Map/Map.jsx`** (or wherever you initialize Mapbox):
```javascript
const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

// In your component
useEffect(() => {
  const map = new mapboxgl.Map({
    container: mapContainerRef.current,
    style: 'mapbox://styles/mapbox/dark-v11',
    center: [-3.435973, 55.378051], // UK center
    zoom: 5,
    accessToken: MAPBOX_TOKEN
  });
}, []);
```

---

### Step 6: Deploy

1. Click **"Deploy"**
2. Vercel builds your React app
3. Watch build logs
4. Once complete, Vercel provides a URL like:
   ```
   https://flight-tracker-abc123.vercel.app
   ```

---

### Step 7: Update Backend CORS Settings

Now that you have your Vercel URL:

1. Go back to Railway
2. Update the `ALLOWED_ORIGINS` environment variable:
   ```
   ALLOWED_ORIGINS=https://flight-tracker-abc123.vercel.app,http://localhost:3000
   ```
3. Railway will automatically redeploy with new settings

---

### Step 8: Configure Custom Domain (Optional)

**On Vercel:**
1. Go to project **Settings** → **Domains**
2. Add your custom domain (e.g., `flighttracker.yourdomain.com`)
3. Follow Vercel's DNS configuration instructions

**Update Railway:**
- Add your custom domain to `ALLOWED_ORIGINS`

---

## PART 3: TESTING THE DEPLOYMENT

### Test Backend (Railway)

```bash
# Test REST API
curl https://your-app.up.railway.app/api/flights/current

# Check database connection
# (The API should return flight data if scheduler is working)

# Check WebSocket is accessible
# (Use a WebSocket client tool or your deployed frontend)
```

### Test Frontend (Vercel)

1. Open your Vercel URL in browser
2. Open browser console (F12)
3. Check for:
   - No CORS errors
   - WebSocket connection established
   - Map loading correctly
   - Flight data appearing

### Common Issues and Fixes

**Issue: CORS errors**
```
Access to fetch at 'https://backend.railway.app/api/flights'
from origin 'https://app.vercel.app' has been blocked by CORS policy
```
**Fix:** 
- Update `ALLOWED_ORIGINS` in Railway
- Redeploy backend
- Clear browser cache

**Issue: WebSocket not connecting**
```
WebSocket connection to 'wss://backend.railway.app/ws-flights' failed
```
**Fix:**
- Verify WebSocket URL in React env variables
- Check Railway logs for WebSocket errors
- Ensure SockJS is properly configured in Spring Boot

**Issue: Environment variables not working**
```
process.env.REACT_APP_API_URL is undefined
```
**Fix:**
- Verify variables are set in Vercel dashboard
- Redeploy frontend (Vercel only injects env vars at build time)
- Ensure variables start with `REACT_APP_`

**Issue: Database connection failed**
```
org.postgresql.util.PSQLException: Connection refused
```
**Fix:**
- Check Railway database is running
- Verify `DATABASE_URL` is set
- Check `application-prod.properties` syntax

---

## PART 4: CONTINUOUS DEPLOYMENT

### Automatic Deployments

Both Railway and Vercel support automatic deployments:

**Railway (Backend):**
- Push to `main` branch → automatic backend deployment
- Watch deployment in Railway dashboard
- Rollback if needed via Railway UI

**Vercel (Frontend):**
- Push to `main` branch → automatic frontend deployment
- Preview deployments for pull requests
- Rollback via Vercel UI

### GitHub Workflow

```
Local Development
       ↓
   git commit
       ↓
   git push origin main
       ↓
   ┌──────────────┐
   │   GitHub     │
   └──────┬───────┘
          ├───────→ Railway (auto-deploy backend)
          └───────→ Vercel (auto-deploy frontend)
```

---

## PART 5: MONITORING & LOGS

### Railway Logs

1. Go to Railway dashboard
2. Click on your service
3. Go to **"Deployments"**
4. Click on latest deployment to see logs
5. Monitor:
   - Application startup
   - OpenSky API calls
   - Database queries
   - Errors

**Useful Railway commands:**
```bash
# View logs (if Railway CLI installed)
railway logs

# Connect to database
railway connect postgres
```

### Vercel Logs

1. Go to Vercel dashboard
2. Click on your project
3. Go to **"Deployments"**
4. Click on deployment to see build logs
5. Use browser console for runtime logs

---

## PART 6: COST & LIMITS

### Railway Free Tier

- **$5 free credit** per month
- Includes PostgreSQL database
- Suitable for portfolio projects
- No credit card required initially

**Typical usage for this project:**
- Backend service: ~$3-4/month
- PostgreSQL database: ~$1-2/month
- **Total: Under $5/month** ✅

### Vercel Free Tier

- **Unlimited** deployments
- 100 GB bandwidth/month
- Custom domains included
- Perfect for portfolio projects

**This project will use:**
- ~1-5 GB bandwidth/month
- **Cost: $0** ✅

---

## PART 7: PROJECT STRUCTURE FOR DEPLOYMENT

### Backend Repository Structure

```
flight-tracker-backend/
├── src/
│   └── main/
│       ├── java/
│       └── resources/
│           ├── application.properties
│           └── application-prod.properties  ← Railway uses this
├── pom.xml
├── .gitignore
└── README.md
```

### Frontend Repository Structure

```
flight-tracker-frontend/
├── public/
├── src/
│   ├── components/
│   ├── services/
│   └── App.jsx
├── package.json
├── .env.local              ← Local development
├── .env.production         ← Not needed (use Vercel UI)
└── README.md
```

**Important `.gitignore` entries:**

Backend:
```gitignore
target/
*.log
application-local.properties
```

Frontend:
```gitignore
node_modules/
build/
.env.local
.env
```

---

## PART 8: DEPLOYMENT CHECKLIST

### Before First Deployment

**Backend:**
- [ ] Code pushed to GitHub
- [ ] `application-prod.properties` configured
- [ ] CORS configuration includes localhost
- [ ] Database entities have proper annotations
- [ ] `@Scheduled` task configured correctly
- [ ] WebSocket endpoints tested locally

**Frontend:**
- [ ] Code pushed to GitHub
- [ ] Environment variable usage implemented
- [ ] Mapbox token obtained
- [ ] Build command works locally (`npm run build`)
- [ ] API service uses `REACT_APP_API_URL`
- [ ] WebSocket uses `REACT_APP_WS_URL`

### Deployment Day

1. [ ] Deploy backend to Railway first
2. [ ] Verify backend health endpoint
3. [ ] Test database connection
4. [ ] Note Railway URL
5. [ ] Deploy frontend to Vercel
6. [ ] Add backend URL to Vercel env vars
7. [ ] Add Mapbox token to Vercel env vars
8. [ ] Deploy frontend
9. [ ] Update backend CORS with Vercel URL
10. [ ] Test full application flow

### Post-Deployment

- [ ] Monitor Railway logs for errors
- [ ] Check Vercel deployment success
- [ ] Test all features in production
- [ ] Verify WebSocket connection
- [ ] Check map rendering
- [ ] Test search and filters
- [ ] Monitor OpenSky API rate limits

---

## PART 9: UPDATING YOUR DEPLOYMENT

### Making Changes

**For Backend Changes:**
```bash
# Make changes locally
git add .
git commit -m "Updated flight data service"
git push origin main

# Railway automatically deploys in ~2-5 minutes
# Check Railway dashboard for deployment status
```

**For Frontend Changes:**
```bash
# Make changes locally
git add .
git commit -m "Updated map styling"
git push origin main

# Vercel automatically deploys in ~1-3 minutes
# Check Vercel dashboard for deployment status
```

### Environment Variable Updates

**Railway:**
1. Go to Railway dashboard
2. Click on service → Variables
3. Update or add variables
4. Service automatically redeploys

**Vercel:**
1. Go to Vercel dashboard
2. Project Settings → Environment Variables
3. Update variables
4. **Must manually redeploy** (Vercel → Deployments → Redeploy)

---

## PART 10: ALTERNATIVE: ONE REPOSITORY APPROACH

You can keep backend and frontend in one repository:

```
flight-tracker/
├── backend/
│   ├── src/
│   └── pom.xml
├── frontend/
│   ├── src/
│   └── package.json
└── README.md
```

**Railway Configuration:**
- Root directory: `/backend`
- Build command: `mvn clean install`

**Vercel Configuration:**
- Root directory: `/frontend`
- Build command: `npm run build`

Both platforms support monorepo setups.

---

## TROUBLESHOOTING GUIDE

### Backend Won't Start on Railway

**Check:**
1. Railway logs for errors
2. Java version compatibility (Railway uses Java 17 by default)
3. Database connection string
4. Port configuration (`server.port=${PORT:8080}`)

**Common fix:**
```properties
# In application-prod.properties
server.port=${PORT:8080}
spring.profiles.active=prod
```

### Frontend Build Fails on Vercel

**Check:**
1. `package.json` has correct build script
2. All dependencies are in `dependencies` not `devDependencies`
3. Node version compatibility

**Common fix:**
```json
// package.json
{
  "engines": {
    "node": "18.x"
  }
}
```

### CORS Still Blocking Requests

**Checklist:**
1. Backend has correct CORS configuration
2. Railway `ALLOWED_ORIGINS` includes exact Vercel URL
3. No trailing slashes in URLs
4. Both HTTP and HTTPS if needed
5. Backend redeployed after CORS changes

### Database Connection Issues

**Check:**
1. Railway database is running (green status)
2. `DATABASE_URL` environment variable exists
3. Connection string format is correct
4. Firewall/network rules (Railway handles this)

---

## FINAL NOTES

### For Your Ryanair Application

When including this project in your application:

**Live Demo URL:**
```
Frontend: https://flight-tracker-yourusername.vercel.app
Backend API: https://flighttracker-production-xxxx.up.railway.app/api/flights/current
GitHub: https://github.com/yourusername/flight-tracker
```

**In Your CV/Cover Letter:**
```
"Deployed full-stack flight tracking application using Railway (Spring Boot + 
PostgreSQL) and Vercel (React), demonstrating production deployment skills and 
DevOps understanding. Application processes real-time aviation data and serves 
300+ concurrent aircraft positions via WebSocket connections."
```

### Best Practices

1. **Deploy Early:** Get something live in Week 2-3, not Week 7
2. **Monitor Logs:** Check Railway and Vercel dashboards daily
3. **Test Production:** Don't assume it works like localhost
4. **Document URLs:** Keep deployment URLs in your README
5. **Git Hygiene:** Commit regularly, descriptive messages
6. **Environment Security:** Never commit API keys or tokens

---

## Quick Command Reference

### Railway CLI (Optional)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to project
railway link

# View logs
railway logs

# Open dashboard
railway open
```

### Testing Deployed APIs

```bash
# Test backend health
curl https://your-app.up.railway.app/actuator/health

# Test flight data endpoint
curl https://your-app.up.railway.app/api/flights/current

# Test from frontend
curl https://your-app.vercel.app
```

---

**You're now ready to deploy!** Start with Railway backend, then Vercel frontend. Take it step-by-step and check each stage.

Good luck! 🚀
