"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface CommunityPost {
  id: string
  content: string
  authorId: string
  authorName: string
  authorAvatar: string
  type: "text" | "image" | "trading"
  image?: string
  tradingData?: {
    totalRealized: string
    netProfit: string
    winRate: string
    tradeCount: number
  }
  likes: number
  comments: number
  isLiked: boolean
  createdAt: string
}

interface CommunityContextType {
  posts: CommunityPost[]
  addPost: (post: Omit<CommunityPost, "id" | "likes" | "comments" | "isLiked" | "createdAt">) => Promise<void>
  toggleLike: (postId: string) => void
  addComment: (postId: string, comment: string) => void
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined)

export function CommunityProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<CommunityPost[]>([])

  useEffect(() => {
    // Load posts from localStorage
    const savedPosts = localStorage.getItem("communityPosts")
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts))
    } else {
      // Initialize with sample posts
      const samplePosts: CommunityPost[] = [
        {
          id: "1",
          content: "Só perde quem nunca tentou.\nMaior gain e devolvendo mercado. Ajustando bora time pra cima",
          authorId: "user-1",
          authorName: "Raynold G.",
          authorAvatar: "/avatars/raynold.png",
          type: "trading",
          tradingData: {
            totalRealized: "4,380",
            netProfit: "4,380",
            winRate: "73.33",
            tradeCount: 15,
          },
          likes: 12,
          comments: 3,
          isLiked: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        },
        {
          id: "2",
          content: "O Day Trade é difícil, mas libertador. Resultado da minha semana 09/10-12/10 🚀🚀",
          authorId: "user-2",
          authorName: "Paulo Soares",
          authorAvatar: "/avatars/paulo.png",
          type: "trading",
          tradingData: {
            totalRealized: "1,231.50",
            netProfit: "1,397.00",
            winRate: "73.33",
            tradeCount: 15,
          },
          likes: 8,
          comments: 2,
          isLiked: true,
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        },
      ]
      setPosts(samplePosts)
      localStorage.setItem("communityPosts", JSON.stringify(samplePosts))
    }
  }, [])

  const addPost = async (postData: Omit<CommunityPost, "id" | "likes" | "comments" | "isLiked" | "createdAt">) => {
    const newPost: CommunityPost = {
      ...postData,
      id: `post-${Date.now()}`,
      likes: 0,
      comments: 0,
      isLiked: false,
      createdAt: new Date().toISOString(),
    }

    const updatedPosts = [newPost, ...posts]
    setPosts(updatedPosts)
    localStorage.setItem("communityPosts", JSON.stringify(updatedPosts))
  }

  const toggleLike = (postId: string) => {
    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
        }
      }
      return post
    })
    setPosts(updatedPosts)
    localStorage.setItem("communityPosts", JSON.stringify(updatedPosts))
  }

  const addComment = (postId: string, comment: string) => {
    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        return {
          ...post,
          comments: post.comments + 1,
        }
      }
      return post
    })
    setPosts(updatedPosts)
    localStorage.setItem("communityPosts", JSON.stringify(updatedPosts))
  }

  return (
    <CommunityContext.Provider
      value={{
        posts,
        addPost,
        toggleLike,
        addComment,
      }}
    >
      {children}
    </CommunityContext.Provider>
  )
}

export function useCommunity() {
  const context = useContext(CommunityContext)
  if (context === undefined) {
    throw new Error("useCommunity must be used within a CommunityProvider")
  }
  return context
}
