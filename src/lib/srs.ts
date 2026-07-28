import type { Flashcard } from '../types'

// Quality ratings mapped from review buttons (SM-2 scale is 0-5).
export const RATING = {
  Again: 1,
  Hard: 3,
  Good: 4,
  Easy: 5,
} as const

export type RatingLabel = keyof typeof RATING

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function scheduleReview(card: Flashcard, rating: RatingLabel): Flashcard {
  const quality = RATING[rating]
  let { repetition, easeFactor, interval } = card

  if (quality < 3) {
    repetition = 0
    interval = 1
  } else {
    if (repetition === 0) interval = 1
    else if (repetition === 1) interval = 6
    else interval = Math.round(interval * easeFactor)
    repetition += 1
  }

  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
  )

  const now = new Date()
  return {
    ...card,
    repetition,
    easeFactor,
    interval,
    dueDate: addDays(now, interval).toISOString(),
    lastReviewed: now.toISOString(),
  }
}

export function isDue(card: Flashcard, at: Date = new Date()): boolean {
  return new Date(card.dueDate).getTime() <= at.getTime()
}

export function newCardState(): Pick<
  Flashcard,
  'repetition' | 'easeFactor' | 'interval' | 'dueDate' | 'lastReviewed'
> {
  return {
    repetition: 0,
    easeFactor: 2.5,
    interval: 0,
    dueDate: new Date().toISOString(),
    lastReviewed: null,
  }
}
