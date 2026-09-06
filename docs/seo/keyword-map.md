# Riva Bistro — keyword cluster map

**Rule:** A 1,000-keyword universe is for research and prioritization.  
**Do not** place 1,000 keywords on the website. Cluster → intent → **one owning page** → restrained titles/copy → measure in Search Console → expand what works.

Authoritative NAP: see [nap-consistency.md](./nap-consistency.md) (Hornsbergs Strand 57 only).

Cuisine positioning on the live site: **svensk / skandinavisk** (with mediterran värme).  
Italian-primary keywords are **deprioritized / ignore** unless the menu explicitly warrants them later.

---

## Existing public pages (owners)

| Path | Role |
|------|------|
| `/` | Brand + Kungsholmen discovery hub |
| `/meny` | Menu, dishes, lunch/dinner food intent |
| `/boka` | Booking / reservation intent |
| `/kontakt` | Address, hours, map, local/Hornsbergs intent |
| `/privata-event` | Groups, corporate, private dining |
| `/om-oss` | Brand story, Swedish/Scandinavian cuisine story |
| `/galleri` | Atmosphere support (low SEO priority) |

**No new doorway URLs** in this phase (`/restaurang-kungsholmen`, `/romantisk-middag`, etc.).

---

## Cluster overview (≈18 → pages)

| ID | Cluster | Primary intent | Owning page | Priority |
|----|---------|----------------|-------------|----------|
| C01 | Brand | Riva Bistro (+ city/area) | `/` | P0 |
| C02 | Local Kungsholmen | restaurang Kungsholmen | `/` (+ `/kontakt`) | P0 |
| C03 | Hornsbergs / waterfront | Hornsbergs Strand, vid vattnet | `/kontakt` (+ `/`) | P0 |
| C04 | Stockholm generic | restaurang Stockholm | `/` secondary only | P2 |
| C05 | Menu / dishes | meny, rätter | `/meny` | P0 |
| C06 | Swedish / Scandinavian | svensk/skandinavisk mat | `/om-oss` + `/meny` | P1 |
| C07 | Booking | boka bord | `/boka` | P0 |
| C08 | Lunch | lunch Kungsholmen | `/meny` + `/boka` | P1 |
| C09 | Dinner / evening | middag / kväll | `/` + `/boka` | P1 |
| C10 | Romantic / couples | dejt, romantisk | `/` + `/boka` | P2 |
| C11 | Groups / corporate / events | sällskap, företag | `/privata-event` | P1 |
| C12 | Nearby areas | Kristineberg, Stadshagen, … | `/kontakt` support | P3 |
| C13 | English / tourist | restaurant Stockholm/Kungsholmen | same SV pages | P2 |
| C14 | Meat / grill | entrecôte, grill, kött | `/meny` support | P1 |
| C15 | Fish / seafood | röding, fisk | `/meny` support | P1 |
| C16 | Atmosphere / waterfront vibe | utsikt, uteservering | `/` + `/galleri` | P2 |
| C17 | Long-tail discovery | “var äter man…” | nearest owner page | P2 |
| C18 | Ignore / low value | italiensk*, thin variants | — | — |

Compact row-level mapping for representatives: [keyword-clusters.csv](./keyword-clusters.csv).

---

## Per-page brief (primary / secondary / suggested title & H1)

### `/` — Home (C01, C02, C09, C16)

- **Primary:** Riva Bistro Kungsholmen / Riva Bistro Stockholm  
- **Secondary:** restaurang Kungsholmen, middag Kungsholmen, bistro Stockholm (soft)  
- **Suggested title:** `Riva Bistro — Restaurang på Kungsholmen i Stockholm`  
- **Suggested H1:** Keep brand/experience H1; ensure Kungsholmen + Hornsbergs appear in first viewport copy (already present via NAP blocks).  
- **Internal links:** Meny, Boka, Kontakt, Privata event  

### `/meny` — Menu (C05, C08, C14, C15)

- **Primary:** Riva Bistro meny / meny Kungsholmen  
- **Secondary:** lunchmeny, middag meny, entrecôte, röding, köttbullar (only if on menu)  
- **Suggested title:** `Meny — Riva Bistro Kungsholmen`  
- **Suggested H1:** `Meny`  
- **Notes:** Dish long-tails support this URL; do not create dish landing pages unless product strategy changes.

### `/boka` — Booking (C07, C08, C09, C10)

- **Primary:** boka bord Kungsholmen / boka bord Riva Bistro  
- **Secondary:** boka middag Stockholm, boka restaurang Kungsholmen  
- **Suggested title:** `Boka bord — Riva Bistro Kungsholmen`  
- **Suggested H1:** `Boka bord`  

### `/kontakt` — Contact & location (C03, C12)

- **Primary:** Riva Bistro adress / Hornsbergs Strand / öppettider  
- **Secondary:** restaurang Hornsbergs Strand, restaurang vid vattnet Kungsholmen, nearby areas  
- **Suggested title:** `Kontakt & hitta hit — Hornsbergs Strand, Kungsholmen`  
- **Suggested H1:** `Kontakt`  
- **NAP:** Always from `business.ts` (Hornsbergs Strand 57).  

### `/privata-event` — Events (C11)

- **Primary:** privata event / företagsmiddag Kungsholmen  
- **Secondary:** gruppmiddag, födelsedag, sällskap  
- **Suggested title:** `Privata event & företagsmiddagar — Riva Bistro`  
- **Suggested H1:** `Privata event`  

### `/om-oss` — About (C06)

- **Primary:** om Riva Bistro / svensk skandinavisk mat Kungsholmen  
- **Secondary:** modern svensk mat, säsongsbetonat kök  
- **Suggested title:** `Om oss — Riva Bistro på Kungsholmen`  
- **Suggested H1:** Keep story H1; one clear cuisine sentence.  

### `/galleri` — Gallery (C16 support)

- **Primary:** none competitive — atmosphere support only  
- **Suggested title:** `Galleri — Riva Bistro Kungsholmen`  

---

## Intent → page cheat sheet

| User wants… | Send to |
|-------------|---------|
| Brand / “Riva” | `/` |
| “Restaurang Kungsholmen” | `/` then deep link Kontakt |
| Address / hours / map / Hornsbergs | `/kontakt` |
| Menu / dishes / lunch list | `/meny` |
| Book a table | `/boka` |
| Company dinner / private party | `/privata-event` |
| Story / Swedish food philosophy | `/om-oss` |
| Photos / vibe | `/galleri` |

---

## Ignore or deprioritize (C18)

- **italiensk restaurang / Italian restaurant** as primaries — conflicts with current Swedish/Scandinavian positioning.  
- Exact-match spam variants and near-duplicates (keep one representative per stem in tracking).  
- “Nära mig” terms — useful for GBP, weak for static page targeting.  
- Thin English duplicates of Swedish heads unless tourist traffic proves real in GSC.

---

## Suggested measurement loop (external)

1. Search Console property for `rivabistro.se`  
2. Submit sitemap  
3. Filter queries by cluster  
4. Double down on pages earning impressions; only then consider **one** genuine new guide-style page if a cluster has demand and no fit

---

## Representative keyword assignments

See CSV for machine-readable rows. Summary samples:

**C01 Brand → `/`:** Riva Bistro, Riva Bistro Stockholm, Riva Bistro Kungsholmen, Riva Bistro meny, Riva Bistro boka bord, Riva Bistro öppettider  

**C02 Kungsholmen → `/`:** restaurang Kungsholmen, bistro Kungsholmen, middag Kungsholmen, mysig restaurang Kungsholmen  

**C03 Hornsbergs → `/kontakt`:** restaurang Hornsbergs Strand, restaurang Hornsberg, middag Hornsbergs Strand, restaurang vid vattnet Hornsbergs Strand  

**C05 Menu → `/meny`:** Riva Bistro meny, meny Kungsholmen, lunchmeny Kungsholmen, entrecôte Kungsholmen, röding Kungsholmen, köttbullar Kungsholmen  

**C07 Booking → `/boka`:** boka bord Kungsholmen, boka bord Stockholm, boka middag Kungsholmen, boka restaurang Hornsbergs Strand  

**C11 Events → `/privata-event`:** företagsmiddag Kungsholmen, gruppmiddag Stockholm, privata event Stockholm, födelsedag restaurang Kungsholmen  

Full stem coverage from the 1–1000 list is folded into these clusters; variants inherit the parent cluster’s `target_page` and `priority`.
