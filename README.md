# StudyDesk

A local-only study app: organize subjects, take notes, drill flashcards
with spaced repetition (SM-2), auto-generate multiple-choice quizzes from
your flashcards, and plan study sessions on a calendar. All data is stored
in your browser (`localStorage`) — no account or server required.

## Features

- **Subjects** — organize everything by topic with a color tag.
- **Notes** — freeform notes per subject.
- **Flashcards** — front/back cards reviewed with an SM-2 spaced-repetition
  scheduler (Again / Hard / Good / Easy).
- **Quiz** — multiple-choice quizzes auto-generated from a subject's
  flashcards, with score history.
- **Planner** — schedule study sessions and track completion.
- **Dashboard** — due flashcards, upcoming sessions, and recent quiz scores
  at a glance.

## Development

```bash
npm install
npm run dev      # start dev server
npm run build    # type-check and build for production
```
