"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit2, Trash2, Search } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { mockServices, getVisibleServices, MockService } from "@/data/mockData"
import { useBranch } from "@/contexts/BranchContext"

export default function ServicesPage() {
  const router = useRouter()
  const { currentBranch } = useBranch();
  const [services, setServices] = useState<MockService[]>([])
  const [filteredServices, setFilteredServices] = useState<MockService[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchServices()
  }, [currentBranch]) // Add currentBranch as dependency

  useEffect(() => {
    const filtered = services.filter(
      (service) =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredServices(filtered)
  }, [searchTerm, services])

  const fetchServices = async () => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Use mock data with branch filtering
      let filteredServices = mockServices
      if (currentBranch?.id) {
        filteredServices = getVisibleServices({ selectedBranchId: currentBranch.id, mockServices })
      }
      
      setServices(filteredServices)
    } catch (error) {
      console.error("Error fetching services:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (serviceId: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      setServices(services.filter((s) => s.id !== serviceId))
    } catch (error) {
      console.error("Error deleting service:", error)
      alert("Failed to delete service")
    }
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Services Management</h1>
          <p className="text-secondary/60 mt-2">Manage available dental services and pricing</p>
        </div>
        <Button
          onClick={() => {
            router.push("/dashboard/services/add")
          }}
          className="bg-primary hover:bg-primary-dark text-white gap-2"
        >
          <Plus size={18} /> Add Service
        </Button>
      </div>

      {/* Search */}
      <Card className="mb-6 border-primary/10">
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Search size={20} className="text-secondary/40" />
            <Input
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </CardContent>
      </Card>

      {/* Services Table */}
      <Card className="border-primary/10">
        <CardHeader>
          <CardTitle>Services</CardTitle>
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
                    <TableHead>Service Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-secondary/60">
                        No services found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredServices.map((service) => (
                      <TableRow key={service.id} className="border-primary/5">
                        <TableCell className="font-medium">{service.name}</TableCell>
                        <TableCell className="text-secondary/70">{service.description || "-"}</TableCell>
                        <TableCell className="font-bold text-primary">${service.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge
                            className={service.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                          >
                            {service.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => {
                                router.push(`/dashboard/services/edit/${service.id}`)
                              }}
                              variant="ghost"
                              size="sm"
                              className="p-2 hover:bg-primary/10 rounded transition"
                            >
                              <Edit2 size={16} className="text-primary" />
                            </Button>
                            <button
                              onClick={() => handleDelete(service.id)}
                              className="p-2 hover:bg-red-50 rounded transition"
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


    </div>
  )
}