import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatDuration(days?: number, hours?: number, minutes?: number): string {
  const parts = []

  if (days && days > 0) {
    parts.push(`${days} ${days === 1 ? "day" : "days"}`)
  }

  if (hours && hours > 0) {
    parts.push(`${hours} ${hours === 1 ? "hour" : "hours"}`)
  }

  if (minutes && minutes > 0) {
    parts.push(`${minutes} ${minutes === 1 ? "minute" : "minutes"}`)
  }

  return parts.join(" ") || "Duration not specified"
}

