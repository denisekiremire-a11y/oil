# UPCA Tracker

A personal study-tracking app for the Uganda Petroleum Commercial Academy (UPCA) career prep program. Local-first, single-user: a React (Vite) frontend talks to a small Express API backed by SQLite, so progress persists across restarts with no external database or account required.

## Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS 4 (port 5000 in dev)
- **Backend**: Express 5 + better-sqlite3 (port 3001)
- **Database**: SQLite at `server/data/upca.sqlite3`

## How to run

The "Start application" workflow runs both services:

```bash
npm run dev
```

This starts the Express API on port 3001 and the Vite dev server on port 5000. The Vite server proxies `/api` requests to the Express API.

For a production-style single process (serves built frontend from Express):

```bash
npm start   # builds client then starts server on port 3001
```

## Project layout

- `server/` — Express API + SQLite (better-sqlite3)
- `client/` — React + TypeScript + Vite + Tailwind frontend

## Data & backup

All data lives in `server/data/upca.sqlite3`. Use the "Export backup" button in the app header to download a full JSON snapshot.

## Modules

- **Dashboard** — UPCA % complete, certification countdowns, streak, weekly minutes, what's next
- **UPCA Program Tracker** — five volumes with modules you mark Not Started / In Progress / Done, plus notes
- **Reading Tracker (Oil 101)** — chapters with read/self-assessment checkboxes and quiz mode
- **Certification Tracker** — CAPM, Petroleum Products Trading, Trade Finance & Incoterms with syllabus checklists
- **Study Log / Streak** — daily logging, streak counter, weekly minutes chart

## Setup notes

- Node.js 22 is required (`better-sqlite3@13` requires Node ≥ 22)
- After a fresh clone, run `npm install --include=dev` from the project root (npm workspaces requires the `--include=dev` flag to hoist devDependencies like Vite properly)
- No external services or API keys needed

## User preferences
