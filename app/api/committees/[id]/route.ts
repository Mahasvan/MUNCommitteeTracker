import { type NextRequest, NextResponse } from "next/server"
import { initDatabase, getCommitteeById } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await initDatabase()
    const committee = await getCommitteeById(params.id)

    if (!committee) {
      return NextResponse.json({ error: "Committee not found" }, { status: 404 })
    }

    return NextResponse.json(committee)
  } catch (error) {
    console.error("Failed to get committee:", error)
    return NextResponse.json({ error: "Failed to get committee" }, { status: 500 })
  }
}
