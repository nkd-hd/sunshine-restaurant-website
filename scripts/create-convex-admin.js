import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "http://127.0.0.1:3210";
const client = new ConvexHttpClient(convexUrl);

async function createConvexAdmin() {
  try {
    console.log('🔧 Creating admin user in Convex...');
    console.log(`🔗 Convex URL: ${convexUrl}`);
    
    const adminData = {
      email: "nkayd.edu@gmail.com",
      password: "Nyuyuni6", 
      name: "Admin User"
    };

    console.log(`📧 Email: ${adminData.email}`);
    console.log(`🔑 Password: ${adminData.password}`);
    
    const result = await client.mutation(api.createAdmin.createAdminUser, adminData);
    
    console.log('✅ Admin user creation result:', result);
    console.log('\n🎉 Admin user setup complete!');
    console.log('📧 Email: nkayd.edu@gmail.com');
    console.log('🔑 Password: Nyuyuni6'); 
    console.log('🔗 Login at: http://localhost:3000/auth/signin');
    console.log('🛡️  Admin panel: http://localhost:3000/admin');

  } catch (error) {
    console.error('❌ Error creating admin user in Convex:', error);
    process.exit(1);
  }
}

createConvexAdmin()
  .then(() => {
    console.log('✨ Convex admin user creation completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Convex admin user creation failed:', error);
    process.exit(1);
  });
