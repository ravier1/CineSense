import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "../../../lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const requestedNext = url.searchParams.get("next");
  const nextPath = requestedNext?.startsWith("/") ? requestedNext : "/dashboard";

  if (!code) return NextResponse.redirect(new URL("/login?error=confirmation", request.url));

  const supabase = await getSupabaseServerClient();
  if (!supabase) return NextResponse.redirect(new URL("/login?error=configuration", request.url));

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/login?error=confirmation", request.url));

  return NextResponse.redirect(new URL(nextPath, request.url));
}
