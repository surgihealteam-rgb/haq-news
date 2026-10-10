import { NextResponse } from "next/server";
import Parser from "rss-parser";
import { getAdminSupabase } from "@/lib/supabase";
export const dynamic = "force-dynamic";
export const maxDuration = 30;
const parser = new Parser({ timeout: 8000, headers: { "User-Agent": "HAQ.NEWS feed reader/0.1 (respect source terms)" } });
function validFeedUrl(raw: string) { try { const u = new URL(raw); return (u.protocol === "https:" || u.protocol === "http:") && !["localhost", "127.0.0.1", "0.0.0.0", "::1"].includes(u.hostname) && !u.hostname.endsWith(".local"); } catch { return false; } }
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized. Configure CRON_SECRET and send it as a bearer token." }, { status: 401 });
  const supabase = getAdminSupabase();
  if (!supabase) return NextResponse.json({ error: "Database is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on the server." }, { status: 503 });
  const urls = (process.env.NEWS_FEED_URLS || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!urls.length) return NextResponse.json({ error: "No feeds configured. Add permitted RSS/Atom URLs to NEWS_FEED_URLS." }, { status: 400 });
  const results: { feed: string; inserted: number; skipped: number; error?: string }[] = [];
  for (const feedUrl of urls.slice(0, 10)) {
    if (!validFeedUrl(feedUrl)) { results.push({ feed: feedUrl, inserted: 0, skipped: 0, error: "Invalid or local feed URL rejected." }); continue; }
    try {
      const feed = await parser.parseURL(feedUrl);
      let inserted = 0, skipped = 0;
      for (const item of (feed.items || []).slice(0, 40)) {
        const sourceUrl = item.link?.trim();
        const title = item.title?.trim();
        if (!sourceUrl || !title || !validFeedUrl(sourceUrl)) { skipped++; continue; }
        const record = { title: title.slice(0, 500), summary: (item.contentSnippet || item.summary || "").replace(/<[^>]*>/g, " ").slice(0, 1600), category: "World", region: "Global", source_name: feed.title || new URL(feedUrl).hostname, source_url: sourceUrl, published_at: item.isoDate || item.pubDate || null, retrieved_at: new Date().toISOString(), verification_status: "unverified", is_demo: false, tags: [] };
        const { error } = await supabase.from("stories").upsert(record, { onConflict: "source_url", ignoreDuplicates: true });
        if (error) { skipped++; } else { inserted++; }
      }
      results.push({ feed: feedUrl, inserted, skipped });
    } catch (error) { results.push({ feed: feedUrl, inserted: 0, skipped: 0, error: error instanceof Error ? error.message : "Feed request failed" }); }
  }
  return NextResponse.json({ status: "completed-with-possible-skips", processedFeeds: results.length, results, note: "New feed records are stored as unverified. This endpoint does not fact-check or publish verified verdicts." });
}
