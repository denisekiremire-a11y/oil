import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { isDue } from '../lib/srs'

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export default function Dashboard() {
  const { data } = useData()

  const dueBySubject = data.subjects.map((s) => ({
    subject: s,
    due: data.flashcards.filter((f) => f.subjectId === s.id && isDue(f)).length,
  })).filter((x) => x.due > 0)

  const totalDue = dueBySubject.reduce((sum, x) => sum + x.due, 0)

  const today = todayISO()
  const upcomingTasks = data.plannerTasks
    .filter((t) => !t.done && t.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5)

  const overdueTasks = data.plannerTasks.filter((t) => !t.done && t.date < today)

  const recentResults = [...data.quizResults].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)

  function subjectName(id: string | null) {
    if (!id) return null
    return data.subjects.find((s) => s.id === id)?.name
  }

  if (data.subjects.length === 0) {
    return (
      <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-6 text-center">
        <h1 className="text-2xl font-semibold">Welcome to StudyDesk 👋</h1>
        <p className="text-slate-600">Start by creating a subject, then add notes and flashcards to study.</p>
        <Link to="/subjects" className="inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          Create your first subject
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-2 text-sm font-semibold text-slate-700">Flashcards due</h2>
          {totalDue === 0 ? (
            <p className="text-sm text-slate-500">Nothing due right now. 🎉</p>
          ) : (
            <ul className="space-y-1">
              {dueBySubject.map((x) => (
                <li key={x.subject.id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: x.subject.color }} />
                    {x.subject.name}
                  </span>
                  <Link to={`/flashcards/${x.subject.id}/review`} className="font-medium text-indigo-600 hover:underline">
                    {x.due} due →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-2 text-sm font-semibold text-slate-700">Upcoming study sessions</h2>
          {overdueTasks.length > 0 && (
            <p className="mb-1 text-xs font-medium text-red-500">{overdueTasks.length} overdue task{overdueTasks.length === 1 ? '' : 's'}</p>
          )}
          {upcomingTasks.length === 0 ? (
            <p className="text-sm text-slate-500">No upcoming sessions planned.</p>
          ) : (
            <ul className="space-y-1">
              {upcomingTasks.map((t) => (
                <li key={t.id} className="flex items-center justify-between text-sm">
                  <span>{t.title}{subjectName(t.subjectId) ? ` · ${subjectName(t.subjectId)}` : ''}</span>
                  <span className="text-slate-400">{new Date(t.date + 'T00:00:00').toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
          <Link to="/planner" className="mt-2 inline-block text-xs text-indigo-600 hover:underline">Open planner →</Link>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-semibold text-slate-700">Recent quiz results</h2>
        {recentResults.length === 0 ? (
          <p className="text-sm text-slate-500">No quizzes taken yet.</p>
        ) : (
          <ul className="space-y-1">
            {recentResults.map((r) => (
              <li key={r.id} className="flex items-center justify-between text-sm">
                <span>{subjectName(r.subjectId) ?? 'Unknown subject'}</span>
                <span className="text-slate-400">{new Date(r.date).toLocaleDateString()}</span>
                <span className="font-medium text-indigo-600">{r.score} / {r.total}</span>
              </li>
            ))}
          </ul>
        )}
        <Link to="/quiz" className="mt-2 inline-block text-xs text-indigo-600 hover:underline">Take a quiz →</Link>
      </div>
    </div>
  )
}
