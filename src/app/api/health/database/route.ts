import { NextResponse } from "next/server";
import { checkDatabaseHealth, getDatabaseStats } from "~/server/db/production";

export async function GET() {
  try {
    const health = await checkDatabaseHealth();
    const stats = await getDatabaseStats();

    if (health.status === "healthy") {
      return NextResponse.json({
        status: "healthy",
        database: health,
        stats: stats,
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        {
          status: "unhealthy",
          database: health,
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
