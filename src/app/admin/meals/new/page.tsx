"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../../../convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  Save,
  UtensilsCrossed,
  ImageIcon,
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface MealFormData {
  name: string
  description: string
  ingredients: string
  price: number
  categoryId: string
  imageUrl: string
  portionSize: string
  preparationTime: number
  calories: number
  isVegetarian: boolean
  isVegan: boolean
  isHalal: boolean
  isGlutenFree: boolean
  isDairyFree: boolean
  isNutFree: boolean
  allergens: string[]
  stockQuantity: number
  minimumOrderQuantity: number
  maximumOrderQuantity: number
  displayOrder: number
}

const initialFormData: MealFormData = {
  name: "",
  description: "",
  ingredients: "",
  price: 0,
  categoryId: "",
  imageUrl: "",
  portionSize: "",
  preparationTime: 0,
  calories: 0,
  isVegetarian: false,
  isVegan: false,
  isHalal: false,
  isGlutenFree: false,
  isDairyFree: false,
  isNutFree: false,
  allergens: [],
  stockQuantity: 0,
  minimumOrderQuantity: 1,
  maximumOrderQuantity: 0,
  displayOrder: 0,
}

const commonAllergens = [
  "Nuts", "Peanuts", "Dairy", "Eggs", "Soy", "Wheat", "Fish", "Shellfish"
]

export default function NewMealPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<MealFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Get categories for dropdown
  const categories = useQuery(api.categories.getAllCategories, { includeInactive: false })
  
  // Create meal mutation
  const createMeal = useMutation(api.meals.createMeal)

  const handleInputChange = (field: keyof MealFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleDietaryChange = (field: keyof MealFormData, checked: boolean) => {
    setFormData(prev => ({ ...prev, [field]: checked }))
  }

  const handleAllergenToggle = (allergen: string) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter(a => a !== allergen)
        : [...prev.allergens, allergen]
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setImagePreview(result)
        setFormData(prev => ({ ...prev, imageUrl: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || formData.price <= 0) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    try {
      await createMeal({
        name: formData.name,
        description: formData.description || undefined,
        ingredients: formData.ingredients || undefined,
        price: formData.price,
        categoryId: formData.categoryId ? (formData.categoryId as any) : undefined,
        imageUrl: formData.imageUrl || undefined,
        portionSize: formData.portionSize || undefined,
        preparationTime: formData.preparationTime || undefined,
        calories: formData.calories || undefined,
        isVegetarian: formData.isVegetarian ? "YES" : "NO",
        isVegan: formData.isVegan ? "YES" : "NO", 
        isHalal: formData.isHalal ? "YES" : "NO",
        isGlutenFree: formData.isGlutenFree ? "YES" : "NO",
        isDairyFree: formData.isDairyFree ? "YES" : "NO",
        isNutFree: formData.isNutFree ? "YES" : "NO",
        allergens: formData.allergens.length > 0 ? formData.allergens : undefined,
        stockQuantity: formData.stockQuantity || undefined,
        minimumOrderQuantity: formData.minimumOrderQuantity,
        maximumOrderQuantity: formData.maximumOrderQuantity || undefined,
        displayOrder: formData.displayOrder,
      })
      
      toast.success("Meal created successfully!")
      router.push("/admin/meals")
    } catch (error) {
      console.error("Failed to create meal:", error)
      toast.error("Failed to create meal. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/meals">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Meals
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Add New Meal</h1>
          <p className="text-muted-foreground">Create a new menu item for your restaurant</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Essential details about your meal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Meal Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="e.g., Ndolé (Peanut Spinach Stew)"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Describe your meal, its taste, and what makes it special"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ingredients">Ingredients</Label>
                  <Textarea
                    id="ingredients"
                    value={formData.ingredients}
                    onChange={(e) => handleInputChange("ingredients", e.target.value)}
                    placeholder="List the main ingredients (optional)"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (XAF) *</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="100"
                      value={formData.price}
                      onChange={(e) => handleInputChange("price", parseFloat(e.target.value) || 0)}
                      placeholder="5000"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="portionSize">Portion Size</Label>
                    <Input
                      id="portionSize"
                      value={formData.portionSize}
                      onChange={(e) => handleInputChange("portionSize", e.target.value)}
                      placeholder="Medium, Large"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preparationTime">Prep Time (min)</Label>
                    <Input
                      id="preparationTime"
                      type="number"
                      min="0"
                      value={formData.preparationTime}
                      onChange={(e) => handleInputChange("preparationTime", parseInt(e.target.value) || 0)}
                      placeholder="20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="calories">Calories</Label>
                    <Input
                      id="calories"
                      type="number"
                      min="0"
                      value={formData.calories}
                      onChange={(e) => handleInputChange("calories", parseInt(e.target.value) || 0)}
                      placeholder="350"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dietary Information */}
            <Card>
              <CardHeader>
                <CardTitle>Dietary Information</CardTitle>
                <CardDescription>
                  Help customers find meals that fit their dietary needs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="vegetarian"
                      checked={formData.isVegetarian}
                      onCheckedChange={(checked) => handleDietaryChange("isVegetarian", checked as boolean)}
                    />
                    <Label htmlFor="vegetarian">Vegetarian</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="vegan"
                      checked={formData.isVegan}
                      onCheckedChange={(checked) => handleDietaryChange("isVegan", checked as boolean)}
                    />
                    <Label htmlFor="vegan">Vegan</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="halal"
                      checked={formData.isHalal}
                      onCheckedChange={(checked) => handleDietaryChange("isHalal", checked as boolean)}
                    />
                    <Label htmlFor="halal">Halal</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="glutenFree"
                      checked={formData.isGlutenFree}
                      onCheckedChange={(checked) => handleDietaryChange("isGlutenFree", checked as boolean)}
                    />
                    <Label htmlFor="glutenFree">Gluten Free</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="dairyFree"
                      checked={formData.isDairyFree}
                      onCheckedChange={(checked) => handleDietaryChange("isDairyFree", checked as boolean)}
                    />
                    <Label htmlFor="dairyFree">Dairy Free</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="nutFree"
                      checked={formData.isNutFree}
                      onCheckedChange={(checked) => handleDietaryChange("isNutFree", checked as boolean)}
                    />
                    <Label htmlFor="nutFree">Nut Free</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Common Allergens</Label>
                  <div className="flex flex-wrap gap-2">
                    {commonAllergens.map((allergen) => (
                      <Badge
                        key={allergen}
                        variant={formData.allergens.includes(allergen) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleAllergenToggle(allergen)}
                      >
                        {allergen}
                        {formData.allergens.includes(allergen) && (
                          <X className="h-3 w-3 ml-1" />
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Image Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Meal Image</CardTitle>
                <CardDescription>
                  Upload an appetizing photo of your dish
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Meal preview"
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setImagePreview(null)
                          setFormData(prev => ({ ...prev, imageUrl: "" }))
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">No image uploaded</p>
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="imageUpload" className="cursor-pointer">
                      <Button type="button" variant="outline" className="w-full" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Image
                        </span>
                      </Button>
                    </Label>
                    <Input
                      id="imageUpload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inventory */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory & Ordering</CardTitle>
                <CardDescription>
                  Stock and ordering information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="stockQuantity">Stock Quantity</Label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    min="0"
                    value={formData.stockQuantity}
                    onChange={(e) => handleInputChange("stockQuantity", parseInt(e.target.value) || 0)}
                    placeholder="0 for unlimited"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minOrder">Min Order</Label>
                    <Input
                      id="minOrder"
                      type="number"
                      min="1"
                      value={formData.minimumOrderQuantity}
                      onChange={(e) => handleInputChange("minimumOrderQuantity", parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxOrder">Max Order</Label>
                    <Input
                      id="maxOrder"
                      type="number"
                      min="0"
                      value={formData.maximumOrderQuantity}
                      onChange={(e) => handleInputChange("maximumOrderQuantity", parseInt(e.target.value) || 0)}
                      placeholder="0 for unlimited"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="displayOrder">Display Order</Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    min="0"
                    value={formData.displayOrder}
                    onChange={(e) => handleInputChange("displayOrder", parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div><strong>Name:</strong> {formData.name || "Untitled Meal"}</div>
                  <div><strong>Price:</strong> {formatCurrency(formData.price)}</div>
                  {formData.description && (
                    <div><strong>Description:</strong> {formData.description.substring(0, 50)}...</div>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {formData.isVegetarian && <Badge variant="outline" className="text-green-600">V</Badge>}
                    {formData.isVegan && <Badge variant="outline" className="text-green-700">VG</Badge>}
                    {formData.isHalal && <Badge variant="outline" className="text-blue-600">H</Badge>}
                    {formData.isGlutenFree && <Badge variant="outline" className="text-purple-600">GF</Badge>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/meals">Cancel</Link>
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || !formData.name || formData.price <= 0}
            className="bg-leafy-green hover:bg-leafy-green/90"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Meal
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
