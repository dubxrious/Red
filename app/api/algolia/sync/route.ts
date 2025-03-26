import { type NextRequest, NextResponse } from "next/server"
import { syncToursWithAlgolia } from "@/lib/services/algolia-service"

export async function POST(request: NextRequest) {
  try {
    // Check for API key or other authentication
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const apiKey = authHeader.split(" ")[1]
    if (apiKey !== process.env.ALGOLIA_SYNC_API_KEY) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 403 })
    }

    // Sync tours with Algolia
    const result = await syncToursWithAlgolia()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Tours synced successfully",
        result: result.result,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to sync tours",
          details: result.error,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in Algolia sync API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

