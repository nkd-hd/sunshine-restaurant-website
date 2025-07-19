import { postRouter } from "~/server/api/routers/post";
import { eventsRouter } from "~/server/api/routers/events";
import { cartRouter } from "~/server/api/routers/cart";
import { bookingsRouter } from "~/server/api/routers/bookings";
import { authRouter } from "~/server/api/routers/auth";
import { adminRouter } from "~/server/api/routers/admin";
import { chatbotRouter } from "~/server/api/routers/chatbot";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  events: eventsRouter,
  cart: cartRouter,
  bookings: bookingsRouter,
  auth: authRouter,
  admin: adminRouter,
  chatbot: chatbotRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
