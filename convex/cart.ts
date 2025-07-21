import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get user's cart items
export const getCartItems = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const cartItems = await ctx.db
      .query("cart")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Get meal details for each cart item
    const itemsWithMeals = await Promise.all(
      cartItems.map(async (item) => {
        const meal = await ctx.db.get(item.mealId);
        return {
          ...item,
          meal,
        };
      })
    );

    // Calculate totals
    const subtotal = itemsWithMeals.reduce((total, item) => {
      if (item.meal) {
        return total + (item.meal.price * item.quantity);
      }
      return total;
    }, 0);

    const tax = subtotal * 0.1925; // 19.25% VAT for Cameroon
    const total = subtotal + tax;

    return {
      items: itemsWithMeals,
      summary: {
        itemCount: itemsWithMeals.reduce((count, item) => count + item.quantity, 0),
        subtotal: Number(subtotal.toFixed(2)),
        tax: Number(tax.toFixed(2)),
        total: Number(total.toFixed(2)),
      },
    };
  },
});

// Add item to cart
export const addToCart = mutation({
  args: {
    userId: v.id("users"),
    mealId: v.id("meals"),
    quantity: v.number(),
    specialInstructions: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if meal exists and is available
    const meal = await ctx.db.get(args.mealId);
    if (!meal) {
      throw new Error("Meal not found");
    }

    if (meal.isAvailable !== "AVAILABLE") {
      throw new Error("Meal is not available for order");
    }

    if (meal.stockQuantity && meal.stockQuantity < args.quantity) {
      throw new Error(`Only ${meal.stockQuantity} items available`);
    }

    // Check if item already exists in cart
    const existingItem = await ctx.db
      .query("cart")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("mealId"), args.mealId))
      .first();

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + args.quantity;
      
      if (meal.stockQuantity && newQuantity > meal.stockQuantity) {
        throw new Error(
          `Cannot add ${args.quantity} more items. Only ${meal.stockQuantity - existingItem.quantity} more available`
        );
      }

      await ctx.db.patch(existingItem._id, {
        quantity: newQuantity,
        specialInstructions: args.specialInstructions || existingItem.specialInstructions,
      });
      
      return { success: true, itemId: existingItem._id };
    } else {
      // Add new item
      const itemId = await ctx.db.insert("cart", {
        userId: args.userId,
        mealId: args.mealId,
        quantity: args.quantity,
        specialInstructions: args.specialInstructions,
      });
      
      return { success: true, itemId };
    }
  },
});

// Update cart item quantity
export const updateCartItemQuantity = mutation({
  args: {
    cartItemId: v.id("cart"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const cartItem = await ctx.db.get(args.cartItemId);
    if (!cartItem) {
      throw new Error("Cart item not found");
    }

    const meal = await ctx.db.get(cartItem.mealId);
    if (!meal) {
      throw new Error("Meal not found");
    }

    if (meal.stockQuantity && args.quantity > meal.stockQuantity) {
      throw new Error(`Only ${meal.stockQuantity} items available`);
    }

    await ctx.db.patch(args.cartItemId, { quantity: args.quantity });
    return { success: true };
  },
});

// Remove item from cart
export const removeFromCart = mutation({
  args: { cartItemId: v.id("cart") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.cartItemId);
    return { success: true };
  },
});

// Clear entire cart
export const clearCart = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const cartItems = await ctx.db
      .query("cart")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    await Promise.all(cartItems.map((item) => ctx.db.delete(item._id)));
    
    return { success: true };
  },
});

// Get cart item count
export const getCartItemCount = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const cartItems = await ctx.db
      .query("cart")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return cartItems.reduce((count, item) => count + item.quantity, 0);
  },
});
