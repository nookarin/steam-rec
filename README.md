# SteamRec - Steam Game Recommendation Website

A full-stack web application that connects to the Steam Web API to display your game library and provide personalized recommendations.

## Tech Stack

| Layer     | Technology                                |
| --------- | ----------------------------------------- |
| Frontend  | HTML5, CSS3, Vanilla JavaScript (ES6+)    |
| Backend   | Node.js, Express.js                       |
| Database  | MongoDB, Mongoose                         |
| External  | Steam Web API                             |

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/) running locally (default port 27017)
- A [Steam Web API key](https://steamcommunity.com/dev/apikey)

## Setup

1. **Install root dependencies:**
   ```bash
   npm install
   ```

2. **Install server dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Configure environment:**
   Edit `.env` and set your Steam API key:
   ```
   STEAM_API_KEY=your_key_here
   ```

4. **Run in development mode:**
   ```bash
   npm run dev
   ```
   - Backend: http://localhost:3000
   - Frontend: http://localhost:8080

5. **Or run server only:**
   ```bash
   npm start
   ```
   Then open `client/index.html` directly in your browser.

## Project Structure

```
├── client/                  # Frontend
│   ├── index.html          # Entry HTML
│   ├── css/                # Stylesheets (7 files)
│   └── js/                 # JavaScript modules
│       ├── app.js          # Main application
│       ├── api.js          # Backend API client
│       ├── router.js       # Hash-based routing
│       ├── state.js        # State management
│       ├── components/     # UI components
│       └── utils/          # Utility functions
├── server/                  # Backend
│   ├── index.js            # Express entry point
│   ├── config/             # DB and Steam API config
│   ├── models/             # Mongoose schemas
│   ├── routes/             # REST API routes
│   ├── services/           # Business logic
│   └── middleware/          # Error handling, rate limiting
├── .env                    # Environment variables
└── package.json            # Root package.json
```

## API Endpoints

| Method | Endpoint                       | Description              |
| ------ | ------------------------------ | ------------------------ |
| GET    | `/api/health`                  | Health check             |
| GET    | `/api/library/:steamId`        | Fetch user's library     |
| POST   | `/api/library/:steamId/refresh`| Force refresh library    |
| GET    | `/api/library/:steamId/diff`   | Library changes          |
| GET    | `/api/recommendations/:steamId`| Get recommendations      |
| GET    | `/api/stats/:steamId`          | Playtime statistics      |
| GET    | `/api/history/:steamId`        | Library snapshot history |

## Features

- Browse your full Steam game library
- Genre-based and playtime-weighted recommendations
- Playtime statistics with charts
- Library change tracking via MongoDB snapshots
- Dark/Light theme toggle
- Responsive design (mobile, tablet, desktop)
- Client-side search and genre filtering
