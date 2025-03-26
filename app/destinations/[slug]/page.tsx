import { notFound } from "next/navigation"
import { Compass } from "lucide-react"
import { Breadcrumb } from "@/components/breadcrumb"
import { Tours } from "@/components/tours"
import { getDestinationBySlug, getToursByDestination } from "@/lib/tours"

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const destination = getDestinationBySlug(params.slug)

  if (!destination) {
    return {
      title: "Destination Not Found | Red Sea Quest",
      description: "The requested destination could not be found",
    }
  }

  return {
    title: `${destination.name} Tours | Red Sea Quest`,
    description: destination.description,
  }
}

export default function DestinationPage({ params }: { params: { slug: string } }) {
  const destination = getDestinationBySlug(params.slug)

  if (!destination) {
    notFound()
  }

  const tours = getToursByDestination(params.slug)

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Destinations", href: "/destinations" },
            { label: destination.name, href: `/destinations/${destination.slug}`, active: true },
          ]}
        />

        <div className="flex items-center gap-2 mt-6 mb-2">
          <Compass className="h-6 w-6 text-primary" />
          <h1 className="text-4xl font-bold">{destination.name}</h1>
        </div>

        <p className="text-muted-foreground mb-8 max-w-3xl">{destination.description}</p>

        <h2 className="text-2xl font-bold mb-6">Tours in {destination.name}</h2>

        {tours.length > 0 ? (
          <Tours initialTours={tours} showFilters={true} />
        ) : (
          <div className="text-center py-12 border rounded-lg">
            <h3 className="text-lg font-medium">No tours available</h3>
            <p className="text-muted-foreground mt-2">There are currently no tours available in {destination.name}.</p>
          </div>
        )}
      </div>
    </main>
  )
}

