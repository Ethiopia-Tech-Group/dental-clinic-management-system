
export type UserRole = 
  | "super_admin"
  | "admin"
  | "doctor"
  | "receptionist"
  | "accountant"
  | "branch_manager"
  | "xray_technician"

export interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  role: UserRole
  organization_id: string
  is_active: boolean
}

export interface UserBranchAssignment {
  branch_id: string
  is_active: boolean
}

// Check if user has a specific role
export function hasRole(userRole: UserRole, roles: UserRole[]): boolean {
  return roles.includes(userRole)
}

// Check if user can access a specific route
export function canAccessRoute(userRole: UserRole, pathname: string): boolean {
  const routePermissions: Record<string, UserRole[]> = {
    "/dashboard": ["super_admin", "admin", "doctor", "receptionist", "accountant", "branch_manager", "xray_technician"],
    "/dashboard/users": ["super_admin", "admin"],
    "/dashboard/branches": ["super_admin", "admin", "branch_manager"],
    "/dashboard/doctors": ["super_admin", "admin", "branch_manager"],
    "/dashboard/patients": ["super_admin", "admin", "doctor", "receptionist", "branch_manager"],
    "/dashboard/services": ["super_admin", "admin", "branch_manager"],
    "/dashboard/treatments": ["super_admin", "admin", "doctor", "branch_manager"],
    "/dashboard/invoices": ["super_admin", "admin", "receptionist", "accountant", "branch_manager"],
    "/dashboard/reports": ["super_admin", "admin", "accountant", "branch_manager"],
    "/dashboard/settings": ["super_admin", "admin", "branch_manager"],

    "/dashboard/audit-logs": ["super_admin", "accountant"],
  }

  const allowedRoles = routePermissions[pathname] || routePermissions["/dashboard"]
  return hasRole(userRole, allowedRoles)
}

// Get user profile (mock version)
export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    // Check for mock session in localStorage
    const sessionStr = localStorage.getItem("userSession")
    
    if (!sessionStr) {
      return null
    }

    const session = JSON.parse(sessionStr)
    
    // Check if session is expired
    if (Date.now() > session.expires_at) {
      localStorage.removeItem("userSession")
      return null
    }

    // Return mock profile based on session
    return {
      id: session.user.id,
      email: session.user.email,
      first_name: session.user.name.split(" ")[0],
      last_name: session.user.name.split(" ").slice(1).join(" "),
      role: session.user.role,
      organization_id: "org-1",
      is_active: true
    }
  } catch (error) {
    console.error("Error getting user profile:", error)
    return null
  }
}

// Get user's branch assignments (mock version)
export async function getUserBranchAssignments(userId: string): Promise<UserBranchAssignment[]> {
  try {
    // Mock branch assignments
    return [
      { branch_id: "branch-1", is_active: true }
    ]
  } catch (error) {
    console.error("Error fetching branch assignments:", error)
    return []
  }
}

// Check if user has access to a specific branch (mock version)
export async function userHasBranchAccess(userId: string, branchId: string): Promise<boolean> {
  try {
    // Mock branch access check
    return true
  } catch (error) {
    return false
  }
}