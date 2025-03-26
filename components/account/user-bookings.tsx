"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { getUserBookings } from "@/lib/services/booking-service"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import type { Booking } from "@/types/booking"

interface UserBookingsProps {
  userId: string
}

export function UserBookings({ userId }: UserBookingsProps) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBookings() {
      setLoading(true)
      const data = await getUserBookings()
      setBookings(data)
      setLoading(false)
    }

    fetchBookings()
  }, [userId])

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

  if (bookings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">You don't have any bookings yet.</p>
        <Button asChild>
          <Link href="/tours">Browse Tours</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {bookings.map((booking) => {
        const tour = booking.tours as any

        return (
          <div key={booking.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{tour.title}</h3>
                <p className="text-sm text-muted-foreground">{format(new Date(booking.booking_date), "PPP")}</p>
                <p className="text-sm mt-1">
                  {booking.adults} {booking.adults === 1 ? "adult" : "adults"}
                  {booking.children > 0 && `, ${booking.children} ${booking.children === 1 ? "child" : "children"}`}
                </p>
              </div>
              <Badge
                variant={
                  booking.status === "confirmed" ? "default" : booking.status === "pending" ? "outline" : "destructive"
                }
              >
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </Badge>
            </div>

            <div className="flex justify-between items-center mt-4">
              <Badge variant="outline" className="capitalize">
                Payment: {booking.payment_status}
              </Badge>
              <Button size="sm" asChild>
                <Link href={`/bookings/confirmation/${booking.id}`}>View Details</Link>
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

