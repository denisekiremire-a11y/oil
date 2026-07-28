import { Router } from 'express'
import { db } from '../db/index.js'

const router = Router()

function withChecklist(cert) {
  const items = db
    .prepare('SELECT * FROM checklist_items WHERE cert_id = ? ORDER BY sort_order')
    .all(cert.id)
    .map((i) => ({ ...i, done: !!i.done }))
  return { ...cert, checklist: items }
}

router.get('/', (req, res) => {
  const certs = db.prepare('SELECT * FROM certifications ORDER BY sort_order').all()
  res.json(certs.map(withChecklist))
})

router.patch('/:id', (req, res) => {
  const id = Number(req.params.id)
  const existing = db.prepare('SELECT * FROM certifications WHERE id = ?').get(id)
  if (!existing) return res.status(404).json({ error: 'not found' })
  const { name, target_date, status, notes_markdown } = req.body
  const next = {
    name: name !== undefined ? name : existing.name,
    target_date: target_date !== undefined ? target_date : existing.target_date,
    status: status !== undefined ? status : existing.status,
    notes_markdown: notes_markdown !== undefined ? notes_markdown : existing.notes_markdown,
  }
  db.prepare('UPDATE certifications SET name = ?, target_date = ?, status = ?, notes_markdown = ? WHERE id = ?').run(
    next.name,
    next.target_date,
    next.status,
    next.notes_markdown,
    id,
  )
  res.json(withChecklist(db.prepare('SELECT * FROM certifications WHERE id = ?').get(id)))
})

router.post('/:id/checklist', (req, res) => {
  const certId = Number(req.params.id)
  const { topic } = req.body
  if (!topic || !topic.trim()) return res.status(400).json({ error: 'topic is required' })
  const maxOrder = db
    .prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM checklist_items WHERE cert_id = ?')
    .get(certId).m
  const info = db
    .prepare('INSERT INTO checklist_items (cert_id, topic, sort_order) VALUES (?, ?, ?)')
    .run(certId, topic.trim(), maxOrder + 1)
  const created = db.prepare('SELECT * FROM checklist_items WHERE id = ?').get(info.lastInsertRowid)
  res.status(201).json({ ...created, done: !!created.done })
})

router.patch('/checklist/:itemId', (req, res) => {
  const id = Number(req.params.itemId)
  const existing = db.prepare('SELECT * FROM checklist_items WHERE id = ?').get(id)
  if (!existing) return res.status(404).json({ error: 'not found' })
  const { topic, done } = req.body
  const next = {
    topic: topic !== undefined ? topic : existing.topic,
    done: done !== undefined ? (done ? 1 : 0) : existing.done,
  }
  db.prepare('UPDATE checklist_items SET topic = ?, done = ? WHERE id = ?').run(next.topic, next.done, id)
  const updated = db.prepare('SELECT * FROM checklist_items WHERE id = ?').get(id)
  res.json({ ...updated, done: !!updated.done })
})

router.delete('/checklist/:itemId', (req, res) => {
  db.prepare('DELETE FROM checklist_items WHERE id = ?').run(Number(req.params.itemId))
  res.status(204).end()
})

export default router
