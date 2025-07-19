"use client"

import { useState } from "react"
import { Calendar, MapPin, Users, Clock, User, Plus, Minus } from "lucide-react"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import MainLayout from "~/components/layout/main-layout"
import { api } from "~/trpc/react"

interface EventDetailPageProps {
  params: { id: string }
}

export default function EventDetailPage() {
  const params = useParams()
  const eventId = params.id as string
  const { data: session } = useSession()
  const [quantity, setQuantity] = useState(1)

  // Fetch event data using tRPC
  const { data: event, isLoading, error } = api.events.getById.useQuery(
    { id: eventId },
    { enabled: !!eventId }
  )

  // Add to cart mutation
  const addToCartMutation = api.cart.addItem.useMutation({
    onSuccess: () => {
      // Could add a toast notification here
      console.log("Added to cart successfully!")
    },
    onError: (error) => {
      console.error("Failed to add to cart:", error.message)
    },
  })

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
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

    if (!event) return

    addToCartMutation.mutate({
      eventId: event.id,
      quantity: quantity,
    })
  }

  // Loading state
  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading event details...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  // Error state
  if (error || !event) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-red-400 mb-4">
              <Calendar className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Event not found</h3>
            <p className="text-gray-600">The event you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Event Image */}
            <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-6">
              <img
                src={event.imageUrl || "/placeholder.svg"}
                alt={event.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Event Details */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.name}</h1>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-3" />
                  <span>
                    {event.date.toLocaleDateString("fr-CM")} at {event.time}
                  </span>
                </div>

                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-3" />
                  <span>
                    {event.venue}, {event.location}
                  </span>
                </div>

                <div className="flex items-center text-gray-600">
                  <User className="h-5 w-5 mr-3" />
                  <span>Organized by {event.organizer}</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <Users className="h-5 w-5 mr-3" />
                  <span>
                    {event.availableTickets} of {event.totalTickets} tickets available
                  </span>
                </div>
              </div>

              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">About This Event</h3>
                <p className="text-gray-600 leading-relaxed">{event.description || "No description available"}</p>
              </div>
            </div>

            {/* Event Contact Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Information</h3>
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <User className="h-5 w-5 mr-3" />
                  <span>Organizer: {event.organizer}</span>
                </div>
                {event.organizerContact && (
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-5 w-5 mr-3" />
                    <span>Contact: {event.organizerContact}</span>
                  </div>
                )}
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-3" />
                  <span>Event Date: {event.date.toLocaleDateString("fr-CM")} at {event.time}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">{formatPrice(event.price)}</div>
                <p className="text-gray-600">per ticket</p>
              </div>

              {event.availableTickets > 0 ? (
                <>
                  {/* Quantity Selector */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Number of Tickets</label>
                    <div className="flex items-center justify-center space-x-4">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="text-xl font-semibold w-8 text-center">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(Math.min(10, event.availableTickets), quantity + 1))}
                        className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="border-t pt-4 mb-6">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Total:</span>
                      <span>{formatPrice(parseFloat(event.price) * quantity)}</span>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={addToCartMutation.isPending}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
                  </button>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-red-600 font-medium">Sold Out</p>
                  <p className="text-gray-600 text-sm mt-1">No tickets available</p>
                </div>
              )}

              {/* Event Info */}
              <div className="mt-6 pt-6 border-t space-y-3 text-sm text-gray-600">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{event.availableTickets} tickets remaining</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Event Date: {event.date.toLocaleDateString("fr-CM")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
