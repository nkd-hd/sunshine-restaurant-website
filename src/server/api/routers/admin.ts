import { z } from "zod";
import { eq, desc, count, sum, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  adminProcedure,
} from "~/server/api/trpc";
import { users, events, bookings, cart } from "~/server/db/schema";

export const adminRouter = createTRPCRouter({
  // Get admin dashboard statistics
  getDashboardStats: adminProcedure.query(async ({ ctx }) => {
    if (!ctx.db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available",
      });
    }

    // Get total users
    const totalUsers = await ctx.db
      .select({ count: count() })
      .from(users);

    // Get total events
    const totalEvents = await ctx.db
      .select({ count: count() })
      .from(events);

    // Get total bookings
    const totalBookings = await ctx.db
      .select({ count: count() })
      .from(bookings);

    // Get total revenue
    const totalRevenue = await ctx.db
      .select({ total: sum(bookings.totalAmount) })
      .from(bookings)
      .where(eq(bookings.status, "CONFIRMED"));

    // Get recent bookings
    const recentBookings = await ctx.db
      .select({
        id: bookings.id,
        referenceNumber: bookings.referenceNumber,
        quantity: bookings.quantity,
        totalAmount: bookings.totalAmount,
        status: bookings.status,
        createdAt: bookings.createdAt,
        user: {
          name: users.name,
          email: users.email,
        },
        event: {
          name: events.name,
          date: events.date,
        },
      })
      .from(bookings)
      .leftJoin(users, eq(bookings.userId, users.id))
      .leftJoin(events, eq(bookings.eventId, events.id))
      .orderBy(desc(bookings.createdAt))
      .limit(10);

    return {
      totalUsers: totalUsers[0]?.count ?? 0,
      totalEvents: totalEvents[0]?.count ?? 0,
      totalBookings: totalBookings[0]?.count ?? 0,
      totalRevenue: parseFloat(totalRevenue[0]?.total ?? "0"),
      recentBookings,
    };
  }),

  // Get all users with pagination
  getUsers: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const offset = (input.page - 1) * input.limit;

      const conditions = [];

      if (input.search) {
        conditions.push(
          sql`${users.name} LIKE ${`%${input.search}%`} OR ${users.email} LIKE ${`%${input.search}%`}`
        );
      }

      const usersData = await ctx.db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          emailVerified: users.emailVerified,
          image: users.image,
        })
        .from(users)
        .where(conditions.length > 0 ? sql`${conditions[0]}` : undefined)
        .orderBy(desc(users.id))
        .limit(input.limit)
        .offset(offset);

      // Get total count for pagination
      const totalCount = await ctx.db
        .select({ count: count() })
        .from(users);

      return {
        users: usersData,
        totalCount: totalCount[0]?.count ?? 0,
        totalPages: Math.ceil((totalCount[0]?.count ?? 0) / input.limit),
        currentPage: input.page,
      };
    }),

  // Update user role
  updateUserRole: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(["USER", "ADMIN"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      await ctx.db
        .update(users)
        .set({ role: input.role })
        .where(eq(users.id, input.userId));

      return { success: true };
    }),

  // Get all bookings with pagination
  getBookings: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
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

      const offset = (input.page - 1) * input.limit;

      // Simplified query without complex joins for now
      const bookingsData = await ctx.db
        .select({
          id: bookings.id,
          referenceNumber: bookings.referenceNumber,
          quantity: bookings.quantity,
          totalAmount: bookings.totalAmount,
          status: bookings.status,
          bookingDate: bookings.bookingDate,
          userId: bookings.userId,
          eventId: bookings.eventId,
        })
        .from(bookings)
        .where(input.status ? eq(bookings.status, input.status) : undefined)
        .orderBy(desc(bookings.bookingDate))
        .limit(input.limit)
        .offset(offset);

      // Get total count for pagination
      const totalCount = await ctx.db
        .select({ count: count() })
        .from(bookings);

      return {
        bookings: bookingsData,
        totalCount: totalCount[0]?.count ?? 0,
        totalPages: Math.ceil((totalCount[0]?.count ?? 0) / input.limit),
        currentPage: input.page,
      };
    }),

  // Update booking status
  updateBookingStatus: adminProcedure
    .input(
      z.object({
        bookingId: z.string(),
        status: z.enum(["CONFIRMED", "CANCELLED"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      await ctx.db
        .update(bookings)
        .set({ status: input.status })
        .where(eq(bookings.id, input.bookingId));

      return { success: true };
    }),

  // Create new event
  createEvent: adminProcedure
    .input(
      z.object({
        name: z.string().min(1, "Event name is required"),
        description: z.string().min(1, "Description is required"),
        date: z.date(),
        time: z.string(),
        venue: z.string().min(1, "Venue is required"),
        location: z.string().min(1, "Location is required"),
        price: z.number().min(0, "Price must be positive"),
        totalTickets: z.number().min(1, "Must have at least 1 ticket"),
        organizer: z.string().min(1, "Organizer is required"),
        imageUrl: z.string().optional(),
        category: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const eventId = crypto.randomUUID();

      await ctx.db.insert(events).values({
        id: eventId,
        name: input.name,
        description: input.description,
        date: input.date,
        time: input.time,
        venue: input.venue,
        location: input.location,
        price: input.price.toString(),
        totalTickets: input.totalTickets,
        availableTickets: input.totalTickets,
        organizer: input.organizer,
        imageUrl: input.imageUrl,
        category: input.category,
        status: "ACTIVE",
      });

      return { success: true, eventId };
    }),

  // Update existing event
  updateEvent: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Event name is required"),
        description: z.string().min(1, "Description is required"),
        date: z.date(),
        time: z.string(),
        venue: z.string().min(1, "Venue is required"),
        location: z.string().min(1, "Location is required"),
        price: z.number().min(0, "Price must be positive"),
        totalTickets: z.number().min(1, "Must have at least 1 ticket"),
        organizer: z.string().min(1, "Organizer is required"),
        imageUrl: z.string().optional(),
        category: z.string().optional(),
        status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Get current event to check ticket changes
      const currentEvent = await ctx.db
        .select()
        .from(events)
        .where(eq(events.id, input.id))
        .limit(1);

      if (!currentEvent[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event not found",
        });
      }

      // Calculate new available tickets if total tickets changed
      const soldTickets = currentEvent[0].totalTickets - currentEvent[0].availableTickets;
      const newAvailableTickets = Math.max(0, input.totalTickets - soldTickets);

      await ctx.db
        .update(events)
        .set({
          name: input.name,
          description: input.description,
          date: input.date,
          time: input.time,
          venue: input.venue,
          location: input.location,
          price: input.price.toString(),
          totalTickets: input.totalTickets,
          availableTickets: newAvailableTickets,
          organizer: input.organizer,
          imageUrl: input.imageUrl,
          category: input.category,
          status: input.status || currentEvent[0].status,
        })
        .where(eq(events.id, input.id));

      return { success: true };
    }),

  // Delete event
  deleteEvent: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Check if event has bookings
      const existingBookings = await ctx.db
        .select({ count: count() })
        .from(bookings)
        .where(eq(bookings.eventId, input.id));

      if ((existingBookings[0]?.count ?? 0) > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete event with existing bookings",
        });
      }

      await ctx.db
        .delete(events)
        .where(eq(events.id, input.id));

      return { success: true };
    }),

  // Generate reports
  generateReport: adminProcedure
    .input(
      z.object({
        type: z.enum(["date", "event", "user"]),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        eventId: z.string().optional(),
        userId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Build conditions array
      const conditions = [];

      if (input.startDate) {
        conditions.push(sql`${bookings.bookingDate} >= ${input.startDate}`);
      }
      if (input.endDate) {
        conditions.push(sql`${bookings.bookingDate} <= ${input.endDate}`);
      }
      if (input.eventId) {
        conditions.push(eq(bookings.eventId, input.eventId));
      }
      if (input.userId) {
        conditions.push(eq(bookings.userId, input.userId));
      }

      // Build base query
      const baseQuery = ctx.db
        .select({
          id: bookings.id,
          referenceNumber: bookings.referenceNumber,
          quantity: bookings.quantity,
          totalAmount: bookings.totalAmount,
          status: bookings.status,
          bookingDate: bookings.bookingDate,
          user: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
          event: {
            id: events.id,
            name: events.name,
            date: events.date,
            venue: events.venue,
            location: events.location,
          },
        })
        .from(bookings)
        .leftJoin(users, eq(bookings.userId, users.id))
        .leftJoin(events, eq(bookings.eventId, events.id));

      // Apply all conditions at once
      const reportData = conditions.length > 0
        ? await baseQuery.where(sql.join(conditions, sql` AND `))
        : await baseQuery;

      // Calculate summary statistics
      const totalBookings = reportData.length;
      const totalRevenue = reportData
        .filter(booking => booking.status === "CONFIRMED")
        .reduce((sum, booking) => sum + parseFloat(booking.totalAmount), 0);
      const totalTickets = reportData
        .filter(booking => booking.status === "CONFIRMED")
        .reduce((sum, booking) => sum + booking.quantity, 0);

      return {
        bookings: reportData,
        summary: {
          totalBookings,
          totalRevenue,
          totalTickets,
          confirmedBookings: reportData.filter(b => b.status === "CONFIRMED").length,
          cancelledBookings: reportData.filter(b => b.status === "CANCELLED").length,
        },
      };
    }),
});
