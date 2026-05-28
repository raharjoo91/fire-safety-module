import type { UserProgress, Badge, MissionMapNode } from "@/types/gamification"

const BADGES: Badge[] = [
  { id: "detektif-api", name: "Detektif Api", nameId: "Fire Detective", description: "Selesaikan Pelajaran 1", icon: "/assets/gamification/badge-detektif.png" },
  { id: "siap-evakuasi", name: "Siap Evakuasi", nameId: "Evacuation Ready", description: "Selesaikan Pelajaran 2", icon: "/assets/gamification/badge-evakuasi.png" },
  { id: "ahli-listrik", name: "Ahli Listrik", nameId: "Electrical Expert", description: "Selesaikan Pelajaran 3", icon: "/assets/gamification/badge-listrik.png" },
  { id: "charger-cerdas", name: "Charger Cerdas", nameId: "Smart Charger", description: "Selesaikan Pelajaran 4", icon: "/assets/gamification/badge-charger.png" },
  { id: "waspada", name: "Selalu Waspada", nameId: "Always Alert", description: "Selesaikan Pelajaran 5", icon: "/assets/gamification/badge-waspada.png" },
  { id: "safety-squad", name: "Safety Squad", nameId: "Safety Squad", description: "Selesaikan Misi Puncak", icon: "/assets/gamification/badge-squad.png" },
  { id: "sempurna", name: "Keselamatan Sempurna", nameId: "Perfect Safety", description: "Dapatkan skor sempurna di semua pelajaran", icon: "/assets/gamification/badge-sempurna.png" },
]

const LESSON_XP = [100, 100, 150, 100, 100, 200]
const SAFETY_METER_MAX = 100

export function getBadges(): Badge[] {
  return BADGES
}

export function getBadgeById(id: string): Badge | undefined {
  return BADGES.find((b) => b.id === id)
}

export function calculateLevel(totalXP: number): { level: number; currentXP: number; nextLevelXP: number } {
  const level = Math.floor(totalXP / 300) + 1
  const currentXP = totalXP % 300
  return { level, currentXP, nextLevelXP: 300 }
}

export function buildMissionMap(completedLessons: string[]): MissionMapNode[] {
  const lessons = [
    { lessonId: "1-penyebab-kebakaran", title: "Penyebab Kebakaran", xpReward: 100 },
    { lessonId: "2-alarm-evakuasi", title: "Alarm & Evakuasi", xpReward: 100 },
    { lessonId: "3-risiko-listrik", title: "Risiko Listrik", xpReward: 150 },
    { lessonId: "4-pengisian-baterai", title: "Pengisian Baterai", xpReward: 100 },
    { lessonId: "5-tanda-peringatan", title: "Tanda Peringatan", xpReward: 100 },
    { lessonId: "6-misi-puncak", title: "Misi Puncak", xpReward: 200 },
  ]

  return lessons.map((lesson, index) => {
    const isCompleted = completedLessons.includes(lesson.lessonId)
    const prevCompleted = index === 0 || completedLessons.includes(lessons[index - 1].lessonId)
    return {
      ...lesson,
      status: isCompleted ? "completed" : prevCompleted ? "unlocked" : "locked",
    }
  })
}

export function calculateSafetyDelta(choices: boolean[]): number {
  const safeChoices = choices.filter((c) => c).length
  return Math.round((safeChoices / Math.max(choices.length, 1)) * SAFETY_METER_MAX)
}

export function getSafetyMessage(level: number): string {
  if (level >= 80) return "Luar biasa! Kamu sangat tanggap keselamatan!"
  if (level >= 60) return "Bagus! Masih ada yang perlu ditingkatkan."
  if (level >= 40) return "Cukup, tapi kamu perlu lebih waspada."
  return "Awas! Bahaya! Pelajari lagi tanda-tanda bahaya."
}

export { SAFETY_METER_MAX, LESSON_XP }
