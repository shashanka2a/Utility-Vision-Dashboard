"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import {
  clearDemoSuperuserSession,
  isDemoSuperuserCredential,
  setDemoSuperuserSession,
} from "@/lib/demo-auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasHashTokens = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.location.hash.includes("access_token=");
  }, []);

  useEffect(() => {
    // If the user arrives here with auth hash tokens, route them to callback.
    if (typeof window === "undefined") return;
    const hash = window.location.hash || "";
    if (hash.includes("access_token=")) {
      router.replace(`/auth/callback${hash}`);
    }
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const trimmed = email.trim();

    if (isDemoSuperuserCredential(trimmed, password)) {
      try {
        await supabase.auth.signOut();
        setDemoSuperuserSession();
        router.push("/activity");
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Sign in failed.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!trimmed.includes("@")) {
      setError("Enter a valid email address, or use the demo username admin.");
      setIsSubmitting(false);
      return;
    }

    supabase.auth
      .signInWithPassword({ email: trimmed, password })
      .then(({ error }) => {
        if (error) throw error;
        clearDemoSuperuserSession();
        router.push("/activity");
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Sign in failed.");
      })
      .finally(() => setIsSubmitting(false));
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg border border-gray-200">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FF6633] text-white font-bold">
            UV
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Utility Vision
            </p>
            <h1 className="text-lg font-semibold text-gray-900">
              Sign in to dashboard
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {hasHashTokens && (
            <p className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
              Finishing sign-in…
            </p>
          )}
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Email or demo username
            </label>
            <input
              id="email"
              type="text"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com or admin"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-[#FF6633] focus:outline-none focus:ring-2 focus:ring-[#FF6633] focus:ring-offset-0"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-[#FF6633] focus:outline-none focus:ring-2 focus:ring-[#FF6633] focus:ring-offset-0"
            />
          </div>

          {error && (
            <p className="text-sm text-[#F44336] bg-[#FFEBEE] border border-[#F44336]/20 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-[#FF6633] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#E55A2B] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>

          <p className="text-xs text-gray-500 pt-2">
            Invited to Utility Vision?{" "}
            <Link href="/signup" className="text-[#FF6633] hover:underline">
              Set up your password
            </Link>
            .
          </p>
        </form>
      </div>
    </div>
  );
}

