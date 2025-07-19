"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import {
  Users,
  Search,
  Shield,
  User,
  Mail,
  Calendar,
} from "lucide-react"
import AdminLayout from "~/components/admin/admin-layout"
import { Button } from "~/components/ui/button"
import { api } from "~/trpc/react"

export default function AdminUsersPage() {
  const { data: session } = useSession()
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)

  const { data: usersData, isLoading, refetch } = api.admin.getUsers.useQuery({
    page,
    limit: 10,
    search: searchTerm,
  })

  const updateRoleMutation = api.admin.updateUserRole.useMutation({
    onSuccess: () => {
      refetch()
    },
    onError: (error) => {
      alert(error.message)
    },
  })

  const handleRoleChange = async (userId: string, newRole: "USER" | "ADMIN", userName: string) => {
    if (userId === session?.user?.id) {
      alert("You cannot change your own role")
      return
    }

    const action = newRole === "ADMIN" ? "promote" : "demote"
    if (confirm(`Are you sure you want to ${action} "${userName}" to ${newRole}?`)) {
      updateRoleMutation.mutate({ userId, role: newRole })
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
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
            <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
            <p className="text-gray-600">Manage user accounts and permissions</p>
          </div>
          <div className="text-sm text-gray-500">
            Total Users: {usersData?.totalCount || 0}
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {!usersData?.users.length ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600">No users match your search criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
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
                  {usersData.users.map((user: any) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {user.image ? (
                              <img
                                className="h-10 w-10 rounded-full"
                                src={user.image}
                                alt={user.name || "User"}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <User className="h-5 w-5 text-gray-600" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name || "No name"}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {user.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === "ADMIN"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.role === "ADMIN" ? (
                            <Shield className="h-3 w-3 mr-1" />
                          ) : (
                            <User className="h-3 w-3 mr-1" />
                          )}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {user.emailVerified ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Calendar className="h-3 w-3 mr-1" />
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Unverified
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        {user.id !== session?.user?.id && (
                          <div className="flex space-x-2">
                            {user.role === "USER" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRoleChange(user.id, "ADMIN", user.name || user.email)}
                                disabled={updateRoleMutation.isPending}
                              >
                                <Shield className="h-3 w-3 mr-1" />
                                Make Admin
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRoleChange(user.id, "USER", user.name || user.email)}
                                disabled={updateRoleMutation.isPending}
                              >
                                <User className="h-3 w-3 mr-1" />
                                Remove Admin
                              </Button>
                            )}
                          </div>
                        )}
                        {user.id === session?.user?.id && (
                          <span className="text-gray-400 text-xs">Current User</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {usersData && usersData.totalPages > 1 && (
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
                onClick={() => setPage(Math.min(usersData.totalPages, page + 1))}
                disabled={page === usersData.totalPages}
                className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{page}</span> of{" "}
                  <span className="font-medium">{usersData.totalPages}</span>
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
                  onClick={() => setPage(Math.min(usersData.totalPages, page + 1))}
                  disabled={page === usersData.totalPages}
                  className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
