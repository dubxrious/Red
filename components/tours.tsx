"use client"

import { useState, useEffect } from "react"
import { TourCard } from "@/components/tour-card"
import { TourGridSkeleton } from "@/components/tour-grid-skeleton"
import { AdvancedFilters } from "@/components/advanced-filters"
import { FilterCombinations } from "@/components/filter-combinations"
import { getTours } from "@/lib/services/tour-service"
import type { Tour } from "@/types/tour"

interface ToursProps {
  showFilters?: boolean
  initialTours?: Tour[]
}

export function Tours({ showFilters = false, initialTours }: ToursProps) {
  const [tours, setTours] = useState<Tour[]>(initialTours || [])
  const [filteredTours, setFilteredTours] = useState<Tour[]>(initialTours || [])
  const [loading, setLoading] = useState(!initialTours)
  const [filters, setFilters] = useState({
    category: "all",
    location: "all",
    minPrice: 0,
    maxPrice: 1000,
    minRating: 0,
    tags: [] as string[],
    duration: "all",
    groupSize: "all",
    dateRange: "all",
    amenities: [] as string[],
    accessibility: [] as string[],
    sortBy: "recommended",
    onlyDiscounted: false,
    onlyAvailable: false,
    search: "",
  })

  useEffect(() => {
    if (!initialTours) {
      async function fetchTours() {
        setLoading(true)
        const data = await getTours()
        setTours(data)
        setFilteredTours(data)
        setLoading(false)
      }

      fetchTours()
    }
  }, [initialTours])

  useEffect(() => {
    let result = tours

    // Apply category filter
    if (filters.category && filters.category !== "all") {
      result = result.filter((tour) => {
        const category = tour.categories as any
        return category?.slug === filters.category
      })
    }

    // Apply location filter
    if (filters.location && filters.location !== "all") {
      result = result.filter((tour) => {
        const destination = tour.destinations as any
        return destination?.slug === filters.location
      })
    }

    // Apply price filter
    result = result.filter((tour) => {
      const price = tour.discounted_price || tour.retail_price
      return price >= filters.minPrice && price <= filters.maxPrice
    })

    // Apply rating filter
    if (filters.minRating > 0) {
      result = result.filter((tour) => tour.rating_exact_score >= filters.minRating)
    }

    // Apply tag filters
    if (filters.tags.length > 0) {
      result = result.filter((tour) => {
        const tourTags = tour.tour_tags as any[]
        if (!tourTags) return false

        // Extract tag slugs from the tour_tags array
        const tagSlugs = tourTags.map((tt) => tt.tags?.slug).filter(Boolean)

        // Check if all filter tags are included in the tour's tags
        return filters.tags.every((tag) => tagSlugs.includes(tag))
      })
    }

    // Apply duration filter
    if (filters.duration !== "all") {
      result = result.filter((tour) => {
        const totalHours = (tour.duration_days || 0) * 24 + (tour.duration_hours || 0)

        switch (filters.duration) {
          case "short":
            return totalHours < 3
          case "medium":
            return totalHours >= 3 && totalHours <= 6
          case "long":
            return totalHours > 6 && totalHours < 24
          case "full-day":
            return totalHours >= 24 && totalHours <= 36
          case "multi-day":
            return (tour.duration_days || 0) > 1
          default:
            return true
        }
      })
    }

    // Apply group size filter
    if (filters.groupSize !== "all") {
      result = result.filter((tour) => {
        const maxCapacity = tour.max_capacity || 20

        switch (filters.groupSize) {
          case "small":
            return maxCapacity <= 8
          case "medium":
            return maxCapacity > 8 && maxCapacity <= 15
          case "large":
            return maxCapacity > 15
          case "private":
            // Check if tour has a "private-tour" tag
            const tourTags = tour.tour_tags as any[]
            if (!tourTags) return false
            const tagSlugs = tourTags.map((tt) => tt.tags?.slug).filter(Boolean)
            return tagSlugs.includes("private-tour")
          default:
            return true
        }
      })
    }

    // Apply discounted filter
    if (filters.onlyDiscounted) {
      result = result.filter((tour) => tour.discounted_price !== null && tour.discounted_price < tour.retail_price)
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(
        (tour) =>
          tour.title.toLowerCase().includes(searchLower) || tour.description.toLowerCase().includes(searchLower),
      )
    }

    // Apply sorting
    result = sortTours(result, filters.sortBy)

    setFilteredTours(result)
  }, [filters, tours])

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const handleReset = () => {
    setFilters({
      category: "all",
      location: "all",
      minPrice: 0,
      maxPrice: 1000,
      minRating: 0,
      tags: [],
      duration: "all",
      groupSize: "all",
      dateRange: "all",
      amenities: [],
      accessibility: [],
      sortBy: "recommended",
      onlyDiscounted: false,
      onlyAvailable: false,
      search: "",
    })
  }

  const sortTours = (toursToSort: Tour[], sortBy: string): Tour[] => {
    const sorted = [...toursToSort]

    switch (sortBy) {
      case "price-low":
        return sorted.sort((a, b) => {
          const priceA = a.discounted_price || a.retail_price
          const priceB = b.discounted_price || b.retail_price
          return priceA - priceB
        })
      case "price-high":
        return sorted.sort((a, b) => {
          const priceA = a.discounted_price || a.retail_price
          const priceB = b.discounted_price || b.retail_price
          return priceB - priceA
        })
      case "rating":
        return sorted.sort((a, b) => b.rating_exact_score - a.rating_exact_score)
      case "duration-short":
        return sorted.sort((a, b) => {
          const durationA = (a.duration_days || 0) * 24 + (a.duration_hours || 0)
          const durationB = (b.duration_days || 0) * 24 + (b.duration_hours || 0)
          return durationA - durationB
        })
      case "duration-long":
        return sorted.sort((a, b) => {
          const durationA = (a.duration_days || 0) * 24 + (a.duration_hours || 0)
          const durationB = (b.duration_days || 0) * 24 + (b.duration_hours || 0)
          return durationB - durationA
        })
      case "popularity":
        return sorted.sort((a, b) => b.review_count - a.review_count)
      case "recommended":
      default:
        // Recommended is a weighted score of rating and review count
        return sorted.sort((a, b) => {
          const scoreA = a.rating_exact_score * Math.log(a.review_count + 1)
          const scoreB = b.rating_exact_score * Math.log(b.review_count + 1)
          return scoreB - scoreA
        })
    }
  }

  return (
    <div className="space-y-6">
      {showFilters && (
        <>
          <AdvancedFilters filters={filters} onFilterChange={handleFilterChange} onReset={handleReset} tours={tours} />

          <FilterCombinations onApplyFilters={handleFilterChange} />
        </>
      )}

      <div>
        {loading ? (
          <TourGridSkeleton count={6} columns={3} />
        ) : filteredTours.length === 0 ? (
          <div className="text-center py-12 border rounded-lg">
            <h3 className="text-lg font-medium">No tours found</h3>
            <p className="text-muted-foreground mt-2">Try adjusting your filters or search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function ToursSkeleton() {
  return <TourGridSkeleton count={6} columns={3} />
}

