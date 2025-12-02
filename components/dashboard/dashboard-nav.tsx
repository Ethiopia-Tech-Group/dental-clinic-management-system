"use client"

import { useRouter } from "next/navigation"
import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { LogOut, Menu, X, Upload } from "lucide-react"
import { UserRole } from "@/lib/utils/rbac"
import BranchSwitcher from "./branch-switcher"

interface NavItem {
  label: string
  href: string
  roles: UserRole[]
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", roles: ["super_admin", "admin", "doctor", "receptionist", "accountant", "branch_manager", "xray_technician"] },
  { label: "Users", href: "/dashboard/users", roles: ["super_admin", "admin"] },
  { label: "Branches", href: "/dashboard/branches", roles: ["super_admin", "admin", "branch_manager"] },
  { label: "Doctors", href: "/dashboard/doctors", roles: ["super_admin", "admin", "branch_manager"] },
  { label: "Patients", href: "/dashboard/patients", roles: ["super_admin", "admin", "doctor", "receptionist", "branch_manager"] },
  { label: "Services", href: "/dashboard/services", roles: ["super_admin", "admin", "branch_manager"] },
  { label: "Treatments", href: "/dashboard/treatments", roles: ["super_admin", "admin", "doctor", "branch_manager"] },
  { label: "Invoices", href: "/dashboard/invoices", roles: ["super_admin", "admin", "receptionist", "accountant", "branch_manager"] },
  // { label: "Audit Logs", href: "/dashboard/audit-logs", roles: ["super_admin", "accountant"] },
  // { label: "Reports", href: "/dashboard/reports", roles: ["super_admin", "admin", "accountant", "branch_manager"] },
  { label: "Settings", href: "/dashboard/settings", roles: ["super_admin", "admin", "branch_manager"] },
]

export default function DashboardNav({ userRole, userEmail }: { userRole: string | null; userEmail: string | null }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [showLogoUpload, setShowLogoUpload] = useState(false)

  // Handle logo upload for super admin
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.match("image.*")) {
        alert("Please upload an image file")
        return
      }

      // Create a local URL for the file
      const localUrl = URL.createObjectURL(file)
      setLogoUrl(localUrl)
      
      // In a real app, you would save this to the database
      // For now, we'll just store it in localStorage
      localStorage.setItem("systemLogo", localUrl)
    }
  }

  // Load logo from localStorage on component mount
  useEffect(() => {
    const savedLogo = localStorage.getItem("systemLogo")
    if (savedLogo) {
      setLogoUrl(savedLogo)
    }
  }, [])

  const handleLogout = async () => {
    // Remove session from localStorage
    localStorage.removeItem("userSession")
    localStorage.removeItem("currentBranchId")
    router.push("/auth/login")
  }

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => 
    !userRole || item.roles.includes(userRole as UserRole)
  )

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden absolute top-4 left-4 z-50">
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-lg bg-primary text-white">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? "block" : "hidden"
        } lg:block w-full lg:w-64 bg-secondary text-white flex flex-col transition-all duration-300 fixed lg:relative h-full z-40`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
              ) : (
                <span className="font-bold">DC</span>
              )}
            </div>
            <div>
              <h1 className="font-bold text-lg text-white">Dental Clinic</h1>
              <p className="text-xs text-white/80">Management System</p>
            </div>
          </div>
          
          {/* Logo upload for Super Admin */}
          {userRole === "super_admin" && (
            <div className="mt-2">
              <label className="flex items-center gap-1 text-xs text-white/70 cursor-pointer hover:text-white transition">
                <Upload size={12} />
                <span>Upload Logo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}
          
          {/* Branch Switcher for Super Admin */}
          {userRole === "super_admin" && (
            <div className="mt-2">
              <BranchSwitcher />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 overflow-y-auto">
  {filteredNavItems.map((item) => (
    <React.Fragment key={item.href}>
      <Link
        href={item.href}
        className="block px-4 py-2 rounded-lg text-sm hover:bg-primary transition text-white hover:text-white"
        onClick={() => setIsOpen(false)}
      >
        {item.label}
      </Link>

      {item.href === "/dashboard/settings" && (
        <Link
          href="/dashboard/profile/edit"
          className="block px-4 py-2 rounded-lg text-sm hover:bg-primary transition text-white hover:text-white ml-4"
          onClick={() => setIsOpen(false)}
        >
          Edit Profile
        </Link>
      )}
    </React.Fragment>
  ))}
</nav>


        {/* User Info */}
        <div className="p-4 border-t border-white/10">
          <div className="text-sm mb-2">
            <p className="font-medium truncate">{userEmail}</p>
            <p className="text-white/70 capitalize">{userRole?.replace("_", " ")}</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full text-white border-white/20 hover:bg-white/10 bg-transparent"
          >
            <LogOut size={18} className="mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/50 lg:hidden z-30" onClick={() => setIsOpen(false)} />}
    </>
  )
}