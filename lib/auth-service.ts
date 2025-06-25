import type { AuthError } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase, type User } from "./supabase";

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  experience: string;
  avatar_url: string | null;
}

export interface LoginData {
  email: string;
  password: string;
}

export class AuthService {
  private isProcessingAuthChange = false; // Flag para evitar calls simultâneos
  private currentUser: User | null = null; // Cache do usuário atual

  // Register a new user
  async register(
    data: RegisterData
  ): Promise<{ success: boolean; error?: string }> {
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

      return { success: true };
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

      // 4. Check if user is deleted (TEMPORÁRIO: usando rejected + [DELETADO])
      if (
        profile.status === "deleted" ||
        (profile.status === "rejected" && profile.name.startsWith("[DELETADO]"))
      ) {
        await supabase.auth.signOut();
        return { success: false, error: "Esta conta foi desativada" };
      }

      // 5. Check if user is approved (unless admin)
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
          avatar_url: profile.avatar_url || null,
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
        avatar_url: profile.avatar_url || null,
      };

      return { success: true, user };
    } catch (error) {
      return { success: false, error: "Erro interno do servidor" };
    }
  }

  // Logout user with cleanup
  async logout(): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;

    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error in logout:", error);
    }

    // Limpa cache e dados locais
    this.currentUser = null;
    try {
      localStorage.removeItem("supabase.auth.token");
      sessionStorage.clear();
    } catch (error) {
      console.warn("Error clearing storage:", error);
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    if (!isSupabaseConfigured || !supabase) {
      return null;
    }

    // Evita chamadas simultâneas que podem causar problemas
    if (this.isProcessingAuthChange) {
      console.log(
        "AuthService: getCurrentUser já em processamento, aguardando..."
      );
      return null;
    }

    this.isProcessingAuthChange = true;

    try {
      // Primeiro verifica se há uma sessão válida
      const { data: session, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) {
        console.warn("AuthService: Session error:", sessionError);
        // Não força logout em caso de erro de sessão - pode ser temporário
        return null;
      }

      if (!session?.session?.access_token) {
        console.log("AuthService: No valid session found");
        return null;
      }

      // Então tenta obter o usuário
      let authUser;
      try {
        const { data, error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.warn("AuthService: User fetch error:", userError);
          // Se for erro de token expirado, tenta refresh
          if (
            userError.message?.includes("Invalid JWT") ||
            userError.message?.includes("expired")
          ) {
            console.log("AuthService: Token expired, attempting refresh...");
            const { data: refreshData, error: refreshError } =
              await supabase.auth.refreshSession();
            if (refreshError) {
              console.error("AuthService: Refresh failed:", refreshError);
              await this.logout();
              return null;
            }
            // Tenta novamente após refresh
            const { data: retryData, error: retryError } =
              await supabase.auth.getUser();
            if (retryError) {
              console.error(
                "AuthService: Retry after refresh failed:",
                retryError
              );
              await this.logout();
              return null;
            }
            authUser = retryData.user;
          } else {
            // Para outros tipos de erro, não força logout imediatamente
            console.warn(
              "AuthService: Non-critical user error, returning null"
            );
            return null;
          }
        } else {
          authUser = data.user;
        }
      } catch (error) {
        console.error("AuthService: Unexpected error in getUser:", error);
        // Só força logout se for erro crítico, não erro de rede
        if (error instanceof TypeError && error.message?.includes("fetch")) {
          console.warn("AuthService: Network error, not forcing logout");
          return null;
        }
        await this.logout();
        return null;
      }

      if (!authUser?.id) {
        await this.logout();
        return null;
      }

      let profileResult;
      try {
        profileResult = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();
      } catch (error) {
        console.error("AuthService: Error getting profile:", error);
        // Se for erro de rede, não força logout
        if (error instanceof TypeError && error.message?.includes("fetch")) {
          console.warn(
            "AuthService: Network error getting profile, not forcing logout"
          );
          return null;
        }
        await this.logout();
        return null;
      }

      if (profileResult.error || !profileResult.data) {
        console.warn(
          "AuthService: Profile not found or error:",
          profileResult.error
        );
        // Se perfil não existe, força logout
        await this.logout();
        return null;
      }

      const profile = profileResult.data;

      // Check if user is deleted (TEMPORÁRIO: usando rejected + [DELETADO])
      if (
        profile.status === "deleted" ||
        (profile.status === "rejected" && profile.name.startsWith("[DELETADO]"))
      ) {
        console.log("AuthService: User is deleted, logging out");
        await this.logout();
        return null;
      }

      const user = {
        id: profile.id,
        name: profile.name,
        email: authUser.email!,
        phone: profile.phone,
        experience: profile.experience,
        status: profile.status,
        role: profile.role,
        createdAt: profile.created_at,
        avatar_url: profile.avatar_url || null,
      };

      // Verifica se os dados do usuário são válidos
      if (!user.id || !user.email || !user.status || !user.role) {
        console.error("AuthService: Invalid user data", user);
        await this.logout();
        return null;
      }

      // Atualiza cache antes de retornar
      this.currentUser = user;
      return user;
    } catch (error) {
      console.error("AuthService: Unexpected error:", error);
      // Só força logout se não for erro de rede
      if (!(error instanceof TypeError && error.message?.includes("fetch"))) {
        await this.logout();
      }
      return null;
    } finally {
      // Sempre reseta a flag no final
      this.isProcessingAuthChange = false;
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
            avatar_url: profile.avatar_url || null,
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

  // Get all users (admin only)
  async getAllUsers(): Promise<User[]> {
    if (!isSupabaseConfigured || !supabase) return [];

    try {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error || !profiles) return [];

      // Filtrar usuários deletados (TEMPORÁRIO: rejected + [DELETADO])
      const activeProfiles = profiles.filter(
        (profile) =>
          profile.status !== "deleted" &&
          !(
            profile.status === "rejected" &&
            profile.name.startsWith("[DELETADO]")
          )
      );

      // Transform the data to match User interface
      const users: User[] = activeProfiles
        .filter((profile) => profile.role !== "admin")
        .map((profile) => ({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          experience: profile.experience,
          status: profile.status,
          role: profile.role,
          createdAt: profile.created_at,
          avatar_url: profile.avatar_url || null,
        }));

      return users;
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  }

  // Update user (admin only)
  async updateUser(
    userId: string,
    updates: {
      name?: string;
      phone?: string;
      experience?: string;
      status?: string;
      avatar_url?: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: "Supabase não configurado" };
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) {
        return { success: false, error: "Erro ao atualizar usuário" };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: "Erro interno do servidor" };
    }
  }

  // Delete user (admin only) - Usando soft delete para evitar problemas de permissão
  async deleteUser(
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: "Supabase não configurado" };
    }

    try {
      // SOLUÇÃO TEMPORÁRIA: Usar status "rejected" até executar o script SQL
      // Quando o script SQL for executado, pode ser alterado para "deleted"
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          status: "rejected", // Temporariamente usando "rejected" como "deleted"
          name: `[DELETADO] ${new Date().toISOString()}`, // Marca visual de que foi deletado
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (updateError) {
        console.error("Erro ao marcar usuário como deletado:", updateError);
        return { success: false, error: "Erro ao excluir usuário" };
      }

      return { success: true };
    } catch (error) {
      console.error("Erro interno ao deletar usuário:", error);
      return { success: false, error: "Erro interno do servidor" };
    }
  }

  // Listen to auth state changes - ÚNICO método para isso
  onAuthStateChange(callback: (user: User | null) => void) {
    if (!isSupabaseConfigured || !supabase) return () => {};

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`AuthService: Auth state changed - ${event}`);

      // Ignora eventos de refresh automático do Supabase para evitar problemas
      if (event === "TOKEN_REFRESHED") {
        console.log("AuthService: Token refreshed, mantendo estado atual");
        return; // Não atualiza o estado para evitar loops
      }

      // Para SIGNED_IN, verifica se é refresh automático ou login real
      if (event === "SIGNED_IN" && session?.user) {
        // Se já temos um usuário logado com mesmo ID, é refresh automático
        if (this.currentUser && this.currentUser.id === session.user.id) {
          console.log("AuthService: SIGNED_IN é refresh automático, ignorando");
          return; // Não processa novamente o mesmo usuário
        }

        console.log("AuthService: SIGNED_IN é login real, processando");
        try {
          const user = await this.getCurrentUser();
          this.currentUser = user; // Atualiza cache
          callback(user);
        } catch (error) {
          console.error(
            "AuthService: Erro ao obter usuário após SIGNED_IN:",
            error
          );
          // Em caso de erro, não propaga para evitar quebrar a aplicação
        }
        return;
      }

      // Para SIGNED_OUT, sempre processa
      if (event === "SIGNED_OUT" || !session?.user) {
        console.log("AuthService: SIGNED_OUT detectado, limpando cache");
        this.currentUser = null; // Limpa cache
        callback(null);
        return;
      }

      // Para outros eventos, verifica se há sessão válida
      if (session?.user) {
        try {
          const user = await this.getCurrentUser();
          callback(user);
        } catch (error) {
          console.error(
            `AuthService: Erro ao processar evento ${event}:`,
            error
          );
        }
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
