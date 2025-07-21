"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import type { Id } from "../../../../convex/_generated/dataModel"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Pencil,
  Trash2,
  FolderTree,
  RotateCcw,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"

interface Category {
  _id: Id<"mealCategories">
  name: string
  description?: string
  displayOrder: number
  isActive: "ACTIVE" | "INACTIVE"
}

export default function CategoriesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    displayOrder: 0,
  })

  // Queries
  const categories = useQuery(api.categories.getAllCategories, {
    includeInactive: true,
  })

  // Mutations
  const createCategory = useMutation(api.categories.createCategory)
  const updateCategory = useMutation(api.categories.updateCategory)
  const deleteCategory = useMutation(api.categories.deleteCategory)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingCategory) {
        await updateCategory({
          id: editingCategory._id,
          name: formData.name,
          description: formData.description,
          displayOrder: formData.displayOrder,
        })
        toast.success("Category updated successfully!")
      } else {
        await createCategory({
          name: formData.name,
          description: formData.description,
          displayOrder: formData.displayOrder,
        })
        toast.success("Category created successfully!")
      }
      setDialogOpen(false)
      resetForm()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || "",
      displayOrder: category.displayOrder,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (categoryId: Id<"mealCategories">) => {
    try {
      await deleteCategory({ id: categoryId })
      toast.success("Category deleted successfully!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Cannot delete category with meals")
    }
  }

  const toggleStatus = async (category: Category) => {
    try {
      const newStatus = category.isActive === "ACTIVE" ? "INACTIVE" : "ACTIVE"
      await updateCategory({
        id: category._id,
        isActive: newStatus,
      })
      toast.success(`Category ${newStatus.toLowerCase()} successfully!`)
    } catch (error) {
      toast.error("Failed to update category status")
    }
  }

  const resetForm = () => {
    setFormData({ name: "", description: "", displayOrder: 0 })
    setEditingCategory(null)
  }

  const openCreateDialog = () => {
    resetForm()
    setDialogOpen(true)
  }

  if (categories === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-leafy-green" />
      </div>
    )
  }

  const activeCategories = categories?.filter(c => c.isActive === "ACTIVE") || []
  const inactiveCategories = categories?.filter(c => c.isActive === "INACTIVE") || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FolderTree className="h-8 w-8 text-leafy-green" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-600">Organize your menu items</p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="bg-leafy-green hover:bg-leafy-green/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? "Edit Category" : "Create New Category"}
                </DialogTitle>
                <DialogDescription>
                  {editingCategory
                    ? "Update the category information below."
                    : "Add a new category to organize your meals."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Category Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Main Courses, Desserts"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of this category"
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="displayOrder">Display Order</Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                    placeholder="0"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-leafy-green hover:bg-leafy-green/90">
                  {editingCategory ? "Update Category" : "Create Category"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <FolderTree className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Categories</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCategories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Categories</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{inactiveCategories.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
          <CardDescription>
            Manage your meal categories and their organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categories && categories.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((category) => (
                    <TableRow key={category._id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {category.description || "—"}
                      </TableCell>
                      <TableCell>{category.displayOrder}</TableCell>
                      <TableCell>
                        <Badge
                          variant={category.isActive === "ACTIVE" ? "default" : "secondary"}
                          className={category.isActive === "ACTIVE" 
                            ? "bg-green-100 text-green-800 border-green-200" 
                            : "bg-gray-100 text-gray-800 border-gray-200"
                          }
                        >
                          {category.isActive === "ACTIVE" ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleStatus(category)}
                            className="h-8 w-8 p-0"
                          >
                            <RotateCcw className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(category)}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Category</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{category.name}"? This action cannot be undone and will fail if the category contains meals.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(category._id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete Category
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <FolderTree className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first meal category.</p>
              <Button onClick={openCreateDialog} className="bg-leafy-green hover:bg-leafy-green/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Category
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
