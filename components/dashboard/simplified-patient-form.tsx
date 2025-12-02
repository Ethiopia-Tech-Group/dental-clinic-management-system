"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { mockPatients, genCardId } from "@/data/mockData"

interface SimplifiedPatientFormProps {
  onClose: () => void
  onSave: () => void
  branchId: string
}

export default function SimplifiedPatientForm({ onClose, onSave, branchId }: SimplifiedPatientFormProps) {
  const [formData, setFormData] = useState({
    full_name: "",
    sex: "other",
    age: "",
    address: "",
    date: new Date().toISOString().split('T')[0], // Default to today
    clinical_finding: "",
    phone: "",
  })
  const [cardId, setCardId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Generate a card ID when the component mounts
  useEffect(() => {
    const existingCardIds = new Set(mockPatients.map(p => p.card_id).filter(id => id) as string[])
    const newCardId = genCardId(existingCardIds)
    setCardId(newCardId)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.full_name.trim()) {
      toast.error("Name is required")
      return
    }
    
    if (!formData.age || isNaN(Number(formData.age))) {
      toast.error("Valid age is required")
      return
    }
    
    setIsLoading(true)
    setError(null)

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Create new patient object with simplified fields
      const newPatient = {
        id: `patient-${Date.now()}`,
        first_name: formData.full_name.split(' ')[0] || "",
        last_name: formData.full_name.split(' ').slice(1).join(' ') || "",
        full_name: formData.full_name,
        sex: formData.sex,
        age: parseInt(formData.age),
        address: formData.address,
        date_of_birth: "", // We don't collect this in simplified form
        phone: formData.phone,
        email: "", // Not collected in simplified form
        city: "", // Not collected in simplified form
        postal_code: "", // Not collected in simplified form
        emergency_contact_name: "", // Not collected in simplified form
        emergency_contact_phone: "", // Not collected in simplified form
        medical_history: "", // Not collected in simplified form
        dental_history: "", // Not collected in simplified form
        allergies: "", // Not collected in simplified form
        current_medications: "", // Not collected in simplified form
        is_active: true,
        branch_id: branchId,
        card_id: cardId,
        clinical_finding: formData.clinical_finding,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      // Add to mock data (in a real app, this would be saved to the database)
      mockPatients.push(newPatient as any)
      
      toast.success("Patient created successfully")
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
          <DialogTitle>Add New Patient</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              disabled={isLoading}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sex">Sex *</Label>
              <select
                id="sex"
                value={formData.sex}
                onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                disabled={isLoading}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Visit Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clinicalFinding">Clinical Finding (Note)</Label>
            <Textarea
              id="clinicalFinding"
              value={formData.clinical_finding}
              onChange={(e) => setFormData({ ...formData, clinical_finding: e.target.value })}
              disabled={isLoading}
              rows={3}
              placeholder="Enter clinical findings..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label>Card ID</Label>
            <div className="px-3 py-2 bg-gray-100 rounded-lg font-mono">
              {cardId}
            </div>
          </div>

          {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">{error}</div>}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary-dark" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Patient"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}