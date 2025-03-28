import type { Tour } from "@/types/tour"

// Fallback tours to use when API calls fail
export const FALLBACK_TOURS: Tour[] = [
  {
    id: "fallback-1",
    title: "Premium Red Sea Diving Experience",
    slug: "premium-red-sea-diving",
    description: "Experience the vibrant marine life of the Red Sea with our expert guides. Perfect for all skill levels.",
    category: "diving",
    location: "red-sea",
    status: "active",
    retail_price: 149.99,
    discounted_price: 129.99,
    image_0_src: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=2070&auto=format&fit=crop",
    url: "/tours/premium-red-sea-diving",
    rating_exact_score: 4.9,
    review_count: 42,
    featured: true,
    featured_order: 1
  },
  {
    id: "fallback-2", 
    title: "Sunset Yacht Cruise with Dinner",
    slug: "sunset-yacht-cruise",
    description: "Enjoy a luxurious sunset cruise with a gourmet dinner. Perfect for couples and special occasions.",
    category: "cruises",
    location: "red-sea",
    status: "active",
    retail_price: 199.99,
    discounted_price: 179.99,
    image_0_src: "https://images.unsplash.com/photo-1565440707934-c9bacbad2146?q=80&w=2069&auto=format&fit=crop",
    url: "/tours/sunset-yacht-cruise",
    rating_exact_score: 4.8,
    review_count: 36,
    featured: true,
    featured_order: 2
  },
  {
    id: "fallback-3",
    title: "Dolphin Watching Adventure",
    slug: "dolphin-watching",
    description: "Swim with dolphins in their natural habitat and explore colorful coral reefs on this unforgettable adventure.",
    category: "wildlife",
    location: "red-sea",
    status: "active",
    retail_price: 89.99,
    discounted_price: 79.99,
    image_0_src: "https://images.unsplash.com/photo-1560275619-4cc5fa59d3ae?q=80&w=2069&auto=format&fit=crop",
    url: "/tours/dolphin-watching",
    rating_exact_score: 4.7,
    review_count: 52,
    featured: true,
    featured_order: 3
  },
  {
    id: "fallback-4",
    title: "Island Hopping Expedition",
    slug: "island-hopping",
    description: "Explore multiple pristine islands with accommodation on a luxury catamaran.",
    category: "adventure",
    location: "red-sea",
    status: "active",
    retail_price: 499.99,
    discounted_price: 449.99,
    image_0_src: "https://images.unsplash.com/photo-1682686580224-cd32b6005d31?q=80&w=2070&auto=format&fit=crop",
    url: "/tours/island-hopping",
    rating_exact_score: 4.9,
    review_count: 28,
    featured: true,
    featured_order: 4
  }
] 