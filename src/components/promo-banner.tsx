"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

export function PromoBanner() {
  return (
    <Card className="bg-gradient-to-r from-leafy-green to-leafy-green/80 text-white border-0">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 p-2 rounded-full">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">Free Delivery</h3>
            <p className="text-white/90 text-sm">On orders over 5,000 FCFA</p>
          </div>
          <Button variant="secondary" size="sm" className="bg-white text-leafy-green hover:bg-white/90">
            Order Now
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
