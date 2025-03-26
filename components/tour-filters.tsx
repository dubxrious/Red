"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatPrice } from "@/lib/utils"
import type { Tour } from "@/types/tour"
import { getAllTags } from "@/lib/tours"

interface TourFiltersProps {
  filters: {
    category: string
    location: string
    minPrice: number
    maxPrice: number
    minRating: number
    search: string
    tags: string[]
  }
  onFilterChange: (filters: Partial<TourFiltersProps["filters"]>) => void
  categories: string[]
  locations: string[]
  tours: Tour[]
}

export function TourFilters({ filters, onFilterChange, categories, locations, tours }: TourFiltersProps) {
  const tags = getAllTags()

  // Get unique tags from the current tours
  const availableTags = tags.filter((tag) => tours.some((tour) => tour.tags?.includes(tag.slug)))

  const handleReset = () => {
    onFilterChange({
      category: "all",
      location: "all",
      minPrice: 0,
      maxPrice: 1000,
      minRating: 0,
      search: "",
      tags: [],
    })
  }

  const handleTagChange = (tagSlug: string, checked: boolean) => {
    const newTags = checked ? [...filters.tags, tagSlug] : filters.tags.filter((t) => t !== tagSlug)

    onFilterChange({ tags: newTags })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tours..."
            className="pl-8"
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={filters.category} onValueChange={(value) => onFilterChange({ category: value })}>
            <SelectTrigger id="category">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <Select value={filters.location} onValueChange={(value) => onFilterChange({ location: value })}>
            <SelectTrigger id="location">
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <Label htmlFor="price-range">Price Range</Label>
            <span className="text-sm text-muted-foreground">
              {formatPrice(filters.minPrice)} - {formatPrice(filters.maxPrice)}
            </span>
          </div>
          <Slider
            id="price-range"
            min={0}
            max={1000}
            step={10}
            value={[filters.minPrice, filters.maxPrice]}
            onValueChange={([min, max]) => onFilterChange({ minPrice: min, maxPrice: max })}
            className="mt-2"
          />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <Label htmlFor="rating">Minimum Rating</Label>
            <span className="text-sm text-muted-foreground">{filters.minRating} stars and above</span>
          </div>
          <Slider
            id="rating"
            min={0}
            max={5}
            step={0.5}
            value={[filters.minRating]}
            onValueChange={([value]) => onFilterChange({ minRating: value })}
            className="mt-2"
          />
        </div>

        {availableTags.length > 0 && (
          <div>
            <Label className="mb-2 block">Features</Label>
            <div className="space-y-2">
              {availableTags.map((tag) => (
                <div key={tag.slug} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tag-${tag.slug}`}
                    checked={filters.tags.includes(tag.slug)}
                    onCheckedChange={(checked) => handleTagChange(tag.slug, checked === true)}
                  />
                  <label
                    htmlFor={`tag-${tag.slug}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {tag.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Button variant="outline" onClick={handleReset} className="w-full">
        Reset Filters
      </Button>
    </div>
  )
}

