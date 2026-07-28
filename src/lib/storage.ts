import type { StudyData } from '../types'

const STORAGE_KEY = 'study-app-data-v1'

export function loadData(): StudyData {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return { subjects: [], notes: [], flashcards: [], quizResults: [], plannerTasks: [] }
  }
  try {
    const parsed = JSON.parse(raw)
    return {
      subjects: parsed.subjects ?? [],
      notes: parsed.notes ?? [],
      flashcards: parsed.flashcards ?? [],
      quizResults: parsed.quizResults ?? [],
      plannerTasks: parsed.plannerTasks ?? [],
    }
  } catch {
    return { subjects: [], notes: [], flashcards: [], quizResults: [], plannerTasks: [] }
  }
}

export function saveData(data: StudyData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function exportData(): string {
  return JSON.stringify(loadData(), null, 2)
}

export function importData(json: string): StudyData {
  const parsed = JSON.parse(json)
  const data: StudyData = {
    subjects: parsed.subjects ?? [],
    notes: parsed.notes ?? [],
    flashcards: parsed.flashcards ?? [],
    quizResults: parsed.quizResults ?? [],
    plannerTasks: parsed.plannerTasks ?? [],
  }
  saveData(data)
  return data
}
