"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Button from "@/components/ui/Button"
import { useProgress } from "@/hooks/useProgress"
import { trackLessonStarted, trackLessonCompleted } from "@/lib/xapi/tracker"

const SLUG = "3-risiko-listrik-dan-pengisian-baterai"

const hazardHotspots = [
  { id: "h1", label: "Kabel charger terkelupas", left: 15.3, top: 53.1, width: 10.2, height: 11.2 },
  { id: "h2", label: "Kabel melintang di lantai", left: 14.7, top: 78.1, width: 20.3, height: 12.8 },
  { id: "h3", label: "Stop kontak terlalu penuh", left: 34.4, top: 62.2, width: 17.3, height: 11.2 },
  { id: "h4", label: "Power strip tertutup tas/kain", left: 34.1, top: 74.9, width: 17.9, height: 14.3 },
  { id: "h5", label: "Adaptor longgar", left: 57.4, top: 74.4, width: 10.2, height: 15.4 },
  { id: "h6", label: "Ponsel dicas dekat air tumpah", left: 66.7, top: 57.9, width: 16.1, height: 14.9 },
  { id: "h7", label: "Perangkat panas", left: 85.2, top: 57.9, width: 12.6, height: 15.4 },
  { id: "h8", label: "Colokan di area berantakan", left: 78.1, top: 76.5, width: 18.5, height: 16.5 },
]

const areaChecklist = [
  { id: "kering", label: "KERING (Dry) - Tidak ada air atau cairan di sekitar." },
  { id: "rapi", label: "RAPI (Neat) - Kabel tidak bersimpangan dan tertata." },
  { id: "tidak-panas", label: "TIDAK PANAS - Sirkulasi udara baik, jauh dari benda panas." },
  { id: "tidak-berdesakan", label: "TIDAK BERDESAKAN - Tidak menumpuk di satu stop kontak." },
]

const quizQuestions = [
  {
    id: "q1",
    question: "Apa yang harus dilakukan jika kabel charger terkelupas?",
    options: [
      { id: "q1a", text: "Melaporkan ke guru dan mengganti kabel", isCorrect: true },
      { id: "q1b", text: "Membungkusnya dengan lakban", isCorrect: false },
      { id: "q1c", text: "Tetap menggunakannya dengan hati-hati", isCorrect: false },
    ],
    correctMsg: "Benar! Kabel terkelupas harus segera dilaporkan dan diganti.",
    wrongMsg: "Salah. Kabel terkelupas berbahaya dan tidak boleh ditangani sendiri.",
  },
  {
    id: "q2",
    question: "Mengapa kita tidak boleh mengisi daya HP di dekat air?",
    options: [
      { id: "q2a", text: "Karena HP bisa rusak terkena air", isCorrect: false },
      { id: "q2b", text: "Karena air menghantarkan listrik dan bisa menyengat", isCorrect: true },
      { id: "q2c", text: "Karena air membuat charger menjadi lambat", isCorrect: false },
    ],
    correctMsg: "Tepat! Air adalah penghantar listrik yang sangat berbahaya.",
    wrongMsg: "Salah. Air dan listrik adalah kombinasi yang sangat berbahaya.",
  },
  {
    id: "q3",
    question: "Apa langkah pertama saat ponsel terasa sangat panas saat dicas?",
    options: [
      { id: "q3a", text: "Tetap mencharge sampai penuh", isCorrect: false },
      { id: "q3b", text: "Hentikan pengisian daya segera", isCorrect: true },
      { id: "q3c", text: "Menutup ponsel dengan bantal agar dingin", isCorrect: false },
    ],
    correctMsg: "Benar! Hentikan pengisian daya segera untuk mencegah overheat.",
    wrongMsg: "Salah. Ponsel panas harus segera dihentikan pengisiannya.",
  },
]

export default function Lesson3Page() {
  const router = useRouter()
  const { completeLesson } = useProgress()
  const [currentStep, setCurrentStep] = useState<"intro" | "hazard" | "charger" | "area" | "respons" | "audit" | "quiz" | "done">("intro")
  const [foundHazards, setFoundHazards] = useState<string[]>([])
  const [chargerMode, setChargerMode] = useState<"safe" | "unsafe" | null>(null)
  const [chargerFeedback, setChargerFeedback] = useState("")
  const [areaChecked, setAreaChecked] = useState<string[]>([])
  const [responseStep, setResponseStep] = useState(1)
  const [responseDone, setResponseDone] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showFeedback, setShowFeedback] = useState(false)
  const [quizScore, setQuizScore] = useState(0)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    trackLessonStarted("anon", SLUG)
  }, [])

  const handleFoundHazard = (id: string) => {
    if (!foundHazards.includes(id)) {
      setFoundHazards((prev) => [...prev, id])
    }
  }

  const handleChargerClick = (mode: "safe" | "unsafe") => {
    if (!chargerMode) {
      setChargerFeedback("Pilih mode dulu: 'Pilih yang Aman' atau 'Pilih yang Berbahaya'!")
      return
    }
    setChargerFeedback(
      chargerMode === "safe"
        ? "Tepat! Itu adalah charger yang aman (kabel utuh, sesuai standar)."
        : "Tepat! Itu adalah charger yang berbahaya (kabel retak, overheat)."
    )
  }

  const handleAreaCheck = (id: string) => {
    setAreaChecked((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleResponseClick = (step: number) => {
    if (step === responseStep) {
      if (step < 4) {
        setResponseStep(step + 1)
      } else {
        setResponseStep(5)
        setResponseDone(true)
      }
    }
  }

  const handleQuizAnswer = (questionId: string, optionId: string) => {
    if (!showFeedback) {
      setAnswers((prev) => ({ ...prev, [questionId]: optionId }))
    }
  }

  const handleQuizSubmit = () => {
    const correct = quizQuestions.filter(
      (q) => q.options.find((o) => o.id === answers[q.id])?.isCorrect
    ).length
    setQuizScore(Math.round((correct / quizQuestions.length) * 100))
    setShowFeedback(true)
  }

  const handleFinish = useCallback(() => {
    if (!saved) {
      completeLesson(SLUG, quizScore, 150)
      trackLessonCompleted("anon", SLUG, quizScore)
      setSaved(true)
    }
  }, [completeLesson, quizScore, saved])

  const allAnswered = Object.keys(answers).length === quizQuestions.length
  const hazardFoundCount = foundHazards.length

  if (currentStep === "done") {
    return (
      <div className="max-w-lg mx-auto text-center space-y-6 py-10">
        <div className="text-6xl">⚡</div>
        <h2 className="text-2xl font-bold text-green-700">Patroli Selesai!</h2>
        <div className="bg-white rounded-2xl p-6 shadow-md border space-y-4">
          <p className="text-gray-600">Skor kamu: <strong>{quizScore}%</strong></p>
          <p className="text-sm text-gray-500">+150 XP diperoleh</p>
          {quizScore === 100 && (
            <p className="text-green-600 font-bold">Luar biasa! Kamu ahli dalam keselamatan listrik!</p>
          )}
        </div>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => { handleFinish(); router.push("/") }} variant="primary">
            {saved ? "Kembali ke Peta Misi" : "Simpan & Kembali"}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs text-gray-400 uppercase tracking-wide">Misi 3 dari 4</span>
          <h1 className="text-xl font-bold text-gray-900">Risiko Listrik & Pengisian Baterai</h1>
        </div>
        <span className="text-xs text-gray-400">30 menit</span>
      </div>

      <div className="flex gap-2">
        {["intro", "hazard", "charger", "area", "respons", "audit", "quiz"].map((step, i) => (
          <div key={step} className={`h-2 flex-1 rounded-full transition-colors ${["intro", "hazard", "charger", "area", "respons", "audit", "quiz"].indexOf(currentStep) >= i ? "bg-amber-500" : "bg-gray-200"}`} />
        ))}
      </div>

      {currentStep === "intro" && (
        <div className="bg-white rounded-2xl shadow-md border overflow-hidden">
          <img src="/assets/lesson3/hero-risiko-listrik-pengisian-baterai.png" alt="Risiko Listrik" className="w-full h-auto" />
          <div className="p-6 space-y-4">
            <span className="bg-amber-600 text-white px-3 py-1 rounded-full text-sm font-bold inline-block">Tim Patroli Cas Aman</span>
            <h2 className="text-2xl font-bold">Risiko Listrik & Pengisian Baterai</h2>
            <p className="text-gray-600">Jadilah <strong>Tim Patroli Cas Aman</strong>! Pelajari cara mengenali bahaya kabel, memilih charger yang tepat, dan merespons perangkat yang terlalu panas.</p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm">
              <strong>Aturan Emas:</strong> Jangan pakai kabel rusak, cas di tempat kering, dan lapor jika bermasalah.
            </div>
            <Button onClick={() => setCurrentStep("hazard")} variant="primary">Mulai Belajar</Button>
          </div>
        </div>
      )}

      {currentStep === "hazard" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-md border p-6">
            <h2 className="text-2xl font-bold mb-2">Level 1: Cari Bahaya di Kelas</h2>
            <p className="text-gray-500 text-sm mb-4">Klik pada kotak kuning di gambar kelas di bawah ini untuk mengungkap bahaya!</p>
            <p className="font-bold text-amber-600 mb-4">Bahaya ditemukan: {hazardFoundCount} / {hazardHotspots.length}</p>

            <div className="relative w-full border-2 border-gray-800 rounded-xl overflow-visible mb-4 bg-white">
              <img src="/assets/lesson3/level-cari-bahaya-di-kelas.png" alt="Cari Bahaya di Kelas" className="w-full block rounded-xl" />
              {hazardHotspots.map((h) => (
                <button key={h.id} onClick={() => handleFoundHazard(h.id)}
                  className={`absolute border-3 rounded-lg flex items-center justify-center font-bold text-white transition-all duration-300 ${
                    foundHazards.includes(h.id)
                      ? "bg-green-600 border-green-800 shadow-lg cursor-default"
                      : "border-3 border-dashed border-yellow-400 bg-yellow-300/30 hover:bg-yellow-300/50 cursor-pointer"
                  }`}
                  style={{ left: `${h.left}%`, top: `${h.top}%`, width: `${h.width}%`, height: `${h.height}%` }}>
                  {foundHazards.includes(h.id) && (
                    <span className="text-xs sm:text-sm font-bold leading-tight text-center pointer-events-none p-1">{h.label}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="text-center">
            <Button onClick={() => setCurrentStep("charger")} variant="primary">Lanjut ke Pilih Charger</Button>
          </div>
        </div>
      )}

      {currentStep === "charger" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-md border p-6">
            <div className="grid sm:grid-cols-2 gap-6 items-center">
              <div>
                <h2 className="text-2xl font-bold mb-2">Level 2: Pilih Charger Aman</h2>
                <p className="text-gray-500 text-sm mb-4">Tentukan mana perangkat di bawah ini yang <strong>AMAN</strong> dan mana yang <strong>BERBAHAYA</strong>.</p>
                <div className="flex gap-2 mb-4">
                  <button onClick={() => setChargerMode("safe")} className={`px-4 py-2 rounded-lg border text-sm font-bold transition ${chargerMode === "safe" ? "bg-green-100 border-green-500" : "bg-white border-gray-300 hover:bg-gray-50"}`}>✅ Pilih yang AMAN</button>
                  <button onClick={() => setChargerMode("unsafe")} className={`px-4 py-2 rounded-lg border text-sm font-bold transition ${chargerMode === "unsafe" ? "bg-red-100 border-red-500" : "bg-white border-gray-300 hover:bg-gray-50"}`}>❌ Pilih yang BERBAHAYA</button>
                </div>
                {chargerFeedback && (
                  <p className={`text-sm font-medium ${chargerFeedback.includes("Tepat") ? "text-green-600" : "text-red-600"}`}>{chargerFeedback}</p>
                )}
              </div>
              <div>
                <img src="/assets/lesson3/level-pilih-charger-aman.png" alt="Pilih Charger" className="w-full rounded-xl cursor-pointer" onClick={() => handleChargerClick(chargerMode || "safe")} />
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button onClick={() => setCurrentStep("area")} variant="primary">Lanjut ke Susun Area Cas</Button>
          </div>
        </div>
      )}

      {currentStep === "area" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-md border p-6">
            <h2 className="text-2xl font-bold mb-2">Level 3: Susun Area Cas Aman</h2>
            <p className="text-gray-500 text-sm mb-6">Centang syarat-syarat berikut untuk memastikan area Anda aman!</p>

            <div className="grid sm:grid-cols-2 gap-6 items-center">
              <div>
                <img src="/assets/lesson3/level-susun-area-cas-aman.png" alt="Susun Area Cas Aman" className="w-full rounded-xl" />
              </div>
              <div className="space-y-3">
                {areaChecklist.map((item) => (
                  <label key={item.id} onClick={() => handleAreaCheck(item.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition ${
                      areaChecked.includes(item.id) ? "bg-green-50 border-green-300" : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}>
                    <input type="checkbox" checked={areaChecked.includes(item.id)} onChange={() => {}} className="w-5 h-5 accent-green-500" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {areaChecked.length === areaChecklist.length && (
              <div className="mt-4 text-center p-4 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-green-700 font-bold">Area Anda sudah aman! Semua syarat terpenuhi.</p>
              </div>
            )}
          </div>

          <div className="text-center">
            <Button onClick={() => setCurrentStep("respons")} variant="primary">Lanjut ke Tanggap Ponsel Panas</Button>
          </div>
        </div>
      )}

      {currentStep === "respons" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-md border p-6">
            <h2 className="text-2xl font-bold mb-2">Level 4: Tanggap Ponsel Panas</h2>
            <p className="text-gray-500 text-sm mb-6">Ponselmu terasa sangat panas saat dicas. Apa yang harus dilakukan? Klik langkah-langkah di bawah ini secara berurutan!</p>

            <div className="grid sm:grid-cols-2 gap-6 items-center">
              <div className="space-y-3">
                {[
                  { step: 1, text: "Hentikan Pengisian Daya" },
                  { step: 2, text: "Jauhkan dari Panas/Sinar Matahari" },
                  { step: 3, text: "Letakkan di Tempat Aman & Terbuka" },
                  { step: 4, text: "Lapor ke Guru / Orang Dewasa" },
                ].map((item) => (
                  <div key={item.step} onClick={() => handleResponseClick(item.step)}
                    className={`flex justify-between items-center p-4 rounded-xl border-l-4 transition cursor-pointer ${
                      responseStep > item.step ? "bg-green-50 border-l-green-500 opacity-100" :
                      responseStep === item.step ? "bg-white border-l-red-500 opacity-100 hover:bg-gray-50" :
                      "bg-gray-50 border-l-gray-300 opacity-50 cursor-not-allowed"
                    }`}>
                    <span className="text-sm font-medium">{item.step}. {item.text}</span>
                    <button className="bg-gray-800 text-white px-3 py-1 rounded text-xs font-bold">
                      {responseStep > item.step ? "Selesai" : "Lakukan"}
                    </button>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <img src="/assets/lesson3/level-tanggap-ponsel-panas.png" alt="Tanggap Ponsel Panas" className="max-w-full rounded-xl" />
              </div>
            </div>

            {responseDone && (
              <div className="mt-4 text-center p-4 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-green-700 font-bold">Prosedur Selesai! Respon yang tepat menyelamatkan nyawa.</p>
              </div>
            )}
          </div>

          <div className="text-center">
            <Button onClick={() => setCurrentStep("audit")} variant="primary">Lanjut ke Audit</Button>
          </div>
        </div>
      )}

      {currentStep === "audit" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-md border p-6">
            <h2 className="text-2xl font-bold mb-2">Audit Kelas Cas Aman</h2>
            <p className="text-gray-500 text-sm mb-6">Saatnya menerapkan ilmu yang telah dipelajari. Lakukan audit singkat di kelas atau area cas sekolah!</p>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-white border rounded-xl p-6 shadow-sm">
                <h4 className="font-bold mb-4">Formulir Audit</h4>
                <div className="space-y-4">
                  {[
                    { label: "Apakah ada kabel yang terkelupas?", options: ["Tidak ada", "Ada, segera diganti"] },
                    { label: "Apakah stop kontak panas?", options: ["Tidak", "Ya, perlu diperiksa teknisi"] },
                    { label: "Apakah area pengisian jauh dari air?", options: ["Ya", "Tidak, perlu pindah lokasi"] },
                  ].map((item, i) => (
                    <div key={i}>
                      <label className="text-sm font-medium">{item.label}</label>
                      <select className="w-full p-2 border rounded-lg text-sm mt-1 bg-white">
                        {item.options.map((opt, j) => (
                          <option key={j} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                  <button onClick={() => alert("Audit Tersimpan! Terima kasih telah berpartisipasi.")}
                    className="w-full bg-amber-600 text-white py-3 rounded-xl font-bold hover:bg-amber-700 transition">
                    Kirim Laporan Audit
                  </button>
                </div>
              </div>
              <div>
                <img src="/assets/lesson3/level-audit-kelas-cas-aman.png" alt="Audit Kelas" className="w-full rounded-xl" />
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button onClick={() => setCurrentStep("quiz")} variant="primary">Lanjut ke Kuis</Button>
          </div>
        </div>
      )}

      {currentStep === "quiz" && (
        <div className="bg-white rounded-2xl shadow-md border p-6">
          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold inline-block mb-4">📝 Kuis Pemahaman</span>
          <p className="text-gray-500 text-sm mb-6">Uji pengetahuanmu tentang materi risiko listrik di atas.</p>

          <div className="space-y-6">
            {quizQuestions.map((q) => {
              const selected = answers[q.id]
              const correctOpt = q.options.find((o) => o.isCorrect)
              const isCorrect = selected && correctOpt?.id === selected

              return (
                <div key={q.id} className="space-y-2 pb-4 border-b last:border-0">
                  <p className="font-medium">{q.question}</p>
                  <div className="space-y-1">
                    {q.options.map((o) => {
                      const isSelected = selected === o.id
                      let cls = "w-full text-left p-3 rounded-xl border text-sm transition"
                      if (!showFeedback) {
                        cls += isSelected ? " border-blue-500 bg-blue-50" : " border-gray-200 hover:border-blue-300 cursor-pointer"
                      } else {
                        if (o.isCorrect) cls += " border-green-500 bg-green-50"
                        else if (isSelected && !o.isCorrect) cls += " border-red-500 bg-red-50"
                        else cls += " border-gray-200 opacity-60"
                      }
                      return (
                        <button key={o.id} className={cls} onClick={() => handleQuizAnswer(q.id, o.id)} disabled={showFeedback}>
                          {o.text}
                          {showFeedback && o.isCorrect && <span className="ml-2 text-green-600">✓</span>}
                          {showFeedback && isSelected && !o.isCorrect && <span className="ml-2 text-red-600">✗</span>}
                        </button>
                      )
                    })}
                  </div>
                  {showFeedback && (
                    <p className={`text-sm font-medium ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                      {isCorrect ? q.correctMsg : q.wrongMsg}
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          {allAnswered && !showFeedback && (
            <button onClick={handleQuizSubmit} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition mt-4">
              Cek Jawaban
            </button>
          )}

          {showFeedback && (
            <div className="text-center mt-6">
              <p className="text-lg font-bold mb-2">
                Skor: {quizQuestions.filter((q) => q.options.find((o) => o.id === answers[q.id])?.isCorrect).length}/{quizQuestions.length}
              </p>
              <Button onClick={() => setCurrentStep("done")} variant="primary">Selesai</Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
