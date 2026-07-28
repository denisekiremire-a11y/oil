import { Router } from 'express'
import { db } from '../db/index.js'
import { todayISO } from '../lib/dates.js'

const router = Router()

function latestScoreFor(chapterId) {
  return db
    .prepare('SELECT * FROM quiz_attempts WHERE chapter_id = ? ORDER BY id DESC LIMIT 1')
    .get(chapterId)
}

router.get('/', (req, res) => {
  const chapters = db.prepare('SELECT * FROM chapters ORDER BY sort_order').all()
  const withMeta = chapters.map((c) => {
    const latest = latestScoreFor(c.id)
    const questionCount = db
      .prepare('SELECT COUNT(*) AS n FROM questions WHERE chapter_id = ?')
      .get(c.id).n
    return {
      ...c,
      is_read: !!c.is_read,
      self_assessment_completed: !!c.self_assessment_completed,
      question_count: questionCount,
      latest_score: latest ? { correct: latest.correct_count, total: latest.total_count, date: latest.date } : null,
    }
  })
  res.json(withMeta)
})

router.post('/', (req, res) => {
  const { title } = req.body
  if (!title || !title.trim()) return res.status(400).json({ error: 'title is required' })
  const maxOrder = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM chapters').get().m
  const info = db
    .prepare('INSERT INTO chapters (title, sort_order) VALUES (?, ?)')
    .run(title.trim(), maxOrder + 1)
  res.status(201).json(db.prepare('SELECT * FROM chapters WHERE id = ?').get(info.lastInsertRowid))
})

router.patch('/:id', (req, res) => {
  const id = Number(req.params.id)
  const existing = db.prepare('SELECT * FROM chapters WHERE id = ?').get(id)
  if (!existing) return res.status(404).json({ error: 'not found' })
  const { title, is_read, self_assessment_completed } = req.body
  const next = {
    title: title !== undefined ? title : existing.title,
    is_read: is_read !== undefined ? (is_read ? 1 : 0) : existing.is_read,
    self_assessment_completed:
      self_assessment_completed !== undefined ? (self_assessment_completed ? 1 : 0) : existing.self_assessment_completed,
  }
  db.prepare('UPDATE chapters SET title = ?, is_read = ?, self_assessment_completed = ? WHERE id = ?').run(
    next.title,
    next.is_read,
    next.self_assessment_completed,
    id,
  )
  res.json(db.prepare('SELECT * FROM chapters WHERE id = ?').get(id))
})

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM chapters WHERE id = ?').run(Number(req.params.id))
  res.status(204).end()
})

// Questions
router.get('/:id/questions', (req, res) => {
  const rows = db
    .prepare('SELECT * FROM questions WHERE chapter_id = ? ORDER BY sort_order')
    .all(Number(req.params.id))
  res.json(rows)
})

router.post('/:id/questions', (req, res) => {
  const chapterId = Number(req.params.id)
  const { question, answer } = req.body
  if (!question || !answer) return res.status(400).json({ error: 'question and answer are required' })
  const maxOrder = db
    .prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM questions WHERE chapter_id = ?')
    .get(chapterId).m
  const info = db
    .prepare('INSERT INTO questions (chapter_id, question, answer, sort_order) VALUES (?, ?, ?, ?)')
    .run(chapterId, question, answer, maxOrder + 1)
  res.status(201).json(db.prepare('SELECT * FROM questions WHERE id = ?').get(info.lastInsertRowid))
})

router.patch('/questions/:qid', (req, res) => {
  const id = Number(req.params.qid)
  const existing = db.prepare('SELECT * FROM questions WHERE id = ?').get(id)
  if (!existing) return res.status(404).json({ error: 'not found' })
  const { question, answer } = req.body
  db.prepare('UPDATE questions SET question = ?, answer = ? WHERE id = ?').run(
    question ?? existing.question,
    answer ?? existing.answer,
    id,
  )
  res.json(db.prepare('SELECT * FROM questions WHERE id = ?').get(id))
})

router.delete('/questions/:qid', (req, res) => {
  db.prepare('DELETE FROM questions WHERE id = ?').run(Number(req.params.qid))
  res.status(204).end()
})

// Quiz attempts (comprehension score history)
router.get('/:id/attempts', (req, res) => {
  const rows = db
    .prepare('SELECT * FROM quiz_attempts WHERE chapter_id = ? ORDER BY id')
    .all(Number(req.params.id))
  res.json(rows)
})

router.post('/:id/attempts', (req, res) => {
  const chapterId = Number(req.params.id)
  const { correct, total } = req.body
  if (typeof correct !== 'number' || typeof total !== 'number' || total <= 0) {
    return res.status(400).json({ error: 'correct and total (>0) are required numbers' })
  }
  const info = db
    .prepare('INSERT INTO quiz_attempts (chapter_id, date, correct_count, total_count) VALUES (?, ?, ?, ?)')
    .run(chapterId, todayISO(), correct, total)
  db.prepare('UPDATE chapters SET self_assessment_completed = 1 WHERE id = ?').run(chapterId)
  res.status(201).json(db.prepare('SELECT * FROM quiz_attempts WHERE id = ?').get(info.lastInsertRowid))
})

export default router
