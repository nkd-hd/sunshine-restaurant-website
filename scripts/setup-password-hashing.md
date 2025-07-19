# Password Hashing Setup Instructions

## Step 1: Install bcryptjs

```bash
npm install bcryptjs @types/bcryptjs
```

## Step 2: Update Auth Config

In `src/server/auth/config.ts`, uncomment and update the bcrypt lines:

```typescript
// Replace line 5:
// import bcrypt from "bcryptjs";
import bcrypt from "bcryptjs";

// Replace line 26-27:
// const isPasswordValid = user[0].password === credentials.password;
const isPasswordValid = await bcrypt.compare(
  credentials.password as string,
  user[0].password || ""
);
```

## Step 3: Update Auth Router

In `src/server/api/routers/auth.ts`, uncomment and update the bcrypt lines:

```typescript
// Replace line 5:
// import bcrypt from "bcryptjs"; // Will uncomment when bcryptjs is installed
import bcrypt from "bcryptjs";

// Replace lines 25-27 in register mutation:
// const hashedPassword = input.password; // Temporary - NOT SECURE
const hashedPassword = await bcrypt.hash(input.password, 12);

// Replace lines 95-97 in changePassword mutation:
// const isCurrentPasswordValid = input.currentPassword === user[0].password;
const isCurrentPasswordValid = await bcrypt.compare(input.currentPassword, user[0].password || "");

// Replace lines 104-106 in changePassword mutation:
// const hashedNewPassword = input.newPassword; // Temporary - NOT SECURE
const hashedNewPassword = await bcrypt.hash(input.newPassword, 12);
```

## Step 4: Test the Implementation

1. Start the development server:
```bash
npm run dev
```

2. Create a new account at `/auth/signup`
3. Sign in at `/auth/signin`
4. Verify that passwords are now properly hashed in the database

## Security Notes

- Passwords will now be hashed with bcrypt using 12 salt rounds
- This provides strong protection against rainbow table attacks
- Existing plain text passwords in the database will need to be reset
- Users with plain text passwords should be prompted to reset their passwords

## Migration for Existing Users

If you have existing users with plain text passwords, you can:

1. Force all users to reset their passwords
2. Or create a migration script to hash existing passwords
3. Or implement a hybrid approach that detects and upgrades passwords on login

The authentication system will be production-ready after implementing these changes.
