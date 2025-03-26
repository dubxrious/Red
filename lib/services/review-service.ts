import { supabase } from "@/lib/supabase/client"
import type { Review } from "@/types/review"

// Client-side functions only
export async function getReviewsByTourId(tourId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("tour_id", tourId)
    .eq("status", "approved")
    .order("date", { ascending: false })

  if (error) {
    console.error("Error fetching reviews:", error)
    return []
  }

  return data as Review[]
}

export async function submitReview(
  reviewData: Omit<Review, "id" | "created_at" | "helpful_votes" | "unhelpful_votes" | "status">,
): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      ...reviewData,
      status: "pending",
      helpful_votes: 0,
      unhelpful_votes: 0,
    })
    .select()
    .single()

  if (error) {
    console.error("Error submitting review:", error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function voteReview(reviewId: string, isHelpful: boolean): Promise<{ success: boolean; error?: string }> {
  const field = isHelpful ? "helpful_votes" : "unhelpful_votes"

  // First get the current count
  const { data: review, error: fetchError } = await supabase.from("reviews").select(field).eq("id", reviewId).single()

  if (fetchError) {
    console.error("Error fetching review for voting:", fetchError)
    return { success: false, error: fetchError.message }
  }

  // Increment the vote count
  const currentCount = review[field] || 0
  const { error: updateError } = await supabase
    .from("reviews")
    .update({ [field]: currentCount + 1 })
    .eq("id", reviewId)

  if (updateError) {
    console.error("Error updating review votes:", updateError)
    return { success: false, error: updateError.message }
  }

  return { success: true }
}

