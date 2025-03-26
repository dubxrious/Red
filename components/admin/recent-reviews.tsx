"use client"

import { format } from "date-fns"
import { Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Review } from "@/types/review"
import { getTourById } from "@/lib/tours"

interface RecentReviewsProps {
  reviews: Review[]
}

export function RecentReviews({ reviews }: RecentReviewsProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Tour</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviews.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No recent reviews.
              </TableCell>
            </TableRow>
          ) : (
            reviews.map((review) => {
              const tour = getTourById(review.tourId)
              const status = review.status || "pending"

              return (
                <TableRow key={review.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={review.avatar} alt={review.name} />
                        <AvatarFallback>{review.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{review.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{tour ? tour.title : "Unknown Tour"}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span className="font-medium mr-1">{review.rating.toFixed(1)}</span>
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    </div>
                  </TableCell>
                  <TableCell>{format(new Date(review.date), "PPP")}</TableCell>
                  <TableCell>
                    <Badge
                      variant={status === "approved" ? "default" : status === "pending" ? "outline" : "destructive"}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`/admin/reviews/${review.id}`}>View</a>
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}

