import Link from "next/link"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { CalendarCheck, CheckCircle2, MapPin, Users, Car } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getBookingById } from "@/lib/bookings"
import { getTourById } from "@/lib/tours"
import { formatPrice } from "@/lib/utils"

export default function BookingConfirmationPage({ params }: { params: { id: string } }) {
  const booking = getBookingById(params.id)

  if (!booking) {
    notFound()
  }

  const tour = getTourById(booking.tourId)

  if (!tour) {
    notFound()
  }

  const totalGuests = (booking.adults || 0) + (booking.children || 0) + (booking.infants || 0)
  const basePrice = tour.discounted_price || tour.retail_price
  const childPrice = basePrice * 0.7 // 30% discount for children
  const infantPrice = 0 // Infants are free
  const pickupPrice = booking.pickupRequired ? 15 : 0 // $15 for pickup service

  const totalPrice = booking.adults * basePrice + (booking.children || 0) * childPrice + pickupPrice

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold">Booking Confirmed!</h1>
            <p className="text-muted-foreground mt-2">
              Your booking reference is <span className="font-medium text-foreground">{booking.id}</span>
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
              <CardDescription>A confirmation email has been sent to {booking.contactEmail}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{tour.title}</h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    {tour.location}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CalendarCheck className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="font-medium">Tour Date</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(booking.date), "EEEE, MMMM d, yyyy")}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="font-medium">Guests</div>
                      <div className="text-sm text-muted-foreground">
                        {booking.adults} {booking.adults === 1 ? "adult" : "adults"}
                        {booking.children > 0 &&
                          `, ${booking.children} ${booking.children === 1 ? "child" : "children"}`}
                        {booking.infants > 0 && `, ${booking.infants} ${booking.infants === 1 ? "infant" : "infants"}`}
                      </div>
                    </div>
                  </div>

                  {booking.pickupRequired && booking.pickupLocation && (
                    <div className="flex items-start gap-2">
                      <Car className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="font-medium">Pickup</div>
                        <div className="text-sm text-muted-foreground">{booking.pickupLocation}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Name</div>
                    <div>{booking.contactName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Phone</div>
                    <div>{booking.contactPhone}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Email</div>
                    <div>{booking.contactEmail}</div>
                  </div>
                </div>
              </div>

              {booking.specialRequests && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Special Requests</h3>
                  <p className="text-sm">{booking.specialRequests}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Payment Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      Adults ({booking.adults} × {formatPrice(basePrice)})
                    </span>
                    <span>{formatPrice(booking.adults * basePrice)}</span>
                  </div>

                  {booking.children > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>
                        Children ({booking.children} × {formatPrice(childPrice)})
                      </span>
                      <span>{formatPrice(booking.children * childPrice)}</span>
                    </div>
                  )}

                  {booking.infants > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>
                        Infants ({booking.infants} × {formatPrice(infantPrice)})
                      </span>
                      <span>{formatPrice(infantPrice)}</span>
                    </div>
                  )}

                  {booking.pickupRequired && (
                    <div className="flex justify-between text-sm">
                      <span>Hotel pickup</span>
                      <span>{formatPrice(pickupPrice)}</span>
                    </div>
                  )}

                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>Total</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 items-center border-t pt-6">
              <p className="text-sm text-muted-foreground text-center mb-2">
                Payment will be collected on the day of your tour. Please arrive 15 minutes before the scheduled time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild>
                  <Link href="/bookings/manage">Manage Booking</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/tours">Browse More Tours</Link>
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  )
}

