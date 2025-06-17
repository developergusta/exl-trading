"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import type { Database } from "@/lib/supabase"

type Course = Database["public"]["Tables"]["courses"]["Row"]
type CourseContent = Database["public"]["Tables"]["course_content"]["Row"]
type CoursePermission = Database["public"]["Tables"]["course_permissions"]["Row"]
type UserGroup = Database["public"]["Tables"]["user_groups"]["Row"]

interface AcademyContextType {
  courses: Course[]
  loading: boolean
  error: string | null
  isConfigured: boolean

  // Course management
  createCourse: (course: Omit<Course, "id" | "created_at" | "updated_at">) => Promise<Course | null>
  updateCourse: (id: string, updates: Partial<Course>) => Promise<boolean>
  deleteCourse: (id: string) => Promise<boolean>
  getCourseById: (id: string) => Promise<Course | null>

  // Content management
  createContent: (content: Omit<CourseContent, "id" | "created_at" | "updated_at">) => Promise<CourseContent | null>
  updateContent: (id: string, updates: Partial<CourseContent>) => Promise<boolean>
  deleteContent: (id: string) => Promise<boolean>
  getCourseContent: (courseId: string) => Promise<CourseContent[]>

  // Permission management
  grantPermission: (permission: Omit<CoursePermission, "id" | "granted_at">) => Promise<boolean>
  revokePermission: (permissionId: string) => Promise<boolean>
  getUserPermissions: (userId: string) => Promise<CoursePermission[]>

  // Group management
  createGroup: (group: Omit<UserGroup, "id" | "created_at">) => Promise<UserGroup | null>
  getGroups: () => Promise<UserGroup[]>
  addUserToGroup: (groupId: string, userId: string) => Promise<boolean>
  removeUserFromGroup: (groupId: string, userId: string) => Promise<boolean>

  // Utility functions
  refreshCourses: () => Promise<void>
  uploadFile: (file: File, bucket: string, path: string) => Promise<string | null>
}

const AcademyContext = createContext<AcademyContextType | undefined>(undefined)

// Mock data for when Supabase is not configured
const mockCourses: Course[] = [
  {
    id: "1",
    title: "Fundamentos do Day Trade",
    description: "Aprenda os conceitos básicos do day trading, desde análise técnica até gestão de risco.",
    logo_url: "/placeholder.svg?height=200&width=300",
    created_by: "admin",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true,
  },
  {
    id: "2",
    title: "Análise Técnica Avançada",
    description: "Domine padrões gráficos, indicadores técnicos e estratégias avançadas de trading.",
    logo_url: "/placeholder.svg?height=200&width=300",
    created_by: "admin",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true,
  },
  {
    id: "3",
    title: "Psicologia do Trading",
    description: "Desenvolva o mindset correto e controle emocional para ser um trader consistente.",
    logo_url: "/placeholder.svg?height=200&width=300",
    created_by: "admin",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true,
  },
]

const mockContent: CourseContent[] = [
  {
    id: "1",
    course_id: "1",
    title: "Introdução ao Day Trade",
    description: "Conceitos básicos e primeiros passos",
    cover_url: "/placeholder.svg?height=200&width=300",
    content_type: "youtube",
    content_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    order_index: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true,
  },
  {
    id: "2",
    course_id: "1",
    title: "Setup de Trading",
    description: "Como configurar sua mesa de operações",
    cover_url: "/placeholder.svg?height=200&width=300",
    content_type: "pdf",
    content_url: "https://example.com/setup-guide.pdf",
    order_index: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true,
  },
]

export function AcademyProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    refreshCourses()
  }, [])

  const refreshCourses = async () => {
    setLoading(true)
    setError(null)

    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from("courses")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false })

        if (error) throw error
        setCourses(data || [])
      } else {
        // Use mock data when Supabase is not configured
        setCourses(mockCourses)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar cursos")
      // Fallback to mock data on error
      setCourses(mockCourses)
    } finally {
      setLoading(false)
    }
  }

  const createCourse = async (courseData: Omit<Course, "id" | "created_at" | "updated_at">): Promise<Course | null> => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from("courses").insert([courseData]).select().single()

        if (error) throw error

        await refreshCourses()
        return data
      } else {
        // Mock implementation
        const newCourse: Course = {
          ...courseData,
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        setCourses((prev) => [newCourse, ...prev])
        return newCourse
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar curso")
      return null
    }
  }

  const updateCourse = async (id: string, updates: Partial<Course>): Promise<boolean> => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from("courses").update(updates).eq("id", id)

        if (error) throw error

        await refreshCourses()
        return true
      } else {
        // Mock implementation
        setCourses((prev) =>
          prev.map((course) =>
            course.id === id ? { ...course, ...updates, updated_at: new Date().toISOString() } : course,
          ),
        )
        return true
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar curso")
      return false
    }
  }

  const deleteCourse = async (id: string): Promise<boolean> => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from("courses").update({ is_active: false }).eq("id", id)

        if (error) throw error

        await refreshCourses()
        return true
      } else {
        // Mock implementation
        setCourses((prev) => prev.filter((course) => course.id !== id))
        return true
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao deletar curso")
      return false
    }
  }

  const getCourseById = async (id: string): Promise<Course | null> => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from("courses").select("*").eq("id", id).eq("is_active", true).single()

        if (error) throw error
        return data
      } else {
        // Mock implementation
        return mockCourses.find((course) => course.id === id) || null
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar curso")
      return null
    }
  }

  const createContent = async (
    contentData: Omit<CourseContent, "id" | "created_at" | "updated_at">,
  ): Promise<CourseContent | null> => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from("course_content").insert([contentData]).select().single()

        if (error) throw error
        return data
      } else {
        // Mock implementation
        const newContent: CourseContent = {
          ...contentData,
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        return newContent
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conteúdo")
      return null
    }
  }

  const updateContent = async (id: string, updates: Partial<CourseContent>): Promise<boolean> => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from("course_content").update(updates).eq("id", id)

        if (error) throw error
        return true
      } else {
        // Mock implementation
        return true
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar conteúdo")
      return false
    }
  }

  const deleteContent = async (id: string): Promise<boolean> => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from("course_content").update({ is_active: false }).eq("id", id)

        if (error) throw error
        return true
      } else {
        // Mock implementation
        return true
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao deletar conteúdo")
      return false
    }
  }

  const getCourseContent = async (courseId: string): Promise<CourseContent[]> => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from("course_content")
          .select("*")
          .eq("course_id", courseId)
          .eq("is_active", true)
          .order("order_index", { ascending: true })

        if (error) throw error
        return data || []
      } else {
        // Mock implementation
        return mockContent.filter((content) => content.course_id === courseId)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar conteúdo")
      return []
    }
  }

  const grantPermission = async (permissionData: Omit<CoursePermission, "id" | "granted_at">): Promise<boolean> => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from("course_permissions").insert([permissionData])

        if (error) throw error
        return true
      } else {
        // Mock implementation
        return true
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao conceder permissão")
      return false
    }
  }

  const revokePermission = async (permissionId: string): Promise<boolean> => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from("course_permissions").delete().eq("id", permissionId)

        if (error) throw error
        return true
      } else {
        // Mock implementation
        return true
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao revogar permissão")
      return false
    }
  }

  const getUserPermissions = async (userId: string): Promise<CoursePermission[]> => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from("course_permissions").select("*").eq("user_id", userId)

        if (error) throw error
        return data || []
      } else {
        // Mock implementation
        return []
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar permissões")
      return []
    }
  }

  const createGroup = async (groupData: Omit<UserGroup, "id" | "created_at">): Promise<UserGroup | null> => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from("user_groups").insert([groupData]).select().single()

        if (error) throw error
        return data
      } else {
        // Mock implementation
        const newGroup: UserGroup = {
          ...groupData,
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
        }
        return newGroup
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar grupo")
      return null
    }
  }

  const getGroups = async (): Promise<UserGroup[]> => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from("user_groups").select("*").order("name", { ascending: true })

        if (error) throw error
        return data || []
      } else {
        // Mock implementation
        return []
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar grupos")
      return []
    }
  }

  const addUserToGroup = async (groupId: string, userId: string): Promise<boolean> => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from("user_group_members").insert([{ group_id: groupId, user_id: userId }])

        if (error) throw error
        return true
      } else {
        // Mock implementation
        return true
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao adicionar usuário ao grupo")
      return false
    }
  }

  const removeUserFromGroup = async (groupId: string, userId: string): Promise<boolean> => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from("user_group_members")
          .delete()
          .eq("group_id", groupId)
          .eq("user_id", userId)

        if (error) throw error
        return true
      } else {
        // Mock implementation
        return true
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao remover usuário do grupo")
      return false
    }
  }

  const uploadFile = async (file: File, bucket: string, path: string): Promise<string | null> => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        })

        if (error) throw error

        const {
          data: { publicUrl },
        } = supabase.storage.from(bucket).getPublicUrl(data.path)

        return publicUrl
      } else {
        // Mock implementation - return a placeholder URL
        return "/placeholder.svg?height=200&width=300"
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer upload do arquivo")
      return null
    }
  }

  return (
    <AcademyContext.Provider
      value={{
        courses,
        loading,
        error,
        isConfigured: isSupabaseConfigured,
        createCourse,
        updateCourse,
        deleteCourse,
        getCourseById,
        createContent,
        updateContent,
        deleteContent,
        getCourseContent,
        grantPermission,
        revokePermission,
        getUserPermissions,
        createGroup,
        getGroups,
        addUserToGroup,
        removeUserFromGroup,
        refreshCourses,
        uploadFile,
      }}
    >
      {children}
    </AcademyContext.Provider>
  )
}

export function useAcademy() {
  const context = useContext(AcademyContext)
  if (context === undefined) {
    throw new Error("useAcademy must be used within an AcademyProvider")
  }
  return context
}
