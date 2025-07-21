"use client"

import { useState, useMemo } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import type { Id } from "../../../../convex/_generated/dataModel"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Users,
  UserPlus,
  Search,
  Shield,
  UserCheck,
  Mail,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  Crown,
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

type UserRole = "USER" | "ADMIN"

interface User {
  _id: Id<"users">
  name?: string
  email: string
  emailVerified?: number
  image?: string
  role: UserRole
  _creationTime: number
}

// Mock users data - would be replaced with actual Convex queries
const getMockUsers = (): User[] => {
  return [
    {
      _id: "user1" as Id<"users">,
      name: "John Doe",
      email: "john@example.com",
      emailVerified: Date.now(),
      image: undefined,
      role: "USER",
      _creationTime: Date.now() - 86400000 * 30,
    },
    {
      _id: "user2" as Id<"users">,
      name: "Jane Smith",
      email: "jane@example.com",
      emailVerified: Date.now(),
      image: undefined,
      role: "USER",
      _creationTime: Date.now() - 86400000 * 15,
    },
    {
      _id: "admin1" as Id<"users">,
      name: "Admin User",
      email: "admin@sunshinerestaurant.cm",
      emailVerified: Date.now(),
      image: undefined,
      role: "ADMIN",
      _creationTime: Date.now() - 86400000 * 60,
    },
  ]
}

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL")
  
  // For now, we'll use mock users data since we need to create the Convex function
  // This would be replaced with: const users = useQuery(api.admin.getUsers)
  const users = getMockUsers()
  
  // Mock mutation - would be replaced with actual Convex mutation
  const updateUserRole = async (userId: Id<"users">, role: UserRole) => {
    // This would be: useMutation(api.admin.updateUserRole)
    toast.success(`User role updated to ${role}!`)
  }

  const filteredUsers = useMemo(() => {
    if (!users) return []
    
    let filtered = users
    
    // Filter by role
    if (roleFilter !== "ALL") {
      filtered = filtered.filter(user => user.role === roleFilter)
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      )
    }
    
    return filtered.sort((a, b) => b._creationTime - a._creationTime)
  }, [users, searchTerm, roleFilter])

  const userStats = useMemo(() => {
    if (!users) return { total: 0, admins: 0, users: 0, verified: 0 }
    
    return {
      total: users.length,
      admins: users.filter(u => u.role === "ADMIN").length,
      users: users.filter(u => u.role === "USER").length,
      verified: users.filter(u => u.emailVerified).length,
    }
  }, [users])

  const handleRoleChange = async (userId: Id<"users">, newRole: UserRole) => {
    try {
      await updateUserRole(userId, newRole)
    } catch (error) {
      toast.error("Failed to update user role")
    }
  }

  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), "MMM dd, yyyy")
  }

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }
    return email ? email[0].toUpperCase() : 'U'
  }

  if (users === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-leafy-green" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-leafy-green" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users</h1>
            <p className="text-gray-600">Manage user accounts and permissions</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrators</CardTitle>
            <Crown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{userStats.admins}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regular Users</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{userStats.users}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{userStats.verified}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as UserRole | "ALL")}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Users</SelectItem>
            <SelectItem value="ADMIN">Administrators</SelectItem>
            <SelectItem value="USER">Regular Users</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            {roleFilter === "ALL" ? "All users" : `${roleFilter.toLowerCase()} accounts`} 
            ({filteredUsers.length} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredUsers && filteredUsers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.image} alt={user.name} />
                          <AvatarFallback className="text-xs">
                            {getInitials(user.name, user.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {user.name || "No name set"}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: {user._id.slice(-8)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <span className="text-sm">{user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.role === "ADMIN" ? "default" : "secondary"}
                        className={user.role === "ADMIN" 
                          ? "bg-yellow-100 text-yellow-800 border-yellow-200" 
                          : "bg-blue-100 text-blue-800 border-blue-200"
                        }
                      >
                        {user.role === "ADMIN" && <Crown className="h-3 w-3 mr-1" />}
                        {user.role === "USER" && <UserCheck className="h-3 w-3 mr-1" />}
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${
                          user.emailVerified ? "bg-green-500" : "bg-gray-300"
                        }`} />
                        <span className="text-sm text-gray-600">
                          {user.emailVerified ? "Verified" : "Unverified"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(user._creationTime)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Select
                        value={user.role}
                        onValueChange={(value) => handleRoleChange(user._id, value as UserRole)}
                      >
                        <SelectTrigger className="w-24 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USER">USER</SelectItem>
                          <SelectItem value="ADMIN">ADMIN</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? "No users found" : "No users yet"}
              </h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? "Try adjusting your search or filters."
                  : "Users will appear here when they sign up."
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
