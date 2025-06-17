"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAcademy } from "@/hooks/use-academy"
import { useAuth } from "@/hooks/use-auth"
import { ContentItem } from "@/components/academy/content-item"
import { ArrowLeft, BookOpen, Plus, Settings } from "lucide-react"
import type { Database } from "@/lib/supabase"

type Course = Database["public"]["Tables"]["courses"]["Row"]
type CourseContent = Database["public"]["Tables"]["course_content"]["Row"]

interface CourseDetailProps {
  courseId: string
  onBack: () => void
}

export function CourseDetail({ courseId, onBack }: CourseDetailProps) {
  const { getCourseById, getCourseContent } = useAcademy()
  const { isAdmin } = useAuth()
  const [course, setCourse] = useState<Course | null>(null)
  const [content, setContent] = useState<CourseContent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedContent, setSelectedContent] = useState<CourseContent | null>(null)

  useEffect(() => {
    loadCourseData()
  }, [courseId])

  const loadCourseData = async () => {
    setLoading(true)
    try {
      const [courseData, contentData] = await Promise.all([getCourseById(courseId), getCourseContent(courseId)])

      setCourse(courseData)
      setContent(contentData)
    } catch (error) {
      console.error("Erro ao carregar dados do curso:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#BBF717] mx-auto mb-4"></div>
        <p className="text-gray-400">Carregando curso...</p>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-white mb-2">Curso não encontrado</h3>
        <Button onClick={onBack} className="bg-[#BBF717] text-black hover:bg-[#9FD615]">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Button onClick={onBack} className="bg-[#1C1C1C] text-[#BBF717] hover:bg-[#2C2C2C]">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar aos Cursos
        </Button>

        {isAdmin && (
          <div className="flex gap-2">
            <Button
              onClick={() => {
                /* TODO: Open add content modal */
              }}
              className="bg-[#BBF717] text-black hover:bg-[#9FD615]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Conteúdo
            </Button>
            <Button
              onClick={() => {
                /* TODO: Open course settings */
              }}
              variant="outline"
              className="border-[#555] text-white hover:bg-[#2C2C2C]"
            >
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </Button>
          </div>
        )}
      </div>

      {/* Course Header */}
      <Card className="bg-[#1C1C1C] border-[#2C2C2C] mb-8">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-48 h-48 bg-gradient-to-br from-[#BBF717] to-[#9FD615] rounded-lg overflow-hidden flex-shrink-0">
              {course.logo_url ? (
                <img
                  src={course.logo_url || "/placeholder.svg"}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="h-16 w-16 text-black opacity-80" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-4">{course.title}</h1>
              <p className="text-gray-300 text-lg mb-6">{course.description || "Descrição não disponível"}</p>

              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{content.length} aulas</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📅</span>
                  <span>Criado em {new Date(course.created_at).toLocaleDateString("pt-BR")}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Content List */}
        <div className="lg:col-span-1">
          <Card className="bg-[#1C1C1C] border-[#2C2C2C]">
            <CardHeader>
              <CardTitle className="text-white">Conteúdo do Curso</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {content.length > 0 ? (
                <div className="space-y-1">
                  {content.map((item, index) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedContent(item)}
                      className={`p-4 cursor-pointer hover:bg-[#2A2B2A] transition-colors border-l-4 ${
                        selectedContent?.id === item.id ? "border-[#BBF717] bg-[#2A2B2A]" : "border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#BBF717] rounded-full flex items-center justify-center text-black font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-white text-sm">{item.title}</h4>
                          <p className="text-xs text-gray-400 capitalize">{item.content_type}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-400">Nenhum conteúdo disponível</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Content Viewer */}
        <div className="lg:col-span-2">
          {selectedContent ? (
            <ContentItem content={selectedContent} />
          ) : (
            <Card className="bg-[#1C1C1C] border-[#2C2C2C] h-96">
              <CardContent className="h-full flex items-center justify-center">
                <div className="text-center">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">Selecione um conteúdo</h3>
                  <p className="text-gray-400">Escolha uma aula na lista ao lado para começar</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
