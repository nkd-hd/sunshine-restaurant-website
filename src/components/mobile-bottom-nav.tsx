"use client"

import { Home, Search, ShoppingBag, Gift, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MobileBottomNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onOrderClick: () => void
}

export function MobileBottomNav({ activeTab, onTabChange, onOrderClick }: MobileBottomNavProps) {
  const navItems = [
    { id: "home", icon: Home, label: "Home" },
    { id: "browse", icon: Search, label: "Browse" },
    { id: "order", icon: ShoppingBag, label: "Order" },
    { id: "offers", icon: Gift, label: "Offers" },
    { id: "account", icon: Star, label: "Account" },
  ]

  return (
    <div className="mobile-bottom-nav">
      <div className="flex justify-around items-center">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            size="sm"
            className={`flex flex-col items-center space-y-1 p-2 ${
              activeTab === item.id ? "text-leafy-green" : "text-gray-500"
            }`}
            onClick={() => {
              if (item.id === "order") {
                onOrderClick()
              } else {
                onTabChange(item.id)
              }
            }}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}
