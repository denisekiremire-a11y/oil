import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import type { Chapter } from '../types'

export default function Reading() {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [newTitle, setNewTitle] = useState('')

  function reload() {
    api.getChapters().then(setChapters)
  }

  useEffect(reload, [])

  async function addChapter() {
    if (!newTitle.trim()) return
    await api.addChapter(newTitle.trim())
    setNewTitle('')
    reload()
  }

  async function toggleRead(c: Chapter) {
    await api.updateChapter(c.id, { is_read: !c.is_read })
    reload()
  }

  async function removeChapter(id: number) {
    await api.deleteChapter(id)
    reload()
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Reading Tracker — Oil 101</h1>

      <div className="flex gap-2 rounded-lg border border-slate-200 bg-white p-4">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addChapter()}
          placeholder="Add a chapter title…"
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button onClick={addChapter} className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800">
          + Add chapter
        </button>
      </div>

      <ul className="space-y-2">
        {chapters.map((c) => (
          <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={c.is_read} onChange={() => toggleRead(c)} className="h-4 w-4" />
              <span className={c.is_read ? 'text-slate-500' : 'font-medium'}>{c.title}</span>
            </label>
            <div className="flex items-center gap-3 text-xs">
              {c.self_assessment_completed && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">self-assessed</span>}
              {c.latest_score && (
                <span className="text-slate-500">
                  last score: {c.latest_score.correct}/{c.latest_score.total}
                </span>
              )}
              <span className="text-slate-400">{c.question_count} question{c.question_count === 1 ? '' : 's'}</span>
              <Link to={`/reading/${c.id}/quiz`} className="font-medium text-emerald-700 hover:underline">
                Quiz →
              </Link>
              <button onClick={() => removeChapter(c.id)} className="text-red-500 hover:underline">
                Delete
              </button>
            </div>
          </li>
        ))}
        {chapters.length === 0 && <li className="text-sm text-slate-400">No chapters yet.</li>}
      </ul>
    </div>
  )
}
