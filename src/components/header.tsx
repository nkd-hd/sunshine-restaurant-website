"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, User, History, Settings, HelpCircle, LogOut } from "lucide-react"

export function Header() {

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo - Text Only */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="font-bold text-xl">
                <span className="text-yellow-500">Sunshine</span>
                <span className="text-wooden-brown ml-1">Restaurant</span>
              </span>
            </Link>
          </div>

          {/* Hamburger Menu */}
          <div className="flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-6 mt-8">
                  {/* Profile Button */}
                  <Button variant="ghost" className="justify-start" asChild>
                    <Link href="/profile">
                      <User className="mr-3 h-5 w-5" />
                      Profile
                    </Link>
                  </Button>

                  {/* Order History */}
                  <Button variant="ghost" className="justify-start" asChild>
                    <Link href="/orders">
                      <History className="mr-3 h-5 w-5" />
                      Order History
                    </Link>
                  </Button>

                  {/* Settings */}
                  <Button variant="ghost" className="justify-start" asChild>
                    <Link href="/settings">
                      <Settings className="mr-3 h-5 w-5" />
                      Settings
                    </Link>
                  </Button>

                  {/* Help / Contact */}
                  <Button variant="ghost" className="justify-start" asChild>
                    <Link href="/help">
                      <HelpCircle className="mr-3 h-5 w-5" />
                      Help / Contact
                    </Link>
                  </Button>

                  {/* Logout */}
                  <Button variant="ghost" className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
                    <LogOut className="mr-3 h-5 w-5" />
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
