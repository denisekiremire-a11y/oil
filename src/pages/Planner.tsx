import { useMemo, useState } from 'react'
import { useData } from '../context/DataContext'

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export default function Planner() {
  const { data, addPlannerTask, updatePlannerTask, deletePlannerTask } = useData()
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(todayISO())
  const [subjectId, setSubjectId] = useState<string>('')

  const tasks = useMemo(
    () => [...data.plannerTasks].sort((a, b) => a.date.localeCompare(b.date)),
    [data.plannerTasks],
  )

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    addPlannerTask(title.trim(), date, subjectId || null)
    setTitle('')
  }

  function subjectName(id: string | null) {
    if (!id) return null
    return data.subjects.find((s) => s.id === id)?.name ?? null
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Study Planner</h1>

      <form onSubmit={handleAdd} className="grid gap-2 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_auto_auto_auto]">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What do you want to study?"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">No subject</option>
          {data.subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          Add
        </button>
      </form>

      <ul className="space-y-2">
        {tasks.map((t) => {
          const overdue = !t.done && t.date < todayISO()
          return (
            <li
              key={t.id}
              className={`flex items-center justify-between gap-3 rounded-lg border bg-white p-3 ${
                overdue ? 'border-red-200' : 'border-slate-200'
              }`}
            >
              <label className="flex flex-1 items-center gap-3">
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={(e) => updatePlannerTask(t.id, { done: e.target.checked })}
                  className="h-4 w-4"
                />
                <span className={`text-sm ${t.done ? 'text-slate-400 line-through' : ''}`}>{t.title}</span>
                {subjectName(t.subjectId) && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{subjectName(t.subjectId)}</span>
                )}
              </label>
              <span className={`text-xs ${overdue ? 'font-medium text-red-500' : 'text-slate-400'}`}>
                {new Date(t.date + 'T00:00:00').toLocaleDateString()}
              </span>
              <button onClick={() => deletePlannerTask(t.id)} className="text-xs text-red-500 hover:underline">
                Delete
              </button>
            </li>
          )
        })}
        {tasks.length === 0 && <li className="text-sm text-slate-400">No study sessions planned yet.</li>}
      </ul>
    </div>
  )
}
