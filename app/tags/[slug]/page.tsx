import { notFound } from "next/navigation"
import { Hash } from "lucide-react"
import { Breadcrumb } from "@/components/breadcrumb"
import { Tours } from "@/components/tours"
import { getTagBySlug, getToursByTag } from "@/lib/tours"

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const tag = getTagBySlug(params.slug)

  if (!tag) {
    return {
      title: "Tag Not Found | Red Sea Quest",
      description: "The requested tag could not be found",
    }
  }

  return {
    title: `${tag.name} Tours | Red Sea Quest`,
    description: tag.description || `Explore tours tagged with ${tag.name}`,
  }
}

export default function TagPage({ params }: { params: { slug: string } }) {
  const tag = getTagBySlug(params.slug)

  if (!tag) {
    notFound()
  }

  const tours = getToursByTag(params.slug)

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Tags", href: "/tags" },
            { label: tag.name, href: `/tags/${tag.slug}`, active: true },
          ]}
        />

        <div className="flex items-center gap-2 mt-6 mb-2">
          <Hash className="h-6 w-6 text-primary" />
          <h1 className="text-4xl font-bold">{tag.name}</h1>
        </div>

        {tag.description && <p className="text-muted-foreground mb-8 max-w-3xl">{tag.description}</p>}

        <h2 className="text-2xl font-bold mb-6">Tours Tagged with {tag.name}</h2>

        {tours.length > 0 ? (
          <Tours initialTours={tours} showFilters={true} />
        ) : (
          <div className="text-center py-12 border rounded-lg">
            <h3 className="text-lg font-medium">No tours available</h3>
            <p className="text-muted-foreground mt-2">There are currently no tours tagged with {tag.name}.</p>
          </div>
        )}
      </div>
    </main>
  )
}

