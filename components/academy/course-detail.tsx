"use client";

import { ContentForm } from "@/components/academy/content-form";
import { ContentItem } from "@/components/academy/content-item";
import { CourseForm } from "@/components/academy/course-form";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAcademy } from "@/hooks/use-academy";
import { useAuth } from "@/hooks/use-auth";
import type { Database } from "@/lib/supabase";
import {
  ArrowLeft,
  BookOpen,
  Edit2,
  MoreVertical,
  Plus,
  Settings,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface CourseData {
  id: string;
  title: string;
  description?: string | null;
  cover_image_url?: string | null;
  instructor_name?: string | null;
  instructor_bio?: string | null;
  instructor_avatar_url?: string | null;
  category?: string | null;
  level?: string | null;
  duration_hours?: number | null;
  price?: number | null;
  is_free?: boolean | null;
  is_active: boolean;
  is_featured?: boolean | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

type CourseContent = Database["public"]["Tables"]["course_content"]["Row"];

interface CourseDetailProps {
  courseId: string;
  onBack: () => void;
}

export function CourseDetail({ courseId, onBack }: CourseDetailProps) {
  const { getCourseById, getCourseContent, deleteContent, refreshCourses } =
    useAcademy();
  const { isAdmin } = useAuth();
  const [course, setCourse] = useState<CourseData | null>(null);
  const [content, setContent] = useState<CourseContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<CourseContent | null>(
    null
  );
  const [showContentForm, setShowContentForm] = useState(false);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingContent, setEditingContent] = useState<CourseContent | null>(
    null
  );
  const [showDeleteContentDialog, setShowDeleteContentDialog] = useState(false);
  const [deletingContent, setDeletingContent] = useState<CourseContent | null>(
    null
  );
  const [isDeletingContent, setIsDeletingContent] = useState(false);
  const [activeContentMenu, setActiveContentMenu] = useState<string | null>(
    null
  );
  const menuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Fechar menu quando clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (activeContentMenu) {
        const menuElement = menuRefs.current[activeContentMenu];
        if (menuElement && !menuElement.contains(event.target as Node)) {
          setActiveContentMenu(null);
        }
      }
    }

    if (activeContentMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [activeContentMenu]);

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const loadCourseData = async () => {
    setLoading(true);
    try {
      const [courseData, contentData] = await Promise.all([
        getCourseById(courseId),
        getCourseContent(courseId),
      ]);

      setCourse(courseData as any);
      setContent(contentData as any);
    } catch (error) {
      console.error("Erro ao carregar dados do curso:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleContentCreated = () => {
    loadCourseData(); // Recarrega os dados do curso para mostrar o novo conteúdo
  };

  const handleEditCourse = () => {
    setShowCourseForm(true);
  };

  const handleEditContent = (content: CourseContent) => {
    console.log("🔧 Editando conteúdo:", content.title);
    setEditingContent(content);
    setShowContentForm(true);
    setActiveContentMenu(null);
  };

  const handleDeleteContent = async (contentItem: CourseContent) => {
    console.log("🗑️ Excluindo conteúdo:", contentItem.title);
    setDeletingContent(contentItem);
    setShowDeleteContentDialog(true);
    setActiveContentMenu(null);
  };

  const confirmDeleteContent = async () => {
    if (!deletingContent) return;

    setIsDeletingContent(true);
    try {
      const success = await deleteContent(deletingContent.id);
      if (success) {
        await loadCourseData();
        // Se o conteúdo excluído estava selecionado, limpar a seleção
        if (selectedContent?.id === deletingContent.id) {
          setSelectedContent(null);
        }
      } else {
        alert("Erro ao excluir conteúdo. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao excluir conteúdo:", error);
      alert("Erro ao excluir conteúdo. Tente novamente.");
    } finally {
      setIsDeletingContent(false);
      setShowDeleteContentDialog(false);
      setDeletingContent(null);
    }
  };

  const handleCourseUpdated = () => {
    setShowCourseForm(false);
    loadCourseData();
  };

  const handleContentFormClose = () => {
    setShowContentForm(false);
    setEditingContent(null);
  };

  const toggleContentMenu = (contentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("📱 Toggle menu para conteúdo:", contentId);
    setActiveContentMenu(activeContentMenu === contentId ? null : contentId);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#BBF717] mx-auto mb-4"></div>
        <p className="text-gray-400">Carregando curso...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-white mb-2">
          Curso não encontrado
        </h3>
        <Button
          onClick={onBack}
          className="bg-[#BBF717] text-black hover:bg-[#9FD615]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <Button
          onClick={onBack}
          className="bg-[#1C1C1C] text-[#BBF717] hover:bg-[#2C2C2C]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar aos Cursos
        </Button>

        {isAdmin && (
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              onClick={() => setShowContentForm(true)}
              className="bg-[#BBF717] text-black hover:bg-[#9FD615]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Conteúdo
            </Button>
            <Button
              onClick={handleEditCourse}
              variant="outline"
              className="border-[#555] text-white bg-[#2C2C2C] hover:bg-[#3C3C3C]"
            >
              <Settings className="w-4 h-4 mr-2" />
              Editar Curso
            </Button>
          </div>
        )}
      </div>

      {/* Course Header */}
      <Card className="bg-[#1C1C1C] border-[#2C2C2C] mb-8">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-48 h-48 bg-gradient-to-br from-[#BBF717] to-[#9FD615] rounded-lg overflow-hidden flex-shrink-0">
              {course.cover_image_url ? (
                <img
                  src={course.cover_image_url || "/placeholder.svg"}
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
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                {course.title}
              </h1>
              <p className="text-gray-300 text-base sm:text-lg mb-6">
                {course.description || "Descrição não disponível"}
              </p>

              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{content.length} aulas</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📅</span>
                  <span>
                    Criado em{" "}
                    {new Date(course.created_at).toLocaleDateString("pt-BR")}
                  </span>
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
                      className={`relative p-4 cursor-pointer hover:bg-[#2A2B2A] transition-colors border-l-4 ${
                        selectedContent?.id === item.id
                          ? "border-[#BBF717] bg-[#2A2B2A]"
                          : "border-transparent"
                      }`}
                    >
                      {/* Admin Actions for Content - Desktop (hover) */}
                      {isAdmin && (
                        <div className="hidden md:group-hover:flex absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditContent(item);
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white h-6 w-6 p-0"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteContent(item);
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white h-6 w-6 p-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Admin Actions for Content - Mobile (sempre visível) */}
                      {isAdmin && (
                        <div
                          className="md:hidden absolute top-2 right-2 z-30"
                          ref={(el) => {
                            if (el) menuRefs.current[item.id] = el;
                          }}
                        >
                          <div className="relative">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={(e) => toggleContentMenu(item.id, e)}
                              className="bg-black/70 hover:bg-black/90 text-white h-6 w-6 p-0 rounded-full"
                            >
                              <MoreVertical className="h-3 w-3" />
                            </Button>

                            {/* Menu Mobile */}
                            {activeContentMenu === item.id && (
                              <div className="absolute top-8 right-0 bg-[#2C2C2C] border border-[#3C3C3C] rounded-lg shadow-lg py-2 w-32 z-40">
                                <button
                                  onClick={() => handleEditContent(item)}
                                  className="w-full px-3 py-2 text-left text-white hover:bg-[#3C3C3C] flex items-center gap-2 text-xs transition-colors"
                                >
                                  <Edit2 className="h-3 w-3" />
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleDeleteContent(item)}
                                  className="w-full px-3 py-2 text-left text-red-400 hover:bg-[#3C3C3C] flex items-center gap-2 text-xs transition-colors"
                                >
                                  <Trash2 className="h-3 w-3" />
                                  Excluir
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div
                        className="flex items-center gap-3"
                        onClick={() => setSelectedContent(item)}
                      >
                        <div className="w-8 h-8 bg-[#BBF717] rounded-full flex items-center justify-center text-black font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1 pr-8">
                          <h4 className="font-medium text-white text-sm">
                            {item.title}
                          </h4>
                          <p className="text-xs text-gray-400 capitalize">
                            {item.content_type}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-white font-medium mb-2">
                    Nenhum conteúdo adicionado
                  </h4>
                  <p className="text-gray-500 text-sm mb-4">
                    Este curso ainda não possui conteúdo
                  </p>
                  {isAdmin && (
                    <Button
                      onClick={() => setShowContentForm(true)}
                      className="bg-[#BBF717] text-black hover:bg-[#9FD615] text-sm"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Adicionar Primeiro Conteúdo
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Content Display */}
        <div className="lg:col-span-2">
          {selectedContent ? (
            <ContentItem content={selectedContent} />
          ) : (
            <Card className="bg-[#1C1C1C] border-[#2C2C2C] h-96">
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">
                    Selecione um conteúdo
                  </h3>
                  <p className="text-gray-500">
                    Escolha um conteúdo da lista para visualizar
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Content Form Modal */}
      {showContentForm && (
        <ContentForm
          isOpen={showContentForm}
          onClose={handleContentFormClose}
          courseId={courseId}
          content={editingContent}
          onContentCreated={handleContentCreated}
        />
      )}

      {/* Course Form Modal */}
      {showCourseForm && (
        <CourseForm
          isOpen={showCourseForm}
          onClose={() => setShowCourseForm(false)}
          course={course as any}
          onSave={handleCourseUpdated}
        />
      )}

      {/* Delete Content Confirmation Dialog */}
      <AlertDialog
        open={showDeleteContentDialog}
        onOpenChange={setShowDeleteContentDialog}
        title="Excluir Conteúdo"
        description={`Tem certeza que deseja excluir o conteúdo "${deletingContent?.title}"? Esta ação não pode ser desfeita.`}
        confirmText={isDeletingContent ? "Excluindo..." : "Excluir"}
        cancelText="Cancelar"
        variant="danger"
        onConfirm={confirmDeleteContent}
      />
    </div>
  );
}
