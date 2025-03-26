import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  // This is a stub implementation that returns success
  // The actual Algolia sync is disabled

  return NextResponse.json({
    success: true,
    message: "Algolia sync is disabled. Using stub implementation.",
    result: {
      objectIDs: [],
      taskIDs: [],
    },
  })
}

