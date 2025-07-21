"use client"

import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  UtensilsCrossed, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Users,
  Clock,
  Star,
  AlertCircle
} from "lucide-react"

function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
}: {
  title: string
  value: string | number
  subtitle: string
  icon: React.ElementType
  trend?: "up" | "down" | "neutral"
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs ${
          trend === "up" ? "text-green-600" : 
          trend === "down" ? "text-red-600" : 
          "text-muted-foreground"
        }`}>
          {subtitle}
        </p>
      </CardContent>
    </Card>
  )
}

export default function AdminDashboard() {
  // Get meal statistics
  const mealStats = useQuery(api.meals.getMealStats)
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          🌞 Sunshine Restaurant Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome to your restaurant management system
        </p>
      </div>
      
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Meals"
          value={mealStats?.total || 0}
          subtitle="In your menu"
          icon={UtensilsCrossed}
          trend="neutral"
        />
        
        <StatsCard
          title="Available Meals"
          value={mealStats?.available || 0}
          subtitle="Ready to order"
          icon={TrendingUp}
          trend="up"
        />
        
        <StatsCard
          title="Featured Items"
          value={mealStats?.featured || 0}
          subtitle="Highlighted meals"
          icon={Star}
          trend="neutral"
        />
        
        <StatsCard
          title="Out of Stock"
          value={mealStats?.outOfStock || 0}
          subtitle="Need attention"
          icon={AlertCircle}
          trend={mealStats?.outOfStock ? "down" : "neutral"}
        />
      </div>
      
      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5 text-leafy-green" />
              <CardTitle className="text-lg">Meal Management</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Add, edit, and manage your restaurant's meals
            </p>
            <div className="flex gap-2">
              <a 
                href="/admin/meals/new" 
                className="inline-flex items-center gap-1 text-sm text-leafy-green hover:text-leafy-green/80"
              >
                + Add New Meal
              </a>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-wooden-brown" />
              <CardTitle className="text-lg">Orders</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              View and manage customer orders
            </p>
            <div className="flex gap-2">
              <a 
                href="/admin/orders" 
                className="inline-flex items-center gap-1 text-sm text-wooden-brown hover:text-wooden-brown/80"
              >
                View Orders →
              </a>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Restaurant Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Configure restaurant information and settings
            </p>
            <div className="flex gap-2">
              <a 
                href="/admin/settings" 
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-600/80"
              >
                Manage Settings →
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-sm">Database</p>
                <p className="text-xs text-muted-foreground">Connected</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-sm">Menu System</p>
                <p className="text-xs text-muted-foreground">Operational</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div>
                <p className="font-medium text-sm">WhatsApp Integration</p>
                <p className="text-xs text-muted-foreground">Coming Soon</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
