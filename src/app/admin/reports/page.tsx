"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import {
  FileText,
  Download,
  Calendar,
  User,
  CalendarDays,
  Filter,
  BarChart3,
  DollarSign,
  Users,
  Ticket,
} from "lucide-react"
import AdminLayout from "~/components/admin/admin-layout"
import { Button } from "~/components/ui/button"
import { api } from "~/trpc/react"

export default function AdminReportsPage() {
  const { data: session } = useSession()
  const [reportType, setReportType] = useState<"date" | "event" | "user">("date")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedEventId, setSelectedEventId] = useState("")
  const [selectedUserId, setSelectedUserId] = useState("")

  // Get events for dropdown
  const { data: eventsData } = api.events.getAll.useQuery({
    offset: 0,
    limit: 100,
  })

  // Get users for dropdown
  const { data: usersData } = api.admin.getUsers.useQuery({
    page: 1,
    limit: 100,
  })

  // Generate report query
  const { data: reportData, isLoading, refetch } = api.admin.generateReport.useQuery(
    {
      type: reportType,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      eventId: selectedEventId || undefined,
      userId: selectedUserId || undefined,
    },
    {
      enabled: false, // Only run when manually triggered
    }
  )

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return new Intl.NumberFormat("fr-CM", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(numPrice)
  }

  const handleGenerateReport = () => {
    refetch()
  }

  const handleExportCSV = () => {
    if (!reportData?.bookings.length) return

    const headers = [
      "Reference Number",
      "User Name",
      "User Email",
      "Event Name",
      "Event Date",
      "Venue",
      "Location",
      "Quantity",
      "Total Amount",
      "Status",
      "Booking Date",
    ]

    const csvData = reportData.bookings.map(booking => [
      booking.referenceNumber || "N/A",
      booking.user?.name || "N/A",
      booking.user?.email || "N/A",
      booking.event?.name || "N/A",
      booking.event?.date ? new Date(booking.event.date).toLocaleDateString() : "N/A",
      booking.event?.venue || "N/A",
      booking.event?.location || "N/A",
      booking.quantity,
      booking.totalAmount,
      booking.status,
      new Date(booking.bookingDate).toLocaleDateString(),
    ])

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `bookings-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-600">Generate and export booking reports</p>
          </div>
        </div>

        {/* Report Filters */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Report Filters</h2>
          
          {/* Report Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <div className="flex space-x-4">
              <button
                onClick={() => setReportType("date")}
                className={`flex items-center px-4 py-2 rounded-md border ${
                  reportType === "date"
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Calendar className="h-4 w-4 mr-2" />
                By Date Range
              </button>
              <button
                onClick={() => setReportType("event")}
                className={`flex items-center px-4 py-2 rounded-md border ${
                  reportType === "event"
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <CalendarDays className="h-4 w-4 mr-2" />
                By Event
              </button>
              <button
                onClick={() => setReportType("user")}
                className={`flex items-center px-4 py-2 rounded-md border ${
                  reportType === "user"
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <User className="h-4 w-4 mr-2" />
                By User
              </button>
            </div>
          </div>

          {/* Date Range Filters */}
          {reportType === "date" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Event Filter */}
          {reportType === "event" && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Event
              </label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select an event</option>
                {eventsData?.events.map((event: any) => (
                  <option key={event.id} value={event.id}>
                    {event.name} - {new Date(event.date).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* User Filter */}
          {reportType === "user" && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select User
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a user</option>
                {usersData?.users.map((user: any) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Generate Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleGenerateReport}
              disabled={isLoading}
              className="flex items-center"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              {isLoading ? "Generating..." : "Generate Report"}
            </Button>
          </div>
        </div>

        {/* Report Results */}
        {reportData && (
          <div className="space-y-6">
            {/* Summary Statistics */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Report Summary</h2>
                <Button
                  onClick={handleExportCSV}
                  variant="outline"
                  className="flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-600">Total Bookings</p>
                      <p className="text-2xl font-bold text-blue-900">{reportData.summary.totalBookings}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-green-900">{formatPrice(reportData.summary.totalRevenue)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Ticket className="h-8 w-8 text-purple-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-purple-600">Total Tickets</p>
                      <p className="text-2xl font-bold text-purple-900">{reportData.summary.totalTickets}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-yellow-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-yellow-600">Confirmed</p>
                      <p className="text-2xl font-bold text-yellow-900">{reportData.summary.confirmedBookings}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Booking Details</h3>
              </div>
              
              {reportData.bookings.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                  <p className="text-gray-600">No bookings match your selected criteria</p>
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
                          Quantity
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
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.bookings.map((booking: any) => (
                        <tr key={booking.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {booking.referenceNumber || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {booking.user?.name || "N/A"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {booking.user?.email || "N/A"}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {booking.event?.name || "N/A"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {booking.event?.venue}, {booking.event?.location}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {booking.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatPrice(booking.totalAmount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                booking.status === "CONFIRMED"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(booking.bookingDate).toLocaleDateString("fr-CM")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
