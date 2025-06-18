"use client";

import { authService, type RegisterData } from "@/lib/auth-service";
import { isSupabaseConfigured, type User } from "@/lib/supabase";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
    isAdminMode?: boolean
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    userData: Omit<User, "id" | "status" | "role" | "createdAt"> & {
      password: string;
    }
  ) => Promise<boolean>;
  logout: () => void;
  getPendingUsers: () => Promise<User[]>;
  getAllUsers: () => Promise<User[]>;
  approveUser: (userId: string) => Promise<void>;
  rejectUser: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isSupabaseConfigured) {
      // Initialize with Supabase
      initializeSupabaseAuth();
    } else {
      // Fallback to localStorage
      initializeLocalAuth();
    }
  }, []);

  const initializeSupabaseAuth = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
      }

      // Listen to auth state changes
      const unsubscribe = authService.onAuthStateChange((user) => {
        setUser(user);
        setIsAuthenticated(!!user);
      });

      setIsLoading(false);
      return unsubscribe;
    } catch (error) {
      initializeLocalAuth();
    }
  };

  const initializeLocalAuth = () => {
    // Check if user is logged in on app start
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setIsAuthenticated(true);
    } else {
    }

    // Initialize admin user if not exists
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const adminExists = users.find((u: User) => u.role === "admin");

    if (!adminExists) {
      console.log("AuthProvider: Creating default admin user");
      const adminUser: User = {
        id: "admin-1",
        name: "Administrador",
        email: "admin@exltrading.com",
        phone: "",
        experience: "profissional",
        status: "approved",
        role: "admin",
        createdAt: new Date().toISOString(),
      };

      const passwords = JSON.parse(localStorage.getItem("passwords") || "{}");
      passwords["admin@exltrading.com"] = "admin123";

      localStorage.setItem("users", JSON.stringify([...users, adminUser]));
      localStorage.setItem("passwords", JSON.stringify(passwords));
    } else {
    }

    setIsLoading(false);
  };

  const login = async (
    email: string,
    password: string,
    isAdminMode = false
  ): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured) {
      try {
        const result = await authService.login(
          { email, password },
          isAdminMode
        );
        console.log("result", result);
        if (result.success && result.user) {
          setUser(result.user);
          setIsAuthenticated(true);
          return { success: true };
        }
        if (
          result.error === "Por favor, confirme seu email antes de fazer login"
        ) {
          return {
            success: false,
            error: "Aguarde a aprovação do seu cadastro",
          };
        }
        return {
          success: false,
          error: result.error || "Email ou senha incorretos",
        };
      } catch (error) {
        console.error("Supabase login error:", error);
        return { success: false, error: "Erro ao fazer login" };
      }
    } else {
      const success = loginWithLocalStorage(email, password, isAdminMode);
      return {
        success,
        error: success ? undefined : "Email ou senha incorretos",
      };
    }
  };

  const loginWithLocalStorage = (
    email: string,
    password: string,
    isAdminMode = false
  ): boolean => {
    const users: User[] = JSON.parse(localStorage.getItem("users") || "[]");
    const passwords = JSON.parse(localStorage.getItem("passwords") || "{}");

    const foundUser = users.find((u) => u.email === email);

    if (!foundUser || passwords[email] !== password) {
      return false;
    }

    if (isAdminMode && foundUser.role !== "admin") {
      return false;
    }

    if (!isAdminMode && foundUser.status !== "approved") {
      // Allow login for pending users to show status message

      setUser(foundUser);
      setIsAuthenticated(true);
      localStorage.setItem("currentUser", JSON.stringify(foundUser));
      return true;
    }

    setUser(foundUser);
    setIsAuthenticated(true);
    localStorage.setItem("currentUser", JSON.stringify(foundUser));
    return true;
  };

  const register = async (
    userData: Omit<User, "id" | "status" | "role" | "createdAt"> & {
      password: string;
    }
  ): Promise<boolean> => {
    if (isSupabaseConfigured) {
      try {
        const registerData: RegisterData = {
          name: userData.name,
          email: userData.email,
          password: userData.password,
          phone: userData.phone || undefined,
          experience: userData.experience,
        };

        const result = await authService.register(registerData);
        return result.success;
      } catch (error) {
        console.error("Supabase register error:", error);
        return false;
      }
    } else {
      // Fallback to localStorage
      return registerWithLocalStorage(userData);
    }
  };

  const registerWithLocalStorage = (
    userData: Omit<User, "id" | "status" | "role" | "createdAt"> & {
      password: string;
    }
  ): boolean => {
    const users: User[] = JSON.parse(localStorage.getItem("users") || "[]");
    const passwords = JSON.parse(localStorage.getItem("passwords") || "{}");

    // Check if email already exists
    if (users.find((u) => u.email === userData.email)) {
      return false;
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      experience: userData.experience,
      status: "pending",
      role: "user",
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    passwords[userData.email] = userData.password;

    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("passwords", JSON.stringify(passwords));

    return true;
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      await authService.logout();
    } else {
      localStorage.removeItem("currentUser");
    }
    setUser(null);
    setIsAuthenticated(false);
  };

  const getPendingUsers = async (): Promise<User[]> => {
    if (isSupabaseConfigured) {
      try {
        return await authService.getPendingUsers();
      } catch (error) {
        console.error("Error getting pending users:", error);
        return [];
      }
    } else {
      // Fallback to localStorage
      const users: User[] = JSON.parse(localStorage.getItem("users") || "[]");
      return users.filter((u) => u.status === "pending");
    }
  };

  const getAllUsers = async (): Promise<User[]> => {
    if (isSupabaseConfigured) {
      try {
        return await authService.getAllUsers();
      } catch (error) {
        console.error("Error getting all users:", error);
        return [];
      }
    } else {
      // Fallback to localStorage
      const users: User[] = JSON.parse(localStorage.getItem("users") || "[]");
      return users.filter((u) => u.role !== "admin");
    }
  };

  const approveUser = async (userId: string): Promise<void> => {
    if (isSupabaseConfigured) {
      try {
        await authService.approveUser(userId);
      } catch (error) {
        console.error("Error approving user:", error);
      }
    } else {
      // Fallback to localStorage
      const users: User[] = JSON.parse(localStorage.getItem("users") || "[]");
      const userIndex = users.findIndex((u) => u.id === userId);

      if (userIndex !== -1) {
        users[userIndex].status = "approved";
        localStorage.setItem("users", JSON.stringify(users));
      }
    }
  };

  const rejectUser = async (userId: string): Promise<void> => {
    if (isSupabaseConfigured) {
      try {
        await authService.rejectUser(userId);
      } catch (error) {
        console.error("Error rejecting user:", error);
      }
    } else {
      // Fallback to localStorage
      const users: User[] = JSON.parse(localStorage.getItem("users") || "[]");
      const userIndex = users.findIndex((u) => u.id === userId);

      if (userIndex !== -1) {
        users[userIndex].status = "rejected";
        localStorage.setItem("users", JSON.stringify(users));
      }
    }
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        isLoading,
        login,
        register,
        logout,
        getPendingUsers,
        getAllUsers,
        approveUser,
        rejectUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
