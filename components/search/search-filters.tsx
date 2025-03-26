"use client"

import { useState } from "react"
import { Filter, Star, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { formatPrice } from "@/lib/utils"

interface SearchFiltersProps {
  onFiltersChange: (filters: any) => void
  className?: string
}

export function SearchFilters({ onFiltersChange, className = "" }: SearchFiltersProps) {
  // Filter state
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [minRating, setMinRating] = useState(0)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [onlyDiscounted, setOnlyDiscounted] = useState(false)

  // Active filter count
  const activeFilterCount =
    (priceRange[0] > 0 ? 1 : 0) +
    (priceRange[1] < 1000 ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    selectedCategories.length +
    selectedLocations.length +
    selectedTags.length +
    (onlyDiscounted ? 1 : 0)

  // Apply filters
  const applyFilters = () => {
    onFiltersChange({
      priceRange,
      minRating,
      categories: selectedCategories,
      locations: selectedLocations,
      tags: selectedTags,
      onlyDiscounted,
    })
  }

  // Reset all filters
  const handleReset = () => {
    setPriceRange([0, 1000])
    setMinRating(0)
    setSelectedCategories([])
    setSelectedLocations([])
    setSelectedTags([])
    setOnlyDiscounted(false)

    onFiltersChange({
      priceRange: [0, 1000],
      minRating: 0,
      categories: [],
      locations: [],
      tags: [],
      onlyDiscounted: false,
    })
  }

  // Handle category toggle
  const handleCategoryToggle = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, category])
    } else {
      setSelectedCategories(selectedCategories.filter((c) => c !== category))
    }
  }

  // Handle location toggle
  const handleLocationToggle = (location: string, checked: boolean) => {
    if (checked) {
      setSelectedLocations([...selectedLocations, location])
    } else {
      setSelectedLocations(selectedLocations.filter((l) => l !== location))
    }
  }

  // Handle tag toggle
  const handleTagToggle = (tag: string, checked: boolean) => {
    if (checked) {
      setSelectedTags([...selectedTags, tag])
    } else {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    }
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Filters</h3>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Filter className="h-4 w-4 mr-2" />
              {activeFilterCount > 0 ? `Filters (${activeFilterCount})` : "Filters"}
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-md overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Search Filters</SheetTitle>
              <SheetDescription>Refine your search results</SheetDescription>
            </SheetHeader>

            <div className="py-4 space-y-6">
              <Accordion type="multiple" defaultValue={["price", "rating"]}>
                <AccordionItem value="price">
                  <AccordionTrigger className="text-sm font-medium">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Price Range
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      <div className="flex justify-between">
                        <span className="text-sm">
                          {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                        </span>
                      </div>
                      <Slider min={0} max={1000} step={10} value={priceRange} onValueChange={setPriceRange} />
                      <div className="flex items-center gap-2 pt-2">
                        <Checkbox
                          id="only-discounted"
                          checked={onlyDiscounted}
                          onCheckedChange={(checked) => setOnlyDiscounted(checked === true)}
                        />
                        <Label htmlFor="only-discounted" className="text-sm">
                          Show only discounted tours
                        </Label>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="rating">
                  <AccordionTrigger className="text-sm font-medium">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-2" />
                      Rating
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pt-2">
                      {[0, 3, 4, 4.5].map((rating) => (
                        <div key={rating} className="flex items-center space-x-2">
                          <Checkbox
                            id={`rating-${rating}`}
                            checked={minRating === rating}
                            onCheckedChange={(checked) => {
                              if (checked) setMinRating(rating)
                              else if (minRating === rating) setMinRating(0)
                            }}
                          />
                          <Label htmlFor={`rating-${rating}`} className="flex items-center">
                            {rating === 0 ? (
                              "Any rating"
                            ) : (
                              <>
                                {rating}+ <Star className="h-3 w-3 ml-1 fill-yellow-500 text-yellow-500" />
                              </>
                            )}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <SheetFooter>
              <SheetClose asChild>
                <Button variant="outline">Cancel</Button>
              </SheetClose>
              <SheetClose asChild>
                <Button onClick={handleReset}>Reset All</Button>
              </SheetClose>
              <SheetClose asChild>
                <Button onClick={applyFilters}>Apply Filters</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}

