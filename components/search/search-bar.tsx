"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InstantSearchResults } from "@/components/search/instant-search-results"

interface SearchBarProps {
  initialQuery?: string
  onSearch?: (query: string) => void
  className?: string
  placeholder?: string
  showInstantResults?: boolean
}

export function SearchBar({
  initialQuery = "",
  onSearch,
  className = "",
  placeholder = "Search tours, destinations, activities...",
  showInstantResults = true,
}: SearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [showResults, setShowResults] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSearch = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }

    if (onSearch) {
      onSearch(query)
    } else {
      // Navigate to search page with query
      router.push(`/search?q=${encodeURIComponent(query)}`)
    }

    // Hide results after search
    setShowResults(false)
  }

  const handleClearSearch = () => {
    setQuery("")
    if (onSearch) {
      onSearch("")
    }
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value
    setQuery(newQuery)

    // Show results when typing
    if (showInstantResults) {
      setShowResults(true)
    }

    // If onSearch is provided, call it for real-time filtering
    if (onSearch) {
      onSearch(newQuery)
    }
  }

  const handleFocus = () => {
    if (showInstantResults && query.trim()) {
      setShowResults(true)
    }
  }

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSearch} className="flex w-full items-center">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="search"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            className="pl-10 pr-8"
          />
          {query && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </button>
          )}
        </div>
        <Button type="submit" className="ml-2">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </form>

      {showInstantResults && (
        <InstantSearchResults query={query} visible={showResults} onClose={() => setShowResults(false)} />
      )}
    </div>
  )
}

