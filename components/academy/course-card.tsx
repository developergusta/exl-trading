"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Clock, Users } from "lucide-react"
import type { Database } from "@/lib/supabase"

type Course = Database["public"]["Tables"]["courses"]["Row"]

interface CourseCardProps {
  course: Course
  onClick: () => void
}

export function CourseCard({ course, onClick }: CourseCardProps) {
  return (
    <Card className="bg-[#1C1C1C] border-[#2C2C2C] hover:border-[#BBF717] transition-all duration-300 cursor-pointer group">
      <div onClick={onClick}>
        <CardHeader className="p-0">
          <div className="relative h-48 bg-gradient-to-br from-[#BBF717] to-[#9FD615] rounded-t-lg overflow-hidden">
            {course.logo_url ? (
              <img
                src={course.logo_url || "/placeholder.svg"}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="h-16 w-16 text-black opacity-80" />
              </div>
            )}
            <div className="absolute top-4 right-4">
              <Badge className="bg-black/50 text-white border-none">Curso</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <CardTitle className="text-white group-hover:text-[#BBF717] transition-colors mb-2">{course.title}</CardTitle>
          <CardDescription className="text-gray-400 mb-4 line-clamp-2">
            {course.description || "Descrição não disponível"}
          </CardDescription>

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>2-4h</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>Todos os níveis</span>
            </div>
          </div>
        </CardContent>
      </div>

      <div className="px-6 pb-6">
        <Button onClick={onClick} className="w-full bg-[#BBF717] text-black hover:bg-[#9FD615] font-bold">
          Acessar Curso
        </Button>
      </div>
    </Card>
  )
}
