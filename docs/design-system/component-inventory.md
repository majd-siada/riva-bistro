# Frontend component inventory

Non-exhaustive inventory of reusable UI in `frontend/src/components` for the brochure + reservations MVP.

## Layout / chrome

- `layout/header.tsx`, `layout/footer.tsx`, `layout/section.tsx`, `layout/app-shell.tsx`
- Skip link + landmarks live in the root layout / header patterns

## Brand / marketing

- `brand/faq.tsx`, `brand/restaurant-image.tsx`, `brand/section-heading.tsx` (and related)

## Features

- Booking: `features/booking/reservation-form.tsx`
- Contact: `features/contact/contact-form.tsx`, `features/contact/event-inquiry-form.tsx`
- Admin shells under `app/admin/*`

## Legal

- `legal/legal-document.tsx` shared template banner for policy scaffolding

## UI primitives

- shadcn/Radix-based controls under `components/ui/*` (button, input, dialog, select, …)

## SEO helpers

- `lib/seo` page metadata factory + JSON-LD components under `components/seo/`

This is intentionally **not** a published component package; it is an in-repo inventory for handover.
