import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Truck, Clock, Utensils, Users } from "lucide-react"

export function OrderTypeSection() {
  const orderTypes = [
    {
      id: "delivery",
      icon: Truck,
      title: "Delivery",
      subtitle: "Get it delivered to your doorstep",
      color: "bg-leafy-green",
    },
    {
      id: "pickup",
      icon: Clock,
      title: "Pickup",
      subtitle: "Skip the wait, grab and go",
      color: "bg-wooden-brown",
    },
    {
      id: "dine-in",
      icon: Utensils,
      title: "Dine-In",
      subtitle: "Enjoy at our restaurant",
      color: "bg-gray-600",
    },
    {
      id: "catering",
      icon: Users,
      title: "Catering",
      subtitle: "For groups and events",
      color: "bg-orange-500",
    },
  ]

  return (
    <section className="py-12 sm:py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-wooden-brown mb-4">
            How would you like your order?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose the option that works best for you. We're here to serve you however you prefer.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {orderTypes.map((type) => (
            <Card key={type.id} className="food-card hover:shadow-lg transition-all cursor-pointer group">
              <CardContent className="p-6 text-center space-y-4">
                <div
                  className={`${type.color} p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform`}
                >
                  <type.icon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{type.title}</h3>
                  <p className="text-gray-500 text-sm">{type.subtitle}</p>
                </div>
                <Button
                  variant="outline"
                  className="w-full border-leafy-green text-leafy-green hover:bg-leafy-green hover:text-white bg-transparent"
                >
                  Choose {type.title}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
