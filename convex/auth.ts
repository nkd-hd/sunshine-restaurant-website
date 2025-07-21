import { query } from "./_generated/server";
import { v } from "convex/values";

export const authenticateUser = query({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      return null;
    }

    // Verify password (for now, we'll add bcrypt later)
    // TODO: Replace with bcrypt.compare when bcryptjs is installed
    const isPasswordValid = user.password === args.password;

    if (!isPasswordValid) {
      return null;
    }

    return {
      id: user._id,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
    };
  },
});
