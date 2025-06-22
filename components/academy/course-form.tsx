"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAcademy } from "@/hooks/use-academy";
import { useAuth } from "@/hooks/use-auth";
import { AlertCircle, Loader2, Upload, X } from "lucide-react";
import { useState } from "react";

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

interface CourseFormProps {
  isOpen: boolean;
  onClose: () => void;
  course?: Course | null;
  onSave?: () => void;
}

export function CourseForm({
  isOpen,
  onClose,
  course,
  onSave,
}: CourseFormProps) {
  const { createCourse, updateCourse, uploadFile } = useAcademy();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: course?.title || "",
    description: course?.description || "",
    instructor_name: course?.instructor_name || "",
    instructor_bio: course?.instructor_bio || "",
    category: course?.category || ("trading" as Course["category"]),
    level: course?.level || ("iniciante" as Course["level"]),
    duration_hours: course?.duration_hours || 0,
    price: course?.price || 0,
    is_free: course?.is_free ?? true,
    is_featured: course?.is_featured || false,
    cover_image_url: course?.cover_image_url || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const courseData = {
        ...formData,
        created_by: user.id,
        is_active: true,
      };

      console.log("📝 Dados do curso a serem salvos:", courseData);
      console.log("🖼️ URL da imagem de capa:", courseData.cover_image_url);

      if (course) {
        console.log("✏️ Atualizando curso existente:", course.id);
        await updateCourse(course.id, courseData);
      } else {
        console.log("🆕 Criando novo curso");
        const newCourse = await createCourse(courseData);
        console.log("✅ Curso criado:", newCourse);
      }

      onSave?.();
      onClose();
    } catch (error) {
      console.error("❌ Erro ao salvar curso:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateFile = (file: File): string | null => {
    // Validar tipo de arquivo
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return "Tipo de arquivo não suportado. Use apenas JPG, JPEG, PNG ou WEBP.";
    }

    // Validar tamanho do arquivo (5MB máximo)
    const maxSize = 5 * 1024 * 1024; // 5MB em bytes
    if (file.size > maxSize) {
      return "Arquivo muito grande. O tamanho máximo é 5MB.";
    }

    return null;
  };

  const handleImageUpload = async (file: File) => {
    // Limpar erros anteriores
    setUploadError(null);
    console.log(
      "🔄 Iniciando upload da imagem:",
      file.name,
      "Tamanho:",
      file.size,
      "Tipo:",
      file.type
    );

    // Validar arquivo
    const validationError = validateFile(file);
    if (validationError) {
      console.error("❌ Erro de validação:", validationError);
      setUploadError(validationError);
      return;
    }

    setUploadingImage(true);
    try {
      const fileName = `courses/${Date.now()}-${file.name}`;
      console.log("📤 Fazendo upload para:", fileName);

      const url = await uploadFile(file, "academy", fileName);
      console.log("📤 Resultado do upload:", url);

      if (url) {
        setFormData((prev) => ({ ...prev, cover_image_url: url }));
        setUploadError(null);
        console.log("✅ Upload concluído com sucesso. URL:", url);
      } else {
        console.error("❌ Upload falhou - URL vazia");
        setUploadError("Erro ao fazer upload da imagem. Tente novamente.");
      }
    } catch (error) {
      console.error("❌ Erro no upload:", error);
      setUploadError("Erro ao fazer upload da imagem. Tente novamente.");
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#1C1C1C] border-[#2C2C2C]">
        <DialogHeader>
          <DialogTitle className="text-white flex justify-between items-center">
            {course ? "Editar Curso" : "Novo Curso"}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#BBF717]">
              Informações Básicas
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Título do Curso *
              </label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Ex: Fundamentos do Trading"
                required
                className="bg-[#2A2B2A] border-[#555] text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Descrição
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Descreva o que os alunos vão aprender..."
                rows={3}
                className="bg-[#2A2B2A] border-[#555] text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Categoria *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value as Course["category"],
                    }))
                  }
                  className="w-full px-3 py-2 bg-[#2A2B2A] border border-[#555] rounded-md text-white"
                  required
                >
                  <option value="trading">Trading</option>
                  <option value="analise-tecnica">Análise Técnica</option>
                  <option value="psicologia">Psicologia</option>
                  <option value="gestao-risco">Gestão de Risco</option>
                  <option value="outros">Outros</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nível *
                </label>
                <select
                  value={formData.level}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      level: e.target.value as Course["level"],
                    }))
                  }
                  className="w-full px-3 py-2 bg-[#2A2B2A] border border-[#555] rounded-md text-white"
                  required
                >
                  <option value="iniciante">Iniciante</option>
                  <option value="intermediario">Intermediário</option>
                  <option value="avancado">Avançado</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Duração (horas)
                </label>
                <Input
                  type="number"
                  value={formData.duration_hours}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      duration_hours: parseInt(e.target.value) || 0,
                    }))
                  }
                  placeholder="0"
                  min="0"
                  className="bg-[#2A2B2A] border-[#555] text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Preço (R$)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      price: parseFloat(e.target.value) || 0,
                      is_free: parseFloat(e.target.value) === 0,
                    }))
                  }
                  placeholder="0.00"
                  min="0"
                  className="bg-[#2A2B2A] border-[#555] text-white"
                />
              </div>
            </div>
          </div>

          {/* Instrutor */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#BBF717]">Instrutor</h3>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nome do Instrutor
              </label>
              <Input
                value={formData.instructor_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    instructor_name: e.target.value,
                  }))
                }
                placeholder="Nome do instrutor"
                className="bg-[#2A2B2A] border-[#555] text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Biografia do Instrutor
              </label>
              <Textarea
                value={formData.instructor_bio}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    instructor_bio: e.target.value,
                  }))
                }
                placeholder="Experiência e qualificações do instrutor..."
                rows={3}
                className="bg-[#2A2B2A] border-[#555] text-white"
              />
            </div>
          </div>

          {/* Imagem de Capa */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#BBF717]">
              Imagem de Capa
            </h3>

            <div className="border-2 border-dashed border-[#555] rounded-lg p-6 text-center">
              {formData.cover_image_url ? (
                <div className="space-y-4">
                  <img
                    src={formData.cover_image_url}
                    alt="Capa do curso"
                    className="max-w-full h-48 object-cover rounded-lg mx-auto"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, cover_image_url: "" }))
                    }
                    className="border-[#555] text-gray-300 hover:bg-[#2A2B2A]"
                    disabled={uploadingImage}
                  >
                    Remover Imagem
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {uploadingImage ? (
                    <div className="flex flex-col items-center space-y-2">
                      <Loader2 className="h-12 w-12 text-[#BBF717] animate-spin" />
                      <p className="text-gray-300">
                        Fazendo upload da imagem...
                      </p>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-gray-300">
                          Faça upload da imagem de capa
                        </p>
                        <p className="text-sm text-gray-500">
                          PNG, JPG, JPEG, WEBP até 5MB
                        </p>
                      </div>
                    </>
                  )}

                  {uploadError && (
                    <div className="flex items-center justify-center space-x-2 text-red-400 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  <Input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                    className="bg-[#2A2B2A] border-[#555] text-white"
                    disabled={uploadingImage}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Configurações */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#BBF717]">
              Configurações
            </h3>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      is_featured: e.target.checked,
                    }))
                  }
                  className="rounded border-[#555] bg-[#2A2B2A] text-[#BBF717]"
                />
                <span className="text-gray-300">Curso em destaque</span>
              </label>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-[#2C2C2C]">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-[#555] text-gray-300 hover:bg-[#2A2B2A]"
              disabled={loading || uploadingImage}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.title || uploadingImage}
              className="bg-[#BBF717] text-black hover:bg-[#9FD615]"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Salvando...</span>
                </div>
              ) : course ? (
                "Atualizar"
              ) : (
                "Criar Curso"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
