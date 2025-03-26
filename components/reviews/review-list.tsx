"use client"

import { useState } from "react"
import { Star, ThumbsDown, ThumbsUp } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Review } from "@/types/review"
import { voteReview } from "@/lib/reviews"
import { useToast } from "@/components/ui/use-toast"

interface ReviewListProps {
  reviews: Review[]
  className?: string
}

export function ReviewList({ reviews, className = "" }: ReviewListProps) {
  const { toast } = useToast()
  const [sortOption, setSortOption] = useState("newest")
  const [displayedReviews, setDisplayedReviews] = useState(reviews)
  const [expandedReviews, setExpandedReviews] = useState<string[]>([])

  // Calculate rating distribution
  const ratingCounts = [0, 0, 0, 0, 0]
  reviews.forEach((review) => {
    const rating = Math.floor(review.rating)
    if (rating >= 1 && rating <= 5) {
      ratingCounts[rating - 1]++
    }
  })

  const averageRating =
    reviews.length > 0 ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length : 0

  const handleSortChange = (value: string) => {
    setSortOption(value)

    const sortedReviews = [...reviews]

    switch (value) {
      case "newest":
        sortedReviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        break
      case "oldest":
        sortedReviews.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        break
      case "highest":
        sortedReviews.sort((a, b) => b.rating - a.rating)
        break
      case "lowest":
        sortedReviews.sort((a, b) => a.rating - b.rating)
        break
      case "helpful":
        sortedReviews.sort((a, b) => (b.helpfulVotes || 0) - (a.helpfulVotes || 0))
        break
    }

    setDisplayedReviews(sortedReviews)
  }

  const handleVote = async (reviewId: string, isHelpful: boolean) => {
    try {
      await voteReview(reviewId, isHelpful)

      // Update the local state to reflect the vote
      setDisplayedReviews((prev) =>
        prev.map((review) => {
          if (review.id === reviewId) {
            return {
              ...review,
              helpfulVotes: (review.helpfulVotes || 0) + (isHelpful ? 1 : 0),
              unhelpfulVotes: (review.unhelpfulVotes || 0) + (isHelpful ? 0 : 1),
            }
          }
          return review
        }),
      )

      toast({
        title: "Thank you for your feedback",
        description: `You marked this review as ${isHelpful ? "helpful" : "unhelpful"}.`,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was an error submitting your feedback.",
      })
    }
  }

  const toggleExpandReview = (reviewId: string) => {
    setExpandedReviews((prev) => (prev.includes(reviewId) ? prev.filter((id) => id !== reviewId) : [...prev, reviewId]))
  }

  if (reviews.length === 0) {
    return (
      <div className={`${className} text-center py-12 border rounded-lg`}>
        <h3 className="text-lg font-medium">No reviews yet</h3>
        <p className="text-muted-foreground mt-2">Be the first to review this tour!</p>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-semibold">Guest Reviews ({reviews.length})</h2>
        <div className="mt-2 md:mt-0">
          <Select value={sortOption} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="highest">Highest rated</SelectItem>
              <SelectItem value="lowest">Lowest rated</SelectItem>
              <SelectItem value="helpful">Most helpful</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

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
              const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0

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
        {displayedReviews.map((review) => {
          const isExpanded = expandedReviews.includes(review.id)
          const commentLength = review.comment.length
          const shouldTruncate = commentLength > 300 && !isExpanded

          return (
            <div key={review.id} className="pb-6 border-b last:border-0">
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarImage src={review.avatar} alt={review.name} />
                  <AvatarFallback>{review.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
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

                  {review.title && <h4 className="font-medium mb-1">{review.title}</h4>}

                  <div className="text-sm">
                    {shouldTruncate ? (
                      <>
                        <p>{review.comment.substring(0, 300)}...</p>
                        <button
                          onClick={() => toggleExpandReview(review.id)}
                          className="text-primary hover:underline mt-1"
                        >
                          Read more
                        </button>
                      </>
                    ) : (
                      <>
                        <p>{review.comment}</p>
                        {commentLength > 300 && (
                          <button
                            onClick={() => toggleExpandReview(review.id)}
                            className="text-primary hover:underline mt-1"
                          >
                            Show less
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  <div className="flex items-center mt-4 space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs"
                      onClick={() => handleVote(review.id, true)}
                    >
                      <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                      Helpful {review.helpfulVotes ? `(${review.helpfulVotes})` : ""}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs"
                      onClick={() => handleVote(review.id, false)}
                    >
                      <ThumbsDown className="h-3.5 w-3.5 mr-1" />
                      Not helpful {review.unhelpfulVotes ? `(${review.unhelpfulVotes})` : ""}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

