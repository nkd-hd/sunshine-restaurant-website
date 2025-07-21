"use client"

import { ChefHat } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { memo, useMemo } from "react"
import { Button } from "./button"
import { cn } from "~/lib/utils"
import { imageOptimization } from "~/lib/performance"

interface GlassMealCardProps {
  meal: {
    _id: string
    name: string
    description: string
    price: number
    imageUrl?: string
    isAvailable?: string
  }
  className?: string
  onAddToCart?: (mealId: string) => void
}

// Memoized meal card component for better performance
export const GlassMealCard = memo(function GlassMealCard({ meal, className, onAddToCart }: GlassMealCardProps) {
  const { data: session } = useSession()

  // Memoize formatted price to avoid recalculation
  const formattedPrice = useMemo(() => {
    return `${meal.price.toLocaleString()} XAF`
  }, [meal.price])

  // Memoize image optimization props
  const imageProps = useMemo(() => {
    if (!meal.imageUrl) return null
    return imageOptimization.getOptimizedImageProps(meal.imageUrl, meal.name)
  }, [meal.imageUrl, meal.name])

  return (
    <div className={cn(
      "glass-card p-4 sm:p-6 w-full",
      // Mobile-specific optimizations
      "transform-gpu will-change-transform",
      className
    )}>
      {/* Image Container - Optimized with Next.js Image */}
      <div className="aspect-square bg-black/10 overflow-hidden mb-4 relative rounded-lg">
        {meal.imageUrl && imageProps ? (
          <Image
            {...imageProps}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false} // Lazy load for better initial page performance
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-wooden-brown/20 to-transparent text-wooden-brown/60 rounded-lg">
            <div className="w-16 h-16 bg-wooden-brown/30 rounded-full flex items-center justify-center mb-2 shadow-inner">
              <ChefHat className="w-8 h-8 text-wooden-brown/60" />
            </div>
            <span className="text-sm font-medium text-wooden-brown/60 opacity-90">Image coming soon</span>
          </div>
        )}
        
        {/* Status Badge - Only if unavailable */}
        {meal.isAvailable !== "AVAILABLE" && (
          <div className="absolute top-3 left-3 bg-red-500/80 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-medium">
            {meal.isAvailable === "OUT_OF_STOCK" ? "Out of Stock" : "Unavailable"}
          </div>
        )}
      </div>
      
      {/* Content - Enhanced */}
      <div className="space-y-3">
        {/* Dish Name - Bold, Dark Green */}
        <h3 className="font-bold text-lg sm:text-xl text-leafy-green-900 leading-tight line-clamp-2">
          {meal.name}
        </h3>
        
        {/* Description - Two lines max, better color */}
        {meal.description && (
          <p className="text-wooden-brown/80 text-sm leading-relaxed line-clamp-2">
            {meal.description}
          </p>
        )}
        
        {/* Price and Add Button */}
        <div className="flex items-center justify-between pt-2">
          {/* Price - Yellow accent, more prominent */}
          <div className="text-golden-yellow-600 font-bold text-lg sm:text-xl">
            {formattedPrice}
          </div>
          
          {/* Enhanced Add Button */}
          {session && meal.isAvailable === "AVAILABLE" ? (
            <Button
              className="bg-leafy-green-900 hover:bg-leafy-green-800 text-white py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg hover:border hover:border-golden-yellow transition-all duration-200 transform hover:scale-105 active:scale-95 font-medium text-sm"
              onClick={() => onAddToCart?.(meal._id)}
            >
              Add to Cart
            </Button>
          ) : !session ? (
            <Button
              asChild
              className="bg-leafy-green-900 hover:bg-leafy-green-800 text-white py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg hover:border hover:border-golden-yellow transition-all duration-200 transform hover:scale-105 font-medium text-sm"
            >
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          ) : (
            <Button
              disabled
              className="bg-gray-300 text-gray-500 py-2.5 px-6 rounded-lg cursor-not-allowed font-medium text-sm opacity-60"
            >
              Unavailable
            </Button>
          )}
        </div>
      </div>
    </div>
  )
})
