"use client"

import { useState } from "react"
import { X, Filter, Save, Clock, Calendar, Users, DollarSign, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatPrice } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import type { Tour } from "@/types/tour"
import { getAllTags, getAllCategories, getAllDestinations } from "@/lib/tours"

export interface AdvancedFilters {
  category: string
  location: string
  minPrice: number
  maxPrice: number
  minRating: number
  tags: string[]
  duration: string
  groupSize: string
  dateRange: string
  amenities: string[]
  accessibility: string[]
  sortBy: string
  onlyDiscounted: boolean
  onlyAvailable: boolean
  search: string
}

interface AdvancedFiltersProps {
  filters: AdvancedFilters
  onFilterChange: (filters: Partial<AdvancedFilters>) => void
  onReset: () => void
  tours: Tour[]
  className?: string
}

export function AdvancedFilters({ filters, onFilterChange, onReset, tours, className }: AdvancedFiltersProps) {
  const { toast } = useToast()
  const [savedFilters, setSavedFilters] = useState<{ name: string; filters: AdvancedFilters }[]>([])
  const [filterName, setFilterName] = useState("")
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  const tags = getAllTags()
  const categories = getAllCategories()
  const destinations = getAllDestinations()

  // Get unique tags from the current tours
  const availableTags = tags.filter((tag) => tours.some((tour) => tour.tags?.includes(tag.slug)))

  // Calculate the number of active filters
  const activeFilterCount = Object.entries(filters).reduce((count, [key, value]) => {
    if (key === "category" && value !== "all") return count + 1
    if (key === "location" && value !== "all") return count + 1
    if (key === "minPrice" && value > 0) return count + 1
    if (key === "maxPrice" && value < 1000) return count + 1
    if (key === "minRating" && value > 0) return count + 1
    if (key === "tags" && (value as string[]).length > 0) return count + 1
    if (key === "duration" && value !== "all") return count + 1
    if (key === "groupSize" && value !== "all") return count + 1
    if (key === "dateRange" && value !== "all") return count + 1
    if (key === "amenities" && (value as string[]).length > 0) return count + 1
    if (key === "accessibility" && (value as string[]).length > 0) return count + 1
    if (key === "onlyDiscounted" && value === true) return count + 1
    if (key === "onlyAvailable" && value === true) return count + 1
    if (key === "search" && value !== "") return count + 1
    return count
  }, 0)

  const handleSaveFilter = () => {
    if (!filterName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a name for your filter",
      })
      return
    }

    const newSavedFilter = {
      name: filterName,
      filters: { ...filters },
    }

    setSavedFilters([...savedFilters, newSavedFilter])
    setFilterName("")
    setShowSaveDialog(false)

    toast({
      title: "Filter saved",
      description: `Your filter "${filterName}" has been saved.`,
    })

    // In a real app, we would save this to the user's profile
  }

  const handleLoadFilter = (savedFilter: { name: string; filters: AdvancedFilters }) => {
    onFilterChange(savedFilter.filters)

    toast({
      title: "Filter loaded",
      description: `Filter "${savedFilter.name}" has been applied.`,
    })
  }

  const handleDeleteFilter = (index: number) => {
    const newSavedFilters = [...savedFilters]
    newSavedFilters.splice(index, 1)
    setSavedFilters(newSavedFilters)

    toast({
      title: "Filter deleted",
      description: "Your saved filter has been deleted.",
    })
  }

  const handleRemoveFilter = (filterKey: keyof AdvancedFilters) => {
    if (filterKey === "category") onFilterChange({ category: "all" })
    else if (filterKey === "location") onFilterChange({ location: "all" })
    else if (filterKey === "minPrice") onFilterChange({ minPrice: 0 })
    else if (filterKey === "maxPrice") onFilterChange({ maxPrice: 1000 })
    else if (filterKey === "minRating") onFilterChange({ minRating: 0 })
    else if (filterKey === "tags") onFilterChange({ tags: [] })
    else if (filterKey === "duration") onFilterChange({ duration: "all" })
    else if (filterKey === "groupSize") onFilterChange({ groupSize: "all" })
    else if (filterKey === "dateRange") onFilterChange({ dateRange: "all" })
    else if (filterKey === "amenities") onFilterChange({ amenities: [] })
    else if (filterKey === "accessibility") onFilterChange({ accessibility: [] })
    else if (filterKey === "onlyDiscounted") onFilterChange({ onlyDiscounted: false })
    else if (filterKey === "onlyAvailable") onFilterChange({ onlyAvailable: false })
    else if (filterKey === "search") onFilterChange({ search: "" })
  }

  const renderActiveFilters = () => {
    if (activeFilterCount === 0) return null

    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {filters.category !== "all" && (
          <Badge
            variant="secondary"
            className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium shadow-sm bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200"
          >
            Category: {filters.category}
            <X className="h-3 w-3 cursor-pointer ml-1" onClick={() => handleRemoveFilter("category")} />
          </Badge>
        )}

        {filters.location !== "all" && (
          <Badge
            variant="secondary"
            className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium shadow-sm bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
          >
            Location: {filters.location}
            <X className="h-3 w-3 cursor-pointer ml-1" onClick={() => handleRemoveFilter("location")} />
          </Badge>
        )}

        {filters.minPrice > 0 && (
          <Badge
            variant="secondary"
            className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium shadow-sm bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200"
          >
            Min Price: {formatPrice(filters.minPrice)}
            <X className="h-3 w-3 cursor-pointer ml-1" onClick={() => handleRemoveFilter("minPrice")} />
          </Badge>
        )}

        {filters.maxPrice < 1000 && (
          <Badge
            variant="secondary"
            className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium shadow-sm bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200"
          >
            Max Price: {formatPrice(filters.maxPrice)}
            <X className="h-3 w-3 cursor-pointer ml-1" onClick={() => handleRemoveFilter("maxPrice")} />
          </Badge>
        )}

        {filters.minRating > 0 && (
          <Badge
            variant="secondary"
            className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium shadow-sm bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200"
          >
            Min Rating: {filters.minRating}★
            <X className="h-3 w-3 cursor-pointer ml-1" onClick={() => handleRemoveFilter("minRating")} />
          </Badge>
        )}

        {filters.tags.length > 0 &&
          filters.tags.map((tag) => {
            const tagObj = tags.find((t) => t.slug === tag)
            if (!tagObj) return null

            return (
              <Badge
                key={tag}
                variant="secondary"
                className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium shadow-sm bg-teal-100 text-teal-800 border-teal-200 hover:bg-teal-200"
              >
                {tagObj.name}
                <X
                  className="h-3 w-3 cursor-pointer ml-1"
                  onClick={() => {
                    const newTags = filters.tags.filter((t) => t !== tag)
                    onFilterChange({ tags: newTags })
                  }}
                />
              </Badge>
            )
          })}

        {filters.duration !== "all" && (
          <Badge
            variant="secondary"
            className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium shadow-sm bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-200"
          >
            Duration: {filters.duration}
            <X className="h-3 w-3 cursor-pointer ml-1" onClick={() => handleRemoveFilter("duration")} />
          </Badge>
        )}

        {filters.groupSize !== "all" && (
          <Badge
            variant="secondary"
            className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium shadow-sm bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200"
          >
            Group Size: {filters.groupSize}
            <X className="h-3 w-3 cursor-pointer ml-1" onClick={() => handleRemoveFilter("groupSize")} />
          </Badge>
        )}

        {filters.dateRange !== "all" && (
          <Badge
            variant="secondary"
            className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium shadow-sm bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200"
          >
            Date: {filters.dateRange}
            <X className="h-3 w-3 cursor-pointer ml-1" onClick={() => handleRemoveFilter("dateRange")} />
          </Badge>
        )}

        {filters.onlyDiscounted && (
          <Badge
            variant="secondary"
            className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium shadow-sm bg-red-100 text-red-800 border-red-200 hover:bg-red-200"
          >
            Discounted Only
            <X className="h-3 w-3 cursor-pointer ml-1" onClick={() => handleRemoveFilter("onlyDiscounted")} />
          </Badge>
        )}

        {filters.onlyAvailable && (
          <Badge
            variant="secondary"
            className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium shadow-sm bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
          >
            Available Only
            <X className="h-3 w-3 cursor-pointer ml-1" onClick={() => handleRemoveFilter("onlyAvailable")} />
          </Badge>
        )}

        {filters.search && (
          <Badge
            variant="secondary"
            className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium shadow-sm bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200"
          >
            Search: {filters.search}
            <X className="h-3 w-3 cursor-pointer ml-1" onClick={() => handleRemoveFilter("search")} />
          </Badge>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-3 py-1 rounded-full text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-700"
          onClick={onReset}
        >
          Clear All
        </Button>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Filters</h3>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Save className="h-4 w-4 mr-2" />
                Saved
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Saved Filters</h4>

                {savedFilters.length === 0 ? (
                  <p className="text-sm text-muted-foreground">You don't have any saved filters yet.</p>
                ) : (
                  <div className="space-y-2">
                    {savedFilters.map((savedFilter, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-left justify-start w-full"
                          onClick={() => handleLoadFilter(savedFilter)}
                        >
                          {savedFilter.name}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleDeleteFilter(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Save Current Filter</h4>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Filter name"
                      value={filterName}
                      onChange={(e) => setFilterName(e.target.value)}
                      className="h-8"
                    />
                    <Button size="sm" className="h-8" onClick={handleSaveFilter}>
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Filter className="h-4 w-4 mr-2" />
                {activeFilterCount > 0 ? `Filters (${activeFilterCount})` : "Filters"}
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-md overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Advanced Filters</SheetTitle>
                <SheetDescription>Refine your search with advanced filtering options</SheetDescription>
              </SheetHeader>

              <div className="py-4 space-y-6">
                <Accordion type="multiple" defaultValue={["price", "rating", "features"]}>
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
                            {formatPrice(filters.minPrice)} - {formatPrice(filters.maxPrice)}
                          </span>
                        </div>
                        <Slider
                          min={0}
                          max={1000}
                          step={10}
                          value={[filters.minPrice, filters.maxPrice]}
                          onValueChange={([min, max]) => onFilterChange({ minPrice: min, maxPrice: max })}
                        />
                        <div className="flex items-center gap-2 pt-2">
                          <Checkbox
                            id="only-discounted"
                            checked={filters.onlyDiscounted}
                            onCheckedChange={(checked) => onFilterChange({ onlyDiscounted: checked === true })}
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
                      <div className="space-y-4 pt-2">
                        <RadioGroup
                          value={filters.minRating.toString()}
                          onValueChange={(value) => onFilterChange({ minRating: Number.parseFloat(value) })}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="0" id="r-any" />
                            <Label htmlFor="r-any">Any rating</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="3" id="r-3" />
                            <Label htmlFor="r-3" className="flex items-center">
                              3+ <Star className="h-3 w-3 ml-1 fill-yellow-500 text-yellow-500" />
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="4" id="r-4" />
                            <Label htmlFor="r-4" className="flex items-center">
                              4+ <Star className="h-3 w-3 ml-1 fill-yellow-500 text-yellow-500" />
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="4.5" id="r-4.5" />
                            <Label htmlFor="r-4.5" className="flex items-center">
                              4.5+ <Star className="h-3 w-3 ml-1 fill-yellow-500 text-yellow-500" />
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="duration">
                    <AccordionTrigger className="text-sm font-medium">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        Duration
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pt-2">
                        <RadioGroup
                          value={filters.duration}
                          onValueChange={(value) => onFilterChange({ duration: value })}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="all" id="d-all" />
                            <Label htmlFor="d-all">Any duration</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="short" id="d-short" />
                            <Label htmlFor="d-short">Short (under 3 hours)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="medium" id="d-medium" />
                            <Label htmlFor="d-medium">Medium (3-6 hours)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="long" id="d-long" />
                            <Label htmlFor="d-long">Long (6+ hours)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="full-day" id="d-full" />
                            <Label htmlFor="d-full">Full day</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="multi-day" id="d-multi" />
                            <Label htmlFor="d-multi">Multi-day</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="group">
                    <AccordionTrigger className="text-sm font-medium">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        Group Size
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pt-2">
                        <RadioGroup
                          value={filters.groupSize}
                          onValueChange={(value) => onFilterChange({ groupSize: value })}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="all" id="g-all" />
                            <Label htmlFor="g-all">Any size</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="small" id="g-small" />
                            <Label htmlFor="g-small">Small (1-8 people)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="medium" id="g-medium" />
                            <Label htmlFor="g-medium">Medium (9-15 people)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="large" id="g-large" />
                            <Label htmlFor="g-large">Large (16+ people)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="private" id="g-private" />
                            <Label htmlFor="g-private">Private tours only</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="date">
                    <AccordionTrigger className="text-sm font-medium">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Date Range
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pt-2">
                        <RadioGroup
                          value={filters.dateRange}
                          onValueChange={(value) => onFilterChange({ dateRange: value })}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="all" id="date-all" />
                            <Label htmlFor="date-all">Any date</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="today" id="date-today" />
                            <Label htmlFor="date-today">Today</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="tomorrow" id="date-tomorrow" />
                            <Label htmlFor="date-tomorrow">Tomorrow</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="this-week" id="date-this-week" />
                            <Label htmlFor="date-this-week">This week</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="this-weekend" id="date-this-weekend" />
                            <Label htmlFor="date-this-weekend">This weekend</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="next-week" id="date-next-week" />
                            <Label htmlFor="date-next-week">Next week</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="this-month" id="date-this-month" />
                            <Label htmlFor="date-this-month">This month</Label>
                          </div>
                        </RadioGroup>

                        <div className="flex items-center gap-2 pt-2">
                          <Checkbox
                            id="only-available"
                            checked={filters.onlyAvailable}
                            onCheckedChange={(checked) => onFilterChange({ onlyAvailable: checked === true })}
                          />
                          <Label htmlFor="only-available" className="text-sm">
                            Show only available tours
                          </Label>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="features">
                    <AccordionTrigger className="text-sm font-medium">Features & Tags</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                          <Label className="text-sm">Tour Features</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {availableTags.map((tag) => (
                              <div key={tag.slug} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`tag-${tag.slug}`}
                                  checked={filters.tags.includes(tag.slug)}
                                  onCheckedChange={(checked) => {
                                    const newTags = checked
                                      ? [...filters.tags, tag.slug]
                                      : filters.tags.filter((t) => t !== tag.slug)
                                    onFilterChange({ tags: newTags })
                                  }}
                                />
                                <Label htmlFor={`tag-${tag.slug}`} className="text-sm">
                                  {tag.name}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm">Amenities</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {["meals", "transport", "equipment", "photos", "guide", "pickup"].map((amenity) => (
                              <div key={amenity} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`amenity-${amenity}`}
                                  checked={filters.amenities.includes(amenity)}
                                  onCheckedChange={(checked) => {
                                    const newAmenities = checked
                                      ? [...filters.amenities, amenity]
                                      : filters.amenities.filter((a) => a !== amenity)
                                    onFilterChange({ amenities: newAmenities })
                                  }}
                                />
                                <Label htmlFor={`amenity-${amenity}`} className="text-sm capitalize">
                                  {amenity}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm">Accessibility</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {["wheelchair", "elderly", "pregnant", "children"].map((access) => (
                              <div key={access} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`access-${access}`}
                                  checked={filters.accessibility.includes(access)}
                                  onCheckedChange={(checked) => {
                                    const newAccess = checked
                                      ? [...filters.accessibility, access]
                                      : filters.accessibility.filter((a) => a !== access)
                                    onFilterChange({ accessibility: newAccess })
                                  }}
                                />
                                <Label htmlFor={`access-${access}`} className="text-sm capitalize">
                                  {access} friendly
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="sort">
                    <AccordionTrigger className="text-sm font-medium">Sort Results</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pt-2">
                        <RadioGroup value={filters.sortBy} onValueChange={(value) => onFilterChange({ sortBy: value })}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="recommended" id="s-recommended" />
                            <Label htmlFor="s-recommended">Recommended</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="price-low" id="s-price-low" />
                            <Label htmlFor="s-price-low">Price: Low to High</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="price-high" id="s-price-high" />
                            <Label htmlFor="s-price-high">Price: High to Low</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="rating" id="s-rating" />
                            <Label htmlFor="s-rating">Highest Rated</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="duration-short" id="s-duration-short" />
                            <Label htmlFor="s-duration-short">Duration: Shortest First</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="duration-long" id="s-duration-long" />
                            <Label htmlFor="s-duration-long">Duration: Longest First</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="popularity" id="s-popularity" />
                            <Label htmlFor="s-popularity">Most Popular</Label>
                          </div>
                        </RadioGroup>
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
                  <Button onClick={onReset}>Reset All</Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button>Apply Filters</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {renderActiveFilters()}
    </div>
  )
}

