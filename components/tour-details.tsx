import { Anchor, Clock, MapPin, Users, Calendar, Shield } from "lucide-react"
import type { Tour } from "@/types/tour"
import { formatDuration } from "@/lib/utils"

interface TourDetailsProps {
  tour: Tour
  className?: string
}

export function TourDetails({ tour, className = "" }: TourDetailsProps) {
  return (
    <div className={className}>
      <h2 className="text-2xl font-semibold mb-4">Tour Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <h3 className="font-medium">Duration</h3>
            <p className="text-muted-foreground">
              {formatDuration(tour.duration_days, tour.duration_hours, tour.duration_minutes)}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <h3 className="font-medium">Location</h3>
            <p className="text-muted-foreground">{tour.location}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <h3 className="font-medium">Group Size</h3>
            <p className="text-muted-foreground">Small group (max 12 people)</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <h3 className="font-medium">Availability</h3>
            <p className="text-muted-foreground">Daily, year-round</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Anchor className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <h3 className="font-medium">Tour Type</h3>
            <p className="text-muted-foreground">{tour.category}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <h3 className="font-medium">Safety Measures</h3>
            <p className="text-muted-foreground">Professional guides, safety equipment provided</p>
          </div>
        </div>
      </div>
    </div>
  )
}

