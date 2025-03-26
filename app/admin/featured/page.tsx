"use client"

import { useEffect, useState } from "react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Grip, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase/client"
import type { Tour } from "@/types/tour"

export default function ManageFeaturedToursPage() {
  const { toast } = useToast()
  const [tours, setTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function fetchTours() {
      setLoading(true)

      try {
        // First, check if the featured column exists
        const { error: checkError } = await supabase.from("tours").select("featured").limit(1).maybeSingle()

        // If the column doesn't exist, create it
        if (checkError && checkError.message.includes('column "featured" does not exist')) {
          // We can't alter the table from the client, so show a message
          toast({
            variant: "destructive",
            title: "Database setup required",
            description: "The 'featured' column doesn't exist. Please run the SQL commands from the documentation.",
          })
          setLoading(false)
          return
        }

        // Get all tours with their featured status
        const { data, error } = await supabase
          .from("tours")
          .select("id, title, image_0_src, featured, featured_order, status")
          .eq("status", "active")
          .order("featured_order", { ascending: true, nullsLast: true })
          .order("title", { ascending: true })

        if (error) throw error

        setTours(data as Tour[])
      } catch (error) {
        console.error("Error fetching tours:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load tours. Please try again.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTours()
  }, [toast])

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(tours)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update the featured_order property
    const updatedItems = items.map((item, index) => ({
      ...item,
      featured_order: item.featured ? index + 1 : null,
    }))

    setTours(updatedItems)
  }

  const toggleFeatured = (tourId: string, featured: boolean) => {
    setTours(
      tours.map((tour) => {
        if (tour.id === tourId) {
          return {
            ...tour,
            featured,
            featured_order: featured
              ? Math.max(...tours.filter((t) => t.featured).map((t) => t.featured_order || 0), 0) + 1
              : null,
          }
        }
        return tour
      }),
    )
  }

  const saveFeaturedTours = async () => {
    setSaving(true)

    try {
      // Update each tour's featured status and order
      for (const tour of tours) {
        const { error } = await supabase
          .from("tours")
          .update({
            featured: tour.featured,
            featured_order: tour.featured_order,
          })
          .eq("id", tour.id)

        if (error) throw error
      }

      toast({
        title: "Featured tours updated",
        description: "Your changes have been saved successfully.",
      })
    } catch (error) {
      console.error("Error saving featured tours:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was an error saving your changes.",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading tours...</div>
  }

  const featuredTours = tours.filter((tour) => tour.featured)
  const nonFeaturedTours = tours.filter((tour) => !tour.featured)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Featured Tours</h1>
        <Button onClick={saveFeaturedTours} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Featured Tours ({featuredTours.length})</h2>
          <p className="text-muted-foreground mb-4">
            Drag to reorder. These tours will appear in the featured section.
          </p>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="featured-tours">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {featuredTours.map((tour, index) => (
                    <Draggable key={tour.id} draggableId={tour.id} index={index}>
                      {(provided) => (
                        <Card ref={provided.innerRef} {...provided.draggableProps} className="mb-2">
                          <CardContent className="p-4 flex items-center">
                            <div {...provided.dragHandleProps} className="mr-2">
                              <Grip className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <Checkbox
                              checked={tour.featured}
                              onCheckedChange={(checked) => toggleFeatured(tour.id, checked === true)}
                              className="mr-3"
                            />
                            <div className="flex items-center flex-1">
                              <div
                                className="w-12 h-12 rounded bg-cover bg-center mr-3"
                                style={{ backgroundImage: `url(${tour.image_0_src})` }}
                              />
                              <span>{tour.title}</span>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Available Tours</h2>
          <p className="text-muted-foreground mb-4">Check tours to add them to the featured section.</p>

          <div className="space-y-2">
            {nonFeaturedTours.map((tour) => (
              <Card key={tour.id} className="mb-2">
                <CardContent className="p-4 flex items-center">
                  <Checkbox
                    checked={tour.featured}
                    onCheckedChange={(checked) => toggleFeatured(tour.id, checked === true)}
                    className="mr-3"
                  />
                  <div className="flex items-center flex-1">
                    <div
                      className="w-12 h-12 rounded bg-cover bg-center mr-3"
                      style={{ backgroundImage: `url(${tour.image_0_src})` }}
                    />
                    <span>{tour.title}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Database Setup</h3>
        <p className="mb-2">To use this feature, you need to add the following columns to your tours table:</p>
        <pre className="bg-background p-4 rounded overflow-x-auto">
          {`ALTER TABLE tours ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS featured_order INTEGER;`}
        </pre>
        <p className="mt-2 text-sm text-muted-foreground">Run these SQL commands in your Supabase SQL editor.</p>
      </div>
    </div>
  )
}

