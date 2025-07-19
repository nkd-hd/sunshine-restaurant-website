"use client"

import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  CheckCircle,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Download,
  Share2,
  Home,
  Mail,
  Phone,
} from "lucide-react"
import MainLayout from "~/components/layout/main-layout"
import { Button } from "~/components/ui/button"
import { api } from "~/trpc/react"

export default function BookingConfirmationPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const bookingId = params.id as string

  // Get booking details
  const { data: booking, isLoading, error } = api.bookings.getById.useQuery(
    { id: bookingId },
    { enabled: !!bookingId && !!session }
  ) as { data: any, isLoading: boolean, error: any }

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return new Intl.NumberFormat("fr-CM", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(numPrice)
  }

  const handleDownloadTicket = () => {
    // Generate a simple text-based ticket for now
    const ticketContent = `
EVENT TICKET
============
Reference: ${booking.referenceNumber}
Event: ${booking.event.name}
Date: ${booking.event.date.toLocaleDateString()} at ${booking.event.time}
Venue: ${booking.event.venue}, ${booking.event.location}
Tickets: ${booking.quantity}
Total: ${formatPrice(booking.totalAmount)}
Attendee: ${booking.user?.name || "Guest"}

IMPORTANT:
- Arrive 30 minutes early
- Bring valid ID
- Present this ticket at the venue

Organized by: ${booking.event.organizer}
Booking Date: ${booking.bookingDate.toLocaleDateString()}
Status: ${booking.status}
    `.trim()

    const blob = new Blob([ticketContent], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ticket-${booking.referenceNumber}.txt`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleShareBooking = () => {
    if (navigator.share) {
      navigator.share({
        title: `Booking Confirmation - ${booking?.event.name}`,
        text: `I've booked tickets for ${booking?.event.name}!`,
        url: window.location.href,
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert("Booking link copied to clipboard!")
    }
  }

  if (!session) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Please sign in to view your booking</h1>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading booking details...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (error || !booking) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-red-400 mb-4">
              <CheckCircle className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Booking not found</h3>
            <p className="text-gray-600 mb-6">The booking you're looking for doesn't exist or you don't have access to it.</p>
            <Button onClick={() => router.push("/dashboard")}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-lg text-gray-600">
            Your tickets have been successfully booked. Reference: <span className="font-semibold">{booking.referenceNumber}</span>
          </p>
        </div>

        {/* Booking Details */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden mb-8">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Booking Details</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Event Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Event Information</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <img
                      src={booking.event.imageUrl || "/placeholder.svg"}
                      alt={booking.event.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{booking.event.name}</h4>
                      <p className="text-gray-600">Organized by {booking.event.organizer}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-5 w-5 mr-3" />
                      <span>
                        {booking.event.date.toLocaleDateString("fr-CM", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })} at {booking.event.time}
                      </span>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-5 w-5 mr-3" />
                      <span>{booking.event.venue}, {booking.event.location}</span>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <Users className="h-5 w-5 mr-3" />
                      <span>{booking.quantity} tickets</span>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <DollarSign className="h-5 w-5 mr-3" />
                      <span>{formatPrice(booking.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Information</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reference Number:</span>
                    <span className="font-semibold">{booking.referenceNumber}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Booking Date:</span>
                    <span>{booking.bookingDate.toLocaleDateString("fr-CM")}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      booking.status === "CONFIRMED" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Number of Tickets:</span>
                    <span>{booking.quantity}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-semibold">{formatPrice(booking.totalAmount)}</span>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium text-gray-900 mb-3">Event Contact</h4>
                  {booking.event.organizerContact && (
                    <div className="flex items-center text-gray-600 mb-2">
                      <Mail className="h-4 w-4 mr-2" />
                      <span>{booking.event.organizerContact}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleDownloadTicket}
            className="flex items-center justify-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Ticket
          </Button>
          
          <Button
            variant="outline"
            onClick={handleShareBooking}
            className="flex items-center justify-center"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Booking
          </Button>
          
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="flex items-center justify-center"
          >
            <Home className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Button>
        </div>

        {/* Important Information */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-medium text-blue-900 mb-2">Important Information</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Please arrive at the venue at least 30 minutes before the event starts</li>
            <li>• Bring a valid ID for verification</li>
            <li>• Your booking reference number: <strong>{booking.referenceNumber}</strong></li>
            <li>• For any questions, contact the event organizer</li>
            <li>• Tickets are non-refundable unless the event is cancelled</li>
          </ul>
        </div>
      </div>
    </MainLayout>
  )
}
