import { NextRequest, NextResponse } from "next/server"
import { readFileSync } from "fs"
import { join } from "path"

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  try {
    const filePath = join(process.cwd(), "src", "data", `${slug}.json`)
    const content = readFileSync(filePath, "utf-8")
    return NextResponse.json(JSON.parse(content))
  } catch {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
  }
}
