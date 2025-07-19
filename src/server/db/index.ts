import { drizzle } from "drizzle-orm/mysql2";
import { createPool, type Pool } from "mysql2/promise";

import { env } from "~/env";
import * as schema from "./schema";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  conn: Pool | undefined;
};

// Lazy connection logic for local MySQL - only connect when needed
function getConnection() {
  if (globalForDb.conn) {
    return globalForDb.conn;
  }

  if (!env.DATABASE_URL) {
    console.error("❌ Database connection failed!");
    console.error("📋 Troubleshooting steps:");
    console.error("1. Check if MySQL container is running: docker ps");
    console.error("2. Check DATABASE_URL in .env file");
    console.error("3. Verify connection: npm run db:test");
    throw new Error("Database connection not available. Please check your DATABASE_URL environment variable.");
  }

  const conn = createPool(env.DATABASE_URL);

  if (env.NODE_ENV !== "production") {
    globalForDb.conn = conn;
  }

  return conn;
}

// Create database instance - simplified for production reliability
let dbInstance: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (!dbInstance) {
    const conn = getConnection();
    dbInstance = drizzle(conn, { schema, mode: "default" });
  }
  return dbInstance;
}

// Export the database instance
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(target, prop) {
    const dbInstance = getDb();
    return dbInstance[prop as keyof typeof dbInstance];
  }
});
