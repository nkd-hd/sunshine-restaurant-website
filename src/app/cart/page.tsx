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
    return `${price.toLocaleString()} F`
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

  // Show login prompt if not authenticated
  if (status === "loading") {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-primary/10 rounded-full animate-pulse mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your cart...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!session) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">Sign in to view your cart</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              You need to be logged in to add items to your cart and place orders.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/auth/signin"
                className="bg-primary text-primary-foreground px-8 py-3 rounded-2xl font-bold hover:bg-primary/90 transition-all duration-300 shadow-lg"
              >
                Sign In
              </Link>
              <Link
                href="/menu"
                className="border border-border text-foreground px-8 py-3 rounded-2xl font-medium hover:bg-muted/50 transition-colors"
              >
                Browse Menu
              </Link>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  const cartItems = cartData?.items ?? []
  const summary = cartData?.summary ?? { itemCount: 0, subtotal: 0, tax: 0, total: 0 }

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <section className="bg-gradient-to-br from-primary to-accent text-white">
          <div className="px-4 py-6 sm:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center space-x-4 mb-4">
                <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold">Your Order</h1>
                  <p className="text-white/90 text-sm">
                    {cartItems.length === 0 ? 'Your cart is empty' : `${summary.itemCount} ${summary.itemCount === 1 ? 'item' : 'items'} in cart`}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Wave decoration */}
          <div className="relative">
            <svg viewBox="0 0 1200 120" fill="none" className="w-full h-8 text-background">
              <path d="M0,96L48,80C96,64 192,32 288,37.3C384,43 480,85 576,85.3C672,85 768,43 864,48C960,53 1056,107 1152,112L1200,117V120H1152C1056,120 960,120 864,120C768,120 672,120 576,120C480,120 384,120 288,120C192,120 96,120 48,120H0V96Z" fill="currentColor"></path>
            </svg>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 -mt-4 relative z-10">
          {isLoading ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-primary/10 rounded-full animate-pulse mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your delicious order...</p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-border">
              <div className="text-center py-8">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Your cart is empty</h3>
                <p className="text-muted-foreground mb-8">
                  Discover our delicious meals and add your favorites to get started!
                </p>
                <Link
                  href="/menu"
                  className="inline-flex items-center bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-bold hover:bg-primary/90 transition-all duration-300 shadow-lg"
                >
                  <span>Browse Menu</span>
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m-4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Cart Items */}
              <div className="bg-white rounded-3xl shadow-sm border border-border overflow-hidden">
                <div className="p-6 border-b border-border">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-foreground">Order Items</h2>
                    <span className="text-sm text-muted-foreground">{summary.itemCount} {summary.itemCount === 1 ? 'item' : 'items'}</span>
                  </div>
                </div>

                <div className="divide-y divide-border">
                  {cartItems.map((item: any, index: number) => (
                    <div key={item._id} className="p-6">
                      <div className="flex items-center space-x-4">
                        {/* Item Image */}
                        <div className="w-20 h-20 bg-muted rounded-2xl overflow-hidden flex-shrink-0">
                          <img
                            src={item.meal?.imageUrl ?? "/placeholder.svg"}
                            alt={item.meal?.name || `Item ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Item Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-foreground mb-1 truncate">
                            {item.meal?.name || `Item ${index + 1}`}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {item.meal?.description || 'Delicious meal from our kitchen'}
                          </p>
                          <p className="text-lg font-bold text-primary">
                            {formatPrice(item.meal?.price || 0)}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex flex-col items-end space-y-3">
                          <div className="flex items-center bg-muted rounded-full p-1">
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                              className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-10 text-center font-bold text-foreground">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                              className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          
                          {/* Remove Button */}
                          <button
                            onClick={() => removeItem(item._id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary - Mobile Receipt Style */}
              <div className="bg-white rounded-3xl shadow-sm border border-border overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <Receipt className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-bold text-foreground">Order Summary</h2>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium text-foreground">{formatPrice(summary.subtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Delivery fee</span>
                      <span className="font-medium text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">VAT (19.25%)</span>
                      <span className="font-medium text-foreground">{formatPrice(summary.tax)}</span>
                    </div>
                    <div className="border-t border-border pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-foreground">Total</span>
                        <span className="text-xl font-bold text-primary">{formatPrice(summary.total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Promo Code */}
                  <div className="bg-muted/50 rounded-2xl p-4 mb-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <Gift className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">Have a promo code?</span>
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Enter code"
                        className="flex-1 bg-white border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                      <button className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
                        Apply
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={() => router.push("/checkout")}
                      className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                    >
                      Proceed to Checkout • {formatPrice(summary.total)}
                    </button>

                    <Link
                      href="/menu"
                      className="w-full border border-border text-foreground py-3 rounded-2xl font-medium hover:bg-muted/50 transition-colors text-center block"
                    >
                      Add More Items
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
