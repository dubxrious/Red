"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase/client"

interface TourTagsProps {
  tags: string[]
  className?: string
}

export function TourTags({ tags, className = "" }: TourTagsProps) {
  const [tagData, setTagData] = useState<any[]>([])

  useEffect(() => {
    async function fetchTags() {
      if (tags.length === 0) return

      const { data, error } = await supabase.from("tags").select("name, slug").in("slug", tags)

      if (!error && data) {
        setTagData(data)
      }
    }

    fetchTags()
  }, [tags])

  if (!tags || tags.length === 0 || tagData.length === 0) {
    return null
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tagData.map((tag) => (
        <Link key={tag.slug} href={`/tags/${tag.slug}`}>
          <Badge
            variant="outline"
            className="px-3 py-1 rounded-full text-xs font-medium transition-all hover:bg-secondary"
          >
            {tag.name}
          </Badge>
        </Link>
      ))}
    </div>
  )
}

