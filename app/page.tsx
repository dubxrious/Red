import { Hero } from "@/components/hero"
import { FeaturedTours, FeaturedToursSkeleton } from "@/components/featured-tours"
import { Suspense } from "react"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8">Featured Experiences</h2>
        <Suspense fallback={<FeaturedToursSkeleton />}>
          <FeaturedTours />
        </Suspense>
        <div className="mt-16 mb-8">
          <h2 className="text-3xl font-bold mb-4">Explore All Tours</h2>
          <p className="text-muted-foreground mb-8">
            Discover the beauty of the Red Sea with our curated selection of marine tours and experiences
          </p>
          <div className="text-center py-12">
            <a
              href="/tours"
              className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-primary rounded-md shadow-sm hover:bg-primary/90"
            >
              View All Tours
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}

