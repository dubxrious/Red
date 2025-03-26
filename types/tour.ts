export interface Tour {
  id: string
  title: string
  slug: string
  description: string
  category: string
  location: string
  duration_days?: number
  duration_hours?: number
  duration_minutes?: number
  retail_price: number
  discounted_price?: number
  rating_exact_score: number
  review_count: number
  image_0_src: string
  image_1_src?: string
  image_2_src?: string
  image_3_src?: string
  image_4_src?: string
  url: string
  status?: "active" | "inactive"
  tags?: string[]
  features?: TourFeature[]
  availableDates?: string[]
  pickupAvailable?: boolean
  pickupLocations?: string[]
  maxCapacity?: number
  minBookingNotice?: number // in hours
  infantAge?: number
  childAge?: number
  categories?: TourCategory
  destinations?: TourDestination
  tour_tags?: TourTag[]
  tour_features?: TourFeature[]
  max_capacity?: number
}

export interface TourFeature {
  icon: string
  label: string
  description?: string
}

export interface TourTag {
  id: string
  name: string
  slug: string
  description?: string
}

export interface TourDestination {
  id: string
  name: string
  slug: string
  description: string
  image: string
  tourCount: number
}

export interface TourCategory {
  id: string
  name: string
  slug: string
  description: string
  image: string
  tourCount: number
}

export interface TourFilter {
  category?: string
  location?: string
  minPrice?: number
  maxPrice?: number
  minRating?: number
  search?: string
}

