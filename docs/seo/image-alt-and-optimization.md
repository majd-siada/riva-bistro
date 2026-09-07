# Image alt text & optimization policy (Riva Bistro)

## Alt text (#97 / #146)

| Case | Policy |
|------|--------|
| Scene / interior / food photography (`RestaurantImage`, page heroes) | Required meaningful Swedish/English descriptive `alt` stating subject + venue when helpful |
| Menu dish with photo (`ProductImage`, `FoodCard`) | Use dish name (and optional “— Riva Bistro”); never invent ingredients not in CMS |
| Decorative brand mark in empty product placeholder | `alt=""` + parent `aria-hidden="true"` |
| Gallery CMS items | `alt` comes from API `GalleryItem.alt`; empty alts are a content issue for staff |

Do **not** invent photo descriptions when the real subject is unknown.

## Optimization (#119)

- Prefer `next/image` with `fill` + explicit `sizes` for responsive delivery.
- `priority` only for above-the-fold heroes.
- Remote menu/media hosts allowlisted in `next.config.ts` `images.remotePatterns`.
- SVG emblems may use `unoptimized` / plain `<img>` when decorative.
- Local disk / Hostinger static assets — no S3 invented for MVP.

## Limitations

- Photograph contrast overlays are not token-contrast checked.
- CMS-uploaded alts are owner-controlled; code enforces presence of the prop, not editorial quality.
- This is not a Core Web Vitals claim.
