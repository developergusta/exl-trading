import type { AuthError } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase, type User } from "./supabase";

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  experience: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export class AuthService {
  // Register a new user
  async register(
    data: RegisterData
  ): Promise<{ success: boolean; error?: string; user?: User }> {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: "Supabase não configurado" };
    }

    try {
      // 1. Create auth user and pass profile data for trigger
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            phone: data.phone || null,
            experience: data.experience,
          },
        },
      });

      if (authError) {
        return { success: false, error: this.getErrorMessage(authError) };
      }

      if (!authData.user) {
        return { success: false, error: "Erro ao criar usuário" };
      }

      // Retry buscar o perfil até 5 vezes
      let profile = null;
      let profileError = null;
      for (let i = 0; i < 5; i++) {
        const { data: p, error: e } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authData.user.id)
          .single();
        profile = p;
        profileError = e;
        if (profile) break;
        await new Promise((res) => setTimeout(res, 200));
      }

      if (profileError || !profile) {
        return { success: false, error: "Erro ao criar perfil do usuário" };
      }

      const user: User = {
        id: authData.user.id,
        name: profile.name,
        email: data.email,
        phone: profile.phone,
        experience: profile.experience,
        status: profile.status,
        role: profile.role,
        createdAt: profile.created_at,
      };

      return { success: true, user };
    } catch (error) {
      return { success: false, error: "Erro interno do servidor" };
    }
  }

  // Login user
  async login(
    data: LoginData,
    isAdminMode = false
  ): Promise<{ success: boolean; error?: string; user?: User }> {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: "Supabase não configurado" };
    }

    try {
      // 1. Authenticate user
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

      if (authError) {
        return { success: false, error: this.getErrorMessage(authError) };
      }

      if (!authData.user) {
        return { success: false, error: "Erro ao fazer login" };
      }

      // 2. Get user profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authData.user.id)
        .single();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        return { success: false, error: "Perfil do usuário não encontrado" };
      }

      // 3. Check admin mode
      if (isAdminMode && profile.role !== "admin") {
        await supabase.auth.signOut();
        return { success: false, error: "Acesso administrativo negado" };
      }

      // 4. Check if user is approved (unless admin)
      if (
        !isAdminMode &&
        profile.status !== "approved" &&
        profile.role !== "admin"
      ) {
        // Allow login but return pending status
        const user: User = {
          id: profile.id,
          name: profile.name,
          email: authData.user.email!,
          phone: profile.phone,
          experience: profile.experience,
          status: profile.status,
          role: profile.role,
          createdAt: profile.created_at,
        };
        return { success: true, user };
      }

      const user: User = {
        id: profile.id,
        name: profile.name,
        email: authData.user.email!,
        phone: profile.phone,
        experience: profile.experience,
        status: profile.status,
        role: profile.role,
        createdAt: profile.created_at,
      };

      return { success: true, user };
    } catch (error) {
      return { success: false, error: "Erro interno do servidor" };
    }
  }

  // Logout user
  async logout(): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    await supabase.auth.signOut();
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    if (!isSupabaseConfigured || !supabase) return null;

    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) return null;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (error || !profile) return null;

      return {
        id: profile.id,
        name: profile.name,
        email: authUser.email!,
        phone: profile.phone,
        experience: profile.experience,
        status: profile.status,
        role: profile.role,
        createdAt: profile.created_at,
      };
    } catch (error) {
      return null;
    }
  }

  // Get pending users (admin only)
  async getPendingUsers(): Promise<User[]> {
    if (!isSupabaseConfigured || !supabase) return [];

    try {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error || !profiles) return [];

      // Get email addresses for each user
      const users: User[] = [];
      for (const profile of profiles) {
        const { data: authData } = await supabase.auth.admin.getUserById(
          profile.id
        );
        if (authData.user) {
          users.push({
            id: profile.id,
            name: profile.name,
            email: authData.user.email!,
            phone: profile.phone,
            experience: profile.experience,
            status: profile.status,
            role: profile.role,
            createdAt: profile.created_at,
          });
        }
      }

      return users;
    } catch (error) {
      return [];
    }
  }

  // Approve user (admin only)
  async approveUser(
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: "Supabase não configurado" };
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ status: "approved", updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (error) {
        return { success: false, error: "Erro ao aprovar usuário" };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: "Erro interno do servidor" };
    }
  }

  // Reject user (admin only)
  async rejectUser(
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: "Supabase não configurado" };
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ status: "rejected", updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (error) {
        return { success: false, error: "Erro ao rejeitar usuário" };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: "Erro interno do servidor" };
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (user: User | null) => void) {
    if (!isSupabaseConfigured || !supabase) return () => {};

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = await this.getCurrentUser();
        callback(user);
      } else {
        callback(null);
      }
    });

    return () => subscription.unsubscribe();
  }

  private getErrorMessage(error: AuthError): string {
    switch (error.message) {
      case "Invalid login credentials":
        return "Email ou senha incorretos";
      case "Email not confirmed":
        return "Por favor, confirme seu email antes de fazer login";
      case "User already registered":
        return "Este email já está cadastrado";
      case "Password should be at least 6 characters":
        return "A senha deve ter pelo menos 6 caracteres";
      default:
        return error.message;
    }
  }
}

export const authService = new AuthService();
