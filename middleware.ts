import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // This is a minimal middleware that doesn't do anything yet
  // We're just ensuring it exists and is properly formatted
  return NextResponse.next()
}

