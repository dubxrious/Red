"use client"

import React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, ChevronDown, User, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { SearchBar } from "@/components/search/search-bar"
import { megaMenuItems, iconTypes } from "@/lib/navigation"

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Handle search
  const handleSearch = (query: string) => {
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
    }
    if (isOpen) {
      setIsOpen(false)
    }
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-200",
        scrolled ? "bg-background/95 backdrop-blur-sm shadow-sm" : "bg-background",
      )}
    >
      {/* Top bar with logo, search, and actions */}
      <div className="border-b">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-xl font-bold">Red Sea Quest</span>
              </Link>
            </div>

            {/* Desktop search */}
            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <SearchBar
                onSearch={handleSearch}
                className="w-full"
                placeholder="Search tours, destinations, activities..."
                showInstantResults={true}
              />
            </div>

            {/* Desktop actions */}
            <div className="hidden md:flex items-center space-x-1">
              <Link
                href="/account"
                className={cn(
                  "p-2 rounded-md text-sm flex items-center hover:bg-secondary transition-colors",
                  pathname.startsWith("/account") ? "text-primary" : "text-muted-foreground",
                )}
              >
                <User className="h-4 w-4 mr-1.5" />
                <span>Account</span>
              </Link>

              <Link
                href="/bookings"
                className={cn(
                  "p-2 rounded-md text-sm flex items-center hover:bg-secondary transition-colors",
                  pathname.startsWith("/bookings") ? "text-primary" : "text-muted-foreground",
                )}
              >
                <ShoppingBag className="h-4 w-4 mr-1.5" />
                <span>My Bookings</span>
              </Link>

              <Button asChild className="ml-2">
                <Link href="/tours">Book Now</Link>
              </Button>
            </div>

            {/* Mobile menu trigger */}
            <div className="flex md:hidden items-center">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-sm p-0">
                  <div className="flex flex-col h-full">
                    {/* Mobile header */}
                    <div className="p-4 border-b flex items-center justify-between">
                      <Link href="/" className="font-bold" onClick={() => setIsOpen(false)}>
                        Red Sea Quest
                      </Link>
                      <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                        <X className="h-5 w-5" />
                        <span className="sr-only">Close menu</span>
                      </Button>
                    </div>

                    {/* Mobile search */}
                    <div className="p-4 border-b">
                      <SearchBar
                        onSearch={handleSearch}
                        className="w-full"
                        placeholder="Search..."
                        showInstantResults={true}
                      />
                    </div>

                    {/* Mobile navigation */}
                    <div className="flex-1 overflow-auto py-2">
                      <div className="px-4 py-2 space-y-4">
                        {megaMenuItems.map((item) => (
                          <MobileNavItem key={item.name} item={item} onClose={() => setIsOpen(false)} />
                        ))}
                      </div>
                    </div>

                    {/* Mobile actions */}
                    <div className="p-4 border-t space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" asChild>
                          <Link href="/account" className="justify-start" onClick={() => setIsOpen(false)}>
                            <User className="h-4 w-4 mr-2" />
                            Account
                          </Link>
                        </Button>
                        <Button variant="outline" asChild>
                          <Link href="/bookings" className="justify-start" onClick={() => setIsOpen(false)}>
                            <ShoppingBag className="h-4 w-4 mr-2" />
                            My Bookings
                          </Link>
                        </Button>
                      </div>
                      <Button className="w-full" asChild>
                        <Link href="/tours" onClick={() => setIsOpen(false)}>
                          Book Now
                        </Link>
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop navigation bar */}
      <nav className="hidden md:block border-b">
        <div className="container mx-auto px-4">
          <div className="flex">
            {megaMenuItems.map((item) => (
              <DesktopNavItem
                key={item.name}
                item={item}
                active={activeMenu === item.name}
                onMouseEnter={() => setActiveMenu(item.name)}
                onMouseLeave={() => setActiveMenu(null)}
              />
            ))}
          </div>
        </div>
      </nav>
    </header>
  )
}

// Desktop navigation item with mega menu dropdown
interface DesktopNavItemProps {
  item: any
  active: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
}

function DesktopNavItem({ item, active, onMouseEnter, onMouseLeave }: DesktopNavItemProps) {
  const pathname = usePathname()

  return (
    <div className="relative group" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <Link
        href={item.href || "#"}
        className={cn(
          "flex items-center px-4 py-3 text-sm font-medium border-b-2 border-transparent transition-colors",
          pathname === item.href
            ? "text-primary border-primary"
            : "text-muted-foreground hover:text-foreground hover:border-muted",
          active && "text-foreground border-muted",
        )}
        onClick={(e) => {
          if (!item.href) e.preventDefault()
        }}
      >
        {item.name}
        {item.columns && (
          <ChevronDown className={cn("ml-1 h-4 w-4 transition-transform duration-200", active && "rotate-180")} />
        )}
      </Link>

      {/* Mega menu dropdown */}
      {item.columns && active && (
        <div
          className="absolute left-0 right-0 mt-0.5 bg-background border rounded-b-lg shadow-lg overflow-hidden z-50 animate-in fade-in-5 slide-in-from-top-2"
          style={{ width: "max-content", minWidth: "100%" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
            {item.columns.map((column: any, idx: number) => (
              <div key={idx} className="space-y-4">
                {column.title && (
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{column.title}</h3>
                )}
                <ul className="space-y-2">
                  {column.items.map((subItem: any) => (
                    <li key={subItem.name}>
                      {subItem.featured ? (
                        <div className="group">
                          {subItem.image && (
                            <div className="relative h-32 w-full mb-2 overflow-hidden rounded-md">
                              <Image
                                src={subItem.image || "/placeholder.svg?height=128&width=256"}
                                alt={subItem.name}
                                fill
                                className="object-cover transition-transform group-hover:scale-105 duration-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent group-hover:from-black/70 transition-colors" />
                              <div className="absolute bottom-2 left-2 right-2">
                                <span className="text-white font-medium text-sm">{subItem.name}</span>
                              </div>
                            </div>
                          )}
                          <Link href={subItem.href} className="text-primary font-medium hover:underline block">
                            {!subItem.image && subItem.name}
                          </Link>
                          {subItem.description && (
                            <p className="text-sm text-muted-foreground mt-1">{subItem.description}</p>
                          )}
                        </div>
                      ) : (
                        <Link
                          href={subItem.href}
                          className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          {subItem.iconType && iconTypes[subItem.iconType] && (
                            <span className="mr-2">
                              {React.createElement(iconTypes[subItem.iconType].icon, {
                                className: iconTypes[subItem.iconType].className,
                              })}
                            </span>
                          )}
                          <span>{subItem.name}</span>
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Mobile navigation item with accordion
interface MobileNavItemProps {
  item: any
  onClose: () => void
}

function MobileNavItem({ item, onClose }: MobileNavItemProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-border/50 pb-2 last:border-0">
      {item.columns ? (
        <div>
          <button
            className="flex items-center justify-between w-full py-2 text-base font-medium"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span>{item.name}</span>
            <ChevronDown
              className="h-4 w-4 transition-transform duration-200"
              style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}
            />
          </button>

          {isOpen && (
            <div className="mt-2 pl-4 space-y-4">
              {item.columns.map((column: any, idx: number) => (
                <div key={idx} className="space-y-2">
                  {column.title && (
                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {column.title}
                    </h3>
                  )}
                  <ul className="space-y-2">
                    {column.items.map((subItem: any) => (
                      <li key={subItem.name}>
                        <Link
                          href={subItem.href}
                          className={cn(
                            "block py-1 text-sm",
                            subItem.featured ? "text-primary font-medium" : "text-muted-foreground",
                          )}
                          onClick={onClose}
                        >
                          {subItem.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <Link href={item.href || "#"} className="block py-2 text-base font-medium" onClick={onClose}>
          {item.name}
        </Link>
      )}
    </div>
  )
}

