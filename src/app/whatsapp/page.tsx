"use client"

import Link from "next/link"
import { MessageCircle, Phone, Users, Truck } from "lucide-react"
import MainLayout from "~/components/layout/main-layout"
import { Button } from "~/components/ui/button"

export default function WhatsAppPage() {
  // WhatsApp phone numbers (replace with actual numbers)
  const restaurantOwnerNumber = "+237123456789" // Replace with actual restaurant owner number
  const deliveryGuyNumber = "+237987654321" // Replace with actual delivery guy number

  const openWhatsApp = (phoneNumber: string, message: string) => {
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${phoneNumber.replace('+', '')}?text=${encodedMessage}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Us on WhatsApp</h1>
            <p className="text-gray-600">Get instant support and assistance through WhatsApp</p>
          </div>

          {/* Contact Options */}
          <div className="space-y-6">
            {/* Restaurant Owner */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Restaurant Owner</h3>
                  <p className="text-gray-600 mb-4">
                    Chat with our restaurant owner for general inquiries, feedback, special requests, 
                    or any concerns about our service.
                  </p>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-500 font-medium">Perfect for:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Menu inquiries and recommendations</li>
                      <li>• Special dietary requirements</li>
                      <li>• Feedback and suggestions</li>
                      <li>• General restaurant questions</li>
                    </ul>
                  </div>
                  <Button
                    onClick={() => openWhatsApp(restaurantOwnerNumber, "Hello! I have a question about Sunshine Restaurant.")}
                    className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat with Restaurant Owner
                  </Button>
                </div>
              </div>
            </div>

            {/* Delivery Guy */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Truck className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Delivery Support</h3>
                  <p className="text-gray-600 mb-4">
                    Get in touch with our delivery team for order tracking, delivery updates, 
                    or any delivery-related questions.
                  </p>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-500 font-medium">Perfect for:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Order tracking and status</li>
                      <li>• Delivery address changes</li>
                      <li>• Delivery time estimates</li>
                      <li>• Delivery-related issues</li>
                    </ul>
                  </div>
                  <Button
                    onClick={() => openWhatsApp(deliveryGuyNumber, "Hello! I need help with my delivery.")}
                    className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Truck className="w-4 h-4 mr-2" />
                    Chat with Delivery Team
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="text-center">
              <Phone className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Response Times</h3>
              <p className="text-gray-600 text-sm">
                We typically respond within 5-15 minutes during business hours (9 AM - 10 PM).
                For urgent matters, please call us directly.
              </p>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-8">
            <Link href="/">
              <Button variant="outline" className="bg-white hover:bg-gray-50">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
