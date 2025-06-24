"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useCommunity } from "@/hooks/use-community";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageCircle, Reply, Send, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CommentSectionProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CommentSection({
  postId,
  isOpen,
  onClose,
}: CommentSectionProps) {
  const { user } = useAuth();
  const { comments, commentsLoading, getComments, addComment, deleteComment } =
    useCommunity();
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const postComments = comments[postId] || [];
  const isLoading = commentsLoading[postId] || false;

  const handleLoadComments = async () => {
    if (!postComments.length) {
      await getComments(postId);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setIsSubmitting(true);
      await addComment(postId, newComment);
      setNewComment("");
      toast.success("Comentário adicionado!");
    } catch {
      toast.error("Erro ao adicionar comentário");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddReply = async (parentId: string) => {
    if (!replyContent.trim()) return;

    try {
      setIsSubmitting(true);
      await addComment(postId, replyContent, parentId);
      setReplyContent("");
      setReplyingTo(null);
      toast.success("Resposta adicionada!");
    } catch {
      toast.error("Erro ao adicionar resposta");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Deseja realmente excluir este comentário?")) return;

    try {
      await deleteComment(commentId, postId);
      toast.success("Comentário excluído!");
    } catch {
      toast.error("Erro ao excluir comentário");
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

  if (!isOpen) return null;

  return (
    <div className="mt-4 pt-4 border-t border-[#2C2C2C]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-white font-medium flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          Comentários
        </h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </Button>
      </div>

      {/* Formulário de novo comentário */}
      <div className="flex gap-3 mb-4">
        <Avatar className="w-8 h-8">
          <AvatarImage src={user?.avatar_url || "/placeholder-user.jpg"} />
          <AvatarFallback className="bg-[#BBF717] text-black text-xs font-bold">
            {getInitials(user?.name || "")}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea
            placeholder="Escreva um comentário..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[60px] resize-none bg-[#2C2C2C] border-[#3C3C3C] text-gray-200 placeholder-gray-500"
          />
          <div className="flex justify-end mt-2">
            <Button
              onClick={handleAddComment}
              disabled={!newComment.trim() || isSubmitting}
              size="sm"
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Send className="w-3 h-3 mr-1" />
              {isSubmitting ? "Enviando..." : "Comentar"}
            </Button>
          </div>
        </div>
      </div>

      {/* Lista de comentários */}
      <div className="space-y-4">
        {!postComments.length && !isLoading ? (
          <div className="text-center py-6">
            <MessageCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Nenhum comentário ainda</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLoadComments}
              className="text-blue-400 hover:text-blue-300 mt-2"
            >
              Carregar comentários
            </Button>
          </div>
        ) : isLoading ? (
          <div className="text-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-gray-400 text-sm">Carregando comentários...</p>
          </div>
        ) : (
          postComments.map((comment) => (
            <div key={comment.id} className="space-y-3">
              {/* Comentário principal */}
              <div className="flex gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={comment.authorAvatar} />
                  <AvatarFallback className="bg-gray-300 text-gray-700 text-xs font-bold">
                    {getInitials(comment.authorName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-[#2C2C2C] rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-medium text-sm">
                        {comment.authorName}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>
                        {comment.authorId === user?.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-gray-400 hover:text-red-400 p-1 h-auto"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-200 text-sm">{comment.content}</p>
                  </div>
                  <div className="flex items-center mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setReplyingTo(
                          replyingTo === comment.id ? null : comment.id
                        )
                      }
                      className="text-xs text-gray-400 hover:text-blue-400 p-1"
                    >
                      <Reply className="w-3 h-3 mr-1" />
                      Responder
                    </Button>
                  </div>

                  {/* Formulário de resposta */}
                  {replyingTo === comment.id && (
                    <div className="flex gap-2 mt-3">
                      <Avatar className="w-6 h-6">
                        <AvatarImage
                          src={user?.avatar_url || "/placeholder-user.jpg"}
                        />
                        <AvatarFallback className="bg-[#BBF717] text-black text-xs font-bold">
                          {getInitials(user?.name || "")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Textarea
                          placeholder={`Respondendo para ${comment.authorName}...`}
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          className="min-h-[50px] text-sm resize-none bg-[#2C2C2C] border-[#3C3C3C] text-gray-200"
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyContent("");
                            }}
                            className="text-xs text-gray-400"
                          >
                            Cancelar
                          </Button>
                          <Button
                            onClick={() => handleAddReply(comment.id)}
                            disabled={!replyContent.trim() || isSubmitting}
                            size="sm"
                            className="text-xs bg-blue-500 hover:bg-blue-600"
                          >
                            Responder
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Respostas */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-11 space-y-3">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex gap-3">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={reply.authorAvatar} />
                        <AvatarFallback className="bg-gray-300 text-gray-700 text-xs font-bold">
                          {getInitials(reply.authorName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="bg-[#252525] rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white font-medium text-xs">
                              {reply.authorName}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400">
                                {formatDistanceToNow(
                                  new Date(reply.createdAt),
                                  {
                                    addSuffix: true,
                                    locale: ptBR,
                                  }
                                )}
                              </span>
                              {reply.authorId === user?.id && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteComment(reply.id)}
                                  className="text-gray-400 hover:text-red-400 p-1 h-auto"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                          <p className="text-gray-200 text-xs">
                            {reply.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Botão para carregar comentários se houver alguns */}
      {!isLoading && postComments.length === 0 && (
        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLoadComments}
            className="text-blue-400 hover:text-blue-300"
          >
            Carregar comentários
          </Button>
        </div>
      )}
    </div>
  );
}
