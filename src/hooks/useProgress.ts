"use client"

import { useState, useEffect, useCallback } from "react"
import type { UserProgress, Badge, MissionMapNode } from "@/types/gamification"
import { buildMissionMap, getBadgeById, calculateLevel, SAFETY_METER_MAX } from "@/lib/gamification/engine"
import { trackLessonCompleted } from "@/lib/xapi/tracker"

const STORAGE_KEY = "keselamatan-api-progress"

const DEFAULT_PROGRESS: UserProgress = {
  userId: "",
  completedLessons: [],
  currentLesson: "1-penyebab-kebakaran",
  totalXP: 0,
  badges: [],
  safetyScore: 0,
  lastActivity: new Date().toISOString(),
}

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setProgress({ ...DEFAULT_PROGRESS, ...JSON.parse(stored), userId: "anon" })
      } catch {
        setProgress({ ...DEFAULT_PROGRESS, userId: "anon" })
      }
    } else {
      setProgress((p) => ({ ...p, userId: "anon" }))
    }
    setLoaded(true)
  }, [])

  const save = useCallback((p: UserProgress) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
    setProgress(p)
  }, [])

  const completeLesson = useCallback(
    (lessonId: string, score: number, xpReward: number) => {
      const updated = { ...progress }
      if (!updated.completedLessons.includes(lessonId)) {
        updated.completedLessons = [...updated.completedLessons, lessonId]
        updated.totalXP += xpReward
        updated.safetyScore = Math.min(SAFETY_METER_MAX, updated.safetyScore + Math.round(score * 0.2))

        const badge = getBadgeById(`badge-${lessonId}`) || getBadgeById(
          ["detektif-api", "siap-evakuasi", "ahli-listrik", "charger-cerdas", "waspada", "safety-squad"][
            ["1-penyebab-kebakaran", "2-alarm-evakuasi", "3-risiko-listrik", "4-pengisian-baterai", "5-tanda-peringatan", "6-misi-puncak"].indexOf(lessonId)
          ]
        )
        if (badge && !updated.badges.find((b) => b.id === badge.id)) {
          updated.badges = [...updated.badges, { ...badge, unlockedAt: new Date().toISOString() }]
        }

        updated.lastActivity = new Date().toISOString()

        const lessonIndex = ["1-penyebab-kebakaran", "2-alarm-evakuasi", "3-risiko-listrik", "4-pengisian-baterai", "5-tanda-peringatan", "6-misi-puncak"].indexOf(lessonId)
        if (lessonIndex >= 0 && lessonIndex < 5) {
          updated.currentLesson = ["1-penyebab-kebakaran", "2-alarm-evakuasi", "3-risiko-listrik", "4-pengisian-baterai", "5-tanda-peringatan", "6-misi-puncak"][lessonIndex + 1]
        }

        save(updated)
        trackLessonCompleted(progress.userId, lessonId, score)
      }
    },
    [progress, save]
  )

  const missionMap: MissionMapNode[] = buildMissionMap(progress.completedLessons)
  const { level, currentXP, nextLevelXP } = calculateLevel(progress.totalXP)

  return { progress, loaded, completeLesson, missionMap, level, currentXP, nextLevelXP }
}
