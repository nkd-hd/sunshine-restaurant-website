import { z } from "zod";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
// import bcrypt from "bcryptjs"; // Will uncomment when bcryptjs is installed

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { users } from "~/server/db/schema";

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Registration is currently unavailable. Database not configured. Please use demo credentials: email: demo@example.com, password: demo123",
        });
      }

      // Check if user already exists
      const existingUser = await ctx.db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (existingUser.length > 0) {
        throw new Error("User with this email already exists");
      }

      // Hash password (for now, we'll store plain text until bcryptjs is installed)
      // TODO: Replace with bcrypt.hash when bcryptjs is installed
      // const hashedPassword = await bcrypt.hash(input.password, 12);
      const hashedPassword = input.password; // Temporary - NOT SECURE

      // Create user
      const newUser = await ctx.db
        .insert(users)
        .values({
          name: input.name,
          email: input.email,
          password: hashedPassword,
          role: "USER",
        });

      return {
        success: true,
        message: "User created successfully",
      };
    }),

  getProfile: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available",
      });
    }

    const user = await ctx.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, ctx.session.user.id))
      .limit(1);

    if (!user[0]) {
      throw new Error("User not found");
    }

    return user[0];
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required").optional(),
        email: z.string().email("Invalid email address").optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Check if email is already taken by another user
      if (input.email) {
        const existingUser = await ctx.db
          .select()
          .from(users)
          .where(eq(users.email, input.email))
          .limit(1);

        if (existingUser.length > 0 && existingUser[0]?.id !== ctx.session.user.id) {
          throw new Error("Email is already taken");
        }
      }

      // Update user
      await ctx.db
        .update(users)
        .set({
          ...(input.name && { name: input.name }),
          ...(input.email && { email: input.email }),
        })
        .where(eq(users.id, ctx.session.user.id));

      return {
        success: true,
        message: "Profile updated successfully",
      };
    }),

  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z.string().min(6, "New password must be at least 6 characters"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Get current user with password
      const user = await ctx.db
        .select()
        .from(users)
        .where(eq(users.id, ctx.session.user.id))
        .limit(1);

      if (!user[0]) {
        throw new Error("User not found");
      }

      // Verify current password (for now, plain text comparison)
      // TODO: Replace with bcrypt.compare when bcryptjs is installed
      // const isCurrentPasswordValid = await bcrypt.compare(input.currentPassword, user[0].password || "");
      const isCurrentPasswordValid = input.currentPassword === user[0].password;

      if (!isCurrentPasswordValid) {
        throw new Error("Current password is incorrect");
      }

      // Hash new password (for now, store plain text)
      // TODO: Replace with bcrypt.hash when bcryptjs is installed
      // const hashedNewPassword = await bcrypt.hash(input.newPassword, 12);
      const hashedNewPassword = input.newPassword; // Temporary - NOT SECURE

      // Update password
      await ctx.db
        .update(users)
        .set({
          password: hashedNewPassword,
        })
        .where(eq(users.id, ctx.session.user.id));

      return {
        success: true,
        message: "Password changed successfully",
      };
    }),
});
