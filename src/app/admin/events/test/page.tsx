"use client"

import { api } from "~/trpc/react"
import AdminLayout from "~/components/admin/admin-layout"

export default function TestAdminEventsPage() {
  const { data: eventsData, isLoading, error } = api.events.getAll.useQuery({
    offset: 0,
    limit: 10,
    search: "",
  })

  console.log("Test page - Events data:", { 
    isLoading, 
    hasData: !!eventsData, 
    eventsCount: eventsData?.events?.length,
    error: error?.message 
  })

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Test Events Page</h1>
          <p>Loading events...</p>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Test Events Page</h1>
          <p className="text-red-600">Error: {error.message}</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Test Events Page</h1>
        <p className="mb-4">Found {eventsData?.events?.length || 0} events</p>
        
        {eventsData?.events?.map((event: any) => (
          <div key={event.id} className="border p-4 mb-2 rounded">
            <h3 className="font-bold">{event.name}</h3>
            <p className="text-gray-600">{event.location} - {event.date}</p>
            <p className="text-sm">{event.availableTickets} tickets available</p>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}
