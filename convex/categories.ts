import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all meal categories
export const getAllCategories = query({
  args: { includeInactive: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("mealCategories")
      .withIndex("by_display_order");
    
    if (!args.includeInactive) {
      query = query.filter((q) => q.eq(q.field("isActive"), "ACTIVE"));
    }
    
    return query.collect();
  },
});

// Get category by ID
export const getCategoryById = query({
  args: { id: v.id("mealCategories") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create category (admin only)
export const createCategory = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    displayOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("mealCategories", {
      name: args.name,
      description: args.description,
      displayOrder: args.displayOrder ?? 0,
      isActive: "ACTIVE",
    });
  },
});

// Update category (admin only)
export const updateCategory = mutation({
  args: {
    id: v.id("mealCategories"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    displayOrder: v.optional(v.number()),
    isActive: v.optional(v.union(v.literal("ACTIVE"), v.literal("INACTIVE"))),
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

// Delete category (admin only)
export const deleteCategory = mutation({
  args: { id: v.id("mealCategories") },
  handler: async (ctx, args) => {
    // Check if category has meals
    const mealsInCategory = await ctx.db
      .query("meals")
      .withIndex("by_category", (q) => q.eq("categoryId", args.id))
      .collect();
    
    if (mealsInCategory.length > 0) {
      throw new Error("Cannot delete category that contains meals");
    }
    
    await ctx.db.delete(args.id);
    return { success: true };
  },
});
