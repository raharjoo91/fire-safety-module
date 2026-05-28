"use client"

import { useState, useEffect, useCallback, use } from "react"
import type { Lesson } from "@/types/lesson"
import type { BranchingStep, HazardSpottingScene, CardSortItem } from "@/types/lesson"
import SafetyMeter from "@/components/ui/SafetyMeter"
import CardSort from "@/components/lessons/CardSort"
import BranchingScenario from "@/components/lessons/BranchingScenario"
import HazardSpotting from "@/components/lessons/HazardSpotting"
import DragSort from "@/components/lessons/DragSort"
import RoomAudit from "@/components/lessons/RoomAudit"
import Button from "@/components/ui/Button"
import { useProgress } from "@/hooks/useProgress"
import { useSafetyMeter } from "@/hooks/useSafetyMeter"
import { trackLessonStarted } from "@/lib/xapi/tracker"

export default function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const { completeLesson } = useProgress()
  const { level, message, adjust, reset } = useSafetyMeter()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [currentActivity, setCurrentActivity] = useState(0)
  const [score, setScore] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch(`/api/lessons/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setLesson(data)
        trackLessonStarted("anon", slug)
        setLoading(false)
      })
      .catch(() => {
        import(`@/data/${slug}.json`).then((mod) => {
          setLesson(mod.default as Lesson)
          trackLessonStarted("anon", slug)
          setLoading(false)
        })
      })
  }, [slug])

  const handleActivityComplete = useCallback((activityScore: number) => {
    setScore((prev) => Math.min(100, prev + activityScore))
    adjust(activityScore > 60 ? 5 : -5)

    setTimeout(() => {
      if (lesson && currentActivity < lesson.activities.length - 1) {
        setCurrentActivity((prev) => prev + 1)
      } else {
        setCompleted(true)
        setSaved(true)
        if (lesson) {
          const finalScore = Math.min(100, score + activityScore)
          completeLesson(slug, finalScore, lesson.xpReward)
        }
      }
    }, 1500)
  }, [currentActivity, lesson, adjust, completeLesson, slug, score])

  const handleFinish = useCallback(() => {
    if (lesson && !saved) {
      completeLesson(slug, score, lesson.xpReward)
      setSaved(true)
    }
  }, [slug, score, lesson, completeLesson, saved])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-gray-500">Memuat pelajaran...</p>
        </div>
      </div>
    )
  }

  if (!lesson) {
    return <div className="text-center py-20 text-red-500">Pelajaran tidak ditemukan</div>
  }

  if (completed) {
    return (
      <div className="max-w-lg mx-auto text-center space-y-6 py-10">
        <div className="text-6xl">🎉</div>
        <h2 className="text-2xl font-bold text-green-700">Misi Selesai!</h2>
        <div className="bg-white rounded-2xl p-6 shadow-md border space-y-4">
          <p className="text-gray-600">Skor kamu: <strong>{Math.min(100, score)}%</strong></p>
          <SafetyMeter level={level} maxLevel={100} message={message} />
          <p className="text-sm text-gray-500">+{lesson.xpReward} XP diperoleh</p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button href="/" variant="primary">Kembali ke Peta Misi</Button>
        </div>
      </div>
    )
  }

  const activity = lesson.activities[currentActivity]
  const progressPct = ((currentActivity + 1) / lesson.activities.length) * 100

  const renderActivity = () => {
    switch (activity.type) {
      case "info":
        return (
          <div className="space-y-4 text-center">
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
              <h3 className="text-lg font-bold text-blue-800 mb-2">{activity.title}</h3>
              <p className="text-gray-700">{activity.instruction}</p>
            </div>
            {(activity.content as { fact?: string; image?: string }).fact && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm">
                <span className="font-bold">💡 Fakta: </span>
                {(activity.content as { fact: string }).fact}
              </div>
            )}
            <Button onClick={() => handleActivityComplete(100)} variant="primary">
              Lanjut
            </Button>
          </div>
        )

      case "card-sort":
        return (
          <CardSort
            items={(activity.content as { cards: CardSortItem[] }).cards}
            onComplete={handleActivityComplete}
          />
        )

      case "branching-scenario":
        return (
          <BranchingScenario
            steps={(activity.content as { steps: BranchingStep[] }).steps}
            onComplete={handleActivityComplete}
          />
        )

      case "hazard-spotting":
        return (
          <HazardSpotting
            scene={activity.content as unknown as HazardSpottingScene}
            onComplete={handleActivityComplete}
          />
        )

      case "drag-sort":
        return (
          <DragSort
            items={(activity.content as { items: CardSortItem[] }).items}
            onComplete={handleActivityComplete}
          />
        )

      case "room-audit":
        return (
          <RoomAudit
            image={(activity.content as { image: string }).image}
            hazards={(activity.content as { hazards: { id: string; text: string; targetX: number; targetY: number }[] }).hazards}
            distractors={(activity.content as { distractors: { id: string; text: string; x: number; y: number }[] }).distractors}
            onComplete={handleActivityComplete}
          />
        )

      case "quiz":
        return (
          <QuizComponent
            questions={(activity.content as { questions: { id: string; question: string; options: { id: string; text: string; isCorrect: boolean; explanation: string }[] }[] }).questions}
            onComplete={handleActivityComplete}
          />
        )

      default:
        return <p className="text-gray-500">Aktivitas tidak dikenal</p>
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs text-gray-400 uppercase tracking-wide">Pelajaran {lesson.order} dari 6</span>
          <h1 className="text-xl font-bold text-gray-900">{lesson.title}</h1>
        </div>
        <span className="text-xs text-gray-400">{lesson.estimatedMinutes} menit</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
      </div>

      <div className="bg-white rounded-2xl shadow-md border p-5">
        <h2 className="font-bold text-lg mb-1">{activity.title}</h2>
        <p className="text-sm text-gray-500 mb-4">{activity.instruction}</p>
        {renderActivity()}
      </div>
    </div>
  )
}

function QuizComponent({
  questions,
  onComplete,
}: {
  questions: { id: string; question: string; options: { id: string; text: string; isCorrect: boolean; explanation: string }[] }[]
  onComplete: (score: number) => void
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)

  const handleAnswer = (questionId: string, optionId: string) => {
    if (!showResults) {
      setAnswers((prev) => ({ ...prev, [questionId]: optionId }))
    }
  }

  const allAnswered = Object.keys(answers).length === questions.length

  const handleSubmit = () => {
    const correct = questions.filter((q) => q.options.find((o) => o.id === answers[q.id])?.isCorrect).length
    onComplete(Math.round((correct / questions.length) * 100))
    setShowResults(true)
  }

  return (
    <div className="space-y-6">
      {questions.map((q) => {
        const selected = answers[q.id]
        const correctOption = q.options.find((o) => o.isCorrect)
        const isCorrect = selected && correctOption?.id === selected

        return (
          <div key={q.id} className="space-y-2">
            <p className="font-medium text-sm">{q.question}</p>
            <div className="space-y-1">
              {q.options.map((o) => {
                const isSelected = selected === o.id
                let cls = "w-full text-left p-3 rounded-xl border text-sm transition"

                if (!showResults) {
                  cls += isSelected ? " border-blue-500 bg-blue-50" : " border-gray-200 hover:border-blue-300"
                } else {
                  if (o.isCorrect) cls += " border-green-500 bg-green-50"
                  else if (isSelected && !o.isCorrect) cls += " border-red-500 bg-red-50"
                  else cls += " border-gray-200 opacity-60"
                }

                return (
                  <button key={o.id} className={cls} onClick={() => handleAnswer(q.id, o.id)} disabled={showResults}>
                    <span className="text-xs">{o.text}</span>
                    {showResults && o.isCorrect && <span className="ml-2 text-green-600">✓</span>}
                    {showResults && isSelected && !o.isCorrect && <span className="ml-2 text-red-600">✗</span>}
                  </button>
                )
              })}
            </div>
            {showResults && (
              <p className={`text-xs ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                {q.options.find((o) => o.id === selected)?.explanation}
              </p>
            )}
          </div>
        )
      })}

      {allAnswered && !showResults && (
        <button onClick={handleSubmit} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition">
          Cek Jawaban
        </button>
      )}
    </div>
  )
}
