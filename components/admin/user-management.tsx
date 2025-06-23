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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  Check,
  Download,
  Edit,
  Plus,
  Search,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ImportUser {
  name: string;
  email: string;
  phone?: string;
  experience: string;
  password?: string;
  status?: "pending" | "approved" | "rejected";
}

export function UserManagement() {
  const {
    getAllUsers,
    approveUser,
    rejectUser,
    register,
    updateUser,
    deleteUser,
  } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => Promise<void>;
  }>({
    open: false,
    title: "",
    description: "",
    action: async () => {},
  });
  const [userToAction, setUserToAction] = useState<{
    id: string;
    action: "approve" | "reject";
  } | null>(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    experience: "",
    password: "",
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, statusFilter]);

  const loadUsers = async () => {
    const allUsers = await getAllUsers();
    setUsers(allUsers);
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  };

  const validateUserData = (userData: typeof newUser): string | null => {
    if (!userData.name.trim()) {
      return "Nome é obrigatório";
    }

    if (!userData.email.trim()) {
      return "Email é obrigatório";
    }

    // Validação de email básica
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      return "Email inválido";
    }

    if (!userData.password.trim()) {
      return "Senha é obrigatória";
    }

    if (userData.password.length < 6) {
      return "Senha deve ter pelo menos 6 caracteres";
    }

    if (!userData.experience) {
      return "Experiência é obrigatória";
    }

    // Verificar se email já existe
    if (
      users.some(
        (user) => user.email.toLowerCase() === userData.email.toLowerCase()
      )
    ) {
      return "Email já está em uso";
    }

    return null;
  };

  const handleAddUser = async () => {
    const validationError = validateUserData(newUser);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      if (isSupabaseConfigured) {
        // Usar o sistema de registro do Supabase/Auth
        const success = await register({
          name: newUser.name.trim(),
          email: newUser.email.trim().toLowerCase(),
          phone: newUser.phone.trim(),
          experience: newUser.experience,
          password: newUser.password,
          avatar_url: null,
        });

        if (success) {
          toast.success("Usuário criado com sucesso!");
          setNewUser({
            name: "",
            email: "",
            phone: "",
            experience: "",
            password: "",
          });
          setIsAddUserOpen(false);
          await loadUsers();
        } else {
          toast.error(
            "Erro ao criar usuário. Verifique os dados e tente novamente."
          );
        }
      } else {
        // Fallback para localStorage
        const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
        const passwords = JSON.parse(localStorage.getItem("passwords") || "{}");

        const user = {
          id: `user-${Date.now()}`,
          name: newUser.name.trim(),
          email: newUser.email.trim().toLowerCase(),
          phone: newUser.phone.trim(),
          experience: newUser.experience,
          status: "approved", // Admin criado usuários já aprovados
          role: "user",
          createdAt: new Date().toISOString(),
          avatar_url: null,
        };

        allUsers.push(user);
        passwords[user.email] = newUser.password;

        localStorage.setItem("users", JSON.stringify(allUsers));
        localStorage.setItem("passwords", JSON.stringify(passwords));

        toast.success("Usuário criado com sucesso!");
        setNewUser({
          name: "",
          email: "",
          phone: "",
          experience: "",
          password: "",
        });
        setIsAddUserOpen(false);
        await loadUsers();
      }
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      toast.error("Erro inesperado ao criar usuário. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    // Verificação básica dos campos obrigatórios para edição
    if (!editingUser.name?.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    if (!editingUser.experience) {
      toast.error("Experiência é obrigatória");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isSupabaseConfigured) {
        const result = await updateUser(editingUser.id, {
          name: editingUser.name.trim(),
          phone: editingUser.phone?.trim() || "",
          experience: editingUser.experience,
          status: editingUser.status,
        });

        if (result.success) {
          toast.success("Usuário atualizado com sucesso!");
          setEditingUser(null);
          await loadUsers();
        } else {
          toast.error(result.error || "Erro ao atualizar usuário");
        }
      } else {
        // Fallback para localStorage
        const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
        const userIndex = allUsers.findIndex(
          (u: any) => u.id === editingUser.id
        );

        if (userIndex !== -1) {
          allUsers[userIndex] = editingUser;
          localStorage.setItem("users", JSON.stringify(allUsers));
          toast.success("Usuário atualizado com sucesso!");
          setEditingUser(null);
          await loadUsers();
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      toast.error("Erro ao atualizar usuário. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    setConfirmDialog({
      open: true,
      title: "Excluir Usuário",
      description: `Tem certeza que deseja excluir permanentemente o usuário ${user.name}? Esta ação não pode ser desfeita.`,
      action: async () => {
        try {
          const result = await deleteUser(userId);

          if (result.success) {
            toast.success("Usuário excluído com sucesso!");
            await loadUsers();
          } else {
            toast.error(result.error || "Erro ao excluir usuário");
          }
        } catch (error) {
          console.error("Erro ao excluir usuário:", error);
          toast.error("Erro inesperado ao excluir usuário");
        }

        setConfirmDialog((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const exportUsers = () => {
    try {
      const exportData = users.map((user) => ({
        name: user.name,
        email: user.email,
        phone: user.phone,
        experience: user.experience,
        status: user.status,
        createdAt: user.createdAt,
      }));

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `usuarios-exl-trading-${
        new Date().toISOString().split("T")[0]
      }.json`;
      link.click();

      toast.success("Dados exportados com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar usuários:", error);
      toast.error("Erro ao exportar dados. Tente novamente.");
    }
  };

  const validateImportData = (
    data: any[]
  ): { valid: ImportUser[]; errors: string[] } => {
    const validUsers: ImportUser[] = [];
    const errors: string[] = [];

    data.forEach((user, index) => {
      const lineNumber = index + 1;

      if (!user.name || typeof user.name !== "string") {
        errors.push(`Linha ${lineNumber}: Nome é obrigatório`);
        return;
      }

      if (!user.email || typeof user.email !== "string") {
        errors.push(`Linha ${lineNumber}: Email é obrigatório`);
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(user.email)) {
        errors.push(`Linha ${lineNumber}: Email inválido (${user.email})`);
        return;
      }

      if (
        !user.experience ||
        !["iniciante", "intermediario", "avancado", "profissional"].includes(
          user.experience
        )
      ) {
        errors.push(
          `Linha ${lineNumber}: Experiência deve ser: iniciante, intermediario, avancado ou profissional`
        );
        return;
      }

      // Verificar se email já existe
      if (
        users.some(
          (existingUser) =>
            existingUser.email.toLowerCase() === user.email.toLowerCase()
        )
      ) {
        errors.push(`Linha ${lineNumber}: Email já existe (${user.email})`);
        return;
      }

      // Verificar duplicatas no próprio arquivo
      if (
        validUsers.some(
          (validUser) =>
            validUser.email.toLowerCase() === user.email.toLowerCase()
        )
      ) {
        errors.push(
          `Linha ${lineNumber}: Email duplicado no arquivo (${user.email})`
        );
        return;
      }

      validUsers.push({
        name: user.name.trim(),
        email: user.email.trim().toLowerCase(),
        phone: user.phone?.trim() || "",
        experience: user.experience,
        password: user.password || "123456", // Senha padrão se não fornecida
        status: user.status || "pending",
      });
    });

    return { valid: validUsers, errors };
  };

  const importUsers = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset input
    event.target.value = "";

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);

        if (!Array.isArray(importedData)) {
          toast.error("Arquivo deve conter um array de usuários");
          return;
        }

        if (importedData.length === 0) {
          toast.error("Arquivo está vazio");
          return;
        }

        const { valid: validUsers, errors } = validateImportData(importedData);

        if (errors.length > 0) {
          const errorMessage = errors.slice(0, 5).join("\n"); // Mostra apenas os primeiros 5 erros
          const remaining =
            errors.length > 5 ? `\n... e mais ${errors.length - 5} erros` : "";
          toast.error(`Erros encontrados:\n${errorMessage}${remaining}`);
          return;
        }

        if (validUsers.length === 0) {
          toast.error("Nenhum usuário válido encontrado");
          return;
        }

        setIsSubmitting(true);
        let successCount = 0;
        let errorCount = 0;

        try {
          if (isSupabaseConfigured) {
            // Importar usando o sistema de registro
            for (const userData of validUsers) {
              try {
                const success = await register({
                  name: userData.name,
                  email: userData.email,
                  phone: userData.phone || "",
                  experience: userData.experience,
                  password: userData.password || "123456",
                  avatar_url: null,
                });

                if (success) {
                  successCount++;
                } else {
                  errorCount++;
                }
              } catch (error) {
                console.error(
                  `Erro ao importar usuário ${userData.email}:`,
                  error
                );
                errorCount++;
              }
            }
          } else {
            // Fallback para localStorage
            const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
            const passwords = JSON.parse(
              localStorage.getItem("passwords") || "{}"
            );

            for (const userData of validUsers) {
              try {
                const user = {
                  id: `user-${Date.now()}-${Math.random()}`,
                  name: userData.name,
                  email: userData.email,
                  phone: userData.phone,
                  experience: userData.experience,
                  status: userData.status,
                  role: "user",
                  createdAt: new Date().toISOString(),
                  avatar_url: null,
                };

                allUsers.push(user);
                passwords[user.email] = userData.password;
                successCount++;
              } catch (error) {
                console.error(
                  `Erro ao processar usuário ${userData.email}:`,
                  error
                );
                errorCount++;
              }
            }

            localStorage.setItem("users", JSON.stringify(allUsers));
            localStorage.setItem("passwords", JSON.stringify(passwords));
          }

          await loadUsers();

          if (successCount > 0 && errorCount === 0) {
            toast.success(
              `${successCount} usuário(s) importado(s) com sucesso!`
            );
          } else if (successCount > 0 && errorCount > 0) {
            toast.warning(
              `${successCount} usuário(s) importado(s), ${errorCount} com erro`
            );
          } else {
            toast.error("Nenhum usuário pôde ser importado");
          }
        } catch (error) {
          console.error("Erro durante importação:", error);
          toast.error("Erro inesperado durante a importação");
        }
      } catch (error) {
        console.error("Erro ao processar arquivo:", error);
        toast.error(
          "Erro ao processar arquivo. Verifique se é um JSON válido."
        );
      } finally {
        setIsSubmitting(false);
      }
    };

    reader.readAsText(file);
  };

  const handleApproveUser = async (userId: string) => {
    try {
      await approveUser(userId);
      await loadUsers();
      toast.success("Usuário aprovado com sucesso!");
    } catch (error) {
      toast.error("Erro ao aprovar usuário. Tente novamente.");
    }
  };

  const handleRejectUser = async (userId: string) => {
    try {
      await rejectUser(userId);
      await loadUsers();
      toast.success("Usuário rejeitado com sucesso!");
    } catch (error) {
      toast.error("Erro ao rejeitar usuário. Tente novamente.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[#2A2B2A] border-[#555] text-white"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-[#2A2B2A] border-[#555] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="approved">Aprovados</SelectItem>
              <SelectItem value="rejected">Rejeitados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <input
            type="file"
            accept=".json"
            onChange={importUsers}
            className="hidden"
            id="import-users"
          />
          <Button
            onClick={() => {
              const link = document.createElement("a");
              link.href = "/exemplo-importacao-usuarios.json";
              link.download = "exemplo-importacao-usuarios.json";
              link.click();
            }}
            variant="outline"
            size="sm"
            className="border-gray-500 text-gray-400 bg-transparent hover:bg-gray-600 hover:text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Exemplo
          </Button>
          <Button
            onClick={() => document.getElementById("import-users")?.click()}
            variant="outline"
            disabled={isSubmitting}
            className="border-[#BBF717] text-white bg-transparent hover:bg-[#BBF717] hover:text-black disabled:opacity-50"
          >
            <Upload className="w-4 h-4 mr-2" />
            {isSubmitting ? "Importando..." : "Importar"}
          </Button>
          <Button
            onClick={exportUsers}
            variant="outline"
            disabled={isSubmitting}
            className="border-[#BBF717] text-white bg-transparent hover:bg-[#BBF717] hover:text-black disabled:opacity-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#BBF717] text-black hover:bg-[#9FD615]">
                <Plus className="w-4 h-4 mr-2" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1C1C1C] border-[#2C2C2C] text-white">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Usuário</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Nome completo"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                  className="bg-[#2A2B2A] border-[#555] text-white"
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  className="bg-[#2A2B2A] border-[#555] text-white"
                />
                <Input
                  placeholder="Telefone"
                  value={newUser.phone}
                  onChange={(e) =>
                    setNewUser({ ...newUser, phone: e.target.value })
                  }
                  className="bg-[#2A2B2A] border-[#555] text-white"
                />
                <Select
                  value={newUser.experience}
                  onValueChange={(value) =>
                    setNewUser({ ...newUser, experience: value })
                  }
                >
                  <SelectTrigger className="bg-[#2A2B2A] border-[#555] text-white">
                    <SelectValue placeholder="Experiência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="iniciante">Iniciante</SelectItem>
                    <SelectItem value="intermediario">Intermediário</SelectItem>
                    <SelectItem value="avancado">Avançado</SelectItem>
                    <SelectItem value="profissional">Profissional</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Senha"
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  className="bg-[#2A2B2A] border-[#555] text-white"
                />
                <Button
                  onClick={handleAddUser}
                  disabled={isSubmitting}
                  className="w-full bg-[#BBF717] text-black hover:bg-[#9FD615] disabled:opacity-50"
                >
                  {isSubmitting ? "Criando usuário..." : "Adicionar Usuário"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Users Table */}
      <Card className="bg-[#1C1C1C] border-[#2C2C2C]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Users className="w-5 h-5" />
            Gerenciamento de Usuários ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2C2C2C]">
                  <th className="text-left p-3 text-gray-400">Nome</th>
                  <th className="text-left p-3 text-gray-400">Email</th>
                  <th className="text-left p-3 text-gray-400">Telefone</th>
                  <th className="text-left p-3 text-gray-400">Experiência</th>
                  <th className="text-left p-3 text-gray-400">Status</th>
                  <th className="text-left p-3 text-gray-400">Data</th>
                  <th className="text-left p-3 text-gray-400">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-[#2C2C2C] hover:bg-[#2A2B2A]"
                  >
                    <td className="p-3 text-white font-medium">{user.name}</td>
                    <td className="p-3 text-gray-300">{user.email}</td>
                    <td className="p-3 text-gray-300">{user.phone}</td>
                    <td className="p-3 text-gray-300 capitalize">
                      {user.experience}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          user.status === "approved"
                            ? "bg-green-500/20 text-green-400"
                            : user.status === "pending"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {user.status === "approved"
                          ? "Aprovado"
                          : user.status === "pending"
                          ? "Pendente"
                          : "Rejeitado"}
                      </span>
                    </td>
                    <td className="p-3 text-gray-300">
                      {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        {user.status === "pending" && (
                          <>
                            <Button
                              onClick={() => {
                                setConfirmDialog({
                                  open: true,
                                  title: "Aprovar Usuário",
                                  description: `Tem certeza que deseja aprovar o usuário ${user.name}?`,
                                  action: async () => {
                                    await handleApproveUser(user.id);
                                    setConfirmDialog((prev) => ({
                                      ...prev,
                                      open: false,
                                    }));
                                  },
                                });
                              }}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white p-1 h-8 w-8"
                              title="Aprovar usuário"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => {
                                setConfirmDialog({
                                  open: true,
                                  title: "Rejeitar Usuário",
                                  description: `Tem certeza que deseja rejeitar o usuário ${user.name}?`,
                                  action: async () => {
                                    await handleRejectUser(user.id);
                                    setConfirmDialog((prev) => ({
                                      ...prev,
                                      open: false,
                                    }));
                                  },
                                });
                              }}
                              size="sm"
                              className="bg-red-600 hover:bg-red-700 text-white p-1 h-8 w-8"
                              title="Rejeitar usuário"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          onClick={() => handleEditUser(user)}
                          size="sm"
                          variant="outline"
                          className="border-[#555] bg-[#2C2C2C] text-white p-1 h-8 w-8"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteUser(user.id)}
                          size="sm"
                          variant="outline"
                          className="border-red-500 bg-red-500 text-white p-1 h-8 w-8"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                Nenhum usuário encontrado
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent className="bg-[#1C1C1C] border-[#2C2C2C] text-white">
            <DialogHeader>
              <DialogTitle>Editar Usuário</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Nome completo"
                value={editingUser.name}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, name: e.target.value })
                }
                className="bg-[#2A2B2A] border-[#555] text-white"
              />
              <Input
                placeholder="Email"
                type="email"
                value={editingUser.email}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, email: e.target.value })
                }
                className="bg-[#2A2B2A] border-[#555] text-white"
              />
              <Input
                placeholder="Telefone"
                value={editingUser.phone}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, phone: e.target.value })
                }
                className="bg-[#2A2B2A] border-[#555] text-white"
              />
              <Select
                value={editingUser.experience}
                onValueChange={(value) =>
                  setEditingUser({ ...editingUser, experience: value })
                }
              >
                <SelectTrigger className="bg-[#2A2B2A] border-[#555] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="iniciante">Iniciante</SelectItem>
                  <SelectItem value="intermediario">Intermediário</SelectItem>
                  <SelectItem value="avancado">Avançado</SelectItem>
                  <SelectItem value="profissional">Profissional</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={editingUser.status}
                onValueChange={(value) =>
                  setEditingUser({ ...editingUser, status: value })
                }
              >
                <SelectTrigger className="bg-[#2A2B2A] border-[#555] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="approved">Aprovado</SelectItem>
                  <SelectItem value="rejected">Rejeitado</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleUpdateUser}
                disabled={isSubmitting}
                className="w-full bg-[#BBF717] text-black hover:bg-[#9FD615] disabled:opacity-50"
              >
                {isSubmitting ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent className="bg-[#1C1C1C] border-[#2C2C2C] text-white">
          <DialogHeader>
            <DialogTitle>{confirmDialog.title}</DialogTitle>
          </DialogHeader>
          <p className="text-gray-300">{confirmDialog.description}</p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setConfirmDialog((prev) => ({ ...prev, open: false }))
              }
              className="border-[#555] bg-[#2C2C2C] text-white hover:bg-[#3C3C3C] hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                toast.promise(confirmDialog.action(), {
                  loading: "Processando...",
                  success: "Operação realizada com sucesso!",
                  error: "Erro ao realizar operação",
                });
              }}
              className="bg-[#BBF717] text-black hover:bg-[#9FD615]"
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={alertOpen}
        onOpenChange={setAlertOpen}
        description={alertMessage}
      />
    </div>
  );
}
