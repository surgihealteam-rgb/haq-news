"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { NewsStory } from "@/lib/types";
import { rankStories } from "@/lib/ranking";

const categories = ["All", "World", "Politics", "Economy", "Technology", "Science", "Health", "Climate"];
const defaultInterests = ["World", "Science"];
function timeLabel(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? "Time unavailable" : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }); }
function statusLabel(status: NewsStory["verificationStatus"]) { return ({ developing: "Developing", unverified: "Not verified", under_review: "Under review", assessment_published: "Assessment published" })[status]; }

export function Newsroom({ stories }: { stories: NewsStory[] }) {
  const [feedStories, setFeedStories] = useState(stories);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [interests, setInterests] = useState(defaultInterests);
  const [showInterests, setShowInterests] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);
  const [savedOnly, setSavedOnly] = useState(false);
  const [now, setNow] = useState("Checking update time");
  useEffect(() => {
    let cancelled = false;
    fetch("/api/stories", { cache: "no-store" }).then((response) => response.ok ? response.json() : null).then((payload) => {
      if (cancelled || payload?.mode !== "live" || !Array.isArray(payload.stories) || payload.stories.length === 0) return;
      const live = payload.stories.map((row: Record<string, unknown>) => ({
        id: String(row.id), title: String(row.title || "Untitled story"), summary: String(row.summary || ""), category: String(row.category || "World"), region: String(row.region || "Global"), sourceName: String(row.source_name || "Source not named"), sourceUrl: String(row.source_url || ""), publishedAt: String(row.published_at || row.retrieved_at || new Date().toISOString()), updatedAt: String(row.retrieved_at || new Date().toISOString()), tags: Array.isArray(row.tags) ? row.tags.map(String) : [], verificationStatus: (row.verification_status as NewsStory["verificationStatus"]) || "unverified", evidence: row.source_url ? [{ label: "Original source", url: String(row.source_url), kind: "context" as const }] : [], isDemo: false
      }));
      setFeedStories(live);
    }).catch(() => { /* Keep demo mode if the API is unavailable. */ });
    return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    try {
      const stored = localStorage.getItem("haq-interests"); if (stored) setInterests(JSON.parse(stored));
      const bookmarks = localStorage.getItem("haq-saved"); if (bookmarks) setSaved(JSON.parse(bookmarks));
    } catch { /* Ignore invalid browser preferences and keep safe defaults. */ }
    setNow(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  }, []);
  const updateInterests = (next: string[]) => { setInterests(next); try { localStorage.setItem("haq-interests", JSON.stringify(next)); } catch {} };
  const toggleSaved = (id: string) => { const next = saved.includes(id) ? saved.filter((x) => x !== id) : [...saved, id]; setSaved(next); try { localStorage.setItem("haq-saved", JSON.stringify(next)); } catch {} };
  const filteredStories = useMemo(() => {
    let items = category === "All" ? feedStories : feedStories.filter((s) => s.category.toLowerCase() === category.toLowerCase() || s.tags.some((t) => t.toLowerCase() === category.toLowerCase()));
    if (savedOnly) items = items.filter((s) => saved.includes(s.id));
    return rankStories(items, interests, query);
  }, [feedStories, category, interests, query, savedOnly, saved]);
  return <main className="app-shell">
    <div className="demo-banner"><span className="pulse-dot"/> {feedStories.every((story) => story.isDemo) ? "DEMO MODE · Sample stories only — live sources are not connected yet" : "LIVE FEED · Stories link to their source; claims are not automatically verified"}</div>
    <header className="topbar"><Link href="/" className="brand" aria-label="HAQ News home"><span className="brand-mark">H</span><span>HAQ<span className="brand-dot">.</span>NEWS<small>TRUTH NEEDS EVIDENCE</small></span></Link><nav><a href="#latest">Latest</a><a href="#methodology">Our method</a><button className="outline-button" onClick={() => setShowInterests((v) => !v)}>✳ My interests</button></nav></header>
    <section className="hero"><div className="hero-copy"><div className="eyebrow"><span className="eyebrow-line"/> GLOBAL NEWS · EVIDENCE FIRST</div><h1>Know what happened.<br/><em>See the evidence.</em></h1><p>News shaped around what matters to you, with source links and uncertainty made visible.</p><div className="hero-meta"><span><span className="green-dot"/> Source transparency</span><span>◷ Updated locally at {now}</span></div></div><div className="hero-stamp"><div className="stamp-orbit">H</div><span>FACTS DESERVE<br/>A CLEAR RECORD</span><small>HAQ / 001</small></div></section>
    {showInterests && <section className="interests-panel"><div><strong>Build your personal feed</strong><p>Choose topics. Your preferences are saved in this browser.</p></div><div className="interest-options">{["World", "Politics", "Economy", "Technology", "Science", "Health", "Climate", "Media literacy"].map((item) => <button key={item} className={interests.includes(item) ? "interest-chip selected" : "interest-chip"} onClick={() => updateInterests(interests.includes(item) ? interests.filter((x) => x !== item) : [...interests, item])}>{interests.includes(item) ? "✓ " : "+ "}{item}</button>)}</div></section>}
    <section className="feed-toolbar" id="latest"><div><div className="section-kicker">THE WORLD, WITH CONTEXT</div><h2>Today's briefing <span className="count-pill">{filteredStories.length.toString().padStart(2, "0")}</span></h2></div><div className="feed-actions"><label className="search-box"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search stories" aria-label="Search stories"/><kbd>↵</kbd></label><button className={savedOnly ? "saved-filter active" : "saved-filter"} onClick={() => setSavedOnly((v) => !v)}>♡ Saved {savedOnly ? "✓" : ""}</button></div></section>
    <div className="category-row" role="group" aria-label="Filter by category">{categories.map((item) => <button key={item} className={category === item ? "category active" : "category"} onClick={() => setCategory(item)}>{item}</button>)}</div>
    <section className="story-grid">{filteredStories.map((story, index) => <article key={story.id} className={`story-card ${index === 0 ? "featured" : ""}`}><div className="card-topline"><span className="category-label">{story.category.toUpperCase()}</span><button className={saved.includes(story.id) ? "bookmark saved" : "bookmark"} aria-label={saved.includes(story.id) ? "Remove bookmark" : "Save story"} onClick={() => toggleSaved(story.id)}>{saved.includes(story.id) ? "♥" : "♡"}</button></div><h3><Link href={`/story/${story.id}`}>{story.title}</Link></h3><p className="story-summary">{story.summary}</p><div className="story-tags">{story.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}</div><div className="card-divider"/><div className="source-row"><span className="source-icon">↗</span><div><strong>{story.sourceName}</strong><small>{timeLabel(story.publishedAt)}</small></div></div><div className="card-bottom"><span className={`status status-${story.verificationStatus}`}>{story.verificationStatus === "developing" ? "◉" : "●"} {statusLabel(story.verificationStatus)}</span><Link className="read-link" href={`/story/${story.id}`}>Read evidence <span>↗</span></Link></div></article>)}</section>
    {filteredStories.length === 0 && <div className="empty-state"><span>⌕</span><h3>No matching stories</h3><p>Try another search, category, or saved filter.</p><button className="outline-button" onClick={() => {setQuery("");setCategory("All");setSavedOnly(false)}}>Clear filters</button></div>}
    <section className="methodology" id="methodology"><div className="method-icon">✳</div><div><div className="section-kicker">OUR EDITORIAL PROMISE</div><h2>Evidence before certainty.</h2><p>A source link is not proof by itself. HAQ.NEWS will distinguish what sources report, what original evidence establishes, what remains disputed, and what has not yet been checked.</p></div><Link href="/methodology" className="method-link">Read our method ↗</Link></section>
    <footer className="footer"><Link href="/" className="footer-brand">HAQ<span>.</span>NEWS</Link><span>Independent thinking starts with visible evidence.</span><div><Link href="/methodology">Methodology</Link><a href="mailto:hello@haq.news">Contact</a></div><small>© {new Date().getFullYear()} HAQ.NEWS · DEMO BUILD</small></footer>
  </main>;
}
