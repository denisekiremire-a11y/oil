import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { existsSync } from 'node:fs'
import './db/index.js'
import volumesRouter from './routes/volumes.js'
import chaptersRouter from './routes/chapters.js'
import certificationsRouter from './routes/certifications.js'
import studyLogRouter from './routes/studyLog.js'
import dashboardRouter from './routes/dashboard.js'
import exportDataRouter from './routes/exportData.js'
import configRouter from './routes/config.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const clientDist = join(__dirname, '..', '..', 'client', 'dist')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.use('/api/volumes', volumesRouter)
app.use('/api/chapters', chaptersRouter)
app.use('/api/certifications', certificationsRouter)
app.use('/api/study-log', studyLogRouter)
app.use('/api/dashboard', dashboardRouter)
app.use('/api/export', exportDataRouter)
app.use('/api/config', configRouter)

// Serve the built frontend (npm run build -w client) as a single deployable process.
if (existsSync(clientDist)) {
  app.use(express.static(clientDist))
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(join(clientDist, 'index.html'))
  })
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`UPCA tracker server listening on http://localhost:${PORT}`)
})
