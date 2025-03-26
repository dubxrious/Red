"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { SearchBar } from "@/components/search/search-bar"
import { SearchFilters } from "@/components/search/search-filters"
import { SearchResults } from "@/components/search/search-results"
import { Breadcrumb } from "@/components/breadcrumb"
import { searchTours } from "@/lib/services/search-service"
import type { Tour } from "@/types/tour"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""
  const [query, setQuery] = useState(initialQuery)
  const [tours, setTours] = useState<Tour[]>([])
  const [filteredTours, setFilteredTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch tours when query changes
  useEffect(() => {
    async function fetchTours() {
      setLoading(true)
      try {
        const results = await searchTours(query)
        setTours(results)
        setFilteredTours(results)
      } catch (error) {
        console.error("Error searching tours:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTours()
  }, [query])

  // Update query when URL changes
  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  // Handle search from the search bar
  const handleSearch = (newQuery: string) => {
    setQuery(newQuery)

    // Update URL without full page reload
    const url = new URL(window.location.href)
    url.searchParams.set("q", newQuery)
    window.history.pushState({}, "", url.toString())
  }

  // Handle filter changes
  const handleFiltersChange = (filters: any) => {
    // Apply filters to the tours
    let filtered = [...tours]

    // Filter by price range
    if (filters.priceRange) {
      const [min, max] = filters.priceRange
      filtered = filtered.filter((tour) => {
        const price = tour.discounted_price || tour.retail_price
        return price >= min && price <= max
      })
    }

    // Filter by minimum rating
    if (filters.minRating > 0) {
      filtered = filtered.filter((tour) => tour.rating_exact_score >= filters.minRating)
    }

    // Filter by categories
    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter((tour) => {
        const category = tour.categories as any
        return filters.categories.includes(category?.name)
      })
    }

    // Filter by locations
    if (filters.locations && filters.locations.length > 0) {
      filtered = filtered.filter((tour) => {
        const location = tour.destinations as any
        return filters.locations.includes(location?.name)
      })
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter((tour) => {
        const tourTags = tour.tour_tags as any[]
        if (!tourTags) return false

        const tagSlugs = tourTags.map((tt) => tt.tags?.slug).filter(Boolean)
        return filters.tags.some((tag: string) => tagSlugs.includes(tag))
      })
    }

    // Filter by discount
    if (filters.onlyDiscounted) {
      filtered = filtered.filter((tour) => tour.discounted_price && tour.discounted_price < tour.retail_price)
    }

    setFilteredTours(filtered)
  }

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Search", href: "/search", active: true },
          ]}
        />

        <div className="mt-6 mb-8">
          <SearchBar
            initialQuery={query}
            onSearch={handleSearch}
            className="max-w-3xl mb-6"
            showInstantResults={false} // Disable instant results on the search page
          />

          <h1 className="text-3xl font-bold">{query ? `Search Results for "${query}"` : "All Tours"}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <SearchFilters onFiltersChange={handleFiltersChange} />
          </div>

          <div className="lg:col-span-3">
            <SearchResults initialTours={filteredTours} query={query} />
          </div>
        </div>
      </div>
    </main>
  )
}

