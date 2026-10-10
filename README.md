# HAQ.NEWS — Evidence-first global news

A beginner-friendly, GitHub-ready starter for a global news product. It includes a responsive feed, topic personalization in the browser, source/evidence labels, a story detail view, health endpoint, RSS ingestion endpoint, Supabase schema, and tests for feed ranking.

> **Important:** The included stories are fictional demonstration records. They are visibly labelled as demos and must never be presented as live or verified news. This repository is a working starter, not yet a fully autonomous global verification engine.

## Milestone 1: Run locally

### What you need
- A computer with Node.js 20.9 or newer and Git installed.
- A free GitHub account.

### Steps
1. Download/unzip this project.
2. Open a terminal in the `haq-news` folder.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open the local address printed by Next.js (usually `http://localhost:3000`).
6. Try search, category filters, save/bookmark, and the **My interests** controls. Preferences are saved in your browser only.
7. Run `npm test` to check the ranking utility.

If you do not know how to use a terminal, see `docs/BEGINNER_GUIDE.md`.

## Milestone 2: Put the code on GitHub

1. Create a new repository called `haq-news` at https://github.com/new.
2. Do not initialize it with a README (this project already has one).
3. In the project folder run:
   ```bash
   git init
   git add .
   git commit -m "Build HAQ.NEWS starter"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/haq-news.git
   git push -u origin main
   ```
4. Replace `YOUR-USERNAME` with your GitHub username.

## Milestone 3: Deploy the website

1. Sign in to https://vercel.com/ with GitHub.
2. Choose **Add New → Project**, import `haq-news`, then click **Deploy**.
3. For the demo UI, no environment variables are required.
4. Vercel gives you a preview/production URL. Test it on phone and desktop.

## Milestone 4: Connect Supabase (optional until you are ready)

1. Create a project at https://supabase.com/.
2. In SQL Editor, run `supabase/schema.sql`.
3. Copy the project URL and anon/public key into `.env.local` or Vercel Environment Variables.
4. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only. Never add it to a `NEXT_PUBLIC_` variable or commit it to GitHub.
5. When configured, `/api/health` reports whether the required public Supabase settings are present.

The UI currently works in demo mode and does not need Supabase. Connecting the database is the next integration milestone; do not assume demo stories are being persisted.

## RSS ingestion endpoint

`POST /api/ingest` reads the `NEWS_FEED_URLS` list and ingests permitted RSS/Atom feeds into the `stories` table when Supabase server credentials are configured.

Required environment variables:
- `NEWS_FEED_URLS`: comma-separated feed URLs you are allowed to ingest.
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)
- `CRON_SECRET`: a long random secret.

Call it with `Authorization: Bearer YOUR_CRON_SECRET`. Do not expose the secret in client-side code. Example:
```bash
curl -X POST https://YOUR-DOMAIN/api/ingest -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Security note:** The starter restricts feed URLs to HTTP(S), but production ingestion should use a fixed allowlist of trusted domains and outbound network controls to mitigate SSRF. Only add feeds whose terms permit your intended use. Store metadata and links; do not republish full copyrighted articles without permission.

## Current scope and limitations

- Demo stories are fictional and labelled accordingly.
- Feed ingestion stores source metadata and excerpts, not full article text.
- AI claim extraction, evidence retrieval, automatic fact-check verdicts, user accounts, cross-device preferences, notifications, and editorial approval are not yet implemented.
- No story is marked “verified” by this starter. It distinguishes source links from an actual editorial assessment.
- RSS ingestion runs only when the protected endpoint is called. Scheduling it requires a configured scheduler/cron service and a production review of provider limits.
- The first version is a web app, not an App Store / Play Store app.

## Tests

```bash
npm test
```

## Roadmap
1. **M1 (included):** Responsive demo UI, search, categories, local preferences, story details, API health, RSS ingestion route, schema, ranking tests.
2. **M2:** Configure Supabase and deploy; ingest 3–5 permitted feeds; add feed/source health logs.
3. **M3:** Add AI-assisted summaries grounded in retrieved source material, with provenance and strict usage budgets.
4. **M4:** Add claim-level evidence, contradictory evidence, reviewer queue, and human approval for consequential verdicts.
5. **M5:** Add scheduled jobs, change detection, correction history, user accounts, and personalized server-side feeds.

## Trust policy
HAQ.NEWS must never imply that a story is verified merely because multiple websites repeat it or an AI model expresses confidence. Each future assessment must identify the claim, inspected evidence, source dependencies, uncertainty, and review status. Preserve published assessment versions and display material corrections.
