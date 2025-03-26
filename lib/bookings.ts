import { v4 as uuidv4 } from "uuid"
import type { Booking } from "@/types/booking"

// Mock data for bookings
const mockBookings: Booking[] = [
  {
    id: "B001",
    tourId: "1",
    date: "2023-12-15",
    adults: 2,
    children: 1,
    contactName: "John Smith",
    contactEmail: "john.smith@example.com",
    contactPhone: "+1 234 567 8901",
    specialRequests: "We would like to be picked up from our hotel if possible.",
    status: "confirmed",
    createdAt: "2023-11-20",
  },
  {
    id: "B002",
    tourId: "3",
    date: "2023-12-18",
    adults: 4,
    children: 0,
    contactName: "Emily Johnson",
    contactEmail: "emily.johnson@example.com",
    contactPhone: "+1 234 567 8902",
    status: "confirmed",
    createdAt: "2023-11-22",
  },
  {
    id: "B003",
    tourId: "2",
    date: "2023-12-20",
    adults: 1,
    children: 0,
    contactName: "Michael Brown",
    contactEmail: "michael.brown@example.com",
    contactPhone: "+1 234 567 8903",
    specialRequests: "I have a slight mobility issue. Will this tour be accessible?",
    status: "pending",
    createdAt: "2023-11-25",
  },
  {
    id: "B004",
    tourId: "5",
    date: "2023-12-22",
    adults: 2,
    children: 2,
    contactName: "Sarah Wilson",
    contactEmail: "sarah.wilson@example.com",
    contactPhone: "+1 234 567 8904",
    specialRequests: "Our children are 5 and 7 years old. Are there life jackets available for them?",
    status: "confirmed",
    createdAt: "2023-11-26",
  },
  {
    id: "B005",
    tourId: "4",
    date: "2023-12-25",
    adults: 6,
    children: 0,
    contactName: "David Taylor",
    contactEmail: "david.taylor@example.com",
    contactPhone: "+1 234 567 8905",
    status: "cancelled",
    createdAt: "2023-11-27",
  },
  {
    id: "B006",
    tourId: "7",
    date: "2023-12-28",
    adults: 2,
    children: 0,
    contactName: "Jessica Martinez",
    contactEmail: "jessica.martinez@example.com",
    contactPhone: "+1 234 567 8906",
    status: "confirmed",
    createdAt: "2023-11-30",
  },
  {
    id: "B007",
    tourId: "9",
    date: "2024-01-05",
    adults: 3,
    children: 1,
    contactName: "Robert Anderson",
    contactEmail: "robert.anderson@example.com",
    contactPhone: "+1 234 567 8907",
    specialRequests: "We have a 10-year-old child. Is this tour suitable for children?",
    status: "confirmed",
    createdAt: "2023-12-01",
  },
  {
    id: "B008",
    tourId: "6",
    date: "2024-01-10",
    adults: 2,
    children: 0,
    contactName: "Jennifer Thomas",
    contactEmail: "jennifer.thomas@example.com",
    contactPhone: "+1 234 567 8908",
    status: "pending",
    createdAt: "2023-12-05",
  },
  {
    id: "B009",
    tourId: "8",
    date: "2024-01-15",
    adults: 1,
    children: 0,
    contactName: "Christopher Garcia",
    contactEmail: "christopher.garcia@example.com",
    contactPhone: "+1 234 567 8909",
    status: "confirmed",
    createdAt: "2023-12-10",
  },
  {
    id: "B010",
    tourId: "10",
    date: "2024-01-20",
    adults: 4,
    children: 2,
    contactName: "Amanda Rodriguez",
    contactEmail: "amanda.rodriguez@example.com",
    contactPhone: "+1 234 567 8910",
    specialRequests: "Two of our party are vegetarian. Will there be suitable food options?",
    status: "confirmed",
    createdAt: "2023-12-12",
  },
]

export function getAllBookings(): Booking[] {
  return mockBookings
}

export function getBookingById(id: string): Booking | undefined {
  return mockBookings.find((booking) => booking.id === id)
}

export function getRecentBookings(limit: number): Booking[] {
  return [...mockBookings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
}

export function getBookingsByTourId(tourId: string): Booking[] {
  return mockBookings.filter((booking) => booking.tourId === tourId)
}

export function getBookingsByCustomerEmail(email: string): Booking[] {
  return mockBookings.filter((booking) => booking.contactEmail === email)
}

export function getBookingStats() {
  const total = mockBookings.length
  const confirmed = mockBookings.filter((booking) => booking.status === "confirmed").length
  const pending = mockBookings.filter((booking) => booking.status === "pending").length
  const cancelled = mockBookings.filter((booking) => booking.status === "cancelled").length

  // Get unique customers
  const uniqueCustomers = new Set(mockBookings.map((booking) => booking.contactEmail)).size

  // Mock data for new customers this month
  const newCustomers = Math.floor(uniqueCustomers * 0.3)

  // Mock data for percent change
  const percentChange = 12.5

  return {
    total,
    confirmed,
    pending,
    cancelled,
    uniqueCustomers,
    newCustomers,
    percentChange,
  }
}

export function getBookingChartData() {
  // Mock data for chart
  return [
    { name: "Week 1", bookings: 12, revenue: 1200 },
    { name: "Week 2", bookings: 19, revenue: 1900 },
    { name: "Week 3", bookings: 15, revenue: 1500 },
    { name: "Week 4", bookings: 22, revenue: 2200 },
  ]
}

export async function createBooking(bookingData: any): Promise<Booking> {
  // In a real app, this would be an API call
  const newBooking: Booking = {
    id: `B${uuidv4().substring(0, 8)}`,
    ...bookingData,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  }

  // In a real app, we would add this to the database
  mockBookings.push(newBooking)

  return newBooking
}

export async function cancelBooking(id: string): Promise<Booking> {
  // In a real app, this would be an API call
  const booking = mockBookings.find((b) => b.id === id)

  if (!booking) {
    throw new Error("Booking not found")
  }

  booking.status = "cancelled"

  return booking
}

