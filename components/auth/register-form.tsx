"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { Eye, EyeOff } from "lucide-react"

interface RegisterFormProps {
  onSwitchToLogin: () => void
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    experience: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const { register } = useAuth()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      setIsLoading(false)
      return
    }

    try {
      const success = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        experience: formData.experience,
      })

      if (success) {
        setSuccess(true)
      } else {
        setError("Email já cadastrado ou erro no servidor")
      }
    } catch (err) {
      setError("Erro ao criar conta. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="bg-[#1C1C1C] border-[#2C2C2C]">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Cadastro Realizado!</h3>
            <p className="text-gray-300 mb-4">
              Sua conta foi criada com sucesso e está aguardando aprovação do administrador. Você receberá acesso assim
              que sua conta for liberada.
            </p>
            <Button onClick={onSwitchToLogin} className="bg-[#BBF717] text-black hover:bg-[#9FD615] font-bold">
              Voltar ao Login
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-[#1C1C1C] border-[#2C2C2C]">
      <CardHeader>
        <CardTitle className="text-white">Criar Conta</CardTitle>
        <CardDescription className="text-gray-400">
          Preencha os dados para solicitar acesso ao EXL Trading Hub
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nome Completo</label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Seu nome completo"
              required
              className="bg-[#2A2B2A] border-[#555] text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="seu@email.com"
              required
              className="bg-[#2A2B2A] border-[#555] text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Telefone</label>
            <Input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="(11) 99999-9999"
              required
              className="bg-[#2A2B2A] border-[#555] text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Experiência em Trading</label>
            <select
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              required
              className="w-full p-2 bg-[#2A2B2A] border border-[#555] text-white rounded"
            >
              <option value="">Selecione sua experiência</option>
              <option value="iniciante">Iniciante (0-1 ano)</option>
              <option value="intermediario">Intermediário (1-3 anos)</option>
              <option value="avancado">Avançado (3-5 anos)</option>
              <option value="profissional">Profissional (5+ anos)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Senha</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
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

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Confirmar Senha</label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="bg-[#2A2B2A] border-[#555] text-white pr-10"
              />
              <Button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-auto bg-transparent hover:bg-transparent"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-400 px-3 py-2 rounded text-sm">{error}</div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#BBF717] text-black hover:bg-[#9FD615] font-bold"
          >
            {isLoading ? "Criando conta..." : "Criar Conta"}
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-400">
              Já tem uma conta?{" "}
              <button type="button" onClick={onSwitchToLogin} className="text-[#BBF717] hover:underline">
                Faça login
              </button>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
