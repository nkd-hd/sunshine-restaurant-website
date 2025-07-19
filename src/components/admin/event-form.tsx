"use client"

import { useState, useEffect } from "react"
import { Button } from "~/components/ui/button"
import { X, Calendar, MapPin, DollarSign, Users, Clock, Image, Upload } from "lucide-react"

interface EventFormData {
  name: string
  description: string
  date: string
  time: string
  venue: string
  location: string
  price: number
  totalTickets: number
  organizer: string
  imageUrl: string
  category: string
}

interface EventFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: EventFormData & { imageFile?: File }) => void
  initialData?: Partial<EventFormData>
  isLoading?: boolean
  mode: "create" | "edit"
}



export default function EventForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
  mode
}: EventFormProps) {
  const [formData, setFormData] = useState<EventFormData>({
    name: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    location: "",
    price: 0,
    totalTickets: 0,
    organizer: "",
    imageUrl: "",
    category: "",
  })

  const [errors, setErrors] = useState<Partial<Record<keyof EventFormData, string>>>({})
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        date: initialData.date || "",
        time: initialData.time || "",
        venue: initialData.venue || "",
        location: initialData.location || "",
        price: initialData.price || 0,
        totalTickets: initialData.totalTickets || 0,
        organizer: initialData.organizer || "",
        imageUrl: initialData.imageUrl || "",
        category: initialData.category || "",
      })

      // Set existing image as preview if available
      if (initialData.imageUrl) {
        setImagePreview(initialData.imageUrl)
      }
    }
  }, [initialData])

  const validateForm = () => {
    const newErrors: Partial<Record<keyof EventFormData, string>> = {}

    if (!formData.name.trim()) newErrors.name = "Event name is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (!formData.date) newErrors.date = "Date is required"
    if (!formData.time) newErrors.time = "Time is required"
    if (!formData.venue.trim()) newErrors.venue = "Venue is required"
    if (!formData.location.trim()) newErrors.location = "Location is required"
    if (Number(formData.price) < 0) newErrors.price = "Price must be positive"
    if (Number(formData.totalTickets) < 1) newErrors.totalTickets = "Must have at least 1 ticket"
    if (!formData.organizer.trim()) newErrors.organizer = "Organizer is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit({
        ...formData,
        ...(selectedFile && { imageFile: selectedFile })
      })
    }
  }

  const handleInputChange = (field: keyof EventFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB')
        return
      }

      setSelectedFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setSelectedFile(null)
    setImagePreview(null)
    setFormData(prev => ({ ...prev, imageUrl: "" }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            {mode === "create" ? "Create New Event" : "Edit Event"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter event name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter event description"
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.date ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Time *
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange("time", e.target.value)}
                  className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.time ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
              </div>
            </div>

            {/* Venue and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Venue *
                </label>
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) => handleInputChange("venue", e.target.value)}
                  className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.venue ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter venue name"
                />
                {errors.venue && <p className="text-red-500 text-sm mt-1">{errors.venue}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <select
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.location ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select location</option>
                  <option value="Douala">Douala</option>
                  <option value="Yaoundé">Yaoundé</option>
                </select>
                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
              </div>
            </div>

            {/* Price and Tickets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="inline h-4 w-4 mr-1" />
                  Price (XAF) *
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", parseFloat(e.target.value) || 0)}
                  className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.price ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="0"
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="inline h-4 w-4 mr-1" />
                  Total Tickets *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.totalTickets}
                  onChange={(e) => handleInputChange("totalTickets", parseInt(e.target.value) || 0)}
                  className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.totalTickets ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="0"
                />
                {errors.totalTickets && <p className="text-red-500 text-sm mt-1">{errors.totalTickets}</p>}
              </div>
            </div>

            {/* Organizer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organizer *
              </label>
              <input
                type="text"
                value={formData.organizer}
                onChange={(e) => handleInputChange("organizer", e.target.value)}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.organizer ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter organizer name"
              />
              {errors.organizer && <p className="text-red-500 text-sm mt-1">{errors.organizer}</p>}
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Image className="inline h-4 w-4 mr-1" />
                Event Image (optional)
              </label>

              {/* Image Preview */}
              {imagePreview && (
                <div className="mb-4 relative">
                  <img
                    src={imagePreview}
                    alt="Event preview"
                    className="w-full h-48 object-cover rounded-md border"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* File Input */}
              {!imagePreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-gray-400 transition-colors">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Upload an image
                      </span>
                      <span className="mt-1 block text-sm text-gray-500">
                        or drag and drop
                      </span>
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              ) : (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category (optional)
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Music, Sports, Conference"
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || uploadingImage}
              >
                {isLoading || uploadingImage
                  ? "Saving..."
                  : mode === "create" ? "Create Event" : "Update Event"
                }
              </Button>
            </div>
        </form>
      </div>
    </div>
  )
}
