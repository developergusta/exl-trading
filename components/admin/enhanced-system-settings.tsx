"use client";

import type React from "react";

import { AlertDialog } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useSystemSettings } from "@/hooks/use-settings";
import {
  AlertTriangle,
  Database,
  Download,
  MessageSquare,
  RefreshCw,
  Save,
  Settings,
  Shield,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

export function EnhancedSystemSettings() {
  const {
    systemSettings,
    updateSystemSetting,
    refreshSystemSettings,
    isLoadingSystemSettings,
  } = useSystemSettings();
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogStep, setConfirmDialogStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Estado local para mudanças
  const [localSettings, setLocalSettings] = useState(systemSettings);

  // Atualizar estado local quando systemSettings mudar
  useEffect(() => {
    setLocalSettings(systemSettings);
  }, [systemSettings]);

  // Detectar mudanças não salvas
  useEffect(() => {
    const hasChanges =
      JSON.stringify(localSettings) !== JSON.stringify(systemSettings);
    setHasUnsavedChanges(hasChanges);
  }, [localSettings, systemSettings]);

  const handleLocalSettingChange = (key: string, value: any) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
  };

  const saveAllSettings = async () => {
    setIsSaving(true);
    try {
      const promises = Object.entries(localSettings).map(([key, value]) => {
        if (value !== systemSettings[key as keyof typeof systemSettings]) {
          return updateSystemSetting(key as keyof typeof systemSettings, value);
        }
        return Promise.resolve(true);
      });

      const results = await Promise.all(promises);
      const allSuccessful = results.every((result) => result === true);

      if (allSuccessful) {
        setAlertMessage("Configurações salvas com sucesso!");
        setHasUnsavedChanges(false);
      } else {
        setAlertMessage(
          "Erro ao salvar algumas configurações. Tente novamente."
        );
      }
      setAlertOpen(true);
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      setAlertMessage("Erro inesperado ao salvar configurações.");
      setAlertOpen(true);
    } finally {
      setIsSaving(false);
    }
  };

  const exportAllData = () => {
    const data = {
      users: JSON.parse(localStorage.getItem("users") || "[]"),
      passwords: JSON.parse(localStorage.getItem("passwords") || "{}"),
      trades: JSON.parse(localStorage.getItem("trades") || "[]"),
      communityPosts: JSON.parse(
        localStorage.getItem("communityPosts") || "[]"
      ),
      companyPosts: JSON.parse(localStorage.getItem("companyPosts") || "[]"),
      notifications: JSON.parse(localStorage.getItem("notifications") || "[]"),
      systemSettings: localSettings,
      userPreferences: {}, // Será implementado conforme necessário
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `exl-trading-backup-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();
  };

  const importAllData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        // Importar configurações do sistema se existirem
        if (data.systemSettings) {
          setLocalSettings(data.systemSettings);
        }

        // Importar outros dados para localStorage (fallback)
        if (data.users)
          localStorage.setItem("users", JSON.stringify(data.users));
        if (data.passwords)
          localStorage.setItem("passwords", JSON.stringify(data.passwords));
        if (data.trades)
          localStorage.setItem("trades", JSON.stringify(data.trades));
        if (data.communityPosts)
          localStorage.setItem(
            "communityPosts",
            JSON.stringify(data.communityPosts)
          );
        if (data.companyPosts)
          localStorage.setItem(
            "companyPosts",
            JSON.stringify(data.companyPosts)
          );
        if (data.notifications)
          localStorage.setItem(
            "notifications",
            JSON.stringify(data.notifications)
          );

        setAlertMessage(
          "Dados importados com sucesso! Lembre-se de salvar as configurações."
        );
        setAlertOpen(true);
      } catch (error) {
        setAlertMessage(
          "Erro ao importar dados. Verifique o formato do arquivo."
        );
        setAlertOpen(true);
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = () => {
    setConfirmDialogOpen(true);
  };

  const handleConfirmClear = () => {
    if (confirmDialogStep === 1) {
      setConfirmDialogStep(2);
      return;
    }

    // Clear all data except admin
    const adminUser = JSON.parse(localStorage.getItem("users") || "[]").find(
      (u: any) => u.role === "admin"
    );
    const adminPassword = JSON.parse(localStorage.getItem("passwords") || "{}")[
      "admin@exltrading.com"
    ];

    localStorage.clear();

    // Restore admin
    if (adminUser && adminPassword) {
      localStorage.setItem("users", JSON.stringify([adminUser]));
      localStorage.setItem(
        "passwords",
        JSON.stringify({ "admin@exltrading.com": adminPassword })
      );
    }

    setConfirmDialogOpen(false);
    setConfirmDialogStep(1);
    setAlertMessage(
      "Todos os dados foram apagados. A página será recarregada."
    );
    setAlertOpen(true);
    window.location.reload();
  };

  const getStorageUsage = () => {
    let total = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length;
      }
    }
    return (total / 1024).toFixed(2); // KB
  };

  if (isLoadingSystemSettings) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#BBF717] mx-auto"></div>
          <p className="text-gray-400 mt-2">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
                  onClick={() => setLocalSettings(systemSettings)}
                  variant="outline"
                  size="sm"
                  className="border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-black"
                >
                  Descartar
                </Button>
                <Button
                  onClick={saveAllSettings}
                  disabled={isSaving}
                  size="sm"
                  className="bg-yellow-500 text-black hover:bg-yellow-600"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "Salvando..." : "Salvar Tudo"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Configuration */}
      <Card className="bg-[#1C1C1C] border-[#2C2C2C]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Settings className="w-5 h-5" />
            Configurações do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Aprovação Automática</h4>
              <p className="text-sm text-gray-400">
                Aprovar novos usuários automaticamente
              </p>
            </div>
            <Switch
              checked={localSettings.autoApproveUsers}
              onCheckedChange={(checked) =>
                handleLocalSettingChange("autoApproveUsers", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Permitir Cadastros</h4>
              <p className="text-sm text-gray-400">
                Permitir que novos usuários se cadastrem
              </p>
            </div>
            <Switch
              checked={localSettings.allowUserRegistration}
              onCheckedChange={(checked) =>
                handleLocalSettingChange("allowUserRegistration", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Notificações Push</h4>
              <p className="text-sm text-gray-400">
                Habilitar notificações push do sistema
              </p>
            </div>
            <Switch
              checked={localSettings.enablePushNotifications}
              onCheckedChange={(checked) =>
                handleLocalSettingChange("enablePushNotifications", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Modo Manutenção</h4>
              <p className="text-sm text-gray-400">
                Bloquear acesso de usuários (apenas admin)
              </p>
            </div>
            <Switch
              checked={localSettings.maintenanceMode}
              onCheckedChange={(checked) =>
                handleLocalSettingChange("maintenanceMode", checked)
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Máximo de usuários por dia
              </label>
              <Input
                type="number"
                value={localSettings.maxUsersPerDay}
                onChange={(e) =>
                  handleLocalSettingChange(
                    "maxUsersPerDay",
                    Number.parseInt(e.target.value)
                  )
                }
                className="bg-[#2A2B2A] border-[#555] text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Timeout da sessão (horas)
              </label>
              <Input
                type="number"
                value={localSettings.sessionTimeout}
                onChange={(e) =>
                  handleLocalSettingChange(
                    "sessionTimeout",
                    Number.parseInt(e.target.value)
                  )
                }
                className="bg-[#2A2B2A] border-[#555] text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nome da Aplicação
              </label>
              <Input
                type="text"
                value={localSettings.appName}
                onChange={(e) =>
                  handleLocalSettingChange("appName", e.target.value)
                }
                className="bg-[#2A2B2A] border-[#555] text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email de Suporte
              </label>
              <Input
                type="email"
                value={localSettings.supportEmail}
                onChange={(e) =>
                  handleLocalSettingChange("supportEmail", e.target.value)
                }
                className="bg-[#2A2B2A] border-[#555] text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="bg-[#1C1C1C] border-[#2C2C2C]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Database className="w-5 h-5" />
            Gerenciamento de Dados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-[#2A2B2A] rounded-lg">
              <Database className="w-8 h-8 text-[#BBF717] mx-auto mb-2" />
              <p className="text-lg font-bold text-white">
                {getStorageUsage()} KB
              </p>
              <p className="text-sm text-gray-400">Uso do Storage</p>
            </div>
            <div className="text-center p-4 bg-[#2A2B2A] rounded-lg">
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-lg font-bold text-white">
                {JSON.parse(localStorage.getItem("users") || "[]").length}
              </p>
              <p className="text-sm text-gray-400">Total de Usuários</p>
            </div>
            <div className="text-center p-4 bg-[#2A2B2A] rounded-lg">
              <MessageSquare className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-lg font-bold text-white">
                {JSON.parse(localStorage.getItem("communityPosts") || "[]")
                  .length +
                  JSON.parse(localStorage.getItem("companyPosts") || "[]")
                    .length}
              </p>
              <p className="text-sm text-gray-400">Total de Posts</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={exportAllData}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar Backup
            </Button>

            <input
              type="file"
              accept=".json"
              onChange={importAllData}
              className="hidden"
              id="import-data"
            />
            <Button
              onClick={() => document.getElementById("import-data")?.click()}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Upload className="w-4 h-4 mr-2" />
              Importar Backup
            </Button>

            <Button
              onClick={refreshSystemSettings}
              variant="outline"
              className="border-[#555] bg-[#2C2C2C] text-gray-300 hover:bg-[#2C2C2C] hover:text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Recarregar Configurações
            </Button>

            <Button
              onClick={clearAllData}
              variant="outline"
              className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar Todos os Dados
            </Button>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4">
            <h4 className="font-medium text-yellow-400 mb-2">⚠️ Importante</h4>
            <ul className="text-sm text-yellow-300 space-y-1">
              <li>• Sempre faça backup antes de importar dados</li>
              <li>• A limpeza de dados é irreversível</li>
              <li>
                • O modo manutenção bloqueia todos os usuários exceto admin
              </li>
              <li>
                • Configurações são salvas no banco de dados quando disponível
              </li>
              <li>
                • Lembre-se de salvar suas alterações antes de sair da página
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="bg-[#1C1C1C] border-[#2C2C2C]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Shield className="w-5 h-5" />
            Configurações de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-[#2A2B2A] p-4 rounded-lg">
            <h4 className="font-medium text-white mb-2">
              Informações do Admin
            </h4>
            <div className="space-y-2 text-sm">
              <p className="text-gray-300">
                Email: {localSettings.supportEmail}
              </p>
              <p className="text-gray-300">
                Último acesso: {new Date().toLocaleString("pt-BR")}
              </p>
              <p className="text-gray-300">Permissões: Administrador Total</p>
              <p className="text-gray-300">
                Versão: {localSettings.appVersion}
              </p>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
            <h4 className="font-medium text-blue-400 mb-2">
              🔒 Dicas de Segurança
            </h4>
            <ul className="text-sm text-blue-300 space-y-1">
              <li>• Altere a senha padrão do admin regularmente</li>
              <li>• Monitore atividades suspeitas na comunidade</li>
              <li>• Faça backups regulares dos dados</li>
              <li>• Revise aprovações de usuários periodicamente</li>
              <li>• Use configurações de banco de dados quando possível</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={alertOpen}
        onOpenChange={setAlertOpen}
        description={alertMessage}
      />

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmação de Exclusão</DialogTitle>
          </DialogHeader>
          {confirmDialogStep === 1 ? (
            <>
              <p>
                ⚠️ ATENÇÃO: Esta ação irá apagar TODOS os dados do sistema. Esta
                ação não pode ser desfeita. Tem certeza?
              </p>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setConfirmDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleConfirmClear}>Continuar</Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <p>
                Última confirmação: Todos os usuários, posts, trades e
                configurações serão perdidos. Continuar?
              </p>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setConfirmDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleConfirmClear}>Confirmar Exclusão</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
