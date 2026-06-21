import { useCallback, useEffect, useState } from "react";

import { apiFetch, clearAuthToken, getAuthToken, setAuthToken } from "@/lib/api-client";

export type AuthUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  image?: string | null;
  username?: string | null;
  subtitle?: string | null;
  status?: string | null;
  description?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  twitterUrl?: string | null;
  websiteUrl?: string | null;
  coverImage?: string | null;
};

type AuthResponse = {
  user: AuthUser;
  token?: string;
};

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiFetch<{ user: AuthUser }>("/auth/me", {
        method: "GET",
      });
      setUser(response.user);
    } catch (error) {
      console.error("Failed to load current user:", error);
      clearAuthToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCurrentUser();
  }, [fetchCurrentUser]);

  const signIn = async (credentials: { email: string; password: string }) => {
    const response = await apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: credentials,
    });

    if (response.token) {
      setAuthToken(response.token);
    }

    setUser(response.user);
    return response.user;
  };

  const signOut = async () => {
    try {
      await apiFetch<null>("/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Failed to log out:", error);
    } finally {
      clearAuthToken();
      setUser(null);
    }
  };

  return {
    isLoading,
    isAuthenticated: Boolean(user),
    user,
    signIn,
    signOut,
  };
}
