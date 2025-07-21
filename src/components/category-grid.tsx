"use client"

import { Utensils, Coffee, Soup, Fish, Salad, Cake } from "lucide-react"

export function CategoryGrid() {
  const categories = [
    { id: "traditional", icon: Soup, label: "Traditional", color: "bg-orange-100 text-orange-600" },
    { id: "main", icon: Utensils, label: "Main Course", color: "bg-red-100 text-red-600" },
    { id: "seafood", icon: Fish, label: "Seafood", color: "bg-blue-100 text-blue-600" },
    { id: "vegetarian", icon: Salad, label: "Vegetarian", color: "bg-green-100 text-green-600" },
    { id: "beverages", icon: Coffee, label: "Beverages", color: "bg-purple-100 text-purple-600" },
    { id: "desserts", icon: Cake, label: "Desserts", color: "bg-pink-100 text-pink-600" },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Categories</h2>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {categories.map((category) => (
          <div key={category.id} className="flex flex-col items-center space-y-2 cursor-pointer">
            <div className={`category-pill ${category.color}`}>
              <category.icon className="h-6 w-6" />
            </div>
            <span className="text-xs font-medium text-center">{category.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
