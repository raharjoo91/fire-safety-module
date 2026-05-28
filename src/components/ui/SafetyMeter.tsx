interface SafetyMeterProps {
  level: number
  maxLevel: number
  message: string
}

export default function SafetyMeter({ level, maxLevel, message }: SafetyMeterProps) {
  const pct = Math.round((level / maxLevel) * 100)
  const color = pct >= 80 ? "bg-green-500" : pct >= 60 ? "bg-yellow-500" : pct >= 40 ? "bg-orange-500" : "bg-red-600"

  return (
    <div className="w-full max-w-md mx-auto my-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-bold text-gray-700">Tingkat Keselamatan</span>
        <span className="text-sm font-bold text-gray-700">{level}/{maxLevel}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={level}
          aria-valuemin={0}
          aria-valuemax={maxLevel}
        />
      </div>
      <p className="text-xs text-center mt-1 text-gray-600 font-medium">{message}</p>
    </div>
  )
}
