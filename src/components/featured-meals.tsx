import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Plus } from "lucide-react"

const featuredMeals = [
  {
    id: 1,
    name: "Poulet DG",
    description: "Grilled chicken with plantains and vegetables in a rich sauce",
    price: 4500,
    rating: 4.8,
    reviews: 124,
    image: "/placeholder.svg?height=250&width=350",
    category: "Main Course",
    isVegetarian: false,
    allergens: ["gluten"],
  },
  {
    id: 2,
    name: "Eru with Fufu",
    description: "Traditional Cameroonian eru soup with pounded fufu",
    price: 3800,
    rating: 4.9,
    reviews: 89,
    image: "/placeholder.svg?height=250&width=350",
    category: "Traditional",
    isVegetarian: true,
    allergens: [],
  },
  {
    id: 3,
    name: "Grilled Fish Platter",
    description: "Fresh fish grilled with local spices, served with rice and salad",
    price: 5200,
    rating: 4.7,
    reviews: 156,
    image: "/placeholder.svg?height=250&width=350",
    category: "Seafood",
    isVegetarian: false,
    allergens: ["fish"],
  },
  {
    id: 4,
    name: "Vegetable Fried Rice",
    description: "Aromatic fried rice with mixed vegetables and spices",
    price: 2800,
    rating: 4.6,
    reviews: 78,
    image: "/placeholder.svg?height=250&width=350",
    category: "Vegetarian",
    isVegetarian: true,
    allergens: ["soy"],
  },
  {
    id: 5,
    name: "Beef Stew with Rice",
    description: "Tender beef stew with aromatic spices served with jasmine rice",
    price: 4200,
    rating: 4.8,
    reviews: 203,
    image: "/placeholder.svg?height=250&width=350",
    category: "Main Course",
    isVegetarian: false,
    allergens: [],
  },
  {
    id: 6,
    name: "Plantain Porridge",
    description: "Creamy plantain porridge with vegetables and spices",
    price: 2500,
    rating: 4.5,
    reviews: 67,
    image: "/placeholder.svg?height=250&width=350",
    category: "Traditional",
    isVegetarian: true,
    allergens: [],
  },
]

export function FeaturedMeals() {
  return (
    <section className="py-12 sm:py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <Badge className="mb-4 bg-wooden-brown">Featured Meals</Badge>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-wooden-brown mb-4">Our Most Popular Dishes</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our customers' favorite meals, carefully prepared with fresh ingredients and authentic flavors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredMeals.map((meal) => (
            <Card key={meal.id} className="food-card group">
              <div className="relative">
                <img
                  src={meal.image || "/placeholder.svg"}
                  alt={meal.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary" className="bg-white/90">
                    {meal.category}
                  </Badge>
                </div>
                <div className="absolute top-4 right-4 flex gap-1">
                  {meal.isVegetarian && <Badge className="bg-green-500 hover:bg-green-600 text-xs">Vegetarian</Badge>}
                </div>
                <Button
                  size="sm"
                  className="absolute bottom-4 right-4 rounded-full h-10 w-10 p-0 bg-leafy-green hover:bg-leafy-green/90 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg">{meal.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{meal.rating}</span>
                    <span className="text-xs text-muted-foreground">({meal.reviews})</span>
                  </div>
                </div>

                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{meal.description}</p>

                {meal.allergens.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-1">Contains:</p>
                    <div className="flex gap-1">
                      {meal.allergens.map((allergen) => (
                        <Badge key={allergen} variant="outline" className="text-xs">
                          {allergen}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-leafy-green">{meal.price.toLocaleString()} FCFA</span>
                  <Button className="bg-leafy-green hover:bg-leafy-green/90">Add to Cart</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8 sm:mt-12">
          <Button
            variant="outline"
            size="lg"
            className="border-leafy-green text-leafy-green hover:bg-leafy-green hover:text-white bg-transparent"
          >
            View Full Menu
          </Button>
        </div>
      </div>
    </section>
  )
}
