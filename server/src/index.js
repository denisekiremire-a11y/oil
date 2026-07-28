import express from 'express'
import cors from 'cors'
import './db/index.js'
import volumesRouter from './routes/volumes.js'
import chaptersRouter from './routes/chapters.js'
import certificationsRouter from './routes/certifications.js'
import studyLogRouter from './routes/studyLog.js'
import dashboardRouter from './routes/dashboard.js'
import exportDataRouter from './routes/exportData.js'
import configRouter from './routes/config.js'

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

app.listen(PORT, () => {
  console.log(`UPCA tracker server listening on http://localhost:${PORT}`)
})
