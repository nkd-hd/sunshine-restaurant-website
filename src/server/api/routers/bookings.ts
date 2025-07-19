import { z } from "zod";
import { eq, and, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import { paymentService } from "~/server/services/payment";
import { bookings, events, cart } from "~/server/db/schema";

// Helper function to generate reference number
function generateReferenceNumber(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `EVT-${timestamp}-${random}`.toUpperCase();
}

export const bookingsRouter = createTRPCRouter({
  // Get user's bookings
  getUserBookings: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
        status: z.enum(["CONFIRMED", "CANCELLED"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const conditions = [eq(bookings.userId, ctx.session.user.id)];
      
      if (input.status) {
        conditions.push(eq(bookings.status, input.status));
      }

      const userBookings = await ctx.db
        .select({
          id: bookings.id,
          quantity: bookings.quantity,
          totalAmount: bookings.totalAmount,
          bookingDate: bookings.bookingDate,
          status: bookings.status,
          referenceNumber: bookings.referenceNumber,
          attendeeInfo: bookings.attendeeInfo,
          event: {
            id: events.id,
            name: events.name,
            date: events.date,
            time: events.time,
            venue: events.venue,
            location: events.location,
            organizer: events.organizer,
            imageUrl: events.imageUrl,
          },
        })
        .from(bookings)
        .innerJoin(events, eq(bookings.eventId, events.id))
        .where(and(...conditions))
        .orderBy(desc(bookings.bookingDate))
        .limit(input.limit)
        .offset(input.offset);

      // Get total count
      const totalCount = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(bookings)
        .where(and(...conditions));

      return {
        bookings: userBookings,
        total: totalCount[0]?.count ?? 0,
        hasMore: (input.offset + input.limit) < (totalCount[0]?.count ?? 0),
      };
    }),

  // Get booking by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const booking = await ctx.db
        .select({
          id: bookings.id,
          quantity: bookings.quantity,
          totalAmount: bookings.totalAmount,
          bookingDate: bookings.bookingDate,
          status: bookings.status,
          referenceNumber: bookings.referenceNumber,
          attendeeInfo: bookings.attendeeInfo,
          event: {
            id: events.id,
            name: events.name,
            date: events.date,
            time: events.time,
            venue: events.venue,
            location: events.location,
            organizer: events.organizer,
            organizerContact: events.organizerContact,
            imageUrl: events.imageUrl,
          },
        })
        .from(bookings)
        .innerJoin(events, eq(bookings.eventId, events.id))
        .where(
          and(
            eq(bookings.id, input.id),
            eq(bookings.userId, ctx.session.user.id)
          )
        )
        .limit(1);

      if (!booking[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Booking not found",
        });
      }

      return booking[0];
    }),

  // Create booking from cart
  createFromCart: protectedProcedure
    .input(
      z.object({
        paymentMethod: z.enum(["mtn_momo", "orange_money", "cash"]).optional(),
        paymentDetails: z.object({
          method: z.string(),
        }).optional(),
        attendeeInfo: z.object({
          firstName: z.string().min(1),
          lastName: z.string().min(1),
          email: z.string().email(),
          phone: z.string().min(1),
        }).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Get cart items
      const cartItems = await ctx.db
        .select({
          cartId: cart.id,
          eventId: cart.eventId,
          quantity: cart.quantity,
          event: events,
        })
        .from(cart)
        .innerJoin(events, eq(cart.eventId, events.id))
        .where(eq(cart.userId, ctx.session.user.id));

      if (cartItems.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cart is empty",
        });
      }

      const createdBookings = [];
      let firstBookingId = "";

      // Create bookings for each cart item
      for (const item of cartItems) {
        // Check ticket availability
        if (item.event.availableTickets < item.quantity) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Not enough tickets available for ${item.event.name}. Only ${item.event.availableTickets} left.`,
          });
        }

        const totalAmount = parseFloat(item.event.price) * item.quantity;
        const referenceNumber = generateReferenceNumber();
        const bookingId = crypto.randomUUID();

        // Process Payment
        const paymentResponse = await paymentService.processPayment({
          amount: totalAmount,
          currency: "XAF",
          method: input.paymentMethod as any,
          customerPhone: input.attendeeInfo?.phone,
          customerEmail: input.attendeeInfo?.email,
          customerName: `${input.attendeeInfo?.firstName} ${input.attendeeInfo?.lastName}`,
          reference: referenceNumber,
          description: `Booking for ${item.event.name}`,
        });

        const bookingStatus = paymentResponse.success && paymentResponse.status === "COMPLETED" ? "CONFIRMED" : "PENDING_PAYMENT";

        // Create booking
        await ctx.db.insert(bookings).values({
          id: bookingId,
          userId: ctx.session.user.id,
          eventId: item.eventId,
          quantity: item.quantity,
          totalAmount: totalAmount.toString(),
          referenceNumber,
          attendeeInfo: input.attendeeInfo,
          status: bookingStatus,
          paymentMethod: input.paymentMethod,
          paymentStatus: paymentResponse.status,
          paymentReference: paymentResponse.paymentReference,
          paymentDetails: input.paymentDetails,
        });

        // If payment is completed, update available tickets
        if (bookingStatus === "CONFIRMED") {
          await ctx.db
            .update(events)
            .set({
              availableTickets: sql`${events.availableTickets} - ${item.quantity}`,
            })
            .where(eq(events.id, item.eventId));
        }

        createdBookings.push({
          referenceNumber,
          eventName: item.event.name,
          quantity: item.quantity,
          totalAmount,
        });
      }

      // Clear cart
      await ctx.db
        .delete(cart)
        .where(eq(cart.userId, ctx.session.user.id));

      return {
        success: true,
        bookingId: firstBookingId,
        bookings: createdBookings,
      };
    }),

  // Cancel booking
  cancel: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Get booking details
      const booking = await ctx.db
        .select({
          booking: bookings,
          event: events,
        })
        .from(bookings)
        .innerJoin(events, eq(bookings.eventId, events.id))
        .where(
          and(
            eq(bookings.id, input.id),
            eq(bookings.userId, ctx.session.user.id),
            eq(bookings.status, "CONFIRMED")
          )
        )
        .limit(1);

      if (!booking[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Booking not found or already cancelled",
        });
      }

      const { booking: bookingData } = booking[0];

      // Update booking status
      await ctx.db
        .update(bookings)
        .set({ status: "CANCELLED" })
        .where(eq(bookings.id, input.id));

      // Restore available tickets
      await ctx.db
        .update(events)
        .set({
          availableTickets: sql`${events.availableTickets} + ${bookingData.quantity}`,
        })
        .where(eq(events.id, bookingData.eventId));

      return { success: true };
    }),

  // Get booking statistics for dashboard
  getStats: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available",
      });
    }

    const stats = await ctx.db
      .select({
        totalBookings: sql<number>`COUNT(*)`,
        confirmedBookings: sql<number>`SUM(CASE WHEN ${bookings.status} = 'CONFIRMED' THEN 1 ELSE 0 END)`,
        cancelledBookings: sql<number>`SUM(CASE WHEN ${bookings.status} = 'CANCELLED' THEN 1 ELSE 0 END)`,
        totalSpent: sql<number>`SUM(CASE WHEN ${bookings.status} = 'CONFIRMED' THEN ${bookings.totalAmount} ELSE 0 END)`,
        totalTickets: sql<number>`SUM(CASE WHEN ${bookings.status} = 'CONFIRMED' THEN ${bookings.quantity} ELSE 0 END)`,
      })
      .from(bookings)
      .where(eq(bookings.userId, ctx.session.user.id));

    return {
      totalBookings: stats[0]?.totalBookings ?? 0,
      confirmedBookings: stats[0]?.confirmedBookings ?? 0,
      cancelledBookings: stats[0]?.cancelledBookings ?? 0,
      totalSpent: Number(stats[0]?.totalSpent ?? 0),
      totalTickets: stats[0]?.totalTickets ?? 0,
    };
  }),
});
