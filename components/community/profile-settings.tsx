"use client";

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
import { AlertTriangle, CheckCircle, Mail, Save, User } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export function ProfileSettings() {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    experience: user?.experience || "",
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
      formData.experience !== (user?.experience || "");

    setHasUnsavedChanges(hasChanges);
  }, [formData, user]);

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
    });
    setHasUnsavedChanges(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Aviso de mudanças não salvas */}
      {hasUnsavedChanges && (
        <Card className="bg-yellow-500/10 border-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-medium">
                  Você tem alterações não salvas
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleDiscardChanges}
                  variant="outline"
                  size="sm"
                  className="border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-black"
                >
                  Descartar
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  size="sm"
                  className="bg-yellow-500 text-black hover:bg-yellow-600"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informações Pessoais */}
      <Card className="bg-[#1C1C1C] border-[#2C2C2C]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <User className="w-5 h-5" />
            Informações Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nome Completo
            </label>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Seu nome completo"
              className="bg-[#2A2B2A] border-[#555] text-white placeholder:text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <div className="flex items-center gap-3 p-3 bg-[#2A2B2A] border border-[#555] rounded-md">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400">{user?.email}</span>
              <span className="text-xs text-gray-500">(não editável)</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Telefone
            </label>
            <Input
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="(11) 99999-9999"
              className="bg-[#2A2B2A] border-[#555] text-white placeholder:text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Experiência em Trading
            </label>
            <Select
              value={formData.experience}
              onValueChange={(value) => handleInputChange("experience", value)}
            >
              <SelectTrigger className="bg-[#2A2B2A] border-[#555] text-white">
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
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <CheckCircle className="w-5 h-5" />
            Status da Conta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Status:</span>
            <span className="text-green-400 font-medium">Conta Aprovada</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Tipo de Conta:</span>
            <span className="text-blue-400 font-medium">
              {user?.role === "admin" ? "Administrador" : "Usuário"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Membro desde:</span>
            <span className="text-gray-400">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("pt-BR")
                : "N/A"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
