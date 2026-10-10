import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function GET() {
  const hasSupabaseUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const hasServiceKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  return NextResponse.json({ status: "ok", app: "HAQ.NEWS", mode: hasSupabaseUrl && hasServiceKey ? "database-configured" : "demo", checks: { supabaseUrlConfigured: hasSupabaseUrl, serverKeyConfigured: hasServiceKey, aiConfigured: Boolean(process.env.AI_API_KEY), feedListConfigured: Boolean(process.env.NEWS_FEED_URLS) }, note: "A healthy response confirms the web process is running, not that every external service is operational." });
}
