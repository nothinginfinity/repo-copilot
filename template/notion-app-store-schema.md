# Notion App Store — Database Schema

This is the property schema for the Notion database that powers the App Store template.
Buyers duplicate this into their Notion workspace and connect it to their GitHub.

## Database Name
`App Library` (or any name — the workflow targets the DB ID, not the name)

## Required Properties

| Property Name | Type | Notes |
|---|---|---|
| `Name` | Title | Repo name — auto-populated or manual |
| `GitHub URL` | URL | Full repo URL e.g. `https://github.com/you/my-app` — **required for sync** |
| `Live Site` | URL | Auto-populated by `sync-live-sites.yml` |
| `Description` | Text | Repo description — fill manually or via future sync |
| `Language` | Select | `HTML`, `JavaScript`, `TypeScript`, `CSS`, `Python`, etc. |
| `Status` | Select | `Active` · `In Progress` · `Archived` · `Draft` |
| `Track` | Select | `Product` · `Tool` · `Game` · `Demo` · `Template` |
| `Last Updated` | Date | Date of last GitHub push — manual or via future sync |
| `Agent Owner` | Select | Which AI agent owns this repo (`Bob`, `Alice`, `Charlie`, `Jared`) |
| `Live Site` | URL | Auto-populated by sync workflow |

## Setup Steps for Buyer

1. Create a new Notion database (full-page, not inline)
2. Add the properties above exactly as named (names are case-sensitive for the workflow)
3. Copy the database ID from the URL: `notion.so/.../<DATABASE_ID>?v=...`
4. Add your first row: paste your first GitHub repo URL into `GitHub URL`
5. Follow `setup-guide.md` to connect the sync workflow

## Property Notes

- **`GitHub URL` is the join key** — the sync workflow matches Notion rows to GitHub repos using this field. Every row that should auto-get a Live Site URL must have a valid GitHub URL.
- **`Live Site` will be overwritten** by the workflow if the URL formula matches. Don't manually set it if you want auto-sync.
- All other properties are optional for the sync to work — but they make the database much more useful as an app library.

## Recommended Views

- **Board view** grouped by `Status` — your Kanban app launcher
- **Gallery view** — visual browsing (embed `Live Site` as a preview)
- **Table view** — full management view
- **Filtered: Active** — only apps with `Status = Active` and `Live Site` populated
