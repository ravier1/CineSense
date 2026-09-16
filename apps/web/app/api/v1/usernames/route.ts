import { getSupabaseAdminClient } from "../../../../lib/supabase/admin";

const usernamePattern = /^[a-z0-9_]{3,30}$/;
const reservedUsernames = new Set(["admin", "api", "auth", "dashboard", "donate", "login", "roadmap", "settings", "signup", "support"]);

export async function GET(request: Request) {
  const rawUsername = new URL(request.url).searchParams.get("username") ?? "";
  const username = rawUsername.trim().toLowerCase();

  if (!usernamePattern.test(username)) return Response.json({ available: false, valid: false, message: "Use 3–30 letters, numbers, or underscores." }, { status: 200 });
  if (reservedUsernames.has(username)) return Response.json({ available: false, valid: true, message: "That username is reserved." });

  const supabase = getSupabaseAdminClient();
  if (!supabase) return Response.json({ available: false, valid: true, configured: false, message: "Username checks need the CineSense server key and profiles table configured." }, { status: 503 });

  const { data, error } = await supabase.from("profiles").select("id").ilike("username", username).limit(1);
  if (!error) return Response.json({ available: !data?.length, valid: true, message: data?.length ? "That username is already taken." : "Username is available." });

  // Until the profiles table is applied, check the username metadata written during signup.
  // The profiles table and its unique index remain the source of truth once the schema is live.
  const { data: users, error: usersError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (usersError) return Response.json({ available: false, valid: true, configured: false, message: "Username checks need the CineSense profiles table and server key configured." }, { status: 503 });
  const taken = users.users.some((user) => String(user.user_metadata?.username ?? "").toLowerCase() === username);
  return Response.json({ available: !taken, valid: true, message: taken ? "That username is already taken." : "Username is available." });
}
