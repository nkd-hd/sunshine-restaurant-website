import { type Config } from "drizzle-kit";

import { env } from "~/env";

export default {
  schema: "./src/server/db/schema.ts",
  dialect: "mysql", // Using MySQL for local development
  dbCredentials: {
    url: env.DATABASE_URL!, // Use the full connection URL (non-null assertion)
  },
  tablesFilter: ["event-booking-system_*"],
} satisfies Config;
