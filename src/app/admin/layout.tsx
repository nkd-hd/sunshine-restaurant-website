"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import AdminLayout from "@/components/admin/admin-layout"

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return // Still loading

    if (!session) {
      router.push("/auth/signin?callbackUrl=/admin")
      return
    }

    if (session.user?.role !== "ADMIN") {
      router.push("/") // Redirect non-admin users
      return
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-leafy-green mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user?.role !== "ADMIN") {
    return null // Will redirect via useEffect
  }

  return <AdminLayout>{children}</AdminLayout>
}
