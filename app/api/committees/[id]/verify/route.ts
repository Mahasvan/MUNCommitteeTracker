import { type NextRequest, NextResponse } from "next/server"
import { verifyCommitteeAccess } from "@/lib/database"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { password } = await request.json()

    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Password is required" }, { status: 400 })
    }

    const isValid = await verifyCommitteeAccess(params.id, password)
    
    if (!isValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to verify committee access:", error)
    return NextResponse.json({ error: "Failed to verify access" }, { status: 500 })
  }
} 