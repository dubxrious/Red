"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Breadcrumb } from "@/components/breadcrumb"
import { TourGallery } from "@/components/tour-gallery"
import { TourDetails } from "@/components/tour-details"
import { TourReviews } from "@/components/tour-reviews"
import { TourTags } from "@/components/tour-tags"
import { TourFeatures } from "@/components/tour-features"
import { BookingWidget } from "@/components/booking/booking-widget"
import { SimilarTours } from "@/components/similar-tours"
import { getTourBySlug } from "@/lib/services/tour-service"
import { formatDuration } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

export default function TourPage() {
  const params = useParams()
  const router = useRouter()
  const [tour, setTour] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTour() {
      if (!params.slug) return

      const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug
      const tourData = await getTourBySlug(slug)

      if (!tourData) {
        router.push("/404")
        return
      }

      setTour(tourData)
      setLoading(false)
    }

    loadTour()
  }, [params.slug, router])

  if (loading) {
    return (
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-6 w-64 mb-6" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
            <div className="lg:col-span-2">
              <Skeleton className="h-10 w-3/4 mb-4" />
              <div className="flex items-center gap-4 mb-6">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-20" />
              </div>

              <Skeleton className="h-5 w-48 mb-6" />

              {/* Gallery skeleton */}
              <Skeleton className="aspect-video w-full mb-6" />
              <div className="grid grid-cols-4 gap-2 mb-8">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-video w-full" />
                ))}
              </div>

              <Skeleton className="h-8 w-48 mb-4" />
              <div className="space-y-3 mb-8">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
              </div>

              <Skeleton className="h-8 w-48 mb-4" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>

              <Skeleton className="h-8 w-48 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>

              <Skeleton className="h-8 w-48 mb-4" />
              <div className="space-y-4 mb-8">
                <div className="grid grid-cols-3 gap-8">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full col-span-2" />
                </div>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <Skeleton className="h-[500px] w-full rounded-lg" />
              </div>
            </div>
          </div>

          <Skeleton className="h-8 w-48 mt-16 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[350px] w-full" />
            ))}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Tours", href: "/tours" },
            { label: tour.title, href: `/tours/${tour.slug}`, active: true },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
          <div className="lg:col-span-2">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{tour.title}</h1>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center">
                <span className="text-yellow-500 mr-1">★</span>
                <span className="font-medium">{tour.rating_exact_score.toFixed(1)}</span>
                <span className="text-muted-foreground ml-1">({tour.review_count} reviews)</span>
              </div>
              <div className="text-muted-foreground">{tour.location}</div>
              <div className="text-muted-foreground">
                {formatDuration(tour.duration_days, tour.duration_hours, tour.duration_minutes)}
              </div>
            </div>

            {tour.tags && tour.tags.length > 0 && <TourTags tags={tour.tags} className="mb-6" />}

            <TourGallery
              images={[tour.image_0_src, tour.image_1_src, tour.image_2_src, tour.image_3_src, tour.image_4_src].filter(
                Boolean,
              )}
            />

            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">About This Tour</h2>
              <div className="prose max-w-none">
                <p>{tour.description}</p>
              </div>
            </div>

            {tour.features && tour.features.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-semibold mb-4">Tour Features</h2>
                <TourFeatures features={tour.features} />
              </div>
            )}

            <TourDetails tour={tour} className="mt-8" />

            <TourReviews tourId={tour.id} className="mt-8" />
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <BookingWidget tour={tour} />
            </div>
          </div>
        </div>

        <SimilarTours currentTour={tour} className="mt-16" />
      </div>
    </main>
  )
}

