import { Router } from 'express'
import { db } from '../db/index.js'
import { currentStreak, daysBetween, lastNDates, todayISO } from '../lib/dates.js'
import { PROGRAM_END, PROGRAM_START } from '../config.js'

const router = Router()

router.get('/', (req, res) => {
  const today = todayISO()

  // UPCA completion
  const modules = db
    .prepare(
      `SELECT modules.*, volumes.name AS volume_name, volumes.sort_order AS volume_order
       FROM modules JOIN volumes ON modules.volume_id = volumes.id
       ORDER BY volumes.sort_order, modules.sort_order`,
    )
    .all()
  const doneModules = modules.filter((m) => m.status === 'done').length
  const upcaPercent = modules.length === 0 ? 0 : Math.round((doneModules / modules.length) * 100)

  const programTotalDays = daysBetween(PROGRAM_START, PROGRAM_END)
  const programElapsedDays = Math.min(Math.max(daysBetween(PROGRAM_START, today), 0), programTotalDays)
  const programPercent = Math.round((programElapsedDays / programTotalDays) * 100)

  // Certifications countdown
  const certs = db.prepare('SELECT * FROM certifications ORDER BY sort_order').all()
  const certsCountdown = certs.map((c) => ({
    id: c.id,
    name: c.name,
    target_date: c.target_date,
    status: c.status,
    days_remaining: c.target_date ? daysBetween(today, c.target_date) : null,
  }))

  // Streak + week minutes
  const loggedDates = db.prepare('SELECT DISTINCT date FROM study_log').all()
  const streak = currentStreak(new Set(loggedDates.map((r) => r.date)))

  const days = lastNDates(7)
  const weekRows = db
    .prepare('SELECT date, SUM(minutes) AS minutes FROM study_log WHERE date >= ? GROUP BY date')
    .all(days[0])
  const weekByDate = new Map(weekRows.map((r) => [r.date, r.minutes]))
  const weekMinutes = days.reduce((sum, d) => sum + (weekByDate.get(d) || 0), 0)

  // What's next
  const nextModule = modules.find((m) => m.status !== 'done')
  const nextChapter = db.prepare('SELECT * FROM chapters WHERE is_read = 0 ORDER BY sort_order LIMIT 1').get()
  const nextChecklistItem = db
    .prepare(
      `SELECT checklist_items.*, certifications.name AS cert_name
       FROM checklist_items JOIN certifications ON checklist_items.cert_id = certifications.id
       WHERE checklist_items.done = 0
       ORDER BY certifications.sort_order, checklist_items.sort_order LIMIT 1`,
    )
    .get()

  const whatsNext = []
  if (nextModule) {
    whatsNext.push({ type: 'module', label: `${nextModule.volume_name}: ${nextModule.title}`, id: nextModule.id })
  }
  if (nextChapter) {
    whatsNext.push({ type: 'chapter', label: `Read: ${nextChapter.title}`, id: nextChapter.id })
  }
  if (nextChecklistItem) {
    whatsNext.push({
      type: 'checklist',
      label: `${nextChecklistItem.cert_name}: ${nextChecklistItem.topic}`,
      id: nextChecklistItem.id,
    })
  }

  res.json({
    upca: { percent: upcaPercent, doneModules, totalModules: modules.length, programPercent, programStart: PROGRAM_START, programEnd: PROGRAM_END },
    certsCountdown,
    streak,
    weekMinutes,
    whatsNext,
  })
})

export default router
