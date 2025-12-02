"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { mockTreatments, mockPatients, mockDoctors } from "@/data/mockData";
import { useBranch } from "@/contexts/BranchContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function EditTreatmentPage() {
  const router = useRouter();
  const { id } = useParams();
  const { currentBranch } = useBranch();
  const [formData, setFormData] = useState({
    patient_id: "",
    doctor_id: "",
    treatment_date: new Date().toISOString().split('T')[0],
    notes: "",
    status: "pending",
    total_cost: "",
  });
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data when component mounts
  useEffect(() => {
    // Load patients and doctors
    setPatients(mockPatients);
    setDoctors(mockDoctors);
    
    // Load treatment data if editing
    if (id) {
      const treatment = mockTreatments.find(t => t.id === id);
      if (treatment) {
        setFormData({
          patient_id: treatment.patient_id || "",
          doctor_id: treatment.doctor_id || "",
          treatment_date: treatment.treatment_date ? new Date(treatment.treatment_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          notes: treatment.notes || "",
          status: treatment.status || "pending",
          total_cost: treatment.total_cost?.toString() || "",
        });
      } else {
        toast.error("Treatment not found");
        router.push("/dashboard/treatments");
      }
    }
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.patient_id) {
      toast.error("Please select a patient");
      return;
    }
    
    if (!formData.doctor_id) {
      toast.error("Please select a doctor");
      return;
    }
    
    if (!formData.total_cost || isNaN(parseFloat(formData.total_cost))) {
      toast.error("Valid total cost is required");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      // Update treatment in mock data
      const treatmentIndex = mockTreatments.findIndex(t => t.id === id);
      if (treatmentIndex !== -1) {
        mockTreatments[treatmentIndex] = {
          ...mockTreatments[treatmentIndex],
          patient_id: formData.patient_id,
          doctor_id: formData.doctor_id,
          treatment_date: new Date(formData.treatment_date).toISOString(),
          notes: formData.notes,
          status: formData.status,
          total_cost: parseFloat(formData.total_cost),
          updated_at: new Date().toISOString()
        };
      }
      
      toast.success("Treatment updated successfully");
      router.push("/dashboard/treatments");
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={() => router.back()}>
          ← Back
        </Button>
        <h1 className="text-3xl font-bold text-secondary">Edit Treatment</h1>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="patient">Patient *</Label>
            <Select
              value={formData.patient_id}
              onValueChange={(value) => setFormData({ ...formData, patient_id: value })}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a patient" />
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
                <SelectValue placeholder="Select a doctor" />
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

          <div className="space-y-2">
            <Label htmlFor="treatmentDate">Treatment Date</Label>
            <Input
              id="treatmentDate"
              type="date"
              value={formData.treatment_date}
              onChange={(e) => setFormData({ ...formData, treatment_date: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalCost">Total Cost *</Label>
            <Input
              id="totalCost"
              type="number"
              step="0.01"
              value={formData.total_cost}
              onChange={(e) => setFormData({ ...formData, total_cost: e.target.value })}
              disabled={isLoading}
              required
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
            />
          </div>

          {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">{error}</div>}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary-dark" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}