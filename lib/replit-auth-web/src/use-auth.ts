import { useState, useEffect, useCallback } from "react";
import { createClient, type AuthChangeEvent, type Session } from "@supabase/supabase-js";
import type { AuthUser } from "@workspace/api-client-react";

export type { AuthUser };

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  signInWithGitHub: () => Promise<{ error?: string }>;
  signInWithPassword: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithPassword: (input: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) => Promise<{ error?: string }>;
  signInWithMagicLink: (email: string) => Promise<{ error?: string }>;
  updateProfile: (input: {
    email?: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  }) => Promise<{ error?: string }>;
}

type SupabaseEnv = {
  url: string;
  anonKey: string;
};

declare global {
  interface Window {
    __VULNGUARD_SUPABASE__?: {
      url?: string;
      anonKey?: string;
    };
  }
}

let cachedSupabaseEnv: SupabaseEnv | null | undefined;

function getSupabaseEnv(): SupabaseEnv | null {
  if (cachedSupabaseEnv !== undefined) return cachedSupabaseEnv;

  const runtimeConfig =
    typeof window !== "undefined" ? window.__VULNGUARD_SUPABASE__ : undefined;

  if (runtimeConfig?.url && runtimeConfig?.anonKey) {
    cachedSupabaseEnv = {
      url: runtimeConfig.url,
      anonKey: runtimeConfig.anonKey,
    };
    return cachedSupabaseEnv;
  }

  const meta = import.meta as unknown as {
    env?: {
      VITE_SUPABASE_URL?: string;
      VITE_SUPABASE_ANON_KEY?: string;
      SUPABASE_URL?: string;
      SUPABASE_ANON_KEY?: string;
    };
  };

  const url =
    meta.env?.VITE_SUPABASE_URL ??
    meta.env?.SUPABASE_URL ??
    "";
  const anonKey =
    meta.env?.VITE_SUPABASE_ANON_KEY ??
    meta.env?.SUPABASE_ANON_KEY ??
    "";

  if (!url || !anonKey) {
    cachedSupabaseEnv = null;
    return cachedSupabaseEnv;
  }

  cachedSupabaseEnv = { url, anonKey };
  return cachedSupabaseEnv;
}

let supabaseClient: ReturnType<typeof createClient> | null | undefined;

function getSupabaseClient() {
  if (supabaseClient !== undefined) return supabaseClient;
  const env = getSupabaseEnv();
  if (!env) {
    supabaseClient = null;
    return supabaseClient;
  }

  supabaseClient = createClient(env.url, env.anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
  return supabaseClient;
}

function setAccessTokenCookie(session: Session | null): void {
  if (!session?.access_token) {
    document.cookie = "sb-access-token=; Path=/; Max-Age=0; SameSite=Lax";
    return;
  }

  const maxAge = Math.max(60, session.expires_in ?? 3600);
  document.cookie = `sb-access-token=${encodeURIComponent(session.access_token)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

function mapSupabaseMetadata(meta: Record<string, unknown>): {
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
} {
  const firstName =
    (typeof meta.first_name === "string" && meta.first_name) ||
    (typeof meta.full_name === "string" ? meta.full_name.split(" ")[0] : null) ||
    null;

  const lastName =
    (typeof meta.last_name === "string" && meta.last_name) ||
    null;

  const profileImageUrl =
    (typeof meta.avatar_url === "string" && meta.avatar_url) ||
    null;

  return { firstName, lastName, profileImageUrl };
}

function mapSessionUser(session: Session | null): AuthUser | null {
  const user = session?.user;
  if (!user) return null;
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const mapped = mapSupabaseMetadata(meta);

  return {
    id: user.id,
    email: user.email ?? null,
    firstName: mapped.firstName,
    lastName: mapped.lastName,
    profileImageUrl: mapped.profileImageUrl,
  };
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = getSupabaseClient();

  useEffect(() => {
    let cancelled = false;

    if (!supabase) {
      fetch("/api/auth/user", { credentials: "include" })
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json() as Promise<{ user: AuthUser | null }>;
        })
        .then((data) => {
          if (!cancelled) {
            setUser(data.user ?? null);
            setIsLoading(false);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setUser(null);
            setIsLoading(false);
          }
        });

      return () => {
        cancelled = true;
      };
    }

    const syncSession = async (event?: AuthChangeEvent, session?: Session | null) => {
      const currentSession = session ?? (await supabase.auth.getSession()).data.session;
      setAccessTokenCookie(currentSession ?? null);

      if (cancelled) return;

      const mapped = mapSessionUser(currentSession ?? null);
      if (!mapped) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Ask API for canonical profile so DB-backed fields stay in sync.
      const response = await fetch("/api/auth/user", {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${currentSession?.access_token ?? ""}`,
        },
      }).catch(() => null);

      if (!cancelled) {
        if (response?.ok) {
          const payload = (await response.json()) as { user: AuthUser | null };
          setUser(payload.user ?? mapped);
        } else {
          setUser(mapped);
        }
        setIsLoading(false);
      }
    };

    syncSession();

    const { data } = supabase.auth.onAuthStateChange((
      _event: AuthChangeEvent,
      session: Session | null,
    ) => {
      void syncSession(_event, session);
    });

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  const login = useCallback(() => {
    window.location.href = "/login";
  }, []);

  const logout = useCallback(() => {
    if (!supabase) {
      window.location.href = "/api/logout";
      return;
    }

    void supabase.auth.signOut().finally(() => {
      setAccessTokenCookie(null);
      void fetch("/api/logout", { method: "GET", credentials: "include" }).catch(() => null);
      window.location.href = "/";
    });
  }, [supabase]);

  const signInWithGitHub = useCallback(async (): Promise<{ error?: string }> => {
    if (!supabase) {
      return { error: "Supabase is not configured" };
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });

    if (error) return { error: error.message };
    return {};
  }, [supabase]);

  const signInWithPassword = useCallback(
    async (email: string, password: string): Promise<{ error?: string }> => {
      if (!supabase) return { error: "Supabase is not configured" };
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      return {};
    },
    [supabase],
  );

  const signUpWithPassword = useCallback(
    async (input: {
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
    }): Promise<{ error?: string }> => {
      if (!supabase) return { error: "Supabase is not configured" };
      const { error } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
          data: {
            first_name: input.firstName ?? null,
            last_name: input.lastName ?? null,
          },
        },
      });

      if (error) return { error: error.message };
      return {};
    },
    [supabase],
  );

  const signInWithMagicLink = useCallback(
    async (email: string): Promise<{ error?: string }> => {
      if (!supabase) return { error: "Supabase is not configured" };

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });
      if (error) return { error: error.message };
      return {};
    },
    [supabase],
  );

  const updateProfile = useCallback(
    async (input: {
      email?: string;
      firstName?: string;
      lastName?: string;
      profileImageUrl?: string;
    }): Promise<{ error?: string }> => {
      if (!supabase) return { error: "Supabase is not configured" };

      const { error } = await supabase.auth.updateUser({
        email: input.email,
        data: {
          first_name: input.firstName,
          last_name: input.lastName,
          avatar_url: input.profileImageUrl,
        },
      });

      if (error) return { error: error.message };

      const session = (await supabase.auth.getSession()).data.session;
      if (session?.access_token) {
        await fetch("/api/auth/profile", {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            firstName: input.firstName,
            lastName: input.lastName,
            profileImageUrl: input.profileImageUrl,
            email: input.email,
          }),
        }).catch(() => null);
      }

      return {};
    },
    [supabase],
  );

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    signInWithGitHub,
    signInWithPassword,
    signUpWithPassword,
    signInWithMagicLink,
    updateProfile,
  };
}
