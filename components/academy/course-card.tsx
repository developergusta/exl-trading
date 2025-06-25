"use client";

import { AlertDialog } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAcademy } from "@/hooks/use-academy";
import { useAuth } from "@/hooks/use-auth";
import {
  BookOpen,
  Clock,
  Edit2,
  MoreVertical,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Course {
  id: string;
  title: string;
  description?: string;
  cover_image_url?: string;
  instructor_name?: string;
  category: string;
  level: string;
  duration_hours: number;
  price: number;
  is_free: boolean;
  is_active: boolean;
  is_featured: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface CourseCardProps {
  course: Course;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function CourseCard({
  course,
  onClick,
  onEdit,
  onDelete,
}: CourseCardProps) {
  const { isAdmin } = useAuth();
  const { deleteCourse, refreshCourses } = useAcademy();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fechar menu quando clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMobileMenu(false);
      }
    }

    if (showMobileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showMobileMenu]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const success = await deleteCourse(course.id);
      if (success) {
        await refreshCourses();
        onDelete?.();
      } else {
        alert("Erro ao excluir curso. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao excluir curso:", error);
      alert("Erro ao excluir curso. Tente novamente.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditClick = () => {
    console.log("🔧 Botão Editar clicado");
    setShowMobileMenu(false);
    onEdit?.();
  };

  const handleDeleteClickMobile = () => {
    console.log("🗑️ Botão Excluir clicado");
    setShowMobileMenu(false);
    setShowDeleteDialog(true);
  };

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("📱 Menu toggle clicado, estado atual:", showMobileMenu);
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <Card className="bg-[#1C1C1C] border-[#2C2C2C] hover:border-[#BBF717] transition-all duration-300 cursor-pointer group relative">
      {/* Admin Actions - Desktop (hover) */}
      {isAdmin && (
        <div className="hidden md:block absolute top-4 left-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white h-8 w-8 p-0"
            >
              <Edit2 className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteDialog(true);
              }}
              className="bg-red-600 hover:bg-red-700 text-white h-8 w-8 p-0"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Admin Actions - Mobile (sempre visível) */}
      {isAdmin && (
        <div className="md:hidden absolute top-4 right-4 z-30" ref={menuRef}>
          <div className="relative">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleMenuToggle}
              className="bg-black/70 hover:bg-black/90 text-white h-8 w-8 p-0 rounded-full"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>

            {/* Menu Mobile */}
            {showMobileMenu && (
              <div className="absolute top-10 right-0 bg-[#2C2C2C] border border-[#3C3C3C] rounded-lg shadow-lg py-2 w-36 z-40">
                <button
                  onClick={handleEditClick}
                  className="w-full px-4 py-2 text-left text-white hover:bg-[#3C3C3C] flex items-center gap-2 text-sm transition-colors"
                >
                  <Edit2 className="h-3 w-3" />
                  Editar
                </button>
                <button
                  onClick={handleDeleteClickMobile}
                  className="w-full px-4 py-2 text-left text-red-400 hover:bg-[#3C3C3C] flex items-center gap-2 text-sm transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                  Excluir
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div onClick={onClick}>
        <CardHeader className="p-0">
          <div className="relative h-48 bg-gradient-to-br from-[#BBF717] to-[#9FD615] rounded-t-lg overflow-hidden">
            {course.cover_image_url ? (
              <img
                src={course.cover_image_url || "/placeholder.svg"}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="h-16 w-16 text-black opacity-80" />
              </div>
            )}
            <div className="absolute top-4 left-4">
              <Badge className="bg-black/50 text-white border-none">
                Curso
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <CardTitle className="text-white group-hover:text-[#BBF717] transition-colors mb-2">
            {course.title}
          </CardTitle>
          <CardDescription className="text-gray-400 mb-4 line-clamp-2">
            {course.description || "Descrição não disponível"}
          </CardDescription>

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{course.duration_hours || 2}h</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span className="capitalize">
                {course.level || "Todos os níveis"}
              </span>
            </div>
          </div>
        </CardContent>
      </div>

      <div className="px-6 pb-6">
        <Button
          onClick={onClick}
          className="w-full bg-[#BBF717] text-black hover:bg-[#9FD615] font-bold"
        >
          Acessar Curso
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Excluir Curso"
        description={`Tem certeza que deseja excluir o curso "${course.title}"? Esta ação não pode ser desfeita.`}
        confirmText={isDeleting ? "Excluindo..." : "Excluir"}
        cancelText="Cancelar"
        variant="danger"
        onConfirm={handleDelete}
      />
    </Card>
  );
}
