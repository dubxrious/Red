import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { getFeaturedTours } from "@/lib/services/tour-service"
import { FeaturedTours } from "@/components/featured-tours"
import { FALLBACK_TOURS } from "@/lib/constants"

export default async function Home() {
  // Try to fetch featured tours, but use fallback if it fails
  let featuredTours = [];
  try {
    featuredTours = await getFeaturedTours();
  } catch (error) {
    console.error("Error fetching tours:", error);
    featuredTours = FALLBACK_TOURS;
  }

  return (
    <main className="min-h-screen">
      {/* Hero section */}
      <section className="relative h-[600px] overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-indigo-900">
          {/* We use a background color instead of requiring an image */}
        </div>
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center text-white">
          <h1 className="text-5xl font-bold mb-6 max-w-2xl">Discover the Wonders of the Red Sea</h1>
          <p className="text-xl mb-8 max-w-xl">
            Explore the vibrant coral reefs and marine life of the Red Sea with our curated selection of tours and
            experiences.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg" className="rounded-full">
              <Link href="/tours">Explore Tours</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full text-white border-white hover:bg-white/20">
              <Link href="/destinations">Destinations</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured tours section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Experiences</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our most popular and highly-rated marine tours and experiences in the Red Sea.
            </p>
          </div>
          <FeaturedTours tours={featuredTours} />
        </div>
      </section>

      {/* About section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">About Red Sea Quest</h2>
              <p className="text-muted-foreground mb-6">
                Red Sea Quest is your premier destination for booking unforgettable marine tours and experiences along
                the stunning Red Sea coast. We carefully curate and select the best tours from trusted local operators to
                ensure you have an amazing experience.
              </p>
              <p className="text-muted-foreground mb-6">
                Whether you're looking for diving adventures, snorkeling trips, glass-bottom boat tours, or luxury yacht
                cruises, we have something for everyone. Our team of marine enthusiasts is dedicated to helping you
                discover the incredible biodiversity of the Red Sea.
              </p>
              <Button asChild>
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
            <div className="relative h-[400px] rounded-lg overflow-hidden bg-blue-100">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-blue-400"></div>
              <div className="absolute inset-0 flex items-center justify-center text-blue-800">
                <p className="text-2xl font-bold">Red Sea Diving Adventures</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

