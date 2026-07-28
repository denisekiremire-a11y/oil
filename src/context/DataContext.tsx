import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Flashcard, Note, PlannerTask, QuizResult, StudyData, Subject } from '../types'
import { loadData, saveData } from '../lib/storage'
import { newCardState, scheduleReview, type RatingLabel } from '../lib/srs'

function makeId(): string {
  return crypto.randomUUID()
}

interface DataContextValue {
  data: StudyData
  addSubject: (name: string, color: string) => Subject
  updateSubject: (id: string, patch: Partial<Pick<Subject, 'name' | 'color'>>) => void
  deleteSubject: (id: string) => void

  addNote: (subjectId: string, title: string, body: string) => Note
  updateNote: (id: string, patch: Partial<Pick<Note, 'title' | 'body'>>) => void
  deleteNote: (id: string) => void

  addFlashcard: (subjectId: string, front: string, back: string) => Flashcard
  updateFlashcard: (id: string, patch: Partial<Pick<Flashcard, 'front' | 'back'>>) => void
  deleteFlashcard: (id: string) => void
  reviewFlashcard: (id: string, rating: RatingLabel) => void

  addQuizResult: (subjectId: string, score: number, total: number) => void

  addPlannerTask: (title: string, date: string, subjectId: string | null) => PlannerTask
  updatePlannerTask: (id: string, patch: Partial<Pick<PlannerTask, 'title' | 'date' | 'done' | 'subjectId'>>) => void
  deletePlannerTask: (id: string) => void
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<StudyData>(() => loadData())

  useEffect(() => {
    saveData(data)
  }, [data])

  const value = useMemo<DataContextValue>(() => ({
    data,

    addSubject: (name, color) => {
      const subject: Subject = { id: makeId(), name, color, createdAt: new Date().toISOString() }
      setData((d) => ({ ...d, subjects: [...d.subjects, subject] }))
      return subject
    },
    updateSubject: (id, patch) => {
      setData((d) => ({
        ...d,
        subjects: d.subjects.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      }))
    },
    deleteSubject: (id) => {
      setData((d) => ({
        subjects: d.subjects.filter((s) => s.id !== id),
        notes: d.notes.filter((n) => n.subjectId !== id),
        flashcards: d.flashcards.filter((f) => f.subjectId !== id),
        quizResults: d.quizResults.filter((q) => q.subjectId !== id),
        plannerTasks: d.plannerTasks.filter((t) => t.subjectId !== id),
      }))
    },

    addNote: (subjectId, title, body) => {
      const note: Note = { id: makeId(), subjectId, title, body, updatedAt: new Date().toISOString() }
      setData((d) => ({ ...d, notes: [...d.notes, note] }))
      return note
    },
    updateNote: (id, patch) => {
      setData((d) => ({
        ...d,
        notes: d.notes.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n)),
      }))
    },
    deleteNote: (id) => {
      setData((d) => ({ ...d, notes: d.notes.filter((n) => n.id !== id) }))
    },

    addFlashcard: (subjectId, front, back) => {
      const card: Flashcard = { id: makeId(), subjectId, front, back, ...newCardState() }
      setData((d) => ({ ...d, flashcards: [...d.flashcards, card] }))
      return card
    },
    updateFlashcard: (id, patch) => {
      setData((d) => ({
        ...d,
        flashcards: d.flashcards.map((f) => (f.id === id ? { ...f, ...patch } : f)),
      }))
    },
    deleteFlashcard: (id) => {
      setData((d) => ({ ...d, flashcards: d.flashcards.filter((f) => f.id !== id) }))
    },
    reviewFlashcard: (id, rating) => {
      setData((d) => ({
        ...d,
        flashcards: d.flashcards.map((f) => (f.id === id ? scheduleReview(f, rating) : f)),
      }))
    },

    addQuizResult: (subjectId, score, total) => {
      const result: QuizResult = { id: makeId(), subjectId, date: new Date().toISOString(), score, total }
      setData((d) => ({ ...d, quizResults: [...d.quizResults, result] }))
    },

    addPlannerTask: (title, date, subjectId) => {
      const task: PlannerTask = { id: makeId(), subjectId, title, date, done: false }
      setData((d) => ({ ...d, plannerTasks: [...d.plannerTasks, task] }))
      return task
    },
    updatePlannerTask: (id, patch) => {
      setData((d) => ({
        ...d,
        plannerTasks: d.plannerTasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      }))
    },
    deletePlannerTask: (id) => {
      setData((d) => ({ ...d, plannerTasks: d.plannerTasks.filter((t) => t.id !== id) }))
    },
  }), [data])

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within a DataProvider')
  return ctx
}
