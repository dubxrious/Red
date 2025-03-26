"use client"

import { useState, useEffect } from "react"
import { Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
// Update the import statement to use the correct function
import { getReviewsByTourId } from "@/lib/reviews"
import type { Review } from "@/types/review"

interface TourReviewsProps {
  tourId: string
  className?: string
}

export function TourReviews({ tourId, className = "" }: TourReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])

  // Update the useEffect to use the new function name
  useEffect(() => {
    const fetchedReviews = getReviewsByTourId(tourId)
    setReviews(fetchedReviews)
  }, [tourId])

  if (reviews.length === 0) {
    return null
  }

  // Calculate rating distribution
  const ratingCounts = [0, 0, 0, 0, 0]
  reviews.forEach((review) => {
    const rating = Math.floor(review.rating)
    if (rating >= 1 && rating <= 5) {
      ratingCounts[rating - 1]++
    }
  })

  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length

  return (
    <div className={className}>
      <h2 className="text-2xl font-semibold mb-6">Guest Reviews</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="md:col-span-1">
          <div className="flex flex-col items-center">
            <div className="text-5xl font-bold mb-2">{averageRating.toFixed(1)}</div>
            <div className="flex mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${star <= Math.round(averageRating) ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`}
                />
              ))}
            </div>
            <div className="text-sm text-muted-foreground mb-4">Based on {reviews.length} reviews</div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingCounts[rating - 1]
              const percentage = (count / reviews.length) * 100

              return (
                <div key={rating} className="flex items-center gap-2">
                  <div className="w-12 text-sm text-muted-foreground">{rating} stars</div>
                  <Progress value={percentage} className="h-2 flex-1" />
                  <div className="w-12 text-sm text-right text-muted-foreground">{count}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {reviews.slice(0, 5).map((review) => (
          <div key={review.id} className="pb-6 border-b last:border-0">
            <div className="flex items-start gap-4">
              <Avatar>
                <AvatarImage src={review.avatar} alt={review.name} />
                <AvatarFallback>{review.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{review.name}</div>
                <div className="flex items-center gap-2 mt-1 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${star <= review.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(review.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <p className="text-sm">{review.comment}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {reviews.length > 5 && (
        <div className="mt-6 text-center">
          <button className="text-sm font-medium text-primary hover:underline">
            View all {reviews.length} reviews
          </button>
        </div>
      )}
    </div>
  )
}

