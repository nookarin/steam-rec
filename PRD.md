# Product Requirement Document (PRD)

## Steam Game Recommendation Website

| Field              | Detail                                      |
| ------------------ | ------------------------------------------- |
| **Project Name**   | SteamRec — Steam Game Recommendation Engine |
| **Version**        | 1.0                                         |
| **Date Created**   | 2026-07-13                                  |
| **Author**         | JSD13 Team                                  |
| **Status**         | Draft                                       |

---

## Table of Contents

1. [Overview](#1-overview)
2. [Goals & Objectives](#2-goals--objectives)
3. [Target Users](#3-target-users)
4. [System Architecture](#4-system-architecture)
5. [Technology Stack](#5-technology-stack)
6. [Feature Requirements](#6-feature-requirements)
7. [API Design](#7-api-design)
8. [Data Model](#8-data-model)
9. [UI/UX Requirements](#9-uiux-requirements)
10. [CSS & JavaScript Requirements](#10-css--javascript-requirements)
11. [Backend Requirements](#11-backend-requirements)
12. [Non-Functional Requirements](#12-non-functional-requirements)
13. [Milestones & Timeline](#13-milestones--timeline)
14. [Risks & Mitigations](#14-risks--mitigations)
15. [Appendix](#15-appendix)

---

## 1. Overview

**SteamRec** is a web-based application that connects to the Steam Web API to retrieve a user's game library, analyzes playtime and genre preferences, and provides personalized game recommendations. Library history is persisted in MongoDB for trend analysis and improved recommendations over time.

### Problem Statement

Steam users with large libraries often struggle to decide what to play next. While Steam's built-in discovery queue is useful, it doesn't account for a user's actual play history, genre affinity, or playtime patterns. SteamRec solves this by pulling real library data and generating tailored recommendations.

### Solution

A full-stack web application with:
- A **frontend** built with HTML, CSS, and JavaScript that displays the user's library and recommendations
- A **backend** (Node.js/Express) that proxies Steam API calls, runs recommendation logic, and manages data
- A **MongoDB** database that persists library snapshots and recommendation history

---

## 2. Goals & Objectives

| #  | Goal                                                              | Success Metric                                  |
| -- | ----------------------------------------------------------------- | ----------------------------------------------- |
| G1 | Allow users to view their Steam library in a browsable interface  | Library loads and displays within 3 seconds      |
| G2 | Generate genre-based and playtime-based recommendations           | Recommendations shown within 2 seconds           |
| G3 | Persist library history in MongoDB for trend analysis             | Library snapshots saved on each fetch            |
| G4 | Demonstrate CSS, JavaScript, and HTML in a real-world application | All three technologies used meaningfully         |
| G5 | Implement full frontend-backend separation with API calls         | Frontend and backend run as independent processes |

---

## 3. Target Users

- **Primary**: Steam gamers (18-35) who own 20+ games and want better discovery
- **Secondary**: Students learning full-stack web development (educational project)

### User Stories

| ID   | As a...         | I want to...                                    | So that...                                  |
| ---- | --------------- | ----------------------------------------------- | ------------------------------------------- |
| US-1 | Steam user      | Enter my Steam ID and see my game library       | I can browse all my games in one place      |
| US-2 | Steam user      | Get personalized game recommendations           | I can find my next game to play             |
| US-3 | Steam user      | See my most-played genres and playtime stats    | I understand my gaming preferences          |
| US-4 | Steam user      | View my recommendation history                  | I can track suggestions over time           |
| US-5 | Steam user      | Filter and sort my library                      | I can quickly find specific games           |
| US-6 | Returning user  | See how my library has changed since last visit | I can discover newly added games            |

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                  │
│  ┌───────────┐  ┌────────────┐  ┌────────────────┐  │
│  │   HTML    │  │    CSS     │  │  JavaScript    │  │
│  │ Structure │  │  Styling   │  │  (Fetch API)   │  │
│  └───────────┘  └────────────┘  └───────┬────────┘  │
└─────────────────────────────────────────┼───────────┘
                                          │ HTTP/REST
                                          ▼
┌─────────────────────────────────────────────────────┐
│              BACKEND SERVER (Node.js + Express)      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │  REST API    │  │ Recommendation│  │  Steam    │  │
│  │  Routes      │  │   Engine      │  │  API      │  │
│  └──────┬───────┘  └──────┬───────┘  │  Client   │  │
│         │                 │          └─────┬─────┘  │
│         ▼                 ▼                ▼        │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │   MongoDB    │  │   Steam Web  │  │  Steam    │  │
│  │   Mongoose   │  │   API v2     │  │  Store    │  │
│  └──────────────┘  └──────────────┘  └───────────┘  │
└─────────────────────────────────────────────────────┘
```

### Communication Flow

1. User enters Steam ID on the frontend
2. JavaScript `fetch()` calls the backend REST API
3. Backend checks MongoDB for recent library snapshot
4. If stale or missing, backend calls Steam Web API (`IPlayerService/GetOwnedGames`)
5. Backend stores/updates library in MongoDB
6. Backend runs recommendation algorithm
7. Response returned to frontend
8. JavaScript dynamically renders results

---

## 5. Technology Stack

| Layer      | Technology            | Purpose                                |
| ---------- | --------------------- | -------------------------------------- |
| Frontend   | **HTML5**             | Semantic page structure                |
| Frontend   | **CSS3**              | Responsive styling, animations, layout |
| Frontend   | **Vanilla JavaScript**| DOM manipulation, API calls, routing   |
| Backend    | **Node.js**           | JavaScript runtime                     |
| Backend    | **Express.js**        | HTTP server and REST API framework     |
| Database   | **MongoDB**           | Document storage for library history   |
| ODM        | **Mongoose**          | MongoDB schema modeling and queries    |
| External   | **Steam Web API**     | Game and library data                  |
| DevOps     | **nodemon**           | Auto-restart during development        |

---

## 6. Feature Requirements

### 6.1 Core Features (MVP)

| Feature                  | Priority | Description                                                    |
| ------------------------ | -------- | -------------------------------------------------------------- |
| Steam ID Lookup          | P0       | User enters Steam ID; app fetches public profile and library   |
| Library Display          | P0       | Grid view of all owned games with cover art, title, playtime   |
| Playtime Analytics       | P1       | Charts/visualizations of hours played by genre                 |
| Recommendation Engine    | P0       | Suggests games based on genre affinity and underplayed titles  |
| Library History Save     | P0       | Full library snapshot saved to MongoDB on each refresh         |
| History Comparison       | P1       | Shows newly added/removed games between snapshots             |

### 6.2 Enhanced Features (v1.1)

| Feature                  | Priority | Description                                                    |
| ------------------------ | -------- | -------------------------------------------------------------- |
| Genre Filtering          | P2       | Filter library by genre, playtime range, last played           |
| Search                   | P2       | Client-side search across game titles                          |
| Sort Options             | P2       | Sort by name, playtime, recent acquisition, rating             |
| Dark/Light Theme Toggle  | P2       | CSS-based theme switcher using custom properties                |
| Recommendation History   | P1       | Log of past recommendations with "played" / "skipped" status  |
| Multi-user Support       | P3       | Multiple Steam IDs saved with localStorage                     |

### 6.3 Future Features (v2.0)

| Feature                  | Priority | Description                                                    |
| ------------------------ | -------- | -------------------------------------------------------------- |
| Social Comparison        | P3       | Compare libraries with friends                                |
| Wishlist Integration     | P3       | Cross-reference recommendations with Steam wishlist            |
| Machine Learning Engine  | P3       | Collaborative filtering using user similarity                   |
| User Accounts            | P3       | Full auth with login/signup                                    |

---

## 7. API Design

### 7.1 Backend REST API

| Method | Endpoint                      | Description                           | Request Body / Query               | Response                          |
| ------ | ----------------------------- | ------------------------------------- | ---------------------------------- | --------------------------------- |
| GET    | `/api/library/:steamId`       | Fetch user's full Steam library       | —                                  | `{ games: [...], total, fetchedAt }` |
| GET    | `/api/library/:steamId/diff`  | Get library changes since last save   | —                                  | `{ added: [], removed: [], snapshotDate }` |
| GET    | `/api/recommendations/:steamId`| Get personalized recommendations     | `?count=10&genre=action`           | `{ recommendations: [...] }`      |
| GET    | `/api/stats/:steamId`         | Get playtime statistics by genre      | —                                  | `{ genres: [...], totalHours }`   |
| GET    | `/api/history/:steamId`       | Get saved library snapshots           | `?limit=5`                         | `{ snapshots: [...] }`            |
| POST   | `/api/library/:steamId/refresh`| Force refresh library from Steam     | —                                  | `{ games: [...], snapshotId }`    |
| GET    | `/api/health`                 | Health check                          | —                                  | `{ status: "ok", uptime }`        |

### 7.2 External Steam Web API Endpoints Used

| Endpoint                              | Purpose                              |
| ------------------------------------- | ------------------------------------ |
| `IPlayerService/GetOwnedGames`       | Retrieve list of owned games         |
| `IPlayerService/GetRecentlyPlayedGames` | Recently played games              |
| `ISteamUser/GetPlayerSummaries`      | Player profile info (avatar, name)   |
| `ISteamUser/ResolveVanityURL`        | Convert custom URL to Steam ID       |
| `IStoreService/GetAppList`           | Game metadata (name, type)           |

### 7.3 API Response Example

```json
GET /api/recommendations/76561198012345678?count=5

{
  "steamId": "76561198012345678",
  "playerName": "GameMaster42",
  "recommendations": [
    {
      "appId": 1245620,
      "name": "Elden Ring",
      "headerImage": "https://cdn.akamai.steamstatic.com/steam/apps/1245620/header.jpg",
      "genres": ["Action", "RPG"],
      "reason": "You have played 120 hours in similar RPGs but haven't tried this title.",
      "matchScore": 94
    }
  ],
  "algorithm": "genre-affinity + playtime-weighted",
  "generatedAt": "2026-07-13T10:30:00Z"
}
```

---

## 8. Data Model

### 8.1 MongoDB Collections

#### `libraries` Collection

```javascript
{
  _id: ObjectId,
  steamId: String,          // Steam 64-bit ID (indexed, unique per snapshot)
  playerName: String,
  avatarUrl: String,
  games: [
    {
      appId: Number,        // Steam App ID
      name: String,
      playtimeForever: Number,  // Minutes
      playtime2Weeks: Number,
      imgIconUrl: String,
      headerImage: String,
      genres: [String],
      tags: [String]
    }
  ],
  totalGames: Number,
  totalPlaytimeMinutes: Number,
  fetchedAt: Date,
  createdAt: { type: Date, default: Date.now }
}
```

#### `snapshots` Collection

```javascript
{
  _id: ObjectId,
  steamId: String,           // Indexed
  snapshotDate: Date,
  games: [                   // Full game list at this point in time
    {
      appId: Number,
      name: String,
      playtimeForever: Number
    }
  ],
  addedGames: [              // Games present now but not in previous snapshot
    { appId: Number, name: String }
  ],
  removedGames: [            // Games in previous snapshot but not now
    { appId: Number, name: String }
  ],
  previousSnapshotId: ObjectId,
  createdAt: { type: Date, default: Date.now }
}
```

#### `recommendations` Collection

```javascript
{
  _id: ObjectId,
  steamId: String,           // Indexed
  recommendedGames: [
    {
      appId: Number,
      name: String,
      genres: [String],
      matchScore: Number,    // 0-100
      reason: String,
      status: String,        // "pending" | "played" | "skipped"
      recommendedAt: Date
    }
  ],
  algorithmVersion: String,
  generatedAt: Date,
  createdAt: { type: Date, default: Date.now }
}
```

#### `playerProfiles` Collection

```javascript
{
  _id: ObjectId,
  steamId: String,           // Unique index
  playerName: String,
  avatarUrl: String,
  profileUrl: String,
  lastSyncedAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### 8.2 Indexes

| Collection       | Index             | Type    | Purpose                      |
| ---------------- | ----------------- | ------- | ---------------------------- |
| libraries        | `steamId`         | Single  | Fast lookup per user         |
| libraries        | `fetchedAt`       | Single  | Find latest snapshot         |
| snapshots        | `steamId + snapshotDate` | Compound | Chronological history |
| recommendations  | `steamId`         | Single  | Per-user recommendations     |
| playerProfiles   | `steamId`         | Unique  | Prevent duplicate profiles   |

---

## 9. UI/UX Requirements

### 9.1 Page Structure

```
index.html
├── <header>          — Logo, navigation, theme toggle
├── <main>
│   ├── #hero         — Steam ID input form, call-to-action
│   ├── #library      — Game grid (cover art, title, playtime)
│   ├── #recommendations — Recommended games carousel/grid
│   ├── #stats        — Playtime charts and genre breakdown
│   └── #history      — Library change log between snapshots
├── <footer>          — Credits, links, Steam API attribution
```

### 9.2 Responsive Breakpoints

| Breakpoint     | Width         | Layout                                |
| -------------- | ------------- | ------------------------------------- |
| Mobile         | < 640px       | Single column, stacked cards          |
| Tablet         | 640-1024px    | 2-column grid                         |
| Desktop        | > 1024px      | 3-4 column grid, sidebar for stats    |
| Large Desktop  | > 1440px      | Max-width container, 5-column grid    |

### 9.3 Component Descriptions

#### Steam ID Input Form
- Prominent input field with Steam logo
- "Load Library" primary button
- Loading spinner animation during fetch
- Error message display for invalid IDs

#### Game Card
- Steam header image (460x215px)
- Game title (truncated to 2 lines)
- Playtime badge (hours/minutes)
- Genre tags (colored pills)
- Hover effect: scale up, show tooltip with details

#### Recommendation Card
- Same layout as Game Card
- Additional match score indicator (0-100%)
- "Why this game?" tooltip with recommendation reason
- "Played It" / "Skip" action buttons

#### Stats Dashboard
- Donut chart for genre distribution (pure CSS or canvas)
- Horizontal bar chart for top 10 most-played games
- Summary cards: Total Games, Total Hours, Average Hours/Game

---

## 10. CSS & JavaScript Requirements

### 10.1 CSS Requirements

| Requirement                           | Implementation                                              |
| ------------------------------------- | ----------------------------------------------------------- |
| **Semantic HTML5 structure**          | `<header>`, `<main>`, `<section>`, `<footer>`, `<nav>`     |
| **CSS Grid for game library layout**  | `display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));` |
| **Flexbox for component alignment**   | Navigation, cards, stats bars                               |
| **CSS Custom Properties (variables)** | Color palette, spacing, fonts defined in `:root`            |
| **Responsive design**                 | `@media` queries for mobile, tablet, desktop                |
| **CSS Animations**                    | `@keyframes` for loading spinner, card hover, fade-in       |
| **Transitions**                       | Smooth hover effects, theme toggle transitions               |
| **CSS-only charts** (optional)        | Donut charts using `conic-gradient`                         |
| **Theme support**                     | Dark/light mode via `[data-theme]` attribute selector        |
| **Accessibility**                     | Focus styles, ARIA labels, `prefers-reduced-motion`         |
| **BEM naming convention**             | `.block__element--modifier` pattern                         |

#### CSS File Structure

```
css/
├── variables.css        — CSS custom properties (colors, spacing, fonts)
├── reset.css            — Normalize/reset browser defaults
├── layout.css           — Grid system, containers, responsive breakpoints
├── components.css       — Cards, buttons, forms, badges, modals
├── animations.css       — Keyframes, transitions, hover effects
├── themes.css           — Dark/light mode styles
└── utilities.css        — Helper classes (text, spacing, visibility)
```

### 10.2 JavaScript Requirements

| Requirement                           | Implementation                                              |
| ------------------------------------- | ----------------------------------------------------------- |
| **Fetch API for backend calls**       | `fetch('/api/library/:steamId')` with async/await           |
| **DOM manipulation**                  | Dynamic rendering of game cards, stats, recommendations     |
| **Event delegation**                  | Attach handlers to parent containers for dynamic content    |
| **Client-side routing**               | Hash-based routing (`#library`, `#recommendations`, `#stats`) |
| **Local storage**                     | Cache Steam ID, theme preference, recent searches           |
| **Error handling**                    | Try/catch with user-friendly error messages                 |
| **Loading states**                    | Spinner/skeleton UI while API calls are in progress         |
| **Input validation**                  | Validate Steam ID format (17-digit number) before sending   |
| **Debounced search**                  | Prevent excessive filtering on keystroke                    |
| **Accessibility (JS)**                | Keyboard navigation, screen reader announcements            |
| **ES6+ modules**                      | Code organized into separate module files                   |
| **No frameworks**                     | Vanilla JavaScript only (educational requirement)           |

#### JavaScript File Structure

```
js/
├── app.js              — Main entry point, router initialization
├── api.js              — Backend API client (all fetch calls)
├── router.js           — Hash-based client-side routing
├── components/
│   ├── gameCard.js     — Game card rendering
│   ├── statsChart.js   — Stats visualization
│   ├── recommendCard.js— Recommendation card rendering
│   ├── searchBar.js    — Search and filter logic
│   └── themeToggle.js  — Dark/light mode switcher
├── utils/
│   ├── storage.js      — localStorage wrapper
│   ├── format.js       — Time formatting, number formatting
│   └── validate.js     — Input validation helpers
└── state.js            — Simple global state management
```

---

## 11. Backend Requirements

### 11.1 Server Structure

```
server/
├── index.js                — Express app entry point
├── config/
│   ├── db.js               — MongoDB connection (Mongoose)
│   └── steam.js            — Steam API configuration (base URL, key)
├── models/
│   ├── Library.js           — Mongoose schema for libraries
│   ├── Snapshot.js          — Mongoose schema for snapshots
│   ├── Recommendation.js    — Mongoose schema for recommendations
│   └── PlayerProfile.js     — Mongoose schema for profiles
├── routes/
│   ├── libraryRoutes.js     — GET/POST library endpoints
│   ├── recommendRoutes.js   — Recommendation endpoints
│   ├── statsRoutes.js       — Statistics endpoints
│   └── historyRoutes.js     — History/snapshot endpoints
├── services/
│   ├── steamService.js      — Steam Web API wrapper
│   ├── recommendService.js  — Recommendation algorithm
│   └── snapshotService.js   — Snapshot diff logic
├── middleware/
│   ├── errorHandler.js      — Global error handling
│   └── rateLimiter.js       — API rate limiting
└── package.json
```

### 11.2 Steam API Integration

```javascript
// services/steamService.js (pseudocode)
const STEAM_API_BASE = 'https://api.steampowered.com';
const STEAM_STORE_API = 'https://store.steampowered.com/api';

class SteamService {
  // Fetch owned games
  async getOwnedGames(steamId) {
    const url = `${STEAM_API_BASE}/IPlayerService/GetOwnedGames/v1/`;
    const params = { key: API_KEY, steamid: steamId, include_appinfo: 1, include_played_free_games: 1 };
    // Make request, return formatted game list
  }

  // Fetch player profile
  async getPlayerSummary(steamId) {
    const url = `${STEAM_API_BASE}/ISteamUser/GetPlayerSummaries/v2/`;
    // Make request, return profile data
  }

  // Resolve vanity URL to numeric Steam ID
  async resolveVanityUrl(vanityUrl) {
    const url = `${STEAM_API_BASE}/ISteamUser/ResolveVanityURL/v1/`;
    // Make request, return steamId
  }
}
```

### 11.3 Recommendation Algorithm

```
ALGORITHM: Genre-Affinity Weighted Recommendation

1. CATALOG the user's library:
   - Total games, played games (playtime > 0), unplayed games
   - For each game, map to genres

2. COMPUTE genre affinity scores:
   - For each genre G:
     affinity(G) = Σ(playtime for games in G) / total_playtime
   - Sort genres by affinity descending

3. IDENTIFY underplayed gems:
   - Games with playtime < 1 hour in high-affinity genres
   - These get a bonus score

4. COMPUTE match score for each unplayed/underplayed game:
   - matchScore = (genre_affinity_weight × 50) + (rating_weight × 30) + (recency_weight × 20)

5. RANK and return top N games sorted by matchScore

6. GENERATE human-readable reason for each recommendation:
   - "You've played X hours in [genre] games but haven't tried this title."
```

### 11.4 MongoDB Connection

```javascript
// config/db.js (pseudocode)
const mongoose = require('mongoose');

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/steamrec');
  console.log(`MongoDB connected: ${conn.connection.host}`);
};
```

### 11.5 Environment Variables

```env
# .env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/steamrec
STEAM_API_KEY=your_steam_api_key_here
NODE_ENV=development
```

---

## 12. Non-Functional Requirements

| Category          | Requirement                                                        |
| ----------------- | ------------------------------------------------------------------ |
| **Performance**   | Library loads in < 3 seconds; recommendations in < 2 seconds       |
| **Scalability**   | Support 100+ concurrent users (single server)                     |
| **Security**      | Steam API key stored in env variables, never exposed to frontend   |
| **Security**      | Rate limiting on backend endpoints (60 req/min per IP)             |
| **Security**      | Input sanitization on all API parameters                           |
| **Reliability**   | Graceful error handling for Steam API downtime                     |
| **Caching**       | Library cached in MongoDB for 1 hour to reduce Steam API calls     |
| **Compatibility** | Modern browsers: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+     |
| **Accessibility** | WCAG 2.1 AA compliance for color contrast and keyboard navigation  |
| **SEO**           | Semantic HTML with proper `<title>`, `<meta>`, and `<alt>` tags   |
| **Code Quality**  | ESLint for JS, Stylelint for CSS, consistent code style            |

---

## 13. Milestones & Timeline

| Phase | Milestone                                | Deliverables                                       | Duration |
| ----- | ---------------------------------------- | -------------------------------------------------- | -------- |
| 1     | **Project Setup**                        | Repo init, folder structure, env config, MongoDB   | Day 1    |
| 2     | **Backend API**                          | Steam API integration, REST routes, Mongoose models | Day 2-3  |
| 3     | **Frontend Structure**                   | HTML pages, CSS styling, responsive layout         | Day 3-4  |
| 4     | **Frontend Logic**                       | JavaScript fetch calls, DOM rendering, routing     | Day 4-5  |
| 5     | **Recommendation Engine**                | Algorithm implementation, testing with sample data | Day 5-6  |
| 6     | **MongoDB History**                      | Snapshot saving, diff calculation, history views   | Day 6    |
| 7     | **Polish & Testing**                     | Error handling, loading states, cross-browser test | Day 7    |
| 8     | **Documentation & Presentation**         | README, code comments, demo preparation            | Day 7    |

---

## 14. Risks & Mitigations

| Risk                                        | Likelihood | Impact | Mitigation                                         |
| ------------------------------------------- | ---------- | ------ | -------------------------------------------------- |
| Steam API rate limiting (100K/day)         | Medium     | High   | Cache library in MongoDB for 1 hour                |
| Steam API key exposure                      | Low        | High   | Store in `.env`, add `.env` to `.gitignore`        |
| Steam privacy settings blocking API access  | High       | Medium | Graceful error message explaining public profile   |
| Large library slowing rendering             | Medium     | Medium | Virtual scrolling or pagination for 500+ games     |
| MongoDB connection failures                 | Low        | High   | Retry logic, in-memory fallback for dev            |
| Recommendation quality                      | Medium     | Medium | Start with simple genre-affinity, iterate later    |

---

## 15. Appendix

### 15.1 Steam Web API Reference

- Documentation: https://developer.valvesoftware.com/wiki/Steam_Web_API
- `IPlayerService/GetOwnedGames`: https://developer.valvesoftware.com/wiki/Steam_Web_API#IPlayerService_2
- API key registration: https://steamcommunity.com/dev/apikey

### 15.2 Project Directory Structure

```
steamrec/
├── client/                    # FRONTEND
│   ├── index.html
│   ├── css/
│   │   ├── variables.css
│   │   ├── reset.css
│   │   ├── layout.css
│   │   ├── components.css
│   │   ├── animations.css
│   │   ├── themes.css
│   │   └── utilities.css
│   ├── js/
│   │   ├── app.js
│   │   ├── api.js
│   │   ├── router.js
│   │   ├── state.js
│   │   ├── components/
│   │   │   ├── gameCard.js
│   │   │   ├── statsChart.js
│   │   │   ├── recommendCard.js
│   │   │   ├── searchBar.js
│   │   │   └── themeToggle.js
│   │   └── utils/
│   │       ├── storage.js
│   │       ├── format.js
│   │       └── validate.js
│   └── assets/
│       └── images/
├── server/                    # BACKEND
│   ├── index.js
│   ├── config/
│   │   ├── db.js
│   │   └── steam.js
│   ├── models/
│   │   ├── Library.js
│   │   ├── Snapshot.js
│   │   ├── Recommendation.js
│   │   └── PlayerProfile.js
│   ├── routes/
│   │   ├── libraryRoutes.js
│   │   ├── recommendRoutes.js
│   │   ├── statsRoutes.js
│   │   └── historyRoutes.js
│   ├── services/
│   │   ├── steamService.js
│   │   ├── recommendService.js
│   │   └── snapshotService.js
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   └── rateLimiter.js
│   └── package.json
├── .env                       # Environment variables (NOT committed)
├── .gitignore
├── package.json               # Root package.json (scripts)
├── README.md
└── PRD.md                     # This document
```

### 15.3 Sample Steam ID for Testing

- Gabe Newell: `76561197960287930`
- Public profile required for API access

### 15.4 Key CSS Patterns to Implement

| Pattern              | Usage                                    | Example                                  |
| -------------------- | ---------------------------------------- | ---------------------------------------- |
| CSS Grid             | Game library layout                      | `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))` |
| Flexbox              | Card internals, nav, stats              | `display: flex; align-items: center;`    |
| CSS Variables        | Theme colors                             | `--color-primary: #66c0f4;`              |
| Conic Gradient       | Donut chart                              | `background: conic-gradient(...)`        |
| `@keyframes`         | Loading spinner, fade-in                | `animation: fadeIn 0.3s ease-in;`        |
| `clamp()`            | Responsive typography                    | `font-size: clamp(1rem, 2vw, 1.5rem);`  |
| `scroll-snap`        | Recommendation carousel                  | `scroll-snap-type: x mandatory;`         |
| `::before/::after`   | Decorative elements, badges             | Playtime badge overlay                   |

### 15.5 Key JavaScript Patterns to Implement

| Pattern               | Usage                                      | Example                                  |
| --------------------- | ------------------------------------------ | ---------------------------------------- |
| `async/await`         | All API calls                              | `const data = await fetch('/api/...')`   |
| Event delegation      | Game card interactions                     | `container.addEventListener('click', e => ...)` |
| Template literals     | HTML generation                            | `` `<div class="card">${name}</div>` ``  |
| `localStorage`        | Persist Steam ID, theme                    | `localStorage.setItem('steamId', id)`    |
| `IntersectionObserver`| Lazy loading images                        | Load game covers on scroll               |
| `AbortController`     | Cancel stale fetch requests                | Prevent race conditions on rapid search  |
| Debounce              | Search input                              | `setTimeout` with 300ms delay            |
| ES6 Modules           | Code organization                          | `export/import` between files            |

---

*End of Document*
