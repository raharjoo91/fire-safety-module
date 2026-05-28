"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import Button from "@/components/ui/Button"
import { useProgress } from "@/hooks/useProgress"
import { trackLessonStarted, trackLessonCompleted } from "@/lib/xapi/tracker"

const SLUG = "4-misi-puncak"

const questions = [
  {
    text: "Saat memeriksa ruang kelas, kamu melihat HP yang sedang di-charge ditutup tumpukan buku tebal. Apa risiko terbesarnya?",
    options: ["HP menjadi cepat rusak", "Kelebihan panas dan berpotensi menyebabkan kebakaran", "Buku menjadi basah", "Sinyal hilang"],
    correct: 1,
  },
  {
    text: "Kamu menemukan tas-tas siswa menumpuk dan menutupi pintu belakang kelas. Apa bahayanya?",
    options: ["Kelas terlihat kotor", "Jalur keluar terhalang saat terjadi keadaan darurat", "Tas akan mudah dicuri", "Suasana kelas menjadi tidak nyaman"],
    correct: 1,
  },
  {
    text: "Kamu melihat kabel isolasinya terkelupas di pojok kelas namun belum menimbulkan percikan api. Sikap yang tepat adalah...",
    options: ["Membiarkannya karena belum terbakar", "Melaporkan segera kepada guru atau penjaga sekolah", "Mencoba memperbaikinya sendiri dengan lakban", "Menyembunyikan kabel tersebut di bawah karpet"],
    correct: 1,
  },
  {
    text: "Di pojok kelas dekat stop kontak listrik, ada tumpukan kertas bekas yang menumpuk. Risiko ini disebut...",
    options: ["Sumber panas dekat bahan mudah terbakar", "Kerapian ruangan yang buruk", "Pemborosan kertas", "Bahaya listrik biasa saja"],
    correct: 0,
  },
  {
    text: "Untuk menemukan bahaya yang tersembunyi, bagian mana dari ruang kelas yang harus diperiksa dengan teliti?",
    options: ["Hanya papan tulis di depan", "Bawah meja, sudut ruang, dan belakang lemari", "Atap langit-langit saja", "Hanya meja guru"],
    correct: 1,
  },
  {
    text: "Stop kontak di dinding kelas dipakai untuk mencharge 5 HP sekaligus. Tindakan paling aman adalah...",
    options: ["Mengabaikannya karena belum terjadi apa-apa", "Membatasi penggunaan, colokan hanya untuk 1 perangkat", "Menutup stop kontak dengan lakban", "Memindahkan stop kontak ke tempat tersembunyi"],
    correct: 1,
  },
]

export default function Lesson4Page() {
  const router = useRouter()
  const { completeLesson } = useProgress()
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const [phase, setPhase] = useState<"hero" | "quiz" | "result">("hero")
  const [currentQ, setCurrentQ] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [timer, setTimer] = useState(600)
  const [isAnswering, setIsAnswering] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [feedbackText, setFeedbackText] = useState("")
  const [feedbackColor, setFeedbackColor] = useState("")
  const [finalScore, setFinalScore] = useState(0)
  const [saved, setSaved] = useState(false)
  const endGameRef = useRef<() => void>(() => {})

  const endGame = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    setFinalScore(score)
    setPhase("result")
  }, [score])

  useEffect(() => {
    endGameRef.current = endGame
  }, [endGame])

  useEffect(() => {
    trackLessonStarted("anon", SLUG)
  }, [])

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          endGameRef.current()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  const loadQuestion = useCallback((qIndex: number) => {
    setIsAnswering(true)
    setSelectedIndex(null)
    setFeedbackText("")
    setFeedbackColor("")
  }, [])

  const checkAnswer = useCallback((selectedIdx: number) => {
    if (!isAnswering) return
    setIsAnswering(false)
    setSelectedIndex(selectedIdx)

    const q = questions[currentQ]
    if (selectedIdx === q.correct) {
      setFeedbackText("BENAR! +100 XP")
      setFeedbackColor("text-green-600")
      setScore((prev) => {
        const newScore = prev + 100
        return newScore
      })
      setStreak((prev) => {
        const newStreak = prev + 1
        if (newStreak > 2) {
          setFeedbackText((t) => t + " 🔥 Streak Bonus!")
          setScore((s) => s + 50)
        }
        return newStreak
      })
    } else {
      setFeedbackText("SALAH! Jawaban benar ditandai Hijau.")
      setFeedbackColor("text-red-600")
      setStreak(0)
    }
  }, [currentQ, isAnswering])

  const nextQuestion = useCallback(() => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((prev) => prev + 1)
      loadQuestion(currentQ + 1)
    } else {
      endGameRef.current()
    }
  }, [currentQ, loadQuestion])

  const handleStart = () => {
    setPhase("quiz")
    loadQuestion(0)
    startTimer()
  }

  const handleFinish = useCallback(() => {
    if (!saved) {
      const scorePct = Math.min(100, Math.round((score / (questions.length * 100)) * 100))
      completeLesson(SLUG, scorePct, 200)
      trackLessonCompleted("anon", SLUG, scorePct)
      setSaved(true)
    }
  }, [completeLesson, score, saved])

  const timerMinutes = Math.floor(timer / 60)
  const timerSeconds = timer % 60

  const progressPct = ((currentQ + (isAnswering ? 0 : 0)) / questions.length) * 100

  const getRank = () => {
    if (finalScore >= 600) return "🌟 Ahli Keselamatan Sekolah 🌟"
    if (finalScore >= 400) return "🛡️ Petugas Keamanan Junior"
    return "🚧 Calon Anggota Safety Squad"
  }

  if (phase === "result") {
    return (
      <div className="max-w-lg mx-auto space-y-6 py-10">
        <div className="bg-white rounded-2xl shadow-md border p-6 text-center space-y-4">
          <div className="text-6xl">🏆</div>
          <h2 className="text-2xl font-bold text-blue-700">Misi Selesai!</h2>
          <p className="text-gray-500">Total Poin XP</p>
          <div className="text-5xl font-bold text-blue-600">{finalScore}</div>
          <div className="bg-gray-50 p-4 rounded-xl text-left">
            <strong>Status Tim:</strong>
            <p>{getRank()}</p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => { handleFinish(); router.push("/") }} variant="primary">
              {saved ? "Kembali ke Peta Misi" : "Simpan & Kembali"}
            </Button>
            <Button onClick={() => { setPhase("hero"); setCurrentQ(0); setScore(0); setStreak(0); setTimer(600); setFinalScore(0) }} variant="secondary">
              Main Lagi
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-md border overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex justify-between items-center text-sm font-bold mb-2">
            <span className="text-red-500">🔥 {streak}</span>
            <span className="text-blue-600">⏱️ {timerMinutes}:{timerSeconds.toString().padStart(2, "0")}</span>
            <span className="text-amber-500">⭐ {score}</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-amber-400 transition-all duration-300" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        {phase === "hero" && (
          <div className="p-6 text-center space-y-4">
            <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
              🏆 MISI PUNCAK<br />SAFETY SQUAD
            </div>
            <h2 className="text-xl font-bold">Cek Risiko Kelas</h2>
            <p className="text-gray-500 text-sm">Selesaikan misi dalam 10 menit!</p>
            <button onClick={handleStart} className="bg-blue-600 text-white px-10 py-3 rounded-full text-lg font-bold shadow-lg hover:bg-blue-700 transition">
              Mulai Misi
            </button>
          </div>
        )}

        {phase === "quiz" && (
          <div className="p-6">
            <div className="mb-4">
              <span className="text-xs font-bold text-blue-600">PERTANYAAN {currentQ + 1} / {questions.length}</span>
              <p className="text-lg font-bold mt-1">{questions[currentQ].text}</p>
            </div>

            <div className="space-y-2">
              {questions[currentQ].options.map((opt, index) => {
                const isSelected = selectedIndex === index
                const isCorrect = index === questions[currentQ].correct
                let cls = "w-full text-left p-4 rounded-xl border-2 text-sm transition-all"
                if (selectedIndex === null) {
                  cls += " border-gray-200 hover:border-blue-400 cursor-pointer"
                } else {
                  if (isCorrect) cls += " border-green-500 bg-green-100 text-green-900"
                  else if (isSelected && !isCorrect) cls += " border-red-500 bg-red-100 text-red-900"
                  else cls += " border-gray-200 opacity-50"
                }
                return (
                  <button key={index} className={cls}
                    onClick={() => { if (selectedIndex === null) checkAnswer(index) }}
                    disabled={selectedIndex !== null}>
                    {opt}
                    {selectedIndex !== null && isCorrect && <span className="ml-2">✓</span>}
                    {selectedIndex !== null && isSelected && !isCorrect && <span className="ml-2">✗</span>}
                  </button>
                )
              })}
            </div>

            <div id="feedback-msg" className={`text-center mt-4 font-bold min-h-6 ${feedbackColor}`}>
              {feedbackText}
            </div>

            {selectedIndex !== null && (
              <button onClick={nextQuestion} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition mt-4">
                {currentQ < questions.length - 1 ? "Lanjut ➜" : "Lihat Hasil"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
