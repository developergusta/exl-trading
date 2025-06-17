"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAcademy } from "@/hooks/use-academy"
import { useAuth } from "@/hooks/use-auth"
import { CourseCard } from "@/components/academy/course-card"
import { CourseDetail } from "@/components/academy/course-detail"
import { Search, BookOpen, Plus } from "lucide-react"

export function ExlAcademy() {
  const { courses, loading, isConfigured } = useAcademy()
  const { isAdmin } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (selectedCourse) {
    return <CourseDetail courseId={selectedCourse} onBack={() => setSelectedCourse(null)} />
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <BookOpen className="h-12 w-12 text-[#BBF717]" />
          <h1 className="text-4xl font-bold">EXL Academy</h1>
        </div>
        <p className="text-xl text-gray-400">Aprenda com os melhores cursos de trading e análise técnica</p>
      </div>

      {/* Supabase Configuration Warning */}
      {!isConfigured && (
        <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-yellow-400">Modo Demonstração</h4>
              <p className="text-sm text-yellow-300">
                Configure o Supabase para funcionalidade completa. Atualmente exibindo dados de exemplo.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Admin Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar cursos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-[#2A2B2A] border-[#555] text-white"
          />
        </div>

        {isAdmin && (
          <Button
            onClick={() => {
              /* TODO: Open create course modal */
            }}
            className="bg-[#BBF717] text-black hover:bg-[#9FD615]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Curso
          </Button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#BBF717] mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando cursos...</p>
        </div>
      )}

      {/* Courses Grid */}
      {!loading && (
        <>
          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} onClick={() => setSelectedCourse(course.id)} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">
                {searchTerm ? "Nenhum curso encontrado" : "Nenhum curso disponível"}
              </h3>
              <p className="text-gray-500">
                {searchTerm ? "Tente buscar com outros termos" : "Novos cursos serão adicionados em breve"}
              </p>
            </div>
          )}
        </>
      )}

      {/* Academy Info */}
      <div className="mt-16 bg-[#1C1C1C] p-8 rounded-lg border border-[#2C2C2C]">
        <h2 className="text-2xl font-bold text-[#BBF717] mb-4">Sobre a EXL Academy</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#BBF717] rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-black" />
            </div>
            <h3 className="font-semibold text-white mb-2">Conteúdo Exclusivo</h3>
            <p className="text-gray-400 text-sm">
              Cursos desenvolvidos por traders profissionais com anos de experiência no mercado
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-[#4ECDC4] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-white mb-2">Aprendizado Rápido</h3>
            <p className="text-gray-400 text-sm">
              Metodologia focada em resultados práticos e aplicação imediata no trading
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-[#FF6B6B] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-white mb-2">Certificação</h3>
            <p className="text-gray-400 text-sm">Receba certificados de conclusão para comprovar seu conhecimento</p>
          </div>
        </div>
      </div>
    </div>
  )
}
