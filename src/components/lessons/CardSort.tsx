"use client"

import { useState } from "react"
import type { CardSortItem } from "@/types/lesson"

interface CardSortProps {
  items: CardSortItem[]
  onComplete: (score: number) => void
}

export default function CardSort({ items, onComplete }: CardSortProps) {
  const [placed, setPlaced] = useState<Record<string, "safe" | "unsafe">>({})
  const [showFeedback, setShowFeedback] = useState(false)

  const handleDrop = (id: string, category: "safe" | "unsafe") => {
    setPlaced((prev) => ({ ...prev, [id]: category }))
  }

  const totalPlaced = Object.keys(placed).length
  const allPlaced = totalPlaced === items.length

  const handleSubmit = () => {
    const correct = items.filter((item) => placed[item.id] === item.category).length
    const score = Math.round((correct / items.length) * 100)
    onComplete(score)
    setShowFeedback(true)
  }

  const unplaced = items.filter((item) => !placed[item.id])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div
          className="border-2 border-dashed border-green-400 rounded-xl p-4 min-h-[200px] bg-green-50"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            const id = e.dataTransfer.getData("text/plain")
            handleDrop(id, "safe")
          }}
        >
          <h4 className="font-bold text-green-700 text-sm mb-2 text-center">Aman ✓</h4>
          {Object.entries(placed).filter(([, c]) => c === "safe").map(([id]) => {
            const item = items.find((i) => i.id === id)
            return item ? (
              <div key={id} className="bg-white p-2 rounded-lg shadow mb-2 text-xs font-medium text-green-800 border border-green-200">
                {item.text}
              </div>
            ) : null
          })}
        </div>

        <div
          className="border-2 border-dashed border-red-400 rounded-xl p-4 min-h-[200px] bg-red-50"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            const id = e.dataTransfer.getData("text/plain")
            handleDrop(id, "unsafe")
          }}
        >
          <h4 className="font-bold text-red-700 text-sm mb-2 text-center">Berbahaya ✗</h4>
          {Object.entries(placed).filter(([, c]) => c === "unsafe").map(([id]) => {
            const item = items.find((i) => i.id === id)
            return item ? (
              <div key={id} className="bg-white p-2 rounded-lg shadow mb-2 text-xs font-medium text-red-800 border border-red-200">
                {item.text}
              </div>
            ) : null
          })}
        </div>
      </div>

      {unplaced.length > 0 && (
        <div className="border rounded-xl p-4 bg-gray-50">
          <h4 className="text-xs text-gray-500 mb-2">Kartu yang tersisa (seret ke kolom di atas):</h4>
          <div className="flex flex-wrap gap-2">
            {unplaced.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => e.dataTransfer.setData("text/plain", item.id)}
                className="bg-white px-3 py-2 rounded-lg shadow cursor-grab text-xs font-medium border hover:shadow-md active:cursor-grabbing select-none"
              >
                {item.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {allPlaced && !showFeedback && (
        <button onClick={handleSubmit} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition">
          Cek Jawaban
        </button>
      )}

      {showFeedback && (
        <div className="space-y-2">
          {items.map((item) => {
            const isCorrect = placed[item.id] === item.category
            return (
              <div key={item.id} className={`p-3 rounded-xl text-sm ${isCorrect ? "bg-green-100 border border-green-300" : "bg-red-100 border border-red-300"}`}>
                <span className="font-bold">{item.text}</span>
                <span className={`ml-2 ${isCorrect ? "text-green-700" : "text-red-700"}`}>
                  {isCorrect ? "✓ Benar" : `✗ Seharusnya: ${item.category === "safe" ? "Aman" : "Berbahaya"}`}
                </span>
                <p className="text-xs text-gray-600 mt-1">{item.explanation}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
