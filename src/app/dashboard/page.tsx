"use client"

import { useState } from "react"
import { Calendar, MapPin, Clock, Download, Eye, LogIn, Filter, Search, QrCode, DollarSign, Users } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import MainLayout from "~/components/layout/main-layout"
import { Button } from "~/components/ui/button"
import { api } from "~/trpc/react"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [statusFilter, setStatusFilter] = useState<"all" | "CONFIRMED" | "CANCELLED">("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [showUpcoming, setShowUpcoming] = useState(true)

  // Fetch user bookings and stats
  const { data: bookingsData, isLoading: bookingsLoading, refetch } = api.bookings.getUserBookings.useQuery(
    { limit: 50 },
    { enabled: !!session }
  )

  const { data: stats, isLoading: statsLoading } = api.bookings.getStats.useQuery(
    undefined,
    { enabled: !!session }
  )

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return new Intl.NumberFormat("fr-CM", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(numPrice)
  }

  const handleDownloadTicket = (booking: any) => {
    const ticketContent = `
EVENT TICKET
============
Reference: ${booking.referenceNumber}
Event: ${booking.event?.name || "N/A"}
Date: ${booking.event?.date ? new Date(booking.event.date).toLocaleDateString() : "N/A"} at ${booking.event?.time || "N/A"}
Venue: ${booking.event?.venue || "N/A"}, ${booking.event?.location || "N/A"}
Tickets: ${booking.quantity}
Total: ${formatPrice(booking.totalAmount)}

IMPORTANT:
- Arrive 30 minutes early
- Bring valid ID
- Present this ticket at the venue

Organized by: ${booking.event?.organizer || "N/A"}
Booking Date: ${new Date(booking.bookingDate).toLocaleDateString()}
Status: ${booking.status}
    `.trim()

    const blob = new Blob([ticketContent], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ticket-${booking.referenceNumber}.txt`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Filter bookings based on status and search
  const filteredBookings = bookingsData?.bookings.filter((booking: any) => {
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter
    const matchesSearch = !searchTerm ||
      booking.event?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase())

    const eventDate = booking.event?.date ? new Date(booking.event.date) : null
    const isUpcoming = eventDate ? eventDate > new Date() : false
    const matchesTimeFilter = showUpcoming ? isUpcoming : !isUpcoming

    return matchesStatus && matchesSearch && matchesTimeFilter
  }) || []

  // Show login prompt if not authenticated
  if (status === "loading") {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!session) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <LogIn className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Please sign in to view your dashboard</h3>
            <p className="text-gray-600 mb-6">You need to be logged in to see your bookings and account information</p>
            <Link
              href="/api/auth/signin"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </MainLayout>
    )
  }

  const bookings = bookingsData?.bookings ?? []
  const isLoading = bookingsLoading || statsLoading

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Dashboard</h1>
          <p className="text-gray-600">Manage your bookings and account</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Time Filter */}
            <div className="flex bg-gray-100 rounded-md p-1">
              <button
                onClick={() => setShowUpcoming(true)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  showUpcoming
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setShowUpcoming(false)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  !showUpcoming
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Past Events
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? "..." : stats?.totalBookings ?? 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Confirmed Bookings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? "..." : stats?.confirmedBookings ?? 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MapPin className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? "..." : formatPrice(stats?.totalSpent ?? 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                {showUpcoming ? "Upcoming Events" : "Past Events"}
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({filteredBookings.length} {filteredBookings.length === 1 ? 'booking' : 'bookings'})
                </span>
              </h2>
              <Button
                onClick={() => refetch()}
                variant="outline"
                size="sm"
              >
                Refresh
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading bookings...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="p-6 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? "No matching bookings" : showUpcoming ? "No upcoming events" : "No past events"}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm
                  ? "Try adjusting your search or filters"
                  : showUpcoming
                    ? "Start exploring events to make your first booking"
                    : "You haven't attended any events yet"
                }
              </p>
              {!searchTerm && showUpcoming && (
                <Link
                  href="/events"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Browse Events
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tickets
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookings.map((booking: any) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{booking.event.name}</div>
                          <div className="text-sm text-gray-500">
                            {booking.event.venue}, {booking.event.location}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {booking.event.date.toLocaleDateString("fr-CM")}
                        </div>
                        <div className="text-sm text-gray-500">{booking.event.time}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{booking.quantity}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatPrice(booking.totalAmount)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          booking.status === 'CONFIRMED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            href={`/booking-confirmation/${booking.id}`}
                            className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Link>
                          <button
                            onClick={() => handleDownloadTicket(booking)}
                            className="text-green-600 hover:text-green-900 inline-flex items-center"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Ticket
                          </button>
                          <button
                            onClick={() => alert("QR Code view coming soon!")}
                            className="text-purple-600 hover:text-purple-900 inline-flex items-center"
                          >
                            <QrCode className="h-4 w-4 mr-1" />
                            QR
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
