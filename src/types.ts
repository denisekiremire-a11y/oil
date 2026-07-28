export interface Subject {
  id: string
  name: string
  color: string
  createdAt: string
}

export interface Note {
  id: string
  subjectId: string
  title: string
  body: string
  updatedAt: string
}

export interface Flashcard {
  id: string
  subjectId: string
  front: string
  back: string
  // Spaced repetition (SM-2) state
  repetition: number
  easeFactor: number
  interval: number // days
  dueDate: string // ISO date
  lastReviewed: string | null
}

export interface QuizResult {
  id: string
  subjectId: string
  date: string
  score: number
  total: number
}

export interface PlannerTask {
  id: string
  subjectId: string | null
  title: string
  date: string // ISO date (yyyy-mm-dd)
  done: boolean
}

export interface StudyData {
  subjects: Subject[]
  notes: Note[]
  flashcards: Flashcard[]
  quizResults: QuizResult[]
  plannerTasks: PlannerTask[]
}
