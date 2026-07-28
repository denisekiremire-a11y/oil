import { Router } from 'express'
import { db } from '../db/index.js'

const router = Router()

function getVolumesWithModules() {
  const volumes = db.prepare('SELECT * FROM volumes ORDER BY sort_order').all()
  const modules = db.prepare('SELECT * FROM modules ORDER BY sort_order').all()
  return volumes.map((v) => ({
    ...v,
    modules: modules.filter((m) => m.volume_id === v.id),
  }))
}

router.get('/', (req, res) => {
  res.json(getVolumesWithModules())
})

router.post('/:volumeId/modules', (req, res) => {
  const { title } = req.body
  if (!title || !title.trim()) return res.status(400).json({ error: 'title is required' })
  const volumeId = Number(req.params.volumeId)
  const maxOrder = db
    .prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM modules WHERE volume_id = ?')
    .get(volumeId).m
  const info = db
    .prepare('INSERT INTO modules (volume_id, title, sort_order) VALUES (?, ?, ?)')
    .run(volumeId, title.trim(), maxOrder + 1)
  const created = db.prepare('SELECT * FROM modules WHERE id = ?').get(info.lastInsertRowid)
  res.status(201).json(created)
})

router.patch('/modules/:id', (req, res) => {
  const id = Number(req.params.id)
  const existing = db.prepare('SELECT * FROM modules WHERE id = ?').get(id)
  if (!existing) return res.status(404).json({ error: 'not found' })

  const { title, status, notes } = req.body
  const next = {
    title: title !== undefined ? title : existing.title,
    status: status !== undefined ? status : existing.status,
    notes: notes !== undefined ? notes : existing.notes,
  }
  db.prepare('UPDATE modules SET title = ?, status = ?, notes = ? WHERE id = ?').run(
    next.title,
    next.status,
    next.notes,
    id,
  )
  res.json(db.prepare('SELECT * FROM modules WHERE id = ?').get(id))
})

router.delete('/modules/:id', (req, res) => {
  db.prepare('DELETE FROM modules WHERE id = ?').run(Number(req.params.id))
  res.status(204).end()
})

export default router
