"use client"

import { useState } from "react"
import Link from "next/link"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Plus,
  Search,
  Edit,
  Trash2,
  Star,
  StarOff,
  Eye,
  EyeOff,
  UtensilsCrossed,
  Filter,
  MoreVertical
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

export default function MealsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all")

  // Get data from Convex
  const meals = useQuery(api.meals.getAllMealsAdmin, {
    searchTerm: searchTerm || undefined,
    categoryId: categoryFilter === "all" ? undefined : categoryFilter,
    availability: availabilityFilter === "all" ? undefined : availabilityFilter,
  })
  
  const categories = useQuery(api.categories.getAllCategories)

  // Mutations
  const toggleAvailability = useMutation(api.meals.toggleMealAvailability)
  const toggleFeatured = useMutation(api.meals.toggleFeaturedStatus)
  const deleteMeal = useMutation(api.meals.deleteMeal)

  const handleToggleAvailability = async (mealId: string, currentStatus: string) => {
    const newStatus = currentStatus === "AVAILABLE" ? "OUT_OF_STOCK" : "AVAILABLE"
    try {
      await toggleAvailability({ 
        id: mealId as any, 
        availability: newStatus as any 
      })
      toast.success(`Meal marked as ${newStatus.toLowerCase().replace('_', ' ')}`)
    } catch (error) {
      toast.error("Failed to update meal status")
    }
  }

  const handleToggleFeatured = async (mealId: string, currentStatus: string) => {
    const newStatus = currentStatus === "YES" ? "NO" : "YES"
    try {
      await toggleFeatured({ 
        id: mealId as any, 
        featured: newStatus as any 
      })
      toast.success(`Meal ${newStatus === "YES" ? "added to" : "removed from"} featured`)
    } catch (error) {
      toast.error("Failed to update featured status")
    }
  }

  const handleDeleteMeal = async (mealId: string, mealName: string) => {
    if (!confirm(`Are you sure you want to delete "${mealName}"?`)) return
    
    try {
      await deleteMeal({ id: mealId as any })
      toast.success("Meal deleted successfully")
    } catch (error) {
      toast.error("Failed to delete meal")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return <Badge className="bg-green-100 text-green-800">Available</Badge>
      case "OUT_OF_STOCK":
        return <Badge variant="destructive">Out of Stock</Badge>
      case "DISCONTINUED":
        return <Badge variant="secondary">Discontinued</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Meals</h1>
          <p className="text-muted-foreground">
            Manage your restaurant's menu items
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/meals/new">
            <Plus className="mr-2 h-4 w-4" />
            Add New Meal
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search meals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="AVAILABLE">Available</SelectItem>
                <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                <SelectItem value="DISCONTINUED">Discontinued</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Meals Grid */}
      {meals === undefined ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-leafy-green mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading meals...</p>
        </div>
      ) : meals.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <UtensilsCrossed className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No meals found</h3>
            <p className="mt-2 text-gray-500">
              {searchTerm || (categoryFilter !== "all") || (availabilityFilter !== "all")
                ? "Try adjusting your filters"
                : "Get started by adding your first meal to the menu"
              }
            </p>
            {!searchTerm && categoryFilter === "all" && availabilityFilter === "all" && (
              <Button asChild className="mt-4">
                <Link href="/admin/meals/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Meal
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {meals.map((meal) => (
            <Card key={meal._id} className="overflow-hidden">
              <div className="aspect-video bg-gray-100 relative">
                {meal.imageUrl ? (
                  <img
                    src={meal.imageUrl}
                    alt={meal.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <UtensilsCrossed className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                
                {/* Featured Badge */}
                {meal.isFeatured === "YES" && (
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-yellow-500 text-white">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                )}

                {/* Actions Dropdown */}
                <div className="absolute top-2 right-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/meals/${meal._id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleToggleAvailability(meal._id, meal.isAvailable)}
                      >
                        {meal.isAvailable === "AVAILABLE" ? (
                          <><EyeOff className="mr-2 h-4 w-4" />Mark Out of Stock</>
                        ) : (
                          <><Eye className="mr-2 h-4 w-4" />Mark Available</>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleToggleFeatured(meal._id, meal.isFeatured)}
                      >
                        {meal.isFeatured === "YES" ? (
                          <><StarOff className="mr-2 h-4 w-4" />Remove from Featured</>
                        ) : (
                          <><Star className="mr-2 h-4 w-4" />Add to Featured</>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteMeal(meal._id, meal.name)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg line-clamp-1">{meal.name}</h3>
                  {getStatusBadge(meal.isAvailable)}
                </div>
                
                {meal.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {meal.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-leafy-green">
                    {meal.promotionalPrice ? (
                      <>
                        <span className="line-through text-gray-400 text-sm mr-2">
                          ${meal.price}
                        </span>
                        ${meal.promotionalPrice}
                      </>
                    ) : (
                      `$${meal.price}`
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {meal.isVegetarian === "YES" && (
                      <Badge variant="outline" className="text-green-600">V</Badge>
                    )}
                    {meal.isVegan === "YES" && (
                      <Badge variant="outline" className="text-green-700">VG</Badge>
                    )}
                    {meal.isGlutenFree === "YES" && (
                      <Badge variant="outline" className="text-blue-600">GF</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
