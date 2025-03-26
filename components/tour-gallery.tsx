"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TourGalleryProps {
  images: string[]
}

export function TourGallery({ images }: TourGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [open, setOpen] = useState(false)

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const filteredImages = images.filter(Boolean)

  if (filteredImages.length === 0) {
    return (
      <div className="aspect-video bg-muted flex items-center justify-center rounded-lg">
        <p className="text-muted-foreground">No images available</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <div className="relative aspect-video rounded-lg overflow-hidden cursor-pointer">
            <Image
              src={filteredImages[0] || "/placeholder.svg"}
              alt="Tour main image"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
            />
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-none">
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <Image
              src={filteredImages[currentIndex] || "/placeholder.svg"}
              alt={`Tour image ${currentIndex + 1}`}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-white bg-black/50 hover:bg-black/70 rounded-full"
              onClick={() => setOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 rounded-full"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 rounded-full"
              onClick={handleNext}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
            <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm">
              {currentIndex + 1} / {filteredImages.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {filteredImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {filteredImages.slice(0, 4).map((image, index) => (
            <div
              key={index}
              className="relative aspect-video rounded-md overflow-hidden cursor-pointer"
              onClick={() => {
                setCurrentIndex(index)
                setOpen(true)
              }}
            >
              <Image
                src={image || "/placeholder.svg"}
                alt={`Tour thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 25vw, 200px"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

