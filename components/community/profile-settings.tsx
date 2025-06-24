"use client";

import { PushNotificationSetup } from "@/components/pwa/push-notification-setup";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import {
  AlertTriangle,
  Camera,
  CheckCircle,
  Mail,
  Save,
  Upload,
  User,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export function ProfileSettings() {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    experience: user?.experience || "",
    avatar_url: user?.avatar_url || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Detectar mudanças no perfil
  useEffect(() => {
    const hasChanges =
      formData.name !== (user?.name || "") ||
      formData.phone !== (user?.phone || "") ||
      formData.experience !== (user?.experience || "") ||
      formData.avatar_url !== (user?.avatar_url || "");

    setHasUnsavedChanges(hasChanges);
  }, [formData, user]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getExperienceLabel = (experience: string) => {
    const labels: Record<string, string> = {
      iniciante: "Iniciante (0-1 ano)",
      intermediario: "Intermediário (1-3 anos)",
      avancado: "Avançado (3-5 anos)",
      profissional: "Profissional (5+ anos)",
    };
    return labels[experience] || experience;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  };

  // Validar arquivo de imagem
  const validateImageFile = (file: File): string | null => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return "Tipo de arquivo não suportado. Use apenas JPG, JPEG, PNG ou WEBP.";
    }

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return "Arquivo muito grande. O tamanho máximo é 2MB.";
    }

    return null;
  };

  // Upload de avatar
  const handleAvatarUpload = async (file: File) => {
    if (!user) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsUploadingAvatar(true);
    try {
      if (isSupabaseConfigured && supabase) {
        // Deletar avatar anterior se existir
        if (user.avatar_url && user.avatar_url.includes("/avatares/")) {
          const oldPath = user.avatar_url.split("/avatares/")[1];
          if (oldPath) {
            await supabase.storage.from("avatares").remove([oldPath]);
          }
        }

        // Fazer upload do novo avatar
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/avatar.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("avatares")
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: true, // Permitir sobrescrever
          });

        if (uploadError) {
          throw new Error(uploadError.message);
        }

        // Obter URL pública da imagem
        const { data } = supabase.storage
          .from("avatares")
          .getPublicUrl(fileName);

        const avatarUrl = data.publicUrl;

        // Atualizar formData
        setFormData((prev) => ({ ...prev, avatar_url: avatarUrl }));

        toast.success("Avatar atualizado com sucesso!");
      } else {
        // Fallback para localStorage
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          setFormData((prev) => ({ ...prev, avatar_url: dataUrl }));
          toast.success("Avatar atualizado com sucesso!");
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error("Erro no upload do avatar:", error);
      toast.error("Erro ao fazer upload do avatar. Tente novamente.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Remover avatar
  const handleRemoveAvatar = async () => {
    if (!user) return;

    try {
      if (
        isSupabaseConfigured &&
        supabase &&
        user.avatar_url &&
        user.avatar_url.includes("/avatares/")
      ) {
        const avatarPath = user.avatar_url.split("/avatares/")[1];
        if (avatarPath) {
          await supabase.storage.from("avatares").remove([avatarPath]);
        }
      }

      setFormData((prev) => ({ ...prev, avatar_url: "" }));
      toast.success("Avatar removido com sucesso!");
    } catch (error) {
      console.error("Erro ao remover avatar:", error);
      toast.error("Erro ao remover avatar. Tente novamente.");
    }
  };

  const validateProfileForm = () => {
    if (!formData.name.trim()) {
      toast.error("Nome é obrigatório");
      return false;
    }

    if (formData.phone && !/^[\d\s\-\(\)\+]+$/.test(formData.phone)) {
      toast.error("Formato de telefone inválido");
      return false;
    }

    return true;
  };

  const validatePasswordForm = () => {
    if (!passwordData.currentPassword) {
      toast.error("Senha atual é obrigatória");
      return false;
    }

    if (!passwordData.newPassword) {
      toast.error("Nova senha é obrigatória");
      return false;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Nova senha deve ter pelo menos 6 caracteres");
      return false;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Confirmação de senha não confere");
      return false;
    }

    return true;
  };

  const handleSaveProfile = async () => {
    if (!validateProfileForm()) return;

    setIsSaving(true);
    try {
      if (isSupabaseConfigured && supabase && user) {
        // Atualizar no banco de dados
        const { error } = await supabase
          .from("profiles")
          .update({
            name: formData.name.trim(),
            phone: formData.phone.trim() || null,
            experience: formData.experience,
            avatar_url: formData.avatar_url || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (error) {
          toast.error("Erro ao salvar alterações");
          console.error("Error updating profile:", error);
          return;
        }

        // Atualizar o contexto de autenticação
        await updateUser(user.id, {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          experience: formData.experience,
          avatar_url: formData.avatar_url,
        });

        toast.success("Perfil atualizado com sucesso!");
        setHasUnsavedChanges(false);
      } else {
        // Fallback para localStorage
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        const userIndex = users.findIndex((u: any) => u.id === user?.id);

        if (userIndex !== -1) {
          users[userIndex] = {
            ...users[userIndex],
            name: formData.name.trim(),
            phone: formData.phone.trim(),
            experience: formData.experience,
            avatar_url: formData.avatar_url,
          };
          localStorage.setItem("users", JSON.stringify(users));

          // Atualizar usuário atual
          const currentUser = { ...user, ...formData };
          localStorage.setItem("currentUser", JSON.stringify(currentUser));

          toast.success("Perfil atualizado com sucesso!");
          setHasUnsavedChanges(false);
        }
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Erro inesperado ao salvar");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) return;

    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        // Atualizar senha no Supabase
        const { error } = await supabase.auth.updateUser({
          password: passwordData.newPassword,
        });

        if (error) {
          toast.error("Erro ao alterar senha: " + error.message);
          return;
        }

        toast.success("Senha alterada com sucesso!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        // Fallback para localStorage
        const passwords = JSON.parse(localStorage.getItem("passwords") || "{}");

        if (passwords[user?.email || ""] !== passwordData.currentPassword) {
          toast.error("Senha atual incorreta");
          return;
        }

        passwords[user?.email || ""] = passwordData.newPassword;
        localStorage.setItem("passwords", JSON.stringify(passwords));

        toast.success("Senha alterada com sucesso!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Erro inesperado ao alterar senha");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscardChanges = () => {
    setFormData({
      name: user?.name || "",
      phone: user?.phone || "",
      experience: user?.experience || "",
      avatar_url: user?.avatar_url || "",
    });
    setHasUnsavedChanges(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-3 sm:space-y-4 px-3 sm:px-0">
      {/* Aviso de mudanças não salvas */}
      {hasUnsavedChanges && (
        <Card className="bg-yellow-500/10 border-yellow-500">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 flex-shrink-0" />
                <span className="text-yellow-400 font-medium text-sm sm:text-base">
                  Você tem alterações não salvas
                </span>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button
                  onClick={handleDiscardChanges}
                  variant="outline"
                  size="sm"
                  className="border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-black text-xs sm:text-sm"
                >
                  Descartar
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  size="sm"
                  className="bg-yellow-500 text-black hover:bg-yellow-600 text-xs sm:text-sm"
                >
                  <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  {isSaving ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Avatar e Foto de Perfil */}
      <Card className="bg-[#1C1C1C] border-[#2C2C2C]">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-white text-base sm:text-lg">
            <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
            Foto de Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="relative flex-shrink-0">
              <Avatar className="w-20 h-20 sm:w-24 sm:h-24">
                <AvatarImage
                  src={formData.avatar_url || "/placeholder-user.jpg"}
                  alt="Avatar do usuário"
                />
                <AvatarFallback className="bg-[#BBF717] text-black text-lg sm:text-xl font-bold">
                  {getInitials(user?.name || "")}
                </AvatarFallback>
              </Avatar>
              {isUploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-3 text-center sm:text-left">
              <p className="text-gray-300 text-xs sm:text-sm">
                Escolha uma imagem para seu perfil. Recomendamos uma foto
                quadrada com pelo menos 200x200 pixels.
              </p>

              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleAvatarUpload(file);
                  }}
                  ref={fileInputRef}
                  className="hidden"
                />

                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="bg-[#BBF717] text-black hover:bg-[#9FD615] text-xs sm:text-sm w-full sm:w-auto"
                  size="sm"
                >
                  <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  {isUploadingAvatar ? "Carregando..." : "Carregar Foto"}
                </Button>

                {formData.avatar_url && (
                  <Button
                    onClick={handleRemoveAvatar}
                    variant="outline"
                    size="sm"
                    className="bg-red-500 text-white hover:bg-red-600 text-xs sm:text-sm w-full sm:w-auto"
                  >
                    <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Remover
                  </Button>
                )}
              </div>

              <p className="text-xs text-gray-500">
                Formatos aceitos: JPG, JPEG, PNG, WEBP. Tamanho máximo: 2MB.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações Pessoais */}
      <Card className="bg-[#1C1C1C] border-[#2C2C2C]">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-white text-base sm:text-lg">
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
            Informações Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
              Nome Completo
            </label>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Seu nome completo"
              className="bg-[#2A2B2A] border-[#555] text-white placeholder:text-gray-500 text-sm sm:text-base h-10 sm:h-11"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
              Email
            </label>
            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-[#2A2B2A] border border-[#555] rounded-md">
              <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
              <span className="text-gray-400 text-sm sm:text-base truncate flex-1">
                {user?.email}
              </span>
              <span className="text-xs text-gray-500 flex-shrink-0">
                (não editável)
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
              Telefone
            </label>
            <Input
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="(11) 99999-9999"
              className="bg-[#2A2B2A] border-[#555] text-white placeholder:text-gray-500 text-sm sm:text-base h-10 sm:h-11"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
              Experiência em Trading
            </label>
            <Select
              value={formData.experience}
              onValueChange={(value) => handleInputChange("experience", value)}
            >
              <SelectTrigger className="bg-[#2A2B2A] border-[#555] text-white h-10 sm:h-11 text-sm sm:text-base">
                <SelectValue placeholder="Selecione sua experiência" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="iniciante">Iniciante (0-1 ano)</SelectItem>
                <SelectItem value="intermediario">
                  Intermediário (1-3 anos)
                </SelectItem>
                <SelectItem value="avancado">Avançado (3-5 anos)</SelectItem>
                <SelectItem value="profissional">
                  Profissional (5+ anos)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Status da Conta */}
      <Card className="bg-[#1C1C1C] border-[#2C2C2C]">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-white text-base sm:text-lg">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            Status da Conta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-300 text-sm sm:text-base">Status:</span>
            <span className="text-green-400 font-medium text-sm sm:text-base">
              Conta Aprovada
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300 text-sm sm:text-base">
              Tipo de Conta:
            </span>
            <span className="text-blue-400 font-medium text-sm sm:text-base">
              {user?.role === "admin" ? "Administrador" : "Usuário"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300 text-sm sm:text-base">
              Membro desde:
            </span>
            <span className="text-gray-400 text-sm sm:text-base">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("pt-BR")
                : "N/A"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Notificações Push */}
      <PushNotificationSetup />
    </div>
  );
}
