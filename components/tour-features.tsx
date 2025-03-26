import type { LucideIcon } from "lucide-react"
import * as Icons from "lucide-react"
import type { TourFeature } from "@/types/tour"

interface TourFeaturesProps {
  features: TourFeature[]
  className?: string
}

export function TourFeatures({ features, className = "" }: TourFeaturesProps) {
  if (!features || features.length === 0) {
    return null
  }

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {features.map((feature, index) => {
        // Dynamically get the icon from Lucide
        const IconComponent = (Icons as Record<string, LucideIcon>)[
          feature.icon.charAt(0).toUpperCase() + feature.icon.slice(1)
        ]

        return (
          <div key={index} className="flex flex-col items-center text-center p-3 rounded-lg border">
            {IconComponent && <IconComponent className="h-6 w-6 mb-2 text-primary" />}
            <span className="text-sm font-medium">{feature.label}</span>
            {feature.description && <span className="text-xs text-muted-foreground mt-1">{feature.description}</span>}
          </div>
        )
      })}
    </div>
  )
}

