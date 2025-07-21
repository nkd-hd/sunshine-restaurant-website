import "~/styles/globals.css";

import { type Metadata, type Viewport } from "next";
import { Geist } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import Script from "next/script";

import { ConvexClientProvider } from "~/providers/ConvexProvider";
import { resourceHints } from "~/lib/performance";

// Enhanced metadata for better SEO and performance
export const metadata: Metadata = {
  title: {
    default: "Sunshine Restaurant - Order Online | Yaoundé Delivery",
    template: "%s | Sunshine Restaurant"
  },
  description: "Order delicious meals from Sunshine Restaurant with fast delivery in Yaoundé. Browse our menu, track your order, and connect via WhatsApp. Authentic West African cuisine delivered fresh to your door.",
  keywords: ["restaurant", "food delivery", "Yaoundé", "West African cuisine", "online ordering", "WhatsApp delivery"],
  authors: [{ name: "Sunshine Restaurant" }],
  creator: "Sunshine Restaurant",
  publisher: "Sunshine Restaurant",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://sunshine-restaurant.com",
    title: "Sunshine Restaurant - Order Online | Yaoundé Delivery",
    description: "Order delicious meals from Sunshine Restaurant with fast delivery in Yaoundé. Browse our menu, track your order, and connect via WhatsApp.",
    siteName: "Sunshine Restaurant",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sunshine Restaurant - Order Online | Yaoundé Delivery",
    description: "Order delicious meals from Sunshine Restaurant with fast delivery in Yaoundé. Browse our menu, track your order, and connect via WhatsApp.",
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL || "https://sunshine-restaurant.com",
  },
};

// Viewport configuration for better mobile performance
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

// Optimized font loading with preload
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap", // Improved font loading performance
  preload: true,
  fallback: ["system-ui", "arial"],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <head>
        {/* Preconnect to external domains for better performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS prefetch for potential external resources */}
        <link rel="dns-prefetch" href="//vercel.com" />
        <link rel="dns-prefetch" href="//convex.dev" />
        
        {/* Resource hints for critical assets */}
        <link rel="preload" href="/textures/wood-background.jpg" as="image" type="image/jpeg" />
        
        {/* Optimize for Core Web Vitals */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="color-scheme" content="light" />
      </head>
      <body className="antialiased">
        <ConvexClientProvider>
          <SessionProvider
            // Optimize session check interval
            refetchInterval={5 * 60} // 5 minutes
            refetchOnWindowFocus={true}
          >
            {children}
          </SessionProvider>
        </ConvexClientProvider>
        
        {/* Performance monitoring script - only in production */}
        {process.env.NODE_ENV === "production" && (
          <Script
            id="performance-monitor"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                // Initialize performance monitoring
                if ('performance' in window && 'PerformanceObserver' in window) {
                  // Monitor Core Web Vitals
                  function reportWebVitals(metric) {
                    // Replace with your analytics service
                    console.log(metric.name, metric.value);
                  }
                  
                  // Import web-vitals dynamically to avoid blocking
                  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
                    getCLS(reportWebVitals);
                    getFID(reportWebVitals);
                    getFCP(reportWebVitals);
                    getLCP(reportWebVitals);
                    getTTFB(reportWebVitals);
                  }).catch(err => console.warn('Failed to load web-vitals:', err));
                }
              `,
            }}
          />
        )}
        
        {/* Service Worker registration for offline support */}
        <Script
          id="service-worker"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
                navigator.serviceWorker.register('/sw.js')
                  .then(registration => console.log('SW registered'))
                  .catch(error => console.warn('SW registration failed'));
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
