import { getSupabaseAdminClient } from "../../../../lib/supabase/admin";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { email?: string } | null;
  const email = body?.email?.trim().toLowerCase() ?? "";
  if (!emailPattern.test(email)) return Response.json({ available: false, valid: false, message: "Enter a valid email address." }, { status: 400 });

  const supabase = getSupabaseAdminClient();
  if (!supabase) return Response.json({ available: true, valid: true, configured: false });

  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) return Response.json({ available: true, valid: true, configured: false });
  const taken = data.users.some((user) => user.email?.toLowerCase() === email);
  return Response.json({ available: !taken, valid: true, message: taken ? "That email is already registered. Try signing in instead." : "Email is available." });
}
