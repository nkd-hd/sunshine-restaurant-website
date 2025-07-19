import { NextResponse } from "next/server";
import { createPool } from "mysql2/promise";
import { env } from "~/env";

interface HealthResponse {
  status: "healthy" | "unhealthy" | "warning";
  timestamp: string;
  uptime: number;
  database: "connected" | "disconnected" | "not_configured";
  version: string;
  environment: string;
  message: string;
}

export async function GET() {
  try {
    let databaseStatus: "connected" | "disconnected" | "not_configured" = "not_configured";
    let overallStatus: "healthy" | "unhealthy" | "warning" = "warning";
    let message = "Application running";

    // Check if database URL is configured
    if (!env.DATABASE_URL) {
      databaseStatus = "not_configured";
      message = "Database not configured";
    } else {
      try {
        // Create a direct connection to test database
        const pool = createPool(env.DATABASE_URL);
        const connection = await pool.getConnection();

        // Test the connection with a simple query
        await connection.execute("SELECT 1 as test");

        // Release the connection
        connection.release();
        await pool.end();

        databaseStatus = "connected";
        overallStatus = "healthy";
        message = "Application and database are running";
      } catch (error) {
        databaseStatus = "disconnected";
        overallStatus = "unhealthy";
        message = `Database connection failed: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    }

    const healthData: HealthResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: databaseStatus,
      version: process.env.npm_package_version || "unknown",
      environment: process.env.NODE_ENV || "unknown",
      message,
    };

    // Return appropriate HTTP status code
    const statusCode = overallStatus === "healthy" ? 200 : overallStatus === "warning" ? 200 : 503;

    return NextResponse.json(healthData, { status: statusCode });
  } catch (error) {
    return NextResponse.json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: "error",
      version: "unknown",
      environment: process.env.NODE_ENV || "unknown",
      message: `Health check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }, { status: 503 });
  }
}
