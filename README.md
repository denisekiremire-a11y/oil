# UPCA Tracker

A personal study-tracking app for the Uganda Petroleum Commercial Academy
(UPCA) career prep program. Local-first, single-user: a React (Vite)
frontend talks to a small Express API backed by SQLite, so your progress
persists across restarts with no external database or account required.

## Modules

- **UPCA Program Tracker** — five volumes (Student Handbook, Course Notes,
  Resource Library, Career Toolkit, Entrepreneurship Workbook), each with
  modules you mark Not Started / In Progress / Done, plus free-text notes
  per module. Shows a progress bar against the program's July–December
  2026 window.
- **Reading Tracker (Oil 101)** — chapters with "read" and
  "self-assessment completed" checkboxes. Paste in your own self-assessment
  questions and answers, then quiz yourself (reveal answer, mark
  correct/incorrect) and track a comprehension score over time per chapter.
- **Certification Tracker** — CAPM, Petroleum Products Trading, and Trade
  Finance & Incoterms, each with a target date/countdown, status, an
  editable syllabus checklist, and a notes/formula-sheet section.
- **Study Log / Streak** — 10-second daily logging (minutes, what you
  studied, optional module/cert link), a streak counter, and a weekly
  minutes-per-day chart.
- **Dashboard** — UPCA % complete, days until each certification target,
  current streak, this week's minutes, and "what's next" across all
  modules.

## Data & backup

All data lives in `server/data/upca.sqlite3`. Use the "Export backup"
button in the app header to download a full JSON snapshot at any time.

## Development

```bash
npm install       # installs both client and server workspaces
npm run dev       # runs the API (port 3001) and the Vite dev server (port 5173) together
```

Then open http://localhost:5173.

```bash
npm run build     # type-checks and builds the client for production
```

## Project layout

- `server/` — Express API + SQLite (better-sqlite3)
- `client/` — React + TypeScript + Vite + Tailwind frontend
