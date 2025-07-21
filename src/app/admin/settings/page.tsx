"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Settings,
  Store,
  MapPin,
  Phone,
  Mail,
  Clock,
  DollarSign,
  Truck,
  MessageSquare,
  Globe,
  Shield,
  Save,
  AlertCircle,
} from "lucide-react"
import { toast } from "sonner"

interface RestaurantConfig {
  name: string
  description?: string
  phone?: string
  email?: string
  address?: string
  deliveryFee: number
  minimumOrderAmount?: number
  estimatedDeliveryTime?: number
  isOpen: "OPEN" | "CLOSED" | "TEMPORARILY_CLOSED"
  operatingHours?: {
    [key: string]: {
      open: string
      close: string
      isOpen: boolean
    }
  }
  aboutUs?: string
}

interface DeliveryZone {
  _id: string
  name: string
  description?: string
  deliveryFee?: number
  estimatedDeliveryTime?: number
  isActive: "ACTIVE" | "INACTIVE"
}

// Mock data - would be replaced with actual Convex queries
const getMockConfig = (): RestaurantConfig => ({
  name: "Sunshine Restaurant",
  description: "Authentic Cameroonian cuisine delivered to your doorstep in Yaoundé",
  phone: "+237 6XX XXX XXX",
  email: "contact@sunshinerestaurant.cm",
  address: "Centre Ville, Yaoundé, Cameroon",
  deliveryFee: 1500,
  minimumOrderAmount: 3000,
  estimatedDeliveryTime: 35,
  isOpen: "OPEN",
  operatingHours: {
    monday: { open: "08:00", close: "22:00", isOpen: true },
    tuesday: { open: "08:00", close: "22:00", isOpen: true },
    wednesday: { open: "08:00", close: "22:00", isOpen: true },
    thursday: { open: "08:00", close: "22:00", isOpen: true },
    friday: { open: "08:00", close: "23:00", isOpen: true },
    saturday: { open: "08:00", close: "23:00", isOpen: true },
    sunday: { open: "10:00", close: "21:00", isOpen: true },
  },
  aboutUs: "Welcome to Sunshine Restaurant! We bring you the authentic taste of Cameroon with our carefully prepared traditional dishes. From aromatic Ndolé to perfectly seasoned Jollof Rice, every meal is crafted with love and the finest local ingredients.",
})

const getMockDeliveryZones = (): DeliveryZone[] => [
  { _id: "1", name: "Centre Ville", deliveryFee: 1000, estimatedDeliveryTime: 25, isActive: "ACTIVE" },
  { _id: "2", name: "Bastos", deliveryFee: 1500, estimatedDeliveryTime: 30, isActive: "ACTIVE" },
  { _id: "3", name: "Mvan", deliveryFee: 2000, estimatedDeliveryTime: 35, isActive: "ACTIVE" },
  { _id: "4", name: "Emombo", deliveryFee: 2500, estimatedDeliveryTime: 40, isActive: "ACTIVE" },
  { _id: "5", name: "Nlongkak", deliveryFee: 3000, estimatedDeliveryTime: 45, isActive: "INACTIVE" },
]

export default function SettingsPage() {
  // Mock data - would be replaced with actual Convex queries
  const config = getMockConfig()
  const deliveryZones = getMockDeliveryZones()

  const [restaurantForm, setRestaurantForm] = useState(config)
  const [operatingHours, setOperatingHours] = useState(config.operatingHours || {})

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ]

  const handleRestaurantSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Mock mutation - would be replaced with actual Convex mutation
      // await updateRestaurantConfig(restaurantForm)
      toast.success("Restaurant settings updated successfully!")
    } catch (error) {
      toast.error("Failed to update settings")
    }
  }

  const handleOperatingHoursSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Mock mutation - would be replaced with actual Convex mutation
      // await updateOperatingHours(operatingHours)
      toast.success("Operating hours updated successfully!")
    } catch (error) {
      toast.error("Failed to update operating hours")
    }
  }

  const toggleDayStatus = (day: string) => {
    setOperatingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        isOpen: !prev[day]?.isOpen
      }
    }))
  }

  const updateDayHours = (day: string, field: 'open' | 'close', value: string) => {
    setOperatingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-leafy-green" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Configure your restaurant settings and preferences</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="restaurant" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="restaurant">Restaurant Info</TabsTrigger>
          <TabsTrigger value="delivery">Delivery Zones</TabsTrigger>
          <TabsTrigger value="hours">Operating Hours</TabsTrigger>
        </TabsList>

        {/* Restaurant Information */}
        <TabsContent value="restaurant">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Restaurant Information
              </CardTitle>
              <CardDescription>
                Basic information about your restaurant that will be displayed to customers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRestaurantSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Restaurant Name *</Label>
                    <Input
                      id="name"
                      value={restaurantForm.name}
                      onChange={(e) => setRestaurantForm({ ...restaurantForm, name: e.target.value })}
                      placeholder="Your restaurant name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={restaurantForm.phone || ''}
                      onChange={(e) => setRestaurantForm({ ...restaurantForm, phone: e.target.value })}
                      placeholder="+237 6XX XXX XXX"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={restaurantForm.email || ''}
                      onChange={(e) => setRestaurantForm({ ...restaurantForm, email: e.target.value })}
                      placeholder="contact@yourrestaurant.cm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Restaurant Status</Label>
                    <Select 
                      value={restaurantForm.isOpen} 
                      onValueChange={(value) => setRestaurantForm({ ...restaurantForm, isOpen: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OPEN">Open</SelectItem>
                        <SelectItem value="CLOSED">Closed</SelectItem>
                        <SelectItem value="TEMPORARILY_CLOSED">Temporarily Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={restaurantForm.address || ''}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, address: e.target.value })}
                    placeholder="Your restaurant address in Yaoundé"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={restaurantForm.description || ''}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, description: e.target.value })}
                    placeholder="Brief description of your restaurant"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="deliveryFee">Default Delivery Fee (XAF)</Label>
                    <Input
                      id="deliveryFee"
                      type="number"
                      value={restaurantForm.deliveryFee}
                      onChange={(e) => setRestaurantForm({ ...restaurantForm, deliveryFee: parseInt(e.target.value) })}
                      placeholder="1500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minimumOrder">Minimum Order Amount (XAF)</Label>
                    <Input
                      id="minimumOrder"
                      type="number"
                      value={restaurantForm.minimumOrderAmount || 0}
                      onChange={(e) => setRestaurantForm({ ...restaurantForm, minimumOrderAmount: parseInt(e.target.value) })}
                      placeholder="3000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deliveryTime">Estimated Delivery Time (minutes)</Label>
                    <Input
                      id="deliveryTime"
                      type="number"
                      value={restaurantForm.estimatedDeliveryTime || 0}
                      onChange={(e) => setRestaurantForm({ ...restaurantForm, estimatedDeliveryTime: parseInt(e.target.value) })}
                      placeholder="35"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aboutUs">About Us</Label>
                  <Textarea
                    id="aboutUs"
                    value={restaurantForm.aboutUs || ''}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, aboutUs: e.target.value })}
                    placeholder="Tell customers about your restaurant, cuisine, and story"
                    rows={5}
                  />
                </div>

                <Button type="submit" className="bg-leafy-green hover:bg-leafy-green/90">
                  <Save className="h-4 w-4 mr-2" />
                  Save Restaurant Settings
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery Zones */}
        <TabsContent value="delivery">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Zones
              </CardTitle>
              <CardDescription>
                Manage delivery areas in Yaoundé with custom fees and delivery times.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deliveryZones.map((zone) => (
                  <div key={zone._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{zone.name}</h4>
                          <Badge 
                            variant={zone.isActive === "ACTIVE" ? "default" : "secondary"}
                            className={zone.isActive === "ACTIVE" 
                              ? "bg-green-100 text-green-800 border-green-200" 
                              : "bg-gray-100 text-gray-800 border-gray-200"
                            }
                          >
                            {zone.isActive}
                          </Badge>
                        </div>
                        {zone.description && (
                          <p className="text-sm text-gray-600">{zone.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>{formatCurrency(zone.deliveryFee || 0)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{zone.estimatedDeliveryTime}min</span>
                      </div>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
                
                <div className="pt-4 border-t">
                  <Button className="bg-leafy-green hover:bg-leafy-green/90">
                    <MapPin className="h-4 w-4 mr-2" />
                    Add New Zone
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Operating Hours */}
        <TabsContent value="hours">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Operating Hours
              </CardTitle>
              <CardDescription>
                Set your restaurant's opening and closing times for each day of the week.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleOperatingHoursSubmit} className="space-y-6">
                <div className="space-y-4">
                  {days.map((day) => {
                    const dayHours = operatingHours[day.key] || { open: '08:00', close: '22:00', isOpen: true }
                    return (
                      <div key={day.key} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="w-24">
                          <p className="font-medium">{day.label}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={dayHours.isOpen}
                            onCheckedChange={() => toggleDayStatus(day.key)}
                          />
                          <span className="text-sm text-gray-600">
                            {dayHours.isOpen ? 'Open' : 'Closed'}
                          </span>
                        </div>
                        {dayHours.isOpen && (
                          <div className="flex items-center gap-2">
                            <Input
                              type="time"
                              value={dayHours.open}
                              onChange={(e) => updateDayHours(day.key, 'open', e.target.value)}
                              className="w-32"
                            />
                            <span className="text-gray-500">to</span>
                            <Input
                              type="time"
                              value={dayHours.close}
                              onChange={(e) => updateDayHours(day.key, 'close', e.target.value)}
                              className="w-32"
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                <Button type="submit" className="bg-leafy-green hover:bg-leafy-green/90">
                  <Save className="h-4 w-4 mr-2" />
                  Save Operating Hours
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
