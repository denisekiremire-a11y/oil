import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { AppConfig, Certification } from '../types'
import ClassSchedule from '../components/ClassSchedule'

const STATUS_OPTIONS = ['not_started', 'in_progress', 'done']

export default function Certifications() {
  const [certs, setCerts] = useState<Certification[]>([])
  const [config, setConfig] = useState<AppConfig | null>(null)
  const [newTopic, setNewTopic] = useState<Record<number, string>>({})
  const [notesDraft, setNotesDraft] = useState<Record<number, string>>({})

  function reload() {
    api.getCertifications().then(setCerts)
  }

  useEffect(() => {
    reload()
    api.getConfig().then(setConfig)
  }, [])

  async function updateTargetDate(certId: number, date: string) {
    await api.updateCertification(certId, { target_date: date || null })
    reload()
  }

  async function updateStatus(certId: number, status: string) {
    await api.updateCertification(certId, { status })
    reload()
  }

  async function saveNotes(certId: number) {
    await api.updateCertification(certId, { notes_markdown: notesDraft[certId] ?? '' })
    reload()
  }

  async function addTopic(certId: number) {
    const topic = (newTopic[certId] || '').trim()
    if (!topic) return
    await api.addChecklistItem(certId, topic)
    setNewTopic((s) => ({ ...s, [certId]: '' }))
    reload()
  }

  async function toggleTopic(itemId: number, done: boolean) {
    await api.updateChecklistItem(itemId, { done: !done })
    reload()
  }

  async function removeTopic(itemId: number) {
    await api.deleteChecklistItem(itemId)
    reload()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Certification Tracker</h1>

      {certs.map((c) => {
        const doneCount = c.checklist.filter((i) => i.done).length
        return (
          <section key={c.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">{c.name}</h2>
              <div className="flex items-center gap-2 text-sm">
                <label className="flex items-center gap-1 text-xs text-slate-500">
                  Target date
                  <input
                    type="date"
                    value={c.target_date ?? ''}
                    onChange={(e) => updateTargetDate(c.id, e.target.value)}
                    className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                  />
                </label>
                <select
                  value={c.status}
                  onChange={(e) => updateStatus(c.id, e.target.value)}
                  className="rounded-md border border-slate-300 px-2 py-1 text-xs capitalize"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
            </div>

            <p className="mb-2 text-xs text-slate-500">
              Syllabus checklist: {doneCount} / {c.checklist.length} complete
            </p>
            <ul className="mb-3 space-y-1">
              {c.checklist.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-2 text-sm">
                  <label className="flex flex-1 items-center gap-2">
                    <input type="checkbox" checked={item.done} onChange={() => toggleTopic(item.id, item.done)} className="h-4 w-4 accent-pink-600" />
                    <span className={item.done ? 'text-slate-400 line-through' : ''}>{item.topic}</span>
                  </label>
                  <button onClick={() => removeTopic(item.id)} className="text-xs text-red-500 hover:underline">
                    Delete
                  </button>
                </li>
              ))}
              {c.checklist.length === 0 && <li className="text-sm text-slate-400">No syllabus topics added yet.</li>}
            </ul>
            <div className="mb-4 flex gap-2">
              <input
                value={newTopic[c.id] || ''}
                onChange={(e) => setNewTopic((s) => ({ ...s, [c.id]: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && addTopic(c.id)}
                placeholder="Add syllabus topic/domain…"
                className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
              />
              <button
                onClick={() => addTopic(c.id)}
                className="rounded-md bg-pink-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-pink-800"
              >
                + Add
              </button>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-slate-500">Notes / formula sheet</p>
              <textarea
                defaultValue={c.notes_markdown}
                onChange={(e) => setNotesDraft((s) => ({ ...s, [c.id]: e.target.value }))}
                onBlur={() => saveNotes(c.id)}
                rows={5}
                placeholder="Markdown notes, formulas, key definitions…"
                className="w-full resize-y rounded-md border border-slate-200 p-2 font-mono text-xs outline-none focus:border-pink-400"
              />
            </div>

            {config && c.name === config.capmClassName && (
              <div className="mt-4 border-t border-slate-100 pt-4">
                <ClassSchedule certId={c.id} startDate={config.capmClassStart} endDate={config.programEnd} />
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
