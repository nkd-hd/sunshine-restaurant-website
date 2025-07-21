"use client"

import { useState, useMemo } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import type { Id } from "../../../../convex/_generated/dataModel"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  ShoppingCart,
  Clock,
  CheckCircle,
  Package,
  Truck,
  MapPin,
  User,
  Phone,
  Calendar,
  DollarSign,
  Filter,
  AlertCircle,
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

type OrderStatus = "PENDING" | "CONFIRMED" | "PREPARING" | "READY_FOR_PICKUP" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED"

interface Order {
  _id: Id<"orders">
  orderNumber: string
  userId: Id<"users">
  subtotal: number
  deliveryFee: number
  totalAmount: number
  status: OrderStatus
  paymentMethod?: "MTN_MOMO" | "ORANGE_MONEY" | "CASH_ON_DELIVERY"
  paymentStatus: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED"
  specialInstructions?: string
  customerNotes?: string
  adminNotes?: string
  _creationTime: number
}

const orderStatusConfig = {
  PENDING: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Clock,
    canUpdateTo: ["CONFIRMED", "CANCELLED"],
  },
  CONFIRMED: {
    label: "Confirmed",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: CheckCircle,
    canUpdateTo: ["PREPARING", "CANCELLED"],
  },
  PREPARING: {
    label: "Preparing",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: Package,
    canUpdateTo: ["READY_FOR_PICKUP"],
  },
  READY_FOR_PICKUP: {
    label: "Ready",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: Package,
    canUpdateTo: ["OUT_FOR_DELIVERY"],
  },
  OUT_FOR_DELIVERY: {
    label: "Out for Delivery",
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    icon: Truck,
    canUpdateTo: ["DELIVERED"],
  },
  DELIVERED: {
    label: "Delivered",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
    canUpdateTo: [],
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: AlertCircle,
    canUpdateTo: [],
  },
}

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL")
  
  // For now, we'll use a mock orders query since we haven't created the Convex function yet
  // This would be replaced with: const orders = useQuery(api.orders.getAllOrders)
  const orders = [] as Order[] // Mock empty array for now
  
  // Mock mutations - these would be replaced with actual Convex mutations
  const updateOrderStatus = async (orderId: Id<"orders">, status: OrderStatus) => {
    // This would be: useMutation(api.orders.updateOrderStatus)
    toast.success(`Order status updated to ${orderStatusConfig[status].label}!`)
  }

  const filteredOrders = useMemo(() => {
    if (!orders) return []
    if (statusFilter === "ALL") return orders
    return orders.filter(order => order.status === statusFilter)
  }, [orders, statusFilter])

  const orderStats = useMemo(() => {
    if (!orders) return { total: 0, pending: 0, preparing: 0, delivered: 0, cancelled: 0 }
    
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === "PENDING").length,
      preparing: orders.filter(o => ["CONFIRMED", "PREPARING", "READY_FOR_PICKUP"].includes(o.status)).length,
      outForDelivery: orders.filter(o => o.status === "OUT_FOR_DELIVERY").length,
      delivered: orders.filter(o => o.status === "DELIVERED").length,
      cancelled: orders.filter(o => o.status === "CANCELLED").length,
    }
  }, [orders])

  const handleStatusUpdate = async (orderId: Id<"orders">, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus)
    } catch (error) {
      toast.error("Failed to update order status")
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), "MMM dd, yyyy 'at' HH:mm")
  }

  if (orders === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-leafy-green" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShoppingCart className="h-8 w-8 text-leafy-green" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
            <p className="text-gray-600">Manage customer orders and deliveries</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as OrderStatus | "ALL")}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Orders</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="PREPARING">Preparing</SelectItem>
                <SelectItem value="READY_FOR_PICKUP">Ready</SelectItem>
                <SelectItem value="OUT_FOR_DELIVERY">Out for Delivery</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{orderStats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Preparing</CardTitle>
            <Package className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{orderStats.preparing}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out for Delivery</CardTitle>
            <Truck className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{orderStats.outForDelivery}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{orderStats.delivered}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{orderStats.cancelled}</div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>
            {statusFilter === "ALL" ? "All orders" : `${orderStatusConfig[statusFilter as OrderStatus]?.label} orders`} 
            ({filteredOrders.length} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredOrders && filteredOrders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => {
                  const StatusIcon = orderStatusConfig[order.status].icon
                  return (
                    <TableRow key={order._id}>
                      <TableCell className="font-mono text-sm font-medium">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDate(order._creationTime)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">Customer #{order.userId.slice(-6)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(order.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Badge 
                            variant={order.paymentStatus === "COMPLETED" ? "default" : "secondary"}
                            className={order.paymentStatus === "COMPLETED" 
                              ? "bg-green-100 text-green-800 border-green-200"
                              : order.paymentStatus === "FAILED"
                              ? "bg-red-100 text-red-800 border-red-200"
                              : "bg-yellow-100 text-yellow-800 border-yellow-200"
                            }
                          >
                            {order.paymentStatus}
                          </Badge>
                          {order.paymentMethod && (
                            <span className="text-xs text-gray-500 ml-1">
                              ({order.paymentMethod.replace('_', ' ')})
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={orderStatusConfig[order.status].color}
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {orderStatusConfig[order.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {orderStatusConfig[order.status].canUpdateTo.length > 0 && (
                            <Select
                              value={order.status}
                              onValueChange={(value) => handleStatusUpdate(order._id, value as OrderStatus)}
                            >
                              <SelectTrigger className="w-32 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={order.status}>
                                  {orderStatusConfig[order.status].label}
                                </SelectItem>
                                {orderStatusConfig[order.status].canUpdateTo.map((status) => (
                                  <SelectItem key={status} value={status}>
                                    {orderStatusConfig[status].label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {statusFilter === "ALL" ? "No orders yet" : `No ${orderStatusConfig[statusFilter as OrderStatus]?.label.toLowerCase()} orders`}
              </h3>
              <p className="text-gray-600">
                {statusFilter === "ALL" 
                  ? "Orders will appear here once customers start placing them."
                  : "Try adjusting your filter or check back later."
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
