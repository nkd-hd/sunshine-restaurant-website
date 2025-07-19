# Advanced Web Development - Technical Implementation Documentation

## Overview
This document provides concise technical examples demonstrating modern web development practices in the Event Booking System, showcasing TypeScript, Next.js SSR, tRPC, Drizzle ORM, and NextAuth.js implementations.

## 1. Frontend Development (Next.js, React, TypeScript, Tailwind CSS)

### TypeScript Props/State and Tailwind CSS Responsive Design

#### EventCard Component Example
```typescript
// src/components/events/event-card.tsx
interface EventCardProps {
  event: {
    id: string
    name: string
    date: Date
    venue: string
    location: string
    price: string
    imageUrl: string | null
    availableTickets: number
  }
}

export default function EventCard({ event }: EventCardProps) {
  const [quantity, setQuantity] = useState(1)
  const addToCartMutation = api.cart.addItem.useMutation()

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200">
      {/* Responsive image container */}
      <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
        <img 
          src={event.imageUrl ?? "/placeholder.svg"} 
          alt={event.name} 
          className="w-full h-full object-cover" 
        />
      </div>

      <div className="p-6">
        {/* Responsive grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* TypeScript ensures type safety for event properties */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {event.name}
          </h3>
        </div>
      </div>
    </div>
  )
}
```

#### MainLayout with TypeScript and Responsive Navigation
```typescript
// src/components/layout/main-layout.tsx
interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Responsive flex layout */}
          <div className="flex justify-between h-16">
            {/* Mobile menu button - hidden on desktop */}
            <button
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>
            
            {/* Desktop navigation - hidden on mobile */}
            <div className="hidden md:flex space-x-8">
              <Link href="/events">Events</Link>
              <Link href="/dashboard">Dashboard</Link>
            </div>
          </div>
        </div>
      </nav>
    </div>
  )
}
```

### Next.js Server-Side Rendering (SSR) Implementation

#### Events Page with SSR Data Fetching
```typescript
// src/app/events/page.tsx
export default async function EventsPage() {
  let events: any[] = []
  let locations: string[] = []

  try {
    // Server-side data fetching with tRPC
    const eventsData = await api.events.getAll({
      limit: 50,
    })
    events = eventsData.events
    locations = await api.events.getLocations()
    
    console.log("Server-side events loaded:", { 
      eventsCount: events.length 
    })
  } catch (error) {
    console.log("Error loading events:", error)
    // Graceful fallback with empty data
  }

  return (
    <HydrateClient>
      <MainLayout>
        {/* Pre-rendered content with server data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event: any) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </MainLayout>
    </HydrateClient>
  )
}
```

## 2. Backend Development (tRPC, Drizzle ORM, NextAuth.js)

### tRPC Procedures with Type Safety and Zod Validation

#### Events Router with Type-Safe Procedures
```typescript
// src/server/api/routers/events.ts
export const eventsRouter = createTRPCRouter({
  // Public procedure with Zod input validation
  getAll: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        location: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const conditions = [eq(events.status, "ACTIVE")]

      // Type-safe filtering with Drizzle
      if (input.search) {
        conditions.push(like(events.name, `%${input.search}%`))
      }
      if (input.location) {
        conditions.push(eq(events.location, input.location))
      }

      return await ctx.db
        .select()
        .from(events)
        .where(and(...conditions))
        .limit(input.limit)
        .offset(input.offset)
    }),

  // Featured events procedure
  getFeatured: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db
      .select()
      .from(events)
      .where(eq(events.status, "ACTIVE"))
      .orderBy(desc(events.createdAt))
      .limit(6)
  }),
})
```

#### Admin Router with Protected Procedures
```typescript
// src/server/api/routers/admin.ts
export const adminRouter = createTRPCRouter({
  // Admin-only procedure with comprehensive validation
  createEvent: adminProcedure
    .input(
      z.object({
        name: z.string().min(1, "Event name is required"),
        description: z.string().min(1, "Description is required"),
        date: z.date(),
        price: z.number().min(0, "Price must be positive"),
        totalTickets: z.number().min(1, "Must have at least 1 ticket"),
        imageUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Type-safe database insertion with Drizzle
      const newEvent = await ctx.db.insert(events).values({
        name: input.name,
        description: input.description,
        date: input.date,
        price: input.price.toString(),
        totalTickets: input.totalTickets,
        availableTickets: input.totalTickets,
        status: "ACTIVE",
      })

      return { success: true, eventId: newEvent.insertId }
    }),
})
```

### NextAuth.js Configuration

#### Authentication Setup with Multiple Providers
```typescript
// src/server/auth/config.ts
export const authConfig = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        // Type-safe user lookup with Drizzle
        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email))
          .limit(1)

        if (user[0] && await bcrypt.compare(credentials.password, user[0].password)) {
          return {
            id: user[0].id,
            email: user[0].email,
            name: user[0].name,
            role: user[0].role,
          }
        }
        return null
      }
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) token.role = user.role
      return token
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub,
        role: token.role,
      },
    }),
  },
}
```

## 3. Database Operations (Drizzle ORM)

### Type-Safe Schema Definition and Queries

#### Schema with Relations
```typescript
// src/server/db/schema.ts
export const events = mysqlTable("event-booking-system_event", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  availableTickets: int("availableTickets").notNull(),
  status: mysqlEnum("status", ["ACTIVE", "INACTIVE"]).default("ACTIVE"),
})

export const bookings = mysqlTable("event-booking-system_booking", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  userId: varchar("userId", { length: 255 }).notNull(),
  eventId: varchar("eventId", { length: 255 }).notNull(),
  quantity: int("quantity").notNull(),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
})
```

#### Complex Join Operations
```typescript
// src/server/api/routers/cart.ts
const cartItems = await ctx.db
  .select({
    id: cart.id,
    quantity: cart.quantity,
    event: {
      id: events.id,
      name: events.name,
      price: events.price,
      availableTickets: events.availableTickets,
    },
  })
  .from(cart)
  .innerJoin(events, eq(cart.eventId, events.id))
  .where(eq(cart.userId, ctx.session.user.id))
  .orderBy(cart.addedAt)
```

## 4. Core Feature Logic - Checkout Process with Transactional Safety

### Booking Creation with Database Transactions
```typescript
// src/server/api/routers/bookings.ts
createFromCart: protectedProcedure
  .input(z.object({
    paymentMethod: z.enum(["card", "mobile", "cash"]),
    attendeeInfo: z.object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      email: z.string().email(),
    }),
  }))
  .mutation(async ({ ctx, input }) => {
    // Database transaction ensures atomicity
    return await ctx.db.transaction(async (tx) => {
      // Get cart items with event details
      const cartItems = await tx
        .select({ cart: cart, event: events })
        .from(cart)
        .innerJoin(events, eq(cart.eventId, events.id))
        .where(eq(cart.userId, ctx.session.user.id))

      if (cartItems.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cart is empty",
        })
      }

      // Process each booking atomically
      for (const item of cartItems) {
        // Verify ticket availability
        if (item.event.availableTickets < item.quantity) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Not enough tickets for ${item.event.name}`,
          })
        }

        // Create booking record
        await tx.insert(bookings).values({
          userId: ctx.session.user.id,
          eventId: item.eventId,
          quantity: item.quantity,
          totalAmount: (parseFloat(item.event.price) * item.quantity).toString(),
          referenceNumber: generateReferenceNumber(),
          attendeeInfo: input.attendeeInfo,
        })

        // Update ticket availability atomically
        await tx
          .update(events)
          .set({ 
            availableTickets: sql`${events.availableTickets} - ${item.quantity}` 
          })
          .where(eq(events.id, item.eventId))
      }

      // Clear cart after successful booking
      await tx.delete(cart).where(eq(cart.userId, ctx.session.user.id))

      return { success: true, bookingId: bookingId }
    })
  })
```

This implementation demonstrates:
- **Type Safety**: TypeScript interfaces ensure compile-time type checking
- **Responsive Design**: Tailwind CSS classes provide mobile-first responsive layouts
- **SSR**: Next.js server-side rendering with tRPC data fetching
- **API Type Safety**: tRPC procedures with Zod validation
- **Database Safety**: Drizzle ORM with type-safe queries and transactions
- **Authentication**: NextAuth.js with multiple provider support
- **Transactional Integrity**: Database transactions ensure data consistency
