export interface UserProgress {
  userId: string
  completedLessons: string[]
  currentLesson: string
  totalXP: number
  badges: Badge[]
  safetyScore: number
  lastActivity: string
}

export interface Badge {
  id: string
  name: string
  nameId: string
  description: string
  icon: string
  unlockedAt?: string
}

export interface SafetyMeterState {
  currentLevel: number
  maxLevel: number
  message: string
}

export interface MissionMapNode {
  lessonId: string
  title: string
  status: "locked" | "unlocked" | "completed"
  xpReward: number
}

export type XAPIStatement = {
  actor: string
  verb: {
    id: string
    display: string
  }
  object: {
    id: string
    definition: {
      name: string
      description: string
    }
  }
  result?: {
    success?: boolean
    score?: number
    duration?: string
  }
  context?: {
    lessonId: string
    activityId: string
  }
}
