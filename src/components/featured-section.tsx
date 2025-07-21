"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, Plus } from "lucide-react"

interface FeaturedSectionProps {
  title: string
}

export function FeaturedSection({ title }: FeaturedSectionProps) {
  const featuredItems = [
    {
      id: 1,
      name: "Poulet DG",
      description: "Grilled chicken with plantains",
      price: 4500,
      rating: 4.8,
      image: "/placeholder.svg?height=120&width=120",
      hasOffer: title === "Daily Specials",
      originalPrice: title === "Daily Specials" ? 5500 : null,
    },
    {
      id: 2,
      name: "Ndolé Deluxe",
      description: "Traditional Cameroonian dish",
      price: 4000,
      rating: 4.9,
      image: "/placeholder.svg?height=120&width=120",
      hasOffer: title === "Daily Specials",
      originalPrice: title === "Daily Specials" ? 4800 : null,
    },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Button variant="ghost" size="sm" className="text-leafy-green">
          See all
        </Button>
      </div>

      <div className="space-y-4">
        {featuredItems.map((item) => (
          <Card key={item.id} className="food-card relative">
            {item.hasOffer && (
              <div className="offer-badge">
                Save {Math.round(((item.originalPrice! - item.price) / item.originalPrice!) * 100)}%
              </div>
            )}
            <CardContent className="p-4">
              <div className="flex space-x-4">
                <div className="relative">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    <Button size="sm" className="bg-leafy-green hover:bg-leafy-green/90 rounded-full h-8 w-8 p-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-leafy-green">{item.price.toLocaleString()} FCFA</span>
                      {item.originalPrice && (
                        <span className="text-sm text-gray-400 line-through">
                          {item.originalPrice.toLocaleString()} FCFA
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{item.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
