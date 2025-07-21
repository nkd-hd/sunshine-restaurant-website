"use client"

import { MapPin, User, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function MobileHeader() {
  return (
    <div className="mobile-header">
      <div className="flex items-center space-x-2">
        <MapPin className="h-5 w-5 text-leafy-green" />
        <div>
          <p className="text-sm font-medium">Deliver to</p>
          <p className="text-xs text-gray-500">Bastos, Yaoundé</p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="sm" className="relative">
          <ShoppingBag className="h-5 w-5" />
          <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-leafy-green text-xs">
            2
          </Badge>
        </Button>
        <Button variant="ghost" size="sm">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
