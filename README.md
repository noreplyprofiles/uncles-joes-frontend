# Uncle Joe's Coffee Company

A single-page React app for Uncle Joe's Coffee Company. Browse the menu, find store locations, and manage your Coffee Club membership and rewards.

## Features

- **Home** — Hero section with brand messaging and quick-access navigation
- **Menu** — Full menu with search and category filters, including sizing, calories, and pricing
- **Locations** — Store locator with real-time open/closed status, hours, and amenities (WiFi, Drive-Thru, DoorDash)
- **Coffee Club Login** — Member authentication with session persistence
- **Dashboard** — Rewards points balance, order history, and points breakdown per order

## Tech Stack

| | |
|---|---|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS 4 |
| Animations | Framer Motion (motion) |
| Icons | Lucide React |
| AI | Google Gemini API (@google/genai) |

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install dependencies

```bash
npm install
```

### Environment setup

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google Generative AI API key (required) |
| `APP_URL` | Application URL — auto-injected by AI Studio |

### Run the dev server

```bash
npm run dev
```

Opens at `http://localhost:3000`

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | TypeScript type check |
| `npm run clean` | Remove `/dist` |

## API

Connects to a backend hosted on Google Cloud Run:

```
https://uncles-joes-api-697166575778.us-central1.run.app
```

| Endpoint | Description |
|---|---|
| `GET /menu` | Menu items |
| `GET /locations` | Store locations |
| `POST /login` | Member authentication |
| `GET /members/:id/orders` | Order history |
| `GET /members/:id/points` | Points balance |
| `GET /members/:id/points/history` | Points breakdown |
