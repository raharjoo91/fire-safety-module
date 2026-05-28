"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import Button from "@/components/ui/Button"
import { useProgress } from "@/hooks/useProgress"
import { trackLessonStarted, trackLessonCompleted } from "@/lib/xapi/tracker"

const SLUG = "2-alarm-evakuasi"

const hazardScenarios = [
  {
    id: "asap",
    title: "Koridor Penuh Asap",
    image: "/assets/lesson2/ikon-hambatan-evakuasi.png",
    desc: "Kamu melihat koridor depan penuh asap tebal hitam dan panas. Pintu itu satu-satunya jalan keluar dekatmu.",
    options: [
      { id: "asap-wrong", text: "Lari menembus asap", isCorrect: false, feedback: "Bahaya! Asap mengandung racun dan bisa membuatmu pingsan." },
      { id: "asap-correct", text: "Rendahkan badan & cari pintu lain", isCorrect: true, feedback: "Tindakan Aman! Asap naik ke atas, merunduk membantumu menghindari asap." },
    ],
  },
  {
    id: "kerumunan",
    title: "Kerumunan di Pintu",
    image: "/assets/lesson2/ikon-hambatan-evakuasi.png",
    desc: "Banyak siswa berkumpul di satu pintu keluar. Pintu macet.",
    options: [
      { id: "kerumunan-wrong", text: "Mendorong dari belakang", isCorrect: false, feedback: "Bahaya! Mendorong bisa menyebabkan cedera dan orang terjatuh." },
      { id: "kerumunan-correct", text: "Tenang & cari pintu darurat lain", isCorrect: true, feedback: "Tindakan Aman! Tetap tenang dan gunakan jalur alternatif." },
    ],
  },
]

const quizQuestions = [
  {
    id: "q1",
    question: "Apa yang harus dilakukan pertama kali setelah alarm kebakaran berbunyi?",
    options: [
      { id: "q1a", text: "Lari keluar kelas secepat mungkin", isCorrect: false },
      { id: "q1b", text: "Diam dan dengarkan instruksi", isCorrect: true },
      { id: "q1c", text: "Mengambil semua barang bawaan", isCorrect: false },
    ],
    correctMsg: "Benar! Diam adalah kunci untuk mendengarkan instruksi keselamatan.",
    wrongMsg: "Salah. Ingat: Jangan lari, jangan ambil barang. Dengarkan dulu instruksinya!",
  },
  {
    id: "q2",
    question: "Saat evakuasi, koridor penuh asap hitam. Apa yang kamu lakukan?",
    options: [
      { id: "q2a", text: "Lari cepat menembus asap", isCorrect: false },
      { id: "q2b", text: "Merendahkan badan dan cari pintu alternatif", isCorrect: true },
      { id: "q2c", text: "Berteriak minta tolong dari tempat aman", isCorrect: false },
    ],
    correctMsg: "Tepat! Asap naik ke atas, merundung membantu kamu menghindari asap beracun.",
    wrongMsg: "Salah. Asap beracun naik ke atas, lebih aman merendahkan badan.",
  },
  {
    id: "q3",
    question: "Setelah tiba di titik kumpul (lapangan), apa yang harus kamu lakukan?",
    options: [
      { id: "q3a", text: "Pulang ke rumah sendiri", isCorrect: false },
      { id: "q3b", text: "Bermain dengan teman sambil menunggu", isCorrect: false },
      { id: "q3c", text: "Tetap tertib dan melapor kepada guru", isCorrect: true },
    ],
    correctMsg: "Benar! Tetap di area aman dan laporkan dirimu agar guru bisa mengabsen.",
    wrongMsg: "Salah. Setelah evakuasi, kamu harus tetap tertib dan melapor ke guru.",
  },
]

export default function Lesson2Page() {
  const router = useRouter()
  const { completeLesson } = useProgress()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [currentStep, setCurrentStep] = useState<"intro" | "alarm" | "evakuasi" | "hambatan" | "debrief" | "quiz" | "done">("intro")
  const [alarmActive, setAlarmActive] = useState(false)
  const [paVisible, setPaVisible] = useState(false)
  const [alarmAnswer, setAlarmAnswer] = useState<string | null>(null)
  const [evacStep, setEvacStep] = useState(1)
  const [evacDone, setEvacDone] = useState(false)
  const [hazardAnswers, setHazardAnswers] = useState<Record<string, string>>({})
  const [checklist, setChecklist] = useState({ aman: false, teman: false, lapor: false })
  const [reflection, setReflection] = useState("")
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showFeedback, setShowFeedback] = useState(false)
  const [quizScore, setQuizScore] = useState(0)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    trackLessonStarted("anon", SLUG)
    audioRef.current = new Audio("/assets/lesson2/alarm PA.mpeg")
  }, [])

  const triggerAlarm = () => {
    setAlarmActive(true)
    audioRef.current?.play().catch(() => {})
    setTimeout(() => {
      setPaVisible(true)
    }, 1000)
    setTimeout(() => {
      setAlarmActive(false)
    }, 6000)
  }

  const handleAlarmAnswer = (answerId: string) => {
    setAlarmAnswer(answerId)
  }

  const handleEvacClick = (step: number) => {
    if (step === evacStep) {
      if (step < 3) {
        setEvacStep(step + 1)
      } else {
        setEvacStep(4)
        setEvacDone(true)
      }
    }
  }

  const handleHazardAnswer = (scenarioId: string, optionId: string) => {
    setHazardAnswers((prev) => ({ ...prev, [scenarioId]: optionId }))
  }

  const handleChecklistChange = (item: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [item]: !prev[item] }))
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

  if (currentStep === "done") {
    return (
      <div className="max-w-lg mx-auto text-center space-y-6 py-10">
        <div className="text-6xl">🚨</div>
        <h2 className="text-2xl font-bold text-green-700">Evakuasi Selesai!</h2>
        <div className="bg-white rounded-2xl p-6 shadow-md border space-y-4">
          <p className="text-gray-600">Skor kamu: <strong>{quizScore}%</strong></p>
          <p className="text-sm text-gray-500">+150 XP diperoleh</p>
          {quizScore === 100 && (
            <p className="text-green-600 font-bold">Luar biasa! Kamu siap menghadapi keadaan darurat!</p>
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
          <span className="text-xs text-gray-400 uppercase tracking-wide">Misi 2 dari 4</span>
          <h1 className="text-xl font-bold text-gray-900">Alarm & Evakuasi Aman</h1>
        </div>
        <span className="text-xs text-gray-400">30 menit</span>
      </div>

      <div className="flex gap-2">
        {["intro", "alarm", "evakuasi", "hambatan", "debrief", "quiz"].map((step, i) => (
          <div key={step} className={`h-2 flex-1 rounded-full transition-colors ${["intro", "alarm", "evakuasi", "hambatan", "debrief", "quiz"].indexOf(currentStep) >= i ? "bg-red-600" : "bg-gray-200"}`} />
        ))}
      </div>

      {currentStep === "intro" && (
        <div className="bg-white rounded-2xl shadow-md border overflow-hidden">
          <img src="/assets/lesson2/hero-alarm-evakuasi.png" alt="Alarm Evakuasi" className="w-full h-auto" />
          <div className="p-6 space-y-4">
            <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold inline-block">Tim Siaga Kebakaran</span>
            <h2 className="text-2xl font-bold">Siap Evakuasi? Jangan Panik, Ikuti Prosedur!</h2>
            <p className="text-gray-600">Modul latihan ini akan mengajakmu mengenali bunyi alarm, membaca peta evakuasi, dan bergerak aman menuju titik kumpul di Lapangan.</p>
            <Button onClick={() => setCurrentStep("alarm")} variant="primary">Mulai Belajar</Button>
          </div>
        </div>
      )}

      {currentStep === "alarm" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-md border p-6">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Misi 1: Kenali Alarm & Pesan PA</h2>
            <p>Saat TOA berbunyi, jangan panik. Tugas pertamamu adalah <strong>Diam</strong> dan <strong>Mendengarkan</strong>.</p>

            <div className={`alarm-box mt-6 p-6 rounded-xl text-center border-2 ${alarmActive ? "bg-red-50 border-red-500 animate-pulse" : "bg-white border-red-600"}`}>
              <h3 className="font-bold mb-2">Simulasi Sistem Alarm</h3>
              <p className="text-sm text-gray-500 mb-4">Tekan tombol di bawah untuk mensimulasikan keadaan darurat.</p>
              <button onClick={triggerAlarm} disabled={alarmActive} className="bg-red-600 text-white px-10 py-3 rounded-full text-lg font-bold shadow-lg hover:bg-red-700 transition disabled:opacity-50">
                {alarmActive ? "🔔 Alarm Berbunyi..." : "🔔 Bunyikan Alarm"}
              </button>

              {paVisible && (
                <div className="bg-gray-900 text-green-400 font-mono p-4 rounded-lg mt-4 text-left border-l-4 border-green-400">
                  <p>&gt;&gt; PERHATIAN, PERHATIAN.</p>
                  <p>&gt;&gt; INI ADALAH SIMULASI EVAKUASI KEBAKARAN.</p>
                  <p>&gt;&gt; MOHON SELURUH SISWA TETAP TENANG.</p>
                  <p>&gt;&gt; HENTIKAN AKTIVITAS, TINGGALKAN BARANG.</p>
                  <p>&gt;&gt; IKUTI JALUR EVAKUASI MENUJU LAPANGAN.</p>
                </div>
              )}
            </div>

            <div className="mt-6">
              <h4 className="font-bold mb-2">Cek Pemahamanmu:</h4>
              <p className="text-sm mb-3">Apa yang harus dilakukan pertama kali setelah alarm berbunyi?</p>
              <div className="space-y-2">
                {[
                  { id: "lari", text: "Lari keluar kelas", isCorrect: false },
                  { id: "diam", text: "Diam dan dengarkan instruksi", isCorrect: true },
                  { id: "ambil", text: "Mengambil barang bawaan", isCorrect: false },
                ].map((opt) => (
                  <button key={opt.id} onClick={() => handleAlarmAnswer(opt.id)}
                    className={`w-full text-left p-3 rounded-xl border text-sm transition ${alarmAnswer === opt.id ? (opt.isCorrect ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50") : "border-gray-200 hover:border-blue-300"}`}>
                    {opt.text}
                    {alarmAnswer === opt.id && opt.isCorrect && <span className="ml-2 text-green-600">✓</span>}
                    {alarmAnswer === opt.id && !opt.isCorrect && <span className="ml-2 text-red-600">✗</span>}
                  </button>
                ))}
              </div>
              {alarmAnswer && (
                <p className={`text-sm font-medium mt-2 ${alarmAnswer === "diam" ? "text-green-600" : "text-red-600"}`}>
                  {alarmAnswer === "diam" ? "Benar! Diam adalah kunci untuk mendengarkan instruksi keselamatan." : "Kurang tepat. Ingat: Jangan lari, jangan ambil barang. Dengarkan dulu!"}
                </p>
              )}
            </div>
          </div>

          <div className="text-center">
            <Button onClick={() => setCurrentStep("evakuasi")} variant="primary">Lanjut ke Rute Evakuasi</Button>
          </div>
        </div>
      )}

      {currentStep === "evakuasi" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-md border p-6">
            <h2 className="text-2xl font-bold mb-2">Misi 2: Rute Evakuasi</h2>
            <p className="text-gray-500 text-sm mb-6">Ikuti alur evakuasi dengan mengklik kotak-kotak di bawah ini secara berurutan.</p>

            <div className="flex flex-wrap justify-center items-center gap-4">
              {[
                { step: 1, label: "KELAS" },
                { step: 2, label: "PINTU" },
                { step: 3, label: "TANGGA" },
              ].map((item) => (
                <div key={item.step} className="flex items-center gap-4">
                  <div onClick={() => handleEvacClick(item.step)}
                    className={`w-36 h-28 rounded-xl border-3 flex flex-col items-center justify-center shadow-md transition-all duration-300 cursor-pointer ${
                      evacStep > item.step ? "bg-green-500 border-green-500 text-white" :
                      evacStep === item.step ? "bg-white border-blue-500 hover:bg-blue-50" :
                      "bg-gray-100 border-gray-300 opacity-40 cursor-not-allowed"
                    }`}>
                    <span className="text-3xl font-bold">{item.step}</span>
                    <span className="text-sm font-bold">{item.label}</span>
                  </div>
                  {item.step < 3 && (
                    <span className={`text-3xl transition-opacity ${evacStep > item.step ? "opacity-100" : "opacity-20"}`}>➡️</span>
                  )}
                </div>
              ))}
            </div>

            {evacDone && (
              <div className="mt-6 text-center bg-white border-2 border-green-500 border-dashed rounded-xl p-6">
                <h2 className="text-2xl font-bold text-green-600">TUJUAN TERCAPAI!</h2>
                <p>Anda telah menemukan rute aman menuju Lapangan.</p>
                <img src="/assets/lesson2/titik-kumpul-lapangan.png" alt="Titik Kumpul Lapangan" className="max-w-full rounded-lg mt-4" />
                <button onClick={() => { setEvacStep(1); setEvacDone(false) }} className="mt-4 bg-red-600 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-red-700 transition">
                  Ulangi Misi
                </button>
              </div>
            )}
          </div>

          <div className="text-center">
            <Button onClick={() => setCurrentStep("hambatan")} variant="primary">Lanjut ke Hadapi Hambatan</Button>
          </div>
        </div>
      )}

      {currentStep === "hambatan" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-md border p-6">
            <h2 className="text-2xl font-bold mb-2">Misi 3: Hadapi Hambatan</h2>
            <p className="text-gray-500 text-sm mb-6">Selama evakuasi, kamu mungkin menemui hambatan. Ambil keputusan yang tepat!</p>

            {hazardScenarios.map((scenario) => (
              <div key={scenario.id} className="flex flex-col sm:flex-row gap-4 bg-white border rounded-xl p-4 mb-4 shadow-sm">
                <img src={scenario.image} alt={scenario.title} className="w-24 h-24 object-cover rounded-lg bg-gray-100" />
                <div className="flex-1">
                  <h3 className="font-bold">{scenario.title}</h3>
                  <p className="text-sm text-gray-600">{scenario.desc}</p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {scenario.options.map((opt) => {
                      const selected = hazardAnswers[scenario.id] === opt.id
                      return (
                        <button key={opt.id} onClick={() => handleHazardAnswer(scenario.id, opt.id)}
                          className={`px-4 py-2 rounded-lg border text-sm transition ${
                            selected ? (opt.isCorrect ? "bg-green-100 border-green-500" : "bg-red-100 border-red-500") : "border-gray-300 bg-white hover:bg-gray-50"
                          }`}>
                          {opt.text}
                        </button>
                      )
                    })}
                  </div>
                  {hazardAnswers[scenario.id] && (
                    <p className={`text-sm font-medium mt-2 ${hazardAnswers[scenario.id] === scenario.options.find((o) => o.isCorrect)?.id ? "text-green-600" : "text-red-600"}`}>
                      {scenario.options.find((o) => o.id === hazardAnswers[scenario.id])?.feedback}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button onClick={() => setCurrentStep("debrief")} variant="primary">Lanjut ke Titik Kumpul</Button>
          </div>
        </div>
      )}

      {currentStep === "debrief" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-md border p-6">
            <h2 className="text-2xl font-bold mb-2">Misi 4: Titik Kumpul & Debrief</h2>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-white border rounded-xl p-4 shadow-sm">
                <div className="flex gap-4 items-center">
                  <img src="/assets/lesson2/instruksi-guru-toa-portable.png" alt="Instruksi Guru" className="w-20 h-20 object-contain" />
                  <div>
                    <h3 className="font-bold">Instruksi Guru (TOA)</h3>
                    <p className="text-sm">&ldquo;Kelas, tetap tertib. Guru akan mengabsen satu per satu. Jangan meninggalkan area lapangan sebelum instruksi selesai.&rdquo;</p>
                    <small className="text-gray-400">Guru & Petugas</small>
                  </div>
                </div>
              </div>

              <div className="bg-white border rounded-xl p-6 shadow-sm">
                <h3 className="font-bold mb-2">Checklist Keamanan di Lapangan</h3>
                <p className="text-sm text-gray-500 mb-4">Setelah tiba di lapangan, pastikan hal ini:</p>
                <div className="space-y-3">
                  {[
                    { id: "aman", label: "Saya berada di area aman (Lapangan)." },
                    { id: "teman", label: "Tidak ada teman tertinggal di dalam." },
                    { id: "lapor", label: "Saya telah melapor kepada guru/wali kelas." },
                  ].map((item) => (
                    <label key={item.id} className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={checklist[item.id as keyof typeof checklist]} onChange={() => handleChecklistChange(item.id as keyof typeof checklist)} className="w-5 h-5 accent-green-500" />
                      <span className="text-sm">{item.label}</span>
                    </label>
                  ))}
                </div>
                <hr className="my-4" />
                <h4 className="font-bold text-sm mb-2">Refleksi Singkat</h4>
                <textarea value={reflection} onChange={(e) => setReflection(e.target.value)} className="w-full p-2 border rounded-lg text-sm" rows={3} placeholder="Apa yang bisa kita perbaiki dari evakuasi hari ini?" />
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
          <p className="text-gray-500 text-sm mb-6">Uji pengetahuanmu tentang materi evakuasi di atas.</p>

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
