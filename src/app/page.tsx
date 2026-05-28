"use client"

import MissionMap from "@/components/gamification/MissionMap"
import XPBar from "@/components/gamification/XPBar"
import { useProgress } from "@/hooks/useProgress"

export default function Home() {
  const { progress, missionMap, level, currentXP, nextLevelXP } = useProgress()

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-2">
          <img
            src="/assets/branding/01-logo-tim-keselamatan-api.png"
            alt="Logo Tim Keselamatan Api"
            className="h-20 w-auto"
          />
        </div>
        <h1 className="text-2xl font-bold text-blue-800">Tim Keselamatan Api</h1>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          Selamat datang, <strong>Safety Squad</strong>! Selesaikan 6 misi untuk menjadi pahlawan keselamatan kebakaran di sekolahmu!
        </p>
      </div>

      <XPBar currentXP={currentXP} nextLevelXP={nextLevelXP} level={level} />

      <div className="bg-white rounded-2xl shadow-md border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">Peta Misi</h2>
          <span className="text-xs text-gray-400">
            {progress.completedLessons.length}/6 misi selesai
          </span>
        </div>
        <MissionMap nodes={missionMap} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-sm">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">{progress.totalXP}</div>
          <div className="text-gray-500">Total XP</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="text-2xl font-bold text-green-600">{progress.completedLessons.length}</div>
          <div className="text-gray-500">Misi Selesai</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="text-2xl font-bold text-amber-600">{progress.badges.length}</div>
          <div className="text-gray-500">Badge Terkumpul</div>
        </div>
      </div>
    </div>
  )
}
