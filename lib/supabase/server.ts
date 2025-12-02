// Mock Supabase server client for demo purposes
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()

  return {
    auth: {
      getUser: async () => {
        // Mock get user
        return {
          data: { user: null },
          error: null
        }
      }
    },
    from: (table: string) => {
      // Mock database operations
      return {
        select: () => ({
          eq: () => Promise.resolve({ data: [], error: null }),
          ilike: () => Promise.resolve({ data: [], error: null })
        }),
        insert: () => Promise.resolve({ data: [], error: null }),
        update: () => ({
          eq: () => Promise.resolve({ data: [], error: null })
        }),
        delete: () => ({
          eq: () => Promise.resolve({ data: [], error: null })
        })
      }
    }
  }
}