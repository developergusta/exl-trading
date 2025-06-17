"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useCommunity } from "@/hooks/use-community"
import { useCompanyFeed } from "@/hooks/use-company-feed"
import { MessageSquare, Trash2, Eye, Flag, Send, Building } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export function CommunityModeration() {
  const { posts: communityPosts } = useCommunity()
  const { posts: companyPosts, addPost: addCompanyPost } = useCompanyFeed()
  const [newCompanyPost, setNewCompanyPost] = useState("")
  const [isAddingPost, setIsAddingPost] = useState(false)
  const [selectedPost, setSelectedPost] = useState<any>(null)

  const handleAddCompanyPost = async () => {
    if (!newCompanyPost.trim()) return

    setIsAddingPost(true)
    await addCompanyPost({
      content: newCompanyPost,
      authorName: "EXL Trading",
      authorAvatar: "/images/exl-logo.png",
      type: "company",
    })
    setNewCompanyPost("")
    setIsAddingPost(false)
  }

  const handleDeletePost = (postId: string, type: "community" | "company") => {
    if (!confirm("Tem certeza que deseja excluir este post?")) return

    if (type === "community") {
      const posts = JSON.parse(localStorage.getItem("communityPosts") || "[]")
      const updatedPosts = posts.filter((p: any) => p.id !== postId)
      localStorage.setItem("communityPosts", JSON.stringify(updatedPosts))
    } else {
      const posts = JSON.parse(localStorage.getItem("companyPosts") || "[]")
      const updatedPosts = posts.filter((p: any) => p.id !== postId)
      localStorage.setItem("companyPosts", JSON.stringify(updatedPosts))
    }

    window.location.reload() // Refresh to update the lists
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-6">
      {/* Add Company Post */}
      <Card className="bg-[#1C1C1C] border-[#2C2C2C]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Building className="w-5 h-5" />
            Nova Atualização da Empresa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Escreva uma atualização oficial da EXL Trading..."
            value={newCompanyPost}
            onChange={(e) => setNewCompanyPost(e.target.value)}
            className="bg-[#2A2B2A] border-[#555] text-white min-h-[120px]"
            rows={5}
          />
          <Button
            onClick={handleAddCompanyPost}
            disabled={!newCompanyPost.trim() || isAddingPost}
            className="bg-[#BBF717] text-black hover:bg-[#9FD615]"
          >
            <Send className="w-4 h-4 mr-2" />
            {isAddingPost ? "Publicando..." : "Publicar Atualização"}
          </Button>
        </CardContent>
      </Card>

      {/* Company Posts */}
      <Card className="bg-[#1C1C1C] border-[#2C2C2C]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Building className="w-5 h-5" />
            Posts da Empresa ({companyPosts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {companyPosts.map((post) => (
              <div key={post.id} className="bg-[#2A2B2A] p-4 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src="/images/exl-logo.png" />
                      <AvatarFallback className="bg-[#BBF717] text-black text-sm font-bold">EXL</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-white">EXL Trading</h4>
                      <p className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(post.createdAt), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setSelectedPost(post)}
                      size="sm"
                      variant="outline"
                      className="border-[#555] text-white hover:bg-[#2C2C2C] p-1 h-8 w-8"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeletePost(post.id, "company")}
                      size="sm"
                      variant="outline"
                      className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white p-1 h-8 w-8"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-gray-200 text-sm line-clamp-3">{post.content}</p>
              </div>
            ))}
            {companyPosts.length === 0 && (
              <p className="text-gray-400 text-center py-4">Nenhum post da empresa ainda</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Community Posts */}
      <Card className="bg-[#1C1C1C] border-[#2C2C2C]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <MessageSquare className="w-5 h-5" />
            Posts da Comunidade ({communityPosts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {communityPosts.map((post) => (
              <div key={post.id} className="bg-[#2A2B2A] p-4 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={post.authorAvatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-gray-300 text-gray-700 text-sm font-bold">
                        {getInitials(post.authorName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-white">{post.authorName}</h4>
                      <p className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(post.createdAt), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setSelectedPost(post)}
                      size="sm"
                      variant="outline"
                      className="border-[#555] text-white hover:bg-[#2C2C2C] p-1 h-8 w-8"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-black p-1 h-8 w-8"
                    >
                      <Flag className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeletePost(post.id, "community")}
                      size="sm"
                      variant="outline"
                      className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white p-1 h-8 w-8"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-gray-200 text-sm line-clamp-3">{post.content}</p>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                  <span>❤️ {post.likes} curtidas</span>
                  <span>💬 {post.comments} comentários</span>
                </div>
              </div>
            ))}
            {communityPosts.length === 0 && (
              <p className="text-gray-400 text-center py-4">Nenhum post da comunidade ainda</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Post Detail Dialog */}
      {selectedPost && (
        <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
          <DialogContent className="bg-[#1C1C1C] border-[#2C2C2C] text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalhes do Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={selectedPost.authorAvatar || "/images/exl-logo.png"} />
                  <AvatarFallback className="bg-[#BBF717] text-black text-sm font-bold">
                    {getInitials(selectedPost.authorName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-white">{selectedPost.authorName}</h4>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(selectedPost.createdAt), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>
              <div className="bg-[#2A2B2A] p-4 rounded-lg">
                <p className="text-gray-200 whitespace-pre-line">{selectedPost.content}</p>
              </div>
              {selectedPost.tradingData && (
                <div className="bg-black p-4 rounded-lg">
                  <h5 className="text-white font-semibold mb-2">Dados de Trading</h5>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Total Realizado:</span>
                      <span className="text-green-400 ml-2">R$ {selectedPost.tradingData.totalRealized}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Lucro Líquido:</span>
                      <span className="text-green-400 ml-2">R$ {selectedPost.tradingData.netProfit}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Win Rate:</span>
                      <span className="text-white ml-2">{selectedPost.tradingData.winRate}%</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Trades:</span>
                      <span className="text-white ml-2">{selectedPost.tradingData.tradeCount}</span>
                    </div>
                  </div>
                </div>
              )}
              {selectedPost.likes !== undefined && (
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>❤️ {selectedPost.likes} curtidas</span>
                  <span>💬 {selectedPost.comments} comentários</span>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
