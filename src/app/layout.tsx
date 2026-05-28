import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import Header from "@/components/layout/Header"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Tim Keselamatan Api - Edukasi Keselamatan Kebakaran",
  description: "Modul gamifikasi keselamatan kebakaran berbasis web untuk siswa SMP Indonesia",
  manifest: "/manifest.json",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900 font-sans">
        <Header />
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6">
          {children}
        </main>
        <footer className="text-center text-xs text-gray-400 py-4 border-t">
          Tim Keselamatan Api © 2026 | Edukasi Keselamatan Kebakaran untuk SMP
        </footer>
      </body>
    </html>
  )
}
