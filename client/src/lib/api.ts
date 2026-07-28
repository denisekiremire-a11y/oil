import type {
  Certification,
  Chapter,
  ChecklistItem,
  DashboardData,
  ModuleItem,
  QuizAttempt,
  QuizQuestion,
  StudyLogEntry,
  Volume,
  WeekSummary,
} from '../types'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`${res.status} ${res.statusText}: ${body}`)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export const api = {
  // Volumes / modules
  getVolumes: () => request<Volume[]>('/volumes'),
  addModule: (volumeId: number, title: string) =>
    request<ModuleItem>(`/volumes/${volumeId}/modules`, { method: 'POST', body: JSON.stringify({ title }) }),
  updateModule: (id: number, patch: Partial<Pick<ModuleItem, 'title' | 'status' | 'notes'>>) =>
    request<ModuleItem>(`/volumes/modules/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  deleteModule: (id: number) => request<void>(`/volumes/modules/${id}`, { method: 'DELETE' }),

  // Chapters
  getChapters: () => request<Chapter[]>('/chapters'),
  addChapter: (title: string) => request<Chapter>('/chapters', { method: 'POST', body: JSON.stringify({ title }) }),
  updateChapter: (id: number, patch: Partial<Pick<Chapter, 'title' | 'is_read' | 'self_assessment_completed'>>) =>
    request<Chapter>(`/chapters/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  deleteChapter: (id: number) => request<void>(`/chapters/${id}`, { method: 'DELETE' }),

  getQuestions: (chapterId: number) => request<QuizQuestion[]>(`/chapters/${chapterId}/questions`),
  addQuestion: (chapterId: number, question: string, answer: string) =>
    request<QuizQuestion>(`/chapters/${chapterId}/questions`, {
      method: 'POST',
      body: JSON.stringify({ question, answer }),
    }),
  updateQuestion: (id: number, patch: Partial<Pick<QuizQuestion, 'question' | 'answer'>>) =>
    request<QuizQuestion>(`/chapters/questions/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  deleteQuestion: (id: number) => request<void>(`/chapters/questions/${id}`, { method: 'DELETE' }),

  getAttempts: (chapterId: number) => request<QuizAttempt[]>(`/chapters/${chapterId}/attempts`),
  addAttempt: (chapterId: number, correct: number, total: number) =>
    request<QuizAttempt>(`/chapters/${chapterId}/attempts`, {
      method: 'POST',
      body: JSON.stringify({ correct, total }),
    }),

  // Certifications
  getCertifications: () => request<Certification[]>('/certifications'),
  updateCertification: (
    id: number,
    patch: Partial<Pick<Certification, 'name' | 'target_date' | 'status' | 'notes_markdown'>>,
  ) => request<Certification>(`/certifications/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  addChecklistItem: (certId: number, topic: string) =>
    request<ChecklistItem>(`/certifications/${certId}/checklist`, { method: 'POST', body: JSON.stringify({ topic }) }),
  updateChecklistItem: (id: number, patch: Partial<Pick<ChecklistItem, 'topic' | 'done'>>) =>
    request<ChecklistItem>(`/certifications/checklist/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  deleteChecklistItem: (id: number) => request<void>(`/certifications/checklist/${id}`, { method: 'DELETE' }),

  // Study log
  getStudyLog: (limit = 50) => request<StudyLogEntry[]>(`/study-log?limit=${limit}`),
  addStudyLogEntry: (entry: {
    minutes: number
    description?: string
    context_type?: string | null
    context_id?: number | null
    date?: string
  }) => request<StudyLogEntry>('/study-log', { method: 'POST', body: JSON.stringify(entry) }),
  deleteStudyLogEntry: (id: number) => request<void>(`/study-log/${id}`, { method: 'DELETE' }),
  getWeekSummary: () => request<WeekSummary>('/study-log/summary/week'),
  getStreak: () => request<{ streak: number }>('/study-log/streak'),

  // Dashboard
  getDashboard: () => request<DashboardData>('/dashboard'),

  exportUrl: '/api/export',
}
