"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { MegaMenuItem } from "./mega-menu"

interface MobileMegaMenuProps {
  items: MegaMenuItem[]
  onClose?: () => void
}

export function MobileMegaMenu({ items, onClose }: MobileMegaMenuProps) {
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleItem = (name: string) => {
    setOpenItems((current) => (current.includes(name) ? current.filter((item) => item !== name) : [...current, name]))
  }

  return (
    <div className="space-y-4">
      {/* Mobile mega menu items */}
      {items.map((item) => (
        <div key={item.name} className="border-b pb-2">
          {item.columns ? (
            <Collapsible open={openItems.includes(item.name)} onOpenChange={() => toggleItem(item.name)}>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-base font-medium">
                <span>{item.name}</span>
                <ChevronDown
                  className="h-4 w-4 transition-transform duration-200"
                  style={{ transform: openItems.includes(item.name) ? "rotate(180deg)" : "rotate(0)" }}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 space-y-4">
                {item.columns.map((column, idx) => (
                  <div key={idx} className="space-y-2">
                    {column.title && <h3 className="text-sm font-medium text-muted-foreground">{column.title}</h3>}
                    <ul className="space-y-2">
                      {column.items.map((subItem) => (
                        <li key={subItem.name}>
                          {subItem.featured ? (
                            <div>
                              {subItem.image && (
                                <div className="relative h-32 w-full mb-2 overflow-hidden rounded-md">
                                  <Image
                                    src={subItem.image || "/placeholder.svg"}
                                    alt={subItem.name}
                                    fill
                                    className="object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/20" />
                                  <div className="absolute bottom-2 left-2 right-2">
                                    <span className="text-white font-medium text-sm">{subItem.name}</span>
                                  </div>
                                </div>
                              )}
                              <Link
                                href={subItem.href}
                                className="text-primary font-medium hover:underline block"
                                onClick={onClose}
                              >
                                {!subItem.image && subItem.name}
                              </Link>
                              {subItem.description && (
                                <p className="text-sm text-muted-foreground mt-1">{subItem.description}</p>
                              )}
                            </div>
                          ) : (
                            <Link
                              href={subItem.href}
                              className="flex items-center text-sm hover:text-primary"
                              onClick={onClose}
                            >
                              {subItem.icon && <span className="mr-2">{subItem.icon}</span>}
                              <span>{subItem.name}</span>
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <Link
              href={item.href || "#"}
              className="flex items-center justify-between py-2 text-base font-medium"
              onClick={onClose}
            >
              <span>{item.name}</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      ))}
    </div>
  )
}

