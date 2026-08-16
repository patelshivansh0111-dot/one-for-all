# One for All

**Ask people who've been there.**

A community platform for human experience — not another social feed. When you don't know what to do, you shouldn't have to figure it out alone.

> **Everyone knows something. Someone needs to know it.**

Core loop: **Ask → Match → Learn → Grow → Give back**

---

## Product

People ask real questions about careers, business, sports, education, money, and life. AI helps surface people who may have relevant experience. Those people choose whether to help. Reputation is built on **people helped**, not followers.

MVP focuses on:

1. Auth  
2. Profiles (experience & contribution)  
3. Ask questions (including anonymously)  
4. Question feed & answers  
5. Communities  
6. Search  
7. AI people matching  
8. Reputation  
9. Basic moderation  

Not in MVP: marketplace, messaging scale-up, events, payments, voice/video.

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js, React, TypeScript, Tailwind, Framer Motion |
| Backend | Express, MongoDB, JWT, Google OAuth |
| AI | Heuristic matching (OpenAI-ready) |

---

## Design

Editorial premium aesthetic:

- Warm off-white `#F5F0E8`
- Black borders `#111111`
- Instrument Serif headlines
- Manrope body
- IBM Plex Mono labels
- Accents: yellow, blue, pink, mint as stickers/CTAs

---

## Run locally

```bash
cd "The Community"
npm install
npm run install:all

# Requires MongoDB for full API
npm run dev
```

- Web: http://localhost:3000  
- API: http://localhost:5000/api/health  

Env files: `server/.env`, `client/.env.local` (see `*.example`).

Without MongoDB, the **landing page and UI with demo fallbacks** still work; auth/API features need a database.

---

## Key routes

| Path | Purpose |
|------|---------|
| `/` | Editorial landing |
| `/ask` | Ask + AI people matching |
| `/home` | Question feed |
| `/explore` | Trending & discovery |
| `/people` | Experience directory |
| `/communities` | Topic communities |
| `/questions/[id]` | Answers thread |
| `/u/[username]` | Reputation-first profile |

---

## API (MVP)

- `/api/auth/*` — register, login, Google, verify, reset  
- `/api/questions/*` — feed, create, helpful, save, report  
- `/api/answers/*` — create, list, helpful  
- `/api/ai/match-people` — recommend people who may help  
- `/api/ai/analyze-question` — tags/category suggestions  
- `/api/communities/*`, `/api/search`, `/api/users/*`

---

## Brand

- Primary: Ask people who've been there.  
- Philosophy: Ask. Learn. Grow. Give back.  
- Vision: The search engine for human experience.
