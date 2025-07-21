"use client"

import { useState, useMemo } from "react"
import { useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Clock,
  Calendar,
  Eye,
  Star,
  MapPin,
} from "lucide-react"
import { format, subDays, startOfDay, endOfDay } from "date-fns"

type TimeRange = "7d" | "30d" | "90d" | "1y"

interface AnalyticsData {
  revenue: {
    total: number
    previousPeriod: number
    change: number
    changePercent: number
  }
  orders: {
    total: number
    previousPeriod: number
    change: number
    changePercent: number
    avgOrderValue: number
  }
  customers: {
    total: number
    new: number
    returning: number
  }
  popularMeals: Array<{
    id: string
    name: string
    orders: number
    revenue: number
    rating: number
  }>
  dailyStats: Array<{
    date: string
    revenue: number
    orders: number
    customers: number
  }>
  deliveryZones: Array<{
    zone: string
    orders: number
    revenue: number
    avgDeliveryTime: number
  }>
}

// Mock data for demonstration - would be replaced with actual Convex queries
const getMockAnalytics = (timeRange: TimeRange): AnalyticsData => {
  const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : timeRange === "90d" ? 90 : 365
  
  return {
    revenue: {
      total: 2450000 + Math.random() * 500000,
      previousPeriod: 2200000 + Math.random() * 400000,
      change: 250000,
      changePercent: 11.4,
    },
    orders: {
      total: 487 + Math.floor(Math.random() * 100),
      previousPeriod: 423 + Math.floor(Math.random() * 80),
      change: 64,
      changePercent: 15.1,
      avgOrderValue: 5030,
    },
    customers: {
      total: 234 + Math.floor(Math.random() * 50),
      new: 89 + Math.floor(Math.random() * 20),
      returning: 145 + Math.floor(Math.random() * 30),
    },
    popularMeals: [
      { id: "1", name: "Ndolé (Peanut Spinach Stew)", orders: 89, revenue: 890000, rating: 4.8 },
      { id: "2", name: "Jollof Rice with Grilled Chicken", orders: 76, revenue: 760000, rating: 4.7 },
      { id: "3", name: "Bissap (Hibiscus Tea)", orders: 134, revenue: 268000, rating: 4.9 },
      { id: "4", name: "Fresh Ginger Beer", orders: 98, revenue: 294000, rating: 4.6 },
      { id: "5", name: "Coconut Rice Pudding", orders: 67, revenue: 536000, rating: 4.8 },
    ],
    dailyStats: Array.from({ length: days }, (_, i) => {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd')
      return {
        date,
        revenue: 80000 + Math.random() * 60000,
        orders: 15 + Math.floor(Math.random() * 25),
        customers: 8 + Math.floor(Math.random() * 15),
      }
    }).reverse(),
    deliveryZones: [
      { zone: "Centre Ville", orders: 156, revenue: 1560000, avgDeliveryTime: 28 },
      { zone: "Bastos", orders: 123, revenue: 1476000, avgDeliveryTime: 32 },
      { zone: "Mvan", orders: 89, revenue: 890000, avgDeliveryTime: 35 },
      { zone: "Emombo", orders: 76, revenue: 684000, avgDeliveryTime: 40 },
      { zone: "Nlongkak", orders: 43, revenue: 387000, avgDeliveryTime: 45 },
    ],
  }
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d")
  
  // Mock data - would be replaced with actual Convex queries
  const analyticsData = getMockAnalytics(timeRange)
  
  // Get meal stats from existing Convex function
  const mealStats = useQuery(api.meals.getMealStats)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercent = (percent: number) => {
    const sign = percent > 0 ? '+' : ''
    return `${sign}${percent.toFixed(1)}%`
  }

  const getTimeRangeLabel = (range: TimeRange) => {
    switch (range) {
      case "7d": return "Last 7 days"
      case "30d": return "Last 30 days"
      case "90d": return "Last 90 days"
      case "1y": return "Last year"
    }
  }

  if (!analyticsData) {
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
          <BarChart3 className="h-8 w-8 text-leafy-green" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600">Business insights and performance metrics</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analyticsData.revenue.total)}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {analyticsData.revenue.changePercent > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span className={analyticsData.revenue.changePercent > 0 ? "text-green-600" : "text-red-600"}>
                {formatPercent(analyticsData.revenue.changePercent)}
              </span>
              <span>vs previous period</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.orders.total}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {analyticsData.orders.changePercent > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span className={analyticsData.orders.changePercent > 0 ? "text-green-600" : "text-red-600"}>
                {formatPercent(analyticsData.orders.changePercent)}
              </span>
              <span>vs previous period</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analyticsData.orders.avgOrderValue)}</div>
            <p className="text-xs text-muted-foreground">Per order average</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.customers.total}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.customers.new} new, {analyticsData.customers.returning} returning
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Meals */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Meals</CardTitle>
            <CardDescription>
              Top performing meals in {getTimeRangeLabel(timeRange).toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.popularMeals.map((meal, index) => (
                <div key={meal.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-leafy-green text-white flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{meal.name}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{meal.orders} orders</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{meal.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{formatCurrency(meal.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Delivery Zones */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Zones</CardTitle>
            <CardDescription>
              Performance by delivery area in Yaoundé
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.deliveryZones.map((zone) => (
                <div key={zone.zone} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-leafy-green" />
                    <div>
                      <p className="font-medium text-sm">{zone.zone}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{zone.orders} orders</span>
                        <span>•</span>
                        <Clock className="h-3 w-3" />
                        <span>{zone.avgDeliveryTime}min avg</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{formatCurrency(zone.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Menu Performance */}
      {mealStats && (
        <Card>
          <CardHeader>
            <CardTitle>Menu Overview</CardTitle>
            <CardDescription>
              Current menu statistics and availability
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{mealStats.total}</div>
                <p className="text-sm text-gray-600">Total Meals</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{mealStats.available}</div>
                <p className="text-sm text-gray-600">Available</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{mealStats.outOfStock}</div>
                <p className="text-sm text-gray-600">Out of Stock</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{mealStats.discontinued}</div>
                <p className="text-sm text-gray-600">Discontinued</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{mealStats.featured}</div>
                <p className="text-sm text-gray-600">Featured</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Performance Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Performance</CardTitle>
          <CardDescription>
            Revenue and order trends over {getTimeRangeLabel(timeRange).toLowerCase()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chart Coming Soon</h3>
              <p className="text-gray-600">Daily performance charts will be implemented here</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
