import type { MissionMapNode } from "@/types/gamification"
import Link from "next/link"

interface MissionMapProps {
  nodes: MissionMapNode[]
}

const statusStyles = {
  completed: "bg-green-500 text-white border-green-600",
  unlocked: "bg-blue-500 text-white border-blue-600 hover:bg-blue-600 cursor-pointer",
  locked: "bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed",
}

const statusIcons = {
  completed: "✓",
  unlocked: "→",
  locked: "🔒",
}

export default function MissionMap({ nodes }: MissionMapProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative flex flex-col items-center gap-0">
        {nodes.map((node, i) => (
          <div key={node.lessonId} className="flex flex-col items-center w-full">
            <div className={`w-full max-w-sm p-4 rounded-2xl border-2 shadow-md transition ${statusStyles[node.status]}`}>
              {node.status === "locked" ? (
                <div className="flex items-center gap-3">
                  <span className="text-xl">{statusIcons[node.status]}</span>
                  <div>
                    <p className="font-bold text-sm">{node.title}</p>
                    <p className="text-xs opacity-70">Selesaikan misi sebelumnya</p>
                  </div>
                </div>
              ) : (
                <Link href={`/lessons/${node.lessonId}`} className="flex items-center gap-3">
                  <span className="text-xl">{statusIcons[node.status]}</span>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{node.title}</p>
                    <p className="text-xs opacity-70">+{node.xpReward} XP</p>
                  </div>
                  {node.status === "completed" && <span className="text-xs">Selesai ✓</span>}
                </Link>
              )}
            </div>
            {i < nodes.length - 1 && (
              <div className="w-0.5 h-6 bg-gray-300" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
