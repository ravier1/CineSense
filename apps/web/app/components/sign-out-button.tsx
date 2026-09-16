"use client";

import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    const supabase = getSupabaseBrowserClient();
    await supabase?.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return <button className="button" type="button" onClick={signOut}>Sign out</button>;
}
