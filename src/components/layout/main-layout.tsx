"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Menu, X, ShoppingCart, Home, User, Heart, Search, MessageCircle } from "lucide-react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
// TODO: Add cart count functionality with convex queries
import { usePathname } from "next/navigation"
import { Toaster } from "~/components/ui/sonner"

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { data: session, status } = useSession()
  const pathname = usePathname()

  // Get cart item count
  // TODO: Replace with Convex query
  const cartItemCount = 0;

  // Get user profile to check admin status  
  // TODO: Replace with Convex query
  const userProfile = session?.user;

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation Bar - Persistent across all pages */}
      <header className="bg-white shadow-sm border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo - Left */}
            <Link href="/" className="flex items-center">
              <span className="font-bold text-xl">
                <span className="text-yellow-500">Sunshine</span>
                <span className="text-wooden-brown ml-1">Restaurant</span>
              </span>
            </Link>

            {/* Navigation Buttons - Center on desktop */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                href="/" 
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  pathname === '/' 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                }`}
              >
                Home
              </Link>
              <Link 
                href="/menu" 
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  pathname === '/menu' 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                }`}
              >
                Menu
              </Link>
              <Link 
                href="/cart" 
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 relative ${
                  pathname === '/cart' 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                }`}
              >
                Cart
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </span>
                )}
              </Link>
              <Link 
                href="/whatsapp" 
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  pathname === '/whatsapp' 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                }`}
              >
                WhatsApp
              </Link>
            </nav>

            {/* Hamburger Menu - Right on all screen sizes */}
            <div className="flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-full hover:bg-primary/5 transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hamburger Menu Slide-out Panel */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Slide-out Menu */}
          <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out">
            <div className="flex flex-col h-full">
              {/* Menu Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-lg">
                    <span className="text-yellow-500">Sunshine</span>
                    <span className="text-wooden-brown ml-1">Restaurant</span>
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Menu Content */}
              <div className="flex-1 overflow-y-auto py-6">
                <nav className="px-6 space-y-2">
                  {/* Profile Section */}
                  {session ? (
                    <>
                      <Link 
                        href="/profile" 
                        className={`flex items-center space-x-3 p-4 rounded-2xl transition-colors ${
                          pathname === '/profile' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-foreground">{session.user?.name ?? 'Profile'}</div>
                          <div className="text-xs text-muted-foreground">View & edit profile</div>
                        </div>
                      </Link>

                      {/* Order History */}
                      <Link 
                        href="/orders" 
                        className={`flex items-center space-x-3 p-4 rounded-2xl transition-colors ${
                          pathname === '/orders' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <span className="font-medium text-foreground">Order History</span>
                      </Link>

                      {/* Settings */}
                      <Link 
                        href="/settings"
                        className={`flex items-center space-x-3 p-4 rounded-2xl transition-colors ${
                          pathname === '/settings' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <span className="font-medium text-foreground">Settings</span>
                      </Link>

                      {/* Help/Contact */}
                      <Link 
                        href="/help"
                        className={`flex items-center space-x-3 p-4 rounded-2xl transition-colors ${
                          pathname === '/help' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span className="font-medium text-foreground">Help / Contact</span>
                      </Link>

                      {/* Logout */}
                      <button
                        onClick={() => signOut()}
                        className="flex items-center space-x-3 p-4 rounded-2xl hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                        </div>
                        <span className="font-medium text-red-600">Logout</span>
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/auth/signin"
                      className="flex items-center justify-center space-x-2 bg-primary text-primary-foreground p-4 rounded-2xl font-medium hover:bg-primary/90 transition-colors"
                    >
                      <User className="w-5 h-5" />
                      <span>Sign In</span>
                    </Link>
                  )}
                </nav>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Mobile Bottom Navigation - Only show when signed in */}
      {session && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border z-30">
          <div className="grid grid-cols-4 px-3 py-2">
            <Link 
              href="/" 
              className={`flex flex-col items-center py-2 px-2 rounded-xl transition-colors ${
                pathname === '/' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
              }`}
            >
              <Home className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">Home</span>
            </Link>
            
            <Link 
              href="/menu" 
              className={`flex flex-col items-center py-2 px-2 rounded-xl transition-colors ${
                pathname === '/menu' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
              }`}
            >
              <Search className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">Menu</span>
            </Link>
            
            <Link 
              href="/cart" 
              className={`flex flex-col items-center py-2 px-2 rounded-xl transition-colors relative ${
                pathname === '/cart' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
              }`}
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 mb-1" />
                {cartItemCount >= 0 && (
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">{cartItemCount > 9 ? '9+' : cartItemCount}</span>
                  </div>
                )}
              </div>
              <span className="text-xs font-medium">Cart</span>
            </Link>
            
            <Link 
              href="/whatsapp" 
              className={`flex flex-col items-center py-2 px-2 rounded-xl transition-colors ${
                pathname === '/whatsapp' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
              }`}
            >
              <MessageCircle className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">WhatsApp</span>
            </Link>
          </div>
        </nav>
      )}

      {/* Bottom padding for mobile navigation */}
      {session && <div className="md:hidden h-16"></div>}

      
      {/* Toast notifications */}
      <Toaster position="top-center" />
    </div>
  )
}
