export type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "VIEW" | "LOGIN" | "LOGOUT"

export interface AuditLogEntry {
  user_id: string
  action: AuditAction
  table_name: string
  record_id?: string
  changes?: Record<string, any>
  description?: string
}

/**
 * Log an audit entry to localStorage (mock implementation)
 * @param logEntry The audit log entry to record
 */
export async function logAuditEntry(logEntry: AuditLogEntry): Promise<void> {
  try {
    // In a real app, this would save to a database
    // For now, we'll store in localStorage for demonstration
    
    // Get existing audit logs
    const auditLogsStr = localStorage.getItem("auditLogs") || "[]"
    const auditLogs = JSON.parse(auditLogsStr)
    
    // Add new log entry
    const newLog = {
      ...logEntry,
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
    }
    
    auditLogs.push(newLog)
    
    // Save back to localStorage
    localStorage.setItem("auditLogs", JSON.stringify(auditLogs.slice(-100))) // Keep only last 100 entries
    
    console.log("Audit log entry recorded:", newLog)
  } catch (error) {
    console.error("Error in audit logging:", error)
  }
}

/**
 * Log a create operation
 * @param userId The ID of the user performing the action
 * @param tableName The name of the table being modified
 * @param recordId The ID of the created record
 * @param data The data that was created
 * @param description Optional description
 */
export async function logCreate(
  userId: string,
  tableName: string,
  recordId: string,
  data: Record<string, any>,
  description?: string
): Promise<void> {
  await logAuditEntry({
    user_id: userId,
    action: "CREATE",
    table_name: tableName,
    record_id: recordId,
    changes: data,
    description,
  })
}

/**
 * Log an update operation
 * @param userId The ID of the user performing the action
 * @param tableName The name of the table being modified
 * @param recordId The ID of the updated record
 * @param oldData The data before the update
 * @param newData The data after the update
 * @param description Optional description
 */
export async function logUpdate(
  userId: string,
  tableName: string,
  recordId: string,
  oldData: Record<string, any>,
  newData: Record<string, any>,
  description?: string
): Promise<void> {
  // Only log changes that actually changed
  const changes: Record<string, { old: any; new: any }> = {}
  
  for (const key in newData) {
    if (newData[key] !== oldData[key]) {
      changes[key] = {
        old: oldData[key],
        new: newData[key],
      }
    }
  }
  
  if (Object.keys(changes).length > 0) {
    await logAuditEntry({
      user_id: userId,
      action: "UPDATE",
      table_name: tableName,
      record_id: recordId,
      changes,
      description,
    })
  }
}

/**
 * Log a delete operation
 * @param userId The ID of the user performing the action
 * @param tableName The name of the table being modified
 * @param recordId The ID of the deleted record
 * @param data The data that was deleted
 * @param description Optional description
 */
export async function logDelete(
  userId: string,
  tableName: string,
  recordId: string,
  data: Record<string, any>,
  description?: string
): Promise<void> {
  await logAuditEntry({
    user_id: userId,
    action: "DELETE",
    table_name: tableName,
    record_id: recordId,
    changes: data,
    description,
  })
}

/**
 * Log a view operation (for sensitive data access)
 * @param userId The ID of the user performing the action
 * @param tableName The name of the table being viewed
 * @param recordId The ID of the viewed record
 * @param description Optional description
 */
export async function logView(
  userId: string,
  tableName: string,
  recordId: string,
  description?: string
): Promise<void> {
  await logAuditEntry({
    user_id: userId,
    action: "VIEW",
    table_name: tableName,
    record_id: recordId,
    description,
  })
}

/**
 * Log a login operation
 * @param userId The ID of the user logging in
 * @param description Optional description
 */
export async function logLogin(userId: string, description?: string): Promise<void> {
  await logAuditEntry({
    user_id: userId,
    action: "LOGIN",
    table_name: "auth",
    description,
  })
}

/**
 * Log a logout operation
 * @param userId The ID of the user logging out
 * @param description Optional description
 */
export async function logLogout(userId: string, description?: string): Promise<void> {
  await logAuditEntry({
    user_id: userId,
    action: "LOGOUT",
    table_name: "auth",
    description,
  })
}