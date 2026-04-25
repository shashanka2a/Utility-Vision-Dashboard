"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

function parseHash(hash: string): Record<string, string> {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  const params = new URLSearchParams(raw);
  const out: Record<string, string> = {};
  for (const [k, v] of params.entries()) out[k] = v;
  return out;
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const hashData = useMemo(() => {
    if (typeof window === "undefined") return {};
    return parseHash(window.location.hash || "");
  }, []);

  useEffect(() => {
    const access_token = hashData["access_token"];
    const refresh_token = hashData["refresh_token"];
    const type = hashData["type"];

    if (!access_token || !refresh_token) {
      setError("Missing auth tokens. Please retry the invite link.");
      return;
    }

    supabase.auth
      .setSession({ access_token, refresh_token })
      .then(({ error }) => {
        if (error) throw error;
        // Invite → prompt to set password in-app.
        if (type === "invite") {
          router.replace(`/signup`);
          return;
        }
        router.replace("/activity");
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Auth callback failed.");
      });
  }, [hashData, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg border border-gray-200">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Utility Vision
          </p>
          <h1 className="text-lg font-semibold text-gray-900">
            Finishing sign-in…
          </h1>
        </div>

        {error ? (
          <div className="space-y-3">
            <p className="text-sm text-[#F44336] bg-[#FFEBEE] border border-[#F44336]/20 rounded-md px-3 py-2">
              {error}
            </p>
            <button
              type="button"
              onClick={() => router.replace("/login")}
              className="inline-flex w-full items-center justify-center rounded-lg bg-[#FF6633] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#E55A2B]"
            >
              Go to sign in
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-600">
            Please wait. You’ll be redirected automatically.
          </p>
        )}
      </div>
    </div>
  );
}

