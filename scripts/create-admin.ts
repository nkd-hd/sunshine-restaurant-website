// Simple admin user creation script
// Run this with: npm run create-admin

console.log('👤 Admin User Creation Instructions');
console.log('=====================================');
console.log('');
console.log('To create an admin user, follow these steps:');
console.log('');
console.log('1. 📝 Register a new user at: http://localhost:3000/auth/signup');
console.log('   - Use email: admin@example.com');
console.log('   - Use password: admin123');
console.log('   - Use name: Admin User');
console.log('');
console.log('2. 🗄️  Update the user role in the database:');
console.log('   - Connect to your MySQL database');
console.log('   - Run this SQL command:');
console.log('   UPDATE `event-booking-system_user` SET role = "ADMIN" WHERE email = "admin@example.com";');
console.log('');
console.log('3. 🔐 Login with admin credentials:');
console.log('   - Go to: http://localhost:3000/auth/signin');
console.log('   - Email: admin@example.com');
console.log('   - Password: admin123');
console.log('');
console.log('4. 🛡️  Access admin panel:');
console.log('   - Visit: http://localhost:3000/admin');
console.log('');
console.log('✨ You will now have full admin access!');


