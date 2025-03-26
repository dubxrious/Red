import Image from "next/image"
import Link from "next/link"
import { Star } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TourTags } from "@/components/tour-tags"
import type { Tour } from "@/types/tour"
import { formatDuration, formatPrice } from "@/lib/utils"
import { SearchHighlight } from "@/components/search/search-highlight"

interface TourCardProps {
  tour: Tour
  searchQuery?: string
}

export function TourCard({ tour, searchQuery = "" }: TourCardProps) {
  const price = tour.discounted_price || tour.retail_price
  const hasDiscount = tour.discounted_price && tour.discounted_price < tour.retail_price

  // Extract category and location from the nested objects
  const category = tour.categories as any
  const location = tour.destinations as any

  // Extract tags from the nested tour_tags array
  const tourTags = tour.tour_tags as any[]
  const tagSlugs = tourTags ? tourTags.map((tt) => tt.tags?.slug).filter(Boolean) : []

  return (
    <Card className="overflow-hidden h-full flex flex-col transition-shadow duration-300 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-primary/5">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Link href={`/tours/${tour.slug}`}>
          <Image
            src={tour.image_0_src || "/placeholder.svg?height=300&width=400"}
            alt={tour.title}
            fill
            className="object-cover transition-opacity duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>
        <Badge variant="secondary" className="absolute top-3 left-3 z-10">
          <Link href={`/categories/${category?.slug}`}>{category?.name}</Link>
        </Badge>
        {hasDiscount && (
          <Badge variant="destructive" className="absolute top-3 right-3 z-10">
            {Math.round(((tour.retail_price - tour.discounted_price!) / tour.retail_price) * 100)}% OFF
          </Badge>
        )}
      </div>
      <CardContent className="pt-4 flex-grow">
        <div className="flex items-center text-sm mb-2">
          <div className="flex items-center text-yellow-500 mr-2">
            <Star className="h-4 w-4 fill-current mr-1" />
            <span>{tour.rating_exact_score.toFixed(1)}</span>
          </div>
          <span className="text-muted-foreground">({tour.review_count} reviews)</span>
          <span className="mx-2 text-muted-foreground">•</span>
          <Link href={`/destinations/${location?.slug}`} className="text-muted-foreground hover:text-foreground">
            {location?.name}
          </Link>
        </div>
        <Link href={`/tours/${tour.slug}`} className="hover:underline">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">
            <SearchHighlight text={tour.title} query={searchQuery} />
          </h3>
        </Link>
        <p className="text-muted-foreground text-sm line-clamp-3 mb-2">
          <SearchHighlight text={tour.description} query={searchQuery} />
        </p>
        <div className="text-sm">{formatDuration(tour.duration_days, tour.duration_hours, tour.duration_minutes)}</div>

        {tagSlugs.length > 0 && <TourTags tags={tagSlugs} className="mt-3" />}
      </CardContent>
      <CardFooter className="border-t pt-4 flex items-center justify-between">
        <div>
          {hasDiscount && (
            <span className="text-sm line-through text-muted-foreground mr-2">
              {formatPrice(Number(tour.retail_price))}
            </span>
          )}
          <span className="font-semibold text-lg">{formatPrice(Number(price))}</span>
        </div>
        <Button asChild>
          <Link href={`/tours/${tour.slug}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

