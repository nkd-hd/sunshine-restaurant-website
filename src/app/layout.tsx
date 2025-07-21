import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { SessionProvider } from "next-auth/react";

import { ConvexClientProvider } from "~/providers/ConvexProvider";

export const metadata: Metadata = {
  title: "Sunshine Restaurant - Order Online | Yaoundé Delivery",
  description: "Order delicious meals from Sunshine Restaurant with fast delivery in Yaoundé. Browse our menu, track your order, and connect via WhatsApp.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <ConvexClientProvider>
          <SessionProvider>
            {children}
          </SessionProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
