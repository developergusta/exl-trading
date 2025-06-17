"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/use-auth"
import { useCommunity } from "@/hooks/use-community"
import { Heart, MessageCircle, ImageIcon, Send, MoreHorizontal } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export function CommunityFeed() {
  const { user } = useAuth()
  const { posts, addPost, toggleLike, addComment } = useCommunity()
  const [newPost, setNewPost] = useState("")
  const [isPosting, setIsPosting] = useState(false)

  const handleSubmit = async () => {
    if (!newPost.trim()) return

    setIsPosting(true)
    await addPost({
      content: newPost,
      authorId: user!.id,
      authorName: user!.name,
      authorAvatar: `/avatars/${user!.id}.png`,
      type: "text",
    })
    setNewPost("")
    setIsPosting(false)
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
    <div className="max-w-2xl mx-auto">
      {/* Create Post */}
      <Card className="bg-[#1C1C1C] border-[#2C2C2C] mb-4">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={`/avatars/${user?.id}.png`} />
              <AvatarFallback className="bg-[#BBF717] text-black text-sm font-bold">
                {getInitials(user?.name || "")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="O que você está pensando?"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="border-none resize-none text-gray-300 placeholder-gray-500 focus:ring-0 p-0"
                rows={3}
              />
              <div className="flex justify-between items-center mt-3">
                <Button variant="ghost" size="sm" className="text-gray-500 p-2">
                  <ImageIcon className="w-5 h-5" />
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!newPost.trim() || isPosting}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isPosting ? "Publicando..." : "Publicar"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="bg-[#1C1C1C] border-[#2C2C2C]">
            <CardContent className="p-4">
              {/* Post Header */}
              <div className="flex items-start justify-between mb-3">
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
                <Button variant="ghost" size="sm" className="text-gray-400">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>

              {/* Post Content */}
              <div className="mb-4">
                <p className="text-gray-200 leading-relaxed">{post.content}</p>

                {/* Trading Chart/Image */}
                {post.image && (
                  <div className="mt-3 rounded-lg overflow-hidden bg-black">
                    <img src={post.image || "/placeholder.svg"} alt="Trading chart" className="w-full h-auto" />
                  </div>
                )}

                {/* Trading Performance Data */}
                {post.tradingData && (
                  <div className="mt-3 bg-black rounded-lg p-4 text-white">
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="text-lg font-semibold">P&L</h5>
                      <div className="flex gap-2 text-xs">
                        <span className="bg-blue-600 px-2 py-1 rounded">1S</span>
                        <span className="text-gray-400">1M</span>
                        <span className="text-gray-400">3M</span>
                        <span className="text-gray-400">6M</span>
                        <span className="text-gray-400">2025</span>
                      </div>
                    </div>

                    {/* Mock Chart Area */}
                    <div className="h-32 bg-gradient-to-t from-green-900/20 to-transparent rounded mb-3 flex items-end">
                      <div className="w-full h-20 bg-green-500 rounded-sm opacity-80"></div>
                    </div>

                    {/* Trading Stats */}
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Realized</span>
                        <span className="text-green-400">R$ {post.tradingData.totalRealized}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Net Profit</span>
                        <span className="text-green-400">R$ {post.tradingData.netProfit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Winning Percent</span>
                        <span>{post.tradingData.winRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Trade Count</span>
                        <span>{post.tradingData.tradeCount}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Post Actions */}
              <div className="flex items-center gap-6 pt-3 border-t border-[#2C2C2C]">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleLike(post.id)}
                  className={`flex items-center gap-2 ${
                    post.isLiked ? "text-red-500" : "text-gray-500"
                  } hover:text-red-500`}
                >
                  <Heart className={`w-4 h-4 ${post.isLiked ? "fill-current" : ""}`} />
                  <span>{post.likes}</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-500 hover:text-blue-500">
                  <MessageCircle className="w-4 h-4" />
                  <span>{post.comments}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {posts.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Nenhum post ainda</h3>
            <p className="text-gray-500">Seja o primeiro a compartilhar algo com a comunidade!</p>
          </div>
        )}
      </div>
    </div>
  )
}
