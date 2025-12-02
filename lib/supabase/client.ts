// Mock Supabase client for demo purposes
export function createClient() {
  return {
    auth: {
      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        // Mock authentication
        return {
          data: { user: null },
          error: null
        }
      },
      signOut: async () => {
        // Mock sign out
        return {
          error: null
        }
      },
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