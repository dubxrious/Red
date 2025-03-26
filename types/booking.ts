export interface Booking {
  id: string
  tourId: string
  date: string | Date
  adults: number
  children: number
  infants?: number
  pickupRequired?: boolean
  pickupLocation?: string
  contactName: string
  contactEmail: string
  contactPhone: string
  specialRequests?: string
  status: "pending" | "confirmed" | "cancelled"
  createdAt: string | Date
}

