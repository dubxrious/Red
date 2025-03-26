import { supabase } from "@/lib/supabase/client"
import type { Booking } from "@/types/booking"

// Client-side functions only
export async function createBooking(
  bookingData: Omit<Booking, "id" | "created_at" | "updated_at" | "payment_status" | "payment_id">,
): Promise<{ success: boolean; booking?: Booking; error?: string }> {
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      ...bookingData,
      status: "pending",
      payment_status: "unpaid",
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating booking:", error)
    return { success: false, error: error.message }
  }

  return { success: true, booking: data as Booking }
}

export async function getBookingById(id: string): Promise<Booking | null> {
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      *,
      tours(*)
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching booking:", error)
    return null
  }

  return data as unknown as Booking
}

export async function getUserBookings(): Promise<Booking[]> {
  const { data: session } = await supabase.auth.getSession()

  if (!session.session?.user) {
    return []
  }

  const { data, error } = await supabase
    .from("bookings")
    .select(`
      *,
      tours(title, image_0_src)
    `)
    .eq("user_id", session.session.user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching user bookings:", error)
    return []
  }

  return data as unknown as Booking[]
}

