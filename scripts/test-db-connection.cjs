const { db } = require("../src/server/db/index.js");
const { events } = require("../src/server/db/schema.js");

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    if (!db) {
      throw new Error("Database connection not available");
    }

    // Test basic connection by counting events
    const eventCount = await db.select().from(events);
    console.log(`✅ Database connected successfully!`);
    console.log(`📊 Found ${eventCount.length} events in database`);
    
    if (eventCount.length > 0) {
      console.log('\n📋 Sample events:');
      eventCount.slice(0, 3).forEach((event, index) => {
        console.log(`${index + 1}. ${event.name} - ${event.location} (${event.availableTickets} tickets)`);
      });
    } else {
      console.log('\n💡 No events found. Run "npm run db:seed" to add sample data.');
    }

  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Check your DATABASE_URL in .env file');
    console.log('2. Ensure your database is running');
    console.log('3. Run "npm run db:migrate" to apply migrations');
    console.log('4. Run "npm run db:seed" to add sample data');
    process.exit(1);
  }
}

// Run the test
testDatabaseConnection()
  .then(() => {
    console.log('\n🎉 Database test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Database test failed:', error);
    process.exit(1);
  });
