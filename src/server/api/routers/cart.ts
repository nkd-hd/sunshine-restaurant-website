import { z } from "zod";
import { eq, and, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import { cart, events } from "~/server/db/schema";

export const cartRouter = createTRPCRouter({
  // Get user's cart items
  getItems: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available",
      });
    }

    const cartItems = await ctx.db
      .select({
        id: cart.id,
        quantity: cart.quantity,
        addedAt: cart.addedAt,
        event: {
          id: events.id,
          name: events.name,
          date: events.date,
          time: events.time,
          venue: events.venue,
          location: events.location,
          price: events.price,
          availableTickets: events.availableTickets,
          imageUrl: events.imageUrl,
        },
      })
      .from(cart)
      .innerJoin(events, eq(cart.eventId, events.id))
      .where(eq(cart.userId, ctx.session.user.id))
      .orderBy(cart.addedAt);

    // Calculate totals
    const subtotal = cartItems.reduce((total, item) => {
      return total + (parseFloat(item.event.price) * item.quantity);
    }, 0);

    const tax = subtotal * 0.1925; // 19.25% VAT for Cameroon
    const total = subtotal + tax;

    return {
      items: cartItems,
      summary: {
        itemCount: cartItems.reduce((count, item) => count + item.quantity, 0),
        subtotal: Number(subtotal.toFixed(2)),
        tax: Number(tax.toFixed(2)),
        total: Number(total.toFixed(2)),
      },
    };
  }),

  // Add item to cart
  addItem: protectedProcedure
    .input(
      z.object({
        eventId: z.string(),
        quantity: z.number().min(1).max(10),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Check if event exists and has available tickets
      const eventResult = await ctx.db
        .select()
        .from(events)
        .where(eq(events.id, input.eventId))
        .limit(1);

      const event = eventResult[0];

      if (!event) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event not found",
        });
      }

      if (event.status !== "ACTIVE") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Event is not available for booking",
        });
      }

      if (event.availableTickets < input.quantity) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Only ${event.availableTickets} tickets available`,
        });
      }

      // Check if item already exists in cart
      const existingItemResult = await ctx.db
        .select()
        .from(cart)
        .where(and(
          eq(cart.userId, ctx.session.user.id),
          eq(cart.eventId, input.eventId)
        ))
        .limit(1);

      const existingItem = existingItemResult[0];

      if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + input.quantity;
        
        if (newQuantity > event.availableTickets) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Cannot add ${input.quantity} more tickets. Only ${event.availableTickets - existingItem.quantity} more available`,
          });
        }

        await ctx.db
          .update(cart)
          .set({ quantity: newQuantity })
          .where(eq(cart.id, existingItem.id));
      } else {
        // Add new item
        await ctx.db.insert(cart).values({
          userId: ctx.session.user.id,
          eventId: input.eventId,
          quantity: input.quantity,
        });
      }

      return { success: true };
    }),

  // Update item quantity
  updateQuantity: protectedProcedure
    .input(
      z.object({
        cartItemId: z.string(),
        quantity: z.number().min(1).max(10),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Get cart item with event info
      const cartItem = await ctx.db
        .select({
          cart: cart,
          event: events,
        })
        .from(cart)
        .innerJoin(events, eq(cart.eventId, events.id))
        .where(
          and(
            eq(cart.id, input.cartItemId),
            eq(cart.userId, ctx.session.user.id)
          )
        )
        .limit(1);

      if (!cartItem[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cart item not found",
        });
      }

      const { event } = cartItem[0];

      if (input.quantity > event.availableTickets) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Only ${event.availableTickets} tickets available`,
        });
      }

      await ctx.db
        .update(cart)
        .set({ quantity: input.quantity })
        .where(eq(cart.id, input.cartItemId));

      return { success: true };
    }),

  // Remove item from cart
  removeItem: protectedProcedure
    .input(z.object({ cartItemId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      await ctx.db
        .delete(cart)
        .where(
          and(
            eq(cart.id, input.cartItemId),
            eq(cart.userId, ctx.session.user.id)
          )
        );

      return { success: true };
    }),

  // Clear entire cart
  clearCart: protectedProcedure.mutation(async ({ ctx }) => {
    if (!ctx.db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available",
      });
    }

    await ctx.db
      .delete(cart)
      .where(eq(cart.userId, ctx.session.user.id));

    return { success: true };
  }),

  // Get cart item count
  getItemCount: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available",
      });
    }

    const result = await ctx.db
      .select({ 
        totalQuantity: sql<number>`COALESCE(SUM(${cart.quantity}), 0)` 
      })
      .from(cart)
      .where(eq(cart.userId, ctx.session.user.id));

    return result[0]?.totalQuantity ?? 0;
  }),
});
