import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { createClient } from "@supabase/supabase-js";

function getClient() {
  const meta = import.meta as unknown as {
    env?: {
      VITE_SUPABASE_URL?: string;
      VITE_SUPABASE_ANON_KEY?: string;
      SUPABASE_URL?: string;
      SUPABASE_ANON_KEY?: string;
    };
  };

  const url = meta.env?.VITE_SUPABASE_URL ?? meta.env?.SUPABASE_URL ?? "";
  const key = meta.env?.VITE_SUPABASE_ANON_KEY ?? meta.env?.SUPABASE_ANON_KEY ?? "";
  if (!url || !key) return null;

  return createClient(url, key, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
}

export default function AuthCallback() {
  const [, navigate] = useLocation();
  const [error, setError] = useState("");

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const next = query.get("next") || "/dashboard";

    const run = async () => {
      const client = getClient();
      if (!client) {
        setError("Supabase is not configured in frontend env.");
        return;
      }

      const code = query.get("code");
      if (code) {
        const { error: exchangeErr } = await client.auth.exchangeCodeForSession(code);
        if (exchangeErr) {
          setError(exchangeErr.message);
          return;
        }
      }

      const { data } = await client.auth.getSession();
      const session = data.session;

      if (!session?.access_token) {
        setError("Could not create session. Please try login again.");
        return;
      }

      document.cookie = `sb-access-token=${encodeURIComponent(session.access_token)}; Path=/; Max-Age=${Math.max(60, session.expires_in ?? 3600)}; SameSite=Lax`;
      navigate(next, { replace: true });
    };

    void run();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-xl border border-white/10 bg-card/60 p-6 text-center space-y-2">
        {error ? (
          <>
            <h1 className="text-lg font-bold">Authentication failed</h1>
            <p className="text-xs text-red-400">{error}</p>
          </>
        ) : (
          <>
            <h1 className="text-lg font-bold">Completing sign-in...</h1>
            <p className="text-xs text-muted-foreground">Please wait a moment.</p>
          </>
        )}
      </div>
    </div>
  );
}
