export interface Review {
  id: string
  tourId: string
  name: string
  email: string
  avatar: string
  rating: number
  title?: string
  comment: string
  date: string | Date
  status?: "pending" | "approved" | "rejected"
  helpfulVotes?: number
  unhelpfulVotes?: number
}

