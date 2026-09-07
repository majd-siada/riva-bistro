# Public DNS verification — rivabistro.se

**Purpose:** Record observed public DNS for production hostnames.  
**Method:** Public recursive resolution via `dig` (no Hostinger console required).  
**DNS was not modified.**

**Checked at (UTC):** `2026-09-07T01:04:42Z`  
**Resolver:** system default (`dig`)

## Results

### Apex — `rivabistro.se`

| Type | Observed |
|------|----------|
| **A** | `147.79.120.240`, `92.112.198.237` (TTL ~60s; CDN/Hostinger multi-A) |
| **AAAA** | `2a02:4780:4f:b352:af1a:3ede:6523:ac76`, `2a02:4780:50:2086:a5fb:8f26:d0ed:625a` |
| **MX** | `5 mx1.hostinger.com.`, `10 mx2.hostinger.com.` |
| **NS** | `nova.dns-parking.com.`, `cosmos.dns-parking.com.` |
| **TXT** | `v=spf1 include:_spf.mail.hostinger.com ~all` |
| **SOA** | `nova.dns-parking.com.` / serial `2026090502` |

Earlier the same day, apex A also resolved to `77.37.76.150` / `147.79.120.18` (and matching AAAA variants). Short TTLs and Hostinger CDN rotation explain the change; both observations show the apex is publicly resolvable.

### WWW — `www.rivabistro.se`

| Type | Observed |
|------|----------|
| **CNAME** | `www.rivabistro.se.cdn.hstgr.net.` |
| **A** (via CNAME) | `148.135.128.132`, `92.112.198.121` |

### API — `api.rivabistro.se`

| Type | Observed |
|------|----------|
| **A** | `72.61.137.176` |
| **AAAA** | *(none returned in this dig)* |

## Reproducible commands

```bash
dig +nocmd rivabistro.se A +noall +answer
dig +nocmd rivabistro.se AAAA +noall +answer
dig +nocmd www.rivabistro.se CNAME +noall +answer
dig +nocmd www.rivabistro.se A +noall +answer
dig +nocmd api.rivabistro.se A +noall +answer
dig +nocmd api.rivabistro.se AAAA +noall +answer
dig +nocmd rivabistro.se MX +noall +answer
dig +nocmd rivabistro.se NS +noall +answer
dig +nocmd rivabistro.se TXT +noall +answer
```

## Interpretation

- Public DNS for the marketing site (`rivabistro.se` / `www`) and API (`api.rivabistro.se`) resolves successfully.
- Mail MX points at Hostinger; SPF TXT is present.
- This verifies **publication of records**, not TLS cert ownership, Hostinger panel settings, or VPS firewall rules.
- Changing DNS still requires Hostinger (or registrar) console access.

## Out of scope

- Inventing or editing DNS records
- Claiming CDN/panel configuration from dig alone
- Certificate issuance / HTTPS handshake (see production-check / runbook health)
