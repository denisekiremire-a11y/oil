import { useState } from 'react'
import { useData } from '../context/DataContext'
import { SUBJECT_COLORS } from '../lib/colors'

export default function Subjects() {
  const { data, addSubject, updateSubject, deleteSubject } = useData()
  const [name, setName] = useState('')
  const [color, setColor] = useState(SUBJECT_COLORS[0])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    addSubject(trimmed, color)
    setName('')
    setColor(SUBJECT_COLORS[(SUBJECT_COLORS.indexOf(color) + 1) % SUBJECT_COLORS.length])
  }

  function counts(subjectId: string) {
    return {
      notes: data.notes.filter((n) => n.subjectId === subjectId).length,
      cards: data.flashcards.filter((f) => f.subjectId === subjectId).length,
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Subjects</h1>

      <form onSubmit={handleAdd} className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New subject name (e.g. Biology)"
          className="min-w-[200px] flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <div className="flex gap-1">
          {SUBJECT_COLORS.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setColor(c)}
              className="h-7 w-7 rounded-full ring-offset-2"
              style={{ backgroundColor: c, outline: color === c ? `2px solid ${c}` : 'none', outlineOffset: 2 }}
              aria-label={`color ${c}`}
            />
          ))}
        </div>
        <button type="submit" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          Add subject
        </button>
      </form>

      {data.subjects.length === 0 ? (
        <p className="text-sm text-slate-500">No subjects yet. Add one above to get started.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {data.subjects.map((s) => {
            const c = counts(s.id)
            return (
              <li key={s.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }} />
                    {editingId === s.id ? (
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            updateSubject(s.id, { name: editName.trim() || s.name })
                            setEditingId(null)
                          }
                        }}
                        autoFocus
                        className="rounded border border-slate-300 px-2 py-1 text-sm"
                      />
                    ) : (
                      <span className="font-medium">{s.name}</span>
                    )}
                  </div>
                  <div className="flex gap-2 text-xs">
                    {editingId === s.id ? (
                      <button
                        onClick={() => {
                          updateSubject(s.id, { name: editName.trim() || s.name })
                          setEditingId(null)
                        }}
                        className="text-indigo-600 hover:underline"
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingId(s.id)
                          setEditName(s.name)
                        }}
                        className="text-slate-500 hover:underline"
                      >
                        Rename
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${s.name}" and all its notes/flashcards?`)) deleteSubject(s.id)
                      }}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {c.notes} note{c.notes === 1 ? '' : 's'} · {c.cards} flashcard{c.cards === 1 ? '' : 's'}
                </p>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
