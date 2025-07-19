"use client"

import { Calendar, MapPin, Users, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { api } from "~/trpc/react"
import { useState } from "react"

interface EventCardProps {
  event: {
    id: string
    name: string
    description: string | null
    date: Date
    time: string
    venue: string
    location: string
    price: string
    availableTickets: number
    imageUrl: string | null
  }
}

export default function EventCard({ event }: EventCardProps) {
  const { data: session } = useSession()
  const [quantity, setQuantity] = useState(1)

  const addToCartMutation = api.cart.addItem.useMutation({
    onSuccess: () => {
      // Could add a toast notification here
      console.log("Added to cart successfully!")
    },
    onError: (error) => {
      console.error("Failed to add to cart:", error.message)
    },
  })

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price)
    return new Intl.NumberFormat("fr-CM", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(numPrice)
  }

  const handleAddToCart = () => {
    if (!session) {
      // Redirect to sign in
      window.location.href = "/api/auth/signin"
      return
    }

    addToCartMutation.mutate({
      eventId: event.id,
      quantity: quantity,
    })
  }

  // Handle both old and new image URL formats
  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return "/placeholder.svg"

    // If it's already an API URL, use it as is
    if (imageUrl.startsWith("/api/uploads/")) return imageUrl

    // If it's an old format URL, convert it to API format
    if (imageUrl.startsWith("/uploads/")) {
      return `/api${imageUrl}`
    }

    // If it's an external URL (like Unsplash), use it as is
    if (imageUrl.startsWith("http")) return imageUrl

    // Fallback
    return "/placeholder.svg"
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200">
      <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
        <img src={getImageUrl(event.imageUrl)} alt={event.name} className="w-full h-full object-cover" />
      </div>

      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{event.name}</h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description ?? "No description available"}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>
              {event.date.toLocaleDateString("fr-CM")} at {event.time}
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            <span>
              {event.venue}, {event.location}
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            <span>{event.availableTickets} tickets available</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold text-gray-900">{formatPrice(event.price)}</div>
          <div className="text-sm text-gray-600">
            {event.availableTickets > 0 ? `${event.availableTickets} available` : "Sold out"}
          </div>
        </div>

        {/* Quantity selector and Add to Cart */}
        {event.availableTickets > 0 && (
          <div className="flex items-center space-x-2 mb-4">
            <label htmlFor={`quantity-${event.id}`} className="text-sm text-gray-600">
              Qty:
            </label>
            <select
              id={`quantity-${event.id}`}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              {Array.from({ length: Math.min(10, event.availableTickets) }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddToCart}
              disabled={addToCartMutation.isPending}
              className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center"
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
            </button>
          </div>
        )}

        <div className="flex space-x-2">
          <Link
            href={`/events/${event.id}`}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium text-center"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  )
}
