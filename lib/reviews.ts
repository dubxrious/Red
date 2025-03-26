import { v4 as uuidv4 } from "uuid"
import type { Review } from "@/types/review"

// Mock data for reviews
const mockReviews: Review[] = [
  {
    id: "1",
    tourId: "1",
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    title: "Amazing experience!",
    date: "2023-08-15",
    comment:
      "Amazing experience! The coral reefs were breathtaking and our guide was very knowledgeable. Would definitely recommend to anyone visiting the area.",
    status: "approved",
    helpfulVotes: 12,
    unhelpfulVotes: 1,
  },
  {
    id: "2",
    tourId: "1",
    name: "Michael Chen",
    email: "michael.chen@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 4,
    title: "Great tour overall",
    date: "2023-07-22",
    comment:
      "Great tour overall. The snorkeling equipment was high quality and the spots we visited had incredible marine life. Only wish we had a bit more time in the water.",
    status: "approved",
    helpfulVotes: 8,
    unhelpfulVotes: 0,
  },
  {
    id: "3",
    tourId: "1",
    name: "Emma Wilson",
    email: "emma.wilson@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    title: "Perfect day out on the water!",
    date: "2023-09-03",
    comment:
      "Perfect day out on the water! Our guide spotted a sea turtle and helped us safely observe it. An unforgettable experience for our family.",
    status: "approved",
    helpfulVotes: 15,
    unhelpfulVotes: 2,
  },
  {
    id: "4",
    tourId: "1",
    name: "David Rodriguez",
    email: "david.rodriguez@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    title: "Highlight of our vacation!",
    date: "2023-08-30",
    comment:
      "This was the highlight of our vacation! The snorkeling spots were pristine with crystal clear water. Our guide was patient with beginners in our group and made sure everyone had a great time.",
    status: "approved",
    helpfulVotes: 10,
    unhelpfulVotes: 0,
  },
  {
    id: "5",
    tourId: "1",
    name: "Olivia Thompson",
    email: "olivia.thompson@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 4,
    title: "Very enjoyable experience",
    date: "2023-07-10",
    comment:
      "Very enjoyable experience. The boat was comfortable and the crew was friendly. Saw lots of colorful fish and even a small reef shark!",
    status: "approved",
    helpfulVotes: 6,
    unhelpfulVotes: 1,
  },
  {
    id: "6",
    tourId: "1",
    name: "James Wilson",
    email: "james.wilson@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    title: "Absolutely fantastic!",
    date: "2023-09-15",
    comment:
      "Absolutely fantastic! The guides were professional and safety-conscious while making sure we had fun. The underwater world here is simply amazing.",
    status: "pending",
    helpfulVotes: 0,
    unhelpfulVotes: 0,
  },
  {
    id: "7",
    tourId: "1",
    name: "Sophia Martinez",
    email: "sophia.martinez@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 3,
    title: "Good experience but a bit crowded",
    date: "2023-08-05",
    comment:
      "Good experience but a bit crowded. The reef was beautiful but there were several other tour groups at the same spot which made it feel less special.",
    status: "approved",
    helpfulVotes: 4,
    unhelpfulVotes: 2,
  },
  {
    id: "8",
    tourId: "2",
    name: "Daniel Lee",
    email: "daniel.lee@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    title: "Perfect introduction to scuba diving!",
    date: "2023-09-10",
    comment:
      "Perfect introduction to scuba diving! I was nervous at first, but the instructor was patient and made me feel comfortable. Can't wait to get certified now!",
    status: "approved",
    helpfulVotes: 9,
    unhelpfulVotes: 0,
  },
  {
    id: "9",
    tourId: "2",
    name: "Emily Clark",
    email: "emily.clark@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    title: "Amazing first diving experience!",
    date: "2023-08-22",
    comment:
      "Amazing first diving experience! The instructor was excellent and made sure we were comfortable before going deeper. Saw incredible marine life!",
    status: "approved",
    helpfulVotes: 7,
    unhelpfulVotes: 1,
  },
  {
    id: "10",
    tourId: "3",
    name: "Robert Johnson",
    email: "robert.johnson@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 4,
    title: "Luxurious day on the water!",
    date: "2023-07-30",
    comment:
      "Luxurious day on the water! The yacht was beautiful and well-maintained. Food was delicious and the crew was attentive. Would have given 5 stars if the snorkeling spots were less crowded.",
    status: "rejected",
    helpfulVotes: 3,
    unhelpfulVotes: 5,
  },
]

export function getAllReviews(): Review[] {
  return mockReviews
}

export function getReviewById(id: string): Review | undefined {
  return mockReviews.find((review) => review.id === id)
}

export function getReviewsByTourId(tourId: string): Review[] {
  return mockReviews
    .filter((review) => review.tourId === tourId && review.status === "approved")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getRecentReviews(limit: number): Review[] {
  return [...mockReviews].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, limit)
}

export function getPendingReviews(): Review[] {
  return mockReviews.filter((review) => review.status === "pending")
}

export function getReviewStats() {
  const total = mockReviews.length
  const approved = mockReviews.filter((review) => review.status === "approved").length
  const pending = mockReviews.filter((review) => review.status === "pending").length
  const rejected = mockReviews.filter((review) => review.status === "rejected").length

  // Calculate average rating from approved reviews
  const approvedReviews = mockReviews.filter((review) => review.status === "approved")
  const averageRating =
    approvedReviews.length > 0
      ? approvedReviews.reduce((acc, review) => acc + review.rating, 0) / approvedReviews.length
      : 0

  return {
    total,
    approved,
    pending,
    rejected,
    averageRating,
  }
}

export async function submitReview(reviewData: any): Promise<Review> {
  // In a real app, this would be an API call
  const newReview: Review = {
    id: uuidv4(),
    ...reviewData,
    avatar: `/placeholder.svg?height=40&width=40`,
    date: new Date().toISOString(),
    status: "pending",
    helpfulVotes: 0,
    unhelpfulVotes: 0,
  }

  // In a real app, we would add this to the database
  mockReviews.push(newReview)

  return newReview
}

export async function approveReview(id: string): Promise<Review> {
  // In a real app, this would be an API call
  const review = mockReviews.find((r) => r.id === id)

  if (!review) {
    throw new Error("Review not found")
  }

  review.status = "approved"

  return review
}

export async function rejectReview(id: string): Promise<Review> {
  // In a real app, this would be an API call
  const review = mockReviews.find((r) => r.id === id)

  if (!review) {
    throw new Error("Review not found")
  }

  review.status = "rejected"

  return review
}

export async function deleteReview(id: string): Promise<void> {
  // In a real app, this would be an API call
  const index = mockReviews.findIndex((r) => r.id === id)

  if (index === -1) {
    throw new Error("Review not found")
  }

  mockReviews.splice(index, 1)
}

export async function voteReview(id: string, isHelpful: boolean): Promise<Review> {
  // In a real app, this would be an API call
  const review = mockReviews.find((r) => r.id === id)

  if (!review) {
    throw new Error("Review not found")
  }

  if (isHelpful) {
    review.helpfulVotes = (review.helpfulVotes || 0) + 1
  } else {
    review.unhelpfulVotes = (review.unhelpfulVotes || 0) + 1
  }

  return review
}

