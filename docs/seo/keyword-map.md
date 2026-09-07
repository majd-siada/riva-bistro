# Riva Bistro — SEO keyword strategy (source of truth)

**Purpose:** Unambiguous cluster → intent → **one primary URL** mapping.  
**Not for publishing:** Do not paste keyword lists into page copy or metadata dumps.

**Rules**

1. Every **active (KEEP)** cluster has exactly **one** `primary_url`.
2. Other URLs may be `support` (internal links / conversion) — never co-primary.
3. Claims must match live site + CMS. Seed/fallback menu data is not enough.
4. No doorway URLs (`/restaurang-kungsholmen`, nearby-area landers, etc.).
5. Authoritative NAP: [nap-consistency.md](./nap-consistency.md) — **Hornsbergs Strand 57** only.

**Live CMS check (2026-09-06, `api.rivabistro.se`)**

| Signal | Result |
|--------|--------|
| Lunch category / lunch products | **Not published** (no `dagens-lunch` category; no lunch items) |
| Entrecôte, Halstrad röding, Grillad lammracks, Rivas köttbullar | **Published** |
| Pasta category + items | Published (cuisine mix — do not SEO-target “italiensk restaurang”) |
| Uteservering / utsikt claims on site | **Not proven** in page copy |
| Romantic / dejt framing on site | **Absent** |

Machine-readable rows: [keyword-clusters.csv](./keyword-clusters.csv).

---

## Ownership model (active)

| Primary URL | Role | Owns (intent class) |
|-------------|------|---------------------|
| `/` | Brand + local discovery + dinner experience | Brand, Kungsholmen restaurant discovery, dinner/atmosphere experience |
| `/meny` | Food / menu | Menu queries + **live** dish/category queries |
| `/boka` | Booking conversion | Book-a-table transactional queries |
| `/kontakt` | NAP / logistics | Address, hours, Hornsbergs / find-us |
| `/privata-event` | Groups & corporate | Private events, company dinners, groups |
| `/om-oss` | Brand story / philosophy | Story & values — **not** generic “svensk mat” food queries |
| `/galleri` | Visual support only | **No** commercial primary clusters |

---

## Active clusters (KEEP) — one primary each

### C01 Brand → `/`

| | |
|--|--|
| **Primary keyword** | Riva Bistro |
| **Secondaries** | Riva Bistro Stockholm, Riva Bistro Kungsholmen, Riva Bistro Hornsbergs Strand |
| **Intent** | Navigational / brand |
| **Status** | KEEP · HIGH |
| **Support URLs** | `/meny`, `/boka`, `/kontakt` for brand+intent variants (“Riva Bistro meny” → support `/meny`, etc.) |
| **Content gap** | Clear brand + Kungsholmen identity in first viewport; dining proposition; links to `/meny`, `/boka`, `/kontakt` |

### C02 Local Kungsholmen discovery → `/`

| | |
|--|--|
| **Primary keyword** | restaurang Kungsholmen |
| **Secondaries** | bistro Kungsholmen, mysig restaurang Kungsholmen |
| **Intent** | Local commercial discovery |
| **Status** | KEEP · HIGH |
| **Support URLs** | `/kontakt` (NAP proof), `/boka` (convert) |
| **Content gap** | Explicit Kungsholmen location statement; what kind of restaurant; food/experience context; CTA to `/boka`; link to `/kontakt` |

### C03 Dinner experience → `/`

| | |
|--|--|
| **Primary keyword** | middag Kungsholmen |
| **Secondaries** | kvällsrestaurang Kungsholmen, middag Riva Bistro |
| **Intent** | Evening dining discovery |
| **Status** | KEEP · HIGH |
| **Support URLs** | `/boka` (conversion only — not co-primary) |
| **Content gap** | Evening dining framing (not only generic hero); path to book; avoid duplicating `/kontakt` location copy |

### C04 Menu → `/meny`

| | |
|--|--|
| **Primary keyword** | Riva Bistro meny |
| **Secondaries** | meny Kungsholmen, restaurang meny Kungsholmen, middagsmeny Kungsholmen |
| **Intent** | Informational food / menu |
| **Status** | KEEP · HIGH |
| **Support URLs** | `/boka` |
| **Content gap** | Stable published categories; clear lunch section **only if** lunch goes live; signatures that match CMS; link to `/boka` |

### C05 Live dishes → `/meny`

| | |
|--|--|
| **Primary keyword** | *(per-dish; see CSV)* |
| **KEEP dishes (live CMS)** | Entrecôte Kungsholmen; Halstrad röding / röding Kungsholmen; Grillad lammracks / lammracks Kungsholmen; Rivas köttbullar / köttbullar Kungsholmen |
| **Intent** | Dish-led commercial |
| **Status** | KEEP · MEDIUM |
| **Support URLs** | `/boka` |
| **Content gap** | Dish visible on `/meny`; optional short dish context; no dish landing pages |

### C06 Booking → `/boka`

| | |
|--|--|
| **Primary keyword** | boka bord Kungsholmen |
| **Secondaries** | boka bord Riva Bistro, boka restaurang Kungsholmen, boka middag Kungsholmen |
| **Intent** | Transactional reservation |
| **Status** | KEEP · HIGH |
| **Support URLs** | none as SEO co-owners (`/` / `/kontakt` must **not** primary booking terms) |
| **Content gap** | Clear booking value prop; trust (confirm/cancel); NAP/hours link to `/kontakt` without stealing booking queries |

### C07 Location / NAP → `/kontakt`

| | |
|--|--|
| **Primary keyword** | Riva Bistro adress |
| **Secondaries** | restaurang Hornsbergs Strand, restaurang Hornsberg, Riva Bistro öppettider, hitta Riva Bistro |
| **Intent** | Local logistics / NAP |
| **Status** | KEEP · HIGH |
| **Support URLs** | `/boka` (after finding location) |
| **Content gap** | Unambiguous Hornsbergs Strand 57 + map + hours; transit/parking if known; **do not** primary-target generic “middag” here |

### C08 Private events → `/privata-event`

| | |
|--|--|
| **Primary keyword** | privata event Kungsholmen |
| **Secondaries** | företagsmiddag Kungsholmen, gruppmiddag Kungsholmen, restaurang event Kungsholmen, födelsedagsmiddag Kungsholmen |
| **Intent** | Groups / corporate / celebrations |
| **Status** | KEEP · HIGH |
| **Support URLs** | `/` teaser only |
| **Content gap** | Formats, capacity/range if true, how inquiry works; food/event fit without inventing packages |

### C09 Brand story → `/om-oss`

| | |
|--|--|
| **Primary keyword** | Riva Bistro berättelse / om Riva Bistro |
| **Secondaries** | Riva Bistro filosofi, skandinavisk restaurang Kungsholmen *(philosophy only)* |
| **Intent** | Brand / about |
| **Status** | KEEP · MEDIUM |
| **Not owned here** | Generic “svensk mat Stockholm/Kungsholmen” food queries → `/meny` (C04) or MONITOR |
| **Content gap** | One clear philosophy sentence aligned with live positioning; CTA to `/meny` and `/boka` |

### C10 Gallery → `/galleri`

| | |
|--|--|
| **Primary keyword** | — |
| **Status** | KEEP as **support page only** · LOW |
| **Rule** | No important commercial cluster primaries |

---

## Non-active statuses (do not target in metadata)

| Status | Meaning |
|--------|---------|
| **RESEARCH** | Possible later; needs proof (content, CMS, or GSC demand) |
| **REMOVE** | Do not target; conflicts or unsupported |
| **GBP_ONLY** | Maps / Business Profile / citations — not organic page targets |
| **MONITOR** | Track in Search Console; no active optimization |

### Romantic / dejt → REMOVE (active targeting)

romantisk restaurang, romantisk middag, dejtrestaurang, middag för två, restaurang för par, …  
**Reason:** No on-page evidence.

### Nearby areas → GBP_ONLY / RESEARCH

Kristineberg, Stadshagen, Fridhemsplan, Lindhagen, Thorildsplan, …  
**Reason:** No dedicated content; no doorway pages.

### Broad Stockholm heads → MONITOR

restaurang Stockholm, bästa restaurang(er) Stockholm, …  
**Reason:** Too competitive / weak ownership; OK as brand co-occurrence only.

### Unsupported category claims → REMOVE or RESEARCH

| Term class | Status | Reason |
|------------|--------|--------|
| fiskrestaurang / skaldjursrestaurang | REMOVE | Not a fish restaurant positioning |
| köttrestaurang / grillrestaurang | REMOVE | Over-claim vs full menu |
| uteservering / restaurang med utsikt | RESEARCH / CONTENT GAP (CSV `C12b`) | Outdoor/view not proven on site |
| restaurang vid vattnet / middag vid vattnet | RESEARCH / CONTENT GAP (CSV `C12a`) | Prefer enriching `/kontakt` (and light `/` support) before KEEP |
| husmanskost | REMOVE | Not supported by live menu positioning |
| italiensk restaurang | REMOVE | Conflicts with stated Scandinavian positioning (pasta items ≠ Italian restaurant) |

### Lunch → RESEARCH (conditional)

| Check | Live result |
|-------|-------------|
| Lunch category in CMS | No |
| Lunch products published | No |
| Customer-facing lunch product | **Not confirmed** |
| Hours could allow daytime dining | Opens ~10:30 most days — not sufficient alone |

**If lunch is later confirmed in CMS:** primary owner = `/meny`; `/boka` = conversion support only; then promote lunch rows from RESEARCH → KEEP.

### Cuisine food queries (svensk/skandinavisk mat)

| Query type | Owner | Status |
|------------|-------|--------|
| Brand philosophy / “om oss” Scandinavian framing | `/om-oss` | KEEP (C09) |
| “svensk mat Kungsholmen” as **food** intent | `/meny` | MONITOR until copy/menu clearly support |
| husmanskost | — | REMOVE |

---

## Intent cheat sheet

| User wants | Primary URL |
|------------|-------------|
| Brand / Riva | `/` |
| Restaurang Kungsholmen / middag discovery | `/` |
| Menu / dishes | `/meny` |
| Book a table | `/boka` |
| Address / hours / Hornsbergs / hitta hit | `/kontakt` |
| Company dinner / private party | `/privata-event` |
| Story / philosophy | `/om-oss` |
| Photos | `/galleri` (support) |

---

## Measurement (external)

1. Search Console for the production domain  
2. Filter queries by cluster ID in CSV  
3. Promote RESEARCH → KEEP only with impressions **and** honest content/CMS proof  
4. Never fix citation drift by adding alternate street names on-site  

---

## Explicit non-goals

- No new SEO landers in this strategy phase  
- No metadata changes in this documentation task  
- No keyword stuffing briefs  
- No alternate or non-authoritative street names in any SEO doc  
