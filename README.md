# Flight Tracker

Real-time flight tracking application showing live aircraft positions on an interactive map.

## Project Overview

A web application that fetches live flight data from OpenSky Network API and displays aircraft positions on a Mapbox globe. Built as a portfolio project demonstrating full-stack development capabilities.

**Timeline:** December 2024 - January 2025  
**Target:** Ryanair Graduate Programme Application  
**Deadline:** January 27, 2025

## Technology Stack

**Backend:**
- Java 21
- Spring Boot 4.0
- PostgreSQL 18
- WebSocket (STOMP)
- Maven

**Frontend:**
- React 18
- Mapbox GL JS
- Axios
- JavaScript ES6+

**APIs:**
- OpenSky Network (flight data)
- Mapbox (map visualization)

## Features Implemented

### Backend (Complete)
- REST API endpoints for flight data
- Automatic data fetching every 3 minutes
- Database storage with duplicate prevention
- WebSocket real-time notifications
- Data cleanup (removes old records)
- Error handling and retry logic
- Admin control endpoints

### Frontend (In Progress)
- Interactive 3D globe map
- Backend connection
- Live status indicator
- Responsive design
- Terminal-inspired UI theme

## Project Structure
```
FlightTracker/
├── backend/                    # Spring Boot application
│   ├── src/main/java/
│   │   └── com/david/flight/tracker/
│   │       ├── controller/     # REST endpoints
│   │       ├── service/        # Business logic
│   │       ├── repository/     # Database access
│   │       ├── model/          # Data entities
│   │       ├── dto/            # Data transfer objects
│   │       └── config/         # Configuration
│   └── pom.xml
│
└── frontend/                   # React application
    ├── src/
    │   ├── components/         # React components
    │   ├── services/           # API integration
    │   ├── App.js
    │   └── index.js
    └── package.json
```

## Database Schema

**Table: flight_states**
- Stores aircraft position snapshots
- Tracks altitude, speed, heading, coordinates
- Indexed by aircraft ID and timestamp
- Automatic cleanup of old data

## Setup Instructions

### Prerequisites
- Java 21
- Node.js 18+
- PostgreSQL 18
- Mapbox account (free tier)
- OpenSky Network account (free)

### Backend Setup

1. Install PostgreSQL and create database:
```bash
createdb -p 5433 flighttracker
```

2. Configure secrets in `backend/src/main/resources/application-local.properties`:
```properties
spring.datasource.password=your_password
```

3. Run backend:
```bash
cd backend
mvn spring-boot:run
```

Backend runs on port 8080.

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Configure environment in `frontend/.env.local`:
```
REACT_APP_MAPBOX_TOKEN=your_mapbox_token
REACT_APP_API_URL=http://localhost:8080
REACT_APP_WS_URL=http://localhost:8080/ws-flights
```

3. Run frontend:
```bash
npm start
```

Frontend runs on port 3000.

## API Endpoints

### Flight Data
- `GET /api/flights/current` - Current flight positions
- `GET /api/flights/stats` - Database statistics
- `GET /api/flights/{icao24}/trail` - Flight trail history
- `GET /api/flights/search?callsign=XXX` - Search by flight number

### Admin
- `POST /api/admin/fetch-now` - Manual data fetch
- `POST /api/admin/cleanup` - Manual cleanup
- `GET /api/admin/health` - System health check
- `GET /api/admin/websocket-stats` - WebSocket statistics

### Testing
- `GET /api/test/fetch-flights` - Trigger fetch
- `GET /api/test/count` - Record count
- `POST /api/test/clear` - Clear database

## Current Status

**Completed:**
- Backend API with automatic scheduling
- Database with upsert logic
- WebSocket real-time broadcasting
- React app with Mapbox integration
- Backend-frontend connection established
- Live data fetching (17,000+ flights)

**Next Steps:**
- Display flights as markers on map
- Click interactions for flight details
- Real-time map updates via WebSocket
- Search and filter functionality
- Flight trail visualization
- UI polish and styling

## Development Timeline

**Week 1-2:** Backend development (Complete)  
**Week 3:** Frontend development (In Progress)  
**Week 4:** Features and interactions  
**Week 5-6:** Polish and deployment  
**Week 7:** Documentation and submission

## Running the Application

1. Start PostgreSQL (port 5433)
2. Start backend: `cd backend && mvn spring-boot:run`
3. Start frontend: `cd frontend && npm start`
4. Open browser to `http://localhost:3000`

## Configuration

**Backend Port:** 8080  
**Frontend Port:** 3000  
**Database Port:** 5433  
**Fetch Interval:** 3 minutes  
**Data Retention:** 24 hours  
**API Rate Limit:** 400 calls/day (OpenSky)

## Security

- Secrets stored in `.gitignore`d files
- Environment variables for production
- CORS configured for localhost
- No sensitive data in repository

## Author

David Kirkpatrick  
MSc Software Development, Queen's University Belfast  
Portfolio project for Ryanair Graduate Programme application

## License

Personal portfolio project - not for commercial use.
@author - David Kirkpatrick
