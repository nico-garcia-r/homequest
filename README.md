# ⚜️ HomeQuest

> **Turn any goal into an adventure.** HomeQuest is a gamified quest tracker wrapped in a medieval theme — built for individuals and small groups who want to make habit-building, chores, fitness, study, or any repeatable goal feel less like a to-do list and more like a campaign.

---

## What is it?

HomeQuest lets you define **quests** — tasks you want to accomplish — and rewards completing them with **gold (points)**. Gold can be spent on **treasures** (custom rewards you define). Consistent completion of recurring quests builds **streaks**, and hitting milestones unlocks **honours** (achievements).

It works equally well solo or shared with a group. A user without a group tracks their own quests privately; joining a group adds shared quests and a live activity feed.

### Use cases

| Context | Example quests |
|---|---|
| 🏠 Home | Take out trash, clean kitchen, pay bills |
| 💪 Fitness | Run 5 km, 30-min workout, drink 2L water |
| 📚 Study | Read chapter 3, solve 10 exercises, review flashcards |
| 💼 Work | Review PRs, write daily standup, clear inbox |
| 🎯 Personal | Meditate, journal, no phone before 9 am |

---

## Features

- **Quest board** — quests have a title, category, difficulty (Easy / Medium / Hard / Epic), and recurrence (one-time, daily, weekdays, weekly, or custom days of the week)
- **Auto gold** — points are calculated from difficulty (10 / 25 / 50 / 100 🪙), no manual entry needed
- **Streak tracking** — recurring quests build consecutive-day streaks; personal best is saved per quest
- **Streak toast** — a 🔥 banner appears after completing a recurring quest showing current streak and best
- **Treasury** — spend gold on custom treasures (movie night, a cheat meal, anything you define)
- **Honours** — 9 achievements unlocked by completing quests, earning gold, or sustaining streaks (7-day and 30-day)
- **Dashboard by category** — quests grouped by category with a daily progress bar and 🔥 indicators on recurring tasks
- **Group mode** — share quests and an activity feed with a household or team; members join via invite sigil (group ID)
- **Solo mode** — fully functional without a group; the dashboard adapts automatically with a soft nudge to create one
- **EN / ES** — full bilingual support (English and Spanish), switchable from the header at any time
- **Medieval skin** — Cinzel typeface, parchment palette, gold borders, and thematic copy throughout

---

## Tech stack

| Layer | Tech |
|---|---|
| Monorepo | pnpm workspaces |
| Backend | Fastify v5, TypeScript, hexagonal architecture (Ports & Adapters) |
| Database | SQLite via Prisma 5 |
| Auth | JWT (argon2 password hashing) |
| Frontend | Next.js 15 (App Router), React 18 |
| State | Zustand (persisted) + TanStack Query v5 |
| Styling | Tailwind CSS v3, custom medieval design tokens |
| i18n | `useT()` hook + Zustand locale store (no external library) |

---

## Project structure

```
homequest/
├── apps/
│   ├── api/                      # Fastify backend
│   │   ├── prisma/               # Schema, seed, SQLite DB
│   │   └── src/modules/          # One folder per domain module:
│   │       ├── task/             #   quests, completions, streaks
│   │       ├── household/        #   groups and membership
│   │       ├── points/           #   gold ledger
│   │       ├── rewards/          #   treasures and redemptions
│   │       └── achievement/      #   honours and progress tracking
│   │           ├── domain/       #   entities + port interfaces
│   │           ├── application/  #   use cases
│   │           └── infrastructure/ # Prisma repos + HTTP routes
│   └── web/                      # Next.js frontend
│       └── src/
│           ├── app/              # App Router pages
│           └── lib/              # API client, Zustand store, i18n
└── packages/
    ├── config/                   # Shared ESLint / TS config
    └── shared-types/             # Shared TypeScript types
```

---

## Getting started

**Prerequisites:** Node ≥ 20, pnpm ≥ 9

```bash
# Install dependencies
pnpm install

# Configure environment
cp apps/api/.env.example apps/api/.env
# The default DATABASE_URL=file:./dev.db works out of the box

# Set up the database
cd apps/api
npx prisma db push   # creates tables
npx prisma db seed   # seeds the 9 achievements
cd ../..

# Start both servers in parallel
pnpm dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API | http://localhost:3001 |

---

## API overview

All routes require `Authorization: Bearer <token>` except the auth endpoints.

```
POST /api/auth/register
POST /api/auth/login

# Personal quests (no group required)
GET  /api/tasks/mine
POST /api/tasks
GET  /api/tasks/mine/activity
POST /api/tasks/:id/complete      → returns { pointsEarned, streak }

# Groups
GET  /api/households/my
POST /api/households
POST /api/households/:id/join
GET  /api/households/:id
GET  /api/households/:id/tasks
POST /api/households/:id/tasks    (admin only)
GET  /api/households/:id/activity

# Gold
GET  /api/users/:id/points        → { balance, entries[] }

# Treasures
GET  /api/households/:id/rewards
POST /api/households/:id/rewards  (admin only)
POST /api/rewards/:id/redeem

# Honours
GET  /api/users/:id/achievements
POST /api/users/:id/achievements/check
```

---

## Difficulty → Gold

| Difficulty | Gold reward |
|---|---|
| Easy | 10 🪙 |
| Medium | 25 🪙 |
| Hard | 50 🪙 |
| Epic | 100 🪙 |

---

## Licence

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
