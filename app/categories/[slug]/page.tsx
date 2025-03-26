import { notFound } from "next/navigation"
import { Tag } from "lucide-react"
import { Breadcrumb } from "@/components/breadcrumb"
import { Tours } from "@/components/tours"
import { getCategoryBySlug, getToursByCategory } from "@/lib/tours"

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const category = getCategoryBySlug(params.slug)

  if (!category) {
    return {
      title: "Category Not Found | Red Sea Quest",
      description: "The requested category could not be found",
    }
  }

  return {
    title: `${category.name} Tours | Red Sea Quest`,
    description: category.description,
  }
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const category = getCategoryBySlug(params.slug)

  if (!category) {
    notFound()
  }

  const tours = getToursByCategory(params.slug)

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Categories", href: "/categories" },
            { label: category.name, href: `/categories/${category.slug}`, active: true },
          ]}
        />

        <div className="flex items-center gap-2 mt-6 mb-2">
          <Tag className="h-6 w-6 text-primary" />
          <h1 className="text-4xl font-bold">{category.name}</h1>
        </div>

        <p className="text-muted-foreground mb-8 max-w-3xl">{category.description}</p>

        <h2 className="text-2xl font-bold mb-6">{category.name} Tours</h2>

        {tours.length > 0 ? (
          <Tours initialTours={tours} showFilters={true} />
        ) : (
          <div className="text-center py-12 border rounded-lg">
            <h3 className="text-lg font-medium">No tours available</h3>
            <p className="text-muted-foreground mt-2">
              There are currently no tours available in the {category.name} category.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}

