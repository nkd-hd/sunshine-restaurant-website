import { Button } from "@/components/ui/button"
import { ArrowRight, Clock, Truck, Star } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-leafy-green to-leafy-green/80 text-white">
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="space-y-6 lg:space-y-8">
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold leading-tight">
                Fresh, Delicious Meals
                <span className="block text-yellow-300">Delivered Fast</span>
              </h1>
              <p className="text-lg sm:text-xl text-white/90 max-w-lg">
                Experience the finest cuisine in Yaoundé with our carefully crafted meals, made from fresh local
                ingredients and delivered right to your doorstep.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-white text-leafy-green hover:bg-white/90">
                <Link href="/menu">
                  Order Now <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-leafy-green bg-transparent"
              >
                View Menu
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-6 lg:pt-8">
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-300" />
                </div>
                <div className="text-xl sm:text-2xl font-bold">30min</div>
                <div className="text-xs sm:text-sm text-white/80">Delivery Time</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Truck className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-300" />
                </div>
                <div className="text-xl sm:text-2xl font-bold">Free</div>
                <div className="text-xs sm:text-sm text-white/80">Delivery</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Star className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-300" />
                </div>
                <div className="text-xl sm:text-2xl font-bold">4.9</div>
                <div className="text-xs sm:text-sm text-white/80">Rating</div>
              </div>
            </div>
          </div>

          <div className="relative mt-8 lg:mt-0">
            <div className="aspect-square rounded-2xl overflow-hidden bg-white/10 backdrop-blur">
              <img
                src="/placeholder.svg?height=600&width=600"
                alt="Delicious meals from Sunshine Restaurant"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 bg-white rounded-xl p-3 sm:p-4 shadow-xl">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-leafy-green flex items-center justify-center">
                  <Star className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-wooden-brown text-sm sm:text-base">4.9 Rating</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">2,500+ Reviews</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
