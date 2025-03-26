"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Loader2 } from "lucide-react"
import { searchTours } from "@/lib/services/search-service"
import type { Tour } from "@/types/tour"

interface InstantSearchResultsProps {
  query: string
  visible: boolean
  onClose: () => void
}

export function InstantSearchResults({ query, visible, onClose }: InstantSearchResultsProps) {
  const [results, setResults] = useState<Tour[]>([]) // Initialize as empty array
  const [loading, setLoading] = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Close results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClose])

  useEffect(() => {
    // Don't search if query is empty or results aren't visible
    if (!query.trim() || !visible) {
      setResults([])
      return
    }

    const controller = new AbortController()
    const signal = controller.signal

    async function performSearch() {
      setLoading(true)
      try {
        // Ensure we're passing the correct parameters
        const searchResults = await searchTours(query, 5)
        // Ensure we always set an array, even if the result is undefined
        setResults(searchResults || [])
      } catch (error) {
        console.error("Search error:", error)
        setResults([]) // Set empty array on error
      } finally {
        setLoading(false)
      }
    }

    // Debounce search to avoid too many requests
    const timer = setTimeout(performSearch, 300)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query, visible])

  if (!visible) return null

  return (
    <div
      ref={resultsRef}
      className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-[70vh] overflow-auto"
    >
      {loading ? (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
        </div>
      ) : results && results.length === 0 ? ( // Add null check before accessing length
        <div className="p-4 text-center text-sm text-muted-foreground">
          {query.trim() ? "No results found" : "Start typing to search"}
        </div>
      ) : (
        <div>
          <div className="p-2">
            {/* Add null check before mapping */}
            {results &&
              results.map((tour) => (
                <Link
                  key={tour.id}
                  href={`/tours/${tour.slug}`}
                  className="flex items-center p-2 hover:bg-muted rounded-md transition-colors"
                  onClick={onClose}
                >
                  <div className="relative h-12 w-16 rounded-md overflow-hidden flex-shrink-0">
                    <Image
                      src={tour.image_0_src || "/placeholder.svg?height=48&width=64"}
                      alt={tour.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{tour.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {tour.destinations?.name || "Unknown location"} • {tour.categories?.name || "Unknown category"}
                    </p>
                  </div>
                </Link>
              ))}
          </div>
          <div className="p-2 border-t">
            <Link
              href={`/search?q=${encodeURIComponent(query)}`}
              className="block w-full text-center text-sm text-primary hover:underline p-2"
              onClick={onClose}
            >
              View all results
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

