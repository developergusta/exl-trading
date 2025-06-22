"use client";

import { AlertDialog } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useCommunity } from "@/hooks/use-community";
import { useCompanyFeed } from "@/hooks/use-company-feed";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Building,
  ImageIcon,
  MessageSquare,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { useRef, useState } from "react";

interface CompanyPost {
  id: string;
  content: string | null;
  image_url: string | null;
  created_at: string;
  author_id: string;
}

interface CommunityPost {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  type: "text" | "image" | "trading";
  image?: string;
  tradingData?: any;
  likes: number;
  comments: number;
  isLiked: boolean;
  createdAt: string;
}

type Post = CompanyPost | CommunityPost;

interface DeleteConfirmation {
  postId: string;
  type: "community" | "company";
  isOpen: boolean;
}

export function CommunityModeration() {
  const { posts: communityPosts, deletePost: deleteCommunityPost } =
    useCommunity();
  const {
    posts: companyPosts,
    addPost: addCompanyPost,
    deletePost: deleteCompanyPost,
  } = useCompanyFeed();
  const [newCompanyPost, setNewCompanyPost] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isAddingPost, setIsAddingPost] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] =
    useState<DeleteConfirmation>({
      postId: "",
      type: "company",
      isOpen: false,
    });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("A imagem deve ter no máximo 5MB");
      return;
    }

    // Validar tipo
    if (!file.type.startsWith("image/")) {
      alert("O arquivo deve ser uma imagem");
      return;
    }

    setSelectedImage(file);
  };

  const handleAddCompanyPost = async () => {
    if (!newCompanyPost.trim() && !selectedImage) return;

    setIsAddingPost(true);
    try {
      await addCompanyPost({
        content: newCompanyPost,
        image: selectedImage,
      });
      setNewCompanyPost("");
      setSelectedImage(null);
    } catch (error) {
      console.error("Error posting:", error);
      alert("Erro ao publicar o post. Tente novamente.");
    } finally {
      setIsAddingPost(false);
    }
  };

  const handleDeleteConfirm = (
    postId: string,
    type: "community" | "company"
  ) => {
    setDeleteConfirmation({
      postId,
      type,
      isOpen: true,
    });
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation({
      postId: "",
      type: "company",
      isOpen: false,
    });
  };

  const handleDeletePost = async () => {
    const { postId, type } = deleteConfirmation;

    try {
      console.log(type, postId);
      if (type === "community") {
        await deleteCommunityPost(postId);
      } else {
        await deleteCompanyPost(postId);
      }
    } catch (error) {
      console.error("Erro ao excluir post:", error);
      alert("Erro ao excluir o post. Tente novamente.");
    } finally {
      handleDeleteCancel();
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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

          <div className="flex items-center gap-4">
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
              className="text-gray-500 hover:text-white"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="w-5 h-5 mr-2" />
              Adicionar Imagem
            </Button>

            <Button
              onClick={handleAddCompanyPost}
              disabled={
                (!newCompanyPost.trim() && !selectedImage) || isAddingPost
              }
              className="bg-[#BBF717] text-black hover:bg-[#9FD615] ml-auto"
            >
              <Send className="w-4 h-4 mr-2" />
              {isAddingPost ? "Publicando..." : "Publicar Atualização"}
            </Button>
          </div>
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
                      <AvatarFallback className="bg-[#BBF717] text-black text-sm font-bold">
                        EXL
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-white">EXL Trading</h4>
                      <p className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(post.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleDeleteConfirm(post.id, "company")}
                      size="sm"
                      variant="outline"
                      className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white p-1 h-8 w-8"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-gray-200 text-sm line-clamp-3">
                  {post.content}
                </p>
                {post.image_url && (
                  <div className="mt-3">
                    <img
                      src={post.image_url}
                      alt="Imagem do post"
                      className="rounded-lg w-full max-h-[300px] object-cover"
                    />
                  </div>
                )}
              </div>
            ))}
            {companyPosts.length === 0 && (
              <p className="text-gray-400 text-center py-4">
                Nenhum post da empresa ainda
              </p>
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
                      <AvatarImage
                        src={post.authorAvatar || "/placeholder.svg"}
                      />
                      <AvatarFallback className="bg-gray-300 text-gray-700 text-sm font-bold">
                        {getInitials(post.authorName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-white">
                        {post.authorName}
                      </h4>
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
                      onClick={() => handleDeleteConfirm(post.id, "community")}
                      size="sm"
                      variant="outline"
                      className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white p-1 h-8 w-8"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-gray-200 text-sm line-clamp-3">
                  {post.content}
                </p>
                {post.image && (
                  <div className="mt-3">
                    <img
                      src={post.image}
                      alt="Imagem do post"
                      className="rounded-lg w-full max-h-[300px] object-cover"
                    />
                  </div>
                )}
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                  <span>❤️ {post.likes} curtidas</span>
                  <span>💬 {post.comments} comentários</span>
                </div>
              </div>
            ))}
            {communityPosts.length === 0 && (
              <p className="text-gray-400 text-center py-4">
                Nenhum post da comunidade ainda
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Post Detail Dialog */}
      {selectedPost && (
        <Dialog
          open={!!selectedPost}
          onOpenChange={() => setSelectedPost(null)}
        >
          <DialogContent className="bg-[#1C1C1C] border-[#2C2C2C] text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalhes do Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage
                    src={
                      "authorAvatar" in selectedPost
                        ? selectedPost.authorAvatar
                        : "/images/exl-logo.png"
                    }
                  />
                  <AvatarFallback className="bg-[#BBF717] text-black text-sm font-bold">
                    {"authorName" in selectedPost
                      ? getInitials(selectedPost.authorName)
                      : "EXL"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-white">
                    {"authorName" in selectedPost
                      ? selectedPost.authorName
                      : "EXL Trading"}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(
                      new Date(
                        "createdAt" in selectedPost
                          ? selectedPost.createdAt
                          : selectedPost.created_at
                      ),
                      {
                        addSuffix: true,
                        locale: ptBR,
                      }
                    )}
                  </p>
                </div>
              </div>
              <div className="bg-[#2A2B2A] p-4 rounded-lg">
                <p className="text-gray-200 whitespace-pre-line">
                  {selectedPost.content}
                </p>
                {"image_url" in selectedPost && selectedPost.image_url && (
                  <div className="mt-3">
                    <img
                      src={selectedPost.image_url}
                      alt="Imagem do post"
                      className="rounded-lg w-full max-h-[300px] object-cover"
                    />
                  </div>
                )}
                {"image" in selectedPost && selectedPost.image && (
                  <div className="mt-3">
                    <img
                      src={selectedPost.image}
                      alt="Imagem do post"
                      className="rounded-lg w-full max-h-[300px] object-cover"
                    />
                  </div>
                )}
              </div>
              {"tradingData" in selectedPost && selectedPost.tradingData && (
                <div className="bg-black p-4 rounded-lg">
                  <h5 className="text-white font-semibold mb-2">
                    Dados de Trading
                  </h5>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Total Realizado:</span>
                      <span className="text-green-400 ml-2">
                        R$ {selectedPost.tradingData.totalRealized}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Lucro Líquido:</span>
                      <span className="text-green-400 ml-2">
                        R$ {selectedPost.tradingData.netProfit}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Win Rate:</span>
                      <span className="text-white ml-2">
                        {selectedPost.tradingData.winRate}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Trades:</span>
                      <span className="text-white ml-2">
                        {selectedPost.tradingData.tradeCount}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              {"likes" in selectedPost && (
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>❤️ {selectedPost.likes} curtidas</span>
                  <span>💬 {selectedPost.comments} comentários</span>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteConfirmation.isOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) handleDeleteCancel();
        }}
        title="Confirmar Exclusão"
        description="Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={handleDeletePost}
        variant="danger"
      />
    </div>
  );
}
