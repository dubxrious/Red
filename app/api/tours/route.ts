import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Return a static response for now
    return NextResponse.json({ 
      status: "success", 
      message: "This is a static response as a fallback due to Supabase connectivity issues",
      environmentCheck: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not Set",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Not Set",
        SUPABASE_URL: process.env.SUPABASE_URL ? "Set" : "Not Set",
        SUPABASE_KEY: process.env.SUPABASE_KEY ? "Set" : "Not Set",
        NODE_ENV: process.env.NODE_ENV
      },
      sampleTours: [
        {
          id: "sample-1",
          title: "Sample Tour 1",
          slug: "sample-tour-1",
          description: "This is a sample tour to verify API endpoint works",
          category_id: "sample-category",
          destination_id: "sample-destination",
          retail_price: 99.99,
          featured: true
        },
        {
          id: "sample-2",
          title: "Sample Tour 2",
          slug: "sample-tour-2",
          description: "Another sample tour",
          category_id: "sample-category",
          destination_id: "sample-destination",
          retail_price: 149.99,
          featured: false
        }
      ]
    })
  } catch (error: any) {
    console.error("Error in tours API:", error)
    return NextResponse.json(
      { 
        status: "error", 
        message: "Error in tours API", 
        error: error.message,
        stack: error.stack
      },
      { status: 500 }
    )
  }
} 