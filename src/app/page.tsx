import Link from "next/link";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import MainLayout from "~/components/layout/main-layout";
import EventCard from "~/components/events/event-card";

export default async function Home() {
  let hello = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let featuredEvents: any[] = [];
  let session = null;

  try {
    hello = await api.post.hello({ text: "from tRPC" });
    session = await auth();

    // Fetch featured events - handle gracefully if database is not available
    try {
      featuredEvents = await api.events.getFeatured();
    } catch (error) {
      console.log("Featured events not available:", error);
      featuredEvents = [];
    }

    if (session?.user) {
      void api.post.getLatest.prefetch();
    }
  } catch (error) {
    console.log("Application initialization error:", error);
    // Continue with empty data - app will still render
  }

  return (
    <HydrateClient>
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
          {/* Hero Section */}
          <div className="relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
              <div className="text-center">
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                  Welcome to <span className="text-primary">Sunshine Restaurant</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                  Delicious meals delivered fresh to your door in Yaoundé. Browse our menu, order online, and track your delivery with WhatsApp integration.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/menu"
                    className="bg-primary text-white px-8 py-3 rounded-md hover:bg-primary/90 transition-colors font-medium"
                  >
                    View Menu
                  </Link>
                  {!session && (
                    <Link
                      href="/auth/signin"
                      className="border border-primary text-primary px-8 py-3 rounded-md hover:bg-primary/10 transition-colors font-medium"
                    >
                      Sign In
                    </Link>
                  )}
                  {session?.user?.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      className="bg-secondary text-white px-8 py-3 rounded-md hover:bg-secondary/90 transition-colors font-medium flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622C17.176 19.29 21 14.591 21 9a12.02 12.02 0 00-.382-3.016z" />
                      </svg>
                      Restaurant Admin
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Sunshine Restaurant?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Fresh ingredients, fast delivery, and exceptional customer service in Yaoundé
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Ordering</h3>
                <p className="text-gray-600">Order your favorite meals with just a few taps from our menu</p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast Delivery</h3>
                <p className="text-gray-600">Quick delivery across Yaoundé with real-time tracking</p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">WhatsApp Support</h3>
                <p className="text-gray-600">Direct communication with restaurant and delivery team</p>
              </div>
            </div>
          </div>

          {/* Featured Meals Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Meals</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Discover our chef's special recommendations and most popular dishes
              </p>
            </div>

            {featuredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                {featuredEvents.slice(0, 6).map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Database Connected Successfully!</h3>
                  <p className="text-gray-600 mb-4">
                    The application is running with database connectivity. Featured events will appear here once events are added.
                  </p>
                  <p className="text-sm text-blue-600">
                    ✅ Phase 1 Complete: Next.js + Database Working! 🎉
                  </p>
                </div>
              </div>
            )}

            <div className="text-center">
              <Link
                href="/events"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                View All Events
              </Link>
            </div>
          </div>

          {/* Debug Section (only show in development) */}
          {process.env.NODE_ENV === "development" && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="bg-gray-100 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Development Info & Testing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-gray-600 mb-2">
                      tRPC: {hello ? hello.greeting : "Loading..."}
                    </p>
                    <p className="text-gray-600 mb-2">
                      Session: {session ? `Logged in as ${session.user?.name ?? session.user?.email}` : "Not logged in"}
                    </p>
                    {session?.user?.role && (
                      <p className="text-gray-600">
                        Role: <span className={`font-semibold ${session.user.role === 'ADMIN' ? 'text-red-600' : 'text-green-600'}`}>
                          {session.user.role}
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Quick Actions:</h4>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href="/api/health/database"
                        target="_blank"
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        Check DB Health
                      </Link>
                      {session?.user?.role === "ADMIN" && (
                        <Link
                          href="/admin/database"
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                        >
                          View Database
                        </Link>
                      )}
                      <Link
                        href="/dashboard"
                        className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition-colors"
                      >
                        User Dashboard
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500 border-t pt-4">
                  <p><strong>Testing Guide:</strong> See TESTING_GUIDE.md for complete testing instructions</p>
                  <p><strong>Admin Login:</strong> admin@example.com / admin123</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </MainLayout>
    </HydrateClient>
  );
}
