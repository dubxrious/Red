import Link from "next/link"
import { TourCard } from "@/components/tour-card"
import type { Tour } from "@/types/tour"

interface RelatedToursProps {
  tours: Tour[]
  className?: string
}

export function RelatedTours({ tours, className = "" }: RelatedToursProps) {
  if (tours.length === 0) {
    return null
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">You Might Also Like</h2>
        <Link href="/tours" className="text-sm font-medium text-primary hover:underline">
          View all tours
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tours.map((tour) => (
          <TourCard key={tour.id} tour={tour} />
        ))}
      </div>
    </div>
  )
}

