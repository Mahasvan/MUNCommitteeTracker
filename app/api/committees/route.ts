import { type NextRequest, NextResponse } from "next/server"
import { getCommittees, createCommittee } from "@/lib/database"

export async function GET() {
  try {
    const committees = await getCommittees()
    return NextResponse.json(committees)
  } catch (error) {
    console.error("Failed to get committees:", error)
    return NextResponse.json({ error: "Failed to get committees" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, password } = await request.json()

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Committee name is required" }, { status: 400 })
    }

    if (!password || typeof password !== "string" || password.length < 4) {
      return NextResponse.json({ error: "Password must be at least 4 characters long" }, { status: 400 })
    }

    const committee = await createCommittee(name.trim(), password)
    return NextResponse.json(committee)
  } catch (error) {
    console.error("Failed to create committee:", error)
    return NextResponse.json({ error: "Failed to create committee" }, { status: 500 })
  }
}
