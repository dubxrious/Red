import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TourTable } from "@/components/admin/tour-table"
import { getAllTours } from "@/lib/tours"

export const metadata = {
  title: "Manage Tours | Admin Dashboard | Red Sea Quest",
  description: "Manage tours in the Red Sea Quest admin dashboard",
}

export default function AdminToursPage() {
  const tours = getAllTours()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Tours</h2>
        <Button asChild>
          <Link href="/admin/tours/new">
            <Plus className="mr-2 h-4 w-4" />
            Add New Tour
          </Link>
        </Button>
      </div>

      <TourTable tours={tours} />
    </div>
  )
}

