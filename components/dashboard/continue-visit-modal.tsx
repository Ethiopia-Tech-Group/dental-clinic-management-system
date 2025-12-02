"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { mockDoctors, mockEmployees, mockVisits, mockTreatments } from "@/data/mockData"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ContinueVisitModalProps {
  patientId: string
  patientName: string
  lastVisit: any
  onClose: () => void
  onSave: () => void
}

// Helper function to get doctor name
const getDoctorName = (doctorId: string) => {
  // Find the doctor
  const doctor = mockDoctors.find(d => d.id === doctorId)
  if (!doctor) return "Unknown Doctor"
  
  // Find the employee/user associated with this doctor
  const employee = mockEmployees.find(e => e.id === doctor.user_id.replace('user-', 'emp-'))
  if (employee) {
    return `${employee.first_name} ${employee.last_name}`
  }
  
  // Fallback names based on doctor ID
  if (doctorId === "doctor-1") return "John Smith"
  if (doctorId === "doctor-2") return "Emily Johnson"
  if (doctorId === "doctor-3") return "Robert Williams"
  
  return "Doctor"
}

export default function ContinueVisitModal({ patientId, patientName, lastVisit, onClose, onSave }: ContinueVisitModalProps) {
  const [formData, setFormData] = useState({
    doctor_id: lastVisit?.doctor_id || "",
    notes: lastVisit?.notes || "",
    visit_date: new Date().toISOString().split('T')[0], // Default to today
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Pre-fill form with last visit data when component mounts
  useEffect(() => {
    if (lastVisit) {
      setFormData({
        doctor_id: lastVisit.doctor_id || "",
        notes: lastVisit.notes || "",
        visit_date: new Date().toISOString().split('T')[0],
      })
    }
  }, [lastVisit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.doctor_id) {
      toast.error("Please select a doctor")
      return
    }
    
    setIsLoading(true)
    setError(null)

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Create new visit object
      const newVisit = {
        id: `visit-${Date.now()}`,
        patient_id: patientId,
        doctor_id: formData.doctor_id,
        branch_id: lastVisit?.branch_id || "",
        visit_date: new Date(formData.visit_date).toISOString(),
        notes: formData.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      // Add to mock data (in a real app, this would be saved to the database)
      mockVisits.push(newVisit as any)
      
      // Also create a treatment record
      const newTreatment = {
        id: `treatment-${Date.now()}`,
        patient_id: patientId,
        doctor_id: formData.doctor_id,
        branch_id: lastVisit?.branch_id || "",
        status: "pending",
        treatment_date: new Date(formData.visit_date).toISOString(),
        notes: formData.notes,
        total_cost: 0, // Would be calculated based on services
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      // Add to mock data
      mockTreatments.push(newTreatment as any)
      
      toast.success("New visit created successfully")
      onSave()
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred"
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Continue Last Visit - {patientName}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="doctor">Doctor *</Label>
            <Select
              value={formData.doctor_id}
              onValueChange={(value) => setFormData({ ...formData, doctor_id: value })}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a doctor" />
              </SelectTrigger>
              <SelectContent>
                {mockDoctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    Dr. {getDoctorName(doctor.id)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="visitDate">Visit Date</Label>
            <Input
              id="visitDate"
              type="date"
              value={formData.visit_date}
              onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              disabled={isLoading}
              rows={4}
              placeholder="Enter visit notes..."
            />
          </div>

          {lastVisit && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
              <p className="font-medium mb-1">Last Visit Information:</p>
              <p className="text-secondary/80">
                <span className="font-medium">Date:</span> {new Date(lastVisit.visit_date).toLocaleDateString()}
              </p>
              <p className="text-secondary/80">
                <span className="font-medium">Doctor:</span> Dr. {getDoctorName(lastVisit.doctor_id)}
              </p>
              <p className="text-secondary/80">
                <span className="font-medium">Notes:</span> {lastVisit.notes}
              </p>
            </div>
          )}

          {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">{error}</div>}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary-dark" disabled={isLoading}>
              {isLoading ? "Saving..." : "Record Visit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}