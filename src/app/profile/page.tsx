"use client"

import BadgeDisplay from "@/components/ui/BadgeDisplay"
import XPBar from "@/components/gamification/XPBar"
import Button from "@/components/ui/Button"
import { useProgress } from "@/hooks/useProgress"

export default function ProfilePage() {
  const { progress, level, currentXP, nextLevelXP } = useProgress()

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto flex items-center justify-center text-3xl border-4 border-blue-300">
          👤
        </div>
        <h1 className="text-xl font-bold">Profil Safety Squad</h1>
        <p className="text-sm text-gray-500">Kamu adalah pahlawan keselamatan!</p>
      </div>

      <XPBar currentXP={currentXP} nextLevelXP={nextLevelXP} level={level} />

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">{progress.totalXP}</div>
          <div className="text-xs text-gray-500">Total XP</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="text-2xl font-bold text-green-600">{progress.completedLessons.length}/6</div>
          <div className="text-xs text-gray-500">Misi Selesai</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="text-2xl font-bold text-amber-600">{progress.badges.length}</div>
          <div className="text-xs text-gray-500">Badge</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md border p-5">
        <h2 className="font-bold mb-3">Badge Terkumpul</h2>
        <BadgeDisplay badges={progress.badges} />
      </div>

      <div className="bg-white rounded-2xl shadow-md border p-5">
        <h2 className="font-bold mb-3">Riwayat Misi</h2>
        {progress.completedLessons.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            Belum ada misi yang diselesaikan. Mulai dari Peta Misi!
          </p>
        ) : (
          <ul className="space-y-2">
            {progress.completedLessons.map((id) => (
              <li key={id} className="flex items-center gap-2 text-sm bg-green-50 p-3 rounded-xl border border-green-200">
                <span className="text-green-600">✓</span>
                <span className="capitalize">{id.replace(/-/g, " ")}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="text-center">
        <Button href="/" variant="primary">Kembali ke Peta Misi</Button>
      </div>
    </div>
  )
}
