import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { ClassSession } from '../types'

function weeklyDates(startISO: string, endISO: string): string[] {
  const dates: string[] = []
  const cursor = new Date(startISO + 'T00:00:00')
  const end = new Date(endISO + 'T00:00:00')
  while (cursor <= end) {
    dates.push(cursor.toISOString().slice(0, 10))
    cursor.setDate(cursor.getDate() + 7)
  }
  return dates
}

export default function ClassSchedule({
  certId,
  startDate,
  endDate,
}: {
  certId: number
  startDate: string
  endDate: string
}) {
  const [sessions, setSessions] = useState<ClassSession[]>([])
  const [drafts, setDrafts] = useState<Record<string, string>>({})

  function reload() {
    api.getClassSessions(certId).then(setSessions)
  }

  useEffect(reload, [certId])

  const dates = weeklyDates(startDate, endDate)
  const byDate = new Map(sessions.map((s) => [s.session_date, s]))
  const todayISO = new Date().toISOString().slice(0, 10)
  const attendedCount = sessions.filter((s) => s.attended).length

  async function toggleAttended(date: string) {
    const existing = byDate.get(date)
    await api.saveClassSession(certId, date, !existing?.attended, existing?.notes ?? '')
    reload()
  }

  async function saveNotes(date: string) {
    const existing = byDate.get(date)
    const notes = drafts[date] ?? existing?.notes ?? ''
    await api.saveClassSession(certId, date, existing?.attended ?? false, notes)
    reload()
  }

  return (
    <div>
      <p className="mb-2 text-xs font-medium text-slate-500">
        Physical classes — every Sunday from {startDate} · {attendedCount} / {dates.length} attended
      </p>
      <ul className="space-y-2">
        {dates.map((date, i) => {
          const session = byDate.get(date)
          const isPast = date < todayISO
          const isToday = date === todayISO
          return (
            <li
              key={date}
              className={`rounded-md border p-2 ${isToday ? 'border-pink-300 bg-pink-50' : 'border-slate-100'}`}
            >
              <div className="flex items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={session?.attended ?? false}
                    onChange={() => toggleAttended(date)}
                    className="h-4 w-4 accent-pink-600"
                  />
                  <span className={session?.attended ? 'text-slate-700' : isPast ? 'text-slate-400' : 'font-medium'}>
                    Session {i + 1} — {new Date(date + 'T00:00:00').toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </label>
              </div>
              <textarea
                defaultValue={session?.notes ?? ''}
                onChange={(e) => setDrafts((d) => ({ ...d, [date]: e.target.value }))}
                onBlur={() => saveNotes(date)}
                placeholder="What did you learn in this class?"
                rows={2}
                className="mt-1 w-full resize-y rounded-md border border-slate-200 p-2 text-sm outline-none focus:border-pink-400"
              />
            </li>
          )
        })}
      </ul>
    </div>
  )
}
