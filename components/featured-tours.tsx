import { TourCard } from "@/components/tour-card"
import { TourGridSkeleton } from "@/components/tour-grid-skeleton"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { Tour } from "@/types/tour"

export async function FeaturedTours() {
  const supabase = createServerSupabaseClient()

  // First check if the featured column exists
  const { error: checkError } = await supabase.from("tours").select("featured").limit(1).maybeSingle()

  let tours = []

  // If the column doesn't exist, fall back to rating-based selection
  if (checkError && checkError.message.includes('column "featured" does not exist')) {
    // Fetch tours by rating instead
    const { data: ratingData, error: ratingError } = await supabase
      .from("tours")
      .select("*")
      .eq("status", "active")
      .order("rating_exact_score", { ascending: false })
      .limit(4)

    if (ratingError) {
      console.error("Error fetching featured tours:", ratingError)
      return <div>Error loading featured tours</div>
    }

    tours = ratingData
  } else {
    // Use the featured flag and order
    const { data: featuredData, error: featuredError } = await supabase
      .from("tours")
      .select("*")
      .eq("status", "active")
      .eq("featured", true)
      .order("featured_order", { ascending: true })
      .limit(4)

    if (featuredError) {
      console.error("Error fetching featured tours:", featuredError)
      return <div>Error loading featured tours</div>
    }

    tours = featuredData
  }

  // Now fetch categories and destinations separately
  if (tours.length > 0) {
    // Get unique category and destination IDs
    const categoryIds = [...new Set(tours.map((tour) => tour.category_id))]
    const destinationIds = [...new Set(tours.map((tour) => tour.destination_id))]

    // Fetch categories
    const { data: categories } = await supabase.from("categories").select("*").in("id", categoryIds)

    // Fetch destinations
    const { data: destinations } = await supabase.from("destinations").select("*").in("id", destinationIds)

    // Fetch tour tags
    const { data: tourTags } = await supabase
      .from("tour_tags")
      .select("*, tags(*)")
      .in(
        "tour_id",
        tours.map((tour) => tour.id),
      )

    // Manually join the data
    tours = tours.map((tour) => {
      const category = categories?.find((c) => c.id === tour.category_id)
      const destination = destinations?.find((d) => d.id === tour.destination_id)
      const tags = tourTags?.filter((tt) => tt.tour_id === tour.id)

      return {
        ...tour,
        categories: category,
        destinations: destination,
        tour_tags: tags,
      }
    })
  }

  if (!tours || tours.length === 0) {
    return <div>No featured tours available</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {tours.map((tour) => (
        <TourCard key={tour.id} tour={tour as Tour} />
      ))}
    </div>
  )
}

// Create a separate loading component that can be used with Suspense
export function FeaturedToursSkeleton() {
  return <TourGridSkeleton count={4} columns={4} />
}

