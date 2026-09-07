# Supported browser policy — Riva Bistro

**Not a multi-browser execution matrix.** No Playwright/BrowserStack runs are claimed.

## Stack assumption

The public site and admin SPA are built with **Next.js 15** and modern CSS (Tailwind). The product targets **current evergreen browsers**.

## Supported (expected to work)

| Surface | Browsers |
|---------|----------|
| Desktop | Latest **Chrome**, **Edge**, **Firefox**, **Safari** (current or previous major) |
| Mobile | Current **iOS Safari** and **Chrome for Android** for guest brochure + booking flows |

Admin day-to-day use is expected on a modern desktop browser (Chrome/Edge/Firefox/Safari).

## Not formally validated in this repository

- Legacy browsers (IE11, pre-Chromium Edge, old Safari)
- Embedded WebViews with incomplete CSS/JS
- Exact pixel parity across every engine
- Automated cross-browser CI

## Known limitations

- Advanced CSS/`:focus-visible` / dialog behavior relies on evergreen engines.
- Hostinger CDN / caching quirks are environment-specific and not browser-policy items.
- Physical device QA and Safari/iOS sign-off remain **human** (#131/#161/#162).

## How compatibility is checked today

1. Local Vitest (jsdom) — component behavior, not engine matrix  
2. `next build` — compile/type safety  
3. Manual spot-checks by operators on their preferred browser  

To add a formal multi-browser harness requires an explicit product decision (out of Phase 3 scope).
