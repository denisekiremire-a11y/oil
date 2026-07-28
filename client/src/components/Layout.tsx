import { NavLink, Outlet } from 'react-router-dom'
import { api } from '../lib/api'

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/program', label: 'UPCA Program' },
  { to: '/reading', label: 'Reading (Oil 101)' },
  { to: '/certifications', label: 'Certifications' },
  { to: '/study-log', label: 'Study Log' },
]

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex flex-wrap items-center gap-6">
            <span className="text-lg font-semibold tracking-tight">🛢️ UPCA Tracker</span>
            <nav className="flex flex-wrap gap-1">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) =>
                    `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      isActive ? 'bg-pink-700 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <a
            href={api.exportUrl}
            download
            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
          >
            Export backup
          </a>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
