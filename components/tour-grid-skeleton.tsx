import { TourCardSkeleton } from "@/components/tour-card-skeleton"

interface TourGridSkeletonProps {
  count?: number
  columns?: number
}

export function TourGridSkeleton({ count = 4, columns = 4 }: TourGridSkeletonProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-6`}>
      {Array.from({ length: count }).map((_, index) => (
        <TourCardSkeleton key={index} />
      ))}
    </div>
  )
}

