"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { CalendarIcon, Minus, Plus, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn, formatPrice } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import type { Tour } from "@/types/tour"
import { checkTourAvailability } from "@/lib/tours"

interface BookingWidgetProps {
  tour: Tour
  className?: string
}

export function BookingWidget({ tour, className }: BookingWidgetProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [infants, setInfants] = useState(0)
  const [pickupRequired, setPickupRequired] = useState(false)
  const [pickupLocation, setPickupLocation] = useState<string | undefined>(undefined)
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)

  const basePrice = tour.discounted_price || tour.retail_price
  const childPrice = basePrice * 0.7 // 30% discount for children
  const infantPrice = 0 // Infants are free
  const pickupPrice = pickupRequired ? 15 : 0 // $15 for pickup service

  const totalGuests = adults + children + infants
  const totalPrice = adults * basePrice + children * childPrice + pickupPrice

  const handleCheckAvailability = async () => {
    if (!date) {
      toast({
        variant: "destructive",
        title: "Date required",
        description: "Please select a date for your tour.",
      })
      return
    }

    if (totalGuests < 1) {
      toast({
        variant: "destructive",
        title: "Guests required",
        description: "Please add at least one guest.",
      })
      return
    }

    if (pickupRequired && !pickupLocation) {
      toast({
        variant: "destructive",
        title: "Pickup location required",
        description: "Please select a pickup location.",
      })
      return
    }

    setIsCheckingAvailability(true)

    try {
      // Check availability
      const isAvailable = checkTourAvailability(tour.id, format(date, "yyyy-MM-dd"), totalGuests)

      if (isAvailable) {
        // Proceed to booking page with query parameters
        const params = new URLSearchParams({
          date: format(date, "yyyy-MM-dd"),
          adults: adults.toString(),
          children: children.toString(),
          infants: infants.toString(),
          pickup: pickupRequired ? "true" : "false",
          ...(pickupLocation && { pickupLocation }),
        })

        router.push(`/tours/${tour.slug}/book?${params.toString()}`)
      } else {
        toast({
          variant: "destructive",
          title: "Not available",
          description: "Sorry, this tour is not available on the selected date or has reached capacity.",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was an error checking availability. Please try again.",
      })
    } finally {
      setIsCheckingAvailability(false)
    }
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>Book This Tour</CardTitle>
        <CardDescription>Select your preferred date and number of guests</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="date">Tour Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn("w-full justify-start text-left font-normal mt-1.5", !date && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Select a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) =>
                  date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                  !tour.availableDates?.includes(format(date, "yyyy-MM-dd"))
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-3">
          <Label>Guests</Label>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Adults</div>
              <div className="text-xs text-muted-foreground">Age 13+</div>
            </div>
            <div className="flex items-center">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => adults > 1 && setAdults(adults - 1)}
                disabled={adults <= 1}
              >
                <Minus className="h-3 w-3" />
                <span className="sr-only">Decrease</span>
              </Button>
              <span className="w-10 text-center">{adults}</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => setAdults(adults + 1)}
                disabled={totalGuests >= (tour.maxCapacity || 20)}
              >
                <Plus className="h-3 w-3" />
                <span className="sr-only">Increase</span>
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Children</div>
              <div className="text-xs text-muted-foreground">Age {tour.childAge || 2}-12</div>
            </div>
            <div className="flex items-center">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => children > 0 && setChildren(children - 1)}
                disabled={children <= 0}
              >
                <Minus className="h-3 w-3" />
                <span className="sr-only">Decrease</span>
              </Button>
              <span className="w-10 text-center">{children}</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => setChildren(children + 1)}
                disabled={totalGuests >= (tour.maxCapacity || 20)}
              >
                <Plus className="h-3 w-3" />
                <span className="sr-only">Increase</span>
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Infants</div>
              <div className="text-xs text-muted-foreground">Under {tour.infantAge || 2}</div>
            </div>
            <div className="flex items-center">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => infants > 0 && setInfants(infants - 1)}
                disabled={infants <= 0}
              >
                <Minus className="h-3 w-3" />
                <span className="sr-only">Decrease</span>
              </Button>
              <span className="w-10 text-center">{infants}</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => setInfants(infants + 1)}
                disabled={totalGuests >= (tour.maxCapacity || 20)}
              >
                <Plus className="h-3 w-3" />
                <span className="sr-only">Increase</span>
              </Button>
            </div>
          </div>
        </div>

        {tour.pickupAvailable && (
          <div className="space-y-3 pt-2">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="pickup"
                checked={pickupRequired}
                onCheckedChange={(checked) => {
                  setPickupRequired(checked === true)
                  if (!checked) setPickupLocation(undefined)
                }}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="pickup"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Add hotel pickup service (+{formatPrice(15)})
                </Label>
                <p className="text-xs text-muted-foreground">
                  We'll pick you up from your hotel and drop you off after the tour
                </p>
              </div>
            </div>

            {pickupRequired && (
              <div className="pt-2">
                <Label htmlFor="pickup-location">Pickup Location</Label>
                <Select value={pickupLocation} onValueChange={setPickupLocation}>
                  <SelectTrigger id="pickup-location" className="mt-1.5">
                    <SelectValue placeholder="Select pickup location" />
                  </SelectTrigger>
                  <SelectContent>
                    {tour.pickupLocations?.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        <div className="space-y-1.5 pt-3">
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

          <div className="flex justify-between font-medium pt-2 border-t mt-2">
            <span>Total</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button className="w-full" size="lg" onClick={handleCheckAvailability} disabled={isCheckingAvailability}>
          {isCheckingAvailability ? "Checking..." : "Check Availability"}
        </Button>

        {tour.pickupAvailable && pickupRequired && pickupLocation && (
          <div className="flex items-center text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 mr-1" />
            <span>Pickup from: {pickupLocation}</span>
          </div>
        )}

        <p className="text-xs text-center text-muted-foreground">Free cancellation up to 24 hours before the tour</p>
      </CardFooter>
    </Card>
  )
}

