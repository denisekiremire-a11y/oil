import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { isDue } from '../lib/srs'

export default function Flashcards() {
  const { data, addFlashcard, updateFlashcard, deleteFlashcard } = useData()
  const [subjectId, setSubjectId] = useState('')
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editFront, setEditFront] = useState('')
  const [editBack, setEditBack] = useState('')

  const activeSubjectId = subjectId || data.subjects[0]?.id || ''

  const cards = useMemo(
    () => data.flashcards.filter((f) => f.subjectId === activeSubjectId),
    [data.flashcards, activeSubjectId],
  )
  const dueCount = cards.filter((c) => isDue(c)).length

  if (data.subjects.length === 0) {
    return <p className="text-sm text-slate-500">Create a subject first on the Subjects page, then come back to add flashcards.</p>
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!front.trim() || !back.trim()) return
    addFlashcard(activeSubjectId, front.trim(), back.trim())
    setFront('')
    setBack('')
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Flashcards</h1>
        <select
          value={activeSubjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        >
          {data.subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-sm text-slate-600">
          {cards.length} card{cards.length === 1 ? '' : 's'} · <span className="font-medium text-indigo-600">{dueCount} due</span> for review
        </p>
        <Link
          to={`/flashcards/${activeSubjectId}/review`}
          className={`rounded-md px-4 py-2 text-sm font-medium text-white ${
            dueCount > 0 ? 'bg-indigo-600 hover:bg-indigo-700' : 'pointer-events-none bg-slate-300'
          }`}
        >
          Start review ({dueCount})
        </Link>
      </div>

      <form onSubmit={handleAdd} className="grid gap-2 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2">
        <input
          value={front}
          onChange={(e) => setFront(e.target.value)}
          placeholder="Front (question)"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          value={back}
          onChange={(e) => setBack(e.target.value)}
          placeholder="Back (answer)"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 sm:col-span-2">
          + Add flashcard
        </button>
      </form>

      <ul className="space-y-2">
        {cards.map((c) => (
          <li key={c.id} className="rounded-lg border border-slate-200 bg-white p-3">
            {editingId === c.id ? (
              <div className="grid gap-2 sm:grid-cols-2">
                <input value={editFront} onChange={(e) => setEditFront(e.target.value)} className="rounded-md border border-slate-300 px-2 py-1 text-sm" />
                <input value={editBack} onChange={(e) => setEditBack(e.target.value)} className="rounded-md border border-slate-300 px-2 py-1 text-sm" />
                <div className="flex gap-2 sm:col-span-2">
                  <button
                    onClick={() => {
                      updateFlashcard(c.id, { front: editFront.trim() || c.front, back: editBack.trim() || c.back })
                      setEditingId(null)
                    }}
                    className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-medium text-white"
                  >
                    Save
                  </button>
                  <button onClick={() => setEditingId(null)} className="rounded-md border border-slate-300 px-3 py-1 text-xs">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="grid flex-1 grid-cols-2 gap-3 text-sm">
                  <span>{c.front}</span>
                  <span className="text-slate-500">{c.back}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className={isDue(c) ? 'text-indigo-600' : 'text-slate-400'}>
                    {isDue(c) ? 'due now' : `due ${new Date(c.dueDate).toLocaleDateString()}`}
                  </span>
                  <button
                    onClick={() => {
                      setEditingId(c.id)
                      setEditFront(c.front)
                      setEditBack(c.back)
                    }}
                    className="text-slate-500 hover:underline"
                  >
                    Edit
                  </button>
                  <button onClick={() => deleteFlashcard(c.id)} className="text-red-500 hover:underline">
                    Delete
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
        {cards.length === 0 && <li className="text-sm text-slate-400">No flashcards yet for this subject.</li>}
      </ul>
    </div>
  )
}
