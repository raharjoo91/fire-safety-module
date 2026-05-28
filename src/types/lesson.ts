export interface Lesson {
  id: string
  title: string
  titleId: string
  subtitle: string
  order: number
  estimatedMinutes: number
  description: string
  activities: Activity[]
  xpReward: number
  badgeId?: string
}

export interface Activity {
  id: string
  type: "card-sort" | "branching-scenario" | "hazard-spotting" | "drag-sort" | "room-audit" | "info" | "quiz"
  title: string
  instruction: string
  content: Record<string, unknown>
}

export interface BranchingStep {
  id: string
  scenario: string
  image?: string
  choices: BranchChoice[]
  feedback: Record<string, string>
}

export interface BranchChoice {
  id: string
  text: string
  isSafe: boolean
  explanation: string
  nextStepId: string | null
  safetyDelta: number
}

export interface HazardSpottingScene {
  id: string
  image: string
  hotspots: Hazard[]
}

export interface Hazard {
  id: string
  x: number
  y: number
  width: number
  height: number
  label: string
  isHazard: boolean
  explanation: string
}

export interface CardSortItem {
  id: string
  text: string
  category: "safe" | "unsafe"
  explanation: string
}
