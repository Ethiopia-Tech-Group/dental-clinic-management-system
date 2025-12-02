"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { mockInvoices, mockPatients, mockDoctors, mockTreatmentServices, mockServices } from "@/data/mockData";
import { useBranch } from "@/contexts/BranchContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface Invoice {
  id: string;
  invoice_number: string;
  patient_id: string;
  doctor_id: string;
  branch_id: string;
  treatment_id: string;
  subtotal: number;
  tax: number;
  discount: number;
  total_amount: number;
  amount_paid: number;
  balance_remaining: number;
  status: string;
  invoice_date: string;
  due_date: string;
  created_at: string;
  updated_at: string;
}

export default function InvoiceDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const { currentBranch } = useBranch();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [patient, setPatient] = useState<any>(null);
  const [doctor, setDoctor] = useState<any>(null);
  const [treatmentServices, setTreatmentServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [paymentForm, setPaymentForm] = useState({ amount: "", method: "" });

  // Get user role from localStorage
  useEffect(() => {
    const sessionStr = localStorage.getItem("userSession");
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        setUserRole(session.user.role);
      } catch (error) {
        console.error("Error parsing session:", error);
      }
    }
  }, []);

  // Load invoice data
  useEffect(() => {
    if (id) {
      const foundInvoice = mockInvoices.find(inv => inv.id === id);
      if (foundInvoice) {
        setInvoice(foundInvoice);
        
        // Load patient data
        const foundPatient = mockPatients.find(p => p.id === foundInvoice.patient_id);
        if (foundPatient) {
          setPatient(foundPatient);
        }
        
        // Load doctor data
        const foundDoctor = mockDoctors.find(d => d.id === foundInvoice.doctor_id);
        if (foundDoctor) {
          setDoctor(foundDoctor);
        }
        
        // Load services for this treatment
        const treatmentServicesData = mockTreatmentServices.filter(ts => ts.treatment_id === foundInvoice.treatment_id);
        setTreatmentServices(treatmentServicesData);
      } else {
        toast.error("Invoice not found");
        router.push("/dashboard/invoices");
      }
    }
  }, [id, router]);

  // Helper function to update invoice status
  const updateInvoiceStatus = async (newStatus: string) => {
    try {
      // Find invoice in mock data
      const invoiceIndex = mockInvoices.findIndex(inv => inv.id === invoice?.id);
      if (invoiceIndex !== -1) {
        const updatedInvoice = {
          ...mockInvoices[invoiceIndex],
          status: newStatus,
          updated_at: new Date().toISOString()
        };
        
        // Update in mock data
        mockInvoices[invoiceIndex] = updatedInvoice;
        
        // Update local state
        setInvoice(updatedInvoice);
        
        toast.success("Invoice status updated successfully");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      toast.error(message);
    }
  };

  // Helper function to record a payment
  const recordPayment = async (amount: number, method: string) => {
    if (!invoice) return;
    
    try {
      // Find invoice in mock data
      const invoiceIndex = mockInvoices.findIndex(inv => inv.id === invoice.id);
      if (invoiceIndex !== -1) {
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
        
        toast.success("Payment recorded successfully");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      toast.error(message);
    }
  };

  const handleRecordPayment = async () => {
    if (!paymentForm.amount || !paymentForm.method) {
      toast.error("Please fill in all payment details");
      return;
    }
    
    const amount = parseFloat(paymentForm.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }
    
    if (amount > (invoice?.balance_remaining || 0)) {
      toast.error("Payment amount exceeds balance");
      return;
    }
    
    setIsLoading(true);
    
    try {
      await recordPayment(amount, paymentForm.method);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    paid: "bg-green-100 text-green-800",
    partial: "bg-yellow-100 text-yellow-800",
    unpaid: "bg-red-100 text-red-800",
  };

  if (!invoice) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => router.back()}>
            ← Back
          </Button>
          <h1 className="text-3xl font-bold text-secondary">Invoice Details</h1>
        </div>
        <div className="max-w-2xl">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-secondary/60">Loading invoice details...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={() => router.back()}>
          ← Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-secondary">Invoice Details</h1>
          <p className="text-secondary/60">Invoice #{invoice.invoice_number}</p>
        </div>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Invoice Header */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-secondary">
                  {patient?.first_name} {patient?.last_name}
                </h2>
                <p className="text-secondary/70">
                  Dr. {doctor?.first_name} {doctor?.last_name}
                </p>
                <p className="text-sm text-secondary/60">
                  Invoice Date: {new Date(invoice.invoice_date).toLocaleDateString()}
                </p>
                <p className="text-sm text-secondary/60">
                  Due Date: {new Date(invoice.due_date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={statusColors[invoice.status] || "bg-gray-100"}>
                  {invoice.status}
                </Badge>
                {(userRole === "receptionist" || userRole === "admin" || userRole === "accountant") && (
                  <Select
                    value={invoice.status}
                    onValueChange={updateInvoiceStatus}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Services */}
        <Card>
          <CardHeader>
            <CardTitle>Services</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Invoice Totals */}
        <Card>
          <CardContent className="space-y-2 max-w-xs ml-auto pt-6">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${invoice.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
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
          </CardContent>
        </Card>

        {/* Payment Section for Receptionist/Admin/Accountant */}
        {(userRole === "receptionist" || userRole === "admin" || userRole === "accountant") && (
          <Card>
            <CardHeader>
              <CardTitle>Record Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
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
                <div className="space-y-2">
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
                    onClick={handleRecordPayment}
                    disabled={!paymentForm.amount || !paymentForm.method || isLoading}
                  >
                    {isLoading ? "Recording..." : "Record Payment"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}