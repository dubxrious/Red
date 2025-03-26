"use client"

import { useState } from "react"
import { Search, Compass, Map, Tag, Clock, TrendingUp } from "lucide-react"
import { SearchBar } from "@/components/search/search-bar"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface SearchPanelProps {
  onClose?: () => void
}

export function SearchPanel({ onClose }: SearchPanelProps) {
  const [query, setQuery] = useState("")

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery)
    if (onClose) onClose()
  }

  const quickSearches = [
    { name: "Diving Experiences", icon: <Compass className="h-4 w-4" />, href: "/search?q=diving" },
    { name: "Snorkeling Tours", icon: <Map className="h-4 w-4" />, href: "/search?q=snorkeling" },
    { name: "Boat Trips", icon: <Tag className="h-4 w-4" />, href: "/search?q=boat" },
    { name: "Day Tours", icon: <Clock className="h-4 w-4" />, href: "/search?q=day+tour" },
    { name: "Popular Destinations", icon: <TrendingUp className="h-4 w-4" />, href: "/destinations" },
  ]

  return (
    <div className="p-6 bg-white dark:bg-gray-950 rounded-lg shadow-lg w-full max-w-3xl">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 flex items-center">
          <Search className="mr-2 h-5 w-5" />
          Advanced Search
        </h3>
        <SearchBar
          initialQuery={query}
          onSearch={handleSearch}
          className="w-full"
          placeholder="Search tours, destinations, activities..."
        />
      </div>

      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-3">Quick Searches</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {quickSearches.map((item) => (
            <Button key={item.name} variant="outline" className="justify-start" asChild onClick={onClose}>
              <Link href={item.href}>
                {item.icon}
                <span className="ml-2">{item.name}</span>
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}

