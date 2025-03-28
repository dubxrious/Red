import { TourCard } from "@/components/tour-card"
import { TourGridSkeleton } from "@/components/tour-grid-skeleton"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { Tour } from "@/types/tour"

// Modified component to accept tours as a prop or fetch them if not provided
export async function FeaturedTours({ tours }: { tours?: Tour[] }) {
  // If tours are provided, use them directly
  if (tours && tours.length > 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tours.map((tour) => (
          <TourCard key={tour.id} tour={tour} />
        ))}
      </div>
    )
  }

  // Otherwise, fetch tours from the database
  const supabase = await createServerSupabaseClient()

  // First check if the featured column exists
  const { error: checkError } = await supabase.from("tours").select("featured").limit(1).maybeSingle()

  let fetchedTours = []

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

    fetchedTours = ratingData
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

    fetchedTours = featuredData
  }

  // Now fetch categories and destinations separately
  if (fetchedTours.length > 0) {
    // Get unique category and destination names
    const categoryNames = [...new Set(fetchedTours.map((tour) => tour.category))]
    const locationNames = [...new Set(fetchedTours.map((tour) => tour.location))]

    // Fetch categories
    const { data: categories } = await supabase.from("categories").select("*").in("slug", categoryNames)

    // Fetch destinations
    const { data: destinations } = await supabase.from("destinations").select("*").in("slug", locationNames)

    // Fetch tour tags
    const { data: tourTags } = await supabase
      .from("tour_tags")
      .select("*, tags(*)")
      .in(
        "tour_id",
        fetchedTours.map((tour) => tour.id),
      )

    // Manually join the data
    fetchedTours = fetchedTours.map((tour) => {
      const category = categories?.find((c) => c.slug === tour.category)
      const destination = destinations?.find((d) => d.slug === tour.location)
      const tags = tourTags?.filter((tt) => tt.tour_id === tour.id)

      return {
        ...tour,
        categories: category,
        destinations: destination,
        tour_tags: tags,
      }
    })
  }

  if (!fetchedTours || fetchedTours.length === 0) {
    return <div>No featured tours available</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {fetchedTours.map((tour) => (
        <TourCard key={tour.id} tour={tour as Tour} />
      ))}
    </div>
  )
}

// Create a separate loading component that can be used with Suspense
export function FeaturedToursSkeleton() {
  return <TourGridSkeleton count={4} columns={4} />
}

