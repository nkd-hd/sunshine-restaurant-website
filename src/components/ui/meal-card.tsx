"use client"

import { Star, Clock, Plus, Heart, ChefHat } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Card, CardContent } from "./card"
import { Button } from "./button"
import { Badge } from "./badge"
import { Avatar, AvatarImage, AvatarFallback } from "./avatar"
import { cn } from "~/lib/utils"

interface MealCardProps {
  meal: {
    _id: string
    name: string
    description: string
    price: number
    imageUrl?: string
    preparationTime?: number
    calories?: number
    isVegetarian?: string
    isVegan?: string
    isHalal?: string
    isGlutenFree?: string
    isAvailable?: string
  }
  className?: string
  onAddToCart?: (mealId: string) => void
}

export function MealCard({ meal, className, onAddToCart }: MealCardProps) {
  const { data: session } = useSession()

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} F`
  }

  return (
    <Card className={cn(
      "group overflow-hidden bg-white rounded-lg shadow-food-card hover:shadow-food-card-hover transition-all duration-200 border border-leafy-green/10",
      className
    )}>
      <CardContent className="p-0">
        {/* Image Container - Clean placeholder */}
        <div className="aspect-square bg-gray-100 overflow-hidden mb-4 relative">
          {meal.imageUrl ? (
            <img
              src={meal.imageUrl}
              alt={meal.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                <ChefHat className="w-8 h-8 text-gray-400" />
              </div>
              <span className="text-sm font-medium text-gray-500">Image coming soon</span>
            </div>
          )}
          
          {/* Status Badge - Only if unavailable */}
          {meal.isAvailable !== "AVAILABLE" && (
            <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
              {meal.isAvailable === "OUT_OF_STOCK" ? "Out of Stock" : "Unavailable"}
            </div>
          )}
        </div>
        
        {/* Content - Simplified */}
        <div className="px-6 pb-6">
          {/* Dish Name - Bold, Dark Green */}
          <h3 className="font-bold text-lg text-leafy-green mb-2 line-clamp-1">
            {meal.name}
          </h3>
          
          {/* Description - One line max, regular weight */}
          <p className="text-sm text-gray-600 mb-4 line-clamp-1">
            {meal.description}
          </p>
          
          {/* Price and Add Button */}
          <div className="flex items-center justify-between">
            {/* Price - Focal point */}
            <div className="text-xl font-semibold text-golden-yellow-600">
              {formatPrice(meal.price)}
            </div>
            
            {/* Single Add Button */}
            {session && meal.isAvailable === "AVAILABLE" ? (
              <Button
                className="bg-leafy-green text-white px-4 py-2 rounded-lg hover:bg-leafy-green/90 transition-colors active:scale-98 font-medium"
                onClick={() => onAddToCart?.(meal._id)}
              >
                Add
              </Button>
            ) : !session ? (
              <Button
                asChild
                className="bg-leafy-green text-white px-4 py-2 rounded-lg hover:bg-leafy-green/90 transition-colors font-medium"
              >
                <Link href="/auth/signin">Sign In</Link>
              </Button>
            ) : (
              <Button
                disabled
                className="bg-gray-300 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed font-medium"
              >
                Unavailable
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
