"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

export default function AlgoliaAdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Algolia Search Management</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Algolia Integration Disabled</CardTitle>
          <CardDescription>The Algolia search integration has been disabled in this version.</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>
              The Algolia search integration has been replaced with a simpler search implementation using Supabase
              directly. This provides a more straightforward approach without requiring external services.
            </AlertDescription>
          </Alert>

          <div className="mt-4">
            <p>The current search implementation:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Uses Supabase for data storage and querying</li>
              <li>Performs text search on tour titles and descriptions</li>
              <li>Supports filtering by category, location, price, and rating</li>
              <li>Doesn't require external API keys or services</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button disabled>Algolia Integration Disabled</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

