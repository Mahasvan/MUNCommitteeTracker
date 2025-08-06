import { type NextRequest, NextResponse } from "next/server"
import { getCommitteeById, deleteCommittee } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { password } = await request.json()
    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Password is required" }, { status: 400 })
    }
    const deleted = await deleteCommittee(params.id, password)
    if (deleted) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Invalid password or committee not found" }, { status: 401 })
    }
  } catch (error) {
    console.error("Failed to delete committee:", error)
    return NextResponse.json({ error: "Failed to delete committee" }, { status: 500 })
  }
}
