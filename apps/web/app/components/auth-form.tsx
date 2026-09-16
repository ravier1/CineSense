"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid" | "unavailable">("idle");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (mode !== "signup") return;
    const normalizedUsername = username.trim().toLowerCase();
    if (!normalizedUsername) {
      setUsernameStatus("idle");
      setUsernameMessage("");
      return;
    }
    if (!/^[a-z0-9_]{3,30}$/.test(normalizedUsername)) {
      setUsernameStatus("invalid");
      setUsernameMessage("Use 3–30 letters, numbers, or underscores.");
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setUsernameStatus("checking");
      setUsernameMessage("Checking availability…");
      try {
        const response = await fetch(`/api/v1/usernames?username=${encodeURIComponent(normalizedUsername)}`, { signal: controller.signal });
        const result = await response.json() as { available?: boolean; message?: string };
        setUsernameStatus(response.ok && result.available ? "available" : response.status === 503 ? "unavailable" : "taken");
        setUsernameMessage(result.message ?? "Username is unavailable.");
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setUsernameStatus("unavailable");
          setUsernameMessage("Could not check username availability.");
        }
      }
    }, 350);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [mode, username]);

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
      if (mode === "signup" && usernameStatus !== "available") {
        setMessage(usernameStatus === "unavailable" ? "Username checks are not connected yet. Apply the CineSense database schema in Supabase first." : "Choose an available username before creating your account.");
        setBusy(false);
        return;
      }
      if (mode === "signup") {
        const emailCheck = await fetch("/api/v1/emails", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
        if (emailCheck.ok) {
          const emailResult = await emailCheck.json() as { available?: boolean; message?: string };
          if (emailResult.available === false) {
            setMessage(emailResult.message ?? "That email is already registered. Try signing in instead.");
            setBusy(false);
            return;
          }
        }
      }
      const result = mode === "signup"
        ? await supabase.auth.signUp({ email, password, options: { data: { username: username.trim().toLowerCase(), display_name: username.trim() }, emailRedirectTo: `${window.location.origin}/auth/callback?next=%2Fdashboard` } })
        : await supabase.auth.signInWithPassword({ email, password });

      if (result.error) {
        const errorMessage = result.error.message.toLowerCase();
        const message = errorMessage.includes("email not confirmed")
          ? "Please confirm your CineSense email before signing in."
          : errorMessage.includes("already registered") || errorMessage.includes("already been registered")
            ? "That email is already registered. Try signing in instead."
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
      {mode === "signup" && <label>Username<input name="username" value={username} onChange={(event) => setUsername(event.target.value)} required minLength={3} maxLength={30} pattern="[A-Za-z0-9_]{3,30}" autoComplete="username" aria-describedby="username-hint" />{usernameMessage && <span id="username-hint" className={`username-hint ${usernameStatus}`}>{usernameMessage}</span>}</label>}
      <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></label>
      <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} autoComplete={mode === "signup" ? "new-password" : "current-password"} /></label>
      <button className="button primary auth-submit" disabled={busy}>{busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}</button>
      {message && <p className="form-message" role="status">{message}</p>}
    </form>
  );
}
