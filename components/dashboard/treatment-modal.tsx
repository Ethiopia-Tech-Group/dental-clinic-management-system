"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { mockPatients, mockDoctors, mockBranches, mockServices } from "@/data/mockData"

interface Treatment {
  id: string
  patient_id: string
  doctor_id: string
  branch_id: string
  status: string
  total_cost: number
  treatment_date: string
  notes: string
}

interface TreatmentModalProps {
  treatment: Treatment | null
  onClose: () => void
  onSave: () => void
}

export default function TreatmentModal({ treatment, onClose, onSave }: TreatmentModalProps) {
  const [formData, setFormData] = useState({
    patient_id: "",
    doctor_id: "",
    branch_id: "",
    status: "pending",
    notes: "",
    services: [] as string[],
  })
  const [patients, setPatients] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (treatment) {
      setFormData({
        patient_id: treatment.patient_id || "",
        doctor_id: treatment.doctor_id || "",
        branch_id: treatment.branch_id || "",
        status: treatment.status || "pending",
        notes: treatment.notes || "",
        services: [],
      })
    }
  }, [treatment])

  const fetchData = async () => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Use mock data
      setPatients(mockPatients)
      setDoctors(mockDoctors)
      setBranches(mockBranches)
      setServices(mockServices)
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // In a real app, this would save to the database
      // For now, we'll just show a success message
      toast.success(treatment ? "Treatment updated successfully" : "Treatment created successfully")
      onSave()
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred"
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleService = (serviceId: string) => {
    setFormData(prev => {
      const services = [...prev.services]
      const index = services.indexOf(serviceId)
      if (index >= 0) {
        services.splice(index, 1)
      } else {
        services.push(serviceId)
      }
      return { ...prev, services }
    })
  }

  const selectedServices = services.filter(s => formData.services.includes(s.id))
  const totalCost = selectedServices.reduce((sum, s) => sum + s.price, 0)

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{treatment ? "Edit Treatment" : "Add New Treatment"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patient">Patient *</Label>
              <Select
                value={formData.patient_id}
                onValueChange={(value) => setFormData({ ...formData, patient_id: value })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.first_name} {patient.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="doctor">Doctor *</Label>
              <Select
                value={formData.doctor_id}
                onValueChange={(value) => setFormData({ ...formData, doctor_id: value })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      Dr. {doctor.first_name} {doctor.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="branch">Branch *</Label>
              <Select
                value={formData.branch_id}
                onValueChange={(value) => setFormData({ ...formData, branch_id: value })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Services</Label>
            <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
              {services.length === 0 ? (
                <p className="text-secondary/60 text-center py-4">No services available</p>
              ) : (
                <div className="space-y-2">
                  {services.map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-2 hover:bg-secondary/5 rounded">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`service-${service.id}`}
                          checked={formData.services.includes(service.id)}
                          onChange={() => toggleService(service.id)}
                          disabled={isLoading}
                          className="mr-3 rounded border-primary"
                        />
                        <Label htmlFor={`service-${service.id}`} className="cursor-pointer">
                          {service.name}
                        </Label>
                      </div>
                      <span className="font-medium">${service.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {selectedServices.length > 0 && (
              <div className="text-right font-bold text-lg">
                Total: ${totalCost.toFixed(2)}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              disabled={isLoading}
              rows={3}
              placeholder="Add any additional notes about this treatment..."
            />
          </div>

          {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">{error}</div>}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary-dark" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Treatment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}