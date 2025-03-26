import { supabase } from "@/lib/supabase/client"
import type { Tour } from "@/types/tour"

// Update the searchTours function to support limit and abort controller
export async function searchTours(query: string, limit?: number, signal?: AbortSignal): Promise<Tour[]> {
  try {
    if (!query || query.trim() === "") {
      // If no query, return all tours
      const { data, error } = await supabase
        .from("tours")
        .select(`
          *,
          categories:category_id(*),
          destinations:destination_id(*),
          tour_tags(*, tags(*))
        `)
        .eq("status", "active")
        .limit(limit || 12)

      if (error) {
        console.error("Error fetching tours:", error)
        return []
      }

      return (data as unknown as Tour[]) || []
    }

    // Search for tours that match the query
    const { data, error } = await supabase
      .from("tours")
      .select(`
        *,
        categories:category_id(*),
        destinations:destination_id(*),
        tour_tags(*, tags(*))
      `)
      .eq("status", "active")
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(limit || 24)

    if (error) {
      console.error("Error searching tours:", error)
      return []
    }

    return (data as unknown as Tour[]) || []
  } catch (error) {
    console.error("Unexpected error in searchTours:", error)
    return []
  }
}

// Function to get tours by category
export async function getToursByCategory(categorySlug: string): Promise<Tour[]> {
  try {
    // First get the category ID
    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single()

    if (categoryError || !category) {
      console.error("Error fetching category:", categoryError)
      return []
    }

    // Then get tours with that category ID
    const { data, error } = await supabase
      .from("tours")
      .select(`
        *,
        categories:category_id(*),
        destinations:destination_id(*),
        tour_tags(*, tags(*))
      `)
      .eq("status", "active")
      .eq("category_id", category.id)

    if (error) {
      console.error("Error fetching tours by category:", error)
      return []
    }

    return (data as unknown as Tour[]) || []
  } catch (error) {
    console.error("Unexpected error in getToursByCategory:", error)
    return []
  }
}

// Function to get tours by location
export async function getToursByLocation(locationSlug: string): Promise<Tour[]> {
  try {
    // First get the location ID
    const { data: location, error: locationError } = await supabase
      .from("destinations")
      .select("id")
      .eq("slug", locationSlug)
      .single()

    if (locationError || !location) {
      console.error("Error fetching location:", locationError)
      return []
    }

    // Then get tours with that location ID
    const { data, error } = await supabase
      .from("tours")
      .select(`
        *,
        categories:category_id(*),
        destinations:destination_id(*),
        tour_tags(*, tags(*))
      `)
      .eq("status", "active")
      .eq("destination_id", location.id)

    if (error) {
      console.error("Error fetching tours by location:", error)
      return []
    }

    return (data as unknown as Tour[]) || []
  } catch (error) {
    console.error("Unexpected error in getToursByLocation:", error)
    return []
  }
}

// Function to get tours by tag
export async function getToursByTag(tagSlug: string): Promise<Tour[]> {
  try {
    // First get the tag ID
    const { data: tag, error: tagError } = await supabase.from("tags").select("id").eq("slug", tagSlug).single()

    if (tagError || !tag) {
      console.error("Error fetching tag:", tagError)
      return []
    }

    // Then get tour_tags with that tag ID
    const { data: tourTags, error: tourTagsError } = await supabase
      .from("tour_tags")
      .select("tour_id")
      .eq("tag_id", tag.id)

    if (tourTagsError || !tourTags) {
      console.error("Error fetching tour tags:", tourTagsError)
      return []
    }

    // If no tours have this tag, return empty array
    if (tourTags.length === 0) {
      return []
    }

    // Then get tours with those tour IDs
    const { data, error } = await supabase
      .from("tours")
      .select(`
        *,
        categories:category_id(*),
        destinations:destination_id(*),
        tour_tags(*, tags(*))
      `)
      .eq("status", "active")
      .in(
        "id",
        tourTags.map((tt) => tt.tour_id),
      )

    if (error) {
      console.error("Error fetching tours by tag:", error)
      return []
    }

    return (data as unknown as Tour[]) || []
  } catch (error) {
    console.error("Unexpected error in getToursByTag:", error)
    return []
  }
}

// Function to filter tours by price range
export async function filterToursByPrice(minPrice: number, maxPrice: number, tours?: Tour[]): Promise<Tour[]> {
  try {
    // If tours are provided, filter them
    if (tours) {
      return tours.filter((tour) => {
        const price = tour.discounted_price || tour.retail_price
        return price >= minPrice && price <= maxPrice
      })
    }

    // Otherwise, fetch from database
    const { data, error } = await supabase
      .from("tours")
      .select(`
        *,
        categories:category_id(*),
        destinations:destination_id(*),
        tour_tags(*, tags(*))
      `)
      .eq("status", "active")
      .gte("retail_price", minPrice)
      .lte("retail_price", maxPrice)

    if (error) {
      console.error("Error filtering tours by price:", error)
      return []
    }

    return (data as unknown as Tour[]) || []
  } catch (error) {
    console.error("Unexpected error in filterToursByPrice:", error)
    return []
  }
}

