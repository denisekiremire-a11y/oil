export type ModuleStatus = 'not_started' | 'in_progress' | 'done'

export interface ModuleItem {
  id: number
  volume_id: number
  title: string
  status: ModuleStatus
  notes: string
  sort_order: number
}

export interface Volume {
  id: number
  name: string
  sort_order: number
  modules: ModuleItem[]
}

export interface Chapter {
  id: number
  title: string
  sort_order: number
  is_read: boolean
  self_assessment_completed: boolean
  question_count: number
  latest_score: { correct: number; total: number; date: string } | null
}

export interface QuizQuestion {
  id: number
  chapter_id: number
  question: string
  answer: string
  sort_order: number
}

export interface QuizAttempt {
  id: number
  chapter_id: number
  date: string
  correct_count: number
  total_count: number
}

export interface ChecklistItem {
  id: number
  cert_id: number
  topic: string
  done: boolean
  sort_order: number
}

export interface Certification {
  id: number
  name: string
  target_date: string | null
  status: string
  notes_markdown: string
  sort_order: number
  checklist: ChecklistItem[]
}

export interface StudyLogEntry {
  id: number
  date: string
  minutes: number
  description: string
  context_type: string | null
  context_id: number | null
  created_at: string
}

export interface WeekSummary {
  byDay: { date: string; minutes: number }[]
  weekMinutes: number
}

export interface DashboardData {
  upca: {
    percent: number
    doneModules: number
    totalModules: number
    programPercent: number
    programStart: string
    programEnd: string
  }
  certsCountdown: {
    id: number
    name: string
    target_date: string | null
    status: string
    days_remaining: number | null
  }[]
  streak: number
  weekMinutes: number
  whatsNext: { type: string; label: string; id: number }[]
}
