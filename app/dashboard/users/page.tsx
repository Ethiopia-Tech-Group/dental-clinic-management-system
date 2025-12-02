"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit2, Trash2, Search } from "lucide-react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { mockEmployees } from "@/data/mockData"

interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  role: string
  is_active: boolean
}

const roleColors: Record<string, string> = {
  super_admin: "bg-red-100 text-red-800",
  admin: "bg-purple-100 text-purple-800",
  doctor: "bg-blue-100 text-blue-800",
  receptionist: "bg-green-100 text-green-800",
  accountant: "bg-yellow-100 text-yellow-800",
  branch_manager: "bg-indigo-100 text-indigo-800",
  xray_technician: "bg-orange-100 text-orange-800",
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredUsers(filtered)
  }, [searchTerm, users])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Use mock data
      const mockUsers = mockEmployees.map(emp => ({
        id: emp.id,
        first_name: emp.first_name,
        last_name: emp.last_name,
        email: emp.email,
        role: emp.role,
        is_active: emp.is_active
      }))
      
      setUsers(mockUsers)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Update local state
      setUsers(users.filter((u) => u.id !== userId))
    } catch (error) {
      console.error("Error deleting user:", error)
      alert("Failed to delete user")
    }
  }

  const handleEdit = (user: User) => {
    // Navigation to edit page will be handled by the Link component
  }

  const handleAddNew = () => {
    // Navigation to add page will be handled by the Link component
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Users Management</h1>
          <p className="text-secondary/60 mt-2">Manage system users and their roles</p>
        </div>
        <Link href="/dashboard/users/add">
          <Button className="bg-primary hover:bg-primary-dark text-white gap-2">
            <Plus size={18} /> Add User
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card className="mb-6 border-primary/10">
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Search size={20} className="text-secondary/40" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-primary/10">
        <CardHeader>
          <CardTitle>System Users</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-secondary/60">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id} className="border-primary/5">
                        <TableCell className="font-medium">
                          {user.first_name} {user.last_name}
                        </TableCell>
                        <TableCell className="text-secondary/70">{user.email}</TableCell>
                        <TableCell>
                          <Badge className={roleColors[user.role] || "bg-gray-100 text-gray-800"}>
                            {user.role.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={user.is_active ? "default" : "secondary"}
                            className={user.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                          >
                            {user.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Link
                              href={`/dashboard/users/edit/${user.id}`}
                              className="p-2 hover:bg-primary/10 rounded transition"
                              title="Edit"
                            >
                              <Edit2 size={16} className="text-primary" />
                            </Link>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="p-2 hover:bg-red-50 rounded transition"
                              title="Delete"
                            >
                              <Trash2 size={16} className="text-red-500" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Removed User Modal since we're using dedicated pages */}
    </div>
  )
}