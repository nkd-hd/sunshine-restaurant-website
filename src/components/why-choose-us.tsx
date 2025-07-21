import { Card, CardContent } from "@/components/ui/card"
import { Truck, Clock, Shield, Star, MapPin, Utensils } from "lucide-react"

const features = [
  {
    icon: Clock,
    title: "Fast Delivery",
    description: "Get your meals delivered in 30 minutes or less within Yaoundé",
  },
  {
    icon: Utensils,
    title: "Fresh Ingredients",
    description: "We use only the freshest local ingredients in all our dishes",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Safe and secure payments with Mobile Money and cash on delivery",
  },
  {
    icon: Star,
    title: "Quality Guaranteed",
    description: "4.9-star rating from over 2,500 satisfied customers",
  },
  {
    icon: MapPin,
    title: "Wide Coverage",
    description: "We deliver across all major areas in Yaoundé",
  },
  {
    icon: Truck,
    title: "Real-time Tracking",
    description: "Track your order in real-time from kitchen to your doorstep",
  },
]

export function WhyChooseUs() {
  return (
    <section className="py-12 sm:py-16 bg-wooden-brown text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">Why Choose Sunshine Restaurant?</h2>
          <p className="text-white/80 max-w-2xl mx-auto">
            We're committed to providing you with the best dining experience, from fresh ingredients to fast delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="bg-white/10 border-white/20 hover:bg-white/20 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-leafy-green flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-white/80 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
