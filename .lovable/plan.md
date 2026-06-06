## Mobile UX Polish Plan

Pass over the four main surfaces with a consistent mobile bar: 44px+ tap targets, no horizontal overflow, sticky primary actions where they help, and tighter type hierarchy on small screens.

### 1. Home (`src/routes/index.tsx`)
- Hero: shrink headline to `text-4xl` on mobile scaling up to `text-6xl` on md+, tighten line-height, cap body copy width.
- City selector + search: stack vertically on mobile, full-width inputs, 44px height.
- Banner / feature cards: switch to single column under `sm`, equal padding, fix any image overflow.
- Section spacing: replace large `py-24` blocks with `py-12 md:py-24`.

### 2. Browse (`src/routes/browse.tsx`)
- Sticky filter/search bar at top on mobile (`sticky top-0 z-30 bg-background/95 backdrop-blur`).
- Category chips: horizontal scroll row with `snap-x`, hide scrollbar, 44px tall.
- Listing grid: `grid-cols-2` on mobile (currently likely 1), `gap-3`; cards keep aspect-ratio images.
- Empty + loading states get consistent vertical padding.

### 3. Listing detail (`src/routes/listings.$id.tsx`)
- Image gallery: swipeable, full-bleed on mobile, dot indicators.
- Sticky bottom CTA bar on mobile (Contact / Save) with safe-area padding.
- Tighter info hierarchy: price > title > meta; price prominent.
- Owner/shop card collapses below fold on mobile.

### 4. Auth (`src/routes/auth.tsx`) + forgot/reset password
- Inputs: `h-12`, `text-base` (prevents iOS zoom), generous spacing.
- Primary button full-width, `h-12`.
- Form card: full-width on mobile with comfortable padding, no fixed widths.
- Better keyboard handling: `inputMode`, `autoComplete` hints on email/password.

### Cross-cutting
- Audit any `overflow-x` from wide containers; add `overflow-x-hidden` on body sections that need it.
- Replace arbitrary grays with `text-muted-foreground` / `text-foreground` tokens where I touch them.
- All icon-only buttons get `aria-label` and `min-h-11 min-w-11`.
- Verify on the mobile preview viewport after each surface.

### Out of scope
- No new features, no copy changes, no backend/data changes.
- Desktop layout stays as-is except for the responsive breakpoints needed to make mobile work.
