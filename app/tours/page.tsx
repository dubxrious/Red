"use client"

import { useEffect, useState } from "react"
import { Tours, ToursSkeleton } from "@/components/tours"
import { Breadcrumb } from "@/components/breadcrumb"
import { getTours } from "@/lib/services/tour-service"
import { Skeleton } from "@/components/ui/skeleton"

export default function ToursPage() {
  const [tours, setTours] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTours() {
      const toursData = await getTours()
      setTours(toursData)
      setLoading(false)
    }

    loadTours()
  }, [])

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Tours", href: "/tours", active: true },
          ]}
        />

        {loading ? (
          <>
            <div className="mt-6 mb-4">
              <Skeleton className="h-10 w-64 mb-4" />
              <Skeleton className="h-5 w-full max-w-3xl mb-8" />
            </div>
            <ToursSkeleton />
          </>
        ) : (
          <>
            <h1 className="text-4xl font-bold mt-6 mb-4">Tours & Experiences</h1>
            <p className="text-muted-foreground mb-8 max-w-3xl">
              Discover the beauty of the Red Sea with our curated selection of marine tours and experiences. Filter by
              category, price, or rating to find your perfect adventure.
            </p>
            <Tours initialTours={tours} showFilters={true} />
          </>
        )}
      </div>
    </main>
  )
}

