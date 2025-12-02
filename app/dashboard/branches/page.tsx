"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit2, Trash2, MapPin, Phone } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { mockBranches } from "@/data/mockData"

interface Branch {
  id: string
  name: string
  address: string
  phone: string
  email: string
  opening_time: string
  closing_time: string
  is_active: boolean
}

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  // Removed modal state since we're using dedicated pages

  useEffect(() => {
    fetchBranches()
  }, [])

  const fetchBranches = async () => {
    try {
      setIsLoading(true)
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Use mock data
      setBranches(mockBranches)
    } catch (error) {
      console.error("Error fetching branches:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (branchId: string) => {
    if (!confirm("Are you sure you want to delete this branch?")) return

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Update local state
      setBranches(branches.filter((b) => b.id !== branchId))
    } catch (error) {
      console.error("Error deleting branch:", error)
      alert("Failed to delete branch")
    }
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Branch Management</h1>
          <p className="text-secondary/60 mt-2">Manage clinic branches and locations</p>
        </div>
        <Link href="/dashboard/branches/add">
          <Button className="bg-primary hover:bg-primary-dark text-white gap-2">
            <Plus size={18} /> Add Branch
          </Button>
        </Link>
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 rounded-lg" />)
        ) : branches.length === 0 ? (
          <Card className="col-span-full border-primary/10">
            <CardContent className="flex justify-center items-center py-12">
              <p className="text-secondary/60">No branches found. Create your first branch to get started.</p>
            </CardContent>
          </Card>
        ) : (
          branches.map((branch) => (
            <Card key={branch.id} className="border-primary/10 hover:border-primary/30 transition">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{branch.name}</CardTitle>
                    <Badge
                      className={
                        branch.is_active ? "bg-green-100 text-green-800 mt-2" : "bg-gray-100 text-gray-800 mt-2"
                      }
                    >
                      {branch.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/branches/edit/${branch.id}`}
                      className="p-2 hover:bg-primary/10 rounded transition"
                    >
                      <Edit2 size={16} className="text-primary" />
                    </Link>
                    <button onClick={() => handleDelete(branch.id)} className="p-2 hover:bg-red-50 rounded transition">
                      <Trash2 size={16} className="text-red-500" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {branch.address && (
                  <div className="flex gap-2 items-start">
                    <MapPin size={16} className="text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-secondary/60">Address</p>
                      <p className="text-sm font-medium">{branch.address}</p>
                    </div>
                  </div>
                )}
                {branch.phone && (
                  <div className="flex gap-2 items-start">
                    <Phone size={16} className="text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-secondary/60">Phone</p>
                      <p className="text-sm font-medium">{branch.phone}</p>
                    </div>
                  </div>
                )}
                {branch.email && (
                  <div>
                    <p className="text-xs text-secondary/60">Email</p>
                    <p className="text-sm font-medium">{branch.email}</p>
                  </div>
                )}
                {branch.opening_time && branch.closing_time && (
                  <div>
                    <p className="text-xs text-secondary/60">Hours</p>
                    <p className="text-sm font-medium">
                      {branch.opening_time} - {branch.closing_time}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Removed Branch Modal since we're using dedicated pages */}
    </div>
  )
}