import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Flame } from "lucide-react"

const specials = [
  {
    id: 1,
    name: "Grilled Tilapia Special",
    description: "Fresh tilapia grilled to perfection with local spices, served with plantains and vegetables",
    originalPrice: 3500,
    specialPrice: 2800,
    image: "/placeholder.svg?height=200&width=300",
    timeLeft: "4 hours left",
    isHot: true,
  },
  {
    id: 2,
    name: "Ndolé Deluxe",
    description: "Traditional Cameroonian ndolé with beef, fish, and groundnuts",
    originalPrice: 4000,
    specialPrice: 3200,
    image: "/placeholder.svg?height=200&width=300",
    timeLeft: "6 hours left",
    isHot: false,
  },
  {
    id: 3,
    name: "Jollof Rice Combo",
    description: "Spicy jollof rice with grilled chicken and coleslaw",
    originalPrice: 3000,
    specialPrice: 2400,
    image: "/placeholder.svg?height=200&width=300",
    timeLeft: "8 hours left",
    isHot: true,
  },
]

export function DailySpecials() {
  return (
    <section className="py-12 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <Badge className="mb-4 bg-leafy-green">Today's Specials</Badge>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-wooden-brown mb-4">Limited Time Offers</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Don't miss out on these amazing deals! Fresh, delicious meals at special prices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {specials.map((special) => (
            <Card key={special.id} className="food-card group">
              <div className="relative">
                <img
                  src={special.image || "/placeholder.svg"}
                  alt={special.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  {special.isHot && (
                    <Badge className="bg-red-500 hover:bg-red-600">
                      <Flame className="h-3 w-3 mr-1" />
                      Hot Deal
                    </Badge>
                  )}
                  <Badge variant="secondary" className="bg-white/90">
                    <Clock className="h-3 w-3 mr-1" />
                    {special.timeLeft}
                  </Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge className="bg-leafy-green text-white">
                    Save {Math.round(((special.originalPrice - special.specialPrice) / special.originalPrice) * 100)}%
                  </Badge>
                </div>
              </div>

              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">{special.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{special.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-leafy-green">
                      {special.specialPrice.toLocaleString()} FCFA
                    </span>
                    <span className="text-sm text-muted-foreground line-through">
                      {special.originalPrice.toLocaleString()} FCFA
                    </span>
                  </div>
                </div>

                <Button className="w-full bg-leafy-green hover:bg-leafy-green/90">Add to Cart</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
