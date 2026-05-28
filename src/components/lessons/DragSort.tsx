"use client"

import { useState } from "react"
import type { CardSortItem } from "@/types/lesson"

interface DragSortProps {
  items: CardSortItem[]
  onComplete: (score: number) => void
}

export default function DragSort({ items, onComplete }: DragSortProps) {
  const [placed, setPlaced] = useState<Record<string, "safe" | "unsafe">>({})
  const [showResult, setShowResult] = useState(false)

  const handleDrop = (id: string, category: "safe" | "unsafe") => {
    setPlaced((prev) => ({ ...prev, [id]: category }))
  }

  const allPlaced = Object.keys(placed).length === items.length

  const handleCheck = () => {
    const correct = items.filter((i) => placed[i.id] === i.category).length
    onComplete(Math.round((correct / items.length) * 100))
    setShowResult(true)
  }

  const unplaced = items.filter((i) => !placed[i.id])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div
          className="border-2 border-dashed border-green-400 rounded-xl p-4 min-h-[180px] bg-green-50/50"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { const id = e.dataTransfer.getData("text/plain"); handleDrop(id, "safe") }}
        >
          <p className="font-bold text-green-700 text-sm text-center mb-2">Aman ✓</p>
          {Object.entries(placed).filter(([, c]) => c === "safe").map(([id]) => {
            const item = items.find((i) => i.id === id)
            return item ? (
              <div key={id} className="bg-white p-2 rounded-lg shadow-sm mb-1 text-xs border border-green-200">{item.text}</div>
            ) : null
          })}
        </div>

        <div
          className="border-2 border-dashed border-red-400 rounded-xl p-4 min-h-[180px] bg-red-50/50"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { const id = e.dataTransfer.getData("text/plain"); handleDrop(id, "unsafe") }}
        >
          <p className="font-bold text-red-700 text-sm text-center mb-2">Berbahaya ✗</p>
          {Object.entries(placed).filter(([, c]) => c === "unsafe").map(([id]) => {
            const item = items.find((i) => i.id === id)
            return item ? (
              <div key={id} className="bg-white p-2 rounded-lg shadow-sm mb-1 text-xs border border-red-200">{item.text}</div>
            ) : null
          })}
        </div>
      </div>

      {unplaced.length > 0 && !showResult && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-xl border">
          {unplaced.map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => e.dataTransfer.setData("text/plain", item.id)}
              className="bg-white px-3 py-2 rounded-lg shadow-sm cursor-grab text-xs font-medium border hover:shadow-md active:cursor-grabbing select-none"
            >
              {item.text}
            </div>
          ))}
        </div>
      )}

      {allPlaced && !showResult && (
        <button onClick={handleCheck} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition">
          Cek Jawaban
        </button>
      )}

      {showResult && (
        <div className="space-y-2">
          {items.map((item) => {
            const correct = placed[item.id] === item.category
            return (
              <div key={item.id} className={`p-3 rounded-xl text-sm ${correct ? "bg-green-100 border border-green-300" : "bg-red-100 border border-red-300"}`}>
                <span className="font-bold">{item.text}</span>
                <span className={`ml-2 ${correct ? "text-green-700" : "text-red-700"}`}>
                  {correct ? "✓" : `✗ (${item.category === "safe" ? "Aman" : "Berbahaya"})`}
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
