"use client"

import { useState, useEffect } from "react"
import { TourCard } from "@/components/tour-card"
import { Skeleton } from "@/components/ui/skeleton"
import { searchTours } from "@/lib/services/search-service"
import type { Tour } from "@/types/tour"

interface SearchResultsProps {
  initialQuery?: string
  initialTours?: Tour[]
  query?: string
}

export function SearchResults({ initialQuery = "", initialTours, query = "" }: SearchResultsProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [tours, setTours] = useState<Tour[]>(initialTours || [])
  const [loading, setLoading] = useState(!initialTours)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialTours) {
      setTours(initialTours)
      setLoading(false)
      return
    }

    async function fetchTours() {
      setLoading(true)
      setError(null)

      try {
        const results = await searchTours(query)
        setTours(results)
      } catch (err) {
        console.error("Error searching tours:", err)
        setError("An error occurred while searching. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchTours()
  }, [query, initialTours])

  // Update query when initialQuery changes
  useEffect(() => {
    if (initialQuery !== searchQuery) {
      setSearchQuery(initialQuery)
    }
  }, [initialQuery, searchQuery])

  if (error) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <h3 className="text-lg font-medium text-red-600">Error</h3>
        <p className="text-muted-foreground mt-2">{error}</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="border rounded-lg overflow-hidden">
            <Skeleton className="aspect-[4/3] w-full" />
            <div className="p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6 mb-4" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (tours.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <h3 className="text-lg font-medium">No tours found</h3>
        <p className="text-muted-foreground mt-2">
          Try adjusting your search or filters to find what you're looking for.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tours.map((tour) => (
          <TourCard key={tour.id} tour={tour} searchQuery={query} />
        ))}
      </div>

      <div className="text-center text-sm text-muted-foreground">Showing {tours.length} results</div>
    </div>
  )
}

