"use client"

import type React from "react"

import { useState } from "react"
import { Menu, X, Calendar, ShoppingCart, LogIn, LogOut } from "lucide-react"
import Link from "next/link"
import { useSession, signIn, signOut } from "next-auth/react"
import { api } from "~/trpc/react"
import ChatbotWidget from "~/components/chatbot/chatbot-widget"

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { data: session, status } = useSession()

  // Get cart item count
  const { data: cartItemCount } = api.cart.getItemCount.useQuery(undefined, {
    enabled: !!session,
  })

  // Get user profile to check admin status
  const { data: userProfile } = api.auth.getProfile.useQuery(undefined, {
    enabled: !!session,
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <Calendar className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">EventHub</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/events" className="text-gray-700 hover:text-blue-600 transition-colors">
                Events
              </Link>
              {session && (
                <>
                  <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 transition-colors">
                    Dashboard
                  </Link>
              {userProfile?.role === "ADMIN" && (
                <Link href="/admin" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Admin
                </Link>
              )}
                  <Link href="/cart" className="relative text-gray-700 hover:text-blue-600 transition-colors">
                    <ShoppingCart className="h-5 w-5" />
                    {cartItemCount && cartItemCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cartItemCount > 99 ? "99+" : cartItemCount}
                      </span>
                    )}
                  </Link>
                </>
              )}

              {/* Auth Section */}
              {status === "loading" ? (
                <div className="w-8 h-8 animate-pulse bg-gray-200 rounded-full"></div>
              ) : session ? (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/profile"
                    className="text-sm text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Hi, {session.user?.name ?? session.user?.email}
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/signin"
                  className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <LogIn className="h-5 w-5 mr-1" />
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700 hover:text-blue-600"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link href="/events" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                Events
              </Link>
              {session && (
                <>
                  <Link href="/dashboard" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                    Dashboard
                  </Link>
              {userProfile?.role === "ADMIN" && (
                <Link href="/admin" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                  Admin
                </Link>
              )}
                  <Link href="/cart" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                    Cart {cartItemCount && cartItemCount > 0 ? `(${cartItemCount})` : ""}
                  </Link>
                </>
              )}

              {/* Mobile Auth */}
              {status === "loading" ? (
                <div className="px-3 py-2 text-gray-500">Loading...</div>
              ) : session ? (
                <div className="px-3 py-2 space-y-2">
                  <Link
                    href="/profile"
                    className="block text-sm text-gray-700 hover:text-blue-600"
                  >
                    Hi, {session.user?.name ?? session.user?.email}
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="block w-full text-left text-gray-700 hover:text-blue-600"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/signin"
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 EventHub. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Chatbot Widget */}
      <ChatbotWidget />
    </div>
  )
}
