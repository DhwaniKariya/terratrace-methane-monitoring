# TerraTrave - Methane Leak Monitoring System

Frontend-only application for monitoring methane leaks from satellite imagery across company branch locations.

## Features

- **Home Page**: View all TerraTrave branch locations with incident counts and satellite imagery
- **Dashboard**: Interactive map showing methane leak incidents with:
  - Run Analysis button for live satellite data processing
  - Loading states showing analysis progress
  - Severity filtering (Critical/High/Medium/Low)
  - Evidence tier levels
  - Confidence ratings
  - Color-coded markers on map
- **Real-time Mock Data**: Simulates live satellite monitoring

## Setup

```bash
npm install
npm run dev
```

Visit http://localhost:5173

## Build

```bash
npm run build
```

## Tech Stack

- React + Vite
- React Router
- Leaflet (maps)
- Mock data (no backend)
