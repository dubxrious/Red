import Link from "next/link"
import Image from "next/image"
import { Compass } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Breadcrumb } from "@/components/breadcrumb"
import { getAllDestinations } from "@/lib/tours"

export const metadata = {
  title: "Destinations | Red Sea Quest",
  description: "Explore our tour destinations around the Red Sea",
}

export default function DestinationsPage() {
  const destinations = getAllDestinations()

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Destinations", href: "/destinations", active: true },
          ]}
        />

        <div className="flex items-center gap-2 mt-6 mb-2">
          <Compass className="h-6 w-6 text-primary" />
          <h1 className="text-4xl font-bold">Destinations</h1>
        </div>

        <p className="text-muted-foreground mb-8 max-w-3xl">
          Discover the most beautiful destinations around the Red Sea. Each location offers unique experiences and
          natural wonders to explore.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((destination) => (
            <Card key={destination.id} className="overflow-hidden">
              <div className="relative aspect-video">
                <Image
                  src={destination.image || "/placeholder.svg"}
                  alt={destination.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <CardHeader>
                <CardTitle>{destination.name}</CardTitle>
                <CardDescription>{destination.tourCount} tours available</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">{destination.description}</p>
              </CardContent>
              <CardFooter>
                <Link
                  href={`/destinations/${destination.slug}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Explore tours in {destination.name}
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )
}

