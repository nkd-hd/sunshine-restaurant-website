"use client"

import { Trash2, Plus, Minus, ShoppingBag, LogIn } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import MainLayout from "~/components/layout/main-layout"
import { api } from "~/trpc/react"

export default function CartPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Fetch cart items using tRPC
  const { data: cartData, isLoading, refetch } = api.cart.getItems.useQuery(undefined, {
    enabled: !!session,
  })

  // Mutations for cart operations
  const updateQuantityMutation = api.cart.updateQuantity.useMutation({
    onSuccess: () => {
      void refetch()
    },
  })

  const removeItemMutation = api.cart.removeItem.useMutation({
    onSuccess: () => {
      void refetch()
    },
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-CM", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const updateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeItemMutation.mutate({ cartItemId })
    } else {
      updateQuantityMutation.mutate({ cartItemId, quantity: newQuantity })
    }
  }

  const removeItem = (cartItemId: string) => {
    removeItemMutation.mutate({ cartItemId })
  }

  // Show login prompt if not authenticated
  if (status === "loading") {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!session) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <LogIn className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Please sign in to view your cart</h3>
            <p className="text-gray-600 mb-6">You need to be logged in to manage your cart items</p>
            <Link
              href="/api/auth/signin"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </MainLayout>
    )
  }

  const cartItems = cartData?.items ?? []
  const summary = cartData?.summary ?? { itemCount: 0, subtotal: 0, tax: 0, total: 0 }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">Review your selected events</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your cart...</p>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-6">Start browsing events to add tickets to your cart</p>
            <Link
              href="/events"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">Cart Items ({summary.itemCount})</h2>
                </div>

                <div className="divide-y divide-gray-200">
                  {cartItems.map((item: any) => (
                    <div key={item.id} className="p-6">
                      <div className="flex items-start space-x-4">
                        <img
                          src={item.event.imageUrl ?? "/placeholder.svg"}
                          alt={item.event.name}
                          className="w-24 h-16 object-cover rounded-md"
                        />

                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 mb-1">{item.event.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {item.event.date.toLocaleDateString("fr-CM")} at {item.event.time}
                          </p>
                          <p className="text-sm text-gray-600">
                            {item.event.venue}, {item.event.location}
                          </p>
                        </div>

                        <div className="flex items-center space-x-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={updateQuantityMutation.isPending}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={updateQuantityMutation.isPending}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-lg font-semibold text-gray-900 w-24 text-right">
                            {formatPrice(parseFloat(item.event.price) * item.quantity)}
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => removeItem(item.id)}
                            disabled={removeItemMutation.isPending}
                            className="text-red-600 hover:text-red-800 p-1 disabled:opacity-50"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatPrice(summary.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">VAT (19.25%)</span>
                    <span className="font-medium">{formatPrice(summary.tax)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>{formatPrice(summary.total)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => router.push("/checkout")}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium mb-4"
                >
                  Proceed to Checkout
                </button>

                <button
                  onClick={() => router.push("/events")}
                  className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
