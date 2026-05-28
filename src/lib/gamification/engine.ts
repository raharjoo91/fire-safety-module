import type { UserProgress, Badge, MissionMapNode } from "@/types/gamification"

const BADGES: Badge[] = [
  { id: "detektif-api", name: "Detektif Api", nameId: "Fire Detective", description: "Selesaikan Misi 1", icon: "/assets/gamification/badge-detektif.png" },
  { id: "siap-evakuasi", name: "Siap Evakuasi", nameId: "Evacuation Ready", description: "Selesaikan Misi 2", icon: "/assets/gamification/badge-evakuasi.png" },
  { id: "ahli-listrik", name: "Ahli Listrik", nameId: "Electrical Expert", description: "Selesaikan Misi 3", icon: "/assets/gamification/badge-listrik.png" },
  { id: "safety-squad", name: "Safety Squad", nameId: "Safety Squad", description: "Selesaikan Misi Puncak", icon: "/assets/gamification/badge-squad.png" },
  { id: "sempurna", name: "Keselamatan Sempurna", nameId: "Perfect Safety", description: "Dapatkan skor sempurna di semua misi", icon: "/assets/gamification/badge-sempurna.png" },
]

const LESSON_XP = [100, 150, 150, 200]
const SAFETY_METER_MAX = 100

export function getBadges(): Badge[] {
  return BADGES
}

export function getBadgeById(id: string): Badge | undefined {
  return BADGES.find((b) => b.id === id)
}

const MAX_XP = 600
const XP_PER_LEVEL = 150

export function calculateLevel(totalXP: number): { level: number; currentXP: number; nextLevelXP: number } {
  if (totalXP >= MAX_XP) {
    return { level: 4, currentXP: XP_PER_LEVEL, nextLevelXP: XP_PER_LEVEL }
  }
  const level = Math.floor(totalXP / XP_PER_LEVEL) + 1
  const currentXP = totalXP % XP_PER_LEVEL
  return { level, currentXP, nextLevelXP: XP_PER_LEVEL }
}

export function buildMissionMap(completedLessons: string[]): MissionMapNode[] {
  const lessons = [
    { lessonId: "1-penyebab-kebakaran", title: "Penyebab Kebakaran", xpReward: 100 },
    { lessonId: "2-alarm-evakuasi", title: "Alarm & Evakuasi", xpReward: 150 },
    { lessonId: "3-risiko-listrik-dan-pengisian-baterai", title: "Risiko Listrik & Pengisian Baterai", xpReward: 150 },
    { lessonId: "4-misi-puncak", title: "Misi Puncak", xpReward: 200 },
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
