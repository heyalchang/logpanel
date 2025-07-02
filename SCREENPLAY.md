# Log Viewer - Product Brief

## What We're Building

A slick log viewer for personal projects and demos. Think "what if console.log had a beautiful UI?" 

**The one-liner**: See all your app's logs in one place, filter by type, search for patterns, and look good doing it.

---

## Core User Stories

1. **"I want to see what my app is doing"**  
   → Open the viewer, see a live stream of logs with timestamps and color-coded severity levels.

2. **"Too much noise, just show me errors"**  
   → Click ERROR pill, instantly filter to problems only.

3. **"When did that weird thing happen?"**  
   → Type a search term, see matching logs highlighted.

4. **"What data was in that request?"**  
   → Click any log row to expand its JSON payload in a modal.

5. **"I need test data for my demo"**  
   → Hit one of 5 generator buttons, get realistic-looking logs instantly.

---

## Visual Identity

- **Dark VS Code aesthetic** - Developers feel at home
- **Color-coded severity** - INFO (blue), WARN (yellow), ERROR (red)  
- **Smooth animations** - Logs slide in, modals fade, everything feels responsive
- **Information density** - More like an IDE than a web app
- **Traffic light window controls** - Because details matter

---

## Technical Boundaries

- Uses Supabase (or any Postgres) as the log store
- Client renders everything (no server-side rendering needed)
- Handles ~1000 logs comfortably before needing pagination
- Search/filter happens client-side for demo snappiness

---

## Features Priority

### Must Have (MVP)
- [x] Live log streaming
- [x] Run selector (group logs by session)
- [x] Level filter pills
- [x] Text search
- [x] JSON data viewer
- [x] Demo data generators
- [x] Clean/export functions

### Nice to Have (Polish)
- [ ] Keyboard shortcuts (⌘K for search, ⌘E for export)
- [ ] Log entry animations  
- [ ] Syntax highlighting in JSON viewer
- [ ] Auto-pause when scrolling up

### Not Doing
- Authentication (use Supabase RLS if needed)
- Log aggregation/grouping
- Alerting
- Multi-user features

---

## Success = 

**"Wow, that's a clean log viewer"** when someone sees it in a demo.

The logs could be fake, the search could be basic—but if it looks professional and feels smooth, we've won.

---

*This brief is the shared understanding between Schema (what we store), Service (how we query), and UI (how we present) layers.* 