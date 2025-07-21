"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  CreditCard,
  Smartphone,
  Banknote,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  CheckCircle,
  ArrowLeft,
  Loader2,
} from "lucide-react"
import MainLayout from "~/components/layout/main-layout"
import { Button } from "~/components/ui/button"


export default function CheckoutPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"mtn_momo" | "orange_money" | "cash">("mtn_momo")
  const [attendeeInfo, setAttendeeInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialRequests: "",
  })
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
    mobileNumber: "",
    bankReference: "",
  })

  // Placeholder for cart data - replace with actual fetching logic
  const [cartItems, setCartItems] = useState(null)
  const [cartLoading, setCartLoading] = useState(true)

  // Simulate loading cart items
  useEffect(() => {
    if (session) {
      // Replace this with actual Convex query or API call
      setTimeout(() => {
        setCartItems({ items: [] }) // Empty cart for now
        setCartLoading(false)
      }, 1000)
    } else {
      setCartLoading(false)
    }
  }, [session])

  const createBooking = async () => {
    try {
      // Replace with actual Convex mutation or API call
      const bookingData = {
        bookingId: `booking_${Date.now()}`,
        paymentMethod,
        paymentDetails,
        attendeeInfo,
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Redirect to confirmation page
      router.push(`/booking-confirmation/${bookingData.bookingId}`)
    } catch (error) {
      alert(`Booking failed: ${error.message}`)
      setIsProcessing(false)
    }
  }

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return new Intl.NumberFormat("fr-CM", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(numPrice)
  }

  const calculateTotal = () => {
    if (!cartItems) return 0
    return cartItems.items.reduce((total, item: any) => {
      return total + (parseFloat(item.event.price) * item.quantity)
    }, 0)
  }

  const validateForm = () => {
    if (!attendeeInfo.firstName.trim()) {
      alert("Please enter your first name")
      return false
    }
    if (!attendeeInfo.lastName.trim()) {
      alert("Please enter your last name")
      return false
    }
    if (!attendeeInfo.email.trim()) {
      alert("Please enter your email")
      return false
    }
    if (!attendeeInfo.phone.trim()) {
      alert("Please enter your phone number")
      return false
    }

    if (paymentMethod === "card") {
      if (!paymentDetails.cardNumber.trim()) {
        alert("Please enter your card number")
        return false
      }
      if (!paymentDetails.expiryDate.trim()) {
        alert("Please enter card expiry date")
        return false
      }
      if (!paymentDetails.cvv.trim()) {
        alert("Please enter CVV")
        return false
      }
      if (!paymentDetails.cardholderName.trim()) {
        alert("Please enter cardholder name")
        return false
      }
    }

    if ((paymentMethod === "mtn_momo" || paymentMethod === "orange_money") && !paymentDetails.mobileNumber.trim()) {
      alert("Please enter your mobile money number")
      return false
    }

    return true
  }

  const handleCheckout = async () => {
    if (!session) {
      router.push("/auth/signin?callbackUrl=/checkout")
      return
    }

    if (!cartItems || cartItems.items.length === 0) {
      alert("Your cart is empty")
      return
    }

    if (!validateForm()) {
      return
    }

    setIsProcessing(true)
    
    await createBooking()
  }

  if (!session) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to checkout</h1>
            <Button onClick={() => router.push("/auth/signin?callbackUrl=/checkout")}>
              Sign In
            </Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (cartLoading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading checkout...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!cartItems || cartItems.items.length === 0) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-6">Add some events to your cart before checking out</p>
            <Button onClick={() => router.push("/events")}>
              Browse Events
            </Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  const total = calculateTotal()

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Forms */}
          <div className="space-y-6">
            {/* Attendee Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Attendee Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={attendeeInfo.firstName}
                    onChange={(e) => setAttendeeInfo(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={attendeeInfo.lastName}
                    onChange={(e) => setAttendeeInfo(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter last name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={attendeeInfo.email}
                    onChange={(e) => setAttendeeInfo(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={attendeeInfo.phone}
                    onChange={(e) => setAttendeeInfo(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+237 6XX XXX XXX"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Requests (Optional)
                </label>
                <textarea
                  value={attendeeInfo.specialRequests}
                  onChange={(e) => setAttendeeInfo(prev => ({ ...prev, specialRequests: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any special requirements or requests..."
                />
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h2>

              {/* Payment Method Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Payment Method
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("mtn_momo")}
                    className={`p-4 border rounded-lg text-center transition-colors ${
                      paymentMethod === "mtn_momo"
                        ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <div className="h-8 w-8 mx-auto mb-2 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">MTN</span>
                    </div>
                    <span className="text-sm font-medium">MTN Mobile Money</span>
                    <p className="text-xs text-gray-500 mt-1">Pay with MTN MoMo</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("orange_money")}
                    className={`p-4 border rounded-lg text-center transition-colors ${
                      paymentMethod === "orange_money"
                        ? "border-orange-500 bg-orange-50 text-orange-700"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <div className="h-8 w-8 mx-auto mb-2 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">OM</span>
                    </div>
                    <span className="text-sm font-medium">Orange Money</span>
                    <p className="text-xs text-gray-500 mt-1">Pay with Orange Money</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cash")}
                    className={`p-4 border rounded-lg text-center transition-colors ${
                      paymentMethod === "cash"
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <Banknote className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <span className="text-sm font-medium">Cash at Venue</span>
                    <p className="text-xs text-gray-500 mt-1">Pay when you arrive</p>
                  </button>
                </div>
              </div>

              {/* Payment Details Forms */}

              {paymentMethod === "mtn_momo" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    MTN Mobile Money Number *
                  </label>
                  <input
                    type="tel"
                    value={paymentDetails.mobileNumber}
                    onChange={(e) => setPaymentDetails(prev => ({ ...prev, mobileNumber: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="+237 67X XXX XXX or +237 68X XXX XXX"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Enter your MTN Mobile Money registered number
                  </p>
                </div>
              )}

              {paymentMethod === "orange_money" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Orange Money Number *
                  </label>
                  <input
                    type="tel"
                    value={paymentDetails.mobileNumber}
                    onChange={(e) => setPaymentDetails(prev => ({ ...prev, mobileNumber: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="+237 69X XXX XXX"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Enter your Orange Money registered number
                  </p>
                </div>
              )}


              {paymentMethod === "cash" && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Banknote className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900 mb-1">Cash Payment at Venue</h4>
                      <p className="text-sm text-green-800">
                        You will pay when you arrive at the event venue. Please bring exact change if possible.
                        Your booking will be confirmed and tickets will be available for pickup at the venue.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-4">
                {cartItems.items.map((item: any) => (
                  <div key={item.id} className="flex items-start space-x-4 pb-4 border-b border-gray-200 last:border-b-0">
                    <img
                      src={item.event.imageUrl || "/placeholder.svg"}
                      alt={item.event.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.event.name}</h3>
                      <div className="text-sm text-gray-500 space-y-1">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {item.event.date.toLocaleDateString("fr-CM")} at {item.event.time}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {item.event.venue}, {item.event.location}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {item.quantity} tickets
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        {formatPrice(parseFloat(item.event.price) * item.quantity)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatPrice(item.event.price)} each
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total:</span>
                  <span className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-1" />
                    {formatPrice(total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Button */}
          <div className="lg:col-span-2">
            <Button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full py-3 text-lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Complete Booking - {formatPrice(total)}
                </>
              )}
            </Button>

            <div className="text-center text-sm text-gray-500 mt-4">
              <p>By completing this booking, you agree to our terms and conditions.</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
