"use client"

import { useState } from "react"

interface HazardItem {
  id: string
  text: string
  targetX: number
  targetY: number
}

interface DistractorItem {
  id: string
  text: string
  x: number
  y: number
}

interface RoomAuditProps {
  image: string
  hazards: HazardItem[]
  distractors: DistractorItem[]
  onComplete: (score: number) => void
}

export default function RoomAudit({ image: _, hazards, distractors, onComplete }: RoomAuditProps) {
  const [placed, setPlaced] = useState<string[]>([])
  const [showResult, setShowResult] = useState(false)

  const togglePlace = (id: string) => {
    setPlaced((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const allPlaced = placed.length === hazards.length
  const extraPlaced = placed.length > hazards.length

  const handleSubmit = () => {
    const correct = hazards.filter((h) => placed.includes(h.id)).length
    const total = hazards.length
    const score = Math.round((correct / total) * 100)
    onComplete(score)
    setShowResult(true)
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-100 rounded-2xl border p-4 shadow-inner min-h-[300px] flex items-center justify-center">
        <p className="text-gray-400 text-sm">[Gambar denah kamar asrama]</p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Tandai bahaya yang kamu temukan:</p>
        <div className="flex flex-wrap gap-2">
          {hazards.map((h) => (
            <button
              key={h.id}
              onClick={() => togglePlace(h.id)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition ${
                placed.includes(h.id)
                  ? "bg-red-500 text-white border-red-600"
                  : "bg-white hover:bg-red-50 border-gray-200"
              }`}
            >
              {h.text}
            </button>
          ))}
          {distractors.map((d) => (
            <button
              key={d.id}
              onClick={() => togglePlace(d.id)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition opacity-60 ${
                placed.includes(d.id)
                  ? "bg-yellow-500 text-white border-yellow-600"
                  : "bg-white border-gray-200"
              }`}
            >
              {d.text}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400">
        {placed.length} dari {hazards.length} bahaya ditandai
      </p>

      {allPlaced && !showResult && (
        <button onClick={handleSubmit} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition">
          Selesaikan Audit
        </button>
      )}

      {extraPlaced && !showResult && (
        <p className="text-xs text-yellow-600">Kamu menandai terlalu banyak item. Hanya {hazards.length} yang benar-benar bahaya.</p>
      )}

      {showResult && (
        <div className="p-4 rounded-xl bg-green-100 border border-green-300 text-sm text-green-800">
          Audit selesai! Kamu mengidentifikasi bahaya dengan baik.
        </div>
      )}
    </div>
  )
}
