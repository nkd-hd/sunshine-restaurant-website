import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createAdminUser = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if admin user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      // Update existing user to admin role
      await ctx.db.patch(existingUser._id, {
        role: "ADMIN",
        name: args.name,
        password: args.password, // In production, this should be hashed
      });
      
      console.log(`Updated existing user ${args.email} to ADMIN role`);
      return { success: true, message: `Updated existing user ${args.email} to ADMIN role` };
    } else {
      // Create new admin user
      const userId = await ctx.db.insert("users", {
        name: args.name,
        email: args.email,
        password: args.password, // In production, this should be hashed
        role: "ADMIN",
      });

      console.log(`Created new admin user: ${args.email}`);
      return { success: true, message: `Created new admin user: ${args.email}`, userId };
    }
  },
});
