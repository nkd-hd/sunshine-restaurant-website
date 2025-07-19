import { drizzle } from "drizzle-orm/mysql2";
import { createPool } from "mysql2/promise";
import { users } from "../src/server/db/schema";
import { eq } from "drizzle-orm";
import { env } from "../src/env";

async function createSpecificAdmin() {
  try {
    console.log('🔧 Creating specific admin user...');

    // Create database connection
    const conn = createPool(env.DATABASE_URL);
    const db = drizzle(conn, { mode: "default" });

    const adminEmail = "surekarl.hd";
    const adminPassword = "Nyuyuni6";
    const adminName = "Admin User";

    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail))
      .limit(1);

    if (existingUser.length > 0) {
      // Update existing user to admin role
      await db
        .update(users)
        .set({ 
          role: "ADMIN",
          name: adminName,
          password: adminPassword // In production, this should be hashed
        })
        .where(eq(users.email, adminEmail));
      
      console.log(`✅ Updated existing user ${adminEmail} to ADMIN role`);
    } else {
      // Create new admin user
      await db.insert(users).values({
        name: adminName,
        email: adminEmail,
        password: adminPassword, // In production, this should be hashed
        role: "ADMIN",
      });

      console.log(`✅ Created new admin user: ${adminEmail}`);
    }

    console.log('\n🎉 Admin user setup complete!');
    console.log('📧 Email: surekarl.hd');
    console.log('🔑 Password: Nyuyuni6');
    console.log('🔗 Login at: http://localhost:3000/auth/signin');
    console.log('🛡️  Admin panel: http://localhost:3000/admin');

    await conn.end();

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

// Run the function
createSpecificAdmin()
  .then(() => {
    console.log('✨ Admin user creation completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Admin user creation failed:', error);
    process.exit(1);
  });
