import type { Tour, TourCategory, TourDestination, TourTag } from "@/types/tour"

// Mock data for tours
const mockTours: Tour[] = [
  {
    id: "1",
    title: "Coral Reef Snorkeling Adventure",
    slug: "coral-reef-snorkeling-adventure",
    description:
      "Explore vibrant coral reefs and encounter colorful marine life on this guided snorkeling tour. Perfect for beginners and experienced snorkelers alike, this adventure takes you to the best spots in the Red Sea.",
    category: "Snorkeling",
    location: "Hurghada",
    duration_hours: 4,
    retail_price: 89,
    discounted_price: 69,
    rating_exact_score: 4.8,
    review_count: 124,
    image_0_src: "/placeholder.svg?height=400&width=600",
    image_1_src: "/placeholder.svg?height=400&width=600",
    image_2_src: "/placeholder.svg?height=400&width=600",
    url: "#book-now",
    status: "active",
    tags: ["family-friendly", "beginner-friendly", "marine-life", "coral-reefs"],
    features: [
      { icon: "life-buoy", label: "Life jackets provided" },
      { icon: "camera", label: "Underwater camera rental" },
      { icon: "utensils", label: "Lunch included" },
      { icon: "droplet", label: "Bottled water" },
    ],
    availableDates: ["2023-12-15", "2023-12-16", "2023-12-17", "2023-12-18", "2023-12-19", "2023-12-20"],
    pickupAvailable: true,
    pickupLocations: ["Hurghada Marina", "Sahl Hasheesh", "El Gouna", "Makadi Bay"],
    maxCapacity: 12,
    minBookingNotice: 24,
    infantAge: 2,
    childAge: 12,
  },
  {
    id: "2",
    title: "Scuba Diving for Beginners",
    slug: "scuba-diving-for-beginners",
    description:
      "Take your first breath underwater with our beginner-friendly scuba diving experience. Our certified instructors will guide you through the basics in a safe, controlled environment before exploring shallow reefs.",
    category: "Diving",
    location: "Sharm El Sheikh",
    duration_hours: 6,
    retail_price: 149,
    discounted_price: 129,
    rating_exact_score: 4.9,
    review_count: 87,
    image_0_src: "/placeholder.svg?height=400&width=600",
    image_1_src: "/placeholder.svg?height=400&width=600",
    url: "#book-now",
    status: "active",
    tags: ["beginner-friendly", "instruction", "certification", "marine-life"],
    features: [
      { icon: "award", label: "PADI certified instructors" },
      { icon: "shield", label: "All equipment provided" },
      { icon: "camera", label: "Underwater photos included" },
      { icon: "utensils", label: "Lunch included" },
    ],
    availableDates: ["2023-12-15", "2023-12-17", "2023-12-19", "2023-12-21", "2023-12-23"],
    pickupAvailable: true,
    pickupLocations: ["Naama Bay", "Sharks Bay", "Nabq Bay", "Ras Um Sid"],
    maxCapacity: 8,
    minBookingNotice: 48,
    infantAge: 2,
    childAge: 12,
  },
  {
    id: "3",
    title: "Luxury Yacht Day Cruise",
    slug: "luxury-yacht-day-cruise",
    description:
      "Sail the crystal-clear waters of the Red Sea on our luxury yacht. Enjoy snorkeling stops, a gourmet lunch, and premium drinks while soaking up the sun on the spacious deck.",
    category: "Boat Tours",
    location: "Hurghada",
    duration_hours: 8,
    retail_price: 199,
    rating_exact_score: 4.7,
    review_count: 56,
    image_0_src: "/placeholder.svg?height=400&width=600",
    image_1_src: "/placeholder.svg?height=400&width=600",
    image_2_src: "/placeholder.svg?height=400&width=600",
    image_3_src: "/placeholder.svg?height=400&width=600",
    url: "#book-now",
    status: "active",
    tags: ["luxury", "gourmet", "snorkeling", "swimming"],
    features: [
      { icon: "anchor", label: "Luxury yacht" },
      { icon: "wine-glass", label: "Premium drinks included" },
      { icon: "utensils", label: "Gourmet lunch" },
      { icon: "music", label: "Sound system" },
    ],
    availableDates: ["2023-12-16", "2023-12-18", "2023-12-20", "2023-12-22", "2023-12-24"],
    pickupAvailable: true,
    pickupLocations: ["Hurghada Marina", "Sahl Hasheesh", "El Gouna", "Makadi Bay"],
    maxCapacity: 16,
    minBookingNotice: 72,
    infantAge: 2,
    childAge: 12,
  },
  {
    id: "4",
    title: "Dolphin Watching Excursion",
    slug: "dolphin-watching-excursion",
    description:
      "Witness dolphins in their natural habitat on this exciting excursion. Our experienced guides know the best spots to find these playful creatures, giving you an unforgettable wildlife experience.",
    category: "Wildlife",
    location: "Marsa Alam",
    duration_hours: 5,
    retail_price: 79,
    discounted_price: 65,
    rating_exact_score: 4.6,
    review_count: 93,
    image_0_src: "/placeholder.svg?height=400&width=600",
    url: "#book-now",
    status: "active",
    tags: ["wildlife", "dolphins", "family-friendly"],
    features: [
      { icon: "binoculars", label: "Expert guides" },
      { icon: "ship", label: "Comfortable boat" },
      { icon: "droplet", label: "Refreshments included" },
    ],
    availableDates: ["2023-12-15", "2023-12-17", "2023-12-19", "2023-12-21"],
    pickupAvailable: true,
    pickupLocations: ["Marsa Alam Hotels", "Port Ghalib"],
    maxCapacity: 20,
    minBookingNotice: 24,
    infantAge: 2,
    childAge: 12,
  },
  {
    id: "5",
    title: "Advanced Scuba Diving Trip",
    slug: "advanced-scuba-diving-trip",
    description:
      "Designed for certified divers, this advanced trip takes you to deeper sites with stunning drop-offs, caves, and abundant marine life. Explore the underwater wonders of the Red Sea with our expert dive masters.",
    category: "Diving",
    location: "Dahab",
    duration_hours: 6,
    retail_price: 169,
    rating_exact_score: 4.9,
    review_count: 42,
    image_0_src: "/placeholder.svg?height=400&width=600",
    image_1_src: "/placeholder.svg?height=400&width=600",
    url: "#book-now",
    status: "active",
    tags: ["advanced", "diving", "marine-life", "caves"],
    features: [
      { icon: "award", label: "Certified dive masters" },
      { icon: "shield", label: "Full equipment provided" },
      { icon: "camera", label: "Underwater photography" },
    ],
    availableDates: ["2023-12-16", "2023-12-18", "2023-12-20", "2023-12-22"],
    pickupAvailable: true,
    pickupLocations: ["Dahab Hotels", "Blue Hole"],
    maxCapacity: 6,
    minBookingNotice: 72,
    infantAge: 2,
    childAge: 12,
  },
  {
    id: "6",
    title: "Sunset Desert Safari",
    slug: "sunset-desert-safari",
    description:
      "Experience the magic of the desert at sunset. Ride camels or quad bikes across golden dunes, enjoy a traditional Bedouin dinner under the stars, and witness breathtaking views as the sun sets over the horizon.",
    category: "Desert",
    location: "Hurghada",
    duration_hours: 6,
    retail_price: 89,
    discounted_price: 75,
    rating_exact_score: 4.7,
    review_count: 68,
    image_0_src: "/placeholder.svg?height=400&width=600",
    url: "#book-now",
    status: "active",
    tags: ["desert", "sunset", "bedouin", "camel-ride"],
    features: [
      { icon: "sun", label: "Sunset views" },
      { icon: "fire", label: "Bedouin dinner" },
      { icon: "car", label: "Quad bike option" },
    ],
    availableDates: ["2023-12-15", "2023-12-17", "2023-12-19", "2023-12-21"],
    pickupAvailable: true,
    pickupLocations: ["Hurghada Hotels", "El Gouna"],
    maxCapacity: 30,
    minBookingNotice: 24,
    infantAge: 2,
    childAge: 12,
  },
  {
    id: "7",
    title: "Island Hopping Adventure",
    slug: "island-hopping-adventure",
    description:
      "Discover the hidden gems of the Red Sea on this island-hopping tour. Visit pristine beaches, snorkel in secluded bays, and enjoy a beach barbecue lunch on a private island.",
    category: "Boat Tours",
    location: "Hurghada",
    duration_days: 1,
    retail_price: 129,
    discounted_price: 109,
    rating_exact_score: 4.8,
    review_count: 74,
    image_0_src: "/placeholder.svg?height=400&width=600",
    image_1_src: "/placeholder.svg?height=400&width=600",
    url: "#book-now",
    status: "active",
    tags: ["island", "snorkeling", "beach", "barbecue"],
    features: [
      { icon: "island", label: "Private island visit" },
      { icon: "water", label: "Snorkeling gear provided" },
      { icon: "utensils", label: "Beach barbecue lunch" },
    ],
    availableDates: ["2023-12-16", "2023-12-18", "2023-12-20", "2023-12-22"],
    pickupAvailable: true,
    pickupLocations: ["Hurghada Hotels", "Sahl Hasheesh"],
    maxCapacity: 15,
    minBookingNotice: 48,
    infantAge: 2,
    childAge: 12,
  },
  {
    id: "8",
    title: "Wreck Diving Expedition",
    slug: "wreck-diving-expedition",
    description:
      "Explore fascinating shipwrecks teeming with marine life on this specialized diving expedition. Suitable for advanced divers, this tour offers a glimpse into underwater history and ecology.",
    category: "Diving",
    location: "Sharm El Sheikh",
    duration_hours: 8,
    retail_price: 189,
    rating_exact_score: 4.9,
    review_count: 31,
    image_0_src: "/placeholder.svg?height=400&width=600",
    url: "#book-now",
    status: "active",
    tags: ["diving", "wreck", "advanced", "marine-life"],
    features: [
      { icon: "ship", label: "Wreck diving sites" },
      { icon: "award", label: "Experienced dive guides" },
      { icon: "compass", label: "Navigation equipment" },
    ],
    availableDates: ["2023-12-15", "2023-12-17", "2023-12-19", "2023-12-21"],
    pickupAvailable: true,
    pickupLocations: ["Sharm El Sheikh Hotels", "Naama Bay"],
    maxCapacity: 8,
    minBookingNotice: 72,
    infantAge: 2,
    childAge: 12,
  },
  {
    id: "9",
    title: "Glass-Bottom Boat Tour",
    slug: "glass-bottom-boat-tour",
    description:
      "Perfect for those who want to see the underwater world without getting wet. Our glass-bottom boat provides clear views of colorful coral reefs and fish from the comfort of a stable vessel.",
    category: "Boat Tours",
    location: "Hurghada",
    duration_hours: 3,
    retail_price: 49,
    discounted_price: 39,
    rating_exact_score: 4.5,
    review_count: 112,
    image_0_src: "/placeholder.svg?height=400&width=600",
    url: "#book-now",
    status: "active",
    tags: ["boat-tour", "coral-reefs", "family-friendly", "glass-bottom"],
    features: [
      { icon: "binoculars", label: "Clear underwater views" },
      { icon: "family", label: "Suitable for all ages" },
      { icon: "droplet", label: "Refreshments available" },
    ],
    availableDates: ["2023-12-16", "2023-12-18", "2023-12-20", "2023-12-22"],
    pickupAvailable: true,
    pickupLocations: ["Hurghada Hotels", "Marina"],
    maxCapacity: 25,
    minBookingNotice: 24,
    infantAge: 2,
    childAge: 12,
  },
  {
    id: "10",
    title: "Night Diving Experience",
    slug: "night-diving-experience",
    description:
      "Discover the nocturnal marine life of the Red Sea on this thrilling night dive. Watch as the reef transforms after dark, with different creatures emerging from their daytime hiding spots.",
    category: "Diving",
    location: "Dahab",
    duration_hours: 4,
    retail_price: 149,
    rating_exact_score: 4.8,
    review_count: 27,
    image_0_src: "/placeholder.svg?height=400&width=600",
    image_1_src: "/placeholder.svg?height=400&width=600",
    url: "#book-now",
    status: "active",
    tags: ["diving", "night-dive", "marine-life", "advanced"],
    features: [
      { icon: "flashlight", label: "Underwater lights provided" },
      { icon: "award", label: "Certified dive guides" },
      { icon: "shield", label: "Safety briefing" },
    ],
    availableDates: ["2023-12-15", "2023-12-17", "2023-12-19", "2023-12-21"],
    pickupAvailable: true,
    pickupLocations: ["Dahab Hotels", "Dive Center"],
    maxCapacity: 6,
    minBookingNotice: 48,
    infantAge: 2,
    childAge: 12,
  },
  {
    id: "11",
    title: "Fishing Charter",
    slug: "fishing-charter",
    description:
      "Try your luck at catching some of the Red Sea's prized fish species. Our experienced captain knows the best fishing spots, and all equipment is provided for a day of angling adventure.",
    category: "Fishing",
    location: "Marsa Alam",
    duration_hours: 6,
    retail_price: 159,
    discounted_price: 139,
    rating_exact_score: 4.6,
    review_count: 38,
    image_0_src: "/placeholder.svg?height=400&width=600",
    url: "#book-now",
    status: "active",
    tags: ["fishing", "charter", "angling", "red-sea"],
    features: [
      { icon: "fishing", label: "Fishing equipment provided" },
      { icon: "ship", label: "Experienced captain" },
      { icon: "droplet", label: "Refreshments included" },
    ],
    availableDates: ["2023-12-16", "2023-12-18", "2023-12-20", "2023-12-22"],
    pickupAvailable: true,
    pickupLocations: ["Marsa Alam Hotels", "Port Ghalib"],
    maxCapacity: 4,
    minBookingNotice: 72,
    infantAge: 2,
    childAge: 12,
  },
  {
    id: "12",
    title: "Underwater Photography Tour",
    slug: "underwater-photography-tour",
    description:
      "Capture the beauty of the Red Sea's underwater world with our specialized photography tour. Our guides will take you to the most photogenic spots and provide tips for getting the perfect shot.",
    category: "Snorkeling",
    location: "Sharm El Sheikh",
    duration_hours: 5,
    retail_price: 119,
    discounted_price: 99,
    rating_exact_score: 4.7,
    review_count: 45,
    image_0_src: "/placeholder.svg?height=400&width=600",
    image_1_src: "/placeholder.svg?height=400&width=600",
    url: "#book-now",
    status: "active",
    tags: ["snorkeling", "photography", "underwater", "marine-life"],
    features: [
      { icon: "camera", label: "Photography tips" },
      { icon: "water", label: "Snorkeling gear provided" },
      { icon: "award", label: "Expert guides" },
    ],
    availableDates: ["2023-12-15", "2023-12-17", "2023-12-19", "2023-12-21"],
    pickupAvailable: true,
    pickupLocations: ["Sharm El Sheikh Hotels", "Naama Bay"],
    maxCapacity: 10,
    minBookingNotice: 48,
    infantAge: 2,
    childAge: 12,
  },
]

// Mock data for tour tags
const mockTags: TourTag[] = [
  {
    id: "1",
    name: "Family Friendly",
    slug: "family-friendly",
    description: "Tours suitable for families with children",
  },
  { id: "2", name: "Beginner Friendly", slug: "beginner-friendly", description: "No prior experience required" },
  { id: "3", name: "Marine Life", slug: "marine-life", description: "Encounter diverse marine species" },
  { id: "4", name: "Coral Reefs", slug: "coral-reefs", description: "Explore beautiful coral reef ecosystems" },
  { id: "5", name: "Luxury", slug: "luxury", description: "Premium experiences with high-end amenities" },
  { id: "6", name: "Gourmet", slug: "gourmet", description: "Featuring exceptional food and drinks" },
  { id: "7", name: "Instruction", slug: "instruction", description: "Includes professional teaching and guidance" },
  { id: "8", name: "Certification", slug: "certification", description: "Opportunity to earn official certifications" },
  { id: "9", name: "Swimming", slug: "swimming", description: "Includes swimming activities" },
  { id: "10", name: "Snorkeling", slug: "snorkeling", description: "Includes snorkeling activities" },
]

// Mock data for destinations
const mockDestinations: TourDestination[] = [
  {
    id: "1",
    name: "Hurghada",
    slug: "hurghada",
    description:
      "A popular resort town on Egypt's Red Sea coast known for its beautiful beaches and vibrant marine life.",
    image: "/placeholder.svg?height=400&width=600",
    tourCount: 5,
  },
  {
    id: "2",
    name: "Sharm El Sheikh",
    slug: "sharm-el-sheikh",
    description:
      "A resort town between the desert of the Sinai Peninsula and the Red Sea, known for its sheltered sandy beaches and clear waters.",
    image: "/placeholder.svg?height=400&width=600",
    tourCount: 3,
  },
  {
    id: "3",
    name: "Dahab",
    slug: "dahab",
    description:
      "A small town situated on the southeast coast of the Sinai Peninsula, known for its laid-back atmosphere and world-class diving sites.",
    image: "/placeholder.svg?height=400&width=600",
    tourCount: 2,
  },
  {
    id: "4",
    name: "Marsa Alam",
    slug: "marsa-alam",
    description: "A resort town on the western shore of the Red Sea, known for its pristine beaches and coral reefs.",
    image: "/placeholder.svg?height=400&width=600",
    tourCount: 2,
  },
]

// Mock data for categories
const mockCategories: TourCategory[] = [
  {
    id: "1",
    name: "Snorkeling",
    slug: "snorkeling",
    description: "Explore the underwater world with a mask and snorkel, perfect for all ages and swimming abilities.",
    image: "/placeholder.svg?height=400&width=600",
    tourCount: 3,
  },
  {
    id: "2",
    name: "Diving",
    slug: "diving",
    description: "Discover the depths of the Red Sea with scuba equipment, guided by professional instructors.",
    image: "/placeholder.svg?height=400&width=600",
    tourCount: 4,
  },
  {
    id: "3",
    name: "Boat Tours",
    slug: "boat-tours",
    description:
      "Cruise the crystal-clear waters of the Red Sea on various vessels, from traditional boats to luxury yachts.",
    image: "/placeholder.svg?height=400&width=600",
    tourCount: 3,
  },
  {
    id: "4",
    name: "Wildlife",
    slug: "wildlife",
    description: "Encounter the diverse marine and desert wildlife of the Red Sea region.",
    image: "/placeholder.svg?height=400&width=600",
    tourCount: 1,
  },
  {
    id: "5",
    name: "Desert",
    slug: "desert",
    description: "Experience the magic of the Egyptian desert with various activities from camel rides to quad biking.",
    image: "/placeholder.svg?height=400&width=600",
    tourCount: 1,
  },
  {
    id: "6",
    name: "Fishing",
    slug: "fishing",
    description: "Try your luck at catching some of the Red Sea's prized fish species with experienced captains.",
    image: "/placeholder.svg?height=400&width=600",
    tourCount: 1,
  },
]

export function getAllTours(): Tour[] {
  return mockTours
}

export function getFeaturedTours(count = 4): Tour[] {
  // In a real app, you might have a "featured" flag or use other criteria
  return mockTours.sort((a, b) => b.rating_exact_score - a.rating_exact_score).slice(0, count)
}

export function getTourBySlug(slug: string): Tour | undefined {
  return mockTours.find((tour) => tour.slug === slug)
}

export function getRelatedTours(category: string, excludeId: string, count = 3): Tour[] {
  return mockTours.filter((tour) => tour.category === category && tour.id !== excludeId).slice(0, count)
}

// Update the existing mockTours array to include status
export function getTourStats() {
  const tours = getAllTours()
  const total = tours.length
  const active = tours.filter((tour) => tour.status !== "inactive").length

  return {
    total,
    active,
  }
}

export function getTourById(id: string): Tour | undefined {
  return mockTours.find((tour) => tour.id === id)
}

export function getToursByCategory(categorySlug: string): Tour[] {
  const category = mockCategories.find((cat) => cat.slug === categorySlug)
  if (!category) return []

  return mockTours.filter((tour) => tour.category.toLowerCase() === category.name.toLowerCase())
}

export function getToursByDestination(destinationSlug: string): Tour[] {
  const destination = mockDestinations.find((dest) => dest.slug === destinationSlug)
  if (!destination) return []

  return mockTours.filter((tour) => tour.location.toLowerCase() === destination.name.toLowerCase())
}

export function getToursByTag(tagSlug: string): Tour[] {
  const tag = mockTags.find((t) => t.slug === tagSlug)
  if (!tag) return []

  return mockTours.filter((tour) => tour.tags?.includes(tagSlug))
}

export function getAllCategories(): TourCategory[] {
  return mockCategories
}

export function getCategoryBySlug(slug: string): TourCategory | undefined {
  return mockCategories.find((category) => category.slug === slug)
}

export function getAllDestinations(): TourDestination[] {
  return mockDestinations
}

export function getDestinationBySlug(slug: string): TourDestination | undefined {
  return mockDestinations.find((destination) => destination.slug === slug)
}

export function getAllTags(): TourTag[] {
  return mockTags
}

export function getTagBySlug(slug: string): TourTag | undefined {
  return mockTags.find((tag) => tag.slug === slug)
}

export function checkTourAvailability(tourId: string, date: string, guests: number): boolean {
  // In a real app, this would check against a database of bookings
  // For now, we'll just simulate availability
  const tour = getTourById(tourId)
  if (!tour) return false

  // Check if the date is available
  if (!tour.availableDates?.includes(date)) return false

  // Check if there's capacity
  if (guests > (tour.maxCapacity || 10)) return false

  return true
}

export async function deleteTour(id: string): Promise<void> {
  // In a real app, this would be an API call
  // For now, we'll just simulate success
  return Promise.resolve()
}

