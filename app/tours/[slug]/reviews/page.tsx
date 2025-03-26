import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Breadcrumb } from "@/components/breadcrumb"
import { ReviewForm } from "@/components/reviews/review-form"
import { ReviewList } from "@/components/reviews/review-list"
import { getTourBySlug } from "@/lib/tours"
import { getReviewsByTourId } from "@/lib/reviews"

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const tour = getTourBySlug(params.slug)

  if (!tour) {
    return {
      title: "Tour Not Found | Red Sea Quest",
      description: "The requested tour could not be found",
    }
  }

  return {
    title: `Reviews for ${tour.title} | Red Sea Quest`,
    description: `Read and submit reviews for ${tour.title} with Red Sea Quest.`,
  }
}

export default function TourReviewsPage({ params }: { params: { slug: string } }) {
  const tour = getTourBySlug(params.slug)

  if (!tour) {
    notFound()
  }

  const reviews = getReviewsByTourId(tour.id)

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Tours", href: "/tours" },
            { label: tour.title, href: `/tours/${tour.slug}` },
            { label: "Reviews", href: `/tours/${tour.slug}/reviews`, active: true },
          ]}
        />

        <div className="mt-6 mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href={`/tours/${tour.slug}`}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to tour details
            </Link>
          </Button>

          <h1 className="text-3xl font-bold">Reviews for {tour.title}</h1>
        </div>

        <Tabs defaultValue="read" className="mb-12">
          <TabsList className="mb-8">
            <TabsTrigger value="read">Read Reviews</TabsTrigger>
            <TabsTrigger value="write">Write a Review</TabsTrigger>
          </TabsList>
          <TabsContent value="read">
            <ReviewList reviews={reviews} />
          </TabsContent>
          <TabsContent value="write">
            <div className="max-w-2xl mx-auto">
              <ReviewForm tourId={tour.id} tourTitle={tour.title} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

