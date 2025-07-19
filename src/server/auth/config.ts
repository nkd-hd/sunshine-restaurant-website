import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";

import { env } from "~/env";
import { db } from "~/server/db";
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from "~/server/db/schema";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role?: string;
      // ...other properties
    } & DefaultSession["user"];
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  trustHost: true, // Trust the host in production (required for Netlify)
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        if (!db) {
          console.log("Database not available, using demo authentication");
          // Demo user for testing without database
          if (credentials.email === "demo@example.com" && credentials.password === "demo123") {
            return {
              id: "demo-user-id",
              email: "demo@example.com",
              name: "Demo User",
              image: null,
            };
          }
          return null;
        }

        try {
          // Find user by email
          const user = await db
            .select()
            .from(users)
            .where(eq(users.email, credentials.email as string))
            .limit(1);

          if (!user[0]) {
            return null;
          }

          // Verify password (for now, we'll add bcrypt later)
          // TODO: Replace with bcrypt.compare when bcryptjs is installed
          const isPasswordValid = user[0].password === credentials.password;

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user[0].id,
            email: user[0].email,
            name: user[0].name,
            image: user[0].image,
            role: user[0].role || undefined,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
    // Discord provider removed - using credentials only
  ],
  // TODO: Re-enable adapter when SingleStore support is available
  // ...(db && {
  //   adapter: DrizzleAdapter(db, {
  //     usersTable: users,
  //     accountsTable: accounts,
  //     sessionsTable: sessions,
  //     verificationTokensTable: verificationTokens,
  //   }),
  // }),
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt: ({ token, user }) => {
      if (user && 'role' in user) {
        token.role = user.role;
      }
      return token;
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub,
        role: token.role as string | undefined,
      },
    }),
  },
  pages: {
    signIn: "/auth/signin",
  },
} satisfies NextAuthConfig;
