"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { getAllTours, getAllCategories, getAllDestinations, getAllTags } from "@/lib/tours"

export function SearchBar() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return

    router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    setOpen(false)
    setQuery("")
  }

  const handleSelect = (value: string) => {
    const [type, slug] = value.split(":")

    if (type === "tour") {
      router.push(`/tours/${slug}`)
    } else if (type === "category") {
      router.push(`/categories/${slug}`)
    } else if (type === "destination") {
      router.push(`/destinations/${slug}`)
    } else if (type === "tag") {
      router.push(`/search?tag=${slug}`)
    }

    setOpen(false)
  }

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 xl:mr-2" />
        <span className="hidden xl:inline-flex">Search tours...</span>
        <span className="sr-only">Search tours</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 xl:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search tours, destinations, categories..." value={query} onValueChange={setQuery} />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Tours">
            {getAllTours()
              .filter(
                (tour) =>
                  tour.title.toLowerCase().includes(query.toLowerCase()) ||
                  tour.description.toLowerCase().includes(query.toLowerCase()),
              )
              .slice(0, 5)
              .map((tour) => (
                <CommandItem key={tour.id} value={`tour:${tour.slug}`} onSelect={handleSelect}>
                  <Search className="mr-2 h-4 w-4" />
                  {tour.title}
                </CommandItem>
              ))}
          </CommandGroup>

          <CommandGroup heading="Categories">
            {getAllCategories()
              .filter((category) => category.name.toLowerCase().includes(query.toLowerCase()))
              .map((category) => (
                <CommandItem key={category.id} value={`category:${category.slug}`} onSelect={handleSelect}>
                  {category.name}
                </CommandItem>
              ))}
          </CommandGroup>

          <CommandGroup heading="Destinations">
            {getAllDestinations()
              .filter((destination) => destination.name.toLowerCase().includes(query.toLowerCase()))
              .map((destination) => (
                <CommandItem key={destination.id} value={`destination:${destination.slug}`} onSelect={handleSelect}>
                  {destination.name}
                </CommandItem>
              ))}
          </CommandGroup>

          <CommandGroup heading="Popular Tags">
            {getAllTags()
              .filter((tag) => tag.name.toLowerCase().includes(query.toLowerCase()))
              .slice(0, 5)
              .map((tag) => (
                <CommandItem key={tag.id} value={`tag:${tag.slug}`} onSelect={handleSelect}>
                  {tag.name}
                </CommandItem>
              ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}

