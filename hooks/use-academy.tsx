"use client";

import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

// Tipos para o sistema de cursos
interface Course {
  id: string;
  title: string;
  description?: string;
  cover_image_url?: string;
  instructor_name?: string;
  instructor_bio?: string;
  instructor_avatar_url?: string;
  category:
    | "trading"
    | "analise-tecnica"
    | "psicologia"
    | "gestao-risco"
    | "outros";
  level: "iniciante" | "intermediario" | "avancado";
  duration_hours: number;
  price: number;
  is_free: boolean;
  is_active: boolean;
  is_featured: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CourseContent {
  id: string;
  course_id: string;
  module_id?: string;
  title: string;
  description?: string;
  content_type: "youtube" | "vimeo" | "pdf" | "download" | "text";
  content_url: string;
  youtube_video_id?: string;
  thumbnail_url?: string;
  duration_minutes: number;
  order_index: number;
  is_preview: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CourseEnrollment {
  id: string;
  course_id: string;
  user_id: string;
  enrollment_date: string;
  completion_date?: string;
  progress_percentage: number;
  is_active: boolean;
  enrolled_by?: string;
  created_at: string;
  updated_at: string;
}

interface CourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  content_id: string;
  completed_at: string;
  watch_time_seconds: number;
  created_at: string;
}

interface AcademyContextType {
  courses: Course[];
  loading: boolean;
  error: string | null;
  isConfigured: boolean;

  // Course management
  createCourse: (
    course: Omit<Course, "id" | "created_at" | "updated_at">
  ) => Promise<Course | null>;
  updateCourse: (id: string, updates: Partial<Course>) => Promise<boolean>;
  deleteCourse: (id: string) => Promise<boolean>;
  getCourseById: (id: string) => Promise<Course | null>;

  // Module management
  createModule: (
    module: Omit<CourseModule, "id" | "created_at" | "updated_at">
  ) => Promise<CourseModule | null>;
  updateModule: (
    id: string,
    updates: Partial<CourseModule>
  ) => Promise<boolean>;
  deleteModule: (id: string) => Promise<boolean>;
  getCourseModules: (courseId: string) => Promise<CourseModule[]>;

  // Content management
  createContent: (
    content: Omit<CourseContent, "id" | "created_at" | "updated_at">
  ) => Promise<CourseContent | null>;
  updateContent: (
    id: string,
    updates: Partial<CourseContent>
  ) => Promise<boolean>;
  deleteContent: (id: string) => Promise<boolean>;
  getCourseContent: (courseId: string) => Promise<CourseContent[]>;

  // Enrollment management
  enrollUser: (courseId: string, userId: string) => Promise<boolean>;
  getUserEnrollments: (userId: string) => Promise<CourseEnrollment[]>;
  getCourseEnrollments: (courseId: string) => Promise<CourseEnrollment[]>;

  // Progress tracking
  markContentAsCompleted: (
    contentId: string,
    watchTimeSeconds?: number
  ) => Promise<boolean>;
  getUserProgress: (
    userId: string,
    courseId: string
  ) => Promise<CourseProgress[]>;

  // Utility functions
  refreshCourses: () => Promise<void>;
  uploadFile: (
    file: File,
    bucket: string,
    path: string
  ) => Promise<string | null>;
}

const AcademyContext = createContext<AcademyContextType | undefined>(undefined);

// Mock data for when Supabase is not configured
const mockCourses: Course[] = [
  {
    id: "1",
    title: "Fundamentos do Day Trade",
    description:
      "Aprenda os conceitos básicos do day trading, desde análise técnica até gestão de risco.",
    cover_image_url: "/placeholder.svg?height=200&width=300",
    instructor_name: "João Silva",
    category: "trading",
    level: "iniciante",
    duration_hours: 10,
    price: 0,
    is_free: true,
    is_active: true,
    is_featured: true,
    created_by: "admin",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Análise Técnica Avançada",
    description:
      "Domine padrões gráficos, indicadores técnicos e estratégias avançadas de trading.",
    cover_image_url: "/placeholder.svg?height=200&width=300",
    instructor_name: "Maria Santos",
    category: "analise-tecnica",
    level: "avancado",
    duration_hours: 25,
    price: 199.9,
    is_free: false,
    is_active: true,
    is_featured: false,
    created_by: "admin",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Psicologia do Trading",
    description:
      "Desenvolva o mindset correto e controle emocional para ser um trader consistente.",
    cover_image_url: "/placeholder.svg?height=200&width=300",
    instructor_name: "Carlos Oliveira",
    category: "psicologia",
    level: "intermediario",
    duration_hours: 15,
    price: 149.9,
    is_free: false,
    is_active: true,
    is_featured: true,
    created_by: "admin",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const mockContent: CourseContent[] = [
  {
    id: "1",
    course_id: "1",
    title: "Introdução ao Day Trade",
    description: "Conceitos básicos e primeiros passos",
    content_type: "youtube",
    content_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    youtube_video_id: "dQw4w9WgXcQ",
    thumbnail_url: "/placeholder.svg?height=200&width=300",
    duration_minutes: 15,
    order_index: 1,
    is_preview: true,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    course_id: "1",
    title: "Setup de Trading",
    description: "Como configurar sua mesa de operações",
    content_type: "pdf",
    content_url: "https://example.com/setup-guide.pdf",
    duration_minutes: 0,
    order_index: 2,
    is_preview: false,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function AcademyProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    refreshCourses();
  }, []);

  const refreshCourses = async () => {
    setLoading(true);
    setError(null);

    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from("courses")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setCourses(data || []);
      } else {
        // Use mock data when Supabase is not configured
        setCourses(mockCourses);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar cursos");
      // Fallback to mock data on error
      setCourses(mockCourses);
    } finally {
      setLoading(false);
    }
  };

  const createCourse = async (
    courseData: Omit<Course, "id" | "created_at" | "updated_at">
  ): Promise<Course | null> => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from("courses")
          .insert([courseData])
          .select()
          .single();

        if (error) throw error;

        await refreshCourses();
        return data;
      } else {
        // Mock implementation
        const newCourse: Course = {
          ...courseData,
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setCourses((prev) => [newCourse, ...prev]);
        return newCourse;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar curso");
      return null;
    }
  };

  const updateCourse = async (
    id: string,
    updates: Partial<Course>
  ): Promise<boolean> => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from("courses")
          .update(updates)
          .eq("id", id);

        if (error) throw error;

        await refreshCourses();
        return true;
      } else {
        // Mock implementation
        setCourses((prev) =>
          prev.map((course) =>
            course.id === id
              ? { ...course, ...updates, updated_at: new Date().toISOString() }
              : course
          )
        );
        return true;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar curso");
      return false;
    }
  };

  const deleteCourse = async (id: string): Promise<boolean> => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from("courses")
          .update({ is_active: false })
          .eq("id", id);

        if (error) throw error;

        await refreshCourses();
        return true;
      } else {
        // Mock implementation
        setCourses((prev) => prev.filter((course) => course.id !== id));
        return true;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao deletar curso");
      return false;
    }
  };

  const getCourseById = async (id: string): Promise<Course | null> => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from("courses")
          .select("*")
          .eq("id", id)
          .eq("is_active", true)
          .single();

        if (error) throw error;
        return data;
      } else {
        // Mock implementation
        return mockCourses.find((course) => course.id === id) || null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar curso");
      return null;
    }
  };

  const createModule = async (
    moduleData: Omit<CourseModule, "id" | "created_at" | "updated_at">
  ): Promise<CourseModule | null> => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from("course_modules")
          .insert([moduleData])
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const newModule: CourseModule = {
          ...moduleData,
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        return newModule;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar módulo");
      return null;
    }
  };

  const updateModule = async (
    id: string,
    updates: Partial<CourseModule>
  ): Promise<boolean> => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from("course_modules")
          .update(updates)
          .eq("id", id);

        if (error) throw error;
        return true;
      } else {
        return true;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar módulo");
      return false;
    }
  };

  const deleteModule = async (id: string): Promise<boolean> => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from("course_modules")
          .update({ is_active: false })
          .eq("id", id);

        if (error) throw error;
        return true;
      } else {
        return true;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao deletar módulo");
      return false;
    }
  };

  const getCourseModules = async (
    courseId: string
  ): Promise<CourseModule[]> => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from("course_modules")
          .select("*")
          .eq("course_id", courseId)
          .eq("is_active", true)
          .order("order_index", { ascending: true });

        if (error) throw error;
        return data || [];
      } else {
        return [];
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar módulos");
      return [];
    }
  };

  const createContent = async (
    contentData: Omit<CourseContent, "id" | "created_at" | "updated_at">
  ): Promise<CourseContent | null> => {
    try {
      console.log("contentData", contentData);
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from("course_content")
          .insert([contentData])
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Mock implementation
        const newContent: CourseContent = {
          ...contentData,
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        return newContent;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conteúdo");
      return null;
    }
  };

  const updateContent = async (
    id: string,
    updates: Partial<CourseContent>
  ): Promise<boolean> => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from("course_content")
          .update(updates)
          .eq("id", id);

        if (error) throw error;
        return true;
      } else {
        // Mock implementation
        return true;
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao atualizar conteúdo"
      );
      return false;
    }
  };

  const deleteContent = async (id: string): Promise<boolean> => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from("course_content")
          .update({ is_active: false })
          .eq("id", id);

        if (error) throw error;
        return true;
      } else {
        // Mock implementation
        return true;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao deletar conteúdo");
      return false;
    }
  };

  const getCourseContent = async (
    courseId: string
  ): Promise<CourseContent[]> => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from("course_content")
          .select("*")
          .eq("course_id", courseId)
          .eq("is_active", true)
          .order("order_index", { ascending: true });

        if (error) throw error;
        return data || [];
      } else {
        // Mock implementation
        return mockContent.filter((content) => content.course_id === courseId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar conteúdo");
      return [];
    }
  };

  const enrollUser = async (
    courseId: string,
    userId: string
  ): Promise<boolean> => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from("course_enrollments")
          .insert([{ course_id: courseId, user_id: userId }]);

        if (error) throw error;
        return true;
      } else {
        return true;
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao matricular usuário"
      );
      return false;
    }
  };

  const getUserEnrollments = async (
    userId: string
  ): Promise<CourseEnrollment[]> => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from("course_enrollments")
          .select("*")
          .eq("user_id", userId)
          .eq("is_active", true);

        if (error) throw error;
        return data || [];
      } else {
        return [];
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao buscar matrículas"
      );
      return [];
    }
  };

  const getCourseEnrollments = async (
    courseId: string
  ): Promise<CourseEnrollment[]> => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from("course_enrollments")
          .select("*")
          .eq("course_id", courseId)
          .eq("is_active", true);

        if (error) throw error;
        return data || [];
      } else {
        return [];
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao buscar matrículas do curso"
      );
      return [];
    }
  };

  const markContentAsCompleted = async (
    contentId: string,
    watchTimeSeconds: number = 0
  ): Promise<boolean> => {
    try {
      if (isSupabaseConfigured && supabase) {
        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");

        // Get course_id from content
        const { data: content, error: contentError } = await supabase
          .from("course_content")
          .select("course_id")
          .eq("id", contentId)
          .single();

        if (contentError) throw contentError;

        const { error } = await supabase.from("course_progress").upsert({
          user_id: user.id,
          course_id: content.course_id,
          content_id: contentId,
          watch_time_seconds: watchTimeSeconds,
          completed_at: new Date().toISOString(),
        });

        if (error) throw error;
        return true;
      } else {
        return true;
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao marcar conteúdo como completado"
      );
      return false;
    }
  };

  const getUserProgress = async (
    userId: string,
    courseId: string
  ): Promise<CourseProgress[]> => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from("course_progress")
          .select("*")
          .eq("user_id", userId)
          .eq("course_id", courseId);

        if (error) throw error;
        return data || [];
      } else {
        return [];
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar progresso");
      return [];
    }
  };

  const uploadFile = async (
    file: File,
    bucket: string,
    path: string
  ): Promise<string | null> => {
    try {
      if (isSupabaseConfigured && supabase) {
        // Debug: Verificar usuário autenticado
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        console.log("🔐 Usuário autenticado:", user?.email, "ID:", user?.id);

        if (authError) {
          console.error("❌ Erro de autenticação:", authError);
          throw new Error("Erro de autenticação: " + authError.message);
        }

        if (!user) {
          console.error("❌ Usuário não está logado");
          throw new Error("Usuário não está logado");
        }

        // Debug: Verificar perfil do usuário
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role, status, name, email")
          .eq("id", user.id)
          .single();

        console.log("👤 Perfil do usuário:", profile);

        if (profileError) {
          console.error("❌ Erro ao buscar perfil:", profileError);
        }

        if (!profile || profile.role !== "admin") {
          console.error("❌ Usuário não é admin. Role:", profile?.role);
          throw new Error(
            "Apenas administradores podem fazer upload de arquivos"
          );
        }

        if (profile.status !== "approved") {
          console.error(
            "❌ Usuário não está aprovado. Status:",
            profile.status
          );
          throw new Error("Usuário não está aprovado para fazer upload");
        }

        console.log("✅ Permissões OK. Iniciando upload...");

        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(path, file, {
            cacheControl: "3600",
            upsert: false,
          });

        console.log("📤 Upload - Data:", data);
        console.log("📤 Upload - Error:", error);

        if (error) throw error;

        const {
          data: { publicUrl },
        } = supabase.storage.from(bucket).getPublicUrl(data.path);

        console.log("🔗 URL pública gerada:", publicUrl);
        return publicUrl;
      } else {
        // Mock implementation - return a placeholder URL
        return "/placeholder.svg?height=200&width=300";
      }
    } catch (err) {
      console.error("❌ Erro completo no upload:", err);
      setError(
        err instanceof Error ? err.message : "Erro ao fazer upload do arquivo"
      );
      return null;
    }
  };

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
        createModule,
        updateModule,
        deleteModule,
        getCourseModules,
        createContent,
        updateContent,
        deleteContent,
        getCourseContent,
        enrollUser,
        getUserEnrollments,
        getCourseEnrollments,
        markContentAsCompleted,
        getUserProgress,
        refreshCourses,
        uploadFile,
      }}
    >
      {children}
    </AcademyContext.Provider>
  );
}

export function useAcademy() {
  const context = useContext(AcademyContext);
  if (context === undefined) {
    throw new Error("useAcademy must be used within an AcademyProvider");
  }
  return context;
}
