# Hmpf. 😤 

> **The "Reluctant" Productivity App.** Get it out of your head and into the feed. 

**Hmpf** is a high-speed, zero-friction capture tool for the thoughts, goals, and "to-dos" you aren't ready to deal with yet. Built for the "reluctant achiever," it combines the familiar UX of a social media newsfeed with a rigorous weekly triage system.



---

## 🧠 The Philosophy
Most productivity apps fail because they require too much "upfront work" (picking a folder, a date, a priority). **Hmpf** reverses this:

1. **Capture First:** Open the app and type. Hit Enter. That’s it.
2. **Review Later:** Once a week, the app enters **Review Mode**. You must triage your feed—decide what's *Done* and what gets *Pushed* to next week. No stagnant lists allowed.

## ✨ Key Features
* **💨 Zero-Friction Capture:** Auto-focusing input designed for the instant "brain dump."
* **📱 Mobile-Native UX:** Built with **Vue 3** and **Capacitor** for a smooth experience with native haptic feedback.
* **🔄 The Weekly Triage:** A dedicated interface to clear your "mental debt" without the guilt of a 100-item deep todo list.
* **🔗 Social-Ready Architecture:** Designed with a PostgreSQL backbone (Supabase) to support future "Shared Feeds" and collaborative goals.

## 🛠️ Tech Stack
* **Frontend:** Vue 3 (Composition API + `<script setup>`)
* **Build Tool:** Vite
* **Styling:** Tailwind CSS
* **State Management:** Pinia
* **Database & Auth:** Supabase (PostgreSQL)
* **Mobile Wrapper:** Capacitor
* **Icons:** Lucide-Vue-Next

---

## 📂 Project Structure
```text
src/
├── assets/          # Global styles and branding
├── components/      # CaptureInput, PostCard, WeeklyReview
├── lib/             # Supabase client
├── plugins/         # Capacitor (keyboard, haptics)
├── stores/          # Pinia useThoughtStore
├── views/           # FeedView, ReviewView
supabase/
└── schema.sql       # Run in Supabase SQL Editor
```

---

## 🚀 Getting Started

### 1. Supabase Setup
1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → run `supabase/schema.sql`
3. Enable **Anonymous Auth**: Authentication → Providers → Anonymous Sign-Ins → Enable
4. Copy project URL and anon key

### 2. Environment
```bash
cp .env.example .env
# Edit .env with your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

### 3. Install & Run
```bash
npm install
npm run dev
```

### 4. PWA (Add to Home Screen)
Build and serve; most browsers will prompt "Add to Home Screen" when opened on mobile.

### 5. Native Mobile (Capacitor)
```bash
npm run build
npx cap init
npx cap add ios   # or android
npx cap sync
npx cap open ios  # or android
```

---

## 📱 Usage
- **Capture:** Open → Type → Enter. Optimistic updates + haptic feedback.
- **Review:** Weekly triage. Mark items **Done** or **Push** to next week.