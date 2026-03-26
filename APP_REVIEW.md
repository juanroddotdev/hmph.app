# HMPF App — Feature Review & Current Capabilities

## Overview
**HMPF** is a mobile-first, zero-friction capture app. Open → Type → Enter. Built with Vue 3, Supabase, Tailwind CSS, and Capacitor. Designed to be "social-ready" for future features like shared feeds.

---

## What’s Implemented

### Authentication
- **Login / Sign Up** — Email + password
- Sign up creates a user and auto-creates a profile in `profiles`
- Session persists across refreshes
- **Sign Out** — Available from the main nav

### Main Navigation
- **Capture** — Main feed + capture input
- **Review** — Weekly triage view (unprocessed items)
- **Settings** — Time format and other preferences
- **Sign Out** — Header button

### Capture Flow
1. **Capture Input Card**
   - Textarea (auto-focus)
   - Time format: 12hr | 24hr | Time of day
   - Mood emojis (insert at cursor)
   - Tag emojis (insert with hashtag, e.g. `🧠 #thoughts `)
   - Custom tags via **+** and modal (emoji + name)
2. **Submit** — Enter to capture
3. **Optimistic updates** — Post appears immediately, then syncs to Supabase
4. **Haptics** — Light vibration on save (Capacitor)

### Post Cards (Feed)
- Reverse-chronological feed
- **Display**
  - Content (hashtags highlighted)
  - Tag emojis in top-right (subtle)
  - Mood emojis in bottom-right (subtle)
  - Timestamp (format from settings)
  - Group badge if assigned
- **Long-press (~400ms)** — Enlarges and shows actions:
  - **Edit** — Full edit form (content, time format, mood, tags)
  - **Delete** — Removes post
  - **Group** — Opens group picker
- **Group picker**
  - List of groups (e.g. food, thoughts, mad)
  - **+ New group** — Inline add and assign
  - Assigns post to chosen group and closes

### Weekly Review
- Shows posts where `is_processed` is false
- **Done** — Marks as done
- **Push** — Pushes to next week (`scheduled_for` updated)
- PostCard actions (Edit, Delete, Group) work the same

### Tags & Mood
- **Default tags:** thoughts, todo, idea, priority, question, goal (with emojis)
- **Custom tags** — Add in capture input or edit form
- Tags and mood stored in post content; parsed for display
- Tag/mood emojis are removed from body text and shown in corners

### Time Format
- **12hr** — e.g. 2:30 PM
- **24hr (military)** — e.g. 14:30
- **Time of day** — morning, brunch, day, after-work, sleep
- Persists in `localStorage`

### Groups
- Default: food, thoughts, mad
- Custom groups stored in `localStorage`
- Assign posts to groups via long-press → Group
- Assigned group shown on card

### Technical
- **Supabase** — Auth, `profiles`, `posts`
- **PWA** — Add to Home Screen (vite-plugin-pwa)
- **Capacitor** — Haptics and keyboard handling
- **RLS** — Users only read/write their own data

---

## What Should Work Right Now

| Action | Expected behavior |
|--------|-------------------|
| Sign up | Create account, auto profile, redirect to feed |
| Sign in | Load feed, show existing posts |
| Type and Enter | Post appears right away, syncs to Supabase |
| Long-press card | Card enlarges, shows Edit / Delete / Group |
| Edit post | Change content, mood, tags, time format; Save updates |
| Delete post | Removes post locally and in Supabase |
| Assign to group | Long-press → Group → Pick group; badge appears |
| Add custom tag | + in capture input; add emoji + name |
| Change time format | In capture input or Settings |
| Review mode | See unprocessed posts, Done or Push |
| PWA install | Add to Home Screen on supported browsers |

---

## Prerequisites

1. **Supabase**
   - Project created
   - `supabase/schema.sql` run in SQL Editor
   - Email auth enabled (default)
   - `.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
2. **Run**
   - `npm install && npm run dev`

---

## Database Schema (Social-Ready)

- **profiles** — id, username, display_name, avatar_url
- **posts** — id, user_id, content, status, is_processed, visibility, scheduled_for, created_at
- **Enums** — post_status (active, done), post_visibility (private, friends, public)
- **RLS** — Users access only their own rows
- **Indexes** — For future social queries

---

## Not Implemented (Future)

- Social feeds (follow friends, shared visibility)
- Group filtering in feed
- Profile edit (username, avatar)
- Reordering or manual grouping of groups
