"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import {
  BookOpen,
  Filter,
  Calendar,
  User,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react"
import AdminLayout from "~/components/admin/admin-layout"
import { Button } from "~/components/ui/button"
import { api } from "~/trpc/react"

export default function AdminBookingsPage() {
  const { data: session } = useSession()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<"CONFIRMED" | "CANCELLED" | undefined>(undefined)

  const { data: bookingsData, isLoading, refetch } = api.admin.getBookings.useQuery({
    page,
    limit: 10,
    status: statusFilter,
  })

  const updateStatusMutation = api.admin.updateBookingStatus.useMutation({
    onSuccess: () => {
      refetch()
    },
    onError: (error) => {
      alert(error.message)
    },
  })

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return new Intl.NumberFormat("fr-CM", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(numPrice)
  }

  const handleStatusChange = async (bookingId: string, newStatus: "CONFIRMED" | "CANCELLED", refNumber: string) => {
    const action = newStatus === "CONFIRMED" ? "confirm" : "cancel"
    if (confirm(`Are you sure you want to ${action} booking ${refNumber}?`)) {
      updateStatusMutation.mutate({ bookingId, status: newStatus })
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bookings Management</h1>
            <p className="text-gray-600">Manage all event bookings</p>
          </div>
          <div className="text-sm text-gray-500">
            Total Bookings: {bookingsData?.totalCount || 0}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filter by status:</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setStatusFilter(undefined)}
                className={`px-3 py-1 text-sm rounded-md ${
                  statusFilter === undefined
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("CONFIRMED")}
                className={`px-3 py-1 text-sm rounded-md ${
                  statusFilter === "CONFIRMED"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Confirmed
              </button>
              <button
                onClick={() => setStatusFilter("CANCELLED")}
                className={`px-3 py-1 text-sm rounded-md ${
                  statusFilter === "CANCELLED"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Cancelled
              </button>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {!bookingsData?.bookings.length ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-600">No bookings match your current filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tickets
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookingsData.bookings.map((booking: any) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.referenceNumber || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-8 w-8 flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                              <User className="h-4 w-4 text-gray-600" />
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              User ID: {booking.userId.slice(0, 8)}...
                            </div>
                            <div className="text-sm text-gray-500">
                              Booking ID: {booking.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            Event ID: {booking.eventId.slice(0, 8)}...
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString("fr-CM") : "N/A"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {booking.quantity} tickets
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {formatPrice(booking.totalAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            booking.status === "CONFIRMED"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {booking.status === "CONFIRMED" ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString("fr-CM") : "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex space-x-2">
                          {booking.status === "CONFIRMED" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(booking.id, "CANCELLED", booking.referenceNumber ?? "N/A")}
                              disabled={updateStatusMutation.isPending}
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Cancel
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(booking.id, "CONFIRMED", booking.referenceNumber ?? "N/A")}
                              disabled={updateStatusMutation.isPending}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Confirm
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {bookingsData && bookingsData.totalPages > 1 && (
          <div className="flex items-center justify-between bg-white px-4 py-3 border-t border-gray-200 sm:px-6 rounded-lg shadow">
            <div className="flex justify-between flex-1 sm:hidden">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(bookingsData.totalPages, page + 1))}
                disabled={page === bookingsData.totalPages}
                className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{page}</span> of{" "}
                  <span className="font-medium">{bookingsData.totalPages}</span>
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(bookingsData.totalPages, page + 1))}
                  disabled={page === bookingsData.totalPages}
                  className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
