"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  X,
} from "lucide-react"
import AdminLayout from "~/components/admin/admin-layout"
import EventForm from "~/components/admin/event-form"
import { Button } from "~/components/ui/button"

// Simple working admin events page
export default function WorkingAdminEventsPage() {
  const { data: session } = useSession()
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<any>(null)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/trpc/events.getAll?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%22offset%22%3A0%2C%22limit%22%3A10%2C%22search%22%3A%22%22%7D%7D%7D')
        const data = await response.json()
        
        console.log('Fetched data:', data)
        
        if (data?.[0]?.result?.data) {
          setEvents(data[0].result.data.events || [])
        }
        setLoading(false)
      } catch (err) {
        console.error('Error fetching events:', err)
        setError('Failed to load events')
        setLoading(false)
      }
    }

    if (session) {
      fetchEvents()
    }
  }, [session])

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return new Intl.NumberFormat("fr-CM", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(numPrice)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return

    try {
      const response = await fetch(`/api/admin/events/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setEvents(events.filter((event) => event.id !== id))
      } else {
        setError("Failed to delete event")
      }
    } catch (error) {
      setError("Failed to delete event")
    }
  }

  const handleEdit = (event: any) => {
    setEditingEvent({
      ...event,
      date: new Date(event.date).toISOString().split('T')[0], // Convert to YYYY-MM-DD format
      price: parseFloat(event.price),
    })
    setShowEditModal(true)
  }

  const handleCreateEvent = async (formData: any) => {
    try {
      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          date: new Date(formData.date),
        }),
      })

      if (response.ok) {
        const newEvent = await response.json()
        setEvents([...events, newEvent])
        setShowCreateModal(false)
      } else {
        setError("Failed to create event")
      }
    } catch (error) {
      setError("Failed to create event")
    }
  }

  const handleUpdateEvent = async (formData: any) => {
    if (!editingEvent) return

    try {
      const response = await fetch(`/api/admin/events/${editingEvent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          date: new Date(formData.date),
        }),
      })

      if (response.ok) {
        const updatedEvent = await response.json()
        setEvents(events.map(event =>
          event.id === updatedEvent.id ? updatedEvent : event
        ))
        setShowEditModal(false)
        setEditingEvent(null)
      } else {
        setError("Failed to update event")
      }
    } catch (error) {
      setError("Failed to update event")
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          <p className="ml-4 text-gray-600">Loading events...</p>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
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
            <h1 className="text-2xl font-bold text-gray-900">Events Management (Working)</h1>
            <p className="text-gray-600">Found {events.length} events</p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => {
              console.log('Create Event button clicked!')
              setShowCreateModal(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </div>

        {/* Events Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first event</p>
            </div>
          ) : (
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
                  {events.map((event: any) => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-lg object-cover"
                              src={event.imageUrl || "/placeholder.svg"}
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
                          {new Date(event.date).toLocaleDateString("fr-CM")} at {event.time}
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
                          onClick={() => handleEdit(event)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900 inline-flex items-center"
                          onClick={() => handleDelete(event.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Debug Info */}
        <div className="bg-yellow-50 p-4 rounded-lg mt-4">
          <h3 className="font-bold">Debug Info:</h3>
          <p>Show Create Modal: {showCreateModal.toString()}</p>
          <p>Show Edit Modal: {showEditModal.toString()}</p>
          <p>Editing Event: {editingEvent ? editingEvent.name : 'null'}</p>
        </div>
      </div>

      {/* Simple Test Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Test Modal</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <p>This is a simple test modal to check if modals work.</p>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Forms - Commented out for testing */}
      {/* <EventForm
        isOpen={showCreateModal}
        onClose={() => {
          console.log('Closing create modal')
          setShowCreateModal(false)
        }}
        onSubmit={handleCreateEvent}
        mode="create"
      />

      <EventForm
        isOpen={showEditModal}
        onClose={() => {
          console.log('Closing edit modal')
          setShowEditModal(false)
          setEditingEvent(null)
        }}
        onSubmit={handleUpdateEvent}
        initialData={editingEvent}
        mode="edit"
      /> */}
    </AdminLayout>
  )
}
