import { supabase } from "@/lib/supabase/client"
import type { Tour, TourFilter } from "@/types/tour"

// Create a cache for the tour data to avoid redundant fetches
const tourCache = {
  allTours: null as Tour[] | null,
  featuredTours: null as Tour[] | null,
  bySlug: new Map<string, Tour>(),
  timestamp: 0,
  cacheDuration: 5 * 60 * 1000, // 5 minutes cache
}

// Function to check if cache is valid
function isCacheValid() {
  return tourCache.timestamp > 0 && Date.now() - tourCache.timestamp < tourCache.cacheDuration
}

// Client-side functions only
export async function getTours(filters?: TourFilter): Promise<Tour[]> {
  // Use cached data if available and valid
  if (tourCache.allTours && isCacheValid() && !filters) {
    console.log("Using cached tours data")
    return tourCache.allTours
  }

  let query = supabase.from("tours").select("*").eq("status", "active")

  // Apply filters
  if (filters?.category) {
    query = query.eq("category_id", filters.category)
  }

  if (filters?.location) {
    query = query.eq("destination_id", filters.location)
  }

  if (filters?.minPrice) {
    query = query.gte("retail_price", filters.minPrice)
  }

  if (filters?.maxPrice) {
    query = query.lte("retail_price", filters.maxPrice)
  }

  if (filters?.minRating) {
    query = query.gte("rating_exact_score", filters.minRating)
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching tours:", error)
    return []
  }

  // Fetch related data separately
  const tourIds = data.map((tour) => tour.id)

  // Fetch categories
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .in(
      "id",
      data.map((tour) => tour.category_id),
    )

  // Fetch destinations
  const { data: destinations } = await supabase
    .from("destinations")
    .select("*")
    .in(
      "id",
      data.map((tour) => tour.destination_id),
    )

  // Fetch tour tags
  const { data: tourTags } = await supabase.from("tour_tags").select("*, tags(*)").in("tour_id", tourIds)

  // Map related data to tours
  const toursWithRelations = data.map((tour) => {
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

  // Cache the data if no filters were applied
  if (!filters) {
    tourCache.allTours = toursWithRelations as Tour[]
    tourCache.timestamp = Date.now()
    console.log("Caching tours data")
  }

  return toursWithRelations as Tour[]
}

export async function getTourBySlug(slug: string): Promise<Tour | null> {
  // Check cache first
  if (tourCache.bySlug.has(slug) && isCacheValid()) {
    console.log(`Using cached data for tour: ${slug}`)
    return tourCache.bySlug.get(slug) || null
  }

  const { data, error } = await supabase.from("tours").select("*").eq("slug", slug).single()

  if (error) {
    console.error("Error fetching tour:", error)
    return null
  }

  // Fetch related data
  const { data: category } = await supabase.from("categories").select("*").eq("id", data.category_id).single()

  const { data: destination } = await supabase.from("destinations").select("*").eq("id", data.destination_id).single()

  const { data: tourTags } = await supabase.from("tour_tags").select("*, tags(*)").eq("tour_id", data.id)

  const { data: tourFeatures } = await supabase.from("tour_features").select("*").eq("tour_id", data.id)

  const tourWithRelations = {
    ...data,
    categories: category,
    destinations: destination,
    tour_tags: tourTags,
    tour_features: tourFeatures,
  } as unknown as Tour

  // Cache the tour
  tourCache.bySlug.set(slug, tourWithRelations)

  return tourWithRelations
}

export async function getFeaturedTours(count = 4): Promise<Tour[]> {
  // Check cache first
  if (tourCache.featuredTours && isCacheValid()) {
    console.log("Using cached featured tours")
    return tourCache.featuredTours.slice(0, count)
  }

  // Changed to select tours with featured flag
  const { data, error } = await supabase
    .from("tours")
    .select("*")
    .eq("status", "active")
    .eq("featured", true)
    .order("featured_order", { ascending: true }) // Optional ordering field
    .limit(count)

  if (error) {
    console.error("Error fetching featured tours:", error)
    return []
  }

  // Fetch related data separately
  const tourIds = data.map((tour) => tour.id)

  // Fetch categories
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .in(
      "id",
      data.map((tour) => tour.category_id),
    )

  // Fetch destinations
  const { data: destinations } = await supabase
    .from("destinations")
    .select("*")
    .in(
      "id",
      data.map((tour) => tour.destination_id),
    )

  // Fetch tour tags
  const { data: tourTags } = await supabase.from("tour_tags").select("*, tags(*)").in("tour_id", tourIds)

  // Map related data to tours
  const toursWithRelations = data.map((tour) => {
    const category = categories?.find((c) => c.id === tour.category_id)
    const destination = destinations?.find((d) => d.id === tour.destination_id)
    const tags = tourTags?.filter((tt) => tt.tour_id === tour.id)

    return {
      ...tour,
      categories: category,
      destinations: destination,
      tour_tags: tags,
    }
  }) as Tour[]

  // Cache the featured tours
  tourCache.featuredTours = toursWithRelations
  tourCache.timestamp = Date.now()

  return toursWithRelations
}

export async function getRelatedTours(categoryId: string, excludeId: string, count = 3): Promise<Tour[]> {
  const { data, error } = await supabase
    .from("tours")
    .select("*")
    .eq("category_id", categoryId)
    .neq("id", excludeId)
    .eq("status", "active")
    .limit(count)

  if (error) {
    console.error("Error fetching related tours:", error)
    return []
  }

  // Fetch related data separately
  const tourIds = data.map((tour) => tour.id)

  // Fetch categories
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .in(
      "id",
      data.map((tour) => tour.category_id),
    )

  // Fetch destinations
  const { data: destinations } = await supabase
    .from("destinations")
    .select("*")
    .in(
      "id",
      data.map((tour) => tour.destination_id),
    )

  // Fetch tour tags
  const { data: tourTags } = await supabase.from("tour_tags").select("*, tags(*)").in("tour_id", tourIds)

  // Map related data to tours
  const toursWithRelations = data.map((tour) => {
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

  return toursWithRelations as unknown as Tour[]
}

// Add function to clear cache when needed (e.g., after updates)
export function clearTourCache() {
  tourCache.allTours = null
  tourCache.featuredTours = null
  tourCache.bySlug.clear()
  tourCache.timestamp = 0
  console.log("Tour cache cleared")
}

