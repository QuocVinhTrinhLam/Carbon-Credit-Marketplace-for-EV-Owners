import { api } from "./api";

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  fullName: string;
};

export type AuthResponse = {
  message: string;
  userId: number | null;
  email?: string;
  fullName?: string;
  token?: string;
  roles?: string[];
};

export type UserProfile = {
  id: number;
  fullName: string;
  email: string;
  role?: string;
};

export const authService = {
  async login(payload: LoginRequest) {
    const { data } = await api.post<AuthResponse>("/users/login", payload);
    return data;
  },

  async register(payload: RegisterRequest) {
    const { data } = await api.post<AuthResponse>("/users/register", payload);
    return data;
  },

  async fetchUserById(userId: number) {
    const { data } = await api.get<UserProfile[]>("/users");
    return data.find((user) => user.id === userId) ?? null;
  }
};
