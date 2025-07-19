"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import {
  Users,
  Calendar,
  BookOpen,
  DollarSign,
  TrendingUp,
  Clock,
} from "lucide-react"
import AdminLayout from "~/components/admin/admin-layout"
import { api } from "~/trpc/react"

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Redirect if not admin
  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin?callbackUrl=/admin")
      return
    }
  }, [session, status, router])

  const { data: stats, isLoading, error } = api.admin.getDashboardStats.useQuery(
    undefined,
    { enabled: !!session }
  )

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-CM", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (status === "loading" || isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">
            <h3 className="font-medium">Access Denied</h3>
            <p className="mt-1 text-sm">
              {error.message || "You don't have permission to access the admin panel."}
            </p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!stats) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">No data available</p>
        </div>
      </AdminLayout>
    )
  }

  const statCards = [
    {
      name: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-blue-500",
      change: "+12%",
      changeType: "increase",
    },
    {
      name: "Total Events",
      value: stats.totalEvents,
      icon: Calendar,
      color: "bg-green-500",
      change: "+5%",
      changeType: "increase",
    },
    {
      name: "Total Bookings",
      value: stats.totalBookings,
      icon: BookOpen,
      color: "bg-purple-500",
      change: "+18%",
      changeType: "increase",
    },
    {
      name: "Total Revenue",
      value: formatPrice(stats.totalRevenue),
      icon: DollarSign,
      color: "bg-yellow-500",
      change: "+25%",
      changeType: "increase",
    },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`${stat.color} rounded-md p-3`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stat.value}
                        </div>
                        <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          {stat.change}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Bookings */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Bookings
            </h3>
            {stats.recentBookings.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No recent bookings</p>
              </div>
            ) : (
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reference
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Event
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
                    {stats.recentBookings.map((booking: any) => (
                      <tr key={booking.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {booking.referenceNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>
                            <div className="font-medium text-gray-900">
                              {booking.user?.name || "Unknown"}
                            </div>
                            <div className="text-gray-500">{booking.user?.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>
                            <div className="font-medium text-gray-900">
                              {booking.event?.name || "Unknown Event"}
                            </div>
                            <div className="text-gray-500 flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {booking.event?.date?.toLocaleDateString("fr-CM")}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatPrice(parseFloat(booking.totalAmount))}
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {booking.createdAt?.toLocaleDateString("fr-CM")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
