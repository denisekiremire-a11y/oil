import { useMemo, useState } from 'react'
import { useData } from '../context/DataContext'
import type { Flashcard } from '../types'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

interface MCQuestion {
  card: Flashcard
  options: string[]
}

export default function Quiz() {
  const { data, addQuizResult } = useData()
  const [subjectId, setSubjectId] = useState('')
  const [count, setCount] = useState(10)
  const [phase, setPhase] = useState<'setup' | 'playing' | 'done'>('setup')
  const [questions, setQuestions] = useState<MCQuestion[]>([])
  const [qIndex, setQIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState(0)

  const activeSubjectId = subjectId || data.subjects[0]?.id || ''
  const cards = useMemo(() => data.flashcards.filter((f) => f.subjectId === activeSubjectId), [data.flashcards, activeSubjectId])
  const maxQuestions = Math.min(count, cards.length)

  if (data.subjects.length === 0) {
    return <p className="text-sm text-slate-500">Create a subject and add some flashcards first, then come back to take a quiz.</p>
  }

  function startQuiz() {
    if (cards.length < 2) return
    const pool = shuffle(cards).slice(0, maxQuestions)
    const built: MCQuestion[] = pool.map((card) => {
      const distractorPool = cards.filter((c) => c.id !== card.id)
      const distractors = shuffle(distractorPool)
        .slice(0, 3)
        .map((c) => c.back)
      const options = shuffle([card.back, ...distractors])
      return { card, options }
    })
    setQuestions(built)
    setQIndex(0)
    setScore(0)
    setSelected(null)
    setPhase('playing')
  }

  function answer(option: string) {
    if (selected) return
    setSelected(option)
    const correct = option === questions[qIndex].card.back
    if (correct) setScore((s) => s + 1)
  }

  function next() {
    if (qIndex + 1 >= questions.length) {
      addQuizResult(activeSubjectId, score, questions.length)
      setPhase('done')
    } else {
      setQIndex((i) => i + 1)
      setSelected(null)
    }
  }

  const subjectResults = data.quizResults.filter((r) => r.subjectId === activeSubjectId).slice(-5).reverse()

  if (phase === 'setup') {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Quiz</h1>
        <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
          <label className="block text-sm font-medium">Subject</label>
          <select
            value={activeSubjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            {data.subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <label className="block text-sm font-medium">Number of questions</label>
          <input
            type="number"
            min={1}
            max={Math.max(1, cards.length)}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <p className="text-xs text-slate-500">{cards.length} flashcard{cards.length === 1 ? '' : 's'} available in this subject.</p>

          <button
            onClick={startQuiz}
            disabled={cards.length < 2}
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-slate-300"
          >
            {cards.length < 2 ? 'Need at least 2 flashcards to quiz' : 'Start quiz'}
          </button>
        </div>

        {subjectResults.length > 0 && (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="mb-2 text-sm font-semibold">Recent results</h2>
            <ul className="space-y-1 text-sm text-slate-600">
              {subjectResults.map((r) => (
                <li key={r.id} className="flex justify-between">
                  <span>{new Date(r.date).toLocaleString()}</span>
                  <span className="font-medium">{r.score} / {r.total}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  if (phase === 'done') {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Quiz complete</h1>
        <p className="text-4xl font-bold text-indigo-600">{score} / {questions.length}</p>
        <button onClick={() => setPhase('setup')} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          Back to quiz setup
        </button>
      </div>
    )
  }

  const q = questions[qIndex]
  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="flex justify-between text-sm text-slate-500">
        <span>Question {qIndex + 1} / {questions.length}</span>
        <span>Score: {score}</span>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="mb-4 text-lg font-medium">{q.card.front}</p>
        <div className="space-y-2">
          {q.options.map((opt) => {
            const isCorrect = opt === q.card.back
            const isSelected = opt === selected
            let cls = 'border-slate-200 hover:bg-slate-50'
            if (selected) {
              if (isCorrect) cls = 'border-emerald-400 bg-emerald-50'
              else if (isSelected) cls = 'border-red-400 bg-red-50'
            }
            return (
              <button
                key={opt}
                onClick={() => answer(opt)}
                className={`w-full rounded-md border px-4 py-2 text-left text-sm ${cls}`}
              >
                {opt}
              </button>
            )
          })}
        </div>
      </div>
      {selected && (
        <button onClick={next} className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          {qIndex + 1 >= questions.length ? 'Finish quiz' : 'Next question'}
        </button>
      )}
    </div>
  )
}
