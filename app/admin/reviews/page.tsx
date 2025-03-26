import { ReviewTable } from "@/components/admin/review-table"
import { getAllReviews } from "@/lib/reviews"

export const metadata = {
  title: "Manage Reviews | Admin Dashboard | Red Sea Quest",
  description: "Manage reviews in the Red Sea Quest admin dashboard",
}

export default function AdminReviewsPage() {
  const reviews = getAllReviews()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Reviews</h2>
      </div>

      <ReviewTable reviews={reviews} />
    </div>
  )
}

