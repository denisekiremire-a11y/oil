import { Router } from 'express'
import { db } from '../db/index.js'

const router = Router()

router.get('/', (req, res) => {
  const dump = {
    exported_at: new Date().toISOString(),
    volumes: db.prepare('SELECT * FROM volumes ORDER BY sort_order').all(),
    modules: db.prepare('SELECT * FROM modules ORDER BY sort_order').all(),
    chapters: db.prepare('SELECT * FROM chapters ORDER BY sort_order').all(),
    questions: db.prepare('SELECT * FROM questions ORDER BY sort_order').all(),
    quiz_attempts: db.prepare('SELECT * FROM quiz_attempts ORDER BY id').all(),
    certifications: db.prepare('SELECT * FROM certifications ORDER BY sort_order').all(),
    checklist_items: db.prepare('SELECT * FROM checklist_items ORDER BY sort_order').all(),
    study_log: db.prepare('SELECT * FROM study_log ORDER BY id').all(),
    class_sessions: db.prepare('SELECT * FROM class_sessions ORDER BY session_date').all(),
  }
  res.setHeader('Content-Disposition', `attachment; filename="upca-backup-${Date.now()}.json"`)
  res.json(dump)
})

export default router
