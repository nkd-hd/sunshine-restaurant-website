"use client"

import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Receipt, Gift } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import MainLayout from "~/components/layout/main-layout"

export default function CartPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Get user ID from session 
  const userId = session?.user?.id

  // Fetch cart items using Convex
  const cartData = useQuery(
    api.cart.getCartItems, 
    userId ? { userId: userId as any } : "skip"
  )
  const isLoading = cartData === undefined

  // Mutations for cart operations
  const updateQuantityMutation = useMutation(api.cart.updateCartItemQuantity)
  const removeItemMutation = useMutation(api.cart.removeFromCart)

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} XAF`
  }

  const updateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      await removeItemMutation({ cartItemId: cartItemId as any })
    } else {
      await updateQuantityMutation({ cartItemId: cartItemId as any, quantity: newQuantity })
    }
  }

  const removeItem = async (cartItemId: string) => {
    await removeItemMutation({ cartItemId: cartItemId as any })
  }

  // Show loading state
  if (status === "loading") {
    return (
      <MainLayout>
        <div className="flex justify-center items-center py-20">
          <div className="glass-card p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-wooden-brown/30 border-t-wooden-brown rounded-full mx-auto mb-4"></div>
            <div className="text-wooden-brown/60">Loading your cart...</div>
          </div>
        </div>
      </MainLayout>
    )
  }

  // Show login prompt if not authenticated
  if (!session) {
    return (
      <MainLayout>
        <div className="min-h-screen">
          {/* Hero Section with Green Background */}
          <section className="relative bg-gradient-to-br from-leafy-green to-leafy-green/80 text-white">
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
              <div className="text-center space-y-4">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                  Your Order
                  <span className="block text-yellow-300 text-lg sm:text-xl font-normal mt-2">
                    Please sign in to view your cart
                  </span>
                </h1>
              </div>
            </div>
          </section>

          {/* Content Section */}
          <section className="py-12 sm:py-16">
            <div className="max-w-md mx-auto px-4 sm:px-6">
              <div className="glass-card p-12 text-center">
                <div className="w-24 h-24 bg-wooden-brown/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="w-12 h-12 text-wooden-brown/60" />
                </div>
                <h3 className="text-xl font-bold text-wooden-brown mb-4">Sign in to view your cart</h3>
                <p className="text-wooden-brown/80 mb-8">
                  You need to be logged in to add items to your cart and place orders.
                </p>
                <div className="flex flex-col gap-3">
                  <Link
                    href="/auth/signin"
                    className="bg-leafy-green-900 hover:bg-leafy-green-800 text-white px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 font-medium text-center"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/menu"
                    className="border border-wooden-brown/20 text-wooden-brown px-8 py-3 rounded-lg hover:bg-wooden-brown/5 transition-colors text-center"
                  >
                    Browse Menu
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </MainLayout>
    )
  }

  const cartItems = cartData?.items ?? []
  const summary = cartData?.summary ?? { itemCount: 0, subtotal: 0, tax: 0, total: 0 }

  return (
    <MainLayout>
      <div className="min-h-screen">
        {/* Hero Section with Green Background */}
        <section className="relative bg-gradient-to-br from-leafy-green to-leafy-green/80 text-white">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-4 mb-4">
                <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                    Your Order
                    <span className="block text-yellow-300 text-lg sm:text-xl font-normal mt-2">
                      {cartItems.length === 0 ? 'Your cart is empty' : `${summary.itemCount} ${summary.itemCount === 1 ? 'item' : 'items'} in cart`}
                    </span>
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cart Content Section - On wooden background */}
        <section className="py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="glass-card p-8 text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-wooden-brown/30 border-t-wooden-brown rounded-full mx-auto mb-4"></div>
                  <div className="text-wooden-brown/60">Loading your delicious order...</div>
                </div>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="glass-card p-12 text-center mx-auto max-w-md">
                <div className="w-24 h-24 bg-wooden-brown/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="w-12 h-12 text-wooden-brown/60" />
                </div>
                <h3 className="text-xl font-bold text-wooden-brown mb-4">Your cart is empty</h3>
                <p className="text-wooden-brown/80 mb-8">
                  Discover our delicious meals and add your favorites to get started!
                </p>
                <Link
                  href="/menu"
                  className="inline-flex items-center bg-leafy-green-900 hover:bg-leafy-green-800 text-white px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 font-medium"
                >
                  <span>Browse Menu</span>
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m-4-4H3" />
                  </svg>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Cart Items */}
                <div className="glass-card overflow-hidden">
                  <div className="p-6 border-b border-white/20">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-bold text-wooden-brown">Order Items</h2>
                      <span className="text-sm text-wooden-brown/70">{summary.itemCount} {summary.itemCount === 1 ? 'item' : 'items'}</span>
                    </div>
                  </div>

                  <div className="divide-y divide-white/10">
                    {cartItems.map((item: any, index: number) => (
                      <div key={item._id} className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                          {/* Item Image */}
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-wooden-brown/10 rounded-2xl overflow-hidden flex-shrink-0 mx-auto sm:mx-0">
                            <img
                              src={item.meal?.imageUrl ?? "/placeholder.svg"}
                              alt={item.meal?.name || `Item ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Item Details and Controls Container */}
                          <div className="flex-1 w-full min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                              {/* Item Details */}
                              <div className="flex-1 min-w-0 text-center sm:text-left">
                                <h3 className="font-bold text-wooden-brown mb-1 truncate">
                                  {item.meal?.name || `Item ${index + 1}`}
                                </h3>
                                <p className="text-sm text-wooden-brown/70 mb-2 line-clamp-2">
                                  {item.meal?.description || 'Delicious meal from our kitchen'}
                                </p>
                                <p className="text-lg font-bold text-golden-yellow-600">
                                  {formatPrice(item.meal?.price || 0)}
                                </p>
                              </div>

                              {/* Quantity Controls */}
                              <div className="flex flex-col items-center sm:items-end space-y-3">
                                <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full p-1">
                                  <button
                                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                    className="w-8 h-8 rounded-full bg-white/80 shadow-sm flex items-center justify-center hover:bg-white disabled:opacity-50 transition-colors"
                                  >
                                    <Minus className="w-4 h-4 text-wooden-brown" />
                                  </button>
                                  <span className="w-10 text-center font-bold text-wooden-brown">{item.quantity}</span>
                                  <button
                                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                    className="w-8 h-8 rounded-full bg-white/80 shadow-sm flex items-center justify-center hover:bg-white disabled:opacity-50 transition-colors"
                                  >
                                    <Plus className="w-4 h-4 text-wooden-brown" />
                                  </button>
                                </div>
                                
                                {/* Remove Button */}
                                <button
                                  onClick={() => removeItem(item._id)}
                                  className="p-2 text-red-500 hover:bg-red-50/20 backdrop-blur-sm rounded-full transition-colors disabled:opacity-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="glass-card overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center space-x-2 mb-6">
                      <Receipt className="w-5 h-5 text-leafy-green-900" />
                      <h2 className="text-lg font-bold text-wooden-brown">Order Summary</h2>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-wooden-brown/70">Subtotal</span>
                        <span className="font-medium text-wooden-brown">{formatPrice(summary.subtotal)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-wooden-brown/70">Delivery fee</span>
                        <span className="font-medium text-green-600">Free</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-wooden-brown/70">VAT (19.25%)</span>
                        <span className="font-medium text-wooden-brown">{formatPrice(summary.tax)}</span>
                      </div>
                      <div className="border-t border-white/20 pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-wooden-brown">Total</span>
                          <span className="text-xl font-bold text-golden-yellow-600">{formatPrice(summary.total)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Promo Code */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-6">
                      <div className="flex items-center space-x-2 mb-2">
                        <Gift className="w-4 h-4 text-leafy-green-900" />
                        <span className="text-sm font-medium text-wooden-brown">Have a promo code?</span>
                      </div>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="Enter code"
                          className="flex-1 bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-2 text-sm text-wooden-brown placeholder-wooden-brown/50 focus:outline-none focus:ring-2 focus:ring-leafy-green-900/50 focus:border-leafy-green-900"
                        />
                        <button className="bg-leafy-green-900 hover:bg-leafy-green-800 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                          Apply
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <button
                        onClick={() => router.push("/checkout")}
                        className="w-full bg-leafy-green-900 hover:bg-leafy-green-800 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
                      >
                        Proceed to Checkout • {formatPrice(summary.total)}
                      </button>

                      <Link
                        href="/menu"
                        className="w-full border border-white/30 text-wooden-brown py-3 rounded-2xl font-medium hover:bg-white/10 backdrop-blur-sm transition-colors text-center block"
                      >
                        Add More Items
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </MainLayout>
  )
}
