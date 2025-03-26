import { Anchor, Compass, Fish, Map, Ship, Sunset, FishIcon as Whale, Palmtree, Mountain, Camera } from "lucide-react"

// Define icon types without using JSX
export const iconTypes = {
  anchor: { icon: Anchor, className: "h-4 w-4" },
  compass: { icon: Compass, className: "h-4 w-4" },
  fish: { icon: Fish, className: "h-4 w-4" },
  map: { icon: Map, className: "h-4 w-4" },
  ship: { icon: Ship, className: "h-4 w-4" },
  sunset: { icon: Sunset, className: "h-4 w-4" },
  whale: { icon: Whale, className: "h-4 w-4" },
  palmtree: { icon: Palmtree, className: "h-4 w-4" },
  mountain: { icon: Mountain, className: "h-4 w-4" },
  camera: { icon: Camera, className: "h-4 w-4" },
}

export const megaMenuItems = [
  {
    name: "Tours",
    href: "/tours",
    columns: [
      {
        title: "Tour Categories",
        items: [
          {
            name: "Diving Tours",
            href: "/categories/diving",
            iconType: "anchor",
            description: "Explore the vibrant underwater world of the Red Sea",
          },
          {
            name: "Snorkeling Adventures",
            href: "/categories/snorkeling",
            iconType: "fish",
          },
          {
            name: "Boat Trips",
            href: "/categories/boat-trips",
            iconType: "ship",
          },
          {
            name: "Sunset Cruises",
            href: "/categories/sunset-cruises",
            iconType: "sunset",
          },
        ],
      },
      {
        title: "Special Experiences",
        items: [
          {
            name: "Whale Watching",
            href: "/categories/whale-watching",
            iconType: "whale",
          },
          {
            name: "Island Hopping",
            href: "/categories/island-hopping",
            iconType: "palmtree",
          },
          {
            name: "Desert Safaris",
            href: "/categories/desert-safaris",
            iconType: "mountain",
          },
          {
            name: "Photography Tours",
            href: "/categories/photography",
            iconType: "camera",
          },
        ],
      },
      {
        title: "Featured Tours",
        items: [
          {
            name: "Red Sea Coral Reef Exploration",
            href: "/tours/coral-reef-exploration",
            featured: true,
            image: "https://redseaquest.s3.eu-central-1.amazonaws.com/media/Cover-Photo-Red-Sea-Quest.webp",
          },
          {
            name: "Dolphin House Snorkeling Adventure",
            href: "/tours/dolphin-house",
            featured: true,
            description: "Swim with wild dolphins in their natural habitat",
          },
        ],
      },
    ],
  },
  {
    name: "Destinations",
    href: "/destinations",
    columns: [
      {
        title: "Popular Destinations",
        items: [
          {
            name: "Hurghada",
            href: "/destinations/hurghada",
            iconType: "map",
          },
          {
            name: "Sharm El Sheikh",
            href: "/destinations/sharm-el-sheikh",
            iconType: "map",
          },
          {
            name: "Marsa Alam",
            href: "/destinations/marsa-alam",
            iconType: "map",
          },
          {
            name: "Dahab",
            href: "/destinations/dahab",
            iconType: "map",
          },
        ],
      },
      {
        title: "Islands & Reefs",
        items: [
          {
            name: "Tiran Island",
            href: "/destinations/tiran-island",
            iconType: "compass",
          },
          {
            name: "Giftun Islands",
            href: "/destinations/giftun-islands",
            iconType: "compass",
          },
          {
            name: "Abu Galawa Reef",
            href: "/destinations/abu-galawa-reef",
            iconType: "compass",
          },
          {
            name: "Ras Mohammed",
            href: "/destinations/ras-mohammed",
            iconType: "compass",
          },
        ],
      },
      {
        title: "Featured Destinations",
        items: [
          {
            name: "Brothers Islands",
            href: "/destinations/brothers-islands",
            featured: true,
            image: "https://redseaquest.s3.eu-central-1.amazonaws.com/media/Cover-Photo-Red-Sea-Quest.webp",
            description: "World-famous dive site with stunning walls and shipwrecks",
          },
        ],
      },
    ],
  },
  {
    name: "Categories",
    href: "/categories",
    columns: [
      {
        title: "By Activity",
        items: [
          {
            name: "Diving",
            href: "/categories/diving",
            iconType: "anchor",
          },
          {
            name: "Snorkeling",
            href: "/categories/snorkeling",
            iconType: "fish",
          },
          {
            name: "Boat Tours",
            href: "/categories/boat-tours",
            iconType: "ship",
          },
          {
            name: "Beach Activities",
            href: "/categories/beach-activities",
            iconType: "palmtree",
          },
        ],
      },
      {
        title: "By Experience",
        items: [
          {
            name: "Family Friendly",
            href: "/categories/family-friendly",
          },
          {
            name: "Adventure",
            href: "/categories/adventure",
          },
          {
            name: "Romantic",
            href: "/categories/romantic",
          },
          {
            name: "Eco Tours",
            href: "/categories/eco-tours",
          },
        ],
      },
    ],
  },
  {
    name: "About",
    href: "/about",
  },
  {
    name: "Contact",
    href: "/contact",
  },
]

