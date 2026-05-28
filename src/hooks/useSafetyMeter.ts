"use client"

import { useState, useCallback } from "react"
import { getSafetyMessage, SAFETY_METER_MAX } from "@/lib/gamification/engine"

export function useSafetyMeter(initial = 100) {
  const [level, setLevel] = useState(initial)
  const [message, setMessage] = useState(getSafetyMessage(initial))

  const adjust = useCallback((delta: number) => {
    setLevel((prev) => {
      const next = Math.max(0, Math.min(SAFETY_METER_MAX, prev + delta))
      setMessage(getSafetyMessage(next))
      return next
    })
  }, [])

  const reset = useCallback(() => {
    setLevel(initial)
    setMessage(getSafetyMessage(initial))
  }, [initial])

  return { level, message, adjust, reset, maxLevel: SAFETY_METER_MAX }
}
