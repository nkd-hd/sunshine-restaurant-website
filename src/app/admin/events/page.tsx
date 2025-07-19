"use client"

import { useState, useCallback, useEffect } from "react"
import { useSession } from "next-auth/react"
import dynamic from "next/dynamic"
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Search,
  X,
} from "lucide-react"
import AdminLayout from "~/components/admin/admin-layout"
import EventForm from "~/components/admin/event-form"
import { Button } from "~/components/ui/button"
import { api } from "~/trpc/react"

export default function AdminEventsPage() {
  const { data: session } = useSession()
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<any>(null)

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const { data: eventsData, isLoading, refetch, error } = api.events.getAll.useQuery(
    {
      offset: (page - 1) * 10,
      limit: 10,
      search: searchTerm,
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
      enabled: mounted, // Only enable after component is mounted
    }
  )

  // Debug logging
  console.log("Events query state:", {
    isLoading,
    hasData: !!eventsData,
    eventsCount: eventsData?.events?.length,
    error: error?.message,
    searchTerm,
    page,
    timestamp: new Date().toISOString()
  })

  // Debug the actual data structure
  if (eventsData) {
    console.log("Full eventsData structure:", eventsData)
    console.log("eventsData.events:", eventsData.events)
    console.log("eventsData.events type:", typeof eventsData.events)
    console.log("eventsData.events.length:", eventsData.events?.length)
  }

  const createEventMutation = api.admin.createEvent.useMutation({
    onSuccess: () => {
      void refetch()
      setShowCreateModal(false)
    },
    onError: (error) => {
      console.error("Create event error:", error)
      alert(error.message)
    },
  })

  const updateEventMutation = api.admin.updateEvent.useMutation({
    onSuccess: () => {
      void refetch()
      setShowEditModal(false)
      setEditingEvent(null)
    },
    onError: (error) => {
      console.error("Update event error:", error)
      alert(error.message)
    },
  })

  const deleteEventMutation = api.admin.deleteEvent.useMutation({
    onSuccess: () => {
      void refetch()
    },
    onError: (error) => {
      console.error("Delete event error:", error)
      alert(error.message)
    },
  })

  const formatPrice = useCallback((price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return new Intl.NumberFormat("fr-CM", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(numPrice)
  }, [])

  // Handle both old and new image URL formats
  const getImageUrl = useCallback((imageUrl: string | null) => {
    if (!imageUrl) return "/placeholder.svg"

    // If it's already an API URL, use it as is
    if (imageUrl.startsWith("/api/uploads/")) return imageUrl

    // If it's an old format URL, convert it to API format
    if (imageUrl.startsWith("/uploads/")) {
      return `/api${imageUrl}`
    }

    // If it's an external URL (like Unsplash), use it as is
    if (imageUrl.startsWith("http")) return imageUrl

    // Fallback
    return "/placeholder.svg"
  }, [])

  const handleCreateEvent = useCallback(async (formData: any) => {
    let imageUrl = formData.imageUrl?.trim() || undefined

    // Handle image upload if a file was selected
    if (formData.imageFile) {
      try {
        const uploadFormData = new FormData()
        uploadFormData.append('file', formData.imageFile)

        const response = await fetch('/api/upload/image', {
          method: 'POST',
          body: uploadFormData,
        })

        if (response.ok) {
          const result = await response.json()
          imageUrl = result.imageUrl
        } else {
          const error = await response.json()
          alert(`Image upload failed: ${error.error}`)
          return
        }
      } catch (error) {
        console.error('Image upload error:', error)
        alert('Failed to upload image. Please try again.')
        return
      }
    }

    // Clean up the form data - remove empty strings for optional fields
    const cleanedData = {
      ...formData,
      date: new Date(formData.date),
      imageUrl,
      category: formData.category?.trim() || undefined,
    }

    // Remove the imageFile from the data sent to the mutation
    delete cleanedData.imageFile

    createEventMutation.mutate(cleanedData)
  }, [createEventMutation])

  const handleEditEvent = useCallback((event: any) => {
    setEditingEvent({
      ...event,
      date: event.date.toISOString().split('T')[0], // Convert to YYYY-MM-DD format
      price: parseFloat(event.price),
    })
    setShowEditModal(true)
  }, [])

  const handleUpdateEvent = useCallback(async (formData: any) => {
    if (!editingEvent) return

    let imageUrl = formData.imageUrl?.trim() || undefined

    // Handle image upload if a new file was selected
    if (formData.imageFile) {
      try {
        const uploadFormData = new FormData()
        uploadFormData.append('file', formData.imageFile)

        const response = await fetch('/api/upload/image', {
          method: 'POST',
          body: uploadFormData,
        })

        if (response.ok) {
          const result = await response.json()
          imageUrl = result.imageUrl
        } else {
          const error = await response.json()
          alert(`Image upload failed: ${error.error}`)
          return
        }
      } catch (error) {
        console.error('Image upload error:', error)
        alert('Failed to upload image. Please try again.')
        return
      }
    }

    // Clean up the form data - remove empty strings for optional fields
    const cleanedData = {
      id: editingEvent.id,
      ...formData,
      date: new Date(formData.date),
      imageUrl,
      category: formData.category?.trim() || undefined,
    }

    // Remove the imageFile from the data sent to the mutation
    delete cleanedData.imageFile

    updateEventMutation.mutate(cleanedData)
  }, [editingEvent, updateEventMutation])

  const handleDeleteEvent = useCallback(async (eventId: string, eventName: string) => {
    if (confirm(`Are you sure you want to delete "${eventName}"? This action cannot be undone.`)) {
      deleteEventMutation.mutate({ id: eventId })
    }
  }, [deleteEventMutation])

  if (!mounted || isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          <p className="ml-4 text-gray-600">
            {!mounted ? "Initializing..." : "Loading events..."}
          </p>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading events: {error.message}</p>
            <button
              onClick={() => void refetch()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">


        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Events Management</h1>
            <p className="text-gray-600">Manage all events in the system</p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Debug info */}
          <div className="p-4 bg-yellow-50 border-b">
            <p className="text-sm">Debug: eventsData exists: {!!eventsData ? 'Yes' : 'No'}</p>
            <p className="text-sm">Debug: events array length: {eventsData?.events?.length || 'undefined'}</p>
            <p className="text-sm">Debug: condition result: {(!eventsData?.events?.length).toString()}</p>
          </div>

          {/* Force render table for debugging */}
          {eventsData?.events ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tickets
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {eventsData.events.map((event: any) => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-lg object-cover"
                              src={getImageUrl(event.imageUrl)}
                              alt={event.name}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {event.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              by {event.organizer}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {event.date.toLocaleDateString("fr-CM")} at {event.time}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {event.venue}, {event.location}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {event.availableTickets} / {event.totalTickets}
                        </div>
                        <div className="text-sm text-gray-500">
                          {((event.totalTickets - event.availableTickets) / event.totalTickets * 100).toFixed(0)}% sold
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {formatPrice(event.price)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            event.status === "ACTIVE"
                              ? "bg-green-100 text-green-800"
                              : event.status === "INACTIVE"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {event.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                          onClick={() => handleEditEvent(event)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900 inline-flex items-center"
                          onClick={() => handleDeleteEvent(event.id, event.name)}
                          disabled={deleteEventMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          {deleteEventMutation.isPending ? "Deleting..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events data available</h3>
              <p className="text-gray-600 mb-4">Waiting for data to load...</p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {eventsData && eventsData.hasMore && (
          <div className="flex items-center justify-between bg-white px-4 py-3 border-t border-gray-200 sm:px-6 rounded-lg shadow">
            <div className="flex justify-between flex-1 sm:hidden">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={!eventsData.hasMore}
                className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{page}</span> of events
                  ({eventsData.total} total)
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={!eventsData.hasMore}
                  className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Event Forms - Now using fixed EventForm component */}
        <EventForm
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateEvent}
          isLoading={createEventMutation.isPending}
          mode="create"
        />

        <EventForm
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setEditingEvent(null)
          }}
          onSubmit={handleUpdateEvent}
          initialData={editingEvent}
          isLoading={updateEventMutation.isPending}
          mode="edit"
        />
      </div>
    </AdminLayout>
  )
}
