import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase";
export const dynamic = "force-dynamic";
export async function GET() {
  const supabase = getAdminSupabase();
  if (!supabase) return NextResponse.json({ mode: "demo", stories: [], message: "Database is not configured; the homepage is currently using fictional demo stories." });
  const { data, error } = await supabase.from("stories").select("id,title,summary,category,region,source_name,source_url,published_at,retrieved_at,verification_status,tags,is_demo").eq("is_demo", false).order("published_at", { ascending: false, nullsFirst: false }).limit(100);
  if (error) return NextResponse.json({ error: "Could not load stories." }, { status: 500 });
  return NextResponse.json({ mode: "live", stories: data });
}
