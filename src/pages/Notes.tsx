import { useMemo, useState } from 'react'
import { useData } from '../context/DataContext'

export default function Notes() {
  const { data, addNote, updateNote, deleteNote } = useData()
  const [subjectId, setSubjectId] = useState<string>('')
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  const activeSubjectId = subjectId || data.subjects[0]?.id || ''

  const notes = useMemo(
    () => data.notes.filter((n) => n.subjectId === activeSubjectId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [data.notes, activeSubjectId],
  )

  if (data.subjects.length === 0) {
    return <p className="text-sm text-slate-500">Create a subject first on the Subjects page, then come back to add notes.</p>
  }

  function startNew() {
    setSelectedNoteId(null)
    setTitle('')
    setBody('')
  }

  function selectNote(id: string) {
    const n = data.notes.find((x) => x.id === id)
    if (!n) return
    setSelectedNoteId(id)
    setTitle(n.title)
    setBody(n.body)
  }

  function save() {
    if (!title.trim()) return
    if (selectedNoteId) {
      updateNote(selectedNoteId, { title: title.trim(), body })
    } else {
      const created = addNote(activeSubjectId, title.trim(), body)
      setSelectedNoteId(created.id)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Notes</h1>
        <select
          value={activeSubjectId}
          onChange={(e) => {
            setSubjectId(e.target.value)
            startNew()
          }}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        >
          {data.subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-3 md:col-span-1">
          <button
            onClick={startNew}
            className="mb-2 w-full rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            + New note
          </button>
          <ul className="space-y-1">
            {notes.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => selectNote(n.id)}
                  className={`w-full truncate rounded-md px-2 py-1.5 text-left text-sm ${
                    selectedNoteId === n.id ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-100'
                  }`}
                >
                  {n.title || 'Untitled'}
                </button>
              </li>
            ))}
            {notes.length === 0 && <li className="px-2 py-1.5 text-sm text-slate-400">No notes yet</li>}
          </ul>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 md:col-span-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title"
            className="mb-2 w-full border-b border-slate-200 pb-2 text-lg font-medium outline-none"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your notes here..."
            rows={14}
            className="w-full resize-y rounded-md border border-slate-200 p-3 text-sm outline-none focus:border-indigo-400"
          />
          <div className="mt-3 flex gap-2">
            <button onClick={save} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
              Save
            </button>
            {selectedNoteId && (
              <button
                onClick={() => {
                  deleteNote(selectedNoteId)
                  startNew()
                }}
                className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
