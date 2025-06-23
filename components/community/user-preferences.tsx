"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/hooks/use-settings";
import {
  AlertTriangle,
  Bell,
  Globe,
  Monitor,
  Moon,
  Palette,
  Save,
  Settings,
  Sun,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useState } from "react";

export function UserPreferences() {
  const { userPreferences, updateUserPreference, isLoadingUserPreferences } =
    useUserPreferences();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [localPreferences, setLocalPreferences] = useState(userPreferences);

  // Atualizar estado local quando userPreferences mudar
  useEffect(() => {
    setLocalPreferences(userPreferences);
  }, [userPreferences]);

  // Detectar mudanças não salvas
  useEffect(() => {
    const hasChanges =
      JSON.stringify(localPreferences) !== JSON.stringify(userPreferences);
    setHasUnsavedChanges(hasChanges);
  }, [localPreferences, userPreferences]);

  const handleLocalPreferenceChange = (key: string, value: any) => {
    setLocalPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const saveAllPreferences = async () => {
    setIsSaving(true);
    try {
      const promises = Object.entries(localPreferences).map(([key, value]) => {
        if (value !== userPreferences[key as keyof typeof userPreferences]) {
          return updateUserPreference(
            key as keyof typeof userPreferences,
            value
          );
        }
        return Promise.resolve(true);
      });

      const results = await Promise.all(promises);
      const allSuccessful = results.every((result) => result === true);

      if (allSuccessful) {
        setHasUnsavedChanges(false);
        // Mostrar feedback visual de sucesso
        const element = document.getElementById("save-success");
        if (element) {
          element.style.display = "block";
          setTimeout(() => {
            element.style.display = "none";
          }, 2000);
        }
      }
    } catch (error) {
      console.error("Erro ao salvar preferências:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingUserPreferences) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#BBF717] mx-auto"></div>
          <p className="text-gray-400 mt-2">Carregando preferências...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header com botões de ação */}
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
                  onClick={() => setLocalPreferences(userPreferences)}
                  variant="outline"
                  size="sm"
                  className="border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-black"
                >
                  Descartar
                </Button>
                <Button
                  onClick={saveAllPreferences}
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

      {/* Feedback de sucesso */}
      <div
        id="save-success"
        style={{ display: "none" }}
        className="bg-green-500/10 border border-green-500 rounded-lg p-4"
      >
        <div className="flex items-center gap-2">
          <Save className="w-5 h-5 text-green-400" />
          <span className="text-green-400 font-medium">
            Preferências salvas com sucesso!
          </span>
        </div>
      </div>

      {/* Aparência */}
      <Card className="bg-[#1C1C1C] border-[#2C2C2C]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Palette className="w-5 h-5" />
            Aparência
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Tema</h4>
              <p className="text-sm text-gray-400">
                Escolha entre tema claro ou escuro
              </p>
            </div>
            <Select
              value={localPreferences.theme}
              onValueChange={(value) =>
                handleLocalPreferenceChange("theme", value)
              }
            >
              <SelectTrigger className="w-32 bg-[#2A2B2A] border-[#555] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4" />
                    Claro
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4" />
                    Escuro
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Modo Compacto</h4>
              <p className="text-sm text-gray-400">
                Interface mais compacta com menos espaçamento
              </p>
            </div>
            <Switch
              checked={localPreferences.compactMode}
              onCheckedChange={(checked) =>
                handleLocalPreferenceChange("compactMode", checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Notificações */}
      <Card className="bg-[#1C1C1C] border-[#2C2C2C]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Bell className="w-5 h-5" />
            Notificações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Notificações Push</h4>
              <p className="text-sm text-gray-400">
                Receber notificações no navegador
              </p>
            </div>
            <Switch
              checked={localPreferences.notifications}
              onCheckedChange={(checked) =>
                handleLocalPreferenceChange("notifications", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Notificações por Email</h4>
              <p className="text-sm text-gray-400">
                Receber resumos e atualizações por email
              </p>
            </div>
            <Switch
              checked={localPreferences.emailNotifications}
              onCheckedChange={(checked) =>
                handleLocalPreferenceChange("emailNotifications", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Sons do Sistema</h4>
              <p className="text-sm text-gray-400">
                Reproduzir sons para notificações e ações
              </p>
            </div>
            <div className="flex items-center gap-2">
              {localPreferences.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-gray-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-gray-400" />
              )}
              <Switch
                checked={localPreferences.soundEnabled}
                onCheckedChange={(checked) =>
                  handleLocalPreferenceChange("soundEnabled", checked)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurações Gerais */}
      <Card className="bg-[#1C1C1C] border-[#2C2C2C]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Settings className="w-5 h-5" />
            Configurações Gerais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Idioma</h4>
              <p className="text-sm text-gray-400">
                Idioma da interface do sistema
              </p>
            </div>
            <Select
              value={localPreferences.language}
              onValueChange={(value) =>
                handleLocalPreferenceChange("language", value)
              }
            >
              <SelectTrigger className="w-32 bg-[#2A2B2A] border-[#555] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt-BR">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Português
                  </div>
                </SelectItem>
                <SelectItem value="en-US">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    English
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Fuso Horário</h4>
              <p className="text-sm text-gray-400">
                Fuso horário para exibição de datas e horários
              </p>
            </div>
            <Select
              value={localPreferences.timezone}
              onValueChange={(value) =>
                handleLocalPreferenceChange("timezone", value)
              }
            >
              <SelectTrigger className="w-48 bg-[#2A2B2A] border-[#555] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/Sao_Paulo">
                  São Paulo (UTC-3)
                </SelectItem>
                <SelectItem value="America/New_York">
                  Nova York (UTC-5)
                </SelectItem>
                <SelectItem value="Europe/London">Londres (UTC+0)</SelectItem>
                <SelectItem value="Asia/Tokyo">Tóquio (UTC+9)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Dashboard Padrão</h4>
              <p className="text-sm text-gray-400">
                Aba inicial do dashboard ao fazer login
              </p>
            </div>
            <Select
              value={localPreferences.defaultDashboardTab}
              onValueChange={(value) =>
                handleLocalPreferenceChange("defaultDashboardTab", value)
              }
            >
              <SelectTrigger className="w-40 bg-[#2A2B2A] border-[#555] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Visão Geral</SelectItem>
                <SelectItem value="trading-diary">Diário de Trading</SelectItem>
                <SelectItem value="community">Comunidade</SelectItem>
                <SelectItem value="academy">Academia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Salvamento Automático</h4>
              <p className="text-sm text-gray-400">
                Salvar automaticamente formulários e rascunhos
              </p>
            </div>
            <Switch
              checked={localPreferences.autoSave}
              onCheckedChange={(checked) =>
                handleLocalPreferenceChange("autoSave", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Tela de Boas-vindas</h4>
              <p className="text-sm text-gray-400">
                Mostrar tela de boas-vindas ao fazer login
              </p>
            </div>
            <Switch
              checked={localPreferences.showWelcomeScreen}
              onCheckedChange={(checked) =>
                handleLocalPreferenceChange("showWelcomeScreen", checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Informações da Conta */}
      <Card className="bg-[#1C1C1C] border-[#2C2C2C]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Monitor className="w-5 h-5" />
            Informações da Conta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-[#2A2B2A] p-4 rounded-lg">
            <div className="space-y-2 text-sm">
              <p className="text-gray-300">
                <span className="font-medium">Nome:</span> {user?.name}
              </p>
              <p className="text-gray-300">
                <span className="font-medium">Email:</span> {user?.email}
              </p>
              <p className="text-gray-300">
                <span className="font-medium">Status:</span>{" "}
                <span className="text-green-400">Aprovado</span>
              </p>
              <p className="text-gray-300">
                <span className="font-medium">Membro desde:</span>{" "}
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("pt-BR")
                  : "N/A"}
              </p>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
            <h4 className="font-medium text-blue-400 mb-2">💡 Dicas</h4>
            <ul className="text-sm text-blue-300 space-y-1">
              <li>• Suas preferências são sincronizadas entre dispositivos</li>
              <li>
                • Habilite notificações para não perder atualizações importantes
              </li>
              <li>• O modo compacto é ideal para telas menores</li>
              <li>• Configurações são salvas automaticamente ao alterar</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
