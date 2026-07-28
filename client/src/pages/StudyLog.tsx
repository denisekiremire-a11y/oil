import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { Certification, StudyLogEntry, Volume, WeekSummary } from '../types'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function StudyLog() {
  const [entries, setEntries] = useState<StudyLogEntry[]>([])
  const [week, setWeek] = useState<WeekSummary | null>(null)
  const [streak, setStreak] = useState(0)
  const [volumes, setVolumes] = useState<Volume[]>([])
  const [certs, setCerts] = useState<Certification[]>([])

  const [minutes, setMinutes] = useState('')
  const [description, setDescription] = useState('')
  const [context, setContext] = useState('')

  function reload() {
    api.getStudyLog().then(setEntries)
    api.getWeekSummary().then(setWeek)
    api.getStreak().then((r) => setStreak(r.streak))
  }

  useEffect(() => {
    reload()
    api.getVolumes().then(setVolumes)
    api.getCertifications().then(setCerts)
  }, [])

  async function submitLog(e: React.FormEvent) {
    e.preventDefault()
    const mins = Number(minutes)
    if (!mins || mins <= 0) return
    let context_type: string | null = null
    let context_id: number | null = null
    if (context) {
      const [type, idStr] = context.split(':')
      context_type = type
      context_id = Number(idStr)
    }
    await api.addStudyLogEntry({ minutes: mins, description, context_type, context_id })
    setMinutes('')
    setDescription('')
    setContext('')
    reload()
  }

  async function removeEntry(id: number) {
    await api.deleteStudyLogEntry(id)
    reload()
  }

  function contextLabel(entry: StudyLogEntry) {
    if (!entry.context_type || !entry.context_id) return null
    if (entry.context_type === 'module') {
      for (const v of volumes) {
        const m = v.modules.find((mm) => mm.id === entry.context_id)
        if (m) return `${v.name}: ${m.title}`
      }
    }
    if (entry.context_type === 'cert') {
      const c = certs.find((cc) => cc.id === entry.context_id)
      if (c) return c.name
    }
    return null
  }

  const maxMinutes = week ? Math.max(...week.byDay.map((d) => d.minutes), 1) : 1

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Study Log</h1>

      <form onSubmit={submitLog} className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-4">
        <input
          type="number"
          min={1}
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          placeholder="Minutes"
          className="w-24 rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What did you study? (optional)"
          className="min-w-[200px] flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <select value={context} onChange={(e) => setContext(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">No module/cert</option>
          <optgroup label="UPCA modules">
            {volumes.flatMap((v) =>
              v.modules.map((m) => (
                <option key={`module:${m.id}`} value={`module:${m.id}`}>{v.name}: {m.title}</option>
              )),
            )}
          </optgroup>
          <optgroup label="Certifications">
            {certs.map((c) => (
              <option key={`cert:${c.id}`} value={`cert:${c.id}`}>{c.name}</option>
            ))}
          </optgroup>
        </select>
        <button type="submit" className="rounded-md bg-pink-700 px-4 py-2 text-sm font-medium text-white hover:bg-pink-800">
          Log it
        </button>
      </form>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-2 text-sm font-semibold text-slate-700">Streak</h2>
          <p className="text-3xl font-bold text-orange-600">🔥 {streak} days</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-2 text-sm font-semibold text-slate-700">This week ({week?.weekMinutes ?? 0} min)</h2>
          <div className="flex items-end gap-2" style={{ height: 80 }}>
            {week?.byDay.map((d) => {
              const dayIndex = new Date(d.date + 'T00:00:00').getDay()
              return (
                <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-pink-500"
                    style={{ height: `${Math.max((d.minutes / maxMinutes) * 64, d.minutes > 0 ? 4 : 0)}px` }}
                    title={`${d.minutes} min`}
                  />
                  <span className="text-[10px] text-slate-400">{DAY_LABELS[dayIndex]}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-semibold text-slate-700">Recent entries</h2>
        <ul className="space-y-1">
          {entries.map((e) => (
            <li key={e.id} className="flex items-center justify-between gap-2 text-sm">
              <span className="text-slate-400">{e.date}</span>
              <span className="font-medium">{e.minutes} min</span>
              <span className="flex-1 truncate">{e.description}</span>
              {contextLabel(e) && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{contextLabel(e)}</span>}
              <button onClick={() => removeEntry(e.id)} className="text-xs text-red-500 hover:underline">
                Delete
              </button>
            </li>
          ))}
          {entries.length === 0 && <li className="text-sm text-slate-400">No study sessions logged yet.</li>}
        </ul>
      </div>
    </div>
  )
}
