"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { getApiErrorMessage } from "@/lib/utils";
import type { LoginCredentials, RegisterData, User } from "@/types";

const DEMO_USER_KEY = "ofa_demo_user";
const DEMO_USERS_KEY = "ofa_demo_users";

function isNetworkFailure(error: unknown) {
  if (!isAxiosError(error)) return false;
  return !error.response && (error.code === "ERR_NETWORK" || error.message === "Network Error");
}

function readDemoUsers(): Array<User & { password: string }> {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeDemoUsers(users: Array<User & { password: string }>) {
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
}

function persistSession(user: User, token: string) {
  localStorage.setItem("token", token);
  localStorage.setItem(DEMO_USER_KEY, JSON.stringify(user));
}

export function useAuth() {
  const { user, isAuthenticated, isLoading, setUser, logout: storeLogout } = useAuthStore();
  const router = useRouter();

  const fetchUser = useCallback(async () => {
    try {
      useAuthStore.getState().setLoading(true);
      const { data } = await api.get<{ success: boolean; data: User }>("/auth/me");
      setUser(data.data);
      return data.data;
    } catch {
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem(DEMO_USER_KEY);
        const token = localStorage.getItem("token");
        if (cached && token?.startsWith("demo_")) {
          try {
            setUser(JSON.parse(cached) as User);
            return JSON.parse(cached) as User;
          } catch {
            /* fall through */
          }
        }
      }
      setUser(null);
      return null;
    }
  }, [setUser]);

  const login = async (credentials: LoginCredentials) => {
    try {
      const { data } = await api.post<{
        success: boolean;
        data: { user: User; accessToken?: string; token?: string };
      }>("/auth/login", credentials);
      const token = data.data.accessToken || data.data.token;
      if (token) localStorage.setItem("token", token);
      localStorage.removeItem(DEMO_USER_KEY);
      setUser(data.data.user);
      toast.success("Welcome back!");
      return data.data.user;
    } catch (error) {
      if (isNetworkFailure(error)) {
        const users = readDemoUsers();
        const found = users.find(
          (u) => u.email?.toLowerCase() === credentials.email.toLowerCase() && u.password === credentials.password
        );
        if (found) {
          const { password: _pw, ...user } = found;
          persistSession(user, `demo_${user._id}`);
          setUser(user);
          toast.message("Signed in with local demo mode", {
            description: "API/MongoDB is offline. Your session is stored in this browser only.",
          });
          return user;
        }
        toast.error("Can't reach the API (localhost:5000). Start MongoDB + server, or register once in demo mode.");
        return null;
      }
      toast.error(getApiErrorMessage(error, "Login failed"));
      return null;
    }
  };

  const register = async (registerData: RegisterData) => {
    const payload = {
      name: registerData.name || registerData.displayName || "Member",
      username: registerData.username,
      email: registerData.email,
      password: registerData.password,
    };

    try {
      const { data } = await api.post<{
        success: boolean;
        data: { user: User; accessToken?: string; token?: string };
      }>("/auth/register", payload);
      const token = data.data.accessToken || data.data.token;
      if (token) localStorage.setItem("token", token);
      localStorage.removeItem(DEMO_USER_KEY);
      setUser(data.data.user);
      toast.success("Account created successfully!");
      router.push("/home");
      return data.data.user;
    } catch (error) {
      if (isNetworkFailure(error)) {
        const users = readDemoUsers();
        if (users.some((u) => u.email?.toLowerCase() === payload.email.toLowerCase())) {
          toast.error("That email is already registered in local demo mode.");
          return null;
        }
        if (users.some((u) => u.username.toLowerCase() === payload.username.toLowerCase())) {
          toast.error("That username is taken in local demo mode.");
          return null;
        }

        const user: User & { password: string } = {
          _id: `demo_${Date.now()}`,
          name: payload.name,
          username: payload.username.toLowerCase(),
          email: payload.email.toLowerCase(),
          password: payload.password,
          headline: "Figuring things out",
          experienceTags: ["CAREER", "LEARNING"],
          peopleHelped: 0,
          questionsAnswered: 0,
          communityRating: 5,
          topicsCount: 2,
          badges: ["EARLY HELPER"],
          role: "user",
        };
        const { password: _pw, ...safeUser } = user;
        writeDemoUsers([...users, user]);
        persistSession(safeUser, `demo_${safeUser._id}`);
        setUser(safeUser);
        toast.message("Account created in local demo mode", {
          description: "API/MongoDB is offline. You can explore the app; data stays in this browser.",
        });
        router.push("/home");
        return safeUser;
      }
      toast.error(getApiErrorMessage(error, "Registration failed"));
      return null;
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore
    } finally {
      localStorage.removeItem(DEMO_USER_KEY);
      storeLogout();
      router.push("/login");
      toast.success("Logged out");
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await api.post("/auth/forgot-password", { email });
      toast.success("Reset link sent to your email");
    } catch (error) {
      if (isNetworkFailure(error)) {
        toast.error("Can't reach the API. Start the server to reset passwords.");
        return;
      }
      toast.error(getApiErrorMessage(error, "Failed to send reset link"));
    }
  };

  const resetPassword = async (token: string, password: string) => {
    try {
      await api.post("/auth/reset-password", { token, password });
      toast.success("Password reset successfully");
      router.push("/login");
    } catch (error) {
      if (isNetworkFailure(error)) {
        toast.error("Can't reach the API. Start the server to reset passwords.");
        return;
      }
      toast.error(getApiErrorMessage(error, "Failed to reset password"));
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    fetchUser,
    forgotPassword,
    resetPassword,
  };
}
