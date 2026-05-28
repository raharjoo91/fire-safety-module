"use client"

import { useState } from "react"
import type { HazardSpottingScene } from "@/types/lesson"

interface HazardSpottingProps {
  scene: HazardSpottingScene
  onComplete: (score: number) => void
}

export default function HazardSpotting({ scene, onComplete }: HazardSpottingProps) {
  const [found, setFound] = useState<string[]>([])
  const [feedback, setFeedback] = useState<{ id: string; label: string; isHazard: boolean; explanation: string } | null>(null)

  const handleClick = (hazard: HazardSpottingScene["hotspots"][0]) => {
    if (found.includes(hazard.id)) return

    setFound((prev) => [...prev, hazard.id])
    setFeedback(hazard)

    setTimeout(() => setFeedback(null), 2500)
  }

  const allFound = found.length === scene.hotspots.length

  return (
    <div className="space-y-4">
      <div className="relative rounded-2xl overflow-hidden border shadow-lg bg-gray-100">
        <img src={scene.image} alt="Scene untuk hazard spotting" className="w-full h-auto" />

        {scene.hotspots.map((h) => (
          <button
            key={h.id}
            onClick={() => handleClick(h)}
            className={`absolute border-2 rounded-lg transition-all duration-200 ${
              found.includes(h.id)
                ? h.isHazard
                  ? "border-green-500 bg-green-500/20"
                  : "border-blue-500 bg-blue-500/20"
                : "border-transparent hover:border-yellow-400 hover:bg-yellow-400/20 cursor-pointer"
            }`}
            style={{
              left: `${h.x}%`,
              top: `${h.y}%`,
              width: `${h.width}%`,
              height: `${h.height}%`,
            }}
            title={found.includes(h.id) ? h.label : "Klik untuk periksa"}
            aria-label={h.label}
          />
        ))}
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl text-sm font-medium animate-fadeIn ${
          feedback.isHazard
            ? "bg-red-100 text-red-800 border border-red-300"
            : "bg-green-100 text-green-800 border border-green-300"
        }`}>
          <strong>{feedback.isHazard ? "⚠️ Bahaya! " : "✅ Aman! "}</strong>
          {feedback.explanation}
        </div>
      )}

      <div className="flex justify-between text-sm text-gray-500">
        <span>Ditemukan: {found.length}/{scene.hotspots.length}</span>
        {found.length > 0 && (
          <span>
            {scene.hotspots.filter((h) => h.isHazard).filter((h) => found.includes(h.id)).length} bahaya teridentifikasi
          </span>
        )}
      </div>

      {allFound && (
        <button
          onClick={() => {
            const correct = scene.hotspots.filter((h) => h.isHazard && found.includes(h.id)).length
            const totalHazards = scene.hotspots.filter((h) => h.isHazard).length
            const score = Math.round((correct / totalHazards) * 100)
            onComplete(score)
          }}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition"
        >
          Lanjut
        </button>
      )}
    </div>
  )
}
