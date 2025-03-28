import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Get featured tours from Supabase
    const supabase = await createServerSupabaseClient()
    const { data: tours, error } = await supabase
      .from("tours")
      .select("*")
      .eq("featured", true)
      .order("featured_order", { ascending: true })
    
    if (error) {
      throw error
    }
    
    return NextResponse.json({ 
      status: "success", 
      count: tours.length,
      tours 
    })
  } catch (error: any) {
    console.error("Error fetching featured tours:", error)
    
    // Return a static response as a fallback
    return NextResponse.json({
      status: "error",
      message: "Error fetching featured tours",
      error: error.message,
      fallbackData: {
        count: 1,
        tours: [
          {
            id: "fallback-1",
            title: "Fallback Featured Tour",
            slug: "fallback-featured-tour",
            description: "This is a fallback tour shown when the database connection fails",
            retail_price: 99.99,
            image_0_src: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=2070&auto=format&fit=crop"
          }
        ]
      }
    })
  }
} 