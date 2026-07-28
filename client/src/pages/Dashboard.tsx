import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import type { DashboardData } from '../types'

function ProgressBar({ percent, colorClass }: { percent: number; colorClass: string }) {
  const clamped = Math.min(100, Math.max(0, percent))
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${clamped}%` }} />
    </div>
  )
}

const NEXT_LINKS: Record<string, string> = {
  module: '/program',
  chapter: '/reading',
  checklist: '/certifications',
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    api.getDashboard().then(setData)
  }, [])

  if (!data) return <p className="text-sm text-slate-500">Loading…</p>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-1 text-sm font-semibold text-slate-700">UPCA Program</h2>
          <p className="mb-2 text-2xl font-bold text-emerald-700">{data.upca.percent}% complete</p>
          <ProgressBar percent={data.upca.percent} colorClass="bg-emerald-600" />
          <p className="mt-1 text-xs text-slate-500">
            {data.upca.doneModules} / {data.upca.totalModules} modules done
          </p>
          <div className="mt-3 border-t border-slate-100 pt-3">
            <p className="mb-1 text-xs font-medium text-slate-500">
              Program timeline ({data.upca.programStart} → {data.upca.programEnd})
            </p>
            <ProgressBar percent={data.upca.programPercent} colorClass="bg-slate-400" />
            <p className="mt-1 text-xs text-slate-400">{data.upca.programPercent}% of program elapsed</p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-2 text-sm font-semibold text-slate-700">Streak &amp; this week</h2>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-orange-600">🔥 {data.streak}</span>
            <span className="text-sm text-slate-500">day streak</span>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            <span className="font-semibold">{data.weekMinutes}</span> minutes studied this week
          </p>
          <Link to="/study-log" className="mt-2 inline-block text-xs text-emerald-700 hover:underline">
            Log study time →
          </Link>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-semibold text-slate-700">Certification countdowns</h2>
        <ul className="grid gap-2 sm:grid-cols-3">
          {data.certsCountdown.map((c) => (
            <li key={c.id} className="rounded-md border border-slate-100 bg-slate-50 p-3">
              <p className="text-sm font-medium">{c.name}</p>
              {c.target_date ? (
                <p className={`text-lg font-bold ${c.days_remaining !== null && c.days_remaining < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                  {c.days_remaining !== null && c.days_remaining >= 0
                    ? `${c.days_remaining} days left`
                    : `${Math.abs(c.days_remaining ?? 0)} days overdue`}
                </p>
              ) : (
                <p className="text-sm text-slate-400">No target date set</p>
              )}
              <p className="text-xs text-slate-400 capitalize">{c.status.replace('_', ' ')}</p>
            </li>
          ))}
        </ul>
        <Link to="/certifications" className="mt-2 inline-block text-xs text-emerald-700 hover:underline">
          Manage certifications →
        </Link>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-semibold text-slate-700">What's next</h2>
        {data.whatsNext.length === 0 ? (
          <p className="text-sm text-slate-500">Nothing pending — add some modules, chapters, or checklist items.</p>
        ) : (
          <ul className="space-y-1">
            {data.whatsNext.map((item, i) => (
              <li key={i}>
                <Link to={NEXT_LINKS[item.type] ?? '/'} className="text-sm text-slate-700 hover:text-emerald-700 hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
