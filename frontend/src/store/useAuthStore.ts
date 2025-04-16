import { UserDto } from "src/models/User.model";
import { create } from "zustand";

interface AuthState {
  user: UserDto | null;
  loading: boolean;
  getUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  handleGoogleCallback: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  refreshUser: async () => {
    const { getUser } = useAuthStore.getState();
    await getUser();
  },

  getUser: async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Unauthorized");

      const userData: UserDto = await res.json();
      set({ user: userData, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },

  login: async (email, password) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/signin`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        }
      );

      if (!res.ok) throw new Error("Invalid credentials");

      const data = await res.json();

      if (!data?.accessToken || !data?.user)
        throw new Error("Invalid login response");

      set({ user: data.user });
      window.location.href = "/";
    } catch (error) {
      console.error("Login Error:", error);
      throw new Error(error.message || "Login failed");
    }
  },

  handleGoogleCallback: async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      window.location.href = "/";
    } catch (error) {
      console.error("Google callback error:", error);
      throw new Error("Google authentication failed");
    }
  },

  logout: async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    set({ user: null });

    window.location.href = "/";
  },
}));
