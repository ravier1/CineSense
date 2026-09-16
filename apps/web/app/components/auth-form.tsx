"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setMessage("CineSense account services are not connected yet. Check the app environment settings.");
      setBusy(false);
      return;
    }

    try {
      const result = mode === "signup"
        ? await supabase.auth.signUp({ email, password, options: { data: { display_name: displayName }, emailRedirectTo: `${window.location.origin}/auth/callback?next=%2Fdashboard` } })
        : await supabase.auth.signInWithPassword({ email, password });

      if (result.error) {
        const message = result.error.message.toLowerCase().includes("email not confirmed")
          ? "Please confirm your CineSense email before signing in."
          : result.error.message;
        setMessage(message);
      } else if (mode === "signup" && !result.data.session) setMessage("Check your email to confirm your CineSense account.");
      else router.push("/dashboard");
    } catch {
      setMessage("CineSense could not reach the account service. Check your connection and try again.");
    }
    setBusy(false);
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      {mode === "signup" && <label>Display name<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} required autoComplete="name" /></label>}
      <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></label>
      <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} autoComplete={mode === "signup" ? "new-password" : "current-password"} /></label>
      <button className="button primary auth-submit" disabled={busy}>{busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}</button>
      {message && <p className="form-message" role="status">{message}</p>}
    </form>
  );
}
