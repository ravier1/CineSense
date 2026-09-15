import { getSupabaseServerClient } from "../../../../lib/supabase/server";

export async function GET() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return Response.json({ error: { code: "DATABASE_NOT_CONFIGURED", message: "Supabase is not configured." } }, { status: 503 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: { code: "UNAUTHENTICATED", message: "Sign in required." } }, { status: 401 });

  const { data, error } = await supabase.from("diary_entries").select("*, media(*)").eq("user_id", user.id).order("watched_at", { ascending: false });
  if (error) return Response.json({ error: { code: "DIARY_READ_FAILED", message: error.message } }, { status: 500 });
  return Response.json({ entries: data });
}

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return Response.json({ error: { code: "DATABASE_NOT_CONFIGURED", message: "Supabase is not configured." } }, { status: 503 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: { code: "UNAUTHENTICATED", message: "Sign in required." } }, { status: 401 });
  const body = await request.json();
  const { data, error } = await supabase.from("diary_entries").insert({ ...body, user_id: user.id }).select().single();
  if (error) return Response.json({ error: { code: "DIARY_CREATE_FAILED", message: error.message } }, { status: 400 });
  return Response.json({ entry: data }, { status: 201 });
}
