"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useCompanyFeed } from "@/hooks/use-company-feed";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bell, ImageIcon, Plus, Send, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

export function CompanyFeed() {
  const { user, isAdmin } = useAuth();
  const { posts, loading, addPost } = useCompanyFeed();
  const [newPost, setNewPost] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    // Validar tipo
    if (!file.type.startsWith("image/")) {
      toast.error("O arquivo deve ser uma imagem");
      return;
    }

    setSelectedImage(file);
  };

  const handleSubmit = async () => {
    if (!newPost.trim() && !selectedImage) return;

    setIsPosting(true);
    try {
      await addPost({
        content: newPost || null,
        image: selectedImage,
      });
      setNewPost("");
      setSelectedImage(null);
      setShowCreatePost(false);
      toast.success("Post publicado com sucesso!");
    } catch (error) {
      console.error("Error posting:", error);
      toast.error("Erro ao publicar o post. Tente novamente.");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#BBF717] mx-auto"></div>
        </div>
      )}

      {/* Admin Create Post */}
      {isAdmin && !loading && (
        <div className="mb-4">
          {!showCreatePost ? (
            <Button
              onClick={() => setShowCreatePost(true)}
              className="w-full bg-[#BBF717] text-black hover:bg-[#9FD615] font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Atualização da Empresa
            </Button>
          ) : (
            <Card className="bg-[#1C1C1C] border-[#2C2C2C]">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src="/images/exl-logo.png" />
                    <AvatarFallback className="bg-[#BBF717] text-black text-sm font-bold">
                      EXL
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Compartilhe novidades da EXL Trading..."
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      className="border-none resize-none text-white placeholder-gray-500 focus:ring-0 p-0 bg-transparent"
                      rows={4}
                    />
                    {selectedImage && (
                      <div className="mt-2 relative">
                        <img
                          src={URL.createObjectURL(selectedImage)}
                          alt="Selected"
                          className="max-h-48 rounded-lg"
                        />
                        <Button
                          onClick={() => setSelectedImage(null)}
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    <div className="flex justify-between items-center mt-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        ref={fileInputRef}
                        className="hidden"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 p-2"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <ImageIcon className="w-5 h-5" />
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setShowCreatePost(false);
                            setSelectedImage(null);
                            setNewPost("");
                          }}
                          variant="ghost"
                          className="text-gray-500"
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleSubmit}
                          disabled={
                            (!newPost.trim() && !selectedImage) || isPosting
                          }
                          className="bg-[#BBF717] hover:bg-[#9FD615] text-black px-6"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          {isPosting ? "Publicando..." : "Publicar"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Company Posts Feed */}
      {!loading && (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card
              key={post.id}
              className="bg-[#1C1C1C] border-[#2C2C2C] border-l-4 border-l-[#BBF717]"
            >
              <CardContent className="p-4">
                {/* Post Header */}
                <div className="flex items-start gap-3 mb-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src="/images/exl-logo.png" />
                    <AvatarFallback className="bg-[#BBF717] text-black text-sm font-bold">
                      EXL
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-white">EXL Trading</h4>
                      <div className="w-2 h-2 bg-[#BBF717] rounded-full"></div>
                      <span className="text-xs text-gray-500 bg-[#BBF717]/10 px-2 py-1 rounded-full">
                        Oficial
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(post.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                  <Bell className="w-4 h-4 text-[#BBF717]" />
                </div>

                {/* Post Content */}
                <div className="mb-4">
                  {post.content && (
                    <p className="text-gray-200 leading-relaxed whitespace-pre-line">
                      {post.content}
                    </p>
                  )}

                  {post.image_url && (
                    <div className="mt-3 rounded-lg overflow-hidden">
                      <img
                        src={post.image_url}
                        alt="Company update"
                        className="w-full h-auto"
                      />
                    </div>
                  )}
                </div>

                {/* Post Footer */}
                <div className="pt-3 border-t border-[#2C2C2C]">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Atualização oficial da EXL Trading</span>
                    <span>
                      {new Date(post.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {posts.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-[#2C2C2C] rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                Nenhuma publicação ainda
              </h3>
              <p className="text-gray-500">Atualizações aparecerão aqui</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CompanyFeed;
