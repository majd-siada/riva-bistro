# Bug triage — Riva Bistro MVP

Small-restaurant process. Prefer clarity over ceremony. Track in **GitHub Issues** on this repo (or the owner’s agreed channel) with the labels below.

## Severity

| Level | Meaning | Examples |
|-------|---------|----------|
| **S1 — Critical** | Site/API down or data loss risk; bookings unsafe | API 5xx sustained, DB unreachable, wrong charges N/A (no payments), mass PII leak |
| **S2 — High** | Core guest flow broken | Cannot submit reservation when enabled, admin cannot see bookings, menu empty in prod |
| **S3 — Medium** | Degraded but workaround exists | Notifications flaky, one page layout bug, slow admin list |
| **S4 — Low** | Cosmetic / minor | Typos, spacing, non-blocking copy |

## Priority (response order)

Severity first, then: **production > staging/local**, **security > functional**, **booking/notify > content polish**.

| Priority | Use when |
|----------|----------|
| **P0** | S1 production |
| **P1** | S2 production or any confirmed security issue |
| **P2** | S3 or non-prod S2 |
| **P3** | S4 / nice-to-have |

## Reproducibility (required in reports)

Every issue should include:

1. **Environment** — production URL vs local
2. **Steps** — numbered, minimal
3. **Expected vs actual**
4. **When** — date/time (Europe/Stockholm) and whether intermittent
5. **Evidence** — screenshot, response status/body snippet (no secrets), reservation `ref` if relevant
6. **Browser/device** if UI-related

If not reproducible after a reasonable attempt, label `needs-info` and ask for the missing piece.

## Security issues

- Do **not** post secrets, tokens, or full `.env` contents in public issues.
- Prefer a private channel to Majd/maintainer first for credential leaks or auth bypass.
- Label `security`. Treat as **P0/P1**. Rotate credentials after confirmed exposure.
- Do not “test” exploits against production beyond verifying the report safely.

## Production incident vs bug

| | **Incident** | **Bug** |
|--|--------------|---------|
| Symptom | Live outage / data risk **now** | Defect that can be scheduled |
| Process | Runbook SEV + stabilize first ([production-runbook.md](../deployment/production-runbook.md), [troubleshooting.md](./troubleshooting.md)) | Triage → fix → verify → close |
| Comms | Owner notified quickly | GitHub issue is enough |

An incident may spawn a bug for root-cause follow-up after mitigation.

## Labels (suggested)

`S1` `S2` `S3` `S4` · `P0`–`P3` · `bug` · `security` · `incident` · `needs-info` · `frontend` · `api` · `admin` · `notifications` · `docs`

## Basic response expectations (MVP)

| Class | First response | Mitigation / fix target |
|-------|----------------|-------------------------|
| P0 / S1 prod | Same day (owner/maintainer available) | Stabilize ASAP; postmortem note optional |
| P1 | Within 1–2 business days | Fix or workaround in next deploy window |
| P2 | Within a week | Next planned maintenance |
| P3 | Backlog | When convenient |

These are **expectations for a small team**, not contractual SLAs.

## Workflow

```
Report → Triage (severity + priority + labels + repro check)
      → Assign owner
      → Fix on branch / PR
      → Verify (tests + targeted manual smoke on affected surface)
      → Deploy if production (manual Hostinger + VPS per runbook)
      → Confirm in prod → Close with link to SHA / evidence
```

**Close criteria:** root cause understood enough to prevent silent reopen; verification recorded in the issue; no open `needs-info`.

## Out of scope for triage theater

- Formal CAB, multi-level approval chains, or mandatory severity boards
- Inventing uptime percentages or alert-delivery claims
