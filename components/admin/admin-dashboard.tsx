"use client";

import { CommunityModeration } from "@/components/admin/community-moderation";
import { NotificationCenter } from "@/components/admin/notification-center";
import { SystemSettings } from "@/components/admin/system-settings";
import { UserManagement } from "@/components/admin/user-management";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useCommunity } from "@/hooks/use-community";
import { useCompanyFeed } from "@/hooks/use-company-feed";
import {
  ArrowLeft,
  BarChart3,
  Bell,
  MessageSquare,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

interface AdminDashboardProps {
  onBack: () => void;
}

export function AdminDashboard({ onBack }: AdminDashboardProps) {
  const { user, getAllUsers } = useAuth();
  const { posts: communityPosts } = useCommunity();
  const { posts: companyPosts } = useCompanyFeed();
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const allUsers = await getAllUsers();
    setUsers(allUsers);
  };

  const pendingUsers = users.filter((u: any) => u.status === "pending");
  const approvedUsers = users.filter((u: any) => u.status === "approved");

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-white">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              onClick={onBack}
              className="bg-[#1C1C1C] text-[#BBF717] hover:bg-[#2C2C2C]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Painel Administrativo</h1>
              <p className="text-gray-400">Bem-vindo, {user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-[#BBF717]" />
            <span className="text-sm font-medium text-[#BBF717]">ADMIN</span>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-5 bg-[#1C1C1C]">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-[#BBF717] data-[state=active]:text-black"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-[#BBF717] data-[state=active]:text-black"
            >
              <Users className="w-4 h-4 mr-2" />
              Usuários
            </TabsTrigger>
            <TabsTrigger
              value="community"
              className="data-[state=active]:bg-[#BBF717] data-[state=active]:text-black"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Comunidade
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="data-[state=active]:bg-[#BBF717] data-[state=active]:text-black"
            >
              <Bell className="w-4 h-4 mr-2" />
              Notificações
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-[#BBF717] data-[state=active]:text-black"
            >
              <Settings className="w-4 h-4 mr-2" />
              Sistema
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-[#1C1C1C] border-[#2C2C2C]">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-black" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {pendingUsers.length}
                      </p>
                      <p className="text-sm text-gray-400">Pendentes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1C1C1C] border-[#2C2C2C]">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-black" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {approvedUsers.length}
                      </p>
                      <p className="text-sm text-gray-400">Aprovados</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1C1C1C] border-[#2C2C2C]">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <MessageSquare className="h-6 w-6 text-black" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {communityPosts.length}
                      </p>
                      <p className="text-sm text-gray-400">Posts Comunidade</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1C1C1C] border-[#2C2C2C]">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#BBF717] rounded-full flex items-center justify-center">
                      <Bell className="h-6 w-6 text-black" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {companyPosts.length}
                      </p>
                      <p className="text-sm text-gray-400">Posts Empresa</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-[#1C1C1C] border-[#2C2C2C]">
              <CardHeader>
                <CardTitle className="text-white">Atividade Recente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingUsers.slice(0, 5).map((user: any) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 bg-[#2A2B2A] rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-white">{user.name}</p>
                        <p className="text-sm text-gray-400">
                          Novo cadastro pendente
                        </p>
                      </div>
                      <span className="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">
                        Pendente
                      </span>
                    </div>
                  ))}
                  {pendingUsers.length === 0 && (
                    <p className="text-gray-400 text-center py-4">
                      Nenhuma atividade recente
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="community">
            <CommunityModeration />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationCenter />
          </TabsContent>

          <TabsContent value="settings">
            <SystemSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
