"use client"

import { useState } from "react"
import { ShoppingCart, MapPin, Clock, Eye, LogIn, Search, DollarSign, UtensilsCrossed, Truck, CheckCircle, Phone, Calendar, Download, QrCode } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import MainLayout from "~/components/layout/main-layout"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "DELIVERED" | "CANCELLED">("ALL")
  const [searchTerm, setSearchTerm] = useState("")

  // Mock orders data - would be replaced with actual Convex queries
  const mockOrders = [
    {
      id: "1",
      orderNumber: "SUN-2024-001",
      items: [
        { name: "Ndolé (Peanut Spinach Stew)", quantity: 2, price: 3500 },
        { name: "Jollof Rice with Grilled Chicken", quantity: 1, price: 4500 }
      ],
      totalAmount: 11500,
      deliveryFee: 1500,
      status: "DELIVERED",
      orderDate: "2024-07-18T14:30:00Z",
      estimatedDelivery: "2024-07-18T15:30:00Z",
      deliveryAddress: "Centre Ville, Yaoundé",
      paymentMethod: "MTN_MOMO",
      paymentStatus: "COMPLETED"
    },
    {
      id: "2",
      orderNumber: "SUN-2024-002",
      items: [
        { name: "Fresh Ginger Beer", quantity: 3, price: 1000 },
        { name: "Coconut Rice Pudding", quantity: 2, price: 2500 }
      ],
      totalAmount: 8000,
      deliveryFee: 1500,
      status: "PENDING",
      orderDate: "2024-07-20T16:00:00Z",
      estimatedDelivery: "2024-07-20T17:00:00Z",
      deliveryAddress: "Bastos, Yaoundé",
      paymentMethod: "ORANGE_MONEY",
      paymentStatus: "PENDING"
    }
  ]

  const orders = mockOrders
  const isLoading = false

  // Calculate stats from orders
  const stats = {
    totalOrders: orders.length,
    confirmedOrders: orders.filter(o => o.status !== "CANCELLED").length,
    totalSpent: orders.reduce((sum, order) => sum + order.totalAmount + order.deliveryFee, 0)
  }

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return new Intl.NumberFormat("fr-CM", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(numPrice)
  }

  const getOrderStatusBadge = (status: string) => {
    const configs = {
      PENDING: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock },
      CONFIRMED: { color: "bg-blue-100 text-blue-800 border-blue-200", icon: CheckCircle },
      PREPARING: { color: "bg-orange-100 text-orange-800 border-orange-200", icon: UtensilsCrossed },
      OUT_FOR_DELIVERY: { color: "bg-indigo-100 text-indigo-800 border-indigo-200", icon: Truck },
      DELIVERED: { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
      CANCELLED: { color: "bg-red-100 text-red-800 border-red-200", icon: Eye }
    }
    return configs[status] || configs.PENDING
  }

  // Filter orders based on status and search
  const filteredOrders = orders.filter((order: any) => {
    const matchesStatus = statusFilter === "ALL" || order.status === statusFilter
    const matchesSearch = !searchTerm ||
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))

    return matchesStatus && matchesSearch
  })

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
            <h3 className="text-lg font-medium text-gray-900 mb-2">Please sign in to view your orders</h3>
            <p className="text-gray-600 mb-6">You need to be logged in to see your order history and account information</p>
            <Link
              href="/api/auth/signin"
              className="bg-leafy-green text-white px-6 py-3 rounded-md hover:bg-leafy-green/90 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">View your order history and track deliveries</p>
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
                  placeholder="Search orders..."
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
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? "..." : stats.totalOrders}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Confirmed Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? "..." : stats.confirmedOrders}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? "..." : formatPrice(stats.totalSpent)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Orders
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'})
                </span>
              </h2>
              <Button
                onClick={() => window.location.reload()}
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
              <p className="mt-2 text-gray-600">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-6 text-center">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? "No matching orders" : "No orders yet"}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm
                  ? "Try adjusting your search or filters"
                  : "Start exploring our delicious menu to place your first order"
                }
              </p>
              {!searchTerm && (
                <Link
                  href="/menu"
                  className="bg-leafy-green text-white px-4 py-2 rounded-md hover:bg-leafy-green/90 transition-colors"
                >
                  Browse Menu
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
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
                  {filteredOrders.map((order: any) => {
                    const statusConfig = getOrderStatusBadge(order.status)
                    const StatusIcon = statusConfig.icon
                    return (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                            <div className="text-sm text-gray-500">
                              {order.deliveryAddress}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {order.items.map((item: any, index: number) => (
                              <div key={index} className="truncate">
                                {item.quantity}x {item.name}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {new Date(order.orderDate).toLocaleDateString("fr-CM")}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(order.orderDate).toLocaleTimeString("fr-CM", { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {formatPrice(order.totalAmount + order.deliveryFee)}
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={`${statusConfig.color} flex items-center w-fit`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {order.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => alert("Order details view coming soon!")}
                              className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </button>
                            {order.status === 'DELIVERED' && (
                              <button
                                onClick={() => alert("Reorder functionality coming soon!")}
                                className="text-green-600 hover:text-green-900 inline-flex items-center"
                              >
                                <ShoppingCart className="h-4 w-4 mr-1" />
                                Reorder
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
