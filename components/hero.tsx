import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <div className="relative bg-primary text-primary-foreground">
      <div className="absolute inset-0 bg-[url('https://q4d5fee3bhult8ls.public.blob.vercel-storage.com/Red-sea-quest-17O24c7qHZ8IpTZcht9EVQm3jRjz5H.jpg')] bg-cover bg-center"></div>
      <div className="absolute inset-0 bg-black/40"></div> {/* Dark overlay for better text readability */}
      <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Discover the Wonders of the Red Sea</h1>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            Explore breathtaking marine life, pristine coral reefs, and unforgettable adventures with our expert-guided
            tours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/tours">Explore Tours</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/20 hover:bg-primary-foreground/10"
              asChild
            >
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

