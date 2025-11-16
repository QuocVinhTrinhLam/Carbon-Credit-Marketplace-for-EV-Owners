import { createContext, ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/auth";

export type UserRole = "owner" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

const TOKEN_STORAGE_KEY = "token";
const USER_STORAGE_KEY = "auth_user";
const DEFAULT_ROLE: UserRole = "owner";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser) as AuthUser);
      } catch {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });

      if (!response.userId || !response.token) {
        console.error("Login response missing userId or token", response);
        return false;
      }

      // Determine role from JWT response
      const isAdmin = response.roles?.includes("ADMIN") || false;
      const resolvedRole: UserRole = isAdmin ? "admin" : "owner";
      
      const resolvedName = response.fullName?.trim() || 
        email.substring(0, email.indexOf("@")) || 
        email;

      const authUser: AuthUser = {
        id: String(response.userId),
        email: response.email || email,
        name: resolvedName,
        role: resolvedRole
      };

      setUser(authUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authUser));
      localStorage.setItem(TOKEN_STORAGE_KEY, response.token); // Save JWT token
      
      console.log("Login successful. User:", authUser);
      return true;
    } catch (error) {
      console.error("Login failed", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await authService.register({
        email,
        password,
        fullName: name
      });
      return Boolean(response.userId);
    } catch (error) {
      console.error("Register failed", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    navigate("/login", { replace: true });
  };

  const value: AuthContextValue = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

