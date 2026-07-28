import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { ModuleStatus, Volume } from '../types'

const STATUS_OPTIONS: { value: ModuleStatus; label: string; className: string }[] = [
  { value: 'not_started', label: 'Not started', className: 'bg-slate-100 text-slate-600' },
  { value: 'in_progress', label: 'In progress', className: 'bg-amber-100 text-amber-700' },
  { value: 'done', label: 'Done', className: 'bg-emerald-100 text-emerald-700' },
]

export default function Program() {
  const [volumes, setVolumes] = useState<Volume[]>([])
  const [newModuleTitle, setNewModuleTitle] = useState<Record<number, string>>({})
  const [expandedNotes, setExpandedNotes] = useState<Record<number, string>>({})

  function reload() {
    api.getVolumes().then(setVolumes)
  }

  useEffect(reload, [])

  async function addModule(volumeId: number) {
    const title = (newModuleTitle[volumeId] || '').trim()
    if (!title) return
    await api.addModule(volumeId, title)
    setNewModuleTitle((s) => ({ ...s, [volumeId]: '' }))
    reload()
  }

  async function setStatus(moduleId: number, status: ModuleStatus) {
    await api.updateModule(moduleId, { status })
    reload()
  }

  async function saveNotes(moduleId: number) {
    await api.updateModule(moduleId, { notes: expandedNotes[moduleId] ?? '' })
    reload()
  }

  async function removeModule(moduleId: number) {
    await api.deleteModule(moduleId)
    reload()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">UPCA Program Tracker</h1>

      {volumes.map((v) => {
        const done = v.modules.filter((m) => m.status === 'done').length
        return (
          <section key={v.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{v.name}</h2>
              <span className="text-xs text-slate-500">
                {done} / {v.modules.length} done
              </span>
            </div>

            <ul className="space-y-2">
              {v.modules.map((m) => (
                <li key={m.id} className="rounded-md border border-slate-100 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">{m.title}</span>
                    <div className="flex items-center gap-2">
                      <select
                        value={m.status}
                        onChange={(e) => setStatus(m.id, e.target.value as ModuleStatus)}
                        className={`rounded-md border-0 px-2 py-1 text-xs font-medium ${
                          STATUS_OPTIONS.find((o) => o.value === m.status)?.className
                        }`}
                      >
                        {STATUS_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                      <button onClick={() => removeModule(m.id)} className="text-xs text-red-500 hover:underline">
                        Delete
                      </button>
                    </div>
                  </div>
                  <textarea
                    defaultValue={m.notes}
                    onChange={(e) => setExpandedNotes((s) => ({ ...s, [m.id]: e.target.value }))}
                    onBlur={() => saveNotes(m.id)}
                    placeholder="Notes for this module…"
                    rows={2}
                    className="mt-2 w-full resize-y rounded-md border border-slate-200 p-2 text-sm outline-none focus:border-emerald-400"
                  />
                </li>
              ))}
              {v.modules.length === 0 && <li className="text-sm text-slate-400">No modules yet.</li>}
            </ul>

            <div className="mt-3 flex gap-2">
              <input
                value={newModuleTitle[v.id] || ''}
                onChange={(e) => setNewModuleTitle((s) => ({ ...s, [v.id]: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && addModule(v.id)}
                placeholder="Add a module/chapter title…"
                className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
              />
              <button
                onClick={() => addModule(v.id)}
                className="rounded-md bg-emerald-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-800"
              >
                + Add
              </button>
            </div>
          </section>
        )
      })}
    </div>
  )
}
