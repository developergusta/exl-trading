"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onSwitchToAdmin?: () => void;
  onBack?: () => void;
  isAdminMode?: boolean;
}

export function LoginForm({
  onSwitchToRegister,
  onSwitchToAdmin,
  onBack,
  isAdminMode = false,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { success, error } = await login(email, password, isAdminMode);
      if (!success) {
        setError(error || "Erro ao fazer login. Tente novamente.");
      }
    } catch (err) {
      setError("Erro ao fazer login. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-[#1C1C1C] border-[#2C2C2C]">
      <CardHeader>
        <div className="flex items-center gap-2">
          {isAdminMode && onBack && (
            <Button
              onClick={onBack}
              variant="ghost"
              size="sm"
              className="text-[#BBF717] p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <CardTitle className="text-white">
              {isAdminMode ? "Acesso Administrativo" : "Entrar"}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {isAdminMode
                ? "Faça login como administrador"
                : "Acesse sua conta EXL Trading"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="bg-[#2A2B2A] border-[#555] text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Senha
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-[#2A2B2A] border-[#555] text-white pr-10"
              />
              <Button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-auto bg-transparent hover:bg-transparent"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-400 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#BBF717] text-black hover:bg-[#9FD615] font-bold"
          >
            {isLoading
              ? "Entrando..."
              : isAdminMode
              ? "Entrar como Admin"
              : "Entrar"}
          </Button>

          {!isAdminMode && (
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-400">
                Não tem uma conta?{" "}
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="text-[#BBF717] hover:underline"
                >
                  Cadastre-se
                </button>
              </p>
              {onSwitchToAdmin && (
                <p className="text-sm text-gray-400">
                  <button
                    type="button"
                    onClick={onSwitchToAdmin}
                    className="text-[#BBF717] hover:underline"
                  >
                    Acesso Administrativo
                  </button>
                </p>
              )}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
