import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Breadcrumb } from "@/components/breadcrumb"
import { BookingForm } from "@/components/booking/booking-form"
import { getTourBySlug } from "@/lib/tours"

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const tour = getTourBySlug(params.slug)

  if (!tour) {
    return {
      title: "Tour Not Found | Red Sea Quest",
      description: "The requested tour could not be found",
    }
  }

  return {
    title: `Book ${tour.title} | Red Sea Quest`,
    description: `Book your ${tour.title} experience with Red Sea Quest.`,
  }
}

export default function BookTourPage({ params }: { params: { slug: string } }) {
  const tour = getTourBySlug(params.slug)

  if (!tour) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Tours", href: "/tours" },
            { label: tour.title, href: `/tours/${tour.slug}` },
            { label: "Book", href: `/tours/${tour.slug}/book`, active: true },
          ]}
        />

        <div className="mt-6 mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href={`/tours/${tour.slug}`}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to tour details
            </Link>
          </Button>

          <h1 className="text-3xl font-bold">Book {tour.title}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <BookingForm tour={tour} />
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>

              <div className="space-y-4">
                <div className="pb-4 border-b">
                  <h3 className="font-medium">{tour.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{tour.location}</p>
                </div>

                <div className="flex justify-between pb-4 border-b">
                  <span className="text-sm">Price per adult</span>
                  <span className="font-medium">{formatPrice(tour.discounted_price || tour.retail_price)}</span>
                </div>

                <div className="space-y-2 pb-4 border-b">
                  <h3 className="font-medium">What's included:</h3>
                  <ul className="text-sm space-y-1">
                    <li>• Professional guide</li>
                    <li>• All necessary equipment</li>
                    <li>• Safety briefing</li>
                    <li>• Water and snacks</li>
                    <li>• Photos of your experience</li>
                  </ul>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>
                    No payment is required to reserve your spot. You'll receive a confirmation email with payment
                    instructions after booking.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price)
}

