# Frontend security headers — deployment note

## Root cause (verified 2026-09-07)

Live `https://rivabistro.se/` responses show Hostinger hCDN (`server: hcdn`) and only:

`content-security-policy: upgrade-insecure-requests`

`origin/main` `frontend/next.config.ts` historically had **no** `headers()` block. Security headers lived only on the production-readiness branch until this ship commit. Next **is** serving the site (`x-nextjs-cache` on `/meny`), so the gap was primarily **undeployed app config**, not “missing Hostinger” as the only explanation.

## Fix in this ship commit

1. `frontend/next.config.ts` — `headers()` with nosniff, Referrer-Policy, X-Frame-Options, Permissions-Policy, CSP-Report-Only  
2. `frontend/src/middleware.ts` — same baseline on matched routes (belt-and-suspenders for Node standalone)

## Verification after Hostinger rebuild

```bash
curl -sI https://rivabistro.se/ | tr -d '\r' | grep -iE '^(HTTP/|x-content-type-options|referrer-policy|x-frame-options|permissions-policy|content-security-policy)'
```

Expect app headers in addition to any Hostinger CSP. If app headers still missing after this SHA is live, configure custom headers in Hostinger hPanel (CDN may strip upstream headers on some plans).

## Human action if still missing post-deploy

Hostinger hPanel → website → headers/CDN: allow or add the same header set. API (`api.rivabistro.se`) already emits Django security headers via Nginx/VPS and does not need this step.
