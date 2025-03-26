import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarRange, Package, Star, Users } from "lucide-react"
import { RecentBookings } from "@/components/admin/recent-bookings"
import { RecentReviews } from "@/components/admin/recent-reviews"
import { OverviewChart } from "@/components/admin/overview-chart"
import { getBookingStats, getRecentBookings } from "@/lib/bookings"
import { getTourStats } from "@/lib/tours"
import { getReviewStats, getRecentReviews } from "@/lib/reviews"

export const metadata = {
  title: "Admin Dashboard | Red Sea Quest",
  description: "Admin dashboard for Red Sea Quest",
}

export default async function AdminDashboardPage() {
  const bookingStats = getBookingStats()
  const tourStats = getTourStats()
  const reviewStats = getReviewStats()

  const recentBookings = getRecentBookings(5)
  const recentReviews = getRecentReviews(5)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center gap-2">
          <CalendarRange className="h-4 w-4" />
          <span className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <CalendarRange className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookingStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {bookingStats.percentChange >= 0 ? "+" : ""}
              {bookingStats.percentChange}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tours</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tourStats.active}</div>
            <p className="text-xs text-muted-foreground">Out of {tourStats.total} total tours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviewStats.averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">From {reviewStats.total} reviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookingStats.uniqueCustomers}</div>
            <p className="text-xs text-muted-foreground">{bookingStats.newCustomers} new this month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bookings">Recent Bookings</TabsTrigger>
          <TabsTrigger value="reviews">Recent Reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>Booking and revenue overview for the past 30 days</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <OverviewChart />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>Recent tour bookings and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentBookings bookings={recentBookings} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Reviews</CardTitle>
              <CardDescription>Latest customer reviews and ratings</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentReviews reviews={recentReviews} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

