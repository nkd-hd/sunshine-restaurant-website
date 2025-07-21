# 🌐 API Reference

Complete API documentation for Sunshine Restaurant's Convex backend.

## 🎯 Overview

Sunshine Restaurant uses Convex as a real-time serverless backend, providing type-safe APIs with automatic synchronization and built-in authentication.

**Base URL**: Convex handles routing automatically  
**Authentication**: NextAuth.js with Convex integration  
**Real-time**: All queries support live updates  

---

## 🗄️ Database Schema

### Core Tables

#### Users
```typescript
users: {
  _id: Id<"users">
  email: string
  name: string
  role: "USER" | "ADMIN"
  phone?: string
  image?: string
  emailVerified?: boolean
  createdAt: number
}
```

#### Categories
```typescript
categories: {
  _id: Id<"categories">
  name: string
  description?: string
  displayOrder: number
  active: boolean
  createdAt: number
}
```

#### Meals
```typescript
meals: {
  _id: Id<"meals">
  name: string
  description: string
  price: number
  categoryId: Id<"categories">
  images: string[]
  dietary: {
    vegetarian: boolean
    vegan: boolean
    halal: boolean
    glutenFree: boolean
    spicy: number // 0-5 scale
  }
  availability: "IN_STOCK" | "OUT_OF_STOCK" | "SEASONAL"
  featured: boolean
  createdAt: number
  updatedAt: number
}
```

#### Orders
```typescript
orders: {
  _id: Id<"orders">
  userId: Id<"users">
  items: Array<{
    mealId: Id<"meals">
    quantity: number
    price: number
    specialInstructions?: string
  }>
  status: "PENDING" | "CONFIRMED" | "PREPARING" | "READY" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED"
  totalAmount: number
  deliveryFee: number
  deliveryAddress?: {
    street: string
    neighborhood: string
    landmark?: string
    phone: string
  }
  paymentMethod: "CASH" | "MTN_MOMO" | "ORANGE_MONEY"
  paymentStatus: "PENDING" | "PAID" | "FAILED"
  notes?: string
  createdAt: number
  updatedAt: number
}
```

#### Cart
```typescript
cart: {
  _id: Id<"cart">
  userId: Id<"users">
  items: Array<{
    mealId: Id<"meals">
    quantity: number
    addedAt: number
  }>
  updatedAt: number
}
```

---

## 📋 Categories API

### Query Functions

#### `getAll`
Get all categories, optionally filtered by active status.

```typescript
api.categories.getAll({ activeOnly?: boolean })
```

**Parameters:**
- `activeOnly` (optional): If true, only return active categories

**Returns:** `Category[]`

**Example:**
```typescript
const categories = useQuery(api.categories.getAll, { activeOnly: true })
```

### Mutation Functions

#### `create`
Create a new category (Admin only).

```typescript
api.categories.create({
  name: string
  description?: string
  displayOrder?: number
})
```

**Example:**
```typescript
const categoryId = await createCategory({
  name: "Main Courses",
  description: "Hearty main dishes",
  displayOrder: 2
})
```

#### `update`
Update an existing category (Admin only).

```typescript
api.categories.update({
  id: Id<"categories">
  name?: string
  description?: string
  displayOrder?: number
  active?: boolean
})
```

#### `delete`
Delete a category (Admin only). Will fail if category has meals.

```typescript
api.categories.delete({ id: Id<"categories"> })
```

---

## 🍽️ Meals API

### Query Functions

#### `getAll`
Get all meals with optional filtering.

```typescript
api.meals.getAll({
  categoryId?: Id<"categories">
  featured?: boolean
  availability?: "IN_STOCK" | "OUT_OF_STOCK" | "SEASONAL"
  dietary?: {
    vegetarian?: boolean
    vegan?: boolean
    halal?: boolean
    glutenFree?: boolean
  }
})
```

**Example:**
```typescript
// Get all vegetarian meals in main courses
const meals = useQuery(api.meals.getAll, {
  categoryId: "category123",
  dietary: { vegetarian: true }
})
```

#### `getById`
Get a single meal by ID.

```typescript
api.meals.getById({ id: Id<"meals"> })
```

#### `getFeatured`
Get featured meals for homepage display.

```typescript
api.meals.getFeatured({ limit?: number })
```

#### `search`
Search meals by name or description.

```typescript
api.meals.search({ 
  query: string
  limit?: number 
})
```

### Mutation Functions

#### `create`
Create a new meal (Admin only).

```typescript
api.meals.create({
  name: string
  description: string
  price: number
  categoryId: Id<"categories">
  images?: string[]
  dietary?: {
    vegetarian?: boolean
    vegan?: boolean
    halal?: boolean
    glutenFree?: boolean
    spicy?: number
  }
  featured?: boolean
})
```

#### `update`
Update an existing meal (Admin only).

```typescript
api.meals.update({
  id: Id<"meals">
  name?: string
  description?: string
  price?: number
  categoryId?: Id<"categories">
  images?: string[]
  dietary?: object
  availability?: "IN_STOCK" | "OUT_OF_STOCK" | "SEASONAL"
  featured?: boolean
})
```

#### `delete`
Delete a meal (Admin only).

```typescript
api.meals.delete({ id: Id<"meals"> })
```

---

## 🛒 Cart API

### Query Functions

#### `get`
Get current user's cart items.

```typescript
api.cart.get()
```

**Returns:** Cart with populated meal data

### Mutation Functions

#### `addItem`
Add item to cart or update quantity if item exists.

```typescript
api.cart.addItem({
  mealId: Id<"meals">
  quantity: number
})
```

#### `updateQuantity`
Update item quantity in cart.

```typescript
api.cart.updateQuantity({
  mealId: Id<"meals">
  quantity: number
})
```

#### `removeItem`
Remove item from cart.

```typescript
api.cart.removeItem({ mealId: Id<"meals"> })
```

#### `clear`
Remove all items from cart.

```typescript
api.cart.clear()
```

---

## 📦 Orders API

### Query Functions

#### `getUserOrders`
Get current user's order history.

```typescript
api.orders.getUserOrders({
  limit?: number
  status?: OrderStatus
})
```

#### `getById`
Get order details by ID.

```typescript
api.orders.getById({ id: Id<"orders"> })
```

### Mutation Functions

#### `create`
Create new order from cart items.

```typescript
api.orders.create({
  deliveryAddress?: {
    street: string
    neighborhood: string
    landmark?: string
    phone: string
  }
  paymentMethod: "CASH" | "MTN_MOMO" | "ORANGE_MONEY"
  notes?: string
})
```

#### `updateStatus`
Update order status (Admin only).

```typescript
api.orders.updateStatus({
  id: Id<"orders">
  status: OrderStatus
})
```

---

## 👨‍💼 Admin API

### Query Functions

#### `getStats`
Get admin dashboard statistics.

```typescript
api.admin.getStats({
  period?: "today" | "week" | "month"
})
```

**Returns:**
```typescript
{
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  popularMeals: Array<{
    meal: Meal
    orderCount: number
  }>
}
```

#### `getAllOrders`
Get all orders for admin management.

```typescript
api.admin.getAllOrders({
  status?: OrderStatus
  limit?: number
  offset?: number
})
```

#### `getAllUsers`
Get all users for admin management.

```typescript
api.admin.getAllUsers({
  role?: "USER" | "ADMIN"
  limit?: number
})
```

### Mutation Functions

#### `updateOrderStatus`
Update any order status (Admin only).

```typescript
api.admin.updateOrderStatus({
  orderId: Id<"orders">
  status: OrderStatus
})
```

#### `updateUserRole`
Change user role (Admin only).

```typescript
api.admin.updateUserRole({
  userId: Id<"users">
  role: "USER" | "ADMIN"
})
```

---

## 🔐 Authentication

### Auth Functions

#### `getUser`
Get current authenticated user.

```typescript
api.auth.getUser()
```

#### `createUser`
Create new user account.

```typescript
api.auth.createUser({
  email: string
  name: string
  password: string
  phone?: string
})
```

---

## 📊 Real-time Subscriptions

All query functions automatically provide real-time updates. Use the `useQuery` hook for live data:

```typescript
// Automatically updates when data changes
const meals = useQuery(api.meals.getAll)
const orders = useQuery(api.admin.getAllOrders) // Admin only
const cartItems = useQuery(api.cart.get)
```

### Optimistic Updates

For immediate UI feedback, use optimistic updates:

```typescript
const addToCart = useMutation(api.cart.addItem)

// Optimistic update - UI updates immediately
await addToCart({ mealId: "meal123", quantity: 2 })
```

---

## ⚠️ Error Handling

### Common Error Types

```typescript
// Authentication required
ConvexError: "Unauthenticated"

// Insufficient permissions
ConvexError: "Insufficient permissions"

// Validation errors
ConvexError: "Invalid input: price must be positive"

// Resource not found
ConvexError: "Meal not found"
```

### Error Handling Pattern

```typescript
try {
  const meal = await createMeal(mealData)
} catch (error) {
  if (error instanceof ConvexError) {
    toast.error(error.message)
  } else {
    toast.error("An unexpected error occurred")
  }
}
```

---

## 🧪 Testing

### Query Testing

```typescript
import { convexTest } from "convex-test"

const t = convexTest()

test("should get all meals", async () => {
  const meals = await t.query(api.meals.getAll)
  expect(Array.isArray(meals)).toBe(true)
})
```

### Mutation Testing

```typescript
test("should create meal", async () => {
  const categoryId = await t.mutation(api.categories.create, {
    name: "Test Category"
  })

  const mealId = await t.mutation(api.meals.create, {
    name: "Test Meal",
    description: "Test description",
    price: 1000,
    categoryId
  })

  const meal = await t.query(api.meals.getById, { id: mealId })
  expect(meal?.name).toBe("Test Meal")
})
```

---

## 📈 Performance Tips

1. **Limit Results**: Use limit parameters for large datasets
2. **Specific Queries**: Query only needed fields
3. **Pagination**: Implement pagination for large lists
4. **Caching**: Convex automatically handles query caching
5. **Indexes**: Ensure database indexes for common queries

---

**🌐 This API provides a complete backend for restaurant operations with real-time capabilities and type safety.**
