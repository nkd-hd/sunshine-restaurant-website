"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const categories = [
  { id: "all", name: "All Categories", count: 24 },
  { id: "traditional", name: "Traditional", count: 8 },
  { id: "main-course", name: "Main Course", count: 10 },
  { id: "seafood", name: "Seafood", count: 4 },
  { id: "vegetarian", name: "Vegetarian", count: 6 },
  { id: "beverages", name: "Beverages", count: 8 },
]

const dietaryFilters = [
  { id: "vegetarian", name: "Vegetarian" },
  { id: "vegan", name: "Vegan" },
  { id: "gluten-free", name: "Gluten Free" },
  { id: "dairy-free", name: "Dairy Free" },
]

const allergenFilters = [
  { id: "nuts", name: "Contains Nuts" },
  { id: "gluten", name: "Contains Gluten" },
  { id: "dairy", name: "Contains Dairy" },
  { id: "fish", name: "Contains Fish" },
  { id: "soy", name: "Contains Soy" },
]

interface MenuFiltersProps {
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  selectedFilters: string[]
  setSelectedFilters: (filters: string[]) => void
}

export function MenuFilters({
  selectedCategory,
  setSelectedCategory,
  selectedFilters,
  setSelectedFilters,
}: MenuFiltersProps) {
  const handleFilterChange = (filterId: string, checked: boolean) => {
    if (checked) {
      setSelectedFilters([...selectedFilters, filterId])
    } else {
      setSelectedFilters(selectedFilters.filter((f) => f !== filterId))
    }
  }

  const clearAllFilters = () => {
    setSelectedCategory("all")
    setSelectedFilters([])
  }

  return (
    <div className="space-y-6">
      {/* Active Filters */}
      {(selectedCategory !== "all" || selectedFilters.length > 0) && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Active Filters</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {selectedCategory !== "all" && (
                <Badge variant="secondary">{categories.find((c) => c.id === selectedCategory)?.name}</Badge>
              )}
              {selectedFilters.map((filter) => (
                <Badge key={filter} variant="secondary">
                  {[...dietaryFilters, ...allergenFilters].find((f) => f.id === filter)?.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "ghost"}
                className="w-full justify-between"
                onClick={() => setSelectedCategory(category.id)}
              >
                <span>{category.name}</span>
                <Badge variant="outline">{category.count}</Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dietary Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Dietary Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dietaryFilters.map((filter) => (
              <div key={filter.id} className="flex items-center space-x-2">
                <Checkbox
                  id={filter.id}
                  checked={selectedFilters.includes(filter.id)}
                  onCheckedChange={(checked) => handleFilterChange(filter.id, checked as boolean)}
                />
                <label
                  htmlFor={filter.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {filter.name}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Allergen Information */}
      <Card>
        <CardHeader>
          <CardTitle>Allergen Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {allergenFilters.map((filter) => (
              <div key={filter.id} className="flex items-center space-x-2">
                <Checkbox
                  id={filter.id}
                  checked={selectedFilters.includes(filter.id)}
                  onCheckedChange={(checked) => handleFilterChange(filter.id, checked as boolean)}
                />
                <label
                  htmlFor={filter.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {filter.name}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
