import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { isDue, type RatingLabel } from '../lib/srs'

const BUTTONS: { label: RatingLabel; className: string }[] = [
  { label: 'Again', className: 'bg-red-500 hover:bg-red-600' },
  { label: 'Hard', className: 'bg-orange-500 hover:bg-orange-600' },
  { label: 'Good', className: 'bg-emerald-500 hover:bg-emerald-600' },
  { label: 'Easy', className: 'bg-sky-500 hover:bg-sky-600' },
]

export default function Review() {
  const { subjectId } = useParams<{ subjectId: string }>()
  const { data, reviewFlashcard } = useData()
  const subject = data.subjects.find((s) => s.id === subjectId)

  const dueCards = useMemo(
    () => data.flashcards.filter((f) => f.subjectId === subjectId && isDue(f)),
    [data.flashcards, subjectId],
  )

  const [queue] = useState(() => dueCards.map((c) => c.id))
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [reviewedCount, setReviewedCount] = useState(0)

  const currentId = queue[index]
  const current = data.flashcards.find((f) => f.id === currentId)

  if (!subject) return <p className="text-sm text-slate-500">Subject not found.</p>

  if (!current || index >= queue.length) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Review complete 🎉</h1>
        <p className="text-slate-600">
          You reviewed {reviewedCount} card{reviewedCount === 1 ? '' : 's'} for {subject.name}.
        </p>
        <Link to="/flashcards" className="inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          Back to flashcards
        </Link>
      </div>
    )
  }

  function handleRate(rating: RatingLabel) {
    reviewFlashcard(current!.id, rating)
    setReviewedCount((n) => n + 1)
    setRevealed(false)
    setIndex((i) => i + 1)
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>{subject.name}</span>
        <span>{index + 1} / {queue.length}</span>
      </div>

      <div
        onClick={() => setRevealed(true)}
        className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm"
      >
        <p className="text-lg font-medium">{current.front}</p>
        {revealed && (
          <>
            <hr className="w-full border-slate-200" />
            <p className="text-slate-600">{current.back}</p>
          </>
        )}
        {!revealed && <p className="text-xs text-slate-400">Click to reveal answer</p>}
      </div>

      {revealed ? (
        <div className="grid grid-cols-4 gap-2">
          {BUTTONS.map((b) => (
            <button
              key={b.label}
              onClick={() => handleRate(b.label)}
              className={`rounded-md px-2 py-2 text-sm font-medium text-white ${b.className}`}
            >
              {b.label}
            </button>
          ))}
        </div>
      ) : (
        <button
          onClick={() => setRevealed(true)}
          className="w-full rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900"
        >
          Show answer
        </button>
      )}
    </div>
  )
}
