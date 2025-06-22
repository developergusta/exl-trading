"use client";

import { supabase } from "@/lib/supabase";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { v4 as uuidv4 } from "uuid";

interface CompanyPost {
  id: string;
  content: string | null;
  image_url: string | null;
  created_at: string;
  author_id: string;
}

type CreatePostInput = {
  content?: string | null;
  image?: File | null;
};

interface CompanyFeedContextType {
  posts: CompanyPost[];
  loading: boolean;
  addPost: (input: CreatePostInput) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
}

const CompanyFeedContext = createContext<CompanyFeedContextType | undefined>(
  undefined
);

export function CompanyFeedProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<CompanyPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      if (!supabase) throw new Error("Supabase client not initialized");

      const { data, error } = await supabase
        .from("company_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();

    // Inscrever-se para atualizações em tempo real
    const channel = supabase
      ?.channel("company_posts")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "company_posts",
        },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      channel?.unsubscribe();
    };
  }, []);

  const uploadImage = async (file: File) => {
    try {
      if (!supabase) throw new Error("Supabase client not initialized");

      console.log("Starting image upload...");
      console.log("File:", file.name, file.type, file.size);

      const fileExt = file.name.split(".").pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `company-posts/${fileName}`;

      console.log("Uploading to path:", filePath);

      try {
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from("publico")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          });

        if (uploadError) {
          console.error("Upload error details:", uploadError);
          throw uploadError;
        }

        console.log("Upload successful:", uploadData);
      } catch (error) {
        console.error("Error during upload:", error);
      }

      try {
        const { data } = supabase.storage
          .from("publico")
          .getPublicUrl(filePath);

        console.log("Generated public URL:", data.publicUrl);
        return data.publicUrl;
      } catch (error) {
        console.error("Error getting public URL:", error);
      }
    } catch (error) {
      console.error("Error in uploadImage:", error);
    }
  };

  const addPost = async ({ content, image }: CreatePostInput) => {
    try {
      if (!supabase) throw new Error("Supabase client not initialized");
      if (!content?.trim() && !image) {
        throw new Error("Post must have either content or image");
      }

      let imageUrl = null;
      if (image) {
        console.log("Attempting to upload image...");
        imageUrl = await uploadImage(image);
        console.log("Image upload completed, URL:", imageUrl);
      }

      const user = await supabase.auth.getUser();
      if (!user.data.user?.id) {
        throw new Error("User not authenticated");
      }

      console.log("Creating post with data:", {
        content: content?.trim() || null,
        image_url: imageUrl,
        author_id: user.data.user.id,
      });

      const { error, data } = await supabase
        .from("company_posts")
        .insert([
          {
            content: content?.trim() || null,
            image_url: imageUrl,
            author_id: user.data.user.id,
          },
        ])
        .select();

      if (error) {
        console.error("Error inserting post:", error);
        throw error;
      }

      console.log("Post created successfully:", data);

      // Refresh posts after adding new one
      await fetchPosts();
    } catch (error) {
      console.error("Error in addPost:", error);
      throw error;
    }
  };

  const deletePost = async (postId: string) => {
    try {
      if (!supabase) throw new Error("Supabase client not initialized");

      const { error } = await supabase
        .from("company_posts")
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
    <CompanyFeedContext.Provider
      value={{
        posts,
        loading,
        addPost,
        deletePost,
      }}
    >
      {children}
    </CompanyFeedContext.Provider>
  );
}

export function useCompanyFeed() {
  const context = useContext(CompanyFeedContext);
  if (context === undefined) {
    throw new Error("useCompanyFeed must be used within a CompanyFeedProvider");
  }
  return context;
}
