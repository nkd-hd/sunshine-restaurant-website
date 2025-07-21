import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all meals with optional filtering - Optimized with pagination and indexing
export const getAllMeals = query({
  args: {
    categoryId: v.optional(v.id("mealCategories")),
    isAvailable: v.optional(v.literal("AVAILABLE")),
    isFeatured: v.optional(v.literal("YES")),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()), // For pagination
    searchTerm: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 24, 100); // Max 100 items per request
    
    let query = ctx.db.query("meals");

    // Use indexes for better performance
    if (args.categoryId && args.isAvailable) {
      // Use composite index if available
      query = query.withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
                   .filter((q) => q.eq(q.field("isAvailable"), args.isAvailable));
    } else if (args.categoryId) {
      query = query.withIndex("by_category", (q) => q.eq("categoryId", args.categoryId));
    } else if (args.isAvailable) {
      query = query.withIndex("by_availability", (q) => q.eq("isAvailable", args.isAvailable));
    } else if (args.isFeatured) {
      query = query.withIndex("by_featured", (q) => q.eq("isFeatured", args.isFeatured));
    }

    // Apply additional filters
    if (args.isAvailable && !args.categoryId) {
      query = query.filter((q) => q.eq(q.field("isAvailable"), args.isAvailable));
    }

    if (args.isFeatured && !query.constructor.name.includes('IndexRange')) {
      query = query.filter((q) => q.eq(q.field("isFeatured"), args.isFeatured));
    }

    // Order by display order for consistent results
    query = query.order("desc");

    // Apply pagination cursor
    if (args.cursor) {
      query = query.filter((q) => q.lt(q.field("_creationTime"), parseInt(args.cursor!)));
    }

    const meals = await query.take(limit + 1); // Take one extra to check if there are more
    const hasMore = meals.length > limit;
    const results = hasMore ? meals.slice(0, limit) : meals;

    // Client-side search filtering if needed (for small datasets)
    let filteredResults = results;
    if (args.searchTerm) {
      const searchLower = args.searchTerm.toLowerCase();
      filteredResults = results.filter(meal => 
        meal.name.toLowerCase().includes(searchLower) ||
        (meal.description && meal.description.toLowerCase().includes(searchLower)) ||
        (meal.ingredients && meal.ingredients.toLowerCase().includes(searchLower))
      );
    }

    return {
      meals: filteredResults,
      hasMore,
      nextCursor: hasMore ? results[results.length - 1]._creationTime.toString() : null,
    };
  },
});

// Get meal by ID
export const getMealById = query({
  args: { id: v.id("meals") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get featured meals
export const getFeaturedMeals = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 6;
    
    return await ctx.db
      .query("meals")
      .withIndex("by_featured", (q) => q.eq("isFeatured", "YES"))
      .filter((q) => q.eq(q.field("isAvailable"), "AVAILABLE"))
      .take(limit);
  },
});

// Get meals by category
export const getMealsByCategory = query({
  args: { categoryId: v.id("mealCategories") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("meals")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .filter((q) => q.eq(q.field("isAvailable"), "AVAILABLE"))
      .collect();
  },
});

// Create meal (admin only)
export const createMeal = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    ingredients: v.optional(v.string()),
    price: v.number(),
    categoryId: v.optional(v.id("mealCategories")),
    imageUrl: v.optional(v.string()),
    portionSize: v.optional(v.string()),
    preparationTime: v.optional(v.number()),
    calories: v.optional(v.number()),
    isVegetarian: v.optional(v.union(v.literal("YES"), v.literal("NO"))),
    isVegan: v.optional(v.union(v.literal("YES"), v.literal("NO"))),
    isHalal: v.optional(v.union(v.literal("YES"), v.literal("NO"))),
    isGlutenFree: v.optional(v.union(v.literal("YES"), v.literal("NO"))),
    isDairyFree: v.optional(v.union(v.literal("YES"), v.literal("NO"))),
    isNutFree: v.optional(v.union(v.literal("YES"), v.literal("NO"))),
    allergens: v.optional(v.array(v.string())),
    stockQuantity: v.optional(v.number()),
    minimumOrderQuantity: v.optional(v.number()),
    maximumOrderQuantity: v.optional(v.number()),
    displayOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("meals", {
      name: args.name,
      description: args.description,
      ingredients: args.ingredients,
      price: args.price,
      categoryId: args.categoryId,
      imageUrl: args.imageUrl,
      portionSize: args.portionSize,
      preparationTime: args.preparationTime,
      calories: args.calories,
      isVegetarian: args.isVegetarian ?? "NO",
      isVegan: args.isVegan ?? "NO",
      isHalal: args.isHalal ?? "NO",
      isGlutenFree: args.isGlutenFree ?? "NO",
      isDairyFree: args.isDairyFree ?? "NO",
      isNutFree: args.isNutFree ?? "NO",
      allergens: args.allergens,
      isAvailable: "AVAILABLE",
      isFeatured: "NO",
      stockQuantity: args.stockQuantity,
      minimumOrderQuantity: args.minimumOrderQuantity ?? 1,
      maximumOrderQuantity: args.maximumOrderQuantity,
      displayOrder: args.displayOrder ?? 0,
    });
  },
});

// Update meal (admin only) - comprehensive update
export const updateMeal = mutation({
  args: {
    id: v.id("meals"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    ingredients: v.optional(v.string()),
    price: v.optional(v.number()),
    promotionalPrice: v.optional(v.number()),
    promotionStartDate: v.optional(v.string()),
    promotionEndDate: v.optional(v.string()),
    categoryId: v.optional(v.id("mealCategories")),
    imageUrl: v.optional(v.string()),
    imageUrls: v.optional(v.array(v.string())),
    portionSize: v.optional(v.string()),
    preparationTime: v.optional(v.number()),
    calories: v.optional(v.number()),
    isVegetarian: v.optional(v.union(v.literal("YES"), v.literal("NO"))),
    isVegan: v.optional(v.union(v.literal("YES"), v.literal("NO"))),
    isHalal: v.optional(v.union(v.literal("YES"), v.literal("NO"))),
    isGlutenFree: v.optional(v.union(v.literal("YES"), v.literal("NO"))),
    isDairyFree: v.optional(v.union(v.literal("YES"), v.literal("NO"))),
    isNutFree: v.optional(v.union(v.literal("YES"), v.literal("NO"))),
    allergens: v.optional(v.array(v.string())),
    isAvailable: v.optional(v.union(v.literal("AVAILABLE"), v.literal("OUT_OF_STOCK"), v.literal("DISCONTINUED"))),
    isFeatured: v.optional(v.union(v.literal("YES"), v.literal("NO"))),
    stockQuantity: v.optional(v.number()),
    minimumOrderQuantity: v.optional(v.number()),
    maximumOrderQuantity: v.optional(v.number()),
    displayOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    // Remove undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    
    if (Object.keys(cleanUpdates).length === 0) {
      throw new Error("No fields to update");
    }
    
    await ctx.db.patch(id, cleanUpdates);
    return { success: true };
  },
});

// Delete meal (admin only)
export const deleteMeal = mutation({
  args: { id: v.id("meals") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// Admin-specific queries

// Get all meals for admin (includes inactive)
export const getAllMealsAdmin = query({
  args: {
    categoryId: v.optional(v.id("mealCategories")),
    availability: v.optional(v.union(v.literal("AVAILABLE"), v.literal("OUT_OF_STOCK"), v.literal("DISCONTINUED"))),
    searchTerm: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("meals");

    if (args.categoryId) {
      query = query.filter((q) => q.eq(q.field("categoryId"), args.categoryId));
    }

    if (args.availability) {
      query = query.filter((q) => q.eq(q.field("isAvailable"), args.availability));
    }

    let meals = await query.order("desc").collect();

    // Search functionality
    if (args.searchTerm) {
      const term = args.searchTerm.toLowerCase();
      meals = meals.filter(meal => 
        meal.name.toLowerCase().includes(term) ||
        (meal.description && meal.description.toLowerCase().includes(term)) ||
        (meal.ingredients && meal.ingredients.toLowerCase().includes(term))
      );
    }

    if (args.limit) {
      meals = meals.slice(0, args.limit);
    }

    return meals;
  },
});

// Toggle meal availability (quick admin action)
export const toggleMealAvailability = mutation({
  args: { 
    id: v.id("meals"),
    availability: v.union(v.literal("AVAILABLE"), v.literal("OUT_OF_STOCK"), v.literal("DISCONTINUED"))
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      isAvailable: args.availability
    });
    return { success: true };
  },
});

// Toggle featured status
export const toggleFeaturedStatus = mutation({
  args: { 
    id: v.id("meals"),
    featured: v.union(v.literal("YES"), v.literal("NO"))
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      isFeatured: args.featured
    });
    return { success: true };
  },
});

// Get meal statistics for admin dashboard
export const getMealStats = query({
  handler: async (ctx) => {
    const meals = await ctx.db.query("meals").collect();
    
    const stats = {
      total: meals.length,
      available: meals.filter(m => m.isAvailable === "AVAILABLE").length,
      outOfStock: meals.filter(m => m.isAvailable === "OUT_OF_STOCK").length,
      discontinued: meals.filter(m => m.isAvailable === "DISCONTINUED").length,
      featured: meals.filter(m => m.isFeatured === "YES").length,
    };
    
    return stats;
  },
});
