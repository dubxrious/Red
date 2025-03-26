"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { AdvancedFilters } from "./advanced-filters"

interface FilterCombination {
  id: string
  name: string
  description?: string
  filters: Partial<AdvancedFilters>
}

interface FilterCombinationsProps {
  onApplyFilters: (filters: Partial<AdvancedFilters>) => void
  className?: string
}

export function FilterCombinations({ onApplyFilters, className }: FilterCombinationsProps) {
  const [activeCombo, setActiveCombo] = useState<string | null>(null)

  // Predefined filter combinations with monochrome colors
  const combinations: FilterCombination[] = [
    {
      id: "family",
      name: "Family Friendly",
      description: "Tours suitable for families with children",
      filters: {
        tags: ["family-friendly"],
        groupSize: "small",
        duration: "short",
      },
    },
    {
      id: "adventure",
      name: "Adventure",
      description: "Exciting and thrilling experiences",
      filters: {
        tags: ["adventure", "diving", "snorkeling"],
      },
    },
    {
      id: "luxury",
      name: "Luxury",
      description: "Premium experiences with high-end amenities",
      filters: {
        tags: ["luxury", "gourmet"],
        minRating: 4.5,
      },
    },
    {
      id: "budget",
      name: "Budget Friendly",
      description: "Affordable tours under $100",
      filters: {
        maxPrice: 100,
        onlyDiscounted: true,
      },
    },
    {
      id: "quick",
      name: "Quick Tours",
      description: "Short tours under 3 hours",
      filters: {
        duration: "short",
      },
    },
    {
      id: "top-rated",
      name: "Top Rated",
      description: "Highest rated tours (4.5+ stars)",
      filters: {
        minRating: 4.5,
        sortBy: "rating",
      },
    },
  ]

  const handleApplyCombo = (combo: FilterCombination) => {
    const isActive = activeCombo === combo.id

    if (isActive) {
      // If already active, deactivate it
      setActiveCombo(null)
      onApplyFilters({})
    } else {
      // Apply the new combination
      setActiveCombo(combo.id)
      onApplyFilters(combo.filters)
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Popular Filters</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {combinations.map((combo) => (
          <Badge
            key={combo.id}
            variant={activeCombo === combo.id ? "default" : "outline"}
            className={cn(
              "cursor-pointer px-3 py-1 rounded-full text-sm font-medium transition-all duration-200",
              activeCombo === combo.id
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "hover:bg-secondary",
              "flex items-center space-x-1",
            )}
            onClick={() => handleApplyCombo(combo)}
          >
            {combo.name}
          </Badge>
        ))}
      </div>
    </div>
  )
}

