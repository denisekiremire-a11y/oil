import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Subjects from './pages/Subjects'
import Notes from './pages/Notes'
import Flashcards from './pages/Flashcards'
import Review from './pages/Review'
import Quiz from './pages/Quiz'
import Planner from './pages/Planner'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/subjects" element={<Subjects />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/flashcards" element={<Flashcards />} />
        <Route path="/flashcards/:subjectId/review" element={<Review />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/planner" element={<Planner />} />
      </Route>
    </Routes>
  )
}
