import type { XAPIStatement } from "@/types/gamification"

const STATEMENTS_ENDPOINT = process.env.NEXT_PUBLIC_XAPI_ENDPOINT || ""
const AUTH = process.env.NEXT_PUBLIC_XAPI_AUTH || ""

export async function sendStatement(statement: XAPIStatement): Promise<void> {
  if (!STATEMENTS_ENDPOINT) {
    if (typeof window !== "undefined") {
      const stored = JSON.parse(localStorage.getItem("xapi_statements") || "[]")
      stored.push({ ...statement, timestamp: new Date().toISOString() })
      localStorage.setItem("xapi_statements", JSON.stringify(stored))
    }
    return
  }

  try {
    await fetch(STATEMENTS_ENDPOINT, {
      method: "POST",
      headers: {
        "X-Experience-API-Version": "1.0.3",
        "Content-Type": "application/json",
        Authorization: `Basic ${AUTH}`,
      },
      body: JSON.stringify(statement),
    })
  } catch {
    const stored = JSON.parse(localStorage.getItem("xapi_statements") || "[]")
    stored.push({ ...statement, timestamp: new Date().toISOString() })
    localStorage.setItem("xapi_statements", JSON.stringify(stored))
  }
}

export function trackLessonStarted(learnerId: string, lessonId: string) {
  return sendStatement({
    actor: learnerId,
    verb: { id: "http://adlnet.gov/expapi/verbs/launched", display: "launched" },
    object: {
      id: `https://keselamatan-api.firebase.app/lessons/${lessonId}`,
      definition: { name: lessonId, description: `Lesson ${lessonId} started` },
    },
    context: { lessonId, activityId: "lesson" },
  })
}

export function trackLessonCompleted(learnerId: string, lessonId: string, score: number) {
  return sendStatement({
    actor: learnerId,
    verb: { id: "http://adlnet.gov/expapi/verbs/completed", display: "completed" },
    object: {
      id: `https://keselamatan-api.firebase.app/lessons/${lessonId}`,
      definition: { name: lessonId, description: `Lesson ${lessonId} completed` },
    },
    result: { success: score >= 60, score },
    context: { lessonId, activityId: "lesson" },
  })
}

export function trackChoice(learnerId: string, lessonId: string, choiceId: string, isSafe: boolean) {
  return sendStatement({
    actor: learnerId,
    verb: { id: "http://adlnet.gov/expapi/verbs/answered", display: "answered" },
    object: {
      id: `https://keselamatan-api.firebase.app/lessons/${lessonId}/choices/${choiceId}`,
      definition: { name: choiceId, description: `Choice: ${choiceId}` },
    },
    result: { success: isSafe },
    context: { lessonId, activityId: "choice" },
  })
}

export function trackHazardFound(learnerId: string, lessonId: string, hazardId: string) {
  return sendStatement({
    actor: learnerId,
    verb: { id: "http://adlnet.gov/expapi/verbs/interacted", display: "interacted" },
    object: {
      id: `https://keselamatan-api.firebase.app/lessons/${lessonId}/hazards/${hazardId}`,
      definition: { name: hazardId, description: `Hazard: ${hazardId}` },
    },
    result: { success: true },
    context: { lessonId, activityId: "hazard-spotting" },
  })
}
