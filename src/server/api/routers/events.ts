import { z } from "zod";
import { eq, desc, asc, and, gte, lte, like, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { events } from "~/server/db/schema";

export const eventsRouter = createTRPCRouter({
  // Get all events with optional filtering
  getAll: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        location: z.string().optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        sortBy: z.enum(["date", "name", "price", "createdAt"]).default("date"),
        sortOrder: z.enum(["asc", "desc"]).default("asc"),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const conditions = [];

      // Only show active events
      conditions.push(eq(events.status, "ACTIVE"));

      // Search filter
      if (input.search) {
        conditions.push(
          like(events.name, `%${input.search}%`)
        );
      }

      // Location filter
      if (input.location) {
        conditions.push(eq(events.location, input.location));
      }

      // Date range filter
      if (input.dateFrom) {
        conditions.push(gte(events.date, new Date(input.dateFrom)));
      }
      if (input.dateTo) {
        conditions.push(lte(events.date, new Date(input.dateTo)));
      }

      // Build order by clause
      const orderBy = input.sortOrder === "asc" 
        ? asc(events[input.sortBy]) 
        : desc(events[input.sortBy]);

      const eventsList = await ctx.db
        .select()
        .from(events)
        .where(and(...conditions))
        .orderBy(orderBy)
        .limit(input.limit)
        .offset(input.offset);

      // Get total count for pagination
      const totalCount = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(events)
        .where(and(...conditions));

      return {
        events: eventsList,
        total: totalCount[0]?.count ?? 0,
        hasMore: (input.offset + input.limit) < (totalCount[0]?.count ?? 0),
      };
    }),

  // Get event by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const eventResult = await ctx.db
        .select()
        .from(events)
        .where(eq(events.id, input.id))
        .limit(1);

      const event = eventResult[0];

      if (!event) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event not found",
        });
      }

      return event;
    }),

  // Get unique locations for filter dropdown
  getLocations: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available",
      });
    }

    const locations = await ctx.db
      .selectDistinct({ location: events.location })
      .from(events)
      .where(eq(events.status, "ACTIVE"))
      .orderBy(asc(events.location));

    return locations.map(l => l.location);
  }),

  // Get featured events (latest 6 active events)
  getFeatured: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available",
      });
    }

    const featuredEvents = await ctx.db
      .select()
      .from(events)
      .where(eq(events.status, "ACTIVE"))
      .orderBy(desc(events.createdAt))
      .limit(6);

    return featuredEvents;
  }),

  // Create new event (admin only)
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(200),
        description: z.string().optional(),
        date: z.string(),
        time: z.string(),
        venue: z.string().min(1).max(200),
        location: z.string().min(1).max(200),
        organizer: z.string().min(1).max(100),
        organizerContact: z.string().max(100).optional(),
        price: z.number().min(0),
        totalTickets: z.number().min(1),
        imageUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      await ctx.db.insert(events).values({
        name: input.name,
        description: input.description,
        date: new Date(input.date),
        time: input.time,
        venue: input.venue,
        location: input.location,
        organizer: input.organizer,
        organizerContact: input.organizerContact,
        price: input.price.toString(),
        availableTickets: input.totalTickets,
        totalTickets: input.totalTickets,
        imageUrl: input.imageUrl,
        status: "ACTIVE",
      });

      return { success: true };
    }),

  // Update event (admin only)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(200).optional(),
        description: z.string().optional(),
        date: z.string().optional(),
        time: z.string().optional(),
        venue: z.string().min(1).max(200).optional(),
        location: z.string().min(1).max(200).optional(),
        organizer: z.string().min(1).max(100).optional(),
        organizerContact: z.string().max(100).optional(),
        price: z.number().min(0).optional(),
        totalTickets: z.number().min(1).optional(),
        availableTickets: z.number().min(0).optional(),
        imageUrl: z.string().url().optional(),
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

      const { id, ...updateData } = input;

      // Build update object with proper types
      const updateFields: Record<string, string | number | Date> = {};

      if (updateData.name !== undefined) updateFields.name = updateData.name;
      if (updateData.description !== undefined) updateFields.description = updateData.description;
      if (updateData.date !== undefined) updateFields.date = new Date(updateData.date);
      if (updateData.time !== undefined) updateFields.time = updateData.time;
      if (updateData.venue !== undefined) updateFields.venue = updateData.venue;
      if (updateData.location !== undefined) updateFields.location = updateData.location;
      if (updateData.organizer !== undefined) updateFields.organizer = updateData.organizer;
      if (updateData.organizerContact !== undefined) updateFields.organizerContact = updateData.organizerContact;
      if (updateData.price !== undefined) updateFields.price = updateData.price.toString();
      if (updateData.totalTickets !== undefined) updateFields.totalTickets = updateData.totalTickets;
      if (updateData.availableTickets !== undefined) updateFields.availableTickets = updateData.availableTickets;
      if (updateData.imageUrl !== undefined) updateFields.imageUrl = updateData.imageUrl;
      if (updateData.status !== undefined) updateFields.status = updateData.status;

      await ctx.db
        .update(events)
        .set(updateFields)
        .where(eq(events.id, id));

      return { success: true };
    }),

  // Delete event (admin only)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      await ctx.db.delete(events).where(eq(events.id, input.id));

      return { success: true };
    }),
});
