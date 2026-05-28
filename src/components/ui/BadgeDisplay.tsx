import type { Badge } from "@/types/gamification"

interface BadgeDisplayProps {
  badges: Badge[]
  compact?: boolean
}

export default function BadgeDisplay({ badges, compact }: BadgeDisplayProps) {
  if (badges.length === 0) {
    return (
      <div className="text-center text-gray-400 text-sm py-4">
        Belum ada badge. Selesaikan misi untuk mendapatkannya!
      </div>
    )
  }

  return (
    <div className={`grid ${compact ? "grid-cols-3 gap-2" : "grid-cols-2 sm:grid-cols-3 gap-4"}`}>
      {badges.map((badge) => (
        <div
          key={badge.id}
          className="flex flex-col items-center p-3 bg-gradient-to-br from-yellow-50 to-amber-100 rounded-xl border border-amber-200 shadow-sm"
          title={badge.description}
        >
          <div className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center text-white text-2xl mb-1 shadow">
            ★
          </div>
          <span className="text-xs font-bold text-center text-amber-900">{badge.name}</span>
          {!compact && <span className="text-xs text-gray-500">{badge.description}</span>}
        </div>
      ))}
    </div>
  )
}
