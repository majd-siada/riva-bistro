# ARIA / semantics review notes (#149)

## Approach

Prefer native HTML. Add ARIA only for relationships Radix/native do not already express.

## Fixes applied

| Issue | Fix |
|-------|-----|
| FAQ accordion: `aria-expanded` without `aria-controls` / panel id | Added `aria-controls`, panel `id`, `role="region"` + `aria-labelledby` |
| FAQ ChevronDown decorative | `aria-hidden="true"` |

## Reviewed and left as-is (correct)

- Form fields: `aria-invalid` + `aria-describedby` error ids
- Nav `aria-label` / `aria-current="page"`
- Menu chips `aria-current="true"` for non-route selection
- Decorative icons / separators `aria-hidden`
- Radix Dialog/Sheet titles and close “Stäng”

## Not done (external)

Screen-reader verification of name/role/value on real devices.
