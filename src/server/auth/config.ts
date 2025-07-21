import { type DefaultSession, type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";

import { env } from "~/env";

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

        try {
          // Create Convex client for authentication
          const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "http://127.0.0.1:3210";
          const client = new ConvexHttpClient(convexUrl);
          
          // Authenticate user via Convex
          const user = await client.query(api.auth.authenticateUser, {
            email: credentials.email as string,
            password: credentials.password as string,
          });

          if (!user) {
            // Fallback to demo authentication if Convex authentication fails
            if (credentials.email === "demo@example.com" && credentials.password === "demo123") {
              return {
                id: "demo-user-id",
                email: "demo@example.com",
                name: "Demo User",
                image: null,
                role: "USER",
              };
            }
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role || undefined,
          };
        } catch (error) {
          console.error("Convex authentication error:", error);
          
          // Fallback to demo authentication on error
          if (credentials.email === "demo@example.com" && credentials.password === "demo123") {
            return {
              id: "demo-user-id",
              email: "demo@example.com",
              name: "Demo User",
              image: null,
              role: "USER",
            };
          }
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
