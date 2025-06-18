"use client";

import type React from "react";

import { AlertDialog } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
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

export function UserManagement() {
  const { getAllUsers, approveUser, rejectUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
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

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.password) return;

    const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
    const passwords = JSON.parse(localStorage.getItem("passwords") || "{}");

    const user = {
      id: `user-${Date.now()}`,
      ...newUser,
      status: "approved",
      role: "user",
      createdAt: new Date().toISOString(),
    };

    allUsers.push(user);
    passwords[user.email] = newUser.password;

    localStorage.setItem("users", JSON.stringify(allUsers));
    localStorage.setItem("passwords", JSON.stringify(passwords));

    setNewUser({
      name: "",
      email: "",
      phone: "",
      experience: "",
      password: "",
    });
    setIsAddUserOpen(false);
    loadUsers();
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;

    const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
    const userIndex = allUsers.findIndex((u: any) => u.id === editingUser.id);

    if (userIndex !== -1) {
      allUsers[userIndex] = editingUser;
      localStorage.setItem("users", JSON.stringify(allUsers));
      setEditingUser(null);
      loadUsers();
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;

    const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
    const passwords = JSON.parse(localStorage.getItem("passwords") || "{}");

    const userToDelete = allUsers.find((u: any) => u.id === userId);
    if (userToDelete) {
      delete passwords[userToDelete.email];
    }

    const updatedUsers = allUsers.filter((u: any) => u.id !== userId);

    localStorage.setItem("users", JSON.stringify(updatedUsers));
    localStorage.setItem("passwords", JSON.stringify(passwords));
    loadUsers();
  };

  const exportUsers = () => {
    const dataStr = JSON.stringify(users, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "usuarios-exl-trading.json";
    link.click();
  };

  const importUsers = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedUsers = JSON.parse(e.target?.result as string);
        const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
        const passwords = JSON.parse(localStorage.getItem("passwords") || "{}");

        importedUsers.forEach((user: any) => {
          if (!allUsers.find((u: any) => u.email === user.email)) {
            user.id = `user-${Date.now()}-${Math.random()}`;
            user.createdAt = new Date().toISOString();
            allUsers.push(user);
            passwords[user.email] = user.password || "123456";
          }
        });

        localStorage.setItem("users", JSON.stringify(allUsers));
        localStorage.setItem("passwords", JSON.stringify(passwords));
        loadUsers();
        setAlertMessage("Usuários importados com sucesso!");
        setAlertOpen(true);
      } catch (error) {
        setAlertMessage(
          "Erro ao importar usuários. Verifique o formato do arquivo."
        );
        setAlertOpen(true);
      }
    };
    reader.readAsText(file);
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
            onClick={() => document.getElementById("import-users")?.click()}
            variant="outline"
            className="border-[#BBF717] text-white bg-transparent hover:bg-[#BBF717] hover:text-black"
          >
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button>
          <Button
            onClick={exportUsers}
            variant="outline"
            className="border-[#BBF717] text-white bg-transparent hover:bg-[#BBF717] hover:text-black"
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
                  className="w-full bg-[#BBF717] text-black hover:bg-[#9FD615]"
                >
                  Adicionar Usuário
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
            Gerenciamento de Usuários ({filteredUsers.length})
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
                              onClick={() =>
                                approveUser(user.id).then(loadUsers)
                              }
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white p-1 h-8 w-8"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() =>
                                rejectUser(user.id).then(loadUsers)
                              }
                              size="sm"
                              className="bg-red-600 hover:bg-red-700 text-white p-1 h-8 w-8"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          onClick={() => handleEditUser(user)}
                          size="sm"
                          variant="outline"
                          className="border-[#555] text-white hover:bg-[#2C2C2C] p-1 h-8 w-8"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteUser(user.id)}
                          size="sm"
                          variant="outline"
                          className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white p-1 h-8 w-8"
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
                className="w-full bg-[#BBF717] text-black hover:bg-[#9FD615]"
              >
                Salvar Alterações
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog
        open={alertOpen}
        onOpenChange={setAlertOpen}
        description={alertMessage}
      />
    </div>
  );
}
