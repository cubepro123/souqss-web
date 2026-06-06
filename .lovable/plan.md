This is a big scope (13 features). I'll ship them in 4 batches so you can see progress and stop me if any are unneeded. Each batch is independent and leaves the app working.

## Batch 1 — User control over their own stuff (fast wins)
- **Edit / delete listings** — `/_authenticated/edit-listing.$id` (reuses post-ad form), with image reorder / remove / add. Also bumps the existing "Delete" on profile to a confirm + working flow.
- **Edit profile** — already wired on profile page; add avatar upload to `listing-images` bucket.
- **Edit / close shop** — already supported on `my-shop`, just add a "Change logo" + clearer "Close shop" UX.
- **Search inside a shop** — text filter on `shops/$id`.
- **Pagination** — "Load more" (range query) on `/browse`, `/shops`, `/favorites`.
- **SEO/meta on dynamic pages** — set per-listing and per-shop `<title>` + og tags from loader data.
- **Email verification UX** — add "Resend confirmation email" link on auth page + a `/auth/confirmed` landing page.

## Batch 2 — Messaging (biggest one)
- New tables: `conversations` (listing_id, buyer_id, seller_id) + `messages` (conversation_id, sender_id, body, read_at), with RLS so only the two participants see them.
- `/_authenticated/inbox` — list of conversations with unread badges.
- `/_authenticated/inbox.$id` — chat thread with realtime subscription (Supabase Realtime on `messages`).
- "Message seller" button on listing page (creates or opens conversation).
- Unread count pill in the header (`useAuth` + realtime).

## Batch 3 — Trust & safety + reviews
- **Roles table** (`app_role` enum + `user_roles` + `has_role()` SECURITY DEFINER) per the security pattern.
- **Report a listing** — `reports` table (listing_id, reporter_id, reason). "Report" button on listing page. Admin route `/_authenticated/admin/reports` gated by `has_role(uid, 'admin')`.
- **Reviews** — `reviews` table (shop_id, author_id, rating 1–5, body). Show average + recent reviews on shop page; one-per-user-per-shop. Buyers must be signed in.

## Batch 4 — Service bookings
- `bookings` table (shop_id, customer_id, requested_date, address, notes, status: pending/accepted/declined/done).
- "Request service" form on service-provider shop pages.
- `/_authenticated/inbox` gets a "Bookings" tab for the provider to accept/decline.
- Notification on the bookings tab when status changes (same realtime channel).

## Notes
- All new tables get RLS from day one.
- Notifications: in-app via realtime + unread badges. Email notifications are out of scope unless you want them — say the word.
- I'll wire each batch end-to-end and verify the build before moving to the next.

Reply **"go"** to start with Batch 1, or tell me to reorder / drop items.