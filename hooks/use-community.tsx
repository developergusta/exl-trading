"use client";

import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { v4 as uuidv4 } from "uuid";

interface TradingData {
  totalRealized: string;
  netProfit: string;
  winRate: string;
  tradeCount: number;
}

interface CommunityComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  parentId?: string;
  createdAt: string;
  replies?: CommunityComment[];
}

interface CommunityPost {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  type: "text" | "image" | "trading";
  image?: string;
  tradingData?: TradingData;
  likes: number;
  comments: number;
  isLiked: boolean;
  createdAt: string;
}

interface DatabasePost {
  id: string;
  content: string;
  author_id: string;
  type: "text" | "image" | "trading";
  image_url?: string;
  trading_data?: TradingData;
  likes_count: number;
  comments_count: number;
  created_at: string;
  author?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
}

interface CommunityContextType {
  posts: CommunityPost[];
  isLoading: boolean;
  comments: Record<string, CommunityComment[]>;
  commentsLoading: Record<string, boolean>;
  addPost: (
    post: Omit<
      CommunityPost,
      "id" | "likes" | "comments" | "isLiked" | "createdAt"
    >,
    file?: File
  ) => Promise<void>;
  toggleLike: (postId: string) => Promise<void>;
  addComment: (
    postId: string,
    content: string,
    parentId?: string
  ) => Promise<void>;
  getComments: (postId: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  deleteComment: (commentId: string, postId: string) => Promise<void>;
}

const CommunityContext = createContext<CommunityContextType | undefined>(
  undefined
);

export function CommunityProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [comments, setComments] = useState<Record<string, CommunityComment[]>>(
    {}
  );
  const [commentsLoading, setCommentsLoading] = useState<
    Record<string, boolean>
  >({});

  const fetchPosts = async () => {
    try {
      if (!supabase) return;

      const { data: postsData, error: postsError } = await supabase
        .from("community_posts")
        .select(
          `
          *,
          author:author_id (
            id,
            name,
            avatar_url
          )
        `
        )
        .order("created_at", { ascending: false });

      if (postsError) throw postsError;

      const postsWithLikes = await Promise.all(
        ((postsData as DatabasePost[]) || []).map(async (post) => {
          if (!supabase) return null;

          const { data: likesData } = await supabase
            .from("community_post_likes")
            .select("user_id")
            .eq("post_id", post.id);

          const isLiked = (likesData || []).some(
            (like) => like.user_id === user?.id
          );

          const communityPost: CommunityPost = {
            id: post.id,
            content: post.content,
            authorId: post.author_id,
            authorName: post.author?.name || "Usuário",
            authorAvatar: post.author?.avatar_url || "/placeholder-user.jpg",
            type: post.type,
            image: post.image_url,
            tradingData: post.trading_data,
            likes: post.likes_count || 0,
            comments: post.comments_count || 0,
            isLiked,
            createdAt: post.created_at,
          };

          return communityPost;
        })
      );

      setPosts(
        postsWithLikes.filter((post): post is CommunityPost => post !== null)
      );
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !supabase) return;

    fetchPosts();

    // Subscribe to realtime changes
    const postsSubscription = supabase
      .channel("community_posts")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "community_posts",
        },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      postsSubscription.unsubscribe();
    };
  }, [user]);

  const uploadImage = async (file: File): Promise<string> => {
    console.log("uploadImage", file);
    if (!supabase) throw new Error("Supabase client not available");

    const fileExt = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `community-posts/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("publico")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from("publico").getPublicUrl(filePath);

    return publicUrl;
  };

  const addPost = async (
    postData: Omit<
      CommunityPost,
      "id" | "likes" | "comments" | "isLiked" | "createdAt"
    >,
    file?: File
  ) => {
    if (!user) throw new Error("User not authenticated");
    if (!supabase) throw new Error("Supabase client not available");

    try {
      let imageUrl = undefined;
      if (file) {
        imageUrl = await uploadImage(file);
      }

      const { error: insertError } = await supabase
        .from("community_posts")
        .insert({
          content: postData.content,
          author_id: user.id,
          type: postData.type,
          image_url: imageUrl,
          trading_data: postData.tradingData,
        });

      if (insertError) throw insertError;
    } catch (error) {
      console.error("Error adding post:", error);
      throw error;
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user || !supabase) return;

    try {
      const post = posts.find((p) => p.id === postId);
      if (!post) return;

      // Atualização otimista - atualiza o estado imediatamente
      const newIsLiked = !post.isLiked;
      const newLikesCount = newIsLiked ? post.likes + 1 : post.likes - 1;

      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === postId
            ? { ...p, isLiked: newIsLiked, likes: newLikesCount }
            : p
        )
      );

      // Executa as operações no banco em paralelo
      if (post.isLiked) {
        // Unlike
        await Promise.all([
          supabase
            .from("community_post_likes")
            .delete()
            .match({ post_id: postId, user_id: user.id }),
          supabase
            .from("community_posts")
            .update({ likes_count: post.likes - 1 })
            .eq("id", postId),
        ]);
      } else {
        // Like
        await Promise.all([
          supabase
            .from("community_post_likes")
            .insert({ post_id: postId, user_id: user.id }),
          supabase
            .from("community_posts")
            .update({ likes_count: post.likes + 1 })
            .eq("id", postId),
        ]);
      }
    } catch (error) {
      console.error("Error toggling like:", error);

      // Em caso de erro, reverte o estado otimista
      const post = posts.find((p) => p.id === postId);
      if (post) {
        setPosts((prevPosts) =>
          prevPosts.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  isLiked: !p.isLiked,
                  likes: p.isLiked ? p.likes - 1 : p.likes + 1,
                }
              : p
          )
        );
      }
    }
  };

  const getComments = async (postId: string) => {
    if (!supabase) return;

    try {
      setCommentsLoading((prev) => ({ ...prev, [postId]: true }));

      const { data: commentsData, error } = await supabase
        .from("community_comments")
        .select(
          `
          *,
          author:author_id (
            id,
            name,
            avatar_url
          )
        `
        )
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const formattedComments: CommunityComment[] = (commentsData || []).map(
        (comment: any) => ({
          id: comment.id,
          postId: comment.post_id,
          authorId: comment.author_id,
          authorName: comment.author?.name || "Usuário",
          authorAvatar: comment.author?.avatar_url || "/placeholder-user.jpg",
          content: comment.content,
          parentId: comment.parent_id,
          createdAt: comment.created_at,
        })
      );

      // Organizar comentários com replies
      const commentsWithReplies = formattedComments
        .filter((comment) => !comment.parentId)
        .map((comment) => ({
          ...comment,
          replies: formattedComments.filter(
            (reply) => reply.parentId === comment.id
          ),
        }));

      setComments((prev) => ({ ...prev, [postId]: commentsWithReplies }));
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setCommentsLoading((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const addComment = async (
    postId: string,
    content: string,
    parentId?: string
  ) => {
    if (!user || !supabase) return;

    try {
      const { error } = await supabase.from("community_comments").insert({
        post_id: postId,
        author_id: user.id,
        content,
        parent_id: parentId || null,
      });

      if (error) throw error;

      // Recarregar comentários após adicionar
      await getComments(postId);
    } catch (error) {
      console.error("Error adding comment:", error);
      throw error;
    }
  };

  const deleteComment = async (commentId: string, postId: string) => {
    if (!user || !supabase) return;

    try {
      const { error } = await supabase
        .from("community_comments")
        .delete()
        .eq("id", commentId)
        .eq("author_id", user.id);

      if (error) throw error;

      // Recarregar comentários após deletar
      await getComments(postId);
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  };

  const deletePost = async (postId: string) => {
    if (!user || !supabase) throw new Error("User not authenticated");

    try {
      const { error } = await supabase
        .from("community_posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;

      // Recarregar os posts após a exclusão
      await fetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      throw error;
    }
  };

  return (
    <CommunityContext.Provider
      value={{
        posts,
        isLoading,
        comments,
        commentsLoading,
        addPost,
        toggleLike,
        addComment,
        getComments,
        deletePost,
        deleteComment,
      }}
    >
      {children}
    </CommunityContext.Provider>
  );
}

export function useCommunity() {
  const context = useContext(CommunityContext);
  if (context === undefined) {
    throw new Error("useCommunity must be used within a CommunityProvider");
  }
  return context;
}
