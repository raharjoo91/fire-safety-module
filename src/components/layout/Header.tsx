"use client"

import Link from "next/link"
import { useProgress } from "@/hooks/useProgress"

export default function Header() {
  const { progress, level, currentXP, nextLevelXP } = useProgress()

  return (
    <header className="bg-gradient-to-r from-blue-700 to-blue-500 text-white shadow-lg">
      <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-700 font-bold text-sm">
            TK
          </div>
          <span className="font-bold text-sm hidden sm:block">Tim Keselamatan Api</span>
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          <Link href="/" className="hover:underline">Misi</Link>
          <Link href="/profile" className="hover:underline">Profil</Link>
          <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1 text-xs" title="Level">
            <span>Lv.{level}</span>
            <span className="opacity-70">|</span>
            <span>{currentXP}/{nextLevelXP} XP</span>
          </div>
          <div className="bg-white/20 rounded-full px-3 py-1 text-xs">
            ★ {progress.badges.length}
          </div>
        </nav>
      </div>
    </header>
  )
}
