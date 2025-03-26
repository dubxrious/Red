"use client"

import { useState, useEffect } from "react"
import { TourCard } from "@/components/tour-card"
import { Button } from "@/components/ui/button"
import { getAllTours } from "@/lib/tours"
import type { Tour } from "@/types/tour"

interface SimilarToursProps {
  currentTour: Tour
  className?: string
}

export function SimilarTours({ currentTour, className }: SimilarToursProps) {
  const [similarTours, setSimilarTours] = useState<Tour[]>([])
  const [viewMode, setViewMode] = useState<"category" | "location" | "tags">("category")

  useEffect(() => {
    findSimilarTours(viewMode)
  }, [currentTour, viewMode])

  const findSimilarTours = (mode: "category" | "location" | "tags") => {
    const allTours = getAllTours()
    let filtered: Tour[] = []

    switch (mode) {
      case "category":
        filtered = allTours.filter((tour) => tour.id !== currentTour.id && tour.category === currentTour.category)
        break
      case "location":
        filtered = allTours.filter((tour) => tour.id !== currentTour.id && tour.location === currentTour.location)
        break
      case "tags":
        if (!currentTour.tags || currentTour.tags.length === 0) {
          filtered = []
          break
        }

        // Find tours with at least 2 matching tags
        filtered = allTours.filter((tour) => {
          if (tour.id === currentTour.id || !tour.tags) return false

          const matchingTags = tour.tags.filter((tag) => currentTour.tags?.includes(tag))

          return matchingTags.length >= 2
        })
        break
    }

    // Sort by rating and limit to 3
    filtered.sort((a, b) => b.rating_exact_score - a.rating_exact_score)
    setSimilarTours(filtered.slice(0, 3))
  }

  if (similarTours.length === 0) return null

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">You Might Also Like</h2>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "category" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("category")}
          >
            Similar Category
          </Button>
          <Button
            variant={viewMode === "location" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("location")}
          >
            Same Location
          </Button>
          <Button variant={viewMode === "tags" ? "default" : "outline"} size="sm" onClick={() => setViewMode("tags")}>
            Similar Features
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {similarTours.map((tour) => (
          <TourCard key={tour.id} tour={tour} />
        ))}
      </div>
    </div>
  )
}

