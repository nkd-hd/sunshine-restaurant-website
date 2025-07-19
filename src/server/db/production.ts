import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { env } from "~/env";

// Production database configuration
const createProductionPool = () => {
  return mysql.createPool(env.DATABASE_URL);
};

// Create connection pool
const pool = createProductionPool();

// Enhanced database instance with logging for production
export const productionDb = drizzle(pool, {
  logger: env.NODE_ENV === "production" && process.env.DATABASE_LOGGING === "true" ? {
    logQuery: (query, params) => {
      console.log(`[DB Query] ${new Date().toISOString()}: ${query}`);
      if (params && params.length > 0) {
        console.log(`[DB Params] ${JSON.stringify(params)}`);
      }
    },
  } : undefined,
});

// Database health check function
export async function checkDatabaseHealth() {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
  }
}

// Graceful shutdown function
export async function closeDatabaseConnections() {
  try {
    await pool.end();
    console.log("Database connections closed gracefully");
  } catch (error) {
    console.error("Error closing database connections:", error);
  }
}

// Database performance monitoring
export async function getDatabaseStats() {
  try {
    const connection = await pool.getConnection();

    // Get basic database statistics
    const [processListRows] = await connection.execute("SHOW PROCESSLIST");
    const [statusRows] = await connection.execute("SHOW STATUS LIKE 'Connections'");
    const [variablesRows] = await connection.execute("SHOW VARIABLES LIKE 'max_connections'");

    connection.release();

    return {
      processCount: Array.isArray(processListRows) ? processListRows.length : 0,
      connections: statusRows,
      maxConnections: variablesRows,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error getting database stats:", error);
    return null;
  }
}

// Export the production database instance
export { productionDb as db };
