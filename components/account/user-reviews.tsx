"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Star, Edit, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase/client"

interface UserReviewsProps {
  userId: string
}

export function UserReviews({ userId }: UserReviewsProps) {
  const { toast } = useToast()
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null)

  useEffect(() => {
    async function fetchReviews() {
      setLoading(true)

      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          tours(title, slug)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching reviews:", error)
        setReviews([])
      } else {
        setReviews(data || [])
      }

      setLoading(false)
    }

    fetchReviews()
  }, [userId])

  const handleDeleteReview = async () => {
    if (!reviewToDelete) return

    try {
      const { error } = await supabase.from("reviews").delete().eq("id", reviewToDelete)

      if (error) throw error

      setReviews(reviews.filter((review) => review.id !== reviewToDelete))

      toast({
        title: "Review deleted",
        description: "Your review has been deleted successfully.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was an error deleting your review.",
      })
      console.error("Error deleting review:", error)
    } finally {
      setDeleteDialogOpen(false)
      setReviewToDelete(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col space-y-3">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        ))}
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">You haven't written any reviews yet.</p>
        <Button asChild>
          <a href="/tours">Browse Tours to Review</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex flex-col space-y-1">
              <a href={`/tours/${review.tours.slug}`} className="font-medium hover:underline">
                {review.tours.title}
              </a>
              <div className="flex items-center space-x-1">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= review.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">{format(new Date(review.date), "MMM d, yyyy")}</span>
              </div>
            </div>
            <Badge
              variant={
                review.status === "approved" ? "default" : review.status === "pending" ? "outline" : "destructive"
              }
            >
              {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
            </Badge>
          </CardHeader>
          <CardContent>
            {review.title && <p className="font-medium mb-1">{review.title}</p>}
            <p className="text-sm text-muted-foreground">{review.comment}</p>

            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" size="sm" className="h-8 px-2 text-xs" asChild>
                <a href={`/tours/${review.tours.slug}/reviews`}>
                  <Edit className="h-3.5 w-3.5 mr-1" />
                  Edit
                </a>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 text-xs text-destructive hover:text-destructive"
                onClick={() => {
                  setReviewToDelete(review.id)
                  setDeleteDialogOpen(true)
                }}
              >
                <Trash className="h-3.5 w-3.5 mr-1" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your review.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReview}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

