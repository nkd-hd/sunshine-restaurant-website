import MainLayout from "~/components/layout/main-layout"
import EventCard from "~/components/events/event-card"
import { api, HydrateClient } from "~/trpc/server"

export default async function EventsPage() {
  let events: any[] = []
  let locations: string[] = []
  let totalEvents = 0

  try {
    // Fetch initial data on the server
    const eventsData = await api.events.getAll({
      limit: 50,
    })
    events = eventsData.events
    totalEvents = eventsData.total

    locations = await api.events.getLocations()
    
    console.log("Server-side events loaded:", { 
      eventsCount: events.length, 
      totalEvents, 
      locationsCount: locations.length 
    })
  } catch (error) {
    console.log("Error loading events:", error)
    // Continue with empty data
  }

  return (
    <HydrateClient>
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Discover Events in Cameroon</h1>
            <p className="text-gray-600">Find and book amazing events happening across Cameroon</p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Events</label>
                <input
                  type="text"
                  placeholder="Search by name or description..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">All Cities</option>
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {events.length} of {totalEvents} events
            </p>
          </div>

          {/* Events Grid */}
          {events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event: any) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600">Check back soon for exciting events!</p>
            </div>
          )}
        </div>
      </MainLayout>
    </HydrateClient>
  )
}
