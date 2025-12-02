"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Eye, Plus } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import InvoiceModal from "@/components/dashboard/invoice-modal"
import { mockInvoices, mockPatients, getVisibleInvoices } from "@/data/mockData"
import { MockInvoice } from "@/data/mockData"
import { useBranch } from "@/contexts/BranchContext"

interface Invoice extends MockInvoice {
  patients?: { first_name: string; last_name: string }
}

export default function InvoicesPage() {
  const { currentBranch } = useBranch();
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedInvoice, setSelectedInvoice] = useState<MockInvoice | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchInvoices()
  }, [currentBranch]) // Add currentBranch as dependency

  useEffect(() => {
    const filtered = invoices.filter(
      (invoice) =>
        invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.patients?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.patients?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredInvoices(filtered)
  }, [searchTerm, invoices])

  const fetchInvoices = async () => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Use mock data with branch filtering
      let filteredInvoices = mockInvoices
      if (currentBranch?.id) {
        filteredInvoices = getVisibleInvoices({ selectedBranchId: currentBranch.id, mockInvoices })
      }
      
      // Enrich invoices with patient data
      const enrichedInvoices = filteredInvoices.map(invoice => {
        const patient = mockPatients.find(p => p.id === invoice.patient_id)
        return {
          ...invoice,
          patients: patient ? { first_name: patient.first_name, last_name: patient.last_name } : undefined
        }
      })
      
      setInvoices(enrichedInvoices)
    } catch (error) {
      console.error("Error fetching invoices:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateInvoice = () => {
    setSelectedInvoice(null)
    setIsModalOpen(true)
  }

  const handleEditInvoice = (invoice: Invoice) => {
    // Convert to MockInvoice type for the modal
    const mockInvoice: MockInvoice = {
      id: invoice.id,
      invoice_number: invoice.invoice_number,
      patient_id: invoice.patient_id,
      doctor_id: invoice.doctor_id,
      branch_id: invoice.branch_id,
      treatment_id: invoice.treatment_id,
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      discount: invoice.discount,
      total_amount: invoice.total_amount,
      amount_paid: invoice.amount_paid,
      balance_remaining: invoice.balance_remaining,
      status: invoice.status,
      invoice_date: invoice.invoice_date,
      due_date: invoice.due_date,
      created_at: invoice.created_at,
      updated_at: invoice.updated_at
    }
    
    setSelectedInvoice(mockInvoice)
    setIsModalOpen(true)
  }

  const handleSaveInvoice = () => {
    setIsModalOpen(false)
    setSelectedInvoice(null)
    fetchInvoices()
  }

  const statusColors: Record<string, string> = {
    paid: "bg-green-100 text-green-800",
    partial: "bg-yellow-100 text-yellow-800",
    unpaid: "bg-red-100 text-red-800",
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Invoices</h1>
          <p className="text-secondary/60 mt-2">View and manage patient invoices</p>
        </div>
      </div>

      {/* Search */}
      <Card className="mb-6 border-primary/10">
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Search size={20} className="text-secondary/40" />
            <Input
              placeholder="Search by invoice number or patient name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card className="border-primary/10">
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
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
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-secondary/60">
                        No invoices found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id} className="border-primary/5">
                        <TableCell className="font-bold text-primary">{invoice.invoice_number}</TableCell>
                        <TableCell>
                          {invoice.patients?.first_name} {invoice.patients?.last_name}
                        </TableCell>
                        <TableCell>{new Date(invoice.invoice_date).toLocaleDateString()}</TableCell>
                        <TableCell>${invoice.total_amount.toFixed(2)}</TableCell>
                        <TableCell className="text-green-600 font-medium">${invoice.amount_paid.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[invoice.status] || "bg-gray-100"}>{invoice.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditInvoice(invoice)}
                              className="p-2 hover:bg-primary/10 rounded transition"
                              title="Edit"
                            >
                              <Eye size={16} className="text-primary" />
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

      {isModalOpen && (
        <InvoiceModal
          invoice={selectedInvoice}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedInvoice(null)
          }}
          onSave={handleSaveInvoice}
        />
      )}
    </div>
  )
}