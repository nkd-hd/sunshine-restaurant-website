"use client"

import { ArrowLeft, Truck, Clock, Utensils, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface OrderTypeSelectorProps {
  onBack: () => void
}

export function OrderTypeSelector({ onBack }: OrderTypeSelectorProps) {
  const orderTypes = [
    {
      id: "delivery",
      icon: Truck,
      title: "Delivery",
      subtitle: "Get it delivered to your doorstep",
      color: "bg-leafy-green",
    },
    {
      id: "pickup",
      icon: Clock,
      title: "Pickup",
      subtitle: "Skip the wait, grab and go",
      color: "bg-wooden-brown",
    },
    {
      id: "dine-in",
      icon: Utensils,
      title: "Dine-In",
      subtitle: "Enjoy at our restaurant",
      color: "bg-gray-600",
    },
    {
      id: "catering",
      icon: Users,
      title: "Catering",
      subtitle: "For groups and events",
      color: "bg-orange-500",
    },
  ]

  return (
    <div className="mobile-container">
      <div className="mobile-header">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Let's start your order</h1>
        <div></div>
      </div>

      <div className="mobile-content space-y-4 pt-8">
        {orderTypes.map((type) => (
          <Card key={type.id} className="food-card hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className={`${type.color} p-3 rounded-full`}>
                  <type.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{type.title}</h3>
                  <p className="text-gray-500 text-sm">{type.subtitle}</p>
                </div>
                <ArrowLeft className="h-5 w-5 text-gray-400 rotate-180" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
