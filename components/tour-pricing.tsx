import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"

interface TourPricingProps {
  retailPrice: number
  discountedPrice?: number
  bookingUrl: string
}

export function TourPricing({ retailPrice, discountedPrice, bookingUrl }: TourPricingProps) {
  const hasDiscount = discountedPrice && discountedPrice < retailPrice
  const displayPrice = discountedPrice || retailPrice
  const discountPercentage = hasDiscount ? Math.round(((retailPrice - discountedPrice!) / retailPrice) * 100) : 0

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-4">
          <div className="flex items-baseline">
            <span className="text-3xl font-bold">{formatPrice(displayPrice)}</span>
            {hasDiscount && (
              <span className="ml-2 text-sm line-through text-muted-foreground">{formatPrice(retailPrice)}</span>
            )}
          </div>
          {hasDiscount && (
            <div className="mt-1 text-sm font-medium text-green-600">Save {discountPercentage}% today</div>
          )}
        </div>

        <div className="space-y-4">
          <div className="text-sm">
            <div className="flex justify-between py-2 border-b">
              <span>Base price</span>
              <span>{formatPrice(retailPrice)}</span>
            </div>
            {hasDiscount && (
              <div className="flex justify-between py-2 border-b text-green-600">
                <span>Discount</span>
                <span>-{formatPrice(retailPrice - discountedPrice!)}</span>
              </div>
            )}
            <div className="flex justify-between py-2 border-b">
              <span>Booking fee</span>
              <span>Included</span>
            </div>
            <div className="flex justify-between py-2 font-medium">
              <span>Total</span>
              <span>{formatPrice(displayPrice)}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button className="w-full" size="lg" asChild>
          <Link href={bookingUrl}>Book Now</Link>
        </Button>
        <p className="text-xs text-center text-muted-foreground">No payment required today. Reserve your spot now.</p>
      </CardFooter>
    </Card>
  )
}

