import { Router } from 'express'
import { db } from '../db/index.js'
import { currentStreak, lastNDates, todayISO } from '../lib/dates.js'

const router = Router()

router.get('/', (req, res) => {
  const limit = Number(req.query.limit) || 50
  const rows = db.prepare('SELECT * FROM study_log ORDER BY date DESC, id DESC LIMIT ?').all(limit)
  res.json(rows)
})

router.post('/', (req, res) => {
  const { minutes, description, context_type, context_id, date } = req.body
  if (typeof minutes !== 'number' || minutes <= 0) {
    return res.status(400).json({ error: 'minutes must be a positive number' })
  }
  const info = db
    .prepare(
      'INSERT INTO study_log (date, minutes, description, context_type, context_id, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    )
    .run(
      date || todayISO(),
      minutes,
      description || '',
      context_type || null,
      context_id || null,
      new Date().toISOString(),
    )
  res.status(201).json(db.prepare('SELECT * FROM study_log WHERE id = ?').get(info.lastInsertRowid))
})

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM study_log WHERE id = ?').run(Number(req.params.id))
  res.status(204).end()
})

router.get('/summary/week', (req, res) => {
  const days = lastNDates(7)
  const rows = db
    .prepare(
      `SELECT date, SUM(minutes) AS minutes FROM study_log WHERE date >= ? GROUP BY date`,
    )
    .all(days[0])
  const byDate = new Map(rows.map((r) => [r.date, r.minutes]))
  const byDay = days.map((d) => ({ date: d, minutes: byDate.get(d) || 0 }))
  const weekMinutes = byDay.reduce((sum, d) => sum + d.minutes, 0)
  res.json({ byDay, weekMinutes })
})

router.get('/streak', (req, res) => {
  const rows = db.prepare('SELECT DISTINCT date FROM study_log').all()
  const streak = currentStreak(new Set(rows.map((r) => r.date)))
  res.json({ streak })
})

export default router
