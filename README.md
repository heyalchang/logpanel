# ASA – Supabase-backed Realtime Logging Demo

Tired of SSH’ing into servers and running `tail -f` just to see what your
services are doing? **ASA** ( _Any-Source-Anywhere_ ) is an experimental,
end-to-end logging playground that stores logs in Postgres and streams them to
a desktop viewer in real-time.

The goal: show how a handful of modern tools—Supabase, React, Vite, Electron,
Tailwind—can replace ad-hoc file tails with a richer, queryable experience that
still takes minutes, not days, to stand up.

---

## What’s inside?

| Folder | Purpose |
| ------ | ------- |
| `setup.sql` | Single migration that creates a `logs` table and enables Supabase Realtime replication. |
| `web-app/` | React + Vite producer UI.  Lets you send logs manually, auto-generate traffic, simulate errors, or purge rows. |
| `electron-app/` | Electron desktop viewer.  Streams new rows over Supabase Realtime and displays them with colour-coded styling.  Tabs for Live, Filter (stub) and Settings. |
| _(coming soon)_ `packages/logger/` | Tiny SDK you can `npm install` and call `log.info("…")` from any Node / browser / serverless runtime. |

---

## Why use a database for logs?

* Structured JSON columns instead of plain text.
* SQL-powered filtering & aggregation.
* Built-in retention (cron delete old rows).
* Supabase Realtime means **zero** infra for the WebSocket fan-out.
* Multiple producers feed the same stream; your laptop can watch them all.

---

## Quick-Start (local dev)

1. **Create a Supabase project**
   Grab the Project URL and anon public key from **Settings → API**.

2. **Provision the table**
   ```bash
   psql "$SUPABASE_DB_URL" -f setup.sql
   ```
   (Or paste the contents in the SQL editor.)

3. **Environment variables**
   Create a `.env` in each front-end—or export in your shell:

   ```bash
   # shared
   VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
   ```

4. **Run the producer web-app**

   ```bash
   cd web-app
   npm i
   npm run dev        # http://localhost:5173
   ```

5. **Run the Electron viewer**

   ```bash
   # In a second terminal
   cd electron-app
   npm i
   npm run dev &      # Vite renderer on :5174
   npm run electron   # launches the desktop window
   ```

6. Open the web page, click **Send Log** or **Generate Traffic**, and watch the
   desktop viewer light up instantly.

---

## Feature Highlights

* Live stream capped at the 100 most-recent entries (keeps memory low).
* Auto-scroll with smooth "stick-to-bottom".
* Optional JSON payload rendered via `react-json-view`.
* Dark-mode Tailwind styling out of the box.
* Settings tab lets you swap Supabase credentials on the fly (handy when you
  monitor multiple projects).

---

## Roadmap

* [ ] Logging SDK (`@asa/logger`) with `info / warn / error` helpers.
* [ ] Additional table columns: `app_id`, `instance_id`, `version`, `commit_sha`.
* [ ] Filter tab UI (levels, date range, run ID, full-text search).
* [ ] Virtualised list (`react-window`) for thousands of rows.
* [ ] Persist viewer settings to `localStorage`.
* [ ] Basic auth/RLS policies so you can share dashboards safely.
* [ ] One-click installers for macOS / Windows.

---

## Contributing

This repo is a sandbox—PRs, issues, and ideas are all welcome.  File a ticket
or ping @your-handle on GitHub with suggestions.

---

## License

MIT.  Do whatever you like; attribution appreciated but not required.

Enjoy the logs 🚀