"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AuditLog {
  id: string
  user_id: string
  action: string
  table_name: string
  record_id: string
  changes: string
  created_at: string
  profiles?: {
    first_name: string
    last_name: string
  }
}

export default function AuditLogsPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterAction, setFilterAction] = useState("")
  const [filterTable, setFilterTable] = useState("")

  useEffect(() => {
    fetchAuditLogs()
  }, [])

  useEffect(() => {
    let filtered = auditLogs.filter((log) => {
      const fullName = `${log.profiles?.first_name || ""} ${log.profiles?.last_name || ""}`.toLowerCase()
      return (
        fullName.includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.table_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })

    if (filterAction) {
      filtered = filtered.filter((log) => log.action === filterAction)
    }

    if (filterTable) {
      filtered = filtered.filter((log) => log.table_name === filterTable)
    }

    setFilteredLogs(filtered)
  }, [searchTerm, filterAction, filterTable, auditLogs])

  const fetchAuditLogs = async () => {
    try {
      setIsLoading(true)
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Get audit logs from localStorage
      const auditLogsStr = localStorage.getItem("auditLogs") || "[]"
      const logs = JSON.parse(auditLogsStr)
      
      // Mock user data for display
      const mockUsers = [
        { id: "user-1", first_name: "John", last_name: "Admin" },
        { id: "user-2", first_name: "Sarah", last_name: "Doctor" },
        { id: "user-3", first_name: "Mike", last_name: "Receptionist" },
        { id: "user-4", first_name: "Lisa", last_name: "Accountant" },
      ]
      
      // Enrich logs with mock user data
      const enrichedLogs = logs.map((log: any) => {
        const user = mockUsers.find(u => u.id === log.user_id) || { first_name: "Unknown", last_name: "User" }
        return {
          ...log,
          profiles: {
            first_name: user.first_name,
            last_name: user.last_name
          }
        }
      })
      
      setAuditLogs(enrichedLogs)
    } catch (error) {
      console.error("Error fetching audit logs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const actionColors: Record<string, string> = {
    CREATE: "bg-green-100 text-green-800",
    UPDATE: "bg-blue-100 text-blue-800",
    DELETE: "bg-red-100 text-red-800",
    VIEW: "bg-purple-100 text-purple-800",
    LOGIN: "bg-yellow-100 text-yellow-800",
    LOGOUT: "bg-orange-100 text-orange-800",
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary">Audit Logs</h1>
        <p className="text-secondary/60 mt-2">View system activity and user actions</p>
      </div>

      {/* Filters */}
      <Card className="mb-6 border-primary/10">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex gap-2">
              <Search size={20} className="text-secondary/40 mt-3" />
              <Input
                placeholder="Search by user, action, or table..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            
            <div>
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Actions</SelectItem>
                  <SelectItem value="CREATE">Create</SelectItem>
                  <SelectItem value="UPDATE">Update</SelectItem>
                  <SelectItem value="DELETE">Delete</SelectItem>
                  <SelectItem value="VIEW">View</SelectItem>
                  <SelectItem value="LOGIN">Login</SelectItem>
                  <SelectItem value="LOGOUT">Logout</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select value={filterTable} onValueChange={setFilterTable}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by table" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Tables</SelectItem>
                  <SelectItem value="patients">Patients</SelectItem>
                  <SelectItem value="doctors">Doctors</SelectItem>
                  <SelectItem value="treatment_records">Treatments</SelectItem>
                  <SelectItem value="invoices">Invoices</SelectItem>
                  <SelectItem value="xray_files">X-Ray Files</SelectItem>
                  <SelectItem value="auth">Authentication</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <button 
                className="px-4 py-2 border rounded-md hover:bg-secondary/10"
                onClick={() => {
                  setSearchTerm("")
                  setFilterAction("")
                  setFilterTable("")
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card className="border-primary/10">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
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
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead>Record ID</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-secondary/60">
                        No audit logs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((log) => (
                      <TableRow key={log.id} className="border-primary/5">
                        <TableCell className="font-medium">
                          {log.profiles?.first_name} {log.profiles?.last_name}
                        </TableCell>
                        <TableCell>
                          <Badge className={actionColors[log.action] || "bg-gray-100"}>
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell>{log.table_name}</TableCell>
                        <TableCell className="font-mono text-sm">{log.record_id || "-"}</TableCell>
                        <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
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