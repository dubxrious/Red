"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { CalendarIcon, Minus, Plus, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { cn, formatPrice } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import type { Tour } from "@/types/tour"
import { createBooking } from "@/lib/services/booking-service"
import { supabase } from "@/lib/supabase/client"

const formSchema = z.object({
  tourId: z.string(),
  date: z.date({
    required_error: "Please select a date for your tour.",
  }),
  adults: z.number().min(1, "At least 1 adult is required.").max(20, "Maximum 20 adults allowed."),
  children: z.number().min(0, "Cannot be negative.").max(20, "Maximum 20 children allowed."),
  infants: z.number().min(0, "Cannot be negative.").max(10, "Maximum 10 infants allowed."),
  pickupRequired: z.boolean().default(false),
  pickupLocation: z.string().optional(),
  contactName: z.string().min(2, "Name must be at least 2 characters."),
  contactEmail: z.string().email("Please enter a valid email address."),
  contactPhone: z.string().min(5, "Please enter a valid phone number."),
  specialRequests: z.string().optional(),
})

interface BookingFormProps {
  tour: Tour
  className?: string
}

export function BookingForm({ tour, className }: BookingFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Check if user is logged in
  useState(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getSession()
      setIsLoggedIn(!!data.session)
    }
    checkAuth()
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tourId: tour.id,
      adults: 2,
      children: 0,
      infants: 0,
      pickupRequired: false,
      specialRequests: "",
    },
  })

  const { adults, children, infants, pickupRequired } = form.watch()
  const totalGuests = adults + children + infants

  const basePrice = tour.discounted_price || tour.retail_price
  const childPrice = basePrice * 0.7 // 30% discount for children
  const infantPrice = 0 // Infants are free
  const pickupPrice = pickupRequired ? 15 : 0 // $15 for pickup service

  const totalPrice = adults * basePrice + children * childPrice + pickupPrice

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      // Get current user if logged in
      const { data } = await supabase.auth.getSession()
      const userId = data.session?.user?.id

      const result = await createBooking({
        tour_id: values.tourId,
        user_id: userId || null,
        booking_date: values.date.toISOString(),
        adults: values.adults,
        children: values.children,
        infants: values.infants || 0,
        pickup_required: values.pickupRequired,
        pickup_location: values.pickupLocation,
        contact_name: values.contactName,
        contact_email: values.contactEmail,
        contact_phone: values.contactPhone,
        special_requests: values.specialRequests,
        status: "pending",
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      toast({
        title: "Booking Confirmed!",
        description: `Your booking for ${tour.title} on ${format(values.date, "PPP")} has been confirmed.`,
      })

      // Redirect to booking confirmation page
      router.push(`/bookings/confirmation/${result.booking!.id}`)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Booking Failed",
        description:
          error instanceof Error ? error.message : "There was an error processing your booking. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>Complete Your Booking</CardTitle>
        <CardDescription>Review your booking details and provide your contact information</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Tour Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Select a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>Select a date for your tour.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormLabel>Guests</FormLabel>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="adults"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Adults (13+)</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => field.value > 1 && form.setValue("adults", field.value - 1)}
                            disabled={field.value <= 1}
                          >
                            <Minus className="h-3 w-3" />
                            <span className="sr-only">Decrease</span>
                          </Button>
                          <Input
                            {...field}
                            type="number"
                            className="h-8 w-16 text-center mx-2"
                            onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 1)}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => field.value < 20 && form.setValue("adults", field.value + 1)}
                            disabled={field.value >= 20 || totalGuests >= (tour.max_capacity || 20)}
                          >
                            <Plus className="h-3 w-3" />
                            <span className="sr-only">Increase</span>
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="children"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Children ({tour.child_age || 2}-12)</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => field.value > 0 && form.setValue("children", field.value - 1)}
                            disabled={field.value <= 0}
                          >
                            <Minus className="h-3 w-3" />
                            <span className="sr-only">Decrease</span>
                          </Button>
                          <Input
                            {...field}
                            type="number"
                            className="h-8 w-16 text-center mx-2"
                            onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => field.value < 20 && form.setValue("children", field.value + 1)}
                            disabled={field.value >= 20 || totalGuests >= (tour.max_capacity || 20)}
                          >
                            <Plus className="h-3 w-3" />
                            <span className="sr-only">Increase</span>
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="infants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Infants (Under {tour.infant_age || 2})</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => field.value > 0 && form.setValue("infants", field.value - 1)}
                            disabled={field.value <= 0}
                          >
                            <Minus className="h-3 w-3" />
                            <span className="sr-only">Decrease</span>
                          </Button>
                          <Input
                            {...field}
                            type="number"
                            className="h-8 w-16 text-center mx-2"
                            onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => field.value < 10 && form.setValue("infants", field.value + 1)}
                            disabled={field.value >= 10 || totalGuests >= (tour.max_capacity || 20)}
                          >
                            <Plus className="h-3 w-3" />
                            <span className="sr-only">Increase</span>
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {tour.pickup_available && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="pickupRequired"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked)
                            if (!checked) form.setValue("pickupLocation", undefined)
                          }}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Add hotel pickup service (+{formatPrice(15)})</FormLabel>
                        <FormDescription>
                          We'll pick you up from your hotel and drop you off after the tour
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {pickupRequired && (
                  <FormField
                    control={form.control}
                    name="pickupLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pickup Location</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select pickup location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {["Hurghada Marina", "Sahl Hasheesh", "El Gouna", "Makadi Bay"].map((location) => (
                              <SelectItem key={location} value={location}>
                                {location}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="contactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 234 567 8900" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="specialRequests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Requests</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any special requirements or requests..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Optional: Let us know if you have any special requirements.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>
                  Adults ({adults} × {formatPrice(basePrice)})
                </span>
                <span>{formatPrice(adults * basePrice)}</span>
              </div>

              {children > 0 && (
                <div className="flex justify-between text-sm">
                  <span>
                    Children ({children} × {formatPrice(childPrice)})
                  </span>
                  <span>{formatPrice(children * childPrice)}</span>
                </div>
              )}

              {infants > 0 && (
                <div className="flex justify-between text-sm">
                  <span>
                    Infants ({infants} × {formatPrice(infantPrice)})
                  </span>
                  <span>{formatPrice(infantPrice)}</span>
                </div>
              )}

              {pickupRequired && (
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

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Confirm Booking"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center border-t pt-6">
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="mr-2 h-4 w-4" />
          <span>
            {totalGuests} {totalGuests === 1 ? "guest" : "guests"} total
          </span>
        </div>
      </CardFooter>
    </Card>
  )
}

