"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface CompanyPost {
  id: string
  content: string
  authorName: string
  authorAvatar: string
  type: "company"
  image?: string
  createdAt: string
}

interface CompanyFeedContextType {
  posts: CompanyPost[]
  addPost: (post: Omit<CompanyPost, "id" | "createdAt">) => Promise<void>
}

const CompanyFeedContext = createContext<CompanyFeedContextType | undefined>(undefined)

export function CompanyFeedProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<CompanyPost[]>([])

  useEffect(() => {
    // Load posts from localStorage
    const savedPosts = localStorage.getItem("companyPosts")
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts))
    } else {
      // Initialize with sample posts
      const samplePosts: CompanyPost[] = [
        {
          id: "1",
          content: `🚀 Nova funcionalidade disponível!

Acabamos de lançar o Simulador Monte Carlo no EXL Trading Hub. Agora você pode:

✅ Simular cenários futuros baseados em suas estatísticas
✅ Visualizar curvas de equity potenciais
✅ Analisar distribuição de resultados
✅ Tomar decisões mais informadas

Acesse agora mesmo através do hub principal!

#EXLTrading #MonteCarlo #Trading`,
          authorName: "EXL Trading",
          authorAvatar: "/images/exl-logo.png",
          type: "company",
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        },
        {
          id: "2",
          content: `📊 Atualização do Sistema

Implementamos melhorias significativas na plataforma:

🔧 Performance otimizada em 40%
🔧 Nova interface para gestão de risco
🔧 Correções de bugs reportados
🔧 Backup automático dos dados

A atualização já está ativa para todos os usuários. Qualquer dúvida, entre em contato conosco!`,
          authorName: "EXL Trading",
          authorAvatar: "/images/exl-logo.png",
          type: "company",
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        },
      ]
      setPosts(samplePosts)
      localStorage.setItem("companyPosts", JSON.stringify(samplePosts))
    }
  }, [])

  const addPost = async (postData: Omit<CompanyPost, "id" | "createdAt">) => {
    const newPost: CompanyPost = {
      ...postData,
      id: `company-post-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }

    const updatedPosts = [newPost, ...posts]
    setPosts(updatedPosts)
    localStorage.setItem("companyPosts", JSON.stringify(updatedPosts))
  }

  return (
    <CompanyFeedContext.Provider
      value={{
        posts,
        addPost,
      }}
    >
      {children}
    </CompanyFeedContext.Provider>
  )
}

export function useCompanyFeed() {
  const context = useContext(CompanyFeedContext)
  if (context === undefined) {
    throw new Error("useCompanyFeed must be used within a CompanyFeedProvider")
  }
  return context
}
