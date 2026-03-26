# HMPF — Next Steps

Prioritized recommendations based on impact and effort.

---

## Quick Wins

1. **Group filtering in feed** — Add a filter (All / food / thoughts / mad). Groups exist but there's no way to filter by them yet. Makes groups actually useful.

2. **Empty states** — Show friendly copy when: no posts yet, no unprocessed items in Review, empty group. Improves first-time experience.

3. **Pull-to-refresh** — Allow manual refresh on the feed and review lists. Simple, high-impact mobile UX.

---

## Core Polish

4. **Group management in Settings** — View, rename, and delete groups. Right now groups are "create and assign" only.

5. **Search** — Search posts by content, hashtag, or group. Becomes more useful as the feed grows.

6. **Profile / account** — Edit display name, username, avatar. The schema supports it; the UI doesn't yet.

---

## Social-Ready (Original Vision)

7. **Visibility + friends** — Use the `visibility` column (private / friends / public) and add a friends/follows table. Let users see friends' posts when visibility allows.

8. **Feed by visibility** — Filter or switch between "My feed" and "Friends' feed" based on visibility.

9. **@mentions and collaboration** — Tag users in posts. Optional: shared posts or shared goals.

---

## Mobile & PWA

10. **Offline capture** — Queue posts offline and sync when back online. PWA + IndexedDB.

11. **Notifications** — Weekly reminder for review, or "You have X unprocessed items."

12. **Capacitor native builds** — Ship to App Store / Play Store. Verify haptics, keyboard behavior, safe areas.

---

## Data & Stability

13. **Export** — Export posts (JSON or CSV) or backup/restore.

14. **Error handling** — Clear loading and error states, retry logic for failed syncs.

15. **Rate limiting** — Protect signup or capture endpoints from abuse (if needed).

---

## Suggested Priority Order

Start with: **Group filtering** → **Empty states** → **Group management in Settings**.  
These three make the app feel much more complete with minimal effort.
