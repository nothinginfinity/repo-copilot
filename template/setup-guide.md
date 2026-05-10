# Notion App Store — Setup Guide

> **You just bought the Notion App Store template.** This guide gets you from zero to a live,
> auto-updating app library in Notion — connected to your own GitHub repos — in under 15 minutes.

---

## What You're Building

A Notion database that automatically discovers your GitHub apps and populates live URLs for each one.
Anytime you push a new HTML app to GitHub, it appears in your Notion app library within 24 hours (or instantly on demand).

You can then:
- Launch any app directly from Notion with one click
- Share your app library with friends, clients, or customers
- Sell apps directly — buyers get a Notion page with a live launch button

---

## Prerequisites

- A GitHub account with at least one public repo containing an `index.html`
- A Notion account (free tier works)
- 15 minutes

---

## Step 1 — Set Up Your Notion Database

1. Open Notion and create a new **full-page database** (not inline)
2. Name it `App Library` (or anything you like)
3. Add these properties:

   | Property | Type |
   |---|---|
   | `Name` | Title (already exists) |
   | `GitHub URL` | URL |
   | `Live Site` | URL |
   | `Description` | Text |
   | `Language` | Select |
   | `Status` | Select |
   | `Track` | Select |

4. Copy your **Database ID** from the URL bar:
   ```
   https://notion.so/yourname/THIS-IS-YOUR-DATABASE-ID?v=...
   ```
   It's the 32-character string between the last `/` and the `?`.

5. Add your first row: paste your first GitHub repo URL into the `GitHub URL` field
   (e.g. `https://github.com/yourusername/my-app`)

---

## Step 2 — Connect Your GitHub

1. **Fork** (or duplicate) the `repo-copilot` template repo to your GitHub account

2. In your forked repo, go to **Settings → Secrets and variables → Actions**

3. Add a new secret:
   - Name: `NOTION_TOKEN`
   - Value: Your Notion Internal Integration token
     *(Create one at [notion.so/my-integrations](https://www.notion.so/my-integrations) → New integration → copy the token)*

4. **Share your Notion database with the integration:**
   - Open your `App Library` database in Notion
   - Click `...` → `Connect to` → select your integration

5. Drop `sync-live-sites-template.yml` into `.github/workflows/` in your fork

6. Edit the workflow file — update these two lines:
   ```yaml
   NOTION_DB_ID: YOUR_NOTION_DATABASE_ID_HERE   # ← paste your DB ID
   GH_ORG: YOUR_GITHUB_USERNAME_HERE            # ← your GitHub username
   ```

7. Commit and push

---

## Step 3 — Run Your First Sync

1. Go to your forked repo on GitHub
2. Click **Actions** → **Sync Live Site URLs → Notion**
3. Click **Run workflow** → **Run workflow**
4. Watch the logs — you should see `Formula URL: my-app → https://yourusername.github.io/my-app/`
5. Open Notion — your `Live Site` field should now be populated! 🎉

> **Note:** The URL will show a 404 until you enable GitHub Pages on that repo.
> Go to repo Settings → Pages → Source → set to `main` branch / `/ (root)`.
> Once enabled, your app is live at the URL.

---

## Step 4 — Set Up Your App Launcher View

1. In your Notion database, click **+ Add a view**
2. Choose **Board** — group by `Status`
3. Each card in the `Active` column is a live, launchable app
4. Click any card, then click the `Live Site` URL to open the app

Optional: create a **Gallery view** for visual browsing.

---

## Auto-Sync Schedule

The workflow runs automatically every day at 6am UTC. Any new public HTML repo you push will appear in Notion within 24 hours.

To sync immediately: Actions → Sync Live Site URLs → Run workflow.

---

## Sharing & Selling Your Apps

- **Share your App Library page** with anyone — they can browse and click Live Site links directly
- **Sell access** by sharing a specific Notion page embed or by making your app repo public
- **Multiplayer apps**: any app at `yourusername.github.io/my-game/` can use WebSockets or a shared API — your friends open the same URL and you're in the same session

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Workflow runs but nothing updates in Notion | Check that your integration is connected to the database (Step 2.4) |
| `Live Site` shows a 404 | Enable GitHub Pages on the repo (Settings → Pages → main/root) |
| Repo doesn't appear in sync | Make sure the repo is **public** and the `GitHub URL` in Notion matches exactly |
| `NOTION_TOKEN` error | Regenerate the token at notion.so/my-integrations and update the GitHub secret |

---

*Built with [repo-copilot](https://github.com/nothinginfinity/repo-copilot) — the AI-native GitHub × Notion automation layer.*
