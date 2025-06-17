import { createClient } from "@supabase/supabase-js"

// Check if Supabase environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create Supabase client only if environment variables are available
export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

// Flag to check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      courses: {
        Row: {
          id: string
          title: string
          description: string | null
          logo_url: string | null
          created_by: string | null
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          logo_url?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          logo_url?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
      }
      course_content: {
        Row: {
          id: string
          course_id: string
          title: string
          description: string | null
          cover_url: string | null
          content_type: "youtube" | "pdf" | "download"
          content_url: string
          order_index: number
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          description?: string | null
          cover_url?: string | null
          content_type: "youtube" | "pdf" | "download"
          content_url: string
          order_index?: number
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          description?: string | null
          cover_url?: string | null
          content_type?: "youtube" | "pdf" | "download"
          content_url?: string
          order_index?: number
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
      }
      course_permissions: {
        Row: {
          id: string
          course_id: string
          content_id: string | null
          user_id: string | null
          permission_type: "all" | "specific" | "group"
          granted_at: string
          granted_by: string | null
        }
        Insert: {
          id?: string
          course_id: string
          content_id?: string | null
          user_id?: string | null
          permission_type: "all" | "specific" | "group"
          granted_at?: string
          granted_by?: string | null
        }
        Update: {
          id?: string
          course_id?: string
          content_id?: string | null
          user_id?: string | null
          permission_type?: "all" | "specific" | "group"
          granted_at?: string
          granted_by?: string | null
        }
      }
      user_groups: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
        }
      }
      user_group_members: {
        Row: {
          id: string
          group_id: string
          user_id: string
          added_at: string
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          added_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          added_at?: string
        }
      }
    }
  }
}
