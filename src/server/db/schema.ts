import { relations, sql } from "drizzle-orm";
import {
  index,
  mysqlTable,
  primaryKey,
  varchar,
  bigint,
  timestamp,
  text,
  int,
  decimal,
  date,
  time,
  json,
  mysqlEnum
} from "drizzle-orm/mysql-core";
import { type AdapterAccount } from "next-auth/adapters";

export const posts = mysqlTable("event-booking-system_post", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  name: varchar("name", { length: 256 }),
  createdById: varchar("createdById", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt").onUpdateNow(),
}, (t) => [
  index("created_by_idx").on(t.createdById),
  index("name_idx").on(t.name),
]);

export const users = mysqlTable("event-booking-system_user", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("emailVerified", {
    mode: "date",
    fsp: 3,
  }),
  image: varchar("image", { length: 255 }),
  password: varchar("password", { length: 255 }), // For credentials authentication
  role: mysqlEnum("role", ["USER", "ADMIN"]).default("USER"),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  bookings: many(bookings),
  cartItems: many(cart),
}));

export const accounts = mysqlTable("event-booking-system_account", {
  userId: varchar("userId", { length: 255 }).notNull(),
  type: varchar("type", { length: 255 }).notNull(),
  provider: varchar("provider", { length: 255 }).notNull(),
  providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: int("expires_at"),
  token_type: varchar("token_type", { length: 255 }),
  scope: varchar("scope", { length: 255 }),
  id_token: text("id_token"),
  session_state: varchar("session_state", { length: 255 }),
}, (t) => [
  primaryKey({
    columns: [t.provider, t.providerAccountId],
  }),
  index("account_user_id_idx").on(t.userId),
]);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = mysqlTable("event-booking-system_session", {
  sessionToken: varchar("sessionToken", { length: 255 }).notNull().primaryKey(),
  userId: varchar("userId", { length: 255 }).notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
}, (t) => [
  index("session_user_id_idx").on(t.userId)
]);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = mysqlTable("event-booking-system_verification_token", {
  identifier: varchar("identifier", { length: 255 }).notNull(),
  token: varchar("token", { length: 255 }).notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
}, (t) => [
  primaryKey({ columns: [t.identifier, t.token] })
]);

// Event Booking System Tables

export const events = mysqlTable("event-booking-system_event", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  date: date("date").notNull(),
  time: time("time").notNull(),
  venue: varchar("venue", { length: 200 }).notNull(),
  location: varchar("location", { length: 200 }).notNull(),
  organizer: varchar("organizer", { length: 100 }).notNull(),
  organizerContact: varchar("organizerContact", { length: 100 }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  availableTickets: int("availableTickets").notNull(),
  totalTickets: int("totalTickets").notNull(),
  imageUrl: varchar("imageUrl", { length: 500 }),
  category: varchar("category", { length: 100 }),
  status: mysqlEnum("status", ["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  createdAt: timestamp("createdAt")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt").onUpdateNow(),
}, (t) => [
  index("event_date_idx").on(t.date),
  index("event_location_idx").on(t.location),
  index("event_status_idx").on(t.status),
]);

export const bookings = mysqlTable("event-booking-system_booking", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: varchar("userId", { length: 255 }).notNull(),
  eventId: varchar("eventId", { length: 255 }).notNull(),
  quantity: int("quantity").notNull(),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
  bookingDate: timestamp("bookingDate")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  status: mysqlEnum("status", ["CONFIRMED", "CANCELLED", "PENDING_PAYMENT"]).default("PENDING_PAYMENT"),
  attendeeInfo: json("attendeeInfo"),
  referenceNumber: varchar("referenceNumber", { length: 50 }).unique(),
  paymentMethod: mysqlEnum("paymentMethod", ["MTN_MOMO", "ORANGE_MONEY", "CASH"]),
  paymentStatus: mysqlEnum("paymentStatus", ["PENDING", "COMPLETED", "FAILED", "REFUNDED"]).default("PENDING"),
  paymentReference: varchar("paymentReference", { length: 100 }),
  paymentDetails: json("paymentDetails"),
  createdAt: timestamp("createdAt")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
}, (t) => [
  index("booking_user_id_idx").on(t.userId),
  index("booking_event_id_idx").on(t.eventId),
  index("booking_reference_idx").on(t.referenceNumber),
  index("booking_payment_status_idx").on(t.paymentStatus),
]);

export const cart = mysqlTable("event-booking-system_cart", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: varchar("userId", { length: 255 }).notNull(),
  eventId: varchar("eventId", { length: 255 }).notNull(),
  quantity: int("quantity").notNull(),
  addedAt: timestamp("addedAt")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
}, (t) => [
  index("cart_user_id_idx").on(t.userId),
  index("cart_event_id_idx").on(t.eventId),
]);

// Relations for Event Booking System

export const eventsRelations = relations(events, ({ many }) => ({
  bookings: many(bookings),
  cartItems: many(cart),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, { fields: [bookings.userId], references: [users.id] }),
  event: one(events, { fields: [bookings.eventId], references: [events.id] }),
}));

export const cartRelations = relations(cart, ({ one }) => ({
  user: one(users, { fields: [cart.userId], references: [users.id] }),
  event: one(events, { fields: [cart.eventId], references: [events.id] }),
}));
