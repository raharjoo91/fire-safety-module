interface XPBarProps {
  currentXP: number
  nextLevelXP: number
  level: number
}

export default function XPBar({ currentXP, nextLevelXP, level }: XPBarProps) {
  const pct = Math.round((currentXP / nextLevelXP) * 100)

  return (
    <div className="w-full max-w-xs mx-auto">
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>Level {level}</span>
        <span>{currentXP} / {nextLevelXP} XP</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
        <div
          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
