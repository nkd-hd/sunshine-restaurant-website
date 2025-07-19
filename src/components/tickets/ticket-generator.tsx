"use client"

import { useRef } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Calendar, MapPin, Users, DollarSign, Download } from "lucide-react"
import { Button } from "~/components/ui/button"

interface TicketData {
  booking: {
    id: string
    referenceNumber: string
    quantity: number
    totalAmount: string
    bookingDate: Date
    status: string
    event: {
      id: string
      name: string
      date: Date
      time: string
      venue: string
      location: string
      organizer: string
      imageUrl?: string
    }
    user?: {
      name: string
      email: string
    }
  }
}

interface TicketGeneratorProps {
  ticketData: TicketData
  onDownload?: () => void
}

export default function TicketGenerator({ ticketData, onDownload }: TicketGeneratorProps) {
  const ticketRef = useRef<HTMLDivElement>(null)
  const { booking } = ticketData

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return new Intl.NumberFormat("fr-CM", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(numPrice)
  }

  const generateQRData = () => {
    return JSON.stringify({
      bookingId: booking.id,
      reference: booking.referenceNumber,
      eventId: booking.event.id,
      eventName: booking.event.name,
      quantity: booking.quantity,
      date: booking.event.date.toISOString(),
      venue: booking.event.venue,
      attendee: booking.user?.name || "Guest",
      verified: true,
    })
  }

  const handleDownloadPDF = async () => {
    if (typeof window === 'undefined') return

    try {
      // Dynamic import to avoid SSR issues
      const html2canvas = (await import('html2canvas')).default
      const jsPDF = (await import('jspdf')).default

      if (!ticketRef.current) return

      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      })

      const imgWidth = 297 // A4 landscape width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
      pdf.save(`ticket-${booking.referenceNumber}.pdf`)

      if (onDownload) onDownload()
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Ticket Preview */}
      <div
        ref={ticketRef}
        className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 max-w-4xl mx-auto"
        style={{ fontFamily: 'Arial, sans-serif' }}
      >
        {/* Ticket Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">EVENT TICKET</h1>
            <p className="text-lg text-blue-600 font-semibold">#{booking.referenceNumber}</p>
          </div>
          <div className="text-right">
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
              {booking.status}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Details */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">{booking.event.name}</h2>
              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <Calendar className="h-5 w-5 mr-3 text-blue-600" />
                  <span className="font-medium">
                    {booking.event.date.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })} at {booking.event.time}
                  </span>
                </div>
                <div className="flex items-center text-gray-700">
                  <MapPin className="h-5 w-5 mr-3 text-blue-600" />
                  <span>{booking.event.venue}, {booking.event.location}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Users className="h-5 w-5 mr-3 text-blue-600" />
                  <span>{booking.quantity} ticket{booking.quantity > 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <DollarSign className="h-5 w-5 mr-3 text-blue-600" />
                  <span className="font-semibold">{formatPrice(booking.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Attendee Information */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-2">Attendee Information</h3>
              <p className="text-gray-700">Name: {booking.user?.name || "Guest"}</p>
              <p className="text-gray-700">Email: {booking.user?.email || "N/A"}</p>
              <p className="text-gray-700">Booking Date: {booking.bookingDate.toLocaleDateString()}</p>
            </div>

            {/* Organizer Information */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-2">Event Organizer</h3>
              <p className="text-gray-700">{booking.event.organizer}</p>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="flex flex-col items-center justify-center space-y-4 border-l-2 border-dashed border-gray-300 pl-8">
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 mb-2">Scan for Entry</h3>
              <div className="bg-white p-4 rounded-lg border">
                <QRCodeSVG
                  value={generateQRData()}
                  size={150}
                  level="M"
                  includeMargin={true}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Present this QR code at the venue
              </p>
            </div>
          </div>
        </div>

        {/* Ticket Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Important Notes:</h4>
              <ul className="space-y-1">
                <li>• Arrive 30 minutes before event start</li>
                <li>• Bring valid ID for verification</li>
                <li>• Ticket is non-transferable</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Contact Information:</h4>
              <p>For support, contact the event organizer</p>
              <p className="font-mono text-xs mt-2">Ref: {booking.referenceNumber}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Download Button */}
      <div className="text-center">
        <Button
          onClick={handleDownloadPDF}
          className="flex items-center justify-center mx-auto"
          size="lg"
        >
          <Download className="h-5 w-5 mr-2" />
          Download PDF Ticket
        </Button>
        <p className="text-sm text-gray-500 mt-2">
          Save this ticket to your device for easy access at the event
        </p>
      </div>
    </div>
  )
}
