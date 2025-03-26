"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface MegaMenuItem {
  name: string
  href?: string
  description?: string
  icon?: React.ReactNode
  featured?: boolean
  columns?: MegaMenuColumn[]
}

export interface MegaMenuColumn {
  title?: string
  items: {
    name: string
    href: string
    description?: string
    icon?: React.ReactNode
    featured?: boolean
    image?: string
  }[]
}

interface MegaMenuProps {
  items: MegaMenuItem[]
}

export function MegaMenu({ items }: MegaMenuProps) {
  const pathname = usePathname()
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Handle click outside to close menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Clear menu when navigating
  useEffect(() => {
    setActiveMenu(null)
  }, [pathname])

  const handleMouseEnter = (name: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }

    hoverTimeoutRef.current = setTimeout(() => {
      setActiveMenu(name)
    }, 100)
  }

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }

    hoverTimeoutRef.current = setTimeout(() => {
      setActiveMenu(null)
    }, 300)
  }

  return (
    <nav className="relative" ref={menuRef}>
      <div className="flex items-center space-x-1">
        {/* Menu items */}
        {items.map((item) => (
          <div
            key={item.name}
            className="relative"
            onMouseEnter={() => handleMouseEnter(item.name)}
            onMouseLeave={handleMouseLeave}
          >
            {item.href ? (
              <Link
                href={item.href}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-secondary/50 flex items-center",
                  pathname === item.href ? "text-primary" : "text-muted-foreground hover:text-primary",
                  activeMenu === item.name && "bg-secondary/50",
                )}
              >
                {item.name}
                {item.columns && <ChevronDown className="ml-1 h-4 w-4" />}
              </Link>
            ) : (
              <button
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-secondary/50 flex items-center",
                  activeMenu === item.name
                    ? "text-primary bg-secondary/50"
                    : "text-muted-foreground hover:text-primary",
                )}
                onClick={() => {
                  setActiveMenu(activeMenu === item.name ? null : item.name)
                }}
              >
                {item.name}
                {item.columns && <ChevronDown className="ml-1 h-4 w-4" />}
              </button>
            )}

            {/* Mega menu dropdown */}
            {item.columns && activeMenu === item.name && (
              <div
                className="absolute left-0 mt-2 w-screen max-w-screen-lg bg-white dark:bg-gray-950 rounded-lg shadow-lg border overflow-hidden z-50"
                onMouseEnter={() => setActiveMenu(item.name)}
                onMouseLeave={handleMouseLeave}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                  {item.columns.map((column, idx) => (
                    <div key={idx} className="space-y-4">
                      {column.title && <h3 className="text-sm font-medium text-muted-foreground">{column.title}</h3>}
                      <ul className="space-y-2">
                        {column.items.map((subItem) => (
                          <li key={subItem.name}>
                            {subItem.featured ? (
                              <div className="group">
                                {subItem.image && (
                                  <div className="relative h-32 w-full mb-2 overflow-hidden rounded-md">
                                    <Image
                                      src={subItem.image || "/placeholder.svg"}
                                      alt={subItem.name}
                                      fill
                                      className="object-cover transition-transform group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
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
                              <Link href={subItem.href} className="flex items-center text-sm hover:text-primary">
                                {subItem.icon && <span className="mr-2">{subItem.icon}</span>}
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
        ))}
      </div>
    </nav>
  )
}

