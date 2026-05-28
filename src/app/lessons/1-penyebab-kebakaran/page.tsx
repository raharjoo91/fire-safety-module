"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Button from "@/components/ui/Button"
import { useProgress } from "@/hooks/useProgress"
import { trackLessonStarted, trackLessonCompleted } from "@/lib/xapi/tracker"

const SLUG = "1-penyebab-kebakaran"

interface CardData {
  id: string
  title: string
  image: string
  badge: string
  badgeClass: string
  desc: string
  detail: string
  tips: string
}

const cards: CardData[] = [
  {
    id: "korsleting",
    title: "Korsleting Listrik",
    image: "/assets/lesson1/card-korsleting-listrik.png",
    badge: "Penyebab #1 (61%)",
    badgeClass: "risk",
    desc: "Penggunaan steker bertumpuk, kabel terkelupas, atau instalasi yang tidak standar.",
    detail: "Korsleting listrik adalah penyebab terbesar (61%). Terjadi karena arus listrik berlebih melewati jalur yang tidak semestinya, menimbulkan panas berlebih dan percikan api.",
    tips: "Periksa kabel secara berkala. Jangan gunakan steker bertumpuk (octopus)."
  },
  {
    id: "lpg",
    title: "Kebocoran LPG",
    image: "/assets/lesson1/card-kebocoran-gas-lpg.png",
    badge: "Sangat Berbahaya",
    badgeClass: "risk",
    desc: "Selang gas getas, regulator kendur, atau ventilasi dapur yang tertutup rapat.",
    detail: "Gas LPG mudah terbakar dan meledak jika tercampur udara. Kebocoran sering terjadi pada selang yang sudah getas atau regulator yang tidak kencang.",
    tips: "Gunakan detektor gas. Pastikan ventilasi dapur terbuka. Matikan tabung saat tidak digunakan."
  },
  {
    id: "rokok",
    title: "Puntung Rokok",
    image: "/assets/lesson1/card-puntung-rokok.png",
    badge: "Kelalaian",
    badgeClass: "risk",
    desc: "Membuang puntung yang masih menyala sembarangan, apalagi di tempat sampah atau tumpukan daun.",
    detail: "Puntung rokok masih mengandung bara api yang panas. Jika dibuang sembarangan di tempat kering atau sampah, bisa memicu kebakaran besar.",
    tips: "Larang merokok di dalam ruangan. Sediakan asbak berpasir jika merokok."
  },
  {
    id: "sampah",
    title: "Pembakaran Sampah",
    image: "/assets/lesson1/card-pembakaran-sampah.png",
    badge: "Kebiasaan",
    badgeClass: "risk",
    desc: "Membakar sampah di area terbuka saat cuaca kering dan berangin dapat memicu kebakaran besar.",
    detail: "Membakar sampah secara terbuka sulit dikendalikan. Saat cuaca kering dan berangin, api bisa merembet ke rumah atau hutan.",
    tips: "Kelola sampah dengan 3R (Reduce, Reuse, Recycle). Jangan bakar sampah plastik."
  },
  {
    id: "bahan",
    title: "Bahan Mudah Terbakar",
    image: "/assets/lesson1/card-bahan-mudah-terbakar.png",
    badge: "Penyimpanan",
    badgeClass: "risk",
    desc: "Menyimpan bensin, thinner, atau aerosol dekat dengan sumber panas (kompor/lampu).",
    detail: "Bahan seperti bensin, thinner, atau aerosol sangat mudah terbakar bahkan dengan percikan api kecil.",
    tips: "Simpan di tempat sejuk dan jauh dari matahari. Jauhkan dari kompor dan sumber panas lainnya."
  },
  {
    id: "petir",
    title: "Petir & Cuaca Kering",
    image: "/assets/lesson1/card-petir-cuaca-kering.png",
    badge: "Faktor Alam",
    badgeClass: "nature",
    desc: "Sambaran petir ke bangunan tinggi atau kondisi kekeringan ekstrem yang membuat tanaman mudah terbakar.",
    detail: "Sambaran petir menghasilkan suhu sangat tinggi yang bisa membakar bangunan. Cuaca kering membuat tanaman dan material mudah terbakar menjadi bahan bakar siap pakai.",
    tips: "Gunakan penangkal petir. Jangan keluar saat badai petir. Jaga kelembapan tanaman di musim kemarau."
  }
]

const quizQuestions = [
  {
    id: "q1",
    question: "Apa saja tiga unsur pembentuk 'Segitiga Api'?",
    options: [
      { id: "q1a", text: "Air, Udara, Tanah", isCorrect: false },
      { id: "q1b", text: "Panas, Bahan Bakar, Oksigen", isCorrect: true },
      { id: "q1c", text: "Asap, Api, Abu", isCorrect: false },
    ],
    correctMsg: "Benar! Panas, bahan bakar, dan oksigen adalah kunci terjadinya api.",
    wrongMsg: "Salah. Ingat kembali konsep Segitiga Api.",
  },
  {
    id: "q2",
    question: "Apa yang harus dilakukan pertama kali jika kamu mencium bau gas menyengat di dapur?",
    options: [
      { id: "q2a", text: "Menyalakan lampu agar terang untuk mencari sumber kebocoran.", isCorrect: false },
      { id: "q2b", text: "Membuka jendela/pintu untuk ventilasi dan menjauh dari sumber api.", isCorrect: true },
      { id: "q2c", text: "Menyemprotkan parfum untuk menghilangkan bau.", isCorrect: false },
    ],
    correctMsg: "Tepat! Langkah ini mengurangi konsentrasi gas dan mencegah percikan api.",
    wrongMsg: "Salah. Menyalakan saklar atau api saat bau gas sangat berbahaya (bisa meledak).",
  },
  {
    id: "q3",
    question: "Mengapa kita dilarang menyiram air pada kebakaran yang disebabkan oleh korsleting listrik?",
    options: [
      { id: "q3a", text: "Karena air akan membuat api menjadi lebih besar.", isCorrect: false },
      { id: "q3b", text: "Karena air adalah penghantar listrik dan berisiko menyengat kita.", isCorrect: true },
      { id: "q3c", text: "Karena air akan merusak perabotan rumah.", isCorrect: false },
    ],
    correctMsg: "Benar! Air menghantarkan listrik, sehingga berbahaya bagi nyawa.",
    wrongMsg: "Salah. Alasan utamanya adalah keselamatan diri dari sengatan listrik.",
  },
]

export default function Lesson1Page() {
  const router = useRouter()
  const { completeLesson } = useProgress()
  const [currentStep, setCurrentStep] = useState<"intro" | "cards" | "prevention" | "quiz" | "done">("intro")
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showFeedback, setShowFeedback] = useState(false)
  const [quizScore, setQuizScore] = useState(0)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    trackLessonStarted("anon", SLUG)
  }, [])

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
      completeLesson(SLUG, quizScore, 100)
      trackLessonCompleted("anon", SLUG, quizScore)
      setSaved(true)
    }
  }, [completeLesson, quizScore, saved])

  const allAnswered = Object.keys(answers).length === quizQuestions.length

  if (currentStep === "done") {
    return (
      <div className="max-w-lg mx-auto text-center space-y-6 py-10">
        <div className="text-6xl">🎉</div>
        <h2 className="text-2xl font-bold text-green-700">Misi Selesai!</h2>
        <div className="bg-white rounded-2xl p-6 shadow-md border space-y-4">
          <p className="text-gray-600">Skor kamu: <strong>{quizScore}%</strong></p>
          <p className="text-sm text-gray-500">+100 XP diperoleh</p>
          {quizScore === 100 && (
            <p className="text-green-600 font-bold">Luar biasa! Kamu menjawab semua dengan benar!</p>
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
          <span className="text-xs text-gray-400 uppercase tracking-wide">Pelajaran 1 dari 6</span>
          <h1 className="text-xl font-bold text-gray-900">Penyebab Kebakaran di Lingkungan Kita</h1>
        </div>
        <span className="text-xs text-gray-400">30 menit</span>
      </div>

      {/* Step indicator */}
      <div className="flex gap-2">
        {["intro", "cards", "prevention", "quiz"].map((step, i) => (
          <div
            key={step}
            className={`h-2 flex-1 rounded-full transition-colors ${
              ["intro", "cards", "prevention", "quiz"].indexOf(currentStep) >= i
                ? "bg-blue-600"
                : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      {/* INTRO */}
      {currentStep === "intro" && (
        <div className="bg-white rounded-2xl shadow-md border overflow-hidden">
          <img
            src="/assets/lesson1/hero-penyebab-kebakaran.png"
            alt="Penyebab Kebakaran"
            className="w-full h-auto"
          />
          <div className="p-6 space-y-4 relative">
            <img
              src="/assets/lesson1/mascot-siaga.png"
              alt="Mascot"
              className="absolute -top-16 right-4 w-24 animate-bounce hidden sm:block"
            />
            <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold inline-block">
              Tim Siaga Kebakaran
            </span>
            <h2 className="text-2xl font-bold">Memahami Penyebab Kebakaran</h2>
            <p className="text-gray-600">
              Pelajari mengapa kebakaran bisa terjadi, mulai dari korsleting listrik hingga faktor cuaca.
              Mari jadikan lingkungan sekolah dan rumah kita lebih aman!
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm">
              <strong>💡 Fakta:</strong> Berdasarkan data NFPA, rata-rata ada 3.230 kebakaran di properti
              sekolah setiap tahun. Penyebab utama: masalah kelistrikan (17%).
            </div>
            <Button onClick={() => setCurrentStep("cards")} variant="primary">
              Mulai Belajar
            </Button>
          </div>
        </div>
      )}

      {/* FIRE TRIANGLE + CARDS */}
      {currentStep === "cards" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-md border p-6">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Segitiga Api</h2>
            <div className="grid sm:grid-cols-2 gap-6 items-center">
              <div>
                <p>Secara ilmiah, kebakaran hanya terjadi jika tiga unsur ini bertemu. Jika salah satu dihilangkan, api tidak akan menyala atau akan padam.</p>
                <ul className="list-disc pl-5 mt-3 space-y-1">
                  <li><strong>Panas (Heat):</strong> Sumber energi yang memicu bahan bakar.</li>
                  <li><strong>Bahan Bakar (Fuel):</strong> Apa saja yang bisa terbakar (kayu, kertas, gas).</li>
                  <li><strong>Oksigen (Oxygen):</strong> Udara di sekitar kita.</li>
                </ul>
                <p className="mt-3 italic text-gray-500">&ldquo;Tugas utama kita dalam pencegahan adalah memutus salah satu sisi dari segitiga ini.&rdquo;</p>
              </div>
              <div className="flex justify-center">
                <img src="/assets/lesson1/segitiga-api.png" alt="Segitiga Api" className="max-w-full rounded-lg shadow" />
              </div>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Penyebab Utama Kebakaran</h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Klik pada kartu untuk melihat detail lebih lanjut!
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((card) => (
              <div
                key={card.id}
                onClick={() => setSelectedCard(card)}
                className="bg-white rounded-xl shadow-md border overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <img src={card.image} alt={card.title} className="w-full h-auto" />
                <div className="p-4">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold mb-2 ${
                    card.badgeClass === "risk" ? "bg-red-100 text-red-700" : "bg-teal-100 text-teal-700"
                  }`}>
                    {card.badge}
                  </span>
                  <h3 className="font-bold">{card.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button onClick={() => setCurrentStep("prevention")} variant="primary">
              Lanjut ke Pencegahan
            </Button>
          </div>
        </div>
      )}

      {/* PREVENTION */}
      {currentStep === "prevention" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-md border p-6">
            <h2 className="text-2xl font-bold mb-2">Pencegahan & Respons Aman</h2>
            <p className="text-gray-500 text-sm mb-6">
              Siswa SMP bukan pemadam api, tapi &ldquo;Penjaga Keselamatan&rdquo;. Ketahui apa yang BOLEH dan TIDAK BOLEH dilakukan.
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-green-50 rounded-xl p-5 border border-green-200">
                <h3 className="font-bold text-green-700 mb-4">✅ Tindakan Aman (Lakukan)</h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center text-green-700 font-bold shrink-0">✓</div>
                    <div className="text-sm"><strong>Saat Bau Gas:</strong> Membuka jendela dan pintu untuk ventilasi, lalu menjauh dari sumber api.</div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center text-green-700 font-bold shrink-0">✓</div>
                    <div className="text-sm"><strong>Saat Kabel Bermasalah:</strong> Memanggil orang dewasa atau teknisi.</div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center text-green-700 font-bold shrink-0">✓</div>
                    <div className="text-sm"><strong>Siapapun:</strong> Mengetahui nomor darurat pemadam kebakaran (112 atau 113).</div>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 rounded-xl p-5 border border-red-200">
                <h3 className="font-bold text-red-700 mb-4">❌ Tindakan Berbahaya (Hindari)</h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-red-200 rounded-full flex items-center justify-center text-red-700 font-bold shrink-0">✕</div>
                    <div className="text-sm"><strong>Saat Bau Gas:</strong> Jangan menyalakan saklar lampu atau korek api. Percikan kecil bisa memicu ledakan!</div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-red-200 rounded-full flex items-center justify-center text-red-700 font-bold shrink-0">✕</div>
                    <div className="text-sm"><strong>Kebakaran Listrik:</strong> JANGAN menyiram dengan air. Air menghantarkan listrik!</div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-red-200 rounded-full flex items-center justify-center text-red-700 font-bold shrink-0">✕</div>
                    <div className="text-sm"><strong>Panas Berlebih:</strong> Jangan langsung menyentuh stopkontak yang panas atau kabel yang berasap.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button onClick={() => setCurrentStep("quiz")} variant="primary">
              Lanjut ke Kuis
            </Button>
          </div>
        </div>
      )}

      {/* QUIZ */}
      {currentStep === "quiz" && (
        <div className="bg-white rounded-2xl shadow-md border p-6">
          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold inline-block mb-4">
            📝 Kuis Pemahaman
          </span>
          <p className="text-gray-500 text-sm mb-6">Uji pengetahuanmu tentang materi di atas.</p>

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
                        cls += isSelected
                          ? " border-blue-500 bg-blue-50"
                          : " border-gray-200 hover:border-blue-300 cursor-pointer"
                      } else {
                        if (o.isCorrect) cls += " border-green-500 bg-green-50"
                        else if (isSelected && !o.isCorrect) cls += " border-red-500 bg-red-50"
                        else cls += " border-gray-200 opacity-60"
                      }

                      return (
                        <button
                          key={o.id}
                          className={cls}
                          onClick={() => handleQuizAnswer(q.id, o.id)}
                          disabled={showFeedback}
                        >
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
            <button
              onClick={handleQuizSubmit}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition mt-4"
            >
              Cek Jawaban
            </button>
          )}

          {showFeedback && (
            <div className="text-center mt-6">
              <p className="text-lg font-bold mb-2">
                Skor: {quizQuestions.filter((q) => q.options.find((o) => o.id === answers[q.id])?.isCorrect).length}/{quizQuestions.length}
              </p>
              <Button onClick={() => setCurrentStep("done")} variant="primary">
                Selesai
              </Button>
            </div>
          )}
        </div>
      )}

      {/* MODAL */}
      {selectedCard && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedCard(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full shadow-2xl animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-red-600 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
              <h3 className="font-bold text-lg">{selectedCard.title}</h3>
              <button onClick={() => setSelectedCard(null)} className="text-white text-2xl leading-none hover:opacity-70">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <p><strong>Deskripsi:</strong> {selectedCard.detail}</p>
              <hr />
              <p className="text-green-700 font-bold">💡 Tips Pencegahan:</p>
              <p>{selectedCard.tips}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
