import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Program from './pages/Program'
import Reading from './pages/Reading'
import ChapterQuiz from './pages/ChapterQuiz'
import Certifications from './pages/Certifications'
import StudyLog from './pages/StudyLog'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/program" element={<Program />} />
        <Route path="/reading" element={<Reading />} />
        <Route path="/reading/:chapterId/quiz" element={<ChapterQuiz />} />
        <Route path="/certifications" element={<Certifications />} />
        <Route path="/study-log" element={<StudyLog />} />
      </Route>
    </Routes>
  )
}
