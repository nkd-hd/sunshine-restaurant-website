import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Plus } from "lucide-react"

// Extended menu items with more variety
const menuItems = [
  {
    id: 1,
    name: "Poulet DG",
    description: "Grilled chicken with plantains and vegetables in a rich sauce",
    price: 4500,
    rating: 4.8,
    reviews: 124,
    image: "/placeholder.svg?height=250&width=350",
    category: "main-course",
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isDairyFree: true,
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
    category: "traditional",
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    isDairyFree: true,
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
    category: "seafood",
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    isDairyFree: true,
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
    category: "vegetarian",
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    isDairyFree: true,
    allergens: ["soy"],
  },
  {
    id: 5,
    name: "Ndolé Deluxe",
    description: "Traditional Cameroonian ndolé with beef, fish, and groundnuts",
    price: 4000,
    rating: 4.8,
    reviews: 203,
    image: "/placeholder.svg?height=250&width=350",
    category: "traditional",
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    isDairyFree: true,
    allergens: ["nuts", "fish"],
  },
  {
    id: 6,
    name: "Plantain Porridge",
    description: "Creamy plantain porridge with vegetables and spices",
    price: 2500,
    rating: 4.5,
    reviews: 67,
    image: "/placeholder.svg?height=250&width=350",
    category: "traditional",
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    isDairyFree: true,
    allergens: [],
  },
  {
    id: 7,
    name: "Grilled Tilapia",
    description: "Fresh tilapia grilled to perfection with local spices",
    price: 3500,
    rating: 4.7,
    reviews: 92,
    image: "/placeholder.svg?height=250&width=350",
    category: "seafood",
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    isDairyFree: true,
    allergens: ["fish"],
  },
  {
    id: 8,
    name: "Jollof Rice",
    description: "Spicy jollof rice with your choice of protein",
    price: 3000,
    rating: 4.6,
    reviews: 145,
    image: "/placeholder.svg?height=250&width=350",
    category: "main-course",
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    isDairyFree: true,
    allergens: [],
  },
]

interface MenuGridProps {
  searchQuery: string
  selectedCategory: string
  selectedFilters: string[]
}

export function MenuGrid({ searchQuery, selectedCategory, selectedFilters }: MenuGridProps) {
  const filteredItems = menuItems.filter((item) => {
    // Search filter
    if (
      searchQuery &&
      !item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }

    // Category filter
    if (selectedCategory !== "all" && item.category !== selectedCategory) {
      return false
    }

    // Dietary filters
    if (selectedFilters.includes("vegetarian") && !item.isVegetarian) return false
    if (selectedFilters.includes("vegan") && !item.isVegan) return false
    if (selectedFilters.includes("gluten-free") && !item.isGlutenFree) return false
    if (selectedFilters.includes("dairy-free") && !item.isDairyFree) return false

    // Allergen filters
    if (selectedFilters.includes("nuts") && !item.allergens.includes("nuts")) return false
    if (selectedFilters.includes("gluten") && !item.allergens.includes("gluten")) return false
    if (selectedFilters.includes("dairy") && !item.allergens.includes("dairy")) return false
    if (selectedFilters.includes("fish") && !item.allergens.includes("fish")) return false
    if (selectedFilters.includes("soy") && !item.allergens.includes("soy")) return false

    return true
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted-foreground">
          Showing {filteredItems.length} of {menuItems.length} items
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
            <div className="relative">
              <img
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-4 left-4 flex gap-1">
                {item.isVegetarian && <Badge className="bg-green-500 hover:bg-green-600 text-xs">Vegetarian</Badge>}
                {item.isVegan && <Badge className="bg-green-600 hover:bg-green-700 text-xs">Vegan</Badge>}
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
                <h3 className="font-semibold text-lg">{item.name}</h3>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{item.rating}</span>
                  <span className="text-xs text-muted-foreground">({item.reviews})</span>
                </div>
              </div>

              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{item.description}</p>

              {item.allergens.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-1">Contains:</p>
                  <div className="flex gap-1 flex-wrap">
                    {item.allergens.map((allergen) => (
                      <Badge key={allergen} variant="outline" className="text-xs">
                        {allergen}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-leafy-green">{item.price.toLocaleString()} FCFA</span>
                <Button className="bg-leafy-green hover:bg-leafy-green/90">Add to Cart</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No items found matching your criteria.</p>
          <p className="text-muted-foreground text-sm mt-2">Try adjusting your filters or search terms.</p>
        </div>
      )}
    </div>
  )
}
