import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import type { Chapter, QuizAttempt, QuizQuestion } from '../types'

export default function ChapterQuiz() {
  const { chapterId } = useParams<{ chapterId: string }>()
  const id = Number(chapterId)

  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])
  const [newQ, setNewQ] = useState('')
  const [newA, setNewA] = useState('')

  const [quizActive, setQuizActive] = useState(false)
  const [order, setOrder] = useState<number[]>([])
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [results, setResults] = useState<Record<number, boolean>>({})

  function reload() {
    api.getChapters().then((all) => setChapter(all.find((c) => c.id === id) ?? null))
    api.getQuestions(id).then(setQuestions)
    api.getAttempts(id).then(setAttempts)
  }

  useEffect(reload, [id])

  async function addQuestion() {
    if (!newQ.trim() || !newA.trim()) return
    await api.addQuestion(id, newQ.trim(), newA.trim())
    setNewQ('')
    setNewA('')
    reload()
  }

  async function removeQuestion(qid: number) {
    await api.deleteQuestion(qid)
    reload()
  }

  function startQuiz() {
    setOrder(questions.map((q) => q.id))
    setIndex(0)
    setRevealed(false)
    setResults({})
    setQuizActive(true)
  }

  function mark(correct: boolean) {
    const qid = order[index]
    setResults((r) => ({ ...r, [qid]: correct }))
    setRevealed(false)
    setIndex((i) => i + 1)
  }

  async function finishQuiz(finalResults: Record<number, boolean>) {
    const total = order.length
    const correct = Object.values(finalResults).filter(Boolean).length
    await api.addAttempt(id, correct, total)
    setQuizActive(false)
    reload()
  }

  useEffect(() => {
    if (quizActive && index >= order.length && order.length > 0) {
      finishQuiz(results)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  if (!chapter) return <p className="text-sm text-slate-500">Loading…</p>

  if (quizActive && index < order.length) {
    const q = questions.find((x) => x.id === order[index])!
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <div className="flex justify-between text-sm text-slate-500">
          <span>{chapter.title}</span>
          <span>{index + 1} / {order.length}</span>
        </div>
        <div
          onClick={() => setRevealed(true)}
          className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm"
        >
          <p className="text-lg font-medium">{q.question}</p>
          {revealed ? (
            <>
              <hr className="w-full border-slate-200" />
              <p className="text-slate-600">{q.answer}</p>
            </>
          ) : (
            <p className="text-xs text-slate-400">Tap to reveal answer</p>
          )}
        </div>
        {revealed && (
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => mark(false)} className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600">
              Incorrect
            </button>
            <button onClick={() => mark(true)} className="rounded-md bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700">
              Correct
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/reading" className="text-xs text-pink-700 hover:underline">← Back to reading</Link>
          <h1 className="text-2xl font-semibold">{chapter.title}</h1>
        </div>
        <button
          onClick={startQuiz}
          disabled={questions.length === 0}
          className="rounded-md bg-pink-700 px-4 py-2 text-sm font-medium text-white hover:bg-pink-800 disabled:bg-slate-300"
        >
          Start quiz ({questions.length})
        </button>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-semibold text-slate-700">Self-assessment questions</h2>
        <div className="mb-3 grid gap-2 sm:grid-cols-2">
          <input
            value={newQ}
            onChange={(e) => setNewQ(e.target.value)}
            placeholder="Question"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            value={newA}
            onChange={(e) => setNewA(e.target.value)}
            placeholder="Answer"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <button onClick={addQuestion} className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900 sm:col-span-2">
            + Add question
          </button>
        </div>
        <ul className="space-y-2">
          {questions.map((q) => (
            <li key={q.id} className="flex items-center justify-between gap-2 rounded-md border border-slate-100 p-2 text-sm">
              <span className="flex-1">{q.question}</span>
              <span className="flex-1 text-slate-500">{q.answer}</span>
              <button onClick={() => removeQuestion(q.id)} className="text-xs text-red-500 hover:underline">
                Delete
              </button>
            </li>
          ))}
          {questions.length === 0 && <li className="text-sm text-slate-400">Paste in your self-assessment Q&A above.</li>}
        </ul>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-semibold text-slate-700">Comprehension score history</h2>
        {attempts.length === 0 ? (
          <p className="text-sm text-slate-500">No quiz attempts yet.</p>
        ) : (
          <ul className="space-y-1">
            {attempts.map((a) => (
              <li key={a.id} className="flex justify-between text-sm">
                <span>{a.date}</span>
                <span className="font-medium">
                  {a.correct_count} / {a.total_count} ({Math.round((a.correct_count / a.total_count) * 100)}%)
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
