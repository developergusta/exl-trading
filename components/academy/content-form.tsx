"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAcademy } from "@/hooks/use-academy";
import { Loader2, Youtube } from "lucide-react";
import { useEffect, useState } from "react";

interface CourseContent {
  id: string;
  course_id: string;
  title: string;
  description?: string | null;
  content_type: "youtube" | "pdf" | "download";
  content_url: string;
  youtube_video_id?: string | null;
  duration_minutes?: number | null;
  order_index: number;
  is_preview?: boolean | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ContentFormProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  content?: CourseContent | null;
  onContentCreated: () => void;
}

interface ContentFormData {
  title: string;
  description: string;
  content_type: "youtube" | "pdf" | "download";
  content_url: string;
  youtube_video_id: string;
  duration_minutes: number;
  order_index: number;
  is_preview: boolean;
}

export function ContentForm({
  isOpen,
  onClose,
  courseId,
  content,
  onContentCreated,
}: ContentFormProps) {
  const { createContent, updateContent } = useAcademy();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ContentFormData>({
    title: "",
    description: "",
    content_type: "youtube",
    content_url: "",
    youtube_video_id: "",
    duration_minutes: 0,
    order_index: 1,
    is_preview: false,
  });

  // Carrega os dados do conteúdo quando está editando
  useEffect(() => {
    if (content) {
      setFormData({
        title: content.title || "",
        description: content.description || "",
        content_type: content.content_type,
        content_url: content.content_url || "",
        youtube_video_id: content.youtube_video_id || "",
        duration_minutes: content.duration_minutes || 0,
        order_index: content.order_index || 1,
        is_preview: content.is_preview || false,
      });
    } else {
      resetForm();
    }
  }, [content]);

  const extractYouTubeVideoId = (url: string): string => {
    const regex =
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : "";
  };

  const handleUrlChange = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      content_url: url,
      youtube_video_id:
        formData.content_type === "youtube" ? extractYouTubeVideoId(url) : "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content_url.trim()) {
      alert("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    setIsSubmitting(true);

    try {
      const contentData = {
        course_id: courseId,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        content_type: formData.content_type,
        content_url: formData.content_url.trim(),
        youtube_video_id: formData.youtube_video_id || undefined,
        thumbnail_url: formData.youtube_video_id
          ? `https://img.youtube.com/vi/${formData.youtube_video_id}/maxresdefault.jpg`
          : undefined,
        duration_minutes: formData.duration_minutes,
        order_index: formData.order_index,
        is_preview: formData.is_preview,
        is_active: true,
      };

      let result;
      if (content) {
        // Editando conteúdo existente
        result = await updateContent(content.id, contentData);
      } else {
        // Criando novo conteúdo
        result = await createContent(contentData);
      }

      if (result) {
        onContentCreated();
        onClose();
        resetForm();
      } else {
        alert(
          `Erro ao ${
            content ? "atualizar" : "criar"
          } conteúdo. Tente novamente.`
        );
      }
    } catch (error) {
      console.error(
        `Erro ao ${content ? "atualizar" : "criar"} conteúdo:`,
        error
      );
      alert(
        `Erro ao ${content ? "atualizar" : "criar"} conteúdo. Tente novamente.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      content_type: "youtube",
      content_url: "",
      youtube_video_id: "",
      duration_minutes: 0,
      order_index: 1,
      is_preview: false,
    });
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] bg-[#1C1C1C] border-[#2C2C2C] text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            {content ? "Editar Conteúdo" : "Adicionar Conteúdo"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {content
              ? "Edite as informações do conteúdo"
              : "Adicione um novo conteúdo ao curso"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Título */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Título *</label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Ex: Introdução ao Day Trading"
              className="bg-[#2C2C2C] border-[#3C3C3C] text-white"
              required
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Descrição</label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Descrição opcional do conteúdo..."
              className="bg-[#2C2C2C] border-[#3C3C3C] text-white min-h-[80px]"
            />
          </div>

          {/* Tipo de Conteúdo */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              Tipo de Conteúdo *
            </label>
            <Select
              value={formData.content_type}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, content_type: value as any }))
              }
            >
              <SelectTrigger className="bg-[#2C2C2C] border-[#3C3C3C] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#2C2C2C] border-[#3C3C3C]">
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="download">Download</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* URL do Conteúdo */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              {formData.content_type === "youtube"
                ? "URL do YouTube *"
                : formData.content_type === "pdf"
                ? "URL do PDF *"
                : "URL do Arquivo *"}
            </label>
            <div className="relative">
              {formData.content_type === "youtube" && (
                <Youtube className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              )}
              <Input
                type="url"
                value={formData.content_url}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder={
                  formData.content_type === "youtube"
                    ? "https://www.youtube.com/watch?v=..."
                    : formData.content_type === "pdf"
                    ? "https://exemplo.com/arquivo.pdf"
                    : "https://exemplo.com/arquivo.zip"
                }
                className={`bg-[#2C2C2C] border-[#3C3C3C] text-white ${
                  formData.content_type === "youtube" ? "pl-10" : ""
                }`}
                required
              />
            </div>
            {formData.content_type === "youtube" &&
              formData.youtube_video_id && (
                <div className="text-xs text-green-400">
                  ✓ ID do vídeo: {formData.youtube_video_id}
                </div>
              )}
          </div>

          {/* Configurações Adicionais */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">
                Duração (minutos)
              </label>
              <Input
                type="number"
                min="0"
                value={formData.duration_minutes}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    duration_minutes: parseInt(e.target.value) || 0,
                  }))
                }
                placeholder="30"
                className="bg-[#2C2C2C] border-[#3C3C3C] text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Ordem</label>
              <Input
                type="number"
                min="1"
                value={formData.order_index}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    order_index: parseInt(e.target.value) || 1,
                  }))
                }
                placeholder="1"
                className="bg-[#2C2C2C] border-[#3C3C3C] text-white"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_preview"
              checked={formData.is_preview}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  is_preview: e.target.checked,
                }))
              }
              className="w-4 h-4 text-[#BBF717] bg-[#2C2C2C] border-[#3C3C3C] rounded focus:ring-[#BBF717]"
            />
            <label
              htmlFor="is_preview"
              className="text-sm font-medium text-white"
            >
              Permitir preview gratuito
            </label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="bg-[#2A2B2A] text-white hover:bg-[#3A3B3A] border-[#555]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#BBF717] text-black hover:bg-[#9FD615]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {content ? "Atualizando..." : "Criando..."}
                </>
              ) : content ? (
                "Atualizar Conteúdo"
              ) : (
                "Criar Conteúdo"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
