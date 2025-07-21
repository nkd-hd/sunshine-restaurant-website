import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Facebook, Instagram, Twitter, Phone, Mail, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-leafy-green flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-bold text-xl">Sunshine Restaurant</span>
            </div>
            <p className="text-gray-400 text-sm">
              Serving delicious, authentic meals in Yaoundé with fast delivery and exceptional service.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Twitter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Quick Links</h3>
            <div className="space-y-2">
              <Link href="/menu" className="block text-gray-400 hover:text-white transition-colors">
                Menu
              </Link>
              <Link href="/about" className="block text-gray-400 hover:text-white transition-colors">
                About Us
              </Link>
              <Link href="/contact" className="block text-gray-400 hover:text-white transition-colors">
                Contact
              </Link>
              <Link href="/faq" className="block text-gray-400 hover:text-white transition-colors">
                FAQ
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-leafy-green" />
                <span className="text-gray-400">+237 6XX XXX XXX</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-leafy-green" />
                <span className="text-gray-400">info@sunshinerestaurant.cm</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-leafy-green" />
                <span className="text-gray-400">Yaoundé, Cameroon</span>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Stay Updated</h3>
            <p className="text-gray-400 text-sm">Subscribe to get updates on new dishes and special offers.</p>
            <div className="space-y-2">
              <Input placeholder="Enter your email" className="bg-gray-800 border-gray-700 text-white" />
              <Button className="w-full bg-leafy-green hover:bg-leafy-green/90">Subscribe</Button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">© 2024 Sunshine Restaurant. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
