"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { 
  mockTreatments, 
  mockPatients, 
  mockDoctors, 
  mockXRayFiles, 
  mockTreatmentServices, 
  mockServices,
  mockInvoices,
  mockXRayRequests,
  MockTreatmentService
} from "@/data/mockData";
import { useBranch } from "@/contexts/BranchContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Save, X } from "lucide-react";

interface Treatment {
  id: string;
  patient_id: string;
  doctor_id: string;
  branch_id: string;
  status: string;
  treatment_date: string;
  notes: string;
  total_cost: number;
  created_at: string;
  updated_at: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  is_active: boolean;
  branch_id: string;
  created_at: string;
  updated_at: string;
}

interface TreatmentService {
  id: string;
  treatment_id: string;
  service_id: string;
  quantity: number;
  price_at_time: number;
  created_at: string;
}
export interface MockXRayRequest {
  id: string
  patient_id: string
  treatment_id: string
  doctor_id: string
  branch_id: string
  status: 'requested' | 'completed'
  requested_at: string
  completed_at?: string
  notes?: string
  created_at: string
  updated_at: string
}
interface XRayFile {
  id: string;
  patient_id: string;
  uploaded_by: string;
  file_type: string;
  file_url: string;
  file_size: number;
  description: string;
  treatment_id: string;
  is_active: boolean;
  branch_id: string;
  created_at: string;
  updated_at: string;
}

export default function TreatmentDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const { currentBranch } = useBranch();
  const [treatment, setTreatment] = useState<Treatment | null>(null);
  const [patient, setPatient] = useState<any>(null);
  const [doctor, setDoctor] = useState<any>(null);
  const [xrayFiles, setXrayFiles] = useState<XRayFile[]>([]);
  const [treatmentServices, setTreatmentServices] = useState<TreatmentService[]>([]);
  const [invoice, setInvoice] = useState<any>(null);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [doctorNotes, setDoctorNotes] = useState("");
  const [newService, setNewService] = useState({ service_id: "", quantity: 1 });
  const [paymentForm, setPaymentForm] = useState({ amount: "", method: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("basic");

  // Get user role and ID from localStorage
  useEffect(() => {
    const sessionStr = localStorage.getItem("userSession");
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        setUserRole(session.user.role);
        setUserId(session.user.id);
      } catch (error) {
        console.error("Error parsing session:", error);
      }
    }
  }, []);

  // Load treatment data
  useEffect(() => {
    if (id) {
      const foundTreatment = mockTreatments.find(t => t.id === id);
      if (foundTreatment) {
        setTreatment(foundTreatment);
        setDoctorNotes(foundTreatment.notes || "");
        
        // Load patient data
        const foundPatient = mockPatients.find(p => p.id === foundTreatment.patient_id);
        if (foundPatient) {
          setPatient(foundPatient);
        }
        
        // Load doctor data
        const foundDoctor = mockDoctors.find(d => d.id === foundTreatment.doctor_id);
        if (foundDoctor) {
          setDoctor(foundDoctor);
        }
        
        // Load X-ray files for this treatment
        const treatmentXRays = mockXRayFiles.filter(x => x.treatment_id === id);
        setXrayFiles(treatmentXRays);
        
        // Load services for this treatment
        const treatmentServicesData = mockTreatmentServices.filter(ts => ts.treatment_id === id);
        setTreatmentServices(treatmentServicesData);
        
        // Load available services for this branch
        const branchServices = mockServices.filter(s => s.branch_id === foundTreatment.branch_id);
        setAvailableServices(branchServices);
        
        // Load invoice for this treatment
        const treatmentInvoice = mockInvoices.find(inv => inv.treatment_id === id);
        setInvoice(treatmentInvoice);
      } else {
        toast.error("Treatment not found");
        router.push("/dashboard/treatments");
      }
    }
  }, [id, router]);

  // Check if doctor has permission to edit this treatment
  const canEditTreatment = () => {
    if (!userRole || !userId || !treatment) return false;
    
    // Cannot edit if treatment is completed
    if (treatment.status === "completed") {
      return false;
    }
    
    // Receptionist and admin can always edit (except when completed)
    if (userRole === "receptionist" || userRole === "admin" || userRole === "super_admin") {
      return true;
    }
    
    // Doctor can only edit treatments assigned to them (except when completed)
    if (userRole === "doctor") {
      return treatment.doctor_id === `doctor-${userId.split('-')[1] || '1'}`;
    }
    
    return false;
  };

  // Helper function to generate a new invoice number
  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `INV-${year}-${month}${day}-${randomNum}`;
  };

  // Helper function to calculate invoice totals
  const calculateInvoiceTotals = (services: TreatmentService[]) => {
    const subtotal = services.reduce((sum, ts) => {
      const service = mockServices.find(s => s.id === ts.service_id);
      if (service) {
        return sum + (ts.quantity * ts.price_at_time);
      }
      return sum;
    }, 0);
    
    const taxRate = 0.10; // 10% tax rate
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    
    return { subtotal, tax, total };
  };

  // Helper function to create an invoice for a completed treatment
  const createInvoiceForTreatment = async (treatmentId: string, services: TreatmentService[]) => {
    try {
      // Calculate totals
      const { subtotal, tax, total } = calculateInvoiceTotals(services);
      
      // Find treatment
      const treatment = mockTreatments.find(t => t.id === treatmentId);
      if (!treatment) return;
      
      // Check if invoice already exists for this treatment
      const existingInvoice = mockInvoices.find(inv => inv.treatment_id === treatmentId);
      if (existingInvoice) return existingInvoice;
      
      // Create new invoice
      const newInvoice = {
        id: `invoice-${Date.now()}`,
        invoice_number: generateInvoiceNumber(),
        patient_id: treatment.patient_id,
        doctor_id: treatment.doctor_id,
        branch_id: treatment.branch_id,
        treatment_id: treatment.id,
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        discount: 0,
        total_amount: parseFloat(total.toFixed(2)),
        amount_paid: 0,
        balance_remaining: parseFloat(total.toFixed(2)),
        status: "unpaid",
        invoice_date: new Date().toISOString(),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Add to mock data
      mockInvoices.push(newInvoice);
      
      return newInvoice;
    } catch (error) {
      console.error("Error creating invoice:", error);
      return null;
    }
  };

  // Helper function to record a payment
  const recordPayment = async (invoiceId: string, amount: number, method: string) => {
    try {
      // Find invoice
      const invoiceIndex = mockInvoices.findIndex(inv => inv.id === invoiceId);
      if (invoiceIndex === -1) {
        throw new Error("Invoice not found");
      }
      
      // Update invoice with payment
      const updatedInvoice = {
        ...mockInvoices[invoiceIndex],
        amount_paid: parseFloat((mockInvoices[invoiceIndex].amount_paid + amount).toFixed(2)),
        balance_remaining: parseFloat((mockInvoices[invoiceIndex].total_amount - mockInvoices[invoiceIndex].amount_paid - amount).toFixed(2)),
        updated_at: new Date().toISOString()
      };
      
      // Update status based on balance
      if (updatedInvoice.balance_remaining <= 0) {
        updatedInvoice.status = "paid";
      } else if (updatedInvoice.amount_paid > 0) {
        updatedInvoice.status = "partial";
      } else {
        updatedInvoice.status = "unpaid";
      }
      
      // Update in mock data
      mockInvoices[invoiceIndex] = updatedInvoice;
      
      // Update local state
      setInvoice(updatedInvoice);
      
      // Reset payment form
      setPaymentForm({ amount: "", method: "" });
      
      return updatedInvoice;
    } catch (error) {
      console.error("Error recording payment:", error);
      throw error;
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!canEditTreatment()) {
      toast.error("You don't have permission to update this treatment");
      return;
    }
    
    if (!treatment) return;
    
    setIsLoading(true);
    
    try {
      // Update treatment status in mock data
      const treatmentIndex = mockTreatments.findIndex(t => t.id === treatment.id);
      if (treatmentIndex !== -1) {
        const updatedTreatment = {
          ...mockTreatments[treatmentIndex],
          status: newStatus,
          updated_at: new Date().toISOString()
        };
        
        mockTreatments[treatmentIndex] = updatedTreatment;
        
        // Update local state
        setTreatment({
          ...treatment,
          status: newStatus,
          updated_at: new Date().toISOString()
        });
        
        // Reload invoice after status update
        const updatedInvoice = mockInvoices.find(inv => inv.treatment_id === treatment.id);
        setInvoice(updatedInvoice);
        
        // If treatment is completed, automatically generate an invoice
        if (newStatus === "completed") {
          const invoice = await createInvoiceForTreatment(treatment.id, treatmentServices);
          if (invoice) {
            toast.success("Treatment status updated and invoice generated successfully");
          } else {
            toast.success("Treatment status updated successfully");
          }
        } else {
          toast.success("Treatment status updated successfully");
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecordPayment = async (invoiceId: string, amount: number, method: string) => {
    if (!invoiceId || amount <= 0 || !method) {
      toast.error("Please fill in all payment details");
      return;
    }
    
    if (amount > (invoice?.balance_remaining || 0)) {
      toast.error("Payment amount exceeds balance");
      return;
    }
    
    setIsLoading(true);
    
    try {
      await recordPayment(invoiceId, amount, method);
      toast.success("Payment recorded successfully");
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestXray = async () => {
    if (!canEditTreatment()) {
      toast.error("You don't have permission to request X-rays for this treatment");
      return;
    }
  
    if (!treatment || !userId) return;
  
    setIsLoading(true);
  
    try {
      const newXRayRequest: MockXRayRequest = {
        id: `xray-request-${Date.now()}`,
        patient_id: treatment.patient_id,
        treatment_id: treatment.id,
        doctor_id: treatment.doctor_id,
        branch_id: treatment.branch_id,
        status: "requested",
        requested_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
  
      mockXRayRequests.push(newXRayRequest);
  
      toast.success("X-ray request sent to technician successfully");
  
      console.log(`X-ray requested for treatment ${treatment.id} by doctor ${userId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleSaveDoctorNotes = async () => {
    if (!canEditTreatment()) {
      toast.error("You don't have permission to update this treatment");
      return;
    }
    
    if (!treatment) return;
    
    setIsLoading(true);
    
    try {
      // Update treatment notes in mock data
      const treatmentIndex = mockTreatments.findIndex(t => t.id === treatment.id);
      if (treatmentIndex !== -1) {
        mockTreatments[treatmentIndex] = {
          ...mockTreatments[treatmentIndex],
          notes: doctorNotes,
          updated_at: new Date().toISOString()
        };
        
        // Update local state
        setTreatment({
          ...treatment,
          notes: doctorNotes,
          updated_at: new Date().toISOString()
        });
        
        toast.success("Doctor notes saved successfully");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddService = async () => {
    if (!canEditTreatment()) {
      toast.error("You don't have permission to add services to this treatment");
      return;
    }
    
    if (!treatment || !newService.service_id) {
      toast.error("Please select a service");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Find the selected service
      const service = mockServices.find(s => s.id === newService.service_id);
      if (!service) {
        toast.error("Service not found");
        return;
      }
      
      // Create new treatment service entry
      const newTreatmentService: any = {
        id: `ts-${Date.now()}`,
        treatment_id: treatment.id,
        service_id: newService.service_id,
        quantity: newService.quantity,
        price_at_time: service.price,
        created_at: new Date().toISOString()
      };
      
      // Add to mock data
      mockTreatmentServices.push(newTreatmentService);
      
      // Update local state
      setTreatmentServices([...treatmentServices, newTreatmentService]);
      setNewService({ service_id: "", quantity: 1 });
      
      toast.success("Service added successfully");
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveService = async (treatmentServiceId: string) => {
    if (!canEditTreatment()) {
      toast.error("You don't have permission to remove services from this treatment");
      return;
    }
    
    if (!confirm("Are you sure you want to remove this service?")) return;
    
    setIsLoading(true);
    
    try {
      // Remove from mock data
      const index = mockTreatmentServices.findIndex(ts => ts.id === treatmentServiceId);
      if (index !== -1) {
        mockTreatmentServices.splice(index, 1);
      }
      
      // Update local state
      setTreatmentServices(treatmentServices.filter(ts => ts.id !== treatmentServiceId));
      
      toast.success("Service removed successfully");
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!treatment) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => router.back()}>
            ← Back
          </Button>
          <h1 className="text-3xl font-bold text-secondary">Treatment Details</h1>
        </div>
        <div className="max-w-2xl">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-secondary/60">Loading treatment details...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    in_progress: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={() => router.back()}>
          ← Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-secondary">Treatment Details</h1>
          <p className="text-secondary/60">Treatment ID: {treatment.id}</p>
        </div>
      </div>

      <div className="max-w-6xl">
        {/* Treatment Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-secondary">
                  {patient?.first_name} {patient?.last_name}
                </h2>
                <p className="text-secondary/70">
                  Dr. {doctor?.first_name} {doctor?.last_name}
                </p>
                <p className="text-sm text-secondary/60">
                  {new Date(treatment.treatment_date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={statusColors[treatment.status] || "bg-gray-100"}>
                  {treatment.status.replace("_", " ")}
                </Badge>
                {canEditTreatment() && (
                  <Select
                    value={treatment.status}
                    onValueChange={handleUpdateStatus}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="notes">Doctor Notes</TabsTrigger>
            <TabsTrigger value="xray">X-Ray Images</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="invoice">Invoice</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Patient</Label>
                    <p className="font-medium">{patient?.first_name} {patient?.last_name}</p>
                  </div>
                  <div>
                    <Label>Doctor</Label>
                    <p className="font-medium">Dr. {doctor?.first_name} {doctor?.last_name}</p>
                  </div>
                  <div>
                    <Label>Treatment Date</Label>
                    <p className="font-medium">{new Date(treatment.treatment_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label>Total Cost</Label>
                    <p className="font-medium">${treatment.total_cost.toFixed(2)}</p>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Status</Label>
                    <Badge className={statusColors[treatment.status] || "bg-gray-100"}>
                      {treatment.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Doctor Notes Tab */}
          <TabsContent value="notes">
            <Card>
              <CardHeader>
                <CardTitle>Doctor Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="doctorNotes">Notes</Label>
                  {canEditTreatment() ? (
                    <>
                      <Textarea
                        id="doctorNotes"
                        value={doctorNotes}
                        onChange={(e) => setDoctorNotes(e.target.value)}
                        rows={6}
                        placeholder="Enter treatment notes..."
                        disabled={isLoading}
                      />
                      <div className="flex justify-end">
                        <Button 
                          onClick={handleSaveDoctorNotes}
                          disabled={isLoading}
                          className="bg-primary hover:bg-primary-dark"
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Save Notes
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 bg-secondary/5 rounded-lg">
                      <p className="text-secondary/80 whitespace-pre-wrap">
                        {treatment.notes || "No notes available"}
                      </p>
                      {treatment.status === "completed" && (
                        <p className="text-sm text-secondary/60 mt-2">
                          This treatment is completed and cannot be edited.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* X-Ray Images Tab */}
          <TabsContent value="xray">
            <Card>
              <CardHeader>
                <CardTitle>X-Ray Images</CardTitle>
              </CardHeader>
              <CardContent>
                {userRole === "doctor" && treatment.status !== "completed" && (
                  <div className="mb-6">
                    <Button 
                      onClick={handleRequestXray}
                      className="bg-primary hover:bg-primary-dark"
                      disabled={isLoading}
                    >
                      Request X-Ray
                    </Button>
                  </div>
                )}
                
                {xrayFiles.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {xrayFiles.map((xray) => (
                      <div key={xray.id} className="border rounded-lg overflow-hidden">
                        <div className="aspect-square bg-gray-100 flex items-center justify-center">
                          <img 
                            src={xray.file_url} 
                            alt={xray.description || "X-ray image"}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-medium truncate">{xray.description || "X-ray Image"}</p>
                          <p className="text-xs text-secondary/60 mt-1">
                            {new Date(xray.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-secondary/60">No X-ray images available for this treatment</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle>Services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add Service Form (only for authorized users) */}
                {canEditTreatment() ? (
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-3">Add New Service</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label>Service</Label>
                        <Select
                          value={newService.service_id}
                          onValueChange={(value) => setNewService({...newService, service_id: value})}
                          disabled={isLoading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select service" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableServices.map((service) => (
                              <SelectItem key={service.id} value={service.id}>
                                {service.name} (${service.price.toFixed(2)})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={newService.quantity}
                          onChange={(e) => setNewService({...newService, quantity: parseInt(e.target.value) || 1})}
                          disabled={isLoading}
                        />
                      </div>
                      <div className="flex items-end">
                        <Button 
                          onClick={handleAddService}
                          disabled={isLoading || !newService.service_id}
                          className="w-full"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Service
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : treatment.status === "completed" ? (
                  <div className="border rounded-lg p-4 text-center text-secondary/60">
                    This treatment is completed and services cannot be modified.
                  </div>
                ) : null}

                {/* Services List */}
                <div className="space-y-3">
                  {treatmentServices.length > 0 ? (
                    treatmentServices.map((ts) => {
                      const service = mockServices.find(s => s.id === ts.service_id);
                      if (!service) return null;
                      
                      const total = ts.quantity * ts.price_at_time;
                      
                      return (
                        <div key={ts.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{service.name}</h4>
                            <p className="text-sm text-secondary/70">{service.description}</p>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-sm">
                                Qty: {ts.quantity}
                              </span>
                              <span className="text-sm">
                                Price: ${ts.price_at_time.toFixed(2)}
                              </span>
                              <span className="font-medium">
                                Total: ${total.toFixed(2)}
                              </span>
                            </div>
                          </div>
                          {canEditTreatment() && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveService(ts.id)}
                              disabled={isLoading}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-secondary/60">No services added to this treatment</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoice Tab */}
          <TabsContent value="invoice">
            <Card>
              <CardHeader>
                <CardTitle>Invoice</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {invoice ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label>Invoice Number</Label>
                        <p className="font-medium">{invoice.invoice_number}</p>
                      </div>
                      <div>
                        <Label>Invoice Date</Label>
                        <p className="font-medium">{new Date(invoice.invoice_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <Label>Due Date</Label>
                        <p className="font-medium">{new Date(invoice.due_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <Label>Status</Label>
                        <Badge className={statusColors[invoice.status] || "bg-gray-100"}>
                          {invoice.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Services List */}
                    <div>
                      <h3 className="font-medium mb-3">Services</h3>
                      <div className="space-y-3">
                        {treatmentServices.map((ts) => {
                          const service = mockServices.find(s => s.id === ts.service_id);
                          if (!service) return null;
                          
                          const total = ts.quantity * ts.price_at_time;
                          
                          return (
                            <div key={ts.id} className="flex justify-between items-center p-3 border rounded-lg">
                              <div>
                                <h4 className="font-medium">{service.name}</h4>
                                <p className="text-sm text-secondary/70">Qty: {ts.quantity} × ${ts.price_at_time.toFixed(2)}</p>
                              </div>
                              <span className="font-medium">${total.toFixed(2)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Invoice Totals */}
                    <div className="space-y-2 max-w-xs ml-auto">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${invoice.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax (10%):</span>
                        <span>${invoice.tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Discount:</span>
                        <span>${invoice.discount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total:</span>
                        <span>${invoice.total_amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <span>Paid:</span>
                        <span>${invoice.amount_paid.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Balance:</span>
                        <span>${invoice.balance_remaining.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Payment Section for Receptionist/Admin */}
                    {(userRole === "receptionist" || userRole === "admin" || userRole === "super_admin") && (
                      <div className="border-t pt-6">
                        <h3 className="font-medium mb-3">Record Payment</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <Label>Amount ($)</Label>
                            <Input 
                              type="number" 
                              step="0.01" 
                              min="0" 
                              max={invoice.balance_remaining}
                              value={paymentForm.amount}
                              onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <Label>Payment Method</Label>
                            <Select value={paymentForm.method} onValueChange={(value) => setPaymentForm({...paymentForm, method: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select method" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="card">Credit Card</SelectItem>
                                <SelectItem value="check">Check</SelectItem>
                                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-end">
                            <Button 
                              className="w-full bg-primary hover:bg-primary-dark"
                              onClick={() => handleRecordPayment(invoice.id, parseFloat(paymentForm.amount) || 0, paymentForm.method)}
                              disabled={!paymentForm.amount || !paymentForm.method || isLoading}
                            >
                              Record Payment
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : treatment?.status === "completed" ? (
                  <div className="text-center py-8">
                    <p className="text-secondary/60">Invoice will be generated automatically when treatment is completed.</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-secondary/60">Complete the treatment to generate an invoice.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}