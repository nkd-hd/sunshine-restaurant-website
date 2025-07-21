"use client"

import { Button } from "@/components/ui/button"

interface CategoryTabsProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

export function CategoryTabs({ selectedCategory, onCategoryChange }: CategoryTabsProps) {
  const categories = [
    { id: "menu", label: "Menu" },
    { id: "featured", label: "Featured" },
    { id: "previous", label: "Previous" },
    { id: "favorites", label: "Favorites" },
  ]

  return (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? "default" : "ghost"}
          size="sm"
          className={`flex-1 ${
            selectedCategory === category.id
              ? "bg-white shadow-sm text-leafy-green"
              : "text-gray-600 hover:text-gray-900"
          }`}
          onClick={() => onCategoryChange(category.id)}
        >
          {category.label}
        </Button>
      ))}
    </div>
  )
}
