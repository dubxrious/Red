import { BookingTable } from "@/components/admin/booking-table"
import { getAllBookings } from "@/lib/bookings"

export const metadata = {
  title: "Manage Bookings | Admin Dashboard | Red Sea Quest",
  description: "Manage bookings in the Red Sea Quest admin dashboard",
}

export default function AdminBookingsPage() {
  const bookings = getAllBookings()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Bookings</h2>
      </div>

      <BookingTable bookings={bookings} />
    </div>
  )
}

