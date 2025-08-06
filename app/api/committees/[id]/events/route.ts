import { type NextRequest, NextResponse } from "next/server"
import { getCommitteeEvents, addCommitteeEvent } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const events = await getCommitteeEvents(params.id)
    return NextResponse.json(events)
  } catch (error) {
    console.error("Failed to get events:", error)
    return NextResponse.json({ error: "Failed to get events" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { type, details } = await request.json()

    if (!type || !details) {
      return NextResponse.json({ error: "Type and details are required" }, { status: 400 })
    }

    const validTypes = ["speech", "point_of_order", "point_of_information", "motion"]
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid event type" }, { status: 400 })
    }

    const event = await addCommitteeEvent(params.id, type, details)
    return NextResponse.json(event)
  } catch (error) {
    console.error("Failed to add event:", error)
    return NextResponse.json({ error: "Failed to add event" }, { status: 500 })
  }
}
