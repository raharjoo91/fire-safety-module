"use client"

import { useState } from "react"
import type { BranchingStep } from "@/types/lesson"
import SafetyMeter from "@/components/ui/SafetyMeter"
import { SAFETY_METER_MAX } from "@/lib/gamification/engine"

interface BranchingScenarioProps {
  steps: BranchingStep[]
  onComplete: (score: number, choices: boolean[]) => void
}

export default function BranchingScenario({ steps, onComplete }: BranchingScenarioProps) {
  const [currentStepId, setCurrentStepId] = useState(steps[0]?.id || "")
  const [safetyLevel, setSafetyLevel] = useState(SAFETY_METER_MAX)
  const [choices, setChoices] = useState<boolean[]>([])
  const [finished, setFinished] = useState(false)
  const [feedback, setFeedback] = useState<{ text: string; isSafe: boolean } | null>(null)

  const currentStep = steps.find((s) => s.id === currentStepId)

  const handleChoice = (choice: BranchingStep["choices"][0]) => {
    setSafetyLevel((prev) => Math.max(0, Math.min(SAFETY_METER_MAX, prev + choice.safetyDelta)))
    setChoices((prev) => [...prev, choice.isSafe])
    setFeedback({ text: choice.explanation, isSafe: choice.isSafe })

    setTimeout(() => {
      setFeedback(null)
      if (choice.nextStepId) {
        setCurrentStepId(choice.nextStepId)
      } else {
        setFinished(true)
      }
    }, 2000)
  }

  if (finished) {
    const score = Math.round((choices.filter((c) => c).length / choices.length) * 100)
    return (
      <div className="text-center space-y-4 py-6">
        <div className={`text-4xl ${score >= 60 ? "text-green-500" : "text-red-500"}`}>
          {score >= 60 ? "🏆" : "💪"}
        </div>
        <h3 className="font-bold text-lg">Skenario Selesai!</h3>
        <SafetyMeter level={safetyLevel} maxLevel={SAFETY_METER_MAX} message={`Skor: ${score}%`} />
        <button onClick={() => { setCurrentStepId(steps[0].id); setSafetyLevel(SAFETY_METER_MAX); setChoices([]); setFinished(false) }} className="text-sm text-blue-600 underline">
          Coba Lagi
        </button>
      </div>
    )
  }

  if (!currentStep) return null

  return (
    <div className="space-y-4">
      {feedback && (
        <div className={`p-4 rounded-xl text-sm font-medium animate-fadeIn ${feedback.isSafe ? "bg-green-100 text-green-800 border border-green-300" : "bg-red-100 text-red-800 border border-red-300"}`}>
          {feedback.text}
        </div>
      )}

      <SafetyMeter level={safetyLevel} maxLevel={SAFETY_METER_MAX} message="" />

      <div className="bg-white rounded-2xl p-5 shadow-md border">
        <p className="text-gray-800 leading-relaxed mb-4">{currentStep.scenario}</p>
        <div className="space-y-2">
          {currentStep.choices.map((choice) => (
            <button
              key={choice.id}
              onClick={() => handleChoice(choice)}
              disabled={!!feedback}
              className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition disabled:opacity-50 text-sm font-medium"
            >
              {choice.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
