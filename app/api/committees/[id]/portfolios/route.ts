import { type NextRequest, NextResponse } from "next/server"
import { updateCommitteePortfolios } from "@/lib/database"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { portfolios } = await request.json()

    if (!Array.isArray(portfolios) || portfolios.length === 0) {
      return NextResponse.json({ error: "Valid portfolios array is required" }, { status: 400 })
    }

    // Validate all portfolios are strings
    for (const portfolio of portfolios) {
      if (typeof portfolio !== "string" || !portfolio.trim()) {
        return NextResponse.json({ error: "All portfolios must be non-empty strings" }, { status: 400 })
      }
    }

    await updateCommitteePortfolios(params.id, portfolios)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to update portfolios:", error)
    return NextResponse.json({ error: "Failed to update portfolios" }, { status: 500 })
  }
}
