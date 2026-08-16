# Architecture

## Overview

One for All is a monorepo with two deployable apps:

- **`client`** — Next.js App Router SPA/SSR hybrid UI
- **`server`** — Express REST API + Socket.io realtime layer on MongoDB

```
Browser ──► Next.js (:3000) ──REST/JWT──► Express (:5000) ──► MongoDB
                │                              │
                └──────── Socket.io ───────────┘
                                           Cloudinary (optional)
```

## Backend layers

1. **Routes** — HTTP surface under `/api/*`
2. **Controllers** — business logic
3. **Models** — Mongoose schemas (`users`, `communities`, `posts`, …)
4. **Middleware** — auth, validation, rate limits, uploads, roles
5. **Sockets** — chat rooms, typing, online presence, live notifications
6. **Utils** — JWT, email, gamification, moderation heuristics

## Frontend layers

1. **App routes** — landing, auth group, authenticated shell
2. **Providers** — theme, React Query, auth bootstrap, socket
3. **Stores** — Zustand for auth/UI
4. **API client** — Axios with credentials + Bearer fallback
5. **Feature components** — feed, communities, chat, events, marketplace

## Auth flow

1. Register/login → API sets httpOnly cookies + returns `accessToken`
2. Client stores token in `localStorage` as fallback
3. Protected `(app)` layout redirects to `/login` when unauthenticated
4. Socket.io authenticates via JWT in the handshake

## Scaling notes

- Cursor/page pagination on feeds and lists
- Stateless JWT APIs (horizontal scale behind a load balancer)
- Sticky sessions or Redis adapter recommended for multi-instance Socket.io
- Cloudinary offloads media bandwidth
- AI routes are heuristic-first; swap in OpenAI via `OPENAI_API_KEY`
