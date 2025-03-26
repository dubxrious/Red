import Link from "next/link"
import Image from "next/image"
import { Tag } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Breadcrumb } from "@/components/breadcrumb"
import { getAllCategories } from "@/lib/tours"

export const metadata = {
  title: "Categories | Red Sea Quest",
  description: "Explore our tour categories and find your perfect adventure",
}

export default function CategoriesPage() {
  const categories = getAllCategories()

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Categories", href: "/categories", active: true },
          ]}
        />

        <div className="flex items-center gap-2 mt-6 mb-2">
          <Tag className="h-6 w-6 text-primary" />
          <h1 className="text-4xl font-bold">Categories</h1>
        </div>

        <p className="text-muted-foreground mb-8 max-w-3xl">
          Browse our tour categories to find the perfect experience for your interests and preferences.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card key={category.id} className="overflow-hidden">
              <div className="relative aspect-video">
                <Image
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <CardHeader>
                <CardTitle>{category.name}</CardTitle>
                <CardDescription>{category.tourCount} tours available</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">{category.description}</p>
              </CardContent>
              <CardFooter>
                <Link
                  href={`/categories/${category.slug}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Explore {category.name} tours
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )
}

